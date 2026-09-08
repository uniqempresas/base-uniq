import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ArrowLeft, ShoppingCart, Check, ChevronRight, Loader2,
  MapPin, CreditCard, Zap, Shield, Truck, Tag, X,
  AlertCircle, CheckCircle2, Package, MessageCircle,
  Printer, Copy, Banknote,
} from "lucide-react";
import {
  PRODUTOS_LOJA, FRETE_OPCOES, CUPONS_VALIDOS, PAGAMENTO_LOJA_CONFIG,
  formatCurrencyLoja, type ItemCarrinhoLoja, type PagamentoTipoLoja,
} from "./lojaMockData";

/* ─── Default cart if no state ─── */
const DEFAULT_CART: ItemCarrinhoLoja[] = [
  { id: "d1", produto: PRODUTOS_LOJA[0], quantidade: 2 },
  { id: "d2", produto: PRODUTOS_LOJA[2], quantidade: 1 },
];

const STEPS = ["Carrinho", "Dados", "Entrega", "Pagamento"];
const PARCELAS = [1,2,3,4,6,10,12];

function InputField({ label, value, onChange, placeholder, type = "text", error, mask }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string; mask?: string;
}) {
  return (
    <div>
      <label className="block text-foreground text-xs mb-1.5" style={{ fontWeight: 600 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border text-foreground text-sm outline-none transition-colors"
        style={{ borderColor: error ? "#EF4444" : "#efefef", background: "white", fontSize: "16px" }} />
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const carrinho: ItemCarrinhoLoja[] = (location.state as any)?.carrinho || DEFAULT_CART;
  const [itens, setItens] = useState(carrinho);

  const [step, setStep] = useState(0); // 0=cart, 1=dados, 2=entrega, 3=pagamento

  // Cart
  const updateQty = (id: string, d: number) => {
    setItens(prev => prev.map(i => i.id === id ? { ...i, quantidade: Math.max(1, i.quantidade + d) } : i));
  };
  const removeItem = (id: string) => setItens(prev => prev.filter(i => i.id !== id));

  // Dados pessoais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  // Endereço
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepOk, setCepOk] = useState(false);

  // Frete
  const [freteSel, setFreteSel] = useState<string | null>(null);
  const [freteCalcOk, setFreteCalcOk] = useState(false);
  const [loadingFrete, setLoadingFrete] = useState(false);

  // Cupom
  const [cupom, setCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<{ desconto: number; tipo: string } | null>(null);
  const [cupomError, setCupomError] = useState("");

  // Pagamento
  const [pagTipo, setPagTipo] = useState<PagamentoTipoLoja>("pix");
  const [cardNum, setCardNum] = useState("");
  const [cardNome, setCardNome] = useState("");
  const [cardVal, setCardVal] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [parcelas, setParcelas] = useState(1);

  // Submit
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [pedidoNum] = useState(`UNIQ-2024-${String(Math.floor(Math.random() * 900) + 100)}`);

  // Values
  const subtotal = itens.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);
  const freteValor = freteSel ? (FRETE_OPCOES.find(f => f.id === freteSel)?.valor || 0) : 0;
  const desconto = cupomAplicado
    ? cupomAplicado.tipo === "percentual"
      ? subtotal * (cupomAplicado.desconto / 100)
      : cupomAplicado.desconto
    : 0;
  const total = Math.max(0, subtotal + freteValor - desconto);

  const simulateCep = async () => {
    if (cep.replace(/\D/g, "").length < 8) return;
    setLoadingCep(true);
    await new Promise(r => setTimeout(r, 800));
    setLogradouro("Av. Paulista");
    setBairro("Bela Vista");
    setCidade("São Paulo");
    setEstado("SP");
    setCepOk(true);
    setLoadingCep(false);
  };

  const calcFrete = async () => {
    if (!cepOk) return;
    setLoadingFrete(true);
    await new Promise(r => setTimeout(r, 1000));
    setFreteCalcOk(true);
    setFreteSel("pac");
    setLoadingFrete(false);
  };

  const applyCupom = () => {
    const code = cupom.toUpperCase().trim();
    if (CUPONS_VALIDOS[code]) {
      setCupomAplicado(CUPONS_VALIDOS[code]);
      setCupomError("");
    } else {
      setCupomError("Cupom inválido ou expirado");
      setCupomAplicado(null);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setDone(true);
  };

  const canNext = () => {
    if (step === 0) return itens.length > 0;
    if (step === 1) return nome.length >= 3 && email.includes("@") && telefone.length >= 10 && cpf.length >= 11;
    if (step === 2) return cepOk && numero && freteSel;
    return true;
  };

  /* ── SUCCESS ── */
  if (done) {
    const prazoFrete = FRETE_OPCOES.find(f => f.id === freteSel);
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
<div className="px-6 py-8 text-center" style={{ background: "#86cb92" }}>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-primary-foreground" />
            </div>
            <p className="text-primary-foreground/70 text-sm mb-1">Pedido confirmado! 🎉</p>
            <p className="text-primary-foreground text-2xl" style={{ fontWeight: 900 }}>{pedidoNum}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              {itens.map(i => (
                <div key={i.id} className="flex items-center gap-3">
                  <img src={i.produto.imagem} alt={i.produto.nome} className="w-10 h-10 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs truncate" style={{ fontWeight: 600 }}>{i.produto.nome}</p>
                    <p className="text-muted-foreground text-[10px]">x{i.quantidade}</p>
                  </div>
                  <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>{formatCurrencyLoja(i.produto.preco * i.quantidade)}</p>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-border space-y-1">
              {[
                { l: "Subtotal", v: formatCurrencyLoja(subtotal) },
                { l: "Frete", v: formatCurrencyLoja(freteValor) },
                ...(desconto > 0 ? [{ l: "Desconto", v: `-${formatCurrencyLoja(desconto)}` }] : []),
              ].map(r => (
                <div key={r.l} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{r.l}</span>
                  <span className="text-foreground">{r.v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-foreground" style={{ fontWeight: 700 }}>Total</span>
                <span className="text-foreground text-lg" style={{ fontWeight: 900 }}>{formatCurrencyLoja(total)}</span>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-sm space-y-1">
              <p className="text-muted-foreground"><span className="text-foreground" style={{ fontWeight: 600 }}>Entrega:</span> {logradouro}, {numero} — {cidade}/{estado}</p>
              <p className="text-muted-foreground"><span className="text-foreground" style={{ fontWeight: 600 }}>Prazo:</span> {prazoFrete?.prazo || "3 a 8 dias úteis"}</p>
              <p className="text-muted-foreground"><span className="text-foreground" style={{ fontWeight: 600 }}>Pagamento:</span> {PAGAMENTO_LOJA_CONFIG[pagTipo].emoji} {PAGAMENTO_LOJA_CONFIG[pagTipo].label}</p>
            </div>

            {/* PIX info */}
            {pagTipo === "pix" && (
              <div className="bg-muted rounded-xl p-4 border border-border">
                <p className="text-teal-800 text-sm mb-2" style={{ fontWeight: 700 }}>⚡ Pague via PIX</p>
                <div className="w-24 h-24 mx-auto bg-white rounded-xl border-2 border-border flex items-center justify-center mb-2 p-2">
                  <div className="w-full h-full grid grid-cols-5 gap-0.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className="rounded-sm" style={{ background: Math.random() > 0.5 ? "#0F766E" : "transparent" }} />
                    ))}
                  </div>
                </div>
                <p className="text-teal-700 text-xs text-center">QR Code válido por 30 minutos</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-border text-foreground text-sm" style={{ fontWeight: 500 }}>
                <Printer size={14} />Comprovante
              </button>
              <button className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-muted border border-border text-foreground text-sm" style={{ fontWeight: 600 }}>
                <MessageCircle size={14} />WhatsApp
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate("/loja/pedidos")}
                className="py-3 rounded-xl border border-border text-foreground text-sm" style={{ fontWeight: 500 }}>
                Meus pedidos
              </button>
              <button onClick={() => navigate("/loja")}
                className="py-3 rounded-xl text-sm bg-primary text-primary-foreground hover:bg-foreground hover:text-white" style={{ fontWeight: 700 }}>
                Continuar comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/loja")}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1">
            <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Checkout</p>
            <p className="text-muted-foreground text-xs">Passo {step + 1} de {STEPS.length}</p>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Shield size={14} className="text-foreground" />
            <span className="text-xs text-foreground" style={{ fontWeight: 500 }}>Compra Segura</span>
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all"
                    style={{
                      background: i < step ? "#86cb92" : i === step ? "#efefef" : "#efefef",
                      color: i < step ? "#1f2937" : i === step ? "#1f2937" : "#627271",
                      border: i === step ? "2px solid #86cb92" : "2px solid transparent",
                      fontWeight: 700,
                    }}>
                    {i < step ? <Check size={13} /> : i + 1}
                  </div>
                  <span className="text-[10px] mt-0.5 hidden sm:block"
                    style={{ color: i === step ? "#1f2937" : i < step ? "#627271" : "#627271", fontWeight: i === step ? 600 : 400 }}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-0.5 flex-1 mx-1 rounded-full transition-all"
                    style={{ background: i < step ? "#86cb92" : "#efefef" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-5">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">

            {/* STEP 0: CARRINHO */}
            {step === 0 && (
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                  <ShoppingCart size={16} className="text-foreground" />
                  <h2 className="text-foreground text-sm" style={{ fontWeight: 700 }}>Seu Carrinho ({itens.length} item{itens.length !== 1 ? "s" : ""})</h2>
                </div>
                {itens.length === 0 ? (
                  <div className="p-12 text-center">
                    <ShoppingCart size={40} className="text-muted mx-auto mb-3" />
                    <p className="text-foreground mb-1" style={{ fontWeight: 600 }}>Carrinho vazio</p>
                    <button onClick={() => navigate("/loja")} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-foreground hover:text-white text-sm mt-4"
                      style={{ fontWeight: 600 }}>
                      Ir para a loja
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {itens.map(item => (
                      <div key={item.id} className="flex gap-4 p-4">
                        <img src={item.produto.imagem} alt={item.produto.nome}
                          className="w-20 h-20 rounded-xl object-cover bg-muted shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm leading-tight mb-0.5" style={{ fontWeight: 600 }}>{item.produto.nome}</p>
                          {item.variacao && <p className="text-muted-foreground text-xs mb-1">{item.variacao}</p>}
                          <p className="text-foreground text-base" style={{ fontWeight: 800 }}>{formatCurrencyLoja(item.produto.preco)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQty(item.id, -1)}
                              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-foreground text-sm" style={{ fontWeight: 700 }}>-</button>
                            <span className="text-foreground text-sm" style={{ fontWeight: 700 }}>{item.quantidade}</span>
                            <button onClick={() => updateQty(item.id, 1)}
                              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-foreground text-sm" style={{ fontWeight: 700 }}>+</button>
                            <button onClick={() => removeItem(item.id)} className="ml-2 text-red-400 hover:text-red-600 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-foreground text-sm shrink-0" style={{ fontWeight: 700 }}>
                          {formatCurrencyLoja(item.produto.preco * item.quantidade)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cupom */}
                {itens.length > 0 && (
                  <div className="px-5 py-4 border-t border-border bg-muted">
                    <p className="text-foreground text-xs mb-2" style={{ fontWeight: 600 }}>Cupom de desconto</p>
                    <div className="flex gap-2">
                      <input value={cupom} onChange={e => setCupom(e.target.value.toUpperCase())}
                        placeholder="CÓDIGO DO CUPOM"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-border text-foreground text-sm outline-none focus:border-primary uppercase bg-white"
                        style={{ letterSpacing: "1px" }} />
                      <button onClick={applyCupom}
                        className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-foreground hover:text-white text-sm" style={{ fontWeight: 600 }}>
                        Aplicar
                      </button>
                    </div>
                    {cupomAplicado && (
                      <p className="text-foreground text-xs mt-1.5 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Cupom aplicado! Desconto de {cupomAplicado.tipo === "percentual" ? `${cupomAplicado.desconto}%` : formatCurrencyLoja(cupomAplicado.desconto)}
                      </p>
                    )}
                    {cupomError && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{cupomError}</p>}
                    <p className="text-muted-foreground text-[10px] mt-1">Experimente: UNIQ10 ou BEMVINDO</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: DADOS PESSOAIS */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2 className="text-foreground mb-4" style={{ fontWeight: 700 }}>Seus Dados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <InputField label="Nome completo *" value={nome} onChange={setNome} placeholder="Maria da Silva" />
                  </div>
                  <InputField label="E-mail *" value={email} onChange={setEmail} type="email" placeholder="maria@email.com" />
                  <InputField label="Telefone / WhatsApp *" value={telefone} onChange={setTelefone} placeholder="(11) 98765-4321" />
                  <div className="sm:col-span-2">
                    <InputField label="CPF *" value={cpf} onChange={setCpf} placeholder="000.000.000-00" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-muted border border-border">
                  <Shield size={14} className="text-foreground shrink-0" />
                  <p className="text-muted-foreground text-xs">Seus dados são protegidos e não serão compartilhados com terceiros.</p>
                </div>
              </div>
            )}

            {/* STEP 2: ENTREGA */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2 className="text-foreground mb-4" style={{ fontWeight: 700 }}>Endereço de Entrega</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CEP */}
                  <div className="sm:col-span-2">
                    <label className="block text-foreground text-xs mb-1.5" style={{ fontWeight: 600 }}>CEP *</label>
                    <div className="flex gap-2">
                      <input value={cep} onChange={e => setCep(e.target.value)} placeholder="00000-000"
                        className="flex-1 px-4 py-3 rounded-xl border border-border text-foreground text-sm outline-none focus:border-primary"
                        style={{ fontSize: "16px" }} />
                      <button onClick={simulateCep} disabled={loadingCep}
                        className="px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-foreground hover:text-white text-sm disabled:opacity-50 flex items-center gap-1.5"
                        style={{ fontWeight: 600, minWidth: "90px" }}>
                        {loadingCep ? <Loader2 size={14} className="animate-spin" /> : <><MapPin size={13} />Buscar</>}
                      </button>
                    </div>
                    {cepOk && <p className="text-foreground text-xs mt-1 flex items-center gap-1"><CheckCircle2 size={12} />Endereço encontrado!</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <InputField label="Logradouro *" value={logradouro} onChange={setLogradouro} placeholder="Rua, Avenida..." />
                  </div>
                  <InputField label="Número *" value={numero} onChange={setNumero} placeholder="123" />
                  <InputField label="Complemento" value={complemento} onChange={setComplemento} placeholder="Apto, Bloco..." />
                  <InputField label="Bairro *" value={bairro} onChange={setBairro} placeholder="Bairro" />
                  <InputField label="Cidade *" value={cidade} onChange={setCidade} placeholder="Cidade" />
                  <InputField label="Estado *" value={estado} onChange={setEstado} placeholder="SP" />
                </div>

                {/* Calcular frete */}
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-foreground text-sm" style={{ fontWeight: 700 }}>Opções de Entrega</h3>
                    <button onClick={calcFrete} disabled={!cepOk || loadingFrete}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs disabled:opacity-40 transition-all"
                      style={{ background: "#efefef", color: "#1f2937", border: "1px solid #86cb92", fontWeight: 600 }}>
                      {loadingFrete ? <Loader2 size={12} className="animate-spin" /> : <Truck size={13} />}
                      {loadingFrete ? "Calculando..." : "Calcular Frete"}
                    </button>
                  </div>
                  {freteCalcOk ? (
                    <div className="space-y-2">
                      {FRETE_OPCOES.map(f => (
                        <button key={f.id} onClick={() => setFreteSel(f.id)}
                          className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left"
                          style={{ borderColor: freteSel === f.id ? "#86cb92" : "#efefef", background: freteSel === f.id ? "#efefef" : "white" }}>
                          <Truck size={18} style={{ color: freteSel === f.id ? "#1f2937" : "#627271" }} className="shrink-0" />
                          <div className="flex-1">
                            <p className="text-foreground text-sm" style={{ fontWeight: freteSel === f.id ? 700 : 500 }}>{f.nome}</p>
                            <p className="text-muted-foreground text-xs">{f.prazo}</p>
                          </div>
                          <p className="text-foreground text-sm shrink-0" style={{ fontWeight: 700, color: freteSel === f.id ? "#1f2937" : "#1f2937" }}>
                            {f.valor === 0 ? "Grátis" : formatCurrencyLoja(f.valor)}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                      <Truck size={24} className="mx-auto mb-2 text-muted" />
                      Informe o CEP e clique em Calcular Frete
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: PAGAMENTO */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2 className="text-foreground mb-4" style={{ fontWeight: 700 }}>Forma de Pagamento</h2>

                {/* Payment type selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {(["pix","credito","debito","boleto"] as PagamentoTipoLoja[]).map(t => {
                    const cfg = PAGAMENTO_LOJA_CONFIG[t];
                    const isActive = pagTipo === t;
                    return (
                      <button key={t} onClick={() => setPagTipo(t)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all"
                        style={{ borderColor: isActive ? "#86cb92" : "#efefef", background: isActive ? "#efefef" : "white" }}>
                        <span className="text-2xl">{cfg.emoji}</span>
                        <span className="text-xs text-center leading-tight"
                          style={{ color: isActive ? "#1f2937" : "#627271", fontWeight: isActive ? 700 : 400 }}>
                          {t === "credito" ? "Crédito" : t === "debito" ? "Débito" : cfg.label}
                        </span>
                        {isActive && <Check size={12} className="text-foreground" />}
                      </button>
                    );
                  })}
                </div>

                {/* PIX */}
                {pagTipo === "pix" && (
                  <div className="p-5 rounded-2xl text-center" style={{ background: "#efefef", border: "1px solid #86cb92" }}>
                    <p className="text-teal-800 text-sm mb-3" style={{ fontWeight: 700 }}>⚡ Pague com PIX e ganhe 10% de desconto!</p>
                    <div className="w-32 h-32 mx-auto bg-white rounded-2xl border-2 border-border flex items-center justify-center mb-3 p-3">
                      <div className="w-full h-full grid grid-cols-6 gap-0.5">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div key={i} className="rounded-sm" style={{ background: Math.random() > 0.45 ? "#0F766E" : "transparent" }} />
                        ))}
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 mx-auto text-teal-700 text-sm" style={{ fontWeight: 600 }}>
                      <Copy size={13} />Copiar código PIX
                    </button>
                    <p className="text-teal-600 text-xs mt-2">QR Code válido por 30 minutos após confirmação</p>
                  </div>
                )}

                {/* Cartão */}
                {(pagTipo === "credito" || pagTipo === "debito") && (
                  <div className="space-y-4">
                    <div className="relative p-5 rounded-2xl" style={{ background: "#1f2937", minHeight: "130px" }}>
                      <div className="absolute top-4 right-4 opacity-30">
                        <CreditCard size={40} className="text-white" />
                      </div>
                      <p className="text-white/40 text-xs mb-2">Número do Cartão</p>
                      <p className="text-white text-lg" style={{ fontWeight: 700, letterSpacing: "2px" }}>
                        {cardNum.replace(/(.{4})/g, "$1 ").trim() || "0000 0000 0000 0000"}
                      </p>
                      <div className="flex justify-between mt-4">
                        <div>
                          <p className="text-white/40 text-[10px]">NOME</p>
                          <p className="text-white text-xs" style={{ fontWeight: 600 }}>{cardNome || "SEU NOME"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/40 text-[10px]">VALIDADE</p>
                          <p className="text-white text-xs" style={{ fontWeight: 600 }}>{cardVal || "MM/AA"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <InputField label="Número do Cartão" value={cardNum} onChange={setCardNum} placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="sm:col-span-2">
                        <InputField label="Nome no Cartão" value={cardNome} onChange={setCardNome} placeholder="Como está no cartão" />
                      </div>
                      <InputField label="Validade" value={cardVal} onChange={setCardVal} placeholder="MM/AA" />
                      <InputField label="CVV" value={cardCvv} onChange={setCardCvv} placeholder="000" />
                    </div>

                    {pagTipo === "credito" && (
                      <div>
                        <label className="block text-foreground text-xs mb-2" style={{ fontWeight: 600 }}>Parcelamento</label>
                        <div className="flex flex-wrap gap-2">
                          {PARCELAS.map(p => (
                            <button key={p} onClick={() => setParcelas(p)}
                              className="px-3 py-2 rounded-xl border text-xs transition-all"
                              style={{ background: parcelas === p ? "#efefef" : "white", borderColor: parcelas === p ? "#86cb92" : "#efefef", color: parcelas === p ? "#1f2937" : "#627271", fontWeight: parcelas === p ? 700 : 400 }}>
                              {p === 1 ? "À vista" : `${p}x ${formatCurrencyLoja(total / p)}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Boleto */}
                {pagTipo === "boleto" && (
                  <div className="p-5 rounded-2xl text-center" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                    <Banknote size={32} className="text-amber-600 mx-auto mb-3" />
                    <p className="text-amber-800 text-sm mb-2" style={{ fontWeight: 700 }}>Boleto Bancário</p>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      O boleto será gerado após a confirmação do pedido. Prazo de compensação: até 3 dias úteis.
                      Vencimento: 3 dias após emissão.
                    </p>
                  </div>
                )}

                {/* Security badge */}
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-muted border border-border">
                  <Shield size={14} className="text-foreground shrink-0" />
                  <p className="text-muted-foreground text-xs">Pagamento criptografado com SSL 256 bits. Seus dados estão seguros.</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="px-5 py-3.5 rounded-xl border border-border text-foreground text-sm" style={{ fontWeight: 500 }}>
                  Voltar
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={() => { if (canNext()) setStep(s => s + 1); }}
                  disabled={!canNext() || itens.length === 0}
                  className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground hover:bg-foreground hover:text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                  style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {STEPS[step + 1]} <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleFinish} disabled={loading}
                  className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground hover:bg-foreground hover:text-white flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
                  style={{ fontWeight: 800, fontSize: "1rem" }}>
                  {loading ? <><Loader2 size={18} className="animate-spin" />Processando...</> : <><Zap size={18} />Confirmar Pedido</>}
                </button>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="mt-5 lg:mt-0">
            <div className="bg-white rounded-2xl border border-border p-5 sticky top-24">
              <h3 className="text-foreground text-sm mb-4" style={{ fontWeight: 700 }}>Resumo do Pedido</h3>
              <div className="space-y-3 mb-4">
                {itens.map(i => (
                  <div key={i.id} className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <img src={i.produto.imagem} alt={i.produto.nome} className="w-12 h-12 rounded-xl object-cover" />
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-foreground text-white text-[9px] flex items-center justify-center" style={{ fontWeight: 700, width: "18px", height: "18px" }}>
                        {i.quantidade}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-xs line-clamp-2" style={{ fontWeight: 500 }}>{i.produto.nome}</p>
                    </div>
                    <p className="text-foreground text-sm shrink-0" style={{ fontWeight: 700 }}>
                      {formatCurrencyLoja(i.produto.preco * i.quantidade)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground" style={{ fontWeight: 500 }}>{formatCurrencyLoja(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-muted-foreground">{freteSel ? formatCurrencyLoja(freteValor) : "A calcular"}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Desconto</span>
                    <span className="text-foreground" style={{ fontWeight: 600 }}>-{formatCurrencyLoja(desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-foreground" style={{ fontWeight: 700 }}>Total</span>
                  <span className="text-foreground text-lg" style={{ fontWeight: 900 }}>{formatCurrencyLoja(total)}</span>
                </div>
                {pagTipo === "credito" && parcelas > 1 && (
                  <p className="text-muted-foreground text-[11px] text-right">{parcelas}x de {formatCurrencyLoja(total / parcelas)} sem juros</p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {[{ icon: Shield, label: "Seguro" }, { icon: Truck, label: "Entrega" }, { icon: RotateCcw, label: "7 dias" }].map(b => {
                  const Icon = b.icon;
                  return (
                    <div key={b.label} className="flex flex-col items-center text-center p-2 rounded-xl bg-muted">
                      <Icon size={14} className="text-muted-foreground mb-0.5" />
                      <span className="text-muted-foreground text-[9px]" style={{ fontWeight: 500 }}>{b.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing import
function RotateCcw({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <polyline points="1 4 1 10 7 10"></polyline>
      <path d="M3.51 15a9 9 0 1 0 .49-4.95"></path>
    </svg>
  );
}
