# PRD — T2.5: CRUD de Produtos Integrado ao Supabase

## Objetivo
Integrar a tela de produtos (`/estoque/produtos`) ao banco de dados Supabase, permitindo cadastro, edição e listagem de produtos reais da Doceê/HQ Gráfica.

## Contexto
Hoje a tela de produtos usa apenas mocks (`estoqueMockData.ts`). Para a Melissa conseguir criar pedidos via N8N com itens estruturados, precisamos de produtos cadastrados no banco.

## Stakeholders
- Esposa do fundador (cadastra produtos)
- Melissa (N8N) — consulta produtos para criar pedidos

## Critérios de Aceite
- [ ] Lista de produtos busca do Supabase (`me_produto`) com fallback mock
- [ ] Criar produto persiste no banco
- [ ] Editar produto persiste no banco
- [ ] Excluir produto (soft delete via `ativo=false`)
- [ ] Campos: nome, preço venda, preço custo, SKU, estoque, categoria, descrição
- [ ] Loading e empty states funcionando

## Fora de Escopo
- Controle de estoque avançado (entrada/saída)
- Fotos de produtos
- Variações de produtos
- Importação em massa
