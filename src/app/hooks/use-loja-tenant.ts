import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { AppearanceBrutoLoja, LojaTenant, StoreConfigLoja } from "../types/loja";

interface DBEmpresa {
  id: string;
  slug: string;
  nome_fantasia: string | null;
  logo_url: string | null;
  telefone: string | null;
  store_config: unknown;
  appearance: unknown;
}

export interface UseLojaTenantReturn {
  tenant: LojaTenant | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Resolve o tenant por slug (`me_empresa`).
 * SEM fallback mock — slug inexistente = tela "Loja não encontrada".
 */
export function useLojaTenant(slug: string | undefined): UseLojaTenantReturn {
  const [tenant, setTenant] = useState<LojaTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!slug) {
      setTenant(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from("me_empresa")
        .select("id, slug, nome_fantasia, logo_url, telefone, store_config, appearance")
        .eq("slug", slug)
        .maybeSingle();

      if (err) throw err;

      const db = data as DBEmpresa | null;
      setTenant(
        db
          ? {
              empresaId: db.id,
              slug: db.slug,
              nomeFantasia: db.nome_fantasia || "Nossa loja",
              logoUrl: db.logo_url,
              whatsapp: db.telefone,
              // jsonb pode vir null/inesperado — a vitrine normaliza na leitura
              storeConfig: (db.store_config as StoreConfigLoja | null) || {},
              appearance: (db.appearance as AppearanceBrutoLoja | null) || {},
            }
          : null
      );
    } catch (e) {
      console.error("[useLojaTenant] Erro ao resolver a loja:", e);
      setError(e instanceof Error ? e.message : "Erro ao carregar a loja");
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { tenant, loading, error, refetch: carregar };
}