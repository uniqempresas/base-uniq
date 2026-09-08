import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { BankAccountCard } from "./BankAccountCard";
import type { BankAccount } from "../../types/suppliers";

interface BankAccountListProps {
  accounts: BankAccount[];
  onChange: (accounts: BankAccount[]) => void;
  supplierDocument?: string;
}

export function BankAccountList({ accounts, onChange, supplierDocument }: BankAccountListProps) {
  const handleAdd = () => {
    const newAccount: BankAccount = {
      id: `bank-${Date.now()}`,
      bank: "",
      bankName: "",
      agency: "",
      account: "",
      accountType: "checking",
      pixKey: "",
      pixType: undefined,
      isPrimary: accounts.length === 0,
    };
    onChange([...accounts, newAccount]);
  };

  const handleRemove = (id: string) => {
    const remaining = accounts.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    onChange(remaining);
  };

  const handleUpdate = (updated: BankAccount) => {
    onChange(accounts.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleSetPrimary = (id: string) => {
    onChange(accounts.map((a) => ({ ...a, isPrimary: a.id === id })));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#627271]">{accounts.length} conta(s)</p>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus size={14} className="mr-1" /> Adicionar Conta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#efefef] rounded-xl">
          <p className="text-sm text-[#627271]">Nenhuma conta bancária adicionada.</p>
          <p className="text-xs text-[#627271]">Clique no botão acima para adicionar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <BankAccountCard
              key={account.id}
              account={account}
              onUpdate={handleUpdate}
              onRemove={() => handleRemove(account.id)}
              onSetPrimary={() => handleSetPrimary(account.id)}
              supplierDocument={supplierDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
}
