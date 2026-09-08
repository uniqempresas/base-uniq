import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, BriefcaseBusiness, Check, Mail, Pencil, Phone, Save, Shield, Users } from "lucide-react";
import { useEmployees } from "../../hooks/useEmployees";
import { Employee, EmployeeRole, EmployeeStatus } from "../../types/employees";

const roleLabels: Record<EmployeeRole, string> = { owner: "Proprietário", admin: "Administrador", manager: "Gerente", seller: "Vendedor", viewer: "Visualizador" };
const statusLabels: Record<EmployeeStatus, string> = { active: "Ativo", inactive: "Inativo", pending: "Pendente" };
const moduleLabels: Record<string, string> = { crm: "CRM", finance: "Financeiro", inventory: "Estoque", sales: "Vendas", store: "Loja Virtual", appointments: "Agendamentos", settings: "Configurações" };

export function ColaboradorDetalhePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { employees, loading, update } = useEmployees();
  const employee = employees.find((item) => item.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "" });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (employee) setForm({ name: employee.name, email: employee.email, phone: employee.phone || "", position: employee.position || "" });
  }, [employee]);

  if (!employee) return <main data-od-id="colaborador-detalhe-nao-encontrado" className="mx-auto max-w-3xl p-4 text-[#1f2937] sm:p-6"><button data-od-id="colaborador-detalhe-voltar" onClick={() => navigate("/configuracoes/colaboradores")} className="mb-8 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#627271] hover:bg-[#efefef] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#86cb92]"><ArrowLeft size={17} />Voltar aos colaboradores</button><section className="rounded-lg border border-[#efefef] bg-white p-8 text-center"><Users className="mx-auto mb-3 text-[#627271]" size={32} /><h1 className="text-xl font-semibold">Colaborador não encontrado</h1><p className="mt-2 text-sm text-[#627271]">Esse colaborador pode ter sido removido ou o endereço está incorreto.</p></section></main>;

  const saveDetails = async () => {
    try { await update(employee.id, { ...form, phone: form.phone || undefined, position: form.position || undefined }); setEditing(false); setFeedback("Dados salvos com sucesso."); setTimeout(() => setFeedback(""), 3500); } catch { setFeedback("Não foi possível salvar os dados."); }
  };

  return <main data-od-id="colaborador-detalhe" className="mx-auto w-full max-w-5xl p-4 text-[#1f2937] sm:p-6">
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div><button data-od-id="colaborador-detalhe-back" onClick={() => navigate("/configuracoes/colaboradores")} className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#627271] hover:bg-[#efefef] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#86cb92]"><ArrowLeft size={17} />Voltar</button><h1 data-od-id="colaborador-detalhe-heading" className="text-2xl font-semibold">Detalhes do colaborador</h1><p className="mt-1 text-sm text-[#627271]">Visualize os dados e acessos de {employee.name}.</p></div>
      <button data-od-id="colaborador-detalhe-permissoes" onClick={() => navigate(`/configuracoes/colaboradores/${employee.id}/permissoes`)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1f2937] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#627271] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#86cb92]"><Shield size={17} />Permissões</button>
    </header>
    {feedback && <p data-od-id="colaborador-detalhe-feedback" role="status" className="mb-4 rounded-lg border border-[#86cb92] bg-[#f1fbf3] px-4 py-3 text-sm font-medium text-[#1f2937]">{feedback}</p>}
    <section data-od-id="colaborador-detalhe-resumo" className="mb-5 rounded-lg border border-[#efefef] bg-[#1f2937] p-5 text-white sm:p-6"><div className="flex flex-wrap items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#86cb92] text-xl font-bold text-[#1f2937]">{employee.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div className="min-w-0 flex-1"><h2 className="truncate text-xl font-semibold">{employee.name}</h2><p className="mt-1 text-sm text-[#efefef]">{employee.position || roleLabels[employee.role]}</p></div><span className="rounded-full border border-[#86cb92] px-3 py-1 text-xs font-semibold text-[#86cb92]">{statusLabels[employee.status]}</span></div></section>
    <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <section data-od-id="colaborador-detalhe-dados" className="rounded-lg border border-[#efefef] bg-white p-5 sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Dados básicos</h2><p className="mt-1 text-sm text-[#627271]">Informações de contato e função.</p></div><button data-od-id="colaborador-detalhe-editar" onClick={() => setEditing(!editing)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#efefef] px-3 py-2 text-sm font-semibold text-[#1f2937] hover:bg-[#efefef] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#86cb92]"><Pencil size={15} />{editing ? "Cancelar" : "Editar"}</button></div><div className="grid gap-4 sm:grid-cols-2">{([["name", "Nome", employee.name], ["email", "E-mail", employee.email], ["phone", "Telefone", employee.phone || "Não informado"], ["position", "Cargo", employee.position || "Não informado"]] as const).map(([key, label, value]) => <div key={key}><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#627271]">{label}</p>{editing ? <input data-od-id={`colaborador-detalhe-input-${key}`} aria-label={label} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="w-full rounded-lg border border-[#627271] px-3 py-2 text-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#86cb92]" /> : <p className="flex items-center gap-2 text-sm font-medium">{key === "email" && <Mail size={15} className="text-[#627271]" />}{key === "phone" && <Phone size={15} className="text-[#627271]" />}{key === "position" && <BriefcaseBusiness size={15} className="text-[#627271]" />}{value}</p>}</div>)}</div>{editing && <button data-od-id="colaborador-detalhe-salvar" onClick={saveDetails} disabled={loading || !form.name.trim() || !form.email.trim()} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] hover:bg-[#1f2937] hover:text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1f2937] disabled:opacity-50"><Save size={16} />{loading ? "Salvando..." : "Salvar dados"}</button>}</section>
      <section data-od-id="colaborador-detalhe-acesso" className="rounded-lg border border-[#efefef] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold">Acesso</h2><div className="mt-5 space-y-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#627271]">Papel</p><p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold"><Shield size={16} className="text-[#86cb92]" />{roleLabels[employee.role]}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-[#627271]">Módulos habilitados</p><div className="mt-2 flex flex-wrap gap-2">{employee.modules.length ? employee.modules.map((access) => <span key={access.module} className="rounded-full border border-[#efefef] bg-[#f8faf9] px-2.5 py-1 text-xs font-medium">{moduleLabels[access.module] || access.module}</span>) : <span className="text-sm text-[#627271]">Nenhum módulo habilitado.</span>}</div></div></div></section>
    </div>
  </main>;
}
