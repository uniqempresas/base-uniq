/**
 * Componente CarrinhoAgrupado - Itens agrupados por lojista no carrinho
 * Separa por lojista com subtotal e frete
 */

import { Truck, Store, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Separator } from '../ui/separator';
import { CarrinhoItemCard } from './CarrinhoItemCard';
import type { CarrinhoAgrupado as CarrinhoAgrupadoType } from '../../types/marketplace';

interface CarrinhoAgrupadoProps {
  itensAgrupados: CarrinhoAgrupadoType[];
  onUpdateQuantity: (produtoId: string, quantidade: number) => void;
  onRemove: (produtoId: string) => void;
}

/**
 * Formata preço em centavos para display (R$)
 */
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function CarrinhoAgrupado({
  itensAgrupados,
  onUpdateQuantity,
  onRemove,
}: CarrinhoAgrupadoProps) {
  if (itensAgrupados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Seu carrinho está vazio</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {itensAgrupados.map((grupo) => (
        <Card key={grupo.lojista.id} className="overflow-hidden">
          {/* Header do lojista */}
          <CardHeader className="border-b bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                  {grupo.lojista.logoUrl ? (
                    <img
                      src={grupo.lojista.logoUrl}
                      alt={grupo.lojista.nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold">
                      {grupo.lojista.nome.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{grupo.lojista.nome}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{grupo.lojista.nota.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Info de frete */}
              <div className="flex items-center gap-1 text-sm">
                {grupo.freight === 0 ? (
                  <span className="flex items-center gap-1 text-foreground">
                    <Truck className="h-4 w-4" />
                    Frete Grátis
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Frete: {formatPrice(grupo.freight)}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {/* Itens do lojista */}
            <div className="space-y-3">
              {grupo.itens.map((item) => (
                <CarrinhoItemCard
                  key={item.produtoId}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemove}
                />
              ))}
            </div>

            <Separator className="my-4" />

            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <div className="text-right">
                <span className="font-semibold">{formatPrice(grupo.subtotal)}</span>
                {grupo.freight > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    + {formatPrice(grupo.freight)} (frete)
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CarrinhoAgrupado;