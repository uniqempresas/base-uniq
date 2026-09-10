import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface AtualizarContaReceberParams {
  id: string;
  cliente_id?: string;
  descricao?: string;
  valor?: number;
  data_vencimento?: string;
  forma_pagamento?: string;
  observacoes?: string;
}

export interface ReceberContaParams {
  id: string;
  data_pagamento?: string;
  valor_pago?: number;
}

export interface AtualizarContaReceberResult {
  success: boolean;
  error?: string;
}

export function useAtualizarContaReceber() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarConta = useCallback(
    async (params: AtualizarContaReceberParams): Promise<AtualizarContaReceberResult> => {
      setLoading(true);
      setError(null);

      try {
        const updateData: Record<string, unknown> = {};

        if (params.cliente_id !== undefined) updateData.cliente_id = params.cliente_id;
        if (params.descricao !== undefined) updateData.descricao = params.descricao;
        if (params.valor !== undefined) updateData.valor = params.valor;
        if (params.data_vencimento !== undefined) updateData.data_vencimento = params.data_vencimento;
        if (params.forma_pagamento !== undefined) updateData.forma_pagamento = params.forma_pagamento;
        if (params.observacoes !== undefined) updateData.observacoes = params.observacoes;

        const { error: updateError } = await supabase
          .from("me_contas_receber")
          .update(updateData)
          .eq("id", params.id);

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
    []
  );

  const receberConta = useCallback(
    async (params: ReceberContaParams): Promise<AtualizarContaReceberResult> => {
      setLoading(true);
      setError(null);

      try {
        const dataPagamento = params.data_pagamento || new Date().toISOString().split("T")[0];

        // Primeiro busca o valor original se não informado
        let valorPago = params.valor_pago;
        if (valorPago === undefined) {
          const { data: conta } = await supabase
            .from("me_contas_receber")
            .select("valor")
            .eq("id", params.id)
            .single();

          valorPago = conta?.valor || 0;
        }

        const { error: updateError } = await supabase
          .from("me_contas_receber")
          .update({
            status: "pago",
            data_pagamento: dataPagamento,
            valor_pago: valorPago,
          })
          .eq("id", params.id);

        if (updateError) throw updateError;

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao receber conta";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { atualizarConta, receberConta, loading, error };
}
