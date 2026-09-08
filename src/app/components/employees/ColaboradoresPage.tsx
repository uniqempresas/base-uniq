import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { EmployeeFilters } from './EmployeeFilters';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeSkeletonList } from './EmployeeSkeleton';
import { EmployeeEmpty } from './EmployeeEmpty';
import { useEmployees } from '../../hooks/useEmployees';
import { EmployeeStatus, EmployeeRole } from '../../types/employees';

export function ColaboradoresPage() {
  const navigate = useNavigate();
  const { employees, loading, toggleStatus, delete: deleteEmployee } = useEmployees();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
    }
  }, [initialized]);

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((employee) => {
    // Search filter
    const searchMatch = 
      search === '' ||
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    const statusMatch = 
      statusFilter === 'all' || 
      employee.status === statusFilter;
    
    // Role filter
    const roleMatch = 
      roleFilter === 'all' || 
      employee.role === roleFilter;
    
    return searchMatch && statusMatch && roleMatch;
  });

  const activeCount = employees.filter((e) => e.status === 'active').length;
  const totalLimit = 20;

  const handleToggleStatus = async (employee: any) => {
    await toggleStatus(employee.id);
  };

  const handleDelete = async (employee: any) => {
    if (confirm(`Tem certeza que deseja excluir "${employee.name}"?`)) {
      await deleteEmployee(employee.id);
    }
  };

  const handleNewEmployee = () => {
    navigate('/configuracoes/colaboradores/novo');
  };

  const handleEdit = (employee: { id: string }) => navigate(`/configuracoes/colaboradores/${employee.id}`);
  const handlePermissions = (employee: { id: string }) => navigate(`/configuracoes/colaboradores/${employee.id}/permissoes`);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1f2937]">Colaboradores</h1>
          <Badge variant="outline" className="text-sm">
            {activeCount} de {totalLimit}
          </Badge>
        </div>
        <Button onClick={handleNewEmployee} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      {/* Filters */}
      <EmployeeFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        role={roleFilter}
        onRoleChange={setRoleFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content */}
      {loading && !initialized ? (
        <EmployeeSkeletonList count={6} />
      ) : filteredEmployees.length === 0 ? (
        <EmployeeEmpty onAdd={handleNewEmployee} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onToggle={handleToggleStatus}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onPermissions={handlePermissions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
