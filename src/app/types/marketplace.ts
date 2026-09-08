/**
 * Tipos TypeScript para o módulo Marketplace
 */

// Status do pedido
export type PedidoStatus = 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado';

// Tipo de lojista
export type LojistaTipo = 'varejo' | 'atacado' | 'servicos';

// Status do produto
export type ProdutoStatus = 'ativo' | 'inativo';

// Interface Lojista (Vendedor)
export interface Lojista {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  logoUrl?: string;
  capaUrl?: string;
  tipo: LojistaTipo;
  nota: number; // 0-5
  totalAvaliacoes: number;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  createdAt: string;
  atualizadoEm: string;
}

// Interface Produto
export interface Produto {
  id: string;
  lojistaId: string;
  nome: string;
  slug: string;
  descricao: string;
  preco: number; // em centavos
  precoPromocional?: number; // em centavos
  imagemUrl: string;
  imagens?: string[];
  categoria: string;
  subcategoria?: string;
  estoque: number;
  sku?: string;
  peso?: number; // em gramas
  dimensoes?: {
    largura: number;
    altura: number;
    profundidade: number;
  };
  freightGratis: boolean;
  freightValor?: number;
  destaque: boolean;
  status: ProdutoStatus;
  criadoEm: string;
  atualizadoEm: string;
}

// Interface CarrinhoItem
export interface CarrinhoItem {
  produtoId: string;
  lojistaId: string;
  quantidade: number;
  produto: Produto;
  lojista: Lojista;
}

// Interface PedidoItem
export interface PedidoItem {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
}

// Interface EnderecoEntrega
export interface EnderecoEntrega {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

// Interface Pedido
export interface Pedido {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteEmail: string;
  itens: PedidoItem[];
  status: PedidoStatus;
  valorSubtotal: number;
  valorFrete: number;
  valorTotal: number;
  formaPagamento: string;
  enderecoEntrega: EnderecoEntrega;
  dataPedido: string;
  dataPagamento?: string;
  dataEnvio?: string;
  dataEntrega?: string;
}

// Interface para itens agrupados por lojista no carrinho
export interface CarrinhoAgrupado {
  lojista: Lojista;
  itens: CarrinhoItem[];
  subtotal: number;
  freight: number;
}

// Interface VendedorStats
export interface VendedorStats {
  totalVendas: number;
  pedidosPendentes: number;
  pedidosPagos: number;
  pedidosEnviados: number;
  pedidosEntregues: number;
  receitaTotal: number;
  ticketMedio: number;
  produtosAtivos: number;
  avaliacaoMedia: number;
  graficoVendas: {
    mes: string;
    valor: number;
  }[];
}

// Opções de filtro para produtos
export interface FilterOptions {
  categoria?: string;
  precoMin?: number;
  precoMax?: number;
  freightGratis?: boolean;
  notaMin?: number;
  destaque?: boolean;
  lojistaId?: string;
}