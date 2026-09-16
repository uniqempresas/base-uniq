import { useCallback, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { DadosCheckoutLoja, ItemCarrinhoLoja, ResumoPedidoLoja } from "../types/loja";
import { normalizarTelefoneLoja } from "../components/loja/lojaMockData";

/** Produto com dados canônicos do banco (anti-fraude) */
export interface ProdutoCanonico {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
}

export interface ItemErroEstoque {
  produtoId: number;
  nome: string;
  estoqueDisponivel: number;
  quantidade: number;
}

export interface CriarPedidoLojaParams {
  empresaId: string;
  nomeCliente: string;
  /** telefone digitado (com máscara) — normalizado dentro do hook */
  telefone: string;
  dados: DadosCheckoutLoja;
  /** snapshot do carrinho — usado apenas para mapear itens; preço/id canônicos vêm do banco */
  itens: ItemCarrinhoLoja[];
}

export interface CriarPedidoLojaResult {
  success: boolean;
  resumo?: ResumoPedidoLoja;
  /** estoque insuficiente: NÃO chamou a RPC */
  errosEstoque?: ItemErroEstoque[];
  /** algum preço do banco difere do snapshot exibido na vitrine */
  precoAtualizado?: boolean;
  erro?: string;
}

/**
 * Re-resolve id/preço/estoque no banco ANTES da RPC (SPEC §2.5 anti-fraude).
 * Exportada para o checkout recalcular o resumo com preços canônicos.
 */
export async function buscarProdutosCanonicos(empresaId: string, ids: number[]): Promise<ProdutoCanonico[]> {
  if (!empresaId || ids.length === 0) return [];

  const { data, error } = await supabase
    .from("me_produto")
    .select("id, nome_produto, preco, estoque_atual")
    .eq("empresa_id", empresaId)
    .in("id", ids);

  if (error) throw error;

  const linhas = (data as { id: number; nome_produto: string | null; preco: number | null; estoque_atual: number | null }[] | null) || [];

  return linhas.map(r => ({
    id: Number(r.id),
    nome: r.nome_produto || "Sem nome",
    preco: Number(r.preco) || 0,
    estoque: Number(r.estoque_atual) || 0,
  }));
}

function enderecoFormatado(dados: DadosCheckoutLoja): string {
  const linhas = [
    `Entrega: ${dados.endereco}, ${dados.numero}`,
    dados.complemento ? `Complemento: ${dados.complemento}` : "",
    `${dados.bairro} — ${dados.cidade}/${dados.estado}`,
    `CEP: ${dados.cep}`,
  ].filter(Boolean);
  return dados.observacoes ? `${linhas.join("\n")}\nObservações: ${dados.observacoes}` : linhas.join("\n");
}

/**
 * Find-or-create cliente por telefone normalizado + RPC `registrar_venda`
 * com `p_origem='loja'`, `p_status='confirmada'` e vencimento = hoje.
 * NUNCA grava em modo fallback/mock — erro = mensagem + WhatsApp (tela trata).
 */
export function useLojaCriarPedido() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarPedido = useCallback(async (params: CriarPedidoLojaParams): Promise<CriarPedidoLojaResult> => {
    setLoading(true);
    setError(null);

    try {
      if (!params.empresaId) throw new Error("Loja não identificada.");
      if (params.itens.length === 0) throw new Error("Seu carrinho está vazio.");

      const telefoneNormalizado = normalizarTelefoneLoja(params.telefone);
      if (!telefoneNormalizado) throw new Error("Telefone inválido.");

      // ── 1. Find-or-create cliente (SPEC §2.3) ─────────────────────────
      let clienteId: string | null = null;

      const { data: clienteExistente, error: lookupErr } = await supabase
        .from("me_cliente")
        .select("id, nome_cliente")
        .eq("empresa_id", params.empresaId)
        .eq("telefone", telefoneNormalizado)
        .maybeSingle();

      if (lookupErr) throw lookupErr;

      const enderecoNovo = {
        cep: params.dados.cep,
        endereco: params.dados.endereco,
        numero: params.dados.numero,
        complemento: params.dados.complemento,
        bairro: params.dados.bairro,
        cidade: params.dados.cidade,
        estado: params.dados.estado,
      };

      if (clienteExistente) {
        clienteId = clienteExistente.id;
        // Encontrado → ATUALIZA só os campos de endereço novos (não toca legados)
        const { error: updateErr } = await supabase
          .from("me_cliente")
          .update(enderecoNovo)
          .eq("id", clienteId)
          .eq("empresa_id", params.empresaId);
        if (updateErr) throw updateErr;
      } else {
        const { data: novoCliente, error: insertErr } = await supabase
          .from("me_cliente")
          .insert({
            empresa_id: params.empresaId,
            nome_cliente: params.nomeCliente.trim(),
            telefone: telefoneNormalizado,
            origem: "loja",
            tags: [],
            ...enderecoNovo,
          })
          .select("id")
          .single();
        if (insertErr) throw insertErr;
        clienteId = novoCliente?.id || null;
      }

      if (!clienteId) throw new Error("Não foi possível identificar o cliente.");

      // ── 2. ANTI-FRAUDE: re-resolve preços/estoques canônicos (SPEC §2.5) ──
      const ids = params.itens.map(i => i.produtoId);
      const canonicos = await buscarProdutosCanonicos(params.empresaId, ids);

      // Item que desapareceu do banco → erro de estoque (0 disponível)
      const indisponiveis = params.itens.filter(i => !canonicos.some(c => c.id === i.produtoId));
      if (indisponiveis.length > 0) {
        return {
          success: false,
          errosEstoque: indisponiveis.map(i => ({ produtoId: i.produtoId, nome: i.nome, estoqueDisponivel: 0, quantidade: i.quantidade })),
        };
      }

      const pItens = params.itens.map(i => {
        const c = canonicos.find(p => p.id === i.produtoId)!;
        return {
          tipo: "produto" as const,
          id_referencia: c.id,
          nome: c.nome,
          quantidade: i.quantidade,
          preco_unitario: c.preco,
        };
      });

      // Estoque insuficiente → NÃO chamar a RPC; erro por item (modal na tela)
      const errosEstoque = params.itens.flatMap(i => {
        const c = canonicos.find(p => p.id === i.produtoId)!;
        if (c.estoque < i.quantidade) {
          return [{ produtoId: c.id, nome: c.nome, estoqueDisponivel: c.estoque, quantidade: i.quantidade }];
        }
        return [];
      });
      if (errosEstoque.length > 0) {
        return { success: false, errosEstoque };
      }

      // Preço mudou desde a vitrine → usar o do banco e avisar
      const precoAtualizado = params.itens.some(i => {
        const c = canonicos.find(p => p.id === i.produtoId)!;
        return c.preco !== i.precoSnapshot;
      });

      const valorTotal = pItens.reduce((s, i) => s + i.preco_unitario * i.quantidade, 0);

      // ── 3. RPC registrar_venda (SPEC §2.4) ────────────────────────────
      const hoje = new Date().toISOString().split("T")[0];

      const { data, error: rpcError } = await supabase.rpc("registrar_venda", {
        p_empresa_id: params.empresaId,
        p_cliente_id: clienteId,
        p_valor_total: valorTotal,
        p_forma_pagamento: params.dados.formaPagamento, // 'Pix' | 'Dinheiro'
        p_data_vencimento: hoje,
        p_status: "confirmada",
        p_origem: "loja",
        p_itens: pItens,
        p_observacoes: enderecoFormatado(params.dados),
      });

      if (rpcError) throw rpcError;

      const resultado = (data as { success?: boolean; id_venda?: string; id?: string; valor_total?: number }) || {};
      const idVenda = resultado.id_venda || resultado.id || "";

      return {
        success: true,
        precoAtualizado,
        resumo: {
          idVenda,
          valorTotal: Number(resultado.valor_total) || valorTotal,
          itens: pItens.map(i => ({ nome: i.nome, quantidade: i.quantidade, precoUnitario: i.preco_unitario })),
          formaPagamento: params.dados.formaPagamento,
        },
      };
    } catch (e) {
      console.error("[useLojaCriarPedido] Erro ao registrar pedido:", e);
      const msg = e instanceof Error ? e.message : "Erro ao registrar pedido";
      setError(msg);
      return { success: false, erro: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { criarPedido, loading, error };
}