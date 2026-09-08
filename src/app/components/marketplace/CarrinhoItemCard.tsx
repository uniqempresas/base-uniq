/**
 * Componente CarrinhoItemCard - Item no carrinho de compras
 * Mostra: imagem, nome, preço, quantidade, total
 */

import { Minus, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import type { CarrinhoItem } from '../../types/marketplace';

interface CarrinhoItemCardProps {
  item: CarrinhoItem;
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

export function CarrinhoItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CarrinhoItemCardProps) {
  const { produto, quantidade } = item;
  const precoUnitario = produto.precoPromocional || produto.preco;
  const precoTotal = precoUnitario * quantidade;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Imagem do produto */}
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            <img
              src={produto.imagemUrl}
              alt={produto.nome}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Informações do produto */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h4 className="line-clamp-2 text-sm font-medium">
                {produto.nome}
              </h4>
              <p className="text-xs text-muted-foreground">
                {produto.categoria}
              </p>
            </div>

            <div className="flex items-center justify-between">
              {/* Preço unitário */}
              <div className="text-sm">
                {formatPrice(precoUnitario)} cada
              </div>

              {/* Controles de quantidade */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(produto.id, quantidade - 1)}
                  disabled={quantidade <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="min-w-[2rem] text-center text-sm font-medium">
                  {quantidade}
                </span>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(produto.id, quantidade + 1)}
                  disabled={quantidade >= produto.estoque}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Preço total e remover */}
          <div className="flex flex-col items-end justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-red-500"
              onClick={() => onRemove(produto.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="text-right">
              <div className="font-semibold">
                {formatPrice(precoTotal)}
              </div>
              {produto.freightGratis && (
                <span className="text-xs text-foreground">Frete Grátis</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CarrinhoItemCard;