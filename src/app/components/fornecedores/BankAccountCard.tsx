import { X, Star, Landmark } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { BankAccount, PixType } from "../../types/suppliers";
import { BANKS_LIST } from "../../lib/mocks/suppliers";

interface BankAccountCardProps {
  account: BankAccount;
  onUpdate: (updated: BankAccount) => void;
  onRemove: () => void;
  onSetPrimary: () => void;
  supplierDocument?: string;
}

const pixTypeLabels: Record<PixType, string> = {
  cnpj: "CNPJ",
  cpf: "CPF",
  email: "Email",
  phone: "Celular",
  random: "Chave Aleatória",
};

export function BankAccountCard({ account, onUpdate, onRemove, onSetPrimary, supplierDocument }: BankAccountCardProps) {
  const updateField = <K extends keyof BankAccount>(field: K, value: BankAccount[K]) => {
    onUpdate({ ...account, [field]: value });
  };

  const handleBankChange = (code: string) => {
    const bankName = BANKS_LIST.find((b) => b.code === code)?.name || "";
    updateField("bank", code);
    updateField("bankName", bankName);
  };

  const handlePixTypeChange = (type: PixType) => {
    updateField("pixType", type);
    if ((type === "cnpj" || type === "cpf") && supplierDocument) {
      updateField("pixKey", supplierDocument);
    } else {
      updateField("pixKey", "");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#efefef] p-4 relative">
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {account.isPrimary && <Star size={14} className="text-amber-400 fill-amber-400" />}
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-[#627271] hover:text-red-500" onClick={onRemove}>
          <X size={14} />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 flex items-center gap-2">
          <Landmark size={16} className="text-[#627271]" />
          <Select value={account.bank} onValueChange={handleBankChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione o banco *" />
            </SelectTrigger>
            <SelectContent>
              {BANKS_LIST.map((b) => (
                <SelectItem key={b.code} value={b.code}>
                  {b.code} - {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-[#627271]">Agência *</Label>
          <Input
            value={account.agency}
            onChange={(e) => updateField("agency", e.target.value.slice(0, 10))}
            placeholder="Agência"
          />
        </div>

        <div>
          <Label className="text-xs text-[#627271]">Conta *</Label>
          <Input
            value={account.account}
            onChange={(e) => updateField("account", e.target.value.slice(0, 12))}
            placeholder="Conta"
          />
        </div>

        <div className="sm:col-span-2">
          <Label className="text-xs text-[#627271] mb-1 block">Tipo de Conta</Label>
          <RadioGroup
            value={account.accountType}
            onValueChange={(v) => updateField("accountType", v as BankAccount["accountType"])}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="checking" id={`checking-${account.id}`} />
              <Label htmlFor={`checking-${account.id}`} className="text-sm cursor-pointer">Corrente</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="savings" id={`savings-${account.id}`} />
              <Label htmlFor={`savings-${account.id}`} className="text-sm cursor-pointer">Poupança</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-xs text-[#627271]">Tipo Pix</Label>
          <Select value={account.pixType || ""} onValueChange={(v) => handlePixTypeChange(v as PixType)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(pixTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-[#627271]">Chave Pix</Label>
          <Input
            value={account.pixKey || ""}
            onChange={(e) => updateField("pixKey", e.target.value)}
            placeholder="Chave Pix"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          id={`primary-bank-${account.id}`}
          checked={account.isPrimary}
          onChange={() => onSetPrimary()}
          className="rounded border-[#efefef] text-[#627271] focus:ring-[#86cb92]"
        />
        <Label htmlFor={`primary-bank-${account.id}`} className="text-xs cursor-pointer">
          Conta principal
        </Label>
      </div>
    </div>
  );
}
