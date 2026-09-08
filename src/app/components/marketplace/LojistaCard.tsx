/**
 * Componente LojistaCard - Card de lojista no marketplace
 * Mostra: logo, nome, categoria, nota (estrelas), total vendas, botão "Ver Loja"
 */

import { Star, MapPin, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Lojista } from '../../types/marketplace';

interface LojistaCardProps {
  lojista: Lojista;
  onVerLoja?: (lojista: Lojista) => void;
}

export function LojistaCard({ lojista, onVerLoja }: LojistaCardProps) {
  // Formatar tipo para display
  const tipoLabel = {
   varejo: 'Varejo',
    atacado: 'Atacado',
    servicos: 'Serviços',
  }[lojista.tipo] || lojista.tipo;

  // Gerar total de vendas simulado baseado no ID
  const totalVendas = Math.floor(Math.random() * 5000) + 500;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      {/* Banner/Capa */}
      <div className="relative h-24 bg-gradient-to-r from-muted to-muted">
        {lojista.capaUrl && (
          <img
            src={lojista.capaUrl}
            alt={`Capa de ${lojista.nome}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-foreground/20" />
      </div>

      <CardContent className="relative pt-12 pb-4">
        {/* Logo */}
        <div className="absolute -top-10 left-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-background bg-background shadow-md">
            {lojista.logoUrl ? (
              <img
                src={lojista.logoUrl}
                alt={`Logo de ${lojista.nome}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-bold text-muted-foreground">
                {lojista.nome.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Badge de tipo */}
        <div className="absolute right-4 top-4">
          <Badge variant="secondary" className="text-xs">
            {tipoLabel}
          </Badge>
        </div>

        {/* Informações */}
        <div className="mt-2 space-y-2">
          <h3 className="text-lg font-semibold line-clamp-1">{lojista.nome}</h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {lojista.descricao}
          </p>

          {/* Localização */}
          {lojista.cidade && lojista.estado && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{lojista.cidade}, {lojista.estado}</span>
            </div>
          )}

          {/* Nota e vendas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{lojista.nota.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({lojista.totalAvaliacoes})
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShoppingBag className="h-3 w-3" />
              <span>{totalVendas} vendas</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          variant="default"
          onClick={() => onVerLoja?.(lojista)}
        >
          Ver Loja
        </Button>
      </CardFooter>
    </Card>
  );
}

export default LojistaCard;