# WIRE — Apresentação Comercial UNIQ Empresas (rota `/apresentacao`)

> **Documento de wireframe ASCII — estrutura e função. NÃO é design visual polido.**
> O design real é criado no OpenDesign; no repositório entrega-se o esqueleto.

> **PRD:** `tracking/plans/PRD-ApresentacaoComercial.md` (✅ aprovado pelo fundador em 25/09/2026)
> **SPEC:** `tracking/specs/SPEC-ApresentacaoComercial.md` (contrato técnico: tipos, 8 layouts, navegação, tokens)
> **WIRE:** este documento
> **Status:** 🔶 Rascunho — **aguarda aprovação do fundador** para liberar a implementação
> **Regra de ouro:** sem WIRE aprovado, não se escreve código de tela.
> **Base visual:** v1 (`tracking/apresentacao/referencia/slide-01..13.png`) — identidade grafite + menta, Melissa presente, ritmo claro/escuro, hierarquia, marca d'água `01/02/03`, faixa escura de callout.
> **Gate:** `npx tsc --noEmit` sem erros novos · `npm run build` ✅ · Vercel `READY`

**Decisões herdadas que governam este WIRE:** D2 (seguir a v1 + ritmo claro/escuro) · D3 (reconstruir do zero) · D4 (14 slides) · D5 (MEL e Melissa convivem) · D10 (dois preços no mesmo tamanho) · D15 (slide 13 = visão) · D20 (rota pública) · D21 (headline/subtítulo da capa) · D22 (verde escuro da v1 nos títulos de telas claras — exceção ao `DESIGN.md`) · A1 (sem "90 dias") · P1 (CTA do slide 14 **parkada**) · P3 (`noindex`).

---

## Índice

1. [Casca do deck (estrutura comum)](#1-casca-do-deck--estrutura-comum-a-todos-os-slides)
2. [Slides 1 → 14](#2-slides-1--14)
3. [Mapa de imagens reservadas](#3-mapa-de-imagens-reservadas)
4. [Tokens e regras transversais](#4-tokens-e-regras-transversais)
5. [Checklist de verificação](#5-checklist-de-verificação)
6. [Pontos que precisam de decisão do fundador](#6-pontos-que-precisam-de-decisão-do-fundador)

---

## 1. Casca do deck — estrutura comum a todos os slides

**Rota:** `/apresentacao` (pública, sem login, `noindex, nofollow` — P3)
**Uma única tela** que troca de conteúdo. Não há lista de slides, menu, sumário nem rolagem entre slides.

### 1.1 Wireframe da página inteira (slide genérico)

```
┌────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← barra de progresso (MENTA #86CB92 sobre trilho cinza)
│                                                                │
│     ┌────────────────────────────────────────────────────┐     │
│     │                                                    │     │
│     │                                                    │     │
│     │                                                    │     │
│     │                                                    │     │
│     │                                                    │     │
│     │                                                    │     │
│     │                                                    │     │
│     │                                                    │     │
│     │                                                    │     │
│     │                                                    │     │
│     │                                                    │     │
│     │                                                    │     │
│     └────────────────────────────────────────────────────┘     │
│                                                                │
├────────────────────────────────────────────────────────────────┤  ← rodapé fixo (NÃO é numeração de página — a v1 não numera)
│    (←)                      3 / 14                 (→)         │
└────────────────────────────────────────────────────────────────┘
```

### 1.2 Anatomia da casca

| Faixa | Altura | Comportamento |
|---|---|---|
| **Barra de progresso** | fina (2–4px), no topo, encostada na borda | Preenchimento proporcional `indice/TOTAL_SLIDES`; menta sobre trilho cinza; `transition` na troca; `role="progressbar"` + `aria-valuenow` |
| **Área do slide** | ocupa toda a altura restante | Um slide por vez; centralizado; sem scroll interno; volta ao topo a cada troca |
| **Rodapé fixo** | fixo no rodapé da viewport | Botão `←` · contador `X / 14` · botão `→` |

### 1.3 Componentes da casca

| Componente | Papel | Requisitos |
|---|---|---|
| `BarraProgresso` | Mostra o quanto do deck já foi visto | Fina, no topo; menta/ cinza; `aria-valuenow`; transição na troca |
| `BotaoAnterior` | Volta um slide | Circular; 48px de alvo de toque; **desabilitado no slide 1** (aparece esmaecido, `aria-disabled`); hover menta; foco visível |
| `BotaoProximo` | Avança um slide | Circular; 48px; **desabilitado no slide 14**; hover menta; foco visível |
| `Contador` | "X / 14" | Sempre visível; `aria-live="polite"` (anuncia a troca) |
| `AreaSlide` | Renderiza `SLIDES[indice]` via `deck-layouts.tsx` | Delegado ao layout do slide; nunca quebra se faltar imagem |
| `Meta` | `noindex, nofollow` + título "UNIQ Empresas — Apresentação" | Aplicado enquanto a página está aberta |

### 1.4 Navegação (todas as formas convivem — apresentação ao vivo, D1)

| Entrada | Comportamento |
|---|---|
| **Botão `←` / `→`** | Um passo por clique; desabilitado nas pontas; não dá wrap |
| **Teclado** | `ArrowLeft` / `ArrowRight` trocam de slide — **ignorar quando o foco estiver em `INPUT`, `TEXTAREA` ou `contentEditable`** (o deck não tem campos, mas a regra é do SPEC §8) |
| **Swipe (touch)** | Horizontal; limiar **≥ 48px** para contar como troca (evita troca acidental); `touch-pan-y` preserva a rolagem vertical |
| **Barra/contador** | Indicativos, não clicáveis |

### 1.5 Acessibilidade

- `aria-label` por slide: **"Slide X de 14"** no container do slide.
- Contador com `aria-live="polite"` → leitor de tela anuncia "3 de 14" a cada troca.
- Barra com `role="progressbar"` + `aria-valuenow={indice+1}` + `aria-valuemin={1}` + `aria-valuemax={14}`.
- Foco visível (anel) em `←` e `→`; navegação completa por teclado; ordem de tabulação: `←` → `→`.
- Contraste **AA** em todos os pares texto/fundo (atenção aos slides grafite, onde o texto secundário `#627271` precisa de variante clara).
- `alt` descritivo em **todas** as imagens; imagem decorativa (arcos do slide 14) com `aria-hidden`.

### 1.6 NOTA — o deck inteiro não tem CTA

> **O slide 14 NÃO tem botão, NÃO tem QR code, NÃO tem link, NÃO tem tel, NÃO tem WhatsApp.**
> A decisão **P1 está parkada** (funil n8n da MEL ainda sem prompt final e sem gravação legível). O fechamento do deck é **conversa/retorno humano**.
> A única área clicável da casca são os botões de navegação `←` e `→`.
> Quando o fluxo da MEL ativar, o CTA entra **no lugar do bloco reservado `P1` do slide 14** (§2.14) — não antes.

### 1.7 Mobile da casca

- Barra de progresso e rodapé **mantêm a mesma posição** (topo e base) em todas as larguras.
- Contador permanece **centralizado** entre os botões, mesmo com a moldura mais estreita.
- Alvos de toque de 48px mantidos (o rodapé é a única área com alvos tocáveis).

---

## 2. Slides 1 → 14

**Legenda dos marcadores de espaço reservado:**

| Marcador | Significado |
|---|---|
| `[LOGO]` | Logo UNIQ sobre **chip claro `#E1E1E0`** — só nos slides 1 e 14. O PNG atual traz fundo branco: precisa versão transparente (D18/L4) |
| `[IMAGEM: melissa]` | Melissa **3/4, cortada na altura do quadril** (slides 1, 9 e 14) — fundo limpo/transparente |
| `◯` | **Avatar circular com anel menta `#86CB92`** — o único círculo do deck (slide 8) |
| `▸` `❝` | **Glifo de linha em menta `#86CB92`, sem círculo de fundo** (slides 6, 7 e 8) |
| `01` `02` `03` gigante | **Marca d'água numérica `#E1E3E3`**, topo-direito, sangrando na borda (slides 6, 7 e 8) · `aria-hidden` |
| `01` `02` `03` menta | **Número gigante do marcador** (slide 5) · `1` `2` `3` menta no slide 10 |
| `[IMAGEM: funil]` | Ilustração a produzir — funil da porta (SPEC §6.2 item 3) |
| `[IMAGEM: medico]` | Ilustração a produzir — fórmula sob medida (SPEC §6.2 item 4) |
| `[IMAGEM: dor]` | **Fora do esqueleto da v1** (slide 2) — ver decisão **W8**. Prompt pronto no SPEC §6.2 item 2 |

> **Sem numeração de página** em nenhum slide interno (a v1 não numera). O contador `X / 14` pertence à casca (§1), não ao slide.

---

### Slide 1 — Capa

**Rota/posição:** `/apresentacao` · **slide 1/14** · layout **`capa`** (`renderCapa`)

**Wireframe — split claro/escuro:**

```
┌───────────────────────────────────────┬────────────────────────┐
│                                        │                       │
│  ┌──────────────┐                      │                       │  ← chip CLARO #E1E1E0 atrás do logo (o PNG traz o próprio fundo — precisa versão transparente)
│  │[LOGO] UNIQ   │                      │                       │
│  └──────────────┘                      │                       │
│                                        │      ▒▒▒▒▒▒▒▒▒        │  ← Melissa 3/4, cortada na altura do quadril
│  ALTO TIETÊ · CONSULTORIA              │     ▒▒▒▒▒▒▒▒▒▒        │  ← eyebrow #3E5653 (verde acinzentado), caixa alta espaçada
│                                        │    ▒▒▒       ▒▒       │
│  Sua empresa não precisa               │    ▒▒  [MEL]  ▒       │  ← título em GRAFITE #1F2937 (exceção confirmada da v1 — NÃO é verde)
│  de mais esforço seu.                  │    ▒▒  corpo   ▒      │
│  ═══════════                           │    ▒▒▒ 3/4    ▒       │  ← sublinhado MENTA #86CB92 sob a palavra-chave
│                                        │    ▒▒▒▒▒▒▒▒▒▒▒        │
│  No dia a dia, tudo depende            │                       │  ← subtítulo
│  de você — e não sobra tempo           │                       │
│  para olhar o todo. Sua                │                       │
│  empresa precisa de alguém             │                       │
│  que cuide dela e aponte               │                       │
│  o caminho.                            │                       │
│                                        │                       │
└───────────────────────────────────────┴────────────────────────┘
```

**Blocos:** `logo` (topo-esquerdo, sobre **chip claro `#E1E1E0`**) · `eyebrow` (versalete, **`#3E5653`**) · `titulo` em **GRAFITE `#1F2937`** (2 linhas, com **sublinhado menta `#86CB92`** em "mais esforço seu") · `subtitulo` (`#627271`, 3–4 linhas) · painel **grafite `#1F2937`** à direita (**~38% da largura**) com `melissa` **3/4, cortada no quadril**.

> ⚠️ **O título da capa é GRAFITE, não verde.** A v1 mede `#1F2937` aqui — é a única exceção ao `#3E5653` dos títulos. D22 passa a valer **somente nos slides de fundo claro** (3, 4, 5, 6, 7, 8, 10, 11).

**Espaço de imagem:** `[LOGO]` (metade clara, sobre chip) + `[IMAGEM: melissa]` (painel grafite, **3/4 cortada no quadril**).
**Os 3 pilares NÃO entram na capa** (D21 — ficam no slide 5).

**Mobile:** o split **empilha** — metade clara primeiro (logo → eyebrow → título → subtítulo), metade grafite com a Melissa **abaixo**, mantendo o contraste claro/escuro como uma faixa de fechamento do slide. Sem scroll interno: a altura do conteúdo é compactada (título 1 linha maior, subtítulo completo).

**Estados:** conteúdo estático. Se o asset da Melissa faltar → o painel grafite **permanece grafite** e renderiza o espaço reservado (nunca vira bloco branco, nunca quebra o split). Se o logo não vier transparente → espaço reservado com a mesma caixa.

**Texto — verbatim da SPEC §5.1 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `ALTO TIETÊ · CONSULTORIA` | §5.1 |
| `titulo` | "Sua empresa não precisa de mais esforço seu." — **sublinhado menta** em "mais esforço seu" | §5.1 |
| `subtitulo` | "No dia a dia, tudo depende de você…" → "…e aponte o caminho." (2 frases) | §5.1 |
| `imagem` | `melissa` (prova visual) + `logo` | §5.1 |
| fala | o dono se reconhece na frase; a seguir o fundador narra a origem | §5.1 |

---

### Slide 2 — O dia apagando incêndio

**Rota/posição:** `/apresentacao` · **slide 2/14** · layout **`escuro`** (`renderEscuro`) · **fundo grafite**

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ O dia inteiro apagando incêndio.                               │  ← título branco #EFEFEF — PRIMEIRA LINHA do conteúdo (este slide NÃO tem eyebrow, decisão do fundador 26/09/2026)
│ E o negócio sem sair do lugar.                                 │  ← subtítulo curto, logo abaixo do título
│                                                                │
│ — Atendimento, operação,      │                                │  ← col. esq.: 3 bullets com travessão "—", sem ícones   |   col. dir.: o DESTAQUE (pull-quote único), não uma lista de afirmações
│   fornecedor, caixa:          │                                │
│   tudo passa por você.        │ ┏───────────────────────────┐  │
│                               │ ┃ Você é mais jogador       │  │  ← barra MENTA #86CB92 à esquerda do bloco (marca do destaque)
│ — Não sobra tempo para        │ ┃ do jogo do que            │  │  ← "jogador" é a frase-chave realçada em menta #86CB92 (sublinhado na linha de baixo)
│   olhar o mercado ou          │ ┃ pensador do jogo.         │  │
│   planejar o crescimento.     │ ┃             ━━━━━━━       │  │
│                               │ ┃                           │  │
│ — E não sobra caixa para      │ ┃                           │  │
│   contratar quem tenha        │ ┗───────────────────────────┘  │
│   esse conhecimento.          │                                │
│                               │                                │
│                                                                │
│                                                                │
│                                                                │  ← a v1 NÃO tem imagem neste slide
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `titulo` branco `#EFEFEF` em 2 linhas no **topo** (a 2ª linha é o **subtítulo curto** "E o negócio sem sair do lugar") · **3 bullets com travessão `—`, sem ícones** na coluna esquerda · **`destaque` como pull-quote único** na coluna direita — "Você é mais jogador do jogo do que pensador do jogo." — com **barra menta `#86CB92`** na borda esquerda e **"jogador" realçado em menta** (sublinhado).
**Sem `eyebrow`** — decisão do fundador em **26/09/2026**; o campo também não existe na SPEC §5.2. Este é o único slide do deck que abre direto no título.
**Layout de DUAS COLUNAS da v1** — o `destaque` ocupa a coluna direita inteira; o tipo de layout na estrutura continua sendo `escuro` (os 8 layouts são preservados).

**Espaço de imagem:** **nenhum.** A v1 **não tem ilustração no slide 2** — a coluna direita é o bloco de afirmações, não uma imagem. A ilustração `dor` (balcão + WhatsApp) fica **fora do esqueleto** e **parkada** até o fundador decidir (decisão **W8**); o prompt continua pronto no SPEC §6.2 item 2 caso entre.

**Mobile:** as duas colunas **empilham** — texto (título + 3 bullets) primeiro, bloco de destaque logo abaixo em largura total. Sem imagem, o slide fica mais curto: cabe sem scroll.

**Estados:** estático, sem imagens. O `destaque` é obrigatório — se vier vazio, **o bloco não renderiza** e a coluna direita fica vazia (sem fallback de texto, sem placeholder).

**Texto — verbatim da SPEC §5.2 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `titulo` | "O dia inteiro apagando incêndio." (2 linhas) | §5.2 |
| `subtitulo` | "E o negócio sem sair do lugar." | §5.2 |
| `itens[0]` | "Atendimento, operação, fornecedor, caixa: tudo passa por você." | §5.2 |
| `itens[1]` | "Não sobra tempo para olhar o mercado…" | §5.2 |
| `itens[2]` | "E não sobra caixa para contratar quem tenha esse conhecimento." | §5.2 |
| `destaque` | "Você é mais jogador do jogo do que pensador do jogo." | §5.2 |
| `imagem` | `dor` | §5.2 |

---

### Slide 3 — O custo de continuar assim

**Rota/posição:** `/apresentacao` · **slide 3/14** · layout **`colunas`** (`renderColunas`) · fundo claro

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ O CUSTO DE CONTINUAR ASSIM                                     │  ← eyebrow #627271 (cinza — tela clara)
│ Trabalhar mais não resolve                                     │  ← título #3E5653
│                                                                │
│ Vender              │Decidir             │Crescer              │  ← colunas em texto, separadas por RÉGUA FINA (sem cards) · heading #3E5653 · corpo #1A1A1A
│                     │                    │                     │
│ Sem saber a margem r│Sem dados de mercado│Preso à operação mant│
│ de cada produto pode│transforma cada esco│o dono como funcionár│
│ significar lucrar me│em aposta — preço,  │do próprio negócio.  │
│ vendendo mais.      │estoque, investiment│                     │
│                     │                    │                     │
│                     │                    │                     │
│                     │                    │                     │
│                     │                    │                     │
│                                                                │
│ O problema não é esforço.                                      │  ← takeaway em VERDE-ESCURO #3E5653 NEGRITO, SEM FAIXA (destaque não leva caixa)
│ É a falta de estrutura para crescer.                           │
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` **verde escuro `#3E5653`** · 3 colunas de **texto puro** com **divisórias verticais finas** (a v1 **não usa cards**) · heading de coluna `#3E5653` · corpo `#1A1A1A` · **`destaque` sem caixa**: takeaway em **verde-escuro `#3E5653` negrito**, direto no fundo claro.
**Sem imagem** neste slide.

**Mobile:** 3 colunas → **2 (tablet) → 1 (mobile)**. Com 1 coluna as divisórias viram **linhas horizontais** entre os blocos; o `destaque` fecha a tela.

**Estados:** estático. Sem assets: as colunas são só texto — a régua e o `destaque` continuam desenhados, o layout não muda.

**Texto — verbatim da SPEC §5.3 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `O CUSTO DE CONTINUAR ASSIM` | §5.3 |
| `titulo` | "Trabalhar mais não resolve." | §5.3 |
| `itens[0]` | **Vender** — "…**lucrar menos vendendo mais**." | §5.3 |
| `itens[1]` | **Decidir** — "…cada escolha vira **aposta**…" | §5.3 |
| `itens[2]` | **Crescer** — "…**funcionário do próprio negócio**." | §5.3 |
| `destaque` | "O problema não é esforço. É a falta de estrutura para crescer." | §5.3 |

---

### Slide 4 — Por que a UNIQ existe

**Rota/posição:** `/apresentacao` · **slide 4/14** · layout **`duasColunas`** (`renderDuasColunas`) · fundo claro

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ POR QUE A UNIQ EXISTE                                          │  ← eyebrow #627271 (cinza — tela clara)
│ Eu vi os dois lados desse jogo                                 │  ← título #3E5653
│                                                                │
│ Nas grandes empresas          │ Na minha gráfica B2B           │  ← 2 colunas com RÉGUA FINA central · heading #3E5653 negrito · corpo #1A1A1A
│                               │                                │
│ Analista de sistemas          │ Atendendo pequenos e           │
│ desde 2011, em empresas       │ médios empreendedores,         │
│ como Banco Santander          │ vi o contraponto: gente        │
│ e Ultragaz, em contato        │ talentosa e esforçada, sem     │
│ com a alta diretoria.         │ acesso às mesmas               │
│                               │ ferramentas.                   │
│ Lá ficou claro o quanto       │                                │
│ conhecimento de mercado,      │ Foi dessa diferença            │
│ estratégia e boas             │ que nasceu a UNIQ.             │
│ ferramentas fazem diferença.                                   │
│ Levar para o pequeno o que a grande                            │  ← takeaway em VERDE-ESCURO #3E5653 NEGRITO, SEM FAIXA
│ empresa já usa para vencer.                                    │
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` **verde escuro `#3E5653`** · 2 colunas de texto com **régua central**; cada coluna com `rotulo` ("Nas grandes empresas" / "Na minha gráfica B2B") + texto corrido · `fecho` como **takeaway `#3E5653` negrito, sem caixa**.
**Sem imagem.** Texto em **1ª pessoa** — o fundador narra, a tela apoia (D9).

**Mobile:** as 2 colunas **empilham** (empresa grande → gráfica), o divisor central vira linha horizontal, `fecho` abaixo.

**Estados:** estático; sem imagens; sem estados de dado.

**Texto — verbatim da SPEC §5.4 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `POR QUE A UNIQ EXISTE` | §5.4 |
| `titulo` | "Eu vi os dois lados desse jogo." | §5.4 |
| `itens[0].rotulo` | "Nas grandes empresas" | §5.4 |
| `itens[0].descricao` | "Analista de sistemas desde 2011" · **Banco Santander** · **Ultragaz** · **conhecimento de mercado, estratégia e boas ferramentas** | §5.4 |
| `itens[1].rotulo` | "Na minha gráfica B2B" | §5.4 |
| `itens[1].descricao` | "…**sem acesso às mesmas ferramentas e ao mesmo conhecimento**." | §5.4 |
| `fecho` | "Foi dessa diferença que nasceu a UNIQ. Levar para o pequeno…" | §5.4 |

---

### Slide 5 — A UNIQ: três objetivos

**Rota/posição:** `/apresentacao` · **slide 5/14** · layout **`colunas`** (`renderColunas`) · fundo claro

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ A UNIQ EMPRESAS                                                │  ← eyebrow #627271 (cinza — tela clara)
│ Três objetivos. Um só parceiro.                                │  ← título #3E5653
│ Temos tecnologia — mas não somos uma                           │
│ empresa de tecnologia. Usamos a tecnologia                     │
│ a favor do seu objetivo.                                       │
│                                                                │
│                                                                │
│ █████   ██          │█████ █████         │█████ █████          │  ← NÚMEROS GIGANTES 01/02/03 em MENTA #86CB92 (não círculos, não glifos) · heading #3E5653 · corpo #627271
│ █   █    ██         │█   █    ██         │█   █  ███           │
│ █████ █████         │█████ █████         │█████ █████          │
│ Aumento de          │Aumento de          │Transformação        │
│ Faturamento         │Margem              │do Empreendedor      │
│                     │                    │                     │
│ Trazer mais         │Não trabalhar       │De jogador a         │
│ dinheiro e dar      │muito e ganhar      │quem controla        │
│ fôlego para você    │pouco.              │o jogo.              │
│ investir.           │                    │                     │
│                     │                    │                     │
│                                                                │
│                                                                │
│ Consultoria + tecnologia a serviço do                          │  ← takeaway em VERDE-ESCURO #3E5653 NEGRITO, SEM FAIXA
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` **verde escuro `#3E5653`** · `corpo` (a frase que posiciona: tecnologia é meio, não fim) · 3 colunas de texto com **réguas** e **números gigantes `01`/`02`/`03` em menta `#86CB92`** (o número é o marcador — não há glifo nem círculo) · heading de coluna `#3E5653` · corpo `#627271` · `destaque` como **takeaway `#3E5653` negrito, sem caixa**.
**Sem imagem.** São **aqui** que os 3 pilares aparecem com os nomes decididos (D6/D7/D8) — a capa não os carrega (D21).

**Mobile:** 3 → 2 → 1 coluna; `corpo` acima dos blocos; `destaque` fecha.

**Estados:** estático; sem imagens.

**Texto — verbatim da SPEC §5.5 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `A UNIQ EMPRESAS` | §5.5 |
| `titulo` | "Três objetivos. Um só parceiro." | §5.5 |
| `corpo` | "Temos tecnologia — mas não somos uma empresa de tecnologia…" | §5.5 |
| `itens[0]` | **01 · Aumento de Faturamento** (D6) — "Trazer mais dinheiro…" | §5.5 |
| `itens[1]` | **02 · Aumento de Margem** (D7) — "…não trabalhar muito e ganhar pouco." | §5.5 |
| `itens[2]` | **03 · Transformação do Empreendedor em Empresário** (D8) — "De jogador do jogo a quem sabe e controla o jogo." | §5.5 |
| `destaque` | "Consultoria + tecnologia a serviço do objetivo — nunca o contrário." | §5.5 |

---

### Slide 6 — Objetivo 1: Aumento de Faturamento

**Rota/posição:** `/apresentacao` · **slide 6/14** · layout **`objetivo`** (`renderObjetivo`) · fundo claro

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ OBJETIVO 1                                        ██████     ██│  ← eyebrow #627271 (cinza — tela clara)
│ Aumento de Faturamento                           █      █     █│  ← título #3E5653
│ Primeiro, o dinheiro precisa entrar.             █      █     █│  ← marca d'água NUMÉRICA gigante #E1E3E3, no topo-direito, SANGRA/CORTA na borda direita · aria-hidden
│                                                  █      █     █│
│                                                   ██████    ███│
│ ▸   UNIQ — Conhecimento de mercado                             │  ← lista VERTICAL: GLIFO de linha em MENTA #86CB92, SEM CÍRCULO de fundo · título #1A1A1A · descrição #627271
│     O que as grandes empresas usam,                            │
│     adaptado para a sua realidade.                             │
│                                                                │
│ ▸   Melissa — Atendimento que não deixa a venda cair           │
│     Atende, faz o acompanhamento, agenda e cuida do cliente    │
│     de forma individualizada, 24h.                             │
│                                                                │
│ ▸   Base UNIQ — Indicadores e funil de vendas                  │
│     Quantos passaram na porta? Quantos                         │
│     entraram? Compraram? Voltaram?                             │
│                                                                │
│ ┌────────────────────────────────────────────────┐             │  ← ilustração reservada em faixa larga
│ │ [IMAGEM: funil]       passaram na porta        │             │
│ │                       ↓ entraram · compraram   │             │
│ │                       ↓ voltaram               │             │
│ └────────────────────────────────────────────────┘             │
│                                                                │
│ Isso tira você de ser funcionário da sua empresa               │  ← fecho #3E5653
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` (`OBJETIVO 1`) · `titulo` **verde escuro `#3E5653`** · `subtitulo` · **marca d'água `01`** gigante `#E1E3E3` no topo-direito, **sangrando na borda direita** · **lista vertical** de **3 itens com glifo de linha menta `#86CB92` (sem círculo de fundo)** (`compass`, `message`, `funnel`) · `[IMAGEM: funil]` em faixa larga · `fecho` `#3E5653`.
**"Loja Virtual" NÃO entra aqui** — é visão (slide 13).

**Mobile:** 3 itens → **1 coluna**; a marca d'água `01` **reduz e vai para o fundo** (não some, é a gramática do slide); `[IMAGEM: funil]` em largura total **abaixo** dos itens; `fecho` por último.

**Estados:** estático. Sem a ilustração do funil → placeholder na mesma faixa, sem quebrar o grid.

**Texto — verbatim da SPEC §5.6 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `OBJETIVO 1` | §5.6 |
| `titulo` | "Aumento de Faturamento" | §5.6 |
| `subtitulo` | "Primeiro, o dinheiro precisa entrar…" · "nem para mudar a vitrine." | §5.6 |
| `itens[0]` | `compass` · **UNIQ — Conhecimento de mercado** | §5.6 |
| `itens[1]` | `message` · **Melissa — Atendimento que não deixa a venda cair** | §5.6 |
| `itens[2]` | `funnel` · **Base UNIQ — Indicadores e funil de vendas** | §5.6 |
| `imagem` | `funil` (porta → entraram → compraram → voltaram) | §5.6 |
| `fecho` | "Isso tira você de ser funcionário da sua empresa…" | §5.6 |

---

### Slide 7 — Objetivo 2: Aumento de Margem

**Rota/posição:** `/apresentacao` · **slide 7/14** · layout **`objetivo`** (`renderObjetivo`) · fundo claro

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ OBJETIVO 2                                        ██████   ████│  ← eyebrow #627271 (cinza — tela clara)
│ Aumento de Margem                                █      █ █    │  ← título #3E5653
│ Não basta trazer dinheiro.                       █      █  ████│  ← marca d'água "02" #E1E3E3, sangrando na borda direita
│                                                  █      █ █    │
│                                                   ██████  █████│
│ ▸   UNIQ — Análise profunda de mercado                         │  ← lista vertical · glifo de linha menta SEM CÍRCULO · título #1A1A1A · descrição #627271
│     Entender preço, concorrência e                             │
│     posicionamento para decidir com dados.                     │
│                                                                │
│ ▸   Base UNIQ — Visão total da operação                        │
│     Custos, margens e processos                                │
│     enxergados de ponta a ponta.                               │
│                                                                │
│ ▸   Base UNIQ — Parcerias entre empresas do grupo              │
│     Material gráfico mais barato e um                          │
│     canal de vendas que você não tinha.                        │
│                                                                │
│                                                                │
│ Fazer mais dinheiro entrar e menos dinheiro sair.              │  ← destaque em MENTA #86CB92 (o pitch oficial)
│ Isso é margem.                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` **verde escuro `#3E5653`** · `subtitulo` · **marca d'água `02`** `#E1E3E3` (topo-direito, sangrando) · **lista vertical** de 3 itens com **glifo de linha menta `#86CB92`, sem círculo** (`scale`, `wallet`, `handshake`) · `destaque` em **menta `#86CB92`** (o pitch oficial em forma de fecho).
**Sem imagem** neste slide — o `destaque` ocupa o peso visual que a imagem teria.

**Mobile:** 3 itens → 1 coluna; marca d'água `02` reduzida ao fundo; `destaque` fecha a tela.

**Estados:** estático; sem imagens.

**Texto — verbatim da SPEC §5.7 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `OBJETIVO 2` | §5.7 |
| `titulo` | "Aumento de Margem" | §5.7 |
| `subtitulo` | "Não basta trazer dinheiro. É preciso saber para onde cada real está indo." | §5.7 |
| `itens[0]` | `scale` · **UNIQ — Análise de mercado** | §5.7 |
| `itens[1]` | `wallet` · **Base UNIQ — Visão total da operação** | §5.7 |
| `itens[2]` | `handshake` · **Base UNIQ — Parcerias entre empresas do grupo** | §5.7 |
| `destaque` | "Fazer mais dinheiro entrar e menos dinheiro sair. Isso é margem." | §5.7 |
| fala | exemplo concreto da parceria com a gráfica do grupo (ditado, Parte 3) | §5.7 |

---

### Slide 8 — Objetivo 3: Transformação

**Rota/posição:** `/apresentacao` · **slide 8/14** · layout **`objetivo`** (`renderObjetivo`) · fundo claro

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ OBJETIVO 3                                        ██████   ████│  ← eyebrow #627271 (cinza — tela clara)
│ Transformação do Empreendedor                    █      █ █    │  ← título #3E5653
│ É o que faz os outros dois durarem.              █      █  ████│  ← marca d'água "03" #E1E3E3, sangrando na borda direita
│                                                  █      █ █    │
│                                                   ██████   ████│
│ ▸   UNIQ — Transformação duradoura    │ ┌───────────────────┐  │  ← lista de 3 itens na ESQUERDA (glifo de linha menta, SEM círculo) + RÉGUA FINA
│     Levar o parceiro de um ponto a    │ │                   │  │
│     outro, com mudança que permanece. │ │        ◯          │  │  ← AVATAR CIRCULAR com ANEL MENTA #86CB92 — o único círculo do deck
│                                       │ │                   │  │
│                                       │ │ Melissa —         │  │  ← card lateral DIREITO — layout DIVERGENTE da v1 (decisão do deck novo) · Melissa é o `itens[2]` da §5.8, elevado a card por causa do avatar
│ ❝   Empreender e gerir são            │ │ sua copiloto      │  │
│     coisas diferentes                 │ │ no dia a dia      │  │
│     E gerir se aprende — com método,  │ │                   │  │
│     não com tentativa e erro.         │ │ Move os seus      │  │
│                                       │ │ olhos para ver a  │  │
│ ▸   Trilhas de conhecimento           │ │ empresa de forma  │  │
│     Visão de mercado e de outros      │ │ diferente.        │  │
│     negócios, para dentro da sua      │ └───────────────────┘  │
│     empresa. (visão)                  │                        │
│                                       │                        │
│ A empresa deveria trabalhar para você │                        │  ← destaque em MENTA #86CB92
│ — e não você ser o funcionário dela.                           │
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` **verde escuro `#3E5653`** (2 linhas) · `subtitulo` curto · **marca d'água `03`** `#E1E3E3` (topo-direito, sangrando) · **lista vertical de 3 itens** na esquerda com **glifo de linha menta `#86CB92`, sem círculo** (`refresh`, `graduation`, `lifebuoy`, `book`), separada do card lateral por **régua fina** · **card da Melissa à direita** com **avatar `◯` de anel menta `#86CB92`** · `destaque` menta.

> **Layout divergente da v1** (decisão **W9**): a v1 traz aqui 3 itens em lista simples. O deck novo acrescenta o **card lateral da Melissa** à direita, porque o slide precisa fechar o objetivo 3 no mesmo grau dos slides 6 e 7, que fecham os outros dois. A marca d'água `03` **continua** — ela é a assinatura do layout `objetivo`.
**"Trilhas" é VISÃO** — nunca entrega do MVP (D16).

**Mobile:** o card da Melissa desce **para baixo da lista** (o avatar vem acima do texto, não ao lado); a régua fina entre os dois blocos some; marca d'água `03` reduzida ao fundo.

**Estados:** estático. Avatar ausente → placeholder **circular** do mesmo tamanho, mantendo o anel menta. Glifos nunca somem (são vetoriais).

**Texto — verbatim da SPEC §5.8 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `OBJETIVO 3` | §5.8 |
| `titulo` | "Transformação do Empreendedor em Empresário" | §5.8 |
| `subtitulo` | "É o que faz os outros dois durarem." | §5.8 |
| `itens[0]` | `refresh` · **UNIQ — Transformação duradoura** | §5.8 |
| `itens[1]` | `graduation` · "Empreender e gerir são coisas diferentes" | §5.8 |
| `itens[2]` | `lifebuoy` · **Melissa — sua copiloto no dia a dia** *(avatar MEL — card lateral direito)* | §5.8 |
| `itens[3]` | `book` · "Trilhas de conhecimento" *(visão — fora do MVP)* | §5.8 |
| `destaque` | "A empresa deveria trabalhar para você — e não você ser o funcionário dela." | §5.8 |

---

### Slide 9 — Melissa, sua consultora todos os dias

**Rota/posição:** `/apresentacao` · **slide 9/14** · layout **`escuro`** (`renderEscuro`) · **fundo grafite** · **pico emocional**

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ O DIFERENCIAL                                                  │  ← eyebrow MENTA #86CB92 (tela escura)
│ Melissa, sua consultora                                        │  ← título branco #EFEFEF
│ todos os dias                                                  │
│                                                                │  ← Melissa 3/4 à direita, cortada no quadril (glow ciano no cabelo, linhas neon no traje)
│ Consultoria tradicional é uma                 ▒▒▒▒▒▒▒▒▒        │  ← corpo #AEB6B4
│ reunião por mês e um relatório.              ▒▒▒▒▒▒▒▒▒▒        │
│ A UNIQ é diferente.                         ▒▒▒       ▒▒       │
│                                             ▒▒  [MEL]  ▒       │
│                                             ▒▒  corpo   ▒      │
│ A Melissa acompanha o seu                   ▒▒▒ 3/4    ▒       │  ← parágrafo #AEB6B4 com "DIARIAMENTE" em BRANCO NEGRITO no meio da frase
│ negócio DIARIAMENTE: atende, orienta,       ▒▒▒▒▒▒▒▒▒▒▒        │
│ organiza o funil e guia cada etapa.                            │
│                                                                │
│                                                                │
│                                                                │
│ O conhecimento de uma consultoria,                             │  ← fecho em MENTA #86CB92 (realce no meio da frase)
│ com a presença de um sócio.                                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` **menta `#86CB92`** (tela escura) · `titulo` branco `#EFEFEF` 2 linhas · `corpo` `#AEB6B4` (o contraste com a consultoria tradicional) · parágrafo com **"DIARIAMENTE" em branco negrito** no meio da frase · `fecho` (a frase-selo) em **menta `#86CB92`** · `[IMAGEM: melissa]` **3/4, cortada no quadril**, à direita.
**Preserva o peso da v1** — este é o slide mais emotivo antes do preço.

**Mobile:** texto primeiro (eyebrow → título → corpo → quote → fecho) e **[IMAGEM: melissa] por último, em largura total**. A imagem não pode ser cortada na altura.

**Estados:** estático. Sem imagem → o painel grafite mantém o contraste e a Melissa vira placeholder; o texto não se move.

**Texto — verbatim da SPEC §5.9 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `O DIFERENCIAL` | §5.9 |
| `titulo` | "Melissa, sua consultora todos os dias." | §5.9 |
| `corpo` | "Consultoria tradicional é uma reunião por mês e um relatório…" | §5.9 |
| `destaque` | "A Melissa acompanha o seu negócio **diariamente**…" | §5.9 |
| `fecho` | "O conhecimento de uma consultoria, **com a presença de um sócio**." | §5.9 |
| `imagem` | `melissa` (**3/4, cortada no quadril**) | §5.9 |

---

### Slide 10 — Como trabalhamos: o método do médico

**Rota/posição:** `/apresentacao` · **slide 10/14** · layout **`metodo`** (`renderMetodo`) · fundo claro + **faixa escura**

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ COMO TRABALHAMOS                          ┌──────────────────┐ │  ← imagem de apoio (fórmula sob medida)
│ Como ir ao médico, mas para               │ [IMAGEM: medico] │ │  ← título #3E5653
│ a sua empresa.                            │ receita/fórmula  │ │
│ Você apresenta as dores. A gente          │ sob medida       │ │
│ junta conhecimento e ferramentas.         └──────────────────┘ │
│                                                                │
│ ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐│  ← passos com NÚMERO GIGANTE em MENTA #86CB92 (1/2/3) e LINHAS CONECTORAS horizontais entre eles
│ │   ██            │   │ █████           │   │ █████           ││
│ │    ██           │   │    ██           │   │  ███            ││
│ │ █████           │   │ █████           │   │ █████           ││
│ │ Diagnóstico     │───│ Solução sob     │───│ Entrega         ││
│ │ Você conversa e │   │ medida          │   │ acompanhada     ││
│ │ conta como a    │   │ Módulos,        │   │ O sistema       ││
│ │ sua empresa     │   │ atendente e     │   │ pronto, rodando ││
│ │ funciona hoje.  │   │ mentora para a  │   │ e acompanhado   ││
│ │                 │   │ sua empresa.    │   │ no dia a dia.   ││
│ └─────────────────┘   └─────────────────┘   └─────────────────┘│
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │  ← FAIXA DE RODAPÉ #3E5653 (o MESMO token do título verde), largura total, ~22% inferior, texto claro
│ │ MVP entregue em até 2 meses. Você não precisa aprender     │ │
│ │ tecnologia — quem opera é a UNIQ.                          │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` **verde escuro `#3E5653`** · `corpo` · **3 passos com número gigante menta `#86CB92`** (1 → 2 → 3) ligados por **conectores horizontais** · `[IMAGEM: medico]` (fórmula/receita sob medida) como apoio dos passos · **faixa de rodapé full-width `#3E5653`** com texto claro (`destaque`).
**A faixa é elemento estrutural, não decoração** — é a resposta ao slide 11 ("por que é acessível"). Ela reaproveita o **mesmo** token do título verde, não um segundo verde.
**Proibido:** "retorno garantido em 90 dias" (A1).

**Mobile:** os 3 passos **empilham verticalmente** e o **conector vira linha vertical** entre eles; `[IMAGEM: medico]` em largura total entre os passos e a faixa; a **faixa escura mantém-se colada ao rodapé do slide** (acima do rodapé de navegação da casca).

**Estados:** estático. Sem a ilustração → placeholder na mesma caixa; a faixa escura nunca some.

**Texto — verbatim da SPEC §5.10 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `COMO TRABALHAMOS` | §5.10 |
| `titulo` | "Como ir ao médico, mas para a sua empresa." | §5.10 |
| `corpo` | "Você apresenta as dores…" · solução **sob medida** | §5.10 |
| `itens[0]` | **1 · Diagnóstico** | §5.10 |
| `itens[1]` | **2 · Solução sob medida** | §5.10 |
| `itens[2]` | **3 · Entrega acompanhada** | §5.10 |
| `destaque` (faixa) | "MVP entregue em **até 2 meses**…" | §5.10 |
| `imagem` | `medico` (fórmula/receita sob medida) | §5.10 |

---

### Slide 11 — Por que entrar agora

**Rota/posição:** `/apresentacao` · **slide 11/14** · layout **`colunas`** (`renderColunas`) · fundo claro

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ POR QUE ENTRAR AGORA                                           │  ← eyebrow #627271 (cinza — tela clara)
│ 12 vagas de co-fundador.                                       │  ← título #3E5653
│                                                                │
│ Preço de            │Atenção             │Co-construção        │  ← HEADINGS DAS 3 COLUNAS EM MENTA #86CB92 (não verde-escuro) · corpo #627271 · réguas finas
│ fundador            │máxima              │                     │
│                     │                    │Você participa da    │
│ R$ 500 de setup     │Poucas empresas,    │construção do        │
│ e R$ 197/mês —      │dedicação quase     │método — e colhe     │
│ condição que só     │individual.         │primeiro.            │
│ existe para os 12   │                    │                     │
│ primeiros.          │                    │                     │
│                     │                    │                     │
│                     │                    │                     │
│                     │                    │                     │
│                                                                │
│ Alpha (out/2026) → Beta (jan/2027) →                           │  ← setas "→" na linha do caminho
│ Prod (abr/2027) → lançamento em julho/2027                     │
│                                                                │
│ O preço de fundador é real. Ele só                             │  ← takeaway em VERDE-ESCURO #3E5653 NEGRITO, SEM FAIXA
│ existe para os 12 primeiros.                                   │
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` **verde escuro `#3E5653`** · 3 colunas de texto com **réguas** (**Preço de fundador** · **Atenção máxima** · **Co-construção**) — os **headings das 3 colunas são menta `#86CB92`**, o corpo é `#627271` · `caminho` (Alpha → Beta → Prod → **Lançamento**, ligado por setas `→`) · `destaque` como **takeaway `#3E5653` negrito, sem caixa**.
**Escassez real, sem clichê** — proibido "nunca mais vai existir" (§5.11).

**Mobile:** 3 → 2 → 1 coluna; as réguas viram **linhas horizontais**; `caminho` **quebra em linhas** (Alpha → Beta → Prod → lançamento) virando lista vertical, mantendo a ordem e as setas; `destaque` fecha.

**Estados:** estático; sem imagens.

**Texto — verbatim da SPEC §5.11 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `POR QUE ENTRAR AGORA` | §5.11 |
| `titulo` | "12 vagas de co-fundador." | §5.11 |
| `itens[0]` | **Preço de fundador** — "R$ 500 de setup + R$ 197/mês…" | §5.11 |
| `itens[1]` | **Atenção máxima** | §5.11 |
| `itens[2]` | **Co-construção** | §5.11 |
| `caminho` | "Alpha (out/2026) → Beta (jan/2027) → Prod (abr/2027) → lançamento em julho/2027." | §5.11 |
| `destaque` | "O preço de fundador é real. Ele só existe para os 12 primeiros…" | §5.11 |

---

### Slide 12 — Investimento

**Rota/posição:** `/apresentacao` · **slide 12/14** · layout **`preco`** (`renderPreco`) · **fundo grafite**

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ INVESTIMENTO                                                   │  ← eyebrow MENTA #86CB92 (tela escura)
│ A consultoria completa, pelo preço                             │  ← título branco #EFEFEF
│ de quem entra na frente.                                       │
│                                                                │
│                               │                                │  ← 2 blocos com RÉGUA VERTICAL FINA entre eles · MESMO TAMANHO de fonte (D10)
│   VALOR CHEIO                 │   CO-FUNDADOR                  │  ← bloco ESQUERDO em CINZA #AEB6B4   |   bloco DIREITO em MENTA #86CB92 (destaque só por cor)
│   (APÓS AS 12 VAGAS)          │   · 12 VAGAS                   │
│                               │                                │
│   R$ 1.500                    │   R$ 500                       │
│   setup                       │   setup                        │
│   R$ 297 /mês                 │   R$ 197 /mês                  │
│                               │                                │
│                                                                │
│ ✓ R$ 500 cobrado na entrega do MVP                             │  ← checklist com "✓" em MENTA #86CB92 · SEM logo, SEM arcos
│ ✓ Mensalidade começa depois — dias 5, 15 ou 25                 │
│ ✓ Quando as 12 vagas acabarem, vale o valor cheio              │
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` **menta `#86CB92`** (tela escura) · `titulo` branco `#EFEFEF` · **2 blocos lado a lado separados por régua vertical fina**, com **tipografia de tamanho IDÊNTICO** (mesma altura, mesma fonte, mesma estrutura — D10; **proibido** risco/cross-out/"de") · bloco esquerdo em **cinza `#AEB6B4`** (`VALOR CHEIO`) · bloco direito em **menta `#86CB92`** (`CO-FUNDADOR`) · `checks` com **`✓` menta** em lista abaixo.
O bloco `CO-FUNDADOR` se destaca **pela cor do texto, e nada mais** — **sem borda, sem fundo, sem caixa, sem alterar o tamanho**. A oportunidade precisa ficar nítida pelo contraste de *conteúdo*, não por truque de escala.
**Sem logo e sem arcos** neste slide (a v1 é limpa: só os dois blocos, a régua e os checks).
**Proibido na tela:** "pagamento na inicialização" (D11) · fidelidade (D12) · o valor concedido no 1º ano (R$ 2.200) — isso fica **na fala**.

**Mobile:** os 2 blocos **empilham** (mesma ordem: valor cheio → co-fundador; o co-fundador continua por último e em destaque); os `checks` abaixo, em coluna única; **os dois valores continuam com o mesmo tamanho de fonte entre si** ao empilhar (o destaque vira **só cor**, nunca borda).

**Estados:** estático; sem imagens.

**Texto — verbatim da SPEC §5.12 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `INVESTIMENTO` | §5.12 |
| `titulo` | "A consultoria completa, pelo preço de quem entra na frente." | §5.12 |
| `planos[0]` | `VALOR CHEIO (APÓS AS 12 VAGAS)` · setup **R$ 1.500** · mês **R$ 297** | §5.12 |
| `planos[1]` | `CO-FUNDADOR · 12 VAGAS` · setup **R$ 500** · mês **R$ 197** *(destaque)* | §5.12 |
| `checks[0]` | "R$ 500 cobrado na entrega do MVP" | §5.12 |
| `checks[1]` | "Mensalidade começa depois da entrega — nos dias 5, 15 ou 25" | §5.12 |
| `checks[2]` | "Quando as 12 vagas acabarem, vale o valor cheio" | §5.12 |
| fala | comparar com custo de funcionário; R$ 2.200 fica na fala, não na tela | §5.12 |

---

### Slide 13 — A visão e a troca

**Rota/posição:** `/apresentacao` · **slide 13/14** · layout **`escuro`** (`renderEscuro`) · **fundo grafite**

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│ A VISÃO                                                        │  ← eyebrow MENTA #86CB92 (tela escura)
│ 52 empresas em 18 meses                                        │  ← título branco #EFEFEF
│                                                                │
│ A nossa visão é chegar em dezembro de 2028                     │  ← corpo #AEB6B4
│ com 52 empresas no grupo — com integrações                     │
│ e desenvolvimentos que vão surgindo.                           │
│                                                                │
│                                                                │
│ O foco hoje não é lucro. É prova                               │  ← "prova social real" realçado em MENTA no meio do parágrafo
│ social real: cada empresa que cresce                           │
│ vira a moeda que abre a próxima.                               │
│                                                                │
│                                                                │
│                                                                │
│ O sucesso da sua empresa é a nossa moeda de troca              │  ← fecho em MENTA #86CB92
│                                                                │
│ (tudo aqui é VISÃO — site, loja, marketplace,                  │  ← marca de visão (obrigatória)
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` **menta `#86CB92`** (tela escura) · `titulo` branco `#EFEFEF` · `corpo` `#AEB6B4` (a visão com prazo) · `destaque` com **"prova social real" realçado em menta dentro do parágrafo** · `fecho` (a troca) em **menta `#86CB92`** · **etiqueta de "visão"** discreta sinalizando que integrações/desenvolvimentos são futuro, **não entrega** (PRD §7).

> **Slide novo** (decisão **W10**): a v1 tem 13 slides e não tem contraparte para este. A sequência 1→12 é 1:1 com a v1; o slide 13 da v1 é o fecho (= nosso 14). Este slide é pintado com a **mesma gramática escura** dos outros: eyebrow menta, título branco, corpo `#AEB6B4`, fecho menta.
**Sem imagem** — o slide é declarativo.

**Mobile:** tudo em coluna única, na mesma ordem; o bloco-quote mantém-se destacado; a etiqueta de visão fica no rodapé do conteúdo.

**Estados:** estático; sem imagens.

**Texto — verbatim da SPEC §5.13 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `eyebrow` | `A VISÃO` | §5.13 |
| `titulo` | "52 empresas em 18 meses." | §5.13 |
| `corpo` | "…dezembro de 2028 com 52 empresas no grupo…" | §5.13 |
| `destaque` | "O foco hoje não é lucro. É **prova social real**…" | §5.13 |
| `fecho` | "O sucesso da sua empresa é a nossa moeda de troca." | §5.13 |
| regra | tudo aqui é explicitamente **visão** (D15/D16) | §5.13 |

---

### Slide 14 — Chamada para conversar

**Rota/posição:** `/apresentacao` · **slide 14/14** · layout **`encerramento`** (`renderEncerramento`) · **fundo grafite** · **slide mais importante do deck**

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────────────┐                                              │  ← LOGO topo-esquerdo sobre chip claro #E1E1E0 (mesmo do slide 1)
│  │[LOGO] UNIQ   │                                              │
│  └──────────────┘                                              │
│                                                                │
│                                               ▒▒▒▒▒▒▒▒▒        │  ← MELISSA: DIVERGÊNCIA DELIBERADA (a v1 não tem Melissa aqui — decisão do fundador)
│  O primeiro passo é uma conversa.            ▒▒▒▒▒▒▒▒▒▒        │  ← maior título do deck, branco #EFEFEF
│  ══════════════════════════                 ▒▒▒       ▒▒       │  ← SUBLINHADO MENTA #86CB92 sob a palavra-chave
│                                             ▒▒  [MEL]  ▒       │
│  Me conta como a sua empresa                ▒▒  corpo   ▒      │  ← subtítulo #AEB6B4
│  funciona hoje. A gente escuta,             ▒▒▒ inteiro ▒      │
│  diagnostica e desenha o caminho —                             │
│  mesmo que você queira pensar, a                               │
│  conversa é o ponto de partida.                                │
│                                                                │
│  UNIQ Empresas · Consultoria para pequenas e médias empresas   │  ← rodapé institucional · SEM preço em linha (o preço já está no slide 12)
│                                                                │
│ ╭──                                                            │  ← arcos decorativos verde-petróleo #2C3D42/#314747, canto inferior-esquerdo, sangrando do quadro · aria-hidden
│ │  ╭─                                                          │
│ ╰──╯                                                           │
└────────────────────────────────────────────────────────────────┘
```

**Blocos:** `[LOGO]` no **topo-esquerdo sobre chip claro `#E1E1E0`** (único slide, com o 1, que tem logo) · `titulo` **o maior do deck**, branco `#EFEFEF`, com **sublinhado menta `#86CB92`** sob a palavra-chave · `subtitulo` `#AEB6B4` (o convite, 3–4 linhas) · `[IMAGEM: melissa]` (corpo inteiro) · **arcos decorativos** `#2C3D42`/`#314747` no canto inferior-esquerdo (`aria-hidden`, nunca sobre o texto) · `rodape` institucional.
**Este é o último slide do deck — e o mais importante: é onde a conversão acontece.**

**NOTA — este bloco NÃO existe nesta versão:**

```
┌────────────────────────────────────────────────────────────────┐
│    ┌────────────────────────────────────────────────┐          │  ✗  não existe nesta versão
│    │ [ Falar com a MEL ]                            │          │
│    │                                                │          │
│    └────────────────────────────────────────────────┘          │
│                                                                │
│    ▢  ▢  ▢   ← QR code                                         │
│    wa.me/...  ← link                                           │
│ ✗  NÃO IMPLEMENTAR — P1 parkada (25/09/2026)                   │
└────────────────────────────────────────────────────────────────┘
```

> **O slide 14 fica SEM botão, SEM QR, SEM link, SEM tel, SEM WhatsApp.**
> **P1 está parkada** (25/09/2026): o fluxo n8n de conversa com a MEL já está ligado no WhatsApp, mas falta o prompt e a gravação legível. O fechamento, por ora, é **conversa + retorno humano** — e o texto do slide já diz isso ("mesmo que você queira pensar, a conversa é o ponto de partida").
> **Espaço reservado:** o bloco `[ Falar com a MEL ]` fica documentado acima como ponto de encaixe futuro, **sem espaço em branco reservado na tela** (a composição não deve ter um buraco vazio esperando o botão).

**Mobile:** `titulo` mantém o maior peso; arcos reduzem/sumem; **logo acima, Melissa abaixo**; subtítulo em largura total; `rodape` no fim, em corpo pequeno.

**Estados:** estático. Sem a Melissa → placeholder na mesma caixa; o logo e o texto **não se movem**. O `→` da casca fica **desabilitado** aqui (último slide) — o cliente **não fica preso sem saída**: pode voltar com `←`, pelas teclas ou pelo gesto.

**Texto — verbatim da SPEC §5.14 (não reescrever):**

| Campo | Palavras-chave (referência, não reescrita) | Fonte |
|---|---|---|
| `titulo` | "O primeiro passo é uma conversa." | §5.14 |
| `subtitulo` | "Me conta como a sua empresa funciona hoje…" · "…a conversa é o ponto de partida." | §5.14 |
| `imagem` | `melissa` + `logo` | §5.14 |
| `rodape` | "UNIQ Empresas · Consultoria para pequenas e médias empresas · Alto Tietê" | §5.14 |
| CTA | **nenhum** — sem botão/QR/link (P1 parkada) | §5.14 |

---

## 3. Mapa de imagens reservadas

> **Regra D17/§9:** o espaço é reservado **de qualquer forma**. Se a ilustração não for gerada, o prompt exato está no SPEC §6.2 para o fundador rodar na IA geradora. **Nunca tela em branco** (SPEC §9).

| Marcador | Slide | Origem do asset | Situação | Observação |
|---|---|---|---|---|
| `[LOGO]` | 1, 14 | `tracking/apresentacao/referencia/logo-uniq.png` | **A produzir** — hoje tem fundo branco sólido (D18) | Vai sobre **chip claro `#E1E1E0`**, o que reduz o problema; ainda assim o PNG transparente é o ideal |
| `[IMAGEM: melissa]` | 1, 9, 14 | `src/assets/mel-full.png` | Existe · **precisa de versão limpa** para painel escuro | **3/4 cortada no quadril** nos três slides (confirmado pelo fundador) |
| `◯` (avatar com anel menta) | 8 | `src/assets/mel-avatar.png` (ou recorte do `mel-full.png`) | Existe | **Único círculo do deck**; dentro do card lateral, não é bloco |
| `▸` `❝` (glifos de linha) | 6, 7, 8 | Ícone lucide, desenhado como linha em **menta `#86CB92`** | **Sem asset** — vetor | **Nunca** dentro de um círculo de fundo |
| marca d'água `01`–`03` | 6, 7, 8 | Numeral em `#E1E3E3`, `aria-hidden` | **Sem asset** — texto | Topo-direito, sangrando pela borda direita |
| `[IMAGEM: funil]` | 6 | Ilustração a produzir | **A produzir** | Prompt no SPEC §6.2 item 3 (funil da porta) |
| `[IMAGEM: medico]` | 10 | Ilustração a produzir | **A produzir** | Prompt no SPEC §6.2 item 4 (fórmula sob medida) |
| `[IMAGEM: dor]` | ~~2~~ | Ilustração a produzir | **Parkada (W8)** | **Fora do esqueleto da v1** — o slide 2 não tem imagem. Prompt no SPEC §6.2 item 2, caso entre |
| arcos decorativos | 14 | CSS/SVG (nenhum asset) | A desenhar | Verde-petróleo `#2C3D42`/`#314747`, canto inferior-esquerdo, `aria-hidden` |

**Direção obrigatória (DESIGN.md → Imagery):** ilustração vetorial sóbria, traço limpo, poucas cores (`#86cb92` menta · `#1f2937` grafite sobre `#efefef`), enquadramento próximo, muito respiro.
**Evitar (obrigatório):** aperto de mão · reunião · pessoas sorrindo para a câmera · terno/carro/dinheiro · robô/chip/engrenagem/código · gráficos de crescimento, setas e cifrões.

**Substituição sem quebrar:** cada marcador tem um **placeholder** do mesmo tamanho com `alt` descritivo no `<img>` real; o layout não muda de proporção com ou sem a imagem.

---

## 4. Tokens e regras transversais

> **Hex medidos** — extraídos pixel a pixel de `tracking/apresentacao/referencia/slide-01..13.png` e registrados em `tracking/apresentacao/LEITURA_VISUAL_DECK_V1.md`. Não são mais "aparente" nem "a confirmar".

| Papel | Valor | Onde |
|---|---|---|
| Fundo claro (canvas) | **`#EFEFEF`** | slides 3, 4, 5, 6, 7, 8, 10, 11 |
| Fundo escuro (tela cheia) | **`#1F2937`** grafite | slides 2, 9, 12, 13, 14 + o painel direito da capa |
| **Título em tela clara** | **`#3E5653`** verde-escuro da v1 | slides 3, 4, 5, 6, 7, 8, 10, 11 · **exceção D22 confirmada** |
| **Título da capa** | **`#1F2937`** grafite | **medido na v1: a capa é grafite, não verde** |
| **Eyebrow em tela clara** | **`#627271`** | slides 3, 4, 5, 6, 7, 8, 10, 11 |
| **Eyebrow em tela escura** | **`#86CB92`** menta | slides 2, 9, 12, 13, 14 |
| Título de item (tela clara) | **`#1A1A1A`** | slides 6, 7, 8 (título de cada item da lista) |
| Corpo / apoio (tela clara) | **`#627271`** | descrições, `checks`, metadados |
| Corpo (tela escura) | **`#AEB6B4`** | slides 2, 9, 12, 13, 14 — **nunca `#627271` no escuro** |
| Accent / destaques | **`#86CB92`** menta | sublinhados, glifos, `✓`, conectores, progresso, hover |
| **Marca d'água `01`–`03`** | **`#E1E3E3`** | slides 6, 7, 8 — `aria-hidden="true"` |
| **Chip do logo** | **`#E1E1E0`** | slides 1 e 14, atrás do logo |
| **Faixa do slide 10** | **`#3E5653`** | a faixa de rodapé do método usa o **mesmo** token do título verde |
| **Arcos decorativos** | **`#2C3D42` / `#314747`** | slide 14, canto inferior-esquerdo, `aria-hidden` |
| Divisórias entre colunas | 1px na cor do texto, ~15% de opacidade | slides 3, 4, 5, 11, 12 |
| Tipografia | Poppins 400/700 | `DESIGN.md` |

**Regras que atravessam o deck inteiro:**

1. **Ritmo claro/escuro preservado** (D2): escuros = 2 · 9 · 12 · 13 · 14 · split = 1 · claros = 3 · 4 · 5 · 6 · 7 · 8 · 10 · 11. A sequência de fundos não é decorativa — é o arco emocional da narrativa.
2. **O título da capa é `#1F2937` (grafite), não `#3E5653`.** É a única tela clara onde o verde-escuro **não** aparece. Todos os demais títulos de fundo claro usam `#3E5653`.
3. **Marca d'água `01`/`02`/`03`** só nos slides 6, 7 e 8. Escala gigante, **topo-direito, sangrando pela borda direita**, `aria-hidden="true"` (é número repetido no texto — não anunciar).
4. **Melissa presente** nos slides 1, 8 (avatar), 9 e 14 — **sempre 3/4, cortada no quadril**. É a prova visual, não o assunto.
5. **O logo aparece só nos slides 1 e 14**, sempre sobre o chip claro `#E1E1E0`, sempre no topo-esquerdo.
6. **Divisórias verticais finas entre colunas** nos slides 3, 4, 5, 11 e 12 — **régua, não caixa**. A v1 não usa cards para separar colunas.
7. **O único círculo do deck é o avatar da Melissa** (slide 8), com anel menta `#86CB92`. Todo item dos slides 6, 7 e 8 usa **glifo de linha sem círculo de fundo**.
8. **Takeaway final sem caixa** nos slides 3, 4, 5 e 11: é texto em **verde-escuro `#3E5653` negrito**, direto no fundo claro. **Proibido** faixa, régua ou bloco destacado por trás.
9. **Ícones têm função** — cada item com `icone` comunica um pilar do que muda. Sem ícone decorativo e sem ícone de tecnologia (robô/chip/código — a marca **nega** ser "empresa de tecnologia", §5.5).
10. **Todo slide tem hierarquia em 3 níveis:** `eyebrow` (versalete) → `titulo` (peso maior) → `subtitulo`/`corpo` (peso secundário). Slides sem `eyebrow` (2) mantêm título → subtítulo.
11. **Um destaque por slide** — `destaque` (quote/faixa) ou `fecho`, nunca os dois disputando atenção.
12. **Realce menta no meio da frase** (não em bloco): slides 2 (última afirmação), 9 (fecho), 13 (realce dentro do parágrafo).
13. **Nenhum texto promete o que não existe** (PRD §7): site, loja virtual, marketplace, tráfego pago = **visão** (slide 13) · trilhas = **visão** (slide 8) · 52 parceiros = **visão** (slide 13).
14. **Sem "pagamento na inicialização"** (D11) · **sem "retorno garantido em 90 dias"** (A1) · **sem fidelidade na tela** (D12) · **sem escassez clichê** ("nunca mais", §5.11).
15. **Sem numeração de página** em nenhum slide interno. O contador `X / 14` é da casca (§1).

---

## 5. Checklist de verificação

> Mesmo contrato do SPEC §11 — o implementador marca aqui e no `tracking/TRACKING.md`.

- [ ] Rota `/apresentacao` abre **pública**, `noindex, nofollow`, título "UNIQ Empresas — Apresentação"
- [ ] **14 slides** na ordem da espinha (§5); capa com headline/subtítulo D21
- [ ] Identidade da v1: ritmo claro/escuro, **títulos claros em `#3E5653`**, **capa em `#1F2937`**, menta nos destaques
- [ ] Tokens batem com §4: `#EFEFEF` · `#1F2937` · `#3E5653` · `#86CB92` · `#627271` · `#1A1A1A` · `#AEB6B4` · `#E1E3E3` · `#E1E1E0` · `#2C3D42`/`#314747`
- [ ] **Takeaway sem caixa** nos slides 3, 4, 5 e 11 (verde-escuro negrito, sem faixa)
- [ ] **Régua, não card**, entre colunas nos slides 3, 4, 5, 11 e 12
- [ ] **Nenhum círculo** além do avatar da Melissa (slide 8); itens com glifo de linha menta
- [ ] Marca d'água `01`–`03` `#E1E3E3` **sangrando pela borda direita** nos slides 6, 7 e 8
- [ ] Slide 10: faixa de rodapé `#3E5653` com conectores horizontais e números menta
- [ ] Slide 12: cinza `#AEB6B4` à esquerda, menta `#86CB92` à direita, `✓` menta, **sem borda e sem caixa**
- [ ] Logo **só** nos slides 1 e 14, sobre chip `#E1E1E0`
- [ ] **Sem numeração de página** nos slides internos
- [ ] 3 pilares com os nomes decididos (D6/D7/D8) e **numeração 01/02/03** com marca d'água
- [ ] **Nenhuma promessa do que não existe** (site/loja/marketplace/tráfego/trilhas/52 = visão)
- [ ] Slide 12: dois preços **no mesmo tamanho**; checks "R$ 500 na entrega do MVP" + dias 5/15/25
- [ ] Sem "pagamento na inicialização" e sem "retorno garantido em 90 dias" (A1)
- [ ] **Slide 14: chamada para conversar, SEM botão/QR/link (P1)**
- [ ] Navegação: botões, teclado (←/→), swipe (≥ 48px), progresso, contador — desktop e mobile
- [ ] A11y: `aria-label` "Slide X de 14", `aria-live` no contador, `role="progressbar"`, foco visível, contraste AA
- [ ] Ícones sem gráfico de crescimento/seta/cifrão e sem ícone de tecnologia
- [ ] `alt` em todas as imagens; **layout não quebra sem asset** (placeholder do mesmo tamanho)
- [ ] Mobile: split da capa empilha · colunas 3→2→1 · preço empilhado · caminho do s11 quebra
- [ ] `npx tsc --noEmit` sem erros novos · `npm run build` ✅ · Vercel `READY`
- [ ] `tracking/TRACKING.md` atualizado

---

## 6. Pontos que precisam de decisão do fundador

| # | Ponto | Por que precisa do fundador | Impacto |
|---|---|---|---|
| **1** | ~~Hex exato do verde escuro da v1~~ **RESOLVIDO** | A leitura visual mediu pixel a pixel: `#3E5653`. D22 confirmado e registrado no §4. | **Fechado** |
| **2** | **P1 — CTA do slide 14** | O layout já está desenhado **sem** o botão. Quando o fluxo n8n ativar, é preciso decidir: (a) botão "Falar com a MEL" abaixo do subtítulo, (b) botão + QR impresso (P4), ou (c) link em `wa.me`. **O WIRE já deixa o ponto de encaixe documentado.** | Baixo agora · médio na Semana 4 |
| **3** | **P4 — QR/atalho impresso** | Depende de P1. Se houver, muda o layout do slide 14 (QR ao lado da Melissa). | Baixo |
| **4** | **Assets transparentes** (logo e Melissa) | D18/L4: o logo hoje tem **fundo branco**. O chip claro `#E1E1E0` reduz o problema, mas o PNG transparente continua sendo o ideal. **Médio**: afeta os slides 1 e 14. | **Médio** |
| **5** | **Ilustrações do funil da porta** (s6) e **fórmula** (s10) | D17: o WIRE reserva o espaço, mas o deck só fica completo com as 2 ilustrações. Gerar com IA ou esperar o fundador rodar os prompts? (A cena de `dor` do s2 saiu do escopo — ver W8.) | **Médio** |
| **6** | **Confirmação visual da v1** **RESOLVIDO** | A leitura visual real (`LEITURA_VISUAL_DECK_V1.md`) mediu os hex e descreveu a gramática slide a slide. Este WIRE foi refeito a partir dela. Resta apenas a conferência do fundador em cima do deck montado. | **Fechado** |
| **7** | **Rótulo "visão" no slide 13** | O PRD/SPEC exigem que site/loja/marketplace/tráfego sejam explicitamente visão, mas o §5.13 **não traz um texto de rótulo**. Este WIRE propõe uma etiqueta discreta — é **sugestão, não decisão**. O fundador pode preferir que a linguagem de visão apareça só na fala. | Baixo |
| **W8** | **Imagem do slide 2 (`dor`) sai do esqueleto** | A v1 **não tem ilustração no slide 2** — a coluna direita é o bloco de afirmações. Segui a v1 e deixei a ilustração de balcão+WhatsApp **parkada** (o prompt continua pronto no SPEC §6.2 item 2). O fundador pode: (a) manter sem imagem, (b) entrar como terceira faixa no mobile, (c) nunca usar. | Baixo |
| **W9** | **Card lateral da Melissa no slide 8** | A v1 traz 3 itens em lista simples; o deck novo acrescenta o card da Melissa à direita para fechar o objetivo 3 no mesmo grau dos slides 6 e 7. É divergência **deliberada** — confirmar que fica. | Baixo |
| **W10** | **Slide 13 (A VISÃO) não existe na v1** | A v1 tem 13 slides; a sequência 1→12 é 1:1 e o slide 13 da v1 é o fecho (= nosso 14). O **slide 13 "A VISÃO"** é conteúdo novo do deck novo, pintado com a gramática escura da v1. Confirmar a posição. | Baixo |

---

*WIRE criado em 26/09/2026. Aguarda aprovação do fundador para liberar a implementação (lanes L1 → L2 → L3 do SPEC §10, com L4 em paralelo).*
