import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { EtapaDB } from "../types/crm";

/** Etapa de crm_etapas para a tela de configuração */
export interface EtapaPipeline {
  id: string;
  nome: string;
  posicao: number;
  cor: string | null;
  fixa: boolean;
}

export interface EtapaAcaoResult {
  success: boolean;
  id?: string;
  /** erro real do banco/mensagem de bloqueio — exibir em toast de erro */
  error?: string;
  /** sucesso parcial (ex.: renomeou mas não migrou negociações) — toast de aviso */
  aviso?: string;
}

// Paleta sugerida para etapas (mesma abordagem de CORES_TAG em use-tags.ts;
// inclui as cores do seed PIPELINE_ETAPAS para o resultado ficar familiar).
export const CORES_ETAPA = [
  "#627271",
  "#0EA5E9",
  "#8B5CF6",
  "#F59E0B",
  "#F97316",
  "#22C55E",
  "#EF4444",
  "#14B8A6",
  "#EC4899",
  "#475569",
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function ehCorHex(cor: string | null | undefined): boolean {
  return !!cor && HEX_RE.test(cor.trim());
}

/** Garante hex `#rrggbb` no que é salvo (regra 4 da SPEC) */
export function normHex(cor: string | null | undefined, fallback: string): string {
  return cor && HEX_RE.test(cor.trim()) ? cor.trim() : fallback;
}

const MSG_EMPRESA =
  "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.";

/**
 * Normalização repetida de use-pipeline.ts (não importar para não acoplar a
 * config ao hook do kanban): etapas antigas podem ter CLASSE TAILWIND na
 * coluna `cor` em vez de hex. Para exibição na lista, o fallback é a cor
 * neutra "#627271" — mesma regra que o kanban já usa.
 */
export function corDeExibicao(cor: string | null | undefined): string {
  const c = (cor || "").trim();
  return c.startsWith("#") ? c : "#627271";
}

function nomeValido(nome: string): string | null {
  const n = nome.trim();
  if (!n) return "Informe o nome da etapa.";
  return null;
}

export interface UseEtapasPipelineReturn {
  etapas: EtapaPipeline[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
  criar: (nome: string, cor?: string) => Promise<EtapaAcaoResult>;
  atualizar: (id: string, nome: string, cor: string) => Promise<EtapaAcaoResult>;
  mover: (id: string, direcao: -1 | 1) => Promise<EtapaAcaoResult>;
  excluir: (id: string) => Promise<EtapaAcaoResult>;
}

/**
 * CRUD de crm_etapas da empresa logada (SPEC-CRM-Config-Etapas-Pipeline).
 * Guarda de tenant: `.eq("empresa_id", ...)` em TODA escrita.
 * `crm_oportunidades.estagio` é o NOME da etapa — renomear migra as
 * negociações em massa; excluir só com etapa vazia; mínimo de 1 etapa.
 */
export function useEtapasPipeline(): UseEtapasPipelineReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [etapas, setEtapas] = useState<EtapaPipeline[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setCarregando(true);
    setErro(null);

    // Configuração grava no banco: sem sessão/empresa não há tenant alvo
    // (mesma regra de use-pipeline.ts — nunca consultar outro tenant).
    const empresaId = empresa?.id;
    if (!session || !empresaId) {
      setEtapas([]);
      setErro(
        !session
          ? "Faça login para configurar as etapas do pipeline."
          : "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
      );
      setCarregando(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("crm_etapas")
        .select("id, empresa_id, nome, posicao, cor, fixa")
        .eq("empresa_id", empresaId)
        .order("posicao", { ascending: true });

      if (error) throw error;

      const lista = ((data as EtapaDB[] | null) ?? []).map((e, idx) => ({
        id: e.id,
        nome: e.nome || "",
        posicao: e.posicao ?? idx + 1,
        cor: e.cor,
        fixa: e.fixa ?? false,
      }));
      lista.sort((a, b) => a.posicao - b.posicao);
      setEtapas(lista);
    } catch (err) {
      console.error("[useEtapasPipeline] Erro ao buscar etapas:", err);
      setEtapas([]);
      setErro(err instanceof Error ? err.message : "Erro ao carregar etapas do pipeline.");
    } finally {
      setCarregando(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const duplicada = useCallback(
    (nome: string, ignorarId?: string): boolean =>
      etapas.some(
        (e) => e.id !== ignorarId && e.nome.trim().toLowerCase() === nome.trim().toLowerCase()
      ),
    [etapas]
  );

  /** Criar etapa: posicao = última + 1, fixa = false, cor SEMPRE hex */
  const criar = useCallback(
    async (nome: string, cor?: string): Promise<EtapaAcaoResult> => {
      const erroNome = nomeValido(nome);
      if (erroNome) return { success: false, error: erroNome };
      if (duplicada(nome)) return { success: false, error: "Já existe uma etapa com esse nome." };

      const empresaId = empresa?.id;
      if (!empresaId) return { success: false, error: MSG_EMPRESA };

      const corFinal = normHex(cor, CORES_ETAPA[0]);
      const posicao = etapas.reduce((max, e) => Math.max(max, e.posicao), 0) + 1;

      const { data, error } = await supabase
        .from("crm_etapas")
        .insert({ empresa_id: empresaId, nome: nome.trim(), posicao, cor: corFinal, fixa: false })
        .select("id")
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      carregarDados();
      return { success: true, id: data?.id };
    },
    [carregarDados, duplicada, empresa, etapas]
  );

  /**
   * Atualizar nome/cor. Renomeou? Migra `crm_oportunidades.estagio` em massa;
   * falha na migração NÃO cancela o rename (aviso + console.warn — regra 1).
   */
  const atualizar = useCallback(
    async (id: string, nome: string, cor: string): Promise<EtapaAcaoResult> => {
      const erroNome = nomeValido(nome);
      if (erroNome) return { success: false, error: erroNome };
      if (duplicada(nome, id)) return { success: false, error: "Já existe uma etapa com esse nome." };

      const empresaId = empresa?.id;
      if (!empresaId) return { success: false, error: MSG_EMPRESA };

      const etapa = etapas.find((e) => e.id === id);
      if (!etapa) return { success: false, error: "Etapa não encontrada. Recarregue a página." };

      const nomeLimpo = nome.trim();
      const corFinal = normHex(cor, normHex(etapa.cor, "#627271"));
      const renomeou = nomeLimpo !== etapa.nome;

      const { error: updateError } = await supabase
        .from("crm_etapas")
        .update({ nome: nomeLimpo, cor: corFinal })
        .eq("id", id)
        .eq("empresa_id", empresaId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      let aviso: string | undefined;
      if (renomeou) {
        // estagio é texto = nome da etapa; migração em massa das negociações
        const { error: migraError } = await supabase
          .from("crm_oportunidades")
          .update({ estagio: nomeLimpo })
          .eq("empresa_id", empresaId)
          .eq("estagio", etapa.nome);

        if (migraError) {
          console.warn(
            "[useEtapasPipeline] Rename ok, mas falhou migrar negociações:",
            migraError.message
          );
          aviso = `Etapa renomeada, mas as negociações antigas não foram movidas (${migraError.message}). Confira o pipeline.`;
        }
      }

      carregarDados();
      return { success: true, id, aviso };
    },
    [carregarDados, duplicada, empresa, etapas]
  );

  /** Reordenar: ↑↓ trocando `posicao` com o vizinho — otimista; recarrega ao fim */
  const mover = useCallback(
    async (id: string, direcao: -1 | 1): Promise<EtapaAcaoResult> => {
      const empresaId = empresa?.id;
      if (!empresaId) return { success: false, error: MSG_EMPRESA };

      const ordenadas = [...etapas].sort((a, b) => a.posicao - b.posicao);
      const idx = ordenadas.findIndex((e) => e.id === id);
      if (idx < 0) return { success: false, error: "Etapa não encontrada. Recarregue a página." };

      const alvoIdx = idx + direcao;
      if (alvoIdx < 0 || alvoIdx >= ordenadas.length) return { success: true }; // borda: no-op

      const atual = ordenadas[idx];
      const alvo = ordenadas[alvoIdx];

      // otimista: troca local imediata
      setEtapas((prev) =>
        prev.map((e) => {
          if (e.id === atual.id) return { ...e, posicao: alvo.posicao };
          if (e.id === alvo.id) return { ...e, posicao: atual.posicao };
          return e;
        })
      );

      const { error: e1 } = await supabase
        .from("crm_etapas")
        .update({ posicao: alvo.posicao })
        .eq("id", atual.id)
        .eq("empresa_id", empresaId);
      if (e1) {
        carregarDados();
        return { success: false, error: e1.message };
      }

      const { error: e2 } = await supabase
        .from("crm_etapas")
        .update({ posicao: atual.posicao })
        .eq("id", alvo.id)
        .eq("empresa_id", empresaId);
      if (e2) {
        carregarDados();
        return { success: false, error: e2.message };
      }

      carregarDados();
      return { success: true };
    },
    [carregarDados, empresa, etapas]
  );

  /**
   * Excluir com guardas (regra 2): bloqueia a última etapa restante e etapa
   * com negociações (contagem por estagio = nome). Delete sempre com
   * guarda empresa_id.
   */
  const excluir = useCallback(
    async (id: string): Promise<EtapaAcaoResult> => {
      const empresaId = empresa?.id;
      if (!empresaId) return { success: false, error: MSG_EMPRESA };

      const etapa = etapas.find((e) => e.id === id);
      if (!etapa) return { success: false, error: "Etapa não encontrada. Recarregue a página." };

      if (etapas.length <= 1) {
        return { success: false, error: "O pipeline precisa ter pelo menos 1 etapa." };
      }

      const { count, error: countError } = await supabase
        .from("crm_oportunidades")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .eq("estagio", etapa.nome);

      if (countError) {
        return { success: false, error: countError.message };
      }

      const total = count ?? 0;
      if (total > 0) {
        return {
          success: false,
          error:
            total === 1
              ? "1 negociação nesta etapa. Mova-a antes de excluir."
              : `${total} negociações nesta etapa. Mova-as antes de excluir.`,
        };
      }

      const { error: delError } = await supabase
        .from("crm_etapas")
        .delete()
        .eq("id", id)
        .eq("empresa_id", empresaId);

      if (delError) {
        return { success: false, error: delError.message };
      }

      carregarDados();
      return { success: true };
    },
    [carregarDados, empresa, etapas]
  );

  return { etapas, carregando, erro, recarregar: carregarDados, criar, atualizar, mover, excluir };
}
