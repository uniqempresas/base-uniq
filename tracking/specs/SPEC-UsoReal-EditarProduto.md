# SPEC — Edição de Produto (dados básicos) + Tags

> **PRD:** `tracking/plans/PRD-UsoReal-EditarProduto.md`
> **WIRE:** `tracking/wireframe/WIRE-UsoReal-EditarCliente.md` (mesmo WIRE delta de edição — autorizado pelo fundador em 11/09/2026, "pode seguir direto")
> **Origem:** extensão do fluxo de edição de cliente (11/09/2026) — Edit2 de produto é inerte; produtos não têm tags.
> **Supabase oficial:** `krrkfgvdwhpelxtrdtla.supabase.co` (já configurado em `src/lib/supabase.ts` — NÃO alterar).
> **Mapa do módulo:** relatório do explorer exp-1 (`ses_f6d62fecdffedn8ue747oSEctD`), confirmado manualmente.

---

## 0. Contexto mínimo

- App Vite + React multi-tenant. `useAuth()` expõe `{ user, session, perfil, empresa, loading }`.
- **Mock-first (07/09/2026):** mock só em modo demo (sem sessão). Com sessão, dados reais; sem `empresa_id` resolvido, hooks **falham com erro explícito** e NÃO gravam.
- `me_produto` (colunas reais confirmadas): `id integer PK`, `empresa_id uuid?`, `nome_produto text?`, `preco numeric?`, `preco_varejo numeric?`, `preco_custo numeric?`, `sku text?`, `estoque_atual integer? default 0`, `categoria_id integer?`, `ativo boolean? default true`, `unidade_medida_id integer?`, `subcategoria_id integer?`, `tipo text? default 'simples'`, **`opcoes_config jsonb? default '[]'`**, `descricao text?`, `codigo_barras text?`, `foto_url text?`, `exibir_vitrine boolean? default false`.

> **Decisão de tags (11/09/2026):** `me_produto` NÃO tem coluna `tags` e não há tabela de ligação. **Tags de produto = `opcoes_config` (jsonb, array de strings)**. Verificado: todos os registros têm `opcoes_config = []` — campo livre, sem migration.

---

## 1. Arquivos

### Modificados
- [ ] `src/app/components/estoque/estoqueMockData.ts` — adicionar `tags?: string[]` à interface `Produto` (linha 24-49) e a alguns mocks
- [ ] `src/app/hooks/use-criar-produto.ts` — estender `CriarProdutoParams` com `codigoBarras?`, `descricao?`, `tags?: string[]`; gravar `codigo_barras`, `descricao`, `opcoes_config`
- [ ] `src/app/hooks/use-atualizar-produto.ts` — estender `AtualizarProdutoParams` com `codigoBarras?`, `descricao?`, `tags?: string[]`; mapear `opcoes_config`
- [ ] `src/app/hooks/use-produtos.ts` — `mapProduto` passa a ler `opcoes_config` → `tags`
- [ ] `src/app/hooks/use-produto.ts` — idem `mapProduto`
- [ ] `src/app/components/estoque/ProdutosPage.tsx` — extrair modal para componente compartilhado; state `produtoParaEditar`; wiring Edit2 card/lista
- [ ] `src/app/components/estoque/ProdutoDetalhePage.tsx` — wire "Editar" (linha ~329-332 e "Editar produto" ~459) + recarga após salvar via `useProduto` (já expõe `recarregar`)

### Criados
- [ ] `src/app/components/estoque/ProdutoFormModal.tsx` — modal compartilhado novo/editar (extraído do `NovoProdutoModal`)

---

## 2. Tipo `Produto` e mocks

```ts
// estoqueMockData.ts:24-49 — adicionar campo
export interface Produto {
  // ...campos atuais...
  tags?: string[];   // NOVO — nomes das tags (persistido em me_produto.opcoes_config)
}
```

Adicionar `tags` a pelo menos 2–3 mocks (`estoqueMockData.ts`).

---

## 3. Hooks de escrita — estender

### 3.1 `use-criar-produto.ts`

Espelhar a estrutura atual (linhas 5-57). Estender params e insert:

```ts
export interface CriarProdutoParams {
  nome: string;
  sku?: string;
  codigoBarras?: string;      // NOVO
  categoria?: string;
  precoVenda: number;
  precoCusto?: number;
  estoque?: number;
  descricao?: string;         // NOVO
  fotoUrl?: string;
  tags?: string[];            // NOVO
}
```

Insert de `opcoes_config` (linha ~41-57):
```ts
opcoes_config: params.tags?.length ? params.tags : [],   // jsonb array de strings
```
> `opcoes_config` já tem default `'[]'` no banco; enviar explicitamente para consistência.

### 3.2 `use-atualizar-produto.ts`

Espelhar a estrutura atual (linhas 5-62). Estender params, mapear e incluir no update:

```ts
export interface AtualizarProdutoParams {
  id: number;
  nome?: string;
  sku?: string;
  codigoBarras?: string;   // NOVO → codigo_barras
  categoria?: string;
  precoVenda?: number;
  precoCusto?: number;
  estoque?: number;
  descricao?: string;      // NOVO → descricao
  fotoUrl?: string;
  ativo?: boolean;
  tags?: string[];         // NOVO → opcoes_config
}
```

No objeto de update (linha ~46-62), adicionar condicionalmente:
```ts
(codigoBarras !== undefined) && (obj.codigo_barras = codigoBarras),
(descricao !== undefined) && (obj.descricao = descricao),
(tags !== undefined) && (obj.opcoes_config = tags),
```

Update continua filtrado por `.eq("id", id).eq("empresa_id", empresaId)`.

---

## 4. Leitura — `mapProduto` (use-produtos.ts:36-60 e use-produto.ts idem)

```ts
// dentro de mapProduto — adicionar
const opcoes = Array.isArray(db.opcoes_config) ? db.opcoes_config : [];
tags: opcoes.filter((v): v is string => typeof v === "string"),
```

> **Defensivo:** só strings viram tags; entradas não-string (uso futuro da coluna) são ignoradas.

---

## 5. Componente `ProdutoFormModal.tsx` (extraído + generalizado)

**Extrair** o `NovoProdutoModal` de `ProdutosPage.tsx:214-604` para `src/app/components/estoque/ProdutoFormModal.tsx` SEM alterar o layout/markup (regra: wireframe entrega estrutura, design real no OpenDesign).

**Assinatura nova:**

```tsx
interface ProdutoFormModalProps {
  produto?: Produto | null;   // null/undefined = modo criar; Produto = modo editar
  tags: Tag[];                // catálogo via useTags (mesmo de clientes)
  onClose: () => void;
  onSuccess: () => void;
}
```

**Diferenças por modo:**

| Ponto | Criar (hoje) | Editar (novo) |
|-------|--------------|---------------|
| Título | "Novo Produto" | "Editar Produto" |
| Estado inicial | `{ nome:"", sku:"", categoria:"", unidade:"", precoCusto:0, precoVenda:0, estoque:0, estoqueMinimo:0, codigoBarras:"", descricao:"" }` | `{ ...preenchido do produto }` |
| Tags | `[]` | `produto.tags || []` |
| Campos não-controlados (codigoBarras 401-405, descricao 547-551) | descartados no save | **controlados e persistidos** |
| Hook | `useCriarProduto()` | `useAtualizarProduto()` → `atualizarProduto({ id: Number(produto.id), ... })` |
| Texto botão salvar | "Salvar produto 🎉" | "Salvar alterações" / "Salvando..." |

> **⚠️ `produto.id` é string no front** (mock "p1"; DB number → `String(db.id)` em `mapProduto`). Converter com `Number(produto.id)` no submit do modo editar (mesmo padrão de `handleExcluirProduto`, ProdutosPage.tsx:629).

**Seletor de tags:** reutilizar o padrão de UI do formulário de cliente (chips de tag com paleta via `getTagPalette`, catálogo `useTags`). Se o `NovoProdutoModal` não tiver seletor de tags hoje, adicionar o mesmo bloco de chips usado no `ClienteFormModal` (extraído na entrega de cliente) ou no `NovoClienteModal` atual (`ClientesPage.tsx`).

**Estados:** loading no botão salvar (`Loader2 animate-spin`), erro inline (`text-xs text-red-600`), `setErro("")` no início do submit. Mesmo markup do modal atual: overlay `bg-black/50 z-50`, card com header + X, form com passos (`Próximo →`), footer Cancelar/Salvar.

---

## 6. Wiring — `ProdutosPage.tsx`

### 6.1 Novo state
```ts
const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | null>(null);
```

### 6.2 Modal compartilhado (substitui `NovoProdutoModal`)
```tsx
{showNovoProdutoModal && (
  <ProdutoFormModal
    tags={tagsConfig}
    onClose={() => setShowNovoProdutoModal(false)}
    onSuccess={() => {
      setShowNovoProdutoModal(false);
      showToast("Produto cadastrado com sucesso!");
      recarregar();
    }}
  />
)}
{produtoParaEditar && (
  <ProdutoFormModal
    produto={produtoParaEditar}
    tags={tagsConfig}
    onClose={() => setProdutoParaEditar(null)}
    onSuccess={() => {
      setProdutoParaEditar(null);
      showToast("Produto atualizado com sucesso!");
      recarregar();
    }}
  />
)}
```
> Adicionar `const { tags: tagsConfig } = useTags();` se a página ainda não tiver (verificar — hoje ProdutosPage usa hooks de produto, não `useTags`).

### 6.3 Card (hover) — `ProdutoGridCard`
- Botão Edit2 (linha 123-128): trocar `onClick={(e) => e.stopPropagation()}` por:
  ```tsx
  onClick={(e) => { e.stopPropagation(); onEdit(); }}
  ```
- Adicionar prop `onEdit: () => void` a `ProdutoGridCard` e passar `onEdit={() => setProdutoParaEditar(p)}` na renderização (linha ~950).

### 6.4 Lista (tabela, linha 1003-1014)
- Botão Edit2 (1005): adicionar `onClick={() => setProdutoParaEditar(p)}`.

---

## 7. Wiring — `ProdutoDetalhePage.tsx`

- Já usa `useProduto(id)` (linha 178) que **expõe `recarregar`** (linha 144).
- Novo state: `const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | null>(null);`
- Importar `ProdutoFormModal`; adicionar `const { tags: tagsConfig } = useTags();` (verificar se já existe).
- Botão "Editar" (header, linha 329-332): adicionar `onClick={() => setProdutoParaEditar(produto)}`.
- "Editar produto" (Ações Rápidas, linha 459): `action: () => setProdutoParaEditar(produto)`.
- Renderizar o modal:
  ```tsx
  {produtoParaEditar && (
    <ProdutoFormModal
      produto={produtoParaEditar}
      tags={tagsConfig}
      onClose={() => setProdutoParaEditar(null)}
      onSuccess={() => {
        setProdutoParaEditar(null);
        recarregar();
        showToast("Produto atualizado com sucesso!");
      }}
    />
  )}
  ```

---

## 8. Verificação (Definition of Done)

- [ ] Card: Edit2 abre modal pré-preenchido; salvar atualiza e recarrega + toast
- [ ] Lista: Edit2 idem
- [ ] Detalhe: "Editar" (header e ações rápidas) abre modal; salvar recarrega o detalhe + toast
- [ ] CodigoBarras/descricao preenchidos no form persistem após salvar/recarregar
- [ ] Tags selecionadas persistem em `me_produto.opcoes_config` após recarregar
- [ ] Ajuste de estoque e exclusão continuam funcionando (regressão)
- [ ] Salvar sem sessão/empresa mostra erro explícito, não grava
- [ ] Criar produto continua funcionando (modal compartilhado em modo criar)
- [ ] `npm run build` passa; push → Vercel READY; fundador valida no celular
- [ ] Tracking `tracking/USO_REAL_DOCEE.md` e docs SDD atualizados

---

## 9. O que NÃO fazer

- Não tocar em `src/lib/supabase.ts`, tabelas, RLS, edge functions.
- Não criar tabela de ligação produto↔tag nem alterar `me_tag`.
- Não implementar exclusão real (soft-delete atual `ativo:false` permanece).
- Não redesenhar o modal (copiar markup existente).
- Não migrar para Next.js.