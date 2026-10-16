import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface MoverOportunidadeResult {
  success: boolean;
  error?: string;
}

export interface UseMoverOportunidadeReturn {
  moverOportunidade: (oportunidadeId: string, novoEstagio: string) => Promise<MoverOportunidadeResult>;
  carregando: boolean;
}

/**
 * Move a oportunidade para outra etapa: update `estagio` (nome da etapa) +
 * log em crm_atividades (tipo "movimentacao", descricao "Movida para <etapa>").
 * `estagio_desde` é mantido pela trigger do banco — nunca setar manualmente.
 * Falha no log não derruba a movimentação (update já confirmado).
 */
export function useMoverOportunidade(): UseMoverOportunidadeReturn {
  const { empresa, session } = useAuth();
  const [carregando, setCarregando] = useState(false);

  const moverOportunidade = useCallback(
    async (oportunidadeId: string, novoEstagio: string): Promise<MoverOportunidadeResult> => {
      setCarregando(true);
      try {
        const empresaId = empresa?.id;
        if (!empresaId) {
          throw new Error(
            "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
          );
        }
        if (!novoEstagio) throw new Error("Etapa de destino inválida.");

        const { error } = await supabase
          .from("crm_oportunidades")
          .update({ estagio: novoEstagio })
          .eq("id", oportunidadeId)
          .eq("empresa_id", empresaId);
        if (error) throw error;

        const { error: logError } = await supabase.from("crm_atividades").insert({
          empresa_id: empresaId,
          oportunidade_id: oportunidadeId,
          tipo: "movimentacao",
          descricao: `Movida para ${novoEstagio}`,
          criado_por: session?.user?.id ?? null,
        });
        if (logError) {
          console.warn("[useMoverOportunidade] Falha ao gravar log de movimentação:", logError.message);
        }

        return { success: true };
      } catch (err) {
        console.error("[useMoverOportunidade] Erro:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao mover negociação",
        };
      } finally {
        setCarregando(false);
      }
    },
    [empresa, session]
  );

  return { moverOportunidade, carregando };
}
