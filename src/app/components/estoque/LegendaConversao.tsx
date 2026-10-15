import { mesmasUnidades } from "../../lib/unidades";

/**
 * WIRE §9 — legenda de conversão permanente (contrato 2): "1 lata = 395 g".
 * Quando compra e estoque são a mesma unidade, transforma em texto simples.
 */
function formatarFator(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
}

export function LegendaConversao({
  unCompra,
  fator,
  unEstoque,
  className,
}: {
  unCompra: string;
  fator: number;
  unEstoque: string;
  className?: string;
}) {
  const texto = mesmasUnidades(unCompra, unEstoque)
    ? `1 ${unCompra} = 1 ${unEstoque}`
    : `1 ${unCompra} = ${formatarFator(fator)} ${unEstoque}`;
  return <span className={className}>{texto}</span>;
}
