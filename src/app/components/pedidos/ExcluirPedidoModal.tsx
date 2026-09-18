import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { useExcluirPedido } from "../../hooks/use-excluir-pedido";

export interface ExcluirPedidoModalProps {
  /** Controle de abertura — o pai é dono do estado. */
  open: boolean;
  /** id de me_venda — enviado à RPC fn_excluir_pedido_cancelado. */
  vendaId: string;
  /** Número exibido (ex.: "#1042"). */
  numeroPedido: string;
  /** Nome do cliente para contexto. */
  nomeCliente: string;
  /**
   * true  → mostra "O estoque dos itens será devolvido."
   * false → linha omitida (sem conta a receber vinculada = estoque não foi baixado).
   * undefined → redação neutra honesta: "…será devolvido, se tiver sido baixado."
   */
  estoqueSeraDevolvido?: boolean;
  /** Fecha o modal. */
  onClose: () => void;
  /** Chamado após sucesso da RPC (modal já fechado por onClose). */
  onSuccess?: () => void;
}

/**
 * Modal autocontido de confirmação de exclusão de pedido cancelado (WIRE §4/§5).
 * Drop-in: recebe tudo por props — a lista de pedidos vai reutilizá-lo numa lane seguinte.
 */
export function ExcluirPedidoModal({
  open,
  vendaId,
  numeroPedido,
  nomeCliente,
  estoqueSeraDevolvido,
  onClose,
  onSuccess,
}: ExcluirPedidoModalProps) {
  const { excluirPedido, loading } = useExcluirPedido();
  const [motivo, setMotivo] = useState("");
  const [erroModal, setErroModal] = useState<string | null>(null);
  const confirmarRef = useRef<HTMLButtonElement>(null);

  // Reset do conteúdo a cada abertura
  useEffect(() => {
    if (open) {
      setMotivo("");
      setErroModal(null);
    }
  }, [open]);

  // Acessibilidade: foco no botão de confirmar ao abrir + ESC fecha (SPEC §5.5)
  useEffect(() => {
    if (!open) return undefined;

    const fecharPorEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", fecharPorEsc);
    const focoConfirmar = window.setTimeout(() => confirmarRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focoConfirmar);
      window.removeEventListener("keydown", fecharPorEsc);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const fechar = () => {
    if (!loading) onClose();
  };

  const handleConfirmar = async () => {
    setErroModal(null);
    const res = await excluirPedido({
      vendaId,
      motivo: motivo.trim() || undefined,
    });

    if (res.success) {
      onClose();
      onSuccess?.();
    } else {
      setErroModal(res.error || "Não foi possível excluir o pedido. Tente novamente.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="excluir-pedido-titulo"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 w-full max-w-md max-h-[92vh] overflow-y-auto">
        {/* Handle do bottom-sheet (mobile) */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-[#efefef] mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <div>
              <p id="excluir-pedido-titulo" className="text-[#1f2937]" style={{ fontWeight: 700 }}>
                Excluir pedido?
              </p>
              <p className="text-xs text-[#627271]">
                Pedido {numeroPedido} — {nomeCliente}
              </p>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#627271] hover:bg-[#efefef] hover:text-[#1f2937] transition-colors shrink-0 disabled:opacity-40"
            aria-label="Fechar"
            onClick={fechar}
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>

        {/* O que vai acontecer */}
        <div className="bg-[#f8f9fa] rounded-xl p-4 mt-4 mb-4">
          <p className="text-xs text-[#1f2937] mb-2" style={{ fontWeight: 700 }}>
            O que vai acontecer
          </p>
          <ul className="space-y-1.5 text-xs text-[#627271]">
            <li>• O pedido sai da lista e dos relatórios.</li>
            <li>• O histórico do pedido é preservado.</li>
            {estoqueSeraDevolvido === true && (
              <li>• O estoque dos itens será devolvido.</li>
            )}
            {estoqueSeraDevolvido === undefined && (
              <li>• O estoque dos itens será devolvido, se tiver sido baixado.</li>
            )}
            <li>• Esta ação não pode ser desfeita pela tela.</li>
          </ul>
        </div>

        {/* Motivo opcional */}
        <div className="mb-4">
          <label
            htmlFor="motivo-exclusao"
            className="text-xs text-[#1f2937] mb-1.5 block"
            style={{ fontWeight: 600 }}
          >
            Motivo (opcional)
          </label>
          <textarea
            id="motivo-exclusao"
            className="w-full border border-[#efefef] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
            rows={2}
            placeholder="ex.: pedido de teste"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Erro dentro do modal — o modal NÃO fecha (SPEC §5.4 / WIRE §6.2) */}
        {erroModal && (
          <div
            className="flex items-start gap-2.5 p-3.5 rounded-xl border mb-4"
            style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
            role="alert"
          >
            <span aria-hidden="true" style={{ flexShrink: 0 }}>⚠️</span>
            <p className="text-xs text-red-700">{erroModal}</p>
          </div>
        )}

        {/* Botões: mobile empilhados com Confirmar em cima; desktop Cancelar | Excluir */}
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            className="sm:flex-1 px-4 py-2.5 rounded-xl border border-[#efefef] text-sm text-[#1f2937] hover:bg-[#efefef] transition-colors disabled:opacity-50"
            onClick={fechar}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            ref={confirmarRef}
            className="sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-colors disabled:opacity-50"
            style={{ background: "#DC2626" }}
            onClick={handleConfirmar}
            disabled={loading}
            aria-label={`Excluir pedido ${numeroPedido}`}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Excluir pedido
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}