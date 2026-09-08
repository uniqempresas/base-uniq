/**
 * ProdutosChart - Gráfico de Produtos
 * Módulo de Métricas - UNIQ Empresas
 * 
 * NOTA: Este componente foi projetado para usar Tremor BarChart
 */

import React from 'react';
import { DadoGrafico } from '../../types/metricas';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../ui/utils';

export interface ProdutosChartProps {
  data: DadoGrafico[];
  className?: string;
}

/**
 * Componente de Gráfico de Produtos
 * Exibe Top 10 produtos em barras horizontais
 * 
 * Nota: Usar BarChart do Tremor quando instalado
 */
export function ProdutosChart({
  data,
  className,
}: ProdutosChartProps) {
  // Limita a top 10
  const topProdutos = data.slice(0, 10).sort((a, b) => b.valor - a.valor);
  const maxValor = Math.max(...topProdutos.map((d) => d.valor), 0);

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Top 10 Produtos</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Gráfico de barras horizontais */}
        <div className="space-y-3">
          {topProdutos.map((produto, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-8 text-xs text-muted-foreground">
                {index + 1}.
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium">
                    {produto.data}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {produto.valor}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${(produto.valor / maxValor) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProdutosChart;