/**
 * SIMULADOR DE PREÇO (V2) — leitura + um único write (preco_varejo).
 * Wireframe: tracking/Redesign_ComproVendoFaco/produto-simulador-preco.html
 * Rota: /estoque-v2/produtos/:id/simulador
 * Sem sessão: dados do mock local (demo) e "Aplicar preço" desabilitado.
 */
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Info, Lightbulb, RefreshCw } from "lucide-react";
import { useMargemProdutoV2 } from "../../../hooks/use-margem-v2";
import { MelissaCard } from "../shared/MelissaCard";
import { SegmentedNav } from "../shared/SegmentedNav";
import { brl } from "../shared/utils";
import "../shared/estoque-v2.css";

const ROTA_MARGEM = "/estoque-v2/margem";
const MARGEM_MIN = 20;
const MARGEM_MAX = 80;

function arredondar2(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Margem inicial do slider: a atual (se conhecida) ou 60% (meta verde). */
function margemInicial(pct: number | null): number {
  if (pct === null) return 60;
  const p = Math.round(pct * 100);
  return Math.min(MARGEM_MAX, Math.max(MARGEM_MIN, p));
}

export function SimuladorV2Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { produto, loading, error, isFallback, podeAplicar, aplicarPrecoSugerido, recarregar } =
    useMargemProdutoV2(id);

  const [margemSlider, setMargemSlider] = useState<number | null>(null);
  const [aplicando, setAplicando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const margem = margemSlider ?? margemInicial(produto?.margemPct ?? null);
  const fracao = margem / 100;

  const simulacao = useMemo(() => {
    const custo = produto?.custo ?? null;
    if (custo === null) return null;
    const precoSugerido = arredondar2(custo / (1 - fracao));
    const sobra = arredondar2(precoSugerido - custo);
    const pctReal = precoSugerido > 0 ? Math.round((sobra / precoSugerido) * 100) : margem;
    return { precoSugerido, sobra, pctReal };
  }, [produto, fracao, margem]);

  const precoAtual = produto?.precoPraticado ?? null;
  const abaixoDoSugerido =
    simulacao !== null && precoAtual !== null && precoAtual < simulacao.precoSugerido
      ? arredondar2(simulacao.precoSugerido - precoAtual)
      : null;

  // ---------- estados ----------
  if (loading) {
    return (
      <div className="eq2">
        <div className="eq2-shell">
          <header className="eq2-bar">
            <span className="eq2-back" aria-hidden="true"><ArrowLeft size={20} /></span>
            <h1 className="eq2-bar__title">Simulador de preço</h1>
          </header>
          <div className="eq2-list" aria-hidden="true" style={{ marginTop: 16 }}>
            <div className="eq2-skeleton" style={{ height: 200 }} />
            <div className="eq2-skeleton" style={{ height: 110 }} />
            <div className="eq2-skeleton" style={{ height: 80 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eq2">
        <div className="eq2-shell">
          <header className="eq2-bar">
            <button type="button" className="eq2-back" onClick={() => navigate(ROTA_MARGEM)} aria-label="Voltar para Margem">
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <h1 className="eq2-bar__title">Simulador de preço</h1>
          </header>
          <div className="eq2-state" role="alert">
            <span className="eq2-state__emoji" aria-hidden="true">⚠️</span>
            <p className="eq2-state__title">Não foi possível carregar</p>
            <p>Veja se a internet está funcionando e tente de novo.</p>
            <button type="button" className="eq2-btn eq2-btn--secondary" onClick={recarregar}>
              Tente de novo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="eq2">
        <div className="eq2-shell">
          <header className="eq2-bar">
            <button type="button" className="eq2-back" onClick={() => navigate(ROTA_MARGEM)} aria-label="Voltar para Margem">
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <h1 className="eq2-bar__title">Simulador de preço</h1>
          </header>
          <div className="eq2-state">
            <span className="eq2-state__emoji" aria-hidden="true">🔍</span>
            <p className="eq2-state__title">Produto não encontrado</p>
            <p>Este produto não existe na sua base. Volte para a Margem e escolha outro.</p>
            <button type="button" className="eq2-btn eq2-btn--secondary" onClick={() => navigate(ROTA_MARGEM)}>
              Voltar para Margem
            </button>
          </div>
        </div>
      </div>
    );
  }

  const aoAplicar = async () => {
    if (!simulacao) return;
    setAplicando(true);
    setFeedback(null);
    const resultado = await aplicarPrecoSugerido(simulacao.precoSugerido);
    setAplicando(false);
    if (resultado.success) {
      setFeedback({ tipo: "ok", texto: `Preço de ${brl(simulacao.precoSugerido)} aplicado a ${produto.nome}.` });
      recarregar();
    } else {
      setFeedback({ tipo: "erro", texto: resultado.error || "Não foi possível aplicar o preço." });
    }
  };

  return (
    <div className="eq2">
      <div className="eq2-shell" style={{ paddingBottom: 140 }}>
        <header className="eq2-bar">
          <button type="button" className="eq2-back" onClick={() => navigate(ROTA_MARGEM)} aria-label="Voltar para Margem">
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="eq2-bar__title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {produto.nome}
            </h1>
            <p className="eq2-bar__sub">Vendo · simulador de preço</p>
          </div>
        </header>

        <main>
          {/* Compro · Faço · Vendo — área atual: Vendo. Nas telas de estado
              (loading/erro/não-encontrado) o segmented fica de fora para não
              poluir a imersão do simulador. */}
          <SegmentedNav ativo="vendo" style={{ margin: "12px 0 0" }} />

          {/* ---------- Herói: custo + preço praticado + sugestão ---------- */}
          <section className="eq2-card eq2-card--static" style={{ marginTop: 16 }} aria-label="Resumo do produto">
            <p className="eq2-card__meta">Custo por {produto.unidade}{produto.custoVemDaFicha ? " (ficha técnica)" : ""}</p>
            <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: "2px 0 0" }}>
              {produto.custo === null ? "custo pendente" : brl(produto.custo)}
            </p>

            <hr style={{ height: 1, background: "var(--eq2-border)", border: 0, margin: "12px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10 }}>
              <div>
                <p className="eq2-card__meta">Preço praticado hoje</p>
                <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", margin: "2px 0 0" }}>
                  {precoAtual === null ? "sem preço" : brl(precoAtual)}
                </p>
              </div>
              {produto.margemPct !== null && (
                <span
                  className={
                    produto.semaforo === "verde"
                      ? "eq2-badge eq2-badge--ok"
                      : produto.semaforo === "amarelo"
                        ? "eq2-badge eq2-badge--estimado"
                        : "eq2-badge eq2-badge--low"
                  }
                >
                  {produto.margemReais !== null && produto.margemReais >= 0
                    ? `sobram ${Math.round(produto.margemPct * 100)}% hoje · ${brl(produto.margemReais)}`
                    : `margem ${Math.round(produto.margemPct * 100)}% — apertado`}
                </span>
              )}
            </div>

            {simulacao && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  marginTop: 14,
                  background: "#f0f7f1",
                  border: "1px solid color-mix(in srgb, var(--eq2-accent) 45%, #fff)",
                  borderRadius: "var(--eq2-radius)",
                  padding: 14,
                }}
              >
                <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#2e7d43" }}>
                  <Lightbulb size={15} aria-hidden="true" />
                  Sugestão para você
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.5, marginTop: 6 }}>
                  Se cobrar <strong>{brl(simulacao.precoSugerido)}</strong>, sobram{" "}
                  <strong>{brl(simulacao.sobra)}</strong> por {produto.unidade} —{" "}
                  <strong>{simulacao.pctReal}%</strong>
                </p>
              </div>
            )}
          </section>

          {/* ---------- Slider de margem ---------- */}
          {produto.custo !== null ? (
            <section className="eq2-card eq2-card--static" style={{ marginTop: 12 }} aria-label="Simulador de margem">
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <label htmlFor="eq2-margem-slider" style={{ fontSize: 12, fontWeight: 600, color: "var(--eq2-muted)" }}>
                  Margem desejada
                </label>
                <output htmlFor="eq2-margem-slider" style={{ fontSize: 20, fontWeight: 700, color: "#2e7d43" }}>
                  {margem}%
                </output>
              </div>
              <input
                id="eq2-margem-slider"
                type="range"
                min={MARGEM_MIN}
                max={MARGEM_MAX}
                step={1}
                value={margem}
                onChange={(e) => setMargemSlider(Number(e.target.value))}
                aria-valuetext={`${margem}% de margem, preço ${simulacao ? brl(simulacao.precoSugerido) : "—"}`}
                style={{ width: "100%", minHeight: 44, accentColor: "var(--eq2-accent)", marginTop: 6 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--eq2-muted)" }} aria-hidden="true">
                <span>20%</span>
                <span>50%</span>
                <span>80%</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--eq2-muted)", marginTop: 8 }}>
                Arraste para ver o preço mudar na hora. Preço = custo ÷ (1 − margem).
              </p>
            </section>
          ) : (
            <div className="eq2-state">
              <span className="eq2-state__emoji" aria-hidden="true">🧾</span>
              <p className="eq2-state__title">Sem custo calculado ainda</p>
              <p>
                {produto.natureza === "composto"
                  ? "Registre a ficha técnica com o preço de custo dos ingredientes e a Melissa monta o custo desta tela para você."
                  : "Registre o preço de custo deste produto para a simulação funcionar."}
              </p>
            </div>
          )}

          {/* ---------- Recibo da fórmula (a conta visível) ---------- */}
          {simulacao && (
            <div className="eq2-receipt" style={{ marginTop: 12 }}>
              <div>
                Custo por {produto.unidade}: <strong>{brl(produto.custo)}</strong>
              </div>
              <div>
                Fórmula: preço = custo ÷ (1 − margem)
              </div>
              <div>
                {brl(produto.custo)} ÷ (1 − {fracao.toFixed(2).replace(".", ",")}) ={" "}
                <strong>{brl(simulacao.precoSugerido)}</strong>
              </div>
              <div>
                Sobra: {brl(simulacao.precoSugerido)} − {brl(produto.custo)} ={" "}
                <strong>{brl(simulacao.sobra)}</strong> ({simulacao.pctReal}%)
              </div>
            </div>
          )}

          {/* ---------- Nota margem × markup ---------- */}
          <section className="eq2-card eq2-card--static" style={{ marginTop: 12, background: "#f7f8f7" }}>
            <p style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--eq2-muted)", lineHeight: 1.55, margin: 0 }}>
              <Info size={18} aria-hidden="true" style={{ flex: "none", marginTop: 2, color: "var(--eq2-muted)" }} />
              <span>
                Margem é o que sobra de cada R$ 100. Markup multiplica o custo.{" "}
                <strong style={{ color: "var(--eq2-ink)" }}>Não são a mesma coisa.</strong>
              </span>
            </p>
          </section>

          {/* ---------- Melissa ---------- */}
          {abaixoDoSugerido !== null && (
            <div style={{ marginTop: 16 }}>
              <MelissaCard
                msg={`Você está ${brl(abaixoDoSugerido)} abaixo do sugerido para ${margem}% de margem.`}
                actionLabel={isFallback ? undefined : "Aplicar agora"}
                onAction={isFallback ? undefined : aoAplicar}
                secondaryLabel="Entendi"
              />
            </div>
          )}
        </main>
      </div>

      {/* ---------- Bottom bar: aplicar preço ---------- */}
      {simulacao && (
        <div className="eq2-bottombar">
          <div className="eq2-bottombar__inner" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
            {feedback ? (
              <p
                role="status"
                className="eq2-receipt"
                style={{
                  textAlign: "center",
                  borderStyle: "solid",
                  background: feedback.tipo === "ok" ? "#f0f7f1" : "#fdeeee",
                  color: feedback.tipo === "ok" ? "#2e7d43" : "var(--eq2-danger)",
                  margin: 0,
                }}
              >
                {feedback.tipo === "ok" && <Check size={14} aria-hidden="true" style={{ verticalAlign: -2, marginRight: 6 }} />}
                {feedback.texto}
              </p>
            ) : (
              <p style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, color: "var(--eq2-muted)", margin: 0 }}>
                <span>
                  Novo preço: <strong style={{ color: "var(--eq2-ink)" }}>{brl(simulacao.precoSugerido)}</strong>
                </span>
                <span>
                  Sobra: <strong style={{ color: "var(--eq2-ink)" }}>{brl(simulacao.sobra)}</strong>
                </span>
              </p>
            )}
            <button
              type="button"
              className="eq2-btn eq2-btn--primary eq2-btn--block"
              disabled={!podeAplicar || aplicando}
              onClick={aoAplicar}
            >
              {aplicando ? <RefreshCw size={16} aria-hidden="true" /> : null}
              {aplicando ? "Aplicando…" : "Aplicar preço sugerido"}
            </button>
            {!podeAplicar && (
              <p style={{ fontSize: 11, color: "var(--eq2-muted)", textAlign: "center", margin: 0 }}>
                Faça login para aplicar o preço — este é um preview com dados de demonstração.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
