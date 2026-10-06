import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  PRODUTOS,
  type Produto,
  type EstoqueStatus,
  type ProdutoStatus,
} from "../components/estoque/estoqueMockData";
import type { NaturezaProduto } from "../types/producao";

interface DBProduto {
  id: number;
  empresa_id: string | null;
  nome_produto: string | null;
  preco: number | null;
  preco_varejo: number | null;
  preco_custo: number | null;
  sku: string | null;
  estoque_atual: number | null;
  estoque_minimo: number | null;
  categoria_id: number | null;
  ativo: boolean | null;
  unidade_medida_id: number | null;
  unidade: string | null;
  tipo: string | null;
  descricao: string | null;
  codigo_barras: string | null;
  foto_url: string | null;
  opcoes_config: unknown;
  exibir_vitrine: boolean | null;
  /** Produção F1: eixo simples/composto/insumo (NÃO confundir com `tipo`, legado) */
  natureza: string | null;
  /** Produção F2: unidade de compra + fator de conversão (SPEC §2.1/§4) */
  unidade_compra: string | null;
  fator_conversao: number | string | null;
  /** Embed do PostgREST: me_produto.categoria_id → me_categoria */
  me_categoria: { id_categoria: number; nome_categoria: string | null; cor: string | null } | null;
}

/** `numeric` pode chegar como string no client; null/ausente = sem conversão (F2). */
function normalizarFator(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

/**
 * Domínio real da coluna (CHECK 'simples'|'composto'|'insumo') com default
 * 'simples' para linha/embed sem o campo — SPEC-Producao-BOM-Fase1 §3/§4.
 */
function normalizarNatureza(valor: string | null | undefined): NaturezaProduto {
  return valor === "composto" || valor === "insumo" ? valor : "simples";
}

function calcEstoqueStatus(estoque: number, estoqueMinimo: number): EstoqueStatus {
  if (estoque === 0) return "zerado";
  if (estoque <= estoqueMinimo) return "baixo";
  return "ok";
}

function mapProduto(db: DBProduto): Produto {
  const estoque = db.estoque_atual || 0;
  // Valor real da coluna estoque_minimo (NOT NULL DEFAULT 5 no banco);
  // fallback defensivo preserva linhas antigas/embed sem a coluna.
  const estoqueMinimo = db.estoque_minimo ?? 5;

  // Defensivo: só strings viram tags; entradas não-string (uso futuro da coluna) são ignoradas
  const opcoes = Array.isArray(db.opcoes_config) ? db.opcoes_config : [];
  const tags = opcoes.filter((v): v is string => typeof v === "string");

  return {
    id: String(db.id),
    nome: db.nome_produto || "Sem nome",
    sku: db.sku || "",
    codigoBarras: db.codigo_barras || undefined,
    // Categoria REAL, resolvida pelo embed (antes lia `tipo`, que é tipo de produto)
    categoria: db.me_categoria?.nome_categoria || "Sem categoria",
    categoriaId: db.categoria_id ?? null,
    categoriaCor: db.me_categoria?.cor ?? null,
    unidade: db.unidade || "un",
    precoVenda: Number(db.preco) || 0,
    // preco_varejo → precoPromocional ("Preço promocional" / preço "de" da vitrine)
    precoPromocional: db.preco_varejo ?? undefined,
    precoCusto: Number(db.preco_custo) || 0,
    estoque,
    estoqueMinimo,
    status: (db.ativo ? "ativo" : "inativo") as ProdutoStatus,
    // exibir_vitrine — toggle "Mostrar na vitrine" (SPEC §2.3)
    exibirVitrine: db.exibir_vitrine ?? false,
    // natureza — eixo de produção (SPEC-Producao-BOM-Fase1 §4); ausente = 'simples'
    natureza: normalizarNatureza(db.natureza),
    // conversão de compra do insumo (SPEC-Producao-BOM-Fase2 §4); ausente = null
    unidadeCompra: db.unidade_compra ?? null,
    fatorConversao: normalizarFator(db.fator_conversao),
    estoqueStatus: calcEstoqueStatus(estoque, estoqueMinimo),
    possuiVariacoes: false,
    descricaoCurta: db.descricao || undefined,
    dataCadastro: new Date().toISOString(), // TODO: adicionar coluna criado_em
    ultimaMovimentacao: new Date().toISOString(),
    foto: db.foto_url || undefined,
    totalVendido: 0,
    tags,
  };
}

export interface UseProdutoReturn {
  produto: Produto | undefined;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}

export function useProduto(id: string | undefined): UseProdutoReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [produto, setProduto] = useState<Produto | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarProduto = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem login): usa mock — regra mock-first de 07/09/2026
    if (!session) {
      const mockProduto = PRODUTOS.find((p) => p.id === id);
      setProduto(mockProduto || PRODUTOS[0]);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    // Logado mas empresa não resolvida: NÃO consultar outro tenant
    const empresaId = empresa?.id;
    if (!empresaId) {
      setProduto(undefined);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      const { data: dbProduto, error: produtoError } = await supabase
        .from("me_produto")
        // O wildcard `*` já cobre a coluna nova `natureza` (Produção F1 §4);
        // o embed de categoria continua explícito.
        .select("*, me_categoria(id_categoria, nome_categoria, cor)")
        .eq("id", id)
        .eq("empresa_id", empresaId)
        .maybeSingle();

      if (produtoError) throw produtoError;

      // Com sessão ativa, produto inexistente = empty state real (nunca mock)
      setProduto(dbProduto ? mapProduto(dbProduto as DBProduto) : undefined);
      setError(null);
    } catch (err) {
      console.error("[useProduto] Erro ao buscar produto:", err);
      if (!session) {
        const mockProduto = PRODUTOS.find((p) => p.id === id);
        setProduto(mockProduto || PRODUTOS[0]);
        setIsFallback(true);
      } else {
        setProduto(undefined);
        setError(err instanceof Error ? err.message : "Erro ao carregar produto");
        setIsFallback(false);
      }
    } finally {
      setLoading(false);
    }
  }, [id, empresa, session, authLoading]);

  useEffect(() => {
    carregarProduto();
  }, [carregarProduto]);

  return {
    produto,
    loading,
    error,
    isFallback,
    recarregar: carregarProduto,
  };
}