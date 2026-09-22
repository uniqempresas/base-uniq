import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useLojaTenant } from "../../hooks/use-loja-tenant";
import { useLojaAppearance } from "../../hooks/use-loja-appearance";
import {
  useAtualizarAparenciaLoja,
  type PatchAparencia,
} from "../../hooks/use-atualizar-aparencia-loja";
import { useProdutos } from "../../hooks/use-produtos";
import { useCategorias } from "../../hooks/use-categorias";
import type { BannerLoja, StoreConfigLoja, TemaLoja } from "../../types/loja";
import { BannerLista } from "./editor/BannerLista";
import { CarrosselConfig } from "./editor/CarrosselConfig";
import { TemaConfig } from "./editor/TemaConfig";
import { IdentidadeConfig } from "./editor/IdentidadeConfig";
import { BannerFormModal } from "./editor/BannerFormModal";

/** URL base pública (WIRE §3) — o "Ver loja" abre `/loja/:slug` nesta origem. */
const URL_BASE_LOJA = "https://base-uniq.vercel.app";

/**
 * Tela `/loja-virtual/aparencia` — EDITOR (WIRE §4).
 *
 * 4 blocos (Banners · Carrossel · Tema · Identidade) com skeleton/erro+retry
 * próprios e **um único fluxo de gravação** (`use-atualizar-aparencia-loja`,
 * merge em 2 níveis): os blocos só alimentam o estado local; o clique em
 * "Salvar alterações" consolida tudo num patch.
 *
 * - Estado local sincroniza do tenant assim que carrega (nunca durante o
 *   loading) e volta a sincronizar após salvar (refetch).
 * - Banners da lista: só os configurados (`origem === "config"`) — o banner
 *   gerado nunca aparece na lista.
 * - Intervalo < 2000: o próprio bloco mostra o erro inline e a página bloqueia
 *   o salvar (toast explícito, nunca silencioso).
 * - Barra de salvar: sticky full-width no mobile · canto inferior direito no
 *   desktop.
 */

export function AparenciaPage() {
  const navigate = useNavigate();
  const { empresa } = useAuth();
  const slug = empresa?.slug || undefined;

  const { tenant, loading: carregandoTenant, error: erroTenant, refetch: refetchTenant } =
    useLojaTenant(slug);
  const appearance = useLojaAppearance(tenant);
  const { salvar, loading: salvando } = useAtualizarAparenciaLoja();
  const { produtos } = useProdutos();
  const { categorias } = useCategorias();

  // ── Estado local (a tela é dona dos valores até o "Salvar alterações") ──
  const [banners, setBanners] = useState<BannerLoja[]>([]);
  const [autoplay, setAutoplay] = useState(true);
  const [intervalo, setIntervalo] = useState(5000);
  const [tema, setTema] = useState<TemaLoja>({
    primaryColor: "#86cb92",
    secondaryColor: "#1f2937",
    borderRadius: "8px",
    fontFamily: "Poppins",
  });
  const [storeConfig, setStoreConfig] = useState<StoreConfigLoja>({});

  // Sincroniza do tenant quando ele carrega/recarrega — nunca durante loading
  // e nunca com erro (a tela mostra o card de erro + retry no lugar dos blocos).
  useEffect(() => {
    if (carregandoTenant || erroTenant) return;
    setBanners(appearance.origem === "config" ? appearance.banners : []);
    // Sem dados salvos o WIRE manda exibir autoplay LIGADO + 5000ms (origem gerado)
    setAutoplay(appearance.origem === "gerado" ? true : appearance.autoplay);
    setIntervalo(appearance.interval);
    setTema({ ...appearance.tema });
    setStoreConfig((atual) => ({
      ...atual,
      slogan: tenant?.storeConfig?.slogan ?? "",
      description: tenant?.storeConfig?.description ?? "",
      ramoAtuacao: tenant?.storeConfig?.ramoAtuacao ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appearance, carregandoTenant, erroTenant, tenant]);

  // ── Modal de banner + confirmação de remoção ──
  const [modalAberto, setModalAberto] = useState(false);
  const [bannerEmEdicao, setBannerEmEdicao] = useState<BannerLoja | null>(null);
  const [bannerParaRemover, setBannerParaRemover] = useState<BannerLoja | null>(null);

  const abrirNovo = () => {
    setBannerEmEdicao(null);
    setModalAberto(true);
  };

  const abrirEdicao = (banner: BannerLoja) => {
    setBannerEmEdicao(banner);
    setModalAberto(true);
  };

  const salvarBannerNoModal = (banner: BannerLoja) => {
    setBanners((prev) => {
      const existe = prev.some((b) => b.id === banner.id);
      return existe ? prev.map((b) => (b.id === banner.id ? banner : b)) : [...prev, banner];
    });
    setModalAberto(false);
    setBannerEmEdicao(null);
  };

  const moverBanner = (indice: number, direcao: -1 | 1) => {
    setBanners((prev) => {
      const alvo = indice + direcao;
      if (alvo < 0 || alvo >= prev.length) return prev;
      const copia = [...prev];
      const [item] = copia.splice(indice, 1);
      copia.splice(alvo, 0, item);
      return copia;
    });
  };

  const arrastarBanner = (de: number, para: number) => {
    setBanners((prev) => {
      if (de === para || de < 0 || para < 0 || de >= prev.length || para >= prev.length) {
        return prev;
      }
      const copia = [...prev];
      const [item] = copia.splice(de, 1);
      copia.splice(para, 0, item);
      return copia;
    });
  };

  // ── Salvar ──
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const [salvoAgora, setSalvoAgora] = useState(false);

  useEffect(() => {
    if (!salvoAgora) return;
    const t = setTimeout(() => setSalvoAgora(false), 3000);
    return () => clearTimeout(t);
  }, [salvoAgora]);

  const handleSalvar = async () => {
    if (!Number.isFinite(intervalo) || intervalo < 2000) {
      toast.error("O intervalo mínimo é de 2000ms.");
      return;
    }

    setErroSalvar(null);

    const patch: PatchAparencia = {
      appearance: {
        hero: { autoplay, interval: intervalo, banners },
        theme: { ...tema },
      },
      storeConfig: {
        slogan: storeConfig.slogan || "",
        description: storeConfig.description || "",
        ramoAtuacao: storeConfig.ramoAtuacao || "",
      },
    };

    const res = await salvar(patch);
    if (res.success) {
      toast.success("Alterações salvas");
      setSalvoAgora(true);
      refetchTenant();
    } else {
      toast.error("Não foi possível salvar. Tente novamente.");
      setErroSalvar(res.error || null);
    }
  };

  const abrirLoja = () => {
    if (!slug) return;
    window.open(`${URL_BASE_LOJA}/loja/${slug}`, "_blank", "noopener,noreferrer");
  };

  // ── Erro de carregamento do tenant: card único + retry ──
  if (!carregandoTenant && erroTenant) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/loja-virtual")}
            className="w-9 h-9 rounded-xl bg-white border border-[#efefef] flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors"
            aria-label="Voltar para a Loja Virtual"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              Aparência da loja
            </h1>
            <p className="text-[#627271] text-sm">Banner, tema e identidade</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
            Não foi possível carregar a aparência.
          </p>
          <p className="text-[#627271] text-xs mb-4">{erroTenant}</p>
          <button
            onClick={refetchTenant}
            className="px-4 py-2 rounded-xl text-[#1f2937] text-sm"
            style={{ background: "#86cb92", fontWeight: 600 }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
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
              Aparência da loja
            </h1>
            <p className="text-[#627271] text-sm">Banner, tema e identidade</p>
          </div>
        </div>
        <button
          onClick={abrirLoja}
          disabled={!slug}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors disabled:opacity-40 min-h-11"
          style={{ fontWeight: 500 }}
          title={!slug ? "Entre com sua conta para ver a loja" : "Abrir sua loja em nova aba"}
        >
          <Eye size={14} />
          Ver loja
        </button>
      </div>

      {/* Blocos */}
      <div className="space-y-5">
        <BannerLista
          banners={banners}
          mostrarAvisoGerado={appearance.origem === "gerado"}
          carregando={carregandoTenant}
          erro={erroTenant}
          recarregar={refetchTenant}
          produtos={produtos}
          categorias={categorias}
          onAdicionar={abrirNovo}
          onEditar={abrirEdicao}
          onRemover={setBannerParaRemover}
          onMover={moverBanner}
          onArrastar={arrastarBanner}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CarrosselConfig
            autoplay={autoplay}
            intervalo={intervalo}
            carregando={carregandoTenant}
            erro={erroTenant}
            recarregar={refetchTenant}
            onChangeAutoplay={setAutoplay}
            onChangeIntervalo={setIntervalo}
          />
          <TemaConfig
            tema={tema}
            carregando={carregandoTenant}
            erro={erroTenant}
            recarregar={refetchTenant}
            onChange={setTema}
          />
        </div>

        <IdentidadeConfig
          storeConfig={storeConfig}
          carregando={carregandoTenant}
          erro={erroTenant}
          recarregar={refetchTenant}
          onChange={(patch) => setStoreConfig((atual) => ({ ...atual, ...patch }))}
        />
      </div>

      {/* Erro inline do salvar — nunca silencioso */}
      {erroSalvar && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs"
          style={{ fontWeight: 500 }}
        >
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          {erroSalvar}
        </div>
      )}

      {/* Botão "Ver loja" — visível só no mobile (desktop fica no header) */}
      <button
        onClick={abrirLoja}
        disabled={!slug}
        className="sm:hidden mt-4 w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs disabled:opacity-40"
        style={{ fontWeight: 500 }}
      >
        <Eye size={14} />
        Ver loja
      </button>

      {/* Barra de salvar — sticky no mobile · canto inferior direito no desktop */}
      <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 mt-5 bg-white/95 backdrop-blur border-t border-[#efefef] lg:bg-transparent lg:border-0 lg:mx-0 lg:px-0 lg:py-5">
        <div className="lg:flex lg:justify-end">
          <button
            onClick={handleSalvar}
            disabled={salvando || carregandoTenant}
            className="w-full lg:w-auto min-h-12 px-8 py-3 rounded-xl text-[#1f2937] text-sm flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg lg:shadow-none"
            style={{ background: salvoAgora ? "#efefef" : "#86cb92", fontWeight: 700 }}
          >
            {salvando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : salvoAgora ? (
              <>
                <CheckCircle2 size={16} />
                Salvo ✓
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
        </div>
      </div>

      {/* Modal de banner */}
      {modalAberto && (
        <BannerFormModal
          banner={bannerEmEdicao}
          produtos={produtos}
          categorias={categorias}
          empresaId={empresa?.id}
          onClose={() => {
            setModalAberto(false);
            setBannerEmEdicao(null);
          }}
          onSalvar={salvarBannerNoModal}
        />
      )}

      {/* Confirmação de remoção (WIRE §6.7) */}
      {bannerParaRemover && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setBannerParaRemover(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-remover-banner"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-remover-banner" className="text-[#1f2937] text-base mb-3" style={{ fontWeight: 700 }}>
              Remover este banner?
            </h2>
            <p className="text-[#627271] text-sm mb-5">
              "{bannerParaRemover.titulo}" deixa de aparecer no topo da loja.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setBannerParaRemover(null)}
                className="px-4 py-2.5 rounded-xl border border-[#efefef] text-[#627271] text-sm hover:bg-[#efefef] transition-colors"
                style={{ fontWeight: 500 }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setBanners((prev) => prev.filter((b) => b.id !== bannerParaRemover.id));
                  setBannerParaRemover(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Trash2 size={14} />
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}