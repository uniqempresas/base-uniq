import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { NaturezaProduto } from "../types/producao";
import { validarConversaoCompra } from "./use-criar-produto";

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
  estoqueMinimo?: number;
  descricao?: string;
  fotoUrl?: string;
  ativo?: boolean;
  tags?: string[]; // nomes das tags → me_produto.opcoes_config (jsonb array de strings)
  /** `me_produto.exibir_vitrine` — toggle da vitrine */
  exibirVitrine?: boolean;
  /** `me_produto.preco_varejo` — preço "de" da vitrine; null limpa */
  precoPromocional?: number | null;
  /** `me_produto.unidade` — coluna aditiva (SPEC §2.5) */
  unidade?: string | null;
  /**
   * `me_produto.natureza` — eixo de produção (Produção F1). Sempre gravado pelo
   * modal (default `'simples'`); omitido = coluna intocada.
   */
  natureza?: NaturezaProduto;
  /**
   * `me_produto.unidade_compra` — unidade de compra do insumo (Produção F2).
   * O modal sempre envia a chave; `null` LIMPA a coluna (SPEC §4).
   */
  unidadeCompra?: string | null;
  /** `me_produto.fator_conversao` — > 0; `null` LIMPA (= 1) (Produção F2) */
  fatorConversao?: number | null;
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

        // F2 + anti-inversão: unidade de compra preenchida exige fator coerente
        // com a unidade do estoque — falha antes da rede (só quando a chave é
        // enviada; chamadas parciais como { ativo: false } seguem).
        if (campos.unidadeCompra !== undefined) {
          const erroConversao = validarConversaoCompra(
            campos.unidadeCompra,
            campos.fatorConversao,
            campos.unidade
          );
          if (erroConversao) throw new Error(erroConversao);
        }

        const updateData: Record<string, unknown> = {};
        if (campos.nome !== undefined) updateData.nome_produto = campos.nome;
        if (campos.sku !== undefined) updateData.sku = campos.sku;
        if (campos.codigoBarras !== undefined) updateData.codigo_barras = campos.codigoBarras;
        if (campos.categoriaId !== undefined) updateData.categoria_id = campos.categoriaId;
        if (campos.precoVenda !== undefined) updateData.preco = campos.precoVenda;
        if (campos.precoCusto !== undefined) updateData.preco_custo = campos.precoCusto;
        if (campos.estoque !== undefined) updateData.estoque_atual = campos.estoque;
        if (campos.estoqueMinimo !== undefined) updateData.estoque_minimo = campos.estoqueMinimo;
        if (campos.descricao !== undefined) updateData.descricao = campos.descricao;
        if (campos.fotoUrl !== undefined) updateData.foto_url = campos.fotoUrl;
        if (campos.ativo !== undefined) updateData.ativo = campos.ativo;
        if (campos.tags !== undefined) updateData.opcoes_config = campos.tags;
        if (campos.exibirVitrine !== undefined) updateData.exibir_vitrine = campos.exibirVitrine;
        if (campos.precoPromocional !== undefined) updateData.preco_varejo = campos.precoPromocional;
        if (campos.unidade !== undefined) updateData.unidade = campos.unidade;
        // Produção F1: eixo de produção — o legado `tipo` (variações) não é tocado (PRD D5).
        if (campos.natureza !== undefined) updateData.natureza = campos.natureza;
        // Produção F2: conversão de embalagem — o modal sempre envia as chaves; null LIMPA a coluna.
        if (campos.unidadeCompra !== undefined) {
          updateData.unidade_compra = campos.unidadeCompra?.trim() || null;
        }
        if (campos.fatorConversao !== undefined) updateData.fator_conversao = campos.fatorConversao;
        // Insumo = matéria-prima, nunca vitrine (SPEC §6.3). Depois do mapeamento de
        // exibir_vitrine para valer sobre o que veio da UI.
        if (campos.natureza === "insumo") updateData.exibir_vitrine = false;

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
