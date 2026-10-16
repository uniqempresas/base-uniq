import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { EtapaDB, NegociacaoCardView, OportunidadeDB, PipelineEtapa } from "../types/crm";

export const COR_NEUTRA = "#627271";

/** `cor` da coluna: hex se começar com "#", senão fallback neutro (SPEC §2) */
export function normalizarCor(cor: string | null | undefined): string {
  return cor && cor.startsWith("#") ? cor : COR_NEUTRA;
}

/** Etapa terminal (ganho/perdido) — sempre por nome case-insensitive, nunca por id de mock */
export function isEtapaTerminal(nome: string): boolean {
  const n = (nome || "").toLowerCase();
  return n.includes("ganho") || n.includes("perdido");
}

export function isEtapaGanho(nome: string): boolean {
  return (nome || "").toLowerCase().includes("ganho");
}

export function isEtapaPerdido(nome: string): boolean {
  return (nome || "").toLowerCase().includes("perdido");
}

/**
 * Probabilidade derivada da posição da etapa na lista da empresa (SPEC §2):
 * "ganho" → 100, "perdido" → 0; pos < 6 → min(90, pos*18) (aproxima 10/25/50/70/90);
 * etapas intermediárias além da 5ª → teto de 90.
 */
export function probabilidadePorPosicao(nome: string, posicao: number): number {
  if (isEtapaGanho(nome)) return 100;
  if (isEtapaPerdido(nome)) return 0;
  if (posicao < 6) return Math.min(90, Math.max(10, Math.round(posicao * 18)));
  return 90;
}

export function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(id: string): string {
  const colors = ["#8B5CF6", "#0EA5E9", "#F59E0B", "#10B981", "#EC4899", "#6366F1", "#14B8A6"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function diasDesde(iso: string | null): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

function formatarDataBR(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export interface UsePipelineReturn {
  etapas: PipelineEtapa[];
  oportunidades: NegociacaoCardView[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

/**
 * Carrega crm_etapas (order posicao) + crm_oportunidades da empresa logada e
 * junta o nome do cliente (me_cliente) no cliente — sem depender de embed/FK
 * do PostgREST. Padrão de acesso idêntico a use-clientes.ts.
 */
export function usePipeline(): UsePipelineReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [etapas, setEtapas] = useState<PipelineEtapa[]>([]);
  const [oportunidades, setOportunidades] = useState<NegociacaoCardView[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setCarregando(true);
    setErro(null);

    // Pipeline é dados reais por definição (SPEC): sem sessão/empresa não há
    // tenant para consultar — nunca consultar outro tenant nem cair em mock.
    const empresaId = empresa?.id;
    if (!session || !empresaId) {
      setEtapas([]);
      setOportunidades([]);
      setErro(
        !session
          ? "Faça login para visualizar o pipeline com dados reais da sua empresa."
          : "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
      );
      setCarregando(false);
      return;
    }

    try {
      const [etapasRes, oppsRes, clientesRes] = await Promise.all([
        supabase
          .from("crm_etapas")
          .select("id, empresa_id, nome, posicao, cor, fixa")
          .eq("empresa_id", empresaId)
          .order("posicao", { ascending: true }),
        supabase
          .from("crm_oportunidades")
          .select(
            "id, empresa_id, cliente_id, lead_id, titulo, valor, estagio, data_fechamento, created_at, estagio_desde, atualizado_em"
          )
          .eq("empresa_id", empresaId)
          .order("created_at", { ascending: false }),
        supabase.from("me_cliente").select("id, nome_cliente").eq("empresa_id", empresaId),
      ]);

      if (etapasRes.error) throw etapasRes.error;
      if (oppsRes.error) throw oppsRes.error;

      // Falha na lista de clientes não derruba o pipeline — nomes caem em "Sem cliente".
      if (clientesRes.error) {
        console.warn("[usePipeline] Erro ao carregar clientes para join:", clientesRes.error.message);
      }

      const etapasNorm: PipelineEtapa[] = ((etapasRes.data as EtapaDB[] | null) ?? []).map((e, idx) => {
        const posicao = e.posicao ?? idx + 1;
        return {
          id: e.id,
          nome: e.nome,
          label: e.nome,
          posicao,
          cor: normalizarCor(e.cor),
          fixa: e.fixa ?? false,
          probabilidade: probabilidadePorPosicao(e.nome, posicao),
        };
      });

      const mapaClientes = new Map<string, string>();
      for (const c of (clientesRes.data as { id: string; nome_cliente: string | null }[] | null) ?? []) {
        mapaClientes.set(c.id, c.nome_cliente || "Sem nome");
      }
      const mapaProbabilidade = new Map(etapasNorm.map((e) => [e.nome, e.probabilidade]));

      // filtra duplicado por id (defensivo)
      const vistos = new Set<string>();
      const opps: NegociacaoCardView[] = [];
      for (const row of (oppsRes.data as OportunidadeDB[] | null) ?? []) {
        if (vistos.has(row.id)) continue;
        vistos.add(row.id);

        const estagio = row.estagio ?? (etapasNorm[0]?.nome ?? "");
        const clienteNome = (row.cliente_id ? mapaClientes.get(row.cliente_id) : undefined) || "Sem cliente";
        const dias = diasDesde(row.estagio_desde ?? row.created_at);

        opps.push({
          id: row.id,
          titulo: row.titulo || "Sem título",
          clienteId: row.cliente_id ?? null,
          clienteNome,
          clienteInitials: getInitials(clienteNome),
          clienteColor: getAvatarColor(row.cliente_id ?? row.id),
          valor: Number(row.valor ?? 0) || 0,
          etapa: estagio,
          probabilidade: mapaProbabilidade.get(estagio) ?? 10,
          dataFechamento: formatarDataBR(row.data_fechamento),
          dataFechamentoISO: row.data_fechamento,
          proximaAcao: "—",
          tags: [],
          diasNaEtapa: dias,
          atrasado: dias >= 7 && !isEtapaTerminal(estagio),
          estagioDesde: row.estagio_desde ?? row.created_at,
        });
      }

      setEtapas(etapasNorm);
      setOportunidades(opps);
    } catch (err) {
      console.error("[usePipeline] Erro ao buscar dados reais:", err);
      setEtapas([]);
      setOportunidades([]);
      setErro(err instanceof Error ? err.message : "Erro ao carregar o pipeline.");
    } finally {
      setCarregando(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { etapas, oportunidades, carregando, erro, recarregar: carregarDados };
}
