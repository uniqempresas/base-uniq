import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface CriarProdutoParams {
  nome: string;
  sku?: string;
  codigoBarras?: string;
  categoria?: string;
  precoVenda: number;
  precoCusto?: number;
  estoque?: number;
  descricao?: string;
  fotoUrl?: string;
}

export interface CriarProdutoResult {
  success: boolean;
  id?: number;
  error?: string;
}

export function useCriarProduto() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarProduto = useCallback(
    async (params: CriarProdutoParams): Promise<CriarProdutoResult> => {
      setLoading(true);
      setError(null);

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

        if (!empresaId) {
          throw new Error("Empresa não encontrada");
        }

        const { data: novoProduto, error: produtoError } = await supabase
          .from("me_produto")
          .insert({
            empresa_id: empresaId,
            nome_produto: params.nome,
            sku: params.sku || null,
            codigo_barras: params.codigoBarras || null,
            tipo: params.categoria || "Outros",
            preco: params.precoVenda,
            preco_custo: params.precoCusto || 0,
            estoque_atual: params.estoque || 0,
            descricao: params.descricao || null,
            foto_url: params.fotoUrl || null,
            ativo: true,
          })
          .select("id")
          .single();

        if (produtoError) throw produtoError;

        return {
          success: true,
          id: novoProduto?.id,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao criar produto";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return {
    criarProduto,
    loading,
    error,
  };
}
