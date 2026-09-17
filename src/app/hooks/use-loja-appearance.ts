import { useMemo } from "react";
import type { BannerLoja, LojaAppearance, LojaTenant } from "../types/loja";

/** Tokens do `DESIGN.md` — valem quando a loja não define tema próprio (PRD V7) */
const TEMA_PADRAO = {
  primaryColor: "#86cb92",
  secondaryColor: "#1f2937",
  borderRadius: "8px",
  fontFamily: "Poppins",
};

const INTERVALO_PADRAO = 5000;

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/** Só devolve os tipos de link que a vitrine sabe acionar */
function normalizarLink(valor: unknown): BannerLoja["linkTipo"] {
  const v = texto(valor);
  if (v === "product" || v === "external" || v === "category") return v;
  return null;
}

/**
 * Normaliza um banner cru do jsonb (`appearance.hero.banners[]`).
 * Banner sem nenhuma imagem é descartado — não existe slide em branco.
 * `indice` entra no id de fallback para o id ficar estável entre renders.
 */
function mapBanner(bruto: unknown, indice: number): BannerLoja | null {
  if (!bruto || typeof bruto !== "object") return null;
  const b = bruto as Record<string, unknown>;

  const desktopUrl = texto(b.desktop_url) || null;
  const mobileUrl = texto(b.mobile_url) || null;
  if (!desktopUrl && !mobileUrl) return null;

  const posicao = texto(b.button_position);
  const linkValorBruto = texto(b.link_value);

  return {
    id: texto(b.id) || `banner-${indice}`,
    desktopUrl,
    mobileUrl,
    titulo: texto(b.title),
    subtitulo: texto(b.subtitle),
    textoBotao: texto(b.button_text) || null,
    corBotao: texto(b.button_color) || null,
    corTexto: texto(b.text_color) || null,
    posicaoBotao:
      posicao === "bottom-right" ? "bottom-right" : posicao === "bottom-left" ? "bottom-left" : null,
    linkTipo: normalizarLink(b.link_type),
    // "#" é placeholder histórico nos dados da HQ/UNIQ — não vira link
    linkValor: linkValorBruto && linkValorBruto !== "#" ? linkValorBruto : null,
  };
}

/**
 * Banner gerado do próprio tenant (PRD V3).
 *
 * A Doceê tem `appearance = {}` — sem banner configurado. Em vez de deixar o
 * topo vazio (ou, pior, usar imagem de outra loja), a vitrine monta um banner
 * com a identidade da própria loja.
 */
function bannerGerado(tenant: LojaTenant): BannerLoja {
  const config = tenant.storeConfig || {};
  const subtitulo =
    texto(config.slogan) ||
    texto(config.description) ||
    texto(config.ramoAtuacao) ||
    "Peça online · Entrega combinada pelo WhatsApp";

  return {
    id: "banner-gerado",
    desktopUrl: null,
    mobileUrl: null,
    titulo: tenant.nomeFantasia,
    subtitulo,
    textoBotao: "Ver o cardápio",
    corBotao: null,
    corTexto: null,
    posicaoBotao: "bottom-left",
    linkTipo: "grid",
    linkValor: null,
  };
}

/**
 * Resolve o banner e o tema da loja (PRD V3/V4/V7).
 *
 * Deriva do tenant já carregado por `useLojaTenant` — nenhuma consulta extra.
 * **Nunca** cai em banner de outra empresa: quando não há configuração, gera um
 * banner do próprio tenant (`origem: "gerado"`).
 */
export function useLojaAppearance(tenant: LojaTenant | null): LojaAppearance {
  return useMemo(() => {
    if (!tenant) {
      return {
        banners: [],
        autoplay: false,
        interval: INTERVALO_PADRAO,
        tema: TEMA_PADRAO,
        origem: "gerado" as const,
      };
    }

    const tema = { ...TEMA_PADRAO, ...(tenant.appearance?.theme || {}) };
    const hero = tenant.appearance?.hero;
    const brutos = Array.isArray(hero?.banners) ? hero.banners : [];

    const configurados = brutos
      .map((b, i) => mapBanner(b, i))
      .filter((b): b is BannerLoja => b !== null);

    if (configurados.length > 0) {
      const intervalo = typeof hero?.interval === "number" && hero.interval >= 2000 ? hero.interval : INTERVALO_PADRAO;
      return {
        banners: configurados,
        autoplay: hero?.autoplay !== false && configurados.length > 1,
        interval: intervalo,
        tema,
        origem: "config" as const,
      };
    }

    return {
      banners: [bannerGerado(tenant)],
      autoplay: false, // um único slide: autoplay não faz sentido
      interval: INTERVALO_PADRAO,
      tema,
      origem: "gerado" as const,
    };
  }, [tenant]);
}
