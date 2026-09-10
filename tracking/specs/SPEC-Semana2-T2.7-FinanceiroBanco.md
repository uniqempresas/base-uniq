# SPEC — T2.7: Financeiro Integrado ao Banco

## Arquivos Novos
- `src/app/hooks/use-contas-receber.ts` — Hook lista contas a receber
- `src/app/hooks/use-contas-pagar.ts` — Hook lista contas a pagar
- `src/app/hooks/use-atualizar-conta-receber.ts` — Hook para marcar como recebido/editar
- `src/app/hooks/use-atualizar-conta-pagar.ts` — Hook para marcar como pago/editar
- `src/app/hooks/use-criar-conta-receber.ts` — Hook para criar conta a receber
- `src/app/hooks/use-criar-conta-pagar.ts` — Hook para criar conta a pagar

## Arquivos Modificados
- `src/app/components/financeiro/ContasReceberPage.tsx` — Usar hooks ao invés de mock
- `src/app/components/financeiro/ContasPagarPage.tsx` — Usar hooks ao invés de mock

## Schemas

### `me_contas_receber`

| Campo | Tipo | Obrigatório | Uso |
|-------|------|-------------|-----|
| `id` | uuid | Sim | Gerado pelo banco |
| `empresa_id` | uuid | Sim | Contexto auth |
| `cliente_id` | uuid | Não | Cliente vinculado |
| `venda_id` | uuid | Não | Venda vinculada |
| `descricao` | varchar | Sim | Descrição da conta |
| `valor` | numeric | Sim | Valor total |
| `data_vencimento` | date | Sim | Data de vencimento |
| `data_pagamento` | date | Não | Data do recebimento |
| `valor_pago` | numeric | Não | Valor efetivamente pago |
| `status` | varchar | Não | pendente/pago/vencido |
| `forma_pagamento` | varchar | Não | pix/dinheiro/cartao etc |
| `conta_id` | uuid | Não | Conta bancária |
| `categoria_id` | uuid | Não | Categoria |
| `observacoes` | text | Não | Observações |

### `me_contas_pagar`

| Campo | Tipo | Obrigatório | Uso |
|-------|------|-------------|-----|
| `id` | uuid | Sim | Gerado pelo banco |
| `empresa_id` | uuid | Sim | Contexto auth |
| `fornecedor_id` | uuid | Não | Fornecedor vinculado |
| `descricao` | varchar | Sim | Descrição da conta |
| `valor` | numeric | Sim | Valor total |
| `data_vencimento` | date | Sim | Data de vencimento |
| `data_pagamento` | date | Não | Data do pagamento |
| `valor_pago` | numeric | Não | Valor efetivamente pago |
| `status` | varchar | Não | pendente/pago/vencido |
| `forma_pagamento` | varchar | Não | pix/dinheiro/cartao etc |
| `conta_id` | uuid | Não | Conta bancária |
| `categoria_id` | uuid | Não | Categoria |
| `observacoes` | text | Não | Observações |

## Hooks

### `useContasReceber()`
Busca contas a receber da empresa com fallback para mock.

### `useContasPagar()`
Busca contas a pagar da empresa com fallback para mock.

### `useCriarContaReceber()` / `useCriarContaPagar()`
Insert na tabela correspondente.

### `useAtualizarContaReceber(id)` / `useAtualizarContaPagar(id)`
Update por id. Operações:
- Marcar como recebido/pago (atualiza `status`, `data_pagamento`, `valor_pago`)
- Editar campos

## Mapeamento de Campos

| Front (mock) | Banco (Supabase) |
|--------------|------------------|
| `cliente` | `cliente_id` → busca `nome_cliente` em `me_cliente` |
| `descricao` | `descricao` |
| `valor` | `valor` |
| `dataPrevista` | `data_vencimento` |
| `status` | `status` (calculado: vencido se data passou e não pago) |
| `formaPagamento` | `forma_pagamento` |
| `fornecedor` | `fornecedor_id` → busca `nome_fantasia` em `me_fornecedor` |

## Estados

| Estado | Comportamento |
|--------|---------------|
| Loading | Skeleton nos cards e tabela |
| Vazio (banco) | Fallback para mock com badge "dados de exemplo" |
| Erro | Fallback para mock + mensagem de erro |
| Sucesso | Dados reais do banco |

## Checklist
- [ ] Hook useContasReceber criado
- [ ] Hook useContasPagar criado
- [ ] Hook useCriarContaReceber criado
- [ ] Hook useCriarContaPagar criado
- [ ] Hook useAtualizarContaReceber criado
- [ ] Hook useAtualizarContaPagar criado
- [ ] ContasReceberPage integrada
- [ ] ContasPagarPage integrada
- [ ] Filtro por empresa_id em todos os hooks
- [ ] Ação "Receber" funciona
- [ ] Ação "Pagar" funciona
- [ ] Criar conta funciona
- [ ] Editar conta funciona
- [ ] Build passa
