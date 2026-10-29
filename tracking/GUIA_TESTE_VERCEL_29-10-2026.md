# 🧪 GUIA DE TESTE — Vercel (29/10/2026)

> **O que está no ar:** deploy do commit `84d3cdb` (estoque-v2 completo pela primeira vez em produção + emenda do modal Novo produto). Entry servido: `index-D_SNq4Aw.js`.
> **Prioridade 1 = a cadeia de demo do co-fundador** (o PLANO_7_DIAS tem gate amanhã 30/10 e sábado 31/10). Prioridade 2 = a passagem completa do estoque-v2, que nunca foi validada.

---

## ⏱️ 0. Antes de tudo (2 min)

1. Login **antes** de abrir qualquer tela (não logar na frente do co-fundador amanhã).
2. Hard refresh no celular/note (o entry mudou).
3. Dica da AGENTS.md: o fundador valida pelo celular — teste tudo em tablet estreito/portrait ou no próprio telefone.

---

## 🥇 BLOCO A — Cadeia de demo (10 min · gate de amanhã depende disso)

> Regra do plano de 7 dias: **não abrir `/dashboard`** na demo (é mock, mostra dados de loja de roupas). Entrar sempre por **`/crm/dashboard`**.

| # | Passo | Critério |
|---|---|---|
| A1 | Falar no WhatsApp da Doceê: *"oi, queria encomendar 2 caixas de brigadeiro"* | A MEL responde no escopo (doces) |
| A2 | Abrir `/crm/clientes` | O contato virou cliente com badge **WhatsApp** |
| A3 | Abrir `/vendas/pedidos` | O pedido aparece como **📥 Recebido** |
| A4 | Abrir `/financeiro/dre` | O mês corrente traz a venda (receita) |
| A5 | Abrir `/loja/docee` | **3+ produtos visíveis** com foto |
| A6 | Abrir `/estoque-v2` (Hoje) | Tela abre sem erro, card da Melissa aparece |
| A7 | Abrir `/financeiro` | Contas e KPIs com dado do mês (para não congelar na demo) |

Se **qualquer** passo falhar, registre aqui embaixo antes de testar o Bloco B:
(was blank — preencher no dia)

---

## 🥈 BLOCO B — Estoque V2 completo (nunca validado; 25–30 min · só depois do Bloco A)

### B1. Emenda de hoje — modal "Novo produto" (5 min · `/estoque-v2/produtos`)

| # | Passo | Critério |
|---|---|---|
| B1.1 | **No note/desktop:** FAB "Novo produto" | Modal **centralizado** na tela (não mais painel lateral colado à direita) |
| B1.2 | Clicar nos 2 cards de escolha | **Nada trava/clica morto** (era o bug: painel herdava `pointer-events: none`) |
| B1.3 | Criar um produto "Compro pronto" → salvar | Fecha, aparece na lista, toast de sucesso |
| B1.4 | Criar "Feito em casa/receita" → salvar | Banda de "montar ficha técnica" aparece; ficha pode ficar vazia sem erro |
| B1.5 | **No celular:** mesmo modal | Sheet de fundo com grabber no topo, tudo clicável |

**Por que é seguro testar criando:** a lista mostra o que você cadastrar; qualquer sujeira de teste sai com `private.limpar_dados_tenant_empresa('docee')` (preserva produtos/configurações — usar só se atrapalhar, pois apaga pedidos/financeiro).

### B2. Insumos (5 min · `/estoque-v2/insumos`)

- Lista abre com estoque atual e preço de custo.
- **Novo insumo** (FAB): pergunta **"como você compra"** e **"quanto tem em cada embalagem"** (sem jargão de fator) → recibo do tipo *"1 lata × 395 g"*.
- Chip **"+ Nova categoria"** dentro do modal cria categoria de insumo na hora.
- Entrar num insumo → **"Comprar de novo"** no fim do conteúdo (botão em fluxo, não barra fixa). No desktop ≥900px: pill flutuante centrada com largura do shell.

### B3. Nova compra (7 min · `/estoque-v2/compras/nova`)

- Wizard de **3 passos**; valor unitário × preço total funcionam **nos dois sentidos** (mude um, o outro recalcula).
- Fornecedor é **opcional** (sem fallback "Assai") — pode salvar rascunho rápido sem escolher.
- Botão **Salvar e receber agora**: recebimento dá baixa no estoque e cria conta a pagar.
- Item com embalagem sem conversão → portão/tradução pergunta na hora (não salva errado).

### B4. Receitas (4 min · `/estoque-v2/receitas`)

- **Modal Nova Receita**: nome + rendimento + toggle "venda" (SKU automático).
- Editor: custo/lote/margem aparecem **no card da Melissa** (sem barra fixa no rodapé).
- No desktop, sheets de ingredientes limitados (~520px centralizados).

### B5. Produção (5 min · `/estoque-v2/producao`)

- **Filtro por nome de receita** (digita "cone" acha "Cone…" mesmo sem acento).
- Produzir lote: card do **máximo que dá pra produzir**, peso final real na entrada, divergência vai para a observação.
- Estornar uma OP de teste → botão **Estornar** restaura estoque/custo (status vira ESTORNADA).

### B6. Margem (3 min · `/estoque-v2/margem`)

- 🔴 O bug conhecido era **tela branca**: deve abrir normal (se abrir branca, anotar o error).
- Mostra só o que é **"vendo isso"** (`exibir_vitrine`), com empty state orientando se vazio.

### B7. Dashboard fusion (3 min · `/estoque-v2/dashboard`)

- Comparativo v1 × v2 lado a lado, **sem substituir** o `/estoque` antigo.

### B8. Configurações (2 min · `/estoque-v2/configuracoes`)

- Abas **Produtos | Insumos** separadas (escopo novo por categoria).
- Arquivar categoria mostra a **contagem de uso** antes.

### B9. Simulador de preço (2 min · `/estoque-v2/produtos/:id/simulador`)

- Acessível pela tela Produtos → detalhe; margem recalcula com o custo da ficha.

---

## ✅ Critério global

- Zero tela branca, zero erro no console (se aparecer, copiar o texto).
- Os **5 gatilhos** do backend não mudaram — venda/produção/compra do B14/Fase 1–3 continua válida: Insumo → Compra → Receber → Receita → Produzir → Vender → Margem.

## ⏪ Rollback (se algo quebrar feio)

```bash
git revert 95a03cf   # só a emenda do modal (alteração de hoje)
# estoque-v2 em si = revert dos commits 5ca7ff1..d8b7cea (NÃO recomendado — módulo /estoque v1 segue intacto no ar)
```

---

*Gerado em 29/10/2026 com deploy verificado por conteúdo servido (assinatura do modal confirmada no chunk `ProdutosV2ListPage-ClcPri7W.js`). Related: `PLANO_7_DIAS_COFUNDADORES.md` §8 (checklist do dia anterior).*
