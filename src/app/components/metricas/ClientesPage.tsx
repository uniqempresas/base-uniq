/**
 * ClientesPage - Página de Clientes
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
import { ClientesData, DadoCliente } from '../../types/metricas';
import { KPI } from '../../types/metricas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserPlus, Users, UserCog, UserX } from 'lucide-react';

export function ClientesPage() {
  const { preset, setPreset } = useDateRange({
    defaultPreset: 'este-mes',
  });

  const { data, loading, kpis } = useMetricas({
    tipo: 'clientes',
    periodo: preset,
  });

  const clientesData = data as ClientesData | null;

  // KPIs de clientes customizados
  const kpisClientes = useMemo((): KPI[] => {
    if (!clientesData?.resumo) return kpis?.slice(0, 4) || [];
    const { resumo } = clientesData;
    return [
      {
        id: 'total',
        tipo: 'faturamento',
        label: 'Total de Clientes',
        valor: resumo.totalClientes,
        formato: 'number',
        tendencia: 5.2,
        periodoAnterior: resumo.totalClientes * 0.95,
      },
      {
        id: 'novos',
        tipo: 'novos-clientes',
        label: 'Novos Clientes',
        valor: resumo.novosClientes,
        formato: 'number',
        tendencia: 12.8,
        periodoAnterior: resumo.novosClientes * 0.89,
      },
      {
        id: 'ativos',
        tipo: 'clientes-ativos',
        label: 'Clientes Ativos',
        valor: resumo.clientesAtivos,
        formato: 'number',
        tendencia: 3.5,
        periodoAnterior: resumo.clientesAtivos * 0.97,
      },
      {
        id: 'churn',
        tipo: 'churn-rate',
        label: 'Taxa de Churn',
        valor: resumo.churnRate,
        formato: 'percent',
        tendencia: -1.2,
        periodoAnterior: resumo.churnRate * 1.01,
      },
    ];
  }, [clientesData, kpis]);

  // Colunas para lista de clientes
  const colunasClientes = useMemo(
    () => [
      { key: 'nome', title: 'Nome' },
      { key: 'email', title: 'E-mail' },
      { key: 'telefone', title: 'Telefone' },
      { key: 'dataCadastro', title: 'Cadastro' },
      { key: 'totalGasto', title: 'Total Gasto', sortable: true },
      { key: 'status', title: 'Status' },
    ],
    []
  );

  // Converte dados para tabela (mock simplificado)
  const tabelaData = useMemo(() => {
    // Criar dados mockados
    const mockClientes: DadoCliente[] = [];
    const nomes = ['Maria Santos', 'João Silva', 'Ana Oliveira', 'Pedro Souza', 'Carla Rodrigues'];
    const statuses = ['ativo', 'inativo', 'inativo-30-dias'];
    
    for (let i = 0; i < 20; i++) {
      mockClientes.push({
        id: `cli-${i}`,
        nome: nomes[i % nomes.length] + ` ${i}`,
        email: `cliente${i}@email.com`,
        telefone: `(11) 9${1000 + i}-${1000 + i}`,
        dataCadastro: new Date(2025, 0, 1 + i),
        totalGasto: 500 + i * 100,
        frequencia: 1 + Math.floor(i / 3),
        status: statuses[i % statuses.length] as 'ativo' | 'inativo' | 'inativo-30-dias' | 'inativo-90-dias',
      });
    }

    return mockClientes.map((c) => ({
      nome: c.nome,
      email: c.email,
      telefone: c.telefone,
      dataCadastro: format(new Date(c.dataCadastro), 'dd/MM/yyyy', { locale: ptBR }),
      totalGasto: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(c.totalGasto),
      status: c.status,
    }));
  }, [clientesData]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Análise da base de clientes
          </p>
        </div>
        <DateRangePicker value={preset} onChange={setPreset} />
      </div>

      {/* KPIs de Clientes */}
      <KPIGrid kpis={kpisClientes} periodo={preset} loading={loading} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <VendasChart data={clientesData?.evolucaoBase || []} periodo={preset} />
            <ClientesDistribution
              data={clientesData?.porGenero || []}
            />
          </>
        )}
      </div>

      {/* Distribuição por Bairro */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <ClientesDistribution
              data={clientesData?.porBairro || []}
            />
            <ClientesDistribution
              data={clientesData?.porGenero?.map(g => ({ name: g.name, value: g.value })) || []}
            />
          </>
        )}
      </div>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <MetricasTable
              columns={colunasClientes}
              data={tabelaData}
              pageSize={15}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ClientesPage;