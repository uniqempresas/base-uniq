/**
 * Página ServicosPage - Listagem de serviços (Admin)
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Loader2, Scissors, List, LayoutList } from 'lucide-react';
import { Button } from '../ui/button';
import { ServicoSkeleton } from './ServicoSkeleton';
import { ServicoEmpty } from './ServicoEmpty';
import { ServicosGrid } from './ServicosGrid';
import { ServicosFilters, ServicosFiltersData } from './ServicosFilters';
import { useServicos } from '../../hooks/useServicos';
import type { Servico, CategoriaServico, ServicoStatus } from '../../types/servicos';

export function ServicosPage() {
  const navigate = useNavigate();
  const { getAll, remove, toggleStatus, isLoading } = useServicos();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [filters, setFilters] = useState<ServicosFiltersData>({
    busca: '',
    categoria: 'todas',
    status: 'todos',
    duracao: 'todas',
  });

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      const data = await getAll();
      setServicos(data);
    };
    loadData();
  }, [getAll]);

  // Filtrar serviços
  const filteredServicos = useMemo(() => {
    let result = [...servicos];

    // Filtro de busca
    if (filters.busca) {
      const buscaLower = filters.busca.toLowerCase();
      result = result.filter(
        (s) =>
          s.nome.toLowerCase().includes(buscaLower) ||
          s.descricao.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro de categoria
    if (filters.categoria && filters.categoria !== 'todas') {
      result = result.filter((s) => s.categoria === filters.categoria);
    }

    // Filtro de status
    if (filters.status && filters.status !== 'todos') {
      result = result.filter((s) => s.status === filters.status);
    }

    // Filtro de duração
    if (filters.duracao && filters.duracao !== 'todas') {
      result = result.filter((s) => s.duracao === filters.duracao);
    }

    return result;
  }, [servicos, filters]);

  // Handlers
  const handleFilterChange = (newFilters: ServicosFiltersData) => {
    setFilters(newFilters);
  };

  const handleEdit = (servico: Servico) => {
    navigate(`/servicos/${servico.id}/editar`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      await remove(id);
      const data = await getAll();
      setServicos(data);
    }
  };

  const handleToggleStatus = async (id: string) => {
    await toggleStatus(id);
    const data = await getAll();
    setServicos(data);
  };

  const handleNovo = () => {
    navigate('/servicos/novo');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Menu de Contexto */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => navigate("/servicos")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
        >
          <List size={16} className="text-[#627271]" />
          <span className="text-sm font-medium text-[#1f2937]">Lista</span>
        </button>

        <button
          onClick={() => navigate("/servicos/novo")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
        >
          <Plus size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-[#1f2937]">Novo</span>
        </button>

        <button
          onClick={() => navigate("/catalogo")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
        >
          <LayoutList size={16} className="text-violet-600" />
          <span className="text-sm font-medium text-[#1f2937]">Catálogo</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937]">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pelo salão
          </p>
        </div>
        <Button onClick={handleNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Filtros */}
      <ServicosFilters onFilterChange={handleFilterChange} />

      {/* Loading */}
      {isLoading && (
        <div className="py-12">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Carregando serviços...</span>
          </div>
        </div>
      )}

      {/* Lista vazia */}
      {!isLoading && filteredServicos.length === 0 && (
        <ServicoEmpty onAddNew={handleNovo} />
      )}

      {/* Lista de serviços */}
      {!isLoading && filteredServicos.length > 0 && (
        <ServicosGrid
          servicos={filteredServicos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}