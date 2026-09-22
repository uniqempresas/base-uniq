import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { StatusMovimentacao } from "../components/financeiro/mockData";
import { formaPagamentoParaBanco } from "../components/financeiro/mockData";

export interface AtualizarContaPagarParams {
  id: string;
  /** Nome do fornecedor — quando vier, find-or-create em me_fornecedor + grava fornecedor_id. */
  fornecedor?: string;
  fornecedor_id?: string;
  /** `null` LIMPA a categoria; `undefined` não mexe (update parcial). */
  categoriaId?: string | null;
  descricao?: string;
  valor?: number;
  data_vencimento?: string;
  forma_pagamento?: string;
  observacoes?: string;
  status?: StatusMovimentacao;
}

export interface PagarContaParams {
  id: string;
  data_pagamento?: string;
  valor_pago?: number;
}

export interface AtualizarContaPagarResult {
  success: boolean;
  error?: string;
}

async function findOrCreateFornecedor(
  empresaId: string,
  nome: string
): Promise<string | null> {
  const nomeNormalizado = nome.trim().replace(/\s+/g, " ");
  if (!nomeNormalizado) return null;

  const { data: existente } = await supabase
    .from("me_fornecedor")
    .select("id")
    .eq("empresa_id", empresaId)
    .ilike("nome_fornecedor", nomeNormalizado)
    .maybeSingle();

  if (existente) return existente.id;

  const { data: novo, error: insertError } = await supabase
    .from("me_fornecedor")
    .insert({
      empresa_id: empresaId,
      nome_fornecedor: nomeNormalizado,
      ativo: true,
    })
    .select("id")
    .single();

  if (!insertError && novo) return novo.id;

  if (insertError?.code === "23505") {
    const { data: recuperado } = await supabase
      .from("me_fornecedor")
      .select("id")
      .eq("empresa_id", empresaId)
      .ilike("nome_fornecedor", nomeNormalizado)
      .maybeSingle();

    if (recuperado) return recuperado.id;
  }

  console.error("[useAtualizarContaPagar] find-or-create me_fornecedor falhou:", insertError);
  return null;
}

export function useAtualizarContaPagar() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarConta = useCallback(
    async (params: AtualizarContaPagarParams): Promise<AtualizarContaPagarResult> => {
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
        const updateData: Record<string, unknown> = {};

        // Fornecedor OPCIONAL pelo NOME → find-or-create; se falhar, NÃO bloqueia.
        if (params.fornecedor !== undefined && params.fornecedor.trim()) {
          const fornecedorId = await findOrCreateFornecedor(empresaId, params.fornecedor);
          if (fornecedorId) {
            updateData.fornecedor_id = fornecedorId;
          } else {
            console.error("[useAtualizarContaPagar] fornecedor não resolvido; fornecedor_id mantido.");
          }
        } else if (params.fornecedor_id !== undefined) {
          updateData.fornecedor_id = params.fornecedor_id;
        }

        if (params.categoriaId !== undefined) updateData.categoria_id = params.categoriaId;
        if (params.descricao !== undefined) updateData.descricao = params.descricao;
        if (params.valor !== undefined) updateData.valor = params.valor;
        if (params.data_vencimento !== undefined) updateData.data_vencimento = params.data_vencimento;
        if (params.forma_pagamento !== undefined) {
          updateData.forma_pagamento = formaPagamentoParaBanco(params.forma_pagamento);
        }
        if (params.observacoes !== undefined) updateData.observacoes = params.observacoes;
        if (params.status !== undefined) updateData.status = params.status;

        const { error: updateError } = await supabase
          .from("me_contas_pagar")
          .update(updateData)
          .eq("id", params.id)
          .eq("empresa_id", empresaId);

        if (updateError) throw updateError;

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao atualizar conta";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  const pagarConta = useCallback(
    async (params: PagarContaParams): Promise<AtualizarContaPagarResult> => {
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
        const dataPagamento = params.data_pagamento || new Date().toISOString().split("T")[0];

        // Primeiro busca o valor original se não informado
        let valorPago = params.valor_pago;
        if (valorPago === undefined) {
          const { data: conta } = await supabase
            .from("me_contas_pagar")
            .select("valor")
            .eq("id", params.id)
            .eq("empresa_id", empresaId)
            .single();

          valorPago = conta?.valor || 0;
        }

        const { error: updateError } = await supabase
          .from("me_contas_pagar")
          .update({
            status: "pago",
            data_pagamento: dataPagamento,
            valor_pago: valorPago,
          })
          .eq("id", params.id)
          .eq("empresa_id", empresaId);

        if (updateError) throw updateError;

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao pagar conta";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { atualizarConta, pagarConta, loading, error };
}