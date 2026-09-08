# Módulo Financeiro - UNIQ Empresas

## 📋 Visão Geral

Módulo de gestão financeira simplificado para pequenos empreendedores (MEI/Micro). Foco em simplicidade extrema, sem jargões contábeis, mobile-first.

## 🎯 Páginas Implementadas

### 1. Dashboard Financeiro (`/financeiro/dashboard`)
- **Arquivo:** `FinanceiroDashboardPage.tsx`
- **Objetivo:** Visão geral da saúde financeira
- **Features:**
  - KPIs principais (Saldo Projetado, Entradas, Saídas, Lucro/Prejuízo)
  - Alertas de contas vencidas e clientes inadimplentes
  - Próximas contas a pagar (7 dias)
  - Contas a receber
  - Últimas movimentações

### 2. Fluxo de Caixa (`/financeiro/fluxo-de-caixa`)
- **Arquivo:** `FluxoCaixaPage.tsx`
- **Objetivo:** Visualizar entradas e saídas de dinheiro
- **Features:**
  - Cards de resumo (Saldo Inicial, Entradas, Saídas, Saldo Final)
  - Gráfico temporal (Entradas vs Saídas)
  - Filtros (período, tipo, busca)
  - Lista de movimentações com status
  - Alerta de saldo negativo
  - Modal para nova movimentação (placeholder)

### 3. Contas a Pagar (`/financeiro/contas-pagar`)
- **Arquivo:** `ContasPagarPage.tsx`
- **Objetivo:** Gerenciar despesas e obrigações
- **Features:**
  - KPIs (Total a Pagar, Vencido, Pago, Qtd Pendentes)
  - Alertas de contas vencidas
  - Filtros (status, busca)
  - Lista com indicador de vencimento
  - Destaque visual para urgentes e vencidas
  - Ação "Registrar Pagamento"
  - Modal de pagamento (placeholder)

### 4. Contas a Receber (`/financeiro/contas-receber`)
- **Arquivo:** `ContasReceberPage.tsx`
- **Objetivo:** Acompanhar recebimentos e cobranças
- **Features:**
  - KPIs (Total a Receber, Atrasado, Recebido, Previsão)
  - Alertas de clientes inadimplentes
  - Filtros (status, busca)
  - Lista com parcelas e formas de pagamento
  - Ações "Receber" e "Enviar Cobrança"
  - Modal de cobrança com preview WhatsApp

### 5. DRE Simples (`/financeiro/dre`)
- **Arquivo:** `DREPage.tsx`
- **Objetivo:** Demonstrativo de resultados simplificado
- **Features:**
  - KPIs (Receitas, Despesas, Lucro/Prejuízo, Margem)
  - Estrutura DRE didática passo a passo
  - Gráfico de pizza (despesas por categoria)
  - Gráfico de barras (visão geral)
  - Explicações amigáveis
  - Filtro de período
  - Opção de comparativo com mês anterior

## 📁 Estrutura de Arquivos

```
/src/app/components/financeiro/
├── mockData.ts                    # Dados de exemplo
├── components.tsx                 # Componentes reutilizáveis
├── FinanceiroDashboardPage.tsx   # Dashboard principal
├── FluxoCaixaPage.tsx            # Fluxo de caixa
├── ContasPagarPage.tsx           # Contas a pagar
├── ContasReceberPage.tsx         # Contas a receber
└── DREPage.tsx                   # DRE Simples
```

## 🎨 Componentes Reutilizáveis

- **CardKPI** - Card de indicador com ícone e valor
- **BadgeStatus** - Badge de status (pago, pendente, vencido)
- **IndicadorVencimento** - Mostra dias até vencer ou em atraso
- **EmptyState** - Estado vazio com CTA
- **AlertaAmigavel** - Alerta com tom amigável

## 📊 Mock Data

- **movimentacoesMock** - 10 movimentações de exemplo
- **contasPagarMock** - 8 contas a pagar
- **contasReceberMock** - 6 contas a receber
- **dreMock** - Dados agregados do DRE

### Helpers
- `formatarMoeda(valor)` - Formata para BRL
- `calcularDiasVencimento(data)` - Calcula dias até/desde vencimento
- `calcularStatus(data, statusAtual)` - Atualiza status baseado na data

## 🎯 Design Principles

1. **Simplicidade Extrema** - Interface limpa, sem termos técnicos
2. **Mobile-First** - Responsivo e touch-friendly
3. **Feedback Amigável** - Mensagens motivadoras, não alarmantes
4. **Visual Hierarchy** - Números grandes, cores indicativas
5. **Acessibilidade** - Labels claros, tooltips, estados de loading

## 🔗 Integração

### Rotas (routes.tsx)
- `/financeiro` → redirect para dashboard
- `/financeiro/dashboard`
- `/financeiro/fluxo-de-caixa`
- `/financeiro/contas-pagar`
- `/financeiro/contas-receber`
- `/financeiro/dre`

### Context Bar (AppLayout.tsx)
- Dashboard
- Fluxo de Caixa
- Contas a Pagar
- Contas a Receber
- DRE Simples

## 🚀 Próximos Passos

1. **Implementar modais completos** - Formulários de nova movimentação, pagamento, recebimento
2. **Conectar ao Supabase** - Persistência real dos dados
3. **Implementar filtros avançados** - Categorias, fornecedores, clientes
4. **Adicionar exportação** - PDF, Excel dos relatórios
5. **Integração com outros módulos:**
   - Vendas → Lançamento automático de receitas
   - Estoque → Custo de mercadorias vendidas
   - CRM → Dados de clientes
   - MEL → Alertas inteligentes

## 📱 Responsividade

Todas as telas são mobile-first com breakpoints:
- Mobile: < 640px (1 coluna)
- Tablet: 640px - 1024px (2 colunas)
- Desktop: > 1024px (3-4 colunas)

## 🎨 Design Tokens

Seguindo o theme.css da aplicação:
- Verde: `#1B6B3A`, `#10b981`, `#4ADE80` (positivo)
- Vermelho: `#ef4444`, `#dc2626` (negativo)
- Âmbar: `#f59e0b`, `#fbbf24` (atenção)
- Slate: escala padrão do Tailwind

## 📝 Notas Técnicas

- **Recharts** para gráficos
- **Lucide React** para ícones
- **Tailwind CSS v4** para estilização
- **React Router v7** para navegação
- Dados mock realistas para MEI/Micro
