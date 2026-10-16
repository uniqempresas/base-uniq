/**
 * Estorno de recebimento de compra (EstornoRecebimento — SPEC §6).
 *
 * Única escrita: RPC `estornar_recebimento(p_empresa_id, p_compra_id)` —
 * SECURITY DEFINER. `p_usuario_id` NÃO é enviado: a RPC resolve `auth.uid()`
 * sozinha. A RPC reverte o recebimento em uma transação (estoque/custo ao
 * estado de antes · conta a pagar cancelada · compra volta a PENDENTE ·
 * saída "Estorno" no extrato). O app NÃO toca nessas tabelas aqui.
 *
 * Erros: jsonb `{success:false, error, detail}` (shape de `receber_compra`).
 * `error` já é a mensagem humana da RPC (CONTA_PAGA / MOVIMENTACAO_POSTERIOR
 * vêm completas) — o front exibe `error` integralmente, sem sanitizar.
 */
import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface EstornarRecebimentoParams {
  compraId: string;
}

export interface EstornarRecebimentoResult {
  success: boolean;
  error?: string;
  detail?: string;
}

interface RpcResultado {
  success?: boolean;
  compra_id?: string;
  conta_pagar_id?: string | null;
  itens?: unknown;
  error?: string;
  detail?: string;
}

export function useEstornarRecebimento() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estornar = useCallback(
    async (params: EstornarRecebimentoParams): Promise<EstornarRecebimentoResult> => {
      setLoading(true);
      setError(null);

      try {
        const empresaId = empresa?.id;
        if (!empresaId) {
          throw new Error(
            "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
          );
        }
        if (!params.compraId) throw new Error("Compra não identificada.");

        // sem p_usuario_id: a RPC usa auth.uid()
        const { data, error: rpcError } = await supabase.rpc("estornar_recebimento", {
          p_empresa_id: empresaId,
          p_compra_id: params.compraId,
        });

        if (rpcError) {
          const msg = rpcError.message || "Não foi possível estornar o recebimento.";
          setError(msg);
          return { success: false, error: msg };
        }

        const resultado = (data ?? {}) as RpcResultado;
        if (!resultado.success) {
          // `error` do jsonb já é a mensagem humana (ex.: conta paga,
          // movimentação posterior) — exibimos integralmente.
          const msg = resultado.error || "Não foi possível estornar o recebimento.";
          setError(msg);
          return { success: false, error: msg, detail: resultado.detail };
        }

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao estornar o recebimento";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { estornar, loading, error };
}
