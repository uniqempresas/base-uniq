import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Search,
  Package,
  Pencil,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useProdutos } from "../../hooks/use-produtos";
import { useCategorias } from "../../hooks/use-categorias";
import { formatCurrency } from "../../lib/produto-utils";
import { ProdutoFormModal } from "../produto/ProdutoFormModal";
import { getTagPalette } from "../../hooks/use-tags";
import type { Produto } from "../../types/produto";

/**
 * Tela `/loja-virtual/produtos` — catálogo do módulo (WIRE §5.1).
 *
 * Lista com busca (nome/SKU), preço + "de R$ X" riscado (precoPromocional),
 * estoque com unidade, badge "Na vitrine"/"Fora da vitrine" (exibirVitrine) e
 * o **mesmo** `ProdutoFormModal` do Estoque (uma única fonte de formulário).
 *
 * Estados: loading (skeleton) · vazio com CTA · erro + retry · sucesso.
 */

/** Badge da vitrine — texto acompanha a cor (nada transmitido só por cor). */
function BadgeVitrine({ naVitrine }: { naVitrine: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] ${
        naVitrine
          ? "bg-[#86cb92]/20 text-[#1f2937]"
          : "bg-[#efefef] text-[#627271]"
      }`}
      style={{ fontWeight: 600 }}
    >
      {naVitrine ? "Na vitrine" : "Fora da vitrine"}
    </span>
  );
}

function LinhaSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#efefef] bg-white">
      <div className="w-14 h-14 rounded-xl bg-[#efefef] animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#efefef] rounded animate-pulse w-2/3" />
        <div className="h-3 bg-[#efefef] rounded animate-pulse w-1/2" />
      </div>
      <div className="w-16 h-8 bg-[#efefef] rounded-lg animate-pulse" />
    </div>
  );
}

export function ProdutosLojaPage() {
  const navigate = useNavigate();
  const {
    produtos,
    loading,
    error,
    isFallback,
    recarregar,
  } = useProdutos();
  const { categorias } = useCategorias();

  const [busca, setBusca] = useState("");
  const [showNovo, setShowNovo] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | null>(null);

  const naVitrine = produtos.filter((p) => p.exibirVitrine !== false).length;

  const filtrados = produtos.filter((p) => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      p.nome.toLowerCase().includes(termo) ||
      p.sku.toLowerCase().includes(termo) ||
      (p.codigoBarras || "").includes(busca)
    );
  });

  const abrirNovo = () => setShowNovo(true);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/loja-virtual")}
            className="w-9 h-9 rounded-xl bg-white border border-[#efefef] flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors shrink-0"
            aria-label="Voltar para a Loja Virtual"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              Produtos da loja
            </h1>
            <p className="text-[#627271] text-sm">
              {loading
                ? "Carregando..."
                : `${produtos.length} produto${produtos.length !== 1 ? "s" : ""} · ${naVitrine} na vitrine`}
            </p>
          </div>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm shrink-0 min-h-11"
          style={{ background: "#86cb92", fontWeight: 600 }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Novo</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>

      {/* Fallback (demo) */}
      {isFallback && !loading && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
          <AlertTriangle size={14} className="shrink-0" />
          Mostrando dados de exemplo. Cadastre produtos para ver dados reais.
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          <LinhaSkeleton />
          <LinhaSkeleton />
          <LinhaSkeleton />
        </div>
      )}

      {/* Erro + retry */}
      {!loading && error && (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
            Não foi possível carregar os produtos.
          </p>
          <p className="text-[#627271] text-xs mb-4">{error}</p>
          <button
            onClick={recarregar}
            className="px-4 py-2 rounded-xl text-[#1f2937] text-sm"
            style={{ background: "#86cb92", fontWeight: 600 }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Vazio */}
      {!loading && !error && produtos.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#efefef] flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-[#627271]" />
          </div>
          <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
            Nenhum produto ainda
          </p>
          <p className="text-[#627271] text-xs mb-5">
            Cadastre o primeiro produto para sua loja ter catálogo.
          </p>
          <button
            onClick={abrirNovo}
            className="px-5 py-2.5 rounded-xl text-[#1f2937] text-sm"
            style={{ background: "#86cb92", fontWeight: 600 }}
          >
            + Adicionar produto
          </button>
        </div>
      )}

      {/* Lista */}
      {!loading && !error && produtos.length > 0 && (
        <>
          {filtrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-8 text-center">
              <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
                Nenhum produto encontrado
              </p>
              <p className="text-[#627271] text-xs">Tente outro termo de busca.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtrados.map((produto) => {
                const temFoto = Boolean(produto.foto);
                const mostrarPromo =
                  produto.precoPromocional !== undefined &&
                  produto.precoPromocional > 0 &&
                  produto.precoPromocional > produto.precoVenda;
                const naVitrine = produto.exibirVitrine !== false;
                const catColors = getTagPalette(produto.categoriaCor);

                return (
                  <div
                    key={produto.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#efefef] bg-white"
                  >
                    {/* Foto / placeholder */}
                    <div
                      className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
                      style={{ background: produto.categoriaCor ? catColors.bg : "#efefef" }}
                    >
                      {temFoto ? (
                        <img
                          src={produto.foto}
                          alt={produto.nome}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Package size={20} className="text-[#627271] opacity-50" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 700 }}>
                        {produto.nome}
                      </p>
                      <p className="text-[#627271] text-[11px] truncate">
                        {produto.sku}
                        {produto.categoria ? ` · ${produto.categoria}` : ""}
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
                          {formatCurrency(produto.precoVenda)}
                        </span>
                        {mostrarPromo && (
                          <span className="text-[#627271] text-[11px] line-through">
                            de {formatCurrency(produto.precoPromocional!)}
                          </span>
                        )}
                      </div>
                      <p className="text-[#627271] text-[11px]">
                        {produto.estoque} {produto.unidade} em estoque
                      </p>
                    </div>

                    {/* Vitrine + ações */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <BadgeVitrine naVitrine={naVitrine} />
                      <button
                        onClick={() => setProdutoParaEditar(produto)}
                        aria-label={`Editar ${produto.nome}`}
                        className="w-9 h-9 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#e2e2e2] transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal compartilhado */}
      {showNovo && (
        <ProdutoFormModal
          categorias={categorias}
          onClose={() => setShowNovo(false)}
          onSuccess={() => {
            setShowNovo(false);
            toast.success("Produto cadastrado com sucesso!");
            recarregar();
          }}
        />
      )}
      {produtoParaEditar && (
        <ProdutoFormModal
          produto={produtoParaEditar}
          categorias={categorias}
          onClose={() => setProdutoParaEditar(null)}
          onSuccess={() => {
            setProdutoParaEditar(null);
            toast.success("Produto atualizado com sucesso!");
            recarregar();
          }}
        />
      )}
    </div>
  );
}