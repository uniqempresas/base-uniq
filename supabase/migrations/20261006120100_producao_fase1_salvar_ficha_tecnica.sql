-- ============================================================================
-- 20261006120100_producao_fase1_salvar_ficha_tecnica.sql
-- Produção Fase 1: RPC transacional para salvar a ficha técnica (BOM)
--
-- Padrão registrar_venda: SECURITY DEFINER + search_path fixo + retorno jsonb
-- com success/error. Gravação de snapshot: apaga a ficha atual e insere a nova
-- em transação única (fallback de lista vazia = apaga — comportamento explicito
-- no WIRE §2). Consolidado do precedente 20260921213624: EXECUTE revogado do
-- `anon` (a função só é chamada pelo app autenticado).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.salvar_ficha_tecnica(
  p_empresa_id      uuid,
  p_produto_pai_id  integer,
  p_itens           jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $fn$
DECLARE
  v_item  jsonb;
  v_comp  integer;
  v_count integer := 0;
BEGIN
  -- Guarda anti-tenant: o pai precisa pertencer à empresa informada
  IF NOT EXISTS (
    SELECT 1 FROM me_produto p
    WHERE p.id = p_produto_pai_id AND p.empresa_id = p_empresa_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Produto pai não encontrado nesta empresa.',
      'detail', 'tenant'
    );
  END IF;

  -- Snapshot: substitui a ficha inteira (transação envolvente do Postgres)
  DELETE FROM est_ficha_tecnica
  WHERE produto_pai_id = p_produto_pai_id AND empresa_id = p_empresa_id;

  IF jsonb_typeof(p_itens) = 'array' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens) LOOP
      v_comp := (v_item->>'componente_id')::integer;

      -- Auto-referência: pula item inválido (CHECK estrutural faria rollback total)
      IF v_comp IS NULL OR v_comp = p_produto_pai_id THEN
        CONTINUE;
      END IF;

      -- Componente precisa existir NA MESMA empresa (insumo, simples e
      -- composto aninhado são todos permitidos como componente)
      IF NOT EXISTS (
        SELECT 1 FROM me_produto c
        WHERE c.id = v_comp AND c.empresa_id = p_empresa_id
      ) THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Componente ' || v_comp || ' não pertence a esta empresa.',
          'detail', 'tenant'
        );
      END IF;

      INSERT INTO est_ficha_tecnica
        (empresa_id, produto_pai_id, componente_id, quantidade_por_unidade, perda_pct)
      VALUES
        (p_empresa_id,
         p_produto_pai_id,
         v_comp,
         (v_item->>'quantidade_por_unidade')::numeric,
         COALESCE(NULLIF(v_item->>'perda_pct', '')::numeric, 0));

      v_count := v_count + 1;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('success', true, 'total_itens', v_count);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$fn$;

-- Precedente 21/09: função de escrita não é exposta ao anon
REVOKE EXECUTE ON FUNCTION public.salvar_ficha_tecnica(uuid, integer, jsonb) FROM anon;
