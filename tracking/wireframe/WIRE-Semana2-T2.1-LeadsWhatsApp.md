# WIRE — Semana 2 / T2.1: Leads do WhatsApp no CRM

**Versão:** 1.0  
**Data:** 2026-09-09  
**Status:** Pronto para Implementação  
**Telas:** `/crm/leads`, `/crm/leads/[id]`  
**Referências:** `PRD-Semana2-T2.1-PedidoWhatsApp-CRM.md`, `SPEC-Semana2-T2.1-PedidoWhatsApp-CRM.md`

---

## 1. Roteamento

| Rota | Tela | Acesso |
|------|------|--------|
| `/crm/leads` | Listagem de leads | Usuário autenticado |
| `/crm/leads/:id` | Detalhes do lead | Usuário autenticado |

---

## 2. Tela `/crm/leads` — Listagem

### 2.1 Layout Desktop

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Leads                                                      [+ Novo Lead]         │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                 │ │
│ │ [🔍 Buscar por nome, telefone ou empresa...    ] [Origem: Todas ▼] [Status ▼] │ │
│ │                                                                                 │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                 │ │
│ │ Nome                Telefone         Origem        Status        Último        │ │
│ │ ────────────────────────────────────────────────────────────────────────────── │ │
│ │ [MS] Maria Santos   (11) 98765-4321  [WhatsApp]   [Novo]        15m           │ │
│ │ [JS] João Silva     (11) 91234-5678  [WhatsApp]   [Em contato]  2h            │ │
│ │ [AP] Ana Pereira    (11) 99876-5432  [Manual]     [Convertido]  1d            │ │
│ │ [CO] Carlos Oliveira (11) 95555-4444 [WhatsApp]   [Arquivado]   7d            │ │
│ │ [FL] Fernanda Lima  (11) 94444-3333  [WhatsApp]   [Novo]        45m           │ │
│ │                                                                                 │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes

| Elemento | Descrição |
|----------|-----------|
| Header | Título "Leads" + botão "Novo Lead" |
| Busca | Input com placeholder e ícone de lupa |
| Filtro origem | Select: Todas / WhatsApp / Manual / Landing / Indicação |
| Filtro status | Select: Todos / Novo / Em contato / Convertido / Arquivado |
| Tabela | Colunas: avatar+nome, telefone, origem, status, último |
| Linha | Hover destacado, click navega para detalhes |

### 2.3 Campos

| Campo | Tipo | Validação / Formato |
|-------|------|---------------------|
| Busca | text | livre, filtra nome/telefone/empresa |
| Origem | select | uma opção ou "all" |
| Status | select | uma opção ou "all" |

### 2.4 Ações

| Ação | Gatilho | Resultado |
|------|---------|-----------|
| Buscar | Digitar no input | Filtra lista em tempo real |
| Filtrar origem | Mudar select | Filtra por origem |
| Filtrar status | Mudar select | Filtra por status |
| Ver lead | Click na linha | Navega para `/crm/leads/:id` |
| Novo lead | Botão "+ Novo Lead" | Abre modal/form (placeholder para sprint futura) |

### 2.5 Estados

#### Loading
```
┌────────────────────────────────────────┐
│ Leads                    [+ Novo Lead] │
├────────────────────────────────────────┤
│ [███████                    ] [□□] [□□] │
├────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓ │
└────────────────────────────────────────┘
```

#### Empty
```
┌────────────────────────────────────────┐
│ Leads                    [+ Novo Lead] │
├────────────────────────────────────────┤
│                                        │
│              [Ícone Users]             │
│                                        │
│        Nenhum lead encontrado          │
│  Leads vindos do WhatsApp aparecerão   │
│           aqui automaticamente.        │
│                                        │
└────────────────────────────────────────┘
```

#### Error
```
┌────────────────────────────────────────┐
│ Leads                                  │
├────────────────────────────────────────┤
│                                        │
│         [Ícone AlertTriangle]          │
│                                        │
│      Erro ao carregar leads            │
│      <mensagem do erro>                │
│                                        │
│        [Tentar novamente]              │
│                                        │
└────────────────────────────────────────┘
```

### 2.6 Fluxo de Navegação

```
/crm/leads
    │
    ├── click em linha/card → /crm/leads/:id
    ├── click "Novo Lead" → modal/form (placeholder)
    └── ajuste de filtros → lista filtrada
```

---

## 3. Tela `/crm/leads/[id]` — Detalhes

### 3.1 Layout Desktop

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar UNIQ]                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ← Maria Santos                                            [✏️ Editar]          │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                 │ │
│ │ ┌─────────────────────┐  ┌─────────────────────────────────────────────────┐   │ │
│ │ │ [MS]                │  │ Maria Santos                                    │   │ │
│ │ │                     │  │ (11) 98765-4321                                 │   │ │
│ │ │   Avatar            │  │ [WhatsApp] [Novo]                               │   │ │
│ │ │                     │  │                                                 │   │ │
│ │ │                     │  │ Empresa: Doceê                                  │   │ │
│ │ │                     │  │ Cadastrado em: 09/09/2026 14:32                 │   │ │
│ │ │                     │  │ Última interação: 15 minutos atrás              │   │ │
│ │ └─────────────────────┘  └─────────────────────────────────────────────────┘   │ │
│ │                                                                                 │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐     │ │
│ │ │ RESUMO DA CONVERSA                                                       │     │ │
│ │ │                                                                          │     │ │
│ │ │ Cliente (14:32): "Quero 2 caixas de brigadeiro pra sexta"               │     │ │
│ │ │ MEL (14:33): "Claro! Vou separar e já confirmo o valor."                │     │ │
│ │ │ Cliente (14:35): "Pode ser 3 caixas no total"                           │     │ │
│ │ │                                                                          │     │ │
│ │ │ [Ver conversa completa no Chatbot →]                                     │     │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘     │ │
│ │                                                                                 │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐     │ │
│ │ │ AÇÕES                                                                    │     │ │
│ │ │ [Marcar como em contato] [Marcar como convertido] [Arquivar]             │     │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘     │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Componentes

| Elemento | Descrição |
|----------|-----------|
| Header | Botão voltar, nome do lead, botão editar |
| Avatar | Iniciais ou foto |
| Dados | Nome, telefone, empresa, cadastro, última interação |
| Badges | Origem + status |
| Resumo | Até 5 mensagens recentes |
| Link | "Ver conversa completa no Chatbot" |
| Ações | Botões de mudança de status |

### 3.3 Campos

| Campo | Tipo | Formato |
|-------|------|---------|
| Telefone | link | `tel:+5511987654321` |
| Cadastrado em | text | `dd/mm/yyyy hh:mm` |
| Última interação | text | relativo (15 minutos atrás) |

### 3.4 Ações

| Ação | Gatilho | Resultado |
|------|---------|-----------|
| Voltar | Click em ← | Volta para `/crm/leads` |
| Editar | Click em ✏️ | Placeholder (sprint futura) |
| Ver conversa | Click no link | Navega para `/chatbot` com conversa selecionada |
| Marcar em contato | Botão | Atualiza status localmente |
| Marcar convertido | Botão | Atualiza status localmente |
| Arquivar | Botão | Atualiza status localmente |

### 3.5 Estados

#### Loading
```
┌────────────────────────────────────────┐
│ ←                        [✏️ Editar]   │
├────────────────────────────────────────┤
│ ┌─────┐  ┌───────────────────────────┐ │
│ │ ▓▓▓ │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ │ ▓▓▓ │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ │ ▓▓▓ │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ └─────┘  └───────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

#### Não encontrado
```
┌────────────────────────────────────────┐
│ ←                                      │
├────────────────────────────────────────┤
│                                        │
│           [Ícone UserX]                │
│                                        │
│        Lead não encontrado             │
│                                        │
│      [Voltar para leads]               │
│                                        │
└────────────────────────────────────────┘
```

---

## 4. Tela `/crm/leads` — Mobile

### 4.1 Layout Mobile

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
│ Ana Pereira            1d   │
│ (11) 99876-5432             │
│ [Manual] [Convertido]       │
├─────────────────────────────┤
│ ...                         │
└─────────────────────────────┘
```

### 4.2 Componentes

| Elemento | Descrição |
|----------|-----------|
| Header mobile | Título + botão novo |
| Busca | Input compacto |
| Chips de filtro | Scroll horizontal de origens |
| Cards | Um card por lead |

### 4.3 Ações

| Ação | Gatilho | Resultado |
|------|---------|-----------|
| Click no card | Tap | Navega para `/crm/leads/:id` |
| Filtro chip | Tap | Filtra por origem |

---

## 5. Responsividade

| Breakpoint | Layout |
|------------|--------|
| >= 1024px | Tabela desktop |
| 768px — 1023px | Tabela compacta |
| < 768px | Cards com chips de filtro |

---

## 6. Acessibilidade

- Toda linha/card tem `role="button"` e `tabIndex={0}`
- Enter/Space em linha/card abre detalhes
- Inputs com `aria-label`
- Badges com texto legível por screen reader
- Contraste dos badges verificados

---

**Documento criado em:** 2026-09-09  
**Próximo passo:** Implementação conforme PRD + SPEC.
