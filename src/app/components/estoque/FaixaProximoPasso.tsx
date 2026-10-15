import { Link } from "react-router";

/**
 * WIRE §9 — banda "o próximo passo está aqui" (T1–T4): depois de salvar/
 * receber, em vez de fechar seco, aponta o passo seguinte da esteira.
 * Texto seco e grounded; CTA com destino no rótulo (nunca "clique aqui").
 */
export interface AcaoProximoPasso {
  label: string;
  href: string;
}

export function FaixaProximoPasso({
  titulo,
  descricao,
  acoes = [],
  onClose,
}: {
  titulo: string;
  descricao?: string;
  acoes?: AcaoProximoPasso[];
  onClose?: () => void;
}) {
  return (
    <div role="status" aria-live="polite" className="rounded-lg border p-3 text-sm">
      <p className="font-medium">{titulo}</p>
      {descricao ? <p className="mt-1 text-muted-foreground">{descricao}</p> : null}
      {acoes.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {acoes.map((acao) => (
            <Link
              key={`${acao.href}-${acao.label}`}
              to={acao.href}
              onClick={onClose}
              className="rounded-md border px-3 py-1.5 font-medium"
            >
              {acao.label}
            </Link>
          ))}
        </div>
      ) : null}
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="mt-2 text-sm text-muted-foreground underline"
        >
          fechar
        </button>
      ) : null}
    </div>
  );
}
