/**
 * Componente LojistaGrid - Grid de lojistas no marketplace
 * Layout: 3 colunas desktop, 2 tablet, 1 mobile
 */

import { LojistaCard } from './LojistaCard';
import type { Lojista } from '../../types/marketplace';

interface LojistaGridProps {
  lojistas: Lojista[];
  loading?: boolean;
  onVerLoja?: (lojista: Lojista) => void;
}

export function LojistaGrid({ lojistas, loading, onVerLoja }: LojistaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  if (lojistas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Nenhum lojista encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {lojistas.map((lojista) => (
        <LojistaCard
          key={lojista.id}
          lojista={lojista}
          onVerLoja={onVerLoja}
        />
      ))}
    </div>
  );
}

export default LojistaGrid;