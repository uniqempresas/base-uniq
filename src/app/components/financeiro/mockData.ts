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

export type StatusMovimentacao = "pago" | "pendente" | "vencido" | "cancelado";
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
  fornecedorId?: string;
  categoria?: string;
  categoriaId?: string;
  valor: number;
  dataVencimento: string;
  status: StatusMovimentacao;
  formaPagamento?: FormaPagamento;
  recorrente?: boolean;
  observacoes?: string;
}

export interface ContaReceber {
  id: string;
  cliente: string; // nome do cliente (NUNCA vazio; fallback "Cliente não informado")
  clienteId?: string;
  telefone?: string; // me_cliente.telefone — usado pela ação "Enviar cobrança" (wa.me)
  vendaId?: string;
  numeroPedido?: string; // npedido da venda, senão 8 primeiros chars do uuid da venda
  descricao: string; // rótulo amigável SEM uuid cru
  itensResumo?: string; // "2x Surpresa de Uva, 1x Trufa"
  categoria?: string;
  categoriaId?: string;
  valor: number;
  dataPrevista: string; // ISO yyyy-mm-dd
  status: StatusMovimentacao;
  formaPagamento?: FormaPagamento;
  parcela?: string; // "1/3", "2/3", etc.
  observacoes?: string;
  vendaCancelada?: boolean; // true quando me_venda.status_venda = 'cancelado'
}

// ============================================================
// Contratos de input do módulo Financeiro (frozen — a lane de
// páginas codifica contra estes tipos)
// ============================================================
export interface ContaReceberInput {
  cliente: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  forma_pagamento: string;
  observacoes?: string;
}

export interface ContaPagarInput {
  descricao: string;
  fornecedor?: string;
  valor: number;
  data_vencimento: string;
  forma_pagamento: string;
  observacoes?: string;
}

// ============================================================
// Helpers de normalização de forma de pagamento
// Banco grava minúsculo canônico (pix, dinheiro, boleto,
// transferencia, cartao). Na exibição vira FormaPagamento.
// ============================================================

const FORMA_PAGAMENTO_PARA_BANCO: Record<string, string> = {
  pix: "pix",
  dinheiro: "dinheiro",
  boleto: "boleto",
  transferencia: "transferencia",
  cartao: "cartao",
  cartaocredito: "cartao",
  cartaodebito: "cartao",
  credito: "cartao",
  debito: "cartao",
};

/** Normaliza qualquer escrita ("PIX", "pix", "cartão", "cartao_credito", "Transferência"...) para a chave canônica. */
function normalizarChaveFormaPagamento(valor: string): string {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z]/g, ""); // remove espaços, _, - etc.
}

/** Converte valor do banco/formulário para FormaPagamento exibível. */
export function mapearFormaPagamento(
  fp: string | null | undefined
): FormaPagamento | undefined {
  if (!fp) return undefined;
  const chave = normalizarChaveFormaPagamento(fp);
  if (chave === "pix") return "PIX";
  if (chave === "dinheiro") return "Dinheiro";
  if (chave === "boleto") return "Boleto";
  if (chave === "transferencia") return "Transferência";
  if (chave.startsWith("cartao") || chave === "credito" || chave === "debito") return "Cartão";
  return undefined;
}

/** Converte FormaPagamento/formulário para o valor minúsculo canônico gravado no banco. */
export function formaPagamentoParaBanco(
  fp: string | null | undefined
): string | null {
  if (!fp) return null;
  const chave = normalizarChaveFormaPagamento(fp);
  const resolvido = FORMA_PAGAMENTO_PARA_BANCO[chave];
  if (resolvido) return resolvido;
  // Desconhecida: grava o que veio, minúsculo e sem acentos, para não quebrar a exibição.
  return chave || null;
}

/**
 * Data local (yyyy-mm-dd) n dias a partir de hoje — nunca usa toISOString
 * (evita bug de fuso). n negativo = passado, n positivo = futuro.
 * Os mocks do Financeiro usam este helper para nunca ficarem obsoletos:
 * as telas sempre exercitam KPIs/badges com datas relativas a hoje.
 */
export function diasAPartirDeHoje(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Movimentações (últimos 30 dias)
export const movimentacoesMock: Movimentacao[] = [
  // Entradas (vendas) — datas relativas ao mês corrente para o demo nunca envelhecer
  {
    id: "mov-1",
    descricao: "Venda PDV #1234",
    tipo: "entrada",
    valor: 450.00,
    data: `${diasAPartirDeHoje(-1)}T10:30:00`,
    categoria: "Vendas",
    status: "pago",
    pessoa: "Maria Santos",
  },
  {
    id: "mov-2",
    descricao: "Venda Loja Online #5678",
    tipo: "entrada",
    valor: 890.50,
    data: `${diasAPartirDeHoje(-2)}T14:20:00`,
    categoria: "Vendas",
    status: "pago",
    pessoa: "João Silva",
  },
  {
    id: "mov-3",
    descricao: "Venda PDV #1235",
    tipo: "entrada",
    valor: 125.00,
    data: `${diasAPartirDeHoje(-3)}T16:45:00`,
    categoria: "Vendas",
    status: "pago",
    pessoa: "Cliente Avulso",
  },
  {
    id: "mov-4",
    descricao: "Venda PDV #1236",
    tipo: "entrada",
    valor: 670.00,
    data: `${diasAPartirDeHoje(-6)}T11:10:00`,
    categoria: "Vendas",
    status: "pago",
  },
  {
    id: "mov-5",
    descricao: "Prestação de Serviço",
    tipo: "entrada",
    valor: 350.00,
    data: `${diasAPartirDeHoje(-8)}T09:00:00`,
    categoria: "Outras Receitas",
    status: "pago",
    pessoa: "Empresa XYZ",
  },
  // Saídas (despesas)
  {
    id: "mov-6",
    descricao: "Aluguel do mês",
    tipo: "saida",
    valor: 1200.00,
    data: `${diasAPartirDeHoje(-5)}T08:00:00`,
    categoria: "Aluguel",
    status: "pago",
    pessoa: "Imobiliária Silva",
  },
  {
    id: "mov-7",
    descricao: "Internet - NET",
    tipo: "saida",
    valor: 99.90,
    data: `${diasAPartirDeHoje(-9)}T12:00:00`,
    categoria: "Internet",
    status: "pago",
    pessoa: "NET",
  },
  {
    id: "mov-8",
    descricao: "Conta de Luz",
    tipo: "saida",
    valor: 180.50,
    data: `${diasAPartirDeHoje(-12)}T12:00:00`,
    categoria: "Luz",
    status: "pago",
    pessoa: "Copel",
  },
  {
    id: "mov-9",
    descricao: "Fornecedor - Mercadorias",
    tipo: "saida",
    valor: 850.00,
    data: `${diasAPartirDeHoje(-15)}T10:00:00`,
    categoria: "Fornecedores",
    status: "pago",
    pessoa: "Distribuidora ABC",
  },
  {
    id: "mov-10",
    descricao: "Material de Divulgação",
    tipo: "saida",
    valor: 150.00,
    data: `${diasAPartirDeHoje(-18)}T14:30:00`,
    categoria: "Marketing",
    status: "pago",
    pessoa: "Gráfica Rápida",
  },
];

// Contas a Pagar
export const contasPagarMock: ContaPagar[] = [
  {
    id: "pagar-1",
    descricao: "Aluguel do mês",
    fornecedor: "Imobiliária Silva",
    categoria: "Aluguel",
    valor: 1200.00,
    dataVencimento: diasAPartirDeHoje(4),
    status: "pendente",
    recorrente: true,
  },
  {
    id: "pagar-2",
    descricao: "Internet - NET",
    fornecedor: "NET",
    categoria: "Internet",
    valor: 99.90,
    dataVencimento: diasAPartirDeHoje(11),
    status: "pendente",
    recorrente: true,
  },
  {
    id: "pagar-3",
    descricao: "Conta de Luz",
    fornecedor: "Copel",
    categoria: "Luz",
    valor: 195.30,
    dataVencimento: diasAPartirDeHoje(7),
    status: "pendente",
  },
  {
    id: "pagar-4",
    descricao: "Água e Esgoto",
    fornecedor: "Sanepar",
    categoria: "Água",
    valor: 65.80,
    dataVencimento: diasAPartirDeHoje(2),
    status: "pendente",
  },
  {
    id: "pagar-5",
    descricao: "Fornecedor - Reposição Estoque",
    fornecedor: "Distribuidora ABC",
    categoria: "Fornecedores",
    valor: 1450.00,
    dataVencimento: diasAPartirDeHoje(6),
    status: "pendente",
  },
  {
    id: "pagar-6",
    descricao: "DAS - Simples Nacional",
    fornecedor: "Receita Federal",
    categoria: "Impostos",
    valor: 320.50,
    dataVencimento: diasAPartirDeHoje(-5),
    status: "vencido",
    recorrente: true,
  },
  {
    id: "pagar-7",
    descricao: "Salário - Funcionária",
    fornecedor: "Ana Costa",
    categoria: "Salários",
    valor: 1500.00,
    dataVencimento: diasAPartirDeHoje(1),
    status: "pendente",
    recorrente: true,
  },
  {
    id: "pagar-8",
    descricao: "Manutenção Equipamentos",
    fornecedor: "TechFix",
    categoria: "Outras Despesas",
    valor: 250.00,
    dataVencimento: diasAPartirDeHoje(-9),
    status: "pago",
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
    dataPrevista: diasAPartirDeHoje(4),
    status: "pendente",
    formaPagamento: "Cartão",
    parcela: "2/3",
    vendaId: "venda-5678",
    numeroPedido: "5678",
    clienteId: "cli-joao-silva",
    telefone: "11987654321",
    categoriaId: "cat-vendas",
  },
  {
    id: "receber-2",
    cliente: "Maria Santos",
    descricao: "Fiado - Produtos",
    categoria: "Vendas",
    valor: 150.00,
    dataPrevista: diasAPartirDeHoje(11),
    status: "pendente",
    formaPagamento: "PIX",
    telefone: "11981112222",
  },
  {
    id: "receber-3",
    cliente: "Empresa XYZ",
    descricao: "Prestação de Serviço - Parcela 1/2",
    categoria: "Outras Receitas",
    valor: 500.00,
    dataPrevista: diasAPartirDeHoje(-12),
    status: "vencido",
    formaPagamento: "Transferência",
    parcela: "1/2",
  },
  {
    id: "receber-4",
    cliente: "Pedro Oliveira",
    descricao: "Venda a Prazo",
    categoria: "Vendas",
    valor: 340.00,
    dataPrevista: diasAPartirDeHoje(-3),
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
    dataPrevista: diasAPartirDeHoje(-9),
    status: "pago",
    formaPagamento: "Boleto",
  },
  {
    id: "receber-6",
    cliente: "Carlos Mendes",
    descricao: "Venda Parcelada #4521",
    categoria: "Vendas",
    valor: 220.00,
    dataPrevista: diasAPartirDeHoje(-2),
    status: "cancelado",
    formaPagamento: "Cartão",
    parcela: "3/4",
    vendaId: "venda-4521",
    numeroPedido: "4521",
    clienteId: "cli-carlos-mendes",
    telefone: "11985556666",
    categoriaId: "cat-vendas",
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

/** Rótulo do mês corrente em pt-BR (ex.: "Setembro 2026"). */
export function mesCorrenteRotulo(): string {
  const agora = new Date();
  const mes = agora.toLocaleDateString("pt-BR", { month: "long" });
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${agora.getFullYear()}`;
}

export const dreMock: DREData = {
  periodo: mesCorrenteRotulo(),
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
  // pago e cancelado são terminais: nunca podem ser sobrescritos por vencido/pendente
  if (statusAtual === "pago" || statusAtual === "cancelado") return statusAtual;
  const dias = calcularDiasVencimento(dataVencimento);
  if (dias < 0) return "vencido";
  return "pendente";
}
