import { useNavigate } from "react-router";
import { SupplierForm } from "./SupplierForm";
import { useSuppliers } from "../../hooks/useSuppliers";
import type { SupplierFormData } from "../../lib/validators";

export function FornecedorNovoPage() {
  const navigate = useNavigate();
  const { createSupplier } = useSuppliers();

  const handleSubmit = async (data: SupplierFormData) => {
    await createSupplier(data);
    navigate("/fornecedores");
  };

  return (
    <SupplierForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={() => navigate("/fornecedores")}
    />
  );
}
