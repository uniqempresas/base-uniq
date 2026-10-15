import { useEffect, useState, useRef } from "react";
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
import { formatCurrency, calcMargem, toReceita, deReceita, formatarQtd } from "../../lib/produto-utils";
// WIRE-Producao-Redesign T1/T2 — catálogo de unidades (D4), cálculo de perda e
// componentes reutilizáveis da esteira (§9). Imports de catálogo, NUNCA locais.
import {
  UNIDADES_COMPRA,
  UNIDADES_EMBALAGEM,
  UNIDADES_ESTOQUE,
  UNIDADES_MEDIDA,
  mesmasUnidades,
} from "../../lib/unidades";
import { perdaAplicada } from "../../lib/conversao";
import { LegendaConversao } from "../estoque/LegendaConversao";
import { FaixaProximoPasso } from "../estoque/FaixaProximoPasso";
import type { Produto } from "../../types/produto";
import type { ItemFichaTecnica, NaturezaProduto } from "../../types/producao";
import { NATUREZA_AJUDA, NATUREZA_LABELS } from "../../types/producao";
import { Switch } from "../ui/switch";
import { useCriarProduto, validarConversaoCompra } from "../../hooks/use-criar-produto";
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

/**
 * Unidades vêm do catálogo compartilhado (`lib/unidades` — WIRE T1, D4):
 * texto livre morreu ("un" × "Unidade", F1). A heurística anti-inversão
 * (Caixa de Uva, 07/10/2026) continua sobre UNIDADES_MEDIDA/EMBALAGEM do catálogo.
 */

/**
 * Fator da unidade para a base comum g/ml (sugestão de "rende" — WIRE T2).
 * Só medidas do catálogo somam; não-medidas (un, caixa…) retornam null.
 */
const FATOR_PARA_BASE: Record<string, number> = {
  g: 1,
  ml: 1,
  kg: 1000,
  l: 1000,
  litro: 1000,
  mg: 0.001,
};

function fatorUnidadeBase(unidade: string): number | null {
  const chave = unidade.trim().toLowerCase();
  return chave ? FATOR_PARA_BASE[chave] ?? null : null;
}

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
      // Modo Receita (PRD D1): `me_produto.rendimento_lote` em string para edição.
      // Vazio = sem modo receita (inclui leitura antiga/sem a coluna — SPEC §1).
      rendimento: base?.rendimentoLote != null ? String(base.rendimentoLote) : "",
    };
  });
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>(
    (produtoBase || produto)?.foto || ""
  );
  const [fotoRemovida, setFotoRemovida] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const [erroPromocional, setErroPromocional] = useState("");
  // WIRE T1: erro inline do bloco "COMO VOCÊ CONTA" (só insumo)
  const [erroConversao, setErroConversao] = useState("");
  // WIRE T1 — banda pós-salvar na CRIAÇÃO de insumo (próximo passo: a compra).
  // null = sem banda; {nome, href} = modal mostra FaixaProximoPasso em vez de fechar.
  const [bandaInsumo, setBandaInsumo] = useState<{ nome: string; href: string } | null>(null);

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

  // Anti-inversão (bloco "COMO VOCÊ CONTA" do insumo): compra em medida
  // (g, kg, ml…) + estoque em embalagem (Caixa, Pacote…) = cheiro de campos
  // trocados. Aviso em tempo real; a recusa dura é do validarConversaoCompra.
  const ucBaixa = form.unidadeCompra.trim().toLowerCase();
  const unidadeBaixa = form.unidade.trim().toLowerCase();
  const suspeitaInversao =
    ehInsumo &&
    ucBaixa !== "" &&
    UNIDADES_MEDIDA.includes(ucBaixa) &&
    UNIDADES_EMBALAGEM.includes(unidadeBaixa);

  // WIRE T1 — "COMO VOCÊ CONTA": compras na MESMA unidade do estoque travam o
  // fator em 1 (aviso "1 un = 1 un? deixe vazio" se houver valor digitado).
  const ucSelecionada = form.unidadeCompra.trim();
  const mesmaUnidade = ucSelecionada !== "" && mesmasUnidades(ucSelecionada, form.unidade);
  const fatorDigitadoDiferenteDeUm =
    mesmaUnidade && form.fatorConversao.trim() !== "" && parseFloat(form.fatorConversao) !== 1;

  // Compat (WIRE T1 item 1): valor salvo fora do catálogo (dados antigos) vira
  // opção extra no select — o dado nunca se perde ao editar.
  const opcoesUnidadeEstoque =
    form.unidade && !UNIDADES_ESTOQUE.includes(form.unidade)
      ? [...UNIDADES_ESTOQUE, form.unidade]
      : UNIDADES_ESTOQUE;
  const opcoesUnidadeCompra =
    ucSelecionada !== "" && !UNIDADES_COMPRA.includes(ucSelecionada)
      ? [ucSelecionada, ...UNIDADES_COMPRA]
      : UNIDADES_COMPRA;

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

    // Produção F2 + anti-inversão (Caixa de Uva, 07/10/2026): validação única
    // compartilhada com MiniSheet/hooks — unidade de compra preenchida exige fator
    // coerente com a unidade do estoque (mesma unidade → 1; diferentes → > 1).
    // Fora de insumo as chaves vão null → limpam a conversão no banco.
    // WIRE T1 item 3: o modal exige o fator (> 0) ANTES de deixar chegar ao hook.
    const unidadeCompraFinal = form.natureza === "insumo" ? form.unidadeCompra.trim() : "";
    const fatorNum = parseFloat(form.fatorConversao);
    if (unidadeCompraFinal && !mesmaUnidade) {
      if (form.fatorConversao.trim() === "" || !Number.isFinite(fatorNum) || !(fatorNum > 0)) {
        setErroConversao(`Diga quantos ${form.unidade || "un"} têm em 1 ${unidadeCompraFinal}.`);
        setStep(1);
        return;
      }
    }
    // Mesma unidade: fator travado em 1 = null no banco (o hook aceita 1 ausente).
    const fatorFinal =
      form.natureza === "insumo" && unidadeCompraFinal && !mesmaUnidade && Number.isFinite(fatorNum)
        ? fatorNum
        : null;
    if (unidadeCompraFinal) {
      const erroConv = validarConversaoCompra(unidadeCompraFinal, fatorFinal, form.unidade);
      if (erroConv) {
        setErroConversao(erroConv);
        setStep(1);
        return;
      }
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

    // Modo Receita (SPEC §5 + emenda do fundador 15/10, afinada pelo WIRE T2
    // item 5): "rende" é OBRIGATÓRIO para composto com unidade de estoque em
    // MASSA (g/kg/ml/l) e só quando há componentes — no estado vazio o campo é
    // oculto (Empty do WIRE T2). Composto por unidade recebe sugestão fixa 1.
    const rendimentoNum = parseFloat(form.rendimento.replace(",", "."));
    const paiEhMassa = fatorUnidadeBase(form.unidade) !== null;
    if (
      ehComposto &&
      paiEhMassa &&
      itensDaFicha.length > 0 &&
      (form.rendimento.trim() === "" || !Number.isFinite(rendimentoNum) || rendimentoNum <= 0)
    ) {
      setFichaErro(`diga quanto a receita rende (ex.: 595 ${form.unidade})`);
      setStep(STEP_FICHA);
      return;
    }
    const rendimentoValor =
      ehComposto && Number.isFinite(rendimentoNum) && rendimentoNum > 0 ? rendimentoNum : null;
    // A chave `rendimento_lote` só vai ao UPDATE quando há valor a gravar OU quando
    // a coluna já veio na leitura (limpar exige enviar null). Sem a migration no
    // banco, saves de produto que não tocam o campo seguem funcionando (SPEC §1).
    const rendimentoNaBase = produto?.rendimentoLote != null;
    const rendimentoParaUpdate =
      ehComposto && (rendimentoValor !== null || rendimentoNaBase) ? rendimentoValor : undefined;

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
        // Modo Receita (D1): undefined = coluna intocada; null limpa; number grava
        rendimentoLote: rendimentoParaUpdate,
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
      // Modo Receita: chave omitida quando não preenchida (INSERT segue
      // funcionando antes da migration da coluna)
      rendimentoLote: rendimentoValor === null ? undefined : rendimentoValor,
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

    // WIRE T1 — criação de insumo não fecha seco: a banda aponta a compra.
    // Edição/duplicação mantêm o comportamento atual (fecha via onSuccess).
    // onClose da banda = onSuccess do pai (ProdutosPage fecha + toast + recarrega).
    if (ehInsumo && !ehDuplicacao) {
      setBandaInsumo({
        nome: form.nome,
        href: resultado.id ? `/estoque/compras/nova?insumo=${resultado.id}` : "/estoque/compras/nova",
      });
      return;
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

        {bandaInsumo ? (
          /* WIRE T1 — sucesso substitui a tela: banda "próximo passo" dentro do
             modal. Fechar (link ou "fechar") dispara onSuccess do pai, que já
             fecha + toast + recarrega (contrato atual de ProdutosPage). */
          <div className="flex-1 overflow-y-auto p-5">
            <FaixaProximoPasso
              titulo={`✓ ${bandaInsumo.nome} cadastrado`}
              descricao={`Estoque: 0 ${form.unidade || "un"}. Insumo ganha quantidade e custo na COMPRA.`}
              acoes={[{ label: "Próximo: registrar compra →", href: bandaInsumo.href }]}
              onClose={onSuccess}
            />
          </div>
        ) : (
          <>
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
              {/* Unidade: insumo vive no bloco "COMO VOCÊ CONTA" abaixo (WIRE T1);
                  composto/simples mantêm o atalho equivalente que já existe.
                  Select do catálogo (D4) — valor antigo fora do catálogo vira
                  opção extra para nunca perder o dado salvo. */}
              <div className={ehInsumo ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
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
                {!ehInsumo && (
                  <div>
                    <label
                      className="block text-[#1f2937] text-xs mb-1.5"
                      style={{ fontWeight: 500 }}
                      htmlFor="unidade-produto"
                    >
                      Unidade *
                    </label>
                    <select
                      id="unidade-produto"
                      value={form.unidade}
                      onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                      aria-label={`Unidade de ${form.nome || "novo produto"}`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] appearance-none bg-white"
                    >
                      {opcoesUnidadeEstoque.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                )}
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

              {/* ── COMO VOCÊ CONTA (WIRE T1 — unidades por catálogo em select
                  (D4), pergunta literal de conversão (F2), legenda permanente
                  e custo nascendo da compra (D9). Anti-inversão mantida. ─── */}
              {form.natureza === "insumo" && (
                <div className="rounded-xl border border-[#efefef] p-4 space-y-3">
                  <p className="text-[#1f2937] text-xs" style={{ fontWeight: 600 }}>
                    COMO VOCÊ CONTA
                  </p>

                  <div>
                    <label
                      htmlFor="guarda-no-estoque"
                      className="block text-[#1f2937] text-xs mb-1.5"
                      style={{ fontWeight: 500 }}
                    >
                      Guarda no estoque
                    </label>
                    <select
                      id="guarda-no-estoque"
                      value={form.unidade}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, unidade: e.target.value }));
                        setErroConversao("");
                      }}
                      aria-label={`Unidade de estoque de ${form.nome || "novo produto"} — o que você pesa ou confere`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] appearance-none bg-white"
                    >
                      {opcoesUnidadeEstoque.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <p className="text-[#627271] text-[11px] mt-1.5">(o que você pesa/confere)</p>
                  </div>

                  <div>
                    <label
                      htmlFor="compra-em"
                      className="block text-[#1f2937] text-xs mb-1.5"
                      style={{ fontWeight: 500 }}
                    >
                      Compra em
                    </label>
                    <select
                      id="compra-em"
                      value={form.unidadeCompra}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, unidadeCompra: e.target.value }));
                        setErroConversao("");
                      }}
                      aria-label={`Unidade de compra de ${form.nome || "novo produto"} — o que o fornecedor entrega`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] appearance-none bg-white"
                    >
                      <option value="">a mesma unidade do estoque</option>
                      {opcoesUnidadeCompra.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <p className="text-[#627271] text-[11px] mt-1.5">(o que o fornecedor entrega)</p>
                  </div>

                  {/* Pergunta literal: "1 [compra] contém quantos [estoque]?"
                      Mesma unidade → fator TRAVADO em 1; digitou outro valor
                      antes de igualar as unidades, o aviso manda deixar vazio. */}
                  {ucSelecionada !== "" && (
                    <div>
                      <label
                        htmlFor="fator-conversao"
                        className="block text-[#1f2937] text-xs mb-1.5"
                        style={{ fontWeight: 500 }}
                      >
                        1 {ucSelecionada} contém quantos {form.unidade || "un"}?
                      </label>
                      <div className="relative">
                        <input
                          id="fator-conversao"
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          value={mesmaUnidade ? "1" : form.fatorConversao}
                          disabled={mesmaUnidade}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, fatorConversao: e.target.value }));
                            setErroConversao("");
                          }}
                          placeholder="395"
                          aria-label={`Quantos ${form.unidade || "unidades de estoque"} equivalem a 1 ${ucSelecionada}`}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] disabled:opacity-60"
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#627271] text-[10px]"
                          style={{ fontWeight: 600 }}
                        >
                          {form.unidade || "un"}
                        </span>
                      </div>
                      {fatorDigitadoDiferenteDeUm && (
                        <p
                          className="mt-1.5 rounded-lg px-3 py-2 text-[11px]"
                          style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#B45309", fontWeight: 500 }}
                          role="status"
                        >
                          1 {form.unidade} = 1 {form.unidade}? Deixe vazio — o fator fica em 1.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Legenda de conversão PERMANENTE (contrato 2 — "1 lata = 395 g")
                      + custo nascendo da primeira compra (contrato 1 / D9). */}
                  <div
                    className="rounded-lg px-3 py-2.5"
                    style={{ background: "#FAFAFA", border: "1px solid #efefef" }}
                    role="status"
                  >
                    {ucSelecionada === "" ? (
                      <span className="block text-[11px] text-[#1f2937]" style={{ fontWeight: 600 }}>
                        Guarda e compra na mesma unidade ({form.unidade || "un"}) — sem conversão.
                      </span>
                    ) : mesmaUnidade || Number(form.fatorConversao) > 0 ? (
                      <LegendaConversao
                        unCompra={ucSelecionada}
                        fator={mesmaUnidade ? 1 : Number(form.fatorConversao)}
                        unEstoque={form.unidade || "un"}
                        className="block text-[11px] text-[#1f2937]"
                      />
                    ) : (
                      <span className="block text-[11px] text-[#627271]">
                        1 {ucSelecionada} = ? {form.unidade || "un"} — preencha o quanto contém.
                      </span>
                    )}
                    <span className="block text-[11px] text-[#627271] mt-1">
                      o custo deste insumo nasce da primeira compra
                    </span>
                  </div>

                  {/* heurística anti-inversão: compra em medida + estoque em embalagem */}
                  {suspeitaInversao && (
                    <p
                      className="rounded-lg px-3 py-2 text-[11px]"
                      style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#B45309", fontWeight: 500 }}
                      role="status"
                    >
                      Você compra por <strong>{ucSelecionada}</strong> mas guarda em{" "}
                      <strong>{form.unidade}</strong>? Parece invertido: a unidade de compra é o que
                      sai na nota do fornecedor (ex.: Caixa), a de estoque é o que sobra pra usar
                      (ex.: g).
                    </p>
                  )}

                  {erroConversao && (
                    <p className="text-xs text-red-600" style={{ fontWeight: 500 }} role="alert">
                      {erroConversao}
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
              {/* WIRE T1 item 4 / D9: "Preço de custo" removido para natureza
                  insumo — o custo nasce da primeira COMPRA. Simples mantém o
                  campo como hoje; composto fica como está. */}
              <div className={ehInsumo ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
                {!ehInsumo && (
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
                )}
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

              {/* Margem em tempo real — insumo não tem custo digitado (D9) */}
              {margem !== null && !ehInsumo && (
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
              // Modo Receita (SPEC §5): campo "Essa receita rende" + edição por receita
              rendimento={form.rendimento}
              unidadePai={form.unidade || "un"}
              onRendimentoChange={(v) => setForm((f) => ({ ...f, rendimento: v }))}
              onAlterar={(novos) => {
                setFichaRascunho(novos);
                setFichaErro("");
              }}
              aoSalvar={salvarFicha}
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
          </>
        )}
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
  /**
   * Modo Receita (SPEC §5): valor bruto do campo "Essa receita rende"
   * (string do form — só é "modo receita" quando numérico > 0).
   */
  rendimento: string;
  /** Unidade do produto-pai (sufixo do campo "rende") */
  unidadePai: string;
  onRendimentoChange: (valor: string) => void;
  onAlterar: (proximo: ItemFichaTecnica[]) => void;
  /** resolve `true` quando a ficha foi salva (WIRE T2 — banda pós-salvar) */
  aoSalvar: () => Promise<boolean>;
  aoDesfazer: () => void;
}

function PassoFichaTecnica({
  produtoId,
  itens,
  suja,
  erro,
  ficha,
  podeSalvar,
  rendimento,
  unidadePai,
  onRendimentoChange,
  onAlterar,
  aoSalvar,
  aoDesfazer,
}: PassoFichaTecnicaProps) {
  const { produtos } = useProdutos();
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const buscaRef = useRef<HTMLDivElement>(null);

  // Modo Receita: com rendimento válido as linhas EXIBEM/EDITAM por receita e o
  // rascunho continua no contrato do banco (por-unidade) — a conversão de ida é
  // `toReceita` na exibição e a de volta `deReceita` no onChange, antes da RPC.
  const rendNum = parseFloat(rendimento.replace(",", "."));
  const rendAtivo = Number.isFinite(rendNum) && rendNum > 0;

  // ── WIRE T2 item 1 — sugestão automática de "Essa receita rende" ─────────
  // Soma das quantidades dos componentes convertidas para a base g/ml (a perda
  // NÃO entra na sugestão). Pai com unidade de estoque não-massa (composto por
  // unidade, ex.: Cone) → sugestão fixa 1 ("essa receita rende 1 unidade").
  const somaBase = itens.reduce((acc, i) => {
    const f = fatorUnidadeBase(i.componenteUnidade);
    return f !== null && i.quantidadePorUnidade > 0 ? acc + i.quantidadePorUnidade * f : acc;
  }, 0);
  const paiBase = fatorUnidadeBase(unidadePai);
  const sugestao =
    itens.length === 0
      ? null
      : paiBase === null
        ? 1
        : somaBase > 0
          ? Math.round((somaBase / paiBase) * 1000) / 1000
          : null;

  // Preenche automaticamente enquanto o usuário não editou manualmente (flag;
  // valor já salvo no banco ao abrir conta como edição — nunca sobrescrever).
  // A sugestão é só campo: NUNCA auto-salva (D2).
  const editadoManual = useRef(rendimento.trim() !== "");
  useEffect(() => {
    if (editadoManual.current || sugestao === null) return;
    const atual = parseFloat(rendimento.replace(",", "."));
    if (atual !== sugestao) onRendimentoChange(String(sugestao));
  }, [sugestao, rendimento, onRendimentoChange]);

  // WIRE T2 item 3 — forma por grama RECOLHIDA por default (F3/D3)
  const [guardadoAberto, setGuardadoAberto] = useState(false);
  // WIRE T2 item 4 — banda pós-salvar quando há componente com estoque 0
  const [bandaFicha, setBandaFicha] = useState(false);

  const handleSalvarFicha = async () => {
    const ok = await aoSalvar();
    if (!ok) return;
    const algumEstoqueZero = itens.some((i) => {
      const p = produtos.find((x) => x.id === i.componenteProdutoId);
      return p ? p.estoque === 0 : false;
    });
    if (algumEstoqueZero) setBandaFicha(true);
  };

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
        // D5 (Modo Receita): natureza já conhecida do candidato — badge correto
        // no ProducaoTab mesmo antes do re-fetch da ficha
        componenteNatureza: p.natureza,
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
          {rendAtivo
            ? `Componentes por receita · rende ~${formatarQtd(rendNum)} ${unidadePai}`
            : "Componentes por 1 unidade produzida"}
          {itens.length > 0 ? ` · ${itens.length} componente${itens.length > 1 ? "s" : ""}` : ""}
        </p>
      </div>

      {/* Modo Receita (WIRE §3 + emenda 15/10) — WIRE T2: sugestão automática
          (soma dos ingredientes) editável, nunca auto-salva; campo oculto até
          haver 1 componente (estado Empty do WIRE T2). */}
      {itens.length > 0 && (
      <div>
        <label
          className="block text-[#1f2937] text-sm"
          style={{ fontWeight: 600 }}
          htmlFor="ficha-rendimento-lote"
        >
          Essa receita rende
        </label>
        <div className="relative mt-1.5">
          <input
            id="ficha-rendimento-lote"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={rendimento}
            onChange={(e) => {
              editadoManual.current = true;
              onRendimentoChange(e.target.value);
            }}
            placeholder="ex.: 595"
            aria-label="Essa receita rende (quantidade na unidade de estoque do composto)"
            className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-[#efefef] text-[#1f2937] text-sm outline-none focus:border-[#86cb92] focus:ring-2 focus:ring-[#86cb92]/20"
          />
          <span
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#627271] text-xs"
            style={{ fontWeight: 600 }}
            aria-hidden="true"
          >
            {unidadePai}
          </span>
        </div>
        {paiBase !== null && sugestao !== null && (
          <p className="text-[#627271] text-[11px] mt-1" role="status">
            ↳ soma dos ingredientes: {formatarQtd(sugestao)} {unidadePai} — ajuste se a receita reduz
          </p>
        )}
        {paiBase === null && (
          <p className="text-[#627271] text-[11px] mt-1" role="status">
            ↳ essa receita rende 1 {unidadePai} (composto por unidade)
          </p>
        )}
        <p className="text-[#627271] text-[11px] mt-1">
          Obrigatório no composto — é em quanto essa receita rende. Com o valor preenchido as
          quantidades abaixo são por receita e o app converte na gravação (modo receita).
        </p>
      </div>
      )}

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
            <span>{rendAtivo ? "Qtd/receita" : "Qtd/unid."}</span>
            <span>Perda %</span>
            <span aria-hidden="true" />
          </div>

          {itens.map((item) => {
            const qtdInvalida = !(item.quantidadePorUnidade > 0);
            // WIRE T2 item 2 — quantidade na linguagem da receita (o que o
            // campo exibe): por-unidade × rende quando o modo receita está ativo.
            const qtdReceita = rendAtivo
              ? toReceita(item.quantidadePorUnidade, rendNum)
              : item.quantidadePorUnidade;
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
                    {rendAtivo ? "Quantidade (por receita)" : "Quantidade (unidade)"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      /* Modo receita: exibe toReceita arredondado em 2 casas (D4 — exibição
                         não perde precisão: o rascunho grava o float exato por-unidade) */
                      value={
                        rendAtivo
                          ? item.quantidadePorUnidade > 0
                            ? String(Number(toReceita(item.quantidadePorUnidade, rendNum).toFixed(2)))
                            : ""
                          : item.quantidadePorUnidade || ""
                      }
                      onChange={(e) => {
                        const bruto = parseFloat(e.target.value) || 0;
                        atualizar(item.id, {
                          quantidadePorUnidade: rendAtivo ? deReceita(bruto, rendNum) : bruto,
                        });
                      }}
                      placeholder="0"
                      aria-label={`Quantidade de ${item.componenteNome} ${rendAtivo ? "por receita" : "por unidade"}`}
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

                {item.perdaPct > 0 && qtdReceita > 0 && (
                  <p className="text-[11px] text-[#627271] sm:col-span-5" style={{ fontWeight: 500 }} role="note">
                    → por receita c/ perda: {formatarQtd(perdaAplicada(qtdReceita, item.perdaPct))}{" "}
                    {item.componenteUnidade}
                  </p>
                )}
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

      {/* WIRE T2 item 3 — tradução 1 receita → estoque SEMPRE visível; a forma
          por grama (contrato 3) fica RECOLHIDA — default é a linguagem da
          receita (F3/D3), a por-grama é transparência sob demanda. */}
      {rendAtivo && itens.length > 0 && (
        <div className="rounded-xl border border-[#efefef] p-3" role="status">
          <p className="text-[#1f2937] text-xs" style={{ fontWeight: 600 }}>
            tradução: 1 receita → {formatarQtd(rendNum)} {unidadePai} no estoque
          </p>
          <button
            type="button"
            aria-expanded={guardadoAberto}
            onClick={() => setGuardadoAberto((v) => !v)}
            className="mt-1.5 text-[#627271] text-[11px] underline"
            style={{ fontWeight: 600 }}
          >
            ver como fica guardado {guardadoAberto ? "▴" : "▾"}
          </button>
          {guardadoAberto && (
            <div className="mt-1.5 space-y-1">
              {itens
                .filter((i) => i.quantidadePorUnidade > 0)
                .map((i) => (
                  <p key={`guardado-${i.id}`} className="text-[#627271] text-[11px]">
                    1 {unidadePai} = {formatarQtd(i.quantidadePorUnidade)} {i.componenteUnidade} de{" "}
                    {i.componenteNome}
                  </p>
                ))}
            </div>
          )}
        </div>
      )}

      {erro && (
        <p className="text-xs text-red-600" style={{ fontWeight: 500 }}>
          {erro}
        </p>
      )}

      {/* Ações do passo — WIRE T2 item 4: ficha salva com componente em estoque
          0 ganha a banda do próximo passo (compra); senão, comportamento atual. */}
      {bandaFicha ? (
        <FaixaProximoPasso
          titulo="Ficha salva"
          descricao="Há insumos com estoque 0."
          acoes={[{ label: "Próximo: comprar os insumos →", href: "/estoque/compras/nova" }]}
          onClose={() => setBandaFicha(false)}
        />
      ) : (
      <div className="flex flex-wrap items-center gap-2">
        {podeSalvar ? (
          <>
            <button
              type="button"
              onClick={() => void handleSalvarFicha()}
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
      )}
    </div>
  );
}