import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { RoleSelector } from './RoleSelector';
import { ModuleCheckbox } from './ModuleCheckbox';
import { useEmployees } from '../../hooks/useEmployees';
import { ModuleType, EmployeeRole } from '../../types/employees';

// Schema de validação Zod
const collaboratorSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  position: z.string().optional(),
  role: z.enum(['owner', 'admin', 'manager', 'seller', 'viewer']),
  modules: z.array(z.string()).min(1, 'Selecione pelo menos um módulo'),
  emailNotifications: z.boolean(),
});

type CollaboratorFormData = z.infer<typeof collaboratorSchema>;

const AVAILABLE_MODULES: ModuleType[] = [
  'crm',
  'inventory',
  'sales',
  'store',
  'appointments',
  'servicos',
  'finance',
  'settings',
];

export function NovoColaboradorPage() {
  const navigate = useNavigate();
  const { create, loading } = useEmployees();
  
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>(['sales']);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CollaboratorFormData>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
      role: 'viewer' as EmployeeRole,
      modules: ['sales'],
      emailNotifications: true,
    },
  });

  const handleModuleToggle = (module: ModuleType) => {
    setSelectedModules((prev) => {
      const newModules = prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module];
      
      setValue('modules', newModules as any, { shouldValidate: true });
      return newModules;
    });
  };

  const onSubmit = async (data: CollaboratorFormData) => {
    try {
      await create({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        position: data.position || undefined,
        role: data.role,
        modules: data.modules.map((module) => ({
          module: module as ModuleType,
          permissions: ['view'] as ('view' | 'create' | 'edit' | 'delete')[],
        })),
      });
      
      navigate('/configuracoes/colaboradores');
    } catch (error) {
      console.error('Erro ao criar colaborador:', error);
    }
  };

  const handleCancel = () => {
    navigate('/configuracoes/colaboradores');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937]">Novo Colaborador</h1>
          <p className="text-[#627271] text-sm">
            Adicione um novo membro à sua equipe
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  placeholder="João Silva"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@email.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  {...register('phone')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  placeholder="Vendedor"
                  {...register('position')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissões */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Permissões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selector */}
            <div className="space-y-3">
              <Label>Selecione o papel</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <RoleSelector
                    value={field.value as EmployeeRole}
                    onChange={(role) => {
                      field.onChange(role);
                    }}
                  />
                )}
              />
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Module Checkboxes */}
            <div className="space-y-3">
              <Label>Módulos de acesso</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AVAILABLE_MODULES.map((module) => (
                  <ModuleCheckbox
                    key={module}
                    module={module}
                    checked={selectedModules.includes(module)}
                    onChange={() => handleModuleToggle(module)}
                  />
                ))}
              </div>
              {errors.modules && (
                <p className="text-sm text-red-500">{errors.modules.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="emailNotifications">Notificações por email</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar notificações de novas vendas e atividades por email
                </p>
              </div>
              <Controller
                name="emailNotifications"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="emailNotifications"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Adicionando...' : 'Adicionar Colaborador'}
          </Button>
        </div>
      </form>
    </div>
  );
}
