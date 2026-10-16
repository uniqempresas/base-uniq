import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { ClienteLista } from "../types/crm";

export interface UseClientesListaReturn {
  clientes: ClienteLista[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

/**
 * Lista leve de me_cliente ativos (id, nome, telefone) da empresa logada —
 * alimenta o select do modal de negociação e o filtro por cliente do pipeline.
 */
export function useClientesLista(): UseClientesListaReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [clientes, setClientes] = useState<ClienteLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    if (authLoading) return;

    const empresaId = empresa?.id;
    if (!session || !empresaId) {
      // Sem tenant não há o que listar: lista vazia silenciosa
      // (os hooks de gravação fazem a guarda com mensagem própria).
      setClientes([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);
    try {
      const { data, error } = await supabase
        .from("me_cliente")
        .select("id, nome_cliente, telefone")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome_cliente", { ascending: true });

      if (error) throw error;

      const rows = (data as { id: string; nome_cliente: string | null; telefone: string | null }[] | null) ?? [];
      setClientes(rows.map((r) => ({ id: r.id, nome: r.nome_cliente || "Sem nome", telefone: r.telefone || "" })));
    } catch (err) {
      console.error("[useClientesLista] Erro ao buscar clientes:", err);
      setClientes([]);
      setErro(err instanceof Error ? err.message : "Erro ao carregar clientes");
    } finally {
      setCarregando(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { clientes, carregando, erro, recarregar: carregarDados };
}
