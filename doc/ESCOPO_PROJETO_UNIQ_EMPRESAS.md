# 📄 ESCOPO DO PROJETO — UNIQ Empresas

> **Status:** Descoberta concluída — escopo validado pelo fundador em 07/09/2026.  
> **Base:** `doc/CONTEXTO_UNIQ.md` + `tracking/CONTEXTO_PROJETO.md` + CEO.md + KelvinCleto.txt + conversas de descoberta.  
> **Responsável:** CEO / Planejamento Estratégico  
> **Última atualização:** 07/09/2026

---

## 1️⃣ Diretriz Estratégica (WHAT + WHY)

### O QUÊ
Criar a oferta **UNIQ Empresas**: versão da Base UNIQ direcionada a microempresas B2B de Suzano/Alto Tietê (até 3 funcionários) com dores em **atendimento e operação**, entregue como consultoria DFY (Done-For-You) com módulos construídos como peças de Lego.

### POR QUÊ
- A UNIQ já validou o modelo de co-fundadores no contexto original; UNIQ Empresas replica esse modelo para um público B2B com maior capacidade de pagamento e dores operacionais claras.
- A Base UNIQ possui a arquitetura modular (16 módulos) e permite ativar/encaixar funcionalidades conforme a dor do cliente.
- O modelo co-fundador reduz o risco de entrada, gera feedback real e cria cases de sucesso para prova social.

### Contexto
- **Mercado:** Suzano/Alto Tietê — foco local.
- **Cliente ideal:** microempresas B2B com até 3 funcionários, faturamento entre **R$ 5.000 e R$ 10.000/mês**, e dor em atendimento + operação.
- **Fonte de aquisição inicial:** clientes da própria gráfica do fundador, que já atende B2B local.
- **Canais secundários de validação:** perfil no Instagram da UNIQ com 1 post semanal, apenas para existir como presença digital. Não é canal de venda ativo nas primeiras 4 semanas.
- **Laboratório interno (dogfooding):** o fundador opera a **HQ Gráfica** e a esposa opera a **Doceê** (doceria). Ambos testarão o MVP junto com o cliente da primeira semana, aplicando na própria operação antes de entregar aos co-fundadores.
- **Modelo de entrega:** DFY (Done-For-You) — a UNIQ configura a Base UNIQ para o cliente. Como a plataforma é SaaS, não há instalação física; a entrega é configuração, onboarding e ativação dos módulos.
- **Modelo financeiro (Fase 1 — decidido em 07/09/2026):** **ancoragem**. O contrato mostra o preço de tabela (setup **R$ 1.500** + **R$ 297/mês**) e a condição de co-fundador concede **isenção do setup** e redução para **R$ 197/mês**, em troca de uso real + feedback + depoimento em vídeo. **Valor concedido no 1º ano: R$ 2.700.** Fallback de **R$ 107/mês** apenas como plano de emergência diante de objeção explícita. Cobrança inicia após a entrega do MVP, em data de faturamento escolhida pelo co-fundador (dia 5, 15 ou 25; **padrão dia 5**).
- **Entrega:** módulos + robô de atendimento no WhatsApp prontos até o dia do primeiro pagamento (~30 dias).
- **Objetivo imediato (revisado em 07/09/2026):** ~~fechar o primeiro co-fundador em 7 dias~~ → **validar a Base UNIQ internamente na HQ Gráfica e na Doceê durante ~3 semanas** e só então visitar o cliente da ótica com algo digno para apresentar.
- **Por que a mudança de prazo:** o risco de chegar à visita sem algo demonstrável era alto demais. O fundador decidiu que **prova vale mais que velocidade**. O laboratório interno deixa de ser "Semana 0" e vira a **fase central de preparação**.
- **Capacidade do fundador:** 16h/semana dedicadas full ao projeto. Durante o dia, mesmo no CLT, consegue alinhar e validar via celular (túnel do OpenCode + Vercel). À noite, acesso total ao computador.
- **Metodologia obrigatória:** SDD sempre (Research → PRD → SPEC → WIRE → Implementação). A documentação é o que garante que o agente construtor entenda o objetivo sem carregar todo o contexto.

### NÃO inclui (escopo explícito fora)
- Expansão para fora de Suzano/Alto Tietê nesta fase.
- White label neste primeiro ciclo.
- Nicho específico pré-definido: a escolha do nicho será resultado dos 4 co-fundadores.
- Investimento em tráfego pago nesta fase.

---

## 2️⃣ Escopo do Projeto

### O que o cliente precisa
Microempresas B2B precisam:
- Não perder vendas e leads no WhatsApp.
- Ter atendimento organizado mesmo com poucos funcionários.
- Ter uma operação digital simples (CRM leve, agenda, atendimento).
- Não precisar aprender tecnologia.

### O que o cliente pediu
Modelo de co-fundador com:
- Setup gratuito.
- Mensalidade acessível (R$ 197).
- Construção sob demanda dos módulos que resolvem sua dor.

### Escopo acordado — Fase 1 (Co-fundadores)
| Entrega | Detalhe |
|---------|---------|
| **4 co-fundadores B2B (Onda 1)** | Dores parecidas: atendimento + operação. Ritmo definido pela **capacidade de entrega**, não por calendário fixo. |
| Setup | **Isento** — valor de tabela **R$ 1.500** explícito no contrato *(hipótese; o mercado valida nas primeiras 3–5 propostas)* |
| Mensalidade | **R$ 197/mês** (tabela R$ 297/mês) |
| Data de faturamento | Co-fundador escolhe dia **5, 15 ou 25**; **padrão dia 5** |
| Início da cobrança | **Após a entrega do MVP** (~30 dias do fechamento), nunca na assinatura |
| Contrapartida | Uso real + feedback sincero + depoimento em vídeo |
| Valor concedido no 1º ano | **R$ 2.700** (setup R$ 1.500 + 12 × R$ 100 de desconto) |
| Módulos-lego | Modelo **default + vertical** (ex.: `CRM` → `CRM_OTICA`). Vertical só se replicável para 2–3 negócios do nicho. |
| Robô de atendimento WhatsApp | Entregue até o dia do pagamento |
| Prova social | Depoimento/feedback dos co-fundadores |
| **Onda 2 (+4)** | Abre em **jan/2027**, após **pausa de productização** que deve cortar o tempo de entrega pela metade |

> **Princípio da Fase 1:** prova vale mais que receita. Um co-fundador a R$ 197/mês com depoimento em vídeo vale mais que um cliente a R$ 297/mês sem case.

### Lead prioritário — Ótica
| Campo | Descrição |
|-------|-----------|
| **Ramo** | Ótica |
| **Relação** | Cliente da gráfica do fundador |
| **Status (07/09/2026)** | 🔴 **Não confirmado.** O dono teve um problema pessoal. A visita não aconteceu e ainda não vai acontecer — **há tempo de se preparar**. |
| **Dores principais** | • Não consegue novos clientes  <br>• WhatsApp no vácuo / demora a responder  <br>• Não controla contas  <br>• Demora para agendar  <br>• Não lembra cliente do agendamento sem ser manual |
| **Necessidade expressa** | CRM + conexão com redes sociais e WhatsApp |
| **Módulos da demonstração** | **Atendimento (MEL/WhatsApp)** + **CRM** + **Agenda** + **Financeiro/Vendas** (pedido contabilizado) |
| **Funil de entrada** | Landing Page com CTA para **consultoria gratuita com a MEL** no WhatsApp **(11) 95817-4767**. A MEL aplica SPIN Selling para identificar a dor do lead. A conversa é gravada no Supabase via webhook/n8n. |
| **Natureza da demonstração** | Operação real da **HQ Gráfica** ou da **Doceê** rodando dentro da Base UNIQ — não um protótipo de fachada. |
| **Objetivo** | Fechar como co-fundador **após** a validação interna de ~3 semanas. Data a marcar quando o lead estiver disponível. |
| **Valor proposto** | **Tabela:** setup R$ 1.500 + R$ 297/mês. **Condição co-fundador:** setup **isento** + **R$ 197/mês** → valor concedido no 1º ano: **R$ 2.700**. Data de faturamento à escolha (5, 15 ou 25; padrão 5). Fallback **R$ 107/mês** só como emergência. |
| **Infraestrutura técnica** | n8n rodando em número real para testes/UNIQ no WhatsApp **(11) 95817-4767**. Para atender novo cliente será necessário duplicar o fluxo e configurar um novo agente — **sob o guarda-chuva da UNIQ (VPS própria)**, o cliente não precisa de infraestrutura. O fluxo n8n aceita webhook e grava conversas no Supabase. |

---

### 🧪 Laboratório interno — FASE CENTRAL (não mais "Semana 0")

> **Decisão do fundador (07/09/2026):** usar ~3 semanas para validar na HQ Gráfica e na Doceê antes de visitar a ótica. O laboratório interno deixou de ser etapa acessória e virou **o coração da Fase 1**.

| Negócio | Papel no laboratório |
|---------|----------------------|
| **HQ Gráfica** | Primeiro teste interno do robô, CRM, agenda e pedido contabilizado na operação real de atendimento B2B |
| **Doceê** | Segundo teste interno, validando o modelo em outro ramo (doceria/alimentação) e provando que os módulos são reutilizáveis |
| **Ótica** | Primeiro co-fundador externo — **só depois** que o laboratório provar que funciona |

**Por que essa ordem é strategicamente correta:**
1. **Reduz risco de reputação.** O fundador não queima o lead da ótica com uma demonstração quebrada.
2. **Gera prova real, não promessa.** Na visita, ele mostra operação funcionando — não slides.
3. **Valida a reutilização dos módulos.** Se funcionar em gráfica E doceria, o "lego" está provado.
4. **Cria os primeiros cases internos.** HQ Gráfica e Doceê viram material de demonstração permanente.
5. **Respeita as 16h/semana.** Construir sem pressão de data de venda permite qualidade > velocidade.

---

### 🎬 Roteiro da demonstração (o que precisa funcionar de verdade)

> Definido pelo fundador em 07/09/2026. Esta é a **espinha dorsal** de todo o planejamento técnico.

**Abertura:** explicar a proposta da UNIQ e onde podemos ajudar o cliente.

**A cadeia de valor que precisa ser demonstrada ao vivo:**

```
1. Atendimento no WhatsApp
        ↓
2. A conversa aparece no CRM
        ↓
3. O pedido feito no WhatsApp aparece no CRM
        ↓
4. O pedido é contabilizado na Base UNIQ
        ↓
5. A partir daí: encaixar cada módulo no negócio do cliente
```

**Por que isso é impactante:** o dono do negócio vê a própria operação digitalizada de ponta a ponta, sem digitar nada. É a materialização da promessa *"Multiplique suas vendas sem aprender tecnologia."*

**Implicação técnica (caminho crítico):** essa cadeia exige a **integração n8n ↔ Supabase ↔ telas da Base UNIQ**, que hoje **não existe**. É exatamente essa ponte que as 3 semanas de laboratório precisam construir.

---

### Escopo do MVP demonstrável
| Entrega | Detalhe |
|---------|---------|
| Atendimento WhatsApp (MEL) | Fluxo n8n respondendo no número do negócio de laboratório (HQ Gráfica e/ou Doceê) |
| CRM | Conversa e pedido do WhatsApp aparecendo na tela de clientes/leads |
| Pedido contabilizado | Pedido registrado no módulo de Vendas/Financeiro da Base UNIQ |
| Agenda | Agendamentos com lembretes (dor específica da ótica) |
| Integração Supabase | Dados reais persistidos — **é o que transforma protótipo em produto** |
| Landing Page | Página com CTA para **consultoria gratuita com a MEL** no WhatsApp. A MEL aplica SPIN Selling para identificar a dor do lead. |

### Fora do escopo — Fase 1
- White label.
- Loja virtual/Marketplace como foco principal.
- Integrações complexas com ERPs/contabilidades.
- Tráfego pago e marketing em massa.

---

## 3️⃣ Checklist de Entregáveis

> Atualizado em 07/09/2026 após a decisão de estender a preparação para ~3 semanas com laboratório interno.

### Decisões estratégicas
| Item | Status | Data | Notas |
|------|--------|------|-------|
| Definir preço dos co-fundadores | ✅ **Decidido** | 07/09/2026 | **Ancoragem:** tabela R$ 1.500 setup + R$ 297/mês; co-fundador = setup isento + R$ 197/mês |
| Definir setup de tabela | ✅ **Decidido** | 07/09/2026 | **R$ 1.500 como hipótese** — mercado valida nas primeiras 3–5 propostas. **NÃO usar "de R$ 2.500 por R$ 1.500"** (CEO recomenda contra; aguardando validação) |
| Definir política de data de faturamento | ✅ **Decidido** | 07/09/2026 | Cliente escolhe dia 5, 15 ou 25; **padrão dia 5** |
| Definir Exit Safe | ✅ **Decidido** | 07/09/2026 | Saída do CLT fim de mar/2027; reserva p/ 18 meses; lançamento jul/2027 |
| Definir prazo de preparação antes da 1ª visita | ✅ **Decidido** | 07/09/2026 | ~3 semanas de laboratório interno (HQ Gráfica + Doceê) |
| Definir nº de co-fundadores da Fase 1 | ✅ **Decidido** | 07/09/2026 | **4**, em ondas de 4 + 4 com pausa de productização entre elas |
| Confirmar Identidade Mínima | ✅ **Decidido** | 07/09/2026 | **`DESIGN.md` (raiz) é a fonte oficial** |
| Definir arquitetura de módulos | ✅ **Decidido** | 07/09/2026 | **default + vertical** (ex.: `CRM` → `CRM_OTICA`) |
| Definir dogfooding | ✅ **Decidido** | 07/09/2026 | UNIQ opera a si mesma na Base UNIQ (CRM, Financeiro etc.) |
| Definir processo visual | ✅ **Decidido** | 07/09/2026 | Wireframe no repositório; **design real no OpenDesign** |
| Definir critério de seleção da Onda 1 | ✅ **Decidido** | 07/09/2026 | Formalizado — ver `tracking/CONTEXTO_PROJETO.md` → "Critério de seleção da Onda 1". Teste-chave: "o que eu construir para ele serve para mais 2 negócios de Suzano?" |
| Documentar funil de aquisição Landing+MEL | ✅ **Decidido** | 07/09/2026 | Desenhado pelo fundador — ver `tracking/CONTEXTO_PROJETO.md` → "Funil de Aquisição" |
| Definir canal do botão "Falar com a MEL" | ✅ **Decidido** | 07/09/2026 | **Híbrido** — chat na landing como entrada; MEL se apresenta no início; **WhatsApp capturado cedo**; conversa continua no WhatsApp |
| Proposta de valor "vender 2, prometer 1" | ✅ **Decidido** | 07/09/2026 | Pitch oficial: *"A UNIQ faz entrar mais dinheiro e mostra para onde o seu está saindo. Isso é margem."* Trilhas no backlog |
| Corrigir lacunas do `DESIGN.md` | 🔴 **Pendente** | — | Verde petróleo fora da tabela; Voice & Tone e Imagery vazios; seções duplicadas |
| Confirmar GitHub + Vercel configurados | 🔴 **Pendente** | — | Bloqueia o ciclo de validação mobile do fundador |
| Definir número de WhatsApp do laboratório | 🔴 **Pendente** | — | Define quantos fluxos n8n precisam ser duplicados |
| Avaliar LGPD p/ armazenamento de conversas | 🔴 **Pendente** | — | Risco jurídico ainda não avaliado |

### Laboratório interno (fase central)
| Item | Status | Notas |
|------|--------|-------|
| Inspecionar estado real do projeto e do Supabase | 🔴 Pendente | Fundador vai conectar o CEO ao banco e ao repositório |
| Integrar telas da Base UNIQ ↔ Supabase | 🔴 Pendente | **Caminho crítico** — hoje não há integração |
| Duplicar fluxo n8n para número de laboratório | 🔴 Pendente | HQ Gráfica e/ou Doceê |
| Fazer conversa do WhatsApp aparecer no CRM | 🔴 Pendente | Etapa 2 da cadeia de demonstração |
| Fazer pedido do WhatsApp aparecer no CRM | 🔴 Pendente | Etapa 3 da cadeia de demonstração |
| Fazer pedido ser contabilizado na Base UNIQ | 🔴 Pendente | Etapa 4 da cadeia de demonstração |
| Validar operação real na HQ Gráfica | 🔴 Pendente | Fundador usa de verdade |
| Validar operação real na Doceê | 🔴 Pendente | Esposa usa de verdade — prova reutilização dos módulos |
| Ativar dogfooding: UNIQ operando a si mesma | 🔴 Pendente | CRM + Financeiro da própria UNIQ, incluindo as datas de faturamento dos co-fundadores |
| Registrar aprendizados do laboratório | 🔴 Pendente | Vira material de demonstração |

### Co-fundadores
| Item | Status | Notas |
|------|--------|-------|
| Reagendar visita à ótica | 🔴 Pendente | Lead teve problema pessoal; aguardar momento |
| Mapear dores do co-fundador 1 | 🔴 Pendente | Já há dores preliminares documentadas |
| Construir módulo-lego 1 | 🔴 Pendente | Baseado na dor do co-fundador 1 |
| Mapear dores do co-fundador 2 | 🔴 Pendente | — |
| Construir módulo-lego 2 | 🔴 Pendente | — |
| Mapear dores do co-fundador 3 | 🔴 Pendente | — |
| Construir módulo-lego 3 | 🔴 Pendente | — |
| Mapear dores do co-fundador 4 | 🔴 Pendente | — |
| Configurar robô de atendimento WhatsApp do cliente | 🔴 Pendente | Duplicar fluxo n8n + novo agente |
| Definir data de faturamento com cada co-fundador | 🔴 Pendente | Dia 5, 15 ou 25 |
| Coletar depoimentos/feedback | 🔴 Pendente | Após 30 dias de uso |

---

## ❓ Perguntas pendentes da descoberta

- [x] Tamanho médio de faturamento do cliente ideal (R$ 30–100k / 100–500k / +500k)? **R: R$ 5.000 a R$ 10.000/mês; aquisição inicial entre clientes da gráfica.**
- [x] Modelo de entrega futuro: DFY, white label ou híbrido? **R: DFY — a UNIQ configura a Base UNIQ no modelo SaaS (sem instalação física).**
- [x] Objetivo imediato: primeira proposta, primeiro cliente, MVP ou parceria? **R: fechar o primeiro cliente/co-fundador no sábado seguinte (7 dias), com MVP demonstrável.**
- [x] Diferencial adicional além do já documentado? **R: diferenciais já documentados em CONTEXTO_UNIQ.md e CEO.md serão consolidados na proposta (MEL, DFY, proximidade local, método SDD, laboratório próprio).**
- [x] Restrições concretas (tempo, dinheiro, tecnologia)? **R: respondidas em 07/09/2026 — ver seção "Restrições concretas — RESPONDIDAS" abaixo.**

## ✅ Restrições concretas — RESPONDIDAS (07/09/2026)

| Restrição | Realidade declarada pelo fundador |
|-----------|-----------------------------------|
| **Tempo** | **16h/semana dedicadas full ao projeto.** Durante o dia, mesmo no CLT, há tempo para acessar o OpenCode pelo celular (via túnel) e fazer alinhamentos, planejamentos e pedir criações aos agentes. À noite, acesso total ao computador. |
| **Dinheiro** | O Exit Safe já está planejado com a renda do CLT: reserva para **18 meses sem retirar dinheiro da UNIQ**. Saída do CLT no fim de março/2027; lançamento oficial em julho/2027. |
| **Tecnologia — Supabase** | Existe um **modelo pronto** no Supabase, herdado de um protótipo de versão antiga do UNIQ. |
| **Tecnologia — Telas** | **Várias telas funcionais** já criadas com ajuda do OpenDesign, bastante avançadas. |
| **Tecnologia — Integração** | 🔴 **Telas e banco ainda NÃO estão integrados.** Esse é o gargalo central. |
| **Tecnologia — n8n** | Funciona **apenas para o número da UNIQ**. Para incluir número de cliente é preciso **duplicar o fluxo e configurar um novo agente**. |
| **Tecnologia — Hospedagem** | O n8n fica **sob o guarda-chuva da UNIQ** (VPS própria). O cliente não precisa se preocupar com infraestrutura — isso reforça o DFY. |
| **Pessoal** | Fundador + esposa (Doceê). Agentes de IA executam a construção. |
| **Processo de validação** | Para validar pelo celular, o projeto precisa estar no **GitHub** ligado à **Vercel** — cada commit publicado gera preview acessível. |
| **Legal/LGPD** | ⚠️ Ainda não avaliado. Armazenar conversas e dados de clientes exige atenção. |

> **Leitura do CEO:** o projeto **não parte do zero** — há caminho iniciado e avançado. A restrição real não é "falta de telas" nem "falta de banco": é a **ponte entre os dois**. Todo o planejamento das próximas semanas deve girar em torno de construir essa ponte.

---

## 📅 Próximo passo

O plano de 7 dias (`doc/PLANO_SEMANA_1_UNIQ_EMPRESAS.md`) foi **superado** pela decisão de 07/09/2026 de estender a preparação para ~3 semanas com laboratório interno.

**Sequência decidida:**
1. 🔌 **Conectar o CEO ao estado real** — banco de dados (Supabase) e repositório do projeto, para inspecionar o que de fato existe.
2. 🗺️ **Diagnóstico técnico** — o que está pronto, o que falta para a cadeia de demonstração funcionar.
3. 📅 **Novo plano de 3 semanas** — substituir o `PLANO_SEMANA_1` por um plano semanal step-by-step baseado no estado real.
4. 📋 **Criar `tracking/TRACKING.md`** — só depois do diagnóstico, para que reflita a realidade e não suposições.

> ⚠️ **Bloqueio atual:** o fundador pediu explicitamente para **não criar o TRACKING.md ainda**, porque antes vai conectar o CEO ao banco e ao projeto para que a leitura reflita o estado real.

---

*Documento vivo — atualizado conforme a descoberta avança.*
