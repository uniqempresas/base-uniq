import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { EmployeeStatus, EmployeeRole } from '../../types/employees';

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
}

export function EmployeeFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  role,
  onRoleChange,
  viewMode,
  onViewModeChange,
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
          <SelectItem value="pending">Pendentes</SelectItem>
        </SelectContent>
      </Select>

      {/* Role Filter */}
      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Papel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="owner">Proprietário</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="manager">Gerente</SelectItem>
          <SelectItem value="seller">Vendedor</SelectItem>
          <SelectItem value="viewer">Visualizador</SelectItem>
        </SelectContent>
      </Select>

      {/* View Mode Toggle */}
      <div className="flex border rounded-md">
        <Button
          variant={viewMode === 'cards' ? 'default' : 'ghost'}
          size="icon"
          className="rounded-r-none"
          onClick={() => onViewModeChange('cards')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="icon"
          className="rounded-l-none"
          onClick={() => onViewModeChange('table')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}