// Máscaras de exibição do módulo Financeiro.
//
// UUID cru nunca pode aparecer na tela. Dados reais gravam descrições como
// "Venda #848081af-e1b9-4c5d-9e40-991a0ac0fb7c - Henriq Silva" — esta função
// remove qualquer UUID e o sufixo "- <nome do cliente>" redundante.

export const UUID_RE = /#?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export function limparDescricao(descricao: string | null | undefined, cliente?: string): string {
  if (!descricao) return "";
  let d = descricao.trim().replace(UUID_RE, " ").replace(/\s{2,}/g, " ").trim();
  if (cliente) {
    const sufixo = ` - ${cliente}`;
    if (d.endsWith(sufixo)) d = d.slice(0, -sufixo.length).trim();
  }
  return d;
}

// ── Máscara monetária (R$) — inputs de valor (WIRE Compra C2) ────────────────
// Abordagem por centavos: o dígito digitado "empurra" o número da direita para
// a esquerda e os 2 últimos sempre são os centavos — é o padrão dos apps
// financeiros brasileiros e torna impossível digitar "R$ 500" querendo dizer 5.
// "123456" → "R$ 1.234,56". O parse devolve o número em reais.

/** Qualquer string (o usuário apaga/cola) → "R$ 1.234,56". Vazio → vazio. */
export function mascararMoeda(entrada: string): string {
  const digitos = (entrada.match(/\d/g) ?? []).join("").replace(/^0+(?=\d)/, "").slice(0, 12);
  if (!digitos) return "";
  const centavos = parseInt(digitos, 10);
  return `R$ ${(centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Valor mascarado (ou cru) → número em reais. "R$ 1.234,56" → 1234.56; "" → 0. */
export function parsearMoeda(entrada: string): number {
  const digitos = (entrada.match(/\d/g) ?? []).join("");
  if (!digitos) return 0;
  return parseInt(digitos, 10) / 100;
}

/** Número → máscara inicial (pré-preenchimento do último preço: 6.5 → "R$ 6,50"). */
export function moedaDeValor(valor: number): string {
  if (!Number.isFinite(valor) || valor <= 0) return "";
  return mascararMoeda(String(Math.round(valor * 100)));
}