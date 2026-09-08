import { X, Star, User } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import type { Contact } from "../../types/suppliers";
import { maskPhone, unmask } from "../../lib/document-mask";

interface ContactCardProps {
  contact: Contact;
  onUpdate: (updated: Contact) => void;
  onRemove: () => void;
  onSetPrimary: () => void;
}

export function ContactCard({ contact, onUpdate, onRemove, onSetPrimary }: ContactCardProps) {
  const updateField = (field: keyof Contact, value: string | boolean) => {
    onUpdate({ ...contact, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-[#efefef] p-4 relative">
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {contact.isPrimary && <Star size={14} className="text-amber-400 fill-amber-400" />}
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-[#627271] hover:text-red-500" onClick={onRemove}>
          <X size={14} />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 flex items-center gap-2">
          <User size={16} className="text-[#627271]" />
          <Input
            value={contact.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Nome do contato *"
            className="flex-1"
          />
        </div>

        <div>
          <Label className="text-xs text-[#627271]">Cargo</Label>
          <Input
            value={contact.role || ""}
            onChange={(e) => updateField("role", e.target.value)}
            placeholder="Cargo"
          />
        </div>

        <div>
          <Label className="text-xs text-[#627271]">Email</Label>
          <Input
            type="email"
            value={contact.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <Label className="text-xs text-[#627271]">Telefone</Label>
          <Input
            value={contact.phone ? maskPhone(contact.phone) : ""}
            onChange={(e) => updateField("phone", unmask(e.target.value))}
            placeholder="(00) 0000-0000"
          />
        </div>

        <div>
          <Label className="text-xs text-[#627271]">Celular</Label>
          <Input
            value={contact.mobile ? maskPhone(contact.mobile) : ""}
            onChange={(e) => updateField("mobile", unmask(e.target.value))}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Checkbox
          id={`primary-${contact.id}`}
          checked={contact.isPrimary}
          onCheckedChange={() => onSetPrimary()}
        />
        <Label htmlFor={`primary-${contact.id}`} className="text-xs cursor-pointer">
          Contato principal
        </Label>
      </div>
    </div>
  );
}
