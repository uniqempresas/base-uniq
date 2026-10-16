// Tipos de domínio do CRM — Pipeline real (SPEC-CRM-Pipeline-Real-Menu, 16/10/2026).
// Colunas e movimentação batem SEMPRE pelo nome de crm_etapas.nome da empresa logada.

/** Linha crua de crm_etapas */
export interface EtapaDB {
  id: string;
  empresa_id: string | null;
  nome: string;
  posicao: number | null;
  cor: string | null;
  fixa: boolean | null;
}

/** Linha crua de crm_oportunidades */
export interface OportunidadeDB {
  id: string;
  empresa_id: string | null;
  cliente_id: string | null;
  lead_id: string | null;
  titulo: string | null;
  /** numeric — Supabase devolve number, mas tolera string por segurança */
  valor: number | string | null;
  /** nome da etapa (crm_etapas.nome) */
  estagio: string | null;
  data_fechamento: string | null;
  created_at: string | null;
  estagio_desde: string | null;
  atualizado_em: string | null;
}

/** Etapa normalizada para o kanban (cor em hex, probabilidade derivada da posicao) */
export interface PipelineEtapa {
  id: string;
  /** crm_etapas.nome — chave de casamento com crm_oportunidades.estagio */
  nome: string;
  /** label de exibição (= nome) */
  label: string;
  posicao: number;
  /** hex válido; valores não-hex caem na cor neutra */
  cor: string;
  fixa: boolean;
  probabilidade: number;
}

/** Opção leve de cliente (me_cliente) para selects do pipeline */
export interface ClienteLista {
  id: string;
  nome: string;
  telefone: string;
}

/** View-model do card do kanban (mesmo shape visual do mock `Negociacao`) */
export interface NegociacaoCardView {
  id: string;
  titulo: string;
  clienteId: string | null;
  clienteNome: string;
  clienteInitials: string;
  clienteColor: string;
  valor: number;
  /** nome da etapa atual (estagio) */
  etapa: string;
  probabilidade: number;
  /** formatada dd/mm/aaaa ou "—" */
  dataFechamento: string;
  /** "yyyy-mm-dd" crua para input date */
  dataFechamentoISO: string | null;
  proximaAcao: string;
  tags: string[];
  diasNaEtapa: number;
  atrasado: boolean;
  /** estagio_desde (fallback created_at) — base do "ganho no mês" */
  estagioDesde: string | null;
}

/** Payload de criação/edição de oportunidade */
export interface OportunidadeInput {
  /** presente = update; ausente = insert */
  id?: string;
  clienteId: string | null;
  titulo: string;
  valor: number;
  /** nome da etapa (crm_etapas.nome) */
  estagio: string;
  /** "yyyy-mm-dd" ou null */
  dataFechamento: string | null;
}
