import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { ContaPagar, StatusMovimentacao } from "../components/financeiro/mockData";
import {
  contasPagarMock,
  calcularStatus,
  mapearFormaPagamento,
} from "../components/financeiro/mockData";

interface DBContaPagar {
  id: string;
  empresa_id: string;
  fornecedor_id: string | null;
  descricao: string;
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

interface DBFornecedor {
  id: string;
  nome_fornecedor: string | null;
}

interface DBCategoriaFinanceira {
  id: string;
  nome: string;
}

function mapStatus(status: string | null): StatusMovimentacao {
  if (status === "pago") return "pago";
  if (status === "cancelado") return "cancelado";
  return "pendente";
}

function mapContaPagar(
  db: DBContaPagar,
  contexto: { fornecedorNome?: string; categoriaNome?: string }
): ContaPagar {
  const status = calcularStatus(db.data_vencimento, mapStatus(db.status));

  return {
    id: db.id,
    descricao: db.descricao || "Conta a pagar",
    fornecedor: contexto.fornecedorNome || "",
    fornecedorId: db.fornecedor_id || undefined,
    categoria: contexto.categoriaNome || "Outras Despesas",
    categoriaId: db.categoria_id || undefined,
    valor: Number(db.valor),
    dataVencimento: db.data_vencimento,
    status,
    formaPagamento: mapearFormaPagamento(db.forma_pagamento),
    observacoes: db.observacoes || undefined,
  };
}

export interface UseContasPagarReturn {
  contas: ContaPagar[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}

export function useContasPagar(): UseContasPagarReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [contas, setContas] = useState<ContaPagar[]>([]);
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
      setContas(contasPagarMock);
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
        .from("me_contas_pagar")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("data_vencimento", { ascending: false });

      if (contasError) throw contasError;

      const contasValidas = (dbContas as DBContaPagar[] | null) || [];

      // 0 linhas = empresa nova = empty state real (nunca mock de outra empresa)
      if (contasValidas.length === 0) {
        setContas([]);
        setIsFallback(false);
        setLoading(false);
        return;
      }

      // Busca nomes dos fornecedores (sub-query filtrada por empresa)
      // ⚠️ schema real: me_fornecedor.nome_fornecedor (NÃO nome_fantasia)
      const fornecedorIds = contasValidas
        .map((c) => c.fornecedor_id)
        .filter((id): id is string => id !== null);

      let fornecedoresMap: Map<string, string> = new Map();
      if (fornecedorIds.length > 0) {
        const { data: fornecedoresData } = await supabase
          .from("me_fornecedor")
          .select("id, nome_fornecedor")
          .in("id", fornecedorIds)
          .eq("empresa_id", empresaId);

        if (fornecedoresData) {
          fornecedoresMap = new Map(
            (fornecedoresData as DBFornecedor[]).map((f) => [
              f.id,
              f.nome_fornecedor || "Fornecedor",
            ])
          );
        }
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

      const contasMapeadas: ContaPagar[] = contasValidas.map((conta) =>
        mapContaPagar(conta, {
          fornecedorNome: conta.fornecedor_id
            ? fornecedoresMap.get(conta.fornecedor_id)
            : undefined,
          categoriaNome: conta.categoria_id
            ? categoriasMap.get(conta.categoria_id)
            : undefined,
        })
      );

      setContas(contasMapeadas);
    } catch (err) {
      console.error("[useContasPagar] Erro ao buscar dados:", err);
      if (!session) {
        setContas(contasPagarMock);
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