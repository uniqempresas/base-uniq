/**
 * MarketplacePage - Página inicial do marketplace
 * Lista todos os lojistas e permite filtrar produtos
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useCarrinho } from '../../hooks/useCarrinho';
import { MarketplaceFilters } from './MarketplaceFilters';
import { LojistaGrid } from './LojistaGrid';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function MarketplacePage() {
  const navigate = useNavigate();
  const { lojistas, loadingLojistas, filtrosAtuais, aplicarFiltros, categorias } = useMarketplace();
  const { quantidadeTotal } = useCarrinho();
  
  // Estado local para filtros
  const [filtrosLocais, setFiltrosLocais] = useState({});

  // Atualizar filtros
  const handleFilterChange = useCallback((filters: any) => {
    setFiltrosLocais(filters);
    aplicarFiltros(filters);
  }, [aplicarFiltros]);

  // Navegar para perfil do lojista
  const handleVerLoja = (lojista: any) => {
    navigate(`/marketplace/lojista/${lojista.id}`);
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Encontre os melhores produtos de nossos lojistas
          </p>
        </div>
        
        {/* Botão do carrinho */}
        <Button
          variant="outline"
          className="relative gap-2"
          onClick={() => navigate('/marketplace/carrinho')}
        >
          <ShoppingCart className="h-5 w-5" />
          Carrinho
          {quantidadeTotal > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {quantidadeTotal}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <MarketplaceFilters
          onFilterChange={handleFilterChange}
          categorias={categorias}
          initialFilters={filtrosAtuais}
        />
      </div>

      {/* Grid de Lojistas */}
      <LojistaGrid
        lojistas={lojistas}
        loading={loadingLojistas}
        onVerLoja={handleVerLoja}
      />
    </div>
  );
}

export default MarketplacePage;