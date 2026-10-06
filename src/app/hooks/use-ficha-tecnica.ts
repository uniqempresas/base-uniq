/**
 * Ficha técnica / BOM do produto-pai (Produção Fase 1 — SPEC-Producao-BOM-Fase1 §4/§5).
 *
 * - **Leitura:** `est_ficha_tecnica` com embed do componente (`me_produto` via FK
 *   `componente_id`). O hint `!componente_id` é obrigatório: a tabela tem DUAS FKs
 *   para `me_produto` (pai e componente) e o PostgREST não desambigua sozinho.
 * - **Escrita:** única via é a RPC `salvar_ficha_tecnica` (SECURITY DEFINER,
 *   snapshot atômico). O app nunca faz delete+insert não-transacional.
 *   Lista vazia `[]` = apaga a ficha do produto (SPEC §5).
 * - **Sem sessão / sem empresa:** lista vazia — a ficha é funcionalidade nova, NÃO
 *   tem fallback mock (diferente de `use-produtos.ts`).
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { ItemFichaTecnica } from "../types/producao";

interface DBFichaItem {
  id: string;
  empresa_id: string;
  produto_pai_id: number;
  componente_id: number;
  quantidade_por_unidade: string | number;
  perda_pct: string | number;
  criado_em: string;
  /** Embed do PostgREST: est_ficha_tecnica.componente_id → me_produto */
  me_produto: { nome_produto: string | null; sku: string | null; unidade: string | null } | null;
}

interface RpcResultado {
  success?: boolean;
  total_itens?: number;
  error?: string;
  detail?: string;
}

function mapItem(db: DBFichaItem): ItemFichaTecnica {
  return {
    id: db.id,
    componenteProdutoId: String(db.componente_id),
    componenteNome: db.me_produto?.nome_produto || "Sem nome",
    componenteSku: db.me_produto?.sku || "",
    componenteUnidade: db.me_produto?.unidade || "un",
    quantidadePorUnidade: Number(db.quantidade_por_unidade) || 0,
    perdaPct: Number(db.perda_pct) || 0,
  };
}

/** Erro de constraint devolvido pelo Postgres (RPC é SECURITY DEFINER: o código chega cru). */
function mensagemDeConstraint(codigo: string | undefined, padrao: string): string {
  switch (codigo) {
    case "23505":
      return "Este componente já está na ficha técnica — edite a linha em vez de adicionar outro.";
    case "23503":
      return "Componente não encontrado nesta empresa. Atualize a lista de produtos e tente de novo.";
    case "23514":
      return "Quantidade deve ser maior que zero e a perda não pode ser negativa.";
    case "42501":
    case "P0001":
      return "Sem permissão para gravar a ficha técnica deste produto. Recarregue e tente novamente.";
    default:
      return padrao;
  }
}

export interface SalvarFichaResultado {
  success: boolean;
  totalItens?: number;
  error?: string;
}

export interface UseFichaTecnicaReturn {
  itens: ItemFichaTecnica[];
  loading: boolean;
  salvando: boolean;
  error: string | null;
  /** sempre false — ficha técnica não tem fallback mock (SPEC §4) */
  isFallback: boolean;
  recarregar: () => void;
  /**
   * Grava o snapshot da ficha (substitui a ficha inteira).
   * `produtoPaiIdOverride` é usado no fluxo de criação: o pai só ganha id depois
   * que `criarProduto` volta, e a ficha é gravada em seguida com esse id.
   */
  salvar: (itens: ItemFichaTecnica[], produtoPaiIdOverride?: string) => Promise<SalvarFichaResultado>;
}

export function useFichaTecnica(produtoPaiId: string | undefined): UseFichaTecnicaReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [itens, setItens] = useState<ItemFichaTecnica[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);

    // Sem sessão = modo demo: ficha não tem mock → lista vazia (criação on-the-fly)
    if (!session) {
      setItens([]);
      setLoading(false);
      return;
    }

    const empresaId = empresa?.id;
    if (!empresaId) {
      setItens([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setLoading(false);
      return;
    }

    if (!produtoPaiId || !Number.isInteger(Number(produtoPaiId))) {
      // Sem pai (fluxo de criação) ou id que não é integer (mock "p1") — nada a ler
      setItens([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fichaError } = await supabase
        .from("est_ficha_tecnica")
        .select(
          "id, empresa_id, produto_pai_id, componente_id, quantidade_por_unidade, perda_pct, criado_em, me_produto!componente_id (nome_produto, sku, unidade)"
        )
        .eq("empresa_id", empresaId)
        .eq("produto_pai_id", Number(produtoPaiId))
        .order("criado_em", { ascending: true });

      if (fichaError) throw fichaError;

      // `as unknown as` — o embed de FK dupla é tipado como array pelo client
      // sem generated types; a forma real é o objeto único do JOIN many-to-one.
      setItens(((data as unknown as DBFichaItem[] | null) || []).map(mapItem));
    } catch (err) {
      console.error("[useFichaTecnica] Erro ao carregar a ficha técnica:", err);
      setItens([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar a ficha técnica");
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading, produtoPaiId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const salvar = useCallback(
    async (
      novosItens: ItemFichaTecnica[],
      produtoPaiIdOverride?: string
    ): Promise<SalvarFichaResultado> => {
      const paiId = produtoPaiIdOverride ?? produtoPaiId;

      const empresaId = empresa?.id;
      if (!empresaId) {
        return {
          success: false,
          error: "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.",
        };
      }
      if (!paiId) {
        return { success: false, error: "Produto pai não identificado — salve o produto antes da ficha." };
      }

      // Validação local espelhando o CHECK do banco (quantidade > 0, perda >= 0):
      // falha antes da rede com mensagem por componente.
      const invalido = novosItens.find(
        (i) => !Number.isFinite(i.quantidadePorUnidade) || i.quantidadePorUnidade <= 0 || i.perdaPct < 0
      );
      if (invalido) {
        return {
          success: false,
          error: `Quantidade inválida para "${invalido.componenteNome}". Informe um valor maior que zero.`,
        };
      }

      setSalvando(true);
      setError(null);
      try {
        const pItens = novosItens.map((i) => ({
          componente_id: Number(i.componenteProdutoId),
          quantidade_por_unidade: i.quantidadePorUnidade,
          perda_pct: i.perdaPct || 0,
        }));

        const { data, error: rpcError } = await supabase.rpc("salvar_ficha_tecnica", {
          p_empresa_id: empresaId,
          p_produto_pai_id: Number(paiId),
          // snapshot completo — lista vazia apaga a ficha (SPEC §5)
          p_itens: pItens,
        });

        if (rpcError) {
          const msg = mensagemDeConstraint(
            (rpcError as { code?: string }).code,
            rpcError.message || "Erro ao salvar a ficha técnica"
          );
          setError(msg);
          return { success: false, error: msg };
        }

        const resultado = (data ?? {}) as RpcResultado;
        if (!resultado.success) {
          const msg =
            [resultado.error, resultado.detail].filter(Boolean).join(" — ") ||
            "Não foi possível salvar a ficha técnica.";
          setError(msg);
          return { success: false, error: msg };
        }

        await carregarDados();
        return { success: true, totalItens: Number(resultado.total_itens) || pItens.length };
      } catch (err) {
        console.error("[useFichaTecnica] Erro inesperado ao salvar a ficha:", err);
        const msg = err instanceof Error ? err.message : "Erro ao salvar a ficha técnica";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setSalvando(false);
      }
    },
    [empresa, produtoPaiId, carregarDados]
  );

  return { itens, loading, salvando, error, isFallback, recarregar: carregarDados, salvar };
}
