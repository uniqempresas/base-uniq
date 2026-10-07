/**
 * Escrita de produto (criar/atualizar) — Produção F1 (SPEC-Producao-BOM-Fase1 §4).
 *
 * `me_produto.natureza` é o eixo de produção (simples/composto/insumo); o legado
 * `me_produto.tipo` (variações) continua intocado — PRD D5.
 *
 * Regra da vitrine (SPEC §6.3): `insumo` NUNCA aparece na vitrine — o payload
 * força `exibir_vitrine: false` independentemente do que vier da UI.
 */
import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { NaturezaProduto } from "../types/producao";

export interface CriarProdutoParams {
  nome: string;
  sku?: string;
  codigoBarras?: string;
  /** `me_produto.categoria_id` — a categoria vive aqui, NÃO em `tipo` */
  categoriaId?: number | null;
  precoVenda: number;
  precoCusto?: number;
  estoque?: number;
  estoqueMinimo?: number;
  descricao?: string;
  fotoUrl?: string;
  tags?: string[]; // nomes das tags → me_produto.opcoes_config (jsonb array de strings)
  /** `me_produto.exibir_vitrine` — default true (banco alinhado na migration) */
  exibirVitrine?: boolean;
  /** `me_produto.preco_varejo` — preço "de" da vitrine; null limpa */
  precoPromocional?: number | null;
  /** `me_produto.unidade` — coluna aditiva (SPEC §2.5) */
  unidade?: string | null;
  /** `me_produto.natureza` — default 'simples' quando omitido (Produção F1) */
  natureza?: NaturezaProduto;
  /**
   * `me_produto.unidade_compra` — unidade de compra do insumo (Produção F2).
   * null/omitido = compra direto na unidade do estoque.
   */
  unidadeCompra?: string | null;
  /** `me_produto.fator_conversao` — > 0; null = 1 (Produção F2) */
  fatorConversao?: number | null;
}

/**
 * Regra F2 (SPEC §5.1) + à-prova-de-inversão (Caixa de Uva, 07/10/2026):
 * a compra é SEMPRE na unidade de compra e o estoque na unidade de estoque.
 *
 * Validação client-side única, usada pelo ProdutoFormModal, pelo MiniSheet da
 * NovaCompraPage e pelos dois hooks de escrita — o CHECK do banco é a segunda
 * linha de defesa.
 *
 * Regras:
 * - sem unidade de compra → sem conversão (fator avulso é ignorado);
 * - unidade de compra preenchida exige unidade de estoque informada;
 * - mesma unidade (ignorando caixa) → fator precisa ser 1 (vazio = 1);
 * - unidades diferentes → fator OBRIGATORIAMENTE > 1 (bloqueia o 0/1/invertido
 *   que gravou "1 g = 500 Caixa" no cadastro da caixa de uva).
 */
export function validarConversaoCompra(
  unidadeCompra?: string | null,
  fatorConversao?: number | null,
  unidade?: string | null
): string | null {
  const uc = unidadeCompra?.trim() ?? "";
  if (!uc) return null;

  const est = unidade?.trim() ?? "";
  if (!est) {
    return `Informe a unidade do estoque (o que você guarda lá — ex.: g, un, kg) para converter compras por "${uc}".`;
  }

  const fatorValido = fatorConversao != null && Number.isFinite(Number(fatorConversao))
    ? Number(fatorConversao)
    : null;

  const mesmaUnidade = uc.toLowerCase() === est.toLowerCase();
  if (mesmaUnidade) {
    if (fatorValido === null || fatorValido === 1) return null;
    return (
      `1 ${uc} já É a unidade do estoque — o fator é 1. ` +
      `Se você compra em "${uc}" mas guarda em outra unidade, ajuste a Unidade do estoque.`
    );
  }

  if (fatorValido === null || !(fatorValido > 1)) {
    return (
      `Se 1 ${uc} ≠ 1 ${est}, diga quantos ${est} tem em 1 ${uc} ` +
      `(ex.: 1 Caixa = 500 g → fator 500). O fator precisa ser maior que 1.`
    );
  }
  return null;
}

export interface CriarProdutoResult {
  success: boolean;
  id?: number;
  error?: string;
}

export function useCriarProduto() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarProduto = useCallback(
    async (params: CriarProdutoParams): Promise<CriarProdutoResult> => {
      setLoading(true);
      setError(null);

      try {
        // SEM fallback para "primeira empresa". Sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;

        if (!empresaId) {
          throw new Error("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
        }

        const natureza: NaturezaProduto = params.natureza ?? "simples";

        // F2 + anti-inversão: unidade de compra exige fator coerente com a
        // unidade do estoque — falha antes da rede com mensagem clara.
        const erroConversao = validarConversaoCompra(params.unidadeCompra, params.fatorConversao, params.unidade);
        if (erroConversao) throw new Error(erroConversao);

        const { data: novoProduto, error: produtoError } = await supabase
          .from("me_produto")
          .insert({
            empresa_id: empresaId,
            nome_produto: params.nome,
            sku: params.sku || null,
            codigo_barras: params.codigoBarras || null,
            // `tipo` é TIPO DE PRODUTO (simples/variavel/Outros) — nunca gravar
            // nome de categoria aqui. Categoria vai em `categoria_id`.
            categoria_id: params.categoriaId ?? null,
            tipo: "Outros",
            // Produção F1: eixo de produção (coluna nova, default 'simples' no banco)
            natureza,
            preco: params.precoVenda,
            preco_custo: params.precoCusto || 0,
            estoque_atual: params.estoque || 0,
            estoque_minimo: params.estoqueMinimo ?? 5,
            descricao: params.descricao || null,
            foto_url: params.fotoUrl || null,
            opcoes_config: params.tags?.length ? params.tags : [],
            ativo: true,
            // Insumo é matéria-prima: nunca vende, nunca vitrine (SPEC §6.3 — força off)
            exibir_vitrine: natureza === "insumo" ? false : params.exibirVitrine ?? true,
            preco_varejo: params.precoPromocional ?? null,
            unidade: params.unidade ?? null,
            // Produção F2: conversão de embalagem do insumo (null = compra na unidade do estoque)
            unidade_compra: params.unidadeCompra?.trim() || null,
            fator_conversao: params.fatorConversao ?? null,
          })
          .select("id")
          .single();

        if (produtoError) throw produtoError;

        return {
          success: true,
          id: novoProduto?.id,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao criar produto";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return {
    criarProduto,
    loading,
    error,
  };
}
