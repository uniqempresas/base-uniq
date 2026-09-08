# 🗺️ Mapa do Sistema — Base UNIQ / UNIQ Empresas

> **Propósito:** mapear todos os módulos, telas e funcionalidades da Base UNIQ para servir como base de construção do UNIQ Empresas.  
> **Base técnica:** `src/app/lib/modulos.ts`, `src/app/routes.tsx` e árvore de componentes.  
> **Status:** levantamento inicial — sujeito a evolução conforme novos co-fundadores entram.

---

## 📐 Visão geral da arquitetura

A Base UNIQ é uma plataforma **modular**, onde cada cliente (parceiro/co-fundador) recebe apenas os módulos que resolvem suas dores. A ativação é feita pela UNIQ, não pelo cliente.

```
┌─────────────────────────────────────────┐
│           Base UNIQ (SaaS)              │
│  Multi-tenant · Módulos · MEL (IA)      │
├─────────────────────────────────────────┤
│  Core · Operacional · Premium           │
├─────────────────────────────────────────┤
│  React + Vite · Supabase · n8n          │
└─────────────────────────────────────────┘
```

---

## 🧩 Módulos do catálogo

### 1. Módulos Core (sempre ativos)

| # | Módulo | Código | Status | Propósito |
|---|--------|--------|--------|-----------|
| 1 | Dashboard | `dashboard` | core | Visão geral do negócio |
| 2 | Minha Empresa | `minha_empresa` | core | Dados cadastrais e identidade |
| 3 | Configurações | `configuracoes` | core | Preferências e ajustes |
| 4 | Meus Módulos | `meus-modulos` | core | Gestão de módulos e planos |
| 5 | MEL IA | `mel` | core | Assistente virtual com IA |

### 2. Módulos Operacionais

| # | Módulo | Código | Status atual | Propósito |
|---|--------|--------|--------------|-----------|
| 6 | CRM | `crm` | ativo | Gestão de clientes e pipeline |
| 7 | Estoque | `estoque` | trial | Controle de produtos e inventário |
| 8 | Vendas | `vendas` | ativo | Pedidos, PDV, cupons, relatórios |
| 9 | Loja Virtual | `loja_virtual` | nao_adquirido | Venda online pública |
| 10 | Agenda | `agenda` | core | Agendamentos e compromissos |
| 11 | Financeiro | `financeiro` | ativo | Fluxo de caixa, contas, DRE |
| 12 | Métricas | `metricas` | nao_adquirido | Relatórios avançados |
| 13 | Fornecedores | `fornecedores` | nao_adquirido | Gestão de fornecedores |
| 14 | Catálogo de Serviços | `servicos` | nao_adquirido | Cadastro de serviços |
| 15 | Colaboradores | `colaboradores` | nao_adquirido | Gestão de equipe e permissões |

### 3. Módulos Premium

| # | Módulo | Código | Status atual | Propósito |
|---|--------|--------|--------------|-----------|
| 16 | MEL IA | `mel` | core | Já está como core, mas tem potencial premium |
| 17 | Chatbot | `chatbot` | nao_adquirido | Atendimento automatizado 24/7 |
| 18 | Marketplace | `marketplace` | nao_adquirido | Venda em múltiplos canais |

---

## 🖥️ Mapeamento de telas por módulo

### 1. Dashboard

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Dashboard geral | `DashboardPage.tsx` | `/dashboard` | ✅ Existente |

**Telas recomendadas para UNIQ Empresas:**
- Dashboard personalizado por ramo (ótica, gráfica, doceria)
- Widget de atendimento do dia
- Alertas de leads pendentes

---

### 2. Minha Empresa

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Dados da empresa | `configuracoes/EmpresaPage.tsx` | `/configuracoes/empresa` | ✅ Existente |

**Telas recomendadas:**
- Configuração de marca (logo, cores)
- Redes sociais do parceiro
- Informações fiscais/bancárias

---

### 3. Configurações

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Dados da empresa | `configuracoes/EmpresaPage.tsx` | `/configuracoes/empresa` | ✅ Existente |
| Conta do usuário | `configuracoes/ContaPage.tsx` | `/configuracoes/conta` | ✅ Existente |
| Colaboradores | `employees/ColaboradoresPage.tsx` | `/configuracoes/colaboradores` | ✅ Existente |
| Novo colaborador | `employees/NovoColaboradorPage.tsx` | `/configuracoes/colaboradores/novo` | ✅ Existente |
| Detalhe do colaborador | `employees/ColaboradorDetalhePage.tsx` | `/configuracoes/colaboradores/:id` | ✅ Existente |
| Permissões do colaborador | `employees/ColaboradorPermissoesPage.tsx` | `/configuracoes/colaboradores/:id/permissoes` | ✅ Existente |

**Telas faltantes (já no backlog):**
- `/configuracoes/integracoes`
- `/configuracoes/notificacoes`

---

### 4. Meus Módulos

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Catálogo de módulos | `modulos/MeusModulosPage.tsx` | `/meus-modulos` | ✅ Existente |
| Escolha de plano | `modulos/EscolhaPlanoPage.tsx` | `/onboarding/plano` | ✅ Existente |

---

### 5. MEL IA

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Dashboard da MEL | `mel/MelDashboardPage.tsx` | `/mel` | ✅ Existente |
| Conversa da MEL | `mel/MelConversaPage.tsx` | `/mel/conversa` | ⚠️ Arquivo morto (não usado na rota) |
| Configurações da MEL | `mel/MelConfiguracoesPage.tsx` | `/mel/configuracoes` | ✅ Existente |

**Telas recomendadas:**
- Histórico de conversas por cliente
- Treinamento/prompts da MEL por negócio
- Análise de sentimento das conversas

---

### 6. CRM

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Dashboard do CRM | `crm/CRMDashboardPage.tsx` | `/crm/dashboard` | ✅ Existente |
| Lista de clientes | `crm/ClientesPage.tsx` | `/crm/clientes` | ✅ Existente |
| Detalhe do cliente | `crm/ClienteDetalhePage.tsx` | `/crm/clientes/:id` | ✅ Existente |
| Pipeline de vendas | `crm/PipelinePage.tsx` | `/crm/pipeline` | ✅ Existente |

**Telas recomendadas para UNIQ Empresas:**
- Importação de contatos
- Segmentação de leads
- Histórico de interações (WhatsApp, e-mail, Ligações)
- Tarefas/follow-ups automáticos

---

### 7. Agenda

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Agenda principal | `agenda/AgendaPage.tsx` | `/agenda` | ✅ Existente |
| Novo agendamento | `agenda/NovoAgendamentoPage.tsx` | `/agenda/novo` | ✅ Existente |
| Compromissos | `agenda/CompromissosPage.tsx` | `/agenda/compromissos` | ✅ Existente |
| Detalhe do agendamento | `agenda/AgendamentoDetalhePage.tsx` | `/agenda/:id` | ✅ Existente |

**Telas recomendadas:**
- Configuração de lembretes automáticos
- Integração com Google Agenda/Outlook
- Bloqueio de horários
- Agendamento online público

---

### 8. Vendas

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| PDV | `pdv/PDVPage.tsx` | `/vendas/pdv` | ✅ Existente |
| Abertura de caixa | `pdv/AberturaCaixaPage.tsx` | `/vendas/pdv/abertura` | ✅ Existente |
| Fechamento de caixa | `pdv/FechamentoCaixaPage.tsx` | `/vendas/pdv/fechamento` | ✅ Existente |
| Lista de pedidos | `pedidos/PedidosListaPage.tsx` | `/vendas/pedidos` | ✅ Existente |
| Detalhe do pedido | `pedidos/PedidoDetalhePage.tsx` | `/vendas/pedidos/:id` | ✅ Existente |
| Relatórios de vendas | `pedidos/RelatoriosVendasPage.tsx` | `/vendas/relatorios` | ✅ Existente |
| Cupons | `pedidos/CuponsPage.tsx` | `/vendas/cupons` | ✅ Existente |

**Telas recomendadas:**
- Orçamentos
- Conversão de orçamento em pedido
- Comissões de vendedores

---

### 9. Loja Virtual (pública)

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Vitrine pública | `loja/LojaPage.tsx` | `/loja` | ✅ Existente |
| Produto público | `loja/ProdutoLojaPage.tsx` | `/loja/produto/:id` | ✅ Existente |
| Checkout público | `loja/CheckoutPage.tsx` | `/loja/checkout` | ✅ Existente |
| Meus pedidos | `loja/MeusPedidosPage.tsx` | `/loja/pedidos` | ✅ Existente |

**Telas recomendadas:**
- Configuração da loja
- Meios de pagamento
- Frete/entrega

---

### 10. Estoque

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Dashboard de estoque | `estoque/EstoqueDashboardPage.tsx` | `/estoque/dashboard` | ✅ Existente |
| Lista de produtos | `estoque/ProdutosPage.tsx` | `/estoque/produtos` | ✅ Existente |
| Detalhe do produto | `estoque/ProdutoDetalhePage.tsx` | `/estoque/produtos/:id` | ✅ Existente |
| Movimentações | `estoque/MovimentacoesPage.tsx` | `/estoque/movimentacoes` | ✅ Existente |

**Telas recomendadas:**
- Categorias de produtos
- Alertas de reposição
- Inventário físico
- Curva ABC

---

### 11. Financeiro

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Dashboard financeiro | `financeiro/FinanceiroDashboardPage.tsx` | `/financeiro/dashboard` | ✅ Existente |
| Fluxo de caixa | `financeiro/FluxoCaixaPage.tsx` | `/financeiro/fluxo-de-caixa` | ✅ Existente |
| Contas a pagar | `financeiro/ContasPagarPage.tsx` | `/financeiro/contas-pagar` | ✅ Existente |
| Contas a receber | `financeiro/ContasReceberPage.tsx` | `/financeiro/contas-receber` | ✅ Existente |
| DRE | `financeiro/DREPage.tsx` | `/financeiro/dre` | ✅ Existente |

**Telas recomendadas:**
- Categorias financeiras
- Conciliação bancária
- Centros de custo
- Projeção de caixa

---

### 12. Métricas

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Dashboard de métricas | `metricas/MetricasDashboardPage.tsx` | `/metricas/dashboard` | ✅ Existente |
| Métricas de vendas | `metricas/VendasPage.tsx` | `/metricas/vendas` | ✅ Existente |
| Métricas financeiras | `metricas/FinanceiroPage.tsx` | `/metricas/financeiro` | ✅ Existente |
| Métricas de clientes | `metricas/ClientesPage.tsx` | `/metricas/clientes` | ✅ Existente |
| Métricas de agendamentos | `metricas/AgendamentosPage.tsx` | `/metricas/agendamentos` | ✅ Existente |
| Métricas de produtos | `metricas/ProdutosPage.tsx` | `/metricas/produtos` | ✅ Existente |

**Telas recomendadas:**
- Métricas de atendimento (MEL)
- Relatórios customizados
- Exportação de dados

---

### 13. Fornecedores

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Lista de fornecedores | `fornecedores/FornecedoresPage.tsx` | `/fornecedores` | ✅ Existente |
| Novo fornecedor | `fornecedores/FornecedorNovoPage.tsx` | `/fornecedores/novo` | ✅ Existente |
| Detalhe do fornecedor | `fornecedores/FornecedorDetalhePage.tsx` | `/fornecedores/:id` | ✅ Existente |
| Editar fornecedor | `fornecedores/FornecedorEditarPage.tsx` | `/fornecedores/:id/editar` | ✅ Existente |

**Telas recomendadas:**
- Ordens de compra
- Comparativo de preços
- Histórico de compras

---

### 14. Catálogo de Serviços

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Lista de serviços | `servicos/ServicosPage.tsx` | `/servicos` | ✅ Existente |
| Catálogo público | `servicos/CatalogoPage.tsx` | `/catalogo` | ✅ Existente |
| Novo serviço | `servicos/ServicoNovoPage.tsx` | `/servicos/novo` | ✅ Existente |
| Editar serviço | `servicos/ServicoEditarPage.tsx` | `/servicos/:id/editar` | ✅ Existente |

**Telas recomendadas:**
- Pacotes de serviços
- Comissionamento
- Disponibilidade por profissional

---

### 15. Colaboradores

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Lista de colaboradores | `employees/ColaboradoresPage.tsx` | `/configuracoes/colaboradores` | ✅ Existente |
| Novo colaborador | `employees/NovoColaboradorPage.tsx` | `/configuracoes/colaboradores/novo` | ✅ Existente |
| Detalhe do colaborador | `employees/ColaboradorDetalhePage.tsx` | `/configuracoes/colaboradores/:id` | ✅ Existente |
| Permissões | `employees/ColaboradorPermissoesPage.tsx` | `/configuracoes/colaboradores/:id/permissoes` | ✅ Existente |

**Telas recomendadas:**
- Escala de trabalho
- Folha de pagamento simplificada
- Metas por colaborador

---

### 16. Chatbot

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Chatbot principal | `chatbot/ChatbotPage.tsx` | `/chatbot` | ✅ Existente |
| Configurações do chatbot | `chatbot/ChatbotConfigPage.tsx` | `/chatbot/configuracoes` | ✅ Existente |
| Respostas automáticas | `chatbot/RespostasAutoPage.tsx` | `/chatbot/respostas` | ✅ Existente |
| FAQ | `chatbot/FAQPage.tsx` | `/chatbot/faq` | ✅ Existente |
| Estatísticas | `chatbot/ChatbotStatsPage.tsx` | `/chatbot/estatisticas` | ✅ Existente |

**Telas recomendadas:**
- Fluxos de conversa visuais
- Treinamento da IA
- Teste de conversa

---

### 17. Marketplace

| Tela | Arquivo | Rota | Status |
|------|---------|------|--------|
| Marketplace público | `marketplace/MarketplacePage.tsx` | `/marketplace` | ✅ Existente |
| Página do lojista | `marketplace/LojistaPage.tsx` | `/marketplace/lojista/:id` | ✅ Existente |
| Carrinho | `marketplace/CarrinhoPage.tsx` | `/marketplace/carrinho` | ✅ Existente |
| Checkout do marketplace | `marketplace/CheckoutPage.tsx` | `/marketplace/checkout` | ✅ Existente |
| Dashboard do vendedor | `marketplace/VendedorDashboardPage.tsx` | `/marketplace/vendedor` | ✅ Existente |
| Pedidos do vendedor | `marketplace/VendedorPedidosPage.tsx` | `/marketplace/vendedor/pedidos` | ✅ Existente |

**Telas recomendadas:**
- Cadastro de lojistas
- Gestão de produtos do vendedor
- Avaliações

---

## 🎯 Módulos prioritários — Fase 1 (Co-fundadores)

Com base na dor do primeiro lead (ótica) e no modelo UNIQ Empresas, os módulos prioritários são:

| Prioridade | Módulo | Por quê |
|------------|--------|---------|
| 1 | **MEL IA / Chatbot** | Atendimento automático no WhatsApp — dor central |
| 2 | **CRM** | Controle de leads e clientes |
| 3 | **Agenda** | Agendamentos e lembretes automáticos |
| 4 | **Dashboard** | Visão geral para o dono do negócio |
| 5 | **Minha Empresa** | Dados e identidade do parceiro |
| 6 | **Financeiro** | Controle de contas (segunda dor da ótica) |
| 7 | **Métricas** | Provar valor gerado pela MEL |

---

## 🔌 Integrações necessárias

| Integração | Status | Onde entra |
|------------|--------|------------|
| WhatsApp (n8n) | ✅ Rodando em (11) 95817-4767 | MEL, Chatbot, atendimento |
| Supabase | 📋 A configurar para dados reais | CRM, Agenda, Financeiro |
| Instagram DM | 🔴 Pendente | MEL multicanal |
| Google Agenda/Outlook | 🔴 Pendente | Agenda |
| Meta Ads | 🔴 Pendente | Métricas/aquisição |
| Mercado Pago/Stripe | 🔴 Pendente | Loja/Marketplace |

---

## 🚧 Telas/funcionalidades faltantes críticas

1. **Configurações**
   - `/configuracoes/integracoes`
   - `/configuracoes/notificacoes`

2. **MEL**
   - Histórico de conversas por cliente
   - Prompts configuráveis por ramo
   - Análise de qualificação

3. **CRM**
   - Importação de contatos
   - Tarefas/follow-ups automáticos
   - Histórico unificado de interações

4. **Agenda**
   - Lembretes automáticos por WhatsApp
   - Integração com Google Agenda

5. **Financeiro**
   - Conciliação bancária
   - Projeção de caixa

6. **Métricas**
   - Dashboard de "valor gerado pela MEL"

---

## 📝 Notas para construção

- A árvore canônica é `uniq-app/src/app`; a árvore raiz `src/app` é snapshot antigo e não deve ser alterada.
- O sistema é mock/local-first atualmente. A integração com Supabase é o próximo passo técnico.
- Cada novo co-fundador pode exigir novas telas específicas do ramo. Essas telas devem ser construídas como "legos" reutilizáveis.

---

*Mapa criado para servir de base no planejamento do UNIQ Empresas.*
