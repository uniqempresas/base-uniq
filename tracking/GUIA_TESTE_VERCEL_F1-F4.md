# 🧪 GUIA DE TESTE NA VERCEL — Correções F1 a F4 (18/09/2026)

> **Para o fundador.** Estas eram correções de bugs reais — inclusive **dois que estavam escondidos** na "linha de base de 13 erros de tipo".
> **URL:** https://base-uniq.vercel.app
> **Gate desta rodada:** `tsc` **13 → 8 erros** · `npm run build` OK · prova no banco de que conta cancelada não conta no financeiro.

---

## A. FINANCEIRO — F1: editar conta a pagar (estava quebrado)

### A1. Editar
- **Faça:** `/financeiro/contas-pagar` → abrir uma conta **pendente** → editar (descrição, valor ou vencimento) → salvar.
- **Espere:** aviso **"Conta atualizada."** e o valor novo aparecendo na lista.
- **Antes:** a página chamava uma função que **não existia** (`undefined`) → o salvamento **não fazia nada**, sem aviso de erro. A ação "pagar" também estava caindo no caminho errado.

### A2. Pagar
- **Faça:** usar a ação **"Pagar"** numa conta a pagar.
- **Espere:** a conta passa a **paga**, com data de pagamento.
- **Antes:** usava a função errada (mesmo bug do A1).

---

## B. FINANCEIRO — F2: cancelar conta a receber

### B1. O cancelamento agora grava
- **Faça:** `/financeiro/contas-receber` → **cancelar** uma conta → **recarregar** a página.
- **Espere:** a conta continua **Cancelada** depois de recarregar.
- **Antes:** o cancelamento **não gravava nada** — e, pior, a conta cancelada era exibida como **PAGA** (havia um mapeamento `cancelado → pago` com o comentário "tratamento temporário" no código).

### B2. Cancelada não conta nos totais
- **Faça:** observar os KPIs de Contas a Receber antes e depois de cancelar uma conta.
- **Espere:** a conta cancelada **não entra** no total recebido nem no total em aberto.

### B3. Cancelada não vira "vencido"
- **Faça:** cancelar uma conta cujo vencimento **já passou**.
- **Espere:** continua exibindo **Cancelado** (cinza/neutro) — **não** vira "Em atraso".
- **Antes:** `calcularStatus` sobrescrevia o status pela data, então uma cancelada vencida viraria "vencido".

### B4. Botões somem na cancelada
- **Faça:** abrir uma conta cancelada.
- **Espere:** **não** aparecem os botões "Receber" (a receber) nem "Pagar" (a pagar).

### B5. DRE e Fluxo de Caixa
- **Faça:** conferir o **DRE** e o **Fluxo de Caixa** com uma conta cancelada no mês.
- **Espere:** ela **não** aparece em nenhum dos dois.
- **Prova já feita no banco:** uma conta a receber de **R$ 9.999** com status `cancelado` **não entrou** em "pagas" nem em "em aberto" — os dois conjuntos que o DRE e o Fluxo usam. Dado de teste removido.

---

## C. ESTOQUE — F3: o dashboard agora tem dados reais

### C1. Os números batem com a lista de produtos
- **Faça:** abrir `/estoque` e comparar com `/estoque/produtos`.
- **Espere:** **Total de Produtos**, **Valor em Estoque**, **Produtos com Estoque Baixo** e **Sem Estoque** batem com a realidade.
- **Antes:** o dashboard **inteiro era exemplo** — importava `PRODUTOS` de mock e não lia o banco. Mostrava um total de produtos e um valor de estoque que não existiam.

### C2. Lista de críticos com dados reais
- **Faça:** olhar "Produtos com Estoque Crítico".
- **Espere:** nomes, SKU, quantidade e **foto** dos produtos **reais** (antes eram produtos de exemplo).

### C3. Estados da tela
- **Faça:** abrir a tela e observar o carregamento. Se não houver sessão/empresa, ver o rodapé.
- **Espere:** aparece **esqueleto de carregamento** antes dos dados; sem empresa, aparece o **banner âmbar** "Mostrando dados de exemplo" (nunca tela em branco).

### C4. Movimentações Recentes (não é bug)
- **Espere:** esse bloco **continua com dados de exemplo**. Descobri que a própria `MovimentacoesPage` também usa exemplo e **não existe leitura real** da tabela `est_movimentacao` (só há gravação). Fica para uma lane futura criar o hook de leitura.

---

## D. CHATBOT — F4: a lista de conversas rola

### D1. Desktop
- **Faça:** `/chatbot` com **várias conversas** → rolar a lista.
- **Espere:** a lista **rola dentro do painel**; o título "Conversas" e o contador ficam **fixos**.
- **Antes:** com muitas conversas, as últimas eram **cortadas** — sem barra de rolagem (mesma causa da janela de conversa que corrigimos no item 9).

### D2. Celular (o caso crítico)
- **Faça:** rolar a lista com o dedo e tocar na última conversa.
- **Espere:** chega na última, o painel do chat não é empurrado e o layout não estoura.

---

## E. SANIDADE

### E1.
- **Faça:** passar por **Dashboard, Financeiro, Estoque, CRM, Métricas, Pedidos**.
- **Espere:** nenhuma tela em **branco**.

---

## 📋 Checklist

| # | Teste | ☐ |
|---|---|---|
| A1 | Editar conta a pagar salva | ☐ |
| A2 | Pagar conta a pagar funciona | ☐ |
| B1 | Cancelar conta a receber persiste | ☐ |
| B2 | Cancelada fora dos totais | ☐ |
| B3 | Cancelada não vira "vencido" | ☐ |
| B4 | Botões somem na cancelada | ☐ |
| B5 | Cancelada fora do DRE e do Fluxo de Caixa | ☐ |
| C1 | Dashboard de Estoque com números reais | ☐ |
| C2 | Críticos com produtos reais + foto | ☐ |
| C3 | Loading e banner de fallback | ☐ |
| C4 | Movimentações seguem exemplo *(esperado)* | ☐ |
| D1 | Lista de conversas rola (desktop) | ☐ |
| D2 | Lista de conversas rola (celular) | ☐ |
| E1 | Nenhuma tela branca | ☐ |

---

## 🔎 Se algo falhar

Mande **o item (ex.: B3)**, **o que você viu** e **o que esperava**. Localizo o arquivo e a linha direto.

**O que ficou de fora desta rodada (não autorizado ainda):**
- **F5 — RPC `registrar_venda`:** a forma de pagamento é resolvida sem filtrar empresa e sem `ORDER BY` (id não-determinístico com as linhas globais e as do tenant), e o fallback é incoerente (`'PIX'` no texto × `1` = Dinheiro no id).

---

*Criado em 18/09/2026 pelo Orchestrator.*
