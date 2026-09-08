import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  MoreHorizontal,
  Eye,
  X,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  BarChart2,
  CheckSquare,
  Square,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  PEDIDOS,
  STATUS_CONFIG,
  CANAL_CONFIG,
  PAGAMENTO_LABELS,
  formatCurrency,
  formatDateTime,
  type StatusPedido,
  type CanalVenda,
  type FormaPagamento,
  type Pedido,
} from "./pedidosMockData";

const ITEMS_PER_PAGE = 10;

const PERIODO_OPTIONS = [
  { value: "hoje", label: "Hoje" },
  { value: "ontem", label: "Ontem" },
  { value: "7dias", label: "Últimos 7 dias" },
  { value: "30dias", label: "Últimos 30 dias" },
  { value: "todos", label: "Todos" },
];

const STATUS_OPTIONS: { value: StatusPedido | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  { value: "aguardando", label: "Aguardando" },
  { value: "pago", label: "Pago" },
  { value: "separacao", label: "Em Separação" },
  { value: "enviado", label: "Enviado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

const CANAL_OPTIONS: { value: CanalVenda | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os canais" },
  { value: "pdv", label: "PDV" },
  { value: "loja", label: "Loja Virtual" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "outros", label: "Outros" },
];

function filterByPeriod(pedidos: Pedido[], periodo: string): Pedido[] {
  const now = new Date("2026-04-02T23:59:59");
  return pedidos.filter((p) => {
    const d = new Date(p.dataHora);
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (periodo === "hoje") return diffDays < 1;
    if (periodo === "ontem") return diffDays >= 1 && diffDays < 2;
    if (periodo === "7dias") return diffDays <= 7;
    if (periodo === "30dias") return diffDays <= 30;
    return true;
  });
}

function StatusBadge({ status }: { status: StatusPedido }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border"
      style={{
        color: cfg.color,
        background: cfg.bg,
        borderColor: cfg.borderColor,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function CanalBadge({ canal }: { canal: CanalVenda }) {
  const cfg = CANAL_CONFIG[canal];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px]"
      style={{ color: cfg.color, background: cfg.bg, fontWeight: 600 }}
    >
      {cfg.label}
    </span>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  title: string;
  value: string;
  subtitle: string;
  trend: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}) {
  const isPos = trend >= 0;
  return (
    <div className="bg-white rounded-2xl border border-[#efefef] p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#627271]">{title}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      </div>
      <div>
        <p className="text-[#1f2937]" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </p>
        <p className="text-xs text-[#627271] mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1">
        {isPos ? (
          <TrendingUp size={13} className="text-[#627271]" />
        ) : (
          <TrendingDown size={13} className="text-red-400" />
        )}
        <span
          className="text-xs"
          style={{ color: isPos ? "#1f2937" : "#EF4444", fontWeight: 600 }}
        >
          {isPos ? "+" : ""}
          {trend}% vs período anterior
        </span>
      </div>
    </div>
  );
}

export function PedidosListaPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("30dias");
  const [statusFilter, setStatusFilter] = useState<StatusPedido | "todos">("todos");
  const [canalFilter, setCanalFilter] = useState<CanalVenda | "todos">("todos");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ id: string; numero: string } | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState("");
  const [statusUpdateModal, setStatusUpdateModal] = useState<Pedido | null>(null);

  // Filter logic
  const filtered = useMemo(() => {
    let list = filterByPeriod(PEDIDOS, periodo);
    if (statusFilter !== "todos") list = list.filter((p) => p.status === statusFilter);
    if (canalFilter !== "todos") list = list.filter((p) => p.canal === canalFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.numero.toLowerCase().includes(q) ||
          p.cliente.nome.toLowerCase().includes(q) ||
          p.cliente.telefone.includes(q)
      );
    }
    return list;
  }, [search, periodo, statusFilter, canalFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // KPIs
  const totalValor = (filtered || []).reduce((s, p) => s + (p.status !== "cancelado" ? p.total : 0), 0);
  const qtdPedidos = filtered.filter((p) => p.status !== "cancelado").length;
  const ticketMedio = qtdPedidos > 0 ? totalValor / qtdPedidos : 0;

  // Previous period comparison (fake)
  const prevValor = totalValor * 0.83;
  const trendValor = Math.round(((totalValor - prevValor) / prevValor) * 100);
  const prevQtd = Math.round(qtdPedidos * 0.88);
  const trendQtd = Math.round(((qtdPedidos - prevQtd) / prevQtd) * 100);

  const allSelected =
    paginated.length > 0 && paginated.every((p) => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      paginated.forEach((p) => next.delete(p.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      paginated.forEach((p) => next.add(p.id));
      setSelectedIds(next);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExport = () => {
    toast.success("Lista exportada com sucesso!");
  };

  const handleCancelConfirm = () => {
    if (!cancelMotivo.trim() || cancelMotivo.trim().length < 10) {
      toast.error("Informe o motivo com pelo menos 10 caracteres.");
      return;
    }
    toast.success(`Pedido ${cancelModal?.numero} cancelado.`);
    setCancelModal(null);
    setCancelMotivo("");
  };

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: 20 }}>
            Pedidos
          </h1>
          <p className="text-sm text-[#627271] mt-0.5">
            {filtered.length} pedido{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-[#efefef] text-[#1f2937] hover:bg-[#efefef] transition-colors"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* MEL tip */}
      <div
        className="flex items-start gap-3 p-3.5 rounded-2xl border"
        style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
      >
        <Sparkles size={16} style={{ color: "#7C3AED", flexShrink: 0, marginTop: 2 }} />
        <p className="text-xs" style={{ color: "#6D28D9" }}>
          <strong>MEL diz:</strong> Você tem{" "}
          {PEDIDOS.filter((p) => p.status === "separacao").length} pedidos em separação esperando envio.
          Atualize o status assim que postar! 📦
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Total vendido"
          value={formatCurrency(totalValor)}
          subtitle={`${periodo === "hoje" ? "hoje" : periodo === "7dias" ? "nos últimos 7 dias" : "nos últimos 30 dias"}`}
          trend={trendValor}
          icon={DollarSign}
          iconColor="#86cb92"
          iconBg="#efefef"
        />
        <KpiCard
          title="Pedidos realizados"
          value={String(qtdPedidos)}
          subtitle="excluindo cancelados"
          trend={trendQtd}
          icon={ShoppingBag}
          iconColor="#0284C7"
          iconBg="#F0F9FF"
        />
        <KpiCard
          title="Ticket médio"
          value={formatCurrency(ticketMedio)}
          subtitle="por pedido"
          trend={5}
          icon={BarChart2}
          iconColor="#7C3AED"
          iconBg="#F5F3FF"
        />
        <KpiCard
          title="Taxa de entrega"
          value={`${filtered.length > 0 ? Math.round((filtered.filter((p) => p.status === "entregue").length / filtered.filter((p) => p.status !== "cancelado").length) * 100) || 0 : 0}%`}
          subtitle="pedidos entregues"
          trend={3}
          icon={CheckCircle}
          iconColor="#D97706"
          iconBg="#FFFBEB"
        />
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-[#efefef] p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" />
            <input
              type="text"
              placeholder="Buscar por nº do pedido ou cliente..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#efefef] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86cb92]/30 focus:border-[#86cb92] bg-[#efefef]"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627271] hover:text-[#1f2937]"
                onClick={() => setSearch("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Period select */}
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-[#efefef] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86cb92]/30 bg-[#efefef] text-[#1f2937]"
              value={periodo}
              onChange={(e) => { setPeriodo(e.target.value); setPage(1); }}
            >
              {PERIODO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
          </div>

          {/* Toggle filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-xl border transition-colors ${
              showFilters || statusFilter !== "todos" || canalFilter !== "todos"
                ? "border-[#86cb92] text-[#1f2937] bg-[#efefef]"
                : "border-[#efefef] text-[#1f2937] hover:bg-[#efefef]"
            }`}
          >
            <Filter size={14} />
            <span>Filtros</span>
            {(statusFilter !== "todos" || canalFilter !== "todos") && (
              <span
                className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-[#1f2937]"
                style={{ background: "#86cb92" }}
              >
                {(statusFilter !== "todos" ? 1 : 0) + (canalFilter !== "todos" ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-1 border-t border-[#efefef]">
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#efefef] rounded-xl bg-white text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#86cb92]/30"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as StatusPedido | "todos"); setPage(1); }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
            </div>
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#efefef] rounded-xl bg-white text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#86cb92]/30"
                value={canalFilter}
                onChange={(e) => { setCanalFilter(e.target.value as CanalVenda | "todos"); setPage(1); }}
              >
                {CANAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
            </div>
            {(statusFilter !== "todos" || canalFilter !== "todos") && (
              <button
                className="px-3 py-2 text-xs text-[#627271] hover:text-[#1f2937] hover:bg-[#efefef] rounded-xl transition-colors"
                onClick={() => { setStatusFilter("todos"); setCanalFilter("todos"); setPage(1); }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border"
          style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}
        >
          <span className="text-sm text-blue-700" style={{ fontWeight: 600 }}>
            {selectedIds.size} pedido{selectedIds.size > 1 ? "s" : ""} selecionado{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-xs rounded-xl text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
              onClick={() => { toast.success(`Status atualizado para ${selectedIds.size} pedido(s)!`); setSelectedIds(new Set()); }}
            >
              Atualizar status
            </button>
            <button
              className="px-3 py-1.5 text-xs rounded-xl text-[#627271] hover:bg-white/60 transition-colors"
              onClick={() => setSelectedIds(new Set())}
            >
              Cancelar seleção
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "#efefef" }}
            >
              <ShoppingBag size={24} className="text-[#627271]" />
            </div>
            <p className="text-[#1f2937]" style={{ fontWeight: 600 }}>
              Nenhum pedido encontrado
            </p>
            <p className="text-sm text-[#627271] mt-1 max-w-xs">
              {search ? "Tente buscar por outro termo ou" : "Tente"} ajustar seus filtros ou selecionar outro período
            </p>
            <button
              className="mt-4 px-4 py-2 text-sm rounded-xl text-[#1f2937] transition-colors"
              style={{ background: "#86cb92" }}
              onClick={() => { setSearch(""); setStatusFilter("todos"); setCanalFilter("todos"); setPeriodo("todos"); }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#efefef]">
                    <th className="w-10 px-4 py-3">
                      <button onClick={toggleSelectAll}>
                        {allSelected ? (
                          <CheckSquare size={16} style={{ color: "#1f2937" }} />
                        ) : (
                          <Square size={16} className="text-[#627271]" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-[#627271] whitespace-nowrap" style={{ fontWeight: 600 }}>
                      Pedido
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-[#627271] whitespace-nowrap hidden md:table-cell" style={{ fontWeight: 600 }}>
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-[#627271] hidden lg:table-cell" style={{ fontWeight: 600 }}>
                      Canal
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-[#627271] whitespace-nowrap" style={{ fontWeight: 600 }}>
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-[#627271] hidden sm:table-cell" style={{ fontWeight: 600 }}>
                      Pagamento
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>
                      Status
                    </th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efefef]">
                  {paginated.map((pedido) => (
                    <tr
                      key={pedido.id}
                      className={`hover:bg-[#efefef]/80 transition-colors group ${
                        selectedIds.has(pedido.id) ? "bg-[#efefef]/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <button onClick={() => toggleSelect(pedido.id)}>
                          {selectedIds.has(pedido.id) ? (
                            <CheckSquare size={16} style={{ color: "#1f2937" }} />
                          ) : (
                            <Square size={16} className="text-[#627271] group-hover:text-[#627271]" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          className="text-[#1f2937] hover:text-[#1f2937] transition-colors"
                          style={{ fontWeight: 700, fontFamily: "monospace" }}
                          onClick={() => navigate(`/vendas/pedidos/${pedido.id}`)}
                        >
                          {pedido.numero}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#627271] hidden md:table-cell whitespace-nowrap">
                        {formatDateTime(pedido.dataHora)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
                            {pedido.cliente.nome}
                          </p>
                          <p className="text-xs text-[#627271] hidden sm:block">
                            {pedido.cliente.telefone}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <CanalBadge canal={pedido.canal} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className="text-[#1f2937] text-sm"
                          style={{
                            fontWeight: 700,
                            color: pedido.status === "cancelado" ? "#627271" : "#1f2937",
                            textDecoration: pedido.status === "cancelado" ? "line-through" : "none",
                          }}
                        >
                          {formatCurrency(pedido.total)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-[#627271]">
                          {PAGAMENTO_LABELS[pedido.formaPagamento]}
                        </span>
                        {pedido.statusPagamento === "pendente" && (
                          <AlertCircle size={12} className="inline ml-1 text-amber-500" />
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={pedido.status} />
                      </td>
                      <td className="px-4 py-3.5 relative">
                        <button
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#627271] hover:bg-[#efefef] hover:text-[#1f2937] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionsMenu(showActionsMenu === pedido.id ? null : pedido.id);
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {showActionsMenu === pedido.id && (
                          <div
                            className="absolute right-2 top-12 z-50 bg-white rounded-2xl border border-[#efefef] shadow-xl py-1.5 min-w-[180px]"
                            onMouseLeave={() => setShowActionsMenu(null)}
                          >
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors"
                              onClick={() => { navigate(`/vendas/pedidos/${pedido.id}`); setShowActionsMenu(null); }}
                            >
                              <Eye size={14} />
                              Ver detalhes
                            </button>
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors"
                              onClick={() => { setStatusUpdateModal(pedido); setShowActionsMenu(null); }}
                            >
                              <RefreshCw size={14} />
                              Atualizar status
                            </button>
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors"
                              onClick={() => {
                                window.open(`https://wa.me/${pedido.cliente.telefone.replace(/\D/g, "")}`, "_blank");
                                setShowActionsMenu(null);
                              }}
                            >
                              <ArrowUpRight size={14} />
                              Abrir WhatsApp
                            </button>
                            {pedido.status !== "cancelado" && pedido.status !== "entregue" && (
                              <>
                                <div className="my-1 h-px bg-[#efefef] mx-3" />
                                <button
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  onClick={() => { setCancelModal({ id: pedido.id, numero: pedido.numero }); setShowActionsMenu(null); }}
                                >
                                  <X size={14} />
                                  Cancelar pedido
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#efefef]">
                <p className="text-xs text-[#627271]">
                  Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#627271] hover:bg-[#efefef] disabled:opacity-30 transition-colors"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      className="w-8 h-8 rounded-xl text-xs transition-colors"
                      style={{
                        background: n === page ? "#86cb92" : "transparent",
                        color: n === page ? "#1f2937" : "#627271",
                        fontWeight: n === page ? 700 : 400,
                      }}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#627271] hover:bg-[#efefef] disabled:opacity-30 transition-colors"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <X size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>
                  Cancelar pedido {cancelModal.numero}?
                </p>
                <p className="text-xs text-[#627271]">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-[#1f2937] mb-1.5 block" style={{ fontWeight: 600 }}>
                Motivo do cancelamento *
              </label>
              <textarea
                className="w-full border border-[#efefef] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
                rows={3}
                placeholder="Informe o motivo (mínimo 10 caracteres)"
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
              />
              <p className="text-[11px] text-[#627271] mt-1">{cancelMotivo.length}/10 caracteres mínimos</p>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#efefef] text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors"
                onClick={() => { setCancelModal(null); setCancelMotivo(""); }}
              >
                Voltar
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white transition-colors"
                style={{ background: "#DC2626" }}
                onClick={handleCancelConfirm}
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status update modal */}
      {statusUpdateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            <p className="text-[#1f2937] mb-1" style={{ fontWeight: 700 }}>
              Atualizar status
            </p>
            <p className="text-xs text-[#627271] mb-4">
              Pedido {statusUpdateModal.numero} — status atual:{" "}
              <strong>{STATUS_CONFIG[statusUpdateModal.status].label}</strong>
            </p>
            <div className="space-y-2 mb-5">
              {(["aguardando", "pago", "separacao", "enviado", "entregue"] as StatusPedido[]).map(
                (s) => {
                  const cfg = STATUS_CONFIG[s];
                  const isCurrent = s === statusUpdateModal.status;
                  return (
                    <button
                      key={s}
                      disabled={isCurrent}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all disabled:opacity-40"
                      style={{
                        borderColor: isCurrent ? cfg.borderColor : "#efefef",
                        background: isCurrent ? cfg.bg : "white",
                      }}
                      onClick={() => {
                        toast.success(`Status atualizado para "${cfg.label}"!`);
                        setStatusUpdateModal(null);
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                      <span className="text-sm" style={{ fontWeight: isCurrent ? 700 : 500, color: isCurrent ? cfg.color : "#1f2937" }}>
                        {cfg.label}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto text-[10px] rounded-full px-2 py-0.5" style={{ background: cfg.borderColor, color: cfg.color, fontWeight: 600 }}>
                          Atual
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
            <button
              className="w-full px-4 py-2.5 rounded-xl border border-[#efefef] text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors"
              onClick={() => setStatusUpdateModal(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
