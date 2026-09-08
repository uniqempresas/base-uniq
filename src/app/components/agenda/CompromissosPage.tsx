import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Plus,
  Filter,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  Edit2,
  Calendar,
  ChevronDown,
  Download,
  RefreshCw,
  User,
  Scissors,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  AGENDAMENTOS,
  PROFISSIONAIS,
  SERVICOS,
  getStatusConfig,
  getOrigemConfig,
  formatCurrency,
  formatDateShort,
  todayStr,
  dateStr,
  type AgendamentoStatus,
} from "./agendaMockData";

const PERIODOS = ["Hoje", "Amanhã", "Esta semana", "Próxima semana", "Últimos 7 dias", "Todos"];
const STATUS_OPTS: AgendamentoStatus[] = ["pendente", "confirmado", "em_andamento", "concluido", "cancelado", "nao_compareceu"];

function StatusBadge({ status }: { status: AgendamentoStatus }) {
  const cfg = getStatusConfig(status);
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] border whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border, fontWeight: 600 }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

/* ─── Ação rápida confirm/concluir modal ─── */
function ActionModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onClose,
  withMotivo,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: (motivo?: string) => void;
  onClose: () => void;
  withMotivo?: boolean;
}) {
  const [motivo, setMotivo] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 700 }}>{title}</h3>
        <p className="text-[#627271] text-sm mb-4">{message}</p>
        {withMotivo && (
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo do cancelamento..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] resize-none mb-4"
          />
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(motivo)}
            className="flex-1 py-2.5 rounded-xl text-sm"
            style={{ background: confirmColor, color: confirmColor === "#86cb92" ? "#1f2937" : "white", fontWeight: 600 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CompromissosPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState("Esta semana");
  const [statusFiltro, setStatusFiltro] = useState<AgendamentoStatus | "todos">("todos");
  const [profFiltro, setProfFiltro] = useState("Todos");
  const [showFiltros, setShowFiltros] = useState(false);
  const [modal, setModal] = useState<{ tipo: string; apptId: string } | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const hoje = todayStr();

  const getPeriodDates = () => {
    switch (periodo) {
      case "Hoje": return { from: hoje, to: hoje };
      case "Amanhã": return { from: dateStr(1), to: dateStr(1) };
      case "Esta semana": return { from: dateStr(-3), to: dateStr(4) };
      case "Próxima semana": return { from: dateStr(4), to: dateStr(11) };
      case "Últimos 7 dias": return { from: dateStr(-7), to: hoje };
      default: return { from: "2000-01-01", to: "2099-12-31" };
    }
  };
  const { from, to } = getPeriodDates();

  const filtered = AGENDAMENTOS.filter((a) => {
    const matchBusca =
      !busca ||
      a.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      a.servicoNome.toLowerCase().includes(busca.toLowerCase()) ||
      a.clienteTelefone.includes(busca);
    const matchStatus = statusFiltro === "todos" || a.status === statusFiltro;
    const matchProf = profFiltro === "Todos" || a.profissional === profFiltro;
    const matchPeriod = a.data >= from && a.data <= to;
    return matchBusca && matchStatus && matchProf && matchPeriod;
  }).sort((a, b) => `${a.data}${a.horaInicio}`.localeCompare(`${b.data}${b.horaInicio}`));

  // KPIs
  const totalFaturamento = filtered.filter((a) => a.status !== "cancelado" && a.status !== "nao_compareceu").reduce((s, a) => s + a.valor, 0);
  const pendentes = filtered.filter((a) => a.status === "pendente").length;
  const confirmados = filtered.filter((a) => a.status === "confirmado").length;
  const concluidos = filtered.filter((a) => a.status === "concluido").length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#86cb92] text-[#1f2937] px-4 py-3 rounded-xl shadow-lg text-sm">
          <CheckCircle2 size={16} />{toast}
        </div>
      )}

      {/* Modals */}
      {modal?.tipo === "confirmar" && (
        <ActionModal
          title="Confirmar agendamento?"
          message="O cliente será notificado da confirmação via WhatsApp."
          confirmLabel="Confirmar"
          confirmColor="#86cb92"
          onConfirm={() => { setModal(null); showToast("Agendamento confirmado! ✅"); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === "cancelar" && (
        <ActionModal
          title="Cancelar agendamento?"
          message="Informe o motivo do cancelamento. O cliente será notificado."
          confirmLabel="Cancelar agendamento"
          confirmColor="#EF4444"
          onConfirm={(motivo) => { setModal(null); showToast("Agendamento cancelado"); }}
          onClose={() => setModal(null)}
          withMotivo
        />
      )}
      {modal?.tipo === "concluir" && (
        <ActionModal
          title="Marcar como concluído?"
          message="O atendimento será registrado no histórico do cliente."
          confirmLabel="Concluir"
          confirmColor="#86cb92"
          onConfirm={() => { setModal(null); showToast("Atendimento concluído! ✔️"); }}
          onClose={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
            Compromissos
          </h1>
          <p className="text-[#627271] text-sm">
            {filtered.length} agendamento(s) · {periodo}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs hover:bg-[#efefef]" style={{ fontWeight: 500 }}>
            <Download size={13} />Exportar
          </button>
          <button
            onClick={() => navigate("/agenda/novo")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Novo Agendamento</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Faturamento previsto", value: formatCurrency(totalFaturamento), icon: TrendingUp, color: "#1f2937", bg: "#efefef" },
          { label: "Pendentes", value: pendentes, icon: Clock, color: "#F59E0B", bg: "#FFFBEB", warn: pendentes > 0 },
          { label: "Confirmados", value: confirmados, icon: CheckCircle2, color: "#3B82F6", bg: "#EFF6FF" },
          { label: "Concluídos", value: concluidos, icon: CheckCircle2, color: "#16A34A", bg: "#efefef" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm border border-[#efefef]">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <Icon size={15} style={{ color: kpi.color }} />
                </div>
                {(kpi as any).warn && kpi.value > 0 && (
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <p className="text-[#627271] text-xs mb-0.5">{kpi.label}</p>
              <p className="text-[#1f2937] text-lg" style={{ fontWeight: 800 }}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente, serviço, telefone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-[#efefef]"
            />
          </div>

          {/* Período */}
          <div className="relative shrink-0">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" />
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="pl-8 pr-8 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none bg-white appearance-none"
              style={{ fontWeight: 500 }}
            >
              {PERIODOS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm transition-all shrink-0"
            style={{
              background: showFiltros ? "#efefef" : "white",
              borderColor: showFiltros ? "#86cb92" : "#efefef",
              color: showFiltros ? "#1f2937" : "#627271",
              fontWeight: 500,
            }}
          >
            <Filter size={14} />Filtros
          </button>
        </div>

        {showFiltros && (
          <div className="mt-4 pt-4 border-t border-[#efefef] flex flex-wrap gap-6">
            <div>
              <label className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 600 }}>Status</label>
              <div className="flex flex-wrap gap-1.5">
                {(["todos", ...STATUS_OPTS] as const).map((s) => {
                  const isActive = statusFiltro === s;
                  if (s === "todos") return (
                    <button key="todos" onClick={() => setStatusFiltro("todos")}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{ background: isActive ? "#efefef" : "#efefef", color: isActive ? "#1f2937" : "#627271", border: isActive ? "1px solid #86cb92" : "1px solid transparent", fontWeight: isActive ? 600 : 400 }}>
                      Todos
                    </button>
                  );
                  const cfg = getStatusConfig(s as AgendamentoStatus);
                  return (
                    <button key={s} onClick={() => setStatusFiltro(s as AgendamentoStatus)}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all border"
                      style={{ background: isActive ? cfg.bg : "#efefef", color: isActive ? cfg.text : "#627271", borderColor: isActive ? cfg.border : "transparent", fontWeight: isActive ? 600 : 400 }}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 600 }}>Profissional</label>
              <div className="flex flex-wrap gap-1.5">
                {["Todos", ...PROFISSIONAIS.map((p) => p.nome)].map((p) => (
                  <button key={p} onClick={() => setProfFiltro(p)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: profFiltro === p ? "#efefef" : "#efefef", color: profFiltro === p ? "#1f2937" : "#627271", border: profFiltro === p ? "1px solid #86cb92" : "1px solid transparent", fontWeight: profFiltro === p ? 600 : 400 }}>
                    {p === "Todos" ? "Todos" : p.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            {(statusFiltro !== "todos" || profFiltro !== "Todos") && (
              <button
                onClick={() => { setStatusFiltro("todos"); setProfFiltro("Todos"); }}
                className="flex items-center gap-1.5 text-red-500 text-xs hover:text-red-700 mt-auto"
                style={{ fontWeight: 500 }}
              >
                <X size={12} />Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
          <Calendar size={36} className="text-[#627271] mx-auto mb-3" />
          <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>Nenhum agendamento encontrado</h3>
          <p className="text-[#627271] text-sm mb-5">Ajuste os filtros ou crie um novo agendamento</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setStatusFiltro("todos"); setProfFiltro("Todos"); setBusca(""); }}
              className="px-5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              Limpar filtros
            </button>
            <button onClick={() => navigate("/agenda/novo")}
              className="px-5 py-2.5 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}>
              Novo agendamento
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
          {/* Group by date */}
          {(() => {
            const byDate: Record<string, typeof filtered> = {};
            filtered.forEach((a) => {
              if (!byDate[a.data]) byDate[a.data] = [];
              byDate[a.data].push(a);
            });
            return Object.entries(byDate).map(([date, appts]) => {
              const isToday = date === hoje;
              const [y, m, d] = date.split("-").map(Number);
              const dateObj = new Date(y, m - 1, d);
              const dayName = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][dateObj.getDay()];
              return (
                <div key={date}>
                  {/* Date group header */}
                  <div
                    className="flex items-center gap-3 px-5 py-2.5 border-b border-[#efefef]"
                    style={{ background: isToday ? "#efefef" : "#efefef" }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
                      style={{ background: isToday ? "#86cb92" : "white", color: isToday ? "#1f2937" : "#627271", fontWeight: 700, border: isToday ? "none" : "1px solid #efefef" }}
                    >
                      {d}
                    </div>
                    <span className="text-xs" style={{ color: isToday ? "#1f2937" : "#627271", fontWeight: 600 }}>
                      {dayName}, {d}/{m}/{y}
                      {isToday && " · Hoje"}
                    </span>
                    <div className="flex-1 h-px bg-[#efefef]" />
                    <span className="text-xs text-[#627271]">
                      {appts.filter((a) => a.status !== "cancelado").length} agend. ·{" "}
                      {formatCurrency(appts.filter((a) => a.status !== "cancelado" && a.status !== "nao_compareceu").reduce((s, a) => s + a.valor, 0))}
                    </span>
                  </div>

                  {/* Appointments rows */}
                  {appts.map((appt) => {
                    const cfg = getStatusConfig(appt.status);
                    const origemCfg = getOrigemConfig(appt.origem);
                    const profColor = PROFISSIONAIS.find((p) => p.id === appt.profissionalId)?.cor || "#8B5CF6";
                    return (
                      <div
                        key={appt.id}
                        className="flex items-center gap-4 px-5 py-4 border-b border-[#efefef] hover:bg-[#efefef]/50 transition-colors group"
                        style={{ opacity: appt.status === "cancelado" || appt.status === "nao_compareceu" ? 0.6 : 1 }}
                      >
                        {/* Time */}
                        <div className="w-16 shrink-0">
                          <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{appt.horaInicio}</p>
                          <p className="text-[#627271] text-[10px]">{appt.horaFim}</p>
                        </div>

                        {/* Status dot */}
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: cfg.dot }}
                        />

                        {/* Client + Service */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <button
                              onClick={() => navigate(`/agenda/${appt.id}`)}
                              className="text-[#1f2937] text-sm hover:text-[#1f2937] transition-colors"
                              style={{ fontWeight: 700 }}
                            >
                              {appt.clienteNome}
                            </button>
                            {appt.primeiraVez && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 shrink-0" style={{ fontWeight: 600 }}>1ª vez</span>
                            )}
                            {!appt.confirmacaoEnviada && appt.status === "pendente" && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0" style={{ fontWeight: 600 }}>
                                ⚠️ Não confirmado
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-[#627271] text-xs">{appt.servicoNome}</p>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: origemCfg.bg, color: origemCfg.text, fontWeight: 600 }}>
                              {origemCfg.icon} {origemCfg.label}
                            </span>
                          </div>
                        </div>

                        {/* Professional */}
                        <div className="hidden md:flex items-center gap-2 shrink-0">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: profColor, fontWeight: 700 }}>
                            {appt.profissional.charAt(0)}
                          </div>
                          <span className="text-[#1f2937] text-xs">{appt.profissional.split(" ")[0]}</span>
                        </div>

                        {/* Status + Value */}
                        <div className="hidden sm:block shrink-0">
                          <StatusBadge status={appt.status} />
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{formatCurrency(appt.valor)}</p>
                          <p className="text-[#627271] text-[10px]">{appt.duracao}min</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {appt.status === "pendente" && (
                            <button
                              onClick={() => setModal({ tipo: "confirmar", apptId: appt.id })}
                              className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                              title="Confirmar"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {(appt.status === "confirmado" || appt.status === "em_andamento") && (
                            <button
                              onClick={() => setModal({ tipo: "concluir", apptId: appt.id })}
                              className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef] transition-colors"
                              title="Concluir"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button
                            className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef] transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle size={13} />
                          </button>
                          <button
                            onClick={() => navigate(`/agenda/${appt.id}`)}
                            className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef] transition-colors"
                            title="Detalhes"
                          >
                            <Edit2 size={13} />
                          </button>
                          {appt.status !== "cancelado" && appt.status !== "concluido" && (
                            <button
                              onClick={() => setModal({ tipo: "cancelar", apptId: appt.id })}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                              title="Cancelar"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            });
          })()}

          {/* Footer */}
          <div className="px-5 py-3 bg-[#efefef] border-t border-[#efefef] flex items-center justify-between">
            <p className="text-[#627271] text-xs">
              {filtered.length} agendamento(s) · {filtered.filter((a) => a.status !== "cancelado").length} ativos
            </p>
            <p className="text-[#1f2937] text-xs" style={{ fontWeight: 600 }}>
              Previsto: {formatCurrency(totalFaturamento)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
