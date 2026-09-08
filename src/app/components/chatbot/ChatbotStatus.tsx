/**
 * ChatbotStatus - Indicador de status do bot
 * Componente de UI do Módulo Chatbot
 * Sprint 12 - UNIQ Empresas
 */

import React from 'react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { StatusBot } from '../../types/chatbot';
import { Bot, ChevronDown } from 'lucide-react';

interface ChatbotStatusProps {
  status: StatusBot;
  onChange: (status: StatusBot) => void;
}

// Configuração de cores por status
const statusConfig = {
  online: {
    label: 'Online',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    borderColor: 'border-green-500'
  },
  offline: {
    label: 'Offline',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    borderColor: 'border-red-500'
  },
  ocupado: {
    label: 'Ocupado',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-500'
  }
};

export function ChatbotStatus({ status, onChange }: ChatbotStatusProps) {
  const config = statusConfig[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 px-3 py-1.5 h-auto"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
            <Bot className={`h-4 w-4 ${config.textColor}`} />
            <span className="text-sm font-medium">
              Bot {config.label}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start">
        <DropdownMenuItem 
          onClick={() => onChange('online')}
          className="flex items-center gap-2"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span>Online</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onChange('ocupado')}
          className="flex items-center gap-2"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span>Ocupado</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onChange('offline')}
          className="flex items-center gap-2"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Offline</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ChatbotStatus;