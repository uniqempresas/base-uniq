import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { getInitials } from "./use-pipeline";

/** Cliente agregado para o KPI/lista de recentes do dashboard */
export interface ClienteResumo {
  id: string;
  nome: string;
  initials: string;
  cidade: string;
  /** "yyyy-mm-dd" (ou ISO completo) para filtro de período */
  criadoEm: string | null;
  /** "desde 12/03/2026" */
  desdeTexto: string;
  ativo: boolean;
  /** soma me_venda.valor_total (exceto canceladas) — 0 se sem vendas/compras indisponíveis */
  totalCompras: number;
}

export interface UseDashboardCrmReturn {
  /** lista completa já ordenada por criado_em desc (filtro de período é client-side) */
  clientes: ClienteResumo[];
  /** false se a consulta de me_venda falhou → página omite a coluna "compras" */
  comprasDisponiveis: boolean;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

interface DBClienteRow {
  id: string;
  nome_cliente: string | null;
  cidade: string | null;
  ativo: boolean | null;
  criado_em: string | null;
}

interface DBVendaRow {
  cliente_id: string | null;
  valor_total: number | string | null;
  status_venda: string | null;
}

function formatarDataBR(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
}

/**
 * Lado "clientes" do Dashboard CRM (SPEC-CRM-Dashboard-Desmockado):
 * me_cliente da empresa logada (total/ativos/recentes) + soma de compras
 * por cliente via me_venda (select leve, agregação client-side — se a
 * consulta de vendas falhar, comprasDisponiveis=false e a coluna é omitida;
 * NUNCA inventar valor).
 */
export function useDashboardCrm(): UseDashboardCrmReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [comprasDisponiveis, setComprasDisponiveis] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setCarregando(true);
    setErro(null);

    const empresaId = empresa?.id;
    if (!session || !empresaId) {
      // mesma regra do pipeline: sem tenant não há consulta segura
      setClientes([]);
      setErro(
        !session
          ? "Faça login para visualizar o dashboard com dados reais da sua empresa."
          : "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
      );
      setCarregando(false);
      return;
    }

    try {
      const [clientesRes, vendasRes] = await Promise.all([
        supabase
          .from("me_cliente")
          .select("id, nome_cliente, cidade, ativo, criado_em")
          .eq("empresa_id", empresaId)
          .order("criado_em", { ascending: false }),
        // consulta barata pedida pela SPEC: só cliente_id/valor/status; agrega client-side
        supabase.from("me_venda").select("cliente_id, valor_total, status_venda").eq("empresa_id", empresaId),
      ]);

      if (clientesRes.error) throw clientesRes.error;

      // Agregação de compras é opcional: falha aqui não derruba o dashboard,
      // apenas esconde a coluna (regra "se pesado/duvidoso, omita").
      const vendasOk = !vendasRes.error;
      if (!vendasOk) {
        console.warn("[useDashboardCrm] me_venda indisponível:", vendasRes.error?.message);
      }

      const somaCompras = new Map<string, number>();
      if (vendasOk) {
        for (const v of (vendasRes.data as DBVendaRow[] | null) ?? []) {
          // status_venda cancelado excluído client-side (NULL-comparação em SQL
          // pegaria NULL — mesma cautela documentada em use-dre.ts)
          if (!v.cliente_id || v.status_venda === "cancelado") continue;
          somaCompras.set(v.cliente_id, (somaCompras.get(v.cliente_id) ?? 0) + (Number(v.valor_total) || 0));
        }
      }

      const lista: ClienteResumo[] = ((clientesRes.data as DBClienteRow[] | null) ?? []).map((c) => {
        const nome = c.nome_cliente || "Sem nome";
        const dataFmt = formatarDataBR(c.criado_em);
        return {
          id: c.id,
          nome,
          initials: getInitials(nome),
          cidade: c.cidade || "",
          criadoEm: c.criado_em,
          desdeTexto: dataFmt ? `desde ${dataFmt}` : "",
          ativo: c.ativo !== false,
          totalCompras: somaCompras.get(c.id) ?? 0,
        };
      });

      setClientes(lista);
      setComprasDisponiveis(vendasOk);
    } catch (err) {
      console.error("[useDashboardCrm] Erro ao carregar clientes:", err);
      setClientes([]);
      setErro(err instanceof Error ? err.message : "Erro ao carregar os clientes do dashboard.");
    } finally {
      setCarregando(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { clientes, comprasDisponiveis, carregando, erro, recarregar: carregarDados };
}
