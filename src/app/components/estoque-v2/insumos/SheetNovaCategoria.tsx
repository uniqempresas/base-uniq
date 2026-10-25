/**
 * SheetNovaCategoria — mini-sheet "Nova categoria de insumo" (Estoque v2).
 *
 * Compartilhado entre os dois pontos de criação da prateleira:
 * - InsumoNovoModal (chip "+ Criar nova" → cria e pré-seleciona);
 * - InsumosV2Page (chip "+ Nova categoria" na fila de chips → cria e aparece na fila).
 *
 * Um campo só, sem ceremonya: nome da categoria + botão criar. Grava via
 * `criarCategoriaInsumo` do use-insumos-v2 (INSERT `me_categoria` com
 * `escopo='insumo'` — categorias de PRODUTO não são tocadas). Duplicidade
 * devolve mensagem amigável ("Categoria já existe") exibida inline.
 *
 * ⚠️ Renderizado DENTRO do <form> do InsumoNovoModal quando aberto por ele —
 * por isso é um <div> com Enter-handler, nunca um segundo <form> (HTML não
 * permite form aninhado).
 *
 * Visual no padrão do módulo: `.eq2-sheet` (bottom sheet no mobile; ≥900px
 * sheet centralizada menor, ~420px, via `<style>` scoped — classe própria,
 * não vaza). Fica POR CIMA do sheet do modal: z-index inline 70/71 > base 60/61.
 *
 * Modo demo (sem sessão): botão "Criar categoria (modo demo)" desabilitado +
 * hint — padrão do módulo.
 */
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import type { CriarCategoriaInsumoResult } from "../../../hooks/use-insumos-v2";

export interface SheetNovaCategoriaProps {
  onFechar: () => void;
  /**
   * categoria criada (id null = modo demo) — opcional: o modal usa para
   * pré-selecionar; a lista da página não precisa (o hook já recarrega a fila).
   */
  onCriada?: (criada: { id: number | null; nome: string }) => void;
  /** grava de verdade (INSERT me_categoria escopo='insumo'); vem do hook da lista */
  criarCategoria: (nome: string) => Promise<CriarCategoriaInsumoResult>;
}

export function SheetNovaCategoria({ onFechar, onCriada, criarCategoria }: SheetNovaCategoriaProps) {
  const { session } = useAuth();
  const demo = session === null;

  const [nome, setNome] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !criando) onFechar();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onFechar, criando]);

  const fechar = () => {
    if (!criando) onFechar();
  };

  const submeter = async () => {
    if (criando || demo) return; // botão já vem disabled no demo — 2ª linha de defesa
    const limpo = nome.trim();
    if (limpo.length < 2) {
      setErro("Dê um nome à categoria (ex.: Laticínios).");
      return;
    }
    setErro("");
    setCriando(true);
    const resultado = await criarCategoria(limpo);
    setCriando(false);
    if (!resultado.success) {
      // duplicidade chega como "Categoria já existe." — mantida literal, é a mensagem pedida
      setErro(resultado.error || "Não foi possível criar a categoria. Tente de novo.");
      return;
    }
    onFechar();
    onCriada?.({ id: resultado.id, nome: resultado.nome });
  };

  return (
    <>
      {/* Desktop (≥900px): sheet menor (~420px) centralizada, ancorada embaixo,
          cantos completos — mesma técnica do modal pai; classe própria, não vaza. */}
      <style>{`
        @media (min-width: 900px) {
          .eq2-sheet.eq2-sheet--cat {
            left: 0;
            right: 0;
            width: min(420px, calc(100% - 48px));
            margin: 0 auto;
            bottom: 16px;
            border-radius: 20px;
            box-shadow: 0 16px 40px rgba(15, 21, 33, 0.32);
          }
          .eq2-sheet.eq2-sheet--cat .eq2-sheet__grabber { display: none; }
        }
      `}</style>

      <div
        className="eq2-sheet__overlay"
        onClick={fechar}
        aria-hidden="true"
        style={{ zIndex: 70 }}
      />
      <div
        className="eq2-sheet eq2-sheet--cat"
        role="dialog"
        aria-modal="true"
        aria-label="Nova categoria de insumo"
        style={{ zIndex: 71 }}
      >
        <div className="eq2-sheet__grabber" aria-hidden="true" />

        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Nova categoria</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--eq2-muted)" }}>
              Só para insumos — não mexe nas categorias dos produtos.
            </p>
          </div>
          <button
            type="button"
            className="eq2-back"
            aria-label="Fechar"
            onClick={fechar}
            disabled={criando}
            style={{ minWidth: 40, minHeight: 40 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          <label className="eq2-label" htmlFor="nova-categoria-nome">
            Nome da categoria
          </label>
          <input
            id="nova-categoria-nome"
            className="eq2-input"
            type="text"
            placeholder="Ex.: Laticínios"
            autoComplete="off"
            autoFocus
            disabled={criando}
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (erro) setErro("");
            }}
            onKeyDown={(e) => {
              // sem <form> aninhado: Enter aqui faz o que o submit faria
              if (e.key === "Enter") {
                e.preventDefault();
                void submeter();
              }
            }}
          />

          {/* Melissa curta — a frase vendendo o hábito, não um card inteiro */}
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--eq2-muted)", fontStyle: "italic" }}>
            Melissa: categorias organizam sua prateleira.
          </p>

          {erro && (
            <p
              role="alert"
              style={{
                margin: "10px 0 0",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--eq2-danger)",
                background: "#fdeeee",
                border: "1px solid #f3c6c4",
                borderRadius: "var(--eq2-radius)",
                padding: "10px 12px",
              }}
            >
              {erro}
            </p>
          )}

          <button
            type="button"
            className="eq2-btn eq2-btn--primary eq2-btn--block"
            onClick={() => void submeter()}
            disabled={demo || criando}
            aria-label={demo ? "Criar categoria em modo demonstração — indisponível sem login" : "Criar categoria"}
            style={{ marginTop: 14 }}
          >
            {criando ? (
              <>
                <Loader2 size={16} aria-hidden="true" className="animate-spin" /> Criando…
              </>
            ) : demo ? (
              "Criar categoria (modo demo)"
            ) : (
              "Criar categoria"
            )}
          </button>
          {demo && (
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--eq2-warn)", textAlign: "center" }}>
              modo demo — entre na sua conta para criar categorias
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default SheetNovaCategoria;
