/**
 * Componente ServicosFilters - Barra de filtros
 */

import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { CategoriaServico, ServicoStatus } from '../../types/servicos';

export interface ServicosFiltersData {
  busca?: string;
  categoria?: CategoriaServico | 'todas';
  status?: ServicoStatus | 'todos';
  duracao?: number | 'todas';
}

interface ServicosFiltersProps {
  onFilterChange: (filters: ServicosFiltersData) => void;
}

// Opções de categorias
const categorias: { value: CategoriaServico | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas as categorias' },
  { value: 'cabelo', label: 'Cabelo' },
  { value: 'unhas', label: 'Unhas' },
  { value: 'estetica', label: 'Estética' },
  { value: 'massagem', label: 'Massagem' },
  { value: 'barba', label: 'Barba' },
];

// Opções de status
const statuses: { value: ServicoStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'destaque', label: 'Destaque' },
];

// Opções de duração
const duracoes: { value: number | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas as durações' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2 horas' },
];

export function ServicosFilters({ onFilterChange }: ServicosFiltersProps) {
  const handleBuscaChange = (value: string) => {
    onFilterChange({ busca: value });
  };

  const handleCategoriaChange = (value: string) => {
    onFilterChange({ categoria: value as CategoriaServico | 'todas' });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value as ServicoStatus | 'todos' });
  };

  const handleDuracaoChange = (value: string) => {
    onFilterChange({ duracao: value === 'todas' ? 'todas' : Number(value) });
  };

  const handleLimpar = () => {
    onFilterChange({
      busca: '',
      categoria: 'todas',
      status: 'todos',
      duracao: 'todas',
    });
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Linha 1: Busca + Categoria */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Input de busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            className="pl-10"
            onChange={(e) => handleBuscaChange(e.target.value)}
          />
        </div>

        {/* Select de categoria */}
        <Select onValueChange={handleCategoriaChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Linha 2: Status + Duração + Limpar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Select de status */}
        <Select onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Select de duração */}
        <Select onValueChange={handleDuracaoChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Duração" />
          </SelectTrigger>
          <SelectContent>
            {duracoes.map((duracao) => (
              <SelectItem key={duracao.value} value={String(duracao.value)}>
                {duracao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Botão limpar */}
        <Button variant="outline" onClick={handleLimpar} className="w-full md:w-auto">
          <X className="mr-2 h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}