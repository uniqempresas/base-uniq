/**
 * Mock Data para o módulo de Serviços
 */

import { Servico, ServicoStatus, CategoriaServico, Duracao } from '../../types/servicos';

// Lista de durações disponíveis
export const mockDuracoes: { value: Duracao; label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '120 min' },
];

// Categorias com metadados
export const mockCategorias: { value: CategoriaServico; label: string; count: number }[] = [
  { value: 'cabelo', label: 'Cabelo', count: 5 },
  { value: 'unhas', label: 'Unhas', count: 3 },
  { value: 'estetica', label: 'Estética', count: 1 },
  { value: 'massagem', label: 'Massagem', count: 1 },
  { value: 'barba', label: 'Barba', count: 0 },
];

// Mock de serviços (10 exemplos)
export const mockServicos: Servico[] = [
  {
    id: 'srv-1',
    nome: 'Corte Feminino',
    descricao: 'Corte feminino com finalização e secagem. Incluye lavagem.',
    preco: 12000, // R$ 120,00
    duracao: 60,
    categoria: 'cabelo',
    profissionaisIds: ['emp-1', 'emp-2', 'emp-3'],
    status: 'ativo',
    destaque: false,
    criadoEm: '2024-01-15T10:00:00Z',
    atualizadoEm: '2024-01-15T10:00:00Z',
  },
  {
    id: 'srv-2',
    nome: 'Corte Masculino',
    descricao: 'Corte masculino tradicional com máquina e tesoura.',
    preco: 6500, // R$ 65,00
    duracao: 30,
    categoria: 'cabelo',
    profissionaisIds: ['emp-1', 'emp-3'],
    status: 'ativo',
    destaque: false,
    criadoEm: '2024-01-15T10:00:00Z',
    atualizadoEm: '2024-01-15T10:00:00Z',
  },
  {
    id: 'srv-3',
    nome: 'Coloração Completa',
    descricao: 'Coloração de raiz ou completa com tintura de alta qualidade.',
    preco: 28000, // R$ 280,00
    duracao: 120,
    categoria: 'cabelo',
    profissionaisIds: ['emp-1', 'emp-2'],
    status: 'ativo',
    destaque: false,
    criadoEm: '2024-01-15T10:00:00Z',
    atualizadoEm: '2024-06-20T14:30:00Z',
  },
  {
    id: 'srv-4',
    nome: 'Mechas',
    descricao: 'Mechas californianas ou ombré com técnicas modernas.',
    preco: 35000, // R$ 350,00
    duracao: 120,
    categoria: 'cabelo',
    profissionaisIds: ['emp-2'],
    status: 'destaque',
    destaque: true,
    criadoEm: '2024-02-01T10:00:00Z',
    atualizadoEm: '2024-08-15T09:00:00Z',
  },
  {
    id: 'srv-5',
    nome: 'Progressiva',
    descricao: 'Escova progressiva com formol liberado. Durabilidade de 3-4 meses.',
    preco: 32000, // R$ 320,00
    duracao: 120,
    categoria: 'cabelo',
    profissionaisIds: ['emp-1', 'emp-2'],
    status: 'ativo',
    destaque: false,
    criadoEm: '2024-02-10T10:00:00Z',
    atualizadoEm: '2024-07-05T11:20:00Z',
  },
  {
    id: 'srv-6',
    nome: 'Manicure',
    descricao: 'Corte, lixamento, cutícula e esmalte tradicional.',
    preco: 6000, // R$ 60,00
    duracao: 45,
    categoria: 'unhas',
    profissionaisIds: ['emp-4'],
    status: 'ativo',
    destaque: false,
    criadoEm: '2024-03-01T10:00:00Z',
    atualizadoEm: '2024-03-01T10:00:00Z',
  },
  {
    id: 'srv-7',
    nome: 'Pedicure',
    descricao: 'Tratamento completo dos pés com Spa.',
    preco: 7000, // R$ 70,00
    duracao: 45,
    categoria: 'unhas',
    profissionaisIds: ['emp-4'],
    status: 'ativo',
    destaque: false,
    criadoEm: '2024-03-01T10:00:00Z',
    atualizadoEm: '2024-03-01T10:00:00Z',
  },
  {
    id: 'srv-8',
    nome: 'Unhas Gel',
    descricao: 'Unhas em gel com manutenção inclusa.',
    preco: 18000, // R$ 180,00
    duracao: 90,
    categoria: 'unhas',
    profissionaisIds: ['emp-4', 'emp-5'],
    status: 'ativo',
    destaque: false,
    criadoEm: '2024-04-01T10:00:00Z',
    atualizadoEm: '2024-09-10T15:00:00Z',
  },
  {
    id: 'srv-9',
    nome: 'Limpeza de Pele',
    descricao: 'Limpeza de pele profunda com extrator.',
    preco: 18000, // R$ 180,00
    duracao: 60,
    categoria: 'estetica',
    profissionaisIds: ['emp-4'],
    status: 'ativo',
    destaque: false,
    criadoEm: '2024-05-01T10:00:00Z',
    atualizadoEm: '2024-05-01T10:00:00Z',
  },
  {
    id: 'srv-10',
    nome: 'Massagem Relaxante',
    descricao: 'Massagem corporal relaxante com óleos essenciais.',
    preco: 15000, // R$ 150,00
    duracao: 60,
    categoria: 'massagem',
    profissionaisIds: ['emp-4'],
    status: 'inativo',
    destaque: false,
    criadoEm: '2024-06-01T10:00:00Z',
    atualizadoEm: '2024-10-01T08:00:00Z',
  },
];

// Helper para buscar serviço por ID
export const getServicoById = (id: string): Servico | undefined => {
  return mockServicos.find((s) => s.id === id);
};

// Helper para filtrar por categoria
export const filterServicosByCategoria = (categoria: CategoriaServico | null): Servico[] => {
  if (!categoria) return mockServicos;
  return mockServicos.filter((s) => s.categoria === categoria);
};

// Helper para filtrar apenas ativos
export const getServicosAtivos = (): Servico[] => {
  return mockServicos.filter((s) => s.status === 'ativo' || s.status === 'destaque');
};

// Helper para obter categorias com contagem real
export const getCategoriasComCount = (): { value: CategoriaServico; label: string; count: number }[] => {
  const counts = mockServicos.reduce((acc, srv) => {
    acc[srv.categoria] = (acc[srv.categoria] || 0) + 1;
    return acc;
  }, {} as Record<CategoriaServico, number>);

  return mockCategorias.map((cat) => ({
    ...cat,
    count: counts[cat.value] || 0,
  }));
};