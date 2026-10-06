# PRD — Produção Fase 3: Ordem de Produção transacional

**Data:** 06/10/2026
**Status:** aprovado de forma simplificada — o fundador autorizou construir Fases 2+3 seguidas e validar o conjunto na Vercel (06/10/2026)
**SPEC:** `tracking/specs/SPEC-Producao-BOM-Fase3-Producao.md`
**WIRE:** `tracking/wireframe/WIRE-Producao-Fase3-Produzir.md`
**Contexto:** plano de fases em `tracking/TRACKING_ESTOQUE.md` §🏭 — Fase 1 (ficha técnica, validada com cone de limão + 5 insumos) e Fase 2 (compras + custo médio + conta a pagar, commit `bdbd52e`) entregues.

---

## 1. Problema / oportunidade

Com a Fase 2, cada insumo tem custo real (média ponderada). Mas produzir o doce ainda é manual: someone baixa insumos um a um no "Ajuste de estoque" e digita o custo do acabado no olho. A Fase 3 fecha o ciclo: **uma Ordem de Produção baixa os insumos pela ficha técnica (com perda) e entra o produto acabado com o custo apurado de verdade** — a trufa deixa de ter preço chutado e passa a ter custo de fábrica. Piloto de referência: **Trufa de Maracujá**.

## 2. Decisões (herdadas + novas)

| # | Decisão |
|---|---|
| Herdado | D2/D9: custo = **média ponderada móvel** também na entrada do acabado; D4/P5: semiacabado é composto que serve de componente |
| D12 | Produzir = **1 operação transacional** (RPC): baixa de insumos + entrada do acabado + movimentações + registro da OP — tudo ou nada |
| D13 | **Sem estorno de OP nesta fase**: erro de produção se corrige por ajuste de estoque manual (estorno automático avaliado na F4). Anotado para o fundador. |
| D14 | **Explosão recursiva adiada**: a OP baixa apenas o 1º nível da ficha; semiacabado aninhado precisa já estar em estoque (produzido por OP própria). Coerente com ledger. |
| D15 | A **perda % da ficha** entra no consumo: `consumo = qtdPorUn × lote × (1 + perda/100)` |

## 3. Escopo da Fase 3

**Dentro:**
1. **Migrations:** tabelas `est_ordem_producao` + `est_ordem_producao_item` (snapshot de auditoria) + RPC `registrar_producao` transacional (guardas: só produto composto, ficha ≥1 item, estoque suficiente de cada insumo com saldo corrente dentro da própria OP).
2. **ProdutoDetalhePage:** aba "Produção" para composto — custo apurado por unidade ao vivo (ficha × custo médio atual dos insumos), botão **Produzir lote**, histórico de ordens.
3. **Modal Produzir:** quantidade + data; pré-visualização do consumo por insumo com semáforo de estoque (suficiente/insuficiente); insuficiente bloqueia o botão.
4. Toast com **custo por unidade apurado** ("Produção registrada: +36 trufas · custo R$ 1,85/un · insumos baixados").

**Fora:** estorno de OP (D13) · explosão de fichas aninhadas (D14) · CMV no ledger e DRE (F4) · agendamento/programação de OP.

## 4. Critério de aceite

1. Produzir 36 trufas cuja ficha pede chocolate 20g + leite condensado 15g + creme de leite 8g + polpa 10g → insumos baixam exatamente (com perda incluída), acabado entra +36, movimentações (`saida/Produção` por insumo, `entrada/Produção` do acabado) nascem corretas.
2. Custo por unidade da trufa = Σ(custo médio do insumo × consumo)/36 — prova SQL antes/depois.
3. Insumo com estoque menor que o necessário → RPC recusa com mensagem dizendo qual insumo falta; NADA muda (rollback).
4. Produto não composto / sem ficha → erro claro; OP gravada em `est_ordem_producao` com itens de auditoria.
5. `tsc` 0 · build OK · deploy Vercel · validação do fundador no celular ao final do dia.

## 5. Hipótese de teste

Maria produz o primeiro lote de trufas com o preço do chocolate comprado na Fase 2 e o custo por unidade aparece certinho — sem digitar nada.
