/**
 * Dados da tela Produção (redesign Compro·Faço·Vendo — estoque v2).
 *
 * - **Leitura:** `me_produto` natureza='composto' (ativo) + a ficha de cada pai
 *   numa única query em `est_ficha_tecnica` (embed do componente com o estoque
 *   atual — `me_produto!componente_id`, hint obrigatório pela dupla FK) +
 *   últimas ordens de produção (`est_ordem_producao`, embed do pai).
 * - **Escrita ("Produzir"):** gravação client-side SEQUENCIAL (sem transaction),
 *   conforme decisão do redesign v2: baixa de estoque de cada insumo (UPDATE
 *   `me_produto.estoque_atual` + INSERT `est_movimentacao` 'saida'), entrada do
 *   acabado (UPDATE + INSERT 'entrada'), INSERT `est_ordem_producao` +
 *   `est_ordem_producao_item`. Qualquer falha no meio devolve
 *   `{ ok:false, parcial:true }` para a tela alertar "produção parcial".
 *   (Nota: existe RPC atômica `registrar_producao` legada — o v2 não a usa,
 *   por pedido explícito do SPEC do redesign; registrar em pendência.)
 * - **Sem sessão (modo demo):** dataset local pequeno permite PRÉ-VISUALIZAR o
 *   consumo; `produzir()` é bloqueado pela tela (botão desabilitado com hint).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { perdaAplicada, receitasMaximas } from "../lib/conversao";
import type { OrdemProducao } from "../types/producao";

/* ────────────────────────────── tipos ────────────────────────────── */

export interface ProducaoItem {
  /** `me_produto.id` do componente */
  componenteId: string;
  nome: string;
  /** unidade de estoque do componente */
  unidade: string;
  unidadeCompra: string | null;
  fatorConversao: number | null;
  estoqueAtual: number;
  /** quantidade por 1 unidade do pai, na unidade do componente */
  quantidadePorUnidade: number;
  perdaPct: number;
  /** custo por unidade de estoque (preco_custo ?? ultimo_preco_compra ÷ fator) */
  custoUnitarioBase: number | null;
}

export interface ProducaoComposto {
  id: string;
  nome: string;
  unidade: string;
  rendimentoLote: number | null;
  estoqueAtual: number;
  precoVarejo: number | null;
  itens: ProducaoItem[];
}

export interface ConsumoPrevistoV2 {
  item: ProducaoItem;
  /** quanto sai do estoque neste lote (unidade do componente, já com perda) */
  consumo: number;
  estoqueDisponivel: number;
  suficiente: boolean;
  /** quanto falta (0 quando suficiente), na unidade do componente */
  falta: number;
  /** `Math.ceil(falta ÷ fator)` quando o insumo tem unidade de compra; senão null */
  faltamPacotes: number | null;
  unidadeCompra: string | null;
  /** custo da linha neste lote (custo base null → 0 + pendente na UI) */
  custoLinha: number;
}

export interface ProduzirResultado {
  ok: boolean;
  /** false quando uma etapa falhou DEPOIS de outras já terem gravado */
  parcial?: boolean;
  etapa?: string;
  error?: string;
  /** unidades do acabado que entraram (lotes × rendimento) */
  unidadesProduzidas?: number;
  custoTotal?: number;
  custoUnit?: number;
  consumos?: ConsumoPrevistoV2[];
}

/* ─────────────────────────── helpers numéricos ─────────────────────────── */

function num(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function num0(valor: string | number | null | undefined): number {
  return num(valor) ?? 0;
}

/** `preco_custo` (média da Fase 2) → senão último preço ÷ fator → senão null. */
function custoUnitarioBaseDB(
  precoCusto: number | null,
  ultimoPrecoCompra: number | null,
  fator: number | null
): number | null {
  if (precoCusto != null && precoCusto > 0) return precoCusto;
  if (ultimoPrecoCompra != null && ultimoPrecoCompra > 0) {
    return ultimoPrecoCompra / (fator && fator > 0 ? fator : 1);
  }
  return null;
}

/** Consumo de um componente por LOTE (receita): qtd/un × rendimento × (1+perda). */
export function consumoPorLote(item: ProducaoItem, rendimento: number): number {
  return perdaAplicada(item.quantidadePorUnidade * rendimento, item.perdaPct);
}

/**
 * Pré-visualização do consumo para `lotes` receitas: a conta da tela
 * ("Você vai consumir X g de cada insumo") + falta em unidades compráveis.
 */
export function calcularConsumos(composto: ProducaoComposto, lotes: number): ConsumoPrevistoV2[] {
  const rendimento = composto.rendimentoLote && composto.rendimentoLote > 0 ? composto.rendimentoLote : 1;
  return composto.itens.map((item) => {
    const consumo = consumoPorLote(item, rendimento) * lotes;
    const falta = Math.max(0, consumo - item.estoqueAtual);
    const temFator = item.fatorConversao != null && item.fatorConversao > 0;
    return {
      item,
      consumo,
      estoqueDisponivel: item.estoqueAtual,
      suficiente: falta <= 0.0001,
      falta,
      faltamPacotes: falta > 0 && temFator ? Math.ceil(falta / (item.fatorConversao as number)) : null,
      unidadeCompra: item.unidadeCompra,
      custoLinha: item.custoUnitarioBase == null ? 0 : consumo * item.custoUnitarioBase,
    };
  });
}

/** Máximo de lotes que o estoque alcança (legenda "dá para até N"). */
export function lotesMaximos(composto: ProducaoComposto): { max: number; limiteId: string | null } {
  const rendimento = composto.rendimentoLote && composto.rendimentoLote > 0 ? composto.rendimentoLote : 1;
  const estoques: Record<string, number> = {};
  for (const i of composto.itens) estoques[i.componenteId] = i.estoqueAtual;
  return receitasMaximas(
    composto.itens.map((i) => ({ componenteId: i.componenteId, necessario: consumoPorLote(i, rendimento) })),
    estoques
  );
}

/** Custo por unidade do acabado (soma das linhas da ficha, com perda). */
export function custoPorUnidadeAcabado(composto: ProducaoComposto): number | null {
  if (composto.itens.length === 0) return null;
  let total = 0;
  for (const i of composto.itens) {
    if (i.custoUnitarioBase == null) return null; // custo pendente contamina a conta
    total += perdaAplicada(i.quantidadePorUnidade, i.perdaPct) * i.custoUnitarioBase;
  }
  return total;
}

/** "faltam 120 g ≈ 1 lata" / "faltam 120 g (conversão pendente)". */
export function textoFalta(c: Pick<ConsumoPrevistoV2, "item" | "falta" | "faltamPacotes" | "unidadeCompra">): string {
  const q = fmtQtd(c.falta, c.item.unidade);
  if (c.faltamPacotes != null && c.unidadeCompra) {
    const un = c.faltamPacotes === 1 ? c.unidadeCompra : `${c.unidadeCompra}s`;
    return `faltam ${q} ≈ ${c.faltamPacotes} ${un}`;
  }
  return `faltam ${q} (conversão pendente)`;
}

function fmtQtd(v: number, unidade: string): string {
  const arred = Math.round(v * 1000) / 1000;
  return `${arred.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unidade}`;
}

/* ─────────────────────────── linhas do banco ─────────────────────────── */

interface DBComposto {
  id: number;
  nome_produto: string | null;
  unidade: string | null;
  rendimento_lote: string | number | null;
  estoque_atual: string | number | null;
  preco_varejo: string | number | null;
}

interface DBFichaRow {
  produto_pai_id: number;
  componente_id: number;
  quantidade_por_unidade: string | number;
  perda_pct: string | number;
  me_produto: {
    nome_produto: string | null;
    unidade: string | null;
    unidade_compra: string | null;
    fator_conversao: string | number | null;
    preco_custo: string | number | null;
    ultimo_preco_compra: string | number | null;
    estoque_atual: string | number | null;
  } | null;
}

interface DBOp {
  id: string;
  produto_pai_id: number;
  quantidade: string | number;
  custo_total: string | number;
  custo_unit: string | number;
  data_producao: string;
  observacao: string | null;
  status?: string | null;
  estornado_em?: string | null;
  me_produto: { nome_produto: string | null } | null;
}

function mapOp(db: DBOp): OrdemProducao {
  return {
    id: db.id,
    produtoPaiId: String(db.produto_pai_id),
    produtoNome: db.me_produto?.nome_produto || undefined,
    quantidade: num0(db.quantidade),
    custoTotal: num0(db.custo_total),
    custoUnit: num0(db.custo_unit),
    dataProducao: db.data_producao,
    observacao: db.observacao || null,
    status: db.status === "ESTORNADA" ? "ESTORNADA" : "ATIVA",
    estornadoEm: db.estornado_em || null,
  };
}

/* ───────────────────────────── demo (sem sessão) ───────────────────────────── */

/**
 * Modo demo: dataset local para a PRÉ-VISUALIZAÇÃO funcionar sem login
 * (regra do redesign: preview ok, "Produzir" bloqueado). Números plausíveis
 * da Doceê — nada aqui é gravado.
 */
const COMPOSTOS_DEMO: ProducaoComposto[] = [
  {
    id: "demo-recheio",
    nome: "Recheio de limão",
    unidade: "g",
    rendimentoLote: 595,
    estoqueAtual: 1200,
    precoVarejo: null,
    itens: [
      {
        componenteId: "demo-leite",
        nome: "Leite condensado",
        unidade: "g",
        unidadeCompra: "lata",
        fatorConversao: 395,
        estoqueAtual: 275,
        quantidadePorUnidade: 395,
        perdaPct: 0,
        custoUnitarioBase: 0.0139,
      },
      {
        componenteId: "demo-creme",
        nome: "Creme de leite",
        unidade: "g",
        unidadeCompra: "caixa",
        fatorConversao: 200,
        estoqueAtual: 620,
        quantidadePorUnidade: 200,
        perdaPct: 0,
        custoUnitarioBase: 0.01445,
      },
      {
        componenteId: "demo-limao",
        nome: "Limão taiti",
        unidade: "un",
        unidadeCompra: null,
        fatorConversao: null,
        estoqueAtual: 9,
        quantidadePorUnidade: 2,
        perdaPct: 0,
        custoUnitarioBase: 0.8,
      },
    ],
  },
  {
    id: "demo-brigadeiro",
    nome: "Brigadeiro",
    unidade: "un",
    rendimentoLote: 20,
    estoqueAtual: 14,
    precoVarejo: 3.5,
    itens: [
      {
        componenteId: "demo-leite",
        nome: "Leite condensado",
        unidade: "g",
        unidadeCompra: "lata",
        fatorConversao: 395,
        estoqueAtual: 275,
        quantidadePorUnidade: 395,
        perdaPct: 0,
        custoUnitarioBase: 0.0139,
      },
      {
        componenteId: "demo-choco",
        nome: "Chocolate ao leite",
        unidade: "g",
        unidadeCompra: "pacote",
        fatorConversao: 1000,
        estoqueAtual: 1500,
        quantidadePorUnidade: 300,
        perdaPct: 0,
        custoUnitarioBase: 0.0489,
      },
      {
        componenteId: "demo-manteiga",
        nome: "Manteiga",
        unidade: "g",
        unidadeCompra: "pacote",
        fatorConversao: 200,
        estoqueAtual: 340,
        quantidadePorUnidade: 20,
        perdaPct: 0,
        custoUnitarioBase: 0.045,
      },
    ],
  },
];

/* ─────────────────────────────── hook ─────────────────────────────── */

export interface UseProducaoV2Return {
  compostos: ProducaoComposto[];
  ordens: OrdemProducao[];
  loading: boolean;
  error: string | null;
  /** false = modo demo (sem login) */
  temSessao: boolean;
  isFallback: boolean;
  produzindo: boolean;
  recarregar: () => void;
  produzir: (composto: ProducaoComposto, lotes: number) => Promise<ProduzirResultado>;
}

export function useProducaoV2(): UseProducaoV2Return {
  const { empresa, session, user, loading: authLoading } = useAuth();
  const empresaId = empresa?.id ?? null;
  const temSessao = session !== null;

  const [compostos, setCompostos] = useState<ProducaoComposto[]>([]);
  const [ordens, setOrdens] = useState<OrdemProducao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [produzindo, setProduzindo] = useState(false);
  const primeiraCarga = useRef(true);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    if (primeiraCarga.current) setLoading(true);
    setError(null);

    // Modo demo: compostos locais para pré-visualizar; ordens = nenhuma
    if (!temSessao || !empresaId) {
      if (!temSessao) {
        setCompostos(COMPOSTOS_DEMO);
        setIsFallback(true);
        setOrdens([]);
        setLoading(false);
        primeiraCarga.current = false;
        return;
      }
      setCompostos([]);
      setIsFallback(false);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    try {
      // 1) pais compostos
      const { data: paisData, error: paisError } = await supabase
        .from("me_produto")
        .select("id, nome_produto, unidade, rendimento_lote, estoque_atual, preco_varejo")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .eq("natureza", "composto")
        .order("nome_produto");
      if (paisError) throw paisError;
      const pais = ((paisData as DBComposto[] | null) || []).filter((p) => p.id != null);
      const ids = pais.map((p) => p.id);

      // 2) ficha de todos os pais numa query só
      let fichaRows: DBFichaRow[] = [];
      if (ids.length > 0) {
        const { data, error: fichaError } = await supabase
          .from("est_ficha_tecnica")
          .select(
            "produto_pai_id, componente_id, quantidade_por_unidade, perda_pct, " +
              "me_produto!componente_id (nome_produto, unidade, unidade_compra, fator_conversao, preco_custo, ultimo_preco_compra, estoque_atual)"
          )
          .eq("empresa_id", empresaId)
          .in("produto_pai_id", ids);
        if (fichaError) throw fichaError;
        fichaRows = (data as unknown as DBFichaRow[] | null) || [];
      }

      // 3) últimas 5 ordens de produção
      const { data: opData, error: opError } = await supabase
        .from("est_ordem_producao")
        .select("id, produto_pai_id, quantidade, custo_total, custo_unit, data_producao, observacao, status, estornado_em, me_produto(nome_produto)")
        .eq("empresa_id", empresaId)
        .order("data_producao", { ascending: false })
        .limit(5);
      if (opError) throw opError;

      const mapaFicha = new Map<number, ProducaoItem[]>();
      for (const row of fichaRows) {
        const item: ProducaoItem = {
          componenteId: String(row.componente_id),
          nome: row.me_produto?.nome_produto || "Sem nome",
          unidade: row.me_produto?.unidade || "un",
          unidadeCompra: row.me_produto?.unidade_compra ?? null,
          fatorConversao: num(row.me_produto?.fator_conversao),
          estoqueAtual: num0(row.me_produto?.estoque_atual),
          quantidadePorUnidade: num0(row.quantidade_por_unidade),
          perdaPct: num0(row.perda_pct),
          custoUnitarioBase: custoUnitarioBaseDB(
            num(row.me_produto?.preco_custo),
            num(row.me_produto?.ultimo_preco_compra),
            num(row.me_produto?.fator_conversao)
          ),
        };
        const lista = mapaFicha.get(row.produto_pai_id) ?? [];
        lista.push(item);
        mapaFicha.set(row.produto_pai_id, lista);
      }

      setCompostos(
        pais.map((p) => ({
          id: String(p.id),
          nome: p.nome_produto || "Sem nome",
          unidade: p.unidade || "un",
          rendimentoLote: num(p.rendimento_lote),
          estoqueAtual: num0(p.estoque_atual),
          precoVarejo: num(p.preco_varejo),
          itens: mapaFicha.get(p.id) ?? [],
        }))
      );
      setOrdens(((opData as unknown as DBOp[] | null) || []).map(mapOp));
      setIsFallback(false);
    } catch (err) {
      console.error("[useProducaoV2] Erro ao carregar a produção:", err);
      setCompostos([]);
      setOrdens([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar a produção");
    } finally {
      setLoading(false);
      primeiraCarga.current = false;
    }
  }, [empresaId, temSessao, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  /* ───────────────────── escrita: produzir (sequencial, sem transaction) ───────────────────── */

  const produzir = useCallback(
    async (composto: ProducaoComposto, lotes: number): Promise<ProduzirResultado> => {
      if (!temSessao || !empresaId) {
        return { ok: false, error: "Faça login para registrar a produção (modo demo só pré-visualiza)." };
      }
      if (!Number.isInteger(Number(composto.id))) {
        return { ok: false, error: "Produto inválido no modo demo — nada foi gravado." };
      }
      if (!(lotes > 0)) {
        return { ok: false, error: "A quantidade de lotes precisa ser maior que zero." };
      }

      const rendimento =
        composto.rendimentoLote && composto.rendimentoLote > 0 ? composto.rendimentoLote : 1;
      const unidadesProduzidas = Math.max(1, Math.round(lotes * rendimento));
      const consumos = calcularConsumos(composto, lotes);
      const custoTotal = consumos.reduce((s, c) => s + c.custoLinha, 0);
      const custoUnit = unidadesProduzidas > 0 ? custoTotal / unidadesProduzidas : 0;
      const agora = new Date().toISOString();
      const usuarioId = user?.id ?? null;

      setProduzindo(true);
      try {
        // 1) sai cada insumo: UPDATE estoque (clamp em 0) + movimentação 'saida'
        for (const c of consumos) {
          const baixo = Math.max(0, Math.round(c.consumo * 1000) / 1000);
          if (baixo <= 0) continue;
          const novoEstoque = Math.max(0, Math.round(c.item.estoqueAtual - baixo));
          const { error: updError } = await supabase
            .from("me_produto")
            .update({ estoque_atual: novoEstoque })
            .eq("id", Number(c.item.componenteId))
            .eq("empresa_id", empresaId);
          if (updError) {
            return falhaParcial(`baixa de estoque de ${c.item.nome}`, updError.message, consumos);
          }
          const { error: movError } = await supabase.from("est_movimentacao").insert({
            empresa_id: empresaId,
            produto_id: Number(c.item.componenteId),
            tipo: "saida",
            quantidade: baixo,
            motivo: "Produção",
            usuario_id: usuarioId,
            data_movimentacao: agora,
          });
          if (movError) {
            return falhaParcial(`movimentação de saída de ${c.item.nome}`, movError.message, consumos);
          }
        }

        // 2) entra o acabado: UPDATE estoque do pai + movimentação 'entrada'
        const { error: updPaiError } = await supabase
          .from("me_produto")
          .update({ estoque_atual: Math.round(composto.estoqueAtual + unidadesProduzidas) })
          .eq("id", Number(composto.id))
          .eq("empresa_id", empresaId);
        if (updPaiError) {
          return falhaParcial("entrada do produto no estoque", updPaiError.message, consumos);
        }
        const { error: movPaiError } = await supabase.from("est_movimentacao").insert({
          empresa_id: empresaId,
          produto_id: Number(composto.id),
          tipo: "entrada",
          quantidade: unidadesProduzidas,
          motivo: "Produção",
          usuario_id: usuarioId,
          data_movimentacao: agora,
        });
        if (movPaiError) {
          return falhaParcial("movimentação de entrada do produto", movPaiError.message, consumos);
        }

        // 3) ordem de produção + itens (auditoria do consumo real)
        const { data: opRow, error: opError } = await supabase
          .from("est_ordem_producao")
          .insert({
            empresa_id: empresaId,
            produto_pai_id: Number(composto.id),
            quantidade: unidadesProduzidas,
            custo_total: Math.round(custoTotal * 100) / 100,
            custo_unit: Math.round(custoUnit * 10000) / 10000,
            status: "ATIVA",
            data_producao: agora,
            usuario_id: usuarioId,
          })
          .select("id")
          .single();
        if (opError) {
          return falhaParcial("registro da ordem de produção", opError.message, consumos);
        }
        const ordemId = (opRow as { id: string } | null)?.id;
        if (ordemId) {
          const itensOp = consumos
            .filter((c) => Math.round(c.consumo * 1000) / 1000 > 0)
            .map((c) => ({
              ordem_id: ordemId,
              produto_id: Number(c.item.componenteId),
              quantidade_consumida: Math.round(c.consumo * 1000) / 1000,
              custo_medio_usado: c.item.custoUnitarioBase ?? 0,
              custo_item: Math.round(c.custoLinha * 100) / 100,
            }));
          if (itensOp.length > 0) {
            const { error: itemError } = await supabase.from("est_ordem_producao_item").insert(itensOp);
            if (itemError) {
              return falhaParcial("registro dos itens da ordem", itemError.message, consumos);
            }
          }
        }

        await carregarDados();
        return {
          ok: true,
          unidadesProduzidas,
          custoTotal: Math.round(custoTotal * 100) / 100,
          custoUnit: Math.round(custoUnit * 10000) / 10000,
          consumos,
        };
      } finally {
        setProduzindo(false);
      }
    },
    [temSessao, empresaId, user, carregarDados]
  );

  return {
    compostos,
    ordens,
    loading,
    error,
    temSessao,
    isFallback,
    produzindo,
    recarregar: carregarDados,
    produzir,
  };
}

/** Monta o resultado de "produção parcial" (etapa + mensagem crua do banco). */
function falhaParcial(etapa: string, mensagem: string, consumos: ConsumoPrevistoV2[]): ProduzirResultado {
  console.error(`[useProducaoV2] Produção parcial em "${etapa}":`, mensagem);
  return { ok: false, parcial: true, etapa, error: mensagem, consumos };
}
