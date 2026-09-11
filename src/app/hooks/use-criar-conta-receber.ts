import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface CriarContaReceberParams {
  cliente_id?: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  forma_pagamento?: string;
  observacoes?: string;
}

export interface CriarContaReceberResult {
  success: boolean;
  id?: string;
  error?: string;
}

export function useCriarContaReceber() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarConta = useCallback(
    async (params: CriarContaReceberParams): Promise<CriarContaReceberResult> => {
      setLoading(true);
      setError(null);

      try {
        // SEM fallback para "primeira empresa". Sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;

        if (!empresaId) {
          throw new Error("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
        }

        const { data, error: insertError } = await supabase
          .from("me_contas_receber")
          .insert({
            empresa_id: empresaId,
            cliente_id: params.cliente_id || null,
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
