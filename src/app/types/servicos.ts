/**
 * Tipos para o módulo de Serviços
 */

// Status do serviço
export type ServicoStatus = 'ativo' | 'inativo' | 'destaque';

// Categorias de serviço
export type CategoriaServico = 'cabelo' | 'unhas' | 'estetica' | 'massagem' | 'barba';

// Duração do serviço em minutos (múltiplos de 15)
export type Duracao = 15 | 30 | 45 | 60 | 90 | 120;

// Interface principal de Serviço
export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number; // em centavos
  duracao: Duracao;
  categoria: CategoriaServico;
  profissionaisIds: string[]; // IDs dos colaboradores
  status: ServicoStatus;
  imagemUrl?: string;
  destaque?: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

// Dados para formulário de serviço
export interface ServicoFormData {
  nome: string;
  descricao: string;
  preco: number;
  duracao: Duracao;
  categoria: CategoriaServico;
  profissionaisIds: string[];
  status: ServicoStatus;
  destaque?: boolean;
}