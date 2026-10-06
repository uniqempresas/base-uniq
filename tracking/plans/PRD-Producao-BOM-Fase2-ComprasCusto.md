# PRD — Produção Fase 2: Compras + Custo Médio + Conta a Pagar

**Data:** 06/10/2026
**Status:** decisões tomadas (fundador, 06/10/2026) — aguardando aprovação do WIRE pelo fundador (GitHub)
**SPEC:** `tracking/specs/SPEC-Producao-BOM-Fase2-ComprasCusto.md`
**WIRE:** `tracking/wireframe/WIRE-Producao-Fase2-Compras.md`
**Contexto:** plano de fases em `tracking/TRACKING_ESTOQUE.md` §🏭 — Fase 1 (ficha técnica) implementada e **validada pelo fundador no celular em 06/10/2026** (cone de limão + 5 componentes).

---

## 1. Problema / oportunidade

A ficha técnica (Fase 1) diz **quanto de cada insumo** gasta 1 doce — mas fala em gramas enquanto a compra chega em **embalagem** (chocolate em barra 1 kg, leite condensado em lata/polpa). Sem amarrar preço de compra → estoque, a ficha não tem custo nenhum: o preço de custo do produto é digitado "no olho". A Fase 2 fecha o primeiro laço do dinheiro: **a compra do insumo vira custo real e conta a pagar, sem lanço manual** — o "mostra para onde o dinheiro está saindo" passa a se sustentar sozinho.

## 2. Decisões do fundador (06/10/2026 (novo lote — fechadas))

| # | Decisão |
|---|---|
| D6 | **Conversão no produto:** o cadastro do insumo ganha "compra por" (unidade de compra, ex.: kg/lata) + "equivale a" (quantidade na unidade de estoque, ex.: 1000 g). A compra informa em unidade de compra; o sistema converte para o estoque. Fonte única, vale para toda compra futura. |
| D7 | **Movimenta no recebimento:** compra registrada = só registro (estado "pedi"). Ao marcar **Receber**, acontecem juntos: entrada no estoque, atualização do custo médio ponderado e criação da conta a pagar. |
| D8 | **Uma conta por compra:** ao receber, nasce 1 `me_contas_pagar` vinculada (coluna nova `compra_id`), categoria matéria-prima/insumo quando existir, status `pendente`, vencimento escolhido no ato. |
| D9 | **Custo = média ponderada móvel** aplicada no recebimento: `custo_novo = (estoque_atual × custo_atual + qtd_entrada × valor_unit_entrada) ÷ (estoque_atual + qtd_entrada)`, gravado em `me_produto.preco_custo` do insumo. |
| D10 | Compras usam **fornecedor real** (`me_fornecedor` — já existe; a tela de compra busca/seleciona). |
| D11 | Nova Compra com **3 modos de recebimento** (emenda da aprovação do WIRE): *Já recebi agora* (grava e recebe na hora — estoque/custo/conta na sequência), *Agendar* (`data_prevista` exibida), *Só registrar*. |

## 3. Escopo da Fase 2

**Dentro:**
1. **Migrations:** campos de conversão no insumo (§SPEC 2) + coluna `compra_id` em `me_contas_pagar` + RPC `receber_compra` (transacional, estilo `registrar_venda`: estoque + custo médio + movimentação + conta a pagar, tudo ou nada).
2. **Telas:** **Compras** no Estoque (`/estoque/compras`) — lista (pendente/recebida), nova compra (fornecedor + itens + valores), botão **Receber** (moda com data e vencimento da conta).
3. **Cadastro de insumo:** step Informações ganha grupo "Compra e conversão" (aparece para insumo — e pode ser ocultado para simples/composto; decidir no WIRE).
4. Financeiro: conta a pagar da compra aparece normalmente (com `compra_id` e descrição padrão "Compra NF #… — Fornecedor") — **nenhuma mudança nas telas do Financeiro**.

**Fora (fases seguintes):** Ordem de Produção e baixa apurada por ficha (F3) · CMV no ledger/DRE (F4) · pedido ao fornecedor automático (estoque mínimo gera sugestão — a considerar depois) · entrada por NF multi-página/importação XML.

## 4. Critério de aceite

1. Cadastrar insumo "Chocolate Meio Amargo" com compra por kg ↔ 1000 g; registrar compra de 2 kg a R$ 50/kg; **receber** → estoque de chocolate +2000 g, custo médio atualizado corretamente, conta a pagar de R$ 100 criada no Financeiro.
2. Compra nova de 1 kg a R$ 70 → custo médio recalculado como média ponderada (r$ ~56,67/kg → 0,057 g) — prova em produção via SQL (SELECT antes/depois).
3. Compra pendente **não** mexe em estoque/custo/financeiro até o Receber.
4. Ficha técnica da trufa volta o "custo por unidade produzida" apurado a partir do custo por grama dos insumos (leitura visível no detalhe do produto — pontos de exibição no WIRE).
5. `tsc` 0 · build OK · deploy Vercel · validação do fundador no celular.

## 5. Hipótese de teste (após implementação)

Maria registra a compra real da chocolate + polpa que chega na próxima semana e, no mesmo dia, recebe: estoque sobe, conta a pagar aparece no Financeiro, e o custo da trufa deixa de ser digitado e passa a ser calculado.
