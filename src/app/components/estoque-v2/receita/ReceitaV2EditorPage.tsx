/**
 * Receita — editor / ficha técnica (redesign Compro·Faço·Vendo, estoque v2).
 *
 * Porte do wireframe `tracking/Redesign_ComproVendoFaco/receita-editor.html`
 * em React: a CONTA VISÍVEL é o coração da tela — cada linha de ingrediente
 * mostra o recibo da conversão (`1 lata = 395 g · 395 g × R$ 0,0139/g = R$ 5,49`)
 * e o custo recalcula ao vivo. O resumo (custo/unidade, custo do lote e margem,
 * quando existe `preco_varejo`) mora no card da Melissa, fluindo com o scroll —
 * sem barra fixa no rodapé (feedback do fundador, 24/10/2026: barras fixas não
 * são praticadas no projeto; modais/sheets sim).
 *
 * Seções: o banco NÃO tem coluna de seção na ficha técnica — tudo aparece
 * agrupado como "Ingredientes" (regra do SPEC: não inventar coluna).
 *
 * Rota (a ser montada em routes.tsx por outra task): `/estoque-v2/receita/:id`
 * com `:id` = `me_produto.id` do composto.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Info,
  Leaf,
  Lock,
  Plus,
  RotateCw,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import "../shared/estoque-v2.css";
import { MelissaCard } from "../shared/MelissaCard";
import { SegmentedNav } from "../shared/SegmentedNav";
import { brl, custoBaseFmt } from "../shared/utils";
import { formatarQtd } from "../../../lib/produto-utils";
import {
  brlSmart,
  custoLinhaReceita,
  custoUnitarioBase,
  reciboLinha,
  useReceitaV2,
  type InsumoOpcao,
  type ReceitaV2Ingrediente,
} from "../../../hooks/use-receitas-v2";

/* ───────────────────────────── helpers de UI ───────────────────────────── */

/** Aceita "1,5" e "1.5"; string vazia → null. */
function parseDecimal(valor: string): number | null {
  const t = valor.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function fmtDecimal(v: number | null): string {
  if (v == null) return "";
  return String(v).replace(".", ",");
}

/** Meta amigável da linha: "395 g — 1 lata = 395 g" */
function metaIngrediente(ing: ReceitaV2Ingrediente): string {
  const base = `${formatarQtd(ing.quantidadePorUnidade)} ${ing.unidade}`;
  if (ing.fatorConversao && ing.fatorConversao > 0 && ing.unidadeCompra) {
    return `${base} — 1 ${ing.unidadeCompra} = ${formatarQtd(ing.fatorConversao)} ${ing.unidade}`;
  }
  return base;
}

function Eq2Switch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      style={{
        width: 52,
        height: 30,
        minWidth: 52,
        borderRadius: 999,
        border: 0,
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "var(--eq2-accent)" : "#d8dcd9",
        opacity: disabled ? 0.45 : 1,
        transition: "background 0.15s",
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.15s",
        }}
      />
    </button>
  );
}

/** Sheet bottom-sheet genérico (overlay + Escape fecham). */
function Eq2Sheet({
  aberto,
  onFechar,
  titulo,
  children,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!aberto) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [aberto, onFechar]);

  if (!aberto) return null;
  return (
    <>
      {/* Painel no desktop (≥900px): em vez de largura total da viewport, acompanha
          a coluna de conteúdo (~520px, largura do bloco da Melissa) e fica centralizado
          no container, ancorado embaixo, com os 4 cantos arredondados. Mobile inalterado
          (largura total, cantos só no topo — CSS base `.eq2-sheet`). A classe
          `eq2-sheet--editor` só existe nesta página, então o override não vaza para
          os sheets de outras telas. */}
      <style>{`
        @media (min-width: 900px) {
          .eq2-sheet.eq2-sheet--editor {
            left: 0;
            right: 0;
            width: min(520px, calc(100% - 48px));
            margin: 0 auto;
            bottom: 16px;
            border-radius: 20px;
            box-shadow: 0 16px 40px rgba(15, 21, 33, 0.28);
          }
        }
      `}</style>
      <div className="eq2-sheet__overlay" onClick={onFechar} aria-hidden="true" />
      <div className="eq2-sheet eq2-sheet--editor" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="eq2-sheet__grabber" aria-hidden="true" />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <h2 style={{ flex: 1, margin: 0, fontSize: 17, fontWeight: 700 }}>{titulo}</h2>
          <button
            type="button"
            className="eq2-back"
            aria-label="Fechar"
            onClick={onFechar}
            style={{ minWidth: 40, minHeight: 40 }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ marginTop: 14 }}>{children}</div>
      </div>
    </>
  );
}

/* ─────────────────────────────── página ─────────────────────────────── */

export function ReceitaV2EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    produto,
    itens,
    usadaEm,
    loading,
    error,
    temSessao,
    recarregar,
    atualizarIngrediente,
    adicionarIngrediente,
    excluirIngrediente,
    definirVitrine,
    definirPrecoVarejo,
    buscarInsumos,
  } = useReceitaV2(id);

  /* estado da tela */
  const [salvo, setSalvo] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const salvoTimer = useRef<number | null>(null);

  const flashSalvo = useCallback(() => {
    setSalvo(true);
    if (salvoTimer.current) window.clearTimeout(salvoTimer.current);
    salvoTimer.current = window.setTimeout(() => setSalvo(false), 2400);
  }, []);
  useEffect(() => () => {
    if (salvoTimer.current) window.clearTimeout(salvoTimer.current);
  }, []);

  /* sheet: editar linha */
  const [editando, setEditando] = useState<ReceitaV2Ingrediente | null>(null);
  const [editQtd, setEditQtd] = useState("");
  const [editPerda, setEditPerda] = useState("0");
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [mutando, setMutando] = useState(false);

  /* sheet: adicionar ingrediente */
  const [addAberto, setAddAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<InsumoOpcao[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [selecionado, setSelecionado] = useState<InsumoOpcao | null>(null);
  const [addQtd, setAddQtd] = useState("");
  const [addPerda, setAddPerda] = useState("0");

  /* campo preço ("Vendo isso") */
  const [precoTexto, setPrecoTexto] = useState("");
  useEffect(() => {
    setPrecoTexto(produto?.precoVarejo != null ? fmtDecimal(produto.precoVarejo) : "");
  }, [produto?.precoVarejo]);

  /* ── contas derivadas (tudo em tempo real, a partir da ficha carregada) ── */

  const rendimento = produto?.rendimentoLote && produto.rendimentoLote > 0 ? produto.rendimentoLote : 1;

  const custoUnidade: number | null = useMemo(() => {
    if (itens.length === 0) return null;
    let total = 0;
    for (const ing of itens) {
      const c = custoLinhaReceita(ing);
      if (c == null) return null; // custo pendente contamina a conta — diga, não invente
      total += c;
    }
    return total;
  }, [itens]);

  const custoLote = custoUnidade != null ? custoUnidade * rendimento : null;

  const precoVenda = produto?.precoVarejo ?? null;
  const margemAbs = precoVenda != null && custoUnidade != null ? precoVenda - custoUnidade : null;
  const margemPct =
    margemAbs != null && precoVenda != null && precoVenda > 0 ? Math.round((margemAbs / precoVenda) * 100) : null;

  const custoLinhas: (number | null)[] = useMemo(() => itens.map((i) => custoLinhaReceita(i)), [itens]);

  /* Com "Vendo isso" ativo e margem saudável, a frase da margem entra no balloon
     da Melissa — e o mini-recibo abaixo do card NÃO repete a métrica. */
  const margemNoBalao = !!(
    produto?.exibirVitrine &&
    precoVenda != null &&
    custoUnidade != null &&
    margemAbs != null &&
    margemAbs > 0 &&
    margemPct != null &&
    margemPct >= 30
  );

  const msgMelissa = (() => {
    if (loading || !produto) return null;
    if (itens.length === 0) return "Adicione os ingredientes. Eu calculo o custo de cada um.";
    if (margemAbs != null && margemPct != null && margemPct < 30) {
      return "Este produto está com margem apertada. Reveja as quantidades ou o preço de venda.";
    }
    if (margemNoBalao && precoVenda != null && margemAbs != null && margemPct != null) {
      return `Você vende a ${brl(precoVenda)}, sobra ${brl(margemAbs)} por ${produto.unidade} — ${margemPct}%.`;
    }
    return "Sua receita usa as medidas do mercado — lata, caixa, unidade. Mostro a conta de cada linha.";
  })();

  /* ── ações ── */

  const abrirEdicao = (ing: ReceitaV2Ingrediente) => {
    setEditando(ing);
    setEditQtd(fmtDecimal(ing.quantidadePorUnidade));
    setEditPerda(fmtDecimal(ing.perdaPct));
    setConfirmarExclusao(false);
  };

  const fecharEdicao = () => {
    setEditando(null);
    setConfirmarExclusao(false);
  };

  const aplicarEdicao = async () => {
    if (!editando) return;
    const q = parseDecimal(editQtd);
    const p = parseDecimal(editPerda) ?? 0;
    if (q == null || q <= 0) {
      toast.error("Informe uma quantidade maior que zero.");
      return;
    }
    if (p < 0) {
      toast.error("A perda não pode ser negativa.");
      return;
    }
    setMutando(true);
    const r = await atualizarIngrediente(editando.id, { quantidadePorUnidade: q, perdaPct: p });
    setMutando(false);
    if (!r.ok) {
      toast.error(r.error ?? "Não foi possível salvar a linha.");
      return;
    }
    fecharEdicao();
    flashSalvo();
  };

  const pedirExclusao = async () => {
    if (!editando) return;
    if (!confirmarExclusao) {
      setConfirmarExclusao(true);
      return;
    }
    setMutando(true);
    const r = await excluirIngrediente(editando.id);
    setMutando(false);
    if (!r.ok) {
      toast.error(r.error ?? "Não foi possível excluir a linha.");
      return;
    }
    fecharEdicao();
    toast.success("Ingrediente removido da receita.");
  };

  const alternarVendoIsso = async () => {
    if (!produto) return;
    const r = await definirVitrine(!produto.exibirVitrine);
    if (!r.ok) {
      toast.error(r.error ?? "Não foi possível alterar o \"Vendo isso\".");
      return;
    }
    flashSalvo();
  };

  const commitPreco = async () => {
    if (!produto) return;
    const valor = parseDecimal(precoTexto);
    if (precoTexto.trim() !== "" && valor == null) {
      toast.error("Preço inválido.");
      setPrecoTexto(produto.precoVarejo != null ? fmtDecimal(produto.precoVarejo) : "");
      return;
    }
    if ((valor ?? null) === (produto.precoVarejo ?? null)) return;
    const r = await definirPrecoVarejo(valor);
    if (!r.ok) {
      toast.error(r.error ?? "Não foi possível salvar o preço.");
      return;
    }
    flashSalvo();
  };

  /* busca de insumos (debounce simples) */
  useEffect(() => {
    if (!addAberto || selecionado) return;
    const t = window.setTimeout(async () => {
      setBuscando(true);
      const r = await buscarInsumos(termo);
      const usados = new Set(itens.map((i) => i.componenteId));
      setResultados(r.filter((i) => !usados.has(i.id)));
      setBuscando(false);
    }, 250);
    return () => window.clearTimeout(t);
  }, [addAberto, termo, selecionado, itens, buscarInsumos]);

  const abrirAdicionar = () => {
    setAddAberto(true);
    setSelecionado(null);
    setTermo("");
    setAddQtd("");
    setAddPerda("0");
  };

  const escolherInsumo = (ins: InsumoOpcao) => {
    setSelecionado(ins);
    setAddQtd(ins.fatorConversao && ins.fatorConversao > 0 ? fmtDecimal(ins.fatorConversao) : "1");
  };

  const confirmarAdicao = async () => {
    if (!selecionado) return;
    const q = parseDecimal(addQtd);
    const p = parseDecimal(addPerda) ?? 0;
    if (q == null || q <= 0) {
      toast.error("Informe uma quantidade maior que zero.");
      return;
    }
    if (p < 0) {
      toast.error("A perda não pode ser negativa.");
      return;
    }
    setMutando(true);
    const r = await adicionarIngrediente({
      componenteId: selecionado.id,
      quantidadePorUnidade: q,
      perdaPct: p,
    });
    setMutando(false);
    if (!r.ok) {
      toast.error(r.error ?? "Não foi possível adicionar o ingrediente.");
      return;
    }
    setAddAberto(false);
    setSelecionado(null);
    flashSalvo();
  };

  /* preview ao vivo dentro dos sheets */
  const edicaoQtd = parseDecimal(editQtd) ?? 0;
  const edicaoPerda = parseDecimal(editPerda) ?? 0;
  const edicaoPreview: ReceitaV2Ingrediente | null = editando
    ? { ...editando, quantidadePorUnidade: edicaoQtd, perdaPct: edicaoPerda }
    : null;
  const edicaoCusto = edicaoPreview ? custoLinhaReceita(edicaoPreview) : null;

  const addPreviewIng: ReceitaV2Ingrediente | null = selecionado
    ? {
        id: "preview",
        componenteId: selecionado.id,
        nome: selecionado.nome,
        unidade: selecionado.unidade,
        unidadeCompra: selecionado.unidadeCompra,
        fatorConversao: selecionado.fatorConversao,
        precoCusto: selecionado.precoCusto,
        ultimoPrecoCompra: selecionado.ultimoPrecoCompra,
        quantidadePorUnidade: parseDecimal(addQtd) ?? 0,
        perdaPct: parseDecimal(addPerda) ?? 0,
      }
    : null;

  /* ───────────────────────────── render ───────────────────────────── */

  return (
    <div className="eq2">
      <div className="eq2-shell">
        {/* app bar */}
        <header className="eq2-bar">
          <button
            type="button"
            className="eq2-back"
            aria-label="Voltar"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eq2-bar__title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {produto?.nome ?? "Receita"}
            </div>
            <div className="eq2-bar__sub">
              {produto ? `rende ${formatarQtd(rendimento)} ${produto.unidade}` : "Ficha da receita"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {salvo && (
              <span className="eq2-badge eq2-badge--ok" role="status">
                <Check size={12} aria-hidden="true" /> salvo
              </span>
            )}
            {usadaEm > 0 && (
              <span className="eq2-badge eq2-badge--estimado">usada em {usadaEm} receita{usadaEm > 1 ? "s" : ""}</span>
            )}
          </div>
        </header>

        {/* Compro · Faço · Vendo — área atual: Faço. Editor é tela de foco, mas o
            segmented fica (cenário completo); as seções abaixo já têm marginTop 16. */}
        <SegmentedNav ativo="faco" compacto style={{ margin: "10px 0 0" }} />

        {/* ---------- estados de carga ---------- */}
        {loading && (
          <section aria-label="Carregando a ficha da receita" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <div className="eq2-skeleton" style={{ height: 110 }} />
            <div className="eq2-skeleton" style={{ height: 64 }} />
            <div className="eq2-skeleton" style={{ height: 64 }} />
            <div className="eq2-skeleton" style={{ height: 64 }} />
            <p style={{ color: "var(--eq2-muted)", fontSize: 12 }}>Carregando ficha técnica…</p>
          </section>
        )}

        {!loading && error && (
          <section className="eq2-card eq2-card--static" style={{ marginTop: 16 }} aria-label="Erro ao carregar">
            <div className="eq2-state">
              <AlertTriangle size={34} color="var(--eq2-danger)" aria-hidden="true" />
              <p className="eq2-state__title">Não deu para carregar a receita</p>
              <p>{error}</p>
              <button type="button" className="eq2-btn eq2-btn--secondary" onClick={recarregar}>
                <RotateCw size={16} aria-hidden="true" /> Tentar de novo
              </button>
            </div>
          </section>
        )}

        {!loading && !error && !produto && !temSessao && (
          <section className="eq2-card eq2-card--static" style={{ marginTop: 16 }} aria-label="Modo demo">
            <div className="eq2-state">
              <Lock size={34} aria-hidden="true" />
              <p className="eq2-state__title">Entre para editar a receita</p>
              <p>
                A ficha técnica fica salva na sua conta. Faça login para ver os ingredientes, o custo e a
                margem desta receita.
              </p>
            </div>
          </section>
        )}

        {/* ---------- conteúdo ---------- */}
        {!loading && !error && produto && (
          <>
            {/* rendimento + "Vendo isso" + margem */}
            <section
              className="eq2-card eq2-card--static"
              style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}
              aria-label="Rendimento e venda"
            >
              <div>
                <p className="eq2-section-title" style={{ marginTop: 0 }}>
                  Rendimento
                </p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  rende {formatarQtd(rendimento)} {produto.unidade}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--eq2-muted)" }}>
                  quantidade que sobra pronta depois de preparar um lote
                </p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Vendo isso</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--eq2-muted)", lineHeight: 1.4 }}>
                      {temSessao
                        ? "Ative para esta receita entrar na lista do \u201cVendo\u201d com o preço que você definir."
                        : "Faça login para ativar a venda e o preço deste produto."}
                    </p>
                  </div>
                  <Eq2Switch
                    checked={produto.exibirVitrine}
                    disabled={!temSessao}
                    onChange={alternarVendoIsso}
                    label="Vendo isso"
                  />
                </div>

                {produto.exibirVitrine && (
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    <label style={{ display: "block" }}>
                      <span className="eq2-label">Preço de venda (por {produto.unidade})</span>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ color: "var(--eq2-muted)", fontSize: 14 }}>R$</span>
                        <input
                          className="eq2-input"
                          type="text"
                          inputMode="decimal"
                          placeholder="0,00"
                          value={precoTexto}
                          disabled={!temSessao}
                          onChange={(e) => setPrecoTexto(e.target.value)}
                          onBlur={commitPreco}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                          }}
                          style={{ maxWidth: 160 }}
                        />
                      </div>
                    </label>

                    <div
                      className="eq2-receipt"
                      aria-live="polite"
                      style={{ display: "flex", alignItems: "flex-start", gap: 8, borderStyle: "solid" }}
                    >
                      <TrendingUp size={16} style={{ flexShrink: 0, marginTop: 2, color: "var(--eq2-muted)" }} aria-hidden="true" />
                      <span>
                        {precoVenda == null &&
                          "Digite um preço para eu mostrar quanto sobra de cada venda."}
                        {precoVenda != null && custoUnidade == null &&
                          "Adicione os ingredientes para eu calcular o custo e a margem."}
                        {precoVenda != null && custoUnidade != null && margemAbs != null && margemAbs <= 0 && (
                          <>
                            Vendendo a <strong>{brl(precoVenda)}</strong> você não cobre nem o custo (
                            <strong>{brl(custoUnidade)}</strong>). Pense em um preço um pouco maior.
                          </>
                        )}
                        {precoVenda != null && custoUnidade != null && margemAbs != null && margemAbs > 0 && (
                          <>
                            Cada {produto.unidade} te custa <strong>{brl(custoUnidade)}</strong>. Vendendo a{" "}
                            <strong>{brl(precoVenda)}</strong>, sobram <strong>{brl(margemAbs)}</strong> (margem de{" "}
                            {margemPct}%).
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ingredientes */}
            <p className="eq2-section-title">
              Ingredientes <span style={{ fontWeight: 500 }}>({itens.length})</span>
            </p>

            {itens.length === 0 ? (
              <section className="eq2-card eq2-card--static" aria-label="Ficha ainda em branco">
                <div className="eq2-state">
                  <Leaf size={34} aria-hidden="true" />
                  <p className="eq2-state__title">Nenhum ingrediente ainda</p>
                  <p>Anote o que vai na receita, na medida que você usa: “1 lata”, “2 limões”…</p>
                </div>
              </section>
            ) : (
              <div className="eq2-list">
                {itens.map((ing, idx) => {
                  const custo = custoLinhas[idx];
                  const estimado = ing.precoCusto == null && ing.ultimoPrecoCompra != null;
                  return (
                    <div key={ing.id}>
                      <button
                        type="button"
                        className="eq2-card"
                        style={{ textAlign: "left" }}
                        onClick={() => abrirEdicao(ing)}
                        aria-label={`Editar ${ing.nome}: ${metaIngrediente(ing)}${custo != null ? `, ${brl(custo)}` : ""}`}
                      >
                        <div className="eq2-card__top">
                          <span className="eq2-card__icon" aria-hidden="true">
                            <Leaf size={18} />
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="eq2-card__name">{ing.nome}</span>
                            <div className="eq2-card__meta">{metaIngrediente(ing)}</div>
                            {estimado && (
                              <span className="eq2-badge eq2-badge--estimado" style={{ marginTop: 4 }}>
                                <Info size={10} aria-hidden="true" /> estimado
                              </span>
                            )}
                          </span>
                          <span style={{ textAlign: "right", flexShrink: 0 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                              {custo != null ? brlSmart(custo) : <span style={{ color: "var(--eq2-muted)", fontSize: 12 }}>custo pendente</span>}
                            </span>
                          </span>
                        </div>
                      </button>
                      <div className="eq2-receipt" style={{ marginTop: 6 }}>
                        {reciboLinha(ing)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              className="eq2-btn eq2-btn--link"
              onClick={abrirAdicionar}
              disabled={!temSessao}
              style={{ marginTop: 10 }}
            >
              <Plus size={18} aria-hidden="true" /> Adicionar ingrediente
            </button>
            {!temSessao && (
              <p style={{ fontSize: 12, color: "var(--eq2-muted)", margin: "2px 0 0" }}>
                Faça login para editar a ficha desta receita.
              </p>
            )}
            {temSessao && itens.length > 0 && (
              <p style={{ fontSize: 12, color: "var(--eq2-muted)", margin: "6px 0 0", lineHeight: 1.4 }}>
                Toque em um ingrediente para trocar a quantidade ou a perda. O custo recalcula na hora.
              </p>
            )}

            {/* Melissa */}
            {msgMelissa && (
              <div style={{ marginTop: 20 }}>
                <MelissaCard
                  msg={msgMelissa}
                  actionLabel={itens.length > 0 ? (contaAberta ? "Esconder a conta" : "Mostrar a conta") : undefined}
                  onAction={itens.length > 0 ? () => setContaAberta((v) => !v) : undefined}
                />
                {/* resumo de custo — antes na barra fixa do rodapé; agora flui com
                    o scroll, colado abaixo do card escuro da Melissa */}
                <div
                  className="eq2-receipt"
                  role="region"
                  aria-label="Custos da receita"
                  aria-live="polite"
                  style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span>Custo por {produto.unidade}</span>
                    <strong style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                      {custoUnidade != null ? brlSmart(custoUnidade) : "custo pendente"}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span>
                      Custo do lote (rende {formatarQtd(rendimento)} {produto.unidade})
                    </span>
                    <strong style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                      {custoLote != null ? brl(custoLote) : "—"}
                    </strong>
                  </div>
                  {!margemNoBalao && precoVenda != null && margemAbs != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                        color: margemAbs > 0 ? "#2e7d43" : "var(--eq2-danger)",
                        fontWeight: 600,
                      }}
                    >
                      <span>Margem por venda</span>
                      <strong style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: "inherit" }}>
                        {margemAbs > 0 ? `${brl(margemAbs)} · ${margemPct}%` : "ainda não sobra"}
                      </strong>
                    </div>
                  )}
                </div>
                {contaAberta && itens.length > 0 && (
                  <div className="eq2-receipt" style={{ marginTop: 8 }} aria-live="polite">
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--eq2-ink)" }}>a conta por trás das medidas</p>
                    {itens.map((ing) => (
                      <p key={ing.id} style={{ margin: 0 }}>
                        {ing.nome}: {reciboLinha(ing)}
                      </p>
                    ))}
                    <p style={{ margin: "6px 0 0" }}>você escreve na medida do mercado e eu calculo na unidade do estoque</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ---------- sheet: editar ingrediente ---------- */}
      <Eq2Sheet aberto={!!editando} onFechar={fecharEdicao} titulo={editando?.nome ?? "Ingrediente"}>
        {editando && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
              <label style={{ flex: 1, minWidth: 150 }}>
                <span className="eq2-label">Quantidade ({editando.unidade})</span>
                <input
                  className="eq2-input"
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  value={editQtd}
                  onChange={(e) => setEditQtd(e.target.value)}
                />
              </label>
              <label style={{ width: 110, flexShrink: 0 }}>
                <span className="eq2-label">Perda (%)</span>
                <input
                  className="eq2-input"
                  type="text"
                  inputMode="decimal"
                  value={editPerda}
                  onChange={(e) => setEditPerda(e.target.value)}
                />
              </label>
            </div>

            {editando.fatorConversao && editando.fatorConversao > 0 && editando.unidadeCompra && (
              <p style={{ fontSize: 12, color: "var(--eq2-muted)", margin: 0 }}>
                1 {editando.unidadeCompra} = {formatarQtd(editando.fatorConversao)} {editando.unidade}
                {edicaoQtd > 0 && ` · sua linha ≈ ${formatarQtd(edicaoQtd / editando.fatorConversao)} ${editando.unidadeCompra}(s)`}
              </p>
            )}

            <div className="eq2-receipt" aria-live="polite">
              {edicaoPreview && reciboLinha(edicaoPreview)}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "10px 12px",
                borderRadius: 12,
                background: "#f4f7f5",
                border: "1px solid var(--eq2-border)",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--eq2-muted)" }}>Custo desta linha na receita</span>
              <strong style={{ fontVariantNumeric: "tabular-nums", fontSize: 15 }}>
                {edicaoQtd > 0 ? (edicaoCusto != null ? brlSmart(edicaoCusto) : custoBaseFmt(null, null)) : "—"}
              </strong>
            </div>

            {confirmarExclusao ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                  Excluir {editando.nome} da receita?
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="eq2-btn eq2-btn--secondary" style={{ flex: 1 }} onClick={() => setConfirmarExclusao(false)} disabled={mutando}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="eq2-btn"
                    style={{ flex: 1, background: "var(--eq2-danger)", color: "#fff" }}
                    onClick={pedirExclusao}
                    disabled={mutando}
                  >
                    <Trash2 size={16} aria-hidden="true" /> {mutando ? "Excluindo…" : "Sim, excluir"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="eq2-btn eq2-btn--secondary" style={{ flex: 1 }} onClick={fecharEdicao} disabled={mutando}>
                    Cancelar
                  </button>
                  <button type="button" className="eq2-btn eq2-btn--primary" style={{ flex: 1.4 }} onClick={aplicarEdicao} disabled={mutando}>
                    <Check size={16} aria-hidden="true" /> {mutando ? "Salvando…" : "Usar essa quantidade"}
                  </button>
                </div>
                <button
                  type="button"
                  className="eq2-btn eq2-btn--link"
                  style={{ color: "var(--eq2-danger)", alignSelf: "flex-start" }}
                  onClick={() => setConfirmarExclusao(true)}
                  disabled={mutando}
                >
                  <Trash2 size={15} aria-hidden="true" /> Excluir esta linha
                </button>
              </>
            )}
          </div>
        )}
      </Eq2Sheet>

      {/* ---------- sheet: adicionar ingrediente ---------- */}
      <Eq2Sheet aberto={addAberto} onFechar={() => setAddAberto(false)} titulo={selecionado ? selecionado.nome : "Que ingrediente falta?"}>
        {!selecionado ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                aria-hidden="true"
                style={{ position: "absolute", left: 12, top: 13, color: "var(--eq2-muted)" }}
              />
              <input
                className="eq2-input"
                type="text"
                inputMode="search"
                placeholder="Buscar insumo: chocolate, farinha…"
                aria-label="Buscar insumo"
                autoFocus
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>

            {buscando && (
              <div className="eq2-list" aria-hidden="true">
                <div className="eq2-skeleton" style={{ height: 56 }} />
                <div className="eq2-skeleton" style={{ height: 56 }} />
              </div>
            )}

            {!buscando && resultados.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--eq2-muted)", padding: "8px 0" }}>
                Nada encontrado com esse nome. Cadastre o insumo primeiro na lista do “Compro”.
              </p>
            )}

            {!buscando && (
              <div className="eq2-list">
                {resultados.map((ins) => (
                  <button
                    key={ins.id}
                    type="button"
                    className="eq2-card"
                    onClick={() => escolherInsumo(ins)}
                    aria-label={`Adicionar ${ins.nome} à receita`}
                  >
                    <div className="eq2-card__top">
                      <span className="eq2-card__icon" aria-hidden="true">
                        <Leaf size={18} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="eq2-card__name">{ins.nome}</span>
                        <div className="eq2-card__meta">
                          {custoBaseFmt(custoUnitarioBase(ins), ins.unidade)} · unidade: {ins.unidade}
                        </div>
                      </span>
                      <Plus size={18} aria-hidden="true" style={{ color: "var(--eq2-accent)" }} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            <p style={{ fontSize: 12, color: "var(--eq2-muted)", margin: 0 }}>
              Os custos mostram o preço da última compra.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
              <label style={{ flex: 1, minWidth: 150 }}>
                <span className="eq2-label">Quantidade ({selecionado.unidade})</span>
                <input
                  className="eq2-input"
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  value={addQtd}
                  onChange={(e) => setAddQtd(e.target.value)}
                />
              </label>
              <label style={{ width: 110, flexShrink: 0 }}>
                <span className="eq2-label">Perda (%)</span>
                <input
                  className="eq2-input"
                  type="text"
                  inputMode="decimal"
                  value={addPerda}
                  onChange={(e) => setAddPerda(e.target.value)}
                />
              </label>
            </div>

            {selecionado.fatorConversao && selecionado.fatorConversao > 0 && selecionado.unidadeCompra && (
              <p style={{ fontSize: 12, color: "var(--eq2-muted)", margin: 0 }}>
                1 {selecionado.unidadeCompra} = {formatarQtd(selecionado.fatorConversao)} {selecionado.unidade}
                {" · "}em <strong>{formatarQtd(parseDecimal(addQtd) ?? 0)}</strong> {selecionado.unidade}
              </p>
            )}

            <div className="eq2-receipt" aria-live="polite">
              {addPreviewIng && addPreviewIng.quantidadePorUnidade > 0
                ? reciboLinha(addPreviewIng)
                : "Informe a quantidade para eu mostrar a conta."}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="eq2-btn eq2-btn--secondary"
                style={{ flex: 1 }}
                onClick={() => setSelecionado(null)}
                disabled={mutando}
              >
                Voltar
              </button>
              <button
                type="button"
                className="eq2-btn eq2-btn--primary"
                style={{ flex: 1.4 }}
                onClick={confirmarAdicao}
                disabled={mutando}
              >
                <Plus size={16} aria-hidden="true" /> {mutando ? "Adicionando…" : "Adicionar à receita"}
              </button>
            </div>
          </div>
        )}
      </Eq2Sheet>
    </div>
  );
}
