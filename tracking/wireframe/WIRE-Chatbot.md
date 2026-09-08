# WIRE — Módulo Chatbot

**Versão:** 1.0  
**Data:** 2026-09-08  
**Referência:** `tracking/plans/PRD-Chatbot.md`, `tracking/specs/SPEC-Chatbot.md`

---

## 1. Tela `/chatbot` — Desktop

### 1.1 Layout completo

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]                                                                      │
│                                                                                     │
│ ┌──────────────────────┐  ┌─────────────────────────────────────────────────────┐  │
│ │ CHATBOT              │  │ Maria Santos                                 [⋮]   │  │
│ │                      │  ├─────────────────────────────────────────────────────┤  │
│ │ 🔍 Buscar conversas  │  │                                                     │  │
│ │                      │  │  ┌──────────────────┐                             │  │
│ │ Conversas            │  │  │ Olá, boa tarde!  │ 14:32                ✓✓     │  │
│ │ 5 conversas          │  │  │ Gostaria de      │                             │  │
│ │                      │  │  │ saber os planos. │                             │  │
│ │ MS Maria Santos      │  │  └──────────────────┘                             │  │
│ │ Ótimo, obrigado...   │  │                                                   │  │
│ │ 15m              [0] │  │                          ┌────────────────────┐   │  │
│ │                      │  │                          │ Olá, Maria! Temos  │   │  │
│ │ JS João Silva        │  │                          │ planos a partir de │   │  │
│ │ qualifying 1         │  │                          │ R$ 197/mês.        │   │  │
│ │ 2h               [1] │  │                          │              14:33 │   │  │
│ │                      │  │                          └────────────────────┘   │  │
│ │ AP Ana Pereira       │  │                                                     │  │
│ │ Gostaria de saber... │  │                                                     │  │
│ │ 5h               [3] │  │                                                     │  │
│ │                      │  ├─────────────────────────────────────────────────────┤  │
│ │ PC Pedro Costa       │  │ [📎] [Digite uma mensagem...]                [➤]   │  │
│ │ Consegui resolver... │  └─────────────────────────────────────────────────────┘  │
│ │ 1d               [0] │                                                            │
│ │                      │                                                            │
│ │ LO Laura Oliveira    │                                                            │
│ │ Quando seria...      │                                                            │
│ │ 2d               [0] │                                                            │
│ └──────────────────────┘                                                            │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Componentes

- **Sidebar UNIQ:** navegação global, chatbot destacado quando ativo
- **ChatList (esquerda):**
  - Header: título + contador
  - Busca
  - Lista de conversas
- **ChatWindow (direita):**
  - Header: avatar, nome, status
  - Área de mensagens com scroll
  - Input de mensagem

### 1.3 Ações

| Elemento | Ação |
|----------|------|
| Item da lista | Seleciona conversa, zera não lidas |
| Botão enviar | Envia mensagem localmente |
| Enter no input | Envia mensagem |
| Ícone ⋮ no header | Abre menu da conversa (arquivar, encerrar) |
| 📎 | Placeholder para anexo |

---

## 2. Tela `/chatbot` — Mobile

### 2.1 View 1: Lista de conversas (tela cheia)

```
┌─────────────────────────────┐
│ ≡  Chatbot            [🔔]  │
├─────────────────────────────┤
│ 🔍 Buscar conversas...      │
├─────────────────────────────┤
│                             │
│ Conversas                   │
│ 5 conversas                 │
│                             │
├─────────────────────────────┤
│                             │
│ [MS] Maria Santos      15m  │
│      Ótimo, obrigado pela   │
│      atenção!               │
│                             │
├─────────────────────────────┤
│ [JS] João Silva         2h  │
│      qualifying 1           │
│                        [1]  │
├─────────────────────────────┤
│ [AP] Ana Pereira        5h  │
│      Gostaria de saber os   │
│      planos disponíveis [3] │
├─────────────────────────────┤
│ [PC] Pedro Costa        1d  │
│      Consegui resolver...   │
├─────────────────────────────┤
│ [LO] Laura Oliveira     2d  │
│      Quando seria a         │
│      próxima reunião?       │
├─────────────────────────────┤
│                             │
└─────────────────────────────┘
```

### 2.2 View 2: Chat aberto (tela cheia)

```
┌─────────────────────────────┐
│ ← Maria Santos         [⋮]  │
├─────────────────────────────┤
│                             │
│  ┌──────────────────┐       │
│  │ Olá, boa tarde!  │ 14:32 │
│  │ Gostaria de      │   ✓✓  │
│  │ saber os planos. │       │
│  └──────────────────┘       │
│                             │
│         ┌──────────────────┐│
│         │ Olá, Maria!      ││
│         │ Temos planos a   ││
│         │ partir de R$ 197 ││
│         │ /mês.       14:33││
│         └──────────────────┘│
│                             │
├─────────────────────────────┤
│ [📎] [Digite uma mensagem...] [➤] │
└─────────────────────────────┘
```

### 2.3 Transição

```
Lista de conversas
        │
        ├── toque em conversa
        ▼
Chat em tela cheia
        │
        ├── toque em ←
        ▼
Lista de conversas
```

---

## 3. Estados

### 3.1 Loading

```
┌─────────────────────────────┐
│ Chatbot                     │
├─────────────────────────────┤
│ [━━━━]                      │  <- skeleton título
│ [━━━━━━]                    │  <- skeleton contador
├─────────────────────────────┤
│ ◯ [━━━━━━━] [━━━━]          │  <- skeleton item 1
│ ◯ [━━━━━━━] [━━━━]          │  <- skeleton item 2
│ ◯ [━━━━━━━] [━━━━]          │  <- skeleton item 3
│ ◯ [━━━━━━━] [━━━━]          │  <- skeleton item 4
│ ◯ [━━━━━━━] [━━━━]          │  <- skeleton item 5
└─────────────────────────────┘
```

### 3.2 Empty

```
┌─────────────────────────────┐
│ Chatbot                     │
├─────────────────────────────┤
│                             │
│        [💬]                 │
│                             │
│   Nenhuma conversa          │
│   encontrada                │
│                             │
│   As conversas do chatbot   │
│   aparecerão aqui quando    │
│   houver mensagens.         │
│                             │
└─────────────────────────────┘
```

### 3.3 Error

```
┌─────────────────────────────┐
│ Chatbot                     │
├─────────────────────────────┤
│                             │
│        [⚠️]                 │
│                             │
│   Erro ao carregar          │
│   conversas                 │
│                             │
│   Não foi possível buscar   │
│   as conversas.             │
│                             │
│   [🔄 Tentar novamente]     │
│                             │
└─────────────────────────────┘
```

### 3.4 Seleção vazia (desktop)

```
┌─────────────────────────────────────────────┐
│                                             │
│              [💬]                           │
│                                             │
│     Selecione uma conversa                  │
│     para começar                            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4. Item da lista de conversas

### 4.1 Desktop

```
┌──────────────────────────────────────┐
│ ◯ Maria Santos                15m    │
│   Ótimo, obrigado pela atenção!   0  │
└──────────────────────────────────────┘
```

### 4.2 Mobile

```
┌─────────────────────────────┐
│ ◯ Maria Santos         15m  │
│   Ótimo, obrigado pela      │
│   atenção!                  │
└─────────────────────────────┘
```

### 4.3 Componentes do item

- **Avatar:** imagem ou iniciais do nome
- **Nome do cliente**
- **Preview da última mensagem:** truncado em 1 linha (desktop) ou 2 (mobile)
- **Timestamp relativo:** 15m, 2h, 5h, 1d
- **Badge de não lidas:** círculo com número, oculto quando zero

---

## 5. Bolha de mensagem

### 5.1 Mensagem do cliente (direita)

```
┌─────────────────────────────┐
│                             │
│  ┌──────────────────┐       │
│  │ Olá! Quero saber │ 14:32 │
│  │ os planos.       │   ✓✓  │
│  └──────────────────┘       │
│                             │
└─────────────────────────────┘
```

### 5.2 Mensagem do bot/UNIQ (esquerda)

```
┌─────────────────────────────┐
│                             │
│       ┌──────────────────┐  │
│       │ Olá! Temos planos│  │
│       │ a partir de R$   │  │
│       │ 197/mês.   14:33 │  │
│       └──────────────────┘  │
│                             │
└─────────────────────────────┘
```

### 5.3 Estados da mensagem

- Enviada: ✓
- Lida: ✓✓
- Imagem: preview com overlay
- Arquivo: ícone + nome + tamanho

---

## 6. Header do chat

### 6.1 Desktop

```
┌─────────────────────────────────────────────────────────────┐
│ [◯] Maria Santos                  [📞] [🎥] [⋮]            │
│     Online                                                  │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Mobile

```
┌─────────────────────────────┐
│ ← [◯] Maria Santos    [⋮]   │
│       Online                │
└─────────────────────────────┘
```

### 6.3 Componentes

- Avatar
- Nome
- Status (Online / Offline / Ocupado)
- Botões de ação (placeholder no mobile: apenas ⋮)

---

## 7. Input de mensagem

```
┌─────────────────────────────────────────────────────────────┐
│ [📎] [Digite uma mensagem...                    ] [➤]      │
└─────────────────────────────────────────────────────────────┘
```

- Botão de anexo à esquerda
- Input de texto central
- Botão de enviar à direita (desabilitado se vazio)

---

## 8. Status do bot

### 8.1 Dropdown fechado

```
┌────────────────────────────┐
│ 🟢 Bot Online  [▼]         │
└────────────────────────────┘
```

### 8.2 Dropdown aberto

```
┌────────────────────────────┐
│ 🟢 Bot Online  [▲]         │
├────────────────────────────┤
│ 🟢 Online                  │
│ 🔴 Offline                 │
│ 🟡 Ocupado                 │
└────────────────────────────┘
```

---

## 9. Navegação

### 9.1 Barra lateral desktop

```
┌──────────┐
│ Visão Geral
│ Minha Empresa
│ Vendas & PDV
│ CRM
│ Marketplace
│ Financeiro
│ Agenda
│ Métricas
│ MEL
│ 🟢 Chatbot      <- destaque quando ativo
│ Módulos
│ Configurações
└──────────┘
```

### 9.2 Submenu Chatbot (desktop)

```
┌────────────────┐
│ Chatbot        │
│ Atendimento automatizado
├────────────────┤
│ Conversas      │
│ Configurações  │
│ Respostas auto │
│ FAQ            │
│ Estatísticas   │
└────────────────┘
```

---

## 10. Fluxo de Navegação

```
Dashboard / Sidebar
        │
        ├── [Chatbot] ────────────────► /chatbot
        │                                   │
        │                                   ├── seleciona conversa
        │                                   │       ├── Desktop: chat ao lado
        │                                   │       └── Mobile: tela cheia chat
        │                                   │
        │                                   ├── [Configurações] ──► /chatbot/configuracoes
        │                                   ├── [Respostas auto] ──► /chatbot/respostas
        │                                   ├── [FAQ] ─────────────► /chatbot/faq
        │                                   └── [Estatísticas] ────► /chatbot/estatisticas
        │
        └── [Módulos] ────────────────► /meus-modulos
                                            │
                                            └── ativa chatbot
                                                    │
                                                    ▼
                                            Chatbot aparece na sidebar
```

---

## 11. Considerações de UX/UI

1. **Mobile-first:** no celular, a lista é uma tela; o chat é outra. Nunca dividir horizontalmente.
2. **Feedback imediato:** ao tocar em uma conversa, a transição deve ser rápida.
3. **Indicadores de leitura:** usuário vê ✓✓ quando a mensagem foi lida.
4. **Não lidas:** badge visível e com contraste suficiente.
5. **Status do bot:** sempre visível no header do chat.
6. **Empty state:** explicar por que está vazio e o que acontece em seguida.
7. **Error state:** permitir retry sem perder contexto.
8. **Acessibilidade:** labels ARIA nos botões de conversa e no input.

---

## 12. Componentes Reutilizáveis

### ConversationItem
```
Props: Conversa, isActive, onClick
```

### MessageBubble
```
Props: Mensagem, isOwn
```

### ChatInput
```
Props: onSend, disabled
```

### StatusIndicator
```
Props: status: 'online' | 'offline' | 'ocupado'
```

---

**Documento criado em:** 2026-09-08  
**Próximo passo:** Implementação do redesign mobile-first.
