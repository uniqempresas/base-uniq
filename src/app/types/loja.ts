// Tipos da Loja Virtual multi-tenant (SPEC-LojaVirtual-DoceE §4)

export interface LojaTenant {
  empresaId: string;
  slug: string;
  nomeFantasia: string;
  logoUrl: string | null;
  /** me_empresa.telefone — usado no fallback de indisponibilidade */
  whatsapp: string | null;
}

export interface ProdutoLoja {
  id: number;
  nome: string;
  preco: number;
  fotoUrl: string | null;
  descricao: string | null;
  estoque: number; // <= 0 => esgotado
  esgotado: boolean;
}

export interface ItemCarrinhoLoja {
  produtoId: number;
  nome: string;
  /** exibição; NUNCA usado na gravação do pedido */
  precoSnapshot: number;
  fotoUrl: string | null;
  quantidade: number;
}

export interface DadosCheckoutLoja {
  nome: string;
  /** digitado com máscara (11) 99999-9999 */
  telefone: string;
  cep: string;
  endereco: string; // logradouro
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  formaPagamento: "Pix" | "Dinheiro";
  observacoes: string;
  consentimentoLgpd: boolean;
}

export interface ResumoPedidoLoja {
  idVenda: string;
  valorTotal: number;
  itens: { nome: string; quantidade: number; precoUnitario: number }[];
  formaPagamento: string;
}