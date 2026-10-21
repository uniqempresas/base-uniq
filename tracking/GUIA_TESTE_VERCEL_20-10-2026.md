# 🧪 GUIA DE TESTE — Lote Estoque 20/10/2026

> Teste no celular (ou note) na Vercel, depois do deploy do lote de 9 notas.
> Onde validar: https://base-uniq.vercel.app
> Cada bloco abaixo é independente — se um falhar, anote e siga para o próximo.

---

## A. Cadastro de insumo — 3 etapas na ordem nova (N1 + N2 + N3 + N4)

1. **Estoque ▸ Produtos** → botão **Novo Produto** → escolha **Insumo**.
2. **Etapa 1 — Informações:** nome, foto (se quiser). O bloco "Como você conta" **não deve mais estar aqui embaixo**.
3. **Etapa 2 — Como é comprado:** unidade de compra + fator de conversão + legenda.
4. **Etapa 3 — Como é guardado no estoque:** unidade de estoque + **Quantidade inicial já marcada com 0** + **Estoque mínimo já marcado com 1**.
5. **Teste chave (bug N9):** cadastre um **composto** e na ficha técnica crie uma receita — ex. "Creme de Ninho": adicione leite em pó e digite **60** g clicando de um a um. **Nenhum outro campo pode mudar enquanto você digita.** O botão "usar sugestão" aparece na soma ao vivo, mas NÃO pode preencher nada sozinho.
   - ⚠️ Vale decimal inteiro ("60") — decimais com vírgula ("60,5") continuam perdendo o separador (limitação conhecida, não é do lote).

## B. Insumo sem preço de venda (N3)

1. No cadastro de insumo: não deve existir campo de preço de venda nem promocional.
2. Cadastre um **produto vendável** (doces): os campos de preço continuam lá, como sempre.

## C. Visualização e filtros da lista (N5 + N6)

1. **Estoque ▸ Produtos** (modo ou Insumos): mude a visualização para **Tabela** (o ícone de lista) → saia da tela → **volte**: deve abrir em Tabela (sua última escolha).
2. **Filtros:** no aplicador de filtros, marque **mais de um** tipo de estoque e mais de um status — múltiplos chips coloridos ativos ao mesmo tempo. A lista deve refletir a união.
3. Feche e reabra: os filtros marcados **continuam ativos**.
4. **Limpar filtros** apaga tudo (reabrir fica sem filtro ativo — e a visualização escolhida é preservada).

## D. Tela sem pisca (N7)

1. Abra Estoque ▸ Produtos e deixe a tela aberta, mexendo aos poucos por ~2–3 minutos.
2. A lista (ou modal aberto em digitação) **não deve piscar/atualizar sozinha**.
3. Prova extra: abra em 2 abas/janela e volte à aba original — sem refetch visível.

## E. Compra: adicionar produto abre o cadastro completo (N8)

1. **Estoque ▸ Compras → Nova Compra**.
2. Busque um insumo **inexistente** na barra → CTA **"+ Cadastrar na hora"** → deve abrir o **modal completo de cadastro** (as 3 etapas da parte A), com o nome que você digitou já pré-preenchido.
3. Ao salvar, você volta à compra com o insumo novo **na trilha** (quantidade/valor preservados).
4. Botão de lista (44px) na fileira abre a **lista de insumos** com busca, último preço pago e estados vazio/erro funcionando.

## F. Sem regressão (5 minutos)

1. Cadastre um **produto vendável** completo (estoque + categoria) — fluxo como antes.
2. Crie uma compra e **receba** — conta a pagar aparece no Financeiro.
3. **Estorne** o recebimento — volta tudo como antes.
4. Produza um lote do composto do teste A — baixa insumos, entra acabado.

---

**Se algo falhar:** anote a tela + o passo e mande para a MELISSA no retorno.
