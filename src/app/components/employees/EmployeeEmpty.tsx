import { Users, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface EmployeeEmptyProps {
  onAdd?: () => void;
}

export function EmployeeEmpty({ onAdd }: EmployeeEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Users className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Nenhum colaborador encontrado
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Comece adicionando colaboradores para gerenciar sua equipe e permissões de acesso.
      </p>
      {onAdd && (
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Colaborador
        </Button>
      )}
    </div>
  );
}