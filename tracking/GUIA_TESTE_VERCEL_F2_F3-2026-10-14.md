# 🧪 GUIA PRÁTICO — Compras (F2) + Produzir lote (F3) + Venda no extrato (14/10/2026)

> **Para o fundador.** Teste do conjunto Produção: **Compras → Produção → Venda**, garantindo que **tudo deixa rastro no extrato de movimentações** (o extrato agora conta compra, produção **e venda**).
> **URL:** https://base-uniq.vercel.app · login normal da Doceê.
> **Pré-pronto no banco:** 9 fichas técnicas · 3 compostos da Doceê · Cone Limão (id 85, estoque 10) como produto de referência.
> **Evidência já provada no banco (transação com ROLLBACK):** os 3 fluxos gravam `est_movimentacao` — `receber_compra` ✅ · `registrar_producao` ✅ · `registrar_venda` ✅ (o último é o **novo** de hoje).

---

## A. COMPRAS (Fase 2) — `/estoque/compras`

**A1. Registrar e receber uma compra**
- **Faça:** `/estoque/compras` → **[+ Nova Compra]** → fornecedor (ou "+ Novo" na hora) → adicione um insumo pela **Linha Rápida** (ex.: Barra de Chocolate, qtd 1, valor ~R$ 105) → **Salvar compra** → tocar **Receber** (data hoje).
- **Espere:** compra fica **RECEBIDA** · estoque do insumo **sobe** conforme a conversão (unidade de compra × fator) · custo atual do insumo **recalculado** (média ponderada).

**A2. O rastro completa**
- **Faça:** é só olhar.
- **Espere:** `/financeiro/contas-pagar` ganha a **conta pendente** da compra · `/estoque/movimentacoes` mostra a **Entrada · Compra**.

---

## B. PRODUZIR LOTE (Fase 3) — aba Produção do composto

**B1. Produzir**
- **Faça:** `/estoque/produtos` → abrir o **Cone Limão** (composto) → aba **Produção** → **Produzir lote** (ex.: **4 unidades**) → confirmar.
- **Espere:** baixa automática dos insumos **pela ficha técnica** (com perda), entrada do produto acabado com **custo/un apurado de verdade**, histórico de OP na lista.

**B2. O rastro dos dois lados**
- **Faça:** abrir `/estoque/movimentacoes`.
- **Espere:** **Saídas** dos insumos consumidos + **Entrada** do acabado — tudo com motivo da produção.

**B3. Proteção (opcional)**
- **Faça:** tentar um lote **grande demais** (mais que o estoque de insumos cobre).
- **Espere:** mensagem nominal apontando o insumo que falta e **nada muda** (all-or-nothing).

---

## C. VENDA → EXTRATO (novo de hoje)

**C1. Vender pela Loja**
- **Faça:** `/loja/docee` → comprar **1 Cone Limão** no checkout (telefone de teste) → confirmar o pedido.
- **Espere:** `/estoque/movimentacoes` ganha uma **Saída · Venda** do produto e o estoque baixa. *(Alternativa: contabilizar uma venda manual em `/vendas/pedidos` — o rastro é o mesmo, os 3 canais gravam.)*

**C2. Antes × depois**
- **Espere:** antes, a venda sumia do estoque **sem linha** no extrato; agora cada venda tem a própria linha, amarrada à venda no banco.

---

## D. EXTRATO — `/estoque/movimentacoes`

**D1. O dia inteiro numa tela**
- **Espere:** a sequência do dia: **Entrada · Compra** → **Saídas+Entrada da produção** → **Saída · Venda**.
- Resumo do período (entradas/saídas/saldo) batendo com os eventos.

---

## 📋 Checklist

| # | Teste | ☐ |
|---|---|---|
| A1 | Compra registra e recebe (estoque + custo sobem) | ☐ |
| A2 | Conta a pagar + movimentação de entrada | ☐ |
| B1 | Produzir lote baixa insumos e entra o acabado com custo | ☐ |
| B2 | Extrato mostra consumo + entrada do acabado | ☐ |
| B3 | Lote insuficiente recusado sem danos | ☐ |
| C1 | Venda aparece no extrato como "Saída · Venda" | ☐ |
| D1 | Extrato conta o dia completo (compra→produção→venda) | ☐ |

---

## 🔎 Se algo falhar

Mande **o item (ex.: B1)**, **o que você viu** e **o que esperava**. Localizo o caminho e o causo direto.

---

*Criado em 14/10/2026 pelo Orchestrator — referências: `TRACKING_ESTOQUE.md` §🏭 (Fases 2–3 + emenda da venda) · `PRD-Producao-BOM-Fase2-ComprasCusto.md` · `PRD-Producao-BOM-Fase3-Producao.md`.*
