import { MessageCircle, UserPlus } from "lucide-react";
import type { ClienteOrigem } from "../../types/clientes";

interface ClienteOrigemBadgeProps {
  origem: ClienteOrigem;
  small?: boolean;
}

export function ClienteOrigemBadge({ origem, small = false }: ClienteOrigemBadgeProps) {
  const isWhatsApp = origem === "whatsapp";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${
        small ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
      }`}
      style={{
        background: isWhatsApp ? "#25d36615" : "#efefef",
        color: isWhatsApp ? "#128C7E" : "#627271",
        borderColor: isWhatsApp ? "#25d36630" : "#efefef",
        fontWeight: 600,
      }}
    >
      {isWhatsApp ? <MessageCircle size={small ? 9 : 11} /> : <UserPlus size={small ? 9 : 11} />}
      {isWhatsApp ? "WhatsApp" : "Manual"}
    </span>
  );
}
