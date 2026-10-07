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

/* ─────────────────────────────────────────────────────────────────────────
 * Produção Fase 2 — Compras + Custo Médio + Conta a Pagar
 * (SPEC-Producao-BOM-Fase2-ComprasCusto §3)
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Status da compra — domínio EXATO do CHECK `est_compra_status_check` no banco:
 * SEMPRE maiúsculo. O app grava só estes literais (via `normalizarStatusCompra`).
 */
export type StatusCompra = "PENDENTE" | "RECEBIDO" | "CANCELADO";

export const ESTADO_COMPRA: Record<StatusCompra, StatusCompra> = {
  PENDENTE: "PENDENTE",
  RECEBIDO: "RECEBIDO",
  CANCELADO: "CANCELADO",
};

/** Domínio real da coluna; linha/embed inesperado cai em PENDENTE (nunca quebra a UI). */
export function normalizarStatusCompra(valor: string | null | undefined): StatusCompra {
  return valor === "RECEBIDO" || valor === "CANCELADO" ? valor : "PENDENTE";
}

/** Rótulos da UI (WIRE §2.5) — badge nunca depende de cor sozinha. */
export const STATUS_COMPRA_LABELS: Record<StatusCompra, string> = {
  PENDENTE: "Pendente",
  RECEBIDO: "Recebido",
  CANCELADO: "Cancelado",
};

/**
 * Item da compra no formato da UI. `quantidade`/`valorUnitario` estão na unidade
 * de COMPRA (o que o fornecedor entrega); a conversão para o estoque vem do
 * produto (`unidadeCompra` + `fatorConversao` de `me_produto`).
 */
export interface ItemCompra {
  id: string;
  /** `me_produto.id` (integer no banco, string na UI — contrato de `Produto.id`) */
  produtoId: string;
  produtoNome: string;
  produtoSku: string;
  /** unidade de ESTOQUE (`me_produto.unidade`) */
  unidadeEstoque: string;
  /** `me_produto.unidade_compra` — null = compra na unidade do estoque */
  unidadeCompra: string | null;
  /** `me_produto.fator_conversao` — null = 1 (ex.: 'kg' com 1000 → 1 kg = 1000 g) */
  fatorConversao: number | null;
  /** quantidade na unidade de COMPRA (> 0, CHECK do banco) */
  quantidade: number;
  /** valor unitário na unidade de COMPRA (>= 0, CHECK do banco) */
  valorUnitario: number;
}

export interface Compra {
  id: string;
  fornecedorId: string;
  fornecedorNome: string;
  status: StatusCompra;
  /** ISO (`est_compra.data_compra` timestamptz) */
  dataCompra: string;
  /** `est_compra.data_prevista` (emenda D11) —yyyy-mm-dd ou null */
  dataPrevista: string | null;
  /** `est_compra.data_recebimento` — yyyy-mm-dd ou null */
  dataRecebimento: string | null;
  valorTotal: number;
  notaFiscal: string | null;
  itens: ItemCompra[];
}

/** Quantidade que entra no estoque: `quantidade × (fatorConversao ?? 1)` (SPEC D6). */
export function qtdEstoque(item: Pick<ItemCompra, "quantidade" | "fatorConversao">): number {
  return item.quantidade * (item.fatorConversao ?? 1);
}

/** Custo por unidade de ESTOQUE: `valorUnitario ÷ (fatorConversao ?? 1)` (SPEC D9). */
export function custoPorUnidadeEstoque(
  item: Pick<ItemCompra, "valorUnitario" | "fatorConversao">
): number {
  const fator = item.fatorConversao ?? 1;
  return fator > 0 ? item.valorUnitario / fator : item.valorUnitario;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Produção Fase 3 — Ordem de Produção (SPEC-Producao-BOM-Fase3-Producao §3)
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Linha do acabamento (Produção Fase 3) no formato da UI.
 */
export interface OrdemProducao {
  id: string;
  /** `me_produto.id` do pai (integer no banco, string na UI — contrato de `Produto.id`) */
  produtoPaiId: string;
  /** embed `me_produto.nome_produto` (opcional: lista filtrada por pai já sabe o nome) */
  produtoNome?: string;
  /** lote — unidades do acabado (numeric > 0 no banco) */
  quantidade: number;
  custoTotal: number;
  custoUnit: number;
  /** ISO (`est_ordem_producao.data_producao` timestamptz) */
  dataProducao: string;
  observacao?: string | null;
}

/**
 * Consumo previsto de um insumo para um lote (pré-visualização do modal —
 * `consumo = qtdPorUnidade × lote × (1 + perda/100)`, unidade de ESTOQUE).
 */
export interface ConsumoPrevisto {
  produtoId: string;
  nome: string;
  sku: string;
  unidade: string;
  estoqueAtual: number;
  consumo: number;
  custoMedio: number;
  suficiente: boolean;
  linhaTotal: number;
}
