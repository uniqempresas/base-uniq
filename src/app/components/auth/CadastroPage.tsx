import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Building2,
  Lock,
  Check,
  ArrowRight,
  FileText,
  Phone,
  MapPin,
  Hash,
  Briefcase,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";

interface FormData {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
  empresa: string;
  cnpj: string;
  telefone: string;
  ramoAtuacao: string;
  numeroFuncionarios: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  termos: boolean;
}

const STEPS = [
  { id: 0, label: "Conta" },
  { id: 1, label: "Empresa" },
  { id: 2, label: "Configuração" },
];

const RAMOS = [
  "Varejo",
  "Serviços",
  "Indústria",
  "Tecnologia",
  "Alimentação",
  "Beleza e Estética",
  "Saúde",
  "Educação",
  "Construção",
  "Outro",
];

const FUNCIONARIOS = [
  "Só eu",
  "2-5",
  "6-10",
  "11-20",
  "21-50",
  "51+",
];

function formatCPF(v: string) {
  const nums = v.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
}

function formatCNPJ(v: string) {
  const nums = v.replace(/\D/g, "").slice(0, 14);
  if (nums.length <= 2) return nums;
  if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
  if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
  if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
}

function formatPhone(v: string) {
  const nums = v.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 2) return nums;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

function formatCEP(v: string) {
  const nums = v.replace(/\D/g, "").slice(0, 8);
  if (nums.length <= 5) return nums;
  return `${nums.slice(0, 5)}-${nums.slice(5)}`;
}

export function CadastroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [form, setForm] = useState<FormData>({
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
    empresa: "",
    cnpj: "",
    telefone: "",
    ramoAtuacao: "",
    numeroFuncionarios: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    termos: false,
  });

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const buscarCEP = async (cepLimpo: string) => {
    if (cepLimpo.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf,
          complemento: data.complemento || prev.complemento,
        }));
      }
    } catch {
      // ignore
    }
  };

  const validateStep = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (step === 0) {
      if (form.nome.trim().length < 3) newErrors.nome = "Nome deve ter pelo menos 3 caracteres";
      if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "E-mail inválido";
      if (form.cpf.replace(/\D/g, "").length < 11) newErrors.cpf = "CPF inválido";
      if (form.senha.length < 6) newErrors.senha = "Senha deve ter mínimo 6 caracteres";
      if (form.senha !== form.confirmarSenha) newErrors.confirmarSenha = "As senhas não coincidem";
    }
    if (step === 1) {
      if (form.empresa.trim().length < 2) newErrors.empresa = "Informe o nome da empresa";
      // CNPJ é opcional — só valida se foi preenchido
      if (form.cnpj.trim() && form.cnpj.replace(/\D/g, "").length < 14) newErrors.cnpj = "CNPJ inválido";
      if (form.telefone.replace(/\D/g, "").length < 10) newErrors.telefone = "Telefone inválido";
      if (!form.ramoAtuacao) newErrors.ramoAtuacao = "Selecione o ramo de atuação";
      if (!form.numeroFuncionarios) newErrors.numeroFuncionarios = "Selecione o número de funcionários";
      if (form.cep.replace(/\D/g, "").length < 8) newErrors.cep = "CEP inválido";
      if (!form.logradouro.trim()) newErrors.logradouro = "Informe o logradouro";
      if (!form.numero.trim()) newErrors.numero = "Informe o número";
      if (!form.bairro.trim()) newErrors.bairro = "Informe o bairro";
      if (!form.cidade.trim()) newErrors.cidade = "Informe a cidade";
      if (!form.uf.trim()) newErrors.uf = "Informe a UF";
    }
    if (step === 2) {
      if (!form.termos) newErrors.termos = "Você deve aceitar os termos";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);

    try {
      const res = await fetch(
        "https://krrkfgvdwhpelxtrdtla.supabase.co/functions/v1/criar-conta",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: form.nome,
            email: form.email,
            cpf: form.cpf,
            senha: form.senha,
            empresa: form.empresa,
            cnpj: form.cnpj,
            telefone: form.telefone,
            ramoAtuacao: form.ramoAtuacao,
            numeroFuncionarios: form.numeroFuncionarios,
            cep: form.cep,
            logradouro: form.logradouro,
            numero: form.numero,
            complemento: form.complemento,
            bairro: form.bairro,
            cidade: form.cidade,
            uf: form.uf,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrors({ termos: data.error || "Erro ao criar conta. Tente novamente." });
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      setErrors({ termos: "Erro de conexão. Verifique sua internet." });
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full bg-white rounded-3xl shadow-lg border p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#efefef] flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-[#1f2937]" />
        </div>
        <h2 className="text-xl font-bold text-[#1f2937] mb-2">Conta criada! 🎉</h2>
        <p className="text-[#627271] text-sm mb-1">
          Bem-vindo(a) à UNIQ, <strong>{form.nome.split(" ")[0]}</strong>!
        </p>
        <p className="text-[#627271] text-sm">Redirecionando para o dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="flex items-start justify-between mb-6 px-2">
        {STEPS.map((s, i) => {
          const isActive = i === step;
          const isCompleted = i < step;
          return (
            <div key={s.id} className="flex flex-col items-center flex-1 relative">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all z-10",
                  isCompleted && "bg-[#86cb92] text-[#1f2937]",
                  isActive && !isCompleted && "bg-[#86cb92] text-[#1f2937] ring-4 ring-[#86cb92]/30",
                  !isActive && !isCompleted && "bg-white text-[#627271] border-2 border-[#efefef]"
                )}
              >
                {isCompleted ? <Check size={18} /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 font-medium",
                  isActive || isCompleted ? "text-[#1f2937]" : "text-[#627271]"
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 left-1/2 w-full h-0.5 -z-0",
                    i < step ? "bg-[#86cb92]" : "bg-[#efefef]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl border p-6 sm:p-8">
        {step === 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1f2937]">Criar sua Conta</h2>
              <p className="text-[#627271] text-sm mt-1">Informe seus dados pessoais para começar.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Nome Completo</Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={form.nome}
                    onChange={(e) => set("nome", e.target.value)}
                    placeholder="João Silva"
                    className={cn(
                      "w-full pl-4 pr-11 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                      errors.nome ? "border-red-400" : "border-[#efefef]"
                    )}
                  />
                  <User size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
                </div>
                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">E-mail</Label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="henriqsilva@gmail.com"
                      className={cn(
                        "w-full pl-4 pr-11 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                        errors.email ? "border-red-400" : "border-[#efefef]"
                      )}
                    />
                    <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">CPF</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={form.cpf}
                      onChange={(e) => set("cpf", formatCPF(e.target.value))}
                      placeholder="411.193.848-50"
                      className={cn(
                        "w-full pl-4 pr-11 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                        errors.cpf ? "border-red-400" : "border-[#efefef]"
                      )}
                    />
                    <FileText size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
                  </div>
                  {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Senha</Label>
                  <div className="relative">
                    <Input
                      type={showSenha ? "text" : "password"}
                      value={form.senha}
                      onChange={(e) => set("senha", e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        "w-full pl-4 pr-11 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                        errors.senha ? "border-red-400" : "border-[#efefef]"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha(!showSenha)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271] hover:text-[#1f2937]"
                    >
                      {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha}</p>}
                </div>
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmar ? "text" : "password"}
                      value={form.confirmarSenha}
                      onChange={(e) => set("confirmarSenha", e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        "w-full pl-4 pr-11 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                        errors.confirmarSenha ? "border-red-400" : "border-[#efefef]"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar(!showConfirmar)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271] hover:text-[#1f2937]"
                    >
                      {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmarSenha && <p className="text-red-500 text-xs mt-1">{errors.confirmarSenha}</p>}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1f2937]">Dados da Empresa</h2>
              <p className="text-[#627271] text-sm mt-1">Detalhes do negócio para personalizar seu dashboard.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Nome da Empresa</Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={form.empresa}
                    onChange={(e) => set("empresa", e.target.value)}
                    placeholder="Ex: Minha Loja Ltda"
                    className={cn(
                      "w-full pl-4 pr-11 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                      errors.empresa ? "border-red-400" : "border-[#efefef]"
                    )}
                  />
                  <Building2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
                </div>
                {errors.empresa && <p className="text-red-500 text-xs mt-1">{errors.empresa}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">CNPJ (opcional)</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={form.cnpj}
                      onChange={(e) => set("cnpj", formatCNPJ(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      className={cn(
                        "w-full pl-4 pr-11 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                        errors.cnpj ? "border-red-400" : "border-[#efefef]"
                      )}
                    />
                    <FileText size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
                  </div>
                  {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>}
                </div>
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Telefone</Label>
                  <div className="relative">
                    <Input
                      type="tel"
                      value={form.telefone}
                      onChange={(e) => set("telefone", formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className={cn(
                        "w-full pl-4 pr-11 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                        errors.telefone ? "border-red-400" : "border-[#efefef]"
                      )}
                    />
                    <Phone size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
                  </div>
                  {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Ramo de Atuação</Label>
                  <div className="relative">
                    <select
                      value={form.ramoAtuacao}
                      onChange={(e) => set("ramoAtuacao", e.target.value)}
                      className={cn(
                        "w-full pl-4 pr-10 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 appearance-none",
                        errors.ramoAtuacao ? "border-red-400" : "border-[#efefef]"
                      )}
                    >
                      <option value="">Selecione</option>
                      {RAMOS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <Briefcase size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
                  </div>
                  {errors.ramoAtuacao && <p className="text-red-500 text-xs mt-1">{errors.ramoAtuacao}</p>}
                </div>
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Nº de Funcionários</Label>
                  <div className="relative">
                    <select
                      value={form.numeroFuncionarios}
                      onChange={(e) => set("numeroFuncionarios", e.target.value)}
                      className={cn(
                        "w-full pl-4 pr-10 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 appearance-none",
                        errors.numeroFuncionarios ? "border-red-400" : "border-[#efefef]"
                      )}
                    >
                      <option value="">Selecione</option>
                      {FUNCIONARIOS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <Users size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271] pointer-events-none" />
                  </div>
                  {errors.numeroFuncionarios && <p className="text-red-500 text-xs mt-1">{errors.numeroFuncionarios}</p>}
                </div>
              </div>

              <div className="h-px bg-[#efefef] my-2" />

              <div>
                <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">CEP</Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={form.cep}
                    onChange={(e) => {
                      const v = formatCEP(e.target.value);
                      set("cep", v);
                      if (v.replace(/\D/g, "").length === 8) buscarCEP(v.replace(/\D/g, ""));
                    }}
                    placeholder="00000-000"
                    className={cn(
                      "w-full pl-4 pr-11 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                      errors.cep ? "border-red-400" : "border-[#efefef]"
                    )}
                  />
                  <MapPin size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
                </div>
                {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Logradouro</Label>
                  <Input
                    type="text"
                    value={form.logradouro}
                    onChange={(e) => set("logradouro", e.target.value)}
                    placeholder="Endereço"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                      errors.logradouro ? "border-red-400" : "border-[#efefef]"
                    )}
                  />
                  {errors.logradouro && <p className="text-red-500 text-xs mt-1">{errors.logradouro}</p>}
                </div>
                <div className="sm:w-24">
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Número</Label>
                  <Input
                    type="text"
                    value={form.numero}
                    onChange={(e) => set("numero", e.target.value)}
                    placeholder="Nº"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                      errors.numero ? "border-red-400" : "border-[#efefef]"
                    )}
                  />
                  {errors.numero && <p className="text-red-500 text-xs mt-1">{errors.numero}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Complemento</Label>
                  <Input
                    type="text"
                    value={form.complemento}
                    onChange={(e) => set("complemento", e.target.value)}
                    placeholder="Apto, Bloco, etc."
                    className="w-full px-4 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 border-[#efefef]"
                  />
                </div>
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Bairro</Label>
                  <Input
                    type="text"
                    value={form.bairro}
                    onChange={(e) => set("bairro", e.target.value)}
                    placeholder="Bairro"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                      errors.bairro ? "border-red-400" : "border-[#efefef]"
                    )}
                  />
                  {errors.bairro && <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                <div>
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">Cidade</Label>
                  <Input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => set("cidade", e.target.value)}
                    placeholder="Cidade"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                      errors.cidade ? "border-red-400" : "border-[#efefef]"
                    )}
                  />
                  {errors.cidade && <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>}
                </div>
                <div className="sm:w-20">
                  <Label className="text-[#1f2937] text-sm font-medium mb-1.5 block">UF</Label>
                  <Input
                    type="text"
                    value={form.uf}
                    onChange={(e) => set("uf", e.target.value.toUpperCase())}
                    placeholder="UF"
                    maxLength={2}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-[#efefef] text-[#1f2937] text-sm outline-none transition-all focus:bg-white focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20",
                      errors.uf ? "border-red-400" : "border-[#efefef]"
                    )}
                  />
                  {errors.uf && <p className="text-red-500 text-xs mt-1">{errors.uf}</p>}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1f2937]">Configuração</h2>
              <p className="text-[#627271] text-sm mt-1">Revise seus dados e finalize o cadastro.</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#efefef] bg-[#efefef] p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#627271]">Responsável</span>
                  <span className="text-[#1f2937] font-medium">{form.nome}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#627271]">E-mail</span>
                  <span className="text-[#1f2937] font-medium">{form.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#627271]">Empresa</span>
                  <span className="text-[#1f2937] font-medium">{form.empresa}</span>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="termos"
                    checked={form.termos}
                    onChange={(e) => set("termos", e.target.checked)}
                    className="w-4 h-4 rounded border-[#efefef] accent-[#86cb92] cursor-pointer mt-0.5 shrink-0"
                  />
                  <label htmlFor="termos" className="text-[#1f2937] text-sm cursor-pointer leading-relaxed">
                    Li e aceito os{" "}
                    <a href="#" className="text-[#1f2937] font-semibold hover:underline">Termos de Uso</a>
                    {" "}e a{" "}
                    <a href="#" className="text-[#1f2937] font-semibold hover:underline">Política de Privacidade</a>
                  </label>
                </div>
                {errors.termos && <p className="text-red-500 text-xs mt-1">{errors.termos}</p>}
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3 h-auto rounded-full border-[#efefef] text-[#1f2937] font-semibold hover:bg-[#efefef]"
            >
              Voltar
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              className="flex-1 py-3 h-auto rounded-full bg-[#86cb92] hover:bg-[#1f2937] text-[#1f2937] hover:text-white font-semibold shadow-md shadow-[#86cb92]/30"
            >
              Próximo Passo <ArrowRight size={18} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 h-auto rounded-full bg-[#86cb92] hover:bg-[#1f2937] text-[#1f2937] hover:text-white font-semibold shadow-md shadow-[#86cb92]/30 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar Conta <ArrowRight size={18} />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <p className="text-center text-[#627271] text-sm mt-6">
        {step === 0 ? (
          <>
            Já tem uma conta empresarial?{" "}
            <Link to="/auth/login" className="text-[#1f2937] font-semibold hover:underline">
              Fazer login
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link to="/auth/login" className="text-[#1f2937] font-semibold hover:underline">
              Entrar
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
