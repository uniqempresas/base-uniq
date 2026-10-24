/**
 * Hooks da visão INSUMOS — redesign estoque v2 (tracking/Redesign_ComproVendoFaco/
 * insumos-lista.html + insumo-detalhe.html).
 *
 * Padrão de dados espelha `use-produtos.ts` / `use-compras.ts` / `use-ficha-tecnica.ts`:
 * - client `src/lib/supabase` + `useAuth()`; TODA query escopada por `empresa_id`;
 * - embed `me_categoria` para categoria real (nunca `tipo`, legado);
 * - `numeric` pode chegar como string → normalizador defensivo;
 * - mock-first (regra 07/09/2026): sem sessão → lista demo com `isFallback: true`;
 *   logado e 0 linhas → empty REAL (nunca mock de outro tenant).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { precoUnitarioBase } from "../components/estoque-v2/shared/utils";
import type { NaturezaProduto } from "../types/producao";

/* ───────────────────────────── domínio UI ───────────────────────────── */

export interface InsumoV2 {
  id: number;
  nome: string;
  /** `me_categoria.nome_categoria` via embed; ausente → "Sem categoria" */
  categoriaNome: string;
  categoriaId: number | null;
  /** unidade de ESTOQUE (`me_produto.unidade`) — a base de custo (g, ml, un…) */
  unidade: string;
  /** unidade de COMPRA (`me_produto.unidade_compra`) — lata, pacote, dúzia… */
  unidadeCompra: string | null;
  /** `fator_conversao` — qtd de unidades de estoque dentro de 1 unidade de compra */
  fatorConversao: number | null;
  /** `me_produto.preco` — preço pago no pack (compra), por unidade de COMPRA */
  preco: number | null;
  /** custo médio por unidade de ESTOQUE (weighted average gravado pela RPC ao receber) */
  precoCusto: number | null;
  /** U2: último preço pago por unidade de COMPRA */
  ultimoPrecoCompra: number | null;
  ultimaCompraEm: string | null;
  estoque: number;
  estoqueMinimo: number;
}

/** Receita (produto-pai) que consome este insumo — linha de `est_ficha_tecnica`. */
export interface ReceitaUsoV2 {
  paiId: number;
  nome: string;
  unidade: string;
  natureza: NaturezaProduto;
  /** quantidade do insumo por 1 unidade do pai, na unidade base do insumo */
  quantidadePorUnidade: number;
}

/** Nota de compra — snapshot de `est_recebimento`. */
export interface RecebimentoV2 {
  id: string;
  recebidoEm: string;
  /** custo por unidade de ESTOQUE no recebimento (alimenta o sparkline) */
  custoUnitario: number;
  qtdMovimento: number;
  notaFiscal: string | null;
  estornado: boolean;
}

/** Última movimentação de `est_movimentacao` (entrada/saida/ajuste). */
export interface MovimentacaoResumoV2 {
  tipo: string;
  quantidade: number;
  dataMovimentacao: string;
  motivo: string | null;
}

/* ───────────────────────────── helpers ───────────────────────────── */

/** `numeric` pode chegar como string no client; null/""/NaN → null (padrão use-produtos). */
function normalizarNumero(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function normalizarNatureza(valor: string | null | undefined): NaturezaProduto {
  return valor === "composto" || valor === "insumo" ? valor : "simples";
}

/**
 * Custo unitário em destaque no redesign (R$/g, R$/un…): preço da EMBALAGEM
 * (última compra, com `preco` do pack como fallback) ÷ fator de conversão —
 * exatamente a conta do recibo "1 lata = 395 g → R$ 0,0139/g".
 * Sem fator válido, cai no custo médio real (`preco_custo`, que a RPC já grava
 * por unidade de estoque). Nada → null (card mostra "—/estimado").
 */
export function taxaUnitariaInsumo(
  i: Pick<InsumoV2, "unidade" | "preco" | "precoCusto" | "ultimoPrecoCompra" | "fatorConversao">,
): { valor: number; unidade: string; origem: "compra" | "custo" } | null {
  const unidade = i.unidade || "un";
  const viaPack = precoUnitarioBase(i.ultimoPrecoCompra ?? i.preco, i.fatorConversao);
  if (viaPack != null && viaPack > 0) return { valor: viaPack, unidade, origem: "compra" };
  if (i.precoCusto != null && i.precoCusto > 0) return { valor: i.precoCusto, unidade, origem: "custo" };
  return null;
}

/** Preço unitário "R$ 0,0139" — 2 casas ≥ R$ 1, até 4 casas abaixo (nº pt-BR). */
export function formatarTaxa(valor: number): string {
  const max = valor >= 1 ? 2 : 4;
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: max })}`;
}

/* ───────────────────────────── demo (mock-first) ───────────────────────────── */
// Nunca usar nomes de tenant real. Valores plausíveis de doceria de Suzano.

const INSUMOS_DEMO: InsumoV2[] = [
  { id: 901, nome: "Leite condensado", categoriaNome: "Laticínios", categoriaId: 901, unidade: "g", unidadeCompra: "lata", fatorConversao: 395, preco: 5.49, precoCusto: 0.0139, ultimoPrecoCompra: 5.49, ultimaCompraEm: "2026-10-18T12:00:00Z", estoque: 2400, estoqueMinimo: 800 },
  { id: 902, nome: "Creme de leite", categoriaNome: "Laticínios", categoriaId: 901, unidade: "g", unidadeCompra: "caixa", fatorConversao: 200, preco: 4.9, precoCusto: 0.0145, ultimoPrecoCompra: 4.9, ultimaCompraEm: "2026-10-18T12:00:00Z", estoque: 1800, estoqueMinimo: 600 },
  { id: 903, nome: "Chocolate ao leite", categoriaNome: "Doces", categoriaId: 902, unidade: "g", unidadeCompra: "kg", fatorConversao: 1000, preco: 48.9, precoCusto: 0.0489, ultimoPrecoCompra: 48.9, ultimaCompraEm: "2026-10-05T12:00:00Z", estoque: 3200, estoqueMinimo: 1000 },
  { id: 904, nome: "Farinha de trigo", categoriaNome: "Doces", categoriaId: 902, unidade: "g", unidadeCompra: "pacote", fatorConversao: 1000, preco: 4.8, precoCusto: 0.0048, ultimoPrecoCompra: 4.8, ultimaCompraEm: "2026-09-28T12:00:00Z", estoque: 900, estoqueMinimo: 1000 },
  { id: 905, nome: "Ovos", categoriaNome: "Hortifrúti", categoriaId: 903, unidade: "un", unidadeCompra: "dúzia", fatorConversao: 12, preco: 12.0, precoCusto: 1.0, ultimoPrecoCompra: 12.0, ultimaCompraEm: "2026-10-20T12:00:00Z", estoque: 60, estoqueMinimo: 24 },
  { id: 906, nome: "Limão tahiti", categoriaNome: "Hortifrúti", categoriaId: 903, unidade: "un", unidadeCompra: "kg", fatorConversao: null, preco: null, precoCusto: null, ultimoPrecoCompra: null, ultimaCompraEm: null, estoque: 8, estoqueMinimo: 10 },
];

const RECEITAS_DEMO: Record<number, ReceitaUsoV2[]> = {
  901: [
    { paiId: 801, nome: "Recheio de limão", unidade: "g", natureza: "composto", quantidadePorUnidade: 55 },
    { paiId: 802, nome: "Brigadeiro", unidade: "g", natureza: "composto", quantidadePorUnidade: 20 },
    { paiId: 803, nome: "Bolo de pote", unidade: "g", natureza: "composto", quantidadePorUnidade: 80 },
    { paiId: 804, nome: "Torta de limão", unidade: "g", natureza: "composto", quantidadePorUnidade: 120 },
  ],
  902: [
    { paiId: 804, nome: "Torta de limão", unidade: "g", natureza: "composto", quantidadePorUnidade: 120 },
    { paiId: 803, nome: "Bolo de pote", unidade: "g", natureza: "composto", quantidadePorUnidade: 60 },
  ],
  903: [
    { paiId: 802, nome: "Brigadeiro", unidade: "g", natureza: "composto", quantidadePorUnidade: 45 },
  ],
};

const RECEBIMENTOS_DEMO: Record<number, RecebimentoV2[]> = {
  901: [
    { id: "d1", recebidoEm: "2026-05-10T12:00:00Z", custoUnitario: 0.0128, qtdMovimento: 1580, notaFiscal: "NF 1043", estornado: false },
    { id: "d2", recebidoEm: "2026-06-12T12:00:00Z", custoUnitario: 0.0125, qtdMovimento: 1185, notaFiscal: "NF 1187", estornado: false },
    { id: "d3", recebidoEm: "2026-07-15T12:00:00Z", custoUnitario: 0.0131, qtdMovimento: 790, notaFiscal: "NF 1320", estornado: false },
    { id: "d4", recebidoEm: "2026-08-20T12:00:00Z", custoUnitario: 0.0136, qtdMovimento: 1580, notaFiscal: "NF 1502", estornado: false },
    { id: "d5", recebidoEm: "2026-09-14T12:00:00Z", custoUnitario: 0.0141, qtdMovimento: 790, notaFiscal: "NF 1655", estornado: false },
    { id: "d6", recebidoEm: "2026-10-18T12:00:00Z", custoUnitario: 0.0139, qtdMovimento: 1185, notaFiscal: "NF 1801", estornado: false },
  ],
};

const ULTIMA_MOV_DEMO: Record<number, MovimentacaoResumoV2> = {
  901: { tipo: "entrada", quantidade: 1185, dataMovimentacao: "2026-10-18T12:00:00Z", motivo: "Compra" },
  902: { tipo: "entrada", quantidade: 800, dataMovimentacao: "2026-10-18T12:00:00Z", motivo: "Compra" },
  903: { tipo: "saida", quantidade: 700, dataMovimentacao: "2026-10-21T12:00:00Z", motivo: "Produção" },
  904: { tipo: "saida", quantidade: 500, dataMovimentacao: "2026-10-22T12:00:00Z", motivo: "Produção" },
  905: { tipo: "entrada", quantidade: 24, dataMovimentacao: "2026-10-20T12:00:00Z", motivo: "Compra" },
};

/* ───────────────────────────── mapper DB → UI ───────────────────────────── */

interface DBInsumo {
  id: number;
  nome_produto: string | null;
  categoria_id: number | null;
  preco: number | string | null;
  unidade_compra: string | null;
  fator_conversao: number | string | null;
  unidade: string | null;
  estoque_atual: number | string | null;
  estoque_minimo: number | string | null;
  preco_custo: number | string | null;
  ultimo_preco_compra: number | string | null;
  ultima_compra_em?: string | null;
  me_categoria: { id_categoria: number; nome_categoria: string | null; cor: string | null } | null;
}

const COLUNAS_LISTA =
  "id, nome_produto, categoria_id, preco, unidade_compra, fator_conversao, unidade, estoque_atual, estoque_minimo, preco_custo, ultimo_preco_compra, ultima_compra_em, me_categoria(id_categoria, nome_categoria, cor)";

function mapInsumo(db: DBInsumo): InsumoV2 {
  return {
    id: Number(db.id),
    nome: db.nome_produto || "Sem nome",
    categoriaNome: db.me_categoria?.nome_categoria || "Sem categoria",
    categoriaId: db.categoria_id ?? db.me_categoria?.id_categoria ?? null,
    unidade: db.unidade || "un",
    unidadeCompra: db.unidade_compra ?? null,
    fatorConversao: normalizarNumero(db.fator_conversao),
    preco: normalizarNumero(db.preco),
    precoCusto: normalizarNumero(db.preco_custo),
    ultimoPrecoCompra: normalizarNumero(db.ultimo_preco_compra),
    ultimaCompraEm: db.ultima_compra_em ?? null,
    estoque: normalizarNumero(db.estoque_atual) ?? 0,
    // estoque_minimo: NOT NULL DEFAULT 5 no banco; defensivo para linha sem a coluna
    estoqueMinimo: normalizarNumero(db.estoque_minimo) ?? 5,
  };
}

/* ───────────────────────────── hook: LISTA ───────────────────────────── */

export interface UseInsumosV2Return {
  insumos: InsumoV2[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}

export function useInsumosV2(): UseInsumosV2Return {
  const { empresa, session, loading: authLoading } = useAuth();
  // Dependências de VALOR (não de identidade) — padrão N7 do use-produtos:
  // evento de auth duplicado não pode re-consultar e fazer a lista "piscar".
  const empresaId = empresa?.id ?? null;
  const temSessao = session !== null;

  const [insumos, setInsumos] = useState<InsumoV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem login): mock realista — regra mock-first de 07/09/2026
    if (!temSessao) {
      setInsumos(INSUMOS_DEMO);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    // Logado mas empresa não resolvida: NÃO consultar outro tenant
    if (!empresaId) {
      setInsumos([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from("me_produto")
        .select(COLUNAS_LISTA)
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .eq("natureza", "insumo")
        .order("nome_produto");

      if (dbError) throw dbError;

      // 0 linhas = empresa nova = empty state real (nunca mock de outra empresa)
      setInsumos(((data as unknown as DBInsumo[] | null) || []).map(mapInsumo));
    } catch (err) {
      console.error("[useInsumosV2] Erro ao buscar insumos:", err);
      setInsumos([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar os insumos");
    } finally {
      setLoading(false);
    }
  }, [empresaId, temSessao, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { insumos, loading, error, isFallback, recarregar: carregarDados };
}

/* ───────────────────────────── hook: DETALHE ───────────────────────────── */

export interface UseInsumoV2Return {
  insumo: InsumoV2 | undefined;
  /** receitas (produtos-pai) que consomem este insumo */
  receitas: ReceitaUsoV2[];
  recebimentos: RecebimentoV2[];
  ultimaMovimentacao: MovimentacaoResumoV2 | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}

interface DBFichaLinha {
  produto_pai_id: number;
  quantidade_por_unidade: string | number;
  me_produto: { nome_produto: string | null; unidade: string | null; natureza: string | null } | null;
}

interface DBRecebimento {
  id: string;
  recebido_em: string;
  custo_unitario: string | number | null;
  qtd_movimento: string | number | null;
  estornado_em: string | null;
  est_compra: { nota_fiscal: string | null } | null;
}

interface DBMovimentacao {
  tipo: string;
  quantidade: string | number | null;
  data_movimentacao: string;
  motivo: string | null;
}

export function useInsumoV2(id: string | undefined): UseInsumoV2Return {
  const { empresa, session, loading: authLoading } = useAuth();
  const empresaId = empresa?.id ?? null;
  const temSessao = session !== null;

  const [insumo, setInsumo] = useState<InsumoV2 | undefined>(undefined);
  const [receitas, setReceitas] = useState<ReceitaUsoV2[]>([]);
  const [recebimentos, setRecebimentos] = useState<RecebimentoV2[]>([]);
  const [ultimaMovimentacao, setUltimaMovimentacao] = useState<MovimentacaoResumoV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const primeiraCarga = useRef(true);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    if (primeiraCarga.current) setLoading(true);
    setError(null);

    const idNum = Number(id);
    const idValido = id != null && id !== "" && Number.isInteger(idNum);

    // MODO DEMO (sem login): resolve do mock — mesmo contrato do use-produto
    if (!temSessao) {
      const demo = idValido ? INSUMOS_DEMO.find((i) => i.id === idNum) : undefined;
      setInsumo(demo ?? INSUMOS_DEMO[0]);
      setReceitas(demo ? RECEITAS_DEMO[demo.id] ?? [] : []);
      // sparkline: mais antigo → mais recente (ordem cronológica do gráfico)
      setRecebimentos(demo ? [...(RECEBIMENTOS_DEMO[demo.id] ?? [])] : []);
      setUltimaMovimentacao(demo ? ULTIMA_MOV_DEMO[demo.id] ?? null : null);
      setIsFallback(true);
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    if (!empresaId) {
      setInsumo(undefined);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    if (!idValido) {
      setInsumo(undefined);
      setReceitas([]);
      setRecebimentos([]);
      setUltimaMovimentacao(null);
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    setIsFallback(false);
    try {
      // 4 leituras independentes — nada de waterfall no primeiro paint do hero
      const [insumoRes, fichaRes, recebRes, movRes] = await Promise.all([
        supabase
          .from("me_produto")
          .select(COLUNAS_LISTA)
          .eq("id", idNum)
          .eq("empresa_id", empresaId)
          .maybeSingle(),
        supabase
          .from("est_ficha_tecnica")
          // Hint obrigatório: a tabela tem DUAS FKs para me_produto (pai e componente)
          .select(
            "produto_pai_id, quantidade_por_unidade, me_produto!produto_pai_id (nome_produto, unidade, natureza)",
          )
          .eq("empresa_id", empresaId)
          .eq("componente_id", idNum),
        supabase
          .from("est_recebimento")
          .select("id, recebido_em, custo_unitario, qtd_movimento, estornado_em, est_compra (nota_fiscal)")
          .eq("empresa_id", empresaId)
          .eq("produto_id", idNum)
          .order("recebido_em", { ascending: false })
          .limit(12),
        supabase
          .from("est_movimentacao")
          .select("tipo, quantidade, data_movimentacao, motivo")
          .eq("empresa_id", empresaId)
          .eq("produto_id", idNum)
          .order("data_movimentacao", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (insumoRes.error) throw insumoRes.error;

      setInsumo(insumoRes.data ? mapInsumo(insumoRes.data as unknown as DBInsumo) : undefined);

      const fichas = ((fichaRes.data as unknown as DBFichaLinha[] | null) || []).map(
        (f): ReceitaUsoV2 => ({
          paiId: Number(f.produto_pai_id),
          nome: f.me_produto?.nome_produto || "Receita sem nome",
          unidade: f.me_produto?.unidade || "un",
          natureza: normalizarNatureza(f.me_produto?.natureza),
          quantidadePorUnidade: normalizarNumero(f.quantidade_por_unidade) ?? 0,
        }),
      );
      setReceitas(fichas);

      const receb = ((recebRes.data as unknown as DBRecebimento[] | null) || []).map(
        (r): RecebimentoV2 => ({
          id: r.id,
          recebidoEm: r.recebido_em,
          custoUnitario: normalizarNumero(r.custo_unitario) ?? 0,
          qtdMovimento: normalizarNumero(r.qtd_movimento) ?? 0,
          notaFiscal: r.est_compra?.nota_fiscal ?? null,
          estornado: r.estornado_em != null,
        }),
      );
      // desc no SQL → asc para o sparkline; a lista de notas inverte no page
      setRecebimentos(receb.reverse());

      const mov = movRes.data as unknown as DBMovimentacao | null;
      setUltimaMovimentacao(
        mov
          ? {
              tipo: mov.tipo,
              quantidade: normalizarNumero(mov.quantidade) ?? 0,
              dataMovimentacao: mov.data_movimentacao,
              motivo: mov.motivo ?? null,
            }
          : null,
      );
    } catch (err) {
      console.error("[useInsumoV2] Erro ao carregar o insumo:", err);
      setInsumo(undefined);
      setError(err instanceof Error ? err.message : "Erro ao carregar o insumo");
    } finally {
      setLoading(false);
      primeiraCarga.current = false;
    }
  }, [empresaId, temSessao, authLoading, id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    insumo,
    receitas,
    recebimentos,
    ultimaMovimentacao,
    loading,
    error,
    isFallback,
    recarregar: carregarDados,
  };
}
