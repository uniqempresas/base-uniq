# PRD — Categorias em Contas + DRE sem dupla contagem (B9)

> **Sprint:** Financeiro (backlog **B9** — `tracking/TRACKING.md`)
> **Status:** 🔶 Rascunho — decisões do fundador registradas (22/09/2026)
> **Pipeline:** Research ✅ (recon de 22/09/2026) → **PRD (este)** → SPEC → **WIRE dispensado** → Implementação
> **WIRE dispensado pelo fundador:** *"vc pode usar como referencia para fazer o mesmo assim nem precisamos passar pela revisão de wire"* — mesmo precedente do `PRD-CategoriasProduto.md` ("WIRE aprovado por referência").

---

## 1. WHY — o problema

**O DRE soma o mesmo custo duas vezes.**

Se um produto é vendido por **R$ 8** e custa **R$ 4**, esse R$ 4 **já foi lançado como conta a pagar** — quando o fundador vai ao mercado, ele cadastra a compra dos insumos ali. Mas o DRE também deriva um **CMV** (custo da mercadoria vendida) a partir da venda. Resultado: **R$ 8 de custo** para um produto que custa R$ 4.

**Onde isso acontece no código** (`use-dre.ts`):

- O CMV subtrai em `lucroBruto = receitaLiquida − custos` (`:245`)
- A conta a pagar da compra entra em `despesasOperacionais` (`:246`)
- `lucroLiquido = lucroBruto − despesasOperacionais` → **as duas fontes do mesmo custo**

A dupla contagem aparece **também na UI**: `DREPage.tsx:75,269,291` — o KPI "Despesas Totais" soma `despesasOperacionais + custos`.

**Por que não foi corrigido antes:** as contas a pagar **não têm categoria preenchida**. Sem saber *qual* conta é compra de insumo e qual é aluguel, o DRE não consegue separar as duas — e hoje usa uma **heurística por descrição** (`ehDespesaTributaria`, `use-dre.ts:91-98`) só para achar os tributos.

---

## 2. Diagnóstico — o que já existe (evidências)

### 2.1 A estrutura está pronta; falta a tela

| Peça | Estado |
|---|---|
| `me_contas_pagar.categoria_id` | ✅ **existe** (`use-contas-pagar.ts:23`) |
| `me_contas_receber.categoria_id` | ✅ **existe** (`use-contas-receber.ts:24`) |
| Os hooks **leem** a categoria e resolvem o nome | ✅ `use-contas-pagar.ts:148-174` · `use-contas-receber.ts:277-305` |
| `me_categoria_financeira` | ✅ existe, **com a coluna `tipo`** |
| **Os 4 hooks de criar/atualizar gravam `categoria_id`** | ❌ **NÃO** — é o buraco |
| **Select de categoria nos formulários** | ❌ **NÃO EXISTE** |
| **CRUD de categoria financeira** | ❌ **NÃO EXISTE** — o hook é somente leitura |
| **Tela de configuração** | ❌ **NÃO EXISTE** |
| **Migration no repo** | ❌ **NÃO EXISTE** — a tabela foi criada direto no Supabase |

### 2.2 A coluna `tipo` está viva e sem semântica

`use-categorias-financeiras.ts:54-58` faz `select("id, nome, tipo, cor, ativo")` — a coluna existe. Mas **nenhum valor de `operacional`/`mercadoria` é lido ou gravado em lugar nenhum do front**. É exatamente a coluna que este PRD precisa dar sentido.

### 2.3 O padrão de referência (mandado pelo fundador)

O `ProdutoFormModal` tem um botão **"Configurar"** (`:349-361`) que, quando não há categorias, mostra um aviso e navega para `/estoque/configuracoes` — a tela de CRUD de categorias de produto (`ConfiguracoesProdutosPage.tsx` + `use-categorias.ts`), com soft delete, tratamento de duplicidade (código `23505`) e trava de tenant.

**Este PRD replica esse padrão** para o financeiro. O contrato daquele CRUD está em `SPEC-CategoriasProduto.md` e as decisões em `PRD-CategoriasProduto.md` (D1–D7).

---

## 3. Objetivo

1. **Categorias no cadastro de contas** — a pagar **e** a receber.
2. **CRUD de categorias financeiras** com um **tipo**: `operacional` · `mercadoria` · `receita`.
3. **DRE sem dupla contagem** — o custo de mercadoria passa a vir da **compra real** (contas a pagar categorizadas), e o **CMV derivado sai**.
4. **Tela de configuração** acessível por botão, no padrão do produto.

### Não-objetivos

- **Não** mexer no **Fluxo de Caixa** — ele é caixa, não competência. Vai continuar mostrando a saída da compra (ver Riscos).
- **Não** mexer no **"Lucro do mês"** do dashboard financeiro (`use-financeiro-dashboard.ts:236`) — é caixa puro.
- **Não** trocar a **heurística de tributos** por categoria — ver §4 D4.
- **Não** criar categoria global (`empresa_id IS NULL`) — diferente de `me_categoria`, esta tabela é **por tenant**.
- **Não** migrar/reclassificar contas legadas — ver §4 D6.

---

## 4. Decisões

### 4.1 Do fundador (22/09/2026)

| # | Decisão |
|---|---|
| **F1** | **O custo de mercadoria no DRE vem da compra real** (contas a pagar categorizadas), **não do CMV derivado**. O CMV sai. |
| **F2** | **O tipo fica na categoria** — não na conta. A categoria é criada uma vez como operacional ou mercadoria; na conta, você só escolhe a categoria. |
| **F3** | Categorias no cadastro de contas **a pagar e a receber**. |
| **F4** | Usar o **botão "Configurar"** do cadastro de produto como referência de padrão. |
| **F5** | **WIRE dispensado** — a referência existente basta. |

### 4.2 Minhas (🟡 autonomia — revisar)

| # | Decisão | Racional |
|---|---|---|
| **D1** 🟡 | **Terceiro tipo: `receita`.** O CRUD oferece `operacional` · `mercadoria` · **`receita`**. O form **a pagar** mostra `operacional`+`mercadoria`; o **a receber** mostra `receita`. | Você citou dois tipos, mas os dois são de **custo** — e você também pediu categorias no **a receber**. Sem um tipo de receita, o form a receber mostraria categorias de custo (ex.: "Aluguel") — semanticamente errado. **É consequência direta do seu pedido, mas é uma adição minha.** |
| **D2** 🟡 | **O DRE é robusto a classificação errada.** Com o CMV removido, **não existe mais dupla contagem** — o tipo só decide **em qual linha** o custo aparece. Uma compra marcada como `operacional` por engano aparece em Despesas Operacionais em vez de Custo de Mercadoria. | Reduz o risco de o número ficar errado por descuido de cadastro. O total continua certo. |
| **D3** 🟡 | **Conta sem categoria conta como Despesa Operacional.** | Retrocompatível: **nada desaparece** do DRE por não estar categorizado. Sem isso, o dia da entrega o DRE "perderia" todas as contas existentes. |
| **D4** 🟡 | **A heurística de tributos FICA.** Não troco `ehDespesaTributaria` por categoria. | Você não pediu, e trocar exigiria classificar todas as contas antigas — senão a linha "(−) Impostos" zera de uma vez (risco de regressão silenciosa). Fica como backlog. |
| **D5** 🟡 | **A linha do CMV na UI muda de nome, não desaparece.** De "(−) Custos (CMV)" para **"(−) Custo de Mercadoria"**. | Mesma posição, **fonte diferente** — evita você ler a troca como "sumiu uma linha". |
| **D6** 🟡 | **Nenhuma reclassificação automática de contas legadas.** Ficam "Sem categoria" → operacional (D3). | Automatizar seria adivinhar. O hint na tela convida a categorizar. |
| **D7** 🟡 | **Migration idempotente no repo**, mesmo a tabela já existindo. | O recon confirma: não há migration — ambiente novo/reset quebra as 3 leituras. `create table if not exists` + `add column if not exists` é **no-op** no banco atual. ⚠️ **Não pude aplicar** (MCP do Supabase fora do ar) — ver §7. |

---

## 5. O DRE antes e depois

**Antes:**
```
Receita Bruta
(−) Custos (CMV derivado da venda)      ← conta 1
= Lucro Bruto
(−) Impostos (heurística)
(−) Despesas Operacionais (contas a pagar)  ← conta 2 (o mesmo insumo!)
= Lucro Líquido
```

**Depois:**
```
Receita Bruta
(−) Custo de Mercadoria      ← contas a pagar com categoria tipo `mercadoria` (compra REAL)
= Lucro Bruto
(−) Impostos (heurística — mantida)
(−) Despesas Operacionais    ← categoria tipo `operacional` OU sem categoria, não-tributárias
= Lucro Líquido
```

Com o exemplo do fundador (vende 8, insumo 4 lançado como conta a pagar): **8 − 4 = 4**. Contado **uma vez**, pelo valor que ele **realmente pagou**.

---

## 6. Critérios de aceite

- [ ] Dá para **criar, editar e desativar** categorias financeiras, escolhendo o tipo (`operacional` · `mercadoria` · `receita`).
- [ ] O form de **conta a pagar** tem select de categoria (mostra `operacional` + `mercadoria`) e **grava `categoria_id`**.
- [ ] O form de **conta a receber** tem select de categoria (mostra `receita`) e **grava `categoria_id`**.
- [ ] Com o form vazio de categorias, aparece o botão **"Configurar"** que leva à tela de categorias (padrão do produto).
- [ ] **O DRE não soma mais o mesmo custo duas vezes** — o CMV derivado não entra no resultado.
- [ ] A linha **"(−) Custo de Mercadoria"** soma as contas a pagar de categoria `mercadoria`.
- [ ] Conta **sem categoria** continua entrando (como Despesa Operacional) — **nada desaparece**.
- [ ] A linha **"(−) Impostos"** continua funcionando igual (heurística preservada).
- [ ] **Fluxo de Caixa** e **"Lucro do mês"** do dashboard **não mudam** (são caixa, não competência).
- [ ] `npx tsc --noEmit` = **0 erros** · `npm run build` ✅ · Vercel `READY` · validado no celular.
- [ ] `tracking/TRACKING.md` atualizado (B9 fechado).

---

## 7. Riscos

| Risco | Mitigação |
|---|---|
| **DRE "perde" contas antigas** sem categoria | **D3**: sem categoria → operacional. Nada desaparece. |
| **Linha de Impostos zera** se a heurística sair | **D4**: a heurística **fica**. Trocar vira backlog. |
| **Fluxo de Caixa divergir do DRE** | Esperado e **correto**: caixa mostra a saída da compra; o DRE mostra competência. Registrar na entrega para não parecer bug. |
| **"Lucro do mês" do dashboard divergir do DRE** | Idem — é caixa puro (`use-financeiro-dashboard.ts:236`). Registrar. |
| **Esquecer de ler o novo campo no `salvar()`** | Os forms usam **`FormData` manual** (sem RHF/zod) — erro **silencioso**. Testar: salvar com categoria e conferir no banco. |
| **`use-fluxo-caixa.ts:242` grava `categoria_id: null`** | Contas criadas por ali ficam sem categoria → operacional (D3). Registrar; classificar na origem é backlog. |
| **Tabela sem migration no repo** | **D7** — migration idempotente criada. ⚠️ **Não aplicada**: o **MCP do Supabase caiu** nesta sessão. A tabela **já existe** com as colunas necessárias, então o app funciona; a migration é garantia para ambiente novo. |
| **Índice único ausente** | Se não houver `(empresa_id, lower(nome))`, duas categorias com o mesmo nome passam. O CRUD trata `23505`, mas sem índice ele nunca dispara. Verificar no SPEC. |

---

## 8. Documentos irmãos

- **SPEC:** `tracking/specs/SPEC-CategoriasFinanceiras.md`
- **WIRE:** dispensado (F5) — referência: `WIRE-CategoriasProduto.md` + `ProdutoFormModal.tsx:349-361`
- **Backlog:** `tracking/TRACKING.md` — item **B9**
- **Antecessor do padrão:** `PRD-CategoriasProduto.md` · `SPEC-CategoriasProduto.md`
- **Recon:** levantamento de 22/09/2026 (este PRD §2)
