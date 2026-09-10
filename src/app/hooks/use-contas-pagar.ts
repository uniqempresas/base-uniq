import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { ContaPagar, StatusMovimentacao } from "../components/financeiro/mockData";
import { contasPagarMock, calcularStatus } from "../components/financeiro/mockData";

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
  nome_fantasia: string | null;
}

function mapStatus(status: string | null): StatusMovimentacao {
  if (status === "pago") return "pago";
  return "pendente";
}

function mapContaPagar(db: DBContaPagar, fornecedorNome?: string): ContaPagar {
  const status = calcularStatus(db.data_vencimento, mapStatus(db.status));

  return {
    id: db.id,
    descricao: db.descricao,
    fornecedor: fornecedorNome || "Fornecedor",
    categoria: "Outras Despesas",
    valor: Number(db.valor),
    dataVencimento: db.data_vencimento,
    status,
    recorrente: false,
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
  const { empresa } = useAuth();
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsFallback(false);

    try {
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
        .from("me_contas_pagar")
        .select("*")
        .order("data_vencimento", { ascending: false });

      if (empresaId) {
        query = query.eq("empresa_id", empresaId);
      }

      const { data: dbContas, error: contasError } = await query;

      if (contasError) throw contasError;

      const contasValidas = (dbContas as DBContaPagar[] | null) || [];

      if (contasValidas.length === 0) {
        setContas(contasPagarMock);
        setIsFallback(true);
        setLoading(false);
        return;
      }

      const fornecedorIds = contasValidas
        .map((c) => c.fornecedor_id)
        .filter((id): id is string => id !== null);

      let fornecedoresMap: Map<string, string> = new Map();

      if (fornecedorIds.length > 0) {
        const { data: fornecedoresData } = await supabase
          .from("me_fornecedor")
          .select("id, nome_fantasia")
          .in("id", fornecedorIds);

        if (fornecedoresData) {
          fornecedoresMap = new Map(
            (fornecedoresData as DBFornecedor[]).map((f) => [
              f.id,
              f.nome_fantasia || "Fornecedor",
            ])
          );
        }
      }

      const contasMapeadas = contasValidas.map((conta) =>
        mapContaPagar(conta, conta.fornecedor_id ? fornecedoresMap.get(conta.fornecedor_id) : undefined)
      );

      setContas(contasMapeadas);
    } catch (err) {
      console.error("[useContasPagar] Erro ao buscar dados:", err);
      setContas(contasPagarMock);
      setError(err instanceof Error ? err.message : "Erro ao carregar contas");
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, [empresa]);

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
