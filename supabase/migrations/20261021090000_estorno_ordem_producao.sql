-- Fase 4a — Estorno de Ordem de Produção (SPEC-Producao-EstornoOP §2/§3)
--
-- 1) est_ordem_producao ganha ciclo de vida: status ATIVA|ESTORNADA + estornado_em.
--    Linhas existentes herdam 'ATIVA' (default) — sem backfill.
-- 2) RPC estornar_producao (SECURITY DEFINER, transacional): devolve a quantidade
--    REAL consumida de cada insumo (est_ordem_producao_item — auditoria da Fase 3),
--    dá saída no acabado, grava movimentações de compensação motivo 'Estorno'
--    (extrato nunca perde linhas) e marca a OP ESTORNADA.
--    Modelo compensatório (D1): não toca preco_custo — no custo médio móvel,
--    saída e entrada-a-custo-vigente não alteram a média; ela converge.

ALTER TABLE public.est_ordem_producao
  ADD COLUMN status text NOT NULL DEFAULT 'ATIVA',
  ADD COLUMN estornado_em timestamptz;

ALTER TABLE public.est_ordem_producao
  ADD CONSTRAINT est_ordem_producao_status_check
  CHECK (status IN ('ATIVA','ESTORNADA'));

CREATE OR REPLACE FUNCTION public.estornar_producao(
  p_empresa_id uuid,
  p_ordem_id uuid,
  p_usuario_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_op          record;
  v_item        record;
  v_pai         record;
  v_est_acabado integer;
  v_itens       int := 0;
  v_data_txt    text;
BEGIN
  IF p_empresa_id IS NULL OR p_ordem_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Parâmetros incompletos — informe a produção a estornar.', 'detail', 'INVALID_INPUT');
  END IF;

  SELECT * INTO v_op FROM est_ordem_producao
  WHERE id = p_ordem_id AND empresa_id = p_empresa_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Produção não encontrada nesta empresa.', 'detail', 'NOT_FOUND');
  END IF;

  IF v_op.status <> 'ATIVA' THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Esta produção já foi estornada.', 'detail', 'INVALID_STATUS');
  END IF;

  SELECT * INTO v_pai FROM me_produto WHERE id = v_op.produto_pai_id;
  v_est_acabado := COALESCE(v_pai.estoque_atual, 0);

  IF v_est_acabado < ROUND(v_op.quantidade)::int THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Restam ' || v_est_acabado::text || ' un de ' || COALESCE(v_pai.nome_produto, 'o produto') ||
      ' — o lote produzia ' || ROUND(v_op.quantidade)::text ||
      '. Parte já foi vendida ou consumida: estorne a venda antes, ou ajuste o estoque manualmente.',
      'detail', 'ACABADO_INSUFICIENTE');
  END IF;

  v_data_txt := to_char(v_op.data_producao AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY');

  -- Devolve cada insumo na quantidade REAL consumida (auditoria est_ordem_producao_item —
  -- a ficha pode ter mudado depois da OP; o que volta é o que foi consumido de fato)
  FOR v_item IN
    SELECT i.produto_id, i.quantidade_consumida
    FROM est_ordem_producao_item i
    JOIN me_produto p ON p.id = i.produto_id
    WHERE i.ordem_id = v_op.id AND p.empresa_id = p_empresa_id
  LOOP
    UPDATE me_produto
      SET estoque_atual = estoque_atual + ROUND(v_item.quantidade_consumida)::int
    WHERE id = v_item.produto_id;

    INSERT INTO est_movimentacao
      (empresa_id, produto_id, tipo, quantidade, motivo, observacao, usuario_id, data_movimentacao)
    VALUES
      (p_empresa_id, v_item.produto_id, 'entrada', v_item.quantidade_consumida, 'Estorno',
       'Estorno: produção de ' || v_data_txt || ' — ' || COALESCE(v_pai.nome_produto, ''),
       COALESCE(p_usuario_id, auth.uid()), now());
    v_itens := v_itens + 1;
  END LOOP;

  -- Saída do acabado (espelha o ROUND da entrada em registrar_producao)
  UPDATE me_produto
    SET estoque_atual = estoque_atual - ROUND(v_op.quantidade)::int
  WHERE id = v_op.produto_pai_id;

  -- Custo do acabado (D1b): restauração EXATA por telescopagem da média quando a OP
  -- é a última movimentação do acabado (caso comum: erro percebido na hora) —
  --   c0 = (c1·(E + Q) − Q·custo_unit) / E   (mesma álgebra da entrada em registrar_producao;
  --   Q no peso do custo é op.quantidade SEM round, espelhando a fórmula original)
  -- Fora desse caso (venda/ajuste/produção posterior): modelo compensatório puro —
  -- não toca o preco_custo e a média converge (D1). E = 0 → custo irrelevante (peso zero).
  IF v_est_acabado - ROUND(v_op.quantidade)::int > 0
     AND NOT EXISTS (
       SELECT 1 FROM est_movimentacao m
       WHERE m.empresa_id = p_empresa_id
         AND m.produto_id = v_op.produto_pai_id
         AND m.created_at > v_op.created_at
     ) THEN
    UPDATE me_produto
      SET preco_custo =
        (COALESCE(preco_custo, 0) * ((v_est_acabado - ROUND(v_op.quantidade)::int) + v_op.quantidade)
         - v_op.quantidade * v_op.custo_unit)
        / (v_est_acabado - ROUND(v_op.quantidade)::int)
    WHERE id = v_op.produto_pai_id;
  END IF;

  INSERT INTO est_movimentacao
    (empresa_id, produto_id, tipo, quantidade, motivo, observacao, usuario_id, data_movimentacao)
  VALUES
    (p_empresa_id, v_op.produto_pai_id, 'saida', v_op.quantidade, 'Estorno',
     'Estorno: produção de ' || v_data_txt || ' — ' || COALESCE(v_pai.nome_produto, ''),
     COALESCE(p_usuario_id, auth.uid()), now());

  UPDATE est_ordem_producao
    SET status = 'ESTORNADA', estornado_em = now()
  WHERE id = v_op.id;

  RETURN jsonb_build_object('success', true, 'ordem_id', v_op.id, 'itens_devolvidos', v_itens);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END
$function$;

-- Segurança: SECURITY DEFINER em public é endpoint público por default —
-- fecha PUBLIC/anon, abre só para authenticated (padrão estornar_recebimento).
REVOKE ALL ON FUNCTION public.estornar_producao(uuid, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.estornar_producao(uuid, uuid, uuid) TO authenticated;
