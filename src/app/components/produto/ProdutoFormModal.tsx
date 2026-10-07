import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  X,
  CheckCircle2,
  Loader2,
  Barcode,
  Camera,
  Trash2,
  Package,
  Settings,
  Search,
  Plus,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, calcMargem } from "../../lib/produto-utils";
import type { Produto } from "../../types/produto";
import type { ItemFichaTecnica, NaturezaProduto } from "../../types/producao";
import { NATUREZA_AJUDA, NATUREZA_LABELS } from "../../types/producao";
import { Switch } from "../ui/switch";
import { useCriarProduto } from "../../hooks/use-criar-produto";
import { useAtualizarProduto } from "../../hooks/use-atualizar-produto";
import { useProdutos } from "../../hooks/use-produtos";
import { useFichaTecnica, type UseFichaTecnicaReturn } from "../../hooks/use-ficha-tecnica";
import { getTagPalette } from "../../hooks/use-tags";
import type { CategoriaProduto } from "../../hooks/use-categorias";
import { useAuth } from "../../contexts/AuthContext";
import { useUploadProdutoFoto } from "../../hooks/use-upload-produto";

/** Steps fixos (produção F1: "Ficha Técnica" é condicional à natureza) */
const STEPS_BASE = ["Informações", "Preços", "Estoque"];
const STEP_FICHA = 4;

/**
 * SPEC §6.2: `STEPS` era const → vira função do eixo `natureza`. O step
 * condicional entra NO FIM, sem quebrar o índice dos steps existentes (1-3),
 * e os hooks do componente ficam todos no topo — nada de hook condicionado.
 */
function stepsPara(natureza: NaturezaProduto): string[] {
  return natureza === "composto" ? [...STEPS_BASE, "Ficha Técnica"] : STEPS_BASE;
}

const NATUREZAS: NaturezaProduto[] = ["simples", "composto", "insumo"];

/** Unidades comuns do datalist "Compra por" (F2 — WIRE §3). */
const UNIDADES_COMPRA = ["kg", "g", "L", "ml", "un", "lata", "caixa", "pacote", "m"];

interface ProdutoFormModalProps {
  produto?: Produto | null; // null/undefined = modo criar; Produto = modo editar
  produtoBase?: Produto | null; // null/undefined = modo criar normal; Produto = modo duplicar
  categorias: CategoriaProduto[]; // catálogo via useCategorias (o CRUD fica em /estoque/configuracoes)
  /**
   * M1 (WIRE INSUMOS_MENU_M1): pré-seleção do rádio Natureza no modo CRIAR —
   * a visão Insumos abre o modal com "insumo" marcado (mesmo padrão da
   * mini-criação de ComprasPage, que força natureza=insumo). Em edição/
   * duplicação a natureza da base sempre vence.
   */
  naturezaInicial?: NaturezaProduto;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProdutoFormModal({ produto, produtoBase, categorias, naturezaInicial: naturezaInicialProp, onClose, onSuccess }: ProdutoFormModalProps) {
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
    // Produção F1: eixo de produção. Editar/duplicar → natureza da base vence;
    // criar → pré-seleção da visão (M1: Insumos abre "insumo"; senão "simples",
    // SPEC §3). mock/produto antigo sem o campo → "simples".
    const naturezaInicial: NaturezaProduto = base?.natureza ?? naturezaInicialProp ?? "simples";
    return {
      nome: produtoBase ? `${produtoBase.nome} (cópia)` : base?.nome || "",
      sku: produtoBase ? (produtoBase.sku ? `${produtoBase.sku}-COPIA` : "") : base?.sku || "",
      // Categoria vive em `categoria_id`. Antes era um nome vindo de lista mock,
      // gravado por engano em `me_produto.tipo`.
      categoriaId: (base?.categoriaId ?? null) as number | null,
      unidade: base?.unidade || "Peça",
      precoCusto: base ? String(base.precoCusto ?? 0) : "",
      precoVenda: base ? String(base.precoVenda ?? 0) : "",
      // "Preço promocional" = me_produto.preco_varejo (o preço "de" da vitrine).
      // Persiste só quando > preço de venda; vazio → null.
      precoPromocional: base?.precoPromocional ? String(base.precoPromocional) : "",
      // "Mostrar na vitrine" = me_produto.exibir_vitrine. Default true (banco alinhado).
      // Insumo nunca vai para a vitrine (SPEC §6.3) — vale também quando a
      // pré-seleção vem da visão Insumos (M1).
      exibirVitrine: base?.exibirVitrine ?? naturezaInicial !== "insumo",
      estoque: produtoBase ? "0" : base ? String(base.estoque ?? 0) : "",
      estoqueMinimo: base ? String(base.estoqueMinimo ?? 0) : "5",
      codigoBarras: base?.codigoBarras || "",
      descricao: base?.descricaoCurta || "",
      // Produção F1: eixo de produção (pré-seleção resolvida acima; o usuário
      // ainda pode trocar no rádio Natureza do step 1).
      natureza: naturezaInicial,
      // Produção F2 (WIRE §3): conversão de compra do insumo. Vazio = compra
      // direto na unidade do estoque.
      unidadeCompra: base?.unidadeCompra || "",
      fatorConversao: base?.fatorConversao != null ? String(base.fatorConversao) : "",
    };
  });
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>(
    (produtoBase || produto)?.foto || ""
  );
  const [fotoRemovida, setFotoRemovida] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const [erroPromocional, setErroPromocional] = useState("");
  // Produção F2: erro inline do grupo "Compra e conversão" (só insumo)
  const [erroConversao, setErroConversao] = useState("");

  // ── Produção F1: ficha técnica (BOM) ──────────────────────────────────────
  // Rules-of-hooks: o hook roda SEMPRE no topo — o que é condicional é o step
  // (render), nunca a chamada. O id só é passado para composto para não
  // consultar `est_ficha_tecnica` à toa em produto simples/insumo.
  const ficha = useFichaTecnica(produto && form.natureza === "composto" ? produto.id : undefined);
  // Rascunho local da ficha. Viver AQUI (e não no step) é o que impede os dados
  // digitados de sumirem ao trocar de passo (SPEC §6.4).
  // null = sem edição do usuário → mostra o que veio do banco (`ficha.itens`).
  const [fichaRascunho, setFichaRascunho] = useState<ItemFichaTecnica[] | null>(null);
  const [fichaErro, setFichaErro] = useState("");

  const passos = stepsPara(form.natureza);
  const itensDaFicha = fichaRascunho ?? ficha.itens;
  const fichaSujeira = fichaRascunho !== null;
  const ehInsumo = form.natureza === "insumo";
  const ehComposto = form.natureza === "composto";

  /** Só grava ficha na RPC quem já existe no banco (modo edição). */
  const podeSalvarFichaDireto = Boolean(produto);

  const salvarFicha = async (): Promise<boolean> => {
    setFichaErro("");
    const r = await ficha.salvar(itensDaFicha);
    if (r.success) {
      setFichaRascunho(null); // passa a refletir o objeto salvo (flat data atualizado)
      toast.success("Ficha técnica salva");
      return true;
    }
    setFichaErro(r.error || "Erro ao salvar a ficha técnica.");
    toast.error(r.error || "Erro ao salvar a ficha técnica.");
    return false;
  };

  const base = produtoBase || produto || null;
  const navigate = useNavigate();
  const categoriaSelecionada = categorias.find((c) => c.id === form.categoriaId) || null;
  // Cor real da categoria (me_categoria.cor). Antes vinha de um mapa mock indexado
  // por nome, então toda categoria real caía na cor de "Outros".
  const catColorsForPhoto = getTagPalette(categoriaSelecionada?.cor);

  const margem =
    form.precoCusto && form.precoVenda
      ? calcMargem(parseFloat(form.precoCusto), parseFloat(form.precoVenda))
      : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    // "Preço promocional" (→ me_produto.preco_varejo): vazio grava null; se
    // preenchido, precisa ser MAIOR que o preço de venda — a vitrine só mostra
    // o selo "de/por" quando preco_varejo > preco (use-loja-produtos.ts).
    const precoVendaNum = parseFloat(form.precoVenda) || 0;
    const precoPromocional =
      form.precoPromocional.trim() === "" ? null : parseFloat(form.precoPromocional);
    if (precoPromocional !== null && Number.isFinite(precoPromocional) && precoPromocional <= precoVendaNum) {
      setErroPromocional("O preço promocional precisa ser maior que o preço de venda.");
      setStep(2);
      return;
    }
    setErroPromocional("");

    // Produção F2 (insumo): unidade de compra preenchida exige fator > 0 (WIRE §5.1).
    // Fora de insumo as chaves vão null → limpam a conversão no banco.
    const unidadeCompraFinal = form.natureza === "insumo" ? form.unidadeCompra.trim() : "";
    const fatorFinal =
      form.natureza === "insumo" && unidadeCompraFinal ? parseFloat(form.fatorConversao) : null;
    if (unidadeCompraFinal && !(fatorFinal !== null && Number.isFinite(fatorFinal) && fatorFinal > 0)) {
      setErroConversao(`Informe quantas unidades de estoque tem 1 "${unidadeCompraFinal}".`);
      setStep(1);
      return;
    }
    setErroConversao("");

    // Produção F1: composto com componente sem quantidade (> 0) não pode ir ao
    // banco — volta para o passo da ficha em vez de gravar produto inconsistente.
    if (ehComposto) {
      const semQtd = itensDaFicha.find((i) => !(i.quantidadePorUnidade > 0));
      if (semQtd) {
        setFichaErro(`Informe a quantidade de “${semQtd.componenteNome}” — precisa ser maior que zero.`);
        setStep(STEP_FICHA);
        return;
      }
    }

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
        categoriaId: form.categoriaId,
        precoVenda: parseFloat(form.precoVenda) || 0,
        precoCusto: parseFloat(form.precoCusto) || 0,
        estoque: parseInt(form.estoque) || 0,
        estoqueMinimo: form.estoqueMinimo === "" ? 5 : parseInt(form.estoqueMinimo, 10),
        codigoBarras: form.codigoBarras || undefined,
        descricao: form.descricao || undefined,
        fotoUrl: fotoUrlFinal,
        // Insumo nunca aparece na vitrine (SPEC §6.3) — UI esconde o toggle e o
        // hook ainda força false no payload (dupla proteção).
        exibirVitrine: ehInsumo ? false : form.exibirVitrine,
        precoPromocional,
        unidade: form.unidade,
        natureza: form.natureza,
        // Produção F2: conversão de compra do insumo (null limpa as colunas)
        unidadeCompra: unidadeCompraFinal || null,
        fatorConversao: fatorFinal,
      });

      if (!resultado.success) {
        setErro(resultado.error || "Erro ao atualizar produto.");
        return;
      }

      // Ficha só vai à RPC se o usuário mexeu nela — a gravação é snapshot e o
      // modal não deve reescrever a ficha de quem só editou o preço (SPEC §5).
      if (ehComposto && fichaSujeira) {
        const ok = await salvarFicha();
        if (!ok) return; // produto salvo; o erro da ficha fica visível no step
      }
      onSuccess();
      return;
    }

    const resultado = await criarProduto({
      nome: form.nome,
      sku: form.sku || undefined,
      categoriaId: form.categoriaId,
      precoVenda: parseFloat(form.precoVenda) || 0,
      precoCusto: parseFloat(form.precoCusto) || 0,
      estoque: parseInt(form.estoque) || 0,
      estoqueMinimo: form.estoqueMinimo === "" ? 5 : parseInt(form.estoqueMinimo, 10),
      codigoBarras: form.codigoBarras || undefined,
      descricao: form.descricao || undefined,
      // No duplicar, herda a URL da foto original; no criar sem foto, undefined → hook grava null.
      fotoUrl: fotoUrlFinal !== undefined ? fotoUrlFinal : base?.foto,
      exibirVitrine: ehInsumo ? false : form.exibirVitrine,
      precoPromocional,
      unidade: form.unidade,
      natureza: form.natureza,
      // Produção F2: conversão de compra do insumo (null limpa as colunas)
      unidadeCompra: unidadeCompraFinal || null,
      fatorConversao: fatorFinal,
    });

    if (!resultado.success) {
      setErro(resultado.error || "Erro ao salvar produto.");
      return;
    }

    // Produto novo ainda não tem linha no banco até aqui — a ficha é gravada em
    // sequência com o id devolvido pelo insert (RPC exige o pai existente).
    if (ehComposto && itensDaFicha.length > 0 && resultado.id) {
      setFichaErro("");
      const r = await ficha.salvar(itensDaFicha, String(resultado.id));
      if (!r.success) {
        // NÃO reenviar o form (iria duplicar o produto): fecha e avisa com clareza.
        toast.error(`Produto criado, mas a ficha técnica não foi salva: ${r.error}`);
      } else {
        toast.success("Ficha técnica salva");
      }
    }
    onSuccess();
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
            <p className="text-[#627271] text-xs">Passo {step} de {passos.length}</p>
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
          {passos.map((s, i) => (
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
              {i < passos.length - 1 && <div className="flex-1 h-px bg-[#efefef]" />}
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
                    {["Unidade", "Peça", "Par", "Kit", "Kg", "g", "Metro", "Litro", "ml", "Frasco", "Caixa", "Pacote"].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Categoria
                </label>
                {categorias.length === 0 ? (
                  <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-[#efefef] bg-[#FAFAFA]">
                    <p className="text-[#627271] text-xs">Nenhuma categoria cadastrada ainda.</p>
                    <button
                      type="button"
                      onClick={() => navigate("/estoque/configuracoes")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#efefef] bg-white text-[#1f2937] text-xs hover:bg-[#efefef] transition-colors shrink-0"
                      style={{ fontWeight: 500 }}
                    >
                      <Settings size={13} />
                      Configurar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categorias.map((cat) => {
                      const colors = getTagPalette(cat.cor);
                      const selected = form.categoriaId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, categoriaId: selected ? null : cat.id }))
                          }
                          aria-pressed={selected}
                          className="px-3 py-1.5 rounded-xl text-xs transition-all"
                          style={{
                            background: selected ? colors.bg : "#efefef",
                            color: selected ? colors.text : "#627271",
                            border: selected ? `2px solid ${colors.text}40` : "2px solid transparent",
                            fontWeight: selected ? 600 : 400,
                          }}
                        >
                          {cat.nome}
                        </button>
                      );
                    })}
                  </div>
                )}
                <p className="text-[#627271] text-[11px] mt-2">
                  Sem categoria, o produto aparece como “Sem categoria”.
                </p>
              </div>

              {/* ── Natureza do produto (Produção F1 — WIRE §2) ───────────────
                  Radio NATIVO (setas do teclado já navegam); o wrapper declara o
                  radiogroup e cada ajuda é ligada por aria-describedby. */}
              <div role="radiogroup" aria-label="Natureza do produto">
                <p className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Natureza do produto
                </p>
                <div className="rounded-xl border border-[#efefef] divide-y divide-[#efefef]">
                  {NATUREZAS.map((n) => {
                    const marcada = form.natureza === n;
                    return (
                      <label
                        key={n}
                        className="flex items-start gap-3 p-3 cursor-pointer transition-colors"
                        style={{ background: marcada ? "#efefef" : "transparent" }}
                      >
                        <input
                          type="radio"
                          name="natureza-produto"
                          value={n}
                          checked={marcada}
                          aria-describedby={`natureza-ajuda-${n}`}
                          onChange={() => {
                            setForm((f) => ({
                              ...f,
                              natureza: n,
                              // Insumo nunca vai para a vitrine (SPEC §6.3)
                              exibirVitrine: n === "insumo" ? false : f.exibirVitrine,
                            }));
                            // O step "Ficha Técnica" deixa de existir → nunca deixar
                            // o usuário pendurado num passo que sumiu.
                            if (n !== "composto" && step > STEPS_BASE.length) setStep(1);
                          }}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[#86cb92]"
                        />
                        <span className="min-w-0">
                          <span
                            className="block text-[#1f2937] text-sm"
                            style={{ fontWeight: marcada ? 600 : 500 }}
                          >
                            {NATUREZA_LABELS[n]}
                          </span>
                          <span id={`natureza-ajuda-${n}`} className="block text-[#627271] text-[11px] mt-0.5">
                            {NATUREZA_AJUDA[n]}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ── Compra e conversão (Produção F2 — WIRE §3, só insumo) ─────
                  "No estoque você usa X; compre por Y e o sistema converte."
                  Vazio = a compra já é na unidade do estoque. */}
              {form.natureza === "insumo" && (
                <div className="rounded-xl border border-[#efefef] p-4 space-y-3">
                  <div>
                    <p className="text-[#1f2937] text-xs" style={{ fontWeight: 600 }}>
                      Compra e conversão
                    </p>
                    <p className="text-[#627271] text-[11px] mt-0.5">
                      No estoque você usa <strong>{form.unidade || "un"}</strong>. Compre por{" "}
                      <strong>{form.unidadeCompra.trim() || form.unidade || "un"}</strong> e o sistema
                      converte.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="unidade-compra"
                        className="block text-[#1f2937] text-xs mb-1.5"
                        style={{ fontWeight: 500 }}
                      >
                        Compra por
                      </label>
                      <input
                        id="unidade-compra"
                        type="text"
                        list="unidades-compra-datalist"
                        autoComplete="off"
                        value={form.unidadeCompra}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, unidadeCompra: e.target.value }));
                          setErroConversao("");
                        }}
                        placeholder="Ex.: kg"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
                      />
                      <datalist id="unidades-compra-datalist">
                        {UNIDADES_COMPRA.map((u) => (
                          <option key={u} value={u} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label
                        htmlFor="fator-conversao"
                        className="block text-[#1f2937] text-xs mb-1.5"
                        style={{ fontWeight: 500 }}
                      >
                        1 unidade vale (no estoque)
                      </label>
                      <div className="relative">
                        <input
                          id="fator-conversao"
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          value={form.fatorConversao}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, fatorConversao: e.target.value }));
                            setErroConversao("");
                          }}
                          placeholder="1000"
                          aria-label={`Quantas unidades de estoque equivalem a 1 ${form.unidadeCompra.trim() || "unidade de compra"}`}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627271] text-[10px]"
                          style={{ fontWeight: 600 }}
                        >
                          {form.unidade || "un"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* resumo em tempo real (WIRE: "compra por kg = 1.000 g") */}
                  {form.unidadeCompra.trim() && Number(form.fatorConversao) > 0 && (
                    <p className="text-[11px]" style={{ color: "#1f2937", fontWeight: 600 }} role="status">
                      1 {form.unidadeCompra.trim()} ={" "}
                      {Number(form.fatorConversao).toLocaleString("pt-BR")} {form.unidade || "un"} no
                      estoque
                    </p>
                  )}

                  {erroConversao ? (
                    <p className="text-xs text-red-600" style={{ fontWeight: 500 }}>
                      {erroConversao}
                    </p>
                  ) : (
                    <p className="text-[#627271] text-[11px]">
                      Vazio = a compra já é na unidade do estoque. Ex.: compra barras de 1 kg →
                      informe "kg" e fator "1000"; ao receber 2 kg, entram 2.000 g no estoque.
                    </p>
                  )}
                </div>
              )}

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

              {/* Vitrine — me_produto.exibir_vitrine (SPEC §4.3) / insumo some com o toggle (SPEC §6.3) */}
              <div>
                <p className="block text-[#1f2937] text-xs mb-1.5" style={{ fontWeight: 500 }}>
                  Vitrine
                </p>
                {ehInsumo ? (
                  <div
                    className="flex items-center gap-2.5 rounded-xl border p-4"
                    style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
                    role="status"
                  >
                    <AlertTriangle size={15} className="shrink-0" style={{ color: "#B45309" }} />
                    <p className="text-xs" style={{ color: "#B45309", fontWeight: 600 }}>
                      Insumo — não aparece na vitrine
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-[#efefef] p-4">
                    <div>
                      <p className="text-[#1f2937] text-xs" style={{ fontWeight: 600 }}>
                        Mostrar na vitrine
                      </p>
                      <p className="text-[#627271] text-[11px] mt-0.5">
                        Desligue se o produto não deve aparecer na loja virtual.
                      </p>
                    </div>
                    <Switch
                      checked={form.exibirVitrine}
                      onCheckedChange={(checked) => setForm((f) => ({ ...f, exibirVitrine: checked }))}
                      aria-label="Mostrar na vitrine"
                    />
                  </div>
                )}
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
                       onChange={(e) => {
                         setForm((f) => ({ ...f, precoVenda: e.target.value }));
                         setErroPromocional("");
                       }}
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
                    value={form.precoPromocional}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, precoPromocional: e.target.value }));
                      setErroPromocional("");
                    }}
                    placeholder="0,00"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  />
                </div>
                {erroPromocional && (
                  <p className="mt-1.5 text-xs text-red-600" style={{ fontWeight: 500 }}>
                    {erroPromocional}
                  </p>
                )}
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

          {/* Step condicional (só composto) — WIRE §2 */}
          {step === STEP_FICHA && ehComposto && (
            <PassoFichaTecnica
              produtoId={produto?.id}
              itens={itensDaFicha}
              suja={fichaSujeira}
              erro={fichaErro}
              ficha={ficha}
              podeSalvar={podeSalvarFichaDireto}
              onAlterar={(novos) => {
                setFichaRascunho(novos);
                setFichaErro("");
              }}
              aoSalvar={() => void salvarFicha()}
              aoDesfazer={() => {
                setFichaRascunho(null);
                setFichaErro("");
              }}
            />
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
          {step < passos.length ? (
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

/* ─────────────────────────────────────────────────────────────────────────
 * Passo "Ficha Técnica" (Produção F1 — WIRE §2, SPEC §6.2)
 *
 * Componente próprio para que os hooks do passo (busca client-side de
 * componentes via `useProdutos`) vivam no topo de um componente SEMPRE
 * montado enquanto o passo existe — o passo em si é condicional no modal
 * (render), nunca a chamada de hook.
 * ───────────────────────────────────────────────────────────────────────── */
interface PassoFichaTecnicaProps {
  /** id do produto-pai (undefined = produto ainda não criado) — excluído da busca */
  produtoId?: string;
  itens: ItemFichaTecnica[];
  /** rascunho diferente do que está no banco */
  suja: boolean;
  erro: string;
  ficha: UseFichaTecnicaReturn;
  /** edição: o pai existe, então a RPC pode ser chamada direto */
  podeSalvar: boolean;
  onAlterar: (proximo: ItemFichaTecnica[]) => void;
  aoSalvar: () => void;
  aoDesfazer: () => void;
}

function PassoFichaTecnica({
  produtoId,
  itens,
  suja,
  erro,
  ficha,
  podeSalvar,
  onAlterar,
  aoSalvar,
  aoDesfazer,
}: PassoFichaTecnicaProps) {
  const { produtos } = useProdutos();
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const buscaRef = useRef<HTMLDivElement>(null);

  // Busca CLIENT-SIDE sobre useProdutos (mesmo padrão da busca de clientes do B3):
  // fora o próprio pai e os já adicionados (UNIQUE componente por pai no banco).
  const busca = termo.trim().toLowerCase();
  const candidatos = produtos
    .filter((p) => p.id !== produtoId)
    .filter((p) => !itens.some((i) => i.componenteProdutoId === p.id))
    .filter((p) => !busca || p.nome.toLowerCase().includes(busca) || p.sku.toLowerCase().includes(busca))
    .slice(0, 8);

  const adicionar = (p: Produto) => {
    onAlterar([
      ...itens,
      {
        id: `novo-${p.id}`,
        componenteProdutoId: p.id,
        componenteNome: p.nome,
        componenteSku: p.sku,
        componenteUnidade: p.unidade,
        quantidadePorUnidade: 0,
        perdaPct: 0,
      },
    ]);
    setTermo("");
    setAberto(false);
  };

  const atualizar = (id: string, patch: Partial<ItemFichaTecnica>) =>
    onAlterar(itens.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const remover = (id: string) => onAlterar(itens.filter((i) => i.id !== id));

  const invalidos = itens.filter((i) => !(i.quantidadePorUnidade > 0));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[#1f2937] text-sm" style={{ fontWeight: 700 }}>
          Ficha Técnica
        </p>
        <p className="text-[#627271] text-xs mt-0.5">
          Componentes por 1 unidade produzida
          {itens.length > 0 ? ` · ${itens.length} componente${itens.length > 1 ? "s" : ""}` : ""}
        </p>
      </div>

      {/* Busca de componente (dropdown client-side) */}
      <div className="relative" ref={buscaRef}>
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
        <input
          type="text"
          value={termo}
          onChange={(e) => { setTermo(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          onBlur={(e) => {
            // HOTFIX (recheio): só fecha quando o foco sai de TUDO (input + dropdown).
            // O setTimeout(120ms) anterior fechava o dropdown antes do toque no
            // candidato no celular: blur disparava, o <button> desmontava e o
            // mouseup/click caiam em nada -> "clico e a tela fecha" sem inserir.
            if (!buscaRef.current?.contains(e.relatedTarget as Node | null)) setAberto(false);
          }}
          onKeyDown={(e) => {
            // Enter adiciona o primeiro candidato (WIRE §2) e NUNCA submete o form.
            if (e.key === "Enter") {
              e.preventDefault();
              if (candidatos[0]) adicionar(candidatos[0]);
            }
          }}
          placeholder="Buscar produto (nome ou SKU) para compor…"
          aria-label="Buscar produto componente"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
          autoFocus
        />
        {aberto && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#efefef] shadow-lg z-50 max-h-48 overflow-y-auto">
            {candidatos.length === 0 ? (
              <div className="p-3 text-[#627271] text-sm text-center">
                {produtos.length === 0 ? "Nenhum produto cadastrado." : "Nenhum produto disponível para adicionar."}
              </div>
            ) : (
              candidatos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  // pointerdown: dispara antes do blur do input em mouse E touch;
                  // preventDefault impede o roubo de foco e o fechamento do dropdown
                  onPointerDown={(e) => { e.preventDefault(); adicionar(p); }}
                  onMouseDown={(e) => { e.preventDefault(); adicionar(p); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#efefef] transition-colors text-left"
                >
                  <Package size={14} className="text-[#627271] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 600 }}>{p.nome}</p>
                    <p className="text-[#627271] text-xs">
                      {p.sku || "sem SKU"} · {p.unidade}
                      {p.natureza && p.natureza !== "simples" ? ` · ${NATUREZA_LABELS[p.natureza]}` : ""}
                    </p>
                  </div>
                  <Plus size={14} className="text-[#627271] shrink-0" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Erro de leitura + retry (SPEC §6.4) */}
      {ficha.error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-xs text-red-600" style={{ fontWeight: 500 }}>
            {ficha.error}
          </p>
          <button
            type="button"
            onClick={ficha.recarregar}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-white text-red-600 text-[11px] shrink-0"
            style={{ fontWeight: 600 }}
          >
            <RefreshCw size={12} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Lista: loading / empty / rows */}
      {ficha.loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#efefef] animate-pulse" />
          ))}
        </div>
      ) : itens.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#efefef] p-6 text-center">
          <p className="text-[#627271] text-sm">Nenhum componente ainda — adicione o primeiro pela busca acima.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Cabeçalho só no desktop (mobile é card empilhado — WIRE §6) */}
          <div className="hidden sm:grid grid-cols-[1fr_3.5rem_6.5rem_5.5rem_2rem] gap-2 px-3 text-[#627271] text-[10px]" style={{ fontWeight: 600 }}>
            <span>Produto</span>
            <span>Unid.</span>
            <span>Qtd/unid.</span>
            <span>Perda %</span>
            <span aria-hidden="true" />
          </div>

          {itens.map((item) => {
            const qtdInvalida = !(item.quantidadePorUnidade > 0);
            return (
              <div
                key={item.id}
                className="rounded-xl border bg-white p-3 sm:grid sm:grid-cols-[1fr_3.5rem_6.5rem_5.5rem_2rem] sm:gap-2 sm:items-center sm:px-3 sm:py-2.5"
                style={{ borderColor: qtdInvalida ? "#FECACA" : "#efefef" }}
              >
                <div className="min-w-0 mb-2 sm:mb-0">
                  <p className="text-[#1f2937] text-sm truncate" style={{ fontWeight: 600 }}>
                    {item.componenteNome}
                  </p>
                  <p className="text-[#627271] text-[11px] truncate">
                    {item.componenteSku || "sem SKU"}
                  </p>
                </div>

                <p className="text-[#627271] text-xs mb-2 sm:mb-0">{item.componenteUnidade}</p>

                <div className="mb-2 sm:mb-0">
                  <label className="block sm:hidden text-[#627271] text-[10px] mb-1" style={{ fontWeight: 600 }}>
                    Quantidade (unidade)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantidadePorUnidade || ""}
                      onChange={(e) => atualizar(item.id, { quantidadePorUnidade: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      aria-label={`Quantidade de ${item.componenteNome} por unidade`}
                      className="w-full pl-2.5 pr-8 py-2 rounded-lg border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#627271] text-[10px]" style={{ fontWeight: 600 }}>
                      {item.componenteUnidade}
                    </span>
                  </div>
                </div>

                <div className="mb-2 sm:mb-0">
                  <label className="block sm:hidden text-[#627271] text-[10px] mb-1" style={{ fontWeight: 600 }}>
                    Perda %
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.perdaPct}
                    onChange={(e) => atualizar(item.id, { perdaPct: parseFloat(e.target.value) || 0 })}
                    aria-label={`Percentual de perda de ${item.componenteNome}`}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => remover(item.id)}
                  aria-label={`Remover ${item.componenteNome} da ficha técnica`}
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-transform active:scale-95 shrink-0"
                >
                  <Trash2 size={14} />
                </button>

                {qtdInvalida && (
                  <p className="text-[11px] text-red-600 sm:col-span-5" style={{ fontWeight: 500 }}>
                    Informe uma quantidade maior que zero para {item.componenteNome}.
                  </p>
                )}
                {item.perdaPct > 100 && (
                  <p className="text-[11px] sm:col-span-5 flex items-center gap-1" style={{ color: "#B45309", fontWeight: 500 }}>
                    <AlertTriangle size={11} />
                    Perda acima de 100% — confira o percentual de {item.componenteNome}.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {erro && (
        <p className="text-xs text-red-600" style={{ fontWeight: 500 }}>
          {erro}
        </p>
      )}

      {/* Ações do passo */}
      <div className="flex flex-wrap items-center gap-2">
        {podeSalvar ? (
          <>
            <button
              type="button"
              onClick={aoSalvar}
              disabled={!suja || ficha.salvando || invalidos.length > 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[#1f2937] text-sm disabled:opacity-60"
              style={{ background: "#86cb92", fontWeight: 600 }}
            >
              {ficha.salvando ? (
                <><Loader2 size={14} className="animate-spin" />Salvando ficha...</>
              ) : (
                <><CheckCircle2 size={14} />Salvar ficha</>
              )}
            </button>
            {suja && (
              <button
                type="button"
                onClick={aoDesfazer}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm"
                style={{ fontWeight: 500 }}
              >
                <RefreshCw size={13} />
                Desfazer alterações
              </button>
            )}
          </>
        ) : (
          <p className="text-[#627271] text-[11px]">
            A ficha técnica é salva junto com o produto no fim do cadastro.
          </p>
        )}
      </div>
    </div>
  );
}