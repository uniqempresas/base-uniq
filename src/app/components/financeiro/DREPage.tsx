import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, AlertCircle, RefreshCw } from "lucide-react";
import { CardKPI, AlertaAmigavel } from "./components";
import { dreMock, formatarMoeda } from "./mockData";
import { useDRE } from "../../hooks/use-dre";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export function DREPage() {
  const [periodo, setPeriodo] = useState(() => {
    const agora = new Date();
    return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
  });
  const [mostrarComparativo, setMostrarComparativo] = useState(false);

  const { dre: dreData, loading, error, isFallback } = useDRE(periodo);

  // Usar dados reais ou fallback do mock (só em modo demo)
  const dre = dreData ?? (isFallback ? { ...dreMock, cmvDisponivel: true } : null);
  const isLucro = dre ? dre.lucroLiquido >= 0 : true;

  // Dados para gráfico de pizza (Despesas)
  const dadosDespesas = dre?.categoriasDespesas.map((cat) => ({
    nome: cat.nome,
    valor: cat.valor,
  })) ?? [];

  // Dados para gráfico de barras (Receitas vs Despesas)
  const dadosComparativo = dre ? [
    { nome: "Receitas", valor: dre.receitaBruta },
    { nome: "Despesas", valor: dre.despesasOperacionais + dre.custos },
    { nome: "Lucro/Prejuízo", valor: Math.abs(dre.lucroLiquido) },
  ] : [];

  const COLORS = ["#86cb92", "#627271", "#1f2937", "#86cb92", "#627271"];
  const COLORS_BAR = ["#86cb92", "#ef4444", isLucro ? "#86cb92" : "#ef4444"];

  // Estado: Loading
  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[#1f2937] mb-1">DRE Simples</h1>
            <p className="text-sm text-[#1f2937]">Demonstrativo de Resultados do seu negócio de forma simples</p>
          </div>
          <button disabled className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#efefef] text-[#627271] rounded-xl text-sm cursor-not-allowed">
            <Download size={18} />
            <span style={{ fontWeight: 500 }}>Exportar PDF</span>
          </button>
        </div>
        {/* Skeleton KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#efefef] p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
        {/* Skeleton Tabela DRE */}
        <div className="bg-white rounded-xl border border-[#efefef] p-6 mb-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-48 mb-4"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between py-2 border-b border-[#efefef]">
              <div className="h-4 bg-gray-200 rounded w-40"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
        {/* Skeleton Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#efefef] p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-xl border border-[#efefef] p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Error
  if (error) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[#1f2937] mb-1">DRE Simples</h1>
            <p className="text-sm text-[#1f2937]">Demonstrativo de Resultados do seu negócio de forma simples</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">Erro ao carregar dados financeiros. Tente novamente.</span>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-100 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <RefreshCw size={12} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Estado: Empty real (sessão ativa, banco vazio) — sem dreData e sem fallback
  if (!dre) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[#1f2937] mb-1">DRE Simples</h1>
            <p className="text-sm text-[#1f2937]">Demonstrativo de Resultados do seu negócio de forma simples</p>
          </div>
          <button disabled className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#efefef] text-[#627271] rounded-xl text-sm cursor-not-allowed">
            <Download size={18} />
            <span style={{ fontWeight: 500 }}>Exportar PDF</span>
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-[#efefef]">
          <div className="w-16 h-16 rounded-full bg-[#efefef] flex items-center justify-center mb-4">
            <DollarSign className="w-8 h-8 text-[#627271]" />
          </div>
          <h3 className="text-lg text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>
            Nenhum dado financeiro disponível
          </h3>
          <p className="text-sm text-[#1f2937] mb-6 text-center max-w-md">
            Nenhuma venda ou despesa registrada neste mês. Cadastre pedidos e contas para ver seu DRE.
          </p>
        </div>
      </div>
    );
  }

  // Estado: Success ou Demo (com dre)
  const emptyReal = !isFallback && dre.receitaBruta === 0 && dre.despesasOperacionais === 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#1f2937] mb-1">DRE Simples</h1>
          <p className="text-sm text-[#1f2937]">Demonstrativo de Resultados do seu negócio de forma simples</p>
          {isFallback && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs px-2 py-1 rounded-full bg-[#efefef] text-[#627271]" style={{ fontWeight: 600 }}>
              <AlertCircle size={12} />
              Dados de exemplo
            </span>
          )}
        </div>
        <button
          disabled
          title="Em breve"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#efefef] text-[#627271] rounded-xl text-sm cursor-not-allowed opacity-60"
        >
          <Download size={18} />
          <span style={{ fontWeight: 500 }}>Exportar PDF</span>
        </button>
      </div>

      {/* Estado empty real com sessão */}
      {emptyReal && (
        <div className="mb-6">
          <AlertaAmigavel
            tipo="info"
            titulo="Nenhuma venda ou despesa registrada neste mês"
            mensagem="Cadastre pedidos e contas para ver seu DRE."
          />
        </div>
      )}

      {/* Alerta Lucro/Prejuízo */}
      {!emptyReal && (
        <div className="mb-6">
          {isLucro ? (
            <AlertaAmigavel tipo="success" titulo="Parabéns! Seu negócio teve lucro este mês. 🎉" />
          ) : (
            <AlertaAmigavel
              tipo="warning"
              titulo="Seu resultado foi negativo este mês"
              mensagem="Que tal revisar suas despesas? Veja abaixo onde seu dinheiro está sendo gasto."
            />
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-[#efefef] p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Período */}
          <div>
            <label className="block text-sm text-[#1f2937] mb-1.5" style={{ fontWeight: 500 }}>
              <Calendar size={14} className="inline mr-1" />
              Período
            </label>
            <input
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full px-3 py-2 border border-[#efefef] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#86cb92]"
            />
          </div>

          {/* Comparativo */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarComparativo}
                onChange={(e) => setMostrarComparativo(e.target.checked)}
                className="w-4 h-4 text-[#627271] focus:ring-[#86cb92] rounded"
              />
              <span className="text-sm text-[#1f2937]">Comparar com mês anterior</span>
            </label>
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardKPI
          label="Receitas Totais"
          valor={dre.receitaBruta}
          icon={TrendingUp}
          tipo="positivo"
          comparativo={mostrarComparativo ? 8.3 : undefined}
        />
        <CardKPI
          label="Despesas Totais"
          valor={dre.despesasOperacionais + dre.custos}
          icon={TrendingDown}
          tipo="negativo"
          comparativo={mostrarComparativo ? -3.1 : undefined}
        />
        <CardKPI
          label={isLucro ? "Lucro Líquido" : "Prejuízo"}
          valor={Math.abs(dre.lucroLiquido)}
          icon={DollarSign}
          tipo={isLucro ? "positivo" : "negativo"}
        />
        <div className="bg-white rounded-xl border border-[#efefef] p-4">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm text-[#1f2937]">Margem de Lucro</p>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isLucro ? "bg-[#efefef]" : "bg-red-50"
              }`}
            >
              <DollarSign size={20} className={isLucro ? "text-[#627271]" : "text-red-600"} />
            </div>
          </div>
          <p className={`text-2xl ${isLucro ? "text-[#1f2937]" : "text-red-900"}`} style={{ fontWeight: 600 }}>
            {dre.margemLucro.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Estrutura DRE Simplificada */}
      <div className="bg-white rounded-xl border border-[#efefef] p-6 mb-6">
        <h3 className="text-[#1f2937] mb-4">Demonstrativo do Período</h3>

        <div className="space-y-3">
          {/* Receita Bruta */}
          <div className="flex items-center justify-between py-2 border-b border-[#efefef]">
            <span className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
              Receita Bruta
            </span>
            <span className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
              {formatarMoeda(dre.receitaBruta)}
            </span>
          </div>

          {/* Impostos */}
          <div className="flex items-center justify-between py-2 pl-4 border-b border-[#efefef]">
            <span className="text-sm text-[#1f2937]">(-) Impostos</span>
            <span className="text-sm text-red-600">{formatarMoeda(dre.impostos)}</span>
          </div>

          {/* Receita Líquida */}
          <div className="flex items-center justify-between py-2 bg-[#efefef] px-2 rounded">
            <span className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
              (=) Receita Líquida
            </span>
            <span className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
              {formatarMoeda(dre.receitaLiquida)}
            </span>
          </div>

          {/* Custos */}
          <div className="flex items-center justify-between py-2 pl-4 border-b border-[#efefef]">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#1f2937]">(-) Custos (mercadorias vendidas)</span>
              {!dre.cmvDisponivel && (
                <span className="text-xs text-[#627271]">(Custo dos produtos não cadastrado)</span>
              )}
            </div>
            <span className="text-sm text-red-600">{formatarMoeda(dre.custos)}</span>
          </div>

          {/* Lucro Bruto */}
          <div className="flex items-center justify-between py-2 bg-[#efefef] px-2 rounded">
            <span className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
              (=) Lucro Bruto
            </span>
            <span className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
              {formatarMoeda(dre.lucroBruto)}
            </span>
          </div>

          {/* Despesas Operacionais */}
          <div className="flex items-center justify-between py-2 pl-4 border-b border-[#efefef]">
            <span className="text-sm text-[#1f2937]">(-) Despesas Operacionais</span>
            <span className="text-sm text-red-600">{formatarMoeda(dre.despesasOperacionais)}</span>
          </div>

          {/* Lucro Líquido */}
          <div
            className={`flex items-center justify-between py-3 px-2 rounded ${
              isLucro ? "bg-[#efefef] border border-[#86cb92]" : "bg-red-50 border border-red-200"
            }`}
          >
            <span className={`text-sm ${isLucro ? "text-[#1f2937]" : "text-red-900"}`} style={{ fontWeight: 600 }}>
              (=) {isLucro ? "Lucro Líquido" : "Prejuízo"}
            </span>
            <span className={`text-lg ${isLucro ? "text-[#1f2937]" : "text-red-700"}`} style={{ fontWeight: 700 }}>
              {formatarMoeda(Math.abs(dre.lucroLiquido))}
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Despesas por Categoria */}
        <div className="bg-white rounded-xl border border-[#efefef] p-6">
          <h3 className="text-[#1f2937] mb-4">Despesas por Categoria</h3>
          {dadosDespesas.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosDespesas}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#86cb92"
                    dataKey="valor"
                  >
                    {dadosDespesas.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                </PieChart>
              </ResponsiveContainer>

              {/* Lista de categorias */}
              <div className="mt-4 space-y-2">
                {dre.categoriasDespesas.map((cat, i) => (
                  <div key={cat.nome} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                      <span className="text-[#1f2937]">{cat.nome}</span>
                    </div>
                    <span className="text-[#1f2937]" style={{ fontWeight: 500 }}>
                      {formatarMoeda(cat.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm text-[#627271]">
              Nenhuma despesa registrada neste período.
            </div>
          )}
        </div>

        {/* Gráfico Comparativo */}
        <div className="bg-white rounded-xl border border-[#efefef] p-6">
          <h3 className="text-[#1f2937] mb-4">Visão Geral</h3>
          {dadosComparativo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosComparativo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#efefef" />
                <XAxis dataKey="nome" tick={{ fontSize: 12 }} stroke="#627271" />
                <YAxis tick={{ fontSize: 12 }} stroke="#627271" />
                <Tooltip
                  formatter={(value: number) => formatarMoeda(value)}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #efefef", borderRadius: "8px" }}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {dadosComparativo.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_BAR[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm text-[#627271]">
              Sem dados para exibir.
            </div>
          )}

          {/* Explicação didática */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>💡 Como entender este gráfico:</strong>
              <br />
              Quanto maior a barra verde (Receitas) em relação à vermelha (Despesas), melhor! A terceira barra mostra
              seu resultado final.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
