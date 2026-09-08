import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Supplier } from "../types/suppliers";
import type { SupplierFormData } from "../lib/validators";
import { mockSuppliers } from "../lib/mocks/suppliers";
import { mockDelay } from "../lib/mocks/delay";

const STORAGE_KEY = "uniq-suppliers";

function loadSuppliers(): Supplier[] {
  if (typeof window === "undefined") return mockSuppliers;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Supplier[]) : mockSuppliers;
  } catch {
    return mockSuppliers;
  }
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadSuppliers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
    } catch {
      // Persistência local é opcional para o protótipo.
    }
  }, [suppliers]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await mockDelay(400);
      setSuppliers(loadSuppliers());
    } catch {
      setError("Erro ao carregar fornecedores");
      toast.error("Erro ao carregar fornecedores");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSupplierById = useCallback(
    (id: string) => {
      return suppliers.find((s) => s.id === id);
    },
    [suppliers]
  );

  const createSupplier = useCallback(
    async (data: SupplierFormData) => {
      setIsLoading(true);
      await mockDelay(800);

      const now = new Date().toISOString();
      const newSupplier: Supplier = {
        ...data,
        id: typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `sup-${Date.now()}`,
        logo: data.logo ?? null,
        totalPurchases: 0,
        totalSpent: 0,
        averageTicket: 0,
        lastPurchase: null,
        ratingCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      setSuppliers((prev) => [newSupplier, ...prev]);
      toast.success("Fornecedor salvo com sucesso!");
      setIsLoading(false);
      return newSupplier;
    },
    []
  );

  const updateSupplier = useCallback(
    async (id: string, data: Partial<SupplierFormData>) => {
      setIsLoading(true);
      await mockDelay(800);

      setSuppliers((prev) => {
        const index = prev.findIndex((s) => s.id === id);
        if (index === -1) {
          toast.error("Fornecedor não encontrado");
          setIsLoading(false);
          return prev;
        }
        const updated: Supplier = {
          ...prev[index],
          ...data,
          logo: data.logo === undefined ? prev[index].logo : data.logo,
          updatedAt: new Date().toISOString(),
        };
        const next = [...prev];
        next[index] = updated;
        toast.success("Fornecedor atualizado com sucesso!");
        setIsLoading(false);
        return next;
      });

      const updated = suppliers.find((s) => s.id === id);
      return updated!;
    },
    [suppliers]
  );

  const deleteSupplier = useCallback(async (id: string) => {
    setIsLoading(true);
    await mockDelay(600);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    toast.success("Fornecedor excluído");
    setIsLoading(false);
  }, []);

  return {
    suppliers,
    isLoading,
    error,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refresh,
  };
}
