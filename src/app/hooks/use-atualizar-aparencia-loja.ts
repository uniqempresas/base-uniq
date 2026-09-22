/**
 * Write hook da aparência da loja (SPEC-LojaVirtual-CompletarModulo §3).
 *
 * Escreve em `me_empresa.appearance` + `me_empresa.store_config` com
 * **merge seguro em 2 níveis** — nunca substitui o JSON inteiro vindo da tela:
 *
 * 1. LÊ o estado atual do banco (`appearance, store_config` do `empresaId`)
 *    — nunca confia no que a tela enviou;
 * 2. MERGE em dois níveis (topo + `hero` + `theme` + `store_config`),
 *    preservando chaves irmãs que o editor não conhece
 *    (ex.: `hero.type`, `store_config.whatsapp_contact`);
 * 3. VALIDA antes de gravar (`interval >= 2000`, `button_position` e
 *    `link_type` nas listas permitidas);
 * 4. GRAVA só as duas colunas, sempre `.eq("id", empresaId)` com o
 *    `empresaId` vindo do `AuthContext` — nunca por parâmetro.
 *
 * `banners` é o único campo de array: a tela é dona da ordem, então o hook
 * **substitui o array inteiro** — mas como ele vive dentro de `hero`,
 * `type`/`autoplay`/`interval` sobrevivem ao merge.
 *
 * Como a vitrine pública (`use-loja-appearance.ts`, intocável) lê o jsonb em
 * snake_case, o hook converte os `BannerLoja` (camelCase — o tipo do editor)
 * para o shape cru (`desktop_url`, `title`, `button_position`, etc.) antes de
 * gravar.
 */

import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { BannerLoja, StoreConfigLoja, TemaLoja } from "../types/loja";

export interface PatchAparenciaHero {
  type?: string;
  autoplay?: boolean;
  interval?: number;
  banners?: BannerLoja[];
}

export interface PatchAparencia {
  appearance?: {
    hero?: Partial<PatchAparenciaHero>;
    theme?: Partial<TemaLoja>;
  };
  storeConfig?: Partial<StoreConfigLoja>;
}

export interface SalvarAparenciaResult {
  success: boolean;
  error?: string;
}

const POSICOES_BOTAO_VALIDAS = new Set(["bottom-left", "bottom-right"]);
const TIPOS_LINK_VALIDOS = new Set(["product", "external", "category", "grid"]);
const INTERVALO_MINIMO = 2000;

/**
 * Só devolve objetos planos (jsonb) — `null`, array ou primitivo viram `{}`.
 * Protege o spread de chaves que venham do banco em formato inesperado.
 */
function objetoSeValido(valor: unknown): Record<string, unknown> {
  if (valor && typeof valor === "object" && !Array.isArray(valor)) {
    return valor as Record<string, unknown>;
  }
  return {};
}

/**
 * Valida o patch ANTES de gravar. Rejeita com mensagem clara — não grava
 * valor inválido.
 */
function validarPatch(patch: PatchAparencia): string | null {
  const hero = patch.appearance?.hero;

  if (hero?.interval !== undefined) {
    if (
      typeof hero.interval !== "number" ||
      !Number.isFinite(hero.interval) ||
      hero.interval < INTERVALO_MINIMO
    ) {
      return "O intervalo do carrossel deve ser de no mínimo 2000ms.";
    }
  }

  if (hero?.banners !== undefined) {
    if (!Array.isArray(hero.banners)) {
      return "A lista de banners deve ser um array.";
    }

    for (const banner of hero.banners) {
      if (!banner || typeof banner !== "object") {
        return "A lista de banners contém um item inválido.";
      }
      const nomeBanner = banner.titulo?.trim() || banner.id?.trim() || "sem título";

      if (
        banner.posicaoBotao != null &&
        !POSICOES_BOTAO_VALIDAS.has(banner.posicaoBotao)
      ) {
        return `Posição do botão inválida no banner "${nomeBanner}". Use "bottom-left" ou "bottom-right".`;
      }
      if (banner.linkTipo != null && !TIPOS_LINK_VALIDOS.has(banner.linkTipo)) {
        return `Tipo de destino inválido no banner "${nomeBanner}". Use "product", "external", "category" ou "grid".`;
      }
    }
  }

  return null;
}

/**
 * Converte um `BannerLoja` (camelCase, o tipo do editor) para o shape cru que
 * a vitrine pública lê (`use-loja-appearance.ts`) e o jsonb armazena
 * (snake_case — SPEC §2.1).
 */
let contadorIdBanner = 0;
function bannerParaBruto(banner: BannerLoja): Record<string, unknown> {
  contadorIdBanner += 1;
  const id = banner.id?.trim() || `banner-${Date.now()}-${contadorIdBanner}`;

  return {
    id,
    desktop_url: banner.desktopUrl ?? null,
    mobile_url: banner.mobileUrl ?? null,
    title: banner.titulo ?? "",
    subtitle: banner.subtitulo ?? "",
    button_text: banner.textoBotao ?? null,
    button_color: banner.corBotao ?? null,
    text_color: banner.corTexto ?? null,
    button_position: banner.posicaoBotao ?? null,
    link_type: banner.linkTipo ?? null,
    link_value: banner.linkValor ?? null,
  };
}

/**
 * Erro de RLS/policy não pode ser silencioso — expõe a mensagem com contexto.
 */
function mensagemRls(mensagem: string): string {
  if (/row[\s-]?level security/i.test(mensagem)) {
    return `${mensagem} — Permissão negada pelo banco. Contate o suporte se o problema persistir.`;
  }
  return mensagem;
}

export function useAtualizarAparenciaLoja() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const salvar = useCallback(
    async (patch: PatchAparencia): Promise<SalvarAparenciaResult> => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // SEM tenant autenticado, não gravar em tenant errado — nunca aceita
      // empresaId por parâmetro.
      const empresaId = empresa?.id;
      if (!empresaId) {
        const errorMessage =
          "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.";
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }

      // Nada para alterar — evita write desnecessário.
      if (!patch.appearance && !patch.storeConfig) {
        setLoading(false);
        return { success: true };
      }

      const erroValidacao = validarPatch(patch);
      if (erroValidacao) {
        setError(erroValidacao);
        setLoading(false);
        return { success: false, error: erroValidacao };
      }

      try {
        // 1) LÊ o estado atual — nunca confia no JSON que veio da tela.
        const { data, error: readError } = await supabase
          .from("me_empresa")
          .select("appearance, store_config")
          .eq("id", empresaId)
          .single();

        if (readError) throw readError;
        if (!data) {
          throw new Error(
            "Empresa não encontrada. Recarregue a página ou faça login novamente."
          );
        }

        // 2) MERGE em dois níveis — preserva chaves irmãs desconhecidas.
        const atual = objetoSeValido(data.appearance);
        const heroAtual = objetoSeValido(atual.hero);
        const themeAtual = objetoSeValido(atual.theme);

        const heroPatch = patch.appearance?.hero;
        const patchHero: Record<string, unknown> = {};
        if (heroPatch?.type !== undefined) patchHero.type = heroPatch.type;
        if (heroPatch?.autoplay !== undefined) patchHero.autoplay = heroPatch.autoplay;
        if (heroPatch?.interval !== undefined) patchHero.interval = heroPatch.interval;
        // banners é array substituído inteiro (a tela é dona da ordem), mas em
        // snake_case — as chaves irmãs de hero (type/autoplay/interval) sobrevivem.
        if (heroPatch?.banners !== undefined) {
          patchHero.banners = heroPatch.banners.map(bannerParaBruto);
        }
        const temPatchHero = Object.keys(patchHero).length > 0;

        const themePatch = patch.appearance?.theme;
        const temPatchTheme =
          !!themePatch && Object.keys(themePatch).length > 0;

        const novoAppearance: Record<string, unknown> = {
          ...atual,
          ...(patch.appearance ?? {}),
          hero: temPatchHero ? { ...heroAtual, ...patchHero } : atual.hero,
          theme: temPatchTheme ? { ...themeAtual, ...themePatch } : atual.theme,
        };

        const novoStoreConfig: Record<string, unknown> = {
          ...objetoSeValido(data.store_config),
          ...(patch.storeConfig ?? {}),
        };

        // 3) GRAVA só as duas colunas.
        const { error: updateError } = await supabase
          .from("me_empresa")
          .update({
            appearance: novoAppearance,
            store_config: novoStoreConfig,
          })
          .eq("id", empresaId);

        if (updateError) throw updateError;

        setSuccess(true);
        return { success: true };
      } catch (err) {
        const raw =
          err instanceof Error && err.message
            ? err.message
            : "Não foi possível salvar a aparência. Tente novamente.";
        const errorMessage = mensagemRls(raw);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { salvar, loading, error, success };
}