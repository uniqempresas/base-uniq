/**
 * ChatbotPage - Página principal do Chatbot
 * Layout estilo WhatsApp com lista de conversas + janela de chat
 * Integra dados reais do Supabase via useConversasReais com fallback mock.
 * Sprint 12 - UNIQ Empresas
 */

import React from 'react';
import { useConversasReais } from '../../hooks/useConversasReais';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { ChatbotStatus } from './ChatbotStatus';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export function ChatbotPage() {
  const {
    conversas,
    conversaAtiva,
    mensagens,
    loading,
    error,
    isFallback,
    selecionarConversa,
    recarregar,
    enviarMensagem
  } = useConversasReais();

  if (loading) {
    return (
      <div className="h-full flex flex-col lg:flex-row">
        <div className="w-[300px] h-full border-r border-border bg-white flex flex-col p-4 gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
          <div className="space-y-3 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted">
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    );
  }

  if (error && !isFallback) {
    return (
      <div className="h-full flex items-center justify-center bg-muted p-4">
        <div className="bg-white rounded-lg border border-destructive/20 p-6 max-w-md text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar conversas</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={recarregar} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (conversas.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-muted p-4">
        <div className="bg-white rounded-lg border border-border p-6 max-w-md text-center shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-2">Nenhuma conversa encontrada</h2>
          <p className="text-sm text-muted-foreground">
            As conversas do chatbot aparecerão aqui quando houver mensagens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Status do Chatbot (só visible em mobile) */}
      <div className="lg:hidden p-4 border-b border-border bg-white">
        <ChatbotStatus status="online" onChange={() => {}} />
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
        onSendMessage={enviarMensagem}
      />
    </div>
  );
}

export default ChatbotPage;
