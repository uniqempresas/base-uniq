/**
 * VendedorPedidosPage - Lista de pedidos recebidos pelo vendedor
 * Permite filtrar por status e atualizar status
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { useVendedor } from '../../hooks/useVendedor';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import type { Pedido, PedidoStatus } from '../../types/marketplace';

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
 * Formata data
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Badge de status
 */
function StatusBadge({ status }: { status: PedidoStatus }) {
  const config: Record<PedidoStatus, { label: string; colorClass: string }> = {
    pendente: { label: 'Pendente', colorClass: 'bg-amber-100 text-amber-800' },
    pago: { label: 'Pago', colorClass: 'bg-blue-100 text-blue-800' },
    enviado: { label: 'Enviado', colorClass: 'bg-purple-100 text-purple-800' },
    entregue: { label: 'Entregue', colorClass: 'bg-primary text-primary-foreground' },
    cancelado: { label: 'Cancelado', colorClass: 'bg-red-100 text-red-800' },
  };
  
  const { label, colorClass } = config[status];
  
  return (
    <Badge className={colorClass}>
      {label}
    </Badge>
  );
}

/**
 * Card de pedido
 */
function PedidoCard({ 
  pedido, 
  onUpdateStatus 
}: { 
  pedido: Pedido; 
  onUpdateStatus: (pedidoId: string, status: PedidoStatus) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Próximo status disponível
  const getProximoStatus = (): PedidoStatus | null => {
    switch (pedido.status) {
      case 'pendente': return 'pago';
      case 'pago': return 'enviado';
      case 'enviado': return 'entregue';
      default: return null;
    }
  };
  
  const proximoStatus = getProximoStatus();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-sm">#{pedido.id}</p>
            <p className="text-xs text-muted-foreground">{formatDate(pedido.dataPedido)}</p>
          </div>
          <StatusBadge status={pedido.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Cliente */}
        <div className="mb-3">
          <p className="text-sm font-medium">{pedido.clienteNome}</p>
          <p className="text-xs text-muted-foreground">{pedido.clienteEmail}</p>
        </div>
        
        {/* Itens */}
        <div className="space-y-1">
          {pedido.itens.slice(0, showDetails ? undefined : 2).map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantidade}x {item.produtoNome}
              </span>
              <span>{formatPrice(item.precoTotal)}</span>
            </div>
          ))}
          {!showDetails && pedido.itens.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => setShowDetails(true)}
            >
              + {pedido.itens.length - 2} mais itens
            </Button>
          )}
        </div>
        
        <Separator className="my-3" />
        
        {/* Totais */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">{formatPrice(pedido.valorTotal)}</span>
        </div>
        
        {/* Forma de pagamento */}
        <p className="mt-2 text-xs text-muted-foreground">
          Pagamento: {pedido.formaPagamento}
        </p>
        
        {/* Botão de atualizar status */}
        {proximoStatus && (
          <Button
            className="mt-4 w-full"
            size="sm"
            onClick={() => onUpdateStatus(pedido.id, proximoStatus)}
          >
            {proximoStatus === 'pago' && 'Marcar como Pago'}
            {proximoStatus === 'enviado' && 'Marcar como Enviado'}
            {proximoStatus === 'entregue' && 'Marcar como Entregue'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function VendedorPedidosPage() {
  const navigate = useNavigate();
  const { pedidos, loadingPedidos, atualizarStatusPedido } = useVendedor();
  
  const [filtroStatus, setFiltroStatus] = useState<PedidoStatus | 'todos'>('todos');
  
  // Filtrar pedidos
  const pedidosFiltrados = filtroStatus === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === filtroStatus);
    
  // Contadores
  const totalPedidos = pedidos.length;
  const pendentes = pedidos.filter(p => p.status === 'pendente').length;
  const pagos = pedidos.filter(p => p.status === 'pago').length;
  const enviados = pedidos.filter(p => p.status === 'enviado').length;
  const entregues = pedidos.filter(p => p.status === 'entregue').length;

  const handleUpdateStatus = async (pedidoId: string, status: PedidoStatus) => {
    await atualizarStatusPedido(pedidoId, status);
  };

  if (loadingPedidos) {
    return (
      <div className="container mx-auto space-y-6 py-6">
        <Skeleton className="h-12" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            className="mb-2 gap-2 px-0"
            onClick={() => navigate('/marketplace/vendedor')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Pedidos Recebidos</h1>
          <p className="text-muted-foreground">
            Gerencie os pedidos dos seus clientes
          </p>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Button
          variant={filtroStatus === 'todos' ? 'default' : 'outline'}
          className="h-auto justify-start gap-2 p-4"
          onClick={() => setFiltroStatus('todos')}
        >
          <div className="text-left">
            <p className="text-2xl font-bold">{totalPedidos}</p>
            <p className="text-xs">Total</p>
          </div>
        </Button>
        
        <Button
          variant={filtroStatus === 'pendente' ? 'secondary' : 'outline'}
          className="h-auto justify-start gap-2 p-4"
          onClick={() => setFiltroStatus('pendente')}
        >
          <div className="text-left">
            <p className="text-2xl font-bold">{pendentes}</p>
            <p className="text-xs">Pendentes</p>
          </div>
        </Button>
        
        <Button
          variant={filtroStatus === 'pago' ? 'secondary' : 'outline'}
          className="h-auto justify-start gap-2 p-4"
          onClick={() => setFiltroStatus('pago')}
        >
          <div className="text-left">
            <p className="text-2xl font-bold">{pagos}</p>
            <p className="text-xs">Pagos</p>
          </div>
        </Button>
        
        <Button
          variant={filtroStatus === 'enviado' ? 'secondary' : 'outline'}
          className="h-auto justify-start gap-2 p-4"
          onClick={() => setFiltroStatus('enviado')}
        >
          <div className="text-left">
            <p className="text-2xl font-bold">{enviados}</p>
            <p className="text-xs">Enviados</p>
          </div>
        </Button>
        
        <Button
          variant={filtroStatus === 'entregue' ? 'secondary' : 'outline'}
          className="h-auto justify-start gap-2 p-4"
          onClick={() => setFiltroStatus('entregue')}
        >
          <div className="text-left">
            <p className="text-2xl font-bold">{entregues}</p>
            <p className="text-xs">Entregues</p>
          </div>
        </Button>
      </div>

      {/* Lista de Pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Nenhum pedido encontrado</h2>
            <p className="text-muted-foreground">
              {filtroStatus === 'todos' 
                ? 'Você ainda não recebeu nenhum pedido'
                : `Nenhum pedido com status "${filtroStatus}"`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pedidosFiltrados.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default VendedorPedidosPage;