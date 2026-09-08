/**
 * Hook useCarrinho - Gerenciamento do carrinho de compras
 * Carrinho unificado com múltiplos lojistas e persistência localStorage
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { CarrinhoItem, CarrinhoAgrupado, Produto, Lojista } from '../types/marketplace';
import { getLojistaById, getProdutoById } from '../lib/mocks/marketplace';

const STORAGE_KEY = 'uniq_marketplace_carrinho';
const FRETE_POR_LOJISTA = 1590; // R$ 15,90 em centavos

interface CarrinhoStorage {
  itens: Array<{
    produtoId: string;
    quantidade: number;
  }>;
  atualizadoEm: string;
}

/**
 * Hook para gerenciar o carrinho de compras do marketplace
 */
export function useCarrinho() {
  // Estado dos itens do carrinho
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  
  // Carregar do localStorage ao inicializar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: CarrinhoStorage = JSON.parse(stored);
        
        // Reconstituir itens do carrinho com dados completos do produto/lojista
        const itensReconstituidos: CarrinhoItem[] = data.itens
          .map((item) => {
            const produto = getProdutoById(item.produtoId);
            if (!produto) return null;
            
            const lojista = getLojistaById(produto.lojistaId);
            if (!lojista) return null;
            
            return {
              produtoId: item.produtoId,
              lojistaId: produto.lojistaId,
              quantidade: item.quantidade,
              produto,
              lojista,
            };
          })
          .filter((item): item is CarrinhoItem => item !== null);
        
        setItens(itensReconstituidos);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
    }
  }, []);
  
  // Salvar no localStorage quando houver mudanças
  useEffect(() => {
    try {
      const data: CarrinhoStorage = {
        itens: itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
        atualizadoEm: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }, [itens]);
  
  // Verificar se um produto está no carrinho
  const temItem = useCallback((produtoId: string): boolean => {
    return itens.some((item) => item.produtoId === produtoId);
  }, [itens]);
  
  // Adicionar item ao carrinho
  const adicionarItem = useCallback((produto: Produto, quantidade: number = 1) => {
    const lojista = getLojistaById(produto.lojistaId);
    if (!lojista) return;
    
    setItens((currentItens) => {
      // Verificar se o produto já existe no carrinho
      const itemExistente = currentItens.find(
        (item) => item.produtoId === produto.id
      );
      
      if (itemExistente) {
        // Atualizar quantidade
        return currentItens.map((item) =>
          item.produtoId === produto.id
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        );
      }
      
      // Adicionar novo item
      const novoItem: CarrinhoItem = {
        produtoId: produto.id,
        lojistaId: produto.lojistaId,
        quantidade,
        produto,
        lojista,
      };
      
      return [...currentItens, novoItem];
    });
  }, []);
  
  // Remover item do carrinho
  const removerItem = useCallback((produtoId: string) => {
    setItens((currentItens) =>
      currentItens.filter((item) => item.produtoId !== produtoId)
    );
  }, []);
  
  // Atualizar quantidade de um item
  const atualizarQuantidade = useCallback((produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      // Se quantidade for 0 ou negativa, remove o item
      setItens((currentItens) =>
        currentItens.filter((item) => item.produtoId !== produtoId)
      );
      return;
    }
    
    setItens((currentItens) =>
      currentItens.map((item) =>
        item.produtoId === produtoId
          ? { ...item, quantidade }
          : item
      )
    );
  }, []);
  
  // Limpar carrinho completamente
  const limparCarrinho = useCallback(() => {
    setItens([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  
  // Itens agrupados por lojista
  const itensAgrupados = useMemo((): CarrinhoAgrupado[] => {
    // Agrupar por lojista
    const agrupados = new Map<string, CarrinhoItem[]>();
    
    itens.forEach((item) => {
      const existing = agrupados.get(item.lojistaId) || [];
      agrupados.set(item.lojistaId, [...existing, item]);
    });
    
    // Converter para array de CarrinhoAgrupado
    const result: CarrinhoAgrupado[] = [];
    
    agrupados.forEach((itensDoLojista, lojistaId) => {
      const lojista = itensDoLojista[0].lojista;
      
      // Calcular subtotal do lojista
      const subtotal = itensDoLojista.reduce((total, item) => {
        const preco = item.produto.precoPromocional || item.produto.preco;
        return total + preco * item.quantidade;
      }, 0);
      
      // Calcular freight (frete Grátis se qualquer produto tiver)
      const temFreteGratis = itensDoLojista.some(
        (item) => item.produto.freightGratis
      );
      const freight = temFreteGratis ? 0 : FRETE_POR_LOJISTA;
      
      result.push({
        lojista,
        itens: itensDoLojista,
        subtotal,
        freight,
      });
    });
    
    return result;
  }, [itens]);
  
  // Quantidade total de itens
  const quantidadeTotal = useMemo(() => {
    return itens.reduce((total, item) => total + item.quantidade, 0);
  }, [itens]);
  
  // Subtotal geral (sem frete)
  const subtotalGeral = useMemo(() => {
    return itens.reduce((total, item) => {
      const preco = item.produto.precoPromocional || item.produto.preco;
      return total + preco * item.quantidade;
    }, 0);
  }, [itens]);
  
  // Freight geral (soma do freight de cada lojista)
  const freightGeral = useMemo(() => {
    return itensAgrupados.reduce((total, grupo) => total + grupo.freight, 0);
  }, [itensAgrupados]);
  
  // Valor total (subtotal + freight)
  const valorTotal = subtotalGeral + freightGeral;
  
  return {
    // Itens
    itens,
    itensAgrupados,
    
    // Totais
    quantidadeTotal,
    subtotalGeral,
    freightGeral,
    valorTotal,
    
    // Ações
    adicionarItem,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    
    // Utilitários
    temItem,
  };
}

export default useCarrinho;