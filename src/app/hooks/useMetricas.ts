/**
 * Hook Customizado para Buscar Dados de Métricas
 * UNIQ Empresas - Sprint 14
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  TipoPaginaMetricas,
  FiltrosMetricas,
  Periodo,
  DashboardData,
  VendasData,
  FinanceiroData,
  ClientesData,
  AgendamentosData,
  ProdutosData,
} from '../types/metricas';
import {
  getDataByTipoPagina,
  mockDashboardData,
  mockVendasPageData,
  mockFinanceiroPageData,
  mockClientesPageData,
  mockAgendamentosPageData,
  mockProdutosPageData,
  generateKPIsByPeriodo,
} from '../lib/mocks/metricas';

/** Tipo de dado retornado */
type MetricasData =
  | DashboardData
  | VendasData
  | FinanceiroData
  | ClientesData
  | AgendamentosData
  | ProdutosData;

/** Props do hook */
interface UseMetricasProps {
  tipo: TipoPaginaMetricas;
  periodo?: Periodo;
  filtros?: Partial<FiltrosMetricas>;
}

/** Retorno do hook */
interface UseMetricasReturn {
  data: MetricasData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  kpis?: ReturnType<typeof generateKPIsByPeriodo>;
}

/**
 * Hook para buscar dados de métricas
 * Simula uma chamada à API com dados mockados
 */
export function useMetricas({
  tipo,
  periodo = 'este-mes',
  filtros = {},
}: UseMetricasProps): UseMetricasReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<MetricasData | null>(null);

  // Gera KPIs baseados no período
  const kpis = useMemo(() => {
    return generateKPIsByPeriodo(periodo);
  }, [periodo]);

  // Função para buscar dados
  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    // Simula um delay de API
    setTimeout(() => {
      try {
        const fetchedData = getDataByTipoPagina(tipo, periodo);
        setData(fetchedData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao buscar dados'));
        setLoading(false);
      }
    }, 500);
  }, [tipo, periodo]);

  // Busca inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Retorna dados mockados se ainda não houver dados
  const mockData = useMemo((): MetricasData | null => {
    switch (tipo) {
      case 'dashboard':
        return mockDashboardData;
      case 'vendas':
        return mockVendasPageData;
      case 'financeiro':
        return mockFinanceiroPageData;
      case 'clientes':
        return mockClientesPageData;
      case 'agendamentos':
        return mockAgendamentosPageData;
      case 'produtos':
        return mockProdutosPageData;
      default:
        return mockDashboardData;
    }
  }, [tipo]);

  return {
    data: data || mockData,
    loading,
    error,
    refetch: fetchData,
    kpis,
  };
}

export default useMetricas;