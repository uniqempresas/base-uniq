export type ClienteOrigem = "whatsapp" | "manual";

export interface Cliente {
  id: string;
  empresa_id?: string;
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
  origem: ClienteOrigem;
  conversa_id?: string | null;
  observacoes?: string | null;
}

export interface ClienteConversaMensagem {
  id: string;
  conteudo: string;
  isCliente: boolean;
  timestamp: string;
}
