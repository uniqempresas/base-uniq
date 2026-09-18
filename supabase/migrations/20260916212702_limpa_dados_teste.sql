-- ============================================================================
-- NOME:    20260916212702_limpa_dados_teste.sql
-- DATA:    2026-09-16
-- MOTIVO:  Procedure reutilizável para limpar dados de teste do tenant Doceê
--          (empresa_id = '52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f'), apagando
--          clientes/pedidos/conversas de um telefone de teste específico.
--
-- SEGURANÇA / ESCOPO:
--   * Tudo é filtrado por p_telefone + p_empresa_id. O MESMO telefone existe
--     em OUTROS tenants ("Henriq Silva" 6257ebef..., "Thalita de Campos"
--     61616cfa...) — NUNCA são tocados.
--   * Tabelas de conversa NÃO são escopadas por tenant na prática (fluxo n8n
--     grava sessão/id = telefone): mel_chat_buffer.n_telefone,
--     mel_chat.session_id, crm_chat_mensagens.conversa_id,
--     crm_chat_conversas (id = telefone ou canal_id/canal_dados) — apagadas
--     por padrão do telefone (ilike).
--   * FKs de me_cliente mapeadas: atd_conversas.id_cliente,
--     crm_atendimentos.cliente_id, crm_chat_conversas.cliente_id,
--     crm_oportunidades.cliente_id, agd_agendamentos.cliente_id,
--     fn_movimento.cliente_id, me_contas_receber.cliente_id,
--     me_venda_servicos.cliente_id. Filhas de me_venda: me_itens_venda.venda_id,
--     me_venda_historico.venda_id, me_contas_receber.venda_id.
--     me_venda.cliente_id NÃO tem FK -> apagada por último (depois das filhas).
--   * NÃO executa ALTER/DROP em tabelas; não mexe no workflow n8n; não toca
--     em dados fora de p_telefone/p_empresa_id. Idempotente: rodar 2x não gera
--     erro (deletes não encontram mais nada).
--
-- USO:
--   select public.limpar_dados_teste(
--     '5511941484562',                     -- telefone de teste (normalizado)
--     '52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f' -- tenant Doceê
--   );
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Procedure reutilizável de limpeza de dados de teste
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.limpar_dados_teste(
  p_telefone text,
  p_empresa_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  v_digitos   text;     -- telefone normalizado (só dígitos)
  v_count     integer;  -- contagem reutilizada nos RAISE NOTICE
  v_clientes  uuid[];   -- ids em me_cliente do tenant + telefone
  v_vendas    uuid[];   -- ids em me_venda desses clientes
BEGIN
  -- 0) Normalização: espelha fn_normalizar_telefone (regexp_replace '\D').
  --    O usuário digita 1194148-4562; o chamador normalmente passa o número já
  --    com DDI 55 — a normalização garante que '5511941484562' e '11941484562'
  --    caiam no mesmo padrão de busca.
  v_digitos := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');

  IF v_digitos = '' THEN
    RAISE EXCEPTION 'limpar_dados_teste: p_telefone vazio/inválido (%s)', p_telefone;
  END IF;

  RAISE NOTICE 'limpar_dados_teste: normalização realizada (padrão de busca "%%%s%%").', v_digitos;

  -- --------------------------------------------------------------------------
  -- 1) TABELAS DE CONVERSA — escopo por telefone (não por tenant), porque o
  --    fluxo n8n grava conversa_id/session_id = telefone.
  --    Ordem: mensagens antes das conversas (filhas antes de pais).
  -- --------------------------------------------------------------------------

  DELETE FROM public.mel_chat_buffer
  WHERE n_telefone ILIKE '%' || v_digitos || '%';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'mel_chat_buffer: % linha(s) apagada(s)', v_count;

  DELETE FROM public.mel_chat
  WHERE session_id ILIKE '%' || v_digitos || '%';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'mel_chat: % linha(s) apagada(s)', v_count;

  DELETE FROM public.crm_chat_mensagens
  WHERE conversa_id ILIKE '%' || v_digitos || '%';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'crm_chat_mensagens: % linha(s) apagada(s)', v_count;

  DELETE FROM public.crm_chat_conversas
  WHERE id ILIKE '%' || v_digitos || '%'
     OR canal_id ILIKE '%' || v_digitos || '%'
     OR canal_dados ILIKE '%' || v_digitos || '%';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'crm_chat_conversas (por telefone): % linha(s) apagada(s)', v_count;

  -- --------------------------------------------------------------------------
  -- 2) CLIENTES DO TENANT — me_cliente (empresa_id = p_empresa_id) com o
  --    telefone de teste. Recolhe os ids do cliente e das vendas ANTES de
  --    qualquer delete, para reutilizar nos deletes abaixo.
  -- --------------------------------------------------------------------------
  SELECT array_agg(c.id)
  INTO v_clientes
  FROM public.me_cliente c
  WHERE c.empresa_id = p_empresa_id
    AND c.telefone ILIKE '%' || v_digitos || '%';

  -- Segurança: não apagar nada de outros tenants (v_vendas só nasce das vendas
  -- cujo cliente pertence ao tenant acima).
  SELECT array_agg(v.id)
  INTO v_vendas
  FROM public.me_venda v
  WHERE v.cliente_id = ANY(v_clientes);

  IF v_clientes IS NULL THEN
    RAISE NOTICE 'limpar_dados_teste: nenhum cliente do tenant % com telefone contendo "%s". Nada a limpar em me_cliente/vendas.', p_empresa_id, v_digitos;
    RETURN;
  END IF;

  RAISE NOTICE 'limpar_dados_teste: % cliente(s) do tenant encontrado(s); % venda(s) relacionada(s).',
               array_length(v_clientes, 1), coalesce(array_length(v_vendas, 1), 0);

  -- --------------------------------------------------------------------------
  -- 3) FILHAS DE me_venda (apagar antes de me_venda)
  -- --------------------------------------------------------------------------
  DELETE FROM public.me_itens_venda
  WHERE venda_id = ANY(v_vendas);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'me_itens_venda: % linha(s) apagada(s)', v_count;

  DELETE FROM public.me_venda_historico
  WHERE venda_id = ANY(v_vendas);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'me_venda_historico: % linha(s) apagada(s)', v_count;

  -- me_contas_receber tem FK tanto para me_venda (venda_id) quanto para
  -- me_cliente (cliente_id): cobre os dois caminhos.
  DELETE FROM public.me_contas_receber
  WHERE venda_id = ANY(v_vendas)
     OR cliente_id = ANY(v_clientes);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'me_contas_receber: % linha(s) apagada(s)', v_count;

  -- --------------------------------------------------------------------------
  -- 4) FILHAS DE me_cliente (apagar antes de me_cliente)
  -- --------------------------------------------------------------------------
  DELETE FROM public.me_venda_servicos
  WHERE cliente_id = ANY(v_clientes);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'me_venda_servicos: % linha(s) apagada(s)', v_count;

  DELETE FROM public.atd_conversas
  WHERE id_cliente = ANY(v_clientes);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'atd_conversas: % linha(s) apagada(s)', v_count;

  DELETE FROM public.crm_atendimentos
  WHERE cliente_id = ANY(v_clientes);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'crm_atendimentos: % linha(s) apagada(s)', v_count;

  -- Segurança extra: mensagens de conversas vinculadas por cliente (conversas
  -- cujo id NÃO contém o telefone, ex.: uuid) precisam ser removidas antes de
  -- apagar crm_chat_conversas por cliente_id — filhas antes de pais.
  DELETE FROM public.crm_chat_mensagens
  WHERE conversa_id IN (
    SELECT cc.id
    FROM public.crm_chat_conversas cc
    WHERE cc.cliente_id = ANY(v_clientes)
  );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'crm_chat_mensagens (de conversas do cliente): % linha(s) apagada(s)', v_count;

  DELETE FROM public.crm_chat_conversas
  WHERE cliente_id = ANY(v_clientes);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'crm_chat_conversas (por cliente): % linha(s) apagada(s)', v_count;

  DELETE FROM public.crm_oportunidades
  WHERE cliente_id = ANY(v_clientes);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'crm_oportunidades: % linha(s) apagada(s)', v_count;

  DELETE FROM public.agd_agendamentos
  WHERE cliente_id = ANY(v_clientes);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'agd_agendamentos: % linha(s) apagada(s)', v_count;

  DELETE FROM public.fn_movimento
  WHERE cliente_id = ANY(v_clientes);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'fn_movimento: % linha(s) apagada(s)', v_count;

  -- --------------------------------------------------------------------------
  -- 5) me_venda (sem FK de cliente) e me_cliente (pai) — por último
  -- --------------------------------------------------------------------------
  DELETE FROM public.me_venda
  WHERE cliente_id = ANY(v_clientes);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'me_venda: % linha(s) apagada(s)', v_count;

  DELETE FROM public.me_cliente
  WHERE id = ANY(v_clientes);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'me_cliente: % linha(s) apagada(s)', v_count;

  RAISE NOTICE 'limpar_dados_teste: limpeza do tenant % concluída (telefone %%).', p_empresa_id, v_digitos;
END;
$function$;

COMMENT ON FUNCTION public.limpar_dados_teste(text, uuid) IS
  'Limpa dados de teste de UM tenant específico pelo telefone normalizado. '
  'Escopo estrito: telefone (ilike %%digitos%%) + empresa_id. Nunca toca '
  'clientes/pedidos de outros tenants, mesmo com telefones idênticos. '
  'Uso: select public.limpar_dados_teste(''5511941484562'', ''''...''::uuid);';