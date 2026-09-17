// Tipos da Loja Virtual multi-tenant (SPEC-LojaVirtual-DoceE §4)

/** `me_empresa.store_config` (jsonb) — só os campos que a vitrine usa */
export interface StoreConfigLoja {
  slogan?: string;
  description?: string;
  ramoAtuacao?: string;
  whatsapp_contact?: string;
  [chave: string]: unknown;
}

/** Banner individual de `me_empresa.appearance.hero.banners[]` (jsonb) */
export interface BannerLoja {
  id: string;
  desktopUrl: string | null;
  mobileUrl: string | null;
  titulo: string;
  subtitulo: string;
  textoBotao: string | null;
  corBotao: string | null;
  corTexto: string | null;
  posicaoBotao: "bottom-left" | "bottom-right" | null;
  /** `grid` = âncora interna da própria vitrine (usado no banner gerado) */
  linkTipo: "product" | "external" | "category" | "grid" | null;
  linkValor: string | null;
}

export interface TemaLoja {
  fontFamily?: string;
  borderRadius?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/** `me_empresa.appearance` cru (jsonb) — validado na leitura */
export interface AppearanceBrutoLoja {
  hero?: {
    type?: string;
    autoplay?: boolean;
    interval?: number;
    banners?: unknown[];
  };
  theme?: TemaLoja;
}

/**
 * Banner/tema já resolvidos (PRD-LojaVirtual-VitrineModerna V3).
 * `origem: "gerado"` = a loja não tem banners configurados e a vitrine montou
 * um banner do próprio tenant — **nunca** de outra empresa.
 */
export interface LojaAppearance {
  banners: BannerLoja[];
  autoplay: boolean;
  interval: number;
  tema: TemaLoja;
  origem: "config" | "gerado";
}

/** Categoria real (`me_categoria`) com a contagem de produtos na vitrine */
export interface CategoriaLoja {
  id: number;
  nome: string;
  /** `empresa_id IS NULL` em `me_categoria` = escopo global */
  global: boolean;
  totalProdutos: number;
}

export interface LojaTenant {
  empresaId: string;
  slug: string;
  nomeFantasia: string;
  logoUrl: string | null;
  /** me_empresa.telefone — usado no fallback de indisponibilidade */
  whatsapp: string | null;
  /** me_empresa.store_config (jsonb) — pode vir vazio */
  storeConfig: StoreConfigLoja;
  /** me_empresa.appearance (jsonb) — hero/tema; vazio na Doceê hoje */
  appearance: AppearanceBrutoLoja;
}

export interface ProdutoLoja {
  id: number;
  nome: string;
  preco: number;
  /**
   * Preço "de" (riscado). **Só** preenchido quando existe preço real de
   * comparação (`preco_varejo > preco`). `null` = sem selo de desconto (PRD V6).
   */
  precoDe?: number | null;
  fotoUrl: string | null;
  descricao: string | null;
  estoque: number; // <= 0 => esgotado
  esgotado: boolean;
  /** me_produto.categoria_id — null quando o produto não tem categoria */
  categoriaId?: number | null;
  /** nome resolvido via `me_categoria` (preenchido na vitrine) */
  categoriaNome?: string | null;
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