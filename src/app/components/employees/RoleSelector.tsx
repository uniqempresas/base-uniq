import { EmployeeRole } from '../../types/employees';
import { Shield, Crown, UserCog, ShoppingCart, Eye } from 'lucide-react';
import { cn } from '../ui/utils';

interface RoleSelectorProps {
  value: EmployeeRole;
  onChange: (role: EmployeeRole) => void;
}

const roles: Array<{
  name: EmployeeRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    name: 'owner',
    label: 'Proprietário',
    description: 'Acesso completo ao sistema, incluindo configurações.',
    icon: Crown,
    color: 'text-purple-500',
  },
  {
    name: 'admin',
    label: 'Administrador',
    description: 'Gerencia usuários, permissões e configurações.',
    icon: Shield,
    color: 'text-blue-500',
  },
  {
    name: 'manager',
    label: 'Gerente',
    description: 'Supervisiona equipes e processos.',
    icon: UserCog,
    color: 'text-[#627271]',
  },
  {
    name: 'seller',
    label: 'Vendedor',
    description: 'Acesso às vendas e gestão de clientes.',
    icon: ShoppingCart,
    color: 'text-amber-500',
  },
  {
    name: 'viewer',
    label: 'Visualizador',
    description: 'Acesso apenas para visualização de dados.',
    icon: Eye,
    color: 'text-gray-500',
  },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = value === role.name;
        
        return (
          <button
            key={role.name}
            type="button"
            onClick={() => onChange(role.name)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-left",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-transparent hover:bg-muted hover:border-muted-foreground/20"
            )}
          >
            <div className={cn(
              "p-2 rounded-full bg-muted",
              isSelected && "bg-primary/10"
            )}>
              <Icon className={cn("h-5 w-5", role.color)} />
            </div>
            <div className="text-center">
              <span className={cn(
                "block font-medium text-sm",
                isSelected && "text-primary"
              )}>
                {role.label}
              </span>
              <span className="block text-xs text-muted-foreground mt-1">
                {role.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}