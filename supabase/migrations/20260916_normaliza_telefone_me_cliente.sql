-- ============================================================================
-- NOME:    20260916_normaliza_telefone_me_cliente.sql
-- DATA:    2026-09-16
-- MOTIVO:  Dedup de clientes em public.me_cliente — duas origens (loja virtual
--          e atendente WhatsApp via n8n) gravam sem checar existência e com
--          formatos de telefone divergentes, gerando linhas duplicadas.
--
-- ORDEM DAS ETAPAS (executar nesta sequência):
--   1. Função IMMUTABLE public.fn_normalizar_telefone(text)
--      (espelha EXATAMENTE a lógica de src/app/components/loja/lojaMockData.ts,
--       função normalizarTelefoneLoja — linha 399; com a diferença de que, em
--       SQL, entrada vazia retorna NULL em vez de string vazia).
--   2. Trigger trg_me_cliente_normaliza_telefone (BEFORE INSERT OR UPDATE OF
--      telefone) com função trigger plpgsql separada.
--   3. Backfill: normaliza o telefone de todas as linhas existentes
--      (a trigger não dispara em UPDATE que não toca a coluna com "OF
--      telefone", então o UPDATE explícito é obrigatório).
--   4. Merge genérico de duplicados por (empresa_id, telefone): mantém UMA
--      linha vencedora por grupo, reaponta as tabelas filhas para o vencedor
--      e apaga as perdedoras. Nenhum ID é hardcoded.
--   5. Índice único parcial ux_me_cliente_empresa_telefone
--      (WHERE telefone IS NOT NULL) para impedir novas duplicações.
--
-- Idempotência: CREATE OR REPLACE FUNCTION, DROP TRIGGER IF EXISTS,
-- CREATE UNIQUE INDEX IF NOT EXISTS. NÃO roda DDL destrutivo nenhum.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Função de normalização de telefone (IMMUTABLE)
-- ----------------------------------------------------------------------------
-- Espelha normalizarTelefoneLoja de lojaMockData.ts:
--   a) remove tudo que não é dígito (regexp_replace '\D');
--   b) vazio -> NULL;
--   c) começa com "0" -> remove o primeiro caractere;
--   d) começa com "55" E length em (12,13) -> retorna como está;
--   e) length em (10,11) -> prefixa "55";
--   f) senão -> retorna os dígitos como estão.
CREATE OR REPLACE FUNCTION public.fn_normalizar_telefone(p_telefone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $function$
  SELECT CASE
    WHEN sem_zero.d = ''
      THEN NULL
    WHEN sem_zero.d LIKE '55%' AND length(sem_zero.d) IN (12, 13)
      THEN sem_zero.d
    WHEN length(sem_zero.d) IN (10, 11)
      THEN '55' || sem_zero.d
    ELSE sem_zero.d
  END
  FROM (
    SELECT CASE
        WHEN digitos.d LIKE '0%'
          THEN substring(digitos.d FROM 2)  -- remove apenas UM zero inicial
        ELSE digitos.d
      END AS d
    FROM (
      SELECT regexp_replace(p_telefone, '\D', '', 'g') AS d  -- só dígitos
    ) AS digitos
  ) AS sem_zero;
$function$;

COMMENT ON FUNCTION public.fn_normalizar_telefone(text) IS
  'Normaliza telefone para somente dígitos com DDI 55. Espelha a lógica '
  'de normalizarTelefoneLoja (lojaMockData.ts). Vazio retorna NULL.';

-- ----------------------------------------------------------------------------
-- ETAPA 2 — Trigger que garante telefone normalizado em INSERT e UPDATE
-- ----------------------------------------------------------------------------
-- Função trigger separada (plpgsql): só faz o que está no nome.
CREATE OR REPLACE FUNCTION public.trg_me_cliente_normaliza_telefone_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.telefone := public.fn_normalizar_telefone(NEW.telefone);
  RETURN NEW;
END;
$function$;

-- Idempotente: remove trigger antiga (se existir) antes de recriar.
DROP TRIGGER IF EXISTS trg_me_cliente_normaliza_telefone ON public.me_cliente;

-- "OF telefone": dispara apenas quando a coluna telefone é incluída no UPDATE
-- (INSERT sempre dispara). Evita rewrite desnecessário de linhas em UPDATEs
-- que não tocam o telefone.
CREATE TRIGGER trg_me_cliente_normaliza_telefone
  BEFORE INSERT OR UPDATE OF telefone ON public.me_cliente
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_me_cliente_normaliza_telefone_fn();

-- ----------------------------------------------------------------------------
-- ETAPA 3 — Backfill das linhas existentes
-- ----------------------------------------------------------------------------
-- A trigger com "OF telefone" NÃO dispara em UPDATE que não mencione a coluna;
-- por isso o UPDATE explícito abaixo é necessário para migrar o que já existe.
-- (A trigger dispara aqui porque telefone está no SET — normaliza de novo,
-- o que é idempotente e inofensivo.)
UPDATE public.me_cliente
SET telefone = public.fn_normalizar_telefone(telefone)
WHERE telefone IS NOT NULL;

-- ----------------------------------------------------------------------------
-- ETAPA 4 — Merge genérico de duplicados por (empresa_id, telefone)
-- ----------------------------------------------------------------------------
-- Para cada grupo (empresa_id, telefone) com COUNT(*) > 1:
--   * vencedor = maior nº de colunas não-nulas entre (email, documento,
--     cpf_cnpj, cep, endereco, cidade, foto_url, data_nascimento);
--     empate -> criado_em mais antigo; empate -> id menor (determinístico).
--   * perdedores = demais linhas do grupo.
-- Antes do DELETE, atualiza as tabelas filhas trocando a referência ao
-- perdedor pela referência ao vencedor.
DO $dedup$
DECLARE
  v_perdedores  integer := 0;
  v_reapontados integer := 0;
  v_apagados    integer := 0;
  v_r           integer := 0;
BEGIN
  -- Garante reexecução segura dentro da mesma sessão (idempotente).
  DROP TABLE IF EXISTS tmp_me_cliente_dedup_map;

  -- Mapa perdedor -> vencedor construído via CTEs e ROW_NUMBER.
  CREATE TEMP TABLE tmp_me_cliente_dedup_map ON COMMIT DROP AS
  WITH duplicados AS (
    SELECT mc.empresa_id, mc.telefone
    FROM public.me_cliente mc
    WHERE mc.telefone IS NOT NULL
    GROUP BY mc.empresa_id, mc.telefone
    HAVING COUNT(*) > 1
  ),
  ranqueados AS (
    SELECT
      mc.id,
      mc.empresa_id,
      mc.telefone,
      ROW_NUMBER() OVER (
        PARTITION BY mc.empresa_id, mc.telefone
        ORDER BY
          ( (mc.email           IS NOT NULL)::int
          + (mc.documento       IS NOT NULL)::int
          + (mc.cpf_cnpj        IS NOT NULL)::int
          + (mc.cep             IS NOT NULL)::int
          + (mc.endereco        IS NOT NULL)::int
          + (mc.cidade          IS NOT NULL)::int
          + (mc.foto_url        IS NOT NULL)::int
          + (mc.data_nascimento IS NOT NULL)::int
          ) DESC,
          mc.criado_em ASC NULLS LAST,   -- vencedor = mais antigo
          mc.id ASC                       -- desempate determinístico
      ) AS rn
    FROM public.me_cliente mc
    INNER JOIN duplicados d
      ON d.empresa_id IS NOT DISTINCT FROM mc.empresa_id
     AND d.telefone = mc.telefone
  ),
  vencedores AS (
    SELECT id AS vencedor_id, empresa_id, telefone
    FROM ranqueados
    WHERE rn = 1
  ),
  perdedores AS (
    SELECT r.id AS perdedor_id, v.vencedor_id
    FROM ranqueados r
    INNER JOIN vencedores v
      ON v.empresa_id IS NOT DISTINCT FROM r.empresa_id
     AND v.telefone = r.telefone
    WHERE r.rn > 1
  )
  SELECT perdedor_id, vencedor_id
  FROM perdedores;

  SELECT COUNT(*) INTO v_perdedores FROM tmp_me_cliente_dedup_map;

  -- REAPONTAMENTO DAS FKs para o vencedor (todas as tabelas filhas conhecidas).
  UPDATE public.atd_conversas c
  SET id_cliente = m.vencedor_id
  FROM tmp_me_cliente_dedup_map m
  WHERE c.id_cliente = m.perdedor_id;
  GET DIAGNOSTICS v_reapontados = ROW_COUNT;

  UPDATE public.agd_agendamentos c
  SET cliente_id = m.vencedor_id
  FROM tmp_me_cliente_dedup_map m
  WHERE c.cliente_id = m.perdedor_id;
  GET DIAGNOSTICS v_r = ROW_COUNT;
  v_reapontados := v_reapontados + v_r;

  UPDATE public.crm_atendimentos c
  SET cliente_id = m.vencedor_id
  FROM tmp_me_cliente_dedup_map m
  WHERE c.cliente_id = m.perdedor_id;
  GET DIAGNOSTICS v_r = ROW_COUNT;
  v_reapontados := v_reapontados + v_r;

  UPDATE public.crm_chat_conversas c
  SET cliente_id = m.vencedor_id
  FROM tmp_me_cliente_dedup_map m
  WHERE c.cliente_id = m.perdedor_id;
  GET DIAGNOSTICS v_r = ROW_COUNT;
  v_reapontados := v_reapontados + v_r;

  UPDATE public.crm_oportunidades c
  SET cliente_id = m.vencedor_id
  FROM tmp_me_cliente_dedup_map m
  WHERE c.cliente_id = m.perdedor_id;
  GET DIAGNOSTICS v_r = ROW_COUNT;
  v_reapontados := v_reapontados + v_r;

  UPDATE public.fn_movimento c
  SET cliente_id = m.vencedor_id
  FROM tmp_me_cliente_dedup_map m
  WHERE c.cliente_id = m.perdedor_id;
  GET DIAGNOSTICS v_r = ROW_COUNT;
  v_reapontados := v_reapontados + v_r;

  UPDATE public.me_contas_receber c
  SET cliente_id = m.vencedor_id
  FROM tmp_me_cliente_dedup_map m
  WHERE c.cliente_id = m.perdedor_id;
  GET DIAGNOSTICS v_r = ROW_COUNT;
  v_reapontados := v_reapontados + v_r;

  UPDATE public.me_venda_servicos c
  SET cliente_id = m.vencedor_id
  FROM tmp_me_cliente_dedup_map m
  WHERE c.cliente_id = m.perdedor_id;
  GET DIAGNOSTICS v_r = ROW_COUNT;
  v_reapontados := v_reapontados + v_r;

  -- me_venda.cliente_id é uuid SEM constraint de FK — mesmo assim precisa ser
  -- reapontado para não deixar órfãos do lado de lá.
  UPDATE public.me_venda c
  SET cliente_id = m.vencedor_id
  FROM tmp_me_cliente_dedup_map m
  WHERE c.cliente_id = m.perdedor_id;
  GET DIAGNOSTICS v_r = ROW_COUNT;
  v_reapontados := v_reapontados + v_r;

  -- DELETE dos perdedores agora que as filhas apontam para o vencedor.
  DELETE FROM public.me_cliente mc
  USING tmp_me_cliente_dedup_map m
  WHERE mc.id = m.perdedor_id;
  GET DIAGNOSTICS v_apagados = ROW_COUNT;

  RAISE NOTICE 'Dedup me_cliente: % linha(s) perdedora(s), % referência(s) '
               'reapontada(s) em tabelas filhas, % registro(s) apagado(s).',
               v_perdedores, v_reapontados, v_apagados;
END;
$dedup$;

-- ----------------------------------------------------------------------------
-- ETAPA 5 — Índice único parcial (bloqueia novas duplicações)
-- ----------------------------------------------------------------------------
-- telefone é nullable -> índice parcial com WHERE telefone IS NOT NULL.
-- empresa_id NULL é tratado como distinto pelo Postgres em índices únicos
-- (comportamento aceitável aqui).
CREATE UNIQUE INDEX IF NOT EXISTS ux_me_cliente_empresa_telefone
  ON public.me_cliente (empresa_id, telefone)
  WHERE telefone IS NOT NULL;