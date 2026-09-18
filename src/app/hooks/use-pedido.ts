import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  PEDIDOS,
  type ItemPedido,
  type Pedido,
  type TimelineEntry,
  type StatusPedido,
  type CanalVenda,
} from "../components/pedidos/pedidosMockData";

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
  codigo_rastreio: string | null;
  motivo_cancelamento: string | null;
  frete: number | null;
  criado_em: string;
}

interface DBCliente {
  id: string;
  nome_cliente: string;
  telefone: string | null;
  email: string | null;
  documento: string | null;
  cpf_cnpj: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
}

interface DBHistorico {
  status: string;
  observacao: string | null;
  codigo_rastreio: string | null;
  responsavel_usuario_id: string | null;
  criado_em: string;
}

interface DBItemVenda {
  id: string;
  produto_id: number | null;
  tipo_item: string | null;
  quantidade: number;
  preco_unitario: number;
  nome_produto: string;
}

function mapStatusVenda(status: string): StatusPedido {
  const map: Record<string, StatusPedido> = {
    pendente: "aguardando",
    confirmada: "recebido",
    confirmado: "confirmado",
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
    2: "cartao_credito",
    3: "pix",
    4: "cartao_debito",
    5: "boleto",
  };
  if (codigo === null || codigo === undefined) return "nao_informado";
  return map[codigo] ?? "nao_informado";
}

function mapCanalVenda(canal: string | null): CanalVenda {
  if (canal === "whatsapp") return "whatsapp";
  if (canal === "loja" || canal === "online") return "loja";
  if (canal === "pdv") return "pdv";
  // Decisão do fundador (5d): manual e interno são o mesmo canal
  if (canal === "manual" || canal === "interna") return "manual";
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

function mapItensVenda(
  itens: DBItemVenda[],
  fotosPorProduto: Map<number, string>
): ItemPedido[] {
  return itens.map((item) => ({
    id: item.id,
    nome: item.nome_produto,
    quantidade: item.quantidade,
    precoUnitario: Number(item.preco_unitario),
    produtoId: item.produto_id ?? undefined,
    tipoItem: item.tipo_item === "servico" ? "servico" : "produto",
    foto: item.produto_id !== null && item.produto_id !== undefined
      ? (fotosPorProduto.get(item.produto_id) ?? "")
      : "",
  }));
}

function mapHistoricoToTimeline(h: DBHistorico[]): TimelineEntry[] {
  return h.map((entry) => ({
    status: mapStatusVenda(entry.status),
    dataHora: entry.criado_em,
    responsavel: "Sistema",
    observacao: entry.observacao || undefined,
    codigoRastreio: entry.codigo_rastreio || undefined,
  }));
}

function mapVendaToPedido(
  db: DBVenda,
  cliente?: DBCliente | null,
  statusPagamento: Pedido["statusPagamento"] = "pendente",
  itens: ItemPedido[] = [],
  historico?: DBHistorico[] | null
): Pedido {
  // npedido: real quando existir, senão fallback sintético
  const numeroPedido = db.npedido ? `#${db.npedido}` : gerarNumeroPedido(db.id);

  // tipo PF/PJ derivado de cpf_cnpj (14 dígitos → PJ)
  const cpfCnpj = cliente?.cpf_cnpj || cliente?.documento || "";
  const cpfCnpjNum = cpfCnpj.replace(/\D/g, "");
  const clienteTipo: "pf" | "pj" = cpfCnpjNum.length === 14 ? "pj" : "pf";

  // endereço: montar só se endereco e cidade presentes
  const endereco =
    cliente?.endereco && cliente?.cidade
      ? {
          rua: cliente.endereco,
          numero: cliente.numero || "",
          complemento: cliente.complemento || undefined,
          bairro: cliente.bairro || "",
          cidade: cliente.cidade,
          estado: cliente.estado || "",
          cep: cliente.cep || "",
        }
      : undefined;

  // timeline: do histórico quando disponível, senão fallback 1 entry
  let timeline: TimelineEntry[];
  if (historico && historico.length > 0) {
    timeline = mapHistoricoToTimeline(historico);
  } else {
    timeline = [
      {
        status: mapStatusVenda(db.status_venda),
        dataHora: db.criado_em,
        responsavel: "Sistema",
        observacao: db.observacoes || undefined,
      },
    ];
  }

  return {
    id: db.id,
    numero: numeroPedido,
    dataHora: db.criado_em,
    cliente: {
      nome: cliente?.nome_cliente || "Cliente",
      telefone: formatTelefone(cliente?.telefone),
      email: cliente?.email || "",
      documento: cliente?.documento || "",
      tipo: clienteTipo,
    },
    canal: mapCanalVenda(db.canal_venda),
    itens,
    subtotal: Number(db.valor_total),
    frete: Number(db.frete) || 0,
    desconto: Number(db.valor_desconto) || 0,
    total: Number(db.valor_total),
    formaPagamento: mapFormaPagamento(db.forma_pagamento) as Pedido["formaPagamento"],
    statusPagamento,
    status: mapStatusVenda(db.status_venda),
    timeline,
    codigoRastreio: db.codigo_rastreio || undefined,
    motivoCancelamento: db.motivo_cancelamento || undefined,
    notasInternas: db.observacoes || undefined,
    endereco,
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
        .select("id, cliente_id, valor_total, valor_desconto, observacoes, status_venda, forma_pagamento, canal_venda, tipo_venda, npedido, codigo_rastreio, motivo_cancelamento, frete, criado_em")
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
            .select("id, nome_cliente, telefone, email, documento, cpf_cnpj, endereco, numero, complemento, bairro, cidade, estado, cep")
            .eq("id", dbVenda.cliente_id)
            .eq("empresa_id", empresaId)
            .maybeSingle();

          cliente = clienteData as DBCliente | null;
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
        } else if (dbVenda.status_venda === "pago") {
          // Legado (5e): antes de me_contas_receber, `status_venda='pago'` era o
          // sinal de pagamento — mantém o detalhe coerente com a lista.
          statusPagamento = "confirmado";
        }

        // Busca itens da venda (me_itens_venda) + fotos dos produtos para o detalhe
        const { data: itensData } = await supabase
          .from("me_itens_venda")
          .select("id, produto_id, tipo_item, quantidade, preco_unitario, nome_produto")
          .eq("venda_id", dbVenda.id)
          .eq("empresa_id", empresaId)
          .order("criado_em", { ascending: true });

        const itens = (itensData || []) as DBItemVenda[];

        const produtoIds = itens
          .map((i) => i.produto_id)
          .filter((pid): pid is number => pid !== null && pid !== undefined);

        const fotosPorProduto = new Map<number, string>();
        if (produtoIds.length > 0) {
          const { data: produtos } = await supabase
            .from("me_produto")
            .select("id, foto_url")
            .in("id", produtoIds);

          for (const p of produtos || []) {
            fotosPorProduto.set(p.id, p.foto_url ?? "");
          }
        }

        // Busca histórico de status do pedido
        const { data: historicoData } = await supabase
          .from("me_venda_historico")
          .select("status, observacao, codigo_rastreio, responsavel_usuario_id, criado_em")
          .eq("venda_id", dbVenda.id)
          .eq("empresa_id", empresaId)
          .order("criado_em", { ascending: true });

        setPedido(
          mapVendaToPedido(
            dbVenda as DBVenda,
            cliente,
            statusPagamento,
            mapItensVenda(itens, fotosPorProduto),
            historicoData as DBHistorico[] | null
          )
        );
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