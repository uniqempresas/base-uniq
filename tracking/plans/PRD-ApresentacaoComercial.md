# PRD — Apresentação Comercial UNIQ

> **Fase:** 1 · Fundação Silenciosa · **Módulo:** Aquisição (material de venda)
> **Data:** 24/09/2026 · **Status:** 🔶 Em aprovação
> **Substitui:** o deck de 13 slides em `src/app/components/apresentacao/` (reprovado pelo fundador)

---

## 0. Resumo executivo — leia isto primeiro

Este PRD descreve a **apresentação comercial da UNIQ Empresas**: o material que o fundador usa para explicar o que a UNIQ é, ao vivo, 1 a 1, para pessoas que já o conhecem — e que depois fica na mão do co-fundador.

**Três fatos que definem o escopo:**

1. **A rota já existe e já é pública.** `/apresentacao` está em `routes.tsx` **fora do `AppLayout`** (sem login). Portanto **não é preciso criar rota nova nem resolver autenticação.**
2. **A casca de interação já existe e funciona:** um slide por vez em tela cheia, navegação por botões, **setas do teclado ←/→**, **swipe** em touch, contador `X / N` (aria-live) e barra de progresso. **Reaproveitar; trocar o conteúdo e o visual.**
3. **Não são dois produtos.** Como a rota já é pública, **o fundador conduz da mesma página que ele envia para o co-fundador depois**. São dois **momentos de uso**, não duas telas.

**O que muda:** o texto (reprovado por soar "de prateleira"), o visual, e o número de slides (**13 → 12**).

---

## 1. Porquê (WHY)

### 1.1 Contexto
A UNIQ está na Fase 1 — Fundação Silenciosa. O próximo passo do negócio é **ir atrás dos co-fundadores** (Out/2026, 4 vagas). O fundador vai conversar com **pessoas que já o conhecem** — em boa parte, clientes da própria gráfica dele.

### 1.2 O problema que este material resolve
Essas pessoas **sabem que ele tem uma gráfica**, mas **não sabem no que ele trabalha agora**. Algumas já formaram uma leitura errada:

> *"É só um sistema."*
> *"É só um robô de WhatsApp."*

E **quase todas nunca contrataram uma consultoria** na vida — não existe repertório para entender o que "consultoria" significa.

Sem um material que nivele o entendimento, o fundador gasta a conversa inteira explicando o básico e chega no fim sem ter feito o convite.

### 1.3 Por que a versão anterior falhou (e isso é requisito, não história)
O deck anterior foi construído, analisado duas vezes e **reprovado pelo fundador** com uma frase precisa:

> *"Não soou verdadeiro. Soou como uma solução de prateleira — e não algo que a gente está construindo junto com os co-fundadores."*

Os erros identificados **viram restrições deste PRD** (ver §5): frase de efeito, jargão de consultor, excesso de texto na tela e — o mais grave — **prometer entregas que não existem** (site, loja virtual, marketplace entre empresas do grupo, trilhas).

### 1.4 Objetivo de negócio
Fazer o co-fundador **entender** três coisas ao fim da conversa:
1. A UNIQ é uma **consultoria**, não um software.
2. Ela entrega **resultado no caixa** (faturamento e margem) — e transformação vem com o tempo.
3. Existe uma **condição de fundador** com **4 vagas** — e ele é candidato a uma.

### 1.5 O que NÃO é objetivo
- Não é vender sozinho (o material é **apoio**, não peça autônoma).
- Não é ser enviado por e-mail/WhatsApp como apresentação fria.
- Não é impressionar com design.
- **Não é converter o prospect sozinho no celular.** A leitura posterior serve para **confirmar e registrar**, não para convencer.

---

## 2. O quê (WHAT)

### 2.1 Os dois momentos de uso — a mesma página

| Momento | Quem usa | O que precisa funcionar |
|---|---|---|
| **(A) Ao vivo** | O fundador, conduzindo a conversa | Ele **fala**; o slide é apoio visual. Precisa **pular e voltar** sem se perder. Uma ideia por tela |
| **(B) Depois** | O co-fundador, sozinho no celular | Abre pelo link, **sem login**, e entende a oferta e o próximo passo |

> **Consequência de projeto:** a mesma página precisa servir aos dois. Isso significa: **legível de relance** (para A) **e** legível **no celular** (para B). Nunca sacrificar um pelo outro.

### 2.2 Decisões já tomadas que restringem o produto

| # | Decisão | Origem |
|---|---|---|
| 1 | **12 slides** (o deck tinha 13) | Roteiro consolidado 24/09 |
| 2 | **Máximo 3 rótulos por slide**, de **2 a 4 palavras** | Fundador: menos palavras por slide |
| 3 | **Frase-chave no topo**, a única frase completa permitida | Roteiro + Briefing de design |
| 4 | **A fala do fundador nunca vai para a tela** | Briefing §2 |
| 5 | **16:9 no notebook + adaptável ao celular** | Fundador, 24/09 |
| 6 | **Marca:** `DESIGN.md` é a fonte oficial (paleta, Poppins, raio 8px, grid 8px) | Projeto |
| 7 | **Imagery:** direção já documentada no `DESIGN.md` | Aprovada em 24/09 |
| 8 | **Avatar da MEL:** `src/assets/mel-full.png` (é o que o produto usa) | Verificado no código |
| 9 | **"MEL" na tela, "Melissa" só na fala** | Fundador, 24/09 |
| 10 | **Preço:** R$ 500 setup (sinal de compromisso) + R$ 197/mês · tabela R$ 1.500 + R$ 297/mês | Docs atualizados 24/09 |
| 11 | **Proibido riscar preço** / "de X por Y" | Decisão fechada do fundador |
| 12 | **"52 parceiros" não aparece na tela** (ambição falada) | Recomendação aprovada 24/09 |

### 2.3 Insumos prontos (este PRD não os repete — ele os referencia)

| Documento | O que tem | Uso na construção |
|---|---|---|
| `tracking/apresentacao/ROTEIRO_APRESENTACAO.md` | **Texto dos 12 slides**: o que está na tela, o que o fundador fala, e o "não fazer" de cada um | **Fonte do conteúdo** |
| `tracking/apresentacao/BRIEFING_DESIGN_APRESENTACAO.md` | **Briefing de design** — regras visuais, anti-padrões, direção de imagem por slide | **Entrada do design** (OpenDesign) |
| `DESIGN.md` | Paleta, tipografia, layout, **Imagery** | Identidade oficial |
| `tracking/apresentacao/referencia/` | Deck anterior em PNG + `logo-uniq.png` | **Anti-referência** (o que não repetir) |

---

## 3. Público e stakeholders

| Papel | Quem | O que espera |
|---|---|---|
| **Usuário primário** | O fundador | Conseguir conduzir a conversa sem se perder e sem ler o slide |
| **Leitor secundário** | O co-fundador (prospect) | Entender, no celular, o que a UNIQ é e o que ele recebe |
| **Validador** | O fundador | Abre pelo celular e aprova (ciclo de validação mobile do projeto) |
| **Consumidor do insumo** | Agente de design (OpenDesign) | Um briefing que ele consiga executar sem conhecer a UNIQ |

---

## 4. Requisitos funcionais

### 4.1 Conteúdo — os 12 slides

| # | Slide | Tipo | Frase-chave na tela |
|---|---|---|---|
| 1 | Abertura | Textual | `Estamos construindo a UNIQ Empresas.` |
| 2 | O que é a UNIQ | Textual | `Temos tecnologia. Não somos uma empresa de tecnologia.` |
| 3 | Por que consultoria | **Visual** | `É como ir ao médico.` |
| 4 | Os três objetivos | Diagrama | `Três objetivos. Nessa ordem.` |
| 5 | Objetivo 1 — Faturamento | Textual | `Sem fôlego, nada muda.` |
| 6 | Objetivo 1 — a MEL na ponta | Visual (avatar MEL) | `Seu cliente nunca fica no vácuo.` |
| 7 | Objetivo 1 — a Base UNIQ dá a visão | **Diagrama** | `O número mostra onde está o problema.` |
| 8 | Objetivo 2 — Margem | Textual | `Lucro é o que sobra. Você precisa saber quanto sobra.` |
| 9 | Objetivo 3 — Transformação | **Visual** | `Ele é mais jogador do jogo do que pensador do jogo.` |
| 10 | Dentro da plataforma | Diagrama | `A MEL atende seus clientes. E conversa com você.` |
| 11 | A oferta | Números | `R$ 500 reserva a sua vaga.` |
| 12 | O caminho e o convite | Linha do tempo | `O nosso lucro hoje é o seu resultado.` |

> **O conteúdo exato de cada slide — frase, rótulos, fala de apoio e restrições — está em `tracking/apresentacao/ROTEIRO_APRESENTACAO.md`.** Não duplicar aqui para não criar duas verdades.

**Requisito de modelo de conteúdo:** a estrutura de dados precisa suportar **frase-chave**, **até 3 rótulos** e um **marcador de tipo** (textual / visual / diagrama). O modelo atual (`slides-data.ts`, com `titulo`/`subtitulo`/parágrafos longos) **não serve** e será refeito. A forma exata fica para a **SPEC**.

### 4.2 Navegação e interação

| Requisito | Detalhe | Prioridade |
|---|---|---|
| Um slide por vez, tela cheia | Como hoje | Must |
| **Navegação livre** | O fundador pula e volta durante a conversa — **não é linear obrigatória** | Must |
| Botões anterior/próximo | Visíveis, discretos | Must |
| **Teclado ← / →** | Como hoje | Must |
| **Swipe horizontal** (touch) | Como hoje | Must |
| Contador `X / 12` | Com `aria-live` | Must |
| Barra de progresso no topo | Como hoje | Should |
| **Ir direto a um slide** | Índice/atalho — o fundador precisa pular para a oferta sem passar por 10 telas | Should |
| Voltar ao slide 1 ao recarregar | Sem persistir posição | Should |

### 4.3 Responsividade

| Formato | Requisito |
|---|---|
| **16:9 (notebook)** | Formato principal de apresentação |
| **Celular (vertical)** | O co-fundador vai abrir por lá. **Empilhar, nunca cortar.** |
| Tablet | Não quebrar |

**Regra:** nenhum conteúdo pode **desaparecer** no mobile — ele **reorganiza**.

### 4.4 Estados

**Não se aplica a regra padrão de loading/empty/error.** O conteúdo é **estático** (arquivo de dados, sem chamada de API e sem banco).

- ❌ Sem loading, empty, error, skeleton.
- ✅ Único estado de exceção: **falha de carregamento da página** — o comportamento padrão do app já cobre.
- 📌 **Registrar a justificativa**: a regra do projeto ("toda tela/lista precisa de loading, empty, error") existe para telas com dados. Aqui não há dado. **O CODER não deve inventar estados.**

### 4.5 Acessibilidade
- Navegação completa por teclado (← / →) e foco visível.
- `aria-live` no contador de slides.
- Contraste conforme `DESIGN.md`.
- Imagens com `alt` descritivo.
- Nada de animação que atrapalhe a leitura em voz alta.

---

## 5. Requisitos de conteúdo — restrições duras

Estas são as causas da reprovação anterior. **Se qualquer uma aparecer, o deck está errado.**

### 5.1 É proibido prometer o que não existe
Nada deste deck pode apresentar como **entrega**:

| Proibido como entrega | Status real |
|---|---|
| Site / loja virtual | Não existe — **visão** |
| Integração com Mercado Livre / "loja shopping" | Não existe — **visão** |
| Marketplace / desconto cruzado entre empresas do grupo | Não existe — **visão** (só o desconto da HQ Gráfica é real) |
| Trilhas / treinamentos | Não existe — o papel é coberto pelo **Módulo MEL** |
| Campanhas de marketing / tráfego pago | Não existe — **visão** |
| "Análise profunda de mercado" como serviço | Acima da Fase 1 |

### 5.2 É proibido
- **Números de multiplicador** ("de X para 3X") — nunca dizer.
- **Banco de imagens genérico** (aperto de mão, reunião, pessoas sorrindo).
- **Jargão**: funil, pipeline, posicionamento, margem real, KPI, ROI.
- **Frase de efeito** / frase de LinkedIn.
- **Excesso de texto na tela.**
- **Riscar preço** ou "de R$ 1.500 por R$ 500".
- **Urgência artificial** (contagem regressiva, "últimas vagas!").
- **"52 parceiros" na tela.**
- **Azul corporativo** — a identidade UNIQ é esverdeada de propósito.
- **Chamar R$ 500 de desconto** — é **sinal de compromisso**.

---

## 6. Escopo

### ✅ Dentro
- Substituir o conteúdo de `src/app/components/apresentacao/slides-data.ts` pelos **12 slides** novos.
- Adequar `ApresentacaoPage.tsx` ao visual novo (reaproveitando a casca de interação).
- Manter a rota `/apresentacao` **pública** (fora do `AppLayout`).
- Responsividade 16:9 + celular.
- Paleta, tipografia e imagery conforme `DESIGN.md`.
- Build + deploy na Vercel (validação mobile pelo fundador).

### ❌ Fora
- **Captura de lead / formulário / CTA para WhatsApp** nesta entrega (é funil — Semana 4, respeitando a regra: *o funil não entra no ar antes da cadeia de demonstração funcionar*).
- **Login, autenticação ou link privado/tokenizado.**
- Integração com Supabase (conteúdo estático).
- Analytics de visualização.
- Versão em PDF / exportação.
- Vídeo, som ou animação complexa.
- **Apagar o deck antigo** — ele fica no projeto até a nova versão ser aprovada.

---

## 7. Dependências e insumos

| Dependência | Status |
|---|---|
| Roteiro dos 12 slides | ✅ Pronto (`tracking/apresentacao/ROTEIRO_APRESENTACAO.md`) |
| Briefing de design | ✅ Pronto (`tracking/apresentacao/BRIEFING_DESIGN_APRESENTACAO.md`) |
| Identidade visual (`DESIGN.md`) | ✅ Inclui **Imagery** (documentada em 24/09) |
| Avatar da MEL | ✅ `src/assets/mel-full.png` |
| Logo UNIQ | ✅ `tracking/apresentacao/referencia/logo-uniq.png` |
| Direção de imagem slides 3 e 9 | ✅ Aprovada |
| **Design das 12 telas** | 🔴 **Pendente — OpenDesign** (regra do projeto: design real no OpenDesign; no repo fica wireframe) |
| **SPEC + WIRE** | 🔴 Pendente — obrigatórios antes do código (SDD) |

---

## 8. Critérios de aceite

### 8.1 Conteúdo
- [ ] Exatamente **12 slides**, na ordem definida.
- [ ] Cada slide tem **no máximo 3 rótulos**, de **2 a 4 palavras**.
- [ ] Nenhuma **fala do fundador** aparece na tela.
- [ ] Nenhum item da lista **proibida** (§5) aparece.
- [ ] Slide 11 mostra os **dois preços**, sem riscar nenhum.
- [ ] "52 parceiros" **não** aparece.
- [ ] Nenhum número de resultado inventado.

### 8.2 Interação
- [ ] Navegação avança e volta sem travar.
- [ ] Teclado ← / → funciona.
- [ ] Swipe funciona em touch.
- [ ] Contador `X / 12` visível, com `aria-live`.
- [ ] É possível **ir direto** a um slide (índice ou atalho).
- [ ] Recarregar volta ao slide 1.

### 8.3 Visual e responsividade
- [ ] Paleta, Poppins, raio 8px e grid 8px conforme `DESIGN.md`.
- [ ] 16:9 sem cortes.
- [ ] **Celular: nada é cortado** — o conteúdo reorganiza.
- [ ] Imagery segue a direção aprovada (nada de banco de imagens genérico).
- [ ] Nenhum elemento decorativo sem função.

### 8.4 Técnico e processo
- [ ] `/apresentacao` continua **acessível sem login** (fora do `AppLayout`).
- [ ] Build e deploy na **Vercel** com `state: READY`.
- [ ] O **fundador valida pelo celular** (exigência do projeto).
- [ ] Deck antigo **preservado** até a aprovação.
- [ ] `tracking/TRACKING.md` atualizado.

---

## 9. Riscos e mitigações

### Risco 1 — ⚠️ **Exposição pública da condição de fundador**
**Descrição:** a página é **pública** (qualquer pessoa com o link). Se o slide 11 mostra "R$ 500 setup · 4 vagas", **um lead não qualificado passa a ver a menor condição comercial da UNIQ.** Isso pode enfraquecer a âncora de R$ 1.500 e a exclusividade da condição.
**Impacto:** Médio-alto · **Probabilidade:** Média.
**Opções:**
- **(i)** Manter público, com uma linha explícita: *"condição válida para as 4 vagas da Fase Alfa"* — a escassez é real e honesta.
- **(ii)** Não colocar preço na tela; o fundador fala os números na conversa e eles vão no termo.
- **(iii)** Link privado/tokenizado — **fora do escopo desta entrega** (custo alto).
**Recomendação:** **(i)**. É o que já existe hoje, mantém a âncora visível e a escassez honesta. **Precisa de decisão do fundador.**

### Risco 2 — O slide competir com a fala
**Descrição:** se houver texto demais, o co-fundador **lê em vez de ouvir**.
**Mitigação:** limite de 3 rótulos de 2–4 palavras, já no §4.1. Não negociável.

### Risco 3 — Voltar a soar "de prateleira"
**Descrição:** é exatamente o que reprovou a versão anterior. Um designer sem contexto pode repetir os clichês.
**Mitigação:** briefing auto-suficiente + seção de anti-padrões + pasta de anti-referência. **Revisão do fundador antes da implementação.**

### Risco 4 — Prometer o que não existe (regressão)
**Descrição:** o texto original do fundador continha 5 promessas sem lastro. Ao reescrever, elas podem voltar.
**Mitigação:** §5 é checklist obrigatório; critério de aceite §8.1 verifica item por item.

### Risco 5 — A promessa dos "52 parceiros" na cabeça do co-fundador
**Descrição:** mesmo sem estar na tela, se falado, vira expectativa.
**Mitigação:** falar como ambição, nunca como meta. O gargalo é **entrega**, não venda.

---

## 10. Métricas de sucesso

| Métrica | Como medir |
|---|---|
| **O fundador conduz sem se perder** | Ele faz a conversa inteira sem voltar ao roteiro no papel |
| **O fundador revisa pelo celular** | Ele aprova abrindo o link no celular (ciclo de validação do projeto) |
| **Zero perguntas de preço depois** | O co-fundador não volta perguntando "quanto é mesmo?" |
| **Zero promessa vazada** | Nenhum item do §5 aparece na versão final |
| **Zero pedido de "explica de novo"** | O co-fundador entende consultoria ≠ software ao fim |

---

## 11. Decisões pendentes (bloqueiam a construção)

| # | Decisão | Recomendação |
|---|---|---|
| 1 | **Exposição pública do preço** (Risco 1) — opção (i), (ii) ou (iii)? | **(i)** — manter público com a linha de escassez explícita |
| 2 | **Índice de navegação**: atalho visível para pular direto ao slide da oferta? | **Sim** — o fundador precisa pular sem passar por 10 telas |

---

## 12. Referências

- `tracking/apresentacao/ROTEIRO_APRESENTACAO.md` — texto consolidado dos 12 slides
- `tracking/apresentacao/ROTEIRO_APRESENTACAO_FUNDADOR.md` — ditado bruto + 22 pontos levantados
- `tracking/apresentacao/BRIEFING_DESIGN_APRESENTACAO.md` — briefing de design (camada 2)
- `tracking/apresentacao/ANALISE_TEXTO_APRESENTACAO.md` — análise que reprovou o deck anterior
- `DESIGN.md` — identidade oficial (paleta, tipografia, layout, imagery)
- `tracking/apresentacao/referencia/` — anti-referência
- `src/app/components/apresentacao/` — código atual (a substituir)
- `src/app/routes.tsx` — rota `/apresentacao` (pública, fora do `AppLayout`)
- `AGENTS.md` — metodologia SDD obrigatória

---

**Próximas fases (SDD):** PRD ✅ → **SPEC** (tipos, arquivos, componentes, hooks) → **WIRE** (por tela) → **Implementação pelo CODER**.
**Em paralelo:** **design no OpenDesign**, a partir do `tracking/apresentacao/BRIEFING_DESIGN_APRESENTACAO.md`.
