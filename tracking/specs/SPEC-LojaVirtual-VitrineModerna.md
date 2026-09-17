# SPEC — Loja Virtual: Vitrine Moderna (visão do cliente final)

> **PRD:** `tracking/plans/PRD-LojaVirtual-VitrineModerna.md`
> **WIRE:** `tracking/wireframe/WIRE-LojaVirtual-VitrineModerna.md`
> **Status:** 🔶 Rascunho técnico — aguarda WIRE aprovado para implementar
> **Regra de ouro:** sem WIRE aprovado, não se escreve código de tela.

---

## 1. Arquivos

### Novos

| Arquivo | Papel |
|---|---|
| `src/app/hooks/use-loja-categorias.ts` | Lê `me_categoria` (global + da empresa) e conta produtos na vitrine por categoria |
| `src/app/hooks/use-loja-appearance.ts` | Lê `me_empresa.appearance` (`hero`, `theme`) + `store_config` e resolve banner/fallback |
| `src/app/components/loja/LojaHeaderTenant.tsx` | Header: identidade, área do cliente, busca, categorias, carrinho |
| `src/app/components/loja/LojaBannerCarousel.tsx` | Carrossel do banner (scroll-snap + autoplay) |
| `src/app/components/loja/LojaCategoriaBar.tsx` | Trilha horizontal de categorias |
| `src/app/components/loja/LojaSecaoHorizontal.tsx` | Seção com scroll lateral (destaques/ofertas) |

### Alterados

| Arquivo | Mudança |
|---|---|
| `src/app/components/loja/LojaPage.tsx` | `LojaVitrineTenant` (263–429) passa a compor os novos blocos; `VitrineCardTenant` (213–261) recebe categoria, selo de desconto (condicional) e estado "no carrinho" |
| `src/app/types/loja.ts` | `ProdutoLoja` ganha `categoriaId`, `categoriaNome`, `precoDe` (opcional); novos tipos `CategoriaLoja`, `LojaAppearance`, `BannerLoja` |
| `src/app/hooks/use-loja-produtos.ts` | `select` (linha 59) passa a trazer `categoria_id`, `preco_varejo`, `tipo`; mapper resolve o nome da categoria |
| `src/app/hooks/use-loja-tenant.ts` | `select` (linha 42) passa a trazer `store_config`, `appearance` |
| `src/app/components/estoque/ProdutoFormModal.tsx` | Categoria vira **select de `me_categoria`** (grava `categoria_id`) em vez de lista do mock (**V2**) |
| `src/app/hooks/use-criar-produto.ts` / `use-atualizar-produto.ts` | Passam a gravar `categoria_id` além/em vez de `tipo` |

### Intocados (não regredir)

`/loja` demo (`LojaPage.tsx:432–720`) · `CheckoutPage` · `ProdutoLojaPage` · `MeusPedidosPage` · `EntrarClientePage` · `ContaClientePage` · `use-loja-criar-pedido` · `use-carrinho-loja`.

---

## 2. Contrato de dados (real — verificado no Supabase oficial)

```ts
// me_categoria
interface DBCategoria {
  id_categoria: number;
  empresa_id: string | null;   // null = global
  nome_categoria: string;
}

// me_produto (campos relevantes)
// id · empresa_id · nome_produto · preco · preco_varejo · preco_custo · sku
// estoque_atual · categoria_id · ativo · subcategoria_id · tipo
// opcoes_config · descricao · codigo_barras · foto_url · exibir_vitrine

// me_empresa
// id · slug · nome_fantasia · telefone · email · logo_url · store_config(jsonb) · appearance(jsonb)
```

### Consulta do catálogo (vitrine) — hoje incompleta

```ts
// use-loja-produtos.ts:59 — ATUAL
.select("id, nome_produto, preco, foto_url, descricao, estoque_atual")
.eq("empresa_id", empresaId).eq("ativo", true).eq("exibir_vitrine", true)

// NOVO
.select("id, nome_produto, preco, preco_varejo, foto_url, descricao, estoque_atual, categoria_id, tipo")
```

### Consulta de categorias (nova)

```ts
// categorias globais + da empresa, apenas as que têm produto na vitrine
supabase.from("me_categoria")
  .select("id_categoria, empresa_id, nome_categoria")
  .or(`empresa_id.is.null,empresa_id.eq.${empresaId}`)
  .order("nome_categoria")
```
O contador "tem produto?" é resolvido **em memória**, a partir da lista de produtos já carregada (evita N+1 e uma segunda ida ao banco).

---

## 3. Tipos (`src/app/types/loja.ts`)

```ts
export interface CategoriaLoja {
  id: number;
  nome: string;
  global: boolean;
  totalProdutos: number;
}

export interface BannerLoja {
  id: string;
  desktopUrl: string | null;
  mobileUrl: string | null;
  titulo: string;
  subtitulo: string;
  textoBotao: string | null;
  corBotao: string | null;
  posicaoBotao: "bottom-left" | "bottom-right" | null;
  corTexto: string | null;
  linkTipo: "product" | "external" | "category" | null;
  linkValor: string | null;
}

export interface LojaAppearance {
  banners: BannerLoja[];
  autoplay: boolean;
  interval: number;              // ms, default 5000
  tema: { fontFamily?: string; borderRadius?: string; primaryColor?: string; secondaryColor?: string };
  origem: "config" | "gerado";    // "gerado" = fallback do tenant (V3)
}

// ProdutoLoja ganha:
categoriaId?: number | null;
categoriaNome?: string;
precoDe?: number | null;         // preço "de" (riscado) — só quando real
```

**Regra de degradação (V6):** `precoDe` só é preenchido se `preco_varejo != null && preco_varejo > preco`. Caso contrário `null` e **o selo não é renderizado**.

---

## 4. Hooks

### `use-loja-appearance(empresaId, fallback)`

1. Lê `appearance.hero.banners[]` → mapeia para `BannerLoja[]` (snake → camel).
2. Se `banners.length === 0` → monta **1 banner gerado**: nome fantasia + `store_config.slogan`/`description` + `logo_url`, usando tokens do `DESIGN.md`.
3. Lê `appearance.theme` → `tema` (default = Design System).
4. `interval` default `5000`, `autoplay` default `true`.
5. Retorna `{ appearance, loading, error }` — **sem** fallback para outro tenant (jamais).

### `use-loja-categorias(empresaId, produtos)`

Recebe os produtos já carregados, deriva as categorias presentes e devolve:
- `categorias: CategoriaLoja[]` — só as com `totalProdutos > 0`, ordenadas, com "Tudo" no início (render).
- Mantém `categoria_id` órfão fora da lista (produto sem categoria cai em "Outros" **somente** se houver algum).

---

## 5. Componentes

### `LojaHeaderTenant`
- Linha 1: logo/avatar + nome fantasia + **botão de sessão** (Entrar ↔ Meus pedidos, `useLojaSessao(slug)`) + **carrinho com contador** (`carrinho.quantidadeTotal`).
- Linha 2: **busca** (ícone + input + limpar) — inline, não mais em bloco separado.
- Linha 3: **categorias** — delega a `LojaCategoriaBar`.
- Sticky no topo (padrão já usado na demo).

### `LojaBannerCarousel`
- `flex` + `overflow-x-auto` + `scroll-snap-type: x mandatory`; um slide por banner (`scroll-snap-align: center`).
- **Autoplay** com `setInterval(interval)`, cancelado no unmount e ao interagir; respeita `prefers-reduced-motion`.
- `<picture>`: `desktop_url` (≥ 640px) / `mobile_url`; fallback = banner gerado (texto sobre superfície, sem imagem).
- Indicador de posição (dots) + alvo de toque ≥ 44px; navegação por teclado (setas) e `aria-label` por slide.
- **Nunca** renderiza `mobile_url` de outra empresa (o hook já é escopado por `empresa_id`).

### `LojaCategoriaBar`
- `overflow-x-auto`, `shrink-0`, "Tudo" + categorias; estado ativo com verde menta.
- Selecionada → filtra a grade (mesmo predicado do `useState` de categoria).
- Sem categorias → **bloco não renderiza** (não mostrar trilha vazia).

### `LojaSecaoHorizontal`
- Título + "Ver todos" + trilha com scroll lateral de cards compactos.
- Renderiza só se houver ≥ 1 item; caso contrário não ocupa espaço.

### `VitrineCardTenant` (evolução)
- Mantém foto, nome, preço, ação. Ganha: **categoria** (micro-texto), **selo de desconto condicional** (V6), selo "Esgotado".
- Estados do botão: `Adicionar` → `✓ Adicionado!` (1,5s) → `✓ No Carrinho`; `Indisponível` com estoque 0 e `estoqueMax`.

---

## 6. Estados (obrigatórios)

| Bloco | loading | vazio | erro | sucesso |
|---|---|---|---|---|
| Categorias | oculto até carregar | não renderiza | não renderiza | trilha |
| Banner | skeleton com a altura final (evita CLS) | banner gerado | banner gerado | carrossel |
| Grade | skeleton de 4 cards | empty + CTA WhatsApp | banner de retry (`refetch`) | cards |
| Header/carrinho | contador só após sessão/carrinho prontos | — | — | — |

**Regra mock-first vigente:** banco vazio **ou** erro → mock com aviso "Exibindo catálogo de demonstração" (`isFallback`), preservado do hook atual.

---

## 7. Responsivo

| Breakpoint | Grid | Banner | Container |
|---|---|---|---|
| mobile (< 640) | 2 col | h-32 a h-40, 1 slide visível | padding 4 |
| tablet (≥ 640) | 3 col | h-44 | `max-w-3xl` → **`max-w-6xl`** |
| desktop (≥ 1024) | 4 col | h-56, com `desktop_url` | `max-w-6xl` |

Hierarquia de toque: alvos ≥ 44px no mobile; trilhas com `scroll-snap` e inércia nativa.

---

## 8. Acessibilidade

- Busca: `<label>` acessível + `aria-label`; tecla `Esc` limpa.
- Carrinho: `aria-label` com contagem ("Sacola, 3 itens").
- Carrossel: `role="region"` + `aria-roledescription="carrossel"`, setas do teclado, `aria-label` por slide, foco visível.
- Categorias: `aria-pressed` no item ativo.
- Nunca depender só de cor para estado (selo de desconto tem texto, não só fundo).

---

## 9. Checklist de implementação

- [ ] `me_categoria` atribuída aos 16 produtos da Doceê (`categoria_id` real) — pré-requisito da barra
- [ ] `use-loja-produtos` traz `categoria_id`/`preco_varejo` e resolve o nome da categoria
- [ ] `use-loja-tenant` traz `store_config`/`appearance`
- [ ] `use-loja-appearance` com banner **gerado** como fallback (nunca outro tenant)
- [ ] `use-loja-categorias` só com categorias que têm produto
- [ ] `LojaHeaderTenant` — busca + sessão + carrinho visíveis sem rolar (mobile)
- [ ] `LojaBannerCarousel` — autoplay, `prefers-reduced-motion`, teclado
- [ ] `LojaCategoriaBar` — filtra de fato e não renderiza vazia
- [ ] `LojaSecaoHorizontal` — condicional
- [ ] Selo de desconto **só** com dado real (V6)
- [ ] `ProdutoFormModal` grava `categoria_id` (V2)
- [ ] Isolamento por `empresa_id` preservado em toda query nova
- [ ] Estados: skeleton / empty / error / success nos blocos novos
- [ ] Responsivo 2 → 3 → 4 colunas
- [ ] Demo `/loja` e telas irmãs sem regressão
- [ ] `npm run build` ✅
- [ ] Commit + push → deploy Vercel `READY` → validação do fundador no celular
- [ ] `tracking/TRACKING.md` atualizado + checklist deste SPEC 100%

---

## 10. Fora de escopo (v1)

Editor de banner/tema no admin (V4) · gateway de pagamento · frete calculado · cupons · wishlist funcional · avaliações reais (o mock tem estrelas, o banco não) · avaliações/comentários · busca com ranking/fuzzy.

---

## 11. V2 — Categoria real no cadastro de produto (diagnóstico fechado, não implementado)

> Levantado em 17/09/2026 com dados reais do Supabase oficial. **Aguarda a decisão D-V2.1.**

### 11.1 O achado: `tipo` não é categoria

`me_produto.tipo` guarda **tipo de produto**, não categoria:

| `tipo` | produtos | leitura |
|---|---|---|
| `Outros` | 19 | default do formulário (`params.categoria \|\| "Outros"`) |
| `variavel` | 5 | produto com variações (`opcoes_config`) |
| `simples` | 2 | produto simples |

Mas a leitura trata como categoria:

```ts
// use-produtos.ts:50  e  use-produto.ts:50
categoria: db.tipo || "Outros",        // lê TIPO DE PRODUTO como CATEGORIA
```

E a gravação faz o inverso:

```ts
// use-criar-produto.ts:49  e  use-atualizar-produto.ts:51
tipo: params.categoria || "Outros",    // grava NOME DE CATEGORIA dentro de `tipo`
```

**Consequência:** a tela de estoque nunca exibiu categoria — exibia o tipo de produto, e "Outros" para a maioria. **É a origem do "Outros em massa".**

**Bug latente (ainda não corrompeu):** `ProdutoFormModal.tsx:10` monta a lista de categorias a partir do **mock** (`Roupas`, `Calçados`, `Cosméticos`…). Salvar um produto com uma delas grava esse texto em `tipo`. Verificado em 17/09/2026: o banco contém **apenas** `Outros`/`simples`/`variavel` — ou seja, **ninguém salvou ainda com categoria do mock**. O risco é imediato e vale mais que a v1.

### 11.2 Por que não é um commit pequeno

Corrigir só a gravação quebra a leitura, e vice-versa. A fatia exige, em conjunto:

1. **`ProdutoFormModal`** — select de categoria real (`me_categoria`: globais + da empresa) + opção de **criar categoria na hora** (senão o fundador não consegue adicionar novas).
2. **`use-criar-produto` / `use-atualizar-produto`** — gravar `categoria_id` e **parar de escrever em `tipo`**.
3. **`use-produtos` / `use-produto`** — resolver `categoria` a partir de `categoria_id` (via `me_categoria`), não de `tipo`.
4. **`ProdutosPage` / `ProdutoDetalhePage`** — passam a exibir a categoria real (sem mudança de UI esperada: `categoria: string` já é o contrato).
5. **`me_categoria`** — as globais hoje sem produto (`Geral`, `Pães e Doces`, `Bebidas`, `Produtos`, `Serviços`) passam a aparecer para seleção.

### 11.3 Decisão necessária (D-V2.1)

O que fazer com `me_produto.tipo`, agora que se sabe o que ele é?

| Opção | Efeito |
|---|---|
| **A — Preservar `tipo`, usar `categoria_id` para categoria (recomendada)** | Zero perda: `simples`/`variavel` continuam significando o que significam; categoria passa a viver só em `categoria_id` |
| B — Abandonar `tipo` (parar de ler e escrever) | O campo fica órfão e `simples`/`variavel` deixam de ser acessíveis |

**Recomendação: A.** `tipo` é informação legítima de produto — não deve ser sobrescrita nem ignorada.
