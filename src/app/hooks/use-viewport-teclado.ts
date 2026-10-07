/**
 * useViewportTeclado — "teclado educado" da Nova Compra (WIRE C4 §3).
 *
 * Mede o inset que o teclado virtural ocupa a partir de `window.visualViewport`
 * (padrão chat-app do iOS Safari, que NÃO respeita
 * `interactive-widget=resizes-content`): quando o teclado abre, o visual
 * viewport encolhe e o `window.innerHeight` fica parado — a diferença é a
 * altura coberta.
 *
 * Em Chrome/Vivaldi Android com `interactive-widget=resizes-content` no
 * `index.html`, o próprio layout viewport já encolhe (innerHeight ≈
 * visualViewport.height): o inset mede ~0 e nada precisa compensar — os
 * elementos sticky já se reancoram sozinhos acima do teclado. O hook serve
 * então para as compensações de iOS (empurrar conteúdo sobre a lista) e para
 * qualquer UI que precise saber se o teclado está na tela.
 *
 * Frontend-only: sem estado global, sem storage; SSR-safe (mede só no client).
 */
import { useEffect, useState } from "react";

/** Abaixo disso é barra de ferramenta/autocomplete do sistema, não teclado. */
const LIMIAR_TECLADO_PX = 120;

export interface TecladoViewport {
  /** true quando um teclado físico/virtual está cobrando a tela */
  tecladoAberto: boolean;
  /** px cobertos pelo teclado (0 quando fechado) */
  inset: number;
}

export function useViewportTeclado(): TecladoViewport {
  const [estado, setEstado] = useState<TecladoViewport>({ tecladoAberto: false, inset: 0 });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const medir = () => {
      const bruto = Math.round(window.innerHeight - vv.height - vv.offsetTop);
      const inset = bruto > LIMIAR_TECLADO_PX ? Math.max(0, bruto) : 0;
      const aberto = inset > 0;
      // não re-renderiza por variação de 1px (arredondamento de DPR)
      setEstado((prev) => (prev.tecladoAberto === aberto && prev.inset === inset ? prev : { tecladoAberto: aberto, inset }));
    };

    medir();
    vv.addEventListener("resize", medir);
    vv.addEventListener("scroll", medir);
    window.addEventListener("resize", medir);
    return () => {
      vv.removeEventListener("resize", medir);
      vv.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, []);

  return estado;
}
