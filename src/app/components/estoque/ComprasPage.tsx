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
 */
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
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
  X,
} from "lucide-react";
import { toast } from "sonner";
import { addDays, format, isSameMonth, parseISO } from "date-fns";
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

/* ───────────────────────────── página ───────────────────────────────── */

const FILTRO_OPCOES: { valor: "TODOS" | StatusCompra; label: string }[] = [
  { valor: "TODOS", label: "Todos" },
  { valor: "PENDENTE", label: "Pendente" },
  { valor: "RECEBIDO", label: "Recebido" },
  { valor: "CANCELADO", label: "Cancelado" },
];

export function ComprasPage() {
  const navigate = useNavigate();
  const { compras, loading, error, recarregar } = useCompras();
  // KPI "itens em falta" — a CRIAÇÃO da compra mora na rota
  // /estoque/compras/nova (WIRE C1); aqui ficam só lista + receber/cancelar/detalhe.
  const { produtos } = useProdutos();
  const { receberCompra, loading: recebendo } = useReceberCompra();
  const { cancelarCompra, loading: cancelando } = useCancelarCompra();

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"TODOS" | StatusCompra>("TODOS");
  const [receberAlvo, setReceberAlvo] = useState<Compra | null>(null);
  const [cancelarAlvo, setCancelarAlvo] = useState<Compra | null>(null);
  const [detalheAlvo, setDetalheAlvo] = useState<Compra | null>(null);

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
          <div className="mb-5 grid gap-2 sm:grid-cols-3 lg:gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-xl bg-[#efefef]" />
            ))}
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

          {/* KPIs — 1 coluna no mobile, 3 no desktop (WIRE §4) */}
          <section className="mb-5 grid gap-2 sm:grid-cols-3 lg:gap-3" aria-label="Indicadores de compra">
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
      />

      <DetalheCompraSheet compra={detalheAlvo} onClose={() => setDetalheAlvo(null)} />

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
  tall = false,
}: {
  compra: Compra;
  onReceber: () => void;
  onCancelar: () => void;
  onDetalhe: () => void;
  tall?: boolean;
}) {
  const pendente = compra.status === "PENDENTE";
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
}: {
  compra: Compra;
  onReceber: () => void;
  onCancelar: () => void;
  onDetalhe: () => void;
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

      <div className="mt-2.5">
        <AcoesCompra compra={compra} onReceber={onReceber} onCancelar={onCancelar} onDetalhe={onDetalhe} tall />
      </div>
    </div>
  );
}

function CompraRow({
  compra,
  onReceber,
  onCancelar,
  onDetalhe,
}: {
  compra: Compra;
  onReceber: () => void;
  onCancelar: () => void;
  onDetalhe: () => void;
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
        <AcoesCompra compra={compra} onReceber={onReceber} onCancelar={onCancelar} onDetalhe={onDetalhe} />
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
}

function ReceberCompraSheet({ compra, onClose, onConcluida, receberCompra, salvando }: ReceberCompraSheetProps) {
  const [dataRecebimento, setDataRecebimento] = useState(hojeLocal());
  const [dataVencimento, setDataVencimento] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [erro, setErro] = useState("");

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
      onClose();
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
              Receber compra
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
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5 rounded-xl border border-[#efefef] bg-[#f8f9fa] p-4">
          <p className="mb-1 text-xs text-[#1f2937]" style={{ fontWeight: 700 }}>
            Entrará no estoque:
          </p>
          {compra.itens.map((item) => (
            <p key={item.id} className="flex items-center justify-between gap-3 text-sm text-[#1f2937]">
              <span className="min-w-0 truncate">· {item.produtoNome}</span>
              <span className="shrink-0" style={{ fontWeight: 600 }}>
                +{fmtNum(qtdEstoque(item))} {item.unidadeEstoque}
              </span>
            </p>
          ))}
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
    </BottomSheet>
  );
}

/* ───────────────────────── Sheet Detalhe Compra ──────────────────────── */

function DetalheCompraSheet({ compra, onClose }: { compra: Compra | null; onClose: () => void }) {
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
