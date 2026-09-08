import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Share2,
  RefreshCw,
  DollarSign,
  ShoppingBag,
  BarChart2,
  Users,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getChartData,
  getChannelData,
  getPaymentData,
  getTopProducts,
  getWeekdayData,
  formatCurrency,
} from "./pedidosMockData";

const PERIODO_OPTIONS = [
  { value: "hoje", label: "Hoje" },
  { value: "7dias", label: "Últimos 7 dias" },
  { value: "30dias", label: "Últimos 30 dias" },
  { value: "mes", label: "Este mês" },
  { value: "mes_ant", label: "Mês anterior" },
];

const CANAL_OPTIONS = [
  { value: "todos", label: "Todos os canais" },
  { value: "pdv", label: "PDV" },
  { value: "loja", label: "Loja Virtual" },
  { value: "whatsapp", label: "WhatsApp" },
];

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
  subtitle?: string;
  trend: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}) {
  const isPos = trend >= 0;
  return (
    <div className="bg-white rounded-2xl border border-[#efefef] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#627271]">{title}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={17} style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-[#1f2937]" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-[#627271] mt-0.5">{subtitle}</p>}
      <div className="flex items-center gap-1 mt-3">
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

const CustomTooltipLine = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#efefef] rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="text-[#627271] mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontWeight: 700 }}>
            {p.name === "valor" ? formatCurrency(p.value) : `${p.value} pedidos`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomTooltipBar = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#efefef] rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="text-[#627271] mb-1">{label}</p>
        <p style={{ color: "#1f2937", fontWeight: 700 }}>{formatCurrency(payload[0].value)}</p>
        <p className="text-[#627271]">{payload[1]?.value} pedidos</p>
      </div>
    );
  }
  return null;
};

export function RelatoriosVendasPage() {
  const [periodo, setPeriodo] = useState("30dias");
  const [canal, setCanal] = useState("todos");

  const chartData = useMemo(() => {
    const full = getChartData();
    if (periodo === "hoje") return full.slice(-1);
    if (periodo === "7dias") return full.slice(-7);
    return full.slice(-30);
  }, [periodo]);

  const channelData = getChannelData();
  const paymentData = getPaymentData();
  const topProducts = getTopProducts();
  const weekdayData = getWeekdayData();

  // KPI values
  const totalVendas = (chartData || []).reduce((s, d) => s + d.valor, 0);
  const totalPedidos = (chartData || []).reduce((s, d) => s + d.pedidos, 0);
  const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0;
  const totalClientes = Math.round(totalPedidos * 0.85);

  const melInsight = useMemo(() => {
    const insights = [
      `Sua sexta-feira é o dia mais forte! Você vende ${Math.round(((weekdayData[5].valor - weekdayData[0].valor) / weekdayData[0].valor) * 100)}% mais que no domingo. Aproveite para fazer promoções na quinta! 🔥`,
      `O PIX é o método favorito dos seus clientes (${paymentData[0].value}% das vendas). Ótimo sinal de que seu checkout está fluindo! ✅`,
      `Tênis Running Profissional é seu campeão de vendas! Já pensou em criar um kit com meia ou bermuda? 👟`,
      `${Math.round(((totalVendas - totalVendas * 0.83) / (totalVendas * 0.83)) * 100)}% de crescimento comparado ao período anterior. Você está no caminho certo, continue! 🚀`,
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: 20 }}>
            Relatórios de Vendas
          </h1>
          <p className="text-sm text-[#627271] mt-0.5">Análise completa da performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-[#efefef] text-[#1f2937] hover:bg-[#efefef] transition-colors"
            onClick={() => { toast.success("Dados atualizados!"); }}
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-[#efefef] text-[#1f2937] hover:bg-[#efefef] transition-colors"
            onClick={() => { toast.success("Relatório exportado com sucesso!"); }}
          >
            <Download size={13} />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-[#efefef] text-[#1f2937] hover:bg-[#efefef] transition-colors"
            onClick={() => { toast.success("Link de compartilhamento copiado!"); }}
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#efefef] p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative">
          <select
            className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-[#efefef] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86cb92]/30 bg-[#efefef] text-[#1f2937]"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            {PERIODO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-[#efefef] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#86cb92]/30 bg-[#efefef] text-[#1f2937]"
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
          >
            {CANAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-[#627271]">
          <div className="w-2 h-2 rounded-full bg-[#86cb92] animate-pulse" />
          Dados atualizados agora
        </div>
      </div>

      {/* MEL Insight */}
      <div
        className="flex items-start gap-3 p-4 rounded-2xl border"
        style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
      >
        <Sparkles size={16} style={{ color: "#7C3AED", flexShrink: 0, marginTop: 1 }} />
        <div>
          <p className="text-xs" style={{ color: "#6D28D9", fontWeight: 700 }}>
            Insight da MEL 🤖
          </p>
          <p className="text-xs text-purple-700 mt-0.5">{melInsight}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Total vendido"
          value={formatCurrency(totalVendas)}
          trend={20}
          icon={DollarSign}
          iconColor="#86cb92"
          iconBg="#efefef"
        />
        <KpiCard
          title="Pedidos realizados"
          value={String(totalPedidos)}
          trend={14}
          icon={ShoppingBag}
          iconColor="#0284C7"
          iconBg="#F0F9FF"
        />
        <KpiCard
          title="Ticket médio"
          value={formatCurrency(ticketMedio)}
          trend={5}
          icon={BarChart2}
          iconColor="#7C3AED"
          iconBg="#F5F3FF"
        />
        <KpiCard
          title="Clientes únicos"
          value={String(totalClientes)}
          subtitle="compraram no período"
          trend={11}
          icon={Users}
          iconColor="#D97706"
          iconBg="#FFFBEB"
        />
      </div>

      {/* Sales evolution chart */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>
              Evolução de vendas
            </p>
            <p className="text-xs text-[#627271] mt-0.5">Faturamento diário no período</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#627271]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full bg-[#86cb92] inline-block" />
              Faturamento
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#efefef" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#627271" }}
              tickLine={false}
              axisLine={false}
              interval={periodo === "30dias" ? 4 : periodo === "7dias" ? 0 : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#627271" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              width={40}
            />
            <Tooltip content={<CustomTooltipLine />} />
            <Line
              type="monotone"
              dataKey="valor"
              name="valor"
              stroke="#86cb92"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#86cb92" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Middle row: channel + payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sales by channel */}
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
          <p className="text-[#1f2937] mb-1" style={{ fontWeight: 700 }}>
            Vendas por canal
          </p>
          <p className="text-xs text-[#627271] mb-5">Origem dos seus pedidos</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, ""]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #efefef", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {channelData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs text-[#1f2937]">{item.name}</span>
                  </div>
                  <div className="flex-1 mx-2 h-1.5 rounded-full bg-[#efefef] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.value}%`, background: item.color }}
                    />
                  </div>
                  <span className="text-xs shrink-0" style={{ fontWeight: 700, color: item.color }}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
          <p className="text-[#1f2937] mb-1" style={{ fontWeight: 700 }}>
            Formas de pagamento
          </p>
          <p className="text-xs text-[#627271] mb-5">Como seus clientes pagam</p>
          <div className="space-y-3">
            {paymentData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-xs text-[#1f2937] w-28 shrink-0">{item.name}</span>
                <div className="flex-1 h-2 rounded-full bg-[#efefef] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.value}%`, background: item.color }}
                  />
                </div>
                <span
                  className="text-xs w-8 text-right shrink-0"
                  style={{ fontWeight: 700, color: item.color }}
                >
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales by weekday */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>
              Vendas por dia da semana
            </p>
            <p className="text-xs text-[#627271] mt-0.5">Descubra seus dias mais fortes</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekdayData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#efefef" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#627271" }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: "#627271" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              width={40}
            />
            <Tooltip content={<CustomTooltipBar />} cursor={{ fill: "#efefef" }} />
            <Bar dataKey="valor" fill="#86cb92" radius={[6, 6, 0, 0]} />
            <Bar dataKey="pedidos" fill="#627271" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 justify-center text-xs text-[#627271]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-[#86cb92] inline-block" />
            Faturamento
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-[#efefef] inline-block" />
            Pedidos
          </span>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#efefef] flex items-center justify-between">
          <div>
            <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>
              Top produtos vendidos
            </p>
            <p className="text-xs text-[#627271] mt-0.5">Produtos com maior receita no período</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#efefef]">
                <th className="px-5 py-3 text-left text-xs text-[#627271] w-8" style={{ fontWeight: 600 }}>
                  #
                </th>
                <th className="px-5 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>
                  Produto
                </th>
                <th className="px-5 py-3 text-right text-xs text-[#627271] whitespace-nowrap" style={{ fontWeight: 600 }}>
                  Vendas
                </th>
                <th className="px-5 py-3 text-right text-xs text-[#627271] whitespace-nowrap" style={{ fontWeight: 600 }}>
                  Receita
                </th>
                <th className="px-5 py-3 text-right text-xs text-[#627271] hidden md:table-cell" style={{ fontWeight: 600 }}>
                  vs anterior
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {topProducts.map((p, i) => {
                const maxTotal = topProducts[0].total;
                const isPositive = p.variacao.startsWith("+");
                return (
                  <tr key={p.nome} className="hover:bg-[#efefef]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                        style={{
                          background: i === 0 ? "#FFFBEB" : i === 1 ? "#F5F3FF" : i === 2 ? "#F0F9FF" : "#efefef",
                          color: i === 0 ? "#D97706" : i === 1 ? "#7C3AED" : i === 2 ? "#0284C7" : "#627271",
                          fontWeight: 800,
                        }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
                          {p.nome}
                        </p>
                        <div className="w-full max-w-[200px] h-1 rounded-full bg-[#efefef] mt-1.5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(p.total / maxTotal) * 100}%`,
                              background: i === 0 ? "#D97706" : "#86cb92",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[#1f2937] text-sm">{p.vendas} un</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
                        {formatCurrency(p.total)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden md:table-cell">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: isPositive ? "#efefef" : "#FEF2F2",
                          color: isPositive ? "#1f2937" : "#DC2626",
                          fontWeight: 600,
                        }}
                      >
                        {p.variacao}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
