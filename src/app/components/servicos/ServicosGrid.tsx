/**
 * Componente ServicosGrid - Grid responsivo de cards
 */

import { ServicoCard } from './ServicoCard';
import type { Servico } from '../../types/servicos';

interface ServicosGridProps {
  servicos: Servico[];
  onEdit?: (servico: Servico) => void;
  onDelete?: (id: string) => void;
}

export function ServicosGrid({ servicos, onEdit, onDelete }: ServicosGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {servicos.map((servico) => (
        <ServicoCard
          key={servico.id}
          servico={servico}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}