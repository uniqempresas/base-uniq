/**
 * Tipos do domínio Estoque — Movimentações (SPEC-Estoque-B14 §2).
 * `MovTipo`/`MovMotivo`/`Movimentacao` foram movidos de
 * `components/estoque/estoqueMockData.ts` para cá (mesmo padrão do `Produto`
 * em `types/produto.ts` — D3 de 17/09): o tipo é contrato único; o mock
 * re-exporta para zero quebra nos consumidores.
 */

export type MovTipo = "entrada" | "saida";
// UI: só estes dois (o 'ajuste' do CHECK do banco fica de cabeça para uso futuro)

export type MovMotivo =
  | "Compra"
  | "Devolução"
  | "Ajuste"
  | "Perda"
  | "Venda"
  | "Inventário"
  | "Quebra"
  | "Doação"
  | "Outro";

/**
 * Formato do MOCK (demo). Mantém `custo?`/`variacao?` — campos de demonstração
 * que não existem na tabela real `est_movimentacao` (SPEC §1).
 */
export interface Movimentacao {
  id: string;
  produtoId: string;
  produtoNome: string;
  produtoSku: string;
  tipo: MovTipo;
  quantidade: number;
  motivo: MovMotivo;
  responsavel: string;
  observacao?: string;
  data: string;
  custo?: number;
  cancelada: boolean;
  variacao?: string;
}

/**
 * Formato da UI para linhas REAIS de `est_movimentacao` (mapper do
 * `useMovimentacoes`) e para o mock adaptado em modo demo.
 */
export interface MovimentacaoEstoque {
  id: string;
  /** `empresa_id` — vazio ("") no mock de demonstração */
  empresaId: string;
  /** string na UI (`Produto.id` é string); integer no banco */
  produtoId: string;
  produtoNome: string;
  produtoSku: string;
  tipo: MovTipo;
  quantidade: number;
  /** texto livre (motivo real pode divergir do union do vocabulário do app) */
  motivo: string;
  observacao?: string;
  /** `nome_usuario` quando resolvível; "—" na UI */
  responsavel?: string;
  /** ISO — de `data_movimentacao` (fallback `created_at`) */
  data: string;
  /** sempre false no real (mock tem true) */
  cancelada: boolean;
}
