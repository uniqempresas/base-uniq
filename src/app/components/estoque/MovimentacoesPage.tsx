import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Download,
  Search,
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { startOfDay, startOfMonth, subDays } from "date-fns";
import { type MovTipo, type MovMotivo } from "./estoqueMockData";
import { useMovimentacoes } from "../../hooks/use-movimentacoes";
import { useProdutos } from "../../hooks/use-produtos";
import { formatarDataMovimentacao } from "../../lib/estoque-utils";
import { AjustarEstoqueModal } from "./AjustarEstoqueModal";

const PERIODOS = ["Hoje", "Ontem", "Últimos 7 dias", "Últimos 30 dias", "Mês atual", "Personalizado"];
const MOTIVOS_ENTRADA: MovMotivo[] = ["Compra", "Devolução", "Ajuste", "Inventário", "Outro"];
const MOTIVOS_SAIDA: MovMotivo[] = ["Venda", "Ajuste", "Perda", "Quebra", "Doação", "Outro"];
const TODOS_MOTIVOS = [...new Set([...MOTIVOS_ENTRADA, ...MOTIVOS_SAIDA])];

/** Filtro de período client-side sobre `data_movimentacao` (WIRE §2). */
function dentroDoPeriodo(iso: string, periodo: string): boolean {
  if (periodo === "Personalizado") return true;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return true;
  const hoje = startOfDay(new Date());
  switch (periodo) {
    case "Hoje":
      return d >= hoje;
    case "Ontem":
      return d >= subDays(hoje, 1) && d < hoje;
    case "Últimos 7 dias":
      return d >= subDays(hoje, 6);
    case "Últimos 30 dias":
      return d >= subDays(hoje, 29);
    case "Mês atual":
      return d >= startOfMonth(new Date());
    default:
      return true;
  }
}

/* Skeleton de linhas da tabela (padrão do módulo) */
function SkeletonMovimentacoes() {
  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#efefef] bg-[#efefef]">
        <div className="h-3 w-1/3 bg-[#e0e0e0] rounded animate-pulse" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-4 py-4 border-b border-[#efefef] flex items-center gap-4">
          <div className="h-3 w-20 bg-[#efefef] rounded animate-pulse" />
          <div className="h-5 w-16 bg-[#efefef] rounded-lg animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 bg-[#efefef] rounded animate-pulse" />
            <div className="h-2 w-1/3 bg-[#efefef] rounded animate-pulse" />
          </div>
          <div className="h-3 w-10 bg-[#efefef] rounded animate-pulse" />
          <div className="h-5 w-14 bg-[#efefef] rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function MovimentacoesPage() {
  const navigate = useNavigate();

  // B14: extrato REAL — mock só em modo demo (sem sessão), com banner de fallback
  const { movimentacoes, loading, error, isFallback, recarregar } = useMovimentacoes();
  const { produtos } = useProdutos();

  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "entrada" | "saida">("todos");
  const [motivoFiltro, setMotivoFiltro] = useState("Todos");
  const [periodo, setPeriodo] = useState("Últimos 7 dias");
  const [showFiltros, setShowFiltros] = useState(false);
  const [showModal, setShowModal] = useState<null | MovTipo>(null);

  const filtradas = movimentacoes.filter((m) => {
    const matchBusca =
      !busca ||
      m.produtoNome.toLowerCase().includes(busca.toLowerCase()) ||
      m.produtoSku.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = tipoFiltro === "todos" || m.tipo === tipoFiltro;
    const matchMotivo = motivoFiltro === "Todos" || m.motivo === motivoFiltro;
    // Demo: as datas do mock são ilustrativas (2024) — não fazem sentido contra um
    // período relativo; no real o filtro de período vale (WIRE §2).
    const matchPeriodo = isFallback || dentroDoPeriodo(m.data, periodo);
    return matchBusca && matchTipo && matchMotivo && matchPeriodo;
  });

  const totalEntradas = filtradas.filter((m) => m.tipo === "entrada").reduce((a, m) => a + m.quantidade, 0);
  const totalSaidas = filtradas.filter((m) => m.tipo === "saida").reduce((a, m) => a + m.quantidade, 0);
  const saldo = totalEntradas - totalSaidas;
  const eventosEntradas = filtradas.filter((m) => m.tipo === "entrada").length;
  const eventosSaidas = filtradas.filter((m) => m.tipo === "saida").length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {showModal && (
        <AjustarEstoqueModal
          // Modo extrato: busca client-side sobre useProdutos (SPEC §5.1)
          produtos={produtos.filter((p) => p.status === "ativo")}
          tipoInicial={showModal}
          onClose={() => setShowModal(null)}
          onSuccess={() => {
            const tipo = showModal;
            setShowModal(null);
            recarregar();
            toast.success(tipo === "saida" ? "Saída registrada com sucesso!" : "Entrada registrada com sucesso!");
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
            Movimentações de Estoque
          </h1>
          <p className="text-[#627271] text-sm">{filtradas.length} registros · {periodo}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs hover:bg-[#efefef]"
            style={{ fontWeight: 500 }}
          >
            <Download size={13} />
            Exportar
          </button>
          <button
            onClick={() => setShowModal("saida")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border"
            style={{ background: "#FEF2F2", color: "#B91C1C", borderColor: "#FECACA", fontWeight: 600 }}
          >
            <ArrowDownCircle size={15} />
            Nova Saída
          </button>
          <button
            onClick={() => setShowModal("entrada")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
          >
            <ArrowUpCircle size={15} />
            Nova Entrada
          </button>
        </div>
      </div>

      {/* Loading: skeleton (padrão do módulo) */}
      {loading ? (
        <SkeletonMovimentacoes />
      ) : error ? (
        /* Error: banner + retry (padrão dos irmãos do estoque) */
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>
            Não foi possível carregar as movimentações
          </h3>
          <p className="text-[#627271] text-sm mb-5 max-w-md mx-auto">{error}</p>
          <button
            onClick={recarregar}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#1f2937] text-sm transition-colors"
            style={{ background: "#86cb92", fontWeight: 600 }}
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {/* Fallback demo: mock + banner (mock-first de 07/09/2026) */}
          {isFallback && (
            <div className="mb-5 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
              <AlertTriangle size={14} />
              Mostrando dados de exemplo. Registre movimentações reais com o modal acima.
            </div>
          )}

          {/* Resumo do período — unidades e eventos (sem R$: não inventar custo) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total entradas", value: `+${totalEntradas} un`, sub: `${eventosEntradas} registros`, icon: ArrowUpCircle, color: "#86cb92", bg: "#efefef" },
              { label: "Total saídas", value: `-${totalSaidas} un`, sub: `${eventosSaidas} registros`, icon: ArrowDownCircle, color: "#EF4444", bg: "#FEF2F2" },
              { label: "Saldo do período", value: `${saldo >= 0 ? "+" : ""}${saldo} un`, sub: saldo >= 0 ? "Estoque cresceu" : "Estoque diminuiu", icon: saldo >= 0 ? TrendingUp : TrendingDown, color: saldo >= 0 ? "#1f2937" : "#B91C1C", bg: saldo >= 0 ? "#efefef" : "#FEF2F2" },
              { label: "Movimentações", value: filtradas.length, sub: `${filtradas.filter((m) => !m.cancelada).length} ativas`, icon: RefreshCw, color: "#8B5CF6", bg: "#F5F3FF" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-[#efefef]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                      <Icon size={16} style={{ color: s.color }} />
                    </div>
                  </div>
                  <p className="text-[#627271] text-xs mb-0.5">{s.label}</p>
                  <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{s.value}</p>
                  <p className="text-xs text-[#627271] mt-0.5">{s.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Filtros (client-side sobre a lista carregada — tabela pequena, sem paginação) */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4 mb-5">
            <div className="flex flex-wrap gap-3">
              {/* Busca */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar produto ou SKU..."
                  aria-label="Buscar produto ou SKU"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-[#efefef]"
                />
              </div>

              {/* Tipo */}
              <div className="flex border border-[#efefef] rounded-xl overflow-hidden bg-[#efefef] shrink-0" role="group" aria-label="Filtrar por tipo">
                {(["todos", "entrada", "saida"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipoFiltro(t)}
                    aria-pressed={tipoFiltro === t}
                    className="px-3 py-2 text-xs transition-all capitalize"
                    style={{
                      background: tipoFiltro === t ? "white" : "transparent",
                      color:
                        tipoFiltro === t
                          ? t === "entrada" ? "#1f2937" : t === "saida" ? "#B91C1C" : "#1f2937"
                          : "#627271",
                      fontWeight: tipoFiltro === t ? 700 : 400,
                      boxShadow: tipoFiltro === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    {t === "entrada" ? "↑ Entrada" : t === "saida" ? "↓ Saída" : "Todos"}
                  </button>
                ))}
              </div>

              {/* Período */}
              <div className="relative shrink-0">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" />
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  aria-label="Filtrar por período"
                  className="pl-8 pr-8 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] appearance-none bg-white"
                  style={{ fontWeight: 500 }}
                >
                  {PERIODOS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFiltros(!showFiltros)}
                aria-expanded={showFiltros}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] text-[#1f2937] text-sm hover:bg-[#efefef] shrink-0"
                style={{ fontWeight: 500 }}
              >
                <Filter size={14} />
                Filtros
              </button>
            </div>

            {showFiltros && (
              <div className="mt-4 pt-4 border-t border-[#efefef]">
                <div>
                  <label className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>Motivo</label>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por motivo">
                    {["Todos", ...TODOS_MOTIVOS].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMotivoFiltro(m)}
                        aria-pressed={motivoFiltro === m}
                        className="px-3 py-1 rounded-lg text-xs transition-all"
                        style={{
                          background: motivoFiltro === m ? "#efefef" : "#efefef",
                          color: motivoFiltro === m ? "#1f2937" : "#627271",
                          border: motivoFiltro === m ? "1px solid #86cb92" : "1px solid transparent",
                          fontWeight: motivoFiltro === m ? 600 : 400,
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lista */}
          {movimentacoes.length === 0 ? (
            /* Empty REAL (sessão, 0 registros) — nunca mock com sessão */
            <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
              <Package size={32} className="text-[#627271] mx-auto mb-3" />
              <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>Nenhuma movimentação registrada ainda</h3>
              <p className="text-[#627271] text-sm mb-5">
                Use Nova Entrada/Saída ou o ajuste no detalhe do produto.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowModal("entrada")}
                  className="px-5 py-2.5 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
                >
                  Nova Entrada/Saída
                </button>
              </div>
            </div>
          ) : filtradas.length === 0 ? (
            /* Empty filtrado */
            <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
              <Search size={32} className="text-[#627271] mx-auto mb-3" />
              <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>Nenhuma movimentação para os filtros atuais.</h3>
              <p className="text-[#627271] text-sm">Tente ajustar o período, o tipo ou a busca.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#efefef] bg-[#efefef]">
                      {/* D4/B14: coluna "Ações" (botão Cancelar morto) removida */}
                      {["Data/Hora", "Tipo", "Produto", "Qtd.", "Motivo", "Responsável", "Obs."].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[#627271] text-xs whitespace-nowrap" style={{ fontWeight: 600 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map((m) => {
                      const quando = formatarDataMovimentacao(m.data);
                      return (
                        <tr
                          key={m.id}
                          className="border-b border-[#efefef] hover:bg-[#efefef]/50 transition-colors"
                          style={{ opacity: m.cancelada ? 0.5 : 1 }}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-[#1f2937] text-xs whitespace-nowrap" style={{ fontWeight: 600 }}>
                                {quando.data}
                              </p>
                              <p className="text-[#627271] text-[10px]">{quando.hora}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                              style={{
                                background: m.tipo === "entrada" ? "#efefef" : "#FEF2F2",
                                color: m.tipo === "entrada" ? "#1f2937" : "#B91C1C",
                                fontWeight: 600,
                              }}
                            >
                              {m.tipo === "entrada" ? (
                                <ArrowUpCircle size={12} />
                              ) : (
                                <ArrowDownCircle size={12} />
                              )}
                              {m.tipo === "entrada" ? "Entrada" : "Saída"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/estoque/produtos/${m.produtoId}`)}
                              className="text-left hover:text-[#1f2937] transition-colors"
                            >
                              <p className="text-[#1f2937] text-xs whitespace-nowrap" style={{ fontWeight: 600 }}>
                                {m.produtoNome}
                              </p>
                              <p className="text-[#627271] text-[10px] font-mono">{m.produtoSku}</p>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-sm"
                              style={{ fontWeight: 700, color: m.tipo === "entrada" ? "#1f2937" : "#EF4444" }}
                            >
                              {m.tipo === "entrada" ? "+" : "-"}{m.quantidade}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full bg-[#efefef] text-[#1f2937]"
                              style={{ fontWeight: 500 }}
                            >
                              {m.motivo || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#1f2937] text-xs whitespace-nowrap">
                            {m.responsavel || "—"}
                          </td>
                          <td className="px-4 py-3 text-[#627271] text-xs max-w-[180px]">
                            <p className="truncate" title={m.observacao || undefined}>{m.observacao || "—"}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-[#efefef] flex items-center justify-between bg-[#efefef]">
                <p className="text-[#627271] text-xs">
                  Mostrando {filtradas.length} de {movimentacoes.length} movimentações
                </p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-[#1f2937]">
                    <ArrowUpCircle size={12} />
                    <span style={{ fontWeight: 600 }}>+{totalEntradas}</span> entradas
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-red-600">
                    <ArrowDownCircle size={12} />
                    <span style={{ fontWeight: 600 }}>-{totalSaidas}</span> saídas
                  </span>
                  <span className="text-xs text-[#1f2937]" style={{ fontWeight: 600 }}>
                    Saldo: {saldo >= 0 ? "+" : ""}{saldo}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
