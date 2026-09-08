import { Skeleton } from "../ui/skeleton";

interface SupplierSkeletonProps {
  count?: number;
}

export function SupplierSkeleton({ count = 3 }: SupplierSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5"
        >
          <div className="flex items-start gap-3 mb-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          <div className="flex gap-2 mb-4">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          <div className="flex justify-between border-t border-[#efefef] pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}