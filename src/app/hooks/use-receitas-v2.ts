/**
 * Dados do editor de receita (redesign Compro·Faço·Vendo — estoque v2).
 *
 * - **Leitura:** `me_produto` (pai) + `est_ficha_tecnica` com embed do componente
 *   (`me_produto!componente_id` — hint obrigatório: a tabela tem DUAS FKs para
 *   `me_produto`). Padrão de `use-ficha-tecnica.ts` / `use-produtos.ts`.
 * - **Escritas v2:** linha a linha (UPDATE/INSERT/DELETE em `est_ficha_tecnica`)
 *   + `exibir_vitrine`/`preco_varejo` em `me_produto`. Cada operação é uma
 *   chamada própria do PostgREST protegida por RLS — a tela trata falha por
 *   operação com toast + "Tentar de novo".
 * - **Sem sessão / sem empresa:** `produto = null`, `itens = []` — o editor é
 *   funcionalidade nova e NÃO tem fallback mock (disciplina de
 *   `use-ficha-tecnica.ts`); a tela mostra dica de login.
 * - Contagem "usada em N receitas": `count` head-only em `est_ficha_tecnica`
 *   onde `componente_id` = este produto.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { formatarQtd } from "../lib/produto-utils";

/* ────────────────────────────── tipos ────────────────────────────── */

export interface ReceitaV2Produto {
  /** `me_produto.id` (integer no banco; string na UI — contrato de `Produto.id`) */
  id: string;
  nome: string;
  /** unidade de ESTOQUE/base (`me_produto.unidade`) */
  unidade: string;
  rendimentoLote: number | null;
  precoVarejo: number | null;
  preco: number | null;
  exibirVitrine: boolean;
  estoqueAtual: number;
}

export interface ReceitaV2Ingrediente {
  /** `est_ficha_tecnica.id` (uuid) */
  id: string;
  componenteId: string;
  nome: string;
  /** unidade de estoque do componente (a unidade da `quantidade_por_unidade`) */
  unidade: string;
  unidadeCompra: string | null;
  fatorConversao: number | null;
  precoCusto: number | null;
  ultimoPrecoCompra: number | null;
  /** quantidade na unidade base do componente, por 1 unidade do pai */
  quantidadePorUnidade: number;
  perdaPct: number;
}

export interface InsumoOpcao {
  id: string;
  nome: string;
  unidade: string;
  unidadeCompra: string | null;
  fatorConversao: number | null;
  precoCusto: number | null;
  ultimoPrecoCompra: number | null;
}

/* ───────────────────────────── helpers numéricos ───────────────────────────── */

/** `numeric` pode chegar como string no client (padrão dos hooks reais). */
function num(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function num0(valor: string | number | null | undefined): number {
  return num(valor) ?? 0;
}

/**
 * Custo por UNIDADE DE ESTOQUE do insumo: `preco_custo` (custeado na recepção
 * da Fase 2) e, na ausência dele, `ultimo_preco_compra ÷ fator_conversão`
 * (último preço pago na unidade de compra → vira unidade base).
 * null = custo pendente (a linha mostra "custo pendente", nunca 0 disfarçado).
 */
export function custoUnitarioBase(
  ing: Pick<ReceitaV2Ingrediente, "precoCusto" | "ultimoPrecoCompra" | "fatorConversao">,
): number | null {
  if (ing.precoCusto != null && ing.precoCusto > 0) return ing.precoCusto;
  if (ing.ultimoPrecoCompra != null && ing.ultimoPrecoCompra > 0) {
    const fator = ing.fatorConversao && ing.fatorConversao > 0 ? ing.fatorConversao : 1;
    return ing.ultimoPrecoCompra / fator;
  }
  return null;
}

/** Custo real da linha: `qtd × custo base × (1 + perda%)`. null = pendente. */
export function custoLinhaReceita(ing: ReceitaV2Ingrediente): number | null {
  const base = custoUnitarioBase(ing);
  if (base == null) return null;
  return ing.quantidadePorUnidade * base * (1 + ing.perdaPct / 100);
}

/** R$ com 4 casas quando o valor é pequeno (R$ 0,0139/g no recibo). */
export function brlSmart(v: number): string {
  if (v > 0 && v < 0.1) return `R$ ${v.toFixed(4).replace(".", ",")}`;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

/**
 * Recibo da linha — a conta visível, no espírito do redesign:
 * `1 lata = 395 g · 395 g × R$ 0,0139/g = R$ 5,49` (perda entra como `× 1,05`
 * quando > 0). Sem custo → devolve só a conversão + "custo pendente".
 */
export function reciboLinha(ing: ReceitaV2Ingrediente): string {
  const partes: string[] = [];
  if (ing.fatorConversao && ing.fatorConversao > 0 && ing.unidadeCompra) {
    partes.push(`1 ${ing.unidadeCompra} = ${formatarQtd(ing.fatorConversao)} ${ing.unidade}`);
  }
  const base = custoUnitarioBase(ing);
  const qtdComPerda = ing.quantidadePorUnidade * (1 + ing.perdaPct / 100);
  if (base == null) {
    partes.push(`${formatarQtd(qtdComPerda)} ${ing.unidade} × custo pendente`);
    return partes.join(" · ");
  }
  const mult = `R$ ${base.toFixed(4).replace(".", ",")}/${ing.unidade}`;
  const conta =
    ing.perdaPct > 0
      ? `${formatarQtd(ing.quantidadePorUnidade)} ${ing.unidade} × ${mult} × ${(1 + ing.perdaPct / 100).toFixed(2).replace(".", ",")} de perda = ${brlSmart(qtdComPerda * base)}`
      : `${formatarQtd(qtdComPerda)} ${ing.unidade} × ${mult} = ${brlSmart(ing.quantidadePorUnidade * base)}`;
  partes.push(conta);
  return partes.join(" · ");
}

/* ───────────────────────────── linhas do banco ───────────────────────────── */

interface DBPai {
  id: number;
  nome_produto: string | null;
  unidade: string | null;
  rendimento_lote: string | number | null;
  preco_varejo: string | number | null;
  preco: string | number | null;
  exibir_vitrine: boolean | null;
  estoque_atual: string | number | null;
}

interface DBIng {
  id: string;
  componente_id: number;
  quantidade_por_unidade: string | number;
  perda_pct: string | number;
  me_produto: {
    nome_produto: string | null;
    unidade: string | null;
    unidade_compra: string | null;
    fator_conversao: string | number | null;
    preco_custo: string | number | null;
    ultimo_preco_compra: string | number | null;
  } | null;
}

interface DBInsumo {
  id: number;
  nome_produto: string | null;
  unidade: string | null;
  unidade_compra: string | null;
  fator_conversao: string | number | null;
  preco_custo: string | number | null;
  ultimo_preco_compra: string | number | null;
}

function mapIng(db: DBIng): ReceitaV2Ingrediente {
  return {
    id: db.id,
    componenteId: String(db.componente_id),
    nome: db.me_produto?.nome_produto || "Sem nome",
    unidade: db.me_produto?.unidade || "un",
    unidadeCompra: db.me_produto?.unidade_compra ?? null,
    fatorConversao: num(db.me_produto?.fator_conversao),
    precoCusto: num(db.me_produto?.preco_custo),
    ultimoPrecoCompra: num(db.me_produto?.ultimo_preco_compra),
    quantidadePorUnidade: num0(db.quantidade_por_unidade),
    perdaPct: num0(db.perda_pct),
  };
}

/* ─────────────────────────────── hook ─────────────────────────────── */

export interface UseReceitaV2Return {
  produto: ReceitaV2Produto | null;
  itens: ReceitaV2Ingrediente[];
  /** quantas fichas usam este produto como componente ("usada em N receitas") */
  usadaEm: number;
  loading: boolean;
  error: string | null;
  temSessao: boolean;
  recarregar: () => void;
  /** UPDATE em est_ficha_tecnica (qty/perda da linha) */
  atualizarIngrediente: (
    fichaId: string,
    patch: { quantidadePorUnidade?: number; perdaPct?: number },
  ) => Promise<{ ok: boolean; error?: string }>;
  /** INSERT em est_ficha_tecnica */
  adicionarIngrediente: (params: {
    componenteId: string;
    quantidadePorUnidade: number;
    perdaPct: number;
  }) => Promise<{ ok: boolean; error?: string }>;
  /** DELETE em est_ficha_tecnica */
  excluirIngrediente: (fichaId: string) => Promise<{ ok: boolean; error?: string }>;
  /** UPDATE me_produto.exibir_vitrine ("Vendo isso") */
  definirVitrine: (valor: boolean) => Promise<{ ok: boolean; error?: string }>;
  /** UPDATE me_produto.preco_varejo (null = sem preço) */
  definirPrecoVarejo: (valor: number | null) => Promise<{ ok: boolean; error?: string }>;
  /** busca em me_produto natureza='insumo' para o sheet de adicionar */
  buscarInsumos: (termo: string) => Promise<InsumoOpcao[]>;
}

export function useReceitaV2(produtoId: string | undefined): UseReceitaV2Return {
  const { empresa, session, loading: authLoading } = useAuth();
  const empresaId = empresa?.id ?? null;
  const temSessao = session !== null;

  const [produto, setProduto] = useState<ReceitaV2Produto | null>(null);
  const [itens, setItens] = useState<ReceitaV2Ingrediente[]>([]);
  const [usadaEm, setUsadaEm] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ehIdValido = !!produtoId && Number.isInteger(Number(produtoId));

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);

    // Sem sessão = sem editor real (funcionalidade nova, sem fallback mock)
    if (!temSessao || !empresaId || !ehIdValido) {
      setProduto(null);
      setItens([]);
      setUsadaEm(0);
      if (temSessao && !ehIdValido) {
        setError("Receita não encontrada — verifique o endereço ou volte para a lista.");
      }
      setLoading(false);
      return;
    }

    const paiId = Number(produtoId);
    try {
      const [{ data: paiData, error: paiError }, { data: ingData, error: ingError }, { count, error: countError }] =
        await Promise.all([
          supabase
            .from("me_produto")
            .select(
              "id, nome_produto, unidade, rendimento_lote, preco_varejo, preco, exibir_vitrine, estoque_atual"
            )
            .eq("id", paiId)
            .eq("empresa_id", empresaId)
            .maybeSingle(),
          supabase
            .from("est_ficha_tecnica")
            .select(
              "id, componente_id, quantidade_por_unidade, perda_pct, " +
                "me_produto!componente_id (nome_produto, unidade, unidade_compra, fator_conversao, preco_custo, ultimo_preco_compra)"
            )
            .eq("empresa_id", empresaId)
            .eq("produto_pai_id", paiId)
            .order("criado_em", { ascending: true }),
          supabase
            .from("est_ficha_tecnica")
            .select("id", { count: "exact", head: true })
            .eq("empresa_id", empresaId)
            .eq("componente_id", paiId),
        ]);

      if (paiError) throw paiError;
      if (ingError) throw ingError;
      if (countError) throw countError;

      if (!paiData) {
        setProduto(null);
        setItens([]);
        setError("Receita não encontrada nesta empresa.");
        return;
      }

      const p = paiData as DBPai;
      setProduto({
        id: String(p.id),
        nome: p.nome_produto || "Sem nome",
        unidade: p.unidade || "un",
        rendimentoLote: num(p.rendimento_lote),
        precoVarejo: num(p.preco_varejo),
        preco: num(p.preco),
        exibirVitrine: p.exibir_vitrine ?? false,
        estoqueAtual: num0(p.estoque_atual),
      });
      setItens(((ingData as unknown as DBIng[] | null) || []).map(mapIng));
      setUsadaEm(count ?? 0);
    } catch (err) {
      console.error("[useReceitaV2] Erro ao carregar a receita:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar a receita");
    } finally {
      setLoading(false);
    }
  }, [empresaId, temSessao, authLoading, produtoId, ehIdValido]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  /* ───────────────────────────── escritas ───────────────────────────── */

  const exigeSessao = useCallback((): string | null => {
    if (!temSessao) return "Faça login para editar a receita.";
    if (!empresaId) return "Empresa não identificada para este usuário.";
    if (!ehIdValido || !produtoId) return "Produto pai inválido — nada foi gravado.";
    return null;
  }, [temSessao, empresaId, ehIdValido, produtoId]);

  const atualizarIngrediente = useCallback(
    async (
      fichaId: string,
      patch: { quantidadePorUnidade?: number; perdaPct?: number }
    ): Promise<{ ok: boolean; error?: string }> => {
      const bloqueio = exigeSessao();
      if (bloqueio) return { ok: false, error: bloqueio };
      if (patch.quantidadePorUnidade !== undefined && !(patch.quantidadePorUnidade > 0)) {
        return { ok: false, error: "Quantidade deve ser maior que zero." };
      }
      if (patch.perdaPct !== undefined && patch.perdaPct < 0) {
        return { ok: false, error: "A perda não pode ser negativa." };
      }
      try {
        const payload: Record<string, number> = {};
        if (patch.quantidadePorUnidade !== undefined) payload.quantidade_por_unidade = patch.quantidadePorUnidade;
        if (patch.perdaPct !== undefined) payload.perda_pct = patch.perdaPct;
        const { error: updError } = await supabase
          .from("est_ficha_tecnica")
          .update(payload)
          .eq("id", fichaId)
          .eq("empresa_id", empresaId);
        if (updError) throw updError;
        await carregarDados();
        return { ok: true };
      } catch (err) {
        console.error("[useReceitaV2] Erro ao atualizar ingrediente:", err);
        return { ok: false, error: err instanceof Error ? err.message : "Não foi possível salvar a linha." };
      }
    },
    [empresaId, exigeSessao, carregarDados]
  );

  const adicionarIngrediente = useCallback(
    async (params: {
      componenteId: string;
      quantidadePorUnidade: number;
      perdaPct: number;
    }): Promise<{ ok: boolean; error?: string }> => {
      const bloqueio = exigeSessao();
      if (bloqueio) return { ok: false, error: bloqueio };
      if (!(params.quantidadePorUnidade > 0)) {
        return { ok: false, error: "Quantidade deve ser maior que zero." };
      }
      if (params.perdaPct < 0) return { ok: false, error: "A perda não pode ser negativa." };
      try {
        const { error: insError } = await supabase.from("est_ficha_tecnica").insert({
          empresa_id: empresaId,
          produto_pai_id: Number(produtoId),
          componente_id: Number(params.componenteId),
          quantidade_por_unidade: params.quantidadePorUnidade,
          perda_pct: params.perdaPct || 0,
        });
        if (insError) throw insError;
        await carregarDados();
        return { ok: true };
      } catch (err) {
        console.error("[useReceitaV2] Erro ao adicionar ingrediente:", err);
        const codigo = (err as { code?: string })?.code;
        if (codigo === "23505") {
          return { ok: false, error: "Este ingrediente já está na receita — edite a linha existente." };
        }
        return { ok: false, error: err instanceof Error ? err.message : "Não foi possível adicionar o ingrediente." };
      }
    },
    [empresaId, produtoId, exigeSessao, carregarDados]
  );

  const excluirIngrediente = useCallback(
    async (fichaId: string): Promise<{ ok: boolean; error?: string }> => {
      const bloqueio = exigeSessao();
      if (bloqueio) return { ok: false, error: bloqueio };
      try {
        const { error: delError } = await supabase
          .from("est_ficha_tecnica")
          .delete()
          .eq("id", fichaId)
          .eq("empresa_id", empresaId);
        if (delError) throw delError;
        await carregarDados();
        return { ok: true };
      } catch (err) {
        console.error("[useReceitaV2] Erro ao excluir ingrediente:", err);
        return { ok: false, error: err instanceof Error ? err.message : "Não foi possível excluir a linha." };
      }
    },
    [empresaId, exigeSessao, carregarDados]
  );

  const definirVitrine = useCallback(
    async (valor: boolean): Promise<{ ok: boolean; error?: string }> => {
      const bloqueio = exigeSessao();
      if (bloqueio) return { ok: false, error: bloqueio };
      try {
        const { error: updError } = await supabase
          .from("me_produto")
          .update({ exibir_vitrine: valor })
          .eq("id", Number(produtoId))
          .eq("empresa_id", empresaId);
        if (updError) throw updError;
        setProduto((prev) => (prev ? { ...prev, exibirVitrine: valor } : prev));
        return { ok: true };
      } catch (err) {
        console.error("[useReceitaV2] Erro ao atualizar a vitrine:", err);
        return { ok: false, error: err instanceof Error ? err.message : "Não foi possível alterar o \"Vendo isso\"." };
      }
    },
    [empresaId, produtoId, exigeSessao]
  );

  const definirPrecoVarejo = useCallback(
    async (valor: number | null): Promise<{ ok: boolean; error?: string }> => {
      const bloqueio = exigeSessao();
      if (bloqueio) return { ok: false, error: bloqueio };
      if (valor !== null && !(valor >= 0)) {
        return { ok: false, error: "Preço inválido." };
      }
      try {
        const { error: updError } = await supabase
          .from("me_produto")
          .update({ preco_varejo: valor })
          .eq("id", Number(produtoId))
          .eq("empresa_id", empresaId);
        if (updError) throw updError;
        setProduto((prev) => (prev ? { ...prev, precoVarejo: valor } : prev));
        return { ok: true };
      } catch (err) {
        console.error("[useReceitaV2] Erro ao salvar o preço de venda:", err);
        return { ok: false, error: err instanceof Error ? err.message : "Não foi possível salvar o preço." };
      }
    },
    [empresaId, produtoId, exigeSessao]
  );

  const buscarInsumos = useCallback(
    async (termo: string): Promise<InsumoOpcao[]> => {
      if (!temSessao || !empresaId) return [];
      const limpo = termo.trim();
      try {
        let query = supabase
          .from("me_produto")
          .select(
            "id, nome_produto, unidade, unidade_compra, fator_conversao, preco_custo, ultimo_preco_compra"
          )
          .eq("empresa_id", empresaId)
          .eq("ativo", true)
          .eq("natureza", "insumo")
          .order("nome_produto", { ascending: true })
          .limit(30);
        if (limpo) query = query.ilike("nome_produto", `%${limpo}%`);
        const { data, error: busError } = await query;
        if (busError) throw busError;
        return ((data as DBInsumo[] | null) || [])
          .filter((d) => String(d.id) !== produtoId)
          .map((d) => ({
            id: String(d.id),
            nome: d.nome_produto || "Sem nome",
            unidade: d.unidade || "un",
            unidadeCompra: d.unidade_compra,
            fatorConversao: num(d.fator_conversao),
            precoCusto: num(d.preco_custo),
            ultimoPrecoCompra: num(d.ultimo_preco_compra),
          }));
      } catch (err) {
        console.error("[useReceitaV2] Erro ao buscar insumos:", err);
        return [];
      }
    },
    [temSessao, empresaId, produtoId]
  );

  return {
    produto,
    itens,
    usadaEm,
    loading,
    error,
    temSessao,
    recarregar: carregarDados,
    atualizarIngrediente,
    adicionarIngrediente,
    excluirIngrediente,
    definirVitrine,
    definirPrecoVarejo,
    buscarInsumos,
  };
}
