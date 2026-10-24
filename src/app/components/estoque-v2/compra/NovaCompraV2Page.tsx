/**
 * NovaCompraV2Page — redesign Compro · Faço · Vendo (estoque v2).
 *
 * Wizard de 3 passos portado de `tracking/Redesign_ComproVendoFaco/nova-compra-
 * mobile.html` (mobile: bottom bar com a ação primária) e `nova-compra-desktop.
 * html` (≥900px: duas colunas, resumo sticky à direita). Estrutura/espírito do
 * design; UI em React com as classes `.eq2-*` de `shared/estoque-v2.css`.
 *
 * 1. "O que você comprou?" — busca real de insumos (`use-nova-compra-v2`),
 *    chips das últimas compras, cards selecionáveis e "+ Cadastrar insumo novo"
 *    reaproveitando o ProdutoFormModal (contexto-compra, snapshot via onSuccess).
 *    No topo do passo 1, seletor OPCIONAL "Quem você comprou?" (`me_fornecedor`
 *    ativo, busca + chips de 44px): vazio = placeholder "Sem fornecedor registr."
 *    e o hook mantém o fallback do primeiro ativo; lista vazia oferece o chip
 *    "+ Cadastrar fornecedor" → `/fornecedores/novo` (rascunho preservado no
 *    sessionStorage, fornecedor incluso). O escolhido aparece no header fixo.
 * 2. "Quanto e por quanto?" — um item por vez: quantidade + unidade de compra,
 *    quanto tem em cada uma (fator sugerido por chips), preço total. Recibo da
 *    conta SEMPRE visível + MelissaCard traduzindo a conta em estoque.
 * 3. "Confira" — itens com "+ X no estoque", total e Salvar compra.
 *
 * Regras de dados (SPEC do redesign):
 * - Salvar só com sessão real; sem sessão, botão desabilitado com hint "modo demo".
 * - A compra nasce PENDENTE: NADA muda no estoque aqui — o fluxo de Receber fecha.
 * - Rascunho em sessionStorage 'uniq estoque-v2 nova-compra' (try/catch — storage
 *   corrompido ou modo privado nunca quebra a tela).
 * - Estados visuais sempre: skeleton, empty (Melissa), erro com retry, sucesso.
 * - 360px: nada rola na horizontal; inputs 16px com inputMode decimal.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Minus,
  Package,
  Plus,
  RotateCw,
  Search,
  ShoppingBag,
  TriangleAlert,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";

import "../shared/estoque-v2.css";
import { MelissaCard } from "../shared/MelissaCard";
import { brl, UNIDADES_COMPRA } from "../shared/utils";
import {
  useNovaCompraV2,
  type FornecedorV2,
  type InsumoV2,
} from "../../../hooks/use-nova-compra-v2";
import { useCategorias } from "../../../hooks/use-categorias";
import { ProdutoFormModal, type InsumoRecemCriado } from "../../produto/ProdutoFormModal";

const RASCUNHO_KEY = "uniq estoque-v2 nova-compra";

/* ───────────────────────────── domínio da tela ───────────────────────────── */

interface ItemRascunho {
  produtoId: number;
  nome: string;
  /** unidade de ESTOQUE (g, un, ml…) — sufixo do recibo */
  unidadeBase: string;
  /** unidade de COMPRA escolhida (lata, caixa, kg…) */
  unidadeCompra: string;
  /** strings cruas: o input aceita "5,49" e vírgula sem briga de parseFloat */
  qtd: string;
  porUnidade: string;
  precoTotal: string;
  /** sem unidade_compra/fator no cadastro → valor padrão chipado "estimado" */
  estimado: boolean;
}

interface Rascunho {
  step: number;
  itens: ItemRascunho[];
  /** fornecedor do passo 1 — opcional (null = fallback "primeiro ativo" do hook) */
  fornecedorId: string | null;
  /** nome guardado para o header/card sobreviver ao reload antes da lista voltar */
  fornecedorNome: string;
}

/* ───────────────────────────── formatação (pt-BR) ────────────────────────── */

function parseNum(s: string | null | undefined): number {
  const t = (s ?? "").trim();
  if (!t) return 0;
  const norm = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = parseFloat(norm);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function fmtQtd(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

function fmtMoeda(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 395 g · 1,185 kg · 24 un (base g/ml ≥ 1000 vira kg/l, como no design) */
function fmtPer(v: number, base: string): string {
  if ((base === "g" || base === "ml") && v >= 1000) {
    const alt = base === "g" ? "kg" : "l";
    return `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${alt}`;
  }
  return `${fmtQtd(v)} ${base}`;
}

/** custo por base: R$ 0,0139/g (4 casas) ou R$ 1,20/un (2 casas) */
function fmtRate(v: number, base: string): string {
  const dec = v >= 0.1 ? 2 : 4;
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec })}/${base}`;
}

const PLURAIS: Record<string, string> = {
  lata: "latas",
  pacote: "pacotes",
  caixa: "caixas",
  saco: "sacos",
  fardo: "fardos",
  dúzia: "dúzias",
  unidade: "unidades",
};

function pluralUnidade(u: string, q: number): string {
  if (q > 1 && PLURAIS[u]) return PLURAIS[u];
  return u;
}

function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** padrão do cadastro: sem unidade_compra/fator no insumo → 1 na unidade do estoque + chip "estimado" */
function itemDeInsumo(p: InsumoV2): ItemRascunho {
  const temFator = p.fatorConversao != null && p.fatorConversao > 0;
  return {
    produtoId: p.id,
    nome: p.nome,
    unidadeBase: p.unidade,
    unidadeCompra: p.unidadeCompra || p.unidade || "un",
    qtd: "1",
    porUnidade: temFator ? fmtQtd(p.fatorConversao as number) : "1",
    precoTotal: p.ultimoPrecoCompra && p.ultimoPrecoCompra > 0 ? fmtMoeda(p.ultimoPrecoCompra) : "",
    estimado: !temFator,
  };
}

/* ───────────────────────────── rascunho (sessionStorage) ─────────────────── */

/** Rascunhos antigos (pré-seletor) não têm fornecedor — tolera ausência. */
function lerFornecedorRascunho(parsed: Partial<Rascunho> | null): {
  fornecedorId: string | null;
  fornecedorNome: string;
} {
  const id = typeof parsed?.fornecedorId === "string" && parsed.fornecedorId ? parsed.fornecedorId : null;
  const nome = typeof parsed?.fornecedorNome === "string" ? parsed.fornecedorNome : "";
  return id ? { fornecedorId: id, fornecedorNome: nome } : { fornecedorId: null, fornecedorNome: "" };
}

function lerRascunho(): Rascunho {
  try {
    const raw = sessionStorage.getItem(RASCUNHO_KEY);
    if (!raw) return { step: 1, itens: [], fornecedorId: null, fornecedorNome: "" };
    const parsed = JSON.parse(raw) as Partial<Rascunho>;
    const forn = lerFornecedorRascunho(parsed || null);
    if (
      !parsed ||
      !Array.isArray(parsed.itens) ||
      !parsed.itens.every(
        (i) =>
          i &&
          typeof i.produtoId === "number" &&
          typeof i.nome === "string" &&
          typeof i.unidadeBase === "string" &&
          typeof i.unidadeCompra === "string" &&
          typeof i.qtd === "string" &&
          typeof i.porUnidade === "string" &&
          typeof i.precoTotal === "string" &&
          typeof i.estimado === "boolean"
      )
    ) {
      return { step: 1, itens: [], ...forn };
    }
    const itens = parsed.itens as ItemRascunho[];
    const step =
      typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 3 ? parsed.step : 1;
    // consistência mínima: passo 2/3 sem item nenhum volta ao 1
    return itens.length === 0 ? { step: 1, itens, ...forn } : { step, itens, ...forn };
  } catch {
    return { step: 1, itens: [], fornecedorId: null, fornecedorNome: "" };
  }
}

function gravarRascunho(r: Rascunho): void {
  try {
    sessionStorage.setItem(RASCUNHO_KEY, JSON.stringify(r));
  } catch {
    /* modo privado/storage cheio: rascunho é conforto, nunca quebra a tela */
  }
}

function limparRascunho(): void {
  try {
    sessionStorage.removeItem(RASCUNHO_KEY);
  } catch {
    /* idem */
  }
}

/* ───────────────────────────── responsivo ────────────────────────────────── */

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const on = () => setDesktop(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}

const PASSOS = ["Insumos", "Quantidades", "Conferir"];

/* ───────────────────────────────── página ────────────────────────────────── */

export default function NovaCompraV2Page() {
  const navigate = useNavigate();
  const {
    insumos,
    ultimasCompras,
    fornecedores,
    fornecedoresLoading,
    fornecedoresError,
    loading,
    error,
    temSessao,
    salvando,
    recarregar,
    salvarCompra,
  } = useNovaCompraV2();
  const { categorias } = useCategorias();
  const isDesktop = useIsDesktop();

  const inicial = useMemo(lerRascunho, []);
  const [step, setStep] = useState<number>(inicial.step);
  const [itens, setItens] = useState<ItemRascunho[]>(inicial.itens);
  const [busca, setBusca] = useState("");
  const [fornecedorId, setFornecedorId] = useState<string | null>(inicial.fornecedorId);
  const [fornecedorNome, setFornecedorNome] = useState<string>(inicial.fornecedorNome);
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [trocandoFornecedor, setTrocandoFornecedor] = useState(false);
  const [idx, setIdx] = useState(0);
  const [erro1, setErro1] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeInicial, setNomeInicial] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // rascunho: toda mudança vai para sessionStorage (try/catch dentro do helper)
  useEffect(() => {
    if (!salvo) gravarRascunho({ step, itens, fornecedorId, fornecedorNome });
  }, [step, itens, salvo, fornecedorId, fornecedorNome]);

  // consistência: passos 2/3 sem item nenhum (rascunho corrompido, item
  // removido no 1) caem de volta no passo 1 — nunca um passo vazio
  useEffect(() => {
    if (!salvo && step > 1 && itens.length === 0) setStep(1);
  }, [step, itens.length, salvo]);

  /* ── derivados ── */
  const q = normalizar(busca.trim());
  const listaFiltrada = useMemo(
    () => (q ? insumos.filter((p) => normalizar(p.nome).includes(q)) : insumos),
    [insumos, q]
  );
  // chips das últimas compras só fazem sentido para insumos que ainda existem
  const chipsUltimas = useMemo(() => {
    const existentes = new Set(insumos.map((p) => p.id));
    const vistos = new Set<number>();
    return ultimasCompras.filter((c) => {
      if (!existentes.has(c.produtoId) || vistos.has(c.produtoId)) return false;
      vistos.add(c.produtoId);
      return true;
    });
  }, [ultimasCompras, insumos]);

  // seletor "Quem você comprou?" — busca sem acento, mesma trilha dos insumos
  const qFornecedor = normalizar(buscaFornecedor.trim());
  const fornecedoresFiltrados = useMemo(
    () =>
      qFornecedor ? fornecedores.filter((f) => normalizar(f.nome).includes(qFornecedor)) : fornecedores,
    [fornecedores, qFornecedor]
  );

  const escolherFornecedor = (f: FornecedorV2) => {
    setFornecedorId(f.id);
    setFornecedorNome(f.nome);
    setBuscaFornecedor("");
    setTrocandoFornecedor(false);
  };

  const removerFornecedor = () => {
    setFornecedorId(null);
    setFornecedorNome("");
    setBuscaFornecedor("");
    setTrocandoFornecedor(false);
  };

  const totalCompra = useMemo(
    () => itens.reduce((s, i) => s + parseNum(i.precoTotal), 0),
    [itens]
  );
  const itemAtual = itens[Math.min(idx, Math.max(itens.length - 1, 0))];
  const insumoAtual = itemAtual ? insumos.find((p) => p.id === itemAtual.produtoId) ?? null : null;

  /* ── navegação ── */
  const irPara = (n: number) => {
    setStep(n);
    if (n === 2) setIdx((i) => Math.min(i, Math.max(itens.length - 1, 0)));
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  };

  const voltarHeader = () => {
    if (salvo) {
      navigate("/estoque/compras");
      return;
    }
    if (step > 1) irPara(step - 1);
    else navigate("/estoque/compras");
  };

  /* ── seleção (passo 1) ── */
  const toggleInsumo = (p: InsumoV2) => {
    setErro1(false);
    setItens((prev) => {
      const tem = prev.some((i) => i.produtoId === p.id);
      return tem ? prev.filter((i) => i.produtoId !== p.id) : [...prev, itemDeInsumo(p)];
    });
  };

  const patchItem = (produtoId: number, patch: Partial<ItemRascunho>) => {
    setItens((prev) => prev.map((i) => (i.produtoId === produtoId ? { ...i, ...patch } : i)));
  };

  /* ── cadastrar insumo novo (ProdutoFormModal reaproveitado) ── */
  const abrirCadastro = (termo: string) => {
    setNomeInicial(termo);
    setModalAberto(true);
  };

  const aoCriarInsumo = (insumoCriado: InsumoRecemCriado | undefined) => {
    setModalAberto(false);
    setBusca("");
    recarregar();
    if (!insumoCriado) return;
    // snapshot → item no carrinho, mesma trilha do modal em contexto-compra (N8)
    setItens((prev) => {
      if (prev.some((i) => i.produtoId === insumoCriado.id)) return prev;
      const temFator = insumoCriado.fator != null && insumoCriado.fator > 0;
      return [
        ...prev,
        {
          produtoId: insumoCriado.id,
          nome: insumoCriado.nome.trim() || "Insumo sem nome",
          unidadeBase: insumoCriado.unidade || "un",
          unidadeCompra: insumoCriado.unidadeCompra || insumoCriado.unidade || "un",
          qtd: "1",
          porUnidade: temFator ? fmtQtd(insumoCriado.fator as number) : "1",
          precoTotal: "",
          estimado: !temFator,
        },
      ];
    });
    toast.success(`${insumoCriado.nome} cadastrado`);
  };

  /* ── passo a passo das ações ── */
  const continuar1 = () => {
    if (itens.length === 0) {
      setErro1(true);
      return;
    }
    setIdx(0);
    irPara(2);
  };

  const continuar2 = () => {
    if (itens.length === 0) {
      irPara(1);
      return;
    }
    if (idx < itens.length - 1) {
      setIdx(idx + 1);
      window.scrollTo({ top: 0 });
    } else {
      irPara(3);
    }
  };

  const salvar = async () => {
    const payload = itens
      .map((i) => {
        const quantidade = parseNum(i.qtd);
        const total = parseNum(i.precoTotal);
        return {
          produtoId: i.produtoId,
          quantidade,
          // preço total ÷ quantidade → valor_unitario na unidade de compra
          valorUnitario: quantidade > 0 ? Math.round((total / quantidade) * 10000) / 10000 : 0,
        };
      })
      .filter((p) => p.quantidade > 0);

    if (payload.length === 0) {
      toast.error("Preencha a quantidade dos itens antes de salvar.");
      return;
    }

    // fornecedorId null → o hook aplica o fallback (primeiro ativo); não bloqueia
    const r = await salvarCompra(payload, fornecedorId);
    if (r.success) {
      setSalvo(true);
      limparRascunho();
      toast.success("Compra registrada. Ela entra no estoque quando for recebida.");
    } else {
      toast.error(r.error || "Erro ao salvar a compra.");
    }
  };

  const novaCompra = () => {
    setItens([]);
    setIdx(0);
    setSalvo(false);
    setErro1(false);
    removerFornecedor();
    limparRascunho();
    irPara(1);
  };

  /* ── recibo do item atual (passo 2) ── */
  const recibo = (() => {
    if (!itemAtual) return null;
    const qtdN = parseNum(itemAtual.qtd);
    const perN = parseNum(itemAtual.porUnidade);
    const precoN = parseNum(itemAtual.precoTotal);
    const base = itemAtual.unidadeBase;
    const entrou = qtdN * perN;
    const linha1 =
      qtdN > 0 && perN > 0
        ? `${fmtQtd(qtdN)} ${pluralUnidade(itemAtual.unidadeCompra, qtdN)} × ${fmtPer(perN, base)} = ${fmtPer(entrou, base)}`
        : null;
    const linha2 =
      qtdN > 0 && perN > 0 && precoN > 0
        ? `${brl(precoN)} ÷ ${fmtPer(entrou, base)} = ${fmtRate(precoN / entrou, base)}`
        : null;
    return { qtdN, perN, precoN, entrou, base, linha1, linha2 };
  })();

  const msgMelissa = (() => {
    if (!recibo) return "";
    if (!recibo.linha1) {
      return "Estou esperando as medidas — quantas unidades e quanto tem em cada uma — pra calcular o custo.";
    }
    const entrouTxt = `${fmtQtd(recibo.qtdN)} ${pluralUnidade(itemAtual!.unidadeCompra, recibo.qtdN)}`;
    if (!recibo.linha2) {
      return `Você comprou ${entrouTxt} → entram ${fmtPer(recibo.entrou, recibo.base)} no estoque. Agora me diz o preço total pra eu achar o custo.`;
    }
    const custoUnit = recibo.precoN / recibo.entrou;
    const porBase =
      recibo.base === "g" || recibo.base === "ml"
        ? `${brl(custoUnit * 1000)} por ${recibo.base === "g" ? "quilo" : "litro"}`
        : `${brl(custoUnit)} por ${recibo.base}`;
    return `Você comprou ${entrouTxt} → entram ${fmtPer(recibo.entrou, recibo.base)} no estoque. Isso deu ${porBase}.`;
  })();

  /* ── opções de unidade do item atual (catálogo + valor fora dele) ── */
  const unidadeOptions = useMemo(() => {
    const atual = itemAtual?.unidadeCompra ?? "";
    const siglas = UNIDADES_COMPRA.map((u) => u.sigla);
    return atual && !siglas.includes(atual) ? [atual, ...siglas] : siglas;
  }, [itemAtual]);

  /* ── sugestões de fator (chips do "quanto tem em cada uma") ── */
  const sugestoesFator = useMemo(() => {
    if (!itemAtual) return [];
    const base = itemAtual.unidadeBase;
    const fatorInsumo = insumoAtual?.fatorConversao ?? null;
    const atual = parseNum(itemAtual.porUnidade);
    const vals: number[] = [];
    if (fatorInsumo && fatorInsumo > 0) vals.push(fatorInsumo);
    else if (atual > 0) vals.push(atual);
    if (base === "g" || base === "ml") vals.push(395, 200, 1000);
    else vals.push(1, 12);
    const vistos = new Set<number>();
    return vals.filter((v) => (vistos.has(v) ? false : (vistos.add(v), true))).slice(0, 4);
  }, [itemAtual, insumoAtual]);

  const mudarUnidadeCompra = (sigla: string) => {
    if (!itemAtual) return;
    // unidades com valor sabido por definição (medida/contagem) não são "estimadas";
    // lata/caixa/pacote/saco/fardo só têm conteúdo conhecido no cadastro do insumo
    const PADRAO: Record<string, string> = { kg: "1000", l: "1000", g: "1", ml: "1", un: "1", "dúzia": "12" };
    const insumoTemNaMedida =
      insumoAtual?.unidadeCompra === sigla && (insumoAtual?.fatorConversao ?? 0) > 0;
    const porUnidade = insumoTemNaMedida
      ? fmtQtd(insumoAtual?.fatorConversao ?? 1)
      : PADRAO[sigla] ?? itemAtual.porUnidade;
    patchItem(itemAtual.produtoId, {
      unidadeCompra: sigla,
      porUnidade,
      estimado: !(insumoTemNaMedida || sigla in PADRAO),
    });
  };

  /* ── resumo (coluna sticky desktop + hint da bottom bar mobile) ── */
  const resumoLinhas = itens.map((i) => ({
    nome: i.nome,
    valor: parseNum(i.precoTotal),
  }));

  /* ── ações por passo (compartilhadas: bottom bar mobile / inline desktop) ── */
  const renderAcoes = (emBarra: boolean) => {
    const primario = "eq2-btn eq2-btn--primary";
    const secundario = "eq2-btn eq2-btn--secondary";
    const largura = emBarra ? { width: "100%" } : undefined;

    if (step === 1) {
      return (
        <button type="button" className={primario} style={largura} onClick={continuar1} aria-disabled={itens.length === 0}>
          <span>Continuar</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      );
    }
    if (step === 2) {
      return (
        <>
          <button type="button" className={secundario} onClick={() => irPara(1)}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Voltar</span>
          </button>
          <button
            type="button"
            className={primario}
            style={emBarra ? { flex: 1 } : undefined}
            onClick={continuar2}
          >
            <span>{idx < itens.length - 1 ? "Próximo item" : "Conferir"}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </>
      );
    }
    // passo 3
    if (salvo) {
      return (
        <>
          <button type="button" className={secundario} onClick={novaCompra}>
            <Plus size={16} aria-hidden="true" />
            <span>Nova compra</span>
          </button>
          <button type="button" className={primario} style={emBarra ? { flex: 1 } : undefined} onClick={() => navigate("/estoque/compras")}>
            <span>Ver compras</span>
          </button>
        </>
      );
    }
    return (
      <button
        type="button"
        className={primario}
        style={largura}
        disabled={!temSessao || salvando || itens.length === 0}
        onClick={salvar}
      >
        {salvando ? <RotateCw size={16} className="eq2-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
        <span>{salvando ? "Salvando…" : "Salvar compra"}</span>
      </button>
    );
  };

  /* ── hint das barras ── */
  const hintEsq =
    step === 1
      ? itens.length === 0
        ? "Nada selecionado ainda"
        : `${itens.length} ${itens.length === 1 ? "insumo selecionado" : "insumos selecionados"}`
      : step === 2
        ? `Item ${Math.min(idx + 1, itens.length)} de ${itens.length}`
        : `${itens.length} ${itens.length === 1 ? "item" : "itens"} · total ${brl(totalCompra)}`;

  const hintDir =
    step === 1
      ? itens.length === 0
        ? "Toque nos cards para marcar"
        : "Toque de novo para desmarcar"
      : step === 2
        ? "Preencha e continue"
        : salvo
          ? "Estoque muda quando a compra for recebida"
          : temSessao
            ? "O estoque só muda quando você salvar"
            : "modo demo — entre na sua conta para salvar";

  /* ── conteúdo dos passos ── */
  const passo1 = (
    <section aria-label="Passo 1 — o que você comprou">
      <h2 className="eq2-bar__title" style={{ fontSize: 22, margin: "12px 0 4px" }} tabIndex={-1} ref={headingRef}>
        O que você comprou?
      </h2>
      <p style={{ fontSize: 13, color: "var(--eq2-muted)", margin: "0 0 14px" }}>
        Toque nos insumos que entraram nesta compra. Você escolhe as quantidades depois.
      </p>

      {/* ── Quem você comprou? — fornecedor OPCIONAL (mini-sheet acima da lista).
          Em branco o hook usa o fallback "primeiro ativo"; sem cadastro, o chip
          leva para /fornecedores/novo com o rascunho já preservado. ── */}
      <div style={{ marginBottom: 16 }}>
        {fornecedorId && fornecedorNome && !trocandoFornecedor ? (
          <div className="eq2-card eq2-card--static" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="eq2-card__icon" style={{ display: "flex" }}>
              <Truck size={18} aria-hidden="true" />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                className="eq2-card__name"
                style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {fornecedorNome}
              </span>
              <span className="eq2-card__meta" style={{ display: "block" }}>fornecedor desta compra</span>
            </span>
            <button type="button" className="eq2-btn eq2-btn--link" style={{ flex: "none" }} onClick={() => setTrocandoFornecedor(true)}>
              Trocar
            </button>
            <button type="button" className="eq2-back" aria-label="Remover fornecedor da compra" onClick={removerFornecedor} style={{ flex: "none" }}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <label className="eq2-label" htmlFor="busca-fornecedor-v2">Quem você comprou?</label>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                aria-hidden="true"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--eq2-muted)" }}
              />
              <input
                id="busca-fornecedor-v2"
                type="search"
                className="eq2-input"
                style={{ paddingLeft: 36 }}
                placeholder="Sem fornecedor registr."
                aria-label="Buscar fornecedor"
                autoComplete="off"
                value={buscaFornecedor}
                onChange={(e) => setBuscaFornecedor(e.target.value)}
              />
            </div>
            <p style={{ fontSize: 11, color: "var(--eq2-muted)", margin: "6px 0 0" }}>
              Opcional — se deixar em branco, nada impede de salvar a compra.
            </p>

            {fornecedoresLoading && fornecedores.length === 0 ? (
              /* skeleton do seletor */
              <div className="eq2-chips" style={{ marginTop: 8 }} aria-hidden="true">
                <div className="eq2-skeleton" style={{ height: 44, width: 132, borderRadius: 999 }} />
                <div className="eq2-skeleton" style={{ height: 44, width: 104, borderRadius: 999 }} />
              </div>
            ) : fornecedoresError && fornecedores.length === 0 ? (
              /* erro degradado: o campo é opcional, a tela continua viva */
              <p role="status" style={{ fontSize: 12, color: "var(--eq2-warn)", margin: "8px 0 0", fontWeight: 600 }}>
                Não conseguimos listar seus fornecedores agora — dá pra escolher os insumos e salvar mesmo assim.
              </p>
            ) : fornecedores.length === 0 ? (
              /* vazio: cadastrar na hora (rascunho já está no sessionStorage) */
              <div className="eq2-chips" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="eq2-chip"
                  style={{ minHeight: 44, maxWidth: "100%", borderStyle: "dashed", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
                  onClick={() => navigate("/fornecedores/novo")}
                >
                  <Plus size={14} aria-hidden="true" />
                  <span>Cadastrar fornecedor</span>
                </button>
              </div>
            ) : (
              <div className="eq2-chips" style={{ marginTop: 8 }} role="group" aria-label="Escolher fornecedor">
                {fornecedoresFiltrados.slice(0, 12).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`eq2-chip${f.id === fornecedorId ? " is-active" : ""}`}
                    style={{ minHeight: 44, maxWidth: "100%", display: "inline-flex", alignItems: "center", gap: 6 }}
                    onClick={() => escolherFornecedor(f)}
                  >
                    <Truck size={14} aria-hidden="true" />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                      {f.nome}
                    </span>
                  </button>
                ))}
                {fornecedoresFiltrados.length === 0 ? (
                  <button
                    type="button"
                    className="eq2-chip"
                    style={{ minHeight: 44, maxWidth: "100%", borderStyle: "dashed", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
                    onClick={() => navigate("/fornecedores/novo")}
                  >
                    <Plus size={14} aria-hidden="true" />
                    <span>Cadastrar fornecedor</span>
                  </button>
                ) : (
                  fornecedoresFiltrados.length > 12 && (
                    <span style={{ fontSize: 11, color: "var(--eq2-muted)", alignSelf: "center" }}>
                      +{fornecedoresFiltrados.length - 12} fornecedores — busque pelo nome
                    </span>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* busca */}
      <div style={{ position: "relative" }}>
        <Search
          size={16}
          aria-hidden="true"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--eq2-muted)" }}
        />
        <input
          type="search"
          className="eq2-input"
          style={{ paddingLeft: 36 }}
          placeholder="Buscar insumo…"
          aria-label="Buscar insumo"
          autoComplete="off"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        /* skeleton de carregamento */
        <div className="eq2-list" style={{ marginTop: 14 }} aria-hidden="true">
          <div className="eq2-skeleton" style={{ height: 30, width: 220 }} />
          <div className="eq2-skeleton" style={{ height: 74 }} />
          <div className="eq2-skeleton" style={{ height: 74 }} />
          <div className="eq2-skeleton" style={{ height: 74 }} />
        </div>
      ) : error ? (
        /* erro com retry — o rascunho continua vivo */
        <div className="eq2-state" role="alert">
          <TriangleAlert size={40} style={{ color: "var(--eq2-danger)" }} aria-hidden="true" />
          <p className="eq2-state__title">Não foi possível carregar</p>
          <p style={{ fontSize: 13 }}>Sua conexão caiu no meio do caminho. Nada foi perdido: o rascunho continua salvo.</p>
          <button type="button" className="eq2-btn eq2-btn--secondary" onClick={recarregar}>
            <RotateCw size={16} aria-hidden="true" />
            <span>Tentar de novo</span>
          </button>
        </div>
      ) : insumos.length === 0 ? (
        /* vazio: Melissa fala primeiro */
        <div style={{ marginTop: 14 }}>
          <MelissaCard
            msg="Cadastre o primeiro insumo. Eu cuido da conversão pra você — lata vira grama, dúzia vira unidade."
            actionLabel="Cadastrar insumo"
            onAction={() => abrirCadastro(busca.trim())}
          />
        </div>
      ) : (
        <>
          {chipsUltimas.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <p className="eq2-section-title" id="titulo-ultimas-v2">Últimas compras</p>
              <div className="eq2-chips" role="group" aria-labelledby="titulo-ultimas-v2">
                {chipsUltimas.map((c) => {
                  const ativo = itens.some((i) => i.produtoId === c.produtoId);
                  return (
                    <button
                      key={c.produtoId}
                      type="button"
                      className={`eq2-chip${ativo ? " is-active" : ""}`}
                      aria-pressed={ativo}
                      onClick={() => {
                        const p = insumos.find((x) => x.id === c.produtoId);
                        if (p) toggleInsumo(p);
                      }}
                    >
                      {c.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="eq2-section-title">Todos os insumos ({insumos.length})</p>
          <div className="eq2-list">
            {listaFiltrada.map((p) => {
              const sel = itens.some((i) => i.produtoId === p.id);
              const descricao =
                p.unidadeCompra && p.fatorConversao && p.fatorConversao > 0
                  ? `${p.unidadeCompra} · ${fmtPer(p.fatorConversao, p.unidade)}`
                  : p.unidadeCompra || p.unidade;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="switch"
                  aria-pressed={sel}
                  className="eq2-card"
                  onClick={() => toggleInsumo(p)}
                  style={
                    sel
                      ? { borderColor: "var(--eq2-ink)", background: "#f4f7f5", boxShadow: "0 1px 4px rgba(31,41,55,0.12)" }
                      : undefined
                  }
                >
                  <span className="eq2-card__top" style={{ display: "flex" }}>
                    <span className="eq2-card__icon" style={{ display: "flex" }}>
                      <Package size={18} aria-hidden="true" />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="eq2-card__name" style={{ display: "block" }}>{p.nome}</span>
                      <span className="eq2-card__meta" style={{ display: "block" }}>{descricao}</span>
                    </span>
                    <span style={{ textAlign: "right", flex: "none" }}>
                      <span className="eq2-card__price" style={{ display: "block" }}>
                        {p.ultimoPrecoCompra && p.ultimoPrecoCompra > 0 ? brl(p.ultimoPrecoCompra) : null}
                      </span>
                      {sel && <Check size={16} style={{ color: "var(--eq2-accent)" }} aria-hidden="true" />}
                      {!p.ultimoPrecoCompra && (
                        <span style={{ fontSize: 11, color: "var(--eq2-muted)" }}>preço a definir</span>
                      )}
                    </span>
                  </span>
                  <span className="eq2-card__rows" style={{ display: "flex" }}>
                    <span>
                      {fmtPer(p.estoqueAtual, p.unidade)} em estoque
                      {p.estoqueAtual === 0 ? " · zerado" : ""}
                    </span>
                    <span>
                      {p.ultimoPrecoCompra && p.ultimoPrecoCompra > 0 ? "última compra" : "ainda sem compra"}
                    </span>
                  </span>
                </button>
              );
            })}

            {listaFiltrada.length === 0 && (
              <div className="eq2-state" style={{ padding: "24px 12px" }}>
                <p style={{ fontSize: 13 }}>Nada encontrado para “{busca.trim()}”.</p>
                <button type="button" className="eq2-btn eq2-btn--link" onClick={() => abrirCadastro(busca.trim())}>
                  Cadastrar esse insumo novo
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="eq2-btn eq2-btn--secondary eq2-btn--block"
            style={{ marginTop: 14, borderStyle: "dashed" }}
            onClick={() => abrirCadastro(busca.trim())}
          >
            <Plus size={18} aria-hidden="true" />
            <span>Cadastrar insumo novo</span>
          </button>
        </>
      )}
    </section>
  );

  const passo2 = itemAtual && (
    <section aria-label="Passo 2 — quanto e por quanto">
      {/* navegação entre itens */}
      <nav className="item-nav" aria-label="Navegar entre os itens da compra" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <button
          type="button"
          className="eq2-back"
          aria-label="Item anterior"
          disabled={idx === 0}
          style={idx === 0 ? { opacity: 0.35, pointerEvents: "none" } : undefined}
          onClick={() => {
            setIdx((i) => Math.max(0, i - 1));
            window.scrollTo({ top: 0 });
          }}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <p style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--eq2-muted)" }}>
          Item {idx + 1} de {itens.length}
        </p>
        <button
          type="button"
          className="eq2-back"
          aria-label="Próximo item"
          disabled={idx === itens.length - 1}
          style={idx === itens.length - 1 ? { opacity: 0.35, pointerEvents: "none" } : undefined}
          onClick={() => {
            setIdx((i) => Math.min(itens.length - 1, i + 1));
            window.scrollTo({ top: 0 });
          }}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </nav>

      <h2 className="eq2-bar__title" style={{ fontSize: 22, margin: "4px 0 12px" }} tabIndex={-1} ref={headingRef}>
        Quanto e por quanto?
      </h2>

      {/* hero do item */}
      <div className="eq2-card eq2-card--static" style={{ display: "flex" }}>
        <span className="eq2-card__icon" style={{ display: "flex" }}>
          <ShoppingBag size={18} aria-hidden="true" />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="eq2-card__name" style={{ display: "block" }}>{itemAtual.nome}</span>
          <span className="eq2-card__meta" style={{ display: "block" }}>
            {insumoAtual ? `${fmtPer(insumoAtual.estoqueAtual, insumoAtual.unidade)} em estoque` : "item do rascunho"}
          </span>
        </span>
        {itemAtual.estimado && (
          <span className="eq2-badge eq2-badge--estimado" style={{ alignSelf: "center", flex: "none" }}>estimado</span>
        )}
      </div>

      {/* Quantas você comprou? */}
      <div style={{ marginTop: 14 }}>
        <label className="eq2-label" htmlFor={`qtd-v2-${itemAtual.produtoId}`}>Quantas você comprou?</label>
        <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 4, alignItems: "center" }}>
            <button
              type="button"
              className="eq2-back"
              aria-label="Diminuir quantidade"
              style={{ flex: "none" }}
              onClick={() => patchItem(itemAtual.produtoId, { qtd: String(Math.max(1, Math.round(parseNum(itemAtual.qtd)) - 1)) })}
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <input
              id={`qtd-v2-${itemAtual.produtoId}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="eq2-input"
              style={{ textAlign: "center" }}
              value={itemAtual.qtd}
              onChange={(e) => patchItem(itemAtual.produtoId, { qtd: e.target.value })}
              aria-label={`Quantidade de ${itemAtual.nome}`}
            />
            <button
              type="button"
              className="eq2-back"
              aria-label="Aumentar quantidade"
              style={{ flex: "none" }}
              onClick={() => patchItem(itemAtual.produtoId, { qtd: String(Math.max(1, Math.round(parseNum(itemAtual.qtd) || 0) + 1)) })}
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
          <select
            className="eq2-select"
            style={{ width: "auto", flex: "none", minWidth: 96 }}
            aria-label={`Unidade de compra de ${itemAtual.nome}`}
            value={itemAtual.unidadeCompra}
            onChange={(e) => mudarUnidadeCompra(e.target.value)}
          >
            {unidadeOptions.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quanto tem em cada uma? */}
      <div style={{ marginTop: 14 }}>
        <label className="eq2-label" htmlFor={`por-v2-${itemAtual.produtoId}`}>Quanto tem em cada uma?</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            id={`por-v2-${itemAtual.produtoId}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className="eq2-input"
            style={{ flex: 1, minWidth: 0 }}
            value={itemAtual.porUnidade}
            onChange={(e) => patchItem(itemAtual.produtoId, { porUnidade: e.target.value, estimado: false })}
            aria-label={`Quantos ${itemAtual.unidadeBase} tem em 1 ${itemAtual.unidadeCompra}`}
            placeholder="Ex.: 395"
          />
          <span style={{ fontSize: 13, color: "var(--eq2-muted)", flex: "none" }}>{itemAtual.unidadeBase}</span>
        </div>
        {sugestoesFator.length > 0 && (
          <div className="eq2-chips" style={{ marginTop: 8 }} role="group" aria-label="Sugestões rápidas">
            {sugestoesFator.map((v) => (
              <button
                key={v}
                type="button"
                className={`eq2-chip${parseNum(itemAtual.porUnidade) === v ? " is-active" : ""}`}
                onClick={() => patchItem(itemAtual.produtoId, { porUnidade: fmtQtd(v), estimado: false })}
              >
                {fmtPer(v, itemAtual.unidadeBase)}
              </button>
            ))}
          </div>
        )}
        {itemAtual.estimado && (
          <p style={{ fontSize: 11, color: "var(--eq2-muted)", marginTop: 6 }}>
            Este insumo ainda não tem conversão cadastrada — usei um valor estimado. Ajuste aqui se for diferente.
          </p>
        )}
      </div>

      {/* Preço total */}
      <div style={{ marginTop: 14 }}>
        <label className="eq2-label" htmlFor={`preco-v2-${itemAtual.produtoId}`}>Preço total</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--eq2-muted)", flex: "none" }}>R$</span>
          <input
            id={`preco-v2-${itemAtual.produtoId}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className="eq2-input"
            style={{ flex: 1, minWidth: 0 }}
            value={itemAtual.precoTotal}
            onChange={(e) => patchItem(itemAtual.produtoId, { precoTotal: e.target.value })}
            placeholder="0,00"
            aria-label={`Preço total pago em ${itemAtual.nome}`}
          />
        </div>
        <p style={{ fontSize: 11, color: "var(--eq2-muted)", marginTop: 6 }}>
          Quanto você pagou no total, somando todas as unidades.
        </p>
      </div>

      {/* Recibo — sempre visível */}
      <div className="eq2-receipt" style={{ marginTop: 16 }} aria-live="polite">
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Recibo da conta
        </div>
        <div>
          {recibo?.linha1 ? <strong>{recibo.linha1}</strong> : "Me diz quantos você comprou e quanto tem em cada um."}
        </div>
        <div>
          {recibo?.linha1 && recibo?.linha2 ? (
            <>
              {recibo.linha2.split(" = ")[0]} = <strong>{recibo.linha2.split(" = ")[1]}</strong>
            </>
          ) : recibo?.linha1 ? (
            "Me diz o preço total pra eu fechar a conta."
          ) : (
            "Sem as medidas, eu não consigo fechar a conta."
          )}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <MelissaCard msg={msgMelissa} />
      </div>

      {/* ações inline no desktop (mobile vive na bottom bar) */}
      {isDesktop && (
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          {renderAcoes(false)}
        </div>
      )}
    </section>
  );

  const passo3 = (
    <section aria-label="Passo 3 — conferir">
      <h2 className="eq2-bar__title" style={{ fontSize: 22, margin: "12px 0 4px" }} tabIndex={-1} ref={headingRef}>
        Confira
      </h2>
      <p style={{ fontSize: 13, color: "var(--eq2-muted)", margin: "0 0 14px" }}>
        Dá uma olhada antes de salvar. Nada muda no estoque até você tocar em “Salvar compra”.
      </p>

      {salvo && (
        <div className="eq2-card eq2-card--static" style={{ display: "flex", borderColor: "var(--eq2-accent)", gap: 10, marginBottom: 14 }}>
          <span className="eq2-card__icon" style={{ background: "#e9f6ec", display: "flex", color: "#2e7d43" }}>
            <ClipboardCheck size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="eq2-card__name" style={{ display: "block" }}>Compra salva!</span>
            <span className="eq2-card__meta" style={{ display: "block" }}>
              Compra registrada. Ela entra no estoque quando for recebida.
            </span>
          </span>
        </div>
      )}

      <div className="eq2-list">
        {itens.map((i) => {
          const qtdN = parseNum(i.qtd);
          const perN = parseNum(i.porUnidade);
          const precoN = parseNum(i.precoTotal);
          const entrou = qtdN * perN;
          const custo = entrou > 0 ? precoN / entrou : 0;
          return (
            <div key={i.produtoId} className="eq2-card eq2-card--static">
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                <span className="eq2-card__name" style={{ display: "block" }}>{i.nome}</span>
                <span className="eq2-card__price">{precoN > 0 ? brl(precoN) : "preço a definir"}</span>
              </span>
              <span className="eq2-card__meta" style={{ display: "block", marginTop: 4 }}>
                {qtdN > 0 ? `${fmtQtd(qtdN)} ${pluralUnidade(i.unidadeCompra, qtdN)} de ${fmtPer(perN, i.unidadeBase)}` : "sem quantidade"}
                {custo > 0 ? ` · ${fmtRate(custo, i.unidadeBase)}` : ""}
                {i.estimado ? " · estimado" : ""}
              </span>
              {entrou > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "#e9f6ec",
                    border: "1px solid #bfe3c8",
                    color: "#2e7d43",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <TrendingUp size={13} aria-hidden="true" />
                  <span>+ {fmtPer(entrou, i.unidadeBase)} no estoque</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* total */}
      <div className="eq2-card eq2-card--static" style={{ marginTop: 14 }}>
        <p className="eq2-label" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Total da compra</p>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
            {brl(totalCompra)}
          </span>
          <span className="eq2-badge eq2-badge--ok">
            <Check size={11} aria-hidden="true" />
            {itens.length} {itens.length === 1 ? "item" : "itens"}
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--eq2-muted)", marginTop: 4 }}>Soma do que você pagou em cada item.</p>
      </div>

      {!salvo && (
        <div style={{ marginTop: 14 }}>
          <MelissaCard
            msg={`Quando esta compra for recebida, os ${itens.length} ${itens.length === 1 ? "item entra" : "itens entram"} no estoque e o custo médio é atualizado automaticamente.`}
          />
        </div>
      )}

      {!temSessao && !salvo && (
        <p style={{ fontSize: 12, color: "var(--eq2-warn)", marginTop: 10, fontWeight: 600 }} role="status">
          modo demo — entre na sua conta para salvar a compra.
        </p>
      )}

      {isDesktop && (
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          {renderAcoes(false)}
        </div>
      )}
    </section>
  );

  /* ── resumo sticky (desktop, coluna direita) ── */
  const resumoDesktop = isDesktop && (
    <aside aria-label="Resumo da compra" style={{ position: "sticky", top: 72, display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="eq2-card eq2-card--static">
        <p className="eq2-label" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Total da compra</p>
        <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", margin: 0 }}>
          {brl(totalCompra)}
        </p>
        {resumoLinhas.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {resumoLinhas.map((l) => (
              <div key={l.nome} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, color: "var(--eq2-muted)", minWidth: 0 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{l.nome}</span>
                <strong style={{ color: "var(--eq2-ink)", fontWeight: 500, whiteSpace: "nowrap" }}>{brl(l.valor)}</strong>
              </div>
            ))}
          </div>
        )}
        {resumoLinhas.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--eq2-muted)", marginTop: 8 }}>
            Nada selecionado ainda — escolha os insumos no passo 1.
          </p>
        )}
      </div>
      <div className="eq2-card eq2-card--static">
        <p className="eq2-label" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Itens ({itens.length})</p>
        {itens.map((i) => {
          const entrou = parseNum(i.qtd) * parseNum(i.porUnidade);
          return (
            <div key={i.produtoId} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, color: "var(--eq2-muted)", marginTop: 6 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{i.nome}</span>
              <span style={{ whiteSpace: "nowrap" }}>+ {entrou > 0 ? fmtPer(entrou, i.unidadeBase) : "—"}</span>
            </div>
          );
        })}
        {itens.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--eq2-muted)" }}>—</p>
        )}
      </div>
      <MelissaCard
        msg={
          salvo
            ? "Compra registrada. Ela entra no estoque quando for recebida."
            : "O estoque só muda quando você salvar e depois RECEBER a compra no portão. Aqui eu só anoto o que você pagou."
        }
      />
    </aside>
  );

  /* ── bottom bar (mobile) ── */
  const bottomBar = !isDesktop && (
    <div className="eq2-bottombar">
      <div className="eq2-bottombar__inner" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
        {step === 1 && erro1 && itens.length === 0 && (
          <p role="alert" style={{ margin: 0, fontSize: 12, color: "var(--eq2-danger)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <TriangleAlert size={14} aria-hidden="true" />
            Escolha pelo menos 1 insumo pra continuar.
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11, color: "var(--eq2-muted)" }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{hintEsq}</span>
          <span style={{ flex: "none" }}>{hintDir}</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {renderAcoes(true)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="eq2">
      <div className="eq2-shell" style={{ paddingBottom: isDesktop ? 32 : 150 }}>
        {/* header */}
        <header className="eq2-bar">
          <button type="button" className="eq2-back" aria-label="Voltar" onClick={voltarHeader}>
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eq2-bar__title">Nova compra</div>
            {/* bloco congelado: o fornecedor escolhido aparece aqui (redesign) */}
            <div
              className="eq2-bar__sub"
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {fornecedorId && fornecedorNome
                ? `fornecedor · ${fornecedorNome}`
                : "Compro · registro de insumo"}
            </div>
          </div>
          {(itens.length > 0 || salvo) && (
            <span className="eq2-badge eq2-badge--ok" style={{ flex: "none" }}>
              <Check size={11} aria-hidden="true" />
              {salvo ? "Compra salva ✓" : "Rascunho salvo ✓"}
            </span>
          )}
        </header>

        {/* barra de passos do wizard */}
        <div className="eq2-steps" role="group" aria-label="Progresso da compra">
          {PASSOS.map((label, i) => {
            const n = i + 1;
            const done = salvo || n < step;
            return (
              <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <i
                  aria-hidden="true"
                  style={{
                    display: "block",
                    height: 4,
                    borderRadius: 999,
                    background: done ? "var(--eq2-ink)" : n === step ? "var(--eq2-accent)" : "#dcdcdc",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: n === step && !salvo ? 700 : 500,
                    color: n === step && !salvo ? "var(--eq2-ink)" : "var(--eq2-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {done ? `✓ ${label}` : `${n}. ${label}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* corpo: 1 coluna (mobile/wizard) ou 2 colunas com resumo sticky (≥900px) */}
        <div
          style={
            isDesktop
              ? { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 24, alignItems: "start" }
              : undefined
          }
        >
          <main style={{ minWidth: 0 }}>
            {itens.length === 0 && step > 1 ? (
              // proteção: rascunho corrompido/sem item — volta ao passo 1
              passo1
            ) : step === 1 ? (
              passo1
            ) : step === 2 ? (
              passo2 ?? passo1
            ) : (
              passo3
            )}
            {/* ações do passo 1 no fluxo inline do desktop */}
            {isDesktop && step === 1 && (
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
                {renderAcoes(false)}
              </div>
            )}
          </main>
          {resumoDesktop}
        </div>
      </div>

      {bottomBar}

      {modalAberto && (
        <ProdutoFormModal
          categorias={categorias}
          naturezaInicial="insumo"
          nomeInicial={nomeInicial}
          contextoCompra
          onClose={() => setModalAberto(false)}
          onSuccess={aoCriarInsumo}
        />
      )}

      {/* rotação do ícone de salvar (não existe em .eq2-*) */}
      <style>{`.eq2-spin { animation: eq2-girar 0.9s linear infinite; } @keyframes eq2-girar { to { transform: rotate(360deg); } } @media (prefers-reduced-motion: reduce) { .eq2-spin { animation: none; } }`}</style>
    </div>
  );
}
