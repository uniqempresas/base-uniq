export type PedidoStatus =
  | "aguardando_pagamento"
  | "pago"
  | "em_separacao"
  | "enviado"
  | "entregue"
  | "cancelado";

export type PagamentoTipoLoja = "pix" | "credito" | "debito" | "boleto";

export interface ProdutoLoja {
  id: string;
  nome: string;
  descricao: string;
  descricaoLonga: string;
  categoria: string;
  categoriaId: string;
  preco: number;
  precoAntigo?: number;
  imagem: string;
  imagens: string[];
  estoque: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  vendidos: number;
  freteGratis: boolean;
  destaque: boolean;
  novo: boolean;
  tags: string[];
  variacoes?: { tipo: string; opcoes: { nome: string; preco?: number; estoque: number }[] }[];
  especificacoes: { label: string; valor: string }[];
}

export interface ItemCarrinhoLoja {
  id: string;
  produto: ProdutoLoja;
  quantidade: number;
  variacao?: string;
}

export interface FreteOpcao {
  id: string;
  nome: string;
  prazo: string;
  valor: number;
}

export interface Pedido {
  id: string;
  numero: string;
  data: string;
  hora: string;
  status: PedidoStatus;
  itens: ItemCarrinhoLoja[];
  subtotal: number;
  frete: number;
  desconto: number;
  total: number;
  pagamento: PagamentoTipoLoja;
  parcelas?: number;
  enderecoEntrega: {
    nome: string;
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  rastreio?: string;
  previsaoEntrega?: string;
}

/* ─── Helpers ─── */
export function formatCurrencyLoja(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function calcDesconto(preco: number, precoAntigo?: number) {
  if (!precoAntigo) return 0;
  return Math.round(((precoAntigo - preco) / precoAntigo) * 100);
}

/* ─── Categorias ─── */
export const CATEGORIAS_LOJA = [
  { id: "todos", nome: "Todos", emoji: "✨" },
  { id: "cosmeticos", nome: "Cosméticos", emoji: "🧴" },
  { id: "cabelo", nome: "Cabelo", emoji: "💇" },
  { id: "unhas", nome: "Unhas", emoji: "💅" },
  { id: "estetica", nome: "Estética", emoji: "🌿" },
  { id: "perfumaria", nome: "Perfumaria", emoji: "🌸" },
];

/* ─── Produtos Mock ─── */
export const PRODUTOS_LOJA: ProdutoLoja[] = [
  {
    id: "pl1",
    nome: "Shampoo Premium Hidratante 300ml",
    descricao: "Nutrição profissional para fios secos e danificados",
    descricaoLonga: "Desenvolvido com complexo de queratina e óleos essenciais, nosso Shampoo Premium restaura a vitalidade dos fios do primeiro uso. Indicado para cabelos secos, danificados ou quimicamente tratados. Fórmula sem sulfato e sem parabenos, gentil com o couro cabeludo e com o meio ambiente.",
    categoria: "Cosméticos",
    categoriaId: "cosmeticos",
    preco: 79.90,
    precoAntigo: 99.90,
    imagem: "https://images.unsplash.com/photo-1691707896889-090a23795485?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    imagens: [
      "https://images.unsplash.com/photo-1691707896889-090a23795485?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      "https://images.unsplash.com/photo-1772910059649-ec40a07ecfe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      "https://images.unsplash.com/photo-1585652757141-8837d676fac8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    ],
    estoque: 15,
    avaliacaoMedia: 4.8,
    totalAvaliacoes: 124,
    vendidos: 380,
    freteGratis: false,
    destaque: true,
    novo: false,
    tags: ["hidratação", "sem sulfato", "queratina"],
    especificacoes: [
      { label: "Volume", valor: "300ml" },
      { label: "Fórmula", valor: "Sem sulfato e parabenos" },
      { label: "Indicado para", valor: "Cabelos secos e danificados" },
      { label: "Validade", valor: "24 meses" },
    ],
  },
  {
    id: "pl2",
    nome: "Máscara Capilar Restauração Intensa 250g",
    descricao: "Reconstrução completa para cabelos danificados em 5 minutos",
    descricaoLonga: "A Máscara Capilar Restauração Intensa penetra nas camadas mais profundas dos fios, reconstruindo a estrutura capilar danificada por processos químicos e calor excessivo. Rica em proteínas e vitaminas do complexo B.",
    categoria: "Cabelo",
    categoriaId: "cabelo",
    preco: 124.90,
    precoAntigo: 149.90,
    imagem: "https://images.unsplash.com/photo-1758788390320-16e1f280cf49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    imagens: [
      "https://images.unsplash.com/photo-1758788390320-16e1f280cf49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      "https://images.unsplash.com/photo-1585652757141-8837d676fac8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    ],
    estoque: 8,
    avaliacaoMedia: 4.9,
    totalAvaliacoes: 87,
    vendidos: 215,
    freteGratis: true,
    destaque: true,
    novo: false,
    tags: ["reconstrução", "intensiva", "proteínas"],
    especificacoes: [
      { label: "Peso", valor: "250g" },
      { label: "Tempo de ação", valor: "5 a 20 minutos" },
      { label: "Uso", valor: "Semanal ou quinzenal" },
    ],
  },
  {
    id: "pl3",
    nome: "Óleo de Argan Marroquino 60ml",
    descricao: "Brilho e maciez instantâneos do deserto marroquino",
    descricaoLonga: "O Óleo de Argan puro, extraído a frio de amendoas do argan marroquino, hidrata profundamente e confere brilho espetacular. Uso versátil: aplique nos fios úmidos como finalizador ou nos secos para controlar o frizz.",
    categoria: "Cabelo",
    categoriaId: "cabelo",
    preco: 89.90,
    imagem: "https://images.unsplash.com/photo-1772987714654-2df39af2c658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    imagens: [
      "https://images.unsplash.com/photo-1772987714654-2df39af2c658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      "https://images.unsplash.com/photo-1772910059649-ec40a07ecfe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    ],
    estoque: 22,
    avaliacaoMedia: 4.7,
    totalAvaliacoes: 156,
    vendidos: 490,
    freteGratis: true,
    destaque: false,
    novo: true,
    tags: ["argan", "brilho", "frizz"],
    especificacoes: [
      { label: "Volume", valor: "60ml" },
      { label: "Origem", valor: "Marrocos" },
      { label: "Extração", valor: "A frio" },
    ],
  },
  {
    id: "pl4",
    nome: "Creme Facial Hidratante Noturno 50g",
    descricao: "Regeneração celular enquanto você dorme com ácido hialurônico",
    descricaoLonga: "Formulado com ácido hialurônico, vitamina C e retinol em baixa concentração, este creme noturno potencializa a renovação celular natural que ocorre durante o sono. Acorde com a pele visivelmente mais firme, iluminada e hidratada.",
    categoria: "Estética",
    categoriaId: "estetica",
    preco: 159.90,
    precoAntigo: 199.90,
    imagem: "https://images.unsplash.com/photo-1585652757141-8837d676fac8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    imagens: [
      "https://images.unsplash.com/photo-1585652757141-8837d676fac8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      "https://images.unsplash.com/photo-1758788390320-16e1f280cf49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    ],
    estoque: 5,
    avaliacaoMedia: 4.6,
    totalAvaliacoes: 43,
    vendidos: 98,
    freteGratis: false,
    destaque: true,
    novo: true,
    tags: ["hialurônico", "anti-aging", "noturno"],
    especificacoes: [
      { label: "Peso", valor: "50g" },
      { label: "Pele indicada", valor: "Todos os tipos" },
      { label: "Uso", valor: "Noturno" },
    ],
  },
  {
    id: "pl5",
    nome: "Esmalte Gel UV Coleção Primavera",
    descricao: "Durabilidade de até 21 dias com acabamento espelhado",
    descricaoLonga: "Nossa coleção Primavera traz 12 cores vibrantes em fórmula gel de alta cobertura. Cura em apenas 60 segundos sob lâmpada UV/LED. Não lasca, não amarela. Remoção fácil com acetona.",
    categoria: "Unhas",
    categoriaId: "unhas",
    preco: 34.90,
    precoAntigo: 44.90,
    imagem: "https://images.unsplash.com/photo-1667242197482-ffe672de74da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    imagens: [
      "https://images.unsplash.com/photo-1667242197482-ffe672de74da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    ],
    estoque: 40,
    avaliacaoMedia: 4.5,
    totalAvaliacoes: 210,
    vendidos: 650,
    freteGratis: false,
    destaque: false,
    novo: false,
    tags: ["gel", "UV", "longa duração"],
    variacoes: [
      { tipo: "Cor", opcoes: [
        { nome: "Rosa Quartzo", preco: 34.90, estoque: 12 },
        { nome: "Coral Vibrante", preco: 34.90, estoque: 8 },
        { nome: "Nude Pêssego", preco: 34.90, estoque: 15 },
        { nome: "Vermelho Clássico", preco: 34.90, estoque: 5 },
        { nome: "Roxo Ametista", preco: 34.90, estoque: 0 },
      ]},
    ],
    especificacoes: [
      { label: "Volume", valor: "10ml" },
      { label: "Durabilidade", valor: "Até 21 dias" },
      { label: "Cura", valor: "60s em UV/LED" },
    ],
  },
  {
    id: "pl6",
    nome: "Kit Hidratação Completa Capilar",
    descricao: "Shampoo + Condicionador + Máscara para tratamento profissional em casa",
    descricaoLonga: "Kit completo de tratamento capilar profissional para usar em casa. O Shampoo de limpeza suave prepara os fios, o Condicionador garante maciez e o penteado fácil, e a Máscara Intensiva reconstrói de dentro para fora.",
    categoria: "Cabelo",
    categoriaId: "cabelo",
    preco: 189.90,
    precoAntigo: 249.90,
    imagem: "https://images.unsplash.com/photo-1772910059649-ec40a07ecfe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    imagens: [
      "https://images.unsplash.com/photo-1772910059649-ec40a07ecfe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      "https://images.unsplash.com/photo-1691707896889-090a23795485?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    ],
    estoque: 0,
    avaliacaoMedia: 4.9,
    totalAvaliacoes: 67,
    vendidos: 189,
    freteGratis: true,
    destaque: true,
    novo: false,
    tags: ["kit", "completo", "profissional"],
    especificacoes: [
      { label: "Conteúdo", valor: "3 produtos" },
      { label: "Volume total", valor: "850ml" },
    ],
  },
];

/* ─── Pedidos Mock ─── */
export const PEDIDOS_MOCK: Pedido[] = [
  {
    id: "ped1",
    numero: "UNIQ-2024-001",
    data: "2024-03-28",
    hora: "14:32",
    status: "enviado",
    itens: [
      { id: "i1", produto: PRODUTOS_LOJA[0], quantidade: 2 },
      { id: "i2", produto: PRODUTOS_LOJA[2], quantidade: 1 },
    ],
    subtotal: 249.70,
    frete: 18.90,
    desconto: 0,
    total: 268.60,
    pagamento: "pix",
    enderecoEntrega: {
      nome: "Fernanda Costa",
      cep: "01310-100",
      logradouro: "Av. Paulista",
      numero: "1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
    },
    rastreio: "BR123456789BR",
    previsaoEntrega: "02/04/2024",
  },
  {
    id: "ped2",
    numero: "UNIQ-2024-002",
    data: "2024-03-15",
    hora: "09:17",
    status: "entregue",
    itens: [
      { id: "i3", produto: PRODUTOS_LOJA[3], quantidade: 1 },
    ],
    subtotal: 159.90,
    frete: 0,
    desconto: 20,
    total: 139.90,
    pagamento: "credito",
    parcelas: 3,
    enderecoEntrega: {
      nome: "Fernanda Costa",
      cep: "01310-100",
      logradouro: "Av. Paulista",
      numero: "1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
    },
    previsaoEntrega: "20/03/2024",
  },
  {
    id: "ped3",
    numero: "UNIQ-2024-003",
    data: "2024-03-31",
    hora: "16:45",
    status: "aguardando_pagamento",
    itens: [
      { id: "i4", produto: PRODUTOS_LOJA[4], quantidade: 3, variacao: "Rosa Quartzo" },
    ],
    subtotal: 104.70,
    frete: 12.50,
    desconto: 0,
    total: 117.20,
    pagamento: "pix",
    enderecoEntrega: {
      nome: "Fernanda Costa",
      cep: "01310-100",
      logradouro: "Av. Paulista",
      numero: "1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
    },
  },
];

export const STATUS_CONFIG_PEDIDO: Record<PedidoStatus, { label: string; color: string; bg: string; border: string; dot: string; icon: string; desc: string }> = {
  aguardando_pagamento: { label: "Aguardando Pagamento", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B", icon: "⏳", desc: "Seu pagamento está sendo confirmado" },
  pago: { label: "Pago", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6", icon: "✅", desc: "Pagamento confirmado! Estamos preparando seu pedido" },
  em_separacao: { label: "Em Separação", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", dot: "#8B5CF6", icon: "📦", desc: "Seu pedido está sendo separado com cuidado" },
  enviado: { label: "Enviado", color: "#0F766E", bg: "#F0FDFA", border: "#99F6E4", dot: "#14B8A6", icon: "🚚", desc: "Seu pedido está a caminho!" },
  entregue: { label: "Entregue", color: "#15803D", bg: "#F0FDF4", border: "#86EFAC", dot: "#22C55E", icon: "🎉", desc: "Pedido entregue com sucesso!" },
  cancelado: { label: "Cancelado", color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444", icon: "✖️", desc: "Este pedido foi cancelado" },
};

export const PAGAMENTO_LOJA_CONFIG: Record<PagamentoTipoLoja, { label: string; emoji: string }> = {
  pix: { label: "PIX", emoji: "⚡" },
  credito: { label: "Cartão de Crédito", emoji: "💳" },
  debito: { label: "Cartão de Débito", emoji: "💳" },
  boleto: { label: "Boleto Bancário", emoji: "📄" },
};

export const FRETE_OPCOES: FreteOpcao[] = [
  { id: "pac", nome: "PAC – Correios", prazo: "8 a 12 dias úteis", valor: 18.90 },
  { id: "sedex", nome: "SEDEX – Correios", prazo: "2 a 4 dias úteis", valor: 34.50 },
  { id: "transportadora", nome: "Transportadora", prazo: "5 a 7 dias úteis", valor: 22.00 },
];

export const CUPONS_VALIDOS: Record<string, { desconto: number; tipo: "fixo" | "percentual" }> = {
  "UNIQ10": { desconto: 10, tipo: "percentual" },
  "BEMVINDO": { desconto: 20, tipo: "fixo" },
  "FRETE0": { desconto: 0, tipo: "fixo" },
};
