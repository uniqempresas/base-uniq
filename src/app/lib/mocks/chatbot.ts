/**
 * Mock Data do Módulo Chatbot
 * Sprint 12 - UNIQ Empresas
 */

import type {
  Conversa,
  Mensagem,
  RespostaAuto,
  FAQItem,
  PalavraChave,
  ChatbotConfig
} from '../types/chatbot';

// ============================================
// HELPERS
// ============================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date;
}

function hoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

function minutesAgo(minutes: number): Date {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date;
}

// ============================================
// MOCK CONFIGURATION
// ============================================

export const mockChatbotConfig: ChatbotConfig = {
  status: 'online',
  horarioFuncionamento: {
    inicio: '08:00',
    fim: '18:00'
  },
  responderForaHorario: true,
  msgForaHorario: 'Olá! No momento estamos fora do horário de atendimento. Nossa equipe responderá sua mensagem no próximo dia útil.'
};

// ============================================
// MOCK CONVERSAS
// ============================================

export const mockConversas: Conversa[] = [
  {
    id: 'conv-001',
    clienteNome: 'Maria Santos',
    clienteAvatar: undefined,
    ultimaMensagem: 'Ótimo, obrigado pela atenção!',
    timestamp: minutesAgo(15),
    naoLidas: 0,
    status: 'ativa'
  },
  {
    id: 'conv-002',
    clienteNome: 'João Silva',
    clienteAvatar: undefined,
    ultimaMensagem: ' qualifying',
    timestamp: hoursAgo(2),
    naoLidas: 1,
    status: 'ativa'
  },
  {
    id: 'conv-003',
    clienteNome: 'Ana Pereira',
    clienteAvatar: undefined,
    ultimaMensagem: 'Gostaria de saber os planos disponíveis',
    timestamp: hoursAgo(5),
    naoLidas: 3,
    status: 'ativa'
  },
  {
    id: 'conv-004',
    clienteNome: 'Pedro Costa',
    clienteAvatar: undefined,
    ultimaMensagem: 'Consegui resolver meu problema, obrigado!',
    timestamp: daysAgo(1),
    naoLidas: 0,
    status: 'encerrada'
  },
  {
    id: 'conv-005',
    clienteNome: 'Laura Oliveira',
    clienteAvatar: undefined,
    ultimaMensagem: 'Quando seria a próxima reunião?',
    timestamp: daysAgo(2),
    naoLidas: 0,
    status: 'arquivada'
  }
];

// ============================================
// MOCK MENSAGENS
// ============================================

export const mockMensagens: Record<string, Mensagem[]> = {
  'conv-001': [
    {
      id: 'msg-001-1',
      conversaId: 'conv-001',
      conteudo: 'Olá, bom dia! Gostaria de informações sobre os serviços da UNIQ.',
      tipo: 'texto',
      isBot: false,
      timestamp: daysAgo(0),
      lida: true
    },
    {
      id: 'msg-001-2',
      conversaId: 'conv-001',
      conteudo: 'Bom dia! Claro, ficamos felizes em ajudar. Qual tipo de serviço você está procurando?',
      tipo: 'texto',
      isBot: true,
      timestamp: minutesAgo(25),
      lida: true
    },
    {
      id: 'msg-001-3',
      conversaId: 'conv-001',
      conteudo: 'Estou interested em soluções para minha empresa.',
      tipo: 'texto',
      isBot: false,
      timestamp: minutesAgo(20),
      lida: true
    },
    {
      id: 'msg-001-4',
      conversaId: 'conv-001',
      conteudo: 'Perfeito!Temos diversos planos corporativo.Poderia me contar mais sobre o porte da sua empresa?',
      tipo: 'texto',
      isBot: true,
      timestamp: minutesAgo(18),
      lida: true
    },
    {
      id: 'msg-001-5',
      conversaId: 'conv-001',
      conteudo: 'Somos uma médi@ empresa, cerca de 50 funcionários.',
      tipo: 'texto',
      isBot: false,
      timestamp: minutesAgo(16),
      lida: true
    },
    {
      id: 'msg-001-6',
      conversaId: 'conv-001',
      conteudo: 'Ótimo,agradecid@! Vou encaminh@r nosso especIalista corporativo para falar com você.',
      tipo: 'texto',
      isBot: true,
      timestamp: minutesAgo(15),
      lida: true
    },
    {
      id: 'msg-001-7',
      conversaId: 'conv-001',
      conteudo: 'Ótimo, obrigado pela atenção!',
      tipo: 'texto',
      isBot: false,
      timestamp: minutesAgo(15),
      lida: true
    }
  ],
  'conv-002': [
    {
      id: 'msg-002-1',
      conversaId: 'conv-002',
      conteudo: 'Hi, I need information about your products.',
      tipo: 'texto',
      isBot: false,
      timestamp: hoursAgo(2),
      lida: false
    },
    {
      id: 'msg-002-2',
      conversaId: 'conv-002',
      conteudo: 'Hello! We have several solutions for businesses. What specific information do you need?',
      tipo: 'texto',
      isBot: true,
      timestamp: hoursAgo(2),
      lida: true
    },
    {
      id: 'msg-002-3',
      conversaId: 'conv-002',
      conteudo: 'Looking for CRM solutions',
      tipo: 'texto',
      isBot: false,
      timestamp: hoursAgo(2),
      lida: true
    },
    {
      id: 'msg-002-4',
      conversaId: 'conv-002',
      conteudo: 'We have an excellent CRM tool! Let me send you more details.',
      tipo: 'texto',
      isBot: true,
      timestamp: hoursAgo(2),
      lida: true
    }
  ],
  'conv-003': [
    {
      id: 'msg-003-1',
      conversaId: 'conv-003',
      conteudo: 'Boa tarde! Vocês atende@ PJ?',
      tipo: 'texto',
      isBot: false,
      timestamp: hoursAgo(5),
      lida: true
    },
    {
      id: 'msg-003-2',
      conversaId: 'conv-003',
      conteudo: 'Boa tarde! Sim,atendemos tanto PF quanto PJ.Como posso ajudar?',
      tipo: 'texto',
      isBot: true,
      timestamp: hoursAgo(5),
      lida: true
    },
    {
      id: 'msg-003-3',
      conversaId: 'conv-003',
      conteudo: 'Gostaria de saber os planos disponíveis',
      tipo: 'texto',
      isBot: false,
      timestamp: hoursAgo(5),
      lida: false
    }
  ],
  'conv-004': [
    {
      id: 'msg-004-1',
      conversaId: 'conv-004',
      conteudo: 'Estou com problema no login',
      tipo: 'texto',
      isBot: false,
      timestamp: daysAgo(1),
      lida: true
    },
    {
      id: 'msg-004-2',
      conversaId: 'conv-004',
      conteudo: 'Olá! Lamento pelo problème.Pode me informar qual erro aparece?',
      tipo: 'texto',
      isBot: true,
      timestamp: daysAgo(1),
      lida: true
    },
    {
      id: 'msg-004-3',
      conversaId: 'conv-004',
      conteudo: 'Aparece "usuário inválido"',
      tipo: 'texto',
      isBot: false,
      timestamp: daysAgo(1),
      lida: true
    },
    {
      id: 'msg-004-4',
      conversaId: 'conv-004',
      conteudo: 'Vou verificar seu cadastro.Por favor,aguarde um momento.',
      tipo: 'texto',
      isBot: true,
      timestamp: daysAgo(1),
      lida: true
    },
    {
      id: 'msg-004-5',
      conversaId: 'conv-004',
      conteudo: 'Pronto! Password redefinida. Você receberá um email para criar nova senha.',
      tipo: 'texto',
      isBot: true,
      timestamp: daysAgo(1),
      lida: true
    },
    {
      id: 'msg-004-6',
      conversaId: 'conv-004',
      conteudo: 'Consegui resolver meu problema, obrigado!',
      tipo: 'texto',
      isBot: false,
      timestamp: daysAgo(1),
      lida: true
    }
  ],
  'conv-005': [
    {
      id: 'msg-005-1',
      conversaId: 'conv-005',
      conteudo: 'Olá, quando seria a próxima reunião?',
      tipo: 'texto',
      isBot: false,
      timestamp: daysAgo(2),
      lida: true
    },
    {
      id: 'msg-005-2',
      conversaId: 'conv-005',
      conteudo: 'Olá Laura! Temos disponibilidade na próxima quinta às 14h. Works for you?',
      tipo: 'texto',
      isBot: true,
      timestamp: daysAgo(2),
      lida: true
    },
    {
      id: 'msg-005-3',
      conversaId: 'conv-005',
      conteudo: 'Quando seria a próxima reunião?',
      tipo: 'texto',
      isBot: false,
      timestamp: daysAgo(2),
      lida: true
    }
  ]
};

// ============================================
// MOCK RESPOSTAS AUTOMÁTICAS
// ============================================

export const mockRespostasAuto: RespostaAuto[] = [
  {
    id: 'ra-001',
    gatilho: 'oi',
    resposta: 'Olá! Bem-vindo à UNIQ Empresas. Como posso ajudar hoje?',
    ativa: true,
    delayMs: 1000
  },
  {
    id: 'ra-002',
    gatilho: 'olá',
    resposta: 'Olá! Bem-vindo à UNIQ Empresas. Como posso ajudar hoje?',
    ativa: true,
    delayMs: 1000
  },
  {
    id: 'ra-003',
    gatilho: 'horário',
    resposta: 'Nosso horário de atendimento é de segunda a sexta, das 08h às 18h.',
    ativa: true,
    delayMs: 1500
  },
  {
    id: 'ra-004',
    gatilho: 'preço',
    resposta: 'Temos diversos planos! Gostaria que eu encaminhasse nossas opções por email?',
    ativa: true,
    delayMs: 1500
  },
  {
    id: 'ra-005',
    gatilho: 'plano',
    resposta: 'Temos planos a partir de R$99/mês. Posso enviar mais detalhes?',
    ativa: true,
    delayMs: 1500
  },
  {
    id: 'ra-006',
    gatilho: 'duvida',
    resposta: 'Ficarei feliz em ajudar! Qual é sua dúvida?',
    ativa: true,
    delayMs: 1200
  },
  {
    id: 'ra-007',
    gatilho: 'ajuda',
    resposta: 'Como posso ajudar? Posso informar sobre planos, horários ou suporte técnico.',
    ativa: true,
    delayMs: 1000
  },
  {
    id: 'ra-008',
    gatilho: 'suporte',
    resposta: 'Para suporte técnico, por favor, relate o problema que oura equipe verificará.',
    ativa: true,
    delayMs: 1500
  },
  {
    id: 'ra-009',
    gatilho: 'obrigado',
    resposta: 'Estamos à disposição! Mais alguma dúvida?',
    ativa: true,
    delayMs: 1000
  },
  {
    id: 'ra-010',
    gatilho: 'tchau',
    resposta: 'Foi um prazer atender! Até a próxima!',
    ativa: true,
    delayMs: 800
  }
];

// ============================================
// MOCK FAQ
// ============================================

export const mockFAQs: FAQItem[] = [
  {
    id: 'faq-001',
    pergunta: 'Quais são os planos disponíveis?',
    resposta: 'Temos planos Starter (R$99/mês), Profissional (R$199/mês) e Corporativo (sob consulta). Todos com funcionalidades diferenciadas.',
    ordem: 1
  },
  {
    id: 'faq-002',
    pergunta: 'Como funciona a contratação?',
    resposta: 'Você pode contratar diretamente pelo site ou falar com um de nossos consultores.',
    ordem: 2
  },
  {
    id: 'faq-003',
    pergunta: 'Qual o prazo de implementação?',
    resposta: 'O setup inicial leva em média 48 horas úteis. Após isso, sua empresa já pode utilizar o sistema.',
    ordem: 3
  },
  {
    id: 'faq-004',
    pergunta: 'Vocês oferecem suporte técnico?',
    resposta: 'Sim, nosso suporte funciona de segunda a sexta das 08h às 18h por chat, email ou telefone.',
    ordem: 4
  },
  {
    id: 'faq-005',
    pergunta: 'Posso testar antes de contratar?',
    resposta: 'Claro! Oferecemos um período de teste gratuito de 14 dias. Basta se cadastrar em nosso site.',
    ordem: 5
  }
];

// ============================================
// MOCK PALAVRAS-CHAVE
// ============================================

export const mockPalavrasChave: PalavraChave[] = [
  {
    id: 'pc-001',
    palavra: 'vip',
    acao: 'responder',
    resposta: 'Obrigado pelo interesse! Vou conectá-lo com nosso gestor de contas VIP.'
  },
  {
    id: 'pc-002',
    palavra: 'urgente',
    acao: 'encaminhar'
  },
  {
    id: 'pc-003',
    palavra: 'reclamação',
    acao: 'encaminhar'
  },
  {
    id: 'pc-004',
    palavra: 'bug',
    acao: 'responder',
    resposta: 'Lamentamos o problema. Poderia informar mais detalhes para nosso time técnico?'
  },
  {
    id: 'pc-005',
    palavra: 'parar',
    acao: 'silenciar'
  }
];