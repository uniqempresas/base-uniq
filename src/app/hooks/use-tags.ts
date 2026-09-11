import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface Tag {
  id: string;
  nome: string;
  cor: string | null;
  ativo: boolean;
}

export interface CriarTagResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface DesativarTagResult {
  success: boolean;
  error?: string;
}

// Mock-first (sem login): mesma lista que a migration semeia nas empresas reais
export const TAGS_PADRAO: Tag[] = [
  { id: "mock-vip", nome: "VIP", cor: "#854D0E", ativo: true },
  { id: "mock-prospect", nome: "Prospect", cor: "#1D4ED8", ativo: true },
  { id: "mock-inadimplente", nome: "Inadimplente", cor: "#B91C1C", ativo: true },
  { id: "mock-cliente-fiel", nome: "Cliente Fiel", cor: "#15803D", ativo: true },
  { id: "mock-lead-quente", nome: "Lead Quente", cor: "#C2410C", ativo: true },
  { id: "mock-inativo", nome: "Inativo", cor: "#627271", ativo: true },
];

// Cores padrão por nome conhecido (mesma origem do seed)
export const CORES_POR_NOME: Record<string, string> = {
  VIP: "#854D0E",
  Prospect: "#1D4ED8",
  Inadimplente: "#B91C1C",
  "Cliente Fiel": "#15803D",
  "Lead Quente": "#C2410C",
  Inativo: "#627271",
};

// Paleta sugerida para tags novas
export const CORES_TAG = [
  "#854D0E",
  "#1D4ED8",
  "#B91C1C",
  "#15803D",
  "#C2410C",
  "#7E22CE",
  "#0EA5E9",
  "#166534",
  "#9D174D",
  "#475569",
];

// Converte a cor principal da tag em um paleta de chip (bg tintado, texto, borda)
export function getTagPalette(cor?: string | null): { bg: string; text: string; border: string } {
  const c = (cor || "").trim();
  const m = /^#?([0-9a-fA-F]{6})$/.exec(c);
  if (!m) {
    return { bg: "#efefef", text: "#627271", border: "#efefef" };
  }
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return {
    bg: `rgba(${r}, ${g}, ${b}, 0.12)`,
    text: `#${m[1].toLowerCase()}`,
    border: `rgba(${r}, ${g}, ${b}, 0.35)`,
  };
}

interface DBTag {
  id: string;
  empresa_id: string | null;
  nome: string | null;
  cor: string | null;
  ativo: boolean | null;
}

function mapTag(db: DBTag): Tag {
  return {
    id: db.id,
    nome: db.nome || "",
    cor: db.cor || CORES_POR_NOME[db.nome || ""] || null,
    ativo: db.ativo !== false,
  };
}

export interface UseTagsReturn {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
  criarTag: (nome: string, cor?: string) => Promise<CriarTagResult>;
  desativarTag: (id: string) => Promise<DesativarTagResult>;
}

export function useTags(): UseTagsReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem login): usa mock — regra mock-first de 07/09/2026
    if (!session) {
      setTags(TAGS_PADRAO);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    // Logado mas empresa não resolvida: NÃO consultar outro tenant
    const empresaId = empresa?.id;
    if (!empresaId) {
      setTags([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      const { data: dbTags, error: tagsError } = await supabase
        .from("me_tag")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome");

      if (tagsError) throw tagsError;

      const tagsValidas = (dbTags as DBTag[] | null) || [];

      // 0 linhas = empresa sem tags = empty state real (nunca mock de outra empresa)
      setTags(tagsValidas.map(mapTag));
      setIsFallback(false);
    } catch (err) {
      console.error("[useTags] Erro ao buscar tags reais:", err);
      if (!session) {
        setTags(TAGS_PADRAO);
        setIsFallback(true);
      } else {
        setTags([]);
        setError(err instanceof Error ? err.message : "Erro ao carregar tags");
        setIsFallback(false);
      }
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const criarTag = useCallback(
    async (nome: string, cor?: string): Promise<CriarTagResult> => {
      const nomeLimpo = nome.trim();
      if (!nomeLimpo) {
        return { success: false, error: "Informe o nome da tag." };
      }

      const empresaId = empresa?.id;
      if (!empresaId) {
        return {
          success: false,
          error: "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.",
        };
      }

      const { data, error: insertError } = await supabase
        .from("me_tag")
        .insert({
          empresa_id: empresaId,
          nome: nomeLimpo,
          cor: cor || CORES_POR_NOME[nomeLimpo] || null,
        })
        .select("id")
        .single();

      if (insertError) {
        // 23505 = unique_violation (UNIQUE empresa_id + nome)
        if (insertError.code === "23505") {
          return { success: false, error: "Já existe uma tag com esse nome." };
        }
        return { success: false, error: insertError.message };
      }

      carregarDados();
      return { success: true, id: data?.id };
    },
    [empresa, carregarDados]
  );

  const desativarTag = useCallback(
    async (id: string): Promise<DesativarTagResult> => {
      const { error: updateError } = await supabase
        .from("me_tag")
        .update({ ativo: false })
        .eq("id", id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      carregarDados();
      return { success: true };
    },
    [carregarDados]
  );

  return {
    tags,
    loading,
    error,
    isFallback,
    recarregar: carregarDados,
    criarTag,
    desativarTag,
  };
}