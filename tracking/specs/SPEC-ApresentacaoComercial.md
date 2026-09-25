# SPEC — Apresentação Comercial UNIQ

> **Base:** `tracking/plans/PRD-ApresentacaoComercial.md` · **Rota pública:** `/apresentacao` · **Identidade:** `DESIGN.md` (paleta, Poppins, raio, grid e direção de imagens).
> **Processo:** este SPEC e o WIRE correspondente devem ser aprovados antes de qualquer alteração de código.
> **Decisões fechadas:** preço público com tabela e Fase Alfa visíveis; índice para saltar direto a qualquer slide.

## 1. Arquivos

| Arquivo | Ação |
|---|---|
| `src/app/components/apresentacao/slides-data.ts` | Substituir integralmente o modelo antigo e os 13 slides pelos 12 slides definidos nesta SPEC. Exportar `SLIDES` e `TOTAL_SLIDES` derivado do array. |
| `src/app/components/apresentacao/ApresentacaoPage.tsx` | Manter a casca de interação e meta `noindex`; trocar apenas a composição visual, o contador para 12 e a renderização dos novos componentes. |
| `src/app/hooks/use-apresentacao-deck.ts` | Criar o hook `useApresentacaoDeck` com a navegação já existente. |
| `src/app/components/apresentacao/SlideRenderer.tsx` | Criar o seletor determinístico entre os layouts especializados. |
| `src/app/components/apresentacao/SlideTextual.tsx` | Criar renderização para slides textuais. |
| `src/app/components/apresentacao/SlideDiagrama.tsx` | Criar renderização para diagramas sequenciais. |
| `src/app/components/apresentacao/SlideImagem.tsx` | Criar renderização para as ilustrações dos slides 3 e 9. |
| `src/app/components/apresentacao/SlideAvatarMel.tsx` | Criar renderização do slide 6 com o avatar oficial da MEL. |
| `src/app/components/apresentacao/SlideOferta.tsx` | Criar renderização do slide 11 com os dois preços. |
| `src/app/components/apresentacao/SlideTimeline.tsx` | Criar renderização da linha do tempo do slide 12. |
| `src/app/components/apresentacao/SlideIndice.tsx` | Criar o diálogo de índice com os 12 títulos. |
| `src/assets/apresentacao/consultoria-sob-medida.svg` | Arte final sob medida para o slide 3, exportada do OpenDesign; não usar banco de imagens. |
| `src/assets/apresentacao/transformacao-do-empreendedor.svg` | Arte final para o slide 9, exportada do OpenDesign; não usar banco de imagens. |
| `src/app/routes.tsx` | **Sem alteração.** Preservar a rota lazy existente. |

Mapeamento de renderização:

| Componente | Slides | Discriminador |
|---|---:|---|
| `SlideTextual` | 1, 2, 5, 8 | `tipo: "textual"` |
| `SlideImagem` | 3, 9 | `imagem` presente |
| `SlideAvatarMel` | 6 | `avatarMel: true` |
| `SlideDiagrama` | 4, 7, 10 | `diagrama` presente |
| `SlideOferta` | 11 | `oferta` presente |
| `SlideTimeline` | 12 | `timeline` presente |
| `SlideIndice` | transversal | diálogo de navegação, não é um slide |

`SlideRenderer` usa a seguinte prioridade para layouts especializados: `oferta` → `timeline` → `avatarMel` → `imagem` → `diagrama` → textual. O campo `tipo` continua sendo o marcador geral exigido pelo PRD; a existência dos dados específicos define o componente visual.

## 2. Tipos

```ts
export type SlideTipo = "textual" | "visual" | "diagrama";

export interface SlideRotulo {
  texto: string;
  destaque?: boolean;
}

export interface SlideImagem {
  /** URL da imagem importada estaticamente. */
  asset: string;
  alt: string;
}

export interface SlideDiagrama {
  etapas: string[];
}

export interface SlidePreco {
  rotulo: string;
  setup: string;
  mensal: string;
  destaque?: boolean;
}

export interface SlideOferta {
  precos: SlidePreco[];
  nota: string;
}

export interface SlideTimeline {
  etapas: string[];
}

export interface Slide {
  id: number; // 1..12
  tipo: SlideTipo;
  fraseChave: string;
  rotulos: SlideRotulo[];
  imagem?: SlideImagem; // somente slides 3 e 9
  diagrama?: SlideDiagrama; // slides 4, 7 e 10
  avatarMel?: boolean; // somente slide 6
  oferta?: SlideOferta; // somente slide 11
  timeline?: SlideTimeline; // extensão própria do slide 12
}

export const TOTAL_SLIDES = SLIDES.length; // 12
```

Invariantes do modelo:

- Exatamente 12 objetos, com `id` único e sequencial de 1 a 12, na ordem da tabela do PRD §4.1.
- `fraseChave` usa literalmente a frase aprovada para cada slide e é a única frase completa renderizada no slide.
- `rotulos` tem no máximo 3 itens; cada item tem de 2 a 4 palavras. Um array vazio é permitido.
- `destaque` significa apenas ênfase tipográfica ou cromática; nunca significa riscar um preço.
- `imagem` só existe nos slides 3 e 9; o slide 6 usa `avatarMel` e a imagem oficial `src/assets/mel-full.png`.
- `diagrama` só existe nos slides 4, 7 e 10; `timeline` só existe no slide 12; `oferta` só existe no slide 11.
- O arquivo não terá `titulo`, `subtitulo`, `corpo`, `itens`, `planos`, `fala` ou outros campos do deck anterior.
- O índice reutiliza `id` + `fraseChave`; não haverá uma segunda lista de títulos com texto paralelo ao deck.

## 3. Conteúdo dos 12 slides

| # | Tipo / renderização | `fraseChave` — exibida no topo | Rótulos e dados específicos |
|---:|---|---|---|
| 1 | textual · `SlideTextual` | `Estamos construindo a UNIQ Empresas.` | `SUZANO · ALTO TIETÊ`; `Fase Alfa · Outubro 2026` |
| 2 | textual · `SlideTextual` | `Temos tecnologia. Não somos uma empresa de tecnologia.` | `rotulos: []` |
| 3 | visual · `SlideImagem` | `É como ir ao médico.` | `Você conta a dor`; `Fórmula para o negócio`; imagem `consultoria-sob-medida.svg`, alt: `Ilustração de uma fórmula preparada para um negócio específico.` |
| 4 | diagrama · `SlideDiagrama` | `Três objetivos. Nessa ordem.` | `diagrama.etapas`: `1 Faturamento` → `2 Margem` → `3 Transformação`; `rotulos: []` |
| 5 | textual · `SlideTextual` | `Sem fôlego, nada muda.` | `Começamos pelo caixa` |
| 6 | visual · `SlideAvatarMel` | `Seu cliente nunca fica no vácuo.` | `Responde na hora`; `Faz o acompanhamento`; `Faz agendamentos`; `avatarMel: true` |
| 7 | diagrama · `SlideDiagrama` | `O número mostra onde está o problema.` | `diagrama.etapas`: `Passaram` → `Entraram` → `Compraram` → `Voltaram`; sem números ou percentuais; `rotulos: []` |
| 8 | textual · `SlideTextual` | `Lucro é o que sobra. Você precisa saber quanto sobra.` | `Quanto sobra por venda`; `Onde cada real vai`; `Preço certo` |
| 9 | visual · `SlideImagem` | `Ele é mais jogador do jogo do que pensador do jogo.` | `Empreendedor → Empresário`; imagem `transformacao-do-empreendedor.svg`, alt: `Ilustração da passagem da operação do negócio para a gestão e a decisão.` |
| 10 | diagrama · `SlideDiagrama` | `A MEL atende seus clientes. E conversa com você.` | `diagrama.etapas`: `Clientes · WhatsApp` e `Você · Base UNIQ`, em dois canais distintos; `rotulos: []` |
| 11 | visual + números · `SlideOferta` | `R$ 500 reserva a sua vaga.` | `rotulos: []`; `oferta` detalhado abaixo |
| 12 | diagrama · `SlideTimeline` | `O nosso lucro hoje é o seu resultado.` | `timeline.etapas`: `Alfa 4` → `Jan +4` → `Abr +4` → `12 cases` → `Lançamento jul/2027`; `rotulos: []` |

As etapas de `diagrama.etapas` e `timeline.etapas` são nós estruturais de sequência, não itens do campo `rotulos`; por isso o slide 7 pode preservar as quatro etapas do roteiro sem exceder o limite de 3 rótulos.

### Slide 11 — dados obrigatórios da oferta

```ts
oferta: {
  precos: [
    {
      rotulo: "Tabela",
      setup: "R$ 1.500",
      mensal: "R$ 297/mês",
    },
    {
      rotulo: "Fase Alfa · Sinal de compromisso",
      setup: "R$ 500",
      mensal: "R$ 197/mês",
      destaque: true,
    },
  ],
  nota: "condição válida para as 4 vagas da Fase Alfa",
}
```

Regras de renderização da oferta:

- Os dois preços ficam visíveis; a Tabela vem primeiro e a Fase Alfa recebe o destaque.
- Nenhum preço será riscado; as expressões “de R$ 1.500 por R$ 500” e equivalentes são proibidas.
- R$ 500 é apresentado somente como **sinal de compromisso**, nunca como desconto.
- A nota de escassez é obrigatória e literal. A Fase Alfa tem 4 vagas; não haverá cronômetro, contagem regressiva ou “últimas vagas”.
- A mensalidade é exibida como valor mensal, sem inventar data de cobrança ou resultado.

## 4. Hook — `useApresentacaoDeck`

Arquivo: `src/app/hooks/use-apresentacao-deck.ts`.

```ts
interface UseApresentacaoDeck {
  indice: number; // base 0; a UI exibe indice + 1
  avancar(): void;
  voltar(): void;
  irPara(indice: number): void;
}
```

Contrato:

- `indice` inicia em `0`; não ler nem gravar `localStorage`, parâmetros de URL ou hash, portanto recarregar volta ao slide 1.
- `avancar` e `voltar` limitam o índice a `0..11` e não travam nas extremidades.
- `irPara(indice)` aceita base 0, limita ao mesmo intervalo e move diretamente ao slide escolhido.
- Listener em `window` para `ArrowRight` e `ArrowLeft`, com `preventDefault`, ignorando eventos cujo alvo seja `INPUT`, `TEXTAREA` ou um elemento `contentEditable`; remover o listener no cleanup.
- Swipe horizontal com eventos de ponteiro, preservando a lógica atual: registrar `clientX` apenas para `pointerType === "touch"`, usar limiar de 48 px, avançar à esquerda e voltar à direita, e zerar a referência em `pointerup` e `pointercancel`.
- Executar `window.scrollTo(0, 0)` sempre que `indice` mudar, inclusive por `irPara`.
- A lógica de sliders deve permanecer em um único hook; `ApresentacaoPage` apenas consome e conecta o resultado à casca visual.

## 5. Índice / atalho

- O footer recebe um botão discreto `Índice`, com nome acessível claro, disponível em todos os slides.
- O botão abre `SlideIndice`, um diálogo com `role="dialog"`, `aria-modal="true"` e título `Índice dos slides`.
- O diálogo lista os 12 itens na ordem, usando o `id` e a `fraseChave`; o slide atual recebe `aria-current="step"`.
- Cada item é um botão. Ativá-lo chama `irPara(indice)`, fecha o diálogo e leva o foco à região do novo slide.
- `Escape` fecha o diálogo. `Tab` e `Shift+Tab` permanecem dentro dele enquanto estiver aberto.
- Ao abrir, o foco vai para o item do slide atual; ao fechar sem navegar, retorna ao botão `Índice`.
- O índice permite chegar diretamente à oferta, no item 11, sem percorrer os slides anteriores.
- O índice não altera a URL e não cria navegação aninhada nem nova rota.

## 6. Acessibilidade

- Cada região de slide recebe `aria-label="Slide X de 12: <fraseChave>"` e é identificada como região de conteúdo.
- O contador visível mostra `X / 12`; uma única mensagem `aria-live="polite" aria-atomic="true"` anuncia “Slide X de 12”. O contador visível pode permanecer `aria-hidden="true"` para evitar anúncio duplicado.
- A barra superior usa `role="progressbar"`, `aria-valuemin={1}`, `aria-valuemax={12}`, `aria-valuenow={indice + 1}` e label com o slide atual.
- Os botões anterior e próximo têm nomes acessíveis, ficam desabilitados nas extremidades e mantêm foco visível. Toda ação continua disponível por teclado; swipe nunca é a única forma de navegar.
- A frase-chave é o heading semântico do slide. Diagramas e timeline usam listas ordenadas, sem depender apenas de setas ou cor para comunicar a sequência.
- Slides 3 e 9 usam os `alt` definidos no conteúdo. O slide 6 usa `src/assets/mel-full.png` com alt `MEL, assistente da UNIQ.`.
- O diálogo de índice prende e restaura foco conforme a seção anterior. Contraste e foco visível seguem `DESIGN.md`.
- Não há animação autônoma, som ou movimento que interrompa a leitura; apenas a transição de largura já existente na barra de progresso pode ser mantida.

## 7. Estados

**Loading, empty, error e sucesso não se aplicam.** O deck é estático, usa um array local e não faz chamada de API nem consulta banco. Não implementar skeleton, spinner, estado vazio, cartão de erro ou tela de sucesso: isso inventaria estados para conteúdo que está sempre disponível.

A única exceção é a falha de carregamento da própria página, coberta pelo comportamento padrão da aplicação, conforme o PRD §4.4.

## 8. Responsividade

- No notebook, o conteúdo principal trabalha em uma composição de referência 16:9, com proporções calculadas para deixar o slide inteiro visível e com bastante respiro.
- No celular, o slide passa para fluxo vertical: frase-chave no topo e conteúdo empilhado na ordem de leitura.
- Nada pode ser cortado, ocultado ou acessível apenas por hover. Diagramas ficam verticais ou empilhados sem perder a ordem; a timeline vira uma lista vertical em ordem cronológica; os cards da oferta se empilham com Tabela primeiro e Fase Alfa depois.
- As imagens usam `object-contain` ou composição equivalente para nunca serem cortadas. Em telas menores, podem reduzir proporcionalmente, mas não desaparecem.
- O diálogo de índice pode ter rolagem interna quando a lista excede a área visível. Navegação e índice continuam alcançáveis no celular.
- Desktop, tablet e celular usam os mesmos 12 itens; responsividade significa reorganização, não uma variante de conteúdo reduzida.

## 9. Regras de UI

### Tokens

| Uso | Token |
|---|---|
| Canvas | `#efefef` |
| Texto e títulos | `#1f2937` |
| Destaque e ação | `#86cb92` |
| Superfícies | `#ffffff` |
| Texto secundário | `#627271` |
| Bordas | `#efefef`, 1px |

- Tipografia: **Poppins 400 e 700**, com os fallbacks oficiais. Não introduzir pesos 800/900.
- Raio: **8px**. Espaçamento: grade de **8px**.
- Nenhum azul corporativo. A identidade esverdeada é obrigatória.
- Nenhum elemento decorativo sem função. Imagens, diagramas, destaque e movimento precisam reforçar a frase-chave ou a ordem da ideia.
- A frase-chave fica no topo. O conteúdo abaixo dela não vira parágrafo, descrição ou segunda frase.

### Regras de conteúdo

- É proibido colocar na tela qualquer entrega inexistente ou visão futura tratada como entrega, conforme a lista do PRD §5.
- Não usar multiplicador de resultado, número de cliente inventado, percentual não informado ou promessa de resultado garantido.
- Não usar jargão, frase de efeito, frase de LinkedIn, banco de imagens genérico, ícones de tecnologia ou clichê de empresário de sucesso.
- A ambição falada sobre a quantidade futura de clientes não aparece no deck.
- Não usar urgência artificial. A única menção a escassez é a linha real da Fase Alfa definida no slide 11.
- Não usar “desconto” para R$ 500 e não riscar preço.
- Nenhuma fala do fundador vai para a tela. O conteúdo vem exclusivamente de `fraseChave`, `rotulos` e dados estruturados desta SPEC.
- “MEL” é o nome exibido; “Melissa” não aparece no deck.

## 10. Rota

Manter sem alteração a entrada existente, antes do `AppLayout`:

```tsx
{
  path: "/apresentacao",
  lazy: pagina(
    () => import("./components/apresentacao/ApresentacaoPage"),
    "ApresentacaoPage"
  ),
}
```

- Rota pública, sem login e fora do `AppLayout`.
- Não criar rota nova, subpágina autenticada ou link privado.
- `ApresentacaoPage` continua ajustando `document.title` e inserindo a meta `robots` com `noindex, nofollow`, removendo-a no cleanup.

## 11. Checklist

### Conteúdo

- [ ] Exatamente 12 slides, na ordem 1..12 e com as 12 `fraseChave` literais do PRD §4.1.
- [ ] Cada slide tem no máximo 3 rótulos, todos com 2 a 4 palavras; diagramas e timeline preservam suas etapas estruturais.
- [ ] Nenhuma fala do fundador e nenhum campo do modelo antigo permaneceram em `slides-data.ts`.
- [ ] Nenhum item proibido pelo PRD §5 aparece como entrega ou texto de tela.
- [ ] O slide 11 mostra Tabela e Fase Alfa lado a lado no notebook e empilhadas no celular, sem riscar valores.
- [ ] O slide 11 identifica R$ 500 como sinal de compromisso e exibe a nota literal sobre as 4 vagas da Fase Alfa.
- [ ] A ambição falada de clientes futuros, números de resultado e qualquer percentual inventado não aparecem.
- [ ] Slides 3 e 9 usam as ilustrações sob medida; slide 6 usa `src/assets/mel-full.png`.

### Interação

- [ ] Avançar e voltar funcionam por botões, `←` / `→` e swipe horizontal.
- [ ] O contador visível mostra `X / 12` e há uma única atualização `aria-live` equivalente.
- [ ] A barra de progresso possui atributos completos de `progressbar`.
- [ ] O botão `Índice` abre um diálogo acessível e permite chegar diretamente a qualquer slide, inclusive à oferta.
- [ ] Recarregar a rota sempre abre o slide 1.

### Visual e responsividade

- [ ] A casca 16:9 do notebook não corta nenhum conteúdo.
- [ ] No celular, todos os itens continuam presentes em fluxo empilhado e legível; diagramas e linha do tempo não têm transbordo horizontal.
- [ ] Paleta, Poppins 400/700, borda de 1px, raio de 8px e grid de 8px seguem `DESIGN.md`.
- [ ] Não há azul corporativo, banco de imagens ou elemento decorativo sem função.
- [ ] Foco visível, textos alternativos, contraste, semântica da sequência e gestão de foco do diálogo funcionam por teclado.

### Técnico e processo

- [ ] `/apresentacao` continua pública, lazy e fora do `AppLayout`; nenhuma rota nova foi criada.
- [ ] Não há API, autenticação, persistência da posição ou analytics de visualização.
- [ ] O deck anterior permanece preservado até a aprovação da nova versão.
- [ ] `tracking/TRACKING.md` é atualizado na implementação.
- [ ] Build concluído e deploy na Vercel com `state: READY`.
- [ ] O fundador valida a apresentação pelo celular.
- [ ] O WIRE está aprovado antes de qualquer alteração de código.

## 12. Fora de escopo

- Captura de lead, formulário e CTA para WhatsApp.
- Login, autenticação, rota privada ou link tokenizado.
- Integração com Supabase ou outro backend.
- Analytics de visualização.
- Versão em PDF, exportação ou arquivo para download.
- Vídeo, som ou animação complexa.
- Apagar o deck antigo antes da aprovação da nova versão.
- Criar uma segunda página ou uma nova rota para a apresentação.
