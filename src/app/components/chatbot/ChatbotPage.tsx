/**
 * ChatbotPage - Página principal do Chatbot
 * Layout estilo WhatsApp com lista de conversas + janela de chat
 * Sprint 12 - UNIQ Empresas
 *
 * Tarefa 1.4: renderiza conversas reais do WhatsApp (crm_chat_conversas)
 * com fallback para mocks quando o banco estiver vazio/erro.
 */

import React from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { useConversasReais } from '../../hooks/useConversasReais';
import { useChatbotConfig } from '../../hooks/useChatbotConfig';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { ChatbotStatus } from './ChatbotStatus';

export function ChatbotPage() {
  const {
    conversas,
    conversaAtiva,
    mensagens,
    loading,
    error,
    isFallback,
    selecionarConversa
  } = useConversasReais();

  const { status, atualizarStatus } = useChatbotConfig();

  const handleSendMessage = (_mensagem: string) => {
    // TODO: integrar envio de mensagem ao Supabase (Semana 2+)
    // Por enquanto mantém-se apenas leitura para a cadeia de demonstração.
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  if (error && conversas.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-muted p-8">
        <div className="text-center max-w-sm">
          <p className="text-red-500 font-medium mb-2">Erro ao carregar conversas</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (conversas.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-muted p-8">
        <div className="bg-muted p-6 rounded-full mb-4">
          <MessageCircle className="h-16 w-16 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma conversa</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Não há conversas do WhatsApp para exibir no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Status do Chatbot (só visible em mobile) */}
      <div className="lg:hidden p-4 border-b border-border bg-white">
        <ChatbotStatus status={status} onChange={atualizarStatus} />
      </div>

      {/* ChatList - Lista de conversas (esquerda) */}
      <ChatList
        conversas={conversas}
        conversaAtiva={conversaAtiva?.id || null}
        onSelectConversa={selecionarConversa}
      />

      {/* ChatWindow - Janeiro de chat (direita) */}
      <ChatWindow
        conversa={conversaAtiva}
        mensagens={mensagens}
        onSendMessage={handleSendMessage}
      />

      {/* Indicador sutil de fallback/mock */}
      {isFallback && (
        <div className="fixed bottom-2 right-2 z-50 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-md shadow">
          Modo demonstração
        </div>
      )}
    </div>
  );
}

export default ChatbotPage;