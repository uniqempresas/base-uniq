import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
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
  exibir_vitrine: boolean | null;
}

function calcEstoqueStatus(estoque: number, estoqueMinimo: number): EstoqueStatus {
  if (estoque === 0) return "zerado";
  if (estoque <= estoqueMinimo) return "baixo";
  return "ok";
}

function mapProduto(db: DBProduto): Produto {
  const estoque = db.estoque_atual || 0;
  const estoqueMinimo = 5; // padrão, pode vir de config depois

  return {
    id: String(db.id),
    nome: db.nome_produto || "Sem nome",
    sku: db.sku || "",
    codigoBarras: db.codigo_barras || undefined,
    categoria: db.tipo || "Outros",
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
  };
}

export interface UseProdutosReturn {
  produtos: Produto[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}

export function useProdutos(): UseProdutosReturn {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsFallback(false);

    try {
      const { data: dbProdutos, error: produtosError } = await supabase
        .from("me_produto")
        .select("*")
        .eq("ativo", true)
        .order("nome_produto");

      if (produtosError) throw produtosError;

      const produtosValidos = (dbProdutos as DBProduto[] | null) || [];

      if (produtosValidos.length === 0) {
        setProdutos(PRODUTOS);
        setIsFallback(true);
        setLoading(false);
        return;
      }

      setProdutos(produtosValidos.map(mapProduto));
    } catch (err) {
      console.error("[useProdutos] Erro ao buscar dados reais:", err);
      setProdutos(PRODUTOS);
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos");
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    produtos,
    loading,
    error,
    isFallback,
    recarregar: carregarDados,
  };
}
