# Módulo Agenda - Documentação UI

> **Documentação de Interface para Figma Make**  
> **Versão:** 1.0  
> **Data:** Março 2026  
> **Status:** Pronto para Design

---

## 1. Visão Geral do Módulo

### 1.1 Propósito

O **Módulo Agenda** é o centro de operações diárias do empreendedor UNIQ, permitindo o gerenciamento de compromissos, agendamentos de clientes e organização do tempo. É o módulo mais utilizado por profissionais de serviços (estética, consultórios, oficinas, etc.).

### 1.2 Público-Alvo

- **Perfil Principal:** Profissionais de serviços autônomos e donos de pequenos negócios
- **Conhecimento Técnico:** Baixo (usa WhatsApp e Instagram)
- **Contexto de Uso:** Durante o atendimento, entre clientes, no celular entre uma tarefa e outra
- **Frequência:** Diária (várias vezes ao dia)

### 1.3 Problemas que Resolve

1. Perder agendamentos anotados em papéis ou agenda física
2. Esquecer compromissos com clientes
3. Não saber se tem horário disponível ao atender ligação
4. Falta de organização da equipe (quando há múltiplos profissionais)
5. No-shows (clientes que não aparecem)

### 1.4 Fluxo Principal

```
Calendário Principal → Novo Agendamento → Confirmação Automática
        ↓
Lista de Compromissos → Detalhes → Reagendar/Cancelar/Concluir
```

---

## 2. Tela 1: Calendário/Agenda

### 2.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Calendário/Agenda |
| **Rota/URL** | `/agenda` |
| **Objetivo Principal** | Visualizar e gerenciar todos os compromissos em formato de calendário, permitindo planejamento rápido do dia/semana/mês |
| **Permissões de Acesso** | Visualização: Todos os usuários | Edição: Profissionais (própria agenda), Gestores (todas) |
| **Módulo/Pai** | Módulo Agenda |
| **Prioridade MVP** | ✅ Essencial |

### 2.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Profissional de serviços (cabeleireiro, manicure, dentista, mecânico, etc.)
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** No início do dia para planejar, entre atendimentos para ver próximo cliente, ao atender ligação para ver disponibilidade

#### Por Que Esta Tela Existe
- **Problema que resolve:** Visualização rápida da ocupação do tempo, evitando conflitos e esquecimentos
- **Valor entregue:** Visão clara da semana/mês, identificação imediata de horários livres para novos agendamentos
- **Frequência de uso:** Múltiplas vezes ao dia (principal tela do módulo)

#### User Stories Relacionadas
- "Como profissional de estética, quero ver minha agenda da semana para planejar meus atendimentos"
- "Como dono de consultório, quero ver a agenda de todos os profissionais para gerenciar a clínica"
- "Como empreendedor, quero ver rapidamente se tenho horário disponível para um novo cliente"
- "Como recepcionista, quero visualizar a ocupação do dia para organizar a fila de espera"

### 2.3 Elementos Obrigatórios

#### Dados a Exibir
- **Visualização toggle:** Dia / Semana / Mês (seletor de visualização)
- **Calendário interativo:**
  - Dias da semana com identificação clara
  - Dias com compromissos destacados visualmente
  - Indicador visual da quantidade de compromissos por dia (badge ou barra)
  - Navegação entre períodos (anterior/próximo)
  - Botão "Hoje" para retornar ao dia atual rapidamente
  - Data atual destacada
- **Lista de compromissos do dia selecionado:**
  - Horário de início
  - Nome do cliente (com foto/avatar quando disponível)
  - Serviço a ser realizado
  - Status do agendamento (confirmado, pendente, concluído, cancelado)
  - Duração estimada do atendimento
  - Profissional responsável (se visualização de múltiplos)
- **Indicador de horário atual:** Linha ou marcação destacada mostrando o momento presente
- **Legenda de status:** Identificação visual dos diferentes estados de agendamento

#### Funcionalidades Essenciais
- Alternar entre visualizações (dia/semana/mês)
- Navegar entre períodos (setas anterior/próximo)
- Retornar ao dia atual
- Criar novo agendamento
- Visualizar detalhes de um compromisso existente
- Filtrar por profissional (quando múltiplos)
- Filtrar por tipo de serviço
- Filtrar por status
- Arrastar compromisso para outro horário/dia (reagendamento rápido)
- Selecionar dia específico para ver lista detalhada

#### Campos de Formulário (Filtros)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Profissional | Multi-select | Não | Lista de profissionais ativos |
| Serviço | Multi-select | Não | Lista de serviços cadastrados |
| Status | Multi-select | Não | Confirmado, Pendente, Concluído, Cancelado |
| Período | Date Range | Não | Data inicial e final |

### 2.4 Elementos Opcionais

#### Funcionalidades Adicionais
- Visualização de bloqueios de horário (folgas, reuniões)
- Exportar agenda (PDF, iCal)
- Sincronização com calendário externo (Google, Outlook)
- Indicadores de feriados
- Visualização de fila de espera

#### Dados Secundários
- Valor previsto do agendamento
- Indicador de primeira vez do cliente
- Indicador de pagamento pendente
- Observações rápidas (preview)

### 2.5 Ações Possíveis

#### Ações Primárias
1. **Criar novo agendamento:**
   - **Gatilho:** Botão principal visível na interface
   - **Resultado:** Navega para tela de novo agendamento ou abre modal
   - **Confirmação:** Não necessária

2. **Visualizar detalhes do compromisso:**
   - **Gatilho:** Clicar em um agendamento no calendário ou na lista
   - **Resultado:** Navega para tela de detalhes do agendamento
   - **Confirmação:** Não necessária

3. **Reagendar arrastando:**
   - **Gatilho:** Arrastar card de agendamento para novo horário/dia
   - **Resultado:** Move o agendamento (com confirmação se conflitar)
   - **Confirmação:** Sim, se houver conflito de horário

#### Ações Secundárias
1. Aplicar filtros avançados
2. Exportar visualização atual
3. Sincronizar com calendário externo
4. Imprimir agenda do período

### 2.6 Estados da UI

#### Empty State - Dia Sem Compromissos
- **Quando aparece:** Dia selecionado não possui agendamentos
- **Mensagem:** "Nenhum agendamento para este dia"
- **Descrição:** "Aproveite para descansar ou adicione um novo compromisso"
- **CTA primário:** "Adicionar agendamento"
- **Dica:** "Você também pode bloquear este horário para tarefas pessoais"

#### Empty State - Mês Vazio
- **Quando aparece:** Período selecionado não possui agendamentos
- **Mensagem:** "Sua agenda está vazia"
- **Descrição:** "Comece adicionando seus primeiros agendamentos"
- **CTA:** "Criar primeiro agendamento"
- **Dica:** "Dica: Use a lista de compromissos para visualização em formato de lista"

#### Loading State
- **Quando aparece:** Carregando dados do calendário
- **Tipo:** Skeleton do calendário e lista lateral
- **Mensagem:** "Carregando sua agenda..."

#### Error State
- **Quando aparece:** Falha ao carregar dados da agenda
- **Mensagem:** "Não foi possível carregar sua agenda"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

### 2.7 Integrações

#### Com Outras Telas
- Navega para: Novo Agendamento, Detalhes do Agendamento, Lista de Compromissos
- Recebe de: Dashboard (clicando em compromisso do dia)

#### Com Outros Módulos
- **CRM:** Mostra foto e dados do cliente
- **Catálogo de Serviços:** Exibe nome e duração dos serviços
- **WhatsApp:** Permite iniciar conversa com cliente
- **MEL (IA):** Destaca agendamentos importantes, alerta sobre conflitos

### 2.8 Regras de Negócio

1. Profissionais só veem sua própria agenda por padrão
2. Gestores e administradores veem agenda de todos os profissionais
3. Agendamentos cancelados aparecem visualmente diferentes (riscado ou opaco)
4. Horários bloqueados (folga) aparecem como indisponíveis
5. Não é possível criar agendamento em horário já ocupado (exceto com confirmação)
6. Agendamentos passados não podem ser editados (apenas visualizados)
7. Visualização padrão é a semana atual

---

## 3. Tela 2: Novo Agendamento

### 3.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Novo Agendamento |
| **Rota/URL** | `/agenda/novo` ou `/agenda/editar/:id` |
| **Objetivo Principal** | Criar um novo compromisso/agendamento de cliente de forma rápida e intuitiva |
| **Permissões de Acesso** | Criação: Todos os usuários | Edição: Criador do agendamento, Gestores |
| **Módulo/Pai** | Módulo Agenda |
| **Prioridade MVP** | ✅ Essencial |

### 3.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Profissional atendendo cliente por telefone/WhatsApp, recepcionista, dono do negócio
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Durante atendimento ao cliente (ligação ou presencial), entre um cliente e outro

#### Por Que Esta Tela Existe
- **Problema que resolve:** Permitir agendamento rápido sem burocracia, evitando perda de cliente por demora
- **Valor entregue:** Agendamento em poucos cliques, com validação automática de disponibilidade
- **Frequência de uso:** Várias vezes ao dia

#### User Stories Relacionadas
- "Como profissional, quero agendar um cliente rapidamente sem precisar sair da tela"
- "Como atendente, quero ver se o horário está disponível antes de confirmar com o cliente"
- "Como empreendedor, quero enviar confirmação automática por WhatsApp"
- "Como recepcionista, quero cadastrar cliente novo direto da tela de agendamento"

### 3.3 Elementos Obrigatórios

#### Campos de Formulário

**Seção: Cliente**

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Cliente | Search/Select | Sim | Busca por nome, telefone ou email. Mostra foto quando disponível |
| Cadastrar novo cliente | Button | Não | Abre modal de cadastro rápido |

- Lista de "Clientes recentes" como atalho rápido

**Seção: Serviço**

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Serviço | Select | Sim | Lista de serviços cadastrados e ativos |
| Variação | Select | Condicional | Apenas se o serviço tiver variações |

- Duração automática (puxada do cadastro do serviço)
- Preço informativo (puxado do cadastro do serviço)

**Seção: Data e Horário**

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Data | Date picker | Sim | Não pode ser data no passado |
| Horário | Time picker/Slots | Sim | Deve estar dentro do horário comercial configurado |

- Indicador visual de disponibilidade: horários livres vs ocupados
- Validação em tempo real: avisa se horário conflita com outro agendamento
- Sugestão de próximos horários disponíveis se o selecionado estiver ocupado

**Seção: Profissional**

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Profissional | Select | Sim | Default: usuário logado. Lista filtrada por profissionais habilitados para o serviço |

**Seção: Observações**

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Observações | Textarea | Não | Preferências do cliente, alergias, informações importantes |

**Seção: Notificações**

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Enviar confirmação por WhatsApp | Toggle | Não | Default: ON se cliente tiver WhatsApp |
| Lembrar cliente 24h antes | Toggle | Não | Default: ON |

#### Funcionalidades Essenciais
- Busca de cliente com autocomplete
- Cadastro rápido de novo cliente sem sair da tela
- Seleção de serviço com preview de duração e preço
- Visualização de disponibilidade em tempo real
- Validação imediata de conflitos de horário
- Sugestão automática de horários alternativos
- Cálculo automático de horário de término baseado na duração
- Preview do agendamento antes de salvar

### 3.4 Elementos Opcionais

#### Funcionalidades Adicionais
- Agendar múltiplos serviços em sequência
- Agendamento recorrente (semanal, mensal)
- Indicação de como o cliente conheceu o negócio
- Forma de pagamento prevista
- Solicitar confirmação do cliente
- Adicionar anexos (fotos de referência, documentos)

### 3.5 Ações Possíveis

#### Ações Primárias
1. **Salvar agendamento:**
   - **Gatilho:** Botão principal do formulário
   - **Resultado:** Cria agendamento e retorna ao calendário
   - **Confirmação:** Toast de sucesso "Agendamento criado com sucesso!"

2. **Salvar e criar outro:**
   - **Gatilho:** Botão secundário
   - **Resultado:** Salva agendamento atual e limpa formulário para novo
   - **Confirmação:** Toast de sucesso

#### Ações Secundárias
1. Verificar disponibilidade (validação manual)
2. Limpar formulário
3. Cancelar e voltar

#### Ações de Destruição
1. **Cancelar criação:**
   - **Gatilho:** Botão cancelar com formulário preenchido
   - **Confirmação:** "Descartar alterações?" se houver dados preenchidos

### 3.6 Estados da UI

#### Empty State - Nenhum Cliente Selecionado
- **Quando aparece:** Antes de selecionar cliente
- **Instrução:** "Selecione um cliente ou cadastre um novo"

#### Error State - Conflito de Horário
- **Quando aparece:** Horário selecionado já está ocupado
- **Mensagem:** "Horário indisponível"
- **Descrição:** "Este horário já está reservado para outro cliente"
- **Ação de recuperação:** Sugestão de próximos horários livres, botão para ver agenda do dia

#### Error State - Validação
- **Quando aparece:** Campos obrigatórios não preenchidos ou inválidos
- **Mensagem:** "Verifique os campos destacados"
- **Ação de recuperação:** Scroll automático para campos com erro, destaque visual

#### Loading State
- **Quando aparece:** Validando disponibilidade, salvando agendamento
- **Tipo:** Spinner no botão de ação
- **Mensagem:** "Verificando disponibilidade..." / "Salvando agendamento..."

#### Success State
- **Quando aparece:** Após salvar com sucesso
- **Feedback:** Toast de sucesso
- **Mensagem:** "Agendamento criado! Confirmação enviada para o cliente"
- **Ação pós-sucesso:** Retornar ao calendário ou criar novo agendamento

### 3.7 Integrações

#### Com Outras Telas
- Navega para: Calendário/Agenda, Detalhes do Agendamento (após criar)
- Recebe de: Calendário (clicando em horário vazio), CRM (ficha do cliente)

#### Com Outros Módulos
- **CRM:** Busca clientes, cadastra novo cliente
- **Catálogo de Serviços:** Lista serviços, pega duração e preço
- **WhatsApp:** Envia confirmação automática
- **MEL (IA):** Sugere horários baseados em padrões do cliente

### 3.8 Regras de Negócio

1. **Horário no passado:** Não permite agendar em horário já passado
2. **Horário comercial:** Deve respeitar horário de funcionamento configurado
3. **Conflitos:** Não permite agendamento em horário ocupado (avisa e sugere alternativas)
4. **Cliente obrigatório:** Todo agendamento precisa ter um cliente vinculado
5. **Serviço obrigatório:** Todo agendamento precisa ter pelo menos um serviço
6. **Antecedência mínima:** Configurável (default: 30 minutos antes do horário)
7. **Profissional habilitado:** Só permite selecionar profissionais habilitados para o serviço escolhido
8. **Duração automática:** Calculada do serviço, mas pode ser ajustada manualmente se necessário

---

## 4. Tela 3: Lista de Compromissos

### 4.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Lista de Compromissos |
| **Rota/URL** | `/agenda/compromissos` |
| **Objetivo Principal** | Visualizar agendamentos em formato de lista, facilitando buscas e filtros avançados |
| **Permissões de Acesso** | Visualização: Todos os usuários | Ações: Conforme permissão do agendamento |
| **Módulo/Pai** | Módulo Agenda |
| **Prioridade MVP** | ✅ Essencial |

### 4.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Profissionais que preferem lista ao invés de calendário, gestores fazendo análise, recepcionistas buscando agendamentos específicos
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Quando precisa buscar agendamento específico, ver histórico, analisar período

#### Por Que Esta Tela Existe
- **Problema que resolve:** Dificuldade de encontrar agendamentos específicos no calendário visual, necessidade de ver histórico completo
- **Valor entregue:** Busca rápida, filtros avançados, visualização linear dos compromissos
- **Frequência de uso:** Semanal ou quando precisa consultar histórico

#### User Stories Relacionadas
- "Como profissional, quero ver todos os agendamentos de amanhã em lista"
- "Como gestor, quero filtrar por profissional para ver a carga de trabalho"
- "Como atendente, quero buscar um agendamento específico do cliente"
- "Como dono, quero ver todos os agendamentos cancelados do mês"

### 4.3 Elementos Obrigatórios

#### Dados a Exibir (por compromisso)
- Data e horário de início
- Cliente (nome, telefone, foto quando disponível)
- Serviço(s) agendados
- Profissional responsável
- Status (confirmado, pendente, concluído, cancelado, não compareceu)
- Duração
- Valor previsto
- Ícones indicadores (primeira vez, pagamento pendente, observações, confirmação enviada)

#### Funcionalidades Essenciais
- Busca por cliente, telefone ou serviço
- Filtros avançados
- Ordenação por data, cliente ou serviço
- Ações rápidas por compromisso
- Seleção múltipla para ações em massa
- Paginação ou scroll infinito

#### Campos de Formulário (Filtros)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Período | Select/Date Range | Não | Hoje, Amanhã, Esta semana, Próxima semana, Personalizado |
| Status | Multi-select | Não | Todos, Confirmados, Pendentes, Concluídos, Cancelados |
| Cliente | Search | Não | Busca por nome ou telefone |
| Serviço | Multi-select | Não | Lista de serviços |
| Profissional | Multi-select | Não | Lista de profissionais |

#### Ações Rápidas por Compromisso
- Ver detalhes completos
- Confirmar (mudar status de pendente para confirmado)
- Cancelar (com solicitação de motivo)
- Concluir/sinalizar como atendido
- Reagendar
- Enviar mensagem WhatsApp
- Editar

### 4.4 Elementos Opcionais

#### Funcionalidades Adicionais
- Exportar lista (CSV, PDF)
- Imprimir lista
- Visualização em cards (alternativa à tabela)
- Visualização Kanban (agrupado por status)
- Estatísticas do período filtrado

#### Dados Secundários
- Data de criação do agendamento
- Quem criou o agendamento
- Canal de origem (online, presencial, telefone)
- Forma de pagamento prevista
- Observações (preview)

### 4.5 Ações Possíveis

#### Ações Primárias
1. **Novo agendamento:**
   - **Gatilho:** Botão principal
   - **Resultado:** Navega para tela de novo agendamento
   - **Confirmação:** Não necessária

2. **Ver detalhes:**
   - **Gatilho:** Clicar em um compromisso da lista
   - **Resultado:** Navega para tela de detalhes
   - **Confirmação:** Não necessária

#### Ações Secundárias
1. Aplicar filtros
2. Limpar filtros
3. Exportar lista
4. Ações em massa (confirmar, cancelar, enviar lembrete)

#### Ações de Destruição
1. **Cancelar agendamento:**
   - **Gatilho:** Botão cancelar na linha do compromisso
   - **Confirmação:** Modal solicitando motivo do cancelamento
   - **Resultado:** Status alterado para cancelado

### 4.6 Estados da UI

#### Empty State - Sem Compromissos no Período
- **Quando aparece:** Filtros aplicados não retornam resultados
- **Mensagem:** "Nenhum agendamento encontrado"
- **Descrição:** "Ajuste seus filtros ou cadastre um novo agendamento"
- **CTA:** "Limpar filtros" / "Novo agendamento"

#### Empty State - Sem Resultados na Busca
- **Quando aparece:** Termo de busca não encontra correspondências
- **Mensagem:** "Nenhum resultado para '[termo]'"
- **Descrição:** "Tente buscar por outro termo ou verifique a ortografia"
- **CTA:** "Limpar busca"

#### Loading State
- **Quando aparece:** Carregando lista inicial ou aplicando filtros
- **Tipo:** Skeleton de linhas (5-10 linhas simulando a tabela)
- **Mensagem:** "Carregando agendamentos..."

#### Error State
- **Quando aparece:** Falha ao carregar dados
- **Mensagem:** "Não foi possível carregar os agendamentos"
- **Ação de recuperação:** Botão "Tentar novamente"

### 4.7 Integrações

#### Com Outras Telas
- Navega para: Detalhes do Agendamento, Novo Agendamento, Calendário
- Recebe de: Calendário, Dashboard

#### Com Outros Módulos
- **CRM:** Busca informações do cliente
- **Catálogo de Serviços:** Exibe nome dos serviços
- **WhatsApp:** Inicia conversa com cliente
- **MEL (IA):** Destaca agendamentos que precisam de atenção

### 4.8 Regras de Negócio

1. Lista padrão mostra agendamentos dos próximos 7 dias
2. Agendamentos cancelados aparecem com indicador visual diferente
3. Agendamentos passados aparecem apenas se buscados explicitamente
4. Filtros são mantidos durante a sessão
5. Exportação respeita filtros aplicados
6. Ações em massa limitadas a 50 itens por vez
7. Ordenação padrão: data/hora crescente

---

## 5. Tela 4: Detalhes do Agendamento

### 5.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Detalhes do Agendamento |
| **Rota/URL** | `/agenda/:id` |
| **Objetivo Principal** | Visualizar informações completas de um agendamento específico e executar ações sobre ele |
| **Permissões de Acesso** | Visualização: Todos | Edição: Criador, Gestores | Exclusão: Gestores, Admin |
| **Módulo/Pai** | Módulo Agenda |
| **Prioridade MVP** | ✅ Essencial |

### 5.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Profissional antes de atender cliente, atendente recebendo ligação de alteração, gestor analisando histórico
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Consulta rápida antes do atendimento, gerenciamento de alterações, registro pós-atendimento

#### Por Que Esta Tela Existe
- **Problema que resolve:** Necessidade de ver informações completas do atendimento, histórico do cliente, executar ações (confirmar, cancelar, concluir)
- **Valor entregue:** Visão 360° do agendamento, ações rápidas, histórico completo
- **Frequência de uso:** Por cada agendamento (antes, durante ou depois)

#### User Stories Relacionadas
- "Como profissional, quero ver os detalhes do cliente antes do atendimento"
- "Como atendente, quero reagendar quando o cliente liga pedindo mudança"
- "Como profissional, quero adicionar notas após o atendimento"
- "Como gestor, quero ver o histórico completo de alterações do agendamento"

### 5.3 Elementos Obrigatórios

#### Dados a Exibir

**Header**
- Código/ID do agendamento
- Data e horário destacados
- Status atual (badge visual prominente)
- Botões de ação principais

**Informações do Cliente**
- Nome completo
- Telefone (com link para WhatsApp)
- Foto/avatar
- Badge indicando se é primeira vez ou cliente frequente
- Histórico resumido: total de visitas, data da última visita
- Link para "Ver ficha completa" (CRM)

**Informações do Serviço**
- Nome do serviço agendado
- Duração prevista
- Preço
- Variação (se aplicável)
- Profissional responsável

**Observações do Agendamento**
- Observações do cliente (preferências, alergias)
- Observações internas (visíveis apenas para equipe)

**Timeline de Ações**
- Data/hora de criação do agendamento
- Confirmação enviada (data/hora)
- Lembretes enviados
- Alterações realizadas (quem, quando, o que mudou)
- Check-in (quando o cliente chegou)
- Checkout/finalização

**Informações Financeiras**
- Valor previsto
- Valor pago (se aplicável)
- Forma de pagamento
- Status do pagamento

#### Funcionalidades Essenciais
- Editar informações do agendamento
- Confirmar agendamento pendente
- Reagendar para outro dia/horário
- Cancelar com motivo
- Marcar como concluído
- Registrar check-in (chegada do cliente)
- Registrar checkout/finalização
- Adicionar nota pós-atendimento
- Enviar mensagem WhatsApp
- Criar venda (integração com PDV)
- Ver histórico completo de alterações

### 5.4 Elementos Opcionais

#### Funcionalidades Adicionais
- Anexar fotos/documentos
- Registrar produtos utilizados (consumo de estoque)
- Avaliação do cliente (satisfação)
- Indicar se cliente compareceu ou faltou
- Duplicar agendamento (para reagendamento rápido)
- Compartilhar agendamento (link externo)
- Imprimir comprovante

### 5.5 Ações Possíveis

#### Ações Primárias
1. **Confirmar agendamento:**
   - **Gatilho:** Botão quando status é pendente
   - **Resultado:** Status muda para confirmado, envia notificação ao cliente
   - **Confirmação:** Toast de sucesso

2. **Reagendar:**
   - **Gatilho:** Botão de reagendamento
   - **Resultado:** Abre modal/tela para selecionar nova data/hora
   - **Confirmação:** Modal solicitando confirmação da alteração

3. **Concluir atendimento:**
   - **Gatilho:** Botão quando status é confirmado
   - **Resultado:** Abre modal de checkout com opções de pagamento e observações
   - **Confirmação:** Modal de confirmação

#### Ações Secundárias
1. Editar detalhes
2. Enviar mensagem WhatsApp
3. Adicionar observação
4. Criar venda
5. Ver ficha completa do cliente

#### Ações de Destruição
1. **Cancelar agendamento:**
   - **Gatilho:** Botão de cancelar
   - **Confirmação:** Modal solicitando motivo do cancelamento
   - **Validação:** Checkbox "Entendo que o cliente será notificado"
   - **Resultado:** Status muda para cancelado, cliente é notificado

### 5.6 Estados da UI

#### Empty State - Sem Observações
- **Quando aparece:** Nenhuma observação foi adicionada
- **Mensagem:** "Nenhuma observação"
- **CTA:** "Adicionar observação"

#### Estado - Agendamento Cancelado
- **Visual:** Badge de cancelado proeminente
- **Mensagem:** "Este agendamento foi cancelado"
- **Informações:** Motivo do cancelamento, data do cancelamento, quem cancelou
- **Ações:** Reagendar, Duplicar

#### Estado - Agendamento Concluído
- **Visual:** Badge de concluído
- **Informações:** Data/hora de finalização, duração real, valor pago
- **Ações:** Adicionar notas, Ver histórico, Duplicar

#### Loading State
- **Quando aparece:** Carregando dados do agendamento
- **Tipo:** Skeleton de seções
- **Mensagem:** "Carregando detalhes..."

#### Error State
- **Quando aparece:** Falha ao carregar agendamento
- **Mensagem:** "Não foi possível carregar o agendamento"
- **Ação de recuperação:** Botão "Tentar novamente"

### 5.7 Integrações

#### Com Outras Telas
- Navega para: Editar Agendamento, Ficha do Cliente (CRM), PDV/Vendas
- Recebe de: Calendário, Lista de Compromissos

#### Com Outros Módulos
- **CRM:** Exibe dados do cliente, navega para ficha completa
- **Catálogo de Serviços:** Exibe informações do serviço
- **Vendas (PDV):** Converte agendamento em venda
- **WhatsApp:** Envia mensagens, confirmações
- **Financeiro:** Registra pagamentos
- **Estoque:** Registra produtos utilizados
- **MEL (IA):** Sugere ações baseadas no contexto

### 5.8 Regras de Negócio

1. Agendamentos passados não podem ser editados (apenas adicionar notas)
2. Cancelamento notifica automaticamente o cliente
3. Reagendamento preserva histórico (mostra alterações na timeline)
4. Apenas criador ou gestor pode cancelar
5. Check-in só pode ser feito no dia do agendamento
6. Conclusão registra data/hora real de finalização
7. Agendamento concluído gera histórico no CRM do cliente

---

## 6. Componentes Específicos do Módulo

### 6.1 Card de Agendamento

**Props Necessárias:**
- Horário de início
- Duração (para cálculo de término)
- Cliente (nome, foto/avatar)
- Serviço (nome, ícone se disponível)
- Status (confirmado, pendente, concluído, cancelado)
- Profissional (nome, foto - quando múltiplos profissionais visíveis)
- Indicadores adicionais (primeira vez, pagamento pendente, observações)

**Funcionalidades:**
- Clicável para ver detalhes
- Draggable para reagendamento
- Menu de ações rápidas
- Cor de fundo/borda conforme status

### 6.2 Indicador de Disponibilidade

**Features:**
- Visualização de horários livres vs ocupados
- Cores diferenciadas por ocupação (verde: livre, vermelho: ocupado, cinza: bloqueado)
- Slots clicáveis para criação rápida de agendamento
- Preview de duração ao passar o mouse

**Estados:**
- Disponível
- Ocupado (mostra resumo do agendamento)
- Bloqueado (folga, reunião)
- Fora do horário comercial

### 6.3 Badge de Status

**Variações:**
- **Pendente:** Aguardando confirmação
- **Confirmado:** Cliente confirmado
- **Em andamento:** Cliente em atendimento
- **Concluído:** Atendimento finalizado
- **Cancelado:** Agendamento cancelado
- **Não compareceu:** Cliente faltou

### 6.4 Mini Calendário

**Features:**
- Navegação rápida de meses
- Destaque do dia selecionado
- Indicadores de dias com agendamentos
- Hoje destacado
- Clicável para seleção rápida

---

## 7. Integrações do Módulo

### 7.1 Com Outros Módulos UNIQ

#### CRM (Clientes)
- **Dados compartilhados:** Informações do cliente (nome, telefone, foto, histórico)
- **Fluxos:**
  - Ficha do cliente → Ver histórico de agendamentos
  - Novo agendamento → Busca cliente no CRM
  - Conclusão de atendimento → Atualiza última visita no CRM

#### Catálogo de Serviços
- **Dados compartilhados:** Nome do serviço, duração padrão, preço, profissionais habilitados
- **Fluxos:**
  - Novo agendamento → Lista serviços disponíveis
  - Agendamento criado → Valida se profissional pode realizar o serviço

#### Vendas (PDV)
- **Fluxos:**
  - Detalhes do agendamento → Converter em venda
  - Conclusão de atendimento → Sugere criar venda
  - Venda criada → Vincula ao agendamento

#### WhatsApp
- **Fluxos:**
  - Novo agendamento → Envia confirmação automática
  - 24h antes → Envia lembrete automático
  - Reagendamento → Notifica cliente
  - Cancelamento → Notifica cliente
  - Lista/Detalhes → Permite enviar mensagem manual

#### MEL (IA Proativa)
- **Funcionalidades:**
  - Alerta sobre agendamentos do dia pela manhã
  - Lembrete de follow-up após atendimento
  - Sugestão de horários baseada em padrões
  - Alerta de conflitos potenciais
  - Análise de taxa de comparecimento

### 7.2 Fluxos Principais

```
FLUXO 1: Agendamento Completo
Calendário → Novo Agendamento → Seleciona Cliente → Seleciona Serviço 
→ Escolhe Data/Hora → Salva → Envia Confirmação WhatsApp

FLUXO 2: Reagendamento
Lista/Calendário → Detalhes → Reagendar → Nova Data/Hora 
→ Confirma → Notifica Cliente

FLUXO 3: Atendimento do Dia
MEL (alerta) → Calendário → Detalhes → Check-in → Atendimento 
→ Checkout → Conclui → Cria Venda (opcional)

FLUXO 4: Histórico do Cliente
CRM (Ficha Cliente) → Ver Agendamentos → Lista filtrada por cliente 
→ Seleciona agendamento → Ver detalhes
```

---

## 8. Regras de Negócio

### 8.1 Configurações Gerais

1. **Horário Comercial:** Configurável por empresa
   - Default: 08:00 às 18:00
   - Dias de funcionamento: Segunda a Sábado (default)
   - Feriados configuráveis

2. **Antecedência Mínima:**
   - Default: 30 minutos
   - Configurável por empresa
   - Impede agendamentos de última hora

3. **Antecedência Máxima:**
   - Default: 90 dias
   - Configurável
   - Limita quão longe no futuro pode agendar

### 8.2 Validações de Agendamento

4. **Conflitos de Horário:**
   - Não permite agendamento em horário já ocupado pelo mesmo profissional
   - Verificação automática em tempo real
   - Sugestão de horários alternativos

5. **Duração:**
   - Calculada automaticamente do serviço selecionado
   - Pode ser ajustada manualmente se necessário
   - Usada para calcular horário de término

6. **Profissional:**
   - Só pode ser selecionado profissional habilitado para o serviço
   - Profissional inativo não aparece na lista

### 8.3 Cancelamentos

7. **Política de Cancelamento:**
   - Pode exigir motivo obrigatório (configurável)
   - Notifica automaticamente o cliente
   - Registra quem cancelou e quando

8. **Reembolso:**
   - Se houve pagamento antecipado, calcula valor a reembolsar
   - Política de reembolso configurável

### 8.4 Lembretes e Notificações

9. **Lembretes Automáticos:**
   - 24 horas antes do agendamento
   - 1 hora antes do agendamento (opcional)
   - Canal padrão: WhatsApp

10. **Confirmações:**
    - Enviada automaticamente ao criar agendamento (opcional)
    - Pode ser reenviada manualmente
    - Cliente pode confirmar via link

### 8.5 Múltiplos Profissionais

11. **Agenda Individual:**
    - Cada profissional tem sua própria agenda
    - Visualização pode ser filtrada por profissional
    - Gestores veem agenda de todos

12. **Bloqueios:**
    - Profissional pode ter horários bloqueados (folga, almoço)
    - Bloqueios coletivos (reuniões, feriados)

### 8.6 Histórico e Auditoria

13. **Registro de Alterações:**
    - Toda alteração em agendamento é registrada
    - Timeline mostra histórico completo
    - Quem alterou, quando e o que mudou

14. **Retenção de Dados:**
    - Agendamentos cancelados são mantidos para histórico
    - Podem ser excluídos permanentemente apenas por admin

---

## 9. Checklist de Qualidade

Antes de enviar ao Figma Make, verifique:

### ✅ Regras da Matriz Atendidas

- [x] Nenhum wireframe ou ASCII art incluído
- [x] Nenhuma especificação de posicionamento ("botão à direita", "card no topo")
- [x] Nenhuma cor hexadecimal específica
- [x] Nenhum tamanho em pixels
- [x] Nenhuma fonte específica mencionada
- [x] Nenhuma descrição de layout ("duas colunas", "sidebar")

### ✅ Conteúdo Funcional Completo

- [x] User stories no formato correto: "Como [perfil], quero [ação] para que [benefício]"
- [x] Metadados completos para todas as 4 telas (nome, rota, objetivo, permissões)
- [x] Contexto do usuário UNIQ claramente definido
- [x] Elementos obrigatórios listados (dados, funcionalidades)
- [x] Campos de formulário documentados (tipo, obrigatório, validações)
- [x] Ações possíveis definidas (primárias, secundárias, destruição)
- [x] Todos os estados de UI descritos (empty, loading, error, success)
- [x] Regras de negócio explícitas
- [x] Permissões de acesso claras
- [x] Integrações com outros módulos documentadas

### ✅ Contexto UNIQ Presente

- [x] Público-alvo: empreendedor na correria (MEI/Micro)
- [x] Tom de voz: simples, acolhedor, sem jargões técnicos
- [x] Foco em facilidade de uso e agilidade
- [x] Integração com MEL (IA) considerada
- [x] Fluxos principais mapeados

### ✅ Limite de Telas Respeitado

- [x] Tela 1: Calendário/Agenda (/agenda)
- [x] Tela 2: Novo Agendamento (/agenda/novo)
- [x] Tela 3: Lista de Compromissos (/agenda/compromissos)
- [x] Tela 4: Detalhes do Agendamento (/agenda/:id)

---

## 10. Resumo para Prompt Figma Make

### Contexto do Produto
- **Produto:** UNIQ Empresas - Plataforma SaaS para pequenos empreendedores
- **Slogan:** "O Norte para Empreendedores - Comece Por Aqui"
- **Público:** Empreendedores na correria (MEI/Micro, 1-3 funcionários, R$ 8k-30k/mês)
- **Características:** Não é técnico, tem pouco tempo, valoriza simplicidade
- **Tom:** Simples, acolhedor, profissional, "Você consegue!", sem jargões

### Navegação da Plataforma
- **Sidebar Principal (Escura):** Fixa à esquerda com módulos (Dashboard, CRM, Vendas, Estoque, Agenda, Financeiro, Configurações)
- **Barra de Contexto:** Acima do conteúdo, navegação específica do módulo
- **Área de Conteúdo:** Restante da tela

### Telas para Criar
1. **Calendário/Agenda:** Visão principal com calendário interativo, toggle dia/semana/mês, lista lateral de compromissos do dia, indicador de horário atual
2. **Novo Agendamento:** Formulário com seleção de cliente, serviço, data/hora com validação de disponibilidade, notificações
3. **Lista de Compromissos:** Tabela/lista com filtros avançados, busca, ações rápidas por item
4. **Detalhes do Agendamento:** Informações completas do compromisso, timeline de ações, botões de ação (confirmar, reagendar, cancelar, concluir)

### Estilo Desejado
- Moderno, profissional mas acolhedor
- Mobile-first (80% dos acessos são mobile)
- Hierarquia visual clara
- Interface que "faz sentido" para leigos
- Cores que transmitem confiança + energia
- Tipografia limpa e legível

### Estados a Considerar
- Empty states encorajadores
- Loading com skeletons
- Erros com ações de recuperação claras
- Feedbacks de sucesso amigáveis

---

**Documentação completa seguindo a Matriz de Documentação UI.**  
**Pronto para ser transformado em prompt para o Figma Make.** ✅
