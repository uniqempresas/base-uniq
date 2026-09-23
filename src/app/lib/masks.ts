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