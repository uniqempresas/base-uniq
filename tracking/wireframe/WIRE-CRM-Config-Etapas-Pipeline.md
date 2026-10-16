# WIRE — CRM → Configurações ▸ Etapas do Pipeline (16/10/2026)

```
/CRM/CONFIGURACOES
┌─────────────────────────────────────────────┐
│ Configurações do CRM                        │
├─────────────────────────────────────────────┤
│ ▸ TAGS (existente, intocado)                │
│   [VIP] [Prospect] …      [+ Tag]           │
├─────────────────────────────────────────────┤
│ ▸ ETAPAS DO PIPELINE [NOVO]                 │
│   ordem  etapa            cor      ações    │
│   ▲▼  Prospecção      ●#627271  ✏ 🗑      │
│   ▲▼  Primeiro Contato ●#0EA5E9  ✏ 🗑      │
│   ▲▼  Negociação      ●#F59E0B  ✏ 🗑      │
│   ▲▼  Ganho           ●#22C55E  ✏ 🗑      │
│   ▲▼  Perdido         ●#EF4444  ✏ 🗑      │
│   [+ Etapa]                                 │
│   (⚠ excluir com negociações bloqueia:      │
│    "Mova as N negociações antes")           │
└─────────────────────────────────────────────┘
Modal criar/editar: [Nome] [cor paleta + input color]
Toast sucesso; falha = texto real do banco.
```
Drag: setas sobem/descem ordem — o kanban em `/crm/pipeline` reflete
na próxima visita, mesmo mérito que hoje.
