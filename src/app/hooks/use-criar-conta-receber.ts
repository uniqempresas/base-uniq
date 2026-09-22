import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { formaPagamentoParaBanco } from "../components/financeiro/mockData";

/**
 * Parâmetros de criação de conta a receber.
 * Compatível com o contrato congelado `ContaReceberInput`:
 *   cliente (find-or-create em me_cliente), descricao, valor,
 *   data_vencimento, forma_pagamento, observacoes.
 * `cliente` é opcional no tipo apenas para não quebrar chamadas legadas;
 * em runtime a conta SEM cliente (e sem nome extraível da descricao) é recusada.
 */
export interface CriarContaReceberParams {
  cliente?: string;
  cliente_id?: string;
  categoriaId?: string | null;
  descricao: string;
  valor: number;
  data_vencimento: string;
  forma_pagamento?: string;
  observacoes?: string;
}

export interface CriarContaReceberResult {
  success: boolean;
  id?: string;
  error?: string;
}

/** Extrai o nome do cliente de descricoes padrão ("Venda - Luan", "Venda #id - Nome"). */
function extrairClienteDaDescricao(descricao: string): string | null {
  const comUuid = /^Venda\s+#[0-9a-fA-F-]{8,}\s*[-–]\s*(.+)$/.exec(descricao);
  if (comUuid) return comUuid[1].trim();
  const comNome = /^Venda\s*[-–]\s*(.+)$/.exec(descricao);
  if (comNome) return comNome[1].trim();
  return null;
}

async function findOrCreateCliente(
  empresaId: string,
  nome: string
): Promise<string | null> {
  const nomeNormalizado = nome.trim().replace(/\s+/g, " ");
  if (!nomeNormalizado) return null;

  // 1) casa por nome (case-insensitive, padrão do use-criar-pedido)
  const { data: existente } = await supabase
    .from("me_cliente")
    .select("id")
    .eq("empresa_id", empresaId)
    .ilike("nome_cliente", nomeNormalizado)
    .maybeSingle();

  if (existente) return existente.id;

  // 2) cria
  const { data: novo, error: insertError } = await supabase
    .from("me_cliente")
    .insert({
      empresa_id: empresaId,
      nome_cliente: nomeNormalizado,
      origem: "manual",
      tags: [],
      telefone: null,
    })
    .select("id")
    .single();

  if (!insertError && novo) return novo.id;

  // 3) corrida/duplicidade (23505) → recupera o cadastro existente
  if (insertError?.code === "23505") {
    const { data: recuperado } = await supabase
      .from("me_cliente")
      .select("id")
      .eq("empresa_id", empresaId)
      .ilike("nome_cliente", nomeNormalizado)
      .maybeSingle();

    if (recuperado) return recuperado.id;
  }

  console.error("[useCriarContaReceber] find-or-create me_cliente falhou:", insertError);
  return null;
}

export function useCriarContaReceber() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarConta = useCallback(
    async (params: CriarContaReceberParams): Promise<CriarContaReceberResult> => {
      setLoading(true);
      setError(null);

      try {
        // SEM fallback para "primeira empresa". Sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;

        if (!empresaId) {
          throw new Error("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
        }

        // Cliente obrigatório: usa id direto OU find-or-create pelo nome.
        // Fallback legado: extrai o nome da descricao quando cliente não vem no formulário.
        let clienteId: string | null = params.cliente_id || null;

        if (!clienteId) {
          const nomeCliente =
            params.cliente?.trim() ||
            extrairClienteDaDescricao(params.descricao || "");

          if (!nomeCliente) {
            throw new Error("Informe o nome do cliente.");
          }

          clienteId = await findOrCreateCliente(empresaId, nomeCliente);

          if (!clienteId) {
            throw new Error("Não foi possível identificar o cliente. Tente novamente.");
          }
        }

        const { data, error: insertError } = await supabase
          .from("me_contas_receber")
          .insert({
            empresa_id: empresaId,
            cliente_id: clienteId,
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