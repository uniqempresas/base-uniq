import { useState, useCallback } from 'react';
import { Employee, ModuleAccess, ModuleType, ModulePermission } from '../types/employees';
import { mockRoles } from '../lib/mocks/employees';

interface UsePermissionsReturn {
  modules: ModuleAccess[];
  loading: boolean;
  getPermissions: (employeeId: string) => Promise<ModuleAccess[]>;
  updatePermission: (
    employeeId: string,
    module: ModuleType,
    permission: ModulePermission,
    enabled: boolean
  ) => Promise<void>;
  resetToDefault: (employeeId: string) => Promise<void>;
  selectAll: (employeeId: string) => Promise<void>;
  clearAll: (employeeId: string) => Promise<void>;
}

// Helper to get default modules for a role
const getDefaultModulesForRole = (role: string): ModuleAccess[] => {
  const roleData = mockRoles.find((r) => r.name === role);
  const defaultModules = roleData?.defaultModules || ['sales'];
  
  return defaultModules.map((moduleItem: string) => ({
    module: moduleItem as ModuleType,
    permissions: ['view', 'create', 'edit', 'delete'] as ModulePermission[],
  }));
};

export const usePermissions = (employee: Employee | null): UsePermissionsReturn => {
  const [modules, setModules] = useState<ModuleAccess[]>(employee?.modules || []);
  const [loading, setLoading] = useState(false);

  const getPermissions = useCallback(async (employeeId: string): Promise<ModuleAccess[]> => {
    // In a real app, this would fetch from API
    return employee?.modules || [];
  }, [employee]);

  const updatePermission = useCallback(async (
    employeeId: string,
    module: ModuleType,
    permission: ModulePermission,
    enabled: boolean
  ): Promise<void> => {
    setLoading(true);
    
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    setModules((prev) => {
      return prev.map((mod) => {
        if (mod.module === module) {
          let newPermissions: ModulePermission[];
          
          if (enabled) {
            // Add permission if not exists
            newPermissions = mod.permissions.includes(permission)
              ? mod.permissions
              : [...mod.permissions, permission];
          } else {
            // Remove permission
            newPermissions = mod.permissions.filter((p) => p !== permission);
          }
          
          // Ensure 'view' is always present if other permissions exist
          if (newPermissions.length > 0 && !newPermissions.includes('view')) {
            newPermissions = ['view', ...newPermissions];
          }
          
          return { ...mod, permissions: newPermissions };
        }
        return mod;
      });
    });
    
    setLoading(false);
  }, []);

  const resetToDefault = useCallback(async (employeeId: string): Promise<void> => {
    if (!employee) return;
    
    setLoading(true);
    
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const defaultModules = getDefaultModulesForRole(employee.role);
    setModules(defaultModules);
    
    setLoading(false);
  }, [employee]);

  const selectAll = useCallback(async (employeeId: string): Promise<void> => {
    setLoading(true);
    
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const allModules: ModuleAccess[] = [
      { module: 'crm', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'finance', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'inventory', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'sales', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'store', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'appointments', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'settings', permissions: ['view', 'create', 'edit', 'delete'] },
    ];
    
    setModules(allModules);
    setLoading(false);
  }, []);

  const clearAll = useCallback(async (employeeId: string): Promise<void> => {
    setLoading(true);
    
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    setModules((prev) => 
      prev.map((mod) => ({
        ...mod,
        permissions: ['view'],
      }))
    );
    
    setLoading(false);
  }, []);

  return {
    modules,
    loading,
    getPermissions,
    updatePermission,
    resetToDefault,
    selectAll,
    clearAll,
  };
};