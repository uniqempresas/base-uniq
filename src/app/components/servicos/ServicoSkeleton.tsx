/**
 * Componente ServicoSkeleton - Estado de loading
 */

import { Skeleton } from '../ui/skeleton';

interface ServicoSkeletonProps {
  count?: number;
}

export function ServicoSkeleton({ count = 3 }: ServicoSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden"
        >
          {/* Imagem placeholder */}
          <Skeleton className="h-40 w-full" />
          
          {/* Conteúdo */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            
            <div className="flex gap-4 mb-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}