/**
 * Leitura de movimentações de estoque (B14 — SPEC §3).
 *
 * - Sem sessão → mock (`MOVIMENTACOES`) adaptado para `MovimentacaoEstoque`,
 *   `isFallback: true` — padrão exato de `use-produtos.ts` (mock-first 07/09/2026).
 * - Com sessão → `est_movimentacao` com `.eq("empresa_id")` obrigatório (T2.6) e
 *   `.order("data_movimentacao", desc)`.
 * - `me_produto(nome_produto, sku)` vem por embed (FK integer confirmada);
 *   `usuario_id` → `auth.users` NÃO é embedável via PostgREST — o nome do
 *   responsável é resolvido por 2ª query em `me_usuario` por igualdade de id
 *   (`me_usuario.id` é o uuid do auth) e juntado em memória. Sem match → undefined.
 * - Com sessão e 0 linhas → empty real (NUNCA mock) — igual `use-produtos.ts`.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { MOVIMENTACOES, type Movimentacao } from "../components/estoque/estoqueMockData";
import type { MovimentacaoEstoque, MovTipo } from "../types/estoque";

interface DBMovimentacao {
  id: string;
  empresa_id: string;
  produto_id: number;
  tipo: string;
  quantidade: number | string;
  data_movimentacao: string | null;
  motivo: string | null;
  observacao: string | null;
  usuario_id: string | null;
  created_at: string | null;
  /** Embed do PostgREST: est_movimentacao.produto_id → me_produto (FK integer) */
  me_produto: { nome_produto: string | null; sku: string | null } | null;
}

function mapMovimentacao(
  db: DBMovimentacao,
  nomesPorUsuario: Record<string, string>
): MovimentacaoEstoque {
  return {
    id: db.id,
    empresaId: db.empresa_id,
    produtoId: String(db.produto_id),
    produtoNome: db.me_produto?.nome_produto || "Sem nome",
    produtoSku: db.me_produto?.sku || "",
    // CHECK aceita 'ajuste' (uso futuro); a UI só conhece entrada/saida (SPEC §2)
    tipo: (db.tipo === "saida" ? "saida" : "entrada") as MovTipo,
    quantidade: Number(db.quantidade) || 0,
    motivo: db.motivo || "",
    observacao: db.observacao || undefined,
    responsavel: db.usuario_id ? nomesPorUsuario[db.usuario_id] : undefined,
    data: db.data_movimentacao || db.created_at || new Date().toISOString(),
    cancelada: false,
  };
}

/** "31/03/2024 - 10:30" (formato do mock) → ISO, para as telas tratarem real e demo igual. */
function mockDataParaISO(valor: string): string {
  const [parteData, parteHora] = valor.split(" - ");
  const [dd, mm, yyyy] = (parteData || "").split("/").map(Number);
  const [hh = 0, min = 0] = (parteHora || "00:00").split(":").map(Number);
  const d = new Date(yyyy || 0, (mm || 1) - 1, dd || 1, hh, min);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** Adapta o mock de demonstração para o contrato da UI (`MovimentacaoEstoque`). */
function mapMock(m: Movimentacao): MovimentacaoEstoque {
  return {
    id: m.id,
    empresaId: "",
    produtoId: m.produtoId,
    produtoNome: m.produtoNome,
    produtoSku: m.produtoSku,
    tipo: m.tipo,
    quantidade: m.quantidade,
    motivo: m.motivo,
    observacao: m.observacao,
    responsavel: m.responsavel,
    data: mockDataParaISO(m.data),
    cancelada: m.cancelada,
  };
}

export interface UseMovimentacoesFiltros {
  /** id do produto em formato UI (string); vira integer na query */
  produtoId?: string;
}

export interface UseMovimentacoesReturn {
  movimentacoes: MovimentacaoEstoque[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}

export function useMovimentacoes(filtros?: UseMovimentacoesFiltros): UseMovimentacoesReturn {
  const produtoId = filtros?.produtoId;

  const { empresa, session, loading: authLoading } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setIsFallback(false);

    // MODO DEMO (sem login): usa mock — regra mock-first de 07/09/2026
    if (!session) {
      const mock = MOVIMENTACOES.map(mapMock);
      setMovimentacoes(produtoId ? mock.filter((m) => m.produtoId === produtoId) : mock);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    // Logado mas empresa não resolvida: NÃO consultar outro tenant
    const empresaId = empresa?.id;
    if (!empresaId) {
      setMovimentacoes([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("est_movimentacao")
        .select("*, me_produto(nome_produto, sku)")
        .eq("empresa_id", empresaId)
        .order("data_movimentacao", { ascending: false });

      if (produtoId) query = query.eq("produto_id", Number(produtoId));

      const { data, error: movError } = await query;
      if (movError) throw movError;

      const linhas = (data as DBMovimentacao[] | null) || [];

      // 0 linhas = empresa nova = empty state real (nunca mock de outra empresa)
      if (linhas.length === 0) {
        setMovimentacoes([]);
        setIsFallback(false);
        setLoading(false);
        return;
      }

      // 2ª query: responsável por igualdade de id (me_usuario.id = uuid do auth.users).
      // Falha aqui NÃO derruba o extrato — só deixa o responsável sem nome.
      const nomesPorUsuario: Record<string, string> = {};
      const usuarioIds = Array.from(
        new Set(linhas.map((l) => l.usuario_id).filter((v): v is string => !!v))
      );
      if (usuarioIds.length > 0) {
        try {
          const { data: usuarios, error: usuariosError } = await supabase
            .from("me_usuario")
            .select("id, nome_usuario")
            .in("id", usuarioIds);
          if (!usuariosError) {
            for (const u of (usuarios as { id: string; nome_usuario: string | null }[] | null) || []) {
              if (u.nome_usuario) nomesPorUsuario[u.id] = u.nome_usuario;
            }
          }
        } catch (errUsuarios) {
          console.error("[useMovimentacoes] Erro ao resolver responsáveis:", errUsuarios);
        }
      }

      setMovimentacoes(linhas.map((l) => mapMovimentacao(l, nomesPorUsuario)));
    } catch (err) {
      console.error("[useMovimentacoes] Erro ao buscar movimentações:", err);
      setMovimentacoes([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar movimentações");
      setIsFallback(false);
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading, produtoId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    movimentacoes,
    loading,
    error,
    isFallback,
    recarregar: carregarDados,
  };
}
