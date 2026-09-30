# SPEC — Apresentação Comercial (rota `/apresentacao`)

> **PRD:** `tracking/plans/PRD-ApresentacaoComercial.md` (✅ aprovado pelo fundador em 25/09/2026)
> **WIRE:** `tracking/wireframe/WIRE-ApresentacaoComercial.md` (a criar — aguarda este SPEC)
> **Status:** ✅ **IMPLEMENTAÇÃO = artefato do OpenDesign (26/09/2026).** O deck real foi criado no OpenDesign e publicado como **página estática** em `/apresentacao` (Opção A). Este SPEC/WIRE permanecem como **contrato de referência** (tipos, layouts, conteúdo §5). A implementação não é React — é o artefato, servido estaticamente.
> **Regra de ouro:** sem WIRE aprovado, não se escreve código de tela.
> **Gate:** `npx tsc --noEmit` **sem erros novos** (linha de base atual) · `npm run build` ✅ · Vercel `READY`

---

## 1. Contexto e fontes

| Fonte | Papel |
|---|---|
| `PRD-ApresentacaoComercial.md` | Contrato de negócio e decisões D1–D22, A1 |
| `tracking/apresentacao/referencia/slide-01..13.png` | **Base visual/estrutural da v1** (identidade, ritmo claro/escuro, hierarquia) |
| `tracking/apresentacao/LEITURA_VISUAL_DECK_V1.md` | **Hex medidos + gramática slide a slide da v1** (autoridade visual deste SPEC e do WIRE) |
| `tracking/apresentacao/TEXTO_DITADO_FUNDADOR.md` | Base de conteúdo (6 partes) |
| `DESIGN.md` | Tokens oficiais + Imagery (direção de ilustração) |
| `tracking/CONTEXTO_PROJETO.md` | Negócio, preços, fases, MEL |

**Princípio:** a v1 é a base a refinar (escrita corrigida, visual preservado). O deck que está no ar hoje (texto puro) é **descartado** — decisão D3 (não reaproveitar nada).

**Decisões que mudam o comportamento técnico (resumo):**
- **D21 — Capa:** headline "Sua empresa não precisa de mais esforço seu." + subtítulo (ver §5.1).
- **D22 — Token:** verde escuro da v1 nos títulos de telas claras — **medido: `#3E5653`**. Exceção: a capa é grafite `#1F2937`. Ver §7.
- **P1 parkada:** slide 14 **sem** mecanismo de CTA (sem botão/QR/link). Quando o fluxo n8n da MEL ativar, plugar o "Falar com a MEL".
- **P3:** rota pública `noindex`.
- **A1:** sem "retorno garantido em 90 dias"; usar "MVP entregue em até 2 meses".

---

## 2. Arquivos

### Alterados (reescritos do zero — D3)

| Arquivo | Papel |
|---|---|
| `src/app/components/apresentacao/ApresentacaoPage.tsx` | Casca + navegação (botões, teclado ←/→, swipe, progresso, contador) + `noindex`/título |
| `src/app/components/apresentacao/deck-data.ts` | Tipos + `SLIDES` (conteúdo final, §5) |
| `src/app/components/apresentacao/deck-layouts.tsx` | Renderizadores por layout (§4) |

> `slides-data.ts` atual é substituído por `deck-data.ts` (mesmo papel, conteúdo novo). A rota `/apresentacao` **não muda** (confirmar o import na implementação).

### Intocados

`routes.tsx` (rota já existe) · `src/assets/mel-full.png` (asset da Melissa em produção).

---

## 3. Tipos (`deck-data.ts`)

```ts
/** Trecho de texto: string comum ou destaque tipográfico. */
export type Run = string | { forte: string };

/** Parágrafo: string simples ou sequência de runs. */
export type Paragrafo = string | Run[];

/** Ícones suportados nos itens (lucide-react) — nomes curtos do mapa interno. */
export type DeckIcone =
  | "compass" | "message" | "funnel" | "scale" | "wallet" | "handshake"
  | "graduation" | "lifebuoy" | "book" | "stethoscope" | "check" | "users" | "refresh";

export type SlideLayout =
  | "capa"          // s1  — split claro/escuro + Melissa + logo
  | "escuro"        // s2, s9, s13 — fundo grafite cheio, quote central
  | "colunas"       // s3, s5, s11 — claro, N colunas com divisória
  | "duasColunas"   // s4  — claro, 2 colunas (origem)
  | "objetivo"      // s6, s7, s8 — claro, marca d'água + itens com ícone
  | "metodo"        // s10 — claro, passos numerados + faixa escura
  | "preco"         // s12 — escuro, 2 blocos de preço no mesmo tamanho
  | "encerramento"  // s14 — escuro, chamada para conversar

export interface SlideItem {
  rotulo?: string;      // ex.: "01", "1", "Nas grandes empresas"
  titulo?: Paragrafo;
  descricao?: Paragrafo;
  icone?: DeckIcone;    // para os layouts colunas/objetivo
}

export interface PlanoPreco {
  rotulo: string;
  setup: string;
  mensal: string;
  destaque?: boolean;
}

export interface Slide {
  id: number;
  layout: SlideLayout;
  eyebrow?: Paragrafo;
  titulo?: Paragrafo;
  subtitulo?: Paragrafo;
  corpo?: Paragrafo;
  itens?: SlideItem[];
  destaque?: Paragrafo;   // quote/callout
  fecho?: Paragrafo;
  planos?: PlanoPreco[];
  checks?: string[];
  rodape?: string;
  caminho?: string;       // linha de fases (s11)
  imagem?: "melissa" | "mel-avatar" | "funil" | "medico" | "dor" | "logo";
}

export const TOTAL_SLIDES = 14;
export const SLIDES: Slide[] = [ /* §5 */ ];
```

> Os 8 layouts exigem renderizadores dedicados, mas compartilham `eyebrow`, `titulo`, `subtitulo`, `destaque`/`fecho` — reutilização alta (§4).

---

## 4. Estrutura de componentes (`deck-layouts.tsx` + `ApresentacaoPage.tsx`)

### 4.1 Renderizadores (`deck-layouts.tsx`)

| Render | Layout | Comportamento visual |
|---|---|---|
| `renderCapa` | `capa` | Split **~62% clara / ~38% grafite**: na clara, logo sobre chip `#E1E1E0`, eyebrow `#3E5653`, titulo **grafite `#1F2937`** (D22 — a capa não usa verde), subtitulo `#627271`; no painel grafite, `melissa` **3/4 cortada no quadril**. Logo transparente. |
| `renderEscuro` | `escuro` | Fundo grafite; eyebrow **menta `#86CB92`**; titulo branco `#EFEFEF` 2 linhas; bullets com **travessão `—`** (sem ícones); corpo `#AEB6B4`; `destaque` em bloco com **barra menta à esquerda**; `fecho` realçado em menta no meio da frase; opcional `imagem` 3/4. |
| `renderColunas` | `colunas` | Fundo claro; titulo em verde escuro (`#3E5653`); colunas de **texto puro** (2/3/4 conforme `itens.length`) separadas por **régua vertical fina — nunca card**; heading `#3E5653`; `destaque`/`fecho` como **takeaway em `#3E5653` negrito, sem caixa/faixa**. |
| `renderDuasColunas` | `duasColunas` | 2 colunas de texto com **régua central**; cada coluna com `rotulo` (ex.: "Nas grandes empresas") + texto; `fecho` como takeaway `#3E5653` negrito, **sem caixa**. |
| `renderObjetivo` | `objetivo` | Fundo claro; **marca d'água numérica `#E1E3E3`** (`01`–`03`) no **topo-direito, sangrando pela borda direita**, `aria-hidden`; titulo `#3E5653`; **lista vertical** de itens com **glifo de linha menta `#86CB92` sem círculo de fundo** (título `#1A1A1A`, descrição `#627271`); `imagem` (funil) em faixa larga; `destaque`/`fecho`. |
| `renderMetodo` | `metodo` | Passos com **número gigante menta `#86CB92`** e **conector horizontal**; **faixa de rodapé full-width `#3E5653`** com texto claro (`destaque`); `imagem` (fórmula). |
| `renderPreco` | `preco` | Fundo escuro; **2 blocos lado a lado separados por régua vertical fina, mesmo peso visual** (sem cross-out, sem risco, sem borda, sem escala — D10); bloco esquerdo `#AEB6B4`, bloco direito `#86CB92`; `checks` com `✓` menta. **Sem logo e sem arcos.** |
| `renderEncerramento` | `encerramento` | Fundo escuro; logo topo-esquerdo sobre chip `#E1E1E0`; titulo grande branco com **sublinhado menta**; subtitulo `#AEB6B4`; Melissa (divergência deliberada); **arcos decorativos** `#2C3D42`/`#314747` no canto inferior-esquerdo; rodapé institucional. **Sem botão/QR** (P1 parkada). |

### 4.2 Casca (`ApresentacaoPage.tsx`)

- Estado `indice` (0–13); renderiza `SLIDES[indice]` via renderizador.
- **Progresso:** barra fina no topo (menta sobre cinza) + contador "X / 14" visível (`aria-live`).
- **Navegação:** botões ←/→ (circular, hover menta, focus visível) · teclado `ArrowLeft/ArrowRight` (ignorar se foco em campo editável) · swipe horizontal com limiar ≥ 48px e `touch-pan-y`.
- **Acessibilidade:** `aria-label` por slide ("Slide X de 14"), `aria-valuenow` na barra, contraste AA.
- **Meta:** `noindex, nofollow` (P3) + título "UNIQ Empresas — Apresentação" enquanto a página está aberta (manter o efeito do componente atual).
- **Scroll:** volta ao topo a cada troca de slide.
- ⚠️ **Padrão do projeto:** todos os hooks declarados **antes** de qualquer `return` condicional (prevenir erro React #310 — lição registrada no TRACKING).

---

## 5. Conteúdo — redação final (contrato do deck)

> Redação fechada aqui (PRD §6 autorizou fechar no SPEC). Nenhum texto de tela promete o que não existe. "MEL"/"Melissa" convivem (D5).

### 5.1 Slide 1 — Capa (`capa`)
- **eyebrow:** `ALTO TIETÊ · CONSULTORIA`
- **titulo:** "Sua empresa não precisa de mais esforço seu." *(sublinhado menta em "mais esforço seu")*
- **subtitulo:** "No dia a dia, tudo depende de você — e não sobra tempo para olhar o todo. Sua empresa precisa de alguém que cuide dela e aponte o caminho."
- **imagem:** `melissa` (prova visual) + `logo`
- **Fala do apresentador:** o dono se reconhece na frase; a seguir, o fundador narra a origem.

### 5.2 Slide 2 — O dia apagando incêndio (`escuro`)
- **titulo:** "O dia inteiro apagando incêndio."
- **subtitulo:** "E o negócio sem sair do lugar."
- **itens:**
  - "Atendimento, operação, fornecedor, caixa: tudo passa por você."
  - "Não sobra tempo para olhar o mercado ou planejar o crescimento."
  - "E não sobra caixa para contratar quem tenha esse conhecimento."
- **destaque (quote):** "Você é mais jogador do jogo do que pensador do jogo."
- **imagem:** `dor` (ilustração balcão + WhatsApp)

### 5.3 Slide 3 — O custo de continuar assim (`colunas`)
- **eyebrow:** `O CUSTO DE CONTINUAR ASSIM`
- **titulo:** "Trabalhar mais não resolve."
- **itens (3 colunas):**
  - **Vender** — "Sem saber a margem real de cada produto, você pode **lucrar menos vendendo mais**."
  - **Decidir** — "Sem dados de mercado, cada escolha vira **aposta** — preço, estoque, investimento."
  - **Crescer** — "Preso à operação, você continua sendo o **funcionário do próprio negócio**."
- **destaque:** "O problema não é esforço. É a falta de estrutura para crescer."

### 5.4 Slide 4 — Por que a UNIQ existe (`duasColunas`)
- **eyebrow:** `POR QUE A UNIQ EXISTE`
- **titulo:** "Eu vi os dois lados desse jogo."
- **itens (2 colunas):**
  - **"Nas grandes empresas"** — "Analista de sistemas desde 2011, em empresas como **Banco Santander** e **Ultragaz**, em contato com a alta diretoria. Lá ficou claro o quanto **conhecimento de mercado, estratégia e boas ferramentas** fazem diferença no resultado."
  - **"Na minha gráfica B2B"** — "Atendendo pequenos e médios empreendedores, vi o contraponto: gente talentosa e esforçada, **sem acesso às mesmas ferramentas e ao mesmo conhecimento**."
- **fecho:** "Foi dessa diferença que nasceu a UNIQ. Levar para o pequeno o que a grande empresa já usa para vencer."
- **Fala:** 1ª pessoa — o fundador narra (D9).

### 5.5 Slide 5 — A UNIQ: três objetivos (`colunas`)
- **eyebrow:** `A UNIQ EMPRESAS`
- **titulo:** "Três objetivos. Um só parceiro."
- **corpo:** "Temos tecnologia — mas não somos uma empresa de tecnologia. Usamos a tecnologia a favor do seu objetivo."
- **itens (3, números 01/02/03):**
  - **01 · Aumento de Faturamento** — "Trazer mais dinheiro para a empresa e dar fôlego para você investir."
  - **02 · Aumento de Margem** — "Para você não trabalhar muito e ganhar pouco."
  - **03 · Transformação do Empreendedor em Empresário** — "De jogador do jogo a quem sabe e controla o jogo."
- **destaque:** "Consultoria + tecnologia a serviço do objetivo — nunca o contrário."

### 5.6 Slide 6 — Objetivo 1: Aumento de Faturamento (`objetivo`)
- **eyebrow:** `OBJETIVO 1`
- **titulo:** "Aumento de Faturamento"
- **subtitulo:** "Primeiro, o dinheiro precisa entrar. Sem caixa, não sobra fôlego para investir — nem para mudar a vitrine."
- **itens (ícones):**
  - `compass` · **UNIQ — Conhecimento de mercado** — "O que as grandes empresas usam, adaptado para a sua realidade."
  - `message` · **Melissa — Atendimento que não deixa a venda cair** — "Atende, faz o acompanhamento, agenda e cuida do cliente de forma individualizada, 24h."
  - `funnel` · **Base UNIQ — Indicadores e funil de vendas** — "Quantos passaram na porta? Quantos entraram? Quantos compraram? Quantos voltaram?"
- **imagem:** `funil` (porta → entraram → compraram → voltaram)
- **fecho:** "Isso tira você de ser funcionário da sua empresa e te põe na gestão."

### 5.7 Slide 7 — Objetivo 2: Aumento de Margem (`objetivo`)
- **eyebrow:** `OBJETIVO 2`
- **titulo:** "Aumento de Margem"
- **subtitulo:** "Não basta trazer dinheiro. É preciso saber para onde cada real está indo."
- **itens (ícones):**
  - `scale` · **UNIQ — Análise de mercado** — "Vender no preço certo. No preço errado, você trabalha muito mais pelo mesmo resultado."
  - `wallet` · **Base UNIQ — Visão total da operação** — "Custos, margens e processos enxergados de ponta a ponta."
  - `handshake` · **Base UNIQ — Parcerias entre empresas do grupo** — "Material gráfico mais barato e um canal de vendas que você não tinha."
- **destaque:** "Fazer mais dinheiro entrar e menos dinheiro sair. Isso é margem."
- **Fala:** exemplo concreto da parceria com a gráfica do grupo (ditado, Parte 3).

### 5.8 Slide 8 — Objetivo 3: Transformação (`objetivo`)
- **eyebrow:** `OBJETIVO 3`
- **titulo:** "Transformação do Empreendedor em Empresário"
- **subtitulo:** "É o que faz os outros dois durarem."
- **itens (ícones + avatar):**
  - `refresh` · **UNIQ — Transformação duradoura** — "Levar o parceiro de um ponto a outro, com mudança que permanece."
  - `graduation` · **Empreender e gerir são coisas diferentes** — "E gerir se aprende — com método, não com tentativa e erro."
  - `lifebuoy` · **Melissa — sua copiloto no dia a dia** — "Move os seus olhos para ver a empresa de forma diferente." *(avatar MEL — card lateral direito)*
  - `book` · **Trilhas de conhecimento** — "Visão de mercado e de outros negócios, para dentro da sua empresa." *(visão — fora do MVP)*
- **destaque:** "A empresa deveria trabalhar para você — e não você ser o funcionário dela."

### 5.9 Slide 9 — Melissa, sua consultora todos os dias (`escuro`)
- **eyebrow:** `O DIFERENCIAL`
- **titulo:** "Melissa, sua consultora todos os dias."
- **corpo:** "Consultoria tradicional é uma reunião por mês e um relatório. A UNIQ é diferente."
- **destaque:** "A Melissa acompanha o seu negócio **diariamente**: atende, orienta, organiza o funil e guia cada etapa."
- **fecho:** "O conhecimento de uma consultoria, **com a presença de um sócio**."
- **imagem:** `melissa` (corpo inteiro)

### 5.10 Slide 10 — Como trabalhamos: o método do médico (`metodo`)
- **eyebrow:** `COMO TRABALHAMOS`
- **titulo:** "Como ir ao médico, mas para a sua empresa."
- **corpo:** "Você apresenta as dores. A gente junta conhecimento de mercado e ferramentas e monta uma solução **sob medida**."
- **itens (3 passos):**
  - **1 · Diagnóstico** — "Você conversa com a gente e conta como a sua empresa funciona hoje."
  - **2 · Solução sob medida** — "Módulos, atendente e mentora pensados para a sua empresa."
  - **3 · Entrega acompanhada** — "O sistema pronto, rodando — com acompanhamento no dia a dia."
- **destaque (faixa escura):** "MVP entregue em **até 2 meses**. Você não precisa aprender tecnologia — quem opera é a UNIQ."
- **imagem:** `medico` (fórmula/receita sob medida)

### 5.11 Slide 11 — Por que entrar agora (`colunas`)
- **eyebrow:** `POR QUE ENTRAR AGORA`
- **titulo:** "12 vagas de co-fundador."
- **itens (3 colunas):**
  - **Preço de fundador** — "R$ 500 de setup + R$ 197/mês — condição que **só existe para os 12 primeiros**."
  - **Atenção máxima** — "Poucas empresas, dedicação quase individual."
  - **Co-construção** — "Você participa da construção do método — e colhe os resultados primeiro."
- **caminho:** "Alpha (out/2026) → Beta (jan/2027) → Prod (abr/2027) → lançamento em julho/2027."
- **destaque:** "O preço de fundador é real. Ele só existe para os 12 primeiros — depois não faz mais sentido."
- **Cuidado de escrita:** sem "nunca mais" (escassez clichê — a escassez é real e basta).

### 5.12 Slide 12 — Investimento (`preco`)
- **eyebrow:** `INVESTIMENTO`
- **titulo:** "A consultoria completa, pelo preço de quem entra na frente."
- **planos (2, mesmo tamanho — D10):**
  - `VALOR CHEIO (APÓS AS 12 VAGAS)` — setup **R$ 1.500** · mês **R$ 297**
  - `CO-FUNDADOR · 12 VAGAS` — setup **R$ 500** · mês **R$ 197** *(destaque)*
- **checks:**
  - "R$ 500 cobrado na entrega do MVP"
  - "Mensalidade começa depois da entrega — nos dias 5, 15 ou 25"
  - "Quando as 12 vagas acabarem, vale o valor cheio"
- **Fala:** comparar com custo de um funcionário; valor concedido no 1º ano (R$ 2.200) fica na fala, não na tela.

### 5.13 Slide 13 — A visão e a troca (`escuro`)
- **eyebrow:** `A VISÃO`
- **titulo:** "52 empresas em 18 meses."
- **corpo:** "A nossa visão é chegar em dezembro de 2028 com 52 empresas no grupo — com integrações e desenvolvimentos que vão surgindo ao longo do caminho."
- **destaque:** "O foco hoje não é lucro. É **prova social real**: cada empresa que cresce vira a moeda que abre a próxima."
- **fecho:** "O sucesso da sua empresa é a nossa moeda de troca."
- **Regra:** tudo aqui é explicitamente **visão** (site, loja, marketplace, tráfego e trilhas não são entrega — D15/D16).

### 5.14 Slide 14 — Chamada para conversar (`encerramento`)
- **titulo:** "O primeiro passo é uma conversa."
- **subtitulo:** "Me conta como a sua empresa funciona hoje. A gente escuta, diagnostica e desenha o caminho — mesmo que você queira pensar, a conversa é o ponto de partida."
- **imagem:** `melissa` + `logo`
- **rodape:** "UNIQ Empresas · Consultoria para pequenas e médias empresas · Alto Tietê"
- **Sem mecanismo de CTA** (P1 parkada): sem botão/QR/link. Quando o fluxo n8n da MEL ativar, plugar o "Falar com a MEL" aqui.

---

## 6. Assets e prompts de imagem

### 6.1 Existentes

| Asset | Uso | Observação |
|---|---|---|
| `src/assets/mel-full.png` | Slides 1, 8 (avatar), 9, 14 | Mesma imagem do deck (confirmado pelo fundador); precisa de **versão limpa para painel escuro** (tratar fundo) |
| `logo-uniq.png` (`tracking/apresentacao/referencia/`) | Slides 1 e 14 | Fundo branco sólido → **tentar gerar PNG transparente** localmente; senão, prompt abaixo |

### 6.2 Prompts para IA geradora (D17 — se o agente não gerar a imagem)

> Direção obrigatória (DESIGN.md → Imagery): ilustração vetorial sóbria, traço limpo, poucas cores (`#86cb92` menta · `#1f2937` grafite sobre `#efefef`), enquadramento próximo. **Evitar:** banco de imagens, terno/carro/dinheiro, robô/chip/código, gráficos de crescimento, setas e cifrões.

1. **Melissa para painel escuro:**
> "Ilustração vetorial da personagem Melissa, mulher jovem, cabelo loiro, blazer preto com detalhes em verde menta, corpo inteiro, em pé, sorriso acolhedor, braços levemente abertos. Fundo transparente (PNG). Estilo vetorial limpo e sóbrio, contorno suave, sem foto-realismo, sem texto."

2. **Cena de dor (slide 2):**
> "Ilustração vetorial sóbria: balcão de um pequeno comércio brasileiro de bairro. O dono atende um cliente enquanto segura o celular com ícones de mensagem de WhatsApp; prateleiras simples ao fundo, caderno e caixa sobre o balcão. Paleta: grafite #1f2937, verde menta #86cb92 e cinza #efefef. Traço limpo, poucos elementos, muito respiro, enquadramento próximo, luz natural. Sem banco de imagens, sem clichê."

3. **Funil da porta (slide 6):**
> "Ilustração vetorial simples: vista frontal de uma porta de loja de bairro. Na calçada, algumas pessoas passam; poucas entram pela porta; uma delas sai carregando uma sacola. Ao lado, um funil vertical esquemático com 4 degraus: 'passaram na porta', 'entraram', 'compraram', 'voltaram e compraram de novo' (texto em português, curto). Paleta menta #86cb92 + grafite #1f2937 sobre cinza #efefef. Minimalista, sem setas de crescimento."

4. **Fórmula sob medida (slide 10):**
> "Ilustração vetorial da metáfora do médico: uma receita médica (papel com linhas) de onde nasce, como num fluxo, um sistema simples — cartões com ícones de atendimento, agenda e funil — tudo organizado como uma solução sob medida. Paleta menta #86cb92 + grafite #1f2937 sobre cinza #efefef. Limpo, poucos elementos, sem texto longo."

5. **Custos e parceria (slide 7):**
> "Ilustração vetorial sóbria: à esquerda, uma nota/planilha simples de custos com linhas e números (sem gráficos de crescimento, sem setas, sem cifrões); à direita, dois pequenos negócios trocando uma caixa/embalagem — uma gráfica entregando material impresso para uma loja — representando a parceria de insumos entre empresas do grupo. Paleta menta #86cb92 + grafite #1f2937 sobre cinza #efefef. Traço limpo, poucos elementos, muito respiro, enquadramento próximo. Sem banco de imagens, sem aperto de mão genérico, sem clichê de 'empresário de sucesso'."

---

## 7. Tokens e identidade (D22 — hex medidos na v1)

> **Fonte:** `tracking/apresentacao/LEITURA_VISUAL_DECK_V1.md` (medição pixel a pixel de `referencia/slide-01..13.png`). Os hex abaixo **não são estimativas** — D22 está confirmado.

| Papel | Valor | Observação |
|---|---|---|
| fundo claro (canvas) | `#EFEFEF` | canvas (alinhado ao token do `DESIGN.md`) |
| fundo escuro (tela cheia) | `#1F2937` grafite | telas 2, 9, 12, 13, 14 + o painel direito da capa |
| texto principal (tela escura) | `#EFEFEF` | título branco |
| **título em telas claras** | **`#3E5653`** | **exceção D22 confirmada** — menos a capa (item abaixo) |
| **título da capa** | **`#1F2937`** grafite | **medido na v1: a capa é grafite, não verde.** Única tela clara fora da regra acima |
| accent/destaques | `#86CB92` menta | sublinhados, glifos, `✓`, conectores, progresso, hover |
| eyebrow em tela clara | `#627271` | slides 3, 4, 5, 6, 7, 8, 10, 11 |
| eyebrow em tela escura | `#86CB92` menta | slides 2, 9, 12, 13, 14 |
| título de item (tela clara) | `#1A1A1A` | slides 6, 7, 8 |
| corpo/apoio (tela clara) | `#627271` | descrições, `checks`, metadados |
| **corpo sobre escuro** | **`#AEB6B4`** | slides 2, 9, 12, 13, 14 — nunca `#627271` no escuro |
| **marca d'água `01`–`03`** | **`#E1E3E3`** | slides 6, 7, 8 · `aria-hidden` |
| **chip do logo** | **`#E1E1E0`** | slides 1 e 14, atrás do logo |
| **faixa do slide 10** | **`#3E5653`** | a faixa de rodapé do método reusa o token do título verde |
| **arcos decorativos** | **`#2C3D42` / `#314747`** | slide 14, canto inferior-esquerdo · `aria-hidden` |
| divisórias entre colunas | 1px, cor do texto ~15% opacidade | slides 3, 4, 5, 11, 12 — **régua, nunca card** |
| tipografia | Poppins 400/700 | `DESIGN.md` |

---

## 8. Navegação, acessibilidade e responsividade

| Requisito | Especificação |
|---|---|
| Um slide por tela | Tela cheia, mobile-first, sem scroll interno por slide |
| Avançar/voltar | Botões dedicados (48px de alvo de toque) |
| Teclado | `ArrowLeft`/`ArrowRight` — ignorar se foco em `INPUT`/`TEXTAREA`/contentEditable |
| Swipe | Horizontal, limiar ≥ 48px; `touch-pan-y` preserva rolagem vertical |
| Progresso | Barra fina topo (menta sobre cinza, `transition`) + contador "X / 14" |
| A11y | `aria-label` "Slide X de 14"; `aria-live` no contador; `role="progressbar"` + `aria-valuenow`; focus visível; contraste AA |
| Responsividade | Split da capa empilha no mobile; colunas 3→2→1; preço lado a lado empilha no mobile |
| Meta | `noindex, nofollow` (P3) · título "UNIQ Empresas — Apresentação" |
| Scroll | Voltar ao topo a cada troca |

---

## 9. Estados

- O deck é **conteúdo estático** (sem fetch) → sem estados loading/empty/error de dados.
- **Imagens:** cada `imagem` tem `alt` descritivo; se o asset faltar, o layout renderiza o espaço reservado (fundo/placeholder) sem quebrar — nunca tela em branco.
- **Regressão:** rota `/apresentacao` abre sem login (pública), `noindex`.

---

## 10. Ordem de implementação (lanes)

| Lane | Escopo | Depende de |
|---|---|---|
| **L1** | `deck-data.ts` — tipos + SLIDES (conteúdo §5) | — |
| **L2** | `deck-layouts.tsx` — 8 renderizadores | L1 |
| **L3** | `ApresentacaoPage.tsx` — casca + navegação + meta | L1, L2 |
| **L4** | Assets — logo transparente; versão da Melissa p/ escuro; ilustrações (gerar ou aguardar prompt) | — |

L1 → L2 → L3 sequenciais (mesmos arquivos em cadeia); L4 paralelo.

---

## 11. Checklist de verificação

- [ ] Rota `/apresentacao` abre pública, `noindex`, título correto
- [ ] 14 slides na ordem da espinha (§5); capa com headline/subtítulo D21
- [ ] Identidade da v1: ritmo claro/escuro, verde escuro nos títulos claros (D22), menta nos destaques
- [ ] 3 pilares com os nomes decididos (D6/D7/D8)
- [ ] **Nenhuma** promessa do que não existe (site/loja/marketplace/tráfego/trilhas/52 = visão)
- [ ] Slide 12: dois preços no mesmo tamanho; checks "R$ 500 na entrega do MVP" + dias 5/15/25
- [ ] Sem "pagamento na inicialização" e sem "retorno garantido em 90 dias" (A1)
- [ ] Slide 14: chamada para conversar, **sem** botão/QR/link (P1)
- [ ] Navegação: botões, teclado, swipe, progresso, contador — desktop e mobile
- [ ] A11y: aria-labels, aria-live, foco visível, contraste AA
- [ ] Ícones sem gráfico de crescimento/seta/cifrão (regra Imagery)
- [ ] `alt` em todas as imagens; layout não quebra sem asset
- [ ] `npx tsc --noEmit` sem erros novos · `npm run build` ✅ · Vercel `READY`
- [ ] `tracking/TRACKING.md` atualizado

---

## 12. Fora de escopo (registrado)

- **CTA "Falar com a MEL"** no slide 14 — parkado (P1); retomar quando o fluxo n8n ativar.
- **Chat/landing/funil da MEL** — Semana 4.
- **Loja virtual, marketplace, site, tráfego pago** — visão (slide 13), nunca entrega.
- **Módulo de gestão de entregas** — usar CRM + Agenda (decisão fechada).
- **Reaproveitamento do deck atual** — proibido (D3); arquivos reescritos do zero.