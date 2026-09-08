"use client";

import { useState, useCallback, useEffect } from 'react';
import { ModuleAccess, ModuleType, ModulePermission, EmployeeRole } from '../../types/employees';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CheckCircle2, XCircle, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

// Módulos disponíveis
const MODULES: { key: ModuleType; label: string; icon?: string }[] = [
  { key: 'crm', label: 'CRM' },
  { key: 'finance', label: 'Financeiro' },
  { key: 'inventory', label: 'Estoque' },
  { key: 'sales', label: 'Vendas' },
  { key: 'store', label: 'Loja Virtual' },
  { key: 'appointments', label: 'Agendamentos' },
  { key: 'settings', label: 'Configurações' },
];

// Permissões disponíveis
const PERMISSIONS: { key: ModulePermission; label: string; color: string }[] = [
  { key: 'view', label: 'Ver', color: 'text-[#627271] bg-[#efefef] border-[#86cb92]' },
  { key: 'create', label: 'Criar', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { key: 'edit', label: 'Editar', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { key: 'delete', label: 'Excluir', color: 'text-red-600 bg-red-50 border-red-200' },
];

interface PermissionMatrixProps {
  employeeId: string;
  role?: EmployeeRole;
  permissions: ModuleAccess[];
  onChange: (module: ModuleType, permission: ModulePermission, enabled: boolean) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  onResetToDefault?: () => void;
  readOnly?: boolean;
}

// Helper para verificar se uma permissão está ativa
const hasPermission = (moduleAccess: ModuleAccess | undefined, permission: ModulePermission): boolean => {
  return moduleAccess?.permissions.includes(permission) || false;
};

export function PermissionMatrix({
  employeeId,
  role,
  permissions,
  onChange,
  onSelectAll,
  onClearAll,
  onResetToDefault,
  readOnly = false,
}: PermissionMatrixProps) {
  const isOwner = role === 'owner';
  const isReadOnly = readOnly || isOwner;

  // Map permissions to easy lookup
  const permissionMap = new Map<ModuleType, ModuleAccess>();
  permissions.forEach((p) => permissionMap.set(p.module, p));

  const handleToggle = useCallback(
    (module: ModuleType, permission: ModulePermission) => {
      if (isReadOnly) return;
      const current = permissionMap.get(module);
      const enabled = !hasPermission(current, permission);
      onChange(module, permission, enabled);
    },
    [isReadOnly, onChange, permissionMap]
  );

  const handleSelectAll = useCallback(() => {
    if (isReadOnly) return;
    onSelectAll?.();
  }, [isReadOnly, onSelectAll]);

  const handleClearAll = useCallback(() => {
    if (isReadOnly) return;
    onClearAll?.();
  }, [isReadOnly, onClearAll]);

  const handleResetToDefault = useCallback(() => {
    if (isReadOnly) return;
    onResetToDefault?.();
  }, [isReadOnly, onResetToDefault]);

  return (
    <div className="space-y-4">
      {/* Header com ações rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Matriz de Permissões</h3>
          {isOwner && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Proprietário
            </Badge>
          )}
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs h-8"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Selecionar Tudo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs h-8"
            >
              <Square className="w-3 h-3 mr-1" />
              Limpar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="text-xs h-8"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Restaurar Padrão
            </Button>
          </div>
        )}
      </div>

      {/* Tabela de Permissões */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-40">Módulo</TableHead>
              {PERMISSIONS.map((perm) => (
                <TableHead key={perm.key} className={cn('text-center', perm.color)}>
                  {perm.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {MODULES.map((module) => {
              const moduleAccess = permissionMap.get(module.key);
              return (
                <TableRow key={module.key}>
                  <TableCell className="font-medium">{module.label}</TableCell>
                  {PERMISSIONS.map((perm) => {
                    const isActive = hasPermission(moduleAccess, perm.key);
                    const isDisabled = isReadOnly || (perm.key !== 'view' && !hasPermission(moduleAccess, 'view'));

                    return (
                      <TableCell key={perm.key} className="text-center">
                        <Switch
                          checked={isActive}
                          disabled={isDisabled}
                          onCheckedChange={() => handleToggle(module.key, perm.key)}
                          className={cn(
                            isActive && 'data-[state=checked]:bg-primary'
                          )}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Legenda */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#86cb92]" />
          Ver
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Criar
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Editar
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Excluir
        </span>
      </div>

      {isReadOnly && (
        <p className="text-xs text-muted-foreground text-center">
          {isOwner
            ? 'O proprietário tem acesso completo e não pode ter suas permissões alteradas.'
            : 'Modo somente visualização.'}
        </p>
      )}
    </div>
  );
}
