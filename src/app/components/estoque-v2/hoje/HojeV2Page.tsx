/**
 * HOJE (V2) — home de leitura do redesign Compro · Faço · Vendo.
 * Wireframe: tracking/Redesign_ComproVendoFaco/hoje-home.html
 * Dados reais via Supabase (useProdutos / useMargemV2 / useCompras); sem sessão,
 * produtos e margens caem no mock local (demo), compras fica vazio.
 */
import { useNavigate } from "react-router";
import { AlertTriangle, ArrowRight, Package, RefreshCw, TrendingDown, Wallet } from "lucide-react";
import { useProdutos } from "../../../hooks/use-produtos";
import { useCompras } from "../../../hooks/use-compras";
import { useMargemV2 } from "../../../hooks/use-margem-v2";
import { MelissaCard } from "../shared/MelissaCard";
import { brl, formatarQtdEstoque } from "../shared/utils";
import "../shared/estoque-v2.css";

const ROTA_COMPRA_NOVA = "/estoque-v2/compras/nova";
const ROTA_MARGEM = "/estoque-v2/margem";
const ROTA_INSUMOS = "/estoque-v2/insumos";
const ROTA_FACO = "/estoque-v2/producao";
const simuladorDe = (id: string) => `/estoque-v2/produtos/${id}/simulador`;

/** Custo "subiu": último preço pago > preco_custo × 1,08 (modelo do SPEC V2). */
function pctAltaCusto(ultimo: number, custo: number): number {
  return Math.round(((ultimo - custo) / custo) * 100);
}

function SkeletonHoje() {
  return (
    <div className="eq2-list" aria-hidden="true">
      <div className="eq2-skeleton" style={{ height: 72 }} />
      <div className="eq2-skeleton" style={{ height: 72 }} />
      <div className="eq2-skeleton" style={{ height: 72 }} />
      <div className="eq2-skeleton" style={{ height: 40 }} />
    </div>
  );
}

interface AlertaCardProps {
  icone: React.ReactNode;
  badge: string;
  badgeClass: string;
  titulo: string;
  meta?: string;
  acaoLabel: string;
  onAcao: () => void;
}

function AlertaCard({ icone, badge, badgeClass, titulo, meta, acaoLabel, onAcao }: AlertaCardProps) {
  return (
    <div className="eq2-card eq2-card--static">
      <div className="eq2-card__top" style={{ alignItems: "flex-start" }}>
        <span className="eq2-card__icon" aria-hidden="true">{icone}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className={badgeClass}>{badge}</span>
          <p className="eq2-card__name" style={{ marginTop: 6, whiteSpace: "normal" }}>{titulo}</p>
          {meta && <p className="eq2-card__meta">{meta}</p>}
        </div>
        <button
          type="button"
          className="eq2-btn eq2-btn--secondary"
          style={{ flex: "none", minHeight: 44, padding: "8px 14px", fontSize: 13 }}
          onClick={onAcao}
        >
          {acaoLabel} <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function HojeV2Page() {
  const navigate = useNavigate();
  const { produtos, loading: produtosLoading, error: produtosError, recarregar } = useProdutos();
  const { itens: margens, loading: margensLoading } = useMargemV2();
  const { compras } = useCompras();

  const carregando = produtosLoading || margensLoading;

  // ---- Alertas de hoje -------------------------------------------------
  const insumosAcabando = produtos.filter(
    (p) => p.natureza === "insumo" && p.estoque <= p.estoqueMinimo
  );
  const custoSubiu = produtos.filter(
    (p) =>
      p.ultimoPrecoCompra != null &&
      p.precoCusto > 0 &&
      p.ultimoPrecoCompra > p.precoCusto * 1.08
  );
  const margemVermelha = margens.filter(
    (m) => m.semaforo === "vermelho" && m.preco !== null && m.custo !== null && (m.margemPct ?? 0) < 0
  );
  const margemApertada = margens.filter((m) => m.semaforo === "vermelho");

  const valorEmEstoque = produtos.reduce((s, p) => s + p.estoque * p.precoCusto, 0);

  // ---- "Comprar de novo": itens das últimas 5 compras ------------------
  const nomesRecentes: string[] = [];
  for (const compra of compras.slice(0, 5)) {
    for (const item of compra.itens) {
      if (!nomesRecentes.includes(item.produtoNome)) nomesRecentes.push(item.produtoNome);
    }
  }
  const chipsRecompra = nomesRecentes.slice(0, 6);

  // ---- Melissa: o alerta mais grave ------------------------------------
  let msgMelissa = "Tudo em dia hoje. Nenhum alerta na sua base — aproveita e vende bastante.";
  let acaoMelissa: { label: string; go: () => void } | null = { label: "Ver margem", go: () => navigate(ROTA_MARGEM) };
  const pior = margemVermelha[0];
  if (pior && pior.custo !== null && pior.preco !== null) {
    const custoPct = Math.round((pior.custo / pior.preco) * 100);
    msgMelissa = `${pior.nome} fica no vermelho — o custo é ${custoPct}% do preço.`;
    acaoMelissa = { label: "Ajustar preço", go: () => navigate(simuladorDe(pior.produtoId)) };
  } else if (margemApertada.length > 0) {
    const m = margemApertada[0];
    msgMelissa = `${m.nome} está no vermelho — ${m.custo === null ? "o custo ainda não foi registrado" : "o preço ainda não foi definido"}.`;
    acaoMelissa = { label: "Ajustar preço", go: () => navigate(simuladorDe(m.produtoId)) };
  } else if (insumosAcabando.length > 0) {
    const p = insumosAcabando[0];
    msgMelissa = `${p.nome} está acabando — restam ${formatarQtdEstoque(p.estoque, p.unidade)}. Reponha antes de produzir.`;
    acaoMelissa = { label: "Comprar", go: () => navigate(ROTA_COMPRA_NOVA) };
  } else if (custoSubiu.length > 0) {
    const p = custoSubiu[0];
    const alta = pctAltaCusto(p.ultimoPrecoCompra as number, p.precoCusto);
    msgMelissa = `O custo de ${p.nome} subiu ${alta}% na última compra — o preço de venda continua o mesmo.`;
    acaoMelissa = { label: "Ver margem", go: () => navigate(ROTA_MARGEM) };
  }

  return (
    <div className="eq2">
      <div className="eq2-shell">
        <header className="eq2-bar">
          <div>
            <h1 className="eq2-bar__title">Hoje</h1>
            <p className="eq2-bar__sub">O que precisa da sua atenção</p>
          </div>
        </header>

        <main>
          {/* Segmented fake — ancora para as outras áreas */}
          <div className="eq2-segmented" role="group" aria-label="Modo da base" style={{ marginBottom: 16 }}>
            <button type="button" style={{ minHeight: 44 }} onClick={() => navigate(ROTA_INSUMOS)}>Compro</button>
            <button type="button" style={{ minHeight: 44 }} onClick={() => navigate(ROTA_FACO)}>Faço</button>
            <button type="button" style={{ minHeight: 44 }} onClick={() => navigate(ROTA_MARGEM)}>Vendo</button>
          </div>

          {/* Valor total em estoque */}
          <div className="eq2-card eq2-card--static" style={{ marginBottom: 16 }}>
            <div className="eq2-card__rows" style={{ margin: 0 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <Wallet size={16} aria-hidden="true" style={{ color: "var(--eq2-muted)" }} />
                Valor parado em estoque
              </span>
              <strong className="eq2-card__price">{carregando ? "—" : brl(valorEmEstoque)}</strong>
            </div>
          </div>

          <h2 className="eq2-section-title">Precisa de você hoje</h2>

          {produtosError ? (
            <div className="eq2-state" role="alert">
              <span className="eq2-state__emoji" aria-hidden="true">⚠️</span>
              <p className="eq2-state__title">Não foi possível carregar</p>
              <p>Veja se a internet está funcionando e tente de novo.</p>
              <button type="button" className="eq2-btn eq2-btn--secondary" onClick={recarregar}>
                Tente de novo
              </button>
            </div>
          ) : carregando ? (
            <SkeletonHoje />
          ) : produtos.length === 0 ? (
            <div className="eq2-state">
              <span className="eq2-state__emoji" aria-hidden="true">🌱</span>
              <p className="eq2-state__title">Nada cadastrado ainda</p>
              <p>Assim que você registrar produtos e insumos, os alertas de hoje aparecem aqui.</p>
            </div>
          ) : (
            <div className="eq2-list" style={{ marginBottom: 8 }}>
              {/* (a) insumos acabando */}
              {insumosAcabando.length > 0 ? (
                <AlertaCard
                  icone={<Package size={20} aria-hidden="true" style={{ color: "var(--eq2-danger)" }} />}
                  badge="está acabando"
                  badgeClass="eq2-badge eq2-badge--low"
                  titulo={`${insumosAcabando[0].nome} — restam ${formatarQtdEstoque(insumosAcabando[0].estoque, insumosAcabando[0].unidade)}`}
                  meta={
                    insumosAcabando.length > 1
                      ? `${insumosAcabando.length} insumos no mínimo ou zerados`
                      : "No estoque abaixo do mínimo — reponha antes de produzir."
                  }
                  acaoLabel="Comprar"
                  onAcao={() => navigate(ROTA_COMPRA_NOVA)}
                />
              ) : (
                <AlertaCard
                  icone={<Package size={20} aria-hidden="true" style={{ color: "var(--eq2-muted)" }} />}
                  badge="abastecido"
                  badgeClass="eq2-badge eq2-badge--ok"
                  titulo="Nenhum insumo acabando"
                  meta="Todos os insumos estão acima do estoque mínimo."
                  acaoLabel="Ver insumos"
                  onAcao={() => navigate(ROTA_INSUMOS)}
                />
              )}

              {/* (b) custo subiu */}
              {custoSubiu.length > 0 ? (
                <AlertaCard
                  icone={<TrendingDown size={20} aria-hidden="true" style={{ color: "var(--eq2-warn)" }} />}
                  badge={`custo subiu ${pctAltaCusto(custoSubiu[0].ultimoPrecoCompra as number, custoSubiu[0].precoCusto)}%`}
                  badgeClass="eq2-badge eq2-badge--estimado"
                  titulo={custoSubiu[0].nome}
                  meta={
                    custoSubiu.length > 1
                      ? `${custoSubiu.length} insumos com último preço pago acima do custo registrado`
                      : "O último preço pago ficou acima do custo registrado — suas receitas podem estar mais caras."
                  }
                  acaoLabel="Ver margem"
                  onAcao={() => navigate(ROTA_MARGEM)}
                />
              ) : (
                <AlertaCard
                  icone={<TrendingDown size={20} aria-hidden="true" style={{ color: "var(--eq2-muted)" }} />}
                  badge="estável"
                  badgeClass="eq2-badge eq2-badge--ok"
                  titulo="Nenhum custo subiu"
                  meta="O último preço pago está coerente com o custo registrado."
                  acaoLabel="Ver compras"
                  onAcao={() => navigate(ROTA_COMPRA_NOVA)}
                />
              )}

              {/* (c) margem no vermelho */}
              {margemApertada.length > 0 ? (
                <AlertaCard
                  icone={<AlertTriangle size={20} aria-hidden="true" style={{ color: "var(--eq2-danger)" }} />}
                  badge="margem no vermelho"
                  badgeClass="eq2-badge eq2-badge--low"
                  titulo={
                    pior
                      ? `${pior.nome} — ${pior.margemReais != null && pior.margemReais < 0 ? `prejuízo de ${brl(pior.margemReais)} por ${pior.unidade}` : `sobra só ${Math.round((pior.margemPct ?? 0) * 100)}%`}`
                      : `${margemApertada[0].nome} — margem abaixo de 30%`
                  }
                  meta={`${margemApertada.length} produto${margemApertada.length > 1 ? "s" : ""} no vermelho. Um ajuste de preço resolve.`}
                  acaoLabel="Ajustar preço"
                  onAcao={() => navigate(simuladorDe(margemApertada[0].produtoId))}
                />
              ) : (
                <AlertaCard
                  icone={<AlertTriangle size={20} aria-hidden="true" style={{ color: "var(--eq2-muted)" }} />}
                  badge="sem sustos"
                  badgeClass="eq2-badge eq2-badge--ok"
                  titulo="Nenhuma margem no vermelho"
                  meta="Todo produto vendido está sobrando pelo menos 30% do preço."
                  acaoLabel="Ver margem"
                  onAcao={() => navigate(ROTA_MARGEM)}
                />
              )}
            </div>
          )}

          {/* Comprar de novo */}
          {chipsRecompra.length > 0 && (
            <>
              <h2 className="eq2-section-title">Comprar de novo</h2>
              <p style={{ fontSize: 12, color: "var(--eq2-muted)", marginBottom: 8 }}>
                Os últimos insumos que apareceram nas suas compras.
              </p>
              <nav className="eq2-chips" aria-label="Recomprar insumos">
                {chipsRecompra.map((nome) => (
                  <button
                    key={nome}
                    type="button"
                    className="eq2-chip"
                    style={{ minHeight: 44 }}
                    onClick={() => navigate(ROTA_COMPRA_NOVA)}
                  >
                    <RefreshCw size={14} aria-hidden="true" style={{ display: "inline", verticalAlign: -2, marginRight: 6 }} />
                    {nome}
                  </button>
                ))}
              </nav>
            </>
          )}

          {!carregando && !produtosError && (
            <div style={{ marginTop: 20 }}>
              <MelissaCard msg={msgMelissa} actionLabel={acaoMelissa?.label} onAction={acaoMelissa?.go} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
