import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface AtualizarProdutoParams {
  id: number;
  nome?: string;
  sku?: string;
  codigoBarras?: string;
  categoria?: string;
  precoVenda?: number;
  precoCusto?: number;
  estoque?: number;
  descricao?: string;
  fotoUrl?: string;
  ativo?: boolean;
}

export interface AtualizarProdutoResult {
  success: boolean;
  error?: string;
}

export function useAtualizarProduto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarProduto = useCallback(
    async (params: AtualizarProdutoParams): Promise<AtualizarProdutoResult> => {
      setLoading(true);
      setError(null);

      try {
        const { id, ...campos } = params;

        const updateData: Record<string, unknown> = {};
        if (campos.nome !== undefined) updateData.nome_produto = campos.nome;
        if (campos.sku !== undefined) updateData.sku = campos.sku;
        if (campos.codigoBarras !== undefined) updateData.codigo_barras = campos.codigoBarras;
        if (campos.categoria !== undefined) updateData.tipo = campos.categoria;
        if (campos.precoVenda !== undefined) updateData.preco = campos.precoVenda;
        if (campos.precoCusto !== undefined) updateData.preco_custo = campos.precoCusto;
        if (campos.estoque !== undefined) updateData.estoque_atual = campos.estoque;
        if (campos.descricao !== undefined) updateData.descricao = campos.descricao;
        if (campos.fotoUrl !== undefined) updateData.foto_url = campos.fotoUrl;
        if (campos.ativo !== undefined) updateData.ativo = campos.ativo;

        const { error: updateError } = await supabase
          .from("me_produto")
          .update(updateData)
          .eq("id", id);

        if (updateError) throw updateError;

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar produto";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    atualizarProduto,
    loading,
    error,
  };
}
