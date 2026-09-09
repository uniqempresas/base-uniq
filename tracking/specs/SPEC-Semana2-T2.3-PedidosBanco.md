# SPEC — T2.3: Pedidos Integrados ao Banco + Criação Manual

## Arquivos Novos
- `src/app/hooks/use-pedidos.ts` — Hook com fallback para buscar pedidos do banco
- `src/app/hooks/use-criar-pedido.ts` — Hook para criar pedido manual

## Arquivos Modificados
- `src/app/components/pedidos/PedidosListaPage.tsx` — Usar hook + botão "Novo Pedido" + modal

## Schema `me_venda`

| Campo | Tipo | Obrigatório | Uso |
|-------|------|-------------|-----|
| `id` | uuid | Sim | Gerado pelo banco |
| `empresa_id` | uuid | Não | Contexto auth |
| `cliente_id` | uuid | Não | Vincular cliente |
| `valor_total` | numeric | Sim | Valor do pedido |
| `observacoes` | text | Não | Descrição livre |
| `status_venda` | text | Sim | "pendente" |
| `forma_pagamento` | integer | Não | Código da forma |
| `canal_venda` | text | Não | "whatsapp", "manual", etc |
| `tipo_venda` | text | Não | "manual" |
| `valor_desconto` | numeric | Sim | 0 |
| `possui_nota_fiscal` | boolean | Sim | false |
| `foi_devolvida` | boolean | Sim | false |
| `criado_em` | timestamp | Sim | now() |

## Hook `usePedidos`

### Comportamento
1. Busca `me_venda` ordenado por `criado_em` desc
2. Mapeia para interface `Pedido` existente
3. Se vazio ou erro, usa `PEDIDOS` mock

### Interface
```typescript
interface UsePedidosReturn {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}
```

## Hook `useCriarPedido`

### Parâmetros
```typescript
interface CriarPedidoParams {
  clienteNome: string;
  clienteTelefone?: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  canal: string;
}
```

### Comportamento
1. Busca `empresa_id` do contexto ou primeira disponível
2. Busca ou cria cliente em `me_cliente`
3. Insere em `me_venda` com status "pendente"
4. Retorna `{success, id}` ou `{success: false, error}`

## Mapeamento Forma Pagamento

| String | Código |
|--------|--------|
| "dinheiro" | 1 |
| "pix" | 2 |
| "cartao_credito" | 3 |
| "cartao_debito" | 4 |
| "boleto" | 5 |

## UI — PedidosListaPage

### Botão "Novo Pedido"
- Local: header, ao lado de filtros
- Estilo: primário verde

### Modal "Novo Pedido"
Campos:
- Nome do cliente (text, obrigatório)
- Telefone (text, opcional)
- Descrição do pedido (textarea, obrigatório)
- Valor total (number, obrigatório)
- Forma de pagamento (select)
- Canal (select: WhatsApp, Manual, Telefone)

Botões: Cancelar / Criar Pedido

## Checklist
- [ ] Hook usePedidos criado
- [ ] Hook useCriarPedido criado
- [ ] Lista usa dados do banco com fallback
- [ ] Botão Novo Pedido adicionado
- [ ] Modal de criação funcional
- [ ] Build passa
