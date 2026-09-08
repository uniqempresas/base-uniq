/**
 * Hook useMarketplace - Gerenciamento do marketplace
 * Fornece acesso aos lojistas, produtos e funções de filtro
 */

import { useState, useCallback, useMemo } from 'react';
import type { Lojista, Produto, FilterOptions, PedidoStatus } from '../types/marketplace';
import {
  mockLojistas,
  mockProdutos,
  getLojistaById,
  getLojistaBySlug,
  getProdutosByLojista,
  filtrarProdutos,
  getCategorias,
} from '../lib/mocks/marketplace';

// Delay simulado para API
const SIMULATED_DELAY = 300;

interface UseMarketplaceReturn {
  // Lojistas
  lojistas: Lojista[];
  loadingLojistas: boolean;
  erroLojistas: string | null;
  getLojistaById: (id: string) => Lojista | undefined;
  getLojistaBySlug: (slug: string) => Lojista | undefined;
  
  // Produtos
  produtos: Produto[];
  loadingProdutos: boolean;
  erroProdutos: string | null;
  getProdutosByLojista: (lojistaId: string) => Produto[];
  getProdutosDestaque: () => Produto[];
  getProdutosEmEstoque: () => Produto[];
  
  // Filtros
  categorias: string[];
  filtrosAtuais: FilterOptions;
  loadingFiltros: boolean;
  aplicarFiltros: (filtros: FilterOptions) => void;
  limparFiltros: () => void;
  
  // Utilitários
  refetch: () => void;
}

export function useMarketplace(): UseMarketplaceReturn {
  // Estado dos lojistas
  const [lojistas, setLojistas] = useState<Lojista[]>([]);
  const [loadingLojistas, setLoadingLojistas] = useState(true);
  const [erroLojistas, setErroLojistas] = useState<string | null>(null);
  
  // Estado dos produtos
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [erroProdutos, setErroProdutos] = useState<string | null>(null);
  
  // Estado dos filtros
  const [filtrosAtuais, setFiltrosAtuais] = useState<FilterOptions>({});
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  
  // Função para carregar lojistas
  const fetchLojistas = useCallback(async () => {
    setLoadingLojistas(true);
    setErroLojistas(null);
    
    try {
      // Simula chamada de API
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
      setLojistas(mockLojistas);
    } catch (error) {
      setErroLojistas('Erro ao carregar lojistas');
    } finally {
      setLoadingLojistas(false);
    }
  }, []);
  
  // Função para carregar produtos
  const fetchProdutos = useCallback(async () => {
    setLoadingProdutos(true);
    setErroProdutos(null);
    
    try {
      // Simula chamada de API
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
      setProdutos(mockProdutos);
    } catch (error) {
      setErroProdutos('Erro ao carregar produtos');
    } finally {
      setLoadingProdutos(false);
    }
  }, []);
  
  // Carregar dados iniciais
  useState(() => {
    fetchLojistas();
    fetchProdutos();
  });
  
  // Função para obter lojista por ID
  const getLojistaByIdFn = useCallback((id: string): Lojista | undefined => {
    return getLojistaById(id);
  }, []);
  
  // Função para obter lojista por slug
  const getLojistaBySlugFn = useCallback((slug: string): Lojista | undefined => {
    return getLojistaBySlug(slug);
  }, []);
  
  // Função para obter produtos de um lojista
  const getProdutosByLojistaFn = useCallback((lojistaId: string): Produto[] => {
    return getProdutosByLojista(lojistaId);
  }, []);
  
  // Função para obter produtos em destaque
  const getProdutosDestaque = useCallback((): Produto[] => {
    return produtos.filter((p) => p.destaque && p.status === 'ativo');
  }, [produtos]);
  
  // Função para obter produtos em estoque
  const getProdutosEmEstoque = useCallback((): Produto[] => {
    return produtos.filter((p) => p.estoque > 0 && p.status === 'ativo');
  }, [produtos]);
  
  // Lista de categorias
  const categorias = useMemo(() => getCategorias(), []);
  
  // Função para aplicar filtros
  const aplicarFiltros = useCallback((filtros: FilterOptions) => {
    setLoadingFiltros(true);
    
    try {
      const produtosFiltrados = filtrarProdutos(filtros);
      setProdutos(produtosFiltrados);
      setFiltrosAtuais(filtros);
    } finally {
      setLoadingFiltros(false);
    }
  }, []);
  
  // Função para limpar filtros
  const limparFiltros = useCallback(() => {
    setLoadingFiltros(true);
    
    try {
      setProdutos(mockProdutos);
      setFiltrosAtuais({});
    } finally {
      setLoadingFiltros(false);
    }
  }, []);
  
  // Função para recarregar dados
  const refetch = useCallback(() => {
    fetchLojistas();
    fetchProdutos();
  }, [fetchLojistas, fetchProdutos]);
  
  return {
    // Lojistas
    lojistas,
    loadingLojistas,
    erroLojistas,
    getLojistaById: getLojistaByIdFn,
    getLojistaBySlug: getLojistaBySlugFn,
    
    // Produtos
    produtos,
    loadingProdutos,
    erroProdutos,
    getProdutosByLojista: getProdutosByLojistaFn,
    getProdutosDestaque,
    getProdutosEmEstoque,
    
    // Filtros
    categorias,
    filtrosAtuais,
    loadingFiltros,
    aplicarFiltros,
    limparFiltros,
    
    // Utilitários
    refetch,
  };
}

export default useMarketplace;