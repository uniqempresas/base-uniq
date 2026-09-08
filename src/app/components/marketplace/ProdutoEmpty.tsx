/**
 * Componente ProdutoEmpty - Estado vazio quando não há produtos
 */

import { Package } from 'lucide-react';
import { Button } from '../ui/button';

interface ProdutoEmptyProps {
  onLimparFiltros?: () => void;
}

export function ProdutoEmpty({ onLimparFiltros }: ProdutoEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Não encontramos produtos com os filtros selecionados. 
        Tente ajustar sua busca ou remover alguns filtros.
      </p>
      
      {onLimparFiltros && (
        <Button variant="outline" className="mt-6" onClick={onLimparFiltros}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

export default ProdutoEmpty;