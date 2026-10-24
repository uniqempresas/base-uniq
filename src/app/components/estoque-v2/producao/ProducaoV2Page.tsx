/**
 * Produção — "Faço" (redesign Compro·Faço·Vendo, estoque v2).
 *
 * Porte do wireframe `tracking/Redesign_ComproVendoFaco/producao.html` em React:
 * lista de compostos com stepper de lotes, PRÉ-VISUALIZAÇÃO do consumo (a conta
 * visível: "faltam 120 g ≈ 1 lata"), confirmação em bottom sheet, resultado em
 * receipt ("saiu X → entrou N") e ordens recentes com badge de status.
 *
 * Sem sessão (modo demo): a pré-visualização funciona com dataset local do hook;
 * o botão "Produzir" fica desabilitado com hint. A gravação é client-side
 * sequencial (decisão do v2) — falha no meio vira alerta "produção parcial".
 *
 * Rota (montagem em routes.tsx por outra task): `/estoque-v2/producao`.
 */
import { useId, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChefHat,
  ClipboardList,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import "../shared/estoque-v2.css";
import { MelissaCard } from "../shared/MelissaCard";
import { brl, formatarData } from "../shared/utils";
import { formatarQtd } from "../../../lib/produto-utils";
import { brlSmart } from "../../../hooks/use-receitas-v2";
import {
  calcularConsumos,
  custoPorUnidadeAcabado,
  lotesMaximos,
  textoFalta,
  useProducaoV2,
  type ProducaoComposto,
  type ProduzirResultado,
} from "../../../hooks/use-producao-v2";

const ROTA_COMPRA_NOVA = "/estoque-v2/compras/nova";
const ROTA_RECEITA = (id: string) => `/estoque-v2/receita/${id}`;

/* ───────────────────────────── componentes locais ───────────────────────────── */

function Eq2Stepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const id = useId();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <label htmlFor={id} style={{ fontSize: 14, fontWeight: 500, flex: 1, minWidth: 150 }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          className="eq2-back"
          aria-label="Diminuir quantidade"
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          <Minus size={18} />
        </button>
        <input
          id={id}
          className="eq2-input"
          type="text"
          inputMode="numeric"
          aria-label={label}
          value={String(value)}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
            onChange(Number.isFinite(n) && n >= 1 ? Math.min(99, n) : 1);
          }}
          style={{ width: 64, textAlign: "center" }}
        />
        <button
          type="button"
          className="eq2-back"
          aria-label="Aumentar quantidade"
          onClick={() => onChange(Math.min(99, value + 1))}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

/** Linha do sheet ("saiu / entrou") no espírito do wireframe. */
function MoveLine({
  dir,
  children,
  alerta,
}: {
  dir: "sai" | "entra";
  children: ReactNode;
  alerta?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        minHeight: 44,
        padding: "4px 0",
        borderBottom: "1px solid var(--eq2-border)",
        fontSize: 14,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: dir === "entra" ? "#e9f6ec" : alerta ? "#fdeeee" : "#f0f3f1",
          color: dir === "entra" ? "#2e7d43" : alerta ? "var(--eq2-danger)" : "var(--eq2-muted)",
        }}
      >
        {dir === "entra" ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>{children}</span>
    </div>
  );
}

/* ─────────────────────────────── página ─────────────────────────────── */

interface AlvoConfirmacao {
  composto: ProducaoComposto;
  lotes: number;
}

interface ResumoResultado {
  composto: ProducaoComposto;
  lotes: number;
  resultado: ProduzirResultado;
}

export function ProducaoV2Page() {
  const navigate = useNavigate();
  const {
    compostos,
    ordens,
    loading,
    error,
    temSessao,
    isFallback,
    produzindo,
    recarregar,
    produzir,
  } = useProducaoV2();

  const [lotes, setLotes] = useState<Record<string, number>>({});
  const [confirmar, setConfirmar] = useState<AlvoConfirmacao | null>(null);
  const [resumo, setResumo] = useState<ResumoResultado | null>(null);
  const [parcial, setParcial] = useState<{ etapa?: string; error: string } | null>(null);

  const lotesDe = (c: ProducaoComposto) => lotes[c.id] ?? 1;
  const definirLotes = (c: ProducaoComposto, v: number) => setLotes((prev) => ({ ...prev, [c.id]: v }));

  /* ---- produção parcial → alerta ---- */
  const onParcial = (etapa?: string, mensagem?: string) => {
    setParcial({ etapa, error: mensagem ?? "erro desconhecido" });
    toast.error("Produção parcial", {
      description: "Parte da produção foi gravada e parte não. Confira o estoque antes de tentar de novo.",
    });
  };

  const abrirConfirmacao = (c: ProducaoComposto) => {
    setParcial(null);
    setConfirmar({ composto: c, lotes: lotesDe(c) });
  };

  const confirmarProducao = async () => {
    if (!confirmar) return;
    const r = await produzir(confirmar.composto, confirmar.lotes);
    if (!r.ok) {
      if (r.parcial) onParcial(r.etapa, r.error);
      else toast.error(r.error ?? "Não foi possível registrar a produção.");
      return;
    }
    setResumo({ composto: confirmar.composto, lotes: confirmar.lotes, resultado: r });
    setConfirmar(null);
    setParcial(null);
  };

  /* ---- faltas para a Melissa (1º composto com falta no lote escolhido) ---- */
  const melissa = (() => {
    for (const c of compostos) {
      if (c.itens.length === 0) continue;
      const faltante = calcularConsumos(c, lotesDe(c)).find((x) => !x.suficiente);
      if (faltante) {
        return {
          msg: `${textoFalta(faltante).replace(/^faltam/, "Faltam")} de ${faltante.item.nome.toLowerCase()}. Quer registrar a compra?`,
          comAcao: true,
        };
      }
    }
    if (compostos.length === 0) return null;
    return {
      msg: "Escolha quantas receitas você quer fazer — antes de confirmar, eu mostro exatamente o que sai do seu estoque.",
      comAcao: false,
    };
  })();

  /* ───────────────────────────── render ───────────────────────────── */

  return (
    <div className="eq2">
      <div className="eq2-shell" style={{ paddingBottom: "calc(48px + env(safe-area-inset-bottom, 0px))" }}>
        <header className="eq2-bar">
          <button type="button" className="eq2-back" aria-label="Voltar" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eq2-bar__title">Produção</div>
            <div className="eq2-bar__sub">Faço — o que dá para produzir agora</div>
          </div>
          {isFallback && <span className="eq2-badge eq2-badge--estimado">modo demo</span>}
          {temSessao && !loading && !error && <span className="eq2-badge eq2-badge--ok"><Check size={12} aria-hidden="true" /> estoque de hoje</span>}
        </header>

        {/* ---------- estados ---------- */}
        {loading && (
          <section aria-label="Carregando a lista de produção" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <div className="eq2-skeleton" style={{ height: 170 }} />
            <div className="eq2-skeleton" style={{ height: 170 }} />
            <p style={{ color: "var(--eq2-muted)", fontSize: 12 }}>Carregando o que dá para produzir…</p>
          </section>
        )}

        {!loading && error && (
          <section className="eq2-card eq2-card--static" style={{ marginTop: 16 }} aria-label="Erro ao carregar estoque">
            <div className="eq2-state">
              <AlertTriangle size={34} color="var(--eq2-danger)" aria-hidden="true" />
              <p className="eq2-state__title">O estoque não carregou</p>
              <p>Suas receitas e compras estão guardadas na sua conta. Confira a internet e tente de novo.</p>
              <button type="button" className="eq2-btn eq2-btn--secondary" onClick={recarregar}>
                Tentar de novo
              </button>
            </div>
          </section>
        )}

        {!loading && !error && temSessao && compostos.length === 0 && (
          <section className="eq2-card eq2-card--static" style={{ marginTop: 16 }} aria-label="Sem receitas cadastradas">
            <div className="eq2-state">
              <ChefHat size={34} aria-hidden="true" />
              <p className="eq2-state__title">Nenhuma receita ainda</p>
              <p>Cadastre a primeira receita (com os ingredientes) para ela aparecer aqui pronta para produzir.</p>
            </div>
          </section>
        )}

        {!loading && !error && (
          <p className="eq2-section-title" style={{ marginTop: 20 }}>
            O que você pode produzir agora
          </p>
        )}

        {/* ---------- cards de produção ---------- */}
        {!loading &&
          compostos.map((c) => {
            const nLotes = lotesDe(c);
            const rendimento = c.rendimentoLote && c.rendimentoLote > 0 ? c.rendimentoLote : 1;
            const consumos = calcularConsumos(c, nLotes);
            const faltantes = consumos.filter((x) => !x.suficiente);
            const max = c.itens.length > 0 ? lotesMaximos(c) : { max: 0, limiteId: null };
            const custoUn = custoPorUnidadeAcabado(c);
            const semFicha = c.itens.length === 0;

            return (
              <section
                key={c.id}
                className="eq2-card eq2-card--static"
                style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}
                aria-label={`Produzir ${c.nome}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="eq2-card__icon" aria-hidden="true">
                    <ChefHat size={20} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflowWrap: "anywhere" }}>{c.nome}</div>
                    <div className="eq2-card__meta">
                      rende {formatarQtd(rendimento)} {c.unidade} · no estoque: {formatarQtd(c.estoqueAtual)} {c.unidade}
                    </div>
                  </div>
                  {semFicha ? (
                    <span className="eq2-badge eq2-badge--estimado">sem ficha</span>
                  ) : faltantes.length > 0 ? (
                    <span className="eq2-badge eq2-badge--low">falta {faltantes[0].item.nome.toLowerCase()}</span>
                  ) : (
                    <span className="eq2-badge eq2-badge--ok">dá para produzir</span>
                  )}
                </div>

                <p style={{ margin: 0, fontSize: 13 }}>
                  Custo:{" "}
                  <strong>{custoUn != null ? `${brlSmart(custoUn)} por ${c.unidade}` : "pendente (falta custo de algum insumo)"}</strong>
                  {c.precoVarejo != null && custoUn != null && c.precoVarejo >= custoUn && (
                    <> · você vende a {brl(c.precoVarejo)}</>
                  )}
                  {semFicha && (
                    <>
                      {" · "}
                      <Link to={ROTA_RECEITA(c.id)} style={{ color: "var(--eq2-accent)" }}>
                        montar a ficha
                      </Link>
                    </>
                  )}
                </p>

                {!semFicha && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 13,
                      lineHeight: 1.4,
                      padding: "8px 12px",
                      borderRadius: 12,
                      background: max.max > 0 ? "#f4f7f5" : "#fdf5e6",
                      border: "1px solid var(--eq2-border)",
                      color: max.max > 0 ? "var(--eq2-muted)" : "#9a6a12",
                    }}
                  >
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                    <span>
                      {max.max > 0 ? (
                        <>
                          Seu estoque atual dá para até <strong>{max.max}</strong> {max.max === 1 ? "receita" : "receitas"}.
                        </>
                      ) : (
                        <>Não falta estoque para nem 1 receita — dê uma olhada no “Compro” antes.</>
                      )}
                    </span>
                  </div>
                )}

                <Eq2Stepper
                  value={nLotes}
                  onChange={(v) => definirLotes(c, v)}
                  label={`Quantas receitas produzir? (1 receita = ${formatarQtd(rendimento)} ${c.unidade})`}
                />

                {/* pré-visualização do consumo — a conta visível */}
                {!semFicha && (
                  <div className="eq2-receipt" aria-live="polite">
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--eq2-ink)" }}>Você vai consumir</p>
                    {consumos.map((x) => (
                      <p key={x.item.componenteId} style={{ margin: 0 }}>
                        {formatarQtd(Math.round(x.consumo * 1000) / 1000)} {x.item.unidade} de {x.item.nome.toLowerCase()} —{" "}
                        {x.suficiente ? (
                          <strong style={{ color: "#2e7d43" }}>tem em estoque</strong>
                        ) : (
                          <strong style={{ color: "var(--eq2-danger)" }}>{textoFalta(x)}</strong>
                        )}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="eq2-btn eq2-btn--secondary"
                  style={{ width: "100%" }}
                  onClick={() => abrirConfirmacao(c)}
                  disabled={!temSessao || semFicha || produzindo}
                >
                  <ClipboardList size={18} aria-hidden="true" /> Produzir
                </button>
                {!temSessao && (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--eq2-muted)" }}>
                    modo demo — faça login para registrar a produção no estoque.
                  </p>
                )}
              </section>
            );
          })}

        {/* ---------- Melissa ---------- */}
        {!loading && !error && melissa && (
          <div style={{ marginTop: 20 }}>
            <MelissaCard
              msg={melissa.msg}
              actionLabel={melissa.comAcao ? "Registrar compra" : undefined}
              onAction={melissa.comAcao ? () => navigate(ROTA_COMPRA_NOVA) : undefined}
            />
          </div>
        )}

        {/* ---------- ordens recentes ---------- */}
        {!loading && !error && (
          <>
            <p className="eq2-section-title">Ordens recentes</p>
            {ordens.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--eq2-muted)", margin: "4px 2px" }}>
                Nenhuma produção registrada ainda. Quando você produzir, as ordens aparecem aqui.
              </p>
            ) : (
              <div className="eq2-list">
                {ordens.map((o) => {
                  const estornada = o.status === "ESTORNADA";
                  return (
                    <div key={o.id} className="eq2-card eq2-card--static">
                      <div className="eq2-card__top">
                        <span className="eq2-card__icon" aria-hidden="true">
                          <ChefHat size={18} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="eq2-card__name">{o.produtoNome || "Produto removido"}</div>
                          <div className="eq2-card__meta">
                            {formatarData(o.dataProducao)} · {formatarQtd(o.quantidade)} un · custo {brl(o.custoUnit)}/un
                          </div>
                        </div>
                        <span className={`eq2-badge ${estornada ? "eq2-badge--low" : "eq2-badge--ok"}`}>
                          {estornada ? "Estornada" : "Ativa"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ---------- sheet: confirmação ---------- */}
      {confirmar && (
        <>
          <div className="eq2-sheet__overlay" onClick={produzindo ? undefined : () => setConfirmar(null)} aria-hidden="true" />
          <div className="eq2-sheet" role="dialog" aria-modal="true" aria-label="Confirmar produção">
            <div className="eq2-sheet__grabber" aria-hidden="true" />
            <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700 }}>Confirmar produção</h2>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--eq2-muted)" }}>
              {confirmar.composto.nome} · {confirmar.lotes} {confirmar.lotes === 1 ? "receita" : "receitas"} · entra{" "}
              {formatarQtd(Math.round(confirmar.lotes * (confirmar.composto.rendimentoLote && confirmar.composto.rendimentoLote > 0 ? confirmar.composto.rendimentoLote : 1)))}{" "}
              {confirmar.composto.unidade}
            </p>

            <p className="eq2-section-title" style={{ margin: "12px 0 4px" }}>
              Sai do estoque
            </p>
            <div>
              {calcularConsumos(confirmar.composto, confirmar.lotes).map((x) => (
                <MoveLine key={x.item.componenteId} dir="sai" alerta={!x.suficiente}>
                  saiu: <strong>{formatarQtd(Math.round(x.consumo * 1000) / 1000)} {x.item.unidade}</strong> de{" "}
                  {x.item.nome.toLowerCase()}
                  {!x.suficiente && <> — {textoFalta(x)}</>}
                </MoveLine>
              ))}
              <MoveLine dir="entra">
                entrou: <strong>{formatarQtd(Math.round(confirmar.lotes * (confirmar.composto.rendimentoLote && confirmar.composto.rendimentoLote > 0 ? confirmar.composto.rendimentoLote : 1)))} {confirmar.composto.unidade}</strong> de {confirmar.composto.nome}
              </MoveLine>
            </div>

            {parcial && (
              <div
                role="alert"
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--eq2-danger)",
                  background: "#fdeeee",
                  fontSize: 13,
                  color: "var(--eq2-danger)",
                  lineHeight: 1.45,
                }}
              >
                <strong>Produção parcial.</strong> A etapa “{parcial.etapa ?? "registro"}” falhou: {parcial.error}. Parte do
                estoque já foi atualizada — confira o extrato antes de tentar de novo.
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              <button
                type="button"
                className="eq2-btn eq2-btn--primary eq2-btn--block"
                onClick={confirmarProducao}
                disabled={produzindo}
              >
                <Check size={18} aria-hidden="true" /> {produzindo ? "Registrando…" : "Confirmar produção"}
              </button>
              <button
                type="button"
                className="eq2-btn eq2-btn--link"
                onClick={() => setConfirmar(null)}
                disabled={produzindo}
              >
                Voltar
              </button>
            </div>
          </div>
        </>
      )}

      {/* ---------- sheet: resultado ---------- */}
      {resumo && (
        <>
          <div className="eq2-sheet__overlay" onClick={() => setResumo(null)} aria-hidden="true" />
          <div className="eq2-sheet" role="dialog" aria-modal="true" aria-label="Resultado da produção">
            <div className="eq2-sheet__grabber" aria-hidden="true" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, padding: "8px 0" }}>
              <span
                aria-hidden="true"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#e9f6ec",
                  color: "#2e7d43",
                }}
              >
                <Check size={30} />
              </span>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Produção registrada!</p>
              <p style={{ margin: 0, fontSize: 14, color: "var(--eq2-muted)", maxWidth: "34ch" }}>
                {resumo.composto.nome} · {resumo.lotes} {resumo.lotes === 1 ? "receita" : "receitas"} — seu estoque foi
                atualizado com o que saiu e o que entrou.
              </p>
            </div>

            <div className="eq2-receipt" style={{ marginTop: 8 }}>
              <p style={{ margin: 0, fontWeight: 700, color: "var(--eq2-ink)" }}>recibo da produção</p>
              {(resumo.resultado.consumos ?? []).map((x) => (
                <p key={x.item.componenteId} style={{ margin: 0 }}>
                  − saiu {formatarQtd(Math.round(x.consumo * 1000) / 1000)} {x.item.unidade} de {x.item.nome.toLowerCase()}
                </p>
              ))}
              <p style={{ margin: 0 }}>
                <strong>
                  + entrou {formatarQtd(resumo.resultado.unidadesProduzidas ?? 0)} {resumo.composto.unidade} de{" "}
                  {resumo.composto.nome}
                </strong>{" "}
                · custo {brl(resumo.resultado.custoTotal ?? 0)} ({brlSmart(resumo.resultado.custoUnit ?? 0)}/{resumo.composto.unidade})
              </p>
            </div>

            {(resumo.resultado.consumos ?? []).some((x) => !x.suficiente) && (
              <div
                style={{
                  marginTop: 12,
                  border: "1px solid var(--eq2-border)",
                  background: "#fdf5e6",
                  borderRadius: 12,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={16} color="#9a6a12" aria-hidden="true" /> Faltou para produzir
                </p>
                {(resumo.resultado.consumos ?? [])
                  .filter((x) => !x.suficiente)
                  .map((x) => (
                    <p key={x.item.componenteId} style={{ margin: 0, fontSize: 14, lineHeight: 1.45 }}>
                      {textoFalta(x)} de {x.item.nome.toLowerCase()} — o que faltou não baixou do estoque.
                    </p>
                  ))}
                <Link
                  to={ROTA_COMPRA_NOVA}
                  className="eq2-btn eq2-btn--secondary"
                  style={{ width: "100%", textDecoration: "none" }}
                  onClick={() => setResumo(null)}
                >
                  <ShoppingCart size={18} aria-hidden="true" /> Registrar compra
                </Link>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              <button type="button" className="eq2-btn eq2-btn--primary eq2-btn--block" onClick={() => setResumo(null)}>
                Pronto
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
