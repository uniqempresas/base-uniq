# Módulo Financeiro - Documentação UI

> **Documentação para Figma Make**  
> **Produto:** UNIQ Empresas  
> **Público:** Empreendedores MEI/Micro (1-3 funcionários)  
> **Tom de Voz:** Simples, acolhedor, profissional - "Você consegue!"  
> **Data:** Março 2025

---

## 1. Visão Geral do Módulo

### 1.1 Propósito
O Módulo Financeiro permite que o empreendedor visualize, organize e controle todo o dinheiro que entra e sai do negócio. É o módulo que responde às perguntas mais importantes: "Estou no lucro?", "O que preciso pagar?", "Quem me deve?"

### 1.2 Contexto do Usuário
**Quem usa:** Dono do negócio, gestor financeiro (geralmente o próprio dono em pequenas empresas)

**Conhecimento técnico:** Baixo. Não é contador, não entende de contabilidade formal. Quer ver números simples que façam sentido para o dia a dia.

**Contexto de uso:** Geralmente à noite ou nos finais de semana, quando sobra um tempo da correria das vendas. Usa principalmente no celular.

**Frequência:** Semanal ou quinzenal, com picos no final do mês (contas a pagar) e início do mês (análise de resultados).

### 1.3 User Stories do Módulo
- "Como empreendedor, quero saber se meu negócio está no lucro ou no prejuízo"
- "Como gestor, quero ver todas as contas que preciso pagar para não esquecer nenhuma"
- "Como dono, quero saber quais clientes ainda não me pagaram para fazer a cobrança"
- "Como empresário, quero entender meus maiores gastos para poder cortar despesas"

---

## 2. Tela 1: Fluxo de Caixa

### 2.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Fluxo de Caixa |
| **Rota/URL** | `/financeiro/fluxo-de-caixa` |
| **Objetivo Principal** | Visualizar entradas e saídas de dinheiro do negócio em um período específico |
| **Permissões de Acesso** | Visualização: Todos | Edição: Gestor, Admin |
| **Módulo/Pai** | Módulo Financeiro |
| **Prioridade MVP** | ✅ Essencial |

### 2.2 Contexto do Usuário

**Quem Usa Esta Tela:**
- **Perfil:** Empreendedor que quer entender a saúde financeira do negócio
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Verificando se tem dinheiro suficiente para pagar contas, analisando se o mês foi bom ou ruim

**Por Que Esta Tela Existe:**
- **Problema que resolve:** Desorganização financeira, não saber se o negócio está lucrando ou perdendo dinheiro
- **Valor entregue:** Clareza sobre o dinheiro que entra e sai, visão real da saúde financeira
- **Frequência de uso:** Semanal ou mensal

**User Stories Relacionadas:**
- "Como empreendedor, quero ver quanto entrou e saiu este mês para saber se estou no lucro"
- "Como gestor, quero filtrar por categoria para ver onde estou gastando mais"
- "Como dono do negócio, quero ver o comparativo com o mês anterior para saber se cresci"
- "Como empresário, quero saber meu saldo atual para decidir se posso fazer uma compra"

### 2.3 Elementos Obrigatórios

#### Dados a Exibir

**Cards de Resumo (KPIs):**
- Saldo inicial do período (valor em moeda)
- Total de entradas/receitas do período (valor em moeda)
- Total de saídas/despesas do período (valor em moeda)
- Saldo final do período (valor em moeda)
- Comparativo com período anterior (percentual e indicador de crescimento/queda)

**Gráfico de Fluxo:**
- Visualização temporal de entradas vs saídas
- Eixo X: dias do período selecionado
- Eixo Y: valores em moeda
- Duas séries: entradas (cor positiva) e saídas (cor de alerta)

**Lista de Movimentações:**
- Data da movimentação
- Descrição do que foi (ex: "Pagamento fornecedor XYZ", "Venda #1234")
- Categoria (ex: Aluguel, Vendas, Impostos)
- Tipo (entrada ou saída)
- Valor (formatado em moeda)
- Status (pago, pendente, agendado)

#### Funcionalidades Essenciais

- **Filtro por período:** Selecionar mês/ano (default: mês atual), opções rápidas (este mês, mês anterior, últimos 3 meses)
- **Filtro por categoria:** Ver apenas uma categoria específica
- **Filtro por tipo:** Ver apenas entradas ou apenas saídas
- **Filtro por status:** Ver apenas pagos, pendentes ou todos
- **Nova movimentação:** Adicionar entrada ou saída manualmente
- **Busca:** Encontrar movimentação específica por descrição

#### Campos de Formulário (Nova Movimentação)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Descrição | Texto | Sim | Mínimo 3 caracteres |
| Tipo | Select | Sim | Entrada ou Saída |
| Valor | Moeda | Sim | Maior que zero |
| Data | Date | Sim | Data válida |
| Categoria | Select | Sim | Lista de categorias cadastradas |
| Status | Select | Sim | Pago, Pendente |
| Observações | Textarea | Não | Máximo 500 caracteres |

### 2.4 Elementos Opcionais

- Exportar relatório em PDF/Excel
- Duplicar movimentação recorrente
- Anexar comprovante

### 2.5 Ações Possíveis

#### Ações Primárias

1. **Adicionar nova movimentação:**
   - **Gatilho:** Botão principal visível
   - **Resultado:** Abre modal/formulário de nova movimentação
   - **Confirmação:** Não necessária, mas mostra feedback de sucesso

2. **Filtrar por período:**
   - **Gatilho:** Seletor de mês/ano
   - **Resultado:** Atualiza todos os dados da tela
   - **Confirmação:** Não necessária

#### Ações Secundárias

1. Editar movimentação existente
2. Excluir movimentação
3. Exportar relatório
4. Visualizar detalhes da movimentação
5. Duplicar movimentação

#### Ações de Destruição

1. **Excluir movimentação:**
   - **Gatilho:** Botão de exclusão na linha da movimentação
   - **Confirmação:** Modal obrigatório com mensagem "Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita."
   - **Validação:** Movimentações já pagas/recebidas só podem ser excluídas por gestores

### 2.6 Estados da UI

#### Empty State - Sem Movimentações
- **Quando aparece:** Período selecionado não tem nenhuma movimentação cadastrada
- **Título:** "Nenhuma movimentação neste período"
- **Descrição:** "Comece registrando sua primeira entrada ou saída de dinheiro"
- **CTA primário:** "Adicionar movimentação"
- **Dica:** "Você pode registrar vendas, pagamentos de fornecedores, contas fixas..."

#### Loading State
- **Quando aparece:** Carregando dados do período selecionado
- **Tipo:** Skeleton dos cards de resumo e da lista
- **Mensagem:** "Carregando movimentações..."

#### Error State
- **Quando aparece:** Falha ao carregar dados do servidor
- **Título:** "Não foi possível carregar as movimentações"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State
- **Quando aparece:** Após adicionar, editar ou excluir movimentação
- **Feedback:** Toast temporário
- **Mensagens:**
  - "Movimentação adicionada com sucesso!"
  - "Movimentação atualizada"
  - "Movimentação removida"

#### Estado Especial - Saldo Negativo
- **Quando aparece:** Saldo final é negativo (despesas maiores que receitas)
- **Comportamento:** Destaque visual amigável indicando prejuízo
- **Mensagem:** "Atenção: seu saldo está negativo neste período. Que tal revisar suas despesas?"
- **Ação:** Link para ver apenas despesas

### 2.7 Integrações

#### Com Outras Telas
- Navega para: Cadastro de nova movimentação, Detalhes da movimentação
- Recebe de: Todas as telas do módulo financeiro

#### Com Outros Módulos
- **Vendas:** Receitas lançadas automaticamente quando uma venda é finalizada no PDV ou Loja
- **Contas a Pagar:** Saídas registradas aqui aparecem no fluxo de caixa
- **Contas a Receber:** Entradas registradas aqui aparecem no fluxo de caixa
- **MEL (IA):** Alertas proativos sobre saldo baixo ou muitas despesas

---

## 3. Tela 2: Contas a Pagar

### 3.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Contas a Pagar |
| **Rota/URL** | `/financeiro/contas-pagar` |
| **Objetivo Principal** | Gerenciar todas as obrigações financeiras e despesas do negócio |
| **Permissões de Acesso** | Visualização: Todos | Criação: Todos | Edição: Gestor ou próprio lançamento | Exclusão: Gestor, Admin apenas |
| **Módulo/Pai** | Módulo Financeiro |
| **Prioridade MVP** | ✅ Essencial |

### 3.2 Contexto do Usuário

**Quem Usa Esta Tela:**
- **Perfil:** Empreendedor organizando o que precisa pagar
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** No início do mês, cadastrando todas as contas; durante o mês, verificando o que está vencendo

**Por Que Esta Tela Existe:**
- **Problema que resolve:** Esquecimento de contas a pagar, falta de organização das despesas
- **Valor entregue:** Controle total das obrigações financeiras, alertas de vencimentos
- **Frequência de uso:** Semanal (verificar vencimentos) + mensal (cadastrar contas fixas)

**User Stories Relacionadas:**
- "Como empreendedor, quero cadastrar todas as contas do mês para não esquecer de pagar"
- "Como gestor, quero ver quais contas estão vencidas para pagar urgentemente"
- "Como dono, quero duplicar uma conta recorrente (como aluguel) para não cadastrar toda vez"
- "Como empresário, quero saber quanto vou gastar este mês para planejar meu caixa"

### 3.3 Elementos Obrigatórios

#### Dados a Exibir

**Cards de Resumo:**
- Total a pagar no período selecionado (valor em moeda)
- Total vencido (valor em moeda + alerta visual)
- Total pago no período (valor em moeda)
- Quantidade de contas pendentes (número)

**Lista de Contas:**
- Descrição do que é (ex: "Aluguel", "Internet", "Fornecedor XYZ")
- Fornecedor/beneficiário (nome)
- Categoria (ex: Despesas Fixas, Impostos, Fornecedores)
- Data de vencimento
- Valor (formatado em moeda)
- Status (badge: pendente, paga, vencida)
- Dias para vencer ou dias de atraso

#### Funcionalidades Essenciais

- **Filtro por período:** Este mês, próximo mês, vencidas, todas
- **Filtro por status:** Pendente, paga, vencida, todas
- **Filtro por categoria:** Lista de categorias de despesa
- **Filtro por fornecedor:** Busca por nome
- **Nova conta a pagar:** Cadastrar nova despesa
- **Registrar pagamento:** Marcar conta como paga
- **Busca:** Encontrar conta específica

#### Campos de Formulário (Nova Conta)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Descrição | Texto | Sim | Mínimo 3 caracteres |
| Fornecedor/Beneficiário | Texto/Select | Sim | Mínimo 2 caracteres |
| Categoria | Select | Sim | Lista de categorias |
| Valor | Moeda | Sim | Maior que zero |
| Data de vencimento | Date | Sim | Data válida |
| Observações | Textarea | Não | Máximo 500 caracteres |
| Recorrente | Checkbox | Não | Se marcado, aparece frequência |
| Frequência | Select | Se recorrente | Mensal, Semanal, Anual |

#### Campos de Formulário (Registrar Pagamento)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Data do pagamento | Date | Sim | Data válida, não futura |
| Valor pago | Moeda | Sim | Maior que zero |
| Forma de pagamento | Select | Sim | Dinheiro, PIX, Boleto, Transferência, Cartão |
| Conta bancária | Select | Sim | Lista de contas cadastradas |
| Comprovante | File | Não | PDF, JPG, PNG (máx 10MB) |
| Observações | Textarea | Não | Máximo 500 caracteres |

### 3.4 Elementos Opcionais

- Exportar lista em CSV/Excel
- Importar contas via CSV
- Gerar boleto (se integrado)
- Duplicar conta recorrente

### 3.5 Ações Possíveis

#### Ações Primárias

1. **Nova conta a pagar:**
   - **Gatilho:** Botão principal visível
   - **Resultado:** Abre modal/formulário de nova conta
   - **Confirmação:** Não necessária

2. **Registrar pagamento:**
   - **Gatilho:** Botão na linha da conta pendente
   - **Resultado:** Abre modal de baixa/pagamento
   - **Confirmação:** Não necessária, mas mostra feedback

#### Ações Secundárias

1. Editar conta
2. Excluir conta
3. Duplicar conta (para recorrentes)
4. Exportar lista
5. Visualizar detalhes
6. Enviar comprovante

#### Ações de Destruição

1. **Excluir conta:**
   - **Gatilho:** Botão de exclusão na linha
   - **Confirmação:** Modal obrigatório
   - **Mensagem:** "Tem certeza que deseja excluir '[descrição]' no valor de R$ [valor]?"
   - **Validação adicional:** Se já foi paga, mostrar aviso "Esta conta já foi paga. A exclusão irá reverter o movimento."
   - **Permissão:** Apenas gestores e admin podem excluir

### 3.6 Estados da UI

#### Empty State - Sem Contas
- **Quando aparece:** Nenhuma conta cadastrada no sistema
- **Título:** "Nenhuma conta cadastrada"
- **Descrição:** "Organize suas despesas cadastrando as contas do mês"
- **CTA primário:** "Cadastrar primeira conta"
- **Dica:** "Dica: cadastre contas recorrentes como aluguel e internet"

#### Empty State - Busca Sem Resultados
- **Quando aparece:** Filtros aplicados não retornam resultados
- **Título:** "Nenhuma conta encontrada"
- **Descrição:** "Tente ajustar os filtros ou o período selecionado"
- **CTA:** "Limpar filtros"

#### Loading State
- **Quando aparece:** Carregando lista de contas
- **Tipo:** Skeleton de linhas simulando a tabela
- **Mensagem:** "Carregando contas..."

#### Error State
- **Quando aparece:** Falha ao carregar dados
- **Título:** "Não foi possível carregar as contas"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State
- **Quando aparece:** Após ações de sucesso
- **Feedback:** Toast temporário
- **Mensagens:**
  - "Conta cadastrada com sucesso!"
  - "Pagamento registrado"
  - "Conta atualizada"
  - "Conta removida"

#### Estado Especial - Contas Vencidas
- **Quando aparece:** Existem contas com data de vencimento anterior à data atual e status pendente
- **Comportamento:** Alerta visual destacado no topo da tela
- **Mensagem:** "Você tem [X] conta(s) vencida(s). Clique para ver."
- **Lista:** Contas vencidas são destacadas visualmente na lista

#### Estado Especial - Tudo em Dia
- **Quando aparece:** Todas as contas do período estão pagas e não há vencidas
- **Comportamento:** Mensagem positiva amigável
- **Mensagem:** "Tudo em dia! ✅ Nenhuma conta pendente."

### 3.7 Integrações

#### Com Outras Telas
- Navega para: Detalhes da conta, Edição de conta
- Recebe de: Dashboard Financeiro, Fluxo de Caixa

#### Com Outros Módulos
- **Fluxo de Caixa:** Contas pagas aparecem automaticamente como saídas
- **Fornecedores:** Vinculação com cadastro de fornecedores
- **MEL (IA):** Alertas de contas próximas do vencimento ou vencidas
- **WhatsApp:** Envio de comprovante via WhatsApp

---

## 4. Tela 3: Contas a Receber

### 4.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Contas a Receber |
| **Rota/URL** | `/financeiro/contas-receber` |
| **Objetivo Principal** | Gerenciar receitas pendentes, parcelas e cobranças de clientes |
| **Permissões de Acesso** | Visualização: Todos | Criação: Todos | Edição: Gestor ou próprio lançamento | Exclusão: Gestor, Admin |
| **Módulo/Pai** | Módulo Financeiro |
| **Prioridade MVP** | ✅ Essencial |

### 4.2 Contexto do Usuário

**Quem Usa Esta Tela:**
- **Perfil:** Empreendedor acompanhando pagamentos de clientes
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Verificando quem ainda não pagou, enviando cobranças, registrando recebimentos

**Por Que Esta Tela Existe:**
- **Problema que resolve:** Inadimplência, falta de controle do que clientes devem
- **Valor entregue:** Controle total dos recebíveis, ferramentas de cobrança, projeção de receitas
- **Frequência de uso:** Semanal (cobranças) + diário (recebimentos)

**User Stories Relacionadas:**
- "Como empreendedor, quero ver quais clientes ainda não pagaram para fazer a cobrança"
- "Como vendedor, quero registrar um recebimento de parcela"
- "Como gestor, quero enviar mensagem de cobrança pelo WhatsApp direto daqui"
- "Como dono, quero saber quanto vou receber este mês para planejar meu caixa"

### 4.3 Elementos Obrigatórios

#### Dados a Exibir

**Cards de Resumo:**
- Total a receber no período (valor em moeda)
- Total em atraso (valor em moeda + alerta visual)
- Total recebido no período (valor em moeda)
- Previsão de receita (valor em moeda)

**Lista de Contas:**
- Cliente (nome)
- Descrição (pedido, serviço, parcela X de Y)
- Data prevista de recebimento
- Valor (formatado em moeda)
- Status (badge: a receber, recebido, atrasado)
- Dias para vencer ou dias de atraso

#### Funcionalidades Essenciais

- **Filtro por período:** Este mês, próximo mês, atrasadas, todas
- **Filtro por status:** A receber, recebido, atrasado
- **Filtro por cliente:** Busca por nome
- **Filtro por forma de pagamento:** Boleto, PIX, Cartão, etc.
- **Nova conta a receber:** Cadastrar nova receita
- **Registrar recebimento:** Marcar como recebido
- **Enviar cobrança:** Disparar mensagem de cobrança
- **Busca:** Encontrar conta específica

#### Campos de Formulário (Nova Conta)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Cliente | Select/Search | Sim | Selecionar cliente cadastrado |
| Descrição | Texto | Sim | Mínimo 3 caracteres |
| Categoria | Select | Sim | Lista de categorias de receita |
| Valor | Moeda | Sim | Maior que zero |
| Data prevista | Date | Sim | Data válida |
| Forma de recebimento | Select | Não | Boleto, PIX, Cartão, Dinheiro |
| Observações | Textarea | Não | Máximo 500 caracteres |
| Parcelado | Checkbox | Não | Se marcado, ativa campos de parcela |
| Número de parcelas | Number | Se parcelado | 2 a 48 |
| Vincular à venda | Select | Não | Lista de vendas do PDV/Loja |

#### Campos de Formulário (Registrar Recebimento)

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Data do recebimento | Date | Sim | Data válida, não futura |
| Valor recebido | Moeda | Sim | Maior que zero |
| Forma de recebimento | Select | Sim | Dinheiro, PIX, Boleto, etc. |
| Conta bancária | Select | Sim | Lista de contas cadastradas |
| Comprovante | File | Não | PDF, JPG, PNG (máx 10MB) |
| Observações | Textarea | Não | Máximo 500 caracteres |

### 4.4 Elementos Opcionais

- Gerar link de pagamento PIX
- Gerar boleto
- Receber via cartão (integração)
- Exportar lista
- Enviar cobrança por email

### 4.5 Ações Possíveis

#### Ações Primárias

1. **Nova conta a receber:**
   - **Gatilho:** Botão principal visível
   - **Resultado:** Abre modal/formulário
   - **Confirmação:** Não necessária

2. **Registrar recebimento:**
   - **Gatilho:** Botão na linha da conta a receber
   - **Resultado:** Abre modal de recebimento
   - **Confirmação:** Não necessária

3. **Enviar cobrança:**
   - **Gatilho:** Botão na linha da conta atrasada
   - **Resultado:** Abre modal de cobrança
   - **Confirmação:** Não necessária, mas mostra preview da mensagem

#### Ações Secundárias

1. Editar conta
2. Excluir conta
3. Gerar boleto
4. Receber via PIX (gerar QR Code)
5. Exportar lista
6. Visualizar detalhes

#### Ações de Destruição

1. **Excluir conta:**
   - **Gatilho:** Botão de exclusão
   - **Confirmação:** Modal obrigatório
   - **Mensagem:** "Tem certeza que deseja excluir o recebimento de '[cliente]' no valor de R$ [valor]?"
   - **Validação:** Apenas gestores e admin

### 4.6 Estados da UI

#### Empty State - Sem Contas
- **Quando aparece:** Nenhuma conta a receber cadastrada
- **Título:** "Nenhuma conta a receber cadastrada"
- **Descrição:** "Cadastre parcelas, fiados ou recebimentos futuros"
- **CTA primário:** "Cadastrar primeira conta"
- **Dica:** "Contas a receber aparecem automaticamente quando você vende no boleto ou parcelado"

#### Loading State
- **Quando aparece:** Carregando lista
- **Tipo:** Skeleton
- **Mensagem:** "Carregando contas..."

#### Error State
- **Quando aparece:** Falha ao carregar
- **Título:** "Não foi possível carregar as contas"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State
- **Feedback:** Toast temporário
- **Mensagens:**
  - "Conta a receber cadastrada!"
  - "Recebimento registrado"
  - "Cobrança enviada com sucesso"

#### Estado Especial - Contas Atrasadas
- **Quando aparece:** Existem contas com data prevista anterior à atual e status pendente
- **Comportamento:** Alerta visual destacado
- **Mensagem:** "Você tem [X] cliente(s) com pagamento atrasado."
- **Lista:** Contas atrasadas destacadas visualmente

#### Estado Especial - Modal de Cobrança
- **Conteúdo:**
  - Preview da mensagem de cobrança personalizada
  - Dados do cliente preenchidos automaticamente
  - Valor e data de vencimento
  - Canal de envio: WhatsApp (checkbox)
  - Botão "Enviar cobrança"

### 4.7 Integrações

#### Com Outras Telas
- Navega para: Detalhes da conta, Edição
- Recebe de: Vendas (PDV/Loja), Dashboard Financeiro

#### Com Outros Módulos
- **Vendas:** Lançamento automático quando venda é parcelada ou no boleto
- **CRM:** Acesso aos dados e contatos do cliente
- **Fluxo de Caixa:** Recebimentos aparecem como entradas
- **MEL (IA):** Alertas de clientes com atraso
- **WhatsApp:** Envio de mensagens de cobrança

---

## 5. Tela 4: DRE Simples (Demonstrativo de Resultados)

### 5.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | DRE Simples |
| **Rota/URL** | `/financeiro/dre` |
| **Objetivo Principal** | Apresentar visão simplificada do lucro ou prejuízo do negócio |
| **Permissões de Acesso** | Visualização: Todos | Exportação: Gestor, Admin |
| **Módulo/Pai** | Módulo Financeiro |
| **Prioridade MVP** | ⚠️ Importante (versão simplificada) |

### 5.2 Contexto do Usuário

**Quem Usa Esta Tela:**
- **Perfil:** Empreendedor querendo entender se está lucrando
- **Conhecimento técnico:** Baixo (não é contador)
- **Contexto de uso:** Final do mês, querendo ver o "resultado" do mês; reunião com sócio ou contador

**Por Que Esta Tela Existe:**
- **Problema que resolve:** Dificuldade de entender se o negócio dá lucro, confusão com números complexos
- **Valor entregue:** Clareza simples sobre receitas, despesas e lucro
- **Frequência de uso:** Mensal

**User Stories Relacionadas:**
- "Como empreendedor, quero ver se estou lucrando ou perdendo dinheiro"
- "Como dono, quero entender quais são meus maiores custos"
- "Como gestor, quero comparar este mês com o mês anterior"
- "Como empresário, quero saber minha margem de lucro"

### 5.3 Elementos Obrigatórios

#### Dados a Exibir

**Resumo Visual (KPIs):**
- Receitas totais do período (valor em moeda)
- Despesas totais do período (valor em moeda)
- Lucro ou prejuízo líquido (valor em moeda + indicador visual)
- Margem de lucro (percentual)

**Gráfico Comparativo:**
- Visualização de receitas vs despesas
- Tipo: barras ou pizza
- Foco em fácil interpretação visual

**Breakdown Simples:**
- Principais categorias de receita (top 3-5) com valores
- Principais categorias de despesa (top 3-5) com valores
- Percentual de cada categoria no total

**Estrutura DRE Simplificada:**
```
RECEITA BRUTA
(-) Impostos (se houver lançados)
(=) RECEITA LÍQUIDA

(-) Custos (mercadorias vendidas)
(=) LUCRO BRUTO

(-) Despesas Operacionais (soma das despesas)
(=) LUCRO LÍQUIDO
```

#### Funcionalidades Essenciais

- **Seletor de período:** Mês/ano (default: mês atual)
- **Comparativo:** Toggle para comparar com período anterior
- **Visualizar detalhes:** Expandir categorias para ver itens

### 5.4 Elementos Opcionais

- Exportar em PDF
- Comparativo gráfico mês a mês
- Configurar categorias DRE (mapeamento avançado)

### 5.5 Ações Possíveis

#### Ações Primárias

1. **Mudar período:**
   - **Gatilho:** Seletor de mês/ano
   - **Resultado:** Atualiza todos os dados
   - **Confirmação:** Não necessária

2. **Ativar/desativar comparativo:**
   - **Gatilho:** Toggle/checkbox
   - **Resultado:** Mostra/esconde dados do período anterior
   - **Confirmação:** Não necessária

#### Ações Secundárias

1. Exportar PDF
2. Ver detalhes de uma categoria
3. Configurar categorias (gestor)

### 5.6 Estados da UI

#### Empty State - Sem Dados
- **Quando aparece:** Período selecionado não tem movimentações
- **Título:** "Nenhuma movimentação neste período"
- **Descrição:** "Cadastre receitas e despesas para ver seu resultado"
- **CTA:** "Ir para Fluxo de Caixa"

#### Loading State
- **Quando aparece:** Calculando dados
- **Tipo:** Skeleton dos cards e gráfico
- **Mensagem:** "Calculando resultados..."

#### Error State
- **Quando aparece:** Falha ao calcular
- **Título:** "Não foi possível gerar o DRE"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Estado Especial - Prejuízo
- **Quando aparece:** Lucro líquido é negativo
- **Comportamento:** Destaque visual amigável
- **Mensagem:** "Seu resultado foi negativo este mês. Que tal revisar suas despesas?"
- **Ação:** Link para ver maiores despesas

#### Estado Especial - Lucro
- **Quando aparece:** Lucro líquido positivo
- **Comportamento:** Feedback positivo
- **Mensagem:** "Parabéns! Seu negócio teve lucro este mês. 🎉"

### 5.7 Integrações

#### Com Outras Telas
- Recebe dados de: Fluxo de Caixa, Contas a Pagar, Contas a Receber

#### Com Outros Módulos
- **Categorias:** Mapeamento de categorias para estrutura DRE
- **Vendas:** Dados de receita
- **Estoque:** Dados de custo de produtos

---

## 6. Componentes Específicos

### 6.1 Card de Saldo/Valor

**Dados exibidos:**
- Valor em destaque (formato moeda)
- Label descritivo (ex: "Total a Pagar", "Saldo Projetado")
- Comparativo com período anterior (percentual + indicador)
- Indicador visual de tendência (positivo/negativo)

**Estados:**
- Loading: Skeleton
- Empty: "R$ 0,00" + mensagem
- Error: Ícone de erro

### 6.2 Badge de Status Financeiro

**Variantes:**
- **Pendente/A Receber:** Estado neutro
- **Pago/Recebido:** Estado positivo
- **Vencido/Atrasado:** Estado de alerta
- **Cancelado:** Estado inativo

**Conteúdo:**
- Texto do status
- Ícone indicativo

### 6.3 Indicador de Vencimento

**Comportamento:**
- Mostra dias para vencer ou dias de atraso
- Muda visualmente conforme a urgência
- Tooltip com data exata

**Regras:**
- > 7 dias: Estado neutro
- 1-7 dias: Estado de atenção
- Hoje: Estado urgente
- Vencido: Estado crítico

### 6.4 Lista de Lançamentos

**Colunas padrão:**
- Data
- Descrição
- Pessoa (cliente/fornecedor)
- Categoria
- Valor
- Status
- Ações

**Features:**
- Ordenação por coluna
- Seleção múltipla
- Hover destacando linha

---

## 7. Integrações

### 7.1 Com Outros Módulos

| Módulo | Integração | Dados Trocados |
|--------|------------|----------------|
| **Vendas (PDV/Loja)** | Lançamento automático | Vendas geram contas a receber; recebimentos alimentam fluxo de caixa |
| **Estoque** | Custo de produtos | Custo das mercadorias vendidas para DRE |
| **CRM** | Dados do cliente | Nome, contato, histórico para contas a receber |
| **MEL (IA)** | Alertas proativos | Avisos de contas vencidas, saldo baixo, inadimplência |
| **WhatsApp** | Envio de mensagens | Cobranças, comprovantes |

### 7.2 Fluxos de Dados

```
Vendas PDV/Loja
     ↓
Contas a Receber (parcelas, boletos)
     ↓
Recebimento registrado
     ↓
Fluxo de Caixa (entradas)
     ↓
DRE (receitas)

Compras/Despesas
     ↓
Contas a Pagar
     ↓
Pagamento registrado
     ↓
Fluxo de Caixa (saídas)
     ↓
DRE (despesas)
```

---

## 8. Regras de Negócio

### 8.1 Integridade e Permissões

1. **Não pode excluir movimentação já conciliada:** Lançamentos que já tiveram pagamento/recebimento registrado só podem ser excluídos por gestores
2. **Permissões de exclusão:** Apenas gestor e admin podem excluir lançamentos
3. **Permissões de edição:** Usuários podem editar apenas seus próprios lançamentos (exceto gestores)

### 8.2 Recorrência e Automação

4. **Contas recorrentes:** Ao marcar como recorrente, o sistema gera automaticamente o próximo lançamento na frequência definida
5. **Geração automática:** Contas recorrentes são geradas automaticamente no início do período (ex: dia 1º para mensais)

### 8.3 Conciliação e Status

6. **Marcar como pago/recebido:** Ao registrar pagamento/recebimento, o status muda mas o registro permanece no histórico
7. **Baixa parcial:** Permitido registrar pagamento/recebimento de valor menor que o original, mantendo saldo em aberto
8. **Juros e multas:** Calculados automaticamente quando pagamento ocorre após vencimento (configurável)

### 8.4 Categorias

9. **Categorias pré-cadastradas:** O sistema vem com categorias comuns (Aluguel, Internet, Vendas, etc.) mas permite personalização
10. **Categorização obrigatória:** Todo lançamento deve ter uma categoria para permitir análises no DRE

### 8.5 Alertas MEL

11. **Contas vencendo:** MEL avisa 3 dias antes do vencimento de contas a pagar
12. **Contas vencidas:** Alerta imediato quando existem contas a pagar vencidas
13. **Inadimplência:** Alerta quando clientes estão com pagamento atrasado
14. **Saldo negativo:** Aviso quando projeção indica saldo negativo no mês

### 8.6 Validações

15. **CPF/CNPJ único:** Fornecedores e clientes devem ter documento único
16. **Valor positivo:** Todos os valores devem ser maiores que zero
17. **Data válida:** Datas de vencimento devem ser válidas
18. **Vinculação de venda:** Contas a receber podem ser vinculadas a vendas específicas do PDV/Loja

---

## 9. Checklist de Qualidade

Antes de enviar esta documentação ao Figma Make, verifique:

### ✅ O QUE FOI INCLUÍDO

- [x] User stories no formato "Como [perfil], quero [ação] para que [benefício]"
- [x] Metadados de cada tela (nome, rota, objetivo, permissões, prioridade)
- [x] Contexto do usuário UNIQ (empreendedor na correria, não técnico)
- [x] Elementos obrigatórios descritos funcionalmente
- [x] Campos de formulário completos (nome, tipo, obrigatório, validações)
- [x] Ações possíveis (primárias, secundárias, destruição)
- [x] Todos os estados de UI descritos (empty, loading, error, success)
- [x] Regras de negócio explícitas
- [x] Permissões de acesso claras
- [x] Integrações com outros módulos documentadas
- [x] Limite de 4 telas principais respeitado

### ❌ O QUE FOI EVITADO

- [x] Nenhum wireframe ou desenho ASCII
- [x] Nenhuma especificação de posicionamento ("botão à direita", "card no topo")
- [x] Nenhuma cor hexadecimal específica
- [x] Nenhum tamanho em pixels
- [x] Nenhuma fonte específica mencionada
- [x] Nenhuma descrição de layout ("duas colunas", "sidebar")
- [x] Nenhuma animação detalhada

---

## 10. Próximos Passos

Esta documentação está pronta para ser transformada em prompt para o Figma Make.

**Telas documentadas:**
1. ✅ Fluxo de Caixa (`/financeiro/fluxo-de-caixa`)
2. ✅ Contas a Pagar (`/financeiro/contas-pagar`)
3. ✅ Contas a Receber (`/financeiro/contas-receber`)
4. ✅ DRE Simples (`/financeiro/dre`)

**Arquivos de referência:**
- Matriz de Documentação: `docs/figma-make/MATRIZ_DOCUMENTACAO_UI.md`
- Contexto UNIQ: `docs/figma-make/CONTEXTO_UNIQ_FIGMA.md`
- UI Map legado: `docs/ui-maps/modulo-financeiro-ui-map.md`

---

**Status:** ✅ Documentação completa e pronta para Figma Make
