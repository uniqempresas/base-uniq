# WIRE — Estorno de Recebimento (E1–E3)

> **Referência:** `SPEC-Producao-EstornoRecebimento.md` (contrato completo). Mobile-first; estrutura e função; identidade visual = `DESIGN.md`. Página afetada: `/estoque/compras` (ComprasPage · card e sheet) — nenhuma rota nova.

## E1 — Card/Sheet da compra RECEBIDO com ação Estornar

```
┌─ Compras ────────────[+ Nova]───┐
│ (cards de compras existentes)   │
├─────────────────────────────────┤
│ ┌ Fornecedor X ───────────────┐ │
│ │ NF 123 · 15/10 · R$ 70,00   │ │
│ │ ● RECEBIDO · conta pendente │ │
│ │ estoque e custo entrados    │ │
│ │ [ Detalhes ]  [ Estornar ]  │ │
│ └─────────────────────────────┘ │
```

- `Estornar` é **ação secundária** do card RECEBIDO (mesma linha de ações do `Detalhe`), também no sheet de detalhe da compra.
- **Disponibilidade pelo banco:** ao carregar as ações do card, consulta leve em `est_recebimento` (SELECT authenticated). Snapshot ausente → botão desabilitado com hint exata: "compra antiga — recebida antes do estorno existir; corrija estoque e conta à mão". `estornado_em` preenchido → a compra já está PENDENTE (estado desaparece do card RECEBIDO por natureza).
- **Estados:** loading = skeleton da linha de ações (refetch não refaz layout); error = banner + [Tentar novamente]; success não aparece aqui (a ação conduz ao E2).

## E2 — Modal de confirmação "Estornar recebimento" (bottom-sheet mobile)

```
┌─ Estornar · Mercado Local ───×──┐
│ O QUE VAI ACONTECER             │
│ · estoque e custo dos insumos   │
│   voltam ao estado de ANTES do  │
│   recebimento                   │
│ · a conta a pagar R$ 70,00      │
│   fica CANCELADA no Financeiro  │
│ · a compra volta para PENDENTE  │
│ · o extrato registra a saída    │
│   "Estorno" (nada é apagado)    │
│ [  Estornar recebimento     ]   │
│ [  Manter como está         ]   │
└─────────────────────────────────┘
```

- Rótulos secos, grounded; lista em 4 itens; nada de jargão ("restauração exata" não entra na tela).
- **Loading:** botão vira ["Estornando…"] desabilitado.
- **Error** (RPC devolve `detail`): banda **NÃO ESTORNA** com o motivo em linguagem do dia, acima das ações — ex.: "O insumo 'Limão' tem movimentação depois do recebimento (produção, venda ou outra compra) — estorne em ordem, do mais recente para o mais antigo." / "A conta desta compra já foi paga — resolva no Financeiro primeiro."
- **Success:** banda "✓ Estornada — a compra voltou para PENDENTE. Corrija os itens e receba de novo, ou cancele." + card volta ao estado PENDENTE no refetch.
- **Empty:** não aplicável (modal abre só sobre uma compra RECEBIDO existente).
- Sem `window.confirm` — modal próprio, alvos ≥ 40px, `aria` completo.

## E3 — Fluxo fechado pós-estorno (o circuito de teste do fundador)

compra errada RECEBIDO → Estornar → confirmar → **PENDENTE de novo** → 2 caminhos, ambos já existentes: corrigir e receber de novo (banco novo de snapshot) · Cancelar (compra some da operação mantendo trilha). Nenhum conceito novo: o estorno reaproveita os dois caminhos que a operação já domina.
