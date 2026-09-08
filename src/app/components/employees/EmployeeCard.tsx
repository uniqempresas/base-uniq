import { Employee } from '../../types/employees';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { MoreHorizontal, Shield, Edit, Trash2, Eye, Calendar } from 'lucide-react';
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

interface EmployeeCardProps {
  employee: Employee;
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
  active: 'bg-[#efefef] text-[#1f2937] border-[#86cb92]',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
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
  servicos: 'Serviços',
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

export function EmployeeCard({
  employee,
  onEdit,
  onPermissions,
  onToggle,
  onDelete,
}: EmployeeCardProps) {
  const lastAccessText = employee.lastAccess
    ? formatDistanceToNow(employee.lastAccess, { addSuffix: true, locale: ptBR })
    : 'Nunca acessou';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm line-clamp-1">{employee.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">{employee.email}</p>
            </div>
          </div>
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
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Role Badge */}
        <Badge
          variant="outline"
          className={cn('text-xs', roleColors[employee.role])}
        >
          {roleLabels[employee.role]}
        </Badge>

        {/* Module Badges */}
        <div className="flex flex-wrap gap-1">
          {employee.modules.slice(0, 4).map((mod) => (
            <Badge
              key={mod.module}
              variant="secondary"
              className="text-xs py-0 px-2"
            >
              {moduleLabels[mod.module] || mod.module}
            </Badge>
          ))}
          {employee.modules.length > 4 && (
            <Badge variant="secondary" className="text-xs py-0 px-2">
              +{employee.modules.length - 4}
            </Badge>
          )}
        </div>

        {/* Last Access */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{lastAccessText}</span>
        </div>

        {/* Status Badge */}
        <div className="pt-2 border-t">
          <Badge
            variant="outline"
            className={cn('text-xs w-full justify-center', statusColors[employee.status])}
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
            {statusLabels[employee.status]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
