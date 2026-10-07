# WIRE — Insumos como item próprio do menu (M1) — v1.0

> **Status:** ✅ Decisão do fundador 06-10/2026 ("quero ter produtos e insumos... a barra lateral passa a trazer um novo item chamado Insumos").
> **Fonte da verdade dos dados:** `me_produto.natureza` (`simples|composto|insumo`) — já implementado na Fase 1. Mesma tabela, visões separadas.

## Objetivo

Distinguir visualmente **Produtos** (o que se vende: simples/composto) de **Insumos** (o que se compra: matéria-prima, embalagens, caixas), sem nova tabela.

## WIRE

### Menu / navegação
- **Subnav Estoque (AppLayout):** itens `Produtos` e **`Insumos`** (novo) + Cadastros/Categorias como já existem.
- **Rotas:**
  - `/estoque/produtos` → lista com `natureza in ('simples','composto')` — "o que você vende".
  - `/estoque/insumos` → lista com `natureza = 'insumo'` — "o que você compra" (reaproveita a MESMA tela `ProdutosPage` com param).
  - `/estoque` → redirect dashboard (inalterado).

### Tela (mesma `ProdutosPage`, param)
- Título muda: "Produtos" vs "Insumos".
- Botão "Novo": em Insumos, o modal abre **pré-selecionado como Insumo** (radio Natureza em Insumo); em Produtos, pré-seleção em Simples.
- Busca/fabetas/KPIs iguais; wide chip "Insumo" só aparece em contextos mistos.
- Nas fichas técnicas e no detalhe, insumos continuam alcançáveis (o app trata por id, não por menu).

### Filtro Multi-Categoria (W1)
- Aplica-se às duas listas (chips multi-seleção, união).

### Conexão com Compras(C1)
- A busca de item da tela de compras lista **somente Insumos**.

## Estados
Loading/empty/error/success como a lista atual. Insumos vazio mostra CTA "Cadastrar primeiro insumo" (o mesmo caminho já existe nas compras).
