/**
 * Componente ServicoCard - Card individual do serviço
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { 
  Scissors, 
  Sparkles, 
  Palette, 
  SparklesIcon,
  Clock,
  DollarSign,
  MoreVertical,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  LucideIcon,
} from 'lucide-react';
import type { Servico, CategoriaServico } from '../../types/servicos';

// Mapeamento de categorias para ícones e cores
const categoriaIcons: Record<CategoriaServico, LucideIcon> = {
  cabelo: Scissors,
  unhas: Palette,
  estetica: Sparkles,
  massagem: SparklesIcon,
  barba: Scissors,
};

const categoriaColors: Record<CategoriaServico, string> = {
  cabelo: 'bg-blue-100 text-blue-800',
  unhas: 'bg-pink-100 text-pink-800',
  estetica: 'bg-purple-100 text-purple-800',
  massagem: 'bg-[#efefef] text-[#1f2937]',
  barba: 'bg-amber-100 text-amber-800',
};

const statusColors: Record<string, string> = {
  ativo: 'bg-[#efefef] text-[#1f2937] border-[#86cb92]',
  inativo: 'bg-red-100 text-red-800 border-red-200',
  destaque: 'bg-amber-100 text-amber-800 border-amber-200',
};

const statusLabels: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  destaque: 'Destaque',
};

interface ServicoCardProps {
  servico: Servico;
  onEdit?: (servico: Servico) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export function ServicoCard({ 
  servico, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: ServicoCardProps) {
  const CategoryIcon = categoriaIcons[servico.categoria] || Scissors;
  const categoriaColor = categoriaColors[servico.categoria] || 'bg-gray-100 text-gray-800';
  
  // Formatar preço de centavos para real
  const precoFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(servico.preco / 100);
  
  // Formatar duração
  const formatDuracao = (minutos: number): string => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (mins === 0) return `${horas}h`;
    return `${horas}h${mins}`;
  };

  const handleEdit = () => {
    if (onEdit) onEdit(servico);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(servico.id);
  };

  const handleToggleStatus = () => {
    if (onToggleStatus) onToggleStatus(servico.id);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      {/* Imagem do serviço ou placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-[#efefef] to-[#efefef] flex items-center justify-center">
        {servico.imagemUrl ? (
          <img 
            src={servico.imagemUrl} 
            alt={servico.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <CategoryIcon className="w-16 h-16 text-[#627271]" />
        )}
        
        {/* Badge de categoria */}
        <Badge 
          className={`absolute top-3 left-3 ${categoriaColor} border-0`}
        >
          <CategoryIcon className="w-3 h-3 mr-1" />
          {servico.categoria.charAt(0).toUpperCase() + servico.categoria.slice(1)}
        </Badge>
        
        {/* Badge de destaque */}
        {servico.destaque && (
          <Badge 
            className="absolute top-3 right-3 bg-amber-500 text-white border-0"
          >
            Destaque
          </Badge>
        )}
      </div>
      
      <CardHeader className="flex-1 pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {servico.nome}
          </CardTitle>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 -mt-1 -mr-2"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                {servico.status === 'ativo' ? (
                  <>
                    <ToggleLeft className="mr-2 h-4 w-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <ToggleRight className="mr-2 h-4 w-4" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardDescription className="line-clamp-2 text-sm">
          {servico.descricao}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 pb-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* Duração */}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuracao(servico.duracao)}</span>
          </div>
          
          {/* Preço */}
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>{precoFormatted}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 border-t">
        <Badge 
          variant="outline" 
          className={statusColors[servico.status] || 'bg-gray-100 text-gray-800'}
        >
          {statusLabels[servico.status] || servico.status}
        </Badge>
      </CardFooter>
    </Card>
  );
}