# PRD — Estoque B14: Movimentações reais

**Data:** 06/10/2026
**Status:** Decisões tomadas pelo fundador ( mesma data )
**SPEC:** `tracking/specs/SPEC-Estoque-B14-MovimentacoesReais.md`
**WIRE:** `tracking/wireframe/WIRE-Estoque-B14-Movimentacoes.md`
**Prioridade:** Alta — backlog item **B14** (`TRACKING.md`, `tracking/TRACKING_ESTOQUE.md`)

---

## 1. Problema

A tela `/estoque/movimentacoes` é **100% mock** (`MOVIMENTACOES` de `estoqueMockData.ts`) e o modal "Nova
Entrada/Saída" dela **não grava nada** — simula salvamento com `setTimeout` de 1200 ms
(`MovimentacoesPage.tsx:60-66`). E **nem existia forma de ler o histórico real**: não há nenhum hook
de leitura de `est_movimentacao` no app — o único SELECT até hoje foi zero.

Consequência: a esposa da Doceê entra no extrato e vê dados de loja de roupa protótipo; ao "salvar"
uma entrada, acredita que gravou. É a **mesma classe** de falsidade já corrigida em Pedidos/Financeiro
(Ação em massa toast fake, F1/F2) — expande a regra de que **nenhuma ação na Base UNIQ pode mentir**.

Agravante descoberto e corrigido no caminho (06/10, migration `20261006090000_estoque_catchup.sql`,
**N9**): o app manda `tipo = 'entrada'/'saida'` minúsculo, e o CHECK antigo exigia
`ENTRADA/SAIDA/AJUSTE` maiúsculo → **todo INSERT de movimentação do app falha** (o estoque mudava,
o histórico nunca nascia — por isso a tabela estava vazia).

## 2. Objetivo

A operação da Doceê consulta o **extrato real de movimentações** da empresa e cadastra
entrada/saída a partir da própria tela de movimentações (sem precisar achar o produto primeiro).

## 3. Decisões do fundador (06/10/2026 — fechadas)

| # | Decisão | Resolução |
|---|---|---|
| D1 | Modal "Nova Entrada/Saída" da Movimentações | **Virar real** — grava pela mesma regra do Ajustar Estoque do detalhe do produto, mas com escolha de produto |
| D2 | Baixa de estoque por venda (`registrar_venda`) aparece no extrato? | **Não por ora** — extrato registra só movimentações manuais; baixa por venda fica visível por saldo |
| D3 | Campo "Custo unitário" do Ajustar Estoque | **Remover** (já implementado no B17a — hotfix) |
| D4 | Cancelar movimentação na tabela (botão sem handler) | **Remover o botão** (reverter estoque é feature futura; deixar botão morto = mentir de novo) |

Decisões herdadas de precedentes (não reabrir): estoque é **valor absoluto** (`estoque_atual`,
UPDATE após validar) · ordem **estoque primeiro, histórico depois** (comentário de
`ProdutoDetalhePage.tsx:113-116`) · multi-tenant por `empresa_id` · mock só como fallback demo.

## 4. Escopo

**Dentro:**
1. Hook de leitura `est_movimentacao` da empresa (ranking por data, filtros).
2. `MovimentacoesPage` real (extrato + filtros + resumo), modal real, estados completos.
3. "Movimentações recentes" do `EstoqueDashboardPage` vindo do hook (fallback mock no demo).
4. Aba "Movimentações" do `ProdutoDetalhePage` real (já tem o caminho do fallback; agora lê por produto).
5. Ajuste `ProdutoDetalhePage`/`AjustarEstoqueModal` para os valores de `tipo` alinhados ao banco (N9 já corrigido no banco; conferir o front gravando certo).
6. Type `Movimentacao` movido para `types/` compartilhado.

**Fora (explícito):** baixa por venda no extrato (D2) · cancelar/reverter movimentação (D4) ·
gráficos do dashboard (mock permanece) · entrada por compra/NF · custo médio · mover botão de
entrada no menu (B11 segue decisão de 23/09) · RLS (P5 adiado).

## 5. Critério de aceite

1. Com sessão real (Doceê), `/estoque/movimentacoes` mostra **só registros do banco** (0 registros → empty real explicando "nenhuma movimentação ainda — ajuste pelo detalhe do produto ou pelo botão Nova Entrada/Saída").
2. Criar uma entrada pelo modal → estoque muda **e** a movimentação aparece no extrato sem reinstall (refresh ou re-fetch).
3. O mesmo ajuste pelo detalhe do produto aparece no extrato.
4. Demo (sem sessão) continua com mock + banner de fallback atual.
5. `tsc` sem erros novos · `npm run build` OK · deploy Vercel validado.
