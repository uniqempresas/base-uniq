# PRD — Produção: Modo Receita (ficha e lote de produtos em massa)

**Data:** 14/10/2026 · **Autor:** Orchestrator (pedido do fundador durante testes práticos F2/F3)
**Status:** aguardando aprovação do WIRE

## 1. Por quê

Produtos compostos **em massa** (Recheio de Limão — contado em `g`) têm ficha técnica com contrato "quantidade **por 1 unidade do produto**". Para o fundador isso se traduz em ruído: a receita natural (1 lata leite cond 395 g + 1 lata creme 300 g + 4 limões, rende ~695 g) vira `0,568345 / 0,431655 / 0,005755` por grama — números ilegíveis — e o modal **Produzir lote** fala em gramas: "produzir 1" significa **1 grama**, não 1 receita. O fundador aprovou a abordagem **modo receita** (14/10/2026).

## 2. O quê / Decisões

| # | Decisão |
|---|---|
| D1 | Campo novo **`me_produto.rendimento_lote`** (numeric NULL): quanto da própria unidade 1 receita rende (recheio = **695**). Só usado por compostos com unidade fracionária (g/ml). Null = comportamento atual, sem mudança. |
| D2 | **Ficha em modo receita** (aba Produção e step "Ficha Técnica" do cadastro): quando `rendimento_lote` preenchido, exibe e edita as quantidades **por receita** (por-grama × rendimento). Ao salvar, o app **divide por rendimento** antes de gravar (DB permanece por-grama, 6 casas). |
| D3 | Modal **"Produzir lote"**: com rendimento, default **1 receita (~695 g)**; seletor de unidade `receita × g`; conversão é do front — **RPC `registrar_producao` intocada** (continua recebendo g). |
| D4 | Exibição arredondada (2 casas) nos valores por-grama quando visíveis; sem perder precisão no banco. |
| D5 | Badge **"custo pendente de compra"** passa a dizer **"custo pendente de produção"** quando o componente é **composto** (o custo dele apura na produção, não na compra). Insumos mantêm o texto atual. |
| D6 | **Fora de escopo:** produtos por unidade (Trufa, Cone) — ficha e lote intocados; estorno (D13); explosão recursiva (D14). |

## 3. Aceite

- Fundador monta/lê a ficha do recheio **em números de receita** (395 / 300 / 4 limões) e produz **N receitas** com 1 toque mantendo o consumo exato.
- Ao produzir 1 receita, consumo no banco = 395×1,05 leite + 300×1,05 creme + 4 limões; entrada 695 g com custo apurado.
- WhatsApp/Loja/PDV e o extrato não mudam em nada.
