import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface ConfirmarPagamentoParams {
  vendaId: string;
  valor: number;
  clienteId?: string;
  formaPagamento?: string;
}

export interface ConfirmarPagamentoResult {
  success: boolean;
  error?: string;
}

/**
 * Confirma o pagamento de um pedido/venda persistindo em me_contas_receber.
 * Se já existir conta vinculada (venda_id), marca como paga; senão cria.
 * Assim o pedido e o Financeiro → Contas a Receber compartilham a mesma fonte.
 */
export function useConfirmarPagamento() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmarPagamento = useCallback(
    async (params: ConfirmarPagamentoParams): Promise<ConfirmarPagamentoResult> => {
      setLoading(true);
      setError(null);

      try {
        let empresaId = empresa?.id;

        if (!empresaId) {
          const { data: empresas } = await supabase
            .from("me_empresa")
            .select("id")
            .limit(1);

          if (empresas && empresas.length > 0) {
            empresaId = empresas[0].id;
          }
        }

        if (!empresaId) {
          throw new Error("Empresa não encontrada");
        }

        const hoje = new Date().toISOString().split("T")[0];

        // 1. Procura conta a receber já vinculada a esta venda
        const { data: contasPorVenda } = await supabase
          .from("me_contas_receber")
          .select("id")
          .eq("venda_id", params.vendaId)
          .eq("empresa_id", empresaId)
          .limit(1);

        let contaId = contasPorVenda && contasPorVenda.length > 0 ? contasPorVenda[0].id : null;

        // 2. Sem vínculo: procura conta pendente da mesma empresa e mesmo valor
        //    (ex.: venda contabilizada sem venda_id preenchido) e vincula agora
        if (!contaId) {
          const { data: contasPendentes } = await supabase
            .from("me_contas_receber")
            .select("id")
            .eq("empresa_id", empresaId)
            .eq("venda_id", null)
            .eq("status", "pendente")
            .eq("valor", params.valor)
            .limit(1);

          if (contasPendentes && contasPendentes.length > 0) {
            contaId = contasPendentes[0].id;

            // Vincula a venda à conta encontrada
            const { error: vinculoError } = await supabase
              .from("me_contas_receber")
              .update({ venda_id: params.vendaId })
              .eq("id", contaId);

            if (vinculoError) throw vinculoError;
          }
        }

        if (contaId) {
          // 3a. Conta existe → marca como paga
          const { error: updateError } = await supabase
            .from("me_contas_receber")
            .update({
              status: "pago",
              data_pagamento: hoje,
              valor_pago: params.valor,
            })
            .eq("id", contaId);

          if (updateError) throw updateError;
        } else {
          // 3b. Sem conta → cria já paga, vinculada à venda
          const { error: insertError } = await supabase
            .from("me_contas_receber")
            .insert({
              empresa_id: empresaId,
              venda_id: params.vendaId,
              cliente_id: params.clienteId || null,
              descricao: "Pagamento confirmado do pedido",
              valor: params.valor,
              valor_pago: params.valor,
              data_vencimento: hoje,
              data_pagamento: hoje,
              forma_pagamento: params.formaPagamento || null,
              status: "pago",
            });

          if (insertError) throw insertError;
        }

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao confirmar pagamento";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { confirmarPagamento, loading, error };
}