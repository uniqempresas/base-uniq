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
  /** U2 — "cadastrar fornecedor na hora": find-or-create mínimo (nome/telefone/obs) */
  criarFornecedor: (dados: CriarFornecedorDados) => Promise<CriarFornecedorResult>;
  criando: boolean;
}

/** Dados mínimos do mini-sheet de cadastro. Colunas REAIS de me_fornecedor
 *  (verificadas hoje no schema vivo): nome_fornecedor · telefone · observacoes · ativo. */
export interface CriarFornecedorDados {
  nome: string;
  telefone?: string;
  observacao?: string;
}

export interface CriarFornecedorResult {
  success: boolean;
  id?: string;
  error?: string;
}

export function useFornecedores(): UseFornecedoresReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [fornecedores, setFornecedores] = useState<FornecedorSimples[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
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

  /**
   * U2 — "cadastrar fornecedor na hora" (mercado, celular). Padrão find-or-create
   * de `use-criar-conta-pagar.ts:29-73`: casa por nome (ilike, case-insensitive)
   * ANTES de inserir; corrida/duplicidade (23505) → recupera o existente.
   * Só grava colunas que existem no schema real: nome_fornecedor · telefone ·
   * observacoes · ativo · empresa_id.
   */
  const criarFornecedor = useCallback(
    async (dados: CriarFornecedorDados): Promise<CriarFornecedorResult> => {
      const empresaId = empresa?.id;
      if (!empresaId || !session) {
        return {
          success: false,
          error:
            "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.",
        };
      }

      const nomeNormalizado = dados.nome.trim().replace(/\s+/g, " ");
      if (!nomeNormalizado) return { success: false, error: "Informe o nome do fornecedor." };

      setCriando(true);
      try {
        // 1) já existe? (find por nome antes de inserir)
        const { data: existente } = await supabase
          .from("me_fornecedor")
          .select("id")
          .eq("empresa_id", empresaId)
          .ilike("nome_fornecedor", nomeNormalizado)
          .maybeSingle();

        if (existente) return { success: true, id: existente.id };

        // 2) cria o mínimo — telefone/observação só quando preenchidos
        const { data: novo, error: insertError } = await supabase
          .from("me_fornecedor")
          .insert({
            empresa_id: empresaId,
            nome_fornecedor: nomeNormalizado,
            telefone: dados.telefone?.trim() || null,
            observacoes: dados.observacao?.trim() || null,
            ativo: true,
          })
          .select("id")
          .single();

        if (!insertError && novo) return { success: true, id: novo.id };

        // 3) corrida/duplicidade → recupera o cadastro existente
        if (insertError?.code === "23505") {
          const { data: recuperado } = await supabase
            .from("me_fornecedor")
            .select("id")
            .eq("empresa_id", empresaId)
            .ilike("nome_fornecedor", nomeNormalizado)
            .maybeSingle();

          if (recuperado) return { success: true, id: recuperado.id };
        }

        return {
          success: false,
          error: insertError?.message || "Não foi possível cadastrar o fornecedor.",
        };
      } catch (err) {
        console.error("[useFornecedores.criarFornecedor] erro:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Não foi possível cadastrar o fornecedor.",
        };
      } finally {
        setCriando(false);
      }
    },
    [empresa, session]
  );

  return { fornecedores, loading, error, recarregar: carregarDados, criarFornecedor, criando };
}
