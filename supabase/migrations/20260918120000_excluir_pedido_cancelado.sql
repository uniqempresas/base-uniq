-- ============================================================================
-- Item 4 do lote de 17/09/2026 — excluir pedido cancelado (soft delete via RPC)
-- Aplicada em produção em 18/09/2026.
--
-- Decisões do fundador: soft delete · bloqueia se a conta a receber estiver paga ·
-- devolve estoque · botão em detalhe+lista · qualquer usuário da empresa ·
-- implementado como PROCEDURE/RPC (chamável pela Base UNIQ e por consumidores externos).
--
-- Documentos: tracking/plans/PRD-DeletarPedidoCancelado.md
--             tracking/specs/SPEC-DeletarPedidoCancelado.md
--             tracking/wireframe/WIRE-DeletarPedidoCancelado.md
-- ============================================================================

-- 1. Colunas de exclusão lógica
ALTER TABLE public.me_venda
  ADD COLUMN IF NOT EXISTS deletado_em     timestamptz,
  ADD COLUMN IF NOT EXISTS deletado_por    uuid,
  ADD COLUMN IF NOT EXISTS motivo_exclusao text;

-- 2. Índice parcial para as leituras (que filtram deletado_em IS NULL)
CREATE INDEX IF NOT EXISTS ix_me_venda_ativos
  ON public.me_venda (empresa_id, criado_em DESC)
  WHERE deletado_em IS NULL;

-- 3. RPC com todas as regras dentro do banco
CREATE OR REPLACE FUNCTION public.fn_excluir_pedido_cancelado(
  p_empresa_id uuid,
  p_venda_id   uuid,
  p_usuario_id uuid DEFAULT NULL,
  p_motivo     text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_venda        record;
  v_conta_status text;
  v_tem_conta    boolean := false;
  v_itens        integer := 0;
BEGIN
  -- 1) Busca escopada por empresa, com lock (evita duas exclusões simultâneas)
  SELECT * INTO v_venda
  FROM public.me_venda
  WHERE id = p_venda_id
    AND empresa_id = p_empresa_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'NAO_ENCONTRADO',
      'error', 'Pedido não encontrado.');
  END IF;

  -- 2) Idempotência
  IF v_venda.deletado_em IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'JA_EXCLUIDO',
      'error', 'Este pedido já foi excluído.');
  END IF;

  -- 3) Só pedido cancelado
  IF v_venda.status_venda IS DISTINCT FROM 'cancelado' THEN
    RETURN jsonb_build_object('success', false, 'code', 'STATUS_INVALIDO',
      'error', 'Só é possível excluir pedido com status Cancelado.');
  END IF;

  -- 4) Guarda financeira: conta a receber paga bloqueia a exclusão
  SELECT c.status INTO v_conta_status
  FROM public.me_contas_receber c
  WHERE c.venda_id = p_venda_id
  LIMIT 1;

  v_tem_conta := FOUND;

  IF v_conta_status = 'pago' THEN
    RETURN jsonb_build_object('success', false, 'code', 'PAGAMENTO_REGISTRADO',
      'error', 'Este pedido tem pagamento registrado. Excluir apagaria dinheiro que entrou de verdade.');
  END IF;

  -- 5) Devolve estoque APENAS se houver conta vinculada.
  --    A conta só é criada pela RPC registrar_venda, que é quem debita o estoque.
  --    Pedido criado manualmente pela tela NÃO debita — devolver sempre inflaria
  --    o estoque de um produto que nunca foi debitado.
  IF v_tem_conta THEN
    UPDATE public.me_produto p
       SET estoque_atual = p.estoque_atual + iv.quantidade
      FROM public.me_itens_venda iv
     WHERE iv.venda_id = p_venda_id
       AND iv.empresa_id = p_empresa_id
       AND p.id = iv.produto_id
       AND p.empresa_id = p_empresa_id;

    GET DIAGNOSTICS v_itens = ROW_COUNT;
  END IF;

  -- 6) Soft delete (nada é apagado de verdade — as filhas continuam existindo)
  UPDATE public.me_venda
     SET deletado_em     = now(),
         deletado_por    = p_usuario_id,
         motivo_exclusao = p_motivo
   WHERE id = p_venda_id;

  -- 7) Auditoria no histórico
  INSERT INTO public.me_venda_historico (
    venda_id, empresa_id, status, observacao, responsavel_usuario_id
  ) VALUES (
    p_venda_id,
    p_empresa_id,
    'excluido',
    COALESCE(NULLIF(TRIM(p_motivo), ''), 'Pedido cancelado excluído'),
    p_usuario_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'id_venda', p_venda_id,
    'estoque_devolvido', v_tem_conta,
    'itens_restaurados', v_itens
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'code', 'ERRO_INTERNO', 'error', SQLERRM);
END;
$function$;
