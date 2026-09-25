# WIRE — Apresentação Comercial UNIQ

> **Estrutura e função:** deck público de 12 slides, um slide por vez, para a conversa presencial conduzida pelo fundador e para a leitura posterior no celular. O slide é apoio visual: ele não precisa vender sozinho, não carrega a fala do fundador e não contém uma segunda narrativa.
>
> **Rota:** `/apresentacao` — rota pública, sem login e fora do `AppLayout`. A entrada lazy existente permanece; `ApresentacaoPage` continua ajustando o título da página e a meta `robots` `noindex, nofollow`.
>
> **Processo visual:** **o design real acontece no OpenDesign**. Este arquivo é o wireframe de estrutura, ordem, função e navegação; não é a tela final nem uma segunda fonte de copy.

## 1. Cabeçalho — estrutura e função

- **Unidade de navegação:** um slide por vez, com a composição inteira visível na área de apresentação.
- **Função:** permitir que o fundador pule e volte livremente durante a conversa, sem perder a ordem das ideias.
- **Conteúdo visível:** exclusivamente a `fraseChave`, os `rotulos` e os dados estruturados definidos na SPEC §3. A frase-chave fica no topo e é a única frase completa do slide.
- **Etapas estruturais:** `diagrama.etapas` e `timeline.etapas` são nós de sequência; não contam como itens do campo `rotulos`.
- **Sem texto de apoio na tela:** a fala do fundador, explicações, parágrafos, CTA, formulário, captura de lead e promessa de entrega não entram no deck.
- **Identidade de referência:** `DESIGN.md` é a fonte oficial. Usar `#efefef` no canvas, `#1f2937` no texto, `#86cb92` no destaque/ação, `#ffffff` nas superfícies, `#627271` no texto secundário e borda de 1px. Tipografia Poppins 400/700, raio de 8px e grid de 8px; nenhum azul corporativo.
- **Imagens:** ilustração vetorial simples e funcional, com respiro; nunca banco de imagens genérico. O avatar da MEL é o asset oficial `src/assets/mel-full.png`. Slides 3 e 9 usam somente as artes sob medida indicadas na SPEC.

### Mapa de componentes e hook

- `ApresentacaoPage`: casca de interação reutilizada, com área do slide, progresso, rodapé e conexão ao hook; não reescreve a lógica de navegação.
- `useApresentacaoDeck`: mantém `indice` base 0 e expõe `avancar()`, `voltar()` e `irPara(indice)`. A interface exibe `indice + 1`.
- `SlideRenderer`: seleciona o layout especializado por dados específicos.
- `SlideTextual`: slides 1, 2, 5 e 8.
- `SlideImagem`: slides 3 e 9.
- `SlideAvatarMel`: slide 6.
- `SlideDiagrama`: slides 4, 7 e 10.
- `SlideOferta`: slide 11.
- `SlideTimeline`: slide 12.
- `SlideIndice`: diálogo transversal de navegação; não é um 13º slide.
- **Prioridade de `SlideRenderer`:** `oferta`, `timeline`, `avatarMel`, `imagem`, `diagrama` e, por último, textual.

## 2. Moldura do deck — referência 16:9

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ BARRA DE PROGRESSO  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  ÁREA DO SLIDE — um slide inteiro, sem corte                                       │  │
│  │                                                                                    │  │
│  │  frase-chave no topo                                                               │  │
│  │  renderização especializada abaixo                                                 │  │
│  │  conteúdo específico abaixo                                                        │  │
│  │                                                                                    │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Índice]                    ‹                       X / 12                       ›          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- A barra superior é fina, fixa e funcional: o preenchimento verde menta representa o slide atual em 12.
- A área do slide respeita a referência 16:9 no notebook, com respiro e sem conteúdo fora do quadro.
- O rodapé é discreto e persistente: botão `Índice`, anterior `‹`, contador `X / 12` e próximo `›`.
- A navegação é sempre alcançável; nenhum controle depende de hover.
- O índice é um atalho de navegação, não uma nova tela, rota ou conteúdo do deck.

## 3. Slides — 12 blocos de estrutura

### Slide 1 · `SlideTextual`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Estamos construindo a UNIQ Empresas.                                                   │
│                                                                                        │
│                              SUZANO · ALTO TIETÊ                                      │
│                                                                                        │
│                         Fase Alfa · Outubro 2026                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Função de layout:** capa sóbria, com a frase no topo, bastante respiro e a identificação local/da fase abaixo. A composição deve comunicar começo em construção, sem cara de empresa pronta.

**Não fazer:** foguete, gráfico de crescimento, aperto de mão, foto de sucesso ou qualquer elemento que sugira uma empresa já consolidada. Não acrescentar copy de abertura.

### Slide 2 · `SlideTextual`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Temos tecnologia. Não somos uma empresa de tecnologia.                                │
│                                                                                        │
│                                                                                        │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Dados estruturais:** `rotulos: []`.

**Função de layout:** slide textual puro. A frase ocupa o centro da composição e o espaço vazio é intencional; no máximo, um detalhe cromático na segunda oração, sem criar um bloco de texto paralelo.

**Não fazer:** engrenagem, código, chip, robô ou qualquer ícone de tecnologia. A ausência de ícones reforça a própria frase.

### Slide 3 · `SlideImagem`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ É como ir ao médico.                                                                  │
│                                                                                        │
│ ┌──────────────────────┐   ┌────────────────────────────────────────────────────────┐ │
│ │ Você conta a dor     │   │ consultoria-sob-medida.svg                             │ │
│ │ Fórmula para o negócio│  │ ARTE FINAL SOB MEDIDA                                 │ │
│ └──────────────────────┘   └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Imagem:** `src/assets/apresentacao/consultoria-sob-medida.svg`.
- **Alt:** `Ilustração de uma fórmula preparada para um negócio específico.`

**Função de layout:** os dois rótulos ficam secundários e a arte ocupa a maior parte da composição. A imagem precisa mostrar a fórmula preparada para o caso, não uma cena de atendimento.

**Não fazer:** jaleco, estetoscópio, hospital, cruz vermelha, frasco de prateleira, banco de imagens ou pessoas sorrindo para a câmera.

### Slide 4 · `SlideDiagrama`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Três objetivos. Nessa ordem.                                                         │
│                                                                                        │
│                              ┌──────────────────┐                                      │
│                         ┌────┤ 3 Transformação │                                      │
│                    ┌────┤ 2 Margem          │                                      │
│               ┌────┤ 1 Faturamento       │                                      │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Dados estruturais:** `diagrama.etapas`: `1 Faturamento`, `2 Margem`, `3 Transformação`; `rotulos: []`.

**Função de layout:** os três nós sobem como uma escada, em sequência legível da esquerda para a direita; a ordem faz parte do argumento e não é apenas uma lista de itens iguais.

**Não fazer:** apresentar os três como blocos paralelos, um menu de opções ou três resultados independentes. Não substituir a sequência por setas decorativas.

### Slide 5 · `SlideTextual`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Sem fôlego, nada muda.                                                               │
│                                                                                        │
│                         Começamos pelo caixa                                         │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Função de layout:** texto com muito respiro e um único apoio visual, se necessário, para sugerir fôlego/respiro. O rótulo permanece curto e isolado.

**Não fazer:** cifrão, notas de dinheiro, gráfico de crescimento, seta para cima, promessa de resultado garantido ou qualquer segundo texto explicativo.

### Slide 6 · `SlideAvatarMel`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Seu cliente nunca fica no vácuo.                                                     │
│                                                                                        │
│ ┌────────────────────┐   ┌────────────────────────────┐                              │
│ │ AVATAR MEL         │   │ Responde na hora           │                              │
│ │ mel-full.png       │   ├────────────────────────────┤                              │
│ │                    │   │ Faz o acompanhamento      │                              │
│ └────────────────────┘   ├────────────────────────────┤                              │
│                          │ Faz agendamentos            │                              │
│                          └────────────────────────────┘                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Avatar:** `src/assets/mel-full.png`.
- **Alt:** `MEL, assistente da UNIQ.`

**Dados estruturais:** `avatarMel: true`; os três rótulos da tela são `Responde na hora`, `Faz o acompanhamento` e `Faz agendamentos`.

**Função de layout:** o avatar oficial aparece como presença humana da MEL ao lado dos três rótulos, em uma composição simples e funcional. A tela exibe `MEL`; a forma falada do nome não é exibida.

**Não fazer:** robô genérico, andróide, olhos brilhantes, dono ilustrado de férias ou qualquer personagem novo. Não acrescentar conversa de WhatsApp como texto adicional.

### Slide 7 · `SlideDiagrama`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ O número mostra onde está o problema.                                                 │
│                                                                                        │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐               │
│  │ Passaram   │    │ Entraram   │    │ Compraram  │    │ Voltaram   │               │
│  └────────────┘    └────────────┘    └────────────┘    └────────────┘               │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Dados estruturais:** `diagrama.etapas`: `Passaram`, `Entraram`, `Compraram`, `Voltaram`; `rotulos: []`.

**Função de layout:** quatro etapas estruturais, com a ordem preservada e sem transformar os nomes em métricas. A forma do diagrama deve fazer o percurso ser lido rapidamente; a semântica fica em lista ordenada.

**Não fazer:** números, percentuais, dashboard falso, gráfico de barras, gráfico de linha, meta ou resultado inventado.

### Slide 8 · `SlideTextual`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Lucro é o que sobra. Você precisa saber quanto sobra.                               │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Quanto sobra por venda                                                         │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │ Onde cada real vai                                                            │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │ Preço certo                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Função de layout:** três linhas curtas em uma superfície limpa, com apoio apenas na estrutura e no contraste. A lista deve ser lida de relance, sem virar um painel de métricas.

**Não fazer:** gráfico de pizza, troféu, promessa de lucro garantido, cifrão, percentual ou qualquer número não informado.

### Slide 9 · `SlideImagem`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Ele é mais jogador do jogo do que pensador do jogo.                                  │
│                                                                                        │
│                         Empreendedor → Empresário                                   │
│                                                                                        │
│              ┌──────────────────────────────────────────────────┐                    │
│              │ transformacao-do-empreendedor.svg                 │                    │
│              │ ARTE FINAL SOB MEDIDA                           │                    │
│              └──────────────────────────────────────────────────┘                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Imagem:** `src/assets/apresentacao/transformacao-do-empreendedor.svg`.
- **Alt:** `Ilustração da passagem da operação do negócio para a gestão e a decisão.`

**Função de layout:** o rótulo literal faz a passagem de um estado ao outro e a arte comunica a transformação sem repetir o clichê. A seta só aparece como parte do rótulo aprovado; não há setas decorativas na composição.

**Não fazer:** homem de terno, aperto de mão, escritório de luxo, carro, dinheiro, foto de cliente ou estética de empresário de sucesso.

### Slide 10 · `SlideDiagrama`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ A MEL atende seus clientes. E conversa com você.                                    │
│                                                                                        │
│       ┌──────────────────────────┐          ┌──────────────────────────┐              │
│       │ Clientes · WhatsApp     │          │ Você · Base UNIQ          │              │
│       └──────────────────────────┘          └──────────────────────────┘              │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Dados estruturais:** `diagrama.etapas`: `Clientes · WhatsApp`, `Você · Base UNIQ`; `rotulos: []`.

**Função de layout:** dois blocos equidistantes e claramente separados; cada bloco contém apenas a etapa estrutural correspondente. Não há rótulo adicional “fora”/“dentro” nem uma terceira via.

**Não fazer:** sugerir que a MEL substitui o consultor humano. Não fundir os canais, não criar uma promessa de entrega e não usar setas que misturem as duas relações.

### Slide 11 · `SlideOferta`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ R$ 500 reserva a sua vaga.                                                            │
│                                                                                        │
│ ┌──────────────────────────┐   ┌──────────────────────────────────────────┐              │
│ │ Tabela                   │   │ Fase Alfa                             │              │
│ │                          │   │ · Sinal de compromisso              │              │
│ ├──────────────────────────┤   ├──────────────────────────────────────────┤              │
│ │ R$ 1.500                 │   │ R$ 500                                   │              │
│ │ R$ 297/mês               │   │ R$ 197/mês                               │              │
│ └──────────────────────────┘   └──────────────────────────────────────────┘              │
│                                                                                        │
│ condição válida para as 4 vagas da Fase Alfa                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- `precos[0].rotulo`: `Tabela`.
- `precos[0].setup`: `R$ 1.500`.
- `precos[0].mensal`: `R$ 297/mês`.
- `precos[1].rotulo`: `Fase Alfa · Sinal de compromisso`.
- `precos[1].setup`: `R$ 500`.
- `precos[1].mensal`: `R$ 197/mês`.
- `precos[1].destaque`: `true`.
- `rotulos`: `[]`.
- `nota`: `condição válida para as 4 vagas da Fase Alfa`.

**Função de layout:** no notebook, os dois preços são cartões lado a lado, com Tabela primeiro e Fase Alfa em destaque visual. O campo `Fase Alfa · Sinal de compromisso` pode quebrar em duas linhas sem mudar o conteúdo. O destaque da Fase Alfa é cor/peso de borda, nunca apagamento. A nota fica abaixo dos dois cartões, legível e literal.

**Não fazer:** riscar qualquer preço; usar “de R$ 1.500 por R$ 500” ou equivalente; esconder a Tabela; usar cronômetro, contagem regressiva, “últimas vagas” ou urgência artificial; chamar R$ 500 de desconto. R$ 500 é somente **sinal de compromisso**.

### Slide 12 · `SlideTimeline`

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ O nosso lucro hoje é o seu resultado.                                               │
│                                                                                        │
│   Alfa 4          Jan +4          Abr +4          12 cases       Lançamento jul/2027  │
│      ●────────────────●──────────────●──────────────●──────────────●                  │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Etapas de `timeline.etapas`:** `Alfa 4` · `Jan +4` · `Abr +4` · `12 cases` · `Lançamento jul/2027`.
- **Dados estruturais:** `rotulos: []`.

**Função de layout:** linha do tempo simples, com cinco marcos em sequência e sem número de resultado, caso de cliente ou promessa adicional. A composição é um registro do caminho, não uma métrica de desempenho.

**Não fazer:** “52 parceiros”, troféu, medalha, foto de cliente, “case de sucesso” com promessa, urgência artificial ou qualquer ambição falada que não esteja nas etapas aprovadas.

## 4. Guardas de estrutura e anti-padrões

As regras abaixo valem para todos os blocos e para o design final no OpenDesign:

- **Legível de relance vence beleza.** Não há excesso de texto, parágrafo explicativo, texto de fala do fundador, CTA ou segunda frase.
- **Nada decorativo sem função.** Cada imagem, etapa, cor ou destaque reforça a frase-chave ou a ordem da ideia.
- **Sem banco de imagens genérico**, pessoas sorrindo, reunião genérica ou foto de sucesso. Não copiar layout, tom ou estrutura do deck em `tracking/apresentacao/referencia/`.
- **Sem azul corporativo.** A identidade esverdeada vem de `DESIGN.md`.
- **Sem ícones ou grafismos de tecnologia** que contradigam a proposta: robô, chip, engrenagem e código ficam fora.
- **Sem símbolos de moeda além dos preços obrigatórios do slide 11**; sem setas decorativas, prêmios ou celebração. A seta de `Empreendedor → Empresário` é parte do rótulo literal e funcional do slide 9.
- **Sem jargão, frase de efeito ou tom de relatório.** O texto da tela é direto, local e comprime a ideia em poucas palavras.
- **Não tratar visão futura como entrega:** não aparecer site, loja virtual, marketplace, trilhas, campanhas de tráfego ou integração que não existe hoje.
- **Não inventar número, percentual, meta, cliente ou resultado**; não usar multiplicador de resultado.
- **Não criar urgência artificial.** A única escassez mostrada é a nota literal sobre as quatro vagas da Fase Alfa no slide 11.
- O nome exibido para a assistente é **MEL**. A forma falada do nome não vai para a tela.

## 5. Painel de índice/atalho

O botão `Índice` fica no rodapé em todos os slides. Ao abrir, o conteúdo do slide permanece no lugar e o diálogo lista os mesmos 12 `id` + `fraseChave`, sem uma segunda lista de títulos.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Índice dos slides                                                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  1  Estamos construindo a UNIQ Empresas.                                             │
│  2  Temos tecnologia. Não somos uma empresa de tecnologia.                           │
│  3  É como ir ao médico.                                                            │
│  4  Três objetivos. Nessa ordem.                                                    │
│  5  Sem fôlego, nada muda.                                                          │
│  6  Seu cliente nunca fica no vácuo.                                                │
│  7  O número mostra onde está o problema.                                           │
│  8  Lucro é o que sobra. Você precisa saber quanto sobra.                         │
│  9  Ele é mais jogador do jogo do que pensador do jogo.                             │
│ 10  A MEL atende seus clientes. E conversa com você.                                │
│ 11  R$ 500 reserva a sua vaga.                                                      │
│ 12  O nosso lucro hoje é o seu resultado.                                          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- O título acessível do diálogo é `Índice dos slides`.
- Cada linha é um botão. O item do slide atual recebe `aria-current="step"`.
- Selecionar um item chama `irPara(indice)`, fecha o diálogo e leva o foco à região do novo slide; o slide 11 pode ser alcançado diretamente.
- `Esc` fecha o diálogo. `Tab` e `Shift+Tab` permanecem dentro dele enquanto está aberto.
- Ao abrir, o foco vai para o item atual. Ao fechar sem navegar, o foco retorna ao botão `Índice`.
- O índice não muda a URL, não cria hash, rota aninhada ou segunda página; pode ter rolagem interna no celular.

## 6. Comportamento da navegação

- **Botões:** `‹` chama `voltar()` e `›` chama `avancar()`. Eles são discretos, têm nomes acessíveis e ficam desabilitados no primeiro/último slide; não há loop nas extremidades.
- **Teclado:** `ArrowLeft`/`←` volta e `ArrowRight`/`→` avança, com `preventDefault`. O listener global ignora `INPUT`, `TEXTAREA` e elementos `contentEditable` e é removido no cleanup.
- **Swipe horizontal:** registrar `clientX` somente em `pointerType === "touch"`. Com deslocamento de pelo menos 48px, arrastar para a esquerda avança e para a direita volta. O valor de referência é zerado em `pointerup` e `pointercancel`.
- **Ir direto:** `irPara(indice)` aceita índice base 0, limita ao intervalo `0..11` e move diretamente para o slide escolhido, inclusive o slide 11.
- **Recarregar:** `indice` começa em `0`; o slide 1 é exibido novamente. Não ler nem gravar `localStorage`, query string ou hash; a posição não persiste.
- **Troca de slide:** executar `window.scrollTo(0, 0)` sempre que `indice` mudar, inclusive por `irPara`.
- **Ação disponível sem touch:** nenhum usuário de teclado fica preso; swipe é apenas uma alternativa.
- **Movimento:** não há animação autônoma, som ou transição que interrompa a leitura. A largura da barra de progresso pode usar a transição já existente.

## 7. Responsividade

### Notebook e tablet

- A referência principal é 16:9, com o slide inteiro visível e respiro suficiente.
- O grid segue 8px; cartões, imagens e diagramas respeitam o raio de 8px e a borda de 1px.
- Tablet não quebra a moldura: se a largura exigir, o conteúdo se reorganiza internamente, mas nenhum item desaparece.

### Celular

- A referência 16:9 vira fluxo vertical: `fraseChave` no topo e conteúdo empilhado na ordem de leitura.
- Nada é cortado, ocultado ou acessível somente por hover. A área do diálogo pode rolar internamente; `Índice`, contador e navegação continuam alcançáveis.
- Rótulos textuais viram lista vertical, sem reduzir o número de itens.
- Diagramas ficam verticais ou empilhados, preservando a ordem das etapas.
- A timeline vira lista vertical cronológica, sem transbordo horizontal.
- A oferta empilha **Tabela primeiro** e **Fase Alfa depois**; os dois preços e a nota continuam presentes.
- As imagens usam composição `object-contain` ou equivalente, reduzem proporcionalmente e nunca desaparecem.
- O celular usa os mesmos 12 slides e os mesmos dados do notebook; responsividade é reorganização, não uma segunda versão do conteúdo.

### Exemplo de reorganização de um slide-tipo

```text
DESKTOP / TABLET                         CELULAR

┌──────────────────────────────┐         ┌──────────────────────────┐
│ Rótulos em composição leve  │         │ Rótulos empilhados:      │
│ • Quanto sobra por venda    │         │ Quanto sobra por venda   │
│ • Onde cada real vai        │         │ Onde cada real vai       │
│ • Preço certo               │         │ Preço certo              │
└──────────────────────────────┘         └──────────────────────────┘

┌──────────────────────────────┐         ┌──────────────────────────┐
│ Alfa 4   Jan +4   Abr +4    │         │ Alfa 4                   │
│ 12 cases   Lançamento jul/2027│        │ Jan +4                   │
└──────────────────────────────┘         │ Abr +4                   │
                                         │ 12 cases                 │
┌───────────────┬───────────────┐         │ Lançamento jul/2027      │
│ Tabela        │ Fase Alfa     │         └──────────────────────────┘
└───────────────┴───────────────┘         ┌──────────────────────────┐
                                         │ Tabela                   │
                                         │ R$ 1.500                 │
                                         │ R$ 297/mês               │
                                         └──────────────────────────┘
                                         ┌──────────────────────────┐
                                         │ Fase Alfa                │
                                         │ R$ 500                   │
                                         │ R$ 197/mês               │
                                         └──────────────────────────┘
```

## 8. Estados

- **Conteúdo:** estático, vindo de `SLIDES` local; sem API, consulta a banco, captura de dado ou persistência.
- **Loading:** não se aplica; não há skeleton nem spinner.
- **Empty:** não se aplica; não há lista remota ou resultado condicional para uma tela vazia.
- **Error:** não se aplica; o deck não executa uma operação que possa falhar no conteúdo. A falha de carregamento da própria página segue o comportamento padrão da aplicação, conforme PRD §4.4 e SPEC §7.
- **Success:** não se aplica; não há submissão, confirmação de compra ou estado de sucesso.
- **Regra para o CODER:** não inventar estados para satisfazer uma regra que foi criada para telas com dados. A exceção da falha de carregamento da página não vira um estado visual do deck.

## 9. Acessibilidade

- Cada região de slide é identificada como região de conteúdo e recebe `aria-label="Slide X de 12: <fraseChave>"`; `fraseChave` é o heading semântico.
- O contador visível mostra `X / 12`. Uma única região `aria-live="polite" aria-atomic="true"` anuncia `Slide X de 12`; o contador visível pode receber `aria-hidden="true"` para evitar anúncio duplicado.
- A barra superior usa `role="progressbar"`, `aria-valuemin={1}`, `aria-valuemax={12}`, `aria-valuenow={indice + 1}` e label com o slide atual.
- `‹` e `›` têm nomes acessíveis (`Slide anterior` e `Próximo slide`), foco visível e estados desabilitados nas extremidades.
- Diagramas e timeline usam listas ordenadas; a ordem não depende somente de cor, posição ou de uma seta.
- Slides 3 e 9 usam os `alt` da SPEC. O slide 6 usa `src/assets/mel-full.png` com alt `MEL, assistente da UNIQ.`.
- O diálogo do índice usa `role="dialog"`, `aria-modal="true"`, título `Índice dos slides`, foco inicial no item atual, foco preso enquanto aberto, `Esc` para fechar e restauração do foco ao fechar.
- Contraste, foco visível e navegação por teclado seguem `DESIGN.md`. Não há animação, som ou movimento autônomo que atrapalhe a leitura.

## 10. Validação da implementação

- `npm run build` OK.
- Deploy na Vercel com `state: READY`.
- Fundador valida a apresentação pelo celular.
- Conferir 12 slides, 12 itens de índice, `X / 12`, navegação por botões/teclado/swipe e retorno ao slide 1 ao recarregar.
- Conferir que o slide 11 mostra Tabela e Fase Alfa lado a lado no notebook, empilhadas no celular, sem riscar preço e com a nota literal.

> Este é um documento de wireframe. Nenhum arquivo `.ts`/`.tsx` deve ser alterado para produzi-lo; o design real e a implementação dependem da aprovação deste WIRE.
