/**
 * Nova Compra V2 — redesign Compro · Faço · Vendo.
 *
 * Dados + persistência da tela `components/estoque-v2/compra/NovaCompraV2Page`.
 *
 * - Busca REAL de insumos: `me_produto` (natureza='insumo', ativo, empresa_id)
 *   lendo id, nome_produto, unidade, unidade_compra, fator_conversao,
 *   ultimo_preco_compra e estoque_atual.
 * - Chips "últimas compras": itens da última `est_compra` da empresa
 *   (embed `est_compra_item.me_produto`, padrão `use-compras.ts`).
 * - MODO DEMO (sem sessão): lista mock plausível (regra mock-first de
 *   `use-produtos.ts`) — `isFallback=true` e a tela desabilita o salvar.
 * - SALVAR: 1 insert em `est_compra` (empresa_id, fornecedor_id NULL-able,
 *   status='PENDENTE', valor_total somado no client, nota_fiscal null) +
 *   itens em `est_compra_item` (compra_id, produto_id, quantidade,
 *   valor_unitario). Falha nos itens apaga o pai (compensação — padrão
 *   `use-criar-compra.ts`). Sem `receberAgora`, NÃO mexe em estoque nem em
 *   movimentações: o fluxo de RECEBER é quem fecha o estoque.
 * - RECEBER AGORA (feedback fundador 24/10): "muitas compras chegam prontas
 *   do mercado". Depois do salvar bem-sucedido, chama o MESMO recebimento do
 *   v1 — `useReceberCompra` → RPC `receber_compra` (transação única:
 *   RECEBIDO + data_recebimento, snapshot `est_recebimento`, `est_movimentacao`,
 *   estoque/custo médio/`ultimo_preco_compra`, conta a pagar). Datas padrão
 *   copiadas de `ComprasPage.tsx:983-984` (recebimento hoje, vencimento +30d).
 *   Falha no recebimento NÃO desfaz a compra: `success:true` + `receberErro`
 *   (a tela manda finalizar em Compras).
 * - `fornecedor_id` é NULL-ável no banco (migration aplicada): o seletor da
 *   tela é OPCIONAL de verdade — em branco salva `fornecedor_id: null`
 *   (bug Assaí: o antigo fallback "primeiro ativo" atribuía a compra a um
 *   fornecedor que não era o do dia).
 */
import { useState, useEffect, useCallback } from "react";
import { addDays, format } from "date-fns";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useReceberCompra } from "./use-receber-compra";
import { ESTADO_COMPRA } from "../types/producao";

/** Insumo como a tela de compra enxerga (snapshot mínimo de `me_produto`). */
export interface InsumoV2 {
  id: number;
  nome: string;
  /** unidade de ESTOQUE (g, un, ml…) */
  unidade: string;
  /** unidade de COMPRA — null = compra direto na unidade do estoque */
  unidadeCompra: string | null;
  /** quantos de estoque cabem em 1 unidade de compra */
  fatorConversao: number | null;
  /** último preço pago (na unidade de COMPRA) — referência de custo */
  ultimoPrecoCompra: number | null;
  /** estoque atual na unidade de estoque */
  estoqueAtual: number;
}

export interface ChipUltimaCompraV2 {
  produtoId: number;
  nome: string;
  /** quantidade do item na última compra (unidade de COMPRA) — pré-preenche a recompra */
  quantidade: number;
}

/** Fornecedor como a tela enxerga (mesma forma de `use-fornecedores`, cópia
 *  mínima para não acoplar o wizard ao hook de cadastro). */
export interface FornecedorV2 {
  id: string;
  nome: string;
}

/** Linha fechada para persistência (unidade de COMPRA). */
export interface ItemCompraV2Input {
  produtoId: number;
  /** quantidade na unidade de COMPRA (latas, caixas…) */
  quantidade: number;
  /** preço por UNIDADE DE COMPRA (ex.: R$ 5 a lata) — `est_compra_item.valor_unitario` */
  valorUnitario: number;
}

export interface SalvarCompraV2Result {
  success: boolean;
  id?: string;
  error?: string;
  /** `receberAgora=true` e o recebimento (RPC) também deu certo */
  recebido?: boolean;
  /** compra salva como PENDENTE, mas o "receber agora" falhou (msg de negócio) */
  receberErro?: string;
}

interface DBInsumo {
  id: number;
  nome_produto: string | null;
  unidade: string | null;
  unidade_compra: string | null;
  fator_conversao: string | number | null;
  ultimo_preco_compra: string | number | null;
  estoque_atual: string | number | null;
}

interface DBUltimaCompra {
  id: string;
  est_compra_item: Array<{
    produto_id: number;
    quantidade: string | number | null;
    me_produto: { nome_produto: string | null } | null;
  }> | null;
}

interface DBFornecedor {
  id: string;
  nome_fornecedor: string | null;
}

/** `numeric` pode chegar como string no client (padrão dos hooks reais). */
function num(valor: string | number | null | undefined): number {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function fator(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function preco(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function mapInsumo(db: DBInsumo): InsumoV2 {
  return {
    id: db.id,
    nome: db.nome_produto || "Sem nome",
    unidade: db.unidade || "un",
    unidadeCompra: db.unidade_compra?.trim() || null,
    fatorConversao: fator(db.fator_conversao),
    ultimoPrecoCompra: preco(db.ultimo_preco_compra),
    estoqueAtual: num(db.estoque_atual),
  };
}

/**
 * MODO DEMO — insumos plausíveis de confeitaria de Suzano (regra mock-first;
 * nunca dados de tenant real). ids 9001+ nunca colidem com o banco porque o
 * salvar está bloqueado sem sessão.
 */
const INSUMOS_DEMO: InsumoV2[] = [
  { id: 9001, nome: "Leite condensado", unidade: "g", unidadeCompra: "lata", fatorConversao: 395, ultimoPrecoCompra: 5.49, estoqueAtual: 2400 },
  { id: 9002, nome: "Creme de leite", unidade: "g", unidadeCompra: "caixa", fatorConversao: 200, ultimoPrecoCompra: 2.89, estoqueAtual: 1800 },
  { id: 9003, nome: "Farinha de trigo", unidade: "g", unidadeCompra: "pacote", fatorConversao: 1000, ultimoPrecoCompra: 4.79, estoqueAtual: 900 },
  { id: 9004, nome: "Ovos", unidade: "un", unidadeCompra: "dúzia", fatorConversao: 12, ultimoPrecoCompra: 12.0, estoqueAtual: 60 },
  { id: 9005, nome: "Chocolate ao leite", unidade: "g", unidadeCompra: "kg", fatorConversao: 1000, ultimoPrecoCompra: 48.9, estoqueAtual: 3200 },
  { id: 9006, nome: "Essência de baunilha", unidade: "ml", unidadeCompra: null, fatorConversao: null, ultimoPrecoCompra: null, estoqueAtual: 250 },
];

export interface UseNovaCompraV2Return {
  insumos: InsumoV2[];
  /** itens da última compra — chips de "últimas compras" do passo 1 */
  ultimasCompras: ChipUltimaCompraV2[];
  /** fornecedores ativos da empresa — seletor "Quem você comprou?" (passo 1) */
  fornecedores: FornecedorV2[];
  fornecedoresLoading: boolean;
  /** falha do seletor NÃO quebra a tela: só mostra a mensagem inline */
  fornecedoresError: string | null;
  loading: boolean;
  error: string | null;
  /** lista vinha de mock (sem sessão) */
  isFallback: boolean;
  temSessao: boolean;
  salvando: boolean;
  recarregar: () => void;
  salvarCompra: (
    itens: ItemCompraV2Input[],
    fornecedorId?: string | null,
    /** true = após salvar, recebe a compra na hora (RPC `receber_compra`, mesmo caminho do v1) */
    receberAgora?: boolean
  ) => Promise<SalvarCompraV2Result>;
}

export function useNovaCompraV2(): UseNovaCompraV2Return {
  const { empresa, session, loading: authLoading } = useAuth();
  // Recebimento imediato: REUTILIZA o hook/RPC do v1 (`receber_compra`) —
  // nada de aritmética de estoque reinventada aqui.
  const { receberCompra } = useReceberCompra();
  // Depende só do ID do tenant e de haver sessão — nunca da identidade dos
  // objetos (padrão anti-"pisca" do use-produtos, N7).
  const empresaId = empresa?.id ?? null;
  const temSessao = session !== null;

  const [insumos, setInsumos] = useState<InsumoV2[]>([]);
  const [ultimasCompras, setUltimasCompras] = useState<ChipUltimaCompraV2[]>([]);
  const [fornecedores, setFornecedores] = useState<FornecedorV2[]>([]);
  const [fornecedoresLoading, setFornecedoresLoading] = useState(true);
  const [fornecedoresError, setFornecedoresError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setFornecedoresLoading(true);

    // MODO DEMO: lista mock realista para o wizard ser navegável; o salvar
    // fica bloqueado na tela (temSessao=false). Fornecedores SEM mock —
    // mesma disciplina de `use-fornecedores` (criar compra exige tenant).
    if (!temSessao) {
      setInsumos(INSUMOS_DEMO);
      setUltimasCompras([]);
      setFornecedores([]);
      setFornecedoresError(null);
      setFornecedoresLoading(false);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    // Logado sem tenant: NÃO consultar outro empresa (padrão dos hooks reais).
    if (!empresaId) {
      setInsumos([]);
      setUltimasCompras([]);
      setFornecedores([]);
      setFornecedoresError(null);
      setFornecedoresLoading(false);
      setIsFallback(false);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: insumosError } = await supabase
        .from("me_produto")
        .select(
          "id, nome_produto, unidade, unidade_compra, fator_conversao, ultimo_preco_compra, estoque_atual"
        )
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .eq("natureza", "insumo")
        .order("nome_produto");

      if (insumosError) throw insumosError;

      setInsumos(((data as DBInsumo[] | null) || []).map(mapInsumo));
      setIsFallback(false);
    } catch (err) {
      console.error("[useNovaCompraV2] Erro ao carregar insumos:", err);
      setInsumos([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar insumos");
    }

    // Chips de "últimas compras": falha aqui é enfeite quebrado, não bloqueia
    // a tela — degrada para lista sem chips, sem estado de erro. Roda ANTES do
    // setLoading(false) de propósito: a recompra (?insumo=) lê `quantidade`
    // daqui para pré-preencher o rascunho, e a tela só reage com a lista E os
    // chips prontos juntos (setStates no mesmo tick → batched).
    try {
      const { data: ultima } = await supabase
        .from("est_compra")
        .select("id, est_compra_item(produto_id, quantidade, me_produto(nome_produto))")
        .eq("empresa_id", empresaId)
        .order("data_compra", { ascending: false })
        .limit(1);

      const linha = ((ultima as unknown as DBUltimaCompra[] | null) || [])[0];
      const chips = (linha?.est_compra_item || [])
        .map((i) => ({
          produtoId: i.produto_id,
          nome: i.me_produto?.nome_produto || "",
          quantidade: num(i.quantidade),
        }))
        .filter((c) => c.nome && c.produtoId);
      setUltimasCompras(chips);
    } catch (err) {
      console.error("[useNovaCompraV2] Erro ao ler última compra (chips):", err);
      setUltimasCompras([]);
    }

    setLoading(false);

    // Fornecedores do seletor "Quem você comprou?" (mesma query de
    // `use-fornecedores`). Falha aqui não quebra a tela: o campo é opcional
    // de verdade (fornecedor_id NULL no banco) e dá pra salvar sem ele.
    try {
      const { data: forns, error: fornError } = await supabase
        .from("me_fornecedor")
        .select("id, nome_fornecedor")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome_fornecedor", { ascending: true });

      if (fornError) throw fornError;

      setFornecedores(
        ((forns as DBFornecedor[] | null) || []).map((f) => ({
          id: f.id,
          nome: f.nome_fornecedor || "Fornecedor sem nome",
        }))
      );
      setFornecedoresError(null);
    } catch (err) {
      console.error("[useNovaCompraV2] Erro ao carregar fornecedores:", err);
      setFornecedores([]);
      setFornecedoresError(err instanceof Error ? err.message : "Erro ao carregar fornecedores");
    } finally {
      setFornecedoresLoading(false);
    }
  }, [empresaId, temSessao, authLoading]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /**
   * Persiste a compra: pai `est_compra` (PENDENTE — entra no estoque só quando
   * for RECEBIDA) + itens `est_compra_item`. Validações client espelham os
   * CHECKs do banco (quantidade > 0, valor_unitario >= 0). `valorUnitario` é
   * o preço por UNIDADE DE COMPRA (mesma unidade do `quantidade`).
   * Com `receberAgora`, na sequência chama `useReceberCompra` (RPC
   * `receber_compra` do v1) — falha no recebimento devolve `receberErro`
   * sem desfazer a compra salva.
   */
  const salvarCompra = useCallback(
    async (
      itens: ItemCompraV2Input[],
      fornecedorId?: string | null,
      receberAgora?: boolean
    ): Promise<SalvarCompraV2Result> => {
      if (!temSessao || !empresaId) {
        return { success: false, error: "modo demo: entre na sua conta para salvar a compra." };
      }
      if (itens.length === 0) {
        return { success: false, error: "Adicione pelo menos um insumo à compra." };
      }
      for (const item of itens) {
        if (!Number.isInteger(item.produtoId)) {
          return { success: false, error: "Item sem produto válido — remova e adicione de novo." };
        }
        if (!(item.quantidade > 0)) {
          return { success: false, error: "Quantidade deve ser maior que zero em todos os itens." };
        }
        if (!(item.valorUnitario >= 0) || !Number.isFinite(item.valorUnitario)) {
          return { success: false, error: "Valor inválido — confira o valor unitário dos itens." };
        }
      }

      setSalvando(true);
      try {
        // Produtos existem nesta empresa? (espelho use-criar-compra)
        const ids = [...new Set(itens.map((i) => i.produtoId))];
        const { data: produtos, error: produtosError } = await supabase
          .from("me_produto")
          .select("id")
          .in("id", ids)
          .eq("empresa_id", empresaId);
        if (produtosError) throw produtosError;

        const achados = new Set(((produtos as Array<{ id: number }> | null) || []).map((p) => p.id));
        if (ids.some((id) => !achados.has(id))) {
          throw new Error("Insumo não encontrado nesta empresa. Atualize a lista e tente de novo.");
        }

        // Fornecedor OPCIONAL de verdade (migration: `est_compra.fornecedor_id`
        // NULL-ável): em branco salva `null` — SEM fallback "primeiro ativo"
        // (bug Assaí: a compra era atribuída a um fornecedor que não era o do dia).
        const fornecedor = fornecedorId?.trim() || null;

        const valorTotal =
          Math.round(itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0) * 100) / 100;

        const { data: compra, error: paiError } = await supabase
          .from("est_compra")
          .insert({
            empresa_id: empresaId,
            fornecedor_id: fornecedor,
            status: ESTADO_COMPRA.PENDENTE,
            valor_total: valorTotal,
            nota_fiscal: null,
          })
          .select("id")
          .single();

        if (paiError) throw paiError;
        if (!compra?.id) throw new Error("Não foi possível criar a compra.");

        const { error: itensError } = await supabase
          .from("est_compra_item")
          .insert(
            itens.map((i) => ({
              compra_id: compra.id,
              produto_id: i.produtoId,
              quantidade: i.quantidade,
              valor_unitario: i.valorUnitario,
            }))
          );

        if (itensError) {
          // compensação: sem itens a compra é órfã na lista — remove o pai
          await supabase.from("est_compra").delete().eq("id", compra.id);
          throw itensError;
        }

        if (!receberAgora) {
          return { success: true, id: compra.id };
        }

        // "Comprar no mercado já chega com a sacola": recebe na hora usando o
        // MESMO caminho do v1 (RPC `receber_compra`). Datas = defaults de
        // `ComprasPage.tsx:983-984`: recebimento hoje, conta a pagar +30 dias.
        const hoje = new Date();
        const rc = await receberCompra({
          compraId: compra.id,
          dataRecebimento: format(hoje, "yyyy-MM-dd"),
          dataVencimento: format(addDays(hoje, 30), "yyyy-MM-dd"),
        });
        if (rc.success) {
          return { success: true, id: compra.id, recebido: true };
        }
        // Compra fica PENDENTE salva (não desfaz): a tela oferece finalizar em Compras.
        return {
          success: true,
          id: compra.id,
          receberErro: rc.error || "Não foi possível receber a compra.",
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao salvar a compra.";
        return { success: false, error: message };
      } finally {
        setSalvando(false);
      }
    },
    [empresaId, temSessao, receberCompra]
  );

  return {
    insumos,
    ultimasCompras,
    fornecedores,
    fornecedoresLoading,
    fornecedoresError,
    loading,
    error,
    isFallback,
    temSessao,
    salvando,
    recarregar: carregar,
    salvarCompra,
  };
}
