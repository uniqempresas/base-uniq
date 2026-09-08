/**
 * Hook Customizado: useChatbotConfig
 * Gerenciamento de configurações do módulo Chatbot
 * Sprint 12 - UNIQ Empresas
 */

import { useState, useCallback } from 'react';
import type {
  ChatbotConfig,
  RespostaAuto,
  FAQItem,
  PalavraChave,
  StatusBot
} from '../types/chatbot';
import {
  mockChatbotConfig,
  mockRespostasAuto,
  mockFAQs,
  mockPalavrasChave
} from '../lib/mocks/chatbot';

export interface UseChatbotConfigReturn {
  config: ChatbotConfig;
  status: StatusBot;
  respostasAuto: RespostaAuto[];
  faqs: FAQItem[];
  palavrasChave: PalavraChave[];
  atualizarStatus: (status: StatusBot) => void;
  atualizarConfig: (novaConfig: Partial<ChatbotConfig>) => void;
  adicionarResposta: (resposta: Omit<RespostaAuto, 'id'>) => void;
  atualizarResposta: (id: string, resposta: Partial<RespostaAuto>) => void;
  removerResposta: (id: string) => void;
  adicionarFAQ: (faq: Omit<FAQItem, 'id'>) => void;
  atualizarFAQ: (id: string, faq: Partial<FAQItem>) => void;
  removerFAQ: (id: string) => void;
  reorderFAQs: (faqs: FAQItem[]) => void;
  adicionarPalavraChave: (pc: Omit<PalavraChave, 'id'>) => void;
  atualizarPalavraChave: (id: string, pc: Partial<PalavraChave>) => void;
  removerPalavraChave: (id: string) => void;
}

export function useChatbotConfig(): UseChatbotConfigReturn {
  const [config, setConfig] = useState<ChatbotConfig>(mockChatbotConfig);
  const [respostasAuto, setRespostasAuto] = useState<RespostaAuto[]>(mockRespostasAuto);
  const [faqs, setFaqs] = useState<FAQItem[]>(mockFAQs);
  const [palavrasChave, setPalavrasChave] = useState<PalavraChave[]>(mockPalavrasChave);

  // Status atual do bot
  const status = config.status;

  // Atualizar status do bot
  const atualizarStatus = useCallback((novoStatus: StatusBot) => {
    setConfig(prev => ({ ...prev, status: novoStatus }));
  }, []);

  // Atualizar configurações
  const atualizarConfig = useCallback((novaConfig: Partial<ChatbotConfig>) => {
    setConfig(prev => ({ ...prev, ...novaConfig }));
  }, []);

  // ===== RESPOSTAS AUTOMÁTICAS =====

  const adicionarResposta = useCallback((resposta: Omit<RespostaAuto, 'id'>) => {
    const novaResposta: RespostaAuto = {
      ...resposta,
      id: `ra-${Date.now()}`
    };
    setRespostasAuto(prev => [...prev, novaResposta]);
  }, []);

  const atualizarResposta = useCallback((id: string, resposta: Partial<RespostaAuto>) => {
    setRespostasAuto(prev => prev.map((ra: RespostaAuto) =>
      ra.id === id ? { ...ra, ...resposta } : ra
    ));
  }, []);

  const removerResposta = useCallback((id: string) => {
    setRespostasAuto(prev => prev.filter((ra: RespostaAuto) => ra.id !== id));
  }, []);

  // ===== FAQs =====

  const adicionarFAQ = useCallback((faq: Omit<FAQItem, 'id'>) => {
    const novaFAQ: FAQItem = {
      ...faq,
      id: `faq-${Date.now()}`,
      ordem: faqs.length + 1
    };
    setFaqs(prev => [...prev, novaFAQ]);
  }, [faqs.length]);

  const atualizarFAQ = useCallback((id: string, faq: Partial<FAQItem>) => {
    setFaqs(prev => prev.map((f: FAQItem) =>
      f.id === id ? { ...f, ...faq } : f
    ));
  }, []);

  const removerFAQ = useCallback((id: string) => {
    setFaqs(prev => prev.filter((f: FAQItem) => f.id !== id));
  }, []);

  const reorderFAQs = useCallback((novasFaqs: FAQItem[]) => {
    setFaqs(novasFaqs);
  }, []);

  // ===== PALAVRAS-CHAVE =====

  const adicionarPalavraChave = useCallback((pc: Omit<PalavraChave, 'id'>) => {
    const novaPC: PalavraChave = {
      ...pc,
      id: `pc-${Date.now()}`
    };
    setPalavrasChave(prev => [...prev, novaPC]);
  }, []);

  const atualizarPalavraChave = useCallback((id: string, pc: Partial<PalavraChave>) => {
    setPalavrasChave(prev => prev.map((p: PalavraChave) =>
      p.id === id ? { ...p, ...pc } : p
    ));
  }, []);

  const removerPalavraChave = useCallback((id: string) => {
    setPalavrasChave(prev => prev.filter((p: PalavraChave) => p.id !== id));
  }, []);

  return {
    config,
    status,
    respostasAuto,
    faqs,
    palavrasChave,
    atualizarStatus,
    atualizarConfig,
    adicionarResposta,
    atualizarResposta,
    removerResposta,
    adicionarFAQ,
    atualizarFAQ,
    removerFAQ,
    reorderFAQs,
    adicionarPalavraChave,
    atualizarPalavraChave,
    removerPalavraChave
  };
}