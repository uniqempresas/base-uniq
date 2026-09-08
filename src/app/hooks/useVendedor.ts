/**
 * Hook useVendedor - Painel do vendedor (seller dashboard)
 * Fornece estatísticas, pedidos recebidos e funções de gerenciamento
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Pedido, PedidoStatus, VendedorStats } from '../types/marketplace';
import { mockPedidos, getProdutosByLojista, getLojistaById } from '../lib/mocks/marketplace';

// Delay simulado para API
const SIMULATED_DELAY = 300;

// ID do lojista atual (simulado - em produção viria do contexto de auth)
const LOJISTA_ATUAL_ID = 'lojista-001';

interface UseVendedorReturn {
  // Estatísticas
  stats: VendedorStats | null;
  loadingStats: boolean;
  erroStats: string | null;
  
  // Pedidos
  pedidos: Pedido[];
  loadingPedidos: boolean;
  erroPedidos: string | null;
  
  // Ações
  atualizarStatusPedido: (pedidoId: string, status: PedidoStatus) => Promise<void>;
  getPedidosPorStatus: (status: PedidoStatus) => Pedido[];
  
  // Utilitários
  refetch: () => void;
  getPedidoById: (pedidoId: string) => Pedido | undefined;
}

/**
 * Hook para gerenciar o painel do vendedor
 */
export function useVendedor(): UseVendedorReturn {
  // Estado das estatísticas
  const [stats, setStats] = useState<VendedorStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [erroStats, setErroStats] = useState<string | null>(null);
  
  // Estado dos pedidos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [erroPedidos, setErroPedidos] = useState<string | null>(null);
  
  // Função para buscar estatísticas
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setErroStats(null);
    
    try {
      // Simula chamada de API
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
      
      // Filtrar pedidos do lojista atual (simulado)
      const pedidosDoLojista = mockPedidos.filter((pedido) => {
        // Em produção, verificaria se o pedido contém itens do lojista atual
        // Por agora, retorna todos os pedidos como exemplo
        return true;
      });
      
      // Calcular estatísticas
      const totalVendas = pedidosDoLojista
        .filter((p) => p.status !== 'cancelado' && p.status !== 'pendente')
        .reduce((total, p) => total + p.valorTotal, 0);
      
      const receitaTotal = pedidosDoLojista
        .filter((p) => p.status === 'pago' || p.status === 'enviado' || p.status === 'entregue')
        .reduce((total, p) => total + p.valorTotal, 0);
      
      const pedidosPendentes = pedidosDoLojista.filter((p) => p.status === 'pendente').length;
      const pedidosPagos = pedidosDoLojista.filter((p) => p.status === 'pago').length;
      const pedidosEnviados = pedidosDoLojista.filter((p) => p.status === 'enviado').length;
      const pedidosEntregues = pedidosDoLojista.filter((p) => p.status === 'entregue').length;
      
      const lojista = getLojistaById(LOJISTA_ATUAL_ID);
      const produtosDoLojista = getProdutosByLojista(LOJISTA_ATUAL_ID);
      const produtosAtivos = produtosDoLojista.filter((p) => p.status === 'ativo').length;
      
      const valorMedioPedido = pedidosDoLojista.length > 0 
        ? totalVendas / pedidosDoLojista.length 
        : 0;
      
      const novasStats: VendedorStats = {
        totalVendas: pedidosDoLojista.length,
        pedidosPendentes,
        pedidosPagos,
        pedidosEnviados,
        pedidosEntregues,
        receitaTotal,
        ticketMedio: Math.round(valorMedioPedido),
        produtosAtivos,
        avaliacaoMedia: lojista?.nota || 0,
        graficoVendas: [
          { mes: 'Jan', valor: 125000 },
          { mes: 'Fev', valor: 98000 },
          { mes: 'Mar', valor: 156000 },
          { mes: 'Abr', valor: 187000 },
          { mes: 'Mai', valor: 142000 },
          { mes: 'Jun', valor: 210000 },
          { mes: 'Jul', valor: 198000 },
          { mes: 'Ago', valor: 234000 },
          { mes: 'Set', valor: 189000 },
          { mes: 'Out', valor: 267000 },
          { mes: 'Nov', valor: 312000 },
          { mes: 'Dez', valor: 0 }, // mês atual incompleto
        ],
      };
      
      setStats(novasStats);
    } catch (error) {
      setErroStats('Erro ao carregar estatísticas');
    } finally {
      setLoadingStats(false);
    }
  }, []);
  
  // Função para buscar pedidos
  const fetchPedidos = useCallback(async () => {
    setLoadingPedidos(true);
    setErroPedidos(null);
    
    try {
      // Simula chamada de API
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
      
      // Em produção, filtraria apenas pedidos do lojista atual
      setPedidos(mockPedidos);
    } catch (error) {
      setErroPedidos('Erro ao carregar pedidos');
    } finally {
      setLoadingPedidos(false);
    }
  }, []);
  
  // Carregar dados iniciais
  useEffect(() => {
    fetchStats();
    fetchPedidos();
  }, [fetchStats, fetchPedidos]);
  
  // Função para atualizar status do pedido
  const atualizarStatusPedido = useCallback(async (pedidoId: string, novoStatus: PedidoStatus) => {
    // Simula chamada de API
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
    
    setPedidos((currentPedidos) =>
      currentPedidos.map((pedido) =>
        pedido.id === pedidoId
          ? { ...pedido, status: novoStatus }
          : pedido
      )
    );
  }, []);
  
  // Função para filtrar pedidos por status
  const getPedidosPorStatusFn = useCallback((status: PedidoStatus): Pedido[] => {
    return pedidos.filter((pedido) => pedido.status === status);
  }, [pedidos]);
  
  // Função para obter um pedido específico
  const getPedidoById = useCallback((pedidoId: string): Pedido | undefined => {
    return pedidos.find((pedido) => pedido.id === pedidoId);
  }, [pedidos]);
  
  // Função para recarregar dados
  const refetch = useCallback(() => {
    fetchStats();
    fetchPedidos();
  }, [fetchStats, fetchPedidos]);
  
  return {
    // Estatísticas
    stats,
    loadingStats,
    erroStats,
    
    // Pedidos
    pedidos,
    loadingPedidos,
    erroPedidos,
    
    // Ações
    atualizarStatusPedido,
    getPedidosPorStatus: getPedidosPorStatusFn,
    
    // Utilitários
    refetch,
    getPedidoById,
  };
}

export default useVendedor;