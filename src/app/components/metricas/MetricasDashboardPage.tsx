/**
 * MetricasDashboardPage - Página Principal de Métricas
 * Módulo de Métricas - UNIQ Empresas
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useMetricas } from '../../hooks/useMetricas';
import { useDateRange } from '../../hooks/useDateRange';
import { DateRangePicker } from './DateRangePicker';
import { KPIGrid } from './KPIGrid';
import { VendasChart } from './VendasChart';
import { ClientesDistribution } from './ClientesDistribution';
import { MetricasTable, TableColumn } from './MetricasTable';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { DadoVenda, DashboardData } from '../../types/metricas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Users,
  CalendarClock,
  Package,
} from 'lucide-react';

export function MetricasDashboardPage() {
  const navigate = useNavigate();
  const { preset, setPreset } = useDateRange({
    defaultPreset: 'este-mes',
  });

  const { data, loading, kpis } = useMetricas({
    tipo: 'dashboard',
    periodo: preset,
  });

  // Colunas para a tabela de vendas
  const colunasVendas = useMemo(
    () => [
      {
        key: 'data',
        title: 'Data',
        sortable: true,
      },
      {
        key: 'cliente',
        title: 'Cliente',
      },
      {
        key: 'valorTotal',
        title: 'Valor',
        sortable: true,
      },
      {
        key: 'formaPagamento',
        title: 'Pagamento',
      },
      {
        key: 'status',
        title: 'Status',
      },
    ],
    []
  );

  // Cast para o tipo correto já que usamos dados mockados
  const dashboardData = data as DashboardData | null;

  // Converte DadoVenda para formato de tabela
  const tabelaData = useMemo(() => {
    return (dashboardData?.ultimasVendas || []).map((v) => ({
      data: format(new Date(v.data), 'dd/MM/yyyy', { locale: ptBR }),
      cliente: v.cliente?.nome || '-',
      valorTotal: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(v.valorTotal),
      formaPagamento: v.formaPagamento,
      status: v.status,
    }));
  }, [dashboardData]);

  return (
    <div className="space-y-6 p-6">
      {/* Menu de Contexto */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate("/metricas/dashboard")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted hover:border-border transition-all"
        >
          <LayoutDashboard size={16} className="text-foreground" />
          <span className="text-sm font-medium text-foreground">Dashboard</span>
        </button>

        <button
          onClick={() => navigate("/metricas/vendas")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted hover:border-border transition-all"
        >
          <TrendingUp size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-foreground">Vendas</span>
        </button>

        <button
          onClick={() => navigate("/metricas/financeiro")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted hover:border-border transition-all"
        >
          <Wallet size={16} className="text-violet-600" />
          <span className="text-sm font-medium text-foreground">Financeiro</span>
        </button>

        <button
          onClick={() => navigate("/metricas/clientes")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted hover:border-border transition-all"
        >
          <Users size={16} className="text-amber-600" />
          <span className="text-sm font-medium text-foreground">Clientes</span>
        </button>

        <button
          onClick={() => navigate("/metricas/agendamentos")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted hover:border-border transition-all"
        >
          <CalendarClock size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-foreground">Agendamentos</span>
        </button>

        <button
          onClick={() => navigate("/metricas/produtos")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted hover:border-border transition-all"
        >
          <Package size={16} className="text-red-600" />
          <span className="text-sm font-medium text-foreground">Produtos</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Métricas</h1>
          <p className="text-muted-foreground">
            Visão geral dos principais indicadores
          </p>
        </div>
        <DateRangePicker value={preset} onChange={setPreset} />
      </div>

      {/* KPIs Grid */}
      <KPIGrid kpis={kpis || []} periodo={preset} loading={loading} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <VendasChart data={dashboardData?.vendasGrafico || []} periodo={preset} />
            <ClientesDistribution
              data={dashboardData?.ProdutosGrafico || []}
            />
          </>
        )}
      </div>

      {/* Tabela de Recentes Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <MetricasTable
              columns={colunasVendas}
              data={tabelaData}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MetricasDashboardPage;