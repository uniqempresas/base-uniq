/**
 * Detalhe de Insumo — redesign estoque v2 (Compro).
 * Wireframe de referência: tracking/Redesign_ComproVendoFaco/insumo-detalhe.html
 *
 * Blocos: hero (nome + R$/g grande + rótulos "última compra" vs "custo médio")
 * → MelissaCard → "Como você compra" (recibo com a conta visível) → "Onde é
 * usado" (est_ficha_tecnica por componente) → histórico de preço
 * (est_recebimento + sparkline) → estoque hoje (est_movimentacao).
 * Estados: skeleton · não-encontrado · erro com retry.
 */
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Edit3,
  Package,
  RotateCcw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import "../shared/estoque-v2.css";
import { MelissaCard } from "../shared/MelissaCard";
import { SegmentedNav } from "../shared/SegmentedNav";
import { brl, formatarData, formatarQtdEstoque } from "../shared/utils";
import {
  formatarTaxa,
  taxaUnitariaInsumo,
  useInsumoV2,
  type InsumoV2,
  type RecebimentoV2,
} from "../../../hooks/use-insumos-v2";

/* ───────────────────────────── helpers de texto ───────────────────────────── */

/** Nome por extenso da unidade base — a Melissa fala "gramas", não "g". */
function palavraUnidade(unidade: string): string {
  switch (unidade) {
    case "g":
      return "gramas";
    case "ml":
      return "mililitros";
    case "kg":
      return "quilos";
    case "l":
      return "litros";
    case "un":
      return "unidades";
    default:
      return `a unidade "${unidade}"`;
  }
}

/** Custo médio com escala amigável: R$ 0,0139/g vira "R$ 13,90/kg" (padrão do design). */
function custoMedioFmt(i: InsumoV2): string | null {
  if (i.precoCusto == null || i.precoCusto <= 0) return null;
  if (i.unidade === "g") return `${brl(i.precoCusto * 1000)}/kg`;
  if (i.unidade === "ml") return `${brl(i.precoCusto * 1000)}/l`;
  return `${brl(i.precoCusto)}/${i.unidade}`;
}

const TIPO_MOV_LABEL: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
};

/* ───────────────────────────── sparkline ───────────────────────────── */

function Sparkline({ recebimentos, unidade }: { recebimentos: RecebimentoV2[]; unidade: string }) {
  const valores = recebimentos.map((r) => r.custoUnitario);
  if (valores.length < 2) return null;

  const w = 280;
  const h = 100;
  const pad = 8;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const range = max - min || Math.max(Math.abs(max), 1);

  const pts = valores.map((v, i) => ({
    x: pad + (i * (w - 2 * pad)) / (valores.length - 1),
    y: h - pad - ((v - min) / range) * (h - 2 * pad - 6),
  }));

  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const primeiro = pts[0];
  const ultimo = pts[pts.length - 1];
  const area = `${line} ${ultimo.x.toFixed(1)},${h - pad} ${primeiro.x.toFixed(1)},${h - pad}`;

  const primeiroR = recebimentos[0];
  const ultimoR = recebimentos[recebimentos.length - 1];
  const rotulo = `Gráfico do custo por ${unidade} nos últimos ${valores.length} recebimentos: de ${formatarTaxa(
    primeiroR.custoUnitario,
  )} para ${formatarTaxa(ultimoR.custoUnitario)}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={rotulo}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <polygon points={area} style={{ fill: "var(--eq2-accent)", opacity: 0.28 }} />
        <polyline
          points={line}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: "var(--eq2-accent)" }}
        />
        <circle cx={ultimo.x} cy={ultimo.y} r={4} style={{ fill: "var(--eq2-ink)", stroke: "var(--eq2-surface)", strokeWidth: 2 }} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 6, fontSize: 11, color: "var(--eq2-muted)" }}>
        <span>
          {formatarTaxa(primeiroR.custoUnitario)} · {formatarData(primeiroR.recebidoEm)}
        </span>
        <span>hoje {formatarTaxa(ultimoR.custoUnitario)}</span>
      </div>
    </div>
  );
}

/* ───────────────────────────── estados ───────────────────────────── */

function SkeletonDetalhe() {
  return (
    <div className="eq2-card eq2-card--static" aria-hidden="true" style={{ display: "grid", gap: 12 }}>
      <div className="eq2-skeleton" style={{ height: 10, width: "30%" }} />
      <div className="eq2-skeleton" style={{ height: 24, width: "55%" }} />
      <div className="eq2-skeleton" style={{ height: 30, width: "52%", borderRadius: 12 }} />
      <div className="eq2-chips">
        <div className="eq2-skeleton" style={{ height: 28, width: 120, borderRadius: 999 }} />
        <div className="eq2-skeleton" style={{ height: 28, width: 110, borderRadius: 999 }} />
      </div>
      <div className="eq2-skeleton" style={{ height: 64, borderRadius: 12 }} />
      <div className="eq2-skeleton" style={{ height: 120, borderRadius: 12 }} />
      <div className="eq2-skeleton" style={{ height: 120, borderRadius: 12 }} />
    </div>
  );
}

function EstadoErro({ titulo, mensagem, onRetry }: { titulo: string; mensagem: string; onRetry: () => void }) {
  return (
    <div className="eq2-state eq2-card eq2-card--static">
      <TriangleAlert size={32} aria-hidden="true" style={{ color: "var(--eq2-danger)" }} />
      <p className="eq2-state__title">{titulo}</p>
      <p style={{ margin: 0 }}>{mensagem}</p>
      <button type="button" className="eq2-btn eq2-btn--secondary" onClick={onRetry}>
        <RotateCcw size={16} aria-hidden="true" /> Tentar de novo
      </button>
    </div>
  );
}

/* ───────────────────────────── página ───────────────────────────── */

export function InsumoV2DetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { insumo, receitas, recebimentos, ultimaMovimentacao, loading, error, isFallback, recarregar } =
    useInsumoV2(id);
  const [calcAberto, setCalcAberto] = useState(false);

  const renderizarConteudo = () => {
    if (loading) return <SkeletonDetalhe />;

    if (error) {
      return (
        <EstadoErro
          titulo="Não foi possível carregar este insumo"
          mensagem="Sua conexão caiu. O estoque não mudou — nada se perdeu."
          onRetry={recarregar}
        />
      );
    }

    if (!insumo) {
      return (
        <div className="eq2-state eq2-card eq2-card--static">
          <Package size={32} aria-hidden="true" />
          <p className="eq2-state__title">Insumo não encontrado</p>
          <p style={{ margin: 0 }}>Ele pode ter sido desativado ou removido do catálogo.</p>
          <button type="button" className="eq2-btn eq2-btn--secondary" onClick={() => navigate("/estoque-v2/insumos")}>
            Voltar para os insumos
          </button>
        </div>
      );
    }

    const taxa = taxaUnitariaInsumo(insumo);
    const fator = insumo.fatorConversao;
    const packPreco = insumo.ultimoPrecoCompra ?? insumo.preco;
    const temConversao = fator != null && fator > 0;
    const custoMedio = custoMedioFmt(insumo);
    const baixo = insumo.estoque <= insumo.estoqueMinimo;

    // sparkline: custo unitário por recebimento, em ordem cronológica
    const valoresSpark = recebimentos.map((r) => r.custoUnitario);
    const tendencia =
      valoresSpark.length >= 2 && valoresSpark[0] > 0
        ? ((valoresSpark[valoresSpark.length - 1] - valoresSpark[0]) / valoresSpark[0]) * 100
        : null;

    return (
      <div style={{ display: "grid", gap: 20 }}>
        {/* ============================ hero ============================ */}
        <section className="eq2-card eq2-card--static">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--eq2-muted)", margin: 0 }}>
            {insumo.categoriaNome}
            {insumo.unidadeCompra
              ? ` · ${insumo.unidadeCompra}${temConversao ? ` ${formatarQtdEstoque(fator!, insumo.unidade)}` : " · conversão pendente"}`
              : ""}
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", margin: "6px 0 8px" }}>
            {insumo.nome}
          </h2>
          <p style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            {taxa ? (
              <>
                {formatarTaxa(taxa.valor)}
                <span style={{ fontSize: 17, fontWeight: 500, color: "var(--eq2-muted)", letterSpacing: 0 }}>
                  /{taxa.unidade}
                </span>
              </>
            ) : (
              "—"
            )}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {packPreco != null && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "#f4f5f4",
                  border: "1px solid var(--eq2-border)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--eq2-muted)", fontWeight: 500 }}>última compra</span>
                {brl(packPreco)}/{insumo.unidadeCompra ?? insumo.unidade}
                {insumo.ultimaCompraEm ? ` · ${formatarData(insumo.ultimaCompraEm)}` : ""}
              </span>
            )}
            {custoMedio && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "#f4f5f4",
                  border: "1px solid var(--eq2-border)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--eq2-muted)", fontWeight: 500 }}>custo médio</span>
                {custoMedio}
              </span>
            )}
          </div>

          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: "12px 0 0", fontSize: 13, color: baixo ? "var(--eq2-danger)" : "var(--eq2-muted)", fontWeight: baixo ? 600 : 400 }}>
            <Package size={16} aria-hidden="true" />
            {formatarQtdEstoque(insumo.estoque, insumo.unidade)} no estoque agora
            {baixo ? " — abaixo do mínimo" : ""}
          </p>
        </section>

        {/* ====================== Melissa (topo) ====================== */}
        {temConversao ? (
          <MelissaCard msg={`Sua receita usa ${palavraUnidade(insumo.unidade)}. Pode deixar que eu converto.`} />
        ) : (
          <MelissaCard
            msg={`Falta me dizer quanto entra em 1 ${insumo.unidadeCompra ?? "embalagem"} que você compra. Sem essa conversão eu não consigo calcular o custo por ${insumo.unidade} — complete no cadastro do insumo.`}
          />
        )}

        {/* ===================== como você compra ===================== */}
        <section aria-labelledby="titulo-compra">
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 10px" }} id="titulo-compra">
            Como você compra
          </h3>
          {temConversao && packPreco != null && taxa ? (
            <>
              <div className="eq2-receipt">
                <div>Da prateleira pro estoque</div>
                <div>
                  <strong>
                    1 {insumo.unidadeCompra ?? insumo.unidade} = {formatarQtdEstoque(fator!, insumo.unidade)} ={" "}
                    {brl(packPreco)}
                  </strong>
                </div>
                <div>
                  <strong>
                    {formatarTaxa(taxa.valor)} por {insumo.unidade}
                  </strong>
                </div>
                {calcAberto && (
                  <div style={{ borderTop: "1px dashed var(--eq2-border)", marginTop: 8, paddingTop: 8 }}>
                    <div>
                      {brl(packPreco)} ÷ {fator!.toLocaleString("pt-BR")} {insumo.unidade} = {formatarTaxa(taxa.valor)}/{insumo.unidade}
                    </div>
                    {insumo.unidade === "g" && <div>{formatarTaxa(taxa.valor)}/{insumo.unidade} × 1.000 = {brl(taxa.valor * 1000)}/kg</div>}
                    {insumo.unidade === "ml" && <div>{formatarTaxa(taxa.valor)}/{insumo.unidade} × 1.000 = {brl(taxa.valor * 1000)}/l</div>}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="eq2-btn eq2-btn--link"
                onClick={() => setCalcAberto((v) => !v)}
                aria-expanded={calcAberto}
              >
                {calcAberto ? "Ocultar cálculo" : "Ver cálculo"}
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  style={{ transform: calcAberto ? "rotate(180deg)" : undefined, transition: "transform 160ms ease" }}
                />
              </button>
            </>
          ) : temConversao ? (
            <div className="eq2-receipt">
              <div>
                <strong>
                  1 {insumo.unidadeCompra ?? insumo.unidade} = {formatarQtdEstoque(fator!, insumo.unidade)}
                </strong>
              </div>
              <div>
                <span className="eq2-badge eq2-badge--estimado">preço pendente</span>{" "}
                Registre a primeira compra e a Melissa calcula o custo por {insumo.unidade} sozinha.
              </div>
            </div>
          ) : (
            <div className="eq2-receipt">
              <div>
                Você compra em <strong>{insumo.unidadeCompra ?? "embalagem"}</strong> e guarda em{" "}
                <strong>{insumo.unidade}</strong>.
              </div>
              <div style={{ marginTop: 6 }}>
                <span className="eq2-badge eq2-badge--estimado">conversão pendente</span> Complete quanto vem em 1{" "}
                {insumo.unidadeCompra ?? "embalagem"} para o custo por {insumo.unidade} aparecer aqui.
              </div>
            </div>
          )}
        </section>

        {/* ======================== onde é usado ======================== */}
        <section className="eq2-card eq2-card--static" aria-labelledby="titulo-usado">
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }} id="titulo-usado">
            {receitas.length > 0 ? `Usado em ${receitas.length} ${receitas.length === 1 ? "receita" : "receitas"}` : "Onde é usado"}
            <span className="eq2-badge eq2-badge--ok">usada em {receitas.length}</span>
          </h3>
          {receitas.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--eq2-muted)" }}>
              Nenhuma receita usa este insumo ainda. Monte a ficha técnica de um produto e ele aparece aqui.
            </p>
          ) : (
            <div className="eq2-list">
              {receitas.map((r) => {
                const custoLinha = (taxa?.valor ?? insumo.precoCusto ?? 0) * r.quantidadePorUnidade;
                return (
                  <button
                    key={r.paiId}
                    type="button"
                    className="eq2-card eq2-card--static"
                    style={{ padding: 12, textAlign: "left", cursor: "pointer" }}
                    onClick={() => navigate(`/estoque-v2/receita/${r.paiId}`)}
                    aria-label={`Abrir ficha técnica de ${r.nome}`}
                  >
                    <div className="eq2-card__top">
                      <span className="eq2-card__icon" aria-hidden="true">
                        <BookOpen size={18} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="eq2-card__name">{r.nome}</span>
                        <div className="eq2-card__meta">
                          {formatarQtdEstoque(r.quantidadePorUnidade, insumo.unidade)} de {insumo.nome.toLowerCase()}
                        </div>
                      </span>
                      <span style={{ textAlign: "right", flex: "none" }}>
                        <div style={{ fontWeight: 700 }}>{brl(custoLinha)}</div>
                        <div style={{ fontSize: 10, color: "var(--eq2-muted)" }}>na receita</div>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ====================== histórico de preço ====================== */}
        <section className="eq2-card eq2-card--static" aria-labelledby="titulo-spark">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }} id="titulo-spark">
              Custo por {insumo.unidade}
            </h3>
            {tendencia != null && Math.abs(tendencia) >= 0.5 && (
              <span
                className={`eq2-badge ${tendencia > 0 ? "eq2-badge--low" : "eq2-badge--ok"}`}
                style={{ fontSize: 11 }}
                aria-label={
                  tendencia > 0
                    ? `custo subiu ${Math.abs(tendencia).toFixed(0)}% no período`
                    : `custo caiu ${Math.abs(tendencia).toFixed(0)}% no período`
                }
              >
                {tendencia > 0 ? <TrendingUp size={12} aria-hidden="true" /> : <TrendingDown size={12} aria-hidden="true" />}
                {tendencia > 0 ? "+" : ""}
                {tendencia.toFixed(0)}%
              </span>
            )}
          </div>

          {valoresSpark.length >= 2 ? (
            <Sparkline recebimentos={recebimentos} unidade={insumo.unidade} />
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: "var(--eq2-muted)" }}>
              {valoresSpark.length === 1
                ? "Só uma nota de compra até agora — registre a próxima e a Melissa monta o histórico sozinha."
                : "Ainda não há gráfico pra mostrar. Registre uma compra e a Melissa monta o histórico de preço sozinha."}
            </p>
          )}

          {recebimentos.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="eq2-section-title" style={{ marginTop: 0 }}>
                Notas de compra
              </div>
              <div className="eq2-list" style={{ gap: 8 }}>
                {[...recebimentos].reverse().map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, fontSize: 12 }}>
                    <span style={{ color: "var(--eq2-muted)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {formatarData(r.recebidoEm)}
                      {r.notaFiscal ? ` · ${r.notaFiscal}` : ""} · {formatarQtdEstoque(r.qtdMovimento, insumo.unidade)}
                      {r.estornado ? " · estornada" : ""}
                    </span>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {formatarTaxa(r.custoUnitario)}/{insumo.unidade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ======================= estoque hoje ======================= */}
        <section className="eq2-card eq2-card--static" aria-labelledby="titulo-hoje">
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 10px" }} id="titulo-hoje">
            Estoque hoje
          </h3>
          <p style={{ margin: 0, fontSize: 15 }}>
            <strong>{formatarQtdEstoque(insumo.estoque, insumo.unidade)}</strong> no estoque
            {insumo.estoqueMinimo > 0 && (
              <span style={{ color: "var(--eq2-muted)", fontSize: 12 }}>
                {" "}
                · mínimo {formatarQtdEstoque(insumo.estoqueMinimo, insumo.unidade)}
              </span>
            )}
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--eq2-muted)" }}>
            {ultimaMovimentacao
              ? `${TIPO_MOV_LABEL[ultimaMovimentacao.tipo] ?? ultimaMovimentacao.tipo} de ${formatarQtdEstoque(
                  ultimaMovimentacao.quantidade,
                  insumo.unidade,
                )} · ${formatarData(ultimaMovimentacao.dataMovimentacao)}${
                  ultimaMovimentacao.motivo ? ` · ${ultimaMovimentacao.motivo}` : ""
                }`
              : "Sem movimentações ainda — compras e produções registradas aparecem aqui."}
          </p>
        </section>

        {isFallback && (
          <p style={{ fontSize: 11, color: "var(--eq2-warn)", margin: 0 }}>dados de demonstração</p>
        )}
      </div>
    );
  };

  return (
    <div className="eq2">
      {/* shipped: bottombar limitada no desktop (pill flutuante centrada) —
          mobile < 900px não é afetado (largura total, rodapé colado) */}
      <style>{`
        @media (min-width: 900px) {
          .eq2-bottombar.eq2-bottombar--detalhe {
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            width: min(420px, calc(100% - 48px));
            bottom: 20px;
            padding: 10px;
            background: #ffffff;
            border: 1px solid var(--eq2-border);
            border-radius: 999px;
            box-shadow: 0 12px 32px rgba(15, 21, 33, 0.18);
          }
          .eq2-bottombar.eq2-bottombar--detalhe::before { content: none; }
        }
      `}</style>
      <div className="eq2-shell">
        <header className="eq2-bar">
          <button type="button" className="eq2-back" onClick={() => navigate(-1)} aria-label="Voltar para a lista de insumos">
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <div className="eq2-bar__title" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {loading ? "Carregando…" : insumo?.nome ?? "Insumo"}
          </div>
          <button
            type="button"
            className="eq2-btn eq2-btn--ghost"
            style={{ minHeight: 44, padding: "0 10px", flex: "none" }}
            onClick={() => navigate(`/estoque/produtos/${id}`)}
            aria-label="Editar insumo"
            disabled={!insumo}
          >
            <Edit3 size={18} aria-hidden="true" />
            <span style={{ fontSize: 13 }}>Editar</span>
          </button>
        </header>

        {/* Compro · Faço · Vendo — área atual: Compro */}
        <main style={{ paddingTop: 14, paddingBottom: insumo ? 92 : 14 }}>
          <SegmentedNav ativo="compro" />
          {renderizarConteudo()}
        </main>

        {insumo && !loading && (
          <div className="eq2-bottombar eq2-bottombar--detalhe">
            <button
              type="button"
              className="eq2-btn eq2-btn--primary"
              style={{ width: "100%" }}
              // deep-link de recompra (?insumo=): a NovaCompraV2Page pré-preenche
              // o rascunho com a última compra quando a lista chegar (mesma
              // trilha do `?insumo=` do NovaCompraPage v1)
              onClick={() => navigate(`/estoque-v2/compras/nova?insumo=${insumo.id}`)}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              Comprar de novo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InsumoV2DetalhePage;
