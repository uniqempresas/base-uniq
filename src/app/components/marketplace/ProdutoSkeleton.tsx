/**
 * Componente ProdutoSkeleton - Estado de loading para produtos
 */

import { Skeleton } from '../ui/skeleton';

interface ProdutoSkeletonProps {
  count?: number;
}

export function ProdutoSkeleton({ count = 8 }: ProdutoSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border"
        >
          {/* Imagem skeleton */}
          <Skeleton className="aspect-square w-full" />
          
          <div className="space-y-3 p-4">
            {/* Categoria */}
            <Skeleton className="h-3 w-16" />
            
            {/* Nome */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            
            {/* Lojista */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            
            {/* Preço */}
            <Skeleton className="h-5 w-24" />
            
            {/* Botão */}
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProdutoSkeleton;