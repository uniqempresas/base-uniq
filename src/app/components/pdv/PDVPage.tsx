import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Search, X, Plus, Minus, Trash2, Tag, Clock, Pause,
  PlayCircle, AlertTriangle, CheckCircle2, BarChart3,
  Loader2, ShoppingBag, QrCode, CreditCard, Banknote,
  Zap, ChevronDown, User, ArrowLeft, Printer, MessageCircle,
  Star, Package, ArrowUpDown, Lock, Unlock, ShoppingCart,
  FileText, ArrowRightCircle,
} from "lucide-react";
// Usar placeholder atï¿½ ter a imagem real
const melPortrait = "https://api.dicebear.com/7.x/avataaars/svg?seed=MEL";
import {
  PRODUTOS, CATEGORIAS, VENDAS_DIA, MOVIMENTACOES_DIA,
  MOTIVOS_SANGRIA, MOTIVOS_SUPRIMENTO, PAGAMENTO_CONFIG,
  formatCurrency, calcSubtotal, calcDescontoTotal, calcSaldoCaixaDinheiro,
  type Produto, type ItemCarrinho, type Pagamento, type PagamentoTipo,
  type VendaEmEspera, type MovimentacaoTipo,
} from "./pdvMockData";

/* ══════════════════════════════════════════════
   NUMPAD COMPONENT
══════════════════════════════════════════════ */
function Numpad({ value, onChange, onConfirm, onClose, label }: {
  value: string; onChange: (v: string) => void; onConfirm: () => void; onClose: () => void; label?: string;
}) {
  const press = (k: string) => {
    if (k === "C") { onChange("0"); return; }
    if (k === "⌫") { onChange(value.length <= 1 ? "0" : value.slice(0, -1)); return; }
    if (k === "," && value.includes(",")) return;
    if (k === "," && value === "0") { onChange("0,"); return; }
    const next = value === "0" && k !== "," ? k : value + k;
    if (next.length > 10) return;
    onChange(next);
  };
  const keys = ["7","8","9","4","5","6","1","2","3","C","0","⌫"];
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-[#efefef] overflow-hidden w-full max-w-xs mx-auto">
      {label && <div className="px-4 py-2.5 border-b border-[#efefef] text-center text-sm text-[#627271]" style={{ fontWeight: 500 }}>{label}</div>}
      <div className="px-4 py-3 bg-[#efefef] border-b border-[#efefef] text-right">
        <p className="text-[#1f2937] text-2xl" style={{ fontWeight: 800 }}>{value}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {keys.map((k) => (
          <button key={k} onClick={() => press(k)}
            className="h-14 rounded-xl text-lg font-bold transition-all active:scale-95"
            style={{
              background: k === "C" ? "#FEF2F2" : k === "⌫" ? "#FFFBEB" : "#efefef",
              color: k === "C" ? "#EF4444" : k === "⌫" ? "#F59E0B" : "#1f2937",
            }}>
            {k}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        <button onClick={onClose} className="h-12 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
          Cancelar
        </button>
        <button onClick={onConfirm} className="h-12 rounded-xl text-[#1f2937] text-sm"
          style={{ background: "#86cb92", fontWeight: 700 }}>
          OK
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAYMENT MODAL
══════════════════════════════════════════════ */
function PagamentoModal({ total, itens, onClose, onSuccess }: {
  total: number; itens: ItemCarrinho[]; onClose: () => void; onSuccess: (pagamentos: Pagamento[]) => void;
}) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [tipoSel, setTipoSel] = useState<PagamentoTipo>("pix");
  const [valorInput, setValorInput] = useState(total.toFixed(2).replace(".", ","));
  const [valorEntregue, setValorEntregue] = useState("");
  const [parcelas, setParcelas] = useState(1);
  const [showNumpad, setShowNumpad] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState<"valor"|"entregue">("valor");
  const [loading, setLoading] = useState(false);
  const [showPix, setShowPix] = useState(false);

  const totalPago = pagamentos.reduce((s, p) => s + p.valor, 0);
  const restante = Math.max(0, total - totalPago);
  const troco = tipoSel === "dinheiro" && valorEntregue
    ? Math.max(0, parseFloat(valorEntregue.replace(",", ".")) - restante)
    : 0;
  const podeConfirmar = totalPago >= total;

  const valNum = parseFloat(valorInput.replace(",", ".")) || 0;

  const addPagamento = () => {
    if (valNum <= 0) return;
    const p: Pagamento = {
      id: `pg${Date.now()}`, tipo: tipoSel, valor: Math.min(valNum, restante),
      parcelas: tipoSel === "credito" ? parcelas : undefined,
      valorEntregue: tipoSel === "dinheiro" && valorEntregue ? parseFloat(valorEntregue.replace(",", ".")) : undefined,
    };
    setPagamentos((prev) => [...prev, p]);
    setValorInput(Math.max(0, restante - p.valor).toFixed(2).replace(".", ","));
    setValorEntregue("");
    if (tipoSel === "pix") setShowPix(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onSuccess(pagamentos);
  };

  const TIPOS: PagamentoTipo[] = ["dinheiro", "debito", "credito", "pix", "outro"];

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-screen sm:max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ background: "#1f2937" }}>
          <div>
            <p className="text-white/60 text-xs">Total a pagar</p>
            <p className="text-white" style={{ fontWeight: 900, fontSize: "2rem", lineHeight: 1 }}>
              {formatCurrency(total)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">{itens.length} {itens.length === 1 ? "item" : "itens"}</p>
            {totalPago > 0 && (
              <p className="text-[#86cb92] text-sm" style={{ fontWeight: 700 }}>
                Pago: {formatCurrency(totalPago)}
              </p>
            )}
            {restante > 0 && totalPago > 0 && (
              <p className="text-amber-400 text-sm" style={{ fontWeight: 700 }}>
                Resta: {formatCurrency(restante)}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Formas selecionadas */}
          {pagamentos.length > 0 && (
            <div className="mb-4 space-y-2">
              {pagamentos.map((p) => {
                const cfg = PAGAMENTO_CONFIG[p.tipo];
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ background: cfg.bg, borderColor: `${cfg.cor}30` }}>
                    <span className="text-xl">{cfg.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: cfg.cor, fontWeight: 700 }}>{cfg.label}</p>
                      {p.parcelas && p.parcelas > 1 && (
                        <p className="text-xs text-[#627271]">{p.parcelas}x de {formatCurrency(p.valor / p.parcelas)}</p>
                      )}
                    </div>
                    <p style={{ color: cfg.cor, fontWeight: 800, fontSize: "1rem" }}>{formatCurrency(p.valor)}</p>
                    <button onClick={() => setPagamentos(prev => prev.filter(x => x.id !== p.id))}
                      className="w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center">
                      <X size={13} className="text-[#627271]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* PIX QR Placeholder */}
          {showPix && (
            <div className="mb-4 p-5 rounded-2xl border-2 border-teal-200 bg-teal-50 text-center">
              <div className="w-36 h-36 mx-auto bg-white rounded-xl border-2 border-[#efefef] flex items-center justify-center mb-3 p-3">
                <div className="w-full h-full grid grid-cols-5 gap-0.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="rounded-sm" style={{ background: Math.random() > 0.5 ? "#0F766E" : "transparent" }} />
                  ))}
                </div>
              </div>
              <p className="text-teal-800 text-sm" style={{ fontWeight: 700 }}>QR Code PIX gerado</p>
              <p className="text-teal-600 text-xs">Aguardando pagamento...</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-teal-600 text-xs">Verificando...</span>
              </div>
            </div>
          )}

          {/* Tipo seletor */}
          {restante > 0 && (
            <>
              <p className="text-[#1f2937] text-xs mb-2" style={{ fontWeight: 600 }}>FORMA DE PAGAMENTO</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {TIPOS.map(t => {
                  const cfg = PAGAMENTO_CONFIG[t];
                  const isActive = tipoSel === t;
                  return (
                    <button key={t} onClick={() => { setTipoSel(t); setValorInput(restante.toFixed(2).replace(".", ",")); }}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all"
                      style={{ background: isActive ? cfg.bg : "white", borderColor: isActive ? cfg.cor : "#efefef" }}>
                      <span className="text-xl">{cfg.emoji}</span>
                      <span className="text-[10px] text-center leading-tight" style={{ color: isActive ? cfg.cor : "#627271", fontWeight: isActive ? 700 : 400 }}>
                        {t === "debito" ? "Débito" : t === "credito" ? "Crédito" : cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Valor input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[#627271] text-xs block mb-1" style={{ fontWeight: 500 }}>Valor {tipoSel === "dinheiro" ? "a cobrar" : "recebido"}</label>
                  <button onClick={() => { setNumpadTarget("valor"); setShowNumpad(true); }}
                    className="w-full px-4 py-3 rounded-xl border-2 text-left text-xl"
                    style={{ borderColor: "#86cb92", fontWeight: 800, color: "#1f2937" }}>
                    R$ {valorInput}
                  </button>
                </div>
                {tipoSel === "dinheiro" && (
                  <div>
                    <label className="text-[#627271] text-xs block mb-1" style={{ fontWeight: 500 }}>Valor entregue pelo cliente</label>
                    <button onClick={() => { setNumpadTarget("entregue"); setShowNumpad(true); }}
                      className="w-full px-4 py-3 rounded-xl border border-[#efefef] text-left text-xl"
                      style={{ fontWeight: 800, color: "#1f2937" }}>
                      R$ {valorEntregue || "0"}
                    </button>
                  </div>
                )}
              </div>

              {/* Troco preview */}
              {tipoSel === "dinheiro" && troco > 0 && (
                <div className="mb-3 p-3 rounded-xl" style={{ background: "#efefef", border: "1px solid #86cb92" }}>
                  <p className="text-[#1f2937] text-sm">
                    💸 Troco: <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>{formatCurrency(troco)}</span>
                  </p>
                </div>
              )}

              {/* Parcelas */}
              {tipoSel === "credito" && (
                <div className="mb-3">
                  <label className="text-[#627271] text-xs block mb-1" style={{ fontWeight: 500 }}>Parcelas</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1,2,3,4,6,10,12].map(p => (
                      <button key={p} onClick={() => setParcelas(p)}
                        className="px-3 py-2 rounded-xl border text-xs transition-all"
                        style={{ background: parcelas === p ? "#F5F3FF" : "white", borderColor: parcelas === p ? "#7C3AED" : "#efefef", color: parcelas === p ? "#7C3AED" : "#627271", fontWeight: parcelas === p ? 700 : 400 }}>
                        {p === 1 ? "À vista" : `${p}x ${formatCurrency(valNum / p)}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={addPagamento} disabled={valNum <= 0}
                className="w-full py-3 rounded-xl text-[#1f2937] text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#86cb92", fontWeight: 700 }}>
                <Plus size={16} /> Adicionar {PAGAMENTO_CONFIG[tipoSel].label}
              </button>

              {/* Numpad overlay */}
              {showNumpad && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60" onClick={() => setShowNumpad(false)}>
                  <div onClick={e => e.stopPropagation()}>
                    <Numpad
                      label={numpadTarget === "valor" ? "Valor recebido (R$)" : "Valor entregue (R$)"}
                      value={numpadTarget === "valor" ? valorInput : (valorEntregue || "0")}
                      onChange={v => numpadTarget === "valor" ? setValorInput(v) : setValorEntregue(v)}
                      onConfirm={() => setShowNumpad(false)}
                      onClose={() => setShowNumpad(false)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#efefef] bg-[#efefef] flex gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
            Voltar
          </button>
          <button onClick={handleConfirm} disabled={!podeConfirmar || loading}
            className="flex-1 py-4 rounded-xl text-[#1f2937] flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            style={{ background: podeConfirmar ? "#86cb92" : "#627271", fontWeight: 800, fontSize: "1.05rem" }}>
            {loading ? <><Loader2 size={18} className="animate-spin" /> Processando...</> : <><Zap size={18} /> Confirmar Venda</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SANGRIA / SUPRIMENTO MODAL
══════════════════════════════════════════════ */
function MovimentacaoModal({ onClose, onSuccess }: {
  onClose: () => void; onSuccess: () => void;
}) {
  const [tipo, setTipo] = useState<MovimentacaoTipo>("sangria");
  const [valor, setValor] = useState("0");
  const [motivo, setMotivo] = useState("");
  const [obs, setObs] = useState("");
  const [showNumpad, setShowNumpad] = useState(false);
  const [loading, setLoading] = useState(false);
  const saldoAtual = calcSaldoCaixaDinheiro();
  const valNum = parseFloat(valor.replace(",", ".")) || 0;
  const saldoInsuficiente = tipo === "sangria" && valNum > saldoAtual;
  const motivos = tipo === "sangria" ? MOTIVOS_SANGRIA : MOTIVOS_SUPRIMENTO;

  const handle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#efefef] flex items-center justify-between">
          <h3 className="text-[#1f2937]" style={{ fontWeight: 700 }}>Movimentação de Caixa</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center">
            <X size={15} className="text-[#627271]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Tipo toggle */}
          <div className="flex rounded-xl overflow-hidden border border-[#efefef] p-1 gap-1 bg-[#efefef]">
            {([["sangria","Sangria (Retirada)","#EF4444"],["suprimento","Suprimento (Adição)","#86cb92"]] as const).map(([t, label, cor]) => (
              <button key={t} onClick={() => { setTipo(t); setMotivo(""); }}
                className="flex-1 py-2.5 rounded-lg text-xs transition-all"
                style={{ background: tipo === t ? cor : "transparent", color: tipo === t ? (t === "suprimento" ? "#1f2937" : "white") : "#627271", fontWeight: tipo === t ? 700 : 400 }}>
                {label}
              </button>
            ))}
          </div>

          {/* Saldo atual */}
          <div className="flex justify-between items-center px-4 py-2.5 rounded-xl" style={{ background: "#efefef" }}>
            <span className="text-[#627271] text-xs">Saldo em dinheiro</span>
            <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{formatCurrency(saldoAtual)}</span>
          </div>

          {/* Valor */}
          <div>
            <label className="text-[#1f2937] text-xs block mb-1.5" style={{ fontWeight: 600 }}>
              {tipo === "sangria" ? "Valor a retirar" : "Valor a adicionar"}
            </label>
            <button onClick={() => setShowNumpad(true)}
              className="w-full px-4 py-4 rounded-2xl border-2 text-center"
              style={{ borderColor: saldoInsuficiente ? "#EF4444" : "#86cb92", fontWeight: 900, fontSize: "1.8rem", color: saldoInsuficiente ? "#EF4444" : "#1f2937" }}>
              R$ {valor}
            </button>
            {saldoInsuficiente && (
              <p className="text-red-500 text-xs mt-1">⚠️ Saldo insuficiente no caixa</p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="text-[#1f2937] text-xs block mb-1.5" style={{ fontWeight: 600 }}>Motivo *</label>
            <select value={motivo} onChange={e => setMotivo(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-white appearance-none">
              <option value="">Selecionar motivo...</option>
              {motivos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Obs */}
          <div>
            <label className="text-[#1f2937] text-xs block mb-1.5" style={{ fontWeight: 500 }}>Observações</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} placeholder="Opcional..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] resize-none" />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="px-4 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>Cancelar</button>
          <button onClick={handle} disabled={loading || valNum <= 0 || !motivo || saldoInsuficiente}
            className="flex-1 py-3 rounded-xl text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: tipo === "sangria" ? "linear-gradient(135deg,#DC2626,#EF4444)" : "#86cb92", color: tipo === "sangria" ? "white" : "#1f2937", fontWeight: 700 }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {tipo === "sangria" ? "Registrar Sangria" : "Registrar Suprimento"}
          </button>
        </div>

        {showNumpad && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60" onClick={() => setShowNumpad(false)}>
            <div onClick={e => e.stopPropagation()}>
              <Numpad label="Valor (R$)" value={valor} onChange={setValor} onConfirm={() => setShowNumpad(false)} onClose={() => setShowNumpad(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   VENDA EM ESPERA MODAL
══════════════════════════════════════════════ */
function EsperaModal({ itens, esperas, onSalvar, onRecuperar, onClose }: {
  itens: ItemCarrinho[]; esperas: VendaEmEspera[];
  onSalvar: (label: string) => void; onRecuperar: (id: string) => void; onClose: () => void;
}) {
  const [label, setLabel] = useState("");
  const [mode, setMode] = useState<"salvar"|"recuperar">("salvar");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#efefef] flex items-center justify-between">
          <h3 className="text-[#1f2937]" style={{ fontWeight: 700 }}>Vendas em Espera</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center"><X size={15} className="text-[#627271]" /></button>
        </div>
        <div className="flex border-b border-[#efefef]">
          {(["salvar","recuperar"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 py-3 text-sm capitalize transition-all"
              style={{ color: mode === m ? "#1f2937" : "#627271", fontWeight: mode === m ? 700 : 400, borderBottom: mode === m ? "2px solid #86cb92" : "2px solid transparent" }}>
              {m === "salvar" ? "Salvar em Espera" : `Recuperar (${esperas.length})`}
            </button>
          ))}
        </div>
        <div className="p-5">
          {mode === "salvar" ? (
            <div className="space-y-4">
              {itens.length === 0 ? (
                <p className="text-[#627271] text-sm text-center py-4">Carrinho vazio</p>
              ) : (
                <>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {itens.map(i => (
                      <div key={i.id} className="flex justify-between text-sm">
                        <span className="text-[#1f2937]">{i.produto.nome} x{i.quantidade}</span>
                        <span className="text-[#627271]">{formatCurrency(i.precoUnitario * i.quantidade)}</span>
                      </div>
                    ))}
                  </div>
                  <input value={label} onChange={e => setLabel(e.target.value)}
                    placeholder="Nome do cliente (para identificar)..."
                    className="w-full px-4 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]" />
                  <button onClick={() => { if (label.trim().length >= 3) { onSalvar(label); onClose(); } }}
                    disabled={label.trim().length < 3}
                    className="w-full py-3 rounded-xl text-[#1f2937] text-sm disabled:opacity-40" style={{ background: "#86cb92", fontWeight: 700 }}>
                    <Pause size={15} className="inline mr-1" /> Salvar em espera
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {esperas.length === 0 ? (
                <p className="text-[#627271] text-sm text-center py-4">Nenhuma venda em espera</p>
              ) : esperas.map(e => (
                <button key={e.id} onClick={() => { onRecuperar(e.id); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#efefef] hover:border-[#86cb92] hover:bg-[#efefef] transition-all text-left">
                  <PlayCircle size={18} className="text-[#627271] shrink-0" />
                  <div className="flex-1">
                    <p className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>{e.label}</p>
                    <p className="text-[#627271] text-xs">{e.itens.length} itens · {formatCurrency(calcSubtotal(e.itens))}</p>
                  </div>
                  <span className="text-[#627271] text-xs">{e.criadaEm}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SUCCESS SCREEN
══════════════════════════════════════════════ */
function VendaSucesso({ total, numero, troco, pagamentos, onNova }: {
  total: number; numero: string; troco: number; pagamentos: Pagamento[]; onNova: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-8 text-center" style={{ background: "#86cb92" }}>
          <div className="w-20 h-20 rounded-full bg-[#1f2937]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-[#1f2937]" />
          </div>
          <p className="text-[#1f2937]/70 text-sm mb-1">Venda #{numero} concluída!</p>
          <p className="text-[#1f2937]" style={{ fontWeight: 900, fontSize: "2.4rem", lineHeight: 1 }}>
            {formatCurrency(total)}
          </p>
          {troco > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1f2937]/10">
              <span className="text-[#1f2937] text-sm">💸 Troco:</span>
              <span className="text-[#1f2937]" style={{ fontWeight: 800, fontSize: "1.2rem" }}>{formatCurrency(troco)}</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="space-y-2 mb-5">
            {pagamentos.map(p => {
              const cfg = PAGAMENTO_CONFIG[p.tipo];
              return (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-[#627271]">{cfg.emoji} {cfg.label}{p.parcelas && p.parcelas > 1 ? ` (${p.parcelas}x)` : ""}</span>
                  <span className="text-[#1f2937]" style={{ fontWeight: 600 }}>{formatCurrency(p.valor)}</span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              <Printer size={15} /> Imprimir
            </button>
            <button className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              <MessageCircle size={15} /> WhatsApp
            </button>
          </div>
          <button onClick={onNova} className="w-full py-4 rounded-xl text-[#1f2937]"
            style={{ background: "#86cb92", fontWeight: 800, fontSize: "1rem" }}>
            🎉 Nova Venda
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PRODUCT CARD
══════════════════════════════════════════════ */
function ProductCard({ produto, onAdd }: { produto: Produto; onAdd: () => void }) {
  const [flash, setFlash] = useState(false);
  const handle = () => { onAdd(); setFlash(true); setTimeout(() => setFlash(false), 400); };
  const semEstoque = produto.estoque === 0;
  return (
    <button onClick={handle} disabled={semEstoque}
      className="relative flex flex-col items-start p-3 rounded-2xl border-2 transition-all active:scale-95 text-left touch-manipulation"
      style={{
        background: flash ? `${produto.cor}20` : "white",
        borderColor: flash ? produto.cor : semEstoque ? "#efefef" : "#efefef",
        opacity: semEstoque ? 0.4 : 1,
        minHeight: "80px",
      }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 text-xl shrink-0"
        style={{ background: `${produto.cor}15` }}>
        {produto.emoji}
      </div>
      <p className="text-[#1f2937] text-xs leading-tight mb-1" style={{ fontWeight: 700 }}>{produto.nome}</p>
      <p className="text-sm" style={{ color: produto.cor, fontWeight: 800 }}>{formatCurrency(produto.preco)}</p>
      {produto.estoque < 5 && produto.estoque > 0 && (
        <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700" style={{ fontWeight: 700 }}>
          {produto.estoque} rest.
        </span>
      )}
      {flash && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: `${produto.cor}15` }}>
          <CheckCircle2 size={28} style={{ color: produto.cor }} />
        </div>
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════
   CART ITEM
══════════════════════════════════════════════ */
function CartItem({ item, onQty, onRemove, onDesconto, isSelected, onSelect }: {
  item: ItemCarrinho; onQty: (delta: number) => void; onRemove: () => void;
  onDesconto: () => void; isSelected: boolean; onSelect: () => void;
}) {
  const subtotal = item.precoUnitario * item.quantidade - item.desconto;
  return (
    <button onClick={onSelect} className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2"
      style={{ background: isSelected ? "#efefef" : "white", borderColor: isSelected ? "#86cb92" : "transparent" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `${item.produto.cor}15` }}>
        {item.produto.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 700 }}>{item.produto.nome}</p>
        <p className="text-[#627271] text-xs">{formatCurrency(item.precoUnitario)} / un.</p>
        {item.desconto > 0 && (
          <p className="text-[#627271] text-[10px]">-{formatCurrency(item.desconto)} desc.</p>
        )}
      </div>
      {/* Qty controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={e => { e.stopPropagation(); onQty(-1); }}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors touch-manipulation"
          style={{ background: "#FEF2F2" }}>
          <Minus size={14} className="text-red-500" />
        </button>
        <span className="w-8 text-center text-[#1f2937] text-sm" style={{ fontWeight: 800 }}>{item.quantidade}</span>
        <button onClick={e => { e.stopPropagation(); onQty(1); }}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors touch-manipulation"
          style={{ background: "#efefef" }}>
          <Plus size={14} className="text-[#627271]" />
        </button>
      </div>
      {/* Subtotal + actions */}
      <div className="text-right shrink-0">
        <p className="text-[#1f2937] text-sm" style={{ fontWeight: 800 }}>{formatCurrency(subtotal)}</p>
        <div className="flex gap-1 mt-1 justify-end">
          <button onClick={e => { e.stopPropagation(); onDesconto(); }}
            className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#FFFBEB" }}>
            <Tag size={11} className="text-amber-500" />
          </button>
          <button onClick={e => { e.stopPropagation(); onRemove(); }}
            className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#FEF2F2" }}>
            <Trash2 size={11} className="text-red-500" />
          </button>
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════
   MAIN PDV PAGE
══════════════════════════════════════════════ */
export function PDVPage() {
  const navigate = useNavigate();

  // State
  const [caixaAberto] = useState(true); // already opened
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [busca, setBusca] = useState("");
  const [catSel, setCatSel] = useState("todos");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showPagamento, setShowPagamento] = useState(false);
  const [showMovimentacao, setShowMovimentacao] = useState(false);
  const [showEspera, setShowEspera] = useState(false);
  const [esperas, setEsperas] = useState<VendaEmEspera[]>([]);
  const [vendaSucesso, setVendaSucesso] = useState<{ total: number; numero: string; troco: number; pagamentos: Pagamento[] } | null>(null);
  const [showDescModal, setShowDescModal] = useState(false);
  const [descValor, setDescValor] = useState("0");
  const [showDescontoGeral, setShowDescontoGeral] = useState(false);
  const [descontoGeral, setDescontoGeral] = useState(0);
  const [showDescontoInput, setShowDescontoInput] = useState(false);
  const [descontoInputVal, setDescontoInputVal] = useState("0");
  const [vendaNum, setVendaNum] = useState(5); // mock: 4 already done today
  const [toast, setToast] = useState("");
  const [hora, setHora] = useState(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  const [showCancelarConfirm, setShowCancelarConfirm] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  // Clock
  useEffect(() => {
    const t = setInterval(() => setHora(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })), 30000);
    return () => clearInterval(t);
  }, []);

  // Filtered products
  const produtosFiltrados = PRODUTOS.filter(p => {
    const matchCat = catSel === "todos" || p.categoriaId === catSel;
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigo.includes(busca);
    return matchCat && matchBusca;
  });

  const favoritos = PRODUTOS.filter(p => p.favorito);

  // Calc
  const subtotalItens = calcSubtotal(itens);
  const descontoItens = calcDescontoTotal(itens);
  const total = Math.max(0, subtotalItens - descontoGeral);

  // Add product
  const addProduto = (p: Produto) => {
    setItens(prev => {
      const existing = prev.find(i => i.produto.id === p.id);
      if (existing) return prev.map(i => i.id === existing.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      const novo: ItemCarrinho = { id: `i${Date.now()}`, produto: p, quantidade: 1, precoUnitario: p.preco, desconto: 0 };
      showToast(`${p.emoji} ${p.nome} adicionado`);
      return [...prev, novo];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setItens(prev => prev.map(i => i.id === id
      ? { ...i, quantidade: Math.max(1, i.quantidade + delta) }
      : i
    ));
  };

  const removeItem = (id: string) => {
    setItens(prev => prev.filter(i => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const applyDesconto = () => {
    if (!selectedItemId) return;
    const val = parseFloat(descValor.replace(",", ".")) || 0;
    setItens(prev => prev.map(i => i.id === selectedItemId ? { ...i, desconto: val } : i));
    setShowDescModal(false);
    showToast("Desconto aplicado!");
  };

  const handleSalvarEspera = (label: string) => {
    setEsperas(prev => [...prev, { id: `e${Date.now()}`, label, itens: [...itens], criadaEm: hora }]);
    setItens([]);
    setDescontoGeral(0);
    showToast("Venda salva em espera!");
  };

  const handleRecuperarEspera = (id: string) => {
    const e = esperas.find(x => x.id === id);
    if (e) {
      setItens(e.itens);
      setEsperas(prev => prev.filter(x => x.id !== id));
      showToast("Venda recuperada!");
    }
  };

  const handleVendaSucesso = (pagamentos: Pagamento[]) => {
    const num = String(vendaNum).padStart(3, "0");
    const troco = pagamentos.find(p => p.tipo === "dinheiro" && p.valorEntregue)
      ? Math.max(0, (pagamentos.find(p => p.tipo === "dinheiro")?.valorEntregue || 0) - total)
      : 0;
    setVendaSucesso({ total, numero: num, troco, pagamentos });
    setVendaNum(v => v + 1);
    setShowPagamento(false);
  };

  const novaVenda = () => {
    setItens([]);
    setDescontoGeral(0);
    setSelectedItemId(null);
    setVendaSucesso(null);
  };

  // Totais do dia
  const faturamentoDia = VENDAS_DIA.reduce((s, v) => s + v.total, 0) + (vendaSucesso ? total : 0);
  const vendasDia = VENDAS_DIA.length + (vendaSucesso ? 1 : 0);

  return (
    <div className="h-full flex flex-col bg-[#efefef] overflow-hidden relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#86cb92] text-[#1f2937] px-4 py-2 rounded-xl shadow-xl text-sm flex items-center gap-2">
          <CheckCircle2 size={15} />{toast}
        </div>
      )}

      {/* Success overlay */}
      {vendaSucesso && (
        <VendaSucesso
          total={vendaSucesso.total}
          numero={vendaSucesso.numero}
          troco={vendaSucesso.troco}
          pagamentos={vendaSucesso.pagamentos}
          onNova={novaVenda}
        />
      )}

      {/* Payment modal */}
      {showPagamento && (
        <PagamentoModal total={total} itens={itens} onClose={() => setShowPagamento(false)} onSuccess={handleVendaSucesso} />
      )}

      {/* Movimentação modal */}
      {showMovimentacao && (
        <MovimentacaoModal onClose={() => setShowMovimentacao(false)} onSuccess={() => { setShowMovimentacao(false); showToast("Movimentação registrada!"); }} />
      )}

      {/* Espera modal */}
      {showEspera && (
        <EsperaModal itens={itens} esperas={esperas} onSalvar={handleSalvarEspera} onRecuperar={handleRecuperarEspera} onClose={() => setShowEspera(false)} />
      )}

      {/* Desconto item modal */}
      {showDescModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDescModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <Numpad
              label={`Desconto em R$ — ${itens.find(i => i.id === selectedItemId)?.produto.nome}`}
              value={descValor}
              onChange={setDescValor}
              onConfirm={applyDesconto}
              onClose={() => setShowDescModal(false)}
            />
          </div>
        </div>
      )}

      {/* Desconto geral numpad */}
      {showDescontoInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDescontoInput(false)}>
          <div onClick={e => e.stopPropagation()}>
            <Numpad
              label="Desconto geral na venda (R$)"
              value={descontoInputVal}
              onChange={setDescontoInputVal}
              onConfirm={() => { setDescontoGeral(parseFloat(descontoInputVal.replace(",", ".")) || 0); setShowDescontoInput(false); showToast("Desconto aplicado!"); }}
              onClose={() => setShowDescontoInput(false)}
            />
          </div>
        </div>
      )}

      {/* Cancelar confirm */}
      {showCancelarConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCancelarConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <AlertTriangle size={36} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 700 }}>Cancelar venda?</h3>
            <p className="text-[#627271] text-sm mb-5">Todos os {itens.length} itens serão removidos.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelarConfirm(false)} className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>Manter</button>
              <button onClick={() => { novaVenda(); setShowCancelarConfirm(false); showToast("Venda cancelada"); }} className="flex-1 py-3 rounded-xl text-white text-sm" style={{ background: "#EF4444", fontWeight: 700 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Caixa fechado */}
      {!caixaAberto && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#1f2937]/90">
          <div className="text-center p-8 bg-white rounded-3xl max-w-sm mx-4">
            <Lock size={48} className="text-[#627271] mx-auto mb-4" />
            <h2 className="text-[#1f2937] mb-2" style={{ fontWeight: 800, fontSize: "1.2rem" }}>Caixa Fechado</h2>
            <p className="text-[#627271] text-sm mb-6">Abra o caixa para iniciar as vendas</p>
            <button onClick={() => navigate("/vendas/pdv/abertura")}
              className="w-full py-4 rounded-xl text-[#1f2937] text-lg" style={{ background: "#86cb92", fontWeight: 800 }}>
              Abrir Caixa
            </button>
          </div>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-[#efefef] px-4 py-2 flex items-center gap-3 shrink-0">
        {/* Caixa info */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#86cb92] animate-pulse" />
          <span className="text-[#1f2937] text-xs" style={{ fontWeight: 600 }}>Caixa #1 · Maria Silva</span>
          <span className="text-[#627271] text-xs">{hora}</span>
        </div>

        <div className="flex-1" />

        {/* Menu de Contexto - Vendas */}
        <div className="hidden lg:flex items-center gap-2 mx-4">
          <button
            onClick={() => navigate("/vendas/pdv")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#efefef] border border-[#86cb92] text-[#1f2937] text-xs"
            style={{ fontWeight: 600 }}
          >
            <ShoppingCart size={14} />
            PDV
          </button>
          <button
            onClick={() => navigate("/vendas/pdv/abertura")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef]"
            style={{ fontWeight: 500 }}
          >
            <Unlock size={14} />
            Abrir
          </button>
          <button
            onClick={() => navigate("/vendas/pdv/fechamento")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef]"
            style={{ fontWeight: 500 }}
          >
            <Lock size={14} />
            Fechar
          </button>
          <button
            onClick={() => navigate("/vendas/pedidos")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef]"
            style={{ fontWeight: 500 }}
          >
            <FileText size={14} />
            Pedidos
          </button>
          <button
            onClick={() => navigate("/vendas/relatorios")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef]"
            style={{ fontWeight: 500 }}
          >
            <ArrowRightCircle size={14} />
            Relatórios
          </button>
        </div>

        {/* Day summary */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="text-center">
            <p className="text-[#627271]">Vendas hoje</p>
            <p className="text-[#1f2937]" style={{ fontWeight: 700 }}>{vendasDia}</p>
          </div>
          <div className="text-center">
            <p className="text-[#627271]">Faturamento</p>
            <p style={{ color: "#1f2937", fontWeight: 700 }}>{formatCurrency(faturamentoDia)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowHistorico(!showHistorico)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors"
            style={{ fontWeight: 500 }}>
            <BarChart3 size={14} />
            <span className="hidden sm:inline">Histórico</span>
          </button>
          <button onClick={() => setShowMovimentacao(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors"
            style={{ fontWeight: 500 }}>
            <ArrowUpDown size={14} />
            <span className="hidden sm:inline">Sangria</span>
          </button>
          <button onClick={() => navigate("/vendas/pdv/fechamento")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors"
            style={{ fontWeight: 600 }}>
            <Lock size={13} />
            <span className="hidden sm:inline">Fechar Caixa</span>
          </button>
        </div>
      </div>

      {/* ── MAIN SPLIT ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── LEFT: Products ── */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-[#efefef]">

          {/* Search */}
          <div className="px-4 pt-3 pb-2 bg-white border-b border-[#efefef]">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
              <input
                value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar produto ou código de barras..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-[#efefef]"
                style={{ fontSize: "16px" }} // prevent zoom on iOS
              />
              {busca && (
                <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={15} className="text-[#627271]" />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border-b border-[#efefef] px-3 py-2 flex gap-1.5 overflow-x-auto shrink-0">
            {CATEGORIAS.map(c => (
              <button key={c.id} onClick={() => setCatSel(c.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all shrink-0"
                style={{
                  background: catSel === c.id ? c.cor : "#efefef",
                  color: catSel === c.id ? "white" : "#627271",
                  fontWeight: catSel === c.id ? 700 : 400,
                }}>
                <span>{c.emoji}</span>
                {c.nome}
              </button>
            ))}
          </div>

          {/* Products grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {!busca && catSel === "todos" && (
              <>
                <p className="text-[#627271] text-xs mb-2 px-1" style={{ fontWeight: 600 }}>⭐ FAVORITOS</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 mb-4">
                  {favoritos.map(p => <ProductCard key={p.id} produto={p} onAdd={() => addProduto(p)} />)}
                </div>
                <p className="text-[#627271] text-xs mb-2 px-1" style={{ fontWeight: 600 }}>TODOS OS PRODUTOS</p>
              </>
            )}
            {produtosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Package size={32} className="text-[#627271] mx-auto mb-2" />
                <p className="text-[#627271] text-sm">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {produtosFiltrados.map(p => <ProductCard key={p.id} produto={p} onAdd={() => addProduto(p)} />)}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Cart ── */}
        <div className="w-72 sm:w-80 lg:w-96 flex flex-col bg-white shrink-0">

          {/* Cart header */}
          <div className="px-4 py-3 border-b border-[#efefef] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} style={{ color: "#1f2937" }} />
              <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
                Carrinho {itens.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#efefef] text-[#1f2937] text-xs">{itens.length}</span>}
              </span>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setShowEspera(true)}
                className="w-8 h-8 rounded-xl border border-[#efefef] flex items-center justify-center hover:bg-[#efefef] transition-colors"
                title="Vendas em espera">
                <Pause size={14} className="text-[#627271]" />
              </button>
              <button onClick={() => { if (itens.length > 0) setShowCancelarConfirm(true); }}
                className="w-8 h-8 rounded-xl border border-[#efefef] flex items-center justify-center hover:bg-red-50 transition-colors"
                title="Cancelar venda">
                <X size={14} className="text-[#627271]" />
              </button>
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {itens.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <ShoppingBag size={40} className="text-[#627271] mb-3" />
                <p className="text-[#627271] text-sm" style={{ fontWeight: 500 }}>Carrinho vazio</p>
                <p className="text-[#627271] text-xs mt-1">Toque nos produtos para adicionar</p>
              </div>
            ) : itens.map(item => (
              <CartItem
                key={item.id} item={item}
                onQty={d => changeQty(item.id, d)}
                onRemove={() => removeItem(item.id)}
                onDesconto={() => { setSelectedItemId(item.id); setDescValor("0"); setShowDescModal(true); }}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
              />
            ))}
          </div>

          {/* ── TOTALS ── */}
          <div className="border-t border-[#efefef] shrink-0">
            {/* Subtotal + Descontos */}
            <div className="px-4 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-[#627271]">Subtotal</span>
                <span className="text-[#1f2937]" style={{ fontWeight: 500 }}>{formatCurrency(subtotalItens)}</span>
              </div>
              {(descontoItens > 0 || descontoGeral > 0) && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#627271]">Descontos</span>
                  <span className="text-[#627271]" style={{ fontWeight: 600 }}>
                    -{formatCurrency(descontoItens + descontoGeral)}
                  </span>
                </div>
              )}
            </div>

            {/* TOTAL - GIANT */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: "#1f2937" }}>
                <span className="text-white/60 text-sm">TOTAL</span>
                <span className="text-white" style={{ fontWeight: 900, fontSize: "2rem", lineHeight: 1, letterSpacing: "-1px" }}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-3 flex gap-2">
              <button onClick={() => { setDescontoInputVal(descontoGeral.toFixed(2).replace(".", ",")); setShowDescontoInput(true); }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors"
                style={{ fontWeight: 500 }}>
                <Tag size={13} />Desconto
              </button>
              <button onClick={() => setShowEspera(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors"
                style={{ fontWeight: 500 }}>
                <Pause size={13} />Espera
                {esperas.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px]" style={{ fontWeight: 700 }}>{esperas.length}</span>}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors"
                style={{ fontWeight: 500 }}>
                <User size={13} />Cliente
              </button>
            </div>

            {/* FINALIZAR */}
            <div className="px-4 pb-4">
              <button
                onClick={() => { if (itens.length > 0) setShowPagamento(true); }}
                disabled={itens.length === 0}
                className="w-full py-5 rounded-2xl text-[#1f2937] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 touch-manipulation"
                style={{
                  background: itens.length > 0
                    ? "#86cb92"
                    : "#627271",
                  fontWeight: 900,
                  fontSize: "1.2rem",
                  boxShadow: itens.length > 0 ? "0 8px 24px rgba(134,203,146,0.4)" : "none",
                }}>
                <Zap size={22} />
                FINALIZAR VENDA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historico slide panel */}
      {showHistorico && (
        <div className="absolute inset-0 z-40 flex" onClick={() => setShowHistorico(false)}>
          <div className="flex-1 bg-black/30" />
          <div className="w-80 bg-white h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[#efefef] flex items-center justify-between">
              <h3 className="text-[#1f2937]" style={{ fontWeight: 700 }}>Vendas de Hoje</h3>
              <button onClick={() => setShowHistorico(false)} className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center">
                <X size={15} className="text-[#627271]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {VENDAS_DIA.map(v => (
                <div key={v.id} className="p-3 rounded-xl border border-[#efefef] bg-[#efefef]">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>Venda #{v.numero}</span>
                    <span className="text-[#627271] text-xs">{v.hora}</span>
                  </div>
                  {v.cliente && <p className="text-[#627271] text-xs mb-1">{v.cliente}</p>}
                  <p className="text-[#627271] text-xs">{v.itens.map(i => i.produto.nome).join(", ")}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: PAGAMENTO_CONFIG[v.pagamentos[0].tipo].bg, color: PAGAMENTO_CONFIG[v.pagamentos[0].tipo].cor, fontWeight: 600 }}>
                      {PAGAMENTO_CONFIG[v.pagamentos[0].tipo].emoji} {PAGAMENTO_CONFIG[v.pagamentos[0].tipo].label}
                    </span>
                    <span style={{ color: "#1f2937", fontWeight: 800 }}>{formatCurrency(v.total)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-[#efefef] bg-[#efefef]">
              <div className="flex justify-between text-sm">
                <span className="text-[#627271]">{VENDAS_DIA.length} vendas</span>
                <span style={{ color: "#1f2937", fontWeight: 700 }}>{formatCurrency(VENDAS_DIA.reduce((s, v) => s + v.total, 0))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
