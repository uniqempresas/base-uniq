/**
 * Tipos do Módulo Chatbot
 * Sprint 12 - UNIQ Empresas
 */

// ============================================
// TYPES
// ============================================

export type TipoMensagem = 'texto' | 'imagem' | 'arquivo';

export type StatusBot = 'online' | 'offline' | 'ocupado';

export type StatusConversa = 'ativa' | 'encerrada' | 'arquivada';

export type AcaoPalavraChave = 'responder' | 'encaminhar' | 'silenciar';

// ============================================
// INTERFACES
// ============================================

export interface Mensagem {
  id: string;
  conversaId: string;
  conteudo: string;
  tipo: TipoMensagem;
  isBot: boolean;
  timestamp: Date;
  lida: boolean;
  arquivoUrl?: string;
}

export interface Conversa {
  id: string;
  clienteNome: string;
  clienteAvatar?: string;
  ultimaMensagem: string;
  timestamp: Date;
  naoLidas: number;
  status: StatusConversa;
}

export interface RespostaAuto {
  id: string;
  gatilho: string;
  resposta: string;
  ativa: boolean;
  delayMs: number;
}

export interface FAQItem {
  id: string;
  pergunta: string;
  resposta: string;
  ordem: number;
}

export interface PalavraChave {
  id: string;
  palavra: string;
  acao: AcaoPalavraChave;
  resposta?: string;
}

export interface ChatbotConfig {
  status: StatusBot;
  horarioFuncionamento: { inicio: string; fim: string };
  responderForaHorario: boolean;
  msgForaHorario: string;
}