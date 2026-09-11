import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { PEDIDOS, type Pedido, type StatusPedido } from "../components/pedidos/pedidosMockData";

interface DBVenda {
  id: string;
  empresa_id: string | null;
  cliente_id: string | null;
  valor_total: number;
  valor_desconto: number;
  observacoes: string | null;
  status_venda: string;
  forma_pagamento: number | null;
  canal_venda: string | null;
  tipo_venda: string | null;
  npedido: number | null;
  criado_em: string;
}

interface DBCliente {
  id: string;
  nome_cliente: string;
  telefone: string | null;
  email: string | null;
  documento: string | null;
}

function mapStatusVenda(status: string): StatusPedido {
  const map: Record<string, StatusPedido> = {
    pendente: "aguardando",
    confirmada: "pago",
    pago: "pago",
    separacao: "separacao",
    enviado: "enviado",
    entregue: "entregue",
    cancelado: "cancelado",
  };
  return map[status] || "aguardando";
}

function mapFormaPagamento(codigo: number | null): string {
  const map: Record<number, string> = {
    1: "dinheiro",
    2: "pix",
    3: "cartao_credito",
    4: "cartao_debito",
    5: "boleto",
  };
  return map[codigo || 3] || "cartao_credito";
}

function mapCanalVenda(canal: string | null): "pdv" | "loja" | "whatsapp" | "outros" {
  if (canal === "whatsapp") return "whatsapp";
  if (canal === "loja" || canal === "online") return "loja";
  if (canal === "pdv" || canal === "interna") return "pdv";
  return "outros";
}

function gerarNumeroPedido(id: string): string {
  const hash = id.slice(0, 4).toUpperCase();
  return `PD-${new Date().getFullYear()}-${hash}`;
}

function formatTelefone(telefone: string | null | undefined): string {
  if (!telefone) return "";
  const nums = telefone.replace(/\D/g, "");
  if (nums.length === 11) {
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  }
  if (nums.length === 10) {
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  }
  return telefone;
}

function mapVendaToPedido(
  db: DBVenda,
  cliente?: DBCliente | null,
  statusPagamento: Pedido["statusPagamento"] = "pendente"
): Pedido {
  return {
    id: db.id,
    numero: gerarNumeroPedido(db.id),
    dataHora: db.criado_em,
    cliente: {
      nome: cliente?.nome_cliente || "Cliente sem nome",
      telefone: formatTelefone(cliente?.telefone),
      email: cliente?.email || "",
      documento: cliente?.documento || "",
      tipo: "pf",
    },
    canal: mapCanalVenda(db.canal_venda),
    itens: [],
    subtotal: Number(db.valor_total),
    frete: 0,
    desconto: Number(db.valor_desconto) || 0,
    total: Number(db.valor_total),
    formaPagamento: mapFormaPagamento(db.forma_pagamento) as Pedido["formaPagamento"],
    statusPagamento,
    status: mapStatusVenda(db.status_venda),
    timeline: [
      {
        status: mapStatusVenda(db.status_venda),
        dataHora: db.criado_em,
        responsavel: "Sistema",
        observacao: db.observacoes || undefined,
      },
    ],
    notasInternas: db.observacoes || undefined,
  };
}

export interface UsePedidosReturn {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}

export function usePedidos(): UsePedidosReturn {
  const { empresa } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsFallback(false);

    try {
      // Busca empresa_id do contexto ou primeira disponível
      let empresaId = empresa?.id;

      if (!empresaId) {
        const { data: empresas } = await supabase
          .from("me_empresa")
          .select("id")
          .limit(1);

        if (empresas && empresas.length > 0) {
          empresaId = empresas[0].id;
        }
      }

      let query = supabase
        .from("me_venda")
        .select("*")
        .order("criado_em", { ascending: false });

      // Filtra por empresa se disponível
      if (empresaId) {
        query = query.eq("empresa_id", empresaId);
      }

      const { data: dbVendas, error: vendasError } = await query;

      if (vendasError) throw vendasError;

      const vendasValidas = (dbVendas as DBVenda[] | null) || [];

      if (vendasValidas.length === 0) {
        setPedidos(PEDIDOS);
        setIsFallback(true);
        setLoading(false);
        return;
      }

      // Busca todos os clientes de uma vez (mais eficiente)
      const clienteIds = vendasValidas
        .map((v) => v.cliente_id)
        .filter((id): id is string => id !== null);

      let clientesMap: Map<string, DBCliente> = new Map();

      if (clienteIds.length > 0) {
        let clientesQuery = supabase
          .from("me_cliente")
          .select("id, nome_cliente, telefone, email, documento")
          .in("id", clienteIds);

        // Filtra clientes por empresa também
        if (empresaId) {
          clientesQuery = clientesQuery.eq("empresa_id", empresaId);
        }

        const { data: clientesData } = await clientesQuery;

        if (clientesData) {
          clientesMap = new Map(
            (clientesData as DBCliente[]).map((c) => [c.id, c])
          );
        }
      }

      // Busca status de pagamento nas contas a receber vinculadas (venda_id)
      const vendaIds = vendasValidas.map((v) => v.id);
      let statusPagamentoMap: Map<string, "confirmado" | "pendente"> = new Map();

      if (vendaIds.length > 0) {
        const { data: contasData } = await supabase
          .from("me_contas_receber")
          .select("venda_id, status")
          .in("venda_id", vendaIds);

        if (contasData) {
          for (const conta of contasData as { venda_id: string | null; status: string }[]) {
            if (conta.venda_id && conta.status === "pago") {
              statusPagamentoMap.set(conta.venda_id, "confirmado");
            }
          }
        }
      }

      // Mapeia vendas com dados dos clientes
      const pedidosMapeados = vendasValidas.map((venda) => {
        const cliente = venda.cliente_id ? clientesMap.get(venda.cliente_id) : null;
        return mapVendaToPedido(venda, cliente, statusPagamentoMap.get(venda.id) ?? "pendente");
      });

      setPedidos(pedidosMapeados);
    } catch (err) {
      console.error("[usePedidos] Erro ao buscar dados reais:", err);
      setPedidos(PEDIDOS);
      setError(err instanceof Error ? err.message : "Erro ao carregar pedidos");
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, [empresa]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    pedidos,
    loading,
    error,
    isFallback,
    recarregar: carregarDados,
  };
}
