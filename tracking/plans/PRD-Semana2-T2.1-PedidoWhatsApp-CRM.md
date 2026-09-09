---
date: 2026-09-09T10:00:00-03:00
researcher: orchestrator
branch: master
repository: uniq-empresas/base-uniq
topic: "Semana 2 — T2.1: Pedido do WhatsApp vira cliente no CRM"
tags: [sprint, frontend, crm, clientes, whatsapp, n8n, mock-first]
status: in-progress
---

# PRD — Semana 2 / T2.1: Pedido do WhatsApp vira cliente no CRM 📲

**Projeto:** UNIQ Empresas  
**Tipo:** Frontend + integração n8n → Supabase  
**Data de Criação:** 2026-09-09  
**Responsável:** Frontend Team  
**Referências:**
- `DESIGN.md` (raiz) — identidade visual oficial
- `tracking/TRACKING.md` — Semana 2 / Tarefa 2.1
- `tracking/CONTEXTO_PROJETO.md` — funil, Melissa, dogfooding
- `src/app/components/crm/ClientesPage.tsx` — listagem existente
- `src/app/components/crm/ClienteDetalhePage.tsx` — detalhe existente
- Templates: `tracking/modelos/PRD-Sprint08-Fornecedores.md`, `tracking/plans/PRD-Chatbot.md`

---

## 1. Resumo Executivo

### 1.1 Objetivo
Quando um cliente do laboratório (Doceê / HQ Gráfica) demonstrar intenção de compra no WhatsApp (`5511919153508`), essa intenção deve se transformar automaticamente em um **cliente visível no CRM da Base UNIQ**. Reaproveitamos a tela de clientes já existente (`/crm/clientes`) e apenas adicionamos o indicador de origem WhatsApp e o resumo da conversa.

### 1.2 Escopo desta entrega
- ✅ Reaproveitar tela `/crm/clientes` existente
- ✅ Reaproveitar tela `/crm/clientes/[id]` existente
- ✅ Integração real com `crm_leads` (dados reais priorizados, mock como fallback)
- ✅ Badge/indicador de origem "WhatsApp" no card e na tabela
- ✅ No detalhe do cliente, aba ou seção com resumo da conversa WhatsApp
- ✅ Estados visuais: loading, empty, error, success
- ✅ Mock data realista para demonstração
- ⚠️ Fluxo n8n: detectar pedido e inserir/atualizar `crm_leads` (especificado, não implementado em código)
- ❌ Criar nova tela de "leads" — **não faz parte desta entrega**

### 1.3 Stakeholders
- Esposa do fundador / operadora da Doceê
- Equipe da HQ Gráfica
- Fundador (faz o fechamento humano)
- Melissa (origem dos dados via WhatsApp)

---

## 2. Design System — Especificações Visuais

### 2.1 Paleta de Cores UNIQ

| Token | Valor HEX | Uso |
|-------|-----------|-----|
| `--bg-primary` | `#efefef` | Fundo principal |
| `--bg-card` | `#ffffff` | Fundo de cards, listas, painéis |
| `--btn-primary` | `#3e5653` | Botões primários |
| `--btn-primary-hover` | `#1f2937` | Hover de botões |
| `--accent` | `#86cb92` | Destaques, indicadores ativos |
| `--text-primary` | `#1f2937` | Texto principal |
| `--text-secondary` | `#627271` | Texto secundário / placeholders |
| `--border` | `#e5e7eb` | Bordas e divisores |
| `--whatsapp` | `#25d366` | Badge origem WhatsApp |

### 2.2 Classes Tailwind Padrão

```tsx
// Badge origem WhatsApp
bg-[#25d366]/10 text-[#25d366] border border-[#25d366]/20 rounded-full px-2 py-1 text-xs font-medium

// Badge origem manual
bg-gray-100 text-gray-700 border border-gray-200 rounded-full px-2 py-1 text-xs font-medium
```

### 2.3 Tipografia

| Elemento | Fonte | Tamanho | Peso | Cor |
|----------|-------|---------|------|-----|
| Título da página | Poppins/Inter | 24px | 700 | `#1f2937` |
| Nome do cliente | Poppins/Inter | 16px | 600 | `#1f2937` |
| Dados secundários | Poppins/Inter | 14px | 400 | `#627271` |
| Label | Poppins/Inter | 12px | 500 | `#627271` |

---

## 3. Estrutura de Páginas e Componentes

### 3.1 Páginas (reaproveitadas)

| # | Página | Rota | Descrição |
|---|--------|------|-----------|
| 1 | Listagem de clientes | `/crm/clientes` | Já existe; será integrada ao banco |
| 2 | Detalhes do cliente | `/crm/clientes/:id` | Já existe; ganha aba de conversa WhatsApp |

### 3.2 Componentes (existentes + novos)

| # | Componente | Descrição | Localização |
|---|------------|-----------|-------------|
| 1 | `ClientesPage` | Listagem existente a integrar | `src/app/components/crm/ClientesPage.tsx` |
| 2 | `ClienteDetalhePage` | Detalhe existente a integrar | `src/app/components/crm/ClienteDetalhePage.tsx` |
| 3 | `ClienteOrigemBadge` | **NOVO** — badge WhatsApp / Manual | `src/app/components/crm/ClienteOrigemBadge.tsx` |
| 4 | `ClienteConversaResumo` | **NOVO** — resumo da conversa | `src/app/components/crm/ClienteConversaResumo.tsx` |

### 3.3 Hooks Customizados

| Hook | Descrição |
|------|-----------|
| `useClientes` | **NOVO** — busca clientes reais do Supabase + fallback mock |
| `useCliente` | **NOVO** — busca um cliente por id |

---

## 4. Funcionalidades Detalhadas

### 4.1 Tela `/crm/clientes` — adaptações

Manter layout atual e adicionar:
- Badge "WhatsApp" verde nos clientes com `origem = 'whatsapp'`
- Badge "Manual" cinza nos clientes cadastrados manualmente
- Filtro por origem: Todas / WhatsApp / Manual
- Busca por nome, telefone ou empresa (já existe)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Clientes                                                [+ Novo Cliente] │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ [🔍 Buscar...] [Origem: Todas ▼] [Status: Todos ▼] [Tags ▼]             │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                           │ │
│ │ ┌─────────────────────────┐ ┌─────────────────────────┐ ┌──────────────┐│ │
│ │ │ [MS]                    │ │ [TS]                    │ │ [PA]         ││ │
│ │ │ Maria Santos            │ │ Tech Solutions          │ │ Pedro Alves  ││ │
│ │ │ [WhatsApp]              │ │ [Manual]                │ │ [WhatsApp]   ││ │
│ │ │                         │ │                         │ │              ││ │
│ │ │ (11) 98765-4321         │ │ (11) 3210-5678          │ │ ...          ││ │
│ │ │ Novo · 15m              │ │ Ativo · 2h              │ │ Novo · 3h    ││ │
│ │ └─────────────────────────┘ └─────────────────────────┘ └──────────────┘│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Tela `/crm/clientes/:id` — adaptações

Manter tabs existentes e adicionar:
- Badge de origem no header (WhatsApp / Manual)
- Nova aba "Conversa" com resumo das mensagens do WhatsApp
- Link "Ver conversa completa no Chatbot"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Maria Santos                             [WhatsApp] [✏️ Editar]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Resumo] [Interações] [Negociações] [Dados] [Conversa]                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ CONVERSA                                                                    │
│ Cliente (14:32): "Quero 2 caixas de brigadeiro pra sexta"                  │
│ MEL (14:33): "Claro! Vou separar e já confirmo o valor."                   │
│ Cliente (14:35): "Pode ser 3 caixas no total"                              │
│                                                                             │
│ [Ver conversa completa no Chatbot →]                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Wireframes Descritivos

Ver arquivo dedicado: `tracking/wireframe/WIRE-Semana2-T2.1-LeadsWhatsApp.md`

---

## 6. Mock Data

Reaproveitar `src/app/components/crm/crmMockData.ts` e adicionar campo `origem` aos clientes.

---

## 7. Fluxo de Usuário

```
Cliente envia mensagem de pedido no WhatsApp do laboratório
        ↓
n8n detecta intenção de pedido + extrai nome/telefone
        ↓
Insere ou atualiza registro em crm_leads (origem = 'whatsapp')
        ↓
Operadora abre Base UNIQ → /crm/clientes
        ↓
Vê o cliente novo vindo do WhatsApp (badge verde)
        ↓
Clica no cliente → aba "Conversa" vê resumo
        ↓
Pode responder pelo chatbot ou fechar venda
```

---

## 8. Dependências

### 8.1 Bibliotecas
- `lucide-react` — ícones
- `date-fns` — formatação de datas
- `@supabase/supabase-js` — cliente Supabase

### 8.2 Componentes shadcn/ui
- Já utilizados na tela existente

### 8.3 Tabelas reais
- `crm_leads`
- `crm_chat_conversas`
- `crm_chat_mensagens`

---

## 9. Regras de Negócio (Frontend)

| Regra | Descrição |
|-------|-----------|
| R1 | Dados reais têm prioridade; mock existente é fallback |
| R2 | Cliente com `origem = 'whatsapp'` exibe badge verde WhatsApp |
| R3 | Cliente com `origem = 'manual'` exibe badge cinza "Manual" |
| R4 | Última interação exibida como tempo relativo |
| R5 | Aba "Conversa" só aparece se houver `conversa_id` vinculado |
| R6 | Resumo mostra até 5 mensagens mais recentes |

---

## 10. Checklist de Implementação

### Integração
- [ ] Criar `useClientes` com Supabase + fallback mock
- [ ] Criar `useCliente` com Supabase + fallback mock
- [ ] Adaptar `ClientesPage` para usar hook real
- [ ] Adaptar `ClienteDetalhePage` para usar hook real

### Componentes novos
- [ ] `ClienteOrigemBadge`
- [ ] `ClienteConversaResumo`

### Adaptações na listagem
- [ ] Adicionar badge de origem no card
- [ ] Adicionar badge de origem na tabela
- [ ] Adicionar filtro por origem

### Adaptações no detalhe
- [ ] Adicionar badge de origem no header
- [ ] Adicionar aba "Conversa"
- [ ] Link para conversa completa no `/chatbot`

### Estados Visuais
- [ ] Loading skeleton
- [ ] Empty state
- [ ] Error state com retry

### Acessibilidade
- [ ] ARIA labels
- [ ] Focus management
- [ ] Contraste

---

## 11. URLs das Telas

| Tela | Rota | Acesso |
|------|------|--------|
| Listagem | `/crm/clientes` | Usuário autenticado |
| Detalhes | `/crm/clientes/:id` | Usuário autenticado |

---

## 12. Estrutura de Arquivos

```
src/app/
├── components/crm/
│   ├── ClientesPage.tsx            # adaptar
│   ├── ClienteDetalhePage.tsx      # adaptar
│   ├── ClienteOrigemBadge.tsx      # novo
│   └── ClienteConversaResumo.tsx   # novo
├── hooks/
│   ├── use-clientes.ts             # novo
│   └── use-cliente.ts              # novo
├── types/
│   └── clientes.ts                 # novo (mapear crm_leads)
└── lib/mocks/
    └── clientes.ts                 # novo fallback
```

---

**Documento criado em:** 2026-09-09  
**Próximo passo:** Aprovar WIRE e iniciar implementação.
