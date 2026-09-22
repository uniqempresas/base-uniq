import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { CORES_TAG } from "./use-tags";

/**
 * O contrato congelado do SPEC B9 §1 — o único ponto compartilhado entre as 3 lanes.
 * A validação fica NO APP (a migration não usa CHECK para não falhar com dado legado).
 */
export type TipoCategoriaFinanceira = "operacional" | "mercadoria" | "receita";

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: string | null;
  cor: string | null;
  ativo: boolean | null;
}

export interface CriarCategoriaFinanceiraResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface MutarCategoriaFinanceiraResult {
  success: boolean;
  error?: string;
}

export interface UseCategoriasFinanceirasReturn {
  categorias: CategoriaFinanceira[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
  criarCategoria: (
    nome: string,
    tipo: TipoCategoriaFinanceira,
    cor?: string
  ) => Promise<CriarCategoriaFinanceiraResult>;
  atualizarCategoria: (
    id: string,
    campos: { nome?: string; tipo?: TipoCategoriaFinanceira; cor?: string }
  ) => Promise<MutarCategoriaFinanceiraResult>;
  desativarCategoria: (id: string) => Promise<MutarCategoriaFinanceiraResult>;
  /** Quantas contas (a pagar + a receber) usam a categoria — alimenta o aviso antes de remover */
  contarContas: (id: string) => Promise<number>;
}

function tipoValido(tipo: string | null | undefined): tipo is TipoCategoriaFinanceira {
  return tipo === "operacional" || tipo === "mercadoria" || tipo === "receita";
}

/**
 * Categorias financeiras reais (me_categoria_financeira) — CRUD completo.
 *
 * Espelha `use-categorias.ts` (CRUD de categoria de produto, aprovado pelo
 * fundador) em tudo: trava de tenant em toda escrita, soft delete (nunca
 * `delete`), tratamento de duplicidade (23505) e erro nunca silencioso.
 *
 * Diferença deliberada em relação ao produto: esta tabela é POR TENANT
 * (`empresa_id` not null) — não existe categoria global (o produto tem
 * `empresa_id IS NULL`). Também não inventa mock: sem dados, retorna lista
 * vazia (empty state real).
 */
export function useCategoriasFinanceiras(): UseCategoriasFinanceirasReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarCategorias = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem login): sem categorias reais → lista vazia com isFallback
    if (!session) {
      setCategorias([]);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    const empresaId = empresa?.id;
    if (!empresaId) {
      setCategorias([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from("me_categoria_financeira")
        .select("id, nome, tipo, cor, ativo")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (queryError) throw queryError;

      setCategorias((data as CategoriaFinanceira[] | null) || []);
      setIsFallback(false);
    } catch (err) {
      console.error("[useCategoriasFinanceiras] Erro ao buscar categorias:", err);
      setCategorias([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar categorias");
      setIsFallback(false);
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  const criarCategoria = useCallback(
    async (
      nome: string,
      tipo: TipoCategoriaFinanceira,
      cor?: string
    ): Promise<CriarCategoriaFinanceiraResult> => {
      const nomeLimpo = nome.trim();
      if (!nomeLimpo) {
        return { success: false, error: "Informe o nome da categoria." };
      }

      const empresaId = empresa?.id;
      if (!empresaId) {
        return {
          success: false,
          error: "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.",
        };
      }

      // Default de categoria nova: operacional (SPEC B9 §1). Valor inválido
      // (dado legado/API) cai no default em vez de gravar lixo.
      const tipoFinal: TipoCategoriaFinanceira = tipoValido(tipo) ? tipo : "operacional";

      const { data, error: insertError } = await supabase
        .from("me_categoria_financeira")
        .insert({
          empresa_id: empresaId,
          nome: nomeLimpo,
          tipo: tipoFinal,
          cor: cor || CORES_TAG[0],
          ativo: true,
        })
        .select("id")
        .single();

      if (insertError) {
        // 23505 = unique_violation (me_categoria_financeira_empresa_nome_key)
        if (insertError.code === "23505") {
          return { success: false, error: "Já existe uma categoria com esse nome." };
        }
        return { success: false, error: insertError.message };
      }

      carregarCategorias();
      return { success: true, id: data?.id };
    },
    [empresa, carregarCategorias]
  );

  const atualizarCategoria = useCallback(
    async (
      id: string,
      campos: { nome?: string; tipo?: TipoCategoriaFinanceira; cor?: string }
    ): Promise<MutarCategoriaFinanceiraResult> => {
      const empresaId = empresa?.id;
      if (!empresaId) {
        return { success: false, error: "Empresa não identificada para este usuário." };
      }

      const payload: { nome?: string; tipo?: TipoCategoriaFinanceira; cor?: string } = {};
      if (campos.nome !== undefined) {
        const nomeLimpo = campos.nome.trim();
        if (!nomeLimpo) return { success: false, error: "Informe o nome da categoria." };
        payload.nome = nomeLimpo;
      }
      if (campos.tipo !== undefined) {
        payload.tipo = tipoValido(campos.tipo) ? campos.tipo : "operacional";
      }
      if (campos.cor !== undefined) payload.cor = campos.cor;

      if (Object.keys(payload).length === 0) {
        return { success: false, error: "Nada para atualizar." };
      }

      // `.eq("empresa_id")` é a trava de tenant: nunca atualiza categoria de outra empresa
      const { error: updateError } = await supabase
        .from("me_categoria_financeira")
        .update(payload)
        .eq("id", id)
        .eq("empresa_id", empresaId);

      if (updateError) {
        if (updateError.code === "23505") {
          return { success: false, error: "Já existe uma categoria com esse nome." };
        }
        return { success: false, error: updateError.message };
      }

      carregarCategorias();
      return { success: true };
    },
    [empresa, carregarCategorias]
  );

  const desativarCategoria = useCallback(
    async (id: string): Promise<MutarCategoriaFinanceiraResult> => {
      const empresaId = empresa?.id;
      if (!empresaId) {
        return { success: false, error: "Empresa não identificada para este usuário." };
      }

      // Soft delete: a conta que já usava a categoria mantém o rótulo.
      // NUNCA `delete` — a coluna `ativo` é o que tira a categoria dos selects.
      const { error: updateError } = await supabase
        .from("me_categoria_financeira")
        .update({ ativo: false })
        .eq("id", id)
        .eq("empresa_id", empresaId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      carregarCategorias();
      return { success: true };
    },
    [empresa, carregarCategorias]
  );

  const contarContas = useCallback(
    async (id: string): Promise<number> => {
      const empresaId = empresa?.id;
      if (!empresaId) return 0;

      // Conta nas DUAS tabelas: me_contas_pagar + me_contas_receber
      let total = 0;
      for (const tabela of ["me_contas_pagar", "me_contas_receber"]) {
        const { count, error: countError } = await supabase
          .from(tabela)
          .select("id", { count: "exact", head: true })
          .eq("categoria_id", id)
          .eq("empresa_id", empresaId);

        if (countError) {
          console.error("[useCategoriasFinanceiras] Erro ao contar contas:", countError);
          continue;
        }
        total += count || 0;
      }
      return total;
    },
    [empresa]
  );

  return {
    categorias,
    loading,
    error,
    isFallback,
    recarregar: carregarCategorias,
    criarCategoria,
    atualizarCategoria,
    desativarCategoria,
    contarContas,
  };
}