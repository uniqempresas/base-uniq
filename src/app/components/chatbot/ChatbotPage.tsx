/**
 * ChatbotPage - Página principal do Chatbot
 * Layout estilo WhatsApp com lista de conversas + janela de chat
 * Sprint 12 - UNIQ Empresas
 */

import React from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import { useChatbotConfig } from '../../hooks/useChatbotConfig';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { ChatbotStatus } from './ChatbotStatus';

export function ChatbotPage() {
  const {
    conversas,
    conversaAtiva,
    mensagens,
    enviarMensagem,
    selecionarConversa
  } = useChatbot();

  const { status, atualizarStatus } = useChatbotConfig();

  const handleSendMessage = (mensagem: string) => {
    enviarMensagem(mensagem);
  };

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
    </div>
  );
}

export default ChatbotPage;
