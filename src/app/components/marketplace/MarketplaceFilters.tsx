/**
 * Componente MarketplaceFilters - Filtros do marketplace
 * Campos: busca, categoria, faixa de preço, nota
 */

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import type { FilterOptions } from '../../types/marketplace';

interface MarketplaceFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  categorias?: string[];
  loading?: boolean;
  initialFilters?: FilterOptions;
}

const NOTA_OPTIONS = [
  { value: '5', label: '5+ estrelas' },
  { value: '4', label: '4+ estrelas' },
  { value: '3', label: '3+ estrelas' },
];

const PRECO_OPTIONS = [
  { value: '0-5000', label: 'Até R$ 50' },
  { value: '5000-20000', label: 'R$ 50 - R$ 200' },
  { value: '20000-50000', label: 'R$ 200 - R$ 500' },
  { value: '50000-100000', label: 'R$ 500 - R$ 1.000' },
  { value: '100000-', label: 'Acima de R$ 1.000' },
];

export function MarketplaceFilters({
  onFilterChange,
  categorias = [],
  loading,
  initialFilters = {},
}: MarketplaceFiltersProps) {
  // Estado local dos filtros
  const [busca, setBusca] = useState(initialFilters.categoria || '');
  const [categoria, setCategoria] = useState(initialFilters.categoria || 'all');
  const [preco, setPreco] = useState<string>('all');
  const [nota, setNota] = useState<string>('all');
  const [freightGratis, setFreightGratis] = useState(initialFilters.freightGratis || false);
  const [destaque, setDestque] = useState(initialFilters.destaque || false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Contador de filtros ativos
  const activeFiltersCount = [
    categoria !== 'all',
    preco !== 'all',
    nota !== 'all',
    freightGratis,
    destaque,
  ].filter(Boolean).length;

  // Atualizar filtros quando mudarem
  useEffect(() => {
    const filters: FilterOptions = {};
    
    if (busca) {
      // Busca seria implementada no hook
    }
    
    if (categoria !== 'all') {
      filters.categoria = categoria;
    }
    
    if (preco !== 'all') {
      const [min, max] = preco.split('-').map((v) => (v ? parseInt(v) : undefined));
      if (min !== undefined) filters.precoMin = min;
      if (max !== undefined) filters.precoMax = max;
    }
    
    if (nota !== 'all') {
      filters.notaMin = parseInt(nota);
    }
    
    filters.freightGratis = freightGratis;
    filters.destaque = destaque;
    
    onFilterChange(filters);
  }, [busca, categoria, preco, nota, freightGratis, destaque, onFilterChange]);

  // Limpar todos os filtros
  const clearFilters = () => {
    setBusca('');
    setCategoria('all');
    setPreco('all');
    setNota('all');
    setFreightGratis(false);
    setDestque(false);
  };

  return (
    <div className="space-y-4">
      {/* Barra de busca e toggle de filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w- -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filtros avançados */}
      {isExpanded && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filtros</h3>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="mr-1 h-3 w-3" />
                Limpar
              </Button>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Faixa de preço */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço</label>
              <Select value={preco} onValueChange={setPreco}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer preço</SelectItem>
                  {PRECO_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nota mínima */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nota mínima</label>
              <Select value={nota} onValueChange={setNota}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer nota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer nota</SelectItem>
                  {NOTA_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Opções adicionais */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Opções</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={freightGratis ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  onClick={() => setFreightGratis(!freightGratis)}
                >
                  Frete Grátis
                </Button>
                <Button
                  variant={destaque ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  onClick={() => setDestque(!destaque)}
                >
                  Destaques
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags de filtros ativos */}
      {activeFiltersCount > 0 && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {categoria !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {categoria}
              <button onClick={() => setCategoria('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {preco !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {PRECO_OPTIONS.find((p) => p.value === preco)?.label || preco}
              <button onClick={() => setPreco('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {nota !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {NOTA_OPTIONS.find((n) => n.value === nota)?.label || nota}
              <button onClick={() => setNota('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {freightGratis && (
            <Badge variant="secondary" className="gap-1">
              Frete Grátis
              <button onClick={() => setFreightGratis(false)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {destaque && (
            <Badge variant="secondary" className="gap-1">
              Destaques
              <button onClick={() => setDestque(false)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default MarketplaceFilters;