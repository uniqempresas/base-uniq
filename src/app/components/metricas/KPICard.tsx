/**
 * KPICard - Card de KPI Individual
 * Módulo de Métricas - UNIQ Empresas
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { KPICard as KPICardType, FormatoKPI } from '../../types/metricas';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/** Formata valor para exibição */
function formatValue(valor: number, formato: FormatoKPI): string {
  switch (formato) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor);
    case 'percent':
      return `${valor.toFixed(1)}%`;
    case 'number':
    default:
      return new Intl.NumberFormat('pt-BR').format(valor);
  }
}

/** Determina cor da tendência */
function getTendenciaColor(tendencia: number): string {
  if (tendencia > 0) return 'text-foreground';
  if (tendencia < 0) return 'text-red-600';
  return 'text-muted-foreground';
}

/** Determina ícone de tendência */
function getTendenciaIcon(tendencia: number) {
  if (tendencia > 0) return <TrendingUp className="h-4 w-4" />;
  if (tendencia < 0) return <TrendingDown className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
}

/** Calcula direção da tendência */
function getDirecao(tendencia: number): 'up' | 'down' | 'stable' {
  if (tendencia > 0) return 'up';
  if (tendencia < 0) return 'down';
  return 'stable';
}

export interface KPICardProps {
  kpi: KPICardType;
  valor?: number;
  tendencia?: number;
  periodoAnterior?: number;
  meta?: number;
  loading?: boolean;
}

/**
 * Componente de Card de KPI Individual
 * Exibe ícones, label, valor formatado, tendência, período anterior e barra de meta
 */
export function KPICard({
  kpi,
  valor,
  tendencia,
  periodoAnterior,
  meta,
  loading = false,
}: KPICardProps) {
  const displayValor = valor ?? kpi.valor;
  const displayTendencia = tendencia ?? kpi.tendencia;
  const displayPeriodoAnterior = periodoAnterior ?? kpi.periodoAnterior;
  const displayMeta = meta ?? kpi.meta;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 w-24 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="mt-2 h-4 w-20 rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const direcao = getDirecao(displayTendencia);
  const tendenciaColor = getTendenciaColor(displayTendencia);

  // Calcula progresso da meta
  const progressoMeta = displayMeta
    ? Math.min((displayValor / displayMeta) * 100, 100)
    : null;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {kpi.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Valor Principal */}
        <div className="text-2xl font-bold text-foreground">
          {formatValue(displayValor, kpi.formato)}
        </div>

        {/* Tendência e Período Anterior */}
        <div className="flex items-center gap-2 text-sm">
          <span className={`flex items-center gap-1 ${tendenciaColor}`}>
            {getTendenciaIcon(displayTendencia)}
            <span className="font-medium">
              {displayTendencia > 0 ? '+' : ''}
              {displayTendencia.toFixed(1)}%
            </span>
          </span>
          {displayPeriodoAnterior !== undefined && (
            <span className="text-muted-foreground">
              vs.{' '}
              {formatValue(displayPeriodoAnterior, kpi.formato)}
            </span>
          )}
        </div>

        {/* Barra de Meta */}
        {progressoMeta !== null && displayMeta !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Meta</span>
              <span>{formatValue(displayMeta, kpi.formato)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  direcao === 'up'
                    ? 'bg-primary'
                    : direcao === 'down'
                      ? 'bg-red-500'
                      : 'bg-muted-foreground'
                }`}
                style={{ width: `${progressoMeta}%` }}
              />
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {progressoMeta.toFixed(0)}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default KPICard;