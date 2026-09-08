import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Filter,
  Download,
  Search,
  X,
  CheckCircle2,
  Loader2,
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import {
  MOVIMENTACOES,
  PRODUTOS,
  formatCurrency,
  type MovTipo,
  type MovMotivo,
} from "./estoqueMockData";

const PERIODOS = ["Hoje", "Ontem", "Últimos 7 dias", "Últimos 30 dias", "Mês atual", "Personalizado"];
const MOTIVOS_ENTRADA: MovMotivo[] = ["Compra", "Devolução", "Ajuste", "Inventário", "Outro"];
const MOTIVOS_SAIDA: MovMotivo[] = ["Venda", "Ajuste", "Perda", "Quebra", "Doação", "Outro"];
const TODOS_MOTIVOS = [...new Set([...MOTIVOS_ENTRADA, ...MOTIVOS_SAIDA])];

/* ── Nova Movimentação Modal ── */
function NovaMovimentacaoModal({
  tipoInicial,
  onClose,
  onSuccess,
}: {
  tipoInicial: MovTipo;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [tipo, setTipo] = useState<MovTipo>(tipoInicial);
  const [produtoBusca, setProdutoBusca] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<(typeof PRODUTOS)[0] | null>(null);
  const [showProdutos, setShowProdutos] = useState(false);
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState<MovMotivo | "">("");
  const [obs, setObs] = useState("");
  const [custo, setCusto] = useState("");
  const [loading, setLoading] = useState(false);

  const produtosFiltrados = PRODUTOS.filter(
    (p) =>
      p.status === "ativo" &&
      (p.nome.toLowerCase().includes(produtoBusca.toLowerCase()) || p.sku.toLowerCase().includes(produtoBusca.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess(tipo === "entrada" ? "Entrada registrada com sucesso!" : "Saída registrada com sucesso!");
  };

  const motivosAtivos = tipo === "entrada" ? MOTIVOS_ENTRADA : MOTIVOS_SAIDA;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
              Nova Movimentação
            </h3>
            <p className="text-[#627271] text-xs">Registre entrada ou saída de estoque</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#efefef]">
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2">
            {(["entrada", "saida"] as MovTipo[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTipo(t); setMotivo(""); }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border text-sm transition-all"
                style={{
                  background: tipo === t ? (t === "entrada" ? "#efefef" : "#FEF2F2") : "transparent",
                  borderColor: tipo === t ? (t === "entrada" ? "#86cb92" : "#EF4444") : "#efefef",
                  color: tipo === t ? (t === "entrada" ? "#1f2937" : "#B91C1C") : "#627271",
                  fontWeight: tipo === t ? 700 : 400,
                }}
              >
                {t === "entrada" ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                {t === "entrada" ? "📦 Entrada" : "📤 Saída"}
              </button>
            ))}
          </div>

          {/* Produto */}
          <div className="relative">
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
              Produto *
            </label>
            {produtoSelecionado ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[#86cb92] bg-[#efefef]">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <Package size={15} className="text-[#627271]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 600 }}>{produtoSelecionado.nome}</p>
                  <p className="text-[#627271] text-xs">{produtoSelecionado.sku} · Estoque: {produtoSelecionado.estoque}</p>
                </div>
                <button type="button" onClick={() => setProdutoSelecionado(null)} className="text-[#627271] hover:text-[#1f2937]">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" />
                <input
                  type="text"
                  value={produtoBusca}
                  onChange={(e) => { setProdutoBusca(e.target.value); setShowProdutos(true); }}
                  onFocus={() => setShowProdutos(true)}
                  placeholder="Buscar produto por nome ou SKU..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  autoFocus
                />
                {showProdutos && produtoBusca && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#efefef] shadow-lg z-50 max-h-48 overflow-y-auto">
                    {produtosFiltrados.length === 0 ? (
                      <div className="p-3 text-[#627271] text-sm text-center">Nenhum produto encontrado</div>
                    ) : (
                      produtosFiltrados.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setProdutoSelecionado(p); setProdutoBusca(""); setShowProdutos(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#efefef] transition-colors text-left"
                        >
                          <Package size={14} className="text-[#627271] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 600 }}>{p.nome}</p>
                            <p className="text-[#627271] text-xs">{p.sku} · Estoque: {p.estoque}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
              Quantidade *
            </label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
              required
            />
            {tipo === "saida" && produtoSelecionado && quantidade && parseInt(quantidade) > produtoSelecionado.estoque && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertTriangle size={12} />
                Quantidade maior que o disponível ({produtoSelecionado.estoque} unidades)
              </p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
              Motivo *
            </label>
            <div className="flex flex-wrap gap-2">
              {motivosAtivos.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMotivo(m)}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all border"
                  style={{
                    background: motivo === m ? "#efefef" : "transparent",
                    color: motivo === m ? "#1f2937" : "#627271",
                    borderColor: motivo === m ? "#86cb92" : "#efefef",
                    fontWeight: motivo === m ? 600 : 400,
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Custo (apenas para entradas) */}
          {tipo === "entrada" && (
            <div>
              <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                Custo unitário
                <span className="text-[#627271] ml-1">(atualiza custo médio)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271] text-sm">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={custo}
                  onChange={(e) => setCusto(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                />
              </div>
            </div>
          )}

          {/* Observação */}
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
              Observação
            </label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Nota fiscal, motivo detalhado, referência..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
              style={{ fontWeight: 500 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !quantidade || !motivo}
              className="flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background:
                  tipo === "entrada"
                    ? "#86cb92"
                    : "linear-gradient(135deg, #EF4444, #DC2626)",
                color: tipo === "entrada" ? "#1f2937" : "white",
                fontWeight: 600,
              }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" />Salvando...</>
              ) : (
                `Registrar ${tipo === "entrada" ? "entrada ↑" : "saída ↓"}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MovimentacoesPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "entrada" | "saida">("todos");
  const [motivoFiltro, setMotivoFiltro] = useState("Todos");
  const [periodo, setPeriodo] = useState("Últimos 7 dias");
  const [showFiltros, setShowFiltros] = useState(false);
  const [showModal, setShowModal] = useState<null | MovTipo>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filtradas = MOVIMENTACOES.filter((m) => {
    const matchBusca =
      !busca ||
      m.produtoNome.toLowerCase().includes(busca.toLowerCase()) ||
      m.produtoSku.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = tipoFiltro === "todos" || m.tipo === tipoFiltro;
    const matchMotivo = motivoFiltro === "Todos" || m.motivo === motivoFiltro;
    return matchBusca && matchTipo && matchMotivo;
  });

  const totalEntradas = filtradas.filter((m) => m.tipo === "entrada").reduce((a, m) => a + m.quantidade, 0);
  const totalSaidas = filtradas.filter((m) => m.tipo === "saida").reduce((a, m) => a + m.quantidade, 0);
  const saldo = totalEntradas - totalSaidas;
  const valorEntradas = filtradas.filter((m) => m.tipo === "entrada" && m.custo).reduce((a, m) => a + m.quantidade * (m.custo || 0), 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#86cb92] text-[#1f2937] px-4 py-3 rounded-xl shadow-lg text-sm">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      {showModal && (
        <NovaMovimentacaoModal
          tipoInicial={showModal}
          onClose={() => setShowModal(null)}
          onSuccess={(msg) => { setShowModal(null); showToast(msg); }}
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

      {/* Resumo do período */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total entradas", value: `+${totalEntradas} un`, sub: valorEntradas > 0 ? formatCurrency(valorEntradas) : "—", icon: ArrowUpCircle, color: "#86cb92", bg: "#efefef" },
          { label: "Total saídas", value: `-${totalSaidas} un`, sub: `${filtradas.filter((m) => m.tipo === "saida").length} registros`, icon: ArrowDownCircle, color: "#EF4444", bg: "#FEF2F2" },
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

      {/* Filtros */}
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-[#efefef]"
            />
          </div>

          {/* Tipo */}
          <div className="flex border border-[#efefef] rounded-xl overflow-hidden bg-[#efefef] shrink-0">
            {(["todos", "entrada", "saida"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipoFiltro(t)}
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
              className="pl-8 pr-8 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] appearance-none bg-white"
              style={{ fontWeight: 500 }}
            >
              {PERIODOS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFiltros(!showFiltros)}
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
              <div className="flex flex-wrap gap-1.5">
                {["Todos", ...TODOS_MOTIVOS].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMotivoFiltro(m)}
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

      {/* Tabela */}
      {filtradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
          <RefreshCw size={32} className="text-[#627271] mx-auto mb-3" />
          <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>Nenhuma movimentação encontrada</h3>
          <p className="text-[#627271] text-sm mb-5">Tente ajustar o período ou filtros</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowModal("entrada")}
              className="px-5 py-2.5 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
            >
              Registrar entrada
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#efefef] bg-[#efefef]">
                  {["Data/Hora", "Tipo", "Produto", "Qtd.", "Motivo", "Responsável", "Obs.", "Ações"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[#627271] text-xs whitespace-nowrap" style={{ fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-[#efefef] hover:bg-[#efefef]/50 transition-colors"
                    style={{ opacity: m.cancelada ? 0.5 : 1 }}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[#1f2937] text-xs whitespace-nowrap" style={{ fontWeight: 600 }}>
                          {m.data.split(" - ")[0]}
                        </p>
                        <p className="text-[#627271] text-[10px]">{m.data.split(" - ")[1]}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs`}
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
                        {m.variacao && <p className="text-[#627271] text-[10px]">{m.variacao}</p>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-sm"
                        style={{ fontWeight: 700, color: m.tipo === "entrada" ? "#1f2937" : "#EF4444" }}
                      >
                        {m.tipo === "entrada" ? "+" : "-"}{m.quantidade}
                      </span>
                      {m.custo && (
                        <p className="text-[#627271] text-[10px]">
                          {formatCurrency(m.custo)}/un
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full bg-[#efefef] text-[#1f2937]"
                        style={{ fontWeight: 500 }}
                      >
                        {m.motivo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#1f2937] text-xs whitespace-nowrap">
                      {m.responsavel}
                    </td>
                    <td className="px-4 py-3 text-[#627271] text-xs max-w-[180px]">
                      <p className="truncate">{m.observacao || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {!m.cancelada && (m.motivo === "Ajuste" || m.motivo === "Inventário") && (
                        <button
                          className="text-[10px] px-2 py-1 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors whitespace-nowrap"
                          style={{ fontWeight: 500 }}
                        >
                          Cancelar
                        </button>
                      )}
                      {m.cancelada && (
                        <span className="text-[10px] px-2 py-1 rounded-lg bg-[#efefef] text-[#627271]" style={{ fontWeight: 500 }}>
                          Cancelada
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[#efefef] flex items-center justify-between bg-[#efefef]">
            <p className="text-[#627271] text-xs">
              Mostrando {filtradas.length} de {MOVIMENTACOES.length} movimentações
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
    </div>
  );
}
