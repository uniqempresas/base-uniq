---
date: 2026-09-09T10:00:00-03:00
researcher: orchestrator
branch: master
repository: uniq-empresas/base-uniq
topic: "Semana 2 — T2.1: Pedido do WhatsApp vira lead no CRM"
tags: [sprint, frontend, crm, leads, whatsapp, n8n, mock-first]
status: in-progress
---

# PRD — Semana 2 / T2.1: Pedido do WhatsApp vira lead no CRM 📲

**Projeto:** UNIQ Empresas  
**Tipo:** Frontend + integração n8n → Supabase  
**Data de Criação:** 2026-09-09  
**Responsável:** Frontend Team  
**Referências:**
- `DESIGN.md` (raiz) — identidade visual oficial
- `tracking/TRACKING.md` — Semana 2 / Tarefa 2.1
- `tracking/CONTEXTO_PROJETO.md` — funil, Melissa, dogfooding
- Templates: `tracking/modelos/PRD-Sprint08-Fornecedores.md`, `tracking/plans/PRD-Chatbot.md`

---

## 1. Resumo Executivo

### 1.1 Objetivo
Quando um cliente do laboratório (Doceê / HQ Gráfica) demonstrar intenção de compra no WhatsApp (`5511919153508`), essa intenção deve se transformar automaticamente em um **lead visível no CRM da Base UNIQ**. Isso fecha o elo `WhatsApp → CRM` da cadeia de demonstração.

### 1.2 Escopo desta entrega
- ✅ Tela `/crm/leads` com listagem de leads (origem WhatsApp em destaque)
- ✅ Tela `/crm/leads/[id]` com detalhes do lead + resumo da conversa
- ✅ Badge/indicador de origem "WhatsApp"
- ✅ Integração real com `crm_leads` (dados reais priorizados, mock como fallback)
- ✅ Estados visuais: loading, empty, error, success
- ✅ Mock data realista para demonstração
- ⚠️ Fluxo n8n: detectar pedido e inserir/atualizar `crm_leads` (especificado, não implementado em código)
- ❌ Edição completa de lead (sprint futura)
- ❌ Pipeline arrastável (Kanban) — nesta entrega é lista simples

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
| `--bg-muted` | `#f3f4f6` | Fundo de linhas zebradas / resumo |
| `--btn-primary` | `#3e5653` | Botões primários |
| `--btn-primary-hover` | `#1f2937` | Hover de botões |
| `--accent` | `#86cb92` | Destaques, indicadores ativos |
| `--text-primary` | `#1f2937` | Texto principal |
| `--text-secondary` | `#627271` | Texto secundário / placeholders |
| `--border` | `#e5e7eb` | Bordas e divisores |
| `--status-novo` | `#3b82f6` | Lead novo (blue-500) |
| `--status-em-contato` | `#f59e0b` | Em contato (amber-500) |
| `--status-convertido` | `#22c55e` | Convertido (green-500) |
| `--status-arquivado` | `#6b7280` | Arquivado (gray-500) |
| `--whatsapp` | `#25d366` | Badge origem WhatsApp |

### 2.2 Classes Tailwind Padrão

```tsx
// Card de lead
bg-white rounded-xl shadow-sm border border-uniq-border p-5 hover:shadow-md transition-all

// Badge origem WhatsApp
bg-[#25d366]/10 text-[#25d366] border border-[#25d366]/20 rounded-full px-2 py-1 text-xs font-medium

// Status novo
bg-blue-100 text-blue-700 rounded-full px-2 py-1 text-xs font-medium

// Linha de lead na tabela
border-b border-uniq-border hover:bg-muted transition-colors
```

### 2.3 Tipografia

| Elemento | Fonte | Tamanho | Peso | Cor |
|----------|-------|---------|------|-----|
| Título da página | Poppins/Inter | 24px | 700 | `#1f2937` |
| Nome do lead | Poppins/Inter | 16px | 600 | `#1f2937` |
| Dados secundários | Poppins/Inter | 14px | 400 | `#627271` |
| Label | Poppins/Inter | 12px | 500 | `#627271` |
| Timestamp | Poppins/Inter | 12px | 400 | `#627271` |

---

## 3. Estrutura de Páginas e Componentes

### 3.1 Páginas

| # | Página | Rota | Descrição |
|---|--------|------|-----------|
| 1 | Listagem de leads | `/crm/leads` | Lista de leads com filtros e origem |
| 2 | Detalhes do lead | `/crm/leads/[id]` | Perfil + resumo da conversa WhatsApp |

### 3.2 Componentes Principais

| # | Componente | Descrição | Localização |
|---|------------|-----------|-------------|
| 1 | `LeadsPage` | Página principal de listagem | `src/app/components/crm/LeadsPage.tsx` |
| 2 | `LeadList` | Lista/tabela de leads | `src/app/components/crm/LeadList.tsx` |
| 3 | `LeadCard` | Card individual do lead (mobile) | `src/app/components/crm/LeadCard.tsx` |
| 4 | `LeadFilters` | Barra de busca e filtros | `src/app/components/crm/LeadFilters.tsx` |
| 5 | `LeadDetailPage` | Detalhes do lead | `src/app/components/crm/LeadDetailPage.tsx` |
| 6 | `LeadConversaResumo` | Resumo da conversa WhatsApp | `src/app/components/crm/LeadConversaResumo.tsx` |
| 7 | `LeadStatusBadge` | Badge de status do lead | `src/app/components/crm/LeadStatusBadge.tsx` |
| 8 | `LeadOrigemBadge` | Badge de origem (WhatsApp, manual, etc.) | `src/app/components/crm/LeadOrigemBadge.tsx` |
| 9 | `LeadEmpty` | Estado vazio de leads | `src/app/components/crm/LeadEmpty.tsx` |

### 3.3 Hooks Customizados

| Hook | Descrição |
|------|-----------|
| `useLeads` | Busca leads reais do Supabase + fallback mock |
| `useLead` | Busca um lead por id |
| `useLeadFilters` | Estado de busca/filtros |

---

## 4. Funcionalidades Detalhadas

### 4.1 Tela `/crm/leads` — Layout desktop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Leads                                        [+ Novo Lead]               │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ [🔍 Buscar lead...] [Origem: Todas ▼] [Status: Todos ▼]                 │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ Nome                Telefone         Origem      Status        Último    │ │
│ │ ─────────────────────────────────────────────────────────────────────── │ │
│ │ Maria Santos        (11) 98765-4321  WhatsApp    Novo          15m       │ │
│ │ João Silva          (11) 91234-5678  WhatsApp    Em contato    2h        │ │
│ │ Ana Pereira         (11) 99876-5432  Manual      Convertido    1d        │ │
│ │ ...                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Tela `/crm/leads` — Mobile

```
┌─────────────────────────────┐
│ ≡  Leads             [+]    │
├─────────────────────────────┤
│ 🔍 Buscar leads...          │
├─────────────────────────────┤
│ [Todas] [WhatsApp] [Manual] │
├─────────────────────────────┤
│ Maria Santos           15m  │
│ (11) 98765-4321             │
│ [WhatsApp] [Novo]           │
├─────────────────────────────┤
│ João Silva             2h   │
│ (11) 91234-5678             │
│ [WhatsApp] [Em contato]     │
├─────────────────────────────┤
│ ...                         │
└─────────────────────────────┘
```

### 4.3 Tela `/crm/leads/[id]` — Detalhes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Maria Santos                                    [✏️ Editar]              │
├─────────────────────────────────────────────────────────────────────────┤ │
│ ┌─────────────────────┐  ┌─────────────────────────────────────────────┐ │ │
│ │ [MS]                │  │ Maria Santos                                │ │ │
│ │                     │  │ (11) 98765-4321                             │ │ │
│ │                     │  │ [WhatsApp] [Novo]                           │ │ │
│ │                     │  │                                             │ │ │
│ │                     │  │ Origem: WhatsApp                            │ │ │
│ │                     │  │ Cadastrado em: 09/09/2026 14:32             │ │ │
│ │                     │  │ Última interação: 15 minutos atrás          │ │ │
│ └─────────────────────┘  └─────────────────────────────────────────────┘ │ │
│                                                                           │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ RESUMO DA CONVERSA                                                   │ │ │
│ │                                                                      │ │ │
│ │ Cliente (14:32): "Quero 2 caixas de brigadeiro pra sexta"           │ │ │
│ │ MEL (14:33): "Claro! Vou separar e já confirmo o valor."            │ │ │
│ │ Cliente (14:35): "Pode ser 3 caixas no total"                       │ │ │
│ │                                                                      │ │ │
│ │ [Ver conversa completa no Chatbot →]                                 │ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │ │
│                                                                           │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ AÇÕES                                                                │ │ │
│ │ [Marcar como em contato] [Marcar como convertido] [Arquivar]         │ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │ │
└─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Funcionalidades da listagem
- Busca por nome, telefone ou empresa
- Filtro por origem: Todas / WhatsApp / Manual
- Filtro por status: Todos / Novo / Em contato / Convertido / Arquivado
- Ordenação por última interação (mais recente primeiro)
- Click na linha/card abre detalhes
- Responsivo: tabela no desktop, cards no mobile

### 4.5 Funcionalidades do detalhe
- Perfil do lead (nome, telefone, foto/avatar)
- Badge de origem e status
- Resumo das últimas mensagens da conversa
- Link para conversa completa no `/chatbot`
- Ações rápidas de mudança de status

---

## 5. Wireframes Descritivos

Ver arquivo dedicado: `tracking/wireframe/WIRE-Semana2-T2.1-LeadsWhatsApp.md`

---

## 6. Mock Data

Ver arquivo: `src/app/lib/mocks/leads.ts` (a ser criado).

Leads mockados devem ter:
- Nomes brasileiros plausíveis
- Telefones no formato `(11) 9XXXX-XXXX`
- Origem "whatsapp" ou "manual"
- Status variado
- Empresa (quando aplicável)
- Última interação recente

---

## 7. Fluxo de Usuário

```
Cliente envia mensagem de pedido no WhatsApp do laboratório
        ↓
n8n detecta intenção de pedido + extrai nome/telefone
        ↓
Insere ou atualiza registro em crm_leads (origem = 'whatsapp')
        ↓
Operadora abre Base UNIQ → /crm/leads
        ↓
Vê o lead novo vindo do WhatsApp
        ↓
Clica no lead → vê resumo da conversa
        ↓
Pode marcar status, responder pelo chatbot ou fechar venda
```

---

## 8. Dependências

### 8.1 Bibliotecas
- `lucide-react` — ícones
- `date-fns` — formatação de datas relativas
- `@supabase/supabase-js` — cliente Supabase

### 8.2 Componentes shadcn/ui
- `Avatar`, `Badge`, `Button`, `Input`, `Select`, `Skeleton`, `Table`, `Card`, `Separator`

### 8.3 Tabelas reais
- `crm_leads`
- `crm_chat_conversas` (para resumo da conversa)
- `crm_chat_mensagens` (para resumo da conversa)

---

## 9. Regras de Negócio (Frontend)

| Regra | Descrição |
|-------|-----------|
| R1 | Dados reais têm prioridade; mock é fallback em erro ou lista vazia |
| R2 | Lead com `origem = 'whatsapp'` exibe badge verde WhatsApp |
| R3 | Lead com `origem = 'manual'` exibe badge cinza "Manual" |
| R4 | Status padrão de novo lead: `novo` |
| R5 | Última interação é exibida como tempo relativo (15m, 2h, 1d) |
| R6 | Click no telefone deve abrir link `tel:` (mobile) |
| R7 | Resumo da conversa mostra até 5 mensagens mais recentes |

---

## 10. Checklist de Implementação

### Páginas
- [ ] `/crm/leads` — listagem
- [ ] `/crm/leads/[id]` — detalhes

### Componentes Core
- [ ] `LeadsPage`
- [ ] `LeadList`
- [ ] `LeadCard`
- [ ] `LeadFilters`
- [ ] `LeadDetailPage`
- [ ] `LeadConversaResumo`
- [ ] `LeadStatusBadge`
- [ ] `LeadOrigemBadge`
- [ ] `LeadEmpty`

### Integração
- [ ] `useLeads` com Supabase + fallback mock
- [ ] `useLead` com Supabase + fallback mock
- [ ] `useLeadFilters`

### Estados Visuais
- [ ] Loading skeleton
- [ ] Empty state
- [ ] Error state com retry
- [ ] Lista + detalhes

### Responsividade
- [ ] Desktop: tabela com ações
- [ ] Tablet: tabela compacta
- [ ] Mobile: cards

### Acessibilidade
- [ ] ARIA labels nos botões de ação
- [ ] Focus management na busca
- [ ] Contraste WCAG 2.1 AA

---

## 11. URLs das Telas

| Tela | Rota | Acesso |
|------|------|--------|
| Listagem | `/crm/leads` | Usuário autenticado |
| Detalhes | `/crm/leads/[id]` | Usuário autenticado |

---

## 12. Estrutura de Arquivos

```
src/app/
├── components/crm/
│   ├── LeadsPage.tsx
│   ├── LeadList.tsx
│   ├── LeadCard.tsx
│   ├── LeadFilters.tsx
│   ├── LeadDetailPage.tsx
│   ├── LeadConversaResumo.tsx
│   ├── LeadStatusBadge.tsx
│   ├── LeadOrigemBadge.tsx
│   └── LeadEmpty.tsx
├── hooks/
│   ├── use-leads.ts
│   ├── use-lead.ts
│   └── use-lead-filters.ts
├── types/
│   └── leads.ts
├── lib/mocks/
│   └── leads.ts
└── routes.tsx
```

---

**Documento criado em:** 2026-09-09  
**Próximo passo:** Aprovar WIRE e iniciar implementação.
