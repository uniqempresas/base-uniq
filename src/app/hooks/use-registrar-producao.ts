/**
 * Registro de Ordem de Produção (Produção Fase 3 — SPEC-Producao-BOM-Fase3 §2.2/§4).
 *
 * Única escrita do fluxo de produção: RPC `registrar_producao` (SECURITY DEFINER),
 * transacional: valida estoque de cada insumo, baixa insumos + movimentações
 * 'saida/Produção', entrada do acabado com custo médio móvel + 'entrada/Produção',
 * grava `est_ordem_producao` + itens. O app NÃO manipula essas tabelas aqui.
 *
 * Erros: jsonb `{success:false, error, detail}` (padrão F2/registrar_venda).
 * `detail='ESTOQUE_INSUFICIENTE'` traz a mensagem pronta em `error` — mostramos
 * `error` sem emendar o marcador técnico. SQLSTATE segue o mapa de
 * `use-receber-compra.ts`.
 */
import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface RegistrarProducaoParams {
  /** `me_produto.id` do pai (integer no banco; string vinda da UI) */
  produtoPaiId: string;
  /** lote > 0 (unidades do acabamento) */
  quantidade: number;
  /** data de negócio (yyyy-mm-dd) */
  data: string;
  observacao?: string;
}

export interface RegistrarProducaoResult {
  success: boolean;
  ordemId?: string;
  custoTotal?: number;
  custoUnit?: number;
  itensBaixados?: number;
  error?: string;
}

interface RpcResultado {
  success?: boolean;
  ordem_id?: string | null;
  custo_total?: number | string;
  custo_unit?: number | string;
  itens_baixados?: number | string;
  error?: string;
  detail?: string;
}

/** Erro de constraint devolvido pelo Postgres (RPC é SECURITY DEFINER: o código chega cru). */
function mensagemDeConstraint(codigo: string | undefined, padrao: string): string {
  switch (codigo) {
    case "23503":
      return "Produto ou insumo não encontrado nesta empresa. Atualize a lista e tente de novo.";
    case "23514":
      // rede de segurança: CHECK me_produto_estoque_nao_negativo
      return "Estoque insuficiente de algum insumo — nada foi alterado. Ajuste a quantidade do lote.";
    case "42501":
    case "P0001":
      return "Sem permissão para registrar produção. Recarregue e tente novamente.";
    default:
      return padrao;
  }
}

export function useRegistrarProducao() {
  const { empresa, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarProducao = useCallback(
    async (params: RegistrarProducaoParams): Promise<RegistrarProducaoResult> => {
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
          throw new Error("Usuário não identificado. Faça login novamente para registrar a produção.");
        }
        if (!params.produtoPaiId || !Number.isInteger(Number(params.produtoPaiId))) {
          throw new Error("Produto pai inválido — salve o produto antes de produzir.");
        }
        if (!(params.quantidade > 0)) {
          throw new Error("A quantidade do lote precisa ser maior que zero.");
        }
        if (!params.data) {
          throw new Error("Informe a data da produção.");
        }

        const { data, error: rpcError } = await supabase.rpc("registrar_producao", {
          p_empresa_id: empresaId,
          p_produto_pai_id: Number(params.produtoPaiId),
          p_quantidade: params.quantidade,
          p_data_producao: params.data,
          p_usuario_id: user.id,
          p_observacao: params.observacao?.trim() || null,
        });

        if (rpcError) {
          const msg = mensagemDeConstraint(
            (rpcError as { code?: string }).code,
            rpcError.message || "Erro ao registrar a produção"
          );
          setError(msg);
          return { success: false, error: msg };
        }

        const resultado = (data ?? {}) as RpcResultado;
        if (!resultado.success) {
          // `error` do jsonb é a mensagem de negócio pronta (ex.: "Insufficient stock: …").
          // `detail='ESTOQUE_INSUFICIENTE'` é marcador técnico — não vai para a tela.
          const msg =
            [resultado.error, resultado.detail]
              .filter(Boolean)
              .filter((parte) => parte !== "ESTOQUE_INSUFICIENTE")
              .join(" — ") || "Não foi possível registrar a produção.";
          setError(msg);
          return { success: false, error: msg };
        }

        return {
          success: true,
          ordemId: resultado.ordem_id ?? undefined,
          custoTotal: Number(resultado.custo_total) || 0,
          custoUnit: Number(resultado.custo_unit) || 0,
          itensBaixados: Number(resultado.itens_baixados) || 0,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao registrar a produção";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa, user]
  );

  return { registrarProducao, loading, error };
}
