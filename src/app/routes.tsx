import { createBrowserRouter, Navigate } from "react-router";
import type { ComponentType } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Caminho crítico do cliente final: loja pública + login.
// Estes ficam carregados direto — quem entra em /loja/:slug não pode esperar.
// ─────────────────────────────────────────────────────────────────────────────
import { AuthLayout } from "./components/auth/AuthLayout";
import { LoginPage } from "./components/auth/LoginPage";
import { CadastroPage } from "./components/auth/CadastroPage";
import { EsqueciSenhaPage } from "./components/auth/EsqueciSenhaPage";
import { RecuperarSenhaPage } from "./components/auth/RecuperarSenhaPage";
import { LojaPage } from "./components/loja/LojaPage";
import { ProdutoLojaPage } from "./components/loja/ProdutoLojaPage";
import { CheckoutPage } from "./components/loja/CheckoutPage";
import { MeusPedidosPage } from "./components/loja/MeusPedidosPage";
import { EntrarClientePage } from "./components/loja/EntrarClientePage";
import { ContaClientePage } from "./components/loja/ContaClientePage";

/**
 * Code splitting por rota.
 *
 * A loja pública é visitada por cliente final, no celular, sem login — ela NÃO
 * pode carregar o ERP. Antes, tudo vivia num único chunk de ~2,4 MB (incluindo
 * recharts, PDV, financeiro, marketplace) e o cliente baixava o sistema inteiro
 * para ver um doce. Com `lazy`, o chunk de cada tela só desce quando a rota é
 * visitada.
 */
function pagina<T extends Record<string, unknown>>(
  carregar: () => Promise<T>,
  nome: keyof T & string
) {
  return async (): Promise<{ Component: ComponentType }> => {
    const mod = await carregar();
    return { Component: mod[nome] as ComponentType };
  };
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: "/auth",
    Component: AuthLayout,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: "login", Component: LoginPage },
      { path: "cadastro", Component: CadastroPage },
      { path: "esqueci-senha", Component: EsqueciSenhaPage },
      { path: "recuperar-senha/:token", Component: RecuperarSenhaPage },
    ],
  },
  // Loja Virtual - public routes (no AppLayout)
  // ⚠️ Rotas estáticas ANTES das dinâmicas (/loja/:slug) — senão "checkout" vira slug
  { path: "/loja", Component: LojaPage },
  { path: "/loja/produto/:id", Component: ProdutoLojaPage },
  { path: "/loja/checkout", Component: CheckoutPage },
  { path: "/loja/pedidos", Component: MeusPedidosPage },
  // Loja Virtual multi-tenant (SPEC §3)
  { path: "/loja/:slug", Component: LojaPage },
  { path: "/loja/:slug/produto/:id", Component: ProdutoLojaPage },
  { path: "/loja/:slug/checkout", Component: CheckoutPage },
  { path: "/loja/:slug/pedidos", Component: MeusPedidosPage },
  // Área do cliente (SPEC-LojaVirtual-AreaCliente §3) — tenant-only
  { path: "/loja/:slug/entrar", Component: EntrarClientePage },
  { path: "/loja/:slug/conta", Component: ContaClientePage },
  // Catálogo público (no AppLayout)
  { path: "/catalogo", lazy: pagina(() => import("./components/servicos/CatalogoPage"), "CatalogoPage") },
  // Apresentação comercial — deck público (no AppLayout)
  { path: "/apresentacao", lazy: pagina(() => import("./components/apresentacao/ApresentacaoPage"), "ApresentacaoPage") },
  // App routes - pathless layout (ERP: tudo sob demanda)
  {
    lazy: pagina(() => import("./components/layout/AppLayout"), "AppLayout"),
    children: [
      { path: "/dashboard", lazy: pagina(() => import("./components/dashboard/DashboardPage"), "DashboardPage") },
      { path: "/meus-modulos", lazy: pagina(() => import("./components/modulos/MeusModulosPage"), "MeusModulosPage") },
      { path: "/onboarding/plano", lazy: pagina(() => import("./components/modulos/EscolhaPlanoPage"), "EscolhaPlanoPage") },
      // Serviços
      { path: "/servicos", lazy: pagina(() => import("./components/servicos/ServicosPage"), "ServicosPage") },
      { path: "/servicos/novo", lazy: pagina(() => import("./components/servicos/ServicoNovoPage"), "ServicoNovoPage") },
      { path: "/servicos/:id/editar", lazy: pagina(() => import("./components/servicos/ServicoEditarPage"), "ServicoEditarPage") },
      // CRM
      { path: "/crm", element: <Navigate to="/crm/dashboard" replace /> },
      { path: "/crm/dashboard", lazy: pagina(() => import("./components/crm/CRMDashboardPage"), "CRMDashboardPage") },
      { path: "/crm/clientes", lazy: pagina(() => import("./components/crm/ClientesPage"), "ClientesPage") },
      { path: "/crm/clientes/:id", lazy: pagina(() => import("./components/crm/ClienteDetalhePage"), "ClienteDetalhePage") },
      { path: "/crm/configuracoes", lazy: pagina(() => import("./components/crm/ConfiguracoesCRMPage"), "ConfiguracoesCRMPage") },
      { path: "/crm/pipeline", lazy: pagina(() => import("./components/crm/PipelinePage"), "PipelinePage") },
      // Estoque
      { path: "/estoque", element: <Navigate to="/estoque/dashboard" replace /> },
      { path: "/estoque/dashboard", lazy: pagina(() => import("./components/estoque/EstoqueDashboardPage"), "EstoqueDashboardPage") },
      { path: "/estoque/produtos", lazy: pagina(() => import("./components/estoque/ProdutosPage"), "ProdutosPage") },
      { path: "/estoque/produtos/:id", lazy: pagina(() => import("./components/estoque/ProdutoDetalhePage"), "ProdutoDetalhePage") },
      { path: "/estoque/movimentacoes", lazy: pagina(() => import("./components/estoque/MovimentacoesPage"), "MovimentacoesPage") },
      { path: "/estoque/configuracoes", lazy: pagina(() => import("./components/estoque/ConfiguracoesProdutosPage"), "ConfiguracoesProdutosPage") },
      // Loja Virtual — módulo: catálogo + aparência da loja (SPEC-LojaVirtual-CompletarModulo §5)
      { path: "/loja-virtual", lazy: pagina(() => import("./components/loja-virtual/LojaVirtualHubPage"), "LojaVirtualHubPage") },
      { path: "/loja-virtual/aparencia", lazy: pagina(() => import("./components/loja-virtual/AparenciaPage"), "AparenciaPage") },
      { path: "/loja-virtual/produtos", lazy: pagina(() => import("./components/loja-virtual/ProdutosLojaPage"), "ProdutosLojaPage") },
      // Categorias: o CRUD já existe no Estoque (PRD-CategoriasProduto) — não duplicar tela
      { path: "/loja-virtual/categorias", element: <Navigate to="/estoque/configuracoes" replace /> },
      // Fornecedores
      { path: "/fornecedores", lazy: pagina(() => import("./components/fornecedores/FornecedoresPage"), "FornecedoresPage") },
      { path: "/fornecedores/novo", lazy: pagina(() => import("./components/fornecedores/FornecedorNovoPage"), "FornecedorNovoPage") },
      { path: "/fornecedores/:id", lazy: pagina(() => import("./components/fornecedores/FornecedorDetalhePage"), "FornecedorDetalhePage") },
      { path: "/fornecedores/:id/editar", lazy: pagina(() => import("./components/fornecedores/FornecedorEditarPage"), "FornecedorEditarPage") },
      // Agenda
      { path: "/agenda", lazy: pagina(() => import("./components/agenda/AgendaPage"), "AgendaPage") },
      { path: "/agenda/novo", lazy: pagina(() => import("./components/agenda/NovoAgendamentoPage"), "NovoAgendamentoPage") },
      { path: "/agenda/compromissos", lazy: pagina(() => import("./components/agenda/CompromissosPage"), "CompromissosPage") },
      { path: "/agenda/:id", lazy: pagina(() => import("./components/agenda/AgendamentoDetalhePage"), "AgendamentoDetalhePage") },
      // PDV
      { path: "/vendas", element: <Navigate to="/vendas/pdv" replace /> },
      { path: "/vendas/pdv", lazy: pagina(() => import("./components/pdv/PDVPage"), "PDVPage") },
      { path: "/vendas/pdv/abertura", lazy: pagina(() => import("./components/pdv/AberturaCaixaPage"), "AberturaCaixaPage") },
      { path: "/vendas/pdv/fechamento", lazy: pagina(() => import("./components/pdv/FechamentoCaixaPage"), "FechamentoCaixaPage") },
      // Pedidos
      { path: "/vendas/pedidos", lazy: pagina(() => import("./components/pedidos/PedidosListaPage"), "PedidosListaPage") },
      { path: "/vendas/pedidos/:id", lazy: pagina(() => import("./components/pedidos/PedidoDetalhePage"), "PedidoDetalhePage") },
      { path: "/vendas/relatorios", lazy: pagina(() => import("./components/pedidos/RelatoriosVendasPage"), "RelatoriosVendasPage") },
      { path: "/vendas/cupons", lazy: pagina(() => import("./components/pedidos/CuponsPage"), "CuponsPage") },
      // Financeiro
      { path: "/financeiro", element: <Navigate to="/financeiro/dashboard" replace /> },
      { path: "/financeiro/dashboard", lazy: pagina(() => import("./components/financeiro/FinanceiroDashboardPage"), "FinanceiroDashboardPage") },
      { path: "/financeiro/fluxo-de-caixa", lazy: pagina(() => import("./components/financeiro/FluxoCaixaPage"), "FluxoCaixaPage") },
      { path: "/financeiro/contas-pagar", lazy: pagina(() => import("./components/financeiro/ContasPagarPage"), "ContasPagarPage") },
      { path: "/financeiro/contas-receber", lazy: pagina(() => import("./components/financeiro/ContasReceberPage"), "ContasReceberPage") },
      { path: "/financeiro/dre", lazy: pagina(() => import("./components/financeiro/DREPage"), "DREPage") },
      { path: "/financeiro/configuracoes", lazy: pagina(() => import("./components/financeiro/ConfiguracoesFinanceirasPage"), "ConfiguracoesFinanceirasPage") },
      // MEL
      { path: "/mel", lazy: pagina(() => import("./components/mel/MelDashboardPage"), "MelDashboardPage") },
      { path: "/mel/conversa/:conversationId", lazy: pagina(() => import("./components/mel/MelDashboardPage"), "MelDashboardPage") },
      { path: "/mel/conversa", element: <Navigate to="/mel" replace /> },
      { path: "/mel/configuracoes", lazy: pagina(() => import("./components/mel/MelConfiguracoesPage"), "MelConfiguracoesPage") },
      // Configurações
      { path: "/configuracoes", element: <Navigate to="/configuracoes/empresa" replace /> },
      { path: "/configuracoes/empresa", lazy: pagina(() => import("./components/configuracoes/EmpresaPage"), "EmpresaPage") },
      { path: "/configuracoes/conta", lazy: pagina(() => import("./components/configuracoes/ContaPage"), "ContaPage") },
      { path: "/configuracoes/colaboradores", lazy: pagina(() => import("./components/employees/ColaboradoresPage"), "ColaboradoresPage") },
      { path: "/configuracoes/colaboradores/novo", lazy: pagina(() => import("./components/employees/NovoColaboradorPage"), "NovoColaboradorPage") },
      { path: "/configuracoes/colaboradores/:id/permissoes", lazy: pagina(() => import("./components/employees/ColaboradorPermissoesPage"), "ColaboradorPermissoesPage") },
      { path: "/configuracoes/colaboradores/:id", lazy: pagina(() => import("./components/employees/ColaboradorDetalhePage"), "ColaboradorDetalhePage") },
      // Métricas
      { path: "/metricas", element: <Navigate to="/metricas/dashboard" replace /> },
      { path: "/metricas/dashboard", lazy: pagina(() => import("./components/metricas/MetricasDashboardPage"), "MetricasDashboardPage") },
      { path: "/metricas/vendas", lazy: pagina(() => import("./components/metricas/VendasPage"), "VendasPage") },
      { path: "/metricas/financeiro", lazy: pagina(() => import("./components/metricas/FinanceiroPage"), "FinanceiroPage") },
      { path: "/metricas/clientes", lazy: pagina(() => import("./components/metricas/ClientesPage"), "ClientesPage") },
      { path: "/metricas/agendamentos", lazy: pagina(() => import("./components/metricas/AgendamentosPage"), "AgendamentosPage") },
      { path: "/metricas/produtos", lazy: pagina(() => import("./components/metricas/ProdutosPage"), "ProdutosPage") },
      // Chatbot
      { path: "/chatbot", lazy: pagina(() => import("./components/chatbot/ChatbotPage"), "ChatbotPage") },
      { path: "/chatbot/configuracoes", lazy: pagina(() => import("./components/chatbot/ChatbotConfigPage"), "ChatbotConfigPage") },
      { path: "/chatbot/respostas", lazy: pagina(() => import("./components/chatbot/RespostasAutoPage"), "RespostasAutoPage") },
      { path: "/chatbot/faq", lazy: pagina(() => import("./components/chatbot/FAQPage"), "FAQPage") },
      { path: "/chatbot/estatisticas", lazy: pagina(() => import("./components/chatbot/ChatbotStatsPage"), "ChatbotStatsPage") },
      // Marketplace
      { path: "/marketplace", lazy: pagina(() => import("./components/marketplace/MarketplacePage"), "MarketplacePage") },
      { path: "/marketplace/lojista/:id", lazy: pagina(() => import("./components/marketplace/LojistaPage"), "LojistaPage") },
      { path: "/marketplace/carrinho", lazy: pagina(() => import("./components/marketplace/CarrinhoPage"), "CarrinhoPage") },
      { path: "/marketplace/checkout", lazy: pagina(() => import("./components/marketplace/CheckoutPage"), "CheckoutPage") },
      { path: "/marketplace/vendedor", lazy: pagina(() => import("./components/marketplace/VendedorDashboardPage"), "VendedorDashboardPage") },
      { path: "/marketplace/vendedor/pedidos", lazy: pagina(() => import("./components/marketplace/VendedorPedidosPage"), "VendedorPedidosPage") },
    ],
  },
]);
