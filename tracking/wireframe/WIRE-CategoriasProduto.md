# WIRE — Categorias de Produto (CRUD + uso no cadastro)

> **PRD:** `tracking/plans/PRD-CategoriasProduto.md`
> **SPEC:** `tracking/specs/SPEC-CategoriasProduto.md`
> **Status:** ✅ **APROVADO POR REFERÊNCIA** — o fundador dispensou confirmação formal:
> *"não precisa me confirmar o Wire se for igual a tela de CRM configurações, pois já está aprovado."*
> **Referência vinculante:** `WIRE`/tela **Configurações do CRM** (`/crm/configuracoes` + `use-tags`), já aprovada.

---

## 1. Regra de aprovação

Este wireframe **não introduz layout novo**. Ele replica a tela de tags do CRM, que já foi aprovada e está em produção. Onde houver diferença, ela está listada na §5 (explicitamente como desvio) — qualquer coisa fora dessa lista é fiel à referência.

---

## 2. Tela `/estoque/configuracoes` — Configurações de Produtos

```
┌────────────────────────────────────────────────────────┐
│  ←   Configurações de Produtos                         │
│      5 categorias configuradas                         │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ▢  Categorias de produtos                       │  │
│  │     As categorias agrupam os produtos e alimentam │  │
│  │     a barra de categorias da loja virtual.       │  │
│  │                                                  │  │
│  │  ┌── Nova categoria ─────────────────────────┐   │  │
│  │  │  [ Ex: Trufa                        ]     │   │  │
│  │  │                          ┌──────────────┐ │   │  │
│  │  │                          │ + Adicionar  │ │   │  │
│  │  │                          └──────────────┘ │   │  │
│  │  │  Cor                                      │   │  │
│  │  │  ● ● ● ● ● ● ● ● ●       (chip) Preview   │   │  │
│  │  └───────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ ●  (Cone Trufado)   Cone Trufado   ✎  🗑  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ ●  (Trufa)          Trufa          ✎  🗑  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Categorias removidas deixam de aparecer em novos      │
│  cadastros, mas continuam valendo nos produtos já      │
│  cadastrados.                                          │
└────────────────────────────────────────────────────────┘
```

> A lista mostra **apenas as categorias da própria empresa** (D6). As globais da
> Base UNIQ (`Geral`, `Pães e Doces`, `Bebidas`) são compartilhadas entre tenants
> e por isso não aparecem neste CRUD nem no seletor do produto.

### Linha em modo edição (inline)

```
│  ┌────────────────────────────────────────────┐  │
│  │  [ Trufa________________ ]  ● ● ● ● ●      │  │
│  │                        ✓ Salvar   ✕       │  │
│  └────────────────────────────────────────────┘  │
```

---

## 3. Modal de produto — seção Categoria

Substitui as chips do mock pelas **reais**, com a cor de cada categoria:

```
┌────────────────────────────────────────────────────────┐
│  Categoria *                                           │
│  ┌────────────┐ ┌───────┐ ┌──────────┐ ┌────────────┐  │
│  │Cone Trufado│ │ Trufa │ │ Tortinha │ │ Surpresa   │  │
│  └────────────┘ └───────┘ └──────────┘ └────────────┘  │
│  ┌──────────┐  ┌──────────────────────┐                │
│  │ Especial │  │ + Criar categoria    │                │
│  └──────────┘  └──────────────────────┘                │
│                                                        │
│  ▸ ao tocar em "+ Criar categoria":                    │
│  ┌───────────────────────────────┐                     │
│  │ [ Nova categoria        ]  ✓  │                     │
│  └───────────────────────────────┘                     │
│    a nova categoria já sai selecionada                 │
└────────────────────────────────────────────────────────┘
```

**Chip selecionada** = fundo tintado + texto na cor + borda `2px solid {cor}40` — idêntico ao comportamento atual das chips do formulário.

---

## 4. Estados

| Bloco | loading | vazio | erro | sucesso |
|---|---|---|---|---|
| Lista de categorias | 4 linhas skeleton | "Nenhuma categoria ainda — adicione a primeira acima" | card vermelho + "Tentar novamente" | lista |
| Chips no modal | 3 chips skeleton | "Nenhuma categoria. Configure em Categorias ›" | fallback neutro | chips |
| Criar categoria | spinner no botão | — | toast de erro | toast de sucesso + campo limpo |
| Remover categoria | spinner na linha | — | toast de erro | toast + linha some |

**Aviso de remoção** (quando a categoria tem produtos):

```
┌──────────────────────────────────────────┐
│  Remover "Trufa"?                        │
│                                          │
│  5 produtos usam esta categoria.         │
│  Ela deixa de aparecer em novos          │
│  cadastros, mas os produtos MANTÊM a     │
│  categoria.                              │
│                                          │
│              [ Cancelar ]  [ Remover ]   │
└──────────────────────────────────────────┘
```

---

## 5. Desvios da referência (aprovados por serem consequência do banco)

| # | Desvio | Motivo |
|---|---|---|
| 1 | **Botão editar (✎)** que as tags não têm | O fundador pediu explicitamente *"cadastrar e **editar** categorias"* — tags só criam e removem |
| 2 | **Remoção é soft delete** (`ativo = false`), igual às tags | Decisão **D4**: o produto mantém a categoria que já tinha. Exigiu `ALTER TABLE me_categoria ADD COLUMN ativo` (as tags já tinham; categorias não) |
| 3 | **Aviso com contagem** antes de remover | O usuário precisa saber quantos produtos usam a categoria — e que eles **não** perdem o rótulo |
| 4 | **"+ Criar categoria" dentro do modal de produto** | O pedido de origem foi *"não conseguimos inserir as categorias do produto"* — criar sem sair da tela resolve na hora |
| 5 | **Sem categorias globais na lista** | Decisão **D6**: `empresa_id IS NULL` é compartilhado entre tenants; um tenant não pode editar o que é de todos |
| 6 | **Cor obrigatória na criação** | `me_categoria` não tinha `cor` (D3). Sem ela, todas as chips do formulário cairiam na cor de fallback "Outros" |

---

## 6. Acessibilidade

- Botão de configuração no header de produtos: `aria-label="Configurações de categorias"`
- Botões de editar/excluir: `aria-label` com o nome da categoria
- Chips do modal: `aria-pressed`
- Paleta de cor: `aria-label="Cor {hex}"`
- Foco visível em todos os controles; edição inline devolve o foco ao input
- O nome da categoria nunca é comunicado só por cor — sempre há o texto

---

## 7. Fora deste WIRE

`me_subcategoria` · reordenar categorias · ícone por categoria · mover produto em massa entre categorias.
