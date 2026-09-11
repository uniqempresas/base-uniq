# PRD — Produtos no Criar Pedido + Novo Cliente persistido (T2.9)

> Fase: Semana 2 · Módulo: Vendas (pedidos) · Status: ✅ Aprovado (11/09/2026)

## Porquê (WHY)

Decisão do fundador (11/09/2026): **mais fácil e mais alinhado** do que ativar um PDV real. O PDV permanece como está (mock), pois o módulo sai do lugar errado do menu — e o fluxo diário do negócio é **pedido → contabilizado**.

Hoje o modal "Novo Pedido" só permite **valor manual + descrição** — o pedido não diz *o que* foi vendido. O DRE **já lê `me_itens_venda`** para custo/margem, mas nada preenche essa tabela pelo fluxo de pedidos. Resultado: a demonstração de margem fica incompleta e a Doceê continua "dependendo de memória" para saber o que vendeu.

## O quê (WHAT)

1. **Modal "Novo Pedido" passa a aceitar produtos reais** (`me_produto`): select do produto + quantidade + botão adicionar; lista de itens com qtd ± e remover; total automático (soma dos itens).
2. **`useCriarPedido` grava os itens em `me_itens_venda`** junto com a venda (`venda_id`, `produto_id`, `nome_produto`, `quantidade`, `preco_unitario`, `subtotal`) — alimentando DRE/CMV.
3. **Cliente do modal é persistido de verdade**: find-or-create em `me_cliente` por `nome_cliente` + `empresa_id` (cria se não existir, com telefone opcional), antes de gravar a venda.
4. **Sem itens → fluxo anterior preservado** (valor manual + descrição obrigatória), respeitando a regra mock-first/07/09/2026.

## Escopo

- ✅ Dentro: seção "Produtos do pedido" no modal; `useCriarPedido` com `itens`; insert em `me_itens_venda`; cliente find-or-create em `me_cliente`; total automático; descrição auto-gerada.
- ❌ Fora: PDV real (mantém mock); estoque/baixa automática de `estoque_atual`; edição de pedido existente; integrar checkout da vitrine; pagamento/contas a receber (fluxo atual permanece).

## Stakeholders

Founder (dono) · Melissa (operadora) · Esposa do fundador (usuária prática — Loja Teste01)

## Critérios de aceite

- [ ] Pickers + quantidade + itens no modal (loading dos produtos com skeleton).
- [ ] `useCriarPedido` recebe itens e grava em `me_itens_venda` (com `venda_id`).
- [ ] Cliente novo digitado no modal é criado em `me_cliente` (find-or-create) e vinculado à venda (`cliente_id`).
- [ ] DRE/CMV refletem os itens após criar pedido.
- [ ] Fallback preservado: sem itens → campo valor manual + descrição obrigatória continuam funcionando.
- [ ] Build + deploy Vercel OK.