import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Edit2,
  Plus,
  MapPin,
  User,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Users,
  Briefcase,
  FileText,
  Loader2,
  X,
  Star,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { CLIENTES, INTERACOES, NEGOCIACOES, TAG_COLORS, PIPELINE_ETAPAS, formatCurrency } from "./crmMockData";

function TagChip({ tag }: { tag: string }) {
  const colors = TAG_COLORS[tag] || { bg: "#efefef", text: "#627271", border: "#efefef" };
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs"
      style={{ background: colors.bg, color: colors.text, borderColor: colors.border, fontWeight: 600 }}
    >
      {tag}
    </span>
  );
}

const TIPO_INTERACAO = {
  ligacao: { icon: PhoneCall, label: "Ligação", color: "#0EA5E9", bg: "#F0F9FF" },
  email: { icon: Mail, label: "E-mail", color: "#8B5CF6", bg: "#F5F3FF" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "#86cb92", bg: "#efefef" },
  reuniao: { icon: Users, label: "Reunião", color: "#F59E0B", bg: "#FFFBEB" },
  visita: { icon: MapPin, label: "Visita", color: "#EC4899", bg: "#FDF2F8" },
  nota: { icon: FileText, label: "Nota", color: "#627271", bg: "#efefef" },
};

function NovaInteracaoModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [tipo, setTipo] = useState("ligacao");
  const [form, setForm] = useState({ assunto: "", descricao: "", followup: false, followupData: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
          <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>Registrar Interação</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#efefef]">
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[#1f2937] text-xs mb-2" style={{ fontWeight: 500 }}>Tipo de interação</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TIPO_INTERACAO).map(([key, val]) => {
                const Icon = val.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTipo(key)}
                    className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs transition-all"
                    style={{
                      background: tipo === key ? val.bg : "transparent",
                      borderColor: tipo === key ? val.color : "#efefef",
                      color: tipo === key ? val.color : "#627271",
                      fontWeight: tipo === key ? 600 : 400,
                    }}
                  >
                    <Icon size={16} />
                    {val.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Assunto *</label>
            <input
              type="text"
              value={form.assunto}
              onChange={(e) => setForm((f) => ({ ...f, assunto: e.target.value }))}
              placeholder="Ex: Follow-up sobre proposta"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
              required
            />
          </div>
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Descreva o que foi discutido..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="followup"
              checked={form.followup}
              onChange={(e) => setForm((f) => ({ ...f, followup: e.target.checked }))}
              className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
            />
            <label htmlFor="followup" className="text-[#1f2937] text-sm cursor-pointer" style={{ fontWeight: 400 }}>
              Agendar follow-up
            </label>
          </div>
          {form.followup && (
            <input
              type="date"
              value={form.followupData}
              onChange={(e) => setForm((f) => ({ ...f, followupData: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
            />
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-[#1f2937] text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Salvando...</> : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type TabType = "resumo" | "interacoes" | "negociacoes" | "dados";

export function ClienteDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("resumo");
  const [showNovaInteracao, setShowNovaInteracao] = useState(false);
  const [toast, setToast] = useState("");

  const cliente = CLIENTES.find((c) => c.id === id) || CLIENTES[0];
  const negociacoes = NEGOCIACOES.filter((n) => n.clienteId === id || (id === "1" && n.clienteId === "1"));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const TABS = [
    { id: "resumo", label: "Resumo", icon: User },
    { id: "interacoes", label: "Interações", icon: MessageSquare, badge: INTERACOES.length },
    { id: "negociacoes", label: "Negociações", icon: TrendingUp, badge: negociacoes.length },
    { id: "dados", label: "Dados Completos", icon: FileText },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#86cb92] text-[#1f2937] px-4 py-3 rounded-xl shadow-lg text-sm">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      {/* Modal */}
      {showNovaInteracao && (
        <NovaInteracaoModal
          onClose={() => setShowNovaInteracao(false)}
          onSuccess={() => {
            setShowNovaInteracao(false);
            showToast("Interação registrada com sucesso!");
          }}
        />
      )}

      {/* Header hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: "#1f2937" }}
      >
        {/* Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative z-10 px-4 sm:px-6 py-5">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate("/crm/clientes")}
            className="flex items-center gap-2 text-[#627271] hover:text-white transition-colors mb-5 text-sm"
          >
            <ArrowLeft size={16} />
            Voltar para clientes
          </button>

          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ background: cliente.avatarColor, fontSize: "1.8rem", fontWeight: 800 }}
              >
                {cliente.initials}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1f2937]"
                style={{ background: cliente.status === "ativo" ? "#86cb92" : "#627271" }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-white" style={{ fontSize: "1.3rem", fontWeight: 800 }}>
                  {cliente.nome}
                </h1>
                <span
                  className="px-2.5 py-1 rounded-lg text-xs"
                  style={{
                    background: cliente.tipo === "PF" ? "rgba(59, 130, 246, 0.2)" : "rgba(34, 197, 94, 0.2)",
                    color: cliente.tipo === "PF" ? "#93C5FD" : "#86cb92",
                    fontWeight: 600,
                  }}
                >
                  {cliente.tipo === "PF" ? "👤 Pessoa Física" : "🏢 Pessoa Jurídica"}
                </span>
                {cliente.status === "inativo" && (
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-[#627271]/30 text-[#627271]" style={{ fontWeight: 600 }}>
                    Inativo
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {cliente.tags.map((tag) => {
                  const colors = TAG_COLORS[tag] || {};
                  return (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-xs border"
                      style={{ background: "rgba(255,255,255,0.1)", color: "white", borderColor: "rgba(255,255,255,0.2)", fontWeight: 600 }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-4 text-[#627271] text-sm">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} />
                  {cliente.telefone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={13} />
                  {cliente.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {cliente.cidade}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 sm:flex-col sm:items-end">
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "#25D366", color: "white", fontWeight: 600 }}
              >
                <MessageCircle size={15} />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                onClick={() => setShowNovaInteracao(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600 }}
              >
                <Plus size={15} />
                <span className="hidden sm:inline">Interação</span>
              </button>
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10">
            {[
              { label: "Total em compras", value: formatCurrency(cliente.totalCompras), icon: DollarSign, color: "#1f2937" },
              { label: "Última interação", value: cliente.ultimaInteracao, icon: Clock, color: "#93C5FD" },
              { label: "Desde", value: cliente.dataCadastro, icon: Calendar, color: "#FCD34D" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={12} style={{ color: stat.color }} />
                    <p className="text-[#627271] text-[11px]">{stat.label}</p>
                  </div>
                  <p className="text-white text-sm" style={{ fontWeight: 700 }}>{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="relative z-10 flex overflow-x-auto border-t border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className="flex items-center gap-2 px-5 py-3.5 text-sm whitespace-nowrap transition-all border-b-2"
                style={{
                  color: activeTab === tab.id ? "white" : "#627271",
                  borderBottomColor: activeTab === tab.id ? "#86cb92" : "transparent",
                  background: activeTab === tab.id ? "rgba(255,255,255,0.05)" : "transparent",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                }}
              >
                <Icon size={14} />
                {tab.label}
                {tab.badge && tab.badge > 0 ? (
                  <span
                    className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center"
                    style={{ background: activeTab === tab.id ? "#86cb92" : "rgba(255,255,255,0.1)", color: activeTab === tab.id ? "#1f2937" : "white", fontWeight: 700 }}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-4 sm:p-6">
        {/* RESUMO */}
        {activeTab === "resumo" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Dados principais */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
                <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 600 }}>Dados de Contato</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Telefone Principal", value: cliente.telefone, icon: Phone, action: true },
                    { label: "WhatsApp", value: cliente.whatsapp, icon: MessageCircle, action: true },
                    { label: "E-mail", value: cliente.email, icon: Mail, action: true },
                    { label: "Documento", value: cliente.documento, icon: FileText },
                    { label: "Cidade / UF", value: cliente.cidade, icon: MapPin },
                    { label: "Vendedor Responsável", value: cliente.vendedor, icon: User },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#efefef] flex items-center justify-center shrink-0">
                          <Icon size={14} className="text-[#627271]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#627271] text-[11px]">{item.label}</p>
                          <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 500 }}>{item.value}</p>
                        </div>
                        {item.action && (
                          <ExternalLink size={13} className="text-[#627271] hover:text-[#627271] cursor-pointer mt-1 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Last interaction summary */}
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Última Interação</h3>
                  <button
                    onClick={() => setActiveTab("interacoes")}
                    className="text-xs hover:underline"
                    style={{ color: "#1f2937", fontWeight: 500 }}
                  >
                    Ver todas →
                  </button>
                </div>
                {INTERACOES.slice(0, 1).map((i) => {
                  const tipoInfo = TIPO_INTERACAO[i.tipo];
                  const Icon = tipoInfo.icon;
                  return (
                    <div key={i.id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: tipoInfo.bg }}>
                        <Icon size={16} style={{ color: tipoInfo.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>{i.assunto}</p>
                          <span className="text-[#627271] text-xs">·</span>
                          <span className="text-[#627271] text-xs">{i.data}</span>
                        </div>
                        <p className="text-[#627271] text-sm mt-1 leading-relaxed">{i.descricao}</p>
                        {i.followUpPendente && (
                          <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg w-fit">
                            <Clock size={12} className="text-amber-600" />
                            <span className="text-amber-700 text-xs" style={{ fontWeight: 600 }}>
                              Follow-up: {i.followUpData}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar stats */}
            <div className="space-y-4">
              {/* Financial summary */}
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
                <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 600 }}>Resumo Financeiro</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#627271] text-sm">Total em compras</span>
                    <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{formatCurrency(cliente.totalCompras)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#627271] text-sm">Negociações ativas</span>
                    <span className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>{negociacoes.filter((n) => n.etapa !== "ganho" && n.etapa !== "perdido").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#627271] text-sm">Em pipeline</span>
                    <span className="text-amber-600 text-sm" style={{ fontWeight: 600 }}>
                      {formatCurrency(negociacoes.filter((n) => n.etapa !== "ganho" && n.etapa !== "perdido").reduce((a, n) => a + n.valor, 0))}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#efefef]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Total potencial</span>
                      <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
                        {formatCurrency(cliente.totalCompras + negociacoes.filter((n) => n.etapa !== "ganho" && n.etapa !== "perdido").reduce((a, n) => a + n.valor, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Etiquetas</h3>
                  <button className="text-xs" style={{ color: "#1f2937", fontWeight: 500 }}>+ Adicionar</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cliente.tags.map((tag) => <TagChip key={tag} tag={tag} />)}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4">
                <h3 className="text-[#1f2937] text-sm mb-3" style={{ fontWeight: 600 }}>Ações Rápidas</h3>
                <div className="space-y-2">
                  {[
                    { label: "Ligar agora", icon: Phone, color: "#0EA5E9", bg: "#F0F9FF" },
                    { label: "Enviar WhatsApp", icon: MessageCircle, color: "#86cb92", bg: "#efefef" },
                    { label: "Agendar follow-up", icon: Calendar, color: "#8B5CF6", bg: "#F5F3FF" },
                    { label: "Nova negociação", icon: TrendingUp, color: "#F59E0B", bg: "#FFFBEB" },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#efefef] transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: action.bg }}>
                          <Icon size={14} style={{ color: action.color }} />
                        </div>
                        <span className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INTERAÇÕES */}
        {activeTab === "interacoes" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
                Histórico de Interações ({INTERACOES.length})
              </h3>
              <button
                onClick={() => setShowNovaInteracao(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
              >
                <Plus size={14} />
                Nova Interação
              </button>
            </div>

            {INTERACOES.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
                <MessageSquare size={32} className="text-[#627271] mx-auto mb-3" />
                <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>Nenhuma interação registrada</h3>
                <p className="text-[#627271] text-sm mb-4">Registre suas conversas para manter o histórico atualizado</p>
                <button
                  onClick={() => setShowNovaInteracao(true)}
                  className="px-5 py-2.5 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
                >
                  Adicionar primeira interação
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-[#efefef]" />
                <div className="space-y-4">
                  {INTERACOES.map((interacao, idx) => {
                    const tipoInfo = TIPO_INTERACAO[interacao.tipo];
                    const Icon = tipoInfo.icon;
                    const isToday = idx === 0;
                    const sentimentoColor = interacao.sentimento === "positivo" ? "#86cb92" : interacao.sentimento === "negativo" ? "#EF4444" : "#627271";
                    return (
                      <div key={interacao.id} className="flex gap-4 relative">
                        {/* Icon */}
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center z-10 shrink-0 border-2 border-white shadow-sm"
                          style={{ background: tipoInfo.bg }}
                        >
                          <Icon size={18} style={{ color: tipoInfo.color }} />
                        </div>
                        {/* Card */}
                        <div className="flex-1 bg-white rounded-2xl border border-[#efefef] shadow-sm p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{interacao.assunto}</span>
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                                  style={{ background: tipoInfo.bg, color: tipoInfo.color, fontWeight: 600 }}
                                >
                                  {tipoInfo.label}
                                </span>
                                <div className="w-2 h-2 rounded-full" style={{ background: sentimentoColor }} title={interacao.sentimento} />
                              </div>
                              <p className="text-[#627271] text-xs mt-0.5">
                                {interacao.data} · {interacao.autor}
                              </p>
                            </div>
                          </div>
                          <p className="text-[#1f2937] text-sm leading-relaxed">{interacao.descricao}</p>
                          {interacao.followUpPendente && (
                            <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg w-fit">
                              <Clock size={12} className="text-amber-600" />
                              <span className="text-amber-700 text-xs" style={{ fontWeight: 600 }}>
                                Follow-up agendado: {interacao.followUpData}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* NEGOCIAÇÕES */}
        {activeTab === "negociacoes" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
                Negociações ({negociacoes.length})
              </h3>
              <button
                onClick={() => navigate("/crm/pipeline")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
              >
                <TrendingUp size={14} />
                Ver Pipeline
              </button>
            </div>

            {negociacoes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
                <TrendingUp size={32} className="text-[#627271] mx-auto mb-3" />
                <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>Nenhuma negociação</h3>
                <p className="text-[#627271] text-sm mb-4">Este cliente ainda não tem oportunidades registradas</p>
                <button
                  className="px-5 py-2.5 rounded-xl text-[#1f2937] text-sm"
                  style={{ background: "#86cb92", fontWeight: 600 }}
                >
                  Criar primeira oportunidade
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {negociacoes.map((neg) => {
                  const etapa = PIPELINE_ETAPAS.find((e) => e.id === neg.etapa);
                  return (
                    <div key={neg.id} className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{neg.titulo}</p>
                            <span
                              className="text-[11px] px-2 py-0.5 rounded-full"
                              style={{
                                background: `${etapa?.cor}15`,
                                color: etapa?.cor,
                                fontWeight: 600,
                              }}
                            >
                              {etapa?.label}
                            </span>
                            {neg.atrasado && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600" style={{ fontWeight: 600 }}>
                                ⚠️ Atrasado
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                            <div>
                              <p className="text-[#627271] text-[10px]">Valor estimado</p>
                              <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{formatCurrency(neg.valor)}</p>
                            </div>
                            <div>
                              <p className="text-[#627271] text-[10px]">Probabilidade</p>
                              <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{neg.probabilidade}%</p>
                            </div>
                            <div>
                              <p className="text-[#627271] text-[10px]">Fechamento previsto</p>
                              <p className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>{neg.dataFechamento}</p>
                            </div>
                            <div>
                              <p className="text-[#627271] text-[10px]">Dias na etapa</p>
                              <p className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>{neg.diasNaEtapa} dias</p>
                            </div>
                          </div>
                          {neg.proximaAcao !== "-" && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-[#627271]">
                              <CheckCircle2 size={12} className="text-[#627271]" />
                              <span>Próxima ação: {neg.proximaAcao}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DADOS COMPLETOS */}
        {activeTab === "dados" && (
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Dados Completos</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#efefef] text-[#1f2937] text-sm hover:bg-[#efefef]" style={{ fontWeight: 500 }}>
                <Edit2 size={14} />
                Editar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: "Nome Completo", value: cliente.nome },
                { label: "Tipo", value: cliente.tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica" },
                { label: "Documento", value: cliente.documento },
                { label: "E-mail", value: cliente.email },
                { label: "Telefone Principal", value: cliente.telefone },
                { label: "WhatsApp", value: cliente.whatsapp },
                { label: "Cidade / UF", value: cliente.cidade },
                { label: "Vendedor Responsável", value: cliente.vendedor },
                { label: "Data de Cadastro", value: cliente.dataCadastro },
                { label: "Status", value: cliente.status === "ativo" ? "✅ Ativo" : "⛔ Inativo" },
                ...(cliente.aniversario ? [{ label: "Aniversário", value: cliente.aniversario }] : []),
              ].map((field) => (
                <div key={field.label} className="border-b border-[#efefef] pb-4">
                  <p className="text-[#627271] text-xs mb-1">{field.label}</p>
                  <p className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>{field.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#efefef]">
              <p className="text-[#627271] text-xs mb-2">Tags / Etiquetas</p>
              <div className="flex flex-wrap gap-2">
                {cliente.tags.map((tag) => <TagChip key={tag} tag={tag} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
