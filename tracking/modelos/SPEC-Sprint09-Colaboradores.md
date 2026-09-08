# 📋 SPEC TÉCNICO - Sprint 09: Módulo Colaboradores

**Projeto:** UNIQ Empresas  
**Data:** 21/03/2026  
**Versão:** 1.0  
**Arquitetura:** Frontend First (Mock Data)  
**Stack:** React 19 + TypeScript + Next.js 14 + Tailwind CSS + shadcn/ui

---

## 1. Estrutura de Diretórios

### 1.1 Árvore Completa do Módulo Colaboradores

```
📁 app/
├── 📁 configuracoes/
│   └── 📁 colaboradores/
│       ├── page.tsx                    # Lista de colaboradores
│       └── 📁 [id]/
│           └── 📁 permissoes/
│               └── page.tsx            # Página de permissões
│
📁 components/
├── 📁 employees/
│   ├── 📁 list/                       # Componentes da lista
│   │   ├── employee-list.tsx          # Lista principal (cards/tabela)
│   │   ├── employee-header.tsx        # Header com título e botão
│   │   ├── employee-filters.tsx       # Barra de filtros
│   │   ├── employee-search.tsx        # Campo de busca
│   │   ├── employee-status-filter.tsx  # Select de status
│   │   ├── employee-role-filter.tsx    # Select de papel
│   │   ├── view-toggle.tsx             # Toggle Cards/Tabela
│   │   ├── employee-grid.tsx           # Grid de cards
│   │   ├── employee-table.tsx          # Tabela alternativa
│   │   ├── employee-card.tsx           # Card individual
│   │   ├── employee-row.tsx            # Linha da tabela
│   │   ├── employee-dropdown.tsx       # Menu de ações (dropdown)
│   │   ├── employee-avatar.tsx         # Avatar com badge status
│   │   ├── employee-badges.tsx         # Badges de papel e módulos
│   │   ├── employee-empty.tsx          # Estado vazio
│   │   ├── employee-skeleton.tsx       # Skeleton de loading
│   │   └── index.ts                   # Barrel export
│   │
│   ├── 📁 form/                       # Componentes do formulário
│   │   ├── employee-form.tsx          # Formulário principal
│   │   ├── employee-form-modal.tsx    # Modal wrapper
│   │   ├── form-section.tsx            # Seção do formulário
│   │   ├── form-input.tsx             # Campo de input
│   │   ├── role-selector.tsx           # Seleção de papel (cards)
│   │   ├── role-card.tsx              # Card de papel individual
│   │   ├── module-checkbox.tsx         # Checkbox de módulo
│   │   ├── modules-grid.tsx            # Grid de checkboxes
│   │   ├── settings-toggles.tsx       # Toggles adicionais
│   │   └── form-actions.tsx           # Botões de ação
│   │
│   ├── 📁 permissions/                # Componentes de permissões
│   │   ├── permission-matrix.tsx       # Matriz de permissões
│   │   ├── permission-modal.tsx       # Modal wrapper
│   │   ├── permission-header.tsx      # Header do colaborador
│   │   ├── permission-row.tsx         # Linha de módulo
│   │   ├── permission-toggle.tsx       # Toggle individual
│   │   ├── permission-legend.tsx      # Legenda de cores
│   │   ├── permission-actions.tsx      # Ações rápidas
│   │   └── index.ts                   # Barrel export
│   │
│   └── index.ts                       # Barrel export principal
│
📁 hooks/
├── use-employees.ts                   # Hook de colaboradores
├── use-employee-form.ts                # Hook do formulário
├── use-permissions.ts                 # Hook de permissões
├── use-employee-filters.ts             # Hook de filtros
└── use-view-toggle.ts                  # Hook de toggle localStorage
│
📁 contexts/
└── employees-context.tsx              # Contexto de colaboradores
│
📁 types/
├── employee.ts                         # Tipos principais
├── permission.ts                       # Tipos de permissão
└── role.ts                             # Tipos de papel
│
📁 lib/
├── 📁 mocks/
│   ├── employees.ts                   # Mock de colaboradores
│   ├── roles.ts                       # Mock de papéis
│   ├── modules.ts                     # Mock de módulos
│   └── index.ts                       # Exportações
│
└── 📁 utils/
    ├── formatters.ts                   # Formatadores (data, tempo)
    ├── validators.ts                   # Validações (email, etc)
    └── permissions.ts                  # Helpers de permissão
│
📁 schemas/
└── employee-schema.ts                 # Schema Zod de validação
```

### 1.2 Padrão de Nomenclatura

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Componentes | PascalCase + sufixo funcional | `EmployeeCard`, `PermissionMatrix` |
| Hooks | camelCase + prefixo `use` | `useEmployees`, `usePermissions` |
| Contextos | PascalCase + sufixo `Context` | `EmployeesContext` |
| Tipos | PascalCase + interface | `Employee`, `ModuleAccess` |
| Enums | PascalCase | `EmployeeStatus`, `EmployeeRole` |
| Mocks | camelCase + prefixo `mock` | `mockEmployees`, `mockRoles` |
| Utilitários | camelCase + ação | `formatLastAccess`, `hasPermission` |
| Páginas | page.tsx dentro da pasta | `app/configuracoes/colaboradores/page.tsx` |

---

## 2. Tipos TypeScript

### 2.1 Tipos Principais (`types/employee.ts`)

```typescript
// ============================================
// ENUMS
// ============================================

export type EmployeeStatus = 'active' | 'inactive' | 'pending';

export type EmployeeRole = 'owner' | 'admin' | 'manager' | 'seller' | 'viewer';

export type ModulePermission = 'view' | 'create' | 'edit' | 'delete';

export type ModuleType = 'crm' | 'finance' | 'inventory' | 'sales' | 'store' | 'appointments' | 'settings';

// ============================================
// COLABORADOR
// ============================================

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  position?: string;
  avatar?: string;
  status: EmployeeStatus;
  lastAccess?: Date;
  modules: ModuleAccess[];
  createdAt: Date;
  updatedAt: Date;
  invitedAt?: Date;
  inviteExpiresAt?: Date;
}

// ============================================
// ACESSO POR MÓDULO
// ============================================

export interface ModuleAccess {
  module: ModuleType;
  permissions: ModulePermission[];
}

// ============================================
// PAPEL (ROLE)
// ============================================

export interface Role {
  id: string;
  name: EmployeeRole;
  label: string;
  description: string;
  defaultModules: ModuleType[];
  isSystem: boolean; // true for owner, admin, viewer
  icon: string;
  color: string;
}

// ============================================
// MÓDULO
// ============================================

export interface Module {
  id: ModuleType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ============================================
// FORMULÁRIO
// ============================================

export interface EmployeeFormData {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  role: EmployeeRole;
  modules: ModuleAccess[];
  notifyByEmail: boolean;
  whatsappAccess: boolean;
}

export interface EmployeeFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

// ============================================
// FILTROS
// ============================================

export interface EmployeeFilters {
  search: string;
  status: EmployeeStatus | 'all';
  role: EmployeeRole | 'all';
  view: 'cards' | 'table';
}

// ============================================
// VIEW MODE (persistido)
// ============================================

export type ViewMode = 'cards' | 'table';

export const VIEW_MODE_STORAGE_KEY = 'uniq-employees-view-mode';
```

### 2.2 Tipos de Permissão (`types/permission.ts`)

```typescript
// ============================================
// TIPOS DE PERMISSÃO
// ============================================

import { ModuleType, ModulePermission } from './employee';

export interface Permission {
  module: ModuleType;
  permission: ModulePermission;
  enabled: boolean;
}

export interface PermissionRow {
  module: ModuleType;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface PermissionMatrix {
  permissions: PermissionRow[];
  isOwner: boolean;
  isLocked: boolean;
}

// ============================================
// AÇÕES RÁPIDAS
// ============================================

export type PermissionAction = 'selectAll' | 'clearAll' | 'restoreDefault';

// ============================================
// CORES E LABELS
// ============================================

export const PERMISSION_COLORS = {
  view: { bg: 'bg-blue-500', label: 'Ver' },
  create: { bg: 'bg-green-500', label: 'Criar' },
  edit: { bg: 'bg-green-500', label: 'Editar' },
  delete: { bg: 'bg-red-500', label: 'Excluir' },
};

export const PERMISSION_ICONS = {
  view: 'Eye',
  create: 'Plus',
  edit: 'Pencil',
  delete: 'Trash2',
};
```

### 2.3 Tipos de Papel (`types/role.ts`)

```typescript
// ============================================
// PAPÉIS PRÉ-DEFINIDOS
// ============================================

import { EmployeeRole, ModuleType } from './employee';

export interface RoleDefinition {
  role: EmployeeRole;
  label: string;
  description: string;
  isRecommended?: boolean;
  modules: ModuleType[];
  permissions: ModuleType[][]; // Permissões padrão para cada módulo
}

// Papéis com permissões padrão
export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    role: 'admin',
    label: 'Administrador',
    description: 'Acesso completo a todos os módulos e configurações',
    isRecommended: true,
    modules: ['crm', 'finance', 'inventory', 'sales', 'store', 'appointments', 'settings'],
    permissions: [
      ['view', 'create', 'edit', 'delete'], // CRM
      ['view', 'create', 'edit', 'delete'], // Finance
      ['view', 'create', 'edit', 'delete'], // Inventory
      ['view', 'create', 'edit', 'delete'], // Sales
      ['view', 'create', 'edit', 'delete'], // Store
      ['view', 'create', 'edit', 'delete'], // Appointments
      ['view', 'create', 'edit'], // Settings (sem delete)
    ],
  },
  {
    role: 'manager',
    label: 'Gerente',
    description: 'Gestão de equipe e operações do dia a dia',
    modules: ['crm', 'sales', 'inventory', 'finance', 'appointments'],
    permissions: [
      ['view', 'create', 'edit'], // CRM
      ['view', 'create', 'edit'], // Sales
      ['view', 'create', 'edit'], // Inventory
      ['view', 'create', 'edit'], // Finance
      ['view', 'create', 'edit'], // Appointments
    ],
  },
  {
    role: 'seller',
    label: 'Vendedor',
    description: 'Operações básicas de vendas e atendimento',
    modules: ['crm', 'sales'],
    permissions: [
      ['view', 'create', 'edit'], // CRM
      ['view', 'create'], // Sales
    ],
  },
  {
    role: 'viewer',
    label: 'Visualizador',
    description: 'Acesso apenas para visualização (somente leitura)',
    modules: ['crm', 'finance', 'inventory', 'sales', 'appointments'],
    permissions: [
      ['view'], // CRM
      ['view'], // Finance
      ['view'], // Inventory
      ['view'], // Sales
      ['view'], // Appointments
    ],
  },
];
```

---

## 3. Mock Data Completo

### 3.1 Colaboradores (`lib/mocks/employees.ts`)

```typescript
import { Employee, EmployeeStatus, EmployeeRole, ModuleAccess } from '@/types/employee';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    email: 'carlos@empresa.com',
    phone: '(11) 98765-4321',
    role: 'owner',
    position: 'Proprietário',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=carlos',
    lastAccess: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'finance', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'inventory', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'sales', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'store', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'appointments', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'settings', permissions: ['view', 'create', 'edit', 'delete'] },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria@empresa.com',
    phone: '(11) 98765-1234',
    role: 'admin',
    position: 'Gerente Administrativa',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=maria',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'finance', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'inventory', permissions: ['view', 'create', 'edit'] },
      { module: 'sales', permissions: ['view', 'create', 'edit'] },
      { module: 'appointments', permissions: ['view', 'create', 'edit'] },
    ],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-06-20'),
  },
  {
    id: '3',
    name: 'João Santos',
    email: 'joao@empresa.com',
    role: 'manager',
    position: 'Gerente de Vendas',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=joao',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit'] },
      { module: 'sales', permissions: ['view', 'create', 'edit'] },
      { module: 'inventory', permissions: ['view'] },
    ],
    createdAt: new Date('2024-04-10'),
    updatedAt: new Date('2024-07-01'),
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@empresa.com',
    role: 'seller',
    position: 'Vendedora',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=ana',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit'] },
      { module: 'sales', permissions: ['view', 'create'] },
    ],
    createdAt: new Date('2024-05-20'),
    updatedAt: new Date('2024-08-15'),
  },
  {
    id: '5',
    name: 'Pedro Lima',
    email: 'pedro@empresa.com',
    role: 'viewer',
    position: 'Contador',
    status: 'pending',
    lastAccess: undefined,
    modules: [
      { module: 'finance', permissions: ['view'] },
      { module: 'sales', permissions: ['view'] },
    ],
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
    invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    inviteExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
  },
];

// ============================================
// STATUS COLORS
// ============================================

export const statusColors = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'Ativo',
  },
  inactive: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
    label: 'Inativo',
  },
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: 'Pendente',
  },
};

// ============================================
// ROLE COLORS
// ============================================

export const roleColors = {
  owner: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'Proprietário',
  },
  admin: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Administrador',
  },
  manager: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Gerente',
  },
  seller: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Vendedor',
  },
  viewer: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    label: 'Visualizador',
  },
};

// ============================================
// LIMITS
// ============================================

export const MAX_EMPLOYEES = 20;
export const INVITE_EXPIRY_DAYS = 7;
```

### 3.2 Papéis (`lib/mocks/roles.ts`)

```typescript
import { Role, EmployeeRole } from '@/types/employee';

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'owner',
    label: 'Proprietário',
    description: 'Acesso completo a todos os recursos e configurações da empresa',
    defaultModules: ['crm', 'finance', 'inventory', 'sales', 'store', 'appointments', 'settings'],
    isSystem: true,
    icon: 'Crown',
    color: 'purple',
  },
  {
    id: '2',
    name: 'admin',
    label: 'Administrador',
    description: 'Acesso completo a todos os módulos, exceto configurações críticas',
    defaultModules: ['crm', 'finance', 'inventory', 'sales', 'store', 'appointments'],
    isSystem: true,
    icon: 'Shield',
    color: 'blue',
  },
  {
    id: '3',
    name: 'manager',
    label: 'Gerente',
    description: 'Gestão de equipe e operações do dia a dia',
    defaultModules: ['crm', 'sales', 'inventory'],
    isSystem: false,
    icon: 'Users',
    color: 'green',
  },
  {
    id: '4',
    name: 'seller',
    label: 'Vendedor',
    description: 'Operações básicas de vendas e atendimento',
    defaultModules: ['crm', 'sales'],
    isSystem: false,
    icon: 'ShoppingCart',
    color: 'amber',
  },
  {
    id: '5',
    name: 'viewer',
    label: 'Visualizador',
    description: 'Acesso apenas para visualização (somente leitura)',
    defaultModules: ['crm', 'finance', 'inventory', 'sales', 'appointments'],
    isSystem: true,
    icon: 'Eye',
    color: 'gray',
  },
];

// ============================================
// ROLE DEFINITIONS FOR FORMS
// ============================================

export const roleFormOptions = [
  {
    value: 'admin' as EmployeeRole,
    label: 'Administrador',
    description: 'Acesso completo a todos os módulos e configurações',
    isRecommended: true,
  },
  {
    value: 'manager' as EmployeeRole,
    label: 'Gerente',
    description: 'Gestão de equipe e operações do dia a dia',
  },
  {
    value: 'seller' as EmployeeRole,
    label: 'Vendedor',
    description: 'Operações básicas de vendas e atendimento',
  },
  {
    value: 'viewer' as EmployeeRole,
    label: 'Visualizador',
    description: 'Acesso apenas para visualização (somente leitura)',
  },
];
```

### 3.3 Módulos (`lib/mocks/modules.ts`)

```typescript
import { Module, ModuleType } from '@/types/employee';

export const mockModules: Module[] = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Gestão de clientes e relacionamento',
    icon: 'Users',
    color: 'emerald',
  },
  {
    id: 'finance',
    name: 'Financeiro',
    description: 'Contas a pagar, receber e fluxo de caixa',
    icon: 'Wallet',
    color: 'emerald',
  },
  {
    id: 'inventory',
    name: 'Estoque',
    description: 'Controle de estoque e inventário',
    icon: 'Package',
    color: 'emerald',
  },
  {
    id: 'sales',
    name: 'Vendas',
    description: 'Ponto de venda epedidos',
    icon: 'ShoppingCart',
    color: 'emerald',
  },
  {
    id: 'store',
    name: 'Loja Virtual',
    description: 'Catálogo online e pedidos web',
    icon: 'Store',
    color: 'emerald',
  },
  {
    id: 'appointments',
    name: 'Agendamentos',
    description: 'Agenda de serviços e compromissos',
    icon: 'Calendar',
    color: 'emerald',
  },
  {
    id: 'settings',
    name: 'Configurações',
    description: 'Configurações da empresa e equipe',
    icon: 'Settings',
    color: 'amber',
  },
];

// ============================================
// MODULE COLORS
// ============================================

export const moduleColors: Record<ModuleType, string> = {
  crm: 'bg-emerald-500',
  finance: 'bg-emerald-500',
  inventory: 'bg-emerald-500',
  sales: 'bg-emerald-500',
  store: 'bg-emerald-500',
  appointments: 'bg-emerald-500',
  settings: 'bg-amber-500',
};

// ============================================
// MODULE LABELS
// ============================================

export const moduleLabels: Record<ModuleType, string> = {
  crm: 'CRM',
  finance: 'Financeiro',
  inventory: 'Estoque',
  sales: 'Vendas',
  store: 'Loja Virtual',
  appointments: 'Agendamentos',
  settings: 'Configurações',
};
```

---

## 4. Componentes Detalhados

### 4.1 Lista de Colaboradores (`components/employees/list/`)

#### **EmployeeList** (`employee-list.tsx`)

```typescript
interface EmployeeListProps {
  employees: Employee[];
  filters: EmployeeFilters;
  onFiltersChange: (filters: EmployeeFilters) => void;
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onOpenPermissions: (employee: Employee) => void;
  onDeactivateEmployee: (employee: Employee) => void;
  onActivateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onResendInvite: (employee: Employee) => void;
  loading?: boolean;
}

// Estados internos:
// - filteredEmployees: Employee[]
// - viewMode: 'cards' | 'table'

// Efeitos:
// - useEffect: aplica filtros quando filters mudam
// - useEffect: persiste viewMode no localStorage

// Handlers:
// - handleSearch: debounced search
// - handleStatusFilter: filter by status
// - handleRoleFilter: filter by role
// - handleViewModeChange: toggle cards/table
```

#### **EmployeeHeader** (`employee-header.tsx`)

```typescript
interface EmployeeHeaderProps {
  totalCount: number;
  maxCount: number;
  onAddEmployee: () => void;
}

// JSX Estruturado:
// <div className="flex items-center justify-between mb-6">
//   <div>
//     <h1 className="text-3xl font-bold text-[#1f2937] flex items-center gap-3">
//       <Users className="w-8 h-8 text-[#86cb92]" />
//       Colaboradores
//       <Badge className="bg-[#efefef] text-[#627271]">
//         {totalCount} de {maxCount}
//       </Badge>
//     </h1>
//     <p className="text-[#627271] mt-1">
//       Gerencie membros da sua equipe e permissões
//     </p>
//   </div>
//   
//   <Button onClick={onAddEmployee}>
//     <UserPlus className="w-5 h-5 mr-2" />
//     Novo Colaborador
//   </Button>
// </div>
```

#### **EmployeeFilters** (`employee-filters.tsx`)

```typescript
interface EmployeeFiltersProps {
  filters: EmployeeFilters;
  onChange: (filters: EmployeeFilters) => void;
}

// JSX Estruturado:
// <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
//   <div className="flex items-center gap-3">
//     <EmployeeSearch 
//       value={filters.search}
//       onChange={(search) => onChange({ ...filters, search })}
//     />
//     <EmployeeStatusFilter 
//       value={filters.status}
//       onChange={(status) => onChange({ ...filters, status })}
//     />
//     <EmployeeRoleFilter 
//       value={filters.role}
//       onChange={(role) => onChange({ ...filters, role })}
//     />
//   </div>
//   
//   <ViewToggle 
//     value={filters.view}
//     onChange={(view) => onChange({ ...filters, view })}
//   />
// </div>
```

#### **ViewToggle** (`view-toggle.tsx`)

```typescript
interface ViewToggleProps {
  value: 'cards' | 'table';
  onChange: (value: 'cards' | 'table') => void;
}

// JSX Estruturado:
// <div className="flex items-center gap-1 p-1 bg-[#efefef] rounded-lg">
//   <Button
//     variant={value === 'cards' ? 'secondary' : 'ghost'}
//     size="icon"
//     onClick={() => onChange('cards')}
//   >
//     <LayoutGrid className="w-5 h-5" />
//   </Button>
//   <Button
//     variant={value === 'table' ? 'secondary' : 'ghost'}
//     size="icon"
//     onClick={() => onChange('table')}
//   >
//     <List className="w-5 h-5" />
//   </Button>
// </div>
```

#### **EmployeeCard** (`employee-card.tsx`)

```typescript
interface EmployeeCardProps {
  employee: Employee;
  onEdit: () => void;
  onOpenPermissions: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
  onDelete: () => void;
  onResendInvite: () => void;
}

// Estados internos:
// - isDropdownOpen: boolean
// - isHovered: boolean

// JSX Estruturado:
// <Card className="hover:shadow-md transition-all cursor-pointer">
//   <CardHeader className="flex flex-row items-start gap-4 pb-4">
//     <EmployeeAvatar employee={employee} showStatus />
//     <div className="flex-1 min-w-0">
//       <h3 className="font-semibold text-[#1f2937] truncate">
//         {employee.name}
//       </h3>
//       <p className="text-sm text-[#627271] truncate">
//         {employee.email}
//       </p>
//     </div>
//     <EmployeeDropdown {...props} />
//   </CardHeader>
//   
//   <CardContent className="space-y-3">
//     <EmployeeRoleBadge role={employee.role} />
//     <EmployeeModuleTags modules={employee.modules} />
//   </CardContent>
//   
//   <CardFooter className="flex items-center justify-between pt-4 border-t">
//     <LastAccessText date={employee.lastAccess} />
//     <EmployeeStatusBadge status={employee.status} />
//   </CardFooter>
// </Card>
```

#### **EmployeeAvatar** (`employee-avatar.tsx`)

```typescript
interface EmployeeAvatarProps {
  employee: Employee;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
}

// JSX Estruturado:
// <div className="relative">
//   {employee.avatar ? (
//     <Avatar className={sizeClasses}>
//       <AvatarImage src={employee.avatar} alt={employee.name} />
//     </Avatar>
//   ) : (
//     <Avatar className={sizeClasses}>
//       <AvatarFallback className="bg-[#3e5653] text-white font-bold">
//         {getInitials(employee.name)}
//       </AvatarFallback>
//     </Avatar>
//   )}
//   
//   {showStatus && (
//     <StatusDot status={employee.status} />
//   )}
// </div>
```

#### **EmployeeDropdown** (`employee-dropdown.tsx`)

```typescript
interface EmployeeDropdownProps {
  employee: Employee;
  onEdit: () => void;
  onOpenPermissions: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
  onDelete: () => void;
  onResendInvite: () => void;
}

// JSX Estruturado:
// <DropdownMenu>
//   <DropdownMenuTrigger asChild>
//     <Button variant="ghost" size="icon">
//       <MoreVertical className="w-5 h-5" />
//     </Button>
//   </DropdownMenuTrigger>
//   
//   <DropdownMenuContent align="end" className="w-48">
//     <DropdownMenuItem onClick={onEdit}>
//       <Pencil className="w-4 h-4 mr-2" />
//       Editar
//     </DropdownMenuItem>
//     
//     <DropdownMenuItem onClick={onOpenPermissions}>
//       <Shield className="w-4 h-4 mr-2" />
//       Permissões
//     </DropdownMenuItem>
//     
//     {employee.status === 'pending' && (
//       <DropdownMenuItem onClick={onResendInvite}>
//         <Mail className="w-4 h-4 mr-2" />
//         Enviar convite
//       </DropdownMenuItem>
//     )}
//     
//     <DropdownMenuSeparator />
//     
//     {employee.role !== 'owner' && (
//       <>
//         {employee.status === 'active' ? (
//           <DropdownMenuItem onClick={onDeactivate} className="text-amber-600">
//             <UserX className="w-4 h-4 mr-2" />
//             Desativar
//           </DropdownMenuItem>
//         ) : (
//           <DropdownMenuItem onClick={onActivate} className="text-green-600">
//             <UserCheck className="w-4 h-4 mr-2" />
//             Ativar
//           </DropdownMenuItem>
//         )}
//         
//         <DropdownMenuItem onClick={onDelete} className="text-red-600">
//           <Trash2 className="w-4 h-4 mr-2" />
//           Excluir
//         </DropdownMenuItem>
//       </>
//     )}
//   </DropdownMenuContent>
// </DropdownMenu>
```

#### **EmployeeEmpty** (`employee-empty.tsx`)

```typescript
interface EmployeeEmptyProps {
  onAddEmployee: () => void;
}

// JSX Estruturado:
// <div className="py-16 text-center bg-white rounded-xl border border-[#e5e7eb]">
//   <Users className="w-16 h-16 text-[#e5e7eb] mx-auto mb-4" />
//   <h3 className="text-lg font-semibold text-[#1f2937]">
//     Nenhum colaborador encontrado
//   </h3>
//   <p className="text-sm text-[#627271] max-w-sm mx-auto mt-2">
//     Adicione membros à sua equipe para começar a gerenciar permissões e acessos.
//   </p>
//   <Button onClick={onAddEmployee} className="mt-6">
//     <UserPlus className="w-5 h-5 mr-2" />
//     Adicionar Primeiro Colaborador
//   </Button>
// </div>
```

#### **EmployeeSkeleton** (`employee-skeleton.tsx`)

```typescript
interface EmployeeSkeletonProps {
  count?: number;
  view?: 'cards' | 'table';
}

// JSX Estruturado (cards):
// <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//   {Array.from({ length: count }).map((_, i) => (
//     <Card key={i} className="p-5">
//       <div className="flex items-start gap-4 mb-4">
//         <Skeleton className="w-14 h-14 rounded-full" />
//         <div className="flex-1">
//           <Skeleton className="h-4 w-32 mb-2" />
//           <Skeleton className="h-3 w-48" />
//         </div>
//       </div>
//       <Skeleton className="h-6 w-24 rounded-full mb-3" />
//       <div className="flex gap-2">
//         <Skeleton className="h-5 w-12 rounded-md" />
//         <Skeleton className="h-5 w-16 rounded-md" />
//       </div>
//     </Card>
//   ))}
// </div>
```

### 4.2 Formulário de Colaborador (`components/employees/form/`)

#### **EmployeeFormModal** (`employee-form-modal.tsx`)

```typescript
interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  employee?: Employee; // Se definido, modo edição
  loading?: boolean;
}

// Estados internos:
// - formData: EmployeeFormData
// - errors: EmployeeFormErrors
// - touched: Record<string, boolean>

// JSX Estruturado:
// <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//   <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//     <DialogHeader>
//       <DialogTitle>
//         {employee ? 'Editar Colaborador' : 'Novo Colaborador'}
//       </DialogTitle>
//     </DialogHeader>
//     
//     <EmployeeForm
//       initialData={employee}
//       onSubmit={onSubmit}
//       onCancel={onClose}
//       loading={loading}
//     />
//   </DialogContent>
// </Dialog>
```

#### **EmployeeForm** (`employee-form.tsx`)

```typescript
interface EmployeeFormProps {
  initialData?: Employee;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Estados internos:
// - formData: EmployeeFormData
// - errors: EmployeeFormErrors
// - selectedModules: Set<ModuleType>

// JSX Estruturado:
// <form onSubmit={handleSubmit} className="space-y-6">
//   <FormSection title="Dados Pessoais" icon={User}>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <FormInput
//         label="Nome completo"
//         required
//         value={formData.name}
//         onChange={(e) => updateField('name', e.target.value)}
//         error={errors.name}
//         placeholder="Digite o nome completo"
//       />
//       <FormInput
//         label="Email"
//         type="email"
//         required
//         value={formData.email}
//         onChange={(e) => updateField('email', e.target.value)}
//         error={errors.email}
//         placeholder="email@empresa.com"
//       />
//       <FormInput
//         label="Telefone"
//         value={formData.phone}
//         onChange={(e) => updateField('phone', formatPhone(e.target.value))}
//         placeholder="(00) 00000-0000"
//       />
//       <FormInput
//         label="Cargo / Função"
//         value={formData.position}
//         onChange={(e) => updateField('position', e.target.value)}
//         placeholder="Ex: Gerente de Vendas"
//       />
//     </div>
//   </FormSection>
//   
//   <FormSection title="Permissões" icon={Shield}>
//     <RoleSelector
//       value={formData.role}
//       onChange={(role) => updateField('role', role)}
//     />
//     
//     <ModulesGrid
//       selectedModules={formData.modules}
//       onChange={(modules) => updateField('modules', modules)}
//       role={formData.role}
//     />
//   </FormSection>
//   
//   <FormSection title="Configurações Adicionais" icon={Settings}>
//     <SettingsToggles
//       notifyByEmail={formData.notifyByEmail}
//       whatsappAccess={formData.whatsappAccess}
//       onNotifyChange={(v) => updateField('notifyByEmail', v)}
//       onWhatsappChange={(v) => updateField('whatsappAccess', v)}
//     />
//   </FormSection>
//   
//   <FormActions
//     onCancel={onCancel}
//     loading={loading}
//     submitLabel={initialData ? 'Salvar Alterações' : 'Adicionar Colaborador'}
//   />
// </form>
```

#### **RoleSelector** (`role-selector.tsx`)

```typescript
interface RoleSelectorProps {
  value: EmployeeRole;
  onChange: (role: EmployeeRole) => void;
  disabled?: boolean;
}

// JSX Estruturado:
// <div className="space-y-3">
//   {roleFormOptions.map((option) => (
//     <RoleCard
//       key={option.value}
//       selected={value === option.value}
//       onClick={() => onChange(option.value)}
//       label={option.label}
//       description={option.description}
//       isRecommended={option.isRecommended}
//       disabled={disabled}
//     />
//   ))}
// </div>
```

#### **RoleCard** (`role-card.tsx`)

```typescript
interface RoleCardProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
  isRecommended?: boolean;
  disabled?: boolean;
}

// JSX Estruturado:
// <div
//   className={cn(
//     "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
//     selected
//       ? "border-[#86cb92] bg-[#86cb92]/5 ring-2 ring-[#86cb92]"
//       : "border-[#e5e7eb] hover:border-[#86cb92]",
//     disabled && "opacity-50 cursor-not-allowed"
//   )}
//   onClick={!disabled ? onClick : undefined}
// >
//   <div className={cn(
//     "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
//     selected ? "border-[#86cb92]" : "border-[#e5e7eb]"
//   )}>
//     {selected && (
//       <div className="w-2.5 h-2.5 rounded-full bg-[#86cb92]" />
//     )}
//   </div>
//   
//   <div className="flex-1">
//     <div className="flex items-center gap-2">
//       <span className="font-medium text-[#1f2937]">{label}</span>
//       {isRecommended && (
//         <Badge variant="secondary" className="text-xs">Recomendado</Badge>
//       )}
//     </div>
//     <p className="text-sm text-[#627271] mt-0.5">{description}</p>
//   </div>
// </div>
```

#### **ModulesGrid** (`modules-grid.tsx`)

```typescript
interface ModulesGridProps {
  selectedModules: ModuleAccess[];
  onChange: (modules: ModuleAccess[]) => void;
  role: EmployeeRole;
}

// JSX Estruturado:
// <div className="mt-4 grid grid-cols-2 gap-3">
//   {mockModules.map((module) => {
//     const isSelected = selectedModules.some(m => m.module === module.id);
//     return (
//       <ModuleCheckbox
//         key={module.id}
//         module={module}
//         selected={isSelected}
//         onChange={(checked) => handleToggle(module.id, checked)}
//         disabled={isModuleLocked(module.id)}
//       />
//     );
//   })}
// </div>
```

#### **ModuleCheckbox** (`module-checkbox.tsx`)

```typescript
interface ModuleCheckboxProps {
  module: Module;
  selected: boolean;
  onChange: (selected: boolean) => void;
  disabled?: boolean;
}

// JSX Estruturado:
// <label
//   className={cn(
//     "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
//     selected
//       ? "border-[#86cb92] bg-[#86cb92]/5"
//       : "border-[#e5e7eb] hover:bg-[#f9fafb]",
//     disabled && "opacity-50 cursor-not-allowed"
//   )}
// >
//   <Checkbox
//     checked={selected}
//     onCheckedChange={onChange}
//     disabled={disabled}
//   />
//   <ModuleIcon name={module.icon} className="w-5 h-5 text-[#627271]" />
//   <span className="text-sm text-[#1f2937]">{module.name}</span>
// </label>
```

### 4.3 Gestão de Permissões (`components/employees/permissions/`)

#### **PermissionModal** (`permission-modal.tsx`)

```typescript
interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSave: (permissions: ModuleAccess[]) => void;
  loading?: boolean;
}

// JSX Estruturado:
// <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//   <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//     <PermissionHeader employee={employee} onBack={onClose} />
//     <ScrollArea className="flex-1 px-6">
//       <PermissionMatrix
//         employee={employee}
//         onChange={handlePermissionChange}
//       />
//     </ScrollArea>
//     <div className="border-t p-6">
//       <PermissionActions
//         onSelectAll={handleSelectAll}
//         onClearAll={handleClearAll}
//         onRestore={handleRestoreDefault}
//       />
//       <PermissionFooter
//         onCancel={onClose}
//         onSave={handleSave}
//         loading={loading}
//         hasChanges={hasChanges}
//       />
//     </div>
//   </DialogContent>
// </Dialog>
```

#### **PermissionHeader** (`permission-header.tsx`)

```typescript
interface PermissionHeaderProps {
  employee: Employee;
  onBack: () => void;
}

// JSX Estruturado:
// <div className="flex items-center gap-4 p-6 border-b">
//   <Button variant="ghost" size="icon" onClick={onBack}>
//     <ArrowLeft className="w-5 h-5" />
//   </Button>
//   
//   <EmployeeAvatar employee={employee} size="xl" />
//   
//   <div>
//     <h2 className="text-xl font-bold text-[#1f2937]">{employee.name}</h2>
//     <EmployeeRoleBadge role={employee.role} />
//   </div>
// </div>
```

#### **PermissionMatrix** (`permission-matrix.tsx`)

```typescript
interface PermissionMatrixProps {
  employee: Employee;
  permissions: PermissionRow[];
  onPermissionChange: (module: ModuleType, permission: string, value: boolean) => void;
  disabled?: boolean;
}

// JSX Estruturado:
// <div className="bg-[#f9fafb] rounded-xl border border-[#e5e7eb] overflow-hidden">
//   <PermissionLegend />
//   
//   <Table>
//     <TableHeader>
//       <TableRow>
//         <TableHead className="w-48">Módulo</TableHead>
//         <TableHead className="text-center">Ver</TableHead>
//         <TableHead className="text-center">Criar</TableHead>
//         <TableHead className="text-center">Editar</TableHead>
//         <TableHead className="text-center">Excluir</TableHead>
//       </TableRow>
//     </TableHeader>
//     <TableBody>
//       {permissions.map((row) => (
//         <PermissionRow
//           key={row.module}
//           row={row}
//           onChange={(perm, value) => onPermissionChange(row.module, perm, value)}
//           disabled={disabled || employee.role === 'owner'}
//         />
//       ))}
//     </TableBody>
//   </Table>
// </div>
```

#### **PermissionRow** (`permission-row.tsx`)

```typescript
interface PermissionRowProps {
  row: {
    module: ModuleType;
    permissions: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
  onChange: (permission: string, value: boolean) => void;
  disabled?: boolean;
}

// JSX Estruturado:
// <TableRow>
//   <TableCell className="py-4">
//     <div className="flex items-center gap-3">
//       <ModuleIcon module={row.module} className="w-5 h-5 text-[#86cb92]" />
//       <span className="font-medium text-[#1f2937]">
//         {moduleLabels[row.module]}
//       </span>
//       {row.module === 'settings' && (
//         <Badge variant="warning" className="text-xs">Admin</Badge>
//       )}
//     </div>
//   </TableCell>
//   
//   <TableCell className="text-center">
//     <PermissionToggle
//       checked={row.permissions.view}
//       onChange={(v) => onChange('view', v)}
//       disabled={disabled}
//       color="blue"
//     />
//   </TableCell>
//   <TableCell className="text-center">
//     <PermissionToggle
//       checked={row.permissions.create}
//       onChange={(v) => onChange('create', v)}
//       disabled={disabled || !row.permissions.view}
//       color="green"
//     />
//   </TableCell>
//   <TableCell className="text-center">
//     <PermissionToggle
//       checked={row.permissions.edit}
//       onChange={(v) => onChange('edit', v)}
//       disabled={disabled || !row.permissions.view}
//       color="green"
//     />
//   </TableCell>
//   <TableCell className="text-center">
//     <PermissionToggle
//       checked={row.permissions.delete}
//       onChange={(v) => onChange('delete', v)}
//       disabled={disabled || !row.permissions.view || row.module === 'settings'}
//       color="red"
//     />
//   </TableCell>
// </TableRow>
```

#### **PermissionToggle** (`permission-toggle.tsx`)

```typescript
interface PermissionToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: 'blue' | 'green' | 'red';
}

// JSX Estruturado:
// <button
//   type="button"
//   role="switch"
//   aria-checked={checked}
//   disabled={disabled}
//   onClick={() => !disabled && onChange(!checked)}
//   className={cn(
//     "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
//     checked ? colors[color].active : colors[color].inactive,
//     disabled && "opacity-50 cursor-not-allowed"
//   )}
// >
//   <span
//     className={cn(
//       "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
//       checked ? "translate-x-6" : "translate-x-1"
//     )}
//   />
// </button>
```

#### **PermissionActions** (`permission-actions.tsx`)

```typescript
interface PermissionActionsProps {
  onSelectAll: () => void;
  onClearAll: () => void;
  onRestore: () => void;
  disabled?: boolean;
}

// JSX Estruturado:
// <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#e5e7eb] mb-6">
//   <Button
//     variant="ghost"
//     onClick={onSelectAll}
//     disabled={disabled}
//   >
//     <CheckCheck className="w-4 h-4 mr-2" />
//     Selecionar tudo
//   </Button>
//   
//   <Button
//     variant="ghost"
//     onClick={onClearAll}
//     disabled={disabled}
//   >
//     <X className="w-4 h-4 mr-2" />
//     Limpar tudo
//   </Button>
//   
//   <Button
//     variant="ghost"
//     onClick={onRestore}
//     disabled={disabled}
//   >
//     <RotateCcw className="w-4 h-4 mr-2" />
//     Restaurar padrão
//   </Button>
// </div>
```

---

## 5. Hooks Detalhados

### 5.1 useEmployees (`hooks/use-employees.ts`)

```typescript
interface UseEmployeesReturn {
  employees: Employee[];
  filteredEmployees: Employee[];
  loading: boolean;
  error: string | null;
  addEmployee: (data: EmployeeFormData) => Promise<void>;
  updateEmployee: (id: string, data: EmployeeFormData) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  deactivateEmployee: (id: string) => Promise<void>;
  activateEmployee: (id: string) => Promise<void>;
  resendInvite: (id: string) => Promise<void>;
  refetch: () => void;
}

// Implementação mock:
// - Simula delay de API (500ms)
// - Retorna mockEmployees por padrão
// - Operações mutam o estado local
// - Error handling simulado
```

### 5.2 usePermissions (`hooks/use-permissions.ts`)

```typescript
interface UsePermissionsReturn {
  permissions: PermissionRow[];
  hasChanges: boolean;
  updatePermission: (module: ModuleType, permission: string, value: boolean) => void;
  selectAll: () => void;
  clearAll: () => void;
  restoreDefault: (role: EmployeeRole) => void;
  savePermissions: (employeeId: string) => Promise<void>;
  loading: boolean;
}

// Implementação:
// - Inicializa com permissões do employee
// - Track changes comparando com original
// - restoreDefault usa ROLE_DEFINITIONS
```

### 5.3 useEmployeeFilters (`hooks/use-employee-filters.ts`)

```typescript
interface UseEmployeeFiltersReturn {
  filters: EmployeeFilters;
  setFilters: (filters: EmployeeFilters) => void;
  resetFilters: () => void;
}

// Default filters:
// { search: '', status: 'all', role: 'all', view: 'cards' }
```

### 5.4 useViewToggle (`hooks/use-view-toggle.ts`)

```typescript
interface UseViewToggleReturn {
  view: 'cards' | 'table';
  setView: (view: 'cards' | 'table') => void;
  toggle: () => void;
}

// Persists to localStorage using VIEW_MODE_STORAGE_KEY
```

---

## 6. Schemas de Validação

### 6.1 Employee Schema (`schemas/employee-schema.ts`)

```typescript
import { z } from 'zod';

export const employeeFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  email: z
    .string()
    .email('Email inválido'),
  
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(val), {
      message: 'Telefone inválido',
    }),
  
  position: z
    .string()
    .max(100, 'Cargo deve ter no máximo 100 caracteres')
    .optional(),
  
  role: z.enum(['admin', 'manager', 'seller', 'viewer'], {
    required_error: 'Selecione um papel',
  }),
  
  modules: z.array(
    z.object({
      module: z.string(),
      permissions: z.array(z.string()),
    })
  ),
  
  notifyByEmail: z.boolean(),
  whatsappAccess: z.boolean(),
});

export type EmployeeFormSchema = z.infer<typeof employeeFormSchema>;
```

---

## 7. Utilitários

### 7.1 Formatters (`lib/utils/formatters.ts`)

```typescript
// ============================================
// FORMATADORES
// ============================================

/**
 * Formata data para "último acesso"
 * @example "Há 2 horas", "Há 3 dias", "Nunca"
 */
export function formatLastAccess(date?: Date): string {
  if (!date) return 'Nunca';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Agora mesmo';
  if (minutes < 60) return `Há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  if (hours < 24) return `Há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  if (days < 7) return `Há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  if (days < 30) return `Há ${Math.floor(days / 7)} ${Math.floor(days / 7) === 1 ? 'semana' : 'semanas'}`;
  
  return format(new Date(date), 'dd/MM/yyyy');
}

/**
 * Formata telefone com máscara
 * @example "(11) 98765-4321"
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
  
  return value;
}

/**
 * Gera iniciais do nome
 * @example "Maria Silva" -> "MS"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formata data para input date
 */
export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
```

### 7.2 Permissions Helper (`lib/utils/permissions.ts`)

```typescript
// ============================================
// HELPERS DE PERMISSÃO
// ============================================

import { Employee, ModuleAccess, ModuleType, ModulePermission } from '@/types/employee';

/**
 * Verifica se employee tem permissão específica
 */
export function hasPermission(
  employee: Employee,
  module: ModuleType,
  permission: ModulePermission
): boolean {
  const moduleAccess = employee.modules.find(m => m.module === module);
  return moduleAccess?.permissions.includes(permission) ?? false;
}

/**
 * Verifica se employee pode acessar módulo
 */
export function canAccessModule(
  employee: Employee,
  module: ModuleType
): boolean {
  const moduleAccess = employee.modules.find(m => m.module === module);
  return moduleAccess !== undefined && moduleAccess.permissions.length > 0;
}

/**
 * Conta módulos acessíveis
 */
export function countAccessibleModules(employee: Employee): number {
  return employee.modules.filter(m => m.permissions.length > 0).length;
}

/**
 * Obtém permissões padrão para um papel
 */
export function getDefaultPermissionsForRole(
  role: EmployeeRole
): ModuleAccess[] {
  const roleDef = ROLE_DEFINITIONS.find(r => r.role === role);
  if (!roleDef) return [];
  
  return roleDef.modules.map((module, index) => ({
    module,
    permissions: roleDef.permissions[index] || ['view'],
  }));
}
```

---

## 8. Dependências

### 8.1 Componentes shadcn/ui (Já Existentes)

| Componente | Uso no Módulo |
|------------|---------------|
| **Button** | Botões primários, secundários |
| **Card** | Cards de colaborador |
| **Badge** | Badges de status e papel |
| **Avatar** | Avatar do colaborador |
| **Dialog** | Modal de cadastro/permissões |
| **Input** | Campos de formulário |
| **Select** | Filtros de status e papel |
| **Checkbox** | Seleção de módulos |
| **Switch** | Toggles de permissão |
| **Skeleton** | Estados de loading |
| **Toast** | Notificações de sucesso/erro |
| **DropdownMenu** | Menu de ações do card |
| **Separator** | Divisores de seção |
| **ScrollArea** | Área de scroll da matriz |
| **Table** | Tabela de permissões |

### 8.2 Componentes a Criar

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **PermissionMatrix** | `permissions/permission-matrix.tsx` | Matriz de toggles |
| **EmployeeCard** | `list/employee-card.tsx` | Card individual |
| **EmployeeRow** | `list/employee-row.tsx` | Linha da tabela |
| **RoleSelector** | `form/role-selector.tsx` | Seleção de papel |
| **ModuleCheckbox** | `form/module-checkbox.tsx` | Checkbox de módulo |
| **ViewToggle** | `list/view-toggle.tsx` | Toggle Cards/Tabela |
| **EmployeeEmpty** | `list/employee-empty.tsx` | Estado vazio |
| **EmployeeSkeleton** | `list/employee-skeleton.tsx` | Skeleton loading |
| **EmployeeDropdown** | `list/employee-dropdown.tsx` | Menu de ações |
| **PermissionToggle** | `permissions/permission-toggle.tsx` | Toggle individual |
| **PermissionActions** | `permissions/permission-actions.tsx` | Ações rápidas |

### 8.3 Bibliotecas Necessárias

```bash
# Ya装有:
# - react
# - react-dom
# - typescript
# - tailwindcss
# - lucide-react
# - @radix-ui/react-* (via shadcn)
# - zod (validação)

# Não precisa instalar nada novo!
```

---

## 9. Checklist de Implementação

### 9.1 Estrutura e Configuração

- [ ] Criar estrutura de diretórios `components/employees/`
- [ ] Criar diretórios `list/`, `form/`, `permissions/`
- [ ] Criar tipos em `types/employee.ts`
- [ ] Criar tipos em `types/permission.ts`
- [ ] Criar tipos em `types/role.ts`
- [ ] Criar mocks em `lib/mocks/`
- [ ] Criar schemas em `schemas/employee-schema.ts`
- [ ] Criar utilitários em `lib/utils/`
- [ ] Criar página `app/configuracoes/colaboradores/page.tsx`

### 9.2 Componentes da Lista

- [ ] **EmployeeList** - Componente principal da lista
- [ ] **EmployeeHeader** - Header com título e contador
- [ ] **EmployeeFilters** - Barra de filtros
- [ ] **EmployeeSearch** - Campo de busca
- [ ] **EmployeeStatusFilter** - Select de status
- [ ] **EmployeeRoleFilter** - Select de papel
- [ ] **ViewToggle** - Toggle Cards/Tabela
- [ ] **EmployeeGrid** - Grid de cards
- [ ] **EmployeeTable** - Tabela alternativa
- [ ] **EmployeeCard** - Card individual
- [ ] **EmployeeRow** - Linha da tabela
- [ ] **EmployeeAvatar** - Avatar com badge
- [ ] **EmployeeRoleBadge** - Badge de papel
- [ ] **EmployeeModuleTags** - Tags de módulos
- [ ] **EmployeeStatusBadge** - Badge de status
- [ ] **EmployeeDropdown** - Menu de ações
- [ ] **EmployeeEmpty** - Estado vazio
- [ ] **EmployeeSkeleton** - Skeleton de loading

### 9.3 Componentes do Formulário

- [ ] **EmployeeFormModal** - Modal wrapper
- [ ] **EmployeeForm** - Formulário principal
- [ ] **FormSection** - Seção do formulário
- [ ] **FormInput** - Campo de input
- [ ] **RoleSelector** - Seleção de papel
- [ ] **RoleCard** - Card de papel
- [ ] **ModulesGrid** - Grid de módulos
- [ ] **ModuleCheckbox** - Checkbox de módulo
- [ ] **SettingsToggles** - Toggles adicionais
- [ ] **FormActions** - Botões de ação

### 9.4 Componentes de Permissões

- [ ] **PermissionModal** - Modal wrapper
- [ ] **PermissionHeader** - Header do colaborador
- [ ] **PermissionMatrix** - Matriz de permissões
- [ ] **PermissionRow** - Linha de módulo
- [ ] **PermissionToggle** - Toggle individual
- [ ] **PermissionLegend** - Legenda de cores
- [ ] **PermissionActions** - Ações rápidas
- [ ] **PermissionFooter** - Botões salvar/voltar

### 9.5 Hooks

- [ ] **useEmployees** - Hook de colaboradores
- [ ] **useEmployeeFilters** - Hook de filtros
- [ ] **useEmployeeForm** - Hook do formulário
- [ ] **usePermissions** - Hook de permissões
- [ ] **useViewToggle** - Hook de toggle localStorage

### 9.6 Funcionalidades

- [ ] Listar colaboradores (cards e tabela)
- [ ] Filtrar por busca (nome/email)
- [ ] Filtrar por status (ativo/inativo/pendente)
- [ ] Filtrar por papel
- [ ] Alternar visualização (cards/tabela)
- [ ] Abrir modal de cadastro
- [ ] Validar formulário
- [ ] Selecionar papel
- [ ] Selecionar módulos
- [ ] Abrir modal de permissões
- [ ] Editar permissões granulares
- [ ] Ações rápidas (selecionar tudo, limpar)
- [ ] Restaurar padrão do papel
- [ ] Desativar/ativar colaborador
- [ ] Excluir colaborador
- [ ] Reenviar convite
- [ ] Toast de sucesso/erro

### 9.7 Estados

- [ ] Loading (skeleton)
- [ ] Empty state
- [ ] Error state
- [ ] Form validation errors
- [ ] Success feedback

### 9.8 Responsividade

- [ ] Mobile (< 768px): 1 coluna, filtros empilhados
- [ ] Tablet (768px - 1023px): 2 colunas
- [ ] Desktop (>= 1024px): 3 colunas ou tabela

### 9.9 Acessibilidade

- [ ] Labels em todos os campos
- [ ] Focus states visíveis
- [ ] ARIA attributes
- [ ] Keyboard navigation
- [ ] Screen reader friendly

---

## 10. Regras de Negócio Implementadas

| ID | Regra | Implementação |
|----|-------|---------------|
| RN-COL-001 | Apenas admin pode gerenciar | Verificar role antes de mostrar UI |
| RN-COL-002 | Um papel por colaborador | Radio buttons na seleção |
| RN-COL-003 | Proprietário não pode ser alterado | Matriz bloqueada |
| RN-COL-004 | Convites expiram em 7 dias | Badge de pendente + reenviar |
| RN-COL-005 | Máximo 20 colaboradores | Contador + disable botão |
| RN-COL-006 | Busca case insensitive | toLowerCase() |
| RN-COL-007 | Filtros aplicados instantaneamente | useEffect |
| RN-COL-008 | Toggle persistido em localStorage | useViewToggle hook |
| RN-COL-009 | Máximo 50 por página | Limite na filtragem |
| RN-COL-010 | Convites pendentes mostram reenviar | Dropdown item |

---

## 11. Critérios de Aceitação

### 11.1 Lista de Colaboradores

| ID | Critério | Prioridade |
|----|----------|------------|
| LIST-01 | Header com título, contador e botão "Novo Colaborador" | Must |
| LIST-02 | Campo de busca filtra por nome e email | Must |
| LIST-03 | Select de filtro por status funciona | Must |
| LIST-04 | Select de filtro por papel funciona | Must |
| LIST-05 | Toggle Cards/Tabela alterna visualização | Should |
| LIST-06 | Visualização em cards mostra avatar, nome, email, papel, módulos | Must |
| LIST-07 | Badge de status visível no card | Must |
| LIST-08 | Dropdown menu com todas as ações | Must |
| LIST-09 | Visualização em tabela mostra todas as colunas | Should |
| LIST-10 | Estado vazio com CTA para adicionar | Must |
| LIST-11 | Skeleton de loading aparece | Must |
| LIST-12 | Responsividade mobile (1 coluna) | Must |

### 11.2 Cadastro de Colaborador

| ID | Critério | Prioridade |
|----|----------|------------|
| FORM-01 | Modal abre ao clicar "Novo Colaborador" | Must |
| FORM-02 | Campos Nome e Email são obrigatórios | Must |
| FORM-03 | Validação de email (formato válido) | Must |
| FORM-04 | Seleção de papel com cards visuais | Must |
| FORM-05 | Checkboxes de módulos funcionais | Must |
| FORM-06 | Toggles de configurações adicionais | Should |
| FORM-07 | Validação impede envio sem campos obrigatórios | Must |
| FORM-08 | Toast de sucesso após adicionar | Must |
| FORM-09 | Modal fecha após sucesso | Must |
| FORM-10 | Botão Cancelar fecha modal | Must |

### 11.3 Gestão de Permissões

| ID | Critério | Prioridade |
|----|----------|------------|
| PERM-01 | Header mostra avatar e nome do colaborador | Must |
| PERM-02 | Matriz de permissões exibe todos os módulos | Must |
| PERM-03 | Toggles de Ver/Criar/Editar/Excluir funcionais | Must |
| PERM-04 | Botão "Selecionar Tudo" marca todas | Should |
| PERM-05 | Botão "Limpar Tudo" desmarca todas | Should |
| PERM-06 | Botão "Restaurar Padrão" reseta para papel | Should |
| PERM-07 | Proprietário tem matriz bloqueada | Must |
| PERM-08 | Toast de sucesso após salvar | Must |

### 11.4 Geral

| ID | Critério | Prioridade |
|----|----------|------------|
| GEN-01 | Fonte e cores UNIQ consistentes | Must |
| GEN-02 | Ícones Lucide React | Must |
| GEN-03 | Animações suaves (hover, transitions) | Should |
| GEN-04 | Estados de loading com skeleton | Must |
| GEN-05 | Estados de erro com toast | Must |
| GEN-06 | Responsividade mobile-first | Must |
| GEN-07 | Acessibilidade (labels, focus, aria) | Should |

---

**Documento gerado em:** 21/03/2026  
**Fase:** FASE 02 - Planning (@vibe-planner)  
**Próxima Fase:** FASE 03 - Implementação (@vibe-implementer)

---

> ⚠️ **IMPORTANTE:** Este SPEC é baseado no PRD e na documentação UI. A implementação será realizada por @vibe-implementer seguindo este documento.

> 🎯 **PRÓXIMOS PASSOS:**
> 1. Usuário deve limpar contexto do chat
> 2. Chamar @vibe-implementer para desenvolvimento
> 3. Aguardar entrega do código
