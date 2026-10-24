/**
 * SegmentedNav — "Compro · Faço · Vendo" compartilhado do redesign estoque v2.
 *
 * Fonte: tracking/Redesign_ComproVendoFaco/*.html — o segmented vive no topo do
 * conteúdo (abaixo da .eq2-bar) em TODAS as telas e mantém o usuário ciente do
 * cenário completo: cada seção leva a uma área real da base.
 *
 * Velvet UX: a seção ativa ganha a pílula branca (.is-active); a assinatura
 * "Hoje" fica FORA do segmented (é a home — na home nenhuma seção está ativa,
 * basta omitir `ativo`).
 *
 * Taps: Compro → /estoque-v2/insumos · Faço → /estoque-v2/producao ·
 * Vendo → /estoque-v2/margem.
 */
import type { CSSProperties } from "react";
import { useNavigate } from "react-router";

export type SecaoV2 = "compro" | "faco" | "vendo";

interface SegaoDef {
  chave: SecaoV2;
  label: string;
  rota: string;
}

const SECOES: SegaoDef[] = [
  { chave: "compro", label: "Compro", rota: "/estoque-v2/insumos" },
  { chave: "faco", label: "Faço", rota: "/estoque-v2/producao" },
  { chave: "vendo", label: "Vendo", rota: "/estoque-v2/margem" },
];

export interface SegmentedNavProps {
  /** Seção atual; ausente/null = nenhuma ativa (home "Hoje"). */
  ativo?: SecaoV2 | null;
  /**
   * Modo compacto para wizards em mobile (passo 3, altura apertada):
   * mantém a altura de toque CSS padrão (36px) em vez de elevar para 44px.
   */
  compacto?: boolean;
  /** Sobrescreve/estende o estilo do container (ex.: margens por layout grid). */
  style?: CSSProperties;
  className?: string;
}

export function SegmentedNav({ ativo, compacto = false, style, className }: SegmentedNavProps) {
  const navigate = useNavigate();

  return (
    <nav
      className={`eq2-segmented${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Compro · Faço · Vendo — o cenário completo"
      style={{ marginBottom: 12, ...style }}
    >
      {SECOES.map((s) => {
        const isAtivo = ativo === s.chave;
        return (
          <button
            key={s.chave}
            type="button"
            className={isAtivo ? "is-active" : undefined}
            aria-pressed={isAtivo}
            style={compacto ? undefined : { minHeight: 44 }}
            onClick={() => navigate(s.rota)}
          >
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}

export default SegmentedNav;
