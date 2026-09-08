# 📅 Plano de Execução — Semana 1

> ## ⛔ PLANO SUPERADO — NÃO EXECUTAR
>
> **Decisão do fundador em 07/09/2026:** uma semana é pouco tempo e o risco de chegar à visita sem algo digno para apresentar é alto demais.
>
> **O que mudou:**
> - A preparação passou de **7 dias para ~3 semanas**.
> - O **laboratório interno (HQ Gráfica + Doceê)** deixou de ser "Semana 0" e virou a **fase central** de validação.
> - A **visita à ótica foi adiada** — o lead não está confirmado (o dono teve um problema pessoal).
> - O **preço foi decidido**: setup R$ 0 + R$ 197/mês, fallback R$ 107/mês.
> - O **SDD é obrigatório** em todas as etapas (este plano não alocava tempo para PRD/SPEC/WIRE).
>
> **Este documento é mantido apenas como registro histórico.** O novo plano será construído após o CEO inspecionar o estado real do projeto e do Supabase.
>
> 📌 Ver: `doc/ESCOPO_PROJETO_UNIQ_EMPRESAS.md` (atualizado em 07/09/2026)

---

## 🎯 Objetivo da semana

Fechar o primeiro co-fundador do UNIQ Empresas (ótica) no sábado, apresentando um **MVP demonstrável** com:
- Robô de atendimento (protótipo)
- CRM
- Agenda
- Integração com Supabase (dados reais)
- Landing Page com CTA para consultoria gratuita com a MEL

> **Regra:** esta semana é para **preparar a demonstração e a proposta**, não para entregar o produto final. O produto real será construído nos 30 dias após o fechamento.

---

## ⏱️ Capacidade disponível

- **Total:** ~16h/semana
- **Distribuição sugerida:** 2h30–3h por dia (segunda a sexta) + sábado dedicado ao fechamento
- **Domingo:** planejamento e alinhamento (1h)

---

## 👤 Papéis

| Papel | Quem | O que faz |
|-------|------|-----------|
| **Fundador (você)** | Estratégia, vendas, decisões, testes internos na HQ Gráfica/Doceê | Reuniões, validação, pitch |
| **OpenCode/OpenDesign** | Construção técnica do protótipo | Telas, dados, landing page, ajustes visuais |
| **MEL (n8n)** | Qualificação automática de leads | Entrevista SPIN Selling no WhatsApp (11) 95817-4767 |

> **Princípio:** você não constrói telas — você direciona, testa e valida. A construção fica para os agentes.

---

## 🗓️ Cronograma detalhado

### 🟢 Domingo — Alinhamento e direção (1h)

| Tarefa | Tempo | Quem | Entregável | Status |
|--------|-------|------|------------|--------|
| Revisar escopo do MVP | 20 min | Fundador | `ESCOPO_PROJETO_UNIQ_EMPRESAS.md` validado | ✅ Feito |
| Confirmar lead da ótica | 15 min | Fundador | Nome, contato e horário do encontro de sábado | 🟡 A confirmar |
| Alinhar teste interno na HQ Gráfica e Doceê | 15 min | Fundador + esposa | Ambos disponíveis para testar o MVP | 🟡 A confirmar |
| Listar 3 dores principais da ótica | 10 min | Fundador | Nota rápida com dores priorizadas | 🔴 Pendente |

**Critério de sucesso do dia:** Lead confirmado para sábado + testadores internos alinhados.

---

### 🔵 Segunda-feira — Base técnica (2h30)

| # | Tarefa | Tempo | Quem | Entregável | Por quê |
|---|--------|-------|------|------------|---------|
| 1 | Verificar estado do Supabase na Base UNIQ | 30 min | OpenCode | Diagnóstico: tabelas existentes vs. necessárias | Dados reais no protótipo |
| 2 | Verificar estado do n8n e fluxo da MEL | 30 min | Fundador + OpenCode | Lista de ajustes necessários para demonstração | Robô de atendimento |
| 3 | Mapear telas da Base UNIQ usáveis no MVP | 30 min | OpenCode | Lista de telas: CRM, Agenda, MEL, Dashboard | Economia de tempo |
| 4 | Definir schema de dados da ótica no Supabase | 30 min | OpenCode | Tabelas: clientes, agendamentos, mensagens, leads | Base para dados reais |
| 5 | Criar estrutura inicial de dados | 30 min | OpenCode | Tabelas criadas no Supabase | Demonstração com dados reais |

**Entrega do dia:** Base técnica mapeada e estrutura de dados da ótica criada.

**Dependências críticas:** sem o Supabase configurado, terça fica comprometida. Plano B: localStorage realista.

---

### 🟡 Terça-feira — CRM + Agenda + Teste interno (2h30)

| # | Tarefa | Tempo | Quem | Entregável | Por quê |
|---|--------|-------|------|------------|---------|
| 1 | Popular CRM com dados de exemplo | 45 min | OpenCode | 5–10 clientes/leads por negócio (ótica, HQ Gráfica, Doceê) | Mostrar controle de atendimento |
| 2 | Criar agendamentos de exemplo | 30 min | OpenCode | Consultas de vista, entregas de gráfica, encomendas de doces | Resolver dor da agenda manual |
| 3 | Ajustar visual por negócio | 30 min | OpenCode | Nomes/logos da ótica, HQ Gráfica e Doceê nas telas | Personalização |
| 4 | Testar internamente na HQ Gráfica e Doceê | 30 min | Fundador + esposa | Feedback escrito de 3 pontos fortes e 3 falhas | Validar operação real |
| 5 | Ajustes rápidos do dia | 15 min | OpenCode | Correções visuais/dados | MVP polido |

**Entrega do dia:** CRM e Agenda demonstráveis com dados dos 3 negócios + feedback interno.

**Critério de sucesso:** fundador e esposa conseguem explicar para um terceiro o que estão vendo na tela.

---

### 🟠 Quarta-feira — Robô de atendimento + integração (2h30)

| # | Tarefa | Tempo | Quem | Entregável | Por quê |
|---|--------|-------|------|------------|---------|
| 1 | Decidir abordagem do robô na demonstração | 15 min | Fundador | Decisão: simulação visual vs. fluxo n8n real | Define escopo do dia |
| 2a | Se simulação: montar tela/fluxo de demonstração | 1h | OpenCode | Tela mostrando MEL respondendo no WhatsApp | Lead entende o valor |
| 2b | Se n8n: duplicar/adaptar fluxo para teste | 1h | OpenCode | Fluxo pronto para responder no número de teste | Demonstração mais real |
| 3 | Conectar dados do robô ao CRM/Agenda | 45 min | OpenCode | Lead que entra vira cliente/agendamento | Mostrar integração |
| 4 | Testar robô nos números da HQ Gráfica e Doceê | 30 min | Fundador + esposa | 2–3 mensagens trocadas e registradas | Prova de uso real |
| 5 | Ajustes rápidos do dia | 15 min | OpenCode | Correções | Robô demonstrável |

**Entrega do dia:** Robô de atendimento demonstrável, com testes internos.

**Decisão do dia:** se o n8n não estiver pronto para novo número até quarta à noite, usar simulação visual sem culpa. A promessa é entrega real em 30 dias.

---

### 🔴 Quinta-feira — Presença digital + Material comercial (2h30)

| # | Tarefa | Tempo | Quem | Entregável | Por quê |
|---|--------|-------|------|------------|---------|
| 1 | Criar Landing Page da oferta UNIQ Empresas | 1h | OpenCode | Página com CTA "Consultoria gratuita com a MEL" → WhatsApp (11) 95817-4767 | Captar e qualificar leads |
| 2 | Criar perfil no Instagram da UNIQ | 30 min | Fundador | @uniq.empresas com bio + link para WhatsApp | Presença digital mínima |
| 3 | Criar 1º post do Instagram | 15 min | Fundador | Post simples de chegada em Suzano | Presença inicial |
| 4 | Escrever proposta comercial | 30 min | OpenCode/Fundador | Texto com: entrega, preço, prazo, contrapartida | Fechar no sábado |
| 5 | Preparar termo de co-fundador | 15 min | OpenCode/Fundador | Documento simples: setup grátis, R$ 197/mês, depoimento | Segurança jurídica |

**Entrega do dia:** Landing Page, Instagram, proposta e termo prontos.

**Critério de sucesso:** você consegue mandar o link da Landing Page para alguém e essa pessoa entende a oferta em 30 segundos.

---

### 🟣 Sexta-feira — Script + Ensaio (2h30)

| # | Tarefa | Tempo | Quem | Entregável | Por quê |
|---|--------|-------|------|------------|---------|
| 1 | Escrever script de demonstração | 45 min | Fundador + OpenCode | Roteiro de 10–15 min com abertura, demonstração, proposta e fechamento | Confiança no pitch |
| 2 | Ensaiar demonstração completa | 45 min | Fundador | 3 rodadas do pitch gravadas ou verbalizadas | Fluidez no sábado |
| 3 | Testar telas no dispositivo do sábado | 30 min | Fundador | Notebook/tablet funcionando sem travamentos | Evitar imprevistos |
| 4 | Ajustar falhas visuais ou de dados | 30 min | OpenCode | MVP polido | Credibilidade |
| 5 | Confirmar horário e local com o lead | 10 min | Fundador | Mensagem enviada, lead confirmado | Compromisso fechado |

**Entrega do dia:** Demonstração ensaida, telas prontas e lead confirmado.

**Critério de sucesso:** você consegue fazer a demonstração sozinho, sem olhar para as anotações.

---

### ⚫ Sábado — Fechamento (2–3h)

| # | Tarefa | Tempo | Quem | Entregável | Por quê |
|---|--------|-------|------|------------|---------|
| 1 | Reunião com o lead da ótica | 30 min | Fundador | Apresentação do protótipo | Converter em co-fundador |
| 2 | Aplicar script de demonstração | 15 min | Fundador | Lead entende a proposta | Fechamento |
| 3 | Usar cases internos como prova social | 5 min | Fundador | Lead vê HQ Gráfica + Doceê usando | Reduzir insegurança |
| 4 | Apresentar proposta e preço (R$ 197/mês) | 10 min | Fundador | Acordo ou fallback para R$ 107/mês | Receita inicial |
| 5 | Assinar termo de co-fundador | 10 min | Fundador + lead | Documento assinado | Segurança jurídica |
| 6 | Marcar data de início dos 30 dias | 5 min | Fundador + lead | Data combinada | Início da entrega real |

**Entrega do dia:** Co-fundador fechado (sim ou não).

**Critério de sucesso:** lead diz sim ou dá uma objeção clara que você pode responder.

---

## 📦 Entregáveis da semana

1. MVP demonstrável (Robô + CRM + Agenda)
2. Dados da ótica, HQ Gráfica e Doceê no Supabase
3. Landing Page com CTA para consultoria gratuita com a MEL
4. Perfil no Instagram da UNIQ (com 1º post)
5. Proposta comercial
6. Termo de co-fundador
7. Script de demonstração

---

## ⚠️ Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| n8n não funciona para novo número a tempo | Média | Alto | Usar simulação/visual no protótipo; prometer integração real nos 30 dias |
| Lead acha R$ 197 caro | Média | Médio | Fallback para R$ 107/mês; enfatizar setup grátis |
| Lead quer produto pronto | Baixa | Alto | Explicar modelo co-fundador: protótipo agora, evolução em 30 dias |
| Supabase não está configurado | Baixa | Alto | Usar localStorage/mock realista como plano B |
| Fundador sem tempo na semana | Média | Alto | Reduzir escopo: focar apenas em CRM + Agenda + proposta |
| Lead desmarca sábado | Baixa | Médio | Ter 2º lead da gráfica como reserva |

---

## 🆘 Plano de contingência semanal

Se algum dia atrasar, a ordem de corte é:
1. **Cortar primeiro:** Instagram (não é essencial para o fechamento).
2. **Cortar depois:** Landing Page visual complexa (substituir por texto no WhatsApp).
3. **Nunca cortar:** CRM + Agenda demonstráveis + proposta + termo.

---

## ✅ Checklist final (antes de sair no sábado)

- [ ] Telas de CRM e Agenda abrindo com dados da ótica
- [ ] Robô de atendimento demonstrável (simulação ou n8n)
- [ ] Landing Page acessível com CTA para WhatsApp da MEL
- [ ] Perfil no Instagram da UNIQ criado
- [ ] Proposta comercial no celular/notebook
- [ ] Termo de co-fundador pronto
- [ ] Script de demonstração decorado
- [ ] Notebook/tablet carregado
- [ ] Horário e local confirmados com o lead
- [ ] 2º lead reserva identificado (opcional)

---

## 📊 Métricas de sucesso da semana

| Métrica | Meta |
|---------|------|
| MVP demonstrável pronto | 100% |
| Lead da ótica confirmado para sábado | Sim |
| Teste interno na HQ Gráfica e Doceê | Sim |
| Landing Page publicada | Sim |
| Co-fundador fechado no sábado | Sim |
| Preço fechado | R$ 197/mês (ou R$ 107/mês fallback) |

---

*Plano criado para visualização no Milanote.*
