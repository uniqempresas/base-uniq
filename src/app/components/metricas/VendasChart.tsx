/**
 * VendasChart - Gráfico de Vendas
 * Módulo de Métricas - UNIQ Empresas
 * 
 * NOTA: Este componente foi projetado para usar Tremor AreaChart
 * Verificar instalação de @tremor/react ou alternativa
 */

import React from 'react';
import { DadoGrafico, Periodo } from '../../types/metricas';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../ui/utils';

export interface VendasChartProps {
  data: DadoGrafico[];
  periodo?: Periodo;
  className?: string;
}

/**
 * Componente de Gráfico de Vendas
 * Exibe linha de tendência de vendas
 * 
 * Nota: Usar AreaChart do Tremor quando instalado
 * Por agora, exibe dados em formato de lista
 */
export function VendasChart({
  data,
  periodo,
  className,
}: VendasChartProps) {
  const maxValor = Math.max(...data.map((d) => d.valor), 0);
  const minValor = Math.min(...data.map((d) => d.valor), 0);

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Vendas por Período</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Gráfico de área simples - implementar com Tremor AreaChart quando disponível */}
        <div className="space-y-4">
          {/* Área do gráfico */}
          <div className="relative h-64 w-full">
            {/* Barra de dados simulando área - substituir por AreaChart */}
            <div className="flex h-full items-end justify-between gap-1">
              {data.slice(-14).map((item, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                    style={{
                      height: `${(item.valor / maxValor) * 100}%`,
                      minHeight: item.valor > 0 ? '4px' : '0',
                    }}
                    title={`${item.data}: R$ ${item.valor.toLocaleString('pt-BR')}`}
                  />
                  <span className="text-xs text-muted-foreground rotate-45">
                    {item.data.split('/')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Menor: R$ {minValor.toLocaleString('pt-BR')}</span>
            <span>Maior: R$ {maxValor.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VendasChart;