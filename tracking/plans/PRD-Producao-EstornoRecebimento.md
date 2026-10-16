# PRD — Estorno de Recebimento de Compra

**Data:** 15/10/2026 · **Autor do pedido:** fundador da UNIQ · **Motivação:** operação real — uma compra foi recebida com erro e não havia forma de desfazer. Testar o fluxo de compras sem poder se desfazer inviabiliza o uso seguro do Estoque. *(Estava mapeado como decisão em aberto; fundador decidiu: construir.)*

## Por quê

Uma compra recebida muda o mundo em três lugares: **estoque** (entra convertido pela conversão da compra), **custo** (média ponderada em `me_produto.preco_custo`) e **financeiro** (conta a pagar pendente vinculada). Hoje o único caminho era "corrigir tudo à mão" — estoque via ajuste, custo fica enviesado, conta no Financeiro à parte. O estorno devolve os três de uma vez, de dentro.

## O quê (resumo)

1. **Snapshot automático no recebimento** — no momento em que a compra transita PENDENTE → RECEBIDO (isto é: dentro do mesmo statement do `UPDATE` de status, via trigger adicional), o banco guarda, por insumo da compra: a quantidade que entrou, o custo unitário da entrada, e o estado **antes** (`estoque_antes`, `custo_medio_antes`). A `receber_compra` fica **intocada** — o trigger é aditivo, dispara pelo `UPDATE` final da própria função.
2. **RPC transacional `estornar_recebimento`** — all-or-nothing: restaura `me_produto` ao estado do snapshot, grava movimento de **saída "Estorno"** no extrato (compensação do movimento "Compra" — `est_movimentacao` nunca é apagada; o extrato conta a história completa), cancela a conta a pagar no Financeiro, marca `est_recebimento.estornado_em` e devolve a compra para **PENDENTE** (o usuário corrige e recebe de novo, ou cancela).
3. **Front** — botão **Estornar** no card/sheet da compra RECEBIDO, com confirmação explícita ("o que vai acontecer") e estados completos.

## Regras de guarda da RPC (inquebráveis)

- Só compra **RECEBIDO** da própria empresa.
- **Sem snapshot** (recebida antes do estorno existir) → bloqueado com mensagem clara: corrigir à mão.
- **Conta já paga** → bloqueado: resolver no Financeiro primeiro (dinheiro já saiu).
- **Movimentação posterior do insumo** (produção, venda, ajuste ou outra compra depois do recebimento) → bloqueado, nomeando o insumo: estorno em ordem, do recebimento mais recente para o mais antigo. Isso garante restauração **exata** (nada consumiu/alterou o que o snapshot guarda).
- A compra não é apagada: volta a PENDENTE e mantém trilha. O extrato nunca perde linhas.

## Fora de escopo

- Estorno de compras recebidas **antes** desta migration (não têm snapshot — mensagem orienta corrigir à mão).
- Editar compra pendente (temos Cancelar + recriar; se uso real pedir, WIRE próprio).
- Reverter produção/venda (fora do alcance).

## Critério de aceite

Prova em transação com **ROLLBACK** no banco oficial: receber compra nova → estornar → `estoque_atual`, `preco_custo`, conta (`cancelado`), compra (PENDENTE) e extrato (saída "Estorno") conferidos item a item. Front no ar com deploy Vercel validado.
