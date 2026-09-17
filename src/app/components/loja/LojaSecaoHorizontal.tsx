import { ImageOff } from "lucide-react";
import { formatCurrencyLoja } from "./lojaMockData";
import type { ProdutoLoja } from "../../types/loja";

export interface LojaSecaoHorizontalProps {
  titulo: string;
  produtos: ProdutoLoja[];
}

/**
 * Seção com trilha horizontal (WIRE bloco ⑦) — a "vitrine dentro da vitrine".
 * Não renderiza com menos de 3 itens: seção quase vazia não ajuda a navegar.
 *
 * Os cards NÃO navegam (decisão do fundador, 17/09/2026): a página do produto
 * ainda carrega conteúdo que não é da Doceê. Voltam a ser clicáveis quando essa
 * tela for refeita (PRD V5).
 */
export function LojaSecaoHorizontal({ titulo, produtos }: LojaSecaoHorizontalProps) {
  if (produtos.length < 3) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-sm" style={{ fontWeight: 700, color: "#1f2937" }}>
        {titulo}
      </h2>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {produtos.map((p) => (
          <div
            key={p.id}
            className="w-36 shrink-0 snap-start overflow-hidden rounded-lg border bg-white text-left"
            style={{ borderColor: "#efefef" }}
          >
            <div className="relative aspect-square w-full" style={{ background: "#efefef" }}>
              {p.fotoUrl ? (
                <img
                  src={p.fotoUrl}
                  alt={p.nome}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  style={{ opacity: p.esgotado ? 0.5 : 1 }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageOff size={22} style={{ color: "#627271", opacity: 0.5 }} />
                </div>
              )}
              {p.esgotado && (
                <span
                  className="absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] text-white"
                  style={{ background: "#1f2937", fontWeight: 700 }}
                >
                  Esgotado
                </span>
              )}
            </div>
            <div className="p-2.5">
              <p className="line-clamp-2 text-[11px] leading-tight" style={{ fontWeight: 600, color: "#1f2937" }}>
                {p.nome}
              </p>
              <p className="mt-1 text-sm" style={{ fontWeight: 800, color: p.esgotado ? "#627271" : "#1f2937" }}>
                {formatCurrencyLoja(p.preco)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
