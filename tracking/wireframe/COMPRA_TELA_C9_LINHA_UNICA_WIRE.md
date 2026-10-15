# WIRE — Nova Compra C9: "Linha Única de composição" — v1.0

**Versão:** 1.0
**Data:** 2026-10-15
**Status:** ✅ APROVADO VERBALMENTE PELO FUNDADOR 15/10/2026 — contrato loose:
**"tentar; se não der certo, volta como está"** (implementação experimental
isolada; rollback = `git revert` do commit único).
**Tela:** `/estoque/compras/nova` (`NovaCompraPage.tsx`) — sem rota nova.
**Referências:** `COMPRA_TELA_C4_LINHA_RAPIDA_WIRE.md` (contrato-mãe da Linha
Rápida), C8 registrado em `tracking/TRACKING_ESTOQUE.md` (datalist nativa),
guia de estilo: seção "Produtos do pedido" de `src/app/components/pedidos/PedidosListaPage.tsx`.
**Vigue:** C4/C5/C6/C8 continuam válidos em TUDO que este C9 não toca.

---

## 1. Problema (fundador, em fala)

O fluxo atual são **duas linhas**: barra do item em cima; quando o item é
reconhecido, abre uma "linha 2" segregada com Qtd · R$ · ＋ Adicionar. No
celular isso é dois tempos visuais — o olho salta, a linha 2 aparece/desaparece.
Pedido: **UMA linha só de composição**, como o modal de Pedidos:
`[produto] [QUANTIDADE] [PREÇO] [＋ adicionar]`.

## 2. ANTES (C8 — estado hoje)

```
┌───────────────────────────────────────────┐
│ ←  Nova compra            4 itens · R$ 87│  header (pill Salvar
├───────────────────────────────────────────┤         some c/ teclado)
│ FORNECEDOR *          [+ Novo]            │  congelado
│ [🔍 Papelaria São Judas           ✓]      │
│ NOTA FISCAL (opcional)                    │
│ [1042                                   ] │
│ ┌─ LINHA RÁPIDA ────────────────────────┐ │
│ │ [🔍 O que é? Nome ou SKU (ex.: cixa… ]│ │  ← linha 1: só o nome
│ │                                       │ │     (datalist nativa C8)
│ │  Qtd (caixa) *   Valor unitário       │ │
│ │  [1          ]   [R$ 6,50       ]     │ │  ← linha 2 SEGREGADA:
│ │              (3 no carrinho)          │ │     só aparece com item
│ │              [ ＋ Adicionar         ] │ │     reconhecido
│ └───────────────────────────────────────┘ │
├───────────────────────────────────────────┤
│ ② Itens da compra               R$ 87,00 │  rola por baixo
│ ┌───────────────────────────────────────┐ │
│ │ Caixa de Uva                    [🗑]  │ │
│ │ Qtd (caixa) [2]  Valor [R$ 6,50]  R$13│ │
│ └───────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

## 3. DEPOIS (C9 — linha única)

```
┌───────────────────────────────────────────┐
│ ←  Nova compra            4 itens · R$ 87│  header (inalterado:
├───────────────────────────────────────────┤   pill Salvar some c/ teclado)
│ FORNECEDOR *          [+ Novo]            │  congelado
│ [🔍 Papelaria São Judas           ✓]      │
│ NOTA FISCAL (opcional)                    │
│ [1042                                   ] │
│ ┌─ LINHA RÁPIDA — UMA FILEIRA ──────────┐ │
│ │ [🔍 Caixa de Uva  ][ Qtd ][ R$ ][ ＋ ] │ │  ← produto + QTD + PREÇO +
│ │  Caixa de Uva · Qtd em caixa          │ │     ＋ na MESMA fileira;
│ │  · 1 caixa = 500 g  (3 no carrinho)   │ │     quadradinhos sempre
│ └───────────────────────────────────────┘ │     visíveis, ENTRE o
├───────────────────────────────────────────┤     campo e o botão
│ ② Itens da compra               R$ 87,00 │  rola por baixo (igual)
│ ┌───────────────────────────────────────┐ │
│ │ Caixa de Uva                    [🗑]  │ │
│ │ Qtd (caixa) [2]  Valor [R$ 6,50]  R$13│ │
│ └───────────────────────────────────────┘ │
└───────────────────────────────────────────┘

Estado com campo VAZIO (nada de linha 2 fantasma — os quadradinhos ficam
à vista, enevoados, esperando o reconhecimento):

│ [🔍 Item ou SKU (ex.: caixa…] [ Qtd] [ R$] [ ＋] │   (placeholder só;
                                                   faixa de status vazia)

Estado com texto SEM match no catálogo (＋ e a faixa oferecem o cadastro):

│ [🔍 Kraft A5 180g        ] [ Qtd] [ R$] [ ＋] │
│ [+ Cadastrar "Kraft A5 180g" na hora        ] │  ← CTA C8 mantido
```

### Regras da fileira

- **[campo do produto]** flex-1, `min-w-0`; datalist NATIVA (C8) intacta — o
  browser completa dentro da barra; reconhecimento por igualdade de texto
  nome/SKU.
- **[Qtd] [R$]** quadradinhos (64px / 84px), placeholders curtos, fonte 16px
  (sem zoom iOS), alvo 44px (`h-11`). Desabilitados/enevoados até o item ser
  reconhecido — é o MESMO gate da antiga linha 2, agora à vista. Ao
  reconhecer: qtd=1 + último preço DESTE item pré-cheios (efeito C8 / regra
  determinística C5 §2 intacta); editar/esvaziar o nome devolve os
  quadradinhos ao estado limpo (qtd 1, valor vazio).
- **[＋]** sempre ativo, alvo 48×44px, `pointerdown preventDefault` (teclado
  nunca fecha — guialeta 1). Mobile = só o glyph ＋; desktop (sm+) recupera a
  label "Adicionar".
- **Faixa de status abaixo** (só texto/chip, SEM inputs — não é linha 2 bis):
  reconhecido → `Nome · Qtd em {unidade de compra} · 1 caixa = 500 g` + chip
  **(N no carrinho)** (C8/C4 merge); texto sem match → `+ Cadastrar "termo"
  na hora` / carregando… / erro+retry; vazio → nada.

## 4. Ações (inalteradas em comportamento)

| Ação | Gatilho | Resultado |
|---|---|---|
| Reconhecer item | datalist completion / texto exato == nome/SKU | quadradinhos habilitam + pré-cheios (qtd 1, último preço DESTE item) |
| ＋ adicionar | toque (pointerdown preventDefault) ou Enter | reconhecido → merge C4 (repetido SOMA qtd; preço recém-digitado vence) → item na lista, linha reseta (C6-a), foco volta ao campo com teclado aberto |
| ＋ com sem-match | texto digitado sem match | mini-sheet "+ Cadastrar na hora" (U2.2, snapshot entra por merge) |
| ＋ com vazio | nenhum caractere | dica "Escreva o nome ou o SKU do item primeiro." (feedback, não validação nova) |
| Salvar compra | pill no header (some com teclado — C4) | validação idêntica (qtd > 0, conversão ok), criação PENDENTE via `use-criar-compra` |

## 5. Estados

- **Loading:** skeleton de fornecedor (como hoje) + "Carregando insumos..." na
  faixa; **Erro:** retry na faixa (insumos) / bloco de erro (fornecedor);
  **Vazio:** carrinho vazio com copy atualizada ("...ajuste Qtd e R$ nos
  quadradinhos ao lado e toque no ＋"); **Success:** flash 1x na linha do
  carrinho + toast de id fixo (únicas microconfirmações, C3/C4).

## 6. O que NÃO muda (guiaseltas A–C8 que sobrevivem)

1. Teclado nunca fecha na digitação (pointerdown preventDefault; foco devolvido
   ao campo do produto pós-adicionar).
2. `useTapSemScroll` no dropdown de FORNECEDOR (insumo já era datalist desde C8).
3. Merge do mesmo item: soma qtd; preço recém-digitado vence; vazio mantém o
   preço da linha existente.
4. Datalist nativa + reconhecimento por igualdade de texto + chip "N no
   carrinho" + "+ Cadastrar na hora".
5. Rascunho `sessionStorage` `uniq.nova-compra.rascunho-v1` (sobrevive F5),
   fornecedor frozen, pill "Salvar compra" no header, soma/validação iguais.
6. Alvos ≥ 44px, inputs 16px.

## 7. Riscos conscientes (contrato "tentar; se não der, volta")

- **320px:** a fileira é apertada (~85px sobram para o campo do produto); o
  placeholder trunca. Em 390px+ fica confortável. Plano B do teste: se o
  fundador achar espremido, `git revert` volta ao C8 sem perda.
- **Preços ≥ R$ 1.000,00** cabem no quadradinho com scroll interno do input;
  o editor fino continua na linha da "nota" (lista de baixo).
- Nº de passos do ciclo: digitar → (completion) → conferir/ajustar qtd e R$ na
  MESMA altura → ＋ → item na lista → foco de volta na barra. Um tempo visual
  a menos que o C8 (a linha 2 não sobe mais/desce mais).

## 8. Acessibilidade

- `aria-label` nos três campos e no ＋ (o do ＋ muda de sentido com o estado:
  adicionar / cadastrar-e-adicionar); `role="status"`/`role="alert"` na faixa e
  no erro; ordem de tabulação natural nome → Qtd → R$ → ＋; entradas numéricas
  com `inputMode` decimal/numeric; sem hooks novos depois de return condicional
  (ordem de hooks preservada — React #310 fora de risco).

---

*Responsivo: desktop preserva a fileira única (só o campo do produto cresce e a
label "Adicionar" volta junto do ＋). Mobile-first: 1 coluna, lista abaixo.*
