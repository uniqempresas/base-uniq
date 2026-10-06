/**
 * Escrita de movimentação de estoque (B14 — SPEC §4).
 *
 * Lógica extraída do `AjustarEstoqueModal` (ProdutoDetalhePage) para ser usada
 * pelos DOIS modais (ajuste no detalhe + Nova Entrada/Saída no extrato).
 * Comportamento idêntico ao original: mesmas validações, mesmas mensagens e a
 * MESMA ordem banco: 1º UPDATE `me_produto.estoque_atual` → 2º INSERT
 * `est_movimentacao`. Agora com `observacao` gravada (bug N10 — coluna existe).
 */
import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useAtualizarProduto } from "./use-atualizar-produto";
import type { MovTipo } from "../types/estoque";
import type { Produto } from "../types/produto";

export interface RegistrarMovimentacaoParams {
  /** precisa só de id/estoque/unidade para o cálculo e as mensagens atuais */
  produto: Pick<Produto, "id" | "estoque" | "unidade">;
  tipo: MovTipo;
  quantidade: number;
  motivo: string;
  observacao?: string;
}

export interface RegistrarMovimentacaoResult {
  success: boolean;
  error?: string;
}

export function useRegistrarMovimentacao() {
  const { empresa, perfil } = useAuth();
  const { atualizarProduto } = useAtualizarProduto();
  const [loading, setLoading] = useState(false);

  const registrarMovimentacao = useCallback(
    async (
      params: RegistrarMovimentacaoParams
    ): Promise<RegistrarMovimentacaoResult> => {
      const { produto, tipo, quantidade: qtd, motivo, observacao } = params;

      // Validações (mensagens originais do AjustarEstoqueModal)
      if (!qtd || qtd <= 0) {
        return { success: false, error: "Informe uma quantidade válida (maior que zero)." };
      }
      if (!motivo) {
        return { success: false, error: "Selecione um motivo para a movimentação." };
      }
      if (tipo === "saida" && qtd > (produto.estoque || 0)) {
        return {
          success: false,
          error: `Quantidade maior que o estoque disponível (${produto.estoque} ${produto.unidade}).`,
        };
      }

      // Sem tenant autenticado, não gravar em tenant errado (mesmo critério do hook).
      const empresaId = empresa?.id;
      if (!empresaId) {
        return {
          success: false,
          error: "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.",
        };
      }

      // me_produto.estoque_atual é VALOR ABSOLUTO (não delta) — calcula o novo total.
      const estoqueAtual = produto.estoque || 0;
      const novoEstoque = tipo === "entrada" ? estoqueAtual + qtd : estoqueAtual - qtd;

      setLoading(true);
      try {
        // Ordem escolhida (preservada do modal): UPDATE (me_produto) primeiro,
        // INSERT (est_movimentacao) depois. Estoque é a fonte da verdade do negócio:
        // se o histórico falhar, o estoque segue consistente e avisamos o usuário.
        // Se fosse o contrário, teríamos um registro de histórico sem o estoque
        // realmente mudar — falso histórico.
        const result = await atualizarProduto({ id: Number(produto.id), estoque: novoEstoque });
        if (!result.success) {
          return { success: false, error: result.error || "Erro ao atualizar o estoque do produto." };
        }

        const obsTrim = observacao?.trim();
        const { error: movError } = await supabase.from("est_movimentacao").insert({
          empresa_id: empresaId,
          produto_id: Number(produto.id), // me_produto.id (integer)
          tipo, // 'entrada' | 'saida' (minúsculo — CHECK da tabela)
          quantidade: qtd,
          motivo,
          observacao: obsTrim ? obsTrim : null, // N10: campo existia na UI e era descartado
          // me_usuario.id = id do auth (uuid) quando logado; sem perfil a coluna é nullable e fica null
          usuario_id: perfil?.id || null,
        });

        if (movError) {
          // O UPDATE já foi ao banco — o "sucesso" não pode ser exibido sem o histórico.
          console.error("[useRegistrarMovimentacao] Erro ao registrar movimentação:", movError);
          return {
            success: false,
            error: "Estoque atualizado, mas não foi possível registrar o histórico da movimentação. Tente novamente.",
          };
        }

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao ajustar o estoque. Tente novamente.",
        };
      } finally {
        setLoading(false);
      }
    },
    [empresa, perfil, atualizarProduto]
  );

  return { registrarMovimentacao, loading };
}
