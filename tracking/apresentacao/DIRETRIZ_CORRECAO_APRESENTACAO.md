# Diretriz de Correção do Deck — P0

> ⚠️ **SUPERSEDED (24/09/2026):** o **copy** deste documento foi substituído por `ANALISE_TEXTO_APRESENTACAO.md` (2ª rodada, texto linha a linha). Decisão do fundador: **a Análise de texto vence**. A **estratégia** aqui continua válida; onde o copy divergir, vale a Análise de texto.

> **Status:** aguardando validação do fundador. Nada executado.
> **Autoria:** CEO (agente). **Data:** 24/09/2026.
> **Base:** `src/app/components/apresentacao/slides-data.ts` (13 slides).
> **Restrições respeitadas:** setup **R$ 500**, nomes **Alpha/Beta/Prod**, tabela **R$ 1.500 + R$ 297/mês**, página pública com nomes mantidos.
> O que contraria uma restrição está isolado em *Recomendações que exigem aprovação*.

**Regra de copy aplicada a R$ 500:** nomeado como **"sinal de compromisso"** — não é desconto, é o que reserva a vaga e separa quem quer de quem vai usar. A tabela R$ 1.500 continua sendo a referência de valor (âncora intacta).

---

## Registro do fundador — 24/09/2026 *(em revisão)*

O fundador vai **revisar a diretriz antes de aprovar**. Nada foi executado.

**Sobre o conflito Beta/Prod** — declaração do fundador:
> "Eu não vou abrir para todos os clientes de uma vez. Eu vou abrir para + 4 clientes. Mas já na versão final. Eu creio que vamos ter que corrigir isso na documentação tbm."

**Leitura a confirmar:** Alpha (4) + Beta (+4) = **8 co-fundadores, sem terceira onda** — "Prod" deixa de ser onda de co-fundadores (aproxima-se da **Opção A** da Recomendação #1). O fundador assume como consequência **corrigir a documentação** (ondas/fases + vocabulário) — ver *Itens de P0 que dependem de decisão de documento*, item 4.

---

## O que muda, por slide

### Slide 1 — Capa
**Muda:** adiciona Suzano; troca "ferramentas/3 pilares iguais" pelo pitch oficial de margem; tira "transformação" do trio.
**Por quê:** o deck abre com produto ("ferramentas") e sem o território. Margem é o que o dono entende na hora, e "Suzano" é o unfair advantage local.
**Texto-alvo:**
```ts
{
  id: 1,
  layout: "hero",
  eyebrow: "SUZANO · ALTO TIETÊ · CONSULTORIA",
  titulo: "Sua empresa merece o que as grandes já usam.",
  subtitulo: "A UNIQ faz entrar mais dinheiro e mostra para onde o seu está saindo. Isso é margem.",
}
```

### Slide 2 — A dor
**Muda:** entra a dor-mãe (WhatsApp no vácuo); funde "sem tempo" + "sem caixa".
**Por quê:** é a dor documentada da persona — a que o produto de fato resolve. Hoje ela não aparece; as três dores atuais são genéricas.
**Texto-alvo:**
```ts
{
  id: 2,
  layout: "conteudo",
  titulo: "VOCÊ RECONHECE ESSE DIA?",
  subtitulo: "O dia inteiro apagando incêndio. E o negócio sem sair do lugar.",
  itens: [
    { descricao: "O WhatsApp apitando enquanto você atende no balcão — e o cliente comprando no concorrente." },
    { descricao: "Atendimento, operação, fornecedor, caixa: tudo passa por você." },
    { descricao: "Não sobra tempo para estudar o mercado — nem caixa para contratar quem tenha esse conhecimento." },
  ],
  destaque: "Não falta força de vontade. Não falta qualidade. Faltam ferramentas e conhecimento.",
}
```

### Slide 4 — Origem
**Muda:** ancora o fundador em Suzano.
**Por quê:** "minha gráfica B2B" é genérico; "aqui em Suzano" ativa proximidade e autoridade local, que são o diferencial da marca.
**Texto-alvo:**
```ts
{
  id: 4,
  layout: "conteudo",
  titulo: "POR QUE A UNIQ EXISTE",
  subtitulo: "Eu vi os dois lados desse jogo",
  itens: [
    {
      numero: "Nas grandes empresas",
      titulo: ["Analista de sistemas desde 2011, em empresas como ", { forte: "Banco Santander" }, " e ", { forte: "Ultragaz" }, ", em contato com a alta diretoria."],
      descricao: ["Lá ficou claro o quanto ", { forte: "conhecimento de mercado, estratégia e boas ferramentas" }, " fazem diferença no resultado."],
    },
    {
      numero: "Na minha gráfica B2B",
      titulo: ["Atendendo pequenos e médios empreendedores ", { forte: "aqui em Suzano" }, ", vi o contraponto: gente talentosa e esforçada, ", { forte: "sem acesso às mesmas ferramentas e ao mesmo conhecimento" }, "."],
    },
  ],
  fecho: "Foi dessa diferença que nasceu a UNIQ. Levar para o pequeno o que a grande já usa para vencer.",
}
```

### Slide 5 — Os 3 objetivos
**Muda:** porte passa a "pequenas empresas" + Suzano; o objetivo 03 é marcado como construção no tempo.
**Por quê:** "pequenas e médias" atrai fora do perfil (quebra as 16h/semana e destoa do preço); e o 03 é visão, não entrega — precisa ler como futuro.
**Texto-alvo:**
```ts
{
  id: 5,
  layout: "beneficios",
  titulo: "A UNIQ EMPRESAS",
  subtitulo: "3 objetivos claros, um só parceiro",
  corpo: "A UNIQ atua em Suzano e no Alto Tietê com consultoria para pequenas empresas. Não somos uma empresa de tecnologia — usamos a tecnologia a favor do objetivo.",
  itens: [
    { numero: "01", titulo: "Aumento de Faturamento", descricao: "Sua empresa vendendo todos os dias — inclusive quando você não está lá." },
    { numero: "02", titulo: "Aumento de Margem", descricao: "Lucrar mais em cada venda, sabendo exatamente onde está o dinheiro." },
    { numero: "03", titulo: "Transformação do Empreendedor", descricao: "De dono atolado na operação a empresário que decide com clareza — o objetivo que se constrói com o tempo." },
  ],
  destaque: "Consultoria + tecnologia a serviço do objetivo — nunca o contrário.",
}
```

### Slide 6 — 01 Aumento de Faturamento
**Muda:** corta "Base UNIQ — Loja Virtual".
**Por quê:** marketplace está fora do escopo da Fase 1. Prometer o que não se entrega vira gap de entrega — e queima lead no mercado pequeno.
**Texto-alvo:**
```ts
{
  id: 6,
  layout: "beneficios",
  eyebrow: "01",
  titulo: "Aumento de Faturamento",
  subtitulo: "Sua empresa vendendo todos os dias — inclusive quando você não está lá.",
  itens: [
    { titulo: "UNIQ — Conhecimento de mercado", descricao: "Trazer conhecimento externo e de mercado para dentro da sua operação." },
    { titulo: "Melissa — Atendimento que converte", descricao: "Atendimento estruturado para transformar contato em venda." },
    { titulo: "Base UNIQ — Funil de Vendas", descricao: "Pipeline claro, do primeiro contato ao fechamento." },
  ],
}
```

### Slide 7 — 02 Aumento de Margem
**Muda:** corta "Parcerias com empreendedores"; entra "Financeiro" (pedido contabilizado).
**Por quê:** "rede de parceiros" não é módulo nem capacidade documentada — foi inventada. Em troca, entra o que a demonstração real mostra: o pedido do WhatsApp contabilizado.
**Texto-alvo:**
```ts
{
  id: 7,
  layout: "beneficios",
  eyebrow: "02",
  titulo: "Aumento de Margem",
  subtitulo: "Lucrar mais em cada venda, sabendo exatamente onde está o dinheiro.",
  itens: [
    { titulo: "UNIQ — Análise profunda de mercado", descricao: "Entender preço, concorrência e posicionamento para decidir com dados." },
    { titulo: "Base UNIQ — Visão total da operação", descricao: "Custos, margens e processos enxergados de ponta a ponta." },
    { titulo: "Base UNIQ — Financeiro", descricao: "O pedido que chega no WhatsApp já aparece contabilizado — você enxerga para onde o dinheiro está indo." },
  ],
}
```

### Slide 8 — 03 Transformação do Empreendedor (visão, não venda)
**Muda:** corta "Trilhas de aprendizagem" e "Melissa — Guia diário"; reduz a 2 itens; vira o slide da visão.
**Por quê:** "Trilhas" está fora do MVP e o pilar 03 é o que se **promete**, não se vende ("vender 2, prometer 1"). Manter o slide preserva a simetria 01/02/03 sem prometer módulo inexistente.
**Texto-alvo:**
```ts
{
  id: 8,
  layout: "beneficios",
  eyebrow: "03",
  titulo: "Transformação do Empreendedor",
  subtitulo: "De dono atolado na operação a empresário que decide com clareza.",
  itens: [
    { titulo: "Empreender e gerir são coisas diferentes", descricao: "E gerir se aprende — com método, não com tentativa e erro." },
    { titulo: "Isso não se instala em um módulo", descricao: "É o objetivo que se constrói ao longo do caminho — e o motivo pelo qual a UNIQ fica do seu lado." },
  ],
  destaque: "Hoje entregamos faturamento e margem. A transformação é onde queremos te levar — o resultado que vem com o tempo.",
}
```

### Slide 10 — Método (30 × 90 dias)
**Muda:** reconcilia o prazo (entrega em 30 dias · método em 90); remove "até o resultado aparecer".
**Por quê:** hoje o deck diz 90 dias, mas a entrega documentada é ~30 dias. Duas datas brigando na frente do cliente enfraquecem; e promessa aberta ("até aparecer") não tem limite.
**Texto-alvo:**
```ts
{
  id: 10,
  layout: "beneficios",
  titulo: "COMO TRABALHAMOS",
  subtitulo: "Um método, não promessas",
  itens: [
    { numero: "1", titulo: "Diagnóstico", descricao: "Análise profunda da operação, do mercado e dos números da empresa." },
    { numero: "2", titulo: "Plano de ação", descricao: "Metas claras de faturamento e margem, com ferramentas definidas." },
    { numero: "3", titulo: "Execução acompanhada", descricao: "Melissa no dia a dia, UNIQ ao lado — acompanhando cada etapa." },
  ],
  destaque: "Entrega rodando em até 30 dias. Nos primeiros 90, o método roda junto: diagnóstico completo da operação, funil de vendas estruturado, visão clara de margens e um plano de crescimento com metas.",
}
```

### Slide 11 — Fase Alpha
**Muda:** corrige a contradição "apenas 4" × mais ondas (o "4" passa a ser "nesta fase"); mantém Alpha/Beta/Prod.
**Por quê:** "APENAS 4" + roadmap de 12 se anulam — escassez que se autodestrói. Com "4 nesta fase", a escassez continua verdadeira e os nomes ficam.
**Texto-alvo:**
```ts
{
  id: 11,
  layout: "conteudo",
  titulo: "FASE ALPHA · 4 EMPRESAS",
  subtitulo: "Por que entrar agora",
  itens: [
    { titulo: "Preço de fundador", descricao: ["R$ 500 de setup e R$ 197/mês — a condição que ", { forte: "não volta" }, ". Depois da Alpha, o valor sobe para R$ 1.500 + R$ 297/mês."] },
    { titulo: "Atenção máxima", descricao: "São 4 empresas nesta fase. Dedicação quase individual — algo que uma consultoria com dezenas de clientes não consegue oferecer." },
    { titulo: "Co-construção", descricao: "Você participa da construção do método — e colhe os resultados primeiro." },
  ],
  destaque: "O caminho: Alpha (4 empresas) → Beta (+4) → Prod (+4) → lançamento oficial em 07/2027.",
  fecho: "Cada fase fortalece a base da próxima — e a sua empresa entra na frente.",
}
```

### Slide 12 — Investimento
**Muda:** R$ 500 nomeado como sinal de compromisso; tabela vira "VALOR DE TABELA"; entra a vantagem de R$ 2.200; corrige "pagamento na inicialização" e "sem fidelidade".
**Por quê:** o R$ 500 só é defensável com identidade própria (compromisso, não desconto) — assim a tabela R$ 1.500 segue como âncora. E a mensalidade começa após a entrega, não na assinatura.
**Texto-alvo:**
```ts
{
  id: 12,
  layout: "pricing",
  titulo: "INVESTIMENTO",
  subtitulo: "Menos que um dia de faturamento parado",
  corpo: "Uma venda a mais por mês já paga a consultoria. O resto é lucro.",
  planos: [
    { rotulo: "VALOR DE TABELA (APÓS A ALPHA)", setup: "R$ 1.500", mensal: "R$ 297" },
    { rotulo: "FASE ALPHA · 4 VAGAS", setup: "R$ 500", mensal: "R$ 197", destaque: true },
  ],
  destaque: "Na Alpha: R$ 500 de setup em vez de R$ 1.500. R$ 2.200 de vantagem no primeiro ano.",
  check: [
    "R$ 500 é o sinal de compromisso que reserva a sua vaga — não um desconto",
    "A mensalidade só começa depois da entrega",
    "Sem fidelidade contratual: você fica enquanto enxergar valor",
    "Quando as 4 vagas da Alpha acabarem, vale o valor de tabela",
  ],
}
```

### Slide 13 — CTA
**Muda:** corrige preço/"apenas"; adiciona próximo passo concreto (WhatsApp da MEL) e Suzano no rodapé.
**Por quê:** um CTA de venda ao vivo precisa de ação concreta. O canal do funil é o WhatsApp da MEL — é o clique que converte o dono em lead qualificado.
**Texto-alvo:**
```ts
{
  id: 13,
  layout: "encerramento",
  titulo: ["Vamos tirar a sua empresa do lugar — ", { forte: "juntos" }, "."],
  subtitulo: "Fase Alpha: 4 vagas. R$ 500 de setup + R$ 197/mês.",
  cta: "Fale com a MEL e reserve a sua vaga — (11) 95817-4767",
  rodape: "UNIQ Empresas · Consultoria para pequenas empresas · Suzano / Alto Tietê",
}
```
*(`cta` é campo novo no modelo do slide — incluir no `Slide` de `slides-data.ts`.)*

---

## O que NÃO muda
- **Slide 3 (Custo de continuar assim):** mantém. Faturamento/margem/custo no lugar certo, e a linha "funcionário do próprio negócio" é o que dói.
- **Slide 9 (Diferencial — Melissa):** mantém. É o melhor argumento do deck; já vende resultado, não funcionalidade.
- **Slide 14+:** inexistentes.

## Impacto no total de slides
**Permanece 13.** O slide 8 é **reduzido a 2 itens** (não fundido), preservando a simetria 01/02/03 do slide 5. Se o fundador preferir **fundir o 8 no 9**, o total cai para **12** e o slide 9 absorve uma linha de visão — decisão dele (ver aprovações).

---

## Recomendações que exigem aprovação do fundador

1. **Beta (+4) e Prod (+4) como ondas — conflita com o doc.**
   O doc diz: **exatamente 8 co-fundadores, sem 9º**, e depois maturação. O deck implica 12 vagas. Opções com nomes preservados:
   - **A)** Alpha (4) + Beta (4) = 8 co-fundadores; **Prod = lançamento** (clientes pagantes). Alinha com o doc e com a linha "depois da Alpha o valor sobe". ← *recomendada*
   - **B)** Alpha = única condição de fundador; Beta/Prod = fases de clientes pagantes.
   - **C)** Manter 12 co-fundadores e **atualizar o doc** (muda o modelo, não o deck).
   *Trade-off:* A preserva nomes e coerência; C exige rever o critério de ondas e as 16h/semana.

2. **Roadmap Alpha/Beta/Prod na página pública.** O fundador quer os nomes mantidos — ok. Sugestão mínima: manter os nomes **sem** as contagens/datas internas na página pública ("Fase Alpha · 4 vagas · condição de fundador"). Se publicar o roadmap inteiro, aceite que o planejamento fica exposto a qualquer pessoa com o link.

3. **"Sem fidelidade: saia quando quiser"** foi reescrita para "sem fidelidade contratual: você fica enquanto enxergar valor". A frase original **conflita com a contrapartida** (uso + feedback + depoimento) que sustenta o R$ 500 mais baixo. Aprovar a reescrita ou assumir o conflito.

4. **Loja Virtual / Trilhas / Parcerias** foram cortadas como *entrega*. Se quiser mantê-las como **visão futura**, dá para recolocá-las num único slide de visão (o 8), **sem** nome de módulo nem promessa de prazo. Só aprovar.

---

## Itens de P0 que dependem de decisão de documento
Antes de publicar a página, o `CONTEXTO_PROJETO.md` e o `ESCOPO_PROJETO_UNIQ_EMPRESAS.md` precisam fechar:

1. **Contradição de tabela:** a Decisão #1 (linha 635) diz tabela **R$ 2.500**; a seção Pricing (linha 67) e a Decisão #11 dizem **R$ 1.500**. O deck ancora em R$ 1.500. **Definir qual é**, corrigir o doc — senão a âncora do deck e da página fica em areia.
2. **Valor concedido:** o doc fala **R$ 2.700** (quando o setup era isento). Com R$ 500, passa a **R$ 2.200** (R$ 1.000 de setup + R$ 1.200 de mensalidade). Atualizar os documentos.
3. **Porte oficial:** escolher o rótulo único ("pequenas empresas de Suzano") e aplicá-lo nos docs. Hoje convivem "microempresas", "pequenas e médias" e perfis de faturamento divergentes entre `CEO.md` e `CONTEXTO_PROJETO.md`.
4. **Vocabulário de fases:** o doc usa "Onda 1/2" e "Fases 1–4"; o deck usa "Alpha/Beta/Prod". Alinhar o doc ao nome que o fundador quer manter no deck.
5. **Momento da cobrança:** o doc diz "cobrança inicia após a entrega do MVP". Com R$ 500 definido como sinal de compromisso, o **sinal** é pago no fechamento e a **mensalidade** após a entrega — formalizar essa distinção no termo de co-fundador.

---

## Risco aceito
Mantém-se registrado, uma vez: **R$ 500 continua criando um terceiro ponto de preço** (não é tabela, não é isenção). Mitigado dando-lhe identidade própria (sinal de compromisso) para não corroer a âncora R$ 1.500. Sinal de alerta: se nas primeiras 3–5 propostas o lead perguntar *"por que não é zero?"*, o R$ 500 está difícil de defender — reavaliar. Decisão do fundador; segue com R$ 500.

---

## P1 em uma linha
P1 é a **fase de implementação da página** (fidelidade ao sistema visual do deck + CTA interativo + mobile-first) — a detalhar só quando este documento for aprovado.
