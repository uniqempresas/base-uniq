/**
 * Tipos do domínio Produto — compartilhados por Estoque, Loja Virtual e vitrine.
 * Movidos de components/estoque/estoqueMockData.ts (SPEC §4 — D3): o tipo é
 * contrato único; os mocks re-exportam daqui.
 */

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
}