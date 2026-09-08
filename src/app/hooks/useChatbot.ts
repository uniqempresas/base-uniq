/**
 * Hook Customizado: useChatbot
 * Gerenciamento de conversas do módulo Chatbot
 * Sprint 12 - UNIQ Empresas
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  Conversa,
  Mensagem,
  RespostaAuto,
  StatusConversa
} from '../types/chatbot';
import {
  mockConversas,
  mockMensagens,
  mockRespostasAuto
} from '../lib/mocks/chatbot';

export interface UseChatbotReturn {
  conversas: Conversa[];
  conversaAtiva: Conversa | null;
  mensagens: Mensagem[];
  enviarMensagem: (conteudo: string, tipo?: 'texto' | 'imagem' | 'arquivo') => void;
  iniciarConversa: (clienteNome: string) => string;
  arquivarConversa: (conversaId: string) => void;
  encerrarConversa: (conversaId: string) => void;
  selecionarConversa: (conversaId: string) => void;
  buscarConversas: (query: string) => Conversa[];
  marcarComoLida: (conversaId: string) => void;
}

export function useChatbot(): UseChatbotReturn {
  const [conversas, setConversas] = useState<Conversa[]>(mockConversas);
  const [conversaIdAtiva, setConversaIdAtiva] = useState<string | null>(null);
  const [mensagensState, setMensagensState] = useState<Record<string, Mensagem[]>>(mockMensagens);
  const [respostasAuto] = useState<RespostaAuto[]>(mockRespostasAuto);

  // Obter a conversa ativa
  const conversaAtiva = useMemo((): Conversa | null => {
    if (!conversaIdAtiva) return null;
    return conversas.find((c: Conversa) => c.id === conversaIdAtiva) || null;
  }, [conversaIdAtiva, conversas]);

  // Obter mensagens da conversa ativa
  const mensagens = useMemo((): Mensagem[] => {
    if (!conversaIdAtiva) return [];
    return mensagensState[conversaIdAtiva] || [];
  }, [conversaIdAtiva, mensagensState]);

  // Selecionar uma conversa
  const selecionarConversa = useCallback((conversaId: string) => {
    setConversaIdAtiva(conversaId);
    // Marcar como lida automaticamente
    setConversas((prev: Conversa[]) => prev.map((conv: Conversa) => 
      conv.id === conversaId ? { ...conv, naoLidas: 0 } : conv
    ));
  }, []);

  // Buscar conversas por query
  const buscarConversas = useCallback((query: string): Conversa[] => {
    if (!query.trim()) return conversas;
    const lowerQuery = query.toLowerCase();
    return conversas.filter((conv: Conversa) => 
      conv.clienteNome.toLowerCase().includes(lowerQuery) ||
      conv.ultimaMensagem.toLowerCase().includes(lowerQuery)
    );
  }, [conversas]);

  // Criar nova mensagem
  const criarMensagem = useCallback((
    conversaId: string,
    conteudo: string,
    tipo: 'texto' | 'imagem' | 'arquivo' = 'texto',
    isBot: boolean = false
  ): Mensagem => {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      conversaId,
      conteudo,
      tipo,
      isBot,
      timestamp: new Date(),
      lida: false
    };
  }, []);

  // Enviar mensagem do admin
  const enviarMensagem = useCallback((
    conteudo: string,
    tipo: 'texto' | 'imagem' | 'arquivo' = 'texto'
  ) => {
    if (!conversaIdAtiva) return;

    const novaMensagem = criarMensagem(conversaIdAtiva, conteudo, tipo, false);

    setMensagensState((prev: Record<string, Mensagem[]>) => ({
      ...prev,
      [conversaIdAtiva]: [...(prev[conversaIdAtiva] || []), novaMensagem]
    }));

    // Atualizar última mensagem na conversa
    setConversas((prev: Conversa[]) => prev.map((conv: Conversa) =>
      conv.id === conversaIdAtiva
        ? { ...conv, ultimaMensagem: conteudo, timestamp: novaMensagem.timestamp }
        : conv
    ));

    // Simular resposta do bot após delay
    setTimeout(() => {
      const textoLower = conteudo.toLowerCase();
      let respostaBot: string | null = null;
      let delayMs = 1500;

      // Verificar se há resposta automática
      for (const resposta of respostasAuto) {
        if (resposta.ativa && textoLower.includes(resposta.gatilho.toLowerCase())) {
          respostaBot = resposta.resposta;
          delayMs = resposta.delayMs;
          break;
        }
      }

      if (respostaBot) {
        const msg_bot = criarMensagem(conversaIdAtiva, respostaBot, 'texto', true);
        setMensagensState((prev: Record<string, Mensagem[]>) => ({
          ...prev,
          [conversaIdAtiva]: [...(prev[conversaIdAtiva] || []), msg_bot]
        }));
        setConversas((prev: Conversa[]) => prev.map((conv: Conversa) =>
          conv.id === conversaIdAtiva
            ? { ...conv, ultimaMensagem: respostaBot!, timestamp: msg_bot.timestamp }
            : conv
        ));
      }
    }, 1500);
  }, [conversaIdAtiva, criarMensagem, respostasAuto]);

  // Iniciar nova conversa
  const iniciarConversa = useCallback((clienteNome: string): string => {
    const novaConversa: Conversa = {
      id: `conv-${Date.now()}`,
      clienteNome,
      clienteAvatar: undefined,
      ultimaMensagem: '',
      timestamp: new Date(),
      naoLidas: 0,
      status: 'ativa'
    };

    setConversas((prev: Conversa[]) => [novaConversa, ...prev]);
    setMensagensState((prev: Record<string, Mensagem[]>) => ({
      ...prev,
      [novaConversa.id]: []
    }));
    setConversaIdAtiva(novaConversa.id);

    return novaConversa.id;
  }, []);

  // Arquivar conversa
  const arquivarConversa = useCallback((conversaId: string) => {
    setConversas((prev: Conversa[]) => prev.map((conv: Conversa) =>
      conv.id === conversaId ? { ...conv, status: 'arquivada' as StatusConversa } : conv
    ));
  }, []);

  // Encerrar conversa
  const encerrarConversa = useCallback((conversaId: string) => {
    setConversas((prev: Conversa[]) => prev.map((conv: Conversa) =>
      conv.id === conversaId ? { ...conv, status: 'encerrada' as StatusConversa } : conv
    ));
  }, []);

  // Marcar como lida
  const marcarComoLida = useCallback((conversaId: string) => {
    setConversas((prev: Conversa[]) => prev.map((conv: Conversa) =>
      conv.id === conversaId ? { ...conv, naoLidas: 0 } : conv
    ));
  }, []);

  return {
    conversas,
    conversaAtiva,
    mensagens,
    enviarMensagem,
    iniciarConversa,
    arquivarConversa,
    encerrarConversa,
    selecionarConversa,
    buscarConversas,
    marcarComoLida
  };
}