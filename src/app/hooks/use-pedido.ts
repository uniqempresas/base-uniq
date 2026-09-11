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
      nome: cliente?.nome_cliente || "Cliente",
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

export interface UsePedidoReturn {
  pedido: Pedido | undefined;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

export function usePedido(id: string | undefined): UsePedidoReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [pedido, setPedido] = useState<Pedido | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarPedido = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem login): usa mock — regra mock-first de 07/09/2026
    if (!session) {
      const mockPedido = PEDIDOS.find((p) => p.id === id);
      setPedido(mockPedido || PEDIDOS[0]);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    // Logado mas empresa não resolvida: NÃO consultar outro tenant
    const empresaId = empresa?.id;
    if (!empresaId) {
      setPedido(undefined);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      // Tenta buscar do banco (filtro de empresa obrigatório e incondicional)
      const { data: dbVenda, error: vendaError } = await supabase
        .from("me_venda")
        .select("*")
        .eq("id", id)
        .eq("empresa_id", empresaId)
        .maybeSingle();

      if (vendaError) throw vendaError;

      if (dbVenda) {
        // Busca dados do cliente se houver cliente_id
        let cliente: DBCliente | null = null;
        if (dbVenda.cliente_id) {
          const { data: clienteData } = await supabase
            .from("me_cliente")
            .select("id, nome_cliente, telefone, email, documento")
            .eq("id", dbVenda.cliente_id)
            .eq("empresa_id", empresaId)
            .maybeSingle();

          cliente = clienteData;
        }

        // Busca status de pagamento na conta a receber vinculada (venda_id)
        let statusPagamento: Pedido["statusPagamento"] = "pendente";
        const { data: contas } = await supabase
          .from("me_contas_receber")
          .select("status")
          .eq("venda_id", dbVenda.id)
          .eq("empresa_id", empresaId)
          .limit(1);

        if (contas && contas.length > 0 && contas[0].status === "pago") {
          statusPagamento = "confirmado";
        }

        setPedido(mapVendaToPedido(dbVenda as DBVenda, cliente, statusPagamento));
        setError(null);
        setLoading(false);
        return;
      }

      // Com sessão ativa, pedido inexistente = empty state real (nunca mock)
      setPedido(undefined);
      setError(null);
    } catch (err) {
      console.error("[usePedido] Erro ao buscar pedido:", err);
      if (!session) {
        const mockPedido = PEDIDOS.find((p) => p.id === id);
        setPedido(mockPedido || PEDIDOS[0]);
        setIsFallback(true);
      } else {
        setPedido(undefined);
        setError(err instanceof Error ? err.message : "Erro ao carregar pedido");
        setIsFallback(false);
      }
    } finally {
      setLoading(false);
    }
  }, [id, empresa, session, authLoading]);

  useEffect(() => {
    carregarPedido();
  }, [carregarPedido]);

  return {
    pedido,
    loading,
    error,
    isFallback,
  };
}