-- ============================================================================
-- NOME:    20261021010423_limpa_dados_tenant_por_nome.sql
-- DATA:    2026-10-20
-- MOTIVO:  Função reutilizável para limpar TODOS os dados de entrada (teste)
--          de um tenant da Base UNIQ, resolvido pelo NOME da empresa.
--          Substitui a limpeza manual recorrente feita durante os testes.
--
-- O QUE APAGA (entradas de teste, escopo estrito por empresa_id):
--   * Produtos: me_produto (+ imagens/variações) e estoque/produção
--     (est_ficha_tecnica, est_ordem_producao, est_movimentacao, est_compra,
--     est_recebimento).
--   * Financeiro: me_venda (+itens/histórico/serviços), me_contas_pagar,
--     me_contas_receber, me_movimentacao_financeira, fn_movimento,
--     fn_movimento_recorrencia, cx_movimentacao_caixa.
--   * CRM: me_cliente, crm_leads, crm_oportunidades, crm_atendimentos,
--     crm_atividades, crm_chat_conversas (+mensagens, cascade),
--     agd_agendamentos, atd_conversas (via clientes do tenant).
--
-- O QUE NÃO TOCA (configuração preservada para recadastrar por cima):
--   me_empresa, me_usuario, me_fornecedor, me_categoria, me_subcategoria,
--   me_tag, me_forma_pagamento, me_conta, fn_categoria, fn_conta, tabelas
--   agd_* de configuração, crm_etapas, crm_origem, unq_empresa_modulos e
--   tabelas _bk_*.
--
--   ⚠️ mel_chat / mel_chat_buffer NÃO são limpas: não têm escopo por tenant
--   (chave = telefone de sessão do n8n). O mesmo WhatsApp pode estar em mais
--   de um tenant — use a função legada limpar_dados_teste(telefone, empresa)
--   para esses casos pontuais.
--
-- SEGURANÇA:
--   * Resolução por nome: aceita slug OU nome_fantasia (case-insensitive).
--     Se o nome bater em mais de uma empresa, ERRA sem apagar nada (e lista
--     os slugs disponíveis no caso de não encontrar).
--   * Deleções 100% filtradas por empresa_id (exceto atd_conversas, sem
--     empresa_id, filtrada pelos clientes do tenant).
--   * Tudo em UMA transação: qualquer erro reverte tudo.
--   * p_criar_backup=true cria cópias _bk_<tag>_<tabela> no schema private
--     antes de apagar (tag = yyyymmdd_hh24mi).
--   * SECURITY DEFINER com search_path fixado; EXECUTE restrito
--     (schema private não é exposto pela Data API; anon/authenticated sem
--     USAGE no schema e sem EXECUTE na função).
--
-- USO (agente/psql/CLI):
--   select private.limpar_dados_tenant_empresa('docee');
--   select private.limpar_dados_tenant_empresa('Doceê');          -- nome também resolve
--   select private.limpar_dados_tenant_empresa('docee', true);    -- com backup prévio
--
-- RETORNO: jsonb com empresa resolvida + contagem apagada por tabela.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS private;

REVOKE USAGE ON SCHEMA private FROM anon, authenticated;

CREATE OR REPLACE FUNCTION private.limpar_dados_tenant_empresa(
  p_empresa_nome  text,
  p_criar_backup  boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $function$
DECLARE
  v_nome_busca   text    := btrim(coalesce(p_empresa_nome, ''));
  v_empresa_id   uuid;
  v_empresa_nome text;
  v_slug         text;
  v_qtd          integer;
  v_total        bigint  := 0;
  v_count        integer;
  v_backup_tag   text    := to_char(now(), 'YYYYMMDD_HH24MI');
  v_backup       boolean := coalesce(p_criar_backup, false);
  v_apagados     jsonb   := '{}'::jsonb;
  v_report       jsonb;
  t              text;
BEGIN
  IF v_nome_busca = '' THEN
    RAISE EXCEPTION 'limpar_dados_tenant_empresa: informe o nome (ou slug) da empresa. Ex.: select private.limpar_dados_tenant_empresa(''docee'');';
  END IF;

  -- -------------------------------------------------------------------------
  -- 1) Resolver o tenant pelo nome (slug ou nome_fantasia, case-insensitive)
  -- -------------------------------------------------------------------------
  SELECT count(*) INTO v_qtd
  FROM public.me_empresa
  WHERE lower(slug) = lower(v_nome_busca)
     OR lower(nome_fantasia) = lower(v_nome_busca);

  IF v_qtd > 1 THEN
    RAISE EXCEPTION 'limpar_dados_tenant_empresa: "%" corresponde a % empresas. Use o slug exato. Slugs disponíveis: %',
      v_nome_busca, v_qtd,
      (SELECT string_agg(slug, ', ' ORDER BY slug) FROM public.me_empresa);
  ELSIF v_qtd = 1 THEN
    SELECT id, nome_fantasia, slug INTO v_empresa_id, v_empresa_nome, v_slug
    FROM public.me_empresa
    WHERE lower(slug) = lower(v_nome_busca)
       OR lower(nome_fantasia) = lower(v_nome_busca);
  ELSE
    -- Fallback: correspondência parcial em slug ou nome_fantasia
    SELECT count(*) INTO v_qtd
    FROM public.me_empresa
    WHERE slug ILIKE '%' || v_nome_busca || '%'
       OR nome_fantasia ILIKE '%' || v_nome_busca || '%';

    IF v_qtd = 0 THEN
      RAISE EXCEPTION 'limpar_dados_tenant_empresa: empresa "%" não encontrada. Slugs disponíveis: %',
        v_nome_busca,
        (SELECT string_agg(slug, ', ' ORDER BY slug) FROM public.me_empresa);
    ELSIF v_qtd > 1 THEN
      RAISE EXCEPTION 'limpar_dados_tenant_empresa: "%" corresponde a % empresas (busca parcial). Use o slug exato. Slugs disponíveis: %',
        v_nome_busca, v_qtd,
        (SELECT string_agg(slug, ', ' ORDER BY slug) FROM public.me_empresa);
    END IF;

    SELECT id, nome_fantasia, slug INTO v_empresa_id, v_empresa_nome, v_slug
    FROM public.me_empresa
    WHERE slug ILIKE '%' || v_nome_busca || '%'
       OR nome_fantasia ILIKE '%' || v_nome_busca || '%';
  END IF;

  -- -------------------------------------------------------------------------
  -- 2) Backup opcional (schema private, tag por execução)
  -- -------------------------------------------------------------------------
  IF v_backup THEN
    FOREACH t IN ARRAY ARRAY[
      'est_recebimento','est_compra','est_ordem_producao','est_ficha_tecnica','est_movimentacao',
      'me_produto','me_venda','me_itens_venda','me_venda_historico','me_venda_servicos',
      'me_contas_pagar','me_contas_receber','me_movimentacao_financeira',
      'fn_movimento','fn_movimento_recorrencia','cx_movimentacao_caixa',
      'me_cliente','crm_oportunidades','crm_leads','crm_atendimentos','crm_atividades',
      'crm_chat_conversas','agd_agendamentos'
    ] LOOP
      EXECUTE format(
        'CREATE TABLE private._bk_%s_%s AS SELECT * FROM public.%I WHERE empresa_id = %L',
        v_backup_tag, t, t, v_empresa_id
      );
    END LOOP;

    -- atd_conversas não tem empresa_id: filtra pelos clientes do tenant
    EXECUTE format(
      'CREATE TABLE private._bk_%s_atd_conversas AS
       SELECT c.* FROM public.atd_conversas c
       WHERE c.id_cliente IN (SELECT id FROM public.me_cliente WHERE empresa_id = %L)',
      v_backup_tag, v_empresa_id
    );
  END IF;

  -- -------------------------------------------------------------------------
  -- 3) Deleções em ordem FK-segura (filhas antes de pais). Ordem importa:
  --    est_recebimento tem FK sem cascade p/ me_produto; crm_oportunidades
  --    e crm_chat_conversas antes de crm_leads (FK sem cascade).
  -- -------------------------------------------------------------------------
  FOREACH t IN ARRAY ARRAY[
    'est_recebimento',
    'est_compra',              -- cascade: est_compra_item
    'est_ordem_producao',      -- cascade: est_ordem_producao_item
    'est_ficha_tecnica',
    'est_movimentacao',
    'me_produto',              -- cascade: imagens, variações, fichas, movs, ordens, itens de compra/oportunidade
    'me_venda',                -- cascade: me_itens_venda, me_venda_historico, me_contas_receber
    'me_venda_servicos',       -- cascade: me_venda_servicos_itens
    'me_contas_pagar',         -- cascade: me_movimentacao_financeira
    'me_contas_receber',
    'me_movimentacao_financeira',
    'fn_movimento',
    'fn_movimento_recorrencia',
    'cx_movimentacao_caixa',
    'crm_oportunidades',       -- cascade: crm_atividades, crm_oportunidade_produtos
    'crm_leads',
    'crm_atendimentos',
    'crm_atividades',
    'crm_chat_conversas',      -- cascade: crm_chat_mensagens
    'agd_agendamentos',
    'me_cliente'               -- por último: cascade limpa o restante vinculado
  ] LOOP
    EXECUTE format('DELETE FROM public.%I WHERE empresa_id = $1', t)
    USING v_empresa_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_apagados := v_apagados || jsonb_build_object(t, v_count);
    v_total := v_total + v_count;
  END LOOP;

  -- atd_conversas: sem empresa_id → via clientes do tenant
  EXECUTE
    'DELETE FROM public.atd_conversas
     WHERE id_cliente IN (SELECT id FROM public.me_cliente WHERE empresa_id = $1)'
  USING v_empresa_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_apagados := v_apagados || jsonb_build_object('atd_conversas', v_count);
  v_total := v_total + v_count;

  -- -------------------------------------------------------------------------
  -- 4) Relatório
  -- -------------------------------------------------------------------------
  v_report := jsonb_build_object(
    'empresa_id',   v_empresa_id,
    'empresa',      v_empresa_nome,
    'slug',         v_slug,
    'backup_tag',   CASE WHEN v_backup THEN v_backup_tag ELSE NULL END,
    'apagados',     v_apagados,
    'total_linhas', v_total
  );
  RETURN v_report;
END;
$function$;

-- Segurança: função de manutenção — nada de acesso público
REVOKE ALL ON FUNCTION private.limpar_dados_tenant_empresa(text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.limpar_dados_tenant_empresa(text, boolean) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION private.limpar_dados_tenant_empresa(text, boolean) TO service_role;

COMMENT ON FUNCTION private.limpar_dados_tenant_empresa(text, boolean) IS
  'Limpa TODOS os dados de entrada (produtos, estoque/produção, financeiro, CRM) '
  'de um tenant resolvido pelo NOME/slug da empresa. Configuração é preservada. '
  'Retorna jsonb com contagem por tabela. Opcional: p_criar_backup=true cria '
  '_bk_<tag>_<tabela> no schema private. Uso: '
  'select private.limpar_dados_tenant_empresa(''docee'');';
