/**
 * useProdutosListaV2 — dados + criação da LISTA "Produtos (Vendo)" do redesign
 * estoque v2 (pasta `components/estoque-v2/produtos/`).
 *
 * UNIVERSO: reusa os dois hooks públicos concluídos do módulo, sem duplicar
 * nenhuma conta:
 * - `useMargemV2` → o universo vendável (ativo + vitrine/não-insumo) com
 *   preço (preco_varejo ?? preco), custo (preco_custo ou Σ ficha) e margem
 *   (R$ + % + semáforo) já resolvidos pelo modelo oficial da lane margem;
 * - `useProdutos` → estoque_atual / estoque_minimo / categoria / cor / natureza
 *   do mesmo catálogo (`me_produto`, `ativo=true`).
 * O card é o merge dos dois por id (o universo de margem é subconjunto do
 * catálogo — ids conversam no mock e no banco).
 *
 * CRIAÇÃO ("Novo produto", veredito de mercado lib-2 — modelo multinível):
 * - SIMPLES (compra pronto e revende): INSERT próprio `criarSimples` —
 *   natureza='simples', preco_varejo, estoque inicial/mínimo (default 0),
 *   SKU gerado, exibir_vitrine pelo toggle (default true). Mesma grade de
 *   colunas do INSERT de `criarReceita` (padrão use-criar-produto/v1).
 * - COMPOSTO ("feito em casa" = receita): REUSA o mecanismo do `criarReceita`
 *   (use-receitas-lista-v2) — zero duplicação de escrita. Custo da categoria
 *   (se escolhida) entra por UPDATE simples logo após o INSERT (coluna
 *   categoria_id já existe; falha aqui não bloqueia a criação).
 *   Nota de custo: instanciar useReceitasListaV2 dentro deste hook dispara a
 *   carga da lista de receitas também — preço pago pela reutilização real do
 *   mecanismo (3 leituras a mais em microempresa = nada).
 *
 * Pós-criação: `recarregar()` dispara os DOIS hooks de leitura — o produto
 * novo aparece na lista (requisito 6 da lane).
 *
 * Demo (sem sessão): mock-first padrão + mutações ecoadas sem gravar
 * (id null) — a UI ainda desabilita o submit (defesa em profundidade, idêntico
 * ao contrato do `criarReceita`).
 */
import { useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useProdutos } from "./use-produtos";
import { useMargemV2, type SemaforoMargem } from "./use-margem-v2";
import {
  useReceitasListaV2,
  type CriarReceitaParams,
  type CriarReceitaResult,
} from "./use-receitas-lista-v2";
import type { NaturezaProduto } from "../types/producao";

/* ───────────────────────────── domínio UI ───────────────────────────── */

export interface ProdutoListaV2 {
  /** `me_produto.id` em string (formato de rota — idem MargemItem.produtoId) */
  produtoId: string;
  nome: string;
  unidade: string;
  natureza: NaturezaProduto;
  /** preço de venda efetivo (`preco_varejo ?? preco`), null = "sem preço" */
  preco: number | null;
  /** custo/un resolvido pelo modelo de margem (preco_custo ou Σ ficha) */
  custo: number | null;
  /** true = custo veio da ficha técnica; false = custo médio cadastrado */
  custoVemDaFicha: boolean;
  margemReais: number | null;
  /** fração 0–1 (ex.: 0.64) — formatar com ×100 na UI */
  margemPct: number | null;
  semaforo: SemaforoMargem;
  ultimoPrecoCompra: number | null;
  /* do catálogo (useProdutos) — estoque e casa visual do card */
  estoque: number;
  estoqueMinimo: number;
  categoria: string;
  categoriaCor: string | null;
  categoriaId: number | null;
}

/** Alerta do card: só dispara com mínimo definido (produto novo com mín 0 não grita). */
export function estaAcabando(p: Pick<ProdutoListaV2, "estoque" | "estoqueMinimo">): boolean {
  return p.estoqueMinimo > 0 && p.estoque <= p.estoqueMinimo;
}

/* ───────────────────────────── criação ───────────────────────────── */

export interface CriarProdutoSimplesParams {
  nome: string;
  /** preço de venda (null = "sem preço" — ajustar depois no simulador) */
  precoVenda: number | null;
  /** entra em `estoque_atual` (null/ausente = 0) */
  estoqueInicial: number | null;
  /** entra em `estoque_minimo` (default 0 — sem alerta até o dono definir) */
  estoqueMinimo: number | null;
  categoriaId: number | null;
  /** toggle "Vendo isso" → `exibir_vitrine` (default true p/ produto) */
  aVenda: boolean;
  /** unidade de estoque; default "un" (microempresa vende em unidades) */
  unidade?: string;
}

export interface CriarCompostoParamsV2 extends CriarReceitaParams {
  categoriaId: number | null;
}

export interface CriarProdutoResult {
  success: boolean;
  /** `me_produto.id` — null em modo demo */
  id: number | null;
  nome: string;
  error?: string;
}

/* ───────────────────────────── hook ───────────────────────────── */

export interface UseProdutosListaV2Return {
  itens: ProdutoListaV2[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  /** recarrega os DOIS hooks de leitura (lista vê o produto novo) */
  recarregar: () => void;
  criarSimples: (params: CriarProdutoSimplesParams) => Promise<CriarProdutoResult>;
  /** delega o INSERT ao criarReceita (mecanismo reaproveitado) + update de categoria */
  criarComposto: (params: CriarCompostoParamsV2) => Promise<CriarProdutoResult>;
}

export function useProdutosListaV2(): UseProdutosListaV2Return {
  const { empresa, session } = useAuth();
  const empresaId = empresa?.id ?? null;
  const temSessao = session !== null;

  const {
    produtos,
    loading: produtosLoading,
    error: produtosError,
    isFallback,
    recarregar: recarregarProdutos,
  } = useProdutos();
  const {
    itens: margens,
    loading: margensLoading,
    error: margensError,
    recarregar: recarregarMargem,
  } = useMargemV2();
  // Reuso REAL do mecanismo de criação de composto (INSERT único, guard de
  // demo, SKU gerado). A lista que o carrega junto é desperdício tolerado —
  // ver nota de custo no docblock.
  const { criarReceita } = useReceitasListaV2();

  const byId = useMemo(() => new Map(produtos.map((p) => [p.id, p])), [produtos]);

  const itens = useMemo<ProdutoListaV2[]>(
    () =>
      margens.map((m) => {
        const p = byId.get(m.produtoId);
        return {
          produtoId: m.produtoId,
          nome: m.nome,
          unidade: m.unidade,
          natureza: m.natureza,
          preco: m.preco,
          custo: m.custo,
          custoVemDaFicha: m.custoVemDaFicha,
          margemReais: m.margemReais,
          margemPct: m.margemPct,
          semaforo: m.semaforo,
          ultimoPrecoCompra: m.ultimoPrecoCompra,
          estoque: p?.estoque ?? 0,
          estoqueMinimo: p?.estoqueMinimo ?? 0,
          categoria: p?.categoria ?? "Sem categoria",
          categoriaCor: p?.categoriaCor ?? null,
          categoriaId: p?.categoriaId ?? null,
        };
      }),
    [margens, byId]
  );

  const loading = produtosLoading || margensLoading;
  const error = produtosError ?? margensError;

  const recarregar = useCallback(() => {
    recarregarProdutos();
    recarregarMargem();
  }, [recarregarProdutos, recarregarMargem]);

  /* ───────────────────────────── mutações ───────────────────────────── */

  const criarSimples = useCallback(
    async (params: CriarProdutoSimplesParams): Promise<CriarProdutoResult> => {
      const nome = params.nome.trim();

      // MODO DEMO: não grava — ecoa (contrato idêntico ao criarReceita; a UI
      // já bloqueia o submit, este guard é a 2ª linha de defesa).
      if (!temSessao) return { success: true, id: null, nome };
      if (!empresaId) {
        return {
          success: false,
          id: null,
          nome,
          error: "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.",
        };
      }
      if (!nome) return { success: false, id: null, nome, error: "Dê um nome para o produto." };

      try {
        const preco = params.precoVenda;
        const { data, error: insError } = await supabase
          .from("me_produto")
          .insert({
            empresa_id: empresaId,
            nome_produto: nome,
            // produto simples = "compro pronto e revendo"; `tipo` é o legado
            // de variações — "Outros" como no criarReceita/use-criar-produto
            natureza: "simples",
            tipo: "Outros",
            unidade: params.unidade || "un",
            rendimento_lote: null,
            estoque_atual: params.estoqueInicial ?? 0,
            // default 0 da lane: sem mínimo definido o card NÃO alerta "acabando"
            estoque_minimo: params.estoqueMinimo ?? 0,
            exibir_vitrine: params.aVenda,
            preco_varejo: preco,
            preco: preco ?? 0,
            preco_custo: 0,
            sku: `SKU-${Date.now().toString().slice(-6)}`,
            ativo: true,
            descricao: null,
            foto_url: null,
            categoria_id: params.categoriaId,
            codigo_barras: null,
            opcoes_config: [],
            unidade_compra: null,
            fator_conversao: null,
          })
          .select("id")
          .single();

        if (insError) throw insError;
        recarregar();
        const novoId = Number((data as { id?: number | string } | null)?.id ?? 0) || null;
        return { success: true, id: novoId, nome };
      } catch (err) {
        console.error("[useProdutosListaV2] Erro ao criar o produto simples:", err);
        return {
          success: false,
          id: null,
          nome,
          error: err instanceof Error ? err.message : "Não foi possível criar o produto.",
        };
      }
    },
    [empresaId, temSessao, recarregar]
  );

  const criarComposto = useCallback(
    async (params: CriarCompostoParamsV2): Promise<CriarProdutoResult> => {
      const { categoriaId, ...receitaParams } = params;
      const res: CriarReceitaResult = await criarReceita(receitaParams);
      if (!res.success) return { success: false, id: res.id, nome: res.nome, error: res.error };

      // Categoria escolhida no modal: UPDATE na coluna já existente, com a
      // MESMA trava de tenant do INSERT. Falha aqui NÃO derruba a criação (o
      // produto nasce "Sem categoria" e pode ser categorizado depois).
      if (res.id != null && categoriaId != null && empresaId) {
        const { error: catError } = await supabase
          .from("me_produto")
          .update({ categoria_id: categoriaId })
          .eq("id", res.id)
          .eq("empresa_id", empresaId);
        if (catError) {
          console.warn("[useProdutosListaV2] Composto criado sem categoria (update falhou):", catError);
        }
      }

      recarregar();
      return { success: true, id: res.id, nome: res.nome };
    },
    [criarReceita, empresaId, recarregar]
  );

  return { itens, loading, error, isFallback, recarregar, criarSimples, criarComposto };
}
