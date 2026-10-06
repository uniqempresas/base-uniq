# 🩺 METODOLOGIA DA CONSULTA UNIQ — Protocolo Clínica (Fonte para Skill Futura)

> **Versão:** 1.0 — 01/10/2026 (criada com o fundador Kelvin)
> **Status:** ✅ Documento-fonte aprovado pelo fundador. **NÃO é skill ainda.**
> **Destino:** outro agente deve transformar este arquivo em skill futura (ex.: `consultoria`), no mesmo formato da skill `ceo`.
>
> **⚠️ NOTA PARA O AGENTE QUE VAI CRIAR A SKILL:**
> Este documento está escrito como metodologia, não como skill operacional. Ao converter, você deverá:
> 1. Ler também `tracking/CONTEXTO_PROJETO.md` (fonte da verdade) — a skill deve **exigir** a leitura dele como primeiro passo.
> 2. Transformar cada etapa em uma seção acionável com "o que fazer agora" e "o que registrar".
> 3. Preservar os scripts de pergunta **literalmente** (são testados pelo fundador — mudar só com autorização dele).
> 4. Preservar a regra de ouro do fechamento humano (*) — é red line do negócio.
> 5. Incluir o "checklist de saída da consulta" como gate obrigatório.
> 6. Adicionar formulário de validação: a skill deve confirmar com o fundador antes de avançar de etapa.

---

## 1. Identidade da Metodologia

**Nome:** Protocolo da Consulta UNIQ
**Metáfora fundadora:** *"A UNIQ funciona como uma clínica pro seu negócio. Você descreve as dores, a gente faz os exames, e o remédio é manipulado — não é medicação de balcão pra todo mundo igual."*

**O que significa na prática:**
- O empreendedor NÃO compra software. Ele entra numa **clínica**.
- Ele conta dores (anamnese), a gente quantifica (exames), diagnostica com prioridade e **manipula o remédio a partir dos módulos da Base UNIQ** (prescrição).
- A Base UNIQ é a farmácia; os módulos são os princípios ativos; a consultoria é a mão que manipula e acompanha o tratamento.

**Frase-âncora para usar COM O CLIENTE:**
> *"A gente não te vende um sistema pronto. A gente escuta seu negócio, mede onde está sangrando, e monta a solução sob medida dentro da nossa plataforma — sem você precisar aprender tecnologia."*

**Por que isso importa (leitura interna):**
Esta metodologia é o que separa consultoria DFY de freelancer de tecnologia. Freelancer vende horas; clínica tem **protocolo**. O protocolo:
1. Garante qualidade de escuta independente do humor/energia do dia do consultor;
2. Gera **dados estruturados** a cada consulta (Supabase);
3. Converte dor quantificada em **prescrição de módulo**;
4. Alimenta o **roadmap do produto** (dor que se repete em 2–3 negócios = vertical em potencial).

---

## 2. A Persona do Consultor (o "médico")

Quando operar esta metodologia, atuar como:

| Aspecto | Como agir |
|---|---|
| **Postura** | Médico de confiança da família: escuta muito, fala pouco, nunca julga o paciente |
| **Proporção de fala** | Cliente fala ~80% · Consultor fala ~20% (perguntas, espelhamento, âncoras de quantificação) |
| **Linguagem** | zero "tecniquês" — nada de CRM, n8n, Supabase, API. **"Sistema", "atendente digital", "organização"** |
| **Atitude sobre venda** | Consulta não é pitch disfarçado. Quem prescreve só depois de diagnosticar. Venda vem **como consequência** do diagnóstico bom |
| **Vedação** | Consultor que interrompe o paciente perde informação (e credibilidade) |

**Público:** microempresas B2B de Suzano/Alto Tietê · faturamento R$ 5–10k/mês · até 3 funcionários · dono que atende e opera ao mesmo tempo. Ver detalhes no `tracking/CONTEXTO_PROJETO.md` → Personas (Centro e Periferia).

---

## 3. As 6 Etapas do Protocolo

```
1. TRIAGEM → 2. ANAMNESE → 3. EXAMES → 4. DIAGNÓSTICO → 5. PRESCRIÇÃO → 6. ACOMPANHAMENTO
```

Cada etapa tem: **objetivo · insumo · como fazer (com scripts) · artefato de saída · armadilha · critério de passagem.**

---

### 🟢 ETAPA 1 — TRIAGEM (antes da consulta)

**Objetivo:** separar quem merece consulta de quem não merece. A consulta é gratuita; o tempo do consultor não é.

**Insumo:** critérios de seleção da Onda 1 (ver `CONTEXTO_PROJETO.md` → "Critério de seleção da Onda 1"):
1. Negócio que **agenda** e/(ou) atende por WhatsApp
2. Nicho adjacente a co-fundadores já aceitos (não idêntico)
3. Cliente/indicação da HQ Gráfica (confiança pré-existente) *(na Fase 1)*
4. Faturamento R$ 5–10k/mês, até 3 funcionários
5. Dor central em **atendimento + operação**
6. Dono disposto a dar depoimento em vídeo
7. Disponível para usar de verdade em 30 dias

**Como fazer:** 3–5 perguntas por WhatsApp/telefônico, conduzidas pela MEL (funil) ou pelo fundador. Exemplos:
- "Quantas pessoas trabalham com você no dia a dia?"
- "Como chegam os clientes pra você hoje — mais por indicação, Instagram, WhatsApp?"
- "De 0 a 10, como você avalia a organização do atendimento?"
- "Se a gente resolver isso em 30 dias, você consegue usar de verdade no dia a dia?" *(testa critério 7)*

**Artefato de saída:** lead classificado → **APROVADO para consulta** / **GUARDADO PARA O FUTURO (Onda 2+)** / **DESCARTADO**.

**Armadilha:** gastar a consulta com lead que não passa nos critérios. Em Suzano, **lead queimado não volta** — mas também **hora perdida não volta**.

**Critério de passagem:** lead aprovado e agendado com data.

---

### 🟡 ETAPA 2 — ANAMNESE (a escuta profunda)

**Objetivo:** coletar a **história do negócio contada pelo dono** — não traduzida pelo consultor.

**Insumo:** a conversa presencial (ou por vídeo). Único insumo: tempo e atenção plena.

**Como fazer — estrutura da conversa (SPIN enxuto):**

**S — Situação (abertura):**
- "Me conta: como funciona o seu negócio no dia a dia, do zero às vendas?"
- "De onde vem o seu cliente hoje?"
- "O que você faz de ponta a ponta numa venda típica?"

**P — Problema (achando as dores):**
- "E nisso tudo, o que mais te atrapalha?"
- "O que te faz perder dinheiro ou tempo que você percebe?"
- "Já tentou resolver algo disso? Como foi?"
- "E você perder cliente por atraso de resposta à noite, enquanto está no balcão? Como isso te afeta?"

**I — Implicação (dando peso à dor — SEM solucionar ainda):**
- "Isso acontece com que frequência?"
- "Quando isso aconteceu da última vez, o que perdeu exatamente?"
- "Se continuar como está por 6 meses, o que acontece com o negócio?"

**N — Necessidade (levando o dono a vislumbrar a solução):**
- "O que precisaria acontecer pra isso acabar?"
- "Se alguém te garantisse [o que ele disse], isso valeria pra operação?"

**Artefato de saída — Ficha de Anamnese (registrar literalmente):**
```
DOR 1: [frase literal do dono]  — frequência: _ — percebida como: (leve|média|grave)
DOR 2: [...]
DOR 3: [...]
FRASES CHAVE: [3 citações literais que imprimem a dor]
HISTÓRIA: [resumo da narrativa em 5 linhas]
OBSERVAÇÕES/PERFIL: [background útil: ramo, rotina, estilo do dono (apressado, conservador, tech-skeptic)]
```

**Armadilha:** interromper p/ solucionar. O consultor "resolver" no meio da escuta mata a consulta: o dono para de falar e o consultor vira vendedor de features.

**Critério de passagem:** ≥ 3 dores registradas, cada uma com **frase literal** e **frequência** estimada.

---

### 🟠 ETAPA 3 — EXAMES (dados, não sensações)

**Objetivo:** transformar cada dor de narrativa para **número** — R$/mês ou horas/mês. Sem exame, a prescrição é chute.

**Insumo:** as dores da Anamnese + números que o dono consegue fornecer na hora (ou depois com o form que você manda).

**Como fazer — Bateria de exames (usar só os pertinentes às dores):**

**Exame 1 — Sangramento no WhatsApp:**
- "Quantos contatos novos no WhatsApp por semana, mais ou menos?"
- "Quantos desses você consegue responder na hora? (com toda honestidade)"
- "Quantos acha que perdem interesse por atraso/falta de resposta?"
- **Cálculo:** ticket médio × vendas perdidas/mês = **R$ perdidos/mês**

**Exame 2 — Tempo devorado:**
- "O que você faz todo dia que você odeia fazer / que te rouba tempo?"
- Quanto gasta: min/dia? × dias/30 = **horas/mês**
- "Se você tivesse essas horas de volta, o que faria delas? (contratar? vender mais?)"

**Exame 3 — Dinheiro fora na escuridão:**
- "Faturamento médio/mês?" — "Dá pra saber rapidinho quanto ficou de lucro no mês passado?"
- Se "não sei": **diagnóstico preliminar = operação às cegas** (dor real, mesmo se a voz é outra)
- "Qual o custo mais alto que te aperta?"

**Exame 4 — Agenda desorganizada:**
- "Você perde compromisso/agendamento com que frequência? O que isso já custou?"
- "Como você controla hoje: caderno, agenda no celular, memória?"

**Exame 5 — Vida da loja/digital (se citado):**
- "Já tem site ou loja online? O que espera deles?" *(se dor = "preciso de site": **REFRAME** — site raramente é a dor real. Prossegue anamnese: "o que você espera VENDER que hoje não está VENDENDO por causa da falta dele? Quem é esse cliente que ele enxerga?")*

**Artefato de saída — Mapa de Impacto Quantificado:**
```
DOR 1: [frase literal] → impacto quantificado: [R$ X/mês ou Y horas/mês]
DOR 2: [...]
DOR 3: [...]
FONTE DOS NÚMEROS: [dono fornecido na hora / estimou / vai mandar depois]
CONFIANÇA: (número confirmado | estimado pelo dono | estimado pelo consultor)
```

**Armadilha:** inventar número quando o dono não informa. "Estimado pelo consultor" vale, **mas sempre com o selo**, nunca como dado real — e a proposta nunca nasce dele sozinho.

**Critério de passagem:** pelo menos **1 dor quantificada em R$ ou horas confirmadas pelo dono**.

---

### 🔴 ETAPA 4 — DIAGNÓSTICO (a consulta de retorno — HUMANO *)

> (*) **REGRA DE OURO — REFORÇO:** a MEL qualifica e levanta; o **humano fecha**. O diagnóstico e a prescrição são apresentados **pelo fundador, pessoalmente**. Isso não é opcional: é para o parceiro se sentir seguro.

**Objetivo:** apresentar 1–3 diagnósticos priorizados, cada um ligado a um módulo da Base UNIQ, com linguagem de negócio (não de tech).

**Insumo:** Ficha de Anamnese + Mapa de Impacto Quantificado + Documento de necessidades da MEL (estrutura SPIN, ver `TRACKING.md` → tabelas funil).

**Como fazer — preparar a apresentação:**
1. Ordenar as dores por **impacto quantificado** (maiores R$/h primeiro).
2. Para cada dor, buscar no **Mapa Dor → Módulo** (seção 4):
   - ✅ **existe** → prescreve
   - 🟡 **roadmap** → prescreve como próxima fase com data
   - 🔴 **não existe / não replica** → tratamento alternativo: customização cobrada, ou ser direto: "isso aqui não é nosso foco hoje — e é por isso que sou direto"
3. Montar a frase do diagnóstico: *"Dor X [frase dele] → custo mensal Y [número dele] → tratamento: módulo Z [nome claro] → entregue em N dias → você ganha [resultado esperado]"*

**Fala de apresentação (presencial ou por vídeo):**
- "Três coisas que eu vi no que você contou. A primeira é a que sangra mais: [dor], que te custa [R$ X/mês]. Isso aí, na nossa visão, é resolvido com [módulo em linguagem do glossário]. O segundo e o terceiro a gente vai em seguida, com calma."

**Artefato de saída — Documento de Diagnóstico** (1 página):
```
PACIENTE: [empresa]
DIAGNÓSTICO 1: [dor + número] → MÓDULO: [nome] → PRAZO: [N dias] → RESULTADO ESPERADO: [efeito objetivo]
DIAGNÓSTICO 2: [...]
DIAGNÓSTICO 3: [...]
O QUE NÃO RESOLVEMOS HOJE: [dor fora de foco + por quê + alternativa]
```

**Armadilha:** diagnóstico com mais de 3 itens. Clínica que diagnostica 12 coisas em 1 consulta perde autoridade — e o remédio manipulado vira receita corrida. **1–3, priorizado.**

**Critério de passagem:** dono entende cada diagnóstico e reconhece o número (diz "ai, é isso mesmo" ou corrige — ambos são bons; silêncio não).

---

### 🟣 ETAPA 5 — PRESCRIÇÃO (o remédio manipulado + fechamento)

**Objetivo:** transformar diagnóstico em plano de entrega com data, preço e contrapartida. **E fechar.**

**Insumo:** Documento de Diagnóstico + tabela de pricing vigente (ver `CONTEXTO_PROJETO.md` → Pricing; **nunca** improvisa preço).

**Como fazer — prescrição em 3 blocos:**

**Bloco 1 — O plano (o tratamento):**
- Fase 1 (MVP, 30 dias): resolve o que sangra mais. Ex.: "Sua Melissa atende no WhatsApp 24h + tudo organizado num painel único"
- Fase 2 (30–90 dias): módulos seguintes conforme a maturação da operação dele
- Cada fase: **o que ele recebe, o que muda no dia a dia, quando**

**Bloco 2 — O investimento (âncora — usando pricing vigente, apenas citado literalmente do CONTEXTO):**
- Preço de tabela no contrato (setup R$ 1.500 + R$ 297/mês) — dito como o valor real
- Condição co-fundador (setup R$ 500 sinal + R$ 197/mês) — dito como **isenção conferida**, não preço baixo
- O sinal **reserva a vaga**; a mensalidade começa **após a entrega do MVP**
- Os valores acima são citados **só pelo próprio fundador**. Se a skill for usada por outro agente, cita apenas a estrutura — o número vale por "ver CONTEXTO vigente".

**Bloco 3 — A contrapartida (por que é barato e não dá de graça):**
- Co-fundador entrega: uso real + feedback sincero + depoimento em vídeo
- Total concedido no 1º ano: R$ 2.200 (economia configurada no pricing vigente)

**Fechamento (a pergunta do sinal):**
> *"Firmamos com o sinal agora e eu te coloco no calendário de entrega? A vaga de co-fundador é limitada, e o que reserva é esse compromisso dos dois lados."*

**Se houver objeção de preço:** R$ 197/mês custa menos que uma fração de funcionário (a comparação é com **pessoal**, não com software — ver `CONTEXTO_PROJETO.md` → "A Melissa como Funcionária"). **Fallback R$ 107 só** em objeção explícita depois de esgotar o argumento de valor, nunca como abertura, **sempre registrado com motivo**.

**Artefato de saída:** termo de co-fundador assinado + sinal confirmado + data de faturamento (5/15/25; padrão 5) + registro no CRM da Base UNIQ (dogfooding).

**Armadilha:** fechar antes do dono valer o número do impacto. Preço sem dor quantificada = negociação; preço com dor quantificada = prescrição.

**Critério de passagem:** o sinal fechado, OU explícito "não agora, mas [data/motivo]" registrado para follow-up.

---

### 🔵 ETAPA 6 — ACOMPANHAMENTO (a evolução do tratamento)

**Objetivo:** acompanhar o uso real, medir antes/depois, e **coletar feedback estruturado que evolui os módulos**. É aqui que nasce o vertical.

**Insumo:** uso real do co-fundador na Base UNIQ + Métricas de antes/depois (campos das dores quantificadas na etapa 3 comparadas com a dado de hoje).

**Como fazer:**
1. **Ciclos de acompanhamento:** no dia 7, 30 e 90 pós-entrega — check-in fixo (MEL pode conduzir as partes operacionais; fundador conduz a conversa de negócio).
2. **Comparar antes/depois** das métricas do mapa de impacto (ex.: "você perdia R$ 900/mês no WhatsApp. Quantos contatos zeraram semana passada?")
3. **Registrar feedback por módulo** (o que faltou, o que estranhou, o que dá até)
4. **Conduzir a conversa até a frase que vira case:** "o que essa ferramenta mudou no jogo pra você?"

**Artefato de saída — Relatório de Acompanhamento (por módulo, por parceiro):**
```
MÓDULO X — como está sendo usado __
O QUE FALTOU: __
O QUE NÃO CASOU COM A DOR: __
MÉTRICA ANTES/DEPOIS: __
FRASE DO DONO (para o depoimento/case): __
CLASSIFICAÇÃO: [módulo valida | módulo precisa evoluir | dor não casa com o que projetamos]
```

**A ponte estratégica (o motor de roadmap) — classificação da dor após acompanhamento:**
- Dor por um único cliente, não replicável → **customização** (cobrada à parte)
- Dor que **se repete em 2–3 negócios do mesmo nicho** → **candidata a módulo vertical** (ex.: `CRM` → `CRM_OTICA`) — verificar a regra dos 2–3 no `CONTEXTO_PROJETO.md` → "Arquitetura de Módulos"
- Dor fora do catálogo atual → **Backlog**, e conversada na revisão de produto
- Módulo que **passa a ser vendável sozinho** (valido, com frase do dono) → **vira case + depoimento** → alimenta a Onda 2 com preço maior

**Armadilha:** pular etapa 6. É ela que separa co-fundador (laboratório que ensina) de cliente (busca que consome).

**Critério de passagem:** relatório de acompanhamento completo para cada co-fundador, com a classificação dor→módulo registrada.

---

## 4. Mapa Dor → Módulo (v1 — a tabela viva)

> **Esta tabela é o tradutor entre a fala do cliente e o catálogo da Base UNIQ. Viva — cresce a cada consulta. Baseada no catálogo de módulos (`src/app/lib/modulos.ts`) e nos módulos previstos no CONTEXTO.**

| # | Dor (como o cliente fala) | Módulo da Base UNIQ | Status | Nota |
|---|---|---|---|---|
| 1 | "Perco vendas no WhatsApp" / "não respondo a tempo" | **Atendente** (MEL WhatsApp 24h) | ✅ existe | Pilar 1 (faturamento) |
| 2 | "Não sei o que é lucro e o que é caixa" | **ERP básico / Financeiro** | ✅ existe | Pilar 2 (custos) |
| 3 | "Perco compromisso / esqueço retorno" | **Agenda** | ✅ existe | — |
| 4 | "Não sei quem meu cliente é o que já comprou" | **CRM leve** | ✅ existe | — |
| 5 | "Quero vender online / preciso de site-loja" | **Site/landing page** | 🟡 roadmap | ⚠️ **REFRAME**: site raramente é a dor real. Escavar antes de prescrever (ver Exame 5) |
| 6 | "Preciso divulgar / Instagram parado" | **Mídias Sociais** | 🟡 roadmap | — |
| 7 | "Quero aprender a administrar" | **Trilhas** (desenvolvimento do empreendedor) | 🔴 fora do MVP | ⚠️ **PROMETER COMO VISÃO, NUNCA COMO COMPROMISSO** (decisão "vender 2, prometer 1") |
| 8 | [dor nova] | [a identificar] | 🔴 pauta de consultas | registra na Etapa 6 |

**Regra ao mapear cada nova dor:** primeiro perguntar "o que construir pra este cliente serve pra 2+ negócios?" — se não, não tem módulo; é customização cobrada.

---

## 5. Regras de Proteção (red lines do protocolo)

1. **Consulta nunca é demo disfarçada de escuta.** Anamnese sem fala do cliente = consulta inválida — reabrir.
2. **Sem exame, sem prescrição.** Nenhum módulo entregue sem dor quantificada (representado por número informado ou confirmado pelo dono).
3. **Diagnóstico máximo: 3.** Mais que isso dilui o tratamento e quebra a autoridade.
4. **Preço nunca improvisado.** Pricing vigente no `CONTEXTO_PROJETO.md` — se não souber, consultar, não chutar.
5. **Fechamento é humano.** MEL qualifica, levanta, agenda — e nunca prescreve ou fecha (*decisão fechada no funil*).
6. **Nenhuma build pré-contrato.** Site/loja ou qualquer módulo para lead sem sinal é "roadmap", não construção.
7. **Etapa 6 nunca pular.** Sem acompanhamento, o laboratório não ensina e o vertical não nasce.
8. **Lead queimado não volta** — antes de qualquer conversa, aplicar a triagem.
9. **Dados estruturados sempre.** Tudo que a conversa coletar vai para o Supabase (estrutura SPIN), nunca em bloco de notas.
10. **Foco local (Suzano / Alto Tietê)** — nada nacional nesta fase.

---

## 6. Registros de Dados (onde cada etapa vai no banco)

> Estruturas já existentes no Supabase oficial (`krrkfgv...`), especificadas no `TRACKING.md`:

| Etapa | Onde registra | Como |
|---|---|---|
| 2 e 3 (Anamnese + Exames) | `mel_consultoria` | colunas SPIN (`experiencia_consultoria` = Situação · `processo_atual` = Situação · `maiores_custos` / `tarefa_perda_tempo` / `perda_clientes` = Problema · `impacto_financeiro` / `risco_decisao` = Implicação · `dor_critica` / `valor_solucao` = Necessidade) |
| 3 (dores individuais) | `mel_validacao_dores` | 1 registro por dor: descrição, categoria, frequência, impacto_tempo, impacto_dinheiro, ja_tentou_resolver, nota_gravidade, **citacao_cliente** |
| 6 (coleta de indicação) | `mel_validacao_indicacoes` | se o co-fundador indicar outro contato |
| 6 (feedback de módulo) | Relatório de texto (estrutura da seção 3, Etapa 6) que vai no CRM/Agenda da Base UNIQ | dogfooding: UNIQ usa os próprios módulos |

Pendente a criar quando for hora: campos de "exame" no `mel_consultoria` (impact quantificado) e renderizador de "prescrição" (mapa dor→módulo) na Base UNIQ.

---

## 7. Checklist de Saída da Consulta (gate obrigatório)

Antes de considerar a consulta completa, marcar:

- [ ] Triagem aprovada (lead passou nos critérios Onda-1)?
- [ ] ≥ 3 dores registradas com **frase literal** do dono?
- [ ] ≥ 1 dor **quantificada** (R$ ou horas) e conferida pelo dono?
- [ ] Diagnóstico com no máximo 3 itens, cada um ligado a um módulo?
- [ ] Prescrição com fase, prazo e preço do contrato (âncora + co-fundador)?
- [ ] Termo com contrapartida (uso real + feedback + depoimento) exposto?
- [ ] Sinal fechado OU follow-up datado e registrado?
- [ ] Tudo registrado no Supabase (estrutura SPIN)?
- [ ] Controle da entrega marcado em CRM + Agenda (dogfooding — nada de módulo novo)?

---

## 8. Glossário (linguagem de negócio — sem "tech" no atendimento ao cliente)

| Não dizer | Dizer |
|---|---|
| chatbot / bot / n8n / API | **Mel — sua atendente digital** |
| CRM | **o caderno dos seus clientes, organizado** |
| ERP | **o painel que te mostra o que entrou e o que saiu** |
| automação | **funcionar sozinho, 24h** |
| plataforma / SaaS | **sua operação digital na Base UNIQ** |
| integração | **todos conectados num lugar só** |

---

## 9. Como esta metodologia se conecta ao resto do projeto

| Documento | Papel |
|---|---|
| `tracking/CONTEXTO_PROJETO.md` | Fonte da verdade (pricing, personas, fases, arquitetura) — **a skill Consultoria deve sempre exigir a leitura dele primeiro** |
| `tracking/TRACKING.md` | Estado da sprint; esquema das tabelas do funil (campos SPIN) |
| Funil de Aquisição (CONTEXTO) | Produz os leads que esta metodologia processa — a MEL preenche as etapas 2/3 estruturalmente |
| Arquitetura de módulos (CONTEXTO) | Regra de vertical — a ponte Etapa 6→produto |
| Exit Safe / Fases | A consulta alimenta os cases da Onda 2 e a transição para o preço cheio na Fase 2+ |

---

## 10. Change Log

| Data | Versão | O que mudou |
|---|---|---|
| 01/10/2026 | 1.0 | Linha de base criada com o fundador — metáfora da clínica protocolarizada em 6 etapas; mapa dor→módulo v1; regras de proteção; registros de dados mapeados; NOTA PARA SKILL FUTURA |

---

*Metodologia da Consulta UNIQ — modo CEO · UNIQ Empresas*
*Este arquivo é fonte de skill futura (`consultoria`), não tecnologia do produto.*
