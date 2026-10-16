import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  X,
  Loader2,
  GripVertical,
  TrendingUp,
  Users,
  RotateCw,
  Trash2,
} from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TAG_COLORS, formatCurrency } from "./crmMockData";
import {
  usePipeline,
  isEtapaTerminal,
  isEtapaGanho,
  isEtapaPerdido,
} from "../../hooks/use-pipeline";
import { useClientesLista } from "../../hooks/use-clientes-lista";
import { useSalvarOportunidade } from "../../hooks/use-salvar-oportunidade";
import { useMoverOportunidade } from "../../hooks/use-mover-oportunidade";
import { useExcluirOportunidade } from "../../hooks/use-excluir-oportunidade";
import { mascararMoeda, moedaDeValor, parsearMoeda } from "../../lib/masks";
import type { ClienteLista, NegociacaoCardView, OportunidadeInput, PipelineEtapa } from "../../types/crm";

const DRAG_TYPE = "NEGOCIACAO";

type ToastTipo = "sucesso" | "erro";

interface ToastState {
  msg: string;
  tipo: ToastTipo;
}

function TagChip({ tag }: { tag: string }) {
  const colors = TAG_COLORS[tag] || { bg: "#efefef", text: "#627271", border: "#efefef" };
  return (
    <span
      className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px]"
      style={{ background: colors.bg, color: colors.text, borderColor: colors.border, fontWeight: 600 }}
    >
      {tag}
    </span>
  );
}

function NegociacaoCard({
  negociacao,
  onClick,
}: {
  negociacao: NegociacaoCardView;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { id: negociacao.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(ref);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="bg-white rounded-xl border border-[#efefef] shadow-sm hover:shadow-md transition-all cursor-pointer group"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-start gap-2 mb-3">
          <GripVertical
            size={14}
            className="text-[#627271] group-hover:text-[#627271] mt-0.5 shrink-0 cursor-grab active:cursor-grabbing"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[#1f2937] text-xs leading-tight" style={{ fontWeight: 700 }}>
              {negociacao.titulo}
            </p>
            {negociacao.atrasado && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle size={10} className="text-amber-500" />
                <span className="text-amber-600 text-[10px]" style={{ fontWeight: 600 }}>
                  {negociacao.diasNaEtapa} dias parado
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Client */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] shrink-0"
            style={{ background: negociacao.clienteColor, fontWeight: 700 }}
          >
            {negociacao.clienteInitials}
          </div>
          <p className="text-[#1f2937] text-xs truncate">{negociacao.clienteNome}</p>
        </div>

        {/* Tags */}
        {negociacao.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {negociacao.tags.slice(0, 2).map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#efefef] rounded-lg px-2 py-1.5">
            <p className="text-[9px] text-[#627271] mb-0.5">Valor</p>
            <p className="text-[#1f2937] text-xs" style={{ fontWeight: 700 }}>{formatCurrency(negociacao.valor)}</p>
          </div>
          <div className="bg-[#efefef] rounded-lg px-2 py-1.5">
            <p className="text-[9px] text-[#627271] mb-0.5">Prob.</p>
            <p className="text-[#1f2937] text-xs" style={{ fontWeight: 700 }}>{negociacao.probabilidade}%</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#efefef]">
          <div className="flex items-center gap-1 text-[#627271]">
            <Calendar size={10} />
            <span className="text-[10px]">{negociacao.dataFechamento}</span>
          </div>
          <div className="flex items-center gap-1 text-[#627271]">
            <Clock size={10} />
            <span className="text-[10px]">{negociacao.diasNaEtapa}d</span>
          </div>
        </div>

        {/* Next action */}
        {negociacao.proximaAcao !== "—" && negociacao.proximaAcao !== "-" && (
          <div className="mt-2 flex items-start gap-1.5">
            <Target size={10} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-[#627271] text-[10px] leading-tight">{negociacao.proximaAcao}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineColumn({
  etapa,
  negociacoes,
  onDropCard,
  onCardClick,
}: {
  etapa: PipelineEtapa;
  negociacoes: NegociacaoCardView[];
  onDropCard: (id: string, etapaNome: string) => void;
  onCardClick: (neg: NegociacaoCardView) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE,
    drop: (item: { id: string }) => {
      onDropCard(item.id, etapa.nome);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  drop(ref);

  const total = negociacoes.reduce((acc, n) => acc + n.valor, 0);

  const isTerminal = isEtapaTerminal(etapa.nome);

  return (
    <div className="flex flex-col min-w-[230px] max-w-[260px] shrink-0">
      {/* Column header */}
      <div
        className="rounded-t-xl px-3 py-2.5 mb-0.5"
        style={{ background: `${etapa.cor}15`, borderTop: `3px solid ${etapa.cor}` }}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-[#1f2937] text-xs truncate pr-2" style={{ fontWeight: 700 }}>{etapa.label}</p>
          <span
            className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white shrink-0"
            style={{ background: etapa.cor, fontWeight: 700 }}
          >
            {negociacoes.length}
          </span>
        </div>
        {negociacoes.length > 0 && (
          <p className="text-xs" style={{ color: etapa.cor, fontWeight: 600 }}>
            {formatCurrency(total)}
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={ref}
        className="flex-1 rounded-b-xl p-2 space-y-2 min-h-[120px] transition-all"
        style={{
          background: isOver ? `${etapa.cor}08` : "#efefef",
          border: isOver ? `2px dashed ${etapa.cor}60` : "2px dashed transparent",
        }}
      >
        {negociacoes.length === 0 && !isOver ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 opacity-40"
              style={{ background: `${etapa.cor}20` }}
            >
              {isEtapaGanho(etapa.nome) ? (
                <CheckCircle size={16} style={{ color: etapa.cor }} />
              ) : isEtapaPerdido(etapa.nome) ? (
                <XCircle size={16} style={{ color: etapa.cor }} />
              ) : (
                <TrendingUp size={16} style={{ color: etapa.cor }} />
              )}
            </div>
            <p className="text-[#627271] text-[10px] leading-tight">
              {isTerminal ? "Nenhuma aqui" : "Arraste uma negociação"}
            </p>
          </div>
        ) : (
          negociacoes.map((neg) => (
            <NegociacaoCard
              key={neg.id}
              negociacao={neg}
              onClick={() => onCardClick(neg)}
            />
          ))
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20";
const labelClass = "block text-[#1f2937] text-xs mb-1.5";

function NovaNegociacaoModal({
  clientes,
  etapaInicialNome,
  onFechar,
  onCriar,
}: {
  clientes: ClienteLista[];
  etapaInicialNome: string | null;
  onFechar: () => void;
  onCriar: (dados: OportunidadeInput) => Promise<boolean>;
}) {
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({
    clienteId: "",
    titulo: "",
    valor: "",
    dataFechamento: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId || !form.titulo.trim()) return;
    setEnviando(true);
    const ok = await onCriar({
      clienteId: form.clienteId,
      titulo: form.titulo,
      valor: parsearMoeda(form.valor),
      estagio: etapaInicialNome ?? "",
      dataFechamento: form.dataFechamento || null,
    });
    if (ok) return; // pai fecha o modal
    setEnviando(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onFechar}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef] sticky top-0 bg-white">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>Nova Negociação</h3>
            <p className="text-[#627271] text-xs">Registre uma nova oportunidade de venda</p>
          </div>
          <button onClick={onFechar} className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#efefef]">
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass} style={{ fontWeight: 500 }}>Cliente *</label>
            <select
              value={form.clienteId}
              onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}
              className={`${inputClass} appearance-none bg-white`}
              required
            >
              <option value="" disabled>
                {clientes.length === 0 ? "Nenhum cliente cadastrado" : "Selecionar cliente..."}
              </option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {clientes.length === 0 && (
              <p className="text-[#627271] text-[10px] mt-1">Cadastre clientes em CRM → Clientes para vincular à negociação.</p>
            )}
          </div>
          <div>
            <label className={labelClass} style={{ fontWeight: 500 }}>Título da negociação *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: Pedido de equipamentos - João"
              className={inputClass}
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ fontWeight: 500 }}>Valor estimado</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: mascararMoeda(e.target.value) }))}
                placeholder="R$ 0,00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontWeight: 500 }}>Fechamento previsto</label>
              <input
                type="date"
                value={form.dataFechamento}
                onChange={(e) => setForm((f) => ({ ...f, dataFechamento: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          {etapaInicialNome && (
            <p className="text-[#627271] text-[10px]">
              A negociação inicia na etapa <span style={{ fontWeight: 600 }}>{etapaInicialNome}</span> — arraste o card no quadro para mover.
            </p>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onFechar} className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || !form.clienteId || !form.titulo.trim()}
              className="flex-1 py-3 rounded-xl text-[#1f2937] text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {enviando ? <><Loader2 size={15} className="animate-spin" />Criando...</> : "Criar negociação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NegociacaoDetalheModal({
  neg,
  etapas,
  clientes,
  onFechar,
  onSalvar,
  onExcluir,
}: {
  neg: NegociacaoCardView;
  etapas: PipelineEtapa[];
  clientes: ClienteLista[];
  onFechar: () => void;
  onSalvar: (dados: OportunidadeInput) => Promise<boolean>;
  onExcluir: (id: string) => Promise<boolean>;
}) {
  const [form, setForm] = useState({
    titulo: neg.titulo,
    clienteId: neg.clienteId ?? "",
    valor: moedaDeValor(neg.valor),
    dataFechamento: neg.dataFechamentoISO ?? "",
    estagio: neg.etapa,
  });
  const [enviando, setEnviando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const etapa = etapas.find((e) => e.nome === form.estagio);
  const clienteNaLista = !form.clienteId || clientes.some((c) => c.id === form.clienteId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || enviando || excluindo) return;
    setEnviando(true);
    const ok = await onSalvar({
      id: neg.id,
      clienteId: form.clienteId || null,
      titulo: form.titulo,
      valor: parsearMoeda(form.valor),
      estagio: form.estagio,
      dataFechamento: form.dataFechamento || null,
    });
    if (ok) return; // pai fecha o modal
    setEnviando(false);
  };

  const handleExcluir = async () => {
    if (excluindo) return;
    setExcluindo(true);
    const ok = await onExcluir(neg.id);
    if (ok) return; // pai fecha o modal
    setExcluindo(false);
    setConfirmarExclusao(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onFechar}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div
          className="rounded-t-2xl px-5 py-4 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${etapa?.cor ?? "#627271"}20, ${etapa?.cor ?? "#627271"}08)`, borderTop: `3px solid ${etapa?.cor ?? "#627271"}` }}
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${etapa?.cor ?? "#627271"}20`, color: etapa?.cor ?? "#627271", fontWeight: 600 }}>
                {etapa?.label ?? neg.etapa}
              </span>
              <h3 className="text-[#1f2937] mt-2 mb-1" style={{ fontWeight: 700, fontSize: "1rem" }}>{neg.titulo}</h3>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]" style={{ background: neg.clienteColor, fontWeight: 700 }}>
                  {neg.clienteInitials}
                </div>
                <span className="text-[#1f2937] text-sm">{neg.clienteNome}</span>
              </div>
            </div>
            <button onClick={onFechar} className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/80 shrink-0">
              <X size={16} className="text-[#1f2937]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Valor", value: formatCurrency(parsearMoeda(form.valor)), color: "#1f2937" },
              { label: "Probabilidade", value: `${etapa?.probabilidade ?? neg.probabilidade}%`, color: "#0EA5E9" },
              { label: "Dias na etapa", value: `${neg.diasNaEtapa}d`, color: neg.atrasado ? "#EF4444" : "#627271" },
            ].map((s) => (
              <div key={s.label} className="bg-[#efefef] rounded-xl p-3 text-center">
                <p className="text-[#627271] text-[10px] mb-1">{s.label}</p>
                <p className="text-sm" style={{ fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div>
            <label className={labelClass} style={{ fontWeight: 500 }}>Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass} style={{ fontWeight: 500 }}>Cliente</label>
            <select
              value={form.clienteId}
              onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}
              className={`${inputClass} appearance-none bg-white`}
            >
              <option value="">Sem cliente</option>
              {!clienteNaLista && (
                <option value={form.clienteId}>{neg.clienteNome}</option>
              )}
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ fontWeight: 500 }}>Valor estimado</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: mascararMoeda(e.target.value) }))}
                placeholder="R$ 0,00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontWeight: 500 }}>Fechamento previsto</label>
              <input
                type="date"
                value={form.dataFechamento}
                onChange={(e) => setForm((f) => ({ ...f, dataFechamento: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} style={{ fontWeight: 500 }}>Etapa</label>
            <select
              value={form.estagio}
              onChange={(e) => setForm((f) => ({ ...f, estagio: e.target.value }))}
              className={`${inputClass} appearance-none bg-white`}
            >
              {!etapas.some((et) => et.nome === form.estagio) && (
                <option value={form.estagio}>{neg.etapa}</option>
              )}
              {etapas.map((et) => (
                <option key={et.id} value={et.nome}>{et.label}</option>
              ))}
            </select>
          </div>

          {!confirmarExclusao ? (
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmarExclusao(true)}
                disabled={enviando || excluindo}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#FECACA] text-[#B91C1C] text-xs hover:bg-[#FEF2F2] transition-colors disabled:opacity-70"
                style={{ fontWeight: 600 }}
              >
                <Trash2 size={13} />
                Excluir
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={onFechar}
                className="px-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
                style={{ fontWeight: 500 }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando || excluindo || !form.titulo.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm disabled:opacity-70"
                style={{ background: "#86cb92", fontWeight: 600 }}
              >
                {enviando ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : "Salvar"}
              </button>
            </div>
          ) : (
            <div className="pt-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3">
              <p className="text-[#B91C1C] text-xs mb-2" style={{ fontWeight: 600 }}>
                Excluir esta negociação? Essa ação não pode ser desfeita.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmarExclusao(false)}
                  className="flex-1 py-2 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExcluir}
                  disabled={excluindo || enviando}
                  className="flex-1 py-2 rounded-xl text-white text-xs flex items-center justify-center gap-1.5 disabled:opacity-70"
                  style={{ background: "#EF4444", fontWeight: 600 }}
                >
                  {excluindo ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Excluir definitivamente
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function SkeletonColuna() {
  return (
    <div className="flex flex-col min-w-[230px] max-w-[260px] shrink-0">
      <div className="h-12 rounded-t-xl bg-[#efefef] animate-pulse mb-0.5" />
      <div className="flex-1 rounded-b-xl bg-[#efefef] p-2 space-y-2 min-h-[240px]">
        <div className="h-28 rounded-xl bg-white/70 animate-pulse" />
        <div className="h-28 rounded-xl bg-white/70 animate-pulse" />
      </div>
    </div>
  );
}

function PipelineBoard() {
  const { etapas, oportunidades, carregando, erro, recarregar } = usePipeline();
  const { clientes } = useClientesLista();
  const { salvarOportunidade } = useSalvarOportunidade();
  const { moverOportunidade } = useMoverOportunidade();
  const { excluirOportunidade } = useExcluirOportunidade();

  // estado local p/ atualização otimista no drag & drop
  const [negociacoes, setNegociacoes] = useState<NegociacaoCardView[]>([]);
  useEffect(() => {
    setNegociacoes(oportunidades);
  }, [oportunidades]);

  const [showNova, setShowNova] = useState(false);
  const [selectedNeg, setSelectedNeg] = useState<NegociacaoCardView | null>(null);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (msg: string, tipo: ToastTipo = "sucesso") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Drag & drop: otimista + update no banco + log de movimentação ──
  const handleDrop = async (negId: string, novaEtapaNome: string) => {
    const neg = negociacoes.find((n) => n.id === negId);
    if (!neg || neg.etapa === novaEtapaNome) return;

    const novaProb = etapas.find((e) => e.nome === novaEtapaNome)?.probabilidade ?? neg.probabilidade;
    setNegociacoes((prev) =>
      prev.map((n) =>
        n.id === negId
          ? { ...n, etapa: novaEtapaNome, diasNaEtapa: 0, atrasado: false, probabilidade: novaProb }
          : n
      )
    );

    const resultado = await moverOportunidade(negId, novaEtapaNome);
    if (!resultado.success) {
      showToast(resultado.error ?? "Erro ao mover negociação.", "erro");
      recarregar(); // recarregar em falta
      return;
    }

    const msg = isEtapaGanho(novaEtapaNome)
      ? "🎉 Parabéns! Negociação ganha!"
      : isEtapaPerdido(novaEtapaNome)
      ? "Negociação marcada como perdida"
      : `Negociação movida para ${novaEtapaNome}`;
    showToast(msg);
  };

  // ── Criar negociação (estagio = nome da 1ª etapa da empresa) ──
  const handleCriar = async (dados: OportunidadeInput): Promise<boolean> => {
    if (etapas.length === 0) {
      showToast("Nenhuma etapa configurada para o pipeline desta empresa.", "erro");
      return false;
    }
    const res = await salvarOportunidade({ ...dados, estagio: etapas[0].nome });
    if (!res.success) {
      showToast(res.error ?? "Erro ao criar negociação.", "erro");
      return false;
    }
    showToast("Negociação criada com sucesso!");
    setShowNova(false);
    recarregar();
    return true;
  };

  // ── Editar negociação (modal de detalhe) — mudança de etapa ganha log ──
  const handleSalvar = async (dados: OportunidadeInput): Promise<boolean> => {
    if (!dados.id) return false;
    const original = negociacoes.find((n) => n.id === dados.id);
    const estagioAtual = original?.etapa ?? dados.estagio;

    // grava campos mantendo a etapa atual; a movimentação sai do caminho
    // dedicado (update estagio + log) quando houve mudança de etapa
    const res = await salvarOportunidade({ ...dados, estagio: estagioAtual });
    if (!res.success) {
      showToast(res.error ?? "Erro ao salvar negociação.", "erro");
      return false;
    }

    if (dados.estagio && dados.estagio !== estagioAtual) {
      const mv = await moverOportunidade(dados.id, dados.estagio);
      if (!mv.success) {
        showToast(mv.error ?? "Campos salvos, mas a etapa não mudou.", "erro");
        recarregar();
        return false;
      }
    }

    showToast("Negociação atualizada!");
    setSelectedNeg(null);
    recarregar();
    return true;
  };

  const handleExcluir = async (id: string): Promise<boolean> => {
    const res = await excluirOportunidade(id);
    if (!res.success) {
      showToast(res.error ?? "Erro ao excluir negociação.", "erro");
      return false;
    }
    showToast("Negociação excluída.");
    setSelectedNeg(null);
    recarregar();
    return true;
  };

  // ── Filtro por cliente ──
  const filtradas = filtroCliente ? negociacoes.filter((n) => n.clienteId === filtroCliente) : negociacoes;

  // ── KPIs do header (dados reais) ──
  const abertas = filtradas.filter((n) => !isEtapaTerminal(n.etapa));
  const totalPipeline = abertas.reduce((acc, n) => acc + n.valor, 0);

  const agora = new Date();
  const noMesAtual = (iso: string | null): boolean => {
    if (!iso) return false;
    const d = new Date(iso);
    return !Number.isNaN(d.getTime()) && d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  };
  const totalGanhoMes = filtradas
    .filter((n) => isEtapaGanho(n.etapa) && noMesAtual(n.estagioDesde ?? n.dataFechamentoISO))
    .reduce((acc, n) => acc + n.valor, 0);

  const atrasadas = filtradas.filter((n) => n.atrasado);

  const primeiraEtapaNome = etapas[0]?.nome ?? null;
  const mostrarVazioGlobal = !carregando && !erro && negociacoes.length === 0 && etapas.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm ${
            toast.tipo === "erro"
              ? "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
              : "bg-[#86cb92] text-[#1f2937]"
          }`}
        >
          {toast.tipo === "erro" ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {showNova && (
        <NovaNegociacaoModal
          clientes={clientes}
          etapaInicialNome={primeiraEtapaNome}
          onFechar={() => setShowNova(false)}
          onCriar={handleCriar}
        />
      )}

      {selectedNeg && (
        <NegociacaoDetalheModal
          neg={selectedNeg}
          etapas={etapas}
          clientes={clientes}
          onFechar={() => setSelectedNeg(null)}
          onSalvar={handleSalvar}
          onExcluir={handleExcluir}
        />
      )}

      {/* Header */}
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="min-w-0">
            <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Pipeline de Vendas</h1>
            <p className="text-[#627271] text-sm">Gerencie suas oportunidades de venda</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
              <select
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                aria-label="Filtrar por cliente"
                className="pl-8 pr-3 py-2.5 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs outline-none focus:border-[#86cb92] max-w-[160px]"
                style={{ fontWeight: 500 }}
              >
                <option value="">Todos os clientes</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowNova(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Nova Negociação</span>
              <span className="sm:hidden">Nova</span>
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-0">
          {[
            { label: "Em pipeline", value: formatCurrency(totalPipeline), icon: TrendingUp, color: "#F59E0B", bg: "#FFFBEB" },
            { label: "Ganhos (mês)", value: formatCurrency(totalGanhoMes), icon: CheckCircle, color: "#86cb92", bg: "#efefef" },
            { label: "Negociações ativas", value: abertas.length, icon: Target, color: "#8B5CF6", bg: "#F5F3FF" },
            { label: "Alertas de atraso", value: atrasadas.length, icon: AlertTriangle, color: "#EF4444", bg: "#FEF2F2" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-[#efefef] shadow-sm px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: stat.bg }}>
                  <Icon size={16} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-[#627271] text-[10px]">{stat.label}</p>
                  <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban + estados */}
      <div className="flex-1 overflow-x-auto pb-6 px-4 sm:px-6">
        {carregando ? (
          <div className="flex gap-3 min-w-max">
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonColuna key={i} />
            ))}
          </div>
        ) : erro ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] flex items-center justify-center mb-3">
              <AlertTriangle size={24} className="text-[#EF4444]" />
            </div>
            <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 700 }}>Não foi possível carregar o pipeline</p>
            <p className="text-[#627271] text-xs mb-4 max-w-sm">{erro}</p>
            <button
              onClick={recarregar}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              <RotateCw size={14} />
              Tentar de novo
            </button>
          </div>
        ) : etapas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#efefef] flex items-center justify-center mb-3">
              <Target size={24} className="text-[#627271]" />
            </div>
            <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 700 }}>Nenhuma etapa configurada</p>
            <p className="text-[#627271] text-xs max-w-sm">
              As etapas do pipeline (crm_etapas) ainda não foram configuradas para esta empresa.
            </p>
          </div>
        ) : mostrarVazioGlobal ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#efefef] flex items-center justify-center mb-3">
              <TrendingUp size={24} className="text-[#86cb92]" />
            </div>
            <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 700 }}>Nenhuma negociação no pipeline</p>
            <p className="text-[#627271] text-xs mb-4 max-w-sm">
              Cadastre sua primeira oportunidade de venda e acompanhe o fechamento aqui.
            </p>
            <button
              onClick={() => setShowNova(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              <Plus size={15} />
              Criar primeira negociação
            </button>
          </div>
        ) : (
          <>
            {/* Vazio por filtro */}
            {filtroCliente && filtradas.length === 0 && (
              <div className="mb-3 flex items-center justify-center gap-3 rounded-xl border border-[#efefef] bg-white px-4 py-3">
                <Users size={14} className="text-[#627271] shrink-0" />
                <p className="text-[#627271] text-xs">Nenhuma negociação para o cliente selecionado.</p>
                <button
                  onClick={() => setFiltroCliente("")}
                  className="text-xs hover:underline"
                  style={{ color: "#86cb92", fontWeight: 600 }}
                >
                  Limpar filtro
                </button>
              </div>
            )}
            <div className="flex gap-3 min-w-max">
              {etapas.map((etapa) => (
                <PipelineColumn
                  key={etapa.id}
                  etapa={etapa}
                  negociacoes={filtradas.filter((n) => n.etapa === etapa.nome)}
                  onDropCard={handleDrop}
                  onCardClick={(neg) => setSelectedNeg(neg)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function PipelinePage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        <PipelineBoard />
      </div>
    </DndProvider>
  );
}
