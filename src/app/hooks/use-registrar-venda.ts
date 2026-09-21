import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

/** Item no shape canônico esperado pela RPC registrar_venda */
export interface ItemVenda {
  tipo: "produto" | "servico";
  /** Id no banco (me_produto.id/me_servico.id) como string */
  id_referencia: string;
  nome: string;
  quantidade: number;
  preco_unitario: number;
}

export interface RegistrarVendaParams {
  valor_total: number;
  forma_pagamento: string;
  cliente_id?: string;
  data_vencimento?: string;
  status?: string;
  itens: ItemVenda[];
  observacoes?: string;
  origem?: string;
}

export interface RegistrarVendaResult {
  success: boolean;
  id_venda?: string;
  id_venda_servico?: string;
  id_conta_receber?: string;
  valor_total?: number;
  error?: string;
}

export function useRegistrarVenda() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimoResultado, setUltimoResultado] = useState<RegistrarVendaResult | null>(null);

  const registrarVenda = useCallback(
    async (params: RegistrarVendaParams): Promise<RegistrarVendaResult> => {
      setLoading(true);
      setError(null);

      try {
        // SEM fallback para "primeira empresa". Sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;

        if (!empresaId) {
          throw new Error("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
        }

        // Cliente padrão (primeiro disponível) se não informado
        let clienteId = params.cliente_id;
        if (!clienteId) {
          const { data: clientes } = await supabase
            .from("me_cliente")
            .select("id")
            .eq("empresa_id", empresaId)
            .limit(1);
          
          if (clientes && clientes.length > 0) {
            clienteId = clientes[0].id;
          }
        }

        const dataVencimento = params.data_vencimento || 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const { data, error: rpcError } = await supabase.rpc("registrar_venda", {
          p_empresa_id: empresaId,
          p_valor_total: params.valor_total,
          p_forma_pagamento: params.forma_pagamento,
          p_cliente_id: clienteId || null,
          p_data_vencimento: dataVencimento,
          p_status: params.status || "confirmada",
          p_itens: params.itens,
          p_observacoes: params.observacoes || null,
          // Default 'interna', não 'whatsapp': o valor anterior ativava a guarda
          // anti-duplicidade do WhatsApp numa venda interna.
          // ⚠️ ATENÇÃO: este hook NÃO é importado por nenhum componente — o botão
          // "Contabilizar venda" real está em PedidoDetalhePage.handleContabilizar,
          // que só faz atualizarStatus(status='pago'). Isto é código morto.
          p_origem: params.origem || "interna",
        });

        if (rpcError) throw rpcError;

        const resultado: RegistrarVendaResult = {
          success: true,
          ...(data as object),
        };

        setUltimoResultado(resultado);
        return resultado;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao registrar venda";
        setError(errorMessage);
        
        const resultado: RegistrarVendaResult = {
          success: false,
          error: errorMessage,
        };
        
        setUltimoResultado(resultado);
        return resultado;
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return {
    registrarVenda,
    loading,
    error,
    ultimoResultado,
  };
}
