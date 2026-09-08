import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { ContactCard } from "./ContactCard";
import type { Contact } from "../../types/suppliers";

interface ContactListProps {
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
  maxContacts?: number;
}

export function ContactList({ contacts, onChange, maxContacts }: ContactListProps) {
  const handleAdd = () => {
    if (maxContacts !== undefined && contacts.length >= maxContacts) return;
    const newContact: Contact = {
      id: `cont-${Date.now()}`,
      name: "",
      role: "",
      email: "",
      phone: "",
      mobile: "",
      isPrimary: contacts.length === 0,
    };
    onChange([...contacts, newContact]);
  };

  const handleRemove = (id: string) => {
    const remaining = contacts.filter((c) => c.id !== id);
    if (remaining.length > 0 && !remaining.some((c) => c.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    onChange(remaining);
  };

  const handleUpdate = (updated: Contact) => {
    onChange(contacts.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleSetPrimary = (id: string) => {
    onChange(contacts.map((c) => ({ ...c, isPrimary: c.id === id })));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#627271]">{contacts.length} contato(s)</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={maxContacts !== undefined && contacts.length >= maxContacts}
        >
          <Plus size={14} className="mr-1" /> Adicionar Contato
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#efefef] rounded-xl">
          <p className="text-sm text-[#627271]">Nenhum contato adicionado.</p>
          <p className="text-xs text-[#627271]">Clique no botão acima para adicionar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onUpdate={handleUpdate}
              onRemove={() => handleRemove(contact.id)}
              onSetPrimary={() => handleSetPrimary(contact.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
