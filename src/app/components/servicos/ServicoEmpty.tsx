/**
 * Componente ServicoEmpty - Estado vazio
 */

import { Scissors } from 'lucide-react';
import { Button } from '../ui/button';

interface ServicoEmptyProps {
  onAddNew?: () => void;
}

export function ServicoEmpty({ onAddNew }: ServicoEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[#efefef] flex items-center justify-center mb-4">
        <Scissors size={32} className="text-[#627271]" />
      </div>
      <h3 className="text-[#1f2937] font-semibold mb-1">Nenhum serviço encontrado</h3>
      <p className="text-[#627271] text-sm max-w-sm mb-4">
        Tente ajustar os filtros ou adicionar um novo serviço.
      </p>
      {onAddNew && (
        <Button onClick={onAddNew} className="bg-[#86cb92] hover:bg-[#1f2937] hover:text-white">
          Adicionar Novo Serviço
        </Button>
      )}
    </div>
  );
}