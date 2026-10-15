# SPEC — Produção: Modo Receita

**Data:** 14/10/2026 · **PRD:** `tracking/plans/PRD-Producao-ModoReceita.md` · **WIRE:** `tracking/wireframe/WIRE-Producao-ModoReceita.md`
**Status:** pronto para implementação (aguardando aprovação do WIRE pelo fundador)

## 1. Banco (via MCP pelo ORQUESTRADOR — não pelo fixer)

Migration `producao_modo_receita_rendimento`:
- `ALTER TABLE me_produto ADD COLUMN IF NOT EXISTS rendimento_lote numeric;` (nullable; sem default)
- Seed: `UPDATE me_produto SET rendimento_lote = 695 WHERE id = 84;` (Recheio de Limão)
- Contrato: `NULL` = modo atual (nenhuma mudança comportamental). O valor é em **unidade do próprio produto** (g/ml).

## 2. Tipos e helpers

- `src/app/types/estoque.ts` ou `types/producao.ts` (onde hoje vive o `Produto` usado nas telas de produção): `rendimentoLote?: number | null` — mapear de `rendimento_lote` nos hooks que leem produto para produção (`use-ficha-tecnica`, ProducaoTab, ProdutoFormModal).
- Helper em `src/app/lib/produto-utils.ts` (ou arquivo da própria aba):
  - `toReceita(qtdPorUn, rendimento) => qtdPorUn × rendimento`
  - `deReceita(qtdReceita, rendimento) => qtdReceita / rendimento`
  - `formatarQtd(n)` → pt-BR, até 2 casas, sem zeros à direita ("395", "0,43")

## 3. Aba Produção (`src/app/components/estoque/ProducaoTab.tsx`)

- Quando `rendimentoLote` preenchido:
  - Cabeçalho da ficha: **"Receita · rende ~695 g"** (exibição por receita).
  - Cada componente mostra `formatarQtd(toReceita(qtd, r))` + unidade do componente (ex.: "395 g" leite cond · "4" limão) + perda %.
  - Custo/un ao vivo continua por unidade; adicionar **"por receita: R$ X"** (`custoPorUn × rendimento`).
- Quando `rendimentoLote` NULL: exibição/pirata de hoje, intocada.
- **D5:** badge de componente sem custo — `natureza === 'composto'` → "custo pendente de produção"; insumo → "custo pendente de compra" (tooltip idem). Se `natureza` não chega no mapper da ficha, estender o embed/hook.

## 4. Modal "Produzir lote" (no mesmo `ProducaoTab.tsx`)

- Com `rendimentoLote`:
  - Chip toggle **`[1 receita | 695 g]`** (aria-pressed), default **1 receita**.
  - Input numérico aceita decimal; label dinâmica: "Quantas receitas?" / "Quantos g?".
  - Resumo mostra equivalência: `1 receita ≈ 695 g` + custo estimado `custoPorUn × qtd_g`.
  - No submit: `quantidade_g = modoReceita ? qtd × rendimentoLote : qtd` → chama `use-registrar-producao` como hoje (RPC intocada, recebe g).
- Sem `rendimentoLote`: modal de hoje (por unidade), intocado.

## 5. Ficha editável (`src/app/components/produto/ProdutoFormModal.tsx` — step Ficha Técnica)

- Novo campo opcional **"Essa receita rende"** (numeric > 0) com sufixo da unidade do produto (g/ml) — só aparece para `natureza='composto'`; grava `rendimento_lote` (null limpa).
- Com rendimento preenchido: as linhas de componente exibem/editam **por receita**; ao salvar cada quantidade passa por `deReceita(...)` antes da RPC `salvar_ficha_tecnica`.
- Sem rendimento: edição por unidade como hoje.
- Ao editar produto para **limpar** o rendimento, manter ficha por-grama (não multiplicar de volta — sem perda de dados; a divergência é registrada pela leitura).

## 6. Verificação

1. `npx tsc --noEmit` → **0 erros** (baseline; qualquer novo = regressão). 2. `npm run build` OK. 3. Não commitar — orquestrador reconcilia (commit + migration + prova no banco: produzir 1 receita do recheio em transação com ROLLBACK → consuma 395×1,05 / 300×1,05 / 4, entrada 695 g). 4. Ordem de hooks respeitada (classe #310).

## 7. Checklist

- [ ] helpers `toReceita`/`deReceita`/`formatarQtd` + `rendimentoLote` mapeado
- [ ] Aba Produção: modo receita (ficha + custo por receita) · badge D5 ("pendência de produção" p/ composto)
- [ ] Modal: toggle receita×g, default 1 receita equivalente, RPC recebe g
- [ ] ProdutoFormModal: campo "rende" + edição por receita + limpeza segura
- [ ] Comportamento NULL idêntico ao de hoje · tsc 0 · build OK
