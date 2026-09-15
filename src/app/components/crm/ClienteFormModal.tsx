import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { getTagPalette, type Tag } from "../../hooks/use-tags";
import { useCriarCliente } from "../../hooks/use-criar-cliente";
import { useAtualizarCliente } from "../../hooks/use-atualizar-cliente";
import type { Cliente } from "../../types/clientes";

interface ClienteFormModalProps {
  cliente?: Cliente | null; // null/undefined = modo criar; Cliente = modo editar
  tags: Tag[];
  onClose: () => void;
  onSuccess: () => void; // tela fecha o modal e recarrega/atualiza
}

export function ClienteFormModal({ cliente, tags, onClose, onSuccess }: ClienteFormModalProps) {
  const isEdicao = Boolean(cliente);
  const [tipo, setTipo] = useState<"PF" | "PJ">(cliente?.tipo || "PF");
  const [form, setForm] = useState<{ nome: string; telefone: string; email: string; tags: string[] }>({
    nome: cliente?.nome || "",
    telefone: cliente?.telefone || "",
    email: cliente?.email || "",
    // Armadilha: a tag "WhatsApp" é injetada pela UI quando origem === "whatsapp"
    // e NÃO existe na coluna `tags` do banco. Remover antes de popular o form,
    // senão salvar gravaria a tag fantasma duplicada.
    tags: cliente ? cliente.tags.filter((t) => t !== "WhatsApp") : [],
  });
  const [erro, setErro] = useState("");
  const { criarCliente, loading: criando } = useCriarCliente();
  const { atualizarCliente, loading: atualizando } = useAtualizarCliente();
  const loading = isEdicao ? atualizando : criando;

  const formatPhone = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (cliente) {
      const res = await atualizarCliente({
        id: cliente.id,
        nome: form.nome,
        telefone: form.telefone,
        email: form.email,
        tags: form.tags,
      });
      if (!res.success) {
        setErro(res.error || "Erro ao atualizar cliente.");
        return;
      }
      onSuccess();
      return;
    }

    const res = await criarCliente({
      nome: form.nome,
      telefone: form.telefone,
      email: form.email,
      tags: form.tags,
    });
    if (!res.success) {
      setErro(res.error || "Erro ao cadastrar cliente.");
      return;
    }
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>{isEdicao ? "Editar Cliente" : "Novo Cliente"}</h3>
            <p className="text-[#627271] text-xs">{isEdicao ? "Atualize os dados do cliente" : "Preencha as informações básicas"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#efefef] transition-colors">
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-[#1f2937] text-xs mb-2" style={{ fontWeight: 500 }}>Tipo de cliente</label>
            <div className="flex gap-2">
              {["PF", "PJ"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t as "PF" | "PJ")}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                  style={{
                    background: tipo === t ? "#efefef" : "#efefef",
                    color: tipo === t ? "#1f2937" : "#627271",
                    border: tipo === t ? "2px solid #86cb92" : "2px solid transparent",
                    fontWeight: 600,
                  }}
                >
                  {t === "PF" ? "👤 Pessoa Física" : "🏢 Pessoa Jurídica"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
              {tipo === "PF" ? "Nome completo" : "Razão Social"} *
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder={tipo === "PF" ? "Ex: Maria Silva" : "Ex: Loja do João LTDA"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Telefone / WhatsApp *</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: formatPhone(e.target.value) }))}
                placeholder="(11) 99999-9999"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
                required
              />
            </div>
            <div>
              <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="cliente@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>Tags / Etiquetas</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const selected = form.tags.includes(tag.nome);
                const colors = getTagPalette(tag.cor);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tags: selected ? f.tags.filter((t) => t !== tag.nome) : [...f.tags, tag.nome],
                      }))
                    }
                    className="px-2.5 py-1 rounded-full border text-[11px] transition-all"
                    style={{
                      background: selected ? colors.bg : "transparent",
                      color: selected ? colors.text : "#627271",
                      borderColor: selected ? colors.border : "#efefef",
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    {tag.nome}
                  </button>
                );
              })}
            </div>
          </div>

          {erro && (
            <p className="text-xs text-red-600" style={{ fontWeight: 500 }}>
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm hover:bg-[#efefef] transition-colors" style={{ fontWeight: 500 }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-[#1f2937] text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Salvando...</> : (isEdicao ? "Salvar alterações" : "Salvar cliente")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}