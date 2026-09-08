/**
 * ProdutosPage - Página de Produtos
 * Módulo de Métricas - UNIQ Empresas
 */

import React, { useMemo } from 'react';
import { useMetricas } from '../../hooks/useMetricas';
import { useDateRange } from '../../hooks/useDateRange';
import { DateRangePicker } from './DateRangePicker';
import { KPIGrid } from './KPIGrid';
import { ProdutosChart } from './ProdutosChart';
import { ClientesDistribution } from './ClientesDistribution';
import { MetricasTable } from './MetricasTable';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { ProdutosData, DadoProduto } from '../../types/metricas';
import { KPI } from '../../types/metricas';

export function ProdutosPage() {
  const { preset, setPreset } = useDateRange({
    defaultPreset: 'este-mes',
  });

  const { data, loading, kpis } = useMetricas({
    tipo: 'produtos',
    periodo: preset,
  });

  const produtosData = data as ProdutosData | null;

  // KPIs de produtos customizados
  const kpisProdutos = useMemo((): KPI[] => {
    if (!produtosData?.resumo) return kpis?.slice(0, 4) || [];
    const { resumo } = produtosData;
    return [
      {
        id: 'vendidos',
        tipo: 'produtos-vendidos',
        label: 'Total Vendidos',
        valor: resumo.maisVendidos.reduce((acc, p) => acc + p.quantidade, 0),
        formato: 'number',
        tendencia: 5.2,
        periodoAnterior: resumo.maisVendidos.reduce((acc, p) => acc + p.quantidade, 0) * 0.95,
      },
      {
        id: 'giro',
        tipo: 'estoque-atual',
        label: 'Giro de Estoque',
        valor: resumo.giro,
        formato: 'number',
        tendencia: 2.8,
        periodoAnterior: resumo.giro * 0.97,
      },
      {
        id: 'parados',
        tipo: 'faturamento',
        label: 'Produtos Parados',
        valor: resumo.parados,
        formato: 'number',
        tendencia: -3.5,
        periodoAnterior: resumo.parados * 1.04,
      },
      {
        id: 'falta',
        tipo: 'churn-rate',
        label: 'Em Falta',
        valor: resumo.emFalta,
        formato: 'number',
        tendencia: 1.2,
        periodoAnterior: resumo.emFalta * 0.99,
      },
    ];
  }, [produtosData, kpis]);

  // Colunas para lista de produtos
  const colunasProdutos = useMemo(
    () => [
      { key: 'sku', title: 'SKU' },
      { key: 'nome', title: 'Nome' },
      { key: 'categoria', title: 'Categoria' },
      { key: 'quantidadeVendida', title: 'Vendidos', sortable: true },
      { key: 'estoqueAtual', title: 'Estoque' },
      { key: 'valorUnitario', title: 'Preço', sortable: true },
      { key: 'status', title: 'Status' },
    ],
    []
  );

  // Converte dados para tabela (mock simplificado)
  const tabelaData = useMemo(() => {
    const mockProdutos: DadoProduto[] = [];
    const nomes = ['Corte de Cabelo', 'Tintura', 'Manicure', 'Pedicure', 'Massagem'];
    const categorias = ['Cabelo', 'Cabelo', 'Unhas', 'Unhas', 'Massagem'];
    const statuses = ['disponivel', 'baixo-estoque', 'esgotado'];
    
    for (let i = 0; i < 20; i++) {
      mockProdutos.push({
        id: `prod-${i}`,
        sku: `SKU-${1000 + i}`,
        nome: nomes[i % nomes.length] + (i > 4 ? ` ${i}` : ''),
        categoria: categorias[i % categorias.length],
        quantidadeVendida: 50 + i * 5,
        estoqueAtual: i % 3 === 0 ? 5 : 20 + i,
        valorEstoque: (20 + i) * 50,
        valorUnitario: 50 + i * 10,
        margem: 30 + i,
        diasEstoque: 20 + i,
        status: statuses[i % statuses.length] as 'disponivel' | 'baixo-estoque' | 'esgotado',
      });
    }

    return mockProdutos.map((p) => ({
      sku: p.sku,
      nome: p.nome,
      categoria: p.categoria,
      quantidadeVendida: p.quantidadeVendida,
      estoqueAtual: p.estoqueAtual,
      valorUnitario: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(p.valorUnitario),
      status: p.status,
    }));
  }, [produtosData]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">
            Análise de produtos e estoque
          </p>
        </div>
        <DateRangePicker value={preset} onChange={setPreset} />
      </div>

      {/* KPIs de Produtos */}
      <KPIGrid kpis={kpisProdutos} periodo={preset} loading={loading} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <ProdutosChart data={produtosData?.top10 || []} />
            <ClientesDistribution
              data={produtosData?.curvaABC || []}
            />
          </>
        )}
      </div>

      {/* Por Categoria */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <ClientesDistribution
              data={produtosData?.porCategoria || []}
            />
            <Card>
              <CardHeader>
                <CardTitle>Inventário</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <MetricasTable
              columns={colunasProdutos}
              data={tabelaData}
              pageSize={15}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProdutosPage;