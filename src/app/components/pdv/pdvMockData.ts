export type PagamentoTipo = "dinheiro" | "debito" | "credito" | "pix" | "outro";
export type MovimentacaoTipo = "sangria" | "suprimento";

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  categoriaId: string;
  preco: number;
  estoque: number;
  favorito: boolean;
  emoji: string;
  cor: string;
}

export interface ItemCarrinho {
  id: string;
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  desconto: number; // valor em R$
}

export interface Pagamento {
  id: string;
  tipo: PagamentoTipo;
  valor: number;
  parcelas?: number;
  valorEntregue?: number; // for dinheiro - to calc troco
}

export interface VendaEmEspera {
  id: string;
  label: string;
  itens: ItemCarrinho[];
  criadaEm: string;
}

export interface MovimentacaoCaixa {
  id: string;
  tipo: MovimentacaoTipo;
  valor: number;
  motivo: string;
  observacoes?: string;
  hora: string;
  usuario: string;
}

export interface VendaConcluida {
  id: string;
  numero: string;
  itens: ItemCarrinho[];
  pagamentos: Pagamento[];
  total: number;
  desconto: number;
  hora: string;
  cliente?: string;
}

/* ─── Categorias ─── */
export const CATEGORIAS = [
  { id: "todos", nome: "Todos", emoji: "🛍️", cor: "#86cb92" },
  { id: "servicos", nome: "Serviços", emoji: "✂️", cor: "#8B5CF6" },
  { id: "produtos_cabelo", nome: "Cabelo", emoji: "💇", cor: "#EC4899" },
  { id: "estetica", nome: "Estética", emoji: "💆", cor: "#F59E0B" },
  { id: "unhas", nome: "Unhas", emoji: "💅", cor: "#F97316" },
  { id: "cosmeticos", nome: "Cosméticos", emoji: "🧴", cor: "#0EA5E9" },
  { id: "outros", nome: "Outros", emoji: "📦", cor: "#627271" },
];

/* ─── Produtos ─── */
export const PRODUTOS: Produto[] = [
  // Serviços
  { id: "p1", codigo: "001", nome: "Corte Feminino", categoria: "Serviços", categoriaId: "servicos", preco: 120, estoque: 999, favorito: true, emoji: "✂️", cor: "#8B5CF6" },
  { id: "p2", codigo: "002", nome: "Corte Masculino", categoria: "Serviços", categoriaId: "servicos", preco: 65, estoque: 999, favorito: true, emoji: "✂️", cor: "#8B5CF6" },
  { id: "p3", codigo: "003", nome: "Coloração", categoria: "Serviços", categoriaId: "servicos", preco: 280, estoque: 999, favorito: true, emoji: "🎨", cor: "#EC4899" },
  { id: "p4", codigo: "004", nome: "Manicure", categoria: "Serviços", categoriaId: "servicos", preco: 60, estoque: 999, favorito: true, emoji: "💅", cor: "#F97316" },
  { id: "p5", codigo: "005", nome: "Pedicure", categoria: "Serviços", categoriaId: "servicos", preco: 70, estoque: 999, favorito: false, emoji: "🦶", cor: "#F59E0B" },
  { id: "p6", codigo: "006", nome: "Progressiva", categoria: "Serviços", categoriaId: "servicos", preco: 350, estoque: 999, favorito: true, emoji: "💆", cor: "#0EA5E9" },
  { id: "p7", codigo: "007", nome: "Barba Clássica", categoria: "Serviços", categoriaId: "servicos", preco: 80, estoque: 999, favorito: true, emoji: "🪒", cor: "#6366F1" },
  { id: "p8", codigo: "008", nome: "Limpeza de Pele", categoria: "Serviços", categoriaId: "estetica", preco: 180, estoque: 999, favorito: false, emoji: "🌿", cor: "#10B981" },
  // Cosméticos
  { id: "p9", codigo: "101", nome: "Shampoo Premium", categoria: "Cosméticos", categoriaId: "cosmeticos", preco: 85, estoque: 12, favorito: false, emoji: "🧴", cor: "#0EA5E9" },
  { id: "p10", codigo: "102", nome: "Condicionador", categoria: "Cosméticos", categoriaId: "cosmeticos", preco: 75, estoque: 8, favorito: false, emoji: "🧴", cor: "#0EA5E9" },
  { id: "p11", codigo: "103", nome: "Máscara Hidratante", categoria: "Cosméticos", categoriaId: "cosmeticos", preco: 120, estoque: 5, favorito: false, emoji: "🫙", cor: "#EC4899" },
  { id: "p12", codigo: "104", nome: "Óleo de Argan", categoria: "Cosméticos", categoriaId: "cosmeticos", preco: 95, estoque: 7, favorito: false, emoji: "💧", cor: "#F59E0B" },
  // Unhas
  { id: "p13", codigo: "201", nome: "Esmalte Gel", categoria: "Unhas", categoriaId: "unhas", preco: 35, estoque: 20, favorito: false, emoji: "💅", cor: "#F97316" },
  { id: "p14", codigo: "202", nome: "Francesinha", categoria: "Unhas", categoriaId: "unhas", preco: 45, estoque: 999, favorito: false, emoji: "✨", cor: "#F97316" },
  // Cabelo
  { id: "p15", codigo: "301", nome: "Tintura 60g", categoria: "Cabelo", categoriaId: "produtos_cabelo", preco: 45, estoque: 15, favorito: false, emoji: "🎨", cor: "#EC4899" },
  { id: "p16", codigo: "302", nome: "Botox Capilar", categoria: "Cabelo", categoriaId: "produtos_cabelo", preco: 220, estoque: 3, favorito: false, emoji: "💎", cor: "#EC4899" },
];

/* ─── Histórico de vendas do dia ─── */
export const VENDAS_DIA: VendaConcluida[] = [
  {
    id: "v1",
    numero: "001",
    itens: [{ id: "i1", produto: PRODUTOS[0], quantidade: 1, precoUnitario: 120, desconto: 0 }],
    pagamentos: [{ id: "pg1", tipo: "pix", valor: 120 }],
    total: 120,
    desconto: 0,
    hora: "09:15",
    cliente: "Fernanda Costa",
  },
  {
    id: "v2",
    numero: "002",
    itens: [
      { id: "i2", produto: PRODUTOS[3], quantidade: 1, precoUnitario: 60, desconto: 0 },
      { id: "i3", produto: PRODUTOS[4], quantidade: 1, precoUnitario: 70, desconto: 0 },
    ],
    pagamentos: [{ id: "pg2", tipo: "debito", valor: 130 }],
    total: 130,
    desconto: 0,
    hora: "10:30",
  },
  {
    id: "v3",
    numero: "003",
    itens: [{ id: "i4", produto: PRODUTOS[2], quantidade: 1, precoUnitario: 280, desconto: 30 }],
    pagamentos: [{ id: "pg3", tipo: "credito", valor: 250, parcelas: 2 }],
    total: 250,
    desconto: 30,
    hora: "11:45",
    cliente: "Juliana Almeida",
  },
  {
    id: "v4",
    numero: "004",
    itens: [{ id: "i5", produto: PRODUTOS[6], quantidade: 1, precoUnitario: 80, desconto: 0 }],
    pagamentos: [{ id: "pg4", tipo: "dinheiro", valor: 80, valorEntregue: 100 }],
    total: 80,
    desconto: 0,
    hora: "13:20",
    cliente: "Roberto Mendes",
  },
];

export const MOVIMENTACOES_DIA: MovimentacaoCaixa[] = [
  { id: "m1", tipo: "suprimento", valor: 200, motivo: "Reforço de troco", hora: "08:05", usuario: "Maria Silva" },
  { id: "m2", tipo: "sangria", valor: 300, motivo: "Excesso de caixa (para cofre)", hora: "12:30", usuario: "Maria Silva" },
];

export const MOTIVOS_SANGRIA = [
  "Excesso de caixa (para cofre)",
  "Pagamento de despesa",
  "Estorno em dinheiro",
  "Outro",
];
export const MOTIVOS_SUPRIMENTO = [
  "Reforço de troco",
  "Devolução de sangria",
  "Estorno de pagamento",
  "Outro",
];

export const PAGAMENTO_CONFIG: Record<PagamentoTipo, { label: string; emoji: string; cor: string; bg: string }> = {
  dinheiro: { label: "Dinheiro", emoji: "💵", cor: "#15803D", bg: "#F0FDF4" },
  debito: { label: "Cartão Débito", emoji: "💳", cor: "#1D4ED8", bg: "#EFF6FF" },
  credito: { label: "Cartão Crédito", emoji: "💳", cor: "#7C3AED", bg: "#F5F3FF" },
  pix: { label: "PIX", emoji: "⚡", cor: "#0F766E", bg: "#F0FDFA" },
  outro: { label: "Outro", emoji: "🔄", cor: "#B45309", bg: "#FFFBEB" },
};

export function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function calcSubtotal(itens: ItemCarrinho[]) {
  return itens.reduce((s, i) => s + i.precoUnitario * i.quantidade - i.desconto, 0);
}

export function calcDescontoTotal(itens: ItemCarrinho[]) {
  return itens.reduce((s, i) => s + i.desconto, 0);
}

// Saldo do caixa em dinheiro
export function calcSaldoCaixaDinheiro(): number {
  const abertura = 200; // troco inicial
  const vendasDinheiro = VENDAS_DIA.filter(v => v.pagamentos.some(p => p.tipo === "dinheiro"))
    .reduce((s, v) => s + v.total, 0);
  const suprimentos = MOVIMENTACOES_DIA.filter(m => m.tipo === "suprimento").reduce((s, m) => s + m.valor, 0);
  const sangrias = MOVIMENTACOES_DIA.filter(m => m.tipo === "sangria").reduce((s, m) => s + m.valor, 0);
  return abertura + vendasDinheiro + suprimentos - sangrias;
}
