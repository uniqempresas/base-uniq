/**
 * useCategoriasV2 — categorias do estoque v2 (Configurações: Produtos · Insumos).
 *
 * `me_categoria.escopo` ('produto' | 'insumo' — migration já aplicada, NOT NULL
 * DEFAULT 'produto') separa os dois mundos: produtos e insumos deixam de
 * dividir a mesma lista. Categorias legadas caem no escopo 'produto' — regra do
 * próprio DEFAULT.
 *
 * Padrão de dados espelha `use-categorias.ts` (v1 — CRUD aprovado pelo fundador
 * via ConfiguracoesCRMPage): uma única função de carga com N7 (deps por VALOR:
 * empresaId + presença de sessão), trava de tenant `.eq("empresa_id")` em toda
 * leitura/escrita, soft delete por `ativo=false`, mock-first sem sessão.
 *
 * Diferenças do v1 (decisão desta lane):
 * - o hook NÃO é casado com o escopo: carrega as duas abas de uma vez e a UI
 *   alterna client-side — trocar de aba não re-faz fetch nem pisca skeleton;
 * - contagem de uso em UMA query em massa (me_produto id/categoria_id/natureza,
 *   ativos) — nada de N+1 por card. Escopo da contagem = M1 do ProdutosPage:
 *   categoria 'produto' conta natureza ≠ 'insumo'; 'insumo' conta 'insumo';
 * - duplicado é verificado CASE-INSENSITIVE SEM ACENTO dentro do MESMO escopo
 *   (pré-checagem na memória + fallback do constraint 23505 no banco);
 * - sem sessão: lista demo + mutações devolvem hint (a UI ainda desabilita os
 *   botões — defesa em profundidade).
 *
 * Universo demo conversa com as outras telas v2: categorias de produto vêm dos
 * mocks `PRODUTOS` (loja de roupas) e as de insumo têm os MESMOS nomes/ids da
 * lista demo de `use-insumos-v2.ts` (Laticínios 901 · Doces 902 · Hortifrúti 903).
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { CORES_TAG } from "./use-tags";
import { PRODUTOS } from "../components/estoque/estoqueMockData";

/* ───────────────────────────── domínio ───────────────────────────── */

export type EscopoCategoria = "produto" | "insumo";

export interface CategoriaV2 {
  /** `me_categoria.id_categoria` */
  id: number;
  nome: string;
  cor: string | null;
  escopo: EscopoCategoria;
}

export interface ResultadoMutacaoV2 {
  success: boolean;
  error?: string;
}

export interface CriarCategoriaV2Result extends ResultadoMutacaoV2 {
  id?: number;
}

export interface UseCategoriasV2Return {
  /** categorias ATIVAS dos dois escopos, ordem de nome */
  categorias: CategoriaV2[];
  /** uso por id de categoria — já resolvido pelo escopo da própria categoria */
  contagens: Record<number, number>;
  loading: boolean;
  error: string | null;
  /** true = sem sessão, lista demo */
  isFallback: boolean;
  recarregar: () => void;
  criarCategoria: (escopo: EscopoCategoria, nome: string, cor?: string) => Promise<CriarCategoriaV2Result>;
  renomearCategoria: (id: number, nome: string) => Promise<ResultadoMutacaoV2>;
  definirCor: (id: number, cor: string) => Promise<ResultadoMutacaoV2>;
  /** soft delete: `ativo=false`. A UI mostra `contagens[id]` no confirm. */
  arquivarCategoria: (id: number) => Promise<ResultadoMutacaoV2>;
}

/* ───────────────────────────── helpers ───────────────────────────── */

/** minúsculas + sem acentos — comparação de duplicado ("Bebidas" = "bebidas"). */
function normalizarNome(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizarEscopo(valor: string | null | undefined): EscopoCategoria {
  return valor === "insumo" ? "insumo" : "produto";
}

/** Msg única de prévia — mutações sem login não podem parecer falha de sistema. */
const ERRO_DEMO =
  "Isso é uma prévia com dados de demonstração — faça login para criar e editar categorias.";

const ERRO_DUPLICADO = "Essa categoria já existe";

/* ───────────────────────────── demo (mock-first) ───────────────────────────── */

const COR_DEMO_PRODUTO: Record<string, string> = {
  Roupas: CORES_TAG[5],
  Calçados: CORES_TAG[4],
  Acessórios: CORES_TAG[1],
  Eletrônicos: CORES_TAG[9],
  Beleza: CORES_TAG[8],
};

/**
 * Insumos demo: MESMOS nomes/ids da lista demo de `use-insumos-v2.ts`
 * (Laticínios 901 · Doces 902 · Hortifrúti 903). `uso` espelha aquela lista
 * real de demonstração: 2 insumos por categoria (6 itens no total).
 */
const INSUMOS_DEMO: Array<CategoriaV2 & { uso: number }> = [
  { id: 901, nome: "Laticínios", cor: CORES_TAG[6], escopo: "insumo", uso: 2 },
  { id: 902, nome: "Doces", cor: CORES_TAG[0], escopo: "insumo", uso: 2 },
  { id: 903, nome: "Hortifrúti", cor: CORES_TAG[7], escopo: "insumo", uso: 2 },
];

/** Categorias de produto demo derivadas dos mocks PRODUTOS (nunca inventar nomes). */
function categoriasProdutoDemo(): Array<CategoriaV2 & { uso: number }> {
  const uso = new Map<string, number>();
  for (const p of PRODUTOS) {
    if ((p.natureza ?? "simples") === "insumo") continue;
    const nome = p.categoria || "Sem categoria";
    uso.set(nome, (uso.get(nome) ?? 0) + 1);
  }
  return [...uso.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
    .map(([nome, n], i) => ({
      id: 911 + i,
      nome,
      cor: COR_DEMO_PRODUTO[nome] ?? CORES_TAG[i % CORES_TAG.length],
      escopo: "produto" as EscopoCategoria,
      uso: n,
    }));
}

/* ───────────────────────────── linhas do banco ───────────────────────────── */

interface DBCategoria {
  id_categoria: number;
  nome_categoria: string | null;
  cor: string | null;
  escopo: string | null;
}

interface DBProdutoUso {
  id: number;
  categoria_id: number | null;
  natureza: string | null;
}

/** Uso em massa: um passe sobre me_produto ativo, dois baldes por categoria. */
function montarContagens(categorias: CategoriaV2[], produtos: DBProdutoUso[]): Record<number, number> {
  const escopoDaCategoria = new Map(categorias.map((c) => [c.id, c.escopo]));
  const contagem: Record<number, number> = {};
  for (const p of produtos) {
    if (p.categoria_id == null) continue;
    const escopo = escopoDaCategoria.get(p.categoria_id);
    if (!escopo) continue;
    const ehInsumo = p.natureza === "insumo";
    if (escopo === "insumo" ? !ehInsumo : ehInsumo) continue;
    contagem[p.categoria_id] = (contagem[p.categoria_id] ?? 0) + 1;
  }
  return contagem;
}

/* ───────────────────────────── hook ───────────────────────────── */

export function useCategoriasV2(): UseCategoriasV2Return {
  const { empresa, session, loading: authLoading } = useAuth();
  // N7 (fundador 20/10 — "pisca"): deps por VALOR (id da empresa + presença de
  // sessão), nunca pela identidade dos objetos de auth. Padrão use-produtos.
  const empresaId = empresa?.id ?? null;
  const temSessao = session !== null;

  const [categorias, setCategorias] = useState<CategoriaV2[]>([]);
  const [contagens, setContagens] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);

    // MODO DEMO (sem login): mock-first (regra 07/09/2026) — dois escopos.
    if (!temSessao) {
      const demo = [...categoriasProdutoDemo(), ...INSUMOS_DEMO];
      setCategorias(demo.map(({ uso: _uso, ...c }) => c));
      setContagens(Object.fromEntries(demo.map((c) => [c.id, c.uso])));
      setIsFallback(true);
      setLoading(false);
      return;
    }

    // Logado mas empresa não resolvida: NÃO consultar outro tenant
    if (!empresaId) {
      setCategorias([]);
      setContagens({});
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      // 1) categorias ativas dos dois escopos (globals empresa_id IS NULL ficam
      //    FORA — travadas pelo eq; mesma decisão do v1)
      const { data: catData, error: catError } = await supabase
        .from("me_categoria")
        .select("id_categoria, nome_categoria, cor, escopo")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome_categoria");

      if (catError) throw catError;

      const cats: CategoriaV2[] = ((catData as DBCategoria[] | null) || []).map((db) => ({
        id: Number(db.id_categoria),
        nome: db.nome_categoria || "",
        cor: db.cor || null,
        escopo: normalizarEscopo(db.escopo),
      }));
      // 0 linhas = empresa nova = empty state REAL (nunca mock de outra empresa)
      setCategorias(cats);

      // 2) contagem de uso — UMA query em massa, só se há categorias
      if (cats.length === 0) {
        setContagens({});
      } else {
        const { data: prodData, error: prodError } = await supabase
          .from("me_produto")
          .select("id, categoria_id, natureza")
          .eq("empresa_id", empresaId)
          .eq("ativo", true);

        if (prodError) throw prodError;
        setContagens(montarContagens(cats, (prodData as DBProdutoUso[] | null) || []));
      }

      setIsFallback(false);
    } catch (err) {
      console.error("[useCategoriasV2] Erro ao carregar categorias:", err);
      setCategorias([]);
      setContagens({});
      setError(err instanceof Error ? err.message : "Erro ao carregar categorias");
      setIsFallback(false);
    } finally {
      setLoading(false);
    }
  }, [empresaId, temSessao, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  /* ---- mutações ---- */

  const criarCategoria = useCallback(
    async (
      escopo: EscopoCategoria,
      nome: string,
      cor?: string
    ): Promise<CriarCategoriaV2Result> => {
      if (!temSessao) return { success: false, error: ERRO_DEMO };
      const nomeLimpo = nome.trim();
      if (!nomeLimpo) return { success: false, error: "Informe o nome da categoria." };
      if (!empresaId) {
        return {
          success: false,
          error: "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.",
        };
      }

      // Duplicado case-insensitive SEM ACENTO dentro do MESMO escopo
      const alvo = normalizarNome(nomeLimpo);
      if (categorias.some((c) => c.escopo === escopo && normalizarNome(c.nome) === alvo)) {
        return { success: false, error: ERRO_DUPLICADO };
      }

      const { data, error: insertError } = await supabase
        .from("me_categoria")
        .insert({
          empresa_id: empresaId,
          nome_categoria: nomeLimpo,
          cor: cor || CORES_TAG[0],
          escopo,
          ativo: true,
        })
        .select("id_categoria")
        .single();

      if (insertError) {
        // 23505 = unique_violation (ux_me_categoria_empresa_nome) — pode bater
        // também em nome REPETIDO ENTRE escopos se o constraint legado não
        // inclui `escopo`; a mensagem cobre os dois casos com honestidade.
        if (insertError.code === "23505") return { success: false, error: ERRO_DUPLICADO };
        return { success: false, error: insertError.message };
      }

      carregarDados();
      return { success: true, id: Number(data?.id_categoria) };
    },
    [categorias, empresaId, temSessao, carregarDados]
  );

  const renomearCategoria = useCallback(
    async (id: number, nome: string): Promise<ResultadoMutacaoV2> => {
      if (!temSessao) return { success: false, error: ERRO_DEMO };
      const nomeLimpo = nome.trim();
      if (!nomeLimpo) return { success: false, error: "Informe o nome da categoria." };
      if (!empresaId) return { success: false, error: "Empresa não identificada para este usuário." };

      const atual = categorias.find((c) => c.id === id);
      if (!atual) return { success: false, error: "Categoria não encontrada nesta tela." };

      const alvo = normalizarNome(nomeLimpo);
      if (
        categorias.some(
          (c) => c.id !== id && c.escopo === atual.escopo && normalizarNome(c.nome) === alvo
        )
      ) {
        return { success: false, error: ERRO_DUPLICADO };
      }

      const { error: updateError } = await supabase
        .from("me_categoria")
        .update({ nome_categoria: nomeLimpo })
        .eq("id_categoria", id)
        .eq("empresa_id", empresaId);

      if (updateError) {
        if (updateError.code === "23505") return { success: false, error: ERRO_DUPLICADO };
        return { success: false, error: updateError.message };
      }

      carregarDados();
      return { success: true };
    },
    [categorias, empresaId, temSessao, carregarDados]
  );

  const definirCor = useCallback(
    async (id: number, cor: string): Promise<ResultadoMutacaoV2> => {
      if (!temSessao) return { success: false, error: ERRO_DEMO };
      if (!empresaId) return { success: false, error: "Empresa não identificada para este usuário." };

      const { error: updateError } = await supabase
        .from("me_categoria")
        .update({ cor })
        .eq("id_categoria", id)
        .eq("empresa_id", empresaId);

      if (updateError) return { success: false, error: updateError.message };

      carregarDados();
      return { success: true };
    },
    [empresaId, temSessao, carregarDados]
  );

  const arquivarCategoria = useCallback(
    async (id: number): Promise<ResultadoMutacaoV2> => {
      if (!temSessao) return { success: false, error: ERRO_DEMO };
      if (!empresaId) return { success: false, error: "Empresa não identificada para este usuário." };

      // Soft delete: produtos/insumos que usam a categoria mantêm o rótulo
      // (mesma decisão de UI do v1, agora reportando a contagem no confirm).
      const { error: updateError } = await supabase
        .from("me_categoria")
        .update({ ativo: false })
        .eq("id_categoria", id)
        .eq("empresa_id", empresaId);

      if (updateError) return { success: false, error: updateError.message };

      carregarDados();
      return { success: true };
    },
    [empresaId, temSessao, carregarDados]
  );

  return {
    categorias,
    contagens,
    loading,
    error,
    isFallback,
    recarregar: carregarDados,
    criarCategoria,
    renomearCategoria,
    definirCor,
    arquivarCategoria,
  };
}
