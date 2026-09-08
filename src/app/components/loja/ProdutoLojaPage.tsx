import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, Star, Truck, Shield, RotateCcw, Share2,
  Heart, ShoppingCart, Zap, Plus, Minus, Check,
  ChevronRight, MessageCircle, Package, X, ChevronLeft,
  Tag, AlertTriangle,
} from "lucide-react";
import {
  PRODUTOS_LOJA, formatCurrencyLoja, calcDesconto,
  type ItemCarrinhoLoja, type ProdutoLoja,
} from "./lojaMockData";

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? "#F59E0B" : "none"}
          className={i <= Math.round(rating) ? "text-amber-400" : "text-muted"} />
      ))}
    </div>
  );
}

const AVALIACOES_MOCK = [
  { id: 1, nome: "Fernanda C.", nota: 5, data: "20/03/2024", texto: "Produto incrível! Meu cabelo ficou muito mais hidratado desde o primeiro uso. Super recomendo!", foto: "" },
  { id: 2, nome: "Ana B.", nota: 5, data: "15/03/2024", texto: "Já é minha terceira compra. Não troco por nada. Cheiro maravilhoso e resultado impecável." },
  { id: 3, nome: "Juliana M.", nota: 4, data: "10/03/2024", texto: "Ótimo produto, entrega rápida. Só achei a embalagem um pouco frágil, mas o produto em si é excelente." },
];

export function ProdutoLojaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const produto = PRODUTOS_LOJA.find(p => p.id === id) || PRODUTOS_LOJA[0];
  const desconto = calcDesconto(produto.preco, produto.precoAntigo);

  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [variacaoSel, setVariacaoSel] = useState<string | null>(null);
  const [adicionado, setAdicionado] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [variacaoError, setVariacaoError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const esgotado = produto.estoque === 0;
  const temVariacoes = produto.variacoes && produto.variacoes.length > 0;
  const estoqueVariacao = temVariacoes && variacaoSel
    ? produto.variacoes![0].opcoes.find(o => o.nome === variacaoSel)?.estoque ?? 0
    : produto.estoque;
  const estoqueDisponivel = temVariacoes ? (variacaoSel ? estoqueVariacao : 0) : produto.estoque;

  const handleAddToCart = (goCheckout = false) => {
    if (temVariacoes && !variacaoSel) {
      setVariacaoError(true);
      setTimeout(() => setVariacaoError(false), 2000);
      return;
    }
    setAdicionado(true);
    setShowToast(true);
    setTimeout(() => { setAdicionado(false); setShowToast(false); }, 2000);
    if (goCheckout) navigate("/loja/checkout");
  };

  const relacionados = PRODUTOS_LOJA.filter(p => p.id !== produto.id && p.categoriaId === produto.categoriaId).slice(0, 4);

  return (
    <div className="min-h-screen bg-muted">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl shadow-2xl text-sm">
          <Check size={16} /> Adicionado ao carrinho!
        </div>
      )}

      {/* Zoom overlay */}
      {showZoom && (
        <div className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4" onClick={() => setShowZoom(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <X size={20} className="text-white" />
          </button>
          <img src={produto.imagens[fotoAtiva]} alt={produto.nome} className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/loja")}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-muted-foreground text-xs flex items-center gap-1">
              <span className="hover:text-foreground cursor-pointer" onClick={() => navigate("/loja")}>Loja</span>
              <ChevronRight size={11} />
              <span className="truncate">{produto.nome}</span>
            </p>
          </div>
          <button onClick={() => navigate("/loja/checkout")}
            className="relative w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted transition-colors">
            <ShoppingCart size={16} className="text-foreground" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="lg:grid lg:grid-cols-2 lg:gap-10">

          {/* Gallery */}
          <div>
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden bg-white mb-3 aspect-square cursor-zoom-in border border-border"
              onClick={() => setShowZoom(true)}>
              <img src={produto.imagens[fotoAtiva]} alt={produto.nome}
                className="w-full h-full object-cover" />
              {desconto > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-red-500 text-white text-sm" style={{ fontWeight: 700 }}>
                  -{desconto}% OFF
                </div>
              )}
              {esgotado && (
                <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                  <p className="text-white bg-foreground/60 px-4 py-2 rounded-xl" style={{ fontWeight: 700 }}>Produto Esgotado</p>
                </div>
              )}
              {/* Nav arrows */}
              {produto.imagens.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setFotoAtiva(f => Math.max(0, f - 1)); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    style={{ opacity: fotoAtiva === 0 ? 0.4 : 1 }}>
                    <ChevronLeft size={16} className="text-foreground" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setFotoAtiva(f => Math.min(produto.imagens.length - 1, f + 1)); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    style={{ opacity: fotoAtiva === produto.imagens.length - 1 ? 0.4 : 1 }}>
                    <ChevronRight size={16} className="text-foreground" />
                  </button>
                </>
              )}
              {/* Counter */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-foreground/50 text-white text-[10px]" style={{ fontWeight: 600 }}>
                {fotoAtiva + 1}/{produto.imagens.length}
              </div>
            </div>

            {/* Thumbnails */}
            {produto.imagens.length > 1 && (
              <div className="flex gap-2">
                {produto.imagens.map((img, i) => (
                  <button key={i} onClick={() => setFotoAtiva(i)}
                    className="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all"
                    style={{ borderColor: fotoAtiva === i ? "#86cb92" : "#efefef" }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-5 lg:mt-0">
            {/* Category + Share */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-foreground text-xs px-2.5 py-1 rounded-full bg-muted border border-border cursor-pointer hover:bg-muted"
                style={{ fontWeight: 600 }} onClick={() => navigate("/loja")}>
                {produto.categoria}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setWishlist(!wishlist)}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-red-50 transition-colors">
                  <Heart size={16} fill={wishlist ? "#EF4444" : "none"} className={wishlist ? "text-red-500" : "text-muted-foreground"} />
                </button>
                <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
                  <Share2 size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Name */}
            <h1 className="text-foreground mb-3" style={{ fontWeight: 800, fontSize: "clamp(1.1rem, 3vw, 1.4rem)", lineHeight: 1.3 }}>
              {produto.nome}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <Stars rating={produto.avaliacaoMedia} />
              <span className="text-foreground text-sm" style={{ fontWeight: 600 }}>{produto.avaliacaoMedia}</span>
              <span className="text-muted-foreground text-sm">({produto.totalAvaliacoes} avaliações)</span>
              <span className="text-muted-foreground text-sm">· {produto.vendidos} vendidos</span>
            </div>

            {/* Price */}
            <div className="bg-muted rounded-2xl p-4 mb-5 border border-border">
              {produto.precoAntigo && (
                <p className="text-muted-foreground text-sm line-through">{formatCurrencyLoja(produto.precoAntigo)}</p>
              )}
              <div className="flex items-end gap-3 mb-1">
                <p className="text-foreground" style={{ fontWeight: 900, fontSize: "2rem", lineHeight: 1, color: esgotado ? "#627271" : "#1f2937" }}>
                  {formatCurrencyLoja(produto.preco)}
                </p>
                {desconto > 0 && (
                  <span className="px-2.5 py-1 rounded-xl bg-red-100 text-red-700 text-sm mb-1" style={{ fontWeight: 700 }}>
                    -{desconto}%
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                em até <strong className="text-foreground">10x de {formatCurrencyLoja(produto.preco / 10)}</strong> sem juros
              </p>
              <p className="text-foreground text-sm mt-1" style={{ fontWeight: 600 }}>
                ⚡ ou {formatCurrencyLoja(produto.preco * 0.9)} no PIX (10% off)
              </p>
            </div>

            {/* Tags */}
            {produto.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {produto.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px]" style={{ fontWeight: 500 }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Variações */}
            {temVariacoes && (
              <div className="mb-5">
                <p className="text-foreground text-sm mb-2" style={{ fontWeight: 600 }}>
                  {produto.variacoes![0].tipo}
                  {variacaoError && <span className="ml-2 text-red-500 text-xs">← Selecione uma opção!</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {produto.variacoes![0].opcoes.map(op => {
                    const semEstoqueOp = op.estoque === 0;
                    const isSelected = variacaoSel === op.nome;
                    return (
                      <button key={op.nome} onClick={() => !semEstoqueOp && setVariacaoSel(op.nome)}
                        disabled={semEstoqueOp}
                        className="px-4 py-2 rounded-xl border-2 text-sm transition-all"
                        style={{
                          borderColor: isSelected ? "#86cb92" : variacaoError ? "#EF4444" : "#efefef",
                          background: isSelected ? "#efefef" : semEstoqueOp ? "#efefef" : "white",
                          color: isSelected ? "#1f2937" : semEstoqueOp ? "#627271" : "#1f2937",
                          fontWeight: isSelected ? 700 : 400,
                          textDecoration: semEstoqueOp ? "line-through" : "none",
                          opacity: semEstoqueOp ? 0.5 : 1,
                        }}>
                        {op.nome}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantidade */}
            {!esgotado && (
              <div className="flex items-center gap-4 mb-5">
                <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>Quantidade</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Minus size={15} className="text-foreground" />
                  </button>
                  <span className="w-10 text-center text-foreground text-base" style={{ fontWeight: 700 }}>{quantidade}</span>
                  <button onClick={() => setQuantidade(q => Math.min(estoqueDisponivel || produto.estoque, q + 1))}
                    className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Plus size={15} className="text-foreground" />
                  </button>
                </div>
                {produto.estoque < 10 && produto.estoque > 0 && !temVariacoes && (
                  <p className="text-amber-600 text-xs" style={{ fontWeight: 500 }}>
                    ⚠️ Apenas {produto.estoque} em estoque!
                  </p>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            {esgotado ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl text-center border" style={{ background: "#efefef", borderColor: "#efefef" }}>
                  <Package size={24} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>Produto Esgotado</p>
                  <p className="text-muted-foreground text-xs">Infelizmente este produto acabou</p>
                </div>
                <button className="w-full py-3 rounded-2xl border border-primary text-foreground text-sm" style={{ fontWeight: 600 }}>
                  📧 Avise-me quando chegar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={() => handleAddToCart(true)}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground hover:bg-foreground hover:text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ fontWeight: 800, fontSize: "1.05rem" }}>
                  <Zap size={20} /> Comprar Agora
                </button>
                <button onClick={() => handleAddToCart(false)}
                  className="w-full py-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ borderColor: "#86cb92", color: "#1f2937", fontWeight: 700, background: adicionado ? "#efefef" : "white" }}>
                  {adicionado ? <><Check size={18} /> Adicionado!</> : <><ShoppingCart size={18} /> Adicionar ao Carrinho</>}
                </button>
                <button className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 bg-muted border border-border transition-all">
                  <MessageCircle size={16} className="text-[#25D366]" />
                  <span className="text-foreground text-sm" style={{ fontWeight: 600 }}>Comprar via WhatsApp</span>
                </button>
              </div>
            )}

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              {[
{ icon: Shield, label: "Compra Segura", color: "#1f2937" },
                { icon: Truck, label: "Entrega Rápida", color: "#3B82F6" },
                { icon: RotateCcw, label: "Troca em 7 dias", color: "#8B5CF6" },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.label} className="text-center p-2.5 rounded-xl border border-border bg-white">
                    <Icon size={16} style={{ color: t.color }} className="mx-auto mb-1" />
                    <p className="text-foreground text-[10px]" style={{ fontWeight: 500 }}>{t.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabs: Descrição | Especificações | Avaliações */}
        <div className="mt-10">
          <div className="bg-white rounded-3xl border border-border overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {/* Descrição */}
            <div className="p-6 border-b border-border">
              <h2 className="text-foreground mb-3" style={{ fontWeight: 700 }}>Descrição</h2>
              <p className="text-foreground text-sm leading-relaxed">{produto.descricaoLonga}</p>
            </div>

            {/* Especificações */}
            {produto.especificacoes.length > 0 && (
              <div className="p-6 border-b border-border">
                <h2 className="text-foreground mb-3" style={{ fontWeight: 700 }}>Especificações</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {produto.especificacoes.map(e => (
                    <div key={e.label} className="flex justify-between py-2 border-b border-border last:border-b-0">
                      <span className="text-muted-foreground text-sm">{e.label}</span>
                      <span className="text-foreground text-sm" style={{ fontWeight: 600 }}>{e.valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avaliações */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-foreground" style={{ fontWeight: 700 }}>Avaliações</h2>
                <div className="flex items-center gap-2">
                  <Stars rating={produto.avaliacaoMedia} />
                  <span className="text-foreground text-sm" style={{ fontWeight: 700 }}>{produto.avaliacaoMedia}</span>
                  <span className="text-muted-foreground text-sm">/ 5 ({produto.totalAvaliacoes})</span>
                </div>
              </div>
              <div className="space-y-4">
                {AVALIACOES_MOCK.map(a => (
                  <div key={a.id} className="pb-4 border-b border-border last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground text-xs" style={{ fontWeight: 700 }}>
                        {a.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>{a.nome}</p>
                        <div className="flex items-center gap-1.5">
                          <Stars rating={a.nota} size={11} />
                          <span className="text-muted-foreground text-[10px]">{a.data}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">{a.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <div className="mt-10">
            <h2 className="text-foreground mb-5" style={{ fontWeight: 700 }}>Você também pode gostar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relacionados.map(p => (
                <button key={p.id} onClick={() => navigate(`/loja/produto/${p.id}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-border hover:border-primary hover:shadow-md transition-all text-left group">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <p className="text-foreground text-xs line-clamp-2 mb-1" style={{ fontWeight: 600 }}>{p.nome}</p>
                    <p className="text-foreground text-sm" style={{ fontWeight: 800 }}>{formatCurrencyLoja(p.preco)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
