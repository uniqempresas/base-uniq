import { useCallback, useEffect, useMemo, useState } from "react";
import type { ItemCarrinhoLoja, ProdutoLoja } from "../types/loja";

/**
 * Carrinho da loja virtual — chave localStorage `uniq_loja_carrinho_<slug>`
 * (isolada por loja; NÃO reusa o `useCarrinho` do marketplace).
 * O `precoSnapshot` é apenas exibição — a gravação usa os dados canônicos do banco.
 */
const PREFIXO_STORAGE = "uniq_loja_carrinho_";

export function useCarrinhoLoja(slug: string | undefined) {
  const storageKey = slug ? `${PREFIXO_STORAGE}${slug}` : null;
  const [itens, setItens] = useState<ItemCarrinhoLoja[]>([]);
  /** true após a primeira leitura do localStorage (evita redirect prematuro no checkout) */
  const [carregado, setCarregado] = useState(!storageKey);

  // Carrega do localStorage sempre que trocar de loja
  useEffect(() => {
    if (!storageKey) {
      setItens([]);
      setCarregado(true);
      return;
    }
    try {
      const armazenado = localStorage.getItem(storageKey);
      if (armazenado) {
        const dados = JSON.parse(armazenado) as unknown;
        if (Array.isArray(dados)) {
          setItens(
            dados.filter(
              (i): i is ItemCarrinhoLoja =>
                !!i && typeof i.produtoId === "number" && typeof i.quantidade === "number"
            )
          );
          setCarregado(true);
          return;
        }
      }
      setItens([]);
      setCarregado(true);
    } catch (e) {
      console.error("[useCarrinhoLoja] Erro ao carregar carrinho:", e);
      setItens([]);
      setCarregado(true);
    }
  }, [storageKey]);

  // Persiste
  useEffect(() => {
    if (!storageKey) return;
    try {
      if (itens.length === 0) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(itens));
      }
    } catch (e) {
      console.error("[useCarrinhoLoja] Erro ao salvar carrinho:", e);
    }
  }, [itens, storageKey]);

  /** Produto esgotado não entra no carrinho (botão desabilitado na vitrine/produto) */
  const adicionar = useCallback((produto: ProdutoLoja, quantidade: number = 1) => {
    if (!produto || produto.esgotado || produto.estoque <= 0) return;
    const qtd = Math.max(1, Math.min(produto.estoque, quantidade));
    setItens(prev => {
      const existente = prev.find(i => i.produtoId === produto.id);
      if (existente) {
        return prev.map(i =>
          i.produtoId === produto.id
            ? {
                ...i,
                quantidade: Math.min(produto.estoque, i.quantidade + qtd),
                precoSnapshot: produto.preco,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          produtoId: produto.id,
          nome: produto.nome,
          precoSnapshot: produto.preco,
          fotoUrl: produto.fotoUrl,
          quantidade: qtd,
        },
      ];
    });
  }, []);

  const remover = useCallback((produtoId: number) => {
    setItens(prev => prev.filter(i => i.produtoId !== produtoId));
  }, []);

  /** Mín. 1; `estoqueMax` opcional limita ao estoque conhecido */
  const alterarQuantidade = useCallback((produtoId: number, quantidade: number, estoqueMax?: number) => {
    setItens(prev =>
      prev
        .map(i => {
          if (i.produtoId !== produtoId) return i;
          const qtd = Math.max(1, quantidade);
          return { ...i, quantidade: estoqueMax !== undefined ? Math.min(estoqueMax, qtd) : qtd };
        })
        .filter(i => i.quantidade > 0)
    );
  }, []);

  const limpar = useCallback(() => {
    setItens([]);
  }, []);

  const temItem = useCallback((produtoId: number) => itens.some(i => i.produtoId === produtoId), [itens]);

  const totalSnapshot = useMemo(() => itens.reduce((s, i) => s + i.precoSnapshot * i.quantidade, 0), [itens]);

  const quantidadeTotal = useMemo(() => itens.reduce((s, i) => s + i.quantidade, 0), [itens]);

  return {
    itens,
    carregado,
    adicionar,
    remover,
    alterarQuantidade,
    limpar,
    temItem,
    totalSnapshot,
    quantidadeTotal,
  };
}