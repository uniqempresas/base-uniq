import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { mapStatusVenda } from "./use-pedidos";
import { STATUS_CONFIG } from "../components/pedidos/pedidosMockData";
import { formatNumeroPedidoLoja, normalizarTelefoneLoja } from "../components/loja/lojaMockData";

export interface PedidoLoja {
  idVenda: string;
  numero: string;
  valorTotal: number;
  /** chave StatusPedido (ex.: "recebido") */
  status: string;
  statusLabel: string;
  statusIcon: string;
  statusColor: string;
  statusBg: string;
  formaPagamento: string;
  canal: string | null;
  criadoEm: string;
  totalItens: number;
}

export interface UseLojaMeusPedidosReturn {
  pedidos: PedidoLoja[];
  loading: boolean;
  error: string | null;
  /** dispara nova busca (botão "Buscar") */
  buscar: () => void;
}

function formatFormaPagamento(codigo: number | string | null): string {
  if (typeof codigo === "string") {
    if (codigo === "Pix" || codigo === "pix") return "Pix";
    if (codigo === "Dinheiro" || codigo === "dinheiro") return "Dinheiro";
    return codigo;
  }
  // Sem forma registrada → dizer a verdade, não inventar "Pix".
  // A RPC `registrar_venda` passou a deixar o id NULL quando o nome não casa
  // com nenhuma forma da empresa nem global (correção F5 de 21/09/2026),
  // então NULL é um estado real — não um caso impossível.
  if (codigo === null || codigo === undefined) return "Não informado";
  // Mapa conforme a tabela `me_forma_pagamento` (ids globais 1–5).
  // ⚠️ 2 = Cartão de Crédito e 3 = Pix — aqui estava INVERTIDO, e por isso
  // uma venda Pix era exibida como "Cartão de Crédito" em "Meus pedidos".
  const mapa: Record<number, string> = {
    1: "Dinheiro",
    2: "Cartão de Crédito",
    3: "Pix",
    4: "Cartão de Débito",
    5: "Boleto",
  };
  return mapa[codigo] ?? "Não informado";
}

/**
 * "Meus pedidos" por telefone (SPEC §2.6): lookup cliente → vendas ordenadas por `criado_em desc`.
 * Sem fallback — telefone sem cadastro = lista vazia (estado "Nenhum pedido...").
 */
export function useLojaMeusPedidos(empresaId: string | undefined, telefone: string): UseLojaMeusPedidosReturn {
  const [pedidos, setPedidos] = useState<PedidoLoja[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contadorBusca, setContadorBusca] = useState(0);

  useEffect(() => {
    let cancelado = false;

    setLoading(true);
    setError(null);

    if (!empresaId) {
      setPedidos([]);
      setLoading(false);
      return () => {
        cancelado = true;
      };
    }

    const digitos = telefone.replace(/\D/g, "");
    if (digitos.length < 10) {
      setPedidos([]);
      setLoading(false);
      return () => {
        cancelado = true;
      };
    }

    const executarBusca = async () => {
      try {
        const telefoneNormalizado = normalizarTelefoneLoja(digitos);

        // Lookup do cliente
        const { data: clienteData, error: clienteErr } = await supabase
          .from("me_cliente")
          .select("id")
          .eq("empresa_id", empresaId)
          .eq("telefone", telefoneNormalizado)
          .maybeSingle();

        if (cancelado) return;
        if (clienteErr) throw clienteErr;

        if (!clienteData) {
          setPedidos([]);
          setLoading(false);
          return;
        }

        // Vendas do cliente
        const { data: vendas, error: vendasErr } = await supabase
          .from("me_venda")
          .select("id, valor_total, status_venda, forma_pagamento, canal_venda, criado_em")
          .eq("empresa_id", empresaId)
          .eq("cliente_id", clienteData.id)
          .is("deletado_em", null)
          .order("criado_em", { ascending: false });

        if (cancelado) return;
        if (vendasErr) throw vendasErr;

        const lista = (vendas as { id: string; valor_total: number; status_venda: string; forma_pagamento: number | string | null; canal_venda: string | null; criado_em: string }[] | null) || [];

        // Contagem de itens (opcional — se falhar, exibe sem contagem)
        let itensMap = new Map<string, number>();
        if (lista.length > 0) {
          const ids = lista.map(v => v.id);
          const { data: itensData } = await supabase
            .from("me_itens_venda")
            .select("venda_id, quantidade")
            .in("venda_id", ids);

          if (cancelado) return;
          if (itensData) {
            for (const it of itensData as { venda_id: string; quantidade: number }[]) {
              itensMap.set(it.venda_id, (itensMap.get(it.venda_id) || 0) + Number(it.quantidade));
            }
          }
        }

        setPedidos(
          lista.map(v => {
            const statusKey = mapStatusVenda(v.status_venda);
            const cfg = STATUS_CONFIG[statusKey];
            return {
              idVenda: v.id,
              numero: formatNumeroPedidoLoja(v.id),
              valorTotal: Number(v.valor_total) || 0,
              status: statusKey,
              statusLabel: cfg?.label || statusKey,
              statusIcon: cfg?.icon || "📦",
              statusColor: cfg?.color || "#627271",
              statusBg: cfg?.bg || "#efefef",
              formaPagamento: formatFormaPagamento(v.forma_pagamento),
              canal: v.canal_venda,
              criadoEm: v.criado_em,
              totalItens: itensMap.get(v.id) || 0,
            };
          })
        );
      } catch (e) {
        console.error("[useLojaMeusPedidos] Erro ao buscar pedidos:", e);
        if (!cancelado) {
          setError(e instanceof Error ? e.message : "Erro ao buscar pedidos");
          setPedidos([]);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    executarBusca();

    return () => {
      cancelado = true;
    };
  }, [empresaId, telefone, contadorBusca]);

  const buscar = useCallback(() => setContadorBusca(n => n + 1), []);

  return { pedidos, loading, error, buscar };
}