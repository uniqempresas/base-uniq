import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Store,
  ShoppingBag,
  Palette,
  AlertTriangle,
  CheckCircle2,
  Link2,
  Copy,
  ExternalLink,
  Palette as PaletaIcon,
  Package,
  Tags,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useProdutos } from "../../hooks/use-produtos";
import { useLojaTenant } from "../../hooks/use-loja-tenant";
import { useLojaAppearance } from "../../hooks/use-loja-appearance";

/** URL base pública (WIRE §3) — o link da vitrine completa é montado aqui. */
const URL_BASE_LOJA = "https://base-uniq.vercel.app";

/**
 * Tela `/loja-virtual` — Hub do módulo (WIRE §3).
 *
 * Estado da loja (vitrine · aparência · link) com loading/erro+retry/sucesso,
 * atalhos para Aparência / Produtos / Categorias (redirect) e o link da
 * vitrine com copiar/abrir.
 *
 * - Mobile: coluna única — estado → link → atalhos.
 * - Desktop (≥ 1024px): link no cabeçalho; 3 cards de estado + 3 cards-atalho.
 */

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 space-y-3">
      <div className="w-10 h-10 rounded-xl bg-[#efefef] animate-pulse" />
      <div className="h-4 bg-[#efefef] rounded animate-pulse w-3/4" />
      <div className="h-3 bg-[#efefef] rounded animate-pulse w-1/2" />
    </div>
  );
}

export function LojaVirtualHubPage() {
  const navigate = useNavigate();
  const { empresa } = useAuth();
  const slug = empresa?.slug || undefined;

  const {
    produtos,
    loading: carregandoProdutos,
    error: erroProdutos,
    recarregar: recarregarProdutos,
  } = useProdutos();
  const {
    tenant,
    loading: carregandoTenant,
    error: erroTenant,
    refetch: refetchTenant,
  } = useLojaTenant(slug);
  const appearance = useLojaAppearance(tenant);

  const carregando = carregandoProdutos || carregandoTenant;
  const erro = erroProdutos || erroTenant;
  const tentarNovamente = () => {
    recarregarProdutos();
    refetchTenant();
  };

  const naVitrine = produtos.filter((p) => p.exibirVitrine !== false).length;
  const nBanners = appearance.origem === "config" ? appearance.banners.length : 0;
  const temaTemChaves = tenant?.appearance?.theme
    ? Object.keys(tenant.appearance.theme).length > 0
    : false;
  const linkCompleto = slug ? `${URL_BASE_LOJA}/loja/${slug}` : null;

  const copiarLink = async () => {
    if (!linkCompleto) return;
    try {
      await navigator.clipboard.writeText(linkCompleto);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const abrirLoja = () => {
    if (!linkCompleto) return;
    window.open(linkCompleto, "_blank", "noopener,noreferrer");
  };

  /* ── Cards de estado (loading · erro · sucesso) ── */
  const renderEstado = () => {
    if (carregando) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      );
    }

    if (erro) {
      return (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
            Não foi possível carregar o estado da loja.
          </p>
          <p className="text-[#627271] text-xs mb-4">{erro}</p>
          <button
            onClick={tentarNovamente}
            className="px-4 py-2 rounded-xl text-[#1f2937] text-sm"
            style={{ background: "#86cb92", fontWeight: 600 }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Catálogo */}
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center mb-3">
            <ShoppingBag size={18} className="text-[#627271]" />
          </div>
          <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
            {naVitrine} produto{naVitrine !== 1 ? "s" : ""} na vitrine
          </p>
          <p className="text-[#627271] text-xs mt-1">{produtos.length} no catálogo</p>
          <button
            onClick={() => navigate("/loja-virtual/produtos")}
            className="mt-3 text-xs text-[#1f2937] hover:underline"
            style={{ fontWeight: 600 }}
          >
            Ver produtos →
          </button>
        </div>

        {/* Aparência */}
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center mb-3">
            <Palette size={18} className="text-[#627271]" />
          </div>
          <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
            {nBanners} banner{nBanners !== 1 ? "s" : ""} configurado{nBanners !== 1 ? "s" : ""} ·{" "}
            {temaTemChaves ? "tema salvo" : "tema padrão"}
          </p>
          <p className="text-[#627271] text-xs mt-1">Topo e identidade da loja</p>
          <button
            onClick={() => navigate("/loja-virtual/aparencia")}
            className="mt-3 text-xs text-[#1f2937] hover:underline"
            style={{ fontWeight: 600 }}
          >
            Configurar aparência →
          </button>
        </div>

        {/* Status */}
        {appearance.origem === "gerado" ? (
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
              Usando banner padrão
            </p>
            <p className="text-[#627271] text-xs mt-1">
              Sua loja exibe o banner gerado com nome e slogan.
            </p>
            <button
              onClick={() => navigate("/loja-virtual/aparencia")}
              className="mt-3 text-xs text-[#1f2937] hover:underline"
              style={{ fontWeight: 600 }}
            >
              Configurar aparência →
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-[#86cb92]/20 flex items-center justify-center mb-3">
              <CheckCircle2 size={18} className="text-[#1f2937]" />
            </div>
            <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
              Sua loja está no ar
            </p>
            <p className="text-[#627271] text-xs mt-1">
              {nBanners} banner{nBanners !== 1 ? "s" : ""} e identidade publicados.
            </p>
            <button
              onClick={abrirLoja}
              className="mt-3 text-xs text-[#1f2937] hover:underline inline-flex items-center gap-1"
              style={{ fontWeight: 600 }}
            >
              Abrir loja <ExternalLink size={11} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderLinkCard = () => (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center shrink-0">
          <Link2 size={18} className="text-[#627271]" />
        </div>
        <div className="min-w-0">
          <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
            Link da sua loja
          </p>
          <p className="text-[#627271] text-xs truncate">
            {linkCompleto || "Entre com sua conta para ver o link"}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={copiarLink}
          disabled={!linkCompleto}
          aria-label="Copiar link da loja"
          className="flex-1 min-h-11 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors disabled:opacity-40"
          style={{ fontWeight: 600 }}
        >
          <Copy size={13} />
          Copiar
        </button>
        <button
          onClick={abrirLoja}
          disabled={!linkCompleto}
          aria-label="Abrir loja em nova aba"
          className="flex-1 min-h-11 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[#1f2937] text-xs disabled:opacity-40"
          style={{ background: "#86cb92", fontWeight: 600 }}
        >
          <ExternalLink size={13} />
          Abrir
        </button>
      </div>
    </div>
  );

  const ATAALHOS = [
    {
      label: "Aparência",
      descricao: "Banner, carrossel, tema e identidade",
      icon: PaletaIcon,
      onClick: () => navigate("/loja-virtual/aparencia"),
    },
    {
      label: "Produtos",
      descricao: "Catálogo da sua loja",
      icon: Package,
      onClick: () => navigate("/loja-virtual/produtos"),
    },
    {
      label: "Categorias",
      descricao: "Abre o CRUD do Estoque",
      icon: Tags,
      onClick: () => navigate("/estoque/configuracoes"),
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white border border-[#efefef] flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              Loja Virtual
            </h1>
            <p className="text-[#627271] text-sm">Gerencie sua vitrine digital</p>
          </div>
        </div>

        {/* Link da vitrine — desktop (sobe para o cabeçalho, WIRE §3) */}
        <div className="hidden lg:flex items-center gap-2 min-w-0">
          {linkCompleto && (
            <>
              <span className="text-[#627271] text-xs font-mono truncate max-w-[220px]">
                /loja/{slug}
              </span>
              <button
                onClick={copiarLink}
                aria-label="Copiar link da loja"
                className="w-10 h-10 rounded-xl border border-[#efefef] bg-white flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors shrink-0"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={abrirLoja}
                aria-label="Abrir loja em nova aba"
                className="h-10 px-3.5 rounded-xl text-[#1f2937] text-xs flex items-center gap-1.5 shrink-0"
                style={{ background: "#86cb92", fontWeight: 600 }}
              >
                <ExternalLink size={13} />
                Abrir
              </button>
            </>
          )}
          {!linkCompleto && (
            <span className="text-[#627271] text-xs">
              Entre com sua conta para ver o link
            </span>
          )}
        </div>
      </div>

      {/* Estado */}
      {renderEstado()}

      {/* Link — mobile/tablet (desktop já tem no header) */}
      <div className="lg:hidden">{renderLinkCard()}</div>

      {/* Atalhos */}
      <div>
        <h2 className="text-[#1f2937] text-sm mb-3" style={{ fontWeight: 700 }}>
          Começar por
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ATAALHOS.map(({ label, descricao, icon: Icone, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 text-left hover:border-[#86cb92] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center mb-3">
                <Icone size={18} className="text-[#627271]" />
              </div>
              <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
                {label}
              </p>
              <p className="text-[#627271] text-xs mt-1">{descricao}</p>
            </button>
          ))}
        </div>
      </div>

      <p className="text-[#627271] text-xs px-1 flex items-center gap-1.5">
        <Store size={12} />
        A loja pública fica em <span className="font-mono text-[#1f2937]">https://base-uniq.vercel.app/loja/{slug || "..."}</span>
      </p>
    </div>
  );
}