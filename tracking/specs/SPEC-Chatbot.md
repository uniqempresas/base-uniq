# SPEC — Módulo Chatbot

**Versão:** 1.0  
**Data:** 2026-09-08  
**Status:** Pronto para Implementação  
**Tipo:** Frontend (UI + dados reais/mock)  
**Referência PRD:** `tracking/plans/PRD-Chatbot.md`

---

## 1. Visão Geral Técnica

### 1.1 Objetivo
Implementar o redesign mobile-first do módulo Chatbot da Base UNIQ, mantendo a integração real com o Supabase e seguindo os padrões de projeto existentes.

### 1.2 Stack Técnica
- **Framework:** Vite + React + React Router
- **UI:** shadcn/ui + Tailwind CSS
- **Ícones:** lucide-react
- **Datas:** date-fns
- **Estado:** React hooks
- **Dados:** Supabase (oficial) + fallback mock

### 1.3 Padrões do Projeto
- Estrutura de arquivos em `src/app/components/chatbot/`
- Hooks customizados em `src/app/hooks/`
- Tipos em `src/app/types/chatbot.ts`
- Mock data em `src/app/lib/mocks/chatbot.ts`
- Idioma: português para labels e mensagens

---

## 2. Arquitetura de Tipos

### 2.1 Arquivo: `src/app/types/chatbot.ts`

```typescript
export type StatusConversa = 'ativa' | 'encerrada' | 'arquivada';
export type TipoMensagem = 'texto' | 'imagem' | 'arquivo';
export type StatusBot = 'online' | 'offline' | 'ocupado';

export interface Conversa {
  id: string;
  clienteNome: string;
  clienteAvatar?: string;
  ultimaMensagem: string;
  timestamp: Date;
  naoLidas: number;
  status: StatusConversa;
}

export interface Mensagem {
  id: string;
  conversaId: string;
  conteudo: string;
  tipo: TipoMensagem;
  isBot: boolean;
  timestamp: Date;
  lida: boolean;
  arquivoUrl?: string;
}

export interface ConfigBot {
  ativo: boolean;
  horarioAtendimento: string;
  diasAtivos: string[];
  tempoResposta: number;
}

export interface RespostaAuto {
  id: string;
  gatilho: string;
  resposta: string;
  ativo: boolean;
}

export interface FAQItem {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
}
```

### 2.2 Props dos Componentes

```typescript
// ChatList
interface ChatListProps {
  conversas: Conversa[];
  conversaAtiva: string | null;
  onSelectConversa: (id: string) => void;
  onSearch?: (query: string) => void;
  loading?: boolean;
}

// ChatWindow
interface ChatWindowProps {
  conversa: Conversa | null;
  mensagens: Mensagem[];
  onSendMessage: (mensagem: string) => void;
  statusBot?: StatusBot;
}

// ChatInput
interface ChatInputProps {
  onSend: (mensagem: string) => void;
  disabled?: boolean;
}

// MessageBubble
interface MessageBubbleProps {
  mensagem: Mensagem;
  isOwn: boolean;
}

// ChatbotStatus
interface ChatbotStatusProps {
  status: StatusBot;
  onChange: (status: StatusBot) => void;
}
```

---

## 3. Estrutura de Arquivos

```
src/app/
├── components/chatbot/
│   ├── ChatbotPage.tsx          # Orquestração principal
│   ├── ChatList.tsx             # Lista de conversas
│   ├── ChatWindow.tsx           # Janela de chat
│   ├── ChatInput.tsx            # Input de mensagem
│   ├── MessageBubble.tsx        # Bolha de mensagem
│   ├── ChatbotStatus.tsx        # Status do bot
│   ├── ConversaEmpty.tsx        # Estado vazio
│   ├── ChatbotConfigPage.tsx    # Configurações
│   ├── RespostasAutoPage.tsx    # Respostas automáticas
│   ├── FAQPage.tsx              # FAQ
│   └── ChatbotStatsPage.tsx     # Estatísticas
├── hooks/
│   ├── useConversasReais.ts     # Dados reais + fallback
│   ├── useChatbot.ts            # Estado local
│   └── useChatbotConfig.ts      # Configurações
├── types/chatbot.ts             # Tipos
├── lib/mocks/chatbot.ts         # Mock data
└── routes.tsx                   # Rotas
```

---

## 4. Componentes Detalhados

### 4.1 ChatbotPage

**Responsabilidade:** Orquestrar o layout, estados globais e responsividade.

**Comportamento:**
- Carrega conversas via `useConversasReais`
- Renderiza `ChatList` + `ChatWindow` no desktop
- No mobile, controla transição lista ↔ chat
- Exibe skeleton, empty, error conforme estado

**Pseudo-estrutura:**
```tsx
export function ChatbotPage() {
  const { conversas, conversaAtiva, mensagens, loading, error, ... } = useConversasReais();
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  
  // loading → skeleton
  // error → error state
  // empty → empty state
  // desktop → <ChatList /> + <ChatWindow />
  // mobile → view condicional
}
```

### 4.2 ChatList

**Responsabilidade:** Renderizar lista de conversas com busca e scroll.

**Layout:**
- Header com título "Conversas" e contador
- Campo de busca (opcional nesta sprint)
- Lista scrollável
- Item ativo destacado

**Item da lista:**
```
┌──────────────────────────────────────┐
│ [Avatar]  Nome Cliente        15m    │
│           Preview mensagem...     2  │
└──────────────────────────────────────┘
```

### 4.3 ChatWindow

**Responsabilidade:** Exibir header da conversa, mensagens e input.

**Layout:**
- Header com avatar, nome, status
- Área de mensagens com scroll
- Input fixo na parte inferior

**Estado vazio:**
- Quando nenhuma conversa selecionada: "Selecione uma conversa para começar"

### 4.4 ChatInput

**Responsabilidade:** Capturar e enviar mensagem.

**Comportamento:**
- Campo de texto com placeholder "Digite uma mensagem..."
- Botão de anexo (placeholder)
- Botão de enviar
- Enter envia, Shift+Enter quebra linha

### 4.5 MessageBubble

**Responsabilidade:** Renderizar uma mensagem.

**Layout:**
- Alinhamento: cliente/direita, UNIQ/esquerda
- Bolha com bordas arredondadas
- Timestamp e status de leitura
- Suporte a imagem/arquivo (placeholder)

### 4.6 ChatbotStatus

**Responsabilidade:** Indicar e alterar status do bot.

**Estados:**
- `online` → verde
- `offline` → vermelho
- `ocupado` → amarelo

---

## 5. Hooks Customizados

### 5.1 useConversasReais

**Arquivo:** `src/app/hooks/useConversasReais.ts`

**Interface:**
```typescript
interface UseConversasReaisReturn {
  conversas: Conversa[];
  conversaAtiva: Conversa | null;
  mensagens: Mensagem[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  selecionarConversa: (id: string) => void;
  recarregar: () => void;
  enviarMensagem: (conteudo: string) => void;
}
```

**Comportamento:**
- Busca `crm_chat_conversas` e `crm_chat_mensagens`
- Mapeia dados do DB para tipos do frontend
- Fallback para mock em erro ou lista vazia
- `enviarMensagem` adiciona mensagem localmente

### 5.2 useChatbot

**Uso:** Estado local e mock-first para páginas secundárias.

### 5.3 useChatbotConfig

**Uso:** Configurações, respostas automáticas, FAQ e status.

---

## 6. Estados Visuais

### 6.1 Loading

- Skeleton na lista (5 itens)
- Skeleton no header do chat
- Placeholder no input

### 6.2 Empty

- Ícone de mensagem
- Título: "Nenhuma conversa encontrada"
- Descrição: "As conversas do chatbot aparecerão aqui quando houver mensagens."

### 6.3 Error

- Ícone de alerta
- Título: "Erro ao carregar conversas"
- Descrição com mensagem do erro
- Botão "Tentar novamente"

### 6.4 Seleção vazia

- Área de chat vazia com texto: "Selecione uma conversa para começar"

---

## 7. Responsividade

### 7.1 Desktop (>= 1024px)

```
[Sidebar] [ChatList 300px] [ChatWindow flex-1]
```

- Lista e chat visíveis simultaneamente
- Ao clicar em conversa, apenas o chat atualiza

### 7.2 Tablet (768px — 1023px)

```
[Sidebar colapsada] [ChatList 280px] [ChatWindow flex-1]
```

- Mesmo layout desktop, lista um pouco mais estreita

### 7.3 Mobile (< 768px)

```
Tela 1: ChatList em tela cheia
Tela 2: ChatWindow em tela cheia (após seleção)
```

- Lista ocupa 100% da largura
- Ao selecionar conversa, transiciona para chat em tela cheia
- Header do chat tem botão de voltar (←)
- Botão/flutuante opcional para voltar à lista

---

## 8. Rotas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/chatbot` | `ChatbotPage` | Conversas |
| `/chatbot/configuracoes` | `ChatbotConfigPage` | Configurações |
| `/chatbot/respostas` | `RespostasAutoPage` | Respostas automáticas |
| `/chatbot/faq` | `FAQPage` | FAQ |
| `/chatbot/estatisticas` | `ChatbotStatsPage` | Estatísticas |

---

## 9. Dependências

### 9.1 Bibliotecas
- `lucide-react`
- `date-fns`
- `@supabase/supabase-js`

### 9.2 Componentes shadcn/ui
- `Avatar`, `Badge`, `Button`, `Input`, `ScrollArea`, `Skeleton`, `DropdownMenu`, `Sheet` (mobile)

---

## 10. Checklist de Implementação

### Fundamentos
- [x] Tipos em `src/app/types/chatbot.ts`
- [x] Mock data em `src/app/lib/mocks/chatbot.ts`
- [x] Hook `useConversasReais.ts`

### Componentes Core
- [x] `ChatbotPage`
- [x] `ChatList`
- [x] `ChatWindow`
- [x] `ChatInput`
- [x] `MessageBubble`
- [x] `ChatbotStatus`

### Redesign Mobile-first
- [ ] Adicionar controle de view no `ChatbotPage` (mobile)
- [ ] ChatList em tela cheia no mobile
- [ ] ChatWindow em tela cheia no mobile com botão voltar
- [ ] Transição suave entre views

### Estados Visuais
- [x] Loading skeleton
- [x] Empty state
- [x] Error state com retry
- [x] Seleção vazia

### Navegação
- [x] Chatbot na rail lateral
- [x] Submenu de chatbot

### Acessibilidade
- [ ] ARIA labels
- [ ] Focus trap/input focus
- [ ] Contraste

---

**Documento criado em:** 2026-09-08  
**Próximo passo:** Implementar redesign mobile-first conforme WIRE aprovado.
