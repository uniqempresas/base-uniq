import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { OportunidadeInput } from "../types/crm";

export interface SalvarOportunidadeResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface UseSalvarOportunidadeReturn {
  salvarOportunidade: (input: OportunidadeInput) => Promise<SalvarOportunidadeResult>;
  carregando: boolean;
}

/**
 * Cria (insert) ou atualiza (update) crm_oportunidades.
 * Ao criar, o `estagio` vem do chamador — a página passa o NOME da 1ª etapa
 * de crm_etapas da empresa (nunca id de mock). `estagio_desde` é mantido
 * por trigger no banco.
 */
export function useSalvarOportunidade(): UseSalvarOportunidadeReturn {
  const { empresa } = useAuth();
  const [carregando, setCarregando] = useState(false);

  const salvarOportunidade = useCallback(
    async (input: OportunidadeInput): Promise<SalvarOportunidadeResult> => {
      setCarregando(true);
      try {
        // SEM fallback cego: sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;
        if (!empresaId) {
          throw new Error(
            "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
          );
        }

        const titulo = input.titulo.trim();
        if (!titulo) throw new Error("Informe o título da negociação.");
        if (!input.estagio) throw new Error("Defina a etapa (estagio) da negociação.");

        const valores = {
          cliente_id: input.clienteId || null,
          titulo,
          valor: Number.isFinite(input.valor) ? input.valor : 0,
          estagio: input.estagio,
          data_fechamento: input.dataFechamento || null,
        };

        if (input.id) {
          const { error } = await supabase
            .from("crm_oportunidades")
            .update(valores)
            .eq("id", input.id)
            .eq("empresa_id", empresaId);
          if (error) throw error;
          return { success: true, id: input.id };
        }

        const { data, error } = await supabase
          .from("crm_oportunidades")
          .insert({ ...valores, empresa_id: empresaId })
          .select("id")
          .single();
        if (error) throw error;
        return { success: true, id: data?.id };
      } catch (err) {
        console.error("[useSalvarOportunidade] Erro:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao salvar negociação",
        };
      } finally {
        setCarregando(false);
      }
    },
    [empresa]
  );

  return { salvarOportunidade, carregando };
}
