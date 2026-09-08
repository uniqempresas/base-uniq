import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  User,
  Phone,
  MessageCircle,
  Scissors,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit2,
  Copy,
  MoreVertical,
  Star,
  ExternalLink,
  Zap,
  AlertTriangle,
  MapPin,
  Loader2,
  X,
  Plus,
  FileText,
  LogIn,
  LogOut,
} from "lucide-react";
// Usar placeholder até ter a imagem real
const melPortrait = "https://api.dicebear.com/7.x/avataaars/svg?seed=MEL";
import {
  AGENDAMENTOS,
  PROFISSIONAIS,
  getStatusConfig,
  getOrigemConfig,
  formatCurrency,
  todayStr,
  type AgendamentoStatus,
} from "./agendaMockData";

function StatusBadge({ status, large }: { status: AgendamentoStatus; large?: boolean }) {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border ${large ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs"}`}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border, fontWeight: 700 }}
    >
      <span
        className={`rounded-full ${large ? "w-2.5 h-2.5" : "w-1.5 h-1.5"}`}
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}

/* ─── Timeline Icon ─── */
function TimelineIcon({ tipo }: { tipo: string }) {
  const map: Record<string, { icon: any; bg: string; color: string }> = {
    criacao: { icon: Plus, bg: "#EFF6FF", color: "#3B82F6" },
    confirmacao: { icon: CheckCircle2, bg: "#efefef", color: "#86cb92" },
    lembrete: { icon: Clock, bg: "#FFFBEB", color: "#F59E0B" },
    alteracao: { icon: Edit2, bg: "#F5F3FF", color: "#8B5CF6" },
    checkin: { icon: LogIn, bg: "#efefef", color: "#1f2937" },
    checkout: { icon: LogOut, bg: "#efefef", color: "#1f2937" },
    cancelamento: { icon: XCircle, bg: "#FEF2F2", color: "#EF4444" },
    nota: { icon: FileText, bg: "#efefef", color: "#627271" },
  };
  const cfg = map[tipo] || map.nota;
  const Icon = cfg.icon;
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: cfg.bg }}
    >
      <Icon size={15} style={{ color: cfg.color }} />
    </div>
  );
}

/* ─── Reagendar Modal ─── */
function ReagendarModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const HORAS = ["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30"];
  const handle = async () => {
    if (!data || !hora) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onSuccess();
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#1f2937]" style={{ fontWeight: 700 }}>Reagendar</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#efefef] flex items-center justify-center hover:bg-[#efefef]">
            <X size={14} className="text-[#627271]" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Nova data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} min={todayStr()}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]" />
          </div>
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Novo horário</label>
            <div className="grid grid-cols-4 gap-1.5">
              {HORAS.map((h) => (
                <button key={h} onClick={() => setHora(h)}
                  className="py-2 rounded-xl text-xs border transition-all"
                  style={{ background: hora === h ? "#86cb92" : "white", color: hora === h ? "#1f2937" : "#1f2937", borderColor: hora === h ? "#86cb92" : "#efefef", fontWeight: hora === h ? 700 : 400 }}>
                  {h}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              Cancelar
            </button>
            <button onClick={handle} disabled={loading || !data || !hora}
              className="flex-1 py-3 rounded-xl text-[#1f2937] text-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{ background: "#86cb92", fontWeight: 600 }}>
              {loading ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : "Reagendar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Cancelar Modal ─── */
function CancelarModal({ clienteNome, onClose, onSuccess }: { clienteNome: string; onClose: () => void; onSuccess: () => void }) {
  const [motivo, setMotivo] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onSuccess();
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <XCircle size={22} className="text-red-600" />
        </div>
        <h3 className="text-[#1f2937] text-center mb-1" style={{ fontWeight: 700 }}>Cancelar agendamento?</h3>
        <p className="text-[#627271] text-sm text-center mb-4">
          {clienteNome} será notificado(a) via WhatsApp
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Motivo do cancelamento *</label>
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-white appearance-none">
              <option value="">Selecionar motivo...</option>
              <option>Cliente solicitou cancelamento</option>
              <option>Profissional indisponível</option>
              <option>Problema de saúde</option>
              <option>Compromisso de trabalho</option>
              <option>Outro</option>
            </select>
          </div>
          <button
            onClick={() => setChecked(!checked)}
            className="flex items-start gap-3 text-left w-full p-3 rounded-xl bg-red-50 border border-red-100"
          >
            <div className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5"
              style={{ borderColor: checked ? "#EF4444" : "#efefef", background: checked ? "#EF4444" : "white" }}>
              {checked && <CheckCircle2 size={10} className="text-white" />}
            </div>
            <p className="text-red-700 text-xs" style={{ fontWeight: 500 }}>
              Entendo que o cliente será notificado do cancelamento
            </p>
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              Manter
            </button>
            <button onClick={handle} disabled={loading || !motivo || !checked}
              className="flex-1 py-3 rounded-xl text-white text-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", fontWeight: 600 }}>
              {loading ? <><Loader2 size={14} className="animate-spin" />...</> : "Cancelar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgendamentoDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showReagendar, setShowReagendar] = useState(false);
  const [showCancelar, setShowCancelar] = useState(false);
  const [showNota, setShowNota] = useState(false);
  const [nota, setNota] = useState("");
  const [toast, setToast] = useState("");

  const appt = AGENDAMENTOS.find((a) => a.id === id) || AGENDAMENTOS[0];
  const profissional = PROFISSIONAIS.find((p) => p.id === appt.profissionalId);
  const cfg = getStatusConfig(appt.status);
  const origemCfg = getOrigemConfig(appt.origem);
  const today = todayStr();
  const isPast = appt.data < today;
  const isToday = appt.data === today;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const [, m, d] = appt.data.split("-").map(Number);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#86cb92] text-[#1f2937] px-4 py-3 rounded-xl shadow-lg text-sm">
          <CheckCircle2 size={16} />{toast}
        </div>
      )}

      {showReagendar && (
        <ReagendarModal
          onClose={() => setShowReagendar(false)}
          onSuccess={() => { setShowReagendar(false); showToast("Reagendado com sucesso! Cliente será notificado."); }}
        />
      )}
      {showCancelar && (
        <CancelarModal
          clienteNome={appt.clienteNome}
          onClose={() => setShowCancelar(false)}
          onSuccess={() => { setShowCancelar(false); showToast("Agendamento cancelado. Cliente notificado."); }}
        />
      )}

      {/* Hero Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: appt.status === "cancelado"
          ? "linear-gradient(135deg, #1f2937, #1F2937)"
          : appt.status === "concluido"
          ? "#86cb92"
          : "#1f2937" }}
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10 px-4 sm:px-6 py-5">
          <button
            onClick={() => navigate("/agenda")}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-5 text-sm"
          >
            <ArrowLeft size={16} />
            Voltar para agenda
          </button>

          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Date block */}
            <div
              className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <p className="text-white/60 text-[10px]" style={{ fontWeight: 600 }}>
                {["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"][m - 1]}
              </p>
              <p className="text-white" style={{ fontWeight: 800, fontSize: "1.4rem", lineHeight: 1 }}>{d}</p>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <StatusBadge status={appt.status} large />
                {appt.primeiraVez && (
                  <span className="px-3 py-1.5 rounded-xl text-xs bg-purple-500/20 text-purple-200 border border-purple-400/30" style={{ fontWeight: 600 }}>
                    ⭐ Primeira vez
                  </span>
                )}
                {isToday && (
                  <span className="px-3 py-1.5 rounded-xl text-xs bg-[#86cb92]/20 text-[#1f2937] border border-[#86cb92]/30" style={{ fontWeight: 600 }}>
                    📅 Hoje
                  </span>
                )}
              </div>
              <h1 className="text-white mb-1" style={{ fontWeight: 800, fontSize: "1.3rem" }}>
                {appt.clienteNome}
              </h1>
              <div className="flex flex-wrap gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {appt.horaInicio} – {appt.horaFim}
                  <span className="text-white/40 text-xs">({appt.duracao}min)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Scissors size={13} />
                  {appt.servicoNome}
                </span>
                <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full" style={{ background: `${origemCfg.bg}20`, color: "white" }}>
                  {origemCfg.icon} {origemCfg.label}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {appt.status === "pendente" && (
                <button
                  onClick={() => showToast("Agendamento confirmado! ✅")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
                  style={{ background: "rgba(34,197,94,0.3)", border: "1px solid rgba(34,197,94,0.4)", fontWeight: 600 }}
                >
                  <CheckCircle2 size={15} />
                  Confirmar
                </button>
              )}
              {(appt.status === "confirmado" || appt.status === "em_andamento") && (
                <button
                  onClick={() => showToast("Atendimento concluído! ✔️")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
                  style={{ background: "rgba(34,197,94,0.3)", border: "1px solid rgba(34,197,94,0.4)", fontWeight: 600 }}
                >
                  <Zap size={15} />
                  Concluir atendimento
                </button>
              )}
              {appt.status !== "cancelado" && appt.status !== "concluido" && (
                <button
                  onClick={() => setShowReagendar(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600 }}
                >
                  <RefreshCw size={15} />
                  Reagendar
                </button>
              )}
              <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <MoreVertical size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
            {[
              { label: "Valor previsto", value: formatCurrency(appt.valor), color: "#1f2937" },
              { label: "Profissional", value: appt.profissional.split(" ")[0], color: profissional?.cor || "white" },
              { label: "Confirmação", value: appt.confirmacaoEnviada ? "Enviada ✓" : "Pendente", color: appt.confirmacaoEnviada ? "#1f2937" : "#FCD34D" },
              { label: "Lembrete", value: appt.lembreteEnviado ? "Enviado ✓" : "Não enviado", color: appt.lembreteEnviado ? "#1f2937" : "#627271" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white/40 text-[10px] mb-1">{s.label}</p>
                <p className="text-sm" style={{ fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Cancelamento info */}
          {appt.status === "cancelado" && appt.motivoCancelamento && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-400/30">
              <p className="text-red-300 text-xs" style={{ fontWeight: 600 }}>
                ✖️ Motivo do cancelamento: {appt.motivoCancelamento}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Client + Service */}
        <div className="lg:col-span-2 space-y-4">

          {/* Client card */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
              <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Informações do Cliente</h3>
              <button
                onClick={() => navigate(`/crm/clientes/c1`)}
                className="flex items-center gap-1 text-xs"
                style={{ color: "#1f2937", fontWeight: 500 }}
              >
                Ver ficha completa <ExternalLink size={11} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#efefef] to-[#efefef] flex items-center justify-center">
                  <User size={24} className="text-[#627271]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>{appt.clienteNome}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <a
                      href={`https://wa.me/${appt.clienteTelefone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[#627271] text-xs hover:text-[#627271] transition-colors"
                    >
                      <Phone size={12} />
                      {appt.clienteTelefone}
                    </a>
                    {appt.clienteEmail && (
                      <span className="text-[#627271] text-xs">{appt.clienteEmail}</span>
                    )}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#efefef] text-[#1f2937] text-xs border border-[#86cb92] hover:bg-[#efefef] transition-colors shrink-0">
                  <MessageCircle size={13} />
                  WhatsApp
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total de visitas", value: "12", icon: Star, color: "#F59E0B" },
                  { label: "Última visita", value: "15/03/24", icon: Calendar, color: "#3B82F6" },
                  { label: "Ticket médio", value: "R$ 180", icon: DollarSign, color: "#1f2937" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="bg-[#efefef] rounded-xl p-3 text-center">
                      <Icon size={15} style={{ color: s.color }} className="mx-auto mb-1" />
                      <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{s.value}</p>
                      <p className="text-[#627271] text-[10px]">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Serviço */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 600 }}>Detalhes do Serviço</h3>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#efefef]">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Scissors size={22} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>{appt.servicoNome}</p>
                <div className="flex items-center gap-4 mt-1 text-[#627271] text-xs">
                  <span className="flex items-center gap-1"><Clock size={12} />{appt.duracao} minutos</span>
                  <span className="flex items-center gap-1"><User size={12} />{appt.profissional}</span>
                </div>
              </div>
              <p className="text-[#1f2937]" style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                {formatCurrency(appt.valor)}
              </p>
            </div>

            {appt.observacoes && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-amber-800 text-xs mb-1" style={{ fontWeight: 600 }}>📝 Observações do cliente</p>
                <p className="text-amber-700 text-sm">{appt.observacoes}</p>
              </div>
            )}
          </div>

          {/* Adicionar nota */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Notas Internas</h3>
              <button
                onClick={() => setShowNota(!showNota)}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "#1f2937", fontWeight: 500 }}
              >
                <Plus size={13} />Adicionar nota
              </button>
            </div>
            {showNota && (
              <div className="mb-4">
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Observações internas (visíveis apenas para a equipe)..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] resize-none mb-2"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setShowNota(false); setNota(""); }}
                    className="px-3 py-1.5 rounded-lg border border-[#efefef] text-[#1f2937] text-xs" style={{ fontWeight: 500 }}>
                    Cancelar
                  </button>
                  <button onClick={() => { setShowNota(false); showToast("Nota adicionada!"); setNota(""); }}
                    className="px-3 py-1.5 rounded-lg text-[#1f2937] text-xs" style={{ background: "#86cb92", fontWeight: 600 }}>
                    Salvar nota
                  </button>
                </div>
              </div>
            )}
            {!appt.observacoesInternas && !nota && (
              <p className="text-[#627271] text-sm text-center py-3">Nenhuma nota interna</p>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <h3 className="text-[#1f2937] text-sm mb-5" style={{ fontWeight: 600 }}>Histórico de Ações</h3>
            <div className="space-y-4">
              {appt.timeline.map((item, i) => (
                <div key={item.id} className="flex gap-3 relative">
                  {/* Line connector */}
                  {i < appt.timeline.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-[#efefef]" />
                  )}
                  <TimelineIcon tipo={item.tipo} />
                  <div className="flex-1 pt-1 pb-4">
                    <p className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>{item.descricao}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[#627271] text-xs">{item.data.split("-").reverse().join("/")} às {item.hora}</p>
                      <span className="text-[#627271] text-xs">·</span>
                      <p className="text-[#627271] text-xs">{item.usuario}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* MEL */}
          <div
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: "#1f2937" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-amber-400">
                <img src={melPortrait} alt="MEL" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white text-xs" style={{ fontWeight: 700 }}>MEL · Insight</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[#627271] text-[10px]">Recomendação</span>
                </div>
              </div>
            </div>
            <p className="text-white text-xs leading-relaxed bg-white/10 rounded-xl p-3 border border-white/10">
              {appt.status === "pendente"
                ? `⚠️ ${appt.clienteNome} ainda não confirmou. Envie um lembrete pelo WhatsApp para garantir a presença!`
                : appt.status === "concluido"
                ? `✅ Atendimento concluído! Considere enviar uma mensagem de acompanhamento para ${appt.clienteNome.split(" ")[0]}.`
                : appt.primeiraVez
                ? `⭐ ${appt.clienteNome.split(" ")[0]} é cliente pela primeira vez! Cause uma excelente impressão.`
                : `📅 Próximo atendimento de ${appt.clienteNome.split(" ")[0]}. Revisão rápida do histórico pode ajudar!`
              }
            </p>
          </div>

          {/* Profissional */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 600 }}>Profissional</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                style={{ background: profissional?.cor || "#8B5CF6", fontWeight: 800, fontSize: "1.1rem" }}
              >
                {appt.profissional.charAt(0)}
              </div>
              <div>
                <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{appt.profissional}</p>
                <p className="text-[#627271] text-xs">{profissional?.especialidade}</p>
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4">
            <h3 className="text-[#1f2937] text-sm mb-3" style={{ fontWeight: 600 }}>Ações</h3>
            <div className="space-y-1.5">
              {[
                { label: "Enviar mensagem WhatsApp", icon: MessageCircle, color: "#86cb92", action: () => {} },
                { label: "Reagendar", icon: RefreshCw, color: "#3B82F6", action: () => setShowReagendar(true) },
                { label: "Duplicar agendamento", icon: Copy, color: "#8B5CF6", action: () => {} },
                { label: "Editar detalhes", icon: Edit2, color: "#F59E0B", action: () => {} },
                ...(appt.status !== "cancelado" && appt.status !== "concluido"
                  ? [{ label: "Cancelar agendamento", icon: XCircle, color: "#EF4444", action: () => setShowCancelar(true) }]
                  : []),
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <button key={a.label} onClick={a.action}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#efefef] transition-colors text-left">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}15` }}>
                      <Icon size={14} style={{ color: a.color }} />
                    </div>
                    <span className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Financeiro */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 600 }}>Informações Financeiras</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#627271] text-sm">Valor do serviço</span>
                <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{formatCurrency(appt.valor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627271] text-sm">Status pagamento</span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: appt.status === "concluido" ? "#efefef" : "#FFFBEB", color: appt.status === "concluido" ? "#1f2937" : "#B45309", fontWeight: 600 }}>
                  {appt.status === "concluido" ? "Pago" : "Pendente"}
                </span>
              </div>
              {appt.status !== "concluido" && appt.status !== "cancelado" && (
                <button className="w-full mt-2 py-2 rounded-xl text-[#1f2937] text-xs" style={{ background: "#86cb92", fontWeight: 600 }}>
                  Criar venda no PDV
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
