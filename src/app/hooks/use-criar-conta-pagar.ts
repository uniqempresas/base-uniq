import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { formaPagamentoParaBanco } from "../components/financeiro/mockData";

/**
 * Parâmetros de criação de conta a pagar.
 * Compatível com o contrato congelado `ContaPagarInput`.
 * `fornecedor` é OPCIONAL: se preenchido, find-or-create em me_fornecedor;
 * se falhar, a conta salva SEM fornecedor_id (não bloqueia).
 */
export interface CriarContaPagarParams {
  fornecedor?: string;
  fornecedor_id?: string;
  categoriaId?: string | null;
  descricao: string;
  valor: number;
  data_vencimento: string;
  forma_pagamento?: string;
  observacoes?: string;
}

export interface CriarContaPagarResult {
  success: boolean;
  id?: string;
  error?: string;
}

async function findOrCreateFornecedor(
  empresaId: string,
  nome: string
): Promise<string | null> {
  const nomeNormalizado = nome.trim().replace(/\s+/g, " ");
  if (!nomeNormalizado) return null;

  // 1) casa por nome (case-insensitive)
  const { data: existente } = await supabase
    .from("me_fornecedor")
    .select("id")
    .eq("empresa_id", empresaId)
    .ilike("nome_fornecedor", nomeNormalizado)
    .maybeSingle();

  if (existente) return existente.id;

  // 2) cria
  const { data: novo, error: insertError } = await supabase
    .from("me_fornecedor")
    .insert({
      empresa_id: empresaId,
      nome_fornecedor: nomeNormalizado,
      ativo: true,
    })
    .select("id")
    .single();

  if (!insertError && novo) return novo.id;

  // 3) corrida/duplicidade (23505) → recupera o cadastro existente
  if (insertError?.code === "23505") {
    const { data: recuperado } = await supabase
      .from("me_fornecedor")
      .select("id")
      .eq("empresa_id", empresaId)
      .ilike("nome_fornecedor", nomeNormalizado)
      .maybeSingle();

    if (recuperado) return recuperado.id;
  }

  console.error("[useCriarContaPagar] find-or-create me_fornecedor falhou:", insertError);
  return null;
}

export function useCriarContaPagar() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarConta = useCallback(
    async (params: CriarContaPagarParams): Promise<CriarContaPagarResult> => {
      setLoading(true);
      setError(null);

      try {
        // SEM fallback para "primeira empresa". Sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;

        if (!empresaId) {
          throw new Error("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
        }

        // Fornecedor OPCIONAL: find-or-create; falha NÃO bloqueia o salvamento.
        let fornecedorId: string | null = params.fornecedor_id || null;

        if (!fornecedorId && params.fornecedor?.trim()) {
          fornecedorId = await findOrCreateFornecedor(empresaId, params.fornecedor);
        }

        const { data, error: insertError } = await supabase
          .from("me_contas_pagar")
          .insert({
            empresa_id: empresaId,
            fornecedor_id: fornecedorId,
            categoria_id: params.categoriaId ?? null,
            descricao: params.descricao,
            valor: params.valor,
            data_vencimento: params.data_vencimento,
            forma_pagamento: formaPagamentoParaBanco(params.forma_pagamento),
            observacoes: params.observacoes || null,
            status: "pendente",
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        return { success: true, id: data?.id };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao criar conta";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { criarConta, loading, error };
}