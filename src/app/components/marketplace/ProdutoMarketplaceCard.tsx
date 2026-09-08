/**
 * Componente ProdutoMarketplaceCard - Card de produto no marketplace
 * Mostra: imagem, nome, preço, lojista, botão "Adicionar ao Carrinho"
 */

import { ShoppingCart, Truck, Star } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Produto, Lojista } from '../../types/marketplace';

interface ProdutoMarketplaceCardProps {
  produto: Produto;
  lojista?: Lojista;
  onAddToCart?: (produto: Produto) => void;
  loading?: boolean;
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

export function ProdutoMarketplaceCard({
  produto,
  lojista,
  onAddToCart,
  loading,
}: ProdutoMarketplaceCardProps) {
  const precoAtual = produto.precoPromocional || produto.preco;
  const temDesconto = produto.precoPromocional && produto.precoPromocional < produto.preco;
  const descontoPercent = temDesconto
    ? Math.round(((produto.preco - produto.precoPromocional!) / produto.preco) * 100)
    : 0;

  const isOutOfStock = produto.estoque <= 0;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {/* Imagem do produto */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={produto.imagemUrl}
          alt={produto.nome}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        
        {/* Badges de destaque e desconto */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {produto.destaque && (
            <Badge className="bg-amber-500 hover:bg-amber-600">
              Destaque
            </Badge>
          )}
          {temDesconto && (
            <Badge className="bg-red-500 hover:bg-red-600">
              -{descontoPercent}%
            </Badge>
          )}
        </div>

        {/* Badge de freight Grátis */}
        {produto.freightGratis && (
          <div className="absolute right-2 top-2">
            <Badge variant="outline" className="border-primary bg-muted text-foreground">
              <Truck className="mr-1 h-3 w-3" />
              Frete Grátis
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Categoria */}
        <p className="text-xs text-muted-foreground">{produto.categoria}</p>
        
        {/* Nome do produto */}
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-tight">
          {produto.nome}
        </h3>

        {/* Lojista */}
        {lojista && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <div className="h-4 w-4 overflow-hidden rounded-full">
              {lojista.logoUrl ? (
                <img
                  src={lojista.logoUrl}
                  alt={lojista.nome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-[8px] font-bold">
                  {lojista.nome.charAt(0)}
                </div>
              )}
            </div>
            <span className="truncate">{lojista.nome}</span>
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{lojista.nota.toFixed(1)}</span>
          </div>
        )}

        {/* Preços */}
        <div className="mt-3 flex items-baseline gap-2">
          {temDesconto ? (
            <>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(precoAtual)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(produto.preco)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold">
              {formatPrice(precoAtual)}
            </span>
          )}
        </div>

        {/* Estoque */}
        {isOutOfStock ? (
          <p className="mt-2 text-xs text-red-500">Esgotado</p>
        ) : produto.estoque <= 5 ? (
          <p className="mt-2 text-xs text-amber-500">
           Apenas {produto.estoque} unidades disponíveis
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          variant={isOutOfStock ? 'outline' : 'default'}
          disabled={isOutOfStock || loading}
          onClick={() => onAddToCart?.(produto)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Esgotado' : 'Adicionar ao Carrinho'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProdutoMarketplaceCard;