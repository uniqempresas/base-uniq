import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  AlertCircle,
  Calendar,
  Download,
  Edit3,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatarMoeda } from "./mockData";
import { useFluxoCaixa, type MovimentacaoFluxo } from "../../hooks/use-fluxo-caixa";
import { useCategoriasFinanceiras } from "../../hooks/use-categorias-financeiras";

type Formulario = Pick<MovimentacaoFluxo, "descricao" | "categoria" | "pessoa" | "valor" | "data" | "tipo"> & {
  pessoa?: string;
  categoriaId: string;
};

const formularioInicial: Formulario = {
  descricao: "", categoria: "", pessoa: "", valor: 0, data: mesAtual() + "-01", tipo: "entrada", categoriaId: "",
};

function mesAtual(): string {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

export function FluxoCaixaPage() {
  // Período padrão = mês corrente (mesmo comportamento do DRE). Antes era fixo em
  // "2025-03", o que fazia a tela abrir vazia para quem tem dados reais.
  const [periodo, setPeriodo] = useState<string>(mesAtual);
  const {
    movimentacoes,
    loading,
    error,
    isFallback,
    saldoInicial,
    criarMovimentacao,
    editarMovimentacao,
    excluirMovimentacao,
  } = useFluxoCaixa(periodo);
  const { categorias: categoriasFinanceiras } = useCategoriasFinanceiras();
  const [filtroTipo, setFiltroTipo] = useState<"entrada" | "saida" | "todos">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(formularioInicial);
  // ⚠️ Precisa vir DEPOIS de `formulario`: o callback lê `formulario.tipo`, e o
  // TypeScript NÃO acusa TDZ dentro de callback — só quebra em runtime.
  const categoriasDoTipo = categoriasFinanceiras.filter((c) =>
    formulario.tipo === "entrada" ? c.tipo === "receita" : c.tipo === "operacional" || c.tipo === "mercadoria"
  );
  const [feedback, setFeedback] = useState("");
  const [feedbackErro, setFeedbackErro] = useState("");

  const movimentacoesFiltradas = useMemo(() => movimentacoes.filter((mov) => {
    const termo = searchQuery.trim().toLowerCase();
    const busca = !termo || mov.descricao.toLowerCase().includes(termo) ||
      mov.pessoa?.toLowerCase().includes(termo) || mov.categoria.toLowerCase().includes(termo);
    return mov.data.startsWith(periodo) && (filtroTipo === "todos" || mov.tipo === filtroTipo) && busca;
  }), [movimentacoes, periodo, filtroTipo, searchQuery]);

  const totalEntradas = movimentacoesFiltradas.filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
  const totalSaidas = movimentacoesFiltradas.filter((m) => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
  const saldoFinal = saldoInicial + totalEntradas - totalSaidas;

  const dadosGrafico = useMemo(() => {
    const porDia: Record<string, { dia: string; entradas: number; saidas: number }> = {};
    movimentacoesFiltradas.forEach((mov) => {
      const dia = mov.data.slice(8, 10);
      porDia[dia] ??= { dia: `${dia}/${periodo.slice(5)}`, entradas: 0, saidas: 0 };
      porDia[dia][mov.tipo === "entrada" ? "entradas" : "saidas"] += mov.valor;
    });
    return Object.values(porDia).sort((a, b) => a.dia.localeCompare(b.dia));
  }, [movimentacoesFiltradas, periodo]);

  const abrirNovo = () => {
    setEditandoId(null);
    setFormulario({ ...formularioInicial, data: `${periodo}-01` });
    setMostrarModal(true);
  };

  const abrirEdicao = (mov: MovimentacaoFluxo) => {
    setEditandoId(mov.id);
    setFormulario({ descricao: mov.descricao, categoria: mov.categoria, pessoa: mov.pessoa ?? "", valor: mov.valor, data: mov.data.slice(0, 10), tipo: mov.tipo, categoriaId: mov.categoriaId ?? "" });
    setMostrarModal(true);
  };

  const salvar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formulario.descricao.trim() || !formulario.valor || !formulario.data) return;
    setFeedbackErro("");
    if (editandoId) {
      const resultado = await editarMovimentacao(editandoId, {
        descricao: formulario.descricao.trim(),
        valor: Number(formulario.valor),
        data: `${formulario.data}T12:00:00`,
        categoriaId: formulario.categoriaId || null,
      });
      if (resultado.error) {
        setFeedbackErro(resultado.error);
        return;
      }
      setFeedback("Movimentação atualizada.");
    } else {
      const resultado = await criarMovimentacao({
        descricao: formulario.descricao.trim(),
        categoria: formulario.categoria,
        tipo: formulario.tipo,
        pessoa: formulario.pessoa || undefined,
        valor: Number(formulario.valor),
        data: `${formulario.data}T12:00:00`,
        status: "pago",
        origem: formulario.tipo === "entrada" ? "conta_receber" : "conta_pagar",
        origemId: "",
        categoriaId: formulario.categoriaId || null,
      });
      if (resultado.error) {
        setFeedbackErro(resultado.error);
        return;
      }
      setFeedback("Movimentação adicionada.");
    }
    setMostrarModal(false);
  };

  const excluir = async (mov: MovimentacaoFluxo) => {
    const resultado = await excluirMovimentacao(mov.id, mov.origem);
    if (resultado.error) {
      setFeedbackErro(resultado.error);
      return;
    }
    setFeedback("Movimentação excluída.");
  };

  const campo = "w-full rounded-lg border border-[#627271] bg-white px-3 py-2.5 text-sm text-[#1f2937] outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]";
  const botaoFoco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f2937] focus-visible:ring-offset-2";
  const kpis: Array<{ label: string; value: number; Icon: ComponentType<{ size?: number }>; type: "positivo" | "negativo" | "neutro" }> = [
    { label: "Saldo inicial", value: saldoInicial, Icon: Wallet, type: "neutro" },
    { label: "Total de entradas", value: totalEntradas, Icon: TrendingUp, type: "positivo" },
    { label: "Total de saídas", value: totalSaidas, Icon: TrendingDown, type: "negativo" },
    { label: "Saldo final", value: saldoFinal, Icon: Wallet, type: saldoFinal >= 0 ? "positivo" : "negativo" },
  ];

  return (
    <main data-od-id="fluxo-caixa-regiao" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#627271]">Financeiro / Visão geral</p>
          <h1 data-od-id="fluxo-caixa-heading" className="text-3xl font-semibold tracking-tight text-[#1f2937]">Fluxo de caixa</h1>
          <p className="mt-1 text-sm text-[#627271]">Acompanhe o que entrou e saiu do seu negócio.</p>
          {isFallback && (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#efefef] px-2 py-1 text-xs font-semibold text-[#627271]">
              <AlertCircle size={12} />
              Dados de exemplo
            </span>
          )}
        </div>
        <button data-od-id="fluxo-caixa-cta" onClick={abrirNovo} className={`inline-flex min-h-[36px] items-center justify-center gap-2 rounded-lg bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] transition hover:bg-[#1f2937] hover:text-white ${botaoFoco}`}>
          <Plus size={18} /> Nova movimentação
        </button>
      </header>

      {feedback && <div role="status" className="mb-5 flex items-center justify-between rounded-lg border border-[#86cb92] bg-[#efefef] px-4 py-3 text-sm text-[#1f2937]">{feedback}<button aria-label="Fechar aviso" onClick={() => setFeedback("")} className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-black/5"><X size={16} /></button></div>}
      {feedbackErro && <div role="alert" className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{feedbackErro}<button aria-label="Fechar aviso" onClick={() => setFeedbackErro("")} className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-black/5"><X size={16} /></button></div>}

      {error && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">Erro ao carregar dados financeiros. Tente novamente.</span>
          <button
            onClick={() => window.location.reload()}
            className={`flex min-h-[36px] items-center gap-1.5 rounded-lg bg-white border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-100 transition-colors ${botaoFoco}`}
            style={{ fontWeight: 600 }}
          >
            <RefreshCw size={12} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Loading: skeleton nos KPIs */}
      {loading ? (
        <section aria-label="Indicadores do período" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-[#efefef] bg-white p-3 sm:p-4 animate-pulse">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="h-4 w-20 sm:w-28 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-7 w-28 sm:h-8 sm:w-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </section>
      ) : (
        <section aria-label="Indicadores do período" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map(({ label, value, Icon, type }) => (
            <div key={label} className="rounded-lg border border-[#efefef] bg-white p-3 sm:p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="truncate text-xs text-[#627271] sm:text-sm">{label}</span>
                <span className={`shrink-0 rounded-lg p-1.5 sm:p-2 ${type === "negativo" ? "bg-red-50 text-red-600" : "bg-[#efefef] text-[#1f2937]"}`}>
                  <Icon size={15} />
                </span>
              </div>
              <strong className={`block truncate text-lg font-semibold sm:text-2xl ${type === "negativo" ? "text-red-900" : "text-[#1f2937]"}`} title={formatarMoeda(value)}>
                {formatarMoeda(value)}
              </strong>
            </div>
          ))}
        </section>
      )}

      <section data-od-id="fluxo-caixa-filtros" className="mb-6 rounded-lg border border-[#efefef] bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[180px_180px_1fr]">
          <label className="text-sm font-semibold text-[#1f2937]">Período <span className="relative mt-1 block"><Calendar size={16} className="pointer-events-none absolute left-3 top-3 text-[#627271]" /><input aria-label="Período" type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} className={`${campo} pl-9`} /></span></label>
          <label className="text-sm font-semibold text-[#1f2937]">Tipo <span className="relative mt-1 block"><Filter size={16} className="pointer-events-none absolute left-3 top-3 text-[#627271]" /><select aria-label="Tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as "entrada" | "saida" | "todos")} className={`${campo} pl-9`}><option value="todos">Todos</option><option value="entrada">Entradas</option><option value="saida">Saídas</option></select></span></label>
          <label className="text-sm font-semibold text-[#1f2937]">Buscar <span className="relative mt-1 block"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#627271]" /><input aria-label="Buscar movimentações" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Descrição, categoria ou pessoa" className={`${campo} pl-9`} /></span></label>
        </div>
      </section>

      <section data-od-id="fluxo-caixa-grafico" className="mb-6 rounded-lg border border-[#efefef] bg-white p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1f2937]">Entradas e saídas</h2>
            <p className="mt-1 text-sm text-[#627271]">Movimentações agrupadas por dia</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-[#627271]">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#86cb92]" aria-hidden="true"></span>Entradas</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#627271]" aria-hidden="true"></span>Saídas</span>
            </div>
          </div>
          <span className="text-xs text-[#627271]">{movimentacoesFiltradas.length} registros</span>
        </div>
        {loading ? <div className="h-56 w-full rounded-lg bg-gray-200 animate-pulse sm:h-72"></div> : dadosGrafico.length ? <div className="h-56 sm:h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={dadosGrafico} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><CartesianGrid stroke="#efefef" strokeDasharray="3 3" /><XAxis dataKey="dia" stroke="#627271" tick={{ fontSize: 10, fill: "#627271" }} tickLine={false} interval="preserveStartEnd" minTickGap={24} /><YAxis stroke="#627271" width={46} tick={{ fontSize: 10, fill: "#627271" }} tickLine={false} axisLine={false} tickFormatter={(value: number) => { const n = Number(value); if (Math.abs(n) >= 1000) return `R$ ${(n / 1000).toFixed(1).replace(".", ",")} mil`; return `R$ ${n}`; }} /><Tooltip formatter={(value) => formatarMoeda(Number(value))} contentStyle={{ border: "1px solid #627271", borderRadius: "8px", color: "#1f2937" }} /><Line type="monotone" dataKey="entradas" name="Entradas" stroke="#86cb92" strokeWidth={3} dot={{ fill: "#86cb92" }} /><Line type="monotone" dataKey="saidas" name="Saídas" stroke="#627271" strokeWidth={3} dot={{ fill: "#627271" }} /></LineChart></ResponsiveContainer></div> : <div className="flex h-56 flex-col items-center justify-center gap-2 px-6 text-center sm:h-72"><Wallet size={20} className="text-[#627271]" /><p className="text-sm text-[#627271]">Nenhum dado para os filtros selecionados.</p></div>}
      </section>

      <section className="overflow-hidden rounded-lg border border-[#efefef] bg-white" data-od-id="fluxo-caixa-tabela">
        <div className="flex flex-col gap-3 border-b border-[#efefef] p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-[#1f2937]">Movimentações</h2><p className="text-sm text-[#627271]">{movimentacoesFiltradas.length} itens encontrados</p></div><button onClick={() => { setFeedback("Exportação demonstrativa pronta para download."); }} className={`inline-flex min-h-[36px] items-center gap-2 self-start rounded-lg border border-[#627271] px-3 py-2 text-sm font-semibold text-[#1f2937] hover:bg-[#efefef] ${botaoFoco}`}><Download size={16} /> Exportar</button></div>
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded bg-gray-200 animate-pulse"></div>)}
          </div>
        ) : movimentacoesFiltradas.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="font-semibold text-[#1f2937]">
              {isFallback ? "Nenhuma movimentação encontrada" : "Nenhuma movimentação registrada neste período."}
            </p>
            <p className="mt-1 text-sm text-[#627271]">Ajuste os filtros ou registre uma nova movimentação.</p>
            <button onClick={abrirNovo} className={`mt-5 inline-flex min-h-[36px] items-center gap-2 rounded-lg bg-[#86cb92] px-4 py-2 text-sm font-semibold text-[#1f2937] ${botaoFoco}`}><Plus size={16} /> Adicionar movimentação</button>
          </div>
        ) : (
          <>
            {/* Cards — mobile (sem corte de conteúdo, alvos de toque ≥ 36px) */}
            <div className="md:hidden divide-y divide-[#efefef]">
              {movimentacoesFiltradas.map((mov) => (
                <div key={mov.id} data-od-id={`fluxo-caixa-linha-${mov.id}`} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#1f2937]">{mov.descricao}</p>
                      <p className="mt-0.5 text-xs text-[#627271]">
                        {new Date(mov.data).toLocaleDateString("pt-BR")} • {mov.categoria}
                      </p>
                      {mov.pessoa && <p className="text-xs text-[#627271]">{mov.pessoa}</p>}
                    </div>
                    <p className={`shrink-0 text-sm font-semibold ${mov.tipo === "entrada" ? "text-[#1f2937]" : "text-red-700"}`}>
                      {mov.tipo === "entrada" ? "+" : "−"} {formatarMoeda(mov.valor)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="rounded border border-[#627271] px-2 py-1 text-xs font-semibold text-[#1f2937]">{mov.tipo === "entrada" ? "Entrada" : "Saída"}</span>
                    <div className="flex gap-2">
                      <button aria-label={`Editar ${mov.descricao}`} title="Editar" onClick={() => abrirEdicao(mov)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-[#627271] hover:bg-[#efefef] hover:text-[#1f2937] ${botaoFoco}`}><Edit3 size={16} /></button>
                      <button aria-label={`Excluir ${mov.descricao}`} title="Excluir" onClick={() => excluir(mov)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 ${botaoFoco}`}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela — desktop com scroll controlado */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-[#efefef] text-xs font-semibold uppercase tracking-wide text-[#627271]"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Descrição</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3 text-right">Ações</th></tr></thead>
                <tbody>{movimentacoesFiltradas.map((mov) => <tr data-od-id={`fluxo-caixa-linha-${mov.id}`} key={mov.id} className="border-t border-[#efefef] text-sm hover:bg-[#efefef]"><td className="whitespace-nowrap px-4 py-3 text-[#627271]">{new Date(mov.data).toLocaleDateString("pt-BR")}</td><td className="px-4 py-3"><p className="font-semibold text-[#1f2937]">{mov.descricao}</p>{mov.pessoa && <p className="mt-0.5 text-xs text-[#627271]">{mov.pessoa}</p>}</td><td className="px-4 py-3 text-[#1f2937]">{mov.categoria}</td><td className="px-4 py-3"><span className="rounded border border-[#627271] px-2 py-1 text-xs font-semibold text-[#1f2937]">{mov.tipo === "entrada" ? "Entrada" : "Saída"}</span></td><td className="px-4 py-3 text-right font-semibold text-[#1f2937]">{mov.tipo === "entrada" ? "+" : "−"} {formatarMoeda(mov.valor)}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button aria-label={`Editar ${mov.descricao}`} title="Editar" onClick={() => abrirEdicao(mov)} className={`rounded-lg p-2 text-[#627271] hover:bg-[#efefef] hover:text-[#1f2937] ${botaoFoco}`}><Edit3 size={16} /></button><button aria-label={`Excluir ${mov.descricao}`} title="Excluir" onClick={() => excluir(mov)} className={`rounded-lg p-2 text-red-600 hover:bg-red-50 ${botaoFoco}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {mostrarModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/60 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setMostrarModal(false); }}><div data-od-id="fluxo-caixa-modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h2 id="modal-titulo" className="text-xl font-semibold text-[#1f2937]">{editandoId ? "Editar movimentação" : "Nova movimentação"}</h2><p className="mt-1 text-sm text-[#627271]">Preencha os dados para manter seu caixa atualizado.</p></div><button aria-label="Fechar modal" onClick={() => setMostrarModal(false)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-[#627271] hover:bg-[#efefef] ${botaoFoco}`}><X size={18} /></button></div><form onSubmit={salvar} className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-semibold text-[#1f2937]">Descrição *<input required value={formulario.descricao} onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })} className={`${campo} mt-1`} placeholder="Ex.: Venda de produtos" /></label><label className="text-sm font-semibold text-[#1f2937]">Categoria<select value={formulario.categoriaId} onChange={(e) => setFormulario({ ...formulario, categoriaId: e.target.value })} className={`${campo} mt-1`}><option value="">Sem categoria</option>{categoriasDoTipo.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}</select></label><label className="text-sm font-semibold text-[#1f2937]">Tipo<select value={formulario.tipo} onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value as "entrada" | "saida", categoriaId: "" })} className={`${campo} mt-1`}><option value="entrada">Entrada</option><option value="saida">Saída</option></select></label><label className="text-sm font-semibold text-[#1f2937]">Pessoa<input value={formulario.pessoa ?? ""} onChange={(e) => setFormulario({ ...formulario, pessoa: e.target.value })} className={`${campo} mt-1`} placeholder="Ex.: Maria Santos" /></label><label className="text-sm font-semibold text-[#1f2937]">Valor *<input required type="number" min="0" step="0.01" value={formulario.valor} onChange={(e) => setFormulario({ ...formulario, valor: Number(e.target.value) })} className={`${campo} mt-1`} placeholder="0,00" /></label><label className="text-sm font-semibold text-[#1f2937]">Data *<input required type="date" value={formulario.data.slice(0, 10)} onChange={(e) => setFormulario({ ...formulario, data: e.target.value })} className={`${campo} mt-1`} /></label><div className="mt-2 flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setMostrarModal(false)} className={`rounded-lg border border-[#627271] px-4 py-2 text-sm font-semibold text-[#1f2937] hover:bg-[#efefef] ${botaoFoco}`}>Cancelar</button><button type="submit" className={`rounded-lg bg-[#86cb92] px-4 py-2 text-sm font-semibold text-[#1f2937] hover:bg-[#1f2937] hover:text-white ${botaoFoco}`}>Salvar</button></div></form></div></div>}
    </main>
  );
}