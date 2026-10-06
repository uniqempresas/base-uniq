/**
 * AjustarEstoqueModal — modal compartilhado de movimentação (B14 — WIRE §7).
 *
 * Decisão de implementação do WIRE: UM modal para as duas telas —
 * - Detalhe do produto: `produto` fixo (título "Ajustar Estoque");
 * - Extrato (MovimentacoesPage): `produtos` para busca client-side
 *   (título "Nova Movimentação").
 * Ambos gravam via `useRegistrarMovimentacao` (SPEC §4 — mesma ordem:
 * UPDATE estoque → INSERT movimentação, agora com `observacao` gravada — N10).
 * Mobile: bottom-sheet (`rounded-t-3xl` + handle, padrão Pedidos/Financeiro).
 */
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Package,
  Search,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { Produto } from "../../types/produto";
import type { MovTipo } from "../../types/estoque";
import { useRegistrarMovimentacao } from "../../hooks/use-registrar-movimentacao";

// Mesmos chips do modal do detalhe (SPEC §5.1) — fonte da verdade do vocabulário
const MOTIVOS_ENTRADA = ["Compra", "Devolução", "Ajuste", "Produção", "Inventário", "Outro"];
const MOTIVOS_SAIDA = ["Venda", "Ajuste", "Perda", "Quebra", "Doação", "Outro"];

export interface AjustarEstoqueModalProps {
  /** Modo detalhe: produto fixo, sem busca */
  produto?: Produto;
  /** Modo extrato: lista para busca client-side (useProdutos já filtrado por ativo) */
  produtos?: Produto[];
  /** Modo extrato: tipo pré-selecionado pelos botões do header */
  tipoInicial?: MovTipo;
  onClose: () => void;
  onSuccess: () => void;
}

export function AjustarEstoqueModal({
  produto,
  produtos,
  tipoInicial = "entrada",
  onClose,
  onSuccess,
}: AjustarEstoqueModalProps) {
  const modoBusca = !produto && !!produtos;

  const [tipo, setTipo] = useState<MovTipo>(produto ? "entrada" : tipoInicial);
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [obs, setObs] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  // Busca de produto (só modo extrato)
  const [produtoBusca, setProdutoBusca] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [showLista, setShowLista] = useState(false);

  const { registrarMovimentacao, loading } = useRegistrarMovimentacao();

  const panelRef = useRef<HTMLDivElement>(null);

  // WIRE §6: ESC fecha o modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const alvo = produto ?? produtoSelecionado;
  const qtdNum = Number(quantidade);

  const produtosFiltrados = modoBusca
    ? (produtos || []).filter(
        (p) =>
          p.nome.toLowerCase().includes(produtoBusca.toLowerCase()) ||
          p.sku.toLowerCase().includes(produtoBusca.toLowerCase())
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!alvo) return;

    const result = await registrarMovimentacao({
      produto: alvo,
      tipo,
      quantidade: qtdNum,
      motivo,
      observacao: obs,
    });

    if (result.success) {
      onSuccess();
    } else {
      setErro(result.error || "Erro ao registrar a movimentação. Tente novamente.");
    }
  };

  const motivosAtivos = tipo === "entrada" ? MOTIVOS_ENTRADA : MOTIVOS_SAIDA;
  const prontoParaEnviar =
    !!alvo && !!quantidade && !!motivo && !loading;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={modoBusca ? "Nova movimentação" : "Ajustar estoque"}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle do bottom-sheet (mobile) */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-[#d1d5db] mx-auto mt-3 mb-1" aria-hidden="true" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
              {modoBusca ? "Nova Movimentação" : "Ajustar Estoque"}
            </h3>
            <p className="text-[#627271] text-xs">
              {modoBusca
                ? "Registre entrada ou saída de estoque"
                : `${produto?.nome} · Atual: ${produto?.estoque} ${produto?.unidade}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#e5e5e5]"
          >
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tipo de movimentação">
            {(["entrada", "saida"] as MovTipo[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tipo === t}
                onClick={() => {
                  setTipo(t);
                  setMotivo("");
                  setErro(null);
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border text-sm transition-all"
                style={{
                  background: tipo === t ? (t === "entrada" ? "#efefef" : "#FEF2F2") : "transparent",
                  borderColor: tipo === t ? (t === "entrada" ? "#86cb92" : "#EF4444") : "#efefef",
                  color: tipo === t ? (t === "entrada" ? "#1f2937" : "#B91C1C") : "#627271",
                  fontWeight: tipo === t ? 700 : 400,
                }}
              >
                {t === "entrada" ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                {t === "entrada" ? "Entrada" : "Saída"}
              </button>
            ))}
          </div>

          {/* Produto — modo extrato: busca client-side sobre useProdutos */}
          {modoBusca && (
            <div className="relative">
              <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                Produto *
              </label>
              {alvo ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-[#86cb92] bg-[#efefef]">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <Package size={15} className="text-[#627271]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 600 }}>{alvo.nome}</p>
                    <p className="text-[#627271] text-xs">{alvo.sku} · Estoque: {alvo.estoque}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Limpar produto selecionado"
                    onClick={() => setProdutoSelecionado(null)}
                    className="text-[#627271] hover:text-[#1f2937]"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" />
                  <input
                    type="text"
                    value={produtoBusca}
                    onChange={(e) => { setProdutoBusca(e.target.value); setShowLista(true); }}
                    onFocus={() => setShowLista(true)}
                    placeholder="Buscar produto por nome ou SKU..."
                    aria-label="Buscar produto"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                    autoFocus
                  />
                  {showLista && produtoBusca && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#efefef] shadow-lg z-50 max-h-48 overflow-y-auto">
                      {produtosFiltrados.length === 0 ? (
                        <div className="p-3 text-[#627271] text-sm text-center">Nenhum produto encontrado</div>
                      ) : (
                        produtosFiltrados.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => { setProdutoSelecionado(p); setProdutoBusca(""); setShowLista(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#efefef] transition-colors text-left"
                          >
                            <Package size={14} className="text-[#627271] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 600 }}>{p.nome}</p>
                              <p className="text-[#627271] text-xs">{p.sku} · Estoque: {p.estoque}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quantidade */}
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
              Quantidade *
            </label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
              required
              autoFocus={!!produto}
            />
            {tipo === "saida" && alvo && quantidade && qtdNum > alvo.estoque && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertTriangle size={12} />
                Quantidade maior que o disponível ({alvo.estoque} {alvo.unidade})
              </p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
              Motivo *
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Motivo">
              {motivosAtivos.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={motivo === m}
                  onClick={() => setMotivo(m)}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all border"
                  style={{
                    background: motivo === m ? "#efefef" : "transparent",
                    color: motivo === m ? "#1f2937" : "#627271",
                    borderColor: motivo === m ? "#86cb92" : "#efefef",
                    fontWeight: motivo === m ? 600 : 400,
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Observação (opcional — agora gravada, N10) */}
          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
              Observação
            </label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value.slice(0, 500))}
              placeholder={modoBusca ? "Nota fiscal, motivo detalhado, referência..." : "Detalhes da movimentação..."}
              rows={2}
              maxLength={500}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] resize-none"
            />
          </div>

          {erro && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5" role="alert">
              <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-600 text-xs" style={{ fontWeight: 500 }}>{erro}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
              style={{ fontWeight: 500 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!prontoParaEnviar}
              className="flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: tipo === "entrada" ? "#86cb92" : "linear-gradient(135deg, #EF4444, #DC2626)",
                color: tipo === "entrada" ? "#1f2937" : "white",
                fontWeight: 600,
              }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" />Salvando...</>
              ) : (
                `Registrar ${tipo === "entrada" ? "entrada ↑" : "saída ↓"}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
