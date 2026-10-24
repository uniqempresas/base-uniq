/**
 * Modelo de margem do redesign Estoque V2 (Compro · Faço · Vendo).
 *
 * Modelo SIMPLES e consistente — nenhuma tabela nova é inventada:
 * - Universo: `me_produto` da empresa, `ativo = true` e
 *   (`exibir_vitrine = true` OU `natureza ≠ 'insumo'`).
 * - custo = `preco_custo`; se null e natureza = 'composto', fallback
 *   simplificado: soma de `quantidade_por_unidade × preco_custo` dos
 *   componentes de `est_ficha_tecnica` (embed via FK `componente_id`).
 *   Custo ≤ 0 ou ausente = "custo pendente" (semáforo vermelho).
 * - preço = `preco_varejo ?? preco` (≤ 0 ou ausente = preço pendente).
 * - margem R$ = preço − custo; margem % = preço > 0 ? (preço − custo) / preço : null.
 * - Semáforo: verde ≥ 60% · amarelo 30–60% · vermelho < 30% ou preço/custo ausente.
 *
 * Padrão de dados idêntico a `use-produtos.ts`: `supabase` + `useAuth()` com
 * `empresa_id`; sem sessão cai no mock local (regra mock-first de 07/09/2026)
 * para permitir screenshot/demonstração do redesign.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { PRODUTOS, type Produto } from "../components/estoque/estoqueMockData";
import type { NaturezaProduto } from "../types/producao";

export type SemaforoMargem = "verde" | "amarelo" | "vermelho";

export interface MargemItem {
  produtoId: string;
  nome: string;
  unidade: string;
  natureza: NaturezaProduto;
  /** preco_varejo ?? preco (null = preço pendente) */
  preco: number | null;
  /** preco_custo ou soma da ficha técnica (null = custo pendente) */
  custo: number | null;
  /** true quando o custo veio do fallback simplificado da BOM */
  custoVemDaFicha: boolean;
  margemReais: number | null;
  /** fração 0–1 (ex.: 0.64) — null quando preço/custo ausente */
  margemPct: number | null;
  semaforo: SemaforoMargem;
  /** `me_produto.ultimo_preco_compra` (unidade de compra) — driver do alerta "custo subiu" */
  ultimoPrecoCompra: number | null;
}

interface DBMargemProduto {
  id: number;
  empresa_id: string | null;
  nome_produto: string | null;
  unidade: string | null;
  natureza: string | null;
  exibir_vitrine: boolean | null;
  preco: number | string | null;
  preco_varejo: number | string | null;
  preco_custo: number | string | null;
  ultimo_preco_compra: number | string | null;
}

interface DBFichaEmbed {
  produto_pai_id: number;
  quantidade_por_unidade: string | number;
  me_produto: { id?: number; preco_custo: number | string | null } | null;
}

/** numeric pode chegar como string; ≤ 0 ou inválido vira null ("pendente"). */
function numOrNull(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizarNatureza(valor: string | null | undefined): NaturezaProduto {
  return valor === "composto" || valor === "insumo" ? valor : "simples";
}

/** Classe de badge do semáforo sobre os tokens .eq2-* existentes. */
export function badgeClassDoSemaforo(semaforo: SemaforoMargem): string {
  return semaforo === "verde" ? "eq2-badge eq2-badge--ok" : semaforo === "amarelo" ? "eq2-badge eq2-badge--estimado" : "eq2-badge eq2-badge--low";
}

/** Monta um item do modelo a partir das colunas cruas (custoDaFicha já resolvido). */
function montarItem(
  linha: {
    id: string;
    nome: string;
    unidade: string;
    natureza: NaturezaProduto;
    preco: number | null;
    precoCusto: number | null;
    ultimoPrecoCompra: number | null;
  },
  custoFicha: number | null
): MargemItem {
  const preco = linha.preco;
  const custoDireto = linha.precoCusto;
  const usaFicha = custoDireto === null && linha.natureza === "composto" && custoFicha !== null;
  const custo = custoDireto ?? (usaFicha ? custoFicha : null);
  const margemReais = preco !== null && custo !== null ? preco - custo : null;
  const margemPct = preco !== null && custo !== null ? (preco - custo) / preco : null;

  let semaforo: SemaforoMargem = "vermelho";
  if (margemPct !== null) {
    semaforo = margemPct >= 0.6 ? "verde" : margemPct >= 0.3 ? "amarelo" : "vermelho";
  }

  return {
    produtoId: linha.id,
    nome: linha.nome,
    unidade: linha.unidade,
    natureza: linha.natureza,
    preco,
    custo,
    custoVemDaFicha: usaFicha,
    margemReais,
    margemPct,
    semaforo,
    ultimoPrecoCompra: linha.ultimoPrecoCompra,
  };
}

function itemDaLinhaDb(db: DBMargemProduto, custoFicha: number | null): MargemItem {
  return montarItem(
    {
      id: String(db.id),
      nome: db.nome_produto || "Sem nome",
      unidade: db.unidade || "un",
      natureza: normalizarNatureza(db.natureza),
      preco: numOrNull(db.preco_varejo) ?? numOrNull(db.preco),
      precoCusto: numOrNull(db.preco_custo),
      ultimoPrecoCompra: numOrNull(db.ultimo_preco_compra),
    },
    custoFicha
  );
}

function itemDoMock(mock: Produto): MargemItem {
  return montarItem(
    {
      id: mock.id,
      nome: mock.nome,
      unidade: mock.unidade,
      natureza: mock.natureza ?? "simples",
      preco: numOrNull(mock.precoPromocional) ?? numOrNull(mock.precoVenda),
      // mapper do mock converte null→0; 0 aqui significa "pendente"
      precoCusto: numOrNull(mock.precoCusto),
      ultimoPrecoCompra: numOrNull(mock.ultimoPrecoCompra),
    },
    null
  );
}

/** Universo V2: vitrine ou não-insumo (mock e banco usam a mesma regra). */
function entraNoUniversoV2(natureza: NaturezaProduto, exibirVitrine: boolean | null | undefined): boolean {
  return exibirVitrine === true || natureza !== "insumo";
}

/**
 * Fallback simplificado do custo composto: soma(qtd × preco_custo) dos
 * componentes da ficha. Componente sem custo registrado é ignorado na soma;
 * sem nenhum componente com custo → null (pendente).
 */
async function carregarCustosDaFicha(
  empresaId: string,
  paisIds: number[]
): Promise<Map<number, number>> {
  const mapa = new Map<number, number>();
  if (paisIds.length === 0) return mapa;

  const { data, error } = await supabase
    .from("est_ficha_tecnica")
    .select("produto_pai_id, quantidade_por_unidade, me_produto!componente_id (id, preco_custo)")
    .eq("empresa_id", empresaId)
    .in("produto_pai_id", paisIds);

  if (error) {
    console.error("[useMargemV2] Falha ao ler a ficha técnica (fallback de custo):", error);
    return mapa;
  }

  for (const bruto of (data as unknown as DBFichaEmbed[] | null) || []) {
    const qtd = Number(bruto.quantidade_por_unidade);
    const custoComponente = numOrNull(bruto.me_produto?.preco_custo);
    if (!Number.isFinite(qtd) || qtd <= 0 || custoComponente === null) continue;
    mapa.set(bruto.produto_pai_id, (mapa.get(bruto.produto_pai_id) ?? 0) + qtd * custoComponente);
  }
  return mapa;
}

export interface UseMargemV2Return {
  itens: MargemItem[];
  loading: boolean;
  error: string | null;
  /** true quando a empresa não tem sessão e os dados vêm do mock (demo) */
  isFallback: boolean;
  /**
   * Mapa componente_id → produto_pai_id[] da ficha técnica da empresa.
   * Causa-raiz Bug MargemBranca: compras registram INSUMOS, mas a universo
   * da margem são compostos/vitrine — quem filtra por "comprado no período"
   * precisa expandir os ids comprados pelos pais (BOM) para cruzar os conjuntos.
   */
  paisDeComponente: Map<number, number[]>;
  recarregar: () => void;
}

/** Margem de todo o universo V2 da empresa — usado por Hoje e Margem. */
export function useMargemV2(): UseMargemV2Return {
  const { empresa, session, loading: authLoading } = useAuth();
  const empresaId = empresa?.id ?? null;
  const temSessao = session !== null;

  const [itens, setItens] = useState<MargemItem[]>([]);
  const [paisDeComponente, setPaisDeComponente] = useState<Map<number, number[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem login): mock local com o MESMO modelo (mock-first 07/09/2026)
    if (!temSessao) {
      const mocks = PRODUTOS.filter((p) =>
        entraNoUniversoV2(p.natureza ?? "simples", p.exibirVitrine)
      ).map(itemDoMock);
      setItens(mocks);
      setPaisDeComponente(new Map());
      setIsFallback(true);
      setLoading(false);
      return;
    }

    if (!empresaId) {
      setItens([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error: prodError } = await supabase
        .from("me_produto")
        .select("id, empresa_id, nome_produto, unidade, natureza, exibir_vitrine, preco, preco_varejo, preco_custo, ultimo_preco_compra")
        .eq("ativo", true)
        .eq("empresa_id", empresaId)
        .order("nome_produto");

      if (prodError) throw prodError;

      const linhas = ((data as DBMargemProduto[] | null) || []).filter((db) =>
        entraNoUniversoV2(normalizarNatureza(db.natureza), db.exibir_vitrine)
      );

      // Fallback de custo: só compostos sem preco_custo disparam a leitura da BOM
      const paisCompostosSemCusto = linhas
        .filter((db) => normalizarNatureza(db.natureza) === "composto" && numOrNull(db.preco_custo) === null)
        .map((db) => db.id);
      const custosFicha = await carregarCustosDaFicha(empresaId, paisCompostosSemCusto);

      setItens(linhas.map((db) => itemDaLinhaDb(db, custosFicha.get(db.id) ?? null)));

      // Mapa componente → pais da ficha (expansão BOM do filtro "comprado).
      // Falha aqui é degradável (warn) — o filtro da página mostra tudo.
      try {
        const { data: fichaRows, error: fichaError } = await supabase
          .from("est_ficha_tecnica")
          .select("produto_pai_id, componente_id")
          .eq("empresa_id", empresaId);
        if (fichaError) throw fichaError;
        const mapa = new Map<number, number[]>();
        for (const f of (fichaRows as { produto_pai_id: number; componente_id: number }[] | null) || []) {
          const lista = mapa.get(f.componente_id) ?? [];
          lista.push(f.produto_pai_id);
          mapa.set(f.componente_id, lista);
        }
        setPaisDeComponente(mapa);
      } catch (fichaErr) {
        console.warn("[useMargemV2] Ficha técnica indisponível para expansão BOM do filtro:", fichaErr);
        setPaisDeComponente(new Map());
      }
    } catch (err) {
      console.error("[useMargemV2] Erro ao calcular margens:", err);
      setItens([]);
      setError(err instanceof Error ? err.message : "Erro ao calcular as margens");
    } finally {
      setLoading(false);
    }
  }, [empresaId, temSessao, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      carregarDados();
    }
  }, [carregarDados, authLoading]);

  return { itens, loading, error, isFallback, paisDeComponente, recarregar: carregarDados };
}

/* ------------------------------------------------------------------ */
/* Simulador: um produto + aplicação do preço sugerido                 */
/* ------------------------------------------------------------------ */

export interface ProdutoSimulador {
  produtoId: string;
  nome: string;
  unidade: string;
  natureza: NaturezaProduto;
  /** custo resolvido pelo modelo (preco_custo ou soma da ficha) */
  custo: number | null;
  custoVemDaFicha: boolean;
  /** preco_varejo ?? preco — o que o cliente paga hoje */
  precoPraticado: number | null;
  precoVarejo: number | null;
  precoBase: number | null;
  margemReais: number | null;
  margemPct: number | null;
  semaforo: SemaforoMargem;
}

export interface AplicarPrecoResultado {
  success: boolean;
  error?: string;
}

export interface UseMargemProdutoV2Return {
  produto: ProdutoSimulador | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  /** false quando não há sessão/empresa → botão "Aplicar" desabilitado (demo) */
  podeAplicar: boolean;
  aplicarPrecoSugerido: (novoPreco: number) => Promise<AplicarPrecoResultado>;
  recarregar: () => void;
}

/** Margem de UM produto por id (rota /estoque-v2/produtos/:id/simulador). */
export function useMargemProdutoV2(produtoId: string | undefined): UseMargemProdutoV2Return {
  const { empresa, session, loading: authLoading } = useAuth();
  const empresaId = empresa?.id ?? null;
  const temSessao = session !== null;

  const [produto, setProduto] = useState<ProdutoSimulador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    if (!produtoId) {
      setProduto(null);
      setLoading(false);
      return;
    }

    // MODO DEMO: produto vem do mock local (ids "p1", "p2", ...)
    if (!temSessao) {
      const mock = PRODUTOS.find((p) => p.id === produtoId);
      if (mock) {
        const item = itemDoMock(mock);
        setProduto({
          produtoId: item.produtoId,
          nome: item.nome,
          unidade: item.unidade,
          natureza: item.natureza,
          custo: item.custo,
          custoVemDaFicha: item.custoVemDaFicha,
          precoPraticado: item.preco,
          precoVarejo: numOrNull(mock.precoPromocional),
          precoBase: numOrNull(mock.precoVenda),
          margemReais: item.margemReais,
          margemPct: item.margemPct,
          semaforo: item.semaforo,
        });
        setIsFallback(true);
      } else {
        setProduto(null);
      }
      setLoading(false);
      return;
    }

    if (!empresaId) {
      setProduto(null);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setLoading(false);
      return;
    }

    // id de mock fora do ar logado não existe no banco → nada a consultar
    if (!Number.isInteger(Number(produtoId))) {
      setProduto(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error: prodError } = await supabase
        .from("me_produto")
        .select("id, empresa_id, nome_produto, unidade, natureza, exibir_vitrine, preco, preco_varejo, preco_custo, ultimo_preco_compra")
        .eq("id", Number(produtoId))
        .eq("empresa_id", empresaId)
        .maybeSingle();

      if (prodError) throw prodError;

      if (!data) {
        setProduto(null);
        return;
      }

      const db = data as DBMargemProduto;
      let custoFicha: number | null = null;
      if (normalizarNatureza(db.natureza) === "composto" && numOrNull(db.preco_custo) === null) {
        const mapa = await carregarCustosDaFicha(empresaId, [db.id]);
        custoFicha = mapa.get(db.id) ?? null;
      }
      const item = itemDaLinhaDb(db, custoFicha);

      setProduto({
        produtoId: item.produtoId,
        nome: item.nome,
        unidade: item.unidade,
        natureza: item.natureza,
        custo: item.custo,
        custoVemDaFicha: item.custoVemDaFicha,
        precoPraticado: item.preco,
        precoVarejo: numOrNull(db.preco_varejo),
        precoBase: numOrNull(db.preco),
        margemReais: item.margemReais,
        margemPct: item.margemPct,
        semaforo: item.semaforo,
      });
    } catch (err) {
      console.error("[useMargemProdutoV2] Erro ao carregar o produto:", err);
      setProduto(null);
      setError(err instanceof Error ? err.message : "Erro ao carregar o produto");
    } finally {
      setLoading(false);
    }
  }, [empresaId, temSessao, authLoading, produtoId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const aplicarPrecoSugerido = useCallback(
    async (novoPreco: number): Promise<AplicarPrecoResultado> => {
      if (!temSessao) {
        return { success: false, error: "Faça login para aplicar o preço — este é um preview com dados de demonstração." };
      }
      if (!empresaId) {
        return { success: false, error: "Empresa não identificada. Recarregue a página e tente de novo." };
      }
      if (!produtoId || !Number.isInteger(Number(produtoId))) {
        return { success: false, error: "Produto inválido para gravação." };
      }
      if (!Number.isFinite(novoPreco) || novoPreco <= 0) {
        return { success: false, error: "Preço sugerido inválido." };
      }

      try {
        const { error: updateError } = await supabase
          .from("me_produto")
          .update({ preco_varejo: Math.round(novoPreco * 100) / 100 })
          .eq("id", Number(produtoId))
          .eq("empresa_id", empresaId);

        if (updateError) throw updateError;
        return { success: true };
      } catch (err) {
        console.error("[useMargemProdutoV2] Erro ao aplicar o preço:", err);
        return { success: false, error: err instanceof Error ? err.message : "Não foi possível aplicar o preço." };
      }
    },
    [empresaId, produtoId, temSessao]
  );

  return {
    produto,
    loading,
    error,
    isFallback,
    podeAplicar: temSessao && empresaId !== null,
    aplicarPrecoSugerido,
    recarregar: carregarDados,
  };
}
