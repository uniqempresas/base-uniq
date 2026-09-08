import { Package, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

interface SupplierStatsProps {
  totalPurchases: number;
  totalSpent: number;
  averageTicket: number;
  lastPurchase: string | null;
}

export function SupplierStats({
  totalPurchases,
  totalSpent,
  averageTicket,
  lastPurchase,
}: SupplierStatsProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const items = [
    { label: "Total de Pedidos", value: totalPurchases || "—", icon: Package },
    { label: "Valor Total Comprado", value: totalSpent ? formatCurrency(totalSpent) : "—", icon: DollarSign },
    { label: "Ticket Médio", value: averageTicket ? formatCurrency(averageTicket) : "—", icon: TrendingUp },
    {
      label: "Última Compra",
      value: lastPurchase ? format(new Date(lastPurchase), "dd/MM/yyyy") : "—",
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="bg-[#efefef] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={16} className="text-[#627271]" />
              <span className="text-xs text-[#627271]">{item.label}</span>
            </div>
            <p className="text-sm font-semibold text-[#1f2937]">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}
