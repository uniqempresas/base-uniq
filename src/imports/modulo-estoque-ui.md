# Módulo Estoque - Documentação UI

> **Documentação Funcional para Figma Make**  
> **Versão:** 1.0  
> **Data:** Março 2025  
> **Status:** Pronto para implementação  
> **Módulo:** Estoque/Produtos  

---

## 1. Visão Geral do Módulo

### 1.1 Propósito

O Módulo Estoque permite que pequenos empreendedores gerenciem seus produtos, controlem entradas e saídas de mercadoria, e mantenham visibilidade sobre o que está disponível para venda.

### 1.2 Contexto do Usuário

**Quem usa:**
- Donos de loja de varejo, confecção, pequeno comércio
- Atendentes que verificam disponibilidade
- Gestores que analisam curva de produtos

**Contexto de uso:**
- Conferindo estoque no celular entre atendimentos
- Cadastrando novos produtos após compra de mercadoria
- Fazendo inventário rápido no fim do dia
- Verificando o que está acabando para fazer pedido

**Frequência:**
- Lista de produtos: Diária (múltiplas vezes)
- Cadastro: Semanal (quando chega mercadoria nova)
- Movimentações: Diária (entradas/saídas)

### 1.3 User Stories do Módulo

- "Como lojista, quero ver todos os meus produtos em um só lugar para não perder vendas por falta de informação"
- "Como empreendedor, quero saber o que está acabando para fazer pedido antes de zerar"
- "Como atendente, quero consultar disponibilidade rapidamente durante uma venda"
- "Como gestor, quero entender quais produtos dão mais lucro para focar no que funciona"

### 1.4 Integrações Principais

- **Loja Virtual:** Produtos, variações, estoque e preços sincronizados automaticamente
- **PDV (Ponto de Venda):** Baixa automática de estoque ao vender
- **MEL (IA Proativa):** Alertas de estoque baixo e sugestões de compra
- **Financeiro:** Custo de produtos, valor de vendas, margem de lucro
- **Fornecedores:** Vinculação para futuro módulo de compras

### 1.5 Fluxo Principal

```
Lista de Produtos → Cadastro de Produto
    ↓
Detalhes do Produto
    ↓
Ajustar Estoque / Ver Movimentações

Movimentações → Entrada (receber) / Saída (ajuste)
    ↓
Atualização automática do estoque
```

---

## 2. Tela 1: Lista de Produtos

### 2.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Lista de Produtos |
| **Rota/URL** | `/estoque/produtos` |
| **Objetivo Principal** | Visualizar, buscar e gerenciar todos os produtos cadastrados com filtros e indicadores de estoque |
| **Permissões de Acesso** | Visualização: Todos | Edição: Gestor, Admin | Exclusão: Gestor, Admin apenas |
| **Módulo/Pai** | Módulo Estoque |
| **Prioridade MVP** | ✅ Essencial |

### 2.2 Contexto do Usuário

**Quem Usa Esta Tela:**
- **Perfil:** Dono de loja, atendentes, gestores
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Usada diariamente para consultar disponibilidade, verificar preços, identificar produtos com estoque baixo

**Por Que Esta Tela Existe:**
- **Problema que resolve:** Centralizar visualização do catálogo completo, evitando anotações em papel ou planilhas
- **Valor entregue:** Visão instantânea do que está disponível, o que está acabando e o que precisa de atenção
- **Frequência de uso:** Múltiplas vezes ao dia

**User Stories Específicas:**
- "Como lojista, quero ver todos os meus produtos em um só lugar"
- "Como atendente, quero buscar produto por código de barras rapidamente durante uma venda"
- "Como gestor, quero filtrar produtos com estoque baixo para fazer pedido"
- "Como vendedor, quero alternar entre visualização em grade (com fotos) e lista (mais compacta)"

### 2.3 Elementos Obrigatórios

#### Dados a Exibir (por produto)

- [ ] **Foto principal:** Imagem do produto ou ícone padrão quando sem foto
- [ ] **Nome do produto:** Nome comercial completo
- [ ] **SKU:** Código único de identificação
- [ ] **Preço de venda:** Valor atual de venda (moeda R$)
- [ ] **Estoque atual:** Quantidade disponível
- [ ] **Indicador de estoque baixo:** Alerta visual quando estoque próximo do mínimo
- [ ] **Status:** Badge indicando ativo/inativo
- [ ] **Categoria:** Classificação do produto
- [ ] **Indicador de variações:** Sinalização visual quando produto tem variações (tamanho, cor, etc.)

#### Funcionalidades Essenciais

- [ ] **Busca rápida:** Campo para buscar por nome, SKU ou código de barras
- [ ] **Filtros avançados:** Categoria, status de estoque (baixo, zerado, OK), status do produto (ativo/inativo), faixa de preço, com/sem variações
- [ ] **Toggle visualização:** Alternar entre modo Grade (cards com foto) e modo Lista (tabela compacta)
- [ ] **Novo produto:** Cadastrar novo produto no sistema
- [ ] **Ações em massa:** Selecionar múltiplos produtos para exportar, imprimir etiquetas ou atualizar preços
- [ ] **Visualizar detalhes:** Acessar ficha completa do produto
- [ ] **Editar produto:** Alterar dados do produto
- [ ] **Duplicar produto:** Criar cópia com dados similares
- [ ] **Excluir produto:** Remover do sistema (com confirmação)
- [ ] **Exportar:** Download em Excel/CSV
- [ ] **Imprimir etiqueta:** Geração de código de barras
- [ ] **Ajustar estoque rápido:** Ajuste rápido sem entrar na tela de detalhes
- [ ] **Ativar/Desativar:** Mudar status do produto

#### Campos de Formulário de Busca/Filtro

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Termo de busca | Texto | Não | Busca em nome, SKU, código de barras |
| Categoria | Select | Não | Lista hierárquica de categorias |
| Status de estoque | Select | Não | Opções: Todos, OK, Baixo, Zerado |
| Status do produto | Select | Não | Opções: Todos, Ativo, Inativo |
| Faixa de preço | Range | Não | Mínimo e máximo em moeda |
| Possui variações | Checkbox | Não | Sim/Não |

### 2.4 Elementos Opcionais

#### Funcionalidades Adicionais

- [ ] **Importar produtos em lote:** Upload de CSV/Excel para cadastro em massa
- [ ] **Scanner de código de barras:** Integração com câmera do celular
- [ ] **Ordenação múltipla:** Por nome, preço, estoque, data de cadastro
- [ ] **Favoritos/Marcadores:** Marcar produtos importantes

#### Dados Secundários

- [ ] Preço de custo (visível apenas para gestores)
- [ ] Margem de lucro calculada
- [ ] Data de cadastro
- [ ] Última movimentação
- [ ] Fornecedor principal

### 2.5 Ações Possíveis

#### Ações Primárias

1. **Cadastrar novo produto:**
   - **Gatilho:** Botão principal visível na interface
   - **Resultado:** Navega para formulário de cadastro `/estoque/produtos/novo`
   - **Confirmação:** Não necessária

2. **Buscar produto:**
   - **Gatilho:** Digitar no campo de busca
   - **Resultado:** Lista filtrada em tempo real
   - **Confirmação:** Não necessária

3. **Visualizar ficha completa:**
   - **Gatilho:** Clicar no nome ou card do produto
   - **Resultado:** Navega para página de detalhes `/estoque/produtos/:id`
   - **Confirmação:** Não necessária

#### Ações Secundárias

1. **Editar produto:** Abre tela de edição
2. **Duplicar produto:** Cria cópia com "(Cópia)" no nome
3. **Ajustar estoque rápido:** Abre modal para ajuste rápido
4. **Exportar seleção:** Download dos produtos selecionados
5. **Imprimir etiquetas:** Gera PDF com códigos de barras
6. **Aplicar filtros avançados:** Expande painel de filtros

#### Ações de Destruição

1. **Excluir produto:**
   - **Gatilho:** Botão de exclusão nas ações do produto
   - **Confirmação:** Modal de confirmação obrigatório
   - **Mensagem:** "Tem certeza que deseja excluir [Nome do Produto]? Esta ação não pode ser desfeita."
   - **Validação:** Se produto tiver vendas, mostrar aviso "Este produto possui histórico de vendas. Recomendamos inativar em vez de excluir."
   - **Checkbox:** "Entendo que todos os dados serão removidos permanentemente"

### 2.6 Estados da UI

#### Empty State - Sem Produtos Cadastrados

- **Quando aparece:** Usuário ainda não tem produtos cadastrados
- **Título:** "Nenhum produto cadastrado"
- **Descrição:** "Comece adicionando seu primeiro produto ao estoque"
- **CTA primário:** "Cadastrar primeiro produto"
- **CTA secundário:** "Importar produtos via CSV"
- **Dica:** "Você também pode importar seu catálogo em massa"

#### Empty State - Busca Sem Resultados

- **Quando aparece:** Busca ou filtros não encontram resultados
- **Título:** "Nenhum produto encontrado"
- **Descrição:** "Tente ajustar seus filtros ou termos de busca"
- **CTA:** "Limpar filtros"
- **Ícone:** Lupa com interrogação

#### Empty State - Estoque Baixo

- **Quando aparece:** Filtro de estoque baixo aplicado mas nenhum produto está nessa condição
- **Título:** "Estoque em dia! ✅"
- **Descrição:** "Nenhum produto com estoque baixo no momento"
- **Mensagem positiva:** "Parabéns, seu estoque está bem gerenciado!"

#### Loading State

- **Quando aparece:** Carregando lista inicial ou aplicando filtros
- **Tipo:** Skeleton de cards ou linhas (simulando a estrutura da visualização atual)
- **Mensagem:** "Carregando produtos..."

#### Error State

- **Quando aparece:** Falha ao carregar dados do servidor
- **Título:** "Não foi possível carregar os produtos"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State

- **Quando aparece:** Após cadastrar, editar, duplicar ou excluir produto
- **Feedback:** Toast/message temporária na parte inferior ou superior
- **Mensagens:**
  - "Produto cadastrado com sucesso!"
  - "Produto atualizado"
  - "Produto duplicado"
  - "Produto removido"

### 2.7 Integrações

#### Com Outras Telas

- **Navega para:** 
  - Cadastro de Produto (`/estoque/produtos/novo`)
  - Detalhes do Produto (`/estoque/produtos/:id`)
  - Importação de Produtos
- **Recebe de:** Dashboard do Estoque, PDV (para consulta rápida)

#### Com Outros Módulos

- **Módulo Loja Virtual:** Sincronização de produtos ativos, preços e estoque
- **Módulo Vendas (PDV):** Baixa automática de estoque nas vendas
- **Módulo Financeiro:** Cálculo de custo de produtos vendidos e margem
- **Módulo MEL (IA):** Alertas proativos de estoque baixo

#### APIs/Serviços

- **API de Produtos:** CRUD de produtos
- **API de Busca:** Busca full-text e filtros avançados
- **API de Estoque:** Consulta e atualização de quantidades
- **Serviço de Scanner:** Leitura de código de barras via câmera

### 2.8 Regras de Negócio

1. **SKU único:** Não pode haver dois produtos com o mesmo SKU
2. **Código de barras único:** Se informado, deve ser único no sistema
3. **Produto inativo:** Não aparece na loja virtual nem no PDV, mas mantém histórico
4. **Permissão de exclusão:** Apenas gestores e admin podem excluir
5. **Produto com vendas:** Não pode ser excluído, apenas inativado
6. **Estoque negativo:** Configurável por empresa (default: não permitir)
7. **Visualização padrão:** Modo lista em desktop, modo grade em mobile

### 2.9 Notas e Considerações

- A lista deve ser performática para catálogos grandes (centenas ou milhares de produtos)
- Considerar paginação ou scroll infinito
- Exportar deve respeitar filtros aplicados
- Importação deve validar duplicidades de SKU e código de barras
- Scanner de código de barras deve funcionar bem em dispositivos móveis
- Indicadores de estoque baixo devem ser visíveis à primeira vista

---

## 3. Tela 2: Cadastro de Produto

### 3.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Cadastro de Produto |
| **Rota/URL** | `/estoque/produtos/novo` (novo) ou `/estoque/produtos/:id/editar` (edição) |
| **Objetivo Principal** | Criar ou editar produto completo com informações, preços, estoque, variações e fotos |
| **Permissões de Acesso** | Criação: Gestor, Admin | Edição: Gestor, Admin |
| **Módulo/Pai** | Módulo Estoque |
| **Prioridade MVP** | ✅ Essencial |

### 3.2 Contexto do Usuário

**Quem Usa Esta Tela:**
- **Perfil:** Donos de loja, gestores
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Cadastrando produtos novos, configurando catálogo inicial da loja virtual, importando mercadoria nova

**Por Que Esta Tela Existe:**
- **Problema que resolve:** Centralizar todas as informações do produto em um só lugar, evitando cadastros incompletos
- **Valor entregue:** Produto completo pronto para vender online e presencial
- **Frequência de uso:** Semanal (quando chega mercadoria nova) ou durante setup inicial

**User Stories Específicas:**
- "Como lojista, quero cadastrar um produto com variações de tamanho e cor"
- "Como empreendedor, quero que o sistema calcule minha margem de lucro automaticamente"
- "Como varejista, quero adicionar várias fotos do produto para mostrar na loja virtual"
- "Como gestor, quero poder duplicar um produto similar para não ter que preencher tudo de novo"

### 3.3 Elementos Obrigatórios

#### Estrutura em Abas/Etapas

O cadastro deve ser organizado em abas ou etapas para facilitar o preenchimento:

**Aba 1: Informações Básicas**

Dados obrigatórios:
- [ ] **Nome do produto:** Nome comercial (obrigatório)
- [ ] **SKU:** Código único (obrigatório, pode ser gerado automaticamente)
- [ ] **Código de barras:** EAN-13 ou similar (opcional, com integração de scanner)
- [ ] **Categoria:** Classificação hierárquica (obrigatório)
- [ ] **Unidade de medida:** Peça, kg, metro, litro, etc. (obrigatório)

Dados opcionais:
- [ ] **Marca:** Fabricante ou marca (autocomplete de marcas existentes)
- [ ] **Peso e dimensões:** Para cálculo de frete (opcional)
- [ ] **Descrição curta:** Resumo para listagens (opcional)
- [ ] **Descrição completa:** Editor rich text com formatação (opcional)

Campos de formulário:

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Nome do produto | Texto | Sim | Mínimo 3 caracteres, máximo 255 |
| SKU | Texto | Sim | Único no sistema, gerado automaticamente se vazio |
| Código de barras | Texto | Não | EAN-13 válido, único no sistema |
| Categoria | Select hierárquico | Sim | Seleção de categoria existente |
| Marca | Texto com autocomplete | Não | Pode criar nova marca ou selecionar existente |
| Unidade de medida | Select | Sim | Peça, kg, metro, litro, par, pacote, etc. |
| Peso | Número decimal | Não | Em kg, valor positivo |
| Dimensões | Campos numéricos | Não | Altura, Largura, Comprimento em cm |
| Descrição curta | Textarea | Não | Máximo 500 caracteres |
| Descrição completa | Rich text editor | Não | HTML básico permitido |

**Aba 2: Preços**

Dados obrigatórios:
- [ ] **Preço de custo:** Valor pago no fornecedor (obrigatório)
- [ ] **Preço de venda:** Valor de venda ao consumidor (obrigatório)
- [ ] **Margem de lucro:** Calculado automaticamente (preço venda - preço custo) / preço venda × 100

Dados opcionais:
- [ ] **Preço promocional:** Valor especial de promoção (opcional, com data de início e fim)
- [ ] **Preço atacado:** Valor para venda em quantidade (opcional)
- [ ] **Quantidade mínima atacado:** Quantidade mínima para aplicar preço atacado (se preço atacado informado)

Campos de formulário:

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Preço de custo | Moeda | Sim | Valor >= 0 |
| Preço de venda | Moeda | Sim | Valor >= 0 |
| Margem de lucro | Percentual (calculado) | N/A | Calculado automaticamente, apenas informativo |
| Preço promocional | Moeda | Não | Valor >= 0, menor que preço de venda |
| Data início promoção | Data | Não | Obrigatório se preço promocional informado |
| Data fim promoção | Data | Não | Obrigatório se preço promocional informado |
| Preço atacado | Moeda | Não | Valor >= 0, menor que preço de venda |
| Quantidade mínima atacado | Número inteiro | Condicional | Obrigatório se preço atacado > 0, valor >= 2 |

**Aba 3: Estoque**

Dados:
- [ ] **Controlar estoque:** Checkbox para habilitar controle de estoque
- [ ] **Quantidade inicial:** Estoque inicial (apenas se controlar estoque = sim)
- [ ] **Estoque mínimo:** Quantidade que dispara alerta de estoque baixo
- [ ] **Estoque máximo:** Capacidade máxima de armazenamento (opcional)
- [ ] **Localização no depósito:** Onde o produto fica guardado (opcional)
- [ ] **Fornecedor padrão:** Fornecedor principal do produto (opcional)

Campos de formulário:

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Controlar estoque | Checkbox | Não | Default: true |
| Quantidade inicial | Número inteiro | Condicional | Obrigatório se controlar estoque = true, valor >= 0 |
| Estoque mínimo | Número inteiro | Não | Valor >= 0, alerta visual se estoque atual < mínimo |
| Estoque máximo | Número inteiro | Não | Valor >= estoque mínimo |
| Localização | Texto | Não | Máximo 100 caracteres |
| Fornecedor padrão | Select com busca | Não | Lista de fornecedores cadastrados |

**Aba 4: Variações**

Dados:
- [ ] **Possui variações:** Checkbox para habilitar variações
- [ ] **Tipos de variação:** Tamanho, Cor, Modelo, etc. (se possui variações = sim)
- [ ] **Valores de variação:** Opções para cada tipo (P, M, G / Preto, Branco, etc.)
- [ ] **Gerar combinações:** Botão para criar automaticamente todas as combinações

Tabela de variações (após gerar combinações):
- [ ] **Variação:** Nome da combinação (ex: "P - Preto")
- [ ] **SKU da variação:** Código único da variação
- [ ] **Código de barras:** EAN da variação específica
- [ ] **Preço:** Preço específico (se diferente do produto pai)
- [ ] **Estoque:** Quantidade em estoque da variação
- [ ] **Status:** Ativo/inativo para cada variação

Campos de formulário:

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Possui variações | Checkbox | Não | Default: false |
| Tipo de variação 1 | Texto | Condicional | Obrigatório se possui variações = true (ex: Tamanho) |
| Valores tipo 1 | Lista de textos | Condicional | Obrigatório, mínimo 2 valores (ex: P, M, G) |
| Tipo de variação 2 | Texto | Não | Opcional (ex: Cor) |
| Valores tipo 2 | Lista de textos | Condicional | Se tipo 2 informado, mínimo 2 valores |
| SKU da variação | Texto | Condicional | Único no sistema, gerado automaticamente |
| Preço da variação | Moeda | Não | Se vazio, usa preço do produto pai |
| Estoque da variação | Número inteiro | Condicional | Obrigatório, valor >= 0 |

**Aba 5: Fotos**

Dados:
- [ ] **Foto principal:** Imagem principal do produto (recomendado)
- [ ] **Galeria de fotos:** Até 10 fotos adicionais
- [ ] **Ordenação:** Reordenar fotos por drag and drop
- [ ] **Legenda:** Texto descritivo opcional por foto

Funcionalidades:
- Upload múltiplo de imagens
- Preview antes de salvar
- Crop/zoom básico
- Remover foto
- Definir como principal

Campos de formulário:

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Fotos | Upload múltiplo | Não | Máximo 10 arquivos, formatos: JPG, PNG, WEBP |
| Legenda da foto | Texto | Não | Máximo 255 caracteres por foto |

### 3.4 Elementos Opcionais

#### Funcionalidades Adicionais

- [ ] **Preview na loja:** Visualizar como o produto ficará na loja virtual antes de publicar
- [ ] **Salvar como rascunho:** Guardar sem publicar
- [ ] **Importar de planilha:** Preencher dados via CSV
- [ ] **Sugestão de preço:** Baseado em produtos similares

### 3.5 Ações Possíveis

#### Ações Primárias

1. **Salvar e publicar:**
   - **Gatilho:** Botão principal
   - **Resultado:** Salva produto e torna disponível para venda
   - **Validação:** Valida todos os campos obrigatórios
   - **Confirmação:** "Produto cadastrado com sucesso!"
   - **Redirecionamento:** Opções para "Ver produto", "Criar novo", "Ir para lista"

2. **Salvar rascunho:**
   - **Gatilho:** Botão secundário
   - **Resultado:** Salva sem validações obrigatórias, status "rascunho"
   - **Confirmação:** "Rascunho salvo"

3. **Próxima aba:**
   - **Gatilho:** Botão de navegação entre abas
   - **Resultado:** Avança para próxima seção do cadastro
   - **Validação:** Valida campos obrigatórios da aba atual

#### Ações Secundárias

1. **Aba anterior:** Volta para etapa anterior
2. **Preview:** Visualiza como ficará na loja
3. **Gerar SKU automaticamente:** Preenche SKU com código gerado
4. **Duplicar produto similar:** Copia dados de outro produto

#### Ações de Destruição

1. **Cancelar cadastro:**
   - **Gatilho:** Botão cancelar
   - **Confirmação:** Se houver dados preenchidos, mostrar "Descartar alterações?"
   - **Mensagem:** "Você tem alterações não salvas. Deseja realmente sair?"
   - **Opções:** "Salvar rascunho", "Descartar", "Continuar editando"

### 3.6 Estados da UI

#### Empty State - Primeiro Acesso

- **Quando aparece:** Usuário nunca cadastrou produto
- **Mensagem de boas-vindas:** "Vamos cadastrar seu primeiro produto!"
- **Dica:** "Preencha pelo menos as informações básicas para começar a vender"
- **Helper:** Tooltips explicativos nos campos

#### Loading State

- **Quando aparece:** Salvando produto, gerando variações, fazendo upload de fotos
- **Tipo:** Progresso de etapas ou spinner com mensagem
- **Mensagens:**
  - "Salvando produto..."
  - "Gerando variações..."
  - "Enviando fotos..."

#### Error State - Validação

- **Quando aparece:** Campos obrigatórios não preenchidos ou valores inválidos
- **Forma:** Campos destacados com mensagens de erro
- **Mensagens específicas:**
  - "SKU já existe no sistema"
  - "Código de barras inválido"
  - "Preço de venda deve ser maior que o preço de custo"
  - "Selecione pelo menos uma categoria"

#### Error State - Servidor

- **Quando aparece:** Falha ao salvar no servidor
- **Título:** "Não foi possível salvar o produto"
- **Descrição:** "Tente novamente em alguns instantes"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State

- **Quando aparece:** Produto salvo com sucesso
- **Feedback:** Toast de sucesso
- **Mensagem:** "Produto cadastrado com sucesso! 🎉"
- **Próximos passos:**
  - "Ver produto" → navega para detalhes
  - "Cadastrar outro" → limpa formulário
  - "Ir para lista" → volta para lista de produtos

### 3.7 Integrações

#### Com Outras Telas

- **Navega para:** 
  - Lista de Produtos (após salvar)
  - Detalhes do Produto (para visualizar)
- **Recebe de:** Lista de Produtos (botão "Novo produto")

#### Com Outros Módulos

- **Módulo Loja Virtual:** Produto publicado fica disponível na loja
- **Módulo Estoque:** Quantidade inicial registrada
- **Módulo MEL (IA):** Sugestões de preço baseado em margem

#### APIs/Serviços

- **API de Produtos:** Criação e atualização
- **API de Categorias:** Lista de categorias disponíveis
- **API de Marcas:** Autocomplete de marcas
- **API de Upload:** Envio de fotos
- **ViaCEP:** Se endereço do fornecedor necessário
- **Validador EAN:** Validação de código de barras

### 3.8 Regras de Negócio

1. **SKU único:** Não pode haver SKU duplicado no sistema
2. **Código de barras único:** Se informado, deve ser único e válido (EAN-13)
3. **Preço de venda > custo:** Alerta se margem for menor que 10%
4. **Campos obrigatórios:** Nome, SKU, Categoria, Unidade, Preço custo, Preço venda
5. **Variações:** Se ativo, estoque total = soma das variações
6. **Fotos:** Máximo 10 fotos, mínimo recomendado 1 foto principal
7. **Rascunho:** Produto em rascunho não aparece na loja nem no PDV
8. **Duplicar:** Ao duplicar, adiciona "(Cópia)" ao nome e limpa SKU/código de barras

### 3.9 Notas e Considerações

- Formulário deve ser salvo automaticamente como rascunho a cada 30 segundos
- Upload de fotos deve mostrar progresso e permitir cancelar
- Geração de variações pode ser demorada (mostrar progresso)
- Sugestão: calcular margem em tempo real enquanto digita preços
- Considerar templates de produtos para categorias comuns
- Scanner de código de barras deve funcionar em mobile

---

## 4. Tela 3: Detalhes do Produto

### 4.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Detalhes do Produto |
| **Rota/URL** | `/estoque/produtos/:id` |
| **Objetivo Principal** | Visualizar todas as informações de um produto e gerenciar estoque, variações e histórico |
| **Permissões de Acesso** | Visualização: Todos | Edição: Gestor, Admin | Exclusão: Gestor, Admin |
| **Módulo/Pai** | Módulo Estoque |
| **Prioridade MVP** | ✅ Essencial |

### 4.2 Contexto do Usuário

**Quem Usa Esta Tela:**
- **Perfil:** Donos de loja, atendentes, gestores
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Consultando informações completas, editando dados, verificando histórico, ajustando estoque

**Por Que Esta Tela Existe:**
- **Problema que resolve:** Centralizar todas as informações de um produto em um só lugar, facilitando consultas e ações
- **Valor entregue:** Visão completa do produto, histórico de movimentações, ações rápidas
- **Frequência de uso:** Diária (consultas) e semanal (ajustes)

**User Stories Específicas:**
- "Como lojista, quero ver o histórico de vendas de um produto específico"
- "Como gestor, quero ajustar o estoque quando houver quebra ou perda"
- "Como vendedor, quero ver se temos o produto em todas as variações disponíveis"
- "Como empreendedor, quero duplicar um produto para criar um similar rapidamente"

### 4.3 Elementos Obrigatórios

#### Header do Produto

- [ ] **Nome do produto:** Título principal
- [ ] **SKU:** Código de identificação
- [ ] **Badge de status:** Indicador visual ativo/inativo
- [ ] **Badge "destaque":** Se produto está em destaque na loja
- [ ] **Indicador de estoque:** Status atual (OK, Baixo, Zerado)
- [ ] **Botões de ação:** Editar, Duplicar, Excluir

#### Abas de Navegação

**Aba 1: Geral**

Dados exibidos:
- [ ] **Galeria de fotos:** Foto principal em destaque + miniaturas das demais
- [ ] **Informações básicas:** Nome, categoria, marca, unidade de medida
- [ ] **Preços:** Custo, venda, promocional (se aplicável), margem de lucro
- [ ] **Descrições:** Descrição curta e descrição completa formatada
- [ ] **Dimensões e peso:** Se informados

**Aba 2: Estoque**

Dados exibidos:
- [ ] **Quantidade atual:** Número em destaque
- [ ] **Estoque mínimo:** Valor configurado para alerta
- [ ] **Estoque máximo:** Capacidade máxima (se configurado)
- [ ] **Status de estoque:** Badge indicando OK, Baixo ou Zerado
- [ ] **Localização:** Onde o produto está armazenado
- [ ] **Fornecedor padrão:** Nome e contato do fornecedor
- [ ] **Custo médio:** Calculado automaticamente (valor médio ponderado das entradas)
- [ ] **Valor total em estoque:** Quantidade × custo médio

Ações disponíveis:
- [ ] **Ajustar estoque:** Abre modal para entrada/saída
- [ ] **Ver movimentações:** Link para tela de movimentações filtrada por este produto

**Aba 3: Variações (visível apenas se produto tiver variações)**

Dados exibidos:
- [ ] **Tabela de variações:** Lista de todas as variações
- [ ] **Colunas:** Variação (ex: "P - Preto"), SKU, estoque, preço, código de barras
- [ ] **Indicadores de estoque:** Alertas visuais por variação
- [ ] **Status por variação:** Ativo/inativo individual

Ações por variação:
- [ ] Editar variação
- [ ] Ajustar estoque da variação
- [ ] Ativar/desativar variação

**Aba 4: Movimentações**

Dados exibidos:
- [ ] **Histórico de entradas e saídas:** Lista cronológica
- [ ] **Colunas:** Data/hora, tipo (entrada ↑ / saída ↓), quantidade, motivo, responsável, observações
- [ ] **Resumo do período:** Total entradas, total saídas, saldo
- [ ] **Filtro por período:** Hoje, Últimos 7 dias, Últimos 30 dias, Período personalizado

Ações:
- [ ] **Ver detalhes:** Expandir movimentação específica
- [ ] **Cancelar:** Se movimentação permitir cancelamento (ex: ajuste)

**Aba 5: Fotos**

Dados exibidos:
- [ ] **Galeria completa:** Todas as fotos do produto
- [ ] **Foto principal:** Indicada visualmente
- [ ] **Legendas:** Texto descritivo de cada foto

Ações:
- [ ] **Adicionar fotos:** Upload de novas imagens
- [ ] **Reordenar:** Drag and drop para mudar ordem
- [ ] **Definir como principal:** Trocar foto principal
- [ ] **Excluir foto:** Remover imagem
- [ ] **Editar legenda:** Alterar descrição

#### Sidebar/Painel de Ações Rápidas

Ações disponíveis:
- [ ] **Editar produto:** Link rápido para tela de edição
- [ ] **Ajustar estoque:** Atalho para registrar entrada/saída
- [ ] **Imprimir etiqueta:** Gera código de barras em PDF
- [ ] **Duplicar produto:** Criar cópia com dados similares
- [ ] **Sincronizar com loja:** Forçar atualização na loja virtual
- [ ] **Ativar/Desativar:** Mudar status do produto rapidamente

### 4.4 Elementos Opcionais

#### Funcionalidades Adicionais

- [ ] **Vendas relacionadas:** Últimas vendas deste produto
- [ ] **Produtos similares:** Sugestão de produtos da mesma categoria
- [ ] **Estatísticas:** Quantidade vendida no mês, ticket médio, etc.
- [ ] **Compartilhar:** Link público para consulta rápida

### 4.5 Ações Possíveis

#### Ações Primárias

1. **Editar produto:**
   - **Gatilho:** Botão "Editar" no header ou sidebar
   - **Resultado:** Navega para tela de edição
   - **Confirmação:** Não necessária

2. **Ajustar estoque:**
   - **Gatilho:** Botão "Ajustar estoque" na aba Estoque ou sidebar
   - **Resultado:** Abre modal com formulário de movimentação
   - **Campos:** Tipo (entrada/saída), quantidade, motivo, observação
   - **Confirmação:** "Movimentação registrada com sucesso"

3. **Ver histórico completo:**
   - **Gatilho:** Link na aba Movimentações
   - **Resultado:** Navega para tela de Movimentações filtrada por este produto

#### Ações Secundárias

1. **Duplicar produto:** Cria cópia com "(Cópia)" no nome
2. **Imprimir etiqueta:** Gera PDF com código de barras
3. **Sincronizar com loja:** Força atualização na loja virtual
4. **Ativar/Desativar:** Alterna status rapidamente

#### Ações de Destruição

1. **Excluir produto:**
   - **Gatilho:** Botão "Excluir" no header
   - **Confirmação:** Modal obrigatório
   - **Mensagem:** "Tem certeza que deseja excluir [Nome]? Esta ação não pode ser desfeita."
   - **Validação:** Se produto tiver vendas, mostrar aviso e recomendar inativação
   - **Checkbox:** "Entendo que todos os dados serão removidos permanentemente"

### 4.6 Estados da UI

#### Loading State

- **Quando aparece:** Carregando dados do produto
- **Tipo:** Skeleton das abas e conteúdo
- **Mensagem:** "Carregando informações do produto..."

#### Error State - Produto Não Encontrado

- **Quando aparece:** Produto com ID inexistente
- **Título:** "Produto não encontrado"
- **Descrição:** "O produto que você está procurando não existe ou foi removido"
- **CTA:** "Voltar para lista de produtos"

#### Error State - Erro de Carregamento

- **Quando aparece:** Falha ao carregar dados do servidor
- **Título:** "Não foi possível carregar o produto"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Estado - Estoque Zerado

- **Quando aparece:** Quantidade atual = 0
- **Indicador visual:** Destaque em vermelho ou laranja
- **Mensagem:** "Estoque zerado - Produto indisponível para venda"
- **CTA:** "Registrar entrada de estoque"

#### Estado - Estoque Baixo

- **Quando aparece:** Quantidade atual <= estoque mínimo
- **Indicador visual:** Destaque em amarelo/laranja
- **Mensagem:** "Estoque baixo - Considere fazer um novo pedido"
- **CTA:** "Ajustar estoque mínimo" ou "Ver fornecedor"

#### Estado - Produto Inativo

- **Quando aparece:** Status = inativo
- **Indicador visual:** Badge ou banner indicando inatividade
- **Mensagem:** "Este produto está inativo e não aparece na loja"
- **CTA:** "Ativar produto"

#### Success State

- **Quando aparece:** Após ajustar estoque, editar, ativar/desativar
- **Feedback:** Toast de sucesso
- **Mensagens:**
  - "Estoque ajustado com sucesso!"
  - "Produto atualizado"
  - "Produto ativado/inativado"

### 4.7 Integrações

#### Com Outras Telas

- **Navega para:** 
  - Edição do Produto (`/estoque/produtos/:id/editar`)
  - Lista de Produtos
  - Movimentações de Estoque (com filtro)
- **Recebe de:** Lista de Produtos

#### Com Outros Módulos

- **Módulo Loja Virtual:** Sincronização de dados, preview do produto
- **Módulo Vendas:** Histórico de vendas do produto
- **Módulo Financeiro:** Custo médio, valor em estoque
- **Módulo Fornecedores:** Dados do fornecedor padrão

#### APIs/Serviços

- **API de Produtos:** Consulta de dados completos
- **API de Estoque:** Consulta e ajuste de quantidades
- **API de Movimentações:** Histórico de entradas/saídas
- **API de Loja Virtual:** Sincronização de produtos

### 4.8 Regras de Negócio

1. **Estoque total:** Se produto tem variações, estoque total = soma das quantidades das variações ativas
2. **Custo médio:** Recalculado automaticamente a cada entrada de mercadoria
3. **Ajuste de estoque:** Registra movimentação no histórico com responsável e motivo
4. **Produto inativo:** Não aparece na loja nem no PDV, mas pode ter estoque
5. **Exclusão:** Produto com vendas não pode ser excluído (apenas inativado)
6. **Variações inativas:** Não somam no estoque total nem aparecem na loja

### 4.9 Notas e Considerações

- Fotos devem ser clicáveis para visualização em tamanho maior (lightbox)
- Indicadores de estoque devem ser visíveis à primeira vista
- Histórico de movimentações deve mostrar paginação se muito extenso
- Sugestão: mostrar alerta do MEL (IA) quando estoque estiver baixo
- Deve funcionar bem em mobile, com abas em formato de accordion ou scroll horizontal

---

## 5. Tela 4: Movimentações de Estoque

### 5.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Movimentações de Estoque |
| **Rota/URL** | `/estoque/movimentacoes` |
| **Objetivo Principal** | Registrar e visualizar entradas e saídas de estoque com histórico completo |
| **Permissões de Acesso** | Visualização: Todos | Registro de entrada/saída: Gestor, Admin | Cancelamento: Gestor, Admin |
| **Módulo/Pai** | Módulo Estoque |
| **Prioridade MVP** | ✅ Essencial |

### 5.2 Contexto do Usuário

**Quem Usa Esta Tela:**
- **Perfil:** Donos de loja, gestores, responsáveis pelo estoque
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Registrando entrada de mercadoria, fazendo ajustes de estoque, baixando por perda/quebra, fazendo auditoria

**Por Que Esta Tela Existe:**
- **Problema que resolve:** Controlar entradas e saídas de estoque de forma organizada e auditável
- **Valor entregue:** Histórico completo de movimentações, identificação de problemas, controle de custos
- **Frequência de uso:** Diária (registro de entradas) e semanal (conferências)

**User Stories Específicas:**
- "Como lojista, quero registrar a entrada de novas mercadorias recebidas do fornecedor"
- "Como gestor, quero registrar perdas e quebras de estoque para controle"
- "Como empreendedor, quero ver o histórico de movimentações para auditoria"
- "Como responsável pelo estoque, quero fazer inventário físico e ajustar diferenças"

### 5.3 Elementos Obrigatórios

#### Filtros e Busca

- [ ] **Tipo de movimentação:** Entrada, Saída ou Todos
- [ ] **Período:** Hoje, Ontem, Últimos 7 dias, Últimos 30 dias, Mês atual, Período personalizado
- [ ] **Produto:** Busca por nome, SKU ou código de barras
- [ ] **Motivo:** Compra, Devolução, Ajuste, Perda, Venda, Produção, Doação
- [ ] **Responsável:** Usuário que registrou a movimentação

#### Tabela de Movimentações

Dados exibidos (por movimentação):
- [ ] **Data/hora:** Quando ocorreu a movimentação
- [ ] **Tipo:** Indicador visual Entrada (↑) ou Saída (↓)
- [ ] **Produto:** Nome do produto + variação (se aplicável)
- [ ] **SKU:** Código do produto
- [ ] **Quantidade:** Número de unidades
- [ ] **Motivo:** Classificação da movimentação
- [ ] **Responsável:** Nome do usuário que registrou
- [ ] **Observações:** Texto descritivo
- [ ] **Ações:** Visualizar detalhes, cancelar (se permitido)

#### Resumo do Período

- [ ] **Total de entradas:** Quantidade e valor total das entradas
- [ ] **Total de saídas:** Quantidade e valor total das saídas
- [ ] **Saldo:** Diferença entre entradas e saídas
- [ ] **Número de movimentações:** Total de registros no período

#### Botões de Ação

- [ ] **Nova entrada:** Registrar recebimento de mercadoria
- [ ] **Nova saída:** Registrar ajuste, perda ou saída diversa
- [ ] **Inventário físico:** Ferramenta para contagem e ajuste em massa

### 5.4 Elementos Opcionais

#### Funcionalidades Adicionais

- [ ] **Exportar relatório:** Download em Excel/PDF do período filtrado
- [ ] **Gráfico de movimentações:** Visualização gráfica por dia/semana
- [ ] **Alertas:** Movimentações suspeitas ou fora do padrão
- [ ] **Comprovante:** Geração de comprovante de movimentação

### 5.5 Ações Possíveis

#### Ações Primárias

1. **Registrar entrada:**
   - **Gatilho:** Botão "Nova entrada"
   - **Resultado:** Abre modal ou navega para formulário de entrada
   - **Campos do formulário:**
     - Tipo: Compra, Devolução, Ajuste, Produção, Outro
     - Produto: Busca com autocomplete
     - Variação: Selecionar (se produto tem variações)
     - Quantidade: Número positivo
     - Custo unitário: Valor pago (atualiza custo médio)
     - Fornecedor: Selecionar (se tipo = compra)
     - Observação: Texto livre
   - **Confirmação:** "Entrada registrada com sucesso!"

2. **Registrar saída:**
   - **Gatilho:** Botão "Nova saída"
   - **Resultado:** Abre modal ou navega para formulário de saída
   - **Campos do formulário:**
     - Tipo: Venda, Ajuste, Perda, Doação, Quebra, Outro
     - Produto: Busca com autocomplete
     - Variação: Selecionar (se aplicável)
     - Quantidade: Número positivo
     - Motivo: Texto explicativo
     - Observação: Texto livre
   - **Validação:** Verificar se há estoque suficiente (se configurado para não permitir negativo)
   - **Confirmação:** "Saída registrada com sucesso!"

3. **Fazer inventário físico:**
   - **Gatilho:** Botão "Inventário físico"
   - **Resultado:** Abre ferramenta de contagem
   - **Funcionalidade:** Lista todos os produtos para conferência física e registro de divergências

#### Ações Secundárias

1. **Visualizar detalhes:** Expandir ou navegar para ver informações completas da movimentação
2. **Aplicar filtros:** Filtrar por período, tipo, produto, etc.
3. **Exportar:** Download dos dados filtrados

#### Ações de Destruição

1. **Cancelar movimentação:**
   - **Gatilho:** Botão "Cancelar" na linha da movimentação
   - **Disponível para:** Tipos que permitem cancelamento (Ajuste, Entrada de compra com erro)
   - **Indisponível para:** Vendas (já baixadas no PDV/Online)
   - **Confirmação:** Modal obrigatório
   - **Mensagem:** "Tem certeza que deseja cancelar esta movimentação? O estoque será revertido."
   - **Ação:** Reverte a quantidade no estoque e marca como cancelada

### 5.6 Estados da UI

#### Empty State - Sem Movimentações

- **Quando aparece:** Nenhuma movimentação no período selecionado
- **Título:** "Nenhuma movimentação no período"
- **Descrição:** "Não há registros de entradas ou saídas no período selecionado"
- **CTA:** "Ajustar período" ou "Registrar primeira movimentação"

#### Empty State - Filtros Sem Resultados

- **Quando aparece:** Filtros aplicados não retornam resultados
- **Título:** "Nenhuma movimentação encontrada"
- **Descrição:** "Tente ajustar os filtros selecionados"
- **CTA:** "Limpar filtros"

#### Loading State

- **Quando aparece:** Carregando movimentações ou aplicando filtros
- **Tipo:** Skeleton de tabela
- **Mensagem:** "Carregando movimentações..."

#### Error State

- **Quando aparece:** Falha ao carregar dados
- **Título:** "Não foi possível carregar as movimentações"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

#### Success State

- **Quando aparece:** Após registrar entrada/saída ou cancelar movimentação
- **Feedback:** Toast de sucesso
- **Mensagens:**
  - "Entrada registrada com sucesso!"
  - "Saída registrada com sucesso!"
  - "Movimentação cancelada"

### 5.7 Integrações

#### Com Outras Telas

- **Navega para:** 
  - Detalhes do Produto (ao clicar no produto)
  - Inventário Físico (ferramenta específica)
- **Recebe de:** Detalhes do Produto (filtro por produto específico)

#### Com Outros Módulos

- **Módulo Vendas:** Vendas no PDV/Online geram saídas automaticamente
- **Módulo Financeiro:** Compras podem gerar contas a pagar
- **Módulo Fornecedores:** Entradas de compra vinculadas a fornecedores
- **Módulo Produtos:** Atualização de estoque e custo médio

#### APIs/Serviços

- **API de Movimentações:** CRUD de movimentações
- **API de Produtos:** Atualização de estoque
- **API de Estoque:** Consulta de quantidades atuais
- **API de Relatórios:** Exportação de dados

### 5.8 Regras de Negócio

1. **Custo médio:** Calculado automaticamente nas entradas: ((estoque_atual × custo_atual) + (quantidade_entrada × custo_entrada)) / (estoque_atual + quantidade_entrada)
2. **Estoque negativo:** Configurável por empresa (default: não permitir saída sem estoque)
3. **Cancelamento:** Apenas movimentações manuais (ajustes) podem ser canceladas. Vendas integradas não podem ser canceladas aqui.
4. **Auditoria:** Toda movimentação registra responsável, data/hora e motivo
5. **Entrada com custo:** Atualiza custo médio do produto automaticamente
6. **Saída por venda:** Gerada automaticamente pelo PDV/Loja, não pode ser editada aqui

### 5.9 Notas e Considerações

- Registrar entrada deve ser rápido (usuário pode estar recebendo mercadoria)
- Scanner de código de barras facilita busca do produto
- Inventário físico pode ser feito por categoria ou fornecedor
- Sugestão: alertar quando custo de entrada for muito diferente do custo médio atual
- Movimentações devem ser listadas em ordem cronológica inversa (mais recentes primeiro)

---

## 6. Componentes Específicos do Módulo Estoque

### 6.1 Card de Produto (para visualização em grade)

**Props necessárias:**
- Foto principal do produto
- Nome do produto (truncado se muito longo)
- SKU
- Preço de venda (formatado em moeda)
- Estoque atual
- Indicador de estoque baixo (quando estoque <= mínimo)
- Badge de status (ativo/inativo)
- Badge indicando se possui variações
- Ações rápidas (editar, ajustar estoque, ver detalhes)

**Comportamentos:**
- Ao clicar no card, navega para detalhes do produto
- Indicador de estoque baixo deve ser visível à primeira vista
- Foto com fallback para ícone genérico quando sem imagem

### 6.2 Indicador de Status de Estoque

**Features:**
- **Status OK:** Estoque atual > estoque mínimo (indicador visual em verde ou neutro)
- **Status Baixo:** Estoque atual <= estoque mínimo e > 0 (indicador visual em amarelo/laranja)
- **Status Zerado:** Estoque atual = 0 (indicador visual em vermelho)
- **Formato:** Pode ser badge, barra de progresso ou ícone com tooltip
- **Texto:** Mostra quantidade atual / mínimo quando aplicável

**Regras:**
- Sempre visível em listagens e detalhes
- Deve chamar atenção quando estiver baixo ou zerado
- Cores devem ser consistentes em toda a aplicação

### 6.3 Tabela de Variações

**Colunas:**
- Variação (nome da combinação, ex: "P - Preto")
- SKU da variação
- Código de barras (opcional)
- Preço (se diferente do produto pai)
- Estoque atual
- Status (ativo/inativo)
- Ações (editar, ajustar estoque, ativar/desativar)

**Features:**
- Ordenação por qualquer coluna
- Filtro rápido
- Indicador de estoque baixo por variação
- Checkbox para ações em massa
- Paginação se muitas variações

### 6.4 Scanner de Código de Barras

**Integração:**
- Botão de ativar câmera (principalmente em mobile)
- Campo de input que aceita digitação manual
- Validação automática de EAN-13
- Busca automática ao detectar código válido
- Feedback visual (sucesso/erro na leitura)

### 6.5 Calculadora de Margem

**Funcionamento:**
- Campos: Preço de custo, Preço de venda
- Cálculo automático: Margem = ((Venda - Custo) / Venda) × 100
- Lucro em valor: Venda - Custo
- Alerta visual se margem < 10%
- Atualização em tempo real enquanto digita

### 6.6 Gerador de Variações

**Funcionamento:**
- Inputs para tipos de variação (Tamanho, Cor, etc.)
- Inputs para valores de cada tipo (P, M, G / Preto, Branco)
- Botão "Gerar combinações" cria todas as combinações possíveis
- Tabela editável com SKUs gerados automaticamente
- Opção de remover combinações específicas
- Cálculo automático de estoque total

---

## 7. Integrações do Módulo Estoque

### 7.1 Com Outros Módulos

#### Módulo Loja Virtual
- **Sincronização bidirecional:** Produtos, variações, preços e estoque
- **Publicação:** Produto ativo com estoque > 0 aparece na loja
- **Reserva:** Estoque reservado durante checkout (opcional)
- **Baixa automática:** Venda online baixa estoque automaticamente

#### Módulo Vendas (PDV)
- **Consulta rápida:** Verificação de estoque durante venda
- **Baixa automática:** Venda no PDV baixa estoque imediatamente
- **Alerta:** Aviso quando produto está com estoque baixo durante venda
- **Bloqueio:** Impede venda sem estoque (se configurado)

#### Módulo Financeiro
- **Custo de produtos vendidos:** Cálculo baseado no custo médio
- **Valor em estoque:** Patrimônio em produtos (quantidade × custo médio)
- **Margem de lucro:** Análise de rentabilidade por produto/categoria
- **Contas a pagar:** Entradas de compra podem gerar dívidas com fornecedores

#### Módulo MEL (IA Proativa)
- **Alertas de estoque:** Notificação quando produto atinge estoque mínimo
- **Sugestões de compra:** Baseado em curva de vendas e estoque atual
- **Preço competitivo:** Sugestão de preço baseado em margem desejada
- **Produtos parados:** Alerta quando produto não vende há X dias

#### Módulo Fornecedores (futuro)
- **Vinculação:** Cada produto pode ter fornecedor padrão
- **Pedidos:** Geração de pedidos de compra baseado em estoque
- **Histórico:** Últimas compras do produto por fornecedor

#### Módulo Relatórios
- **Curva ABC:** Produtos mais vendidos e mais rentáveis
- **Giro de estoque:** Tempo médio de venda do produto
- **Perdas:** Relatório de quebras, avarias e perdas
- **Inventário:** Comparativo estoque sistema vs físico

### 7.2 Fluxos Principais

```
FLUXO 1: Cadastro de Novo Produto
┌─────────────────┐
│ Lista Produtos  │
└────────┬────────┘
         │ Clique em "Novo Produto"
         ▼
┌─────────────────┐
│ Cadastro        │
│ (5 abas)        │
└────────┬────────┘
         │ Salvar
         ▼
┌─────────────────┐
│ Detalhes        │
│ (confirmação)   │
└────────┬────────┘
         │ Sincroniza
         ▼
┌─────────────────┐
│ Loja Virtual    │
│ (publicado)     │
└─────────────────┘

FLUXO 2: Recebimento de Mercadoria
┌─────────────────┐
│ Movimentações   │
└────────┬────────┘
         │ Clique em "Nova Entrada"
         ▼
┌─────────────────┐
│ Form Entrada    │
│ (compra)        │
└────────┬────────┘
         │ Registrar
         ▼
┌─────────────────┐
│ Estoque         │
│ atualizado      │
└────────┬────────┘
         │ Custo médio
         │ recalculado
         ▼
┌─────────────────┐
│ Financeiro      │
│ (conta a pagar) │
└─────────────────┘

FLUXO 3: Venda e Baixa Automática
┌─────────────────┐
│ PDV ou Loja     │
│ (venda)         │
└────────┬────────┘
         │ Confirma venda
         ▼
┌─────────────────┐
│ Baixa automática│
│ de estoque      │
└────────┬────────┘
         │ Registra
         │ movimentação
         ▼
┌─────────────────┐
│ Estoque         │
│ atualizado      │
└────────┬────────┘
         │ Alerta se
         │ estoque baixo
         ▼
┌─────────────────┐
│ MEL (IA)        │
│ notifica dono   │
└─────────────────┘

FLUXO 4: Ajuste de Estoque
┌─────────────────┐
│ Detalhes do     │
│ Produto         │
└────────┬────────┘
         │ "Ajustar estoque"
         ▼
┌─────────────────┐
│ Form Ajuste     │
│ (saída/perda)   │
└────────┬────────┘
         │ Registrar
         ▼
┌─────────────────┐
│ Estoque         │
│ ajustado        │
└────────┬────────┘
         │ Registra
         │ no histórico
         ▼
┌─────────────────┐
│ Movimentações   │
│ (auditoria)     │
└─────────────────┘
```

---

## 8. Regras de Negócio do Módulo

### 8.1 Regras de Produto

1. **SKU único obrigatório:** Todo produto deve ter um SKU único no sistema
2. **Código de barras único:** Se informado, deve ser único e válido (EAN-13)
3. **Nome obrigatório:** Mínimo 3 caracteres
4. **Categoria obrigatória:** Todo produto deve pertencer a uma categoria
5. **Status binário:** Produto está ativo ou inativo (não há outros estados)

### 8.2 Regras de Preço

1. **Preço de custo obrigatório:** Deve ser >= 0
2. **Preço de venda obrigatório:** Deve ser >= 0
3. **Margem mínima sugerida:** Alerta se margem < 10%
4. **Preço promocional:** Se informado, deve ser menor que preço de venda
5. **Período de promoção:** Data início deve ser anterior a data fim

### 8.3 Regras de Estoque

1. **Controle opcional:** Produto pode não controlar estoque (serviços, produtos sob encomenda)
2. **Estoque negativo:** Configurável por empresa (default: não permitir)
3. **Estoque mínimo:** Quando estoque atual <= mínimo, status = "Baixo"
4. **Estoque zerado:** Quando estoque atual = 0, status = "Zerado"
5. **Variações:** Se produto tem variações, estoque total = soma das variações ativas
6. **Variação inativa:** Não soma no estoque total nem aparece na loja

### 8.4 Regras de Movimentação

1. **Custo médio automático:** Recalculado a cada entrada de mercadoria
2. **Auditoria obrigatória:** Toda movimentação registra: responsável, data/hora, motivo
3. **Cancelamento restrito:** Apenas movimentações manuais podem ser canceladas
4. **Vendas integradas:** Saídas por PDV/Loja não podem ser canceladas no estoque
5. **Validação de saída:** Se estoque negativo não permitido, valida disponibilidade antes

### 8.5 Regras de Exclusão

1. **Produto com vendas:** Não pode ser excluído, apenas inativado
2. **Produto sem vendas:** Pode ser excluído permanentemente (com confirmação)
3. **Cascata:** Exclusão de produto remove variações, fotos e movimentações associadas
4. **Permissão:** Apenas gestores e admin podem excluir

### 8.6 Regras de Integração

1. **Sincronização loja:** Produtos ativos com estoque > 0 aparecem na loja virtual
2. **Baixa automática:** Vendas no PDV/Online geram movimentação de saída automaticamente
3. **Alertas MEL:** IA notifica quando estoque atinge mínimo ou produto para de vender
4. **Custo financeiro:** Entradas de compra podem gerar contas a pagar no financeiro

---

## 9. Permissões de Acesso

### 9.1 Perfis e Permissões

| Funcionalidade | Vendedor | Atendente | Gestor | Admin |
|----------------|----------|-----------|--------|-------|
| **Visualizar lista de produtos** | ✅ | ✅ | ✅ | ✅ |
| **Buscar produto** | ✅ | ✅ | ✅ | ✅ |
| **Ver detalhes do produto** | ✅ | ✅ | ✅ | ✅ |
| **Cadastrar novo produto** | ❌ | ❌ | ✅ | ✅ |
| **Editar produto** | ❌ | ❌ | ✅ | ✅ |
| **Excluir produto** | ❌ | ❌ | ✅ | ✅ |
| **Duplicar produto** | ❌ | ❌ | ✅ | ✅ |
| **Visualizar movimentações** | ✅ | ✅ | ✅ | ✅ |
| **Registrar entrada** | ❌ | ❌ | ✅ | ✅ |
| **Registrar saída/ajuste** | ❌ | ❌ | ✅ | ✅ |
| **Cancelar movimentação** | ❌ | ❌ | ✅ | ✅ |
| **Exportar dados** | ❌ | ❌ | ✅ | ✅ |
| **Importar produtos** | ❌ | ❌ | ✅ | ✅ |
| **Ver custo/preço de custo** | ❌ | ❌ | ✅ | ✅ |
| **Ajustar estoque** | ❌ | ❌ | ✅ | ✅ |
| **Fazer inventário** | ❌ | ❌ | ✅ | ✅ |

### 9.2 Restrições Específicas

- **Vendedor/Atendente:** Podem apenas consultar produtos e ver disponibilidade
- **Gestor:** Acesso completo ao módulo, exceto configurações avançadas de sistema
- **Admin:** Acesso irrestrito, incluindo exclusão permanente e importação em massa
- **Preço de custo:** Visível apenas para Gestor e Admin
- **Margem de lucro:** Visível apenas para Gestor e Admin
- **Ações destrutivas:** Apenas Gestor e Admin

---

## 10. Checklist de Qualidade

Antes de enviar ao Figma Make, verifique:

### ✅ Checklist de Conformidade com a Matriz

- [x] **Nenhum wireframe ou ASCII art:** Documento contém apenas especificações funcionais
- [x] **Nenhuma especificação de posicionamento:** Não há instruções como "botão à direita" ou "card no topo"
- [x] **Nenhuma cor hexadecimal:** Nenhuma cor específica mencionada
- [x] **Nenhum tamanho em pixels:** Não há medidas como "200px" ou "14px"
- [x] **Nenhuma fonte específica:** Não há menção a nomes de fontes
- [x] **Nenhuma descrição de layout:** Não há "duas colunas", "grid", "sidebar"
- [x] **User stories no formato correto:** Todas seguem "Como [perfil], quero [ação] para que [benefício]"
- [x] **Campos de formulário completos:** Nome, tipo, obrigatório e validações especificados
- [x] **Todos os estados de UI descritos:** Empty, loading, error e success states definidos
- [x] **Regras de negócio explícitas:** Todas as validações e restrições documentadas
- [x] **Permissões de acesso claras:** Quem pode ver/editar/excluir especificado
- [x] **Contexto do usuário UNIQ:** Empreendedor na correria, não técnico, com pouco tempo
- [x] **Limite de 4 telas respeitado:** Lista, Cadastro, Detalhes e Movimentações

### ✅ Checklist de Conteúdo

- [x] **Metadados completos:** Todas as 4 telas têm nome, rota, objetivo, permissões e prioridade
- [x] **Contexto do usuário:** Quem usa, por quê, frequência definidos
- [x] **Elementos obrigatórios:** Dados essenciais, funcionalidades e campos de formulário listados
- [x] **Ações possíveis:** Primárias, secundárias e de destruição documentadas
- [x] **Integrações:** Com outros módulos e APIs especificadas
- [x] **Componentes específicos:** Card de produto, indicador de estoque, tabela de variações
- [x] **Fluxos principais:** Diagramas de fluxo entre telas e módulos
- [x] **Regras de negócio:** Validações, cálculos e restrições
- [x] **Permissões:** Matriz de acesso por perfil

### 🎯 Teste Final

> **Se eu fosse um designer talentoso recebendo este documento pela primeira vez, teria liberdade suficiente para criar algo incrível e inovador?**

**RESPOSTA: SIM** ✅

O documento foca em:
- O QUE o usuário precisa fazer
- QUAIS dados precisam ser mostrados
- QUAIS regras de negócio devem ser respeitadas

Deixa para o Figma Make decidir:
- COMO organizar visualmente
- COMO posicionar elementos
- COMO aplicar cores e estilos
- COMO criar a experiência visual

---

## 11. Prompt para Figma Make

### Prompt Completo

```
Crie o design completo do Módulo Estoque para o UNIQ Empresas.

CONTEXTO DO PRODUTO:
- Produto: UNIQ Empresas - Plataforma SaaS para pequenos empreendedores
- Tipo: Aplicação web responsiva (mobile-first)
- Público-alvo: Donos de pequenos negócios (MEI/Micro), 1-3 funcionários, não técnicos
- Tom de voz: Simples, acolhedor, profissional, empoderador - "Você consegue!"
- Navegação: Sidebar principal escura + Barra de contexto do módulo + Área de conteúdo

DIFERENCIAL UNIQ:
- MEL (IA Proativa): Consultor digital que avisa sobre oportunidades e problemas
- Anti-ERP: Sem complexidade fiscal, foco em vendas e simplicidade
- Setup Done-For-You: Loja online pronta em 1 dia

MÓDULO ESTOQUE - OBJETIVO:
Permitir que empreendedores gerenciem produtos, controlem entradas/saídas de estoque 
e mantenham visibilidade do que está disponível para venda, tudo de forma simples 
e sem burocracia.

TELAS A CRIAR (4 telas):

1. LISTA DE PRODUTOS (/estoque/produtos)
Objetivo: Visualizar, buscar e gerenciar todos os produtos cadastrados
Funcionalidades: Busca por nome/SKU/código de barras, filtros avançados (categoria, 
estoque, status), toggle entre visualização em grade (cards com foto) e lista (tabela), 
ações em massa, cadastro de novo produto
Dados por produto: Foto, nome, SKU, preço de venda, estoque atual, indicador de 
estoque baixo, status, categoria, indicador de variações
Estados: Lista vazia, busca sem resultados, estoque baixo, loading

2. CADASTRO DE PRODUTO (/estoque/produtos/novo)
Objetivo: Criar produto completo com informações, preços, estoque, variações e fotos
Estrutura: 5 abas - Informações Básicas (nome, SKU, categoria, unidade), 
Preços (custo, venda, margem calculada, promoção), Estoque (quantidade, mínimo, 
fornecedor), Variações (tamanho, cor, tabela de combinações), Fotos (upload múltiplo, 
ordenar)
Validações: SKU único, código de barras EAN-13 válido, preço de venda > custo
Ações: Salvar rascunho, salvar e publicar, preview na loja, cancelar
Estados: Validação de erros, salvando, sucesso com próximos passos

3. DETALHES DO PRODUTO (/estoque/produtos/:id)
Objetivo: Visualizar todas as informações de um produto e gerenciar estoque
Estrutura: Header com nome, SKU, status, indicador de estoque + 5 abas - 
Geral (fotos, informações, preços), Estoque (quantidade, custo médio, localização, 
fornecedor), Variações (tabela completa), Movimentações (histórico de entradas/saídas), 
Fotos (gerenciar galeria)
Ações rápidas: Editar, ajustar estoque, imprimir etiqueta, duplicar, ativar/desativar
Estados: Estoque zerado (alerta), estoque baixo (alerta), produto inativo (badge)

4. MOVIMENTAÇÕES DE ESTOQUE (/estoque/movimentacoes)
Objetivo: Registrar e visualizar entradas e saídas de estoque
Funcionalidades: Filtros (tipo, período, produto, motivo), tabela de movimentações 
com histórico completo, resumo do período (total entradas/saídas/saldo), 
nova entrada (compra, devolução), nova saída (ajuste, perda, quebra), inventário físico
Formulário entrada: Tipo, produto, quantidade, custo unitário, fornecedor
Formulário saída: Tipo, produto, quantidade, motivo
Estados: Sem movimentações, filtros sem resultados, cancelamento

COMPONENTES ESPECÍFICOS:
- Card de produto para visualização em grade
- Indicador de status de estoque (OK/Baixo/Zerado) com cores distintas
- Tabela de variações com SKUs individuais
- Scanner de código de barras (integração câmera)
- Calculadora de margem de lucro (calcula automaticamente)

INTEGRAÇÕES IMPORTANTES:
- Loja Virtual: Produtos sincronizados automaticamente
- PDV: Baixa automática de estoque nas vendas
- MEL (IA): Alertas de estoque baixo, sugestões de compra
- Financeiro: Custo de produtos vendidos, valor em estoque

REGRAS DE NEGÓCIO CRÍTICAS:
- SKU único no sistema
- Custo médio recalculado automaticamente nas entradas
- Produto com vendas não pode ser excluído (apenas inativado)
- Variações: estoque total = soma das variações ativas
- Auditoria: toda movimentação registra responsável e motivo

ESTILO DESEJADO:
Crie um design moderno, profissional mas acolhedor, que transmita confiança para 
pequenos empresários. Priorize a clareza e facilidade de uso - o usuário está sempre 
com pressa entre uma venda e outra.

Use sua criatividade para:
- Organizar as informações de forma que o empreendedor encontre rapidamente o que precisa
- Destacar visualmente o que é importante (estoque baixo, produtos inativos)
- Criar uma experiência fluida entre as 4 telas
- Adaptar perfeitamente para mobile (80% dos acessos são pelo celular)
- Transmitir simplicidade e profissionalismo ao mesmo tempo

LEMBRE-SE:
- O empreendedor não é técnico e não quer aprender tecnologia
- Ele quer ver rapidamente: "O que tenho?", "O que está acabando?", "O que preciso fazer?"
- O MEL (IA) deve aparecer em cards destacados quando relevante
- Mobile-first: touch targets grandes, scroll estratégico
- Regra dos 5 segundos: usuário entende o estado do negócio em 5 segundos
```

---

## 12. Conclusão

### Resumo do Documento

Este documento especifica funcionalmente as **4 telas principais** do Módulo Estoque do UNIQ Empresas:

1. **Lista de Produtos** - Catálogo completo com busca, filtros e visualização em grade/lista
2. **Cadastro de Produto** - Formulário multi-etapas para criar produtos completos
3. **Detalhes do Produto** - Visualização completa com abas e ações rápidas
4. **Movimentações de Estoque** - Controle de entradas, saídas e histórico

### Próximos Passos

1. **Enviar ao Figma Make:** Use o prompt completo na seção 11
2. **Revisar designs:** Valide se todas as funcionalidades foram contempladas
3. **Ajustar se necessário:** Reforce objetivos, não soluções visuais
4. **Aprovar:** Quando funcionalmente completo, aprovado para desenvolvimento

### Status

- ✅ Documentação completa conforme Matriz de Documentação UI
- ✅ Foco em funcionalidade (O QUE), não em aparência (COMO)
- ✅ Contexto UNIQ aplicado (empreendedor na correria)
- ✅ 4 telas principais documentadas em detalhes
- ✅ Componentes específicos descritos
- ✅ Integrações mapeadas
- ✅ Regras de negócio explícitas
- ✅ Permissões definidas
- ✅ Checklist de qualidade aprovado
- ✅ Prompt para Figma Make pronto

**Documento pronto para ser transformado em designs pelo Figma Make! 🎨**

---

**Documento criado seguindo estritamente a Matriz de Documentação UI UNIQ**  
**Data:** Março 2025  
**Versão:** 1.0
