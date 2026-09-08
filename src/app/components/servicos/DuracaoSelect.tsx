/**
 * Componente DuracaoSelect - Selector de duração
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { Duracao } from '../../types/servicos';
import { Clock } from 'lucide-react';

interface DuracaoSelectProps {
  value?: Duracao;
  onChange?: (value: Duracao) => void;
  label?: string;
  disabled?: boolean;
}

// Opções de duração com label formatado
const duracoes: { value: Duracao; label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1h' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2h' },
];

export function DuracaoSelect({ 
  value, 
  onChange, 
  label = 'Duração',
  disabled = false,
}: DuracaoSelectProps) {
  const handleValueChange = (newValue: string) => {
    if (onChange) {
      onChange(Number(newValue) as Duracao);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-[#1f2937] flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {label}
        </label>
      )}
      <Select 
        value={value ? String(value) : undefined} 
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione a duração" />
        </SelectTrigger>
        <SelectContent>
          {duracoes.map((duracao) => (
            <SelectItem key={duracao.value} value={String(duracao.value)}>
              {duracao.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}