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

/* ─────────────────────────────────────────────────────────────────────────
 * Modo Receita (SPEC-Producao-ModoReceita §2) — conversão SEMPRE no front:
 * o banco continua por-unidade (g/ml); `me_produto.rendimento_lote` é quanto
 * da unidade do produto 1 receita rende. NULL/0 = modo atual (sem conversão).
 * ───────────────────────────────────────────────────────────────────────── */

/** Por-unidade → por-receita: `qtd × rendimento`. */
export function toReceita(qtdPorUn: number, rendimento: number): number {
  return qtdPorUn * rendimento;
}

/** Por-receita → por-unidade: `qtd ÷ rendimento` (guarda p/ rendimento inválido). */
export function deReceita(qtdReceita: number, rendimento: number): number {
  return rendimento > 0 ? qtdReceita / rendimento : qtdReceita;
}

/** pt-BR com até 2 casas sem zeros à direita: 395 → "395", 0,431655 → "0,43". */
export function formatarQtd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}