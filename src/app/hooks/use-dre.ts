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
  comprasMercadoria: number;
  temComprasMercadoria: boolean;
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

// Ponte provisória: as contas a pagar ainda não têm categoria_id — o formulário
// não possui o campo. Enquanto isso, identificamos o imposto pela descrição.
// Quando as categorias existirem, isso será substituído por um filtro por categoria
// (ex.: `categoria_id` da "Impostos").
const TERMOS_TRIBUTARIOS = [
  "imposto",
  "impostos",
  "tributo",
  "tributos",
  "darf",
  "icms",
  "iss",
  "irpj",
  "csll",
  "cofins",
  "pis",
  "simples nacional",
  "guia de recolhimento",
];

/**
 * Reconhece se a descrição de uma conta a pagar é um tributo (DAS, impostos, guias).
 * - Termos fortes casam com fronteira de palavra, case-insensitive.
 * - "DAS" casa APENAS no início da descrição (`/^\s*das\b/i`) — a preposição "das"
 *   no meio da frase (ex.: "Aluguel das lojas") NUNCA é considerada imposto, porque
 *   não é precedida de início de string.
 */
export function ehDespesaTributaria(descricao: string): boolean {
  const texto = descricao.trim();
  if (/^\s*das\b/i.test(texto)) return true;
  return TERMOS_TRIBUTARIOS.some((termo) => {
    const escape = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    return new RegExp(`\\b${escape}\\b`, "i").test(texto);
  });
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
      setDre({
        ...dreMock,
        comprasMercadoria: dreMock.custos,
        temComprasMercadoria: true,
        cmvDisponivel: true,
      });
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
          .select("id, valor_total, status_venda")
          .eq("empresa_id", empresaId)
          .is("deletado_em", null)
          .gte("criado_em", inicio)
          .lte("criado_em", fim + "T23:59:59"),
        supabase
          .from("me_contas_pagar")
          .select("valor, valor_pago, descricao, categoria_id")
          .eq("empresa_id", empresaId)
          .eq("status", "pago")
          .not("data_pagamento", "is", null)
          .gte("data_pagamento", inicio)
          .lte("data_pagamento", fim),
        // Contas em aberto (pendente/vencido): contam no mês do vencimento
        supabase
          .from("me_contas_pagar")
          .select("valor, valor_pago, descricao, categoria_id")
          .eq("empresa_id", empresaId)
          .in("status", ["pendente", "vencido"])
          .gte("data_vencimento", inicio)
          .lte("data_vencimento", fim),
      ]);

      if (vendasResult.error) throw vendasResult.error;
      if (pagasResult.error) throw pagasResult.error;
      if (pendentesResult.error) throw pendentesResult.error;

      // Exclui vendas canceladas da receita. O filtro é feito NO CLIENTE (e não com
      // `.neq("status_venda", "cancelado")`) porque, em SQL, `NULL != 'cancelado'`
      // avalia para `NULL` — um `.neq` postgREST descartaria vendas sem status.
      const vendas = ((vendasResult.data ?? []) as {
        id: string;
        valor_total: number | null;
        status_venda: string | null;
      }[]).filter((v) => v.status_venda !== "cancelado");
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
      const contasPagas = (pagasResult.data ?? []) as { valor: number | null; valor_pago: number | null; descricao: string | null; categoria_id: string | null }[];
      const contasEmAberto = (pendentesResult.data ?? []) as { valor: number | null; valor_pago: number | null; descricao: string | null; categoria_id: string | null }[];

      // TIPO das categorias usadas pelas contas do período, escopado por empresa.
      // Categoria ausente ("Sem categoria") ou inexistente caem em operacional (D3).
      const categoriaIdsUsados = [
        ...new Set(
          [...contasPagas, ...contasEmAberto]
            .map((c) => c.categoria_id)
            .filter((id): id is string => id != null)
        ),
      ];
      const tipoPorCategoria = new Map<string, string>();
      if (categoriaIdsUsados.length > 0) {
        const { data: categorias, error: catError } = await supabase
          .from("me_categoria_financeira")
          .select("id, tipo")
          .eq("empresa_id", empresaId)
          .in("id", categoriaIdsUsados);
        if (catError) throw catError;
        for (const cat of categorias ?? []) {
          if (cat.tipo != null) tipoPorCategoria.set(cat.id, cat.tipo);
        }
      }

      const despesasComValor = [
        ...contasPagas.map((c) => ({ descricao: c.descricao, valor: Number(c.valor_pago ?? c.valor ?? 0), categoriaId: c.categoria_id })),
        ...contasEmAberto.map((c) => ({ descricao: c.descricao, valor: Number(c.valor ?? 0), categoriaId: c.categoria_id })),
      ];

      // Split de mercadoria (F1): o custo de mercadoria vem da COMPRA REAL — contas a
      // pagar cuja categoria tem tipo `mercadoria`. O CMV derivado da venda sai do resultado.
      const ehMercadoria = (c: { categoriaId: string | null }): boolean =>
        c.categoriaId != null && tipoPorCategoria.get(c.categoriaId) === "mercadoria";
      const contasMercadoria = despesasComValor.filter(ehMercadoria);
      const comprasMercadoria = contasMercadoria.reduce((s, c) => s + Number(c.valor || 0), 0);
      const temComprasMercadoria = contasMercadoria.length > 0;
      const despesasNaoMercadoria = despesasComValor.filter((c) => !ehMercadoria(c));

      // Impostos: contas a pagar tributárias (ex.: "DAS - Simples Nacional"),
      // reconhecidas pela descrição enquanto não houver categoria_id.
      // Contam tanto pagas quanto em aberto, coerente com o resto do DRE.
      const despesasTributarias = despesasNaoMercadoria.filter((c) => ehDespesaTributaria(c.descricao ?? ""));
      const impostos = despesasTributarias.reduce((s, c) => s + Number(c.valor || 0), 0);

      // Despesas operacionais excluem os impostos (evita dupla contagem: o mesmo
      // valor não pode aparecer na linha de Impostos E em Despesas Operacionais).
      const despesasNaoTributarias = despesasNaoMercadoria.filter((c) => !ehDespesaTributaria(c.descricao ?? ""));
      const despesasOperacionais = despesasNaoTributarias.reduce((s, c) => s + Number(c.valor || 0), 0);

      // Agrupar despesas por categoria (proxy: primeiras 2 palavras da descrição) —
      // o pie reflete Despesas Operacionais, portanto também exclui as tributárias.
      const categoriasDespesas = agruparDespesasPorCategoria(despesasNaoTributarias);

      // Cálculos
      const receitaLiquida = receitaBruta - impostos;
      // Custo de Mercadoria: compra real (categoria tipo `mercadoria`). O CMV derivado
      // (custos) não entra mais no resultado — mantido como dado informativo.
      const lucroBruto = receitaLiquida - comprasMercadoria;
      const lucroLiquido = lucroBruto - despesasOperacionais;
      const margemLucro = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

      setDre({
        periodo: nomeMesPeriodo(periodo),
        receitaBruta,
        impostos,
        receitaLiquida,
        custos,
        comprasMercadoria,
        temComprasMercadoria,
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
