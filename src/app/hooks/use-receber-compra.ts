/**
 * Recebimento de compra (Produção Fase 2 — SPEC-Producao-BOM-Fase2 §2.2/§4).
 *
 * Única escrita do fluxo de receber: RPC `receber_compra` (SECURITY DEFINER),
 * que em uma transação faz entrada no estoque (com conversão), custo médio
 * ponderado móvel, `est_movimentacao`, conta a pagar (`compra_id`) e compra
 * → RECEBIDO. O app NÃO manipula nenhuma dessas tabelas aqui.
 *
 * Erros: o jsonb devolve `{success:false, error, detail}` (padrão
 * registrar_venda) — mostramos `error`. SQLSTATE de erro de RPC segue o mapa
 * de `use-ficha-tecnica.ts:50-64`.
 */
import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface ReceberCompraParams {
  compraId: string;
  /** data de negócio do recebimento (yyyy-mm-dd) */
  dataRecebimento: string;
  /** vencimento da conta a pagar criada (yyyy-mm-dd) */
  dataVencimento: string;
}

export interface CustoRetornado {
  produtoId: string;
  qtdEstoque: number;
  custoMedio: number;
}

export interface ReceberCompraResult {
  success: boolean;
  movimentacoes?: number;
  contaPagarId?: string | null;
  valorTotal?: number;
  custos?: CustoRetornado[];
  error?: string;
}

interface RpcResultado {
  success?: boolean;
  movimentacoes?: number | string;
  conta_pagar_id?: string | null;
  valor_total?: number | string;
  custos?:
    | { produto_id?: number | string; qtd_estoque?: number | string; custo_medio?: number | string }[]
    | null;
  error?: string;
  detail?: string;
}

/** Erro de constraint devolvido pelo Postgres (RPC é SECURITY DEFINER: o código chega cru). */
function mensagemDeConstraint(codigo: string | undefined, padrao: string): string {
  switch (codigo) {
    case "23503":
      return "Insumo não encontrado nesta empresa. Atualize a lista de produtos e tente de novo.";
    case "23514":
      return "A compra tem dados inválidos (quantidade ou valor) — revise os itens antes de receber.";
    case "42501":
    case "P0001":
      return "Sem permissão para receber esta compra. Recarregue e tente novamente.";
    default:
      return padrao;
  }
}

export function useReceberCompra() {
  const { empresa, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const receberCompra = useCallback(
    async (params: ReceberCompraParams): Promise<ReceberCompraResult> => {
      setLoading(true);
      setError(null);

      try {
        const empresaId = empresa?.id;
        if (!empresaId) {
          throw new Error(
            "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
          );
        }
        if (!user?.id) {
          throw new Error("Usuário não identificado. Faça login novamente para receber a compra.");
        }
        if (!params.compraId) throw new Error("Compra não identificada.");
        if (!params.dataRecebimento) throw new Error("Informe a data de recebimento.");
        if (!params.dataVencimento) throw new Error("Informe a data de vencimento da conta.");

        const { data, error: rpcError } = await supabase.rpc("receber_compra", {
          p_empresa_id: empresaId,
          p_compra_id: params.compraId,
          p_data_recebimento: params.dataRecebimento,
          p_data_vencimento: params.dataVencimento,
          p_usuario_id: user.id,
        });

        if (rpcError) {
          const msg = mensagemDeConstraint(
            (rpcError as { code?: string }).code,
            rpcError.message || "Erro ao receber a compra"
          );
          setError(msg);
          return { success: false, error: msg };
        }

        const resultado = (data ?? {}) as RpcResultado;
        if (!resultado.success) {
          // `error` do jsonb é a mensagem de negócio da RPC (ex.: "compra já foi recebida")
          const msg =
            [resultado.error, resultado.detail].filter(Boolean).join(" — ") ||
            "Não foi possível receber a compra.";
          setError(msg);
          return { success: false, error: msg };
        }

        const custos: CustoRetornado[] = (resultado.custos || []).map((c) => ({
          produtoId: String(c.produto_id ?? ""),
          qtdEstoque: Number(c.qtd_estoque) || 0,
          custoMedio: Number(c.custo_medio) || 0,
        }));

        return {
          success: true,
          movimentacoes: Number(resultado.movimentacoes) || 0,
          contaPagarId: resultado.conta_pagar_id ?? null,
          valorTotal: Number(resultado.valor_total) || 0,
          custos,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao receber a compra";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa, user]
  );

  return { receberCompra, loading, error };
}
