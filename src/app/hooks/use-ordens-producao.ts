/**
 * Histórico de Ordens de Produção (Produção Fase 3 — SPEC-Producao-BOM-Fase3 §4).
 *
 * - Leitura de `est_ordem_producao` com embed do pai (`me_produto(nome_produto)`
 *   via FK `produto_pai_id` — FK única, sem hint de desambiguação).
 * - `produtoPaiId` definido → `.eq("produto_pai_id")`; undefined → lista vazia
 *   (mesma disciplina de `use-ficha-tecnica.ts`: sem pai, nada a consultar).
 * - **Sem sessão / sem empresa:** lista vazia — OP é funcionalidade nova e NÃO
 *   tem fallback mock.
 * - `loading` vira true só na PRIMEIRA carga (refetch não "pisca" a aba).
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { OrdemProducao } from "../types/producao";

interface DBOrdemProducao {
  id: string;
  empresa_id: string;
  produto_pai_id: number;
  quantidade: string | number;
  custo_total: string | number;
  custo_unit: string | number;
  usuario_id: string | null;
  data_producao: string;
  observacao: string | null;
  created_at: string | null;
  /** Embed do PostgREST: est_ordem_producao.produto_pai_id → me_produto */
  me_produto: { nome_produto: string | null } | null;
}

/** `numeric` pode chegar como string no client; sempre Number() defensivo. */
function num(valor: string | number | null | undefined): number {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function mapOrdem(db: DBOrdemProducao): OrdemProducao {
  return {
    id: db.id,
    produtoPaiId: String(db.produto_pai_id),
    produtoNome: db.me_produto?.nome_produto || undefined,
    quantidade: num(db.quantidade),
    custoTotal: num(db.custo_total),
    custoUnit: num(db.custo_unit),
    dataProducao: db.data_producao,
    observacao: db.observacao || null,
  };
}

export interface UseOrdensProducaoReturn {
  ordens: OrdemProducao[];
  loading: boolean;
  error: string | null;
  recarregar: () => void;
}

export function useOrdensProducao(produtoPaiId?: string): UseOrdensProducaoReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [ordens, setOrdens] = useState<OrdemProducao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const primeiraCarga = useRef(true);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    if (primeiraCarga.current) setLoading(true);
    setError(null);

    // Sem sessão = modo demo: OP não tem mock → lista vazia (SPEC §1)
    if (!session) {
      setOrdens([]);
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    const empresaId = empresa?.id;
    if (!empresaId) {
      setOrdens([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    // Sem pai (criação) ou id não-integer (mock "p1") — nada a ler (padrão da ficha)
    if (!produtoPaiId || !Number.isInteger(Number(produtoPaiId))) {
      setOrdens([]);
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    try {
      const { data, error: ordensError } = await supabase
        .from("est_ordem_producao")
        .select("*, me_produto(nome_produto)")
        .eq("empresa_id", empresaId)
        .eq("produto_pai_id", Number(produtoPaiId))
        .order("data_producao", { ascending: false });

      if (ordensError) throw ordensError;

      setOrdens(((data as unknown as DBOrdemProducao[] | null) || []).map(mapOrdem));
    } catch (err) {
      console.error("[useOrdensProducao] Erro ao carregar as ordens de produção:", err);
      setOrdens([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar o histórico de produção");
    } finally {
      setLoading(false);
      primeiraCarga.current = false;
    }
  }, [empresa, session, authLoading, produtoPaiId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { ordens, loading, error, recarregar: carregarDados };
}
