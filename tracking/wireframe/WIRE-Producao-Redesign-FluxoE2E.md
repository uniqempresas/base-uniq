# WIRE — Produção: Redesign do Fluxo End-to-End (insumo novo → primeira venda)

**Versão:** 1.0
**Data:** 15/10/2026
**Status:** APROVADO por delegação do fundador · Validado pelo orquestrador (contratos §3 e fricções §4 conferidos) · Pronto para Implementação
**Telas:** `/estoque/produtos` (modal produto · steps Insumo e Ficha Técnica) · `/estoque/compras/nova` · `/estoque/compras` (+ modal Receber) · `/estoque/produtos/:id` (aba Produção) · modal Produzir lote — **nenhuma rota nova**
**Referências:**
- Brief integral: `tracking/open-design/OPENDESIGN_PROMPT_FLUXO_PRODUCAO.md` (§2 fluxo atual · §3 contratos · §4 fricções · §5 pedido)
- Continuidade de estrutura/naming: `WIRE-Producao-Fase1-FichaTecnica.md` · `WIRE-Producao-Fase2-Compras.md` · `WIRE-Producao-Fase3-Produzir.md` · `WIRE-Producao-ModoReceita.md` · `WIRE-Estoque-B14-Movimentacoes.md`

> **Tese do redesign em uma linha:** a esteira não é uma tela nova — é **o próximo passo aparecendo dentro da tela onde o usuário já está**, com a conversão sempre visível e CTAs que corrigem a ordem (comprar → receber → produzir) em vez de erro genérico.

---

## 0. Como ler este documento

- **Mobile-first** (uso real: parceiro no celular). O desktop de cada tela **não é redesenhado aqui**: mantém o layout dos WIREs Fase 1–3 e recebe apenas o **delta** listado por tela (§4.x "Desktop").
- Este WIRE descreve **só o delta** sobre os WIREs anteriores. O que já está desenhado lá (Linha Rápida, nota de papelaria, rascunho sobrevive a refresh, chips de modo receita × grama, semáforo) continua válido e não é repetido.
- Zero estética: sem cor, sem token, sem espaçamento. Hierarquia por posição e peso de texto (identidade visual → `DESIGN.md`).
- Termos canônicos mantidos: **insumo · composto · ficha técnica · "Essa receita rende" · Linha Rápida · "Cadastrar na hora" · extrato · ordem de produção**.

---

## 1. Mapa de fricção antes → depois (por etapa)

Ancorado **exclusivamente** nos itens do §4 do brief (números entre parênteses). Nenhuma fricção foi inventada.

| Etapa (§2 do brief) | Fricção §4 | Antes (hoje) | Depois (nesta proposta) |
|---|---|---|---|
| **A · Cadastrar insumo** | F1 · F2 | "un" vs "Unidade" travou o cadastro; a pergunta "1 [compra] contém quantas [estoque]?" não é óbvia | Unidades viram **select do catálogo** (não texto livre); bloco "Como você conta" com a pergunta literal e **legenda sempre visível** `1 lata = 395 g`; custo some do form de insumo (nasce da compra — contrato 1) |
| **B/C · Ficha técnica** | F3 · F4 | Números por grama quebrados (0,6639 g) confundem; "rende" novo, usuário não sabe que deve preencher; perda sem sentido | Default é o **modo receita**; **"Essa receita rende" com sugestão automática** (soma dos gramas) editável; forma por grama **recolhida** em "ver guardado por grama"; perda ganha a linha **"por receita com perda: 415 g"** |
| **D · Criar compra** | F1 · F2 · F8 | Compra gravada sem conversão corrompeu estoque/custo por baixo; item sem tradução visível | Cada linha da nota mostra **"→ entra 790 g no estoque (1 lata = 395 g)"**; **portão de conversão**: item sem fator abre a pergunta na própria linha e **bloqueia Salvar** até resolver (grava via "salvar produto", gatilho existente) |
| **E · Receber a compra** | F2 · F5 | Receber era um botão na lista; usuário pulava direto pra produzir | "Receber" é o **CTA primário** do card PENDENTE com a nota "estoque e custo só entram quando você receber"; modal repete a conversão por item; **banda de sucesso** pós-RPC: "dá pra produzir agora: Recheio de Limão — 1 receita [Ir produzir →]" |
| **F · Produzir** | F4 · F5 · F6 · F7 | Produção escondida em aba; recusa com erro seco; "custo pendente de compra" enganoso p/ composto; 1ª produção bloqueada por perda | Aba ganha o card **"com o estoque atual dá pra produzir N receitas"** (contado **com perda**); texto corrigido (**"pendente de produção"** p/ composto); bloqueio vira **guia com CTA**: compra pendente do insumo → `[Receber p/ produzir]`; sem compra → `[Ir comprar]` |
| **G · Vender** | — | nenhuma fricção registrada no §4 | **nada muda** (§6.2) |

---

## 2. Proposta de fluxo — 1 frase por tela

| # | Tela | Proposta em 1 frase |
|---|---|---|
| T1 | Modal produto · passo **Insumo** | Cadastrar insumo pergunta a única coisa que importa — "1 [lata] contém quantos [g]?" — com select de unidades do catálogo, legenda permanente `1 lata = 395 g` e, ao salvar, uma banda que aponta o próximo passo (registrar a compra). |
| T2 | Modal produto · passo **Ficha Técnica** | A ficha vive **na linguagem da receita**: os números por grama nunca são a default, "Essa receita rende" vem preenchido por sugestão (soma dos ingredientes) e a perda aparece como "total por receita com perda". |
| T3 | `/estoque/compras/nova` | Toda linha da nota traduz a compra para o estoque ("→ entra 790 g"); insumo sem conversão **ajusta na própria linha antes de salvar** — a tela nunca deixa gravar compra que corrompe custo. |
| T4 | `/estoque/compras` + modal Receber | Receber é o passo inevitável e visível: card PENDENTE chama "Receber", o modal mostra o que entra com conversão, e o sucesso devolve **"o que você já consegue produzir agora"**. |
| T5 | `/estoque/produtos/:id` · aba **Produção** | O topo da aba responde "até onde meu estoque alcança" (máximo de receitas, contado com perda) e, quando não alcança, nomeia o que falta com o CTA certo — ir comprar / receber compra X / produzir o composto anterior. |
| T6 | Modal **Produzir lote** | O campo de quantidade conhece o máximo do estoque, o semáforo explica a linha vermelha com o número do "por quê" (com perda), e o bloqueio oferece a saída em botão — nunca termina em erro sem caminho. |

### 2.1 Avaliação dos 4 candidatos do §5.2 do brief

| Candidato | Decisão | Razão (1 linha) |
|---|---|---|
| Esteira única "insumo novo" (cadastro + compra + receber em sequência guiada) | **Substituído** por bandas de próximo passo + CTAs dentro das telas existentes | Zero rota nova e zero fluxo paralelo de compra — a sequência guiada é cumprida pelas telas que já existem, com menos telas e menos conceitos (critério de desempate do brief). |
| Ficha com sugestão automática de rendimento + tradução permanente receita ↔ estoque | **Adotado**, com refinamentos | Sugestão = soma dos gramas (editável, nunca auto-salva); por grama fica recolhida — tradução visível só na direção que o usuário pensa (F3). |
| Produzir lote mostrando o máximo que o estoque alcança | **Adotado** | Resolve F4/F6 junto: o máximo já é contado com perda, então "comprei exatamente a receita" vira um "falta 20 g — ir comprar" claro, não uma recusa muda. |
| CTAs de contexto ("ir comprar" / "receba a compra X para produzir") | **Adotado e estendido** | Estendido para o lado que o brief não cobria: pós-recebimento ("dá pra produzir agora") e compostos de nível 2 ("produza o Recheio antes do Cone"). |

---

## 3. Roteamento

| Rota | Tela | Situação |
|---|---|---|
| `/estoque/produtos` | `ProdutoFormModal` — passos Insumo (T1) e Ficha Técnica (T2) | **existente** · conteúdo alterado |
| `/estoque/compras/nova` | `NovaCompraPage` (T3) | **existente** · conteúdo alterado |
| `/estoque/compras` | `ComprasPage` + modal Receber (T4) | **existente** · conteúdo alterado |
| `/estoque/produtos/:id` | `ProdutoDetalhePage` — aba Produção (T5) + modal Produzir lote (T6) | **existente** · conteúdo alterado |

**Nenhuma rota nova.** Parâmetros de contexto (estado de front, não backend):
- `/estoque/compras/nova?insumo=<id>` → pré-preenche a Linha Rápida com o insumo (chegando do CTA "registrar compra").
- `/estoque/compras?receber=<compraId>` → abre direto o modal Receber daquele item (chegando do CTA "receba a compra X para produzir").
- `/estoque/produtos/:id?aba=producao` → abre o detalhe já na aba Produção (chegando do CTA "Ir produzir").

---

## 4. Telas

### T1 — Cadastro de INSUMO (`ProdutoFormModal`, passo Dados)

**Frase:** cadastrar insumo pergunta só "como você conta" — o que guarda, o que compra, quanto cabe — e ao salvar aponta a compra.

```
┌─ Novo Produto ──────────────×───┐
│ Nome *                          │
│ [ Leite Condensado ________ ]   │
│                                 │
│ NATUREZA                        │
│ (•) Insumo   matéria-prima,     │
│              nunca é vendido    │
│ ( ) Composto produzido por      │
│              ficha técnica      │
│ ( ) Simples  "compro 1,vendo 1" │
│                                 │
│ ── COMO VOCÊ CONTA ──────────── │
│ Guarda no estoque    [ g ▾ ]    │
│   (o que você pesa/confere)     │
│ Compra em            [ lata ▾ ] │
│   (o que o fornecedor entrega)  │
│ 1 lata contém        [ 395 ] g  │
│ ┌─────────────────────────────┐ │
│ │ 1 lata = 395 g              │ │
│ │ o custo deste insumo nasce  │ │
│ │ da primeira compra          │ │
│ └─────────────────────────────┘ │
│ [        Salvar insumo       ]  │
└─────────────────────────────────┘
```

Sucesso (substitui a tela ao salvar — a banda é o contrato da esteira):

```
┌─ ✓ Leite Condensado cadastrado ──┐
│ Estoque: 0 g. Insumo ganha       │
│ quantidade e custo na COMPRA.    │
│                                  │
│ [ Próximo: registrar compra → ]  │
│ [ fechar ]                       │
└──────────────────────────────────┘
```

**Campos (delta sobre Fase 2 §3):**

| Campo | Tipo | Validação |
|---|---|---|
| Guarda no estoque (unidade) | **Select — catálogo de unidades** (`/estoque/configuracoes`) | obrigatória; texto livre removido (F1: "un" ≠ "Unidade") |
| Compra em | Select — mesmo catálogo; opcional | se preenchida, fator obrigatório |
| 1 [compra] contém [N] [estoque] | number | > 0; obrigatório se "Compra em" preenchida; mesma unidade → sugere 1 |

**Ações (delta):**

| Ação | Gatilho | Resultado |
|---|---|---|
| Salvar insumo | submit | gatilho **salvar produto** (existente) → banda de sucesso com CTA `?insumo=<id>` da compra; estoque 0 |
| Input de "Preço de custo" | — | **removido para natureza insumo** (o custo nasce da COMPRA — contrato 1; simples mantém o campo como hoje) |

**Estados:**

| Estado | Apresentação |
|---|---|
| Loading | skeleton dos campos do modal (padrão F1) |
| Empty | criação: formulário limpo; unidades do catálogo ainda não cadastradas → link "definir unidades em Configurações" |
| Error | validação inline (ex.: fator ≤ 0; mesma unidade com fator ≠ 1 avisa "1 un = 1 un? deixe vazio") + falha ao salvar → banner + [Tentar novamente], nada gravado |
| Success | banda "✓ cadastrado · estoque 0 · próximo: registrar compra" |

**Desktop:** modal central do WIRE Fase 1 §2 + bloco "COMO VOCÊ CONTA" no lugar do grupo atual (Fase 2 §3); legenda em caixa sob os campos; resto inalterado.

---

### T2 — Ficha Técnica no modo receita (passo do `ProdutoFormModal`)

**Frase:** a ficha se escreve na receita de verdade — rende sugerido, tradução sempre visível, perda com número claro por componente.

```
┌─ Ficha Técnica — Recheio ────×──┐
│ modo RECEITA (como você faz)    │
│ [🔍 buscar insumo…………]         │
│ ┌─────────────────────────────┐ │
│ │ Leite Condensado            │ │
│ │ [ 395 ] g = 1 lata  [5]%perda│ │
│ │ → por receita c/ perda:415 g│ │
│ ├─────────────────────────────┤ │
│ │ Creme de Leite              │ │
│ │ [ 200 ] g = 1 caixa [5]%perda│ │
│ │ → por receita c/ perda:210 g│ │
│ ├─────────────────────────────┤ │
│ │ Limão                       │ │
│ │ [   2 ] un          [0]%perda│ │
│ └─────────────────────────────┘ │
│ [+ Componente]                  │
│                                 │
│ ESSA RECEITA RENDE [ 595 ] g    │
│  ↳ soma dos ingredientes: 595 g │
│  (ajuste se a receita reduz)    │
│ ┌─────────────────────────────┐ │
│ │ tradução: 1 receita → 595 g │ │
│ │ no estoque                  │ │
│ │ [ ver como fica guardado ▾ ]│ │
│ │   (1 g recheio = 0,66 g     │ │
│ │    leite + 0,34 g creme…)   │ │
│ └─────────────────────────────┘ │
│ [        Salvar ficha        ]  │
└─────────────────────────────────┘
```

Sucesso — banda pós-salvar que já pergunta o próximo passo real:

```
│ ✓ Ficha salva                    │
│ Leite Cond. está com estoque 0.  │
│ [ Próximo: comprar os insumos → ]│
```

**Regras (delta sobre ModoReceita §3):**

- **Sugestão automática de "rende"**: `soma = Σ quantidades em g/ml dos componentes` — aparece como anotação e como valor pré-escrito **editável**; nunca é salva sem o usuário salvar a ficha. Composto **por unidade** (Cone): sugestão fixa `1` ("essa receita rende 1 unidade").
- Linha "por receita com perda": `qtd × (1 + perda%)` — só leitura, arredondada; é o número que a produção vai cobrar (F4).
- "Ver como fica guardado" (expansão colapsada): revela a forma por grama guardada pelo banco — transparência do contrato 3 preservada sem ser a default (F3).
- Trocar componente pela busca mantém as linhas; remover zera a sugestão.

**Campos:**

| Campo | Tipo | Validação |
|---|---|---|
| Qtd por receita | number + unidade do componente | > 0 |
| Perda % | number | 0–100; acima de 50 avisa (padrão F1) |
| Essa receita rende | number | > 0 **obrigatório p/ composto em g/ml** (já era obrigatório desde 15/10); sugestão editável |

**Ações:** Salvar ficha → gatilho existente (salvar produto/ficha); lista recarrega; ao voltar do CTA da compra, a ficha continua salva (rascunho do produto não regride).

**Estados:**

| Estado | Apresentação |
|---|---|
| Loading | skeleton das linhas de componente (embed carregando — padrão F1) |
| Empty | "Nenhum componente ainda — adicione pela busca acima"; campo "rende" oculto até haver 1 componente |
| Error | RPC falha → banner + [Tentar novamente] (nada gravado — atômico); "rende" sem valor → inline "diga quanto a receita rende (ex.: 595 g)" |
| Success | banda ✓ + próximo passo (compra pendente detectada por estoque 0 dos componentes) |

**Desktop:** tabela do WIRE Fase 1 §2 adaptada: colunas ganham a sub-linha "com perda" e o cabeçalho "modo RECEITA"; painel "rende" + tradução abaixo da tabela.

---

### T3 — Nova Compra (`/estoque/compras/nova`) com portão de conversão

**Frase:** a Linha Rápida continua igual, mas toda linha traduz para o estoque e insumo sem conversão **se resolve aqui, antes de salvar**.

```
┌← Nova Compra ────────[salvar]───┐
│ Fornecedor                      │
│ [🔍 Mercado Local ✓]           │
│  sem cadastro? [Cadastrar…]    │
│ ── LINHA RÁPIDA (topo fixo) ─── │
│ [🔍 item…]                      │
│ qtd [2] lata  R$ [62,00] [＋]   │
│ ── NOTA ────────────────────────│
│ ┌ Leite Condensado ───────────┐ │
│ │ 2 × R$ 31,00 = R$ 62,00     │ │
│ │ → entra 790 g no estoque     │ │
│ │   (1 lata = 395 g)          │ │
│ │ [editar]  [remover]         │ │
│ └─────────────────────────────┘ │
│ ┌ Limão ── ⚠ ajuste ──────────┐ │
│ │ 8 un · R$ 8,00              │ │
│ │ falta a conversão:          │ │
│ │ 1 un (compra) contém        │ │
│ │ [ 1 ] ▾ un (estoque)?       │ │
│ │ 1 un = 1 un → entra 8 un    │ │
│ │ [confirmar]  [cancelar]     │ │
│ └─────────────────────────────┘ │
│ TOTAL R$ 70,00                  │
│ [        Salvar compra       ]  │
└─────────────────────────────────┘
```

**Regras (delta sobre Fase 2 e a Tela C4/Linha Rápida):**

- Linha de item ganha a **tradução obrigatória**: "→ entra {qtd × fator} {un estoque} (1 {unCompra} = {fator} {un})". É a legenda do contrato 2 no único lugar onde o erro acontece (F8).
- **Portão de conversão**: ao adicionar um insumo **sem** unidade de compra/fator, a linha abre já no modo ajuste (selects do catálogo + fator, como no T1). `[confirmar]` grava via **salvar produto** (gatilho existente) e volta a linha para o estado normal. Nenhum gatilho novo de backend.
- `Salvar compra` fica **bloqueado com motivo visível** enquanto existir linha no portão: "1 item sem conversão — ajuste para salvar" (o sistema confere **por dentro**, F8; "espiar depois" nunca é pedido).
- Item repetido soma na mesma linha (como hoje); edição de qtd/valor recalcula a tradução ao vivo.

**Estados:**

| Estado | Apresentação |
|---|---|
| Loading | skeleton da nota + Linha Rápida disponível |
| Empty (nota) | "Nenhum item ainda — use a Linha Rápida acima"; CTA some, Salvar desabilitado com motivo |
| Error | salvar falhou → banner + [Tentar novamente], nota preservada; linha com valor inválido → inline na linha |
| Success | banda: "✓ Compra salva (PENDENTE) — estoque e custo entram no recebimento. [Receber agora →]" (abre o modal T4 com `?receber=<id>`) |

**Desktop:** página existente do Fluxo A (nota em tabela); delta = coluna "entra no estoque" + estado de portão na própria linha.

---

### T4 — Compras + Receber (`/estoque/compras`)

**Frase:** receber deixa de ser botão perdido na lista e vira o passo que fecha a compra — com o que entra, a conversão, e o que já dá pra produzir.

Card PENDENTE (lista):

```
┌─ Compras ────────────[+ Nova]───┐
│ Pendentes: 1 · R$ 70,00         │
├─────────────────────────────────┤
│ ┌ Mercado Local ──────────────┐ │
│ │ NF — · 15/10 · R$ 70,00     │ │
│ │ 2 itens                     │ │
│ │ ● PENDENTE                  │ │
│ │ estoque e custo só entram   │ │
│ │ quando você RECEBER         │ │
│ │ [ Receber ]  [Detalhes]     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

Modal Receber (delta sobre Fase 2 §2.4):

```
┌─ Receber · Mercado Local ──×────┐
│ entra no estoque:               │
│ · Leite Cond +790 g (2× lata)   │
│ · Limão        +8 un            │
│ custo médio: recalcula sozinho  │
│ nasce conta a pagar R$ 70,00    │
│ Recebimento   [15/10/2026]      │
│ Venc. conta   [14/11/2026]      │
│ [        Receber agora       ]  │
└─────────────────────────────────┘
```

Sucesso pós-RPC (`receber_compra` — gatilho inalterado):

```
┌─ ✓ Recebida · Mercado Local ────┐
│ Leite Cond. 790 g · Limão 8 un  │
│ custo atualizado · conta criada  │
│                                 │
│ dá pra produzir agora:          │
│ Recheio de Limão — 1 receita    │
│ [ Ir produzir → ]               │
└─────────────────────────────────┘
```

**Regras:**

- Linha do modal repete `quantidade × fator` **com a legenda** (F2) — o usuário confere a conversão antes, não depois.
- **Banda "dá pra produzir agora"**: o front cruza os insumos que entraram com as fichas dos compostos que os usam e mostra o **máximo de receitas** de cada um (máx 2 compostos, ordenado pelo maior); `[Ir produzir →]` abre `/estoque/produtos/:id?aba=producao`. Cálculo 100% estado de tela — nenhuma chamada nova. Sem composto habilitado → banda vira "estoque e custo atualizados".
- Compra RECEBIDA não re-oferece nada (idempotência como hoje).

**Estados:**

| Estado | Apresentação |
|---|---|
| Loading | skeleton de cards (refetch não refaz layout — regra HOTFIX 06/10) |
| Empty | "Nenhuma compra ainda — registre a primeira compra de insumo" + [+ Nova] |
| Error | lista: banner + [Tentar novamente] · modal: RPC falha → "não foi possível receber; nada mudou" + [Tentar novamente] (transação all-or-nothing) |
| Success | card vira ✓ RECEBIDO + banda com "dá pra produzir agora" |

**Desktop:** tabela da Fase 2 §2.1; coluna Ação com [Receber] primário; banda de sucesso como alerta discreto sob a linha expandida.

---

### T5 — Aba Produção (`/estoque/produtos/:id`, composto)

**Frase:** o topo da aba responde "quanto meu estoque alcança" — e quando não alcança, nomeia o que falta com o botão que resolve.

```
┌← Recheio de Limão · composto ───┐
│ [Ficha] [PRODUÇÃO] [Extrato]    │
├─────────────────────────────────┤
│ custo/un: pendente de PRODUÇÃO  │
│ nasce quando o 1º lote for      │
│ produzido                       │
├─────────────────────────────────┤
│ estoque dos insumos             │
│ Leite Cond.  790 g  = 2 lata    │
│ Creme Leite  400 g  = 2 caixa   │
│ Limão          8 un             │
├─────────────────────────────────┤
│ ┌ COM O ESTOQUE ATUAL ────────┐ │
│ │ dá pra produzir: 1 receita  │ │
│ │ ≈ 595 g                     │ │
│ │ limite: Leite Condensado    │ │
│ │ (415 g/receita, com perda)  │ │
│ └─────────────────────────────┘ │
│ [        Produzir lote        ] │
├─────────────────────────────────┤
│ histórico de produção           │
│ nenhum lote ainda — o 1º        │
│ apura o custo                   │
└─────────────────────────────────┘
```

Variante de bloqueio — insumo sem estoque e **sem** compra pendente (caso F4 "comprei exatamente a receita"):

```
│ ┌ AINDA NÃO DÁ PRA PRODUZIR ──┐ │
│ │ falta Leite Condensado:     │ │
│ │ precisa 415 g p/ 1 receita  │ │
│ │ (395 g + 5% perda)          │ │
│ │ estoque: 395 g — falta 20 g │ │
│ │ [ Comprar mais leite → ]    │ │
│ └─────────────────────────────┘ │
```

Variante — falta coberta por compra **PENDENTE** (caso F5 "produzir antes de receber"):

```
│ │ estoque: 0 g — mas a compra │ │
│ │ Mercado Local (PENDENTE)    │ │
│ │ entrega 790 g:              │ │
│ │ [ Receber p/ produzir ]     │ │
│ │ ou [ Ir comprar → ]         │ │
```

Variante — componente é **composto** sem estoque (Cone consome Recheio):

```
│ │ falta Recheio de Limão: 0 g │ │
│ │ produzíveis agora           │ │
│ │ [ Produzir o Recheio → ]    │ │
```

**Regras:**

- Card "COM O ESTOQUE ATUAL" (novo, cálculo no front): `máx = mínᵢ ⌊estoqueᵢ ÷ (qtd_receitaᵢ × (1+perdaᵢ))⌋` — **com perda embutida**, é a resposta da F4; nomeia o insumo-limite. Sem custo nos insumos, o card ainda vale: "dá pra produzir 1 receita · custo se apura na produção".
- Texto de custo corrigido: composto → **"pendente de produção"**; insumo → "pendente de compra" (F7; já anunciado no ModoReceita — aqui vira padrão da tela).
- CTA do card de bloqueio: pendência de **insumo** → `[Receber p/ produzir]` (existe compra pendente daquele insumo?) senão `[Ir comprar →]` (`?insumo=<id>`); pendência de **composto** → `[Produzir o <composto> →]`.
- `Produzir lote` abre o modal T6 com o modo e a quantidade já acertados.

**Estados:**

| Estado | Apresentação |
|---|---|
| Loading | skeleton da aba (tela não refaz layout no refetch) |
| Empty | composto nunca produzido: "nenhum lote ainda — o 1º apura o custo" + card do máximo |
| Error | dados de insumos falharam → banner + [Tentar novamente]; sem ficha técnica → "defina a ficha primeiro [Abrir ficha]" |
| Success | card do máximo + [Produzir lote]; fallback demo → banner "dados de exemplo" (padrão B14) |

**Desktop:** layout Fase 3 §2.1; o card do máximo substitui o bloco de custo como primeira linha da aba; variantes de bloqueio ocupam o mesmo card.

---

### T6 — Modal Produzir lote

**Frase:** o modal conhece o máximo do estoque antes de você errar, explica o vermelho com o número exato e nunca termina em beco sem saída.

```
┌─ Produzir · Recheio de Limão ×──┐
│ modo  [ 1 receita ] [ grama ]   │
│ quantas receitas [ 1 ] máx: 1   │
│ data         [15/10/2026]       │
│ vai consumir (ficha c/ perda)   │
│ Leite Cond 415 g de 790 g   ✓   │
│   (395 g + 5% perda)            │
│ Creme      210 g de 400 g   ✓   │
│ Limão        2 un de   8 un ✓   │
│ ─────────────────────────────── │
│ custo estimado: R$ 13,67        │
│ (o real é apurado ao produzir)  │
│ [         Produzir          ]   │
└─────────────────────────────────┘
```

Bloqueio — quantidade acima do estoque:

```
│ quantas receitas [ 3 ] máx: 1 ⚠ │
│ Leite Cond 1.245 g de 790 g ✗   │
│ ┌ NÃO ALCANÇA ────────────────┐ │
│ │ 3 receitas pedem 1.245 g;   │ │
│ │ estoque tem 790 g.          │ │
│ │ [ Usar máximo (1) ]         │ │
│ │ [ Receber compra X… ]*      │ │
│ │ [ Ir comprar → ]            │ │
│ └─────────────────────────────┘ │
│ [Produzir desabilitado]         │
```

\* CTA "Receber compra" só aparece quando existe PENDENTE que cobre o insumo faltante (mesma regra do T5).

**Regras (delta sobre Fase 3 §2.3 e ModoReceita):**

- **Chip `máx: N`** ao lado da quantidade, calculado com perda; `[Usar máximo]` escreve N no campo — a sugestão do §5.2-3 realizada.
- Semáforo igual ao de hoje (✓/✗ por linha), mas a linha ✗ **explicita a conta**: `qtd × (1+perda)` vs estoque — o "por quê" da F4, sem jargão.
- Modo grama: `máx g = N receitas × rende`; tudo que excede acende o mesmo bloqueio.
- `[Produzir]` → RPC `registrar_producao` **inalterada**; recusada por saldo (rede de segurança) → mesma banda "NÃO ALCANÇA" com os CTAs, nunca texto cru do banco.
- Sucesso: toast "Produção registrada: +595 g · custo R$ 0,0230/g" → refetch; se existir composto que consome este (Cone), banda discreta "Agora dá pra montar: Cone de Limão [produzir →]" (fechar a esteira multinível).

**Estados:**

| Estado | Apresentação |
|---|---|
| Loading | skeleton das linhas de consumo |
| Empty | ficha sem componentes → "monte a ficha primeiro [Abrir ficha]" |
| Error | banda NÃO ALCANÇA (bloqueio) / falha RPC → "erro ao registrar; nada foi baixado" + [Tentar novamente] |
| Success | toast + histórico e extrato atualizados + banda do próximo composto |

**Desktop:** modal central da Fase 3 §2.3 com o chip `máx` e a banda de bloqueio; mesma lógica.

---

## 5. O que muda no front — lista fechada

**Rotas:** nenhuma criada, nenhuma removida. Só query-params de contexto: `?insumo=`, `?receber=`, `?aba=`.

1. **T1 · `ProdutoFormModal` (insumo):** unidades viram **select do catálogo**; bloco "Como você conta" com pergunta literal + legenda `1 {compra} = {fator} {estoque}` permanente; **campo "Preço de custo" removido para insumo**; banda pós-salvar com CTA "registrar compra".
2. **T2 · Ficha Técnica:** sugestão automática editável de "Essa receita rende" (= 1 p/ por-unidade); linha "por receita com perda" por componente; painel de tradução com forma por grama **recolhida**; banda pós-salvar apontando a compra quando componente tem estoque 0.
3. **T3 · `NovaCompraPage`:** linha de tradução na nota ("→ entra X g · legenda"); **portão de conversão** por linha (grava via salvar produto) e **bloqueio do Salvar** com motivo.
4. **T4 · `ComprasPage` + modal Receber:** nota "estoque e custo só entram quando receber" no card PENDENTE; linhas com conversão no modal; **banda de sucesso "dá pra produzir agora" + [Ir produzir]** (máx 2 compostos).
5. **T5 · aba Produção:** card **"com o estoque atual dá pra produzir N"** (mín ⌊…⌋ com perda); **estados de bloqueio com CTA contextual** (ir comprar / receber X / produzir o composto anterior); texto de custo do composto corrigido para **"pendente de produção"**.
6. **T6 · modal Produzir:** chip `máx: N` + `[Usar máximo]`; linha ✗ com a conta da perda; banda NÃO ALCANÇA com CTAs; banda pós-produção oferecendo o composto nível 2.
7. **Copy (transversal):** F7 em todo ponto de leitura ("pendente de produção" p/ composto; "pendente de compra" só p/ insumo).
8. **Validadores (zod):** unidade de compra via catálogo; fator obrigatório quando unidade de compra presente; mesma unidade → fator 1 sugerido; "rende" obrigatório p/ composto em massa (mantém 15/10).

## 6. O que explicitamente NÃO muda

1. **Backend inteiro** (contrato §3-5): os únicos gatilhos seguem sendo **salvar produto · salvar compra · receber compra (`receber_compra`) · produzir lote (`registrar_producao`) · contabilizar venda (`registrar_venda`)**. Nenhuma API/campo novo, nenhuma mudança de semântica de perda ou média ponderada.
2. **Rotas**: nada criado/removido; deep-links são só parâmetro de tela.
3. **Vender (G)**: Novo Pedido, picker sem insumos, confirmar pagamento, contabilizar venda — **zero mudança**.
4. **Extrato** (`/estoque/movimentacoes`, B14): estrutura e filtros como estão; as novas movimentações já aparecem pelo caminho atual do banco.
5. **Estrutura da compra**: Linha Rápida frozen, "Cadastrar na hora", item repetido soma, rascunho sobrevive a refresh, status PENDENTE/RECEBIDO/CANCELADO.
6. **Naturezas e vitrine**: insumo nunca vira vendável; Simples mantém custo digitado à mão; badge de natureza da Fase 1.
7. **Modo receita × grama do ModoReceita** (chips, helpers `toReceita`/`deReceita`/`formatarQtd`) — a proposta usa o que já existe e só acrescenta sugestão/tradução/CTAs.
8. **Layout desktop geral** das telas (herda Fase 1–3; deltas descritos por tela).

---

## 7. Responsividade

- **Mobile (uso principal — parceiro em loja):** tudo em coluna única; modais = bottom-sheet com handle, alvos ≥ 40px; Linha Rápida frozen no topo; bandas de próximo passo full-width no rodapé da tela.
- **Desktop:** modais centralizados; nota da compra em tabela com coluna de tradução; aba Produção ocupa o painel atual; bandas viram Alert sob o header.
- Padrão 3→2→1 do projeto mantido; nada de grid novo.

## 8. Acessibilidade

- Legenda de conversão e banda "dá pra produzir agora": `role="status"` (região `aria-live`), texto — não só cor.
- Selects de unidade: `aria-label` completo ("unidade de compra do Leite Condensado").
- Portão de conversão na linha: foco cai no primeiro campo ao abrir; ESC cancela a adição (linha removida, nada gravado).
- Chips de modo (receita/grama) mantêm `aria-pressed`; banda de bloqueio da produção anuncia o motivo para leitores de tela.
- CTA de navegação ([Ir produzir →]) é link com destino óbvio no texto (não "clique aqui").

## 9. Componentes reutilizáveis (novos — só front)

| Componente | Props | Onde |
|---|---|---|
| `LegendaConversao` | `unCompra, fator, unEstoque` → renderiza "1 lata = 395 g" | T1 · T3 · T4 |
| `FaixaProximoPasso` | `titulo, descricao, acao{label,href}` | T1 · T2 · T3 · T4 (bandas de sucesso) |
| `PortaoConversao` | `produto` (sem fator) · `onConfirmado` | T3 |
| `CardMaxProduzir` | `produto` (com ficha) · `estoques` → `receitasMax, limite` | T5 · T6 |
| helpers `perdaAplicada(qtd, perdaPct)` / `receitasMaximas(ficha, estoques)` | — | cálculo de front puro |

Reuso mantido: `ProducaoTab`, `ProdutoFormModal`, bottom-sheet padrão Financeiro/Pedidos, busca client-side sobre `useProdutos`, `formatarQtd`/`toReceita`/`deReceita`.

## 10. Decisões assumidas

*(WIRE aprovado por delegação do fundador nesta rodada — cada decisão tomada e justificada; desempate = menos telas e menos conceitos simultâneos, §5.2 do brief.)*

- **D1 — Esteira como bandas + CTAs nas telas existentes, não wizard novo:** evita um segundo fluxo de compra paralelo ao que já existe e cumpre a sequência guiada com zero rota nova.
- **D2 — "Rende" com sugestão = soma dos gramas, editável, nunca auto-salva:** o usuário sempre sabe o que preencher (F3) sem perder o controle do número real da receita.
- **D3 — Forma por grama recolhida em "ver como fica guardado":** transparência do contrato 3 preservada sob demanda; default = linguagem em que a pessoa pensa (F3).
- **D4 — Unidades por catálogo em select, não texto livre:** "un" vs "Unidade" deixa de ser possível (F1).
- **D5 — Portão de conversão na compra bloqueia o Salvar:** a conferência acontece por dentro, no único momento em que o erro corrompia tudo (F8), escrevendo só pelo gatilho existente "salvar produto".
- **D6 — Perda tratada em dois espelhos, nunca na regra do banco:** linha "com perda" na ficha (entendimento, F4) e "máximo produzível" já descontando perda na produção (ação) — a RPC continua baixando com perda como hoje; "comprei exato" vira "falta 20 g → ir comprar", não erro.
- **D7 — Produção fica na aba do detalhe:** a descoberta da esteira é resolvida pela banda pós-recebimento e pelos CTAs de bloqueio (F5/F6), sem criar tela de "Produção" nova.
- **D8 — Copy de custo corrigida:** "pendente de produção" para composto; "pendente de compra" só faz sentido para insumo (F7).
- **D9 — Preço de custo some do cadastro de insumo:** contrato 1 diz que o custo nasce da COMPRA; o campo atual convidava a digitá-lo (insumo), mantido para Simples.
- **D10 — Venda, extrato e estrutura da compra intocados:** nenhuma fricção do §4 mora ali; mexer seria mudança sem ganho.

## 11. Handoff — checklist

- [x] Rotas listadas (nenhuma criada; deep-links documentados)
- [x] Mobile desenhado para todas as 6 telas · desktop descrito como delta sobre WIREs Fase 1–3 (esta rodada é mobile-first por decisão do orquestrador)
- [x] 4 estados (loading/empty/error/success) por tela
- [x] Campos com tipo + validação · ações com gatilho + resultado (5 gatilhos, nenhum novo)
- [x] Mapa fricção↔§4 completo (F1–F8, nada inventado) · lista fechada do que muda / não muda
- [x] Sem token de cor, sem JSX/CSS, sem chamada de API inventada
