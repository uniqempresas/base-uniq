-- ============================================================================
-- NOME:    20260917220000_conversa_multi_tenant_por_empresa.sql
-- DATA:    2026-09-17
-- MOTIVO:  Corrige o grão multi-tenant das conversas de chat.
--
-- PROBLEMA:
--   `crm_chat_conversas.id` era `text PRIMARY KEY` e guardava o TELEFONE do
--   contato (ex.: '5511941484562'). Como `id` é PK, um telefone só podia
--   existir UMA vez no banco inteiro — em qualquer empresa. Resultado: um
--   cliente que já conversava com a empresa A não conseguia ter conversa
--   gravada na empresa B. O fluxo n8n gravava `id = telefone` (ver
--   20260916212702_limpa_dados_teste.sql, linhas 8-16).
--
--   Agravante: `canal_id` — que é onde o telefone DEVERIA morar — estava NULL
--   em 100% das linhas. O telefone só existia dentro do `id`.
--
-- SOLUÇÃO:
--   Grão correto de uma conversa = (empresa_id, canal, canal_id).
--   1. `id` passa a ser um surrogate uuid (não carrega mais semântica).
--   2. `canal_id` passa a ser NOT NULL e recebe o telefone (backfill do id antigo).
--   3. Adiciona UNIQUE (empresa_id, canal, canal_id) — o banco passa a IMPEDIR
--      a colisão entre tenants em vez de mascará-la.
--   4. `id_legado` preserva o telefone para rastreabilidade / rollback.
--
-- PRÉ-REQUISITOS (verificados em 2026-09-17):
--   * Nenhuma view/materialized view depende destas tabelas.
--   * Nenhuma FK aponta para crm_chat_mensagens.
--   * RLS por empresa JÁ estava correta — só é recriada por dependência de coluna.
--   * Roteamento de tenant confirmado: 1 número dedicado por empresa, logo
--     (empresa_id, canal_id) está bem definido no momento da chegada da mensagem.
--
-- ESCOPO: NÃO altera outras tabelas; NÃO mexe no workflow n8n. Rodar 2x falha
--   de propósito (guarda de idempotência no passo 0).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0) Guarda de idempotência: se já migrado, aborta em vez de corromper.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'crm_chat_conversas'
      AND column_name  = 'id_legado'
  ) THEN
    RAISE EXCEPTION 'Migração já aplicada (coluna crm_chat_conversas.id_legado existe). Abortando.';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 1) Derruba as políticas de RLS de crm_chat_mensagens.
--    Elas referenciam, no subselect, a coluna `crm_chat_conversas.id` e a
--    coluna local `conversa_id` — ambas serão trocadas. Sem dropar primeiro,
--    o Postgres recusa o DROP COLUMN por dependência.
-- ----------------------------------------------------------------------------
DROP POLICY "Users can create messages in their company conversations" ON public.crm_chat_mensagens;
DROP POLICY "Users can update messages in their company conversations" ON public.crm_chat_mensagens;
DROP POLICY "Users can view messages from their company conversations"   ON public.crm_chat_mensagens;

-- ----------------------------------------------------------------------------
-- 2) Preserva o telefone em canal_id e guarda o id antigo.
-- ----------------------------------------------------------------------------
ALTER TABLE public.crm_chat_conversas ADD COLUMN id_legado text;

UPDATE public.crm_chat_conversas
   SET id_legado = id,
       canal_id   = COALESCE(canal_id, id),
       canal      = COALESCE(canal, 'whatsapp');

-- ----------------------------------------------------------------------------
-- 3) Novo id surrogate.
-- ----------------------------------------------------------------------------
ALTER TABLE public.crm_chat_conversas
  ADD COLUMN id_novo uuid NOT NULL DEFAULT gen_random_uuid();

-- ----------------------------------------------------------------------------
-- 4) Remapeia as mensagens ANTES de derrubar a FK.
-- ----------------------------------------------------------------------------
ALTER TABLE public.crm_chat_mensagens ADD COLUMN conversa_id_novo uuid;

UPDATE public.crm_chat_mensagens m
   SET conversa_id_novo = c.id_novo
  FROM public.crm_chat_conversas c
 WHERE m.conversa_id = c.id_legado;

-- Sanidade: nenhuma mensagem pode ficar órfã.
DO $$
DECLARE v_orfaos integer;
BEGIN
  SELECT count(*) INTO v_orfaos
  FROM public.crm_chat_mensagens
  WHERE conversa_id_novo IS NULL;

  IF v_orfaos > 0 THEN
    RAISE EXCEPTION 'Abortado: % mensagem(ns) sem conversa correspondente.', v_orfaos;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5) Troca as chaves.
-- ----------------------------------------------------------------------------
ALTER TABLE public.crm_chat_mensagens DROP CONSTRAINT crm_chat_mensagens_conversa_id_fkey;
ALTER TABLE public.crm_chat_conversas  DROP CONSTRAINT crm_chat_conversas_pkey;

ALTER TABLE public.crm_chat_mensagens DROP COLUMN conversa_id;
ALTER TABLE public.crm_chat_mensagens RENAME COLUMN conversa_id_novo TO conversa_id;
ALTER TABLE public.crm_chat_mensagens ALTER COLUMN conversa_id SET NOT NULL;

ALTER TABLE public.crm_chat_conversas DROP COLUMN id;
ALTER TABLE public.crm_chat_conversas RENAME COLUMN id_novo TO id;
ALTER TABLE public.crm_chat_conversas ADD CONSTRAINT crm_chat_conversas_pkey PRIMARY KEY (id);

ALTER TABLE public.crm_chat_mensagens
  ADD CONSTRAINT crm_chat_mensagens_conversa_id_fkey
  FOREIGN KEY (conversa_id) REFERENCES public.crm_chat_conversas(id) ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- 6) Unicidade real por tenant — o banco passa a impedir a colisão.
--    Mantém o comportamento atual: 1 conversa por contato, por canal, por
--    empresa. Se no futuro quiser "conversa nova após arquivar", trocar por
--    índice parcial: ... WHERE status <> 'arquivado'.
-- ----------------------------------------------------------------------------
ALTER TABLE public.crm_chat_conversas
  ALTER COLUMN canal_id SET NOT NULL,
  ADD CONSTRAINT uq_conversa_por_tenant_canal UNIQUE (empresa_id, canal, canal_id);

-- ----------------------------------------------------------------------------
-- 7) Recria as políticas de RLS (agora comparando uuid com uuid).
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can create messages in their company conversations"
  ON public.crm_chat_mensagens FOR INSERT
  WITH CHECK (
    conversa_id IN (
      SELECT id FROM public.crm_chat_conversas
      WHERE empresa_id IN (SELECT empresa_id FROM public.me_usuario WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages in their company conversations"
  ON public.crm_chat_mensagens FOR UPDATE
  USING (
    conversa_id IN (
      SELECT id FROM public.crm_chat_conversas
      WHERE empresa_id = (SELECT empresa_id FROM public.me_usuario WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can view messages from their company conversations"
  ON public.crm_chat_mensagens FOR SELECT
  USING (
    conversa_id IN (
      SELECT id FROM public.crm_chat_conversas
      WHERE empresa_id = (SELECT empresa_id FROM public.me_usuario WHERE id = auth.uid())
    )
  );

COMMIT;

-- ============================================================================
-- 8) Contrato estável de ingestão para o n8n (aplicar DEPOIS do commit acima).
--
--    O n8n NÃO deve mais escrever `id = telefone` na tabela. Ele passa a
--    chamar esta função, que faz o upsert pelo grão correto. Assim o schema
--    fica livre para evoluir sem quebrar o workflow.
--
--    O n8n identifica o tenant pela instância/número que RECEBEU a mensagem
--    (1 número dedicado por empresa) e passa p_empresa_id explicitamente.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_ingest_whatsapp(
  p_empresa_id uuid,
  p_telefone   text,
  p_nome       text DEFAULT NULL,
  p_canal      text DEFAULT 'whatsapp'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_canal_id text;
  v_id       uuid;
BEGIN
  v_canal_id := regexp_replace(COALESCE(p_telefone, ''), '\D', '', 'g');

  IF v_canal_id = '' THEN
    RAISE EXCEPTION 'fn_ingest_whatsapp: telefone vazio/inválido (%)', p_telefone;
  END IF;

  INSERT INTO public.crm_chat_conversas (empresa_id, canal, canal_id, nome, status, modo)
  VALUES (p_empresa_id, p_canal, v_canal_id, p_nome, 'aberto', 'bot')
  ON CONFLICT (empresa_id, canal, canal_id)
  DO UPDATE SET updated_at = now(),
                nome       = COALESCE(public.crm_chat_conversas.nome, EXCLUDED.nome)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

-- View de compatibilidade (SOMENTE LEITURA) para o período de rollout —
-- expõe a chave antiga (telefone) para consultas legadas do n8n.
CREATE OR REPLACE VIEW public.vw_conversas_por_telefone AS
SELECT
  id_legado AS id,
  id        AS id_conversa,
  empresa_id, cliente_id, lead_id, status, modo, titulo, nome,
  canal, canal_id, canal_dados, foto_contato, criado_em, updated_at
FROM public.crm_chat_conversas
WHERE id_legado IS NOT NULL;
