/**
 * ProdutoNovoModal — "Novo produto" da lista Vendo (Produtos v2).
 *
 * Veredito de mercado (pesquisa lib-2, modelo multinível): a PRIMEIRA pergunta
 * do modal é o tipo, em dois cards grandes:
 *  - "Simples — compro pronto e revendo" (vendido direto, sem ficha);
 *  - "Feito em casa — receita" (composto: embalagem/rótulo entram na ficha do
 *    produto final; sub-receita vendável vira produto novo reusando a ficha).
 * Sem jargão: o modal nunca fala de natureza/SKU/ficha técnica como conceito —
 * isso é decisão de banco do hook.
 *
 * Campos comuns: nome ("O que você vende?") + categoria (chips OPCIONAIS, só
 * as categorias de PRODUTO do escopo novo via useCategoriasV2) + preço de
 * venda ("Quanto você vende?" — Melissa: dá para ajustar no simulador).
 * Simples acrescenta estoque inicial/mínimo; Feito em casa acrescenta o
 * rendimento da receita. Toggle "Vendo isso" (exibir_vitrine) default LIGADO
 * para produto nas duas trilhas.
 *
 * Visual no padrão do módulo: .eq2-sheet — bottom sheet no mobile, side panel
 * à direita no desktop (≥900px), gramática idêntica ao ReceitaNovaModal
 * (mesmo shell, mesmos erros de campo, mesmo switch).
 *
 * Sem sessão (modo demo): não grava — botão "Criar … (modo demo)" desabilitado
 * com hint, padrão do módulo.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useCategoriasV2 } from "../../../hooks/use-categorias-v2";
import type {
  CriarCompostoParamsV2,
  CriarProdutoResult,
  CriarProdutoSimplesParams,
} from "../../../hooks/use-produtos-lista-v2";
import { MelissaCard } from "../shared/MelissaCard";

type TipoNovo = "simples" | "composto";

/* parseDecimal espelhado do ReceitaNovaModal (irmão): aceita "1,5" e "1.5";
   vazio/lixo → null. O formulário guarda string; o número nasce no submit. */
function parseDecimal(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== "string") return null;
  const t = valor.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/* unidades de estoque que o modal expõe (mesmo trio do modal irmão de receita) */
const UNIDADES_PRODUTO: Array<{ value: string; label: string }> = [
  { value: "un", label: "un — unidades" },
  { value: "g", label: "g — gramas" },
  { value: "ml", label: "ml — mililitros" },
];

/* ─────────────────────────── schema (zod + RHF) ─────────────────────────── */

const produtoNovoSchema = z
  .object({
    tipo: z.enum(["simples", "composto"]),
    nome: z.string().trim().min(2, "Dê um nome para o produto (ex.: Bolo de cenoura)"),
    unidade: z.string().trim().min(1, "Escolha a unidade"),
    rendimento: z.unknown(),
    preco: z.unknown(),
    estoqueInicial: z.unknown(),
    estoqueMinimo: z.unknown(),
    vendendo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // FEITO EM CASA: o rendimento é o coração da receita — sem valor > 0 não cria
    // (mesmo contrato do modal irmão).
    if (data.tipo === "composto") {
      const rend = parseDecimal(data.rendimento);
      if (rend === null || !(rend > 0)) {
        ctx.addIssue({
          code: "custom",
          message: "Informe quanto a receita rende (maior que zero).",
          path: ["rendimento"],
        });
      }
      // com "Vendo isso" ligado, preço é obrigatório (contrato do irmão)
      if (data.vendendo) {
        const preco = parseDecimal(data.preco);
        if (preco === null || !(preco > 0)) {
          ctx.addIssue({
            code: "custom",
            message: "Informe o preço de venda (ou desligue \"Vendo isso\").",
            path: ["preco"],
          });
        }
      }
    } else {
      // SIMPLES: preço pode ficar em branco ("sem preço" no card → simulador
      // ajusta depois). Digitou algo, tem que ser número > 0.
      const bruto = typeof data.preco === "string" ? data.preco.trim() : data.preco;
      if (bruto !== "" && bruto != null) {
        const preco = parseDecimal(data.preco);
        if (preco === null || !(preco > 0)) {
          ctx.addIssue({
            code: "custom",
            message: "Preço inválido — use números (ex.: 12,50) ou deixe em branco.",
            path: ["preco"],
          });
        }
      }
    }

    // campos de estoque do simples: se preenchidos, número ≥ 0
    for (const campo of ["estoqueInicial", "estoqueMinimo"] as const) {
      const bruto = typeof data[campo] === "string" ? data[campo].trim() : data[campo];
      if (bruto === "" || bruto == null) continue;
      const n = parseDecimal(data[campo]);
      if (n === null || n < 0) {
        ctx.addIssue({
          code: "custom",
          message: "Use um número maior ou igual a zero (ou deixe em branco).",
          path: [campo],
        });
      }
    }
  });

type ProdutoNovoForm = {
  tipo: TipoNovo;
  nome: string;
  unidade: string;
  rendimento: unknown;
  preco: unknown;
  estoqueInicial: unknown;
  estoqueMinimo: unknown;
  vendendo: boolean;
};

/* ─────────────────────────── switch (espelho do irmão) ─────────────────────────── */

function Eq2Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        width: 52,
        height: 30,
        minWidth: 52,
        borderRadius: 999,
        border: 0,
        position: "relative",
        cursor: "pointer",
        background: checked ? "var(--eq2-accent)" : "#d8dcd9",
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

/* ─────────────────────────── cards da primeira escolha ─────────────────────────── */

const ESCOLHAS: Array<{
  tipo: TipoNovo;
  emoji: string;
  titulo: string;
  descricao: string;
}> = [
  {
    tipo: "simples",
    emoji: "🧃",
    titulo: "Simples — compro pronto e revendo",
    descricao: "Chega do fornecedor e sai do jeito que está. Ex.: refrigerante em lata, vela decorativa.",
  },
  {
    tipo: "composto",
    emoji: "🍳",
    titulo: "Feito em casa — receita",
    descricao: "Você produz. Depois me diga os ingredientes, a embalagem e o rótulo que eu calculo o custo. Ex.: bolo de cenoura, surpresa de uva.",
  },
];

/* ─────────────────────────── modal ─────────────────────────── */

export interface ProdutoNovoModalProps {
  onClose: () => void;
  /** criação confirmada — a página decide a banda pós-salvar por tipo */
  onSuccess: (criado: { id: number | null; nome: string; tipo: TipoNovo }) => void;
  criarSimples: (params: CriarProdutoSimplesParams) => Promise<CriarProdutoResult>;
  criarComposto: (params: CriarCompostoParamsV2) => Promise<CriarProdutoResult>;
}

export function ProdutoNovoModal({ onClose, onSuccess, criarSimples, criarComposto }: ProdutoNovoModalProps) {
  const { session } = useAuth();
  const demo = session === null;

  const [etapa, setEtapa] = useState<"tipo" | "dados">("tipo");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Categorias de PRODUTO (escopo novo) — chips opcionais; lista demo aparece
  // junto no modo demo, só para o layout não nascer vazio.
  const { categorias } = useCategoriasV2();
  const catsProduto = useMemo(
    () => categorias.filter((c) => c.escopo === "produto"),
    [categorias]
  );

  // ≥900px = desktop do grid eq2 → side panel; abaixo → bottom sheet (irmão).
  const desktop = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches,
    []
  );

  const form = useForm<ProdutoNovoForm>({
    resolver: zodResolver(produtoNovoSchema),
    defaultValues: {
      tipo: "simples",
      nome: "",
      unidade: "un",
      rendimento: "",
      preco: "",
      estoqueInicial: "",
      estoqueMinimo: "",
      // veredito lib-2: produto nasce À VENDA (vitrine default true)
      vendendo: true,
    },
    mode: "onTouched",
  });

  const tipo = form.watch("tipo");
  const vendendo = form.watch("vendendo");
  const unidade = form.watch("unidade") || "un";

  const fechar = useCallback(() => {
    if (!salvando) onClose();
  }, [onClose, salvando]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !salvando) {
        // na etapa da escolha, Esc fecha; na de dados, Esc volta na escolha
        if (etapa === "dados") setEtapa("tipo");
        else onClose();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, salvando, etapa]);

  const escolherTipo = (t: TipoNovo) => {
    form.setValue("tipo", t, { shouldValidate: true, shouldDirty: true });
    setEtapa("dados");
  };

  const onSubmit = form.handleSubmit(async (dados) => {
    if (salvando || demo) return; // botão disabled no demo — 2ª linha de defesa
    setErro("");
    setSalvando(true);

    let resultado: CriarProdutoResult;
    if (dados.tipo === "composto") {
      resultado = await criarComposto({
        nome: dados.nome.trim(),
        unidade: dados.unidade,
        rendimentoLote: parseDecimal(dados.rendimento),
        aVenda: dados.vendendo,
        precoVenda: dados.vendendo ? parseDecimal(dados.preco) : null,
        categoriaId,
        // SKU o hook gera (padrão do irmão)
      });
    } else {
      resultado = await criarSimples({
        nome: dados.nome.trim(),
        precoVenda: parseDecimal(dados.preco),
        estoqueInicial: parseDecimal(dados.estoqueInicial),
        estoqueMinimo: parseDecimal(dados.estoqueMinimo),
        categoriaId,
        aVenda: dados.vendendo,
      });
    }

    setSalvando(false);
    if (!resultado.success) {
      setErro(resultado.error || "Não foi possível criar o produto. Tente de novo.");
      return;
    }
    onClose();
    onSuccess({ id: resultado.id, nome: resultado.nome, tipo: dados.tipo });
  });

  const erroNome = form.formState.errors.nome?.message as string | undefined;
  const erroRendimento = form.formState.errors.rendimento?.message as string | undefined;
  const erroPreco = form.formState.errors.preco?.message as string | undefined;
  const erroEstoqueInicial = form.formState.errors.estoqueInicial?.message as string | undefined;
  const erroEstoqueMinimo = form.formState.errors.estoqueMinimo?.message as string | undefined;

  const campoErro = (msg: string | undefined) =>
    msg ? (
      <p role="alert" style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-danger)", fontWeight: 500 }}>
        {msg}
      </p>
    ) : null;

  return (
    <div className="eq2" style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none" }}>
      <div
        className="eq2-sheet__overlay"
        onClick={fechar}
        aria-hidden="true"
        style={{ pointerEvents: "auto" }}
      />
      <form
        onSubmit={onSubmit}
        className="eq2-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Novo produto"
        style={
          desktop
            ? { top: 0, right: 0, left: "auto", bottom: 0, width: 440, maxWidth: "92vw", maxHeight: "none", borderRadius: 0 }
            : undefined
        }
      >
        {!desktop && <div className="eq2-sheet__grabber" aria-hidden="true" />}

        {/* ─────────── etapa 1: a primeira escolha (veredito de mercado) ─────────── */}
        {etapa === "tipo" ? (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Novo produto</h2>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--eq2-muted)" }}>
                  Primeiro me conta: ele chega pronto ou sai da sua cozinha?
                </p>
              </div>
              <button
                type="button"
                className="eq2-back"
                aria-label="Fechar"
                onClick={fechar}
                style={{ minWidth: 40, minHeight: 40 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {ESCOLHAS.map((e) => (
                <button
                  key={e.tipo}
                  type="button"
                  className="eq2-card"
                  onClick={() => escolherTipo(e.tipo)}
                  aria-label={`Criar produto ${e.titulo}`}
                >
                  <div className="eq2-card__top" style={{ alignItems: "flex-start" }}>
                    <span className="eq2-card__icon" aria-hidden="true" style={{ fontSize: 22 }}>
                      {e.emoji}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{e.titulo}</span>
                      <span style={{ display: "block", fontSize: 12, color: "var(--eq2-muted)", marginTop: 4, lineHeight: 1.5 }}>
                        {e.descricao}
                      </span>
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <MelissaCard msg="Sub-receita que você também vende? Cada uma vira um produto aqui — a ficha técnica é a mesma." />
            </div>
          </>
        ) : (
          /* ─────────── etapa 2: campos do tipo escolhido ─────────── */
          <>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  {tipo === "composto" ? "Nova receita" : "Novo produto"}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--eq2-muted)" }}>
                  {tipo === "composto"
                    ? "Feito em casa — o custo vem da ficha, que montamos na sequência."
                    : "Compro pronto e revendo — sem ficha, sem mistério."}
                </p>
              </div>
              <button
                type="button"
                className="eq2-back"
                aria-label="Fechar"
                onClick={fechar}
                disabled={salvando}
                style={{ minWidth: 40, minHeight: 40 }}
              >
                <X size={18} />
              </button>
            </div>

            <button
              type="button"
              className="eq2-btn eq2-btn--link"
              style={{ padding: "8px 4px", marginTop: 8 }}
              onClick={() => setEtapa("tipo")}
              disabled={salvando}
            >
              <ArrowLeft size={13} aria-hidden="true" /> {tipo === "composto" ? "Feito em casa" : "Simples"} · trocar
            </button>

            <div style={{ display: "grid", gap: 16, marginTop: 8 }}>
              {/* nome — a pergunta que manda */}
              <div>
                <label className="eq2-label" htmlFor="produto-nome">
                  O que você vende?
                </label>
                <input
                  id="produto-nome"
                  className="eq2-input"
                  type="text"
                  placeholder={tipo === "composto" ? "Ex.: Bolo de cenoura" : "Ex.: Refrigerante lata 350ml"}
                  autoComplete="off"
                  autoFocus
                  disabled={salvando}
                  {...form.register("nome")}
                />
                {campoErro(erroNome)}
              </div>

              {/* categoria — opcional, só chips das categorias de PRODUTO */}
              {catsProduto.length > 0 && (
                <div>
                  <span className="eq2-label">Categoria (opcional)</span>
                  <p style={{ margin: "-2px 0 8px", fontSize: 11, color: "var(--eq2-muted)" }}>
                    Só para organizar a busca — dá para trocar depois.
                  </p>
                  <div className="eq2-chips" role="group" aria-label="Escolher categoria">
                    {catsProduto.map((c) => {
                      const on = categoriaId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`eq2-chip${on ? " is-active" : ""}`}
                          aria-pressed={on}
                          disabled={salvando}
                          style={{ minHeight: 40 }}
                          onClick={() => setCategoriaId(on ? null : c.id)}
                        >
                          {on && <Check size={12} aria-hidden="true" style={{ marginRight: 4 }} />}
                          {c.nome}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* feito em casa: rendimento é obrigatório (contrato do modal irmão) */}
              {tipo === "composto" && (
                <div>
                  <label className="eq2-label" htmlFor="produto-rendimento">
                    Quanto rende a receita?
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      id="produto-rendimento"
                      className="eq2-input"
                      style={{ flex: 1, minWidth: 0 }}
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex.: 12"
                      aria-label="Quantidade que a receita rende"
                      autoComplete="off"
                      disabled={salvando}
                      {...form.register("rendimento")}
                    />
                    <select
                      className="eq2-select"
                      aria-label="Unidade do rendimento"
                      style={{ flex: "none", width: 148 }}
                      disabled={salvando}
                      {...form.register("unidade")}
                    >
                      {UNIDADES_PRODUTO.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {campoErro(erroRendimento) ?? (
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-muted)" }}>
                      Total do lote na unidade do estoque — ex.: 12 bolos ou 800&nbsp;{unidade} de recheio.
                    </p>
                  )}
                </div>
              )}

              {/* preço — simples: opcional; composto: aparece com "Vendo isso" ligado */}
              {tipo === "simples" ? (
                <div>
                  <label className="eq2-label" htmlFor="produto-preco">
                    Quanto você vende? (R$)
                  </label>
                  <input
                    id="produto-preco"
                    className="eq2-input"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    autoComplete="off"
                    disabled={salvando}
                    {...form.register("preco")}
                  />
                  {campoErro(erroPreco) ?? (
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-muted)" }}>
                      Pode deixar em branco — no simulador você ajusta com a margem na tela.
                    </p>
                  )}
                </div>
              ) : (
                vendendo === true && (
                  <div>
                    <label className="eq2-label" htmlFor="produto-preco">
                      Preço de venda (R$)
                    </label>
                    <input
                      id="produto-preco"
                      className="eq2-input"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      autoComplete="off"
                      disabled={salvando}
                      {...form.register("preco")}
                    />
                    {campoErro(erroPreco)}
                  </div>
                )
              )}

              {/* simples: quanto já tem e a partir de quanto avisar */}
              {tipo === "simples" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="eq2-label" htmlFor="produto-estoque-inicial">
                      Tem quantas hoje?
                    </label>
                    <input
                      id="produto-estoque-inicial"
                      className="eq2-input"
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      autoComplete="off"
                      disabled={salvando}
                      {...form.register("estoqueInicial")}
                    />
                    {campoErro(erroEstoqueInicial)}
                  </div>
                  <div>
                    <label className="eq2-label" htmlFor="produto-estoque-minimo">
                      Alerta a partir de?
                    </label>
                    <input
                      id="produto-estoque-minimo"
                      className="eq2-input"
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      autoComplete="off"
                      disabled={salvando}
                      {...form.register("estoqueMinimo")}
                    />
                    {campoErro(erroEstoqueMinimo) ?? (
                      <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-muted)" }}>
                        Sem mínimo, o card não avisa "acabando".
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* vitrine — nas duas trilhas, default ligado (veredito lib-2) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  border: "1px solid var(--eq2-border)",
                  borderRadius: "var(--eq2-radius)",
                  background: "var(--eq2-surface)",
                  padding: "12px 14px",
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Vendo isso</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--eq2-muted)", marginTop: 2 }}>
                    {tipo === "composto"
                      ? "Ligado, ele aparece na vitrine com este preço."
                      : "Desligado, fica só guardado no estoque — fora da vitrine."}
                  </span>
                </span>
                <Eq2Switch
                  checked={vendendo === true}
                  label="Vendo isso"
                  onChange={(v) => form.setValue("vendendo", v, { shouldValidate: true, shouldDirty: true })}
                />
              </div>

              {/* Melissa vende o próximo passo — nunca impõe */}
              <MelissaCard
                msg={
                  tipo === "composto"
                    ? "Depois de criar, me diga os ingredientes, a embalagem e o rótulo — eu calculo o custo por unidade."
                    : "Sem preço agora, tudo bem. Quando abrir o simulador, eu mostro a margem de verdade."
                }
              />

              {/* erro de gravação */}
              {erro && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
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
                type="submit"
                className="eq2-btn eq2-btn--primary eq2-btn--block"
                disabled={demo || salvando}
                aria-label={demo ? "Criar produto em modo demonstração — indisponível sem login" : "Criar produto"}
              >
                {salvando ? (
                  <>
                    <Loader2 size={16} aria-hidden="true" className="animate-spin" /> Criando…
                  </>
                ) : demo ? (
                  tipo === "composto" ? "Criar receita (modo demo)" : "Criar produto (modo demo)"
                ) : tipo === "composto" ? (
                  "Criar receita"
                ) : (
                  "Criar produto"
                )}
              </button>
              {demo && (
                <p style={{ margin: "-6px 0 0", fontSize: 11, color: "var(--eq2-warn)", textAlign: "center" }}>
                  modo demo — entre na sua conta para criar seu produto
                </p>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default ProdutoNovoModal;
