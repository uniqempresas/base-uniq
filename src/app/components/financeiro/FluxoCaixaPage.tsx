import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  Calendar,
  Download,
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatarMoeda, movimentacoesMock, Movimentacao, Categoria, TipoMovimentacao } from "./mockData";

const categorias: Categoria[] = [
  "Vendas", "Aluguel", "Internet", "Luz", "Água", "Fornecedores", "Impostos",
  "Salários", "Marketing", "Outras Receitas", "Outras Despesas",
];

type Formulario = Pick<Movimentacao, "descricao" | "categoria" | "pessoa" | "valor" | "data" | "tipo">;

const formularioInicial: Formulario = {
  descricao: "", categoria: "Vendas", pessoa: "", valor: 0, data: "2025-03-31", tipo: "entrada",
};

export function FluxoCaixaPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(movimentacoesMock);
  const [periodo, setPeriodo] = useState("2025-03");
  const [filtroTipo, setFiltroTipo] = useState<TipoMovimentacao | "todos">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(formularioInicial);
  const [feedback, setFeedback] = useState("");

  const movimentacoesFiltradas = useMemo(() => movimentacoes.filter((mov) => {
    const termo = searchQuery.trim().toLowerCase();
    const busca = !termo || mov.descricao.toLowerCase().includes(termo) ||
      mov.pessoa?.toLowerCase().includes(termo) || mov.categoria.toLowerCase().includes(termo);
    return mov.data.startsWith(periodo) && (filtroTipo === "todos" || mov.tipo === filtroTipo) && busca;
  }), [movimentacoes, periodo, filtroTipo, searchQuery]);

  const totalEntradas = movimentacoesFiltradas.filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
  const totalSaidas = movimentacoesFiltradas.filter((m) => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
  const saldoInicial = 3500;
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

  const abrirEdicao = (mov: Movimentacao) => {
    setEditandoId(mov.id);
    setFormulario({ descricao: mov.descricao, categoria: mov.categoria, pessoa: mov.pessoa ?? "", valor: mov.valor, data: mov.data.slice(0, 10), tipo: mov.tipo });
    setMostrarModal(true);
  };

  const salvar = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formulario.descricao.trim() || !formulario.valor || !formulario.data) return;
    if (editandoId) {
      setMovimentacoes((lista) => lista.map((mov) => mov.id === editandoId ? { ...mov, ...formulario, descricao: formulario.descricao.trim(), data: `${formulario.data}T12:00:00`, status: mov.status } : mov));
      setFeedback("Movimentação atualizada.");
    } else {
      setMovimentacoes((lista) => [...lista, { ...formulario, id: `mov-${Date.now()}`, descricao: formulario.descricao.trim(), valor: Number(formulario.valor), data: `${formulario.data}T12:00:00`, status: "pago" }]);
      setFeedback("Movimentação adicionada.");
    }
    setMostrarModal(false);
  };

  const excluir = (id: string) => {
    if (!window.confirm("Excluir esta movimentação? Esta ação não pode ser desfeita.")) return;
    setMovimentacoes((lista) => lista.filter((mov) => mov.id !== id));
    setFeedback("Movimentação excluída.");
  };

  const campo = "w-full rounded-lg border border-[#627271] bg-white px-3 py-2.5 text-sm text-[#1f2937] outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]";
  const botaoFoco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f2937] focus-visible:ring-offset-2";
  const kpis: Array<{ label: string; value: number; Icon: ComponentType<{ size?: number }>; type: string }> = [
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
        </div>
        <button data-od-id="fluxo-caixa-cta" onClick={abrirNovo} className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] transition hover:bg-[#1f2937] hover:text-white ${botaoFoco}`}>
          <Plus size={18} /> Nova movimentação
        </button>
      </header>

      {feedback && <div role="status" className="mb-5 flex items-center justify-between rounded-lg border border-[#86cb92] bg-[#efefef] px-4 py-3 text-sm text-[#1f2937]">{feedback}<button aria-label="Fechar aviso" onClick={() => setFeedback("")}><X size={16} /></button></div>}

      <section aria-label="Indicadores do período" className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, Icon, type }) => <div key={label} className="rounded-lg border border-[#efefef] bg-white p-4">
          <div className="mb-4 flex items-start justify-between"><span className="text-sm text-[#627271]">{label}</span><span className="rounded-lg bg-[#efefef] p-2 text-[#1f2937]"><Icon size={18} /></span></div>
          <strong className="text-2xl font-semibold text-[#1f2937]">{formatarMoeda(value)}</strong>
          <p className="mt-1 text-xs text-[#627271]">{type === "positivo" ? "↑ Movimento favorável" : type === "negativo" ? "↓ Acompanhe este valor" : "Referência do período"}</p>
        </div>)}
      </section>

      <section data-od-id="fluxo-caixa-filtros" className="mb-6 rounded-lg border border-[#efefef] bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[180px_180px_1fr]">
          <label className="text-sm font-semibold text-[#1f2937]">Período <span className="relative mt-1 block"><Calendar size={16} className="pointer-events-none absolute left-3 top-3 text-[#627271]" /><input aria-label="Período" type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} className={`${campo} pl-9`} /></span></label>
          <label className="text-sm font-semibold text-[#1f2937]">Tipo <span className="relative mt-1 block"><Filter size={16} className="pointer-events-none absolute left-3 top-3 text-[#627271]" /><select aria-label="Tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as TipoMovimentacao | "todos")} className={`${campo} pl-9`}><option value="todos">Todos</option><option value="entrada">Entradas</option><option value="saida">Saídas</option></select></span></label>
          <label className="text-sm font-semibold text-[#1f2937]">Buscar <span className="relative mt-1 block"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#627271]" /><input aria-label="Buscar movimentações" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Descrição, categoria ou pessoa" className={`${campo} pl-9`} /></span></label>
        </div>
      </section>

      <section data-od-id="fluxo-caixa-grafico" className="mb-6 rounded-lg border border-[#efefef] bg-white p-4 sm:p-6">
        <div className="mb-5 flex items-end justify-between"><div><h2 className="text-lg font-semibold text-[#1f2937]">Entradas e saídas</h2><p className="mt-1 text-sm text-[#627271]">Movimentações agrupadas por dia</p></div><span className="text-xs text-[#627271]">{movimentacoesFiltradas.length} registros</span></div>
        {dadosGrafico.length ? <ResponsiveContainer width="100%" height={280}><LineChart data={dadosGrafico} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}><CartesianGrid stroke="#efefef" strokeDasharray="3 3" /><XAxis dataKey="dia" stroke="#627271" tick={{ fontSize: 11 }} /><YAxis stroke="#627271" tick={{ fontSize: 11 }} tickFormatter={(value) => `R$ ${value}`} /><Tooltip formatter={(value) => formatarMoeda(Number(value))} contentStyle={{ border: "1px solid #627271", borderRadius: "8px", color: "#1f2937" }} /><Legend /><Line type="monotone" dataKey="entradas" name="Entradas" stroke="#86cb92" strokeWidth={3} dot={{ fill: "#86cb92" }} /><Line type="monotone" dataKey="saidas" name="Saídas" stroke="#627271" strokeWidth={3} dot={{ fill: "#627271" }} /></LineChart></ResponsiveContainer> : <p className="py-16 text-center text-sm text-[#627271]">Nenhum dado para os filtros selecionados.</p>}
      </section>

      <section className="overflow-hidden rounded-lg border border-[#efefef] bg-white" data-od-id="fluxo-caixa-tabela">
        <div className="flex flex-col gap-3 border-b border-[#efefef] p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-[#1f2937]">Movimentações</h2><p className="text-sm text-[#627271]">{movimentacoesFiltradas.length} itens encontrados</p></div><button onClick={() => { setFeedback("Exportação demonstrativa pronta para download."); }} className={`inline-flex items-center gap-2 self-start rounded-lg border border-[#627271] px-3 py-2 text-sm font-semibold text-[#1f2937] hover:bg-[#efefef] ${botaoFoco}`}><Download size={16} /> Exportar</button></div>
        {movimentacoesFiltradas.length === 0 ? <div className="px-4 py-14 text-center"><p className="font-semibold text-[#1f2937]">Nenhuma movimentação encontrada</p><p className="mt-1 text-sm text-[#627271]">Ajuste os filtros ou registre uma nova movimentação.</p><button onClick={abrirNovo} className={`mt-5 rounded-lg bg-[#86cb92] px-4 py-2 text-sm font-semibold text-[#1f2937] ${botaoFoco}`}>Adicionar movimentação</button></div> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="bg-[#efefef] text-xs font-semibold uppercase tracking-wide text-[#627271]"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Descrição</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3 text-right">Ações</th></tr></thead><tbody>{movimentacoesFiltradas.map((mov) => <tr data-od-id={`fluxo-caixa-linha-${mov.id}`} key={mov.id} className="border-t border-[#efefef] text-sm hover:bg-[#efefef]"><td className="whitespace-nowrap px-4 py-3 text-[#627271]">{new Date(mov.data).toLocaleDateString("pt-BR")}</td><td className="px-4 py-3"><p className="font-semibold text-[#1f2937]">{mov.descricao}</p>{mov.pessoa && <p className="mt-0.5 text-xs text-[#627271]">{mov.pessoa}</p>}</td><td className="px-4 py-3 text-[#1f2937]">{mov.categoria}</td><td className="px-4 py-3"><span className="rounded border border-[#627271] px-2 py-1 text-xs font-semibold text-[#1f2937]">{mov.tipo === "entrada" ? "Entrada" : "Saída"}</span></td><td className="px-4 py-3 text-right font-semibold text-[#1f2937]">{mov.tipo === "entrada" ? "+" : "−"} {formatarMoeda(mov.valor)}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button aria-label={`Editar ${mov.descricao}`} title="Editar" onClick={() => abrirEdicao(mov)} className={`rounded-lg p-2 text-[#627271] hover:bg-[#efefef] hover:text-[#1f2937] ${botaoFoco}`}><Edit3 size={16} /></button><button aria-label={`Excluir ${mov.descricao}`} title="Excluir" onClick={() => excluir(mov.id)} className={`rounded-lg p-2 text-[#627271] hover:bg-[#efefef] hover:text-[#1f2937] ${botaoFoco}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
      </section>

      {mostrarModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/60 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setMostrarModal(false); }}><div data-od-id="fluxo-caixa-modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h2 id="modal-titulo" className="text-xl font-semibold text-[#1f2937]">{editandoId ? "Editar movimentação" : "Nova movimentação"}</h2><p className="mt-1 text-sm text-[#627271]">Preencha os dados para manter seu caixa atualizado.</p></div><button aria-label="Fechar modal" onClick={() => setMostrarModal(false)} className={`rounded-lg p-2 text-[#627271] hover:bg-[#efefef] ${botaoFoco}`}><X size={18} /></button></div><form onSubmit={salvar} className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-semibold text-[#1f2937]">Descrição *<input required value={formulario.descricao} onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })} className={`${campo} mt-1`} placeholder="Ex.: Venda de produtos" /></label><label className="text-sm font-semibold text-[#1f2937]">Categoria<select value={formulario.categoria} onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value as Categoria })} className={`${campo} mt-1`}>{categorias.map((cat) => <option key={cat}>{cat}</option>)}</select></label><label className="text-sm font-semibold text-[#1f2937]">Tipo<select value={formulario.tipo} onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value as TipoMovimentacao })} className={`${campo} mt-1`}><option value="entrada">Entrada</option><option value="saida">Saída</option></select></label><label className="text-sm font-semibold text-[#1f2937]">Pessoa<input value={formulario.pessoa} onChange={(e) => setFormulario({ ...formulario, pessoa: e.target.value })} className={`${campo} mt-1`} placeholder="Cliente ou fornecedor" /></label><label className="text-sm font-semibold text-[#1f2937]">Valor *<input required min="0.01" step="0.01" type="number" value={formulario.valor || ""} onChange={(e) => setFormulario({ ...formulario, valor: Number(e.target.value) })} className={`${campo} mt-1`} placeholder="0,00" /></label><label className="text-sm font-semibold text-[#1f2937]">Data *<input required type="date" value={formulario.data} onChange={(e) => setFormulario({ ...formulario, data: e.target.value })} className={`${campo} mt-1`} /></label><div className="mt-2 flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setMostrarModal(false)} className={`rounded-lg border border-[#627271] px-4 py-2.5 text-sm font-semibold text-[#1f2937] hover:bg-[#efefef] ${botaoFoco}`}>Cancelar</button><button type="submit" className={`rounded-lg bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] hover:bg-[#1f2937] hover:text-white ${botaoFoco}`}>{editandoId ? "Salvar alterações" : "Adicionar movimentação"}</button></div></form></div></div>}
    </main>
  );
}
