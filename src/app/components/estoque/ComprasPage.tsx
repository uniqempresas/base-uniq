/**
 * Compras de insumo — Produção Fase 2 (WIRE-Producao-Fase2-Compras v1.1, D11)
 * + TELA de compras (WIRE COMPRA_TELA_C1_C2 v1.0, C1 — 07/10).
 *
 * Lista real do banco (`useCompras`), KPIs derivados, Receber via RPC
 * `receber_compra` (estoque + custo médio + conta a pagar) e Cancelar.
 *
 * C1 — o "Nova compra" NÃO é mais modal desta página: o botão navega para a
 * rota `/estoque/compras/nova` (`NovaCompraPage`, experiência mobile-first
 * com conversão explícita C2 + máscara R$). Receber/Cancelar/Detalhe
 * continuam modais sobre a lista (decisão do fundador no WIRE).
 *
 * Padrões copiados do módulo:
 * - `ProdutosPage`: skeleton só na 1ª carga, **modais FORA do gate de loading**
 *   (HOTFIX: refetch não pode desmontar o formulário em digitação).
 * - `ContasPagarPage`: BottomSheet mobile / dialog desktop, KPIs, busca+filtros.
 * Cores: só as textuais do módulo (#1f2937/#627271/#efefef/#86cb92 + âmbar e
 * vermelho de atenção já usados em Financeiro). Sem animação.
 *
 * Mobile (auditoria 06/10): os sheets usam o modo `header` + `footer` +
 * `mobileFill` do `BottomSheet` — título/fechar fixos no topo, Total + ação
 * sempre visíveis embaixo. Inputs em 16px (sem zoom do iOS), alvos ≥ 44px.
 *
 * T4 — WIRE-Producao-Redesign (compras + receber na esteira): card PENDENTE
 * carrega a nota "estoque e custo só entram quando você RECEBER" com
 * [Receber] como ação primária; deep-link `?receber=<compraId>` abre direto
 * o ReceberCompraSheet daquela compra (pattern useSearchParams, só PENDENTE);
 * as linhas do modal repetem `quantidade × fator` COM a legenda
 * (`LegendaConversao` — conferir antes, não depois); sucesso pós-RPC vira a
 * banda `FaixaProximoPasso` "✓ Recebida · {fornecedor}" com "dá pra produzir
 * agora:" — cruzamento front-only (compostos × ficha × estoques via
 * `receitasMaximas`, máx 2, CTA `Ir produzir →` → ?aba=producao), calculado
 * por sub-componente local que usa `useFichaTecnica` por composto (nenhuma
 * query nova). Banda só no sucesso do RPC DAQUELA interação: compra já
 * RECEBIDA nunca re-oferece (idempotência).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Eye,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { addDays, format, isSameMonth, parseISO } from "date-fns";
import { supabase } from "../../../lib/supabase";
import { formatCurrency } from "../../lib/produto-utils";
import { useCompras } from "../../hooks/use-compras";
import { useProdutos } from "../../hooks/use-produtos";
// WIP C1 (outro agente) removeu estes imports mas o código dos mini-sheets U2.2/
// U2.3 desta página ainda os usa — RESTAURADOS do HEAD para o tsc fechar. Não é
// escopo M1/W1; revisão final deve decidir se os sheets morrem junto com o modal.
import {
  useFornecedores,
  type CriarFornecedorDados,
  type CriarFornecedorResult,
  type FornecedorSimples,
} from "../../hooks/use-fornecedores";
import { useCriarCompra, type CriarCompraParams, type CriarCompraResult } from "../../hooks/use-criar-compra";
import {
  useCriarProduto,
  validarConversaoCompra,
  type CriarProdutoParams,
  type CriarProdutoResult,
} from "../../hooks/use-criar-produto";
import type { Produto } from "../../types/produto";
import { useReceberCompra, type ReceberCompraParams, type ReceberCompraResult } from "../../hooks/use-receber-compra";
import { useCancelarCompra } from "../../hooks/use-cancelar-compra";
import { useEstornarRecebimento } from "../../hooks/use-estornar-recebimento";
// T4 — WIRE-Producao-Redesign: banda de sucesso + legenda + cálculo front-only
import { useFichaTecnica } from "../../hooks/use-ficha-tecnica";
import { perdaAplicada, receitasMaximas } from "../../lib/conversao";
import { FaixaProximoPasso } from "./FaixaProximoPasso";
import { LegendaConversao } from "./LegendaConversao";
import {
  BottomSheet,
  campoFormSheet,
  FinanceKpi,
  SheetFooterActions,
  sheetButtonPerigo,
  sheetButtonPrimario,
  sheetButtonSecundario,
  formatarDataBR,
  hojeLocal,
} from "../financeiro/components";
import {
  qtdEstoque,
  custoPorUnidadeEstoque,
  STATUS_COMPRA_LABELS,
  type Compra,
  type StatusCompra,
} from "../../types/producao";

/* ───────────────────────── helpers de exibição ───────────────────────── */

/** Paleta textual dos status — mesmas cores já usadas no Financeiro/Estoque. */
const COMPRA_STATUS_STYLE: Record<StatusCompra, { color: string; bg: string; border: string }> = {
  PENDENTE: { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  RECEBIDO: { color: "#059669", bg: "#F0FDF4", border: "#A7F3D0" },
  CANCELADO: { color: "#627271", bg: "#efefef", border: "#627271" },
};

function BadgeCompraStatus({ status }: { status: StatusCompra }) {
  const cfg = COMPRA_STATUS_STYLE[status];
  return (
    <span
      role="status"
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border, fontWeight: 600 }}
    >
      {STATUS_COMPRA_LABELS[status]}
    </span>
  );
}

/** "Previsto: dd/MM" (emenda D11) — só compra pendente com data prevista. */
function ChipPrevisto({ dataPrevista }: { dataPrevista: string }) {
  const [a, m, d] = dataPrevista.slice(0, 10).split("-");
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309", fontWeight: 600 }}
    >
      <Calendar size={10} aria-hidden="true" />
      Previsto: {d}/{m}
    </span>
  );
}

/** `2000 → "2.000"`, `0.025 → "0,025"` — quantidade em unidade de estoque. */
function fmtNum(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

/** timestamptz → data local dd/MM/yy (formatarDataBR é para colunas `date`). */
function dataCompraBR(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : format(d, "dd/MM/yy");
}

/** Mensagem do toast de recebimento com os custos médios devolvidos pela RPC. */
function toastRecebido(rc: ReceberCompraResult): string {
  const custos = rc.custos ?? [];
  if (custos.length === 1) {
    return `Compra recebida — estoque sobe · custo médio ${formatCurrency(custos[0].custoMedio)} · conta a pagar criada`;
  }
  if (custos.length > 1) {
    return `Compra recebida — estoque sobe · ${custos.length} custos médios recalculados · conta a pagar criada`;
  }
  return "Compra recebida — estoque atualizado · conta a pagar criada";
}

/* ───────────────────── disponibilidade de estorno (E1) ─────────────────── */

/** Hint EXATA do WIRE E1 — compra recebida antes da tabela de snapshot existir. */
const HINT_ESTORNO_ANTIGO =
  "compra antiga — recebida antes do estorno existir; corrija estoque e conta à mão";

type DisponibilidadeEstorno = "loading" | "disponivel" | "indisponivel" | "erro";

/**
 * EstornoRecebimento E1 — SELECT leve em `est_recebimento` por compra
 * (snapshot com `estornado_em IS NULL` ⇒ estornável; sem linha ⇒ compra
 * antiga). Consulta barata, memoizada por compra id; `erro` de rede mantém o
 * botão habilitado — a RPC tem o guarda `NO_SNAPSHOT` e devolve a mesma
 * mensagem humana.
 */
function useDisponibilidadeEstorno(compraId: string | null): DisponibilidadeEstorno {
  const [estado, setEstado] = useState<DisponibilidadeEstorno>("loading");

  useEffect(() => {
    if (!compraId) return undefined;
    let ativo = true;
    setEstado("loading");
    supabase
      .from("est_recebimento")
      .select("id")
      .eq("compra_id", compraId)
      .is("estornado_em", null)
      .limit(1)
      .then(({ data, error }) => {
        if (!ativo) return;
        if (error) setEstado("erro");
        else setEstado(data && data.length > 0 ? "disponivel" : "indisponivel");
      });
    return () => {
      ativo = false;
    };
  }, [compraId]);

  return estado;
}

/* ───────────────────────────── página ───────────────────────────────── */

const FILTRO_OPCOES: { valor: "TODOS" | StatusCompra; label: string }[] = [
  { valor: "TODOS", label: "Todos" },
  { valor: "PENDENTE", label: "Pendente" },
  { valor: "RECEBIDO", label: "Recebido" },
  { valor: "CANCELADO", label: "Cancelado" },
];

export function ComprasPage() {
  const navigate = useNavigate();
  // T4 §2 — deep-link `?receber=<compraId>` (chegada do CTA "receba a compra
  // X para produzir" do T5/T6): abre o ReceberCompraSheet direto. Estado de
  // tela, nenhum param vai ao backend; padrão useSearchParams do
  // PedidosListaPage (?novo): consome uma vez e limpa a URL com replace.
  const [searchParams, setSearchParams] = useSearchParams();
  const receberParam = searchParams.get("receber");
  const deepLinkConsumido = useRef(false);
  const { compras, loading, error, recarregar } = useCompras();
  // KPI "itens em falta" — a CRIAÇÃO da compra mora na rota
  // /estoque/compras/nova (WIRE C1); aqui ficam só lista + receber/cancelar/detalhe.
  // T4: os produtos também alimentam a banda "dá pra produzir agora" do
  // ReceberCompraSheet (estoques atuais para o cálculo front-only).
  const { produtos, recarregar: recarregarProdutos } = useProdutos();
  const { receberCompra, loading: recebendo } = useReceberCompra();
  const { cancelarCompra, loading: cancelando } = useCancelarCompra();
  // EstornoRecebimento E1/E2 — escrita exclusiva via RPC `estornar_recebimento`
  const { estornar, loading: estornando } = useEstornarRecebimento();

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"TODOS" | StatusCompra>("TODOS");
  const [receberAlvo, setReceberAlvo] = useState<Compra | null>(null);
  const [cancelarAlvo, setCancelarAlvo] = useState<Compra | null>(null);
  const [detalheAlvo, setDetalheAlvo] = useState<Compra | null>(null);
  const [estornarAlvo, setEstornarAlvo] = useState<Compra | null>(null);
  // E2 §Sucesso — banda de nível de página (o modal fecha; o feedback fica
  // legível junto do card que voltou a PENDENTE)
  const [estornoSucesso, setEstornoSucesso] = useState<{ compraId: string; fornecedor: string } | null>(
    null
  );
  const estornoRecarregadoRef = useRef<string | null>(null);

  // T4 §2 — quando a lista chegar, abre o sheet da compra pedida pelo param —
  // só se existir E estiver PENDENTE (id inválido/já recebido = ignora
  // silencioso, mesmo contrato do ?insumo= do T3). O param sai da URL com
  // `replace: true`: voltar/recarregar não re-dispara o modal.
  useEffect(() => {
    if (!receberParam || deepLinkConsumido.current) return;
    // espera a 1ª carga: sem compras ainda, "não achado" seria falso negativo
    if (loading && compras.length === 0) return;
    const alvo = compras.find((c) => c.id === receberParam);
    if (alvo && alvo.status === "PENDENTE") setReceberAlvo(alvo);
    deepLinkConsumido.current = true;
    setSearchParams({}, { replace: true });
  }, [receberParam, compras, loading, setSearchParams]);

  // ---------- KPIs (derivados, useMemo — padrão ContasPagarPage) ----------
  const emAberto = useMemo(() => compras.filter((c) => c.status === "PENDENTE"), [compras]);
  const totalEmAberto = emAberto.reduce((s, c) => s + c.valorTotal, 0);
  const recebidoNoMes = useMemo(
    () =>
      compras
        .filter(
          (c) =>
            c.status === "RECEBIDO" &&
            c.dataRecebimento &&
            isSameMonth(parseISO(c.dataRecebimento), new Date())
        )
        .reduce((s, c) => s + c.valorTotal, 0),
    [compras]
  );
  // Insumos/produtos ativos abaixo do mínimo — `useProdutos` já traz só ativos
  const itensEmFalta = useMemo(
    () => produtos.filter((p) => p.estoque <= p.estoqueMinimo).length,
    [produtos]
  );

  // ---------- filtro ----------
  const temFiltro = busca.trim() !== "" || filtro !== "TODOS";
  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return compras.filter((c) => {
      const matchStatus = filtro === "TODOS" || c.status === filtro;
      const matchBusca =
        !q ||
        c.fornecedorNome.toLowerCase().includes(q) ||
        (c.notaFiscal || "").toLowerCase().includes(q);
      return matchStatus && matchBusca;
    });
  }, [compras, busca, filtro]);

  const limparFiltros = () => {
    setBusca("");
    setFiltro("TODOS");
  };

  const confirmarCancelamento = async () => {
    if (!cancelarAlvo) return;
    const r = await cancelarCompra({ compraId: cancelarAlvo.id, statusAtual: cancelarAlvo.status });
    if (r.success) {
      toast.success("Compra cancelada — nada entrou no estoque.");
      setCancelarAlvo(null);
      recarregar();
    } else {
      toast.error(r.error || "Não foi possível cancelar a compra.");
    }
  };

  // ---------- EstornoRecebimento E2: abrir / sucesso ----------
  const abrirEstorno = (compra: Compra) => {
    setEstornoSucesso(null);
    // guard de dupla-chamada é POR interação: ao reabrir o modal zera o ref,
    // senão receber-de-novo + estornar a MESMA compra nunca mais daria refetch
    estornoRecarregadoRef.current = null;
    setEstornarAlvo(compra);
  };

  const aoEstornarSucesso = (compra: Compra) => {
    // refetch idempotente: compras + produtos uma única vez por estorno
    if (estornoRecarregadoRef.current !== compra.id) {
      estornoRecarregadoRef.current = compra.id;
      recarregar();
      recarregarProdutos();
    }
    setEstornarAlvo(null);
    // o sheet de detalhe em cima ficou obsoleto (mostra RECEBIDO de antes)
    setDetalheAlvo(null);
    setEstornoSucesso({ compraId: compra.id, fornecedor: compra.fornecedorNome });
  };

  // ---------- 1ª carga: skeleton ----------
  const primeiraCarga = loading && compras.length === 0;
  // erro de 1ª carga: tela de tentativa de novo (refetch de fundo mantém a lista)
  const erroTela = Boolean(error) && compras.length === 0 && !loading;

  return (
    <main
      data-od-id="compras-regiao"
      className="mx-auto max-w-screen-xl p-3 text-[#1f2937] sm:p-6"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* ── Loading (só na 1ª carga — refetch não desmonta modais nem lista) ── */}
      {primeiraCarga && (
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded-lg bg-[#efefef]" />
              <div className="h-4 w-64 animate-pulse rounded bg-[#efefef]" />
            </div>
            <div className="h-11 w-36 animate-pulse rounded-xl bg-[#efefef]" />
          </div>
          {/* KPI skeleton — acompanha o layout real (C7): 2 compactos + 1
              full-width no mobile; linha de 3 no sm+ */}
          <div className="mb-5">
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <div className="h-[64px] animate-pulse rounded-xl bg-[#efefef]" />
              <div className="h-[64px] animate-pulse rounded-xl bg-[#efefef]" />
              <div className="col-span-2 h-[64px] animate-pulse rounded-xl bg-[#efefef]" />
            </div>
            <div className="hidden gap-2 sm:grid sm:grid-cols-3 lg:gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[76px] animate-pulse rounded-xl bg-[#efefef]" />
              ))}
            </div>
          </div>
          <div className="mb-5 h-12 animate-pulse rounded-xl bg-white/60" />
          <div className="rounded-2xl border border-[#efefef] bg-white p-4">
            <div className="hidden gap-3 md:flex">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-12 flex-1 animate-pulse rounded-lg bg-[#efefef]" />
              ))}
            </div>
            <div className="space-y-3 md:hidden">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-[#efefef]" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Erro de carregamento (1ª carga) + tentar novamente ── */}
      {erroTela && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#efefef] bg-white px-4 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <h2 className="font-semibold text-[#1f2937]">Erro ao carregar compras</h2>
          <p className="mt-1 max-w-md text-sm text-[#627271]">{error}</p>
          <button
            onClick={recarregar}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] hover:bg-[#1f2937] hover:text-white"
          >
            <RefreshCw size={16} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* ── Conteúdo (lista) — modais ficam FORA deste gate (HOTFIX ProdutosPage) ── */}
      {!primeiraCarga && !erroTela && (
        <>
          {/* Header */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 data-od-id="compras-heading" className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: 18 }}>
                Compras
              </h1>
              <p className="mt-0.5 text-xs text-[#627271] sm:text-sm">
                {emAberto.length} {emAberto.length === 1 ? "compra em aberto" : "compras em aberto"} ·{" "}
                {formatCurrency(totalEmAberto)} a pagar
              </p>
            </div>
            <button
              data-od-id="compras-cta"
              onClick={() => navigate("/estoque/compras/nova")}
              aria-label="Nova compra — abrir a tela de compra"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#86cb92] px-3.5 py-2.5 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nova Compra</span>
              <span className="sm:hidden">Nova</span>
            </button>
          </div>

          {/* KPIs — 2 colunas compactas no mobile (gramática EstoqueDashboard),
              3 no desktop (WIRE §4 C7) */}
          <section className="mb-5" aria-label="Indicadores de compra">
            {/* < sm — cards curtos estilo "nota": ícone 14px colorido + label
                na MESMA linha, valor text-lg bold truncado, legenda 10px.
                Mesmos dados/ícones/cores de sempre; o 3º card fecha em
                col-span-2 (full) para manter os 3 visíveis sem coluna órfã. */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <div className="bg-white rounded-xl border border-[#efefef] p-3 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <ShoppingCart size={14} className="shrink-0 text-[#D97706]" />
                  <span className="text-xs text-[#627271] truncate">Em aberto ({emAberto.length})</span>
                </div>
                <p className="text-lg text-[#1f2937] truncate" style={{ fontWeight: 700 }}>
                  {formatCurrency(totalEmAberto)}
                </p>
                <p className="text-[10px] text-[#627271]">a pagar</p>
              </div>
              <div className="bg-white rounded-xl border border-[#efefef] p-3 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <Package size={14} className="shrink-0 text-[#059669]" />
                  <span className="text-xs text-[#627271] truncate">Recebido no mês</span>
                </div>
                <p className="text-lg text-[#1f2937] truncate" style={{ fontWeight: 700 }}>
                  {formatCurrency(recebidoNoMes)}
                </p>
                <p className="text-[10px] text-[#627271]">compras recebidas</p>
              </div>
              <div className="col-span-2 bg-white rounded-xl border border-[#efefef] p-3 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={14} className="shrink-0 text-[#DC2626]" />
                  <span className="text-xs text-[#627271] truncate">Itens em falta</span>
                </div>
                {/* BIG number = contagem crua (era "N abaixo do mín." no value
                    do FinanceKpi); a qualificação virou a legenda 10px —
                    igual "Estoque baixo / abaixo do mínimo" no Dashboard */}
                <p className="text-lg text-[#1f2937] truncate" style={{ fontWeight: 700 }}>
                  {itensEmFalta}
                </p>
                <p className="text-[10px] text-[#627271]">abaixo do mínimo</p>
              </div>
            </div>
            {/* sm+ — a linha de 3 exatamente como hoje; FinanceKpi intocado
                (outros módulos dependem dele) */}
            <div className="hidden gap-2 sm:grid sm:grid-cols-3 lg:gap-3">
              <FinanceKpi
                label={`Em aberto (${emAberto.length})`}
                value={formatCurrency(totalEmAberto)}
                icon={ShoppingCart}
                iconColor="#D97706"
                iconBg="#FFFBEB"
              />
              <FinanceKpi
                label="Recebido no mês"
                value={formatCurrency(recebidoNoMes)}
                icon={Package}
                iconColor="#059669"
                iconBg="#F0FDF4"
              />
              <FinanceKpi
                label="Itens em falta"
                value={`${itensEmFalta} abaixo do mín.`}
                icon={AlertTriangle}
                iconColor="#DC2626"
                iconBg="#FEF2F2"
              />
            </div>
          </section>

          {/* Busca + filtro de status */}
          <section className="mb-5 space-y-3 rounded-2xl border border-[#efefef] bg-white p-3 shadow-sm sm:p-4">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por fornecedor ou nota fiscal"
                aria-label="Buscar compras"
                className="w-full rounded-xl border border-[#efefef] bg-[#efefef] py-2.5 pl-9 pr-9 text-sm text-[#1f2937] placeholder:text-[#627271] focus:border-[#86cb92] focus:outline-none focus:ring-2 focus:ring-[#86cb92]/30"
              />
              {busca && (
                <button
                  onClick={() => setBusca("")}
                  aria-label="Limpar busca"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#627271] hover:text-[#1f2937]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por status">
              {FILTRO_OPCOES.map(({ valor, label }) => {
                const ativo = filtro === valor;
                return (
                  <button
                    key={valor}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setFiltro(valor)}
                    className="min-h-[36px] rounded-full border px-3 text-xs transition-colors"
                    style={{
                      background: ativo ? "#efefef" : "white",
                      borderColor: ativo ? "#86cb92" : "#efefef",
                      color: ativo ? "#1f2937" : "#627271",
                      fontWeight: ativo ? 600 : 500,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
              {temFiltro && (
                <button
                  onClick={limparFiltros}
                  className="min-h-[36px] rounded-lg px-2 text-xs text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
                >
                  Limpar
                </button>
              )}
            </div>
          </section>

          {/* EstornoRecebimento E2 §Sucesso — banda pós-estorno no nível da
              página (o modal fecha; o feedback fica junto do card que voltou
              a PENDENTE no refetch). role="status" para leitores de tela. */}
          {estornoSucesso && (
            <div
              role="status"
              className="mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3"
              style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}
            >
              <p className="text-sm" style={{ color: "#059669", fontWeight: 600 }}>
                ✓ Estornada · {estornoSucesso.fornecedor} — a compra voltou para PENDENTE. Corrija os
                itens e receba de novo, ou cancele.
              </p>
              <button
                type="button"
                onClick={() => setEstornoSucesso(null)}
                aria-label="Fechar aviso de estorno"
                className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#059669] transition-colors hover:bg-[#A7F3D0]/40"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Lista */}
          <section className="overflow-hidden rounded-2xl border border-[#efefef] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#efefef] px-4 py-3">
              <h2 className="font-semibold text-[#1f2937]">
                Compras{" "}
                <span className="text-sm font-normal text-[#627271]">({filtradas.length})</span>
              </h2>
            </div>

            {filtradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efefef]">
                  <ShoppingCart size={24} className="text-[#627271]" />
                </div>
                <p className="font-semibold text-[#1f2937]">
                  {temFiltro ? "Nenhuma compra encontrada" : "Nenhuma compra ainda"}
                </p>
                <p className="mt-1 max-w-xs text-sm text-[#627271]">
                  {temFiltro
                    ? "Ajuste a busca ou o filtro de status."
                    : "Registre a primeira compra de insumo — ao receber, o estoque sobe com custo médio."}
                </p>
                <button
                  onClick={temFiltro ? limparFiltros : () => navigate("/estoque/compras/nova")}
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
                >
                  {temFiltro ? (
                    "Limpar filtros"
                  ) : (
                    <>
                      <Plus size={16} />
                      Nova compra
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Cards — mobile (ações sempre visíveis, alvo de toque ≥ 40px) */}
                <div className="divide-y divide-[#efefef] md:hidden">
                  {filtradas.map((compra) => (
                    <CompraCard
                      key={compra.id}
                      compra={compra}
                      onReceber={() => setReceberAlvo(compra)}
                      onCancelar={() => setCancelarAlvo(compra)}
                      onDetalhe={() => setDetalheAlvo(compra)}
                      onEstornar={() => abrirEstorno(compra)}
                    />
                  ))}
                </div>

                {/* Tabela — desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#efefef]">
                        <th scope="col" className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>Data</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>Fornecedor</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>NF</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs text-[#627271]" style={{ fontWeight: 600 }}>Valor</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs text-[#627271]" style={{ fontWeight: 600 }}>Itens</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>Status</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs text-[#627271]" style={{ fontWeight: 600 }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#efefef]">
                      {filtradas.map((compra) => (
                        <CompraRow
                          key={compra.id}
                          compra={compra}
                          onReceber={() => setReceberAlvo(compra)}
                          onCancelar={() => setCancelarAlvo(compra)}
                          onDetalhe={() => setDetalheAlvo(compra)}
                          onEstornar={() => abrirEstorno(compra)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}

      {/* ── Modais: SEM FORA do gate de loading ──
          (dentro do gate, um refetch em background desmontaria o formulário no
          meio da digitação — HOTFIX do ProdutosPage, 06/10).
          C1: "Nova compra" não é mais modal — é a rota /estoque/compras/nova. */}
      <ReceberCompraSheet
        key={receberAlvo?.id ?? "fechada"}
        compra={receberAlvo}
        onClose={() => setReceberAlvo(null)}
        onConcluida={recarregar}
        receberCompra={receberCompra}
        salvando={recebendo}
        produtos={produtos}
        recarregarProdutos={recarregarProdutos}
      />

      <DetalheCompraSheet compra={detalheAlvo} onClose={() => setDetalheAlvo(null)} onEstornar={abrirEstorno} />

      {/* EstornoRecebimento E2 — modal de confirmação próprio (sem
          window.confirm), bottom-sheet padrão do Financeiro. Abre por cima do
          sheet de detalhe quando a ação vem de lá. */}
      <EstornarRecebimentoSheet
        key={estornarAlvo?.id ?? "fechada"}
        compra={estornarAlvo}
        onClose={() => setEstornarAlvo(null)}
        onSucesso={aoEstornarSucesso}
        estornar={estornar}
        salvando={estornando}
      />

      {/* Confirm Cancelar — padrão do projeto (dialog central, excluir produto) */}
      {cancelarAlvo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="compras-cancelar-titulo" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <p id="compras-cancelar-titulo" className="text-[#1f2937]" style={{ fontWeight: 700 }}>
                  Cancelar compra?
                </p>
                <p className="text-xs text-[#627271]">
                  {cancelarAlvo.fornecedorNome} · {formatCurrency(cancelarAlvo.valorTotal)}
                </p>
              </div>
            </div>
            <p className="mb-4 text-sm text-[#1f2937]">
              Nada entra no estoque e nenhuma conta a pagar é criada. Esta ação não pode ser desfeita
              pela tela.
            </p>
            {/* Mobile: perigo 100% em cima, secundário separado embaixo —
                nada de botão lado a lado apertado ao lado do polegar */}
            <SheetFooterActions>
              <button
                onClick={() => setCancelarAlvo(null)}
                disabled={cancelando}
                className={`${sheetButtonSecundario} disabled:opacity-50`}
              >
                Voltar
              </button>
              <button
                onClick={confirmarCancelamento}
                data-sheet-foco
                disabled={cancelando}
                className={sheetButtonPerigo}
                style={{ background: "#DC2626" }}
              >
                {cancelando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  "Confirmar cancelamento"
                )}
              </button>
            </SheetFooterActions>
          </div>
        </div>
      )}
    </main>
  );
}

/* ─────────────────────────── linhas da lista ─────────────────────────── */

function AcoesCompra({
  compra,
  onReceber,
  onCancelar,
  onDetalhe,
  onEstornar,
  tall = false,
}: {
  compra: Compra;
  onReceber: () => void;
  onCancelar: () => void;
  onDetalhe: () => void;
  onEstornar: () => void;
  tall?: boolean;
}) {
  const pendente = compra.status === "PENDENTE";
  // EstornoRecebimento E1 — [Estornar] é ação SECUNDÁRIA do card RECEBIDO,
  // ao lado do Detalhes. Disponibilidade vem do banco (snapshot em
  // `est_recebimento`); loading = skeleton do MESMO tamanho (refetch não
  // refaz layout — HOTFIX 06/10).
  const recebido = compra.status === "RECEBIDO";
  const dispEstorno = useDisponibilidadeEstorno(recebido ? compra.id : null);

  return (
    <div className="flex items-center justify-end gap-1.5">
      {pendente && (
        <button
          onClick={onReceber}
          aria-label={`Receber compra de ${compra.fornecedorNome}`}
          className={`inline-flex ${tall ? "h-10 px-3 text-xs" : "h-9 px-2.5 text-xs"} items-center gap-1 rounded-xl bg-[#86cb92] font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white`}
        >
          <Package size={14} />
          Receber
        </button>
      )}
      <button
        onClick={onDetalhe}
        aria-label={`Ver detalhes da compra de ${compra.fornecedorNome}`}
        title="Detalhe"
        className={`inline-flex ${tall ? "h-10 px-3 text-xs" : "h-9 w-9"} items-center justify-center gap-1 rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]`}
      >
        <Eye size={15} />
        {tall && <span>Detalhe</span>}
      </button>
      {recebido &&
        (dispEstorno === "loading" ? (
          <span
            aria-hidden="true"
            className={`inline-block ${tall ? "h-10 w-[88px]" : "h-9 w-[78px]"} animate-pulse rounded-xl bg-[#efefef]`}
          />
        ) : (
          <button
            onClick={onEstornar}
            disabled={dispEstorno === "indisponivel"}
            aria-label={
              dispEstorno === "indisponivel"
                ? `Estornar recebimento indisponível — ${HINT_ESTORNO_ANTIGO}`
                : `Estornar recebimento da compra de ${compra.fornecedorNome}`
            }
            title={dispEstorno === "indisponivel" ? HINT_ESTORNO_ANTIGO : "Estornar"}
            className={`inline-flex ${tall ? "h-10 px-3 text-xs" : "h-9 px-2.5 text-xs"} items-center justify-center gap-1 rounded-xl border border-[#efefef] text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#627271]`}
          >
            <Undo2 size={14} />
            Estornar
          </button>
        ))}
      {pendente && (
        <button
          onClick={onCancelar}
          aria-label={`Cancelar compra de ${compra.fornecedorNome}`}
          title="Cancelar"
          className={`inline-flex ${tall ? "h-10 w-10" : "h-9 w-9"} items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50`}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

function CompraCard({
  compra,
  onReceber,
  onCancelar,
  onDetalhe,
  onEstornar,
}: {
  compra: Compra;
  onReceber: () => void;
  onCancelar: () => void;
  onDetalhe: () => void;
  onEstornar: () => void;
}) {
  const cancelada = compra.status === "CANCELADO";
  return (
    <div className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
            {compra.fornecedorNome}
          </p>
          <p className="mt-0.5 text-xs text-[#627271]">
            {compra.notaFiscal ? `NF ${compra.notaFiscal} · ` : ""}
            {dataCompraBR(compra.dataCompra)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <BadgeCompraStatus status={compra.status} />
          {compra.status === "PENDENTE" && compra.dataPrevista && (
            <ChipPrevisto dataPrevista={compra.dataPrevista} />
          )}
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-[#627271]">
        <span>
          {compra.itens.length} {compra.itens.length === 1 ? "item" : "itens"}
        </span>
        <span
          className="text-sm text-[#1f2937]"
          style={
            cancelada
              ? { fontWeight: 700, color: "#627271", textDecoration: "line-through" }
              : { fontWeight: 700 }
          }
        >
          {formatCurrency(compra.valorTotal)}
        </span>
      </div>

      {/* T4 §1 — a nota que faltava no card PENDENTE: receber é o passo que
          põe estoque/custo pra dentro. [Receber] já é o primeiro botão verde
          (primário) em AcoesCompra — a nota explica o porquê do destaque. */}
      {compra.status === "PENDENTE" && (
        <p className="mt-1.5 text-[11px] leading-snug text-[#627271]">
          estoque e custo só entram quando você <span style={{ fontWeight: 700 }}>RECEBER</span>
        </p>
      )}

      <div className="mt-2.5">
        <AcoesCompra compra={compra} onReceber={onReceber} onCancelar={onCancelar} onDetalhe={onDetalhe} onEstornar={onEstornar} tall />
      </div>
    </div>
  );
}

function CompraRow({
  compra,
  onReceber,
  onCancelar,
  onDetalhe,
  onEstornar,
}: {
  compra: Compra;
  onReceber: () => void;
  onCancelar: () => void;
  onDetalhe: () => void;
  onEstornar: () => void;
}) {
  const cancelada = compra.status === "CANCELADO";
  return (
    <tr className="transition-colors hover:bg-[#efefef]/50">
      <td className="px-4 py-3.5 text-sm text-[#1f2937]">{dataCompraBR(compra.dataCompra)}</td>
      <td className="px-4 py-3.5">
        <p className="text-sm font-semibold text-[#1f2937]">{compra.fornecedorNome}</p>
        {compra.status === "PENDENTE" && compra.dataPrevista && (
          <span className="mt-1 inline-block">
            <ChipPrevisto dataPrevista={compra.dataPrevista} />
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 text-sm text-[#1f2937]">
        {compra.notaFiscal || <span className="text-[#627271]">—</span>}
      </td>
      <td className="px-4 py-3.5 text-right">
        <span
          className="text-sm text-[#1f2937]"
          style={
            cancelada
              ? { fontWeight: 700, color: "#627271", textDecoration: "line-through" }
              : { fontWeight: 700 }
          }
        >
          {formatCurrency(compra.valorTotal)}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center text-sm text-[#1f2937]">{compra.itens.length}</td>
      <td className="px-4 py-3.5">
        <BadgeCompraStatus status={compra.status} />
      </td>
      <td className="px-4 py-3.5">
        <AcoesCompra compra={compra} onReceber={onReceber} onCancelar={onCancelar} onDetalhe={onDetalhe} onEstornar={onEstornar} />
      </td>
    </tr>
  );
}

/* ───────────────────────── Modal Receber Compra ──────────────────────── */

interface ReceberCompraSheetProps {
  compra: Compra | null;
  onClose: () => void;
  onConcluida: () => void;
  receberCompra: (p: ReceberCompraParams) => Promise<ReceberCompraResult>;
  salvando: boolean;
  /** T4 — catálogo atual: estoques para o "dá pra produzir agora" da banda */
  produtos: Produto[];
  /** T4 — pós-RPC: o estoque que entrou no banco precisa voltar pro cálculo */
  recarregarProdutos: () => void;
}

/**
 * T4 §4 — linha da banda de sucesso: resultado do cruzamento front-only
 * (composto × ficha × estoques). `rende` = rendimentoLote (g/ml por receita);
 * null = composto por unidade (estimativa em grama "não cabe" no texto).
 */
interface MaxComposto {
  id: string;
  nome: string;
  max: number;
  rende: number | null;
  unidade: string;
}

function ReceberCompraSheet({
  compra,
  onClose,
  onConcluida,
  receberCompra,
  salvando,
  produtos,
  recarregarProdutos,
}: ReceberCompraSheetProps) {
  const [dataRecebimento, setDataRecebimento] = useState(hojeLocal());
  const [dataVencimento, setDataVencimento] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [erro, setErro] = useState("");
  // T4 §4/§5 — banda de sucesso: SÓ no sucesso do RPC desta interação (estado
  // local morto no unmount). Compra já RECEBIDA que abrir o sheet (deep-link
  // é gated em PENDente; o card nem oferece o botão) nunca vê a banda.
  const [recebido, setRecebido] = useState<ReceberCompraResult | null>(null);
  // Resultados reportados pelas sondas de ficha (um por composto candidato).
  const [resultados, setResultados] = useState<Record<string, MaxComposto | null>>({});

  const reportMax = useCallback((id: string, r: MaxComposto | null) => {
    setResultados((prev) => (prev[id] === r ? prev : { ...prev, [id]: r }));
  }, []);

  const insumoIds = useMemo(() => (compra ? compra.itens.map((i) => i.produtoId) : []), [compra]);
  const estoques = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of produtos) m[p.id] = p.estoque;
    return m;
  }, [produtos]);
  // Compostos da empresa cortados em 8: cada sonda lê uma ficha via hook
  // existente — o teto limita as leituras paralelas (mesmo corte da sonda de
  // nível-2 da ProducaoTab). Catálogo de microempresa cabe sobrando.
  const candidatos = useMemo(
    () => (recebido ? produtos.filter((p) => p.natureza === "composto").slice(0, 8) : []),
    [recebido, produtos]
  );
  // WIRE T4: máx 2 compostos com max ≥ 1, ordenados pelo maior.
  const visiveis = useMemo(
    () =>
      Object.values(resultados)
        .filter((r): r is MaxComposto => r !== null && r.max >= 1)
        .sort((a, b) => b.max - a.max)
        .slice(0, 2),
    [resultados]
  );

  const confirmar = async () => {
    if (!compra) return;
    setErro("");
    if (!dataRecebimento || !dataVencimento) {
      setErro("Informe as duas datas.");
      return;
    }
    const rc = await receberCompra({
      compraId: compra.id,
      dataRecebimento,
      dataVencimento,
    });
    if (rc.success) {
      toast.success(toastRecebido(rc));
      onConcluida();
      // T4 — os estoques novos têm que entrar no cálculo da banda: o catálogo
      // recarrega (gatilho de leitura existente) e as sondas de ficha re-rodem
      // com os estoques atualizados.
      recarregarProdutos();
      // o sheet NÃO fecha no sucesso: vira a banda "✓ Recebida" (T4 §4).
      setRecebido(rc);
    } else {
      // erro da RPC (ex.: "compra já foi recebida") fica visível no sheet aberto
      setErro(rc.error || "Não foi possível receber a compra.");
    }
  };

  if (!compra) return null;

  return (
    <BottomSheet
      open
      onClose={salvando ? () => undefined : onClose}
      labelledBy="receber-compra-titulo"
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="receber-compra-titulo" className="text-base font-semibold text-[#1f2937] sm:text-lg">
              {recebido ? "Compra recebida" : "Receber compra"}
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              {compra.fornecedorNome} · NF {compra.notaFiscal || "—"} · {formatCurrency(compra.valorTotal)} ·{" "}
              {compra.itens.length} {compra.itens.length === 1 ? "item" : "itens"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={salvando}
            aria-label="Fechar"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
      }
      footer={
        recebido ? (
          // T4 — sucesso: o sheet fecha em [Fechar]; os CTAs da banda são
          // links de navegação (§8: destino óbvio no texto).
          <SheetFooterActions>
            <button
              type="button"
              onClick={onClose}
              data-sheet-foco
              className={sheetButtonPrimario}
              style={{ background: "#86cb92" }}
            >
              Fechar
            </button>
          </SheetFooterActions>
        ) : (
          <div>
            {erro && (
              <p className="mb-2 text-xs text-red-600" role="alert" style={{ fontWeight: 500 }}>
                {erro}
              </p>
            )}
            <SheetFooterActions>
              <button type="button" onClick={onClose} disabled={salvando} className={sheetButtonSecundario}>
                Voltar
              </button>
              <button
                onClick={confirmar}
                data-sheet-foco
                disabled={salvando}
                className={sheetButtonPrimario}
                style={{ background: "#86cb92" }}
              >
                {salvando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Recebendo...
                  </>
                ) : (
                  <>
                    <Package size={16} />
                    Confirmar recebimento
                  </>
                )}
              </button>
            </SheetFooterActions>
          </div>
        )
      }
    >
      {recebido ? (
        // ── T4 §4 — BANDA DE SUCESSO PÓS-RPC ──
        // Cruzamento 100% estado de tela: compostos da empresa × ficha ×
        // estoques atuais → receitasMaximas por composto (máx 2, maior
        // primeiro). Nenhuma query nova: cada sonda usa o hook existente
        // `useFichaTecnica`; sem habilitado, a faixa fica só o básico.
        <div className="space-y-4">
          {candidatos.map((c) => (
            <FichaMaxRow
              key={c.id}
              composto={c}
              insumoIds={insumoIds}
              estoques={estoques}
              report={reportMax}
            />
          ))}
          <p className="text-xs leading-snug text-[#627271]">
            {compra.itens.map((i) => `${i.produtoNome} +${fmtNum(qtdEstoque(i))} ${i.unidadeEstoque}`).join(" · ")}
          </p>
          <FaixaProximoPasso
            titulo={`✓ Recebida · ${compra.fornecedorNome}`}
            descricao={
              visiveis.length > 0
                ? `dá pra produzir agora: ${visiveis
                    .map(
                      (v) =>
                        `${v.nome} — ${fmtNum(v.max)} ${v.max === 1 ? "receita" : "receitas"}${
                          v.rende != null && v.rende > 0 ? ` (≈ ${fmtNum(v.max * v.rende)} ${v.unidade})` : ""
                        }`
                    )
                    .join(" · ")}`
                : "estoque e custo atualizados · conta a pagar criada no Financeiro"
            }
            acoes={visiveis.map((v) => ({
              label: visiveis.length > 1 ? `Ir produzir ${v.nome} →` : "Ir produzir →",
              href: `/estoque/produtos/${v.id}?aba=producao`,
            }))}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5 rounded-xl border border-[#efefef] bg-[#f8f9fa] p-4" role="status">
            <p className="mb-1 text-xs text-[#1f2937]" style={{ fontWeight: 700 }}>
              Entrará no estoque:
            </p>
            {/* T4 §3 — cada linha REPETE `quantidade × fator` com a legenda do
                contrato 2: conferir a conversão ANTES do RPC, não depois (F2). */}
            {compra.itens.map((item) => {
              const uc = item.unidadeCompra?.trim() || null;
              const fator = item.fatorConversao == null ? 1 : Number(item.fatorConversao);
              return (
                <div key={item.id} className="text-sm">
                  <p className="flex items-center justify-between gap-3 text-[#1f2937]">
                    <span className="min-w-0 truncate">· {item.produtoNome}</span>
                    <span className="shrink-0" style={{ fontWeight: 600 }}>
                      +{fmtNum(qtdEstoque(item))} {item.unidadeEstoque}
                    </span>
                  </p>
                  {uc ? (
                    <p className="pl-2 text-[11px] leading-snug text-[#627271]">
                      {fmtNum(item.quantidade)} {uc} × {fmtNum(Number.isFinite(fator) && fator > 0 ? fator : 1)} ={" "}
                      <LegendaConversao
                        unCompra={uc}
                        fator={Number.isFinite(fator) && fator > 0 ? fator : 1}
                        unEstoque={item.unidadeEstoque}
                      />{" "}
                      → entra {fmtNum(qtdEstoque(item))} {item.unidadeEstoque}
                    </p>
                  ) : (
                    <p className="pl-2 text-[11px] leading-snug text-[#627271]">
                      {fmtNum(item.quantidade)} {item.unidadeEstoque} → entra {fmtNum(qtdEstoque(item))}{" "}
                      {item.unidadeEstoque}
                    </p>
                  )}
                </div>
              );
            })}
            <p className="pt-1 text-[11px] text-[#627271]">
              Custo médio recalculado automaticamente · ao receber, 1 conta a pagar de{" "}
              {formatCurrency(compra.valorTotal)} nasce no Financeiro.
            </p>
          </div>

          {/* Datas empilhadas no mobile: date nativo apertado em 2 colunas é
              praticamente impossível de ajustar com o polegar */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[#1f2937]">
              Data de recebimento *
              <input
                type="date"
                value={dataRecebimento}
                onChange={(e) => {
                  setDataRecebimento(e.target.value);
                  setErro("");
                }}
                className={`${campoFormSheet} text-base`}
              />
            </label>
            <label className="block text-sm font-medium text-[#1f2937]">
              Vencimento da conta a pagar *
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => {
                  setDataVencimento(e.target.value);
                  setErro("");
                }}
                className={`${campoFormSheet} text-base`}
              />
            </label>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

/**
 * T4 §4 — sonda de ficha (sub-componente local; um por composto candidato):
 * lê a ficha técnica pelo hook EXISTENTE (`useFichaTecnica` — nenhuma query
 * nova), cruza os necessários por receita JÁ COM PERDA (`perdaAplicada`,
 * F4) com os estoques atuais (`receitasMaximas`, front-only) e reporta à
 * banda. Só conta composto que consome algum insumo que ENTROU nesta compra
 * — é o estoque dele que o recebimento acabou de mover. Não renderiza nada;
 * quem ordena (maior primeiro) e corta (máx 2, max ≥ 1) é a banda no sheet.
 */
function FichaMaxRow({
  composto,
  insumoIds,
  estoques,
  report,
}: {
  composto: Produto;
  insumoIds: string[];
  estoques: Record<string, number>;
  report: (id: string, r: MaxComposto | null) => void;
}) {
  const { itens, loading } = useFichaTecnica(composto.id);

  useEffect(() => {
    if (loading) return;
    const usaEntraram = itens.some((i) => insumoIds.includes(i.componenteProdutoId));
    if (itens.length === 0 || !usaEntraram) {
      report(composto.id, null);
      return;
    }
    const requisitos = itens.map((i) => ({
      componenteId: i.componenteProdutoId,
      necessario: perdaAplicada(i.quantidadePorUnidade, i.perdaPct),
    }));
    const { max } = receitasMaximas(requisitos, estoques);
    report(
      composto.id,
      max >= 1
        ? {
            id: composto.id,
            nome: composto.nome,
            max,
            rende: composto.rendimentoLote ?? null,
            unidade: composto.unidade,
          }
        : null
    );
  }, [loading, itens, insumoIds, estoques, composto, report]);

  return null;
}

/* ───────────────────────── Sheet Detalhe Compra ──────────────────────── */

function DetalheCompraSheet({
  compra,
  onClose,
  onEstornar,
}: {
  compra: Compra | null;
  onClose: () => void;
  onEstornar: (compra: Compra) => void;
}) {
  // E1 — [Estornar] também no sheet de detalhe (WIRE: "mesma linha de ações
  // do Detalhe, também no sheet"). Hook ANTES do guard early-return (regras
  // dos hooks); só consulta quando o estado da tela é RECEBIDO.
  const dispEstorno = useDisponibilidadeEstorno(compra && compra.status === "RECEBIDO" ? compra.id : null);
  if (!compra) return null;

  return (
    <BottomSheet
      open
      onClose={onClose}
      labelledBy="detalhe-compra-titulo"
      wide
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="detalhe-compra-titulo" className="truncate text-base font-semibold text-[#1f2937] sm:text-lg">
              {compra.fornecedorNome}
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              Compra em {dataCompraBR(compra.dataCompra)}
              {compra.notaFiscal ? ` · NF ${compra.notaFiscal}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
          >
            <X size={20} />
          </button>
        </div>
      }
      footer={
        <SheetFooterActions>
          <button type="button" onClick={onClose} className={sheetButtonSecundario}>
            Fechar
          </button>
          {compra.status === "RECEBIDO" &&
            (dispEstorno === "loading" ? (
              <span
                aria-hidden="true"
                className="block min-h-[44px] w-full animate-pulse rounded-xl bg-[#efefef] sm:flex-1 sm:w-auto"
              />
            ) : (
              <button
                type="button"
                onClick={() => onEstornar(compra)}
                disabled={dispEstorno === "indisponivel"}
                aria-label={
                  dispEstorno === "indisponivel"
                    ? `Estornar recebimento indisponível — ${HINT_ESTORNO_ANTIGO}`
                    : `Estornar recebimento da compra de ${compra.fornecedorNome}`
                }
                title={dispEstorno === "indisponivel" ? HINT_ESTORNO_ANTIGO : undefined}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#FECACA] px-4 py-2.5 text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:flex-1"
              >
                <Undo2 size={15} />
                Estornar
              </button>
            ))}
        </SheetFooterActions>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <BadgeCompraStatus status={compra.status} />
        {compra.status === "PENDENTE" && compra.dataPrevista && (
          <ChipPrevisto dataPrevista={compra.dataPrevista} />
        )}
        {compra.dataRecebimento && (
          <span className="text-xs text-[#627271]">Recebida em {formatarDataBR(compra.dataRecebimento)}</span>
        )}
      </div>

      <div className="space-y-2.5">
        {compra.itens.map((item) => {
          const uc = item.unidadeCompra;
          return (
            <div key={item.id} className="rounded-xl border border-[#efefef] p-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                  {item.produtoNome}
                </p>
                <span className="shrink-0 text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
                  {formatCurrency(item.quantidade * item.valorUnitario)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#627271]">
                {fmtNum(item.quantidade)} {uc || item.unidadeEstoque} × {formatCurrency(item.valorUnitario)}
                {uc ? ` (${uc})` : ""}
              </p>
              {uc && (
                <p className="mt-1 text-[11px]" style={{ color: "#059669", fontWeight: 600 }}>
                  = {fmtNum(qtdEstoque(item))} {item.unidadeEstoque} ao estoque · custo por unidade de estoque{" "}
                  {formatCurrency(custoPorUnidadeEstoque(item))}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#efefef] pt-4">
        <span className="text-sm text-[#627271]">Total da compra</span>
        <span className="text-xl text-[#1f2937]" style={{ fontWeight: 700 }}>
          {formatCurrency(compra.valorTotal)}
        </span>
      </div>
    </BottomSheet>
  );
}

/* ─────────────── EstornoRecebimento E2 — Modal de confirmação ─────────── */

interface EstornarRecebimentoSheetProps {
  compra: Compra | null;
  onClose: () => void;
  /** RPC chamada pelo hook (única escrita da ação) */
  estornar: (p: { compraId: string }) => Promise<{ success: boolean; error?: string; detail?: string }>;
  salvando: boolean;
  /** sucesso: pai fecha o modal, recarrega (idempotente) e mostra a banda */
  onSucesso: (compra: Compra) => void;
}

/**
 * WIRE E2 — bottom-sheet de confirmação "Estornar recebimento · {fornecedor}".
 * Lista "O QUE VAI ACONTECER" (4 itens secos), primário em esquema de perigo
 * (padrão destrutivo do app), secundário fecha. Loading → "Estornando…"
 * desabilitado; erro da RPC → banda NÃO ESTORNA com `error` integralmente
 * (mensagem já humana — nada de raw SQL no jsonb da RPC).
 */
function EstornarRecebimentoSheet({
  compra,
  onClose,
  estornar,
  salvando,
  onSucesso,
}: EstornarRecebimentoSheetProps) {
  const [erro, setErro] = useState("");

  const confirmar = async () => {
    if (!compra || salvando) return;
    setErro("");
    const r = await estornar({ compraId: compra.id });
    if (r.success) {
      onSucesso(compra);
    } else {
      // banda visível no sheet aberto; ações voltam habilitadas
      setErro(r.error || "Não foi possível estornar o recebimento.");
    }
  };

  if (!compra) return null;

  return (
    <BottomSheet
      open
      onClose={salvando ? () => undefined : onClose}
      labelledBy="estornar-compra-titulo"
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="estornar-compra-titulo" className="truncate text-base font-semibold text-[#1f2937] sm:text-lg">
              Estornar recebimento · {compra.fornecedorNome}
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              {compra.notaFiscal ? `NF ${compra.notaFiscal} · ` : ""}
              {formatCurrency(compra.valorTotal)} · recebida em{" "}
              {compra.dataRecebimento ? formatarDataBR(compra.dataRecebimento) : dataCompraBR(compra.dataCompra)}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={salvando}
            aria-label="Fechar"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
      }
      footer={
        <div>
          {/* Error (E2) — banda NÃO ESTORNA acima das ações; `error` da RPC é a
              mensagem humana integral (CONTA_PAGA / MOVIMENTACAO_POSTERIOR já
              vêm completas no `error`). */}
          {erro && (
            <div
              role="status"
              className="mb-3 rounded-xl border p-3.5"
              style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
            >
              <p className="text-xs" style={{ color: "#B91C1C", fontWeight: 700 }}>
                NÃO ESTORNA
              </p>
              <p className="mt-1 text-sm leading-snug" style={{ color: "#991B1B" }}>
                {erro}
              </p>
            </div>
          )}
          <SheetFooterActions>
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className={`${sheetButtonSecundario} disabled:opacity-50`}
            >
              Manter como está
            </button>
            <button
              type="button"
              onClick={confirmar}
              data-sheet-foco
              disabled={salvando}
              aria-label={`Estornar recebimento da compra de ${compra.fornecedorNome}`}
              className={sheetButtonPerigo}
              style={{ background: "#DC2626" }}
            >
              {salvando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Estornando…
                </>
              ) : (
                "Estornar recebimento"
              )}
            </button>
          </SheetFooterActions>
        </div>
      }
    >
      {/* O QUE VAI ACONTECER — rótulos secos do WIRE E2, 4 itens */}
      <div className="rounded-xl border border-[#efefef] bg-[#f8f9fa] p-4" role="group" aria-labelledby="estornar-oque-titulo">
        <p id="estornar-oque-titulo" className="mb-2 text-xs text-[#1f2937]" style={{ fontWeight: 700 }}>
          O QUE VAI ACONTECER
        </p>
        <ul className="space-y-1.5 text-sm leading-snug text-[#1f2937]">
          <li>· estoque e custo dos insumos voltam ao estado de ANTES do recebimento</li>
          <li>· a conta a pagar fica CANCELADA no Financeiro</li>
          <li>· a compra volta para PENDENTE</li>
          <li>
            · o extrato registra a saída "Estorno" — <span style={{ fontWeight: 600 }}>nada é apagado</span>
          </li>
        </ul>
      </div>
    </BottomSheet>
  );
}
