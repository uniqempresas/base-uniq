/**
 * Utilitários de preço do domínio Produto — compartilhados (SPEC §4 — D3).
 * Movidos de components/estoque/estoqueMockData.ts; o mock re-exporta.
 */

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function calcMargem(custo: number, venda: number): number {
  if (venda === 0) return 0;
  return Math.round(((venda - custo) / venda) * 100);
}