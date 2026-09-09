export type TagType = "VIP" | "Prospect" | "Inadimplente" | "Cliente Fiel" | "Aniversariante" | "Inativo" | "Lead Quente";

export const TAG_COLORS: Record<TagType | string, { bg: string; text: string; border: string }> = {
  VIP: { bg: "#FEF9C3", text: "#854D0E", border: "#FDE047" },
  Prospect: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  Inadimplente: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
  "Cliente Fiel": { bg: "#F0FDF4", text: "#15803D", border: "#86EFAC" },
  Aniversariante: { bg: "#FDF4FF", text: "#7E22CE", border: "#E9D5FF" },
  Inativo: { bg: "#efefef", text: "#627271", border: "#efefef" },
  "Lead Quente": { bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
};

export interface Cliente {
  id: string;
  nome: string;
  tipo: "PF" | "PJ";
  avatar?: string;
  initials: string;
  avatarColor: string;
  email: string;
  telefone: string;
  whatsapp: string;
  tags: string[];
  ultimaInteracao: string;
  totalCompras: number;
  status: "ativo" | "inativo";
  cidade: string;
  vendedor: string;
  dataCadastro: string;
  documento: string;
  aniversario?: string;
  origem: "whatsapp" | "manual";
  conversa_id?: string | null;
  observacoes?: string | null;
}

export interface Interacao {
  id: string;
  tipo: "ligacao" | "email" | "whatsapp" | "reuniao" | "visita" | "nota";
  data: string;
  assunto: string;
  descricao: string;
  autor: string;
  sentimento: "positivo" | "neutro" | "negativo";
  followUpPendente?: boolean;
  followUpData?: string;
}

export interface Negociacao {
  id: string;
  titulo: string;
  clienteId: string;
  clienteNome: string;
  clienteInitials: string;
  clienteColor: string;
  valor: number;
  etapa: string;
  probabilidade: number;
  dataFechamento: string;
  proximaAcao: string;
  tags: string[];
  diasNaEtapa: number;
  atrasado: boolean;
  vendedor: string;
}

export const CLIENTES: Cliente[] = [
  {
    id: "1",
    nome: "Maria Fernanda Souza",
    tipo: "PF",
    initials: "MF",
    avatarColor: "#8B5CF6",
    email: "mariafernanda@gmail.com",
    telefone: "(11) 99123-4567",
    whatsapp: "(11) 99123-4567",
    tags: ["VIP", "Cliente Fiel"],
    ultimaInteracao: "Hoje, 10:30",
    totalCompras: 12850,
    status: "ativo",
    cidade: "São Paulo / SP",
    vendedor: "Ana Costa",
    dataCadastro: "12/03/2024",
    documento: "123.456.789-00", origem: "manual",
    aniversario: "15/04",
  },
  {
    id: "2",
    nome: "Tech Solutions LTDA",
    tipo: "PJ",
    initials: "TS",
    avatarColor: "#0EA5E9",
    email: "contato@techsolutions.com.br",
    telefone: "(11) 3210-5678",
    whatsapp: "(11) 98765-0001",
    tags: ["VIP", "Lead Quente"],
    ultimaInteracao: "Ontem, 14:00",
    totalCompras: 45600,
    status: "ativo",
    cidade: "São Paulo / SP",
    vendedor: "Carlos Lima",
    dataCadastro: "05/01/2024",
    documento: "12.345.678/0001-90", origem: "manual",
  },
  {
    id: "3",
    nome: "Pedro Alves",
    tipo: "PF",
    initials: "PA",
    avatarColor: "#F59E0B",
    email: "pedroalves@hotmail.com",
    telefone: "(21) 98001-2345",
    whatsapp: "(21) 98001-2345",
    tags: ["Prospect"],
    ultimaInteracao: "Há 3 dias",
    totalCompras: 0,
    status: "ativo",
    cidade: "Rio de Janeiro / RJ",
    vendedor: "Ana Costa",
    dataCadastro: "18/03/2024",
    documento: "987.654.321-00", origem: "manual",
  },
  {
    id: "4",
    nome: "Confeitaria Doce Mel",
    tipo: "PJ",
    initials: "CD",
    avatarColor: "#EC4899",
    email: "doceMel@confeitaria.com",
    telefone: "(31) 3456-7890",
    whatsapp: "(31) 98765-4321",
    tags: ["Cliente Fiel"],
    ultimaInteracao: "Há 1 semana",
    totalCompras: 8200,
    status: "ativo",
    cidade: "Belo Horizonte / MG",
    vendedor: "Carlos Lima",
    dataCadastro: "22/09/2023",
    documento: "98.765.432/0001-10", origem: "manual",
  },
  {
    id: "5",
    nome: "João Roberto Santos",
    tipo: "PF",
    initials: "JR",
    avatarColor: "#EF4444",
    email: "joaoroberto@gmail.com",
    telefone: "(11) 97654-3210",
    whatsapp: "(11) 97654-3210",
    tags: ["Inadimplente"],
    ultimaInteracao: "Há 2 semanas",
    totalCompras: 3400,
    status: "ativo",
    cidade: "São Paulo / SP",
    vendedor: "Ana Costa",
    dataCadastro: "07/07/2023",
    documento: "456.789.123-00", origem: "manual",
  },
  {
    id: "6",
    nome: "Distribuidora Norte Sul",
    tipo: "PJ",
    initials: "DN",
    avatarColor: "#10B981",
    email: "compras@nortesul.com.br",
    telefone: "(85) 3333-4444",
    whatsapp: "(85) 99999-1111",
    tags: ["VIP", "Cliente Fiel"],
    ultimaInteracao: "Há 3 dias",
    totalCompras: 89000,
    status: "ativo",
    cidade: "Fortaleza / CE",
    vendedor: "Carlos Lima",
    dataCadastro: "14/02/2023",
    documento: "45.678.901/0001-23", origem: "manual",
  },
  {
    id: "7",
    nome: "Luísa Martins",
    tipo: "PF",
    initials: "LM",
    avatarColor: "#6366F1",
    email: "luisa.martins@email.com",
    telefone: "(41) 99888-7766",
    whatsapp: "(41) 99888-7766",
    tags: ["Prospect", "Lead Quente"],
    ultimaInteracao: "Hoje, 09:15",
    totalCompras: 1200,
    status: "ativo",
    cidade: "Curitiba / PR",
    vendedor: "Ana Costa",
    dataCadastro: "28/03/2024",
    documento: "321.654.987-00", origem: "manual",
    aniversario: "31/03",
  },
  {
    id: "8",
    nome: "Farmácia Bem Estar",
    tipo: "PJ",
    initials: "FB",
    avatarColor: "#14B8A6",
    email: "bemestar@farmacia.com",
    telefone: "(47) 3211-0099",
    whatsapp: "(47) 98800-1122",
    tags: ["Inativo"],
    ultimaInteracao: "Há 45 dias",
    totalCompras: 5600,
    status: "inativo",
    cidade: "Joinville / SC",
    vendedor: "Carlos Lima",
    dataCadastro: "03/05/2023",
    documento: "67.890.123/0001-45", origem: "manual",
  },
];

export const INTERACOES: Interacao[] = [
  {
    id: "1",
    tipo: "ligacao",
    data: "31/03/2024 - 10:30",
    assunto: "Follow-up pós compra",
    descricao: "Cliente satisfeita com a última compra. Mencionou interesse em produtos da coleção de inverno. Prometeu retornar na semana que vem.",
    autor: "Ana Costa",
    sentimento: "positivo",
    followUpPendente: true,
    followUpData: "05/04/2024",
  },
  {
    id: "2",
    tipo: "whatsapp",
    data: "29/03/2024 - 14:00",
    assunto: "Catálogo de produtos",
    descricao: "Enviei o catálogo atualizado com os novos produtos da temporada. Cliente agradeceu e disse que vai avaliar.",
    autor: "Ana Costa",
    sentimento: "neutro",
  },
  {
    id: "3",
    tipo: "reuniao",
    data: "22/03/2024 - 09:00",
    assunto: "Apresentação de proposta",
    descricao: "Reunião presencial na loja. Apresentamos os planos de fidelidade e descontos progressivos. Cliente mostrou interesse alto.",
    autor: "Ana Costa",
    sentimento: "positivo",
  },
  {
    id: "4",
    tipo: "email",
    data: "15/03/2024 - 16:45",
    assunto: "Proposta comercial enviada",
    descricao: "Enviamos proposta formal com condições especiais para compras acima de R$ 500. Aguardando resposta.",
    autor: "Carlos Lima",
    sentimento: "neutro",
  },
  {
    id: "5",
    tipo: "ligacao",
    data: "10/03/2024 - 11:00",
    assunto: "Primeiro contato",
    descricao: "Ligação inicial de prospecção. Cliente interessada mas pediu tempo para pensar. Agendamos contato de retorno.",
    autor: "Ana Costa",
    sentimento: "neutro",
  },
];

export const PIPELINE_ETAPAS = [
  { id: "prospectando", label: "Prospectando", cor: "#627271", probabilidadePadrao: 10 },
  { id: "primeiro_contato", label: "Primeiro Contato", cor: "#0EA5E9", probabilidadePadrao: 25 },
  { id: "proposta_enviada", label: "Proposta Enviada", cor: "#8B5CF6", probabilidadePadrao: 50 },
  { id: "negociacao", label: "Negociação", cor: "#F59E0B", probabilidadePadrao: 70 },
  { id: "fechamento", label: "Fechamento", cor: "#F97316", probabilidadePadrao: 90 },
  { id: "ganho", label: "Ganho 🏆", cor: "#22C55E", probabilidadePadrao: 100 },
  { id: "perdido", label: "Perdido", cor: "#EF4444", probabilidadePadrao: 0 },
];

export const NEGOCIACOES: Negociacao[] = [
  {
    id: "n1",
    titulo: "Coleção Inverno 2024",
    clienteId: "1",
    clienteNome: "Maria Fernanda Souza",
    clienteInitials: "MF",
    clienteColor: "#8B5CF6",
    valor: 4500,
    etapa: "proposta_enviada",
    probabilidade: 60,
    dataFechamento: "15/04/2024",
    proximaAcao: "Aguardar retorno sobre proposta",
    tags: ["VIP"],
    diasNaEtapa: 3,
    atrasado: false,
    vendedor: "Ana Costa",
  },
  {
    id: "n2",
    titulo: "Contrato Anual de Suprimentos",
    clienteId: "2",
    clienteNome: "Tech Solutions LTDA",
    clienteInitials: "TS",
    clienteColor: "#0EA5E9",
    valor: 120000,
    etapa: "negociacao",
    probabilidade: 75,
    dataFechamento: "30/04/2024",
    proximaAcao: "Revisar cláusulas contratuais",
    tags: ["VIP", "Lead Quente"],
    diasNaEtapa: 5,
    atrasado: false,
    vendedor: "Carlos Lima",
  },
  {
    id: "n3",
    titulo: "Kit Inicial Premium",
    clienteId: "3",
    clienteNome: "Pedro Alves",
    clienteInitials: "PA",
    clienteColor: "#F59E0B",
    valor: 1800,
    etapa: "primeiro_contato",
    probabilidade: 30,
    dataFechamento: "20/04/2024",
    proximaAcao: "Enviar catálogo + proposta",
    tags: ["Prospect"],
    diasNaEtapa: 2,
    atrasado: false,
    vendedor: "Ana Costa",
  },
  {
    id: "n4",
    titulo: "Pedido Mensal Doce Mel",
    clienteId: "4",
    clienteNome: "Confeitaria Doce Mel",
    clienteInitials: "CD",
    clienteColor: "#EC4899",
    valor: 3200,
    etapa: "fechamento",
    probabilidade: 90,
    dataFechamento: "02/04/2024",
    proximaAcao: "Confirmar formas de pagamento",
    tags: ["Cliente Fiel"],
    diasNaEtapa: 1,
    atrasado: false,
    vendedor: "Carlos Lima",
  },
  {
    id: "n5",
    titulo: "Renegociação de Dívida",
    clienteId: "5",
    clienteNome: "João Roberto Santos",
    clienteInitials: "JR",
    clienteColor: "#EF4444",
    valor: 3400,
    etapa: "negociacao",
    probabilidade: 45,
    dataFechamento: "10/04/2024",
    proximaAcao: "Aguardar aprovação de crédito",
    tags: ["Inadimplente"],
    diasNaEtapa: 12,
    atrasado: true,
    vendedor: "Ana Costa",
  },
  {
    id: "n6",
    titulo: "Fornecimento Trimestral",
    clienteId: "6",
    clienteNome: "Distribuidora Norte Sul",
    clienteInitials: "DN",
    clienteColor: "#10B981",
    valor: 67000,
    etapa: "ganho",
    probabilidade: 100,
    dataFechamento: "28/03/2024",
    proximaAcao: "Emitir nota fiscal",
    tags: ["VIP", "Cliente Fiel"],
    diasNaEtapa: 0,
    atrasado: false,
    vendedor: "Carlos Lima",
  },
  {
    id: "n7",
    titulo: "Curso de Marketing Digital",
    clienteId: "7",
    clienteNome: "Luísa Martins",
    clienteInitials: "LM",
    clienteColor: "#6366F1",
    valor: 2200,
    etapa: "proposta_enviada",
    probabilidade: 55,
    dataFechamento: "18/04/2024",
    proximaAcao: "Ligar para tirar dúvidas",
    tags: ["Prospect", "Lead Quente"],
    diasNaEtapa: 4,
    atrasado: false,
    vendedor: "Ana Costa",
  },
  {
    id: "n8",
    titulo: "Reativação Farmácia",
    clienteId: "8",
    clienteNome: "Farmácia Bem Estar",
    clienteInitials: "FB",
    clienteColor: "#14B8A6",
    valor: 5000,
    etapa: "prospectando",
    probabilidade: 15,
    dataFechamento: "30/04/2024",
    proximaAcao: "Fazer contato inicial de reativação",
    tags: ["Inativo"],
    diasNaEtapa: 8,
    atrasado: true,
    vendedor: "Carlos Lima",
  },
  {
    id: "n9",
    titulo: "Expansão de Linha",
    clienteId: "2",
    clienteNome: "Tech Solutions LTDA",
    clienteInitials: "TS",
    clienteColor: "#0EA5E9",
    valor: 35000,
    etapa: "perdido",
    probabilidade: 0,
    dataFechamento: "20/03/2024",
    proximaAcao: "-",
    tags: ["VIP"],
    diasNaEtapa: 11,
    atrasado: false,
    vendedor: "Carlos Lima",
  },
];

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
