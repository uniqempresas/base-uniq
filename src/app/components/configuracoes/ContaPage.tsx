import { useState, useRef } from "react";
import {
  User,
  Shield,
  Palette,
  CreditCard,
  LogOut,
  Camera,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor,
  ChevronRight,
  Download,
  Star,
  Check,
  ChevronDown,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        <Icon size={18} className="text-foreground" />
      </div>
      <div>
        <h3 className="text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground ${props.className || ""}`}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className="w-full text-sm border border-border rounded-lg px-3 py-2.5 pr-8 appearance-none bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-200"
      style={{ background: value ? "#1f2937" : "#efefef" }}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ caracteres", ok: password.length >= 8 },
    { label: "Letra maiúscula", ok: /[A-Z]/.test(password) },
    { label: "Número", ok: /\d/.test(password) },
    { label: "Caractere especial", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-400", "bg-amber-500", "bg-amber-500", "bg-primary", "bg-primary"];
  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < strength ? colors[strength] : "bg-muted"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{labels[strength]}</span>
        <div className="flex gap-3">
          {checks.map((c) => (
            <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-foreground" : "text-muted-foreground"}`}>
              <Check size={10} />
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AVATARS predefinidos ─────────────────────────────────────────────────────

const AVATARES = ["👩‍💼", "👨‍💼", "👩‍🎨", "👨‍🍳", "👩‍🔧", "👨‍💻", "🙋‍♀️", "🙋‍♂️"];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ContaPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  // Dados pessoais
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarEmoji, setAvatarEmoji] = useState("👩‍💼");
  const [nome, setNome] = useState("Maria Silva");
  const [email, setEmail] = useState("maria@lojadamaria.com");
  const [telefone, setTelefone] = useState("(11) 99876-5432");
  const [cargo, setCargo] = useState("admin");
  const [dataNasc, setDataNasc] = useState("");

  // Segurança
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [dois_fatores, setDoisFatores] = useState(false);

  // Tema
  const [tema, setTema] = useState<"claro" | "escuro" | "automatico">("automatico");
  const [tamanhoFonte, setTamanhoFonte] = useState(1); // 0=pequena, 1=normal, 2=grande

  // UI
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSalvar = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Perfil atualizado! ✅");
    }, 1500);
  };

  const handleAlterarSenha = () => {
    if (novaSenha !== confirmSenha) {
      showToast("As senhas não coincidem! ❌");
      return;
    }
    setSavingPass(true);
    setTimeout(() => {
      setSavingPass(false);
      setSenhaAtual(""); setNovaSenha(""); setConfirmSenha("");
      showToast("Senha alterada com sucesso! 🔒");
    }, 1800);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      showToast("Foto atualizada! 📸");
    }
  };

  const sessoes = [
    { device: "Chrome · MacBook Pro", location: "São Paulo, SP", time: "Agora (sessão atual)", icon: Monitor, isCurrent: true },
    { device: "Safari · iPhone 13", location: "São Paulo, SP", time: "Há 2 horas", icon: Smartphone, isCurrent: false },
    { device: "Chrome · Windows PC", location: "Campinas, SP", time: "Há 2 dias", icon: Monitor, isCurrent: false },
  ];

  const faturas = [
    { data: "01/03/2025", valor: "R$ 89,90", status: "Pago", plano: "Pro" },
    { data: "01/02/2025", valor: "R$ 89,90", status: "Pago", plano: "Pro" },
    { data: "01/01/2025", valor: "R$ 89,90", status: "Pago", plano: "Pro" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-foreground mb-1">Minha Conta</h1>
          <p className="text-sm text-foreground">Dados pessoais, segurança e preferências da sua conta</p>
        </div>
        <button
          onClick={handleSalvar}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-primary text-primary-foreground hover:bg-foreground hover:text-white transition-all disabled:opacity-70 shrink-0"
        >
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Salvando..." : "Salvar perfil"}
        </button>
      </div>

      <div className="space-y-6">

        {/* ── Dados Pessoais ── */}
        <div className="bg-white rounded-xl border border-border p-5">
          <SectionHeader icon={User} title="Dados Pessoais" />

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border flex items-center justify-center bg-muted cursor-pointer"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{avatarEmoji}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-foreground text-white flex items-center justify-center shadow border-2 border-white hover:bg-foreground transition-colors"
              >
                <Camera size={13} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            <div>
              <p className="text-foreground text-sm mb-2" style={{ fontWeight: 600 }}>Foto ou avatar</p>
              {showAvatarPicker && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {AVATARES.map((em) => (
                    <button
                      key={em}
                      onClick={() => { setAvatarEmoji(em); setAvatar(null); setShowAvatarPicker(false); }}
                      className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${avatarEmoji === em && !avatar ? "border-foreground bg-muted" : "border-transparent hover:border-border"}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-all"
                >
                  Upload foto
                </button>
                {avatar && (
                  <button
                    onClick={() => setAvatar(null)}
                    className="text-xs px-2 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm text-foreground block mb-1.5">Nome Completo <span className="text-red-500">*</span></label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" />
            </div>
            <div>
              <label className="text-sm text-foreground block mb-1.5">Email <span className="text-red-500">*</span></label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
            <div>
              <label className="text-sm text-foreground block mb-1.5">Telefone <span className="text-red-500">*</span></label>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="text-sm text-foreground block mb-1.5">Cargo / Função <span className="text-red-500">*</span></label>
              <Select value={cargo} onChange={(e) => setCargo(e.target.value)}>
                <option value="admin">Administrador</option>
                <option value="gestor">Gestor</option>
                <option value="vendedor">Vendedor</option>
                <option value="operador">Operador</option>
              </Select>
            </div>
            <div>
              <label className="text-sm text-foreground block mb-1.5">Data de Nascimento</label>
              <Input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Segurança ── */}
        <div className="bg-white rounded-xl border border-border p-5">
          <SectionHeader icon={Shield} title="Segurança" subtitle="Senha e autenticação" />

          {/* Alterar senha */}
          <div className="mb-5">
            <p className="text-sm text-foreground mb-3" style={{ fontWeight: 600 }}>Alterar senha</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm text-foreground block mb-1.5">Senha atual</label>
                <div className="relative">
                  <Input
                    type={showSenhaAtual ? "text" : "password"}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSenhaAtual ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-foreground block mb-1.5">Nova senha</label>
                <div className="relative">
                  <Input
                    type={showNovaSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNovaSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {novaSenha && <PasswordStrength password={novaSenha} />}
              </div>
              <div>
                <label className="text-sm text-foreground block mb-1.5">Confirmar nova senha</label>
                <Input
                  type="password"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  placeholder="••••••••"
                />
                {confirmSenha && novaSenha !== confirmSenha && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} /> Senhas não coincidem</p>
                )}
              </div>
            </div>
            <button
              onClick={handleAlterarSenha}
              disabled={savingPass || !senhaAtual || !novaSenha}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-foreground text-foreground hover:bg-foreground hover:text-white transition-all disabled:opacity-40"
            >
              {savingPass ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
              {savingPass ? "Alterando..." : "Alterar senha"}
            </button>
          </div>

          {/* 2FA */}
          <div className="pt-4 border-t border-border mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground" style={{ fontWeight: 600 }}>Autenticação em 2 fatores (2FA)</p>
                <p className="text-xs text-muted-foreground">Camada extra de segurança ao fazer login</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${dois_fatores ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"}`}>
                  {dois_fatores ? "Ativo" : "Inativo"}
                </span>
                <Toggle value={dois_fatores} onChange={setDoisFatores} />
              </div>
            </div>
          </div>

          {/* Sessões ativas */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-foreground" style={{ fontWeight: 600 }}>Sessões ativas</p>
              <button className="text-xs text-red-500 hover:text-red-700 transition-colors">
                Encerrar todas
              </button>
            </div>
            <div className="space-y-2">
              {sessoes.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${s.isCurrent ? "bg-muted border border-border" : "border border-dashed border-border"}`}>
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <Icon size={16} className="text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{s.device}</p>
                      <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
                    </div>
                    {s.isCurrent ? (
                      <span className="text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">Atual</span>
                    ) : (
                      <button className="text-xs text-red-500 hover:text-red-700 transition-colors">Encerrar</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Tema ── */}
        <div className="bg-white rounded-xl border border-border p-5">
          <SectionHeader icon={Palette} title="Aparência" subtitle="Personalização visual da plataforma" />

          <div className="mb-4">
            <p className="text-sm text-foreground mb-3" style={{ fontWeight: 600 }}>Tema visual</p>
            <div className="grid grid-cols-3 gap-3">
              {([
                {
                  val: "claro", label: "Claro", preview: (
                    <div className="w-full h-12 rounded-lg bg-white border border-border flex items-center p-2 gap-1">
                      <div className="w-4 h-full rounded bg-muted" />
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 bg-muted rounded w-3/4" />
                        <div className="h-1.5 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ),
                },
                {
                  val: "escuro", label: "Escuro", preview: (
                    <div className="w-full h-12 rounded-lg bg-foreground border border-foreground flex items-center p-2 gap-1">
                      <div className="w-4 h-full rounded bg-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 bg-foreground rounded w-3/4" />
                        <div className="h-1.5 bg-foreground rounded w-1/2" />
                      </div>
                    </div>
                  ),
                },
                {
                  val: "automatico", label: "Automático", preview: (
                    <div className="w-full h-12 rounded-lg overflow-hidden border border-border flex">
                      <div className="flex-1 bg-white flex items-center p-1">
                        <div className="w-2 h-full rounded bg-muted mr-1" />
                        <div className="flex-1 space-y-1">
                          <div className="h-1 bg-muted rounded" />
                          <div className="h-1 bg-muted rounded w-2/3" />
                        </div>
                      </div>
                      <div className="flex-1 bg-foreground flex items-center p-1">
                        <div className="w-2 h-full rounded bg-foreground mr-1" />
                        <div className="flex-1 space-y-1">
                          <div className="h-1 bg-foreground rounded" />
                          <div className="h-1 bg-foreground rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ),
                },
              ] as const).map((opt) => (
                <label key={opt.val} className={`cursor-pointer block`}>
                  <input type="radio" name="tema" value={opt.val} checked={tema === opt.val} onChange={() => setTema(opt.val)} className="sr-only" />
                  <div className={`rounded-xl border-2 p-2 transition-all ${tema === opt.val ? "border-foreground bg-muted" : "border-border hover:border-border"}`}>
                    {opt.preview}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tema === opt.val ? "border-foreground" : "border-border"}`}>
                        {tema === opt.val && <div className="w-2 h-2 rounded-full bg-foreground" />}
                      </div>
                      <span className="text-xs text-foreground">{opt.label}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-foreground mb-2" style={{ fontWeight: 600 }}>Tamanho da fonte</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">A</span>
              <input
                type="range"
                min={0}
                max={2}
                value={tamanhoFonte}
                onChange={(e) => setTamanhoFonte(Number(e.target.value))}
                className="flex-1 accent-foreground"
              />
              <span className="text-lg text-muted-foreground">A</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Pequena</span><span>Normal</span><span>Grande</span>
            </div>
          </div>
        </div>

        {/* ── Assinatura ── */}
        <div className="bg-white rounded-xl border border-border p-5">
          <SectionHeader icon={CreditCard} title="Assinatura e Plano" />

          {/* Plano atual */}
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: "#1f2937" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-400" fill="currentColor" />
                <span className="text-white text-sm" style={{ fontWeight: 700 }}>Plano Pro</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">Ativo</span>
            </div>
            <p className="text-white/60 text-xs mb-1">Próxima cobrança: 01/04/2025</p>
            <p className="text-white text-sm" style={{ fontWeight: 700 }}>R$ 89,90/mês</p>
          </div>

          {/* Uso do plano */}
          <div className="space-y-3 mb-4">
            {[
              { label: "Clientes cadastrados", used: 48, total: 100 },
              { label: "Usuários", used: 2, total: 5 },
              { label: "Armazenamento", used: 340, total: 1024, unit: "MB" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{item.label}</span>
                  <span className="text-foreground">{item.unit ? `${item.used}${item.unit}` : item.used} / {item.unit ? `${item.total}${item.unit}` : item.total}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.used / item.total) * 100}%`,
                      background: (item.used / item.total) > 0.8 ? "#EF4444" : "#86cb92",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Faturas */}
          <div className="mb-4">
            <p className="text-sm text-foreground mb-2" style={{ fontWeight: 600 }}>Histórico de faturas</p>
            <div className="space-y-1">
              {faturas.map((f, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <span className="text-sm text-foreground">{f.data}</span>
                    <span className="text-xs text-muted-foreground ml-2">{f.plano}</span>
                  </div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{f.valor}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground">{f.status}</span>
                  <button className="p-1.5 text-muted-foreground hover:text-foreground">
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-all">
              <ChevronRight size={15} />
              Alterar plano
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-all">
              Dados de pagamento
            </button>
          </div>
        </div>

        {/* ── Ações da Conta ── */}
        <div className="bg-white rounded-xl border border-border p-5">
          <SectionHeader icon={LogOut} title="Ações da Conta" />
          <div className="space-y-3">
            <button
              onClick={() => showToast("Saindo... Até logo! 👋")}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted text-left transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-muted group-hover:bg-muted flex items-center justify-center transition-colors">
                <LogOut size={16} className="text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">Sair da conta</p>
                <p className="text-xs text-muted-foreground">Encerra sua sessão atual</p>
              </div>
              <ChevronRight size={15} className="text-muted-foreground" />
            </button>

            <div className="pt-3 border-t border-border space-y-2">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-xs text-muted-foreground hover:text-red-600 underline transition-colors block"
              >
                Desativar minha conta
              </button>
              <button className="text-xs text-muted-foreground hover:text-red-600 underline transition-colors block">
                Solicitar exclusão de dados (LGPD)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de desativar conta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <h3 className="text-foreground text-center mb-2">Desativar conta?</h3>
            <p className="text-sm text-muted-foreground text-center mb-5">
              Sua conta ficará inativa por 30 dias e depois será excluída automaticamente. Seus dados serão preservados durante esse período.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); showToast("Solicitação enviada por email ✉️"); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 transition-all"
              >
                Desativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
