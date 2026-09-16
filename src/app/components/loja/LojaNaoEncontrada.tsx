import { Store } from "lucide-react";

/**
 * [T6] Slug inválido — "Loja não encontrada" (SPEC §2.1: sem fallback mock).
 * Slug inexistente é erro real do tenant, não catálogo.
 */
export function LojaNaoEncontrada() {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-white border border-border flex items-center justify-center mb-5">
        <Store size={34} className="text-muted-foreground" />
      </div>
      <h1 className="text-foreground text-xl mb-2" style={{ fontWeight: 800 }}>
        Loja não encontrada
      </h1>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
        Verifique o endereço ou fale com a UNIQ.
      </p>
    </div>
  );
}