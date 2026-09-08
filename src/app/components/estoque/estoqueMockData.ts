export type EstoqueStatus = "ok" | "baixo" | "zerado";
export type ProdutoStatus = "ativo" | "inativo" | "rascunho";
export type MovTipo = "entrada" | "saida";
export type MovMotivo =
  | "Compra"
  | "Devolução"
  | "Ajuste"
  | "Perda"
  | "Venda"
  | "Inventário"
  | "Quebra"
  | "Outro";

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
}

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

// Categoria colors
export const CATEGORIA_COLORS: Record<string, { bg: string; text: string }> = {
  "Roupas": { bg: "#F5F3FF", text: "#7C3AED" },
  "Calçados": { bg: "#EFF6FF", text: "#1D4ED8" },
  "Acessórios": { bg: "#FDF4FF", text: "#A21CAF" },
  "Eletrônicos": { bg: "#F0FDF4", text: "#15803D" },
  "Beleza": { bg: "#FFF7ED", text: "#C2410C" },
  "Alimentos": { bg: "#FFFBEB", text: "#B45309" },
  "Outros": { bg: "#efefef", text: "#627271" },
};

export const PRODUTOS: Produto[] = [
  {
    id: "p1",
    nome: "Camiseta Básica Premium",
    sku: "CAM-001",
    codigoBarras: "7891234567890",
    categoria: "Roupas",
    marca: "Estilo Próprio",
    unidade: "Peça",
    precoVenda: 89.90,
    precoCusto: 35.00,
    estoque: 47,
    estoqueMinimo: 10,
    estoqueMaximo: 100,
    status: "ativo",
    estoqueStatus: "ok",
    possuiVariacoes: true,
    variacoes: [
      { id: "v1", nome: "P - Branco", sku: "CAM-001-PB", estoque: 12, ativo: true },
      { id: "v2", nome: "P - Preto", sku: "CAM-001-PP", estoque: 8, ativo: true },
      { id: "v3", nome: "M - Branco", sku: "CAM-001-MB", estoque: 15, ativo: true },
      { id: "v4", nome: "M - Preto", sku: "CAM-001-MP", estoque: 7, ativo: true },
      { id: "v5", nome: "G - Branco", sku: "CAM-001-GB", estoque: 5, ativo: true },
    ],
    localizacao: "Prateleira A-1",
    fornecedor: "Distribuidora Têxtil SP",
    descricaoCurta: "Camiseta de algodão premium, corte regular, disponível em várias cores e tamanhos",
    dataCadastro: "15/01/2024",
    ultimaMovimentacao: "Hoje, 10:30",
    totalVendido: 234,
  },
  {
    id: "p2",
    nome: "Tênis Running Pro X",
    sku: "TEN-045",
    codigoBarras: "7899876543210",
    categoria: "Calçados",
    marca: "FastStep",
    unidade: "Par",
    precoVenda: 349.90,
    precoCusto: 180.00,
    estoque: 8,
    estoqueMinimo: 10,
    estoqueMaximo: 50,
    status: "ativo",
    estoqueStatus: "baixo",
    possuiVariacoes: true,
    variacoes: [
      { id: "v6", nome: "37 - Azul", sku: "TEN-045-37A", estoque: 2, ativo: true },
      { id: "v7", nome: "38 - Azul", sku: "TEN-045-38A", estoque: 3, ativo: true },
      { id: "v8", nome: "39 - Preto", sku: "TEN-045-39P", estoque: 3, ativo: true },
      { id: "v9", nome: "40 - Preto", sku: "TEN-045-40P", estoque: 0, ativo: true },
    ],
    localizacao: "Estante C-3",
    fornecedor: "FastStep Distribuidora",
    descricaoCurta: "Tênis profissional para corrida com amortecimento avançado",
    dataCadastro: "03/02/2024",
    ultimaMovimentacao: "Ontem, 15:20",
    totalVendido: 89,
  },
  {
    id: "p3",
    nome: "Bolsa Feminina Couro",
    sku: "BOL-023",
    categoria: "Acessórios",
    marca: "Luxe Brasil",
    unidade: "Peça",
    precoVenda: 189.90,
    precoCusto: 70.00,
    precoPromocional: 149.90,
    estoque: 23,
    estoqueMinimo: 5,
    status: "ativo",
    estoqueStatus: "ok",
    possuiVariacoes: false,
    localizacao: "Vitrine 2",
    fornecedor: "Artefatos Couro LTDA",
    descricaoCurta: "Bolsa feminina em couro legítimo com alça ajustável",
    dataCadastro: "20/11/2023",
    ultimaMovimentacao: "Há 3 dias",
    totalVendido: 156,
  },
  {
    id: "p4",
    nome: "Fone de Ouvido Bluetooth",
    sku: "ELE-089",
    codigoBarras: "7893210987654",
    categoria: "Eletrônicos",
    marca: "SoundMax",
    unidade: "Peça",
    precoVenda: 129.90,
    precoCusto: 65.00,
    estoque: 0,
    estoqueMinimo: 5,
    status: "ativo",
    estoqueStatus: "zerado",
    possuiVariacoes: false,
    localizacao: "Estante D-1",
    fornecedor: "Tech Distribuidora",
    descricaoCurta: "Fone sem fio com 30h de bateria e cancelamento de ruído",
    dataCadastro: "08/03/2024",
    ultimaMovimentacao: "Há 1 semana",
    totalVendido: 67,
  },
  {
    id: "p5",
    nome: "Kit Skincare Completo",
    sku: "BEL-012",
    categoria: "Beleza",
    marca: "Glow Up",
    unidade: "Kit",
    precoVenda: 249.90,
    precoCusto: 110.00,
    estoque: 15,
    estoqueMinimo: 8,
    status: "ativo",
    estoqueStatus: "ok",
    possuiVariacoes: false,
    localizacao: "Prateleira B-2",
    fornecedor: "Cosméticos Nacionais",
    descricaoCurta: "Kit completo de skincare com hidratante, sérum e protetor solar",
    dataCadastro: "12/12/2023",
    ultimaMovimentacao: "Hoje, 08:00",
    totalVendido: 203,
  },
  {
    id: "p6",
    nome: "Calça Jeans Slim",
    sku: "CAL-067",
    categoria: "Roupas",
    marca: "Denim Co.",
    unidade: "Peça",
    precoVenda: 149.90,
    precoCusto: 58.00,
    estoque: 4,
    estoqueMinimo: 8,
    status: "ativo",
    estoqueStatus: "baixo",
    possuiVariacoes: true,
    variacoes: [
      { id: "v10", nome: "36 - Azul Claro", sku: "CAL-067-36A", estoque: 1, ativo: true },
      { id: "v11", nome: "38 - Azul Escuro", sku: "CAL-067-38E", estoque: 2, ativo: true },
      { id: "v12", nome: "40 - Preto", sku: "CAL-067-40P", estoque: 1, ativo: true },
    ],
    localizacao: "Prateleira A-3",
    fornecedor: "Distribuidora Têxtil SP",
    descricaoCurta: "Calça jeans slim fit, lavagem especial, alta durabilidade",
    dataCadastro: "05/02/2024",
    ultimaMovimentacao: "Há 2 dias",
    totalVendido: 98,
  },
  {
    id: "p7",
    nome: "Perfume Eau de Parfum 100ml",
    sku: "PER-034",
    categoria: "Beleza",
    marca: "Essence",
    unidade: "Frasco",
    precoVenda: 179.90,
    precoCusto: 75.00,
    estoque: 32,
    estoqueMinimo: 10,
    status: "ativo",
    estoqueStatus: "ok",
    possuiVariacoes: false,
    localizacao: "Vitrine 1",
    fornecedor: "Cosméticos Nacionais",
    descricaoCurta: "Perfume masculino/feminino com notas amadeiradas e florais",
    dataCadastro: "01/10/2023",
    ultimaMovimentacao: "Há 4 dias",
    totalVendido: 312,
  },
  {
    id: "p8",
    nome: "Mochila Executiva 30L",
    sku: "MOC-015",
    categoria: "Acessórios",
    marca: "UrbanPack",
    unidade: "Peça",
    precoVenda: 219.90,
    precoCusto: 95.00,
    estoque: 11,
    estoqueMinimo: 5,
    status: "ativo",
    estoqueStatus: "ok",
    possuiVariacoes: false,
    localizacao: "Estante B-4",
    fornecedor: "Bolsas & Cia",
    descricaoCurta: "Mochila para notebooks até 15,6\", impermeável, múltiplos compartimentos",
    dataCadastro: "18/09/2023",
    ultimaMovimentacao: "Há 5 dias",
    totalVendido: 145,
  },
  {
    id: "p9",
    nome: "Sandália Plataforma",
    sku: "SAN-078",
    categoria: "Calçados",
    marca: "Sol & Mar",
    unidade: "Par",
    precoVenda: 119.90,
    precoCusto: 48.00,
    estoque: 0,
    estoqueMinimo: 6,
    status: "inativo",
    estoqueStatus: "zerado",
    possuiVariacoes: false,
    localizacao: "Estante C-1",
    descricaoCurta: "Sandália plataforma 5cm, couro ecológico, vários modelos",
    dataCadastro: "30/07/2023",
    ultimaMovimentacao: "Há 1 mês",
    totalVendido: 42,
  },
  {
    id: "p10",
    nome: "Relógio Smartwatch Fit",
    sku: "REL-002",
    codigoBarras: "7894567891230",
    categoria: "Eletrônicos",
    marca: "TimeSync",
    unidade: "Peça",
    precoVenda: 399.90,
    precoCusto: 210.00,
    estoque: 6,
    estoqueMinimo: 5,
    estoqueMaximo: 30,
    status: "ativo",
    estoqueStatus: "ok",
    possuiVariacoes: false,
    localizacao: "Vitrine 3",
    fornecedor: "Tech Distribuidora",
    descricaoCurta: "Smartwatch com monitor cardíaco, GPS e 7 dias de bateria",
    dataCadastro: "14/03/2024",
    ultimaMovimentacao: "Há 2 dias",
    totalVendido: 29,
  },
];

export const MOVIMENTACOES: Movimentacao[] = [
  {
    id: "m1",
    produtoId: "p1",
    produtoNome: "Camiseta Básica Premium",
    produtoSku: "CAM-001",
    tipo: "entrada",
    quantidade: 50,
    motivo: "Compra",
    responsavel: "Maria Silva",
    observacao: "Reposição de estoque - NF 12345",
    data: "31/03/2024 - 10:30",
    custo: 35.00,
    cancelada: false,
  },
  {
    id: "m2",
    produtoId: "p5",
    produtoNome: "Kit Skincare Completo",
    produtoSku: "BEL-012",
    tipo: "entrada",
    quantidade: 20,
    motivo: "Compra",
    responsavel: "Maria Silva",
    observacao: "Pedido mensal fornecedor",
    data: "31/03/2024 - 08:00",
    custo: 110.00,
    cancelada: false,
  },
  {
    id: "m3",
    produtoId: "p2",
    produtoNome: "Tênis Running Pro X",
    produtoSku: "TEN-045",
    tipo: "saida",
    quantidade: 3,
    motivo: "Venda",
    responsavel: "Sistema PDV",
    observacao: "Venda #V-8821",
    data: "30/03/2024 - 15:20",
    cancelada: false,
    variacao: "39 - Preto",
  },
  {
    id: "m4",
    produtoId: "p4",
    produtoNome: "Fone de Ouvido Bluetooth",
    produtoSku: "ELE-089",
    tipo: "saida",
    quantidade: 5,
    motivo: "Venda",
    responsavel: "Sistema PDV",
    observacao: "Estoque zerado após vendas da semana",
    data: "29/03/2024 - 18:45",
    cancelada: false,
  },
  {
    id: "m5",
    produtoId: "p3",
    produtoNome: "Bolsa Feminina Couro",
    produtoSku: "BOL-023",
    tipo: "saida",
    quantidade: 2,
    motivo: "Perda",
    responsavel: "Ana Operações",
    observacao: "Produto danificado durante transporte",
    data: "28/03/2024 - 11:00",
    cancelada: false,
  },
  {
    id: "m6",
    produtoId: "p7",
    produtoNome: "Perfume Eau de Parfum 100ml",
    produtoSku: "PER-034",
    tipo: "entrada",
    quantidade: 15,
    motivo: "Compra",
    responsavel: "Maria Silva",
    observacao: "Reposição trimestral",
    data: "27/03/2024 - 14:30",
    custo: 75.00,
    cancelada: false,
  },
  {
    id: "m7",
    produtoId: "p6",
    produtoNome: "Calça Jeans Slim",
    produtoSku: "CAL-067",
    tipo: "saida",
    quantidade: 1,
    motivo: "Ajuste",
    responsavel: "Ana Operações",
    observacao: "Divergência no inventário",
    data: "26/03/2024 - 16:00",
    cancelada: false,
  },
  {
    id: "m8",
    produtoId: "p8",
    produtoNome: "Mochila Executiva 30L",
    produtoSku: "MOC-015",
    tipo: "entrada",
    quantidade: 5,
    motivo: "Devolução",
    responsavel: "Ana Operações",
    observacao: "Cliente devolveu - produto sem defeito",
    data: "25/03/2024 - 10:15",
    cancelada: false,
  },
  {
    id: "m9",
    produtoId: "p1",
    produtoNome: "Camiseta Básica Premium",
    produtoSku: "CAM-001",
    tipo: "saida",
    quantidade: 8,
    motivo: "Venda",
    responsavel: "Sistema PDV",
    data: "25/03/2024 - 09:00",
    cancelada: false,
    variacao: "M - Branco",
  },
  {
    id: "m10",
    produtoId: "p10",
    produtoNome: "Relógio Smartwatch Fit",
    produtoSku: "REL-002",
    tipo: "entrada",
    quantidade: 10,
    motivo: "Compra",
    responsavel: "Maria Silva",
    observacao: "Novo produto em catálogo",
    data: "14/03/2024 - 11:00",
    custo: 210.00,
    cancelada: false,
  },
];

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function calcMargem(custo: number, venda: number): number {
  if (venda === 0) return 0;
  return Math.round(((venda - custo) / venda) * 100);
}

export function getEstoqueStatusConfig(status: EstoqueStatus) {
  switch (status) {
    case "ok":
      return { label: "Estoque OK", bg: "#F0FDF4", text: "#15803D", border: "#86EFAC", dot: "#22C55E" };
    case "baixo":
      return { label: "Estoque Baixo", bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", dot: "#F59E0B" };
    case "zerado":
      return { label: "Estoque Zerado", bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", dot: "#EF4444" };
  }
}
