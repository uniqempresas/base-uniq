# WIRE — Delta: DRE + Fluxo de Caixa + Dashboard Financeiro (dados reais)

> **Item 7 do uso real — Doceê.** PRD: `tracking/plans/PRD-Financeiro-DRE-FluxoDeCaixa.md` · SPEC: `tracking/specs/SPEC-Financeiro-DRE-FluxoDeCaixa.md`
>
> **Nota:** as telas já existem e foram aprovadas em sprint anterior. Este WIRE é um **delta** seguindo o precedente de `WIRE-Semana2-T2.7-FinanceiroBanco.md` — **não há mudança de layout**, apenas:
> 1. Fonte de dados: mock → Supabase (via hooks novos `useDRE`, `useFluxoCaixa`, `useFinanceiroDashboard`)
> 2. Novos estados visuais que hoje não existem (loading skeleton, empty real, error, badge demo)
> 3. Ações de CRUD do Fluxo de Caixa passam a gravar no banco (hoje são em memória)
>
> **Regra de fallback (07/09/2026):** mock apenas em modo demo (sem sessão autenticada). Com sessão, dados reais + estados vazios reais.

---

## Tela: DRE Simples (`/financeiro/dre`)

### Estrutura atual (SEM mudança de layout)

```
┌─────────────────────────────────────────────────────────────────┐
│  DRE Simples                                      [Exportar PDF] │
│  Demonstrativo de Resultados do seu negócio de forma simples     │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Parabéns! Seu negócio teve lucro este mês 🎉                  │
│  (ou ⚠️ Seu resultado foi negativo este mês)                     │
├─────────────────────────────────────────────────────────────────┤
│  Período [2025-03 ▼]  ☑ Comparar com mês anterior                │
├─────────────────────────────────────────────────────────────────┤
│  [Receitas Totais] [Despesas Totais] [Lucro Líquido] [Margem %]  │
├─────────────────────────────────────────────────────────────────┤
│  Demonstrativo do Período                                        │
│  Receita Bruta          R$ 12.000,00                             │
│  (-) Impostos           -R$ 0,00        ← 0 fixo (Simples)       │
│  (=) Receita Líquida    R$ 12.000,00                             │
│  (-) Custos             -R$ 3.200,00    ← CMV ou nota visual     │
│  (=) Lucro Bruto        R$ 8.800,00                              │
│  (-) Despesas Operac.   -R$ 5.400,00                             │
│  (=) Lucro Líquido      R$ 3.400,00                              │
├─────────────────────────────────────────────────────────────────┤
│  [Pizza: Despesas por Categoria]  [Barras: Visão Geral + dica]   │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes / fontes

| Componente | Fonte (hoje) | Fonte (após) |
|------------|--------------|--------------|
| KPIs (4 cards) | `dreMock` | `useDRE(periodo)` → `receitaBruta`, `despesasOperacionais + custos`, `lucroLiquido`, `margemLucro` |
| Estrutura DRE (7 linhas) | `dreMock` | `useDRE(periodo)` → campos do `DREData` |
| Pizza "Despesas por Categoria" | `dreMock.categoriasDespesas` | `useDRE(periodo)` → `categoriasDespesas` |
| Barras "Visão Geral" | calculado do `dreMock` | calculado do `DREData` (mesma fórmula) |
| Badge "dados de exemplo" | não existe | `isFallback === true` → badge topo da tela |
| Botão "Exportar PDF" | inerte (fake download) | **desabilitado** + tooltip "Em breve" |

### Nota visual — CMV

Se `me_itens_venda` ou `preco_custo` não existirem (ver SPEC §1): linha "(-) Custos" mostra `R$ 0,00` acompanhada de nota discreta: **"Custo dos produtos não cadastrado"** (texto pequeno, `text-xs`, ao lado da linha), sem quebrar o layout.

---

## Tela: Fluxo de Caixa (`/financeiro/fluxo-de-caixa`)

### Estrutura atual (SEM mudança de layout)

```
┌─────────────────────────────────────────────────────────────────┐
│  FINANCEIRO / VISÃO GERAL                                       │
│  Fluxo de caixa                            [+ Nova movimentação] │
│  Acompanhe o que entrou e saiu do seu negócio.                   │
├─────────────────────────────────────────────────────────────────┤
│  [Saldo inicial] [Total entradas] [Total saídas] [Saldo final]   │
├─────────────────────────────────────────────────────────────────┤
│  Período [2025-03 ▼]  Tipo [Todos ▼]  🔍 Buscar...              │
├─────────────────────────────────────────────────────────────────┤
│  Entradas e saídas (linha por dia — recharts)                    │
├─────────────────────────────────────────────────────────────────┤
│  Movimentações                              [Exportar]           │
│  Data │ Descrição │ Categoria │ Tipo │ Valor │ (editar/excluir)  │
└─────────────────────────────────────────────────────────────────┘
```

### Modal Nova/Editar (layout atual mantido)

```
┌───────────────────────────────────────────────┐
│  Nova movimentação                      [X]    │
├───────────────────────────────────────────────┤
│  Descrição * [________________________]       │
│  Categoria  [Vendas ▼]   Tipo [Entrada ▼]     │
│  Pessoa     [________________________]        │
│  Valor *    [________]   Data * [__/__/____]  │
├───────────────────────────────────────────────┤
│                         [Cancelar] [Salvar]   │
└───────────────────────────────────────────────┘
```

### Mudanças funcionais

| Ação | Hoje | Após |
|------|------|------|
| Listar movimentações | `movimentacoesMock` (estado local) | `useFluxoCaixa(periodo)` → `me_contas_receber` (entradas) + `me_contas_pagar` (saídas) pagas no período, unificadas em `MovimentacaoFluxo[]` |
| Saldar inicial | `3500` hardcoded (FluxoCaixaPage.tsx:49) | `useFluxoCaixa` → soma (entradas − saídas) ANTERIORES ao período |
| Nova movimentação | push em memória local | `criarMovimentacao()` → INSERT em `me_contas_receber` (entrada) ou `me_contas_pagar` (saída) com `status='pago'`, `data_pagamento=data` |
| Editar | update em memória local | `editarMovimentacao(id)` → UPDATE no registro de origem |
| Excluir | confirm + filter local | `excluirMovimentacao(id, origem)` → DELETE no registro de origem |
| Coluna "Pessoa" | mock | nome do cliente (`me_cliente.nome_cliente`) ou fornecedor (`me_fornecedor.nome_fantasia`) |

### Novo estado (não existe hoje)

Badge "dados de exemplo" no topo quando `isFallback === true` (modo demo sem sessão).

---

## Tela: Dashboard Financeiro (`/financeiro`)

### Estrutura atual (SEM mudança de layout)

```
┌─────────────────────────────────────────────────────────────────┐
│  Resumo Financeiro                                               │
│  Visão geral da saúde financeira do seu negócio                  │
├─────────────────────────────────────────────────────────────────┤
│  ⚠️ Você tem 2 conta(s) vencida(s)  → Ver Contas                 │
│  (e/ou) ⚠️ N cliente(s) com pagamento atrasado → Ver Clientes    │
├─────────────────────────────────────────────────────────────────┤
│  [Saldo Projetado] [Entradas do Mês] [Saídas do Mês] [Lucro Mês] │
│   (cards clicáveis → /fluxo-de-caixa e /dre)                     │
├─────────────────────────────────────────────────────────────────┤
│  Contas a Pagar            Ver todas →   Contas a Receber  Ver   │
│  Total a pagar: R$ X                     Total a receber: R$ Y   │
│  próxima conta, próxima conta            cliente, cliente,...    │
├─────────────────────────────────────────────────────────────────┤
│  Últimas Movimentações                Ver todas →                │
│  + Venda de produtos  • 12/03 Categoria   + R$ 450,00            │
│  − Aluguel           • 10/03 Categoria    − R$ 1.800,00          │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes / fontes

| Componente | Fonte (hoje) | Fonte (após) |
|------------|--------------|--------------|
| Alertas (vencidas / atrasadas) | `contasPagarMock`/`contasReceberMock` | `useFinanceiroDashboard()` → `contasVencidasPagar`, `contasAtrasadasReceber` (queries `status='vencido'`) |
| 4 KPIs | mocks + hardcoded `3500` | `useFinanceiroDashboard()` → `saldoProjetado`, `totalEntradasMes`, `totalSaidasMes`, `lucroMes` |
| Card Contas a Pagar | `contasPagarMock` (7 dias) | `useFinanceiroDashboard()` → `proximasContasPagar` (7 dias, ordenadas) |
| Card Contas a Receber | `contasReceberMock` | `useFinanceiroDashboard()` → contas pendentes + status real |
| Últimas Movimentações | `movimentacoesMock` (mês fixo "2025-03") | `useFinanceiroDashboard()` → `ultimasMovimentacoes` (mês atual) |

### Novo estado (não existe hoje)

Badge "dados de exemplo" no topo quando `isFallback === true`.

---

## Estados (novos — padronizados nas 3 telas)

| Estado | DRE | Fluxo de Caixa | Dashboard |
|--------|-----|----------------|-----------|
| **Loading** | Skeleton nos 4 KPIs + no bloco DRE + nos 2 gráficos | Skeleton nos 4 KPIs + tabela + gráfico de linha | Skeleton nos 4 KPIs + cards + lista |
| **Empty (sessão, banco vazio)** | "Nenhuma venda ou despesa registrada neste mês. Cadastre pedidos e contas para ver seu DRE." | "Nenhuma movimentação registrada neste período." + CTA "Adicionar movimentação" (já existe) | KPIs zerados + "Nenhum dado financeiro disponível" |
| **Empty (modo demo)** | Badge "dados de exemplo" + dados do mock | Badge "dados de exemplo" + dados do mock | Badge "dados de exemplo" + dados do mock |
| **Error** | "Erro ao carregar dados financeiros. Tente novamente." + botão retry | idem | idem |
| **Success** | Dados reais | Dados reais + CRUD gravando no banco | Dados reais |

## Badge de modo demo

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Exibindo dados de exemplo — faça login para ver os seus  │
└─────────────────────────────────────────────────────────────┘
```

Aparece quando `isFallback === true` (sem sessão autenticada). **Não** aparece com sessão ativa — mesmo que o banco esteja vazio (nesse caso: estado empty real).

---

*WIRE delta aprovado pela regra do precedente T2.7 — sem alteração de layout, apenas fonte de dados + estados. Detalhes técnicos: SPEC-Financeiro-DRE-FluxoDeCaixa.md §1–§5.*