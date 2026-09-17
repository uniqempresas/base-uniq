import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  PRODUTOS,
  type Produto,
  type EstoqueStatus,
  type ProdutoStatus,
} from "../components/estoque/estoqueMockData";

interface DBProduto {
  id: number;
  empresa_id: string | null;
  nome_produto: string | null;
  preco: number | null;
  preco_varejo: number | null;
  preco_custo: number | null;
  sku: string | null;
  estoque_atual: number | null;
  categoria_id: number | null;
  ativo: boolean | null;
  unidade_medida_id: number | null;
  tipo: string | null;
  descricao: string | null;
  codigo_barras: string | null;
  foto_url: string | null;
  opcoes_config: unknown;
  exibir_vitrine: boolean | null;
  /** Embed do PostgREST: me_produto.categoria_id → me_categoria */
  me_categoria: { id_categoria: number; nome_categoria: string | null; cor: string | null } | null;
}

function calcEstoqueStatus(estoque: number, estoqueMinimo: number): EstoqueStatus {
  if (estoque === 0) return "zerado";
  if (estoque <= estoqueMinimo) return "baixo";
  return "ok";
}

function mapProduto(db: DBProduto): Produto {
  const estoque = db.estoque_atual || 0;
  const estoqueMinimo = 5; // padrão, pode vir de config depois

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
    unidade: "un", // padrão
    precoVenda: Number(db.preco) || 0,
    precoCusto: Number(db.preco_custo) || 0,
    estoque,
    estoqueMinimo,
    status: (db.ativo ? "ativo" : "inativo") as ProdutoStatus,
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