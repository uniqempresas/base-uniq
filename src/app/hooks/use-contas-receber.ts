import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { ContaReceber, StatusMovimentacao } from "../components/financeiro/mockData";
import {
  contasReceberMock,
  calcularStatus,
  mapearFormaPagamento,
} from "../components/financeiro/mockData";

interface DBContaReceber {
  id: string;
  empresa_id: string;
  cliente_id: string | null;
  venda_id: string | null;
  descricao: string | null;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  valor_pago: number | null;
  status: string | null;
  forma_pagamento: string | null;
  conta_id: string | null;
  categoria_id: string | null;
  observacoes: string | null;
  created_at: string | null;
}

interface DBCliente {
  id: string;
  nome_cliente: string;
  telefone: string | null;
}

interface DBVenda {
  id: string;
  npedido: string | null;
  status_venda: string | null;
}

interface DBItemVenda {
  venda_id: string;
  nome_produto: string;
  quantidade: number;
}

interface DBCategoriaFinanceira {
  id: string;
  nome: string;
}

function mapStatus(status: string | null): StatusMovimentacao {
  if (status === "pago" || status === "recebido") return "pago";
  if (status === "cancelado") return "cancelado";
  return "pendente";
}

// ============================================================
// Parsing de descricao — fim do UUID cru
// Padrões reais observados:
//   "Venda #848081af-e1b9-4c5d-9e40-991a0ac0fb7c - Henriq Silva"
//   "Venda - Luan"
//   "Pagamento confirmado do pedido"
// ============================================================

const PADRAO_VENDA_UUID = /^Venda\s+#([0-9a-fA-F-]{8,})\s*[-–]\s*(.+)$/;
const PADRAO_VENDA_NOME = /^Venda\s*[-–]\s*(.+)$/;
const PADRAO_UUID_ISOLADO =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

interface DescricaoVenda {
  /** Rótulo amigável para exibição (sem uuid cru). */
  rotulo: string;
  /** Cliente extraído da descricao, quando no padrão "Venda ... - Nome". */
  clienteExtraido?: string;
  /** Venda uuid embutida na descricao (ex.: "Venda #<uuid> - Nome"). */
  vendaUuid?: string;
}

function parseDescricaoVenda(descricao: string | null): DescricaoVenda {
  if (!descricao) return { rotulo: "Conta a receber" };

  const comUuid = PADRAO_VENDA_UUID.exec(descricao);
  if (comUuid) {
    return {
      rotulo: "Venda",
      clienteExtraido: comUuid[2].trim(),
      vendaUuid: comUuid[1],
    };
  }

  const comNome = PADRAO_VENDA_NOME.exec(descricao);
  if (comNome) {
    return {
      rotulo: "Venda",
      clienteExtraido: comNome[1].trim(),
    };
  }

  // "Venda #<uuid>" sem sufixo de nome — limpa o uuid cru
  const soUuid = /^Venda\s+#([0-9a-fA-F-]{8,})/.exec(descricao);
  if (soUuid) {
    return { rotulo: "Venda", vendaUuid: soUuid[1] };
  }

  // uuid isolado — nunca exibir
  if (PADRAO_UUID_ISOLADO.test(descricao.trim())) {
    return { rotulo: "Conta a receber" };
  }

  // Descrição real não-padrão (ex.: "BARRA DE CHOCOLATE BRANCO",
  // "Pagamento confirmado do pedido") → manter como está
  return { rotulo: descricao };
}

function agruparItens(itens: DBItemVenda[], vendaId: string): string | undefined {
  const doVenda = itens.filter((i) => i.venda_id === vendaId);
  if (doVenda.length === 0) return undefined;
  return doVenda
    .map((i) => `${i.quantidade}x ${i.nome_produto}`)
    .join(", ");
}

function mapContaReceber(
  db: DBContaReceber,
  contexto: {
    clienteNome?: string;
    clienteTelefone?: string;
    venda?: DBVenda;
    categoriaNome?: string;
    itensResumo?: string;
  }
): ContaReceber {
  const status = calcularStatus(db.data_vencimento, mapStatus(db.status));
  const descricao = parseDescricaoVenda(db.descricao);

  const cliente =
    contexto.clienteNome ||
    descricao.clienteExtraido ||
    "Cliente não informado";

  // numeroPedido: npedido da venda, senão 8 primeiros chars do uuid da venda
  const vendaUuid = db.venda_id || descricao.vendaUuid;
  const numeroPedido =
    contexto.venda?.npedido || (vendaUuid ? vendaUuid.slice(0, 8) : undefined);

  return {
    id: db.id,
    cliente,
    clienteId: db.cliente_id || undefined,
    telefone: contexto.clienteTelefone,
    vendaId: db.venda_id || undefined,
    numeroPedido,
    descricao: descricao.rotulo,
    itensResumo: contexto.itensResumo,
    categoria: contexto.categoriaNome || "Vendas",
    categoriaId: db.categoria_id || undefined,
    valor: Number(db.valor),
    dataPrevista: db.data_vencimento,
    status,
    formaPagamento: mapearFormaPagamento(db.forma_pagamento),
    observacoes: db.observacoes || undefined,
    vendaCancelada: contexto.venda?.status_venda === "cancelado",
  };
}

export interface UseContasReceberReturn {
  contas: ContaReceber[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}

export function useContasReceber(): UseContasReceberReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem login): usa mock — regra mock-first de 07/09/2026
    if (!session) {
      setContas(contasReceberMock);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    // Logado mas empresa não resolvida: NÃO consultar outro tenant
    const empresaId = empresa?.id;
    if (!empresaId) {
      setContas([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      const { data: dbContas, error: contasError } = await supabase
        .from("me_contas_receber")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("data_vencimento", { ascending: false });

      if (contasError) throw contasError;

      const contasValidas = (dbContas as DBContaReceber[] | null) || [];

      // 0 linhas = empresa nova = empty state real (nunca mock de outra empresa)
      if (contasValidas.length === 0) {
        setContas([]);
        setIsFallback(false);
        setLoading(false);
        return;
      }

      // ---- Busca nomes + telefone dos clientes (sub-query filtrada por empresa) ----
      const clienteIds = contasValidas
        .map((c) => c.cliente_id)
        .filter((id): id is string => id !== null);

      let clientesMap: Map<string, DBCliente> = new Map();
      if (clienteIds.length > 0) {
        const { data: clientesData } = await supabase
          .from("me_cliente")
          .select("id, nome_cliente, telefone")
          .in("id", clienteIds)
          .eq("empresa_id", empresaId);

        if (clientesData) {
          clientesMap = new Map(
            (clientesData as DBCliente[]).map((c) => [c.id, c])
          );
        }
      }

      // ---- Join me_venda → npedido + status_venda (vendaCancelada) ----
      const vendaIds = contasValidas
        .map((c) => c.venda_id)
        .filter((id): id is string => id !== null);

      let vendasMap: Map<string, DBVenda> = new Map();
      if (vendaIds.length > 0) {
        const { data: vendasData } = await supabase
          .from("me_venda")
          .select("id, npedido, status_venda")
          .in("id", vendaIds)
          .eq("empresa_id", empresaId);

        if (vendasData) {
          vendasMap = new Map(
            (vendasData as DBVenda[]).map((v) => [v.id, v])
          );
        }
      }

      // ---- itensResumo (P1): me_itens_venda por venda ----
      let itensVenda: DBItemVenda[] = [];
      if (vendaIds.length > 0) {
        const { data: itensData } = await supabase
          .from("me_itens_venda")
          .select("venda_id, nome_produto, quantidade")
          .in("venda_id", vendaIds);

        if (itensData) itensVenda = itensData as DBItemVenda[];
      }

      // ---- categorias (P1): me_categoria_financeira está vazia hoje ----
      const categoriaIds = contasValidas
        .map((c) => c.categoria_id)
        .filter((id): id is string => id !== null);

      let categoriasMap: Map<string, string> = new Map();
      if (categoriaIds.length > 0) {
        const { data: categoriasData } = await supabase
          .from("me_categoria_financeira")
          .select("id, nome")
          .in("id", categoriaIds)
          .eq("empresa_id", empresaId);

        if (categoriasData) {
          categoriasMap = new Map(
            (categoriasData as DBCategoriaFinanceira[]).map((c) => [c.id, c.nome])
          );
        }
      }

      const contasMapeadas: ContaReceber[] = contasValidas.map((conta) => {
        const venda = conta.venda_id ? vendasMap.get(conta.venda_id) : undefined;
        const cliente = conta.cliente_id ? clientesMap.get(conta.cliente_id) : undefined;
        return mapContaReceber(conta, {
          clienteNome: cliente?.nome_cliente,
          clienteTelefone: cliente?.telefone || undefined,
          venda,
          categoriaNome: conta.categoria_id
            ? categoriasMap.get(conta.categoria_id)
            : undefined,
          itensResumo: conta.venda_id ? agruparItens(itensVenda, conta.venda_id) : undefined,
        });
      });

      setContas(contasMapeadas);
    } catch (err) {
      console.error("[useContasReceber] Erro ao buscar dados:", err);
      if (!session) {
        setContas(contasReceberMock);
        setIsFallback(true);
      } else {
        setContas([]);
        setError(err instanceof Error ? err.message : "Erro ao carregar contas");
        setIsFallback(false);
      }
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    contas,
    loading,
    error,
    isFallback,
    recarregar: carregarDados,
  };
}