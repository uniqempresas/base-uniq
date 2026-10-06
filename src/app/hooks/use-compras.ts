/**
 * Leitura de compras de insumo (Produção Fase 2 — SPEC-Producao-BOM-Fase2 §4).
 *
 * - `est_compra` com embed do fornecedor e dos itens (com o produto de cada item).
 * - **Sem sessão / sem empresa:** lista vazia — compras é funcionalidade nova e
 *   NÃO tem fallback mock (disciplina da ficha técnica, `use-ficha-tecnica.ts`).
 * - `loading` vira true só na PRIMEIRA carga: refetch em background não faz a
 *   tela "pisque" (padrão pós-HOTFIX do ProdutosPage).
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  normalizarStatusCompra,
  type Compra,
  type ItemCompra,
} from "../types/producao";

interface DBItemEmbed {
  id: string;
  produto_id: number;
  quantidade: string | number;
  valor_unitario: string | number;
  me_produto: {
    nome_produto: string | null;
    sku: string | null;
    unidade: string | null;
    unidade_compra: string | null;
    fator_conversao: string | number | null;
  } | null;
}

interface DBCompra {
  id: string;
  empresa_id: string;
  fornecedor_id: string;
  data_compra: string;
  status: string | null;
  valor_total: string | number | null;
  nota_fiscal: string | null;
  data_recebimento: string | null;
  data_prevista: string | null;
  created_at: string | null;
  me_fornecedor: { nome_fornecedor: string | null } | null;
  est_compra_item: DBItemEmbed[] | null;
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

function mapItem(db: DBItemEmbed): ItemCompra {
  return {
    id: db.id,
    produtoId: String(db.produto_id),
    produtoNome: db.me_produto?.nome_produto || "Sem nome",
    produtoSku: db.me_produto?.sku || "",
    unidadeEstoque: db.me_produto?.unidade || "un",
    unidadeCompra: db.me_produto?.unidade_compra ?? null,
    fatorConversao: fator(db.me_produto?.fator_conversao),
    quantidade: num(db.quantidade),
    valorUnitario: num(db.valor_unitario),
  };
}

function mapCompra(db: DBCompra): Compra {
  const itens = (db.est_compra_item || []).map(mapItem);
  // valor_total do banco é authoritative; soma dos itens é fallback defensivo
  // (linhas criadas antes do fechar da RPC, por exemplo).
  const somaItens = itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);

  return {
    id: db.id,
    fornecedorId: db.fornecedor_id,
    fornecedorNome: db.me_fornecedor?.nome_fornecedor || "Fornecedor removido",
    status: normalizarStatusCompra(db.status),
    dataCompra: db.data_compra,
    dataPrevista: db.data_prevista || null,
    dataRecebimento: db.data_recebimento || null,
    valorTotal: num(db.valor_total) || somaItens,
    notaFiscal: db.nota_fiscal || null,
    itens,
  };
}

export interface UseComprasReturn {
  compras: Compra[];
  loading: boolean;
  error: string | null;
  recarregar: () => void;
}

export function useCompras(): UseComprasReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Loading só na 1ª carga — refetch de fundo não reergue o skeleton.
  const primeiraCarga = useRef(true);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    if (primeiraCarga.current) setLoading(true);
    setError(null);

    // Sem sessão = modo demo: compras não tem mock → lista vazia (SPEC §4)
    if (!session) {
      setCompras([]);
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    const empresaId = empresa?.id;
    if (!empresaId) {
      setCompras([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setLoading(false);
      primeiraCarga.current = false;
      return;
    }

    try {
      const { data, error: comprasError } = await supabase
        .from("est_compra")
        .select(
          "*, me_fornecedor(nome_fornecedor), est_compra_item(id, produto_id, quantidade, valor_unitario, me_produto(nome_produto, sku, unidade, unidade_compra, fator_conversao))"
        )
        .eq("empresa_id", empresaId)
        .order("data_compra", { ascending: false });

      if (comprasError) throw comprasError;

      setCompras(((data as unknown as DBCompra[] | null) || []).map(mapCompra));
    } catch (err) {
      console.error("[useCompras] Erro ao carregar compras:", err);
      setCompras([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar compras");
    } finally {
      setLoading(false);
      primeiraCarga.current = false;
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { compras, loading, error, recarregar: carregarDados };
}
