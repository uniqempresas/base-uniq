# Dashboard Inicial - Documentação UI

> **Produto:** UNIQ Empresas - Plataforma SaaS modular  
> **Público:** Empreendedores na correria (MEI/Micro)  
> **Tom de Voz:** Simples, acolhedor, profissional, empoderador  
> **Regra de Ouro:** Usuário deve entender o estado do negócio em 5 segundos  
> **Documento Segue:** [Matriz de Documentação UI](./MATRIZ_DOCUMENTACAO_UI.md)

---

## 📱 Tela: Dashboard Inicial

### 1. Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Dashboard Inicial |
| **Rota/URL** | `/dashboard` |
| **Objetivo Principal** | Visão geral do negócio no primeiro acesso - entender estado em 5 segundos |
| **Permissões de Acesso** | Usuários autenticados (proprietário e colaboradores da empresa) |
| **Módulo/Pai** | Núcleo da plataforma (Home) |
| **Prioridade MVP** | ✅ Essencial |

### 2. Contexto do Usuário

#### 2.1 Quem Usa Esta Tela
- **Perfil:** Empreendedor dono do negócio (MEI/Micro)
- **Conhecimento técnico:** Baixo - médio
- **Contexto de uso:** 
  - Primeiro acesso do dia (manhã)
  - Consultas rápidas entre atendimentos
  - Verificação de vendas/resultados
  - Acesso principalmente via celular

#### 2.2 Por Que Esta Tela Existe
- **Problema que resolve:** Ansiedade do empreendedor sobre "como está meu negócio hoje?"
- **Valor entregue:** Visão consolidada do negócio em um único lugar
- **Frequência de uso:** Múltiplas vezes ao dia (principal tela de entrada)

#### 2.3 User Stories Relacionadas
- "Como empreendedor, quero ver como está meu negócio hoje em um piscar de olhos"
- "Como empreendedor, quero saber o que preciso fazer hoje"
- "Como empreendedor, quero receber dicas da IA para vender mais"
- "Como empreendedor, quero acessar rapidamente qualquer módulo do sistema"
- "Como empreendedor novo, quero saber quais são os próximos passos para configurar tudo"

### 3. Elementos Obrigatórios (O Que DEVE Ter)

#### 3.1 Estrutura de Navegação

**Layout Geral da Aplicação:**

A tela segue o padrão de navegação em duas camadas:

**1. Sidebar Principal (Escura)**
- **Posição:** Fixa à esquerda
- **Função:** Navegação entre módulos principais
- **Itens:**
  - Dashboard (Home)
  - CRM (Clientes)
  - Vendas (PDV + Loja)
  - Estoque (Produtos)
  - Agenda (Compromissos)
  - Financeiro (Contas)
  - Configurações
- **Comportamento:**
  - Item ativo destacado
  - Ícones + labels
  - Pode ser colapsada (mobile)
  - Cor: tom escuro (navy ou charcoal)

**2. Barra de Contexto (Acima do conteúdo)**
- **Posição:** Logo abaixo do header principal
- **Função:** Navegação dentro do módulo atual
- **Comportamento:**
  - Muda dinamicamente conforme módulo selecionado na sidebar
  - Mostra apenas opções relevantes ao contexto atual
- **Exemplos por módulo:**
  - **Se no Dashboard:** Home | Resumo | Configurar Widgets
  - **Se no CRM:** Dashboard CRM | Clientes | Pipeline | Relatórios | Configurações
  - **Se no Estoque:** Dashboard Estoque | Produtos | Movimentações | Categorias | Etiquetas
  - **Se em Configurações:** Perfil | Empresa | Integrações | Usuários | Planos

**3. Área de Conteúdo Principal**
- Ocupando o restante da tela
- Scroll próprio quando necessário

#### 3.2 Dados a Exibir

**1. Saudação Personalizada**
- [ ] Mensagem de acordo com horário: "Bom dia, [Nome]!" / "Boa tarde!" / "Boa noite!"
- [ ] Data atual por extenso (ex: "Terça-feira, 31 de Março")

**2. KPIs Principais (Máximo 3)**
- [ ] **Faturamento hoje:** Valor em reais (R$)
  - Comparativo com ontem (percentual e indicador de tendência)
  - Formato: "R$ 1.250,00 ↑ 20% vs ontem"
- [ ] **Vendas hoje:** Quantidade de vendas
  - Comparativo com ontem
  - Formato: "12 vendas ↑ 50% vs ontem"
- [ ] **Clientes novos hoje:** Quantidade de novos cadastros
  - Comparativo com ontem
  - Formato: "3 clientes novos"

**3. Contexto/Tendência**
- [ ] **Gráfico de vendas:** Últimos 7 dias (semanal)
  - Eixo X: Dias da semana
  - Eixo Y: Valor faturado
  - Destaque para hoje
- [ ] **Meta diária/semanal:** Progresso visual da meta
  - Formato: "R$ 1.250 / R$ 2.000 (62%)"
  - Barra de progresso visual

**4. Ações Rápidas (To-Do / O Que Precisa de Atenção)**
- [ ] Título: "O que precisa de atenção hoje"
- [ ] Lista de tarefas prioritárias com badges indicando tipo:
  - Follow-ups pendentes (CRM)
  - Agendamentos do dia (Agenda)
  - Produtos com estoque baixo (Estoque)
  - Contas a pagar/receber atrasadas (Financeiro)
  - Mensagens não respondidas (WhatsApp)
- [ ] Número de itens pendentes (badge)

**5. Insight do MEL (IA Proativa)**
- [ ] Card destacado com mensagem contextual da IA
- [ ] Ícone/avatar do MEL
- [ ] Exemplos de mensagens:
  - "Você vendeu 20% mais que ontem! 🎉"
  - "Não se esqueça de ligar para o João - follow-up às 14h"
  - "Camiseta Preta está acabando (2 unidades)"
  - "Você está a R$ 500 da sua meta semanal!"
- [ ] Call-to-action contextual (botão secundário relacionado ao insight)

**6. Acesso Rápido aos Módulos**
- [ ] Cards/ícones para módulos ativados:
  - CRM (clientes)
  - Vendas (PDV/Loja)
  - Estoque
  - Agenda
  - Financeiro
  - Configurações
- [ ] Indicador de novidades/alertas por módulo (badge)

#### 3.2 Funcionalidades Essenciais
- [ ] Atualização automática dos dados (real-time ou intervalo curto)
- [ ] Pull-to-refresh (mobile) para atualizar dados
- [ ] Acesso direto a relatórios detalhados de cada KPI
- [ ] Registro de venda rápida (atalho)
- [ ] Adicionar cliente rápido (atalho)

### 4. Elementos Opcionais (O Que PODE Ter)

#### 4.1 Funcionalidades Adicionais
- [ ] **Notificações:** Bell icon com badge de notificações não lidas
- [ ] **Perfil/Menu:** Acesso rápido a configurações de conta
- [ ] **Calendário mini:** Visão rápida dos compromissos do dia
- [ ] **Clima/Previsão:** Informação local (relevante para lojas físicas)
- [ ] **Aniversariantes do dia:** Clientes fazendo aniversário (oportunidade de marketing)

#### 4.2 Dados Secundários
- [ ] **Ticket médio hoje:** Valor médio por venda
- [ ] **Top produtos do dia:** Produtos mais vendidos
- [ ] **Comparativo semanal:** Esta semana vs semana anterior
- [ ] **Estatísticas rápidas:** Total de clientes, produtos cadastrados, etc.

### 5. Ações Possíveis

#### 5.1 Ações Primárias
1. **Ver detalhes de métricas:**
   - **Gatilho:** Clicar em qualquer KPI principal
   - **Resultado:** Navega para relatório detalhado daquele indicador
   - **Confirmação:** Não necessária

2. **Registrar venda rápida:**
   - **Gatilho:** Botão flutuante ou card de ação rápida
   - **Resultado:** Abre modal ou navega para tela de PDV simplificada
   - **Confirmação:** Não necessária

3. **Adicionar cliente:**
   - **Gatilho:** Botão/card de ação rápida
   - **Resultado:** Abre modal de cadastro rápido
   - **Confirmação:** Não necessária

4. **Acessar módulo:**
   - **Gatilho:** Clicar no card/ícone do módulo
   - **Resultado:** Navegação para o módulo selecionado
   - **Confirmação:** Não necessária

#### 5.2 Ações Secundárias
1. **Ver todos os alertas:** Lista completa de tarefas pendentes
2. **Compartilhar resultado:** Enviar resumo do dia via WhatsApp
3. **Configurar meta:** Ajustar metas diárias/semanais
4. **Ver notificações:** Centro de notificações do sistema

#### 5.3 Ações de Destruição
*Não aplicável nesta tela*

### 6. Estados da UI

#### 6.1 Empty State - Primeiro Acesso (Novo Cliente)
- **Quando aparece:** Usuário logou pela primeira vez, empresa recém-criada
- **Título:** "Bem-vindo à UNIQ, [Nome]! 🎉"
- **Descrição:** "Vamos configurar sua loja e começar a vender?"
- **Checklist de Onboarding:**
  - [ ] Cadastrar primeiro produto
  - [ ] Personalizar loja virtual
  - [ ] Conectar WhatsApp Business
  - [ ] Configurar forma de pagamento
  - [ ] Compartilhar loja
- **Progresso de ativação:** "2 de 5 passos concluídos"
- **CTA Primário:** "Começar configuração"
- **Dica do MEL:** "Posso fazer isso por você! Quer que eu configure tudo em 10 minutos?"

#### 6.2 Empty State - Sem Vendas Ainda
- **Quando aparece:** Empresa configurada mas sem movimentação
- **Título:** "Pronto para começar a vender?"
- **Descrição:** "Sua loja está no ar! Que tal fazer a primeira venda agora?"
- **CTA Primário:** "Cadastrar primeiro produto"
- **CTA Secundário:** "Ver tutorial de primeiro produto"
- **Dica do MEL:** "Compartilhe sua loja no WhatsApp e Instagram!"

#### 6.3 Empty State - Sem Tarefas Pendentes
- **Quando aparece:** Não há alertas ou tarefas para hoje
- **Título:** "Tudo em dia! ✅"
- **Descrição:** "Você não tem tarefas pendentes. Aproveite para prospectar novos clientes!"
- **CTA:** "Ver relatório de vendas" ou "Cadastrar novo cliente"

#### 6.4 Loading State
- **Quando aparece:** Carregando dados iniciais
- **Tipo:** Skeleton de cards e elementos
- **Mensagem:** "Carregando seus dados..."
- **Duração esperada:** < 3 segundos

#### 6.5 Error State - Falha ao Carregar Dados
- **Quando aparece:** Erro de conexão ou API
- **Título:** "Não foi possível carregar seus dados"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"
- **Fallback:** Mostrar últimos dados em cache (se disponível) com indicador de desatualizado

#### 6.6 Success State
- **Quando aparece:** Após ações rápidas (ex: registrar venda)
- **Feedback:** Toast temporário
- **Mensagens:**
  - "Venda registrada!"
  - "Cliente adicionado"
  - "Meta atualizada"

### 7. Integrações

#### 7.1 Estrutura de Navegação

**Sidebar Principal (Navegação Global):**
A sidebar fixa à esquerda permite alternar entre módulos principais. Quando o usuário muda de módulo, a **Barra de Contexto** atualiza automaticamente para mostrar apenas as opções relevantes daquele módulo.

**Barra de Contexto (Navegação do Módulo):**
Localizada acima do conteúdo principal, mostra navegação específica do módulo atualmente selecionado na sidebar.

**Fluxo de Navegação:**
1. Usuário clica em módulo na sidebar (ex: "CRM")
2. Sistema carrega a página do módulo
3. Barra de contexto atualiza com opções do CRM
4. Conteúdo principal mostra a tela default do módulo

#### 7.2 Com Outras Telas
- Navega para: **CRM** (`/crm/dashboard`) - Via sidebar ou card de módulo
- Navega para: **Vendas** (`/vendas/pdv`) - Via sidebar ou card de módulo
- Navega para: **Estoque** (`/estoque/dashboard`) - Via sidebar ou card de módulo
- Navega para: **Agenda** (`/agenda`) - Via sidebar ou card de módulo
- Navega para: **Financeiro** (`/financeiro/dashboard`) - Via sidebar ou card de módulo
- Navega para: **Configurações** (`/configuracoes/perfil`) - Via sidebar

#### 7.2 Com Outros Módulos

| Módulo | Integração | Dados Exibidos |
|--------|------------|----------------|
| **CRM** | Pipeline e clientes | Follow-ups pendentes, clientes novos, aniversariantes |
| **Vendas** | PDV e Loja Virtual | Faturamento diário, quantidade de vendas, ticket médio |
| **Estoque** | Produtos | Alertas de estoque baixo, produtos mais vendidos |
| **Financeiro** | Contas | Contas a pagar/receber vencendo hoje |
| **Agenda** | Compromissos | Agendamentos do dia, follow-ups agendados |
| **MEL (IA)** | Advisor insights | Mensagens proativas, sugestões, alertas inteligentes |
| **WhatsApp** | Mensagens | Mensagens não lidas, resumo de conversas |

#### 7.3 APIs/Serviços
- **API Dashboard:** Dados consolidados de todas as áreas
- **API MEL:** Insights proativos personalizados
- **Supabase Realtime:** Atualizações em tempo real de vendas
- **Analytics:** Tracking de uso e comportamento

### 8. Regras de Negócio

#### 8.1 Regras de Dados
1. **Frequência de atualização:** KPIs principais devem refletir dados em tempo real (máximo 5 min de delay)
2. **Período de comparação:** Comparativos sempre contra "ontem" para métricas diárias
3. **Moeda:** Sempre exibir em Real (R$) com formatação brasileira
4. **Horário comercial:** Dashboard considera dia comercial (06h às 22h) para métricas

#### 8.2 Regras do MEL (IA)
1. **Personalização:** Insights baseados no perfil e comportamento do usuário
2. **Priorização:** Alertas de estoque baixo e follow-ups têm prioridade
3. **Tom:** Mensagens devem ser empoderadoras e acolhedoras
4. **Frequência:** Máximo 1 insight novo por acesso (não sobrecarregar)

#### 8.3 Regras de Onboarding
1. **Detecção automática:** Identificar se é primeiro acesso (Day 0)
2. **Progresso persistente:** Salvar checklist de onboarding no localStorage
3. **MEL assistido:** Oferecer ajuda do MEL para configurar (done-for-you)
4. **Comemoração:** Feedback positivo ao completar cada passo

#### 8.4 Regras de Metas
1. **Meta padrão:** Se usuário não definiu, assumir meta baseada em histórico ou segmento
2. **Ajuste fácil:** Permitir alteração de meta diretamente do dashboard
3. **Períodos:** Suportar metas diárias e semanais

### 9. Notas e Considerações

#### 9.1 Mobile First
- **Prioridade máxima:** 80% dos acessos serão via celular
- **Scroll estratégico:** Informações mais importantes acima da dobra
- **Touch friendly:** Botões e cards com área de toque adequada
- **Performance:** Carregamento rápido essencial (conexões móveis variáveis)

#### 9.2 Acessibilidade
- Contraste adequado para leitura em ambientes externos
- Suporte a leitores de tela
- Tamanhos de fonte legíveis (sem necessidade de zoom)

#### 9.3 Personalização Futura (Pós-MVP)
- **Widgets configuráveis:** Usuário escolhe quais KPIs ver
- **Layout personalizável:** Ordem dos blocos ajustável
- **Tema:** Dark mode (opção)
- **Atalhos:** Usuário define ações rápidas favoritas

#### 9.4 Analytics e Métricas
- Tracking de cliques em cada seção
- Tempo médio na tela
- Taxa de conversão de CTAs
- Uso de ações rápidas vs navegação completa

#### 9.5 Considerações Técnicas
- Implementar cache local para dados (offline-first)
- Atualização otimista para ações rápidas
- Paginação ou lazy loading para lista de tarefas se muito longa
- Otimização de queries para carregamento rápido (< 3s)

---

## 📊 Hierarquia Visual de Informações

```
PRIORIDADE 1 (Acima da dobra - visível imediatamente)
├── Saudação personalizada
├── KPIs principais (3 cards)
└── Ações rápidas mais usadas

PRIORIDADE 2 (Scroll mínimo)
├── Insight do MEL (IA)
├── Gráfico de tendência (7 dias)
└── Lista de tarefas pendentes

PRIORIDADE 3 (Scroll secundário)
├── Acesso aos módulos
├── Metas e progresso
└── Dados secundários

PRIORIDADE 4 (Opcional/Expansível)
├── Notificações
├── Calendário mini
└── Aniversariantes
```

---

## ✅ Checklist de Implementação

### Funcionalidades Essenciais
- [ ] Saudação com nome e data
- [ ] 3 KPIs principais com comparativo
- [ ] Lista de tarefas pendentes
- [ ] Insight do MEL
- [ ] Acesso aos 6 módulos principais

### Estados de UI
- [ ] Primeiro acesso (onboarding)
- [ ] Sem vendas (empty state amigável)
- [ ] Loading (skeleton)
- [ ] Error (falha de conexão)
- [ ] Sem tarefas (tudo em dia)

### Integrações
- [ ] Dados consolidados de todos os módulos
- [ ] MEL insights proativos
- [ ] Atualização em tempo real (ou próximo)

### Mobile
- [ ] Layout otimizado para celular
- [ ] Touch targets adequados
- [ ] Performance < 3s
- [ ] Pull-to-refresh

---

## 📋 Resumo para Figma Make

### Contexto do Produto
- **Produto:** UNIQ Empresas - Plataforma SaaS para pequenos empreendedores
- **Público:** MEI/Micro, não-técnicos, sempre com pressa
- **Tom:** Acolhedor, empoderador, simples

### O Que Esta Tela Faz
Dashboard é a **página inicial** do sistema - onde o empreendedor começa o dia. Deve responder em 5 segundos: "Como está meu negócio hoje?"

### Elementos Principais (sem especificar layout)
1. Saudação personalizada (bom dia + nome)
2. 3 KPIs numéricos principais (faturamento, vendas, clientes)
3. Gráfico de tendência (7 dias)
4. Lista de tarefas pendentes
5. Mensagem da IA (MEL) contextual
6. Cards de acesso aos módulos

### Estados Importantes
- **Primeiro acesso:** Checklist de onboarding amigável
- **Sem dados:** Encorajamento para começar
- **Sem tarefas:** Mensagem positiva

### Restrições
- Priorizar **mobile** (celular)
- **5 segundos** para entender tudo
- Sem complexidade - o empreendedor não tem tempo
- Dados devem ser **imediatos** (real-time preferido)

---

**Documento pronto para Figma Make:** Este documento segue a Matriz de Documentação UI da UNIQ e pode ser usado para gerar designs no Figma Make seguindo o princípio de separar "O QUE" (funcional) do "COMO" (visual).

**Próximo passo:** Usar o [Template de Prompt para Figma Make](./MATRIZ_DOCUMENTACAO_UI.md#72-exemplo-de-prompt-completo) para transformar estas especificações em prompts efetivos.
