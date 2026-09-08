import { Employee } from '../../types/employees';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { MoreHorizontal, Shield, Edit, Trash2, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../ui/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onPermissions?: (employee: Employee) => void;
  onToggle?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  manager: 'bg-[#efefef] text-[#1f2937] border-[#86cb92]',
  seller: 'bg-amber-100 text-amber-700 border-amber-200',
  viewer: 'bg-gray-100 text-gray-700 border-gray-200',
};

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  manager: 'Gerente',
  seller: 'Vendedor',
  viewer: 'Visualizador',
};

const statusColors: Record<string, string> = {
  active: 'bg-[#efefef] text-[#1f2937]',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-700',
};

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
};

const moduleLabels: Record<string, string> = {
  crm: 'CRM',
  inventory: 'Estoque',
  sales: 'Vendas',
  store: 'Loja',
  appointments: 'Agenda',
  finance: 'Financeiro',
  settings: 'Config',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function EmployeeTable({
  employees,
  onEdit,
  onPermissions,
  onToggle,
  onDelete,
}: EmployeeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Colaborador</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Módulos</TableHead>
          <TableHead>Último Acesso</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            {/* Colaborador */}
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                  <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-xs text-muted-foreground">{employee.email}</div>
                </div>
              </div>
            </TableCell>

            {/* Cargo */}
            <TableCell>{employee.position || '-'}</TableCell>

            {/* Papel */}
            <TableCell>
              <Badge variant="outline" className={cn('text-xs', roleColors[employee.role])}>
                {roleLabels[employee.role]}
              </Badge>
            </TableCell>

            {/* Módulos */}
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {employee.modules.slice(0, 3).map((mod) => (
                  <Badge key={mod.module} variant="secondary" className="text-xs py-0">
                    {moduleLabels[mod.module] || mod.module}
                  </Badge>
                ))}
                {employee.modules.length > 3 && (
                  <Badge variant="secondary" className="text-xs py-0">
                    +{employee.modules.length - 3}
                  </Badge>
                )}
              </div>
            </TableCell>

            {/* Último Acesso */}
            <TableCell>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {employee.lastAccess
                  ? formatDistanceToNow(employee.lastAccess, { addSuffix: true, locale: ptBR })
                  : 'Nunca'}
              </div>
            </TableCell>

            {/* Status */}
            <TableCell>
              <Badge className={cn('text-xs', statusColors[employee.status])}>
                {statusLabels[employee.status]}
              </Badge>
            </TableCell>

            {/* Ações */}
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPermissions?.(employee)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Permissões
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(employee)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onToggle?.(employee)}
                    className={employee.status === 'active' ? 'text-amber-600' : 'text-[#627271]'}
                  >
                    {employee.status === 'active' ? 'Desativar' : 'Ativar'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete?.(employee)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}