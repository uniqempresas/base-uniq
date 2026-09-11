import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface AtualizarStatusPedidoParams {
  id: string;
  status: string;
}

export interface AtualizarStatusPedidoResult {
  success: boolean;
  error?: string;
}

export function useAtualizarStatusPedido() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarStatus = useCallback(
    async ({ id, status }: AtualizarStatusPedidoParams): Promise<AtualizarStatusPedidoResult> => {
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
        const { error: updateError } = await supabase
          .from("me_venda")
          .update({ status_venda: status, atualizado_em: new Date().toISOString() })
          .eq("id", id)
          .eq("empresa_id", empresaId);

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
    [empresa]
  );

  return {
    atualizarStatus,
    loading,
    error,
  };
}