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
  Settings,
} from "lucide-react";
import {
  PRODUTOS,
  CATEGORIA_COLORS,
  formatCurrency,
  calcMargem,
  getEstoqueStatusConfig,
  type Produto,
} from "./estoqueMockData";
import { useProdutos } from "../../hooks/use-produtos";
import { useAtualizarProduto } from "../../hooks/use-atualizar-produto";
import { getTagPalette } from "../../hooks/use-tags";
import { useCategorias } from "../../hooks/use-categorias";
import { ProdutoFormModal } from "./ProdutoFormModal";

/**
 * Cor do chip de categoria de um produto.
 *
 * Usa a cor REAL (`me_categoria.cor`, exposta em `produto.categoriaCor`). O mapa
 * `CATEGORIA_COLORS` é indexado por NOME e virou legado: com as categorias reais
 * ele caía no fallback e todos os chips ficavam iguais. Ele só permanece para os
 * produtos de demonstração, que não têm categoria no banco.
 */
function corCategoria(cor?: string | null, nome?: string) {
  if (cor) return getTagPalette(cor);
  return CATEGORIA_COLORS[nome || ""] || CATEGORIA_COLORS["Outros"];
}

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
      className="text-[10px] px-1.5 py-0.5 rounded-md shrink-0"
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
function ProdutoGridCard({ produto, onClick, onDelete, onEdit, onDuplicate }: { produto: Produto; onClick: () => void; onDelete: () => void; onEdit: () => void; onDuplicate: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [imgFalhou, setImgFalhou] = useState(false);
  const catColors = corCategoria(produto.categoriaCor, produto.categoria);
  const temFoto = Boolean(produto.foto) && !imgFalhou;
  const margem = calcMargem(produto.precoCusto, produto.precoVenda);
  const statusColor =
    produto.estoqueStatus === "zerado" ? "#EF4444" : produto.estoqueStatus === "baixo" ? "#F59E0B" : "#1f2937";

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
      {/* Foto / Placeholder — compacto no mobile (h-24) para o produto aparecer no primeiro dobra; volta a h-36 no sm+ */}
      <div
        className="h-24 sm:h-36 rounded-t-2xl flex items-center justify-center relative overflow-hidden"
        style={{ background: catColors.bg }}
      >
        {temFoto ? (
          <img
            src={produto.foto}
            alt={produto.nome}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFalhou(true)}
            loading="lazy"
          />
        ) : (
          <>
            <Package size={28} className="sm:hidden" style={{ color: catColors.text, opacity: 0.3 }} />
            <Package size={48} className="hidden sm:block" style={{ color: catColors.text, opacity: 0.3 }} />
          </>
        )}

        {/* Badges top — encostados ao topo no mobile, como antes no sm+ */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1">
          <EstoqueBadge status={produto.estoqueStatus} />
          {produto.precoPromocional && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px]" style={{ fontWeight: 700 }}>
              PROMO
            </span>
          )}
        </div>

        {/* Variações indicator */}
        {produto.possuiVariacoes && (
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/80 backdrop-blur-sm">
              <Layers size={10} style={{ color: catColors.text }} />
              <span className="text-[9px]" style={{ color: catColors.text, fontWeight: 700 }}>
                {produto.variacoes?.length} var.
              </span>
            </div>
          </div>
        )}

        {/* Hover actions — apenas desktop/tablet (touch usa a barra fixa do rodapé) */}
        <div
          className="hidden sm:flex absolute inset-0 bg-black/20 items-center justify-center gap-2 transition-opacity"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm hover:bg-[#efefef]"
          >
            <Edit2 size={14} className="text-[#1f2937]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm hover:bg-[#efefef]"
          >
            <Copy size={14} className="text-[#1f2937]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm hover:bg-red-50"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-3.5">
        {/* Nome + categoria */}
        <div className="flex items-start justify-between gap-1 mb-1.5 sm:mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-[#1f2937] text-sm leading-tight line-clamp-2 sm:line-clamp-1" style={{ fontWeight: 700 }}>
              {produto.nome}
            </p>
            <p className="text-[#627271] text-[11px] mt-0.5 truncate">{produto.sku}</p>
          </div>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-md shrink-0"
            style={{ background: catColors.bg, color: catColors.text, fontWeight: 600 }}
          >
            {produto.categoria}
          </span>
        </div>

        {/* Preço × margem */}
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <div className="min-w-0">
            <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 700 }}>
              {formatCurrency(produto.precoVenda)}
            </p>
            {produto.precoPromocional && (
              <p className="text-[#627271] text-[11px] line-through truncate">
                {formatCurrency(produto.precoVenda)}
              </p>
            )}
          </div>
          <MargemChip pct={margem} />
        </div>

        {/* Estoque × status */}
        <div className="mt-2.5 pt-2.5 sm:mt-3 sm:pt-3 border-t border-[#efefef] flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 min-w-0">
            <Package size={12} className="text-[#627271] shrink-0" />
            <span className="text-sm whitespace-nowrap" style={{ fontWeight: 700, color: statusColor }}>
              {produto.estoque}
            </span>
            <span className="text-[#627271] text-xs inline-block truncate">{produto.unidade}</span>
          </div>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              background: "#efefef",
              color: produto.status === "ativo" ? "#1f2937" : "#627271",
              fontWeight: 600,
            }}
          >
            {produto.status}
          </span>
        </div>

        {/* Ações mobile — sempre visíveis, pois touch não tem hover */}
        <div className="sm:hidden mt-2 flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            aria-label={`Editar ${produto.nome}`}
            className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center transition-transform active:scale-95"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            aria-label={`Duplicar ${produto.nome}`}
            className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center transition-transform active:scale-95"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={`Excluir ${produto.nome}`}
            className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center transition-transform active:scale-95"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */
export function ProdutosPage() {
  const navigate = useNavigate();
  const { produtos, loading, isFallback, recarregar } = useProdutos();
  const { atualizarProduto, loading: atualizandoProduto } = useAtualizarProduto();
  const { categorias: categoriasConfig } = useCategorias();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [busca, setBusca] = useState("");
  const [catFiltro, setCatFiltro] = useState("Todas");
  const [statusEstoque, setStatusEstoque] = useState("Todos");
  const [statusProduto, setStatusProduto] = useState("Todos");
  const [showFiltros, setShowFiltros] = useState(false);
  const [showNovoProduto, setShowNovoProduto] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | null>(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null);
  const [produtoParaDuplicar, setProdutoParaDuplicar] = useState<Produto | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleExcluirProduto = async () => {
    if (!produtoParaExcluir) return;

    const resultado = await atualizarProduto({
      id: parseInt(produtoParaExcluir.id),
      ativo: false,
    });

    if (resultado.success) {
      showToast(`Produto "${produtoParaExcluir.nome}" excluído!`);
      setProdutoParaExcluir(null);
      recarregar();
    } else {
      alert(`Erro ao excluir: ${resultado.error}`);
    }
  };

  // Categorias dinâmicas baseadas nos produtos
  const CATEGORIAS_DINAMICAS = [...new Set(produtos.map((p) => p.categoria))];

  const filteredProdutos = produtos.filter((p) => {
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

      {/* Modal de confirmação de exclusão */}
      {produtoParaExcluir && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>
                  Excluir produto?
                </p>
                <p className="text-xs text-[#627271]">Esta ação pode ser desfeita reativando o produto.</p>
              </div>
            </div>
            <p className="text-sm text-[#1f2937] mb-4">
              Você está excluindo <strong>"{produtoParaExcluir.nome}"</strong>.
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#efefef] text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors"
                onClick={() => setProdutoParaExcluir(null)}
                disabled={atualizandoProduto}
              >
                Cancelar
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#DC2626" }}
                onClick={handleExcluirProduto}
                disabled={atualizandoProduto}
              >
                {atualizandoProduto ? (
                  <><Loader2 size={14} className="animate-spin" />Excluindo...</>
                ) : (
                  "Confirmar exclusão"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#efefef] overflow-hidden">
              <div className="h-24 sm:h-36 bg-[#efefef] animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-[#efefef] rounded animate-pulse w-3/4" />
                <div className="h-3 bg-[#efefef] rounded animate-pulse w-1/2" />
                <div className="h-5 bg-[#efefef] rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fallback indicator */}
      {isFallback && !loading && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
          <AlertTriangle size={14} />
          Mostrando dados de exemplo. Cadastre produtos para ver dados reais.
        </div>
      )}

      {!loading && (
        <>
          {showNovoProduto && (
            <ProdutoFormModal
              categorias={categoriasConfig}
              onClose={() => setShowNovoProduto(false)}
              onSuccess={() => {
                setShowNovoProduto(false);
                showToast("Produto cadastrado com sucesso! 🎉");
                recarregar();
              }}
            />
          )}
          {produtoParaEditar && (
            <ProdutoFormModal
              produto={produtoParaEditar}
              categorias={categoriasConfig}
              onClose={() => setProdutoParaEditar(null)}
              onSuccess={() => {
                setProdutoParaEditar(null);
                showToast("Produto atualizado com sucesso!");
                recarregar();
              }}
            />
          )}
          {produtoParaDuplicar && (
            <ProdutoFormModal
              produtoBase={produtoParaDuplicar}
              categorias={categoriasConfig}
              onClose={() => setProdutoParaDuplicar(null)}
              onSuccess={() => {
                setProdutoParaDuplicar(null);
                showToast("Produto duplicado com sucesso!");
                recarregar();
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
                {filteredProdutos.length} de {produtos.length} produtos
              </p>
            </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/estoque/configuracoes")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors"
            style={{ fontWeight: 500 }}
            aria-label="Configurações de categorias"
          >
            <Settings size={13} />
            <span className="hidden sm:inline">Categorias</span>
          </button>
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
      {(produtos.some((p) => p.estoqueStatus === "zerado") || produtos.some((p) => p.estoqueStatus === "baixo")) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {produtos.some((p) => p.estoqueStatus === "zerado") && (
            <span className="flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle size={12} />
              {produtos.filter((p) => p.estoqueStatus === "zerado").length} zerado(s)
            </span>
          )}
          {produtos.some((p) => p.estoqueStatus === "baixo") && (
            <button
              onClick={() => setStatusEstoque("Baixo")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: "#FFFBEB", color: "#B45309", fontWeight: 600, border: "1px solid #FDE68A" }}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {produtos.filter((p) => p.estoqueStatus === "baixo").length} estoque baixo
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
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
          {filteredProdutos.map((p) => (
            <ProdutoGridCard
              key={p.id}
              produto={p}
              onClick={() => navigate(`/estoque/produtos/${p.id}`)}
              onDelete={() => setProdutoParaExcluir(p)}
              onEdit={() => setProdutoParaEditar(p)}
              onDuplicate={() => setProdutoParaDuplicar(p)}
            />
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
                  const catColors = corCategoria(p.categoriaCor, p.categoria);
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
                          <button className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef]" onClick={() => setProdutoParaEditar(p)}><Edit2 size={13} /></button>
                          <button className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef]" onClick={() => setProdutoParaDuplicar(p)}><Copy size={13} /></button>
                          <button
                            className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                            onClick={() => setProdutoParaExcluir(p)}
                          >
                            <Trash2 size={13} />
                          </button>
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
        </>
      )}
    </div>
  );
}
