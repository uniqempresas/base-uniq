import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SupplierRating } from "./SupplierRating";
import type { Supplier } from "../../types/suppliers";

interface SupplierCardProps {
  supplier: Supplier;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierCard({ supplier, onView, onEdit, onDelete }: SupplierCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const statusMap = {
    active: { label: "Ativo", className: "bg-[#efefef] text-[#1f2937] hover:bg-[#efefef]" },
    inactive: { label: "Inativo", className: "bg-red-100 text-red-700 hover:bg-red-100" },
    pending: { label: "Em Análise", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  };

  const categoryLabel = supplier.category.charAt(0).toUpperCase() + supplier.category.slice(1);

  return (
    <div
      className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 transition-all cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(supplier.id)}
      style={{
        boxShadow: isHovered ? "0 10px 15px -3px rgb(0 0 0 / 0.1)" : undefined,
        transform: isHovered ? "translateY(-2px)" : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border border-[#efefef]">
            <AvatarImage src={supplier.logo || undefined} />
            <AvatarFallback className="bg-[#efefef] text-[#1f2937]">
              <Building2 size={20} />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-[#1f2937] font-semibold text-sm line-clamp-1">{supplier.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <SupplierRating value={supplier.rating} readonly size="sm" />
              <span className="text-xs text-[#627271]">{supplier.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <Badge className={`text-[10px] ${statusMap[supplier.status].className}`}>
          {statusMap[supplier.status].label}
        </Badge>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-[#1f2937]">
          <span className="text-[#627271]">CNPJ:</span>
          <span className="font-medium">{supplier.document}</span>
        </div>
        {supplier.email && (
          <div className="flex items-center gap-2 text-sm text-[#1f2937]">
            <Mail size={14} className="text-[#627271]" />
            <span className="truncate">{supplier.email}</span>
          </div>
        )}
        {supplier.phone && (
          <div className="flex items-center gap-2 text-sm text-[#1f2937]">
            <Phone size={14} className="text-[#627271]" />
            <span>{supplier.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-[#1f2937]">
          <MapPin size={14} className="text-[#627271]" />
          <span className="truncate">
            {supplier.address.city}, {supplier.address.state}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="text-[10px]">{categoryLabel}</Badge>
      </div>

      <div className="flex items-center justify-between border-t border-[#efefef] pt-4">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-[#627271]">💰 </span>
            <span className="font-medium text-[#1f2937]">
              {supplier.totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-[#627271]">📋 </span>
            <span className="font-medium text-[#1f2937]">{supplier.totalPurchases} compras</span>
          </div>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 mt-4 transition-opacity ${
          isHovered ? "opacity-100" : "opacity-0 lg:opacity-0"
        }`}
        style={{ opacity: isHovered ? 1 : undefined }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(supplier.id);
          }}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1f2937] bg-[#efefef] hover:bg-[#efefef] rounded-lg transition-colors"
        >
          <Eye size={12} /> Ver
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(supplier.id);
          }}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1f2937] bg-[#efefef] hover:bg-[#efefef] rounded-lg transition-colors"
        >
          <Edit2 size={12} /> Editar
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(supplier);
          }}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <Trash2 size={12} /> Excluir
        </button>
      </div>
    </div>
  );
}
