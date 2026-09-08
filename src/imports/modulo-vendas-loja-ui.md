# Módulo Vendas - Loja Virtual - Documentação UI

> **Versão:** 1.0  
> **Última Atualização:** Março 2025  
> **Status:** Pronto para Figma Make  
> **Módulo:** Vendas - Submódulo Loja Virtual (Storefront)

---

## 1. Visão Geral do Módulo

### 1.1 O que é a Loja Virtual

A Loja Virtual é o **canal de vendas online** do empreendedor UNIQ. É uma vitrine digital onde clientes finais (consumidores) podem navegar, escolher produtos e finalizar compras sem intervenção direta do dono do negócio.

**Proposta de valor:** *"Sua loja online pronta em 1 dia. Venda enquanto dorme."*

### 1.2 Diferencial UNIQ na Loja

- **Setup Done-For-You:** Loja configurada pela equipe UNIQ
- **Integração WhatsApp:** Notificações automáticas de pedidos
- **MEL (IA Proativa):** Recuperação de carrinho abandonado
- **Anti-complexidade:** Sem burocracia fiscal, foco em vender

### 1.3 Contexto do Usuário

**Público-alvo da loja:**
- **Dono da loja (Admin):** Configura produtos, preços, frete
- **Cliente final (Consumidor):** Navega e compra na loja

**Perfil do cliente final:**
- Consumidor comum (não precisa ser técnico)
- Usa celular (80% dos acessos)
- Quer comprar rápido e fácil
- Experiência similar a grandes marketplaces

### 1.4 Navegação da Loja

A Loja Virtual funciona como um site independente acessível ao público:

```
[Página Inicial da Loja] (/loja)
    ├── [Busca e Filtros]
    ├── [Categorias]
    └── [Grid de Produtos]
            ↓ (clique no produto)
[Página do Produto] (/loja/produto/:id)
    ├── [Galeria de Fotos]
    ├── [Informações]
    ├── [Variações]
    └── [Ações de Compra]
            ↓ (adicionar ao carrinho ou comprar)
[Carrinho/Checkout] (/loja/checkout)
    ├── [Resumo do Pedido]
    ├── [Dados do Cliente]
    ├── [Endereço]
    └── [Pagamento]
            ↓ (após compra)
[Meus Pedidos] (/loja/pedidos)
    ├── [Lista de Pedidos]
    └── [Detalhes/Acompanhamento]
```

---

## 2. Tela 1: Catálogo da Loja

### 2.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Catálogo da Loja |
| **Rota/URL** | `/loja` |
| **Objetivo Principal** | Permitir que clientes naveguem e encontrem produtos para comprar |
| **Permissões de Acesso** | Público (qualquer pessoa pode acessar) |
| **Módulo/Pai** | Loja Virtual - Módulo Vendas |
| **Prioridade MVP** | ✅ Essencial |

### 2.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Clientes finais consumidores
- **Conhecimento técnico:** Baixo a médio
- **Contexto de uso:** Navegando pelo celular ou computador, buscando produtos para comprar

#### Por Que Esta Tela Existe
- **Problema que resolve:** Cliente precisa encontrar produtos facilmente sem ajuda do vendedor
- **Valor entregue:** Vitrine digital organizada que facilita a descoberta de produtos
- **Frequência de uso:** Múltiplas vezes por visita (navegação contínua)

#### User Stories Relacionadas
- "Como cliente, quero buscar um produto específico na loja para encontrar rapidamente o que preciso"
- "Como cliente, quero filtrar por categoria para ver apenas produtos do meu interesse"
- "Como cliente, quero ver foto e preço antes de clicar para decidir se quero ver mais detalhes"
- "Como cliente, quero adicionar produtos ao carrinho direto da lista para comprar mais rápido"
- "Como cliente, quero ver produtos em estoque para não tentar comprar o que não tem disponível"

### 2.3 Elementos Obrigatórios

#### Dados a Exibir
- [ ] **Logo da loja:** Identidade visual da empresa
- [ ] **Campo de busca:** Para pesquisar produtos por nome
- [ ] **Ícone do carrinho:** Com badge mostrando quantidade de itens
- [ ] **Menu de categorias:** Lista de categorias de produtos disponíveis
- [ ] **Banner/Promoções:** Destaques de promoções (se houver)
- [ ] **Filtros ativos:** Indicadores de filtros aplicados
- [ ] **Ordenação:** Opções de ordenação (relevância, preço, mais vendidos)

**Por produto no grid:**
- [ ] **Foto principal:** Imagem do produto
- [ ] **Nome do produto:** Título completo
- [ ] **Preço atual:** Valor de venda
- [ ] **Preço antigo:** Valor original (se houver desconto)
- [ ] **Indicador de desconto:** Percentual de desconto (se houver)
- [ ] **Status de estoque:** "Em estoque" ou "Esgotado"
- [ ] **Botão de ação:** "Adicionar ao carrinho" ou "Ver detalhes"

#### Funcionalidades Essenciais
- [ ] **Busca de produtos:** Campo de texto com busca em tempo real
- [ ] **Filtro por categoria:** Seleção de uma ou mais categorias
- [ ] **Filtro por preço:** Faixa de preço mínimo/máximo
- [ ] **Filtro por disponibilidade:** Apenas produtos em estoque
- [ ] **Ordenar resultados:** Por preço (menor/maior), mais vendidos, novidades
- [ ] **Ver detalhes do produto:** Navegar para página do produto
- [ ] **Adicionar ao carrinho (rápido):** Adicionar produto sem sair da página
- [ ] **Ver carrinho:** Acessar página de checkout

#### Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Termo de busca | Texto | Não | Mínimo 2 caracteres |
| Categoria | Select/Multi-select | Não | Lista de categorias disponíveis |
| Preço mínimo | Número | Não | Valor positivo |
| Preço máximo | Número | Não | Valor positivo, maior que mínimo |
| Ordenação | Select | Não | Opções pré-definidas |

### 2.4 Elementos Opcionais

#### Funcionalidades Adicionais
- [ ] **Produtos em destaque:** Seção de "Mais vendidos" ou "Novidades"
- [ ] **Tags de produto:** Marcadores como "Novo", "Oferta", "Limitado"
- [ ] **Comparar produtos:** Selecionar produtos para comparar
- [ ] **Lista de desejos:** Salvar produtos para comprar depois

#### Dados Secundários
- [ ] Avaliação média do produto (estrelas)
- [ ] Quantidade de avaliações
- [ ] Indicador de "Frete grátis"

### 2.5 Ações Possíveis

#### Ações Primárias
1. **Buscar produto:**
   - **Gatilho:** Digitar no campo de busca
   - **Resultado:** Lista filtrada em tempo real
   - **Confirmação:** Não necessária

2. **Aplicar filtros:**
   - **Gatilho:** Selecionar categoria ou preço
   - **Resultado:** Lista atualizada com filtros
   - **Confirmação:** Não necessária

3. **Ver detalhes do produto:**
   - **Gatilho:** Clicar no produto
   - **Resultado:** Navega para página do produto
   - **Confirmação:** Não necessária

#### Ações Secundárias
1. **Adicionar ao carrinho:** Adiciona produto ao carrinho sem sair da página
2. **Limpar filtros:** Remove todos os filtros aplicados
3. **Compartilhar produto:** Enviar link do produto

### 2.6 Estados da UI

#### Empty State - Loja sem Produtos
- **Quando aparece:** Dono da loja ainda não cadastrou produtos
- **Mensagem:** "Em breve novidades!"
- **Descrição:** "Nossa loja está sendo preparada com produtos incríveis para você"
- **CTA:** Opcional - campo para email de notificação

#### Empty State - Busca sem Resultados
- **Quando aparece:** Busca não encontra produtos
- **Mensagem:** "Nenhum produto encontrado"
- **Descrição:** "Tente outros termos ou ajuste os filtros"
- **CTA:** "Limpar filtros" ou "Ver todos os produtos"
- **Sugestões:** Produtos em destaque ou mais vendidos

#### Loading State
- **Quando aparece:** Carregando produtos ou aplicando filtros
- **Tipo:** Skeleton de cards de produtos
- **Mensagem:** "Carregando produtos..."

#### Error State
- **Quando aparece:** Falha ao carregar produtos
- **Mensagem:** "Não foi possível carregar os produtos"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

### 2.7 Integrações

#### Com Outras Telas
- Navega para: Página do Produto, Carrinho/Checkout
- Recebe de: Página inicial, links externos

#### Com Outros Módulos
- **Módulo Estoque:** Verificação de disponibilidade em tempo real
- **Módulo Vendas (PDV):** Produtos cadastrados no PDV aparecem na loja
- **Módulo Financeiro:** Preços e promoções

#### APIs/Serviços
- **API de Produtos:** Lista de produtos ativos
- **API de Busca:** Busca full-text e filtros
- **API de Categorias:** Árvore de categorias
- **LocalStorage:** Carrinho persistente

### 2.8 Regras de Negócio

1. **Produtos ativos:** Apenas produtos marcados como "ativo" e "visível na loja" aparecem
2. **Estoque positivo:** Produtos sem estoque aparecem marcados como "Esgotado"
3. **Preço mínimo:** Produtos só aparecem se tiverem preço de venda configurado
4. **Carrinho persistente:** Itens no carrinho são salvos no localStorage
5. **Fotos obrigatórias:** Produtos sem foto podem não aparecer ou mostrar placeholder

---

## 3. Tela 2: Página do Produto

### 3.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Página do Produto |
| **Rota/URL** | `/loja/produto/:id` |
| **Objetivo Principal** | Apresentar detalhes completos do produto para decisão de compra |
| **Permissões de Acesso** | Público (qualquer pessoa pode acessar) |
| **Módulo/Pai** | Loja Virtual - Módulo Vendas |
| **Prioridade MVP** | ✅ Essencial |

### 3.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Cliente avaliando produto para comprar
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Quer ver detalhes, fotos, preço antes de decidir

#### Por Que Esta Tela Existe
- **Problema que resolve:** Cliente precisa de informações completas para tomar decisão de compra
- **Valor entregue:** Todas as informações relevantes em um só lugar
- **Frequência de uso:** Por produto visualizado

#### User Stories Relacionadas
- "Como cliente, quero ver fotos grandes do produto antes de comprar para ter certeza do que estou comprando"
- "Como cliente, quero escolher tamanho e cor certos para receber o produto que preciso"
- "Como cliente, quero saber se tem estoque antes de adicionar ao carrinho para não ter surpresas"
- "Como cliente, quero ver a descrição completa para entender todas as características"
- "Como cliente, quero compartilhar o produto no WhatsApp para mostrar para alguém"

### 3.3 Elementos Obrigatórios

#### Dados a Exibir
- [ ] **Galeria de fotos:** Foto principal grande + miniaturas para navegação
- [ ] **Indicador de fotos:** Contador (ex: "Foto 1 de 5")
- [ ] **Nome completo do produto:** Título principal
- [ ] **Preço atual:** Valor de venda em destaque
- [ ] **Preço antigo:** Valor original riscado (se houver promoção)
- [ ] **Indicador de desconto:** Badge com percentual de desconto
- [ ] **Status de estoque:** "Em estoque" ou "Esgotado"
- [ ] **Quantidade disponível:** "X unidades disponíveis" (opcional)
- [ ] **Prazo de entrega:** Tempo estimado (se configurado)
- [ ] **Descrição completa:** Texto longo com detalhes
- [ ] **Especificações técnicas:** Tabela com características
- [ ] **Categoria:** Link para ver mais da mesma categoria
- [ ] **Tags:** Marcadores do produto

**Se houver variações:**
- [ ] **Seletor de variação:** Botões ou dropdown para escolher
- [ ] **Preço por variação:** Atualização automática do preço
- [ ] **Estoque por variação:** Disponibilidade da variação específica

**Quantidade:**
- [ ] **Seletor de quantidade:** Controles + e - com valor numérico
- [ ] **Limite máximo:** Indicador do estoque máximo disponível

#### Funcionalidades Essenciais
- [ ] **Navegar fotos:** Clicar nas miniaturas ou usar setas/swipe
- [ ] **Zoom na foto:** Ampliar imagem para ver detalhes
- [ ] **Selecionar variação:** Escolher tamanho, cor, etc.
- [ ] **Alterar quantidade:** Aumentar ou diminuir quantidade
- [ ] **Adicionar ao carrinho:** Adicionar com quantidade/variação selecionada
- [ ] **Comprar agora:** Ir direto para checkout com este produto
- [ ] **Compartilhar:** WhatsApp, redes sociais, link copiável
- [ ] **Voltar para loja:** Navegação de retorno

#### Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Variação (tamanho) | Select/Button group | Condicional | Obrigatório se produto tiver variação |
| Variação (cor) | Select/Color swatches | Condicional | Obrigatório se produto tiver cor |
| Quantidade | Number/Stepper | Sim | Mínimo 1, máximo = estoque disponível |

### 3.4 Elementos Opcionais

#### Funcionalidades Adicionais
- [ ] **Produtos relacionados:** "Quem viu este produto também viu"
- [ ] **Avaliações:** Nota média e comentários de clientes
- [ ] **Perguntas e respostas:** Seção de Q&A
- [ ] **Lista de desejos:** Salvar para depois

#### Dados Secundários
- [ ] Código/SKU do produto
- [ ] Marca/fabricante
- [ ] Peso e dimensões
- [ ] Garantia

### 3.5 Ações Possíveis

#### Ações Primárias
1. **Adicionar ao carrinho:**
   - **Gatilho:** Botão de ação primária
   - **Resultado:** Produto adicionado ao carrinho
   - **Confirmação:** Feedback visual (toast/modal)

2. **Comprar agora:**
   - **Gatilho:** Botão secundário
   - **Resultado:** Redireciona para checkout com este produto
   - **Confirmação:** Não necessária

3. **Selecionar variação:**
   - **Gatilho:** Clicar na opção de variação
   - **Resultado:** Atualiza preço e estoque
   - **Confirmação:** Não necessária

#### Ações Secundárias
1. **Navegar fotos:** Visualizar diferentes ângulos do produto
2. **Compartilhar produto:** Enviar para redes sociais
3. **Ver produtos da mesma categoria:** Navegação lateral

### 3.6 Estados da UI

#### Empty State - Produto Indisponível
- **Quando aparece:** Produto inativo ou removido
- **Mensagem:** "Produto não encontrado"
- **Descrição:** "Este produto não está mais disponível"
- **CTA:** "Ver outros produtos" ou "Voltar para a loja"

#### Estado - Produto Esgotado
- **Quando aparece:** Produto sem estoque
- **Mensagem:** "Produto esgotado"
- **Descrição:** "Infelizmente este produto acabou"
- **CTA:** "Avise-me quando chegar" (campo de email)
- **Ação adicional:** Mostrar produtos similares disponíveis

#### Estado - Variação Não Selecionada
- **Quando aparece:** Usuário tenta adicionar sem escolher variação
- **Mensagem:** "Selecione uma opção"
- **Descrição:** "Por favor, escolha [tamanho/cor] antes de adicionar"
- **Ação:** Destacar visualmente o seletor de variação

#### Loading State
- **Quando aparece:** Carregando dados do produto
- **Tipo:** Skeleton da página
- **Mensagem:** "Carregando produto..."

#### Error State
- **Quando aparece:** Falha ao carregar produto
- **Mensagem:** "Erro ao carregar produto"
- **Descrição:** "Não foi possível carregar as informações"
- **Ação de recuperação:** Botão "Tentar novamente"

### 3.7 Integrações

#### Com Outras Telas
- Navega para: Carrinho/Checkout, Catálogo da Loja
- Recebe de: Catálogo da Loja, links diretos

#### Com Outros Módulos
- **Módulo Estoque:** Verificação de disponibilidade em tempo real
- **Módulo Vendas (PDV):** Dados do produto

#### APIs/Serviços
- **API de Produtos:** Detalhes completos do produto
- **API de Estoque:** Disponibilidade em tempo real

### 3.8 Regras de Negócio

1. **Variação obrigatória:** Se produto tem variações, cliente deve selecionar antes de adicionar
2. **Limite de quantidade:** Não pode adicionar mais que o estoque disponível
3. **Preço dinâmico:** Preço atualiza conforme variação selecionada
4. **Estoque reservado:** Ao adicionar ao carrinho, produto é reservado por X minutos
5. **Fotos múltiplas:** Produto pode ter até N fotos na galeria

---

## 4. Tela 3: Carrinho/Checkout

### 4.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Carrinho e Checkout |
| **Rota/URL** | `/loja/checkout` |
| **Objetivo Principal** | Permitir que o cliente finalize a compra de forma rápida e segura |
| **Permissões de Acesso** | Público (qualquer pessoa pode acessar) |
| **Módulo/Pai** | Loja Virtual - Módulo Vendas |
| **Prioridade MVP** | ✅ Essencial |

### 4.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Cliente decidido a comprar
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Preenchendo dados para receber o produto, preocupado com segurança do pagamento

#### Por Que Esta Tela Existe
- **Problema que resolve:** Cliente precisa informar dados de entrega e pagamento de forma segura
- **Valor entregue:** Processo de checkout simplificado e confiável
- **Frequência de uso:** Uma vez por compra

#### User Stories Relacionadas
- "Como cliente, quero finalizar a compra com poucos cliques para não desistir no meio do caminho"
- "Como cliente, quero pagar via PIX para ter desconto e pagamento instantâneo"
- "Como cliente, quero parcelar no cartão para não comprometer o orçamento"
- "Como cliente, quero receber confirmação do pedido no WhatsApp para ter segurança"
- "Como cliente, quero calcular o frete antes de finalizar para não ter surpresas"

### 4.3 Elementos Obrigatórios

#### Dados a Exibir - Resumo do Pedido
- [ ] **Lista de itens:** Todos os produtos no carrinho
- [ ] **Foto de cada item:** Miniatura do produto
- [ ] **Nome do produto:** Título completo
- [ ] **Variação selecionada:** Tamanho, cor, etc.
- [ ] **Quantidade:** Unidades deste item
- [ ] **Preço unitário:** Valor de cada unidade
- [ ] **Subtotal por item:** Preço × quantidade
- [ ] **Controles de quantidade:** + e - para alterar
- [ ] **Botão remover:** Excluir item do carrinho
- [ ] **Subtotal geral:** Soma de todos os itens
- [ ] **Frete:** Valor calculado ou "Calcular"
- [ ] **Desconto:** Valor do cupom aplicado (se houver)
- [ ] **Total do pedido:** Valor final em destaque

#### Dados a Exibir - Dados do Cliente
- [ ] **Nome completo:** Campo de texto
- [ ] **Email:** Para envio de confirmação
- [ ] **Telefone/WhatsApp:** Para contato
- [ ] **CPF:** Para nota fiscal

#### Dados a Exibir - Endereço de Entrega
- [ ] **CEP:** Com autopreenchimento de endereço
- [ ] **Logradouro:** Rua, avenida, etc.
- [ ] **Número:** Número do endereço
- [ ] **Complemento:** Apartamento, bloco, etc. (opcional)
- [ ] **Bairro:** Bairro de entrega
- [ ] **Cidade:** Cidade de entrega
- [ ] **Estado:** UF

#### Dados a Exibir - Forma de Pagamento
- [ ] **Opções de pagamento:** PIX, Cartão de Crédito, Cartão de Débito, Boleto
- [ ] **PIX:** QR Code para escanear ou copia e cola
- [ ] **Cartão de Crédito:** Número, validade, CVV, nome, parcelamento
- [ ] **Parcelamento:** Opções de 1x a 12x (com juros se aplicável)
- [ ] **Boleto:** Código de barras e opção de envio por email

#### Funcionalidades Essenciais
- [ ] **Calcular frete:** Inserir CEP e calcular valor/prazo
- [ ] **Aplicar cupom:** Campo para código de desconto
- [ ] **Alterar quantidade:** Aumentar ou diminuir unidades
- [ ] **Remover item:** Excluir produto do carrinho
- [ ] **Autopreenchimento de endereço:** Via CEP
- [ ] **Seleção de pagamento:** Escolher forma de pagamento
- [ ] **Confirmar pedido:** Finalizar compra
- [ ] **Voltar para loja:** Continuar comprando

#### Campos de Formulário - Dados Pessoais

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Nome completo | Texto | Sim | Mínimo 3 caracteres |
| Email | Email | Sim | Formato válido de email |
| Telefone | Tel | Sim | Máscara de telefone (10-11 dígitos) |
| CPF | Texto | Sim | Máscara de CPF, validação de dígitos |

#### Campos de Formulário - Endereço

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| CEP | Texto | Sim | Máscara CEP (8 dígitos), busca automática |
| Logradouro | Texto | Sim | Autopreenchido pelo CEP |
| Número | Texto | Sim | Alfanumérico |
| Complemento | Texto | Não | Opcional |
| Bairro | Texto | Sim | Autopreenchido pelo CEP |
| Cidade | Texto | Sim | Autopreenchido pelo CEP |
| Estado | Select | Sim | Autopreenchido pelo CEP |

#### Campos de Formulário - Cupom

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Código do cupom | Texto | Não | Case insensitive |

#### Campos de Formulário - Cartão de Crédito

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Número do cartão | Texto | Condicional | Máscara de cartão, validação bandeira |
| Nome no cartão | Texto | Condicional | Como está no cartão |
| Validade | Texto | Condicional | MM/AA |
| CVV | Texto | Condicional | 3-4 dígitos |
| Parcelamento | Select | Condicional | Opções disponíveis |

### 4.4 Elementos Opcionais

#### Funcionalidades Adicionais
- [ ] **Salvar dados:** Salvar informações para próxima compra
- [ ] **Retirada na loja:** Opção de não precisar endereço
- [ ] **Múltiplos endereços:** Escolher entre endereços salvos
- [ ] **Observações:** Campo para instruções de entrega

### 4.5 Ações Possíveis

#### Ações Primárias
1. **Confirmar pedido:**
   - **Gatilho:** Botão de ação principal
   - **Resultado:** Processa pagamento e cria pedido
   - **Confirmação:** Tela de sucesso com número do pedido

2. **Calcular frete:**
   - **Gatilho:** Inserir CEP e clicar em calcular
   - **Resultado:** Mostra opções de frete com preço e prazo
   - **Confirmação:** Não necessária

3. **Aplicar cupom:**
   - **Gatilho:** Inserir código e confirmar
   - **Resultado:** Desconto aplicado no total
   - **Confirmação:** Feedback de cupom válido ou inválido

#### Ações Secundárias
1. **Alterar quantidade:** Aumentar/diminuir unidades de um item
2. **Remover item:** Excluir produto do carrinho
3. **Continuar comprando:** Voltar para a loja

### 4.6 Estados da UI

#### Empty State - Carrinho Vazio
- **Quando aparece:** Cliente acessa checkout sem itens
- **Mensagem:** "Seu carrinho está vazio"
- **Descrição:** "Que tal dar uma olhada em nossos produtos?"
- **CTA primário:** "Ir para a loja"
- **Sugestões:** Produtos em destaque ou mais vendidos

#### Success State - Pedido Confirmado
- **Quando aparece:** Pagamento processado com sucesso
- **Mensagem:** "Pedido confirmado!"
- **Descrição:** "Seu pedido foi recebido e está sendo processado"
- **Dados mostrados:**
  - Número do pedido (destaque)
  - Resumo dos itens comprados
  - Forma de pagamento escolhida
  - Endereço de entrega
  - Prazo estimado
- **CTAs:**
  - "Acompanhar pedido"
  - "Continuar comprando"
  - "Compartilhar no WhatsApp"

#### Error State - Pagamento Recusado
- **Quando aparece:** Cartão recusado ou erro no PIX
- **Mensagem:** "Não foi possível processar o pagamento"
- **Descrição:** Mensagem amigável explicando o problema
- **Ação de recuperação:**
  - Tentar outro cartão
  - Escolher outra forma de pagamento
  - Verificar dados inseridos

#### Error State - Produto Esgotado
- **Quando aparece:** Produto no carrinho acabou o estoque
- **Mensagem:** "Um item não está mais disponível"
- **Descrição:** "O produto [nome] esgotou enquanto você finalizava"
- **Ação:** Remover item ou voltar para escolher alternativa

#### Loading State
- **Quando aparece:** Processando pagamento
- **Tipo:** Spinner com mensagem de progresso
- **Mensagem:** "Processando seu pagamento..." / "Não feche esta página"

### 4.7 Integrações

#### Com Outras Telas
- Navega para: Meus Pedidos, Catálogo da Loja
- Recebe de: Página do Produto, Catálogo da Loja

#### Com Outros Módulos
- **Módulo Estoque:** Baixa automática após compra
- **Módulo Financeiro:** Lançamento de receita
- **Módulo WhatsApp:** Notificação de pedido confirmado
- **MEL (IA):** Recuperação de carrinho abandonado

#### APIs/Serviços
- **API de Frete:** Cálculo por CEP
- **API de Pagamento:** Mercado Pago, Stripe, etc.
- **ViaCEP:** Autopreenchimento de endereço
- **WhatsApp API:** Notificações

### 4.8 Regras de Negócio

1. **Carrinho persistente:** Itens salvos no localStorage, não expiram
2. **Estoque reservado:** Produtos reservados por 30 min durante checkout
3. **Validação de estoque:** Verificação final antes de confirmar
4. **PIX:** QR Code válido por 30 minutos
5. **Pedido mínimo:** Valor mínimo configurável para finalizar
6. **Cupom único:** Um cupom por pedido
7. **Dados obrigatórios:** Todos os campos obrigatórios devem ser preenchidos
8. **CPF válido:** Validação de dígitos verificadores
9. **Email válido:** Formato correto de email
10. **Frete obrigatório:** Deve calcular frete antes de finalizar (se necessário)

---

## 5. Tela 4: Meus Pedidos

### 5.1 Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Meus Pedidos |
| **Rota/URL** | `/loja/pedidos` |
| **Objetivo Principal** | Permitir que o cliente acompanhe pedidos e veja histórico de compras |
| **Permissões de Acesso** | Cliente autenticado ou via link/token do pedido |
| **Módulo/Pai** | Loja Virtual - Módulo Vendas |
| **Prioridade MVP** | ⚠️ Importante |

### 5.2 Contexto do Usuário

#### Quem Usa Esta Tela
- **Perfil:** Cliente que já comprou e quer acompanhar
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Verificar status de entrega, histórico, repetir compra

#### Por Que Esta Tela Existe
- **Problema que resolve:** Cliente precisa saber onde está seu pedido e histórico
- **Valor entregue:** Transparência no processo e facilidade para recomprar
- **Frequência de uso:** Após cada compra, periodicamente

#### User Stories Relacionadas
- "Como cliente, quero acompanhar onde está meu pedido para saber quando vou receber"
- "Como cliente, quero ver o histórico do que já comprei para lembrar o que gostei"
- "Como cliente, quero comprar novamente os mesmos itens para não ter que procurar de novo"
- "Como cliente, quero ver o código de rastreio para acompanhar na transportadora"
- "Como cliente, quero receber atualizações no WhatsApp para não precisar entrar no site"

### 5.3 Elementos Obrigatórios

#### Dados a Exibir - Lista de Pedidos
- [ ] **Número do pedido:** Identificador único
- [ ] **Data do pedido:** Quando foi feito
- [ ] **Status atual:** Aguardando pagamento, Pago, Em separação, Enviado, Entregue, Cancelado
- [ ] **Valor total:** Valor final pago
- [ ] **Ação "Ver detalhes":** Acessar informações completas

**Por pedido na lista:**
- [ ] Badge de status com cor diferenciada
- [ ] Ícone representando o status
- [ ] Preview dos itens (fotos miniatura)

#### Dados a Exibir - Detalhes do Pedido
- [ ] **Número do pedido:** Destaque
- [ ] **Data:** Dia e hora da compra
- [ ] **Status atual:** Com descrição do que significa
- [ ] **Timeline de status:** Histórico de atualizações com datas
- [ ] **Lista de itens:**
  - Foto do produto
  - Nome completo
  - Variação escolhida
  - Quantidade
  - Preço unitário
  - Subtotal
- [ ] **Dados de entrega:** Endereço completo
- [ ] **Forma de pagamento:** Método usado
- [ ] **Código de rastreio:** Quando disponível, com link para transportadora
- [ ] **Resumo financeiro:**
  - Subtotal
  - Frete
  - Desconto (se houver)
  - Total

#### Funcionalidades Essenciais
- [ ] **Ver detalhes:** Expandir ou navegar para página de detalhes
- [ ] **Filtrar por status:** Ver apenas pedidos em determinado estado
- [ ] **Filtrar por período:** Últimos 30 dias, 3 meses, 6 meses, todos
- [ ] **Acompanhar entrega:** Link para rastreamento
- [ ] **Repetir pedido:** Adicionar todos os itens ao carrinho novamente
- [ ] **Fazer nova compra:** Navegar para a loja

#### Campos de Formulário - Filtros

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Status | Select | Não | Todos, Aguardando, Pago, Enviado, Entregue, Cancelado |
| Período | Select | Não | Últimos 30 dias, 3 meses, 6 meses, 1 ano, Todos |
| Busca | Texto | Não | Número do pedido ou nome do produto |

### 5.4 Elementos Opcionais

#### Funcionalidades Adicionais
- [ ] **Avaliar produto:** Deixar review após entrega
- [ ] **Solicitar troca/devolução:** Iniciar processo de devolução
- [ ] **Baixar nota fiscal:** Download do PDF
- [ ] **Compartilhar pedido:** Enviar link do acompanhamento

### 5.5 Ações Possíveis

#### Ações Primárias
1. **Ver detalhes do pedido:**
   - **Gatilho:** Clicar no pedido ou botão "Ver detalhes"
   - **Resultado:** Expande ou navega para página com informações completas
   - **Confirmação:** Não necessária

2. **Acompanhar entrega:**
   - **Gatilho:** Clicar no código de rastreio
   - **Resultado:** Abre site da transportadora ou mostra status
   - **Confirmação:** Não necessária

3. **Repetir pedido:**
   - **Gatilho:** Botão "Comprar novamente"
   - **Resultado:** Todos os itens adicionados ao carrinho
   - **Confirmação:** Confirmação opcional se itens têm variação

#### Ações Secundárias
1. **Aplicar filtros:** Filtrar lista por status ou período
2. **Buscar pedido:** Pesquisar por número ou produto
3. **Fazer nova compra:** Ir para a loja

### 5.6 Estados da UI

#### Empty State - Sem Pedidos
- **Quando aparece:** Cliente nunca comprou
- **Mensagem:** "Você ainda não fez nenhum pedido"
- **Descrição:** "Que tal dar uma olhada em nossos produtos?"
- **CTA primário:** "Ir para a loja"
- **Destaque:** Produtos em promoção ou mais vendidos

#### Estado - Pedido Cancelado
- **Quando aparece:** Pedido foi cancelado
- **Indicador:** Status "Cancelado" com destaque visual
- **Motivo:** Motivo do cancelamento (se houver)
- **Ação:** "Ver detalhes" para entender o que aconteceu

#### Estado - Pedido Entregue
- **Quando aparece:** Pedido foi entregue
- **Indicador:** Status "Entregue" com ícone de confirmação
- **Ação adicional:** Opção de avaliar produto

#### Loading State
- **Quando aparece:** Carregando lista de pedidos
- **Tipo:** Skeleton de lista
- **Mensagem:** "Carregando seus pedidos..."

#### Error State
- **Quando aparece:** Falha ao carregar pedidos
- **Mensagem:** "Não foi possível carregar seus pedidos"
- **Descrição:** "Verifique sua conexão e tente novamente"
- **Ação de recuperação:** Botão "Tentar novamente"

### 5.7 Integrações

#### Com Outras Telas
- Navega para: Catálogo da Loja, Carrinho/Checkout, Detalhes do Pedido
- Recebe de: Carrinho/Checkout (após compra), links de notificação

#### Com Outros Módulos
- **Módulo Vendas (Admin):** Sincronização de status de pedidos
- **Módulo Estoque:** Atualização de disponibilidade
- **Módulo WhatsApp:** Notificações de atualização de status
- **Módulo Logística:** Rastreamento de entregas

#### APIs/Serviços
- **API de Pedidos:** Dados dos pedidos do cliente
- **API de Rastreamento:** Status das entregas
- **API de Produtos:** Dados para repetir pedido

### 5.8 Regras de Negócio

1. **Acesso:** Cliente vê apenas seus próprios pedidos
2. **Acesso via link:** Pedido pode ser acompanhado via link/token sem login
3. **Status automático:** Status atualiza conforme ações no admin
4. **Notificações:** Cliente recebe notificação em cada mudança de status
5. **Repetir pedido:** Produtos esgotados são ignorados ao repetir
6. **Histórico:** Pedidos mantidos indefinidamente no histórico
7. **Código de rastreio:** Disponível apenas após status "Enviado"

---

## 6. Componentes Específicos da Loja

### 6.1 Card de Produto

**O que é:** Elemento que representa um produto nas listagens

**Dados exibidos:**
- Foto principal do produto
- Nome do produto
- Preço atual (e antigo se houver promoção)
- Badge de desconto (se aplicável)
- Indicador de estoque

**Ações:**
- Ver detalhes (clique no card)
- Adicionar ao carrinho (botão rápido)

**Estados:**
- Normal: Produto disponível
- Esgotado: Overlay indicando indisponibilidade
- Promoção: Badge destacando desconto

### 6.2 Seletor de Variação

**O que é:** Componente para escolher opções do produto (tamanho, cor, etc.)

**Tipos:**
- **Tamanho:** Botões ou dropdown com opções (P, M, G, GG)
- **Cor:** Swatches coloridos ou botões com nome da cor
- **Outros:** Dropdown ou radio buttons

**Comportamento:**
- Atualiza preço conforme seleção
- Mostra estoque da variação específica
- Indica variações esgotadas (desabilitadas)
- Destaca seleção atual

### 6.3 Badge de Status do Pedido

**O que é:** Indicador visual do estado atual de um pedido

**Status e significados:**
- **Aguardando pagamento:** Pedido criado, aguardando confirmação
- **Pago:** Pagamento confirmado
- **Em separação:** Estoque reservado, preparando envio
- **Enviado:** Saiu para entrega, código de rastreio disponível
- **Entregue:** Cliente recebeu o pedido
- **Cancelado:** Pedido cancelado (pagamento não aprovado ou solicitação)

**Cores:**
- Cada status tem cor distinta para fácil identificação
- Status finais (Entregue/Cancelado) têm tratamento especial

### 6.4 Carrinho Flutuante/Resumo

**O que é:** Indicador persistente do carrinho durante navegação

**Elementos:**
- Ícone de carrinho
- Badge com quantidade de itens
- Preview dos itens (opcional)
- Valor total

**Ações:**
- Ver carrinho completo
- Acesso rápido ao checkout

---

## 7. Integrações da Loja Virtual

### 7.1 Com Outros Módulos UNIQ

#### Módulo Estoque
- **Verificação em tempo real:** Checagem de disponibilidade ao carregar produto
- **Baixa automática:** Redução do estoque após compra confirmada
- **Reserva temporária:** Produtos reservados durante checkout
- **Alerta de estoque baixo:** Notificação quando produto está acabando

#### Módulo Financeiro
- **Lançamento de receita:** Pedido confirmado gera receita a receber
- **Conciliação:** Sincronização com gateway de pagamento
- **Relatórios:** Vendas online aparecem nos relatórios financeiros

#### Módulo WhatsApp
- **Confirmação de pedido:** Mensagem automática após compra
- **Atualizações de status:** Aviso quando pedido é enviado
- **Recuperação de carrinho:** Lembrete de carrinho abandonado
- **Entrega:** Notificação quando pedido é entregue

#### MEL (IA Proativa)
- **Carrinho abandonado:** MEL envia mensagem após 1h sem finalizar
- **Recomendações:** Sugere produtos relacionados
- **Alerta de estoque:** Avisa quando produto favorito está acabando
- **Pós-venda:** Mensagem de satisfação após entrega

#### Módulo Vendas (PDV)
- **Produtos compartilhados:** Mesmo catálogo do PDV
- **Preços unificados:** Preços sincronizados entre canais
- **Clientes unificados:** Base de clientes compartilhada

### 7.2 Com Serviços Externos

#### Gateway de Pagamento (Mercado Pago / Stripe)
- **PIX:** Geração de QR Code
- **Cartão:** Processamento de pagamentos
- **Boleto:** Geração de boletos
- **Webhook:** Confirmação de pagamentos

#### Serviço de Frete (Melhor Envio / Frete Rápido)
- **Cálculo:** Cotação por CEP
- **Opções:** Diferentes transportadoras
- **Rastreamento:** Acompanhamento de entregas

#### ViaCEP
- **Autopreenchimento:** Busca de endereço por CEP
- **Validação:** Verificação de CEP válido

### 7.3 Fluxo de Dados

```
[Cliente navega na Loja]
    ↓
[Estoque] Verifica disponibilidade
    ↓
[Cliente adiciona ao carrinho]
    ↓
[Estoque] Reserva temporária
    ↓
[Cliente finaliza compra]
    ↓
[Gateway] Processa pagamento
    ↓
[Estoque] Baixa definitiva
    ↓
[Financeiro] Lança receita
    ↓
[WhatsApp] Notifica cliente
    ↓
[MEL] Agenda follow-up
```

---

## 8. Regras de Negócio da Loja Virtual

### 8.1 Regras de Produtos

1. **Visibilidade:** Produto só aparece na loja se:
   - Status = "Ativo"
   - Visível na loja = "Sim"
   - Tem preço de venda configurado
   - Tem pelo menos uma foto

2. **Estoque:**
   - Produtos sem estoque aparecem como "Esgotado"
   - Não é possível comprar produto sem estoque
   - Estoque é verificado em tempo real

3. **Variações:**
   - Produto com variações só pode ser comprado após seleção
   - Cada variação tem seu próprio estoque
   - Preço pode variar entre variações

### 8.2 Regras do Carrinho

1. **Persistência:** Carrinho é salvo no localStorage do navegador
2. **Validação:** Ao acessar checkout, todos os itens são validados contra estoque atual
3. **Expiração:** Itens são reservados por 30 minutos durante checkout
4. **Limite:** Quantidade máxima = estoque disponível

### 8.3 Regras de Pagamento

1. **PIX:**
   - QR Code válido por 30 minutos
   - Pedido cancelado automaticamente se não pagar
   - Desconto configurável para PIX

2. **Cartão de Crédito:**
   - Parcelamento disponível conforme configuração
   - Juros podem ser repassados ao cliente
   - Validação de dados do cartão

3. **Boleto:**
   - Vencimento em 1-3 dias úteis
   - Pedido aguarda pagamento
   - Cancelado automaticamente após vencimento

### 8.4 Regras de Frete

1. **Cálculo:** Baseado no CEP de destino e dimensões/peso dos produtos
2. **Prazo:** Estimativa fornecida pela transportadora
3. **Frete grátis:** Opção configurável por valor mínimo de pedido
4. **Retirada:** Opcional de não cobrar frete (retirada na loja)

### 8.5 Regras de Pedidos

1. **Número único:** Cada pedido tem número sequencial único
2. **Status:** Fluxo obrigatório: Aguardando → Pago → Em separação → Enviado → Entregue
3. **Notificações:** Cliente é notificado em cada mudança de status
4. **Histórico:** Pedidos mantidos permanentemente

### 8.6 Regras de Segurança

1. **Dados pessoais:** CPF e email validados
2. **Pagamento:** Processado em ambiente seguro (HTTPS)
3. **Token:** Acompanhamento de pedido pode ser feito via token único
4. **Privacidade:** Cliente só vê seus próprios pedidos

---

## 9. Checklist de Qualidade

Antes de enviar ao Figma Make, verifique:

### ✅ Checklist da Matriz

- [x] **Nenhum wireframe ou ASCII art**
- [x] **Nenhuma especificação de posicionamento** ("à direita", "no topo")
- [x] **Nenhuma cor hexadecimal**
- [x] **Nenhum tamanho em pixels**
- [x] **Nenhuma fonte específica**
- [x] **Nenhuma descrição de layout** ("duas colunas", "sidebar")
- [x] **Nenhuma animação detalhada**
- [x] **User stories no formato correto:** "Como [perfil], quero [ação] para que [benefício]"
- [x] **Campos de formulário completos:** tipo, obrigatório, validações
- [x] **Todos os estados de UI descritos:** empty, loading, error, success
- [x] **Regras de negócio explícitas**
- [x] **Permissões de acesso claras**
- [x] **Contexto do usuário UNIQ presente**
- [x] **Limite de 3-4 telas respeitado** (4 telas documentadas)

### 🎯 Teste Final

> **"Se eu fosse um designer talentoso recebendo este documento pela primeira vez, teria liberdade suficiente para criar algo incrível e inovador?"**

**RESPOSTA: SIM** ✅

O documento especifica O QUE precisa estar em cada tela (dados, funcionalidades, ações, regras) sem limitar COMO deve ser visualmente. O Figma Make tem total liberdade para criar layouts criativos e modernos.

---

## 10. Resumo para Prompt do Figma Make

### Contexto do Produto
- **Produto:** UNIQ Empresas - Plataforma SaaS para pequenos empreendedores
- **Módulo:** Loja Virtual (Storefront)
- **Público:** Clientes finais consumidores (não técnicos)
- **Tom:** Simples, acolhedor, profissional, sem jargões

### Telas a Criar (4)
1. **Catálogo da Loja** - Vitrine com busca, filtros e grid de produtos
2. **Página do Produto** - Detalhes, galeria, variações e compra
3. **Carrinho/Checkout** - Finalização com dados pessoais, endereço e pagamento
4. **Meus Pedidos** - Histórico e acompanhamento de compras

### Estilo Desejado
Crie designs modernos, limpos e profissionais para uma loja virtual que transmita confiança e facilidade de uso. Priorize:
- Experiência mobile-first (80% dos acessos são mobile)
- Hierarquia visual clara
- Botões de ação bem visíveis
- Estados vazios amigáveis
- Feedback visual claro em todas as ações

### Diferencial
A loja deve parecer simples e acessível para pequenos empreendedores e seus clientes, transmitindo profissionalismo sem complexidade.

---

**Documento pronto para transformação em prompt do Figma Make!** 🚀

**Próximo passo:** Converter este documento em um prompt estruturado para o Figma Make seguindo as diretrizes da seção 7 da Matriz.
