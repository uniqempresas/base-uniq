# WIRE — Dashboard CRM real + mobile compacto (16/10/2026)

```
/CRM/DASHBOARD (desktop: igual a hoje, com dados reais)
┌────────────────────────────────────────────────────────────────────┐
│ Base UNIQ — CRM          [Novo cliente] [Ver pipeline]             │
│ Dashboard CRM       ─ período: Todos • 30d • 90d                   │
├────────────────────────────┬───────────────────────────────────────┤
│ KPIs reais (4):            │ Pipeline por etapa (barras, cor das   │
│  Total de clientes X       │ Etapas da empresa, valor real)        │
│  Ativos X                  │                                       │
│  Pipeline R$X (N abertas)  ├───────────────────────────────────────┤
│  Conversão X% (N ganhas)   │ [DARK CARD] "Atenção"                 │
│                            │ negociações atrasadas (7d+) reais     │
├────────────────────────────┴───────────────────────────────────────┤
│ Clientes recentes (banco, 5)   │ Negociações ativas (5, prob heur.) │
└────────────────────────────────────────────────────────────────────┘

MOBILE (inspiração estoque dash — quadrados menores)
┌──────────────────────┐
│ [Novo cliente  ]     │
│ [Ver pipeline  ]     │
│ período ▾            │
┌─────────┬─────────┐  ← grid-cols-2, p-3, textos menores
│CLIENTES │ ATIVOS  │
│  19     │  18     │
├─────────┼─────────┤
│PIPELINE │CONVERSÃO│
│ R$ 0    │  —      │
└─────────┴─────────┘
│ Pipeline por etapa │ (soma)  "
├ barra etapa 1 ███ ███████
├ barra etapa 2 ███ ████
│ [DARK] Atenção · atrasadas …
Ações com min-h 44px; skeleton pulse no loading.
```
