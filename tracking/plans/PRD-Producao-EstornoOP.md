# PRD — Estorno de Ordem de Produção (OP)

**Data:** 21/10/2026 · **Autor do pedido:** fundador da UNIQ · **Motivação:** operação real — produziu "ganache 300 g" com a ficha errada e não conseguiu corrigir para 500 g: a OP executada é definitiva, o custo não recalcula e qualquer erro exige SQL manual do agente. *(D13 da Fase 3 adiava o estorno para a Fase 4; fundador decidiu em 21/10: construir agora. Supersede a D13.)*
**Análise de fundo:** `tracking/ANALISE_ESTOQUE_ESTORNO_OP.md` (comparativo ERPNext/Odoo/Bling).

## Por quê

Uma OP executada muda o mundo em três lugares: **estoque dos insumos** (saída), **estoque e custo do acabado** (entrada com custo médio) e **o extrato** (movimentações). Hoje o único caminho de correção é "SQL manual do agente" — inviável para o usuário e inviável para testar o módulo com segurança. O estorno devolve os três de uma vez, de dentro, com um toque. Referência de mercado direta: **Bling** — OP finalizada pode ser cancelada e o sistema estorna o estoque automaticamente; **ERPNext** — correção guiada "cancel & amend".

## O quê (resumo)

1. **Ciclo de vida da OP** — `est_ordem_producao` ganha `status` (`ATIVA` | `ESTORNADA`) + `estornado_em`. OP nunca é deletada nem editada; correção é sempre um lançamento novo (ledger imutável — padrão já adotado no extrato B14 e no estorno de compra).
2. **RPC transacional `estornar_producao`** — all-or-nothing: devolve a **quantidade real consumida** de cada insumo (lida de `est_ordem_producao_item` — a auditoria que a Fase 3 já grava), dá saída no acabado, grava movimentações de compensação `motivo 'Estorno'` no extrato (nada é apagado) e marca a OP ESTORNADA. **Custo sem máquina de reposting**: no custo médio móvel, insumos voltam sem tocar `preco_custo` (converge naturalmente — modelo Bling/Odoo); o **acabado** tem o custo restaurado **exatamente** quando a OP é a última movimentação dele (caso comum da correção imediata — telescopagem da média); fora desse caso, compensação simples e a média converge.
3. **Front** — linha do histórico de OPs (`ProducaoTab`) ganha ações: **Estornar** (com modal de confirmação "o que vai acontecer", padrão do estorno de compra) e **Corrigir produção** (encadeia: estorna → abre "Produzir lote" pré-preenchido → sugere corrigir a ficha). Badge ESTORNADA nas linhas estornadas.

## Regras de guarda da RPC (inquebráveis)

- Só OP **ATIVA** da própria empresa (segunda chamada na mesma OP → bloqueio idempotente).
- **Acabado insuficiente** (já vendeu/consumiu parte do lote) → bloqueado com mensagem clara: quanto resta + caminho (estornar venda antes ou ajustar manualmente). Sem estorno parcial na Fase 4a.
- O extrato nunca perde linhas; as movimentações originais da OP ficam visíveis junto com as de estorno.

## Fora de escopo

- Estorno parcial de OP e correção retroativa exata de custo médio (reposting — nível ERPNext, overkill).
- Editar OP ativa (observação/data) — candidato Fase 4c.
- Estorno de compra continua no modelo atual (restauração exata); alinhar ao modelo compensatório é discussão separada.
- Rascunho/ciclo "Não Iniciado → Em Produção" da OP (backlog Fase 5 "OP Documento").

## Critério de aceite

Prova em transação com **ROLLBACK** no banco oficial: produzir lote → estornar → `estoque_atual` de insumos e acabado iguais ao baseline, OP ESTORNADA, extrato com entrada+saída "Estorno", segunda chamada bloqueada. Front no ar com deploy Vercel validado pelo fundador (celular).
