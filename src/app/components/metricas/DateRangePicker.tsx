/**
 * DateRangePicker - Seletor de Período
 * Módulo de Métricas - UNIQ Empresas
 */

import React from 'react';
import { Periodo, TipoComparacao } from '../../types/metricas';
import { Button } from '../ui/button';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  value: Periodo;
  onChange: (value: Periodo) => void;
  compareEnabled?: boolean;
  compareValue?: TipoComparacao;
  onCompareChange?: (value: TipoComparacao) => void;
}

/** Mapeamento de preset para label */
const presetLabels: Record<Periodo, string> = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  'ultimos-7-dias': '7 dias',
  'ultimos-30-dias': '30 dias',
  'este-mes': 'Este mês',
  'mes-passado': 'Mês passado',
  'este-ano': 'Este ano',
  'ano-passado': 'Ano passado',
  personalizado: 'Personalizado',
};

/**Lista de presets disponíveis */
const periodPresets: Periodo[] = [
  'hoje',
  'ontem',
  'ultimos-7-dias',
  'ultimos-30-dias',
  'este-mes',
  'mes-passado',
  'personalizado',
];

/**
 * Componente de Seletor de Período
 * Botões para selecionar período e toggle de comparação
 */
export function DateRangePicker({
  value,
  onChange,
  compareEnabled = false,
  compareValue = 'nenhuma',
  onCompareChange,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Botões de Período */}
      <div className="flex flex-wrap gap-2">
        {periodPresets.map((preset) => (
          <Button
            key={preset}
            variant={value === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(preset)}
            className="text-xs sm:text-sm"
          >
            {presetLabels[preset]}
          </Button>
        ))}
      </div>

      {/* Toggle de Comparação */}
      {compareEnabled && onCompareChange && (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={compareValue !== 'nenhuma'}
              onChange={(e) =>
                onCompareChange(e.target.checked ? 'periodo-anterior' : 'nenhuma')
              }
              className="rounded border-border"
            />
            <Calendar className="h-4 w-4" />
            Comparar com período anterior
          </label>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;