import { format } from "date-fns";

/**
 * Formata a `data` (ISO) de uma `MovimentacaoEstoque` para as telas de estoque.
 * Defensivo: linha com data inválida (dado legado/manual) cai no texto bruto
 * em vez de "Invalid Date".
 */
export function formatarDataMovimentacao(iso: string): { data: string; hora: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { data: iso, hora: "" };
  return { data: format(d, "dd/MM/yyyy"), hora: format(d, "HH:mm") };
}
