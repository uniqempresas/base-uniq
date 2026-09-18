/**
 * ChatWindow - Janela de chat completa
 * Componente de UI do Módulo Chatbot
 * Sprint 12 - UNIQ Empresas
 */

import React, { useRef, useEffect } from 'react';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Conversa, Mensagem } from '../../types/chatbot';
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';

interface ChatWindowProps {
  conversa: Conversa | null;
  mensagens: Mensagem[];
  onSendMessage: (mensagem: string) => void;
  onBack?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

// Helper para obter iniciais do nome
function getInitials(nome: string): string {
  return nome
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ChatWindow({ conversa, mensagens, onSendMessage, onBack, inputRef }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem ao abrir/trocar de conversa ou quando
  // chega mensagem nova. O ref aponta para o próprio container de rolagem
  // (div com overflow-y-auto), então scrollTop/scrollHeight são aplicados no
  // elemento certo — antes o ref apontava para um div interno sem rolagem.
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [mensagens, conversa?.id]);

  if (!conversa) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Selecione uma conversa para começar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-border bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="lg:hidden text-muted-foreground -ml-2"
              aria-label="Voltar para lista de conversas"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10 shrink-0">
            {conversa.clienteAvatar ? (
              <img src={conversa.clienteAvatar} alt={conversa.clienteNome} />
            ) : (
              <div className="bg-primary text-primary-foreground font-medium flex items-center justify-center h-full">
                {getInitials(conversa.clienteNome)}
              </div>
            )}
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-medium text-foreground truncate">{conversa.clienteNome}</h3>
            <p className="text-xs text-muted-foreground">
              {conversa.status === 'ativa' ? 'Online' : conversa.status}
            </p>
          </div>
        </div>

        {/* Ações do header */}
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Área de mensagens — rolagem vertical própria.
          O cabeçalho e o campo de escrita ficam fixos (shrink-0); só esta
          lista rola. min-h-0 impede o flexbox de esticar além da altura
          disponível (que era o que cortava a conversa sem barra de rolagem). */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 bg-muted"
        aria-live="polite"
        aria-atomic="false"
      >
        {mensagens.map((mensagem) => (
          <MessageBubble
            key={mensagem.id}
            mensagem={mensagem}
            isOwn={!mensagem.isBot}
          />
        ))}
      </div>

      {/* Input de mensagem */}
      <ChatInput ref={inputRef} onSend={onSendMessage} />
    </div>
  );
}

export default ChatWindow;