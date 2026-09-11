# WIRE — Produtos no Criar Pedido + Novo Cliente (T2.9)

## Modal "Novo Pedido" (`/vendas/pedidos`) — mobile-first

```
┌─ Novo Pedido ──────────────────────────────┐
│ Nome do cliente *        [_____________]   │
│ Telefone (opcional)     [_______________]  │
│                                            │
│ Produtos do pedido                         │
│ [Selecione um produto... ▾] [1] [+ Adicion]│
│                                            │
│  ┌ (−) 2 Coxinha de Frango ── R$ 14,00 [x]│
│  ┌ (−) 1 Bolo de Chocolate ─ R$ 30,00 [x] │
│                                            │
│  Total dos produtos           R$ 44,00     │
│                                            │
│ Descrição (auto se vazia)                  │
│ [ 2x Coxinha de Frango, 1x Bolo       ]    │
│                                            │
│ Valor total                 R$ 44,00 ①     │
│                                            │
│ Forma pagamento   [PIX ▾]  Canal [WhatsApp]│
│                                            │
│ [      Cancelar        ] [  Criar Pedido ] │
└────────────────────────────────────────────┘
```

① **Com itens** → valor manual vira somente-leitura (total = soma dos itens).
   **Sem itens** → valor manual editável + descrição obrigatória (fluxo anterior).

### Estados

- **Loading produtos:** bloco p/ skeleton no lugar do select ("Carregando produtos...").
- **Sem produtos cadastrados:** select vazio ("Selecione um produto...") — fluxo manual segue normal.
- **Item adicionado:** linha com qtd ± (mín. 1), nome (truncado), subtotal e botão [x] p/ remover.
- **Erro ao carregar produtos:** select desabilitado + mensagem; fluxo manual continua possível.

### Comportamento

- Adicionar: produto selecionado + qtd ≥ 1 → insere/agrega item (mesmo produto soma qtd).
- Total = Σ(preço_unitário × qtd); `valor_total` do pedido = esse total quando há itens.
- Descrição: se o campo estiver vazio e houver itens → gerada automática ("2x Coxinha, 1x Bolo").
- Criar Pedido: cria/usa cliente em `me_cliente` (find-or-create por nome + empresa) → grava `me_venda` → itens em `me_itens_venda`.
- Sem sessão/empresa → não grava; pedido não é criado (sem fallback cego).

## Pós-criação (feedback)

```
✅ Pedido #2321 criado com 2 produtos (2x Coxinha de Frango, 1x Bolo de Chocolate)
```
- Novo pedido aparece no topo da lista; DRE reflete os itens (CMV) ao recarregar o Financeiro.