/**
 * WIRE-Producao-Redesign §9 · T3 — Portão de conversão na nota da Nova Compra.
 *
 * Inline na própria linha (não é sheet). Abre sozinho na linha de insumo SEM
 * unidade de compra/fator: a pergunta do T1 vive aqui — "1 [lata] contém
 * quantos [g]?" — com selects do catálogo (`lib/unidades`) + fator e a prévia
 * "→ entra X g no estoque". `[confirmar]` grava pelo gatilho EXISTENTE "salvar
 * produto" (`use-atualizar-produto` — nenhuma API nova) e a linha volta ao
 * estado normal; `[cancelar]` ou ESC remove a linha (nada gravado — §8).
 * Enquanto existir linha no portão, a NovaCompraPage bloqueia o Salvar com
 * motivo visível (F8 — a tela nunca deixa gravar compra que corrompe custo).
 */
import { useState, type KeyboardEvent } from "react";
import { Check, Loader2, X } from "lucide-react";
import { LegendaConversao } from "./LegendaConversao";
import { UNIDADES_COMPRA, UNIDADES_ESTOQUE, mesmasUnidades } from "../../lib/unidades";
import { useAtualizarProduto } from "../../hooks/use-atualizar-produto";
import { validarConversaoCompra } from "../../hooks/use-criar-produto";
import { campoFormSheet } from "../financeiro/components";
import type { Produto } from "../../types/produto";

/** Conversão confirmada no portão — a página aplica no snapshot da linha. */
export interface ConversaoConfirmada {
  unidade: string;
  unidadeCompra: string;
  fatorConversao: number;
}

function fmtNum(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

/** Valor do catálogo equivalente à unidade do produto (Babel "Unidade" ≡ "un"). */
function acharUnidade(catalogo: string[], valor: string | null | undefined): string | null {
  const v = valor?.trim();
  if (!v) return null;
  return catalogo.find((u) => mesmasUnidades(u, v)) ?? null;
}

export function PortaoConversao({
  produto,
  quantidade,
  onConfirmado,
  onCancelar,
}: {
  produto: Produto;
  /** qtd da linha (unidade de compra) — alimenta a prévia "entra X no estoque" */
  quantidade: number;
  onConfirmado: (dados: ConversaoConfirmada) => void;
  onCancelar: () => void;
}) {
  const { atualizarProduto, loading } = useAtualizarProduto();

  const [unidade, setUnidade] = useState(
    () => acharUnidade(UNIDADES_ESTOQUE, produto.unidade) ?? "un"
  );
  const [unidadeCompra, setUnidadeCompra] = useState(
    () =>
      acharUnidade(UNIDADES_COMPRA, produto.unidadeCompra) ??
      acharUnidade(UNIDADES_COMPRA, produto.unidade) ??
      "un"
  );
  const [fator, setFator] = useState(() => {
    const f = produto.fatorConversao;
    return f != null && Number(f) > 0 ? String(f) : "";
  });
  const [erro, setErro] = useState("");

  // mesmas unidades → fator sugerido 1 (aviso "1 un = 1 un?"); unidades
  // diferentes partem do zero (fator é obrigatório > 1 via validação).
  const unidadesIguais = mesmasUnidades(unidadeCompra, unidade);
  const nFator = fator.trim() === "" ? null : Number(fator);
  const fatorPrev = nFator != null && Number.isFinite(nFator) && nFator > 0 ? nFator : null;

  const trocar = (alvo: "estoque" | "compra", v: string) => {
    setErro("");
    if (alvo === "estoque") {
      setUnidade(v);
      if (mesmasUnidades(v, unidadeCompra)) setFator("1");
      else if (fator === "1") setFator("");
    } else {
      setUnidadeCompra(v);
      if (mesmasUnidades(v, unidade)) setFator("1");
      else if (fator === "1") setFator("");
    }
  };

  const confirmar = async () => {
    if (loading) return;
    setErro("");
    // mesma regra do cadastro completo (anti-inversão da Caixa de Uva):
    // mesma unidade → fator 1; diferentes → fator > 1 obrigatório.
    const erroConv = validarConversaoCompra(unidadeCompra, nFator, unidade);
    if (erroConv) {
      setErro(erroConv);
      return;
    }
    if (!Number.isInteger(Number(produto.id))) {
      setErro("Item sem cadastro válido — remova a linha e adicione de novo.");
      return;
    }
    const fatorFinal = fatorPrev ?? 1;
    // Gatilho existente "salvar produto" (D5 do WIRE) — nenhuma API nova.
    const r = await atualizarProduto({
      id: Number(produto.id),
      unidade,
      unidadeCompra,
      fatorConversao: fatorFinal,
    });
    if (!r.success) {
      setErro(r.error || "Não foi possível salvar a conversão.");
      return;
    }
    onConfirmado({ unidade, unidadeCompra, fatorConversao: fatorFinal });
  };

  // §8: ESC no portão cancela a adição (linha removida pela página, nada gravado)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (!loading) onCancelar();
    }
  };

  return (
    <div
      onKeyDown={onKeyDown}
      className="mt-2 rounded-xl border px-2.5 py-2"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
    >
      <p className="text-[11px] text-[#B45309]" style={{ fontWeight: 700 }}>
        ⚠ falta a conversão — ajuste na linha antes de salvar
      </p>

      <div className="mt-1.5 flex items-end gap-1.5">
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block text-[10px] leading-none text-[#627271]" style={{ fontWeight: 600 }}>
            Compra em
          </span>
          <select
            autoFocus
            value={unidadeCompra}
            onChange={(e) => trocar("compra", e.target.value)}
            disabled={loading}
            aria-label={`unidade de compra de ${produto.nome}`}
            className={`${campoFormSheet} w-full text-base`}
          >
            {UNIDADES_COMPRA.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <label className="block w-[4.75rem] shrink-0">
          <span className="mb-1 block text-[10px] leading-none text-[#627271]" style={{ fontWeight: 600 }}>
            1 {unidadeCompra} →
          </span>
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={fator}
            onChange={(e) => {
              setFator(e.target.value);
              setErro("");
            }}
            disabled={loading}
            placeholder="395"
            aria-label={`quantos ${unidade} tem em 1 ${unidadeCompra} de ${produto.nome}`}
            className={`${campoFormSheet} px-2 text-base`}
          />
        </label>
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block text-[10px] leading-none text-[#627271]" style={{ fontWeight: 600 }}>
            guarda em
          </span>
          <select
            value={unidade}
            onChange={(e) => trocar("estoque", e.target.value)}
            disabled={loading}
            aria-label={`unidade de estoque de ${produto.nome}`}
            className={`${campoFormSheet} w-full text-base`}
          >
            {UNIDADES_ESTOQUE.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
      </div>

      {unidadesIguais ? (
        <p className="mt-1 text-[11px] leading-snug text-[#B45309]" style={{ fontWeight: 600 }}>
          1 {unidade} = 1 {unidade}? — fator sugerido 1 (compra e guarda na mesma unidade).
        </p>
      ) : null}

      {fatorPrev != null && quantidade > 0 ? (
        <p className="mt-1 text-[11px] leading-snug text-[#627271]" role="status">
          → entra {fmtNum(quantidade * fatorPrev)} {unidade} no estoque ·{" "}
          <LegendaConversao unCompra={unidadeCompra} fator={fatorPrev} unEstoque={unidade} />
        </p>
      ) : null}

      {erro ? (
        <p className="mt-1 text-[11px] leading-snug text-red-600" role="alert" style={{ fontWeight: 500 }}>
          {erro}
        </p>
      ) : null}

      <div className="mt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={confirmar}
          disabled={loading}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#86cb92] px-3 text-sm text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white disabled:opacity-50"
          style={{ fontWeight: 700 }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              salvando...
            </>
          ) : (
            <>
              <Check size={15} />
              confirmar
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => !loading && onCancelar()}
          disabled={loading}
          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#efefef] bg-white px-3 text-sm text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937] disabled:opacity-50"
          style={{ fontWeight: 600 }}
        >
          <X size={15} />
          cancelar
        </button>
      </div>
    </div>
  );
}
