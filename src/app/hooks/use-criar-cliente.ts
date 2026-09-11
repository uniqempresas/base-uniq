import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface CriarClienteParams {
  nome: string;
  telefone?: string;
  email?: string;
  tags?: string[];
}

export interface CriarClienteResult {
  success: boolean;
  id?: string;
  error?: string;
}

export function useCriarCliente() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarCliente = useCallback(
    async (params: CriarClienteParams): Promise<CriarClienteResult> => {
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

        const { data, error: insertError } = await supabase
          .from("crm_leads")
          .insert({
            empresa_id: empresaId,
            nome,
            telefone: params.telefone?.trim() || null,
            email: params.email?.trim() || null,
            status: "novo",
            origem: "manual",
            ultima_interacao: new Date().toISOString(),
            tags: params.tags || [],
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        return {
          success: true,
          id: data?.id,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao criar cliente";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return {
    criarCliente,
    loading,
    error,
  };
}