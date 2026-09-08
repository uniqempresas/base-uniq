import { useState } from "react";
import {
  MessageCircle,
  Mail,
  Bell,
  Clock,
  Calendar,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Smile,
  Eye,
  Save,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Wifi,
} from "lucide-react";
import type { TomVoz } from "./melMockData";
import { previewsMensagem } from "./melMockData";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${value ? "" : "bg-muted"}`}
      style={{ background: value ? "#86cb92" : undefined }}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
      <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
        <Icon size={18} className="text-violet-600" />
      </div>
      <div>
        <h3 className="text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Alert Toggle Row ─────────────────────────────────────────────────────────

function AlertRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <Toggle value={checked} onChange={onChange} />
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-primary-foreground text-sm"
      style={{ background: "#86cb92" }}
    >
      <CheckCircle size={16} />
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

// ─── Configs State ────────────────────────────────────────────────────────────

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function MelConfiguracoesPage() {
  // Canais
  const [whatsappAtivo, setWhatsappAtivo] = useState(true);
  const [emailAtivo, setEmailAtivo] = useState(false);
  const [pushAtivo, setPushAtivo] = useState(true);
  const [emailFreq, setEmailFreq] = useState("diario");

  // Horários
  const [horarioInicio, setHorarioInicio] = useState("08:00");
  const [horarioFim, setHorarioFim] = useState("20:00");
  const [naoIncomodarApos, setNaoIncomodarApos] = useState("22h");
  const [diasSelecionados, setDiasSelecionados] = useState([0, 1, 2, 3, 4]);
  const [finsDeSemana, setFinsDeSemana] = useState(false);

  // Alertas
  const [alertas, setAlertas] = useState({
    vendasNovas: true, metaVendas: true, comparativoDiario: true, pedidosPendentes: false,
    estoqueBaixo: true, semSaida: false, emFalta: true, curvaABC: false,
    clienteInativo: true, aniversarioCliente: true, clienteVIP: true, novoCliente: false,
    contaPagarVencer: true, contaReceberVencida: true, projecaoCaixaNeg: true, metaFinanceira: false,
    compromisso30min: true, followUpPendente: true, aniversarioNegociacao: false,
  });

  const toggleAlerta = (key: keyof typeof alertas) => {
    setAlertas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Tom de voz
  const [tomVoz, setTomVoz] = useState<TomVoz>("parceiro");
  const [emojisAtivos, setEmojisAtivos] = useState(true);
  const [nivelDetalhe, setNivelDetalhe] = useState("detalhado");

  // Permissões MEL
  const [permissoes, setPermissoes] = useState({
    vendas: true, estoque: true, financeiro: true, clientes: true, agenda: true,
  });

  const togglePermissao = (key: keyof typeof permissoes) => {
    setPermissoes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // UI state
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSalvar = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Pronto! Seu MEL está configurado do seu jeito 🎉");
    }, 1500);
  };

  const handleTestar = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      showToast("Mensagem de teste enviada! Verifique seu WhatsApp 📱");
    }, 1800);
  };

  const toggleDia = (idx: number) => {
    setDiasSelecionados((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  };

  const previewMsg = previewsMensagem[tomVoz]["vendas"];
  const previewFinal = emojisAtivos ? previewMsg : previewMsg.replace(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu, "").trim();

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-foreground mb-1">Configurações do MEL</h1>
          <p className="text-sm text-foreground">Personalize como e quando seu consultor virtual vai falar com você</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleTestar}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-border hover:bg-muted text-foreground transition-all disabled:opacity-50"
          >
            {testing ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
            {testing ? "Enviando..." : "Enviar teste"}
          </button>
          <button
            onClick={handleSalvar}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-primary text-primary-foreground hover:bg-foreground hover:text-white transition-all disabled:opacity-70"
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* ── Canais de Notificação ── */}
          <div className="bg-white rounded-xl border border-border p-5">
            <SectionHeader icon={MessageCircle} title="Canais de Notificação" subtitle="Por onde o MEL vai falar com você" />

            {/* WhatsApp */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                    <MessageCircle size={16} className="text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground" style={{ fontWeight: 600 }}>WhatsApp <span className="text-xs text-violet-600 ml-1">Principal</span></p>
                    <p className="text-xs text-muted-foreground">(11) 9****-8742 · Conectado</p>
                  </div>
                </div>
                <Toggle value={whatsappAtivo} onChange={setWhatsappAtivo} />
              </div>
              {whatsappAtivo && (
                <div className="ml-10 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-foreground">
                    <Wifi size={12} />
                    Conectado
                  </div>
                  <button className="text-xs text-muted-foreground hover:text-foreground underline">Trocar número</button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="mb-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Mail size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground" style={{ fontWeight: 600 }}>Email</p>
                    <p className="text-xs text-muted-foreground">maria@lojadamaria.com</p>
                  </div>
                </div>
                <Toggle value={emailAtivo} onChange={setEmailAtivo} />
              </div>
              {emailAtivo && (
                <div className="ml-10 mt-2">
                  <label className="text-xs text-foreground block mb-1">Frequência</label>
                  <div className="relative">
                    <select
                      value={emailFreq}
                      onChange={(e) => setEmailFreq(e.target.value)}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 pr-8 appearance-none bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                      <option value="imediato">Imediato</option>
                      <option value="diario">Resumo diário</option>
                      <option value="semanal">Resumo semanal</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Push */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Bell size={16} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground" style={{ fontWeight: 600 }}>Notificações Push</p>
                    <p className="text-xs text-muted-foreground">Alertas no navegador ou app</p>
                  </div>
                </div>
                <Toggle value={pushAtivo} onChange={setPushAtivo} />
              </div>
            </div>
          </div>

          {/* ── Horários de Envio ── */}
          <div className="bg-white rounded-xl border border-border p-5">
            <SectionHeader icon={Clock} title="Horários de Envio" subtitle="Quando o MEL pode te contatar" />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-foreground block mb-1">Início das atividades</label>
                <input
                  type="time"
                  value={horarioInicio}
                  onChange={(e) => setHorarioInicio(e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div>
                <label className="text-xs text-foreground block mb-1">Fim das atividades</label>
                <input
                  type="time"
                  value={horarioFim}
                  onChange={(e) => setHorarioFim(e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-foreground block mb-2">Não incomodar após</label>
              <div className="relative">
                <select
                  value={naoIncomodarApos}
                  onChange={(e) => setNaoIncomodarApos(e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 pr-8 appearance-none bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="20h">20h</option>
                  <option value="21h">21h</option>
                  <option value="22h">22h</option>
                  <option value="23h">23h</option>
                  <option value="nunca">Nunca (sempre enviar)</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">O MEL não enviará mensagens fora deste horário</p>
            </div>

            <div className="mb-4">
              <label className="text-xs text-foreground block mb-2">Dias da semana</label>
              <div className="flex gap-2 flex-wrap">
                {DIAS_SEMANA.map((dia, i) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDia(i)}
                    className={`w-10 h-10 rounded-xl text-xs transition-all ${diasSelecionados.includes(i) ? "text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted"}`}
                    style={diasSelecionados.includes(i) ? { background: "#86cb92" } : {}}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <p className="text-sm text-foreground">Fins de semana</p>
                <p className="text-xs text-muted-foreground">Receber insights aos sábados e domingos</p>
              </div>
              <Toggle value={finsDeSemana} onChange={setFinsDeSemana} />
            </div>
          </div>

          {/* ── Tipos de Alertas ── */}
          <div className="bg-white rounded-xl border border-border p-5">
            <SectionHeader icon={Bell} title="Tipos de Alertas" subtitle="Escolha quais notificações receber" />

            <div className="space-y-5">
              {/* Vendas */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart size={14} className="text-violet-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Vendas</p>
                </div>
                <AlertRow label="Novas vendas realizadas" checked={alertas.vendasNovas} onChange={() => toggleAlerta("vendasNovas")} />
                <AlertRow label="Meta de vendas atingida" checked={alertas.metaVendas} onChange={() => toggleAlerta("metaVendas")} />
                <AlertRow label="Comparativo diário/semanal" checked={alertas.comparativoDiario} onChange={() => toggleAlerta("comparativoDiario")} />
                <AlertRow label="Pedidos pendentes de aprovação" checked={alertas.pedidosPendentes} onChange={() => toggleAlerta("pedidosPendentes")} />
              </div>

              {/* Estoque */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={14} className="text-amber-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Estoque</p>
                </div>
                <AlertRow label="Produto com estoque baixo" checked={alertas.estoqueBaixo} onChange={() => toggleAlerta("estoqueBaixo")} />
                <AlertRow label="Produto sem saída há 30 dias" checked={alertas.semSaida} onChange={() => toggleAlerta("semSaida")} />
                <AlertRow label="Produto em falta (zerado)" checked={alertas.emFalta} onChange={() => toggleAlerta("emFalta")} />
                <AlertRow label="Relatório Curva ABC" checked={alertas.curvaABC} onChange={() => toggleAlerta("curvaABC")} />
              </div>

              {/* Clientes */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} className="text-blue-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Clientes</p>
                </div>
                <AlertRow label="Cliente sem comprar há 30 dias" checked={alertas.clienteInativo} onChange={() => toggleAlerta("clienteInativo")} />
                <AlertRow label="Aniversário de cliente" checked={alertas.aniversarioCliente} onChange={() => toggleAlerta("aniversarioCliente")} />
                <AlertRow label="Cliente VIP realizou compra" checked={alertas.clienteVIP} onChange={() => toggleAlerta("clienteVIP")} />
                <AlertRow label="Novo cliente cadastrado" checked={alertas.novoCliente} onChange={() => toggleAlerta("novoCliente")} />
              </div>

              {/* Financeiro */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={14} className="text-foreground" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Financeiro</p>
                </div>
                <AlertRow label="Conta a pagar próxima do vencimento" checked={alertas.contaPagarVencer} onChange={() => toggleAlerta("contaPagarVencer")} />
                <AlertRow label="Conta a receber vencida" checked={alertas.contaReceberVencida} onChange={() => toggleAlerta("contaReceberVencida")} />
                <AlertRow label="Projeção de caixa negativa" checked={alertas.projecaoCaixaNeg} onChange={() => toggleAlerta("projecaoCaixaNeg")} />
                <AlertRow label="Meta financeira atingida" checked={alertas.metaFinanceira} onChange={() => toggleAlerta("metaFinanceira")} />
              </div>

              {/* Agenda */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-red-500" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Agenda</p>
                </div>
                <AlertRow label="Compromisso em 30 minutos" checked={alertas.compromisso30min} onChange={() => toggleAlerta("compromisso30min")} />
                <AlertRow label="Follow-up pendente" checked={alertas.followUpPendente} onChange={() => toggleAlerta("followUpPendente")} />
                <AlertRow label="Aniversário de negociação" checked={alertas.aniversarioNegociacao} onChange={() => toggleAlerta("aniversarioNegociacao")} />
              </div>
            </div>
          </div>

          {/* ── Dados que MEL acessa ── */}
          <div className="bg-white rounded-xl border border-border p-5">
            <SectionHeader icon={Eye} title="Dados que o MEL Pode Acessar" subtitle="Controle o que seu consultor analisa" />
            <div className="bg-violet-50 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle size={15} className="text-violet-600 shrink-0 mt-0.5" />
              <p className="text-xs text-violet-700">O MEL precisa acessar estes dados para gerar insights personalizados sobre seu negócio.</p>
            </div>
            {Object.entries(permissoes).map(([key, val]) => {
              const labels: Record<string, string> = {
                vendas: "Dados de Vendas", estoque: "Dados de Estoque",
                financeiro: "Dados Financeiros", clientes: "Dados de Clientes", agenda: "Agenda",
              };
              return (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{labels[key]}</span>
                  <Toggle value={val} onChange={() => togglePermissao(key as keyof typeof permissoes)} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right column ─────────────────── */}
        <div className="space-y-5">

          {/* Tom de Voz */}
          <div className="bg-white rounded-xl border border-border p-5">
            <SectionHeader icon={Smile} title="Tom de Voz do MEL" />

            <div className="space-y-2 mb-4">
              {([
                { val: "descontraido", emoji: "😄", label: "Descontraído", desc: "Informal e animado" },
                { val: "profissional", emoji: "👔", label: "Profissional", desc: "Formal e objetivo" },
                { val: "parceiro", emoji: "🤝", label: "Parceiro", desc: "Amigável e motivador" },
              ] as const).map((opt) => (
                <label key={opt.val} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${tomVoz === opt.val ? "border-violet-400 bg-violet-50" : "border-border hover:border-border"}`}>
                  <input
                    type="radio"
                    name="tomVoz"
                    value={opt.val}
                    checked={tomVoz === opt.val}
                    onChange={() => setTomVoz(opt.val)}
                    className="sr-only"
                  />
                  <span className="text-xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground" style={{ fontWeight: tomVoz === opt.val ? 600 : 400 }}>{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tomVoz === opt.val ? "border-violet-600" : "border-border"}`}>
                    {tomVoz === opt.val && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <p className="text-sm text-foreground">Usar emojis</p>
                <p className="text-xs text-muted-foreground">Nas mensagens do MEL</p>
              </div>
              <Toggle value={emojisAtivos} onChange={setEmojisAtivos} />
            </div>

            <div className="mt-3">
              <label className="text-xs text-foreground block mb-1.5">Nível de detalhe</label>
              <div className="relative">
                <select
                  value={nivelDetalhe}
                  onChange={(e) => setNivelDetalhe(e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 pr-8 appearance-none bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="resumido">Resumido (só o essencial)</option>
                  <option value="detalhado">Detalhado (com contexto)</option>
                  <option value="muito_detalhado">Muito detalhado (com análises)</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Preview em tempo real */}
          <div
            className="rounded-xl p-4"
            style={{ background: "#1f2937" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm" style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>🤖</div>
              <p className="text-white text-sm" style={{ fontWeight: 600 }}>Preview em tempo real</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/80 text-xs leading-relaxed">{previewFinal}</p>
            </div>
            <p className="text-white/40 text-xs mt-2">← Muda conforme você ajusta as configurações</p>
          </div>

          {/* Restaurar padrões */}
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-sm text-foreground mb-1" style={{ fontWeight: 600 }}>Opções avançadas</p>
            <p className="text-xs text-muted-foreground mb-3">Restaure as configurações padrão se precisar recomeçar.</p>
            <button className="text-xs text-red-500 hover:text-red-700 underline transition-colors">
              Restaurar configurações padrão
            </button>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-6 flex justify-end gap-3">
        <button className="px-4 py-2 text-sm text-foreground hover:text-foreground transition-colors">
          Cancelar
        </button>
        <button
          onClick={handleSalvar}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm bg-primary text-primary-foreground hover:bg-foreground hover:text-white transition-all disabled:opacity-70"
        >
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}
