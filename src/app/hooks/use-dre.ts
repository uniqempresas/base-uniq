import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { dreMock } from "../components/financeiro/mockData";

export interface DREData {
  periodo: string;
  receitaBruta: number;
  impostos: number;
  receitaLiquida: number;
  custos: number;
  lucroBruto: number;
  despesasOperacionais: number;
  lucroLiquido: number;
  margemLucro: number;
  categoriasDespesas: { nome: string; valor: number }[];
  cmvDisponivel: boolean;
}

function ultimoDiaDoMes(ano: number, mes: number): string {
  const d = new Date(ano, mes, 0);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(mes).padStart(2, "0");
  return `${ano}-${mm}-${dd}`;
}

function periodoParaDatas(periodo: string): { inicio: string; fim: string } {
  const [ano, mes] = periodo.split("-").map(Number);
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fim = ultimoDiaDoMes(ano, mes);
  return { inicio, fim };
}

function nomeMesPeriodo(periodo: string): string {
  const [ano, mes] = periodo.split("-").map(Number);
  const nomes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${nomes[mes - 1]} ${ano}`;
}

function agruparDespesasPorCategoria(
  contas: { descricao: string | null; valor: number }[]
): { nome: string; valor: number }[] {
  const mapa = new Map<string, number>();
  for (const c of contas) {
    const valor = Number(c.valor ?? 0);
    if (valor <= 0) continue;
    const nome = truncarDescricao(c.descricao);
    mapa.set(nome, (mapa.get(nome) ?? 0) + valor);
  }
  return Array.from(mapa.entries())
    .map(([nome, valor]) => ({ nome, valor }))
    .sort((a, b) => b.valor - a.valor);
}

function truncarDescricao(desc: string | null): string {
  if (!desc) return "Sem categoria";
  const palavras = desc.trim().split(/\s+/);
  return palavras.slice(0, 2).join(" ");
}

export function useDRE(periodo: string) {
  const { empresa, session, loading: authLoading } = useAuth();
  const [dre, setDre] = useState<DREData | null>(null);
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
      setDre({ ...dreMock, cmvDisponivel: true });
      setIsFallback(true);
      setLoading(false);
      return;
    }

    const empresaId = empresa?.id;
    if (!empresaId) {
      setDre(null);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      const { inicio, fim } = periodoParaDatas(periodo);

      // Queries em paralelo: receita bruta, despesas pagas e despesas em aberto
      const [vendasResult, pagasResult, pendentesResult] = await Promise.all([
        supabase
          .from("me_venda")
          .select("id, valor_total")
          .eq("empresa_id", empresaId)
          .gte("criado_em", inicio)
          .lte("criado_em", fim + "T23:59:59"),
        supabase
          .from("me_contas_pagar")
          .select("valor, valor_pago, descricao")
          .eq("empresa_id", empresaId)
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .gte("data_pagamento", inicio)
          .lte("data_pagamento", fim),
        // Contas em aberto (pendente/vencido): contam no mês do vencimento
        supabase
          .from("me_contas_pagar")
          .select("valor, valor_pago, descricao")
          .eq("empresa_id", empresaId)
          .in("status", ["pendente", "vencido"])
          .gte("data_vencimento", inicio)
          .lte("data_vencimento", fim),
      ]);

      if (vendasResult.error) throw vendasResult.error;
      if (pagasResult.error) throw pagasResult.error;
      if (pendentesResult.error) throw pendentesResult.error;

      const vendas = (vendasResult.data ?? []) as { id: string; valor_total: number | null }[];
      const receitaBruta = vendas.reduce((s, v) => s + (Number(v.valor_total) || 0), 0);

      // CMV: tentar buscar itens de venda + preco_custo
      let custos = 0;
      let cmvDisponivel = false;
      try {
        const vendaIds = vendas.map((v) => v.id);
        if (vendaIds.length > 0) {
          const { data: itensVenda, error: itensError } = await supabase
            .from("me_itens_venda")
            .select("quantidade, produto_id, venda_id")
            .in("venda_id", vendaIds);

          if (itensError) throw itensError;

          const itens = (itensVenda ?? []) as { quantidade: number; produto_id: number | null; venda_id: string }[];

          if (itens.length > 0) {
            cmvDisponivel = true;
            const produtoIds = [...new Set(itens.map((i) => i.produto_id).filter((p): p is number => p !== null))];

            if (produtoIds.length > 0) {
              const { data: produtos, error: prodError } = await supabase
                .from("me_produto")
                .select("id, preco_custo")
                .in("id", produtoIds);

              if (prodError) throw prodError;

              const custoMap = new Map(
                (produtos ?? []).map((p) => [p.id, Number(p.preco_custo) || 0])
              );

              custos = itens.reduce((s, i) => {
                const custoUnit = i.produto_id !== null ? (custoMap.get(i.produto_id) ?? 0) : 0;
                return s + (i.quantidade * custoUnit);
              }, 0);
            }
          }
        }
      } catch {
        // me_itens_venda não existe ou erro — CMV fica 0
        cmvDisponivel = false;
      }

      // Despesas do mês: pagas contam pelo data_pagamento (valor_pago);
      // pendentes/vencidas contam pelo vencimento (valor) — o DRE mostra a despesa do mês, paga ou em aberto
      const contasPagas = (pagasResult.data ?? []) as { valor: number | null; valor_pago: number | null; descricao: string | null }[];
      const contasEmAberto = (pendentesResult.data ?? []) as { valor: number | null; valor_pago: number | null; descricao: string | null }[];

      const despesasComValor = [
        ...contasPagas.map((c) => ({ descricao: c.descricao, valor: Number(c.valor_pago ?? c.valor ?? 0) })),
        ...contasEmAberto.map((c) => ({ descricao: c.descricao, valor: Number(c.valor ?? 0) })),
      ];

      const despesasOperacionais = despesasComValor.reduce((s, c) => s + Number(c.valor || 0), 0);

      // Agrupar despesas por categoria (proxy: primeiras 2 palavras da descrição)
      const categoriasDespesas = agruparDespesasPorCategoria(despesasComValor);

      // Cálculos
      const impostos = 0;
      const receitaLiquida = receitaBruta - impostos;
      const lucroBruto = receitaLiquida - custos;
      const lucroLiquido = lucroBruto - despesasOperacionais;
      const margemLucro = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

      setDre({
        periodo: nomeMesPeriodo(periodo),
        receitaBruta,
        impostos,
        receitaLiquida,
        custos,
        lucroBruto,
        despesasOperacionais,
        lucroLiquido,
        margemLucro,
        categoriasDespesas,
        cmvDisponivel,
      });
    } catch (err) {
      console.error("[useDRE] Erro ao buscar dados:", err);
      setDre(null);
      setError(err instanceof Error ? err.message : "Erro ao carregar dados do DRE");
      setIsFallback(false);
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading, periodo]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { dre, loading, error, isFallback };
}
