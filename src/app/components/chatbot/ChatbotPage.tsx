/**
 * ChatbotPage - Página principal do Chatbot
 * Layout estilo WhatsApp com lista de conversas + janela de chat
 * Integra dados reais do Supabase via useConversasReais com fallback mock.
 * Redesign mobile-first: lista em tela cheia, chat em tela cheia com botão voltar.
 * Sprint 12 - UNIQ Empresas
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useConversasReais } from '../../hooks/useConversasReais';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';

type MobileView = 'list' | 'chat';

export function ChatbotPage() {
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleSelectConversa = useCallback((id: string) => {
    selecionarConversa(id);
    setMobileView('chat');
  }, [selecionarConversa]);

  const handleBackToList = useCallback(() => {
    setMobileView('list');
  }, []);

  // Foca o input ao selecionar uma conversa
  useEffect(() => {
    if (conversaAtiva && inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversaAtiva]);

  if (loading) {
    return (
      <div className="h-full flex flex-col lg:flex-row">
        <div className="w-full lg:w-[300px] h-full border-r border-border bg-white flex flex-col p-4 gap-4">
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
        <div className="hidden lg:flex flex-1 items-center justify-center bg-muted">
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
          <MessageCircle className="h-10 w-10 text-[#86cb92] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Nenhuma conversa encontrada</h2>
          <p className="text-sm text-muted-foreground">
            As conversas do chatbot aparecerão aqui quando houver mensagens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* ChatList - Lista de conversas */}
      <div
        className={`
          w-full lg:w-[300px] h-full bg-white flex flex-col border-r border-border
          ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}
        `}
      >
        <ChatList
          conversas={conversas}
          conversaAtiva={conversaAtiva?.id || null}
          onSelectConversa={handleSelectConversa}
        />
      </div>

      {/* ChatWindow - Janela de chat */}
      <div
        className={`
          flex-1 h-full bg-white flex flex-col
          ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}
        `}
      >
        <ChatWindow
          conversa={conversaAtiva}
          mensagens={mensagens}
          onSendMessage={enviarMensagem}
          onBack={handleBackToList}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}

export default ChatbotPage;
