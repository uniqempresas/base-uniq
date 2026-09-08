/**
 * Mock Data para o Módulo de Métricas e Analytics
 * UNIQ Empresas - Sprint 14
 */

import {
  DadoVenda,
  DadoCliente,
  MovimentacaoFinanceira,
  DadoAgendamento,
  DadoProduto,
  KPI,
  DadoGrafico,
  DadoDistribuicao,
  DadoHeatmap,
  Periodo,
  DashboardData,
  VendasData,
  FinanceiroData,
  ClientesData,
  AgendamentosData,
  ProdutosData,
  FormaPagamento,
  StatusVenda,
  StatusCliente,
  StatusAgendamento,
  StatusProduto,
} from '../../types/metricas';

import {
  subDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  subMonths,
  subYears,
  eachDayOfInterval,
  addMonths,
} from 'date-fns';

// ===========================================
// HELPERS
// ===========================================

/** Gera um ID único simples */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/** Gera um número aleatório entre min e max */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Escolhe um elemento aleatório de um array */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Gera data aleatória nos últimos N dias */
function randomDate(daysAgo: number): Date {
  const date = subDays(new Date(), randomBetween(0, daysAgo));
  date.setHours(randomBetween(8, 20), randomBetween(0, 59), 0, 0);
  return date;
}

// ===========================================
// DADOS BASE
// ===========================================

const NOMES_CLIENTES = [
  'Maria Santos', 'João Silva', 'Ana Oliveira', 'Pedro Souza',
  'Carla Rodrigues', 'Bruno Costa', 'Juliana Almeida', 'Lucas Pereira',
  'Camila Gomes', 'Felipe Lima', 'Beatriz Rocha', 'Gabriel Martins',
  'Larissa Ferreira', 'Diego Alves', 'Sofia Castro', 'Rafael Mendes',
  'Ana Clara Barbosa', 'Eduardo Souza', 'Isabella Rodrigues', 'Bruno Lima',
  'Maria Eduarda Costa', 'João Pedro Santos', 'Laura Oliveira', 'Guilherme Almeida',
  'Ana Luiza Pereira', 'GustavoLima', 'Marina Rodrigues', 'Leonardo Costa',
  'Vitória Silva', 'Mateus Santos', 'Alice Oliveira', 'João Vitor',
];

const NOMES_COLABORADORES = [
  'Ana Paula', 'Carlos Eduardo', 'Juliana Santos', 'Marcos Paulo',
  'Fernanda Silva', 'Roberto Carlos', 'Patrícia Souza',
];

const NOMES_PRODUTOS = [
  { nome: 'Corte de Cabelo', categoria: 'Cabelo' },
  { nome: 'Tintura', categoria: 'Cabelo' },
  { nome: 'Mechas', categoria: 'Cabelo' },
  { nome: 'Escova Progressiva', categoria: 'Cabelo' },
  { nome: 'Manicure', categoria: 'Unhas' },
  { nome: 'Pedicure', categoria: 'Unhas' },
  { nome: 'Esmaltação', categoria: 'Unhas' },
  { nome: 'Alongamento', categoria: 'Unhas' },
  { nome: 'Massagem Relaxante', categoria: 'Massagem' },
  { nome: 'Massagem Modeladora', categoria: 'Massagem' },
  { nome: 'Drenagem Linfática', categoria: 'Massagem' },
  { nome: 'Tratamento Facial', categoria: ' Facial' },
  { nome: 'Limpeza de Pele', categoria: 'Facial' },
  { nome: 'Hydra Facial', categoria: 'Facial' },
  { nome: ' Botox', categoria: 'Facial' },
];

const SERVICOS_DISPONIVEIS = [
  { id: 's1', nome: 'Corte Masculino', duracao: 30 },
  { id: 's2', nome: 'Corte Feminino', duracao: 60 },
  { id: 's3', nome: 'Tintura Completa', duracao: 90 },
  { id: 's4', nome: 'Escova Progressiva', duracao: 120 },
  { id: 's5', nome: 'Manicure', duracao: 30 },
  { id: 's6', nome: 'Pedicure', duracao: 40 },
  { id: 's7', nome: 'Spa dos Pés', duracao: 50 },
  { id: 's8', nome: 'Massagem Relaxante', duracao: 60 },
  { id: 's9', nome: 'Massagem Terapêutica', duracao: 60 },
  { id: 's10', nome: 'Tratamento Facial', duracao: 45 },
];

const CATEGORIAS_FINANCEIRAS = [
  'Salários', 'Aluguel', 'Luz', 'Água', 'Internet',
  'Fornecedores', 'Marketing', 'Manutenção', 'Impostos',
  'Material de Escritório', 'Software',
];

const BAIRROS = [
  'Centro', 'Jardim América', 'Vila Nova', 'Parque Industrial',
  'Jardim das Flores', 'Vila Rica', 'Bairro Alto',
];

// ===========================================
// GERADORES DE DADOS
// ===========================================

/** Gera dados de vendas aleatórios */
export function generateVendasData(quantidade: number = 100): DadoVenda[] {
  const vendas: DadoVenda[] = [];
  const formasPagamento: FormaPagamento[] = ['dinheiro', 'cartao', 'pix', 'boleto'];
  const statuses: StatusVenda[] = ['pago', 'pago', 'pago', 'pendente', 'cancelado'];

  for (let i = 0; i < quantidade; i++) {
    const valorTotal = randomBetween(50, 500);
    const quantidadeProdutos = randomBetween(1, 3);
    const produtos = [];

    for (let j = 0; j < quantidadeProdutos; j++) {
      const prod = randomPick(NOMES_PRODUTOS);
      const qtd = randomBetween(1, 2);
      const valorUnit = randomBetween(30, 200);
      produtos.push({
        id: generateId(),
        nome: prod.nome,
        quantidade: qtd,
        valorUnitario: valorUnit,
      });
    }

    vendas.push({
      id: generateId(),
      data: randomDate(30),
      cliente: {
        id: generateId(),
        nome: randomPick(NOMES_CLIENTES),
      },
      produtos,
      valorTotal,
      desconto: Math.random() > 0.7 ? randomBetween(5, 20) : 0,
      formaPagamento: randomPick(formasPagamento),
      status: randomPick(statuses),
      colaborador: {
        id: generateId(),
        nome: randomPick(NOMES_COLABORADORES),
      },
    });
  }

  return vendas.sort((a, b) => b.data.getTime() - a.data.getTime());
}

/** Gera dados de clientes aleatórios */
export function generateClientesData(quantidade: number = 50): DadoCliente[] {
  const clientes: DadoCliente[] = [];
  const statuses: StatusCliente[] = ['ativo', 'ativo', 'ativo', 'inativo', 'inativo-30-dias'];

  for (let i = 0; i < quantidade; i++) {
    const status = randomPick(statuses);
    const ultimaCompra = status === 'ativo' ? randomDate(30) : randomBetween(30, 180);

    clientes.push({
      id: generateId(),
      nome: randomPick(NOMES_CLIENTES),
      email: `cliente${i}@email.com`,
      telefone: `(11) 9${randomBetween(1000, 9999)}-${randomBetween(1000, 9999)}`,
      dataCadastro: subDays(new Date(), randomBetween(30, 365)),
      totalGasto: randomBetween(100, 5000),
      ultimaCompra: randomDate(180),
      frequencia: randomBetween(1, 12),
      status,
    });
  }

  return clientes.sort((a, b) => b.dataCadastro.getTime() - a.dataCadastro.getTime());
}

/** Gera movimentações financeiras aleatórias */
export function generateMovimentacoesData(quantidade: number = 200): MovimentacaoFinanceira[] {
  const movimentacoes: MovimentacaoFinanceira[] = [];
  const statuses: ('confirmado' | 'pendente')[] = ['confirmado', 'confirmado', 'confirmado', 'pendente'];

  for (let i = 0; i < quantidade; i++) {
    const tipo = Math.random() > 0.4 ? 'entrada' : 'saida';
    const categoria = randomPick(CATEGORIAS_FINANCEIRAS);

    let descricao: string;
    if (tipo === 'entrada') {
      descricao = 'Recebimento de venda';
    } else {
      descricao = categoria;
    }

    movimentacoes.push({
      id: generateId(),
      data: randomDate(60),
      descricao,
      categoria,
      tipo,
      valor: tipo === 'entrada' ? randomBetween(100, 2000) : randomBetween(50, 1500),
      status: randomPick(statuses),
    });
  }

  return movimentacoes.sort((a, b) => b.data.getTime() - a.data.getTime());
}

/** Gera dados de agendamentos aleatórios */
export function generateAgendamentosData(quantidade: number = 500): DadoAgendamento[] {
  const agendamentos: DadoAgendamento[] = [];
  const statuses: StatusAgendamento[] = ['realizado', 'realizado', 'realizado', 'cancelado', 'faltoso'];
  const horas = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
  ];

  for (let i = 0; i < quantidade; i++) {
    const data = randomDate(30);
    const servico = randomPick(SERVICOS_DISPONIVEIS);
    const status = randomPick(statuses);

    agendamentos.push({
      id: generateId(),
      data,
      hora: randomPick(horas),
      cliente: {
        id: generateId(),
        nome: randomPick(NOMES_CLIENTES),
      },
      servico,
      colaborador: {
        id: generateId(),
        nome: randomPick(NOMES_COLABORADORES),
      },
      valor: randomBetween(50, 300),
      status,
      duracaoReal: status === 'realizado' ? servico.duracao + randomBetween(-10, 10) : undefined,
    });
  }

  return agendamentos.sort((a, b) => b.data.getTime() - a.data.getTime());
}

/** Gera dados de produtos aleatórios */
export function generateProdutosData(quantidade: number = 30): DadoProduto[] {
  const produtos: DadoProduto[] = [];

  for (let i = 0; i < quantidade; i++) {
    const prod = randomPick(NOMES_PRODUTOS);
    const quantidadeVendida = randomBetween(5, 100);
    const estoqueAtual = randomBetween(0, 50);
    const valorUnitario = randomBetween(30, 200);

    let status: StatusProduto;
    if (estoqueAtual === 0) {
      status = 'esgotado';
    } else if (estoqueAtual < 10) {
      status = 'baixo-estoque';
    } else {
      status = 'disponivel';
    }

    produtos.push({
      id: generateId(),
      sku: `SKU-${1000 + i}`,
      nome: prod.nome,
      categoria: prod.categoria,
      quantidadeVendida,
      estoqueAtual,
      valorEstoque: estoqueAtual * valorUnitario,
      valorUnitario,
      margem: randomBetween(20, 60),
      diasEstoque: randomBetween(5, 60),
      status,
    });
  }

  return produtos.sort((a, b) => b.quantidadeVendida - a.quantidadeVendida);
}

// ===========================================
// DADOS MOCKADOS COMPLETOS
// ===========================================

/** KPIs mockados para o dashboard */
export const mockKPIs: KPI[] = [
  {
    id: 'kpi-1',
    tipo: 'faturamento',
    label: 'Faturamento',
    valor: 45750.0,
    formato: 'currency',
    tendencia: 12.5,
    periodoAnterior: 40666.67,
    meta: 50000,
    icon: 'DollarSign',
  },
  {
    id: 'kpi-2',
    tipo: 'vendas',
    label: 'Total de Vendas',
    valor: 156,
    formato: 'number',
    tendencia: 8.3,
    periodoAnterior: 144,
    icon: 'ShoppingCart',
  },
  {
    id: 'kpi-3',
    tipo: 'ticket-medio',
    label: 'Ticket Médio',
    valor: 293.27,
    formato: 'currency',
    tendencia: 3.8,
    periodoAnterior: 282.68,
    icon: 'Receipt',
  },
  {
    id: 'kpi-4',
    tipo: 'novos-clientes',
    label: 'Novos Clientes',
    valor: 28,
    formato: 'number',
    tendencia: 16.7,
    periodoAnterior: 24,
    icon: 'UserPlus',
  },
  {
    id: 'kpi-5',
    tipo: 'taxa-conversao',
    label: 'Taxa de Conversão',
    valor: 68.5,
    formato: 'percent',
    tendencia: 2.1,
    periodoAnterior: 67.1,
    icon: 'Percent',
  },
  {
    id: 'kpi-6',
    tipo: 'ocupacao',
    label: 'Taxa de Ocupação',
    valor: 82.3,
    formato: 'percent',
    tendencia: -1.2,
    periodoAnterior: 83.3,
    icon: 'Calendar',
  },
];

/** Gera dados de vendas para gráfico (30 dias) */
export function generateVendasGraficoData(): DadoGrafico[] {
  const data: DadoGrafico[] = [];
  const dias = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  });

  for (const dia of dias) {
    const valor = randomBetween(800, 2500);
    const quantidade = randomBetween(3, 15);
    data.push({
      data: format(dia, 'dd/MM'),
      valor,
      quantidade,
    });
  }

  return data;
}

/** Dados de vendas para gráfico */
export const mockVendasData: DadoGrafico[] = generateVendasGraficoData();

/** Dados mockados de vendas */
export const mockVendasDetalhadas: DadoVenda[] = generateVendasData(100);

/** Dados mockados de clientes */
export const mockClientesData: DadoCliente[] = generateClientesData(50);

/** Dados mockados financeiros */
export const mockFinanceiroData: MovimentacaoFinanceira[] = generateMovimentacoesData(200);

/** Gera dados para gráfico de fluxo de caixa */
export function generateFluxoCaixaData(): DadoGrafico[] {
  const data: DadoGrafico[] = [];
  const dias = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  });

  for (const dia of dias) {
    const receitas = randomBetween(500, 2000);
    const despesas = randomBetween(200, 800);
    data.push({
      data: format(dia, 'dd/MM'),
      valor: receitas - despesas,
    });
  }

  return data;
}

/** Dados de fluxo de caixa */
export const mockFluxoCaixaData: DadoGrafico[] = generateFluxoCaixaData();

/** Gera dados de produtos para gráfico */
export function generateProdutosGraficoData(): DadoGrafico[] {
  const produtos = generateProdutosData(10);
  return produtos.map((p) => ({
    data: p.nome,
    valor: p.quantidadeVendida,
  }));
}

/** Dados de produtos para gráfico */
export const mockProdutosGraficoData: DadoGrafico[] = generateProdutosGraficoData();

/** Gera dados de distribuição por categoria */
export function generateDistribuicaoPorCategoria(): DadoDistribuicao[] {
  return [
    { name: 'Cabelo', value: randomBetween(30, 50) },
    { name: 'Unhas', value: randomBetween(20, 35) },
    { name: 'Massagem', value: randomBetween(10, 25) },
    { name: 'Facial', value: randomBetween(10, 20) },
  ];
}

/** Dados de distribuição por categoria */
export const mockDistribuicaoCategoria: DadoDistribuicao[] = generateDistribuicaoPorCategoria();

/** Gera heatmap de agendamentos */
export function generateAgendamentosHeatmap(): DadoHeatmap[] {
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const horas = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ];
  const heatmap: DadoHeatmap[] = [];

  for (const dia of diasSemana) {
    for (const hora of horas) {
      let quantidade = randomBetween(0, 5);
      // Mais movimento em certos horários
      if (hora === '10:00' || hora === '14:00' || hora === '16:00') {
        quantidade = randomBetween(2, 5);
      }
      if (dia === 'Sáb') {
        quantidade = Math.min(quantidade + 2, 5);
      }
      heatmap.push({ diaSemana: dia, hora, quantidade });
    }
  }

  return heatmap;
}

/** Dados de heatmap */
export const mockAgendamentosHeatmap: DadoHeatmap[] = generateAgendamentosHeatmap();

/** Gera dados mockados por período */
export function generateKPIsByPeriodo(periodo: Periodo): KPI[] {
  let multiplicador = 1;
  let base = 1;

  switch (periodo) {
    case 'hoje':
      base = 1;
      multiplicador = 0.15;
      break;
    case 'ontem':
      base = 1;
      multiplicador = 0.15;
      break;
    case 'ultimos-7-dias':
      base = 7;
      multiplicador = 1;
      break;
    case 'ultimos-30-dias':
      base = 30;
      multiplicador = 4;
      break;
    case 'este-mes':
      base = 30;
      multiplicador = 4;
      break;
    case 'mes-passado':
      base = 30;
      multiplicador = 3.5;
      break;
    case 'este-ano':
      base = 365;
      multiplicador = 45;
      break;
    case 'ano-passado':
      base = 365;
      multiplicador = 40;
      break;
    default:
      base = 30;
      multiplicador = 4;
  }

  return [
    {
      id: 'kpi-1',
      tipo: 'faturamento',
      label: 'Faturamento',
      valor: 1500 * base + randomBetween(-100, 100) * multiplicador,
      formato: 'currency',
      tendencia: randomBetween(-5, 15),
      periodoAnterior: 1400 * base,
    },
    {
      id: 'kpi-2',
      tipo: 'vendas',
      label: 'Total de Vendas',
      valor: 5 * base + randomBetween(-2, 5),
      formato: 'number',
      tendencia: randomBetween(-5, 15),
      periodoAnterior: 4 * base,
    },
    {
      id: 'kpi-3',
      tipo: 'ticket-medio',
      label: 'Ticket Médio',
      valor: 250 + randomBetween(-30, 50),
      formato: 'currency',
      tendencia: randomBetween(-3, 10),
      periodoAnterior: 240,
    },
    {
      id: 'kpi-4',
      tipo: 'novos-clientes',
      label: 'Novos Clientes',
      valor: Math.floor(1 * multiplicador) + randomBetween(0, 3),
      formato: 'number',
      tendencia: randomBetween(-5, 20),
      periodoAnterior: Math.floor(0.8 * multiplicador),
    },
    {
      id: 'kpi-5',
      tipo: 'taxa-conversao',
      label: 'Taxa de Conversão',
      valor: 65 + randomBetween(-5, 10),
      formato: 'percent',
      tendencia: randomBetween(-2, 5),
      periodoAnterior: 63,
    },
    {
      id: 'kpi-6',
      tipo: 'ocupacao',
      label: 'Taxa de Ocupação',
      valor: 78 + randomBetween(-8, 8),
      formato: 'percent',
      tendencia: randomBetween(-3, 3),
      periodoAnterior: 80,
    },
  ];
}

// ===========================================
// DADOS COMPLETOS POR PÁGINA
// ===========================================

/** Dados mockados do Dashboard */
export const mockDashboardData: DashboardData = {
  kpis: mockKPIs,
  vendasGrafico: mockVendasData,
  ProdutosGrafico: mockDistribuicaoCategoria,
  ultimasVendas: mockVendasDetalhadas.slice(0, 10),
};

/** Dados mockados de Vendas */
export const mockVendasPageData: VendasData = {
  resumo: {
    total: 45750,
    quantidade: 156,
    ticketMedio: 293.27,
    porCategoria: [
      { categoria: 'Cabelo', valor: 22500, quantidade: 75 },
      { categoria: 'Unhas', valor: 12300, quantidade: 50 },
      { categoria: 'Massagem', valor: 6750, quantidade: 20 },
      { categoria: 'Facial', valor: 4200, quantidade: 11 },
    ],
    porCanal: [
      { canal: 'Presencial', valor: 35000 },
      { canal: 'Online', valor: 10750 },
    ],
    tendencia: 12.5,
  },
  graficoTemporal: mockVendasData,
  porCategoria: mockVendasData.map((d, i) => ({ data: d.data, valor: d.valor * 0.5 })),
  porCanal: mockDistribuicaoCategoria,
  detalhadas: mockVendasDetalhadas,
};

/** Dados mockados Financeiros */
export const mockFinanceiroPageData: FinanceiroData = {
  resumo: {
    receitas: 68500,
    despesas: 22750,
    lucro: 45750,
    saldo: 89200,
    porCategoria: [
      { categoria: 'Serviços', valor: 52000, tipo: 'entrada' },
      { categoria: 'Produtos', valor: 16500, tipo: 'entrada' },
      { categoria: 'Salários', valor: 12000, tipo: 'saida' },
      { categoria: 'Aluguel', valor: 5500, tipo: 'saida' },
      { categoria: 'Fornecedores', valor: 3250, tipo: 'saida' },
      { categoria: 'Outros', valor: 2000, tipo: 'saida' },
    ],
  },
  fluxoCaixa: mockFluxoCaixaData,
  despesasPorCategoria: [
    { name: 'Salários', value: 12000 },
    { name: 'Aluguel', value: 5500 },
    { name: 'Fornecedores', value: 3250 },
    { name: 'Outros', value: 2000 },
  ],
  evolucaoSaldo: mockFluxoCaixaData.map((d, i) => ({
    data: d.data,
    valor: 80000 + d.valor * 10 + i * 500,
  })),
};

/** Dados mockados de Clientes */
export const mockClientesPageData: ClientesData = {
  resumo: {
    totalClientes: 1250,
    novosClientes: 145,
    clientesAtivos: 680,
    churnRate: 8.5,
    ticketMedio: 280,
    porFaixaEtaria: [
      { faixa: '18-25', quantidade: 180 },
      { faixa: '26-35', quantidade: 420 },
      { faixa: '36-45', quantidade: 350 },
      { faixa: '46-55', quantidade: 200 },
      { faixa: '56+', quantidade: 100 },
    ],
    porGenero: [
      { genero: 'Feminino', quantidade: 780 },
      { genero: 'Masculino', quantidade: 420 },
      { genero: 'Outro', quantidade: 50 },
    ],
    porBairro: [
      { bairro: 'Centro', quantidade: 350 },
      { bairro: 'Jardim América', quantidade: 280 },
      { bairro: 'Vila Nova', quantidade: 220 },
      { bairro: 'Outros', quantidade: 400 },
    ],
    porCanal: [
      { canal: 'Indicação', quantidade: 420 },
      { canal: 'Redes Sociais', quantidade: 380 },
      { canal: 'Google', quantidade: 280 },
      { canal: 'Outros', quantidade: 170 },
    ],
  },
  evolucaoBase: mockVendasData.map((d) => ({
    data: d.data,
    valor: 600 + Math.floor(d.valor / 30),
  })),
  porFaixaEtaria: [
    { data: '18-25', valor: 180 },
    { data: '26-35', valor: 420 },
    { data: '36-45', valor: 350 },
    { data: '46-55', valor: 200 },
    { data: '56+', valor: 100 },
  ],
  porGenero: [
    { name: 'Feminino', value: 780 },
    { name: 'Masculino', value: 420 },
    { name: 'Outro', value: 50 },
  ],
  porBairro: [
    { name: 'Centro', value: 350 },
    { name: 'Jardim América', value: 280 },
    { name: 'Vila Nova', value: 220 },
    { name: 'Outros', value: 400 },
  ],
};

/** Dados mockados de Agendamentos */
export const mockAgendamentosPageData: AgendamentosData = {
  resumo: {
    total: 520,
    realizados: 428,
    comparecimento: 82.3,
    cancelamentos: 52,
    faltosos: 40,
    receita: 45600,
    ocupacao: 78.5,
    porDiaSemana: [
      { dia: 'Seg', quantidade: 65 },
      { dia: 'Ter', quantidade: 72 },
      { dia: 'Qua', quantidade: 78 },
      { dia: 'Qui', quantidade: 82 },
      { dia: 'Sex', quantidade: 90 },
      { dia: 'Sáb', quantidade: 95 },
      { dia: 'Dom', quantidade: 48 },
    ],
    porHora: Array.from({ length: 10 }, (_, i) => ({
      hora: `${9 + i}:00`,
      quantidade: randomBetween(20, 60),
    })),
    porColaborador: [
      { colaborador: 'Ana Paula', quantidade: 145, receita: 12800 },
      { colaborador: 'Carlos Eduardo', quantidade: 132, receita: 11500 },
      { colaborador: 'Juliana Santos', quantidade: 98, receita: 8900 },
      { colaborador: 'Marcos Paulo', quantidade: 53, receita: 4400 },
    ],
  },
  porDiaSemana: mockVendasData.slice(0, 7).map((d, i) => ({
    data: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i],
    valor: randomBetween(50, 100),
  })),
  heatmap: mockAgendamentosHeatmap,
  comparecimentoFaltas: [
    { name: 'Realizados', value: 428 },
    { name: 'Faltosos', value: 40 },
    { name: 'Cancelados', value: 52 },
  ],
  porColaborador: mockVendasData.slice(0, 4).map((d) => ({
    data: d.data,
    valor: randomBetween(30, 50),
  })),
};

/** Dados mockados de Produtos */
export const mockProdutosPageData: ProdutosData = {
  resumo: {
    maisVendidos: [
      { id: 'p1', nome: 'Corte de Cabelo', quantidade: 145, valor: 11500 },
      { id: 'p2', nome: 'Manicure', quantidade: 132, valor: 5280 },
      { id: 'p3', nome: 'Tintura', quantidade: 98, valor: 9800 },
      { id: 'p4', nome: 'Massagem', quantidade: 85, valor: 10200 },
      { id: 'p5', nome: 'Pedicure', quantidade: 72, valor: 4320 },
    ],
    maiorMargem: [
      { id: 'p3', nome: 'Tintura', margem: 58 },
      { id: 'p4', nome: 'Massagem', margem: 52 },
      { id: 'p1', nome: 'Corte de Cabelo', margem: 45 },
    ],
    giro: 4.2,
    parados: 8,
    emFalta: 3,
    valorTotalEstoque: 25000,
    porCategoria: [
      { categoria: 'Cabelo', quantidade: 420, valor: 18500 },
      { categoria: 'Unhas', quantidade: 280, valor: 4200 },
      { categoria: 'Massagem', quantidade: 150, valor: 1500 },
      { categoria: 'Facial', quantidade: 80, valor: 800 },
    ],
  },
  top10: mockProdutosGraficoData,
  curvaABC: [
    { name: 'A - Alto', value: 65 },
    { name: 'B - Médio', value: 25 },
    { name: 'C - Baixo', value: 10 },
  ],
  inventario: mockProdutosGraficoData.slice(0, 5).map((p) => ({
    data: p.data,
    valor: randomBetween(10, 50),
  })),
  porCategoria: [
    { name: 'Cabelo', value: 420 },
    { name: 'Unhas', value: 280 },
    { name: 'Massagem', value: 150 },
    { name: 'Facial', value: 80 },
  ],
};

/** Obtém dados por tipo de página */
export function getDataByTipoPagina(
  tipo: 'dashboard' | 'vendas' | 'financeiro' | 'clientes' | 'agendamentos' | 'produtos',
  _periodo?: Periodo
):
  | DashboardData
  | VendasData
  | FinanceiroData
  | ClientesData
  | AgendamentosData
  | ProdutosData {
  switch (tipo) {
    case 'dashboard':
      return mockDashboardData;
    case 'vendas':
      return mockVendasPageData;
    case 'financeiro':
      return mockFinanceiroPageData;
    case 'clientes':
      return mockClientesPageData;
    case 'agendamentos':
      return mockAgendamentosPageData;
    case 'produtos':
      return mockProdutosPageData;
    default:
      return mockDashboardData;
  }
}