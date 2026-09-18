import { useNavigate } from "react-router";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShoppingBag,
  Zap,
  BarChart2,
  RefreshCw,
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { MOVIMENTACOES, formatCurrency } from "./estoqueMockData";
import { useProdutos } from "../../hooks/use-produtos";

// Usar placeholder até ter a imagem real
const melPortrait = "https://api.dicebear.com/7.x/avataaars/svg?seed=MEL";

const MOVIMENTACAO_DATA = [
  { dia: "Seg", entrada: 45, saida: 32 },
  { dia: "Ter", entrada: 52, saida: 38 },
  { dia: "Qua", entrada: 38, saida: 45 },
  { dia: "Qui", entrada: 65, saida: 42 },
  { dia: "Sex", entrada: 48, saida: 55 },
  { dia: "Sáb", entrada: 72, saida: 68 },
  { dia: "Dom", entrada: 35, saida: 28 },
];

const VALOR_ESTOQUE_DATA = [
  { mes: "Jan", valor: 45000 },
  { mes: "Fev", valor: 52000 },
  { mes: "Mar", valor: 48000 },
  { mes: "Abr", valor: 61000 },
  { mes: "Mai", valor: 58000 },
  { mes: "Jun", valor: 67000 },
];

export function EstoqueDashboardPage() {
  const navigate = useNavigate();

  const { produtos, loading, isFallback, error, recarregar } = useProdutos();

  const totalProdutos = produtos.length;
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.precoVenda * p.estoque), 0);
  const produtosBaixoEstoque = produtos.filter(p => p.estoque <= p.estoqueMinimo).length;
  const produtosSemEstoque = produtos.filter(p => p.estoque === 0).length;

  const movimentacoesRecentes = MOVIMENTACOES.slice(0, 5);
  const produtosCriticos = produtos.filter(p => p.estoque <= p.estoqueMinimo).slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937]">Estoque Dashboard</h1>
          <p className="text-[#627271] mt-1">Gestão e controle de inventário</p>
        </div>
      </div>

      {/* Menu de Contexto */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/estoque/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
          >
            <LayoutDashboard size={18} className="text-[#627271]" />
            <span className="text-sm font-medium text-[#1f2937]">Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/estoque/produtos")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
          >
            <Boxes size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-[#1f2937]">Produtos</span>
          </button>

          <button
            onClick={() => navigate("/estoque/movimentacoes")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
          >
            <ArrowRightLeft size={18} className="text-violet-600" />
            <span className="text-sm font-medium text-[#1f2937]">Movimentações</span>
          </button>

          <button
            onClick={() => navigate("/estoque/produtos")}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#86cb92] text-[#1f2937] rounded-lg hover:bg-[#1f2937] hover:text-white transition-colors"
          >
            <Package size={18} />
            <span className="text-sm font-medium">Novo Produto</span>
          </button>
        </div>
      </div>

      {loading ? (
        /* ── Loading: skeleton do layout ── */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
                <div className="w-12 h-12 bg-[#efefef] rounded-xl animate-pulse mb-4" />
                <div className="h-8 bg-[#efefef] rounded animate-pulse w-1/2 mb-2" />
                <div className="h-4 bg-[#efefef] rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
              <div className="h-6 bg-[#efefef] rounded animate-pulse w-1/3 mb-6" />
              <div className="h-80 bg-[#efefef] rounded animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-[#efefef] shadow-sm h-44 animate-pulse" />
              <div className="bg-white p-5 rounded-xl border border-[#efefef] shadow-sm h-52 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-[#efefef] shadow-sm h-72 animate-pulse" />
            <div className="bg-white p-6 rounded-xl border border-[#efefef] shadow-sm h-72 animate-pulse" />
          </div>
        </div>
      ) : error ? (
        /* ── Error: falha ao carregar os dados reais ── */
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>
            Não foi possível carregar o estoque
          </h3>
          <p className="text-[#627271] text-sm mb-5 max-w-md mx-auto">{error}</p>
          <button
            onClick={recarregar}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#1f2937] text-sm transition-colors hover:bg-[#1f2937] hover:text-white"
            style={{ background: "#86cb92", fontWeight: 600 }}
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {/* Fallback: dados de exemplo (demo sem login / erro em modo demo) */}
          {isFallback && (
            <div className="mb-6 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
              <AlertTriangle size={14} />
              Mostrando dados de exemplo. Cadastre produtos para ver dados reais.
            </div>
          )}

          {/* Empty: empresa real sem produtos cadastrados */}
          {produtos.length === 0 && (
            <div className="mb-6 flex items-center gap-2 px-3 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
              <Package size={16} />
              Nenhum produto cadastrado ainda. Os valores abaixo ficam zerados até o primeiro cadastro.
            </div>
          )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
            <span className="text-sm text-[#627271] font-medium flex items-center gap-1">
              <TrendingUp size={14} /> +5%
            </span>
          </div>
          <p className="text-3xl font-bold text-[#1f2937]">{totalProdutos}</p>
          <p className="text-[#627271] text-sm">Total de Produtos</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#efefef] rounded-xl flex items-center justify-center">
              <DollarSign className="text-[#627271]" size={24} />
            </div>
            <span className="text-sm text-[#627271] font-medium flex items-center gap-1">
              <TrendingUp size={14} /> +12%
            </span>
          </div>
          <p className="text-3xl font-bold text-[#1f2937]">{formatCurrency(valorTotalEstoque)}</p>
          <p className="text-[#627271] text-sm">Valor em Estoque</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
            <span className="text-sm text-red-600 font-medium flex items-center gap-1">
              <TrendingDown size={14} /> Atenção
            </span>
          </div>
          <p className="text-3xl font-bold text-[#1f2937]">{produtosBaixoEstoque}</p>
          <p className="text-[#627271] text-sm">Produtos com Estoque Baixo</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-red-600" size={24} />
            </div>
            <span className="text-sm text-red-600 font-medium">Crítico</span>
          </div>
          <p className="text-3xl font-bold text-[#1f2937]">{produtosSemEstoque}</p>
          <p className="text-[#627271] text-sm">Produtos Sem Estoque</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Movimentação */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
          <h2 className="text-lg font-semibold text-[#1f2937] mb-6">Movimentação de Estoque</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOVIMENTACAO_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="entrada" fill="#86cb92" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saida" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* MEL Card */}
          <div className="bg-gradient-to-br from-[#1f2937] to-[#1f2937] p-5 rounded-xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400">
                <img src={melPortrait} alt="MEL" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold text-sm">MEL · Análise</p>
                <p className="text-xs text-[#627271]">Assistente IA</p>
              </div>
            </div>
            <p className="text-sm text-[#627271] leading-relaxed">
              📦 Você tem {produtosBaixoEstoque} produtos com estoque baixo e {produtosSemEstoque} sem estoque. 
              Considere fazer um pedido de reposição!
            </p>
          </div>

          {/* Valor em Estoque */}
          <div className="bg-white p-5 rounded-xl border border-[#efefef] shadow-sm">
            <h3 className="font-semibold text-[#1f2937] mb-4">Evolução do Valor em Estoque</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={VALOR_ESTOQUE_DATA}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#86cb92" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#86cb92" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Area type="monotone" dataKey="valor" stroke="#86cb92" fillOpacity={1} fill="url(#colorValor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Críticos e Movimentações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Produtos Críticos */}
        <div className="bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1f2937]">Produtos com Estoque Crítico</h3>
            <button 
              onClick={() => navigate("/estoque/produtos")}
              className="text-[#627271] text-sm font-medium flex items-center gap-1 hover:underline"
            >
              Ver todos <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {produtosCriticos.length === 0 ? (
              <p className="text-[#627271] text-center py-6">Nenhum produto com estoque crítico</p>
            ) : (
              produtosCriticos.map((produto) => (
                <div 
                  key={produto.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {produto.foto ? (
                      <img src={produto.foto} alt={produto.nome} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Package size={18} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1f2937] text-sm">{produto.nome}</p>
                    <p className="text-[#627271] text-xs">Código: {produto.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{produto.estoque} un</p>
                    <p className="text-xs text-red-400">Min: {produto.estoqueMinimo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Movimentações Recentes */}
        <div className="bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1f2937]">Movimentações Recentes</h3>
            <button 
              onClick={() => navigate("/estoque/movimentacoes")}
              className="text-[#627271] text-sm font-medium flex items-center gap-1 hover:underline"
            >
              Ver todas <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {movimentacoesRecentes.map((mov) => (
              <div key={mov.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#efefef]">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  mov.tipo === "entrada" ? "bg-[#efefef]" : "bg-red-100"
                }`}>
                  {mov.tipo === "entrada" ? (
                    <TrendingUp size={18} className="text-[#627271]" />
                  ) : (
                    <TrendingDown size={18} className="text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#1f2937] text-sm">{mov.produtoNome}</p>
                  <p className="text-[#627271] text-xs">{mov.tipo === "entrada" ? "Entrada" : "Saída"} · {mov.data}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${mov.tipo === "entrada" ? "text-[#627271]" : "text-red-600"}`}>
                    {mov.tipo === "entrada" ? "+" : "-"}{mov.quantidade}
                  </p>
                  <p className="text-xs text-[#627271]">{mov.motivo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
