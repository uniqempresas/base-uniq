# SPEC — T2.2: Pedido Contabilizado via RPC

## Arquivos Novos
- `src/app/hooks/use-registrar-venda.ts` — Hook com fallback e tratamento de erro

## Arquivos Modificados
- `src/app/components/pedidos/PedidoDetalhePage.tsx` — Botão + modal + handler

## Hook `useRegistrarVenda`

### Interface
```typescript
interface RegistrarVendaParams {
  valor_total: number;
  forma_pagamento: string;
  cliente_id?: string;
  data_vencimento?: string;
  status?: string;
  itens: ItemVenda[];
  observacoes?: string;
  origem?: string;
}
```

### Comportamento
1. Busca `empresa_id` do contexto auth; fallback para primeira empresa
2. Busca `cliente_id` padrão se não informado
3. Data vencimento padrão: +30 dias
4. Chama RPC `registrar_venda`
5. Retorna `{success, id_venda, id_venda_servico, id_conta_receber, valor_total}` ou `{success: false, error}`

## UI — PedidoDetalhePage

### Botão "Contabilizar venda"
- Visível quando: `!isCanceled && !vendaContabilizada && pedido.statusPagamento === "confirmado"`
- Estilo: outline verde

### Badge "Venda contabilizada"
- Aparece após sucesso

### Modal de Confirmação
- Resumo: número, cliente, itens, valor total
- Botões: Cancelar / Confirmar
- Loading: spinner + "Registrando..."

## Checklist
- [x] Hook criado com fallback
- [x] Botão condicional no header
- [x] Modal com resumo
- [x] Handler chama RPC
- [x] Feedback sucesso/erro
- [x] Loading state
- [x] Build passa
