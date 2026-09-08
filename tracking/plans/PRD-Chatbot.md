---
date: 2026-09-08T16:00:00-03:00
researcher: orchestrator
branch: master
repository: uniq-empresas/base-uniq
topic: "Módulo Chatbot — Redesign mobile-first e integração real"
tags: [sprint, frontend, chatbot, mobile-first, whatsapp, react, typescript]
status: in-progress
---

# PRD — Módulo Chatbot 🤖

**Projeto:** UNIQ Empresas  
**Tipo:** Frontend (UI + mock/real data)  
**Data de Criação:** 2026-09-08  
**Responsável:** Frontend Team  
**Referências:**
- `DESIGN.md` (raiz) — identidade visual oficial
- `tracking/TRACKING.md` — Semana 1 / Tarefa 1.4
- `src/app/components/chatbot/` — implementação atual
- Templates: `tracking/modelos/PRD-Sprint08-Fornecedores.md`

---

## 1. Resumo Executivo

### 1.1 Objetivo
Transformar o módulo Chatbot da Base UNIQ em uma interface de atendimento que funcione 24h, centralizando conversas do WhatsApp em um layout estilo WhatsApp, com foco **mobile-first** e dados reais vindos do Supabase.

### 1.2 Escopo desta entrega
- ✅ Tela `/chatbot` com lista de conversas + janela de chat
- ✅ Integração com `crm_chat_conversas` e `crm_chat_mensagens` (dados reais)
- ✅ Fallback para mock quando não houver dados reais
- ✅ Estados visuais: loading, empty, error, success
- ✅ Layout mobile-first (lista em tela cheia, chat em tela cheia com botão voltar)
- ✅ Layout desktop com duas colunas (lista + chat)
- ✅ Indicador de status do bot (online/offline/ocupado)
- ✅ Envio de mensagem local (UI)
- ✅ Navegação lateral dinâmica: chatbot aparece na rail quando ativo
- ❌ Backend de envio de mensagens (persistência vem em sprint futura)
- ❌ Upload real de imagem/arquivo

### 1.3 Stakeholders
- Donos de microempresas de Suzano/Alto Tietê
- Operadores de atendimento (esposa do fundador na Doceê, equipe da HQ Gráfica)
- Melissa (IA/parceiro digital) — futuro operador automatizado

---

## 2. Design System — Especificações Visuais

### 2.1 Paleta de Cores UNIQ

| Token | Valor HEX | Uso |
|-------|-----------|-----|
| `--bg-primary` | `#efefef` | Fundo principal |
| `--bg-card` | `#ffffff` | Fundo de cards, listas, input |
| `--bg-muted` | `#f3f4f6` | Fundo da área de mensagens |
| `--btn-primary` | `#3e5653` | Botões primários |
| `--btn-primary-hover` | `#1f2937` | Hover de botões |
| `--accent` | `#86cb92` | Destaques, indicadores ativos |
| `--text-primary` | `#1f2937` | Texto principal |
| `--text-secondary` | `#627271` | Texto secundário / placeholders |
| `--border` | `#e5e7eb` | Bordas e divisores |
| `--status-online` | `#22c55e` | Bot online |
| `--status-offline` | `#ef4444` | Bot offline |
| `--status-ocupado` | `#f59e0b` | Bot ocupado |

### 2.2 Classes Tailwind Padrão

```tsx
// Lista de conversas
bg-white border-r border-border h-full flex flex-col

// Item ativo da lista
bg-muted text-foreground

// Bolha do operador/UNIQ
bg-primary text-primary-foreground rounded-br-sm

// Bolha do cliente
bg-muted text-foreground rounded-bl-sm

// Input de mensagem
border-t border-border bg-white p-4 flex items-center gap-2
```

### 2.3 Tipografia

| Elemento | Fonte | Tamanho | Peso | Cor |
|----------|-------|---------|------|-----|
| Título da lista | Poppins/Inter | 18px | 600 | `#1f2937` |
| Nome do cliente | Poppins/Inter | 14px | 500 | `#1f2937` |
| Preview mensagem | Poppins/Inter | 13px | 400 | `#627271` |
| Timestamp | Poppins/Inter | 11px | 400 | `#627271` |
| Mensagem | Poppins/Inter | 14px | 400 | herda do fundo |
| Status do bot | Poppins/Inter | 12px | 500 | conforme status |

---

## 3. Estrutura de Páginas e Componentes

### 3.1 Páginas

| # | Página | Rota | Descrição |
|---|--------|------|-----------|
| 1 | Conversas | `/chatbot` | Lista + janela de chat |
| 2 | Configurações | `/chatbot/configuracoes` | Horário, status, comportamento |
| 3 | Respostas automáticas | `/chatbot/respostas` | Fluxos de resposta rápida |
| 4 | FAQ | `/chatbot/faq` | Perguntas frequentes |
| 5 | Estatísticas | `/chatbot/estatisticas` | Métricas de atendimento |

### 3.2 Componentes Principais

| # | Componente | Descrição | Localização |
|---|------------|-----------|-------------|
| 1 | `ChatbotPage` | Página principal, orquestra layout | `src/app/components/chatbot/ChatbotPage.tsx` |
| 2 | `ChatList` | Lista de conversas estilo WhatsApp | `src/app/components/chatbot/ChatList.tsx` |
| 3 | `ChatWindow` | Janela de chat + header + mensagens | `src/app/components/chatbot/ChatWindow.tsx` |
| 4 | `ChatInput` | Campo de input com envio e anexo | `src/app/components/chatbot/ChatInput.tsx` |
| 5 | `MessageBubble` | Bolha de mensagem individual | `src/app/components/chatbot/MessageBubble.tsx` |
| 6 | `ChatbotStatus` | Indicador de status do bot | `src/app/components/chatbot/ChatbotStatus.tsx` |
| 7 | `ChatEmpty` | Estado vazio de conversas | `src/app/components/chatbot/ConversaEmpty.tsx` |

### 3.3 Hooks Customizados

| Hook | Descrição |
|------|-----------|
| `useConversasReais` | Busca conversas/mensagens reais do Supabase com fallback mock |
| `useChatbot` | Estado local de conversas e envio (mock-first) |
| `useChatbotConfig` | Configurações, respostas automáticas, FAQ |

---

## 4. Funcionalidades Detalhadas

### 4.1 Tela `/chatbot` — Layout desktop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]                                                              │
│ ┌────────────────────┐  ┌─────────────────────────────────────────────────┐ │
│ │ Conversas          │  │ Maria Santos                          [⋮] [📞]  │ │
│ │ 5 conversas        │  ├─────────────────────────────────────────────────┤ │
│ │                    │  │                                                 │ │
│ │ 🔍 Buscar...       │  │  ┌──────────────┐                               │ │
│ │                    │  │  │ Olá, gostaria│ 14:32 ✓✓                    │ │
│ │ MS Maria Santos    │  │  │ de saber os  │                               │ │
│ │ Ótimo, obrigado... │  │  │ planos       │                               │ │
│ │ 15m               0│  │  └──────────────┘                               │ │
│ │                    │  │                               ┌────────────────┐  │ │
│ │ JS João Silva      │  │                               │ Olá! Temos     │  │ │
│ │ qualifying 1       │  │                               │ planos a partir│  │ │
│ │ 2h                 │  │                               │ de R$ 197/mês. │  │ │
│ │                    │  │                               │          14:33 │  │ │
│ │ AP Ana Pereira     │  │                               └────────────────┘  │ │
│ │ Gostaria de saber..│  │                                                 │ │
│ │ 5h                 3│  │                                                 │ │
│ │                    │  ├─────────────────────────────────────────────────┤ │
│ │ PC Pedro Costa     │  │ [📎] [Digite uma mensagem...]            [➤]   │ │
│ │ Consegui resolver..│  └─────────────────────────────────────────────────┘ │
│ │ 1d                 │  │
│ │                    │  │
│ │ LO Laura Oliveira  │  │
│ │ Quando seria...    │  │
│ │ 2d                 │  │
│ └────────────────────┘  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Tela `/chatbot` — Mobile (lista)

```
┌─────────────────────────────┐
│ ≡  Chatbot            [🔔]  │
├─────────────────────────────┤
│ 🔍 Buscar conversas...      │
├─────────────────────────────┤
│ Conversas                   │
│ 5 conversas                 │
├─────────────────────────────┤
│ MS Maria Santos        15m  │
│ Ótimo, obrigado pela...     │
├─────────────────────────────┤
│ JS João Silva          2h   │
│ qualifying 1                │
├─────────────────────────────┤
│ AP Ana Pereira         5h   │
│ Gostaria de saber os planos │
│                     3 (badge)│
├─────────────────────────────┤
│ ...                         │
└─────────────────────────────┘
```

### 4.3 Tela `/chatbot` — Mobile (chat aberto)

```
┌─────────────────────────────┐
│ ← Maria Santos         [⋮]  │
├─────────────────────────────┤
│                             │
│ ┌──────────┐                │
│ │ Olá...   │ 14:32 ✓✓       │
│ └──────────┘                │
│                ┌──────────┐ │
│                │ Olá! Te..│ │
│                │     14:33│ │
│                └──────────┘ │
│                             │
├─────────────────────────────┤
│ [📎] [Digite...]       [➤]  │
└─────────────────────────────┘
```

### 4.4 Funcionalidades da lista
- Busca por nome ou conteúdo da última mensagem
- Ordenação por timestamp (mais recente primeiro)
- Badge de não lidas
- Preview truncado da última mensagem
- Timestamp relativo (15m, 2h, 5h, 1d)
- Avatar com iniciais ou foto

### 4.5 Funcionalidades do chat
- Exibição de mensagens em bolhas (cliente à direita, UNIQ/bot à esquerda)
- Timestamp em cada mensagem
- Indicador de leitura (✓ / ✓✓) para mensagens enviadas
- Auto-scroll para a última mensagem
- Envio com Enter ou botão
- Anexo (placeholder visual)

### 4.6 Status do bot
- Dropdown com opções: online / offline / ocupado
- Indicador visual colorido
- Status reflete nas configurações

---

## 5. Wireframes Descritivos

Ver arquivo dedicado: `tracking/wireframe/WIRE-Chatbot.md`

---

## 6. Mock Data

Ver hook `src/app/hooks/useConversasReais.ts` e arquivo `src/app/lib/mocks/chatbot.ts`.

Conversas mockadas devem ter:
- Nomes brasileiros plausíveis
- Telefones e dados realistas
- Mensagens variadas (venda, suporte, qualificação)

---

## 7. Fluxo de Usuário

```
Usuário logado
    │
    ▼
Barra lateral → Chatbot (quando ativo)
    │
    ▼
Tela /chatbot
    │
    ├── Lista carrega (real ou mock)
    │       ├── Loading → Skeleton
    │       ├── Empty → mensagem amigável
    │       └── Conversas → lista renderizada
    │
    ├── Clica em conversa
    │       ├── Desktop: mensagens aparecem ao lado
    │       └── Mobile: navega para tela cheia de chat
    │
    └── Digita e envia mensagem
            └── Mensagem aparece localmente no chat
```

---

## 8. Dependências

### 8.1 Bibliotecas
- `lucide-react` — ícones
- `date-fns` — formatação de datas
- `@supabase/supabase-js` — cliente Supabase

### 8.2 Componentes shadcn/ui
- `Avatar`, `Badge`, `Button`, `Input`, `ScrollArea`, `Skeleton`, `DropdownMenu`

### 8.3 Tabelas reais
- `crm_chat_conversas`
- `crm_chat_mensagens`

---

## 9. Regras de Negócio (Frontend)

| Regra | Descrição |
|-------|-----------|
| R1 | Chatbot só aparece na barra lateral se módulo estiver `ativo`, `trial` ou `core` |
| R2 | Dados reais têm prioridade; mock é fallback em caso de erro ou lista vazia |
| R3 | Ao selecionar conversa, badge de não lidas zera |
| R4 | Envio de mensagem é local (não persiste) nesta sprint |
| R5 | Mobile: lista e chat não devem aparecer lado a lado |
| R6 | Desktop: lista fixa à esquerda, chat à direita |

---

## 10. Checklist de Implementação

### Páginas
- [x] `/chatbot` — conversas
- [x] `/chatbot/configuracoes`
- [x] `/chatbot/respostas`
- [x] `/chatbot/faq`
- [x] `/chatbot/estatisticas`

### Componentes Core
- [x] `ChatbotPage`
- [x] `ChatList`
- [x] `ChatWindow`
- [x] `ChatInput`
- [x] `MessageBubble`
- [x] `ChatbotStatus`

### Integração
- [x] `useConversasReais` com Supabase + fallback mock
- [x] `enviarMensagem` local

### Estados Visuais
- [x] Loading (skeleton)
- [x] Empty
- [x] Error com retry
- [x] Lista + chat

### Responsividade
- [ ] Desktop: duas colunas
- [ ] Mobile: lista tela cheia → chat tela cheia

### Navegação
- [x] Chatbot aparece na rail quando ativo
- [x] Submenu de chatbot com itens

### Acessibilidade
- [ ] ARIA labels nos botões de conversa
- [ ] Focus management no input
- [ ] Contraste WCAG 2.1 AA

---

## 11. URLs das Telas

| Tela | Rota | Acesso |
|------|------|--------|
| Conversas | `/chatbot` | Usuário autenticado com módulo ativo |
| Configurações | `/chatbot/configuracoes` | Admin/gerente |
| Respostas automáticas | `/chatbot/respostas` | Admin/gerente |
| FAQ | `/chatbot/faq` | Admin/gerente |
| Estatísticas | `/chatbot/estatisticas` | Admin/gerente |

---

## 12. Estrutura de Arquivos

```
src/app/
├── components/chatbot/
│   ├── ChatbotPage.tsx
│   ├── ChatList.tsx
│   ├── ChatWindow.tsx
│   ├── ChatInput.tsx
│   ├── MessageBubble.tsx
│   ├── ChatbotStatus.tsx
│   ├── ConversaEmpty.tsx
│   ├── ChatbotConfigPage.tsx
│   ├── RespostasAutoPage.tsx
│   ├── FAQPage.tsx
│   └── ChatbotStatsPage.tsx
├── hooks/
│   ├── useConversasReais.ts
│   ├── useChatbot.ts
│   └── useChatbotConfig.ts
├── types/chatbot.ts
├── lib/mocks/chatbot.ts
└── routes.tsx
```

---

**Documento criado em:** 2026-09-08  
**Próximo passo:** Aprovar WIRE e iniciar implementação do redesign mobile-first.
