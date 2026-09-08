import { Employee, Role, ModuleType } from '../types/employees';

// Módulos disponíveis no sistema
export const mockModules: ModuleType[] = [
  'crm',
  'finance',
  'inventory',
  'sales',
  'store',
  'appointments',
  'settings',
];

// Papéis do sistema
export const mockRoles: Role[] = [
  {
    id: 'role-1',
    name: 'owner',
    label: 'Proprietário',
    description: 'Acesso completo ao sistema, incluindo configurações.',
    defaultModules: ['crm', 'finance', 'inventory', 'sales', 'store', 'appointments', 'settings'],
    isSystem: true,
  },
  {
    id: 'role-2',
    name: 'admin',
    label: 'Administrador',
    description: 'Gerencia usuários, permissões e configurações.',
    defaultModules: ['crm', 'finance', 'inventory', 'sales', 'store', 'appointments', 'settings'],
    isSystem: true,
  },
  {
    id: 'role-3',
    name: 'manager',
    label: 'Gerente',
    description: 'Supervisiona equipes e processos.',
    defaultModules: ['crm', 'sales', 'store', 'appointments'],
    isSystem: true,
  },
  {
    id: 'role-4',
    name: 'seller',
    label: 'Vendedor',
    description: 'Acesso às vendas e gestão de clientes.',
    defaultModules: ['crm', 'sales', 'store'],
    isSystem: true,
  },
  {
    id: 'role-5',
    name: 'viewer',
    label: 'Visualizador',
    description: 'Acesso apenas para visualização de dados.',
    defaultModules: ['sales'],
    isSystem: true,
  },
];

// Colaboradores mock
export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Carlos Oliveira',
    email: 'carlos@uniq.com.br',
    phone: '(11) 99999-0001',
    role: 'owner',
    position: 'Proprietário',
    avatar: undefined,
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'finance', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'inventory', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'sales', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'store', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'appointments', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'settings', permissions: ['view', 'create', 'edit', 'delete'] },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'emp-2',
    name: 'Maria Santos',
    email: 'maria@uniq.com.br',
    phone: '(11) 99999-0002',
    role: 'admin',
    position: 'Administradora',
    avatar: undefined,
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'finance', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'inventory', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'sales', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'store', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'appointments', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'settings', permissions: ['view', 'create', 'edit', 'delete'] },
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-15'),
  },
  {
    id: 'emp-3',
    name: 'João Silva',
    email: 'joao@uniq.com.br',
    phone: '(11) 99999-0003',
    role: 'manager',
    position: 'Gerente de Vendas',
    avatar: undefined,
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'sales', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'store', permissions: ['view', 'create', 'edit'] },
      { module: 'appointments', permissions: ['view', 'create', 'edit'] },
    ],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-08-20'),
  },
  {
    id: 'emp-4',
    name: 'Ana Costa',
    email: 'ana@uniq.com.br',
    phone: '(11) 99999-0004',
    role: 'seller',
    position: 'Vendedora',
    avatar: undefined,
    status: 'active',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 dias atrás
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit'] },
      { module: 'sales', permissions: ['view', 'create'] },
      { module: 'store', permissions: ['view'] },
    ],
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-09-10'),
  },
  {
    id: 'emp-5',
    name: 'Pedro Ferreira',
    email: 'pedro@uniq.com.br',
    phone: '(11) 99999-0005',
    role: 'viewer',
    position: 'Auxiliar',
    avatar: undefined,
    status: 'inactive',
    lastAccess: undefined,
    modules: [
      { module: 'sales', permissions: ['view'] },
    ],
    createdAt: new Date('2024-05-20'),
    updatedAt: new Date('2024-10-01'),
  },
];