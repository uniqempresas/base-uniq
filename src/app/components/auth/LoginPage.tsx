import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !senha) {
      setError("Preencha todos os campos.");
      return;
    }
    if (senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error: authError } = await signIn(email, senha);
    setLoading(false);

    if (authError) {
      setError(authError === "Invalid login credentials" ? "E-mail ou senha incorretos." : authError);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <span className="text-sm" style={{ color: "#1f2937", fontWeight: 600 }}>
          {getGreeting()}! 👋
        </span>
        <h2 className="mt-1 text-[#1f2937]" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2 }}>
          Bem-vindo de volta
        </h2>
        <p className="text-[#627271] text-sm mt-1">
          Entre para gerenciar seu negócio
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-[#1f2937] text-sm mb-1.5" style={{ fontWeight: 500 }}>
            E-mail
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
            />
          </div>
        </div>

        {/* Senha */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[#1f2937] text-sm" style={{ fontWeight: 500 }}>
              Senha
            </label>
            <Link
              to="/auth/esqueci-senha"
              className="text-xs hover:underline transition-colors"
              style={{ color: "#1f2937" }}
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
            <input
              type={showSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
            />
            <button
              type="button"
              onClick={() => setShowSenha(!showSenha)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271] hover:text-[#1f2937] transition-colors"
            >
              {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Lembrar */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="lembrar"
            checked={lembrar}
            onChange={(e) => setLembrar(e.target.checked)}
            className="w-4 h-4 rounded border-[#efefef] accent-[#86cb92] cursor-pointer"
          />
          <label htmlFor="lembrar" className="text-[#1f2937] text-sm cursor-pointer" style={{ fontWeight: 400 }}>
            Lembrar de mim por 30 dias
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-[#86cb92] text-[#1f2937] text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#1f2937] hover:text-white active:scale-[0.98] disabled:opacity-70"
          style={{ fontWeight: 600 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar no sistema"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#efefef]" />
        <span className="text-[#627271] text-xs">ou continue com</span>
        <div className="flex-1 h-px bg-[#efefef]" />
      </div>

      {/* Social */}
      <button className="w-full py-3 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-sm flex items-center justify-center gap-2 hover:bg-[#efefef] transition-colors" style={{ fontWeight: 500 }}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuar com Google
      </button>

      {/* Sign up link */}
      <p className="text-center text-[#627271] text-sm mt-6">
        Ainda não tem conta?{" "}
        <Link to="/auth/cadastro" className="hover:underline" style={{ color: "#1f2937", fontWeight: 600 }}>
          Criar conta grátis
        </Link>
      </p>

      <p className="text-center text-[#627271] text-xs mt-6">
        UNIQ Empresas v1.0 · Todos os direitos reservados
      </p>
    </div>
  );
}
