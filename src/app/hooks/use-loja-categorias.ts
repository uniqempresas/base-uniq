import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { CategoriaLoja, ProdutoLoja } from "../types/loja";

interface DBCategoria {
  id_categoria: number;
  empresa_id: string | null;
  nome_categoria: string | null;
}

export interface UseLojaCategoriasReturn {
  /** Apenas as categorias que têm produto na vitrine, na ordem de `nome_categoria` */
  categorias: CategoriaLoja[];
  /** id_categoria → nome, para a vitrine resolver o rótulo de cada produto */
  nomePorId: Map<number, string>;
  loading: boolean;
  error: string | null;
}

/**
 * Categorias reais da vitrine (PRD-LojaVirtual-VitrineModerna §4 V1).
 *
 * Lê `me_categoria` no escopo **global** (`empresa_id IS NULL`) + escopo da
 * empresa. A contagem de produtos é feita em memória, a partir do catálogo já
 * carregado — evita uma segunda ida ao banco e o problema de N+1.
 *
 * Categoria sem produto **não** é devolvida: a barra nunca mostra filtro vazio.
 */
export function useLojaCategorias(
  empresaId: string | undefined,
  produtos: ProdutoLoja[]
): UseLojaCategoriasReturn {
  const [todas, setTodas] = useState<CategoriaLoja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!empresaId) {
      setTodas([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from("me_categoria")
        .select("id_categoria, empresa_id, nome_categoria")
        .or(`empresa_id.is.null,empresa_id.eq.${empresaId}`)
        .eq("ativo", true)
        .order("nome_categoria");

      if (err) throw err;

      const linhas = (data as DBCategoria[] | null) || [];
      setTodas(
        linhas
          .filter((l) => typeof l.nome_categoria === "string" && l.nome_categoria.trim().length > 0)
          .map((l) => ({
            id: Number(l.id_categoria),
            nome: (l.nome_categoria as string).trim(),
            global: l.empresa_id === null,
            totalProdutos: 0,
          }))
      );
    } catch (e) {
      console.error("[useLojaCategorias] Erro ao buscar categorias:", e);
      setError(e instanceof Error ? e.message : "Erro ao carregar as categorias");
      setTodas([]);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const categorias = useMemo(() => {
    if (produtos.length === 0) return [];

    const contagem = new Map<number, number>();
    for (const p of produtos) {
      if (p.categoriaId === null || p.categoriaId === undefined) continue;
      contagem.set(p.categoriaId, (contagem.get(p.categoriaId) ?? 0) + 1);
    }

    return todas
      .map((c) => ({ ...c, totalProdutos: contagem.get(c.id) ?? 0 }))
      .filter((c) => c.totalProdutos > 0);
  }, [todas, produtos]);

  const nomePorId = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const c of todas) mapa.set(c.id, c.nome);
    return mapa;
  }, [todas]);

  return { categorias, nomePorId, loading, error };
}
