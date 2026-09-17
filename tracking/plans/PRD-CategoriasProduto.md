# PRD — Categorias de Produto (CRUD + uso no cadastro)

> **Sprint:** Estoque / Produtos (V2 do PRD-LojaVirtual-VitrineModerna)
> **Status:** ✅ WIRE aprovado por referência (o fundador dispensou confirmação: *"não precisa me confirmar o Wire se for igual a tela de CRM configurações"*)
> **Pipeline:** Research ✅ → **PRD (este)** → SPEC → WIRE → Implementação

---

## 1. WHY

O fundador não consegue **cadastrar categoria** em produto. O `ProdutoFormModal` monta a lista de categorias a partir do **mock** (`CATEGORIAS = [...new Set(PRODUTOS.map(p => p.categoria))]` → "Roupas", "Calçados", "Cosméticos") e grava a escolha em **`me_produto.tipo`** — um campo que significa **tipo de produto** (`simples`/`variavel`), não categoria.

Resultado: nenhuma categoria real chega ao banco, tudo vira "Outros", e a **barra de categorias da loja** (entregue em 17/09) fica sem munição — uma categoria nova não tem como ser criada.

**Além disso:** as categorias que existem (Cone Trufado, Trufa, Tortinha, Surpresa, Especial — criadas por migration) **não têm cor**, então todas as chips do formulário caem na cor de fallback "Outros". Falta o campo.

**Pedido literal do fundador:** *"não conseguimos inserir as categorias do produto, e também não conseguimos fazer o CRUD de categorias. Eu gostaria de ter algo semelhante ao que temos na página de clientes, onde eu tenho o botão de configuração e consigo editar tags e etiquetas."*

---

## 2. Referência aprovada

A tela de tags do CRM (`/crm/configuracoes` + `use-tags.ts`) é o **padrão oficial** deste trabalho:

| Elemento da referência | O que faz |
|---|---|
| Botão de configuração no header da listagem | Porta de entrada vinda da tela de clientes |
| Card com formulário de criação (nome + paleta de cor + preview) | Criar |
| Lista de itens com botão remover | Remover |
| Estados: loading (skeleton) · erro + retry · vazio | Regra mock-first do projeto |
| Aviso no rodapé explicando o efeito de remover | Transparência |

---

## 3. Contrato de dados (verificado no Supabase oficial)

```
me_categoria
  id_categoria   integer      PK          (categorias_pkey)
  empresa_id     uuid         NULLABLE    (FK me_empresa, ON DELETE CASCADE)
  nome_categoria varchar      NOT NULL
  criado_em / atualizado_em   timestamp
  ❌ NÃO tem `cor`      ❌ NÃO tem `ativo`      ❌ NÃO tem UNIQUE(empresa, nome)

me_produto.categoria_id integer → me_categoria(id_categoria)  ON DELETE SET NULL
```

**Três consequências que definem o desenho:**

1. **`empresa_id` nullable = categoria GLOBAL**, compartilhada entre tenants. Hoje existem globais: `Geral`, `Pães e Doces`, `Bebidas`, `Produtos`, `Serviços`.
   → **Categoria global é somente-leitura**: se um tenant editar/apagar, quebra os outros. A tela mostra as globais como catálogo, mas só permite editar as da própria empresa.
2. **Não existe `cor`** → o formulário de produto coloriria todas as chips com a cor de "Outros".
   → **Migration aditiva**: `ALTER TABLE me_categoria ADD COLUMN cor text`.
3. **A FK é `ON DELETE SET NULL`** → apagar categoria **não quebra** produto nenhum, mas deixa os produtos sem categoria.
   → **Exclusão é real (não soft delete)**, com aviso explícito de quantos produtos serão afetados. Diferente das tags, que têm `ativo` e por isso fazem soft delete — categorias não têm essa coluna, e a FK já foi desenhada para esse comportamento.

**Embed do PostgREST verificado** (resolve o nome da categoria na mesma query, sem fetch extra):

```
GET /rest/v1/me_produto?select=id,nome_produto,categoria_id,me_categoria(id_categoria,nome_categoria)
→ { "id": 72, "categoria_id": 38, "me_categoria": { "id_categoria": 38, "nome_categoria": "Cone Trufado" } }
```

---

## 4. O bug de origem (o que V2 corrige)

| Arquivo | Hoje | Consequência |
|---|---|---|
| `ProdutoFormModal.tsx:10` | categorias vindas do **mock** | opções fictícias |
| `use-criar-produto.ts:49` | `tipo: params.categoria \|\| "Outros"` | **grava nome de categoria dentro de `tipo`** |
| `use-atualizar-produto.ts:51` | `updateData.tipo = campos.categoria` | idem na edição |
| `use-produtos.ts:50` | `categoria: db.tipo \|\| "Outros"` | **lê tipo de produto como se fosse categoria** |
| `use-produto.ts:50` | idem | idem |
| `me_produto.categoria_id` | **nunca lido nem escrito pelo app** | coluna correta, ignorada |

Correção (decisão **D-V2.1 = opção A**, recomendada): **preservar `tipo` como tipo de produto** e passar a usar `categoria_id` para categoria. `tipo` deixa de ser lido e escrito pelo fluxo de categoria — não é apagado nem sobrescrito.

---

## 5. Escopo

**Entra:**
1. **Migration**: `me_categoria.cor` + índice único (empresa, nome) — não existe hoje e evita categoria duplicada dividindo a barra da loja
2. **Hook `use-categorias.ts`** — listar (globais + da empresa), criar, renomear, trocar cor, excluir
3. **Tela `/estoque/configuracoes`** — CRUD espelhando a tela de tags do CRM
4. **Botão de configuração** no header de `/estoque/produtos`
5. **`ProdutoFormModal`** — chips de categoria **reais** (com cor), gravando `categoria_id`, + **criar categoria sem sair do modal**
6. **Correção da leitura** — `use-produtos` / `use-produto` resolvem a categoria pelo `categoria_id` (embed), expondo `categoriaId` + `categoria`
7. Categorias **globais** visíveis mas **não editáveis** na tela

**Não entra:**
- `me_subcategoria` (existe no banco, com `id_categoria` — fica para depois)
- Reordenar categorias · ícone por categoria · categoria por fornecedor
- Corrigir o conteúdo mock de outras telas de estoque (trilha separada)

---

## 6. Critérios de aceite

- [ ] Em `/estoque/configuracoes` consigo **criar, renomear, trocar a cor e excluir** uma categoria da minha empresa
- [ ] Categoria **global** aparece marcada como tal e **não** oferece editar/excluir
- [ ] Criar categoria com nome repetido → **mensagem clara**, sem duplicar (case-insensitive)
- [ ] Excluir categoria que tem produtos → **avisa quantos** ficarão sem categoria, e o produto **não** é apagado
- [ ] No modal de produto, a categoria vem do **banco** e está **pré-selecionada** ao editar um produto existente
- [ ] Salvar produto grava **`categoria_id`** e **não** escreve nome de categoria em `tipo`
- [ ] A lista de produtos exibe a **categoria real** (não mais "Outros") e o **filtro por categoria** funciona com as categorias reais
- [ ] Consigo **criar uma categoria dentro do modal** de produto e ela já sai selecionada
- [ ] Estados: loading, erro com retry, vazio, sucesso
- [ ] `npm run build` ✅ · deploy Vercel validado no celular
- [ ] `tracking/TRACKING.md` atualizado

---

## 7. Riscos

| Risco | Mitigação |
|---|---|
| Tocar em `tipo` e perder semântica de produto (`simples`/`variavel`) | D-V2.1: `tipo` **não** é escrito nem lido pelo fluxo de categoria |
| Editar categoria **global** e quebrar outro tenant | Globais são somente-leitura na tela |
| Excluir categoria com produtos sem o usuário perceber | Aviso com a contagem antes de confirmar; FK é SET NULL, produto nunca é apagado |
| Duas categorias com o mesmo nome dividindo a barra da loja | Índice único (empresa, lower(nome)) + tratamento do erro 23505 |
| Formulário de produto é tela viva da operação | Mudança incremental; build + checagem de tipos antes de subir |

---

## 8. Decisões

| # | Decisão | Resolução | Por quê |
|---|---|---|---|
| **D1** | `tipo` vs `categoria_id` | **Preservar `tipo`.** Categoria passa a viver **só** em `categoria_id` | `tipo` guarda `simples`/`variavel` — informação legítima. Sobrescrever com nome de categoria é corrupção |
| **D2** | Espelhar a tela de tags | Tela nova igual à do CRM, **mais** o botão **editar** (tags não têm) | Pedido explícito: *"cadastrar **e editar** categorias"* |
| **D3** | Cor da categoria | **Adicionar `cor`** em `me_categoria` | É o que torna a tela idêntica à aprovada, e a cor da categoria passa a ser **real** (hoje vem de um mapa mock) |
| **D4** | Remover categoria | **Soft delete** (`ativo = false`), como as tags — **adicionar `ativo`** | Mantém o produto com a categoria que ele já tinha, igual à nota das tags que o fundador já conhece |
| **D5** | Duplicatas | Índice único **parcial** (`lower(nome)`, `WHERE ativo = true`) | Impede duas "Trufa"; sendo parcial, permite recriar um nome já removido |
| **D6** | Categorias globais | Não entram no CRUD nem no seletor; seguem existindo só para a loja | `empresa_id IS NULL` é compartilhado — um tenant não pode quebrar o outro |
| **D7** | Lista no modal | Categorias **da empresa** por prop (`categorias={...}`), igual a `tags={...}` | Mesmo padrão aprovado; sem hook dentro do modal |

### Não-objetivos (v1)

- **Não** mexer em `me_produto.tipo` — é tipo de produto e será **preservado**
- **Não** editar/apagar categorias **globais**
- **Não** implementar subcategorias (`me_subcategoria` segue fora)
- **Não** migrar dados antigos: os 16 produtos da Doceê já estão com `categoria_id` correto

---

## 9. Documentos irmãos

- **SPEC:** `tracking/specs/SPEC-CategoriasProduto.md`
- **WIRE:** `tracking/wireframe/WIRE-CategoriasProduto.md`
- **Origem:** `PRD-LojaVirtual-VitrineModerna.md` §4 (V2) e §11 (diagnóstico)
