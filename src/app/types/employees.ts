// Enumeração de Status
export type EmployeeStatus = 'active' | 'inactive' | 'pending';

// Enumeração de Papéis (Roles)
export type EmployeeRole = 'owner' | 'admin' | 'manager' | 'seller' | 'viewer';

// Enumeração de Tipos de Módulo
export type ModuleType = 'crm' | 'finance' | 'inventory' | 'sales' | 'store' | 'appointments' | 'settings' | 'servicos';

// Enumeração de Permissões por Módulo
export type ModulePermission = 'view' | 'create' | 'edit' | 'delete';

// Interface de Acesso a Módulo
export interface ModuleAccess {
  module: ModuleType;
  permissions: ModulePermission[];
}

// Interface de Papel (Role)
export interface Role {
  id: string;
  name: EmployeeRole;
  label: string;
  description: string;
  defaultModules: ModuleType[];
  isSystem: boolean;
}

// Interface Principal de Colaborador
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
}
