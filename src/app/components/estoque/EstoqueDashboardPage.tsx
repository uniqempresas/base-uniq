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
  User,
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
import { formatCurrency } from "./estoqueMockData";
import { useProdutos } from "../../hooks/use-produtos";
import { useMovimentacoes } from "../../hooks/use-movimentacoes";
import { formatarDataMovimentacao } from "../../lib/estoque-utils";
import type { MovTipo } from "../../types/estoque";

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

/**
 * Pill de tipo (Entrada/Saída) — gramática visual do StatusBadge de
 * /vendas/pedidos (Pill rounded-full text-xs border, peso 600), com as cores
 * locais do módulo estoque: verde #86cb92 para entrada, vermelho para saída.
 */
function TipoMovBadge({ tipo }: { tipo: MovTipo }) {
  const entrada = tipo === "entrada";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border whitespace-nowrap ${
        entrada
          ? "bg-[#86cb92] text-[#1f2937] border-[#86cb92]"
          : "bg-red-50 text-red-600 border-red-200"
      }`}
      style={{ fontWeight: 600 }}
    >
      {entrada ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {entrada ? "Entrada" : "Saída"}
    </span>
  );
}

export function EstoqueDashboardPage() {
  const navigate = useNavigate();

  const { produtos, loading, isFallback, error, recarregar } = useProdutos();
  // B14: "Movimentações recentes" reais (5 mais recentes por data_movimentacao);
  // demo (sem sessão) recebe o mock via isFallback do próprio hook. Gráficos seguem mock (fora de escopo).
  const {
    movimentacoes,
    loading: movLoading,
    error: movError,
    recarregar: recarregarMov,
  } = useMovimentacoes();

  const totalProdutos = produtos.length;
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.precoVenda * p.estoque), 0);
  const produtosBaixoEstoque = produtos.filter(p => p.estoque <= p.estoqueMinimo).length;
  const produtosSemEstoque = produtos.filter(p => p.estoque === 0).length;

  const movimentacoesRecentes = movimentacoes.slice(0, 5);
  const produtosCriticos = produtos.filter(p => p.estoque <= p.estoqueMinimo).slice(0, 5);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-[#1f2937]">Estoque Dashboard</h1>
          <p className="text-[#627271] mt-1 text-sm md:text-base">Gestão e controle de inventário</p>
        </div>
      </div>

      {/*
        Menu de Contexto — mobile: wrap + alvo de toque ≥ 44px (min-h só abaixo de
        md; em md+ min-h-0 devolve a altura natural de antes). CTA vira full-width
        no mobile (w-full) e volta ao comportamento original (ml-auto) em md+.
      */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/estoque/dashboard")}
            className="flex min-h-[44px] md:min-h-0 items-center gap-2 px-4 py-2 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
          >
            <LayoutDashboard size={18} className="text-[#627271]" />
            <span className="text-sm font-medium text-[#1f2937]">Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/estoque/produtos")}
            className="flex min-h-[44px] md:min-h-0 items-center gap-2 px-4 py-2 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
          >
            <Boxes size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-[#1f2937]">Produtos</span>
          </button>

          <button
            onClick={() => navigate("/estoque/movimentacoes")}
            className="flex min-h-[44px] md:min-h-0 items-center gap-2 px-4 py-2 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
          >
            <ArrowRightLeft size={18} className="text-violet-600" />
            <span className="text-sm font-medium text-[#1f2937]">Movimentações</span>
          </button>

          <button
            onClick={() => navigate("/estoque/produtos")}
            className="ml-auto flex min-h-[44px] md:min-h-0 w-full md:w-auto justify-center md:justify-start items-center gap-2 px-4 py-2 bg-[#86cb92] text-[#1f2937] rounded-lg hover:bg-[#1f2937] hover:text-white transition-colors"
          >
            <Package size={18} />
            <span className="text-sm font-medium">Novo Produto</span>
          </button>
        </div>
      </div>

      {(loading || movLoading) ? (
        /* ── Loading: skeleton do layout (KPIs compactos 2-col seguem o mobile real) ── */
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-4 md:p-6 rounded-xl border border-[#efefef] shadow-sm">
                <div className="w-12 h-12 bg-[#efefef] rounded-xl animate-pulse mb-4" />
                <div className="h-8 bg-[#efefef] rounded animate-pulse w-1/2 mb-2" />
                <div className="h-4 bg-[#efefef] rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="hidden md:block lg:col-span-2 bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
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
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 md:p-12 text-center">
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

          {/*
            KPIs mobile — gramática dos KPIs compactos de /vendas/pedidos:
            2 colunas, p-3, label com ícone 14px, valor text-lg bold, legenda
            10px. Os "+x%" fake ficam só no desktop (mobile é enxuto).
          */}
          <div className="md:hidden grid grid-cols-2 gap-2 mb-6">
            <div className="bg-white rounded-xl border border-[#efefef] p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <Package size={14} className="text-blue-600 shrink-0" />
                <span className="text-xs text-[#627271] truncate">Total de Produtos</span>
              </div>
              <p className="text-lg text-[#1f2937] truncate" style={{ fontWeight: 700 }}>
                {totalProdutos}
              </p>
              <p className="text-[10px] text-[#627271]">cadastrados</p>
            </div>

            <div className="bg-white rounded-xl border border-[#efefef] p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign size={14} className="text-[#627271] shrink-0" />
                <span className="text-xs text-[#627271] truncate">Valor em Estoque</span>
              </div>
              <p className="text-lg text-[#1f2937] truncate" style={{ fontWeight: 700 }}>
                {formatCurrency(valorTotalEstoque)}
              </p>
              <p className="text-[10px] text-[#627271]">a preço de venda</p>
            </div>

            <div className="bg-white rounded-xl border border-[#efefef] p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <span className="text-xs text-[#627271] truncate">Estoque baixo</span>
              </div>
              <p className="text-lg text-[#1f2937] truncate" style={{ fontWeight: 700 }}>
                {produtosBaixoEstoque}
              </p>
              <p className="text-[10px] text-[#627271]">abaixo do mínimo</p>
            </div>

            <div className="bg-white rounded-xl border border-[#efefef] p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <ShoppingBag size={14} className="text-red-600 shrink-0" />
                <span className="text-xs text-[#627271] truncate">Sem Estoque</span>
              </div>
              <p className="text-lg text-[#1f2937] truncate" style={{ fontWeight: 700 }}>
                {produtosSemEstoque}
              </p>
              <p className="text-[10px] text-[#627271]">zerados</p>
            </div>
          </div>

          {/* Stats Grid — desktop/tablet (md+): exatamente como antes */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

          {/*
            Conteúdo — ordem mobile: KPIs → Movimentações → Críticos → MEL.
            No DOM, a seção "Mov+Críticos" vem primeiro (ordem mobile natural) e
            md:order devolve o empilhamento original (Gráficos/Sidebar → Críticos/Mov)
            para tablet e desktop — renderização idêntica à de antes em md+.
            Sem return condicional por breakpoint: só classes CSS.
          */}
          <div className="flex flex-col gap-6">
            {/* Movimentações + Críticos */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 md:order-2">
              {/*
                Movimentações Recentes — mobile: cards full-width com divide-y
                (gramática Pedidos); md+: lista original intocada (hidden md:block).
                Estados error/empty seguem compartilhados entre os dois renders.
              */}
              <div className="md:order-2 bg-white p-4 md:p-6 rounded-xl border border-[#efefef] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#1f2937]">Movimentações Recentes</h3>
                  <button 
                    onClick={() => navigate("/estoque/movimentacoes")}
                    className="text-[#627271] text-sm font-medium flex items-center gap-1 hover:underline px-2 py-2.5 -mx-2 -my-2.5 md:p-0 md:m-0"
                  >
                    Ver todas <ArrowRight size={16} />
                  </button>
                </div>
                {movError ? (
                  /* Error da seção (não derruba o dashboard) */
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-red-600 text-xs" style={{ fontWeight: 500 }}>
                      Não foi possível carregar as movimentações.
                    </p>
                    <button
                      onClick={recarregarMov}
                      className="flex items-center gap-1 px-2 py-2 -my-2 text-[#1f2937] text-xs shrink-0 md:p-0 md:m-0"
                      style={{ fontWeight: 600 }}
                    >
                      <RefreshCw size={12} />
                      Tentar novamente
                    </button>
                  </div>
                ) : movimentacoesRecentes.length === 0 ? (
                  /* Empty real (WIRE §3) */
                  <p className="text-[#627271] text-center py-6">Sem movimentações ainda</p>
                ) : (
                  <>
                    {/* Mobile (<md): cards full-width, divide-y — tipo + produto | qtd com sinal / quando · motivo | responsável */}
                    <div className="md:hidden -mx-4 divide-y divide-[#efefef]">
                      {movimentacoesRecentes.map((mov) => {
                        const quando = formatarDataMovimentacao(mov.data);
                        return (
                          <div
                            key={mov.id}
                            className="px-4 py-3 active:bg-[#efefef]/50 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <TipoMovBadge tipo={mov.tipo} />
                                <p
                                  className="text-sm text-[#1f2937] truncate"
                                  style={{ fontWeight: 500 }}
                                >
                                  {mov.produtoNome}
                                </p>
                              </div>
                              <p
                                className={`shrink-0 text-sm ${
                                  mov.tipo === "entrada" ? "text-[#1f2937]" : "text-red-600"
                                }`}
                                style={{ fontWeight: 700 }}
                              >
                                {mov.tipo === "entrada" ? "+" : "-"}
                                {mov.quantidade}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <p className="min-w-0 text-xs text-[#627271] truncate">
                                {quando.data}
                                {quando.hora ? ` ${quando.hora}` : ""} · {mov.motivo || "—"}
                              </p>
                              {mov.responsavel && (
                                <p className="flex max-w-[40%] shrink-0 items-center gap-1 text-[11px] text-[#627271]">
                                  <User size={11} className="shrink-0" aria-hidden="true" />
                                  <span className="truncate">{mov.responsavel}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* md+: render original (desktop/tablet intocado) */}
                    <div className="hidden md:block space-y-3">
                      {movimentacoesRecentes.map((mov) => {
                        const quando = formatarDataMovimentacao(mov.data);
                        return (
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
                              <p className="text-[#627271] text-xs">
                                {mov.tipo === "entrada" ? "Entrada" : "Saída"} · {quando.data}{quando.hora ? ` ${quando.hora}` : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${mov.tipo === "entrada" ? "text-[#627271]" : "text-red-600"}`}>
                                {mov.tipo === "entrada" ? "+" : "-"}{mov.quantidade}
                              </p>
                              <p className="text-xs text-[#627271]">{mov.motivo || "—"}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Produtos Críticos — mesma lista; no mobile só densidade (p-4, espaço 2) */}
              <div className="md:order-1 bg-white p-4 md:p-6 rounded-xl border border-[#efefef] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#1f2937]">Produtos com Estoque Crítico</h3>
                  <button 
                    onClick={() => navigate("/estoque/produtos")}
                    className="text-[#627271] text-sm font-medium flex items-center gap-1 hover:underline px-2 py-2.5 -mx-2 -my-2.5 md:p-0 md:m-0"
                  >
                    Ver todos <ArrowRight size={16} />
                  </button>
                </div>
                <div className="space-y-2 md:space-y-3">
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
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1f2937] text-sm max-md:truncate">{produto.nome}</p>
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
            </div>

            {/* Main Content Grid — md+ primeiro (como hoje); mobile: só MEL sobra (gráficos ocultos <md) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:order-1">
              {/* Gráfico de Movimentação — mobile: oculto (em ~360px compete com saldo/ação; md+ idêntico a antes) */}
              <div className="hidden md:block lg:col-span-2 bg-white p-6 rounded-xl border border-[#efefef] shadow-sm">
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
                {/* MEL Card — conteúdo intacto; mobile: p-4 e texto um degrau menor */}
                <div className="bg-gradient-to-br from-[#1f2937] to-[#1f2937] p-4 md:p-5 rounded-xl text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400">
                      <img src={melPortrait} alt="MEL" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">MEL · Análise</p>
                      <p className="text-xs text-[#627271]">Assistente IA</p>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-[#627271] leading-relaxed">
                    📦 Você tem {produtosBaixoEstoque} produtos com estoque baixo e {produtosSemEstoque} sem estoque. 
                    Considere fazer um pedido de reposição!
                  </p>
                </div>

                {/* Valor em Estoque — gráfico: oculto no mobile (<md), idêntico em md+ */}
                <div className="hidden md:block bg-white p-5 rounded-xl border border-[#efefef] shadow-sm">
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
          </div>
        </>
      )}
    </div>
  );
}
