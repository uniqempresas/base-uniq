import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import { SupplierCard } from "./SupplierCard";
import { SupplierRating } from "./SupplierRating";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye, Edit2, Trash2 } from "lucide-react";
import type { Supplier } from "../../types/suppliers";

interface SupplierGridProps {
  suppliers: Supplier[];
  viewMode: "grid" | "list";
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (supplier: Supplier) => void;
  isLoading?: boolean;
}

export function SupplierGrid({
  suppliers,
  viewMode,
  onView,
  onEdit,
  onDelete,
  isLoading,
}: SupplierGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <div className="flex items-start gap-3 mb-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#efefef] flex items-center justify-center mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-[#1f2937] font-semibold mb-1">Nenhum fornecedor encontrado</h3>
        <p className="text-[#627271] text-sm max-w-sm">
          Tente ajustar os filtros ou adicionar um novo fornecedor.
        </p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <SupplierCard
            key={s.id}
            supplier={s}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  const statusMap = {
    active: { label: "Ativo", className: "bg-[#efefef] text-[#1f2937] hover:bg-[#efefef]" },
    inactive: { label: "Inativo", className: "bg-red-100 text-red-700 hover:bg-red-100" },
    pending: { label: "Em Análise", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  };

  return (
    <div className="rounded-xl border border-[#efefef] overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-[#efefef]">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Avaliação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s.id} className="cursor-pointer hover:bg-[#efefef]" onClick={() => onView(s.id)}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>{s.document}</TableCell>
              <TableCell className="capitalize">{s.category}</TableCell>
              <TableCell>
                <Badge className={`text-[10px] ${statusMap[s.status].className}`}>
                  {statusMap[s.status].label}
                </Badge>
              </TableCell>
              <TableCell>
                <SupplierRating value={s.rating} readonly size="sm" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onView(s.id); }}>
                    <Eye size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onEdit(s.id); }}>
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={(e) => { e.stopPropagation(); onDelete(s); }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
