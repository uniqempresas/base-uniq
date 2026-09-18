import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface ExcluirPedidoParams {
  vendaId: string;
  motivo?: string;
}

export interface ExcluirPedidoResult {
  success: boolean;
  error?: string;
  code?: string;
  estoqueDevolvido?: boolean;
}

/**
 * Contrato de retorno da RPC fn_excluir_pedido_cancelado (SPEC §2.2):
 * { success, id_venda, estoque_devolvido, itens_restaurados } | { success, error, code }
 */
interface RpcResult {
  success: boolean;
  id_venda?: string;
  estoque_devolvido?: boolean;
  itens_restaurados?: number;
  code?: string;
  error?: string;
}

/** Tabela SPEC §2.2 / WIRE §6.2 — mensagens amigáveis por code da RPC. */
const MENSAGENS_POR_CODE: Record<string, string> = {
  NAO_ENCONTRADO: "Pedido não encontrado.",
  JA_EXCLUIDO: "Este pedido já foi excluído.",
  STATUS_INVALIDO: "Só é possível excluir pedido com status Cancelado.",
  PAGAMENTO_REGISTRADO:
    "Este pedido tem pagamento registrado. Excluir apagaria dinheiro que entrou de verdade.",
};

function mensagemParaCode(code: string | undefined, erroBanco: string | undefined): string {
  if (code && MENSAGENS_POR_CODE[code]) return MENSAGENS_POR_CODE[code];
  if (erroBanco) return `${erroBanco} Tente novamente.`;
  return "Não foi possível excluir o pedido. Tente novamente.";
}

export function useExcluirPedido(): {
  excluirPedido: (p: ExcluirPedidoParams) => Promise<ExcluirPedidoResult>;
  loading: boolean;
  error: string | null;
} {
  const { empresa, perfil } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const excluirPedido = useCallback(
    async ({ vendaId, motivo }: ExcluirPedidoParams): Promise<ExcluirPedidoResult> => {
      setLoading(true);
      setError(null);

      // SEM tenant autenticado, NÃO chamar o banco (regra de isolamento de tenant).
      const empresaId = empresa?.id;
      if (!empresaId) {
        const errorMessage =
          "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.";
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }

      try {
        const { data, error: rpcError } = await supabase.rpc("fn_excluir_pedido_cancelado", {
          p_empresa_id: empresaId,
          p_venda_id: vendaId,
          p_usuario_id: perfil?.id ?? null,
          p_motivo: motivo?.trim() || null,
        });

        if (rpcError) throw rpcError;

        const resultado = (data ?? {}) as RpcResult;

        if (resultado.success) {
          return {
            success: true,
            estoqueDevolvido: resultado.estoque_devolvido === true,
          };
        }

        const mensagem = mensagemParaCode(resultado.code, resultado.error);
        setError(mensagem);
        return {
          success: false,
          error: mensagem,
          code: resultado.code,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao excluir o pedido";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [empresa, perfil]
  );

  return {
    excluirPedido,
    loading,
    error,
  };
}