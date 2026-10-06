/**
 * Criação de compra de insumo (Produção Fase 2 — SPEC-Producao-BOM-Fase2 §4).
 *
 * INSERT do pai (`est_compra`) + dos itens (`est_compra_item`) em 2 passos
 * client-side — o contrato é o mesmo de `use-criar-conta-pagar.ts` (sem RPC de
 * criação; o fechar transacional acontece no RECEBER via `receber_compra`).
 * Falha nos itens apaga o pai (compensação) para não deixar compra órfã.
 *
 * Regras: status nasce `'PENDENTE'` (CHECK maiúsculo), `valor_total` somado no
 * client e revalidado server-side pela RPC, `data_prevista` só no modo agendar
 * (emenda D11). Validations client espelham os CHECKs do banco:
 * quantidade > 0, valor_unitario >= 0, fornecedor obrigatório, 1+ itens,
 * produto com `unidade_compra` exige `fator_conversao > 0`.
 */
import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { ESTADO_COMPRA } from "../types/producao";

export interface ItemCompraInput {
  /** `me_produto.id` (number no banco; aceita string vinda da UI) */
  produtoId: string;
  /** quantidade na unidade de COMPRA */
  quantidade: number;
  /** valor unitário na unidade de COMPRA */
  valorUnitario: number;
}

export interface CriarCompraParams {
  fornecedorId: string;
  notaFiscal?: string | null;
  itens: ItemCompraInput[];
  /** emenda D11: data prevista de recebimento (yyyy-mm-dd) — só no modo agendar */
  dataPrevista?: string | null;
}

export interface CriarCompraResult {
  success: boolean;
  id?: string;
  error?: string;
}

interface DBProdutoCompra {
  id: number;
  nome_produto: string | null;
  unidade_compra: string | null;
  fator_conversao: string | number | null;
}

export function useCriarCompra() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarCompra = useCallback(
    async (params: CriarCompraParams): Promise<CriarCompraResult> => {
      setLoading(true);
      setError(null);

      try {
        // SEM fallback para "primeira empresa". Sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;
        if (!empresaId) {
          throw new Error(
            "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente."
          );
        }

        // ── Validações client (espelho dos CHECKs do banco) ──────────────────
        if (!params.fornecedorId) throw new Error("Selecione o fornecedor da compra.");
        if (params.itens.length === 0) throw new Error("Adicione pelo menos um insumo à compra.");

        for (const item of params.itens) {
          if (!Number.isInteger(Number(item.produtoId))) {
            throw new Error("Item sem produto válido — remova e adicione de novo.");
          }
          if (!(item.quantidade > 0)) {
            throw new Error("Quantidade deve ser maior que zero em todos os itens.");
          }
          if (!(item.valorUnitario >= 0) || !Number.isFinite(item.valorUnitario)) {
            throw new Error("Valor unitário inválido — use número maior ou igual a zero.");
          }
        }

        // Produtos existem na empresa? Conversão de compra íntegra (D6)?
        const ids = [...new Set(params.itens.map((i) => Number(i.produtoId)))];
        const { data: produtos, error: produtosError } = await supabase
          .from("me_produto")
          .select("id, nome_produto, unidade_compra, fator_conversao")
          .in("id", ids)
          .eq("empresa_id", empresaId);

        if (produtosError) throw produtosError;

        const achados = (produtos as DBProdutoCompra[] | null) || [];
        const map = new Map(achados.map((p) => [p.id, p]));
        const faltando = ids.filter((id) => !map.has(id));
        if (faltando.length > 0) {
          throw new Error(
            "Insumo não encontrado nesta empresa. Atualize a lista de produtos e tente de novo."
          );
        }
        for (const p of achados) {
          if (p.unidade_compra?.trim() && !(Number(p.fator_conversao) > 0)) {
            throw new Error(
              `O insumo "${p.nome_produto || "sem nome"}" é comprado por ${p.unidade_compra.trim()}, mas está sem fator de conversão no cadastro. Corrija o produto antes de registrar a compra.`
            );
          }
        }

        // valor_total somado no client (a RPC revalida ao receber)
        const valorTotal =
          Math.round(params.itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0) * 100) / 100;

        // ── INSERT pai ───────────────────────────────────────────────────────
        const { data: compra, error: paiError } = await supabase
          .from("est_compra")
          .insert({
            empresa_id: empresaId,
            fornecedor_id: params.fornecedorId,
            status: ESTADO_COMPRA.PENDENTE,
            valor_total: valorTotal,
            nota_fiscal: params.notaFiscal?.trim() || null,
            data_prevista: params.dataPrevista || null,
          })
          .select("id")
          .single();

        if (paiError) throw paiError;
        if (!compra?.id) throw new Error("Não foi possível criar a compra.");

        // ── INSERT itens ─────────────────────────────────────────────────────
        const { error: itensError } = await supabase.from("est_compra_item").insert(
          params.itens.map((i) => ({
            compra_id: compra.id,
            produto_id: Number(i.produtoId),
            quantidade: i.quantidade,
            valor_unitario: i.valorUnitario,
          }))
        );

        if (itensError) {
          // compensação: sem itens a compra é ruído na lista — remove o pai
          await supabase.from("est_compra").delete().eq("id", compra.id);
          throw itensError;
        }

        return { success: true, id: compra.id };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao criar compra";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { criarCompra, loading, error };
}
