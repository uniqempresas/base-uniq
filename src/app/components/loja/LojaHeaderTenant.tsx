import { ClipboardList, Search, ShoppingCart, User, X } from "lucide-react";
import { LojaCategoriaBar } from "./LojaCategoriaBar";
import type { CategoriaLoja, LojaTenant } from "../../types/loja";

export interface LojaHeaderTenantProps {
  tenant: LojaTenant | null;
  slug: string;
  logado: boolean;
  /** false enquanto o localStorage da sessão não foi lido — evita CTA errado no 1º render */
  sessaoCarregada: boolean;
  busca: string;
  onBusca: (valor: string) => void;
  categorias: CategoriaLoja[];
  categoriaAtiva: number | null;
  onCategoria: (id: number | null) => void;
  quantidadeItens: number;
  onAbrirSacola: () => void;
}

/**
 * Header da vitrine (WIRE blocos ①–⑤): identidade · área do cliente · carrinho ·
 * busca · categorias.
 *
 * No desktop a busca fica inline com a identidade (como no marketplace de
 * referência); no mobile/tablet ela ocupa uma linha própria, que é o que cabe
 * em 360px sem espremer o campo.
 */
export function LojaHeaderTenant({
  tenant,
  slug,
  logado,
  sessaoCarregada,
  busca,
  onBusca,
  categorias,
  categoriaAtiva,
  onCategoria,
  quantidadeItens,
  onAbrirSacola,
}: LojaHeaderTenantProps) {
  const config = tenant?.storeConfig || {};
  const subtitulo =
    (typeof config.slogan === "string" && config.slogan.trim()) ||
    (typeof config.description === "string" && config.description.trim()) ||
    "Peça online · Entrega combinada pelo WhatsApp";

  const campo = (
    <div className="relative">
      <Search
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
        style={{ color: "#627271" }}
      />
      <input
        value={busca}
        onChange={(e) => onBusca(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onBusca("");
        }}
        aria-label="Buscar produtos"
        placeholder="Buscar no cardápio..."
        className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#86cb92]/30"
        style={{ borderColor: "#efefef", color: "#1f2937" }}
      />
      {busca && (
        <button
          type="button"
          onClick={() => onBusca("")}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2"
        >
          <X size={14} style={{ color: "#627271" }} />
        </button>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-30 border-b bg-white" style={{ borderColor: "#efefef" }}>
      <div className="mx-auto max-w-6xl px-4 py-3">
        {/* Linha 1: identidade · (busca no desktop) · área do cliente · carrinho */}
        <div className="flex items-center gap-3">
          {tenant?.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.nomeFantasia}
              className="h-11 w-11 shrink-0 rounded-lg border object-cover"
              style={{ borderColor: "#efefef", background: "#efefef" }}
            />
          ) : (
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "#86cb92" }}
            >
              <span className="text-sm" style={{ fontWeight: 900, color: "#1f2937" }}>
                {(tenant?.nomeFantasia || "L").charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base leading-tight" style={{ fontWeight: 800, color: "#1f2937" }}>
              {tenant?.nomeFantasia || "..."}
            </h1>
            <p className="truncate text-[11px]" style={{ color: "#627271" }}>
              {subtitulo}
            </p>
          </div>

          <div className="relative hidden flex-1 lg:block">{campo}</div>

          {/* Área do cliente (WIRE bloco ②): Entrar ↔ Meus pedidos */}
          {!sessaoCarregada ? (
            <div
              className="h-11 w-[92px] shrink-0 animate-pulse rounded-lg"
              style={{ background: "#efefef" }}
              aria-hidden
            />
          ) : logado ? (
            <a
              href={`/loja/${slug}/conta`}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs"
              style={{ background: "#1f2937", color: "#ffffff", fontWeight: 700, minHeight: "44px" }}
            >
              <ClipboardList size={14} />
              Meus pedidos
            </a>
          ) : (
            <a
              href={`/loja/${slug}/entrar`}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-3.5 text-xs"
              style={{
                borderColor: "#efefef",
                color: "#1f2937",
                fontWeight: 700,
                minHeight: "44px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <User size={14} />
              Entrar
            </a>
          )}

          {/* Carrinho (WIRE bloco ③) */}
          <button
            type="button"
            onClick={onAbrirSacola}
            aria-label={
              quantidadeItens > 0
                ? `Sacola, ${quantidadeItens} ${quantidadeItens === 1 ? "item" : "itens"}`
                : "Sacola vazia"
            }
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: "#efefef",
              border: quantidadeItens > 0 ? "1.5px solid #86cb92" : "1.5px solid #efefef",
            }}
          >
            <ShoppingCart size={18} style={{ color: quantidadeItens > 0 ? "#1f2937" : "#627271" }} />
            {quantidadeItens > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white"
                style={{ background: "#1f2937", fontWeight: 800 }}
              >
                {quantidadeItens}
              </span>
            )}
          </button>
        </div>

        {/* Linha 2: busca no mobile/tablet */}
        <div className="mt-3 lg:hidden">{campo}</div>

        {/* Linha 3: categorias reais (WIRE bloco ⑤) */}
        {categorias.length > 0 && (
          <div className="mt-3">
            <LojaCategoriaBar
              categorias={categorias}
              ativa={categoriaAtiva}
              onSelecionar={onCategoria}
            />
          </div>
        )}
      </div>
    </header>
  );
}
