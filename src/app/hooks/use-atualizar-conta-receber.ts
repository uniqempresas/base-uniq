import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { StatusMovimentacao } from "../components/financeiro/mockData";
import { formaPagamentoParaBanco } from "../components/financeiro/mockData";

export interface AtualizarContaReceberParams {
  id: string;
  /** Nome do cliente — quando vier, find-or-create em me_cliente + grava cliente_id. */
  cliente?: string;
  cliente_id?: string;
  /** `null` LIMPA a categoria; `undefined` não mexe (update parcial). */
  categoriaId?: string | null;
  descricao?: string;
  valor?: number;
  data_vencimento?: string;
  forma_pagamento?: string;
  observacoes?: string;
  status?: StatusMovimentacao;
}

export interface ReceberContaParams {
  id: string;
  data_pagamento?: string;
  valor_pago?: number;
}

export interface AtualizarContaReceberResult {
  success: boolean;
  error?: string;
}

async function findOrCreateCliente(
  empresaId: string,
  nome: string
): Promise<string | null> {
  const nomeNormalizado = nome.trim().replace(/\s+/g, " ");
  if (!nomeNormalizado) return null;

  const { data: existente } = await supabase
    .from("me_cliente")
    .select("id")
    .eq("empresa_id", empresaId)
    .ilike("nome_cliente", nomeNormalizado)
    .maybeSingle();

  if (existente) return existente.id;

  const { data: novo, error: insertError } = await supabase
    .from("me_cliente")
    .insert({
      empresa_id: empresaId,
      nome_cliente: nomeNormalizado,
      origem: "manual",
      tags: [],
      telefone: null,
    })
    .select("id")
    .single();

  if (!insertError && novo) return novo.id;

  if (insertError?.code === "23505") {
    const { data: recuperado } = await supabase
      .from("me_cliente")
      .select("id")
      .eq("empresa_id", empresaId)
      .ilike("nome_cliente", nomeNormalizado)
      .maybeSingle();

    if (recuperado) return recuperado.id;
  }

  console.error("[useAtualizarContaReceber] find-or-create me_cliente falhou:", insertError);
  return null;
}

export function useAtualizarContaReceber() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarConta = useCallback(
    async (params: AtualizarContaReceberParams): Promise<AtualizarContaReceberResult> => {
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
        const updateData: Record<string, unknown> = {};

        // Cliente pelo NOME (formulário novo) → find-or-create + grava cliente_id
        if (params.cliente !== undefined && params.cliente.trim()) {
          const clienteId = await findOrCreateCliente(empresaId, params.cliente);
          if (clienteId) {
            updateData.cliente_id = clienteId;
          } else {
            // find-or-create falhou → não gravar cliente_id parcial/silenciosamente
            console.error("[useAtualizarContaReceber] cliente não resolvido; cliente_id mantido.");
          }
        } else if (params.cliente_id !== undefined) {
          updateData.cliente_id = params.cliente_id;
        }

        if (params.categoriaId !== undefined) updateData.categoria_id = params.categoriaId;
        if (params.descricao !== undefined) updateData.descricao = params.descricao;
        if (params.valor !== undefined) updateData.valor = params.valor;
        if (params.data_vencimento !== undefined) updateData.data_vencimento = params.data_vencimento;
        if (params.forma_pagamento !== undefined) {
          updateData.forma_pagamento = formaPagamentoParaBanco(params.forma_pagamento);
        }
        if (params.observacoes !== undefined) updateData.observacoes = params.observacoes;
        if (params.status !== undefined) updateData.status = params.status;

        const { error: updateError } = await supabase
          .from("me_contas_receber")
          .update(updateData)
          .eq("id", params.id)
          .eq("empresa_id", empresaId);

        if (updateError) throw updateError;

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao atualizar conta";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  const receberConta = useCallback(
    async (params: ReceberContaParams): Promise<AtualizarContaReceberResult> => {
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
        const dataPagamento = params.data_pagamento || new Date().toISOString().split("T")[0];

        // Primeiro busca o valor original se não informado
        let valorPago = params.valor_pago;
        if (valorPago === undefined) {
          const { data: conta } = await supabase
            .from("me_contas_receber")
            .select("valor")
            .eq("id", params.id)
            .eq("empresa_id", empresaId)
            .single();

          valorPago = conta?.valor || 0;
        }

        const { error: updateError } = await supabase
          .from("me_contas_receber")
          .update({
            status: "pago",
            data_pagamento: dataPagamento,
            valor_pago: valorPago,
          })
          .eq("id", params.id)
          .eq("empresa_id", empresaId);

        if (updateError) throw updateError;

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao receber conta";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { atualizarConta, receberConta, loading, error };
}