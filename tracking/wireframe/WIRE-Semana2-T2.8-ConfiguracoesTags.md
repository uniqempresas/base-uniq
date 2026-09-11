# WIRE — Configurações do CRM: Tags (T2.8)

## Tela `/crm/configuracoes` (mobile-first)

```
Configurações do CRM                        [← Voltar]
┌────────────────────────────────────────────┐
│  Tags / Etiquetas                          │
│  Escolha quais tags podem ser usadas nos   │
│  clientes do CRM.                          │
│                                            │
│  [Nome da nova tag...        ] [ Adicionar ]│
│                                            │
│  ┌─ VIP ──────── [x]   ┌─ Cliente Fiel ── [x] │
│  ┌─ Prospect ─── [x]   ┌─ Lead Quente ── [x]  │
│  ┌─ Inadimplente [x]   ┌─ Inativo ────── [x]  │
│                                            │
│  (Vazio): "Nenhuma tag ainda. Adicione a   │
│   primeira para usar no CRM."              │
└────────────────────────────────────────────┘
```

- Chip da tag: bolha colorida (cor da tag) + botão [x] p/ remover (com toast de confirmação).
- Adicionar: input + botão; cor auto-atribuída da paleta; erro se duplicada na mesma empresa.
- Estados: skeleton (loading) · empty · error com "Tentar novamente" · success.

## Modal "Novo Cliente" (atualizado)

```
┌─ Novo Cliente ─────────────────┐
│ [👤 PF | 🏢 PJ]                │
│ Nome completo *  [___________] │
│ Telefone *  [________] E-mail [ ]│
│ Tags / Etiquetas               │
│  (tags vindas das configurações)│
│  [VIP][Prospect][Lead Quente]… │
│ [ Cancelar ]  [ Salvar cliente]│
└────────────────────────────────┘
```

## Filtro de Clientes (tags dinâmicas)

```
Tags: [VIP][Prospect][Inadimplente][…]  ← mesmas tags da configuração
```