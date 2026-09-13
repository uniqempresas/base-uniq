import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface AtualizarClienteParams {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  tags?: string[];
}

export interface AtualizarClienteResult {
  success: boolean;
  error?: string;
}

export function useAtualizarCliente() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarCliente = useCallback(
    async (params: AtualizarClienteParams): Promise<AtualizarClienteResult> => {
      setLoading(true);
      setError(null);

      try {
        // SEM fallback cego: sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;
        if (!empresaId) {
          throw new Error("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
        }

        const nome = params.nome.trim();
        if (!nome) {
          throw new Error("Informe o nome do cliente.");
        }

        const { error: updateError } = await supabase
          .from("me_cliente")
          .update({
            nome_cliente: nome,
            telefone: params.telefone?.trim() || null,
            email: params.email?.trim() || null,
            tags: params.tags || [],
            // atualizado_em é atualizado por trigger no banco
          })
          .eq("id", params.id)
          .eq("empresa_id", empresaId); // isolamento por tenant obrigatório

        if (updateError) throw updateError;

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { atualizarCliente, loading, error };
}