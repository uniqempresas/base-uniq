import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface PedidoItemInput {
  produto_id: number; // me_produto.id (integer)
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
}

export interface CriarPedidoParams {
  clienteNome: string;
  clienteTelefone?: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  canal: string;
  itens?: PedidoItemInput[];
}

export interface CriarPedidoResult {
  success: boolean;
  id?: string;
  error?: string;
}

const FORMA_PAGAMENTO_CODIGO: Record<string, number> = {
  dinheiro: 1,
  cartao_credito: 2,
  cartao_debito: 2,
  pix: 3,
  boleto: 3,
};

export function useCriarPedido() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarPedido = useCallback(
    async (params: CriarPedidoParams): Promise<CriarPedidoResult> => {
      setLoading(true);
      setError(null);

      try {
        // SEM fallback para "primeira empresa". Sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;

        if (!empresaId) {
          throw new Error("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
        }

        // Busca ou cria cliente
        let clienteId: string | null = null;

        if (params.clienteNome.trim()) {
          const { data: clienteExistente } = await supabase
            .from("me_cliente")
            .select("id")
            .eq("nome_cliente", params.clienteNome.trim())
            .eq("empresa_id", empresaId)
            .maybeSingle();

          if (clienteExistente) {
            clienteId = clienteExistente.id;
          } else {
            const { data: novoCliente, error: clienteError } = await supabase
              .from("me_cliente")
              .insert({
                empresa_id: empresaId,
                nome_cliente: params.clienteNome.trim(),
                telefone: params.clienteTelefone || null,
              })
              .select("id")
              .single();

            if (clienteError) {
              console.error("[useCriarPedido] Erro ao criar cliente:", clienteError);
            } else {
              clienteId = novoCliente?.id || null;
            }
          }
        }

        // Insere pedido em me_venda
        const itens = params.itens || [];
        const valorTotal =
          itens.length > 0
            ? itens.reduce((s, i) => s + i.preco_unitario * i.quantidade, 0)
            : params.valor;

        const { data: novaVenda, error: vendaError } = await supabase
          .from("me_venda")
          .insert({
            empresa_id: empresaId,
            cliente_id: clienteId,
            valor_total: valorTotal,
            valor_desconto: 0,
            observacoes: params.descricao,
            status_venda: "pendente",
            forma_pagamento: FORMA_PAGAMENTO_CODIGO[params.formaPagamento] || 3,
            canal_venda: params.canal,
            tipo_venda: "manual",
            possui_nota_fiscal: false,
            foi_devolvida: false,
          })
          .select("id")
          .single();

        if (vendaError) throw vendaError;

        // Grava os itens em me_itens_venda (alimenta DRE / CMV)
        if (itens.length > 0 && novaVenda?.id) {
          const { error: itensError } = await supabase.from("me_itens_venda").insert(
            itens.map((i) => ({
              venda_id: novaVenda.id,
              empresa_id: empresaId,
              produto_id: i.produto_id,
              nome_produto: i.nome_produto,
              quantidade: i.quantidade,
              preco_unitario: i.preco_unitario,
              subtotal: i.preco_unitario * i.quantidade,
              tipo_item: "produto",
            }))
          );

          if (itensError) throw itensError;
        }

        return {
          success: true,
          id: novaVenda?.id,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao criar pedido";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return {
    criarPedido,
    loading,
    error,
  };
}
