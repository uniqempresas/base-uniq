/**
 * Tipos do domínio Produção — Fase 1 (SPEC-Producao-BOM-Fase1 §3).
 *
 * `natureza` é o eixo NOVO de produção (simples/composto/insumo). Não confundir
 * com `me_produto.tipo`, que é legado de variações (PRD D5) — essa coluna continua
 * intocada e não aparece aqui.
 */

export type NaturezaProduto = "simples" | "composto" | "insumo";

/** Rótulos da UI (WIRE §2) — única fonte do vocabulário exibido. */
export const NATUREZA_LABELS: Record<NaturezaProduto, string> = {
  simples: "Simples",
  composto: "Composto",
  insumo: "Insumo",
};

/** Textos de ajuda do rádio Natureza (WIRE §2). */
export const NATUREZA_AJUDA: Record<NaturezaProduto, string> = {
  simples: "Compro 1, vendo 1",
  composto: "Produzido com ficha técnica",
  insumo: "Matéria-prima — não aparece na vitrine",
};

/**
 * Item da ficha técnica no formato da UI.
 * `componenteProdutoId` é `me_produto.id` (integer no banco, string na UI —
 * mesmo contrato de `Produto.id`).
 */
export interface ItemFichaTecnica {
  id: string;
  componenteProdutoId: string;
  componenteNome: string;
  componenteSku: string;
  componenteUnidade: string;
  /** quantidade na unidade base do componente, por 1 unidade do pai (> 0) */
  quantidadePorUnidade: number;
  /** 0..100 (banco aceita >= 0; acima de 100 é só aviso na UI) */
  perdaPct: number;
}

export interface FichaTecnica {
  produtoId: string;
  natureza: NaturezaProduto;
  itens: ItemFichaTecnica[];
}
