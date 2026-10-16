import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface ExcluirOportunidadeResult {
  success: boolean;
  error?: string;
}

export interface UseExcluirOportunidadeReturn {
  excluirOportunidade: (id: string) => Promise<ExcluirOportunidadeResult>;
  carregando: boolean;
}

/** Delete de crm_oportunidades por id, com guarda do tenant da empresa logada. */
export function useExcluirOportunidade(): UseExcluirOportunidadeReturn {
  const { empresa } = useAuth();
  const [carregando, setCarregando] = useState(false);

  const excluirOportunidade = useCallback(
    async (id: string): Promise<ExcluirOportunidadeResult> => {
      setCarregando(true);
      try {
        const empresaId = empresa?.id;
        if (!empresaId) {
          throw new Error(
            "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
          );
        }

        const { error } = await supabase
          .from("crm_oportunidades")
          .delete()
          .eq("id", id)
          .eq("empresa_id", empresaId);
        if (error) throw error;

        return { success: true };
      } catch (err) {
        console.error("[useExcluirOportunidade] Erro:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao excluir negociação",
        };
      } finally {
        setCarregando(false);
      }
    },
    [empresa]
  );

  return { excluirOportunidade, carregando };
}
