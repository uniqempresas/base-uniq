// Mock data para o módulo Financeiro
// Dados simples e realistas para pequenos empreendedores

export type Categoria =
  | "Vendas"
  | "Aluguel"
  | "Internet"
  | "Luz"
  | "Água"
  | "Fornecedores"
  | "Impostos"
  | "Salários"
  | "Marketing"
  | "Outras Receitas"
  | "Outras Despesas";

export type StatusMovimentacao = "pago" | "pendente" | "vencido";
export type TipoMovimentacao = "entrada" | "saida";
export type FormaPagamento = "Dinheiro" | "PIX" | "Boleto" | "Transferência" | "Cartão";

export interface Movimentacao {
  id: string;
  descricao: string;
  tipo: TipoMovimentacao;
  valor: number;
  data: string; // ISO date
  categoria: Categoria;
  status: StatusMovimentacao;
  pessoa?: string; // Nome do cliente/fornecedor
  observacoes?: string;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor: string;
  categoria: Categoria;
  valor: number;
  dataVencimento: string;
  status: StatusMovimentacao;
  recorrente?: boolean;
  observacoes?: string;
}

export interface ContaReceber {
  id: string;
  cliente: string;
  descricao: string;
  categoria: Categoria;
  valor: number;
  dataPrevista: string;
  status: StatusMovimentacao;
  formaPagamento?: FormaPagamento;
  vinculoVenda?: string;
  parcela?: string; // "1/3", "2/3", etc.
  observacoes?: string;
}

// Movimentações (últimos 30 dias)
export const movimentacoesMock: Movimentacao[] = [
  // Entradas (vendas)
  {
    id: "mov-1",
    descricao: "Venda PDV #1234",
    tipo: "entrada",
    valor: 450.00,
    data: "2025-04-01T10:30:00",
    categoria: "Vendas",
    status: "pago",
    pessoa: "Maria Santos",
  },
  {
    id: "mov-2",
    descricao: "Venda Loja Online #5678",
    tipo: "entrada",
    valor: 890.50,
    data: "2025-04-01T14:20:00",
    categoria: "Vendas",
    status: "pago",
    pessoa: "João Silva",
  },
  {
    id: "mov-3",
    descricao: "Venda PDV #1235",
    tipo: "entrada",
    valor: 125.00,
    data: "2025-03-31T16:45:00",
    categoria: "Vendas",
    status: "pago",
    pessoa: "Cliente Avulso",
  },
  {
    id: "mov-4",
    descricao: "Venda PDV #1236",
    tipo: "entrada",
    valor: 670.00,
    data: "2025-03-30T11:10:00",
    categoria: "Vendas",
    status: "pago",
  },
  {
    id: "mov-5",
    descricao: "Prestação de Serviço",
    tipo: "entrada",
    valor: 350.00,
    data: "2025-03-29T09:00:00",
    categoria: "Outras Receitas",
    status: "pago",
    pessoa: "Empresa XYZ",
  },
  // Saídas (despesas)
  {
    id: "mov-6",
    descricao: "Aluguel Março",
    tipo: "saida",
    valor: 1200.00,
    data: "2025-03-10T08:00:00",
    categoria: "Aluguel",
    status: "pago",
    pessoa: "Imobiliária Silva",
  },
  {
    id: "mov-7",
    descricao: "Internet - NET",
    tipo: "saida",
    valor: 99.90,
    data: "2025-03-15T00:00:00",
    categoria: "Internet",
    status: "pago",
    pessoa: "NET",
  },
  {
    id: "mov-8",
    descricao: "Conta de Luz",
    tipo: "saida",
    valor: 180.50,
    data: "2025-03-20T00:00:00",
    categoria: "Luz",
    status: "pago",
    pessoa: "Copel",
  },
  {
    id: "mov-9",
    descricao: "Fornecedor - Mercadorias",
    tipo: "saida",
    valor: 850.00,
    data: "2025-03-25T10:00:00",
    categoria: "Fornecedores",
    status: "pago",
    pessoa: "Distribuidora ABC",
  },
  {
    id: "mov-10",
    descricao: "Material de Divulgação",
    tipo: "saida",
    valor: 150.00,
    data: "2025-03-28T14:30:00",
    categoria: "Marketing",
    status: "pago",
    pessoa: "Gráfica Rápida",
  },
];

// Contas a Pagar
export const contasPagarMock: ContaPagar[] = [
  {
    id: "pagar-1",
    descricao: "Aluguel Abril",
    fornecedor: "Imobiliária Silva",
    categoria: "Aluguel",
    valor: 1200.00,
    dataVencimento: "2025-04-10",
    status: "pendente",
    recorrente: true,
  },
  {
    id: "pagar-2",
    descricao: "Internet - NET",
    fornecedor: "NET",
    categoria: "Internet",
    valor: 99.90,
    dataVencimento: "2025-04-15",
    status: "pendente",
    recorrente: true,
  },
  {
    id: "pagar-3",
    descricao: "Conta de Luz",
    fornecedor: "Copel",
    categoria: "Luz",
    valor: 195.30,
    dataVencimento: "2025-04-20",
    status: "pendente",
  },
  {
    id: "pagar-4",
    descricao: "Água e Esgoto",
    fornecedor: "Sanepar",
    categoria: "Água",
    valor: 65.80,
    dataVencimento: "2025-04-18",
    status: "pendente",
  },
  {
    id: "pagar-5",
    descricao: "Fornecedor - Reposição Estoque",
    fornecedor: "Distribuidora ABC",
    categoria: "Fornecedores",
    valor: 1450.00,
    dataVencimento: "2025-04-05",
    status: "pendente",
  },
  {
    id: "pagar-6",
    descricao: "DAS - Simples Nacional",
    fornecedor: "Receita Federal",
    categoria: "Impostos",
    valor: 320.50,
    dataVencimento: "2025-03-28",
    status: "vencido",
    recorrente: true,
  },
  {
    id: "pagar-7",
    descricao: "Salário - Funcionária",
    fornecedor: "Ana Costa",
    categoria: "Salários",
    valor: 1500.00,
    dataVencimento: "2025-04-05",
    status: "pendente",
    recorrente: true,
  },
  {
    id: "pagar-8",
    descricao: "Manutenção Equipamentos",
    fornecedor: "TechFix",
    categoria: "Outras Despesas",
    valor: 250.00,
    dataVencimento: "2025-03-30",
    status: "vencido",
  },
];

// Contas a Receber
export const contasReceberMock: ContaReceber[] = [
  {
    id: "receber-1",
    cliente: "João Silva",
    descricao: "Venda Parcelada #5678",
    categoria: "Vendas",
    valor: 296.83,
    dataPrevista: "2025-04-05",
    status: "pendente",
    formaPagamento: "Cartão",
    parcela: "2/3",
    vinculoVenda: "venda-5678",
  },
  {
    id: "receber-2",
    cliente: "Maria Santos",
    descricao: "Fiado - Produtos",
    categoria: "Vendas",
    valor: 150.00,
    dataPrevista: "2025-04-10",
    status: "pendente",
    formaPagamento: "PIX",
  },
  {
    id: "receber-3",
    cliente: "Empresa XYZ",
    descricao: "Prestação de Serviço - Parcela 1/2",
    categoria: "Outras Receitas",
    valor: 500.00,
    dataPrevista: "2025-04-15",
    status: "pendente",
    formaPagamento: "Transferência",
    parcela: "1/2",
  },
  {
    id: "receber-4",
    cliente: "Pedro Oliveira",
    descricao: "Venda a Prazo",
    categoria: "Vendas",
    valor: 340.00,
    dataPrevista: "2025-03-25",
    status: "vencido",
    formaPagamento: "PIX",
    observacoes: "Cliente pediu para parcelar",
  },
  {
    id: "receber-5",
    cliente: "Juliana Costa",
    descricao: "Encomenda Especial",
    categoria: "Vendas",
    valor: 680.00,
    dataPrevista: "2025-04-20",
    status: "pendente",
    formaPagamento: "Boleto",
  },
  {
    id: "receber-6",
    cliente: "Carlos Mendes",
    descricao: "Venda Parcelada #4521",
    categoria: "Vendas",
    valor: 220.00,
    dataPrevista: "2025-03-28",
    status: "vencido",
    formaPagamento: "Cartão",
    parcela: "3/4",
    vinculoVenda: "venda-4521",
  },
];

// Dados agregados para o DRE Simples
export interface DREData {
  periodo: string;
  receitaBruta: number;
  impostos: number;
  receitaLiquida: number;
  custos: number;
  lucroBruto: number;
  despesasOperacionais: number;
  lucroLiquido: number;
  margemLucro: number;
  categoriasDespesas: { nome: string; valor: number }[];
  categoriasReceitas: { nome: string; valor: number }[];
}

export const dreMock: DREData = {
  periodo: "Março 2025",
  receitaBruta: 2485.50,
  impostos: 124.28, // ~5% estimado Simples Nacional
  receitaLiquida: 2361.22,
  custos: 850.00, // Custo de mercadorias
  lucroBruto: 1511.22,
  despesasOperacionais: 1730.20, // Soma de todas as despesas
  lucroLiquido: -218.98, // Prejuízo
  margemLucro: -8.8,
  categoriasDespesas: [
    { nome: "Aluguel", valor: 1200.00 },
    { nome: "Internet", valor: 99.90 },
    { nome: "Luz", valor: 180.50 },
    { nome: "Marketing", valor: 150.00 },
    { nome: "Outras", valor: 99.80 },
  ],
  categoriasReceitas: [
    { nome: "Vendas", valor: 2135.50 },
    { nome: "Serviços", valor: 350.00 },
  ],
};

// Helper para calcular dias de atraso/antecedência
export function calcularDiasVencimento(dataVencimento: string): number {
  const hoje = new Date();
  const vencimento = new Date(dataVencimento);
  const diff = vencimento.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Helper para formatar moeda BRL
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

// Helper para calcular status baseado na data
export function calcularStatus(dataVencimento: string, statusAtual: StatusMovimentacao): StatusMovimentacao {
  if (statusAtual === "pago") return "pago";
  const dias = calcularDiasVencimento(dataVencimento);
  if (dias < 0) return "vencido";
  return "pendente";
}
