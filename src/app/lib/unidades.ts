/**
 * Catálogo compartilhado de unidades — WIRE-Producao-Redesign T1 (contrato 2).
 * Decisão de projeto: constante compartilhada (sem tabela persistida) — o
 * select do cadastro de produto e o portão de conversão da compra leem daqui,
 * acabando a entrada de texto livre ("un" × "Unidade" — fricção F1).
 */

/** Medidas — o que se pesa/mede (o "estoque por grama" vive aqui). */
export const UNIDADES_MEDIDA = ["kg", "g", "mg", "l", "ml", "m", "litro", "metro"];

/** Embalagem/conta — o que o fornecedor entrega por inteiro. */
export const UNIDADES_EMBALAGEM = [
  "caixa",
  "pacote",
  "fardo",
  "unidade",
  "un",
  "peça",
  "par",
  "kit",
  "frasco",
  "lata",
  "garrafa",
  "saco",
  "pote",
];

/** Datalist/select "Compra em" — o que o fornecedor entrega (F2). */
export const UNIDADES_COMPRA = ["kg", "g", "L", "ml", "un", "lata", "caixa", "pacote", "m"];

/** Tudo que pode ser unidade de estoque (medida + embalagem) — select do T1. */
export const UNIDADES_ESTOQUE = [...UNIDADES_MEDIDA, ...UNIDADES_EMBALAGEM];

/** Equivalências nome/abreviação (case-insensitive) para comparar unidades. */
const EQUIVALENCIA: Record<string, string> = { unidade: "un", litro: "l", metro: "m" };

/**
 * "Unidade" ≡ "un" ≡ "UN" — o Babel de unidades (F1) não pode mais travar o
 * fluxo de cadastro nem o de compra.
 */
export function mesmasUnidades(a: string, b: string): boolean {
  const normar = (u: string) => {
    const menor = u.trim().toLowerCase();
    return EQUIVALENCIA[menor] ?? menor;
  };
  return Boolean(a && b) && normar(a) === normar(b);
}
