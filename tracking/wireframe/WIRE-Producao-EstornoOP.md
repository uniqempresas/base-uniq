# WIRE — Produção Fase 4a: Estorno de OP

**Versão:** 1.0
**Data:** 2026-10-21
**Status:** Pronto para Implementação *(emenda de 21/10: fundador autorizou implementar sem validação prévia do WIRE — ele valida na Vercel)*
**Telas:** `/estoque/produtos/:id` (aba Produção — `ProducaoTab`)
**Referências:** `tracking/plans/PRD-Producao-EstornoOP.md`, `tracking/specs/SPEC-Producao-EstornoOP.md`, `tracking/ANALISE_ESTOQUE_ESTORNO_OP.md`

---

## 1. Roteamento

| Rota | Tela | Acesso |
|---|---|---|
| `/estoque/produtos/:id?aba=producao` | `ProdutoDetalhePage` → `ProducaoTab` | Já existente — **nenhuma rota nova** |

---

## 2. Aba Produção — histórico de OPs com ações

### Layout Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ← Produto: Ganache Meio Amargo     [Simples|Composto|…]  │ │
│ │ [Visão Geral] [Ficha Técnica] [Produção] [Movimentações] │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │  (T5 card "Com o estoque atual" — INTACTO)               │ │
│ │  (Custo por unidade produzida + [⚙ Produzir lote])       │ │
│ │  (Consumo por 1 un — INTACTO)                            │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ 🕘 Histórico de produção                                 │ │
│ │ 3 ordens registradas                                     │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ 21/10/26  lote 500 un      R$ 112,50  (R$ 0,225/un)      │ │
│ │         forninho elétrico                                │ │
│ │                                          [Estornar][↺Corrigir] │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ 20/10/26  lote 300 un      R$ 71,40   (R$ 0,238/un)      │ │
│ │         ⚠ Estornada em 21/10/26  (linha apagada)         │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ 19/10/26  lote 200 un      R$ 46,00   (R$ 0,230/un)      │ │
│ │                                          [Estornar][↺Corrigir] │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Layout Mobile

```
┌─────────────────────────────┐
│ ← Ganache Meio Amargo       │
│ [Visão][Ficha][Produção][…] │
├─────────────────────────────┤
│ 🕘 Histórico de produção    │
│ 3 ordens registradas        │
├─────────────────────────────┤
│ 21/10/26                    │
│ lote 500 un     R$ 112,50   │
│ (R$ 0,225/un)               │
│ forninho elétrico           │
│ [  Estornar  ] [ ↺ Corrigir ]│
├─────────────────────────────┤
│ 20/10/26                    │
│ lote 300 un      R$ 71,40   │
│ ⚠ Estornada em 21/10/26     │
│ (linha apagada, sem ações)  │
└─────────────────────────────┘
```

### Componentes

| Elemento | Descrição |
|---|---|
| Linha de OP (`ATIVA`) | data · lote · custo total · custo/un · observação · ações `[Estornar]` `[↺ Corrigir]` (secundárias, quiet, mesma linha no desktop / empilhadas full-width no mobile) |
| Linha de OP (`ESTORNADA`) | badge "Estornada em dd/MM/yy" · linha apagada (opacity reduzida) · **sem ações** |
| Modal "Estornar produção" | BottomSheet (padrão do estorno de compra) — E3 |
| Badge `Estornada` | Badge texto; nunca depende de cor sozinha (há o texto "Estornada") |

### Ações

| Ação | Gatilho | Resultado |
|---|---|---|
| Estornar | toque em `[Estornar]` numa linha ATIVA | abre modal E3 |
| Corrigir produção | toque em `[↺ Corrigir]` numa linha ATIVA | executa o estorno (mesma RPC, **sem** modal — a intenção já é explícita no rótulo) → E4 |
| Produzir lote | botão existente | intacto; ganha prop opcional `loteInicial` (E4) |

### Estados

- **loading:** skeleton atual da lista (intacto); ações não aparecem antes da 1ª carga.
- **empty:** "Nenhuma produção ainda…" (intacto).
- **error:** mensagem + [Tentar novamente] (intacto).
- **success:** lista com ações; OP ESTORNADA permanece listada com badge.
- **durante o estorno:** botões da linha desabilitados + spinner no acionado (nenhuma outra linha é bloqueada).

### Fluxo de Navegação

```
linha ATIVA ──[Estornar]──▶ E3 modal ──confirmar──▶ RPC estornar_producao
                                    ◀──Manter como está          │
        ┌────────────────────────────────────────────────────────┤
        ▼ success                                                ▼ detail=erro
 toast + refetch (linha vira ESTORNADA)              banda legível dentro do modal

linha ATIVA ──[↺ Corrigir]──▶ RPC estornar_producao ──success──▶ E4
                                                    └──erro──▶ toast com a mensagem da RPC
```

---

## 3. E3 — Modal "Estornar produção" (bottom-sheet)

```
┌─ Estornar produção · Ganache ──────×──┐
│ lote 500 un · 21/10/26 · R$ 112,50    │
│                                       │
│ O QUE VAI ACONTECER                   │
│ · os insumos consumidos voltam ao     │
│   estoque (chocolate, creme, …)       │
│ · 500 un de Ganache saem do estoque   │
│ · o extrato registra o estorno —      │
│   nada é apagado                      │
│ · a produção fica marcada como        │
│   "Estornada"                         │
│                                       │
│ [   Estornar produção    ]            │
│ [   Manter como está     ]            │
└───────────────────────────────────────┘
```

- Rótulos secos, sem jargão ("lançamento compensatório" não existe na tela).
- **Loading:** botão vira ["Estornando…"] desabilitado.
- **Error:** banda acima das ações com a mensagem da RPC em linguagem do dia — ex.: "Restam 120 un de Ganache — o lote produzia 500. Parte já foi vendida ou consumida: estorne a venda antes, ou ajuste o estoque manualmente."
- **Success:** toast "Produção estornada — insumos devolvidos ao estoque" + refetch (a linha vira ESTORNADA).
- Sem `window.confirm`; alvos ≥ 40px; `aria` completo; fecha com × ou "Manter como está".

---

## 4. E4 — Corrigir produção (fluxo "amend")

```
[↺ Corrigir] → estorno silencioso →
┌─ Produzir lote — Ganache ───────────×──┐
│ ↩ Produção anterior estornada —        │
│   corrija a ficha (aba Ficha Técnica)  │
│   se o erro era nela, e produza de novo│
│ Quantidade: [500      ] (pré-preench.) │
│ Data: [21/10/2026]                     │
│ (… resto do modal INTACTO …)           │
└────────────────────────────────────────┘
```

- O `ProduzirLoteModal` abre com `loteInicial` = quantidade da OP estornada (prop opcional; ausente = comportamento atual "1").
- Banda informativa no topo do modal (dismissível) orienta o caminho da ficha — nenhum conceito novo.
- Falha do estorno nesse fluxo: toast com a mensagem da RPC; o modal **não** abre.

---

## 5. Responsividade

- Ações da linha: desktop inline à direita → mobile empilhadas full-width (alvos ≥ 44px).
- Modal é BottomSheet no mobile e centralizado no desktop (componente `BottomSheet` já existente no módulo — mesmo do "Receber compra"/"Produzir lote").
- Grid da página: intacto (a mudança é local na lista de histórico).

## 6. Acessibilidade

- `[Estornar]` com `aria-label="Estornar produção de <data>"`; `[↺ Corrigir]` com `aria-label="Corrigir produção de <data>"`.
- Badge ESTORNADA com `role="status"` e texto (nunca só cor).
- Modal: `aria-labelledby`, foco no botão primário ao abrir, Esc fecha (fora do loading), trap de foco (padrão `BottomSheet`).
- Teclado: ações navegáveis por Tab; Enter/Espaço acionam.

## 7. Componentes Reutilizáveis

| Componente | Props novas |
|---|---|
| `useEstornarProducao` (hook novo) | `estornar({ ordemId }) → { success, error?, detail? }` · `loading` · `error` |
| `ProduzirLoteModal` (existente) | `loteInicial?: string` (opcional — default mantém "1") |
| `BottomSheet`, `SheetActions`, botões sheet (existentes) | — |

---

### Checklist de handoff (skill wire §11)

- [x] Rotas listadas (nenhuma nova) · [x] Desktop + mobile desenhados · [x] 4 estados em cada lista/modal · [x] Ações com gatilho + resultado · [x] Responsividade descrita · [x] Acessibilidade citada · [x] Sem token de cor inventado · [x] Sem código.
