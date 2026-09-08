/**
 * Hook para Catálogo Público de Serviços
 * Versão pública - apenas leitura de serviços ativos
 */

import { useState, useCallback, useMemo } from 'react';
import { Servico, CategoriaServico } from '../types/servicos';
import { mockServicos, mockCategorias } from '../lib/mocks/servicos';

// Delay simulado
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(400 + Math.random() * 400);

export interface UseCatalogoReturn {
  servicos: Servico[];
  isLoading: boolean;
  error: string | null;
  categorias: { value: CategoriaServico; label: string }[];
  filterByCategory: (categoria: CategoriaServico | null) => void;
  categoriaAtiva: CategoriaServico | null;
  refresh: () => Promise<void>;
}

export function useCatalogo(): UseCatalogoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaServico | null>(null);

  // Filtra apenas serviços ativos (ativo ou destaque)
  const servicosAtivos = useMemo(() => {
    return mockServicos.filter((s) => s.status === 'ativo' || s.status === 'destaque');
  }, []);

  // Servicios filtrados por categoria
  const servicosFiltrados = useMemo(() => {
    if (!categoriaAtiva) return servicosAtivos;
    return servicosAtivos.filter((s) => s.categoria === categoriaAtiva);
  }, [servicosAtivos, categoriaAtiva]);

  // Lista de categorias disponíveis (apenas as que têm serviços)
  const categoriasDisponiveis = useMemo(() => {
    const catsComServicos = new Set(servicosAtivos.map((s) => s.categoria));
    return mockCategorias
      .filter((c) => catsComServicos.has(c.value))
      .map((c) => ({ value: c.value, label: c.label }));
  }, [servicosAtivos]);

  const filterByCategory = useCallback((categoria: CategoriaServico | null) => {
    setCategoriaAtiva(categoria);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await randomDelay();
      // Recarrega dados (aqui apenas retorna os mesmos mock data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar catálogo';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    servicos: servicosFiltrados,
    isLoading,
    error,
    categorias: categoriasDisponiveis,
    filterByCategory,
    categoriaAtiva,
    refresh,
  };
}