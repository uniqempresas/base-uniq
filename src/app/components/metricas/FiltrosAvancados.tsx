/**
 * FiltrosAvancados - Painel de Filtros
 * Módulo de Métricas - UNIQ Empresas
 */

import React from 'react';
import { FiltrosMetricas, FormaPagamento, StatusVenda } from '../../types/metricas';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { X, Filter } from 'lucide-react';
import { cn } from '../ui/utils';

export interface FiltrosAvancadosProps {
  onFilterChange: (filtros: Partial<FiltrosMetricas>) => void;
  className?: string;
}

/** Opções de categorias */
const CATEGORIAS = [
  { value: 'cabelo', label: 'Cabelo' },
  { value: 'unhas', label: 'Unhas' },
  { value: 'massagem', label: 'Massagem' },
  { value: 'facial', label: 'Facial' },
];

/** Opções de formas de pagamento */
const FORMAS_PAGAMENTO: { value: FormaPagamento; label: string }[] = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
];

/** Opções de status */
const STATUS_VENDA: { value: StatusVenda; label: string }[] = [
  { value: 'pago', label: 'Pago' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'cancelado', label: 'Cancelado' },
];

/**
 * Componente de Filtros Avançados
 * Painel com múltiplos filtros
 */
export function FiltrosAvancados({
  onFilterChange,
  className,
}: FiltrosAvancadosProps) {
  // Estado local dos filtros
  const [categoria, setCategoria] = React.useState<string[]>([]);
  const [formaPagamento, setFormaPagamento] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState<string[]>([]);

  // Limpa todos os filtros
  const clearFilters = () => {
    setCategoria([]);
    setFormaPagamento([]);
    setStatus([]);
    onFilterChange({
      categoria: [],
      formaPagamento: [],
      status: [],
    });
  };

  // Aplica filtros
  const applyFilters = () => {
    onFilterChange({
      categoria: categoria.length > 0 ? categoria : undefined,
      formaPagamento: formaPagamento.length > 0 
        ? formaPagamento as FormaPagamento[] 
        : undefined,
      status: status.length > 0 ? status as StatusVenda[] : undefined,
    });
  };

  // Verifica se há filtros ativos
  const hasActiveFilters = 
    categoria.length > 0 || 
    formaPagamento.length > 0 || 
    status.length > 0;

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros Avançados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Categoria */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Categoria</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIAS.map((cat) => (
                <div key={cat.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`categoria-${cat.value}`}
                    checked={categoria.includes(cat.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCategoria([...categoria, cat.value]);
                      } else {
                        setCategoria(
                          categoria.filter((c) => c !== cat.value)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`categoria-${cat.value}`}
                    className="text-sm font-normal"
                  >
                    {cat.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Forma de Pagamento</Label>
            <Select
              value={formaPagamento[0] || ''}
              onValueChange={(value) => {
                if (value) {
                  setFormaPagamento([value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {FORMAS_PAGAMENTO.map((forma) => (
                  <SelectItem key={forma.value} value={forma.value}>
                    {forma.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={status[0] || ''}
              onValueChange={(value) => {
                if (value) {
                  setStatus([value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {STATUS_VENDA.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button onClick={applyFilters} className="flex-1">
              Aplicar Filtros
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FiltrosAvancados;