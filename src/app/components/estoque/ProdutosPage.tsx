import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  AlertTriangle,
  Package,
  Edit2,
  Trash2,
  Copy,
  Download,
  Upload,
  X,
  CheckCircle2,
  Layers,
  Tag,
  ChevronDown,
  Loader2,
  Barcode,
} from "lucide-react";
import {
  PRODUTOS,
  CATEGORIA_COLORS,
  formatCurrency,
  calcMargem,
  getEstoqueStatusConfig,
  type Produto,
} from "./estoqueMockData";

type ViewMode = "grid" | "list";

const CATEGORIAS = [...new Set(PRODUTOS.map((p) => p.categoria))];
const STATUS_ESTOQUE_OPTS = ["Todos", "OK", "Baixo", "Zerado"];
const STATUS_PRODUTO_OPTS = ["Todos", "Ativo", "Inativo"];

/* ─────────── Badge helpers ─────────── */
function EstoqueBadge({ status }: { status: Produto["estoqueStatus"] }) {
  const cfg = getEstoqueStatusConfig(status);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border, fontWeight: 600 }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function MargemChip({ pct }: { pct: number }) {
  const good = pct >= 40;
  const warn = pct >= 20 && pct < 40;
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-md"
      style={{
        background: good ? "#efefef" : warn ? "#FFFBEB" : "#FEF2F2",
        color: good ? "#1f2937" : warn ? "#B45309" : "#B91C1C",
        fontWeight: 600,
      }}
    >
      {pct}% margem
    </span>
  );
}

/* ─────────── Product Grid Card ─────────── */
function ProdutoGridCard({ produto, onClick }: { produto: Produto; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const catColors = CATEGORIA_COLORS[produto.categoria] || CATEGORIA_COLORS["Outros"];
  const margem = calcMargem(produto.precoCusto, produto.precoVenda);

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm cursor-pointer transition-all group ${
        produto.status === "inativo" ? "opacity-60" : ""
      } ${hovered ? "shadow-md border-[#efefef] -translate-y-0.5" : "border-[#efefef]"}`}
      style={{ transform: hovered ? "translateY(-2px)" : "none", transition: "all 0.15s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Foto / Placeholder */}
      <div
        className="h-36 rounded-t-2xl flex items-center justify-center relative overflow-hidden"
        style={{ background: catColors.bg }}
      >
        <Package size={48} style={{ color: catColors.text, opacity: 0.3 }} />

        {/* Badges top */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <EstoqueBadge status={produto.estoqueStatus} />
          {produto.precoPromocional && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px]" style={{ fontWeight: 700 }}>
              PROMO
            </span>
          )}
        </div>

        {/* Variações indicator */}
        {produto.possuiVariacoes && (
          <div className="absolute top-2.5 right-2.5">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/80 backdrop-blur-sm">
              <Layers size={10} style={{ color: catColors.text }} />
              <span className="text-[9px]" style={{ color: catColors.text, fontWeight: 700 }}>
                {produto.variacoes?.length} var.
              </span>
            </div>
          </div>
        )}

        {/* Hover actions */}
        <div
          className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 transition-opacity"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm hover:bg-[#efefef]"
          >
            <Edit2 size={14} className="text-[#1f2937]" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm hover:bg-[#efefef]"
          >
            <Copy size={14} className="text-[#1f2937]" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-1 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-[#1f2937] text-sm leading-tight truncate" style={{ fontWeight: 700 }}>
              {produto.nome}
            </p>
            <p className="text-[#627271] text-[11px] mt-0.5">{produto.sku}</p>
          </div>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-md shrink-0"
            style={{ background: catColors.bg, color: catColors.text, fontWeight: 600 }}
          >
            {produto.categoria}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
              {formatCurrency(produto.precoVenda)}
            </p>
            {produto.precoPromocional && (
              <p className="text-[#627271] text-[11px] line-through">
                {formatCurrency(produto.precoVenda)}
              </p>
            )}
          </div>
          <MargemChip pct={margem} />
        </div>

        <div className="mt-3 pt-3 border-t border-[#efefef] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Package size={12} className="text-[#627271]" />
            <span
              className="text-sm"
              style={{
                fontWeight: 700,
                color:
                  produto.estoqueStatus === "zerado"
                    ? "#EF4444"
                    : produto.estoqueStatus === "baixo"
                    ? "#F59E0B"
                    : "#1f2937",
              }}
            >
              {produto.estoque}
            </span>
            <span className="text-[#627271] text-xs">{produto.unidade}</span>
          </div>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: produto.status === "ativo" ? "#efefef" : "#efefef",
              color: produto.status === "ativo" ? "#1f2937" : "#627271",
              fontWeight: 600,
            }}
          >
            {produto.status}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Novo Produto Modal (simplified) ─────────── */
function NovoProdutoModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    sku: "",
    categoria: "",
    unidade: "Peça",
    precoCusto: "",
    precoVenda: "",
    estoque: "",
    estoqueMinimo: "",
  });

  const margem =
    form.precoCusto && form.precoVenda
      ? calcMargem(parseFloat(form.precoCusto), parseFloat(form.precoVenda))
      : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    onSuccess();
  };

  const STEPS = ["Informações", "Preços", "Estoque"];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
              Novo Produto
            </h3>
            <p className="text-[#627271] text-xs">Passo {step} de {STEPS.length}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#efefef]"
          >
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex px-5 pt-4 gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
                style={{
                  background: i + 1 < step ? "#86cb92" : i + 1 === step ? "#efefef" : "#efefef",
                  color: i + 1 < step ? "#1f2937" : i + 1 === step ? "#1f2937" : "#627271",
                  border: i + 1 === step ? "2px solid #86cb92" : "2px solid transparent",
                  fontWeight: 700,
                }}
              >
                {i + 1 < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className="text-xs hidden sm:inline"
                style={{ color: i + 1 === step ? "#1f2937" : "#627271", fontWeight: i + 1 === step ? 600 : 400 }}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[#efefef]" />}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Nome do produto *
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Camiseta Básica Premium"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
                  required
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    SKU *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                      placeholder="Ex: CAM-001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, sku: `SKU-${Date.now().toString().slice(-6)}` }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 rounded-lg"
                      style={{ background: "#efefef", color: "#1f2937", fontWeight: 600 }}
                    >
                      Gerar
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    Unidade *
                  </label>
                  <select
                    value={form.unidade}
                    onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] appearance-none bg-white"
                  >
                    {["Peça", "Par", "Kit", "Kg", "Metro", "Litro", "Frasco", "Caixa", "Pacote"].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Categoria *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map((cat) => {
                    const colors = CATEGORIA_COLORS[cat] || CATEGORIA_COLORS["Outros"];
                    const selected = form.categoria === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, categoria: cat }))}
                        className="px-3 py-1.5 rounded-xl text-xs transition-all"
                        style={{
                          background: selected ? colors.bg : "#efefef",
                          color: selected ? colors.text : "#627271",
                          border: selected ? `2px solid ${colors.text}40` : "2px solid transparent",
                          fontWeight: selected ? 600 : 400,
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Código de Barras
                </label>
                <div className="relative">
                  <Barcode size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
                  <input
                    type="text"
                    placeholder="EAN-13 (opcional)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    Preço de custo *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271] text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.precoCusto}
                      onChange={(e) => setForm((f) => ({ ...f, precoCusto: e.target.value }))}
                      placeholder="0,00"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    Preço de venda *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271] text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.precoVenda}
                      onChange={(e) => setForm((f) => ({ ...f, precoVenda: e.target.value }))}
                      placeholder="0,00"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Margem em tempo real */}
              {margem !== null && (
                <div
                  className="flex items-center gap-3 p-3.5 rounded-xl border"
                  style={{
                    background: margem >= 40 ? "#efefef" : margem >= 20 ? "#FFFBEB" : "#FEF2F2",
                    borderColor: margem >= 40 ? "#86cb92" : margem >= 20 ? "#FDE68A" : "#FECACA",
                  }}
                >
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: margem >= 40 ? "#1f2937" : margem >= 20 ? "#B45309" : "#B91C1C", fontWeight: 600 }}>
                      Margem de lucro: {margem}%
                    </p>
                    <p className="text-[11px] text-[#627271] mt-0.5">
                      {margem >= 40 ? "✅ Margem saudável" : margem >= 20 ? "⚠️ Margem razoável, mas pode melhorar" : "❌ Margem abaixo do recomendado (20%)"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ fontWeight: 700, color: margem >= 40 ? "#1f2937" : margem >= 20 ? "#B45309" : "#B91C1C" }}>
                      +{formatCurrency((parseFloat(form.precoVenda) || 0) - (parseFloat(form.precoCusto) || 0))}
                    </p>
                    <p className="text-[10px] text-[#627271]">por unidade</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Preço promocional (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271] text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    Quantidade inicial
                  </label>
                  <input
                    type="number"
                    value={form.estoque}
                    onChange={(e) => setForm((f) => ({ ...f, estoque: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  />
                </div>
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    Estoque mínimo
                  </label>
                  <input
                    type="number"
                    value={form.estoqueMinimo}
                    onChange={(e) => setForm((f) => ({ ...f, estoqueMinimo: e.target.value }))}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Localização no depósito
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prateleira A-1, Vitrine 2..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                />
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Fornecedor padrão
                </label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] appearance-none bg-white">
                  <option value="">Selecionar fornecedor...</option>
                  <option>Distribuidora Têxtil SP</option>
                  <option>Tech Distribuidora</option>
                  <option>Cosméticos Nacionais</option>
                  <option>FastStep Distribuidora</option>
                </select>
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Descrição curta
                </label>
                <textarea
                  placeholder="Descrição resumida do produto..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] resize-none"
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#efefef] flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
              style={{ fontWeight: 500 }}
            >
              Voltar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
            style={{ fontWeight: 500, display: step === 1 ? "block" : "none" }}
          >
            Cancelar
          </button>
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 py-3 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
            >
              Próximo →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave as any}
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-[#1f2937] text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" />Salvando...</>
              ) : (
                "Salvar produto 🎉"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */
export function ProdutosPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [catFiltro, setCatFiltro] = useState("Todas");
  const [statusEstoque, setStatusEstoque] = useState("Todos");
  const [statusProduto, setStatusProduto] = useState("Todos");
  const [showFiltros, setShowFiltros] = useState(false);
  const [showNovoProduto, setShowNovoProduto] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filteredProdutos = PRODUTOS.filter((p) => {
    const matchBusca =
      !busca ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.sku.toLowerCase().includes(busca.toLowerCase()) ||
      (p.codigoBarras || "").includes(busca);
    const matchCat = catFiltro === "Todas" || p.categoria === catFiltro;
    const matchEstoque =
      statusEstoque === "Todos" ||
      (statusEstoque === "OK" && p.estoqueStatus === "ok") ||
      (statusEstoque === "Baixo" && p.estoqueStatus === "baixo") ||
      (statusEstoque === "Zerado" && p.estoqueStatus === "zerado");
    const matchStatus =
      statusProduto === "Todos" ||
      (statusProduto === "Ativo" && p.status === "ativo") ||
      (statusProduto === "Inativo" && p.status === "inativo");
    return matchBusca && matchCat && matchEstoque && matchStatus;
  });

  const activeFilters = [
    catFiltro !== "Todas" && catFiltro,
    statusEstoque !== "Todos" && statusEstoque,
    statusProduto !== "Todos" && statusProduto,
  ].filter(Boolean) as string[];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#86cb92] text-[#1f2937] px-4 py-3 rounded-xl shadow-lg text-sm">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      {showNovoProduto && (
        <NovoProdutoModal
          onClose={() => setShowNovoProduto(false)}
          onSuccess={() => {
            setShowNovoProduto(false);
            showToast("Produto cadastrado com sucesso! 🎉");
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
            Produtos
          </h1>
          <p className="text-[#627271] text-sm">
            {filteredProdutos.length} de {PRODUTOS.length} produtos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors" style={{ fontWeight: 500 }}>
            <Upload size={13} />Importar
          </button>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors" style={{ fontWeight: 500 }}>
            <Download size={13} />Exportar
          </button>
          <button
            onClick={() => setShowNovoProduto(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Novo Produto</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Alertas rápidos */}
      {(PRODUTOS.some((p) => p.estoqueStatus === "zerado") || PRODUTOS.some((p) => p.estoqueStatus === "baixo")) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {PRODUTOS.some((p) => p.estoqueStatus === "zerado") && (
            <button
              onClick={() => setStatusEstoque("Zerado")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: "#FEF2F2", color: "#B91C1C", fontWeight: 600, border: "1px solid #FECACA" }}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {PRODUTOS.filter((p) => p.estoqueStatus === "zerado").length} zerado(s)
            </button>
          )}
          {PRODUTOS.some((p) => p.estoqueStatus === "baixo") && (
            <button
              onClick={() => setStatusEstoque("Baixo")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: "#FFFBEB", color: "#B45309", fontWeight: 600, border: "1px solid #FDE68A" }}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {PRODUTOS.filter((p) => p.estoqueStatus === "baixo").length} estoque baixo
            </button>
          )}
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-4 mb-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, SKU ou código de barras..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-[#efefef]"
            />
          </div>
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm transition-all"
            style={{
              background: showFiltros || activeFilters.length > 0 ? "#efefef" : "white",
              borderColor: showFiltros || activeFilters.length > 0 ? "#86cb92" : "#efefef",
              color: showFiltros || activeFilters.length > 0 ? "#1f2937" : "#627271",
              fontWeight: 500,
            }}
          >
            <Filter size={14} />
            Filtros
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-[#1f2937]" style={{ background: "#86cb92" }}>
                {activeFilters.length}
              </span>
            )}
          </button>
          <div className="flex border border-[#efefef] rounded-xl overflow-hidden bg-[#efefef]">
            <button onClick={() => setViewMode("grid")} className="px-3 py-2.5 transition-all" style={{ background: viewMode === "grid" ? "white" : "transparent", color: viewMode === "grid" ? "#1f2937" : "#627271" }}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setViewMode("list")} className="px-3 py-2.5 transition-all" style={{ background: viewMode === "list" ? "white" : "transparent", color: viewMode === "list" ? "#1f2937" : "#627271" }}>
              <List size={15} />
            </button>
          </div>
        </div>

        {showFiltros && (
          <div className="mt-4 pt-4 border-t border-[#efefef] flex flex-wrap gap-5">
            <div>
              <label className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>Categoria</label>
              <div className="flex flex-wrap gap-1.5">
                {["Todas", ...CATEGORIAS].map((cat) => {
                  const colors = cat !== "Todas" ? (CATEGORIA_COLORS[cat] || {}) : { bg: "#efefef", text: "#627271" };
                  return (
                    <button key={cat} onClick={() => setCatFiltro(cat)}
                      className="px-2.5 py-1 rounded-lg text-xs transition-all"
                      style={{
                        background: catFiltro === cat ? (colors as any).bg : "#efefef",
                        color: catFiltro === cat ? (colors as any).text : "#627271",
                        border: catFiltro === cat ? `1px solid ${(colors as any).text}40` : "1px solid transparent",
                        fontWeight: catFiltro === cat ? 600 : 400,
                      }}
                    >{cat}</button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>Estoque</label>
              <div className="flex gap-1.5">
                {STATUS_ESTOQUE_OPTS.map((s) => (
                  <button key={s} onClick={() => setStatusEstoque(s)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: statusEstoque === s ? "#efefef" : "#efefef", color: statusEstoque === s ? "#1f2937" : "#627271", border: statusEstoque === s ? "1px solid #86cb92" : "1px solid transparent", fontWeight: statusEstoque === s ? 600 : 400 }}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>Status</label>
              <div className="flex gap-1.5">
                {STATUS_PRODUTO_OPTS.map((s) => (
                  <button key={s} onClick={() => setStatusProduto(s)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: statusProduto === s ? "#efefef" : "#efefef", color: statusProduto === s ? "#1f2937" : "#627271", border: statusProduto === s ? "1px solid #86cb92" : "1px solid transparent", fontWeight: statusProduto === s ? 600 : 400 }}
                  >{s}</button>
                ))}
              </div>
            </div>
            {activeFilters.length > 0 && (
              <button onClick={() => { setCatFiltro("Todas"); setStatusEstoque("Todos"); setStatusProduto("Todos"); }}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 mt-auto" style={{ fontWeight: 500 }}>
                <X size={12} />Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {activeFilters.length > 0 && !showFiltros && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span key={f} className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#efefef] text-[#1f2937] text-xs" style={{ fontWeight: 500 }}>
                {f}
                <button onClick={() => { if (catFiltro === f) setCatFiltro("Todas"); else if (statusEstoque === f) setStatusEstoque("Todos"); else setStatusProduto("Todos"); }}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {filteredProdutos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#efefef] flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-[#627271]" />
          </div>
          <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>
            {busca || activeFilters.length > 0 ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
          </h3>
          <p className="text-[#627271] text-sm mb-5">
            {busca || activeFilters.length > 0 ? "Tente ajustar seus filtros ou termos de busca" : "Comece adicionando seu primeiro produto ao estoque"}
          </p>
          {busca || activeFilters.length > 0 ? (
            <button onClick={() => { setBusca(""); setCatFiltro("Todas"); setStatusEstoque("Todos"); setStatusProduto("Todos"); }}
              className="px-5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              Limpar filtros
            </button>
          ) : (
            <button onClick={() => setShowNovoProduto(true)}
              className="px-5 py-2.5 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}>
              Cadastrar primeiro produto
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProdutos.map((p) => (
            <ProdutoGridCard key={p.id} produto={p} onClick={() => navigate(`/estoque/produtos/${p.id}`)} />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#efefef] bg-[#efefef]">
                  {["Produto", "SKU", "Categoria", "Preço", "Margem", "Estoque", "Status", "Ações"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[#627271] text-xs whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProdutos.map((p) => {
                  const catColors = CATEGORIA_COLORS[p.categoria] || CATEGORIA_COLORS["Outros"];
                  const margem = calcMargem(p.precoCusto, p.precoVenda);
                  return (
                    <tr key={p.id} className="border-b border-[#efefef] hover:bg-[#efefef]/50 transition-colors cursor-pointer" onClick={() => navigate(`/estoque/produtos/${p.id}`)} style={{ opacity: p.status === "inativo" ? 0.6 : 1 }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: catColors.bg }}>
                            <Package size={16} style={{ color: catColors.text }} />
                          </div>
                          <div>
                            <p className="text-[#1f2937] text-sm whitespace-nowrap" style={{ fontWeight: 600 }}>{p.nome}</p>
                            {p.possuiVariacoes && <p className="text-[#627271] text-[10px]">{p.variacoes?.length} variações</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#1f2937] text-xs font-mono">{p.sku}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: catColors.bg, color: catColors.text, fontWeight: 600 }}>{p.categoria}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{formatCurrency(p.precoVenda)}</p>
                        {p.precoPromocional && <p className="text-red-500 text-[10px]">Promo: {formatCurrency(p.precoPromocional)}</p>}
                      </td>
                      <td className="px-4 py-3"><MargemChip pct={margem} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm" style={{ fontWeight: 700, color: p.estoqueStatus === "zerado" ? "#EF4444" : p.estoqueStatus === "baixo" ? "#F59E0B" : "#1f2937" }}>{p.estoque}</span>
                          <span className="text-[#627271] text-xs">{p.unidade}</span>
                          <EstoqueBadge status={p.estoqueStatus} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] px-2 py-1 rounded-full capitalize" style={{ background: p.status === "ativo" ? "#efefef" : "#efefef", color: p.status === "ativo" ? "#1f2937" : "#627271", fontWeight: 600 }}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef]"><Edit2 size={13} /></button>
                          <button className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef]"><Copy size={13} /></button>
                          <button className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"><Trash2 size={13} /></button>
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
    </div>
  );
}
