/**
 * ChatList - Lista de conversas estilo WhatsApp
 * Componente de UI do Módulo Chatbot
 * Sprint 12 - UNIQ Empresas
 */

import React from 'react';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Conversa } from '../../types/chatbot';

interface ChatListProps {
  conversas: Conversa[];
  conversaAtiva: string | null;
  onSelectConversa: (conversaId: string) => void;
}

// Helper para formatar hora
function formatarHora(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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

export function ChatList({ conversas, conversaAtiva, onSelectConversa }: ChatListProps) {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
        <p className="text-sm text-muted-foreground">{conversas.length} conversas</p>
      </div>

      {/* Lista de conversas */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {conversas.map((conversa) => (
            <button
              key={conversa.id}
              onClick={() => onSelectConversa(conversa.id)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors text-left ${
                conversaAtiva === conversa.id ? 'bg-muted' : ''
              }`}
              aria-label={`Abrir conversa com ${conversa.clienteNome}`}
            >
              {/* Avatar */}
              <Avatar className="h-12 w-12">
                {conversa.clienteAvatar ? (
                  <img src={conversa.clienteAvatar} alt={conversa.clienteNome} />
                ) : (
                  <div className="bg-primary text-primary-foreground font-medium flex items-center justify-center h-full">
                    {getInitials(conversa.clienteNome)}
                  </div>
                )}
              </Avatar>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground truncate">
                    {conversa.clienteNome}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatarHora(conversa.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground truncate pr-2 lg:line-clamp-1 line-clamp-2">
                    {conversa.ultimaMensagem}
                  </span>
                  {conversa.naoLidas > 0 && (
                    <Badge className="bg-primary text-primary-foreground rounded-full h-5 min-w-5 px-1.5">
                      {conversa.naoLidas}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ChatList;