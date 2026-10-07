# WIRE — Nova Compra v2: "Linha Rápida + Lista + Teclado Educado" (C4) — v1.0

> **Status:** ✅ Direção do fundador 07-10/2026 (esboço descrito na conversa) + benchmark (librarian) embasando a mecânica.
> Substitui o fluxo de busca→pill da `NovaCompraPage` por **linha rápida fixa no topo**.

## Problema (fundador)

- Teclado fica aberto e cobre boa parte da tela; barra inferior "Salvar compra" fixa roubando altura.
- Fluxo atual exige tocar item → pill → ajustar; quer **digitar o item, qtd e preço e apertar "Adicionar"** — tudo numa linha.

## WIRE (mobile-first; desktop igual funcional)

### 1) Linha Rápida (frozen no topo, logo abaixo do header — SEM a lista rolar por baixo)
- **Row única:** [Campo nome do item (ocupa a linha)] — os demais campos ficam na **segunda linha compacta** quando o item é reconhecido:
  - **Linha 1:** `nome do item…` (autocompleta da lista de insumos; item inexistente = CTA "cadastrar item na hora").
  - **Linha 2 (curta, colunas coladas):** `Qtd (caixa)` · `R$ 0,00` · **botão verde [＋ Adicionar]** (alvo ≥ 44px).
  - Segundo dado vem **pré-preenchido** quando reconhecido (qty 1, último preço) — o toque é só conferir e adicionar.
- **Ao adicionar:** item pula pra lista (linha pisca), dados/preço permanecem preenchidos para o próximo item ter atalho; **teclado NUNCA fecha** nos campos da linha rápida (o botão "Adicionar" não tira o foco — usa `onPointerDown` preventDefault, padrão já provado no des-4).

### 2) Lista de itens da compra (scroll livre no meio)
- Linha-por-linha como hoje (qtd/valor editáveis na linha, excluir), subtotal do item.
- Sem duplicação fora da expectativa — **adicionar mesmo item duas vezes pela linha rápida funde na linha existente somando quantidade** (diferente do C3; decisão para economia de toques no mercado) *(peer: manter 2 linhas causava confusão no carrinho — benchmark "quick-add merge" OK)*.

### 3) Teclado educado
- Página usa `visualViewport`/teclado-inset: quando o teclado abre, a **linha rápida sobe e fica acima do teclado** (como chat apps); a lista some atrás, o rodapé NÃO aparece por cima do teclado.
- `<meta name="viewport" content="... interactive-widget=resizes-content">` para Vivaldi/Android.

### 4) Rodapé NÃO-fixo (resolve "Salvar compra sempre à mostra")
- Header ganha **"Salvar compra"** como ação secundária (pill/CTA discreto, só habilitado com ≥1 item) + total em header/sublinha; rodapé sticky existente **some**.
- Alternativa (implementa a que fizer mais sentido no teste): "Concluir compra" só aparece como pill flutuante quando há ≥1 item e o teclado está fechado.
- Critério do fundador: **tela limpa enquanto digita; salvar é uma decisão consciente, não distração.**

## Estados
Tudo já coberto (loading/saving/vazio/erro); rascunho em memória persiste como hoje.
