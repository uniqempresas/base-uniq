# Módulo MEL + Configurações - Documentação UI

> **Documentação de UI para Figma Make**  
> **Produto:** UNIQ Empresas - Plataforma SaaS  
> **Público:** Empreendedores na correria (MEI/Micro)  
> **Data:** Março 2025  
> **Status:** Pronto para Figma Make

---

## 1. Visão Geral do Módulo

### 1.1 Propósito
O módulo MEL + Configurações centraliza a experiência da Inteligência Artificial Proativa (MEL) e todas as personalizações da plataforma. É onde o empreendedor interage com seu "consultor virtual" e ajusta a plataforma às suas necessidades.

### 1.2 Problema que Resolve
- ❌ Empreendedor não tem tempo para analisar dados do negócio
- ❌ Informações importantes se perdem no dia a dia corrido
- ❌ Dificuldade em configurar ferramentas tecnológicas complexas
- ❌ Falta de insights personalizados sobre o negócio

### 1.3 Solução
- ✅ MEL (IA Proativa) que monitora o negócio 24h e envia insights via WhatsApp
- ✅ Configurações simples e intuitivas (sem jargões técnicos)
- ✅ Personalização do tom de voz e preferências do MEL
- ✅ Centralização de dados da empresa e perfil do usuário

### 1.4 Integrações com Outros Módulos
- **Todos os Módulos:** MEL analisa dados de CRM, Vendas, Estoque, Financeiro, Agenda
- **WhatsApp Business:** Canal principal de comunicação do MEL
- **Notificações Push:** Alertas mobile quando não estiver no WhatsApp
- **Relatórios:** Dados para geração de insights pela IA

---

## 2. Tela 1: Dashboard MEL

### 2.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Dashboard MEL |
| **Rota/URL** | `/mel` |
| **Objetivo Principal** | Visão centralizada dos insights, recomendações e status do MEL (IA Proativa) |
| **Permissões de Acesso** | Visualização: Todos os usuários | Configurações: Apenas Admin/Gestor |
| **Módulo/Pai** | Módulo MEL |
| **Prioridade MVP** | ✅ Essencial |

### 2.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Dono do negócio, gestor ou vendedor que quer insights sobre o negócio
- **Conhecimento técnico:** Baixo a médio (não é técnico)
- **Contexto de uso:** Verificada 1-2x ao dia, rápida, no celular entre atendimentos

#### Por Que Esta Tela Existe
- **Problema que resolve:** Centralizar todos os insights e alertas da IA em um só lugar
- **Valor entregue:** Respostas rápidas sobre "Como está meu negócio?" e "O que preciso fazer?"
- **Frequência de uso:** Diária, geralmente pela manhã ou durante pausas

#### User Stories Relacionadas
- "Como dono do negócio, quero ver o que o MEL descobriu sobre minha empresa para não perder oportunidades"
- "Como usuário, quero ver o histórico de insights para entender padrões do meu negócio"
- "Como gestor, quero confirmar que o MEL está conectado ao meu WhatsApp para receber alertas em tempo real"
- "Como empreendedor, quero ações sugeridas pelo MEL para saber o que priorizar hoje"

### 2.3 Elementos Obrigatórios

#### Header do MEL
- [ ] **Avatar do MEL:** Personagem/ícone amigável e profissional (consultor virtual)
- [ ] **Status de conexão:** Indicador visual (online/offline) do MEL
- [ ] **Status WhatsApp:** Badge indicando "Conectado" ou "Desconectado" ao WhatsApp
- [ ] **Botão de configurações:** Acesso rápido às preferências do MEL
- [ ] **Mensagem de boas-vindas contextual:** Saudação personalizada + data

#### Cards de Insights (MEL em Ação)
- [ ] **Card de Vendas:** "Você vendeu 20% mais que ontem! 🎉"
  - Comparação percentual
  - Valor absoluto (R$)
  - Tendência (ícone de crescimento/queda)
  
- [ ] **Card de Estoque:** "Camiseta Preta está acabando (2 unidades) ⚠️"
  - Nome do produto
  - Quantidade atual
  - Indicador de urgência (cores)
  - CTA: "Ver produto" ou "Repor estoque"
  
- [ ] **Card de Clientes:** "Você tem 3 clientes sem comprar há 30 dias 📞"
  - Quantidade de clientes
  - Período de inatividade
  - Sugestão de ação
  - CTA: "Ver clientes" ou "Enviar oferta"

- [ ] **Card de Financeiro:** "Sua receita deste mês já superou o mês passado 💰"
  - Comparação mensal
  - Valor acumulado
  - Previsão de fechamento

#### Seção de Ações Sugeridas
- [ ] **Lista de tarefas priorizadas:**
  - "Ligar para cliente X - Negociação parada há 5 dias"
  - "Repor estoque do produto Y - Só restam 3 unidades"
  - "Enviar proposta para o lead Z - Está quase decidindo"
  - "Revisar contas do mês - 2 vencimentos amanhã"
  
- [ ] **Botão de ação por item:** Concluir, Agendar, Ignorar
- [ ] **Indicador de prioridade:** Alta, Média, Baixa (cores/ícones)

#### Status e Integrações
- [ ] **Status do WhatsApp:** Card mostrando:
  - Número conectado
  - Última sincronização
  - Botão "Testar conexão"
  - Botão "Desconectar/Trocar número"
  
- [ ] **Estatísticas do MEL:**
  - Insights enviados hoje/semana/mês
  - Taxa de leitura (quanto % o usuário abriu)
  - Ações concluídas vs sugeridas

#### Ações Rápidas
- [ ] **Botão "Ver histórico de insights":** Acesso ao histórico completo
- [ ] **Botão "Falar com MEL":** Iniciar conversa via WhatsApp
- [ ] **Botão "Ajustar preferências":** Ir para configurações do MEL

### 2.4 Elementos Opcionais

#### Funcionalidades Adicionais
- [ ] **Gráfico de atividade:** Timeline dos últimos insights
- [ ] **Previsões do MEL:** "Baseado nos seus dados, você deve vender R$X amanhã"
- [ ] **Aprendizado do MEL:** "Estou aprendendo sobre seu negócio - 70% completo"
- [ ] **Dicas do dia:** Dicas de growth hacking contextualizadas

#### Dados Secundários
- [ ] Horário do último insight recebido
- [ ] Quantidade de mensagens não lidas no WhatsApp
- [ ] Tempo médio de resposta do usuário aos insights

### 2.5 Ações Possíveis

#### Ações Primárias
1. **Concluir ação sugerida:**
   - **Gatilho:** Clicar em "Concluir" em uma tarefa
   - **Resultado:** Tarefa marcada como feita, próxima tarefa em destaque
   - **Confirmação:** Toast "Ótimo! Tarefa concluída 🎉"

2. **Ver histórico de insights:**
   - **Gatilho:** Botão no header ou seção específica
   - **Resultado:** Navega para página de histórico completo
   - **Confirmação:** Não necessária

3. **Testar conexão WhatsApp:**
   - **Gatilho:** Botão no card de status
   - **Resultado:** Envia mensagem de teste para o WhatsApp
   - **Confirmação:** Toast "Mensagem de teste enviada! Verifique seu WhatsApp"

#### Ações Secundárias
1. **Agendar tarefa:** Mover para data futura
2. **Ignorar sugestão:** Descartar sem concluir
3. **Compartilhar insight:** Enviar para outro número/email
4. **Dar feedback no insight:** "Foi útil?" 👍/👎

### 2.6 Estados da UI

#### Empty State - Primeiro Acesso (MEL Ainda Não Tem Dados)
- **Quando aparece:** Usuário acabou de ativar o MEL, ainda sem histórico suficiente
- **Mensagem:** "Oi! Sou o MEL, seu consultor virtual 👋"
- **Descrição:** "Estou aprendendo sobre seu negócio. Nos próximos dias, vou enviar insights valiosos no seu WhatsApp."
- **CTA primário:** "Conectar WhatsApp"
- **CTA secundário:** "Ver como funciona"
- **Ilustração:** MEL amigável apresentando-se

#### Empty State - Sem Insights Recentes
- **Quando aparece:** MEL conectado mas sem novidades nas últimas 24h
- **Mensagem:** "Tudo em dia! ✅"
- **Descrição:** "Não tenho alertas urgentes no momento. Continue acompanhando que te aviso quando tiver novidades."
- **CTA:** "Ver histórico completo"
- **Dica:** "Dica: Mantenha seus dados atualizados para insights melhores"

#### Empty State - WhatsApp Desconectado
- **Quando aparece:** Conexão com WhatsApp foi perdida
- **Mensagem:** "WhatsApp desconectado ⚠️"
- **Descrição:** "Reconecte seu WhatsApp para continuar recebendo insights em tempo real"
- **CTA primário:** "Reconectar WhatsApp"
- **CTA secundário:** "Ver instruções"
- **Alerta visual:** Card destacado em cor de alerta

#### Loading State
- **Quando aparece:** Carregando insights e status do MEL
- **Tipo:** Skeleton dos cards e lista
- **Mensagem:** "Consultando seus dados..."

#### Error State
- **Quando aparece:** Falha ao carregar dados do MEL ou API de IA
- **Mensagem:** "Não foi possível carregar os insights"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State
- **Quando aparece:** Após conectar WhatsApp, concluir tarefa, ou ajustar configurações
- **Feedback:** Toast temporário amigável
- **Mensagens:**
  - "WhatsApp conectado com sucesso! 📱"
  - "Tarefa concluída! Você está indo bem 🎉"
  - "Preferências salvas"

### 2.7 Regras de Negócio

1. **Insights priorizados:** Ordem de exibição: Crítico (estoque) > Urgente (vencimentos) > Importante (oportunidades) > Informativo (tendências)
2. **Limite de cards:** Máximo 4-5 insights em destaque na tela inicial
3. **Ações sugeridas:** Máximo 5 tarefas visíveis, as demais ficam em "Ver mais"
4. **Status WhatsApp:** Atualiza em tempo real, mostra "Conectado" ou "Desconectado"
5. **Frequência de atualização:** Insights atualizados a cada 15 minutos ou em tempo real
6. **Privacidade:** Insights só são visíveis para o usuário logado (exceto gestores que veem da equipe)
7. **Histórico:** Mantém últimos 90 dias de insights

### 2.8 Integrações

#### Com Outras Telas
- Navega para: Configurações do MEL, Histórico de Insights, Detalhes do Produto/Cliente
- Recebe de: Todos os módulos (dados para insights)

#### Com Outros Módulos
- **Módulo Estoque:** Alertas de baixo estoque, produtos sem movimentação
- **Módulo Vendas:** Comparativos de vendas, pedidos pendentes
- **Módulo Financeiro:** Alertas de vencimento, projeções de caixa
- **Módulo CRM:** Follow-ups perdidos, clientes inativos
- **WhatsApp Business:** Canal de envio dos insights

---

## 3. Tela 2: Configurações do MEL

### 3.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Configurações do MEL |
| **Rota/URL** | `/mel/configuracoes` |
| **Objetivo Principal** | Personalizar comportamento, preferências e tom de voz do MEL |
| **Permissões de Acesso** | Edição: Admin e Gestor | Visualização: Todos |
| **Módulo/Pai** | Módulo MEL |
| **Prioridade MVP** | ✅ Essencial |

### 3.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Dono do negócio ou gestor que quer personalizar a experiência com o MEL
- **Conhecimento técnico:** Baixo (interface deve ser muito simples)
- **Contexto de uso:** Momento de configuração inicial ou ajuste de preferências

#### Por Que Esta Tela Existe
- **Problema que resolve:** Permitir que o empreendedor personalize como e quando quer ser alertado
- **Valor entregue:** Controle sobre a experiência com a IA, evitando spam ou notificações inconvenientes
- **Frequência de uso:** Baixa - usada na configuração inicial e ajustes ocasionais

#### User Stories Relacionadas
- "Como dono do negócio, quero escolher o tom de voz do MEL para que converse no meu estilo"
- "Como usuário, quero definir horários de silêncio para não receber mensagens à noite"
- "Como gestor, quero selecionar quais tipos de alertas são importantes para mim"
- "Como empreendedor, quero conectar o WhatsApp do meu negócio ao MEL"

### 3.3 Elementos Obrigatórios

#### Seção: Canais de Notificação
- [ ] **WhatsApp (principal):**
  - Toggle ativar/desativar
  - Número conectado (máscarado)
  - Botão "Trocar número"
  - Status da conexão
  
- [ ] **Email:**
  - Toggle ativar/desativar
  - Email configurado
  - Frequência (imediato / resumo diário / resumo semanal)
  
- [ ] **Push Notification (Mobile):**
  - Toggle ativar/desativar
  - Permissão do navegador/app
  - Botão "Ativar notificações"

#### Seção: Horários de Envio
- [ ] **Horário comercial padrão:**
  - Horário início (default: 08:00)
  - Horário fim (default: 20:00)
  - Dias da semana (seleção multipla: Seg-Sex padrão)
  
- [ ] **Não incomodar após:**
  - Slider ou select (opções: 20h, 21h, 22h, 23h, nunca)
  - Explicação: "O MEL não enviará mensagens fora deste horário"
  
- [ ] **Fins de semana:**
  - Toggle "Receber insights aos fins de semana"
  - Horário diferenciado (opcional)

#### Seção: Tipos de Alertas
**Categorias com toggles individuais:**

- [ ] **Vendas:**
  - Novas vendas realizadas
  - Meta de vendas atingida
  - Comparativo diário/semanal/mensal
  - Pedidos pendentes de aprovação
  
- [ ] **Estoque:**
  - Produto com estoque baixo (definir limite: X unidades)
  - Produto sem saída há X dias
  - Produto em falta
  - Curva ABC de produtos
  
- [ ] **Clientes:**
  - Cliente sem comprar há X dias (configurável)
  - Aniversário de cliente
  - Cliente VIP realizou compra
  - Novo cliente cadastrado
  
- [ ] **Financeiro:**
  - Conta a pagar próxima do vencimento
  - Conta a receber vencida
  - Projeção de caixa negativa
  - Meta financeira atingida
  
- [ ] **Agenda:**
  - Compromisso em 30 min
  - Follow-up pendente
  - Aniversário de negociação

#### Seção: Tom de Voz do MEL
- [ ] **Estilo de comunicação (Radio buttons):**
  - **Descontraído:** "Ei! 🎉 Você vendeu mais que ontem!"
  - **Profissional:** "Bom dia. Identificamos um aumento de 20% nas vendas."
  - **Parceiro:** "Vamos lá! Hoje você vendeu 20% a mais. Ótimo trabalho!"
  
- [ ] **Uso de emojis:** Toggle "Permitir emojis nas mensagens"
- [ ] **Nível de detalhe:**
  - Resumido (só o essencial)
  - Detalhado (com contexto e sugestões)
  - Muito detalhado (com dados e análises)

#### Seção: Dados que o MEL Pode Acessar
- [ ] **Permissões por módulo (toggles):**
  - Acessar dados de Vendas
  - Acessar dados de Estoque
  - Acessar dados Financeiros
  - Acessar dados de Clientes
  - Acessar Agenda
  
- [ ] **Explicação:** "O MEL precisa acessar estes dados para gerar insights personalizados"

#### Preview/Exemplo ao Vivo
- [ ] **Card de preview:** Mostra exemplo de mensagem com as configurações atuais
- [ ] **Mensagem exemplo:** "[MEL] Bom dia João! 🎉 Ontem você vendeu R$ 850, 20% a mais que anteontém. Continue assim!"
- [ ] **Atualização em tempo real:** Preview muda conforme usuário altera configurações

### 3.4 Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| WhatsApp ativo | Toggle | Sim | Default: true |
| Número WhatsApp | Phone | Condicional | Obrigatório se toggle ativo |
| Email ativo | Toggle | Sim | Default: false |
| Email destino | Email | Condicional | Obrigatório se toggle ativo |
| Frequência email | Select | Condicional | Opções: Imediato, Diário, Semanal |
| Horário início | Time | Sim | Default: 08:00 |
| Horário fim | Time | Sim | Default: 20:00 |
| Não incomodar após | Select | Não | Opções: 20h, 21h, 22h, 23h, Nunca |
| Dias da semana | Multi-select | Sim | Default: Seg-Sex |
| Fins de semana | Toggle | Sim | Default: false |
| Limite estoque baixo | Number | Não | Min: 1, Max: 100 |
| Dias sem compra (cliente) | Number | Não | Min: 1, Max: 365 |
| Tom de voz | Radio | Sim | Default: Parceiro |
| Emojis | Toggle | Sim | Default: true |
| Nível de detalhe | Select | Sim | Default: Detalhado |

### 3.5 Ações Possíveis

#### Ações Primárias
1. **Salvar configurações:**
   - **Gatilho:** Botão primário "Salvar"
   - **Resultado:** Configurações aplicadas
   - **Confirmação:** Toast "Configurações salvas com sucesso!"
   - **Validação:** Verificar conflitos (ex: email ativo mas sem email informado)

2. **Testar configurações:**
   - **Gatilho:** Botão "Enviar mensagem de teste"
   - **Resultado:** Envia mensagem de exemplo com configurações atuais
   - **Confirmação:** Toast "Mensagem de teste enviada!"

3. **Restaurar padrões:**
   - **Gatilho:** Link "Restaurar configurações padrão"
   - **Resultado:** Reset para valores de fábrica
   - **Confirmação:** Modal "Tem certeza? Todas as personalizações serão perdidas."

#### Ações Secundárias
1. **Desconectar WhatsApp:** Remove conexão atual
2. **Exportar preferências:** Download das configurações
3. **Ver histórico de alterações:** Log de mudanças nas configurações

### 3.6 Estados da UI

#### Empty State - Primeira Configuração
- **Quando aparece:** Usuário nunca configurou o MEL
- **Mensagem:** "Vamos personalizar seu MEL!"
- **Descrição:** "Ajuste as configurações para receber insights do seu jeito"
- **CTA:** "Começar configuração guiada"
- **Dica:** "Não se preocupe, você pode mudar isso depois"

#### Loading State
- **Quando aparece:** Salvando configurações ou carregando dados
- **Tipo:** Spinner ou skeleton
- **Mensagem:** "Salvando suas preferências..."

#### Error State
- **Quando aparece:** Falha ao salvar ou validação de campos
- **Mensagem:** "Não foi possível salvar"
- **Descrição:** Destacar campos com erro
- **Ação de recuperação:** Correção e tentar novamente

#### Success State
- **Quando aparece:** Após salvar com sucesso
- **Feedback:** Toast + animação sutil no preview
- **Mensagem:** "Pronto! Seu MEL está configurado do seu jeito 🎉"

### 3.7 Regras de Negócio

1. **Validação de horários:** Horário fim deve ser maior que horário início
2. **Obrigatoriedade:** Pelo menos um canal de notificação deve estar ativo
3. **Tom padrão:** Se não selecionado, default é "Parceiro"
4. **Limites:** Limite de estoque baixo não pode ser negativo ou maior que 999
5. **Dias sem compra:** Mínimo 7 dias, máximo 365 dias
6. **Prioridade de canais:** WhatsApp > Email > Push (nessa ordem)
7. **Mensagens de teste:** Limite de 3 testes por hora para evitar spam

### 3.8 Integrações

#### Com Outras Telas
- Navega para: Dashboard MEL, Conectar WhatsApp
- Recebe de: Dashboard MEL (botão de configurações)

#### Com Outros Módulos
- **WhatsApp Business API:** Configuração da conexão
- **Servidor de Notificações:** Configuração de push

---

## 4. Tela 3: Configurações Gerais da Plataforma

### 4.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Configurações Gerais da Empresa |
| **Rota/URL** | `/configuracoes/empresa` |
| **Objetivo Principal** | Gerenciar dados cadastrais da empresa e preferências da plataforma |
| **Permissões de Acesso** | Edição: Admin e Gestor | Visualização: Todos |
| **Módulo/Pai** | Módulo Configurações |
| **Prioridade MVP** | ✅ Essencial |

### 4.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Dono do negócio ou responsável administrativo
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Configuração inicial do sistema ou alteração de dados cadastrais

#### Por Que Esta Tela Existe
- **Problema que resolve:** Centralizar dados da empresa que aparecem em documentos, relatórios e comunicações
- **Valor entregue:** Profissionalismo nas comunicações, dados corretos em documentos fiscais
- **Frequência de uso:** Baixa - usada na implantação e alterações pontuais

#### User Stories Relacionadas
- "Como dono, quero cadastrar os dados da minha empresa para que apareçam corretamente nos documentos"
- "Como gestor, quero configurar a moeda e idioma da plataforma para minha região"
- "Como usuário, quero adicionar o logo da empresa para personalizar a plataforma"
- "Como admin, quero configurar integrações como WhatsApp Business"

### 4.3 Elementos Obrigatórios

#### Seção: Dados da Empresa
- [ ] **Razão Social:** Campo texto completo
- [ ] **Nome Fantasia:** Campo texto (como aparece para clientes)
- [ ] **CNPJ:** Campo com máscara e validação
- [ ] **Inscrição Estadual:** Campo texto (opcional)
- [ ] **Inscrição Municipal:** Campo texto (opcional)
- [ ] **Logo da Empresa:**
  - Upload de imagem (JPG/PNG)
  - Preview do logo
  - Botão remover
  - Recomendação de tamanho/formato
  - Crop/ajuste básico

#### Seção: Informações de Contato
- [ ] **Telefone Comercial:** Com máscara
- [ ] **Celular/WhatsApp:** Com máscara
- [ ] **Email Comercial:** Validado
- [ ] **Site:** Campo URL (opcional)
- [ ] **Redes Sociais:**
  - Instagram (handle)
  - Facebook (URL ou página)
  - LinkedIn (opcional)

#### Seção: Endereço
- [ ] **CEP:** Com máscara e autocompletar (ViaCEP)
- [ ] **Logradouro:** Auto-fill
- [ ] **Número:**
- [ ] **Complemento:**
- [ ] **Bairro:** Auto-fill
- [ ] **Cidade:** Auto-fill
- [ ] **Estado:** Auto-fill (Select)

#### Seção: Preferências da Plataforma
- [ ] **Moeda:**
  - Select: Real (R$), Dólar (US$), Euro (€), etc.
  - Formato de exibição: R$ 1.234,56 ou R$ 1,234.56
  
- [ ] **Idioma:**
  - Select: Português (Brasil), English, Español
  - Aviso: "Mudança aplicada após recarregar a página"
  
- [ ] **Fuso Horário:**
  - Select com busca
  - Default: America/Sao_Paulo
  
- [ ] **Formato de Data:**
  - DD/MM/AAAA (padrão BR)
  - MM/DD/AAAA (padrão US)
  - AAAA-MM-DD (ISO)

#### Seção: Configurações de Notificações Gerais
- [ ] **Notificações no sistema:** Toggle ativar/desativar
- [ ] **Som de notificação:** Toggle + preview do som
- [ ] **Resumo diário:** Toggle + horário de envio
- [ ] **Alertas de segurança:** Toggle (login de novo dispositivo, etc.)

#### Seção: Integrações
- [ ] **WhatsApp Business:**
  - Status: Conectado/Desconectado
  - Número conectado
  - Botão "Gerenciar conexão"
  - Link para documentação
  
- [ ] **Outras integrações (futuro):**
  - Google Calendar (placeholder)
  - Mercado Pago (placeholder)
  - Stripe (placeholder)

### 4.4 Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Razão Social | Text | Sim | Min 3 caracteres |
| Nome Fantasia | Text | Sim | Min 3 caracteres |
| CNPJ | Masked Text | Sim | Formato 00.000.000/0000-00, validação |
| Inscrição Estadual | Text | Não | - |
| Inscrição Municipal | Text | Não | - |
| Logo | Upload | Não | JPG/PNG, max 2MB |
| Telefone Comercial | Phone | Sim | - |
| Celular/WhatsApp | Phone | Sim | - |
| Email Comercial | Email | Sim | Válido e único |
| Site | URL | Não | Formato válido |
| Instagram | Text | Não | @opcional |
| CEP | Masked Text | Sim | Formato 00000-000 |
| Logradouro | Text | Sim | Auto-fill |
| Número | Text | Sim | - |
| Complemento | Text | Não | - |
| Bairro | Text | Sim | Auto-fill |
| Cidade | Text | Sim | Auto-fill |
| Estado | Select | Sim | Auto-fill |
| Moeda | Select | Sim | Default: Real |
| Idioma | Select | Sim | Default: Português |
| Fuso Horário | Select | Sim | Default: America/Sao_Paulo |
| Formato de Data | Select | Sim | Default: DD/MM/AAAA |

### 4.5 Ações Possíveis

#### Ações Primárias
1. **Salvar alterações:**
   - **Gatilho:** Botão primário "Salvar"
   - **Resultado:** Dados atualizados
   - **Confirmação:** Toast "Dados da empresa atualizados!"
   - **Validação:** Todos os campos obrigatórios preenchidos

2. **Upload de logo:**
   - **Gatilho:** Área de upload ou botão
   - **Resultado:** Preview do logo carregado
   - **Confirmação:** Visual imediato + toast "Logo atualizado"

#### Ações Secundárias
1. **Remover logo:** Volta para placeholder
2. **Gerenciar WhatsApp:** Navega para tela de configuração do MEL
3. **Ver como aparece:** Preview de como os dados aparecem em documentos
4. **Cancelar alterações:** Descarta mudanças não salvas

### 4.6 Estados da UI

#### Empty State - Dados Incompletos
- **Quando aparece:** Empresa cadastrada mas com dados faltando
- **Mensagem:** "Complete os dados da sua empresa"
- **Descrição:** "Informações faltantes podem afetar documentos e relatórios"
- **Destaque:** Campos vazios em destaque

#### Loading State
- **Quando aparece:** Salvando dados ou carregando CEP
- **Tipo:** Spinner ou skeleton
- **Mensagem:** "Salvando..." / "Buscando endereço..."

#### Error State
- **Quando aparece:** Falha ao salvar ou CEP inválido
- **Mensagem:** Destacar erro específico
- **Ação de recuperação:** Correção e nova tentativa

#### Success State
- **Quando aparece:** Após salvar com sucesso
- **Feedback:** Toast
- **Mensagem:** "Dados salvos com sucesso! ✅"

### 4.7 Regras de Negócio

1. **CNPJ único:** Não pode haver duplicidade no sistema
2. **Validação de CNPJ:** Deve passar na validação de dígitos
3. **CEP:** Ao informar CEP válido, endereço é preenchido automaticamente
4. **Logo:** Tamanho máximo 2MB, formatos aceitos JPG/PNG
5. **Email:** Deve ser único no sistema
6. **Obrigatoriedade:** Razão Social, Nome Fantasia, CNPJ, Telefone, Email e Endereço são obrigatórios
7. **Alterações críticas:** Mudança de CNPJ requer confirmação adicional

### 4.8 Integrações

#### Com Outras Telas
- Navega para: Configurações do MEL, Minha Conta
- Recebe de: Todos os módulos (dados usados em documentos)

#### Com Outros Módulos
- **Módulo Financeiro:** Dados usados em notas e relatórios
- **Módulo Vendas:** Dados usados em orçamentos e pedidos
- **ViaCEP API:** Autocompletar endereço
- **WhatsApp Business API:** Conexão do número

---

## 5. Tela 4: Minha Conta (Perfil do Usuário)

### 5.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Minha Conta |
| **Rota/URL** | `/configuracoes/conta` |
| **Objetivo Principal** | Gerenciar dados pessoais, segurança e preferências individuais do usuário |
| **Permissões de Acesso** | Cada usuário vê e edita apenas a própria conta |
| **Módulo/Pai** | Módulo Configurações |
| **Prioridade MVP** | ✅ Essencial |

### 5.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Qualquer usuário do sistema (vendedor, gestor, admin)
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Configuração pessoal, alteração de senha, gerenciamento de assinatura

#### Por Que Esta Tela Existe
- **Problema que resolve:** Permitir que cada usuário gerencie seus dados pessoais e preferências
- **Valor entregue:** Controle sobre própria conta, segurança, personalização da experiência
- **Frequência de uso:** Média - usada para alterar senha, ver assinatura, ajustar preferências

#### User Stories Relacionadas
- "Como usuário, quero atualizar meus dados pessoais quando mudar de telefone"
- "Como usuário, quero alterar minha senha periodicamente por segurança"
- "Como usuário, quero escolher tema claro ou escuro para me confortar visualmente"
- "Como dono, quero ver os detalhes da minha assinatura e quando renova"

### 5.3 Elementos Obrigatórios

#### Seção: Dados Pessoais
- [ ] **Foto/Avatar:**
  - Upload ou seleção de avatar
  - Preview circular
  - Opção remover (volta para iniciais)
  - Opções de avatar predefinidos
  
- [ ] **Nome Completo:** Campo texto
- [ ] **Email:** Campo email (usado para login)
- [ ] **Telefone:** Campo com máscara
- [ ] **Cargo/Função:** Select (Vendedor, Gestor, Admin, etc.)
- [ ] **Data de Nascimento:** Date picker (opcional)

#### Seção: Segurança
- [ ] **Alterar Senha:**
  - Senha atual (obrigatório)
  - Nova senha (com indicador de força)
  - Confirmar nova senha
  - Requisitos de senha (mínimo 8 caracteres, letra, número, etc.)
  - Botão "Alterar senha"
  
- [ ] **Autenticação de Dois Fatores (2FA):**
  - Toggle ativar/desativar
  - Status: Ativo/Inativo
  - Botão "Configurar" (se inativo)
  
- [ ] **Sessões Ativas:**
  - Lista de dispositivos logados
  - Localização aproximada
  - Data/hora do último acesso
  - Botão "Encerrar sessão" por dispositivo
  - Botão "Encerrar todas as outras sessões"

#### Seção: Preferências de Tema
- [ ] **Tema Visual:**
  - Radio buttons: Claro / Escuro / Automático (segue sistema)
  - Preview lado a lado mostrando diferença
  - Aplicação imediata ao selecionar
  
- [ ] **Tamanho da Fonte:**
  - Slider: Pequeno / Normal / Grande
  - Preview com texto exemplo

#### Seção: Assinatura e Plano
- [ ] **Plano Atual:**
  - Nome do plano (Starter, Pro, Enterprise)
  - Status: Ativo, Suspenso, Cancelado
  - Data de renovação/próxima cobrança
  - Valor mensal/anual
  
- [ ] **Uso do Plano:**
  - Barra de progresso: Clientes cadastrados (X de Y)
  - Barra de progresso: Usuários (X de Y)
  - Barra de progresso: Armazenamento (X MB de Y GB)
  - Alerta se próximo do limite
  
- [ ] **Histórico de Faturas:**
  - Lista com: Data, Valor, Status (Pago/Pendente), Ações
  - Botão "Download PDF" por fatura
  - Link "Ver todas as faturas"
  
- [ ] **Gerenciar Assinatura:**
  - Botão "Alterar plano"
  - Botão "Atualizar dados de pagamento"
  - Link "Cancelar assinatura" (com confirmação)

#### Seção: Ações da Conta
- [ ] **Logout:**
  - Botão "Sair da conta"
  - Confirmação opcional
  
- [ ] **Desativar Conta:**
  - Link discreto "Desativar minha conta"
  - Modal com explicação das consequências
  - Confirmação em múltiplas etapas
  
- [ ] **Excluir Dados (LGPD):**
  - Link "Solicitar exclusão de dados"
  - Explicação do processo
  - Confirmação por email

### 5.4 Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Foto/Avatar | Upload/Select | Não | JPG/PNG, max 2MB |
| Nome Completo | Text | Sim | Min 3 caracteres |
| Email | Email | Sim | Válido e único |
| Telefone | Phone | Sim | - |
| Cargo | Select | Sim | - |
| Data de Nascimento | Date | Não | - |
| Senha Atual | Password | Condicional | Obrigatório para alterar senha |
| Nova Senha | Password | Condicional | Min 8 chars, letra, número, especial |
| Confirmar Nova Senha | Password | Condicional | Deve ser igual à nova senha |
| Tema | Radio | Sim | Default: Automático |
| Tamanho da Fonte | Slider | Sim | Default: Normal |

### 5.5 Ações Possíveis

#### Ações Primárias
1. **Salvar dados pessoais:**
   - **Gatilho:** Botão "Salvar alterações"
   - **Resultado:** Dados atualizados
   - **Confirmação:** Toast "Dados atualizados!"

2. **Alterar senha:**
   - **Gatilho:** Botão "Alterar senha"
   - **Resultado:** Senha atualizada, sessões mantidas
   - **Confirmação:** Toast "Senha alterada com sucesso"
   - **Validação:** Senha atual correta, nova senha válida

3. **Logout:**
   - **Gatilho:** Botão "Sair da conta"
   - **Resultado:** Encerra sessão, redireciona para login
   - **Confirmação:** Opcional (configurável)

#### Ações Secundárias
1. **Alterar plano:** Navega para página de planos
2. **Download de fatura:** PDF da fatura selecionada
3. **Encerrar sessão específica:** Desloga dispositivo remoto
4. **Ativar/Desativar 2FA:** Configuração de autenticação dupla

#### Ações de Destruição
1. **Cancelar assinatura:**
   - **Gatilho:** Link na seção de assinatura
   - **Confirmação:** Múltiplas etapas
   - **Mensagem:** "Tem certeza? Você perderá acesso a..."
   - **Consequência:** Conta mantida até fim do período pago

2. **Desativar conta:**
   - **Gatilho:** Link discreto
   - **Confirmação:** Múltiplas etapas + senha
   - **Consequência:** Conta inativa, dados preservados

### 5.6 Estados da UI

#### Empty State - Nova Conta
- **Quando aparece:** Usuário criou conta mas não completou perfil
- **Mensagem:** "Complete seu perfil"
- **Descrição:** "Adicione uma foto e complete seus dados"
- **Destaque:** Campos essenciais em destaque

#### Loading State
- **Quando aparece:** Salvando dados, alterando senha
- **Tipo:** Spinner ou skeleton
- **Mensagem:** "Salvando..." / "Processando..."

#### Error State
- **Quando aparece:** Senha incorreta, email já existe
- **Mensagem:** Destacar erro específico
- **Ação de recuperação:** Correção e nova tentativa

#### Success State
- **Quando aparece:** Após qualquer ação bem-sucedida
- **Feedback:** Toast apropriado
- **Mensagens:**
  - "Perfil atualizado!"
  - "Senha alterada com sucesso"
  - "Foto atualizada"
  - "Sessão encerrada em outro dispositivo"

### 5.7 Regras de Negócio

1. **Email único:** Não pode haver emails duplicados no sistema
2. **Senha forte:** Mínimo 8 caracteres, 1 letra maiúscula, 1 minúscula, 1 número, 1 especial
3. **Histórico de senhas:** Últimas 5 senhas não podem ser reutilizadas
4. **Alteração de senha:** Requer senha atual (exceto reset por email)
5. **Foto:** Tamanho máximo 2MB, formatos JPG/PNG
6. **Logout:** Pode ter confirmação opcional (configurável nas preferências)
7. **Desativação:** Contas desativadas podem ser reativadas em até 30 dias
8. **Exclusão LGPD:** Processo de exclusão leva até 30 dias, com confirmação por email

### 5.8 Integrações

#### Com Outras Telas
- Navega para: Planos e Preços, Configurações da Empresa
- Recebe de: Todos os módulos (acesso ao perfil)

#### Com Outros Módulos
- **Módulo Financeiro:** Faturas e dados de pagamento
- **Sistema de Autenticação:** Login, logout, sessões
- **Gateway de Pagamento:** Dados da assinatura

---

## 6. Componentes Específicos do Módulo

### 6.1 Card de Insight do MEL
**Uso:** Dashboard MEL, notificações
**Props necessárias:**
- Tipo do insight (Vendas, Estoque, Clientes, Financeiro)
- Título/mensagem principal
- Valor/dado relevante
- Tendência (crescente, decrescente, estável)
- Ícone/contexto visual
- Data/hora do insight
- CTA (ação sugerida)

**Funcionalidades:**
- Expandir para ver detalhes
- Marcar como lido/concluído
- Compartilhar
- Dar feedback (útil/não útil)

### 6.2 Status Card (WhatsApp/Integrações)
**Uso:** Dashboard MEL, Configurações
**Props necessárias:**
- Nome da integração
- Status (Conectado/Desconectado/Pendente)
- Última atualização
- Ícone da integração
- Ações disponíveis

**Funcionalidades:**
- Indicador visual de status
- Botão de teste
- Botão de reconectar/desconectar

### 6.3 Item de Ação Sugerida
**Uso:** Lista de tarefas no Dashboard MEL
**Props necessárias:**
- Título da ação
- Descrição/contexto
- Prioridade (Alta/Média/Baixa)
- Origem (qual módulo gerou)
- Prazo (se aplicável)
- Status (Pendente/Concluída/Ignorada)

**Funcionalidades:**
- Marcar como concluída
- Agendar para depois
- Ignorar
- Ver detalhes/contexto

### 6.4 Preview de Mensagem MEL
**Uso:** Configurações do MEL
**Props necessárias:**
- Tom de voz selecionado
- Exemplo de mensagem
- Uso de emojis (sim/não)
- Nível de detalhe

**Funcionalidades:**
- Atualização em tempo real conforme configurações mudam
- Alternar entre diferentes exemplos

---

## 7. Integrações

### 7.1 Fluxos Principais

```
Dashboard MEL
    ↓
Configurações do MEL / Histórico de Insights / Ações nos Módulos

Configurações da Empresa
    ↓
Configurações do MEL / Minha Conta

Minha Conta
    ↓
Planos / Configurações da Empresa / Logout
```

### 7.2 Integrações por Módulo

| Módulo | Integração | Dados Trocados |
|--------|------------|----------------|
| **MEL (IA)** | Inteligência proativa | Insights, alertas, sugestões |
| **WhatsApp Business** | Canal de comunicação | Envio/recebimento de mensagens |
| **Estoque** | Dados para insights | Alertas de baixo estoque |
| **Vendas** | Dados para insights | Comparativos, metas |
| **Financeiro** | Dados para insights | Vencimentos, projeções |
| **CRM** | Dados para insights | Follow-ups, clientes inativos |
| **Financeiro (Assinatura)** | Dados de pagamento | Faturas, plano, renovação |

### 7.3 Fluxo de Dados

1. **Dados dos Módulos** → Analisados pela IA do MEL → Insights gerados
2. **Configurações do MEL** → Definem quando/como enviar insights → WhatsApp/Email/Push
3. **Configurações da Empresa** → Usadas em documentos e relatórios
4. **Dados da Conta** → Personalização da experiência do usuário
5. **Ações no Dashboard MEL** → Podem criar tarefas em outros módulos

---

## 8. Regras de Negócio

### 8.1 Regras do MEL

1. **Insights personalizados:** Baseados nos dados que o usuário permitiu acessar
2. **Limite de frequência:** Máximo 1 insight por hora (exceto alertas críticos)
3. **Horário de respeito:** Nunca envia fora do horário configurado
4. **Priorização:** Alertas críticos (estoque zero) > Urgentes > Informativos
5. **Feedback loop:** Insights marcados como "não úteis" não se repetem
6. **Aprendizado:** MEL aprende preferências do usuário ao longo do tempo
7. **Privacidade:** Dados analisados localmente, nunca compartilhados

### 8.2 Regras de Configurações

1. **Permissões:** Apenas Admin e Gestor podem alterar configurações globais
2. **Usuário comum:** Pode alterar apenas própria conta e preferências pessoais
3. **Configurações por empresa:** Algumas configurações são globais (afetam todos)
4. **Herança:** Novos usuários herdam configurações padrão da empresa

### 8.3 Regras de Segurança

1. **Senha:** Mínimo 8 caracteres, complexidade obrigatória
2. **Sessões:** Timeout de inatividade (30 min padrão)
3. **2FA:** Opcional mas recomendado para Admin
4. **Dados sensíveis:** CNPJ e documentos são criptografados
5. **LGPD:** Usuário pode solicitar exportação ou exclusão de dados

### 8.4 Regras de Assinatura

1. **Limite de uso:** Controle por quantidade de clientes, usuários e armazenamento
2. **Upgrade/Downgrade:** Alteração imediata ou no próximo ciclo
3. **Cancelamento:** Acesso mantido até fim do período pago
4. **Renovação:** Automática com alerta prévio (7 dias)
5. **Grace period:** 3 dias de tolerância em caso de falha no pagamento

---

## 9. Checklist de Qualidade

Antes de enviar ao Figma Make, verifique:

### ✅ Funcionalidade
- [ ] Todas as user stories estão claras e no formato correto
- [ ] Todos os dados a exibir estão listados
- [ ] Todas as funcionalidades essenciais estão documentadas
- [ ] Todos os campos de formulário têm tipo, obrigatoriedade e validações
- [ ] Todas as ações possíveis estão descritas (primárias, secundárias, destruição)
- [ ] Todas as regras de negócio estão explícitas
- [ ] Permissões de acesso estão claras

### ✅ Estados de UI
- [ ] Empty state descrito (primeiro acesso, sem dados, desconectado)
- [ ] Loading state descrito
- [ ] Error state descrito
- [ ] Success state descrito

### ✅ Integrações
- [ ] Integrações com outros módulos listadas
- [ ] Fluxos entre telas mapeados
- [ ] APIs/serviços identificados

### ❌ Proibido (Conforme Matriz)
- [ ] Nenhum wireframe ou desenho ASCII
- [ ] Nenhuma especificação de posicionamento ("botão à direita", "card no topo")
- [ ] Nenhuma cor hexadecimal
- [ ] Nenhum tamanho em pixels
- [ ] Nenhuma fonte específica
- [ ] Nenhuma descrição de layout ("duas colunas", "sidebar")
- [ ] Nenhuma animação detalhada

### 🎯 Teste Final
> "Se eu fosse um designer talentoso recebendo este documento pela primeira vez, teria liberdade suficiente para criar algo incrível e inovador?"

**Resposta: SIM** ✅ - Documento pronto para Figma Make!

---

## 10. Prompt para Figma Make

```
Crie designs para o Módulo MEL + Configurações de um sistema SaaS para pequenos empreendedores.

CONTEXTO DO PRODUTO:
- Produto: UNIQ Empresas - Plataforma SaaS para pequenos empreendedores
- Tipo: Aplicação web responsiva
- Público-alvo: Donos de pequenas empresas (MEI/Micro), não técnicos, sempre na correria
- Tom de voz: Simples, profissional, acolhedor, "Você consegue!", sem jargões técnicos
- Diferencial: MEL (IA Proativa) que monitora o negócio 24h e envia insights via WhatsApp

TELAS NECESSÁRIAS (4 telas):

1. DASHBOARD MEL (/mel)
- Objetivo: Visão central dos insights e recomendações da IA
- Funcionalidades: Cards de insights (vendas, estoque, clientes, financeiro), lista de ações sugeridas, status WhatsApp, histórico de insights
- Cards de exemplo: "Você vendeu 20% mais que ontem!", "Camiseta Preta está acabando (2 unidades)", "3 clientes sem comprar há 30 dias"
- Ações: Concluir tarefa, ver histórico, testar conexão WhatsApp
- Estados: Primeiro acesso (MEL se apresentando), sem insights recentes, WhatsApp desconectado, loading
- Destaque visual: MEL deve ter presença forte - avatar amigável, cards coloridos, tom encorajador

2. CONFIGURAÇÕES DO MEL (/mel/configuracoes)
- Objetivo: Personalizar comportamento e preferências da IA
- Funcionalidades: Canais de notificação (WhatsApp, email, push), horários de envio, tipos de alertas, tom de voz do MEL
- Seções: Canais (toggles), Horários (time pickers), Tipos de Alertas (vendas, estoque, clientes, financeiro), Tom de Voz (radio buttons: Descontraído/Profissional/Parceiro)
- Preview ao vivo: Mostra exemplo de mensagem com configurações atuais
- Estados: Primeira configuração, salvando, erro de validação
- Destaque: Interface simples e intuitiva, sem jargões técnicos

3. CONFIGURAÇÕES DA EMPRESA (/configuracoes/empresa)
- Objetivo: Gerenciar dados cadastrais e preferências da plataforma
- Funcionalidades: Dados da empresa (razão social, CNPJ, logo), endereço (com autocompletar CEP), contatos, preferências (moeda, idioma, formato de data), integrações
- Upload de logo com preview
- Estados: Dados incompletos, salvando, erro
- Destaque: Formulário organizado em seções claras, validações em tempo real

4. MINHA CONTA (/configuracoes/conta)
- Objetivo: Gerenciar perfil pessoal, segurança e assinatura
- Funcionalidades: Dados pessoais (foto, nome, email, telefone), alteração de senha (com força da senha), tema (claro/escuro), gerenciamento de assinatura (plano, uso, faturas, upgrade/downgrade), logout
- Seções: Dados Pessoais, Segurança, Tema, Assinatura, Ações da Conta
- Estados: Nova conta, salvando, senha alterada com sucesso
- Destaque: Seção de assinatura com visualização clara do plano e limites

ESTILO DESEJADO:
- Design moderno, profissional mas acolhedor
- MEL deve ter presença visual marcante - personagem/avatar amigável
- Priorize clareza e facilidade de uso - o usuário não é técnico
- Interface que parece "fazer sentido" e não assusta
- Hierarquia visual clara - informações importantes em destaque
- Cores que transmitam confiança e energia
- Mobile-first (80% dos acessos são mobile)
- Cards bem definidos com sombras sutis
- Feedback visual claro nas ações (sucesso, erro, loading)

REGRAS IMPORTANTES:
- MEL deve aparecer como consultor virtual, não como robô
- Tom de voz acolhedor e encorajador em todos os textos
- Evitar termos técnicos (API, webhook, etc.) - usar linguagem do dia a dia
- Configurações devem ter valores padrão inteligentes
- Todos os formulários devem ter validações claras
- Estados vazios devem ser amigáveis e com CTAs claros

Use sua criatividade para criar uma experiência onde o empreendedor se sinta acompanhado e apoiado pelo MEL, como se tivesse um consultor dedicado trabalhando para seu sucesso!
```

---

**Documento criado seguindo rigorosamente a Matriz de Documentação UI UNIQ**  
**Status:** ✅ Pronto para Figma Make  
**Data:** Março 2025
