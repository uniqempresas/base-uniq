# Briefing de Design — Apresentação UNIQ Empresas

> **Camada 2** — o que cada slide deve comunicar.
> **Leia este documento do início ao fim antes de criar qualquer tela.** Ele foi escrito para um agente de design **sem nenhum contexto da UNIQ**. Se algo aqui não estiver claro, **pergunte** — não invente.
> **Versão:** 1.0 — 24/09/2026 · **Autoria:** CEO (agente).
> **Roteiro-fonte:** `ROTEIRO_APRESENTACAO.md`

---

## 1. O contexto que você não tem

### 1.1 O que é a UNIQ Empresas
Uma **consultoria** de transformação digital para **microempresas de Suzano e região do Alto Tietê** (até 3 funcionários, faturamento de R$ 5 a 10 mil/mês). O negócio é **Done-For-You**: o cliente não toca em tecnologia — a UNIQ instala e opera por ele.

Existem duas peças tecnológicas, e **nenhuma das duas é o produto**:
- **Base UNIQ** — a plataforma onde ficam os dados, a metodologia e os indicadores do cliente.
- **MEL** — a inteligência artificial. Ela tem **dois canais**: atende os **clientes finais** do empreendedor no WhatsApp, e conversa **com o próprio empreendedor** dentro da plataforma.

O produto é o **resultado** (mais faturamento, mais margem, dono menos preso na operação). A tecnologia é meio.

### 1.2 Quem assiste
Pessoas que **já conhecem o fundador** pessoalmente. Elas sabem que ele tem uma gráfica. **Não sabem no que ele trabalha agora** — e algumas já formaram uma ideia errada: *"é só um sistema"* ou *"é só um robô de WhatsApp"*.

Quase todas **nunca contrataram uma consultoria** na vida.

### 1.3 Como este material é usado — **crítico**
- É uma apresentação **conduzida ao vivo, 1 a 1**, pelo próprio fundador, **falando**.
- O slide é **apoio visual para ELE** — para não perder a linha do que ia dizer.
- **Depois**, o mesmo material fica na mão do co-fundador como registro.
- O fundador precisa **pular e voltar slides** livremente durante a conversa. A navegação **não é linear obrigatória**.

> **Consequência para o design:** o slide **não precisa vender sozinho**. Ele precisa ser **legível de relance** e **não competir com a fala**. Se houver dúvida entre beleza e legibilidade, escolha **legibilidade**.

### 1.4 O que este material NÃO é
- Não é apresentação para ser **enviada** por e-mail ou WhatsApp.
- Não é pitch de investidor.
- Não é uma página de vendas.

---

## 2. Regras invioláveis

1. **Máximo 3 rótulos por slide.** Se precisar de 4, são dois slides.
2. **Rótulo = 2 a 4 palavras.** Sem frase inteira, sem verbo conjugado.
3. **A frase-chave fica no topo.** É a única frase completa permitida na tela.
4. **A fala do fundador NUNCA vai para a tela.** Tudo marcado como *"A fala"* neste documento é contexto para você entender a intenção — não é conteúdo.
5. **Nada que não exista hoje pode aparecer como entregue.** Este deck já foi reescrito uma vez justamente por prometer demais. Se estiver na lista de **Anti-padrões** (seção 6), não use.
6. **Não invente números.** Nenhum percentual, nenhuma meta, nenhum dado de cliente.
7. **Um slide = uma ideia.**

---

## 3. Fontes oficiais — não invente o que já existe

### 3.1 Identidade visual
`DESIGN.md` (raiz do projeto) é a **fonte oficial**. Em conflito com este documento, **vale o `DESIGN.md`**.

| Token | Valor |
|---|---|
| Fundo | `#efefef` (cinza claro) |
| Texto e títulos | `#1f2937` (grafite escuro) |
| Destaque / ação | `#86cb92` (verde menta) |
| Superfície / cards | `#ffffff` |
| Texto secundário | `#627271` (cinza esverdeado) |
| Bordas | `#efefef`, 1px |
| Tipografia | **Poppins** 400 e 700 |
| Raio | **8px** |
| Grid | **8px** |

**Mood oficial:** *"Tecnologia capaz, conversa humana."* Sóbrio e profissional, **não frio**. Confiante, **não arrogante**. Local, **não genérico** — a paleta esverdeada existe de propósito para fugir do azul corporativo padrão.

**Filosofia:** *"Nada é decorativo sem função."*

### 3.2 ⚠️ Lacunas conhecidas (leia antes de criar)

**(a) A seção `Imagery` do `DESIGN.md` está VAZIA.** Não existe direção oficial de imagem. E **dois slides deste deck precisam de imagem** (slide 3 e slide 9). → Direção provisória na seção 4; **validar com o fundador**.

**(b) ✅ Avatar da MEL — RESOLVIDO (24/09/2026).** O arquivo oficial é **`src/assets/mel-full.png`** — verificado em uso no produto (`MelDashboardPage.tsx`, `MelConversaPage.tsx`). Existe também `src/assets/mel-avatar.png`, uma variante recortada. **Use `mel-full.png`. Não crie um personagem novo.**

**(c) A seção `Voice & Tone` do `DESIGN.md` está corrompida** (conteúdo duplicado). Não foi corrigida ainda. → Para o tom, use o **roteiro** como referência: é direto, de balcão, sem jargão e sem frase de efeito.

**(d) Existe uma pasta de anti-referência:** `referencia/` contém os **13 slides do deck anterior** renderizados em PNG (`slide-01.png` a `slide-13.png`), além de `melissa-deck.png` e `logo-uniq.png`.

> ⚠️ **Cuidado:** use essa pasta **apenas como anti-referência** — o que **não** repetir. O deck anterior foi reprovado pelo fundador por parecer "solução de prateleira". **Não copie layout, tom nem estrutura visual dele.** O `logo-uniq.png` é aproveitável.

### 3.3 Formato
**16:9 horizontal** como formato principal — é assim que o fundador apresenta. **Mas o mesmo material é liberado para o co-fundador ver no celular.** Portanto o layout precisa **responder**:

- 16:9 no notebook, **e** legível/empilhável no celular.
- Nunca cortar conteúdo no mobile — **reorganizar**, não esconder.
- Testar nos dois formatos antes de considerar pronto.

---

## 4. Os 12 slides

> Template de leitura: **Frase na tela** · **Rótulos na tela** · **A fala (NÃO vai na tela)** · **Direção visual** · **Não fazer**.

---

### Slide 1 — Abertura

- **Frase na tela:** `Estamos construindo a UNIQ Empresas.`
- **Subtítulo:** `Suzano · Alto Tietê`
- **Rótulo:** `Fase Alfa · Outubro 2026`
- **A fala (NÃO vai na tela):** "Isso não é uma empresa pronta. Está começando agora — e é exatamente por isso que faz sentido você entrar agora."
- **Direção visual:** capa sóbria. Tipografia grande, muito respiro. A ideia é **obra em construção**, não vitória.
- **Não fazer:** foguete, gráfico subindo, aperto de mão, foto de "sucesso". Nada que sugira empresa pronta.

---

### Slide 2 — O que é a UNIQ

- **Frase na tela:** `Temos tecnologia. Não somos uma empresa de tecnologia.`
- **Rótulos na tela:** nenhum.
- **A fala (NÃO vai na tela):** "Somos uma consultoria. O nosso core é a tecnologia — a Base UNIQ, onde ficam os seus dados e a nossa metodologia. Mas tecnologia é meio, não fim."
- **Direção visual:** **slide textual puro.** A frase é o slide. No máximo, um detalhe discreto de cor de destaque na segunda oração.
- **Não fazer:** ícones de engrenagem, código, chip, robô. **Reforçam exatamente o que a frase nega.**

---

### Slide 3 — Por que consultoria ⭐

- **Frase na tela:** `É como ir ao médico.`
- **Rótulos na tela:** `Você conta a dor` → `A gente monta a fórmula`
- **A fala (NÃO vai na tela):** "Você vai ao médico, conta as suas dores, e ele faz uma fórmula que vai exatamente naquela dor. Não é caixinha de remédio de prateleira — é remédio manipulado. É isso que a gente faz: você conta as suas dores, nós juntamos com o conhecimento de mercado e montamos a solução para o seu negócio."
- **Direção visual:** **este slide PEDE imagem.** A metáfora é visual. A imagem precisa comunicar **fórmula sob medida**, não atendimento médico genérico.
- **Não fazer:** jaleco, estetoscópio, hospital, cruz vermelha. E **jamais** um frasco de prateleira — contradiz a mensagem. Nada de banco de imagens com pessoas sorrindo para a câmera.

---

### Slide 4 — Os três objetivos

- **Frase na tela:** `Três objetivos. Nessa ordem.`
- **Rótulos na tela:** `1 Faturamento` · `2 Margem` · `3 Transformação`
- **A fala (NÃO vai na tela):** "São três objetivos. E eles têm uma ordem — por um motivo."
- **Direção visual:** diagrama simples, **numerado e sequencial**. Precisa ler como **escada / sequência**, não como lista de menu.
- **Não fazer:** apresentar os 3 como blocos iguais e paralelos. **A ORDEM é o argumento.** Se ler como menu, o slide perde o sentido.

---

### Slide 5 — Objetivo 1: Faturamento

- **Frase na tela:** `Sem fôlego, nada muda.`
- **Rótulos na tela:** `Começamos pelo caixa`
- **A fala (NÃO vai na tela):** "Por que primeiro? Porque falta de capital é a trava número um. Com o caixa apertado, o dono não muda a vitrine, não investe, não cresce. Primeiro entra dinheiro. Depois a gente organiza."
- **Direção visual:** textual, com respiro. Pode haver um elemento simbólico único de "fôlego / fôrma apertada".
- **Não fazer:** cifrão, notas de dinheiro, gráfico de crescimento, seta para cima. **Nada promete resultado garantido.**

---

### Slide 6 — Objetivo 1: a MEL na ponta

- **Frase na tela:** `Seu cliente nunca fica no vácuo.`
- **Rótulos na tela:** `Responde na hora` · `Faz o follow-up` · `Agenda`
- **A fala (NÃO vai na tela):** "Quem chama no WhatsApp é respondido na hora — mesmo quando você está atendendo no balcão. A MEL faz o follow-up, cuida do cliente, agenda. E isso te tira do balcão: você deixa de ser o funcionário da sua própria empresa."
- **Direção visual:** aqui a **MEL aparece pela primeira vez**. Use o **avatar oficial existente** (ver 3.2-b). Um recorte de conversa de WhatsApp como apoio é suficiente.
- **Não fazer:** robô genérico, andróide, olhos brilhantes. E não ilustrar o dono "de férias" — a mensagem é **liberar tempo**, não parar de trabalhar.

---

### Slide 7 — Objetivo 1: a Base UNIQ dá a visão

- **Frase na tela:** `O número mostra onde está o problema.`
- **Diagrama na tela:** `passaram → entraram → compraram → voltaram`
- **A fala (NÃO vai na tela):** "Quatro números. A maioria dos empreendedores não tem. E eles dizem onde está o problema: se muita gente entra e pouca compra, o problema não é o ponto nem a vitrine — é o atendimento ou o preço. Você não teria como perceber isso trabalhando no balcão o dia inteiro."
- **Direção visual:** **o slide mais visual-dados do deck.** Um **funil de 4 etapas** com as quatro palavras acima. O desenho do funil **é** o argumento.
- **Não fazer:** dashboard de mentira, número inventado, percentual, gráfico de barra ou de linha. **Não escrever nenhum número de resultado.**

---

### Slide 8 — Objetivo 2: Margem

- **Frase na tela:** `Lucro é o que sobra. Você precisa saber quanto sobra.`
- **Rótulos na tela:** `Quanto sobra por venda` · `Para onde vai cada real` · `Preço certo`
- **A fala (NÃO vai na tela):** "Saber quanto sobra em cada venda e para onde vai cada real. E o preço certo — porque não adianta vender mais se você está vendendo no preço errado: você trabalha o dobro para o mesmo resultado do concorrente."
- **Direção visual:** textual com apoio simples e sóbrio.
- **Não fazer:** gráfico de pizza, troféu, "lucro garantido". Nada de cifrão.

---

### Slide 9 — Objetivo 3: Transformação

- **Frase na tela:** `Ele é mais jogador do jogo do que pensador do jogo.`
- **Rótulos na tela:** `Empreendedor → Empresário`
- **A fala (NÃO vai na tela):** "O empreendedor trabalha muito e ganha pouco. O empresário administra. A diferença quase nunca é talento — é que ninguém ensinou a ele as regras do jogo. E isso é o que faz os outros dois objetivos durarem."
- **Direção visual:** **o slide mais emocional do deck.** **Este também PEDE imagem.** A imagem precisa comunicar **passagem de um estado para outro** (antes → depois), não decoração.
- **Não fazer — atenção:** o texto critica justamente o **estereótipo** do "empresário de terno, bem vestido, com dinheiro". Portanto **não use** foto de homem de terno, aperto de mão, escritório de luxo. O visual não pode repetir o clichê que a fala desmonta.

---

### Slide 10 — Dentro da plataforma

- **Frase na tela:** `A MEL atende seus clientes. E conversa com você.`
- **Rótulos na tela:** `Fora: seus clientes` · `Dentro: você`
- **A fala (NÃO vai na tela):** "São dois canais. A MEL atende os seus clientes no WhatsApp. E dentro da Base UNIQ **você** conversa com ela — ela conhece a sua empresa e te ajuda no dia a dia, na consultoria rápida. O que é grande, você resolve comigo."
- **Direção visual:** diagrama de **dois canais** bem separados. Deve ficar claro que são duas coisas distintas.
- **Não fazer:** sugerir que a MEL **substitui** o consultor humano. O humano é parte da entrega, e essa é a diferença.

---

### Slide 11 — A oferta

- **Frase na tela:** `R$ 500 reserva a sua vaga.`
- **Rótulos na tela:** `Alfa · 4 vagas` · `R$ 500 setup · R$ 197/mês` · `Tabela: R$ 1.500 + R$ 297/mês`
- **A fala (NÃO vai na tela):** "Isso não é barato — e não é para ser. Consultoria sob medida não é barata. É por isso que existem os co-fundadores: neste início, a parceria é o que torna acessível. Você entra com R$ 500, que é o **sinal que reserva a sua vaga** — não é desconto, é o que separa quem quer de quem vai usar. E a mensalidade só começa quando estiver rodando."
- **Direção visual:** **slide de números — precisa ser inequívoco.** Os **dois preços aparecem lado a lado** (o valor de tabela e a condição Alfa). A tabela é a âncora do valor.
- **Não fazer — regras duras:**
  - **Não** riscar o preço nem usar "de R$ 1.500 **por** R$ 500". Decisão fechada do fundador.
  - **Não** esconder o valor de tabela.
  - **Não** usar contagem regressiva, cronômetro, "últimas vagas!" ou qualquer urgência artificial.
  - **Não** chamar R$ 500 de "desconto" — é **sinal de compromisso**.

---

### Slide 12 — O caminho e o convite

- **Frase na tela:** `O nosso lucro hoje é o seu resultado.`
- **Rótulos na tela:** `Alfa 4 → Jan +4 → Abr +4` · `12 cases` · `Lançamento jul/2027`
- **A fala (NÃO vai na tela):** "O nosso foco hoje não é dinheiro. É prova social. Quando a sua empresa cresce, eu mostro o resultado para a próxima — sem nome, sem valores, sem a sua operação. Esse é o nosso lucro: o seu resultado."
- **Direção visual:** **linha do tempo simples**, horizontal, com os marcos em sequência.
- **Não fazer:**
  - **Não** colocar "52 parceiros" na tela. É ambição falada, não escrita (decisão do fundador).
  - Nada de troféu, medalha, "case de sucesso" com foto de cliente.
  - Nada de urgência artificial.

---

## 5. Anti-padrões — o que NÃO fazer no deck inteiro

Estes já foram os erros da versão anterior deste deck. **Não repita nenhum:**

| Não fazer | Por quê |
|---|---|
| Banco de imagens genérico (aperto de mão, reunião, pessoas sorrindo) | Foi o que fez o deck antigo parecer "solução de prateleira" |
| Excesso de texto na tela | O fundador está **falando**. Texto na tela compete com ele |
| Jargão: *funil, pipeline, posicionamento, margem real, KPI, ROI* | O público é dono de microempresa em Suzano. **Ninguém fala assim** |
| Frase de efeito / frase de LinkedIn | O fundador identificou isso como o problema nº 1 do material antigo |
| Prometer: site, loja virtual, integração com Mercado Livre, marketplace entre empresas, campanhas de tráfego | **Nada disso existe hoje.** Se aparecer, vira promessa que não se cumpre |
| Tom corporativo / voz de empresa | O material tem que soar como **conversa**, não como relatório |
| Azul corporativo | A identidade UNIQ é **esverdeada de propósito** |
| Elementos decorativos sem função | Contra a filosofia oficial do `DESIGN.md` |

---

## 6. Checklist antes de entregar

- [ ] Cada slide tem **no máximo 3 rótulos**
- [ ] Nenhum rótulo passa de **4 palavras**
- [ ] A fala do fundador **não** foi parar na tela
- [ ] Slides 3 e 9 (imagem) usam a **direção provisória** e foram marcados para validação
- [ ] Avatar da MEL é o **existente** (não um novo)
- [ ] Paleta, tipografia e raio seguem o `DESIGN.md`
- [ ] Slide 11 mostra os **dois preços** e não risca nenhum
- [ ] Nenhum número inventado no deck inteiro
- [ ] Legível no celular
- [ ] Navegação permite **pular e voltar** slide sem quebrar nada

---

## 7. Pendências — **RESOLVIDAS** (24/09/2026)

| # | Assunto | Resolução |
|---|---|---|
| 1 | Formato | **16:9 principal + adaptável a celular** (ver 3.3) |
| 2 | Direção de imagem | **Aprovada pelo fundador.** Já documentada no `DESIGN.md`, seção `Imagery` — **lacuna antiga do projeto fechada** |
| 3 | Avatar da MEL | `src/assets/mel-full.png` |
| 4 | Substituição da apresentação | **Esta substitui a antiga** (`src/app/components/apresentacao/`). O deck antigo fica no projeto até a nova ser aprovada — não apagar antes |

---

## 8. ⚠️ Uma decisão que ainda falta (e que muda o escopo)

O fundador vai **liberar a apresentação para o co-fundador ver no celular**. Só que o co-fundador **ainda não é usuário da plataforma** — ele **não tem login**.

Portanto são duas coisas diferentes, e as duas podem ser necessárias:

| | O quê | Restrição |
|---|---|---|
| **(a)** | A apresentação **que o fundador conduz** | Ele está logado — pode ser uma página interna |
| **(b)** | O que o **co-fundador acessa depois**, no celular | Precisa abrir **sem login**: link público, arquivo exportado ou PDF |

O projeto já tinha essa noção registrada (`DIRETRIZ_CORRECAO_APRESENTACAO.md` fala em *"página pública"*). **Decidir se constrói (a), (b) ou as duas** — isso muda o escopo da implementação.
