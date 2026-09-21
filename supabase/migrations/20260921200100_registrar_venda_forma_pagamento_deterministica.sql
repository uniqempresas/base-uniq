-- ============================================================================
-- Correção curta (Opção A) — 21/09/2026
-- F5: a forma de pagamento era resolvida de forma NÃO-determinística.
--
-- ANTES:
--   SELECT id INTO v_forma_pagamento_id FROM me_forma_pagamento
--   WHERE nome ILIKE v_forma_pagamento LIMIT 1;      -- sem empresa, sem ORDER BY
--   IF ... IS NULL THEN v_forma_pagamento_id := 1; END IF;   -- 1 = Dinheiro
--
-- Dois defeitos reais:
--   1) "Pix" existe como id 3 (global) E id 22 (tenant 6257ebef) → o id
--      retornado era arbitrário. Uma venda Pix podia virar Dinheiro/Crédito.
--   2) O fallback numérico (1 = Dinheiro) contradizia o fallback textual
--      ('PIX'), então me_venda.forma_pagamento e me_contas_receber.forma_pagamento
--      podiam discordar sobre a mesma venda.
--
-- DEPOIS: resolve DENTRO da empresa, determinístico, e NÃO inventa id
--         (me_venda.forma_pagamento aceita NULL; o texto continua indo para
--         me_contas_receber.forma_pagamento, então a informação não se perde).
--
-- ⚠️ `DESC NULLS LAST` é obrigatório: no Postgres, `ORDER BY x DESC` põe NULLs
--    PRIMEIRO, e `(NULL = uuid)` resulta NULL. Sem o NULLS LAST, a linha GLOBAL
--    vencia a do TENANT — o inverso do objetivo. (Esse bug foi introduzido e
--    pego pela verificação; ver SPEC-Seguranca-EscritaVendas.md §4.2.)
--
-- A substituição é feita DENTRO do banco, lendo a definição real e trocando
-- apenas o bloco — sem transcrever o corpo da função. Se a âncora não casar,
-- a migração ABORTA sem alterar nada.
--
-- Origem: PRD-Seguranca-EscritaVendas.md (F5) · BACKLOG_SEGURANCA.md
-- ============================================================================

DO $fix$
DECLARE
  v_oid          oid;
  v_def          text;
  v_novo         text;
  v_velho_trecho text := $anc$  -- Mapear forma de pagamento para ID
  SELECT id INTO v_forma_pagamento_id
  FROM me_forma_pagamento
  WHERE nome ILIKE v_forma_pagamento
  LIMIT 1;

  IF v_forma_pagamento_id IS NULL THEN
    v_forma_pagamento_id := 1;
  END IF;$anc$;
  v_novo_trecho  text := $nov$  -- Forma de pagamento: resolve DENTRO da empresa, de forma determinística.
  -- Prefere a linha do tenant; cai para a global; NÃO inventa id.
  -- (me_venda.forma_pagamento aceita NULL; o texto vai para me_contas_receber.)
  SELECT id INTO v_forma_pagamento_id
  FROM me_forma_pagamento
  WHERE lower(nome) = lower(v_forma_pagamento)
    AND (empresa_id = p_empresa_id OR empresa_id IS NULL)
  ORDER BY (empresa_id = p_empresa_id) DESC NULLS LAST, id ASC
  LIMIT 1;$nov$;
BEGIN
  SELECT p.oid, pg_get_functiondef(p.oid)
    INTO v_oid, v_def
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'registrar_venda';

  IF v_oid IS NULL THEN
    RAISE EXCEPTION 'registrar_venda nao encontrada — nada foi alterado';
  END IF;

  v_novo := replace(v_def, v_velho_trecho, v_novo_trecho);

  IF v_novo = v_def THEN
    RAISE EXCEPTION 'ANCORA NAO ENCONTRADA no corpo de registrar_venda — nada foi alterado';
  END IF;

  EXECUTE v_novo;

  -- Hardening de search_path.
  -- ⚠️ NÃO usar '' aqui: o corpo usa nomes NÃO qualificados (INSERT INTO me_venda,
  -- FROM me_forma_pagamento). `public` PRECISA estar no path. Colocar `pg_temp`
  -- por ÚLTIMO fecha o vetor de sequestro (o risco é pg_temp vir primeiro).
  -- Confirmado no banco: anon/authenticated NÃO têm CREATE no schema public,
  -- então não conseguem plantar objeto sombreando.
  EXECUTE 'ALTER FUNCTION public.registrar_venda(uuid, numeric, varchar, uuid, date, varchar, jsonb, text, varchar) SET search_path = public, pg_temp';
END
$fix$;
