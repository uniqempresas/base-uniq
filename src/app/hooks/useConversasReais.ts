/**
 * Hook Customizado: useConversasReais
 * Busca conversas e mensagens do Supabase oficial com fallback para mocks.
 * Tarefa 1.2 - Base UNIQ
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { Conversa, Mensagem, StatusConversa, TipoMensagem } from "../types/chatbot";
import { mockConversas, mockMensagens } from "../lib/mocks/chatbot";

interface DBConversa {
  id: string;
  empresa_id: string | null;
  cliente_id: string | null;
  lead_id: string | null;
  status: string | null;
  modo: string | null;
  titulo: string | null;
  nome: string | null;
  canal: string | null;
  canal_id: string | null;
  canal_dados: Record<string, unknown> | null;
  foto_contato: string | null;
  criado_em: string | null;
}

interface DBMensagem {
  id: string;
  conversa_id: string;
  remetente_tipo: string | null;
  remetente_id: string | null;
  conteudo: string | null;
  tipo_conteudo: string | null;
  lido: boolean | null;
  metadados: Record<string, unknown> | null;
  remetente: string | null;
  tipo: string | null;
  arquivo_url: string | null;
  canal_mensagem_id: string | null;
  status: string | null;
  criado_em: string | null;
}

export interface UseConversasReaisReturn {
  conversas: Conversa[];
  conversaAtiva: Conversa | null;
  mensagens: Mensagem[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  selecionarConversa: (id: string) => void;
  recarregar: () => void;
  enviarMensagem: (conteudo: string) => void;
}

function mapStatusConversa(status: string | null): StatusConversa {
  if (status === "aberto") return "ativa";
  if (status === "encerrada") return "encerrada";
  if (status === "arquivada") return "arquivada";
  return "ativa";
}

function mapTipoMensagem(tipo: string | null): TipoMensagem {
  if (tipo === "imagem") return "imagem";
  if (tipo === "arquivo") return "arquivo";
  return "texto";
}

function mapConversa(db: DBConversa, mensagens: DBMensagem[]): Conversa {
  const conversaMensagens = mensagens
    .filter((m) => m.conversa_id === db.id)
    .sort((a, b) =>
      new Date(a.criado_em || 0).getTime() - new Date(b.criado_em || 0).getTime()
    );

  const ultima = conversaMensagens[conversaMensagens.length - 1];
  const naoLidas = conversaMensagens.filter((m) => m.remetente_tipo === "cliente" && !m.lido).length;

  return {
    id: db.id,
    clienteNome: db.nome || "Sem nome",
    clienteAvatar: db.foto_contato || undefined,
    ultimaMensagem: ultima?.conteudo || "",
    timestamp: new Date(db.criado_em || Date.now()),
    naoLidas,
    status: mapStatusConversa(db.status),
  };
}

function mapMensagem(db: DBMensagem): Mensagem {
  return {
    id: db.id,
    conversaId: db.conversa_id,
    conteudo: db.conteudo || "",
    tipo: mapTipoMensagem(db.tipo_conteudo || db.tipo),
    isBot: db.remetente_tipo !== "cliente",
    timestamp: new Date(db.criado_em || Date.now()),
    lida: !!db.lido,
    arquivoUrl: db.arquivo_url || undefined,
  };
}

export function useConversasReais(): UseConversasReaisReturn {
  const { empresa } = useAuth();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [conversaIdAtiva, setConversaIdAtiva] = useState<string | null>(null);
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
        .from("crm_chat_conversas")
        .select("*")
        .order("criado_em", { ascending: false });

      // Filtra por empresa se disponível
      if (empresaId) {
        query = query.eq("empresa_id", empresaId);
      }

      const { data: dbConversas, error: conversasError } = await query;

      if (conversasError) throw conversasError;

      const conversasValidas = (dbConversas as DBConversa[] | null) || [];

      if (conversasValidas.length === 0) {
        setConversas(mockConversas);
        setMensagens([]);
        setIsFallback(true);
        setLoading(false);
        return;
      }

      const conversaIds = conversasValidas.map((c) => c.id);

      const { data: dbMensagens, error: mensagensError } = await supabase
        .from("crm_chat_mensagens")
        .select("*")
        .in("conversa_id", conversaIds)
        .order("criado_em", { ascending: true });

      if (mensagensError) throw mensagensError;

      const mensagensValidas = (dbMensagens as DBMensagem[] | null) || [];
      const conversasMapeadas = conversasValidas.map((c) => mapConversa(c, mensagensValidas));
      const mensagensMapeadas = mensagensValidas.map(mapMensagem);

      setConversas(conversasMapeadas);
      setMensagens(mensagensMapeadas);
    } catch (err) {
      console.error("[useConversasReais] Erro ao buscar dados reais:", err);
      setConversas(mockConversas);
      setMensagens([]);
      setError(err instanceof Error ? err.message : "Erro ao carregar conversas");
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, [empresa]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const selecionarConversa = useCallback((id: string) => {
    setConversaIdAtiva(id);
    setConversas((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, naoLidas: 0 } : conv))
    );
  }, []);

  const conversaAtiva = useMemo(() => {
    if (!conversaIdAtiva) return null;
    return conversas.find((c) => c.id === conversaIdAtiva) || null;
  }, [conversaIdAtiva, conversas]);

  const mensagensAtivas = useMemo(() => {
    if (!conversaIdAtiva) return [];
    return mensagens
      .filter((m) => m.conversaId === conversaIdAtiva)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [conversaIdAtiva, mensagens]);

  const enviarMensagem = useCallback((conteudo: string) => {
    if (!conversaIdAtiva || !conteudo.trim()) return;

    const novaMensagem: Mensagem = {
      id: `msg-local-${Date.now()}`,
      conversaId: conversaIdAtiva,
      conteudo: conteudo.trim(),
      tipo: "texto",
      isBot: false,
      timestamp: new Date(),
      lida: true,
    };

    setMensagens((prev) => [...prev, novaMensagem]);
    setConversas((prev) =>
      prev.map((conv) =>
        conv.id === conversaIdAtiva
          ? { ...conv, ultimaMensagem: conteudo.trim(), timestamp: new Date() }
          : conv
      )
    );
  }, [conversaIdAtiva]);

  return {
    conversas,
    conversaAtiva,
    mensagens: mensagensAtivas,
    loading,
    error,
    isFallback,
    selecionarConversa,
    recarregar: carregarDados,
    enviarMensagem,
  };
}
