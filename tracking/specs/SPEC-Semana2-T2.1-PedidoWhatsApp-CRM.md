# SPEC — Semana 2 / T2.1: Pedido do WhatsApp vira cliente no CRM

**Versão:** 1.1  
**Data:** 2026-09-09  
**Status:** Pronto para Implementação  
**Tipo:** Frontend (UI + dados reais/mock)  
**Referência PRD:** `tracking/plans/PRD-Semana2-T2.1-PedidoWhatsApp-CRM.md`

---

## 1. Visão Geral Técnica

### 1.1 Objetivo
Integrar a tela de clientes existente (`/crm/clientes`) ao Supabase, adicionar indicador de origem WhatsApp e uma aba de resumo de conversa no detalhe do cliente.

### 1.2 Stack Técnica
- **Framework:** Vite + React + React Router
- **UI:** shadcn/ui + Tailwind CSS
- **Ícones:** lucide-react
- **Datas:** date-fns
- **Estado:** React hooks
- **Dados:** Supabase (oficial) + fallback mock

### 1.3 Padrões do Projeto
- Manter estrutura atual em `src/app/components/crm/`
- Hooks customizados em `src/app/hooks/`
- Tipos em `src/app/types/clientes.ts`
- Mock data em `src/app/lib/mocks/clientes.ts`
- Idioma: português

---

## 2. Arquitetura de Tipos

### 2.1 Arquivo: `src/app/types/clientes.ts`

```typescript
export type ClienteOrigem = 'whatsapp' | 'manual';

export interface Cliente {
  id: string;
  empresa_id: string;
  nome: string;
  tipo: 'PF' | 'PJ';
  email?: string | null;
  telefone: string;
  whatsapp: string;
  documento?: string | null;
  cidade?: string | null;
  status: 'ativo' | 'inativo';
  origem: ClienteOrigem;
  tags: string[];
  ultimaInteracao: string; // texto relativo ou ISO
  totalCompras: number;
  dataCadastro: string;
  vendedor?: string | null;
  avatarColor?: string;
  initials?: string;
  conversa_id?: string | null;
  observacoes?: string | null;
}
```

---

## 3. Estrutura de Arquivos

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
│   └── clientes.ts                 # novo
└── lib/mocks/
    └── clientes.ts                 # novo fallback
```

---

## 4. Componentes Detalhados

### 4.1 ClienteOrigemBadge

**Arquivo:** `src/app/components/crm/ClienteOrigemBadge.tsx`

```tsx
interface ClienteOrigemBadgeProps {
  origem: ClienteOrigem;
}

// WhatsApp: verde #25d366 + ícone MessageCircle
// Manual: cinza + ícone UserPlus
```

### 4.2 ClienteConversaResumo

**Arquivo:** `src/app/components/crm/ClienteConversaResumo.tsx`

```tsx
interface ClienteConversaResumoProps {
  conversaId: string | null;
}

// Busca mensagens de crm_chat_mensagens
// Mostra até 5 mensagens recentes
// Link para /chatbot
```

### 4.3 ClientesPage (adaptações)

- Substituir `CLIENTES` mock por `useClientes()`
- Adicionar filtro `origemFiltro`: 'Todas' | 'WhatsApp' | 'Manual'
- Renderizar `ClienteOrigemBadge` no card e na tabela
- Manter todos os comportamentos atuais

### 4.4 ClienteDetalhePage (adaptações)

- Substituir busca mock por `useCliente(id)`
- Adicionar `ClienteOrigemBadge` no header
- Adicionar tab "Conversa" após "Dados Completos"
- Aba "Conversa" renderiza `ClienteConversaResumo`

---

## 5. Hooks Customizados

### 5.1 useClientes

**Arquivo:** `src/app/hooks/use-clientes.ts`

**Interface:**
```typescript
interface UseClientesReturn {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}
```

**Comportamento:**
- Busca `crm_leads` do Supabase oficial
- Mapeia campos do banco para interface `Cliente`
- Fallback para mock adaptado se vazio/erro
- Ordena por `ultima_interacao` desc

### 5.2 useCliente

**Arquivo:** `src/app/hooks/use-cliente.ts`

**Interface:**
```typescript
interface UseClienteReturn {
  cliente: Cliente | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}
```

---

## 6. Mock Data

### 6.1 Arquivo: `src/app/lib/mocks/clientes.ts`

```typescript
import { Cliente } from '@/app/types/clientes';

export const mockClientes: Cliente[] = [
  {
    id: 'lead-001',
    empresa_id: 'emp-docee',
    nome: 'Maria Santos',
    tipo: 'PF',
    telefone: '(11) 98765-4321',
    whatsapp: '(11) 98765-4321',
    status: 'ativo',
    origem: 'whatsapp',
    tags: ['Novo', 'WhatsApp'],
    ultimaInteracao: '15 minutos atrás',
    totalCompras: 0,
    dataCadastro: '09/09/2026',
    cidade: 'Suzano / SP',
    vendedor: 'Melissa',
    avatarColor: '#8B5CF6',
    initials: 'MS',
    conversa_id: 'conv-001',
    observacoes: 'Pediu 2 caixas de brigadeiro para sexta-feira.',
  },
  // ... manter estilo dos mocks existentes
];
```

---

## 7. Mapeamento crm_leads → Cliente

| Campo `crm_leads` | Campo `Cliente` | Nota |
|-------------------|-----------------|------|
| `id` | `id` | |
| `empresa_id` | `empresa_id` | filtro por contexto |
| `nome` | `nome` | |
| `email` | `email` | |
| `telefone` | `telefone` / `whatsapp` | formatar para exibição |
| `status` | `status` | mapear para ativo/inativo |
| `origem` | `origem` | whatsapp / manual |
| `cargo` | — | não usado na UI atual |
| `empresa_nome` | `cidade` ou tag | opcional |
| `ltv` | — | não usado |
| `ultima_interacao` | `ultimaInteracao` | formatar relativo |
| `observacoes` | `observacoes` | |
| `foto_url` | — | opcional |
| `created_at` | `dataCadastro` | formatar |

---

## 8. Estados Visuais

### 8.1 Loading
- Skeleton nos cards / tabela
- Header com contador em "..."

### 8.2 Empty
- Manter estado vazio existente da `ClientesPage`

### 8.3 Error
- Manter padrão com ícone e botão "Tentar novamente"

---

## 9. Responsividade

Manter responsividade atual da `ClientesPage`:
- Desktop: grid 3 colunas / tabela
- Tablet: grid 2 colunas
- Mobile: cards

---

## 10. Rotas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/crm/clientes` | `ClientesPage` | Listagem integrada |
| `/crm/clientes/:id` | `ClienteDetalhePage` | Detalhe com aba Conversa |

---

## 11. Dependências

- `lucide-react`
- `date-fns`
- `@supabase/supabase-js`

---

## 12. Checklist de Implementação

### Fundamentos
- [ ] Tipos em `src/app/types/clientes.ts`
- [ ] Mock data em `src/app/lib/mocks/clientes.ts`
- [ ] Hook `use-clientes.ts`
- [ ] Hook `use-cliente.ts`

### Componentes
- [ ] `ClienteOrigemBadge`
- [ ] `ClienteConversaResumo`

### Adaptações
- [ ] `ClientesPage` usa `useClientes`
- [ ] Filtro por origem na listagem
- [ ] Badge de origem no card e tabela
- [ ] `ClienteDetalhePage` usa `useCliente`
- [ ] Badge de origem no header
- [ ] Aba "Conversa" no detalhe

### Estados Visuais
- [ ] Loading
- [ ] Empty
- [ ] Error com retry

### Acessibilidade
- [ ] ARIA labels
- [ ] Focus management
- [ ] Contraste

---

**Documento criado em:** 2026-09-09  
**Próximo passo:** Implementar conforme WIRE aprovado.
