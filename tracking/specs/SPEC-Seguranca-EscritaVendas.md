# SPEC — Segurança da Escrita de Vendas

**Versão:** 1.0
**Data:** 21/09/2026
**Status:** Pronto para implementação (aguarda decisões D-2, D-3 e D-4 do PRD)
**Tipo:** Backend (Postgres) + 1 hook de front — **sem tela nova, sem WIRE**
**Referência PRD:** `tracking/plans/PRD-Seguranca-EscritaVendas.md`
**Banco alvo:** `krrkfgvdwhpelxtrdtla` (oficial)

---

> ## ⚠️ v1.0 — NÃO IMPLEMENTAR AINDA
>
> Este SPEC passou por revisão sênior de segurança em 21/09/2026, que encontrou **7 achados** — incluindo **um furo no bloco de validação de tenant proposto** (R3) e uma **premissa errada** (o P5 é risco maior que a RPC — R1).
>
> Os dois blocos de risco de segurança **já estão corrigidos abaixo**: a validação de tenant (§4.1) e o `search_path` (§4.3, §5.1). O restante dos achados (rate-limit, oráculo de identidade, deadlock, guardas de preço/quantidade, contrato de erro) **ainda não está incorporado** — aguarda decisão de escopo (**D-5**, **D-6**, **D-7** do PRD).
>
> **Fonte dos achados:** `tracking/plans/PRD-Seguranca-EscritaVendas.md` §2.7.

---

## 1. Visão geral técnica

Duas migrações de banco e um ajuste de hook:

| # | Artefato | Natureza |
|---|---|---|
| **A** | `registrar_venda` endurecida | Altera função existente (caminho ERP + n8n) |
| **B** | `fn_loja_criar_pedido` | Função **nova** (caminho loja pública) |
| **C** | `use-loja-criar-pedido.ts` | Troca a RPC chamada; payload sem preço |

Sem mudança de componente, rota, tipo ou layout.

---

## 2. Baseline verificado (21/09/2026)

Tudo abaixo foi lido **no banco oficial** e no código. É o "antes" contra o qual a validação compara.

### 2.1 Função atual

```
registrar_venda(uuid, numeric, varchar, uuid, date, varchar, jsonb, text, varchar)
  SECURITY DEFINER · owner postgres · search_path: (nenhum)
  ACL: =X/postgres | postgres | anon | authenticated | service_role
```

### 2.2 Formas de pagamento existentes (a raiz do F5)

| id | nome | empresa_id |
|---|---|---|
| 1 | Dinheiro | `NULL` (global) |
| 2 | Cartão de Crédito | `NULL` |
| 3 | **Pix** | `NULL` |
| 4 | Cartão de Débito | `NULL` |
| 5 | Boleto | `NULL` |
| 20 | Dinheiro | `6257ebef…` |
| 21 | Cartão de Crédito | `6257ebef…` |
| 22 | **Pix** | `6257ebef…` |

**"Pix" existe duas vezes (3 e 22).** `WHERE nome ILIKE 'Pix' LIMIT 1`, sem filtro de empresa e sem `ORDER BY`, devolve qualquer um dos dois — confirmado empiricamente, não é teoria. A Doceê (`52aa05bf…`) **não tem** formas próprias; resolve nas globais.

> `me_forma_pagamento` **não tem coluna `ativo`** — não há soft delete. Considerar ao filtrar.

### 2.3 Colunas relevantes

| Tabela | Coluna | Tipo | Nulo? |
|---|---|---|---|
| `me_venda` | `forma_pagamento` | integer | **sim** (aceita NULL) |
| `me_venda` | `status_venda` | text | não (default `'concluída'`) |
| `me_venda` | `valor_total` | numeric | não |
| `me_venda` | `tipo_venda` · `canal_venda` | text | sim |
| `me_produto` | `preco` · `preco_varejo` | numeric | sim |
| `me_produto` | `estoque_atual` | integer | sim (default 0) |
| `me_produto` | `exibir_vitrine` · `ativo` | boolean | sim (default false / true) |
| `me_cliente` | `telefone` · `origem` · `empresa_id` | text/text/uuid | sim |
| `me_cliente` | `nome_cliente` | text | **não** |
| `me_empresa` | `slug` | text | sim |

### 2.4 Preço canônico da loja

`use-loja-criar-pedido.ts:168` usa **`me_produto.preco`** (não `preco_varejo`). O servidor **deve** usar o mesmo campo, senão o total muda.

### 2.5 Identidade do usuário logado

`me_usuario.id` **é** `auth.users.id` (verificado: 4 de 4 usuários casam). Portanto `auth.uid()` → `me_usuario` → `empresa_id`. É a base da validação de tenant.

---

## 3. Princípios

| Princípio | Aplicação |
|---|---|
| **Nunca confiar no cliente** | Preço, nome de produto e total são resolvidos no servidor |
| **Tenant não é parâmetro** | Na loja, o tenant vem do **slug**; no ERP, vem do **`auth.uid()`** |
| **Menor privilégio** | `EXECUTE` só para quem precisa: `anon` **não** chama a função interna |
| **`SECURITY DEFINER` sempre com `search_path` fixo** | Preferir `''` **com nomes totalmente qualificados** (é o que o skill manda). **Se o corpo usar nomes não qualificados, usar `public, pg_temp`** — com `pg_temp` por último, o vetor de sequestro fica fechado. Verificado no banco: `anon` e `authenticated` **não** têm `CREATE` no schema `public`, então não conseguem plantar objeto sombreando. *(A v1.0 mandava `''` para todas — isso **quebraria** `registrar_venda`, cujo corpo é não qualificado. Corrigido na implementação de 21/09.)* |
| **UX no cliente, verdade no servidor** | O cliente continua resolvendo preço/estoque para avisar antes; o servidor passa a **impor** |

---

## 4. Migração A — `registrar_venda` endurecida

**Arquivo:** `supabase/migrations/20260921HHMMSS_registrar_venda_hardening.sql`

### 4.1 Bloco 1 — validação de tenant (inserir logo após o `BEGIN`)

```sql
  -- ============================================================
  -- VALIDAÇÃO DE TENANT
  -- Usuário logado (JWT de usuário) só grava na própria empresa.
  -- service_role (n8n) não tem auth.uid() e passa direto — é o
  -- caminho de confiança do servidor.
  -- ============================================================
  -- ============================================================
  -- VALIDAÇÃO DE TENANT — FALHA FECHADA
  --
  -- ⚠️ NÃO usar "auth.uid() IS NULL" como sinal de service_role:
  --    a ANON KEY também produz auth.uid() NULL. O discriminador
  --    correto é o PAPEL do JWT. (achado R3 da revisão)
  --
  -- Se o papel não puder ser lido (conexão direta, sem JWT), o
  -- COALESCE cai em '' e a checagem RODA — falha fechada.
  -- ============================================================
  IF COALESCE((SELECT auth.role()), '') <> 'service_role' THEN
    IF (SELECT auth.uid()) IS NULL
       OR NOT EXISTS (
         SELECT 1
         FROM public.me_usuario u
         WHERE u.id = (SELECT auth.uid())
           AND u.empresa_id = p_empresa_id
           AND u.ativo
       )
    THEN
      RETURN jsonb_build_object(
        'success', false,
        'error',  'Usuario sem permissao para registrar venda nesta empresa.',
        'detail', 'tenant_mismatch'
      );
    END IF;
  END IF;
```

> `(SELECT auth.uid())` em vez de `auth.uid()` direto: o padrão do skill — a função é avaliada uma vez, não por linha.

### 4.2 Bloco 2 — corrigir o F5 (substituir o trecho de mapeamento)

**Antes:**
```sql
SELECT id INTO v_forma_pagamento_id
FROM me_forma_pagamento
WHERE nome ILIKE v_forma_pagamento
LIMIT 1;

IF v_forma_pagamento_id IS NULL THEN
  v_forma_pagamento_id := 1;
END IF;
```

**Depois:**
```sql
  -- Forma de pagamento: resolve DENTRO da empresa, de forma determinística.
  -- Prefere a linha do tenant; cai para a global; e NÃO inventa um id.
  SELECT id INTO v_forma_pagamento_id
  FROM public.me_forma_pagamento
  WHERE nome ILIKE v_forma_pagamento
    AND (empresa_id = p_empresa_id OR empresa_id IS NULL)
  ORDER BY (empresa_id = p_empresa_id) DESC, id ASC
  LIMIT 1;
  -- v_forma_pagamento_id pode ficar NULL — me_venda.forma_pagamento aceita NULL.
  -- O texto v_forma_pagamento continua indo para me_contas_receber.forma_pagamento,
  -- então a informação nunca se perde.
```

**O que isso corrige:** determinismo (mesma entrada → mesmo id), precedência correta (tenant > global) e o fallback incoerente (`1` = Dinheiro) que contradizia o texto `'PIX'`.

### 4.3 Bloco 3 — hardening e privilégios

```sql
ALTER FUNCTION public.registrar_venda(
  uuid, numeric, varchar, uuid, date, varchar, jsonb, text, varchar
) SET search_path = public, pg_temp;   -- ⚠️ NÃO '' — o corpo usa nomes NÃO qualificados

REVOKE EXECUTE ON FUNCTION public.registrar_venda(
  uuid, numeric, varchar, uuid, date, varchar, jsonb, text, varchar
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.registrar_venda(
  uuid, numeric, varchar, uuid, date, varchar, jsonb, text, varchar
) TO authenticated, service_role;
```

> `PUBLIC` **precisa** ser revogado explicitamente — no Postgres, `EXECUTE` é concedido a `PUBLIC` por padrão em toda função nova, e revogar só de `anon` não basta.

---

## 5. Migração B — `fn_loja_criar_pedido` (loja pública)

**Arquivo:** `supabase/migrations/20260921HHMMSS_fn_loja_criar_pedido.sql`

### 5.1 Assinatura

```sql
CREATE OR REPLACE FUNCTION public.fn_loja_criar_pedido(
  p_slug            text,
  p_telefone        text,
  p_nome_cliente    text,
  p_itens           jsonb,   -- [{ "produto_id": 12, "quantidade": 2 }]  ← SEM preço, SEM nome
  p_forma_pagamento text,
  p_observacoes     text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
```

**Diferença central:** o cliente manda **só id e quantidade**. Preço, nome e total são do servidor.

### 5.2 Corpo (esqueleto com as guardas)

```sql
DECLARE
  v_empresa_id   uuid;
  v_cliente_id   uuid;
  v_item         jsonb;
  v_produto      record;
  v_qtd          integer;
  v_total        numeric := 0;
  v_itens_norm   jsonb := '[]'::jsonb;
  v_erros        jsonb := '[]'::jsonb;
  v_forma_id     integer;
  v_venda_id     uuid;
  v_conta_id     uuid;
BEGIN
  -- (1) TENANT PELO SLUG — nunca por parâmetro
  SELECT id INTO v_empresa_id FROM public.me_empresa WHERE slug = p_slug;
  IF v_empresa_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Loja nao encontrada.', 'detail', 'slug_invalido');
  END IF;

  -- (2) GUARDA ANTI-ABUSO (ver D-3)
  IF jsonb_typeof(p_itens) <> 'array' OR jsonb_array_length(p_itens) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pedido sem itens.', 'detail', 'sem_itens');
  END IF;
  IF jsonb_array_length(p_itens) > 50 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pedido com itens demais.', 'detail', 'limite_itens');
  END IF;

  -- (3) RESOLVER PREÇO E ESTOQUE NO SERVIDOR
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens) LOOP
    v_qtd := GREATEST(1, LEAST(100, COALESCE((v_item->>'quantidade')::integer, 1)));

    SELECT p.id, p.nome_produto, p.preco, p.estoque_atual
      INTO v_produto
    FROM public.me_produto p
    WHERE p.id = (v_item->>'produto_id')::integer
      AND p.empresa_id = v_empresa_id
      AND p.ativo
      AND p.exibir_vitrine;

    IF v_produto.id IS NULL THEN
      v_erros := v_erros || jsonb_build_object(
        'produtoId', (v_item->>'produto_id')::integer,
        'nome', 'Produto indisponivel', 'estoqueDisponivel', 0, 'quantidade', v_qtd);
      CONTINUE;
    END IF;

    IF COALESCE(v_produto.estoque_atual, 0) < v_qtd THEN
      v_erros := v_erros || jsonb_build_object(
        'produtoId', v_produto.id, 'nome', v_produto.nome_produto,
        'estoqueDisponivel', COALESCE(v_produto.estoque_atual, 0), 'quantidade', v_qtd);
      CONTINUE;
    END IF;

    v_itens_norm := v_itens_norm || jsonb_build_object(
      'tipo', 'produto',
      'id_referencia', v_produto.id,
      'nome', v_produto.nome_produto,
      'quantidade', v_qtd,
      'preco_unitario', v_produto.preco          -- ← preço DO BANCO
    );
    v_total := v_total + (v_qtd * COALESCE(v_produto.preco, 0));
  END LOOP;

  -- (4) ESTOQUE INSUFICIENTE → NÃO GRAVA NADA
  --     Devolve a MESMA forma que CheckoutPage.tsx:989 já renderiza.
  IF jsonb_array_length(v_erros) > 0 THEN
    RETURN jsonb_build_object('success', false, 'errosEstoque', v_erros);
  END IF;

  -- (5) CLIENTE: find-or-create por telefone normalizado (servidor)
  v_cliente_id := public.fn_resolver_cliente_id(v_empresa_id, p_telefone);
  IF v_cliente_id IS NULL THEN
    INSERT INTO public.me_cliente (empresa_id, nome_cliente, telefone, origem)
    VALUES (v_empresa_id, COALESCE(NULLIF(TRIM(p_nome_cliente), ''), 'Cliente Loja'),
            public.fn_normalizar_telefone(p_telefone), 'loja')
    RETURNING id INTO v_cliente_id;
  END IF;

  -- (6) FORMA DE PAGAMENTO — mesma regra determinística da Migração A
  SELECT id INTO v_forma_id
  FROM public.me_forma_pagamento
  WHERE nome ILIKE COALESCE(NULLIF(TRIM(p_forma_pagamento), ''), 'Pix')
    AND (empresa_id = v_empresa_id OR empresa_id IS NULL)
  ORDER BY (empresa_id = v_empresa_id) DESC, id ASC
  LIMIT 1;

  -- (7) GRAVAR VENDA + ITENS + BAIXAR ESTOQUE + CONTA A RECEBER
  --     Reaproveita exatamente a lógica de registrar_venda, com o tenant
  --     e os preços JÁ resolvidos aqui (nenhum valor vem do cliente).

  RETURN jsonb_build_object(
    'success', true,
    'id_venda', v_venda_id,
    'id_conta_receber', v_conta_id,
    'cliente_id', v_cliente_id,
    'valor_total', v_total
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
```

### 5.3 Concorrência — a baixa de estoque precisa ser condicional

**Problema:** checar o estoque num laço e baixar depois **não é atômico**. Dois checkouts simultâneos do último item passariam os dois na checagem e baixariam duas vezes → **estoque negativo**.

**Correção — a baixa vira a própria guarda:**

```sql
UPDATE public.me_produto
   SET estoque_atual = estoque_atual - v_qtd
 WHERE id = v_produto_id
   AND empresa_id = v_empresa_id
   AND COALESCE(estoque_atual, 0) >= v_qtd;   -- ← condição, não só filtro

IF NOT FOUND THEN
  RAISE EXCEPTION 'estoque_insuficiente:%', v_produto_id;
END IF;
```

Como a função inteira roda numa transação, `NOT FOUND` desfaz tudo — nenhuma venda parcial fica gravada. A checagem do laço (§5.2, passo 3) passa a ser **UX antecipada**; a garantia real é esta.

> Mesma correção se aplica a `registrar_venda`, que hoje baixa estoque sem essa condição.

### 5.4 Privilégios

```sql
REVOKE EXECUTE ON FUNCTION public.fn_loja_criar_pedido(text,text,text,jsonb,text,text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.fn_loja_criar_pedido(text,text,text,jsonb,text,text) TO anon, authenticated;
```

`anon` **só** nesta função — é o caminho público legítimo. A função interna fica fechada.

### 5.4 Contrato de resposta

**Sucesso**
```json
{ "success": true, "id_venda": "…", "id_conta_receber": "…",
  "cliente_id": "…", "valor_total": 35.00 }
```

**Estoque insuficiente** — *idêntico* ao que `ItemErroEstoque` já espera:
```json
{ "success": false,
  "errosEstoque": [ { "produtoId": 12, "nome": "Surpresa de Uva",
                      "estoqueDisponivel": 0, "quantidade": 2 } ] }
```

**Outros** — `{ success: false, error, detail }` com `detail` ∈ `slug_invalido` · `sem_itens` · `limite_itens`.

---

## 6. Migração C — front-end

**Arquivo:** `src/app/hooks/use-loja-criar-pedido.ts`

| Antes | Depois |
|---|---|
| `supabase.rpc("registrar_venda", { p_empresa_id, p_cliente_id, p_valor_total, p_itens com preço, … })` (`:195`) | `supabase.rpc("fn_loja_criar_pedido", { p_slug, p_telefone, p_nome_cliente, p_itens: [{produto_id, quantidade}], p_forma_pagamento, p_observacoes })` |
| Preço/estoque resolvidos só no cliente (`buscarProdutosCanonicos`) | Cliente **mantém** a resolução para UX (`precoAtualizado`, `errosEstoque`) — o servidor passa a **impor** |
| `cliente_id` criado no cliente | Servidor faz o find-or-create e **devolve** `cliente_id` (o cliente usa para a sessão) |

**O que NÃO muda:** nenhum componente. `CheckoutPage.tsx` continua consumindo `errosEstoque` e `precoAtualizado` como já faz.

---

## 7. n8n — sem mudança

O sub-workflow `docee_criarpedido` chama `registrar_venda` com a credencial `supabaseApi` `UNIQ-uat4` (host + **service_role**). `service_role` mantém `EXECUTE` — **nada a alterar**.

> ⚠️ **Confirmar antes de revogar** (§8, passo 4). A API pública do n8n recusou ler a credencial (`405`), então o papel foi inferido do schema do n8n **e** do fato de o n8n ler tabelas com RLS que a anon key não enxerga. Duas evidências convergentes, mas **não** leitura direta do segredo.

---

## 8. Ordem de implantação (sem downtime)

A ordem importa: revogar `anon` **antes** de a loja migrar quebraria o checkout em produção.

| # | Passo | Risco |
|---|---|---|
| 1 | Aplicar **Migração B** (`fn_loja_criar_pedido`) | **Nenhum** — função nova, nada a chama ainda |
| 2 | Ajustar o hook (Migração C) e dar deploy | **Nenhum** — a função antiga continua concedida |
| 3 | Testar o checkout ponta a ponta em produção | — |
| 4 | Confirmar que o n8n continua gravando (1 pedido de teste no WhatsApp) | — |
| 5 | Aplicar **Migração A** (validação de tenant + F5 + revogar `anon`) | **Baixo** — a loja já não usa a função interna |
| 6 | Testar de novo: ERP (contabilizar venda) + loja + WhatsApp | — |

**Reversão de emergência do passo 5:** `GRANT EXECUTE … TO anon;` devolve o estado anterior em um comando.

---

## 9. Validação

### 9.1 No banco (obrigatório)

```sql
-- 1) anon NÃO pode mais executar a função interna
SELECT has_function_privilege('anon',
  'public.registrar_venda(uuid,numeric,varchar,uuid,date,varchar,jsonb,text,varchar)',
  'EXECUTE') AS deve_ser_false;

-- 2) search_path fixado nas duas funções
SELECT proname, proconfig FROM pg_proc
WHERE proname IN ('registrar_venda','fn_loja_criar_pedido');

-- 3) determinismo da forma de pagamento (5 execuções → mesmo id)
--    rodar dentro de uma transação com ROLLBACK
```

### 9.2 Testes de comportamento

| Teste | Esperado |
|---|---|
| `anon` chamando `registrar_venda` | `permission denied` |
| Usuário da empresa A tentando gravar em B | `success: false`, `detail: tenant_mismatch` |
| `fn_loja_criar_pedido` com preço adulterado no payload | total gravado = preço do banco |
| `fn_loja_criar_pedido` com estoque insuficiente | `success: false` + `errosEstoque` **e nenhuma venda criada** |
| `fn_loja_criar_pedido` com slug inexistente | `detail: slug_invalido` |
| Pedido de loja completo | aparece no ERP como **Recebido**, canal `loja` |
| Fluxo WhatsApp (n8n) | continua gravando normalmente |

### 9.3 Regressão

- `npx tsc --noEmit` — a linha de base é **5 erros** (eram 8; 3 corrigidos em 21/09/2026); nenhum novo
- `npm run build` ✅
- Fluxo de loja em produção após o deploy

---

## 10. Rollback

| Migração | Reversão |
|---|---|
| **A** | `GRANT EXECUTE … TO anon;` + `CREATE OR REPLACE` com o corpo anterior (guardado no backup) |
| **B** | `DROP FUNCTION public.fn_loja_criar_pedido(...)` — nada mais a referencia após reverter o hook |
| **C** | `git revert` do commit do hook |

Backup do estado anterior da função: salvar o `pg_get_functiondef` em `supabase/migrations/_rollback/` **antes** de aplicar.

---

## 11. Checklist de implementação

**Migração A**
- [ ] Backup do `pg_get_functiondef` atual
- [ ] Bloco de validação de tenant
- [ ] Bloco do F5 (filtro de empresa + `ORDER BY` + sem fallback falso)
- [ ] `SET search_path = ''`
- [ ] `REVOKE` de `PUBLIC` **e** `anon` · `GRANT` para `authenticated`, `service_role`

**Migração B**
- [ ] Função criada com `SECURITY DEFINER` + `search_path`
- [ ] Tenant resolvido pelo slug
- [ ] Preço e estoque do servidor
- [ ] Find-or-create de cliente pelo servidor
- [ ] `REVOKE` de `PUBLIC` · `GRANT` para `anon`, `authenticated`
- [ ] Guardas anti-abuso

**Front**
- [ ] Hook troca a RPC e o payload
- [ ] `cliente_id` vem do retorno do servidor
- [ ] `tsc` sem erros novos · `build` ✅

**Validação**
- [ ] As 3 consultas do §9.1
- [ ] Os 7 testes do §9.2
- [ ] Regressão do §9.3

---

## 12. Riscos e pontos de atenção

| Risco | Mitigação |
|---|---|
| O n8n usar `anon` e não `service_role` | Confirmado no passo 4 **antes** do passo 5; reversão em 1 comando |
| Esquecer de revogar `PUBLIC` (só `anon`) | Está explícito no §4.3 — `PUBLIC` é o default do Postgres |
| `preco_varejo` vs `preco` | O servidor usa **`preco`**, igual ao hook (`:168`) |
| Loja continuar mandando preço | O servidor **ignora** o campo — não é validado, é descartado |
| Duplo clique no checkout | Dedup por telefone + itens + total numa janela curta (D-3) |
| `me_venda.tipo_venda = 'pdv'` chumbado | **D-2** — fora do escopo até decisão |
| Vendas antigas com forma de pagamento errada | **D-4** — sem backfill por decisão |

---

**Próximo passo:** decisões **D-2**, **D-3** e **D-4** do PRD → aplicar na ordem do §8.

---

## 13. Aprendizados da implementação da Opção A (21/09/2026)

A **correção curta** (Opção A) foi implementada e validada. Ela não é este SPEC inteiro — foi o subconjunto: F5 + `fn_excluir_pedido_cancelado` + 2 bugs de código. O que a implementação ensinou:

**1. `search_path = ''` quebra funções com corpo não qualificado** 🔴
Este SPEC mandava `''` para todas. Mas `registrar_venda` usa nomes **não qualificados** (`INSERT INTO me_venda`, `FROM me_forma_pagamento`) — com `''` ela falharia em runtime. Aplicado `public, pg_temp`, que é seguro porque `anon`/`authenticated` não têm `CREATE` em `public` (verificado).
Já a `fn_excluir_pedido_cancelado` tem o corpo **totalmente qualificado** → nela `''` foi aplicado.

**2. `ORDER BY (empresa_id = p_empresa_id) DESC` NÃO faz o que parece** 🔴
No Postgres, `DESC` põe **NULLs primeiro**. Como `(NULL = uuid)` é `NULL`, a linha **global** vencia a do **tenant** — o inverso do objetivo. Prova: UNIQ Empresas resolvia `'Pix'` para o id 3 (global) em vez do 22 (tenant). **A verificação pegou**; corrigido com `DESC NULLS LAST`. Vale para a `fn_loja_criar_pedido` (§5.2), que repete o padrão.

**3. `use-registrar-venda.ts` é código morto** 🟡
Nenhum componente o importa. O botão "Contabilizar venda" real é `PedidoDetalhePage.handleContabilizar`, que **não chama a RPC** — só faz `atualizarStatus({status:'pago'})`.

→ **Correção ao §2.4 e ao §7:** os chamadores **vivos** de `registrar_venda` são apenas **a loja** (`use-loja-criar-pedido.ts`, anon) e o **n8n** (`docee_criarpedido`, service_role). O ERP **não** chama mais. O `TRACKING.md` (T2.2) descreve o contrário e está desatualizado.

**4. Como a migração foi escrita** ✅
Em vez de transcrever o corpo da função de produção, a migração **lê a definição real do banco** (`pg_get_functiondef`) e substitui apenas o bloco, **abortando se a âncora não casar**. Zero risco de erro de cópia. Padrão a repetir.

**5. Rede de segurança** ✅
Antes de alterar, as definições originais foram gravadas em `private.snapshot_functiondef` (schema **não exposto** ao PostgREST). Restaurar = ler a coluna `definicao` e executar.
