/**
 * VendasPage - Página de Vendas
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
import { VendasData } from '../../types/metricas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function VendasPage() {
  const { preset, setPreset } = useDateRange({
    defaultPreset: 'este-mes',
  });

  const { data, loading, kpis } = useMetricas({
    tipo: 'vendas',
    periodo: preset,
  });

  // KPIs específicos de vendas
  const kpisVendas = useMemo(() => {
    if (!kpis) return [];
    return kpis.slice(0, 4);
  }, [kpis]);

  // Colunas para tabela de vendas detalhadas
  const colunasVendas = useMemo(
    () => [
      { key: 'data', title: 'Data', sortable: true },
      { key: 'cliente', title: 'Cliente' },
      { key: 'produtos', title: 'Serviços/Produtos' },
      { key: 'valorTotal', title: 'Valor', sortable: true },
      { key: 'desconto', title: 'Desconto' },
      { key: 'formaPagamento', title: 'Pagamento' },
      { key: 'colaborador', title: 'Profissional' },
      { key: 'status', title: 'Status' },
    ],
    []
  );

  const vendasData = data as VendasData | null;

  // Converte dados para tabela
  const tabelaData = useMemo(() => {
    return (vendasData?.detalhadas || []).map((v) => ({
      data: format(new Date(v.data), 'dd/MM/yyyy', { locale: ptBR }),
      cliente: v.cliente?.nome || '-',
      produtos: v.produtos?.map((p) => p.nome).join(', ') || '-',
      valorTotal: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(v.valorTotal),
      desconto: v.desconto > 0
        ? new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(v.desconto)
        : '-',
      formaPagamento: v.formaPagamento,
      colaborador: v.colaborador?.nome || '-',
      status: v.status,
    }));
  }, [vendasData]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Análise de Vendas</h1>
          <p className="text-muted-foreground">
            Detalhamento de vendas e tendências
          </p>
        </div>
        <DateRangePicker value={preset} onChange={setPreset} />
      </div>

      {/* KPIs de Vendas */}
      <KPIGrid kpis={kpisVendas} periodo={preset} loading={loading} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <VendasChart data={vendasData?.graficoTemporal || []} periodo={preset} />
            <ClientesDistribution
              data={vendasData?.porCanal || []}
            />
          </>
        )}
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <MetricasTable
              columns={colunasVendas}
              data={tabelaData}
              pageSize={15}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VendasPage;