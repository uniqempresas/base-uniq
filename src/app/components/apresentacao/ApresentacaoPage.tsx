/**
 * ApresentacaoPage — deck comercial público da UNIQ Empresas.
 *
 * Um slide por vez, em tela cheia, mobile-first. Navegação por botões,
 * setas do teclado (←/→) e swipe horizontal em touch. Contador "X / 13"
 * (aria-live + visível) e barra de progresso fina no topo.
 *
 * Obs.: todos os hooks são declarados antes de qualquer retorno — evitar
 * crash de React em mudança de quantidade de hooks entre renders (#310).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { SLIDES, TOTAL_SLIDES } from "./slides-data";
import type { Paragrafo, Slide } from "./slides-data";

/** Renderiza um parágrafo com opção de trechos em destaque ({ forte }). */
function renderParagrafo(
  conteudo: Paragrafo,
  chave: string,
  classeParagrafo: string,
  classeForte = "font-bold text-[#1f2937]"
) {
  if (typeof conteudo === "string") {
    return (
      <p key={chave} className={classeParagrafo}>
        {conteudo}
      </p>
    );
  }
  return (
    <p key={chave} className={classeParagrafo}>
      {conteudo.map((run, i) =>
        typeof run === "string" ? (
          <span key={`${chave}-run-${i}`}>{run}</span>
        ) : (
          <strong key={`${chave}-run-${i}`} className={classeForte}>
            {run.forte}
          </strong>
        )
      )}
    </p>
  );
}

/** Bloco compartilhado de cabeçalho (eyebrow + título + subtítulo + corpo). */
function renderCabecalho(slide: Slide, chave: string) {
  return (
    <div key={`${chave}-cabecalho`}>
      {slide.eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#86cb92] mb-3">
          {slide.eyebrow}
        </p>
      ) : null}
      {slide.titulo
        ? renderParagrafo(
            slide.titulo,
            `${chave}-titulo`,
            "text-3xl md:text-4xl font-extrabold text-[#1f2937] leading-tight mb-4"
          )
        : null}
      {slide.subtitulo
        ? renderParagrafo(
            slide.subtitulo,
            `${chave}-subtitulo`,
            "text-base md:text-lg text-[#627271] max-w-2xl"
          )
        : null}
      {slide.corpo
        ? renderParagrafo(
            slide.corpo,
            `${chave}-corpo`,
            "text-[#1f2937] max-w-2xl"
          )
        : null}
    </div>
  );
}

/** Bloco de destaque (card) + fecho compartilhado. */
function renderDestaqueEFecho(slide: Slide, chave: string) {
  return (
    <div key={`${chave}-fim`}>
      {slide.destaque ? (
        <div className="mt-8 bg-white rounded-lg border border-[#efefef] border-l-4 border-l-[#86cb92] p-4 md:p-6 shadow-sm max-w-3xl">
          {renderParagrafo(
            slide.destaque,
            `${chave}-destaque`,
            "text-[#1f2937]"
          )}
        </div>
      ) : null}
      {slide.fecho ? (
        <div className="mt-6">
          {renderParagrafo(
            slide.fecho,
            `${chave}-fecho`,
            "font-bold text-[#1f2937] max-w-3xl"
          )}
        </div>
      ) : null}
    </div>
  );
}

function renderSlide(slide: Slide) {
  switch (slide.layout) {
    case "conteudo": {
      return (
        <section
          aria-label={`Slide ${slide.id} de ${TOTAL_SLIDES}`}
          className="flex-1 w-full container mx-auto px-6 py-12 md:py-20 flex flex-col justify-center"
        >
          {renderCabecalho(slide, "co")}
          {slide.itens ? (
            <ul className="mt-6 max-w-3xl space-y-6">
              {slide.itens.map((item, i) => (
                <li
                  key={`co-item-${i}`}
                  className="flex flex-col gap-1"
                >
                  {item.numero ? (
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#86cb92]">
                      {item.numero}
                    </span>
                  ) : null}
                  {item.titulo
                    ? renderParagrafo(
                        item.titulo,
                        `co-item-${i}-titulo`,
                        "font-semibold text-[#1f2937]"
                      )
                    : null}
                  {item.descricao
                    ? renderParagrafo(
                        item.descricao,
                        `co-item-${i}-descricao`,
                        "text-[#627271]"
                      )
                    : null}
                </li>
              ))}
            </ul>
          ) : null}
          {renderDestaqueEFecho(slide, "co")}
        </section>
      );
    }
    case "beneficios": {
      return (
        <section
          aria-label={`Slide ${slide.id} de ${TOTAL_SLIDES}`}
          className="flex-1 w-full container mx-auto px-6 py-12 md:py-20"
        >
          {renderCabecalho(slide, "be")}
          {slide.itens ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {slide.itens.map((item, i) => (
                <article
                  key={`be-item-${i}`}
                  className="bg-white rounded-lg border border-[#efefef] p-5 flex flex-col gap-2"
                >
                  {item.numero ? (
                    <span
                      className="h-7 w-7 rounded-full bg-[#86cb92] text-[#1f2937] text-xs font-bold flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {item.numero}
                    </span>
                  ) : null}
                  {item.titulo
                    ? renderParagrafo(
                        item.titulo,
                        `be-item-${i}-titulo`,
                        "font-bold text-[#1f2937]"
                      )
                    : null}
                  {item.descricao
                    ? renderParagrafo(
                        item.descricao,
                        `be-item-${i}-descricao`,
                        "text-sm text-[#627271]"
                      )
                    : null}
                </article>
              ))}
            </div>
          ) : null}
          {renderDestaqueEFecho(slide, "be")}
        </section>
      );
    }
    case "pricing": {
      return (
        <section
          aria-label={`Slide ${slide.id} de ${TOTAL_SLIDES}`}
          className="flex-1 w-full container mx-auto px-6 py-12 md:py-20"
        >
          {renderCabecalho(slide, "pr")}
          {slide.planos ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {slide.planos.map((plano, i) => (
                <article
                  key={`pr-plano-${i}`}
                  className={`rounded-xl border p-6 flex flex-col gap-5 ${
                    plano.destaque
                      ? "bg-[#86cb92] border-[#86cb92]"
                      : "bg-white border-[#efefef]"
                  }`}
                >
                  <p
                    className={`text-sm font-bold uppercase tracking-wide ${
                      plano.destaque ? "text-[#1f2937]" : "text-[#627271]"
                    }`}
                  >
                    {plano.rotulo}
                  </p>
                  <div className="flex items-end justify-center gap-8">
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-extrabold text-[#1f2937]">
                        {plano.setup}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-[#627271] mt-1">
                        setup
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-extrabold text-[#1f2937]">
                        {plano.mensal}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-[#627271] mt-1">
                        /mês
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          {slide.check ? (
            <ul className="mt-8 space-y-3 max-w-2xl mx-auto">
              {slide.check.map((linha, i) => (
                <li
                  key={`pr-check-${i}`}
                  className="flex items-start gap-3 text-[#1f2937]"
                >
                  <Check
                    className="mt-0.5 h-5 w-5 text-[#86cb92] shrink-0"
                    aria-hidden="true"
                  />
                  <span>{linha}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      );
    }
    case "encerramento": {
      return (
        <section
          aria-label={`Slide ${slide.id} de ${TOTAL_SLIDES}`}
          className="flex-1 w-full flex flex-col px-6 py-16 md:py-24 text-center"
        >
          <div className="flex-1 flex flex-col items-center justify-center">
            {slide.titulo
              ? renderParagrafo(
                  slide.titulo,
                  "en-titulo",
                  "text-3xl md:text-5xl font-extrabold text-[#1f2937] leading-tight max-w-3xl mb-4",
                  "font-extrabold text-[#86cb92]"
                )
              : null}
            {slide.subtitulo
              ? renderParagrafo(
                  slide.subtitulo,
                  "en-subtitulo",
                  "text-base md:text-lg text-[#627271] max-w-xl"
                )
              : null}
          </div>
          {slide.rodape ? (
            <p className="mt-auto pt-10 text-sm text-[#627271]">
              {slide.rodape}
            </p>
          ) : null}
        </section>
      );
    }
    case "hero":
    default: {
      return (
        <section
          aria-label={`Slide ${slide.id} de ${TOTAL_SLIDES}`}
          className="flex-1 w-full flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center"
        >
          {slide.eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#86cb92] mb-4">
              {slide.eyebrow}
            </p>
          ) : null}
          {slide.titulo ? (
            renderParagrafo(
              slide.titulo,
              "hero-titulo",
              "text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1f2937] leading-[1.1] max-w-4xl mb-6"
            )
          ) : null}
          {slide.subtitulo ? (
            renderParagrafo(
              slide.subtitulo,
              "hero-subtitulo",
              "text-base md:text-lg text-[#627271] max-w-2xl"
            )
          ) : null}
        </section>
      );
    }
  }
}

export function ApresentacaoPage() {
  const [indice, setIndice] = useState(0);
  const toqueInicioX = useRef<number | null>(null);

  const avancar = useCallback(() => {
    setIndice((atual) => Math.min(TOTAL_SLIDES - 1, atual + 1));
  }, []);

  const voltar = useCallback(() => {
    setIndice((atual) => Math.max(0, atual - 1));
  }, []);

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      const alvo = evento.target as HTMLElement | null;
      if (
        alvo &&
        (alvo.tagName === "INPUT" ||
          alvo.tagName === "TEXTAREA" ||
          alvo.isContentEditable)
      ) {
        return;
      }
      if (evento.key === "ArrowRight") {
        evento.preventDefault();
        avancar();
      } else if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        voltar();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [avancar, voltar]);

  // Cada slide ocupa a tela; ao trocar, volta ao topo.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [indice]);

  // Página comercial de uso direto (apresentar na mesa / link ao cliente):
  // fica fora dos buscadores — acessível só por quem tem o link.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    const tituloAnterior = document.title;
    document.title = "UNIQ Empresas — Apresentação";

    return () => {
      meta.remove();
      document.title = tituloAnterior;
    };
  }, []);

  const aoPressionar = (evento: React.PointerEvent<HTMLDivElement>) => {
    if (evento.pointerType === "touch") {
      toqueInicioX.current = evento.clientX;
    }
  };

  const aoSoltar = (evento: React.PointerEvent<HTMLDivElement>) => {
    if (evento.pointerType !== "touch" || toqueInicioX.current === null) {
      return;
    }
    const delta = evento.clientX - toqueInicioX.current;
    toqueInicioX.current = null;
    if (Math.abs(delta) < 48) {
      return;
    }
    if (delta < 0) {
      avancar();
    } else {
      voltar();
    }
  };

  const aoCancelarToque = () => {
    toqueInicioX.current = null;
  };

  const slide = SLIDES[indice];

  return (
    <div className="min-h-screen bg-[#efefef] text-[#1f2937] flex flex-col">
      {/* Barra de progresso fina no topo */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-50 bg-[#d9d9d9]"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TOTAL_SLIDES}
        aria-valuenow={indice + 1}
        aria-label={`Slide ${indice + 1} de ${TOTAL_SLIDES}`}
      >
        <div
          className="h-full bg-[#86cb92] transition-[width] duration-300 ease-out"
          style={{ width: `${((indice + 1) / TOTAL_SLIDES) * 100}%` }}
        />
      </div>

      <main
        className="flex-1 flex flex-col touch-pan-y"
        onPointerDown={aoPressionar}
        onPointerUp={aoSoltar}
        onPointerCancel={aoCancelarToque}
      >
        {renderSlide(slide)}
      </main>

      {/* Controles de navegação */}
      <footer className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-[#efefef]">
        <div className="w-full container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <span className="sr-only" aria-live="polite">
            Slide {indice + 1} de {TOTAL_SLIDES}
          </span>
          <button
            type="button"
            onClick={voltar}
            disabled={indice === 0}
            aria-label="Slide anterior"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#efefef] bg-white text-[#1f2937] transition hover:bg-[#86cb92] hover:border-[#86cb92] hover:text-white disabled:opacity-40 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#86cb92]"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <span
            className="text-sm font-semibold text-[#627271] tabular-nums"
            aria-hidden="true"
          >
            {indice + 1} / {TOTAL_SLIDES}
          </span>
          <button
            type="button"
            onClick={avancar}
            disabled={indice === TOTAL_SLIDES - 1}
            aria-label="Próximo slide"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#efefef] bg-white text-[#1f2937] transition hover:bg-[#86cb92] hover:border-[#86cb92] hover:text-white disabled:opacity-40 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#86cb92]"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}