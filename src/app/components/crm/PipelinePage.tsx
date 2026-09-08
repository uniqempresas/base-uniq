import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Filter,
  DollarSign,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  ChevronDown,
  X,
  Loader2,
  GripVertical,
  TrendingUp,
  Users,
} from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { NEGOCIACOES, PIPELINE_ETAPAS, TAG_COLORS, formatCurrency, type Negociacao } from "./crmMockData";

const DRAG_TYPE = "NEGOCIACAO";

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
  onMoveEtapa,
}: {
  negociacao: Negociacao;
  onClick: () => void;
  onMoveEtapa: (id: string, etapa: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { id: negociacao.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(ref);

  const etapaAtual = PIPELINE_ETAPAS.find((e) => e.id === negociacao.etapa);

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
        {negociacao.proximaAcao !== "-" && (
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
  onMoveEtapa,
}: {
  etapa: (typeof PIPELINE_ETAPAS)[0];
  negociacoes: Negociacao[];
  onDropCard: (id: string, etapaId: string) => void;
  onCardClick: (neg: Negociacao) => void;
  onMoveEtapa: (id: string, etapa: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE,
    drop: (item: { id: string }) => {
      onDropCard(item.id, etapa.id);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  drop(ref);

  const total = negociacoes.reduce((acc, n) => acc + n.valor, 0);

  const isTerminal = etapa.id === "ganho" || etapa.id === "perdido";

  return (
    <div className="flex flex-col min-w-[230px] max-w-[260px] shrink-0">
      {/* Column header */}
      <div
        className="rounded-t-xl px-3 py-2.5 mb-0.5"
        style={{ background: `${etapa.cor}15`, borderTop: `3px solid ${etapa.cor}` }}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-[#1f2937] text-xs" style={{ fontWeight: 700 }}>{etapa.label}</p>
          <span
            className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white"
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
              {etapa.id === "ganho" ? (
                <CheckCircle size={16} style={{ color: etapa.cor }} />
              ) : etapa.id === "perdido" ? (
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
              onMoveEtapa={onMoveEtapa}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NovaNegociacaoModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    cliente: "",
    valor: "",
    etapa: "prospectando",
    dataFechamento: "",
    descricao: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef] sticky top-0 bg-white">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>Nova Negociação</h3>
            <p className="text-[#627271] text-xs">Registre uma nova oportunidade de venda</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#efefef]">
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Título da negociação *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: Pedido de equipamentos - João"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Cliente *</label>
            <input
              type="text"
              value={form.cliente}
              onChange={(e) => setForm((f) => ({ ...f, cliente: e.target.value }))}
              placeholder="Buscar cliente por nome..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Valor estimado</label>
              <input
                type="text"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                placeholder="R$ 0,00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
              />
            </div>
            <div>
              <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Fechamento previsto</label>
              <input
                type="date"
                value={form.dataFechamento}
                onChange={(e) => setForm((f) => ({ ...f, dataFechamento: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Etapa inicial *</label>
            <select
              value={form.etapa}
              onChange={(e) => setForm((f) => ({ ...f, etapa: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] appearance-none bg-white"
            >
              {PIPELINE_ETAPAS.filter((e) => e.id !== "ganho" && e.id !== "perdido").map((e) => (
                <option key={e.id} value={e.id}>{e.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Observações</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Contexto, produtos de interesse, próximos passos..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-[#1f2937] text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Criando...</> : "Criar negociação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NegociacaoDetalheModal({ neg, onClose, onMove }: { neg: Negociacao; onClose: () => void; onMove: (id: string, etapa: string) => void }) {
  const [showMover, setShowMover] = useState(false);
  const etapa = PIPELINE_ETAPAS.find((e) => e.id === neg.etapa);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div
          className="rounded-t-2xl px-5 py-4 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${etapa?.cor}20, ${etapa?.cor}08)`, borderTop: `3px solid ${etapa?.cor}` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${etapa?.cor}20`, color: etapa?.cor, fontWeight: 600 }}>
                {etapa?.label}
              </span>
              <h3 className="text-[#1f2937] mt-2 mb-1" style={{ fontWeight: 700, fontSize: "1rem" }}>{neg.titulo}</h3>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]" style={{ background: neg.clienteColor, fontWeight: 700 }}>
                  {neg.clienteInitials}
                </div>
                <span className="text-[#1f2937] text-sm">{neg.clienteNome}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center hover:bg-white/80">
              <X size={16} className="text-[#1f2937]" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Valor", value: formatCurrency(neg.valor), color: "#1f2937" },
              { label: "Probabilidade", value: `${neg.probabilidade}%`, color: "#0EA5E9" },
              { label: "Dias na etapa", value: `${neg.diasNaEtapa}d`, color: neg.atrasado ? "#EF4444" : "#627271" },
            ].map((s) => (
              <div key={s.label} className="bg-[#efefef] rounded-xl p-3 text-center">
                <p className="text-[#627271] text-[10px] mb-1">{s.label}</p>
                <p className="text-sm" style={{ fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[#627271] text-xs mb-1" style={{ fontWeight: 500 }}>Fechamento previsto</p>
            <p className="text-[#1f2937] text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
              <Calendar size={14} className="text-[#627271]" />
              {neg.dataFechamento}
            </p>
          </div>

          {neg.proximaAcao !== "-" && (
            <div>
              <p className="text-[#627271] text-xs mb-1" style={{ fontWeight: 500 }}>Próxima ação</p>
              <p className="text-[#1f2937] text-sm flex items-start gap-2" style={{ fontWeight: 500 }}>
                <Target size={14} className="text-blue-400 shrink-0 mt-0.5" />
                {neg.proximaAcao}
              </p>
            </div>
          )}

          {/* Move etapa */}
          {!showMover ? (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowMover(true)}
                className="flex-1 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm hover:bg-[#efefef] transition-colors"
                style={{ fontWeight: 500 }}
              >
                Mover de etapa
              </button>
              <button
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm"
                style={{ background: "#86cb92", fontWeight: 600 }}
              >
                <CheckCircle size={14} />
                Ganho!
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[#1f2937] text-xs mb-2" style={{ fontWeight: 500 }}>Mover para qual etapa?</p>
              <div className="grid grid-cols-2 gap-2">
                {PIPELINE_ETAPAS.filter((e) => e.id !== neg.etapa).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => { onMove(neg.id, e.id); onClose(); }}
                    className="py-2 px-3 rounded-xl text-xs border transition-all hover:border-current text-left"
                    style={{
                      borderColor: `${e.cor}30`,
                      color: e.cor,
                      background: `${e.cor}08`,
                      fontWeight: 600,
                    }}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowMover(false)} className="mt-2 text-xs text-[#627271] hover:text-[#1f2937]">Cancelar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineBoard() {
  const [negociacoes, setNegociacoes] = useState(NEGOCIACOES);
  const [showNova, setShowNova] = useState(false);
  const [selectedNeg, setSelectedNeg] = useState<Negociacao | null>(null);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleDrop = (negId: string, novaEtapaId: string) => {
    const neg = negociacoes.find((n) => n.id === negId);
    if (!neg || neg.etapa === novaEtapaId) return;

    const etapa = PIPELINE_ETAPAS.find((e) => e.id === novaEtapaId);
    setNegociacoes((prev) =>
      prev.map((n) => n.id === negId ? { ...n, etapa: novaEtapaId, diasNaEtapa: 0 } : n)
    );

    const msg = novaEtapaId === "ganho"
      ? "🎉 Parabéns! Negociação ganha!"
      : novaEtapaId === "perdido"
      ? "Negociação marcada como perdida"
      : `Negociação movida para ${etapa?.label}`;
    showToast(msg);
  };

  const totalPipeline = negociacoes
    .filter((n) => n.etapa !== "ganho" && n.etapa !== "perdido")
    .reduce((acc, n) => acc + n.valor, 0);

  const totalGanho = negociacoes
    .filter((n) => n.etapa === "ganho")
    .reduce((acc, n) => acc + n.valor, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#86cb92] text-[#1f2937] px-4 py-3 rounded-xl shadow-lg text-sm">
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      {showNova && (
        <NovaNegociacaoModal
          onClose={() => setShowNova(false)}
          onSuccess={() => { setShowNova(false); showToast("Negociação criada com sucesso!"); }}
        />
      )}

      {selectedNeg && (
        <NegociacaoDetalheModal
          neg={selectedNeg}
          onClose={() => setSelectedNeg(null)}
          onMove={handleDrop}
        />
      )}

      {/* Header */}
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Pipeline de Vendas</h1>
            <p className="text-[#627271] text-sm">Gerencie suas oportunidades de venda</p>
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

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-0">
          {[
            { label: "Em pipeline", value: formatCurrency(totalPipeline), icon: TrendingUp, color: "#F59E0B", bg: "#FFFBEB" },
            { label: "Ganhos (mês)", value: formatCurrency(totalGanho), icon: CheckCircle, color: "#86cb92", bg: "#efefef" },
            { label: "Negociações ativas", value: negociacoes.filter((n) => n.etapa !== "ganho" && n.etapa !== "perdido").length, icon: Target, color: "#8B5CF6", bg: "#F5F3FF" },
            { label: "Alertas de atraso", value: negociacoes.filter((n) => n.atrasado).length, icon: AlertTriangle, color: "#EF4444", bg: "#FEF2F2" },
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

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto pb-6 px-4 sm:px-6">
        <div className="flex gap-3 min-w-max">
          {PIPELINE_ETAPAS.map((etapa) => (
            <PipelineColumn
              key={etapa.id}
              etapa={etapa}
              negociacoes={negociacoes.filter((n) => n.etapa === etapa.id)}
              onDropCard={handleDrop}
              onCardClick={(neg) => setSelectedNeg(neg)}
              onMoveEtapa={handleDrop}
            />
          ))}
        </div>
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
