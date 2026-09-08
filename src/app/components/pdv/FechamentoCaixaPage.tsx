import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Lock, Printer, CheckCircle2, AlertTriangle,
  Loader2, TrendingUp, Clock, DollarSign, CreditCard,
  Banknote, Zap, Eye, EyeOff, BarChart3, ShoppingBag,
  TrendingDown, RefreshCw,
} from "lucide-react";
import {
  VENDAS_DIA, MOVIMENTACOES_DIA, PAGAMENTO_CONFIG,
  formatCurrency, calcSaldoCaixaDinheiro,
} from "./pdvMockData";

export function FechamentoCaixaPage() {
  const navigate = useNavigate();
  const [valorContado, setValorContado] = useState("");
  const [obs, setObs] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Calculated values
  const abertura = 200;
  const totalGeral = VENDAS_DIA.reduce((s, v) => s + v.total, 0);
  const totalDinheiro = VENDAS_DIA.filter(v => v.pagamentos.some(p => p.tipo === "dinheiro"))
    .reduce((s, v) => s + v.pagamentos.filter(p => p.tipo === "dinheiro").reduce((ss, p) => ss + p.valor, 0), 0);
  const totalDebito = VENDAS_DIA.filter(v => v.pagamentos.some(p => p.tipo === "debito"))
    .reduce((s, v) => s + v.pagamentos.filter(p => p.tipo === "debito").reduce((ss, p) => ss + p.valor, 0), 0);
  const totalCredito = VENDAS_DIA.filter(v => v.pagamentos.some(p => p.tipo === "credito"))
    .reduce((s, v) => s + v.pagamentos.filter(p => p.tipo === "credito").reduce((ss, p) => ss + p.valor, 0), 0);
  const totalPix = VENDAS_DIA.filter(v => v.pagamentos.some(p => p.tipo === "pix"))
    .reduce((s, v) => s + v.pagamentos.filter(p => p.tipo === "pix").reduce((ss, p) => ss + p.valor, 0), 0);
  const totalDesconto = VENDAS_DIA.reduce((s, v) => s + v.desconto, 0);
  const ticketMedio = VENDAS_DIA.length > 0 ? totalGeral / VENDAS_DIA.length : 0;
  const totalSangrias = MOVIMENTACOES_DIA.filter(m => m.tipo === "sangria").reduce((s, m) => s + m.valor, 0);
  const totalSuprimentos = MOVIMENTACOES_DIA.filter(m => m.tipo === "suprimento").reduce((s, m) => s + m.valor, 0);
  const saldoEsperadoDinheiro = calcSaldoCaixaDinheiro();
  const valContado = parseFloat(valorContado.replace(",", ".")) || 0;
  const diferenca = valContado - saldoEsperadoDinheiro;
  const temDiferenca = Math.abs(diferenca) > 0.10;
  const diferencaGrande = Math.abs(diferenca) > 50;

  const horaAbertura = "08:05";
  const horaFechamento = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const handleFechar = async () => {
    if (diferencaGrande && !senha) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#efefef] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full overflow-hidden">
          <div className="px-6 py-8 text-center" style={{ background: "#1f2937" }}>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Lock size={30} className="text-white" />
            </div>
            <h2 className="text-white mb-1" style={{ fontWeight: 800, fontSize: "1.2rem" }}>Caixa Fechado! 🎉</h2>
            <p className="text-white/60 text-sm">{horaAbertura} – {horaFechamento}</p>
          </div>
          <div className="p-6 space-y-3">
            {[
              { label: "Total de vendas", value: formatCurrency(totalGeral), color: "#1f2937" },
              { label: "Quantidade de vendas", value: `${VENDAS_DIA.length} vendas`, color: "#1f2937" },
              { label: "Ticket médio", value: formatCurrency(ticketMedio), color: "#7C3AED" },
              { label: "Diferença", value: diferenca === 0 ? "Nenhuma ✓" : formatCurrency(Math.abs(diferenca)), color: diferenca === 0 ? "#1f2937" : "#EF4444" },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-[#627271] text-sm">{r.label}</span>
                <span className="text-sm" style={{ color: r.color, fontWeight: 700 }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 flex flex-col gap-2">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              <Printer size={15} />Imprimir Relatório
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="py-3 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 700 }}>
              Ir para Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efefef]">
      {/* Header */}
      <div className="bg-white border-b border-[#efefef] px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/vendas/pdv")}
          className="w-9 h-9 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#efefef] transition-colors">
          <ArrowLeft size={16} className="text-[#1f2937]" />
        </button>
        <div>
          <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1rem" }}>Fechamento de Caixa</h1>
          <p className="text-[#627271] text-xs">Turno: {horaAbertura} – {horaFechamento} · Operador: Maria Silva</p>
        </div>
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] text-[#1f2937] text-sm hover:bg-[#efefef] transition-colors" style={{ fontWeight: 500 }}>
          <Printer size={14} />Imprimir
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">

        {/* KPIs do dia */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Vendido", value: formatCurrency(totalGeral), icon: TrendingUp, color: "#1f2937", bg: "#efefef" },
            { label: "Qtd. de Vendas", value: `${VENDAS_DIA.length}`, icon: ShoppingBag, color: "#7C3AED", bg: "#F5F3FF" },
            { label: "Ticket Médio", value: formatCurrency(ticketMedio), icon: BarChart3, color: "#0EA5E9", bg: "#EFF6FF" },
            { label: "Descontos", value: formatCurrency(totalDesconto), icon: TrendingDown, color: "#F59E0B", bg: "#FFFBEB" },
          ].map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white rounded-2xl p-4 border border-[#efefef] shadow-sm">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: k.bg }}>
                  <Icon size={16} style={{ color: k.color }} />
                </div>
                <p className="text-[#627271] text-xs">{k.label}</p>
                <p className="text-[#1f2937] text-lg" style={{ fontWeight: 800 }}>{k.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Resumo por forma de pagamento */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 700 }}>Resumo por Forma de Pagamento</h3>
            <div className="space-y-3">
              {[
                { tipo: "dinheiro", label: "Dinheiro", valor: totalDinheiro },
                { tipo: "debito", label: "Cartão Débito", valor: totalDebito },
                { tipo: "credito", label: "Cartão Crédito", valor: totalCredito },
                { tipo: "pix", label: "PIX", valor: totalPix },
              ].map(row => {
                const cfg = PAGAMENTO_CONFIG[row.tipo as keyof typeof PAGAMENTO_CONFIG];
                const pct = totalGeral > 0 ? (row.valor / totalGeral) * 100 : 0;
                return (
                  <div key={row.tipo}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cfg.emoji}</span>
                        <span className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>{row.label}</span>
                      </div>
                      <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{formatCurrency(row.valor)}</span>
                    </div>
                    <div className="h-2 bg-[#efefef] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: cfg.cor }} />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-[#efefef] flex justify-between items-center">
                <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>TOTAL GERAL</span>
                <span className="text-lg" style={{ fontWeight: 900, color: "#1f2937" }}>{formatCurrency(totalGeral)}</span>
              </div>
            </div>
          </div>

          {/* Movimentações */}
          <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
            <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 700 }}>Movimentações do Caixa</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#627271] text-sm">Abertura (troco inicial)</span>
                <span className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>{formatCurrency(abertura)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627271] text-sm">Vendas em dinheiro</span>
                <span className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>+{formatCurrency(totalDinheiro)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627271] text-sm">Suprimentos recebidos</span>
                <span className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>+{formatCurrency(totalSuprimentos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627271] text-sm">Sangrias realizadas</span>
                <span className="text-red-600 text-sm" style={{ fontWeight: 600 }}>-{formatCurrency(totalSangrias)}</span>
              </div>
              <div className="pt-3 border-t border-[#efefef] flex justify-between">
                <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>Saldo esperado em dinheiro</span>
                <span className="text-[#1f2937] text-sm" style={{ fontWeight: 800 }}>{formatCurrency(saldoEsperadoDinheiro)}</span>
              </div>
            </div>

            {/* Histórico movimentações */}
            {MOVIMENTACOES_DIA.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#efefef]">
                <p className="text-[#627271] text-xs mb-2" style={{ fontWeight: 600 }}>MOVIMENTAÇÕES DO DIA</p>
                <div className="space-y-2">
                  {MOVIMENTACOES_DIA.map(m => (
                    <div key={m.id} className="flex items-center gap-2 text-xs">
                      <span className={m.tipo === "sangria" ? "text-red-500" : "text-[#627271]"}>
                        {m.tipo === "sangria" ? "↓" : "↑"}
                      </span>
                      <span className="text-[#1f2937] flex-1">{m.motivo}</span>
                      <span className="text-[#627271]">{m.hora}</span>
                      <span className={m.tipo === "sangria" ? "text-red-600" : "text-[#627271]"} style={{ fontWeight: 700 }}>
                        {m.tipo === "sangria" ? "-" : "+"}{formatCurrency(m.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contagem de dinheiro */}
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
          <h3 className="text-[#1f2937] text-sm mb-4" style={{ fontWeight: 700 }}>
            <Banknote size={16} className="inline mr-2 text-[#627271]" />
            Contagem Física do Dinheiro
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <div>
              <label className="text-[#1f2937] text-xs block mb-1.5" style={{ fontWeight: 600 }}>
                Valor contado em dinheiro (físico)
              </label>
              <input
                type="number" value={valorContado} onChange={e => setValorContado(e.target.value)}
                placeholder="0,00" min="0" step="0.01"
                className="w-full px-4 py-4 rounded-xl border-2 text-xl outline-none transition-colors"
                style={{ borderColor: temDiferenca ? (diferenca > 0 ? "#86cb92" : "#EF4444") : "#efefef", fontWeight: 800, color: "#1f2937", fontSize: "1.8rem" }}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#627271] text-sm">Esperado no caixa</span>
                <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{formatCurrency(saldoEsperadoDinheiro)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627271] text-sm">Contado fisicamente</span>
                <span className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{valContado > 0 ? formatCurrency(valContado) : "—"}</span>
              </div>
              {valContado > 0 && (
                <div className="flex justify-between pt-2 border-t border-[#efefef]">
                  <span className="text-sm" style={{ fontWeight: 700 }}>Diferença</span>
                  <span className="text-sm" style={{
                    fontWeight: 800,
                    color: diferenca === 0 ? "#1f2937" : diferenca > 0 ? "#1f2937" : "#EF4444",
                  }}>
                    {diferenca === 0 ? "✓ Sem diferença" : `${diferenca > 0 ? "+" : ""}${formatCurrency(diferenca)}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Diferença grande - pede senha */}
          {temDiferenca && diferencaGrande && (
            <div className="mt-4 p-4 rounded-xl border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-sm" style={{ fontWeight: 700 }}>Diferença significativa detectada</p>
                  <p className="text-red-600 text-xs">Há uma diferença de {formatCurrency(Math.abs(diferenca))} entre o esperado e o contado. Autorização de gerente necessária.</p>
                </div>
              </div>
              <label className="text-red-700 text-xs block mb-1.5" style={{ fontWeight: 600 }}>Senha do Gerente</label>
              <div className="relative">
                <input type={showSenha ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="Digite a senha do gerente..."
                  className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-[#1f2937] text-sm outline-none focus:border-red-400 pr-10" />
                <button onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627271]">
                  {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* Obs fechamento */}
          <div className="mt-4">
            <label className="text-[#1f2937] text-xs block mb-1.5" style={{ fontWeight: 500 }}>Observações de fechamento</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
              placeholder="Anotações sobre o fechamento do caixa..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] resize-none" />
          </div>
        </div>

        {/* Confirm button */}
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
          <div className="flex gap-3">
            <button onClick={() => navigate("/vendas/pdv")}
              className="px-5 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              Voltar ao PDV
            </button>
            <button onClick={handleFechar}
              disabled={loading || !valorContado || (diferencaGrande && !senha)}
              className="flex-1 py-4 rounded-2xl text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-[0.98]"
              style={{ background: "#1f2937", fontWeight: 800, fontSize: "1rem" }}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Fechando...</> : <><Lock size={18} /> Confirmar Fechamento</>}
            </button>
          </div>
          {!valorContado && (
            <p className="text-center text-[#627271] text-xs mt-2">Informe o valor contado em dinheiro para continuar</p>
          )}
        </div>
      </div>
    </div>
  );
}
