-- =============================================================================
-- Doceê — categorias reais da vitrine (V1 do PRD-LojaVirtual-VitrineModerna)
-- =============================================================================
-- Contexto: os 16 produtos da Doceê estão com `categoria_id = null` e
-- `tipo = 'Outros'`. A categoria global "Pães e Doces" (id 4) já existe, mas o
-- fundador optou por criar famílias próprias da loja (decisão V1, 17/09/2026).
--
-- Esta migration é IDEMPOTENTE e ADITIVA:
--   * cria as 5 categorias da Doceê em `me_categoria` (se não existirem)
--   * atribui `me_produto.categoria_id` aos 16 produtos por correspondência de nome
--   * NÃO altera `me_produto.tipo` — atenção: `tipo` guarda tipo de produto
--     ('simples', 'variavel', 'Outros'), não categoria. Não sobrescrever.
--
-- Rollback (se necessário):
--   UPDATE me_produto SET categoria_id = NULL
--    WHERE empresa_id = '52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f';
--   DELETE FROM me_categoria
--    WHERE empresa_id = '52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f'
--      AND nome_categoria IN ('Cone Trufado','Trufa','Tortinha','Surpresa','Especial');
-- =============================================================================

DO $$
DECLARE
  v_empresa uuid := '52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f'; -- Doceê
BEGIN

  -- 1) Categorias da loja (cria somente as que faltam)
  INSERT INTO me_categoria (empresa_id, nome_categoria)
  SELECT v_empresa, nome
  FROM (VALUES
    ('Cone Trufado'),
    ('Trufa'),
    ('Tortinha'),
    ('Surpresa'),
    ('Especial')
  ) AS novas(nome)
  WHERE NOT EXISTS (
    SELECT 1 FROM me_categoria c
    WHERE c.empresa_id = v_empresa
      AND c.nome_categoria = novas.nome
  );

  -- 2) Atribuição por família de produto
  --    Padrões sem sobreposição: 'Trufa%' não captura 'Cone Trufado%'.
  UPDATE me_produto p
     SET categoria_id = c.id_categoria
    FROM me_categoria c
   WHERE p.empresa_id = v_empresa
     AND c.empresa_id = v_empresa
     AND (
          (c.nome_categoria = 'Cone Trufado' AND p.nome_produto ILIKE 'Cone Trufado%')
       OR (c.nome_categoria = 'Trufa'        AND p.nome_produto ILIKE 'Trufa%')
       OR (c.nome_categoria = 'Tortinha'     AND p.nome_produto ILIKE 'Tortinha%')
       OR (c.nome_categoria = 'Surpresa'     AND p.nome_produto ILIKE 'Surpresa%')
       OR (c.nome_categoria = 'Especial'     AND p.nome_produto ILIKE 'Morango Cravejado%')
     );

END $$;

-- =============================================================================
-- Verificação (esperado: 16 produtos, 0 sem categoria, 5 categorias)
-- =============================================================================
-- SELECT c.nome_categoria, count(p.id) AS produtos
--   FROM me_categoria c
--   LEFT JOIN me_produto p ON p.categoria_id = c.id_categoria
--  WHERE c.empresa_id = '52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f'
--  GROUP BY c.nome_categoria ORDER BY c.nome_categoria;
--
-- SELECT count(*) AS sem_categoria FROM me_produto
--  WHERE empresa_id = '52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f'
--    AND categoria_id IS NULL;
