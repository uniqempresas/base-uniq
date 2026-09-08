/**
 * Hook para gestão de Serviços (CRUD)
 */

import { useState, useCallback } from 'react';
import { Servico, ServicoFormData } from '../types/servicos';
import { mockServicos } from '../lib/mocks/servicos';

// Delay simulado para operações
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Intervalo delay 400-800ms
const randomDelay = () => delay(400 + Math.random() * 400);

export interface UseServicosReturn {
  servicos: Servico[];
  isLoading: boolean;
  error: string | null;
  getAll: () => Promise<Servico[]>;
  getById: (id: string) => Promise<Servico | null>;
  create: (data: ServicoFormData) => Promise<Servico>;
  update: (id: string, data: ServicoFormData) => Promise<Servico>;
  remove: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
}

export function useServicos(): UseServicosReturn {
  const [servicos, setServicos] = useState<Servico[]>([...mockServicos]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => `srv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getAll = useCallback(async (): Promise<Servico[]> => {
    setIsLoading(true);
    setError(null);
    try {
      await randomDelay();
      return [...servicos];
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar serviços';
      setError(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [servicos]);

  const getById = useCallback(async (id: string): Promise<Servico | null> => {
    setIsLoading(true);
    setError(null);
    try {
      await randomDelay();
      return servicos.find((s) => s.id === id) || null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao buscar serviço';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [servicos]);

  const create = useCallback(async (data: ServicoFormData): Promise<Servico> => {
    setIsLoading(true);
    setError(null);
    try {
      await randomDelay();
      const now = new Date().toISOString();
      const novoServico: Servico = {
        id: generateId(),
        ...data,
        profissionaisIds: data.profissionaisIds || [],
        destaque: data.destaque || false,
        criadoEm: now,
        atualizadoEm: now,
      };
      setServicos((prev) => [...prev, novoServico]);
      return novoServico;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar serviço';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: ServicoFormData): Promise<Servico> => {
    setIsLoading(true);
    setError(null);
    try {
      await randomDelay();
      const index = servicos.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Serviço não encontrado');

      const atualizado: Servico = {
        ...servicos[index],
        ...data,
        profissionaisIds: data.profissionaisIds || [],
        destaque: data.destaque || false,
        atualizadoEm: new Date().toISOString(),
      };

      setServicos((prev) => {
        const copy = [...prev];
        copy[index] = atualizado;
        return copy;
      });

      return atualizado;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao atualizar serviço';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [servicos]);

  const remove = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await randomDelay();
      setServicos((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao excluir serviço';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleStatus = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await randomDelay();
      setServicos((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const novoStatus = s.status === 'ativo' ? 'inativo' : 'ativo';
          return { ...s, status: novoStatus, atualizadoEm: new Date().toISOString() };
        })
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao alterar status';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    servicos,
    isLoading,
    error,
    getAll,
    getById,
    create,
    update,
    remove,
    toggleStatus,
  };
}