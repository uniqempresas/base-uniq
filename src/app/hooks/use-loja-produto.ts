import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { ProdutoLoja } from "../types/loja";
import { PRODUTOS_LOJA_VITRINE } from "../components/loja/lojaMockData";

interface DBProdutoVitrine {
  id: number;
  nome_produto: string | null;
  preco: number | null;
  foto_url: string | null;
  descricao: string | null;
  estoque_atual: number | null;
}

export interface UseLojaProdutoReturn {
  produto: ProdutoLoja | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  refetch: () => void;
}

/**
 * Produto único da vitrine (SPEC §2.2 por id, filtrado por empresa).
 * Não encontrado/erro → fallback mock por id (regra mock-first).
 */
export function useLojaProduto(empresaId: string | undefined, id: number | undefined): UseLojaProdutoReturn {
  const [produto, setProduto] = useState<ProdutoLoja | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const buscarMock = useCallback((produtoId: number | undefined) => {
    const mock = PRODUTOS_LOJA_VITRINE.find(p => p.id === produtoId) || null;
    setProduto(mock);
    setIsFallback(true);
    setLoading(false);
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsFallback(false);

    if (!empresaId || id === undefined || Number.isNaN(id)) {
      buscarMock(id);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from("me_produto")
        .select("id, nome_produto, preco, foto_url, descricao, estoque_atual")
        .eq("empresa_id", empresaId)
        .eq("id", id)
        .maybeSingle();

      if (err) throw err;

      if (!data) {
        buscarMock(id);
        return;
      }

      const estoque = Number((data as DBProdutoVitrine).estoque_atual) || 0;
      setProduto({
        id: Number((data as DBProdutoVitrine).id),
        nome: (data as DBProdutoVitrine).nome_produto || "Sem nome",
        preco: Number((data as DBProdutoVitrine).preco) || 0,
        fotoUrl: (data as DBProdutoVitrine).foto_url,
        descricao: (data as DBProdutoVitrine).descricao,
        estoque,
        esgotado: estoque <= 0,
      });
    } catch (e) {
      console.error("[useLojaProduto] Erro ao buscar produto:", e);
      setError(e instanceof Error ? e.message : "Erro ao carregar o produto");
      buscarMock(id);
    } finally {
      setLoading(false);
    }
  }, [empresaId, id, buscarMock]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { produto, loading, error, isFallback, refetch: carregar };
}