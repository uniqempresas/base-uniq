export function brl(v: number | null | undefined): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
}

export function custoBaseFmt(
  custo: number | null | undefined,
  unidadeBase: string | null | undefined,
): string {
  if (custo == null || !unidadeBase) return "custo pendente";
  return `${brl(custo)}/${unidadeBase}`;
}

export function formatarQtdEstoque(valor: number, unidade: string | null | undefined): string {
  const un = unidade ?? "un";
  if (un === "g" && valor >= 1000) return `${(valor / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`;
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${un}`;
}

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export type UnidadeCompraOption = { sigla: string; label: string };

/* Unidades de compra amigáveis (o leigo fala em lata, pacote, caixa, dúzia) */
export const UNIDADES_COMPRA: UnidadeCompraOption[] = [
  { sigla: "lata", label: "Lata" },
  { sigla: "pacote", label: "Pacote" },
  { sigla: "caixa", label: "Caixa" },
  { sigla: "saco", label: "Saco" },
  { sigla: "fardo", label: "Fardo" },
  { sigla: "dúzia", label: "Dúzia" },
  { sigla: "kg", label: "Quilo" },
  { sigla: "g", label: "Grama" },
  { sigla: "l", label: "Litro" },
  { sigla: "ml", label: "Mililitro" },
  { sigla: "un", label: "Unidade" },
];

export function precoUnitarioBase(precoCusto: number | null | undefined, fatorConversao: number | null | undefined): number | null {
  if (precoCusto == null || fatorConversao == null || fatorConversao <= 0) return null;
  return precoCusto / fatorConversao;
}
