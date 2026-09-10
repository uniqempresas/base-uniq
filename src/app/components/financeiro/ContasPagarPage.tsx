import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, Calendar, Check, CheckCircle, Clock, Edit, Plus, Search, Trash2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { calcularDiasVencimento, calcularStatus, ContaPagar, formatarMoeda, StatusMovimentacao } from "./mockData";
import { useContasPagar } from "../../hooks/use-contas-pagar";
import { useCriarContaPagar } from "../../hooks/use-criar-conta-pagar";
import { useAtualizarContaPagar } from "../../hooks/use-atualizar-conta-pagar";

const hoje = () => new Date().toISOString().slice(0, 10);
const statusLabel: Record<StatusMovimentacao, string> = { pago: "Pago", pendente: "Pendente", vencido: "Vencido" };

function StatusBadge({ status }: { status: StatusMovimentacao }) {
  return <span className="inline-flex items-center gap-1 rounded-full border border-[#627271] px-2 py-1 text-xs font-medium text-[#1f2937]"><span className="h-1.5 w-1.5 rounded-full bg-[#86cb92]" />{statusLabel[status]}</span>;
}

export function ContasPagarPage() {
  const { contas, loading, isFallback, recarregar } = useContasPagar();
  const { criarConta, loading: criando } = useCriarContaPagar();
  const { atualizarContaPagar, loading: atualizando } = useAtualizarContaPagar();

  const [filtroStatus, setFiltroStatus] = useState<StatusMovimentacao | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<ContaPagar | null>(null);
  const [pagando, setPagando] = useState<ContaPagar | null>(null);
  const [feedback, setFeedback] = useState("");

  const comStatus = useMemo(() => contas.map(c => ({ ...c, status: calcularStatus(c.dataVencimento, c.status) })), [contas]);
  const filtradas = comStatus.filter(c => (filtroStatus === "todos" || c.status === filtroStatus) && `${c.descricao} ${c.fornecedor}`.toLowerCase().includes(busca.toLowerCase()));
  const total = (status: StatusMovimentacao) => comStatus.filter(c => c.status === status).reduce((s, c) => s + c.valor, 0);

  const fechar = () => { setModalAberto(false); setEditando(null); setPagando(null); };
  const avisar = (texto: string) => { setFeedback(texto); window.setTimeout(() => setFeedback(""), 3200); };

  const salvar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = {
      descricao: String(data.get("descricao")),
      valor: Number(data.get("valor")),
      data_vencimento: String(data.get("data")),
      forma_pagamento: String(data.get("forma") || "pix").toLowerCase(),
      observacoes: String(data.get("observacoes") || ""),
    };

    if (editando) {
      const result = await atualizarContaPagar({ id: editando.id, ...params });
      if (result.success) {
        avisar("Conta atualizada.");
        recarregar();
      } else {
        avisar(`Erro: ${result.error}`);
      }
    } else {
      const result = await criarConta(params);
      if (result.success) {
        avisar("Conta criada com sucesso.");
        recarregar();
      } else {
        avisar(`Erro: ${result.error}`);
      }
    }

    fechar();
  };

  const registrarPagamento = async () => {
    if (!pagando) return;

    const result = await atualizarContaPagar({
      id: pagando.id,
      status: "pago",
      data_pagamento: hoje(),
      valor_pago: pagando.valor,
    });

    if (result.success) {
      avisar("Pagamento registrado com sucesso.");
      recarregar();
    } else {
      avisar(`Erro: ${result.error}`);
    }

    fechar();
  };

  const excluir = async (conta: ContaPagar) => {
    if (!window.confirm(`Excluir a conta "${conta.descricao}"?`)) return;

    const result = await atualizarContaPagar({
      id: conta.id,
      status: "cancelado",
    });

    if (result.success) {
      avisar("Conta excluída.");
      recarregar();
    } else {
      avisar(`Erro: ${result.error}`);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-7xl p-4 text-[#1f2937] sm:p-6">
      <div className="mb-6"><div className="h-8 w-48 bg-[#efefef] rounded animate-pulse" /></div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[#efefef] rounded-lg animate-pulse" />)}
      </div>
      <div className="h-64 bg-[#efefef] rounded-lg animate-pulse" />
    </main>;
  }

  return <main data-od-id="contas-pagar-regiao" className="mx-auto max-w-7xl p-4 text-[#1f2937] sm:p-6">
    <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 data-od-id="contas-pagar-heading" className="mb-1 text-2xl font-semibold">Contas a Pagar</h1>
        <p className="text-sm text-[#627271]">Gerencie suas obrigações e fornecedores.</p>
      </div>
      <div className="flex gap-2">
        {isFallback && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Dados de exemplo</span>}
        <button data-od-id="contas-pagar-cta" onClick={() => { setEditando(null); setModalAberto(true); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#86cb92] px-4 py-2.5 text-sm font-semibold hover:bg-[#1f2937] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1f2937]">
          <Plus size={18} />Nova conta
        </button>
      </div>
    </header>

    {feedback && <div role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-[#627271] bg-[#efefef] p-3 text-sm"><Check size={17} />{feedback}</div>}

    <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {([
        ["Total a pagar", total("pendente"), Clock],
        ["Total em atraso", total("vencido"), AlertCircle],
        ["Total pago", total("pago"), CheckCircle],
        ["Previsão de saída", total("pendente") + total("vencido"), Clock],
      ] as [string, number, LucideIcon][]).map(([label, value, Icon]) => (
        <div key={label} className="rounded-lg border border-[#efefef] bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-[#627271]">{label}</span>
            <span className="rounded-lg bg-[#efefef] p-2"><Icon size={18} /></span>
          </div>
          <strong className="text-2xl">{formatarMoeda(value)}</strong>
        </div>
      ))}
    </section>

    <section data-od-id="contas-pagar-filtros" className="mb-6 rounded-lg border border-[#efefef] bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Status
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as StatusMovimentacao | "todos")} className="mt-1.5 w-full rounded-lg border border-[#627271] bg-white px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#86cb92]">
            <option value="todos">Todos</option>
            <option value="pendente">A pagar</option>
            <option value="pago">Pagos</option>
            <option value="vencido">Atrasados</option>
          </select>
        </label>
        <label className="text-sm font-medium">Buscar
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Descrição ou fornecedor" className="mt-1.5 w-full rounded-lg border border-[#627271] px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#86cb92]" />
        </label>
      </div>
    </section>

    <section data-od-id="contas-pagar-tabela" className="overflow-hidden rounded-lg border border-[#efefef] bg-white">
      <div className="border-b border-[#efefef] p-4">
        <h2 className="font-semibold">Contas cadastradas <span className="text-sm font-normal text-[#627271]">({filtradas.length})</span></h2>
      </div>

      {filtradas.length === 0 ? (
        <div className="p-10 text-center">
          <Search className="mx-auto mb-3" />
          <h3 className="font-semibold">Nenhuma conta encontrada</h3>
          <p className="mt-1 text-sm text-[#627271]">Ajuste os filtros ou cadastre uma nova conta.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#efefef] text-xs">
              <tr>
                <th className="px-3 py-3">Descrição</th>
                <th className="px-3 py-3">Fornecedor</th>
                <th className="px-3 py-3">Data vencimento</th>
                <th className="px-3 py-3 text-right">Valor</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(conta => (
                <tr key={conta.id} className="border-t border-[#efefef] align-middle hover:bg-[#efefef]">
                  <td className="px-3 py-3 font-medium">{conta.descricao}</td>
                  <td className="px-3 py-3">{conta.fornecedor}</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1"><Calendar size={14} />{new Date(conta.dataVencimento).toLocaleDateString("pt-BR")}</span>
                    <span className="text-xs text-[#627271]">{calcularDiasVencimento(conta.dataVencimento) < 0 && conta.status !== "pago" ? "Em atraso" : "No prazo"}</span>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold">{formatarMoeda(conta.valor)}</td>
                  <td className="px-3 py-3 text-center"><StatusBadge status={conta.status} /></td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-1">
                      {conta.status !== "pago" && (
                        <button onClick={() => { setPagando(conta); }} className="rounded p-1 text-[#86cb92] hover:bg-[#efefef]" title="Pagar"><Check size={16} /></button>
                      )}
                      <button onClick={() => { setEditando(conta); setModalAberto(true); }} className="rounded p-1 text-[#627271] hover:bg-[#efefef]" title="Editar"><Edit size={16} /></button>
                      <button onClick={() => excluir(conta)} className="rounded p-1 text-red-500 hover:bg-[#efefef]" title="Excluir"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>

    {/* Modal Nova/Editar */}
    {modalAberto && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/70 p-4">
        <div data-od-id="contas-pagar-modal" role="dialog" aria-modal="true" className="w-full max-w-lg rounded-lg bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editando ? "Editar conta a pagar" : "Nova conta a pagar"}</h2>
            <button onClick={fechar} aria-label="Fechar" className="rounded-lg p-1 hover:bg-[#efefef]"><X size={20} /></button>
          </div>
          <form onSubmit={salvar} className="space-y-3">
            <label className="block text-sm font-medium">Descrição
              <input required name="descricao" defaultValue={editando?.descricao} className="mt-1 block w-full rounded-lg border border-[#627271] px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">Fornecedor
              <input required name="fornecedor" defaultValue={editando?.fornecedor} className="mt-1 block w-full rounded-lg border border-[#627271] px-3 py-2" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Valor
                <input required min="0.01" step="0.01" type="number" name="valor" defaultValue={editando?.valor} className="mt-1 block w-full rounded-lg border border-[#627271] px-3 py-2" />
              </label>
              <label className="text-sm font-medium">Data vencimento
                <input required type="date" name="data" defaultValue={editando?.dataVencimento || hoje()} className="mt-1 block w-full rounded-lg border border-[#627271] px-3 py-2" />
              </label>
            </div>
            <label className="block text-sm font-medium">Forma de pagamento
              <select name="forma" defaultValue="PIX" className="mt-1 block w-full rounded-lg border border-[#627271] bg-white px-3 py-2">
                <option>PIX</option>
                <option>Dinheiro</option>
                <option>Boleto</option>
                <option>Transferência</option>
                <option>Cartão</option>
              </select>
            </label>
            <label className="block text-sm font-medium">Observações
              <textarea name="observacoes" defaultValue={editando?.observacoes} rows={2} className="mt-1 block w-full rounded-lg border border-[#627271] px-3 py-2" />
            </label>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={fechar} className="flex-1 rounded-lg border border-[#627271] px-4 py-2">Cancelar</button>
              <button type="submit" disabled={criando || atualizando} className="flex-1 rounded-lg bg-[#86cb92] px-4 py-2 font-semibold disabled:opacity-50">
                {criando || atualizando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modal Pagar */}
    {pagando && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/70 p-4">
        <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-lg bg-white p-5">
          <h2 className="mb-2 text-lg font-semibold">Registrar pagamento</h2>
          <p className="mb-5 text-sm text-[#627271]">Confirmar pagamento de <strong className="text-[#1f2937]">{pagando.descricao}</strong> no valor de {formatarMoeda(pagando.valor)}?</p>
          <div className="flex gap-2">
            <button onClick={fechar} className="flex-1 rounded-lg border border-[#627271] px-4 py-2">Cancelar</button>
            <button onClick={registrarPagamento} disabled={atualizando} className="flex-1 rounded-lg bg-[#86cb92] px-4 py-2 font-semibold disabled:opacity-50">
              {atualizando ? "Processando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    )}
  </main>;
}
