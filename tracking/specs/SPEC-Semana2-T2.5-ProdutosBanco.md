# SPEC — T2.5: CRUD de Produtos Integrado ao Supabase

## Arquivos Novos
- `src/app/hooks/use-produtos.ts` — Hook com fallback para buscar produtos
- `src/app/hooks/use-criar-produto.ts` — Hook para criar produto
- `src/app/hooks/use-atualizar-produto.ts` — Hook para editar produto

## Arquivos Modificados
- `src/app/components/estoque/ProdutosPage.tsx` — Usar hooks + integrar CRUD

## Schema `me_produto`

| Campo | Tipo | Obrigatório | Uso |
|-------|------|-------------|-----|
| `id` | integer | Sim | Gerado pelo banco |
| `empresa_id` | uuid | Não | Contexto auth |
| `nome_produto` | text | Sim | Nome do produto |
| `preco` | numeric | Não | Preço de venda |
| `preco_varejo` | numeric | Não | Preço varejo |
| `preco_custo` | numeric | Não | Preço de custo |
| `sku` | text | Não | Código interno |
| `estoque_atual` | integer | Não | Quantidade em estoque |
| `categoria_id` | integer | Não | Categoria |
| `ativo` | boolean | Sim | Soft delete |
| `unidade_medida_id` | integer | Não | Unidade |
| `subcategoria_id` | integer | Não | Subcategoria |
| `tipo` | text | Não | Tipo do produto |
| `opcoes_config` | jsonb | Não | Configurações |
| `descricao` | text | Não | Descrição |
| `codigo_barras` | text | Não | Código de barras |
| `foto_url` | text | Não | Foto |
| `exibir_vitrine` | boolean | Não | Mostrar na loja |

## Hooks

### `useProdutos()`
Busca produtos ativos (`ativo=true`) com fallback para mock.

### `useCriarProduto()`
Insert em `me_produto` com campos mapeados.

### `useAtualizarProduto()`
Update em `me_produto` por id.

## Mapeamento de Campos

| Front (mock) | Banco (Supabase) |
|--------------|------------------|
| `nome` | `nome_produto` |
| `precoVenda` | `preco` |
| `precoCusto` | `preco_custo` |
| `sku` | `sku` |
| `estoque` | `estoque_atual` |
| `categoria` | `tipo` (texto livre por enquanto) |
| `descricao` | `descricao` |
| `status` | `ativo` (ativo/inativo) |

## Checklist
- [ ] Hook useProdutos criado
- [ ] Hook useCriarProduto criado
- [ ] Hook useAtualizarProduto criado
- [ ] Lista integrada ao banco
- [ ] Criar produto funciona
- [ ] Editar produto funciona
- [ ] Excluir produto (soft delete)
- [ ] Build passa
