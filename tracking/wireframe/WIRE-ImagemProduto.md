# WIRE — Imagem de Produto (upload + exibição)

> **PRD:** `tracking/plans/PRD-ImagemProduto.md`
> **SPEC:** `tracking/specs/SPEC-ImagemProduto.md`
> **Estrutura e função** (design real = OpenDesign; não polir visual em código).
> **Fluxo:** anexar foto no cadastro/edição de produto → upload para `uniq_me_produtos` → URL em `foto_url` → foto aparece no grid, detalhe e vitrine/pedidos (estes já mapeiam `fotoUrl`).

---

## Tela 1: Modal `ProdutoFormModal` — passo 1 "Informações" (modificado)

```
┌──────────────────────────────────────────────┐
│  Novo Produto                       Passo 1/3 [X] │
├──────────────────────────────────────────────┤
│  ● Informações    ○ Preços    ○ Estoque       │
│                                               │
│  Foto do produto                              │
│  ┌────────────┐  [📷 Enviar foto]  [🗑 Remover]│
│  │            │  JPG, PNG ou WebP · máx 5 MB  │
│  │  [foto] /  │                               │
│  │  📦        │                               │
│  └────────────┘                               │
│  [erroFoto inline — vermelho, só quando erro] │
│                                               │
│  Nome do produto *                            │
│  ┌──────────────────────────────────────┐     │
│  │                                      │     │
│  └──────────────────────────────────────┘     │
│  ... (demais campos do passo 1 inalterados)   │
├──────────────────────────────────────────────┤
│                     [Cancelar]  [Próximo →]   │
└──────────────────────────────────────────────┘
```

### Comportamentos

| Ação | Estado | Comportamento |
|---|---|---|
| **Enviar foto** (input file oculto, `accept="image/*"`) | preview vazio | Abre seletor; imagem selecionada → preview instantâneo (`object-cover`), pronto para salvar |
| **Trocar foto** | preview preenchido | Abre seletor; nova imagem substitui o preview (mesmo fluxo) |
| Arquivo inválido (não-imagem / > 5 MB) | — | `erroFoto` inline: "Envie uma imagem (JPG, PNG ou WebP)." / "Imagem muito grande. Envie uma foto de até 5 MB."; preview NÃO muda |
| **Remover** | foto existente | Limpa preview; na edição marca `foto_url = ""` ao salvar (grid volta ao placeholder) |
| **Salvar** (botão "Salvar produto 🎉"/"Salvar alterações") | com foto nova | Upload → Storage → salva produto com `fotoUrl`; falhou upload → erro inline e produto NÃO salva |
| **Salvar** | sem sessão/empresa | Erro explícito "Empresa não identificada..."; nada é enviado |
| **Salvar** | salvando | Botão desabilitado com `Loader2 animate-spin` + "Salvando..." (cobre upload + save) |
| **Duplicar** | produtoBase com foto | Preview mostra a foto do original; salva propagando a URL existente (não re-envia arquivo na v1) |

### Estados do preview

| Estado | Visual |
|---|---|
| Sem foto | Bloco `rounded-2xl` com fundo da categoria + ícone `Package` opaco 40% |
| Com foto (banco) | `img` `w-full h-full object-cover` no bloco `w-24 h-24 rounded-2xl overflow-hidden` |
| Com foto (selecionada) | Idem, via `objectURL` (troca para URL pública após salvar) |
| Erro de upload | `erroFoto` inline vermelho; preview mantém a seleção para tentar de novo |

---

## Tela 2: Lista de Produtos — Grid card (modificado)

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │
│ │ 🖼 foto  │ │ │ │ 🖼 foto  │ │ │ │ 📦       │ │
│ │(produto) │ │ │ │(produto) │ │ │ │          │ │
│ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │
│  ESTOQUE     │ │  ESTOQUE     │ │  ESTOQUE     │
│  Nome        │ │  Nome        │ │  Nome        │ ← um sem foto mantém
│  SKU         │ │  SKU         │ │  SKU         │    o placeholder atual
│  Categoria   │ │  Categoria   │ │  Categoria   │
│  R$ Preço    │ │  R$ Preço    │ │  R$ Preço    │
└──────────────┘ └──────────────┘ └──────────────┘
```

- Área de imagem preserva `h-24 sm:h-36` + `rounded-t-2xl` (atual); badges "ESTOQUE/PROMO", variações e hover actions continuam **por cima** da imagem.
- **`img` quebrada → volta ao placeholder** (`onError`), nunca ícone partido.
- A lista (tabela) **não muda** — foto é do grid e do detalhe.

---

## Tela 3: Detalhe do Produto — Header Hero (modificado)

```
┌──────────────────────────────────────────────┐
│  ← Voltar para produtos                       │
│                                               │
│  ┌──────────┐  Nome do Produto               │
│  │ 🖼 foto  │  Categoria · SKU               │
│  │(produto) │  R$ 12,90        [Editar]      │
│  └──────────┘  badge estoque                 │
│   w-20 h-20    (demais info inalteradas)     │
└──────────────────────────────────────────────┘
```

- Bloco `w-20 h-20 rounded-2xl overflow-hidden` com fundo da categoria.
- Sem foto → ícone `Package` atual (inalterado) · com foto → `img` `object-cover` · `onError` → esconde img (fundo da categoria permanece).
- Abas, estoque, movimentações: **inalterados**.

---

## Mapa de pontos de exibição já prontos (não mexer)

| Local | Fonte | Estado |
|---|---|---|
| Vitrine `/loja/:slug` | `produto.fotoUrl` (`use-loja-produtos.ts`) | Já exibe; só passa a ter foto real |
| Página do produto `/loja/:slug/produto/:id` | `produto.fotoUrl` | Idem |
| Checkout e "Meus pedidos" | `item.foto`/`fotoUrl` | Idem |
| Detalhe de pedido (`/vendas/pedidos/:id`) | `fotosPorProduto` → `item.foto` | Idem |

---

## Fluxo de upload (funcional, por trás da tela)

```
Salvar → tem foto nova?  ──sim──> valida (image/*, ≤5MB)
                                    │ ok
                                    v
                          upload → uniq_me_produtos/{empresaId}/{uuid}.ext
                                    │ ok
                                    v
                          getPublicUrl → fotoUrl = https://krrkfgv.../uniq_me_produtos/...
                                    │
                                    v
                      criarProduto/atualizarProduto({ ..., fotoUrl })  ← hooks existentes
                                    │
                                    v
                              toast sucesso + recarrega
  ──não──> fotoUrl? remover → ""  ·  nada mudou → undefined (hook ignora)
```

---

## Estados globais (DoD)

| Estado | Comportamento |
|---|---|
| Loading | Skeleton já existente no grid/detalhe (foto participa como parte do card) |
| Empty | Sem foto → placeholder `Package` (nunca quebra) |
| Error | Upload falhou → erro inline no modal, produto não salva; `onError` de `img` → placeholder |
| Success | Foto no grid/detalhe; vitrine/pedidos passam a exibir o produto real |

---

*Aguardando aprovação do fundador para implementar (regra de ouro: sem WIRE aprovado, sem código de tela). Criado em 16/09/2026.*