import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  DollarSign,
  Kanban,
  MapPin,
  Target,
  UserPlus,
  Users,
} from "lucide-react";
import { CLIENTES, NEGOCIACOES, PIPELINE_ETAPAS, formatCurrency } from "./crmMockData";

const formatShortCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });

export function CRMDashboardPage() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("Todos os dados");

  const clientesAtivos = CLIENTES.filter((cliente) => cliente.status === "ativo");
  const negociacoesAbertas = NEGOCIACOES.filter((negociacao) => !["ganho", "perdido"].includes(negociacao.etapa));
  const negociacoesEncerradas = NEGOCIACOES.filter((negociacao) => ["ganho", "perdido"].includes(negociacao.etapa));
  const valorPipeline = negociacoesAbertas.reduce((total, negociacao) => total + negociacao.valor, 0);
  const ganhas = NEGOCIACOES.filter((negociacao) => negociacao.etapa === "ganho").length;
  const conversao = negociacoesEncerradas.length ? Math.round((ganhas / negociacoesEncerradas.length) * 100) : 0;
  const atrasadas = negociacoesAbertas.filter((negociacao) => negociacao.atrasado).slice(0, 3);
  const recentes = CLIENTES.slice(0, 5);
  const ativas = negociacoesAbertas.slice(0, 5);

  const funil = useMemo(
    () => PIPELINE_ETAPAS.filter((etapa) => !["ganho", "perdido"].includes(etapa.id)).map((etapa) => {
      const items = negociacoesAbertas.filter((negociacao) => negociacao.etapa === etapa.id);
      return { ...etapa, quantidade: items.length, valor: items.reduce((total, item) => total + item.valor, 0) };
    }),
    [negociacoesAbertas],
  );
  const maiorFunil = Math.max(...funil.map((item) => item.valor), 1);

  const kpis = [
    { id: "clientes", label: "Total de clientes", value: CLIENTES.length, detail: `${clientesAtivos.length} ativos`, icon: Users },
    { id: "ativos", label: "Clientes ativos", value: clientesAtivos.length, detail: `${CLIENTES.length - clientesAtivos.length} sem atividade`, icon: CheckCircle2 },
    { id: "pipeline", label: "Valor do pipeline", value: formatCurrency(valorPipeline), detail: `${negociacoesAbertas.length} negociações abertas`, icon: DollarSign },
    { id: "conversao", label: "Conversão", value: `${conversao}%`, detail: `${ganhas} negociação${ganhas === 1 ? " ganha" : " ganhas"}`, icon: Target },
  ];

  return (
    <main data-od-id="crm-dashboard" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-5 border-b border-[#efefef] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#627271]">Base UNIQ · CRM</p>
          <h1 data-od-id="crm-dashboard-heading" className="text-3xl font-semibold tracking-tight text-[#1f2937]">Dashboard CRM</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#627271]">Uma visão objetiva para acompanhar relacionamentos, oportunidades e próximos movimentos.</p>
        </div>
        <div data-od-id="crm-dashboard-cta" className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => navigate("/crm/clientes")} aria-label="Cadastrar novo cliente" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92] focus-visible:ring-offset-2">
            <UserPlus size={17} /> Novo cliente
          </button>
          <button type="button" onClick={() => navigate("/crm/pipeline")} aria-label="Ver pipeline de vendas" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#627271] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#efefef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92] focus-visible:ring-offset-2">
            <Kanban size={17} /> Ver pipeline
          </button>
        </div>
      </header>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1f2937]">Resumo operacional</h2>
          <p className="mt-1 text-xs text-[#627271]">Dados de demonstração do CRM</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-[#627271]">
          <span className="sr-only">Período</span>
          <select value={periodo} onChange={(event) => setPeriodo(event.target.value)} aria-label="Filtrar período" className="rounded-lg border border-[#efefef] bg-white px-3 py-2 text-xs text-[#1f2937] outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]">
            <option>Todos os dados</option><option>Últimos 30 dias</option><option>Últimos 90 dias</option>
          </select>
        </label>
      </div>

      <section data-od-id="crm-kpi-cards" aria-label="Indicadores principais" className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ id, label, value, detail, icon: Icon }) => (
          <article data-od-id={`crm-kpi-${id}`} key={id} className="rounded-lg border border-[#efefef] bg-white p-5">
            <div className="mb-5 flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#efefef] text-[#627271]"><Icon size={18} /></span><span className="text-[11px] font-medium uppercase tracking-wide text-[#627271]">{periodo === "Todos os dados" ? "Acumulado" : periodo}</span></div>
            <p className="text-2xl font-semibold tracking-tight text-[#1f2937]">{value}</p><p className="mt-1 text-sm font-medium text-[#1f2937]">{label}</p><p className="mt-2 text-xs text-[#627271]">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <article data-od-id="crm-pipeline-chart" className="rounded-lg border border-[#efefef] bg-white p-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-semibold text-[#1f2937]">Pipeline por etapa</h2><p className="mt-1 text-sm text-[#627271]">Valor potencial e volume de oportunidades abertas</p></div><span className="text-xs font-semibold text-[#627271]">{formatCurrency(valorPipeline)} total</span></div>
          {funil.length ? <div className="space-y-5">{funil.map((item) => <div data-od-id="crm-pipeline-stage" key={item.id}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="font-medium text-[#1f2937]">{item.label}</span><span className="text-xs text-[#627271]">{item.quantidade} {item.quantidade === 1 ? "oportunidade" : "oportunidades"} · {formatCurrency(item.valor)}</span></div><div className="h-3 overflow-hidden rounded-full bg-[#efefef]"><div className="h-full rounded-full bg-[#86cb92] transition-all" style={{ width: `${Math.max((item.valor / maiorFunil) * 100, item.quantidade ? 8 : 0)}%` }} /></div></div>)}</div> : <EmptyState text="Nenhuma oportunidade aberta no pipeline." />}
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#efefef] pt-4 text-xs text-[#627271]"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#86cb92]" />Valor por etapa</span><span>As barras mostram o valor relativo entre etapas.</span></div>
        </article>

        <article data-od-id="crm-attention-list" className="rounded-lg border border-[#efefef] bg-[#1f2937] p-5 text-white sm:p-6"><div className="mb-6 flex items-start justify-between gap-3"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#86cb92]">Atenção</p><h2 className="text-lg font-semibold">Próximos movimentos</h2></div><Clock3 size={19} className="text-[#86cb92]" /></div>{atrasadas.length ? <div className="space-y-4">{atrasadas.map((negociacao) => <button data-od-id="crm-attention-item" type="button" key={negociacao.id} onClick={() => navigate("/crm/pipeline")} aria-label={`Abrir pipeline: ${negociacao.titulo}`} className="block w-full border-b border-[#627271] pb-4 text-left last:border-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]"><div className="flex items-start justify-between gap-3"><span className="text-sm font-medium">{negociacao.titulo}</span><ArrowRight size={15} className="mt-0.5 shrink-0 text-[#86cb92]" /></div><p className="mt-1 text-xs text-[#efefef]">{negociacao.clienteNome} · {negociacao.proximaAcao}</p><p className="mt-2 text-xs font-semibold text-[#86cb92]">Atrasada · {formatCurrency(negociacao.valor)}</p></button>)}</div> : <p className="text-sm leading-6 text-[#efefef]">Tudo em dia. Não há negociações atrasadas no momento.</p>}<button type="button" onClick={() => navigate("/crm/pipeline")} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#86cb92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]">Abrir pipeline <ArrowRight size={15} /></button></article>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ListCard dataId="crm-recent-clients" title="Clientes recentes" action="Ver todos" onAction={() => navigate("/crm/clientes")}>
          {recentes.length ? recentes.map((cliente) => <button data-od-id="crm-recent-client-item" type="button" key={cliente.id} onClick={() => navigate(`/crm/clientes/${cliente.id}`)} aria-label={`Abrir detalhe de ${cliente.nome}`} className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-[#efefef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#efefef] text-xs font-semibold text-[#1f2937]">{cliente.initials}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold text-[#1f2937]">{cliente.nome}</strong><span className="mt-1 flex items-center gap-1 truncate text-xs text-[#627271]"><MapPin size={12} />{cliente.cidade} · {cliente.ultimaInteracao}</span></span><span className="shrink-0 text-right"><strong className="block text-sm font-semibold text-[#1f2937]">{formatCurrency(cliente.totalCompras)}</strong><span className="text-xs text-[#627271]">compras</span></span></button>) : <EmptyState text="Nenhum cliente recente." />}
        </ListCard>
        <ListCard dataId="crm-active-deals" title="Negociações ativas" action="Ver pipeline" onAction={() => navigate("/crm/pipeline")}>
          {ativas.length ? ativas.map((negociacao) => <button data-od-id="crm-active-deal-item" type="button" key={negociacao.id} onClick={() => navigate("/crm/pipeline")} aria-label={`Abrir pipeline: ${negociacao.titulo}`} className="w-full rounded-lg border border-[#efefef] p-3 text-left transition-colors hover:bg-[#efefef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]"><div className="flex items-start justify-between gap-3"><strong className="truncate text-sm font-semibold text-[#1f2937]">{negociacao.titulo}</strong><span className="shrink-0 text-sm font-semibold text-[#1f2937]">{formatShortCurrency(negociacao.valor)}</span></div><div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#627271]"><span>{PIPELINE_ETAPAS.find((etapa) => etapa.id === negociacao.etapa)?.label || negociacao.etapa}</span><span>Probabilidade {negociacao.probabilidade}%</span><span className="ml-auto inline-flex items-center gap-1 font-medium text-[#1f2937]"><ArrowRight size={13} /> pipeline</span></div></button>) : <EmptyState text="Nenhuma negociação ativa." />}
        </ListCard>
      </section>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-[#efefef] px-4 py-8 text-center text-sm text-[#627271]">{text}</div>;
}

function ListCard({ dataId, title, action, onAction, children }: { dataId: string; title: string; action: string; onAction: () => void; children: ReactNode }) {
  return <article data-od-id={dataId} className="rounded-lg border border-[#efefef] bg-white p-5 sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-[#1f2937]">{title}</h2><button type="button" onClick={onAction} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#627271] hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]">{action} <ArrowRight size={14} /></button></div><div className="space-y-2">{children}</div></article>;
}
