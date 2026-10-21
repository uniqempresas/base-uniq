/**
 * Estorno de Ordem de Produção (Fase 4a — SPEC-Producao-EstornoOP §4).
 *
 * Única escrita: RPC `estornar_producao(p_empresa_id, p_ordem_id)` —
 * SECURITY DEFINER, transacional. `p_usuario_id` NÃO é enviado: a RPC resolve
 * `auth.uid()` sozinha. A RPC devolve os insumos consumidos (quantidade real de
 * `est_ordem_producao_item`), dá saída no acabado, grava movimentações de
 * compensação motivo 'Estorno' no extrato (nada é apagado) e marca a OP
 * ESTORNADA — tudo em uma transação. O app NÃO toca nessas tabelas aqui.
 *
 * Erros: jsonb `{success:false, error, detail}` (shape de `registrar_producao`).
 * `error` já é a mensagem humana pronta (INVALID_STATUS / ACABADO_INSUFICIENTE
 * vêm completas) — o front exibe `error` integralmente, sem sanitizar.
 */
import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface EstornarProducaoParams {
  ordemId: string;
}

export interface EstornarProducaoResult {
  success: boolean;
  error?: string;
  detail?: string;
}

interface RpcResultado {
  success?: boolean;
  ordem_id?: string;
  itens_devolvidos?: number | string;
  error?: string;
  detail?: string;
}

export function useEstornarProducao() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estornar = useCallback(
    async (params: EstornarProducaoParams): Promise<EstornarProducaoResult> => {
      setLoading(true);
      setError(null);

      try {
        const empresaId = empresa?.id;
        if (!empresaId) {
          throw new Error(
            "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
          );
        }
        if (!params.ordemId) throw new Error("Produção não identificada.");

        // sem p_usuario_id: a RPC usa auth.uid()
        const { data, error: rpcError } = await supabase.rpc("estornar_producao", {
          p_empresa_id: empresaId,
          p_ordem_id: params.ordemId,
        });

        if (rpcError) {
          const msg = rpcError.message || "Não foi possível estornar a produção.";
          setError(msg);
          return { success: false, error: msg };
        }

        const resultado = (data ?? {}) as RpcResultado;
        if (!resultado.success) {
          // `error` do jsonb já é a mensagem humana (ex.: acabado insuficiente,
          // já estornada) — exibimos integralmente.
          const msg = resultado.error || "Não foi possível estornar a produção.";
          setError(msg);
          return { success: false, error: msg, detail: resultado.detail };
        }

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao estornar a produção";
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
