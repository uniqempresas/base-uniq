---
date: 2026-09-25T20:00:00-03:00
researcher: orchestrator
branch: master
repository: uniq-empresas
topic: "Apresentação Comercial UNIQ Empresas — rota pública /apresentacao"
tags: [apresentacao, comercial, deck, co-fundadores, uniq-empresas, react, frontend]
status: draft
inputs:
  - tracking/apresentacao/TEXTO_DITADO_FUNDADOR.md
  - tracking/apresentacao/referencia/ (slide-01..13.png, melissa-deck.png, logo-uniq.png)
  - doc/UNIQ Empresas — Consultoria para PMEs.pptx
  - DESIGN.md
  - tracking/CONTEXTO_PROJETO.md
---

# PRD — Apresentação Comercial UNIQ Empresas

**Projeto:** UNIQ Empresas
**Tipo:** Frontend (UI, rota pública) — sem backend
**Data:** 25/09/2026
**Responsável:** Fundador (decisões) + Orchestrator (documento)
**Rota:** `/apresentacao`

---

## 1. Resumo executivo

### 1.1 Objetivo de negócio

Reconstruir a apresentação comercial da UNIQ Empresas (rota pública `/apresentacao`) para que ela cumpra **um único objetivo de conversão**:

> **Levar o cliente a conversar.** Quando o funil da MEL estiver no ar (Semana 4), a conversa é com ela — ela conduz o SPIN, levanta as dores e prepara o terreno; o fechamento continua humano. Por enquanto (sem funil), o fechamento do deck é o convite à conversa e o retorno humano. Em ambos os casos: **mesmo que o cliente queira pensar depois, a conversa é o ponto de partida.**

### 1.2 O que deu errado antes (o problema a não repetir)

- Existia uma **v1** (slide-01..13.png) com identidade forte: grafite + menta, a Melissa presente, ritmo claro/escuro, hierarquia e ícones. **A v1 é a base visual e estrutural — não é anti-referência.**
- O problema da v1 era **a escrita** (clichês, jargão, promessas), não o design.
- Uma correção anterior focou só na cópia e **jogou fora o visual**, deixando o deck no ar como **texto puro, sem nenhuma imagem** ("vazio"). O deck atual (`slides-data.ts`) é a v1 reduzida a texto.
- **Regra deste PRD:** preservar a identidade visual/estrutural da v1 e refinar **a escrita e a ordem da narrativa**, sem empobrecer a tela.

### 1.3 Escopo

- ✅ Reconstrução completa da página `/apresentacao` (conteúdo, estrutura e navegação), **sem reaproveitar o que está no ar** (o fundador reprovou a versão atual).
- ✅ 14 slides, com possibilidade de crescer se a necessidade pedir.
- ✅ Rota **pública**, compartilhável por link (o cliente acessa depois), sugerida `noindex`.
- ✅ Estados de tela e acessibilidade (teclado, swipe, progresso, ARIA).
- ❌ Backend/API — os CTAs não chamam serviços.
- ❌ Não construir o chat da MEL aqui (é o funil da Semana 4; ver §11).

### 1.4 Stakeholders

- **Fundador/apresentador** — apresenta ao vivo (call ou presencial); o deck é apoio de fala.
- **Lead/co-fundador** — dono de microempresa do Alto Tietê; acessa o link depois.

---

## 2. Princípios e regras invioláveis

1. **Não prometer o que não existe.** Site, loja virtual, marketplace e tráfego pago entram **apenas como visão** (§7, slide 13). Nunca como entrega contratual.
2. **"MEL" e "Melissa" podem aparecer na tela.** Os dois nomes convivem de propósito, para o cliente acostumar.
3. **Vender 2, prometer 1.** Faturamento e margem são vendidos agora; a transformação do empreendedor é o que sustenta os outros dois.
4. **Pitch oficial:** *"A UNIQ faz entrar mais dinheiro e mostra para onde o seu está saindo. Isso é margem."*
5. **Wireframe no repositório, design real no OpenDesign.** No código, estrutura e função; não polir visual aqui.
6. **Tokens de `DESIGN.md` são a fonte oficial** (§9 tem uma pendência sobre o verde escuro da v1).
7. **Sem WIRE aprovado, não se escreve código de tela.**
8. **Tom:** direto, local, sem clichê de "empresário de sucesso" e sem jargão de tecnologia (ver `DESIGN.md` → Imagery → Avoid).

---

## 3. Decisões do fundador (consolidadas)

| # | Decisão | Resolução |
|---|---|---|
| D1 | Uso do deck | **Sempre apresentado ao vivo pelo fundador** (call ou presencial) → deck é apoio de fala |
| D2 | Base visual | **Seguir a v1** (identidade, hierarquia, imagens) e **manter o ritmo claro/escuro** |
| D3 | Reaproveitamento | **Não reaproveitar nada do que está no ar** — página reconstruída do zero |
| D4 | Tamanho | **14 slides**, podendo crescer conforme a necessidade |
| D5 | Nomes na tela | **MEL e Melissa** convivem |
| D6 | Pilar 1 | **Aumento de Faturamento** — trazer dinheiro para a empresa, dando fôlego ao empreendedor |
| D7 | Pilar 2 | **Aumento de Margem** — para não trabalhar muito e ganhar pouco |
| D8 | Pilar 3 | **Transformação do Empreendedor em Empresário** — de jogador do jogo a quem sabe e controla o jogo |
| D9 | Origem (slide 4) | **1ª pessoa**, o fundador narra ("vi os dois lados") |
| D10 | Preço na apresentação | Co-fundador **R$ 500 setup + R$ 197/mês** × valor cheio **R$ 1.500 + R$ 297/mês**, **no mesmo tamanho**, para a oportunidade ficar nítida |
| D11 | Cobrança | **Após a entrega do MVP**; dias **5 / 15 / 25**; o slide diz **"R$ 500 na entrega do MVP"** |
| D12 | Fidelidade | **Não entra no slide** — o fundador decide na hora se usa o argumento |
| D13 | Fases | **Alpha (out/2026) · Beta (jan/2027) · Prod (abr/2027)** — 12 co-fundadores no total |
| D14 | Fechamento | **Chamada para conversar** — a MEL conduz o SPIN quando o funil estiver no ar (Semana 4); por ora, o próximo passo é o retorno humano. É a conversão principal do deck |
| D15 | Slide 13 | **Visões de futuro** (52 parceiros, integrações e desenvolvimentos) |
| D16 | Trilhas | **Visão**, dentro da Transformação do Empreendedor (não é entrega do MVP) |
| D17 | Imagens | **Ilustração vetorial sóbria**; espaços reservados para médico e funil; **se o agente não gerar, entrega o prompt exato** para o fundador rodar em IA geradora |
| D18 | Logo | Tentar **PNG transparente**; se não der, reservar espaço |
| D19 | Claims | **Remover "uma venda a mais já paga"**; comunicação de **MVP em até 2 meses** |
| D20 | Acesso | **Rota pública** (link compartilhável), **`noindex`** (fora de buscadores) |
| D21 | Capa (slide 1) | **Headline:** "Sua empresa não precisa de mais esforço seu." · **Subtítulo:** "No dia a dia, tudo depende de você — e não sobra tempo para olhar o todo. Sua empresa precisa de alguém que cuide dela e aponte o caminho." A capa abre a conversa (o lead já conhece o fundador) e não precisa "prender atenção"; os 3 pilares ficam no slide 5 |
| D22 | Token do deck (P2) | **Verde escuro da v1 nos títulos das telas claras** (exceção deliberada ao `DESIGN.md`, aprovada pelo fundador para o deck) — demais tokens seguem o `DESIGN.md` |

### 3.1 Decisão tomada pelo agente (delegada pelo fundador)

| # | Tema | Resolução | Razão |
|---|---|---|---|
| A1 | "90 dias" | ✅ **Confirmado pelo fundador (25/09/2026): fora.** Não entra "retorno garantido em 90 dias" — manter apenas "MVP entregue em até 2 meses" | Garantia de resultado é promessa que a Fase 1 (sem cases) não pode sustentar |

---

## 4. Referências (fontes da verdade)

| O quê | Onde |
|---|---|
| Conteúdo (base de escrita) | `tracking/apresentacao/TEXTO_DITADO_FUNDADOR.md` (6 partes) |
| Baseline visual/estrutural | `tracking/apresentacao/referencia/slide-01..13.png` |
| Assets | `melissa-deck.png` · `logo-uniq.png` · `src/assets/mel-full.png` (produção) |
| Fonte da v1 | `doc/UNIQ Empresas — Consultoria para PMEs.pptx` |
| Identidade oficial | `DESIGN.md` |
| Negócio | `tracking/CONTEXTO_PROJETO.md` |

> Instrução: **ignorar** qualquer documento antigo sobre a apresentação que apareça no histórico do Git — foi descartado de propósito.

---

## 5. Estrutura do deck (espinha)

Narrativa: **dor → tese → 3 pilares → diferencial (MEL) → método → oferta → visão → chamada para a MEL.**

| # | Slide | Papel | Ritmo | Asset/imagem |
|---|---|---|---|---|
| 1 | Capa — "Sua empresa não precisa de mais esforço seu." | Tese de abertura | Claro/Escuro (split) | Melissa corpo inteiro + logo |
| 2 | O dia apagando incêndio (+ "jogador, não pensador") | Dor | Escuro | Ilustração documental (balcão + WhatsApp)¹ |
| 3 | O custo de continuar assim — Vender/Decidir/Crescer | Consequência | Claro | — (3 colunas) |
| 4 | Por que a UNIQ existe — "vi os dois lados" (1ª pessoa) | Crença | Claro | — (2 colunas) |
| 5 | A UNIQ — 3 objetivos, um só parceiro ("temos tecnologia, não somos empresa de tecnologia") | Tese | Claro | — (01/02/03) |
| 6 | Objetivo 1 — Aumento de Faturamento | Deep dive | Claro | **Funil da porta**¹ |
| 7 | Objetivo 2 — Aumento de Margem | Deep dive | Claro | Marca d'água "02" |
| 8 | Objetivo 3 — Transformação do Empreendedor em Empresário | Deep dive | Claro | Avatar MEL |
| 9 | MEL — sua consultora todos os dias (o diferencial) | Pico emocional | Escuro | Melissa corpo inteiro |
| 10 | Como trabalhamos — o método do médico | Como funciona | Claro + faixa escura | **Fórmula sob medida**¹ |
| 11 | Por que entrar agora — 12 vagas, sinal de compromisso | Convite | Claro | — (3 colunas) |
| 12 | Investimento — co-fundador × valor cheio | Preço | Escuro | — (2 blocos) |
| 13 | A visão e a troca — 52 parceiros, prova social | Visão | Escuro | — |
| 14 | **Chamada para conversar** (próximo passo) | Conversão | Escuro | Melissa + logo + arcos |

¹ Ilustração a produzir (o agente tenta gerar; senão, entrega o prompt — §8).

**Ritmo:** escuros = 2, 9, 12, 13, 14 (momentos emocionais/decisão). Claros = 3, 4, 5, 6, 7, 8, 10, 11. Slide 1 é split.

---

## 6. Detalhamento por slide

> **Mensagem-chave** = o que o fundador comunica falando; a **redação final** de cada tela é fechada no SPEC (com revisão de copy do orchestrator).

### Slide 1 — Capa
- **Mensagem:** a empresa não precisa de mais esforço do dono — precisa de alguém que cuide dela e aponte o caminho. (Abrir a conversa: o lead já conhece o fundador; a capa não precisa "prender atenção".)
- **Estrutura:** metade clara (logo, eyebrow `ALTO TIETÊ · CONSULTORIA`, headline, subtítulo) + metade escura com a Melissa.
- **Headline (D21):** "Sua empresa não precisa de mais esforço seu."
- **Subtítulo (D21):** "No dia a dia, tudo depende de você — e não sobra tempo para olhar o todo. Sua empresa precisa de alguém que cuide dela e aponte o caminho."
- **Os 3 pilares (faturamento · margem · transformação) ficam no slide 5** — a capa não os carrega.
- **Nada de:** jargão de tecnologia; promessa de resultado; a Melissa como "assunto" (ela é a prova visual no subhead).

### Slide 2 — O dia apagando incêndio
- **Mensagem:** o dono vive apagando incêndio, atende tudo, não sobra tempo nem caixa; **é mais jogador do jogo do que pensador do jogo**.
- **Estrutura:** fundo escuro; título em 2 linhas + 3 marcas (atendimento/operação/fornecedor/caixa; sem tempo para planejar; sem caixa para contratar conhecimento) + bloco "Não falta força de vontade. Não falta qualidade. Faltam ferramentas e conhecimento."
- **Adição:** incluir o conceito **"jogador do jogo, não pensador do jogo"** (ditado, Parte 2).

### Slide 3 — O custo de continuar assim
- **Mensagem:** trabalhar mais não resolve; falta estrutura.
- **Estrutura:** 3 colunas — **Vender** (sem margem real = lucrar menos vendendo mais) · **Decidir** (sem dados = aposta) · **Crescer** (preso à operação = funcionário do próprio negócio); fecho "O problema não é esforço. É a falta de estrutura para crescer."

### Slide 4 — Por que a UNIQ existe (1ª pessoa)
- **Mensagem:** o fundador viu os dois lados — grandes empresas (Santander, Ultragaz) e pequenos empreendedores na própria gráfica B2B — e a diferença é acesso a ferramentas e conhecimento.
- **Estrutura:** 2 colunas + fecho "Levar para o pequeno o que a grande empresa já usa para vencer."
- **Nota:** narrado pelo fundador; a tela apoia, não substitui a fala.

### Slide 5 — A UNIQ: 3 objetivos, um só parceiro
- **Mensagem:** temos tecnologia, **mas não somos uma empresa de tecnologia** — ela é meio para 3 objetivos.
- **Estrutura:** 01/02/03 com títulos = pilares (D6/D7/D8) e descrições de uma linha; fecho "Consultoria + tecnologia a serviço do objetivo — nunca o contrário."

### Slide 6 — Objetivo 1: Aumento de Faturamento
- **Mensagem:** primeiro é preciso trazer dinheiro para dentro — sem caixa o empreendedor não investe nem muda a vitrine. Aqui a consultoria traz conhecimento de mercado e a MEL assume o atendimento; a Base UNIQ dá indicadores.
- **Estrutura:** marca d'água "01"; itens de entrega **hoje**: conhecimento de mercado · MEL atendimento/follow-up/agendamento · **funil de vendas** (indicador).
- **Funil (concreto, do ditado):** quantos passaram na porta → quantos entraram → quantos compraram → quantos voltaram e compraram de novo. Usar a **ilustração do funil da porta**.
- **Adição:** "isso tira você de ser funcionário da sua própria empresa e te põe na gestão".
- **Não incluir:** "Loja Virtual" como entrega (vai para visão, slide 13).

### Slide 7 — Objetivo 2: Aumento de Margem
- **Mensagem:** não basta trazer dinheiro; é preciso diminuir custo e saber para onde vai cada real. Vender no preço errado obriga a trabalhar muito mais pelo mesmo faturamento.
- **Estrutura:** marca d'água "02"; UNIQ análise de mercado (preço/concorrência/posicionamento) · Base UNIQ visão da operação (custos/margens) · **parcerias entre empresas do grupo** (ex.: material gráfico mais barato; oferta entre parceiros = novo canal).
- **Adição:** o exemplo concreto da parceria com a gráfica do grupo (ditado, Parte 3).

### Slide 8 — Objetivo 3: Transformação do Empreendedor em Empresário
- **Mensagem:** é o que faz os outros dois durarem. Empreendedor é quem trabalha muito; empresário é quem sabe e **controla o jogo**. Não falta talento — falta aprender as regras do jogo.
- **Estrutura:** avatar MEL; itens — "empreender e gerir são coisas diferentes" · método no lugar de tentativa e erro · **MEL como copiloto** · **Trilhas como visão**.
- **Não incluir:** trilhas como entrega do MVP.

### Slide 9 — MEL: sua consultora todos os dias
- **Mensagem:** consultoria tradicional é uma reunião por mês e um relatório; aqui a MEL acompanha o negócio diariamente — atende, orienta, organiza o funil. "O conhecimento de uma consultoria, com a presença de um sócio."
- **Estrutura:** fundo escuro + Melissa corpo inteiro.
- **Nota:** é o pico emocional; preservar o peso da v1.

### Slide 10 — Como trabalhamos: o método do médico
- **Mensagem:** a consultoria é como ir ao médico — você apresenta as dores, nós juntamos conhecimento de mercado + ferramentas e montamos uma **solução sob medida**. Depois desenvolvemos o sistema e você passa a usar.
- **Estrutura:** 1 → 2 → 3 (Diagnóstico · Plano sob medida · Execução acompanhada) + faixa escura de callout.
- **Metáfora visual:** **fórmula/receita sob medida** (já aprovada em `DESIGN.md` → Imagery → Subjects).
- **Callout:** MVP entregue em **até 2 meses** (não usar "retorno garantido em 90 dias" — A1).

### Slide 11 — Por que entrar agora
- **Mensagem:** são **12 vagas** de co-fundador no total; o trabalho de parceria no início é o que torna a consultoria acessível. O preço de fundador é real e só existe para as 12 primeiras empresas.
- **Estrutura:** 3 colunas — **Preço de fundador** (R$ 500 + R$ 197) · **Atenção máxima** (dedicação quase individual) · **Co-construção** (participa da construção e colhe primeiro); linha do caminho **Alpha (out/26) → Beta (jan/27) → Prod (abr/27) → lançamento 07/2027**.
- **Cuidado de escrita:** sem "nunca mais vai existir" (escassez clichê). A escassez é real e basta.

### Slide 12 — Investimento
- **Mensagem:** o valor cheio é R$ 1.500 + R$ 297/mês; o co-fundador entra com R$ 500 + R$ 197/mês — mostrando os dois **no mesmo tamanho**, para ficar nítida a dimensão da oportunidade.
- **Estrutura:** fundo escuro; dois blocos lado a lado com **peso visual igual**; checks: **"R$ 500 cobrado na entrega do MVP"** · faturamento nos dias **5, 15 ou 25** · demais condições a critério do fundador na hora (D12: nada de fidelidade na tela).
- **Não incluir:** "pagamento na inicialização" (corrigido por D11).

### Slide 13 — A visão e a troca
- **Mensagem:** a visão é ter **52 parceiros**; o foco hoje não é lucro, é **prova social real** — o sucesso de cada empresa é a moeda que abre a próxima.
- **Estrutura:** visão (52 parceiros; integrações e desenvolvimentos futuros — site, loja, marketplace, tráfego como **visão**) + a troca (a UNIQ documenta o case; o co-fundador paga menos).
- **Regra:** tudo aqui é explicitamente **visão de futuro**.

### Slide 14 — Chamada para conversar (conversão)
- **Mensagem:** o próximo passo é conversar. A MEL conduzirá a conversa (SPIN) quando o funil estiver no ar (Semana 4); por ora, o fechamento é o convite à conversa e ao retorno humano. **Mesmo que o cliente queira pensar, a conversa é o ponto de partida.**
- **Estrutura:** fundo escuro + Melissa + logo + chamada grande. **Sem mecanismo funcional por enquanto** (sem QR/botão/link — P1 parkada).
- **É o slide mais importante do deck.**

---

## 7. Escopo fora / conteúdo classificado como visão

| Tema | Tratamento |
|---|---|
| Site / loja virtual / marketplace | **Visão** (slide 13) |
| Tráfego pago / campanhas | **Visão** (slide 13) |
| Trilhas de aprendizagem | **Visão** (slide 8) — fora do MVP |
| 52 parceiros | **Visão** (slide 13) — linha de base, não promessa |
| Chat/landing da MEL | **Fora deste PRD** — fluxo n8n já ligado no WhatsApp e quase pronto (falta prompt + gravação legível); plugar o CTA no slide 14 quando ativo (P1) |
| Módulo de gestão de entregas | **Não existe** — usar CRM + Agenda |

---

## 8. Assets e imagens

### 8.1 Existentes

| Asset | Uso | Observação |
|---|---|---|
| `melissa-deck.png` / `src/assets/mel-full.png` | Slides 1, 8 (avatar), 9, 14 | É a **mesma imagem** (confirmado pelo fundador); usar uma só; precisa de versão com **fundo limpo/transparente** para painéis escuros |
| `logo-uniq.png` | Slides 1 e 14 | Hoje tem **fundo branco sólido** → tentar gerar **PNG transparente** |

### 8.2 A produzir (ilustração vetorial sóbria)

> Se o agente não gerar, entregar **prompt exato** para o fundador rodar em IA geradora (D17). Reservar o espaço no WIRE em qualquer caso.

| # | Imagem | Slide | Direção (DESIGN.md → Imagery) |
|---|---|---|---|
| 1 | Cena de dor: balcão + WhatsApp | 2 | Cotidiano real do microempresário; enquadramento próximo, luz natural; sem clichê de banco de imagens |
| 2 | Funil da porta (passaram → entraram → compraram → voltaram) | 6 | Metáfora visual simples, traço limpo, menta + grafite |
| 3 | Fórmula/receita sob medida (médico) | 10 | Metáfora já aprovada no `DESIGN.md` |

**Evitar (obrigatório):** aperto de mão, reunião, pessoas sorrindo para a câmera, terno/carro/dinheiro, robô/chip/engrenagem/código, gráficos de crescimento/setas/cifrões.

---

## 9. Navegação e comportamento (requisitos)

> Reconstrução do zero (D3), mas a apresentação ao vivo (D1) exige navegação confortável.

| Requisito | Descrição |
|---|---|
| Um slide por tela | Tela cheia, mobile-first, sem scroll interno |
| Avançar/voltar | Botões dedicados |
| Teclado | ← / → (ignorar quando o foco estiver em campo editável) |
| Touch | Swipe horizontal (limiar que evite troca acidental) |
| Progresso | Barra fina no topo + contador "X / N" visível |
| Acessibilidade | `aria-label` por slide, `aria-live` no contador, foco visível, contraste AA |
| Responsividade | Desktop / tablet / mobile sem perder hierarquia |
| Link público | Rota acessível sem login; sugerido `noindex` |
| Título do documento | Definido enquanto a página está aberta |

### 9.1 Decisão de token (resolvida — P2)

- ✅ **Decisão do fundador (25/09/2026): manter o verde escuro da v1** nos títulos das telas claras — *"visualmente ficou melhor"*. É uma **exceção deliberada** ao `DESIGN.md` (que tem 6 tokens e não inclui esse verde), aprovada pelo dono do projeto **somente para o deck de apresentação**.
- **Token local do deck:** verde escuro da v1 (aparente `#3E5653`) para títulos sobre fundo claro; o restante segue os tokens do `DESIGN.md` (grafite `#1f2937`, menta `#86cb92`, cinza claro `#efefef`, branco `#ffffff`, cinza-esverdeado `#627271`). O hex exato deve ser confirmado a partir do PNG da v1 na implementação.

---

## 10. Pendências e decisões abertas

| # | Pendência | Impacto | Dono |
|---|---|---|---|
| ~~P1~~ | **CTA do slide 14 — PARKADA (decisão do fundador, 25/09/2026):** o fluxo n8n de conversa com a MEL **já está ligado no WhatsApp** e perto de ficar pronto (falta ajustar o prompt e a gravação legível das respostas). Quando estiver ativo, plugar o **"Falar com a MEL"** no slide 14. Por enquanto o slide fica **sem mecanismo** — fechamento por conversa/retorno humano | ✅ Não bloqueia | Fundador |
| ~~P2~~ | **Verde escuro da v1 × tokens do `DESIGN.md`** (§9.1) — ✅ **FECHADA (25/09/2026): manter o verde escuro da v1** nos títulos das telas claras, como exceção ao `DESIGN.md` para o deck | ✅ Não bloqueia | Fundador |
| ~~P3~~ | **Rota `noindex`** — ✅ **FECHADA (25/09/2026): `noindex`** (link compartilhável, fora de buscadores) | ✅ Não bloqueia | Fundador |
| P4 | QR/atalho impresso para o cliente acessar depois — **depende de P1 (parkada)** | Baixo | Fundador |
| P5 | **LGPD** quando o CTA da MEL entrar em produção (dados do lead) | Futuro | Fundador |

---

## 11. Dependências

| Dependência | Estado | Impacto |
|---|---|---|
| Funil "Falar com a MEL" (landing + chat + SPIN) | Planejado para a **Semana 4** do plano de 5 semanas | O slide 14 **não terá mecanismo de CTA** até lá (P1 parkada) — fechamento por conversa/retorno humano |
| `DESIGN.md` com lacunas (Voice & Tone, Imagery parcial) | Pendente | Direção de copy/imagem limitada |
| Assets transparentes (logo, Melissa) | A produzir | Slides 1, 9, 14 dependem disso |

---

## 12. Critérios de aceite

- [ ] A página tem **14 slides** com o conteúdo da espinha aprovada.
- [ ] **A identidade da v1 está preservada**: ritmo claro/escuro, hierarquia, uso da Melissa, ícones com função.
- [ ] Todos os 3 pilares usam os **nomes decididos** (D6/D7/D8).
- [ ] **Nenhuma promessa do que não existe** — site/loja/marketplace/tráfego/trilhas/52 parceiros apenas como **visão**.
- [ ] Slide 12 mostra **valor cheio e valor de co-fundador no mesmo tamanho**, com **"R$ 500 na entrega do MVP"** e dias **5/15/25**.
- [ ] **Não há** "pagamento na inicialização" nem "retorno garantido em 90 dias".
- [ ] O **slide 14 é uma chamada clara para conversar** (sem mecanismo funcional até o funil — P1 parkada).
- [ ] Navegação por **botões, teclado, swipe** e **progresso** funcionando; acessibilidade AA.
- [ ] **Nenhuma imagem genérica/estereotipada** (§8.2 "Evitar").
- [ ] Espaços de ilustração **reservados** (com prompt entregue, se não geradas).
- [ ] Rota **pública** e acessível por link, **`noindex`**.

---

## 13. Riscos

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Repetir o erro: empobrecer a tela só corrigindo texto | Média | Alto | Este PRD fixa a v1 como base visual; WIRE obrigatório com imagem/estrutura |
| CTA para a MEL sem o funil no ar (queimar lead) | Alta | Alto | P1: definir mecanismo provisório (WhatsApp/retorno humano) até a Semana 4 |
| Prometer entrega que não existe | Média | Alto | §7 classifica visão × entrega; checklist de aceite |
| Dependência de asset da Melissa com fundo impróprio | Média | Médio | Produzir versão transparente; reservar espaço |
| Divergência de token (verde escuro) | Média | Médio | ✅ P2 resolvida — manter o verde da v1 como exceção deliberada ao `DESIGN.md` |

---

## 14. Próximos passos (pipeline SDD)

1. **Aprovação deste PRD pelo fundador** (P1–P3 e A1 já resolvidas).
2. **SPEC** — tipos, estrutura de arquivos, componentes, dados dos slides, assets, validações, checklist.
3. **WIRE** — wireframe por slide (layout ASCII, hierarquia, estados, responsividade), seguindo o template da v1 e reservando os espaços de imagem. Inclui a **lista de prompts de imagem**.
4. **Implementação** — só depois do WIRE aprovado.

---

## 15. Checklist de documentos

- [ ] PRD aprovado pelo fundador
- [ ] SPEC criado (`tracking/specs/SPEC-ApresentacaoComercial.md`)
- [ ] WIRE criado e aprovado (`tracking/wireframe/WIRE-ApresentacaoComercial.md`)
- [ ] Prompts de imagem entregues
- [ ] Implementação + build + deploy validado na Vercel
