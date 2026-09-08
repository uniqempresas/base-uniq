/**
 * Página ServicoEditarPage - Editar serviço existente
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { ServicoForm } from './ServicoForm';
import { useServicos } from '../../hooks/useServicos';
import type { Servico, ServicoFormData } from '../../types/servicos';

export function ServicoEditarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, update } = useServicos();
  const [servico, setServico] = useState<Servico | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do serviço
  useEffect(() => {
    const loadServico = async () => {
      if (!id) {
        navigate('/servicos');
        return;
      }

      const data = await getById(id);
      if (!data) {
        alert('Serviço não encontrado');
        navigate('/servicos');
        return;
      }

      setServico(data);
      setIsLoading(false);
    };

    loadServico();
  }, [id, getById, navigate]);

  const handleSuccess = async (data: ServicoFormData) => {
    if (id) {
      await update(id, data);
      navigate('/servicos');
    }
  };

  const handleCancel = () => {
    navigate('/servicos');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {servico && (
        <ServicoForm
          servicoId={servico.id}
          initialData={servico}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}