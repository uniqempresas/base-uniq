import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { Cliente, ClienteOrigem } from "../types/clientes";
import { mockClientes } from "../lib/mocks/clientes";

interface DBLead {
  id: string;
  empresa_id: string | null;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  status: string | null;
  origem: string | null;
  cargo: string | null;
  empresa_nome: string | null;
  ltv: number | null;
  ultima_interacao: string | null;
  observacoes: string | null;
  foto_url: string | null;
  created_at: string | null;
}

function mapStatus(status: string | null): "ativo" | "inativo" {
  if (status === "arquivado") return "inativo";
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

function mapLeadToCliente(db: DBLead): Cliente {
  const nome = db.nome || "Sem nome";
  const origem: ClienteOrigem = db.origem === "whatsapp" ? "whatsapp" : "manual";

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
    tags: origem === "whatsapp" ? ["WhatsApp"] : [],
    ultimaInteracao: db.ultima_interacao
      ? new Date(db.ultima_interacao).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    totalCompras: db.ltv || 0,
    status: mapStatus(db.status),
    cidade: db.empresa_nome || "Suzano / SP",
    vendedor: "Melissa",
    dataCadastro: formatData(db.created_at),
    documento: "",
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
  const { empresa } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsFallback(false);

    try {
      // Busca empresa_id do contexto ou primeira disponível
      let empresaId = empresa?.id;

      if (!empresaId) {
        const { data: empresas } = await supabase
          .from("me_empresa")
          .select("id")
          .limit(1);

        if (empresas && empresas.length > 0) {
          empresaId = empresas[0].id;
        }
      }

      let query = supabase
        .from("crm_leads")
        .select("*")
        .order("ultima_interacao", { ascending: false });

      // Filtra por empresa se disponível
      if (empresaId) {
        query = query.eq("empresa_id", empresaId);
      }

      const { data: dbLeads, error: leadsError } = await query;

      if (leadsError) throw leadsError;

      const leadsValidos = (dbLeads as DBLead[] | null) || [];

      if (leadsValidos.length === 0) {
        setClientes(mockClientes);
        setIsFallback(true);
        setLoading(false);
        return;
      }

      setClientes(leadsValidos.map(mapLeadToCliente));
    } catch (err) {
      console.error("[useClientes] Erro ao buscar dados reais:", err);
      setClientes(mockClientes);
      setError(err instanceof Error ? err.message : "Erro ao carregar clientes");
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, [empresa]);

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
