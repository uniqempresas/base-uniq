/**
 * Cálculos de conversão e perda do WIRE-Producao-Redesign (T2/T5/T6) —
 * aritmética pura de tela; as regras de negócio continuam no banco
 * (média ponderada no recebimento, baixa com perda na produção).
 */

/**
 * Quantidade por receita JÁ COM a perda embutida: `qtd × (1 + perda%)`.
 * É o número que a produção cobra de estoque por componente (F4).
 */
export function perdaAplicada(quantidade: number, perdaPct: number): number {
  const valor = quantidade * (1 + (perdaPct || 0) / 100);
  return Math.round(valor * 1000) / 1000;
}

/**
 * Quanto do estoque alcança (T5/T6): mínimo dos pisos
 * ⌊estoque ÷ necessário⌋. `necessario` deve chegar já com perda
 * (via perdaAplicada). Componente sem estoque na lista = 0 (bloqueia).
 */
export interface RequisitoComponente {
  componenteId: string;
  /** quantidade por receita, já com perda (perdaAplicada) */
  necessario: number;
}

export function receitasMaximas(
  requisitos: RequisitoComponente[],
  estoques: Record<string, number>,
): { max: number; limiteId: string | null } {
  let max = Number.POSITIVE_INFINITY;
  let limiteId: string | null = null;
  for (const { componenteId, necessario } of requisitos) {
    if (!(necessario > 0)) continue; // demanda zero nunca é limite
    const disponivel = estoques[componenteId] ?? 0;
    const alcance = Math.floor(disponivel / necessario);
    if (alcance < max) {
      max = alcance;
      limiteId = componenteId;
    }
  }
  if (!Number.isFinite(max)) return { max: 0, limiteId: null };
  return { max, limiteId };
}
