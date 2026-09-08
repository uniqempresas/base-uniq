/**
 * CarrinhoPage - Página do carrinho de compras
 * Lista itens agrupados por lojista, com totais e ações
 */

import { useNavigate } from 'react-router';
import { ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import { useCarrinho } from '../../hooks/useCarrinho';
import { CarrinhoAgrupado } from './CarrinhoAgrupado';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

/**
 * Formata preço em centavos para display (R$)
 */
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function CarrinhoPage() {
  const navigate = useNavigate();
  const {
    itensAgrupados,
    quantidadeTotal,
    subtotalGeral,
    freightGeral,
    valorTotal,
    atualizarQuantidade,
    removerItem,
  } = useCarrinho();

  const temItens = itensAgrupados.length > 0;

  return (
    <div className="container mx-auto py-6">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        className="mb-4 gap-2"
        onClick={() => navigate('/marketplace')}
      >
        <ArrowLeft className="h-4 w-4" />
        Continuar Comprando
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de Itens */}
        <div className="lg:col-span-2">
          <h1 className="mb-4 text-2xl font-bold">
            Carrinho de Compras
            {quantidadeTotal > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'})
              </span>
            )}
          </h1>

          {temItens ? (
            <CarrinhoAgrupado
              itensAgrupados={itensAgrupados}
              onUpdateQuantity={atualizarQuantidade}
              onRemove={removerItem}
            />
          ) : (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Seu carrinho está vazio</h2>
                <p className="mb-4 text-muted-foreground">
                  Explore nosso marketplace e encontre produtos increíbles
                </p>
                <Button onClick={() => navigate('/marketplace')}>
                  Ver Produtos
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumo do Pedido */}
        {temItens && (
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotalGeral)}</span>
                </div>

                {/* Frete */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span>{freightGeral > 0 ? formatPrice(freightGeral) : 'Grátis'}</span>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(valorTotal)}</span>
                </div>

                {/* Info de lojistas */}
                <p className="text-sm text-muted-foreground">
                  Compras de {itensAgrupados.length} {itensAgrupados.length === 1 ? 'lojista' : 'lojistas'}
                </p>
              </CardContent>

              <CardFooter className="flex-col gap-2">
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => navigate('/marketplace/checkout')}
                >
                  <CreditCard className="h-4 w-4" />
                  Finalizar Compra
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/marketplace')}
                >
                  Continuar Comprando
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarrinhoPage;