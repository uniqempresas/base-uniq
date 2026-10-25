/**
 * Produtos (V2) — LISTA "Vendo" do redesign estoque v2.
 *
 * Layout no padrão dos irmãos de lista do módulo (InsumosV2Page /
 * ReceitasV2ListPage): .eq2-bar com contagem → SegmentedNav → busca
 * client-side (acento-insensível) → chips de filtro → grid .eq2-grid--3 →
 * estados skeleton · empty (MelissaCard) · erro+retry · sem resultados.
 *
 * Card por produto VENDÁVEL — universo e contas VINDOS DOS HOOKS PÚBLICOS
 * (zero conta duplicada, via use-produtos-lista-v2):
 *  - preço de venda grande (preco_varejo ?? preco; sem preço → badge "sem preço")
 *  - custo/un com a ORIGEM visível: "ficha técnica" × "custo médio"; pendente
 *    = "custo pendente" (+ badge "sem custo" em receita)
 *  - margem R$ + % com semáforo (badgeClassDoSemaforo do modelo de margem)
 *  - linha do estoque + barra de progresso (heurística visual InsumosV2:
 *    mínimo × 3 = prateleira cheia) e badge "acabando"/"sem estoque"
 *  - toque no card → /estoque-v2/produtos/:id/simulador
 *
 * CTA "+ Novo produto": FAB no mobile / botão no header (≥900px) — abre o
 * ProdutoNovoModal REAL (veredito de mercado lib-2): primeiro a escolha
 * "Simples — compro pronto e revendo" × "Feito em casa — receita"; o resto é
 * nome + categoria (chips opcionais) + preço (+ rendimento, na trilha
 * receita). Composto criado dispara a banda pós-salvar "Próximo: montar a
 * ficha técnica (ingredientes, embalagem e rótulo → o custo)" →
 * /estoque-v2/receita/:id; simples sem preço ganha a banda do simulador.
 *
 * Demo (sem sessão): lista mock-first + submit do modal desabilitado "(modo
 * demo)" — padrão do módulo; CTA continua abrindo o modal para prévia do fluxo.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { PackageSearch, Plus, RotateCcw, Search, TriangleAlert } from "lucide-react";
import "../shared/estoque-v2.css";
import { MelissaCard } from "../shared/MelissaCard";
import { SegmentedNav } from "../shared/SegmentedNav";
import { brl, formatarQtdEstoque } from "../shared/utils";
import { brlSmart } from "../../../hooks/use-receitas-v2";
import { badgeClassDoSemaforo } from "../../../hooks/use-margem-v2";
import {
  estaAcabando,
  useProdutosListaV2,
  type ProdutoListaV2,
} from "../../../hooks/use-produtos-lista-v2";
import { ProdutoNovoModal } from "./ProdutoNovoModal";

/* ─────────────────────────── filtros ─────────────────────────── */

type FiltroProduto = "todos" | "com_estoque" | "acabando" | "sem_preco" | "vermelho";

const FILTROS: Array<{ chave: FiltroProduto; label: string }> = [
  { chave: "todos", label: "Todos" },
  { chave: "com_estoque", label: "Com estoque" },
  { chave: "acabando", label: "Acabando" },
  { chave: "sem_preco", label: "Sem preço" },
  { chave: "vermelho", label: "No vermelho" },
];

/** Remove acentos + minúsculas — busca tolerante (padrão Insumos/Receitas). */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function bateFiltro(p: ProdutoListaV2, filtro: FiltroProduto): boolean {
  switch (filtro) {
    case "com_estoque":
      return p.estoque > 0;
    case "acabando":
      return estaAcabando(p);
    case "sem_preco":
      return p.preco === null;
    case "vermelho":
      return p.semaforo === "vermelho";
    default:
      return true;
  }
}

/** Nível do estoque no card: mínimo × 3 como "prateleira cheia" (heurística visual da lista de Insumos). */
function nivelEstoquePct(estoque: number, estoqueMinimo: number): number {
  if (estoque <= 0) return 0;
  const cap = estoqueMinimo > 0 ? estoqueMinimo * 3 : estoque;
  return Math.min(100, Math.max(4, Math.round((estoque / cap) * 100)));
}

/* Emoji por categoria — o redesign usa ícone leve, não foto (padrão Insumos). */
const EMOJI_POR_CATEGORIA: Array<[RegExp, string]> = [
  [/roup|camis|vestid|calç|calc|jean/i, "👕"],
  [/tênis|tenis|sap|sand|calçado/i, "👟"],
  [/acess|mochil|bols|relóg|relog/i, "👜"],
  [/eletr|fone|smart|tech/i, "🎧"],
  [/bel|perfum|skinc|cuidado/i, "💄"],
  [/latic|queij|leite|creme/i, "🥛"],
  [/doce|choc|confeit|cacau|bolo|receita/i, "🧁"],
  [/embala|caixa|pote/i, "📦"],
  [/hort|fruta|legum|verd|lim/i, "🍋"],
  [/pad|farinha|trigo|ferment/i, "🌾"],
  [/bebida|suco|refresc|beb/i, "🧃"],
];

function emojiDoProduto(p: ProdutoListaV2): string {
  for (const [re, e] of EMOJI_POR_CATEGORIA) if (re.test(p.categoria)) return e;
  return p.natureza === "composto" ? "🍰" : "🛍️";
}

/* ─────────────────────────── card ─────────────────────────── */

function CardProduto({ produto, onAbrir }: { produto: ProdutoListaV2; onAbrir: () => void }) {
  const acabando = estaAcabando(produto);
  const zerado = produto.estoque === 0 && produto.estoqueMinimo > 0;
  const pct = nivelEstoquePct(produto.estoque, produto.estoqueMinimo);
  const margemPctNum = produto.margemPct !== null ? Math.round(produto.margemPct * 100) : null;
  const composto = produto.natureza === "composto";

  return (
    <button type="button" className="eq2-card" onClick={onAbrir} aria-label={`Abrir simulador de ${produto.nome}`}>
      <div className="eq2-card__top">
        <span className="eq2-card__icon" aria-hidden="true">
          {emojiDoProduto(produto)}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
            <span className="eq2-card__name">{produto.nome}</span>
            {margemPctNum !== null && (
              <span className={`eq2-badge ${badgeClassDoSemaforo(produto.semaforo)}`}>margem {margemPctNum}%</span>
            )}
            {(acabando || zerado) && (
              <span className="eq2-badge eq2-badge--low">{produto.estoque === 0 ? "sem estoque" : "acabando"}</span>
            )}
            {produto.preco === null && <span className="eq2-badge eq2-badge--estimado">sem preço</span>}
            {composto && produto.custo === null && <span className="eq2-badge eq2-badge--estimado">sem custo</span>}
          </span>
          <div className="eq2-card__meta">
            {produto.categoria}
            {composto ? " · feito em casa" : ""}
          </div>
        </span>
        <span style={{ textAlign: "right", flex: "none", minWidth: 76 }}>
          <span className="eq2-prod__preco">{produto.preco !== null ? brl(produto.preco) : "—"}</span>
          <span style={{ display: "block", fontSize: 10, color: "var(--eq2-muted)", whiteSpace: "nowrap" }}>
            {produto.preco !== null ? "venda" : "a definir"}
          </span>
        </span>
      </div>

      <div className="eq2-card__rows">
        <span style={{ minWidth: 0 }}>
          {produto.custo !== null ? (
            <>
              <span style={{ color: "var(--eq2-ink)", fontWeight: 600 }}>
                {brlSmart(produto.custo)}/{produto.unidade}
              </span>{" "}
              de custo · {produto.custoVemDaFicha ? "ficha técnica" : "custo médio"}
            </>
          ) : (
            <>
              <span style={{ color: "var(--eq2-warn)", fontWeight: 600 }}>custo pendente</span>
              {composto ? " — monte a ficha" : " — registre o custo"}
            </>
          )}
        </span>
        {produto.margemReais !== null && (
          <span
            style={{
              flex: "none",
              fontWeight: 600,
              color: produto.margemReais >= 0 ? "var(--eq2-ink)" : "var(--eq2-danger)",
              whiteSpace: "nowrap",
            }}
          >
            {produto.margemReais >= 0 ? "+" : "−"}
            {brl(Math.abs(produto.margemReais))}/{produto.unidade}
          </span>
        )}
      </div>

      <div className="eq2-card__rows" style={{ marginTop: 12, display: "block" }}>
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
          <span style={acabando ? { color: "var(--eq2-danger)", fontWeight: 600 } : undefined}>
            {formatarQtdEstoque(produto.estoque, produto.unidade)}
            {produto.estoqueMinimo > 0 ? ` · mín ${formatarQtdEstoque(produto.estoqueMinimo, produto.unidade)}` : ""}
          </span>
        </span>
        <div
          className="eq2-progress"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Nível de estoque de ${produto.nome}`}
        >
          <i style={{ width: `${pct}%`, background: acabando ? "var(--eq2-danger)" : "var(--eq2-accent)" }} />
        </div>
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
          <div className="eq2-skeleton" style={{ height: 17, width: 72 }} />
          <div className="eq2-skeleton" style={{ height: 9, width: 44 }} />
        </div>
      </div>
      <div className="eq2-skeleton" style={{ height: 12, width: "60%", borderRadius: 999, marginTop: 14 }} />
      <div className="eq2-skeleton" style={{ height: 5, width: "100%", borderRadius: 999, marginTop: 14 }} />
    </div>
  );
}

/* ─────────────────────────── página ─────────────────────────── */

export function ProdutosV2ListPage() {
  const navigate = useNavigate();
  const { itens, loading, error, isFallback, recarregar, criarSimples, criarComposto } = useProdutosListaV2();

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroProduto>("todos");
  const [showNovo, setShowNovo] = useState(false);
  /** criado agora — banda Melissa com o próximo passo por tipo (padrão Receitas) */
  const [bandaNova, setBandaNova] = useState<{
    id: number;
    nome: string;
    tipo: "simples" | "composto";
  } | null>(null);

  const filtrados = useMemo(() => {
    const q = normalizar(busca.trim());
    return itens.filter(
      (p) => bateFiltro(p, filtro) && (!q || normalizar(p.nome).includes(q)),
    );
  }, [itens, busca, filtro]);

  const limparFiltros = () => {
    setBusca("");
    setFiltro("todos");
  };

  const abrirSimulador = (produtoId: string) => navigate(`/estoque-v2/produtos/${produtoId}/simulador`);

  const handleSucesso = (criado: { id: number | null; nome: string; tipo: "simples" | "composto" }) => {
    setShowNovo(false);
    toast.success(criado.tipo === "composto" ? "Receita criada! 🎉" : "Produto criado! 🎉");
    if (criado.id != null) setBandaNova({ id: criado.id, nome: criado.nome, tipo: criado.tipo });
    // a lista já recarrega dentro do hook (recarregar pós-INSERT)
  };

  return (
    <div className="eq2">
      <div className="eq2-shell" style={{ paddingBottom: 96 }}>
        <header className="eq2-bar">
          <div style={{ minWidth: 0 }}>
            <div className="eq2-bar__title">Produtos</div>
            <div className="eq2-bar__sub">Vendo — o que o cliente compra</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
            {!loading && !error && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--eq2-muted)",
                  background: "var(--eq2-surface)",
                  border: "1px solid var(--eq2-border)",
                  borderRadius: 999,
                  padding: "4px 12px",
                }}
              >
                {filtrados.length === 1 ? "1 produto" : `${filtrados.length} produtos`}
              </span>
            )}
            {/* desktop ≥900px: o CTA vive no header; no mobile, é FAB (CSS scoped) */}
            <button
              type="button"
              className="eq2-btn eq2-btn--primary eq2-prod__cta"
              onClick={() => setShowNovo(true)}
              aria-label="Adicionar novo produto"
            >
              <Plus size={16} aria-hidden="true" /> Novo produto
            </button>
          </div>
        </header>

        <main style={{ display: "grid", gap: 14, paddingTop: 14 }}>
          {/* Compro · Faço · Vendo — área atual: Vendo */}
          <SegmentedNav ativo="vendo" style={{ margin: 0 }} />

          {isFallback && (
            <p style={{ fontSize: 11, color: "var(--eq2-warn)", margin: 0 }}>
              dados de demonstração — faça login para ver seus produtos reais
            </p>
          )}

          {/* banda pós-criação: o próximo passo vendido, não imposto */}
          {bandaNova && !loading && !error && (
            <MelissaCard
              msg={
                bandaNova.tipo === "composto"
                  ? `“${bandaNova.nome}” criado. Próximo: montar a ficha técnica — ingredientes, embalagem e rótulo viram o seu custo real.`
                  : `“${bandaNova.nome}” está na lista. Quer preço com margem na tela? O simulador resolve em um minuto.`
              }
              actionLabel={bandaNova.tipo === "composto" ? "Montar ficha técnica" : "Ajustar preço"}
              onAction={() => {
                const alvo =
                  bandaNova.tipo === "composto"
                    ? `/estoque-v2/receita/${bandaNova.id}`
                    : `/estoque-v2/produtos/${bandaNova.id}/simulador`;
                setBandaNova(null);
                navigate(alvo);
              }}
              secondaryLabel="Agora não"
              onSecondary={() => setBandaNova(null)}
            />
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
              placeholder="Buscar produto"
              aria-label="Buscar produto"
              autoComplete="off"
              style={{ paddingLeft: 36 }}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* chips de filtro */}
          <div className="eq2-chips" role="group" aria-label="Filtrar produtos">
            {FILTROS.map(({ chave, label }) => (
              <button
                key={chave}
                type="button"
                className={`eq2-chip${filtro === chave ? " is-active" : ""}`}
                aria-pressed={filtro === chave}
                onClick={() => setFiltro(chave)}
              >
                {label}
              </button>
            ))}
          </div>

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
              <p className="eq2-state__title">Não foi possível carregar seus produtos</p>
              <p style={{ margin: 0 }}>
                {error.includes("Empresa")
                  ? error
                  : "Sua conexão caiu no meio do caminho. Nada foi perdido — tente de novo."}
              </p>
              <button type="button" className="eq2-btn eq2-btn--secondary" onClick={recarregar}>
                <RotateCcw size={16} aria-hidden="true" /> Tentar de novo
              </button>
            </div>
          ) : itens.length === 0 ? (
            <MelissaCard
              msg="Nenhum produto à venda ainda. Me conta o primeiro: ele chega pronto do fornecedor ou sai da sua cozinha? Eu separo os dois no cadastro."
              actionLabel="Novo produto"
              onAction={() => setShowNovo(true)}
            />
          ) : filtrados.length === 0 ? (
            <div className="eq2-state eq2-card eq2-card--static">
              <PackageSearch size={32} aria-hidden="true" />
              <p className="eq2-state__title">Nada encontrado</p>
              <p style={{ margin: 0 }}>Nenhum produto bate com essa busca ou filtro.</p>
              <button type="button" className="eq2-btn eq2-btn--link" onClick={limparFiltros}>
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="eq2-grid eq2-grid--3">
              {filtrados.map((p) => (
                <CardProduto
                  key={p.produtoId}
                  produto={p}
                  onAbrir={() => abrirSimulador(p.produtoId)}
                />
              ))}
            </div>
          )}
        </main>

        {/* FAB — novo produto (mobile; ≥900px vira botão no header) */}
        {!loading && !error && (
          <button
            type="button"
            className="eq2-btn eq2-btn--primary eq2-prod__fab"
            onClick={() => setShowNovo(true)}
            aria-label="Adicionar novo produto"
          >
            <Plus size={18} aria-hidden="true" /> Novo produto
          </button>
        )}
      </div>

      {/* Modal FORA do gate de loading (padrão HOTFIX ProdutosPage):
          refetch em fundo não pode desmontar o form no meio da digitação. */}
      {showNovo && (
        <ProdutoNovoModal
          onClose={() => setShowNovo(false)}
          onSuccess={handleSucesso}
          criarSimples={criarSimples}
          criarComposto={criarComposto}
        />
      )}

      {/* Estilos locais — fora do css compartilhado do módulo (outras lanes o
          usam); prefixo .eq2-prod__ evita colisão. */}
      <style>{`
        .eq2-prod__preco {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .eq2-prod__fab {
          position: fixed;
          right: 20px;
          bottom: calc(20px + env(safe-area-inset-bottom, 0px));
          z-index: 40;
          border-radius: 999px;
          padding: 14px 20px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
        }
        .eq2-prod__cta { display: none; }
        @media (min-width: 900px) {
          .eq2-prod__fab { display: none; }
          .eq2-prod__cta { display: inline-flex; min-height: 40px; padding: 8px 16px; font-size: 13px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .eq2-prod__fab, .eq2-prod__cta { transition: none; }
        }
      `}</style>
    </div>
  );
}

export default ProdutosV2ListPage;
