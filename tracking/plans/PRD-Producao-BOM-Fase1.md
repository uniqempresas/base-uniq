# PRD — Produção Fase 1: Natureza do Produto + Ficha Técnica

**Data:** 06/10/2026
**Status:** decisões tomadas — aguardando aprovação do WIRE pelo fundador (GitHub)
**SPEC:** `tracking/specs/SPEC-Producao-BOM-Fase1.md`
**WIRE:** `tracking/wireframe/WIRE-Producao-Fase1-FichaTecnica.md`
**Contexto:** módulo Produção/BOM aprovado em análise — plano de fases em `tracking/TRACKING_ESTOQUE.md` §🏭

---

## 1. Problema / oportunidade

A Doceê vende doces de produção própria, mas a Base UNIQ encara hoje todos os produtos como "compro 1, vendo 1" (estoque em unidade, sem custo apurado). O 2º pilar do pitch da UNIQ — *"mostra para onde o dinheiro está saindo, isso é margem"* — precisa saber **quanto custa fabricar 1 unidade**. A ficha técnica (BOM) é o **pré-requisito** de todo o fluxo: sem ela não há compra com custo, OP, CMV ou DRE preciso.

## 2. Decisões do fundador (06/10/2026 — fechadas)

| # | Decisão |
|---|---|
| D1 | No cadastro de produto escolher **natureza**: **Simples** = compro 1, vendo 1 (fluxo atual) · **Composto** = produzido via **ficha técnica** com insumos do estoque (ex.: barra de chocolate) |
| D2 | Custo = **média ponderada móvel** (o cálculo entra na Fase 2; esta fase estrutura a ficha) |
| D3 | Processo: **cada fase sobe WIRE no GitHub** e o fundador valida pelo celular antes do código |
| D4 | Insumos e semiacabados moram no **mesmo cadastro de itens** (`me_produto`): insumo = natureza própria, nunca vendido; semiacabado = **composto aninhado** (composto que serve de componente) |
| D5 | **Colisão de nome evitada:** o eixo novo é a coluna `natureza` — o `me_produto.tipo` legado (`simples`/`variavel`) **continua intocado** (lição D-V2.1 do bug "Outros") |

## 3. Escopo da Fase 1

**Dentro:**
1. **Migration:** `me_produto.natureza` (text, default `'simples'` — os 16 produtos da Doceê permanecem válidos) + tabela `est_ficha_tecnica` (estrutura de componentes, §SPEC 2).
2. **Cadastro:** escolha da natureza no modal de produto + **etapa "Ficha Técnica"** quando composto (componentes do estoque com quantidade por unidade e % de perda opcional).
3. **Insumo:** natureza disponível no cadastro; insumo **nunca** aparece na vitrine (bloqueio automático de `exibir_vitrine`).
4. Lista de produtos: badge discreto da natureza (Simples · Composto · Insumo).

**Fora (fases seguintes — não implementar aqui):** cálculo de custo/média ponderada (F2) · compras ↔ conta a pagar (F2) · ordem de produção e baixa apurada (F3) · CMV/DRE (F4) · explosão recursiva de fichas aninhadas (F3).

## 4. Critério de aceite

1. Produto novo com natureza "Composto" permite montar a ficha técnica da especificação de referência (1 Trufa de Maracujá: chocolate 20 g + leite condensado 15 g + creme de leite 8 g + polpa 10 g) e **persiste** (reabrir o produto mostra a ficha).
2. Produto com natureza "Insumo" **não entra na vitrine** mesmo que `exibir_vitrine` fosse true (forçado false).
3. Os 16 produtos atuais da Doceê continuam aparecendo exatamente como hoje (default `simples`).
4. `tsc` 0 erros novos · `build` OK · deploy Vercel · validação do fundador.

## 5. Hipótese de teste (após implementação)

Maria (esposa do fundador) cadastra os 4 insumos do exemple e monta a ficha da Trufa — prova de operação da tela. O custo apurado da ficha é a validação de valor da Fase 2.
