/**
 * FinanceiroPage - Página Financeira
 * Módulo de Métricas - UNIQ Empresas
 */

import React, { useMemo } from 'react';
import { useMetricas } from '../../hooks/useMetricas';
import { useDateRange } from '../../hooks/useDateRange';
import { DateRangePicker } from './DateRangePicker';
import { KPIGrid } from './KPIGrid';
import { VendasChart } from './VendasChart';
import { ClientesDistribution } from './ClientesDistribution';
import { MetricasTable } from './MetricasTable';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { FinanceiroData } from '../../types/metricas';
import { KPI } from '../../types/metricas';

export function FinanceiroPage() {
  const { preset, setPreset } = useDateRange({
    defaultPreset: 'este-mes',
  });

  const { data, loading, kpis } = useMetricas({
    tipo: 'financeiro',
    periodo: preset,
  });

  const financeiroData = data as FinanceiroData | null;

  // KPIs financeiros customizados
  const kpisFinanceiros = useMemo((): KPI[] => {
    if (!financeiroData?.resumo) return kpis?.slice(0, 4) || [];
    const { resumo } = financeiroData;
    return [
      {
        id: 'receitas',
        tipo: 'receitas',
        label: 'Receitas',
        valor: resumo.receitas,
        formato: 'currency',
        tendencia: 8.5,
        periodoAnterior: resumo.receitas * 0.92,
      },
      {
        id: 'despesas',
        tipo: 'despesas',
        label: 'Despesas',
        valor: resumo.despesas,
        formato: 'currency',
        tendencia: -2.3,
        periodoAnterior: resumo.despesas * 1.02,
      },
      {
        id: 'lucro',
        tipo: 'lucro',
        label: 'Lucro',
        valor: resumo.lucro,
        formato: 'currency',
        tendencia: 15.2,
        periodoAnterior: resumo.lucro * 0.87,
      },
      {
        id: 'saldo',
        tipo: 'saldo',
        label: 'Saldo',
        valor: resumo.saldo,
        formato: 'currency',
        tendencia: 5.8,
        periodoAnterior: resumo.saldo * 0.95,
      },
    ];
  }, [financeiroData, kpis]);

  // Colunas para movimentações
  const colunasMovimentacoes = useMemo(
    () => [
      { key: 'data', title: 'Data', sortable: true },
      { key: 'descricao', title: 'Descrição' },
      { key: 'categoria', title: 'Categoria' },
      { key: 'tipo', title: 'Tipo' },
      { key: 'valor', title: 'Valor', sortable: true },
      { key: 'status', title: 'Status' },
    ],
    []
  );

  // Converte dados para tabela (mock simplificado)
  const tabelaData = useMemo(() => {
    // Criar dados mockados baseados no resumo
    return (financeiroData?.resumo.porCategoria || []).map((item, i) => ({
      data: `${i + 1}/04/2026`,
      descricao: item.categoria,
      categoria: item.categoria,
      tipo: item.tipo,
      valor: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(item.valor),
      status: 'confirmado',
    }));
  }, [financeiroData]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle financeiro e fluxo de caixa
          </p>
        </div>
        <DateRangePicker value={preset} onChange={setPreset} compareEnabled compareValue="nenhuma" onCompareChange={() => {}} />
      </div>

      {/* KPIs Financeiros */}
      <KPIGrid kpis={kpisFinanceiros} periodo={preset} loading={loading} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <VendasChart data={financeiroData?.fluxoCaixa || []} periodo={preset} />
            <ClientesDistribution
              data={financeiroData?.despesasPorCategoria || []}
            />
          </>
        )}
      </div>

      {/* Evolução do Saldo */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <VendasChart data={financeiroData?.evolucaoSaldo || []} periodo={preset} />
          )}
        </CardContent>
      </Card>

      {/* Movimentações por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <MetricasTable
              columns={colunasMovimentacoes}
              data={tabelaData}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FinanceiroPage;