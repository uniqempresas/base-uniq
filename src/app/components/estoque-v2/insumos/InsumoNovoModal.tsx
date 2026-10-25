/**
 * InsumoNovoModal — "Novo insumo" dedicado (Estoque v2, tela de lista).
 *
 * Fundador: o ProdutoFormModal v1 (3 steps, "fator de conversão") é pesado e
 * cheiro de jargão para cadastrar matéria-prima. Este modal pergunta em
 * português de gente: o que comprou → como guarda → como é a embalagem →
 * quanto tem nela. A conversão é RESULTADO visível (recibo "1 lata × 395 g =
 * 395 g"), nunca campo técnico — a palavra "fator" não aparece na UI.
 *
 * Decisões de banco que o usuário não vê (padrão v1 / D9):
 * - natureza='insumo', estoque_minimo=0, exibir_vitrine=false, SKU gerado;
 * - SEM campo de preço: o custo nasce da primeira compra (regra v1 D9);
 * - mesma unidade compra/estoque → unidade_compra null + conversão null
 *   (campo 4 some e o recibo diz "Mesma unidade — sem conversão.").
 *
 * Visual no padrão do redesign: `.eq2-sheet` — bottom sheet no mobile; no
 * desktop (≥900px, mesmo breakpoint do `.eq2-grid--3`) vira sheet
 * centralizada de ~520px ancorada embaixo (mesma técnica do editor de
 * receita: `<style>` scoped com classe que só existe aqui — não vaza).
 * MelissaCard dinâmica no rodapé vendendo a conversão; gravação via
 * `criarInsumo` do `use-insumos-v2` (INSERT `me_produto`).
 *
 * Sem sessão (modo demo): não grava — botão desabilitado + hint, padrão do
 * módulo (ReceitaNovaModal / NovaCompraV2Page).
 */
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import type { CriarInsumoParams } from "../../../hooks/use-insumos-v2";
import { MelissaCard } from "../shared/MelissaCard";
import { UNIDADES_COMPRA } from "../shared/utils";

/* ─────────────────────────── schema (zod + RHF) ─────────────────────────── */

/**
 * qtd chegam como string do input (o formulário é o contrato da UI; a
 * conversão para número acontece no submit — parseDecimal). `unknown` tipa
 * o campo sem mentir: o resolver não faz coerção aqui (padrão ReceitaNovaModal).
 */
const insumoNovoSchema = z
  .object({
    nome: z.string().trim().min(2, "Dê um nome ao insumo (ex.: Leite condensado em lata)"),
    unidade: z.string().trim().min(1, "Escolha como você guarda"),
    unidadeCompra: z.string().trim().min(1, "Escolha como o fornecedor entrega — ex.: lata, pacote, caixa"),
    qtdEmbalagem: z.unknown(),
    estoqueInicial: z.unknown(),
  })
  .superRefine((data, ctx) => {
    const mesma = mesmaUnidade(data.unidade, data.unidadeCompra);
    // Campo 4 só existe quando unidades diferem — mesma unidade não cobra nada.
    if (!mesma && data.unidadeCompra) {
      const qtd = parseDecimal(data.qtdEmbalagem);
      if (qtd === null) {
        ctx.addIssue({
          code: "custom",
          message: `Diga quanto tem dentro de 1 ${data.unidadeCompra} (ex.: 395).`,
          path: ["qtdEmbalagem"],
        });
      } else if (!(qtd > 1)) {
        // Anti-inversão (Caixa de Uva 07/10): 1 embalagem sempre contém MAIS
        // que 1 unidade de estoque — senão quem está invertido é o par guarda/compra.
        ctx.addIssue({
          code: "custom",
          message: `Precisa ser mais que 1 — ex.: 1 lata tem 395 g. Se você guarda em ${data.unidade} mas a embalagem é menor, guarde na unidade menor.`,
          path: ["qtdEmbalagem"],
        });
      }
    }
    if (data.estoqueInicial !== "" && data.estoqueInicial != null) {
      const ini = parseDecimal(data.estoqueInicial);
      if (ini === null || !(ini >= 0)) {
        ctx.addIssue({
          code: "custom",
          message: "Estoque inicial precisa ser um número (ou deixe vazio para começar em zero).",
          path: ["estoqueInicial"],
        });
      }
    }
  });

type InsumoNovoForm = {
  nome: string;
  unidade: string;
  unidadeCompra: string;
  qtdEmbalagem: unknown;
  estoqueInicial: unknown;
};

/** Aceita "0,5" e "0.5"; vazio/lixo → null (padrão parseDecimal do módulo). */
function parseDecimal(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== "string") return null;
  const t = valor.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/* unidade de ESTOQUE: o fundador escolhe entre 3 (é a unidade que aparece nas
   receitas) — default g, padrão do ReceitaNovaModal */
const UNIDADES_ESTOQUE = [
  { value: "g", label: "g — gramas" },
  { value: "ml", label: "ml — mililitros" },
  { value: "un", label: "un — unidades" },
] as const;

/* chips de sugestão por unidade de estoque — números de mercado brasileiro
   (lata MOCA = 395 g, refresco = 500 ml, ovos = dúzia) */
const SUGESTOES_POR_UNIDADE: Record<string, Array<{ valor: number; label: string }>> = {
  g: [
    { valor: 395, label: "395 g (lata)" },
    { valor: 500, label: "500 g" },
    { valor: 1000, label: "1 kg" },
  ],
  ml: [
    { valor: 200, label: "200 ml" },
    { valor: 500, label: "500 ml" },
    { valor: 1000, label: "1 litro" },
  ],
  un: [
    { valor: 6, label: "6 un" },
    { valor: 12, label: "12 un (dúzia)" },
    { valor: 24, label: "24 un (fardo)" },
  ],
};

/** compra e guarda na mesma medida? (as duas listas usam as mesmas siglas) */
function mesmaUnidade(unidade: string, unidadeCompra: string): boolean {
  return unidade.trim().toLowerCase() === unidadeCompra.trim().toLowerCase();
}

/** 395 → "395"; 0.5 → "0,5" (nº pt-BR, sem casas desnecessárias). */
function fmtQtd(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

/* ─────────────────────────── Melissa dinâmica ─────────────────────────── */

/**
 * A conversa da Melissa segue o preenchimento — a régua é sempre a mesma:
 * "como você compra ≠ como você guarda" vira conta feita, nunca jargão.
 */
function mensagemMelissa(
  unidadeCompra: string,
  unidade: string,
  qtd: number | null,
): string {
  const mesma = mesmaUnidade(unidade, unidadeCompra);
  if (!unidadeCompra) {
    return "Pra gente se entender: como você compra ≠ como você guarda. Ex.: você compra uma lata de leite condensado, mas usa por colher na receita — no estoque entram as gramas.";
  }
  if (mesma) {
    return `Certo: você compra e guarda tudo em ${unidade} — entra ${unidade}, sai ${unidade}, nada para converter.`;
  }
  if (qtd === null) {
    return `E quanto cabe dentro de 1 ${unidadeCompra}? Ex.: 1 lata de leite condensado tem 395 g.`;
  }
  return `Perfeito: 1 ${unidadeCompra} tem ${fmtQtd(qtd)} ${unidade}. Quando você comprar 1 ${unidadeCompra}, entram ${fmtQtd(qtd)} ${unidade} no estoque — e eu converto nas receitas.`;
}

/* ─────────────────────────── modal ─────────────────────────── */

export interface InsumoNovoModalProps {
  onClose: () => void;
  /** criação confirmada — recebe {id, nome} (id null no modo demo) */
  onSuccess: (criado: { id: number | null; nome: string }) => void;
  /** grava de verdade (INSERT me_produto); vem do hook da lista */
  criarInsumo: (params: CriarInsumoParams) => Promise<{
    success: boolean;
    id: number | null;
    nome: string;
    error?: string;
  }>;
}

export function InsumoNovoModal({ onClose, onSuccess, criarInsumo }: InsumoNovoModalProps) {
  const { session } = useAuth();
  const demo = session === null;

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !salvando) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, salvando]);

  const form = useForm<InsumoNovoForm>({
    resolver: zodResolver(insumoNovoSchema),
    defaultValues: { nome: "", unidade: "g", unidadeCompra: "", qtdEmbalagem: "", estoqueInicial: "" },
    mode: "onTouched",
  });

  const unidade = form.watch("unidade") || "g";
  const unidadeCompra = form.watch("unidadeCompra") || "";
  const qtdBruta = form.watch("qtdEmbalagem");
  const mesma = unidadeCompra !== "" && mesmaUnidade(unidade, unidadeCompra);
  const qtd = mesma ? null : parseDecimal(qtdBruta);

  const fechar = useCallback(() => {
    if (!salvando) onClose();
  }, [onClose, salvando]);

  const onSubmit = form.handleSubmit(async (dados) => {
    if (salvando || demo) return; // botão já vem disabled no demo — 2ª linha de defesa
    setErro("");
    setSalvando(true);

    const mesmaUnidadeFinal = mesmaUnidade(dados.unidade, dados.unidadeCompra);
    const resultado = await criarInsumo({
      nome: dados.nome.trim(),
      unidade: dados.unidade,
      // mesma unidade = sem conversão (padrão v1: null/null no banco)
      unidadeCompra: mesmaUnidadeFinal ? null : dados.unidadeCompra.trim(),
      fatorConversao: mesmaUnidadeFinal ? null : parseDecimal(dados.qtdEmbalagem),
      // "se já tem em casa" — na unidade de estoque; vazio → 0 (padrão v1)
      estoqueInicial: parseDecimal(dados.estoqueInicial) ?? 0,
    });
    setSalvando(false);
    if (!resultado.success) {
      setErro(resultado.error || "Não foi possível cadastrar o insumo. Tente de novo.");
      return;
    }
    onClose();
    onSuccess({ id: resultado.id, nome: resultado.nome });
  });

  const erroNome = form.formState.errors.nome?.message as string | undefined;
  const erroUnidadeCompra = form.formState.errors.unidadeCompra?.message as string | undefined;
  const erroQtd = form.formState.errors.qtdEmbalagem?.message as string | undefined;
  const erroEstoque = form.formState.errors.estoqueInicial?.message as string | undefined;

  const sugestoes = SUGESTOES_POR_UNIDADE[unidade] ?? [];

  return (
    <div className="eq2">
      {/* Desktop (≥900px): sheet centralizada ~520px ancorada embaixo, cantos
          completos — mesma técnica do editor de receita. A classe
          `eq2-sheet--insumo` só existe neste modal, o override não vaza. */}
      <style>{`
        @media (min-width: 900px) {
          .eq2-sheet.eq2-sheet--insumo {
            left: 0;
            right: 0;
            width: min(520px, calc(100% - 48px));
            margin: 0 auto;
            bottom: 16px;
            border-radius: 20px;
            box-shadow: 0 16px 40px rgba(15, 21, 33, 0.28);
          }
          .eq2-sheet.eq2-sheet--insumo .eq2-sheet__grabber { display: none; }
        }
      `}</style>

      <div className="eq2-sheet__overlay" onClick={fechar} aria-hidden="true" />

      <form
        onSubmit={onSubmit}
        className="eq2-sheet eq2-sheet--insumo"
        role="dialog"
        aria-modal="true"
        aria-label="Novo insumo"
      >
        <div className="eq2-sheet__grabber" aria-hidden="true" />

        {/* cabeçalho */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Novo insumo</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--eq2-muted)" }}>
              O que você compra pra produzir — eu cuido da conversão.
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

        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
          {/* 1 — "O que você comprou?" */}
          <div>
            <label className="eq2-label" htmlFor="insumo-nome">
              O que você comprou?
            </label>
            <input
              id="insumo-nome"
              className="eq2-input"
              type="text"
              placeholder="Ex.: Leite condensado em lata"
              autoComplete="off"
              autoFocus
              disabled={salvando}
              {...form.register("nome")}
            />
            {erroNome && (
              <p role="alert" style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-danger)", fontWeight: 500 }}>
                {erroNome}
              </p>
            )}
          </div>

          {/* 2 — "Como você guarda/usa?" — unidade de ESTOQUE (chips, 44px) */}
          <div>
            <span className="eq2-label" id="insumo-unidade-label">
              Como você guarda/usa?
            </span>
            <div
              className="eq2-chips"
              role="group"
              aria-labelledby="insumo-unidade-label"
              style={{ gap: 8 }}
            >
              {UNIDADES_ESTOQUE.map((u) => {
                const ativa = unidade === u.value;
                return (
                  <button
                    key={u.value}
                    type="button"
                    className={`eq2-chip${ativa ? " is-active" : ""}`}
                    aria-pressed={ativa}
                    disabled={salvando}
                    onClick={() => form.setValue("unidade", u.value, { shouldDirty: true })}
                    style={{
                      minHeight: 44,
                      minWidth: 44,
                      flex: 1,
                      padding: "10px 12px",
                      fontWeight: ativa ? 700 : 500,
                    }}
                  >
                    {u.label}
                  </button>
                );
              })}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-muted)" }}>
              É esta unidade que aparece nas suas receitas — ex.: "55 {unidade} de recheio por bolo".
            </p>
          </div>

          {/* 3 — "Como é a embalagem do fornecedor?" */}
          <div>
            <label className="eq2-label" htmlFor="insumo-unidade-compra">
              Como é a embalagem do fornecedor?
            </label>
            <select
              id="insumo-unidade-compra"
              className="eq2-select"
              disabled={salvando}
              {...form.register("unidadeCompra")}
            >
              <option value="">Escolher… (ex.: lata, pacote, caixa)</option>
              {UNIDADES_COMPRA.map((u) => (
                <option key={u.sigla} value={u.sigla}>
                  {u.label}
                </option>
              ))}
            </select>
            {erroUnidadeCompra && (
              <p role="alert" style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-danger)", fontWeight: 500 }}>
                {erroUnidadeCompra}
              </p>
            )}
          </div>

          {/* 4 — "Quanto tem em cada embalagem?" — só quando unidades diferem.
              Mesma unidade: campo some e o recibo abaixo diz "sem conversão". */}
          {unidadeCompra !== "" && !mesma && (
            <div>
              <label className="eq2-label" htmlFor="insumo-qtd">
                Quanto tem em cada {unidadeCompra.toLowerCase()}?
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="insumo-qtd"
                  className="eq2-input"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex.: 395"
                  autoComplete="off"
                  disabled={salvando}
                  style={{ paddingRight: 44 }}
                  {...form.register("qtdEmbalagem")}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--eq2-muted)",
                  }}
                >
                  {unidade}
                </span>
              </div>

              {/* sugestões com número de mercado — clicáveis, sem digitar */}
              <div className="eq2-chips" role="group" aria-label="Valores comuns" style={{ marginTop: 8 }}>
                {sugestoes.map((s) => {
                  const ativa = qtd === s.valor;
                  return (
                    <button
                      key={s.valor}
                      type="button"
                      className={`eq2-chip${ativa ? " is-active" : ""}`}
                      aria-pressed={ativa}
                      disabled={salvando}
                      style={{ minHeight: 44 }}
                      onClick={() =>
                        form.setValue("qtdEmbalagem", String(s.valor), {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {erroQtd && (
                <p role="alert" style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-danger)", fontWeight: 500 }}>
                  {erroQtd}
                </p>
              )}
            </div>
          )}

          {/* Recibo ao vivo — a conta visível SEMPRE (padrão eq2-receipt do módulo) */}
          <div className="eq2-receipt" role="status" aria-live="polite">
            {unidadeCompra === "" ? (
              <span>Escolha a embalagem do fornecedor e a conta aparece aqui.</span>
            ) : mesma ? (
              <>
                <strong>Mesma unidade — sem conversão.</strong>
                <span style={{ display: "block", marginTop: 2 }}>
                  entra {unidade}, sai {unidade} — o custo nasce da primeira compra
                </span>
              </>
            ) : (
              <>
                1 {unidadeCompra.toLowerCase()} ×{" "}
                <strong>{qtd !== null ? `${fmtQtd(qtd)} ${unidade}` : `? ${unidade}`}</strong>
                {" = "}
                <strong>{qtd !== null ? `${fmtQtd(qtd)} ${unidade}` : "?"}</strong>
                <span style={{ display: "block", marginTop: 2 }}>
                  {qtd !== null
                    ? `quando entrar 1 ${unidadeCompra.toLowerCase()} em casa, entram ${fmtQtd(qtd)} ${unidade} no estoque`
                    : `preencha o quanto tem em 1 ${unidadeCompra.toLowerCase()}`}{" "}
                  — o custo nasce da primeira compra
                </span>
              </>
            )}
          </div>

          {/* Melissa dinâmica — a régua do modal em uma frase por estado */}
          <MelissaCard msg={mensagemMelissa(unidadeCompra, unidade, qtd)} />

          {/* 6 — rodapé discreto: estoque inicial (se já tem em casa) */}
          <div>
            <label className="eq2-label" htmlFor="insumo-estoque-inicial" style={{ fontWeight: 500 }}>
              Estoque inicial <span style={{ fontWeight: 400 }}>(se já tem em casa)</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="insumo-estoque-inicial"
                className="eq2-input"
                type="text"
                inputMode="decimal"
                placeholder="0"
                autoComplete="off"
                disabled={salvando}
                style={{ paddingRight: 44 }}
                {...form.register("estoqueInicial")}
              />
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--eq2-muted)",
                }}
              >
                {unidade}
              </span>
            </div>
            {erroEstoque ? (
              <p role="alert" style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-danger)", fontWeight: 500 }}>
                {erroEstoque}
              </p>
            ) : (
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-muted)" }}>
                Pode deixar em branco — a quantidade chega com a primeira compra.
              </p>
            )}
          </div>

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

          {/* submit */}
          <button
            type="submit"
            className="eq2-btn eq2-btn--primary eq2-btn--block"
            disabled={demo || salvando}
            aria-label={demo ? "Cadastrar insumo em modo demonstração — indisponível sem login" : "Cadastrar insumo"}
          >
            {salvando ? (
              <>
                <Loader2 size={16} aria-hidden="true" className="animate-spin" /> Cadastrando…
              </>
            ) : demo ? (
              "Cadastrar insumo (modo demo)"
            ) : (
              "Cadastrar insumo"
            )}
          </button>
          {demo && (
            <p style={{ margin: "-6px 0 0", fontSize: 11, color: "var(--eq2-warn)", textAlign: "center" }}>
              modo demo — entre na sua conta para cadastrar seus insumos
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default InsumoNovoModal;
