/**
 * Hook Customizado para Gerenciamento de Período de Datas
 * UNIQ Empresas - Sprint 14
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Periodo,
  TipoComparacao,
  IntervaloData,
} from '../types/metricas';
import {
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  subMonths,
  subYears,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

/** Período padrão */
const DEFAULT_PRESET: Periodo = 'este-mes';

/**
 * Mapeia preset para intervalo de datas
 */
function getDateRangeByPreset(preset: Periodo): IntervaloData {
  const now = new Date();
  
  switch (preset) {
    case 'hoje':
      return {
        inicio: now,
        fim: now,
      };
      
    case 'ontem':
      const yesterday = subDays(now, 1);
      return {
        inicio: yesterday,
        fim: yesterday,
      };
      
    case 'ultimos-7-dias':
      return {
        inicio: subDays(now, 6),
        fim: now,
      };
      
    case 'ultimos-30-dias':
      return {
        inicio: subDays(now, 29),
        fim: now,
      };
      
    case 'este-mes':
      return {
        inicio: startOfMonth(now),
        fim: endOfMonth(now),
      };
      
    case 'mes-passado':
      const lastMonth = subMonths(now, 1);
      return {
        inicio: startOfMonth(lastMonth),
        fim: endOfMonth(lastMonth),
      };
      
    case 'este-ano':
      return {
        inicio: startOfYear(now),
        fim: now,
      };
      
    case 'ano-passado':
      const lastYear = subYears(now, 1);
      return {
        inicio: startOfYear(lastYear),
        fim: endOfWeek(startOfYear(lastYear)),
      };
      
    case 'personalizado':
    default:
      return {
        inicio: startOfMonth(now),
        fim: endOfMonth(now),
      };
  }
}

/**
 * Calcula o período de comparação
 */
function getCompareDateRange(
  dateRange: IntervaloData,
  tipo: TipoComparacao
): IntervaloData | undefined {
  if (tipo === 'nenhuma') {
    return undefined;
  }
  
  const diffTime = dateRange.fim.getTime() - dateRange.inicio.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  switch (tipo) {
    case 'periodo-anterior':
      return {
        inicio: subDays(dateRange.inicio, diffDays + 1),
        fim: subDays(dateRange.inicio, 1),
      };
      
    case 'mesmo-periodo-ano-anterior':
      return {
        inicio: subYears(dateRange.inicio, 1),
        fim: subYears(dateRange.fim, 1),
      };
      
    default:
      return undefined;
  }
}

/** Props do hook */
interface UseDateRangeProps {
  defaultPreset?: Periodo;
  defaultCompare?: TipoComparacao;
}

/**
 * Hook para gerenciamento de período de datas
 * Gerencia o período selecionado e calcula datas de comparação
 */
export function useDateRange({
  defaultPreset = DEFAULT_PRESET,
  defaultCompare = 'nenhuma',
}: UseDateRangeProps = {}) {
  // Estado do preset
  const [preset, setPreset] = useState<Periodo>(defaultPreset);
  
  // Estado do período customizado
  const [customRange, setCustomRange] = useState<IntervaloData | null>(null);
  
  // Estado de comparação
  const [compare, setCompare] = useState<TipoComparacao>(defaultCompare);
  
  // Calcula o dateRange atual
  const dateRange = useMemo((): IntervaloData => {
    if (preset === 'personalizado' && customRange) {
      return customRange;
    }
    return getDateRangeByPreset(preset);
  }, [preset, customRange]);
  
  // Calcula o período de comparação
  const compararData = useMemo((): IntervaloData | undefined => {
    return getCompareDateRange(dateRange, compare);
  }, [dateRange, compare]);
  
  // Atualiza o preset
  const handleSetPreset = useCallback((newPreset: Periodo) => {
    setPreset(newPreset);
    if (newPreset !== 'personalizado') {
      setCustomRange(null);
    }
  }, []);
  
  // Atualiza o período customizado
  const handleSetCustomRange = useCallback((range: IntervaloData) => {
    setCustomRange(range);
    setPreset('personalizado');
  }, []);
  
  // Atualiza o tipo de comparação
  const handleSetCompare = useCallback((newCompare: TipoComparacao) => {
    setCompare(newCompare);
  }, []);
  
  // Formata o período para display
  const periodoLabel = useMemo((): string => {
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    
    const inicio = dateRange.inicio.toLocaleDateString('pt-BR', formatOptions);
    const fim = dateRange.fim.toLocaleDateString('pt-BR', formatOptions);
    
    return `${inicio} - ${fim}`;
  }, [dateRange]);
  
  // Labels amigáveis para presets
  const presetLabel = useMemo((): string => {
    switch (preset) {
      case 'hoje':
        return 'Hoje';
      case 'ontem':
        return 'Ontem';
      case 'ultimos-7-dias':
        return 'Últimos 7 dias';
      case 'ultimos-30-dias':
        return 'Últimos 30 dias';
      case 'este-mes':
        return 'Este mês';
      case 'mes-passado':
        return 'Mês passado';
      case 'este-ano':
        return 'Este ano';
      case 'ano-passado':
        return 'Ano passado';
      case 'personalizado':
        return 'Personalizado';
      default:
        return preset;
    }
  }, [preset]);
  
  return {
    preset,
    setPreset: handleSetPreset,
    dateRange,
    setDateRange: handleSetCustomRange,
    compare,
    setCompare: handleSetCompare,
    compararData,
    periodoLabel,
    presetLabel,
  };
}

export default useDateRange;