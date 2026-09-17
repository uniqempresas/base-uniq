import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface AtualizarProdutoParams {
  id: number;
  nome?: string;
  sku?: string;
  codigoBarras?: string;
  /** `me_produto.categoria_id` — não confundir com `tipo` (tipo de produto) */
  categoriaId?: number | null;
  precoVenda?: number;
  precoCusto?: number;
  estoque?: number;
  descricao?: string;
  fotoUrl?: string;
  ativo?: boolean;
  tags?: string[]; // nomes das tags → me_produto.opcoes_config (jsonb array de strings)
}

export interface AtualizarProdutoResult {
  success: boolean;
  error?: string;
}

export function useAtualizarProduto() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarProduto = useCallback(
    async (params: AtualizarProdutoParams): Promise<AtualizarProdutoResult> => {
      setLoading(true);
      setError(null);

      // SEM tenant autenticado, não gravar em tenant errado.
      const empresaId = empresa?.id;
      if (!empresaId) {
        const errorMessage = "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.";
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }

      try {
        const { id, ...campos } = params;

        const updateData: Record<string, unknown> = {};
        if (campos.nome !== undefined) updateData.nome_produto = campos.nome;
        if (campos.sku !== undefined) updateData.sku = campos.sku;
        if (campos.codigoBarras !== undefined) updateData.codigo_barras = campos.codigoBarras;
        if (campos.categoriaId !== undefined) updateData.categoria_id = campos.categoriaId;
        if (campos.precoVenda !== undefined) updateData.preco = campos.precoVenda;
        if (campos.precoCusto !== undefined) updateData.preco_custo = campos.precoCusto;
        if (campos.estoque !== undefined) updateData.estoque_atual = campos.estoque;
        if (campos.descricao !== undefined) updateData.descricao = campos.descricao;
        if (campos.fotoUrl !== undefined) updateData.foto_url = campos.fotoUrl;
        if (campos.ativo !== undefined) updateData.ativo = campos.ativo;
        if (campos.tags !== undefined) updateData.opcoes_config = campos.tags;

        const { error: updateError } = await supabase
          .from("me_produto")
          .update(updateData)
          .eq("id", id)
          .eq("empresa_id", empresaId);

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
    [empresa]
  );

  return {
    atualizarProduto,
    loading,
    error,
  };
}
