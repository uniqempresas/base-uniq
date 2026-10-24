/**
 * Hooks da visão RECEITAS (lista) — redesign estoque v2 (Compro·Faço·Vendo).
 * Entry point do editor `/estoque-v2/receita/:id` — hoje o editor não tem
 * como chegar (fundador 24/10: "senti falta do editor de receitas").
 *
 * Padrão de dados espelha `use-produtos.ts` / `use-insumos-v2.ts`:
 * - client `src/lib/supabase` + `useAuth()`; TODA query escopada por `empresa_id`;
 * - `numeric` pode chegar como string → normalizador defensivo;
 * - mock-first (regra 07/09/2026): sem sessão → lista demo com `isFallback: true`;
 *   logado e 0 linhas → empty REAL (nunca mock de outro tenant).
 *
 * Conceito: lista dos produtos vendáveis "Faço" — `me_produto` com
 * `natureza in ('composto','simples')` e `ativo`. Receitas dão origem a
 * produtos finais; o editor v2 monta a ficha técnica dos compostos.
 *
 * Custo/unidade por card (mesma conta do editor — `custoUnitarioBase` /
 * `custoLinhaReceita` de `use-receitas-v2.ts`):
 * - composto: Σ linhas de `est_ficha_tecnica` (qtd × custo base × (1+perda));
 *   qualquer linha com custo pendente invalida o total (honra o "0 disfarçado"
 *   do editor) → `custoUnidade: null`;
 * - simples: `preco_custo` direto (me_produto).
 *
 * `recarregar()` devolve a lista carregada (Promise) — a tela usa para
 * detectar a receita recém-criada no ProdutoFormModal (banda "próximo: ficha").
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { custoLinhaReceita, type ReceitaV2Ingrediente } from "./use-receitas-v2";
import type { NaturezaProduto } from "../types/producao";

/* ───────────────────────────── domínio UI ───────────────────────────── */

export interface ReceitaListaV2 {
  /** `me_produto.id` (integer no banco — rota do editor usa o número) */
  id: number;
  nome: string;
  natureza: Exclude<NaturezaProduto, "insumo">;
  unidade: string;
  rendimentoLote: number | null;
  precoVarejo: number | null;
  preco: number | null;
  precoCusto: number | null;
  exibirVitrine: boolean;
  estoqueAtual: number;
  /** valor de venda do card: `preco_varejo ?? preco` (0/ausente → null = "sem preço") */
  valorVenda: number | null;
  /** custo por 1 unidade final: Σ ficha (composto) | preco_custo (simples); null = pendente */
  custoUnidade: number | null;
  custoOrigem: "ficha" | "custo" | null;
  /** venda − custo (R$ por unidade); null quando falta venda ou custo */
  margemReais: number | null;
  /** % sobre a venda (semáforo do card: verde ≥60, amarelo 30–60, vermelho <30) */
  margemPct: number | null;
  /** fichas em que ESTE produto entra como componente ("usada em N receitas") */
  usadaEm: number;
  /** composto sem nenhuma linha em est_ficha_tecnica → badge "sem ficha" */
  semFicha: boolean;
}

/** Semáforo de margem do redesign → modificador de classe `.eq2-badge--*`. */
export function semaforoMargem(pct: number | null): "ok" | "estimado" | "low" | null {
  if (pct == null) return null;
  if (pct >= 60) return "ok";
  if (pct >= 30) return "estimado";
  return "low";
}

/* ───────────────────────────── helpers ───────────────────────────── */

/** `numeric` pode chegar como string no client; null/""/NaN → null (padrão use-produtos). */
function num(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function normalizarNatureza(valor: string | null | undefined): Exclude<NaturezaProduto, "insumo"> {
  return valor === "composto" ? "composto" : "simples";
}

/** `preco_varejo ?? preco` com guarda: 0/negativo conta como "sem preço" (microempresa nunca vende a R$ 0). */
function resolverVenda(precoVarejo: number | null, preco: number | null): number | null {
  if (precoVarejo != null && precoVarejo > 0) return precoVarejo;
  if (preco != null && preco > 0) return preco;
  return null;
}

/** Deriva venda/custo/margens do resto do card — usado no mapper do DB e no mock demo. */
function completarReceita(
  base: Omit<
    ReceitaListaV2,
    "valorVenda" | "custoUnidade" | "custoOrigem" | "margemReais" | "margemPct" | "semFicha"
  > & {
    custoUnidade?: number | null;
    custoOrigem?: "ficha" | "custo" | null;
    semFicha?: boolean;
  },
): ReceitaListaV2 {
  const valorVenda = resolverVenda(base.precoVarejo, base.preco);
  const custoUnidade = base.custoUnidade ?? null;
  const custoOrigem =
    base.custoOrigem ?? (custoUnidade != null ? (base.natureza === "simples" ? "custo" : "ficha") : null);
  const margemReais = valorVenda != null && custoUnidade != null ? valorVenda - custoUnidade : null;
  const margemPct =
    valorVenda != null && margemReais != null ? (margemReais / valorVenda) * 100 : null;
  return {
    ...base,
    valorVenda,
    custoUnidade,
    custoOrigem,
    margemReais,
    margemPct,
    semFicha: base.semFicha ?? false,
  };
}

/* ───────────────────────────── demo (mock-first) ───────────────────────────── */
// Nunca usar nomes de tenant real. Valores plausíveis de doceria de Suzano —
// ids conversam com RECEITAS_DEMO de `use-insumos-v2.ts` (801–804).

type ReceitaDemoBase = Omit<
  ReceitaListaV2,
  "valorVenda" | "custoUnidade" | "custoOrigem" | "margemReais" | "margemPct" | "semFicha"
> & {
  custoUnidade?: number | null;
  custoOrigem?: "ficha" | "custo" | null;
  semFicha?: boolean;
};

const RECEITAS_DEMO: ReceitaListaV2[] = (
  [
    {
      id: 801, nome: "Brigadeiro gourmet", natureza: "composto", unidade: "un",
      rendimentoLote: 40, precoVarejo: null, preco: 1.5, precoCusto: null,
      exibirVitrine: true, estoqueAtual: 120, custoUnidade: 0.62, custoOrigem: "ficha", usadaEm: 0,
    },
    {
      id: 802, nome: "Torta de limão", natureza: "composto", unidade: "un",
      rendimentoLote: 12, precoVarejo: 35, preco: 35, precoCusto: null,
      exibirVitrine: true, estoqueAtual: 4, custoUnidade: 12.4, custoOrigem: "ficha", usadaEm: 0,
    },
    {
      // sub-receita: vira componente da Torta/Bolo — ainda sem preço de venda
      id: 803, nome: "Recheio de limão", natureza: "composto", unidade: "g",
      rendimentoLote: 800, precoVarejo: null, preco: null, precoCusto: null,
      exibirVitrine: false, estoqueAtual: 650, custoUnidade: 0.018, custoOrigem: "ficha", usadaEm: 2,
    },
    {
      // composto criado pelo form, ficha ainda não montada → badge "sem ficha"
      id: 804, nome: "Bolo de pote (doce de leite)", natureza: "composto", unidade: "un",
      rendimentoLote: null, precoVarejo: 16, preco: 16, precoCusto: null,
      exibirVitrine: true, estoqueAtual: 0, custoUnidade: null, custoOrigem: null, usadaEm: 0, semFicha: true,
    },
    {
      id: 805, nome: "Beijinho congelado", natureza: "simples", unidade: "un",
      rendimentoLote: null, precoVarejo: 6, preco: 6, precoCusto: 2.1,
      exibirVitrine: true, estoqueAtual: 30, custoUnidade: 2.1, custoOrigem: "custo", usadaEm: 0,
    },
    {
      // margem 25,7% → semáforo vermelho ("no vermelho")
      id: 806, nome: "Sonho de creme", natureza: "simples", unidade: "un",
      rendimentoLote: null, precoVarejo: null, preco: 3.5, precoCusto: 2.6,
      exibirVitrine: false, estoqueAtual: 8, custoUnidade: 2.6, custoOrigem: "custo", usadaEm: 1,
    },
  ] satisfies ReceitaDemoBase[]
).map(completarReceita);

/* ───────────────────────────── linhas do banco ───────────────────────────── */

interface DBReceita {
  id: number;
  nome_produto: string | null;
  natureza: string | null;
  unidade: string | null;
  rendimento_lote: number | string | null;
  preco_varejo: number | string | null;
  preco: number | string | null;
  preco_custo: number | string | null;
  exibir_vitrine: boolean | null;
  estoque_atual: number | string | null;
}

/**
 * Linha de `est_ficha_tecnica` com embed do componente.
 * Hint obrigatório: a tabela tem DUAS FKs para `me_produto` (pai e componente)
 * — padrão `use-receitas-v2.ts` / `use-insumos-v2.ts`.
 */
interface DBFichaLinha {
  id: string;
  produto_pai_id: number;
  componente_id: number;
  quantidade_por_unidade: number | string | null;
  perda_pct: number | string | null;
  me_produto: {
    nome_produto: string | null;
    unidade: string | null;
    unidade_compra: string | null;
    fator_conversao: number | string | null;
    preco_custo: number | string | null;
    ultimo_preco_compra: number | string | null;
  } | null;
}

const COLUNAS_LISTA =
  "id, nome_produto, natureza, unidade, rendimento_lote, preco_varejo, preco, preco_custo, exibir_vitrine, estoque_atual";

function mapFichaLinha(db: DBFichaLinha): ReceitaV2Ingrediente {
  return {
    id: db.id,
    componenteId: String(db.componente_id),
    nome: db.me_produto?.nome_produto || "Sem nome",
    unidade: db.me_produto?.unidade || "un",
    unidadeCompra: db.me_produto?.unidade_compra ?? null,
    fatorConversao: num(db.me_produto?.fator_conversao),
    precoCusto: num(db.me_produto?.preco_custo),
    ultimoPrecoCompra: num(db.me_produto?.ultimo_preco_compra),
    quantidadePorUnidade: num(db.quantidade_por_unidade) ?? 0,
    perdaPct: num(db.perda_pct) ?? 0,
  };
}

/* ───────────────────────────── hook ───────────────────────────── */

export interface UseReceitasListaV2Return {
  receitas: ReceitaListaV2[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  /** resolve com a lista recém-carregada (banda "próxima ficha" pós-criação) */
  recarregar: () => Promise<ReceitaListaV2[]>;
}

export function useReceitasListaV2(): UseReceitasListaV2Return {
  const { empresa, session, loading: authLoading } = useAuth();
  // Dependências de VALOR (padrão N7 do use-produtos): evento de auth
  // duplicado não pode re-consultar e fazer a lista "piscar".
  const empresaId = empresa?.id ?? null;
  const temSessao = session !== null;

  const [receitas, setReceitas] = useState<ReceitaListaV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async (): Promise<ReceitaListaV2[]> => {
    if (authLoading) return [];

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem login): mock realista — regra mock-first de 07/09/2026
    if (!temSessao) {
      setReceitas(RECEITAS_DEMO);
      setIsFallback(true);
      setLoading(false);
      return RECEITAS_DEMO;
    }

    // Logado mas empresa não resolvida: NÃO consultar outro tenant
    if (!empresaId) {
      setReceitas([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setLoading(false);
      return [];
    }

    try {
      // 1) vendáveis "Faço" do tenant
      const { data: paiData, error: paiError } = await supabase
        .from("me_produto")
        .select(COLUNAS_LISTA)
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .in("natureza", ["composto", "simples"])
        .order("nome_produto");

      if (paiError) throw paiError;

      const paises = ((paiData as unknown as DBReceita[] | null) || []).map(mapBase);

      const ids = paises.map((p) => p.id);
      const compostoIds = paises.filter((p) => p.natureza === "composto").map((p) => p.id);

      // 2) duas leituras em MASSA (sem N+1):
      //    a) todas as linhas de ficha dos compostos listados (custo/un)
      //    b) em que fichas estes produtos entram como COMPONENTE (badge "usada em N")
      // Nota: PostgREST limita a 1000 linhas por query por default — para o porte
      // de microempresa deste produto (dezenas de fichas) isso não é gargalo.
      const [fichaRes, usoRes] = await Promise.all([
        compostoIds.length > 0
          ? supabase
              .from("est_ficha_tecnica")
              .select(
                "id, produto_pai_id, componente_id, quantidade_por_unidade, perda_pct, " +
                  "me_produto!componente_id (nome_produto, unidade, unidade_compra, fator_conversao, preco_custo, ultimo_preco_compra)",
              )
              .eq("empresa_id", empresaId)
              .in("produto_pai_id", compostoIds)
          : Promise.resolve({ data: null as DBFichaLinha[] | null, error: null }),
        ids.length > 0
          ? supabase
              .from("est_ficha_tecnica")
              .select("componente_id")
              .eq("empresa_id", empresaId)
              .in("componente_id", ids)
          : Promise.resolve({ data: null as { componente_id: number }[] | null, error: null }),
      ]);

      if (fichaRes.error) throw fichaRes.error;
      if (usoRes.error) throw usoRes.error;

      // agrupar fichas por pai → custo/un (Σ linhas resolvidas; linha pendente anula o total)
      const linhasPorPai = new Map<number, ReceitaV2Ingrediente[]>();
      for (const f of (fichaRes.data as unknown as DBFichaLinha[] | null) || []) {
        const pai = Number(f.produto_pai_id);
        const arr = linhasPorPai.get(pai);
        const linha = mapFichaLinha(f);
        if (arr) arr.push(linha);
        else linhasPorPai.set(pai, [linha]);
      }

      const usosPorComponente = new Map<number, number>();
      for (const u of (usoRes.data as unknown as { componente_id: number }[] | null) || []) {
        const comp = Number(u.componente_id);
        usosPorComponente.set(comp, (usosPorComponente.get(comp) ?? 0) + 1);
      }

      const lista = paises.map((p) => {
        const linhas = linhasPorPai.get(p.id);
        let custoUnidade: number | null = null;
        let semFicha = false;
        if (p.natureza === "composto") {
          semFicha = !linhas || linhas.length === 0;
          if (linhas && linhas.length > 0) {
            const custos = linhas.map(custoLinhaReceita);
            // qualquer ingrediente sem custo → "custo pendente", nunca 0 disfarçado
            custoUnidade = custos.every((c) => c != null)
              ? custos.reduce((acc, c) => acc + (c as number), 0)
              : null;
          }
        } else {
          custoUnidade = p.precoCusto != null && p.precoCusto > 0 ? p.precoCusto : null;
        }
        return completarReceita({
          ...p,
          custoUnidade,
          custoOrigem: custoUnidade != null ? (p.natureza === "simples" ? "custo" : "ficha") : null,
          usadaEm: usosPorComponente.get(p.id) ?? 0,
          semFicha,
        });
      });

      // 0 linhas = empresa nova = empty state real (nunca mock de outra empresa)
      setReceitas(lista);
      return lista;
    } catch (err) {
      console.error("[useReceitasListaV2] Erro ao buscar as receitas:", err);
      setReceitas([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar as receitas");
      return [];
    } finally {
      setLoading(false);
    }
    // `receitas` NÃO é dependência — ver padrão use-insumos-v2 (evita loop de refetch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId, temSessao, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { receitas, loading, error, isFallback, recarregar: carregarDados };
}

/** me_produto → base do card (campos crus; derivação em `completarReceita`). */
function mapBase(db: DBReceita): Omit<
  ReceitaListaV2,
  "valorVenda" | "custoUnidade" | "custoOrigem" | "margemReais" | "margemPct" | "semFicha"
> & { usadaEm: number } {
  return {
    id: Number(db.id),
    nome: db.nome_produto || "Sem nome",
    natureza: normalizarNatureza(db.natureza),
    unidade: db.unidade || "un",
    rendimentoLote: num(db.rendimento_lote),
    precoVarejo: num(db.preco_varejo),
    preco: num(db.preco),
    precoCusto: num(db.preco_custo),
    exibirVitrine: db.exibir_vitrine ?? false,
    estoqueAtual: num(db.estoque_atual) ?? 0,
    usadaEm: 0,
  };
}
