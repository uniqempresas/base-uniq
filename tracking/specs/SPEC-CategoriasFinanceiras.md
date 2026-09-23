# SPEC — Categorias em Contas + DRE sem dupla contagem (B9)

> **PRD:** `tracking/plans/PRD-CategoriasFinanceiras.md`
> **WIRE:** **dispensado** pelo fundador (PRD §4.1 F5) — referência: `WIRE-CategoriasProduto.md`
> **Status:** 🔶 Contrato para implementação
> **Base:** recon de 22/09/2026 (todas as referências `arquivo:linha` verificadas)
> **Gate:** `npx tsc --noEmit` = **0 erros** hoje. Deve continuar **0**. `npm run build` deve passar.

---

## 1. Contrato congelado — o valor de `tipo`

**Este é o único ponto que as 3 lanes compartilham. Não mude.**

```ts
type TipoCategoriaFinanceira = 'operacional' | 'mercadoria' | 'receita';
```

| Tipo | Aparece em | Papel no DRE |
|---|---|---|
| `operacional` | form **a pagar** | linha **(−) Despesas Operacionais** |
| `mercadoria` | form **a pagar** | linha **(−) Custo de Mercadoria** |
| `receita` | form **a receber** | não entra no DRE (é receita, não custo) |

- **Default de categoria nova:** `operacional`.
- **Conta sem categoria:** tratada como **`operacional`** no DRE (PRD D3) — nada desaparece.
- **A coluna `tipo` já existe** em `me_categoria_financeira` (o código faz `select("id, nome, tipo, cor, ativo")` em `use-categorias-financeiras.ts:56`) e é `string | null`. **Nenhum valor era lido/gravado** — este SPEC é o que dá semântica a ela.

---

## 2. Arquivos por lane (sem sobreposição)

### Lane A — CRUD de categoria + tela + rota + migration

| Arquivo | Ação |
|---|---|
| `src/app/hooks/use-categorias-financeiras.ts` | **Estender** com CRUD (hoje é só leitura) |
| `src/app/components/financeiro/ConfiguracoesFinanceirasPage.tsx` | **Criar** |
| `src/app/routes.tsx` | **+1 rota** (lazy) |
| `supabase/migrations/20260922180000_me_categoria_financeira_tipo.sql` | **Criar** |

### Lane B — categoria nas contas (4 hooks + 2 telas)

| Arquivo | Ação |
|---|---|
| `src/app/hooks/use-criar-conta-pagar.ts` | params + payload com `categoria_id` |
| `src/app/hooks/use-atualizar-conta-pagar.ts` | idem (update parcial) |
| `src/app/hooks/use-criar-conta-receber.ts` | idem |
| `src/app/hooks/use-atualizar-conta-receber.ts` | idem |
| `src/app/components/financeiro/ContasPagarPage.tsx` | select + leitura no `salvar()` + botão Configurar |
| `src/app/components/financeiro/ContasReceberPage.tsx` | idem |

### Lane C — DRE

| Arquivo | Ação |
|---|---|
| `src/app/hooks/use-dre.ts` | categoria no select + split mercadoria + CMV fora |
| `src/app/components/financeiro/DREPage.tsx` | relabel da linha + KPIs |

### Intocados (todas as lanes)

`use-fluxo-caixa.ts` · `use-financeiro-dashboard.ts` · `use-contas-pagar.ts` · `use-contas-receber.ts` (leitura já funciona) · `components.tsx` · `ProdutoFormModal.tsx` · `use-categorias.ts` (categoria de **produto**, outro domínio) · `lib/modulos.ts` · o menu.

---

## 3. Lane A — CRUD de categoria financeira

### 3.1 Migration (`20260922180000_me_categoria_financeira_tipo.sql`)

A tabela **existe no Supabase mas não tem migration no repo** (o recon confirma: 0 resultados em `supabase/`). Ambiente novo/reset quebraria as 3 leituras.

**Idempotente — no-op no banco atual:**

```sql
create table if not exists public.me_categoria_financeira (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.me_empresa(id) on delete cascade,
  nome text not null,
  tipo text default 'operacional',
  cor text,
  ativo boolean default true,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

alter table public.me_categoria_financeira add column if not exists tipo text default 'operacional';
alter table public.me_categoria_financeira add column if not exists cor text;
alter table public.me_categoria_financeira add column if not exists ativo boolean default true;

-- Índice único por tenant (o CRUD trata 23505)
create unique index if not exists me_categoria_financeira_empresa_nome_key
  on public.me_categoria_financeira (empresa_id, lower(nome));
```

> ⚠️ **Não usar `CHECK` em `tipo`** — pode falhar se houver dado legado fora dos 3 valores. A validação fica no app.
> ⚠️ **Não pude aplicar** (MCP do Supabase fora do ar nesta sessão). O arquivo é criado para o repo; a tabela **já existe** com as colunas necessárias, então o app funciona sem aplicar. **Registrar na entrega.**

### 3.2 `use-categorias-financeiras.ts` — estender

Hoje: `{ categorias, loading, isFallback, recarregar }` — **somente leitura** (`:13-18`).

Espelhar **`use-categorias.ts`** (o CRUD de produto, já aprovado), com as mesmas regras:

```ts
{
  categorias, loading, error, isFallback, recarregar,
  criarCategoria(nome: string, tipo: TipoCategoriaFinanceira, cor?: string),
  atualizarCategoria(id: string, campos: { nome?: string; tipo?: TipoCategoriaFinanceira; cor?: string }),
  desativarCategoria(id: string),
  contarContas(id: string),   // quantas contas usam (pagar + receber)
}
```

**Regras obrigatórias (copiadas do padrão aprovado):**
- **Trava de tenant em toda escrita:** `.eq("empresa_id", empresaId)`.
- **Soft delete:** `update({ ativo: false })` — **nunca** `delete`.
- **Duplicidade:** erro `23505` → mensagem *"Já existe uma categoria com esse nome."*
- **Erro nunca silencioso:** expor `error`.
- Leitura já filtra `.eq("empresa_id", empresaId)` e ordena por `nome` (`:54-58`) — **manter**.
- **`tipo` é obrigatório na criação**, com default `'operacional'`.

### 3.3 `ConfiguracoesFinanceirasPage.tsx` — a tela

**Espelhar `ConfiguracoesProdutosPage.tsx`** (a referência que o fundador mandou usar):

| Elemento | Referência |
|---|---|
| Header com voltar + contagem | `ConfiguracoesProdutosPage.tsx:109-132` |
| Form de criação (nome + **tipo** + paleta de cor + preview) | `:150-207` — **acrescentar o seletor de tipo** |
| Lista com edição inline | `:250-306` |
| Remover (`Trash2`) + modal de confirmação com contagem | `:309-337`, `:348-389` |
| Estados: skeleton · erro+retry · vazio | `:210-244` |
| Nota de rodapé sobre soft delete | `:342-345` |

**Diferenças em relação ao produto:**
- **Seletor de `tipo`** no form de criação e na edição inline — 3 opções com rótulo claro:
  - `operacional` → **"Custo operacional"** (ex.: aluguel, luz, internet)
  - `mercadoria` → **"Custo de mercadoria"** (ex.: insumos, chocolate, embalagem)
  - `receita` → **"Receita"** (ex.: vendas, serviços)
- **Sem categoria global** — esta tabela é **por tenant** (`empresa_id` not null). Diferente de `me_categoria` (produto), que tem globais.
- `contarContas` precisa contar **as duas** tabelas (`me_contas_pagar` + `me_contas_receber`).

### 3.4 Rota

Em `routes.tsx`, no bloco do Financeiro (perto de `:123-128`), no padrão lazy:

```tsx
{ path: "/financeiro/configuracoes", lazy: pagina(() => import("./components/financeiro/ConfiguracoesFinanceirasPage"), "ConfiguracoesFinanceirasPage") },
```

> ⚠️ **Furo corrigido em 22/09/2026 — reportado pelo fundador:**
>
> *"não consegui acessar a configuração, eu tive que digitar na url o caminho."*
>
> A rota foi criada, mas **nenhum item de menu apontava para ela**. O único caminho era o botão **"Configurar"** dos formulários de conta — que só aparece **quando não há categorias**. Assim que o fundador criou a primeira categoria, o botão sumiu e a tela ficou **inalcançável**.
>
> **Correção:** item **"Configurações"** na seção `railId: "financeiro"` do `SUBNAV_SECTIONS` (`AppLayout.tsx`), **logo após o DRE** — posição pedida pelo fundador. Sem `moduloCodigo`, portanto nunca filtrado. O botão "Configurar" nos formulários **permanece** — dois caminhos é melhor que um.
>
> 📌 **Lição registrada:** criar uma rota **não** a torna alcançável. Toda tela administrativa precisa de **dois** caminhos — o **contextual** (botão no fluxo) e o **permanente** (item de menu). Um botão que só aparece em **estado vazio** desaparece justamente quando o usuário passa a precisar da tela.

---

## 4. Lane B — categoria nas contas

### 4.1 Os 4 hooks — o buraco central

Hoje **nenhum** grava `categoria_id`. Fechar os 4:

| Hook | Onde |
|---|---|
| `use-criar-conta-pagar.ts` | `CriarContaPagarParams` (`:12-20`) + insert (`:99-112`) |
| `use-atualizar-conta-pagar.ts` | params + `updateData` (`:94-115`) |
| `use-criar-conta-receber.ts` | params + insert (`:125-138`) |
| `use-atualizar-conta-receber.ts` | params + `updateData` (`:96-118`) |

- Adicionar `categoriaId?: string` aos params.
- No insert: `categoria_id: params.categoriaId ?? null`.
- No **update**: só incluir a chave quando vier definida (`!== undefined`) — o update é **parcial**.

### 4.2 Os 2 formulários (BottomSheet, `FormData` manual)

**Não há form compartilhado** — cada página tem o seu (`ContasPagarPage.tsx:501-601`, `ContasReceberPage.tsx:541-643`). Os campos são lidos de `FormData` em `salvar()` (`ContasPagarPage:112-122`, `ContasReceberPage:124-135`).

**Adicionar:**

1. **Select de categoria**, logo **após "fornecedor"** (pagar) / **após "cliente"** (receber), usando `campoFormSheet` (`components.tsx`).
   - **Pagar:** lista categorias com `tipo ∈ {operacional, mercadoria}`.
   - **Receber:** lista categorias com `tipo === 'receita'`.
   - Opção vazia: **"Sem categoria"** (permitido — D3).
   - No modo editar, pré-selecionar a categoria da conta (`categoriaId` já vem do mapper).
2. **Ler o campo no `salvar()`** e passar `categoriaId` ao hook.
   > ⚠️ **Ponto de falha silenciosa:** o `FormData` é manual — esquecer de ler o campo salva **sem categoria**, sem erro. **Testar salvando com categoria e conferindo no banco.**
3. **Botão "Configurar"** quando não houver categorias do tipo relevante — replicar `ProdutoFormModal.tsx:349-361`: aviso + `<Settings/> Configurar` → `navigate("/financeiro/configuracoes")`.

**Estados já existentes que não podem regredir:** skeleton (`:186-216` / `:224-254`), erro+retry (`:219-238` / `:257-276`), vazio com CTA (`:390-417` / `:428-455`), banner demo (`:270-275` / `:308-313`).

---

## 5. Lane C — DRE

### 5.1 `use-dre.ts` — as mudanças

| # | Onde | Mudança |
|---|---|---|
| 1 | selects das contas a pagar (`:144`, `:153`) | **incluir `categoria_id`** |
| 2 | após carregar as contas | buscar `tipo` das categorias usadas em `me_categoria_financeira` (`id`, `tipo`) — escopado por `empresa_id` |
| 3 | `despesasComValor` (`:223-226`) | **separar** em `comprasMercadoria` (tipo `mercadoria`) e `despesasNaoMercadoria` |
| 4 | `lucroBruto` (`:245`) | **parar de subtrair `custos`** — o CMV sai do resultado |
| 5 | `despesasOperacionais` | = `despesasNaoMercadoria` **não-tributárias** (heurística preservada — D4) |
| 6 | novo total | `(−) Custo de Mercadoria` = Σ `comprasMercadoria` |
| 7 | `lucroLiquido` (`:246`) | = `receitaLiquida` − `comprasMercadoria` − `impostos` − `despesasOperacionais` |

**A heurística `ehDespesaTributaria` (`:91-98`) FICA** (PRD D4) — não trocar por categoria.

**O `custos` (CMV) deixa de ser usado no resultado.** Decidir no código se a variável sai de vez ou fica disponível como dado informativo — **recomendado: manter o cálculo e a flag `cmvDisponivel`**, mas **não** subtrair. Assim não se perde a informação e uma volta atrás é barata.

### 5.2 `DREPage.tsx`

- **Linha "(−) Custos (CMV)"** (`:350-359`) → passa a exibir **"(−) Custo de Mercadoria"** com o novo valor. **Mesma posição** (PRD D5) — o fundador não deve ler como linha que sumiu.
- **KPI "Despesas Totais"** (`:75`, `:269`, `:291`): hoje soma `despesasOperacionais + custos`. Passa a somar **`comprasMercadoria + impostos + despesasOperacionais`** (tudo que saiu), **sem** o CMV.
- **Gráfico/pizza** (`categoriasDespesas`, `:241`): continua pelo proxy de descrição (`truncarDescricao`) — **fora de escopo** trocar por categoria real. Se ficar estranho com o novo split, **registrar**, não improvisar.
- **Estado vazio do Custo de Mercadoria:** se não houver nenhuma conta categorizada como `mercadoria`, a linha fica **0** com uma dica curta (ex.: *"Categorize as compras de insumo para preencher esta linha"*). **Sem isso o fundador vai achar que quebrou** — no dia da entrega ele tem ~1 conta a pagar e nenhuma categoria.

---

## 6. Verificação por lane

**Todas:** `npx tsc --noEmit` = **0** · `npm run build` OK.

**Lane A:**
- CRUD funciona: criar (com tipo), editar, desativar (soft delete).
- Nome duplicado → mensagem clara (23505).
- **Prova por grep:** o hook exporta `criarCategoria`, `atualizarCategoria`, `desativarCategoria`, `contarContas`.
- Rota registrada em `routes.tsx`.

**Lane B:**
- **Prova por grep:** `categoria_id` presente no insert dos 2 hooks de criar e no `updateData` dos 2 de atualizar.
- **Prova por grep:** `categoriaId` lido no `salvar()` das 2 páginas.
- Botão "Configurar" presente nos 2 forms.
- **Teste real:** salvar uma conta com categoria e conferir que `categoria_id` foi gravado.

**Lane C:**
- **Prova por grep:** `custos` **não** aparece mais na expressão do `lucroBruto`.
- **Prova por grep:** existe o cálculo de `comprasMercadoria`.
- A heurística `ehDespesaTributaria` **continua** no arquivo.
- `DREPage` não exibe mais "Custos (CMV)" — e sim "Custo de Mercadoria".

---

## 7. Checklist final (após as 3 lanes)

- [ ] `me_categoria_financeira` com migration idempotente no repo
- [ ] CRUD de categoria financeira com os **3 tipos**
- [ ] Tela `/financeiro/configuracoes` + rota
- [ ] **4 hooks** gravando `categoria_id`
- [ ] **2 forms** com select de categoria (filtrado por tipo) + botão Configurar
- [ ] DRE: `(−) Custo de Mercadoria` no lugar do CMV
- [ ] DRE: conta **sem categoria** continua entrando (operacional)
- [ ] DRE: linha de **Impostos preservada** (heurística intacta)
- [ ] `DREPage`: KPI "Despesas Totais" sem o CMV
- [ ] Fluxo de Caixa e "Lucro do mês" **inalterados**
- [ ] `npx tsc --noEmit` = **0** · `npm run build` ✅ · Vercel `READY`
- [ ] `tracking/TRACKING.md` com **B9 fechado**
- [ ] Registrar: migration **não aplicada** (MCP fora) e a divergência esperada entre Caixa e DRE

---

## 8. Fora de escopo (registrado)

- **Trocar a heurística de tributos** por categoria (PRD D4).
- **Reclassificar contas legadas** (PRD D6).
- **Pizza do DRE por categoria real** (hoje é proxy por descrição).
- **`use-fluxo-caixa.ts:242`** grava `categoria_id: null` — classificar na origem.
- **Categoria global** (`empresa_id IS NULL`) — esta tabela é por tenant.
- **Relatórios por categoria** (somar despesas por categoria ao longo do tempo).
