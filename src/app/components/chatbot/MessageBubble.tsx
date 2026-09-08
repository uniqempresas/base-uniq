/**
 * MessageBubble - Bolha de mensagem
 * Componente de UI do Módulo Chatbot
 * Sprint 12 - UNIQ Empresas
 */

import React from 'react';
import { Mensagem } from '../../types/chatbot';

interface MessageBubbleProps {
  mensagem: Mensagem;
  isOwn: boolean;
}

// Helper para formatar timestamp
function formatarTimestamp(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function MessageBubble({ mensagem, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        {/* Conteúdo da mensagem */}
        {mensagem.tipo === 'imagem' && mensagem.arquivoUrl && (
          <div className="mb-2">
            <img
              src={mensagem.arquivoUrl}
              alt="Imagem"
              className="max-w-full rounded-lg"
            />
          </div>
        )}
        
        <p className="text-sm whitespace-pre-wrap break-words">
          {mensagem.conteudo}
        </p>

        {/* Timestamp e status */}
        <div className={`flex items-center gap-1 mt-1 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {formatarTimestamp(mensagem.timestamp)}
          </span>
          
          {/* Indicador de leitura (apenas para mensagens próprias) */}
          {isOwn && (
            <span className="text-xs text-primary-foreground/70">
              {mensagem.lida ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;