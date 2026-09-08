import { Search, Filter, LayoutGrid, List, X, ArrowUpDown } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Category } from "../../types/suppliers";

interface SupplierFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  selectedStatus: "all" | "active" | "inactive" | "pending";
  onStatusChange: (status: "all" | "active" | "inactive" | "pending") => void;
  sortBy: "name" | "rating" | "totalSpent";
  onSortChange: (field: "name" | "rating" | "totalSpent") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  resultCount: number;
  categories: Category[];
}

export function SupplierFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
  categories,
}: SupplierFiltersProps) {
  const hasFilters =
    searchQuery || selectedCategory !== "todas" || selectedStatus !== "all";

  const handleClear = () => {
    onSearchChange("");
    onCategoryChange("todas");
    onStatusChange("all");
    onSortChange("name");
  };

  const statusCounts = {
    all: resultCount,
    active: 0,
    inactive: 0,
    pending: 0,
  };

  // contadores seriam passados de fora; aqui mostramos apenas resultCount para Todos
  // e deixamos os outros como 0 para simplificar, já que a prop não inclui contadores por status

  return (
    <div className="space-y-4">
      <Tabs value={selectedStatus} onValueChange={(v) => onStatusChange(v as typeof selectedStatus)}>
        <TabsList className="bg-white border border-[#efefef] p-1 h-auto flex-wrap">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-[#efefef] data-[state=active]:text-[#1f2937]">
            Todos
            <Badge variant="secondary" className="ml-1.5 text-[10px]">{resultCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs data-[state=active]:bg-[#efefef] data-[state=active]:text-[#1f2937]">
            Ativos
          </TabsTrigger>
          <TabsTrigger value="inactive" className="text-xs data-[state=active]:bg-[#efefef] data-[state=active]:text-[#1f2937]">
            Inativos
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-[#efefef] data-[state=active]:text-[#1f2937]">
            Em Análise
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" size={16} />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome, CNPJ ou razão social..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-40">
              <Filter size={14} className="mr-2 text-[#627271]" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => onSortChange(v as typeof sortBy)}>
            <SelectTrigger className="w-44">
              <ArrowUpDown size={14} className="mr-2 text-[#627271]" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome A-Z</SelectItem>
              <SelectItem value="rating">Maior avaliação</SelectItem>
              <SelectItem value="totalSpent">Maior volume de compras</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border border-[#efefef] rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`px-3 py-2 transition-colors ${
                viewMode === "grid" ? "bg-[#efefef] text-[#1f2937]" : "text-[#627271] hover:bg-[#efefef]"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`px-3 py-2 transition-colors ${
                viewMode === "list" ? "bg-[#efefef] text-[#1f2937]" : "text-[#627271] hover:bg-[#efefef]"
              }`}
            >
              <List size={16} />
            </button>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={handleClear} className="text-[#627271]">
              <X size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
