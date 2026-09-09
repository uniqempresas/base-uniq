import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface CriarPedidoParams {
  clienteNome: string;
  clienteTelefone?: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  canal: string;
}

export interface CriarPedidoResult {
  success: boolean;
  id?: string;
  error?: string;
}

const FORMA_PAGAMENTO_CODIGO: Record<string, number> = {
  dinheiro: 1,
  pix: 2,
  cartao_credito: 3,
  cartao_debito: 4,
  boleto: 5,
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
        // Busca empresa_id do contexto ou primeira disponível
        let empresaId = empresa?.id;

        if (!empresaId) {
          const { data: empresas } = await supabase
            .from("me_empresa")
            .select("id")
            .limit(1);

          if (empresas && empresas.length > 0) {
            empresaId = empresas[0].id;
          }
        }

        if (!empresaId) {
          throw new Error("Empresa não encontrada");
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
        const { data: novaVenda, error: vendaError } = await supabase
          .from("me_venda")
          .insert({
            empresa_id: empresaId,
            cliente_id: clienteId,
            valor_total: params.valor,
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
