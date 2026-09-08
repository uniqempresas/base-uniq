import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Supplier } from "../types/suppliers";
import { supplierFormSchema, type SupplierFormData } from "../lib/validators";

const defaultValues: SupplierFormData = {
  documentType: "cnpj",
  document: "",
  legalName: "",
  name: "",
  category: "",
  rating: 0,
  status: "active",
  email: "",
  phone: "",
  address: {
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  },
  contacts: [],
  bankAccounts: [],
  paymentTerms: "",
  notes: "",
  logo: null,
};

export function useSupplierForm(supplier?: Supplier) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (supplier) {
      form.reset({
        documentType: supplier.documentType,
        document: supplier.document,
        legalName: supplier.legalName,
        name: supplier.name,
        category: supplier.category,
        rating: supplier.rating,
        status: supplier.status,
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        address: supplier.address,
        contacts: supplier.contacts,
        bankAccounts: supplier.bankAccounts,
        paymentTerms: supplier.paymentTerms ?? "",
        notes: supplier.notes ?? "",
        logo: supplier.logo,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [supplier, form]);

  const watched = form.watch();

  const previewData: Partial<Supplier> = useMemo(() => {
    return {
      ...watched,
      id: supplier?.id ?? "preview",
      ratingCount: supplier?.ratingCount ?? 0,
      totalPurchases: supplier?.totalPurchases ?? 0,
      totalSpent: supplier?.totalSpent ?? 0,
      averageTicket: supplier?.averageTicket ?? 0,
      lastPurchase: supplier?.lastPurchase ?? null,
      createdAt: supplier?.createdAt ?? new Date().toISOString(),
      updatedAt: supplier?.updatedAt ?? new Date().toISOString(),
    };
  }, [watched, supplier]);

  return {
    form,
    previewData,
    contacts: watched.contacts ?? [],
    bankAccounts: watched.bankAccounts ?? [],
  };
}
