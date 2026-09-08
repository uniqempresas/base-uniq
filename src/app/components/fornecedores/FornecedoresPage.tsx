import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Truck, List, Package } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { SupplierGrid } from "./SupplierGrid";
import { SupplierFilters } from "./SupplierFilters";
import { SupplierDetailsDrawer } from "./SupplierDetailsDrawer";
import { useSuppliers } from "../../hooks/useSuppliers";
import { mockCategories } from "../../lib/mocks/suppliers";
import type { Supplier } from "../../types/suppliers";

export function FornecedoresPage() {
  const navigate = useNavigate();
  const { suppliers, isLoading, deleteSupplier, updateSupplier } = useSuppliers();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "totalSpent">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const filteredSuppliers = useMemo(() => {
    let data = [...suppliers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.legalName.toLowerCase().includes(q) ||
          s.document.includes(q.replace(/\D/g, ""))
      );
    }

    if (selectedCategory !== "todas") {
      data = data.filter((s) => s.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      data = data.filter((s) => s.status === selectedStatus);
    }

    data.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "rating") {
        comparison = a.rating - b.rating;
      } else if (sortBy === "totalSpent") {
        comparison = a.totalSpent - b.totalSpent;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return data;
  }, [suppliers, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === selectedSupplierId) || null,
    [suppliers, selectedSupplierId]
  );

  const handleSortChange = (field: "name" | "rating" | "totalSpent") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleViewSupplier = (id: string) => setSelectedSupplierId(id);
  const handleEditSupplier = (id: string) => navigate(`/fornecedores/${id}/editar`);

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      await deleteSupplier(supplierToDelete.id);
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
      if (selectedSupplierId === supplierToDelete.id) {
        setSelectedSupplierId(null);
      }
    }
  };

  const handleInactivate = async (id: string) => {
    const supplier = suppliers.find((s) => s.id === id);
    if (!supplier) return;
    const newStatus = supplier.status === "active" ? "inactive" : "active";
    await updateSupplier(id, { status: newStatus });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Menu de Contexto */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => navigate("/fornecedores")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
        >
          <List size={16} className="text-[#627271]" />
          <span className="text-sm font-medium text-[#1f2937]">Lista</span>
        </button>

        <button
          onClick={() => navigate("/fornecedores/novo")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
        >
          <Plus size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-[#1f2937]">Novo</span>
        </button>

        <button
          onClick={() => navigate("/estoque/produtos")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] bg-white hover:bg-[#efefef] hover:border-[#efefef] transition-all"
        >
          <Package size={16} className="text-violet-600" />
          <span className="text-sm font-medium text-[#1f2937]">Estoque</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#1f2937] font-bold text-lg">Fornecedores</h1>
          <p className="text-[#627271] text-sm">Gerencie seus fornecedores e parceiros comerciais</p>
        </div>
        <Button
          onClick={() => navigate("/fornecedores/novo")}
          className="bg-[#86cb92] hover:bg-[#1f2937] text-[#1f2937] hover:text-white"
        >
          <Plus size={16} className="mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 mb-6">
        <SupplierFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filteredSuppliers.length}
          categories={mockCategories}
        />
      </div>

      <SupplierGrid
        suppliers={paginatedSuppliers}
        viewMode={viewMode}
        onView={handleViewSupplier}
        onEdit={handleEditSupplier}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      {filteredSuppliers.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-[#627271]">
            Exibindo {(currentPage - 1) * itemsPerPage + 1} -
            {Math.min(currentPage * itemsPerPage, filteredSuppliers.length)} de {filteredSuppliers.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? "bg-[#86cb92] hover:bg-[#1f2937] hover:text-white" : ""}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <SupplierDetailsDrawer
        supplier={selectedSupplier}
        isOpen={!!selectedSupplierId}
        onClose={() => setSelectedSupplierId(null)}
        onEdit={handleEditSupplier}
        onInactivate={handleInactivate}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir fornecedor?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{supplierToDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
