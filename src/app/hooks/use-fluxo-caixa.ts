import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { movimentacoesMock, calcularStatus } from "../components/financeiro/mockData";

export interface MovimentacaoFluxo {
  id: string;
  descricao: string;
  tipo: "entrada" | "saida";
  valor: number;
  data: string; // ISO date
  categoria: string;
  status: "pago" | "pendente" | "vencido";
  pessoa?: string;
  origem: "conta_receber" | "conta_pagar" | "venda";
  origemId: string;
}

function periodoParaDatas(periodo: string): { inicio: string; fim: string } {
  const [ano, mes] = periodo.split("-").map(Number);
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const d = new Date(ano, mes, 0);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(mes).padStart(2, "0");
  const fim = `${ano}-${mm}-${dd}`;
  return { inicio, fim };
}

function truncarDescricao(desc: string | null): string {
  if (!desc) return "Sem categoria";
  const palavras = desc.trim().split(/\s+/);
  return palavras.slice(0, 2).join(" ");
}

export function useFluxoCaixa(periodo: string) {
  const { empresa, session, loading: authLoading } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFluxo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [saldoFinal, setSaldoFinal] = useState(0);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem sessão): usa mock
    if (!session) {
      const mockMapeadas: MovimentacaoFluxo[] = movimentacoesMock.map((m) => ({
        id: m.id,
        descricao: m.descricao,
        tipo: m.tipo,
        valor: m.valor,
        data: m.data,
        categoria: m.categoria,
        status: m.status,
        pessoa: m.pessoa,
        origem: m.tipo === "entrada" ? ("conta_receber" as const) : ("conta_pagar" as const),
        origemId: m.id,
      }));
      setMovimentacoes(mockMapeadas);
      setIsFallback(true);
      // Calcular totais a partir do mock filtrado por período
      const filtradas = mockMapeadas.filter((m) => m.data.startsWith(periodo));
      const entradas = filtradas.filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
      const saidas = filtradas.filter((m) => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
      setTotalEntradas(entradas);
      setTotalSaidas(saidas);
      setSaldoInicial(3500);
      setSaldoFinal(3500 + entradas - saidas);
      setLoading(false);
      return;
    }

    const empresaId = empresa?.id;
    if (!empresaId) {
      setMovimentacoes([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      const { inicio, fim } = periodoParaDatas(periodo);

      // 1. Buscar entradas e saídas do período + saldos anteriores em paralelo
      const [receberResult, pagarResult, receberAnteriorResult, pagarAnteriorResult] = await Promise.all([
        supabase
          .from("me_contas_receber")
          .select("id, descricao, valor_pago, data_pagamento, status, cliente_id, empresa_id")
          .eq("empresa_id", empresaId)
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .gte("data_pagamento", inicio)
          .lte("data_pagamento", fim),
        supabase
          .from("me_contas_pagar")
          .select("id, descricao, valor_pago, data_pagamento, status, fornecedor_id, empresa_id")
          .eq("empresa_id", empresaId)
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .gte("data_pagamento", inicio)
          .lte("data_pagamento", fim),
        supabase
          .from("me_contas_receber")
          .select("valor_pago")
          .eq("empresa_id", empresaId)
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .lt("data_pagamento", inicio),
        supabase
          .from("me_contas_pagar")
          .select("valor_pago")
          .eq("empresa_id", empresaId)
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .lt("data_pagamento", inicio),
      ]);

      if (receberResult.error) throw receberResult.error;
      if (pagarResult.error) throw pagarResult.error;

      const receber = (receberResult.data ?? []) as {
        id: string; descricao: string | null; valor_pago: number | null;
        data_pagamento: string | null; status: string | null; cliente_id: string | null;
      }[];

      const pagar = (pagarResult.data ?? []) as {
        id: string; descricao: string | null; valor_pago: number | null;
        data_pagamento: string | null; status: string | null; fornecedor_id: string | null;
      }[];

      // Calcular saldo inicial
      const saldoRecAnt = (receberAnteriorResult.data ?? []).reduce(
        (s: number, r: { valor_pago: number | null }) => s + (Number(r.valor_pago) || 0), 0
      );
      const saldoPagAnt = (pagarAnteriorResult.data ?? []).reduce(
        (s: number, p: { valor_pago: number | null }) => s + (Number(p.valor_pago) || 0), 0
      );
      const saldoInicialCalc = saldoRecAnt - saldoPagAnt;

      // 2. Buscar nomes de clientes e fornecedores
      const clienteIds = [...new Set(receber.map((r) => r.cliente_id).filter((id): id is string => id !== null))];
      const fornecedorIds = [...new Set(pagar.map((p) => p.fornecedor_id).filter((id): id is string => id !== null))];

      const [clientesResult, fornecedoresResult] = await Promise.all([
        clienteIds.length > 0
          ? supabase.from("me_cliente").select("id, nome_cliente").in("id", clienteIds).eq("empresa_id", empresaId)
          : Promise.resolve({ data: null, error: null }),
        fornecedorIds.length > 0
          ? supabase.from("me_fornecedor").select("id, nome_fantasia").in("id", fornecedorIds).eq("empresa_id", empresaId)
          : Promise.resolve({ data: null, error: null }),
      ]);

      const clientesMap = new Map<string, string>();
      if (clientesResult.data) {
        for (const c of clientesResult.data as { id: string; nome_cliente: string }[]) {
          clientesMap.set(c.id, c.nome_cliente);
        }
      }

      const fornecedoresMap = new Map<string, string>();
      if (fornecedoresResult.data) {
        for (const f of fornecedoresResult.data as { id: string; nome_fantasia: string }[]) {
          fornecedoresMap.set(f.id, f.nome_fantasia);
        }
      }

      // 3. Mapear entradas
      const entradas: MovimentacaoFluxo[] = receber.map((r) => ({
        id: `cr-${r.id}`,
        descricao: r.descricao || "Conta a receber",
        tipo: "entrada" as const,
        valor: Number(r.valor_pago) || 0,
        data: r.data_pagamento ? `${r.data_pagamento}T12:00:00` : "",
        categoria: truncarDescricao(r.descricao),
        status: calcularStatus(r.data_pagamento ?? "", "pago"),
        pessoa: r.cliente_id ? clientesMap.get(r.cliente_id) : undefined,
        origem: "conta_receber" as const,
        origemId: r.id,
      }));

      // 4. Mapear saídas
      const saidas: MovimentacaoFluxo[] = pagar.map((p) => ({
        id: `cp-${p.id}`,
        descricao: p.descricao || "Conta a pagar",
        tipo: "saida" as const,
        valor: Number(p.valor_pago) || 0,
        data: p.data_pagamento ? `${p.data_pagamento}T12:00:00` : "",
        categoria: truncarDescricao(p.descricao),
        status: calcularStatus(p.data_pagamento ?? "", "pago"),
        pessoa: p.fornecedor_id ? fornecedoresMap.get(p.fornecedor_id) : undefined,
        origem: "conta_pagar" as const,
        origemId: p.id,
      }));

      const todas = [...entradas, ...saidas];
      setMovimentacoes(todas);
      setSaldoInicial(saldoInicialCalc);
      setTotalEntradas(entradas.reduce((s, e) => s + e.valor, 0));
      setTotalSaidas(saidas.reduce((s, s2) => s + s2.valor, 0));
      setSaldoFinal(saldoInicialCalc + entradas.reduce((s, e) => s + e.valor, 0) - saidas.reduce((s, s2) => s + s2.valor, 0));
    } catch (err) {
      console.error("[useFluxoCaixa] Erro ao buscar dados:", err);
      setMovimentacoes([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar fluxo de caixa");
      setIsFallback(false);
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading, periodo]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // CRUD: Criar movimentação
  const criarMovimentacao = useCallback(async (mov: Omit<MovimentacaoFluxo, "id">): Promise<{ error?: string }> => {
    if (!session) return { error: "Sessão necessária para criar movimentação" };
    const empresaId = empresa?.id;
    if (!empresaId) return { error: "Empresa não identificada" };

    try {
      const dadosBase = {
        empresa_id: empresaId,
        descricao: mov.descricao,
        valor: mov.valor,
        data_vencimento: mov.data.slice(0, 10),
        data_pagamento: mov.data.slice(0, 10),
        status: "pago",
        valor_pago: mov.valor,
        forma_pagamento: null as string | null,
        conta_id: null as string | null,
        categoria_id: null as string | null,
      };

      if (mov.tipo === "entrada") {
        const { error: insertError } = await supabase
          .from("me_contas_receber")
          .insert({ ...dadosBase, cliente_id: null });
        if (insertError) throw insertError;
      } else {
        const { error: insertError } = await supabase
          .from("me_contas_pagar")
          .insert({ ...dadosBase, fornecedor_id: null });
        if (insertError) throw insertError;
      }

      await carregarDados();
      return {};
    } catch (err) {
      console.error("[useFluxoCaixa] Erro ao criar:", err);
      return { error: err instanceof Error ? err.message : "Erro ao criar movimentação" };
    }
  }, [session, empresa, carregarDados]);

  // CRUD: Editar movimentação
  const editarMovimentacao = useCallback(async (id: string, dados: Partial<MovimentacaoFluxo>): Promise<{ error?: string }> => {
    if (!session) return { error: "Sessão necessária para editar movimentação" };
    const empresaId = empresa?.id;
    if (!empresaId) return { error: "Empresa não identificada" };

    // Encontrar a movimentação atual pelo id
    const movAtual = movimentacoes.find((m) => m.id === id);
    if (!movAtual) return { error: "Movimentação não encontrada" };

    try {
      const dadosAtualizar: Record<string, unknown> = {};
      if (dados.descricao !== undefined) dadosAtualizar.descricao = dados.descricao;
      if (dados.valor !== undefined) {
        dadosAtualizar.valor = dados.valor;
        dadosAtualizar.valor_pago = dados.valor;
      }
      if (dados.data !== undefined) {
        dadosAtualizar.data_vencimento = dados.data.slice(0, 10);
        dadosAtualizar.data_pagamento = dados.data.slice(0, 10);
      }

      if (Object.keys(dadosAtualizar).length === 0) return {};

      const tabela = movAtual.origem === "conta_receber" ? "me_contas_receber" : "me_contas_pagar";
      const { error: updateError } = await supabase
        .from(tabela)
        .update(dadosAtualizar)
        .eq("id", movAtual.origemId)
        .eq("empresa_id", empresaId);

      if (updateError) throw updateError;

      await carregarDados();
      return {};
    } catch (err) {
      console.error("[useFluxoCaixa] Erro ao editar:", err);
      return { error: err instanceof Error ? err.message : "Erro ao editar movimentação" };
    }
  }, [session, empresa, movimentacoes, carregarDados]);

  // CRUD: Excluir movimentação
  const excluirMovimentacao = useCallback(async (id: string, origem: MovimentacaoFluxo["origem"]): Promise<{ error?: string }> => {
    if (!session) return { error: "Sessão necessária para excluir movimentação" };
    const empresaId = empresa?.id;
    if (!empresaId) return { error: "Empresa não identificada" };

    if (!window.confirm("Excluir esta movimentação? Esta ação não pode ser desfeita.")) {
      return {};
    }

    try {
      const tabela = origem === "conta_receber" ? "me_contas_receber" : "me_contas_pagar";
      // Extrair o origemId removendo o prefixo
      const origemId = id.startsWith("cr-") ? id.slice(3) : id.startsWith("cp-") ? id.slice(3) : id;

      const { error: deleteError } = await supabase
        .from(tabela)
        .delete()
        .eq("id", origemId)
        .eq("empresa_id", empresaId);

      if (deleteError) throw deleteError;

      await carregarDados();
      return {};
    } catch (err) {
      console.error("[useFluxoCaixa] Erro ao excluir:", err);
      return { error: err instanceof Error ? err.message : "Erro ao excluir movimentação" };
    }
  }, [session, empresa, carregarDados]);

  return {
    movimentacoes,
    loading,
    error,
    isFallback,
    saldoInicial,
    totalEntradas,
    totalSaidas,
    saldoFinal,
    criarMovimentacao,
    editarMovimentacao,
    excluirMovimentacao,
  };
}
