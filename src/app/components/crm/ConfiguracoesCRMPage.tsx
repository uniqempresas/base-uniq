import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Trash2, Loader2, AlertCircle, Tags, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTags, CORES_TAG, getTagPalette, type Tag } from "../../hooks/use-tags";

function TagRow({ tag, onRemover, removendo }: { tag: Tag; onRemover: () => void; removendo: boolean }) {
  const colors = getTagPalette(tag.cor);
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#efefef] bg-white">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ background: colors.text }}
        aria-hidden
      />
      <span
        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px]"
        style={{ background: colors.bg, color: colors.text, borderColor: colors.border, fontWeight: 600 }}
      >
        {tag.nome}
      </span>
      <span className="text-[#627271] text-xs ml-1">{tag.nome}</span>
      <button
        onClick={onRemover}
        disabled={removendo}
        aria-label={`Remover tag ${tag.nome}`}
        className="ml-auto w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {removendo ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
    </div>
  );
}

export function ConfiguracoesCRMPage() {
  const navigate = useNavigate();
  const { tags, loading, error, isFallback, recarregar, criarTag, desativarTag } = useTags();
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState<string>(CORES_TAG[0]);
  const [criando, setCriando] = useState(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const handleAdicionar = async () => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      toast.error("Informe o nome da tag.");
      return;
    }
    setCriando(true);
    const res = await criarTag(nomeLimpo, cor);
    setCriando(false);
    if (res.success) {
      toast.success(`Tag "${nomeLimpo}" criada!`);
      setNome("");
    } else {
      toast.error(res.error || "Erro ao criar tag.");
    }
  };

  const handleRemover = async (tag: Tag) => {
    setRemovendoId(tag.id);
    const res = await desativarTag(tag.id);
    setRemovendoId(null);
    if (res.success) {
      toast.success(`Tag "${tag.nome}" removida.`);
    } else {
      toast.error(res.error || "Erro ao remover tag.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/crm/clientes")}
            className="w-9 h-9 rounded-xl bg-white border border-[#efefef] flex items-center justify-center text-[#627271] hover:bg-[#efefef] transition-colors"
            aria-label="Voltar para clientes"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              Configurações do CRM
            </h1>
            <p className="text-[#627271] text-sm">
              {loading ? "Carregando..." : `${tags.length} tag${tags.length !== 1 ? "s" : ""} configurada${tags.length !== 1 ? "s" : ""}`}
              {isFallback && !loading && <span className="ml-2 text-xs text-amber-600">(dados de demonstração)</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Card de tags */}
      <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#efefef] flex items-center justify-center shrink-0">
            <Tags size={18} className="text-[#627271]" />
          </div>
          <div>
            <h2 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
              Tags / Etiquetas dos clientes
            </h2>
            <p className="text-[#627271] text-xs mt-0.5">
              As tags aparecem nos cards e filtros da lista de clientes e podem ser aplicadas ao cadastrar um cliente.
            </p>
          </div>
        </div>

        {/* Formulário nova tag */}
        <div className="mb-5 p-4 rounded-xl border border-[#efefef]" style={{ background: "#FAFAFA" }}>
          <label className="block text-[#1f2937] text-xs mb-2" style={{ fontWeight: 600 }}>
            Nova tag
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdicionar();
                }
              }}
              placeholder="Ex: Aniversariante"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
            />
            <button
              onClick={handleAdicionar}
              disabled={criando}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm transition-all disabled:opacity-70"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {criando ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Adicionar
            </button>
          </div>
          <div className="mt-3">
            <p className="block text-[#627271] text-xs mb-2" style={{ fontWeight: 500 }}>
              Cor
            </p>
            <div className="flex flex-wrap gap-2">
              {CORES_TAG.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  aria-label={`Cor ${c}`}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{
                    background: c,
                    outline: cor === c ? `2px solid ${c}` : "none",
                    outlineOffset: 2,
                    boxShadow: cor === c ? `0 0 0 3px rgba(255,255,255,0.9), 0 0 0 5px ${c}44` : "none",
                  }}
                />
              ))}
              <span
                className="ml-auto inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] self-center"
                style={getTagPalette(cor)}
              >
                Preview
              </span>
            </div>
          </div>
        </div>

        {/* Lista de tags */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-[#efefef] animate-pulse" />
            ))}
          </div>
        ) : error && !isFallback ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
              Erro ao carregar tags
            </p>
            <p className="text-[#627271] text-xs mb-4">{error}</p>
            <button
              onClick={recarregar}
              className="px-4 py-2 rounded-xl text-[#1f2937] text-sm"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              Tentar novamente
            </button>
          </div>
        ) : tags.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#efefef] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-[#627271]" />
            </div>
            <p className="text-[#1f2937] text-sm mb-1" style={{ fontWeight: 600 }}>
              Nenhuma tag ainda
            </p>
            <p className="text-[#627271] text-xs">
              Adicione a primeira tag acima para começar a organizar seus clientes.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <TagRow
                key={tag.id}
                tag={tag}
                removendo={removendoId === tag.id}
                onRemover={() => handleRemover(tag)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Nota */}
      <p className="text-[#627271] text-xs px-1">
        Tags removidas deixam de aparecer em novos cadastros, mas continuam valendo nos clientes já cadastrados.
      </p>
    </div>
  );
}