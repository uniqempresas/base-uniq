/**
 * Configurações V2 (Estoque) — gerência de categorias com PRODUTOS e INSUMOS
 * separados (me_categoria.escopo).
 *
 * Composição (mobile-first, 1 coluna; desktop ≥900px grid 3):
 *  1. .eq2-bar "Configurações" — sub "Organize seus produtos e insumos";
 *     badge à direita: contador de categorias da aba OU "modo demo".
 *  2. Tabs Produtos | Insumos — .eq2-segmented padrão (a mesma gramática do
 *     Compro·Faço·Vendo, aqui para o escopo de cadastro). Trocar aba NÃO
 *     re-faz fetch: o hook carrega os dois escopos e a filtragem é local.
 *  3. "+ Nova categoria" (block) → mini-sheet com UM campo de nome + paleta
 *     de cores (CORES_TAG, mesmo seletor do v1/CRM, em alvos de 44px).
 *  4. Grid de cards por categoria: pill colorida (getTagPalette da cor real),
 *     contagem de uso em massa (produtos/insumos ativos), e 3 ações INLINE
 *     por card — renomear (editar dentro do card), cor (paleta inline,
 *     aplicar com um toque), arquivar (confirm em 2 etapas dentro do card,
 *     reportando a contagem de uso). Nada de modal por ação: tudo vive no
 *     card, mais rápido no celular.
 *
 * Estados: skeleton · empty por aba (MelissaCard discreto) · erro+retry ·
 * aviso "dados de demonstração" (sem sessão, mutações desabilitadas com hint
 * — o hook também bloqueia, defesa em profundidade).
 *
 * Soft delete igual ao v1: a categoria arquivada some dos novos cadastros,
 * mas quem já a usa mantém o rótulo — a frase do confirm explica isso.
 *
 * Estilo: classes .eq2 do css compartilhado do módulo + <style> scoped com
 * prefixo .eq2-cfg__ (padrão da lane; o css compartilhado é de outras lanes).
 */
import { useState } from "react";
import {
  Archive,
  Check,
  Loader2,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";
import "../shared/estoque-v2.css";
import { MelissaCard } from "../shared/MelissaCard";
import {
  useCategoriasV2,
  type CategoriaV2,
  type EscopoCategoria,
} from "../../../hooks/use-categorias-v2";
import { CORES_TAG, getTagPalette } from "../../../hooks/use-tags";

const TERMOS: Record<EscopoCategoria, { aba: string; sg: string; pl: string }> = {
  produto: { aba: "Produtos", sg: "produto", pl: "produtos" },
  insumo: { aba: "Insumos", sg: "insumo", pl: "insumos" },
};

const ABAS: EscopoCategoria[] = ["produto", "insumo"];

type PainelTipo = "renomear" | "cor" | "arquivar";
interface PainelAberto {
  id: number;
  tipo: PainelTipo;
}

/* ------------------------------------------------------------------ */
/* Paleta de cores (mesma paleta do v1/CRM, alvos de toque 44px)       */
/* ------------------------------------------------------------------ */

function PaletaDores({
  valor,
  onChange,
  disabled = false,
}: {
  valor: string | null;
  onChange: (cor: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="eq2-cfg__cores" role="group" aria-label="Escolher cor">
      {CORES_TAG.map((c) => {
        const on = valor === c;
        return (
          <button
            key={c}
            type="button"
            className={`eq2-cfg__dot${on ? " is-on" : ""}`}
            aria-label={`Cor ${c}`}
            aria-pressed={on}
            disabled={disabled}
            onClick={() => onChange(c)}
          >
            <i style={{ background: c, boxShadow: on ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : "none" }} />
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card de categoria — ações inline, um painel aberto por vez          */
/* ------------------------------------------------------------------ */

function CardCategoria({
  cat,
  escopo,
  uso,
  painel,
  demo,
  editNome,
  salvando,
  onAbrirPainel,
  onFecharPainel,
  onEditNome,
  onRenomear,
  onCor,
  onArquivar,
}: {
  cat: CategoriaV2;
  escopo: EscopoCategoria;
  uso: number;
  painel: PainelAberto | null;
  demo: boolean;
  editNome: string;
  salvando: boolean;
  onAbrirPainel: (cat: CategoriaV2, tipo: PainelTipo) => void;
  onFecharPainel: () => void;
  onEditNome: (v: string) => void;
  onRenomear: (id: number) => void;
  onCor: (id: number, cor: string) => void;
  onArquivar: (cat: CategoriaV2) => void;
}) {
  const t = TERMOS[escopo];
  const aberto = painel?.id === cat.id ? painel.tipo : null;
  const palette = getTagPalette(cat.cor);

  return (
    <div className="eq2-card eq2-card--static">
      <span className="eq2-cfg__chip" style={{ background: palette.bg, color: palette.text, borderColor: palette.border }}>
        {cat.nome}
      </span>
      <p className="eq2-card__meta">
        {uso === 0 ? "sem uso ainda" : `em uso: ${uso} ${uso === 1 ? t.sg : t.pl}`}
      </p>

      <div className="eq2-cfg__acoes">
        <button
          type="button"
          className="eq2-cfg__acao"
          onClick={() => onAbrirPainel(cat, "renomear")}
          disabled={demo}
          aria-expanded={aberto === "renomear"}
        >
          <Pencil size={14} aria-hidden="true" /> Renomear
        </button>
        <button
          type="button"
          className="eq2-cfg__acao"
          onClick={() => onAbrirPainel(cat, "cor")}
          disabled={demo}
          aria-expanded={aberto === "cor"}
        >
          <Palette size={14} aria-hidden="true" /> Cor
        </button>
        <button
          type="button"
          className="eq2-cfg__acao eq2-cfg__acao--perigo"
          onClick={() => onAbrirPainel(cat, "arquivar")}
          disabled={demo}
          aria-expanded={aberto === "arquivar"}
        >
          <Archive size={14} aria-hidden="true" /> Arquivar
        </button>
      </div>

      {aberto === "renomear" && (
        <div className="eq2-cfg__painel">
          <input
            className="eq2-input"
            type="text"
            autoFocus
            value={editNome}
            onChange={(e) => onEditNome(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onRenomear(cat.id);
              }
              if (e.key === "Escape") onFecharPainel();
            }}
            aria-label={`Novo nome para ${cat.nome}`}
            maxLength={60}
          />
          <div className="eq2-cfg__linha">
            <button type="button" className="eq2-btn eq2-btn--secondary" onClick={onFecharPainel} disabled={salvando}>
              Cancelar
            </button>
            <button
              type="button"
              className="eq2-btn eq2-btn--primary"
              onClick={() => onRenomear(cat.id)}
              disabled={salvando}
            >
              {salvando ? <Loader2 size={14} className="eq2-cfg__spin" aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}
              Salvar
            </button>
          </div>
        </div>
      )}

      {aberto === "cor" && (
        <div className="eq2-cfg__painel">
          <span className="eq2-label" style={{ marginBottom: 0 }}>
            Cor da categoria
          </span>
          <PaletaDores valor={cat.cor} onChange={(c) => onCor(cat.id, c)} disabled={salvando} />
          <button type="button" className="eq2-btn eq2-btn--link eq2-cfg__fechar" onClick={onFecharPainel}>
            <X size={14} aria-hidden="true" /> Fechar
          </button>
        </div>
      )}

      {aberto === "arquivar" && (
        <div className="eq2-cfg__painel" role="alertdialog" aria-label={`Confirmar arquivamento de ${cat.nome}`}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Arquivar “{cat.nome}”?</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--eq2-muted)", lineHeight: 1.5 }}>
            {uso > 0
              ? `Hoje ${uso} ${uso === 1 ? t.sg : t.pl} ${uso === 1 ? "usa" : "usam"} esta categoria — ${
                  uso === 1 ? "ele mantém" : "eles mantêm"
                } o rótulo, mas ela sai dos novos cadastros.`
              : "Ninguém usa esta categoria ainda."}{" "}
            Nada é apagado.
          </p>
          <div className="eq2-cfg__linha">
            <button type="button" className="eq2-btn eq2-btn--secondary" onClick={onFecharPainel} disabled={salvando}>
              Cancelar
            </button>
            <button
              type="button"
              className="eq2-btn eq2-cfg__btn-perigo"
              onClick={() => onArquivar(cat)}
              disabled={salvando}
            >
              {salvando ? <Loader2 size={14} className="eq2-cfg__spin" aria-hidden="true" /> : <Archive size={14} aria-hidden="true" />}
              Arquivar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export function ConfiguracoesV2Page() {
  const {
    categorias,
    contagens,
    loading,
    error,
    isFallback,
    recarregar,
    criarCategoria,
    renomearCategoria,
    definirCor,
    arquivarCategoria,
  } = useCategoriasV2();

  const [aba, setAba] = useState<EscopoCategoria>("produto");
  const [painel, setPainel] = useState<PainelAberto | null>(null);
  const [editNome, setEditNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Sheet "Nova categoria"
  const [sheetAberta, setSheetAberta] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaCor, setNovaCor] = useState<string>(CORES_TAG[0]);
  const [criando, setCriando] = useState(false);

  const t = TERMOS[aba];
  const daAba = categorias.filter((c) => c.escopo === aba);

  const trocarAba = (next: EscopoCategoria) => {
    setAba(next);
    setPainel(null);
  };

  const abrirPainel = (cat: CategoriaV2, tipo: PainelTipo) => {
    setPainel((atual) => (atual && atual.id === cat.id && atual.tipo === tipo ? null : { id: cat.id, tipo }));
    if (tipo === "renomear") setEditNome(cat.nome);
  };
  const fecharPainel = () => setPainel(null);

  /* ---- ações ---- */

  const submitRenomear = async (id: number) => {
    const nome = editNome.trim();
    if (!nome) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    setSalvando(true);
    const res = await renomearCategoria(id, nome);
    setSalvando(false);
    if (res.success) {
      toast.success("Categoria renomeada.");
      fecharPainel();
    } else {
      toast.error(res.error || "Erro ao renomear a categoria.");
    }
  };

  const submitCor = async (id: number, cor: string) => {
    setSalvando(true);
    const res = await definirCor(id, cor);
    setSalvando(false);
    if (res.success) {
      toast.success("Cor atualizada.");
      fecharPainel();
    } else {
      toast.error(res.error || "Erro ao mudar a cor.");
    }
  };

  const submitArquivar = async (cat: CategoriaV2) => {
    setSalvando(true);
    const res = await arquivarCategoria(cat.id);
    setSalvando(false);
    if (res.success) {
      toast.success(`Categoria “${cat.nome}” arquivada.`);
      fecharPainel();
    } else {
      toast.error(res.error || "Erro ao arquivar a categoria.");
    }
  };

  const submitNova = async () => {
    const nome = novoNome.trim();
    if (!nome) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    setCriando(true);
    const res = await criarCategoria(aba, nome, novaCor);
    setCriando(false);
    if (res.success) {
      toast.success(`Categoria “${nome}” criada.`);
      setSheetAberta(false);
      setNovoNome("");
    } else {
      toast.error(res.error || "Erro ao criar a categoria.");
    }
  };

  /* ---- render ---- */

  return (
    <div className="eq2">
      <div className="eq2-shell">
        <header className="eq2-bar">
          <div style={{ minWidth: 0 }}>
            <h1 className="eq2-bar__title">Configurações</h1>
            <p className="eq2-bar__sub">Organize seus produtos e insumos</p>
          </div>
          {!loading && !error && (
            <span
              className={`eq2-badge ${isFallback ? "eq2-badge--estimado" : "eq2-badge--ok"}`}
              style={{ flex: "none" }}
            >
              {isFallback ? "modo demo" : `${daAba.length} ${daAba.length === 1 ? "categoria" : "categorias"}`}
            </span>
          )}
        </header>

        <main>
          {/* Tabs Produtos | Insumos — escopo de cadastro (.eq2-segmented padrão) */}
          <nav className="eq2-segmented" role="group" aria-label="Escopo das categorias" style={{ margin: "14px 0" }}>
            {ABAS.map((chave) => {
              const ativa = aba === chave;
              return (
                <button
                  key={chave}
                  type="button"
                  className={ativa ? "is-active" : undefined}
                  aria-pressed={ativa}
                  style={{ minHeight: 44 }}
                  onClick={() => trocarAba(chave)}
                >
                  {TERMOS[chave].aba}
                </button>
              );
            })}
          </nav>

          {/* Nova categoria — por aba (mini-sheet com 1 campo + cor) */}
          <button
            type="button"
            className="eq2-btn eq2-btn--primary eq2-btn--block"
            onClick={() => setSheetAberta(true)}
            disabled={isFallback}
            style={{ marginBottom: 8 }}
          >
            <Plus size={16} aria-hidden="true" /> Nova categoria de {t.pl.toLowerCase()}
          </button>
          {isFallback && (
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--eq2-muted)" }}>
              Prévia com dados de demonstração — faça login para criar e editar categorias.
            </p>
          )}

          {/* ---- estados ---- */}
          {loading ? (
            <div className="eq2-grid eq2-grid--3" style={{ marginTop: 14 }} aria-hidden="true">
              <div className="eq2-skeleton" style={{ height: 122, borderRadius: 12 }} />
              <div className="eq2-skeleton" style={{ height: 122, borderRadius: 12 }} />
              <div className="eq2-skeleton" style={{ height: 122, borderRadius: 12 }} />
            </div>
          ) : error ? (
            <div className="eq2-state eq2-card eq2-card--static" role="alert" style={{ marginTop: 14 }}>
              <TriangleAlert size={32} aria-hidden="true" style={{ color: "var(--eq2-danger)" }} />
              <p className="eq2-state__title">Não foi possível carregar as categorias</p>
              <p style={{ margin: 0 }}>
                {error.includes("Empresa")
                  ? error
                  : "Sua conexão caiu no meio do caminho. Nada foi perdido — tente de novo."}
              </p>
              <button type="button" className="eq2-btn eq2-btn--secondary" onClick={recarregar}>
                <RotateCcw size={16} aria-hidden="true" /> Tentar de novo
              </button>
            </div>
          ) : daAba.length === 0 ? (
            <div style={{ marginTop: 14 }}>
              <MelissaCard msg="Categorias organizam a prata da casa. Comece pelas que você mais usa." />
            </div>
          ) : (
            <div className="eq2-grid eq2-grid--3" style={{ marginTop: 14 }}>
              {daAba.map((cat) => (
                <CardCategoria
                  key={cat.id}
                  cat={cat}
                  escopo={aba}
                  uso={contagens[cat.id] ?? 0}
                  painel={painel}
                  demo={isFallback}
                  editNome={editNome}
                  salvando={salvando}
                  onAbrirPainel={abrirPainel}
                  onFecharPainel={fecharPainel}
                  onEditNome={setEditNome}
                  onRenomear={submitRenomear}
                  onCor={submitCor}
                  onArquivar={submitArquivar}
                />
              ))}
            </div>
          )}

          {!loading && !error && daAba.length > 0 && (
            <p style={{ margin: "16px 2px 0", fontSize: 11, color: "var(--eq2-muted)" }}>
              Categoria arquivada some dos novos cadastros, mas quem já a usa mantém o rótulo.
            </p>
          )}
        </main>
      </div>

      {/* ---- mini-sheet Nova categoria ---- */}
      {sheetAberta && (
        <>
          <div className="eq2-sheet__overlay" onClick={() => !criando && setSheetAberta(false)} />
          <div
            className="eq2-sheet eq2-sheet--config"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cfg-sheet-titulo"
          >
            <div className="eq2-sheet__grabber" aria-hidden="true" />
            <h2 id="cfg-sheet-titulo" style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>
              Nova categoria de {t.pl.toLowerCase()}
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--eq2-muted)" }}>
              Nome é o que aparece nos cadastros. A cor só organiza a leitura — dá para trocar depois.
            </p>

            <label className="eq2-label" htmlFor="cfg-novo-nome">
              Nome
            </label>
            <input
              id="cfg-novo-nome"
              className="eq2-input"
              type="text"
              autoFocus
              maxLength={60}
              placeholder={aba === "insumo" ? "Ex: Embalagens" : "Ex: Trufas"}
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submitNova();
                }
                if (e.key === "Escape") setSheetAberta(false);
              }}
            />

            <span className="eq2-label" style={{ marginTop: 14 }}>
              Cor
            </span>
            <PaletaDores valor={novaCor} onChange={setNovaCor} />

            <div className="eq2-cfg__linha" style={{ marginTop: 18 }}>
              <button
                type="button"
                className="eq2-btn eq2-btn--secondary"
                onClick={() => setSheetAberta(false)}
                disabled={criando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="eq2-btn eq2-btn--primary"
                onClick={() => void submitNova()}
                disabled={criando}
              >
                {criando ? <Loader2 size={15} className="eq2-cfg__spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
                Criar categoria
              </button>
            </div>
          </div>
        </>
      )}

      {/* Estilos locais — fora do css compartilhado do módulo (outras lanes o
          usam); prefixo .eq2-cfg__ evita colisão. */}
      <style>{`
        .eq2-cfg__chip {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          padding: 3px 12px;
          border: 1px solid var(--eq2-border);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .eq2-cfg__acoes {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .eq2-cfg__acao {
          flex: 1;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid var(--eq2-border);
          border-radius: 10px;
          background: var(--eq2-surface);
          font: inherit;
          font-size: 12px;
          font-weight: 600;
          color: var(--eq2-ink);
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .eq2-cfg__acao:hover:not(:disabled) { background: #f4f7f5; }
        .eq2-cfg__acao:disabled { opacity: 0.45; cursor: not-allowed; }
        .eq2-cfg__acao--perigo { color: var(--eq2-danger); }
        .eq2-cfg__painel {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed var(--eq2-border);
          display: grid;
          gap: 10px;
        }
        .eq2-cfg__cores { display: flex; flex-wrap: wrap; gap: 2px; }
        .eq2-cfg__dot {
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 999px;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }
        .eq2-cfg__dot:disabled { opacity: 0.45; cursor: not-allowed; }
        .eq2-cfg__dot i {
          display: block;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          transition: box-shadow 0.15s;
        }
        .eq2-cfg__linha { display: flex; gap: 8px; }
        .eq2-cfg__linha > .eq2-btn { flex: 1; }
        .eq2-cfg__btn-perigo {
          background: var(--eq2-danger);
          color: #fff;
          border: 0;
        }
        .eq2-cfg__fechar {
          justify-self: start;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--eq2-muted);
        }
        .eq2-cfg__spin { animation: eq2-cfg-girar 0.9s linear infinite; }
        @keyframes eq2-cfg-girar { to { transform: rotate(360deg); } }
        @media (min-width: 900px) {
          /* Sheet no painel centralizado (padrão ProducaoV2Page) — mobile intacto */
          .eq2-sheet.eq2-sheet--config {
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
    </div>
  );
}

export default ConfiguracoesV2Page;
