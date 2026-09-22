import { useState } from "react";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Package,
  Info,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import type { BannerLoja } from "../../../types/loja";
import type { Produto } from "../../../types/produto";
import type { CategoriaProduto } from "../../../hooks/use-categorias";

/**
 * Lista ordenável de banners (WIRE §4.2 + §6.1).
 *
 * - Reordenar: setas ↑ ↓ sempre visíveis (alvo ≥ 44px, funcionam no toque) +
 *   drag & drop como enhancement (arrastar só pelo handle `GripVertical`).
 * - A ordem vive no estado local da página — persiste apenas em "Salvar alterações".
 * - Destino do clique resolvido por nome (produto/categoria) em vez de id cru.
 * - Sem banners salvos (origem "gerado"): aviso "SUA LOJA HOJE" exatamente como
 *   no WIRE §6.1 — nunca de outra empresa.
 */

function rotuloDestino(
  banner: BannerLoja,
  produtos: Produto[],
  categorias: CategoriaProduto[]
): string {
  if (banner.linkTipo === "grid") return "Vitrine (catálogo)";
  if (banner.linkTipo === "product") {
    const p = produtos.find((x) => x.id === banner.linkValor);
    return p ? `Produto → ${p.nome}` : "Produto";
  }
  if (banner.linkTipo === "category") {
    const c = categorias.find((x) => String(x.id) === banner.linkValor);
    return c ? `Categoria → ${c.nome}` : "Categoria";
  }
  if (banner.linkTipo === "external") {
    return banner.linkValor ? `Link externo → ${banner.linkValor}` : "Link externo";
  }
  return "Sem destino";
}

function LinhaSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#efefef] bg-white">
      <div className="flex flex-col gap-1.5">
        <div className="w-9 h-9 rounded-lg bg-[#efefef] animate-pulse" />
        <div className="w-9 h-9 rounded-lg bg-[#efefef] animate-pulse" />
      </div>
      <div className="w-24 h-16 rounded-lg bg-[#efefef] animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#efefef] rounded animate-pulse w-2/3" />
        <div className="h-3 bg-[#efefef] rounded animate-pulse w-1/2" />
        <div className="h-3 bg-[#efefef] rounded animate-pulse w-3/4" />
      </div>
    </div>
  );
}

interface BannerListaProps {
  banners: BannerLoja[];
  /** `origem === "gerado"` (nenhum banner salvo) → mostra o aviso do banner gerado */
  mostrarAvisoGerado: boolean;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
  produtos: Produto[];
  categorias: CategoriaProduto[];
  onAdicionar: () => void;
  onEditar: (banner: BannerLoja) => void;
  onRemover: (banner: BannerLoja) => void;
  onMover: (indice: number, direcao: -1 | 1) => void;
  onArrastar: (de: number, para: number) => void;
}

export function BannerLista({
  banners,
  mostrarAvisoGerado,
  carregando,
  erro,
  recarregar,
  produtos,
  categorias,
  onAdicionar,
  onEditar,
  onRemover,
  onMover,
  onArrastar,
}: BannerListaProps) {
  const [arrastando, setArrastando] = useState<number | null>(null);

  const iniciarArraste = (indice: number) => (e: React.DragEvent<HTMLDivElement>) => {
    // Drag só pelo handle — clique/arrasto em texto ou imagem não arrasta a linha
    const alvo = e.target as HTMLElement;
    const handle = alvo.closest("[data-handle-arrastar]");
    if (!handle) {
      e.preventDefault();
      return;
    }
    setArrastando(indice);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(indice));
  };

  const soltarEm = (indice: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");
    const de = raw !== "" ? Number(raw) : arrastando;
    if (de !== null && de !== undefined && Number.isFinite(de) && de !== indice) {
      onArrastar(de, indice);
    }
    setArrastando(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
            Banners
          </h2>
          <p className="text-[#627271] text-xs mt-0.5">
            Imagens que abrem o topo da loja.
          </p>
        </div>
        <button
          onClick={onAdicionar}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm min-h-11"
          style={{ background: "#86cb92", fontWeight: 600 }}
        >
          <Plus size={15} />
          Novo
        </button>
      </div>

      {/* Aviso do banner gerado — só quando nada está salvo */}
      {!carregando && !erro && mostrarAvisoGerado && banners.length === 0 && (
        <div className="rounded-xl border border-[#efefef] bg-[#FAFAFA] p-4 mb-4">
          <p className="text-[#1f2937] text-xs flex items-center gap-1.5" style={{ fontWeight: 600 }}>
            <Info size={13} className="text-[#627271]" />
            SUA LOJA HOJE
          </p>
          <p className="text-[#627271] text-xs mt-1.5 leading-relaxed">
            Sem banners salvos, a vitrine usa o <strong>banner gerado</strong>: nome
            da loja + slogan/ramo + botão "Ver o cardápio". Ele é do seu próprio
            tenant — nunca de outra empresa.
          </p>
        </div>
      )}

      {/* Loading */}
      {carregando && (
        <div className="space-y-2">
          <LinhaSkeleton />
          <LinhaSkeleton />
        </div>
      )}

      {/* Erro + retry (por bloco — WIRE §6.6) */}
      {!carregando && erro && (
        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
            Não foi possível carregar os banners.
          </p>
          <p className="text-[#627271] text-xs mb-4">{erro}</p>
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
      {!carregando && !erro && banners.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#efefef] flex items-center justify-center mx-auto mb-3">
            <ImageIcon size={24} className="text-[#627271]" />
          </div>
          <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
            Nenhum banner ainda
          </p>
          <p className="text-[#627271] text-xs">
            Adicione o primeiro para personalizar o topo da loja.
          </p>
        </div>
      )}

      {/* Linhas */}
      {!carregando && !erro && banners.length > 0 && (
        <div className="space-y-2">
          {banners.map((banner, i) => {
            const imagem = banner.desktopUrl || banner.mobileUrl;
            return (
              <div
                key={banner.id}
                draggable
                onDragStart={iniciarArraste(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={soltarEm(i)}
                onDragEnd={() => setArrastando(null)}
                className={`flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border border-[#efefef] bg-white ${
                  arrastando === i ? "opacity-50" : ""
                }`}
              >
                {/* Drag handle + setas */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span
                    data-handle-arrastar
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[#627271] cursor-grab active:cursor-grabbing hover:bg-[#efefef] transition-colors"
                    aria-grabbed={arrastando === i}
                    title="Arraste para reordenar"
                  >
                    <GripVertical size={16} />
                  </span>
                  <button
                    onClick={() => onMover(i, -1)}
                    disabled={i === 0}
                    aria-label="Mover banner para cima"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    onClick={() => onMover(i, 1)}
                    disabled={i === banners.length - 1}
                    aria-label="Mover banner para baixo"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>

                {/* Preview */}
                <div className="w-24 h-16 rounded-lg overflow-hidden border border-[#efefef] bg-[#efefef] flex items-center justify-center shrink-0">
                  {imagem ? (
                    <img
                      src={imagem}
                      alt={`Preview de ${banner.titulo}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Package size={18} className="text-[#627271] opacity-40" />
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 700 }}>
                    {banner.titulo}
                  </p>
                  {banner.subtitulo && (
                    <p className="text-[#627271] text-[11px] truncate">
                      Subtítulo: {banner.subtitulo}
                    </p>
                  )}
                  <p className="text-[#627271] text-[11px] truncate">
                    {banner.textoBotao
                      ? `Botão: "${banner.textoBotao}" · posição ${banner.posicaoBotao === "bottom-right" ? "inferior direito" : "inferior esquerdo"}`
                      : `Posição: ${banner.posicaoBotao === "bottom-right" ? "inferior direito" : "inferior esquerdo"}`}
                  </p>
                  <p className="text-[#627271] text-[11px] truncate">
                    Destino: {rotuloDestino(banner, produtos, categorias)}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => onEditar(banner)}
                    aria-label={`Editar banner ${banner.titulo}`}
                    className="w-9 h-9 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#e2e2e2] transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onRemover(banner)}
                    aria-label={`Remover banner ${banner.titulo}`}
                    className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}