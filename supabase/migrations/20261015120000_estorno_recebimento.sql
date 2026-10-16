-- ============================================================
-- ESTORNO DE RECEBIMENTO DE COMPRA
-- PRD/SPEC/WIRE: tracking/…-Producao-EstornoRecebimento.md
-- Contrato: receber_compra INTOCADA (trigger aditivo no UPDATE
-- final de status) + RPC transacional estornar_recebimento.
--
-- Requisito exato (introspecção 15/10/2026):
--   v_qtd = qtd * COALESCE(fator,1) ; v_custo_item = valor_unit/fator
--   UPDATE me_produto: estoque +/- ROUND(v_qtd)::int ; preco_custo
--     = (E*c0 + Qmov*cu) / (E + Qmov)  -> invertível:
--     c0 = (custo_novo*(E+Qmov) - Σ(qtd*valor_unit)) / E   [fator some no numerador]
--   INSERT est_movimentacao('entrada', v_qtd SEM ROUND, 'Compra')
-- ============================================================

-- ------------------------------------------------------------
-- 1. Snapshot do recebimento
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.est_recebimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id uuid NOT NULL REFERENCES public.est_compra(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.me_empresa(id) ON DELETE CASCADE,
  produto_id integer NOT NULL REFERENCES public.me_produto(id),
  qtd_estoque integer NOT NULL,      -- Σ por linha de ROUND(qtd × fator): o que entrou em estoque
  qtd_movimento numeric NOT NULL,    -- Σ qtd × fator (SEM arredondar): espelha o movimento 'Compra'
  custo_unitario numeric NOT NULL,   -- Σ(qtd × valor_unitario) ÷ qtd_movimento (por unidade de estoque)
  estoque_antes integer NOT NULL,
  custo_antes   numeric,             -- me_produto.preco_custo antes (NULL quando estoque_antes = 0)
  recebido_em   timestamptz NOT NULL DEFAULT now(),
  estornado_em  timestamptz,
  UNIQUE (compra_id, produto_id)
);

CREATE INDEX IF NOT EXISTS idx_est_recebimento_empresa ON public.est_recebimento (empresa_id);
CREATE INDEX IF NOT EXISTS idx_est_recebimento_produto ON public.est_recebimento (produto_id);
CREATE INDEX IF NOT EXISTS idx_est_recebimento_compra  ON public.est_recebimento (compra_id);

-- RLS: padrão do projeto (idem est_movimentacao — registrado no P5).
-- Leitura apenas authenticated; escrita exclusiva da RPC/trigger (SECURITY DEFINER).
ALTER TABLE public.est_recebimento ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.est_recebimento FROM anon, authenticated;
GRANT SELECT ON public.est_recebimento TO authenticated;
DROP POLICY IF EXISTS est_recebimento_select_authenticated ON public.est_recebimento;
CREATE POLICY est_recebimento_select_authenticated
  ON public.est_recebimento FOR SELECT TO authenticated USING (true);
-- ------------------------------------------------------------
-- 2. Trigger: snapshot no transitar -> RECEBIDO
--    Executa ANTES do UPDATE do est_compra, porém DEPOIS dos
--    UPDATEs de me_produto e dos movimentos 'entrada' (mesma
--    transação) — o estado "antes" sai por inversão exata.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trg_est_recebimento_snapshot()
RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  agg             record;
  v_qtd_estoque   integer;
  v_qtd_movimento numeric;
  v_custo_unit    numeric;
  v_est_antes     integer;
  v_custo_antes   numeric;
  v_valor_soma    numeric;
BEGIN
  -- re-recebimento (pós-estorno) reescreve o snapshot do zero
  DELETE FROM public.est_recebimento WHERE compra_id = NEW.id;

  FOR agg IN
    SELECT ci.produto_id,
           COALESCE(p.fator_conversao, 1) AS fator,
           SUM(ci.quantidade)                                        AS qtd_soma,
           SUM(COALESCE(ci.valor_unitario, 0) * ci.quantidade)       AS valor_soma,
           SUM(ROUND(COALESCE(ci.quantidade, 0) * COALESCE(p.fator_conversao, 1)))::int AS qtd_estoque_soma,
           p.estoque_atual   AS estoque_agora,
           p.preco_custo     AS custo_agora
    FROM public.est_compra_item ci
    JOIN public.me_produto p ON p.id = ci.produto_id
    WHERE ci.compra_id = NEW.id
    GROUP BY ci.produto_id, COALESCE(p.fator_conversao, 1), p.estoque_atual, p.preco_custo
  LOOP
    v_qtd_movimento := agg.qtd_soma * agg.fator;
    IF NOT (v_qtd_movimento > 0) THEN
      RAISE EXCEPTION 'Recebimento sem volume (fator invalido) para o produto %', agg.produto_id;
    END IF;
    v_qtd_estoque := agg.qtd_estoque_soma;
    v_valor_soma  := agg.valor_soma;
    v_custo_unit  := v_valor_soma / v_qtd_movimento;   -- custo médio ponderado da entrada (unidade de estoque)
    v_est_antes   := agg.estoque_agora - v_qtd_estoque;

    IF v_est_antes < 0 THEN
      RAISE EXCEPTION 'Snapshot incoerente: estoque ficaria negativo (produto %)', agg.produto_id;
    END IF;

    v_custo_antes := CASE
      WHEN v_est_antes > 0 THEN
        ( (COALESCE(agg.custo_agora, 0) * (v_est_antes + v_qtd_movimento)) - v_valor_soma ) / v_est_antes
      ELSE NULL END;

    INSERT INTO public.est_recebimento
      (compra_id, empresa_id, produto_id, qtd_estoque, qtd_movimento,
       custo_unitario, estoque_antes, custo_antes)
    VALUES
      (NEW.id, NEW.empresa_id, agg.produto_id, v_qtd_estoque, v_qtd_movimento,
       v_custo_unit, v_est_antes, v_custo_antes);
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_est_recebimento ON public.est_compra;
CREATE TRIGGER trg_est_recebimento
  BEFORE UPDATE OF status ON public.est_compra
  FOR EACH ROW
  WHEN (NEW.status = 'RECEBIDO' AND OLD.status IS DISTINCT FROM 'RECEBIDO')
  EXECUTE FUNCTION public.trg_est_recebimento_snapshot();

-- ------------------------------------------------------------
-- 3. RPC transacional: estornar_recebimento
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.estornar_recebimento(p_empresa_id uuid, p_compra_id uuid, p_usuario_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public' AS $$
DECLARE
  v_compra  record;
  v_bloque  record;
  v_item    record;
  v_conta   uuid;
  v_itens   jsonb := '[]'::jsonb;
BEGIN
  IF p_empresa_id IS NULL OR p_compra_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Parâmetros incompletos para estornar o recebimento.', 'detail', 'INVALID_INPUT');
  END IF;

  SELECT * INTO v_compra FROM est_compra WHERE id = p_compra_id AND empresa_id = p_empresa_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Compra não encontrada nesta empresa.', 'detail', 'NOT_FOUND');
  END IF;

  IF v_compra.status <> 'RECEBIDO' THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Esta compra está ' || lower(v_compra.status) || ' — só compra RECEBIDO pode ser estornada.',
      'detail', 'INVALID_STATUS');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM est_recebimento sr WHERE sr.compra_id = p_compra_id) THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Esta compra foi recebida antes do estorno existir — não há registro do estado anterior. Corrija o estoque e a conta à mão.',
      'detail', 'NO_SNAPSHOT');
  END IF;

  IF EXISTS (
    SELECT 1 FROM me_contas_pagar cp
    WHERE cp.compra_id = p_compra_id AND cp.status = 'pago'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error',
      'A conta desta compra já foi paga — resolva no Financeiro antes de estornar.',
      'detail', 'CONTA_PAGA');
  END IF;

  -- restauração exata exige que o recebimento seja a última ação do insumo
  FOR v_bloque IN
    SELECT sr.produto_id, p.nome_produto
    FROM est_recebimento sr
    JOIN me_produto p ON p.id = sr.produto_id
    WHERE sr.compra_id = p_compra_id
      AND EXISTS (
        SELECT 1 FROM est_movimentacao m
        WHERE m.produto_id = sr.produto_id AND m.created_at > sr.recebido_em
      )
  LOOP
    RETURN jsonb_build_object('success', false, 'error',
      'O insumo "' || v_bloque.nome_produto || '" tem movimentação depois do recebimento (produção, venda, ajuste ou outra compra) — estorne em ordem, do recebimento mais recente para o mais antigo.',
      'detail', 'MOVIMENTACAO_POSTERIOR', 'produto_id', v_bloque.produto_id);
  END LOOP;

  FOR v_item IN
    SELECT sr.*
    FROM est_recebimento sr
    WHERE sr.compra_id = p_compra_id
    ORDER BY sr.produto_id
  LOOP
    UPDATE me_produto
      SET estoque_atual = v_item.estoque_antes,
          preco_custo   = COALESCE(v_item.custo_antes, preco_custo)
    WHERE id = v_item.produto_id;

    INSERT INTO est_movimentacao
      (empresa_id, produto_id, tipo, quantidade, motivo, observacao, usuario_id, data_movimentacao)
    VALUES
      (p_empresa_id, v_item.produto_id, 'saida', v_item.qtd_movimento, 'Estorno',
       'Estorno: compra recebida em ' || to_char(v_compra.data_recebimento, 'DD/MM/YYYY'),
       COALESCE(p_usuario_id, auth.uid()), v_compra.data_recebimento::timestamptz);

    v_itens := v_itens || jsonb_build_array(jsonb_build_object(
      'produto_id', v_item.produto_id,
      'qtd_estoque', v_item.qtd_estoque,
      'custo_medio_restaurado', COALESCE(v_item.custo_antes, v_item.custo_unitario)));
  END LOOP;

  UPDATE me_contas_pagar
    SET status = 'cancelado',
        observacoes = COALESCE(observacoes, '') || ' · Estornada junto com o recebimento em ' || to_char(now(), 'DD/MM/YYYY')
    WHERE compra_id = p_compra_id AND status IN ('pendente', 'atrasado')
    RETURNING id INTO v_conta;
  IF v_conta IS NULL THEN
    SELECT cp.id INTO v_conta FROM me_contas_pagar cp WHERE cp.compra_id = p_compra_id LIMIT 1;
  END IF;

  UPDATE est_compra
    SET status = 'PENDENTE', data_recebimento = NULL
  WHERE id = p_compra_id AND empresa_id = p_empresa_id;

  UPDATE est_recebimento
    SET estornado_em = now()
  WHERE compra_id = p_compra_id;

  RETURN jsonb_build_object('success', true, 'compra_id', p_compra_id,
    'conta_pagar_id', v_conta, 'itens', v_itens);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- A função não vira endpoint público (default PUBLIC vaza SECURITY DEFINER)
REVOKE ALL ON FUNCTION public.estornar_recebimento(uuid, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.estornar_recebimento(uuid, uuid, uuid) TO authenticated;
