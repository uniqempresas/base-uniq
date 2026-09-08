import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Scissors,
  Filter,
  Calendar,
  LayoutList,
  Grid3x3,
  MessageCircle,
  Zap,
  AlertCircle,
  LayoutDashboard,
  FileText,
} from "lucide-react";
// Usar placeholder até ter a imagem real
const melPortrait = "https://api.dicebear.com/7.x/avataaars/svg?seed=MEL";
import {
  AGENDAMENTOS,
  PROFISSIONAIS,
  DIAS_SEMANA_SHORT,
  DIAS_SEMANA_FULL,
  MESES,
  getAgendamentosDia,
  getWeekDates,
  getStatusConfig,
  formatCurrency,
  todayStr,
  dateStr,
  type AgendamentoStatus,
  SERVICO_CORES,
} from "./agendaMockData";

type ViewMode = "semana" | "dia" | "mes";

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: AgendamentoStatus }) {
  const cfg = getStatusConfig(status);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border, fontWeight: 600 }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

/* ─── Mini Calendar ─── */
function MiniCalendario({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (d: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const [y, m] = selectedDate.split("-").map(Number);
    return { year: y, month: m - 1 };
  });

  const today = todayStr();
  const firstDay = new Date(viewMonth.year, viewMonth.month, 1);
  const lastDay = new Date(viewMonth.year, viewMonth.month + 1, 0);
  // offset: what weekday is the 1st (Mon=0)
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = lastDay.getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const dateForDay = (day: number) =>
    `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const hasAppts = (day: number) =>
    AGENDAMENTOS.some((a) => a.data === dateForDay(day) && a.status !== "cancelado");

  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() =>
            setViewMonth((v) => {
              const d = new Date(v.year, v.month - 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })
          }
          className="w-7 h-7 rounded-lg hover:bg-[#efefef] flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={14} className="text-[#627271]" />
        </button>
        <p className="text-[#1f2937] text-xs" style={{ fontWeight: 700 }}>
          {MESES[viewMonth.month]} {viewMonth.year}
        </p>
        <button
          onClick={() =>
            setViewMonth((v) => {
              const d = new Date(v.year, v.month + 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })
          }
          className="w-7 h-7 rounded-lg hover:bg-[#efefef] flex items-center justify-center transition-colors"
        >
          <ChevronRight size={14} className="text-[#627271]" />
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS_SEMANA_SHORT.map((d) => (
          <div key={d} className="text-center text-[9px] text-[#627271] py-1" style={{ fontWeight: 600 }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dStr = dateForDay(day);
          const isToday = dStr === today;
          const isSelected = dStr === selectedDate;
          const hasApt = hasAppts(day);
          return (
            <button
              key={dStr}
              onClick={() => onSelect(dStr)}
              className="relative flex flex-col items-center justify-center w-full aspect-square rounded-lg text-[11px] transition-all"
              style={{
                background: isSelected
                  ? "#86cb92"
                  : isToday
                  ? "#efefef"
                  : "transparent",
                color: isSelected ? "#1f2937" : isToday ? "#1f2937" : "#1f2937",
                fontWeight: isToday || isSelected ? 700 : 400,
                border: isToday && !isSelected ? "1.5px solid #86cb92" : "1.5px solid transparent",
              }}
            >
              {day}
              {hasApt && !isSelected && (
                <div
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: isToday ? "#86cb92" : "#627271" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-3 pt-3 border-t border-[#efefef] space-y-1.5">
        {[
          { color: "#3B82F6", label: "Confirmado" },
          { color: "#F59E0B", label: "Pendente" },
          { color: "#86cb92", label: "Em andamento" },
          { color: "#627271", label: "Concluído" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
            <span className="text-[#627271] text-[10px]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Week view ─── */
function WeekView({
  weekDates,
  selectedDate,
  onSelectDay,
  onClickAppt,
}: {
  weekDates: string[];
  selectedDate: string;
  onSelectDay: (d: string) => void;
  onClickAppt: (id: string) => void;
}) {
  const today = todayStr();
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 08 – 18

  const apptsByDay = weekDates.map((d) => getAgendamentosDia(d));

  // Current time indicator
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const timePercent = ((currentHour - 8) / 10) * 100;
  const todayIdx = weekDates.indexOf(today);

  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden flex flex-col">
      {/* Day headers */}
      <div className="grid border-b border-[#efefef]" style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}>
        <div className="p-2 border-r border-[#efefef]" />
        {weekDates.map((d, i) => {
          const [, , day] = d.split("-").map(Number);
          const isToday = d === today;
          const isSelected = d === selectedDate;
          const apptCount = apptsByDay[i].filter((a) => a.status !== "cancelado").length;
          return (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className="flex flex-col items-center justify-center py-2.5 px-1 transition-all border-r border-[#efefef] last:border-r-0"
              style={{ background: isSelected ? "#efefef" : "transparent" }}
            >
              <span
                className="text-[10px] mb-0.5"
                style={{ color: isToday ? "#1f2937" : "#627271", fontWeight: 600 }}
              >
                {DIAS_SEMANA_SHORT[i]}
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: isToday ? "#86cb92" : isSelected ? "#efefef" : "transparent",
                  color: isToday ? "#1f2937" : isSelected ? "#1f2937" : "#1f2937",
                  fontWeight: isToday || isSelected ? 700 : 400,
                }}
              >
                {day}
              </div>
              {apptCount > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: Math.min(apptCount, 4) }).map((_, k) => (
                    <div
                      key={k}
                      className="w-1 h-1 rounded-full"
                      style={{ background: isToday ? "#86cb92" : "#efefef" }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto flex-1" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <div className="relative grid" style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}>
          {/* Time labels */}
          <div>
            {hours.map((h) => (
              <div
                key={h}
                className="border-b border-[#efefef] flex items-start justify-end pr-2 pt-0.5"
                style={{ height: "60px" }}
              >
                <span className="text-[10px] text-[#627271]" style={{ fontWeight: 500 }}>
                  {String(h).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((d, dayIdx) => {
            const dayAppts = apptsByDay[dayIdx];
            const isToday = d === today;

            return (
              <div
                key={d}
                className="relative border-r border-[#efefef] last:border-r-0"
                style={{ background: isToday ? "#efefef" : "transparent" }}
              >
                {/* Hour lines */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="border-b border-[#efefef]"
                    style={{ height: "60px" }}
                  />
                ))}

                {/* Current time line */}
                {isToday && currentHour >= 8 && currentHour <= 18 && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center"
                    style={{ top: `${timePercent}%` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" style={{ marginLeft: "-4px" }} />
                    <div className="flex-1 h-px bg-red-500" />
                  </div>
                )}

                {/* Appointments */}
                {dayAppts.map((appt) => {
                  const [startH, startM] = appt.horaInicio.split(":").map(Number);
                  const startMins = (startH - 8) * 60 + startM;
                  const topPct = (startMins / 600) * 100;
                  const heightPct = (appt.duracao / 600) * 100;
                  const catColor = SERVICO_CORES[appt.servicoCategoria] || "#8B5CF6";
                  const isCanceled = appt.status === "cancelado";

                  return (
                    <button
                      key={appt.id}
                      onClick={() => onClickAppt(appt.id)}
                      className="absolute left-1 right-1 rounded-xl overflow-hidden text-left transition-all hover:shadow-md hover:scale-[1.01] group z-10"
                      style={{
                        top: `${topPct}%`,
                        height: `${Math.max(heightPct, 6)}%`,
                        background: isCanceled
                          ? "#efefef"
                          : `${catColor}18`,
                        border: `1.5px solid ${isCanceled ? "#efefef" : catColor}40`,
                        opacity: isCanceled ? 0.5 : 1,
                      }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                        style={{ background: catColor }}
                      />
                      <div className="pl-2.5 pr-1.5 py-1.5 h-full flex flex-col justify-start overflow-hidden">
                        <p
                          className="text-[10px] truncate leading-tight"
                          style={{ color: catColor, fontWeight: 700 }}
                        >
                          {appt.horaInicio}
                        </p>
                        <p
                          className="text-[10px] text-[#1f2937] truncate leading-tight"
                          style={{ fontWeight: 600 }}
                        >
                          {appt.clienteNome.split(" ")[0]}
                        </p>
                        {appt.duracao >= 60 && (
                          <p className="text-[9px] text-[#627271] truncate">{appt.servicoNome}</p>
                        )}
                        {appt.status === "em_andamento" && (
                          <div className="mt-auto">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#86cb92] animate-pulse" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Day agenda list ─── */
function DayAgendaList({
  date,
  onClickAppt,
  onNewAppt,
}: {
  date: string;
  onClickAppt: (id: string) => void;
  onNewAppt: () => void;
}) {
  const appts = getAgendamentosDia(date);
  const today = todayStr();
  const isToday = date === today;

  const [y, m, d] = date.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayName = DIAS_SEMANA_FULL[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1];
  const monthName = MESES[m - 1];

  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{
          background: isToday
            ? "#86cb92"
            : "#1f2937",
        }}
      >
        <div>
          <p className="text-white/60 text-xs">{dayName}</p>
          <p className="text-white" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {d} de {monthName}
          </p>
          {isToday && (
            <span className="inline-flex items-center gap-1 text-[#86cb92] text-xs mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#86cb92] animate-pulse" />
              Hoje
            </span>
          )}
        </div>
        <div className="text-right">
          <p
            className="text-white/60 text-xs"
          >
            {appts.filter((a) => a.status !== "cancelado").length} agendamentos
          </p>
          <p className="text-white text-sm mt-0.5" style={{ fontWeight: 600 }}>
            {formatCurrency(appts.filter((a) => a.status !== "cancelado").reduce((s, a) => s + a.valor, 0))}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
        {appts.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar size={32} className="text-[#627271] mx-auto mb-3" />
            <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
              Nenhum agendamento
            </p>
            <p className="text-[#627271] text-xs mb-4">Aproveite ou adicione um novo compromisso</p>
            <button
              onClick={onNewAppt}
              className="px-4 py-2 rounded-xl text-[#1f2937] text-xs"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              + Adicionar agendamento
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {appts.map((appt) => {
              const cfg = getStatusConfig(appt.status);
              const catColor = SERVICO_CORES[appt.servicoCategoria] || "#8B5CF6";
              return (
                <button
                  key={appt.id}
                  onClick={() => onClickAppt(appt.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#efefef] transition-all text-left group border border-transparent hover:border-[#efefef]"
                  style={{ opacity: appt.status === "cancelado" ? 0.5 : 1 }}
                >
                  {/* Time column */}
                  <div className="shrink-0 text-center w-12">
                    <p className="text-[#1f2937] text-xs" style={{ fontWeight: 700 }}>
                      {appt.horaInicio}
                    </p>
                    <div className="h-px bg-[#efefef] my-1" />
                    <p className="text-[#627271] text-[10px]">{appt.horaFim}</p>
                  </div>

                  {/* Color bar */}
                  <div
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{ background: catColor }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 700 }}>
                        {appt.clienteNome}
                      </p>
                      {appt.primeiraVez && (
                        <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700" style={{ fontWeight: 600 }}>
                          1ª vez
                        </span>
                      )}
                    </div>
                    <p className="text-[#627271] text-xs truncate">{appt.servicoNome}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={appt.status} />
                      <span className="text-[#627271] text-[10px]">{appt.profissional.split(" ")[0]}</span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="shrink-0 text-right">
                    <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
                      {formatCurrency(appt.valor)}
                    </p>
                    <p className="text-[#627271] text-[10px]">{appt.duracao}min</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#efefef] bg-[#efefef]">
        <button
          onClick={onNewAppt}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm"
          style={{ color: "#1f2937", fontWeight: 600 }}
        >
          <Plus size={15} />
          Novo agendamento
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export function AgendaPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [viewMode, setViewMode] = useState<ViewMode>("semana");
  const [weekOffset, setWeekOffset] = useState(0);
  const [profFiltro, setProfFiltro] = useState("Todos");

  const weekStartRef = useRef(todayStr());
  const weekDates = getWeekDates(dateStr(weekOffset * 7));

  const hoje = todayStr();
  const todayAppts = getAgendamentosDia(hoje);
  const pendentes = AGENDAMENTOS.filter((a) => a.status === "pendente").length;

  return (
    <div className="p-4 sm:p-5 max-w-full h-full flex flex-col gap-4">
      {/* Menu de Contexto */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate("/agenda")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
        >
          <Calendar size={16} className="text-[#627271]" />
          <span className="text-sm font-medium text-[#1f2937]">Agenda</span>
        </button>

        <button
          onClick={() => navigate("/agenda/novo")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
        >
          <Plus size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-[#1f2937]">Novo</span>
        </button>

        <button
          onClick={() => navigate("/agenda/compromissos")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
        >
          <FileText size={16} className="text-violet-600" />
          <span className="text-sm font-medium text-[#1f2937]">Compromissos</span>
        </button>
      </div>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
            Agenda
          </h1>
          <p className="text-[#627271] text-sm">
            {todayAppts.filter((a) => a.status !== "cancelado").length} compromissos hoje ·{" "}
            {pendentes > 0 && (
              <span className="text-amber-600" style={{ fontWeight: 600 }}>
                {pendentes} pendente(s) de confirmação
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-[#efefef] rounded-xl overflow-hidden bg-[#efefef] text-xs">
            {(["dia", "semana", "mes"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className="px-3 py-2 capitalize transition-all"
                style={{
                  background: viewMode === v ? "white" : "transparent",
                  color: viewMode === v ? "#1f2937" : "#627271",
                  fontWeight: viewMode === v ? 700 : 400,
                  boxShadow: viewMode === v ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
                }}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Profissional filter */}
          <select
            value={profFiltro}
            onChange={(e) => setProfFiltro(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#efefef] text-[#1f2937] text-xs outline-none focus:border-[#86cb92] bg-white"
            style={{ fontWeight: 500 }}
          >
            <option value="Todos">Todos os profissionais</option>
            {PROFISSIONAIS.map((p) => (
              <option key={p.id} value={p.nome}>{p.nome}</option>
            ))}
          </select>

          <button
            onClick={() => navigate("/agenda/novo")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Novo Agendamento</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Alert strip for pending */}
      {pendentes > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
          style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
        >
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <p className="text-amber-700 text-xs flex-1" style={{ fontWeight: 500 }}>
            Você tem <strong>{pendentes} agendamento(s) pendente(s)</strong> aguardando confirmação
          </p>
          <button
            onClick={() => navigate("/agenda/compromissos")}
            className="text-xs text-amber-700 underline shrink-0"
            style={{ fontWeight: 600 }}
          >
            Ver todos
          </button>
        </div>
      )}

      {/* Main grid */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left sidebar */}
        <div className="hidden lg:flex flex-col gap-4 w-64 shrink-0">
          <MiniCalendario selectedDate={selectedDate} onSelect={setSelectedDate} />

          {/* MEL card */}
          <div
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: "#1f2937" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-amber-400">
                <img src={melPortrait} alt="MEL" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white text-xs" style={{ fontWeight: 700 }}>MEL · Agenda</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[#627271] text-[10px]">Análise do dia</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10 space-y-2">
              <p className="text-white text-xs leading-relaxed">
                📅 Você tem <strong>
                  {todayAppts.filter((a) => a.status !== "cancelado").length}
                </strong> atendimentos hoje com faturamento previsto de{" "}
                <strong className="text-[#86cb92]">
                  {formatCurrency(todayAppts.filter((a) => a.status !== "cancelado").reduce((s, a) => s + a.valor, 0))}
                </strong>
              </p>
              {pendentes > 0 && (
                <p className="text-amber-300 text-[10px] border-t border-white/10 pt-2">
                  ⚠️ {pendentes} cliente(s) ainda não confirmaram. Envie lembrete pelo WhatsApp!
                </p>
              )}
            </div>
          </div>

          {/* Profissionais legend */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4">
            <p className="text-[#1f2937] text-xs mb-3" style={{ fontWeight: 600 }}>Profissionais</p>
            <div className="space-y-2">
              {PROFISSIONAIS.map((p) => {
                const apptCount = AGENDAMENTOS.filter(
                  (a) => a.profissionalId === p.id && a.data === selectedDate && a.status !== "cancelado"
                ).length;
                return (
                  <div key={p.id} className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: p.cor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1f2937] text-xs truncate" style={{ fontWeight: 500 }}>
                        {p.nome}
                      </p>
                      <p className="text-[#627271] text-[10px]">{p.especialidade}</p>
                    </div>
                    <span className="text-xs text-[#627271]" style={{ fontWeight: 600 }}>{apptCount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-4 min-w-0">
          {/* Calendar / week view */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Week navigation */}
            {viewMode === "semana" && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setWeekOffset((w) => w - 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-[#efefef] flex items-center justify-center hover:bg-[#efefef] transition-colors"
                  >
                    <ChevronLeft size={15} className="text-[#1f2937]" />
                  </button>
                  <button
                    onClick={() => { setWeekOffset(0); setSelectedDate(hoje); }}
                    className="px-3 py-1.5 rounded-xl border border-[#efefef] bg-white text-xs hover:bg-[#efefef] transition-colors"
                    style={{ color: "#1f2937", fontWeight: 600 }}
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => setWeekOffset((w) => w + 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-[#efefef] flex items-center justify-center hover:bg-[#efefef] transition-colors"
                  >
                    <ChevronRight size={15} className="text-[#1f2937]" />
                  </button>
                </div>
                <p className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
                  {(() => {
                    const first = weekDates[0].split("-");
                    const last = weekDates[6].split("-");
                    return `${parseInt(first[2])} – ${parseInt(last[2])} de ${MESES[parseInt(last[1]) - 1]} ${last[0]}`;
                  })()}
                </p>
              </div>
            )}

            <WeekView
              weekDates={weekDates}
              selectedDate={selectedDate}
              onSelectDay={setSelectedDate}
              onClickAppt={(id) => navigate(`/agenda/${id}`)}
            />
          </div>

          {/* Day sidebar */}
          <div className="w-72 shrink-0 hidden xl:block">
            <DayAgendaList
              date={selectedDate}
              onClickAppt={(id) => navigate(`/agenda/${id}`)}
              onNewAppt={() => navigate("/agenda/novo")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
