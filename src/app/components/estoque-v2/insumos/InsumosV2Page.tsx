/**
 * Insumos — redesign estoque v2 (Compro).
 * Wireframe de referência: tracking/Redesign_ComproVendoFaco/insumos-lista.html
 *
 * Estrutura: barra com contagem → busca client-side → chips de categoria
 * (derivadas do embed `me_categoria`) → grid de cards (.eq2-card, 3 col no
 * desktop) → FAB "Novo insumo" reutilizando o ProdutoFormModal compartilhado
 * (natureza pré-marcada "insumo", padrão M1 do ProdutosPage).
 * Estados: skeleton · empty (MelissaCard) · erro com retry · sem resultados.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Plus, RotateCcw, Search, TriangleAlert, PackageSearch } from "lucide-react";
import "../shared/estoque-v2.css";
import { MelissaCard } from "../shared/MelissaCard";
import { formatarQtdEstoque } from "../shared/utils";
import {
  formatarTaxa,
  taxaUnitariaInsumo,
  useInsumosV2,
  type InsumoV2,
} from "../../../hooks/use-insumos-v2";
import { useCategorias } from "../../../hooks/use-categorias";
import { ProdutoFormModal } from "../../produto/ProdutoFormModal";

/* Emoji genérico por categoria — o redesign usa ícone leve, não foto. */
const EMOJI_POR_CATEGORIA: Array<[RegExp, string]> = [
  [/latic|queij|leite/i, "🥛"],
  [/doce|choc|confeit|cacau/i, "🍫"],
  [/embala|caixa|pote/i, "📦"],
  [/hort|fruta|legum|verd|lim/i, "🍋"],
  [/pad|farinha|trigo|ferment/i, "🌾"],
  [/bebida|suco|refresc/i, "🧃"],
  [/doceria|confeitaria/i, "🧁"],
];

function emojiDaCategoria(categoria: string): string {
  for (const [re, emoji] of EMOJI_POR_CATEGORIA) if (re.test(categoria)) return emoji;
  return "🧺";
}

/** Remove acentos + minúsculas — busca tolerante ("limao" acha "limão"). */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Nível do estoque no card: mínimo × 3 como "prateleira cheia" (heurística do redesign). */
function nivelEstoque(estoque: number, estoqueMinimo: number): number {
  if (estoque <= 0) return 0;
  const cap = estoqueMinimo > 0 ? estoqueMinimo * 3 : estoque;
  return Math.min(100, Math.max(4, Math.round((estoque / cap) * 100)));
}

function descricaoCompra(i: InsumoV2): string {
  if (!i.unidadeCompra) return i.unidade;
  if (i.fatorConversao == null) return `${i.unidadeCompra} · conversão pendente`;
  return `${i.unidadeCompra} ${formatarQtdEstoque(i.fatorConversao, i.unidade)}`;
}

/** "R$ 0,0139/g" destacado no card — a taxa real do insumo (precoUnitarioBase). */
function TaxaDestaque({ insumo }: { insumo: InsumoV2 }) {
  const taxa = taxaUnitariaInsumo(insumo);
  if (!taxa) {
    return (
      <div style={{ textAlign: "right", flex: "none", minWidth: 76 }}>
        <div className="eq2-card__price">—</div>
        <div style={{ fontSize: 10, color: "var(--eq2-muted)" }}>sem custo ainda</div>
      </div>
    );
  }
  return (
    <div style={{ textAlign: "right", flex: "none", minWidth: 76 }}>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
        {formatarTaxa(taxa.valor)}
        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--eq2-muted)" }}>/{taxa.unidade}</span>
      </div>
      <div style={{ fontSize: 10, color: "var(--eq2-muted)", whiteSpace: "nowrap" }}>
        {taxa.origem === "compra" ? "última compra" : "custo médio"}
      </div>
    </div>
  );
}

function CardInsumo({ insumo, onAbrir }: { insumo: InsumoV2; onAbrir: () => void }) {
  const baixo = insumo.estoque <= insumo.estoqueMinimo;
  const semPreco = taxaUnitariaInsumo(insumo) == null;
  const pct = nivelEstoque(insumo.estoque, insumo.estoqueMinimo);

  return (
    <button type="button" className="eq2-card" onClick={onAbrir} aria-label={`Abrir ${insumo.nome}`}>
      <div className="eq2-card__top">
        <span className="eq2-card__icon" aria-hidden="true">
          {emojiDaCategoria(insumo.categoriaNome)}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0 }}
          >
            <span className="eq2-card__name">{insumo.nome}</span>
            {baixo && <span className="eq2-badge eq2-badge--low">acabando</span>}
            {!baixo && semPreco && <span className="eq2-badge eq2-badge--estimado">estimado</span>}
          </span>
          <div className="eq2-card__meta">
            {descricaoCompra(insumo)} · {insumo.categoriaNome}
          </div>
        </span>
        <TaxaDestaque insumo={insumo} />
      </div>

      <div className="eq2-card__rows" style={{ marginTop: 12 }}>
        <span style={{ flex: 1 }}>
          <span
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              fontSize: 11,
              color: "var(--eq2-muted)",
              marginBottom: 4,
            }}
          >
            <span>No estoque</span>
            <span style={{ color: baixo ? "var(--eq2-danger)" : undefined, fontWeight: baixo ? 600 : 400 }}>
              {formatarQtdEstoque(insumo.estoque, insumo.unidade)}
            </span>
          </span>
          <div
            className="eq2-progress"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Nível de estoque de ${insumo.nome}`}
          >
            <i
              style={{
                width: `${pct}%`,
                background: baixo ? "var(--eq2-danger)" : "var(--eq2-accent)",
              }}
            />
          </div>
        </span>
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="eq2-card eq2-card--static" aria-hidden="true">
      <div className="eq2-card__top">
        <div className="eq2-skeleton" style={{ width: 40, height: 40, borderRadius: 10, flex: "none" }} />
        <div style={{ flex: 1, display: "grid", gap: 8, alignContent: "center" }}>
          <div className="eq2-skeleton" style={{ height: 13, width: "70%" }} />
          <div className="eq2-skeleton" style={{ height: 10, width: "45%" }} />
        </div>
        <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
          <div className="eq2-skeleton" style={{ height: 16, width: 72 }} />
          <div className="eq2-skeleton" style={{ height: 9, width: 52 }} />
        </div>
      </div>
      <div className="eq2-skeleton" style={{ height: 5, width: "100%", borderRadius: 999, marginTop: 14 }} />
    </div>
  );
}

export function InsumosV2Page() {
  const navigate = useNavigate();
  const { insumos, loading, error, isFallback, recarregar } = useInsumosV2();
  // Catálogo real de categorias — exigido pelo ProdutoFormModal (padrão ProdutosPage)
  const { categorias: categoriasConfig } = useCategorias();

  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<number | "todos">("todos");
  const [showNovo, setShowNovo] = useState(false);

  // Chips derivados do embed me_categoria da própria query (sem fetch extra)
  const chips = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const i of insumos) {
      const id = i.categoriaId;
      const nome = i.categoriaNome;
      if (id == null || !nome || nome === "Sem categoria") continue;
      if (!mapa.has(id)) mapa.set(id, nome);
    }
    return [...mapa.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [insumos]);

  const filtrados = useMemo(() => {
    const q = normalizar(busca.trim());
    return insumos.filter((i) => {
      const catOk = categoriaAtiva === "todos" || i.categoriaId === categoriaAtiva;
      const nomeOk = !q || normalizar(i.nome).includes(q);
      return catOk && nomeOk;
    });
  }, [insumos, busca, categoriaAtiva]);

  const limparFiltros = () => {
    setBusca("");
    setCategoriaAtiva("todos");
  };

  const abrirNovo = () => setShowNovo(true);

  return (
    <div className="eq2">
      <div className="eq2-shell" style={{ paddingBottom: 96 }}>
        <header className="eq2-bar">
          <div style={{ minWidth: 0 }}>
            <div className="eq2-bar__title">Insumos</div>
            <div className="eq2-bar__sub">O que você compra pra produzir</div>
          </div>
          {!loading && !error && (
            <span
              style={{
                flex: "none",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--eq2-muted)",
                background: "var(--eq2-surface)",
                border: "1px solid var(--eq2-border)",
                borderRadius: 999,
                padding: "4px 12px",
              }}
            >
              {filtrados.length === 1 ? "1 item" : `${filtrados.length} itens`}
            </span>
          )}
        </header>

        <main style={{ display: "grid", gap: 14, paddingTop: 14 }}>
          {isFallback && (
            <p style={{ fontSize: 11, color: "var(--eq2-warn)", margin: 0 }}>
              dados de demonstração — faça login para ver seus insumos reais
            </p>
          )}

          {/* busca */}
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              aria-hidden="true"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--eq2-muted)" }}
            />
            <input
              className="eq2-input"
              type="search"
              placeholder="Buscar insumo"
              aria-label="Buscar insumo"
              autoComplete="off"
              style={{ paddingLeft: 36 }}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* chips de categoria */}
          {chips.length > 0 && (
            <div className="eq2-chips" role="group" aria-label="Filtrar por categoria">
              <button
                type="button"
                className={`eq2-chip${categoriaAtiva === "todos" ? " is-active" : ""}`}
                aria-pressed={categoriaAtiva === "todos"}
                onClick={() => setCategoriaAtiva("todos")}
              >
                Todos
              </button>
              {chips.map(([id, nome]) => (
                <button
                  key={id}
                  type="button"
                  className={`eq2-chip${categoriaAtiva === id ? " is-active" : ""}`}
                  aria-pressed={categoriaAtiva === id}
                  onClick={() => setCategoriaAtiva(id)}
                >
                  {nome}
                </button>
              ))}
            </div>
          )}

          {/* ---- estados ---- */}
          {loading ? (
            <div className="eq2-grid eq2-grid--3" aria-hidden="true">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <div className="eq2-state eq2-card eq2-card--static">
              <TriangleAlert size={32} aria-hidden="true" style={{ color: "var(--eq2-danger)" }} />
              <p className="eq2-state__title">Não foi possível carregar seus insumos</p>
              <p style={{ margin: 0 }}>Sua conexão caiu no meio do caminho. Nada foi perdido — tente de novo.</p>
              <button type="button" className="eq2-btn eq2-btn--secondary" onClick={recarregar}>
                <RotateCcw size={16} aria-hidden="true" /> Tentar de novo
              </button>
            </div>
          ) : insumos.length === 0 ? (
            <MelissaCard
              msg="Cadastre o primeiro insumo. Eu cuido da conversão pra você — lata vira grama, dúzia vira unidade, sem conta sua."
              actionLabel="Cadastrar insumo"
              onAction={abrirNovo}
            />
          ) : filtrados.length === 0 ? (
            <div className="eq2-state eq2-card eq2-card--static">
              <PackageSearch size={32} aria-hidden="true" />
              <p className="eq2-state__title">Nada encontrado</p>
              <p style={{ margin: 0 }}>Nenhum insumo bate com essa busca ou categoria.</p>
              <button type="button" className="eq2-btn eq2-btn--link" onClick={limparFiltros}>
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="eq2-grid eq2-grid--3">
              {filtrados.map((i) => (
                <CardInsumo
                  key={i.id}
                  insumo={i}
                  onAbrir={() => navigate(`/estoque-v2/insumos/${i.id}`)}
                />
              ))}
            </div>
          )}
        </main>

        {/* FAB — novo insumo */}
        {!loading && !error && (
          <button
            type="button"
            className="eq2-btn eq2-btn--primary"
            onClick={abrirNovo}
            aria-label="Adicionar novo insumo"
            style={{
              position: "fixed",
              right: 20,
              bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
              zIndex: 40,
              borderRadius: 999,
              padding: "14px 20px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.22)",
            }}
          >
            <Plus size={18} aria-hidden="true" /> Novo insumo
          </button>
        )}
      </div>

      {/* Modal FORA do gate de loading (padrão HOTFIX ProdutosPage):
          refetch em fundo não pode desmontar o form no meio da digitação. */}
      {showNovo && (
        <ProdutoFormModal
          categorias={categoriasConfig}
          naturezaInicial="insumo"
          onClose={() => setShowNovo(false)}
          onSuccess={() => {
            setShowNovo(false);
            toast.success("Insumo cadastrado com sucesso! 🎉");
            recarregar();
          }}
        />
      )}
    </div>
  );
}

export default InsumosV2Page;
