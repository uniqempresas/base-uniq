# 🧪 GUIA DE TESTE NA VERCEL — lote de 17/09/2026

> **Para o fundador.** Tudo o que foi corrigido neste push, com o que fazer e o que deve acontecer.
> **URL:** https://base-uniq.vercel.app
> **Deploy verificado:** produção passou a servir `PedidosListaPage-BoT81rLk.js` (entry `index-BS6R34Pm.js`) com os marcadores do código novo. ✅

**Como usar:** teste de cima para baixo, no celular. Cada item diz **o que era antes** — se voltar o comportamento antigo, é regressão.

**Commits deste push:** `66fb73f` (pedidos) · `3504e71` (produtos) · `43b53ee` (crm) · `4a434bf` (tracking + migrations)

---

## A. PRODUTOS / ESTOQUE — `/estoque/produtos`

### A1. Tags/Etiquetas saíram do modal
- **Faça:** "Novo Produto" → etapa **1 (Informações)**.
- **Espere:** depois de **Código de Barras**, **não existe mais** a seção "Tags / Etiquetas".
- **Antes:** havia uma fileira de chips de tags ali.

### A2. Botão "Duplicar" funciona — visão GRADE
- **Faça:** na lista em grade, toque no ícone de **copiar** do card (no celular o ícone fica na linha de ações do card; no desktop aparece ao passar o mouse).
- **Espere:** abre o modal com título **"Duplicar Produto"**, nome terminando em **"(cópia)"**, SKU com **"-COPIA"** e **estoque 0**. Ao salvar → toast **"Produto duplicado com sucesso!"** e o novo produto aparece na lista.
- **Antes:** o botão não fazia **nada**.

### A3. Botão "Duplicar" funciona — visão TABELA
- **Faça:** trocar para **tabela** e tocar no ícone de copiar na coluna "Ações".
- **Espere:** mesmo comportamento do A2.
- **Antes:** esse botão também estava morto (era só um ícone sem ação).

### A4. Estoque mínimo agora é salvo de verdade
- **Faça:** "Novo Produto" → etapa **3 (Estoque)** → o campo **"Estoque mínimo"** já deve vir preenchido com **5**.
- **Faça:** mudar para **2** e salvar. Abrir o produto criado.
- **Espere:** o detalhe mostra **Estoque Mínimo = 2**.
- **Teste do caso limite:** editar um produto e colocar estoque mínimo **0** → deve salvar **0** (não pode virar 5).
- **Antes:** era **sempre 5**, ignorando o que você digitasse.

---

## B. PEDIDOS — `/vendas/pedidos`

### B1. Forma de pagamento correta (o bug do "Cartão de Crédito")
- **Faça:** abrir um pedido que veio do **WhatsApp/n8n** e olhar a seção **"Pagamento"**.
- **Espere:** mostrar **PIX**.
- **Antes:** mostrava **"Cartão de Crédito"** — sempre.
- **Importante:** os dados no banco **sempre estiveram certos** (eram Pix). O erro era só de exibição.

### B2. Filtro de período funciona
- **Faça:** selecionar **"Hoje"** → depois **"Ontem"** → depois **"Últimos 7 dias"**.
- **Espere:** "Hoje" mostra só os pedidos de hoje; "Ontem" mostra só os de ontem (pode estar vazio, e vazio é a resposta certa).
- **Antes:** **"Hoje" mostrava TODOS os pedidos** e **"Ontem" não mostrava nada**.

### B3. "Pago" saiu do filtro de status do pedido
- **Faça:** abrir os chips de **"Status do pedido"**.
- **Espere:** **não existe "Pago"** entre as opções.
- **Por quê:** pago não é status do pedido, é status de **pagamento**.

### B4. Novo filtro "Pagamento"
- **Faça:** localizar o grupo de chips **"Pagamento"**.
- **Espere:** existem **Pago** e **Pendente**. Selecionar **"Pago"** → só pedidos pagos. Selecionar **"Pendente"** → só pendentes.

### B5. Multi-seleção nos três filtros
- **Faça:** nos grupos **Status do pedido**, **Pagamento** e **Canal**, marcar **mais de um chip** ao mesmo tempo.
- **Espere:** os chips selecionados ficam destacados, cada um com um **X** para desmarcar, e a lista combina os filtros (E entre grupos, OU dentro do grupo).

### B6. Canal "Manual"
- **Faça:** criar um pedido em **"Novo Pedido"** e conferir o canal dele na lista. Depois olhar os chips de **Canal**.
- **Espere:** o canal do pedido criado manualmente é **Manual**, e existe o chip **Manual** no filtro.
- **Antes:** todo pedido criado pela tela era gravado como **WhatsApp**.

### B7. Filtros ficam salvos
- **Faça:** selecionar alguns filtros (ex.: status **Em Separação** + canal **Manual**) e trocar a visualização. **Fechar a aba do app** e **voltar**.
- **Espere:** os filtros voltam **como você deixou** — e a visualização (grade/tabela) também.
- **Detalhe:** é por **empresa**; se você logar em outra empresa, os filtros dela são próprios.

### B8. "Limpar filtros" limpa de verdade
- **Faça:** tocar em limpar filtros. Depois **recarregar** a página.
- **Espere:** tudo volta ao padrão e os filtros antigos **não voltam**.
- **Antes (se falhar):** o filtro reapareceria ao recarregar, porque ficaria salvo.

---

## C. CRM — `/crm/clientes`

### C1. Aba "Conversa" continua funcionando
- **Faça:** abrir um cliente com WhatsApp → aba **"Conversa"**.
- **Espere:** a conversa aparece normalmente, agora **filtrada pela sua empresa**.
- **Nota:** o bug era anexar conversa de **outra empresa** ao cliente. Com um único login isso é difícil de "ver" — o que importa aqui é que **não quebrou**.

---

## D. SANIDADE GERAL (o code splitting não pode ter quebrado nada)

### D1. Telas do ERP abrem normalmente
- **Faça:** navegar por **Dashboard**, **Financeiro**, **Estoque**, **CRM**, **Métricas**.
- **Espere:** nenhuma tela em **branco**. Se alguma abrir branca, é problema de chunk não carregado — me avise com o nome da tela.

---

## 📋 Checklist rápido (para marcar)

| # | Teste | OK? |
|---|---|---|
| A1 | Tags/Etiquetas fora do modal | ☐ |
| A2 | Duplicar funciona (grade) | ☐ |
| A3 | Duplicar funciona (tabela) | ☐ |
| A4 | Estoque mínimo salva (e 0 continua 0) | ☐ |
| B1 | Pedido do WhatsApp mostra **PIX** | ☐ |
| B2 | Filtro "Hoje" / "Ontem" correto | ☐ |
| B3 | "Pago" fora do status do pedido | ☐ |
| B4 | Filtro de pagamento (Pago/Pendente) | ☐ |
| B5 | Multi-seleção nos 3 filtros | ☐ |
| B6 | Canal "Manual" | ☐ |
| B7 | Filtros persistem ao voltar | ☐ |
| B8 | "Limpar filtros" não volta ao recarregar | ☐ |
| C1 | Aba "Conversa" do CRM ok | ☐ |
| D1 | Nenhuma tela branca no ERP | ☐ |

---

## 🔎 Se algo falhar

Mande **o item (ex.: B4)**, **o que você viu** e **o que esperava** — de preferência com print e o horário aproximado. Com isso eu localizo o arquivo e a linha direto.

**Ainda NÃO está neste push** (de propósito):
- **Item 4 — deletar pedido cancelado:** precisa do SDD (PRD/SPEC/WIRE) e da sua aprovação do WIRE. É o próximo da fila.
- **`tsconfig.json` / gate de tipos:** aguardando sua decisão (opções A ou B). O arquivo **não** entrou neste commit.
- **Pendência D' (`cliente_id` NULL nas conversas, 21/21):** aguardando sua decisão entre corrigir no **n8n** ou com **trigger** no banco.
- **ESLint:** aguardando sua decisão.

---

*Criado em 17/09/2026 pelo Orchestrator, após o push `4a434bf` e a verificação do deploy em produção.*
