/**
 * Compras de insumo — Produção Fase 2 (WIRE-Producao-Fase2-Compras v1.1, D11).
 *
 * Lista real do banco (`useCompras`), KPIs derivados, Nova Compra com conversão
 * de unidade + 3 modos de recebimento (Agora / Agendar / Só registrar), Receber
 * via RPC `receber_compra` (estoque + custo médio + conta a pagar) e Cancelar.
 *
 * Padrões copiados do módulo:
 * - `ProdutosPage`: skeleton só na 1ª carga, **modais FORA do gate de loading**
 *   (HOTFIX: refetch não pode desmontar o formulário em digitação).
 * - `ContasPagarPage`: BottomSheet mobile / dialog desktop, KPIs, busca+filtros.
 * Cores: só as textuais do módulo (#1f2937/#627271/#efefef/#86cb92 + âmbar e
 * vermelho de atenção já usados em Financeiro). Sem animação.
 */
import { useMemo, useRef, useState } from "react";
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
import { useFornecedores, type FornecedorSimples } from "../../hooks/use-fornecedores";
import { useCriarCompra, type CriarCompraParams, type CriarCompraResult } from "../../hooks/use-criar-compra";
import { useReceberCompra, type ReceberCompraParams, type ReceberCompraResult } from "../../hooks/use-receber-compra";
import { useCancelarCompra } from "../../hooks/use-cancelar-compra";
import {
  BottomSheet,
  campoFormSheet,
  FinanceKpi,
  SheetActions,
  sheetButtonPerigo,
  sheetButtonPrimario,
  sheetButtonSecundario,
  formatarDataBR,
  hojeLocal,
} from "../financeiro/components";
import type { Produto } from "../../types/produto";
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

type ModoRecebimento = "AGORA" | "AGENDAR" | "SÓ";

export function ComprasPage() {
  const navigate = useNavigate();
  const { compras, loading, error, recarregar } = useCompras();
  const { produtos } = useProdutos();
  const { fornecedores } = useFornecedores();
  const { criarCompra, loading: criando } = useCriarCompra();
  const { receberCompra, loading: recebendo } = useReceberCompra();
  const { cancelarCompra, loading: cancelando } = useCancelarCompra();

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"TODOS" | StatusCompra>("TODOS");
  const [novaAberta, setNovaAberta] = useState(false);
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
              onClick={() => setNovaAberta(true)}
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
                  onClick={temFiltro ? limparFiltros : () => setNovaAberta(true)}
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
          meio da digitação — HOTFIX do ProdutosPage, 06/10) */}
      <NovaCompraSheet
        open={novaAberta}
        onClose={() => setNovaAberta(false)}
        onConcluida={recarregar}
        fornecedores={fornecedores}
        produtos={produtos}
        criarCompra={criarCompra}
        receberCompra={receberCompra}
        salvando={criando || recebendo}
        navigate={navigate}
      />

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
            <div className="flex gap-2">
              <button
                onClick={() => setCancelarAlvo(null)}
                disabled={cancelando}
                className="flex-1 rounded-xl border border-[#efefef] px-4 py-2.5 text-sm text-[#1f2937] transition-colors hover:bg-[#efefef]"
                style={{ fontWeight: 500 }}
              >
                Voltar
              </button>
              <button
                onClick={confirmarCancelamento}
                data-sheet-foco
                disabled={cancelando}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: "#DC2626" }}
              >
                {cancelando ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  "Confirmar cancelamento"
                )}
              </button>
            </div>
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

/* ───────────────────────── Modal Nova Compra ─────────────────────────── */

interface LinhaItem {
  chave: string;
  produto: Produto;
  quantidade: string;
  valorUnitario: string;
}

interface NovaCompraSheetProps {
  open: boolean;
  onClose: () => void;
  onConcluida: () => void;
  fornecedores: FornecedorSimples[];
  produtos: Produto[];
  criarCompra: (p: CriarCompraParams) => Promise<CriarCompraResult>;
  receberCompra: (p: ReceberCompraParams) => Promise<ReceberCompraResult>;
  salvando: boolean;
  navigate: (to: string) => void;
}

function NovaCompraSheet({
  open,
  onClose,
  onConcluida,
  fornecedores,
  produtos,
  criarCompra,
  receberCompra,
  salvando,
  navigate,
}: NovaCompraSheetProps) {
  const fornecedorRef = useRef<HTMLDivElement>(null);
  const insumoRef = useRef<HTMLDivElement>(null);

  const [fornecedorId, setFornecedorId] = useState<string | null>(null);
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [fornecedorAberto, setFornecedorAberto] = useState(false);
  const [notaFiscal, setNotaFiscal] = useState("");
  const [itens, setItens] = useState<LinhaItem[]>([]);
  const [termoInsumo, setTermoInsumo] = useState("");
  const [insumosAberto, setInsumosAberto] = useState(false);
  // Emenda D11 — três modos; "Só registrar" é o padrão (SPEC §5.2 c)
  const [modo, setModo] = useState<ModoRecebimento>("SÓ");
  const [dataRecebimento, setDataRecebimento] = useState(hojeLocal());
  const [dataVencimento, setDataVencimento] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [dataPrevista, setDataPrevista] = useState(format(addDays(new Date(), 3), "yyyy-MM-dd"));
  const [erro, setErro] = useState("");

  const fornecedorSelecionado = fornecedores.find((f) => f.id === fornecedorId) || null;

  // Busca client-side de fornecedores (mesma mecânica da busca de insumos)
  const qFornecedor = buscaFornecedor.trim().toLowerCase();
  const candidatosFornecedor = fornecedores
    .filter((f) => !qFornecedor || f.nome.toLowerCase().includes(qFornecedor))
    .slice(0, 8);

  // Insumos: MESMA mecânica da busca de componentes da ficha técnica (Fase 1);
  // exclui os já adicionados.
  const qInsumo = termoInsumo.trim().toLowerCase();
  const candidatosInsumo = produtos
    .filter((p) => p.natureza === "insumo")
    .filter((p) => !itens.some((l) => l.produto.id === p.id))
    .filter((p) => !qInsumo || p.nome.toLowerCase().includes(qInsumo) || p.sku.toLowerCase().includes(qInsumo))
    .slice(0, 8);

  const adicionar = (p: Produto) => {
    setItens((prev) => [
      ...prev,
      { chave: `novo-${p.id}`, produto: p, quantidade: "", valorUnitario: "" },
    ]);
    setTermoInsumo("");
    setInsumosAberto(false);
    setErro("");
  };

  const atualizarLinha = (chave: string, patch: Partial<LinhaItem>) =>
    setItens((prev) => prev.map((l) => (l.chave === chave ? { ...l, ...patch } : l)));

  const remover = (chave: string) => setItens((prev) => prev.filter((l) => l.chave !== chave));

  const linhasCalculadas = itens.map((l) => {
    const qtd = parseFloat(l.quantidade) || 0;
    const vu = parseFloat(l.valorUnitario) || 0;
    return {
      linha: l,
      qtd,
      vu,
      entra: qtd * (l.produto.fatorConversao ?? 1),
      subtotal: qtd * vu,
      conversionOk: !l.produto.unidadeCompra?.trim() || Number(l.produto.fatorConversao) > 0,
    };
  });
  const total = linhasCalculadas.reduce((s, l) => s + l.subtotal, 0);

  const salvar = async () => {
    setErro("");

    if (!fornecedorId) {
      setErro("Selecione o fornecedor da compra.");
      return;
    }
    if (itens.length === 0) {
      setErro("Adicione pelo menos um insumo.");
      return;
    }
    for (const l of linhasCalculadas) {
      if (!(l.qtd > 0)) {
        setErro(`Informe uma quantidade maior que zero para "${l.linha.produto.nome}".`);
        return;
      }
      if (!Number.isFinite(l.vu) || l.vu < 0) {
        setErro(`Valor unitário inválido para "${l.linha.produto.nome}".`);
        return;
      }
      if (!l.conversionOk) {
        setErro(
          `"${l.linha.produto.nome}" é comprado por ${l.linha.produto.unidadeCompra?.trim()} mas está sem fator de conversão no cadastro — corrija o produto.`
        );
        return;
      }
    }
    if (modo === "AGORA" && (!dataRecebimento || !dataVencimento)) {
      setErro("No modo \"já recebi\", informe a data de recebimento e o vencimento da conta.");
      return;
    }
    if (modo === "AGENDAR" && !dataPrevista) {
      setErro("Informe a data prevista de recebimento.");
      return;
    }

    const r = await criarCompra({
      fornecedorId,
      notaFiscal: notaFiscal.trim() || null,
      itens: itens.map((l) => ({
        produtoId: l.produto.id,
        quantidade: parseFloat(l.quantidade) || 0,
        valorUnitario: parseFloat(l.valorUnitario) || 0,
      })),
      dataPrevista: modo === "AGENDAR" ? dataPrevista : null,
    });

    if (!r.success || !r.id) {
      setErro(r.error || "Não foi possível registrar a compra.");
      return;
    }

    if (modo === "AGORA") {
      // fluxo D11: cria e recebe na sequência (RPC faz estoque + custo + conta)
      const rc = await receberCompra({ compraId: r.id, dataRecebimento, dataVencimento });
      if (rc.success) {
        toast.success(toastRecebido(rc));
      } else {
        toast.error(
          `A compra ficou PENDENTE — ${rc.error || "não foi possível receber"}. Você pode recebê-la pela lista.`
        );
      }
    } else if (modo === "AGENDAR") {
      toast.success(`Compra agendada — prevista para ${formatarDataBR(dataPrevista)}.`);
    } else {
      toast.success("Compra registrada — aguardando recebimento.");
    }

    onConcluida();
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={salvando ? () => undefined : onClose} labelledBy="nova-compra-titulo" wide>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 id="nova-compra-titulo" className="text-lg font-semibold text-[#1f2937]">
            Nova Compra
          </h2>
          <p className="mt-0.5 text-xs text-[#627271]">
            Registre a compra de insumos. O estoque só sobe quando você receber.
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={salvando}
          aria-label="Fechar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937] disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5">
        {/* ── Fornecedor (obrigatório — D10) ── */}
        <section>
          <p className="mb-1.5 text-sm font-medium text-[#1f2937]">Fornecedor *</p>
          {fornecedores.length === 0 ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#efefef] bg-[#FAFAFA] px-3.5 py-3">
              <p className="text-xs text-[#627271]">Nenhum fornecedor cadastrado ainda.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/fornecedores/novo");
                }}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#efefef] bg-white px-3 py-2 text-xs text-[#1f2937] transition-colors hover:bg-[#efefef]"
                style={{ fontWeight: 500 }}
              >
                <Truck size={13} />
                Cadastrar agora
              </button>
            </div>
          ) : (
            <div className="relative" ref={fornecedorRef}>
              <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
              <input
                type="text"
                value={fornecedorSelecionado ? fornecedorSelecionado.nome : buscaFornecedor}
                onChange={(e) => {
                  setFornecedorId(null);
                  setBuscaFornecedor(e.target.value);
                  setFornecedorAberto(true);
                  setErro("");
                }}
                onFocus={() => setFornecedorAberto(true)}
                onBlur={(e) => {
                  // fecha só quando o foco sai de tudo (HOTFIX recheio da ficha)
                  if (!fornecedorRef.current?.contains(e.relatedTarget as Node | null)) setFornecedorAberto(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (candidatosFornecedor[0]) {
                      setFornecedorId(candidatosFornecedor[0].id);
                      setBuscaFornecedor("");
                      setFornecedorAberto(false);
                    }
                  }
                }}
                placeholder="Buscar fornecedor..."
                aria-label="Selecionar fornecedor"
                className={`${campoFormSheet} pl-10`}
              />
              {fornecedorSelecionado && (
                <button
                  type="button"
                  onClick={() => {
                    setFornecedorId(null);
                    setBuscaFornecedor("");
                  }}
                  aria-label="Limpar fornecedor selecionado"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#627271] hover:text-[#1f2937]"
                >
                  <X size={14} />
                </button>
              )}
              {fornecedorAberto && !fornecedorSelecionado && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#efefef] bg-white shadow-lg">
                  {candidatosFornecedor.length === 0 ? (
                    <p className="p-3 text-center text-sm text-[#627271]">Nenhum fornecedor encontrado.</p>
                  ) : (
                    candidatosFornecedor.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setFornecedorId(f.id);
                          setBuscaFornecedor("");
                          setFornecedorAberto(false);
                          setErro("");
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#efefef]"
                      >
                        <Truck size={14} className="shrink-0 text-[#627271]" />
                        <span className="min-w-0 truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                          {f.nome}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Nota fiscal (opcional) ── */}
        <label className="block text-sm font-medium text-[#1f2937]">
          Nota fiscal (opcional)
          <input
            type="text"
            value={notaFiscal}
            onChange={(e) => setNotaFiscal(e.target.value)}
            placeholder="Ex.: 1042"
            autoComplete="off"
            className={campoFormSheet}
          />
        </label>

        {/* ── Itens ── */}
        <section>
          <p className="mb-1.5 text-sm font-medium text-[#1f2937]">
            Insumos comprados{" "}
            <span className="text-xs font-normal text-[#627271]">
              ({produtos.filter((p) => p.natureza === "insumo").length} cadastrados)
            </span>
          </p>
          <div className="relative" ref={insumoRef}>
            <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
            <input
              type="text"
              value={termoInsumo}
              onChange={(e) => {
                setTermoInsumo(e.target.value);
                setInsumosAberto(true);
              }}
              onFocus={() => setInsumosAberto(true)}
              onBlur={(e) => {
                if (!insumoRef.current?.contains(e.relatedTarget as Node | null)) setInsumosAberto(false);
              }}
              onKeyDown={(e) => {
                // Enter adiciona o primeiro candidato e NUNCA submete
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (candidatosInsumo[0]) adicionar(candidatosInsumo[0]);
                }
              }}
              placeholder="Adicionar outro insumo (nome ou SKU)..."
              aria-label="Buscar insumo para adicionar"
              className={`${campoFormSheet} pl-10`}
            />
            {insumosAberto && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#efefef] bg-white shadow-lg">
                {candidatosInsumo.length === 0 ? (
                  <p className="p-3 text-center text-sm text-[#627271]">
                    {produtos.filter((p) => p.natureza === "insumo").length === 0
                      ? "Nenhum insumo cadastrado — marque a natureza \"Insumo\" no cadastro do produto."
                      : "Nenhum insumo disponível para adicionar."}
                  </p>
                ) : (
                  candidatosInsumo.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      // pointerdown dispara antes do blur (mouse E touch) — padrão da ficha F1
                      onPointerDown={(e) => {
                        e.preventDefault();
                        adicionar(p);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#efefef]"
                    >
                      <Package size={14} className="shrink-0 text-[#627271]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                          {p.nome}
                        </span>
                        <span className="block truncate text-xs text-[#627271]">
                          {p.sku || "sem SKU"} · estoque em {p.unidade}
                          {p.unidadeCompra ? ` · compra por ${p.unidadeCompra}` : ""}
                        </span>
                      </span>
                      <Plus size={14} className="shrink-0 text-[#627271]" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {itens.length === 0 ? (
            <div className="mt-2 rounded-xl border border-dashed border-[#efefef] p-5 text-center">
              <p className="text-sm text-[#627271]">Nenhum insumo na compra — busque e adicione acima.</p>
            </div>
          ) : (
            <div className="mt-2 space-y-2.5">
              {linhasCalculadas.map(({ linha, qtd, vu, entra, subtotal, conversionOk }) => {
                const uc = linha.produto.unidadeCompra?.trim() || null;
                return (
                  <div key={linha.chave} className="rounded-xl border border-[#efefef] bg-white p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                          {linha.produto.nome}
                        </p>
                        <p className="text-[11px] text-[#627271]">
                          estoque em {linha.produto.unidade}
                          {uc ? ` · compra por ${uc}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remover(linha.chave)}
                        aria-label={`Remover ${linha.produto.nome} da compra`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block text-xs font-medium text-[#1f2937]">
                        Quantidade ({uc || linha.produto.unidade}) *
                        <input
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          value={linha.quantidade}
                          onChange={(e) => atualizarLinha(linha.chave, { quantidade: e.target.value })}
                          placeholder="0"
                          className={`${campoFormSheet} text-base`}
                        />
                      </label>
                      <label className="block text-xs font-medium text-[#1f2937]">
                        Valor unitário (R$)
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={linha.valorUnitario}
                          onChange={(e) => atualizarLinha(linha.chave, { valorUnitario: e.target.value })}
                          placeholder="0,00"
                          className={`${campoFormSheet} text-base`}
                        />
                      </label>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      {uc ? (
                        conversionOk ? (
                          <span
                            className="rounded-md border px-1.5 py-0.5"
                            style={{ background: "#F0FDF4", borderColor: "#A7F3D0", color: "#059669", fontWeight: 600 }}
                          >
                            = {fmtNum(entra)} {linha.produto.unidade} ao estoque
                          </span>
                        ) : (
                          <span
                            className="rounded-md border px-1.5 py-0.5"
                            style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309", fontWeight: 600 }}
                          >
                            sem fator de conversão — corrija o cadastro
                          </span>
                        )
                      ) : (
                        <span className="text-[#627271]">entra direto em {linha.produto.unidade}</span>
                      )}
                      <span className="text-[#1f2937]" style={{ fontWeight: 700 }}>
                        subtotal {formatCurrency(subtotal)}
                        {conversionOk && uc && qtd > 0 && vu >= 0 ? (
                          <span className="ml-1 font-normal text-[#627271]">
                            · {formatCurrency(vu / (linha.produto.fatorConversao ?? 1))}/{linha.produto.unidade}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Quando recebe? (emenda D11) ── */}
        <section role="radiogroup" aria-label="Quando recebe?">
          <p className="mb-1.5 text-sm font-medium text-[#1f2937]">Quando recebe?</p>
          <div className="divide-y divide-[#efefef] rounded-xl border border-[#efefef]">
            <div className="p-3" style={{ background: modo === "AGORA" ? "#efefef" : undefined }}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="modo-recebimento"
                  checked={modo === "AGORA"}
                  onChange={() => setModo("AGORA")}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#86cb92]"
                />
                <span className="min-w-0">
                  <span className="block text-sm text-[#1f2937]" style={{ fontWeight: modo === "AGORA" ? 600 : 500 }}>
                    Agora — já recebi esta compra
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#627271]">
                    Estoque sobe na hora, custo médio recalcula e nasce 1 conta a pagar no Financeiro.
                  </span>
                </span>
              </label>
              {modo === "AGORA" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="block text-xs font-medium text-[#1f2937]">
                    Data de recebimento *
                    <input
                      type="date"
                      value={dataRecebimento}
                      onChange={(e) => setDataRecebimento(e.target.value)}
                      className={campoFormSheet}
                    />
                  </label>
                  <label className="block text-xs font-medium text-[#1f2937]">
                    Vencimento da conta *
                    <input
                      type="date"
                      value={dataVencimento}
                      onChange={(e) => setDataVencimento(e.target.value)}
                      className={campoFormSheet}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="p-3" style={{ background: modo === "AGENDAR" ? "#efefef" : undefined }}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="modo-recebimento"
                  checked={modo === "AGENDAR"}
                  onChange={() => setModo("AGENDAR")}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#86cb92]"
                />
                <span className="min-w-0">
                  <span className="block text-sm text-[#1f2937]" style={{ fontWeight: modo === "AGENDAR" ? 600 : 500 }}>
                    Agendar
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#627271]">
                    Compra fica pendente com data prevista visível na lista.
                  </span>
                </span>
              </label>
              {modo === "AGENDAR" && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-[#1f2937]">
                    Data prevista *
                    <input
                      type="date"
                      value={dataPrevista}
                      onChange={(e) => setDataPrevista(e.target.value)}
                      className={campoFormSheet}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="p-3" style={{ background: modo === "SÓ" ? "#efefef" : undefined }}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="modo-recebimento"
                  checked={modo === "SÓ"}
                  onChange={() => setModo("SÓ")}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#86cb92]"
                />
                <span className="min-w-0">
                  <span className="block text-sm text-[#1f2937]" style={{ fontWeight: modo === "SÓ" ? 600 : 500 }}>
                    Só registrar
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#627271]">
                    Pendente puro — você recebe depois pela lista.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </section>

        {erro && (
          <p className="text-xs text-red-600" role="alert" style={{ fontWeight: 500 }}>
            {erro}
          </p>
        )}

        {/* Rodapé: total + submit */}
        <div className="border-t border-[#efefef] pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm text-[#627271]">Total</span>
            <span className="text-xl text-[#1f2937]" style={{ fontWeight: 700 }}>
              {formatCurrency(total)}
            </span>
          </div>
          <SheetActions>
            <button type="button" onClick={onClose} disabled={salvando} className={sheetButtonSecundario}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              data-sheet-foco
              disabled={salvando}
              className={sheetButtonPrimario}
              style={{ background: "#86cb92" }}
            >
              {salvando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                "Salvar compra"
              )}
            </button>
          </SheetActions>
          <p className="mt-2 text-center text-[11px] text-[#627271]">
            {modo === "AGORA"
              ? "Salvar = recebe: estoque + custo médio + conta a pagar de " + formatCurrency(total)
              : "Registrar não mexe no estoque — use Receber quando a mercadoria chegar."}
          </p>
        </div>
      </div>
    </BottomSheet>
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

  return (
    <BottomSheet open={compra !== null} onClose={salvando ? () => undefined : onClose} labelledBy="receber-compra-titulo">
      {compra && (
        <>
          <div className="mb-4">
            <h2 id="receber-compra-titulo" className="text-lg font-semibold text-[#1f2937]">
              Receber compra — {compra.fornecedorNome}
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              NF {compra.notaFiscal || "—"} · {formatCurrency(compra.valorTotal)} ·{" "}
              {compra.itens.length} {compra.itens.length === 1 ? "item" : "itens"}
            </p>
          </div>

          <div className="mb-4 space-y-1.5 rounded-xl bg-[#f8f9fa] p-4">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[#1f2937]">
              Data de recebimento *
              <input
                type="date"
                value={dataRecebimento}
                onChange={(e) => {
                  setDataRecebimento(e.target.value);
                  setErro("");
                }}
                className={campoFormSheet}
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
                className={campoFormSheet}
              />
            </label>
          </div>

          {erro && (
            <p className="mt-3 text-xs text-red-600" role="alert" style={{ fontWeight: 500 }}>
              {erro}
            </p>
          )}

          <SheetActions>
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
          </SheetActions>
        </>
      )}
    </BottomSheet>
  );
}

/* ───────────────────────── Sheet Detalhe Compra ──────────────────────── */

function DetalheCompraSheet({ compra, onClose }: { compra: Compra | null; onClose: () => void }) {
  return (
    <BottomSheet open={compra !== null} onClose={onClose} labelledBy="detalhe-compra-titulo" wide>
      {compra && (
        <>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id="detalhe-compra-titulo" className="text-lg font-semibold text-[#1f2937]">
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
            >
              <X size={18} />
            </button>
          </div>

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
                <div key={item.id} className="rounded-xl border border-[#efefef] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
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

          <SheetActions>
            <button type="button" onClick={onClose} className={sheetButtonSecundario}>
              Fechar
            </button>
          </SheetActions>
        </>
      )}
    </BottomSheet>
  );
}
