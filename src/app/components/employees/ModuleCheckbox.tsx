import { Checkbox } from '../ui/checkbox';
import { ModuleType } from '../../types/employees';
import { Users, Package, ShoppingCart, Store, Calendar, Wallet, Settings } from 'lucide-react';
import { cn } from '../ui/utils';

interface ModuleCheckboxProps {
  module: ModuleType;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const moduleConfig: Record<ModuleType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  crm: { label: 'CRM', icon: Users },
  inventory: { label: 'Estoque', icon: Package },
  sales: { label: 'Vendas', icon: ShoppingCart },
  store: { label: 'Loja', icon: Store },
  appointments: { label: 'Agenda', icon: Calendar },
  finance: { label: 'Financeiro', icon: Wallet },
  settings: { label: 'Configurações', icon: Settings },
};

export function ModuleCheckbox({ module, checked, onChange, disabled }: ModuleCheckboxProps) {
  const config = moduleConfig[module];
  const Icon = config?.icon || Settings;
  
  return (
    <div className={cn(
      "flex items-center gap-3 p-2 rounded-md border transition-colors cursor-pointer",
      checked ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        id={`module-${module}`}
      />
      <label
        htmlFor={`module-${module}`}
        className={cn(
          "flex items-center gap-2 text-sm cursor-pointer flex-1",
          disabled && "cursor-not-allowed"
        )}
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{config?.label || module}</span>
      </label>
    </div>
  );
}