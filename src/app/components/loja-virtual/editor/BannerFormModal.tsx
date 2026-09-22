import { useState } from "react";
import { X, Upload, Trash2, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import type { BannerLoja } from "../../../types/loja";
import type { Produto } from "../../../types/produto";
import type { CategoriaProduto } from "../../../hooks/use-categorias";

/**
 * Form de 1 banner (WIRE §4.3).
 *
 * - Upload **desktop** + **mobile** — preencher um é válido; o outro lado usa o
 *   mesmo arquivo na vitrine (SPEC §2.1). Valida tipo (JPG/WebP) e alvo
 *   (≤ 300 KB) no momento da escolha e de novo ao salvar.
 * - Preview imediato via object URL — nada sobe ao bucket antes de "Salvar".
 * - Textos, cor do botão, **cor do texto** (`text_color`, lacuna 3), posição do
 *   botão e **destino do clique** com o campo de valor condicional (lacuna 4):
 *   `product` → select de produtos ativos · `external` → URL · `category` →
 *   select de categorias · `grid` → oculto.
 *
 * Upload reusa o padrão do projeto (`use-upload-produto.ts`): bucket público
 * `uniq_me_produtos`, caminho `<empresaId>/banners/<uuid>.<ext>`.
 */

const ALVO_KB = 300;
const TIPO_LINK_LABEL: Record<NonNullable<BannerLoja["linkTipo"]>, string> = {
  product: "Produto",
  external: "Link externo",
  category: "Categoria",
  grid: "Vitrine",
};

interface BannerFormModalProps {
  banner: BannerLoja | null;
  /** Produtos ativos da empresa (`use-produtos`) — alimenta o select de destino */
  produtos: Produto[];
  /** Categorias da empresa (`use-categorias`) — alimenta o select de destino */
  categorias: CategoriaProduto[];
  empresaId: string | undefined;
  onClose: () => void;
  onSalvar: (banner: BannerLoja) => void;
}

/** Upload no bucket público do projeto (mesmo padrão de foto de produto). */
async function uploadBannerImage(
  arquivo: File,
  empresaId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!empresaId) {
    return {
      success: false,
      error:
        "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.",
    };
  }

  const ext = arquivo.name.split(".").pop()?.toLowerCase() || "jpg";
  const caminho = `${empresaId}/banners/${crypto.randomUUID()}.${ext}`;

  const { error: errUpload } = await supabase.storage
    .from("uniq_me_produtos")
    .upload(caminho, arquivo, {
      contentType: arquivo.type,
      upsert: false,
    });

  if (errUpload) return { success: false, error: errUpload.message };

  const { data } = supabase.storage.from("uniq_me_produtos").getPublicUrl(caminho);
  return { success: true, url: data.publicUrl };
}

/** Apenas JPG ou WebP (WIRE §4.3 — PNG só com transparência, orientação textual). */
function ehImagemValida(arquivo: File): boolean {
  return ["image/jpeg", "image/webp"].includes(arquivo.type);
}

interface CampoImagemProps {
  rotulo: string;
  dica: React.ReactNode;
  preview: string;
  erro: string;
  aoEscolher: (e: React.ChangeEvent<HTMLInputElement>) => void;
  aoRemover: () => void;
}

function CampoImagem({ rotulo, dica, preview, erro, aoEscolher, aoRemover }: CampoImagemProps) {
  return (
    <div>
      <label className="block text-[#1f2937] text-xs mb-1" style={{ fontWeight: 600 }}>
        {rotulo}
      </label>
      <p className="text-[#627271] text-[11px] mb-2 leading-relaxed">{dica}</p>

      {preview ? (
        <div className="rounded-xl overflow-hidden border border-[#efefef] relative">
          <img
            src={preview}
            alt={`Prévia — ${rotulo}`}
            className="w-full h-28 sm:h-32 object-cover"
          />
          <label
            className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/90 backdrop-blur text-[#1f2937] text-xs cursor-pointer hover:bg-white transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Upload size={13} />
            Escolher outra
            <input
              type="file"
              accept="image/jpeg,image/webp"
              className="hidden"
              onChange={aoEscolher}
            />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-1.5 h-28 sm:h-32 rounded-xl border-2 border-dashed border-[#efefef] bg-[#FAFAFA] cursor-pointer hover:border-[#86cb92] transition-colors">
          <ImageIcon size={18} className="text-[#627271]" />
          <span className="text-xs text-[#627271]">Escolher imagem</span>
          <input
            type="file"
            accept="image/jpeg,image/webp"
            className="hidden"
            onChange={aoEscolher}
          />
        </label>
      )}

      {preview && (
        <button
          type="button"
          onClick={aoRemover}
          className="inline-flex items-center gap-1.5 mt-2 px-3 py-2 rounded-xl border border-[#efefef] text-red-500 text-xs hover:bg-red-50 transition-colors"
          style={{ fontWeight: 500 }}
        >
          <Trash2 size={13} />
          Remover imagem
        </button>
      )}

      {erro && (
        <p role="alert" className="mt-1.5 text-xs text-red-600" style={{ fontWeight: 500 }}>
          {erro}
        </p>
      )}
    </div>
  );
}

interface CampoCorProps {
  label: string;
  valor: string;
  onChange: (cor: string) => void;
}

function CampoCor({ label, valor, onChange }: CampoCorProps) {
  const corValida = /^#[0-9a-fA-F]{6}$/.test(valor) ? valor : "#86cb92";
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <span className="w-11 h-11 rounded-xl border border-[#efefef] relative overflow-hidden shrink-0">
          <span className="absolute inset-0" style={{ background: corValida }} aria-hidden />
          <input
            type="color"
            value={corValida}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`Selecionar cor — ${label}`}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </span>
        <input
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#86cb92"
          aria-label={label}
          className="w-full min-w-0 px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white font-mono"
        />
      </div>
    </div>
  );
}

export function BannerFormModal({
  banner,
  produtos,
  categorias,
  empresaId,
  onClose,
  onSalvar,
}: BannerFormModalProps) {
  const [form, setForm] = useState(() => ({
    titulo: banner?.titulo || "",
    subtitulo: banner?.subtitulo || "",
    textoBotao: banner?.textoBotao || "",
    corBotao: banner?.corBotao || "",
    corTexto: banner?.corTexto || "",
    posicao: (banner?.posicaoBotao ?? "bottom-left") as "bottom-left" | "bottom-right",
    linkTipo: (banner?.linkTipo ?? "product") as NonNullable<BannerLoja["linkTipo"]>,
    linkValor: banner?.linkValor || "",
  }));

  const [arquivoDesktop, setArquivoDesktop] = useState<File | null>(null);
  const [previewDesktop, setPreviewDesktop] = useState(banner?.desktopUrl || "");
  const [removerDesktop, setRemoverDesktop] = useState(false);
  const [erroDesktop, setErroDesktop] = useState("");

  const [arquivoMobile, setArquivoMobile] = useState<File | null>(null);
  const [previewMobile, setPreviewMobile] = useState(banner?.mobileUrl || "");
  const [removerMobile, setRemoverMobile] = useState(false);
  const [erroMobile, setErroMobile] = useState("");

  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  const exigeValor =
    form.linkTipo === "product" || form.linkTipo === "external" || form.linkTipo === "category";

  const selecionarArquivo =
    (
      lado: "desktop" | "mobile",
      setArquivo: (f: File | null) => void,
      setPreview: (p: string) => void,
      setRemover: (r: boolean) => void,
      setErro: (e: string) => void
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      setErro("");
      setErroGeral("");
      if (!file) return;

      if (!ehImagemValida(file)) {
        setErro("Envie uma imagem (JPG ou WebP).");
        return;
      }
      if (file.size > ALVO_KB * 1024) {
        setErro("Imagem muito grande — o alvo é ≤ 300 KB.");
        return;
      }

      setArquivo(file);
      setPreview(URL.createObjectURL(file));
      setRemover(false);
      if (lado === "desktop") setErroDesktop("");
      else setErroMobile("");
    };

  const limparImagem =
    (
      setArquivo: (f: File | null) => void,
      setPreview: (p: string) => void,
      setRemover: (r: boolean) => void
    ) =>
    () => {
      setArquivo(null);
      setPreview("");
      setRemover(true);
    };

  const salvar = async () => {
    setErroDesktop("");
    setErroMobile("");
    setErroGeral("");

    const titulo = form.titulo.trim();
    if (!titulo) {
      setErroGeral("Informe o título do banner.");
      return;
    }

    if (exigeValor && !form.linkValor.trim()) {
      setErroGeral(
        form.linkTipo === "external"
          ? "Informe o URL de destino do clique."
          : "Selecione o destino do clique."
      );
      return;
    }

    const temDesktop = removerDesktop ? false : Boolean(arquivoDesktop || banner?.desktopUrl);
    const temMobile = removerMobile ? false : Boolean(arquivoMobile || banner?.mobileUrl);
    if (!temDesktop && !temMobile) {
      setErroGeral("Adicione pelo menos uma imagem (desktop ou mobile).");
      return;
    }

    setSalvando(true);

    let desktopUrl: string | null = null;
    let mobileUrl: string | null = null;

    if (!removerDesktop) {
      if (arquivoDesktop) {
        const res = await uploadBannerImage(arquivoDesktop, empresaId || "");
        if (!res.success) {
          setErroDesktop(res.error || "Erro ao enviar a imagem.");
          setSalvando(false);
          return;
        }
        desktopUrl = res.url || null;
      } else if (banner?.desktopUrl) {
        desktopUrl = banner.desktopUrl;
      }
    }

    if (!removerMobile) {
      if (arquivoMobile) {
        const res = await uploadBannerImage(arquivoMobile, empresaId || "");
        if (!res.success) {
          setErroMobile(res.error || "Erro ao enviar a imagem.");
          setSalvando(false);
          return;
        }
        mobileUrl = res.url || null;
      } else if (banner?.mobileUrl) {
        mobileUrl = banner.mobileUrl;
      }
    }

    setSalvando(false);

    onSalvar({
      id: banner?.id || `banner-${Date.now()}`,
      desktopUrl,
      mobileUrl,
      titulo,
      subtitulo: form.subtitulo.trim(),
      textoBotao: form.textoBotao.trim() || null,
      corBotao: form.corBotao.trim() || null,
      corTexto: form.corTexto.trim() || null,
      posicaoBotao: form.posicao,
      linkTipo: form.linkTipo,
      linkValor: form.linkTipo === "grid" ? null : form.linkValor.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-form-banner"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefef]">
          <div>
            <h3 id="titulo-form-banner" className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
              {banner ? "Editar banner" : "Novo banner"}
            </h3>
            <p className="text-[#627271] text-xs">Imagem, textos e destino do clique</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#efefef] flex items-center justify-center hover:bg-[#e2e2e2] transition-colors"
            aria-label="Fechar"
          >
            <X size={16} className="text-[#1f2937]" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna imagem + orientação */}
            <div className="space-y-5">
              <CampoImagem
                rotulo="Imagem — desktop"
                dica={
                  <>
                    Recomendado: <strong>1600 × 340</strong> (proporção 4,67:1) · retina{" "}
                    <strong>2240 × 480</strong>.
                  </>
                }
                preview={previewDesktop}
                erro={erroDesktop}
                aoEscolher={selecionarArquivo(
                  "desktop",
                  setArquivoDesktop,
                  setPreviewDesktop,
                  setRemoverDesktop,
                  setErroDesktop
                )}
                aoRemover={limparImagem(setArquivoDesktop, setPreviewDesktop, setRemoverDesktop)}
              />

              <CampoImagem
                rotulo="Imagem — mobile (opcional)"
                dica={
                  <>
                    Recomendado: <strong>1080 × 480</strong> (proporção 2,25:1).
                  </>
                }
                preview={previewMobile}
                erro={erroMobile}
                aoEscolher={selecionarArquivo(
                  "mobile",
                  setArquivoMobile,
                  setPreviewMobile,
                  setRemoverMobile,
                  setErroMobile
                )}
                aoRemover={limparImagem(setArquivoMobile, setPreviewMobile, setRemoverMobile)}
              />

              {/* Orientação do upload (WIRE §4.3 — uma única vez) */}
              <div className="rounded-xl border border-[#efefef] bg-[#FAFAFA] p-4 space-y-1.5 text-[11px] leading-relaxed">
                <p className="text-[#1f2937]" style={{ fontWeight: 600 }}>
                  Orientação do upload
                </p>
                <p className="text-[#627271] flex gap-1.5">
                  <span className="text-[#86cb92]" aria-hidden>✔</span>
                  Preencher só um é válido — o outro lado usa o mesmo arquivo.
                </p>
                <p className="text-[#627271] flex gap-1.5">
                  <span className="text-amber-500" aria-hidden>⚠</span>
                  A proporção varia com a largura do aparelho (2,24:1 a 3,79:1). Mantenha o
                  assunto principal no centro vertical.
                </p>
                <p className="text-[#627271] flex gap-1.5">
                  <span className="text-[#86cb92]" aria-hidden>✔</span>
                  JPG ou WebP · alvo ≤ 300 KB.
                </p>
                <p className="text-[#627271] flex gap-1.5">
                  <span className="text-[#86cb92]" aria-hidden>✔</span>
                  Área segura: textos à esquerda (sobre o véu); assunto principal à direita.
                </p>
              </div>

              {erroGeral && (
                <p role="alert" className="flex items-start gap-1.5 text-xs text-red-600" style={{ fontWeight: 500 }}>
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  {erroGeral}
                </p>
              )}
            </div>

            {/* Coluna campos */}
            <div className="space-y-4">
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Título *
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex: Natal na Doceê"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
                />
              </div>

              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={form.subtitulo}
                  onChange={(e) => setForm((f) => ({ ...f, subtitulo: e.target.value }))}
                  placeholder="Ex: Trufas e kits para presentear"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20 bg-white"
                />
              </div>

              {/* Botão */}
              <div>
                <p className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 600 }}>
                  Botão
                </p>
                <div className="space-y-3 rounded-xl border border-[#efefef] p-3.5">
                  <div>
                    <label className="block text-[#627271] text-[11px] mb-1">
                      Texto do botão
                    </label>
                    <input
                      type="text"
                      value={form.textoBotao}
                      onChange={(e) => setForm((f) => ({ ...f, textoBotao: e.target.value }))}
                      placeholder="Ver mais"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-white"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <CampoCor
                      label="Cor da ação"
                      valor={form.corBotao}
                      onChange={(cor) => setForm((f) => ({ ...f, corBotao: cor }))}
                    />
                    <CampoCor
                      label="Cor do texto"
                      valor={form.corTexto}
                      onChange={(cor) => setForm((f) => ({ ...f, corTexto: cor }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[#627271] text-[11px] mb-1.5">Posição</label>
                    <div className="flex gap-2">
                      {(["bottom-left", "bottom-right"] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, posicao: pos }))}
                          aria-pressed={form.posicao === pos}
                          className="flex-1 min-h-11 px-3 py-2.5 rounded-xl border text-xs transition-all"
                          style={{
                            background: form.posicao === pos ? "#86cb92" : "white",
                            borderColor: form.posicao === pos ? "#86cb92" : "#efefef",
                            color: form.posicao === pos ? "#1f2937" : "#627271",
                            fontWeight: form.posicao === pos ? 600 : 400,
                          }}
                        >
                          {pos === "bottom-left" ? "Inferior esquerdo" : "Inferior direito"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Destino do clique */}
              <div>
                <p className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 600 }}>
                  Destino do clique
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(TIPO_LINK_LABEL) as NonNullable<BannerLoja["linkTipo"]>[]).map(
                    (tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            linkTipo: tipo,
                            linkValor: tipo === "grid" ? "" : f.linkValor,
                          }))
                        }
                        aria-pressed={form.linkTipo === tipo}
                        className="min-h-11 px-3 py-2 rounded-xl border text-xs transition-all"
                        style={{
                          background: form.linkTipo === tipo ? "#86cb92" : "white",
                          borderColor: form.linkTipo === tipo ? "#86cb92" : "#efefef",
                          color: form.linkTipo === tipo ? "#1f2937" : "#627271",
                          fontWeight: form.linkTipo === tipo ? 600 : 400,
                        }}
                      >
                        {TIPO_LINK_LABEL[tipo]}
                      </button>
                    )
                  )}
                </div>

                {/* Valor condicional (lacuna 4) */}
                {form.linkTipo === "product" && (
                  <div className="mt-3">
                    <label className="block text-[#627271] text-[11px] mb-1">
                      Valor — produto
                    </label>
                    <select
                      value={form.linkValor}
                      onChange={(e) => setForm((f) => ({ ...f, linkValor: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-white appearance-none"
                    >
                      <option value="">Selecionar produto</option>
                      {produtos
                        .filter((p) => p.status === "ativo")
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome}
                          </option>
                        ))}
                    </select>
                    <p className="text-[#627271] text-[11px] mt-1">
                      O banner abre a página do produto na sua loja.
                    </p>
                  </div>
                )}

                {form.linkTipo === "external" && (
                  <div className="mt-3">
                    <label className="block text-[#627271] text-[11px] mb-1">
                      Valor — URL externa
                    </label>
                    <input
                      type="url"
                      value={form.linkValor}
                      onChange={(e) => setForm((f) => ({ ...f, linkValor: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-white"
                    />
                    <p className="text-[#627271] text-[11px] mt-1">
                      Abre em uma nova aba.
                    </p>
                  </div>
                )}

                {form.linkTipo === "category" && (
                  <div className="mt-3">
                    <label className="block text-[#627271] text-[11px] mb-1">
                      Valor — categoria
                    </label>
                    <select
                      value={form.linkValor}
                      onChange={(e) => setForm((f) => ({ ...f, linkValor: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] bg-white appearance-none"
                    >
                      <option value="">Selecionar categoria</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                    <p className="text-[#627271] text-[11px] mt-1">
                      O banner rola até a seção da categoria na loja.
                    </p>
                  </div>
                )}

                {form.linkTipo === "grid" && (
                  <p className="mt-3 text-[#627271] text-[11px]">
                    Âncora interna — o banner rola até o catálogo da própria vitrine. Sem valor.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#efefef] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
            style={{ fontWeight: 500 }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="flex-1 py-2.5 rounded-xl text-[#1f2937] text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ background: "#86cb92", fontWeight: 600 }}
          >
            {salvando ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Salvando...
              </>
            ) : banner ? (
              "Salvar banner"
            ) : (
              "Adicionar banner"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}