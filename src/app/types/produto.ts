/**
 * Tipos do domínio Produto — compartilhados por Estoque, Loja Virtual e vitrine.
 * Movidos de components/estoque/estoqueMockData.ts (SPEC §4 — D3): o tipo é
 * contrato único; os mocks re-exportam daqui.
 */

import type { NaturezaProduto } from "./producao";

export type EstoqueStatus = "ok" | "baixo" | "zerado";
export type ProdutoStatus = "ativo" | "inativo" | "rascunho";

export interface Variacao {
  id: string;
  nome: string;
  sku: string;
  estoque: number;
  preco?: number;
  codigoBarras?: string;
  ativo: boolean;
}

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  codigoBarras?: string;
  categoria: string;
  /** `me_produto.categoria_id` — usado para pré-selecionar no formulário */
  categoriaId?: number | null;
  /** `me_categoria.cor` — cor real da categoria (antes vinha de um mapa mock) */
  categoriaCor?: string | null;
  marca?: string;
  unidade: string;
  precoVenda: number;
  precoCusto: number;
  precoPromocional?: number;
  estoque: number;
  estoqueMinimo: number;
  estoqueMaximo?: number;
  status: ProdutoStatus;
  estoqueStatus: EstoqueStatus;
  possuiVariacoes: boolean;
  variacoes?: Variacao[];
  localizacao?: string;
  fornecedor?: string;
  descricaoCurta?: string;
  dataCadastro: string;
  ultimaMovimentacao: string;
  foto?: string;
  totalVendido: number;
  tags?: string[]; // nomes das tags (persistido em me_produto.opcoes_config)
  /** `me_produto.exibir_vitrine` — exposição nova (SPEC §2.3 / lane A) */
  exibirVitrine?: boolean;
  /**
   * `me_produto.natureza` — eixo de produção (Simples/Composto/Insumo).
   * Opcional no tipo porque o mock antigo não tem o campo; o mapper resolve
   * o ausente como `'simples'` (SPEC-Producao-BOM-Fase1 §3).
   */
  natureza?: NaturezaProduto;
  /**
   * `me_produto.unidade_compra` — unidade de COMPRA do insumo (ex.: 'kg').
   * null = compra direto na unidade do estoque. Opcional no tipo porque o
   * mock antigo não tem o campo (SPEC-Producao-BOM-Fase2 §3).
   */
  unidadeCompra?: string | null;
  /**
   * `me_produto.fator_conversao` — quanto 1 unidade de compra vale no estoque
   * (ex.: 1000 para 'kg' com estoque em 'g'). null = 1.
   */
  fatorConversao?: number | null;
  /**
   * `me_produto.ultimo_preco_compra` — último preço pago NA UNIDADE DE COMPRA
   * (ex.: 6,50/pacote). Gravado pela RPC `receber_compra` (U2 — uso real).
   */
  ultimoPrecoCompra?: number | null;
  /** `me_produto.ultima_compra_em` — data do último recebimento (yyyy-mm-dd) ou null (U2). */
  ultimaCompraEm?: string | null;
}
