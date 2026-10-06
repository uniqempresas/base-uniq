# WIRE — Estoque B14: Movimentações Reais

**Versão:** 1.0
**Data:** 06/10/2026
**Status:** Pronto para Implementação (aguardando aprovação do fundador)
**Telas:** `/estoque/movimentacoes` · `/estoque/dashboard` (seção) · `/estoque/produtos/:id` (aba)
**Referências:** `PRD-Estoque-B14-MovimentacoesReais.md` · `SPEC-Estoque-B14-MovimentacoesReais.md`

> Tela **adaptada** (não nova): a estrutura atual de `/estoque/movimentacoes` é mantida — o que muda é a **fonte dos dados** (mock → banco) e o modal, que passa a gravar. Sem rota nova.

---

## 1. Roteamento

| Rota | Tela | Acesso |
|---|---|---|
| `/estoque/movimentacoes` | Extrato de movimentações (real) | Existe hoje (lazy) |
| `/estoque/dashboard` | Seção "Movimentações recentes" (real) | Existe hoje (lazy) |
| `/estoque/produtos/:id` | Aba "Movimentações" (real) | Existe hoje (lazy) |

## 2. `/estoque/movimentacoes` — Extrato

### Layout Desktop

```
┌───────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]  Movimentações de Estoque              [+ Nova Movim.] │
│                 ──────────────────────────────────────                │
│  ┌ Resumo do período ──────────────────────────────────────────────┐  │
│  │  Entradas: 12 un (3 ev)   Saídas: 8 un (2 ev)   Saldo: +4 un    │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  [🔍 Buscar produto…]  [Tipo ▼ Todas|Entradas|Saídas]  [Período ▼]   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Produto            Tipo      Qtd   Motivo     Quando     Resp.  │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │ Cone Trufado       Entrada   +10   Compra      06/10 14:32  [MS] │
│  │   TRF-001                                                       │  │
│  │ Surpresa de Uva    Saída      −2   Quebra      05/10 09:10   —   │  │
│  │   SRP-002                                                       │  │
│  │  … (scroll)                                                     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

### Layout Mobile

```
┌──────────────────────────────┐
│ ← Movimentações        [+]   │
├──────────────────────────────┤
│ Entradas 12 · Saídas 8 · +4  │  ← resumo em 1 linha
├──────────────────────────────┤
│ [🔍 Buscar…]  [Tipo ▼] [📅]  │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Cone Trufado      ENTRADA│ │
│ │ +10 · Compra             │ │
│ │ 06/10 14:32 · Melissa    │ │
│ │ obs: reposição semanal   │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Surpresa de Uva    SAÍDA │ │
│ │ −2 · Quebra              │ │
│ │ 05/10 09:10 · —          │ │
│ └──────────────────────────┘ │
│  … (scroll)                  │
└──────────────────────────────┘
```

### Componentes

| Elemento | Descrição |
|---|---|
| Resumo do período | 3 números derivados da lista **filtrada**: unidades de entrada, de saída, saldo (+/−). Sem valor em R$ (não inventar custo) |
| Busca | Filtra por nome/SKU do produto (client-side) |
| Tipo ▼ | Todas / Entradas / Saídas (chips ou select, padrão Pedidos) |
| Período ▼ | Hoje · 7 dias · 30 dias · Este mês (client-side sobre `data_movimentacao`) |
| Tabela / Cards | Desktop tabela; mobile cards. Colunas: produto (nome + SKU), tipo (badge Entrada verde / Saída vermelha — cores do `DESIGN.md`), quantidade com sinal, motivo, quando (`data_movimentacao` formatada date-fns), responsável (iniciais ou "—") |
| [+ Nova Movim.] | Abre o modal (§2.1) |
| Observação | Linha discreta no card/tooltip quando existir |

### Campos (modal Nova Entrada/Saída)

| Campo | Tipo | Validação |
|---|---|---|
| Produto | busca (client-side sobre `useProdutos`) — nome + SKU | obrigatório |
| Tipo | Entrada / Saída (chips) | obrigatório, default Entrada |
| Quantidade | number | inteiro > 0; Saída ≤ estoque atual do produto (mensagem atual do modal do detalhe) |
| Motivo | chips (Entrada: Compra, Devolução, Ajuste, Produção, Inventário, Outro · Saída: Venda, Ajuste, Perda, Quebra, Doação, Outro) | obrigatório |
| Observação | textarea, opcional | máx ~500 chars |

### Ações

| Ação | Gatilho | Resultado |
|---|---|---|
| Nova movimentação | clique em [+] | Modal abre (produto limpo, tipo Entrada) |
| Confirmar | submit válido | **Ordem do banco: 1º UPDATE `me_produto.estoque_atual` (valor absoluto) → 2º INSERT `est_movimentacao`** (tipo minúsculo, observação gravada). Toast sucesso; lista recarrega; modal fecha. Falha no INSERT → mensagem *"Estoque atualizado, mas não foi possível registrar o histórico…"* |
| Erro de validação | submit inválido | Mensagem inline no modal (padrão atual) |
| Cancelar | botão/ESC/fora | Fecha sem gravar |

**Sem botão "Cancelar" por linha** (decisão D4 — reverter estoque é feature futura; botão morto não volta).

### Estados

| Estado | Apresentação |
|---|---|
| Loading | Skeleton de linhas/cards (padrão do módulo) |
| Empty **real** (sessão, 0 registros) | *"Nenhuma movimentação registrada ainda — use Nova Entrada/Saída ou o ajuste no detalhe do produto."* + botão para o modal |
| Empty filtrado | *"Nenhuma movimentação para os filtros atuais."* |
| Error | Banner de erro + botão "Tentar novamente" |
| Success (demo, sem sessão) | Mock atual + banner de fallback existente (mock-first) |

### Fluxo

```
Extrato ──[+]──► Modal ──confirmar──► UPDATE estoque → INSERT movimentação ──► Extrato atualizado
   ▲                                                                              │
   └────────────────────────────── recarregar() ◄────────────────────────────────┘
```

## 3. `/estoque/dashboard` — seção "Movimentações recentes"

Mesma estrutura visual atual; fonte passa a ser o hook real (5 mais recentes por `data_movimentacao`). Empty real quando 0 (*"Sem movimentações ainda"*). Demo mantém mock. **Gráficos permanecem como estão** (fora de escopo).

## 4. `/estoque/produtos/:id` — aba Movimentações

Mesma estrutura atual; fonte = hook com `produtoId`. Real quando sessão (vazio real se nunca movimentado), mock no demo. O modal "Ajustar Estoque" passa a gravar a **Observação** (N10) e usa o mesmo hook de escrita do modal da extrato.

## 5. Responsividade

Desktop tabela 6 colunas → tablet 2 colunas de cards → mobile 1 coluna de cards (padrão do módulo, replicado de `/estoque/produtos`). Modal vira bottom-sheet no mobile (`rounded-t-3xl` + handle, padrão Financeiro/Pedidos).

## 6. Acessibilidade

- Modal: foco preso ao abrir, ESC fecha, labels em todos os campos, `role="dialog"` + `aria-modal`.
- Tabela: `aria-label` nos botões de ação; badges com texto (não só cor).
- Chips de tipo/motivo: `aria-pressed` no selecionado; navegação por teclado.
- Cards mobile: produto nome como heading (`h3`).

## 7. Componentes reutilizáveis

| Componente | Props | Uso |
|---|---|---|
| `AjustarEstoqueModal` (refatorado) | `produto?`, `produtos?`, `onClose`, `onSuccess` | Detalhe do produto (produto fixo) e extrato (busca de produto) — mesmo modal, modo por props |
| `useMovimentacoes` | `{ produtoId? }` | Extrato, dashboard, detalhe |
| `useRegistrarMovimentacao` | payload | Ambos os modais |

> **Decisão de implementação:** UM modal compartilhado (o do detalhe é o mesmo componente; no extrato recebe a lista de produtos para busca). Evita dois formulários com regras que divergem.
