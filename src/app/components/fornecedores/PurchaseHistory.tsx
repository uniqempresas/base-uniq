import { useState } from "react";
import { format } from "date-fns";
import { Eye, FileText, Package, CheckCircle2, Clock, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { Purchase } from "../../types/suppliers";

interface PurchaseHistoryProps {
  purchases: Purchase[];
  maxItems?: number;
  showPagination?: boolean;
}

const statusMap = {
  received: {
    label: "Recebido",
    className: "bg-[#efefef] text-[#1f2937] hover:bg-[#efefef]",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    icon: Clock,
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
    icon: XCircle,
  },
};

export function PurchaseHistory({ purchases, maxItems = 5, showPagination = false }: PurchaseHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = maxItems;

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const paginated = purchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-3">
      {purchases.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#efefef] rounded-xl">
          <Package size={24} className="mx-auto text-[#627271] mb-2" />
          <p className="text-sm text-[#627271]">Nenhuma compra registrada.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[#efefef] overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-[#efefef]">
                <TableRow>
                  <TableHead className="text-xs">Pedido</TableHead>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Produtos</TableHead>
                  <TableHead className="text-xs">Valor</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((purchase) => {
                  const StatusIcon = statusMap[purchase.status].icon;
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell className="text-sm font-medium">{purchase.orderNumber}</TableCell>
                      <TableCell className="text-sm">{format(new Date(purchase.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-sm">{purchase.items} itens</TableCell>
                      <TableCell className="text-sm">{formatCurrency(purchase.total)}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${statusMap[purchase.status].className}`}>
                          <StatusIcon size={10} className="mr-1" />
                          {statusMap[purchase.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <FileText size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {showPagination && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-[#1f2937]">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
