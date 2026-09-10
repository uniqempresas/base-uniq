import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface AtualizarStatusPedidoParams {
  id: string;
  status: string;
}

export interface AtualizarStatusPedidoResult {
  success: boolean;
  error?: string;
}

export function useAtualizarStatusPedido() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarStatus = useCallback(
    async ({ id, status }: AtualizarStatusPedidoParams): Promise<AtualizarStatusPedidoResult> => {
      setLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from("me_venda")
          .update({ status_venda: status, atualizado_em: new Date().toISOString() })
          .eq("id", id);

        if (updateError) throw updateError;

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar status do pedido";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    atualizarStatus,
    loading,
    error,
  };
}
