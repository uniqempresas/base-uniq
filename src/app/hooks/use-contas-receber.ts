import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { ContaReceber, StatusMovimentacao } from "../components/financeiro/mockData";
import { contasReceberMock, calcularStatus } from "../components/financeiro/mockData";

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
}

function mapStatus(status: string | null): StatusMovimentacao {
  if (status === "pago" || status === "recebido") return "pago";
  if (status === "cancelado") return "pago"; // tratamento temporário
  return "pendente";
}

function mapFormaPagamento(fp: string | null): ContaReceber["formaPagamento"] {
  if (!fp) return undefined;
  const map: Record<string, ContaReceber["formaPagamento"]> = {
    dinheiro: "Dinheiro",
    pix: "PIX",
    boleto: "Boleto",
    transferencia: "Transferência",
    cartao_credito: "Cartão",
    cartao_debito: "Cartão",
    cartao: "Cartão",
  };
  return map[fp.toLowerCase()] || undefined;
}

function mapContaReceber(db: DBContaReceber, clienteNome?: string): ContaReceber {
  const status = calcularStatus(db.data_vencimento, mapStatus(db.status));

  return {
    id: db.id,
    cliente: clienteNome || "Cliente",
    descricao: db.descricao || "Conta a receber",
    categoria: "Vendas",
    valor: Number(db.valor),
    dataPrevista: db.data_vencimento,
    status,
    formaPagamento: mapFormaPagamento(db.forma_pagamento),
    vinculoVenda: db.venda_id || undefined,
    observacoes: db.observacoes || undefined,
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

      // Busca nomes dos clientes (sub-query filtrada por empresa)
      const clienteIds = contasValidas
        .map((c) => c.cliente_id)
        .filter((id): id is string => id !== null);

      let clientesMap: Map<string, string> = new Map();

      if (clienteIds.length > 0) {
        const { data: clientesData } = await supabase
          .from("me_cliente")
          .select("id, nome_cliente")
          .in("id", clienteIds)
          .eq("empresa_id", empresaId);

        if (clientesData) {
          clientesMap = new Map(
            (clientesData as DBCliente[]).map((c) => [c.id, c.nome_cliente])
          );
        }
      }

      const contasMapeadas = contasValidas.map((conta) =>
        mapContaReceber(conta, conta.cliente_id ? clientesMap.get(conta.cliente_id) : undefined)
      );

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