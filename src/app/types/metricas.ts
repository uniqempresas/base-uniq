/**
 * Tipos TypeScript para o Módulo de Métricas e Analytics
 * UNIQ Empresas - Sprint 14
 */

// ===========================================
// TIPOS BASE
// ===========================================

/** Período para filtragem de dados */
export type Periodo =
  | 'hoje'
  | 'ontem'
  | 'ultimos-7-dias'
  | 'ultimos-30-dias'
  | 'este-mes'
  | 'mes-passado'
  | 'este-ano'
  | 'ano-passado'
  | 'personalizado';

/** Tipo de período para comparação */
export type TipoComparacao =
  | 'periodo-anterior'
  | 'mesmo-periodo-ano-anterior'
  | 'nenhuma';

/** Intervalo de datas */
export interface IntervaloData {
  inicio: Date;
  fim: Date;
}

/** Valor com tendência */
export interface ValorTendencia {
  valor: number;
  tendencia: number; // Porcentagem (-100 a +100)
  direcao: 'up' | 'down' | 'stable';
}

// ===========================================
// KPI
// ===========================================

/** Tipos de KPI suportados */
export type TipoKPI =
  | 'faturamento'
  | 'vendas'
  | 'ticket-medio'
  | 'novos-clientes'
  | 'taxa-conversao'
  | 'receitas'
  | 'despesas'
  | 'lucro'
  | 'saldo'
  | 'agendamentos'
  | 'taxa-comparecimento'
  | 'taxa-cancelamento'
  | 'tempo-medio-espera'
  | 'ocupacao'
  | 'clientes-ativos'
  | 'churn-rate'
  | 'produtos-vendidos'
  | 'estoque-atual';

/** Formato de valor do KPI */
export type FormatoKPI = 'currency' | 'number' | 'percent';

/** KPI individual */
export interface KPI {
  id: string;
  tipo: TipoKPI;
  label: string;
  valor: number;
  formato: FormatoKPI;
  tendencia: number;
  periodoAnterior?: number;
  meta?: number;
  icon?: string;
}

/** Card de KPI para display */
export interface KPICard {
  tipo: TipoKPI;
  label: string;
  valor: number;
  formato: FormatoKPI;
  tendencia: number;
  periodoAnterior?: number;
  meta?: number;
}

// ===========================================
// DADOS DE VENDAS
// ===========================================

/** Cliente associado a uma venda */
export interface VendaCliente {
  id: string;
  nome: string;
}

/** Produto em uma venda */
export interface Venda_produto {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

/** Colaborador associado a uma venda */
export interface VendaColaborador {
  id: string;
  nome: string;
}

/** Forma de pagamento */
export type FormaPagamento = 'dinheiro' | 'cartao' | 'pix' | 'boleto';

/** Status da venda */
export type StatusVenda = 'pendente' | 'pago' | 'cancelado';

/** Venda individual */
export interface DadoVenda {
  id: string;
  data: Date;
  cliente: VendaCliente;
  produtos: Venda_produto[];
  valorTotal: number;
  desconto: number;
  formaPagamento: FormaPagamento;
  status: StatusVenda;
  colaborador: VendaColaborador;
}

/** Resumo de vendas por período */
export interface ResumoVendas {
  total: number;
  quantidade: number;
  ticketMedio: number;
  porCategoria: Array<{
    categoria: string;
    valor: number;
    quantidade: number;
  }>;
  porCanal: Array<{
    canal: string;
    valor: number;
  }>;
  tendencia: number;
}

// ===========================================
// DADOS FINANCEIROS
// ===========================================

/** Tipo de movimentação */
export type TipoMovimentacao = 'entrada' | 'saida';

/** Status da movimentação */
export type StatusMovimentacao = 'confirmado' | 'pendente';

/** Movimentação financeira */
export interface MovimentacaoFinanceira {
  id: string;
  data: Date;
  descricao: string;
  categoria: string;
  tipo: TipoMovimentacao;
  valor: number;
  status: StatusMovimentacao;
}

/** Resumo financeiro */
export interface ResumoFinanceiro {
  receitas: number;
  despesas: number;
  lucro: number;
  saldo: number;
  porCategoria: Array<{
    categoria: string;
    valor: number;
    tipo: TipoMovimentacao;
  }>;
}

// ===========================================
// DADOS DE CLIENTES
// ===========================================

/** Status do cliente */
export type StatusCliente = 'ativo' | 'inativo' | 'inativo-30-dias' | 'inativo-90-dias';

/** Cliente cadastrado */
export interface DadoCliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataCadastro: Date;
  totalGasto: number;
  ultimaCompra?: Date;
  frequencia: number;
  status: StatusCliente;
}

/** Resumo de clientes */
export interface ResumoClientes {
  totalClientes: number;
  novosClientes: number;
  clientesAtivos: number;
  churnRate: number;
  ticketMedio: number;
  porFaixaEtaria: Array<{
    faixa: string;
    quantidade: number;
  }>;
  porGenero: Array<{
    genero: string;
    quantidade: number;
  }>;
  porBairro: Array<{
    bairro: string;
    quantidade: number;
  }>;
  porCanal: Array<{
    canal: string;
    quantidade: number;
  }>;
}

// ===========================================
// DADOS DE AGENDAMENTOS
// ===========================================

/** Cliente do agendamento */
export interface AgendamentoCliente {
  id: string;
  nome: string;
}

/** Serviço do agendamento */
export interface AgendamentoServico {
  id: string;
  nome: string;
  duracao: number;
}

/** Colaborador do agendamento */
export interface AgendamentoColaborador {
  id: string;
  nome: string;
}

/** Status do agendamento */
export type StatusAgendamento = 'realizado' | 'cancelado' | 'faltoso';

/** Agendamento realizado */
export interface DadoAgendamento {
  id: string;
  data: Date;
  hora: string;
  cliente: AgendamentoCliente;
  servico: AgendamentoServico;
  colaborador: AgendamentoColaborador;
  valor: number;
  status: StatusAgendamento;
  duracaoReal?: number;
}

/** Resumo de agendamentos */
export interface ResumoAgendamentos {
  total: number;
  realizados: number;
  comparecimento: number;
  cancelamentos: number;
  faltosos: number;
  receita: number;
  ocupacao: number;
  porDiaSemana: Array<{
    dia: string;
    quantidade: number;
  }>;
  porHora: Array<{
    hora: string;
    quantidade: number;
  }>;
  porColaborador: Array<{
    colaborador: string;
    quantidade: number;
    receita: number;
  }>;
}

// ===========================================
// DADOS DE PRODUTOS
// ===========================================

/** Status do produto */
export type StatusProduto = 'disponivel' | 'baixo-estoque' | 'esgotado';

/** Produto vendido */
export interface DadoProduto {
  id: string;
  sku: string;
  nome: string;
  categoria: string;
  quantidadeVendida: number;
  estoqueAtual: number;
  valorEstoque: number;
  valorUnitario: number;
  margem: number;
  diasEstoque: number;
  status: StatusProduto;
}

/** Resumo de produtos */
export interface ResumoProdutos {
  maisVendidos: Array<{
    id: string;
    nome: string;
    quantidade: number;
    valor: number;
  }>;
  maiorMargem: Array<{
    id: string;
    nome: string;
    margem: number;
  }>;
  giro: number;
  parados: number;
  emFalta: number;
  valorTotalEstoque: number;
  porCategoria: Array<{
    categoria: string;
    quantidade: number;
    valor: number;
  }>;
}

// ===========================================
// FILTROS
// ===========================================

/** Filtros avançados para relatórios */
export interface FiltrosMetricas {
  periodo: Periodo;
  intervaloData?: IntervaloData;
  compararCom?: TipoComparacao;
  categoria?: string[];
  canal?: string[];
  colaborador?: string[];
  cliente?: string[];
  formaPagamento?: FormaPagamento[];
  status?: string[];
}

// ===========================================
// DADOS DE GRÁFICOS
// ===========================================

/** Dado para gráfico de área/linha */
export interface DadoGrafico {
  data: string;
  valor: number;
  quantidade?: number;
}

/** Dado para gráfico de pizza/donut */
export interface DadoDistribuicao {
  name: string;
  value: number;
}

/** Dado para heatmap de agendamentos */
export interface DadoHeatmap {
  diaSemana: string;
  hora: string;
  quantidade: number;
}

// ===========================================
// DADOS COMPLETOS POR PÁGINA
// ===========================================

/** Dados do Dashboard */
export interface DashboardData {
  kpis: KPI[];
  vendasGrafico: DadoGrafico[];
  ProdutosGrafico: DadoDistribuicao[];
  ultimasVendas: DadoVenda[];
}

/** Dados de Vendas */
export interface VendasData {
  resumo: ResumoVendas;
  graficoTemporal: DadoGrafico[];
  porCategoria: DadoGrafico[];
  porCanal: DadoDistribuicao[];
  detalhadas: DadoVenda[];
}

/** Dados Financeiros */
export interface FinanceiroData {
  resumo: ResumoFinanceiro;
  fluxoCaixa: DadoGrafico[];
 despesasPorCategoria: DadoDistribuicao[];
  evolucaoSaldo: DadoGrafico[];
}

/** Dados de Clientes */
export interface ClientesData {
  resumo: ResumoClientes;
  evolucaoBase: DadoGrafico[];
  porFaixaEtaria: DadoGrafico[];
  porGenero: DadoDistribuicao[];
  porBairro: DadoDistribuicao[];
}

/** Dados de Agendamentos */
export interface AgendamentosData {
  resumo: ResumoAgendamentos;
  porDiaSemana: DadoGrafico[];
  heatmap: DadoHeatmap[];
  comparecimentoFaltas: DadoDistribuicao[];
  porColaborador: DadoGrafico[];
}

/** Dados de Produtos */
export interface ProdutosData {
  resumo: ResumoProdutos;
  top10: DadoGrafico[];
  curvaABC: DadoDistribuicao[];
  inventario: DadoGrafico[];
  porCategoria: DadoDistribuicao[];
}

// ===========================================
// TIPOS DE HOOK
// ===========================================

/** Tipo de página de métricas */
export type TipoPaginaMetricas =
  | 'dashboard'
  | 'vendas'
  | 'financeiro'
  | 'clientes'
  | 'agendamentos'
  | 'produtos';

/** Retorno do hook useMetricas */
export interface UseMetricasReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/** Props do hook useMetricas */
export interface UseMetricasProps {
  tipo: TipoPaginaMetricas;
  filtros: FiltrosMetricas;
}

/** Retorno do hook useDateRange */
export interface UseDateRangeReturn {
  preset: Periodo;
  setPreset: (preset: Periodo) => void;
  dateRange: IntervaloData;
  setDateRange: (range: IntervaloData) => void;
  compare: TipoComparacao;
  setCompare: (compare: TipoComparacao) => void;
  compararData?: IntervaloData;
}