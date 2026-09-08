/**
 * LojistaPage - Página do perfil do lojista com seus produtos
 * Exibe informações do lojista e lista de produtos
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Star, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useCarrinho } from '../../hooks/useCarrinho';
import { ProdutoMarketplaceCard } from './ProdutoMarketplaceCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import type { Produto, Lojista } from '../../types/marketplace';

export function LojistaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLojistaById, getProdutosByLojista } = useMarketplace();
  const { adicionarItem, temItem } = useCarrinho();
  
  const [lojista, setLojista] = useState<Lojista | undefined>(undefined);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const lojistaData = getLojistaById(id);
      const produtosData = getProdutosByLojista(id);
      
      setLojista(lojistaData);
      setProdutos(produtosData);
      setLoading(false);
    }
  }, [id, getLojistaById, getProdutosByLojista]);

  // Mostrar até 4 produtos inicialmente, ou todos se "Ver Todos" foi clicado
  const produtosExibir = showAllProducts ? produtos : produtos.slice(0, 4);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!lojista) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Lojista não encontrado</h2>
          <Button onClick={() => navigate('/marketplace')} className="mt-4">
            Voltar ao Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        className="mb-4 gap-2"
        onClick={() => navigate('/marketplace')}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      {/* Header do Lojista */}
      <Card className="mb-6 overflow-hidden">
        {/* Capa */}
        <div className="relative h-48 w-full bg-muted">
          {lojista.capaUrl && (
            <img
              src={lojista.capaUrl}
              alt={lojista.nome}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        </div>
        
        <CardContent className="relative px-6 pb-6">
          {/* Logo e Info */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex -mt-12 items-end gap-4 sm:-mt-8">
              <div className="h-24 w-24 overflow-hidden rounded-lg border-4 border-background shadow-lg bg-muted">
                {lojista.logoUrl ? (
                  <img
                    src={lojista.logoUrl}
                    alt={lojista.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold">
                    {lojista.nome.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="pb-2">
                <h1 className="text-2xl font-bold">{lojista.nome}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{lojista.nota.toFixed(1)}</span>
                  <span>({lojista.totalAvaliacoes} avaliações)</span>
                </div>
              </div>
            </div>

            {/* Badge do tipo */}
            <Badge variant="outline" className="capitalize">
              {lojista.tipo}
            </Badge>
          </div>

          {/* Descrição */}
          <p className="mt-4 text-muted-foreground">{lojista.descricao}</p>

          {/* Contato */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {lojista.endereco && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{lojista.endereco}, {lojista.cidade}-{lojista.estado}</span>
              </div>
            )}
            {lojista.telefone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{lojista.telefone}</span>
              </div>
            )}
            {lojista.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{lojista.email}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Produtos */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Produtos</h2>
        
        {produtos.length === 0 ? (
          <p className="text-muted-foreground">Este lojista não possui produtos</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {produtosExibir.map((produto) => (
                <ProdutoMarketplaceCard
                  key={produto.id}
                  produto={produto}
                  lojista={lojista}
                  onAddToCart={(produto) => adicionarItem(produto)}
                />
              ))}
            </div>

            {/* Botão Ver Todos */}
            {produtos.length > 4 && !showAllProducts && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllProducts(true)}
                >
                  Ver Todos os Produtos ({produtos.length})
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LojistaPage;