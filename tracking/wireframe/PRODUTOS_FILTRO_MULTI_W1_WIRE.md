# WIRE — Produtos: Filtro Multi-Categoria (W1) — v1.0

> **Status:** ✅ Direção do fundador 06-07/10/2026 ("quero clicar e adicionando categorias ao meu filtro").
> Fonte: anotações do fundador; implementação em `ProdutosPage.tsx`.

## Problema

Na lista de Produtos hoje só dá para filtrar por **UMA** categoria. O fundador quer ver, por ex., **Insumos + Recheios** ao mesmo tempo.

## Comportamento (W1)

- Chips de categoria passam a ser **multi-seleção** (toggle), filtro = **união** (subtração nenhuma; produto aparece se estiver em qualquer categoria marcada).
- Pode marcar 1, 2, N categorias → lista mostra o conjunto.
- Chip marcado fica em destaque; tocar de novo desmarca.
- Contador pequeno perto do título/busca: "N produtos · X categorias no filtro".
- Botão "Limpar" aparece só quando ≥2 categorias ativas.
- Desktop: mesmo comportamento na linha de chips (sem mudança estrutural).

## Estado

Loading (skeleton dos chips como hoje) · vazio com filtro ativo mostra "nada nesta combinação" + botão limpar · erro igual hoje.
