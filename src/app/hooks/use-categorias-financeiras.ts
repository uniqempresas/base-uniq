import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: string | null;
  cor: string | null;
  ativo: boolean | null;
}

export interface UseCategoriasFinanceirasReturn {
  categorias: CategoriaFinanceira[];
  loading: boolean;
  isFallback: boolean;
  recarregar: () => void;
}

/**
 * Categorias financeiras reais (me_categoria_financeira).
 * Hoje a tabela está VAZIA (0 linhas) — este hook existe para a lane de
 * páginas exibir o dropdown quando o CRUD de categorias entrar (P2).
 * Não inventa mock: sem dados, retorna lista vazia (empty state real).
 */
export function useCategoriasFinanceiras(): UseCategoriasFinanceirasReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  const carregarCategorias = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
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
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from("me_categoria_financeira")
        .select("id, nome, tipo, cor, ativo")
        .eq("empresa_id", empresaId)
        .order("nome", { ascending: true });

      if (queryError) throw queryError;

      setCategorias((data as CategoriaFinanceira[] | null) || []);
    } catch (err) {
      console.error("[useCategoriasFinanceiras] Erro ao buscar categorias:", err);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  return {
    categorias,
    loading,
    isFallback,
    recarregar: carregarCategorias,
  };
}