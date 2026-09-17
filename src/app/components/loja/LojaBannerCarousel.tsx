import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { BannerLoja, LojaAppearance } from "../../types/loja";

export interface LojaBannerCarouselProps {
  appearance: LojaAppearance;
  slug: string;
  /** Enquanto o tenant carrega, reserva a altura final (evita salto de layout) */
  loading?: boolean;
  onSelecionarCategoria?: (id: number) => void;
}

/** Respeita `prefers-reduced-motion` — desliga autoplay e scroll suave */
function usePrefereReduzirMovimento(): boolean {
  const [reduzir, setReduzir] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduzir(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduzir(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduzir;
}

/**
 * Carrossel do banner da loja (WIRE bloco ⑥).
 *
 * Um slide visível por vez com scroll-snap nativo. Autoplay só com 2+ slides,
 * pausa ao interagir e nunca roda com `prefers-reduced-motion`.
 */
export function LojaBannerCarousel({
  appearance,
  slug,
  loading = false,
  onSelecionarCategoria,
}: LojaBannerCarouselProps) {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const semMovimento = usePrefereReduzirMovimento();

  const { banners, autoplay, interval } = appearance;
  const multiplo = banners.length > 1;

  const rolarPara = useCallback(
    (indice: number) => {
      const el = trackRef.current;
      if (!el) return;
      el.scrollTo({
        left: indice * el.clientWidth,
        behavior: semMovimento ? "auto" : "smooth",
      });
    },
    [semMovimento]
  );

  // Autoplay — depende de todos os hooks acima; nenhum return antes daqui.
  useEffect(() => {
    if (!multiplo || !autoplay || pausado || semMovimento) return;

    const timer = window.setInterval(() => {
      setAtual((prev) => {
        const proximo = (prev + 1) % banners.length;
        rolarPara(proximo);
        return proximo;
      });
    }, interval);

    return () => window.clearInterval(timer);
  }, [multiplo, autoplay, pausado, semMovimento, interval, banners.length, rolarPara]);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const largura = el.clientWidth || 1;
    const indice = Math.max(0, Math.min(banners.length - 1, Math.round(el.scrollLeft / largura)));
    setAtual((prev) => (prev === indice ? prev : indice));
  };

  const acionar = (banner: BannerLoja) => {
    switch (banner.linkTipo) {
      case "product":
        if (banner.linkValor) navigate(`/loja/${slug}/produto/${banner.linkValor}`);
        return;
      case "external":
        if (banner.linkValor) window.open(banner.linkValor, "_blank", "noopener,noreferrer");
        return;
      case "category": {
        const id = Number(banner.linkValor);
        if (banner.linkValor && !Number.isNaN(id)) onSelecionarCategoria?.(id);
        return;
      }
      default:
        document.getElementById("loja-catalogo")?.scrollIntoView({
          behavior: semMovimento ? "auto" : "smooth",
          block: "start",
        });
    }
  };

  const estaAcionavel = (b: BannerLoja) =>
    b.linkTipo === "grid" ||
    (!!b.linkValor && (b.linkTipo === "product" || b.linkTipo === "external" || b.linkTipo === "category"));

  if (loading) {
    return (
      <div
        className="mb-6 h-40 animate-pulse rounded-lg sm:h-48 lg:h-60"
        style={{ background: "#efefef" }}
        aria-hidden
      />
    );
  }

  if (banners.length === 0) return null;

  return (
    <section className="mb-6" aria-label="Destaques da loja">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={() => setPausado(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            setPausado(true);
            rolarPara(Math.min(atual + 1, banners.length - 1));
          }
          if (e.key === "ArrowLeft") {
            setPausado(true);
            rolarPara(Math.max(atual - 1, 0));
          }
        }}
        tabIndex={0}
        role="region"
        aria-roledescription="carrossel"
        className="flex snap-x snap-mandatory overflow-x-auto rounded-lg [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-[#86cb92]/40 focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((b, i) => (
          <div
            key={b.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${banners.length}`}
            className="relative h-40 w-full shrink-0 snap-start overflow-hidden rounded-lg sm:h-48 lg:h-60"
          >
            {b.mobileUrl || b.desktopUrl ? (
              <picture>
                {b.desktopUrl && <source media="(min-width: 640px)" srcSet={b.desktopUrl} />}
                <img
                  src={b.mobileUrl ?? b.desktopUrl ?? ""}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </picture>
            ) : null}

            {/* Véu para legibilidade do texto sobre a imagem */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  b.mobileUrl || b.desktopUrl
                    ? "linear-gradient(90deg, rgba(31,41,55,0.78) 0%, rgba(31,41,55,0.20) 75%)"
                    : "linear-gradient(135deg, #1f2937 0%, #34434f 100%)",
              }}
            />

            <div className="relative flex h-full flex-col justify-between p-5 sm:p-7">
              <div className="max-w-[85%]">
                {b.titulo && (
                  <p
                    className="text-base leading-tight sm:text-2xl"
                    style={{ fontWeight: 800, color: b.corTexto || "#ffffff" }}
                  >
                    {b.titulo}
                  </p>
                )}
                {b.subtitulo && (
                  <p className="mt-1 line-clamp-2 text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {b.subtitulo}
                  </p>
                )}
              </div>

              {b.textoBotao && estaAcionavel(b) && (
                <button
                  type="button"
                  onClick={() => acionar(b)}
                  className="rounded-lg px-4 py-2.5 text-xs transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                  style={{
                    alignSelf: b.posicaoBotao === "bottom-right" ? "flex-end" : "flex-start",
                    background: b.corBotao || "#86cb92",
                    color: "#1f2937",
                    fontWeight: 700,
                    minHeight: "44px",
                  }}
                >
                  {b.textoBotao}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {multiplo && (
        <div className="mt-1 flex justify-center">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setPausado(true);
                setAtual(i);
                rolarPara(i);
              }}
              aria-label={`Ir para o banner ${i + 1}`}
              aria-current={i === atual}
              className="flex items-center justify-center p-2.5"
            >
              <span
                className="block h-1.5 rounded-lg transition-all"
                style={{
                  width: i === atual ? 18 : 6,
                  background: i === atual ? "#86cb92" : "#627271",
                  opacity: i === atual ? 1 : 0.35,
                }}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
