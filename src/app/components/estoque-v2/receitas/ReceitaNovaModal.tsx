/**
 * ReceitaNovaModal — "Nova receita" simplificado (Receitas v2).
 *
 * Fundador 24/10: criar receita precisa ser mais fácil de entender do que
 * "produto composto" (jargão). Para o usuário, recheio/massa/cobertura são
 * RECEITAS — o modal não fala de natureza, categoria, SKU ou ficha: pede só
 * nome + rendimento + (opcional) venda. O resto é decisão de banco:
 * `natureza='composto'`, estoque 0, SKU gerado — tudo no `criarReceita` de
 * `use-receitas-lista-v2.ts`.
 *
 * Visual no padrão do redesign: `.eq2-sheet` — bottom sheet no mobile,
 * side panel à direita no desktop (≥900px, mesmo breakpoint do `.eq2-grid--3`).
 * MelissaCard no rodapé vendendo o próximo passo (a ficha técnica).
 *
 * Sem sessão (modo demo): não grava — botão "Criar receita (modo demo)"
 * desabilitado com hint, padrão do módulo (NovaCompraV2Page / SimuladorV2).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import type { CriarReceitaParams } from "../../../hooks/use-receitas-lista-v2";
import { MelissaCard } from "../shared/MelissaCard";

/* ─────────────────────────── schema (zod + RHF) ─────────────────────────── */

/**
 * qtd/preço chegam como string do input (o formulário é o contrato da UI;
 * a conversão para número acontece no submit — parseDecimal). `unknown`
 * tipa o campo sem mentir: o resolver não faz coerção aqui.
 */
const receitaNovaSchema = z
  .object({
    nome: z.string().trim().min(2, "Dê um nome para a receita (ex.: Recheio de limão)"),
    unidade: z.string().trim().min(1, "Escolha a unidade"),
    rendimento: z.unknown(),
    aVenda: z.boolean(),
    preco: z.unknown(),
  })
  .superRefine((data, ctx) => {
    // "Quanto ela rende?" é o coração da receita — sem valor > 0 não cria.
    const rendimento = parseDecimal(data.rendimento);
    if (rendimento === null || !(rendimento > 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Informe quanto a receita rende (maior que zero).",
        path: ["rendimento"],
      });
    }
    // Preço só existe com o toggle ligado; ligado exige preço plausível.
    if (data.aVenda) {
      const preco = parseDecimal(data.preco);
      if (preco === null || !(preco > 0)) {
        ctx.addIssue({
          code: "custom",
          message: "Informe o preço de venda (ou desligue \"Também ficará à venda?\").",
          path: ["preco"],
        });
      }
    }
  });

type ReceitaNovaForm = {
  nome: string;
  unidade: string;
  rendimento: unknown;
  aVenda: boolean;
  preco: unknown;
};

/** Aceita "1,5" e "1.5"; vazio/lixo → null (padrão parseDecimal do editor v2). */
function parseDecimal(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== "string") return null;
  const t = valor.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/* unidades de ESTOQUE que o modal expõe (catálogo lib/unidades reduzido ao
   universo de receita: medida em g/ml ou conta em un) — default g */
const UNIDADES_RECEITA = [
  { value: "g", label: "g — gramas" },
  { value: "ml", label: "ml — mililitros" },
  { value: "un", label: "un — unidades" },
] as const;

/* ─────────────────────────── switch (padrão editor v2) ─────────────────────────── */

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

/* ─────────────────────────── modal ─────────────────────────── */

export interface ReceitaNovaModalProps {
  onClose: () => void;
  /** criação confirmada — recebe {id, nome} (id null no modo demo) */
  onSuccess: (criada: { id: number | null; nome: string }) => void;
  /** grava de verdade (INSERT me_produto); vem do hook da lista */
  criarReceita: (params: CriarReceitaParams) => Promise<{
    success: boolean;
    id: number | null;
    nome: string;
    error?: string;
  }>;
}

export function ReceitaNovaModal({ onClose, onSuccess, criarReceita }: ReceitaNovaModalProps) {
  const { session } = useAuth();
  const demo = session === null;

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // ≥900px = desktop do grid eq2 → side panel; abaixo → bottom sheet.
  const desktop = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches,
    []
  );

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !salvando) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, salvando]);

  const form = useForm<ReceitaNovaForm>({
    resolver: zodResolver(receitaNovaSchema),
    defaultValues: { nome: "", unidade: "g", rendimento: "", aVenda: false, preco: "" },
    mode: "onTouched",
  });

  const aVenda = form.watch("aVenda");
  const rendimento = form.watch("rendimento");
  const unidade = form.watch("unidade") || "g";

  const fechar = useCallback(() => {
    if (!salvando) onClose();
  }, [onClose, salvando]);

  const onSubmit = form.handleSubmit(async (dados) => {
    if (salvando || demo) return; // botão já vem disabled no demo — 2ª linha de defesa
    setErro("");
    setSalvando(true);
    const resultado = await criarReceita({
      nome: dados.nome.trim(),
      unidade: dados.unidade,
      rendimentoLote: parseDecimal(dados.rendimento),
      aVenda: dados.aVenda,
      precoVenda: dados.aVenda ? parseDecimal(dados.preco) : null,
      // SKU não é pergunta para o usuário — o hook gera o simples (padrão v1)
    });
    setSalvando(false);
    if (!resultado.success) {
      setErro(resultado.error || "Não foi possível criar a receita. Tente de novo.");
      return;
    }
    onClose();
    onSuccess({ id: resultado.id, nome: resultado.nome });
  });

  const erroNome = form.formState.errors.nome?.message as string | undefined;
  const erroRendimento = form.formState.errors.rendimento?.message as string | undefined;
  const erroPreco = form.formState.errors.preco?.message as string | undefined;

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
        aria-label="Nova receita"
        style={
          desktop
            ? { top: 0, right: 0, left: "auto", bottom: 0, width: 440, maxWidth: "92vw", maxHeight: "none", borderRadius: 0 }
            : undefined
        }
      >
        {!desktop && <div className="eq2-sheet__grabber" aria-hidden="true" />}

        {/* cabeçalho */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Nova receita</h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--eq2-muted)" }}>
              Recheio, massa, cobertura ou produto pronto — tudo começa como receita.
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
          {/* 1 — nome */}
          <div>
            <label className="eq2-label" htmlFor="receita-nome">
              Qual receita você vai preparar?
            </label>
            <input
              id="receita-nome"
              className="eq2-input"
              type="text"
              placeholder="Ex.: Recheio de limão"
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

          {/* 2 — rendimento */}
          <div>
            <label className="eq2-label" htmlFor="receita-rendimento">
              Quanto ela rende?
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="receita-rendimento"
                className="eq2-input"
                style={{ flex: 1, minWidth: 0 }}
                type="text"
                inputMode="decimal"
                placeholder="Ex.: 800"
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
                {UNIDADES_RECEITA.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
            {erroRendimento ? (
              <p role="alert" style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-danger)", fontWeight: 500 }}>
                {erroRendimento}
              </p>
            ) : (
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-muted)" }}>
                Total do lote na unidade do estoque — ex.: 800&nbsp;{unidade} de recheio.
              </p>
            )}
          </div>

          {/* 3 — toggle venda */}
          <div>
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
                <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Também ficará à venda?</span>
                <span style={{ display: "block", fontSize: 11, color: "var(--eq2-muted)", marginTop: 2 }}>
                  Ligado, ela aparece na vitrine com este preço.
                </span>
              </span>
              <Eq2Switch
                checked={aVenda === true}
                label="Também ficará à venda?"
                onChange={(v) => form.setValue("aVenda", v, { shouldValidate: true, shouldDirty: true })}
              />
            </div>

            {aVenda === true && (
              <div style={{ marginTop: 12 }}>
                <label className="eq2-label" htmlFor="receita-preco">
                  Preço de venda (R$)
                </label>
                <input
                  id="receita-preco"
                  className="eq2-input"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  autoComplete="off"
                  disabled={salvando}
                  {...form.register("preco")}
                />
                {erroPreco ? (
                  <p role="alert" style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-danger)", fontWeight: 500 }}>
                    {erroPreco}
                  </p>
                ) : (
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--eq2-muted)" }}>
                    Pode definir depois — o custo vem da ficha.
                  </p>
                )}
              </div>
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

          {/* Melissa — o próximo passo vendido, não imposto */}
          <MelissaCard msg="Depois de criar, eu te pergunto os ingredientes e calculo o custo por grama." />

          {/* submit */}
          <button
            type="submit"
            className="eq2-btn eq2-btn--primary eq2-btn--block"
            disabled={demo || salvando}
            aria-label={demo ? "Criar receita em modo demonstração — indisponível sem login" : "Criar receita"}
          >
            {salvando ? (
              <>
                <Loader2 size={16} aria-hidden="true" className="animate-spin" /> Criando…
              </>
            ) : demo ? (
              "Criar receita (modo demo)"
            ) : (
              "Criar receita"
            )}
          </button>
          {demo && (
            <p style={{ margin: "-6px 0 0", fontSize: 11, color: "var(--eq2-warn)", textAlign: "center" }}>
              modo demo — entre na sua conta para criar sua receita
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReceitaNovaModal;
