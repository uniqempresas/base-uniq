/**
 * Card "COM O ESTOQUE ATUAL" — T5 do WIRE-Producao-Redesign-FluxoE2E (§4/§9).
 *
 * Até onde o estoque alcança: `máx = mínᵢ ⌊estoqueᵢ ÷ (qtd_receitaᵢ × (1+perdaᵢ))⌋`
 * — perda embutida via `perdaAplicada` + `receitasMaximas` (lib/conversao, D6).
 * Quando não alcança (máx 0), o MESMO card vira guia com o CTA que resolve a
 * ordem certa (§4 T5): compra PENDENTE cobre o faltante → receber; insumo sem
 * compra → ir comprar; componente composto sem estoque → produzir o composto.
 * Falta de custo NUNCA bloqueia o card (T5-3 — "custo se apura na produção").
 *
 * Reuso: T5 (topo da aba) e, pela lógica exportada, o chip `máx` do modal T6.
 * Zero rota nova — CTAs usam os deep-links documentados no WIRE §3.
 */
import type { CSSProperties } from "react";
import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";
import { perdaAplicada, receitasMaximas } from "../../lib/conversao";
import { formatarQtd, toReceita } from "../../lib/produto-utils";
import { qtdEstoque, type Compra, type ItemFichaTecnica } from "../../types/producao";
import type { Produto } from "../../types/produto";

/**
 * Necessário por ciclo (1 receita quando `rendimento > 0`, senão 1 unidade do
 * pai) JÁ COM a perda embutida — o mesmo número no card e no modal (D6:
 * espelhos que nunca divergem). Exportado para o chip `máx` do T6.
 */
export function necessarioPorCiclo(item: ItemFichaTecnica, rendimento: number): number {
  const base =
    rendimento > 0 ? toReceita(item.quantidadePorUnidade, rendimento) : item.quantidadePorUnidade;
  return perdaAplicada(base, item.perdaPct);
}

export interface CardMaxProduzirProps {
  produto: Produto;
  /** itens da ficha do pai (saída de `useFichaTecnica`) */
  itensFicha: ItemFichaTecnica[];
  /** estoque atual keyed por `me_produto.id` (string) do componente */
  estoques: Record<string, number>;
  /**
   * Custo médio keyed por id do componente — OPICIONAL e só informativo:
   * sem custo o card continua válido (T5-3). Nunca bloqueia por falta de preço.
   */
  precosCusto?: Record<string, number>;
  /** compras PENDENTE — cruzadas com o insumo-limite na variante de bloqueio (T5/F5) */
  comprasPendentes?: Compra[];
}

/** CTA do card/bloqueio: botão neutro do módulo, âncora com destino no texto (§8). */
function ctaEstilo(variante: "primario" | "secundario"): CSSProperties {
  return variante === "primario"
    ? { background: "#86cb92", color: "#1f2937", fontWeight: 700 }
    : { background: "#ffffff", color: "#B45309", borderColor: "#FDE68A", fontWeight: 600 };
}

export function CardMaxProduzir({
  produto,
  itensFicha,
  estoques,
  precosCusto,
  comprasPendentes = [],
}: CardMaxProduzirProps) {
  if (itensFicha.length === 0) return null;

  const rendimento = produto.rendimentoLote ?? 0;
  const modoReceita = rendimento > 0;
  const unPai = produto.unidade || "un";
  const rotuloCiclo = modoReceita ? "receita" : unPai;

  // Necessário POR CICLO com perda — card e modal com a mesma aritmética (D6).
  const requisitos = itensFicha.map((i) => ({
    componenteId: i.componenteProdutoId,
    necessario: necessarioPorCiclo(i, rendimento),
  }));
  const { max, limiteId } = receitasMaximas(requisitos, estoques);

  const limite = limiteId ? itensFicha.find((i) => i.componenteProdutoId === limiteId) ?? null : null;
  const necessarioLimite = limite ? necessarioPorCiclo(limite, rendimento) : 0;
  const baseLimite = limite
    ? modoReceita
      ? toReceita(limite.quantidadePorUnidade, rendimento)
      : limite.quantidadePorUnidade
    : 0;
  const estoqueLimite = limite ? (estoques[limite.componenteProdutoId] ?? 0) : 0;

  // "Sem custo nos insumos o card continua válido" (T5-3): só uma nota.
  const semCusto =
    !precosCusto || itensFicha.every((i) => !((precosCusto[i.componenteProdutoId] ?? 0) > 0));

  /* ── Variante OK: "dá pra produzir: N" ── */
  if (max > 0) {
    return (
      <section className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
        <h3
          className="text-[11px] uppercase tracking-wide text-[#627271]"
          style={{ fontWeight: 700 }}
        >
          Com o estoque atual
        </h3>
        <p className="mt-2 text-[#1f2937]" style={{ fontWeight: 800, fontSize: 20 }} role="status">
          {`dá pra produzir: ${formatarQtd(max)} ${rotuloCiclo}${max === 1 ? "" : "s"}`}
          {modoReceita ? (
            <span className="ml-1.5 text-sm" style={{ fontWeight: 500 }}>
              ≈ {formatarQtd(max * rendimento)} {unPai}
            </span>
          ) : null}
        </p>
        {limite ? (
          <p className="mt-0.5 text-[11px] text-[#627271]">
            limite: {limite.componenteNome} ({formatarQtd(necessarioLimite)}{" "}
            {limite.componenteUnidade}/{rotuloCiclo}, com perda)
          </p>
        ) : null}
        {semCusto ? (
          <p className="mt-0.5 text-[11px] text-[#627271]">
            custo se apura na produção
          </p>
        ) : null}
      </section>
    );
  }

  /* ── Variante de bloqueio: "ainda não dá" + CTA que resolve (F4/F5) ── */
  const ehCompostoLimite = limite?.componenteNatureza === "composto";
  const compraCobre =
    !ehCompostoLimite && limite
      ? comprasPendentes.find((c) =>
          c.itens.some((it) => it.produtoId === limite.componenteProdutoId)
        ) ?? null
      : null;
  const entraCompra =
    compraCobre && limite
      ? compraCobre.itens
          .filter((it) => it.produtoId === limite.componenteProdutoId)
          .reduce((s, it) => s + qtdEstoque(it), 0)
      : 0;
  const falta = Math.max(necessarioLimite - estoqueLimite, 0);
  const unLimite = limite?.componenteUnidade || unPai;
  const alerta = { background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309" };
  const linkCls =
    "inline-flex min-h-[40px] items-center rounded-xl border px-3.5 py-2 text-xs transition-colors hover:opacity-90";

  return (
    <section
      className="rounded-2xl border shadow-sm p-5"
      style={alerta}
      role="status"
    >
      <h3
        className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide"
        style={{ color: alerta.color, fontWeight: 700 }}
      >
        <AlertTriangle size={13} className="shrink-0" />
        Ainda não dá pra produzir
      </h3>

      {limite ? (
        <>
          <p className="mt-2 text-sm" style={{ color: alerta.color, fontWeight: 700 }}>
            {ehCompostoLimite
              ? `falta ${limite.componenteNome}: ${formatarQtd(estoqueLimite)} ${unLimite} produzíveis agora`
              : `falta ${limite.componenteNome}`}
          </p>
          {!ehCompostoLimite ? (
            <p className="mt-0.5 text-xs" style={{ color: alerta.color, fontWeight: 500 }}>
              precisa {formatarQtd(necessarioLimite)} {unLimite} p/ 1 {rotuloCiclo}
              {" "}({formatarQtd(baseLimite)} {unLimite} + {formatarQtd(limite.perdaPct)}% perda) ·
              estoque: {formatarQtd(estoqueLimite)} {unLimite}
              {compraCobre
                ? ` — mas a compra ${compraCobre.fornecedorNome} (PENDENTE) entrega ${formatarQtd(entraCompra)} ${unLimite}:`
                : falta > 0
                  ? ` — falta ${formatarQtd(falta)} ${unLimite}`
                  : ""}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {compraCobre ? (
              <>
                <Link
                  to={`/estoque/compras?receber=${compraCobre.id}`}
                  className={linkCls}
                  style={ctaEstilo("primario")}
                >
                  Receber p/ produzir
                </Link>
                <span className="text-[11px]" style={{ color: alerta.color }}>
                  ou
                </span>
                <Link
                  to={`/estoque/compras/nova?insumo=${limite.componenteProdutoId}`}
                  className={linkCls}
                  style={ctaEstilo("secundario")}
                >
                  Ir comprar →
                </Link>
              </>
            ) : ehCompostoLimite ? (
              <Link
                to={`/estoque/produtos/${limite.componenteProdutoId}?aba=producao`}
                className={linkCls}
                style={ctaEstilo("primario")}
              >
                {`Produzir o ${limite.componenteNome} →`}
              </Link>
            ) : (
              <Link
                to={`/estoque/compras/nova?insumo=${limite.componenteProdutoId}`}
                className={linkCls}
                style={ctaEstilo("primario")}
              >
                {`Comprar mais ${limite.componenteNome} →`}
              </Link>
            )}
          </div>
        </>
      ) : (
        <p className="mt-2 text-xs" style={{ color: alerta.color, fontWeight: 600 }}>
          a ficha não define consumo por {rotuloCiclo} — revise a ficha técnica
        </p>
      )}
    </section>
  );
}
