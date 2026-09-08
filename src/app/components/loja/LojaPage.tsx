import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Search, ShoppingCart, Star, Filter, X, ChevronDown,
  Heart, Share2, Truck, Tag, Zap, SlidersHorizontal,
  ArrowUpDown, ChevronRight, Package, MessageCircle,
} from "lucide-react";
import {
  PRODUTOS_LOJA, CATEGORIAS_LOJA, formatCurrencyLoja, calcDesconto,
  type ItemCarrinhoLoja, type ProdutoLoja,
} from "./lojaMockData";

/* ─── Estrelas ─── */
function Stars({ rating, small }: { rating: number; small?: boolean }) {
  return (
    <div className={`flex items-center gap-0.5 ${small ? "" : ""}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={small ? 10 : 12}
          fill={i <= Math.round(rating) ? "#F59E0B" : "none"}
          className={i <= Math.round(rating) ? "text-amber-400" : "text-muted"}
        />
      ))}
    </div>
  );
}

/* ─── Product Card ─── */
function ProdutoCard({
  produto, onAdd, onView, inCart,
}: {
  produto: ProdutoLoja; onAdd: () => void; onView: () => void; inCart: boolean;
}) {
  const desconto = calcDesconto(produto.preco, produto.precoAntigo);
  const esgotado = produto.estoque === 0;
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (esgotado) return;
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={onView}
      className="group bg-white rounded-2xl overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all text-left flex flex-col"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-muted">
        <img src={produto.imagem} alt={produto.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          style={{ opacity: esgotado ? 0.5 : 1 }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {desconto > 0 && (
            <span className="px-2 py-0.5 rounded-lg text-white text-[10px]" style={{ background: "#EF4444", fontWeight: 700 }}>
              -{desconto}%
            </span>
          )}
          {produto.novo && (
            <span className="px-2 py-0.5 rounded-lg text-white text-[10px]" style={{ background: "#8B5CF6", fontWeight: 700 }}>
              Novo
            </span>
          )}
          {esgotado && (
            <span className="px-2 py-0.5 rounded-lg bg-foreground text-white text-[10px]" style={{ fontWeight: 700 }}>
              Esgotado
            </span>
          )}
        </div>
        {produto.freteGratis && !esgotado && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary text-primary-foreground text-[10px]" style={{ fontWeight: 600 }}>
            <Truck size={9} />Frete grátis
          </div>
        )}
        {/* Wishlist */}
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        >
          <Heart size={13} className="text-muted-foreground hover:text-red-500" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] text-muted-foreground mb-1">{produto.categoria}</p>
        <p className="text-foreground text-sm leading-tight mb-1 line-clamp-2" style={{ fontWeight: 600 }}>
          {produto.nome}
        </p>
        <div className="flex items-center gap-1.5 mb-2">
          <Stars rating={produto.avaliacaoMedia} small />
          <span className="text-[10px] text-muted-foreground">({produto.totalAvaliacoes})</span>
        </div>
        <div className="mt-auto">
          {produto.precoAntigo && (
            <p className="text-muted-foreground text-[11px] line-through">{formatCurrencyLoja(produto.precoAntigo)}</p>
          )}
          <p className="text-foreground text-base" style={{ fontWeight: 800, color: esgotado ? "#627271" : "#1f2937" }}>
            {formatCurrencyLoja(produto.preco)}
          </p>
          <p className="text-[10px] text-muted-foreground">ou até 10x sem juros</p>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={esgotado}
          className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.97] hover:bg-[#1f2937]! hover:text-white!"
          style={{
            background: esgotado ? "#efefef" : added ? "#86cb92" : inCart ? "#efefef" : "#86cb92",
            color: esgotado ? "#627271" : added || inCart ? "#1f2937" : "#1f2937",
            border: inCart && !added ? "1.5px solid #86cb92" : "none",
          }}
        >
          {esgotado ? "Indisponível" : added ? "✓ Adicionado!" : inCart ? "✓ No Carrinho" : "Adicionar"}
        </button>
      </div>
    </button>
  );
}

/* ─── Cart Drawer ─── */
function CartDrawer({ itens, onClose, onCheckout, onUpdateQty, onRemove }: {
  itens: ItemCarrinhoLoja[]; onClose: () => void; onCheckout: () => void;
  onUpdateQty: (id: string, d: number) => void; onRemove: (id: string) => void;
}) {
  const subtotal = itens.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-foreground" />
            <h3 className="text-foreground" style={{ fontWeight: 700 }}>Carrinho ({itens.length})</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted transition-colors">
            <X size={15} className="text-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {itens.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <ShoppingCart size={48} className="text-muted mb-4" />
              <p className="text-foreground mb-1" style={{ fontWeight: 600 }}>Carrinho vazio</p>
              <p className="text-muted-foreground text-sm">Adicione produtos para continuar</p>
            </div>
          ) : itens.map(item => (
            <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-border bg-muted">
              <img src={item.produto.imagem} alt={item.produto.nome}
                className="w-14 h-14 rounded-xl object-cover shrink-0 bg-white" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-xs leading-tight line-clamp-2" style={{ fontWeight: 600 }}>{item.produto.nome}</p>
                {item.variacao && <p className="text-muted-foreground text-[10px] mt-0.5">{item.variacao}</p>}
                <p className="text-foreground text-sm mt-1" style={{ fontWeight: 700 }}>{formatCurrencyLoja(item.produto.preco * item.quantidade)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onUpdateQty(item.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center text-foreground hover:bg-muted text-sm" style={{ fontWeight: 700 }}>-</button>
                  <span className="text-foreground text-xs" style={{ fontWeight: 700 }}>{item.quantidade}</span>
                  <button onClick={() => onUpdateQty(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center text-foreground hover:bg-muted text-sm" style={{ fontWeight: 700 }}>+</button>
                  <button onClick={() => onRemove(item.id)} className="ml-auto text-red-400 hover:text-red-600">
                    <X size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {itens.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span className="text-foreground text-sm" style={{ fontWeight: 700 }}>{formatCurrencyLoja(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Frete</span>
              <span className="text-muted-foreground text-sm">Calcular no checkout</span>
            </div>
            <button onClick={onCheckout}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground hover:bg-foreground hover:text-white flex items-center justify-center gap-2"
              style={{ fontWeight: 800, fontSize: "1rem" }}>
              <Zap size={18} />Finalizar Compra
            </button>
            <p className="text-center text-muted-foreground text-[11px]">🔒 Compra 100% segura</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export function LojaPage() {
  const navigate = useNavigate();
  const [carrinho, setCarrinho] = useState<ItemCarrinhoLoja[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [busca, setBusca] = useState("");
  const [catSel, setCatSel] = useState("todos");
  const [ordem, setOrdem] = useState("relevancia");
  const [showFiltros, setShowFiltros] = useState(false);
  const [somenteEstoque, setSomenteEstoque] = useState(false);
  const [freteGratis, setFreteGratis] = useState(false);
  const [precoMax, setPrecoMax] = useState(500);

  const totalItens = carrinho.reduce((s, i) => s + i.quantidade, 0);

  const addToCart = (produto: ProdutoLoja, variacao?: string) => {
    setCarrinho(prev => {
      const ex = prev.find(i => i.produto.id === produto.id && i.variacao === variacao);
      if (ex) return prev.map(i => i.id === ex.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      return [...prev, { id: `c${Date.now()}`, produto, quantidade: 1, variacao }];
    });
  };

  const updateQty = (id: string, d: number) => {
    setCarrinho(prev => prev.map(i => i.id === id ? { ...i, quantidade: Math.max(1, i.quantidade + d) } : i).filter(i => i.quantidade > 0));
  };

  const removeItem = (id: string) => {
    setCarrinho(prev => prev.filter(i => i.id !== id));
  };

  const filtered = PRODUTOS_LOJA.filter(p => {
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase()) && !p.descricao.toLowerCase().includes(busca.toLowerCase())) return false;
    if (catSel !== "todos" && p.categoriaId !== catSel) return false;
    if (somenteEstoque && p.estoque === 0) return false;
    if (freteGratis && !p.freteGratis) return false;
    if (p.preco > precoMax) return false;
    return true;
  }).sort((a, b) => {
    if (ordem === "preco_asc") return a.preco - b.preco;
    if (ordem === "preco_desc") return b.preco - a.preco;
    if (ordem === "mais_vendidos") return b.vendidos - a.vendidos;
    if (ordem === "novidades") return (b.novo ? 1 : 0) - (a.novo ? 1 : 0);
    return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0);
  });

  const destaques = PRODUTOS_LOJA.filter(p => p.destaque && p.estoque > 0);

  return (
    <div className="min-h-screen bg-muted">
      {/* Cart Drawer */}
      {showCart && (
        <CartDrawer
          itens={carrinho} onClose={() => setShowCart(false)}
          onCheckout={() => { setShowCart(false); navigate("/loja/checkout", { state: { carrinho } }); }}
          onUpdateQty={updateQty} onRemove={removeItem}
        />
      )}

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-border" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#86cb92" }}>
              <span className="text-primary-foreground text-xs" style={{ fontWeight: 900 }}>U</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-foreground text-sm leading-tight" style={{ fontWeight: 800 }}>Studio da Maria</p>
              <p className="text-muted-foreground text-[10px]">Beleza & Cosméticos</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-foreground text-sm outline-none focus:border-primary bg-muted"
            />
            {busca && (
              <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className="text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Cart */}
          <button onClick={() => setShowCart(true)}
            className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors shrink-0"
            style={{ background: totalItens > 0 ? "#efefef" : "#efefef", border: totalItens > 0 ? "1.5px solid #86cb92" : "1.5px solid #efefef" }}>
            <ShoppingCart size={18} style={{ color: totalItens > 0 ? "#1f2937" : "#627271" }} />
            {totalItens > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center" style={{ fontWeight: 800 }}>
                {totalItens}
              </span>
            )}
          </button>
        </div>

        {/* Category bar */}
        <div className="max-w-6xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
          {CATEGORIAS_LOJA.map(c => (
            <button key={c.id} onClick={() => setCatSel(c.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all shrink-0"
              style={{
                background: catSel === c.id ? "#86cb92" : "#efefef",
                color: catSel === c.id ? "#1f2937" : "#627271",
                fontWeight: catSel === c.id ? 700 : 400,
              }}>
              {c.emoji} {c.nome}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* Banner hero */}
        {!busca && catSel === "todos" && (
          <div className="relative rounded-3xl overflow-hidden mb-8 h-44 sm:h-56"
            style={{ background: "#1f2937" }}>
            <img src="https://images.unsplash.com/photo-1760621393386-3906922b0b78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200"
              alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
              <p className="text-primary text-xs mb-2 uppercase tracking-widest" style={{ fontWeight: 700 }}>Studio da Maria</p>
              <h1 className="text-white mb-3" style={{ fontWeight: 900, fontSize: "clamp(1.2rem, 4vw, 2rem)", lineHeight: 1.2 }}>
                Beleza profissional<br />na sua casa 💆‍♀️
              </h1>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl bg-white/20 text-white text-xs backdrop-blur-sm" style={{ fontWeight: 600 }}>🚀 Entrega rápida</span>
                <span className="px-3 py-1.5 rounded-xl bg-white/20 text-white text-xs backdrop-blur-sm" style={{ fontWeight: 600 }}>✨ Produtos originais</span>
                <span className="px-3 py-1.5 rounded-xl bg-white/20 text-white text-xs backdrop-blur-sm" style={{ fontWeight: 600 }}>🔒 Compra segura</span>
              </div>
            </div>
          </div>
        )}

        {/* Destaques horizontais */}
        {!busca && catSel === "todos" && destaques.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground text-base" style={{ fontWeight: 700 }}>⭐ Destaques</h2>
              <button className="text-foreground text-sm flex items-center gap-1" style={{ fontWeight: 500 }}>
                Ver todos <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {destaques.map(p => (
                <div key={p.id} className="shrink-0 w-40 sm:w-48 bg-white rounded-2xl overflow-hidden border border-border cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate(`/loja/produto/${p.id}`)}>
                  <div className="relative aspect-square bg-muted">
                    <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
                    {calcDesconto(p.preco, p.precoAntigo) > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-red-500 text-white text-[10px]" style={{ fontWeight: 700 }}>
                        -{calcDesconto(p.preco, p.precoAntigo)}%
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-foreground text-xs line-clamp-2 mb-1" style={{ fontWeight: 600 }}>{p.nome}</p>
                    <p className="text-foreground text-sm" style={{ fontWeight: 800 }}>{formatCurrencyLoja(p.preco)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters row */}
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => setShowFiltros(!showFiltros)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs transition-all"
            style={{ background: showFiltros ? "#efefef" : "white", borderColor: showFiltros ? "#86cb92" : "#efefef", color: showFiltros ? "#1f2937" : "#627271", fontWeight: showFiltros ? 600 : 400 }}>
            <SlidersHorizontal size={13} /> Filtros
            {(somenteEstoque || freteGratis || precoMax < 500) && (
              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center" style={{ fontWeight: 700 }}>
                {[somenteEstoque, freteGratis, precoMax < 500].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="relative shrink-0">
            <select value={ordem} onChange={e => setOrdem(e.target.value)}
              className="pl-3 pr-8 py-2 rounded-xl border border-border bg-white text-foreground text-xs outline-none appearance-none" style={{ fontWeight: 500 }}>
              <option value="relevancia">Relevância</option>
              <option value="mais_vendidos">Mais vendidos</option>
              <option value="novidades">Novidades</option>
              <option value="preco_asc">Menor preço</option>
              <option value="preco_desc">Maior preço</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <span className="text-muted-foreground text-xs ml-auto">{filtered.length} produto(s)</span>
        </div>

        {/* Expanded filters */}
        {showFiltros && (
          <div className="bg-white rounded-2xl border border-border p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-foreground text-xs mb-2" style={{ fontWeight: 600 }}>Disponibilidade</p>
              <div className="space-y-2">
                {[
                  { label: "Apenas em estoque", val: somenteEstoque, set: setSomenteEstoque },
                  { label: "Frete grátis", val: freteGratis, set: setFreteGratis },
                ].map(f => (
                  <button key={f.label} onClick={() => f.set(!f.val)}
                    className="flex items-center gap-2 text-xs"
style={{ color: f.val ? "#1f2937" : "#627271" }}>
                    <div className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                      style={{ borderColor: f.val ? "#86cb92" : "#efefef", background: f.val ? "#86cb92" : "white" }}>
                      {f.val && <span className="text-primary-foreground text-[9px]">✓</span>}
                    </div>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-foreground text-xs mb-2" style={{ fontWeight: 600 }}>Preço máximo: {formatCurrencyLoja(precoMax)}</p>
              <input type="range" min={10} max={500} value={precoMax} onChange={e => setPrecoMax(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>R$ 10</span><span>R$ 500</span>
              </div>
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button onClick={() => { setSomenteEstoque(false); setFreteGratis(false); setPrecoMax(500); }}
                className="text-red-500 text-xs flex items-center gap-1" style={{ fontWeight: 500 }}>
                <X size={12} /> Limpar filtros
              </button>
            </div>
          </div>
        )}

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <Package size={40} className="text-muted mx-auto mb-3" />
            <p className="text-foreground mb-1" style={{ fontWeight: 600 }}>Nenhum produto encontrado</p>
            <p className="text-muted-foreground text-sm mb-5">Tente outros termos ou ajuste os filtros</p>
            <button onClick={() => { setBusca(""); setCatSel("todos"); setSomenteEstoque(false); setFreteGratis(false); setPrecoMax(500); }}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-foreground hover:text-white text-sm" style={{ fontWeight: 600 }}>
              Ver todos os produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map(p => (
              <ProdutoCard
                key={p.id} produto={p}
                onAdd={() => addToCart(p)}
                onView={() => navigate(`/loja/produto/${p.id}`)}
                inCart={carrinho.some(i => i.produto.id === p.id)}
              />
            ))}
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "🔒", title: "Compra Segura", desc: "Pagamento criptografado" },
            { icon: "🚚", title: "Entrega Rápida", desc: "Para todo o Brasil" },
            { icon: "↩️", title: "Troca Fácil", desc: "7 dias para trocar" },
            { icon: "💬", title: "Suporte WhatsApp", desc: "Atendimento humano" },
          ].map(b => (
            <div key={b.title} className="bg-white rounded-2xl p-4 border border-border text-center">
              <p className="text-2xl mb-2">{b.icon}</p>
              <p className="text-foreground text-xs" style={{ fontWeight: 700 }}>{b.title}</p>
              <p className="text-muted-foreground text-[10px]">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp FAB */}
      <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer"
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl z-30 transition-transform hover:scale-110"
        style={{ background: "#25D366" }}>
        <MessageCircle size={24} />
      </a>
    </div>
  );
}
