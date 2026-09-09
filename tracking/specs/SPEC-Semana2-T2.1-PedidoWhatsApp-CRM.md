# SPEC — Semana 2 / T2.1: Pedido do WhatsApp vira lead no CRM

**Versão:** 1.0  
**Data:** 2026-09-09  
**Status:** Pronto para Implementação  
**Tipo:** Frontend (UI + dados reais/mock)  
**Referência PRD:** `tracking/plans/PRD-Semana2-T2.1-PedidoWhatsApp-CRM.md`

---

## 1. Visão Geral Técnica

### 1.1 Objetivo
Implementar a tela de leads do CRM que exibe leads vindos do WhatsApp (e manuais), com dados reais do Supabase e fallback para mock realista.

### 1.2 Stack Técnica
- **Framework:** Vite + React + React Router
- **UI:** shadcn/ui + Tailwind CSS
- **Ícones:** lucide-react
- **Datas:** date-fns
- **Estado:** React hooks
- **Dados:** Supabase (oficial) + fallback mock

### 1.3 Padrões do Projeto
- Estrutura de arquivos em `src/app/components/crm/`
- Hooks customizados em `src/app/hooks/`
- Tipos em `src/app/types/leads.ts`
- Mock data em `src/app/lib/mocks/leads.ts`
- Idioma: português para labels e mensagens

---

## 2. Arquitetura de Tipos

### 2.1 Arquivo: `src/app/types/leads.ts`

```typescript
export type LeadStatus = 'novo' | 'em_contato' | 'convertido' | 'arquivado';
export type LeadOrigem = 'whatsapp' | 'manual' | 'landing' | 'indicacao';

export interface Lead {
  id: string;
  empresa_id: string;
  nome: string;
  email?: string | null;
  telefone: string;
  status: LeadStatus;
  origem: LeadOrigem;
  cargo?: string | null;
  empresa_nome?: string | null;
  ltv?: number | null;
  ultima_interacao?: string | null; // ISO 8601
  observacoes?: string | null;
  foto_url?: string | null;
  conversa_id?: string | null; // referência crm_chat_conversas
  created_at: string;
}

export interface LeadFilters {
  search: string;
  origem: LeadOrigem | 'all';
  status: LeadStatus | 'all';
}

export interface LeadListProps {
  leads: Lead[];
  loading?: boolean;
  onSelect: (id: string) => void;
}

export interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

export interface LeadFiltersProps {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
}

export interface LeadDetailPageProps {
  leadId: string;
}

export interface LeadConversaResumoProps {
  conversaId: string | null;
  mensagens: {
    id: string;
    conteudo: string;
    isCliente: boolean;
    timestamp: string;
  }[];
  loading?: boolean;
}
```

---

## 3. Estrutura de Arquivos

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

## 4. Componentes Detalhados

### 4.1 LeadsPage

**Responsabilidade:** Orquestrar listagem, filtros e navegação.

**Pseudo-estrutura:**
```tsx
export function LeadsPage() {
  const { leads, loading, error, isFallback, recarregar } = useLeads();
  const { filters, setFilters } = useLeadFilters();
  const navigate = useNavigate();

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (filters.origem !== 'all' && lead.origem !== filters.origem) return false;
      if (filters.status !== 'all' && lead.status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          lead.nome.toLowerCase().includes(q) ||
          lead.telefone.includes(q) ||
          (lead.empresa_nome?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [leads, filters]);

  // loading → skeleton
  // error → error state
  // empty → LeadEmpty
  // desktop → tabela
  // mobile → cards
}
```

### 4.2 LeadList

**Responsabilidade:** Renderizar tabela no desktop e delegar cards no mobile.

**Layout desktop:**
```
┌────────────────────────────────────────────────────────────────────────┐
│ Nome          Telefone        Origem       Status        Último        │
├────────────────────────────────────────────────────────────────────────┤
│ Maria Santos  (11) 98765-4321 [WhatsApp]   [Novo]        15m           │
│ ...                                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.3 LeadCard

**Responsabilidade:** Card compacto para mobile.

```
┌─────────────────────────────┐
│ Maria Santos           15m  │
│ (11) 98765-4321             │
│ [WhatsApp] [Novo]           │
└─────────────────────────────┘
```

### 4.4 LeadFilters

**Responsabilidade:** Busca + selects de origem/status.

**Campos:**
- Input search com ícone 🔍
- Select "Origem": Todas / WhatsApp / Manual
- Select "Status": Todos / Novo / Em contato / Convertido / Arquivado

### 4.5 LeadDetailPage

**Responsabilidade:** Exibir detalhes do lead e resumo da conversa.

**Comportamento:**
- Busca lead por id via `useLead`
- Se não encontrar → estado vazio/error
- Exibe header com botão voltar
- Carrega resumo das mensagens da conversa vinculada

### 4.6 LeadConversaResumo

**Responsabilidade:** Mostrar até 5 mensagens recentes da conversa.

**Layout:**
```
Cliente (14:32): "Quero 2 caixas de brigadeiro..."
MEL (14:33): "Claro! Vou separar..."
```

### 4.7 LeadStatusBadge

**Status e cores:**
- `novo` → blue
- `em_contato` → amber
- `convertido` → green
- `arquivado` → gray

### 4.8 LeadOrigemBadge

**Origens:**
- `whatsapp` → verde WhatsApp + ícone MessageCircle
- `manual` → cinza + ícone UserPlus
- `landing` → roxo + ícone Globe
- `indicacao` → azul + ícone UserCheck

---

## 5. Hooks Customizados

### 5.1 useLeads

**Arquivo:** `src/app/hooks/use-leads.ts`

**Interface:**
```typescript
interface UseLeadsReturn {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  recarregar: () => void;
}
```

**Comportamento:**
- Busca `crm_leads` do Supabase oficial (`krrkfgvdwhpelxtrdtla`)
- Aplica filtro de `empresa_id` do contexto de autenticação
- Se vazio ou erro → fallback para `mockLeads`
- Ordena por `ultima_interacao` desc

### 5.2 useLead

**Arquivo:** `src/app/hooks/use-lead.ts`

**Interface:**
```typescript
interface UseLeadReturn {
  lead: Lead | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}
```

**Comportamento:**
- Busca lead por id no Supabase
- Fallback para mock se não encontrar

### 5.3 useLeadFilters

**Arquivo:** `src/app/hooks/use-lead-filters.ts`

**Interface:**
```typescript
interface UseLeadFiltersReturn {
  filters: LeadFilters;
  setFilters: (filters: LeadFilters) => void;
  resetFilters: () => void;
}
```

---

## 6. Mock Data

### 6.1 Arquivo: `src/app/lib/mocks/leads.ts`

```typescript
import { Lead } from '@/app/types/leads';

export const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    empresa_id: 'emp-docee',
    nome: 'Maria Santos',
    telefone: '5511987654321',
    status: 'novo',
    origem: 'whatsapp',
    empresa_nome: 'Doceê',
    ultima_interacao: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    observacoes: 'Pediu 2 caixas de brigadeiro para sexta-feira.',
    conversa_id: 'conv-001',
    created_at: '2026-09-09T14:32:00Z',
  },
  {
    id: 'lead-002',
    empresa_id: 'emp-docee',
    nome: 'João Silva',
    telefone: '5511912345678',
    status: 'em_contato',
    origem: 'whatsapp',
    empresa_nome: 'Doceê',
    ultima_interacao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    observacoes: 'Interessado em kit festa para 30 pessoas.',
    conversa_id: 'conv-002',
    created_at: '6-09-09T12:15:00Z',
  },
  {
    id: 'lead-003',
    empresa_id: 'emp-hq',
    nome: 'Ana Pereira',
    telefone: '5511998765432',
    status: 'convertido',
    origem: 'manual',
    empresa_nome: 'HQ Gráfica',
    ultima_interacao: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    observacoes: 'Fechou orçamento de 1.000 cartões de visita.',
    created_at: '2026-09-08T10:00:00Z',
  },
  {
    id: 'lead-004',
    empresa_id: 'emp-docee',
    nome: 'Carlos Oliveira',
    telefone: '5511955554444',
    status: 'arquivado',
    origem: 'whatsapp',
    empresa_nome: 'Doceê',
    ultima_interacao: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    observacoes: 'Não respondeu após 3 tentativas.',
    created_at: '2026-09-02T16:45:00Z',
  },
  {
    id: 'lead-005',
    empresa_id: 'emp-docee',
    nome: 'Fernanda Lima',
    telefone: '5511944443333',
    status: 'novo',
    origem: 'whatsapp',
    empresa_nome: 'Doceê',
    ultima_interacao: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    observacoes: 'Perguntou preço de bolo de aniversário.',
    conversa_id: 'conv-005',
    created_at: '2026-09-09T13:50:00Z',
  },
];
```

---

## 7. Estados Visuais

### 7.1 Loading

- Skeleton na tabela (5 linhas)
- Skeleton nos cards (3 cards)
- Header com título e botão desabilitado

### 7.2 Empty

- Ícone `Users`
- Título: "Nenhum lead encontrado"
- Descrição: "Leads vindos do WhatsApp aparecerão aqui automaticamente."

### 7.3 Error

- Ícone `AlertTriangle`
- Título: "Erro ao carregar leads"
- Descrição com mensagem do erro
- Botão "Tentar novamente"

### 7.4 Detalhe não encontrado

- Ícone `UserX`
- Título: "Lead não encontrado"
- Botão "Voltar para leads"

---

## 8. Responsividade

### 8.1 Desktop (>= 1024px)

```
[Sidebar] [LeadList tabela] (detalhes em rota separada)
```

### 8.2 Tablet (768px — 1023px)

```
[Sidebar colapsada] [LeadList tabela compacta]
```

### 8.3 Mobile (< 768px)

```
Tela 1: LeadList em cards, tela cheia
Tela 2: LeadDetailPage, tela cheia com botão voltar
```

---

## 9. Rotas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/crm/leads` | `LeadsPage` | Listagem de leads |
| `/crm/leads/:id` | `LeadDetailPage` | Detalhes do lead |

---

## 10. Dependências

### 10.1 Bibliotecas
- `lucide-react`
- `date-fns`
- `@supabase/supabase-js`

### 10.2 Componentes shadcn/ui
- `Avatar`, `Badge`, `Button`, `Input`, `Select`, `Skeleton`, `Table`, `Card`, `Separator`

---

## 11. Checklist de Implementação

### Fundamentos
- [ ] Tipos em `src/app/types/leads.ts`
- [ ] Mock data em `src/app/lib/mocks/leads.ts`
- [ ] Hook `use-leads.ts`
- [ ] Hook `use-lead.ts`
- [ ] Hook `use-lead-filters.ts`

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
- [ ] `useLeads` busca `crm_leads` do Supabase
- [ ] `useLead` busca lead por id
- [ ] Fallback para mock em erro/vazio

### Estados Visuais
- [ ] Loading skeleton
- [ ] Empty state
- [ ] Error state com retry
- [ ] Detalhe não encontrado

### Responsividade
- [ ] Desktop: tabela
- [ ] Tablet: tabela compacta
- [ ] Mobile: cards

### Acessibilidade
- [ ] ARIA labels
- [ ] Focus management
- [ ] Contraste

---

**Documento criado em:** 2026-09-09  
**Próximo passo:** Implementar conforme WIRE aprovado.
