/**
 * ClientesDistribution - Distribuição de Clientes
 * Módulo de Métricas - UNIQ Empresas
 * 
 * NOTA: Este componente foi projetado para usar Tremor DonutChart
 */

import React from 'react';
import { DadoDistribuicao } from '../../types/metricas';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../ui/utils';

export interface ClientesDistributionProps {
  data: DadoDistribuicao[];
  className?: string;
}

/** Cores para o gráfico */
const COLORS = [
  'bg-primary',
  'bg-blue-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-foreground',
  'bg-red-500',
  'bg-teal-500',
  'bg-muted-foreground',
];

/**
 * Componente de Distribuição de Clientes
 * Exibe pizza/donut com legendas
 * 
 * Nota: Usar DonutChart do Tremor quando instalado
 */
export function ClientesDistribution({
  data,
  className,
}: ClientesDistributionProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Distribuição</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Gráfico Donut simples */}
        <div className="flex flex-col gap-6">
          {/* Visualização Donut */}
          <div className="relative mx-auto h-40 w-40">
            {/* Círculo externo */}
            <svg className="h-full w-full" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const startAngle = data
                  .slice(0, index)
                  .reduce((acc, d) => acc + (d.value / total) * 360, 0);
                const endAngle = startAngle + (item.value / total) * 360;
                const largeArc = item.value / total > 0.5 ? 1 : 0;
                
                const startRad = (startAngle - 90) * (Math.PI / 180);
                const endRad = (endAngle - 90) * (Math.PI / 180);
                
                const x1 = 50 + 40 * Math.cos(startRad);
                const y1 = 50 + 40 * Math.sin(startRad);
                const x2 = 50 + 40 * Math.cos(endRad);
                const y2 = 50 + 40 * Math.sin(endRad);
                
                const path = [
                  'M 50 50',
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
                  'Z',
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={path}
                    className={COLORS[index % COLORS.length]}
                    fillOpacity="0.8"
                  />
                );
              })}
              {/* Círculo interno (buraco do donut) */}
              <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
            {/* Centro com total */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>

          {/* Legendas */}
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${COLORS[index % COLORS.length]}`}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClientesDistribution;