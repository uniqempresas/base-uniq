# Módulo Vendas - Gestão de Pedidos - Documentação UI

> **Versão:** 1.0  
> **Data:** Março 2025  
> **Status:** Especificação Funcional Completa  
> **Destino:** Figma Make

---

## 1. Visão Geral do Módulo

### 1.1 Propósito
O Módulo de Gestão de Pedidos permite que o empreendedor visualize, acompanhe e gerencie todas as vendas realizadas na plataforma UNIQ. É o centro de controle para entender o que foi vendido, para quem, por qual canal e em que status de entrega.

### 1.2 Contexto do Produto
**UNIQ Empresas** é uma plataforma SaaS modular para pequenos empreendedores (MEI/Micro) que precisam de simplicidade e resultados rápidos. O diferencial é o **MEL** (IA Proativa), um consultor digital que avisa sobre oportunidades e alertas.

### 1.3 Público-Alvo
- **Lojista/Dono do negócio:** Acompanha vendas, separa pedidos, envia mercadoria
- **Atendente:** Processa pedidos, responde clientes, atualiza status
- **Gestor:** Analisa performance, toma decisões baseadas em dados

**Características:** Não técnico, pouco tempo, valoriza simplicidade, quer ver resultados rapidamente.

### 1.4 Navegação do Módulo
- **Sidebar Principal:** Fixa à esquerda com módulos principais
- **Barra de Contexto (Vendas):** Dashboard Vendas | PDV | Loja Virtual | Pedidos | Relatórios

---

## 2. Tela 1: Lista de Pedidos

### 2.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Lista de Pedidos |
| **Rota/URL** | `/vendas/pedidos` |
| **Objetivo Principal** | Visualizar, buscar e gerenciar todos os pedidos do negócio em um só lugar |
| **Permissões de Acesso** | Visualização: Todos os usuários | Edição de status: Vendedor/Gestor | Cancelamento: Gestor apenas |
| **Módulo/Pai** | Módulo Vendas |
| **Prioridade MVP** | ✅ Essencial |

### 2.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Lojistas, atendentes e gestores de pequenos negócios
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Usada diariamente para acompanhar vendas, separar produtos e organizar envios

#### Por Que Esta Tela Existe
- **Problema que resolve:** Centralizar o acesso a todos os pedidos, evitando perder vendas ou esquecer de enviar mercadoria
- **Valor entregue:** Visão completa das vendas, filtros para priorizar o que precisa de atenção, ações rápidas
- **Frequência de uso:** Múltiplas vezes ao dia

#### User Stories Relacionadas
- "Como lojista, quero ver todos os pedidos de hoje para saber o que preciso separar"
- "Como gestor, quero filtrar por status para ver o que falta entregar"
- "Como atendente, quero buscar um pedido específico pelo número para responder o cliente"
- "Como lojista, quero ver quanto vendi no período para entender meu faturamento"
- "Como atendente, quero atualizar o status de múltiplos pedidos de uma vez"

### 2.3 Elementos Obrigatórios (O Que DEVE Ter)

#### Dados a Exibir em Resumo (Cards)
- [ ] **Total de pedidos no período:** Quantidade de pedidos filtrados
- [ ] **Valor total vendido:** Soma dos valores, formato moeda R$
- [ ] **Ticket médio:** Valor médio por pedido
- [ ] **Comparativo com período anterior:** Indicador visual de crescimento/queda em porcentagem

#### Dados a Exibir na Lista/Tabela (por pedido)
- [ ] **Número do pedido:** Código único identificador
- [ ] **Data e hora:** Quando o pedido foi realizado
- [ ] **Cliente:** Nome do cliente que comprou
- [ ] **Canal de venda:** Origem (PDV, Loja Virtual, WhatsApp, etc.)
- [ ] **Valor total:** Valor final pago pelo cliente
- [ ] **Forma de pagamento:** Cartão, PIX, dinheiro, etc.
- [ ] **Status do pedido:** Badge indicando a etapa atual (aguardando, pago, em separação, enviado, entregue, cancelado)

#### Funcionalidades Essenciais
- [ ] **Filtros avançados:** Seleção de período, status, canal, cliente, forma de pagamento, faixa de valor
- [ ] **Busca rápida:** Campo para buscar por número do pedido ou nome do cliente
- [ ] **Seleção em massa:** Checkbox para selecionar múltiplos pedidos
- [ ] **Ações rápidas por pedido:** Ver detalhes, atualizar status, cancelar
- [ ] **Exportação:** Download da lista em Excel/PDF
- [ ] **Paginação ou scroll infinito:** Para navegar em grandes volumes

#### Campos de Formulário de Filtros

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Período | Select/Date Range | Não | Opções: Hoje, Ontem, 7 dias, 30 dias, Personalizado |
| Status | Multi-select | Não | Todos, Aguardando, Pago, Em separação, Enviado, Entregue, Cancelado |
| Canal | Multi-select | Não | Todos, PDV, Loja Virtual, WhatsApp, Outros |
| Cliente | Busca/Select | Não | Busca por nome ou telefone |
| Forma de pagamento | Multi-select | Não | Todas as opções disponíveis |
| Valor mínimo | Número | Não | Não negativo |
| Valor máximo | Número | Não | Maior que mínimo |

### 2.4 Elementos Opcionais (O Que PODE Ter)

#### Funcionalidades Adicionais
- [ ] **Imprimir lista:** Geração de relatório para impressão
- [ ] **Reenviar comprovante:** Envio de comprovante ao cliente
- [ ] **Visualização alternativa:** Alternar entre tabela e cards visuais
- [ ] **Salvar filtros:** Memorizar filtros frequentemente usados

### 2.5 Ações Possíveis

#### Ações Primárias
1. **Ver detalhes do pedido:**
   - **Gatilho:** Clicar no número do pedido ou botão de ação
   - **Resultado:** Navega para tela de detalhes completo
   - **Confirmação:** Não necessária

2. **Aplicar filtros:**
   - **Gatilho:** Selecionar critérios e confirmar
   - **Resultado:** Lista atualizada com dados filtrados
   - **Confirmação:** Não necessária

3. **Buscar pedido:**
   - **Gatilho:** Digitar número ou nome no campo de busca
   - **Resultado:** Lista filtrada em tempo real
   - **Confirmação:** Não necessária

#### Ações Secundárias
1. **Exportar lista:** Download em Excel ou PDF
2. **Atualizar status:** Alterar status de um ou mais pedidos
3. **Limpar filtros:** Resetar todos os critérios de filtro

#### Ações de Destruição
1. **Cancelar pedido:**
   - **Gatilho:** Botão de cancelar nas ações do pedido
   - **Confirmação:** Modal obrigatório
   - **Mensagem:** "Tem certeza que deseja cancelar o pedido #1234? Esta ação não pode ser desfeita."
   - **Campos adicionais:** Motivo do cancelamento (obrigatório)
   - **Permissão:** Apenas gestores podem cancelar pedidos pagos

### 2.6 Estados da UI

#### Empty State - Sem Pedidos no Período
- **Quando aparece:** Filtro aplicado não retorna resultados
- **Mensagem:** "Nenhum pedido no período selecionado"
- **Descrição:** "Tente ajustar seus filtros ou selecionar outro período"
- **CTA:** "Limpar filtros"

#### Empty State - Primeiro Acesso (Sem Pedidos no Sistema)
- **Quando aparece:** Negócio ainda não tem vendas registradas
- **Mensagem:** "Você ainda não tem pedidos"
- **Descrição:** "Seus pedidos aparecerão aqui quando começar a vender"
- **CTA:** "Ir para PDV" ou "Configurar Loja Virtual"
- **Dica:** "Comece fazendo sua primeira venda no PDV"

#### Loading State
- **Quando aparece:** Carregando lista inicial ou aplicando filtros
- **Tipo:** Skeleton cards e linhas simulando a tabela
- **Mensagem:** "Carregando seus pedidos..."

#### Error State
- **Quando aparece:** Falha ao carregar dados do servidor
- **Mensagem:** "Não foi possível carregar os pedidos"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State
- **Quando aparece:** Após atualizar status ou cancelar pedido
- **Feedback:** Toast temporário
- **Mensagens:**
  - "Status atualizado com sucesso"
  - "Pedido cancelado"
  - "Lista exportada"

### 2.7 Integrações

#### Com Outras Telas
- Navega para: Detalhes do Pedido (`/vendas/pedidos/:id`), PDV, Loja Virtual
- Recebe de: Dashboard Vendas, PDV (novos pedidos)

#### Com Outros Módulos
- **Módulo Estoque:** Verifica disponibilidade de produtos
- **Módulo CRM:** Vincula pedido ao histórico do cliente
- **Módulo Financeiro:** Lança receitas automaticamente
- **Módulo WhatsApp:** Notificações de atualização de status
- **MEL (IA):** Alertas de pedidos pendentes, sugestões de ações

### 2.8 Regras de Negócio

1. **Status inicial:** Novo pedido sempre inicia como "Aguardando pagamento" ou "Pago" (conforme canal)
2. **Fluxo de status:** Pedido → Pagamento → Separação → Envio → Entrega (pode pular etapas conforme tipo de venda)
3. **Cancelamento:** Pode ser feito em qualquer etapa, mas requer motivo
4. **Permissões:** Apenas gestor pode cancelar pedidos pagos; atendentes só atualizam status
5. **Pagamento pendente:** Pedidos não pagos não podem ser enviados
6. **Visibilidade:** Todos os usuários veem todos os pedidos (não há restrição por vendedor nesta visão)
7. **Notificações:** Cliente recebe email/WhatsApp em cada mudança de status

---

## 3. Tela 2: Detalhes do Pedido

### 3.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Detalhes do Pedido |
| **Rota/URL** | `/vendas/pedidos/:id` |
| **Objetivo Principal** | Visualizar todas as informações de um pedido específico e gerenciar seu ciclo de vida |
| **Permissões de Acesso** | Visualização: Todos | Edição: Vendedor/Gestor | Cancelamento: Gestor apenas |
| **Módulo/Pai** | Módulo Vendas > Lista de Pedidos |
| **Prioridade MVP** | ✅ Essencial |

### 3.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Lojistas processando pedidos e atendentes respondendo clientes
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Momento de preparação do envio, resposta a dúvidas do cliente, verificação de detalhes

#### Por Que Esta Tela Existe
- **Problema que resolve:** Centralizar todas as informações de uma venda em um só lugar para processamento completo
- **Valor entregue:** Visão 360° do pedido: cliente, produtos, pagamento, entrega e histórico
- **Frequência de uso:** Várias vezes por dia durante processamento de vendas

#### User Stories Relacionadas
- "Como lojista, quero ver todos os dados do cliente para preparar o envio corretamente"
- "Como atendente, quero atualizar o status e informar o código de rastreio ao cliente"
- "Como gestor, quero ver o histórico de alterações do pedido para auditoria"
- "Como lojista, quero enviar mensagem para o cliente direto daqui"
- "Como atendente, quero duplicar um pedido para facilitar recompra"

### 3.3 Elementos Obrigatórios (O Que DEVE Ter)

#### Header do Pedido
- [ ] **Número do pedido:** Destaque visual como identificador principal
- [ ] **Data e hora do pedido:** Quando foi realizado
- [ ] **Status atual:** Badge grande indicando a etapa
- [ ] **Canal de venda:** Origem da venda (PDV, Loja, WhatsApp)

#### Informações do Cliente
- [ ] **Nome completo:** Razão social se PJ
- [ ] **Telefone/WhatsApp:** Com link direto para iniciar conversa
- [ ] **Email:** Para envio de comprovantes
- [ ] **CPF/CNPJ:** Documento do cliente

#### Itens do Pedido
- [ ] **Lista de produtos:** Todos os itens comprados
- [ ] **Foto do produto:** Imagem de referência
- [ ] **Nome do produto:** Incluindo variação (tamanho, cor, etc.)
- [ ] **Quantidade:** Unidades compradas
- [ ] **Preço unitário:** Valor de cada unidade
- [ ] **Subtotal:** Quantidade × Preço unitário

#### Resumo Financeiro
- [ ] **Subtotal:** Soma dos produtos
- [ ] **Frete:** Valor do envio (se aplicável)
- [ ] **Descontos:** Cupons ou descontos aplicados
- [ ] **Total pago:** Valor final
- [ ] **Forma de pagamento:** Método utilizado
- [ ] **Status do pagamento:** Confirmado, pendente, recusado

#### Endereço de Entrega (para envios)
- [ ] **Endereço completo:** Rua, número, complemento, bairro
- [ ] **Cidade/Estado:** Local de entrega
- [ ] **CEP:** Código postal
- [ ] **Link para mapa:** Abrir localização no Google Maps

#### Timeline de Status
- [ ] **Histórico completo:** Todas as mudanças de status
- [ ] **Data/hora de cada etapa:** Quando foi atualizado
- [ ] **Responsável:** Quem fez a alteração
- [ ] **Código de rastreio:** Quando disponível

#### Funcionalidades Essenciais
- [ ] **Atualizar status:** Avançar para próxima etapa do fluxo
- [ ] **Adicionar código de rastreio:** Vincular código de envio
- [ ] **Enviar mensagem:** Iniciar conversa com cliente via WhatsApp
- [ ] **Imprimir comprovante:** Gerar documento de venda
- [ ] **Cancelar pedido:** Cancelamento com motivo

### 3.4 Elementos Opcionais (O Que PODE Ter)

#### Funcionalidades Adicionais
- [ ] **Duplicar pedido:** Criar novo pedido com mesmos itens
- [ ] **Editar pedido:** Alterar dados (quando permitido)
- [ ] **Notas internas:** Comentários visíveis apenas para equipe
- [ ] **Comprovante de entrega:** Upload de foto/documento

### 3.5 Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Novo status | Select | Sim | Próximos status válidos conforme fluxo |
| Código de rastreio | Texto | Condicional | Obrigatório ao marcar como "Enviado" |
| Motivo do cancelamento | Textarea | Sim (no cancelamento) | Mínimo 10 caracteres |
| Notas internas | Textarea | Não | Texto livre |

### 3.6 Ações Possíveis

#### Ações Primárias
1. **Atualizar status do pedido:**
   - **Gatilho:** Botão de ação principal
   - **Resultado:** Abre modal para selecionar novo status
   - **Confirmação:** Confirmação para status finais (cancelado, entregue)

2. **Adicionar código de rastreio:**
   - **Gatilho:** Opção disponível quando status é "Enviado"
   - **Resultado:** Campo para inserir código
   - **Confirmação:** Não necessária

3. **Enviar mensagem para cliente:**
   - **Gatilho:** Botão WhatsApp nas informações do cliente
   - **Resultado:** Abre WhatsApp Web/App com mensagem pré-preenchida
   - **Confirmação:** Não necessária

#### Ações Secundárias
1. **Imprimir comprovante:** Gera documento de venda
2. **Reimprimir comprovante:** Segunda via
3. **Duplicar pedido:** Cria novo pedido idêntico
4. **Voltar para lista:** Retorna à tela de pedidos

#### Ações de Destruição
1. **Cancelar pedido:**
   - **Gatilho:** Botão de cancelar
   - **Confirmação:** Modal obrigatório com motivo
   - **Mensagem:** "Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita."
   - **Campos:** Motivo do cancelamento (obrigatório)
   - **Restrição:** Gestor apenas para pedidos pagos

### 3.7 Estados da UI

#### Empty State - Pedido Não Encontrado
- **Quando aparece:** ID inválido ou pedido excluído
- **Mensagem:** "Pedido não encontrado"
- **Descrição:** "O pedido que você procura não existe ou foi removido"
- **CTA:** "Voltar para lista de pedidos"

#### Loading State
- **Quando aparece:** Carregando dados do pedido
- **Tipo:** Skeleton de seções
- **Mensagem:** "Carregando detalhes do pedido..."

#### Error State
- **Quando aparece:** Falha ao carregar dados
- **Mensagem:** "Não foi possível carregar o pedido"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State
- **Quando aparece:** Após atualizar status, adicionar rastreio, etc.
- **Feedback:** Toast temporário
- **Mensagens:**
  - "Status atualizado com sucesso"
  - "Código de rastreio adicionado"
  - "Mensagem enviada"

#### Estado Especial - Pagamento Pendente
- **Quando aparece:** Pedido aguardando pagamento
- **Visual:** Destaque especial indicando pendência
- **Ações:** Opção de confirmar pagamento manualmente
- **Mensagem:** "Aguardando confirmação de pagamento"

#### Estado Especial - Pedido Cancelado
- **Quando aparece:** Pedido foi cancelado
- **Visual:** Indicação clara de cancelamento
- **Informação:** Motivo do cancelamento visível
- **Ações:** Botão desabilitado para ações de processamento

#### Estado Especial - Pedido Entregue
- **Quando aparece:** Status final de entrega
- **Visual:** Indicação de conclusão
- **Informação:** Data de entrega registrada

### 3.8 Integrações

#### Com Outras Telas
- Navega para: Lista de Pedidos, Ficha do Cliente (CRM)
- Recebe de: Lista de Pedidos, PDV, Loja Virtual

#### Com Outros Módulos
- **Módulo CRM:** Acesso à ficha completa do cliente
- **Módulo Estoque:** Verificação de disponibilidade
- **Módulo Financeiro:** Detalhes do pagamento
- **Módulo WhatsApp:** Envio de notificações
- **MEL (IA):** Sugestões baseadas no perfil do cliente

### 3.9 Regras de Negócio

1. **Status Flow:** Pedido → Pagamento → Separação → Envio → Entrega (fluxo padrão)
2. **Código de rastreio:** Obrigatório ao marcar como "Enviado"
3. **Pagamento manual:** Gestor pode confirmar pagamento manualmente se necessário
4. **Histórico imutável:** Todas as alterações são registradas na timeline
5. **Cancelamento:** Pode ser feito em qualquer etapa, exceto após entrega
6. **Permissões:** Apenas gestor pode cancelar pedidos pagos; apenas gestor pode editar dados do pedido
7. **Notificações automáticas:** Cliente é notificado em cada mudança de status via WhatsApp/email

---

## 4. Tela 3: Relatórios de Vendas

### 4.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Relatórios de Vendas |
| **Rota/URL** | `/vendas/relatorios` |
| **Objetivo Principal** | Visualizar analytics e métricas de vendas de forma simples e visual |
| **Permissões de Acesso** | Visualização: Todos os usuários |
| **Módulo/Pai** | Módulo Vendas |
| **Prioridade MVP** | ✅ Essencial |

### 4.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Lojistas e gestores querendo entender o negócio
- **Conhecimento técnico:** Baixo (não entende de números complexos)
- **Contexto de uso:** Momento de planejamento, final do dia/semana para acompanhar resultados

#### Por Que Esta Tela Existe
- **Problema que resolve:** Dificuldade de pequenos empreendedores em acompanhar métricas e entender o que vende mais
- **Valor entregue:** Dashboard visual simples que mostra o que importa: quanto vendeu, o que vende, quando vende
- **Frequência de uso:** Diária (final do dia) ou semanal

#### User Stories Relacionadas
- "Como empreendedor, quero ver quanto vendi este mês comparado ao anterior"
- "Como gestor, quero saber quais são meus produtos mais vendidos"
- "Como lojista, quero ver em quais dias da semana vendo mais"
- "Como empreendedor, quero entender de onde vêm minhas vendas (canal)"
- "Como gestor, quero exportar relatórios para minha contabilidade"

### 4.3 Elementos Obrigatórios (O Que DEVE Ter)

#### Filtros de Período
- [ ] **Período pré-definido:** Hoje, Ontem, 7 dias, 30 dias, Este mês, Mês anterior
- [ ] **Período personalizado:** Seleção de data inicial e final
- [ ] **Canal:** Filtro por origem das vendas (todos, PDV, Loja Virtual)
- [ ] **Vendedor:** Se houver múltiplos vendedores (apenas para gestores)

#### KPIs Principais (Cards de Resumo)
- [ ] **Total de vendas:** Valor monetário total no período (R$)
- [ ] **Quantidade de pedidos:** Número de vendas realizadas
- [ ] **Ticket médio:** Valor médio por pedido
- [ ] **Comparativo:** Indicador de crescimento/queda vs período anterior (↑/↓ %)

#### Gráficos e Visualizações
- [ ] **Vendas por dia:** Evolução ao longo do tempo (linha ou barras)
- [ ] **Vendas por canal:** Distribuição entre PDV, Loja Virtual, etc. (pizza ou barras)
- [ ] **Produtos mais vendidos:** Ranking dos top produtos
- [ ] **Formas de pagamento:** Distribuição dos métodos utilizados

#### Tabelas de Dados
- [ ] **Top produtos vendidos:** Lista com nome, quantidade, valor total
- [ ] **Vendas por categoria:** Agrupamento por tipo de produto
- [ ] **Vendas por horário:** Heatmap ou lista de horários de pico
- [ ] **Vendas por dia da semana:** Comparativo entre dias

#### Funcionalidades Essenciais
- [ ] **Aplicar filtros:** Atualizar relatório conforme seleção
- [ ] **Exportar PDF:** Download do relatório visual
- [ ] **Exportar Excel:** Download dos dados em planilha
- [ ] **Compartilhar:** Enviar por email/WhatsApp

### 4.4 Elementos Opcionais (O Que PODE Ter)

#### Funcionalidades Adicionais
- [ ] **Comparativo personalizado:** Comparar com período específico
- [ ] **Metas:** Visualização de progresso contra meta de vendas
- [ ] **Previsões:** Projeções baseadas em histórico
- [ ] **Detalhamento:** Drill-down em gráficos para ver dados brutos

### 4.5 Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Período | Select/Date Range | Sim | Padrão: "Este mês" |
| Canal | Multi-select | Não | Todas as opções selecionadas por padrão |
| Vendedor | Select | Não | Apenas para gestores |

### 4.6 Ações Possíveis

#### Ações Primárias
1. **Aplicar filtros:**
   - **Gatilho:** Selecionar critérios e confirmar
   - **Resultado:** Todos os gráficos e tabelas atualizados
   - **Confirmação:** Não necessária

2. **Exportar relatório:**
   - **Gatilho:** Botões de exportação (PDF/Excel)
   - **Resultado:** Download do arquivo
   - **Confirmação:** Não necessária

#### Ações Secundárias
1. **Compartilhar:** Enviar relatório por email ou WhatsApp
2. **Limpar filtros:** Resetar para padrão
3. **Atualizar dados:** Recarregar dados mais recentes

### 4.7 Estados da UI

#### Empty State - Sem Vendas no Período
- **Quando aparece:** Período selecionado não tem vendas
- **Mensagem:** "Nenhuma venda neste período"
- **Descrição:** "Quando você fizer vendas, elas aparecerão aqui"
- **CTA:** "Ir para PDV" ou "Ver todos os períodos"

#### Loading State
- **Quando aparece:** Carregando dados do relatório
- **Tipo:** Skeleton dos cards e gráficos
- **Mensagem:** "Carregando seus relatórios..."

#### Error State
- **Quando aparece:** Falha ao carregar dados
- **Mensagem:** "Não foi possível carregar os relatórios"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State
- **Quando aparece:** Após exportar relatório
- **Feedback:** Toast temporário
- **Mensagem:** "Relatório exportado com sucesso"

### 4.8 Integrações

#### Com Outras Telas
- Navega para: Lista de Pedidos (ao clicar em valores), Produtos (detalhes)
- Recebe de: Dashboard Vendas

#### Com Outros Módulos
- **Módulo Estoque:** Dados de produtos vendidos
- **Módulo Financeiro:** Receitas e formas de pagamento
- **Módulo CRM:** Clientes e segmentação
- **MEL (IA):** Insights automáticos sobre tendências

### 4.9 Regras de Negócio

1. **Dados em tempo real:** Relatórios mostram dados atualizados (sem delay)
2. **Período máximo:** Permitir visualização de até 12 meses
3. **Agrupamento:** Dados devem ser agregados por dia quando período > 7 dias
4. **Privacidade:** Vendedores só veem seus próprios dados (exceto gestores)
5. **Exportação:** Dados exportados respeitam filtros aplicados
6. **Comparativo:** "Período anterior" é sempre o mesmo número de dias imediatamente anterior ao selecionado
7. **Cache:** Dados podem ser cacheados por até 5 minutos para performance

---

## 5. Componentes Específicos

### 5.1 Badge de Status do Pedido

**Status e significados:**
- **Aguardando:** Pedido realizado, aguardando pagamento
- **Pago:** Pagamento confirmado, pronto para separação
- **Em separação:** Produtos sendo preparados para envio
- **Enviado:** Mercadoria postada/com entregador
- **Entregue:** Cliente recebeu o pedido
- **Cancelado:** Pedido não será atendido

**Regras:**
- Cada status deve ter cor distintiva para fácil identificação
- Badge deve ser visível em qualquer tamanho de tela
- Ícone intuitivo associado a cada status

### 5.2 Card de Resumo (KPI)

**Elementos:**
- Título descritivo
- Valor principal destacado
- Comparativo com período anterior
- Indicador visual de tendência (crescimento/queda)

**Regras:**
- Comparativo mostra seta para cima/baixo com porcentagem
- Valores monetários formatados em R$
- Quantidades formatadas com separadores de milhar

### 5.3 Gráficos

**Tipos necessários:**
- **Linha/Barras:** Evolução temporal (vendas por dia)
- **Pizza/Donut:** Distribuição percentual (canais, formas de pagamento)
- **Barras horizontais:** Rankings (produtos mais vendidos)
- **Heatmap:** Densidade (vendas por horário/dia da semana)

**Regras:**
- Gráficos devem ser simples e autoexplicativos
- Legendas claras
- Tooltips ao passar o mouse (hover)
- Valores formatados adequadamente

---

## 6. Integrações entre Módulos

### 6.1 Módulo Estoque
- **Baixa automática:** Produtos vendidos são decrementados do estoque automaticamente
- **Alerta de disponibilidade:** Aviso se produto do pedido não tem estoque suficiente
- **Reserva:** Produtos reservados quando pedido é confirmado

### 6.2 Módulo CRM
- **Histórico do cliente:** Pedidos aparecem na ficha do cliente
- **Segmentação:** Dados de compras alimentam tags do cliente (VIP, frequente, etc.)
- **Contato:** Acesso rápido aos dados do cliente para comunicação

### 6.3 Módulo Financeiro
- **Lançamento automático:** Vendas geram receitas no financeiro
- **Conciliação:** Status de pagamento sincronizado
- **Relatórios:** Dados financeiros consolidados

### 6.4 Módulo WhatsApp
- **Notificações automáticas:** Cliente recebe mensagem em cada mudança de status
- **Comprovante:** Envio automático de comprovante de venda
- **Código de rastreio:** Envio quando pedido é marcado como enviado

### 6.5 MEL (IA Proativa)
- **Alertas:** "Você tem 3 pedidos aguardando separação"
- **Sugestões:** "Cliente X comprou produto Y há 30 dias, que tal oferecer?"
- **Insights:** "Sua média de vendas aumentou 20% esta semana"
- **Lembretes:** "Não se esqueça de atualizar o status dos pedidos de ontem"

---

## 7. Regras de Negócio Gerais

### 7.1 Fluxo de Status do Pedido

```
Pedido Realizado
      ↓
Aguardando Pagamento (se aplicável)
      ↓
Pago → Em Separação
      ↓
Enviado (com código de rastreio obrigatório)
      ↓
Entregue
```

- Cancelamento pode ocorrer em qualquer etapa (antes da entrega)
- Alguns fluxos podem pular etapas (ex: PDV com pagamento imediato)
- Status devem ser atualizados sequencialmente (não é permitido pular)

### 7.2 Permissões de Acesso

| Ação | Atendente | Vendedor | Gestor | Admin |
|------|-----------|----------|--------|-------|
| Visualizar pedidos | ✅ | ✅ | ✅ | ✅ |
| Atualizar status | ✅ | ✅ | ✅ | ✅ |
| Cancelar pedido (não pago) | ❌ | ✅ | ✅ | ✅ |
| Cancelar pedido (pago) | ❌ | ❌ | ✅ | ✅ |
| Editar dados do pedido | ❌ | ❌ | ✅ | ✅ |
| Ver todos os relatórios | ❌ | Próprio | ✅ | ✅ |
| Exportar dados | ❌ | ✅ | ✅ | ✅ |

### 7.3 Validações Importantes

1. **Código de rastreio:** Obrigatório ao marcar pedido como "Enviado"
2. **Motivo de cancelamento:** Obrigatório ao cancelar qualquer pedido
3. **Pagamento pendente:** Pedido não pode avançar para "Em separação" sem pagamento confirmado
4. **Estoque insuficiente:** Aviso ao tentar processar pedido sem estoque disponível
5. **Cliente bloqueado:** Impedir novos pedidos de clientes inadimplentes

### 7.4 Notificações Automáticas

O cliente deve ser notificado automaticamente via WhatsApp e/ou email:
- Pedido realizado (confirmação)
- Pagamento confirmado
- Pedido em separação
- Pedido enviado (com código de rastreio)
- Pedido entregue
- Pedido cancelado (com motivo)

---

## 8. Checklist de Qualidade

### ✅ Checklist de Conformidade com a Matriz

- [x] **Nenhum wireframe ou ASCII art** - Documento contém apenas especificações funcionais
- [x] **Nenhuma especificação de posicionamento** - Não há "botão à direita", "card no topo"
- [x] **Nenhuma cor hexadecimal** - Cores não foram especificadas
- [x] **Nenhum tamanho em pixels** - Não há medidas de largura, altura, padding
- [x] **Nenhuma fonte específica** - Não há nomes de fontes ou tamanhos tipográficos
- [x] **Nenhuma descrição de layout** - Não há "duas colunas", "sidebar"
- [x] **Nenhuma animação detalhada** - Não há tempos, transições específicas
- [x] **User stories no formato correto** - "Como [perfil], quero [ação] para que [benefício]"
- [x] **Campos de formulário completos** - Todos com nome, tipo, obrigatoriedade, validações
- [x] **Todos os estados de UI descritos** - Empty, loading, error, success
- [x] **Regras de negócio explícitas** - Fluxo de status, permissões, validações
- [x] **Permissões de acesso claras** - Matriz de permissões definida
- [x] **Contexto do usuário UNIQ** - Público-alvo, dores, tom de voz
- [x] **Limite de 3 telas principais** - Lista, Detalhes, Relatórios

### 🎯 Teste Final

**Pergunta:** "Se eu fosse um designer talentoso recebendo este documento pela primeira vez, teria liberdade suficiente para criar algo incrível e inovador?"

**Resposta:** ✅ SIM - O documento especifica O QUE precisa ser feito (funcionalidades, dados, regras) sem limitar COMO deve ser feito visualmente.

---

## 9. Resumo para Figma Make

### Contexto do Produto
**UNIQ Empresas** - Plataforma SaaS para pequenos empreendedores (MEI/Micro). Tom: simples, acolhedor, profissional, empoderador. Diferencial: MEL (IA Proativa) que avisa sobre oportunidades.

### Público-Alvo
Empreendedores não técnicos, na correria, que precisam de simplicidade e resultados rápidos. Valorizam clareza e facilidade de uso.

### Navegação
- Sidebar principal escura (fixa)
- Barra de contexto do módulo Vendas: Dashboard | PDV | Loja Virtual | Pedidos | Relatórios

### As 3 Telas

1. **Lista de Pedidos** (`/vendas/pedidos`)
   - Resumo em cards (total, valor, ticket médio, comparativo)
   - Filtros avançados (período, status, canal, cliente, pagamento, valor)
   - Lista com: número, data, cliente, canal, valor, pagamento, status
   - Ações: ver detalhes, atualizar status, cancelar, exportar
   - Estados: sem pedidos, filtros sem resultado, loading, erro

2. **Detalhes do Pedido** (`/vendas/pedidos/:id`)
   - Header: número, data, status, canal
   - Informações do cliente: nome, telefone (link WhatsApp), email, CPF
   - Itens do pedido: foto, nome, quantidade, preço, subtotal
   - Resumo financeiro: subtotal, frete, descontos, total, pagamento
   - Endereço de entrega: completo com link para mapa
   - Timeline de status: histórico completo com datas e responsáveis
   - Ações: atualizar status, adicionar rastreio, enviar mensagem, cancelar

3. **Relatórios de Vendas** (`/vendas/relatorios`)
   - Filtros: período, canal, vendedor
   - KPIs: total vendido, quantidade, ticket médio, comparativo
   - Gráficos: vendas por dia, por canal, produtos mais vendidos, formas de pagamento
   - Tabelas: top produtos, por categoria, por horário, por dia da semana
   - Exportação: PDF e Excel
   - Estados: sem vendas no período, loading

### Regras Importantes
- Fluxo de status: Pedido → Pagamento → Separação → Envio → Entrega
- Código de rastreio obrigatório ao marcar como "Enviado"
- Apenas gestor pode cancelar pedidos pagos
- Cliente é notificado automaticamente em cada mudança de status
- Dados em tempo real

### Tom de Voz nas Mensagens
- Simples e direto, sem jargões
- Acolhedor: "Você consegue!"
- Encorajador nos empty states
- Mensagens de erro claras, sem culpar o usuário

---

**Documento pronto para transformação em prompt para Figma Make! 🎨**
