/**
 * Página ServicoNovoPage - Criar novo serviço
 */

import { useNavigate } from 'react-router';
import { ServicoForm } from './ServicoForm';
import { useServicos } from '../../hooks/useServicos';
import type { ServicoFormData } from '../../types/servicos';

export function ServicoNovoPage() {
  const navigate = useNavigate();
  const { create } = useServicos();

  const handleSuccess = async (data: ServicoFormData) => {
    await create(data);
    navigate('/servicos');
  };

  const handleCancel = () => {
    navigate('/servicos');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <ServicoForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}