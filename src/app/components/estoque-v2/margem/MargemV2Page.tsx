/**
 * MARGEM (V2) — leitura de margem do redesign Compro · Faço · Vendo.
 * Wireframe: tracking/Redesign_ComproVendoFaco/margem.html
 * Modelo de margem: src/app/hooks/use-margem-v2.ts (custo/preço/semaforo).
 * Filtro de período (7/30/90 dias) via est_compra: quando não há compras no
 * período (ou não há sessão), MOSTRA TUDO — regra do SPEC "se indisponível".
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, ShieldCheck, TriangleAlert } from "lucide-react";
import { useMargemV2, badgeClassDoSemaforo, type MargemItem } from "../../../hooks/use-margem-v2";
import { useCompras } from "../../../hooks/use-compras";
import { MelissaCard } from "../shared/MelissaCard";
import { brl } from "../shared/utils";
import "../shared/estoque-v2.css";

const PERIODOS = [7, 30, 90] as const;
type Periodo = (typeof PERIODOS)[number];

const ROTA_HOJE = "/estoque-v2/hoje";
const simuladorDe = (id: string) => `/estoque-v2/produtos/${id}/simulador`;

function pctTexto(frac: number | null): string {
  return frac === null ? "—" : `${Math.round(frac * 100)}%`;
}

/** Motivos textuais do card "Resolva estes" — até 2 drivers. */
function driversDeResolva(item: MargemItem): string[] {
  const drivers: string[] = [];
  if (item.custo === null) {
    drivers.push(
      item.natureza === "composto"
        ? "o custo da ficha técnica ainda não fecha — registre o preço de custo dos componentes"
        : "o custo ainda não foi registrado"
    );
  }
  if (item.preco === null) drivers.push("o preço de venda ainda não foi definido");
  if (item.custo !== null && item.preco !== null && item.margemPct !== null) {
    drivers.push(
      `preço/custo indica ${pctTexto(item.margemPct)} de margem${
        (item.margemReais ?? 0) < 0 ? ` — ${brl(Math.abs(item.margemReais ?? 0))} de prejuízo por ${item.unidade}` : ""
      }`
    );
    if (item.ultimoPrecoCompra !== null && item.custo > 0 && item.ultimoPrecoCompra > item.custo * 1.08) {
      const alta = Math.round(((item.ultimoPrecoCompra - item.custo) / item.custo) * 100);
      drivers.push(`o custo subiu ${alta}% na última compra e o preço continua o mesmo`);
    }
  }
  return drivers.slice(0, 2);
}

/** Mini sparkline SVG do histórico de custo (série de compras do próprio produto). */
function SparklineCusto({ valores, ariaLabel }: { valores: number[]; ariaLabel: string }) {
  const w = 100;
  const h = 26;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const range = max - min || 1;
  const pts = valores.map((v, i) => {
    const x = (i / (valores.length - 1)) * w;
    const y = h - 2 - ((v - min) / range) * (h - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
      style={{ width: "100%", height: 26, marginTop: 6, color: "var(--eq2-accent)", display: "block" }}
    >
      <path d={`M${pts.join(" L")} L${w},${h} L0,${h} Z`} fill="currentColor" opacity={0.25} stroke="none" />
      <polyline points={pts.join(" ")} fill="none" stroke="#2e7d43" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkeletonMargem() {
  return (
    <div aria-hidden="true">
      <div className="eq2-grid eq2-grid--2" style={{ marginBottom: 12 }}>
        <div className="eq2-skeleton" style={{ height: 120 }} />
        <div className="eq2-skeleton" style={{ height: 120 }} />
      </div>
      <div className="eq2-list">
        <div className="eq2-skeleton" style={{ height: 92 }} />
        <div className="eq2-skeleton" style={{ height: 92 }} />
        <div className="eq2-skeleton" style={{ height: 92 }} />
      </div>
    </div>
  );
}

export function MargemV2Page() {
  const navigate = useNavigate();
  const { itens, loading, error, recarregar } = useMargemV2();
  const { compras, loading: comprasLoading } = useCompras();

  const [periodo, setPeriodo] = useState<Periodo>(30);

  // Compras do período → produtos com custo "vivo" (recomprado) no recorte.
  const idsCompradosNoPeriodo = useMemo(() => {
    const corte = Date.now() - periodo * 24 * 60 * 60 * 1000;
    const ids = new Set<string>();
    for (const compra of compras) {
      const t = new Date(compra.dataCompra).getTime();
      if (Number.isFinite(t) && t >= corte) {
        for (const item of compra.itens) ids.add(item.produtoId);
      }
    }
    return ids;
  }, [compras, periodo]);

  // Série de custo por produto (valor_unitário das compras, ordem cronológica)
  const serieDeCusto = useMemo(() => {
    const mapa = new Map<string, { data: number; valor: number }[]>();
    for (const compra of compras) {
      const t = new Date(compra.dataCompra).getTime();
      if (!Number.isFinite(t)) continue;
      for (const item of compra.itens) {
        const lista = mapa.get(item.produtoId) ?? [];
        lista.push({ data: t, valor: item.valorUnitario });
        mapa.set(item.produtoId, lista);
      }
    }
    const ordenado = new Map<string, number[]>();
    for (const [id, lista] of mapa) {
      ordenado.set(id, [...lista].sort((a, b) => a.data - b.data).map((p) => p.valor));
    }
    return ordenado;
  }, [compras]);

  // "Se indisponível, mostre tudo": só filtra quando há compras no período.
  const temFiltroReal = !comprasLoading && idsCompradosNoPeriodo.size > 0;
  const itensVisiveis = temFiltroReal
    ? itens.filter((m) => idsCompradosNoPeriodo.has(m.produtoId))
    : itens;
  const itensDoFiltro = temFiltroReal ? itensVisiveis.length : itens.length;

  const comMargem = itensVisiveis.filter((m) => m.margemReais !== null && m.preco !== null && m.custo !== null);
  const sobraMedia = comMargem.length
    ? comMargem.reduce((s, m) => s + (m.margemReais ?? 0), 0) / comMargem.length
    : null;
  const pctMedio = comMargem.length
    ? comMargem.reduce((s, m) => s + (m.margemPct ?? 0), 0) / comMargem.length
    : null;
  const noVermelho = itensVisiveis.filter((m) => m.semaforo === "vermelho");

  const protege = [...comMargem]
    .filter((m) => (m.margemReais ?? 0) > 0)
    .sort((a, b) => (b.margemReais ?? 0) - (a.margemReais ?? 0))
    .slice(0, 3);

  const resolva = [...noVermelho]
    .sort((a, b) => {
      const va = a.margemReais ?? Number.NEGATIVE_INFINITY;
      const vb = b.margemReais ?? Number.NEGATIVE_INFINITY;
      return va - vb;
    })
    .slice(0, 3);

  return (
    <div className="eq2">
      <div className="eq2-shell">
        <header className="eq2-bar">
          <a
            className="eq2-back"
            href={ROTA_HOJE}
            aria-label="Ir para Hoje"
            onClick={(e) => {
              e.preventDefault();
              navigate(ROTA_HOJE);
            }}
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </a>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="eq2-bar__title">Margem</h1>
            <p className="eq2-bar__sub">Quanto sobra de cada venda</p>
          </div>
        </header>

        <main>
          {/* Segmented fake — Vendo é a área atual */}
          <div className="eq2-segmented" role="group" aria-label="Modo da base" style={{ margin: "12px 0 16px" }}>
            <button type="button" style={{ minHeight: 44 }} onClick={() => navigate("/estoque-v2/insumos")}>Compro</button>
            <button type="button" style={{ minHeight: 44 }} onClick={() => navigate("/estoque-v2/producao")}>Faço</button>
            <button type="button" className="is-active" style={{ minHeight: 44 }} aria-pressed="true">Vendo</button>
          </div>

          {/* Filtro de período */}
          <div role="group" aria-label="Escolher período" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {PERIODOS.map((p) => (
              <button
                key={p}
                type="button"
                className={`eq2-chip${periodo === p ? " is-active" : ""}`}
                style={{ minHeight: 44 }}
                aria-pressed={periodo === p}
                onClick={() => setPeriodo(p)}
              >
                {p} dias
              </button>
            ))}
          </div>

          {error ? (
            <div className="eq2-state" role="alert">
              <span className="eq2-state__emoji" aria-hidden="true">⚠️</span>
              <p className="eq2-state__title">Não foi possível carregar</p>
              <p>Veja se a internet está funcionando e tente de novo.</p>
              <button type="button" className="eq2-btn eq2-btn--secondary" onClick={recarregar}>
                Tente de novo
              </button>
            </div>
          ) : loading ? (
            <SkeletonMargem />
          ) : itens.length === 0 ? (
            <div className="eq2-state">
              <span className="eq2-state__emoji" aria-hidden="true">📈</span>
              <p className="eq2-state__title">Nada para mostrar ainda</p>
              <p>Assim que você cadastrar produtos com preço e custo, a sobra de cada venda aparece aqui.</p>
            </div>
          ) : itensDoFiltro === 0 ? (
            <div className="eq2-state">
              <span className="eq2-state__emoji" aria-hidden="true">🗓️</span>
              <p className="eq2-state__title">Nenhuma compra nos últimos {periodo} dias</p>
              <p>Nenhum produto do seu catálogo teve insumo recomprado neste período. Tente um período maior.</p>
              <button type="button" className="eq2-btn eq2-btn--secondary" onClick={() => setPeriodo(90)}>
                Ver 90 dias
              </button>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="eq2-grid eq2-grid--2" style={{ marginBottom: 4 }}>
                <div className="eq2-card eq2-card--static">
                  <p className="eq2-card__meta">Sobra média</p>
                  <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: "4px 0 0" }}>
                    {sobraMedia === null ? "—" : brl(sobraMedia)}
                  </p>
                  <p className="eq2-card__meta">por unidade vendida</p>
                  <span className={pctMedio !== null && pctMedio >= 0.3 ? "eq2-badge eq2-badge--ok" : "eq2-badge eq2-badge--low"} style={{ marginTop: 8 }}>
                    {pctMedio === null ? "sem dados" : `${pctTexto(pctMedio)} do preço`}
                  </span>
                </div>
                <div className="eq2-card eq2-card--static">
                  <p className="eq2-card__meta">No vermelho</p>
                  <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: "4px 0 0" }}>
                    {noVermelho.length}
                  </p>
                  <p className="eq2-card__meta">{noVermelho.length === 1 ? "produto" : "produtos"} dando prejuízo ou apertado</p>
                  <span className="eq2-badge eq2-badge--low" style={{ marginTop: 8 }}>resolver primeiro</span>
                </div>
              </div>

              {temFiltroReal && (
                <p style={{ fontSize: 11, color: "var(--eq2-muted)", margin: "6px 2px 0" }}>
                  Mostrando os {itensDoFiltro} produtos com recompra nos últimos {periodo} dias.
                </p>
              )}

              {/* Melissa */}
              <div style={{ margin: "16px 0 4px" }}>
                <MelissaCard
                  msg={
                    pctMedio === null
                      ? "Ainda não consigo calcular a sobra — registre custo e preço dos produtos que eu refaço a conta."
                      : `De cada R$ 100 vendidos, sobram R$ ${Math.round(pctMedio * 100)} para você.`
                  }
                  actionLabel={resolva.length > 0 ? "Resolver agora" : "Ver produtos"}
                  onAction={() =>
                    resolva.length > 0
                      ? navigate(simuladorDe(resolva[0].produtoId))
                      : protege.length > 0
                        ? navigate(simuladorDe(protege[0].produtoId))
                        : navigate(ROTA_HOJE)
                  }
                />
              </div>

              {/* PROTEJA ESTES */}
              <h2 className="eq2-section-title">Proteja estes</h2>
              <p style={{ fontSize: 12, color: "var(--eq2-muted)", margin: "0 2px 10px" }}>
                Quem mais coloca dinheiro no seu bolso por unidade vendida.
              </p>
              {protege.length === 0 ? (
                <div className="eq2-card eq2-card--static">
                  <p className="eq2-card__meta">
                    <ShieldCheck size={14} aria-hidden="true" style={{ display: "inline", verticalAlign: -2, marginRight: 6 }} />
                    Nenhum produto com sobra positiva neste recorte — ajuste os preços abaixo.
                  </p>
                </div>
              ) : (
                <div className="eq2-list">
                  {protege.map((m) => {
                    const serie = serieDeCusto.get(m.produtoId) ?? [];
                    return (
                      <div key={m.produtoId} className="eq2-card" onClick={() => navigate(simuladorDe(m.produtoId))}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ minWidth: 0 }}>
                            <p className="eq2-card__name" style={{ fontSize: 15 }}>{m.nome}</p>
                            <p className="eq2-card__meta" style={{ marginTop: 4 }}>
                              Vendido a {brl(m.preco)} · custo {brl(m.custo)}
                            </p>
                            {serie.length >= 2 && (
                              <SparklineCusto
                                valores={serie.slice(-8)}
                                ariaLabel={`Histórico de custo de ${m.nome} nas últimas compras`}
                              />
                            )}
                          </div>
                          <span className="eq2-badge eq2-badge--ok" style={{ flex: "none" }}>
                            <ArrowRight size={10} aria-hidden="true" style={{ transform: "rotate(-90deg)" }} />
                            {brl(m.margemReais)}
                            <span style={{ fontWeight: 500, marginLeft: 2 }}>sobra/un</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* RESOLVA ESTES */}
              <h2 className="eq2-section-title">Resolva estes</h2>
              <p style={{ fontSize: 12, color: "var(--eq2-muted)", margin: "0 2px 10px" }}>
                Estes estão no vermelho. Um ajuste de preço resolve.
              </p>
              {resolva.length === 0 ? (
                <div className="eq2-card eq2-card--static">
                  <p className="eq2-card__meta">
                    Nenhum produto no vermelho neste recorte. Continue protegendo os preços acima.
                  </p>
                </div>
              ) : (
                <div className="eq2-list">
                  {resolva.map((m) => (
                    <div key={m.produtoId} className="eq2-card eq2-card--static">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="eq2-card__name" style={{ fontSize: 15 }}>{m.nome}</p>
                          <span className={badgeClassDoSemaforo("vermelho")} style={{ marginTop: 6 }}>
                            <TriangleAlert size={10} aria-hidden="true" />
                            {m.margemReais !== null && m.margemReais < 0
                              ? `no prejuízo ${brl(m.margemReais)} por ${m.unidade}`
                              : `margem ${pctTexto(m.margemPct)} — abaixo do seguro`}
                          </span>
                          {driversDeResolva(m).map((d) => (
                            <p key={d} className="eq2-card__meta" style={{ marginTop: 6, fontSize: 12 }}>
                              <strong style={{ color: "var(--eq2-ink)" }}>{d}</strong>
                            </p>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="eq2-btn eq2-btn--secondary"
                          style={{ flex: "none" }}
                          onClick={() => navigate(simuladorDe(m.produtoId))}
                        >
                          Ajustar preço
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
