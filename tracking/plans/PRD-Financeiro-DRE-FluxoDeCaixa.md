# PRD — DRE Simples + Fluxo de Caixa Reais (Item 7)

> **Origem:** `tracking/USO_REAL_DOCEE.md` — item 7 (solicitado em 10/09/2026 pela Doceê).
> **Tipo:** Nova funcionalidade — requer **WIRE aprovado antes do código** (regra de ouro SDD).
> **SPEC de execução:** `tracking/specs/SPEC-Financeiro-DRE-FluxoDeCaixa.md`
> **⚠️ Dependência:** o **hotfix de isolamento de tenant** (`SPEC-UsoReal-DoceE-Hotfix-IsolamentoTenant.md`) DEVE ser concluído antes deste trabalho, pois os hooks novos herdam o padrão de isolamento (empresa_id + sem limit(1) + sem mock de outra empresa).

---

## 1. Objetivo

Substituir os dados mockados de **DRE Simples** e **Fluxo de Caixa** por dados reais do Supabase, para que a Doceê (e qualquer parceiro) veja a situação financeira real do seu negócio. O Dashboard financeiro também deve ser atualizado para consumir os hooks reais.

## 2. Problema

A Doceê criou empresa, cadastrou pedidos e contas — mas ao abrir as telas financeiras, tudo mostrava dados da empresa fictícia "Loja da Maria" (março/2025). **O fundador não consegue ver se o negócio está lucrativo ou não.** Para a UNIQ, que promete "mostrar para onde o dinheiro está saindo", isso é inaceitável.

| Tela | Estado atual |
|---|---|
| **DRE Simples** (`/financeiro/dre`) | `DREPage.tsx:11` — `const dre = dreMock;` — 100% mock estático (março/2025, Loja da Maria). Período fixo "2025-03". Sem filtro de empresa. Sem integração com banco. |
| **Fluxo de Caixa** (`/financeiro/fluxo-de-caixa`) | `FluxoCaixaPage.tsx:31` — `useState(movimentacoesMock)` — 100% mock + CRUD em memória (não persiste). `saldoInicial = 3500` hardcoded. Período fixo "2025-03". |
| **Dashboard financeiro** (`/financeiro`) | `FinanceiroDashboardPage.tsx:28-68` — consome `movimentacoesMock`, `contasPagarMock`, `contasReceberMock`, `dreMock` direto. Período fixo "2025-03", saldo 3500 hardcoded. |

> **Nota:** as telas de **Contas a Receber** e **Contas a Pagar** já foram integradas ao banco (T2.7 / SPEC-Semana2-T2.7), mas sofreram o mesmo bug de isolamento — o hotfix (itens 1–6) corrige isso primeiro.

## 3. Fontes de dados reais (já existem no Supabase)

| Fonte | Tabela | Campos-chave | Uso no DRE | Uso no Fluxo de Caixa |
|---|---|---|---|---|
| **Vendas (receita bruta)** | `me_venda` | `empresa_id`, `valor_total`, `status_venda`, `criado_em` | Receita bruta do período (soma de vendas com `criado_em` no mês) | — |
| **Itens de venda (CMV)** | `me_itens_venda` | `venda_id`, `produto_id`, `quantidade`, `preco_unitario` | CMV = Σ (quantidade × `me_produto.preco_custo`) | — |
| **Produtos (custo)** | `me_produto` | `id`, `preco_custo`, `empresa_id` | Join com itens de venda para CMV | — |
| **Contas a receber** | `me_contas_receber` | `empresa_id`, `valor`, `data_vencimento`, `data_pagamento`, `status`, `descricao`, `categoria_id` | — | **Entradas pagas:** Σ valor WHERE status='pago' E data_pagamento no período |
| **Contas a pagar** | `me_contas_pagar` | `empresa_id`, `valor`, `data_vencimento`, `data_pagamento`, `status`, `descricao`, `categoria_id`, `fornecedor_id` | **Despesas operacionais:** Σ valor_pago WHERE data_pagamento no período | **Saídas pagas:** Σ valor_pago WHERE data_pagamento no período |
| **Fornecedores** | `me_fornecedor` | `id`, `nome_fantasia`, `empresa_id` | — | Join para exibir nome do fornecedor |
| **Categorias** | `me_categoria` (verificar existência) | `id`, `nome`, `empresa_id` | Agrupar despesas por categoria no DRE | Exibir categoria nas movimentações |

> **⚠️ Verificação necessária antes da implementação:** rodar `SELECT * FROM me_categoria;` para confirmar que a tabela existe e tem dados. Se não existir, usar o campo `descricao` de me_contas_pagar como proxy de categoria, e criar tabela de categorias como parte deste SPEC (ou adiar agrupamento por categoria para fase futura — decidir com o fundador).

## 4. Escopo

### ✅ DRE Simples (reais)
- Período selecionável (input `type="month"`, padrão: mês atual)
- Dados derivados de `me_venda` + `me_contas_pagar` + `me_itens_venda` + `me_produto`
- Estrutura DRE simplificada: Receita Bruta → (-) Impostos → (=) Receita Líquida → (-) CMV → (=) Lucro Bruto → (-) Despesas Operacionais → (=) Lucro Líquido
- KPIs: Receitas Totais, Despesas Totais, Lucro/Prejuízo, Margem de Lucro
- Gráfico de pizza: Despesas por Categoria
- Gráfico de barras: Receitas vs Despesas vs Lucro
- Alerta lucro/prejuízo (parabéns/seu resultado foi negativo)
- Botão "Exportar PDF" (neste fase: desabilitado com tooltip "Em breve" — sem backend de PDF)
- Estados: loading (skeleton), empty (sem dados no período — "Nenhuma venda ou despesa registrada neste mês"), erro, success

### ✅ Fluxo de Caixa (reais)
- Período selecionável (padrão: mês atual)
- **Entradas:** derivadas de `me_contas_receber` WHERE status='pago' AND data_pagamento no período (excluindo vendas já contabilizadas — evitar dupla contagem se DRE e Fluxo são visualizações diferentes dos mesmos dados; na prática, Fluxo usa pagamento, DRE usa competência)
- **Saídas:** derivadas de `me_contas_pagar` WHERE status='pago' AND data_pagamento no período
- **Saldo inicial:** soma de todos os pagamentos (entradas - saídas) ANTERIORES ao início do período selecionado — ou, se não houver dados anteriores, 0
- CRUD: "Nova movimentação" cria registro em `me_contas_receber` (tipo entrada) ou `me_contas_pagar` (tipo saída) **sem vinculo** a venda/fornecedor (campos opcionais). Editar/excluir segue o padrão já existente
- KPIs: Saldo Inicial, Total de Entradas, Total de Saídas, Saldo Final
- Gráfico de linha: Entradas e Saídas por dia
- Tabela: data, descrição, categoria, tipo, valor, ações (editar, excluir)
- Filtros: período, tipo (todos/entradas/saídas), busca textual
- Estados: loading, empty, erro, success

### ✅ Dashboard financeiro (reais)
- Consumir os mesmos hooks do DRE e Fluxo de Caixa (não mock)
- KPIs: Saldo Projetado, Entradas do Mês, Saídas do Mês, Lucro do Mês
- Alertas: contas vencidas (pular do SPEC do hotfix — já integradas ao banco lá), contas a receber atrasadas
- Próximas contas a pagar (7 dias): derivado de `me_contas_pagar` WHERE status='pendente' AND data_vencimento ≤ hoje+7
- Últimas movimentações: derivado de `me_contas_receber` + `me_contas_pagar` + `me_venda` (últimas 5 transações pagas)

### ❌ Fora de escopo
- Exportação PDF (botão existe mas fica desabilitado com tooltip "Em breve")
- Relatórios por período customizado (só mês a mês por enquanto)
- Integração com bancos (OFX/CSV import)
- Categorias customizáveis pelo usuário (usar categorias do banco; criar/editar categorias é fase futura)
- CMV detalhado por produto (usar approximação via preco_custo × quantidade; se preco_custo não existir ou for 0, CMV = 0 com nota visual "Custo dos produtos não cadastrado")

## 5. Stakeholders

- **Doceê (esposa do fundador):** valida — é ela que precisa ver se está lucrativa
- **Fundador:** aprova, valida mobile via Vercel

## 6. Métricas de sucesso

| # | Critério | Como validar |
|---|---|---|
| 1 | DRE mostra dados reais da Doceê (não da Loja da Maria) | Comparar com query SQL manual de me_venda + me_contas_pagar |
| 2 | Fluxo de Caixa mostra entradas/saídas reais, com saldo correto | Somatório manual das contas pagas no período |
| 3 | Dashboard financeiro consome hooks reais (sem import de mock) | `grep "Mock" src/app/components/financeiro/FinanceiroDashboardPage.tsx` retorna 0 |
| 4 | Período selecionável funciona — trocar mês troca os dados | Selecionar mês anterior, conferir se valores mudam |
| 5 | Empty state aparece quando não há dados no período | Selecionar mês sem vendas nem despesas |
| 6 | "Nova movimentação" persiste no banco | Criar, recarregar, conferir no Supabase |
| 7 | Isolamento: dados de uma empresa não aparecem na outra | Login alternado entre Doceê e empresa demo |
| 8 | Build + deploy Vercel READY | `npm run build` + Vercel |

## 7. Dependências e riscos

| Item | Impacto | Mitigação |
|---|---|---|
| **Hotfix de tenant (itens 1–6)** | Sem ele, os hooks novos teriam os mesmos bugs de isolamento | Hotfix DEVE ser concluído primeiro |
| **me_itens_venda pode estar vazia** | Sem ela, CMV = 0 (DRE mostra custos zerados) | Tratar como limitação visual: "Custo dos produtos não cadastrado" |
| **me_produto.preco_custo pode ser 0/null** | CMV aproximado fica subestimado | Adicionar flag visual quando preco_custo ausente |
| **Tabela me_categoria pode não existir** | Agrupamento de despesas por categoria fica impossibilitado | Verificar antes; se não existir, agrupar por `descricao` truncada ou por fornecedor |
| **Saldo inicial sem dados históricos** | Primeiro mês de uso = saldo inicial 0 (pode confundir) | Explicar visualmente: "Saldo calculado com base nos registros anteriores ao período" |
| **DRE impostos** | Microempresas simples não têm impostos separados na venda | Hardcode impostos = 0 neste fase; campo visível mas zerado; facilita futura customização |
