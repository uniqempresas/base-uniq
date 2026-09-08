# SPEC - Sprint 08: Fornecedores UI

**Versão:** 1.0  
**Data:** 2026-03-21  
**Status:** Pronto para Implementação  
**Tipo:** Frontend Only (UI + Mock Data)  
**Referência PRD:** `tracking/plans/PRD-Sprint08-Fornecedores.md`

---

## 1. Visão Geral Técnica

### 1.1 Objetivo
Implementar a interface completa do módulo de **Gestão de Fornecedores** seguindo o padrão de projetos existentes (Serviços, Agendamentos) com mock data para frontend-only.

### 1.2 Stack Técnica
- **Framework:** Next.js 14+ (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Formulários:** react-hook-form + zod + @hookform/resolvers
- **Ícones:** lucide-react
- **Datas:** date-fns
- **Estado:** React hooks (useState, useCallback)

### 1.3 Padrões do Projeto
Seguir rigorosamente os padrões estabelecidos em `app/servicos/`:
- Estrutura de arquivos por feature
- Componentes em subpasta `components/`
- Hooks customizados em `hooks/`
- Tipos em `types/`
- Mock data em `lib/mock/`

---

## 2. Arquitetura de Tipos

### 2.1 Arquivo: `app/types/suppliers.ts`

```typescript
// ============================================
// STATUS E ENUMS
// ============================================

export type SupplierStatus = 'active' | 'inactive' | 'pending';
export type DocumentType = 'cnpj' | 'cpf';
export type BankAccountType = 'checking' | 'savings';
export type PixType = 'cnpj' | 'cpf' | 'email' | 'phone' | 'random';

// ============================================
// ENTIDADES PRINCIPAIS
// ============================================

export interface Supplier {
  id: string;
  name: string;
  legalName: string;
  document: string;
  documentType: DocumentType;
  category: string;
  rating: number;
  ratingCount: number;
  status: SupplierStatus;
  email?: string;
  phone?: string;
  address: Address;
  contacts: Contact[];
  bankAccounts: BankAccount[];
  paymentTerms?: string;
  notes?: string;
  logo?: string | null;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase: string | null;
  averageTicket: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary: boolean;
}

export interface BankAccount {
  id: string;
  bank: string;
  bankName: string;
  agency: string;
  account: string;
  accountType: BankAccountType;
  pixKey?: string;
  pixType?: PixType;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

// ============================================
// TIPOS DE FORMULÁRIO
// ============================================

export interface SupplierFormData {
  name: string;
  legalName: string;
  document: string;
  documentType: DocumentType;
  category: string;
  rating: number;
  status: SupplierStatus;
  email?: string;
  phone?: string;
  address: Address;
  contacts: Contact[];
  bankAccounts: BankAccount[];
  paymentTerms?: string;
  notes?: string;
  logo?: string | null;
}

// ============================================
// TIPOS DE FILTROS
// ============================================

export interface SupplierFilters {
  search: string;
  category: string | null;
  status: SupplierStatus | 'all';
}

// ============================================
// PROPS DOS COMPONENTES
// ============================================

export interface SupplierCardProps {
  supplier: Supplier;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface SupplierGridProps {
  suppliers: Supplier[];
  loading?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export interface SupplierFiltersProps {
  filters: SupplierFilters;
  onChange: (filters: SupplierFilters) => void;
  categories: Category[];
  statusCounts: {
    all: number;
    active: number;
    inactive: number;
    pending: number;
  };
}

export interface SupplierFormProps {
  initialData?: Supplier;
  onSubmit: (data: SupplierFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface SupplierDetailsDrawerProps {
  supplier: Supplier | null;
  open: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export interface SupplierRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface ContactListProps {
  contacts: Contact[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onEdit: (contact: Contact) => void;
  onSetPrimary: (id: string) => void;
}

export interface BankAccountListProps {
  accounts: BankAccount[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onEdit: (account: BankAccount) => void;
  onSetPrimary: (id: string) => void;
}

export interface CEPSearchProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound: (address: Address) => void;
  onError: (error: string) => void;
}

export interface SupplierStatsProps {
  supplier: Supplier;
}

export interface PurchaseHistoryProps {
  supplierId: string;
}

// ============================================
// CEP
// ============================================

export interface CEPResult {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}
```

---

## 3. Estrutura de Arquivos

```
app/
├── fornecedores/
│   ├── page.tsx                          # Listagem principal
│   ├── novo/
│   │   └── page.tsx                      # Cadastro
│   └── [id]/
│       ├── page.tsx                      # Detalhes (opcional - usar drawer)
│       └── editar/
│           └── page.tsx                  # Edição
│
├── components/
│   └── fornecedores/
│       ├── index.ts                       # Export barrel
│       ├── SupplierGrid.tsx               # Grid responsivo
│       ├── SupplierCard.tsx               # Card individual
│       ├── SupplierFilters.tsx             # Filtros e tabs
│       ├── SupplierForm.tsx               # Formulário completo
│       ├── SupplierDetailsDrawer.tsx      # Drawer de detalhes
│       ├── SupplierRating.tsx             # Sistema de rating
│       ├── SupplierStats.tsx              # Cards de métricas
│       ├── ContactList.tsx                # Lista de contatos
│       ├── BankAccountList.tsx            # Lista de contas
│       ├── CEPSearch.tsx                  # Busca de CEP
│       ├── PurchaseHistory.tsx            # Tabela histórico
│       └── EmptyState.tsx                 # Estado vazio
│
├── hooks/
│   ├── use-suppliers.ts                   # CRUD + mock data
│   ├── use-supplier-filters.ts            # Estado dos filtros
│   └── use-cep-search.ts                 # Busca de CEP
│
├── lib/
│   ├── mock/
│   │   ├── suppliers.ts                  # Mock data
│   │   └── cep.ts                        # Mock CEP data
│   └── utils/
│       ├── masks.ts                      # Máscaras (CNPJ, CPF, CEP, telefone)
│       └── validators.ts                  # Validações Zod
│
└── types/
    └── suppliers.ts                       # Tipos TypeScript
```

---

## 4. Componentes Detalhados

### 4.1 SupplierCard

**Arquivo:** `app/components/fornecedores/SupplierCard.tsx`

```tsx
"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Eye, Pencil, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupplierCardProps } from "@/app/types/suppliers";
import { SupplierRating } from "./SupplierRating";

export function SupplierCard({ supplier, onView, onEdit, onDelete }: SupplierCardProps) {
  const statusStyles = {
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const statusLabels = {
    active: "Ativo",
    inactive: "Inativo",
    pending: "Em Análise",
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header com logo e rating */}
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-uniq-platinum rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-uniq-muted" />
          </div>
          <SupplierRating value={supplier.rating} readonly size="sm" showValue />
        </div>

        {/* Nome e CNPJ */}
        <h3 className="text-lg font-semibold text-uniq-text line-clamp-1">
          {supplier.name}
        </h3>
        <p className="text-sm text-uniq-muted mt-1">
          {supplier.documentType === 'cnpj' ? 'CNPJ' : 'CPF'}: {supplier.document}
        </p>

        {/* Contato */}
        <div className="mt-4 space-y-2">
          {supplier.email && (
            <div className="flex items-center gap-2 text-sm text-uniq-muted">
              <Mail className="w-4 h-4" />
              <span className="truncate">{supplier.email}</span>
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center gap-2 text-sm text-uniq-muted">
              <Phone className="w-4 h-4" />
              <span>{supplier.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-uniq-muted">
            <MapPin className="w-4 h-4" />
            <span>{supplier.address.city}, {supplier.address.state}</span>
          </div>
        </div>

        {/* Badge de categoria */}
        <Badge variant="secondary" className="mt-3">
          {supplier.category}
        </Badge>

        {/* Estatísticas */}
        <div className="mt-4 pt-4 border-t border-uniq-border">
          <div className="flex justify-between text-sm">
            <span className="text-uniq-muted">
              💰 {formatCurrency(supplier.totalSpent)}/ano
            </span>
            <span className="text-uniq-muted">
              📋 {supplier.totalPurchases} compras
            </span>
          </div>
        </div>

        {/* Status */}
        <Badge 
          className={cn("mt-3", statusStyles[supplier.status])}
        >
          {statusLabels[supplier.status]}
        </Badge>
      </CardContent>

      {/* Footer com ações */}
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onView(supplier.id)}
        >
          Ver detalhes
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(supplier.id)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(supplier.id)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}
```

### 4.2 SupplierRating

**Arquivo:** `app/components/fornecedores/SupplierRating.tsx`

```tsx
"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupplierRatingProps } from "@/app/types/suppliers";

export function SupplierRating({ 
  value, 
  onChange, 
  readonly = false, 
  showValue = true,
  size = 'md'
}: SupplierRatingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizes[size],
              star <= value 
                ? "fill-yellow-400 text-yellow-400" 
                : "fill-gray-200 text-gray-200"
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-uniq-muted font-medium">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
```

### 4.3 CEPSearch

**Arquivo:** `app/components/fornecedores/CEPSearch.tsx`

```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { CEPSearchProps } from "@/app/types/suppliers";
import { maskCEP } from "@/app/lib/utils/masks";
import { mockCEPData } from "@/app/lib/mock/cep";

export function CEPSearch({ value, onChange, onAddressFound, onError }: CEPSearchProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!value || value.length < 8) {
      setError("CEP inválido");
      return;
    }

    setLoading(true);
    setError(null);

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    const cleanCEP = value.replace(/\D/g, '');
    const result = mockCEPData[cleanCEP];

    if (result) {
      onAddressFound(result);
      setError(null);
    } else {
      setError("CEP não encontrado");
      onError("CEP não encontrado");
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(maskCEP(e.target.value))}
          onKeyDown={handleKeyDown}
          placeholder="00000-000"
          maxLength={9}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
      <Button 
        onClick={handleSearch} 
        disabled={loading || !value}
        variant="secondary"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
```

### 4.4 SupplierForm (via Zod)

**Arquivo:** `app/lib/utils/validators.ts`

```typescript
import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  legalName: z.string().min(1, "Razão Social é obrigatória"),
  document: z.string().min(1, "Documento é obrigatório"),
  documentType: z.enum(["cnpj", "cpf"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  rating: z.number().min(1).max(5),
  status: z.enum(["active", "inactive", "pending"]),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.object({
    cep: z.string().min(1, "CEP é obrigatório"),
    street: z.string().min(1, "Logradouro é obrigatório"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório"),
  }),
  contacts: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Nome do contato é obrigatório"),
    role: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    isPrimary: z.boolean(),
  })),
  bankAccounts: z.array(z.object({
    id: z.string(),
    bank: z.string().min(1, "Banco é obrigatório"),
    bankName: z.string().optional(),
    agency: z.string().min(1, "Agência é obrigatória"),
    account: z.string().min(1, "Conta é obrigatória"),
    accountType: z.enum(["checking", "savings"]),
    pixKey: z.string().optional(),
    pixType: z.enum(["cnpj", "cpf", "email", "phone", "random"]).optional(),
    isPrimary: z.boolean(),
  })),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

export type SupplierFormSchema = z.infer<typeof supplierSchema>;
```

### 4.5 Máscaras

**Arquivo:** `app/lib/utils/masks.ts`

```typescript
export const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

export const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1-$2')
    .slice(0, 14);
};

export const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

export const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

export const maskDocument = (value: string, type: 'cnpj' | 'cpf') => {
  return type === 'cnpj' ? maskCNPJ(value) : maskCPF(value);
};
```

---

## 5. Hooks Customizados

### 5.1 useSuppliers

**Arquivo:** `app/hooks/use-suppliers.ts`

```typescript
"use client";

import { useState, useCallback, useMemo } from "react";
import { Supplier, SupplierFilters } from "@/app/types/suppliers";
import { mockSuppliers } from "@/app/lib/mock/suppliers";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SupplierFilters>({
    search: "",
    category: null,
    status: "all",
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      // Filtro de busca
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch = 
          supplier.name.toLowerCase().includes(search) ||
          supplier.document.includes(search) ||
          supplier.legalName.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Filtro de categoria
      if (filters.category && supplier.category !== filters.category) {
        return false;
      }

      // Filtro de status
      if (filters.status !== "all" && supplier.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [suppliers, filters]);

  const statusCounts = useMemo(() => ({
    all: suppliers.length,
    active: suppliers.filter(s => s.status === 'active').length,
    inactive: suppliers.filter(s => s.status === 'inactive').length,
    pending: suppliers.filter(s => s.status === 'pending').length,
  }), [suppliers]);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    suppliers.forEach(s => {
      categoryMap.set(s.category, (categoryMap.get(s.category) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      count,
    }));
  }, [suppliers]);

  const getSupplierById = useCallback((id: string) => {
    return suppliers.find(s => s.id === id) || null;
  }, [suppliers]);

  const createSupplier = useCallback((data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    const newSupplier: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    setLoading(false);
    return newSupplier;
  }, []);

  const updateSupplier = useCallback((id: string, data: Partial<Supplier>) => {
    setLoading(true);
    setSuppliers(prev => prev.map(s => 
      s.id === id 
        ? { ...s, ...data, updatedAt: new Date().toISOString() }
        : s
    ));
    setLoading(false);
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setLoading(true);
    setSuppliers(prev => prev.filter(s => s.id !== id));
    setLoading(false);
  }, []);

  return {
    suppliers: filteredSuppliers,
    allSuppliers: suppliers,
    loading,
    filters,
    setFilters,
    statusCounts,
    categories,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
}
```

### 5.2 useCEPSearch

**Arquivo:** `app/hooks/use-cep-search.ts`

```typescript
"use client";

import { useState, useCallback } from "react";
import { CEPResult, Address } from "@/app/types/suppliers";
import { mockCEPData } from "@/app/lib/mock/cep";

export function useCEPSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCEP = useCallback(async (cep: string): Promise<CEPResult | null> => {
    if (!cep || cep.length < 8) {
      setError("CEP inválido");
      return null;
    }

    setLoading(true);
    setError(null);

    // Simular delay de API (300-800ms)
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    const cleanCEP = cep.replace(/\D/g, '');
    const result = mockCEPData[cleanCEP];

    if (result) {
      setLoading(false);
      return result;
    } else {
      setError("CEP não encontrado");
      setLoading(false);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    searchCEP,
    loading,
    error,
    clearError,
  };
}
```

---

## 6. Mock Data

### 6.1 Mock Suppliers

**Arquivo:** `app/lib/mock/suppliers.ts`

```typescript
import { Supplier, Category } from "@/app/types/suppliers";

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Tech Distribuidora Ltda',
    legalName: 'Tech Distribuidora Comercio de Eletronicos Ltda',
    document: '12.345.678/0001-90',
    documentType: 'cnpj',
    category: 'tecnologia',
    rating: 4.8,
    ratingCount: 23,
    status: 'active',
    email: 'contato@techdist.com.br',
    phone: '(11) 3456-7890',
    address: {
      cep: '01310-100',
      street: 'Avenida Paulista',
      number: '1000',
      complement: 'Sala 1501',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    },
    contacts: [
      {
        id: 'cont-001',
        name: 'João Silva',
        role: 'Gerente Comercial',
        email: 'joao.silva@techdist.com.br',
        phone: '(11) 3456-7890',
        mobile: '(11) 98765-4321',
        isPrimary: true
      }
    ],
    bankAccounts: [
      {
        id: 'bank-001',
        bank: '001',
        bankName: 'Banco do Brasil',
        agency: '1234-5',
        account: '123456-7',
        accountType: 'checking',
        pixKey: '12.345.678/0001-90',
        pixType: 'cnpj',
        isPrimary: true
      }
    ],
    paymentTerms: '30/60/90',
    notes: 'Fornecedor principal de eletrônicos. Entrega em 48h.',
    logo: null,
    totalPurchases: 145,
    totalSpent: 245890.00,
    lastPurchase: '2026-03-10',
    averageTicket: 1695.79,
    createdAt: '2024-01-15',
    updatedAt: '2026-03-10'
  },
  {
    id: 'sup-002',
    name: 'Papelaria ABC',
    legalName: 'ABC Papelaria e Escritorio Ltda',
    document: '98.765.432/0001-21',
    documentType: 'cnpj',
    category: 'materiais',
    rating: 4.2,
    ratingCount: 15,
    status: 'active',
    email: 'vendas@papelariaabc.com.br',
    phone: '(21) 2543-2109',
    address: {
      cep: '20040-001',
      street: 'Rua da Quitanda',
      number: '89',
      complement: 'Loja A',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ'
    },
    contacts: [
      {
        id: 'cont-003',
        name: 'Carlos Oliveira',
        role: 'Proprietário',
        email: 'carlos@papelariaabc.com.br',
        phone: '(21) 2543-2109',
        mobile: '(21) 98765-4321',
        isPrimary: true
      }
    ],
    bankAccounts: [],
    paymentTerms: '28/56',
    notes: '',
    logo: null,
    totalPurchases: 67,
    totalSpent: 45320.00,
    lastPurchase: '2026-02-28',
    averageTicket: 676.42,
    createdAt: '2024-03-20',
    updatedAt: '2026-02-28'
  },
  {
    id: 'sup-003',
    name: 'Logística Express',
    legalName: 'Express Logistica e Transporte Ltda',
    document: '45.678.901/0001-34',
    documentType: 'cnpj',
    category: 'logistica',
    rating: 3.5,
    ratingCount: 8,
    status: 'pending',
    email: 'contato@logisticaexpress.com',
    phone: '(31) 3344-5566',
    address: {
      cep: '30130-000',
      street: 'Avenida Cristiano Machado',
      number: '1500',
      complement: 'Galpão 3',
      neighborhood: 'Vila Cloris',
      city: 'Belo Horizonte',
      state: 'MG'
    },
    contacts: [],
    bankAccounts: [],
    paymentTerms: '',
    notes: 'Aguardando documentação completa.',
    logo: null,
    totalPurchases: 0,
    totalSpent: 0,
    lastPurchase: null,
    averageTicket: 0,
    createdAt: '2026-03-15',
    updatedAt: '2026-03-15'
  },
  {
    id: 'sup-004',
    name: 'Distribuidora de Alimentos Norte',
    legalName: 'Distribuidora Norte Alimentos Ltda',
    document: '34.567.890/0001-56',
    documentType: 'cnpj',
    category: 'alimentacao',
    rating: 4.6,
    ratingCount: 31,
    status: 'active',
    email: 'vendas@distnorte.com.br',
    phone: '(62) 3456-7890',
    address: {
      cep: '74000-000',
      street: 'Avenida Anhanguera',
      number: '5000',
      complement: '',
      neighborhood: 'Setor Norte Ferroviário',
      city: 'Goiânia',
      state: 'GO'
    },
    contacts: [
      {
        id: 'cont-004',
        name: 'Ana Paula Costa',
        role: 'Diretora Comercial',
        email: 'ana.costa@distnorte.com.br',
        phone: '(62) 3456-7890',
        mobile: '(62) 98765-4321',
        isPrimary: true
      }
    ],
    bankAccounts: [
      {
        id: 'bank-002',
        bank: '237',
        bankName: 'Banco Bradesco',
        agency: '1234-5',
        account: '12345-6',
        accountType: 'checking',
        pixKey: '34.567.890/0001-56',
        pixType: 'cnpj',
        isPrimary: true
      }
    ],
    paymentTerms: '30/45/60',
    notes: 'Entregas de segunda a sexta. Pedido mínimo R$ 500.',
    logo: null,
    totalPurchases: 89,
    totalSpent: 156780.00,
    lastPurchase: '2026-03-15',
    averageTicket: 1761.57,
    createdAt: '2024-06-01',
    updatedAt: '2026-03-15'
  },
  {
    id: 'sup-005',
    name: 'Móveis Planejados Premium',
    legalName: 'Premium Moveis Planejados Eireli',
    document: '56.789.012/0001-78',
    documentType: 'cnpj',
    category: 'moveis',
    rating: 4.9,
    ratingCount: 42,
    status: 'active',
    email: 'contato@moveispremium.com.br',
    phone: '(19) 3456-7890',
    address: {
      cep: '13020-000',
      street: 'Avenida Brasil',
      number: '1500',
      complement: 'Galpão A',
      neighborhood: 'Jardim São Luiz',
      city: 'Campinas',
      state: 'SP'
    },
    contacts: [
      {
        id: 'cont-005',
        name: 'Roberto Mendes',
        role: 'Projetista',
        email: 'roberto@moveispremium.com.br',
        phone: '(19) 3456-7890',
        mobile: '(19) 98765-4321',
        isPrimary: true
      }
    ],
    bankAccounts: [],
    paymentTerms: '50% entrada, 50% entrega',
    notes: 'Fabricação sob encomenda. Prazo de 30 dias.',
    logo: null,
    totalPurchases: 12,
    totalSpent: 89500.00,
    lastPurchase: '2026-01-20',
    averageTicket: 7458.33,
    createdAt: '2025-01-10',
    updatedAt: '2026-01-20'
  },
  {
    id: 'sup-006',
    name: 'Embalagens Eco Verde',
    legalName: 'Eco Verde Embalagens Sustentaveis Ltda',
    document: '78.901.234/0001-90',
    documentType: 'cnpj',
    category: 'embalagens',
    rating: 4.0,
    ratingCount: 12,
    status: 'inactive',
    email: 'comercial@ecoembalagens.com.br',
    phone: '(48) 3456-7890',
    address: {
      cep: '88000-000',
      street: 'Rua Main',
      number: '200',
      complement: '',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC'
    },
    contacts: [],
    bankAccounts: [],
    paymentTerms: '30 dias',
    notes: 'Fornecedor inativado por atraso nas entregas.',
    logo: null,
    totalPurchases: 23,
    totalSpent: 12300.00,
    lastPurchase: '2025-12-01',
    averageTicket: 534.78,
    createdAt: '2025-02-15',
    updatedAt: '2026-02-01'
  }
];

export const mockCategories: Category[] = [
  { id: 'materiais', name: 'Materiais', count: 12 },
  { id: 'tecnologia', name: 'Tecnologia', count: 8 },
  { id: 'logistica', name: 'Logística', count: 5 },
  { id: 'servicos', name: 'Serviços', count: 9 },
  { id: 'vestuario', name: 'Vestuário', count: 4 },
  { id: 'alimentacao', name: 'Alimentação', count: 3 },
  { id: 'moveis', name: 'Móveis', count: 2 },
  { id: 'embalagens', name: 'Embalagens', count: 2 }
];
```

### 6.2 Mock CEP

**Arquivo:** `app/lib/mock/cep.ts`

```typescript
import { CEPResult } from "@/app/types/suppliers";

export const mockCEPData: Record<string, CEPResult> = {
  '01310-100': {
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP'
  },
  '20040-001': {
    cep: '20040-001',
    logradouro: 'Rua da Quitanda',
    bairro: 'Centro',
    cidade: 'Rio de Janeiro',
    estado: 'RJ'
  },
  '30130-000': {
    cep: '30130-000',
    logradouro: 'Avenida Cristiano Machado',
    bairro: 'Vila Cloris',
    cidade: 'Belo Horizonte',
    estado: 'MG'
  },
  '74000-000': {
    cep: '74000-000',
    logradouro: 'Avenida Anhanguera',
    bairro: 'Setor Norte Ferroviário',
    cidade: 'Goiânia',
    estado: 'GO'
  },
  '13020-000': {
    cep: '13020-000',
    logradouro: 'Avenida Brasil',
    bairro: 'Jardim São Luiz',
    cidade: 'Campinas',
    estado: 'SP'
  },
  '88000-000': {
    cep: '88000-000',
    logradouro: 'Rua Main',
    bairro: 'Centro',
    cidade: 'Florianópolis',
    estado: 'SC'
  },
  '01001-000': {
    cep: '01001-000',
    logradouro: 'Praça da Sé',
    bairro: 'Sé',
    cidade: 'São Paulo',
    estado: 'SP'
  },
  '20010-020': {
    cep: '20010-020',
    logradouro: 'Avenida Rio Branco',
    bairro: 'Centro',
    cidade: 'Rio de Janeiro',
    estado: 'RJ'
  },
  '70000-000': {
    cep: '70000-000',
    logradouro: 'Esplanada dos Ministérios',
    bairro: 'Zona Civico-Administrativa',
    cidade: 'Brasília',
    estado: 'DF'
  }
};
```

---

## 7. Rotas/URLs

| Página | Rota | Descrição |
|--------|------|-----------|
| Listagem | `/fornecedores` | Grid de fornecedores com filtros |
| Cadastro | `/fornecedores/novo` | Formulário de novo fornecedor |
| Edição | `/fornecedores/[id]/editar` | Editar fornecedor existente |
| Detalhes | `/fornecedores/[id]` | Redireciona para drawer ou página de detalhes |

---

## 8. Dependências

### 8.1 Bibliotecas (já incluídas ou a verificar)

```json
{
  "dependencies": {
    "lucide-react": "^0.400.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "date-fns": "^3.6.0"
  }
}
```

### 8.2 Componentes shadcn/ui

Executar na raiz do projeto:

```bash
npx shadcn@latest add dialog sheet button input select textarea checkbox radio-group badge avatar scroll-area separator skeleton tabs tooltip table
```

---

## 9. Checklist de Implementação

### Fase 1: Fundamentos
- [ ] Criar tipos `app/types/suppliers.ts`
- [ ] Criar máscaras `app/lib/utils/masks.ts`
- [ ] Criar validadores Zod `app/lib/utils/validators.ts`
- [ ] Criar mock data `app/lib/mock/suppliers.ts`
- [ ] Criar mock CEP `app/lib/mock/cep.ts`

### Fase 2: Hooks
- [ ] Implementar `app/hooks/use-suppliers.ts`
- [ ] Implementar `app/hooks/use-cep-search.ts`

### Fase 3: Componentes Core
- [ ] `SupplierCard` - Card do fornecedor
- [ ] `SupplierGrid` - Grid responsivo
- [ ] `SupplierFilters` - Filtros + tabs de status
- [ ] `SupplierRating` - Sistema de estrelas
- [ ] `CEPSearch` - Busca de CEP

### Fase 4: Componentes de Formulário
- [ ] `SupplierForm` - Formulário completo
- [ ] `ContactList` - Gerenciamento de contatos
- [ ] `BankAccountList` - Dados bancários

### Fase 5: Componentes de Detalhes
- [ ] `SupplierDetailsDrawer` - Drawer de visualização
- [ ] `SupplierStats` - Cards de métricas
- [ ] `PurchaseHistory` - Tabela de histórico
- [ ] `EmptyState` - Estado vazio

### Fase 6: Páginas
- [ ] `/fornecedores` - Listagem
- [ ] `/fornecedores/novo` - Cadastro
- [ ] `/fornecedores/[id]/editar` - Edição

### Fase 7: Estados Visuais
- [ ] Loading states (skeleton)
- [ ] Empty states
- [ ] Error states
- [ ] Success toasts

### Fase 8: Responsividade
- [ ] Desktop: Grid 3 colunas
- [ ] Tablet: Grid 2 colunas
- [ ] Mobile: 1 coluna, drawer fullscreen

### Fase 9: Acessibilidade
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Focus management

---

## 10. Prioridades de Implementação

### Alta Prioridade (MVP)
1. Tipos e mock data
2. Hook useSuppliers
3. SupplierCard
4. SupplierGrid
5. Página de listagem `/fornecedores`
6. SupplierFilters com tabs

### Média Prioridade
7. SupplierForm (completo)
8. SupplierRating
9. CEPSearch
10. ContactList
11. BankAccountList
12. Página de cadastro `/fornecedores/novo`

### Baixa Prioridade (Polish)
13. SupplierDetailsDrawer
14. SupplierStats
15. PurchaseHistory
16. EmptyState
17. Página de edição `/fornecedores/[id]/editar`

---

**Documento criado em:** 2026-03-21  
**Criado por:** @vibe-planner  
**Próximo passo:** ✅ Fechar chat e iniciar novo com @vibe-implementer
