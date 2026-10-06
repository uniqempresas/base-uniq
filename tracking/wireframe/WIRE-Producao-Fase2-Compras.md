# WIRE — Produção Fase 2: Compras + Custo Médio + Conta a Pagar

**Versão:** 1.0
**Data:** 06/10/2026
**Status:** Em revisão — aguardando aprovação do fundador (GitHub)
**Telas:** `/estoque/compras` (nova) · `/estoque/produtos/[novo/editar insumo]` (extensão do modal existente)
**Referências:** `tracking/plans/PRD-Producao-BOM-Fase2-ComprasCusto.md` · `tracking/specs/SPEC-Producao-BOM-Fase2-ComprasCusto.md`

---

## 1. Roteamento

| Rota | Tela | Acesso |
|---|---|---|
| `/estoque/compras` | ComprasPage (NOVA) | Rail Estoque → item "Compras" |
| `/estoque/produtos` | ProdutoFormModal — novo grupo "Compra e conversão" (só insumo) | fluxo atual |

Não criamos rota nova além de `/estoque/compras`. Modais não têm rota.

---

## 2. Tela `/estoque/compras` — ComprasPage (NOVA)

### 2.1 Layout Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ — rail ativo: Estoque]                                 │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Compras                                          [+ Nova Compra] │ │
│ │ 2 compras em aberto · R$ 480,00 a pagar                          │ │
│ ├──────────────────────────────────────────────────────────────────┤ │
│ │ ┌ Em aberto ────┐ ┌ Recebido no mês ┐ ┌ Comprar em breve ─────┐  │ │
│ │ │ 2 · R$ 480,00 │ │ R$ 1.190,00    │ │ 3 itens abaixo do min │  │ │
│ │ └───────────────┘ └────────────────┘ └───────────────────────┘  │ │
│ ├──────────────────────────────────────────────────────────────────┤ │
│ │ [🔍 Buscar compra...]   [Status ▼]    [Todos | Pendente | Rec.]  │ │
│ ├──────────────────────────────────────────────────────────────────┤ │
│ │ Data        Fornecedor      NF         Valor     Status    Ação  │ │
│ │ 06/10/26    Chocolate Bela  1042     R$ 58,00   PENDENTE [•Receber][⋮] │ │
│ │ 05/10/26     Mercado Local  —        R$ 1.190,00 RECEBIDO [⋮]      │ │
│ │ ──────────────────────────────────────────────────────────────── │ │
│ │ (empty: "Nenhuma compra ainda — registre a primeira acima")      │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Layout Mobile

```
┌──────────────────────────────┐
│ Compras            [+ Nova]  │
│ Em aberto: 2 · R$ 480,00     │
├──────────────────────────────┤
│ [🔍 Buscar...] [Status ▼]    │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Chocolate Bela Suplimentos│ │
│ │ NF 1042 · 06/10          │ │
│ │ R$ 58,00 · 3 itens       │ │
│ │ [● PENDENTE]             │ │
│ │ [Receber] [Detalhes]     │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Mercado Local            │ │
│ │ 05/10 · R$ 1.190,00      │ │
│ │ [✓ RECEBIDO]             │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### 2.3 Modal "Nova Compra"

```
┌─ Nova Compra ──────────────────────── [X] ─┐
│ FORNECEDOR                                 │
│ [🔍 Selecionar fornecedor ▼]  *            │
│ Sem fornecedor? → [Cadastrar agora]        │
│ ─────────────────────────────────────────  │
│ NOTA FISCAL (opcional)                     │
│ [ 1042                  ]                  │
│ ─────────────────────────────────────────  │
│ INSUMOS COMPRADOS                          │
│ [🔍 Buscar insumo...]                      │
│ ┌────────────────────────────────────────┐ │
│ │ Chocolate Meio Amargo           [vg]   │ │
│ │ Comprar [2  ] (dgv hig) a R$ [25,00]   │ │
│ │ = 2.000 g ao estoque · subtotal R$ 50  │ │
│ │                               [Remover] │ │
│ └────────────────────────────────────────┘ │
│ [+ Adicionar outro insumo]                 │
│ ─────────────────────────────────────────  │
│ TOTAL: R$ 50,00                            │
│ [   Salvar compra (pendente)   ]           │
└────────────────────────────────────────────┘
```
Toast de sucesso: "Compra registrada — aguardando recebimento".

### 2.4 Modal "Receber compra"

```
┌─ Receber compra — Chocolate Bela ──────┐
│ Entrará no estoque:                    │
│ · Chocolate +2.000 g                   │
│ · Custo médio recalc. (auto)           │
│                                        │
│ Data de recebimento *                  │
│ [ 06/10/2026 ]                         │
│ Vencimento da conta a pagar *          │
│ [ 05/11/2026 ]                         │
│                                        │
│ Ao receber: 1 conta a pagar de         │
│ R$ 58,00 nasce no Financeiro.          │
│ ────────────────────────────────────── │
│ (recebida → toast com custo uniforme)  │
└────────────────────────────────────────┘
```

### 2.5 Componentes

| Elemento | Descrição |
|---|---|
| Card KPI | 3 cards: em aberto, recebido no mês, comprar em breve |
| Table | Lista de compras (desktop) — colunas Data/Fornecedor/NF/Valor/Itens/Status |
| Badge status | `PENDENTE` (âmbar) · `RECEBIDO` (verde) · `CANCELADO` (cinza/nascimento) |
| Dialog Nova | Form de compra com fornecedor + itens + total em tempo real |
| Dialog Receber | Form com data de recebimento e vencimento da conta |
| Sheet mobile | Ações (Receber/Cancelar/Detalhe) via BottomSheet padrão financeiro |

### 2.6 Campos

| Campo | Tipo | Validação |
|---|---|---|
| fornecedor | Select (busca) | obrigatório (D10) |
| nota_fiscal | text | opcional |
| quantidade (item) | number | > 0 (na unidade de compra) |
| valor_unitário (item) | number (moeda) | ≥ 0, formato R$ |
| data_recebimento | date | default hoje, não pode ser < data da compra |
| data_vencimento | date | default +30 dias, obrigatório |
| unidade_compra (produto) | text | opcional; se preenchida, exige fator |
| fator_conversão (produto) | number | > 0; obrigatório se unidade_compra |

### 2.7 Ações

| Ação | Gatilho | Resultado |
|---|---|---|
| Nova compra | botão/header | Dialog Nova — salva `PENDENTE` (não mexe estoque/custo) |
| Receber | linha PENDENTE → [Receber] | Dialog Receber → RPC `receber_compra`: estoque sobe + custo médio + movimentação + conta a pagar = RECEBIDO |
| Cancelar | [⋮] compra PENDENTE | Confirm → status CANCELADO (nada movimenta) |
| Detalhe | linha/canov | Sheet mobile com itens, valores e conversões |
| Cadastrar fornecedor | empty do select | Redireciona para módulo fornecedores |

### 2.8 Estados

- **Loading:** skeleton do layout (cards + tabela/cards perdidos) — sem blik (padrão pós-HOTFIX: refetch não refaz o layout)
- **Empty:** "Nenhuma compra ainda — registre a primeira compra de insumo"
- **Error:** "Erro ao carregar compras" + [Tentar novamente] (recarregar)
- **Success:** lista real do banco · isFallback → banner "dados de exemplo" demarcado
- **Idempotência:** comprar já recebida → toast de erro claro, nada muda

### 2.9 Fluxo de Navegação

```
Produtos/Estoque ──► Compras ──► Nova Compra (Dialog)
                         │
                         ├─► Receber (Dialog → RPC → toast) ──► Financeiro (conta criada)
                         └─► Cancelar (Confirm)
```

---

## 3. Extensão do ProdutoFormModal — grupo "Compra e conversão"

### 3.1 Posição
Step 1 (Informações), ABAIXO do bloco "Natureza". **Só aparece quando natureza = Insumo.**

```
┌─ Compra e conversão ───────────────────────┐
│ No estoque este insumo é contado em "g".   │
│                                            │
│ Compra por     [ kg        ]   (text)      │
│ 1 unidade equivale a [ 1000 ] do estoque   │
│                                            │
│ Ex.: compra barras de 1 kg → digitaes "2"  │
│ na compra e o sistema soma 2.000 g no      │
│ estoque.                                   │
│ (vazio = compra já é na unidade estoque)   │
└────────────────────────────────────────────┘
```

---

## 4. Responsividade

- Desktop: tabela + 3 cards KPI abertos · Tablet: cards empilham 2×2, tabela mantém
- Mobile (uso principal): cards KPI 1 coluna, lista de compras em cards, formulários em BottomSheet/Dialog full-width, inputs numéricos grandes (dedo).

## 5. Acessibilidade

- Labels vinculados a todos os inputs de dialog
- Tabela: cabeçalhos com scopo; linha clicável com aba de ações acessível
- Dialog/Sheet: focus trap · `aria-modal` · Esc fecha · toast via região `aria-live`
- Status badge com `role="status"` + texto (não só cor)

## 6. Componentes Reutilizáveis

| Componente | De onde | Props usadas |
|---|---|---|
| `ProdutoFormModal` (steps) | do módulo `produto` | extensão de grupo no step 1 |
| `BottomSheet`, `campoFormSheet`, `SheetActions` | `components/financeiro/components.tsx` | padrão ContasPagarPage |
| Busca client-side sobre `useProdutos` | mesma da Ficha Técnica (Fase 1) | filtro: só `natureza='insumo'` |
| `getTagPalette` / badges | `hooks/use-tags` | sem hex novo |
