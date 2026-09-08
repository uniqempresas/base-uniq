# Módulo Vendas PDV - Documentação UI

> **Tipo:** Documentação Funcional para Figma Make  
> **Módulo:** Vendas - PDV (Ponto de Venda)  
> **Versão:** 1.0  
> **Data:** Março 2025  
> **Status:** Pronto para implementação

---

## 1. Visão Geral do Módulo

### 1.1 Contexto do Produto

**UNIQ Empresas** é uma plataforma SaaS para pequenos empreendedores (MEI/Micro) que precisam vender sem burocracia. O PDV é o **coração operacional** do negócio físico.

**Público-alvo:**
- Donos de pequenos comércios (varejo, alimentação, serviços)
- 1-3 funcionários
- Faturamento R$ 8k-30k/mês
- **Não são técnicos** - usam WhatsApp e Instagram

**Contexto de uso:**
- Cliente na frente do balcão esperando
- Pressa é essencial
- Tablet ou desktop touch
- Ambiente barulhento e movimentado
- Não pode travar ou dar erro

### 1.2 User Stories do Módulo

- "Como atendente, quero finalizar uma venda em menos de 30 segundos para não deixar o cliente esperando"
- "Como dono do negócio, quero saber exatamente quanto vendi no dia para planejar amanhã"
- "Como operador de caixa, quero que o sistema calcule o troco automaticamente para evitar erros"
- "Como vendedor, quero colocar uma venda em espera quando o cliente esqueceu algo para não perder a fila"
- "Como gestor, quero ver se há diferença no caixa para identificar problemas"

### 1.3 Integrações do Módulo

- **Estoque:** Baixa automática de produtos vendidos, alerta de saldo baixo
- **Financeiro:** Lançamento de receitas, conciliação de formas de pagamento
- **CRM:** Vinculação de venda ao cliente (se identificado), histórico de compras
- **Catálogo:** Busca de produtos ativos, preços e variações
- **MEL (IA):** Alertas de meta de vendas, sugestões de produtos complementares

---

## 2. Tela 1: PDV Principal

### 2.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | PDV Principal - Caixa |
| **Rota/URL** | `/vendas/pdv` |
| **Objetivo Principal** | Interface principal de venda rápida, permitindo adicionar produtos, gerenciar carrinho e finalizar vendas com agilidade |
| **Permissões de Acesso** | Visualização: Operadores de caixa, Vendedores, Gestores | Edição: Todos os anteriores | Abertura/Fechamento: Gestores e Operadores designados |
| **Módulo/Pai** | Módulo Vendas |
| **Prioridade MVP** | ✅ Essencial |

### 2.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Atendente, operador de caixa, vendedor ou dono do negócio
- **Conhecimento técnico:** Baixo - não entende de sistemas complexos
- **Contexto de uso:** Loja física, cliente esperando na frente, pressa total

#### Por Que Esta Tela Existe
- **Problema que resolve:** Vender produtos de forma rápida e sem erros, substituindo calculadoras e cadernos
- **Valor entregue:** Agilidade no atendimento, controle automático de vendas, cálculo preciso de valores
- **Frequência de uso:** Múltiplas vezes por hora durante todo o expediente

#### User Stories Relacionadas
- "Como atendente, quero vender um produto usando o scanner de código de barras para não precisar digitar nada"
- "Como vendedor, quero ver o total da venda em destaque para informar o cliente rapidamente"
- "Como operador, quero acessar produtos favoritos em um toque para agilizar vendas repetitivas"
- "Como atendente, quero alterar a quantidade de um item quando o cliente pede mais de um"
- "Como vendedor, quero aplicar desconto em um item específico quando houver promoção"
- "Como atendente, quero cancelar um item que foi adicionado por engano sem cancelar a venda toda"
- "Como operador, quero colocar a venda em espera quando o cliente precisa buscar mais alguma coisa"
- "Como vendedor, quero identificar o cliente para aplicar preço especial de atacado"

### 2.3 Elementos Obrigatórios

#### Dados a Exibir
- **Identificação do caixa:** Número do caixa, nome do vendedor logado, hora atual atualizada
- **Status do caixa:** Indicador visual se o caixa está aberto ou fechado
- **Carrinho de compras (lista de itens):**
  - Imagem miniatura do produto
  - Nome do produto
  - Quantidade (editável)
  - Preço unitário
  - Subtotal do item
  - Indicador se há desconto aplicado
- **Display de valores:**
  - Subtotal da venda
  - Total de descontos aplicados
  - Total a pagar (valor principal, em destaque)
- **Teclado numérico virtual:** Botões grandes para input de quantidade e valores (otimizado para touch)
- **Produtos favoritos/atalhos:** Grid com produtos mais vendidos para acesso rápido
- **Área de busca:** Campo de texto para busca por código, nome ou código de barras

#### Funcionalidades Essenciais
- [ ] **Adicionar produto:** Por código de barras (scanner), busca por nome, ou clique nos favoritos
- [ ] **Alterar quantidade:** Aumentar ou diminuir quantidade de um item no carrinho
- [ ] **Aplicar desconto no item:** Informar valor ou percentual de desconto em item específico
- [ ] **Remover item:** Excluir produto do carrinho
- [ ] **Aplicar desconto geral:** Desconto no total da venda
- [ ] **Identificar cliente:** Buscar e vincular cliente à venda atual
- [ ] **Venda em espera:** Salvar venda atual e iniciar nova
- [ ] **Recuperar venda em espera:** Listar e retomar vendas salvas
- [ ] **Cancelar venda:** Limpar carrinho atual
- [ ] **Finalizar venda:** Prosseguir para pagamento

#### Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Busca de produto | Texto | Não | Busca em tempo real por código, nome ou código de barras |
| Quantidade (teclado virtual) | Número | Sim | > 0, máximo conforme estoque disponível |
| Desconto do item | Número | Não | >= 0, máximo conforme limite de desconto do perfil |
| Desconto geral | Número | Não | >= 0, máximo conforme limite de desconto do perfil |
| Identificação venda em espera | Texto | Sim | Mínimo 3 caracteres (nome do cliente/resumo) |

### 2.4 Elementos Opcionais

#### Funcionalidades Adicionais
- [ ] **Abrir gaveta:** Comando para abertura da gaveta de dinheiro
- [ ] **Configurações rápidas:** Acesso a preferências do PDV
- [ ] **Histórico do dia:** Visualizar vendas já realizadas
- [ ] **Observação no item:** Adicionar nota a um item (ex: "sem cebola")

### 2.5 Ações Possíveis

#### Ações Primárias

1. **Adicionar produto ao carrinho:**
   - **Gatilho:** Scanner de código de barras, busca por nome, ou clique em favorito
   - **Resultado:** Produto aparece na lista com quantidade 1
   - **Confirmação:** Beep sonoro (se habilitado) e feedback visual

2. **Alterar quantidade:**
   - **Gatilho:** Botões + / - ou teclado virtual
   - **Resultado:** Quantidade e subtotal atualizados em tempo real
   - **Confirmação:** Não necessária

3. **Finalizar venda:**
   - **Gatilho:** Botão principal de ação
   - **Resultado:** Abre modal/tela de pagamentos
   - **Confirmação:** Não necessária se houver itens no carrinho

#### Ações Secundárias
1. **Aplicar desconto no item:** Abre interface para informar valor ou percentual
2. **Remover item:** Remove produto específico do carrinho
3. **Identificar cliente:** Abre busca de clientes
4. **Colocar em espera:** Salva venda atual com identificação
5. **Recuperar venda:** Lista vendas em espera para retomar
6. **Aplicar desconto geral:** Desconto no total da venda
7. **Cancelar venda:** Limpa carrinho atual

#### Ações de Destruição
1. **Cancelar venda:**
   - **Gatilho:** Botão de cancelar
   - **Confirmação:** Sim - "Deseja cancelar esta venda? Todos os itens serão removidos."
   - **Ação:** Carrinho é esvaziado

### 2.6 Estados da UI

#### Empty State - Caixa Fechado
- **Quando aparece:** Usuário acessa o PDV mas o caixa não foi aberto
- **Mensagem:** "Caixa fechado"
- **Descrição:** "É necessário abrir o caixa antes de iniciar as vendas"
- **CTA primário:** "Abrir caixa agora"
- **Dica:** "O fechamento deve ser feito no final do expediente"

#### Empty State - Carrinho Vazio
- **Quando aparece:** Caixa aberto mas sem itens adicionados
- **Mensagem:** "Carrinho vazio"
- **Descrição:** "Use o scanner ou busque um produto para começar"
- **CTA:** Mostrar produtos favoritos para acesso rápido
- **Dica:** "Dica: Pressione F1-F12 para atalhos rápidos"

#### Loading State
- **Quando aparece:** Buscando produto, carregando favoritos
- **Tipo:** Skeleton de linhas ou spinner discreto
- **Mensagem:** "Buscando produto..."

#### Error State
- **Quando aparece:** Produto não encontrado, sem estoque, erro de conexão
- **Mensagem:** "Produto não encontrado" / "Estoque insuficiente"
- **Ação de recuperação:** Limpar busca e tentar novamente

#### Success State
- **Quando aparece:** Produto adicionado com sucesso
- **Feedback:** Toast breve ou indicador visual discreto
- **Mensagem:** "Produto adicionado"

### 2.7 Regras de Negócio

1. **Caixa fechado:** Não é possível adicionar produtos se o caixa estiver fechado
2. **Estoque negativo:** Não permitir adicionar produto sem estoque disponível (configurável)
3. **Limite de desconto:** Cada perfil de usuário tem limite máximo de desconto permitido
4. **Vendas em espera:** Limite máximo de 5 vendas em espera simultâneas
5. **Identificação obrigatória:** Alguns produtos só podem ser vendidos com cliente identificado (ex: medicamentos)
6. **Preço mínimo:** Não permitir valor negativo no total da venda
7. **Scanner automático:** Campo de busca deve aceitar input do scanner automaticamente

### 2.8 Notas e Considerações

- Interface deve ser otimizada para touch (botões grandes, espaçamento adequado)
- Suporte a teclado físico (atalhos de teclado para velocidade)
- Scanner de código de barras deve funcionar sem necessidade de focar campo específico
- Atualização de valores em tempo real (sem delay perceptível)
- Responder bem em tablets (uso principal esperado)

---

## 3. Tela 2: Abertura e Fechamento de Caixa

### 3.1 Metadados - Abertura de Caixa

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Abertura de Caixa |
| **Rota/URL** | `/vendas/pdv/abertura` |
| **Objetivo Principal** | Registrar o valor inicial em dinheiro no caixa e identificar o operador antes de iniciar as vendas |
| **Permissões de Acesso** | Operadores de caixa, Gestores, Admin |
| **Módulo/Pai** | PDV - Vendas |
| **Prioridade MVP** | ✅ Essencial |

### 3.2 Metadados - Fechamento de Caixa

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Fechamento de Caixa |
| **Rota/URL** | `/vendas/pdv/fechamento` |
| **Objetivo Principal** | Encerrar o caixa do dia com conferência de valores, identificando diferenças e gerando relatório |
| **Permissões de Acesso** | Operadores de caixa (próprio), Gestores (todos), Admin |
| **Módulo/Pai** | PDV - Vendas |
| **Prioridade MVP** | ✅ Essencial |

### 3.3 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Operador de caixa, gestor ou dono do negócio
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Início e fim do expediente, momento de transição

#### Por Que Esta Tela Existe
- **Problema que resolve:** Controlar o fluxo de dinheiro no caixa, identificar divergências e gerar relatório diário
- **Valor entregue:** Segurança financeira, rastreabilidade de valores, identificação de problemas
- **Frequência de uso:** Uma vez por turno (início e fim)

#### User Stories Relacionadas
- "Como operador, quero informar o valor inicial em dinheiro para começar a vender"
- "Como gestor, quero saber exatamente quanto entrou e saiu do caixa no dia"
- "Como dono, quero ver se há diferença entre o esperado e o contado para identificar problemas"
- "Como operador, quero imprimir o relatório de fechamento para arquivo físico"
- "Como gestor, quero justificar uma diferença de caixa quando houver explicação válida"

### 3.4 Elementos Obrigatórios - Abertura

#### Dados a Exibir
- **Informações do caixa:** Número do caixa, data e hora atual
- **Operador:** Nome do usuário logado (selecionável se gestor)
- **Campo de valor inicial:** Input para informar quanto em dinheiro existe no caixa

#### Campos de Formulário - Abertura

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Valor inicial em dinheiro | Número (moeda) | Sim | >= 0 |
| Operador/Vendedor | Select | Sim | Lista de operadores ativos |
| Observações | Textarea | Não | Máximo 500 caracteres |

#### Ações - Abertura
- **Confirmar abertura:** Registra abertura e libera o PDV para vendas
- **Cancelar:** Volta para o dashboard sem abrir caixa

### 3.5 Elementos Obrigatórios - Fechamento

#### Dados a Exibir
- **Resumo do dia:** Data, hora de abertura, operador
- **Resumo de vendas por forma de pagamento:**
  - Total em dinheiro (sistema)
  - Total em cartão de débito (sistema)
  - Total em cartão de crédito (sistema)
  - Total em PIX (sistema)
  - Total em outros (sistema)
  - Total geral vendido (sistema)
- **Movimentações do caixa:**
  - Total de sangrias realizadas (retiradas)
  - Total de suprimentos recebidos (adições)
- **Valores esperados vs contados:**
  - Campo para informar valor contado em dinheiro (físico)
  - Diferença calculada automaticamente (positiva, negativa ou zero)
- **Total de vendas do dia:** Quantidade de vendas realizadas
- **Ticket médio:** Valor médio por venda

#### Campos de Formulário - Fechamento

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Valor contado em dinheiro | Número (moeda) | Sim | >= 0 |
| Observações de fechamento | Textarea | Não | Máximo 1000 caracteres |
| Senha do gerente | Password | Condicional | Obrigatório se diferença > limite configurado |

#### Ações - Fechamento
- **Confirmar fechamento:** Registra fechamento e encerra o caixa
- **Imprimir relatório:** Gera impressão do relatório de fechamento
- **Cancelar:** Volta para o PDV sem fechar

### 3.6 Estados da UI

#### Error State - Venda em Andamento
- **Quando aparece:** Tentativa de fechar com venda não finalizada no carrinho
- **Mensagem:** "Não é possível fechar o caixa"
- **Descrição:** "Finalize ou cancele a venda em andamento antes de fechar o caixa"
- **Ação de recuperação:** "Voltar ao PDV"

#### Error State - Diferença Não Justificada
- **Quando aparece:** Diferença significativa sem senha de gerente
- **Mensagem:** "Diferença de caixa identificada"
- **Descrição:** "Há uma diferença entre o valor esperado e o valor contado. Solicite autorização do gerente."

#### Success State - Fechamento Concluído
- **Quando aparece:** Após confirmação do fechamento
- **Feedback:** Confirmação visual
- **Mensagem:** "Caixa fechado com sucesso!"
- **Próximo passo:** Oferecer impressão do relatório

### 3.7 Regras de Negócio

1. **Venda em andamento:** Não é possível fechar o caixa se houver itens no carrinho
2. **Caixa já aberto:** Não permitir abrir caixa se já houver um aberto para o mesmo operador
3. **Diferença tolerada:** Diferenças pequenas (ex: R$ 0,10) podem ser aceitas automaticamente
4. **Diferença grande:** Valores acima do limite exigem senha de gerente e justificativa
5. **Relatório obrigatório:** Sempre oferecer impressão do relatório de fechamento
6. **Histórico:** Todos os fechamentos são registrados e podem ser consultados posteriormente

### 3.8 Notas e Considerações

- Processo deve ser simples para não tomar tempo do operador
- Diferenças devem ser calculadas em tempo real conforme o operador digita
- Relatório deve conter todas as informações necessárias para contabilidade

---

## 4. Tela 3: Finalizar Venda (Pagamentos)

### 4.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Finalizar Venda - Pagamentos |
| **Rota/URL** | `/vendas/pdv/pagamento` (modal ou tela) |
| **Objetivo Principal** | Receber o pagamento da venda, permitindo múltiplas formas de pagamento, cálculo de troco e conclusão da venda |
| **Permissões de Acesso** | Operadores de caixa, Vendedores, Gestores |
| **Módulo/Pai** | PDV - Vendas |
| **Prioridade MVP** | ✅ Essencial |

### 4.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Atendente ou operador de caixa
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Momento final da venda, cliente aguardando para pagar

#### Por Que Esta Tela Existe
- **Problema que resolve:** Receber o pagamento de forma flexível (múltiplas formas, parcelamento, troco)
- **Valor entregue:** Facilidade no recebimento, cálculo automático de troco, registro correto das formas de pagamento
- **Frequência de uso:** A cada venda realizada

#### User Stories Relacionadas
- "Como atendente, quero receber em dinheiro e ver o troco calculado automaticamente para não errar"
- "Como vendedor, quero parcelar no cartão de crédito quando o cliente solicitar"
- "Como atendente, quero receber parte em dinheiro e parte no cartão quando o cliente pedir"
- "Como operador, quero gerar o QR Code do PIX para o cliente pagar com o celular"
- "Como vendedor, quero imprimir o cupom automaticamente após a venda"
- "Como atendente, quero enviar o comprovante por WhatsApp para o cliente"

### 4.3 Elementos Obrigatórios

#### Dados a Exibir
- **Resumo da venda:**
  - Lista de itens (resumida - produto e quantidade)
  - Subtotal
  - Descontos aplicados
  - Total a pagar (destaque visual)
- **Formas de pagamento selecionadas:**
  - Tipo (dinheiro, cartão, PIX, etc.)
  - Valor informado
  - Troco (se dinheiro)
  - Parcelas (se cartão de crédito)
- **Total recebido:** Soma dos valores informados
- **Restante a pagar:** Diferença entre total e recebido
- **Troco total:** Se valor recebido > total

#### Funcionalidades Essenciais
- [ ] **Selecionar forma de pagamento:** Dinheiro, Cartão Débito, Cartão Crédito, PIX, Outros
- [ ] **Informar valor:** Campo para digitar o valor recebido em cada forma
- [ ] **Cálculo automático de troco:** Para pagamentos em dinheiro
- [ ] **Parcelamento:** Seleção de número de parcelas para cartão de crédito
- [ ] **Múltiplas formas:** Permitir adicionar mais de uma forma de pagamento (split payment)
- [ ] **Gerar QR Code PIX:** Para pagamento via PIX
- [ ] **Confirmar venda:** Finalizar a transação
- [ ] **Cancelar:** Voltar ao PDV sem concluir

#### Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Forma de pagamento | Select | Sim | Dinheiro, Débito, Crédito, PIX, Outro |
| Valor recebido | Número (moeda) | Sim | > 0 |
| Valor entregue (dinheiro) | Número (moeda) | Condicional | >= valor recebido (para calcular troco) |
| Parcelas | Select | Condicional | 1-12 (apenas para crédito) |
| Observações | Textarea | Não | Máximo 500 caracteres |
| Imprimir cupom | Checkbox | Não | Default: true |
| Enviar comprovante | Select | Não | Opções: Não enviar, WhatsApp, Email |
| Contato para envio | Texto | Condicional | Obrigatório se envio selecionado |

### 4.4 Ações Possíveis

#### Ações Primárias

1. **Confirmar venda:**
   - **Gatilho:** Botão de confirmação
   - **Resultado:** Venda é registrada, estoque é baixado, financeiro é atualizado
   - **Confirmação:** Sim - "Confirmar venda no valor de R$ XXX?"
   - **Pós-ação:** Impressão de cupom (se selecionado), envio de comprovante

2. **Adicionar forma de pagamento:**
   - **Gatilho:** Seleção de forma de pagamento e informação de valor
   - **Resultado:** Forma adicionada à lista, total atualizado
   - **Confirmação:** Não necessária

#### Ações Secundárias
1. **Remover forma de pagamento:** Remove uma forma adicionada
2. **Limpar formas:** Remove todas as formas para recomeçar
3. **Voltar ao PDV:** Retorna à tela principal sem finalizar
4. **Gerar QR Code PIX:** Gera código para pagamento via PIX

### 4.5 Estados da UI

#### Loading State - Processando Pagamento
- **Quando aparece:** Após confirmar, enquanto processa cartão ou aguarda PIX
- **Tipo:** Overlay com indicador de progresso
- **Mensagem:** "Processando pagamento..." / "Aguardando confirmação do PIX"

#### Error State - Pagamento Negado
- **Quando aparece:** Cartão negado, PIX não confirmado
- **Mensagem:** "Pagamento não autorizado"
- **Ação de recuperação:** Tentar outra forma de pagamento

#### Error State - Valor Insuficiente
- **Quando aparece:** Soma das formas < total da venda
- **Mensagem:** "Valor insuficiente"
- **Descrição:** "Informe formas de pagamento que totalizem o valor da venda"

#### Success State - Venda Concluída
- **Quando aparece:** Pagamento confirmado e venda registrada
- **Feedback:** Confirmação visual destacada
- **Mensagem:** "Venda realizada com sucesso!"
- **Informações:** Número da venda, valores, troco
- **Próximos passos:** "Nova venda", "Imprimir cupom", "Enviar comprovante"

### 4.6 Regras de Negócio

1. **Valor mínimo:** Valor total recebido deve ser igual ou maior que o valor da venda
2. **Troco:** Calculado automaticamente quando valor em dinheiro > valor da venda
3. **Múltiplas formas:** Permitir split payment (ex: R$ 50 dinheiro + R$ 100 cartão)
4. **Parcelamento:** Máximo de parcelas conforme configuração (ex: até 12x)
5. **Valor mínimo parcela:** Parcela mínima de R$ 5,00 (ou conforme configuração)
6. **PIX:** Aguardar confirmação antes de liberar (pode ter timeout)
7. **Cartão:** Integrar com maquininha POS ou gateway de pagamento

### 4.7 Notas e Considerações

- Processo deve ser rápido (cliente aguardando)
- Cálculo de troco deve ser imediato e preciso
- Suporte a maquininhas de cartão (integração futura)
- QR Code PIX deve ser grande o suficiente para leitura fácil
- Possibilidade de reimprimir cupom posteriormente

---

## 5. Tela 4: Sangria e Suprimento

### 5.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Sangria e Suprimento de Caixa |
| **Rota/URL** | `/vendas/pdv/movimentacao` (modal) |
| **Objetivo Principal** | Registrar retiradas (sangria) ou adições (suprimento) de dinheiro no caixa durante o expediente |
| **Permissões de Acesso** | Operadores de caixa (próprio), Gestores (todos) |
| **Módulo/Pai** | PDV - Vendas |
| **Prioridade MVP** | ⚠️ Importante (pode ser MVP ou Fase 2) |

### 5.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Operador de caixa ou gestor
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Durante o expediente, quando há necessidade de retirar ou adicionar dinheiro

#### Por Que Esta Tela Existe
- **Problema que resolve:** Controlar movimentações de dinheiro no caixa que não são vendas (retirada para pagamento de despesas, reforço de troco, etc.)
- **Valor entregue:** Rastreabilidade de todos os valores, segurança, controle financeiro
- **Frequência de uso:** Ocasional (algumas vezes por dia, quando necessário)

#### User Stories Relacionadas
- "Como operador, quero retirar dinheiro do caixa quando estiver com excesso para guardar no cofre"
- "Como atendente, quero adicionar troco ao caixa quando estiver acabando"
- "Como operador, quero registrar uma retirada para pagar uma despesa pontual (ex: entregador)"
- "Como gestor, quero saber quanto foi retirado do caixa durante o dia em sangrias"

### 5.3 Elementos Obrigatórios

#### Dados a Exibir
- **Tipo de movimentação:** Seleção entre Sangria (retirada) ou Suprimento (adição)
- **Saldo atual do caixa:** Valor disponível em dinheiro (antes da movimentação)
- **Valor da movimentação:** Campo para informar o valor
- **Motivo:** Justificativa da movimentação
- **Responsável:** Usuário logado (data e hora automáticas)

#### Funcionalidades Essenciais
- [ ] **Selecionar tipo:** Toggle ou select entre Sangria e Suprimento
- [ ] **Informar valor:** Campo numérico para o valor
- [ ] **Selecionar motivo:** Opções predefinidas + campo "Outro"
- [ ] **Confirmar movimentação:** Registrar a operação
- [ ] **Cancelar:** Fechar sem registrar

#### Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Tipo de movimentação | Select/Radio | Sim | Sangria (retirada) ou Suprimento (adição) |
| Valor | Número (moeda) | Sim | > 0, <= saldo disponível (para sangria) |
| Motivo | Select | Sim | Opções: Excesso de caixa, Troco, Pagamento de despesa, Estorno, Outro |
| Motivo detalhado | Texto | Condicional | Obrigatório se motivo = Outro, mínimo 10 caracteres |
| Observações | Textarea | Não | Máximo 500 caracteres |
| Senha do gerente | Password | Condicional | Se valor > limite configurado |

#### Opções de Motivo - Sangria
- Excesso de caixa (para cofre)
- Pagamento de despesa
- Estorno em dinheiro
- Outro

#### Opções de Motivo - Suprimento
- Reforço de troco
- Devolução de sangria
- Estorno de pagamento
- Outro

### 5.4 Ações Possíveis

#### Ações Primárias

1. **Registrar sangria:**
   - **Gatilho:** Selecionar tipo "Sangria", informar valor e motivo, confirmar
   - **Resultado:** Valor é subtraído do caixa, registrado no histórico
   - **Confirmação:** Sim - "Confirma retirada de R$ XXX do caixa?"

2. **Registrar suprimento:**
   - **Gatilho:** Selecionar tipo "Suprimento", informar valor e motivo, confirmar
   - **Resultado:** Valor é adicionado ao caixa, registrado no histórico
   - **Confirmação:** Sim - "Confirma adição de R$ XXX ao caixa?"

#### Ações Secundárias
1. **Cancelar:** Fecha o modal sem registrar

### 5.5 Estados da UI

#### Error State - Valor Insuficiente
- **Quando aparece:** Tentativa de sangria maior que saldo disponível
- **Mensagem:** "Saldo insuficiente"
- **Descrição:** "O valor da sangria não pode ser maior que o saldo em dinheiro disponível no caixa"

#### Error State - Caixa Fechado
- **Quando aparece:** Tentativa de movimentação com caixa fechado
- **Mensagem:** "Caixa fechado"
- **Descrição:** "É necessário abrir o caixa antes de realizar movimentações"

#### Success State - Movimentação Registrada
- **Quando aparece:** Após confirmação bem-sucedida
- **Feedback:** Confirmação visual
- **Mensagem:** "Movimentação registrada com sucesso!"

### 5.6 Regras de Negócio

1. **Caixa aberto:** Só é possível fazer movimentações com caixa aberto
2. **Saldo suficiente:** Sangria não pode ser maior que o saldo em dinheiro disponível
3. **Autorização:** Valores acima do limite exigem senha de gerente
4. **Registro obrigatório:** Toda movimentação gera registro auditável (quem, quando, quanto, por quê)
5. **Integração:** Movimentações aparecem no relatório de fechamento de caixa
6. **Não reversível:** Movimentações registradas não podem ser excluídas (apenas anuladas com nova movimentação)

### 5.7 Notas e Considerações

- Interface simples e direta (poucos campos)
- Processo rápido para não interromper o atendimento
- Registro claro para auditoria futura
- Sugestão: Mostrar histórico das últimas movimentações do dia

---

## 6. Componentes Específicos do PDV

### 6.1 Teclado Virtual Numérico

**Descrição:** Teclado numérico otimizado para touch, usado para input de quantidade e valores.

**Funcionalidades:**
- Layout numérico padrão (0-9)
- Botões de função: Limpar, Backspace, Confirmar
- Atalhos de quantidade: +1, +5, +10
- Otimizado para uso com os dedos (botões grandes)
- Feedback tátil/visual ao pressionar

**Estados:**
- **Default:** Aguardando input
- **Active:** Tecla sendo pressionada
- **Disabled:** Quando campo atinge valor máximo

### 6.2 Display de Valores

**Descrição:** Área que mostra os valores da venda em tempo real.

**Dados exibidos:**
- Subtotal (soma dos itens)
- Descontos (total de descontos aplicados)
- Total a pagar (valor principal, maior destaque)
- Troco (após informar valor recebido)

**Regras:**
- Atualização em tempo real (sem delay)
- Valores sempre visíveis
- Destaque visual para o total

### 6.3 Lista de Produtos no Carrinho

**Descrição:** Lista scrollável dos itens adicionados à venda atual.

**Elementos por item:**
- Miniatura da imagem do produto
- Nome do produto
- Quantidade (com controles + e -)
- Preço unitário
- Subtotal do item
- Indicador de desconto aplicado (se houver)
- Botão remover

**Comportamentos:**
- Scroll automático para o último item adicionado
- Destaque visual para item recém-adicionado
- Permitir edição inline de quantidade
- Limite de altura com scroll

### 6.4 Busca Rápida de Produtos

**Descrição:** Campo de busca para localizar produtos rapidamente.

**Funcionalidades:**
- Busca em tempo real
- Por código interno, código de barras ou nome
- Resultados em dropdown com imagem, nome e preço
- Foco automático para scanner
- Sugestões de produtos populares

### 6.5 Grid de Produtos Favoritos

**Descrição:** Área com atalhos rápidos para produtos mais vendidos.

**Funcionalidades:**
- Exibe produtos configurados como favoritos
- Visual em cards ou botões
- Acesso em um toque/click
- Possibilidade de paginação/categorias

---

## 7. Integrações

### 7.1 Com Outros Módulos

#### Estoque
- **Baixa automática:** Produtos vendidos dão baixa no estoque imediatamente
- **Validação:** Verifica disponibilidade antes de permitir venda
- **Alerta:** Notifica quando produto atinge estoque mínimo
- **Reversão:** Cancelamento de venda devolve estoque

#### Financeiro
- **Lançamento de receita:** Cada venda gera entrada no financeiro
- **Conciliação:** Formas de pagamento registradas para reconciliação
- **Fluxo de caixa:** Entradas refletem no fluxo do dia
- **Taxas:** Cartões registram taxas de intermediação

#### CRM
- **Vinculação de cliente:** Vendas podem ser vinculadas a clientes cadastrados
- **Histórico:** Cliente visualiza suas compras na área logada
- **Pontuação:** Sistema de fidelidade (futuro)
- **Preços especiais:** Clientes identificados podem ter preços diferenciados

#### Catálogo
- **Produtos ativos:** Só exibe produtos habilitados para venda
- **Preços:** Busca preços atualizados
- **Variações:** Gerencia produtos com tamanhos, cores, etc.
- **Imagens:** Exibe fotos dos produtos

#### MEL (IA Proativa)
- **Alertas:** Notifica quando vendedor está próximo da meta
- **Sugestões:** Recomenda produtos complementares
- **Anomalias:** Alerta sobre vendas fora do padrão
- **Lembretes:** Avisa sobre estoque baixo de produtos populares

### 7.2 Com Sistemas Externos

#### Impressora Térmica
- **Cupom não fiscal:** Imprime comprovante de venda
- **Relatórios:** Imprime fechamento de caixa
- **Configuração:** Seleção de impressora nas configurações

#### Leitor de Código de Barras
- **Input automático:** Captura código sem necessidade de focar campo
- **Feedback:** Beep sonoro de confirmação
- **Compatibilidade:** USB e Bluetooth

#### Maquininha de Cartão (POS)
- **Integração:** Comunicação com POS para débito/crédito
- **Status:** Aguarda confirmação de pagamento
- **Cancelamento:** Permite cancelar transação não finalizada

#### Gateway de Pagamento
- **PIX:** Geração de QR Code e confirmação
- **Cartão:** Processamento online de transações
- **Webhook:** Recebe confirmações assíncronas

---

## 8. Regras de Negócio Globais do PDV

### 8.1 Permissões e Acesso

1. **Abertura de caixa:** Apenas usuários com perfil de operador ou superior
2. **Fechamento de caixa:** Operador pode fechar próprio caixa, gestores podem fechar qualquer
3. **Descontos:** Limite máximo por perfil (ex: vendedor 5%, gerente 15%, admin ilimitado)
4. **Cancelamento de venda:** Apenas gestores ou admin (ou dentro de prazo curto pelo operador)
5. **Sangria de valores altos:** Exige senha de gerente

### 8.2 Fluxo de Venda

1. **Pré-condição:** Caixa deve estar aberto
2. **Adição de produtos:** Produtos são adicionados ao carrinho
3. **Validações:** Estoque, preços mínimos, cliente obrigatório (se aplicável)
4. **Pagamento:** Uma ou mais formas de pagamento
5. **Confirmação:** Venda registrada, estoque baixado, financeiro atualizado
6. **Pós-venda:** Cupom impresso (opcional), comprovante enviado (opcional)

### 8.3 Gestão de Caixa

1. **Ciclo de vida:** Abertura → Vendas → Movimentações → Fechamento
2. **Saldo:** Inicial + Suprimentos + Vendas em dinheiro - Sangrias = Esperado
3. **Conferência:** Valor contado vs valor esperado = Diferença
4. **Diferenças:** Pequenas toleradas, grandes exigem justificativa
5. **Histórico:** Todos os caixas são arquivados e podem ser consultados

### 8.4 Cancelamentos e Estornos

1. **Prazo:** Venda pode ser cancelada apenas no mesmo dia ou caixa aberto
2. **Justificativa:** Motivo obrigatório para cancelamento
3. **Reversões:** Estoque devolvido, financeiro estornado
4. **Auditoria:** Todos os cancelamentos são registrados com usuário e motivo
5. **Notificação:** Gestores são notificados de cancelamentos

### 8.5 Validações Financeiras

1. **Valor negativo:** Não permitir venda com valor negativo
2. **Troco máximo:** Limite de troco (se configurado)
3. **Pagamento parcial:** Permitir múltiplas formas (split payment)
4. **Arredondamento:** Regras de arredondamento de centavos (se aplicável)

---

## 9. Checklist de Qualidade

Antes de entregar esta documentação, verifique:

### ✅ Funcionalidade
- [x] Todas as 4 telas documentadas (PDV Principal, Abertura/Fechamento, Pagamentos, Sangria/Suprimento)
- [x] User stories no formato correto ("Como... quero... para que...")
- [x] Metadados completos para cada tela (nome, rota, objetivo, permissões)
- [x] Contexto do usuário UNIQ descrito (empreendedor na correria)
- [x] Elementos obrigatórios listados (dados, funcionalidades)
- [x] Campos de formulário com tipo, obrigatoriedade e validações
- [x] Ações classificadas (primárias, secundárias, destruição)
- [x] Estados de UI descritos (empty, loading, error, success)
- [x] Regras de negócio explícitas
- [x] Integrações com outros módulos documentadas

### ✅ Restrições Visuais (Matriz)
- [x] Nenhum wireframe ou ASCII art
- [x] Nenhuma especificação de posicionamento ("botão à direita", "card no topo")
- [x] Nenhuma cor hexadecimal
- [x] Nenhum tamanho em pixels
- [x] Nenhuma fonte específica
- [x] Nenhuma descrição de layout ("duas colunas", "sidebar")
- [x] Nenhuma animação detalhada

### ✅ Preparação para Figma Make
- [x] Foco em "O QUÊ" e não "COMO"
- [x] Liberdade criativa preservada para o designer
- [x] Requisitos funcionais claros e completos
- [x] Contexto do usuário bem definido
- [x] Pronto para ser transformado em prompt para Figma Make

---

## 10. Próximos Passos

1. **Revisão:** Product Owner revisa documentação para validar requisitos
2. **Prompt Figma Make:** Transformar este documento em prompt para geração de telas
3. **Implementação:** Após aprovação dos designs, desenvolvimento técnico
4. **Testes:** Validação com usuários reais do público UNIQ

---

> **Documento criado seguindo a Matriz de Documentação UI do UNIQ**  
> **Status:** ✅ Pronto para Figma Make
