export type SupplierStatus = 'active' | 'inactive' | 'pending';
export type DocumentType = 'cnpj' | 'cpf';
export type BankAccountType = 'checking' | 'savings';
export type PixType = 'cnpj' | 'cpf' | 'email' | 'phone' | 'random';

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

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface Purchase {
  id: string;
  orderNumber: string;
  date: string;
  items: number;
  total: number;
  status: 'received' | 'pending' | 'cancelled';
}
