/**
 * AgendamentosPage - Página de Agendamentos
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
import { AgendamentosData, DadoAgendamento } from '../../types/metricas';
import { KPI } from '../../types/metricas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AgendamentosPage() {
  const { preset, setPreset } = useDateRange({
    defaultPreset: 'este-mes',
  });

  const { data, loading, kpis } = useMetricas({
    tipo: 'agendamentos',
    periodo: preset,
  });

  const agendamentosData = data as AgendamentosData | null;

  // KPIs de agendamentos customizados
  const kpisAgendamentos = useMemo((): KPI[] => {
    if (!agendamentosData?.resumo) return kpis?.slice(0, 4) || [];
    const { resumo } = agendamentosData;
    return [
      {
        id: 'total',
        tipo: 'agendamentos',
        label: 'Total Agendamentos',
        valor: resumo.total,
        formato: 'number',
        tendencia: 8.5,
        periodoAnterior: resumo.total * 0.92,
      },
      {
        id: 'comparecimento',
        tipo: 'taxa-comparecimento',
        label: 'Taxa de Comparecimento',
        valor: resumo.comparecimento,
        formato: 'percent',
        tendencia: 2.3,
        periodoAnterior: resumo.comparecimento * 0.98,
      },
      {
        id: 'cancelamento',
        tipo: 'taxa-cancelamento',
        label: 'Taxa de Cancelamento',
        valor: (resumo.cancelamentos / resumo.total) * 100,
        formato: 'percent',
        tendencia: -1.5,
        periodoAnterior: (resumo.cancelamentos / resumo.total) * 100 * 1.02,
      },
      {
        id: 'ocupacao',
        tipo: 'ocupacao',
        label: 'Taxa de Ocupação',
        valor: resumo.ocupacao,
        formato: 'percent',
        tendencia: 3.2,
        periodoAnterior: resumo.ocupacao * 0.97,
      },
    ];
  }, [agendamentosData, kpis]);

  // Colunas para lista de agendamentos
  const colunasAgendamentos = useMemo(
    () => [
      { key: 'data', title: 'Data', sortable: true },
      { key: 'hora', title: 'Hora' },
      { key: 'cliente', title: 'Cliente' },
      { key: 'servico', title: 'Serviço' },
      { key: 'colaborador', title: 'Profissional' },
      { key: 'valor', title: 'Valor' },
      { key: 'status', title: 'Status' },
    ],
    []
  );

  // Converte dados para tabela (mock simplificado)
  const tabelaData = useMemo(() => {
    const mockAgendamentos: DadoAgendamento[] = [];
    const nomes = ['Maria Santos', 'João Silva', 'Ana Oliveira', 'Pedro Souza'];
    const servicos = ['Corte de Cabelo', 'Manicure', 'Massagem', 'Tratamento Facial'];
    const collaborators = ['Ana Paula', 'Carlos Eduardo', 'Juliana Santos'];
    const statuses = ['realizado', 'cancelado', 'faltoso'];
    
    for (let i = 0; i < 20; i++) {
      mockAgendamentos.push({
        id: `age-${i}`,
        data: new Date(2026, 3, 14 - (i % 14)),
        hora: `${9 + (i % 10)}:${i % 2 === 0 ? '00' : '30'}`,
        cliente: { id: `cli-${i}`, nome: nomes[i % nomes.length] },
        servico: { id: `ser-${i}`, nome: servicos[i % servicos.length], duracao: 60 },
        colaborador: { id: `col-${i}`, nome: collaborators[i % collaborators.length] },
        valor: 100 + i * 10,
        status: statuses[i % statuses.length] as 'realizado' | 'cancelado' | 'faltoso',
      });
    }

    return mockAgendamentos.map((a) => ({
      data: format(new Date(a.data), 'dd/MM/yyyy', { locale: ptBR }),
      hora: a.hora,
      cliente: a.cliente.nome,
      servico: a.servico.nome,
     colaborador: a.colaborador.nome,
      valor: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(a.valor),
      status: a.status,
    }));
  }, [agendamentosData]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gestão de agendamentos e horários
          </p>
        </div>
        <DateRangePicker value={preset} onChange={setPreset} />
      </div>

      {/* KPIs de Agendamentos */}
      <KPIGrid kpis={kpisAgendamentos} periodo={preset} loading={loading} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <VendasChart data={agendamentosData?.porDiaSemana || []} periodo={preset} />
            <ClientesDistribution
              data={agendamentosData?.comparecimentoFaltas || []}
            />
          </>
        )}
      </div>

      {/* Heatmap/Aglomeração por horário */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Colaborador</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <VendasChart data={agendamentosData?.porColaborador || []} periodo={preset} />
          )}
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <MetricasTable
              columns={colunasAgendamentos}
              data={tabelaData}
              pageSize={15}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AgendamentosPage;