# SPEC — Categorias de Produto (CRUD + uso no cadastro)

> **PRD:** `tracking/plans/PRD-CategoriasProduto.md`
> **WIRE:** `tracking/wireframe/WIRE-CategoriasProduto.md`
> **Status:** implementação autorizada (WIRE aprovado por referência à tela de tags do CRM)

---

## 1. Migration (aditiva) — **APLICADA em 17/09/2026**

`supabase/migrations/20260917230000_me_categoria_cor_ativo.sql`

```sql
-- Cor da categoria (usada na tela de configurações e nas chips do produto).
-- Sem ela, TODAS as chips caem na cor de fallback "Outros".
ALTER TABLE me_categoria ADD COLUMN IF NOT EXISTS cor text;

-- Soft delete, igual às tags (me_tag.ativo): a categoria sai dos selects mas o
-- produto que já a usava mantém o rótulo
ALTER TABLE me_categoria ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- Sem duplicata de nome dentro da empresa (case-insensitive).
-- PARCIAL (`WHERE ativo = true`): permite recriar um nome já removido.
-- Globais (empresa_id IS NULL) entram com uuid sentinela para também não duplicarem.
CREATE UNIQUE INDEX IF NOT EXISTS ux_me_categoria_empresa_nome
  ON me_categoria (COALESCE(empresa_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(nome_categoria))
  WHERE ativo = true;
```

Verificado no banco após aplicar: `cor` (text, nullable) · `ativo` (boolean, NOT NULL, default `true`) · índice `ux_me_categoria_empresa_nome` presente.

**Rollback:**
```sql
DROP INDEX IF EXISTS ux_me_categoria_empresa_nome;
ALTER TABLE me_categoria DROP COLUMN IF EXISTS ativo;
ALTER TABLE me_categoria DROP COLUMN IF EXISTS cor;
```

---

## 2. Tipos

```ts
// src/app/hooks/use-categorias.ts
export interface CategoriaProduto {
  id: number;
  nome: string;
  cor: string | null;
  ativo: boolean;
  /** `empresa_id IS NULL` → catálogo global: a UI do tenant não edita */
  global: boolean;
}

export interface CriarCategoriaResult { success: boolean; id?: number; error?: string }
export interface MutarCategoriaResult { success: boolean; error?: string }
```

`src/app/components/estoque/estoqueMockData.ts` — `Produto` ganha:

```ts
/** me_produto.categoria_id — usado para pré-selecionar no formulário */
categoriaId?: number | null;
/** me_categoria.cor — cor real da categoria (substitui o mapa mock) */
categoriaCor?: string | null;
```

---

## 3. Hook `use-categorias.ts` (espelha `use-tags.ts`) — **ESCRITO**

```ts
export function useCategorias(): {
  categorias: CategoriaProduto[];
  loading: boolean; error: string | null; isFallback: boolean;
  recarregar: () => void;
  criarCategoria:      (nome: string, cor?: string) => Promise<CriarCategoriaResult>;
  atualizarCategoria:  (id: number, campos: { nome?: string; cor?: string }) => Promise<MutarCategoriaResult>;
  desativarCategoria:  (id: number) => Promise<MutarCategoriaResult>;
  contarProdutos:      (id: number) => Promise<number>;   // aviso antes de remover
}
```

Regras, iguais às de `use-tags`:

1. `useAuth()` → `empresa?.id`, `session`, `authLoading`
2. **Sem sessão (demo)** → `CATEGORIAS_PADRAO` (mock **genérico**: Bebidas/Doces/Salgados/Outros) + `isFallback = true`. Nunca usar nome de tenant real
3. **Logado sem empresa resolvida** → `[]` + erro explícito. **Nunca** consultar outro tenant
4. **Leitura (D6):** `me_categoria` com `.eq("empresa_id", empresaId).eq("ativo", true)` — **globais ficam de fora de propósito** (compartilhadas; o CRUD de um tenant não deve enxergá-las nem alterá-las)
5. `criarCategoria`: nome vazio → erro amigável; **23505** → *"Já existe uma categoria com esse nome."*; `cor` default = `CORES_TAG[0]`
6. `atualizarCategoria`: `update` com **`.eq("empresa_id", empresaId)`** — trava de tenant que impede alterar categoria global mesmo se um id externo chegar
7. `desativarCategoria`: `update({ ativo: false })` — **soft delete (D4)**, igual às tags. O produto mantém o rótulo da categoria
8. `contarProdutos(id)`: `count` em `me_produto` por `categoria_id` **e** `empresa_id` — alimenta o aviso antes de remover
9. Toda mutação chama `recarregar()`

Paleta (reuso do CRM): `CORES_TAG` e `getTagPalette` de `use-tags.ts` — uma paleta só no sistema, não duas.

---

## 4. Tela `/estoque/configuracoes`

`src/app/components/estoque/ConfiguracoesProdutosPage.tsx` — espelho de `ConfiguracoesCRMPage`:

- Header: botão voltar (→ `/estoque/produtos`) + título **"Configurações de Produtos"** + contagem
- Card: formulário **Nova categoria** (input + paleta de cor + preview do chip)
- Lista: cada linha = ponto de cor + chip + nome + botão editar (lápis) + botão excluir
- **Edição inline**: clicar em editar transforma a linha em input (nome + cor) com Salvar/Cancelar
- Categoria **global** → chip "Base UNIQ" e **sem** botões de editar/excluir (só leitura)
- Excluir → `confirm` textual com a contagem: *"3 produtos ficarão sem categoria. Os produtos não são apagados."*
- Estados: skeleton · erro + retry · vazio · sucesso

Rota **lazy** (mantém o code splitting): `{ path: "/estoque/configuracoes", lazy: pagina(() => import(".../ConfiguracoesProdutosPage"), "ConfiguracoesProdutosPage") }`

---

## 5. `ProdutosPage` — porta de entrada

- Botão de configuração no header ao lado de "Novo Produto" (ícone `Settings`, `aria-label="Configurações de categorias"`), navegando para `/estoque/configuracoes` — **mesmo padrão** do botão que leva a `/crm/configuracoes`
- Instancia `useCategorias()` e passa `categorias={categoriasConfig}` para os dois `ProdutoFormModal` (igual ao que já é feito com `tags`)

---

## 6. `ProdutoFormModal` — chips reais

- Remove `const CATEGORIAS = [...]` derivado do mock
- Props ganham `categorias: CategoriaProduto[]`
- Estado do formulário: `categoriaId: number | null` (substitui `categoria: string`)
- Chips: `categorias.map(c => ...)` usando `getTagPalette(c.cor)` — categoria **global** recebe um selo discreto
- Botão **"+ Criar categoria"**: revela um input inline; ao confirmar, chama `criarCategoria` e **já seleciona** a nova
- Cor do placeholder da foto: `getTagPalette(categoriaSelecionada?.cor)`, com fallback neutro (o `CATEGORIA_COLORS` mock deixa de mandar)
- **Editar produto**: pré-seleciona pela `categoriaId` vinda do `useProduto`
- Ao salvar, envia `categoriaId` (não mais `categoria: string`)

---

## 7. Escrita — parar de usar `tipo`

**`use-criar-produto.ts`** — `CriarProdutoParams`:
```diff
- categoria?: string;
+ categoriaId?: number | null;
```
```diff
- tipo: params.categoria || "Outros",
+ categoria_id: params.categoriaId ?? null,
```
`tipo` **deixa de ser escrito** (preserva a semântica de tipo de produto).

**`use-atualizar-produto.ts`** — mesma troca: `if (campos.categoriaId !== undefined) updateData.categoria_id = campos.categoriaId;` e **não** tocar em `tipo`.

---

## 8. Leitura — resolver categoria pelo id

**`use-produtos.ts`** e **`use-produto.ts`**:

```diff
- .select("*")
+ .select("*, me_categoria(id_categoria, nome_categoria, cor)")
```

```diff
- categoria: db.tipo || "Outros",
+ categoriaId: db.categoria_id ?? null,
+ categoria: db.me_categoria?.nome_categoria || "Sem categoria",
```

O embed foi **verificado em produção** via REST (retorna objeto aninhado, não array).

---

## 9. Checklist

- [ ] Migration aplicada (`cor` + índice único) e verificada
- [ ] `use-categorias.ts` com listar/criar/atualizar/excluir/contarProdutos
- [ ] Globais recusam edição e exclusão no hook **e** na UI
- [ ] `/estoque/configuracoes` (rota lazy) espelhando a tela de tags
- [ ] Botão de configuração no header de `/estoque/produtos`
- [ ] `ProdutoFormModal` grava `categoria_id`, chips reais com cor, criar inline
- [ ] `use-criar-produto` / `use-atualizar-produto` **pararam** de escrever `tipo`
- [ ] `use-produtos` / `use-produto` leem `categoria_id` via embed e expõem `categoriaId`
- [ ] Filtro de categoria na lista de produtos usa as categorias reais
- [ ] Estados visuais completos
- [ ] `tsc --noEmit` sem erros novos · `npm run build` ✅
- [ ] Commit + push + deploy validado
- [ ] TRACKING atualizado

---

## 10. Fora de escopo

`me_subcategoria` · reordenar/ícone de categoria · categoria com cor automática por tipo · corrigir demais mocks do estoque.
