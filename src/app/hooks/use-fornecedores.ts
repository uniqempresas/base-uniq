/**
 * Lista de fornecedores ativos para o modal de Nova Compra (Produção Fase 2).
 *
 * O módulo `/fornecedores` ainda vive em localStorage (`useSuppliers.ts` —
 * protótipo), então a compra consome `me_fornecedor` DIRETO no Supabase, como
 * os hooks reais de financeiro já fazem. Sem sessão → lista vazia (a criação
 * de compra exige tenant; não há fallback mock — disciplina da ficha técnica).
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface FornecedorSimples {
  id: string;
  nome: string;
}

interface DBFornecedor {
  id: string;
  nome_fornecedor: string | null;
}

export interface UseFornecedoresReturn {
  fornecedores: FornecedorSimples[];
  loading: boolean;
  error: string | null;
  recarregar: () => void;
}

export function useFornecedores(): UseFornecedoresReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [fornecedores, setFornecedores] = useState<FornecedorSimples[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const primeiraCarga = useRef(true);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    if (primeiraCarga.current) setLoading(true);
    setError(null);

    if (!session) {
      setFornecedores([]);
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    const empresaId = empresa?.id;
    if (!empresaId) {
      setFornecedores([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    try {
      const { data, error: fornError } = await supabase
        .from("me_fornecedor")
        .select("id, nome_fornecedor")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome_fornecedor", { ascending: true });

      if (fornError) throw fornError;

      const lista = ((data as DBFornecedor[] | null) || []).map((f) => ({
        id: f.id,
        nome: f.nome_fornecedor || "Fornecedor sem nome",
      }));
      setFornecedores(lista);
    } catch (err) {
      console.error("[useFornecedores] Erro ao carregar fornecedores:", err);
      setFornecedores([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
      primeiraCarga.current = false;
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { fornecedores, loading, error, recarregar: carregarDados };
}
