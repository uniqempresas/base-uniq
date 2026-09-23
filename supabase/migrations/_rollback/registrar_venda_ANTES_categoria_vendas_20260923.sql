-- ROLLBACK — registrar_venda ANTES da mudança de categoria (23/09/2026)
--
-- Motivo da mudança: a venda criava a conta a receber SEM `categoria_id`
-- (a RPC é anterior ao B9). Agora ela usa a categoria "Vendas" (tipo `receita`)
-- via `fn_categoria_vendas(p_empresa_id)`, em modo best-effort.
--
-- Para reverter: rodar este arquivo inteiro. Ele é o `pg_get_functiondef`
-- capturado ANTES da alteração — a função original, sem categoria.
--
-- Contexto: tracking/plans/PRD-CategoriasFinanceiras.md

CREATE OR REPLACE FUNCTION public.registrar_venda(p_empresa_id uuid, p_valor_total numeric, p_forma_pagamento character varying, p_cliente_id uuid DEFAULT NULL::uuid, p_data_vencimento date DEFAULT NULL::date, p_status character varying DEFAULT 'pendente'::character varying, p_itens jsonb DEFAULT '[]'::jsonb, p_observacoes text DEFAULT NULL::text, p_origem character varying DEFAULT 'interna'::character varying)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id_venda uuid;
  v_id_venda_servico uuid;
  v_id_conta_receber uuid;
  v_item jsonb;
  v_descricao varchar;
  v_cliente_nome varchar;
  v_forma_pagamento varchar;
  v_forma_pagamento_id integer;
  v_valor_produtos numeric := 0;
  v_valor_servicos numeric := 0;
  v_tem_produtos boolean := false;
  v_tem_servicos boolean := false;
  v_quantidade integer;
  v_preco_unitario numeric;
  v_subtotal numeric;
  v_produto_id integer;
  v_servico_id integer;
  v_id_referencia text;
  v_produto_pai_id text;
BEGIN
  -- Forma de pagamento nunca vazia: fallback para PIX
  v_forma_pagamento := COALESCE(NULLIF(TRIM(p_forma_pagamento), ''), 'PIX');

  -- GUARDA ANTI-DUPLICIDADE (origem whatsapp): bloqueia regravação em até 30 min
  -- do mesmo pedido (mesmo cliente, mesmo valor e mesmos itens).
  IF p_origem = 'whatsapp' AND p_cliente_id IS NOT NULL
     AND jsonb_typeof(p_itens) = 'array' AND jsonb_array_length(p_itens) > 0 THEN
    IF EXISTS (
      SELECT 1
      FROM me_venda v
      WHERE v.empresa_id = p_empresa_id
        AND v.cliente_id = p_cliente_id
        AND v.canal_venda = 'whatsapp'
        AND v.valor_total = p_valor_total
        AND v.criado_em >= now() - interval '30 minutes'
        AND EXISTS (
          SELECT 1
          FROM (
            SELECT string_agg(lower(it->>'nome') || ':' || (it->>'quantidade')::text, ',' ORDER BY lower(it->>'nome')) AS sig
            FROM jsonb_array_elements(p_itens) it
            WHERE it->>'tipo' = 'produto'
          ) atual
          WHERE atual.sig IS NOT NULL
            AND atual.sig = (
              SELECT string_agg(lower(iv.nome_produto) || ':' || iv.quantidade::text, ',' ORDER BY lower(iv.nome_produto))
              FROM me_itens_venda iv
              WHERE iv.venda_id = v.id
            )
        )
    ) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Pedido já registrado anteriormente pelo WhatsApp.',
        'detail', 'duplicidade bloqueada em registrar_venda'
      );
    END IF;
  END IF;

  -- Obter nome do cliente se existir
  IF p_cliente_id IS NOT NULL THEN
    SELECT nome_cliente INTO v_cliente_nome
    FROM me_cliente
    WHERE id = p_cliente_id AND empresa_id = p_empresa_id;
  END IF;

  -- Forma de pagamento: resolve DENTRO da empresa, de forma determinística.
  -- Prefere a linha do tenant; cai para a global; NÃO inventa id.
  -- (me_venda.forma_pagamento aceita NULL; o texto vai para me_contas_receber.)
  SELECT id INTO v_forma_pagamento_id
  FROM me_forma_pagamento
  WHERE lower(nome) = lower(v_forma_pagamento)
    AND (empresa_id = p_empresa_id OR empresa_id IS NULL)
  ORDER BY (empresa_id = p_empresa_id) DESC NULLS LAST, id ASC
  LIMIT 1;

  -- Verificar se há produtos e/ou serviços e calcular valores
  IF jsonb_typeof(p_itens) = 'array' AND jsonb_array_length(p_itens) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
    LOOP
      IF v_item ? 'tipo' THEN
        IF (v_item->>'tipo') = 'produto' THEN
          v_tem_produtos := true;
          v_quantidade := COALESCE((v_item->>'quantidade')::integer, 1);
          v_preco_unitario := COALESCE((v_item->>'preco_unitario')::numeric, 0);
          v_subtotal := v_quantidade * v_preco_unitario;
          v_valor_produtos := v_valor_produtos + v_subtotal;
        ELSIF (v_item->>'tipo') = 'servico' THEN
          v_tem_servicos := true;
          v_quantidade := COALESCE((v_item->>'quantidade')::integer, 1);
          v_preco_unitario := COALESCE((v_item->>'preco_unitario')::numeric, 0);
          v_subtotal := v_quantidade * v_preco_unitario;
          v_valor_servicos := v_valor_servicos + v_subtotal;
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- 1. REGISTRAR PRODUTOS (se houver)
  IF v_tem_produtos THEN
    INSERT INTO me_venda (
      empresa_id,
      cliente_id,
      valor_total,
      observacoes,
      status_venda,
      forma_pagamento,
      canal_venda,
      tipo_venda
    ) VALUES (
      p_empresa_id,
      p_cliente_id,
      v_valor_produtos,
      p_observacoes,
      p_status,
      v_forma_pagamento_id,
      p_origem,
      'pdv'
    )
    RETURNING id INTO v_id_venda;

    -- Inserir itens de produtos
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
    LOOP
      IF v_item ? 'tipo' AND (v_item->>'tipo') = 'produto' THEN
        v_quantidade := COALESCE((v_item->>'quantidade')::integer, 1);
        v_preco_unitario := COALESCE((v_item->>'preco_unitario')::numeric, 0);

        -- Determinar o produto_id: usar produto_pai_id se disponível (variação), senão id_referencia
        v_produto_pai_id := v_item ->> 'produto_pai_id';
        v_id_referencia := v_item ->> 'id_referencia';

        IF v_produto_pai_id IS NOT NULL AND v_produto_pai_id != '' THEN
          -- É uma variação, usar o produto_pai_id
          v_produto_id := v_produto_pai_id::integer;
        ELSE
          -- Produto simples, tentar converter id_referencia
          BEGIN
            v_produto_id := v_id_referencia::integer;
          EXCEPTION WHEN invalid_text_representation THEN
            -- Se não conseguir converter (é UUID), buscar o produto_pai_id da variação
            SELECT produto_pai_id INTO v_produto_id
            FROM me_produto_variacao
            WHERE id = v_id_referencia::uuid;

            IF v_produto_id IS NULL THEN
              -- Se ainda não encontrou, pular este item
              CONTINUE;
            END IF;
          END;
        END IF;

        INSERT INTO me_itens_venda (
          venda_id,
          empresa_id,
          produto_id,
          quantidade,
          preco_unitario,
          nome_produto
        ) VALUES (
          v_id_venda,
          p_empresa_id,
          v_produto_id,
          v_quantidade,
          v_preco_unitario,
          COALESCE((v_item->>'nome')::text, 'Produto')
        );

        -- Atualizar estoque (apenas estoque_atual, sem updated_at)
        UPDATE me_produto
        SET estoque_atual = estoque_atual - v_quantidade
        WHERE id = v_produto_id
          AND empresa_id = p_empresa_id;
      END IF;
    END LOOP;
  END IF;

  -- 2. REGISTRAR SERVIÇOS (se houver)
  IF v_tem_servicos THEN
    INSERT INTO me_venda_servicos (
      empresa_id,
      cliente_id,
      valor_total,
      observacoes,
      status_venda,
      forma_pagamento,
      canal_venda
    ) VALUES (
      p_empresa_id,
      p_cliente_id,
      v_valor_servicos,
      p_observacoes,
      p_status,
      v_forma_pagamento_id,
      p_origem
    )
    RETURNING id INTO v_id_venda_servico;

    -- Inserir itens de serviços
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
    LOOP
      IF v_item ? 'tipo' AND (v_item->>'tipo') = 'servico' THEN
        v_quantidade := COALESCE((v_item->>'quantidade')::integer, 1);
        v_preco_unitario := COALESCE((v_item->>'preco_unitario')::numeric, 0);
        v_subtotal := v_quantidade * v_preco_unitario;

        -- Converter id_referencia para integer
        BEGIN
          v_servico_id := (v_item->>'id_referencia')::integer;
        EXCEPTION WHEN invalid_text_representation THEN
          -- Se for UUID, tentar buscar na tabela de serviços
          CONTINUE;
        END;

        INSERT INTO me_venda_servicos_itens (
          venda_id,
          empresa_id,
          servico_id,
          quantidade,
          preco_unitario,
          subtotal,
          nome_servico
        ) VALUES (
          v_id_venda_servico,
          p_empresa_id,
          v_servico_id,
          v_quantidade,
          v_preco_unitario,
          v_subtotal,
          COALESCE((v_item->>'nome')::text, 'Serviço')
        );
      END IF;
    END LOOP;
  END IF;

  -- 3. Criar conta a receber com a data de vencimento informada (forma de pagamento sempre preenchida)
  v_descricao := 'Venda' ||
                 CASE WHEN v_id_venda IS NOT NULL THEN ' #' || v_id_venda::text ELSE '' END ||
                 CASE WHEN v_id_venda_servico IS NOT NULL THEN ' (Serviços #' || v_id_venda_servico::text || ')' ELSE '' END ||
                 CASE WHEN v_cliente_nome IS NOT NULL THEN ' - ' || v_cliente_nome ELSE '' END;

  INSERT INTO me_contas_receber (
    empresa_id,
    cliente_id,
    venda_id,
    descricao,
    valor,
    data_vencimento,
    status,
    forma_pagamento
  ) VALUES (
    p_empresa_id,
    p_cliente_id,
    v_id_venda,
    v_descricao,
    p_valor_total,
    COALESCE(p_data_vencimento, CURRENT_DATE + 30), -- Usa a data informada ou 30 dias como padrão
    'pendente',
    v_forma_pagamento
  )
  RETURNING id INTO v_id_conta_receber;

  -- Retornar IDs criados
  RETURN jsonb_build_object(
    'success', true,
    'id_venda', v_id_venda,
    'id_venda_servico', v_id_venda_servico,
    'id_conta_receber', v_id_conta_receber,
    'valor_total', p_valor_total
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$function$
;
