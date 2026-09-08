import { z } from "zod";

export const contactSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  role: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  isPrimary: z.boolean(),
});

export const bankAccountSchema = z.object({
  id: z.string(),
  bank: z.string().min(1, "Banco é obrigatório"),
  bankName: z.string(),
  agency: z.string().min(1, "Agência é obrigatória"),
  account: z.string().min(1, "Conta é obrigatória"),
  accountType: z.enum(["checking", "savings"]),
  pixKey: z.string().optional(),
  pixType: z.enum(["cnpj", "cpf", "email", "phone", "random"]).optional(),
  isPrimary: z.boolean(),
});

export const addressSchema = z.object({
  cep: z.string().min(8, "CEP inválido"),
  street: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado inválido"),
});

export const supplierFormSchema = z
  .object({
    documentType: z.enum(["cnpj", "cpf"]),
    document: z.string().min(1, "Documento é obrigatório"),
    legalName: z.string().min(2, "Razão social é obrigatória"),
    name: z.string().min(1, "Nome fantasia é obrigatório"),
    category: z.string().min(1, "Categoria é obrigatória"),
    rating: z.number().min(0).max(5),
    status: z.enum(["active", "inactive", "pending"]),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: addressSchema,
  contacts: z.array(contactSchema),
  bankAccounts: z.array(bankAccountSchema),
    paymentTerms: z.string().optional(),
    notes: z.string().optional(),
    logo: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const cleanDoc = data.document.replace(/\D/g, "");
    if (data.documentType === "cnpj" && cleanDoc.length !== 14) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ deve ter 14 dígitos",
        path: ["document"],
      });
    }
    if (data.documentType === "cpf" && cleanDoc.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF deve ter 11 dígitos",
        path: ["document"],
      });
    }
  });

export type SupplierFormData = z.infer<typeof supplierFormSchema>;
