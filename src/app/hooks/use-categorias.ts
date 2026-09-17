import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { CORES_TAG } from "./use-tags";

/**
 * Categorias de produto — CRUD.
 *
 * Espelha `use-tags.ts` (tags/etiquetas de cliente) em estrutura, mock-first e
 * tratamento de erro, porque a tela é a mesma e o fundador aprovou esse padrão.
 *
 * ⚠️ Escopo deliberadamente restrito às categorias DA EMPRESA.
 * `me_categoria.empresa_id IS NULL` são categorias **globais** (ex.: "Pães e
 * Doces", "Bebidas"), compartilhadas entre tenants — editá-las daqui quebraria
 * outra empresa. Elas continuam valendo na loja, mas não aparecem neste CRUD.
 */
export interface CategoriaProduto {
  id: number;
  nome: string;
  cor: string | null;
  ativo: boolean;
  /** `empresa_id IS NULL` → catálogo global, não editável pelo tenant */
  global: boolean;
}

export interface CriarCategoriaResult {
  success: boolean;
  id?: number;
  error?: string;
}

export interface MutarCategoriaResult {
  success: boolean;
  error?: string;
}

// Mock-first (sem login): categorias genéricas de demonstração.
// Nunca usar nomes de um tenant real — seria vazamento de contexto.
export const CATEGORIAS_PADRAO: CategoriaProduto[] = [
  { id: 1, nome: "Bebidas", cor: CORES_TAG[6], ativo: true, global: false },
  { id: 2, nome: "Doces", cor: CORES_TAG[4], ativo: true, global: false },
  { id: 3, nome: "Salgados", cor: CORES_TAG[3], ativo: true, global: false },
  { id: 4, nome: "Outros", cor: CORES_TAG[9], ativo: true, global: false },
];

interface DBCategoria {
  id_categoria: number;
  empresa_id: string | null;
  nome_categoria: string | null;
  cor: string | null;
  ativo: boolean | null;
}

function mapCategoria(db: DBCategoria): CategoriaProduto {
  return {
    id: Number(db.id_categoria),
    nome: db.nome_categoria || "",
    cor: db.cor || null,
    ativo: db.ativo !== false,
    global: db.empresa_id === null,
  };
}

export interface UseCategoriasReturn {
  categorias: CategoriaProduto[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
  criarCategoria: (nome: string, cor?: string) => Promise<CriarCategoriaResult>;
  atualizarCategoria: (
    id: number,
    campos: { nome?: string; cor?: string }
  ) => Promise<MutarCategoriaResult>;
  desativarCategoria: (id: number) => Promise<MutarCategoriaResult>;
  /** Quantos produtos usam a categoria — alimenta o aviso antes de remover */
  contarProdutos: (id: number) => Promise<number>;
}

export function useCategorias(): UseCategoriasReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem login): mock — regra mock-first de 07/09/2026
    if (!session) {
      setCategorias(CATEGORIAS_PADRAO);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    // Logado mas empresa não resolvida: NÃO consultar outro tenant
    const empresaId = empresa?.id;
    if (!empresaId) {
      setCategorias([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error: catError } = await supabase
        .from("me_categoria")
        .select("id_categoria, empresa_id, nome_categoria, cor, ativo")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome_categoria");

      if (catError) throw catError;

      // 0 linhas = empresa sem categoria = empty state real (nunca mock de outra empresa)
      setCategorias(((data as DBCategoria[] | null) || []).map(mapCategoria));
      setIsFallback(false);
    } catch (err) {
      console.error("[useCategorias] Erro ao buscar categorias:", err);
      if (!session) {
        setCategorias(CATEGORIAS_PADRAO);
        setIsFallback(true);
      } else {
        setCategorias([]);
        setError(err instanceof Error ? err.message : "Erro ao carregar categorias");
        setIsFallback(false);
      }
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const criarCategoria = useCallback(
    async (nome: string, cor?: string): Promise<CriarCategoriaResult> => {
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

      const { data, error: insertError } = await supabase
        .from("me_categoria")
        .insert({
          empresa_id: empresaId,
          nome_categoria: nomeLimpo,
          cor: cor || CORES_TAG[0],
          ativo: true,
        })
        .select("id_categoria")
        .single();

      if (insertError) {
        // 23505 = unique_violation (ux_me_categoria_empresa_nome)
        if (insertError.code === "23505") {
          return { success: false, error: "Já existe uma categoria com esse nome." };
        }
        return { success: false, error: insertError.message };
      }

      carregarDados();
      return { success: true, id: Number(data?.id_categoria) };
    },
    [empresa, carregarDados]
  );

  const atualizarCategoria = useCallback(
    async (
      id: number,
      campos: { nome?: string; cor?: string }
    ): Promise<MutarCategoriaResult> => {
      const empresaId = empresa?.id;
      if (!empresaId) {
        return { success: false, error: "Empresa não identificada para este usuário." };
      }

      const payload: { nome_categoria?: string; cor?: string } = {};
      if (campos.nome !== undefined) {
        const nomeLimpo = campos.nome.trim();
        if (!nomeLimpo) return { success: false, error: "Informe o nome da categoria." };
        payload.nome_categoria = nomeLimpo;
      }
      if (campos.cor !== undefined) payload.cor = campos.cor;

      if (Object.keys(payload).length === 0) {
        return { success: false, error: "Nada para atualizar." };
      }

      // `.eq("empresa_id")` é a trava de tenant: nunca atualiza categoria global
      const { error: updateError } = await supabase
        .from("me_categoria")
        .update(payload)
        .eq("id_categoria", id)
        .eq("empresa_id", empresaId);

      if (updateError) {
        if (updateError.code === "23505") {
          return { success: false, error: "Já existe uma categoria com esse nome." };
        }
        return { success: false, error: updateError.message };
      }

      carregarDados();
      return { success: true };
    },
    [empresa, carregarDados]
  );

  const desativarCategoria = useCallback(
    async (id: number): Promise<MutarCategoriaResult> => {
      const empresaId = empresa?.id;
      if (!empresaId) {
        return { success: false, error: "Empresa não identificada para este usuário." };
      }

      // Soft delete: o produto que já usava a categoria mantém o rótulo
      const { error: updateError } = await supabase
        .from("me_categoria")
        .update({ ativo: false })
        .eq("id_categoria", id)
        .eq("empresa_id", empresaId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      carregarDados();
      return { success: true };
    },
    [empresa, carregarDados]
  );

  const contarProdutos = useCallback(
    async (id: number): Promise<number> => {
      const empresaId = empresa?.id;
      if (!empresaId) return 0;

      const { count, error: countError } = await supabase
        .from("me_produto")
        .select("id", { count: "exact", head: true })
        .eq("categoria_id", id)
        .eq("empresa_id", empresaId);

      if (countError) {
        console.error("[useCategorias] Erro ao contar produtos:", countError);
        return 0;
      }
      return count || 0;
    },
    [empresa]
  );

  return {
    categorias,
    loading,
    error,
    isFallback,
    recarregar: carregarDados,
    criarCategoria,
    atualizarCategoria,
    desativarCategoria,
    contarProdutos,
  };
}
