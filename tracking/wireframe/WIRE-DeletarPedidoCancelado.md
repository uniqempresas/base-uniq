# WIRE — Excluir pedido cancelado

> **Pipeline SDD · etapa 3 de 3.** Irmãos: `PRD-DeletarPedidoCancelado.md` · `SPEC-DeletarPedidoCancelado.md`.
> **Item 4** do lote de 17/09/2026.
> ⚠️ **REGRA DE OURO:** sem este WIRE aprovado pelo fundador, **não se escreve código de tela**.

**Regra que atravessa todo o WIRE:** a ação **só existe em pedido com status `Cancelado`**. Em qualquer outro status, o botão **não é renderizado** — não fica desabilitado, **não existe**.

---

## 1. DETALHE DO PEDIDO — desktop

`/vendas/pedidos/:id` · pedido **cancelado** (é o único caso em que a ação aparece)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ← Voltar                                                                 │
│                                                                           │
│  Pedido #1042                                        [Imprimir]           │
│  Henriq Silva · 17/09/2026                            ┌─────────────────┐  │
│  ❌ Cancelado                                         │ Atualizar status│  │
│                                                       ├─────────────────┤  │
│                                                       │ Excluir pedido  │  │
│                                                       └─────────────────┘  │
│                                                              ↑ NOVO        │
│                                                          (vermelho,        │
│                                                           destrutivo)      │
├──────────────────────────────────────────────────────────────────────────┤
│  ⚠️  Motivo do cancelamento: "cliente desistiu"                           │
├──────────────────────────────────────────────────────────────────────────┤
│  ITENS                                                                    │
│  · 2× Surpresa de Uva                          R$ 16,00                   │
│                                                                           │
│  PAGAMENTO                                                                │
│  PIX · Pendente                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

**Ordem dos botões:** "Atualizar status" (neutro) e **"Excluir pedido"** (destrutivo, vermelho). O destrutivo **sempre por último**, para não ficar na posição do clique reflexo.

---

## 2. DETALHE DO PEDIDO — mobile

Mesmo padrão já usado nas ações do pedido (`d7a554e`): linha própria **abaixo do título**, com `flex-wrap`.

```
┌───────────────────────────────┐
│  ← Voltar                     │
│                               │
│  Pedido #1042                 │
│  Henriq Silva · 17/09/2026    │
│  ❌ Cancelado                  │
│                               │
│  ┌───────────────┐ ┌────────┐ │
│  │Atualizar status│ │Imprimir│ │
│  └───────────────┘ └────────┘ │
│  ┌───────────────────────────┐│
│  │   🗑  Excluir pedido      ││  ← linha própria, largura
│  └───────────────────────────┘│    confortável para o toque
│                               │
├───────────────────────────────┤
│  ITENS                        │
│  · 2× Surpresa de Uva         │
│                        R$ 16  │
└───────────────────────────────┘
```

---

## 3. LISTA DE PEDIDOS — ação por pedido

`/vendas/pedidos` · o ícone de lixeira **só aparece** nas linhas/cards de pedido cancelado.

### 3.1 Visão TABELA (desktop)

```
┌──────────┬───────────────┬────────────┬──────────┬─────────────┬──────────┐
│ Pedido   │ Cliente       │ Status     │ Canal    │ Pagamento   │ Ações    │
├──────────┼───────────────┼────────────┼──────────┼─────────────┼──────────┤
│ #1042    │ Henriq Silva  │ ❌ Cancelado│ Manual   │ Pendente    │ 🗑  👁    │
│ #1041    │ Thamires      │ 📩 Confirmado│ WhatsApp│ PIX         │      👁    │
│ #1040    │ Luan          │ 📦 Em Separação│ Manual │ PIX        │      👁    │
└──────────┴───────────────┴────────────┴──────────┴─────────────┴──────────┘
       ↑ lixeira só na linha cancelada        ↑ nas outras, só o "ver"
```

### 3.2 Visão CARD (mobile)

```
┌─────────────────────────────┐
│ #1042          ❌ Cancelado  │
│ Henriq Silva                │
│ Manual · Pendente · R$ 16   │
│                    🗑   👁   │  ← 🗑 só em pedido cancelado
└─────────────────────────────┘
```

**Acessibilidade:** `aria-label="Excluir pedido 1042"` (não só o ícone). Alvo de toque ≥ 36px.

---

## 4. MODAL DE CONFIRMAÇÃO — desktop

```
        ┌──────────────────────────────────────────────────────┐
        │  Excluir pedido?                                  [X] │
        ├──────────────────────────────────────────────────────┤
        │                                                       │
        │  Pedido #1042 — Henriq Silva                          │
        │                                                       │
        │  ┌─────────────────────────────────────────────────┐  │
        │  │  O que vai acontecer                            │  │
        │  │                                                  │  │
        │  │  • O pedido sai da lista e dos relatórios        │  │
        │  │  • O histórico do pedido é preservado            │  │
        │  │  • O estoque dos itens será devolvido            │  │  ← só aparece
        │  │  • Esta ação não pode ser desfeita pela tela     │  │    quando há conta
        │  └─────────────────────────────────────────────────┘  │    a receber vinculada
        │                                                       │
        │  Motivo (opcional)                                    │
        │  ┌─────────────────────────────────────────────────┐  │
        │  │ ex.: pedido de teste                            │  │
        │  └─────────────────────────────────────────────────┘  │
        │                                                       │
        │                              [ Cancelar ] [🗑 Excluir pedido] │
        └──────────────────────────────────────────────────────┘
                                                    ↑ destrutivo, vermelho
```

**Sem conta a receber vinculada:** a linha "O estoque dos itens será devolvido" **não aparece** — prometer o que não vai acontecer é pior que não avisar.

---

## 5. MODAL DE CONFIRMAÇÃO — mobile (bottom-sheet)

Segue o padrão dos modais de status/rastreio/contabilizar: `rounded-t-3xl` + handle visual, botões empilhados com **Confirmar em cima**.

```
        ┌───────────────────────────────────┐
        │              ━━━                  │  ← handle
        │                                   │
        │  Excluir pedido?                  │
        │                                   │
        │  Pedido #1042 — Henriq Silva      │
        │                                   │
        │  ┌─────────────────────────────┐  │
        │  │ O que vai acontecer          │  │
        │  │ • Sai da lista e relatórios  │  │
        │  │ • O histórico é preservado   │  │
        │  │ • O estoque será devolvido   │  │
        │  │ • Não pode ser desfeito      │  │
        │  └─────────────────────────────┘  │
        │                                   │
        │  Motivo (opcional)                │
        │  ┌─────────────────────────────┐  │
        │  │                             │  │
        │  └─────────────────────────────┘  │
        │                                   │
        │  ┌─────────────────────────────┐  │
        │  │     🗑  Excluir pedido       │  │  ← CONFIRMAR em cima
        │  └─────────────────────────────┘  │     (largura total)
        │  ┌─────────────────────────────┐  │
        │  │          Cancelar            │  │
        │  └─────────────────────────────┘  │
        └───────────────────────────────────┘
```

---

## 6. ESTADOS

### 6.1 Carregando (RPC em voo)

```
        ┌──────────────────────────────────────┐
        │  Excluir pedido?                  [X] │
        ├──────────────────────────────────────┤
        │  Pedido #1042 — Henriq Silva          │
        │  ...                                  │
        │                    [ Cancelar ] [◌ Excluindo…] │
        └──────────────────────────────────────┘
                          ↑ spinner (Loader2) + botão desabilitado
```

### 6.2 Erro — o modal **NÃO fecha**

```
        ┌──────────────────────────────────────┐
        │  Excluir pedido?                  [X] │
        ├──────────────────────────────────────┤
        │  Pedido #1042 — Henriq Silva          │
        │                                       │
        │  ┌─────────────────────────────────┐  │
        │  │ ⚠️ Este pedido tem pagamento     │  │  ← mensagem vinda do
        │  │    registrado. Excluir apagaria  │  │    banco (code =
        │  │    dinheiro que entrou de verdade│  │    PAGAMENTO_REGISTRADO)
        │  └─────────────────────────────────┘  │
        │                                       │
        │                    [ Cancelar ] [🗑 Excluir pedido] │
        └──────────────────────────────────────┘
```

**Regra:** a mensagem de erro vem do **banco** (via `code`), exibida **dentro do modal**. Não é só um toast — o usuário precisa entender *por que* não pode.

| `code` | Mensagem mostrada |
|---|---|
| `STATUS_INVALIDO` | "Só é possível excluir pedido com status **Cancelado**." |
| `PAGAMENTO_REGISTRADO` | "Este pedido tem pagamento registrado. Excluir apagaria dinheiro que entrou de verdade." |
| `JA_EXCLUIDO` | "Este pedido já foi excluído." |
| `NAO_ENCONTRADO` | "Pedido não encontrado." |
| outro | mensagem do banco + "Tente novamente." |

### 6.3 Sucesso

```
   ┌──────────────────────────────────────┐
   │ ✅ Pedido excluído com sucesso!       │   ← toast
   └──────────────────────────────────────┘
```

- **Na lista:** modal fecha → toast → a linha **desaparece** da lista.
- **No detalhe:** modal fecha → toast → volta para `/vendas/pedidos`.
- **Se era o último pedido:** cai no **empty state** já existente da lista (não inventar tela nova).

---

## 7. O QUE **NÃO** DEVE APARECER (guarda contra regressão)

| Situação | Comportamento correto |
|---|---|
| Pedido `Aguardando` / `Recebido` / `Confirmado` / `Em Separação` / `Enviado` / `Entregue` | **Nenhum** botão de excluir |
| Pedido cancelado **com pagamento** | Botão existe, mas o banco **bloqueia** com mensagem clara |
| Barra de seleção em massa da lista | **Nenhuma** ação de excluir (fora de escopo) |
| Tela de "lixeira" / restaurar | **Não existe** (fora de escopo) |

---

## 8. Pontos de aprovação para o fundador

1. **Onde o botão aparece:** detalhe **e** lista — confirma? (D4)
2. **Só em pedido cancelado**, sem exceção — confirma?
3. **Pedido cancelado com pagamento registrado é bloqueado** — confirma? (D2)
4. **O aviso "O estoque será devolvido" só aparece quando houver estoque a devolver** — confirma? (regra R5 do PRD)
5. **Campo de motivo opcional** no modal — quer manter, ou prefere sem?
6. **Vermelho/destrutivo** como cor da ação — confirma?

---

*WIRE criado em 17/09/2026 pelo Orchestrator. **Aguardando aprovação do fundador** para iniciar a implementação.*
