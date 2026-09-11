import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  movimentacoesMock,
  contasPagarMock,
  contasReceberMock,
  dreMock,
  calcularStatus,
  calcularDiasVencimento,
} from "../components/financeiro/mockData";

export interface FinanceiroDashboard {
  saldoProjetado: number;
  totalEntradasMes: number;
  totalSaidasMes: number;
  lucroMes: number;
  isLucro: boolean;
  contasVencidasPagar: number;
  contasAtrasadasReceber: number;
  proximasContasPagar: Array<{
    id: string;
    descricao: string;
    fornecedor: string;
    valor: number;
    diasRestantes: number;
  }>;
  ultimasMovimentacoes: Array<{
    id: string;
    descricao: string;
    tipo: "entrada" | "saida";
    valor: number;
    data: string;
    categoria: string;
  }>;
  contasReceberPendentes: Array<{
    id: string;
    cliente: string;
    descricao: string;
    valor: number;
    dataPrevista: string;
    status: "pago" | "pendente" | "vencido";
  }>;
}

function formatarMesAtual(): string {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

function calcularDashboardMock(): FinanceiroDashboard {
  const mesAtual = "2025-03";

  const totalEntradas = movimentacoesMock
    .filter((m) => m.tipo === "entrada" && m.data.startsWith(mesAtual))
    .reduce((sum, m) => sum + m.valor, 0);
  const totalSaidas = movimentacoesMock
    .filter((m) => m.tipo === "saida" && m.data.startsWith(mesAtual))
    .reduce((sum, m) => sum + m.valor, 0);
  const saldoProjetado = 3500 + totalEntradas - totalSaidas;

  const contasPagarAtualizadas = contasPagarMock.map((c) => ({
    ...c,
    status: calcularStatus(c.dataVencimento, c.status),
  }));
  const contasVencidasPagar = contasPagarAtualizadas.filter((c) => c.status === "vencido").length;
  const contasReceberAtualizadas = contasReceberMock.map((c) => ({
    ...c,
    status: calcularStatus(c.dataPrevista, c.status),
  }));
  const contasAtrasadasReceber = contasReceberAtualizadas.filter((c) => c.status === "vencido").length;

  const proximasContasPagar = contasPagarAtualizadas
    .filter((c) => c.status === "pendente")
    .map((c) => ({ ...c, diasRestantes: calcularDiasVencimento(c.dataVencimento) }))
    .filter((c) => c.diasRestantes >= 0 && c.diasRestantes <= 7)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      descricao: c.descricao,
      fornecedor: c.fornecedor,
      valor: c.valor,
      diasRestantes: c.diasRestantes,
    }));

  const isLucro = dreMock.lucroLiquido >= 0;

  const ultimasMovimentacoes = movimentacoesMock
    .filter((m) => m.data.startsWith(mesAtual))
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      descricao: m.descricao,
      tipo: m.tipo,
      valor: m.valor,
      data: m.data,
      categoria: m.categoria,
    }));

  const contasReceberPendentes = contasReceberAtualizadas.slice(0, 5).map((c) => ({
    id: c.id,
    cliente: c.cliente,
    descricao: c.descricao,
    valor: c.valor,
    dataPrevista: c.dataPrevista,
    status: c.status as "pago" | "pendente" | "vencido",
  }));

  return {
    saldoProjetado,
    totalEntradasMes: totalEntradas,
    totalSaidasMes: totalSaidas,
    lucroMes: totalEntradas - totalSaidas,
    isLucro,
    contasVencidasPagar,
    contasAtrasadasReceber,
    proximasContasPagar,
    ultimasMovimentacoes,
    contasReceberPendentes,
  };
}

function truncarDescricao(desc: string | null): string {
  if (!desc) return "Sem categoria";
  const palavras = desc.trim().split(/\s+/);
  return palavras.slice(0, 2).join(" ");
}

export function useFinanceiroDashboard() {
  const { empresa, session, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<FinanceiroDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem sessão): usa mock
    if (!session) {
      setDashboard(calcularDashboardMock());
      setIsFallback(true);
      setLoading(false);
      return;
    }

    const empresaId = empresa?.id;
    if (!empresaId) {
      setDashboard(null);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      const mesAtual = formatarMesAtual();
      const [ano, mes] = mesAtual.split("-").map(Number);
      const inicioMes = `${mesAtual}-01`;
      const d = new Date(ano, mes, 0);
      const fimMes = `${mesAtual}-${String(d.getDate()).padStart(2, "0")}`;

      const hoje = new Date().toISOString().slice(0, 10);
      const daqui7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

      // Queries em paralelo
      const [
        receberMesResult,
        pagarMesResult,
        vencidasResult,
        atrasadasResult,
        proximasResult,
        receberPendentesResult,
      ] = await Promise.all([
        // Contas recebidas no mês
        supabase
          .from("me_contas_receber")
          .select("id, valor_pago, data_pagamento")
          .eq("empresa_id", empresaId)
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .gte("data_pagamento", inicioMes)
          .lte("data_pagamento", fimMes),
        // Contas pagas no mês
        supabase
          .from("me_contas_pagar")
          .select("id, valor_pago, data_pagamento")
          .eq("empresa_id", empresaId)
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .gte("data_pagamento", inicioMes)
          .lte("data_pagamento", fimMes),
        // Contas a pagar pendentes/vencidas (para alerta e saldo projetado)
        supabase
          .from("me_contas_pagar")
          .select("id, valor, empresa_id, status")
          .eq("empresa_id", empresaId)
          .in("status", ["pendente", "vencido"]),
        // Contas a receber atrasadas
        supabase
          .from("me_contas_receber")
          .select("id, empresa_id")
          .eq("empresa_id", empresaId)
          .eq("status", "vencido"),
        // Próximas contas a pagar (7 dias)
        supabase
          .from("me_contas_pagar")
          .select("id, descricao, valor, data_vencimento, fornecedor_id")
          .eq("empresa_id", empresaId)
          .eq("status", "pendente")
          .gte("data_vencimento", hoje)
          .lte("data_vencimento", daqui7)
          .order("data_vencimento", { ascending: true }),
        // Contas a receber pendentes (para card)
        supabase
          .from("me_contas_receber")
          .select("id, descricao, valor, data_vencimento, status, cliente_id")
          .eq("empresa_id", empresaId)
          .in("status", ["pendente", "vencido"])
          .order("data_vencimento", { ascending: true }),
      ]);

      // Totais do mês
      const totalEntradasMes = (receberMesResult.data ?? []).reduce(
        (s, r) => s + (Number(r.valor_pago) || 0), 0
      );
      const totalSaidasMes = (pagarMesResult.data ?? []).reduce(
        (s, p) => s + (Number(p.valor_pago) || 0), 0
      );
      const lucroMes = totalEntradasMes - totalSaidasMes;

      // Contas a pagar pendentes/vencidas (para alerta e saldo projetado)
      const contasPagarPendVenc = (vencidasResult.data ?? []) as {
        id: string; valor: number | null; status: string | null;
      }[];
      const contasVencidasPagar = contasPagarPendVenc.filter((c) => c.status === "vencido").length;
      const totalPagarPendenteVencido = contasPagarPendVenc.reduce(
        (s, c) => s + (Number(c.valor) || 0), 0
      );

      // Contas a receber atrasadas
      const contasAtrasadasReceber = (atrasadasResult.data ?? []).length;
      // Total de receber pendente/vencido para saldo projetado
      const totalReceberPendenteVencido = (receberPendentesResult.data ?? []).reduce(
        (s, c) => s + (Number(c.valor) || 0), 0
      );

      const saldoProjetado = totalReceberPendenteVencido - totalPagarPendenteVencido;

      // Próximas contas a pagar
      const proximas = (proximasResult.data ?? []) as {
        id: string; descricao: string | null; valor: number | null;
        data_vencimento: string | null; fornecedor_id: string | null;
      }[];

      // Buscar nomes dos fornecedores das próximas contas
      const fornecedorIdsProximos = [...new Set(
        proximas.map((p) => p.fornecedor_id).filter((id): id is string => id !== null)
      )];
      let fornecedoresMap = new Map<string, string>();
      if (fornecedorIdsProximos.length > 0) {
        const { data: fData } = await supabase
          .from("me_fornecedor")
          .select("id, nome_fantasia")
          .in("id", fornecedorIdsProximos)
          .eq("empresa_id", empresaId);
        if (fData) {
          for (const f of fData as { id: string; nome_fantasia: string }[]) {
            fornecedoresMap.set(f.id, f.nome_fantasia);
          }
        }
      }

      const proximasContasPagar = proximas.map((p) => ({
        id: p.id,
        descricao: p.descricao || "Conta a pagar",
        fornecedor: p.fornecedor_id ? (fornecedoresMap.get(p.fornecedor_id) || "Fornecedor") : "Fornecedor",
        valor: Number(p.valor) || 0,
        diasRestantes: p.data_vencimento ? calcularDiasVencimento(p.data_vencimento) : 0,
      }));

      // Contas a receber pendentes
      const receberPendentes = (receberPendentesResult.data ?? []) as {
        id: string; descricao: string | null; valor: number | null;
        data_vencimento: string | null; status: string | null; cliente_id: string | null;
      }[];

      const clienteIdsReceber = [...new Set(
        receberPendentes.map((r) => r.cliente_id).filter((id): id is string => id !== null)
      )];
      let clientesMap = new Map<string, string>();
      if (clienteIdsReceber.length > 0) {
        const { data: cData } = await supabase
          .from("me_cliente")
          .select("id, nome_cliente")
          .in("id", clienteIdsReceber)
          .eq("empresa_id", empresaId);
        if (cData) {
          for (const c of cData as { id: string; nome_cliente: string }[]) {
            clientesMap.set(c.id, c.nome_cliente);
          }
        }
      }

      const contasReceberPendentes = receberPendentes.map((r) => ({
        id: r.id,
        cliente: r.cliente_id ? (clientesMap.get(r.cliente_id) || "Cliente") : "Cliente",
        descricao: r.descricao || "Conta a receber",
        valor: Number(r.valor) || 0,
        dataPrevista: r.data_vencimento || "",
        status: calcularStatus(r.data_vencimento ?? "", r.status === "pago" ? "pago" : "pendente") as "pago" | "pendente" | "vencido",
      }));

      // Últimas movimentações: unir pagas do mês
      const movs: Array<{
        id: string; descricao: string; tipo: "entrada" | "saida";
        valor: number; data: string; categoria: string;
      }> = [];

      // Buscar descrições das contas pagas do mês para ultimas movimentações
      const [receberDetalhesResult, pagarDetalhesResult] = await Promise.all([
        supabase
          .from("me_contas_receber")
          .select("id, descricao, valor_pago, data_pagamento, cliente_id")
          .eq("empresa_id", empresaId)
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .gte("data_pagamento", inicioMes)
          .lte("data_pagamento", fimMes)
          .order("data_pagamento", { ascending: false })
          .limit(5),
        supabase
          .from("me_contas_pagar")
          .select("id, descricao, valor_pago, data_pagamento, fornecedor_id")
          .eq("empresa_id", empresaId)
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .gte("data_pagamento", inicioMes)
          .lte("data_pagamento", fimMes)
          .order("data_pagamento", { ascending: false })
          .limit(5),
      ]);

      for (const r of (receberDetalhesResult.data ?? []) as {
        id: string; descricao: string | null; valor_pago: number | null;
        data_pagamento: string | null; cliente_id: string | null;
      }[]) {
        movs.push({
          id: `mov-cr-${r.id}`,
          descricao: r.descricao || "Conta a receber",
          tipo: "entrada",
          valor: Number(r.valor_pago) || 0,
          data: r.data_pagamento ? `${r.data_pagamento}T12:00:00` : "",
          categoria: truncarDescricao(r.descricao),
        });
      }

      for (const p of (pagarDetalhesResult.data ?? []) as {
        id: string; descricao: string | null; valor_pago: number | null;
        data_pagamento: string | null; fornecedor_id: string | null;
      }[]) {
        movs.push({
          id: `mov-cp-${p.id}`,
          descricao: p.descricao || "Conta a pagar",
          tipo: "saida",
          valor: Number(p.valor_pago) || 0,
          data: p.data_pagamento ? `${p.data_pagamento}T12:00:00` : "",
          categoria: truncarDescricao(p.descricao),
        });
      }

      const ultimasMovimentacoes = movs
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 5);

      setDashboard({
        saldoProjetado,
        totalEntradasMes,
        totalSaidasMes,
        lucroMes,
        isLucro: lucroMes >= 0,
        contasVencidasPagar,
        contasAtrasadasReceber,
        proximasContasPagar,
        ultimasMovimentacoes,
        contasReceberPendentes,
      });
    } catch (err) {
      console.error("[useFinanceiroDashboard] Erro ao buscar dados:", err);
      setDashboard(null);
      setError(err instanceof Error ? err.message : "Erro ao carregar dashboard financeiro");
      setIsFallback(false);
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { dashboard, loading, error, isFallback };
}
