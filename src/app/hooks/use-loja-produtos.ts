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

export interface UseLojaProdutosReturn {
  produtos: ProdutoLoja[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  refetch: () => void;
}

function mapProdutoVitrine(db: DBProdutoVitrine): ProdutoLoja {
  const estoque = Number(db.estoque_atual) || 0;
  return {
    id: Number(db.id),
    nome: db.nome_produto || "Sem nome",
    preco: Number(db.preco) || 0,
    fotoUrl: db.foto_url,
    descricao: db.descricao,
    estoque,
    esgotado: estoque <= 0,
  };
}

/**
 * Catálogo da vitrine (SPEC §2.2): `me_produto` com `ativo` e `exibir_vitrine`.
 * Regra mock-first: banco vazio OU erro → fallback mock com `isFallback`.
 */
export function useLojaProdutos(empresaId: string | undefined): UseLojaProdutosReturn {
  const [produtos, setProdutos] = useState<ProdutoLoja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsFallback(false);

    if (!empresaId) {
      setProdutos([]);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from("me_produto")
        .select("id, nome_produto, preco, foto_url, descricao, estoque_atual")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .eq("exibir_vitrine", true)
        .order("nome_produto");

      if (err) throw err;

      const linhas = (data as DBProdutoVitrine[] | null) || [];

      // Ban vazio → fallback mock (regra mock-first)
      if (linhas.length === 0) {
        setProdutos(PRODUTOS_LOJA_VITRINE);
        setIsFallback(true);
        setLoading(false);
        return;
      }

      setProdutos(linhas.map(mapProdutoVitrine));
    } catch (e) {
      console.error("[useLojaProdutos] Erro ao buscar catálogo:", e);
      setError(e instanceof Error ? e.message : "Erro ao carregar o catálogo");
      setProdutos(PRODUTOS_LOJA_VITRINE);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { produtos, loading, error, isFallback, refetch: carregar };
}