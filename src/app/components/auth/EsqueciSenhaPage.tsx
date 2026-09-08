import { useState } from "react";
import { Link } from "react-router";
import { Mail, Loader2, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, digite um e-mail válido");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  if (sent) {
    return (
      <div className="w-full">
        <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-[#627271] hover:text-[#1f2937] mb-8 transition-colors">
          <ArrowLeft size={16} />
          Voltar para login
        </Link>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#efefef] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-[#1f2937]" />
          </div>
          <h2 className="text-[#1f2937] mb-3" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
            E-mail enviado!
          </h2>
          <p className="text-[#627271] text-sm leading-relaxed mb-6">
            Se esse e-mail estiver cadastrado, enviaremos as instruções para recuperar sua senha. Verifique sua caixa de entrada e a pasta de spam.
          </p>
          <div className="bg-[#efefef] rounded-xl p-4 mb-6 text-left">
            <p className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>📨 Enviado para:</p>
            <p className="text-[#1f2937] text-sm mt-0.5" style={{ fontWeight: 600 }}>{email}</p>
          </div>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || loading}
            className="w-full py-3 rounded-xl border text-sm transition-all disabled:opacity-50"
            style={{
              borderColor: countdown > 0 ? "#efefef" : "#1f2937",
              color: countdown > 0 ? "#627271" : "#1f2937",
              fontWeight: 600,
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Enviando...</span>
            ) : countdown > 0 ? (
              `Reenviar em ${countdown}s`
            ) : (
              "Reenviar e-mail"
            )}
          </button>
          <p className="text-[#627271] text-xs mt-4">
            Não recebeu?{" "}
            <a href="mailto:suporte@uniqempresas.com.br" className="hover:underline" style={{ color: "#1f2937" }}>
              Fale com o suporte
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-[#627271] hover:text-[#1f2937] mb-8 transition-colors">
        <ArrowLeft size={16} />
        Voltar para login
      </Link>

      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#86cb92" }}>
        <Shield size={26} className="text-[#1f2937]" />
      </div>

      <div className="mb-8">
        <h2 className="text-[#1f2937]" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2 }}>
          Recuperar senha
        </h2>
        <p className="text-[#627271] text-sm mt-2 leading-relaxed">
          Relaxa! Acontece com todo mundo. 😊<br />
          Digite seu e-mail e a gente te ajuda a recuperar o acesso.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[#1f2937] text-sm mb-1.5" style={{ fontWeight: 500 }}>
            Seu e-mail cadastrado
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoFocus
              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 ${error ? "border-red-400" : "border-[#efefef]"}`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-[#86cb92] text-[#1f2937] text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#1f2937] hover:text-white active:scale-[0.98] disabled:opacity-70"
          style={{ fontWeight: 600 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar link de recuperação"
          )}
        </button>
      </form>

      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-amber-800 text-xs leading-relaxed">
              <strong>Dica de segurança:</strong> O link de recuperação é válido por 24 horas. Após esse período, você precisará solicitar um novo link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
