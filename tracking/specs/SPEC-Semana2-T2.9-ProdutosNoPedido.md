# SPEC — Produtos no Criar Pedido (T2.9)

> Decisão do fundador (11/09/2026): **mais fácil e mais alinhado** do que ativar PDV real — o PDV permanece como está (mock) pois o módulo sai do lugar errado do menu, e o fluxo diário é pedido → contabilizado.

## Objetivo

No modal "Novo Pedido" (`PedidosListaPage`), permitir **escolher produtos reais** (`me_produto`) com quantidade, gravando os itens em **`me_itens_venda`** junto com a venda — alimentando o DRE (já lê `me_itens_venda`).

## Mudanças

| Arquivo | Ação |
|---|---|
| `src/app/hooks/use-criar-pedido.ts` | Aceitar `itens` opcionais; `valor_total` = soma dos itens quando houver; inserir em `me_itens_venda` |
| `src/app/components/pedidos/PedidosListaPage.tsx` | Seção "Produtos do pedido" no modal: select de produto + quantidade + adicionar; lista de itens com qtd +/- e remover; total automático; `descricao` auto-gerada quando houver itens |

## Tipos

```ts
export interface PedidoItemInput {
  produto_id: number;      // me_produto.id (integer)
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
}
```

## Fluxo (use-criar-pedido)

1. `valorTotal = itens.length > 0 ? Σ(preco_unitario × quantidade) : params.valor`.
2. Insert em `me_venda` com `valor_total: valorTotal`.
3. Se `itens.length > 0`: batch insert em `me_itens_venda` com `{ venda_id, empresa_id, produto_id, nome_produto, quantidade, preco_unitario, subtotal, tipo_item: "produto" }`.

## Modal (PedidosListaPage)

```
┌─ Novo Pedido ─────────────────────────────┐
│ Nome do cliente * [______________]        │
│ Telefone (opcional) [__________]          │
│ Produtos do pedido                        │
│ [Selecione: __▾] [qtd: 1] [ + Adicionar ] │
│  • 2x Coxinha de Frango ..... R$ 14,00 [x]│
│  • 1x Bolo de Chocolate ..... R$ 30,00 [x]│
│ Total: R$ 44,00        (auto quando houver│
│  itens; input manual some)                │
│ Descrição (auto p/ itens) [______________]│
│ Forma pagamento [PIX ▾]  Canal [WhatsApp▾]│
│ [ Cancelar ] [ Criar Pedido ]             │
└───────────────────────────────────────────┘
```

- Sem itens → comportamento atual (valor manual + descrição obrigatória).
- Com itens → `valor` manual oculto (total = soma), descrição auto-gerada ("2x Coxinha, 1x Bolo") se vazia.

## Validação

- Item: quantidade ≥ 1, produto selecionado.
- `descricao` obrigatória **somente** quando não há itens.
- `valor > 0` necessário somente quando não há itens.

## Checklist

- [ ] Pickers + quantidade + itens no modal (loading dos produtos com skeleton)
- [ ] `useCriarPedido` recebe itens e grava em `me_itens_venda` (venda_id incluso)
- [ ] DRE/CMV refletem os itens após criar pedido
- [ ] Fallback mock preservado (sem produtos → campo valor manual contínua)
- [ ] Build + deploy Vercel OK