/**
 * Receitas — LISTA do redesign estoque v2 (Faço).
 *
 * Entry point do editor `/estoque-v2/receita/:id` (hoje órfão — o fundador
 * "sentiu falta do editor de receitas" porque não havia como chegar nele).
 *
 * Estrutura espelha `InsumosV2Page`: barra com contagem → busca client-side →
 * chips de filtro (Todas / Com isto vendável / Sem preço / No vermelho) →
 * grid de cards (.eq2-grid--3 no desktop, coluna única no mobile) → FAB
 * "+ Nova receita" reutilizando o `ProdutoFormModal` compartilhado
 * (naturezaInicial="composto", mesmo contrato do ProdutosPage/InsumosV2Page).
 *
 * Card: custo/unidade (Σ ficha técnica p/ composto; preco_custo p/ simples —
 * conta do editor via `custoLinhaReceita`), valor de venda (preco_varejo ??
 * preco), margem R$ + % com semáforo (verde ≥60 · amarelo 30–60 · vermelho
 * <30), badges "usada em N receitas" e "sem ficha".
 *
 * Estados: skeleton · empty (MelissaCard) · erro com retry · sem resultados.
 * Pós-criação: banda "Próximo: montar a ficha técnica" leva direto ao editor.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ChefHat, Plus, RotateCcw, Search, TriangleAlert } from "lucide-react";
import "../shared/estoque-v2.css";
import { MelissaCard } from "../shared/MelissaCard";
import { SegmentedNav } from "../shared/SegmentedNav";
import { brl, formatarQtdEstoque } from "../shared/utils";
import { brlSmart } from "../../../hooks/use-receitas-v2";
import {
  semaforoMargem,
  useReceitasListaV2,
  type ReceitaListaV2,
} from "../../../hooks/use-receitas-lista-v2";
import { NATUREZA_LABELS } from "../../../types/producao";
import { useCategorias } from "../../../hooks/use-categorias";
import { ProdutoFormModal } from "../../produto/ProdutoFormModal";

/* ─────────────────────────── filtros ─────────────────────────── */

type FiltroReceita = "todas" | "vendavel" | "sem_preco" | "vermelho";

const FILTROS: Array<{ chave: FiltroReceita; label: string }> = [
  { chave: "todas", label: "Todas" },
  { chave: "vendavel", label: "Com isto vendável" },
  { chave: "sem_preco", label: "Sem preço" },
  { chave: "vermelho", label: "No vermelho" },
];

/** Remove acentos + minúsculas — busca tolerante ("brigadeiro" acha "Brigadeiro"). */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function bateFiltro(r: ReceitaListaV2, filtro: FiltroReceita): boolean {
  switch (filtro) {
    case "vendavel":
      return r.exibirVitrine;
    case "sem_preco":
      return r.valorVenda == null;
    case "vermelho":
      return r.margemPct != null && r.margemPct < 30;
    default:
      return true;
  }
}

/* ─────────────────────────── card ─────────────────────────── */

function emojiDaNatureza(r: ReceitaListaV2): string {
  return r.natureza === "composto" ? "🍳" : "📦";
}

function descricaoMeta(r: ReceitaListaV2): string {
  if (r.natureza === "composto") {
    return r.rendimentoLote != null
      ? `${NATUREZA_LABELS.composto} · rende ${formatarQtdEstoque(r.rendimentoLote, r.unidade)}/lote`
      : `${NATUREZA_LABELS.composto} · lote a definir`;
  }
  return NATUREZA_LABELS.simples;
}

/** "R$ 0,62/un · ficha técnica" — o custo do card (a conta que a Melissa faz). */
function CustoLinha({ receita }: { receita: ReceitaListaV2 }) {
  if (receita.custoUnidade != null) {
    return (
      <>
        <span style={{ color: "var(--eq2-ink)", fontWeight: 600 }}>
          {brlSmart(receita.custoUnidade)}/{receita.unidade}
        </span>{" "}
        de custo{receita.custoOrigem === "ficha" ? " · ficha técnica" : " · custo médio"}
      </>
    );
  }
  return (
    <>
      <span style={{ color: "var(--eq2-warn)", fontWeight: 600 }}>custo pendente</span>
      {receita.semFicha ? " — monte a ficha" : ""}
    </>
  );
}

function MargemBadge({ receita }: { receita: ReceitaListaV2 }) {
  const sem = semaforoMargem(receita.margemPct);
  if (!sem || receita.margemPct == null) return null;
  return (
    <span className={`eq2-badge eq2-badge--${sem}`}>margem {Math.round(receita.margemPct)}%</span>
  );
}

function CardReceita({ receita, onAbrir }: { receita: ReceitaListaV2; onAbrir: () => void }) {
  return (
    <button type="button" className="eq2-card" onClick={onAbrir} aria-label={`Abrir receita ${receita.nome}`}>
      <div className="eq2-card__top">
        <span className="eq2-card__icon" aria-hidden="true">
          {emojiDaNatureza(receita)}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0 }}>
            <span className="eq2-card__name">{receita.nome}</span>
            <MargemBadge receita={receita} />
            {receita.semFicha && <span className="eq2-badge eq2-badge--estimado">sem ficha</span>}
          </span>
          <div className="eq2-card__meta">{descricaoMeta(receita)}</div>
        </span>
        <span style={{ textAlign: "right", flex: "none", minWidth: 76 }}>
          <span className="eq2-card__price" style={{ display: "block" }}>
            {receita.valorVenda != null ? brl(receita.valorVenda) : "—"}
          </span>
          <span style={{ fontSize: 10, color: "var(--eq2-muted)", whiteSpace: "nowrap" }}>
            {receita.valorVenda != null ? "venda" : "sem preço"}
          </span>
        </span>
      </div>

      <div className="eq2-card__rows">
        <span style={{ minWidth: 0 }}>
          <CustoLinha receita={receita} />
        </span>
        {receita.margemReais != null && (
          <span
            style={{
              flex: "none",
              fontWeight: 600,
              color: receita.margemReais >= 0 ? "var(--eq2-ink)" : "var(--eq2-danger)",
              whiteSpace: "nowrap",
            }}
          >
            {receita.margemReais >= 0 ? "+" : "−"}
            {brl(Math.abs(receita.margemReais))}/un
          </span>
        )}
      </div>

      <div className="eq2-chips" style={{ marginTop: 10, alignItems: "center" }}>
        {receita.usadaEm > 0 && (
          <span className="eq2-badge" style={{ background: "#f0f3f1", color: "var(--eq2-muted)" }}>
            usada em {receita.usadaEm} receita{receita.usadaEm > 1 ? "s" : ""}
          </span>
        )}
        <span style={{ fontSize: 11, color: "var(--eq2-muted)" }}>
          No estoque: {formatarQtdEstoque(receita.estoqueAtual, receita.unidade)}
        </span>
      </div>
    </button>
  );
}

/* ─────────────────────────── skeleton ─────────────────────────── */

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
      <div className="eq2-skeleton" style={{ height: 12, width: "60%", borderRadius: 999, marginTop: 14 }} />
    </div>
  );
}

/* ─────────────────────────── página ─────────────────────────── */

export function ReceitasV2ListPage() {
  const navigate = useNavigate();
  const { receitas, loading, error, isFallback, recarregar } = useReceitasListaV2();
  // Catálogo real de categorias — exigido pelo ProdutoFormModal (padrão InsumosV2Page)
  const { categorias: categoriasConfig } = useCategorias();

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroReceita>("todas");
  const [showNovo, setShowNovo] = useState(false);
  /** receita recém-criada aguardando a ficha (banda Melissa no topo) */
  const [bandaNova, setBandaNova] = useState<{ id: number; nome: string } | null>(null);

  // maior id já visto — pós-criação, o ProdutoFormModal não devolve o id do
  // composto (contrato atual do modal), então a "nova receita" é o maior id
  // que apareceu na recarga.
  const maiorIdRef = useRef(0);
  useEffect(() => {
    for (const r of receitas) {
      if (r.id > maiorIdRef.current) maiorIdRef.current = r.id;
    }
  }, [receitas]);

  const filtrados = useMemo(() => {
    const q = normalizar(busca.trim());
    return receitas.filter(
      (r) => bateFiltro(r, filtro) && (!q || normalizar(r.nome).includes(q)),
    );
  }, [receitas, busca, filtro]);

  const semFicha = useMemo(
    () => receitas.filter((r) => r.semFicha),
    [receitas],
  );

  const limparFiltros = () => {
    setBusca("");
    setFiltro("todas");
  };

  const abrirEditor = (id: number) => navigate(`/estoque-v2/receita/${id}`);

  const handleSucesso = async () => {
    setShowNovo(false);
    toast.success("Receita criada! 🎉");
    const antes = maiorIdRef.current;
    const lista = await recarregar();
    if (antes > 0) {
      const nova = lista
        .filter((r) => r.id > antes)
        .sort((a, b) => b.id - a.id)[0];
      if (nova) setBandaNova({ id: nova.id, nome: nova.nome });
    }
  };

  return (
    <div className="eq2">
      <div className="eq2-shell" style={{ paddingBottom: 96 }}>
        <header className="eq2-bar">
          <div style={{ minWidth: 0 }}>
            <div className="eq2-bar__title">Receitas</div>
            <div className="eq2-bar__sub">O que você faz — receita vira produto</div>
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
              {filtrados.length === 1 ? "1 receita" : `${filtrados.length} receitas`}
            </span>
          )}
        </header>

        <main style={{ display: "grid", gap: 14, paddingTop: 14 }}>
          {/* Compro · Faço · Vendo — área atual: Faço (gap do grid cuida do espaço) */}
          <SegmentedNav ativo="faco" style={{ margin: 0 }} />

          {isFallback && (
            <p style={{ fontSize: 11, color: "var(--eq2-warn)", margin: 0 }}>
              dados de demonstração — faça login para ver suas receitas reais
            </p>
          )}

          {/* banda pós-criação: o editor é o próximo passo natural */}
          {bandaNova && !loading && !error && (
            <MelissaCard
              msg={`“${bandaNova.nome}” criado. Próximo: montar a ficha técnica — eu calculo o custo de cada ingrediente.`}
              actionLabel="Montar ficha técnica"
              onAction={() => abrirEditor(bandaNova.id)}
              secondaryLabel="Agora não"
              onSecondary={() => setBandaNova(null)}
            />
          )}

          {/* nudge da Melissa: composto sem ficha = custo cego */}
          {!bandaNova && !loading && !error && semFicha.length > 0 && receitas.length > 0 && (
            <MelissaCard
              msg={
                semFicha.length === 1
                  ? `“${semFicha[0].nome}” ainda não tem ficha técnica. Me diga do que ela é feita — eu calculo o custo de cada ingrediente.`
                  : `${semFicha.length} receitas suas ainda não têm ficha técnica. Me diga do que são feitas — eu calculo o custo de cada ingrediente.`
              }
              actionLabel="Completar agora"
              onAction={() => abrirEditor(semFicha[0].id)}
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
              placeholder="Buscar receita"
              aria-label="Buscar receita"
              autoComplete="off"
              style={{ paddingLeft: 36 }}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* chips de filtro */}
          <div className="eq2-chips" role="group" aria-label="Filtrar receitas">
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
              <p className="eq2-state__title">Não foi possível carregar suas receitas</p>
              <p style={{ margin: 0 }}>Sua conexão caiu no meio do caminho. Nada foi perdido — tente de novo.</p>
              <button type="button" className="eq2-btn eq2-btn--secondary" onClick={() => recarregar()}>
                <RotateCcw size={16} aria-hidden="true" /> Tentar de novo
              </button>
            </div>
          ) : receitas.length === 0 ? (
            <MelissaCard
              msg="Crie a primeira receita/ficha técnica. Eu calculo o custo de cada ingrediente."
              actionLabel="Nova receita"
              onAction={() => setShowNovo(true)}
            />
          ) : filtrados.length === 0 ? (
            <div className="eq2-state eq2-card eq2-card--static">
              <ChefHat size={32} aria-hidden="true" />
              <p className="eq2-state__title">Nada encontrado</p>
              <p style={{ margin: 0 }}>Nenhuma receita bate com essa busca ou filtro.</p>
              <button type="button" className="eq2-btn eq2-btn--link" onClick={limparFiltros}>
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="eq2-grid eq2-grid--3">
              {filtrados.map((r) => (
                <CardReceita key={r.id} receita={r} onAbrir={() => abrirEditor(r.id)} />
              ))}
            </div>
          )}
        </main>

        {/* FAB — nova receita (composto por padrão: receita = ficha técnica) */}
        {!loading && !error && (
          <button
            type="button"
            className="eq2-btn eq2-btn--primary"
            onClick={() => setShowNovo(true)}
            aria-label="Adicionar nova receita"
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
            <Plus size={18} aria-hidden="true" /> Nova receita
          </button>
        )}
      </div>

      {/* Modal FORA do gate de loading (padrão HOTFIX ProdutosPage):
          refetch em fundo não pode desmontar o form no meio da digitação. */}
      {showNovo && (
        <ProdutoFormModal
          categorias={categoriasConfig}
          naturezaInicial="composto"
          onClose={() => setShowNovo(false)}
          onSuccess={handleSucesso}
        />
      )}
    </div>
  );
}

export default ReceitasV2ListPage;
