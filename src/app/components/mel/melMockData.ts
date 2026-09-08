// ─── MEL Mock Data ───────────────────────────────────────────────────────────

export type InsightTipo = "vendas" | "estoque" | "clientes" | "financeiro";
export type InsightPrioridade = "critico" | "urgente" | "importante" | "informativo";
export type AcaoPrioridade = "alta" | "media" | "baixa";
export type TomVoz = "descontraido" | "profissional" | "parceiro";

export interface Insight {
  id: string;
  tipo: InsightTipo;
  prioridade: InsightPrioridade;
  titulo: string;
  descricao: string;
  valor?: string;
  variacao?: number; // percentual
  tendencia?: "crescente" | "decrescente" | "estavel";
  cta: string;
  ctaPath: string;
  lido: boolean;
  horario: string;
  feedback?: "util" | "nao_util";
}

export interface AcaoSugerida {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: AcaoPrioridade;
  modulo: string;
  prazo?: string;
  status: "pendente" | "concluida" | "ignorada";
}

export interface MelStats {
  insightsHoje: number;
  insightsSemana: number;
  insightsMes: number;
  taxaLeitura: number;
  acoesConcluidas: number;
  acoesSugeridas: number;
  aprendizadoPct: number;
}

export interface WhatsAppStatus {
  conectado: boolean;
  numero: string;
  ultimaSincronizacao: string;
  mensagensEnviadas: number;
}

export const insightsMock: Insight[] = [
  {
    id: "1",
    tipo: "vendas",
    prioridade: "importante",
    titulo: "Você vendeu 20% mais que ontem! 🎉",
    descricao: "Suas vendas de hoje já somam R$ 1.240, superando o dia anterior. Continue assim!",
    valor: "R$ 1.240",
    variacao: 20,
    tendencia: "crescente",
    cta: "Ver vendas",
    ctaPath: "/vendas/pdv",
    lido: false,
    horario: "há 2h",
  },
  {
    id: "2",
    tipo: "estoque",
    prioridade: "critico",
    titulo: "Camiseta Preta está quase acabando ⚠️",
    descricao: "Restam apenas 2 unidades em estoque. Baseado no seu histórico, pode acabar em 3 dias.",
    valor: "2 unidades",
    tendencia: "decrescente",
    cta: "Repor estoque",
    ctaPath: "/estoque/produtos",
    lido: false,
    horario: "há 45min",
  },
  {
    id: "3",
    tipo: "clientes",
    prioridade: "urgente",
    titulo: "3 clientes VIP não compram há 30 dias 📞",
    descricao: "Ana Lima, Carlos Souza e Pedro Alves costumavam comprar todo mês. Que tal mandar uma mensagem?",
    valor: "3 clientes",
    tendencia: "estavel",
    cta: "Ver clientes",
    ctaPath: "/crm/clientes",
    lido: true,
    horario: "há 1h",
  },
  {
    id: "4",
    tipo: "financeiro",
    prioridade: "urgente",
    titulo: "2 contas vencem amanhã! 💰",
    descricao: "Total de R$ 850 a pagar. Verifique seu saldo para evitar juros.",
    valor: "R$ 850",
    tendencia: "estavel",
    cta: "Ver contas",
    ctaPath: "/financeiro/contas-pagar",
    lido: false,
    horario: "há 30min",
  },
];

export const acoesSugeridaMock: AcaoSugerida[] = [
  {
    id: "a1",
    titulo: "Ligar para Ana Lima",
    descricao: "Negociação parada há 5 dias. Ela estava quase decidindo.",
    prioridade: "alta",
    modulo: "CRM",
    prazo: "Hoje",
    status: "pendente",
  },
  {
    id: "a2",
    titulo: "Repor Camiseta Preta P",
    descricao: "Só restam 2 unidades. Pedido mínimo: 10 unidades.",
    prioridade: "alta",
    modulo: "Estoque",
    prazo: "Hoje",
    status: "pendente",
  },
  {
    id: "a3",
    titulo: "Pagar fatura do fornecedor",
    descricao: "Vence amanhã. Valor: R$ 650.",
    prioridade: "alta",
    modulo: "Financeiro",
    prazo: "Amanhã",
    status: "pendente",
  },
  {
    id: "a4",
    titulo: "Enviar proposta para Carlos",
    descricao: "Ele pediu um orçamento na semana passada.",
    prioridade: "media",
    modulo: "CRM",
    prazo: "Até 3ª feira",
    status: "pendente",
  },
  {
    id: "a5",
    titulo: "Atualizar preço do tênis",
    descricao: "Custo subiu 8% mas o preço de venda não foi atualizado.",
    prioridade: "baixa",
    modulo: "Estoque",
    status: "pendente",
  },
];

export const melStatsMock: MelStats = {
  insightsHoje: 4,
  insightsSemana: 18,
  insightsMes: 64,
  taxaLeitura: 87,
  acoesConcluidas: 12,
  acoesSugeridas: 18,
  aprendizadoPct: 73,
};

export const whatsAppStatusMock: WhatsAppStatus = {
  conectado: true,
  numero: "(11) 9****-8742",
  ultimaSincronizacao: "há 3 minutos",
  mensagensEnviadas: 47,
};

export const previewsMensagem: Record<TomVoz, Record<string, string>> = {
  descontraido: {
    vendas: "Ei, Maria! 🎉 Olha só: você vendeu R$ 850 hoje, 20% a mais que ontem! Você tá mandando bem demais!",
    estoque: "Oi! ⚠️ Tô vendo aqui que a Camiseta Preta tá quase acabando (só 2 unidades). Manda um pedido logo?",
    clientes: "Oie! 📞 3 clientes seus sumiram há 30 dias. Que tal dar um oi pra eles hoje?",
  },
  profissional: {
    vendas: "Bom dia. As vendas de hoje totalizaram R$ 850, representando um crescimento de 20% em relação ao dia anterior.",
    estoque: "Alerta de estoque: Camiseta Preta possui apenas 2 unidades disponíveis. Recomenda-se reposição imediata.",
    clientes: "3 clientes não realizam compras há 30 dias. Recomenda-se entrar em contato para retomada do relacionamento.",
  },
  parceiro: {
    vendas: "Vamos lá, Maria! 💪 Hoje você vendeu R$ 850, 20% a mais que ontem. Ótimo trabalho! Bora manter esse ritmo?",
    estoque: "Atenção! 📦 A Camiseta Preta está com estoque baixo (2 unidades). Vamos fazer o pedido de reposição?",
    clientes: "Ei! 👋 3 clientes especiais seus não aparecem há 30 dias. Que tal retomar o contato? Posso te ajudar!",
  },
};
