/**
 * KPIGrid - Grid de 4 KPIs
 * Módulo de Métricas - UNIQ Empresas
 */

import React from 'react';
import { KPI, Periodo } from '../../types/metricas';
import { KPICard } from './KPICard';

export interface KPIGridProps {
  kpis: KPI[];
  periodo?: Periodo;
  loading?: boolean;
}

/**
 * Componente de Grid de KPIs
 * Exibe 4 KPIs em layout de grid responsivo (2x2 mobile)
 */
export function KPIGrid({
  kpis,
  periodo,
  loading = false,
}: KPIGridProps) {
  // Limitamos a 4 KPIs para o grid principal
  const displayKpis = kpis.slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {displayKpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          kpi={{
            tipo: kpi.tipo,
            label: kpi.label,
            valor: kpi.valor,
            formato: kpi.formato,
            tendencia: kpi.tendencia,
            periodoAnterior: kpi.periodoAnterior,
            meta: kpi.meta,
          }}
          loading={loading}
        />
      ))}
    </div>
  );
}

export default KPIGrid;