/**
 * Dashboard V2 (Estoque) — FUSÃO observável para comparação.
 *
 * Rota nova de comparativo: NÃO substitui /estoque/dashboard (v1) nem
 * /estoque-v2/hoje — o fundador abre as três e decide o que fica.
 *
 * Composição (leilão mobile-first, 5 blocos; desktop ≥900px em 3 colunas):
 *  1. Melissa (card escuro, TOPO) — o insight mais grave do dia, na mesma
 *     ordem de prioridade do Hoje v2 (margem no vermelho > margem apertada >
 *     insumo acabando > custo subiu > tudo em dia).
 *  2. Ações rápidas — chips precursoros do Hoje (Nova compra · Produção ·
 *     Fichas técnicas), alvo de toque ≥ 44px.
 *  3. Saldo do estoque — herança do v1, filtrada pelo "menos é mais":
 *     valor parado a preço de custo (fórmula do Hoje) + últimos 7 dias
 *     (contagem real de est_movimentacao) + zerados (métrica do v1) +
 *     compras do mês (est_compra; some no mobile quando não há compras).
 *  4. Acabando — alertas por insumo com barra de progresso (heurística de
 *     nível da lista de Insumos v2: mínimo × 3), tocável → /estoque-v2/insumos/:id.
 *     Substitui o card "Produtos com Estoque Crítico" do v1.
 *  5. Movimentações recentes — as 5 mais novas do extrato real (B14), no
 *     lugar dos gráficos mock de entrada/saída do v1 (dados falsos fora).
 *
 * Descartado do v1 (julgamento @designer): gráficos recharts com mock
 * semanal/mensal, KPI "Total de Produtos" isolado, pill "+x%" fake, menu de
 * contexto do v1 (navegação já vive no rail/SegmentedNav).
 *
 * Estados: skeleton · empty (MelissaCard) · erro com retry · seção de
 * movimentações com erro/empty próprios · aviso de dados de demonstração.
 *
 * Estilo: só classes .eq2 do css compartilhado do módulo + <style> scoped
 * `.eq2-dash__*` (padrão do módulo; o css compartilhado é de outras lanes).
 */
import { useNavigate } from "react-router";
import {
  ArrowRight,
  ArrowRightLeft,
  BookOpen,
  ClipboardList,
  Package,
  RotateCcw,
  ShoppingCart,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useProdutos } from "../../../hooks/use-produtos";
import { useMargemV2 } from "../../../hooks/use-margem-v2";
import { useMovimentacoes } from "../../../hooks/use-movimentacoes";
import { useCompras } from "../../../hooks/use-compras";
import { formatarDataMovimentacao } from "../../../lib/estoque-utils";
import type { MovimentacaoEstoque } from "../../../types/estoque";
import type { Produto } from "../../estoque/estoqueMockData";
import { MelissaCard } from "../shared/MelissaCard";
import { SegmentedNav } from "../shared/SegmentedNav";
import { brl, formatarQtdEstoque } from "../shared/utils";
import "../shared/estoque-v2.css";

/* Rotas do módulo v2 (ligadas/por ligar no routes.tsx pelo orquestrador) */
const ROTA_COMPRA_NOVA = "/estoque-v2/compras/nova";
const ROTA_INSUMOS = "/estoque-v2/insumos";
const ROTA_FACO = "/estoque-v2/producao";
const ROTA_RECEITAS = "/estoque-v2/receitas";
const ROTA_MARGEM = "/estoque-v2/margem";
/* Extrato real do v1 — única tela de extrato existente até hoje; o dashboard
 * v2 aponta para ela em vez de inventar rota nova. */
const ROTA_EXTRATO = "/estoque/movimentacoes";
const simuladorDe = (id: string) => `/estoque-v2/produtos/${id}/simulador`;
const insumoDe = (id: string) => `/estoque-v2/insumos/${id}`;

/** Custo "subiu": último preço pago > preco_custo × 1,08 (mesmo modelo do Hoje). */
function pctAltaCusto(ultimo: number, custo: number): number {
  return Math.round(((ultimo - custo) / custo) * 100);
}

/** Nível do insumo na barra: mínimo × 3 = "prateleira cheia" (heurística da lista de Insumos v2). */
function nivelEstoquePct(estoque: number, estoqueMinimo: number): number {
  if (estoque <= 0) return 0;
  const cap = estoqueMinimo > 0 ? estoqueMinimo * 3 : estoque;
  return Math.min(100, Math.max(4, Math.round((estoque / cap) * 100)));
}

/* ------------------------------------------------------------------ */
/* Blocos                                                              */
/* ------------------------------------------------------------------ */

function MiniStat({
  icone,
  legenda,
  valor,
  meta,
  alerta = false,
  onClick,
}: {
  icone: React.ReactNode;
  legenda: string;
  valor: string;
  meta: string;
  alerta?: boolean;
  onClick?: () => void;
}) {
  const className = `eq2-card${onClick ? "" : " eq2-card--static"}`;
  const corpo = (
    <>
      <span className="eq2-dash__stat-label">
        <span aria-hidden="true" style={{ color: alerta ? "var(--eq2-danger)" : "var(--eq2-muted)", display: "inline-flex" }}>
          {icone}
        </span>
        {legenda}
      </span>
      <span className="eq2-dash__stat-value" style={alerta ? { color: "var(--eq2-danger)" } : undefined}>
        {valor}
      </span>
      <span className="eq2-card__meta">{meta}</span>
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} aria-label={`${legenda}: ${valor}`}>
        {corpo}
      </button>
    );
  }
  return <div className={className}>{corpo}</div>;
}

/** Card-tático do insumo acabando — toque abre o detalhe do insumo. */
function CardAcabando({ insumo, onTap }: { insumo: Produto; onTap: () => void }) {
  const zerado = insumo.estoque === 0;
  const pct = nivelEstoquePct(insumo.estoque, insumo.estoqueMinimo);
  return (
    <button type="button" className="eq2-card" onClick={onTap} aria-label={`Abrir ${insumo.nome}`}>
      <div className="eq2-card__top">
        <span className="eq2-card__icon" aria-hidden="true">
          <Package size={20} style={{ color: zerado ? "var(--eq2-danger)" : "var(--eq2-warn)" }} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flexWrap: "wrap" }}>
            <span className="eq2-card__name">{insumo.nome}</span>
            <span className={`eq2-badge ${zerado ? "eq2-badge--low" : "eq2-badge--estimado"}`}>
              {zerado ? "sem estoque" : "acabando"}
            </span>
          </span>
          <div className="eq2-card__meta">
            restam {formatarQtdEstoque(insumo.estoque, insumo.unidade)} · mínimo{" "}
            {formatarQtdEstoque(insumo.estoqueMinimo, insumo.unidade)}
          </div>
        </span>
        <ArrowRight size={16} aria-hidden="true" style={{ flex: "none", color: "var(--eq2-muted)" }} />
      </div>
      <div
        className="eq2-progress"
        style={{ marginTop: 12 }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Nível de estoque de ${insumo.nome}`}
      >
        <i style={{ width: `${pct}%`, background: "var(--eq2-danger)" }} />
      </div>
    </button>
  );
}

function LinhaMovimentacao({ mov }: { mov: MovimentacaoEstoque }) {
  const entrada = mov.tipo === "entrada";
  const quando = formatarDataMovimentacao(mov.data);
  return (
    <div className="eq2-dash__mov-row">
      <span className={`eq2-badge ${entrada ? "eq2-badge--ok" : "eq2-badge--low"}`} style={{ flex: "none" }}>
        {entrada ? "entrada" : "saída"}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <p className="eq2-card__name">{mov.produtoNome}</p>
        <p className="eq2-card__meta">
          {quando.data}
          {quando.hora ? ` ${quando.hora}` : ""}
          {mov.motivo ? ` · ${mov.motivo}` : ""}
        </p>
      </span>
      <strong className="eq2-dash__mov-qtd" style={entrada ? undefined : { color: "var(--eq2-danger)" }}>
        {entrada ? "+" : "−"}
        {mov.quantidade}
      </strong>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="eq2-list" aria-hidden="true">
      <div className="eq2-skeleton" style={{ height: 150, borderRadius: 16 }} />
      <div className="eq2-skeleton" style={{ height: 44 }} />
      <div className="eq2-dash__stats">
        <div className="eq2-skeleton" style={{ height: 96, borderRadius: 12 }} />
        <div className="eq2-skeleton" style={{ height: 76, borderRadius: 12 }} />
        <div className="eq2-skeleton" style={{ height: 76, borderRadius: 12 }} />
      </div>
      <div className="eq2-skeleton" style={{ height: 92 }} />
      <div className="eq2-skeleton" style={{ height: 92 }} />
      <div className="eq2-skeleton" style={{ height: 170, borderRadius: 16 }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export function DashboardV2Page() {
  const navigate = useNavigate();
  const {
    produtos,
    loading: produtosLoading,
    error: produtosError,
    isFallback,
    recarregar,
  } = useProdutos();
  const { itens: margens, loading: margensLoading } = useMargemV2();
  const {
    movimentacoes,
    loading: movLoading,
    error: movError,
    recarregar: recarregarMov,
  } = useMovimentacoes();
  const { compras } = useCompras();

  const carregando = produtosLoading || margensLoading;

  // ---- Saldo (fórmulas do Hoje v2; nenhuma tabela nova) --------------
  const insumos = produtos.filter((p) => p.natureza === "insumo");
  const nProdutos = produtos.length - insumos.length;
  const valorEmEstoque = produtos.reduce((s, p) => s + p.estoque * p.precoCusto, 0);
  const semEstoque = produtos.filter((p) => p.estoque === 0).length;

  // Acabando = insumo no mínimo ou zerado; mais grave primeiro (ratio asc).
  const acabando = produtos
    .filter((p) => p.natureza === "insumo" && p.estoque <= p.estoqueMinimo)
    .sort((a, b) => {
      const ra = a.estoqueMinimo > 0 ? a.estoque / a.estoqueMinimo : a.estoque;
      const rb = b.estoqueMinimo > 0 ? b.estoque / b.estoqueMinimo : b.estoque;
      return ra - rb;
    });

  // Movimentações: 5 recentes para a lista; últimos 7 dias para a métrica.
  const movsRecentes = movimentacoes.slice(0, 5);
  const seteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const movs7d = movimentacoes.filter((m) => new Date(m.data).getTime() >= seteDiasAtras);
  const entradas7 = movs7d.filter((m) => m.tipo === "entrada").length;

  // Compras do mês (est_compra); some do saldo quando não há compras (demo).
  const hoje = new Date();
  const comprasMes = compras.filter((c) => {
    const d = new Date(c.dataCompra);
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  });
  const valorComprasMes = comprasMes.reduce((s, c) => s + c.valorTotal, 0);

  // ---- Custos que subiram / margem (mesma regra do Hoje) -------------
  const custoSubiu = produtos.filter(
    (p) => p.ultimoPrecoCompra != null && p.precoCusto > 0 && p.ultimoPrecoCompra > p.precoCusto * 1.08
  );
  const margemVermelha = margens.filter(
    (m) => m.semaforo === "vermelho" && m.preco !== null && m.custo !== null && (m.margemPct ?? 0) < 0
  );
  const margemApertada = margens.filter((m) => m.semaforo === "vermelho");

  // ---- Melissa: o insight mais grave do dia (prioridade do Hoje v2) --
  let msgMelissa = "Tudo em dia hoje. Nenhum alerta na sua base — aproveita e vende bastante.";
  let acaoMelissa: { label: string; go: () => void } | null = {
    label: "Ver margem",
    go: () => navigate(ROTA_MARGEM),
  };
  const pior = margemVermelha[0];
  if (pior && pior.custo !== null && pior.preco !== null) {
    const custoPct = Math.round((pior.custo / pior.preco) * 100);
    msgMelissa = `${pior.nome} fica no vermelho — o custo é ${custoPct}% do preço.`;
    acaoMelissa = { label: "Ajustar preço", go: () => navigate(simuladorDe(pior.produtoId)) };
  } else if (margemApertada.length > 0) {
    const m = margemApertada[0];
    msgMelissa = `${m.nome} está no vermelho — ${
      m.custo === null ? "o custo ainda não foi registrado" : "o preço ainda não foi definido"
    }.`;
    acaoMelissa = { label: "Ajustar preço", go: () => navigate(simuladorDe(m.produtoId)) };
  } else if (acabando.length > 0) {
    const p = acabando[0];
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
          <div style={{ minWidth: 0 }}>
            <h1 className="eq2-bar__title">Dashboard</h1>
            <p className="eq2-bar__sub">O pulo do gato do seu estoque</p>
          </div>
        </header>

        <main>
          {/* Compro · Faço · Vendo — assinatura do módulo; aqui nenhuma seção ativa */}
          <SegmentedNav />

          {isFallback && (
            <p style={{ fontSize: 11, color: "var(--eq2-warn)", margin: "0 0 12px" }}>
              dados de demonstração — faça login para ver seu estoque real
            </p>
          )}

          {/* ---------- Estados ---------- */}
          {produtosError ? (
            <div className="eq2-state eq2-card eq2-card--static" role="alert">
              <TriangleAlert size={32} aria-hidden="true" style={{ color: "var(--eq2-danger)" }} />
              <p className="eq2-state__title">Não foi possível carregar seu estoque</p>
              <p style={{ margin: 0 }}>
                {produtosError.includes("Empresa") ? produtosError : "Veja se a internet está funcionando e tente de novo."}
              </p>
              <button type="button" className="eq2-btn eq2-btn--secondary" onClick={recarregar}>
                <RotateCcw size={16} aria-hidden="true" /> Tentar de novo
              </button>
            </div>
          ) : carregando ? (
            <SkeletonDashboard />
          ) : produtos.length === 0 ? (
            /* Empty real: empresa nova, nada cadastrado — Melissa na frente */
            <div style={{ display: "grid", gap: 16 }}>
              <MelissaCard
                msg="Seu estoque está em branco. Cadastre o primeiro insumo que eu começo a avisar a hora certa de comprar — e quanto sobra em cada venda."
                actionLabel="Cadastrar insumo"
                onAction={() => navigate(ROTA_INSUMOS)}
              />
              <div className="eq2-chips" role="group" aria-label="Ações rápidas">
                <button type="button" className="eq2-chip" style={{ minHeight: 44 }} onClick={() => navigate(ROTA_INSUMOS)}>
                  <Package size={14} aria-hidden="true" style={{ marginRight: 6 }} />
                  Insumos
                </button>
                <button type="button" className="eq2-chip" style={{ minHeight: 44 }} onClick={() => navigate(ROTA_FACO)}>
                  <ClipboardList size={14} aria-hidden="true" style={{ marginRight: 6 }} />
                  Produção
                </button>
                <button type="button" className="eq2-chip" style={{ minHeight: 44 }} onClick={() => navigate(ROTA_RECEITAS)}>
                  <BookOpen size={14} aria-hidden="true" style={{ marginRight: 6 }} />
                  Fichas técnicas
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1 · Melissa no topo — o insight mais grave do dia */}
              <MelissaCard
                msg={msgMelissa}
                actionLabel={acaoMelissa?.label}
                onAction={acaoMelissa?.go}
                secondaryLabel="Ver margem"
                onSecondary={() => navigate(ROTA_MARGEM)}
              />

              {/* 2 · Ações rápidas precursoras (toque ≥ 44px, do Hoje) */}
              <div className="eq2-chips" style={{ margin: "14px 0 4px" }} role="group" aria-label="Ações rápidas">
                <button
                  type="button"
                  className="eq2-chip"
                  style={{ minHeight: 44 }}
                  onClick={() => navigate(ROTA_COMPRA_NOVA)}
                >
                  <Package size={14} aria-hidden="true" style={{ marginRight: 6 }} />
                  Nova compra
                </button>
                <button type="button" className="eq2-chip" style={{ minHeight: 44 }} onClick={() => navigate(ROTA_FACO)}>
                  <ClipboardList size={14} aria-hidden="true" style={{ marginRight: 6 }} />
                  Produção
                </button>
                <button
                  type="button"
                  className="eq2-chip"
                  style={{ minHeight: 44 }}
                  onClick={() => navigate(ROTA_RECEITAS)}
                >
                  <BookOpen size={14} aria-hidden="true" style={{ marginRight: 6 }} />
                  Fichas técnicas
                </button>
              </div>

              {/* 3 · Saldo — herança v1 filtrada */}
              <h2 className="eq2-section-title">Saldo do estoque</h2>
              <div className="eq2-dash__stats">
                <div className="eq2-card eq2-card--static eq2-dash__hero">
                  <span className="eq2-dash__stat-label">
                    <Wallet size={15} aria-hidden="true" />
                    Valor parado em estoque
                  </span>
                  <p className="eq2-dash__hero-value">{brl(valorEmEstoque)}</p>
                  <p className="eq2-card__meta">
                    {insumos.length} insumos · {nProdutos} produtos · a preço de custo
                  </p>
                </div>
                <MiniStat
                  icone={<ArrowRightLeft size={14} aria-hidden="true" />}
                  legenda="Últimos 7 dias"
                  valor={movLoading ? "—" : String(movs7d.length)}
                  meta={`${entradas7} entrada${entradas7 === 1 ? "" : "s"} · ${movs7d.length - entradas7} saída${movs7d.length - entradas7 === 1 ? "" : "s"}`}
                />
                <MiniStat
                  icone={<Package size={14} aria-hidden="true" />}
                  legenda="Sem estoque"
                  valor={String(semEstoque)}
                  meta={semEstoque > 0 ? "zerados — reponha primeiro" : "nada zerado"}
                  alerta={semEstoque > 0}
                  onClick={() => navigate(ROTA_INSUMOS)}
                />
                {compras.length > 0 && (
                  <MiniStat
                    icone={<ShoppingCart size={14} aria-hidden="true" />}
                    legenda="Compras do mês"
                    valor={brl(valorComprasMes)}
                    meta={
                      comprasMes.length === 0
                        ? "nenhuma neste mês"
                        : `${comprasMes.length} compra${comprasMes.length === 1 ? "" : "s"}`
                    }
                    onClick={() => navigate(ROTA_COMPRA_NOVA)}
                  />
                )}
              </div>

              {/* 4 · Acabando + 5 · Movimentações — 3 colunas no desktop (2+1) */}
              <div className="eq2-dash__cols">
                <section className="eq2-dash__col-alerts" aria-labelledby="dashv2-acabando">
                  <h2 className="eq2-section-title" id="dashv2-acabando">
                    {acabando.length > 0 ? `Acabando (${acabando.length})` : "Acabando"}
                  </h2>
                  <div className="eq2-list">
                    {acabando.length > 0 ? (
                      <>
                        {acabando.slice(0, 4).map((p) => (
                          <CardAcabando key={p.id} insumo={p} onTap={() => navigate(insumoDe(p.id))} />
                        ))}
                        {acabando.length > 4 && (
                          <button type="button" className="eq2-btn eq2-btn--link" onClick={() => navigate(ROTA_INSUMOS)}>
                            Ver todos os insumos <ArrowRight size={14} aria-hidden="true" />
                          </button>
                        )}
                      </>
                    ) : (
                      <button type="button" className="eq2-card" onClick={() => navigate(ROTA_INSUMOS)}>
                        <div className="eq2-card__top">
                          <span className="eq2-card__icon" aria-hidden="true">
                            <Package size={20} style={{ color: "var(--eq2-muted)" }} />
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="eq2-badge eq2-badge--ok">abastecido</span>
                            <p className="eq2-card__name" style={{ marginTop: 6, whiteSpace: "normal" }}>
                              Nenhum insumo acabando
                            </p>
                            <p className="eq2-card__meta">Todos acima do mínimo — pode produzir tranquilo.</p>
                          </span>
                          <ArrowRight size={16} aria-hidden="true" style={{ flex: "none", color: "var(--eq2-muted)" }} />
                        </div>
                      </button>
                    )}
                  </div>
                </section>

                <section aria-labelledby="dashv2-mov">
                  <h2 className="eq2-section-title" id="dashv2-mov">
                    Movimentações recentes
                  </h2>
                  <div className="eq2-card eq2-card--static">
                    {movError ? (
                      /* Erro da seção não derruba o dashboard (padrão do v1) */
                      <div style={{ display: "grid", gap: 8 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "var(--eq2-danger)" }}>
                          Não foi possível carregar as movimentações.
                        </p>
                        <button
                          type="button"
                          className="eq2-btn eq2-btn--secondary"
                          style={{ justifySelf: "start", padding: "8px 14px", fontSize: 13, minHeight: 40 }}
                          onClick={recarregarMov}
                        >
                          <RotateCcw size={14} aria-hidden="true" /> Tentar de novo
                        </button>
                      </div>
                    ) : movLoading ? (
                      <div className="eq2-list" aria-hidden="true">
                        <div className="eq2-skeleton" style={{ height: 40 }} />
                        <div className="eq2-skeleton" style={{ height: 40 }} />
                        <div className="eq2-skeleton" style={{ height: 40 }} />
                      </div>
                    ) : movsRecentes.length === 0 ? (
                      <p style={{ margin: 0, fontSize: 12, color: "var(--eq2-muted)", textAlign: "center", padding: "14px 0" }}>
                        Sem movimentações ainda — registre uma compra ou produção e ela aparece aqui.
                      </p>
                    ) : (
                      <>
                        {movsRecentes.map((mov) => (
                          <LinhaMovimentacao key={mov.id} mov={mov} />
                        ))}
                        <button
                          type="button"
                          className="eq2-btn eq2-btn--link"
                          style={{ marginTop: 4 }}
                          onClick={() => navigate(ROTA_EXTRATO)}
                        >
                          Ver extrato completo <ArrowRight size={14} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Estilos locais do dashboard — fora do css compartilhado do módulo
          (outras lanes o usam); prefixo .eq2-dash__ evita colisão. */}
      <style>{`
        .eq2-dash__stats {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
        .eq2-dash__hero { grid-column: 1 / -1; }
        .eq2-dash__hero-value {
          margin: 6px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.15;
          font-variant-numeric: tabular-nums;
          color: var(--eq2-ink);
          word-break: break-word;
        }
        .eq2-dash__stat-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--eq2-muted);
        }
        .eq2-dash__stat-value {
          display: block;
          margin-top: 4px;
          font-size: 20px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.01em;
          font-variant-numeric: tabular-nums;
        }
        .eq2-dash__cols {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0 20px;
        }
        .eq2-dash__mov-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-top: 1px solid var(--eq2-border);
        }
        .eq2-dash__mov-row:first-child { border-top: 0; padding-top: 2px; }
        .eq2-dash__mov-qtd {
          flex: none;
          font-size: 15px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        @media (min-width: 900px) {
          .eq2-dash__hero { grid-column: span 1; }
          .eq2-dash__cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .eq2-dash__col-alerts { grid-column: span 2; }
        }
      `}</style>
    </div>
  );
}

export default DashboardV2Page;
