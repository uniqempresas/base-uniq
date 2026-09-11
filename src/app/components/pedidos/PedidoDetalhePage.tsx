import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileText,
  MessageCircle,
  Printer,
  X,
  CheckCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Truck,
  Package,
  User,
  CreditCard,
  Sparkles,
  AlertTriangle,
  Clock,
  DollarSign,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  PEDIDOS,
  STATUS_CONFIG,
  CANAL_CONFIG,
  PAGAMENTO_LABELS,
  formatCurrency,
  formatDateTime,
  NEXT_STATUS,
  type StatusPedido,
  type Pedido,
} from "./pedidosMockData";
import { useRegistrarVenda } from "../../hooks/use-registrar-venda";
import { usePedido } from "../../hooks/use-pedido";
import { useAtualizarStatusPedido } from "../../hooks/use-atualizar-status-pedido";
import { useConfirmarPagamento } from "../../hooks/use-confirmar-pagamento";

function StatusBadge({ status, large }: { status: StatusPedido; large?: boolean }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${large ? "px-4 py-1.5 text-sm" : "px-2.5 py-1 text-xs"}`}
      style={{
        color: cfg.color,
        background: cfg.bg,
        borderColor: cfg.borderColor,
        fontWeight: 700,
      }}
    >
      <span style={{ fontSize: large ? 16 : 13 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function Section({
  title,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#efefef]"
        style={{ background: "#efefef" }}
      >
        <Icon size={16} style={{ color: iconColor }} />
        <span className="text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function PedidoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pedido: pedidoReal, loading, isFallback } = usePedido(id);
  const [pedidoLocal, setPedidoLocal] = useState<Pedido | undefined>(undefined);
  const pedido = pedidoLocal || pedidoReal;
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showContabilizarModal, setShowContabilizarModal] = useState(false);
  const [vendaContabilizada, setVendaContabilizada] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState("");
  const [trackingCode, setTrackingCode] = useState(pedido?.codigoRastreio || "");
  const [newStatus, setNewStatus] = useState<StatusPedido | null>(null);
  const { registrarVenda, loading: registrandoVenda } = useRegistrarVenda();
  const { atualizarStatus, loading: atualizandoStatus } = useAtualizarStatusPedido();
  const { confirmarPagamento, loading: confirmandoPagamento } = useConfirmarPagamento();

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-screen-lg mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#efefef] animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-[#efefef] rounded animate-pulse" />
            <div className="h-4 w-32 bg-[#efefef] rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 bg-[#efefef] rounded-2xl animate-pulse" />
            <div className="h-64 bg-[#efefef] rounded-2xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-[#efefef] rounded-2xl animate-pulse" />
            <div className="h-32 bg-[#efefef] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#efefef] flex items-center justify-center mb-4">
          <Package size={28} className="text-[#627271]" />
        </div>
        <p className="text-[#1f2937] mb-1" style={{ fontWeight: 700, fontSize: 18 }}>
          Pedido não encontrado
        </p>
        <p className="text-sm text-[#627271] max-w-xs">
          O pedido que você procura não existe ou foi removido
        </p>
        <button
          className="mt-5 px-5 py-2.5 rounded-xl text-[#1f2937] text-sm transition-colors"
          style={{ background: "#86cb92" }}
          onClick={() => navigate("/vendas/pedidos")}
        >
          Voltar para pedidos
        </button>
      </div>
    );
  }

  const canalCfg = CANAL_CONFIG[pedido.canal];
  const nextStatuses = NEXT_STATUS[pedido.status] || [];
  const isCanceled = pedido.status === "cancelado";
  const isDelivered = pedido.status === "entregue";

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    if (newStatus === "enviado" && !trackingCode.trim()) {
      toast.error("Informe o código de rastreio para marcar como Enviado.");
      setShowTrackingModal(true);
      setShowStatusModal(false);
      return;
    }
    const cfg = STATUS_CONFIG[newStatus];
    const timeline = [
      ...pedido.timeline,
      {
        status: newStatus,
        dataHora: new Date().toISOString(),
        responsavel: "Maria Silva",
        observacao: newStatus === "enviado" ? `Código de rastreio: ${trackingCode}` : undefined,
        codigoRastreio: newStatus === "enviado" ? trackingCode : undefined,
      },
    ];

    // Persiste no banco quando o pedido é real (não mock)
    if (!isFallback) {
      const res = await atualizarStatus({ id: pedido.id, status: newStatus });
      if (!res.success) {
        toast.error(`Erro ao atualizar status: ${res.error}`);
        setShowStatusModal(false);
        setNewStatus(null);
        return;
      }
    }

    setPedidoLocal({ ...pedido, status: newStatus, timeline, codigoRastreio: newStatus === "enviado" ? trackingCode : pedido.codigoRastreio });
    toast.success(`Status atualizado para "${cfg.label}"! 🎉`);
    setShowStatusModal(false);
    setNewStatus(null);
  };

  const handleTrackingAdd = () => {
    if (!trackingCode.trim()) return;
    setPedidoLocal({
      ...pedido,
      codigoRastreio: trackingCode,
      status: "enviado",
      timeline: [
        ...pedido.timeline,
        {
          status: "enviado",
          dataHora: new Date().toISOString(),
          responsavel: "Maria Silva",
          codigoRastreio: trackingCode,
          observacao: `Código de rastreio adicionado: ${trackingCode}`,
        },
      ],
    });
    toast.success("Código de rastreio adicionado!");
    setShowTrackingModal(false);
  };

  const handleCancel = async () => {
    if (!cancelMotivo.trim() || cancelMotivo.trim().length < 10) {
      toast.error("Informe o motivo com pelo menos 10 caracteres.");
      return;
    }

    // Persiste no banco quando o pedido é real (não mock)
    if (!isFallback) {
      const res = await atualizarStatus({ id: pedido.id, status: "cancelado" });
      if (!res.success) {
        toast.error(`Erro ao cancelar: ${res.error}`);
        return;
      }
    }

    setPedidoLocal({
      ...pedido,
      status: "cancelado",
      motivoCancelamento: cancelMotivo,
      timeline: [
        ...pedido.timeline,
        {
          status: "cancelado",
          dataHora: new Date().toISOString(),
          responsavel: "Maria Silva",
          observacao: cancelMotivo,
        },
      ],
    });
    toast.success("Pedido cancelado.");
    setShowCancelModal(false);
    setCancelMotivo("");
  };

  const handleWhatsApp = () => {
    const phone = pedido.cliente.telefone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Olá ${pedido.cliente.nome.split(" ")[0]}! Aqui é a Loja da Maria. Referente ao seu pedido ${pedido.numero}, status atual: ${STATUS_CONFIG[pedido.status].label}. Qualquer dúvida, estamos aqui! 😊`
    );
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  };

  const handleContabilizar = async () => {
    if (!pedido) return;

    const resultado = await registrarVenda({
      valor_total: pedido.total,
      forma_pagamento: pedido.formaPagamento,
      observacoes: `Venda contabilizada do pedido ${pedido.numero} - Cliente: ${pedido.cliente.nome}`,
      origem: pedido.canal,
      itens: pedido.itens.map((item) => ({
        quantidade: item.quantidade,
        valor_unitario: item.precoUnitario,
        descricao: item.nome,
      })),
    });

    if (resultado.success) {
      setVendaContabilizada(true);
      toast.success(`Venda contabilizada! ID: ${resultado.id_venda?.slice(0, 8)}...`);
      setShowContabilizarModal(false);
    } else {
      toast.error(`Erro ao contabilizar: ${resultado.error}`);
    }
  };

  // Ações do pedido (usadas no mobile logo abaixo do título e no desktop à direita)
  const acoesPedido = (
    <>
      {!isCanceled && !isDelivered && (
        <button
          className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl text-[#1f2937] transition-colors"
          style={{ background: "#86cb92" }}
          onClick={() => setShowStatusModal(true)}
        >
          <RefreshCw size={13} />
          Atualizar status
        </button>
      )}
      {!isCanceled && !vendaContabilizada && pedido.statusPagamento === "confirmado" && (
        <button
          className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-[#2e7d32] text-[#2e7d32] hover:bg-[#e8f5e9] transition-colors"
          onClick={() => setShowContabilizarModal(true)}
        >
          <DollarSign size={13} />
          Contabilizar venda
        </button>
      )}
      {vendaContabilizada && (
        <span className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32]">
          <Check size={13} />
          Venda contabilizada
        </span>
      )}
    </>
  );

  return (
    <div className="p-4 sm:p-6 max-w-screen-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          className="w-9 h-9 rounded-xl bg-white border border-[#efefef] flex items-center justify-center text-[#627271] hover:bg-[#efefef] hover:text-[#1f2937] transition-colors shrink-0"
          onClick={() => navigate("/vendas/pedidos")}
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
            <h1 className="text-[#1f2937]" style={{ fontWeight: 800, fontSize: 20, fontFamily: "monospace" }}>
              {pedido.numero}
            </h1>
            <StatusBadge status={pedido.status} large />
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs border"
              style={{ color: canalCfg.color, background: canalCfg.bg, borderColor: "transparent", fontWeight: 600 }}
            >
              {canalCfg.label}
            </span>
          </div>
          <p className="text-sm text-[#627271]">{formatDateTime(pedido.dataHora)}</p>

          {/* Ações mobile: linha própria abaixo do título, com wrap */}
          <div className="flex flex-wrap items-center gap-2 mt-3 sm:hidden">
            {acoesPedido}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border border-[#efefef] text-[#1f2937] hover:bg-[#efefef] transition-colors"
            onClick={() => { toast.success("Comprovante gerado!"); }}
          >
            <Printer size={13} />
            Imprimir
          </button>
          {acoesPedido}
        </div>
      </div>

      {/* MEL tip for pending payment */}
      {pedido.statusPagamento === "pendente" && !isCanceled && (
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl border"
          style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
        >
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <AlertTriangle size={16} style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: "#92400E" }}>
              <strong>Pagamento pendente.</strong> Você pode processar o pedido mesmo assim.
            </p>
          </div>
          <button
            className="w-full sm:w-auto sm:ml-auto px-3 py-2.5 sm:py-1.5 rounded-lg text-xs text-white shrink-0 disabled:opacity-60"
            style={{ background: "#D97706" }}
            disabled={confirmandoPagamento}
            onClick={async () => {
              const confirmar = () => {
                setPedidoLocal({
                  ...pedido,
                  statusPagamento: "confirmado",
                  timeline: [...pedido.timeline, { status: pedido.status, dataHora: new Date().toISOString(), responsavel: "Maria Silva", observacao: "Pagamento confirmado manualmente" }],
                });
                toast.success("Pagamento confirmado!");
              };

              if (isFallback || !pedido.id) {
                confirmar();
                return;
              }

              const result = await confirmarPagamento({
                vendaId: pedido.id,
                valor: pedido.total,
                formaPagamento: pedido.formaPagamento,
              });

              if (result.success) {
                confirmar();
              } else {
                toast.error(result.error || "Erro ao confirmar pagamento");
              }
            }}
          >
            {confirmandoPagamento ? "Confirmando..." : "Confirmar pagamento"}
          </button>
        </div>
      )}

      {/* Payment confirmed badge */}
      {pedido.statusPagamento === "confirmado" && !isCanceled && (
        <div
          className="flex items-center gap-3 p-3.5 rounded-2xl border"
          style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
        >
          <CheckCircle size={16} style={{ color: "#16A34A", flexShrink: 0 }} />
          <p className="text-xs" style={{ color: "#166534" }}>
            <strong>Pagamento confirmado.</strong> {PAGAMENTO_LABELS[pedido.formaPagamento]}
          </p>
        </div>
      )}

      {/* Canceled notice */}
      {isCanceled && pedido.motivoCancelamento && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl border"
          style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
        >
          <X size={16} style={{ color: "#DC2626", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm" style={{ fontWeight: 700, color: "#DC2626" }}>
              Pedido cancelado
            </p>
            <p className="text-xs text-red-600 mt-0.5">{pedido.motivoCancelamento}</p>
          </div>
        </div>
      )}

      {/* MEL insight */}
      {!isCanceled && (
        <div
          className="flex items-start gap-3 p-3.5 rounded-2xl border"
          style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
        >
          <Sparkles size={15} style={{ color: "#7C3AED", flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs" style={{ color: "#6D28D9" }}>
            <strong>MEL diz:</strong>{" "}
            {pedido.status === "pago"
              ? `${pedido.cliente.nome.split(" ")[0]} já pagou! Hora de separar os produtos. Não deixa acumular! 📦`
              : pedido.status === "separacao"
              ? `Pedido em separação há um tempo. Já está pronto para enviar? Lembre de adicionar o código de rastreio! 🚚`
              : pedido.status === "enviado"
              ? `Ótimo! Pedido enviado. Fique de olho na entrega para atualizar o status quando o cliente receber. 🎉`
              : pedido.status === "entregue"
              ? `Pedido entregue! Que tal perguntar pro ${pedido.cliente.nome.split(" ")[0]} se gostou? Um feedback é ouro! ⭐`
              : `${pedido.cliente.nome.split(" ")[0]} está esperando. Mantenha o pedido atualizado para uma boa experiência! 😊`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <Section title="Itens do pedido" icon={Package} iconColor="#0284C7">
            <div className="space-y-3">
              {pedido.itens.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#efefef] shrink-0 bg-[#efefef]">
                    <img
                      src={item.foto}
                      alt={item.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                      {item.nome}
                    </p>
                    {item.variacao && (
                      <p className="text-xs text-[#627271]">{item.variacao}</p>
                    )}
                    <p className="text-xs text-[#627271]">
                      {item.quantidade}x {formatCurrency(item.precoUnitario)}
                    </p>
                  </div>
                  <span className="text-sm text-[#1f2937] shrink-0" style={{ fontWeight: 700 }}>
                    {formatCurrency(item.quantidade * item.precoUnitario)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="mt-4 pt-4 border-t border-[#efefef] space-y-2">
              <div className="flex justify-between text-sm text-[#627271]">
                <span>Subtotal</span>
                <span>{formatCurrency(pedido.subtotal)}</span>
              </div>
              {pedido.frete > 0 && (
                <div className="flex justify-between text-sm text-[#627271]">
                  <span>Frete</span>
                  <span>{formatCurrency(pedido.frete)}</span>
                </div>
              )}
              {pedido.desconto > 0 && (
                <div className="flex justify-between text-sm text-[#627271]">
                  <span>Desconto</span>
                  <span>-{formatCurrency(pedido.desconto)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#efefef]">
                <span className="text-[#1f2937]" style={{ fontWeight: 700 }}>
                  Total
                </span>
                <span className="text-[#1f2937]" style={{ fontWeight: 800, fontSize: 18 }}>
                  {formatCurrency(pedido.total)}
                </span>
              </div>
            </div>
          </Section>

          {/* Delivery address */}
          {pedido.endereco && (
            <Section title="Endereço de entrega" icon={MapPin} iconColor="#DC2626">
              <div className="space-y-1">
                <p className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                  {pedido.endereco.rua}, {pedido.endereco.numero}
                  {pedido.endereco.complemento ? ` — ${pedido.endereco.complemento}` : ""}
                </p>
                <p className="text-sm text-[#627271]">
                  {pedido.endereco.bairro} · {pedido.endereco.cidade}/{pedido.endereco.estado}
                </p>
                <p className="text-sm text-[#627271]">CEP: {pedido.endereco.cep}</p>
              </div>
              <button
                className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                onClick={() =>
                  window.open(
                    `https://maps.google.com/?q=${encodeURIComponent(
                      `${pedido.endereco!.rua} ${pedido.endereco!.numero}, ${pedido.endereco!.cidade}`
                    )}`,
                    "_blank"
                  )
                }
              >
                <ExternalLink size={12} />
                Abrir no Google Maps
              </button>
            </Section>
          )}

          {/* Tracking code */}
          {(pedido.status === "enviado" || pedido.codigoRastreio) && (
            <Section title="Rastreamento" icon={Truck} iconColor="#7C3AED">
              {pedido.codigoRastreio ? (
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border"
                    style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
                  >
                    <span className="text-sm text-[#1f2937]" style={{ fontWeight: 700, fontFamily: "monospace" }}>
                      {pedido.codigoRastreio}
                    </span>
                  </div>
                  <button
                    className="w-9 h-9 rounded-xl border border-[#efefef] flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors"
                    onClick={() => { navigator.clipboard.writeText(pedido.codigoRastreio!); toast.success("Código copiado!"); }}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    className="w-9 h-9 rounded-xl border border-[#efefef] flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors"
                    onClick={() => window.open(`https://rastreamento.correios.com.br/app/index.php`, "_blank")}
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-sm text-[#627271] flex-1">Nenhum código de rastreio adicionado ainda.</p>
                  <button
                    className="w-full sm:w-auto px-3 py-2.5 sm:py-2 rounded-xl text-xs text-white transition-colors"
                    style={{ background: "#7C3AED" }}
                    onClick={() => setShowTrackingModal(true)}
                  >
                    Adicionar código
                  </button>
                </div>
              )}
            </Section>
          )}

          {/* Timeline */}
          <Section title="Histórico do pedido" icon={Clock} iconColor="#627271">
            <div className="space-y-0">
              {[...pedido.timeline].reverse().map((entry, i) => {
                const cfg = STATUS_CONFIG[entry.status];
                const isFirst = i === 0;
                return (
                  <div key={i} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2"
                        style={{
                          background: isFirst ? cfg.bg : "white",
                          borderColor: isFirst ? cfg.color : "#efefef",
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                      </div>
                      {i < pedido.timeline.length - 1 && (
                        <div className="w-0.5 flex-1 my-1" style={{ background: "#efefef", minHeight: 20 }} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-sm"
                          style={{ fontWeight: isFirst ? 700 : 500, color: isFirst ? cfg.color : "#1f2937" }}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-[11px] text-[#627271] shrink-0">
                          {formatDateTime(entry.dataHora)}
                        </span>
                      </div>
                      <p className="text-xs text-[#627271] mt-0.5">{entry.responsavel}</p>
                      {entry.observacao && (
                        <p className="text-xs text-[#627271] mt-0.5 italic">{entry.observacao}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Customer */}
          <Section title="Cliente" icon={User} iconColor="#7C3AED">
            <div className="space-y-3">
              <div>
                <p className="text-base text-[#1f2937]" style={{ fontWeight: 700 }}>
                  {pedido.cliente.nome}
                </p>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background: "#efefef",
                    color: "#627271",
                    fontWeight: 600,
                  }}
                >
                  {pedido.cliente.tipo === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#1f2937]">
                  <Phone size={13} className="text-[#627271] shrink-0" />
                  <span>{pedido.cliente.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1f2937]">
                  <Mail size={13} className="text-[#627271] shrink-0" />
                  <span className="truncate">{pedido.cliente.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1f2937]">
                  <FileText size={13} className="text-[#627271] shrink-0" />
                  <span>{pedido.cliente.documento}</span>
                </div>
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-white transition-colors"
                style={{ background: "#25D366" }}
                onClick={handleWhatsApp}
              >
                <MessageCircle size={14} />
                Enviar mensagem
              </button>
            </div>
          </Section>

          {/* Payment info */}
          <Section title="Pagamento" icon={CreditCard} iconColor="#86cb92">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#627271]">Forma de pagamento</span>
                <span className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                  {PAGAMENTO_LABELS[pedido.formaPagamento]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#627271]">Status</span>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background:
                      pedido.statusPagamento === "confirmado"
                        ? "#efefef"
                        : pedido.statusPagamento === "pendente"
                        ? "#FFFBEB"
                        : "#FEF2F2",
                    color:
                      pedido.statusPagamento === "confirmado"
                        ? "#1f2937"
                        : pedido.statusPagamento === "pendente"
                        ? "#D97706"
                        : "#DC2626",
                    fontWeight: 600,
                  }}
                >
                  {pedido.statusPagamento === "confirmado"
                    ? "✅ Confirmado"
                    : pedido.statusPagamento === "pendente"
                    ? "⏳ Pendente"
                    : "❌ Recusado"}
                </span>
              </div>
              <div className="pt-2 border-t border-[#efefef] flex items-center justify-between">
                <span className="text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
                  Total pago
                </span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "#1f2937" }}>
                  {formatCurrency(pedido.total)}
                </span>
              </div>
            </div>
          </Section>

          {/* Quick actions */}
          {!isCanceled && !isDelivered && (
            <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 space-y-3">
              <p className="text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
                Ações rápidas
              </p>
              <div className="space-y-2">
                {nextStatuses.filter((s) => s !== "cancelado").map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all hover:shadow-sm"
                      style={{ borderColor: cfg.borderColor, background: cfg.bg }}
                      onClick={() => {
                        if (s === "enviado") {
                          setShowTrackingModal(true);
                        } else {
                          setNewStatus(s);
                          setShowStatusModal(true);
                        }
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                      <div className="text-left">
                        <p className="text-sm" style={{ fontWeight: 600, color: cfg.color }}>
                          Marcar como {cfg.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {!isCanceled && (
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-red-200 bg-red-50 transition-all hover:shadow-sm"
                    onClick={() => setShowCancelModal(true)}
                  >
                    <span style={{ fontSize: 18 }}>❌</span>
                    <div className="text-left">
                      <p className="text-sm text-red-600" style={{ fontWeight: 600 }}>
                        Cancelar pedido
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Delivered final state */}
          {isDelivered && (
            <div
              className="rounded-2xl p-5 border text-center"
              style={{ background: "#ECFDF5", borderColor: "#6EE7B7" }}
            >
              <p style={{ fontSize: 32, marginBottom: 8 }}>🎉</p>
              <p className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: 15 }}>
                Pedido entregue!
              </p>
              <p className="text-xs text-[#627271] mt-1">
                Entregue em {formatDateTime(pedido.timeline[pedido.timeline.length - 1].dataHora)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status update modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 max-w-sm w-full">
            <div className="sm:hidden w-10 h-1 rounded-full bg-[#efefef] mx-auto mb-4" />
            <p className="text-[#1f2937] mb-1" style={{ fontWeight: 700 }}>
              Atualizar status do pedido
            </p>
            <p className="text-xs text-[#627271] mb-4">
              Status atual: <strong>{STATUS_CONFIG[pedido.status].label}</strong>
            </p>
            <div className="space-y-2 mb-5">
              {nextStatuses.filter((s) => s !== "cancelado").map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                    style={{
                      borderColor: newStatus === s ? cfg.color : "#efefef",
                      background: newStatus === s ? cfg.bg : "white",
                    }}
                    onClick={() => setNewStatus(s)}
                  >
                    <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                    <span className="text-sm" style={{ fontWeight: 600, color: newStatus === s ? cfg.color : "#1f2937" }}>
                      {cfg.label}
                    </span>
                    {s === "enviado" && (
                      <span className="ml-auto text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Requer rastreio
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button
                className="sm:flex-1 px-4 py-2.5 rounded-xl border border-[#efefef] text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors"
                onClick={() => { setShowStatusModal(false); setNewStatus(null); }}
              >
                Cancelar
              </button>
              <button
                disabled={!newStatus}
                className="sm:flex-1 px-4 py-2.5 rounded-xl text-sm text-[#1f2937] transition-colors disabled:opacity-40"
                style={{ background: "#86cb92" }}
                onClick={handleStatusUpdate}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 max-w-sm w-full">
            <div className="sm:hidden w-10 h-1 rounded-full bg-[#efefef] mx-auto mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Truck size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>
                  Código de rastreio
                </p>
                <p className="text-xs text-[#627271]">Obrigatório ao marcar como Enviado</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="Ex: BR458921047BR"
              className="w-full border border-[#efefef] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 font-mono"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button
                className="sm:flex-1 px-4 py-2.5 rounded-xl border border-[#efefef] text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors"
                onClick={() => setShowTrackingModal(false)}
              >
                Cancelar
              </button>
              <button
                disabled={!trackingCode.trim()}
                className="sm:flex-1 px-4 py-2.5 rounded-xl text-sm text-white transition-colors disabled:opacity-40"
                style={{ background: "#7C3AED" }}
                onClick={handleTrackingAdd}
              >
                Confirmar envio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <X size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>
                  Cancelar pedido {pedido.numero}?
                </p>
                <p className="text-xs text-[#627271]">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-[#1f2937] mb-1.5 block" style={{ fontWeight: 600 }}>
                Motivo do cancelamento *
              </label>
              <textarea
                className="w-full border border-[#efefef] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
                rows={3}
                placeholder="Informe o motivo (mínimo 10 caracteres)"
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
              />
              <p className="text-[11px] text-[#627271] mt-1">{cancelMotivo.length}/10 caracteres mínimos</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button
                className="sm:flex-1 px-4 py-2.5 rounded-xl border border-[#efefef] text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors"
                onClick={() => { setShowCancelModal(false); setCancelMotivo(""); }}
              >
                Voltar
              </button>
              <button
                className="sm:flex-1 px-4 py-2.5 rounded-xl text-sm text-white transition-colors"
                style={{ background: "#DC2626" }}
                onClick={handleCancel}
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contabilizar venda modal */}
      {showContabilizarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 max-w-md w-full">
            <div className="sm:hidden w-10 h-1 rounded-full bg-[#efefef] mx-auto mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
                <DollarSign size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>
                  Contabilizar venda?
                </p>
                <p className="text-xs text-[#627271]">
                  Esta ação registra a venda no financeiro
                </p>
              </div>
            </div>

            <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-[#627271] shrink-0">Pedido</span>
                <span className="font-mono text-[#1f2937] text-right truncate">{pedido.numero}</span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-[#627271] shrink-0">Cliente</span>
                <span className="text-[#1f2937] text-right truncate">{pedido.cliente.nome}</span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-[#627271] shrink-0">Itens</span>
                <span className="text-[#1f2937] text-right truncate">{pedido.itens.length} produto(s)</span>
              </div>
              <div className="border-t border-[#e5e7eb] pt-2 flex justify-between items-center gap-3">
                <span className="text-sm text-[#627271] shrink-0">Valor total</span>
                <span className="text-lg text-[#1f2937] text-right" style={{ fontWeight: 700 }}>
                  {formatCurrency(pedido.total)}
                </span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button
                className="sm:flex-1 px-4 py-2.5 rounded-xl border border-[#efefef] text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors"
                onClick={() => setShowContabilizarModal(false)}
                disabled={registrandoVenda}
              >
                Cancelar
              </button>
              <button
                className="sm:flex-1 px-4 py-2.5 rounded-xl text-sm text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#2e7d32" }}
                onClick={handleContabilizar}
                disabled={registrandoVenda}
              >
                {registrandoVenda ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
