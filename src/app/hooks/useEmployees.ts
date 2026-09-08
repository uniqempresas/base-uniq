import { useState, useEffect, useCallback } from 'react';
import { Employee, EmployeeStatus, EmployeeRole } from '../types/employees';
import { mockEmployees, mockRoles } from '../lib/mocks/employees';
import { mockDelay } from '../lib/mocks/delay';

const STORAGE_KEY = 'uniq-employees';

function loadEmployees(): Employee[] {
  if (typeof window === 'undefined') return mockEmployees;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return mockEmployees;
    return (JSON.parse(stored) as Employee[]).map((employee) => ({
      ...employee,
      lastAccess: employee.lastAccess ? new Date(employee.lastAccess) : undefined,
      createdAt: new Date(employee.createdAt),
      updatedAt: new Date(employee.updatedAt),
    }));
  } catch {
    return mockEmployees;
  }
}

interface UseEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  getAll: () => Promise<Employee[]>;
  getById: (id: string) => Promise<Employee | undefined>;
  create: (data: Partial<Employee>) => Promise<Employee>;
  update: (id: string, data: Partial<Employee>) => Promise<Employee>;
  delete: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
}

export const useEmployees = (): UseEmployeesReturn => {
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch {
      // Persistência local é opcional para o protótipo.
    }
  }, [employees]);

  // Simulate network delay
  const delay = useCallback(async () => {
    const randomDelay = Math.floor(Math.random() * (800 - 400 + 1)) + 400;
    await mockDelay(randomDelay);
  }, []);

  const getAll = useCallback(async (): Promise<Employee[]> => {
    setLoading(true);
    setError(null);
    try {
      await delay();
      return [...employees];
    } catch (err) {
      setError('Erro ao carregar colaboradores');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees, delay]);

  const getById = useCallback(async (id: string): Promise<Employee | undefined> => {
    setLoading(true);
    setError(null);
    try {
      await delay();
      return employees.find((emp) => emp.id === id);
    } catch (err) {
      setError('Erro ao buscar colaborador');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees, delay]);

  const create = useCallback(async (data: Partial<Employee>): Promise<Employee> => {
    setLoading(true);
    setError(null);
    try {
      await delay();
      
      // Find default modules based on role
      const role = mockRoles.find((r) => r.name === (data.role || 'viewer'));
      const defaultModules = role?.defaultModules || ['sales'];
      
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone,
        role: data.role || 'viewer',
        position: data.position,
        avatar: data.avatar,
        status: 'pending',
        modules: defaultModules.map((module: string) => ({
          module: module as any,
          permissions: ['view'] as ('view' | 'create' | 'edit' | 'delete')[],
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setEmployees((prev) => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      setError('Erro ao criar colaborador');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [delay]);

  const update = useCallback(async (id: string, data: Partial<Employee>): Promise<Employee> => {
    setLoading(true);
    setError(null);
    try {
      await delay();

      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === id) {
            // If role changed, update modules based on new role
            let updatedModules = emp.modules;
            if (data.role && data.role !== emp.role) {
              const newRole = mockRoles.find((r) => r.name === data.role);
              const defaultModules = newRole?.defaultModules || ['sales'];
              updatedModules = defaultModules.map((module: string) => ({
                module: module as any,
                permissions: ['view'] as ('view' | 'create' | 'edit' | 'delete')[],
              }));
            }

            return {
              ...emp,
              ...data,
              modules: updatedModules,
              updatedAt: new Date(),
            };
          }
          return emp;
        })
      );

      const updated = employees.find((emp) => emp.id === id);
      if (!updated) throw new Error('Colaborador não encontrado');
      
      // Return the updated employee (combining original + changes)
      const result = { ...updated, ...data };
      return result;
    } catch (err) {
      setError('Erro ao atualizar colaborador');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees, delay]);

  const deleteEmployee = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await delay();
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      setError('Erro ao excluir colaborador');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [delay]);

  const toggleStatus = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await delay();
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === id) {
            const newStatus: EmployeeStatus = emp.status === 'active' ? 'inactive' : 'active';
            return { ...emp, status: newStatus, updatedAt: new Date() };
          }
          return emp;
        })
      );
    } catch (err) {
      setError('Erro ao alterar status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [delay]);

  return {
    employees,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    delete: deleteEmployee,
    toggleStatus,
  };
};
