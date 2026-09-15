import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface AtualizarStatusPedidoParams {
  id: string;
  status: string;
  observacao?: string;
  codigoRastreio?: string;
}

export interface AtualizarStatusPedidoResult {
  success: boolean;
  error?: string;
}

export function useAtualizarStatusPedido() {
  const { empresa, perfil } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarStatus = useCallback(
    async ({
      id,
      status,
      observacao,
      codigoRastreio,
    }: AtualizarStatusPedidoParams): Promise<AtualizarStatusPedidoResult> => {
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
        // 1) UPDATE em me_venda
        const updatePayload: Record<string, unknown> = {
          status_venda: status,
          atualizado_em: new Date().toISOString(),
        };

        if (codigoRastreio) {
          updatePayload.codigo_rastreio = codigoRastreio;
        }

        if (status === "cancelado" && observacao) {
          updatePayload.motivo_cancelamento = observacao;
        }

        const { error: updateError } = await supabase
          .from("me_venda")
          .update(updatePayload)
          .eq("id", id)
          .eq("empresa_id", empresaId);

        if (updateError) throw updateError;

        // 2) INSERT em me_venda_historico
        const { error: historicoError } = await supabase
          .from("me_venda_historico")
          .insert({
            venda_id: id,
            empresa_id: empresaId,
            status,
            observacao: observacao || null,
            codigo_rastreio: codigoRastreio || null,
            responsavel_usuario_id: perfil?.id || null,
          });

        if (historicoError) throw historicoError;

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar status do pedido";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [empresa, perfil]
  );

  return {
    atualizarStatus,
    loading,
    error,
  };
}
