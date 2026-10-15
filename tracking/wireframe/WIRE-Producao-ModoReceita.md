# WIRE — Produção: Modo Receita (Ficha + Produzir Lote)

**Versão:** 1.0
**Data:** 14/10/2026
**Status:** Pronto para Implementação (aguardando aprovação do fundador)
**Telas:** `/estoque/produtos/:id` (aba **Produção**) · `/estoque/produtos` (form de produto → step **Ficha Técnica**)
**Referências:** `tracking/plans/PRD-Producao-ModoReceita.md` · `tracking/specs/SPEC-Producao-ModoReceita.md`

> **Tela adaptada** (não nova): aba Produção e step Ficha Técnica já existem. O que muda é a **unidade de leitura/edição** quando o composto é **em massa** (g/ml) e tem `rendimento_lote` preenchido. Sem rota nova.

---

## 1. Roteamento

| Rota | Tela | Acesso |
|---|---|---|
| `/estoque/produtos/:id` → aba Produção | Ficha em modo receita + "Produzir lote" | Existe hoje (lazy) |
| `/estoque/produtos` → form (step Ficha Técnica) | Edição por receita + campo "rende" | Existe hoje |

## 2. Aba Produção — modo receita (`rendimento_lote` preenchido)

### Layout Desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]  Recheio de Limão · composto                              │
│ ─ Tabs: Ficha Técnica · [Produção] · Movimentações ─                    │
│                                                                          │
│  Receita · rende ~695 g                                                  │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ Leite Condensado    395 g   5% perda   [custo ✓]      │  │
│  │ Creme de Leite      300 g   5% perda   [custo ✓]      │  │
│  │ Limão                        4   —        [custo ✓]      │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ Custo por receita: R$ 13,67  ·  Custo por g: R$ 0,0197            │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                              [ Produzir lote ]           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Layout Mobile

```
┌──────────────────────────────┐
│ ← Recheio de Limão           │
│ [Ficha] [Produção] [Mov]     │
├───────────────────────────────┤
│ Receita · rende ~695 g       │
│ ┌────────────────────────────┐ │
│ │ Leite Condensado  395 g 5% │ │
│ │ Creme de Leite    300 g 5% │ │
│ │ Limão                  4 — │ │
│ ├────────────────────────────┤ │
│ │ Receita: R$ 13,67          │ │
│ │ Por g: R$ 0,0197           │ │
│ └────────────────────────────┘ │
│        [ Produzir lote ]       │
└───────────────────────────────┘
```

### Componentes

| Elemento | Descrição |
|---|---|
| Cabeçalho "Receita · rende ~695 g" | Nv. modo receita: `formatarQtd(rendimento_lote)` + unidade do produto. Nunca mostra `0,568345`. |
| Linhas de componente | Quantidade **por receita** (`toReceita`), arredondada 2 casas, com unidade do componente e perda %. Badge "custo pendente" quando `preco_custo = 0`: texto **"custo pendente de produção"** (composto) / "custo pendente de compra" (insumo). |
| Custo por receita / por g | `custoPorUn × rendimento` e o custo/un atual. Sem custo apurado → em "—" com o mesmo badge. |

### Campos (modal Produzir lote — modo receita)

| Campo | Tipo | Validação |
|---|---|---|
| Modo | chips `1 receita` / `695 g` (aria-pressed) | default `1 receita` |
| Quantidade | number | > 0 (decimal ok); o semáforo do modal indica seu estoque alcança o lote |

### Ações

| Ação | Gatilho | Resultado |
|---|---|---|
| Produzir | submit válido | Conversão front: `qtd_g = modo === 'receita' ? qtd × rendimento : qtd` → RPC `registrar_producao` (intocada, recebe g). Toast sucesso; histórico de OPs e extrato atualizam. |
| Alternar modo | clique no chip | Input mesma quantidade coerente (máx info: `1 receita ≈ 695 g`). |
| Lote insuficiente | RPC recusa | Mensagem nominal com o insumo que falta; nada muda (all-or-nothing). |

### Estados (toda a aba)

Loading (skeleton) · empty (composto nunca produzido → "Produza a primeira vez para apurar custo") · error + retry · success. Sem `rendimento_lote`: tudo como hoje.

## 3. Step Ficha Técnica no form (`components/produto/ProdutoFormModal.tsx`)

```
┌─ Ficha Técnica ─────────────────────────────────────────────────┐
│ Essa receita rende [ 695 ] g        (opcional — g/ml p/ composto)│
│ ─ em modo receita ──────────────────────────────────────────────│
│ Leite Condensado [ 395 ] g  perda [5]%   🔍 trocar              │
│ Creme de Leite   [ 300 ] g  perda [5]%   🔍 trocar              │
│ Limão                [ 4 ]    perda [0]%   🔍 trocar              │
│ (salvar → app grava por-grama: 0,568345 / 0,431655 / 0,005755)  │
└─────────────────────────────────────────────────────────────────┘
```

- Campo **"Essa receita rende"**: numeric > 0; limpar → volta ao modo atual (ficha por-grama preservada).
- Com rendimento: edição **por receita**; ao salvar `deReceita(...)`; com 2 casas exibidas (sem quebrar precisão).

## 4. Responsividade · 5. Acessibilidade

- Modal = bottom-sheet no mobile (handle; alvos ≥ 40px) — padrão da aba.
- Chips com `aria-pressed`; labels em todos os campos; `role="dialog"` + `aria-modal`; ESC fecha; badges com texto (não só cor).

## 6. Componentes reutilizáveis

| Componente | Props | Uso |
|---|---|---|
| helpers `toReceita` / `deReceita` / `formatarQtd` | — | Aba, modal e form |
| `ProducaoTab` (extendida) | `produto` (com `rendimentoLote`) | modo receita × modo atual |
| `ProdutoFormModal` (extendido) | produto set | campo "rende" + edição por receita |
