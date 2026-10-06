/**
 * Cancelamento de compra (Produção Fase 2 — SPEC-Producao-BOM-Fase2 §4).
 *
 * UPDATE simples `est_compra.status = 'CANCELADO'` (literal maiúsculo do CHECK),
 * permitido SÓ a partir de PENDENTE (validação client — nada movimenta estoque,
 * custo ou contas). Dupla filter por id + empresa_id (isolamento de tenant).
 */
import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { ESTADO_COMPRA, type StatusCompra } from "../types/producao";

export interface CancelarCompraParams {
  compraId: string;
  /** status atual da compra — a UI só chama com o que está na tela */
  statusAtual: StatusCompra;
}

export interface CancelarCompraResult {
  success: boolean;
  error?: string;
}

export function useCancelarCompra() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelarCompra = useCallback(
    async (params: CancelarCompraParams): Promise<CancelarCompraResult> => {
      setLoading(true);
      setError(null);

      try {
        const empresaId = empresa?.id;
        if (!empresaId) {
          throw new Error(
            "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
          );
        }
        if (params.statusAtual !== ESTADO_COMPRA.PENDENTE) {
          throw new Error("Só é possível cancelar compra pendente — recebida ou cancelada não muda mais.");
        }

        const { error: updateError } = await supabase
          .from("est_compra")
          .update({ status: ESTADO_COMPRA.CANCELADO })
          .eq("id", params.compraId)
          .eq("empresa_id", empresaId)
          .eq("status", ESTADO_COMPRA.PENDENTE);

        if (updateError) throw updateError;

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao cancelar compra";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { cancelarCompra, loading, error };
}
