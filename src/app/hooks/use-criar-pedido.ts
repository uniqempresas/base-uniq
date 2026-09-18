import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { normalizarTelefoneLoja } from "../components/loja/lojaMockData";

export interface PedidoItemInput {
  produto_id: number; // me_produto.id (integer)
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
}

export interface CriarPedidoParams {
  /** Cliente real selecionado na busca — quando vier, usa direto (sem find-or-create). */
  clienteId?: string;
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
  cartao_debito: 4,
  pix: 3,
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
        // SEM fallback para "primeira empresa". Sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;

        if (!empresaId) {
          throw new Error("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
        }

        // Resolve o cliente: id real já selecionado (busca) OU find-or-create.
        // Find-or-create: telefone normalizado primeiro, depois nome
        // case-insensitive — nunca mais casamento por nome exato (item 8).
        let clienteId: string | null = params.clienteId || null;

        if (!clienteId && params.clienteNome.trim()) {
          const nome = params.clienteNome.trim();
          const telefoneNormalizado = params.clienteTelefone
            ? normalizarTelefoneLoja(params.clienteTelefone)
            : "";

          if (telefoneNormalizado) {
            const { data: porTelefone } = await supabase
              .from("me_cliente")
              .select("id")
              .eq("empresa_id", empresaId)
              .eq("telefone", telefoneNormalizado)
              .maybeSingle();

            if (porTelefone) clienteId = porTelefone.id;
          }

          if (!clienteId) {
            const { data: porNome } = await supabase
              .from("me_cliente")
              .select("id")
              .eq("empresa_id", empresaId)
              .ilike("nome_cliente", nome)
              .maybeSingle();

            if (porNome) clienteId = porNome.id;
          }

          if (!clienteId) {
            const { data: novoCliente, error: clienteError } = await supabase
              .from("me_cliente")
              .insert({
                empresa_id: empresaId,
                nome_cliente: nome,
                telefone: telefoneNormalizado || null,
                origem: "manual",
                tags: [],
              })
              .select("id")
              .single();

            if (clienteError) {
              // 23505 = ux_me_cliente_empresa_telefone (empresa_id, telefone)
              // já existente — corrida/duplicidade. Reusa o cadastro existente
              // pelo telefone normalizado em vez de mostrar erro ao usuário.
              if (clienteError.code === "23505" && telefoneNormalizado) {
                const { data: existente } = await supabase
                  .from("me_cliente")
                  .select("id")
                  .eq("empresa_id", empresaId)
                  .eq("telefone", telefoneNormalizado)
                  .maybeSingle();

                if (existente) {
                  clienteId = existente.id;
                } else {
                  console.error(
                    "[useCriarPedido] 23505 sem cliente recuperável pelo telefone:",
                    clienteError
                  );
                }
              } else {
                console.error("[useCriarPedido] Erro ao criar cliente:", clienteError);
              }
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
