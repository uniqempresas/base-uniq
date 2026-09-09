# WIRE — Semana 2 / T2.1: Clientes do WhatsApp no CRM

**Versão:** 1.1  
**Data:** 2026-09-09  
**Status:** Pronto para Implementação  
**Telas:** `/crm/clientes`, `/crm/clientes/:id`  
**Referências:** `PRD-Semana2-T2.1-PedidoWhatsApp-CRM.md`, `SPEC-Semana2-T2.1-PedidoWhatsApp-CRM.md`

---

## 1. Roteamento

| Rota | Tela | Acesso |
|------|------|--------|
| `/crm/clientes` | Listagem de clientes | Usuário autenticado |
| `/crm/clientes/:id` | Detalhes do cliente | Usuário autenticado |

> **Nota:** reaproveitamos as telas existentes. Não criamos `/crm/leads`.

---

## 2. Tela `/crm/clientes` — Listagem (adaptada)

### 2.1 Layout Desktop

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Clientes                                                [+ Novo Cliente]         │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                 │ │
│ │ [🔍 Buscar por nome, telefone...] [Origem: Todas ▼] [Status: Todos ▼] [Tags ▼] │ │
│ │                                                                                 │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                 │ │
│ │ ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────┐│ │
│ │ │ [MS]                    │ │ [TS]                    │ │ [PA]                ││ │
│ │ │ Maria Santos            │ │ Tech Solutions LTDA     │ │ Pedro Alves         ││ │
│ │ │ [WhatsApp]              │ │ [Manual]                │ │ [WhatsApp]          ││ │
│ │ │                         │ │                         │ │                     ││ │
│ │ │ (11) 98765-4321         │ │ (11) 3210-5678          │ │ (21) 98001-2345     ││ │
│ │ │ Novo · 15m              │ │ Ativo · 2h              │ │ Novo · 3h           ││ │
│ │ │                         │ │                         │ │                     ││ │
│ │ │ [tags]                  │ │ [tags]                  │ │ [tags]              ││ │
│ │ └─────────────────────────┘ └─────────────────────────┘ └─────────────────────┘│ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes

| Elemento | Descrição |
|----------|-----------|
| Header | Título "Clientes" + botão "Novo Cliente" |
| Busca | Input existente |
| Filtro origem | **NOVO** — Select: Todas / WhatsApp / Manual |
| Filtro status | Select existente |
| Filtro tags | Select existente |
| Cards/tabela | Layout existente + badge de origem |

### 2.3 Campos

| Campo | Tipo | Validação |
|-------|------|-----------|
| Busca | text | nome, telefone, e-mail |
| Origem | select | Todas / WhatsApp / Manual |
| Status | select | Todos / Ativo / Inativo |

### 2.4 Ações

| Ação | Gatilho | Resultado |
|------|---------|-----------|
| Filtrar origem | Mudar select | Filtra clientes por origem |
| Ver cliente | Click no card/linha | Navega para `/crm/clientes/:id` |
| Novo cliente | Botão | Abre modal existente |

### 2.5 Estados

Manter estados existentes (loading, empty, error) da `ClientesPage`.

### 2.6 Fluxo de Navegação

```
/crm/clientes
    │
    ├── click em cliente → /crm/clientes/:id
    ├── ajuste de filtros → lista filtrada
    └── novo cliente → modal
```

---

## 3. Tela `/crm/clientes/:id` — Detalhes (adaptada)

### 3.1 Layout Desktop

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ← Voltar para clientes                                                            │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                 │ │
│ │ ┌─────┐  Maria Santos                                    [WhatsApp] [✏️]        │ │
│ │ │ MS  │  👤 Pessoa Física                                                      │ │
│ │ └─────┘  (11) 98765-4321 · maria@gmail.com · Suzano/SP                         │ │
│ │                                                                                 │ │
│ │ [WhatsApp] [+ Interação] [⋮]                                                   │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │ [Resumo] [Interações] [Negociações] [Dados] [Conversa]                         │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                 │ │
│ │ CONVERSA                                                                        │ │
│ │                                                                                 │ │
│ │ Cliente (14:32): "Quero 2 caixas de brigadeiro pra sexta"                      │ │
│ │ MEL (14:33): "Claro! Vou separar e já confirmo o valor."                       │ │
│ │ Cliente (14:35): "Pode ser 3 caixas no total"                                  │ │
│ │                                                                                 │ │
│ │ [Ver conversa completa no Chatbot →]                                            │ │
│ │                                                                                 │ │
└─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Componentes

| Elemento | Descrição |
|----------|-----------|
| Header | Voltar, avatar, nome, tipo, contato |
| Badge origem | **NOVO** — WhatsApp / Manual |
| Ações | WhatsApp, Interação, menu |
| Tabs | Resumo, Interações, Negociações, Dados, **Conversa** |
| Aba Conversa | **NOVO** — resumo das mensagens |

### 3.3 Campos

| Campo | Tipo | Formato |
|-------|------|---------|
| Telefone | link | `tel:` |
| WhatsApp | link | `https://wa.me/55...` |
| Última interação | text | relativo |

### 3.4 Ações

| Ação | Gatilho | Resultado |
|------|---------|-----------|
| Voltar | Click em ← | Volta para `/crm/clientes` |
| Ver conversa | Click no link | Navega para `/chatbot` |
| Aba Conversa | Click na tab | Mostra resumo |

### 3.5 Estados

Manter estados existentes da `ClienteDetalhePage`. Adicionar estado vazio na aba Conversa quando não houver mensagens.

---

## 4. Responsividade

Manter responsividade atual:
- Desktop: grid 3 colunas / tabela
- Tablet: grid 2 colunas
- Mobile: cards, tabs scrolláveis

---

## 5. Acessibilidade

- Manter padrões existentes
- Aba "Conversa" com `role="tab"`
- Badge origem com texto legível por screen reader

---

**Documento criado em:** 2026-09-09  
**Próximo passo:** Implementação conforme PRD + SPEC.
