import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  MessageCircle,
  Edit2,
  Trash2,
  Download,
  Upload,
  ChevronDown,
  X,
  Phone,
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { CLIENTES, TAG_COLORS, formatCurrency, type Cliente } from "./crmMockData";
import { useClientes } from "../../hooks/use-clientes";
import { ClienteOrigemBadge } from "./ClienteOrigemBadge";

type ViewMode = "cards" | "table";

const TIPO_OPTIONS = ["Todos", "PF", "PJ"];
const STATUS_OPTIONS = ["Todos", "Ativo", "Inativo"];
const ORIGEM_OPTIONS = ["Todas", "WhatsApp", "Manual"] as const;
const TAG_OPTIONS = ["VIP", "Prospect", "Inadimplente", "Cliente Fiel", "Lead Quente", "Inativo"];

function TagChip({ tag, small = false }: { tag: string; small?: boolean }) {
  const colors = TAG_COLORS[tag] || { bg: "#efefef", text: "#627271", border: "#efefef" };
  return (
    <span
      className={`inline-flex items-center rounded-full border ${small ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"}`}
      style={{ background: colors.bg, color: colors.text, borderColor: colors.border, fontWeight: 600 }}
    >
      {tag}
    </span>
  );
}

function AvatarInitials({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center text-white shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.33, fontWeight: 700 }}
    >
      {initials}
    </div>
  );
}

function ClienteCard({ cliente, onClick }: { cliente: Cliente; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm transition-all cursor-pointer ${
        cliente.status === "inativo" ? "opacity-60" : ""
      } ${hovered ? "shadow-md border-[#efefef]" : "border-[#efefef]"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <AvatarInitials initials={cliente.initials} color={cliente.avatarColor} size={44} />
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
              style={{ background: cliente.status === "ativo" ? "#86cb92" : "#627271" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[#1f2937] text-sm leading-tight truncate" style={{ fontWeight: 700 }}>
                  {cliente.nome}
                </p>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-md"
                  style={{
                    background: cliente.tipo === "PF" ? "#EFF6FF" : "#efefef",
                    color: cliente.tipo === "PF" ? "#1D4ED8" : "#1f2937",
                    fontWeight: 600,
                  }}
                >
                  {cliente.tipo}
                </span>
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: hovered ? 1 : 0 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/55${cliente.whatsapp.replace(/\D/g, "")}`); }}
                  className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef] transition-colors"
                >
                  <MessageCircle size={13} />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef] transition-colors"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <ClienteOrigemBadge origem={cliente.origem} small />
              {cliente.tags.map((tag) => (
                <TagChip key={tag} tag={tag} small />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#efefef] grid grid-cols-2 gap-2">
          <div>
            <p className="text-[#627271] text-[10px]">Telefone</p>
            <p className="text-[#1f2937] text-xs truncate" style={{ fontWeight: 500 }}>{cliente.telefone}</p>
          </div>
          <div>
            <p className="text-[#627271] text-[10px]">Última interação</p>
            <p className="text-[#1f2937] text-xs" style={{ fontWeight: 500 }}>{cliente.ultimaInteracao}</p>
          </div>
          <div>
            <p className="text-[#627271] text-[10px]">Cidade</p>
            <p className="text-[#1f2937] text-xs truncate" style={{ fontWeight: 500 }}>{cliente.cidade}</p>
          </div>
          <div>
            <p className="text-[#627271] text-[10px]">Total em compras</p>
            <p className="text-xs" style={{ fontWeight: 700, color: cliente.totalCompras > 0 ? "#1f2937" : "#627271" }}>
              {cliente.totalCompras > 0 ? formatCurrency(cliente.totalCompras) : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NovoClienteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [tipo, setTipo] = useState<"PF" | "PJ">("PF");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", tags: [] as string[] });

  const formatPhone = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>Novo Cliente</h3>
            <p className="text-[#627271] text-xs">Preencha as informações básicas</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#efefef] transition-colors">
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-[#1f2937] text-xs mb-2" style={{ fontWeight: 500 }}>Tipo de cliente</label>
            <div className="flex gap-2">
              {["PF", "PJ"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t as "PF" | "PJ")}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                  style={{
                    background: tipo === t ? "#efefef" : "#efefef",
                    color: tipo === t ? "#1f2937" : "#627271",
                    border: tipo === t ? "2px solid #86cb92" : "2px solid transparent",
                    fontWeight: 600,
                  }}
                >
                  {t === "PF" ? "👤 Pessoa Física" : "🏢 Pessoa Jurídica"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
              {tipo === "PF" ? "Nome completo" : "Razão Social"} *
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder={tipo === "PF" ? "Ex: Maria Silva" : "Ex: Loja do João LTDA"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Telefone / WhatsApp *</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: formatPhone(e.target.value) }))}
                placeholder="(11) 99999-9999"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
                required
              />
            </div>
            <div>
              <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="cliente@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Tags / Etiquetas</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => {
                const selected = form.tags.includes(tag);
                const colors = TAG_COLORS[tag] || {};
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tags: selected ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
                      }))
                    }
                    className="px-2.5 py-1 rounded-full border text-[11px] transition-all"
                    style={{
                      background: selected ? colors.bg : "transparent",
                      color: selected ? colors.text : "#627271",
                      borderColor: selected ? colors.border : "#efefef",
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm hover:bg-[#efefef] transition-colors" style={{ fontWeight: 500 }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-[#1f2937] text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Salvando...</> : "Salvar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClientesPage() {
  const navigate = useNavigate();
  const { clientes, loading, error, isFallback, recarregar } = useClientes();
  const [busca, setBusca] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [origemFiltro, setOrigemFiltro] = useState<(typeof ORIGEM_OPTIONS)[number]>("Todas");
  const [tagFiltro, setTagFiltro] = useState<string[]>([]);
  const [showFiltros, setShowFiltros] = useState(false);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filteredClientes = clientes.filter((c) => {
    const matchBusca =
      !busca ||
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.telefone.includes(busca) ||
      c.email.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = tipoFiltro === "Todos" || c.tipo === tipoFiltro;
    const matchStatus = statusFiltro === "Todos" || (statusFiltro === "Ativo" ? c.status === "ativo" : c.status === "inativo");
    const matchOrigem = origemFiltro === "Todas" || (origemFiltro === "WhatsApp" ? c.origem === "whatsapp" : c.origem === "manual");
    const matchTags = tagFiltro.length === 0 || tagFiltro.every((t) => c.tags.includes(t));
    return matchBusca && matchTipo && matchStatus && matchOrigem && matchTags;
  });

  const activeFilters = [
    tipoFiltro !== "Todos" && tipoFiltro,
    statusFiltro !== "Todos" && statusFiltro,
    origemFiltro !== "Todas" && origemFiltro,
    ...tagFiltro,
  ].filter(Boolean) as string[];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#86cb92] text-[#1f2937] px-4 py-3 rounded-xl shadow-lg text-sm">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      {/* Modal */}
      {showNovoCliente && (
        <NovoClienteModal
          onClose={() => setShowNovoCliente(false)}
          onSuccess={() => {
            setShowNovoCliente(false);
            showToast("Cliente cadastrado com sucesso!");
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Clientes</h1>
          <p className="text-[#627271] text-sm">
            {loading ? "Carregando..." : `${filteredClientes.length} de ${clientes.length} clientes`}
            {isFallback && !loading && <span className="ml-2 text-xs text-amber-600">(dados de demonstração)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors" style={{ fontWeight: 500 }}>
            <Upload size={13} />
            Importar
          </button>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors" style={{ fontWeight: 500 }}>
            <Download size={13} />
            Exportar
          </button>
          <button
            onClick={() => setShowNovoCliente(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Novo Cliente</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Search + Filters bar */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4 mb-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, telefone, e-mail..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-[#efefef]"
            />
          </div>
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm transition-all"
            style={{
              background: showFiltros || activeFilters.length > 0 ? "#efefef" : "white",
              borderColor: showFiltros || activeFilters.length > 0 ? "#86cb92" : "#efefef",
              color: showFiltros || activeFilters.length > 0 ? "#1f2937" : "#627271",
              fontWeight: 500,
            }}
          >
            <Filter size={14} />
            Filtros
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-[#1f2937]" style={{ background: "#86cb92" }}>
                {activeFilters.length}
              </span>
            )}
          </button>
          <div className="flex border border-[#efefef] rounded-xl overflow-hidden bg-[#efefef]">
            <button
              onClick={() => setViewMode("cards")}
              className="px-3 py-2.5 transition-all"
              style={{ background: viewMode === "cards" ? "white" : "transparent", color: viewMode === "cards" ? "#1f2937" : "#627271" }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className="px-3 py-2.5 transition-all"
              style={{ background: viewMode === "table" ? "white" : "transparent", color: viewMode === "table" ? "#1f2937" : "#627271" }}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Filters expanded */}
        {showFiltros && (
          <div className="mt-4 pt-4 border-t border-[#efefef] flex flex-wrap gap-4">
            <div>
              <label className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>Tipo</label>
              <div className="flex gap-1.5">
                {TIPO_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipoFiltro(t)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: tipoFiltro === t ? "#efefef" : "#efefef",
                      color: tipoFiltro === t ? "#1f2937" : "#627271",
                      border: tipoFiltro === t ? "1px solid #86cb92" : "1px solid transparent",
                      fontWeight: tipoFiltro === t ? 600 : 400,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>Status</label>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFiltro(s)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: statusFiltro === s ? "#efefef" : "#efefef",
                      color: statusFiltro === s ? "#1f2937" : "#627271",
                      border: statusFiltro === s ? "1px solid #86cb92" : "1px solid transparent",
                      fontWeight: statusFiltro === s ? 600 : 400,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>Origem</label>
              <div className="flex gap-1.5">
                {ORIGEM_OPTIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrigemFiltro(o)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: origemFiltro === o ? "#efefef" : "#efefef",
                      color: origemFiltro === o ? "#1f2937" : "#627271",
                      border: origemFiltro === o ? "1px solid #86cb92" : "1px solid transparent",
                      fontWeight: origemFiltro === o ? 600 : 400,
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {TAG_OPTIONS.map((tag) => {
                  const selected = tagFiltro.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() =>
                        setTagFiltro((prev) =>
                          selected ? prev.filter((t) => t !== tag) : [...prev, tag]
                        )
                      }
                    >
                      <TagChip tag={selected ? tag : "Inativo"} small />
                    </button>
                  );
                })}
              </div>
            </div>
            {activeFilters.length > 0 && (
              <button
                onClick={() => { setTipoFiltro("Todos"); setStatusFiltro("Todos"); setOrigemFiltro("Todas"); setTagFiltro([]); }}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 mt-auto"
                style={{ fontWeight: 500 }}
              >
                <X size={12} />
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Active filters chips */}
        {activeFilters.length > 0 && !showFiltros && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span key={f} className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#efefef] text-[#1f2937] text-xs" style={{ fontWeight: 500 }}>
                {f}
                <button onClick={() => {
                  if (tipoFiltro === f) setTipoFiltro("Todos");
                  else if (statusFiltro === f) setStatusFiltro("Todos");
                  else setTagFiltro((prev) => prev.filter((t) => t !== f));
                }}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4 animate-pulse">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#efefef]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#efefef] rounded w-3/4" />
                  <div className="h-3 bg-[#efefef] rounded w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#efefef]">
                <div className="h-3 bg-[#efefef] rounded" />
                <div className="h-3 bg-[#efefef] rounded" />
                <div className="h-3 bg-[#efefef] rounded" />
                <div className="h-3 bg-[#efefef] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error && !isFallback ? (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>Erro ao carregar clientes</h3>
          <p className="text-[#627271] text-sm mb-5">{error}</p>
          <button
            onClick={recarregar}
            className="px-5 py-2.5 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
          >
            Tentar novamente
          </button>
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#efefef] flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-[#627271]" />
          </div>
          <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>
            {busca || activeFilters.length > 0 ? "Nenhum resultado encontrado" : "Nenhum cliente cadastrado"}
          </h3>
          <p className="text-[#627271] text-sm mb-5">
            {busca || activeFilters.length > 0
              ? "Tente ajustar seus filtros ou termos de busca"
              : "Comece adicionando seu primeiro cliente ao CRM"}
          </p>
          {busca || activeFilters.length > 0 ? (
            <button
              onClick={() => { setBusca(""); setTipoFiltro("Todos"); setStatusFiltro("Todos"); setOrigemFiltro("Todas"); setTagFiltro([]); }}
              className="px-5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
              style={{ fontWeight: 500 }}
            >
              Limpar filtros
            </button>
          ) : (
            <button
              onClick={() => setShowNovoCliente(true)}
              className="px-5 py-2.5 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
            >
              Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClientes.map((c) => (
            <ClienteCard key={c.id} cliente={c} onClick={() => navigate(`/crm/clientes/${c.id}`)} />
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#efefef] bg-[#efefef]">
                  {["Cliente", "Tipo", "Telefone", "Tags", "Última interação", "Total compras", "Status", "Ações"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[#627271] text-xs whitespace-nowrap" style={{ fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((c, i) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#efefef] hover:bg-[#efefef]/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/crm/clientes/${c.id}`)}
                    style={{ opacity: c.status === "inativo" ? 0.6 : 1 }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarInitials initials={c.initials} color={c.avatarColor} size={32} />
                        <div>
                          <p className="text-[#1f2937] text-sm whitespace-nowrap" style={{ fontWeight: 600 }}>{c.nome}</p>
                          <p className="text-[#627271] text-xs">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] px-2 py-1 rounded-md"
                        style={{
                          background: c.tipo === "PF" ? "#EFF6FF" : "#efefef",
                          color: c.tipo === "PF" ? "#1D4ED8" : "#1f2937",
                          fontWeight: 600,
                        }}
                      >
                        {c.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#1f2937] text-xs whitespace-nowrap">{c.telefone}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap max-w-[160px]">
                        <ClienteOrigemBadge origem={c.origem} small />
                        {c.tags.slice(0, 2).map((t) => <TagChip key={t} tag={t} small />)}
                        {c.tags.length > 2 && <span className="text-[10px] text-[#627271]">+{c.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#1f2937] text-xs whitespace-nowrap">{c.ultimaInteracao}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ fontWeight: 700, color: c.totalCompras > 0 ? "#1f2937" : "#627271" }}>
                        {c.totalCompras > 0 ? formatCurrency(c.totalCompras) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${c.status === "ativo" ? "bg-[#86cb92]" : "bg-[#627271]"}`} />
                        <span className="text-xs capitalize text-[#1f2937]">{c.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef]">
                          <MessageCircle size={13} />
                        </button>
                        <button className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef]">
                          <Edit2 size={13} />
                        </button>
                        <button className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
