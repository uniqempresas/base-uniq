import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Kanban,
  MapPin,
  RefreshCw,
  Target,
  UserPlus,
  Users,
} from "lucide-react";
import { formatCurrency } from "./crmMockData";
import { usePipeline, isEtapaTerminal, isEtapaGanho } from "../../hooks/use-pipeline";
import { useDashboardCrm } from "../../hooks/use-dashboard-crm";

const formatShortCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });

// Período → janela em dias (filtro client-side, regra 2 da SPEC)
const DIAS_POR_PERIODO: Record<string, number | null> = {
  "Todos os dados": null,
  "Últimos 30 dias": 30,
  "Últimos 90 dias": 90,
};

const dentroDoPeriodo = (iso: string | null, dias: number | null): boolean => {
  if (dias === null) return true;
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t >= Date.now() - dias * 86_400_000;
};

export function CRMDashboardPage() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("Todos os dados");

  // Pipeline (etapas + oportunidades + nomes de cliente) do MESMO hook do kanban;
  // probabilidade continua heurística por posicao (decisão do fundador).
  const { etapas, oportunidades, carregando: carregandoPipeline, erro: erroPipeline, recarregar: recarregarPipeline } = usePipeline();
  const { clientes, comprasDisponiveis, carregando: carregandoClientes, erro: erroClientes, recarregar: recarregarClientes } = useDashboardCrm();

  const carregando = carregandoPipeline || carregandoClientes;
  const erro = erroPipeline || erroClientes;
  const recarregarTudo = () => {
    recarregarPipeline();
    recarregarClientes();
  };

  const dias = DIAS_POR_PERIODO[periodo] ?? null;
  const clientesPeriodo = useMemo(
    () => clientes.filter((c) => dentroDoPeriodo(c.criadoEm, dias)),
    [clientes, dias],
  );
  const oppsPeriodo = useMemo(
    () => oportunidades.filter((n) => dentroDoPeriodo(n.estagioDesde, dias)),
    [oportunidades, dias],
  );

  const clientesAtivos = clientesPeriodo.filter((cliente) => cliente.ativo);
  const negociacoesAbertas = oppsPeriodo.filter((negociacao) => !isEtapaTerminal(negociacao.etapa));
  const negociacoesEncerradas = oppsPeriodo.filter((negociacao) => isEtapaTerminal(negociacao.etapa));
  const valorPipeline = negociacoesAbertas.reduce((total, negociacao) => total + negociacao.valor, 0);
  const ganhas = negociacoesEncerradas.filter((negociacao) => isEtapaGanho(negociacao.etapa)).length;
  const conversao = negociacoesEncerradas.length ? Math.round((ganhas / negociacoesEncerradas.length) * 100) : null;
  // atrasado = estagio_desde ≥ 7 dias em etapa não-terminal (derivado no use-pipeline)
  const atrasadas = negociacoesAbertas.filter((negociacao) => negociacao.atrasado).slice(0, 3);
  const recentes = clientesPeriodo.slice(0, 5);
  const ativas = negociacoesAbertas.slice(0, 5);

  // Funil: colunas reais da empresa (crm_etapas, order posicao), cor hex com
  // fallback neutro já resolvido no use-pipeline (normalizarCor).
  const funil = useMemo(
    () =>
      etapas
        .filter((etapa) => !isEtapaTerminal(etapa.nome))
        .map((etapa) => {
          const items = negociacoesAbertas.filter((negociacao) => negociacao.etapa === etapa.nome);
          return { ...etapa, quantidade: items.length, valor: items.reduce((total, item) => total + item.valor, 0) };
        }),
    [etapas, negociacoesAbertas],
  );
  const maiorFunil = Math.max(...funil.map((item) => item.valor), 1);

  const kpis = [
    { id: "clientes", label: "Total de clientes", value: String(clientesPeriodo.length), detail: `${clientesAtivos.length} ativos`, icon: Users },
    { id: "ativos", label: "Clientes ativos", value: String(clientesAtivos.length), detail: `${clientesPeriodo.length - clientesAtivos.length} sem atividade`, icon: CheckCircle2 },
    { id: "pipeline", label: "Valor do pipeline", value: formatCurrency(valorPipeline), detail: `${negociacoesAbertas.length} negociações abertas`, icon: DollarSign },
    {
      id: "conversao",
      label: "Conversão",
      value: conversao === null ? "—" : `${conversao}%`,
      detail: conversao === null ? "sem negociações encerradas" : `${ganhas} negociação${ganhas === 1 ? " ganha" : " ganhas"}`,
      icon: Target,
    },
  ];

  return (
    <main data-od-id="crm-dashboard" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-5 border-b border-[#efefef] pb-7 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#627271]">Base UNIQ · CRM</p>
          <h1 data-od-id="crm-dashboard-heading" className="text-2xl font-semibold tracking-tight text-[#1f2937] md:text-3xl">Dashboard CRM</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#627271]">Uma visão objetiva para acompanhar relacionamentos, oportunidades e próximos movimentos.</p>
        </div>
        <div data-od-id="crm-dashboard-cta" className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => navigate("/crm/clientes")} aria-label="Cadastrar novo cliente" className="inline-flex min-h-[44px] md:min-h-0 items-center justify-center gap-2 rounded-lg bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92] focus-visible:ring-offset-2">
            <UserPlus size={17} /> Novo cliente
          </button>
          <button type="button" onClick={() => navigate("/crm/pipeline")} aria-label="Ver pipeline de vendas" className="inline-flex min-h-[44px] md:min-h-0 items-center justify-center gap-2 rounded-lg border border-[#627271] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#efefef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92] focus-visible:ring-offset-2">
            <Kanban size={17} /> Ver pipeline
          </button>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1f2937]">Resumo operacional</h2>
          <p className="mt-1 text-xs text-[#627271]">
            {erro ? "Dados indisponíveis" : `Dados reais do banco · ${periodo === "Todos os dados" ? "histórico completo" : periodo.toLowerCase()}`}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-[#627271]">
          <span className="sr-only">Período</span>
          <select value={periodo} onChange={(event) => setPeriodo(event.target.value)} aria-label="Filtrar período" className="min-h-[44px] md:min-h-0 rounded-lg border border-[#efefef] bg-white px-3 py-2 text-xs text-[#1f2937] outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]">
            <option>Todos os dados</option><option>Últimos 30 dias</option><option>Últimos 90 dias</option>
          </select>
        </label>
      </div>

      {erro ? (
        <section className="rounded-lg border border-[#efefef] bg-white p-8 text-center" role="alert">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="mb-1 text-sm font-semibold text-[#1f2937]">Não foi possível carregar o dashboard</p>
          <p className="mx-auto mb-4 max-w-md text-xs text-[#627271]">{erro}</p>
          <button
            type="button"
            onClick={recarregarTudo}
            className="inline-flex min-h-[44px] md:min-h-0 items-center gap-2 rounded-lg bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92] focus-visible:ring-offset-2"
          >
            <RefreshCw size={15} /> Tentar de novo
          </button>
        </section>
      ) : (
        <>
          <section data-od-id="crm-kpi-cards" aria-label="Indicadores principais" className="mb-6 grid grid-cols-2 gap-2 md:gap-4 xl:grid-cols-4">
            {carregando
              ? [0, 1, 2, 3].map((i) => (
                  <article key={i} className="rounded-lg border border-[#efefef] bg-white p-3 md:p-5" aria-hidden>
                    <div className="mb-3 flex items-center justify-between md:mb-5">
                      <span className="h-8 w-8 animate-pulse rounded-lg bg-[#efefef] md:h-9 md:w-9" />
                      <span className="h-3 w-14 animate-pulse rounded bg-[#efefef]" />
                    </div>
                    <div className="mb-2 h-6 w-1/2 animate-pulse rounded bg-[#efefef]" />
                    <div className="h-3 w-3/4 animate-pulse rounded bg-[#efefef]" />
                  </article>
                ))
              : kpis.map(({ id, label, value, detail, icon: Icon }) => (
                  <article data-od-id={`crm-kpi-${id}`} key={id} className="rounded-lg border border-[#efefef] bg-white p-3 md:p-5">
                    <div className="mb-3 flex items-center justify-between md:mb-5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#efefef] text-[#627271] md:h-9 md:w-9"><Icon size={18} /></span>
                      <span className="max-w-[45%] truncate text-[9px] font-medium uppercase tracking-wide text-[#627271] md:text-[11px]">{periodo === "Todos os dados" ? "Acumulado" : periodo}</span>
                    </div>
                    <p className="truncate text-lg font-semibold tracking-tight text-[#1f2937] md:text-2xl">{value}</p>
                    <p className="mt-1 truncate text-xs font-medium text-[#1f2937] md:text-sm">{label}</p>
                    <p className="mt-1 text-[10px] text-[#627271] md:mt-2 md:text-xs">{detail}</p>
                  </article>
                ))}
          </section>

          <section className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
            {carregando ? (
              <PulsoCard className="min-h-[320px] bg-[#efefef]" />
            ) : (
              <article data-od-id="crm-pipeline-chart" className="rounded-lg border border-[#efefef] bg-white p-4 sm:p-6">
                <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between md:mb-6">
                  <div><h2 className="text-base font-semibold text-[#1f2937] md:text-lg">Pipeline por etapa</h2><p className="mt-1 text-xs text-[#627271] md:text-sm">Valor potencial e volume de oportunidades abertas</p></div>
                  <span className="text-xs font-semibold text-[#627271]">{formatCurrency(valorPipeline)} total</span>
                </div>
                {negociacoesAbertas.length === 0 ? (
                  <EmptyState text="Nenhuma oportunidade aberta no pipeline." />
                ) : (
                  <div className="space-y-4 md:space-y-5">
                    {funil.map((item) => (
                      <div data-od-id="crm-pipeline-stage" key={item.id}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-xs md:text-sm">
                          <span className="flex min-w-0 items-center gap-2 font-medium text-[#1f2937]">
                            <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.cor }} aria-hidden />
                            <span className="truncate">{item.label}</span>
                          </span>
                          <span className="shrink-0 text-[10px] text-[#627271] md:text-xs">{item.quantidade} {item.quantidade === 1 ? "oportunidade" : "oportunidades"} · {formatCurrency(item.valor)}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-[#efefef]">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.max((item.valor / maiorFunil) * 100, item.quantidade ? 8 : 0)}%`, background: item.cor }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#efefef] pt-4 text-[10px] text-[#627271] md:mt-7 md:text-xs"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#86cb92]" />Valor por etapa</span><span>As barras mostram o valor relativo entre etapas.</span></div>
              </article>
            )}

            {carregando ? (
              <PulsoCard className="min-h-[240px] bg-[#1f2937]" />
            ) : (
              <article data-od-id="crm-attention-list" className="rounded-lg border border-[#efefef] bg-[#1f2937] p-4 text-white sm:p-6"><div className="mb-5 flex items-start justify-between gap-3 md:mb-6"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#86cb92]">Atenção</p><h2 className="text-base font-semibold md:text-lg">Próximos movimentos</h2></div><Clock3 size={19} className="text-[#86cb92]" /></div>{atrasadas.length ? <div className="space-y-4">{atrasadas.map((negociacao) => <button data-od-id="crm-attention-item" type="button" key={negociacao.id} onClick={() => navigate("/crm/pipeline")} aria-label={`Abrir pipeline: ${negociacao.titulo}`} className="block w-full border-b border-[#627271] pb-4 text-left last:border-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]"><div className="flex items-start justify-between gap-3"><span className="text-sm font-medium">{negociacao.titulo}</span><ArrowRight size={15} className="mt-0.5 shrink-0 text-[#86cb92]" /></div><p className="mt-1 text-xs text-[#efefef]">{negociacao.clienteNome} · {negociacao.diasNaEtapa} dias na etapa {negociacao.etapa}</p><p className="mt-2 text-xs font-semibold text-[#86cb92]">Atrasada · {formatCurrency(negociacao.valor)}</p></button>)}</div> : <p className="text-sm leading-6 text-[#efefef]">Tudo em dia. Não há negociações atrasadas no momento.</p>}<button type="button" onClick={() => navigate("/crm/pipeline")} className="mt-6 inline-flex min-h-[44px] md:mt-7 md:min-h-0 items-center gap-2 text-sm font-semibold text-[#86cb92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]">Abrir pipeline <ArrowRight size={15} /></button></article>
            )}
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:gap-6 xl:grid-cols-2">
            <ListCard dataId="crm-recent-clients" title="Clientes recentes" action="Ver todos" onAction={() => navigate("/crm/clientes")}>
              {carregando ? (
                <PulsaLinhas />
              ) : recentes.length ? (
                recentes.map((cliente) => (
                  <button data-od-id="crm-recent-client-item" type="button" key={cliente.id} onClick={() => navigate(`/crm/clientes/${cliente.id}`)} aria-label={`Abrir detalhe de ${cliente.nome}`} className="flex min-h-[44px] w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-[#efefef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#efefef] text-xs font-semibold text-[#1f2937] md:h-10 md:w-10">{cliente.initials}</span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-semibold text-[#1f2937]">{cliente.nome}</strong>
                      <span className="mt-1 flex items-center gap-1 truncate text-xs text-[#627271]">
                        {cliente.cidade ? <><MapPin size={12} />{cliente.cidade}{cliente.desdeTexto ? ` · ${cliente.desdeTexto}` : ""}</> : (
                          <><CalendarDays size={12} />{cliente.desdeTexto || "sem data de cadastro"}</>
                        )}
                      </span>
                    </span>
                    {comprasDisponiveis && (
                      <span className="shrink-0 text-right">
                        <strong className="block text-sm font-semibold text-[#1f2937]">{formatCurrency(cliente.totalCompras)}</strong>
                        <span className="text-xs text-[#627271]">compras</span>
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-[#efefef] px-4 py-8 text-center">
                  <p className="mb-3 text-sm text-[#627271]">Nenhum cliente ainda.</p>
                  <button
                    type="button"
                    onClick={() => navigate("/crm/clientes")}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#86cb92] px-4 py-2 text-xs font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92] focus-visible:ring-offset-2"
                  >
                    <UserPlus size={14} /> Cadastrar primeiro cliente
                  </button>
                </div>
              )}
            </ListCard>
            <ListCard dataId="crm-active-deals" title="Negociações ativas" action="Ver pipeline" onAction={() => navigate("/crm/pipeline")}>
              {carregando ? (
                <PulsaLinhas />
              ) : ativas.length ? (
                ativas.map((negociacao) => (
                  <button data-od-id="crm-active-deal-item" type="button" key={negociacao.id} onClick={() => navigate("/crm/pipeline")} aria-label={`Abrir pipeline: ${negociacao.titulo}`} className="min-h-[44px] w-full rounded-lg border border-[#efefef] p-3 text-left transition-colors hover:bg-[#efefef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]">
                    <div className="flex items-start justify-between gap-3"><strong className="truncate text-sm font-semibold text-[#1f2937]">{negociacao.titulo}</strong><span className="shrink-0 text-sm font-semibold text-[#1f2937]">{formatShortCurrency(negociacao.valor)}</span></div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#627271]"><span>{negociacao.etapa}</span><span>Probabilidade {negociacao.probabilidade}%</span><span className="ml-auto inline-flex items-center gap-1 font-medium text-[#1f2937]"><ArrowRight size={13} /> pipeline</span></div>
                  </button>
                ))
              ) : (
                <EmptyState text="Nenhuma negociação ativa." />
              )}
            </ListCard>
          </section>
        </>
      )}
    </main>
  );
}

function PulsoCard({ className = "" }: { className?: string }) {
  return <article aria-hidden className={`rounded-lg border border-[#efefef] animate-pulse ${className}`} />;
}

function PulsaLinhas() {
  return (
    <div aria-hidden className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-[#efefef]" />
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-[#efefef] px-4 py-8 text-center text-sm text-[#627271]">{text}</div>;
}

function ListCard({ dataId, title, action, onAction, children }: { dataId: string; title: string; action: string; onAction: () => void; children: ReactNode }) {
  return <article data-od-id={dataId} className="rounded-lg border border-[#efefef] bg-white p-4 sm:p-6"><div className="mb-4 flex items-center justify-between gap-3 md:mb-5"><h2 className="text-base font-semibold text-[#1f2937] md:text-lg">{title}</h2><button type="button" onClick={onAction} className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-lg text-xs font-semibold text-[#627271] hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92] md:min-h-0">{action} <ArrowRight size={14} /></button></div><div className="space-y-2">{children}</div></article>;
}
