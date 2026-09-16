import { useState } from "react";
import { X, CheckCircle2, Loader2, Barcode, Camera, Trash2, Package } from "lucide-react";
import { PRODUTOS, CATEGORIA_COLORS, formatCurrency, calcMargem, type Produto } from "./estoqueMockData";
import { useCriarProduto } from "../../hooks/use-criar-produto";
import { useAtualizarProduto } from "../../hooks/use-atualizar-produto";
import { getTagPalette, type Tag } from "../../hooks/use-tags";
import { useAuth } from "../../contexts/AuthContext";
import { useUploadProdutoFoto } from "../../hooks/use-upload-produto";

const CATEGORIAS = [...new Set(PRODUTOS.map((p) => p.categoria))];

const STEPS = ["Informações", "Preços", "Estoque"];

interface ProdutoFormModalProps {
  produto?: Produto | null; // null/undefined = modo criar; Produto = modo editar
  produtoBase?: Produto | null; // null/undefined = modo criar normal; Produto = modo duplicar
  tags: Tag[];              // catálogo via useTags (mesmo de clientes)
  onClose: () => void;
  onSuccess: () => void;
}

export function ProdutoFormModal({ produto, produtoBase, tags, onClose, onSuccess }: ProdutoFormModalProps) {
  const ehEdicao = Boolean(produto);
  const ehDuplicacao = Boolean(produtoBase);
  const { empresa } = useAuth();
  const { criarProduto, loading: salvandoCriar } = useCriarProduto();
  const { atualizarProduto, loading: salvandoEditar } = useAtualizarProduto();
  const { uploadarFoto, carregando } = useUploadProdutoFoto();
  const salvando = ehEdicao ? (salvandoEditar || carregando) : (salvandoCriar || carregando);

  const [step, setStep] = useState(1);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState(() => {
    const base = produtoBase || produto || null;
    return {
      nome: produtoBase ? `${produtoBase.nome} (cópia)` : base?.nome || "",
      sku: produtoBase ? (produtoBase.sku ? `${produtoBase.sku}-COPIA` : "") : base?.sku || "",
      categoria: base?.categoria || "",
      unidade: base?.unidade || "Peça",
      precoCusto: base ? String(base.precoCusto ?? 0) : "",
      precoVenda: base ? String(base.precoVenda ?? 0) : "",
      estoque: produtoBase ? "0" : base ? String(base.estoque ?? 0) : "",
      estoqueMinimo: base ? String(base.estoqueMinimo ?? 0) : "",
      codigoBarras: base?.codigoBarras || "",
      descricao: base?.descricaoCurta || "",
    };
  });
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>(
    (produtoBase || produto)?.foto || ""
  );
  const [fotoRemovida, setFotoRemovida] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>(
    (produtoBase || produto)?.tags || []
  );

  const base = produtoBase || produto || null;
  const catColorsForPhoto =
    CATEGORIA_COLORS[form.categoria] || CATEGORIA_COLORS["Outros"];

  const margem =
    form.precoCusto && form.precoVenda
      ? calcMargem(parseFloat(form.precoCusto), parseFloat(form.precoVenda))
      : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    // Upload primeiro: produto só salva se a foto subir (regra 1 do PRD).
    let fotoUrlFinal: string | undefined;
    if (fotoArquivo) {
      const res = await uploadarFoto(empresa?.id || "", fotoArquivo);
      if (!res.success) {
        setErro(res.error || "Erro ao enviar a foto.");
        return;
      }
      fotoUrlFinal = res.url;
    } else if (fotoRemovida) {
      fotoUrlFinal = "";
    }

    if (produto) {
      // produto.id é string no front (mock "p1"; DB number → String(db.id)) → Number() no submit
      const resultado = await atualizarProduto({
        id: Number(produto.id),
        nome: form.nome,
        sku: form.sku || undefined,
        categoria: form.categoria || undefined,
        precoVenda: parseFloat(form.precoVenda) || 0,
        precoCusto: parseFloat(form.precoCusto) || 0,
        estoque: parseInt(form.estoque) || 0,
        codigoBarras: form.codigoBarras || undefined,
        descricao: form.descricao || undefined,
        tags: tagsSelecionadas,
        fotoUrl: fotoUrlFinal,
      });

      if (resultado.success) {
        onSuccess();
      } else {
        setErro(resultado.error || "Erro ao atualizar produto.");
      }
      return;
    }

    const resultado = await criarProduto({
      nome: form.nome,
      sku: form.sku || undefined,
      categoria: form.categoria || undefined,
      precoVenda: parseFloat(form.precoVenda) || 0,
      precoCusto: parseFloat(form.precoCusto) || 0,
      estoque: parseInt(form.estoque) || 0,
      codigoBarras: form.codigoBarras || undefined,
      descricao: form.descricao || undefined,
      tags: tagsSelecionadas,
      // No duplicar, herda a URL da foto original; no criar sem foto, undefined → hook grava null.
      fotoUrl: fotoUrlFinal !== undefined ? fotoUrlFinal : base?.foto,
    });

    if (resultado.success) {
      onSuccess();
    } else {
      setErro(resultado.error || "Erro ao salvar produto.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
              {ehDuplicacao ? "Duplicar Produto" : ehEdicao ? "Editar Produto" : "Novo Produto"}
            </h3>
            <p className="text-[#627271] text-xs">Passo {step} de {STEPS.length}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#efefef]"
          >
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex px-5 pt-4 gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
                style={{
                  background: i + 1 < step ? "#86cb92" : i + 1 === step ? "#efefef" : "#efefef",
                  color: i + 1 < step ? "#1f2937" : i + 1 === step ? "#1f2937" : "#627271",
                  border: i + 1 === step ? "2px solid #86cb92" : "2px solid transparent",
                  fontWeight: 700,
                }}
              >
                {i + 1 < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className="text-xs hidden sm:inline"
                style={{ color: i + 1 === step ? "#1f2937" : "#627271", fontWeight: i + 1 === step ? 600 : 400 }}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[#efefef]" />}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 1 && (
            <>
              {/* Foto do produto */}
              <div>
                <p className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Foto do produto
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
                    style={{ background: catColorsForPhoto.bg }}
                  >
                    {fotoPreview ? (
                      <img
                        src={fotoPreview}
                        alt="Prévia do produto"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={40} style={{ color: catColorsForPhoto.text, opacity: 0.4 }} />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <label
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                        style={{ background: "#efefef", color: "#1f2937", fontWeight: 600 }}
                      >
                        <Camera size={13} />
                        Enviar foto
                        <input
                          type="file"
                          accept="image/*"
                          aria-label="Enviar foto do produto"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file) return;
                            if (!file.type.startsWith("image/")) {
                              setErroFoto("Envie uma imagem (JPG, PNG ou WebP).");
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              setErroFoto("Imagem muito grande. Envie uma foto de até 5 MB.");
                              return;
                            }
                            setFotoArquivo(file);
                            setFotoPreview(URL.createObjectURL(file));
                            setFotoRemovida(false);
                            setErroFoto("");
                          }}
                        />
                      </label>
                      {(fotoPreview || base?.foto) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFotoArquivo(null);
                            setFotoPreview("");
                            setFotoRemovida(Boolean(base));
                            setErroFoto("");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border border-[#efefef] text-red-500 hover:bg-red-50 transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          <Trash2 size={13} />
                          Remover
                        </button>
                      )}
                    </div>
                    <p className="text-[#627271] text-[11px]">JPG, PNG ou WebP · máx 5 MB</p>
                  </div>
                </div>
                {erroFoto && (
                  <p className="mt-1.5 text-xs text-red-600" style={{ fontWeight: 500 }}>
                    {erroFoto}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Nome do produto *
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Camiseta Básica Premium"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
                  required
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    SKU *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                      placeholder="Ex: CAM-001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, sku: `SKU-${Date.now().toString().slice(-6)}` }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 rounded-lg"
                      style={{ background: "#efefef", color: "#1f2937", fontWeight: 600 }}
                    >
                      Gerar
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    Unidade *
                  </label>
                  <select
                    value={form.unidade}
                    onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] appearance-none bg-white"
                  >
                    {["Peça", "Par", "Kit", "Kg", "Metro", "Litro", "Frasco", "Caixa", "Pacote"].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Categoria *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map((cat) => {
                    const colors = CATEGORIA_COLORS[cat] || CATEGORIA_COLORS["Outros"];
                    const selected = form.categoria === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, categoria: cat }))}
                        className="px-3 py-1.5 rounded-xl text-xs transition-all"
                        style={{
                          background: selected ? colors.bg : "#efefef",
                          color: selected ? colors.text : "#627271",
                          border: selected ? `2px solid ${colors.text}40` : "2px solid transparent",
                          fontWeight: selected ? 600 : 400,
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Código de Barras
                </label>
                <div className="relative">
                  <Barcode size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
                  <input
                    type="text"
                    value={form.codigoBarras}
                    onChange={(e) => setForm((f) => ({ ...f, codigoBarras: e.target.value }))}
                    placeholder="EAN-13 (opcional)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Tags / Etiquetas
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.length === 0 && (
                    <p className="text-[#627271] text-xs">Nenhuma tag cadastrada ainda (crie em Configurações).</p>
                  )}
                  {tags.map((tag) => {
                    const selected = tagsSelecionadas.includes(tag.nome);
                    const colors = getTagPalette(tag.cor);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          setTagsSelecionadas((prev) =>
                            selected ? prev.filter((t) => t !== tag.nome) : [...prev, tag.nome]
                          )
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
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    Preço de custo *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271] text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.precoCusto}
                      onChange={(e) => setForm((f) => ({ ...f, precoCusto: e.target.value }))}
                      placeholder="0,00"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    Preço de venda *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271] text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.precoVenda}
                      onChange={(e) => setForm((f) => ({ ...f, precoVenda: e.target.value }))}
                      placeholder="0,00"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Margem em tempo real */}
              {margem !== null && (
                <div
                  className="flex items-center gap-3 p-3.5 rounded-xl border"
                  style={{
                    background: margem >= 40 ? "#efefef" : margem >= 20 ? "#FFFBEB" : "#FEF2F2",
                    borderColor: margem >= 40 ? "#86cb92" : margem >= 20 ? "#FDE68A" : "#FECACA",
                  }}
                >
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: margem >= 40 ? "#1f2937" : margem >= 20 ? "#B45309" : "#B91C1C", fontWeight: 600 }}>
                      Margem de lucro: {margem}%
                    </p>
                    <p className="text-[11px] text-[#627271] mt-0.5">
                      {margem >= 40 ? "✅ Margem saudável" : margem >= 20 ? "⚠️ Margem razoável, mas pode melhorar" : "❌ Margem abaixo do recomendado (20%)"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ fontWeight: 700, color: margem >= 40 ? "#1f2937" : margem >= 20 ? "#B45309" : "#B91C1C" }}>
                      +{formatCurrency((parseFloat(form.precoVenda) || 0) - (parseFloat(form.precoCusto) || 0))}
                    </p>
                    <p className="text-[10px] text-[#627271]">por unidade</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Preço promocional (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271] text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    Quantidade inicial
                  </label>
                  <input
                    type="number"
                    value={form.estoque}
                    onChange={(e) => setForm((f) => ({ ...f, estoque: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  />
                </div>
                <div>
                  <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                    Estoque mínimo
                  </label>
                  <input
                    type="number"
                    value={form.estoqueMinimo}
                    onChange={(e) => setForm((f) => ({ ...f, estoqueMinimo: e.target.value }))}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Localização no depósito
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prateleira A-1, Vitrine 2..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                />
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Fornecedor padrão
                </label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] appearance-none bg-white">
                  <option value="">Selecionar fornecedor...</option>
                  <option>Distribuidora Têxtil SP</option>
                  <option>Tech Distribuidora</option>
                  <option>Cosméticos Nacionais</option>
                  <option>FastStep Distribuidora</option>
                </select>
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Descrição curta
                </label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  placeholder="Descrição resumida do produto..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] resize-none"
                />
              </div>
            </>
          )}

          {erro && (
            <p className="text-xs text-red-600" style={{ fontWeight: 500 }}>
              {erro}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#efefef] flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
              style={{ fontWeight: 500 }}
            >
              Voltar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
            style={{ fontWeight: 500, display: step === 1 ? "block" : "none" }}
          >
            Cancelar
          </button>
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 py-3 rounded-xl text-[#1f2937] text-sm" style={{ background: "#86cb92", fontWeight: 600 }}
            >
              Próximo →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave as any}
              disabled={salvando}
              className="flex-1 py-3 rounded-xl text-[#1f2937] text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {salvando ? (
                <><Loader2 size={15} className="animate-spin" />Salvando...</>
              ) : (
                (ehDuplicacao ? "Duplicar produto 🎉" : (ehEdicao ? "Salvar alterações" : "Salvar produto 🎉"))
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}