import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface AtualizarContaPagarParams {
  id: string;
  fornecedor_id?: string;
  descricao?: string;
  valor?: number;
  data_vencimento?: string;
  forma_pagamento?: string;
  observacoes?: string;
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

        if (params.fornecedor_id !== undefined) updateData.fornecedor_id = params.fornecedor_id;
        if (params.descricao !== undefined) updateData.descricao = params.descricao;
        if (params.valor !== undefined) updateData.valor = params.valor;
        if (params.data_vencimento !== undefined) updateData.data_vencimento = params.data_vencimento;
        if (params.forma_pagamento !== undefined) updateData.forma_pagamento = params.forma_pagamento;
        if (params.observacoes !== undefined) updateData.observacoes = params.observacoes;

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
