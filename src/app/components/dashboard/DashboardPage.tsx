import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  Calendar,
  MessageCircle,
  Target,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Plus,
  RefreshCw,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import melPortrait from "../../../assets/78ea19d3f884e1598dfb94e5cc05dab06dd59ad2.png";

// Mock data
const CHART_DATA = [
  { dia: "Seg", valor: 820, vendas: 8 },
  { dia: "Ter", valor: 1240, vendas: 12 },
  { dia: "Qua", valor: 680, vendas: 6 },
  { dia: "Qui", valor: 1580, vendas: 15 },
  { dia: "Sex", valor: 2100, vendas: 19 },
  { dia: "Sáb", valor: 1890, vendas: 17 },
  { dia: "Hoje", valor: 1250, vendas: 12 },
];

const TASKS = [
  { id: 1, tipo: "crm", icon: Users, color: "#8B5CF6", label: "3 follow-ups pendentes", detail: "João Silva, Ana Santos, Pedro...", urgent: true },
  { id: 2, tipo: "agenda", icon: Calendar, color: "#1f2937", label: "2 agendamentos hoje", detail: "14h - Corte Maria | 16h - Manicure", urgent: false },
  { id: 3, tipo: "estoque", icon: Package, color: "#F59E0B", label: "Estoque baixo: 2 produtos", detail: "Camiseta P (2un) · Calça Preta (1un)", urgent: true },
  { id: 4, tipo: "financeiro", icon: DollarSign, color: "#EF4444", label: "1 conta vencendo hoje", detail: "Aluguel - R$ 1.800,00", urgent: true },
  { id: 5, tipo: "whatsapp", icon: MessageCircle, color: "#1f2937", label: "5 mensagens não lidas", detail: "WhatsApp Business", urgent: false },
];

const MODULES = [
  { id: "crm", label: "CRM", icon: Users, desc: "3 clientes", color: "#8B5CF6", bg: "#F5F3FF", badge: 3 },
  { id: "vendas", label: "Vendas", icon: ShoppingCart, desc: "12 hoje", color: "#1f2937", bg: "#efefef", badge: 0 },
  { id: "estoque", label: "Estoque", icon: Package, desc: "2 alertas", color: "#F59E0B", bg: "#FFFBEB", badge: 2 },
  { id: "agenda", label: "Agenda", icon: Calendar, desc: "2 hoje", color: "#1f2937", bg: "#efefef", badge: 1 },
  { id: "financeiro", label: "Financeiro", icon: DollarSign, desc: "Em dia", color: "#1f2937", bg: "#efefef", badge: 0 },
  { id: "config", label: "Config.", icon: Star, desc: "Plano Starter", color: "#1f2937", bg: "#efefef", badge: 0 },
];

const MEL_INSIGHTS = [
  { msg: "Você vendeu 20% mais que ontem! Continue assim! 🎉", action: "Ver relatório" },
  { msg: "Não se esqueça de ligar para o João Silva - follow-up pendente às 14h ⏰", action: "Ver CRM" },
  { msg: "Camiseta P está acabando (2 unidades). Hora de reabastecer! 📦", action: "Ver estoque" },
  { msg: "Você está a R$ 750 da sua meta semanal! Vai conseguir! 💪", action: "Ver meta" },
];

const randomInsight = MEL_INSIGHTS[Math.floor(Math.random() * MEL_INSIGHTS.length)];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#efefef] hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
          style={{
            background: trend === "up" ? "#efefef" : trend === "down" ? "#FEF2F2" : "#efefef",
            color: trend === "up" ? "#1f2937" : trend === "down" ? "#DC2626" : "#627271",
          }}
        >
          {trend === "up" ? <TrendingUp size={11} /> : trend === "down" ? <TrendingDown size={11} /> : null}
          <span style={{ fontWeight: 600 }}>{trendValue}</span>
        </div>
      </div>
      <p className="text-[#627271] text-xs mb-1">{title}</p>
      <p className="text-[#1f2937]" style={{ fontSize: "1.4rem", fontWeight: 700, lineHeight: 1 }}>
        {value}
      </p>
      {subtitle && <p className="text-[#627271] text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg rounded-xl px-3 py-2 border border-[#efefef]">
        <p className="text-[#627271] text-xs">{label}</p>
        <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
          {formatCurrency(payload[0]?.value)}
        </p>
        <p className="text-[#627271] text-xs">{payload[1]?.value} vendas</p>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const { perfil, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);

  // Fallback em cascata: perfil → user_metadata → email → "Usuário" (SPEC item 2)
  const nomeUsuario =
    perfil?.nome_usuario ||
    (user?.user_metadata?.nome_completo as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const metaValor = 2000;
  const metaAtual = 1250;
  const metaPercent = Math.round((metaAtual / metaValor) * 100);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[#627271] text-sm capitalize">{today}</p>
          <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.3rem" }}>
            {getGreeting()}, {nomeUsuario}! 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="w-9 h-9 rounded-xl bg-white border border-[#efefef] flex items-center justify-center hover:bg-[#efefef] transition-colors"
          >
            <RefreshCw size={15} className={`text-[#627271] ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowQuickSale(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#86cb92] text-[#1f2937] text-sm transition-all hover:bg-[#1f2937] hover:text-white active:scale-[0.98]"
            style={{ fontWeight: 600 }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nova Venda</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          title="Faturamento hoje"
          value="R$ 1.250"
          subtitle="vs R$ 1.040 ontem"
          trend="up"
          trendValue="+20%"
          icon={DollarSign}
          color="#1f2937"
          bg="#efefef"
        />
        <KpiCard
          title="Vendas hoje"
          value="12 vendas"
          subtitle="vs 8 ontem"
          trend="up"
          trendValue="+50%"
          icon={ShoppingCart}
          color="#1f2937"
          bg="#efefef"
        />
        <KpiCard
          title="Clientes novos"
          value="3 clientes"
          subtitle="2 via loja online"
          trend="up"
          trendValue="+1 vs ontem"
          icon={Users}
          color="#8B5CF6"
          bg="#F5F3FF"
        />
      </div>

      {/* Middle row: Chart + MEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-[#efefef]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Faturamento — últimos 7 dias</h3>
              <p className="text-[#627271] text-xs">Comparativo semanal</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-[#efefef] text-[#1f2937]" style={{ fontWeight: 600 }}>
              ↑ 12% esta semana
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#86cb92" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#86cb92" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#efefef" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#627271" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#627271" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#86cb92"
                strokeWidth={2.5}
                fill="url(#colorValor)"
                dot={{ fill: "#86cb92", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#86cb92", strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* MEL Card */}
        <div
          className="rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col"
          style={{ background: "#1f2937" }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ background: "#86cb92" }} />

          <div className="flex items-center gap-2 mb-3 relative z-10">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#86cb92]">
              <img src={melPortrait} alt="MEL" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-white text-xs" style={{ fontWeight: 700 }}>MEL</p>
                <div className="w-1.5 h-1.5 rounded-full bg-[#86cb92] animate-pulse" />
              </div>
              <p className="text-[#efefef] text-[10px]">IA Proativa · Online</p>
            </div>
          </div>

          <div className="flex-1 relative z-10">
            <div className="bg-white/10 rounded-xl p-3 mb-3 border border-white/10">
              <p className="text-white text-sm leading-relaxed">{randomInsight.msg}</p>
            </div>
            <button className="flex items-center gap-1.5 text-[#86cb92] text-xs hover:text-[#efefef] transition-colors" style={{ fontWeight: 600 }}>
              {randomInsight.action} <ArrowRight size={12} />
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Target size={13} className="text-[#86cb92]" />
                <p className="text-[#efefef] text-xs" style={{ fontWeight: 500 }}>Meta diária</p>
              </div>
              <span className="text-[#86cb92] text-xs" style={{ fontWeight: 700 }}>{metaPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${metaPercent}%`, background: "#86cb92" }}
              />
            </div>
            <p className="text-[#efefef] text-[10px] mt-1">
              {formatCurrency(metaAtual)} / {formatCurrency(metaValor)}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom row: Tasks + Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Tasks */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#efefef]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>O que precisa de atenção</h3>
              <p className="text-[#627271] text-xs">5 itens pendentes hoje</p>
            </div>
            <span
              className="w-7 h-7 rounded-full text-xs flex items-center justify-center text-white"
              style={{ background: "#EF4444", fontWeight: 700 }}
            >
              5
            </span>
          </div>
          <div className="space-y-2">
            {TASKS.map((task) => {
              const Icon = task.icon;
              return (
                <button
                  key={task.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#efefef] transition-colors text-left group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${task.color}15` }}
                  >
                    <Icon size={17} style={{ color: task.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[#1f2937] text-xs leading-tight" style={{ fontWeight: 600 }}>
                        {task.label}
                      </p>
                      {task.urgent && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[9px] text-red-600 bg-red-50" style={{ fontWeight: 600 }}>
                          Urgente
                        </span>
                      )}
                    </div>
                    <p className="text-[#627271] text-[11px] mt-0.5 truncate">{task.detail}</p>
                  </div>
                  <ChevronRight size={14} className="text-[#efefef] group-hover:text-[#627271] shrink-0" />
                </button>
              );
            })}
          </div>
          <button className="w-full mt-3 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors" style={{ fontWeight: 500 }}>
            Ver todos os alertas
          </button>
        </div>

        {/* Modules */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#efefef]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Acesso Rápido</h3>
              <p className="text-[#627271] text-xs">Módulos do sistema</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  className="relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:shadow-sm active:scale-[0.97] border border-transparent hover:border-[#efefef]"
                  style={{ background: mod.bg }}
                >
                  {mod.badge > 0 && (
                    <span
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center text-white"
                      style={{ background: "#EF4444", fontWeight: 700 }}
                    >
                      {mod.badge}
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "white" }}>
                    <Icon size={20} style={{ color: mod.color }} />
                  </div>
                  <div className="text-center">
                    <p className="text-[#1f2937] text-xs" style={{ fontWeight: 600 }}>{mod.label}</p>
                    <p className="text-[#627271] text-[10px]">{mod.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#efefef] grid grid-cols-2 gap-2">
            <button className="flex items-center gap-2 p-2.5 rounded-xl bg-[#efefef] hover:bg-white transition-colors">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                <Zap size={14} className="text-[#1f2937]" />
              </div>
              <span className="text-[#1f2937] text-xs" style={{ fontWeight: 500 }}>Venda rápida</span>
            </button>
            <button className="flex items-center gap-2 p-2.5 rounded-xl bg-[#efefef] hover:bg-white transition-colors">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                <Users size={14} className="text-blue-600" />
              </div>
              <span className="text-[#1f2937] text-xs" style={{ fontWeight: 500 }}>Novo cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ticket médio + top produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#efefef] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <DollarSign size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[#627271] text-xs">Ticket médio hoje</p>
            <p className="text-[#1f2937] text-base" style={{ fontWeight: 700 }}>R$ 104,17</p>
            <p className="text-[#1f2937] text-[11px]" style={{ fontWeight: 500 }}>↑ vs R$ 97,50 ontem</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#efefef] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center">
            <Package size={18} className="text-[#1f2937]" />
          </div>
          <div>
            <p className="text-[#627271] text-xs">Produto mais vendido</p>
            <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>Camiseta Básica</p>
            <p className="text-[#627271] text-[11px]">8 unidades hoje</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#efefef] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Clock size={18} className="text-purple-500" />
          </div>
          <div>
            <p className="text-[#627271] text-xs">Próximo agendamento</p>
            <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>14h00 - Maria</p>
            <p className="text-[#627271] text-[11px]">Corte + Escova</p>
          </div>
        </div>
      </div>

      {/* Onboarding card */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: "#efefef", borderColor: "#efefef" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-[#1f2937]" />
              <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>Configure sua loja</h3>
            </div>
            <p className="text-[#1f2937] text-xs">2 de 5 passos concluídos</p>
          </div>
          <span className="text-[#1f2937] text-xs px-2 py-1 rounded-full bg-white" style={{ fontWeight: 600 }}>
            40%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white mb-4 overflow-hidden">
          <div className="h-full rounded-full bg-[#86cb92]" style={{ width: "40%" }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {[
            { label: "Primeiro produto", done: true },
            { label: "Loja virtual", done: true },
            { label: "WhatsApp Business", done: false },
            { label: "Pagamento online", done: false },
            { label: "Divulgar loja", done: false },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: step.done ? "#86cb92" : "white", border: step.done ? "none" : "2px solid #86cb92" }}
              >
                {step.done && <CheckCircle size={12} className="text-[#1f2937]" />}
              </div>
              <span className="text-xs" style={{ color: step.done ? "#1f2937" : "#627271", fontWeight: step.done ? 600 : 400 }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#86cb92]/40">
          <button className="px-4 py-2 rounded-xl bg-[#86cb92] text-[#1f2937] text-xs hover:bg-[#1f2937] hover:text-white transition-colors" style={{ fontWeight: 600 }}>
            Continuar configuração
          </button>
          <button className="flex items-center gap-1.5 text-[#1f2937] text-xs hover:underline" style={{ fontWeight: 500 }}>
            <AlertTriangle size={12} />
            MEL pode configurar por mim!
          </button>
        </div>
      </div>
    </div>
  );
}