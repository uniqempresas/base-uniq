export type AgendamentoStatus =
  | "pendente"
  | "confirmado"
  | "em_andamento"
  | "concluido"
  | "cancelado"
  | "nao_compareceu";

export type OrigemAgendamento = "presencial" | "telefone" | "whatsapp" | "online";

export interface TimelineItem {
  id: string;
  tipo: "criacao" | "confirmacao" | "lembrete" | "alteracao" | "checkin" | "checkout" | "cancelamento" | "nota";
  descricao: string;
  data: string;
  hora: string;
  usuario: string;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail?: string;
  servicoId: string;
  servicoNome: string;
  servicoCategoria: string;
  profissional: string;
  profissionalId: string;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  horaFim: string; // HH:MM
  duracao: number; // minutes
  valor: number;
  status: AgendamentoStatus;
  observacoes?: string;
  observacoesInternas?: string;
  primeiraVez: boolean;
  confirmacaoEnviada: boolean;
  lembreteEnviado: boolean;
  origem: OrigemAgendamento;
  timeline: TimelineItem[];
  motivoCancelamento?: string;
}

export interface Servico {
  id: string;
  nome: string;
  duracao: number; // minutes
  valor: number;
  categoria: string;
  cor: string;
}

export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  cor: string;
  ativo: boolean;
}

/* ─── Profissionais ─── */
export const PROFISSIONAIS: Profissional[] = [
  { id: "prof1", nome: "Maria Silva", especialidade: "Cabelo", cor: "#8B5CF6", ativo: true },
  { id: "prof2", nome: "Ana Beatriz", especialidade: "Estética", cor: "#EC4899", ativo: true },
  { id: "prof3", nome: "Carlos Lima", especialidade: "Barba", cor: "#0EA5E9", ativo: true },
];

/* ─── Serviços ─── */
export const SERVICOS: Servico[] = [
  { id: "s1", nome: "Corte Feminino", duracao: 60, valor: 120, categoria: "Cabelo", cor: "#8B5CF6" },
  { id: "s2", nome: "Coloração", duracao: 120, valor: 280, categoria: "Cabelo", cor: "#EC4899" },
  { id: "s3", nome: "Manicure", duracao: 45, valor: 60, categoria: "Unhas", cor: "#F59E0B" },
  { id: "s4", nome: "Pedicure", duracao: 60, valor: 70, categoria: "Unhas", cor: "#F97316" },
  { id: "s5", nome: "Limpeza de Pele", duracao: 90, valor: 180, categoria: "Estética", cor: "#10B981" },
  { id: "s6", nome: "Barba Clássica", duracao: 45, valor: 80, categoria: "Barba", cor: "#0EA5E9" },
  { id: "s7", nome: "Corte Masculino", duracao: 40, valor: 65, categoria: "Cabelo", cor: "#6366F1" },
  { id: "s8", nome: "Progressiva", duracao: 180, valor: 350, categoria: "Cabelo", cor: "#EF4444" },
];

/* ─── Helpers ─── */
export function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function formatCurrency(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

export function formatDateShort(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function dateStr(offset: number = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

export function getStatusConfig(status: AgendamentoStatus) {
  switch (status) {
    case "pendente":
      return { label: "Pendente", bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", dot: "#F59E0B", icon: "⏳" };
    case "confirmado":
      return { label: "Confirmado", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6", icon: "✅" };
    case "em_andamento":
      return { label: "Em Andamento", bg: "#F0FDF4", text: "#15803D", border: "#86EFAC", dot: "#22C55E", icon: "🔄" };
    case "concluido":
      return { label: "Concluído", bg: "#F0FDF4", text: "#166534", border: "#86EFAC", dot: "#16A34A", icon: "✔️" };
    case "cancelado":
      return { label: "Cancelado", bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", dot: "#EF4444", icon: "✖️" };
    case "nao_compareceu":
      return { label: "Não Compareceu", bg: "#efefef", text: "#627271", border: "#efefef", dot: "#627271", icon: "👻" };
  }
}

export function getOrigemConfig(origem: OrigemAgendamento) {
  switch (origem) {
    case "whatsapp": return { label: "WhatsApp", bg: "#F0FDF4", text: "#15803D", icon: "💬" };
    case "telefone": return { label: "Telefone", bg: "#EFF6FF", text: "#1D4ED8", icon: "📞" };
    case "online": return { label: "Online", bg: "#F5F3FF", text: "#7C3AED", icon: "🌐" };
    case "presencial": return { label: "Presencial", bg: "#FFFBEB", text: "#B45309", icon: "🏪" };
  }
}

/* ─── Mock Agendamentos (week of current date) ─── */
export const AGENDAMENTOS: Agendamento[] = [
  // TODAY
  {
    id: "ag1",
    clienteId: "c1",
    clienteNome: "Fernanda Costa",
    clienteTelefone: "(11) 98765-4321",
    clienteEmail: "fernanda@email.com",
    servicoId: "s1",
    servicoNome: "Corte Feminino",
    servicoCategoria: "Cabelo",
    profissional: "Maria Silva",
    profissionalId: "prof1",
    data: dateStr(0),
    horaInicio: "09:00",
    horaFim: "10:00",
    duracao: 60,
    valor: 120,
    status: "concluido",
    primeiraVez: false,
    confirmacaoEnviada: true,
    lembreteEnviado: true,
    origem: "whatsapp",
    observacoes: "Prefere corte em camadas",
    timeline: [
      { id: "t1", tipo: "criacao", descricao: "Agendamento criado via WhatsApp", data: dateStr(-1), hora: "15:30", usuario: "Maria Silva" },
      { id: "t2", tipo: "confirmacao", descricao: "Confirmação enviada por WhatsApp", data: dateStr(-1), hora: "15:31", usuario: "Sistema" },
      { id: "t3", tipo: "lembrete", descricao: "Lembrete enviado 24h antes", data: dateStr(0), hora: "09:00", usuario: "Sistema" },
      { id: "t4", tipo: "checkin", descricao: "Cliente chegou", data: dateStr(0), hora: "08:55", usuario: "Maria Silva" },
      { id: "t5", tipo: "checkout", descricao: "Atendimento concluído", data: dateStr(0), hora: "10:05", usuario: "Maria Silva" },
    ],
  },
  {
    id: "ag2",
    clienteId: "c2",
    clienteNome: "Roberto Mendes",
    clienteTelefone: "(11) 97654-3210",
    servicoId: "s6",
    servicoNome: "Barba Clássica",
    servicoCategoria: "Barba",
    profissional: "Carlos Lima",
    profissionalId: "prof3",
    data: dateStr(0),
    horaInicio: "10:00",
    horaFim: "10:45",
    duracao: 45,
    valor: 80,
    status: "confirmado",
    primeiraVez: false,
    confirmacaoEnviada: true,
    lembreteEnviado: true,
    origem: "telefone",
    timeline: [
      { id: "t6", tipo: "criacao", descricao: "Agendamento criado por telefone", data: dateStr(-2), hora: "14:00", usuario: "Carlos Lima" },
      { id: "t7", tipo: "confirmacao", descricao: "Confirmação enviada", data: dateStr(-2), hora: "14:01", usuario: "Sistema" },
    ],
  },
  {
    id: "ag3",
    clienteId: "c3",
    clienteNome: "Juliana Almeida",
    clienteTelefone: "(11) 96543-2109",
    servicoId: "s2",
    servicoNome: "Coloração",
    servicoCategoria: "Cabelo",
    profissional: "Maria Silva",
    profissionalId: "prof1",
    data: dateStr(0),
    horaInicio: "11:00",
    horaFim: "13:00",
    duracao: 120,
    valor: 280,
    status: "em_andamento",
    primeiraVez: true,
    confirmacaoEnviada: true,
    lembreteEnviado: false,
    origem: "online",
    observacoes: "Primeira vez no salão. Quer loiro mel.",
    timeline: [
      { id: "t8", tipo: "criacao", descricao: "Agendamento online via site", data: dateStr(-3), hora: "10:20", usuario: "Sistema" },
      { id: "t9", tipo: "confirmacao", descricao: "Confirmação automática enviada", data: dateStr(-3), hora: "10:20", usuario: "Sistema" },
      { id: "t10", tipo: "checkin", descricao: "Cliente chegou", data: dateStr(0), hora: "10:58", usuario: "Maria Silva" },
    ],
  },
  {
    id: "ag4",
    clienteId: "c4",
    clienteNome: "Patrícia Souza",
    clienteTelefone: "(11) 95432-1098",
    servicoId: "s3",
    servicoNome: "Manicure",
    servicoCategoria: "Unhas",
    profissional: "Ana Beatriz",
    profissionalId: "prof2",
    data: dateStr(0),
    horaInicio: "14:00",
    horaFim: "14:45",
    duracao: 45,
    valor: 60,
    status: "pendente",
    primeiraVez: false,
    confirmacaoEnviada: false,
    lembreteEnviado: false,
    origem: "whatsapp",
    timeline: [
      { id: "t11", tipo: "criacao", descricao: "Agendamento criado via WhatsApp", data: dateStr(0), hora: "08:00", usuario: "Ana Beatriz" },
    ],
  },
  {
    id: "ag5",
    clienteId: "c5",
    clienteNome: "Mariana Lima",
    clienteTelefone: "(11) 94321-0987",
    servicoId: "s5",
    servicoNome: "Limpeza de Pele",
    servicoCategoria: "Estética",
    profissional: "Ana Beatriz",
    profissionalId: "prof2",
    data: dateStr(0),
    horaInicio: "15:00",
    horaFim: "16:30",
    duracao: 90,
    valor: 180,
    status: "confirmado",
    primeiraVez: false,
    confirmacaoEnviada: true,
    lembreteEnviado: true,
    origem: "presencial",
    observacoes: "Pele sensível, usar produtos hipoalergênicos",
    timeline: [
      { id: "t12", tipo: "criacao", descricao: "Agendamento criado presencialmente", data: dateStr(-5), hora: "16:30", usuario: "Ana Beatriz" },
      { id: "t13", tipo: "confirmacao", descricao: "Confirmação enviada", data: dateStr(-5), hora: "16:31", usuario: "Sistema" },
      { id: "t14", tipo: "lembrete", descricao: "Lembrete 24h enviado", data: dateStr(0), hora: "08:00", usuario: "Sistema" },
    ],
  },
  // TOMORROW
  {
    id: "ag6",
    clienteId: "c6",
    clienteNome: "Gustavo Ferreira",
    clienteTelefone: "(11) 93210-9876",
    servicoId: "s7",
    servicoNome: "Corte Masculino",
    servicoCategoria: "Cabelo",
    profissional: "Carlos Lima",
    profissionalId: "prof3",
    data: dateStr(1),
    horaInicio: "09:30",
    horaFim: "10:10",
    duracao: 40,
    valor: 65,
    status: "confirmado",
    primeiraVez: false,
    confirmacaoEnviada: true,
    lembreteEnviado: false,
    origem: "whatsapp",
    timeline: [
      { id: "t15", tipo: "criacao", descricao: "Agendamento criado via WhatsApp", data: dateStr(0), hora: "09:00", usuario: "Carlos Lima" },
    ],
  },
  {
    id: "ag7",
    clienteId: "c7",
    clienteNome: "Camila Rodrigues",
    clienteTelefone: "(11) 92109-8765",
    servicoId: "s8",
    servicoNome: "Progressiva",
    servicoCategoria: "Cabelo",
    profissional: "Maria Silva",
    profissionalId: "prof1",
    data: dateStr(1),
    horaInicio: "10:00",
    horaFim: "13:00",
    duracao: 180,
    valor: 350,
    status: "confirmado",
    primeiraVez: false,
    confirmacaoEnviada: true,
    lembreteEnviado: false,
    origem: "telefone",
    timeline: [
      { id: "t16", tipo: "criacao", descricao: "Agendamento criado por telefone", data: dateStr(-1), hora: "11:00", usuario: "Maria Silva" },
    ],
  },
  {
    id: "ag8",
    clienteId: "c8",
    clienteNome: "Letícia Pereira",
    clienteTelefone: "(11) 91098-7654",
    servicoId: "s4",
    servicoNome: "Pedicure",
    servicoCategoria: "Unhas",
    profissional: "Ana Beatriz",
    profissionalId: "prof2",
    data: dateStr(1),
    horaInicio: "14:00",
    horaFim: "15:00",
    duracao: 60,
    valor: 70,
    status: "pendente",
    primeiraVez: true,
    confirmacaoEnviada: false,
    lembreteEnviado: false,
    origem: "online",
    timeline: [
      { id: "t17", tipo: "criacao", descricao: "Agendamento online", data: dateStr(0), hora: "20:15", usuario: "Sistema" },
    ],
  },
  // DAY AFTER
  {
    id: "ag9",
    clienteId: "c1",
    clienteNome: "Fernanda Costa",
    clienteTelefone: "(11) 98765-4321",
    servicoId: "s3",
    servicoNome: "Manicure",
    servicoCategoria: "Unhas",
    profissional: "Ana Beatriz",
    profissionalId: "prof2",
    data: dateStr(2),
    horaInicio: "10:00",
    horaFim: "10:45",
    duracao: 45,
    valor: 60,
    status: "confirmado",
    primeiraVez: false,
    confirmacaoEnviada: true,
    lembreteEnviado: false,
    origem: "whatsapp",
    timeline: [
      { id: "t18", tipo: "criacao", descricao: "Agendamento criado", data: dateStr(0), hora: "10:05", usuario: "Sistema" },
    ],
  },
  // YESTERDAY - CANCELADO
  {
    id: "ag10",
    clienteId: "c9",
    clienteNome: "Diego Santos",
    clienteTelefone: "(11) 99876-5432",
    servicoId: "s6",
    servicoNome: "Barba Clássica",
    servicoCategoria: "Barba",
    profissional: "Carlos Lima",
    profissionalId: "prof3",
    data: dateStr(-1),
    horaInicio: "16:00",
    horaFim: "16:45",
    duracao: 45,
    valor: 80,
    status: "cancelado",
    motivoCancelamento: "Cliente ligou cancelando por compromisso de trabalho",
    primeiraVez: false,
    confirmacaoEnviada: true,
    lembreteEnviado: true,
    origem: "telefone",
    timeline: [
      { id: "t19", tipo: "criacao", descricao: "Agendamento criado", data: dateStr(-3), hora: "14:00", usuario: "Carlos Lima" },
      { id: "t20", tipo: "cancelamento", descricao: "Cancelado pelo cliente - compromisso de trabalho", data: dateStr(-1), hora: "09:30", usuario: "Carlos Lima" },
    ],
  },
  // DAY -2
  {
    id: "ag11",
    clienteId: "c4",
    clienteNome: "Patrícia Souza",
    clienteTelefone: "(11) 95432-1098",
    servicoId: "s1",
    servicoNome: "Corte Feminino",
    servicoCategoria: "Cabelo",
    profissional: "Maria Silva",
    profissionalId: "prof1",
    data: dateStr(-2),
    horaInicio: "11:00",
    horaFim: "12:00",
    duracao: 60,
    valor: 120,
    status: "concluido",
    primeiraVez: false,
    confirmacaoEnviada: true,
    lembreteEnviado: true,
    origem: "whatsapp",
    timeline: [
      { id: "t21", tipo: "criacao", descricao: "Agendamento criado", data: dateStr(-4), hora: "10:00", usuario: "Maria Silva" },
      { id: "t22", tipo: "checkin", descricao: "Cliente chegou", data: dateStr(-2), hora: "10:58", usuario: "Maria Silva" },
      { id: "t23", tipo: "checkout", descricao: "Atendimento concluído", data: dateStr(-2), hora: "12:10", usuario: "Maria Silva" },
    ],
  },
  // DAY +3
  {
    id: "ag12",
    clienteId: "c5",
    clienteNome: "Mariana Lima",
    clienteTelefone: "(11) 94321-0987",
    servicoId: "s5",
    servicoNome: "Limpeza de Pele",
    servicoCategoria: "Estética",
    profissional: "Ana Beatriz",
    profissionalId: "prof2",
    data: dateStr(3),
    horaInicio: "09:00",
    horaFim: "10:30",
    duracao: 90,
    valor: 180,
    status: "confirmado",
    primeiraVez: false,
    confirmacaoEnviada: true,
    lembreteEnviado: false,
    origem: "presencial",
    timeline: [
      { id: "t24", tipo: "criacao", descricao: "Agendamento criado presencialmente", data: dateStr(0), hora: "16:30", usuario: "Ana Beatriz" },
    ],
  },
];

export const SERVICO_CORES: Record<string, string> = {
  "Cabelo": "#8B5CF6",
  "Unhas": "#F59E0B",
  "Estética": "#10B981",
  "Barba": "#0EA5E9",
};

export const CLIENTES_RECENTES = [
  { id: "c1", nome: "Fernanda Costa", telefone: "(11) 98765-4321", visitas: 12 },
  { id: "c4", nome: "Patrícia Souza", telefone: "(11) 95432-1098", visitas: 8 },
  { id: "c5", nome: "Mariana Lima", telefone: "(11) 94321-0987", visitas: 15 },
  { id: "c2", nome: "Roberto Mendes", telefone: "(11) 97654-3210", visitas: 5 },
];

export const HORARIOS_COMERCIAIS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00",
];

// Get appointments for a specific date
export function getAgendamentosDia(data: string): Agendamento[] {
  return AGENDAMENTOS.filter((a) => a.data === data).sort((a, b) =>
    a.horaInicio.localeCompare(b.horaInicio)
  );
}

// Get week dates
export function getWeekDates(referenceDate: string): string[] {
  const [y, m, d] = referenceDate.split("-").map(Number);
  const ref = new Date(y, m - 1, d);
  const day = ref.getDay(); // 0=Sun
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    return dt.toISOString().split("T")[0];
  });
}

export const DIAS_SEMANA_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const DIAS_SEMANA_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
export const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
