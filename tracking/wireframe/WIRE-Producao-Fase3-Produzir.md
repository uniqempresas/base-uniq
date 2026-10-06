# WIRE — Produção Fase 3: Ordem de Produção (Produzir lote)

**Versão:** 1.0
**Data:** 06/10/2026
**Status:** PRONTO PARA IMPLEMENTAÇÃO (aprovado junto ao conjunto F2+F3 pelo fundador — validação única na Vercel ao final)
**Telas:** `/estoque/produtos/:id` — aba "Produção" (nova, só composto)
**Referências:** `PRD-Producao-BOM-Fase3-Producao.md` · `SPEC-Producao-BOM-Fase3-Producao.md`

---

## 1. Roteamento

| Rota | Tela | Acesso |
|---|---|---|
| `/estoque/produtos/:id` | ProdutoDetalhePage — nova TAB "Produção" | detalhe de produto `natureza='composto'` |

Nenhuma rota nova. Aba não existe para simples/insumo.

---

## 2. Aba "Produção" (no detalhe do produto composto)

### 2.1 Desktop

```
┌────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]  Trufa de Maracujá        [voltar]              │
│ Tabs: Informações | Estoque | Ficha Técnica | PRODUÇÃO | Variação│
├────────────────────────────────────────────────────────────────┤
│ Custo por unidade produzida              [ Gerar lote +]       │
│ ┌──────────────────────┐                                       │
│ │ R$ 1,85 / trufa      │  ● custo apurado a partir da ficha    │
│ │ (36 no último lote)  │                                       │
│ └──────────────────────┘                                       │
│                                                                │
│ Consumo de insumos por 1 un (custos médios atuais):            │
│ Chocolate Meio Amargo    20 g  × R$0,057/g  = R$ 1,14   [OK]   │
│ Leite Condensado         15 g  × R$0,040/g  = R$ 0,60   [OK]   │
│ Creme de Leite            8 g  × R$0,038/g  = R$ 0,30   [OK]   │
│ Polpa de Maracujá        10 g  × R$0,020/g  = R$ 0,20   [OK]   │
│ ─────────────────────────────────────────────────────────────  │
│ Histórico de produção                                          │
│ 06/10  lote 36 un · custo R$ 66,60 (1,85/un)                   │
│ (empty: "Nenhuma produção ainda — gere o primeiro lote")       │
└────────────────────────────────────────────────────────────────┘
```
Insumo com `preco_custo` 0/null → badge [⚠ custo pendente de compra] + link `/estoque/compras`.

### 2.2 Mobile

```
┌────────────────────────────┐
│ ↑ Trufa de Maracujá        │
│ Custo/un: R$ 1,85          │
├────────────────────────────┤
│ [Produzir lote]            │
├────────────────────────────┤
│ Chocolate 20g  = R$1,14    │
│ [OK] est: 2.412 g          │
│ Leite Cond. 15g = R$0,60   │
│ [OK] est: 800 g            │
│ Polpa 10g  = R$0,20        │
│ [OK] est: 500 g            │
├────────────────────────────┤
│ HISTÓRICO                  │
│ 06/10 · 36 un · 1,85/un    │
└────────────────────────────┘
```

### 2.3 Modal "Produzir lote"

```
┌─ Produzir lote — Trufa de Maracujá ─────┐
│ Quantidade (unidades) *                 │
│ [ 36        ]                           │
│ Data *                                  │
│ [ 06/10/2026 ]                          │
│ Observação (opcional)                   │
│ [                      ]                │
│ ──────────────────────────────────────  │
│ VAI CONSUMIR                            │
│ Chocolate      24 g   de 2.412 g  ✓     │
│ Leite Cond.    18 g   de   800 g  ✓     │
│ Creme Leite     9,6g  de 1.000 g  ✓     │
│ Polpa          12 g   de     4 g  ✗     │
│ ⚠ Estoque insuficiente de Polpa        │
│ ──────────────────────────────────────  │
│ Custo do lote: R$ 66,60 (1,85/un)       │
│ [        Produzir          ]            │
└─────────────────────────────────────────┘
```
Semáforo por linha (✓ verde / ✗ vermelho). **Qualquer insuficiente → botão Produzir desabilitado.**

### 2.4 Ações

| Ação | Gatilho | Resultado |
|---|---|---|
| Produzir | botão (aba ou modal) | RPC `registrar_producao` → toast "Produção registrada: +N un · custo R$ X/un · insumos baixados" → refetch página + histórico |
| Fechar/cancelar | X / fora | volta sem alterar nada |

### 2.5 Estados

loading (skeleton) · empty ("Nenhuma produção ainda…") · error + [Tentar novamente] · success. Modal fora de gate de loading (HOTFIX 06/10).

---

## 3. Responsividade / Acessibilidade / Reuso

- Desktop tabela de consumo; mobile lista em cards; modal full-width no mobile (padrão F2).
- `role="status"` nos badges; focos mantidos ao abrir/fechar modal; `aria-live` no toast.
- Reuso: busca/estados do padrão F2; `formatCurrency`; paleta textual do módulo (#86cb92 ok, vrm #B91C1C) — sem cor nova.
