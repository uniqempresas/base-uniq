/**
 * ChatInput - Campo de input de mensagem
 * Componente de UI do Módulo Chatbot
 * Sprint 12 - UNIQ Empresas
 */

import React, { useState, KeyboardEvent } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, Image as ImageIcon } from 'lucide-react';

interface ChatInputProps {
  onSend: (mensagem: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [mensagem, setMensagem] = useState('');

  const handleSend = () => {
    if (mensagem.trim() && !disabled) {
      onSend(mensagem.trim());
      setMensagem('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-border bg-white">
      {/* Botão de imagem (placeholder) */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        disabled={disabled}
      >
        <ImageIcon className="h-5 w-5" />
      </Button>

      {/* Input de texto */}
      <Input
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite uma mensagem..."
        disabled={disabled}
        className="flex-1"
      />

      {/* Botão de enviar */}
      <Button
        type="button"
        onClick={handleSend}
        disabled={disabled || !mensagem.trim()}
        className="bg-primary text-primary-foreground hover:bg-foreground hover:text-white"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default ChatInput;