/**
 * Página CatalogoPage - Catálogo público de serviços
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, Calendar, Clock, DollarSign, Sparkles, Scissors, Palette } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useServicos } from '../../hooks/useServicos';
import type { Servico, CategoriaServico } from '../../types/servicos';

// Mapeamento de categorias para labels
const categoriaLabels: Record<CategoriaServico, string> = {
  cabelo: 'Cabelo',
  unhas: 'Unhas',
  estetica: 'Estética',
  massagem: 'Massagem',
  barba: 'Barba',
};

// Mapeamento de categorias para cores
const categoriaColors: Record<CategoriaServico, string> = {
  cabelo: 'bg-blue-100 text-blue-800',
  unhas: 'bg-pink-100 text-pink-800',
  estetica: 'bg-purple-100 text-purple-800',
  massagem: 'bg-[#efefef] text-[#1f2937]',
  barba: 'bg-amber-100 text-amber-800',
};

// Ícones de categoria
const categoriaIcons: Record<CategoriaServico, typeof Scissors> = {
  cabelo: Scissors,
  unhas: Palette,
  estetica: Sparkles,
  massagem: Sparkles,
  barba: Scissors,
};

export function CatalogoPage() {
  const navigate = useNavigate();
  const { getAll, isLoading } = useServicos();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas');

  // Carregar apenas serviços ativos
  useEffect(() => {
    const loadData = async () => {
      const data = await getAll();
      // Filtrar apenas ativos e destaque
      const ativos = data.filter(
        (s) => s.status === 'ativo' || s.status === 'destaque'
      );
      setServicos(ativos);
    };
    loadData();
  }, [getAll]);

  // Obter categorias únicas dos serviços ativos
  const categorias = useMemo(() => {
    const cats = new Set(servicos.map((s) => s.categoria));
    return Array.from(cats).map((cat) => ({
      value: cat,
      label: categoriaLabels[cat as CategoriaServico],
    }));
  }, [servicos]);

  // Filtrar serviços por categoria
  const filteredServicos = useMemo(() => {
    if (selectedCategoria === 'todas') return servicos;
    return servicos.filter((s) => s.categoria === selectedCategoria);
  }, [servicos, selectedCategoria]);

  // Formatar preço
  const formatPreco = (preco: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco / 100);
  };

  // Formatar duração
  const formatDuracao = (minutos: number): string => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
  };

  // Handler para agendamento
  const handleAgendar = (servicoId: string) => {
    navigate(`/agenda/novo?servicoId=${servicoId}`);
  };

  return (
    <div className="min-h-screen bg-[#efefef]">
      {/* Hero Header */}
      <div className="bg-[#86cb92] py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1f2937] mb-3">
            Nossos Serviços
          </h1>
          <p className="text-[#1f2937] text-lg max-w-2xl mx-auto">
            Servicios especializados para cuidar da sua beleza e bem-estar.
            <br />
            Agende agora mesmo!
          </p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* Filtro de categoria */}
        <div className="mb-8">
          <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
            <SelectTrigger className="w-full md:w-[280px] mx-auto md:mx-0">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-2">Carregando serviços...</p>
          </div>
        )}

        {/* Grid de serviços */}
        {!isLoading && filteredServicos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServicos.map((servico) => {
              const CategoryIcon = categoriaIcons[servico.categoria] || Scissors;
              const isDestaque = servico.status === 'destaque' || servico.destaque;

              return (
                <Card
                  key={servico.id}
                  className={`flex flex-col h-full overflow-hidden ${
                    isDestaque
                      ? 'border-2 border-amber-400 shadow-lg'
                      : 'border-[#efefef]'
                  }`}
                >
                  {/* Imagem/Ícone */}
                  <div className="relative h-36 bg-gradient-to-br from-[#efefef] to-[#efefef] flex items-center justify-center">
                    {servico.imagemUrl ? (
                      <img
                        src={servico.imagemUrl}
                        alt={servico.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CategoryIcon className="w-16 h-16 text-[#627271]" />
                    )}

                    {/* Badge de destaque */}
                    {isDestaque && (
                      <Badge className="absolute top-3 left-3 bg-amber-500 text-white">
                        Destaque
                      </Badge>
                    )}

                    {/* Badge de categoria */}
                    <Badge
                      className={`absolute top-3 right-3 ${
                        categoriaColors[servico.categoria] || 'bg-gray-100 text-gray-800'
                      } border-0`}
                    >
                      {categoriaLabels[servico.categoria] || servico.categoria}
                    </Badge>
                  </div>

                  <CardHeader className="flex-1 pb-2">
                    <CardTitle className="text-lg font-bold">
                      {servico.nome}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {servico.descricao}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 pb-3">
                    <div className="flex items-center justify-between text-sm">
                      {/* Duração */}
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuracao(servico.duracao)}</span>
                      </div>

                      {/* Preço */}
                      <div className="flex items-center gap-1.5 text-primary font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatPreco(servico.preco)}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t bg-[#efefef]">
                    <Button
                      className="w-full bg-[#86cb92] hover:bg-[#1f2937] hover:text-white"
                      onClick={() => handleAgendar(servico.id)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredServicos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#efefef] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#627271]" />
            </div>
            <h3 className="text-[#1f2937] font-semibold mb-1">
              Nenhum serviço encontrado
            </h3>
            <p className="text-[#627271] text-sm">
              Tente selecionar outra categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}