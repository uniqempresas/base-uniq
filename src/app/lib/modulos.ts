export type ModuloStatus = 'core' | 'ativo' | 'trial' | 'cancelado' | 'nao_adquirido';
export type ModuloCategoria = 'core' | 'operacional' | 'premium';

export interface Modulo {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: ModuloCategoria;
  preco: number;
  icone: string;
  status: ModuloStatus;
  dataRenovacao?: string;
  dataTrialFim?: string;
  funcionalidades: string[];
}

export const MODULOS_STORAGE_KEY = 'uniq-modulos-ativos';

export const MODULOS_ATIVOS_INICIAIS: Modulo[] = [
  { id: '1', codigo: 'dashboard', nome: 'Dashboard', descricao: 'Visão geral do seu negócio em tempo real.', categoria: 'core', preco: 0, icone: 'LayoutDashboard', status: 'core', funcionalidades: ['KPIs em tempo real', 'Gráficos de desempenho', 'Alertas personalizados'] },
  { id: '2', codigo: 'minha_empresa', nome: 'Minha Empresa', descricao: 'Gerencie dados e identidade da sua empresa.', categoria: 'core', preco: 0, icone: 'Building2', status: 'core', funcionalidades: ['Dados cadastrais', 'Logo e branding', 'Redes sociais'] },
  { id: '3', codigo: 'configuracoes', nome: 'Configurações', descricao: 'Preferências e ajustes da plataforma.', categoria: 'core', preco: 0, icone: 'Settings', status: 'core', funcionalidades: ['Configurações gerais', 'Integrações', 'Notificações'] },
  { id: 'meus-modulos', codigo: 'meus-modulos', nome: 'Meus Módulos', descricao: 'Gerencie seus módulos e assinaturas.', categoria: 'core', preco: 0, icone: 'LayoutGrid', status: 'core', funcionalidades: ['Gestão de módulos', 'Assinaturas', 'Upgrade de plano'] },
  { id: '4', codigo: 'crm', nome: 'CRM', descricao: 'Gestão de clientes e pipeline de vendas.', categoria: 'operacional', preco: 49, icone: 'Users', status: 'ativo', dataRenovacao: '15/05/2026', funcionalidades: ['Cadastro de clientes', 'Histórico de interações', 'Pipeline de vendas'] },
  { id: '5', codigo: 'estoque', nome: 'Estoque', descricao: 'Controle de produtos e inventário.', categoria: 'operacional', preco: 49, icone: 'Package', status: 'trial', dataTrialFim: '28/04/2026', funcionalidades: ['Controle de entrada/saída', 'Alertas de reposição', 'Relatórios de giro'] },
  { id: '6', codigo: 'vendas', nome: 'Vendas', descricao: 'Acompanhe pedidos e fature mais.', categoria: 'operacional', preco: 49, icone: 'ShoppingCart', status: 'ativo', dataRenovacao: '15/05/2026', funcionalidades: ['Painel de vendas', 'Cupons de desconto', 'Relatórios de conversão'] },
  { id: '7', codigo: 'loja_virtual', nome: 'Loja Virtual', descricao: 'Venda online com catálogo próprio.', categoria: 'operacional', preco: 79, icone: 'Store', status: 'nao_adquirido', funcionalidades: ['Catálogo de produtos', 'Carrinho de compras', 'Checkout integrado'] },
  { id: '8', codigo: 'agenda', nome: 'Agenda', descricao: 'Agendamentos e controle de horários.', categoria: 'operacional', preco: 49, icone: 'CalendarDays', status: 'core', funcionalidades: ['Calendário interativo', 'Lembretes automáticos', 'Bloqueio de horários'] },
  { id: '9', codigo: 'financeiro', nome: 'Financeiro', descricao: 'Controle financeiro e fluxo de caixa.', categoria: 'operacional', preco: 49, icone: 'Wallet', status: 'ativo', dataRenovacao: '15/05/2026', funcionalidades: ['Fluxo de caixa', 'Contas a pagar/receber', 'Conciliação bancária'] },
  { id: '10', codigo: 'metricas', nome: 'Métricas', descricao: 'Relatórios avançados de performance.', categoria: 'operacional', preco: 49, icone: 'BarChart3', status: 'nao_adquirido', funcionalidades: ['Relatórios customizados', 'Exportação de dados', 'Metas e OKRs'] },
  { id: '11', codigo: 'mel', nome: 'MEL IA', descricao: 'Assistente virtual powered by IA.', categoria: 'premium', preco: 99, icone: 'Sparkles', status: 'core', funcionalidades: ['Respostas automáticas', 'Análise de sentimento', 'Sugestões inteligentes'] },
  { id: '12', codigo: 'chatbot', nome: 'Chatbot', descricao: 'Atendimento automatizado 24/7.', categoria: 'premium', preco: 79, icone: 'MessageSquare', status: 'nao_adquirido', funcionalidades: ['Fluxos de conversa', 'Integração WhatsApp', 'Relatórios de atendimento'] },
  { id: '13', codigo: 'marketplace', nome: 'Marketplace', descricao: 'Venda em múltiplos canais.', categoria: 'premium', preco: 79, icone: 'ShoppingBag', status: 'nao_adquirido', funcionalidades: ['Vitrine de produtos', 'Gestão de pedidos', 'Avaliações de clientes'] },
  { id: '14', codigo: 'fornecedores', nome: 'Fornecedores', descricao: 'Gestão de fornecedores e compras.', categoria: 'operacional', preco: 49, icone: 'Truck', status: 'nao_adquirido', funcionalidades: ['Cadastro de fornecedores', 'Ordens de compra', 'Comparativo de preços'] },
  { id: '15', codigo: 'servicos', nome: 'Catálogo de Serviços', descricao: 'Cadastre e gerencie seus serviços.', categoria: 'operacional', preco: 49, icone: 'Scissors', status: 'nao_adquirido', funcionalidades: ['Cadastro de serviços', 'Comissionamento', 'Agenda integrada'] },
  { id: '16', codigo: 'colaboradores', nome: 'Colaboradores', descricao: 'Gestão de equipe e permissões.', categoria: 'operacional', preco: 49, icone: 'UserCog', status: 'nao_adquirido', funcionalidades: ['Cadastro de colaboradores', 'Controle de permissões', 'Escala de trabalho'] },
];
