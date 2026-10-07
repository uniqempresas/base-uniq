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
 *
 * Mobile (auditoria 06/10): os sheets de formulário usam o modo `header` +
 * `footer` + `mobileFill` do `BottomSheet` — título/fechar fixos no topo,
 * Total + "Salvar" sempre visíveis embaixo (form longo não pode esconder o
 * submit). Inputs de valor/data em 16px (sem zoom do iOS), alvos ≥ 44px,
 * remover de linha afastado da digitação, rádios D11 como cards e busca de
 * insumo com o hotfix da ficha (pointerdown + mousedown + relatedTarget).
 *
 * U2 — USO REAL (mercado, uma mão): valor unitário pré-preenchido com o
 * último preço pago + chip "Última vez: R$ X/un · dd/MM" (linha e dropdown),
 * "Cadastrar item na hora" e "Cadastrar fornecedor na hora" em mini-sheets
 * (mesmo padrão header/footer sticky do designer) que voltam para a compra
 * com o item adicionado / fornecedor já selecionado.
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
import {
  useFornecedores,
  type CriarFornecedorDados,
  type CriarFornecedorResult,
  type FornecedorSimples,
} from "../../hooks/use-fornecedores";
import { useCriarCompra, type CriarCompraParams, type CriarCompraResult } from "../../hooks/use-criar-compra";
import { useReceberCompra, type ReceberCompraParams, type ReceberCompraResult } from "../../hooks/use-receber-compra";
import { useCancelarCompra } from "../../hooks/use-cancelar-compra";
import {
  useCriarProduto,
  validarConversaoCompra,
  type CriarProdutoParams,
  type CriarProdutoResult,
} from "../../hooks/use-criar-produto";
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

/** Unidades de estoque do mini-sheet U2.2 — as MESMAS 12 do cadastro (F1). */
const UNIDADES_ESTOQUE = ["Unidade", "Peça", "Par", "Kit", "Kg", "g", "Metro", "Litro", "ml", "Frasco", "Caixa", "Pacote"];
/** Datalist "Compra por" — mesma lista do ProdutoFormModal (F2 — WIRE §3). */
const UNIDADES_COMPRA = ["kg", "g", "L", "ml", "un", "lata", "caixa", "pacote", "m"];

/**
 * U2.2 — linha da compra aceita também o SNAPSHOT do item recém-cadastrado no
 * mini-sheet: só os campos que a linha lê. Evita esperar o refetch do
 * `useProdutos` para adicionar o item com o valor pré-preenchido.
 */
type LinhaNova = Pick<
  Produto,
  | "id"
  | "nome"
  | "sku"
  | "unidade"
  | "unidadeCompra"
  | "fatorConversao"
  | "ultimoPrecoCompra"
  | "ultimaCompraEm"
>;

/**
 * U2.1 — chip discreto do último preço pago (pill neutra 11px, cinza do
 * módulo). Sem histórico → "Primeira compra deste item".
 */
function ChipUltimoPreco({ produto, className = "" }: { produto: LinhaNova; className?: string }) {
  const ultimo = produto.ultimoPrecoCompra;
  const tem = ultimo != null && ultimo > 0;
  let data = "";
  if (tem && produto.ultimaCompraEm) {
    try {
      data = ` · ${format(parseISO(produto.ultimaCompraEm), "dd/MM")}`;
    } catch {
      data = ""; // data prevista em formato inesperado nunca deve quebrar a tela
    }
  }
  const un = produto.unidadeCompra?.trim() || produto.unidade;
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#efefef] px-2 py-0.5 text-[11px] leading-snug text-[#627271] ${className}`}
    >
      {tem ? `Última vez: ${formatCurrency(ultimo)}/${un}${data}` : "Primeira compra deste item"}
    </span>
  );
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
  // U2 — o mini-sheet "cadastrar item na hora" precisa do recarregar para o
  // novo insumo aparecer na busca assim que o modal fecha.
  const { produtos, recarregar: recarregarProdutos } = useProdutos();
  // U2.3 — find-or-create do fornecedor direto na compra (mercado, uma mão)
  const {
    fornecedores,
    recarregar: recarregarFornecedores,
    criarFornecedor,
    criando: criandoFornecedor,
  } = useFornecedores();
  const { criarCompra, loading: criando } = useCriarCompra();
  const { receberCompra, loading: recebendo } = useReceberCompra();
  const { cancelarCompra, loading: cancelando } = useCancelarCompra();
  // U2.2 — "cadastrar item na hora" no modal de compra (natureza forçada: insumo)
  const { criarProduto, loading: criandoProduto } = useCriarProduto();

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
        recarregarProdutos={recarregarProdutos}
        criarProduto={criarProduto}
        criandoProduto={criandoProduto}
        recarregarFornecedores={recarregarFornecedores}
        criarFornecedor={criarFornecedor}
        criandoFornecedor={criandoFornecedor}
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
  /** U2.2 — cadastrar insumo na hora + recarregar a lista da página */
  recarregarProdutos: () => void;
  criarProduto: (p: CriarProdutoParams) => Promise<CriarProdutoResult>;
  criandoProduto: boolean;
  /** U2.3 — cadastrar fornecedor na hora + recarregar a lista da página */
  recarregarFornecedores: () => void;
  criarFornecedor: (dados: CriarFornecedorDados) => Promise<CriarFornecedorResult>;
  criandoFornecedor: boolean;
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
  recarregarProdutos,
  criarProduto,
  criandoProduto,
  recarregarFornecedores,
  criarFornecedor,
  criandoFornecedor,
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
  // U2.2/U2.3 — mini-sheets de cadastro na hora (por cima da compra aberta)
  const [miniItemAberto, setMiniItemAberto] = useState(false);
  const [miniFornecedorAberto, setMiniFornecedorAberto] = useState(false);
  const [fornecedorExtra, setFornecedorExtra] = useState<FornecedorSimples | null>(null);

  // O sheet principal NÃO fecha enquanto um mini-sheet está aberto (Esc e
  // clique no backdrop passam por aqui; os mini-sheets depois montam na frente).
  const miniAberto = miniItemAberto || miniFornecedorAberto;
  const fecharFicha = () => {
    if (salvando || miniAberto) return;
    onClose();
  };

  // U2.3 — o fornecedor criado no mini-sheet já entra na lista local antes do
  // refetch chegar (a compra não pode ficar "sem fornecedor" no meio).
  const listaFornecedores = useMemo(() => {
    if (!fornecedorExtra) return fornecedores;
    if (fornecedores.some((f) => f.id === fornecedorExtra.id)) return fornecedores;
    return [...fornecedores, fornecedorExtra].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [fornecedores, fornecedorExtra]);

  const fornecedorSelecionado = listaFornecedores.find((f) => f.id === fornecedorId) || null;

  // Busca client-side de fornecedores (mesma mecânica da busca de insumos)
  const qFornecedor = buscaFornecedor.trim().toLowerCase();
  const candidatosFornecedor = listaFornecedores
    .filter((f) => !qFornecedor || f.nome.toLowerCase().includes(qFornecedor))
    .slice(0, 8);

  // Insumos: MESMA mecânica da busca de componentes da ficha técnica (Fase 1);
  // exclui os já adicionados.
  const qInsumo = termoInsumo.trim().toLowerCase();
  const totalInsumos = produtos.filter((p) => p.natureza === "insumo").length;
  const candidatosInsumo = produtos
    .filter((p) => p.natureza === "insumo")
    .filter((p) => !itens.some((l) => l.produto.id === p.id))
    .filter((p) => !qInsumo || p.nome.toLowerCase().includes(qInsumo) || p.sku.toLowerCase().includes(qInsumo))
    .slice(0, 8);

  const adicionar = (p: Produto | LinhaNova) => {
    // U2.1 — valor unitário pré-preenchido com o último preço pago (editável;
    // a pessoa só corrige quando o mercado mudou o preço).
    const ultimo = p.ultimoPrecoCompra != null && p.ultimoPrecoCompra > 0 ? String(p.ultimoPrecoCompra) : "";
    // IDEMPOTENTE de propósito: no hotfix da ficha, a seleção do dropdown usa
    // pointerdown + mousedown (mouse dispara os dois). Sem o guard aqui, o
    // mesmo toque duplicaria a linha no desktop.
    setItens((prev) =>
      prev.some((l) => l.produto.id === p.id)
        ? prev
        : [
            ...prev,
            { chave: `novo-${p.id}`, produto: p as Produto, quantidade: "", valorUnitario: ultimo },
          ]
    );
    setTermoInsumo("");
    setInsumosAberto(false);
    setErro("");
  };

  /** U2.2 — salvou o mini-sheet: cria o insumo, adiciona na hora à compra
   *  (snapshot com os campos que a linha lê) e recarrega a lista da página. */
  const aoCriarInsumo = (dados: {
    id: number;
    nome: string;
    sku: string;
    unidade: string;
    unidadeCompra: string;
    fator: number | null;
  }) => {
    adicionar({
      id: String(dados.id),
      nome: dados.nome,
      sku: dados.sku,
      unidade: dados.unidade,
      unidadeCompra: dados.unidadeCompra || null,
      fatorConversao: dados.fator,
      ultimoPrecoCompra: null,
      ultimaCompraEm: null,
    });
    recarregarProdutos();
    setMiniItemAberto(false);
    toast.success("Item cadastrado e adicionado à compra.");
  };

  /** U2.3 — salvou o mini-sheet: seleciona na hora + recarrega Fornecedores. */
  const aoCriarFornecedor = (novo: FornecedorSimples) => {
    setFornecedorExtra(novo);
    setFornecedorId(novo.id);
    setBuscaFornecedor("");
    setFornecedorAberto(false);
    setMiniFornecedorAberto(false);
    setErro("");
    recarregarFornecedores();
    toast.success("Fornecedor cadastrado.");
  };

  /**
   * U2.3 — ir para o cadastro COMPLETO (rota /fornecedores/novo) só funciona
   * fechando a ficha: o sheet é fixed inset-0 e cobriria a página inteira.
   * Confirma antes se a compra já tem itens digitados (não se perde nada).
   */
  const irParaFornecedorCompleto = () => {
    if (itens.length > 0 && !window.confirm("Isso fecha a compra atual — os itens digitados serão perdidos. Ir mesmo assim?")) {
      return;
    }
    onClose();
    navigate("/fornecedores/novo");
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
    <>
    <BottomSheet
      open={open}
      onClose={fecharFicha}
      labelledBy="nova-compra-titulo"
      wide
      mobileFill
      header={
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="nova-compra-titulo" className="text-base font-semibold text-[#1f2937] sm:text-lg">
              Nova Compra
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              Registre a compra de insumos. O estoque só sobe quando você receber.
            </p>
          </div>
          {/* Alvo de toque 44px e colado na borda (-mr-2) para o polegar */}
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
          {/* Erro no rodapé sticky: quem está no topo do form longo precisa
              ver a mensagem sem rolar até o fim */}
          {erro && (
            <p className="mb-2 text-xs text-red-600" role="alert" style={{ fontWeight: 500 }}>
              {erro}
            </p>
          )}
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm text-[#627271]">Total</span>
            <span className="text-xl text-[#1f2937]" style={{ fontWeight: 700 }}>
              {formatCurrency(total)}
            </span>
          </div>
          <SheetFooterActions>
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
          </SheetFooterActions>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ── Fornecedor (obrigatório — D10; + Novo fornecedor na hora — U2.3) ── */}
        <section>
          <p className="mb-1.5 text-sm font-medium text-[#1f2937]">Fornecedor *</p>
          {listaFornecedores.length === 0 ? (
            <div className="space-y-2 rounded-xl border border-[#efefef] bg-[#FAFAFA] p-3.5">
              <p className="text-xs text-[#627271]">
                Nenhum fornecedor cadastrado ainda — cadastre aqui mesmo, sem sair da compra.
              </p>
              <button
                type="button"
                onClick={() => setMiniFornecedorAberto(true)}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#86cb92] px-4 py-2.5 text-sm text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
                style={{ fontWeight: 600 }}
              >
                <Plus size={15} />
                Novo fornecedor
              </button>
              <button
                type="button"
                onClick={irParaFornecedorCompleto}
                className="min-h-[36px] w-full text-center text-xs text-[#627271] underline transition-colors hover:text-[#1f2937]"
              >
                ou faça o cadastro completo em Fornecedores (fecha esta compra)
              </button>
            </div>
          ) : (
            <>
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
                className={`${campoFormSheet} pl-10 text-base ${fornecedorSelecionado ? "pr-11" : ""}`}
              />
              {fornecedorSelecionado && (
                <button
                  type="button"
                  onClick={() => {
                    setFornecedorId(null);
                    setBuscaFornecedor("");
                  }}
                  aria-label="Limpar fornecedor selecionado"
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#627271] hover:text-[#1f2937]"
                >
                  <X size={16} />
                </button>
              )}
              {fornecedorAberto && !fornecedorSelecionado && (
                <div
                  className={
                    candidatosFornecedor.length > 0
                      ? "absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#efefef] bg-white shadow-lg"
                      : "relative mt-1 rounded-xl border border-[#efefef] bg-white shadow-lg"
                  }
                >
                  {candidatosFornecedor.length === 0 ? (
                    <div className="p-3 text-center">
                      <p className="text-sm text-[#627271]">
                        {qFornecedor ? "Nenhum fornecedor encontrado." : "Nenhum fornecedor cadastrado ainda."}
                      </p>
                      {/* Vazio SEM sobreposição: posicionando aqui em estático,
                          o botão empurra o formulário embaixo em vez de cobri-lo */}
                      <button
                        type="button"
                        onClick={() => setMiniFornecedorAberto(true)}
                        className="mt-3 min-h-[48px] w-full rounded-xl bg-[#86cb92] px-3 py-2.5 text-sm text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
                        style={{ fontWeight: 600 }}
                      >
                        {qFornecedor
                          ? `+ Cadastrar fornecedor “${buscaFornecedor.trim()}”`
                          : "+ Cadastrar novo fornecedor"}
                      </button>
                    </div>
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
                        // Hotfix da ficha (ProdutoFormModal): mousedown também,
                        // com preventDefault — fecha antes do toque em alguns
                        // WebViews se depender só de pointerdown.
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFornecedorId(f.id);
                          setBuscaFornecedor("");
                          setFornecedorAberto(false);
                          setErro("");
                        }}
                        className="flex min-h-[48px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#efefef]"
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
            {/* U2.3 — "+ Novo fornecedor" SEMPRE visível (mercado: o fornecedor
                do dia quase nunca está cadastrado) */}
            <button
              type="button"
              onClick={() => setMiniFornecedorAberto(true)}
              className="mt-1.5 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2.5 text-sm text-[#1f2937] transition-colors hover:bg-[#efefef]"
              style={{ fontWeight: 500 }}
            >
              <Plus size={14} />
              Novo fornecedor
            </button>
            </>
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
            className={`${campoFormSheet} text-base`}
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
              className={`${campoFormSheet} pl-10 text-base`}
            />
            {insumosAberto && (
              <div
                className={
                  candidatosInsumo.length > 0
                    ? "absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#efefef] bg-white shadow-lg"
                    : "relative mt-1 rounded-xl border border-[#efefef] bg-white shadow-lg"
                }
              >
                {candidatosInsumo.length === 0 ? (
                  <div className="p-3 text-center">
                    {totalInsumos === 0 ? (
                      <p className="text-sm text-[#627271]">
                        Nenhum insumo cadastrado — o botão abaixo já cria o primeiro com a natureza
                        &ldquo;Insumo&rdquo; aplicada.
                      </p>
                    ) : (
                      <p className="text-sm text-[#627271]">
                        {qInsumo ? "Nenhum insumo encontrado." : "Nenhum insumo disponível para adicionar."}
                      </p>
                    )}
                    {/* U2.2 — no mercado, o item que falta quase nunca está
                        cadastrado. Vazio SEM sobreposição: em estático, o botão
                        empurra o formulário embaixo em vez de cobri-lo. */}
                    <button
                      type="button"
                      onClick={() => {
                        setInsumosAberto(false);
                        setMiniItemAberto(true);
                      }}
                      className="mt-3 min-h-[48px] w-full rounded-xl bg-[#86cb92] px-3 py-2.5 text-sm text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
                      style={{ fontWeight: 600 }}
                    >
                      {qInsumo ? `+ Cadastrar “${termoInsumo.trim()}” como novo item` : "+ Cadastrar novo item"}
                    </button>
                  </div>
                ) : (
                  <>
                    {candidatosInsumo.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        // pointerdown dispara antes do blur (mouse E touch) — padrão da ficha F1
                        onPointerDown={(e) => {
                          e.preventDefault();
                          adicionar(p);
                        }}
                        // ...e mousedown com preventDefault como backup (hotfix
                        // ProdutoFormModal): sem ele o toque no celular fechava o
                        // dropdown antes de selecionar. adicionar() é idempotente.
                        onMouseDown={(e) => {
                          e.preventDefault();
                          adicionar(p);
                        }}
                        className="flex min-h-[48px] w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#efefef]"
                      >
                        <Package size={14} className="mt-1 shrink-0 text-[#627271]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                            {p.nome}
                          </span>
                          <span className="block truncate text-xs text-[#627271]">
                            {p.sku || "sem SKU"} · estoque em {p.unidade}
                            {p.unidadeCompra ? ` · compra por ${p.unidadeCompra}` : ""}
                          </span>
                          {/* U2.1 — última referência de preço sob nome/SKU */}
                          <ChipUltimoPreco produto={p} className="mt-1" />
                        </span>
                        <Plus size={14} className="mt-1 shrink-0 text-[#627271]" />
                      </button>
                    ))}
                    {/* Lista não vazia → secundário discreto no fim do dropdown */}
                    <button
                      type="button"
                      onClick={() => {
                        setInsumosAberto(false);
                        setMiniItemAberto(true);
                      }}
                      className="flex min-h-[44px] w-full items-center justify-center gap-1.5 border-t border-[#efefef] px-4 text-sm text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
                    >
                      <Plus size={14} />
                      Cadastrar novo item
                    </button>
                  </>
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
                  <div key={linha.chave} className="rounded-xl border border-[#efefef] bg-white p-3.5">
                    {/* Nome + remover. O botão de remover fica NO CABEÇALHO do
                        card (44px, canto superior) — nunca ao lado dos inputs
                        de digitação, para evitar remoção acidental no mobile. */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                          {linha.produto.nome}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#627271]">
                          estoque em {linha.produto.unidade}
                          {uc ? ` · compra por ${uc}` : ""}
                        </p>
                        {/* U2.1 — última referência ao lado do nome, antes dos inputs */}
                        <ChipUltimoPreco produto={linha.produto} className="mt-1.5 max-w-full" />
                      </div>
                      <button
                        type="button"
                        onClick={() => remover(linha.chave)}
                        aria-label={`Remover ${linha.produto.nome} da compra`}
                        className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Conversão logo abaixo do nome: o resultado fica visível
                        ANTES/DURANTE a digitação da quantidade, não escondido
                        embaixo dos inputs. */}
                    <div className="mt-2.5 text-[11px]">
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
                    </div>

                    {/* Qtd + valor em grid 2 colunas: 16px no input (sem zoom
                        do iOS) e alvo ≥ 44px de altura. */}
                    <div className="mt-3 grid grid-cols-2 gap-2.5">
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

                    <div className="mt-2.5 text-right text-[11px]">
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

        {/* ── Quando recebe? (emenda D11) — cards selecionáveis, alvo grande,
            campos dependentes aparecem DENTRO do card marcado (sem pular) ── */}
        <section role="radiogroup" aria-label="Quando recebe?">
          <p className="mb-2 text-sm font-medium text-[#1f2937]">Quando recebe?</p>
          <div className="space-y-2.5">
            <CardModo
              valor="AGORA"
              modo={modo}
              setModo={setModo}
              titulo="Agora — já recebi esta compra"
              descricao="Estoque sobe na hora, custo médio recalcula e nasce 1 conta a pagar no Financeiro."
            >
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className="block text-xs font-medium text-[#1f2937]">
                  Data de recebimento *
                  <input
                    type="date"
                    value={dataRecebimento}
                    onChange={(e) => setDataRecebimento(e.target.value)}
                    className={`${campoFormSheet} text-base`}
                  />
                </label>
                <label className="block text-xs font-medium text-[#1f2937]">
                  Vencimento da conta *
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className={`${campoFormSheet} text-base`}
                  />
                </label>
              </div>
            </CardModo>

            <CardModo
              valor="AGENDAR"
              modo={modo}
              setModo={setModo}
              titulo="Agendar"
              descricao="Compra fica pendente com data prevista visível na lista."
            >
              <label className="block text-xs font-medium text-[#1f2937]">
                Data prevista *
                <input
                  type="date"
                  value={dataPrevista}
                  onChange={(e) => setDataPrevista(e.target.value)}
                  className={`${campoFormSheet} text-base`}
                />
              </label>
            </CardModo>

            <CardModo
              valor="SÓ"
              modo={modo}
              setModo={setModo}
              titulo="Só registrar"
              descricao="Pendente puro — você recebe depois pela lista."
            />
          </div>
        </section>

        <p className="text-center text-[11px] text-[#627271]">
          {modo === "AGORA"
            ? "Salvar = recebe: estoque + custo médio + conta a pagar de " + formatCurrency(total)
            : "Registrar não mexe no estoque — use Receber quando a mercadoria chegar."}
        </p>
      </div>
    </BottomSheet>

      {/* ── U2.2 — mini-sheet "Cadastrar item na hora" (por cima da compra) ── */}
      {miniItemAberto && (
        <MiniSheetNovoItem
          termo={termoInsumo}
          salvando={criandoProduto}
          criarProduto={criarProduto}
          onFechar={() => setMiniItemAberto(false)}
          onCriado={aoCriarInsumo}
        />
      )}

      {/* ── U2.3 — mini-sheet "Cadastrar fornecedor na hora" ── */}
      {miniFornecedorAberto && (
        <MiniSheetNovoFornecedor
          termo={buscaFornecedor}
          criando={criandoFornecedor}
          criarFornecedor={criarFornecedor}
          onFechar={() => setMiniFornecedorAberto(false)}
          onCriado={aoCriarFornecedor}
        />
      )}
    </>
  );
}

/* ─────────────── Mini-sheets U2 — cadastrar na hora no mercado ───────────── */

/** Título do mini-sheet com termo prévio cortado — 40 chars no mobile já basta. */
function tituloMiniSheet(prefixo: string, termo: string): string {
  const t = termo.trim().slice(0, 40);
  return t ? `${prefixo} “${t}”` : `${prefixo} novo`;
}

/**
 * U2.2 — "Cadastrar item na hora": form mínimo de insumo no MESMO padrão
 * sticky do designer (header + footer no BottomSheet). O que é preenchido
 * aqui é o MÍNIMO do cadastro — os demais campos ficam default do banco e
 * o restante do cadastro pode ser completado depois em Estoque.
 */
function MiniSheetNovoItem({
  termo,
  salvando,
  criarProduto,
  onFechar,
  onCriado,
}: {
  termo: string;
  salvando: boolean;
  criarProduto: (p: CriarProdutoParams) => Promise<CriarProdutoResult>;
  onFechar: () => void;
  onCriado: (dados: { id: number; nome: string; sku: string; unidade: string; unidadeCompra: string; fator: number | null }) => void;
}) {
  const [nome, setNome] = useState(termo.trim());
  const [sku, setSku] = useState("");
  const [unidade, setUnidade] = useState("Unidade");
  const [unidadeCompra, setUnidadeCompra] = useState("");
  const [fator, setFator] = useState("");
  const [erro, setErro] = useState("");

  const salvar = async () => {
    if (salvando) return;
    setErro("");
    if (!nome.trim()) {
      setErro("Informe o nome do item.");
      return;
    }
    const uc = unidadeCompra.trim();
    const nFator = fator.trim() === "" ? null : Number(fator);
    // F2/H3: unidade de compra preenchida exige fator > 0 — mesma validação
    // do cadastro completo, client-side antes de gravar.
    const erroConv = validarConversaoCompra(uc || null, nFator);
    if (erroConv) {
      setErro(erroConv);
      return;
    }
    const r = await criarProduto({
      nome: nome.trim(),
      sku: sku.trim() || undefined,
      unidade,
      natureza: "insumo",
      // insumo nunca aparece na vitrine (SPEC F1 §6.3) — o hook força off,
      // mas a UI declara a intenção junto
      exibirVitrine: false,
      estoque: 0,
      estoqueMinimo: 5,
      precoVenda: 0,
      precoCusto: 0,
      unidadeCompra: uc || null,
      // sem unidade de compra o fator é ignorado — não faz sentido avulso
      fatorConversao: uc ? nFator : null,
    });
    if (!r.success || !r.id) {
      // erro inline: o digitado permanece no form (nada se perde)
      setErro(r.error || "Não foi possível cadastrar o item.");
      return;
    }
    onCriado({
      id: r.id,
      nome: nome.trim(),
      sku: sku.trim(),
      unidade,
      unidadeCompra: uc,
      fator: uc ? nFator : null,
    });
  };

  return (
    <BottomSheet
      open
      onClose={salvando ? () => undefined : onFechar}
      labelledBy="mini-item-titulo"
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="mini-item-titulo" className="text-base font-semibold text-[#1f2937] sm:text-lg">
              {tituloMiniSheet("Cadastrar item", termo)}
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              Só o necessário para registrar a compra. Complete o cadastro depois em Estoque.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
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
            <button type="button" onClick={onFechar} disabled={salvando} className={sheetButtonSecundario}>
              Voltar para a compra
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className={sheetButtonPrimario}
              style={{ background: "#86cb92" }}
            >
              {salvando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Cadastrar e adicionar
                </>
              )}
            </button>
          </SheetFooterActions>
        </div>
      }
    >
      <div className="space-y-3.5">
        <label className="block text-sm font-medium text-[#1f2937]">
          Nome *
          <input
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErro("");
            }}
            placeholder="Ex.: Embalagem kraft 20x30"
            autoComplete="off"
            autoFocus
            data-sheet-foco
            className={`${campoFormSheet} text-base`}
          />
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          SKU (opcional)
          <input
            type="text"
            value={sku}
            onChange={(e) => {
              setSku(e.target.value);
              setErro("");
            }}
            placeholder="Ex.: EMK-2030"
            autoComplete="off"
            className={`${campoFormSheet} text-base`}
          />
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          Unidade de estoque *
          <select
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            className={`${campoFormSheet} text-base`}
          >
            {UNIDADES_ESTOQUE.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          Unidade de compra (opcional)
          <input
            type="text"
            value={unidadeCompra}
            onChange={(e) => {
              setUnidadeCompra(e.target.value);
              setErro("");
            }}
            list="compras-mini-unidade-compra"
            placeholder="Ex.: pacote, caixa, kg"
            autoComplete="off"
            className={`${campoFormSheet} text-base`}
          />
          <datalist id="compras-mini-unidade-compra">
            {UNIDADES_COMPRA.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          Fator de conversão (unidades de estoque por {unidadeCompra.trim() || "unidade de compra"})
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={fator}
            onChange={(e) => {
              setFator(e.target.value);
              setErro("");
            }}
            placeholder="Ex.: 50"
            className={`${campoFormSheet} text-base`}
          />
          <span className="mt-1 block text-[11px] text-[#627271]">
            Obrigatório quando preencher a unidade de compra — ex.: 1 pacote = 50 unidades.
          </span>
        </label>
      </div>
    </BottomSheet>
  );
}

/**
 * U2.3 — "Cadastrar fornecedor na hora": nome + telefone + observação. O
 * hook faz find-or-create por nome (idempotente); cadastro completo fica
 * para Fornecedores depois — hint avisa.
 */
function MiniSheetNovoFornecedor({
  termo,
  criando,
  criarFornecedor,
  onFechar,
  onCriado,
}: {
  termo: string;
  criando: boolean;
  criarFornecedor: (dados: CriarFornecedorDados) => Promise<CriarFornecedorResult>;
  onFechar: () => void;
  onCriado: (novo: FornecedorSimples) => void;
}) {
  const [nome, setNome] = useState(termo.trim());
  const [telefone, setTelefone] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");

  const salvar = async () => {
    if (criando) return;
    setErro("");
    if (!nome.trim()) {
      setErro("Informe o nome do fornecedor.");
      return;
    }
    const r = await criarFornecedor({
      nome: nome.trim(),
      telefone: telefone.trim() || undefined,
      observacao: observacao.trim() || undefined,
    });
    if (!r.success || !r.id) {
      // erro inline: o digitado permanece no form (nada se perde)
      setErro(r.error || "Não foi possível cadastrar o fornecedor.");
      return;
    }
    onCriado({ id: r.id, nome: nome.trim() });
  };

  return (
    <BottomSheet
      open
      onClose={criando ? () => undefined : onFechar}
      labelledBy="mini-fornecedor-titulo"
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="mini-fornecedor-titulo" className="text-base font-semibold text-[#1f2937] sm:text-lg">
              {tituloMiniSheet("Cadastrar fornecedor", termo)}
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              Só o necessário para vincular esta compra. Complete o cadastro depois em Fornecedores.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            disabled={criando}
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
            <button type="button" onClick={onFechar} disabled={criando} className={sheetButtonSecundario}>
              Voltar para a compra
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={criando}
              className={sheetButtonPrimario}
              style={{ background: "#86cb92" }}
            >
              {criando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Cadastrar fornecedor
                </>
              )}
            </button>
          </SheetFooterActions>
        </div>
      }
    >
      <div className="space-y-3.5">
        <label className="block text-sm font-medium text-[#1f2937]">
          Nome *
          <input
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErro("");
            }}
            placeholder="Ex.: Distribuidora Sul Papelaria"
            autoComplete="off"
            autoFocus
            data-sheet-foco
            className={`${campoFormSheet} text-base`}
          />
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          Telefone (opcional)
          <input
            type="tel"
            inputMode="tel"
            value={telefone}
            onChange={(e) => {
              setTelefone(e.target.value);
              setErro("");
            }}
            placeholder="(11) 90000-0000"
            autoComplete="off"
            className={`${campoFormSheet} text-base`}
          />
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          Observação (opcional)
          <textarea
            value={observacao}
            onChange={(e) => {
              setObservacao(e.target.value);
              setErro("");
            }}
            rows={2}
            placeholder="Ex.: atende no balcão, entrega em 2 dias"
            className={`${campoFormSheet} min-h-[44px] text-base`}
          />
        </label>
      </div>
    </BottomSheet>
  );
}
/** Card selecionável do "Quando recebe?" — o card inteiro é alvo de toque
 *  (label envolve o rádio), o marcado ganha borda verde menta + fundo cinza,
 *  e os campos dependentes entram logo abaixo, dentro do próprio card. */
function CardModo({
  valor,
  modo,
  setModo,
  titulo,
  descricao,
  children,
}: {
  valor: ModoRecebimento;
  modo: ModoRecebimento;
  setModo: (m: ModoRecebimento) => void;
  titulo: string;
  descricao: string;
  children?: ReactNode;
}) {
  const marcada = modo === valor;
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        marcada ? "border-[#86cb92] bg-[#efefef]" : "border-[#efefef] bg-white"
      }`}
    >
      <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
        <input
          type="radio"
          name="modo-recebimento"
          checked={marcada}
          onChange={() => setModo(valor)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#86cb92]"
        />
        <span className="min-w-0">
          <span className="block text-sm text-[#1f2937]" style={{ fontWeight: marcada ? 600 : 500 }}>
            {titulo}
          </span>
          <span className="mt-0.5 block text-[11px] text-[#627271]">{descricao}</span>
        </span>
      </label>
      {marcada && children != null && <div className="mt-3 pl-7">{children}</div>}
    </div>
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
