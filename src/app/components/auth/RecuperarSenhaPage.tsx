import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Eye, EyeOff, Loader2, Lock, CheckCircle2, XCircle, Check } from "lucide-react";

function PasswordStrength({ senha }: { senha: string }) {
  const checks = [
    { label: "6+ caracteres", ok: senha.length >= 6 },
    { label: "Maiúscula", ok: /[A-Z]/.test(senha) },
    { label: "Número", ok: /[0-9]/.test(senha) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-400", "bg-amber-400", "bg-[#86cb92]"];
  if (!senha) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-[#efefef]"}`} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs flex items-center gap-0.5 ${c.ok ? "text-[#1f2937]" : "text-[#627271]"}`}>
            {c.ok ? <Check size={10} /> : "·"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RecuperarSenhaPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Simulate token validation: token "expirado" = invalid
  const tokenValido = token !== "expirado";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ nova?: string; confirmar?: string }>({});

  if (!tokenValido) {
    return (
      <div className="w-full text-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-[#1f2937] mb-2" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
          Link inválido ou expirado
        </h2>
        <p className="text-[#627271] text-sm mb-6 leading-relaxed">
          Este link de recuperação expirou ou já foi utilizado. Solicite um novo link para continuar.
        </p>
        <Link
          to="/auth/esqueci-senha"
          className="inline-block w-full py-3.5 rounded-xl bg-[#86cb92] text-[#1f2937] text-sm text-center transition-all hover:bg-[#1f2937] hover:text-white"
          style={{ fontWeight: 600 }}
        >
          Solicitar novo link
        </Link>
        <p className="mt-4">
<Link to="/auth/login" className="text-sm hover:underline" style={{ color: "#1f2937" }}>
            Voltar para login
          </Link>
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full text-center py-8">
        <div className="w-16 h-16 rounded-full bg-[#efefef] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-[#1f2937]" />
        </div>
        <h2 className="text-[#1f2937] mb-2" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
          Senha atualizada! 🎉
        </h2>
        <p className="text-[#627271] text-sm mb-2">
          Sua senha foi redefinida com sucesso.
        </p>
        <p className="text-[#627271] text-sm">Redirecionando para o login...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (novaSenha.length < 6) newErrors.nova = "Senha deve ter mínimo 6 caracteres";
    if (novaSenha !== confirmar) newErrors.confirmar = "As senhas não coincidem";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate("/auth/login"), 3000);
  };

  return (
    <div className="w-full">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#86cb92" }}>
        <Lock size={26} className="text-[#1f2937]" />
      </div>

      <div className="mb-8">
        <h2 className="text-[#1f2937]" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2 }}>
          Criar nova senha
        </h2>
        <p className="text-[#627271] text-sm mt-2 leading-relaxed">
          Crie uma senha forte para proteger sua conta UNIQ.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[#1f2937] text-sm mb-1.5" style={{ fontWeight: 500 }}>Nova senha</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
            <input
              type={showNova ? "text" : "password"}
              value={novaSenha}
              onChange={(e) => { setNovaSenha(e.target.value); setErrors((prev) => ({ ...prev, nova: undefined })); }}
              placeholder="••••••••"
              autoFocus
              className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 ${errors.nova ? "border-red-400" : "border-[#efefef]"}`}
            />
            <button type="button" onClick={() => setShowNova(!showNova)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271] hover:text-[#1f2937]">
              {showNova ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <PasswordStrength senha={novaSenha} />
          {errors.nova && <p className="text-red-500 text-xs mt-1">{errors.nova}</p>}
        </div>

        <div>
          <label className="block text-[#1f2937] text-sm mb-1.5" style={{ fontWeight: 500 }}>Confirmar nova senha</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
            <input
              type={showConfirmar ? "text" : "password"}
              value={confirmar}
              onChange={(e) => { setConfirmar(e.target.value); setErrors((prev) => ({ ...prev, confirmar: undefined })); }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 ${errors.confirmar ? "border-red-400" : "border-[#efefef]"}`}
            />
            <button type="button" onClick={() => setShowConfirmar(!showConfirmar)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271] hover:text-[#1f2937]">
              {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmar && <p className="text-red-500 text-xs mt-1">{errors.confirmar}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-[#86cb92] text-[#1f2937] text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#1f2937] hover:text-white active:scale-[0.98] disabled:opacity-70 mt-2"
          style={{ fontWeight: 600 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Atualizando...
            </>
          ) : (
            "Redefinir senha"
          )}
        </button>
      </form>

      <p className="text-center mt-6">
        <Link to="/auth/login" className="text-sm hover:underline" style={{ color: "#1f2937" }}>
          Voltar para login
        </Link>
      </p>
    </div>
  );
}
