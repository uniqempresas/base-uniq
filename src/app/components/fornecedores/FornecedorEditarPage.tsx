import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { SupplierForm } from "./SupplierForm";
import { useSuppliers } from "../../hooks/useSuppliers";
import type { SupplierFormData } from "../../lib/validators";
import { toast } from "sonner";

export function FornecedorEditarPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { suppliers, updateSupplier } = useSuppliers();

  const supplier = suppliers.find((s) => s.id === id);

  useEffect(() => {
    if (!supplier) {
      toast.error("Fornecedor não encontrado");
      navigate("/fornecedores");
    }
  }, [supplier, navigate]);

  if (!supplier) return null;

  const handleSubmit = async (data: SupplierFormData) => {
    await updateSupplier(supplier.id, data);
    navigate("/fornecedores");
  };

  return (
    <SupplierForm
      supplier={supplier}
      mode="edit"
      onSubmit={handleSubmit}
      onCancel={() => navigate("/fornecedores")}
    />
  );
}
