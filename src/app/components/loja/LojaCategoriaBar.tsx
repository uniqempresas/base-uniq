import type { CategoriaLoja } from "../../types/loja";

export interface LojaCategoriaBarProps {
  categorias: CategoriaLoja[];
  /** `null` = "Tudo" */
  ativa: number | null;
  onSelecionar: (id: number | null) => void;
}

/**
 * Trilha horizontal de categorias reais (WIRE-LojaVirtual-VitrineModerna bloco ⑤).
 * Não renderiza quando não há categoria com produto — nunca trilha vazia.
 */
export function LojaCategoriaBar({ categorias, ativa, onSelecionar }: LojaCategoriaBarProps) {
  if (categorias.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Categorias de produto"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Chip rotulo="Tudo" ativo={ativa === null} onClick={() => onSelecionar(null)} />
      {categorias.map((c) => (
        <Chip
          key={c.id}
          rotulo={c.nome}
          ativo={ativa === c.id}
          onClick={() => onSelecionar(c.id)}
        />
      ))}
    </div>
  );
}

function Chip({ rotulo, ativo, onClick }: { rotulo: string; ativo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className="shrink-0 whitespace-nowrap rounded-lg border px-3.5 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#86cb92]/40 focus-visible:outline-none"
      style={{
        background: ativo ? "#86cb92" : "#ffffff",
        borderColor: ativo ? "#86cb92" : "#efefef",
        color: ativo ? "#1f2937" : "#627271",
        fontWeight: ativo ? 700 : 500,
        minHeight: "44px",
      }}
    >
      {rotulo}
    </button>
  );
}
