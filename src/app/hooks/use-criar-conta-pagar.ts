import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface CriarContaPagarParams {
  fornecedor_id?: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  forma_pagamento?: string;
  observacoes?: string;
}

export interface CriarContaPagarResult {
  success: boolean;
  id?: string;
  error?: string;
}

export function useCriarContaPagar() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarConta = useCallback(
    async (params: CriarContaPagarParams): Promise<CriarContaPagarResult> => {
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

        const { data, error: insertError } = await supabase
          .from("me_contas_pagar")
          .insert({
            empresa_id: empresaId,
            fornecedor_id: params.fornecedor_id || null,
            descricao: params.descricao,
            valor: params.valor,
            data_vencimento: params.data_vencimento,
            forma_pagamento: params.forma_pagamento || null,
            observacoes: params.observacoes || null,
            status: "pendente",
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        return { success: true, id: data?.id };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao criar conta";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { criarConta, loading, error };
}
