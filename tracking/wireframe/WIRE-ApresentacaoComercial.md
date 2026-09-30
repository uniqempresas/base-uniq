# WIRE — Apresentação Comercial UNIQ Empresas (rota `/apresentacao`)

> **Documento de estrutura e função.** O design real é criado no OpenDesign; no repositório entrega-se o esqueleto.

> **PRD:** `tracking/plans/PRD-ApresentacaoComercial.md` (✅ aprovado pelo fundador em 25/09/2026)
> **SPEC:** `tracking/specs/SPEC-ApresentacaoComercial.md` (conteúdo aprovado, §5 · tipos, navegação, tokens)
> **ROTEIRO:** `tracking/apresentacao/ROTEIRO_APRESENTACAO.md` — ✅ **aprovado pelo fundador em 30/09/2026**
> **WIRE:** este documento
> **Status:** 🔶 Rascunho — **aguarda aprovação do fundador** para liberar a implementação
> **Regra de ouro:** sem WIRE aprovado, não se escreve código de tela.
> **Base visual:** v1 (`tracking/apresentacao/referencia/slide-01..13.png`) — identidade grafite + menta, Melissa presente, ritmo claro/escuro, hierarquia, marca d'água `01/02/03`, faixa escura de chamada.
> **Gate:** `npx tsc --noEmit` sem erros novos · `npm run build` ✅ · Vercel `READY`

**O que mudou em 30/09/2026:** o deck passa a ter **menos texto na tela e mais guia visual**. O texto que sai da tela não se perde — ele vai para o `ROTEIRO_APRESENTACAO.md`, onde o fundador o fala. A gramática visual de referência veio do PDF de apoio (a "3 caixas" da página 2, a imagem de apoio da página 3, a linha do tempo da página 7), **mas a identidade é a da UNIQ**: nada da paleta azul do PDF, nada de banco de imagens.

> ## 🔒 A divisão tela/fala está FECHADA
>
> O `ROTEIRO_APRESENTACAO.md` foi **aprovado pelo fundador em 30/09/2026**. A divisão 🖥️ / 🗣️ é **contrato**: **este WIRE não pode mais mover texto de tela para fala, nem da fala para a tela.** Ele só pode:
> - escolher a **palavra** dentro dos trechos que o roteiro deixou soltos ("curtos", "1 linha", "só título") — sempre fiel ao SPEC §5;
> - **desenhar** a estrutura que sustenta esse texto.
>
> **Consequência registrada:** em 4 slides o texto aprovado do roteiro **estoura** a faixa de 180–260 caracteres. Onde isso acontece, **o roteiro vence** e a exceção fica registrada com o número exato em §2 e §7 — não se corta conteúdo aprovado só para caber num número.

**Decisões herdadas que continuam valendo:** D2 (seguir a v1 + ritmo claro/escuro) · D3 (reconstruir do zero) · D4 (14 slides) · D5 (MEL e Melissa convivem) · D10 (dois preços com o mesmo peso) · D15 (slide 13 é visão) · D20 (rota pública) · D21 (headline e subtítulo da capa) · D22 (verde escuro da v1 nos títulos de telas claras — exceção ao `DESIGN.md`) · A1 (sem "90 dias") · P1 (CTA do slide 14 **parkado**) · P3 (`noindex`).

**Decisões travadas em 30/09/2026 (this WIRE):**

| # | Decisão | Efeito |
|---|---|---|
| **D23** | **180–260 caracteres visíveis por slide** (meta; total medido: 3.524). O que sai da tela vai para o roteiro | **10 de 14** na faixa; 4 exceções registradas em §2 e §7 (slides 3, 4, 5 e 13) |
| **D24** | **O slide 2 recebe a ilustração de dor** (balcão + WhatsApp) à direita | Ativa a antiga W8, que estava parkada |
| **D25** | **A marca de visão do slide 13 fica na tela** | Fecha o ponto 7 da lista de decisões anterior |
| **D26** | **A régua fina entre colunas é mantida** nos slides 3, 5 e 11 | A v1 medida tem régua; o PDF de apoio não tem. Mantemos a régua |
| **D27** | **Os 14 slides e a ordem não mudam** | Só a estrutura interna de cada um |

**Regras que atravessam o deck (nova redação, valendo para os 14 slides):**

1. **180–260 caracteres visíveis por slide.** Item verificável em §6.
2. **Coluna = marcador + título + 1 linha.** Nunca mais que isso. O resto é fala.
3. **Régua, nunca caixa.** As colunas são separadas por uma linha de 1 px; **sem borda e sem fundo**.
4. **Um título por slide. No máximo 3 itens** — exceto o slide 8, que já tem o bloco lateral da Melissa.
5. **Uma imagem de apoio por slide, sangrando pela metade.** Ela ocupa metade do quadro e vai até o topo e a base; não é enfeite dentro do slide.
6. **Uma ordem do tempo é uma linha do tempo:** marcadores igualmente espaçados, ligados por **linha pontilhada**, lidos da esquerda para a direita.
7. **Um destaque por slide** — o `destaque` ou o `fecho`, nunca os dois disputando atenção.
8. **O rodapé de 20% a 30% da altura fica vazio.** O respiro é parte da composição, não sobra de espaço.

---

## Índice

1. [Casca do deck (estrutura comum)](#1-casca-do-deck--estrutura-comum)
2. [Orçamento de texto por slide](#2-orçamento-de-texto-por-slide)
3. [Slides 1 a 14](#3-slides-1-a-14)
4. [Mapa de imagens reservadas](#4-mapa-de-imagens-reservadas)
5. [Tokens e regras transversais](#5-tokens-e-regras-transversais)
6. [Lista de verificação](#6-lista-de-verificação)
7. [Pontos que precisam de decisão do fundador](#7-pontos-que-precisam-de-decisão-do-fundador)

---

## 1. Casca do deck (estrutura comum)

**Rota:** `/apresentacao` (pública, sem login, `noindex, nofollow` — P3)
**Uma única tela** que troca de conteúdo. Não há lista de slides, menu, sumário nem rolagem entre slides.

### 1.1 Estrutura da página (slide genérico)

```
┌─────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← barra de progresso (MENTA #86CB92 sobre trilho cinza)
│                                                                 │
│     ┌───────────────────────────────────────────────────┐      │
│     │                                                   │      │
│     │                  área do slide                    │      │
│     │                                                   │      │
│     │                                                   │      │
│     │                                                   │      │
│     │                                                   │      │
│     │                                                   │      │
│     │                                                   │      │
│     │                                                   │      │
│     │                                                   │      │
│     │                                                   │      │
│     └───────────────────────────────────────────────────┘      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤  ← rodapé fixo (não é numeração de página)
│    (←)                      3 / 14                 (→)         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Anatomia da casca

| Faixa | Altura | Comportamento |
|---|---|---|
| **Barra de progresso** | fina (2–4 px), no topo, encostada na borda | Preenchimento proporcional `indice/TOTAL_SLIDES`; menta sobre trilho cinza; `transition` na troca; `role="progressbar"` + `aria-valuenow` |
| **Área do slide** | ocupa toda a altura restante | Um slide por vez; centralizado; sem rolagem interna; volta ao topo a cada troca |
| **Rodapé fixo** | fixo no rodapé da janela | Botão `←` · contador `X / 14` · botão `→` |

### 1.3 Componentes da casca

| Componente | Papel | Requisitos |
|---|---|---|
| `BarraProgresso` | Mostra o quanto do deck já foi visto | Fina, no topo; menta sobre cinza; `aria-valuenow`; transição na troca |
| `BotaoAnterior` | Volta um slide | Circular; 48 px de alvo de toque; **desabilitado no slide 1**; foco visível |
| `BotaoProximo` | Avança um slide | Circular; 48 px; **desabilitado no slide 14**; foco visível |
| `Contador` | "X / 14" | Sempre visível; `aria-live="polite"` |
| `AreaSlide` | Renderiza `SLIDES[indice]` pelo arranjo do slide | Delegado ao arranjo; nunca quebra se faltar imagem |
| `Meta` | `noindex, nofollow` + título "UNIQ Empresas — Apresentação" | Aplicado enquanto a página está aberta |

### 1.4 Navegação (as quatro formas convivem — apresentação ao vivo, D1)

| Entrada | Comportamento |
|---|---|
| **Botão `←` / `→`** | Um passo por clique; desabilitado nas pontas; não dá retorno ao primeiro ao passar do último |
| **Teclado** | `ArrowLeft` / `ArrowRight` trocam de slide — **ignorar quando o foco estiver em `INPUT`, `TEXTAREA` ou `contentEditable`** |
| **Deslize horizontal (toque)** | Horizontal; limiar **≥ 48 px** para contar como troca; `touch-pan-y` preserva a rolagem vertical |
| **Barra e contador** | Indicativos, não clicáveis |

### 1.5 Acessibilidade

- `aria-label` por slide: **"Slide X de 14"** no contêiner do slide.
- Contador com `aria-live="polite"`.
- Barra com `role="progressbar"` + `aria-valuenow={indice+1}` + `aria-valuemin={1}` + `aria-valuemax={14}`.
- Foco visível em `←` e `→`; ordem de tabulação: `←` → `→`.
- Contraste **AA** em todos os pares de texto e fundo (atenção aos slides grafite, onde o texto secundário `#627271` precisa da variante clara `#AEB6B4`).
- `alt` descritivo em **todas** as imagens; elemento decorativo (arcos do slide 14) com `aria-hidden`.

### 1.6 NOTA — o deck inteiro não tem chamada para ação

> **O slide 14 NÃO tem botão, NÃO tem código QR, NÃO tem link, NÃO tem telefone, NÃO tem WhatsApp.**
> A decisão **P1 está parkada**. O fechamento é **conversa e retorno humano** — e o texto do slide já diz isso.
> A única área clicável da casca são os botões `←` e `→`.
> Quando o fluxo da Melissa ativar, a chamada entra **no lugar do bloco reservado P1** do slide 14 (§3.14) — não antes.

### 1.7 Celular da casca

- Barra de progresso e rodapé **mantêm a mesma posição** em todas as larguras.
- Contador permanece **centralizado** entre os botões.
- Alvos de toque de 48 px mantidos (o rodapé é a única área com alvos tocáveis).

---

## 2. Orçamento de texto por slide

Medido como a soma de todo o texto pintado na tela: `eyebrow`, título, subtítulo, corpo, rótulos e títulos de item, corpos de item, `destaque`, `fecho`, `checks`, eixo do slide 11 e rodapé do slide 14. **Não contam** rótulos de `alt`, marcadores de posição e o texto que vive apenas na fala.

**Medição de referência ("antes"):** texto pintado no artefato publicado (`public/apresentacao/index.html`), lido slide a slide.
**Medição de referência ("depois"):** coluna 🖥️ do `ROTEIRO_APRESENTACAO.md` **aprovado**, somando o texto literal do roteiro e a palavra escolhida nos trechos que ele deixou soltos.

| Slide | Antes | Depois | Diferença | 180–260 |
|---:|---:|---:|---:|:---:|
| 1 — Capa | 177 | 206 | +29 | ✅ |
| 2 — Apagando incêndio | 264 | 253 | −11 | ✅ |
| 3 — O custo de continuar assim | 325 | 277 | −48 | ⚠️ **+17** |
| 4 — Por que a UNIQ existe | 482 | 265 | **−217** | ⚠️ **+5** |
| 5 — Três objetivos | 414 | 339 | −75 | ⚠️ **+79** |
| 6 — Objetivo 1 | 544 | 226 | **−318** | ✅ |
| 7 — Objetivo 2 | 427 | 210 | **−217** | ✅ |
| 8 — Objetivo 3 | 507 | 252 | **−255** | ✅ |
| 9 — Melissa | 257 | 210 | −47 | ✅ |
| 10 — Método do médico | 447 | 252 | −195 | ✅ |
| 11 — Por que entrar agora | 417 | 253 | −164 | ✅ |
| 12 — Investimento | 273 | 260 | −13 | ✅ |
| 13 — A visão | 365 | 262 | −103 | ⚠️ **+2** |
| 14 — Encerramento | 224 | 259 | +35 | ✅ |
| **TOTAL** | **5.123** | **3.524** | **−1.599 (−31,2%)** | **10 de 14 na faixa** |

**Leitura honesta do número.** A faixa de 180–260 era a meta herdada da direção de 30/09. Com o roteiro **aprovado e travado**, ela deixa de ser alcançável em 4 slides: o texto que o fundador aprovou simplesmente não cabe. A decisão aqui é explícita — **o roteiro vence e a exceção fica escrita** — em vez de aparar copy aprovada só para fechar a planilha. Nenhum texto aprovado foi perdido: o que não coube na tela foi para a fala, e o que ficou na tela é o que o roteiro marcou como 🖥️.

- **Slides 3, 4 e 13** estouram por poucos caracteres (+17, +5, +2) e são **100% texto literal do roteiro**. Não há o que encurtar sem mexer em frase aprovada — a correção, se o fundador quiser, é no roteiro, não no WIRE.
- **Slide 5** é o caso de verdade (+79): ver §7, ponto 1.
- **Slides 1 e 14** sobem um pouco porque o roteiro aprovou o subtítulo e o rodapé completos, e a medição anterior do artefato os contava mais curto. Os dois já estavam dentro da faixa.
- **Total:** 3.524 caracteres visíveis (era 5.123) — queda de 31,2% de densidade de texto, com a fala preservando tudo o que saiu da tela.

---

## 3. Slides 1 a 14

**Legenda dos marcadores de espaço reservado:**

| Marcador | Significado |
|---|---|
| `[LOGO]` | Logo UNIQ sobre **chip claro `#E1E1E0`** — só nos slides 1 e 14 |
| `[IMAGEM: melissa]` | Melissa **3/4, cortada na altura do quadril** (slides 1, 9 e 14) — fundo limpo/transparente |
| `◯` | **Avatar circular com anel menta `#86CB92`** — o único círculo do deck (slide 8) |
| `▸` `❝` | **Glifo de linha em menta `#86CB92`, sem círculo de fundo** (slides 6, 7 e 8) |
| `01`–`03` gigante | **Marca d'água numérica `#E1E3E3`**, topo-direito, sangrando pela borda direita (slides 6, 7 e 8) · `aria-hidden` |
| `01` `02` `03` menta | **Número gigante** do pilar (slide 5) · `1` `2` `3` menta no slide 10 |
| `╌╌╌` | **Linha pontilhada** — conector de linha do tempo (slides 10 e 11) |
| `[IMAGEM: dor]` | Ilustração do balcão com WhatsApp — slide 2 |
| `[IMAGEM: funil]` | Ilustração do funil da porta — slide 6 |
| `[IMAGEM: margem]` | Ilustração de custos e parceria — slide 7 |
| `[IMAGEM: medico]` | Ilustração da receita sob medida — slide 10 |

> **Sem numeração de página** em nenhum slide interno. O contador `X / 14` pertence à casca (§1).

---

### Slide 1 — Capa

**Posição:** slide 1/14 · arranjo **`capa`** · divisão claro/escuro

```
┌────────────────────────────────┬────────────────────────────────┐
│ ┌──────────────┐                │                                │
│ │[LOGO] UNIQ   │                │      ▒▒▒▒▒▒▒▒▒                │
│ └──────────────┘                │     ▒▒▒▒▒▒▒▒▒▒                │  ← Melissa 3/4, cortada no quadril
│                                │    ▒▒       ▒▒                │
│ ALTO TIETÊ · CONSULTORIA       │    ▒▒  [MEL]  ▒                │  ← título em GRAFITE #1F2937
│                                │    ▒▒  corpo   ▒               │
│ Sua empresa não precisa        │    ▒▒▒ 3/4    ▒                │  ← sublinhado MENTA sob "mais esforço seu"
│ de mais esforço seu.           │    ▒▒▒▒▒▒▒▒▒▒▒                │
│ ═══════════                    │                                │
│                                │                                │
│ No dia a dia, tudo depende     │                                │
│ de você — e não sobra tempo    │                                │
│ para olhar o todo. Sua         │                                │
│ empresa precisa de alguém      │                                │
│ que cuide dela e aponte        │                                │
│ o caminho.                     │                                │
│                                │                                │
└────────────────────────────────┴────────────────────────────────┘
```

**Blocos:** `logo` (topo-esquerdo, sobre **chip claro `#E1E1E0`**) · `eyebrow` em `#3E5653` · `titulo` em **GRAFITE `#1F2937`** com **sublinhado menta** em "mais esforço seu" · `subtitulo` em `#627271` · painel **grafite `#1F2937`** à direita (~38% da largura) com a Melissa.

> ⚠️ **O título da capa é GRAFITE, não verde.** É a única tela clara fora da regra do `#3E5653`.

**Espaço de imagem:** `[LOGO]` + `[IMAGEM: melissa]`.
**Os 3 pilares NÃO entram na capa** (D21 — ficam no slide 5).

**Celular:** a divisão **empilha** — a metade clara primeiro, a metade grafite com a Melissa abaixo, mantendo o contraste como faixa de fechamento.

**Estados:** estático. Sem a imagem da Melissa → o painel **permanece grafite** e mostra o espaço reservado (nunca bloco branco, nunca quebra a divisão). Sem logo transparente → mesmo espaço reservado.

**Texto visível (🖥️):** o roteiro, slide 1. **206 caracteres.**

---

### Slide 2 — O dia apagando incêndio

**Posição:** slide 2/14 · arranjo **`escuro`** · fundo grafite · **D24: a ilustração de dor entra aqui**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│ O dia inteiro apagando incêndio.              ▒▒▒▒▒▒▒▒▒▒         │
│ E o negócio sem sair do lugar.                ▒▒▒▒▒▒▒▒▒▒▒        │  ← título branco #EFEFEF (1ª linha do conteúdo) + subtítulo curto logo abaixo
│                                            ▒▒           ▒▒       │
│ — Atendimento, operação, fornecedor        ▒▒  [IMAGEM:  ▒       │  ← imagem SANGRA: ocupa a metade direita, do topo à base
│   e caixa passam por você.                  ▒▒   dor]      ▒      │     (balcão de comércio de bairro + celular com mensagens)
│                                            ▒▒           ▒▒       │
│ — Não sobra tempo para                      ▒▒▒▒▒▒▒▒▒▒▒▒▒        │
│   olhar o mercado.                          ▒▒▒▒▒▒▒▒▒▒▒▒▒        │
│                                            ▒▒▒▒▒▒▒▒▒▒▒▒▒        │
│ — E não sobra caixa para                                          │
│   contratar quem saiba.                                              │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Você é mais jogador do jogo do que pensador do jogo.         │ │  ← QUOTE DE 1 LINHA, no rodapé do slide
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Blocos:** `titulo` branco `#EFEFEF` no topo + `subtitulo` curto logo abaixo · **3 bullets com travessão `—`, sem ícones** na coluna esquerda · `[IMAGEM: dor]` **sangrando na metade direita**, do topo à base do slide · **`destaque` como uma única linha no rodapé**, com barra menta à esquerda e "jogador" realçado em menta.

**Sem `eyebrow`** — decisão do fundador em 26/09/2026; o campo também não existe no roteiro.

> **Estrutura nova (D24):** o texto ocupa a metade esquerda, a imagem a direita, e o **quote sai do meio do slide e desce para o rodapé em uma linha**. Antes o `destaque` ocupava a coluna direita inteira — o que disputava espaço com a imagem.

**Celular:** texto primeiro (título, subtítulo, 3 bullets), depois a imagem em largura total, e o quote por último. A imagem **não** é cortada na altura.

**Estados:** estático. Sem a ilustração → espaço reservado do mesmo tamanho, mantendo o texto exatamente onde está.

**Texto visível (🖥️):** o roteiro, slide 2. **253 caracteres.**

---

### Slide 3 — O custo de continuar assim

**Posição:** slide 3/14 · arranjo **`colunas`** · fundo claro

```
┌─────────────────────────────────────────────────────────────────┐
│ O CUSTO DE CONTINUAR ASSIM                                       │  ← eyebrow #627271 (tela clara)
│ Trabalhar mais não resolve                                       │  ← título #3E5653
│                                                                 │
│   ▸            │   ▸            │   ▸                            │  ← marcador de linha em MENTA, SEM caixa, SEM círculo
│                                                                 │
│ VENDER        │ DECIDIR        │ CRESCER                        │  ← título de coluna #3E5653
│               │                │                                 │
│ Sem margem    │ Sem dados,     │ Preso à operação,               │  ← UMA LINHA por coluna (#627271). O resto vai para a fala
│ real, você    │ cada escolha   │ você é o funcionário            │
│ lucra menos   │ vira aposta.   │ do próprio negócio.             │
│ vendendo mais.│                │                                 │
│               │                │                                 │
│                                                                 │
│                                                                 │
│ O problema não é esforço.                                       │  ← takeaway em VERDE-ESCURO #3E5653 NEGRITO, SEM FAIXA
│ É a falta de estrutura para crescer.                            │
└─────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` `#3E5653` · **3 colunas separadas por régua vertical fina** (D26) — **sem borda e sem fundo** · marcador `▸` menta acima de cada coluna · **1 linha de corpo por coluna** · `destaque` como **takeaway `#3E5653` negrito, sem caixa**.

> **Estrutura nova:** as colunas passam de texto corrido de 3 linhas para **marcador + título + 1 linha**. O rodapé de 20% da altura fica vazio de propósito — é o respiro que faz as 3 colunas lerem como "3 caixas".

**Celular:** 3 colunas → 2 (tablet) → 1. Com 1 coluna as réguas viram **linhas horizontais**; o `destaque` fecha a tela.

**Estados:** estático, sem imagens.

**Texto visível (🖥️):** o roteiro, slide 3. **277 caracteres** — ⚠️ **17 acima da faixa**. Slide 100% literal do roteiro aprovado; o excesso está registrado em §2 e §7, ponto 2.

---

### Slide 4 — Por que a UNIQ existe

**Posição:** slide 4/14 · arranjo **`duasColunas`** · fundo claro · **o slide que mais encolhe**

```
┌─────────────────────────────────────────────────────────────────┐
│ POR QUE A UNIQ EXISTE                                            │  ← eyebrow #627271
│ Eu vi os dois lados desse jogo                                   │  ← título #3E5653
│                                                                 │
│ Nas grandes empresas          │ Na minha gráfica B2B           │  ← 2 colunas com RÉGUA FINA central
│                                │                                 │
│ Analista de sistemas           │ Gente talentosa e              │  ← UMA LINHA por coluna
│ desde 2011 — Santander         │ esforçada, sem as              │
│ e Ultragaz.                    │ mesmas ferramentas.            │
│                                │                                 │
│                                │                                 │
│                                │                                 │
│ Levar para o pequeno o que a grande empresa já usa para vencer.   │  ← fecho: takeaway #3E5653 negrito, SEM CAIXA
└─────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` `#3E5653` · 2 colunas com régua central · cada coluna com `rotulo` + **uma única linha** · `fecho` como **takeaway `#3E5653` negrito, sem caixa**.

> **Estrutura nova:** de 482 para 265 caracteres. **Este é o slide da fala, não da leitura** — o fundador conta a história em voz alta (o contato com a alta diretoria, o que ele aprendeu sobre conhecimento de mercado e ferramentas, o contraponto dos pequenos empreendedores) e a tela só ancora os dois lados e o fecho. O texto que saiu está no 🗣️ do roteiro, slide 4.

**Celular:** as 2 colunas **empilham** (empresa grande → gráfica), a régua vira linha horizontal, `fecho` abaixo.

**Estados:** estático; sem imagens.

**Texto visível (🖥️):** o roteiro, slide 4. **265 caracteres** — ⚠️ **5 acima da faixa**. Slide 100% literal do roteiro aprovado; registrado em §2 e §7, ponto 2.

---

### Slide 5 — Três objetivos

**Posição:** slide 5/14 · arranjo **`colunas`** · fundo claro

```
┌─────────────────────────────────────────────────────────────────┐
│ A UNIQ EMPRESAS                                                  │  ← eyebrow #627271
│ Três objetivos. Um só parceiro.                                  │  ← título #3E5653
│ Temos tecnologia — não somos uma empresa de tecnologia.          │  ← corpo curto — a linha de posicionamento
│                                                                 │
│                                                                 │
│  █████        ██          │█████ █████         │█████ █████        │  ← NÚMEROS GIGANTES 01/02/03 em MENTA #86CB92
│  █   █        ██          │█   █    ██         │█   █  ███        │     **NUNCA viram caixa** — são o marcador, não o bloco
│  █████ █████  ██          │█████ █████         │█████ █████        │
│                                                                 │
│ Aumento de         │Aumento de         │Transformação        │  ← título de pilar #3E5653
│ Faturamento        │Margem             │do Empreendedor      │
│                    │                   │em Empresário        │
│                    │                   │                      │  ← o roteiro pede "1 linha cada" por pilar:
│ Trazer mais        │Não trabalhar      │De jogador a quem     │     as três linhas de apoio ficam NA TELA,
│ dinheiro e dar     │muito e ganhar     │controla o jogo.      │     uma por pilar, em #627271
│ fôlego.            │pouco.             │                      │
│                                                                 │
│                                                                 │
│ Consultoria + tecnologia a serviço do objetivo.                  │  ← takeaway #3E5653 negrito, SEM CAIXA
└─────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` `#3E5653` · `corpo` curto · 3 colunas com **réguas** (D26) e **números gigantes `01`/`02`/`03` em menta** · título de pilar `#3E5653` · **uma linha de apoio por pilar** em `#627271` · `destaque` como **takeaway `#3E5653` negrito, sem caixa**.

> **Os números gigantes continuam sendo números — não viram caixa, não viram círculo, não ganham fundo.**
> **Por que este é o slide mais cheio do deck (339 caracteres, 79 acima da faixa):** o roteiro pede explicitamente o `corpo` de posicionamento, os **três títulos de pilar**, **uma linha de apoio por pilar** e o `destaque`. Com a divisão tela/fala fechada, tudo isso fica na tela. O caminho para fechar a faixa seria jogar as três linhas de apoio para a fala — mas isso **desfaz o roteiro aprovado**, então não foi feito. Registrado em §7, ponto 1.
> **Nota de encenação:** se a fala do fundador cobrir os três objetivos com calma, o slide funciona mesmo com 339 caracteres porque a hierarquia é forte (número gigante → título → linha de apoio → uma linha de fecho). A leitura é por blocos, não linha a linha.

**Celular:** 3 → 2 → 1 coluna; `corpo` acima dos blocos; `destaque` fecha.

**Estados:** estático; sem imagens.

**Texto visível (🖥️):** o roteiro, slide 5. **339 caracteres** — ⚠️ **79 acima da faixa**, a maior exceção do deck (§2 e §7, ponto 1).

---

### Slide 6 — Objetivo 1: Aumento de Faturamento

**Posição:** slide 6/14 · arranjo **`objetivo`** · fundo claro · **imagem sangrando**

```
┌────────────────────────────────────────────┬────────────────────┐
│ OBJETIVO 1                    ██████     ██ │                    │  ← eyebrow #627271
│ Aumento de Faturamento       █      █     █ │                    │  ← título #3E5653
│                              █      █     █ │                    │  ← marca d'água 01 #E1E3E3, sangrando na borda · aria-hidden
│ Primeiro, o dinheiro          █      █     █ │                    │
│ precisa entrar.              ██████    ███ │                    │
│                                            │                    │
│ ▸ Conhecimento de mercado                   │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    │
│                                            │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    │
│ ▸ Atendimento que não deixa                 │ ▒▒  [IMAGEM: ▒▒    │  ← IMAGEM SANGRA na metade direita:
│   a venda cair                              │ ▒▒   funil]   ▒▒   │     vai do topo até a base do slide,
│                                            │ ▒▒             ▒▒   │     encostada na borda direita
│ ▸ Indicadores e funil                       │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    │     (porta de loja → entraram →
│   de vendas                                 │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    │      compraram → voltaram)
│                                            │                    │
│ Isso tira você de ser funcionário           │                    │  ← fecho #3E5653
│ da sua empresa e te põe na gestão.          │                    │
└────────────────────────────────────────────┴────────────────────┘
```

**Blocos:** `eyebrow` (`OBJETIVO 1`) · `titulo` `#3E5653` · `subtitulo` curto · **marca d'água `01`** gigante `#E1E3E3` no topo-direito, **sangrando pela borda direita** · **3 itens só com marcador `▸` e título — sem descrição** · `[IMAGEM: funil]` **sangrando na metade direita** · `fecho` `#3E5653`.

> **Estrutura nova:** a **faixa larga horizontal de ilustração saiu** — a imagem vai para a coluna direita e sangra pelas bordas superior, inferior e direita. Com isso, as **3 descrições dos itens saíram da tela** (o que mais derruba o slide: de 544 para 226). Os títulos com o glifo menta são o bastante para o fundador saber o que está enumerando.

**Celular:** a imagem desce para **baixo dos itens**, em largura total; a marca d'água `01` **reduz e vai para o fundo** (não some — é a assinatura do arranjo).

**Estados:** estático. Sem a ilustração → espaço reservado do mesmo tamanho, sem quebrar a divisão.

**"Loja Virtual" NÃO entra aqui** — é visão (slide 13).

**Texto visível (🖥️):** o roteiro, slide 6. **226 caracteres.**

---

### Slide 7 — Objetivo 2: Aumento de Margem

**Posição:** slide 7/14 · arranjo **`objetivo`** · fundo claro · **imagem em painel**

```
┌────────────────────────────────────────────┬────────────────────┐
│ OBJETIVO 2                    ██████   ████ │                    │  ← eyebrow #627271
│ Aumento de Margem            █      █ █    │  ░░░░░░░░░░░░░░░   │  ← título #3E5653
│                              █      █ ████ │  ░░░░░░░░░░░░░░░   │  ← marca d'água 02 #E1E3E3, sangrando
│ Não basta trazer             █      █ █    │  ░░  [IMAGEM:  ░   │
│ dinheiro — é saber           ██████  █████ │  ░░   margem]  ░   │  ← PAINEL à direita: bloco claro recuado
│ para onde ele vai.                           │  ░░            ░   │     (custos e margens de ponta a ponta +
│                                            │  ░░░░░░░░░░░░░░░   │      a parceria de insumos entre as empresas
│ ▸ Análise de mercado                        │  ░░░░░░░░░░░░░░░   │      do grupo)
│                                            │                    │
│ ▸ Visão total da operação                   │                    │
│                                            │                    │
│ ▸ Parcerias entre empresas do grupo         │                    │
│                                            │                    │
│ Fazer mais dinheiro entrar e                 │                    │  ← destaque em MENTA #86CB92 (o pitch oficial)
│ menos sair. Isso é margem.                   │                    │
└────────────────────────────────────────────┴────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` `#3E5653` · `subtitulo` curto · **marca d'água `02`** `#E1E3E3` (topo-direito, sangrando) · **3 itens só com marcador `▸` e título — sem descrição** · `[IMAGEM: margem]` em **painel claro recuado** à direita · `destaque` em **menta `#86CB92`**.

> **Estrutura nova:** o slide 7 ganhou a ilustração que não tinha. É o **único** dos três objetivos que usa **painel** em vez de imagem sangrando — para não repetir o gesto do slide 6 logo em seguida. O painel é claro e recuado, **sem borda e sem destaque**. As **3 descrições saíram da tela** (427 → 210).
> **Fala:** o exemplo concreto da parceria com a gráfica do grupo — o conteúdo mais convincente do slide, e por isso mesmo é fala, não tela.

**Celular:** o painel desce para baixo dos itens, em largura total; a marca d'água `02` reduz ao fundo; `destaque` fecha.

**Estados:** estático. Sem a ilustração → o painel **mantém a mesma caixa** (fica claro e vazio), o texto não se move.

**Texto visível (🖥️):** o roteiro, slide 7. **210 caracteres.**

---

### Slide 8 — Objetivo 3: Transformação

**Posição:** slide 8/14 · arranjo **`objetivo`** · fundo claro · único slide com 4 itens

```
┌────────────────────────────────────────────┬────────────────────┐
│ OBJETIVO 3                    ██████   ████ │                    │  ← eyebrow #627271
│ Transformação do              █      █ █    │      ◯             │  ← título #3E5653 (2 linhas)
│ Empreendedor                 █      █ ████ │                    │  ← marca d'água 03 #E1E3E3, sangrando
│ em Empresário                █      █ █    │                    │
│                              ██████  █████ │  ┌──────────────┐  │  ← card da Melissa (divergência deliberada, W9)
│ É o que faz os outros dois durarem.        │  │              │  │
│                                            │  │  Melissa —   │  │  ← avatar ◯ com ANEL MENTA — o único círculo do deck
│ ▸ Transformação duradoura                  │  │  sua copiloto │  │
│                                            │  │  no dia a dia │  │
│ ❝ Empreender e gerir são coisas            │  │              │  │
│   diferentes                               │  └──────────────┘  │
│                                            │                    │
│ ▸ Trilhas de conhecimento  [VISÃO]         │                    │  ← o único item marcado como visão
│                                            │                    │
│ A empresa deveria trabalhar para você.      │                    │  ← destaque em MENTA #86CB92
└────────────────────────────────────────────┴────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` `#3E5653` (2 linhas) · `subtitulo` curto · **marca d'água `03`** `#E1E3E3` (topo-direito, sangrando) · **4 títulos curtos** na coluna esquerda com marcador `▸`/`❝`, separados do bloco lateral por **régua fina** · **card da Melissa à direita** com avatar `◯` de anel menta · `destaque` em menta.

> **Estrutura nova:** as **4 descrições saíram da tela** (507 → 252) — sobraram os títulos curtos. "Trilhas de conhecimento" recebe a **etiqueta `[VISÃO]`**, para que ninguém leia isso como entrega do MVP. A etiqueta é texto de tela e entra na contagem de caracteres.
> **Exceção declarada à regra "no máximo 3 itens" (D23):** aqui são 4, porque o card lateral da Melissa já é um bloco à parte. Acompanha a decisão **W9**, que o fundador mantinha.

**Celular:** o card da Melissa desce **para baixo da lista** (o avatar vem acima do texto); a régua entre os dois blocos some; a marca d'água `03` reduz ao fundo.

**Estados:** estático. Avatar ausente → espaço reservado **circular** do mesmo tamanho, com o anel menta. Os glifos nunca somem (são vetoriais).

**Texto visível (🖥️):** o roteiro, slide 8. **252 caracteres.**

---

### Slide 9 — Melissa, sua consultora todos os dias

**Posição:** slide 9/14 · arranjo **`escuro`** · fundo grafite · pico emocional

```
┌─────────────────────────────────────────────────────────────────┐
│ O DIFERENCIAL                                                  │  ← eyebrow MENTA #86CB92 (tela escura)
│ Melissa, sua consultora                                        │  ← título branco #EFEFEF (2 linhas)
│ todos os dias                                                  │
│                                                                │
│ Consultoria tradicional é uma                 ▒▒▒▒▒▒▒▒▒        │  ← corpo #AEB6B4
│ reunião por mês e um relatório.              ▒▒▒▒▒▒▒▒▒▒        │
│                                             ▒▒       ▒▒        │
│                                             ▒▒  [MEL]  ▒       │  ← Melissa 3/4 à direita, cortada no quadril
│                                             ▒▒  corpo   ▒       │
│ Acompanha o seu negócio                      ▒▒▒ 3/4    ▒       │  ← "DIARIAMENTE" em BRANCO NEGRITO, no meio da frase
│ DIARIAMENTE.                                 ▒▒▒▒▒▒▒▒▒▒▒        │
│                                                                │
│                                                                │
│ O conhecimento de uma consultoria,                             │  ← fecho em MENTA #86CB92 (realce no meio da frase)
│ com a presença de um sócio.                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` **menta `#86CB92`** · `titulo` branco `#EFEFEF` em 2 linhas · `corpo` `#AEB6B4` · parágrafo com **"DIARIAMENTE" em branco negrito** · `fecho` em **menta `#86CB92`** · `[IMAGEM: melissa]` **3/4, cortada no quadril**, à direita.

**O arranjo não muda.** Este slide já estava dentro da faixa (257 → 210): encurtou o parágrafo do `destaque` e foi isso. **Preserva o peso da v1** — é o slide mais emotivo antes do preço.

**Celular:** texto primeiro (eyebrow → título → corpo → destaque → fecho) e a **imagem por último, em largura total**. Não pode ser cortada na altura.

**Estados:** estático. Sem imagem → o painel mantém o contraste e a Melissa vira espaço reservado; o texto não se move.

**Texto visível (🖥️):** o roteiro, slide 9. **210 caracteres.**

---

### Slide 10 — Como trabalhamos: o método do médico

**Posição:** slide 10/14 · arranjo **`metodo`** · fundo claro + faixa escura · **linha do tempo pontilhada**

```
┌─────────────────────────────────────────────────────────────────┐
│ COMO TRABALHAMOS                                               │  ← eyebrow #627271
│ Como ir ao médico, mas para a sua empresa.                       │  ← título #3E5653
│                                                                │
│                                             ┌────────────────┐ │
│                                             │                │ │
│                                             │ [IMAGEM:       │ │  ← ESPAÇO RESERVADO, mesma caixa em todos os casos
│                                             │   medico]      │ │     (a receita sob medida, desenhada)
│      1              2                3     │                │ │
│  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│ │  ← LINHA PONTILHADA ligando os 3 marcadores
│                                                                │
│  Diagnóstico          Desenho sob medida    Entrega acompanhada │  ← rótulo do passo #3E5653
│                                                                │
│  Você conta como     Módulos e fluxos      MVP rodando.        │  ← UMA LINHA por passo (#627271)
│  a empresa funciona  pensados para você.   Nós operamos.        │
│                                                                │
├─────────────────────────────────────────────────────────────────┤
│ MVP entregue em até 2 meses. Quem opera é a UNIQ.               │  ← FAIXA DE RODAPÉ #3E5653, largura total
└─────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` `#3E5653` · **3 passos ligados por linha pontilhada** · **números gigantes menta `#86CB92`** · rótulo do passo `#3E5653` · **1 linha de apoio por passo** · **caixa reservada `[IMAGEM: medico]`** no canto superior direito, do tamanho da ilustração final · **faixa de rodapé em largura total `#3E5653`** com texto claro.

> **Estrutura nova:** **cada passo perdeu a caixa.** Antes era um retângulo por passo; agora são **números + linha pontilhada + rótulo**, sem borda e sem fundo. Os números são **numerais, não círculos** — o único círculo do deck continua sendo o avatar da Melissa (§5, regra 7). O `corpo` e a 2ª linha de cada passo foram para a fala (447 → 252).
> **A faixa escura é elemento estrutural, não decoração** — é a resposta ao slide 11 ("por que é acessível"). Usa o **mesmo** token do título verde, não um segundo verde.
> **`[IMAGEM: medico]` tem espaço reservado garantido** (a receita sob medida, desenhada), no canto superior direito, com a mesma caixa do arquivo final. Enquanto o `prompt` não existir, a caixa **fica vazia com o mesmo tamanho** — nunca encolhe, nunca some. **Proibido:** "retorno garantido em 90 dias" (A1).

**Celular:** os 3 passos **empilham** e a **linha pontilhada vira vertical** entre eles; a faixa escura **permanece colada ao rodapé do slide**.

**Estados:** estático. A faixa escura nunca some. A caixa de `[IMAGEM: medico]` nunca some.

**Texto visível (🖥️):** o roteiro, slide 10. **252 caracteres.**

---

### Slide 11 — Por que entrar agora

**Posição:** slide 11/14 · arranjo **`colunas`** · fundo claro · **eixo visual no lugar da linha de texto**

```
┌─────────────────────────────────────────────────────────────────┐
│ POR QUE ENTRAR AGORA                                           │  ← eyebrow #627271
│ 12 vagas de co-fundador.                                        │  ← título #3E5653
│                                                                │
│   Alpha      ╌╌╌╌▶ Beta ╌╌╌╌▶ Prod ╌╌╌╌▶ Lançamento           │  ← EIXO VISUAL: 4 marcadores + linha pontilhada
│   out/26                  jan/27       abr/27       jul/27       │     rótulo do marco #3E5653 · data #627271
│                                                                │
│                                                                │
│ Preço de        │Atenção máxima     │Co-construção               │  ← títulos de coluna em MENTA #86CB92 · réguas finas (D26)
│ fundador        │                    │                            │
│                 │Poucas empresas,    │Você participa da            │
│                 │atenção individual. │construção.                  │
│                                                                │
│                                                                │
│ O preço de fundador é real — só para os 12 primeiros.            │  ← takeaway #3E5653 negrito, SEM CAIXA
└─────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` `#627271` · `titulo` `#3E5653` · **`caminho` como eixo visual**: 4 marcadores (`Alpha` → `Beta` → `Prod` → `Lançamento`) ligados por **linha pontilhada**, cada um com o rótulo em `#3E5653` e a data em `#627271` · 3 colunas com réguas, **títulos em menta `#86CB92`** · `destaque` como **takeaway `#3E5653` negrito, sem caixa**.

> **Estrutura nova:** `Alpha (out/2026) → Beta (jan/2027) → Prod (abr/2027) → lançamento em julho/2027` **deixou de ser uma linha de texto** e virou **eixo visual** no alto do slide. É a ordem em que o **fundador** entra — dá para apontar sem ler.
> A coluna "Preço de fundador" ficou **só com o rótulo**: a linha "Só para os 12 primeiros" foi removida porque **repetia o `destaque`**. Um destaque por slide (§5, regra 7).
> **Ponto em aberto no roteiro:** o 🖥️ do slide 11 pede "3 colunas (título + 1 linha)", mas o 🗣️ manda "os corpos das 3 colunas" para a fala — as duas instruções não podem valer ao mesmo tempo. Aqui foi aplicada a leitura que satisfaz as duas: **as três colunas mostram título + uma linha curta**, e o desenvolvimento maior fica na fala. A coluna "Preço de fundador" é a exceção, sem linha, porque o `destaque` já cobre isso. Ver §7, ponto 3.

**Escassez real, sem clichê** — proibido "nunca mais vai existir".

**Celular:** 3 → 2 → 1 coluna; as réguas viram linhas horizontais; o eixo visual **quebra em linhas** (Alpha → Beta → Prod → Lançamento), **mantendo a ordem e os conectores**, virando lista vertical.

**Estados:** estático; sem imagens.

**Texto visível (🖥️):** o roteiro, slide 11. **253 caracteres.**

---

### Slide 12 — Investimento

**Posição:** slide 12/14 · arranjo **`preco`** · fundo grafite

```
┌─────────────────────────────────────────────────────────────────┐
│ INVESTIMENTO                                                   │  ← eyebrow MENTA #86CB92 (tela escura)
│ A consultoria completa, pelo preço                             │  ← título branco #EFEFEF (2 linhas)
│ de quem entra na frente.                                       │
│                                                                │
│                                                                │
│   VALOR CHEIO                 │   CO-FUNDADOR                  │  ← bloco ESQUERDO em CINZA #AEB6B4  |  DIREITO em MENTA #86CB92
│   (após as 12 vagas)          │   · 12 vagas                   │
│                                                                │
│   R$ 1.500                    │   R$ 500                       │  ← MESMO tamanho de fonte entre os dois blocos (D10)
│   setup                       │   setup                        │
│   R$ 297 /mês                 │   R$ 197 /mês                  │
│                                                                │
│                                                                │
│                                                                │
│   ✓ R$ 500 na entrega do MVP                                  │  ← checks com "✓" em MENTA #86CB92
│   ✓ Mensalidade depois da entrega — dias 5, 15 ou 25           │
│   ✓ Depois das 12 vagas, vale o valor cheio.                   │
└─────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` **menta `#86CB92`** · `titulo` branco `#EFEFEF` · **2 blocos lado a lado separados por régua vertical fina, com tipografia de tamanho IDÊNTICO** (mesma altura, mesma fonte, mesma estrutura — D10) · bloco esquerdo em **cinza `#AEB6B4`** · bloco direito em **menta `#86CB92`** · `checks` com **`✓` menta** abaixo.

> **Estrutura nova:** **mais respiro e nada mais.** Os dois preços **já tinham o mesmo peso** — o único ganho foi empurrar os `checks` para baixo e alongar o respiro entre os blocos e a lista. Os 3 checks **continuam na tela** (encurtados): são eles que matam a objeção de risco, e o roteiro determina que não saiam.
> O bloco `CO-FUNDADOR` se destaca **pela cor do texto, e nada mais** — **sem borda, sem fundo, sem caixa, sem alterar o tamanho**. **Sem logo e sem arcos** neste slide.
> **Proibido na tela:** "pagamento na inicialização" (D11) · fidelidade (D12) · o valor concedido no 1º ano (R$ 2.200) — isso fica **na fala**.

**Celular:** os 2 blocos **empilham** (mesma ordem: valor cheio → co-fundador); os `checks` abaixo, em coluna única; **os dois valores continuam com o mesmo tamanho entre si** ao empilhar.

**Estados:** estático; sem imagens.

**Texto visível (🖥️):** o roteiro, slide 12. **260 caracteres.**

---

### Slide 13 — A visão e a troca

**Posição:** slide 13/14 · arranjo **`escuro`** · fundo grafite · **D25: a marca de visão fica na tela**

```
┌─────────────────────────────────────────────────────────────────┐
│ A VISÃO                                                        │  ← eyebrow MENTA #86CB92
│ 52 empresas em 18 meses                                        │  ← título branco #EFEFEF
│                                                                │
│ Chegar em dezembro de 2028                                     │  ← corpo #AEB6B4 (2 linhas)
│ com 52 empresas no grupo.                                      │
│                                                                │
│                                                                │
│ O foco hoje não é lucro —                                      │  ← "prova social real" realçado em MENTA no meio da frase
│ é prova social real.                                           │
│                                                                │
│                                                                │
│ O sucesso da sua empresa é a nossa moeda de troca              │  ← fecho em MENTA #86CB92
│                                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ VISÃO, NÃO ENTREGA DO MVP: site, loja virtual, marketplace, │ │  ← MARCA DE VISÃO — fica NA TELA (D25)
│ │ tráfego pago e trilhas.                                      │ │     rótulo MENTA + texto #AEB6B4
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Blocos:** `eyebrow` **menta `#86CB92`** · `titulo` branco `#EFEFEF` · `corpo` `#AEB6B4` em **2 linhas** · `destaque` com "prova social real" realçado em menta dentro do parágrafo · `fecho` em **menta `#86CB92`** · **`marca de visão`**: faixa discreta no rodapé, rótulo "VISÃO, NÃO ENTREGA DO MVP" em menta + a lista em `#AEB6B4`.

> **Estrutura nova:** o `corpo` caiu para **2 linhas** (365 → 262) e a **marca de visão continua na tela** (D25). A faixa é **sem caixa e sem borda** — apenas o rótulo em menta acima da lista, separado por respiro. É a única tela do deck que promete menos do que entrega, e a marca precisa estar visível para o cliente ler sem ouvir o apresentador.

**Sem imagem** — o slide é declarativo.

**Celular:** tudo em coluna única, na mesma ordem; a marca de visão fica no fim do conteúdo.

**Estados:** estático; sem imagens.

**Regra:** tudo aqui é explicitamente **visão** (site, loja, marketplace, tráfego pago e trilhas **não** são entrega — D15/D16).

**Texto visível (🖥️):** o roteiro, slide 13. **262 caracteres** — ⚠️ **2 acima da faixa**. Excesso de 2 caracteres em texto literal do roteiro; registrado em §2 e §7, ponto 2.

---

### Slide 14 — Chamada para conversar

**Posição:** slide 14/14 · arranjo **`encerramento`** · fundo grafite · **o slide mais importante do deck**

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐                                              │  ← LOGO topo-esquerdo sobre chip claro #E1E1E0
│  │[LOGO] UNIQ   │                                              │     (mesmo do slide 1)
│  └──────────────┘                                              │
│                                              ▒▒▒▒▒▒▒▒▒        │
│ O primeiro passo é uma conversa.              ▒▒▒▒▒▒▒▒▒▒        │  ← maior título do deck, branco #EFEFEF
│ ══════════════════════════                  ▒▒       ▒▒        │  ← SUBLINHADO MENTA sob a palavra-chave
│                                              ▒▒  [MEL]  ▒        │
│ Me conta como a sua empresa                 ▒▒  corpo   ▒       │  ← subtítulo #AEB6B4
│ funciona hoje. A gente escuta,               ▒▒▒ inteiro ▒       │
│ diagnostica e desenha o caminho —                                 │
│ mesmo que você queira pensar, a                                │
│ conversa é o ponto de partida.                                   │
│                                                                │
│ UNIQ Empresas · Consultoria para pequenas e médias empresas    │  ← rodapé institucional · SEM preço em linha
│                                                                │
│ ╭──                                                            │  ← arcos decorativos #2C3D42/#314747, canto inferior-esquerdo · aria-hidden
│ │  ╭─                                                          │
│ ╰──╯                                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Blocos:** `[LOGO]` no **topo-esquerdo sobre chip claro `#E1E1E0`** (único slide, com o 1, que tem logo) · `titulo` **o maior do deck**, branco `#EFEFEF`, com **sublinhado menta** sob a palavra-chave · `subtitulo` `#AEB6B4` · `[IMAGEM: melissa]` (corpo inteiro) · **arcos decorativos** no canto inferior-esquerdo (`aria-hidden`, nunca sobre o texto) · `rodape` institucional.

**O arranjo não muda.** O slide já estava na faixa (224 → 259: o roteiro manteve o subtítulo e o rodapé integrais).

**NOTA — este bloco NÃO existe nesta versão:**

```
┌─────────────────────────────────────────────────────────────────┐
│    ┌────────────────────────────────────────────────┐           │  ✗  não existe nesta versão
│    │ [ Falar com a MEL ]                            │           │
│    │                                                │           │
│    └────────────────────────────────────────────────┘           │
│                                                                │
│    ▢  ▢  ▢   ← código QR                                      │  ✗  não existe nesta versão
│    wa.me/...  ← link                                           │  ✗  não existe nesta versão
│ ✗  NÃO IMPLEMENTAR — P1 parkada (25/09/2026)                   │
└─────────────────────────────────────────────────────────────────┘
```

> **O slide 14 fica SEM botão, SEM código QR, SEM link, SEM telefone, SEM WhatsApp.**
> **P1 está parkada** (25/09/2026): o fluxo de conversa com a Melissa já está ligado no WhatsApp, mas falta o prompt e a gravação legível. O fechamento, por ora, é **conversa + retorno humano** — e o texto do slide já diz isso.
> **Espaço reservado:** o bloco `[ Falar com a MEL ]` fica documentado acima como ponto de encaixe futuro, **sem espaço em branco reservado na tela** (a composição não pode ter um buraco vazio esperando o botão).

**Celular:** `titulo` mantém o maior peso; arcos reduzem ou somem; **logo acima, Melissa abaixo**; subtítulo em largura total; `rodape` no fim, em corpo pequeno.

**Estados:** estático. Sem a Melissa → espaço reservado na mesma caixa; o logo e o texto **não se movem**. O botão `→` fica **desabilitado** aqui — o cliente **não fica preso sem saída**: volta com `←`, pelas teclas ou pelo gesto.

**Texto visível (🖥️):** o roteiro, slide 14. **259 caracteres.**

---

## 4. Mapa de imagens reservadas

> **Regra D17/§9:** o espaço é reservado **de qualquer forma**. Se a ilustração não for gerada, o prompt exato está no SPEC §6.2. **Nunca tela em branco.**
> **Placeholder = espaço reservado** do mesmo tamanho, com `alt` descritivo no `<img>` real. O arranjo **não muda de proporção** com ou sem a imagem.

| Marcador | Slide | Origem do arquivo | Situação | Observação |
|---|---|---|---|---|
| `[LOGO]` | 1, 14 | `tracking/apresentacao/referencia/logo-uniq.png` | **A produzir** — hoje tem fundo branco sólido (D18) | Vai sobre **chip claro `#E1E1E0`**; o PNG transparente é o ideal |
| `[IMAGEM: melissa]` | 1, 9, 14 | `src/assets/mel-full.png` | Existe · **precisa de versão limpa** para painel escuro | **3/4 cortada no quadril** nos três slides |
| `◯` (avatar com anel menta) | 8 | `src/assets/mel-avatar.png` (ou recorte do `mel-full.png`) | Existe | **Único círculo do deck**; dentro do card lateral |
| `▸` `❝` (glifos de linha) | 6, 7, 8 | Ícone lucide, desenhado como linha em **menta `#86CB92`** | **Sem arquivo** — vetor | **Nunca** dentro de um círculo de fundo |
| marca d'água `01`–`03` | 6, 7, 8 | Numeral em `#E1E3E3`, `aria-hidden` | **Sem arquivo** — texto | Topo-direito, sangrando pela borda direita |
| `01` `02` `03` menta | 5, 10 | Numeral em `#86CB92` | **Sem arquivo** — texto | **Nunca viram caixa nem círculo** |
| `╌╌╌` linha pontilhada | 10, 11 | CSS/SVG (nenhum arquivo) | A desenhar | Menta `#86CB92`; vira vertical no celular |
| **`[IMAGEM: dor]`** | **2** | Ilustração a produzir | **A produzir — D24** (antes parkada) | **SANGRA** na metade direita; prompt no SPEC §6.2 item 2 |
| **`[IMAGEM: funil]`** | **6** | Ilustração a produzir | **A produzir** | **SANGRA** na metade direita; prompt no SPEC §6.2 item 3 |
| **`[IMAGEM: margem]`** | **7** | Ilustração a produzir | **A produzir — PROMPT FALTANDO** | ⚠️ **Não existe prompt no SPEC §6.2.** Precisa ser escrito antes da implementação. Ver §7, ponto 4 |
| **`[IMAGEM: medico]`** | **10** | Ilustração a produzir | **A produzir** | Canto superior direito, caixa reservada do mesmo tamanho; prompt no SPEC §6.2 |
| arcos decorativos | 14 | CSS/SVG (nenhum arquivo) | A desenhar | `#2C3D42` / `#314747`, canto inferior-esquerdo, `aria-hidden` |

**Direção obrigatória (DESIGN.md → Imagery):** ilustração vetorial sóbria, traço limpo, poucas cores (`#86CB92` menta · `#1F2937` grafite sobre `#EFEFEF`), enquadramento próximo, muito respiro.
**Evitar (obrigatório):** aperto de mão · reunião · pessoas sorrindo para a câmera · terno/carro/dinheiro · robô/chip/engrenagem/código · gráficos de crescimento, setas e cifrões · **banco de imagens**.

**Substituição sem quebrar:** cada marcador tem um espaço reservado do mesmo tamanho; o arranjo não muda de proporção com ou sem a imagem.

---

## 5. Tokens e regras transversais

| Papel | Valor | Onde |
|---|---|---|
| Fundo claro (tela) | **`#EFEFEF`** | slides 3, 4, 5, 6, 7, 8, 10, 11 |
| Fundo escuro (tela cheia) | **`#1F2937`** grafite | slides 2, 9, 12, 13, 14 + o painel direito da capa |
| **Título em tela clara** | **`#3E5653`** verde-escuro da v1 | slides 3, 4, 5, 6, 7, 8, 10, 11 · **exceção D22 confirmada** |
| **Título da capa** | **`#1F2937`** grafite | **medido na v1: a capa é grafite, não verde** |
| Eyebrow em tela clara | `#627271` | slides 3, 4, 5, 6, 7, 8, 10, 11 |
| Eyebrow em tela escura | `#86CB92` menta | slides 2, 9, 12, 13, 14 |
| Título de item (tela clara) | `#1A1A1A` | slides 6, 7, 8 |
| Corpo / apoio (tela clara) | `#627271` | descrições, `checks`, metadados |
| Corpo (tela escura) | `#AEB6B4` | slides 2, 9, 12, 13, 14 — **nunca `#627271` no escuro** |
| Accent / destaques | `#86CB92` menta | sublinhados, glifos, `✓`, conectores, linha do tempo, progresso, hover |
| **Marca d'água `01`–`03`** | **`#E1E3E3`** | slides 6, 7, 8 · `aria-hidden` |
| **Chip do logo** | **`#E1E1E0`** | slides 1 e 14 |
| **Faixa do slide 10** | **`#3E5653`** | o mesmo token do título verde — não um segundo verde |
| **Arcos decorativos** | **`#2C3D42` / `#314747`** | slide 14 · `aria-hidden` |
| Divisórias entre colunas | 1 px na cor do texto, ~15% de opacidade | slides 3, 4, 5, 11, 12 — **régua, nunca caixa** (D26) |
| Tipografia | Poppins 400/700 | `DESIGN.md` |

**Regras que atravessam o deck inteiro:**

1. **A divisão tela/fala do `ROTEIRO_APRESENTACAO.md` é contrato** (D28, 30/09/2026 — roteiro aprovado). Nenhuma implementação pode mover texto de 🖥️ para 🗣️, nem o contrário. Onde o roteiro deixou o trecho solto ("curtos", "1 linha", "só título"), a palavra escolha neste WIRE é a palavra final.
2. **Orçamento de 180–260 caracteres visíveis por slide** (D23), com **4 exceções registradas** — slides 3 (+17), 4 (+5), 5 (+79) e 13 (+2), todas por texto literal do roteiro aprovado. Tabela em §2; item verificável em §6; decisões em §7, pontos 1 e 2.
3. **Ritmo claro/escuro preservado** (D2): escuros = 2 · 9 · 12 · 13 · 14 · divisão = 1 · claros = 3 · 4 · 5 · 6 · 7 · 8 · 10 · 11. A sequência de fundos **não é decorativa** — é o arco emocional da narrativa.
4. **O título da capa é `#1F2937` (grafite), não `#3E5653`.** Única tela clara fora da regra acima.
5. **Marca d'água `01`/`02`/`03`** só nos slides 6, 7 e 8. Escala gigante, **topo-direito, sangrando pela borda direita**, `aria-hidden="true"`.
6. **Melissa presente** nos slides 1, 8 (avatar), 9 e 14 — **sempre 3/4, cortada no quadril**. É a prova visual, não o assunto.
7. **O logo aparece só nos slides 1 e 14**, sempre sobre o chip claro `#E1E1E0`, sempre no topo-esquerdo.
8. **O único círculo do deck é o avatar da Melissa** (slide 8), com anel menta `#86CB92`. Todo item dos slides 6, 7 e 8 usa **glifo de linha sem círculo**; os números dos slides 5 e 10 são **numerais, nunca círculos**.
9. **Coluna = marcador + título + 1 linha.** Máximo de 3 colunas por slide; o slide 8 é a exceção declarada (4 títulos + bloco lateral).
10. **Régua, não caixa** (D26): as colunas dos slides 3, 4, 5, 11 e 12 são separadas por uma linha de 1 px. **Sem borda e sem fundo** em qualquer coluna.
11. **Takeaway final sem caixa** nos slides 3, 4, 5 e 11: texto em **verde-escuro `#3E5653` negrito**, direto no fundo claro. **Proibido** faixa, régua ou bloco destacado por trás.
12. **Uma imagem de apoio por slide, sangrando pela metade** — slides 6 e 7. O painel do slide 7 é **claro e recuado**, sem borda, para não repetir o gesto do slide 6.
13. **Linha do tempo = marcadores + linha pontilhada** — slides 10 e 11. No celular a linha vira vertical.
14. **Ícones têm função** — cada item com `icone` comunica um pilar do que muda. Sem ícone decorativo e sem ícone de tecnologia (a marca **nega** ser "empresa de tecnologia", §3.5).
15. **Todo slide tem hierarquia em 3 níveis:** `eyebrow` (versalete) → `titulo` (peso maior) → `subtitulo`/`corpo` (peso secundário). Slides sem `eyebrow` (2, 9, 14) mantêm título → subtítulo.
16. **Um destaque por slide** — `destaque` ou `fecho`, nunca os dois. Nenhum texto se repete entre coluna e destaque (ver slide 11).
17. **Realce menta no meio da frase** (não em bloco): slides 2, 9, 13.
18. **O rodapé de 20% a 30% da altura fica vazio.** É parte da composição.
19. **Nenhum texto promete o que não existe** (PRD §7): site, loja virtual, marketplace, tráfego pago = **visão** (slide 13, com a marca visível) · trilhas = **visão** (slide 8, com a etiqueta) · 52 parceiros = **visão** (slide 13).
20. **Sem "pagamento na inicialização"** (D11) · **sem "retorno garantido em 90 dias"** (A1) · **sem fidelidade na tela** (D12) · **sem escassez clichê** ("nunca mais", §3.11).
21. **Sem numeração de página** em nenhum slide interno. O contador `X / 14` é da casca (§1).
22. **Nada do PDF de apoio foi importado:** nem a paleta azul, nem as imagens de banco, nem o cartão de destaque no preço (que violaria D10).

---

## 6. Lista de verificação

> Mesmo contrato do SPEC §11 — o implementador marca aqui e no `tracking/TRACKING.md`.

- [ ] **A divisão tela/fala do `ROTEIRO_APRESENTACAO.md` está respeitada** (D28) — nenhum texto foi movido entre 🖥️ e 🗣️; a tela mostra só o que o roteiro marcou como 🖥️.
- [ ] **Cada slide entre 180 e 260 caracteres visíveis** (D23) — conferido com a tabela de §2, contando `eyebrow` + título + subtítulo/corpo + rótulos e corpos de item + destaque/fecho + checks + eixo do s11 + marca de visão do s13 + rodapé do s14. **10 de 14 na faixa; 4 exceções registradas e aprovadas em §7, pontos 1 e 2** (slides 3, 4, 5 e 13).
- [ ] **Total do deck entre 3.100 e 3.500 caracteres visíveis** (§2) — 3.524 medidos, 24 acima do teto: o excedente vem inteiro do roteiro aprovado. Confirmar em §7, ponto 1.
- [ ] **Todo texto que saiu da tela está na coluna 🗣️ do `ROTEIRO_APRESENTACAO.md`** — nenhum conteúdo aprovado perdido.
- [ ] Rota `/apresentacao` abre **pública**, `noindex, nofollow`, título "UNIQ Empresas — Apresentação"
- [ ] **14 slides** na ordem da espinha (§3); capa com headline e subtítulo D21
- [ ] Identidade da v1: ritmo claro/escuro, **títulos claros em `#3E5653`**, **capa em `#1F2937`**, menta nos destaques
- [ ] Tokens batem com §5: `#EFEFEF` · `#1F2937` · `#3E5653` · `#86CB92` · `#627271` · `#1A1A1A` · `#AEB6B4` · `#E1E3E3` · `#E1E1E0` · `#2C3D42`/`#314747`
- [ ] **Coluna = marcador + título + 1 linha** em todos os slides com colunas (3, 4, 5, 11)
- [ ] **Régua, não caixa** nos slides 3, 4, 5, 11 e 12 (D26) — nenhuma coluna com borda ou fundo
- [ ] **Nenhum círculo** além do avatar da Melissa (slide 8); itens com glifo de linha menta; números dos slides 5 e 10 são numerais
- [ ] **Slide 2 com `[IMAGEM: dor]` sangrando à direita** e o quote em **1 linha no rodapé** (D24)
- [ ] **Slide 6 com `[IMAGEM: funil]` sangrando à direita** — sem faixa larga horizontal
- [ ] **Slide 7 com `[IMAGEM: margem]` em painel claro recuado** — sem borda, sem destaque
- [ ] **Slide 10 com linha pontilhada ligando os 3 passos e sem caixa em cada passo**; faixa `#3E5653` mantida
- [ ] **Slide 11 com o eixo visual** Alpha → Beta → Prod → Lançamento; nenhuma coluna repete o `destaque`
- [ ] **Slide 12: dois preços no mesmo tamanho** (D10), sem cartão; **3 checks presentes**; sem "R$ 2.200" na tela
- [ ] **Slide 13 com a marca de visão na tela** (D25); **slide 8 com a etiqueta `[VISÃO]`** em "Trilhas"
- [ ] Marca d'água `01`–`03` `#E1E3E3` **sangrando pela borda direita** nos slides 6, 7 e 8
- [ ] Logo **só** nos slides 1 e 14, sobre chip `#E1E1E0`
- [ ] **Sem numeração de página** nos slides internos
- [ ] 3 pilares com os nomes decididos (D6/D7/D8) e numeração `01/02/03`
- [ ] **Nenhuma promessa do que não existe** (site/loja/marketplace/tráfego/trilhas/52 = visão)
- [ ] Sem "pagamento na inicialização" e sem "retorno garantido em 90 dias" (A1)
- [ ] **Slide 14: chamada para conversar, SEM botão/QR/link** (P1)
- [ ] Navegação: botões, teclado (←/→), deslize horizontal (≥ 48 px), progresso, contador — computador e celular
- [ ] A11y: `aria-label` "Slide X de 14", `aria-live` no contador, `role="progressbar"`, foco visível, contraste AA
- [ ] Ícones sem gráfico de crescimento/seta/cifrão e sem ícone de tecnologia
- [ ] `alt` em todas as imagens; **o arranjo não quebra sem imagem** (espaço reservado do mesmo tamanho)
- [ ] Celular: a divisão da capa empilha · colunas 3→2→1 · imagem sangrada desce · linha pontilhada vira vertical · preço empilha · eixo do s11 quebra mantendo a ordem
- [ ] `npx tsc --noEmit` sem erros novos · `npm run build` ✅ · Vercel `READY`
- [ ] `tracking/TRACKING.md` atualizado

---

## 7. Pontos que precisam de decisão do fundador

> Em 30/09/2026 o `ROTEIRO_APRESENTACAO.md` foi **aprovado** e a divisão tela/fala virou contrato. Os pontos abaixo nasceram exatamente disso: onde o roteiro aprovado e a faixa de 180–260 se contradizem, alguém precisa dizer qual dos dois cede.
>
> ✅ **Decisões do fundador (30/09/2026) — WIRE aprovado:**
> - **Ponto 1 —** **aceita a exceção do slide 5** (o roteiro vence; o slide se lê por blocos).
> - **Ponto 2 —** **aceitas as 3 exceções** (slides 3, 4 e 13 — 24 caracteres no deck inteiro).
> - **Ponto 3 —** **ratificada a leitura do slide 11** (título + 1 linha curta na tela; desenvolvimento na fala).
> - **Ponto 5 —** **total de 3.524 aceito**.
> - **Ponto 4 —** prompt da `[IMAGEM: margem]` **escrito** (SPEC §6.2, item 5).
>
> Os pontos **1, 2, 3 e 5 estão fechados**. O ponto 4 avança para a implementação (assets e ilustrações).

| # | Ponto | Por que precisa do fundador | Impacto |
|---|---|---|---|
| **1** | **Slide 5: 339 caracteres, 79 acima da faixa** | O roteiro pede o `corpo` de posicionamento, os três títulos de pilar, **uma linha de apoio por pilar** e o `destaque` — tudo marcado como 🖥️. Como a divisão está fechada, tudo isso fica na tela e o slide estoura. **Três saídas:** (a) **aceitar os 339** e abrir exceção só no slide 5 — é o que este WIRE faz; (b) **mover as três linhas de apoio para a fala**, o que cai para 231 e entra na faixa, **mas exige mexer no roteiro aprovado**; (c) afrouxar a faixa de todo o deck. A escolha (a) é a recomendada, porque o roteiro é o contrato e o slide se lê por blocos, não linha a linha. | **Alto** |
| **2** | **Slides 3, 4 e 13: +17, +5 e +2** | Excesso pequeno, mas os três são **100% texto literal do roteiro** — não há palavra solta para encurtar. Ou o fundador aceita as exceções, ou ajusta o roteiro. Em geral, aceitar: 24 caracteres no deck inteiro não mudam a leitura. | Baixo |
| **3** | **Slide 11: o roteiro se contradiz sozinho** | O 🖥️ pede "3 colunas (título + 1 linha)" e o 🗣️ manda "os corpos das 3 colunas" para a fala — as duas coisas ao mesmo tempo. Este WIRE aplicou a leitura que satisfaz as duas: **título + uma linha curta** em cada coluna, com o desenvolvimento maior na fala. O fundador precisa ratificar essa leitura. | Médio |
| **4** | **`[IMAGEM: margem]` (slide 7) não tem prompt** | O SPEC §6.2 tem prompt para `dor`, `funil` e `medico`, mas **não** para a ilustração do slide 7. Precisa ser escrito (mesma direção: vetorial sóbria, menta + grafite sobre `#EFEFEF`) antes da implementação, senão o painel fica vazio. | **Médio — bloqueia o slide 7** |
| **5** | **Total do deck em 3.524, 24 acima do teto de 3.500** | Herança do ponto 1. Se o fundador escolher (b) ou (c), o total volta para dentro. | Baixo |
| **6** | **`P1` — chamada para ação do slide 14** | O arranjo já está desenhado **sem** o botão. Quando o fluxo da Melissa ativar, decidir: (a) botão "Falar com a MEL" abaixo do subtítulo, (b) botão + código QR impresso (P4), ou (c) link em `wa.me`. **O WIRE deixa o ponto de encaixe documentado.** | Baixo agora · médio na Semana 4 |
| **7** | **`P4` — código QR / atalho impresso** | Depende de P1. Se houver, muda o arranjo do slide 14 (QR ao lado da Melissa). | Baixo |
| **8** | **Assets transparentes** (logo e Melissa) | D18/L4: o logo hoje tem **fundo branco**. O chip claro `#E1E1E0` reduz o problema, mas o PNG transparente continua ideal. Afeta os slides 1 e 14. | **Médio** |
| **9** | **Geração das 4 ilustrações** (`dor`, `funil`, `margem`, `medico`) | O WIRE reserva os espaços, mas o deck só fica completo com as quatro. Gerar com IA agora ou esperar o fundador rodar os prompts? **Todas têm espaço reservado do mesmo tamanho** — o deck não quebra sem elas. | **Médio** |
| **10** | ~~Marca de visão do slide 13~~ **RESOLVIDO** | **D25 (30/09/2026):** a marca de visão **fica na tela**. O texto da etiqueta está no roteiro e na contagem do slide 13. | **Fechado** |
| **11** | ~~Imagem do slide 2~~ **RESOLVIDO** | **D24 (30/09/2026):** a ilustração `dor` **entra** no slide 2, à direita, com o quote descendo para o rodapé em 1 linha. A antiga W8 está encerrada. | **Fechado** |
| **12** | ~~Régua entre colunas~~ **RESOLVIDO** | **D26 (30/09/2026):** a régua fina **é mantida** nos slides 3, 5 e 11, como na v1 medida. O PDF de apoio não tinha régua, mas ela ajuda o apresentador a saber qual coluna está narrando. | **Fechado** |
| **13** | ~~Card lateral da Melissa no slide 8~~ **RESOLVIDO** | **W9 mantida** na direção de 30/09/2026: o card continua à direita, e é o motivo declarado da exceção ao limite de 3 itens. | **Fechado** |
| **14** | ~~Posição do slide 13~~ **RESOLVIDO** | **W10 mantida:** o slide 13 "A VISÃO" continua na posição 13, pintado com a gramática escura da v1. | **Fechado** |
| **15** | ~~`[IMAGEM: medico]` fora do esqueleto~~ **RESOLVIDO** | **Direção de 30/09/2026:** todo slot declarado tem placeholder do mesmo tamanho. O slide 10 ganha **caixa reservada** no canto superior direito, e a caixa nunca encolhe nem some. | **Fechado** |
| **16** | ~~Divisão tela/fala~~ **RESOLVIDO** | **D28 (30/09/2026):** o `ROTEIRO_APRESENTACAO.md` foi aprovado e virou contrato. Este WIRE não move mais texto entre tela e fala. | **Fechado** |

---

*WIRE revisado em 30/09/2026 contra o `ROTEIRO_APRESENTACAO.md` **aprovado** (D23–D28). A divisão tela/fala está fechada: 4 slides ficaram acima da faixa de 180–260 e as exceções estão registradas em §2 e §7. O artefato publicado em `public/apresentacao/` **não** foi alterado.*
