/**
 * Componente ProfissionaisSelect - Multi-select de colaboradores
 */

import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { mockEmployees } from '../../lib/mocks/employees';
import { User } from 'lucide-react';
import type { Employee } from '../../types/employees';

interface ProfissionaisSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
  disabled?: boolean;
}

// Filtrar apenas colaboradores ativos
const colaboradoresAtivos = mockEmployees.filter(
  (emp) => emp.status === 'active'
);

export function ProfissionaisSelect({ 
  value = [], 
  onChange, 
  label = 'Profissionais',
  disabled = false,
}: ProfissionaisSelectProps) {
  const handleCheckboxChange = (employeeId: string, checked: boolean) => {
    if (!onChange) return;
    
    if (checked) {
      onChange([...value, employeeId]);
    } else {
      onChange(value.filter((id) => id !== employeeId));
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-[#1f2937] flex items-center gap-2">
          <User className="h-4 w-4" />
          {label}
        </label>
      )}
      
      <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
        {colaboradoresAtivos.map((employee) => (
          <div
            key={employee.id}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-[#efefef] transition-colors"
          >
            <Checkbox
              id={employee.id}
              checked={value.includes(employee.id)}
              onCheckedChange={(checked) => 
                handleCheckboxChange(employee.id, checked as boolean)
              }
              disabled={disabled}
            />
            <Label
              htmlFor={employee.id}
              className="flex items-center gap-2 cursor-pointer flex-1"
            >
              <span className="font-medium">{employee.name}</span>
              <span className="text-muted-foreground text-sm">
                ({employee.position})
              </span>
            </Label>
          </div>
        ))}
        
        {colaboradoresAtivos.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">
            Nenhum colaborador disponível
          </p>
        )}
      </div>
      
      {value.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {value.length} profissional(is) selecionado(is)
        </p>
      )}
    </div>
  );
}