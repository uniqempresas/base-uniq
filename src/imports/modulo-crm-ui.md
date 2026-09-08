# Módulo CRM - Documentação UI

> **Documentação de UI para Figma Make**  
> **Produto:** UNIQ Empresas - Plataforma SaaS  
> **Público:** Empreendedores na correria (MEI/Micro)  
> **Data:** Março 2025  
> **Status:** Pronto para Figma Make

---

## 1. Visão Geral do Módulo

### 1.1 Propósito
O módulo CRM (Gestão de Clientes) centraliza todas as interações comerciais, permitindo que pequenos empreendedores organizem contatos, acompanhem negociações e nunca percam uma oportunidade de venda.

### 1.2 Problema que Resolve
- ❌ Planilhas dispersas e desatualizadas
- ❌ Falta de histórico de conversas com clientes  
- ❌ Dificuldade em acompanhar onde cada negociação está
- ❌ Esquecimento de follow-ups importantes

### 1.3 Solução
- ✅ Base de clientes organizada e acessível
- ✅ Histórico completo de interações
- ✅ Pipeline visual de vendas
- ✅ Alertas de follow-up via MEL (IA Proativa)

### 1.4 Integrações com Outros Módulos
- **Financeiro:** Histórico de vendas, inadimplência
- **Agenda:** Compromissos de follow-up, reuniões
- **Vendas:** Orçamentos em aberto, histórico de compras
- **WhatsApp:** Envio de mensagens diretas
- **MEL (IA):** Sugestões de ação, alertas inteligentes

---

## 2. Tela 1: Lista de Clientes

### 2.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Lista de Clientes |
| **Rota/URL** | `/crm/clientes` |
| **Objetivo Principal** | Visualizar, buscar e gerenciar todos os clientes cadastrados no sistema |
| **Permissões de Acesso** | Visualização: Todos os usuários | Edição: Vendedor (próprios clientes), Gestor (todos) | Exclusão: Gestor e Admin apenas |
| **Módulo/Pai** | Módulo CRM |
| **Prioridade MVP** | ✅ Essencial |

### 2.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Vendedores e gestores comerciais
- **Conhecimento técnico:** Baixo a médio (não é técnico)
- **Contexto de uso:** Usada diariamente, múltiplas vezes ao dia, durante ligações e atendimentos

#### Por Que Esta Tela Existe
- **Problema que resolve:** Centralizar o acesso à base de clientes, eliminando planilhas dispersas
- **Valor entregue:** Acesso rápido a informações completas do cliente, dados para contato e histórico
- **Frequência de uso:** Múltiplas vezes ao dia

#### User Stories Relacionadas
- "Como vendedor, quero ver todos os meus clientes em um só lugar para não precisar consultar planilhas"
- "Como vendedor, quero buscar cliente por nome ou telefone rapidamente para encontrar informações durante uma ligação"
- "Como gestor, quero filtrar por vendedor para acompanhar o trabalho da equipe"
- "Como vendedor, quero enviar mensagem WhatsApp direto da lista para agilizar o contato"

### 2.3 Elementos Obrigatórios

#### Dados a Exibir (por cliente)
- [ ] **Foto/Avatar:** Imagem do cliente ou ícone padrão
- [ ] **Nome/Razão Social:** Nome completo ou razão social da empresa
- [ ] **Tipo:** Indicador se é Pessoa Física (PF) ou Jurídica (PJ)
- [ ] **Telefone principal:** Número principal de contato
- [ ] **Tags/Etiquetas:** Marcadores visuais para segmentação (VIP, Prospect, Inadimplente, etc.)
- [ ] **Última interação:** Data da última vez que houve contato
- [ ] **Valor total em compras:** Quanto o cliente já comprou no total (moeda R$)
- [ ] **Status:** Se está ativo ou inativo no sistema

#### Funcionalidades Essenciais
- [ ] **Busca rápida:** Campo para buscar por nome, telefone, email ou CPF/CNPJ
- [ ] **Filtros avançados:** Filtrar por tipo (PF/PJ), tags, vendedor responsável, status, data de cadastro
- [ ] **Novo cliente:** Cadastrar novo cliente no sistema
- [ ] **Ver detalhes:** Acessar ficha completa do cliente
- [ ] **Editar:** Alterar dados do cliente
- [ ] **Enviar mensagem:** Iniciar conversa via WhatsApp
- [ ] **Excluir:** Remover cliente do sistema (com confirmação)
- [ ] **Importar/Exportar:** Upload de CSV e download em Excel
- [ ] **Toggle visualização:** Alternar entre modo tabela e modo cards

#### Campos de Formulário de Busca/Filtro
| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Termo de busca | Texto | Não | Busca em nome, telefone, email, documento |
| Tipo | Select | Não | Opções: Todos, PF, PJ |
| Tags | Multi-select | Não | Lista de tags disponíveis |
| Vendedor | Select | Não | Lista de vendedores (apenas gestores veem todos) |
| Status | Select | Não | Opções: Todos, Ativo, Inativo |
| Data de cadastro | Date Range | Não | Período inicial e final |

### 2.4 Elementos Opcionais

#### Funcionalidades Adicionais
- [ ] **Atribuir vendedor:** Transferir cliente para outro vendedor
- [ ] **Adicionar/remover etiquetas:** Em lote
- [ ] **Paginação ou scroll infinito:** Para grandes volumes

#### Dados Secundários
- [ ] Email do cliente
- [ ] CPF/CNPJ (máscarado parcialmente)
- [ ] Cidade/UF

### 2.5 Ações Possíveis

#### Ações Primárias
1. **Cadastrar novo cliente:**
   - **Gatilho:** Botão principal visível na interface
   - **Resultado:** Abre modal ou navega para formulário de cadastro
   - **Confirmação:** Não necessária

2. **Buscar cliente:**
   - **Gatilho:** Digitar no campo de busca
   - **Resultado:** Lista filtrada em tempo real
   - **Confirmação:** Não necessária

3. **Visualizar ficha completa:**
   - **Gatilho:** Clicar no nome do cliente
   - **Resultado:** Navega para página de detalhes `/crm/clientes/:id`
   - **Confirmação:** Não necessária

#### Ações Secundárias
1. **Enviar WhatsApp:** Inicia conversa com número do cliente
2. **Editar cliente:** Abre modal de edição
3. **Aplicar filtros avançados:** Expande painel de filtros
4. **Exportar para Excel:** Download da lista filtrada
5. **Importar clientes:** Upload de arquivo CSV

#### Ações de Destruição
1. **Excluir cliente:**
   - **Gatilho:** Botão de exclusão nas ações do cliente
   - **Confirmação:** Modal de confirmação obrigatório
   - **Mensagem:** "Tem certeza que deseja excluir [Nome]? Esta ação não pode ser desfeita."
   - **Validação:** Checkbox "Entendo que todos os dados serão removidos"
   - **Regra de negócio:** Cliente com negociações em andamento não pode ser excluído (apenas inativado)

### 2.6 Estados da UI

#### Empty State - Lista Vazia
- **Quando aparece:** Usuário ainda não tem clientes cadastrados
- **Mensagem:** "Nenhum cliente cadastrado"
- **Descrição:** "Comece adicionando seu primeiro cliente ao CRM"
- **CTA primário:** "Cadastrar primeiro cliente"
- **CTA secundário:** "Importar via CSV"
- **Dica:** "Você também pode importar seus contatos em massa"

#### Empty State - Busca Sem Resultados
- **Quando aparece:** Busca ou filtros não retornam resultados
- **Mensagem:** "Nenhum resultado encontrado"
- **Descrição:** "Tente ajustar seus filtros ou termos de busca"
- **CTA:** "Limpar filtros"

#### Loading State
- **Quando aparece:** Carregando lista inicial ou aplicando filtros
- **Tipo:** Skeleton de linhas simulando a tabela/cards
- **Mensagem:** "Carregando clientes..."

#### Error State
- **Quando aparece:** Falha ao carregar dados do servidor
- **Mensagem:** "Não foi possível carregar os clientes"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State
- **Quando aparece:** Após cadastrar, editar ou excluir cliente
- **Feedback:** Toast temporário
- **Mensagens:**
  - "Cliente cadastrado com sucesso!"
  - "Cliente atualizado"
  - "Cliente removido"

### 2.7 Regras de Negócio

1. **CPF/CNPJ único:** Não pode haver dois clientes com mesmo documento
2. **Email único:** Se informado, email deve ser único no sistema
3. **Telefone único:** Telefone principal deve ser único
4. **Permissão de exclusão:** Apenas gestores e admin podem excluir
5. **Cliente próprio:** Vendedores só veem e editam seus próprios clientes (exceto gestores que veem todos)
6. **Cliente inativo:** Não aparece em buscas padrão, mas mantém histórico
7. **Exclusão bloqueada:** Cliente com negociações em andamento não pode ser excluído, apenas inativado
8. **Autopreenchimento:** Ao informar CEP no cadastro, endereço é preenchido automaticamente via API

### 2.8 Integrações

#### Com Outras Telas
- Navega para: Ficha do Cliente (`/crm/clientes/:id`), Cadastro de Cliente
- Recebe de: Dashboard CRM, Pipeline de Vendas

#### Com Outros Módulos
- **Módulo Financeiro:** Valor total em compras vem do histórico financeiro
- **Módulo Pipeline:** Vinculação com negociações em andamento
- **Módulo WhatsApp:** Integração para envio de mensagens

---

## 3. Tela 2: Ficha do Cliente

### 3.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Ficha do Cliente |
| **Rota/URL** | `/crm/clientes/:id` |
| **Objetivo Principal** | Visualização completa de todas as informações do cliente e histórico de interações |
| **Permissões de Acesso** | Visualização: Todos os usuários | Edição: Vendedor (próprios clientes), Gestor (todos) |
| **Módulo/Pai** | Módulo CRM |
| **Prioridade MVP** | ✅ Essencial |

### 3.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Vendedor consultando histórico antes de ligação; Gestor analisando perfil
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Momento de preparação para contato, cadastro de dados, análise de histórico

#### Por Que Esta Tela Existe
- **Problema que resolve:** Ter uma visão 360° do cliente em um só lugar
- **Valor entregue:** Contexto completo para conversas personalizadas e decisões informadas
- **Frequência de uso:** Várias vezes ao dia, durante atendimentos

#### User Stories Relacionadas
- "Como vendedor, quero ver o histórico completo do cliente para entender o contexto antes de ligar"
- "Como vendedor, quero registrar uma interação rapidamente para manter o histórico atualizado"
- "Como gestor, quero ver todas as negociações do cliente para entender o potencial"
- "Como vendedor, quero ver dados de contato de forma clara para fazer follow-up"

### 3.3 Elementos Obrigatórios

#### Header do Cliente
- [ ] **Foto/Avatar grande:** Imagem do cliente ou placeholder
- [ ] **Nome completo/Razão social:** Destaque principal
- [ ] **Tipo:** Badge indicando PF ou PJ
- [ ] **Tags coloridas:** Todas as etiquetas associadas
- [ ] **Botões de ação rápida:** Editar, enviar mensagem, agendar

#### Abas de Navegação
1. **Resumo** - Informações principais em cards:
   - Dados de contato (telefone, email, WhatsApp com botões de ação)
   - Endereço completo
   - Vendedor responsável
   - Valor total em compras
   - Última compra
   - Status (Ativo/Inativo)

2. **Interações** - Timeline completa:
   - Histórico de todas as interações cronológicas
   - Tipo (ligação, email, WhatsApp, reunião, visita) com ícones
   - Data/hora
   - Descrição detalhada
   - Quem registrou
   - Follow-ups pendentes destacados visualmente

3. **Negociações** - Pipeline atual:
   - Negociações em andamento com status
   - Histórico de negociações concluídas (ganho/perdido)
   - Valor, etapa, probabilidade

4. **Dados Completos** - Formulário completo:
   - Todos os campos de cadastro (PF ou PJ)
   - Informações fiscais (se PJ)
   - Observações gerais
   - Dados de contato completos

#### Funcionalidades Essenciais
- [ ] **Editar dados:** Alterar informações do cliente
- [ ] **Adicionar interação:** Registrar novo contato
- [ ] **Criar negociação:** Iniciar nova oportunidade de venda
- [ ] **Enviar mensagem:** WhatsApp ou Email
- [ ] **Agendar follow-up:** Criar lembrete na agenda
- [ ] **Anexar documento:** Upload de arquivos relacionados
- [ ] **Inativar/Ativar:** Mudar status do cliente

### 3.4 Campos de Formulário

#### Cadastro Cliente PF
| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Foto | Upload | Não | JPG/PNG, max 2MB |
| Tipo | Select | Sim | Default: PF |
| Nome Completo | Text | Sim | Min 3 caracteres |
| CPF | Masked Text | Sim | Formato 000.000.000-00, validação dígitos |
| RG | Text | Não | - |
| Data de Nascimento | Date | Não | Idade > 18 |
| Email | Email | Não | Formato válido, único |
| Telefone Principal | Phone | Sim | Formato (00) 00000-0000, único |
| Telefone Secundário | Phone | Não | - |
| WhatsApp | Phone | Não | Checkbox "Mesmo que telefone principal" |
| CEP | Masked Text | Não | Formato 00000-000 |
| Logradouro | Text | Não | Auto-fill via CEP |
| Número | Text | Não | - |
| Complemento | Text | Não | - |
| Bairro | Text | Não | Auto-fill via CEP |
| Cidade | Text | Não | Auto-fill via CEP |
| Estado | Select | Não | Auto-fill via CEP |
| Origem | Select | Não | Indicação, Site, Redes Sociais, etc |
| Vendedor Responsável | Select | Sim | Default: usuário logado |
| Tags | Multi-select | Não | Chips coloridos |
| Observações | Textarea | Não | Max 2000 caracteres |

#### Cadastro Cliente PJ
| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Logo | Upload | Não | JPG/PNG, max 2MB |
| Tipo | Select | Sim | Default: PJ |
| Razão Social | Text | Sim | Min 3 caracteres |
| Nome Fantasia | Text | Não | - |
| CNPJ | Masked Text | Sim | Formato 00.000.000/0000-00, validação |
| Inscrição Estadual | Text | Não | - |
| Email Comercial | Email | Não | Formato válido |
| Telefone Comercial | Phone | Sim | - |
| Site | URL | Não | Formato válido |
| Nome do Responsável | Text | Não | - |
| Cargo | Text | Não | - |
| CPF do Responsável | Masked Text | Não | Validação |
| Email do Responsável | Email | Não | - |
| Telefone do Responsável | Phone | Não | - |
| Endereço | (Mesmos campos do PF) | Não | Auto-fill via CEP |
| Origem | Select | Não | Indicação, Site, Redes Sociais, etc |
| Vendedor Responsável | Select | Sim | Default: usuário logado |
| Tags | Multi-select | Não | Chips coloridos |
| Observações | Textarea | Não | Max 2000 caracteres |

### 3.5 Ações Possíveis

#### Ações Primárias
1. **Editar dados:**
   - **Gatilho:** Botão de edição no header
   - **Resultado:** Formulário entra em modo edição
   - **Confirmação:** Não necessária para iniciar, "Salvar" para confirmar

2. **Adicionar interação:**
   - **Gatilho:** Botão na aba Interações ou header
   - **Resultado:** Abre modal de nova interação
   - **Confirmação:** Não necessária

3. **Criar negociação:**
   - **Gatilho:** Botão na aba Negociações ou header
   - **Resultado:** Abre modal de nova negociação
   - **Confirmação:** Não necessária

#### Ações Secundárias
1. **Enviar mensagem:** WhatsApp ou Email
2. **Agendar follow-up:** Criar compromisso na agenda
3. **Anexar documento:** Upload de arquivo
4. **Duplicar cliente:** Criar novo baseado neste
5. **Inativar/Ativar:** Mudar status

### 3.6 Estados da UI

#### Empty State - Sem Interações
- **Quando aparece:** Aba de interações sem registros
- **Mensagem:** "Nenhuma interação registrada"
- **Descrição:** "Registre suas conversas e contatos para manter o histórico"
- **CTA:** "Adicionar primeira interação"

#### Empty State - Sem Negociações
- **Quando aparece:** Aba de negociações sem registros
- **Mensagem:** "Nenhuma negociação"
- **Descrição:** "Este cliente ainda não tem oportunidades registradas"
- **CTA:** "Criar primeira oportunidade"

#### Loading State
- **Quando aparece:** Carregando dados do cliente
- **Tipo:** Skeleton das abas e conteúdo
- **Mensagem:** "Carregando dados do cliente..."

#### Error State
- **Quando aparece:** Falha ao carregar dados do cliente
- **Mensagem:** "Não foi possível carregar os dados"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State
- **Quando aparece:** Após salvar edições, adicionar interação
- **Feedback:** Toast temporário
- **Mensagens:**
  - "Dados atualizados com sucesso"
  - "Interação registrada"
  - "Negociação criada"

### 3.7 Regras de Negócio

1. **CPF/CNPJ único:** Não pode cadastrar duplicado no sistema
2. **Permissões de edição:** Vendedor edita apenas seus próprios clientes; Gestor edita todos
3. **Histórico preservado:** Todas as interações e negociações são mantidas mesmo se cliente for inativado
4. **Validação de CEP:** Ao informar CEP válido, endereço é preenchido automaticamente
5. **Unicidade de contato:** Email e telefone principal devem ser únicos (se informados)
6. **Auditoria:** Todas as alterações devem registrar quem modificou e quando

### 3.8 Integrações

#### Com Outras Telas
- Navega para: Lista de Clientes, Pipeline (negociações), Agenda (follow-ups)
- Recebe de: Lista de Clientes, Dashboard CRM, Pipeline

#### Com Outros Módulos
- **Módulo Agenda:** Exibe compromissos de follow-up do cliente
- **Módulo Financeiro:** Mostra histórico de compras e pagamentos
- **Módulo Pipeline:** Lista negociações em andamento e histórico
- **Módulo WhatsApp:** Permite enviar mensagem diretamente

---

## 4. Tela 3: Pipeline de Vendas

### 4.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Pipeline de Vendas |
| **Rota/URL** | `/crm/pipeline` |
| **Objetivo Principal** | Visualizar e gerenciar todas as negociações em andamento no funil de vendas |
| **Permissões de Acesso** | Visualização: Todos os usuários | Edição: Vendedor (próprias negociações), Gestor (todas) |
| **Módulo/Pai** | Módulo CRM |
| **Prioridade MVP** | ✅ Essencial |

### 4.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Vendedor gerenciando oportunidades diariamente; Gestor acompanhando performance
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Reuniões de pipeline, planejamento diário, acompanhamento de metas

#### Por Que Esta Tela Existe
- **Problema que resolve:** Visualizar de forma clara onde cada negociação está no processo de vendas
- **Valor entregue:** Foco nas oportunidades certas, previsibilidade de receita, organização do trabalho
- **Frequência de uso:** Diária, múltiplas vezes

#### User Stories Relacionadas
- "Como vendedor, quero ver todas as minhas oportunidades organizadas para saber o que focar hoje"
- "Como vendedor, quero mover uma negociação de etapa quando avançar no processo"
- "Como gestor, quero ver o pipeline de todos os vendedores para acompanhar a equipe"
- "Como vendedor, quero saber quais negociações estão paradas há muito tempo"

### 4.3 Elementos Obrigatórios

#### Filtros e Controles
- [ ] **Filtro por vendedor:** Selecionar qual(is) vendedor(es) visualizar
- [ ] **Filtro por período:** Data prevista de fechamento
- [ ] **Filtro por valor:** Valor mínimo e máximo da negociação
- [ ] **Botão "Nova Negociação":** Criar nova oportunidade
- [ ] **Toggle visualização:** Alternar entre Kanban e Lista

#### Board/Kanban
- [ ] **Colunas configuráveis (etapas do funil):**
  - Prospectando
  - Primeiro contato
  - Proposta enviada
  - Negociação
  - Fechamento
  - Ganho (coluna opcional)
  - Perdido (coluna opcional)

- [ ] **Cards de negociação com:**
  - Nome da oportunidade
  - Cliente (foto + nome)
  - Valor estimado (moeda R$)
  - Probabilidade (%)
  - Data prevista de fechamento
  - Próxima ação
  - Tags coloridas
  - Indicador visual de atraso (se aplicável)

- [ ] **Contador por coluna:** Quantidade de negociações e valor total

#### Funcionalidades Essenciais
- [ ] **Mover negociação:** Arrastar card entre colunas (drag and drop)
- [ ] **Criar nova negociação:** Adicionar nova oportunidade
- [ ] **Editar negociação:** Alterar dados da oportunidade
- [ ] **Visualizar detalhes:** Ver informações completas
- [ ] **Filtrar:** Por vendedor, período, valor
- [ ] **Fechar negociação:** Marcar como Ganho ou Perdido

### 4.4 Campos de Formulário

#### Nova Negociação
| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Título da Negociação | Text | Sim | Min 3 caracteres |
| Cliente | Search/Select | Sim | Busca por nome/telefone |
| Valor Estimado | Currency | Não | > 0 |
| Etapa do Pipeline | Select | Sim | Default: primeira etapa |
| Probabilidade | Slider/Select | Não | 0-100%, default por etapa |
| Data Prevista de Fechamento | Date | Não | Futura |
| Fonte do Lead | Select | Não | Mesmas opções de origem do cliente |
| Vendedor Responsável | Select | Sim | Default: usuário logado |
| Produtos/Serviços de Interesse | Multi-select | Não | - |
| Descrição/Observações | Textarea | Não | Max 2000 caracteres |
| Próxima Ação | Text | Não | - |
| Data da Próxima Ação | DateTime | Não | - |

#### Movimentação no Pipeline
| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Nova Etapa | Select | Sim | Etapa de destino |
| Motivo da Mudança | Select/Text | Condicional | Obrigatório se para "Perdido" |
| Valor Atualizado | Currency | Não | - |
| Probabilidade Atualizada | Slider | Não | 0-100% |
| Data de Fechamento Atualizada | Date | Não | - |
| Comentário | Textarea | Não | Max 1000 caracteres |

### 4.5 Ações Possíveis

#### Ações Primárias
1. **Criar nova negociação:**
   - **Gatilho:** Botão principal visível
   - **Resultado:** Abre modal de cadastro
   - **Confirmação:** Não necessária

2. **Mover negociação entre etapas:**
   - **Gatilho:** Arrastar card de uma coluna para outra (drag and drop)
   - **Resultado:** Abre modal de movimentação com confirmação
   - **Confirmação:** Sim, obrigatória

3. **Visualizar detalhes da negociação:**
   - **Gatilho:** Clicar no card
   - **Resultado:** Abre modal ou navega para página de detalhes
   - **Confirmação:** Não necessária

#### Ações Secundárias
1. **Editar negociação:** Alterar dados
2. **Arquivar negociação:** Remover do pipeline ativo
3. **Filtrar por vendedor:** Visualizar pipeline específico
4. **Exportar pipeline:** Download dos dados

#### Ações de Fechamento
1. **Marcar como Ganho:**
   - **Gatilho:** Mover para coluna "Ganho"
   - **Confirmação:** Modal obrigatório
   - **Campos:** Valor final, data de fechamento, motivo/como vencemos
   - **Ações adicionais:** Gerar pedido automaticamente (opcional)

2. **Marcar como Perdido:**
   - **Gatilho:** Mover para coluna "Perdido" ou botão específico
   - **Confirmação:** Modal obrigatório
   - **Campos obrigatórios:** Motivo da perda (Preço, Produto não atendeu, Concorrente, Desistiu, Não conseguiu contato, Outro)
   - **Campos opcionais:** Detalhes do motivo, o que poderia ter feito diferente, data para reengajamento

### 4.6 Estados da UI

#### Empty State - Pipeline Vazio
- **Quando aparece:** Nenhuma negociação no pipeline
- **Mensagem:** "Pipeline vazio"
- **Descrição:** "Crie sua primeira oportunidade de venda"
- **CTA primário:** "Nova negociação"
- **Ilustração:** Funil vazio ou representação de início de vendas

#### Empty State - Coluna Vazia
- **Quando aparece:** Coluna específica sem negociações
- **UI:** Placeholder sutil indicando ausência de dados (sem mensagem intrusiva)

#### Empty State - Filtros Sem Resultados
- **Quando aparece:** Filtros aplicados não retornam negociações
- **Mensagem:** "Nenhuma negociação encontrada"
- **Descrição:** "Tente ajustar seus filtros"
- **CTA:** "Limpar filtros"

#### Loading State
- **Quando aparece:** Carregando pipeline inicial
- **Tipo:** Skeleton das colunas e cards placeholder
- **Mensagem:** "Carregando pipeline..."

#### Error State
- **Quando aparece:** Falha ao carregar dados do pipeline
- **Mensagem:** "Não foi possível carregar o pipeline"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State
- **Quando aparece:** Após mover negociação, criar nova, fechar como ganho/perdido
- **Feedback:** Toast temporário
- **Mensagens:**
  - "Negociação movida para [Etapa]"
  - "Negociação criada com sucesso"
  - "Parabéns! Negociação ganha! 🎉"
  - "Negociação marcada como perdida"

### 4.7 Regras de Negócio

1. **Movimentação:** Negociações podem ser movidas entre etapas livremente, exceto para "Ganho" ou "Perdido" que requerem confirmação
2. **Motivo obrigatório:** Ao mover para "Perdido", é obrigatório informar o motivo
3. **Permissões:** Vendedores só movem/editam suas próprias negociações; Gestores têm acesso total
4. **Probabilidade padrão:** Cada etapa tem uma probabilidade padrão (ex: Proposta enviada = 50%)
5. **Alerta de parada:** Negociações sem movimentação por +7 dias devem gerar alerta do MEL (IA Proativa)
6. **Valor do pipeline:** Soma dos valores das negociações em andamento (exceto Ganho/Perdido)
7. **Data prevista:** Não pode ser data passada
8. **Exclusão:** Negociações não são excluídas, apenas arquivadas

### 4.8 Integrações

#### Com Outras Telas
- Navega para: Detalhes da Negociação, Ficha do Cliente
- Recebe de: Dashboard CRM, Lista de Clientes

#### Com Outros Módulos
- **Módulo Clientes:** Vinculação com ficha do cliente
- **Módulo Agenda:** Follow-ups e compromissos relacionados
- **Módulo Financeiro:** Ao ganhar, pode gerar pedido/faturamento
- **Módulo Relatórios:** Dados para análise de conversão
- **MEL (IA):** Alertas de follow-up, sugestões de ação

---

## 5. Componentes Específicos do Módulo CRM

### 5.1 Card de Cliente
**Uso:** Lista de clientes, resultados de busca
**Props necessárias:**
- Foto/Avatar (ou placeholder)
- Nome/Razão Social
- Tipo (PF/PJ) com indicador visual
- Telefone principal
- Tags/Etiquetas coloridas
- Última interação (data)
- Valor total em compras (moeda)
- Status (Ativo/Inativo)

**Funcionalidades:**
- Clique para ver detalhes
- Ações rápidas no hover (WhatsApp, Editar)
- Indicador visual de cliente inativo

### 5.2 Timeline de Interações
**Uso:** Ficha do cliente, visualização de histórico
**Features:**
- Agrupamento por data (Hoje, Ontem, Esta semana, Mês)
- Ícones por tipo de interação (ligação, email, WhatsApp, reunião, visita)
- Cores ou indicadores por sentimento (positivo, neutro, negativo)
- Expandir/Colapsar descrição detalhada
- Follow-ups pendentes destacados visualmente
- Indicação de anexos

**Props necessárias:**
- Tipo de interação
- Data/hora
- Assunto
- Descrição
- Autor
- Sentimento (opcional)
- Anexos (opcional)
- Follow-up pendente (boolean)

### 5.3 Card de Negociação (Pipeline)
**Uso:** Board Kanban do pipeline
**Props necessárias:**
- Título da oportunidade
- Cliente (foto + nome)
- Valor estimado (moeda)
- Probabilidade (%)
- Data prevista de fechamento
- Próxima ação
- Tags coloridas
- Dias na etapa atual
- Indicador visual de atraso (se > X dias)

**Funcionalidades:**
- Drag and drop entre colunas
- Clique para ver/editar detalhes
- Hover mostrando ações rápidas
- Indicador de urgência (próximo do prazo ou parado há muito tempo)

---

## 6. Integrações

### 6.1 Fluxos Principais

```
Lista de Clientes → Ficha do Cliente
    ↓
Nova Interação / Nova Negociação / Mensagem

Pipeline → Detalhes da Negociação
    ↓
Mover etapa / Fechar (Ganho/Perdido)
```

### 6.2 Integrações por Módulo

| Módulo | Integração | Dados Trocados |
|--------|------------|----------------|
| **Financeiro** | Histórico de vendas | Valor total em compras, inadimplência |
| **Agenda** | Follow-ups | Compromissos, lembretes, reuniões |
| **Vendas** | Orçamentos | Propostas em aberto, pedidos |
| **WhatsApp** | Mensagens | Envio direto, templates, histórico |
| **Relatórios** | Analytics | Taxa de conversão, previsão de vendas |
| **MEL (IA)** | Inteligência proativa | Alertas, sugestões, lembretes |

### 6.3 Fluxo de Dados

1. **Novo Cliente** → Criado no CRM → Disponível em Vendas/Financeiro
2. **Nova Negociação** → Criada no Pipeline → Vinculada ao Cliente
3. **Negociação Ganha** → Movida no Pipeline → Pode gerar Pedido no Financeiro
4. **Interação Registrada** → Adicionada à Timeline → Pode criar Follow-up na Agenda
5. **Follow-up Agendado** → Criado na Agenda → Alerta via MEL no dia

---

## 7. Regras de Negócio

### 7.1 Regras de Cadastro

1. **Unicidade de documento:** CPF/CNPJ deve ser único no sistema
2. **Unicidade de contato:** Email e telefone principal devem ser únicos (se informados)
3. **Validação de CPF/CNPJ:** Deve passar na validação de dígitos verificadores
4. **Autopreenchimento:** Ao informar CEP válido, endereço é preenchido automaticamente
5. **Obrigatoriedade:** Nome/Razão Social, tipo, telefone principal e vendedor são obrigatórios

### 7.2 Regras de Permissão

1. **Visualização:** Todos os usuários podem visualizar (com restrições)
2. **Edição de cliente:** Vendedor edita apenas seus próprios; Gestor edita todos
3. **Edição de negociação:** Vendedor edita apenas suas próprias; Gestor edita todas
4. **Exclusão:** Apenas Gestor e Admin podem excluir clientes ou negociações
5. **Importação:** Apenas Gestor e Admin podem importar em lote
6. **Transferência:** Gestor pode transferir clientes entre vendedores

### 7.3 Regras de Exclusão

1. **Cliente com negociações em andamento:** Não pode ser excluído, apenas inativado
2. **Cliente com histórico de vendas:** Não pode ser excluído, apenas inativado
3. **Exclusão definitiva:** Requer confirmação em duas etapas (modal + checkbox)
4. **Auditoria:** Exclusões são registradas em log com motivo (quando aplicável)

### 7.4 Regras do Pipeline

1. **Movimentação livre:** Negociações podem ser movidas entre etapas ativas livremente
2. **Fechamento:** Mover para "Ganho" ou "Perdido" requer confirmação e dados adicionais
3. **Motivo obrigatório:** Ao perder, é obrigatório informar o motivo
4. **Probabilidade:** Cada etapa tem probabilidade padrão, mas pode ser ajustada
5. **Alerta de inatividade:** Negociações paradas por +7 dias geram alerta do MEL
6. **Arquivamento:** Negociações não são excluídas, apenas arquivadas

### 7.5 Regras de Interação

1. **Registro obrigatório:** Toda interação deve ter tipo, data, assunto e descrição
2. **Follow-up:** Pode ser agendado no momento do registro da interação
3. **Vinculação:** Interação pode ser vinculada a uma negociação específica
4. **Anexos:** Permitido anexar arquivos (máx 10MB cada)

---

## 8. Checklist de Qualidade

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
- [ ] Empty state descrito (lista vazia, busca sem resultados)
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

## 9. Prompt para Figma Make

```
Crie designs para o Módulo CRM de um sistema SaaS para pequenos empreendedores.

CONTEXTO DO PRODUTO:
- Produto: UNIQ Empresas - Plataforma SaaS para pequenos empreendedores
- Tipo: Aplicação web responsiva
- Público-alvo: Vendedores e gestores de pequenas empresas (MEI/Micro), não técnicos
- Tom de voz: Simples, profissional, acolhedor, "Você consegue!", sem jargões
- Diferencial: MEL (IA Proativa) que ajuda o dono do negócio

TELAS NECESSÁRIAS (3 telas):

1. LISTA DE CLIENTES (/crm/clientes)
- Objetivo: Visualizar, buscar e gerenciar todos os clientes
- Funcionalidades: Busca rápida, filtros avançados, cadastrar novo, ver detalhes, editar, excluir, importar/exportar, enviar WhatsApp
- Dados por cliente: Foto, nome, tipo (PF/PJ), telefone, tags coloridas, última interação, valor total em compras, status
- Estados: Lista vazia, busca sem resultados, loading, erro

2. FICHA DO CLIENTE (/crm/clientes/:id)
- Objetivo: Visão 360° do cliente com histórico completo
- Funcionalidades: Editar dados, adicionar interação, criar negociação, enviar mensagem, agendar follow-up
- Abas: Resumo (dados principais), Interações (timeline), Negociações (pipeline), Dados Completos (formulário)
- Estados: Sem interações, sem negociações, loading

3. PIPELINE DE VENDAS (/crm/pipeline)
- Objetivo: Gerenciar negociações no funil de vendas
- Funcionalidades: Board Kanban arrastável, criar negociação, mover entre etapas, filtrar, fechar como ganho/perdido
- Etapas: Prospectando, Primeiro contato, Proposta enviada, Negociação, Fechamento, Ganho, Perdido
- Cards com: Título, cliente, valor, probabilidade, data prevista, próxima ação, tags
- Estados: Pipeline vazio, coluna vazia, loading

ESTILO DESEJADO:
- Design moderno, profissional mas acolhedor
- Priorize clareza e facilidade de uso - o usuário está sempre com pressa
- Interface que parece "fazer sentido" para quem não é técnico
- Hierarquia visual clara
- Cores que transmitam confiança e energia
- Mobile-first (80% dos acessos são mobile)

REGRAS IMPORTANTES:
- Vendedores só veem/editam seus próprios clientes/negociações
- Gestores veem/editam todos
- CPF/CNPJ deve ser único
- Clientes com negociações não podem ser excluídos (apenas inativados)
- Fechar negociação requer confirmação e motivo

Use sua criatividade para organizar as informações de forma que o vendedor encontre rapidamente o que precisa, mesmo na correria do dia a dia!
```

---

**Documento criado seguindo rigorosamente a Matriz de Documentação UI UNIQ**  
**Status:** ✅ Pronto para Figma Make  
**Data:** Março 2025
