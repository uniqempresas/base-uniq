/**
 * VendedorDashboardPage - Dashboard do vendedor
 * Estatísticas de vendas, pedidos, receita e gráfico
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Star,
  PackagePlus,
  ArrowRight
} from 'lucide-react';
import { useVendedor } from '../../hooks/useVendedor';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

/**
 * Formata preço em centavos para display (R$)
 */
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

/**
 * Formata número grande
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function VendedorDashboardPage() {
  const navigate = useNavigate();
  const { stats, loadingStats, refetch } = useVendedor();

  // Estado para o gráfico simples (barras)
  const [graficoExibir, setGraficoExibir] = useState<{mes: string; valor: number}[]>([]);

  useEffect(() => {
    if (stats?.graficoVendas) {
      // Filtrar meses com valor > 0
      setGraficoExibir(stats.graficoVendas.filter(m => m.valor > 0).slice(-6));
    }
  }, [stats]);

  if (loadingStats) {
    return (
      <div className="container mx-auto space-y-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Erro ao carregar estatísticas</p>
            <Button onClick={refetch} className="mt-4">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular valores para os cards
  const valorMaxGrafico = Math.max(...graficoExibir.map(g => g.valor), 1);

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard do Vendedor</h1>
          <p className="text-muted-foreground">
            Visão geral das suas vendas e pedidos
          </p>
        </div>
        
        <Button onClick={() => navigate('/marketplace/vendedor/pedidos')}>
          Ver Pedidos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total de Vendas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalVendas)}</div>
            <p className="text-xs text-muted-foreground">pedidos realizados</p>
          </CardContent>
        </Card>

        {/* Receita Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.receitaTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Ticket médio: {formatPrice(stats.ticketMedio)}
            </p>
          </CardContent>
        </Card>

        {/* Produtos Ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <PackagePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.produtosAtivos}</div>
            <p className="text-xs text-muted-foreground">produtos no marketplace</p>
          </CardContent>
        </Card>

        {/* Avaliação */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.avaliacaoMedia.toFixed(1)}</span>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">nota média</p>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pendentes</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {stats.pedidosPendentes}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pagos</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {stats.pedidosPagos}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enviados</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {stats.pedidosEnviados}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Entregues</span>
                <Badge variant="outline" className="bg-muted text-foreground">
                  {stats.pedidosEntregues}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-end justify-between gap-2">
            {graficoExibir.map((item, index) => {
              const altura = (item.valor / valorMaxGrafico) * 100;
              return (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div 
                    className="w-full rounded-t bg-primary transition-all hover:bg-primary/80"
                    style={{ height: `${altura}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-muted-foreground">{item.mes}</span>
                  <span className="text-xs font-medium">{formatPrice(item.valor)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VendedorDashboardPage;