import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Edit2,
  Copy,
  Trash2,
  Package,
  Tag,
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  MapPin,
  Truck,
  DollarSign,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  X,
  Loader2,
  MoreVertical,
  Barcode,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";
import {
  MOVIMENTACOES,
  CATEGORIA_COLORS,
  formatCurrency,
  calcMargem,
  getEstoqueStatusConfig,
  type Produto,
} from "./estoqueMockData";
import { useProduto } from "../../hooks/use-produto";

type TabType = "geral" | "estoque" | "variacoes" | "movimentacoes";

/* ── Ajustar Estoque Modal ── */
function AjustarEstoqueModal({
  produto,
  onClose,
  onSuccess,
}: {
  produto: Produto;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  const motivosEntrada = ["Compra", "Devolução", "Ajuste", "Produção", "Inventário", "Outro"];
  const motivosSaida = ["Venda", "Ajuste", "Perda", "Quebra", "Doação", "Outro"];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    onSuccess();
  };

  if (!produto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>Ajustar Estoque</h3>
            <p className="text-[#627271] text-xs">{produto.nome} · Atual: {produto.estoque} {produto.unidade}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#efefef]">
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2">
            {(["entrada", "saida"] as const).map((t) => (
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
                {t === "entrada" ? "Entrada" : "Saída"}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Quantidade *</label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
              required
              autoFocus
            />
            {tipo === "saida" && quantidade && parseInt(quantidade) > produto.estoque && (
              <p className="text-red-500 text-xs mt-1">⚠️ Quantidade maior que o estoque disponível ({produto.estoque})</p>
            )}
          </div>

          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Motivo *</label>
            <div className="flex flex-wrap gap-2">
              {(tipo === "entrada" ? motivosEntrada : motivosSaida).map((m) => (
                <button key={m} type="button" onClick={() => setMotivo(m)}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all border"
                  style={{ background: motivo === m ? "#efefef" : "transparent", color: motivo === m ? "#1f2937" : "#627271", borderColor: motivo === m ? "#86cb92" : "#efefef", fontWeight: motivo === m ? 600 : 400 }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {tipo === "entrada" && (
            <div>
              <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Custo unitário</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271] text-sm">R$</span>
                <input type="number" step="0.01" placeholder="0,00"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Observação</label>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Detalhes da movimentação..." rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading || !quantidade || !motivo}
              className="flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: tipo === "entrada" ? "#86cb92" : "linear-gradient(135deg, #EF4444, #DC2626)", color: tipo === "entrada" ? "#1f2937" : "white", fontWeight: 600 }}>
              {loading ? <><Loader2 size={15} className="animate-spin" />Salvando...</> : `Registrar ${tipo}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProdutoDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("geral");
  const [showAjuste, setShowAjuste] = useState(false);
  const [toast, setToast] = useState("");

  const { produto, loading, error, isFallback, recarregar } = useProduto(id);

  // Movimentações: só em modo demo (mock-first); com sessão ativa vêm da base (empty state real)
  const movimentacoes =
    isFallback && produto
      ? MOVIMENTACOES.filter((m) => m.produtoId === produto.id)
      : [];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Estados exigidos pelo hotfix (loading / error / empty) ──
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-[#627271] mb-4" />
        <p className="text-[#627271] text-sm">Carregando produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
          <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>Não foi possível carregar o produto</h3>
          <p className="text-[#627271] text-sm mb-6">{error}</p>
          <button
            onClick={recarregar}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm mx-auto"
            style={{ background: "#86cb92", color: "#1f2937", fontWeight: 600 }}
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
          <Package size={32} className="text-[#627271] mx-auto mb-3" />
          <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>Produto não encontrado</h3>
          <p className="text-[#627271] text-sm mb-6">Este produto não existe ou pertence a outra empresa.</p>
          <button
            onClick={() => navigate("/estoque/produtos")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm mx-auto"
            style={{ background: "#86cb92", color: "#1f2937", fontWeight: 600 }}
          >
            <ArrowLeft size={15} />
            Voltar para produtos
          </button>
        </div>
      </div>
    );
  }

  const margem = calcMargem(produto.precoCusto, produto.precoVenda);
  const estoqueConfig = getEstoqueStatusConfig(produto.estoqueStatus);
  const catColors = CATEGORIA_COLORS[produto.categoria] || CATEGORIA_COLORS["Outros"];

  const TABS = [
    { id: "geral", label: "Geral", icon: Package },
    { id: "estoque", label: "Estoque", icon: BarChart2 },
    ...(produto.possuiVariacoes ? [{ id: "variacoes", label: "Variações", icon: Layers }] : []),
    { id: "movimentacoes", label: "Movimentações", icon: RefreshCw, badge: movimentacoes.length },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#86cb92] text-[#1f2937] px-4 py-3 rounded-xl shadow-lg text-sm">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      {showAjuste && (
        <AjustarEstoqueModal
          produto={produto}
          onClose={() => setShowAjuste(false)}
          onSuccess={() => { setShowAjuste(false); showToast("Estoque ajustado com sucesso!"); }}
        />
      )}

      {/* Header Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: "#1f2937" }}
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 px-4 sm:px-6 py-5">
          <button onClick={() => navigate("/estoque/produtos")}
            className="flex items-center gap-2 text-[#627271] hover:text-white transition-colors mb-5 text-sm">
            <ArrowLeft size={16} />
            Voltar para produtos
          </button>

          <div className="flex flex-col sm:flex-row gap-5">
            {/* Product icon */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: catColors.bg }}>
              <Package size={36} style={{ color: catColors.text }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-2">
                <h1 className="text-white" style={{ fontSize: "1.3rem", fontWeight: 800 }}>{produto.nome}</h1>
                <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: `${catColors.bg}30`, color: "white", fontWeight: 600, border: "1px solid rgba(255,255,255,0.15)" }}>
                  {produto.categoria}
                </span>
                {/* Estoque status */}
                <span className="px-2.5 py-1 rounded-lg text-xs border" style={{ background: `${estoqueConfig.dot}20`, color: "white", borderColor: `${estoqueConfig.dot}40`, fontWeight: 600 }}>
                  {estoqueConfig.label}
                </span>
                {/* Produto status */}
                <span className="px-2.5 py-1 rounded-lg text-xs capitalize" style={{ background: produto.status === "ativo" ? "rgba(34,197,94,0.2)" : "rgba(100,116,139,0.2)", color: "white", fontWeight: 600 }}>
                  {produto.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-[#627271] text-sm mb-3">
                <span className="flex items-center gap-1.5">
                  <Barcode size={13} />
                  SKU: <span style={{ fontWeight: 600 }}>{produto.sku}</span>
                </span>
                {produto.marca && <span className="flex items-center gap-1.5"><Tag size={13} />{produto.marca}</span>}
                {produto.localizacao && <span className="flex items-center gap-1.5"><MapPin size={13} />{produto.localizacao}</span>}
              </div>
              {produto.descricaoCurta && (
                <p className="text-[#627271] text-sm leading-relaxed">{produto.descricaoCurta}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:flex-col sm:items-end shrink-0">
              <button
                onClick={() => setShowAjuste(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600 }}
              >
                <RefreshCw size={15} />
                <span className="hidden sm:inline">Ajustar Estoque</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm" style={{ background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 600 }}>
                <Edit2 size={15} />
                <span className="hidden sm:inline">Editar</span>
              </button>
              <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
            {[
              { label: "Preço de venda", value: formatCurrency(produto.precoVenda), color: "#1f2937" },
              { label: "Preço de custo", value: formatCurrency(produto.precoCusto), color: "#93C5FD" },
              { label: "Margem de lucro", value: `${margem}%`, color: margem >= 40 ? "#1f2937" : margem >= 20 ? "#FCD34D" : "#F87171" },
              { label: "Estoque atual", value: `${produto.estoque} ${produto.unidade}`, color: estoqueConfig.dot },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[#627271] text-[10px] mb-1">{s.label}</p>
                <p className="text-white text-sm" style={{ fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="relative z-10 flex overflow-x-auto border-t border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)}
                className="flex items-center gap-2 px-5 py-3.5 text-sm whitespace-nowrap transition-all border-b-2"
                style={{ color: isActive ? "white" : "#627271", borderBottomColor: isActive ? "#86cb92" : "transparent", background: isActive ? "rgba(255,255,255,0.05)" : "transparent", fontWeight: isActive ? 600 : 400 }}>
                <Icon size={14} />
                {tab.label}
                {"badge" in tab && tab.badge > 0 && (
                  <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center"
                    style={{ background: isActive ? "#86cb92" : "rgba(255,255,255,0.1)", color: isActive ? "#1f2937" : "white", fontWeight: 700 }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {/* GERAL */}
        {activeTab === "geral" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              {/* Informações básicas */}
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
                <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 600 }}>Informações Básicas</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Nome", value: produto.nome },
                    { label: "SKU", value: produto.sku },
                    { label: "Categoria", value: produto.categoria },
                    { label: "Marca", value: produto.marca || "—" },
                    { label: "Unidade", value: produto.unidade },
                    { label: "Código de Barras", value: produto.codigoBarras || "—" },
                    { label: "Localização", value: produto.localizacao || "—" },
                    { label: "Fornecedor", value: produto.fornecedor || "—" },
                    { label: "Data de Cadastro", value: produto.dataCadastro },
                    { label: "Última Movimentação", value: produto.ultimaMovimentacao },
                  ].map((f) => (
                    <div key={f.label} className="border-b border-[#efefef] pb-3">
                      <p className="text-[#627271] text-[10px] mb-0.5">{f.label}</p>
                      <p className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              {produto.descricaoCurta && (
                <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
                  <h3 className="text-[#1f2937] text-sm mb-3" style={{ fontWeight: 600 }}>Descrição</h3>
                  <p className="text-[#1f2937] text-sm leading-relaxed">{produto.descricaoCurta}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Preços */}
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
                <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 600 }}>Precificação</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#627271] text-sm">Custo</span>
                    <span className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>{formatCurrency(produto.precoCusto)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#627271] text-sm">Venda</span>
                    <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{formatCurrency(produto.precoVenda)}</span>
                  </div>
                  {produto.precoPromocional && (
                    <div className="flex items-center justify-between">
                      <span className="text-red-500 text-sm">Promocional</span>
                      <span className="text-red-600 text-sm" style={{ fontWeight: 700 }}>{formatCurrency(produto.precoPromocional)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-[#efefef]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Margem de lucro</span>
                      <span className="text-sm" style={{ fontWeight: 700, color: margem >= 40 ? "#1f2937" : margem >= 20 ? "#B45309" : "#B91C1C" }}>
                        {margem}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#efefef] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(margem, 100)}%`, background: margem >= 40 ? "#86cb92" : margem >= 20 ? "#F59E0B" : "#EF4444" }} />
                    </div>
                    <p className="text-[#627271] text-[10px] mt-1">{margem < 20 ? "⚠️ Abaixo do recomendado" : margem < 40 ? "Margem razoável" : "✅ Margem saudável"}</p>
                  </div>
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4">
                <h3 className="text-[#1f2937] text-sm mb-3" style={{ fontWeight: 600 }}>Ações Rápidas</h3>
                <div className="space-y-1.5">
                  {[
                    { label: "Ajustar estoque", icon: RefreshCw, action: () => setShowAjuste(true), color: "#0EA5E9" },
                    { label: "Editar produto", icon: Edit2, action: () => {}, color: "#8B5CF6" },
                    { label: "Duplicar produto", icon: Copy, action: () => {}, color: "#F59E0B" },
                    { label: "Imprimir etiqueta", icon: Barcode, action: () => {}, color: "#627271" },
                    { label: produto.status === "ativo" ? "Inativar produto" : "Ativar produto", icon: produto.status === "ativo" ? ToggleLeft : ToggleRight, action: () => {}, color: produto.status === "ativo" ? "#EF4444" : "#86cb92" },
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
            </div>
          </div>
        )}

        {/* ESTOQUE */}
        {activeTab === "estoque" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              {/* Estoque atual destaque */}
              <div className={`rounded-2xl border p-6 text-center`}
                style={{ background: estoqueConfig.bg, borderColor: estoqueConfig.border }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {produto.estoqueStatus === "ok" ? <CheckCircle2 size={20} style={{ color: estoqueConfig.dot }} /> : produto.estoqueStatus === "baixo" ? <AlertTriangle size={20} style={{ color: estoqueConfig.dot }} /> : <XCircle size={20} style={{ color: estoqueConfig.dot }} />}
                  <span className="text-sm" style={{ color: estoqueConfig.text, fontWeight: 600 }}>{estoqueConfig.label}</span>
                </div>
                <p style={{ fontSize: "3rem", fontWeight: 800, color: estoqueConfig.dot, lineHeight: 1 }}>{produto.estoque}</p>
                <p className="text-sm mt-1" style={{ color: estoqueConfig.text }}>{produto.unidade}(s) em estoque</p>
                {produto.estoqueStatus !== "ok" && (
                  <button onClick={() => setShowAjuste(true)}
                    className="mt-4 px-5 py-2 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}>
                    Registrar entrada de estoque
                  </button>
                )}
              </div>

              {/* Configurações de estoque */}
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
                <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 600 }}>Configurações de Estoque</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Estoque Mínimo", value: produto.estoqueMinimo, icon: TrendingDown, color: "#F59E0B" },
                    { label: "Estoque Máximo", value: produto.estoqueMaximo ?? "—", icon: TrendingUp, color: "#0EA5E9" },
                    { label: "Custo Médio", value: formatCurrency(produto.precoCusto), icon: DollarSign, color: "#8B5CF6" },
                    { label: "Valor em Estoque", value: formatCurrency(produto.estoque * produto.precoCusto), icon: DollarSign, color: "#1f2937" },
                    { label: "Total Vendido", value: `${produto.totalVendido} un`, icon: ShoppingBag, color: "#0EA5E9" },
                    { label: "Localização", value: produto.localizacao || "—", icon: MapPin, color: "#627271" },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="bg-[#efefef] rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Icon size={12} style={{ color: s.color }} />
                          <p className="text-[#627271] text-[10px]">{s.label}</p>
                        </div>
                        <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{s.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
                <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 600 }}>Fornecedor</h3>
                {produto.fornecedor ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Truck size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>{produto.fornecedor}</p>
                      <p className="text-[#627271] text-xs">Fornecedor padrão</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#627271] text-sm">Nenhum fornecedor vinculado</p>
                )}
                <button className="w-full mt-3 py-2 rounded-xl bg-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors" style={{ fontWeight: 500 }}>
                  Fazer pedido ao fornecedor
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Últimas movimentações</h3>
                  <button onClick={() => setActiveTab("movimentacoes")} className="text-xs" style={{ color: "#1f2937", fontWeight: 500 }}>Ver todas →</button>
                </div>
                <div className="space-y-2.5">
                  {movimentacoes.slice(0, 3).map((m) => (
                    <div key={m.id} className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.tipo === "entrada" ? "bg-[#efefef]" : "bg-red-50"}`}>
                        {m.tipo === "entrada" ? <ArrowUpCircle size={14} className="text-[#627271]" /> : <ArrowDownCircle size={14} className="text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1f2937] text-xs truncate" style={{ fontWeight: 600 }}>{m.motivo}</p>
                        <p className="text-[#627271] text-[10px]">{m.data.split(" - ")[0]}</p>
                      </div>
                      <span className="text-xs shrink-0" style={{ fontWeight: 700, color: m.tipo === "entrada" ? "#1f2937" : "#EF4444" }}>
                        {m.tipo === "entrada" ? "+" : "-"}{m.quantidade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VARIAÇÕES */}
        {activeTab === "variacoes" && produto.possuiVariacoes && produto.variacoes && (
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
              <div>
                <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Variações do produto</h3>
                <p className="text-[#627271] text-xs">{produto.variacoes.length} variações cadastradas</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef]" style={{ fontWeight: 500 }}>
                <Plus size={13} />Adicionar variação
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#efefef] border-b border-[#efefef]">
                    {["Variação", "SKU", "Estoque", "Preço", "Status", "Ações"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[#627271] text-xs whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {produto.variacoes.map((v) => {
                    const vEstStatus = v.estoque === 0 ? "zerado" : v.estoque <= 3 ? "baixo" : "ok";
                    const vCfg = getEstoqueStatusConfig(vEstStatus);
                    return (
                      <tr key={v.id} className="border-b border-[#efefef] hover:bg-[#efefef]/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>{v.nome}</p>
                        </td>
                        <td className="px-4 py-3 text-[#627271] text-xs font-mono">{v.sku}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm" style={{ fontWeight: 700, color: vCfg.dot }}>{v.estoque}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full border" style={{ background: vCfg.bg, color: vCfg.text, borderColor: vCfg.border, fontWeight: 600 }}>{vCfg.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
                            {v.preco ? formatCurrency(v.preco) : formatCurrency(produto.precoVenda)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: v.ativo ? "#efefef" : "#efefef", color: v.ativo ? "#1f2937" : "#627271", fontWeight: 600 }}>
                            {v.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef]"><Edit2 size={13} /></button>
                            <button onClick={() => setShowAjuste(true)} className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100"><RefreshCw size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MOVIMENTAÇÕES */}
        {activeTab === "movimentacoes" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Histórico de Movimentações</h3>
                <p className="text-[#627271] text-xs">{movimentacoes.length} registros</p>
              </div>
              <button onClick={() => setShowAjuste(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}>
                <Plus size={14} />Nova movimentação
              </button>
            </div>

            {movimentacoes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
                <RefreshCw size={32} className="text-[#627271] mx-auto mb-3" />
                <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>Nenhuma movimentação</h3>
                <p className="text-[#627271] text-sm">As entradas e saídas aparecerão aqui</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#efefef] border-b border-[#efefef]">
                        {["Data", "Tipo", "Quantidade", "Motivo", "Responsável", "Obs."].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-[#627271] text-xs whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {movimentacoes.map((m) => (
                        <tr key={m.id} className="border-b border-[#efefef] hover:bg-[#efefef]/50 transition-colors">
                          <td className="px-4 py-3 text-[#1f2937] text-xs whitespace-nowrap">{m.data}</td>
                          <td className="px-4 py-3">
                            <div className={`flex items-center gap-1.5 text-xs ${m.tipo === "entrada" ? "text-[#1f2937]" : "text-red-600"}`}>
                              {m.tipo === "entrada" ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                              <span style={{ fontWeight: 600 }}>{m.tipo === "entrada" ? "Entrada" : "Saída"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm" style={{ fontWeight: 700, color: m.tipo === "entrada" ? "#1f2937" : "#EF4444" }}>
                              {m.tipo === "entrada" ? "+" : "-"}{m.quantidade}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#efefef] text-[#1f2937]" style={{ fontWeight: 500 }}>{m.motivo}</span>
                          </td>
                          <td className="px-4 py-3 text-[#1f2937] text-xs">{m.responsavel}</td>
                          <td className="px-4 py-3 text-[#627271] text-xs max-w-[200px] truncate">{m.observacao || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
