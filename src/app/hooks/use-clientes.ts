import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { Cliente, ClienteOrigem } from "../types/clientes";
import { mockClientes } from "../lib/mocks/clientes";

interface DBCliente {
  id: string;
  empresa_id: string | null;
  nome_cliente: string | null;
  email: string | null;
  telefone: string | null;
  origem: string | null;
  observacoes: string | null;
  foto_url: string | null;
  tags: string[] | null;
  ativo: boolean | null;
  criado_em: string | null;
  atualizado_em: string | null;
  cidade: string | null;
  documento: string | null;
}

function mapStatus(ativo: boolean | null): "ativo" | "inativo" {
  if (ativo === false) return "inativo";
  return "ativo";
}

function formatTelefone(telefone: string | null): string {
  if (!telefone) return "";
  const nums = telefone.replace(/\D/g, "");
  if (nums.length === 11) {
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  }
  if (nums.length === 10) {
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  }
  return telefone;
}

function formatData(data: string | null): string {
  if (!data) return "";
  try {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return data;
  }
}

function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(id: string): string {
  const colors = ["#8B5CF6", "#0EA5E9", "#F59E0B", "#10B981", "#EC4899", "#6366F1", "#14B8A6"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function mapClienteToCliente(db: DBCliente): Cliente {
  const nome = db.nome_cliente || "Sem nome";
  const origem: ClienteOrigem = db.origem === "whatsapp" ? "whatsapp" : "manual";

  // me_cliente não tem ultima_interacao: usa a última modificação (ou criação) como referência
  const fonteUltimaInteracao = db.atualizado_em || db.criado_em;

  return {
    id: db.id,
    empresa_id: db.empresa_id || undefined,
    nome,
    tipo: "PF",
    initials: getInitials(nome),
    avatarColor: getAvatarColor(db.id),
    email: db.email || "",
    telefone: formatTelefone(db.telefone),
    whatsapp: formatTelefone(db.telefone),
    tags: [...(origem === "whatsapp" ? ["WhatsApp"] : []), ...(db.tags || [])],
    ultimaInteracao: fonteUltimaInteracao
      ? new Date(fonteUltimaInteracao).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    totalCompras: 0, // me_cliente não tem ltv
    status: mapStatus(db.ativo),
    cidade: db.cidade || "Suzano / SP",
    vendedor: "Melissa",
    dataCadastro: formatData(db.criado_em),
    documento: db.documento || "",
    origem,
    conversa_id: null,
    observacoes: db.observacoes,
  };
}

export interface UseClientesReturn {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}

export function useClientes(): UseClientesReturn {
  const { empresa, session, loading: authLoading } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
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
      setClientes(mockClientes);
      setIsFallback(true);
      setLoading(false);
      return;
    }

    // Logado mas empresa não resolvida: NÃO consultar outro tenant
    const empresaId = empresa?.id;
    if (!empresaId) {
      setClientes([]);
      setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
      setIsFallback(false);
      setLoading(false);
      return;
    }

    try {
      const { data: dbClientes, error: clientesError } = await supabase
        .from("me_cliente")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("criado_em", { ascending: false });

      if (clientesError) throw clientesError;

      const clientesValidos = (dbClientes as DBCliente[] | null) || [];

      // 0 linhas = empresa nova = empty state real (nunca mock de outra empresa)
      if (clientesValidos.length === 0) {
        setClientes([]);
        setIsFallback(false);
        setLoading(false);
        return;
      }

      setClientes(clientesValidos.map(mapClienteToCliente));
    } catch (err) {
      console.error("[useClientes] Erro ao buscar dados reais:", err);
      if (!session) {
        setClientes(mockClientes);
        setIsFallback(true);
      } else {
        setClientes([]);
        setError(err instanceof Error ? err.message : "Erro ao carregar clientes");
        setIsFallback(false);
      }
    } finally {
      setLoading(false);
    }
  }, [empresa, session, authLoading]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    clientes,
    loading,
    error,
    isFallback,
    recarregar: carregarDados,
  };
}