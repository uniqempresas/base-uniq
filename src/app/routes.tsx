import { createBrowserRouter, Navigate } from "react-router";
import { AuthLayout } from "./components/auth/AuthLayout";
import { LoginPage } from "./components/auth/LoginPage";
import { CadastroPage } from "./components/auth/CadastroPage";
import { EsqueciSenhaPage } from "./components/auth/EsqueciSenhaPage";
import { RecuperarSenhaPage } from "./components/auth/RecuperarSenhaPage";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./components/dashboard/DashboardPage";
// CRM
import { CRMDashboardPage } from "./components/crm/CRMDashboardPage";
import { ClientesPage } from "./components/crm/ClientesPage";
import { ClienteDetalhePage } from "./components/crm/ClienteDetalhePage";
import { PipelinePage } from "./components/crm/PipelinePage";
// Estoque
import { EstoqueDashboardPage } from "./components/estoque/EstoqueDashboardPage";
import { ProdutosPage } from "./components/estoque/ProdutosPage";
import { ProdutoDetalhePage } from "./components/estoque/ProdutoDetalhePage";
import { MovimentacoesPage } from "./components/estoque/MovimentacoesPage";
// Agenda
import { AgendaPage } from "./components/agenda/AgendaPage";
import { NovoAgendamentoPage } from "./components/agenda/NovoAgendamentoPage";
import { CompromissosPage } from "./components/agenda/CompromissosPage";
import { AgendamentoDetalhePage } from "./components/agenda/AgendamentoDetalhePage";
// PDV
import { PDVPage } from "./components/pdv/PDVPage";
import { AberturaCaixaPage } from "./components/pdv/AberturaCaixaPage";
import { FechamentoCaixaPage } from "./components/pdv/FechamentoCaixaPage";
// Pedidos
import { PedidosListaPage } from "./components/pedidos/PedidosListaPage";
import { PedidoDetalhePage } from "./components/pedidos/PedidoDetalhePage";
import { RelatoriosVendasPage } from "./components/pedidos/RelatoriosVendasPage";
import { CuponsPage } from "./components/pedidos/CuponsPage";
// Loja Virtual (public storefront - no AppLayout)
import { LojaPage } from "./components/loja/LojaPage";
import { ProdutoLojaPage } from "./components/loja/ProdutoLojaPage";
import { CheckoutPage } from "./components/loja/CheckoutPage";
import { MeusPedidosPage } from "./components/loja/MeusPedidosPage";
// Financeiro
import { FinanceiroDashboardPage } from "./components/financeiro/FinanceiroDashboardPage";
import { FluxoCaixaPage } from "./components/financeiro/FluxoCaixaPage";
import { ContasPagarPage } from "./components/financeiro/ContasPagarPage";
import { ContasReceberPage } from "./components/financeiro/ContasReceberPage";
import { DREPage } from "./components/financeiro/DREPage";
// MEL
import { MelDashboardPage } from "./components/mel/MelDashboardPage";
import { MelConfiguracoesPage } from "./components/mel/MelConfiguracoesPage";
// Configurações
import { EmpresaPage } from "./components/configuracoes/EmpresaPage";
import { ContaPage } from "./components/configuracoes/ContaPage";
// Fornecedores
import { FornecedoresPage } from "./components/fornecedores/FornecedoresPage";
import { FornecedorNovoPage } from "./components/fornecedores/FornecedorNovoPage";
import { FornecedorDetalhePage } from "./components/fornecedores/FornecedorDetalhePage";
import { FornecedorEditarPage } from "./components/fornecedores/FornecedorEditarPage";
// Colaboradores
import { ColaboradoresPage } from "./components/employees/ColaboradoresPage";
import { NovoColaboradorPage } from "./components/employees/NovoColaboradorPage";
import { ColaboradorDetalhePage } from "./components/employees/ColaboradorDetalhePage";
import { ColaboradorPermissoesPage } from "./components/employees/ColaboradorPermissoesPage";
// Métricas
import { MetricasDashboardPage } from "./components/metricas/MetricasDashboardPage";
import { VendasPage as MetricasVendasPage } from "./components/metricas/VendasPage";
import { FinanceiroPage as MetricasFinanceiroPage } from "./components/metricas/FinanceiroPage";
import { ClientesPage as MetricasClientesPage } from "./components/metricas/ClientesPage";
import { AgendamentosPage } from "./components/metricas/AgendamentosPage";
import { ProdutosPage as MetricasProdutosPage } from "./components/metricas/ProdutosPage";
// Serviços
import { ServicosPage } from "./components/servicos/ServicosPage";
import { ServicoNovoPage } from "./components/servicos/ServicoNovoPage";
import { ServicoEditarPage } from "./components/servicos/ServicoEditarPage";
import { CatalogoPage } from "./components/servicos/CatalogoPage";
// Chatbot
import { ChatbotPage } from "./components/chatbot/ChatbotPage";
import { ChatbotConfigPage } from "./components/chatbot/ChatbotConfigPage";
import { RespostasAutoPage } from "./components/chatbot/RespostasAutoPage";
import { FAQPage } from "./components/chatbot/FAQPage";
import { ChatbotStatsPage } from "./components/chatbot/ChatbotStatsPage";

// Marketplace
import { MarketplacePage } from "./components/marketplace/MarketplacePage";
import { LojistaPage } from "./components/marketplace/LojistaPage";
import { CarrinhoPage } from "./components/marketplace/CarrinhoPage";
import { CheckoutPage as MarketplaceCheckoutPage } from "./components/marketplace/CheckoutPage";
import { VendedorDashboardPage } from "./components/marketplace/VendedorDashboardPage";
import { VendedorPedidosPage } from "./components/marketplace/VendedorPedidosPage";
// Meus Módulos
import { MeusModulosPage } from "./components/modulos/MeusModulosPage";
import { EscolhaPlanoPage } from "./components/modulos/EscolhaPlanoPage";

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
  { path: "/loja", Component: LojaPage },
  { path: "/loja/produto/:id", Component: ProdutoLojaPage },
  { path: "/loja/checkout", Component: CheckoutPage },
  { path: "/loja/pedidos", Component: MeusPedidosPage },
  // Catálogo público (no AppLayout)
  { path: "/catalogo", Component: CatalogoPage },
  // App routes - pathless layout
  {
    Component: AppLayout,
    children: [
      { path: "/dashboard", Component: DashboardPage },
      { path: "/meus-modulos", Component: MeusModulosPage },
      { path: "/onboarding/plano", Component: EscolhaPlanoPage },
      // Serviços
      { path: "/servicos", Component: ServicosPage },
      { path: "/servicos/novo", Component: ServicoNovoPage },
      { path: "/servicos/:id/editar", Component: ServicoEditarPage },
      // CRM
      { path: "/crm", element: <Navigate to="/crm/dashboard" replace /> },
      { path: "/crm/dashboard", Component: CRMDashboardPage },
      { path: "/crm/clientes", Component: ClientesPage },
      { path: "/crm/clientes/:id", Component: ClienteDetalhePage },
      { path: "/crm/pipeline", Component: PipelinePage },
      // Estoque
      { path: "/estoque", element: <Navigate to="/estoque/dashboard" replace /> },
      { path: "/estoque/dashboard", Component: EstoqueDashboardPage },
      { path: "/estoque/produtos", Component: ProdutosPage },
      { path: "/estoque/produtos/:id", Component: ProdutoDetalhePage },
      { path: "/estoque/movimentacoes", Component: MovimentacoesPage },
      // Fornecedores
      { path: "/fornecedores", Component: FornecedoresPage },
      { path: "/fornecedores/novo", Component: FornecedorNovoPage },
      { path: "/fornecedores/:id", Component: FornecedorDetalhePage },
      { path: "/fornecedores/:id/editar", Component: FornecedorEditarPage },
      // Agenda
      { path: "/agenda", Component: AgendaPage },
      { path: "/agenda/novo", Component: NovoAgendamentoPage },
      { path: "/agenda/compromissos", Component: CompromissosPage },
      { path: "/agenda/:id", Component: AgendamentoDetalhePage },
      // PDV
      { path: "/vendas", element: <Navigate to="/vendas/pdv" replace /> },
      { path: "/vendas/pdv", Component: PDVPage },
      { path: "/vendas/pdv/abertura", Component: AberturaCaixaPage },
      { path: "/vendas/pdv/fechamento", Component: FechamentoCaixaPage },
      // Pedidos
      { path: "/vendas/pedidos", Component: PedidosListaPage },
      { path: "/vendas/pedidos/:id", Component: PedidoDetalhePage },
      { path: "/vendas/relatorios", Component: RelatoriosVendasPage },
      { path: "/vendas/cupons", Component: CuponsPage },
      // Financeiro
      { path: "/financeiro", element: <Navigate to="/financeiro/dashboard" replace /> },
      { path: "/financeiro/dashboard", Component: FinanceiroDashboardPage },
      { path: "/financeiro/fluxo-de-caixa", Component: FluxoCaixaPage },
      { path: "/financeiro/contas-pagar", Component: ContasPagarPage },
      { path: "/financeiro/contas-receber", Component: ContasReceberPage },
      { path: "/financeiro/dre", Component: DREPage },
      // MEL
      { path: "/mel", Component: MelDashboardPage },
      { path: "/mel/conversa/:conversationId", Component: MelDashboardPage },
      { path: "/mel/conversa", element: <Navigate to="/mel" replace /> },
      { path: "/mel/configuracoes", Component: MelConfiguracoesPage },
      // Configurações
      { path: "/configuracoes", element: <Navigate to="/configuracoes/empresa" replace /> },
      { path: "/configuracoes/empresa", Component: EmpresaPage },
      { path: "/configuracoes/conta", Component: ContaPage },
      { path: "/configuracoes/colaboradores", Component: ColaboradoresPage },
      { path: "/configuracoes/colaboradores/novo", Component: NovoColaboradorPage },
      { path: "/configuracoes/colaboradores/:id/permissoes", Component: ColaboradorPermissoesPage },
      { path: "/configuracoes/colaboradores/:id", Component: ColaboradorDetalhePage },
      // Métricas
      { path: "/metricas", element: <Navigate to="/metricas/dashboard" replace /> },
      { path: "/metricas/dashboard", Component: MetricasDashboardPage },
      { path: "/metricas/vendas", Component: MetricasVendasPage },
      { path: "/metricas/financeiro", Component: MetricasFinanceiroPage },
      { path: "/metricas/clientes", Component: MetricasClientesPage },
      { path: "/metricas/agendamentos", Component: AgendamentosPage },
      { path: "/metricas/produtos", Component: MetricasProdutosPage },
      // Chatbot
      { path: "/chatbot", Component: ChatbotPage },
      { path: "/chatbot/configuracoes", Component: ChatbotConfigPage },
      { path: "/chatbot/respostas", Component: RespostasAutoPage },
      { path: "/chatbot/faq", Component: FAQPage },
      { path: "/chatbot/estatisticas", Component: ChatbotStatsPage },
      // Marketplace
      { path: "/marketplace", Component: MarketplacePage },
      { path: "/marketplace/lojista/:id", Component: LojistaPage },
      { path: "/marketplace/carrinho", Component: CarrinhoPage },
      { path: "/marketplace/checkout", Component: MarketplaceCheckoutPage },
      { path: "/marketplace/vendedor", Component: VendedorDashboardPage },
      { path: "/marketplace/vendedor/pedidos", Component: VendedorPedidosPage },
    ],
  },
]);
