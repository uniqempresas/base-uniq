# SPEC — Produção Fase 3: Ordem de Produção transacional

**Data:** 06/10/2026 · **PRD:** `tracking/plans/PRD-Producao-BOM-Fase3-Producao.md` · **WIRE:** `tracking/wireframe/WIRE-Producao-Fase3-Produzir.md`

---

## 1. Fonte da verdade — verificado hoje (MCP + código)

- **Fase 1 (ativa):** `est_ficha_tecnica` (pai, componente, qtd/unidade, perda_pct); embed `me_produto!componente_id`. Ficha única por pai (RPC snapshot).
- **Fase 2 (ativa):** `est_compra`/`est_compra_item` + RPC `receber_compra` (estoque+custo+mov+conta). `me_produto.unidade_compra`/`fator_conversao` só afetam COMPRA; a **ficha técnica e a OP falam a unidade de estoque** (g/ml/un).
- `me_produto.estoque_atual integer` — **sem CHECK de negativo no banco** (verificado hoje) → a RPC da OP tem guarda explícita.
- `est_movimentacao`: tipos usados hoje `entrada|saida`; motivos livres (`motivo text`); custo médio vive em `me_produto.preco_custo` (Fase 2).
- Sem fallback mock de ficha/produção (mesma disciplina das fases 1-2).

## 2. Migrations (2 arquivos)

### 2.1 `20261006150000_producao_fase3_ordem.sql`

```sql
CREATE TABLE IF NOT EXISTS est_ordem_producao (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    uuid NOT NULL REFERENCES me_empresa(id) ON DELETE CASCADE,
  produto_pai_id integer NOT NULL REFERENCES me_produto(id) ON DELETE CASCADE,
  quantidade    numeric NOT NULL CHECK (quantidade > 0),   -- lote (unidades do acabado)
  custo_total   numeric NOT NULL DEFAULT 0,                -- custo apurado do lote
  custo_unit    numeric NOT NULL DEFAULT 0,                -- custo_total / quantidade
  usuario_id    uuid REFERENCES auth.users,
  data_producao timestamptz NOT NULL DEFAULT now(),        -- data de negócio
  observacao    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ordem_empresa_data ON est_ordem_producao (empresa_id, data_producao DESC);
CREATE INDEX IF NOT EXISTS idx_ordem_pai ON est_ordem_producao (produto_pai_id);

CREATE TABLE IF NOT EXISTS est_ordem_producao_item (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id     uuid NOT NULL REFERENCES est_ordem_producao(id) ON DELETE CASCADE,
  produto_id   integer NOT NULL REFERENCES me_produto(id) ON DELETE CASCADE, -- = componente (auditoria)
  quantidade_consumida numeric NOT NULL CHECK (quantidade_consumida > 0), -- unidade de estoque, perda incluída
  custo_medio_usado numeric NOT NULL DEFAULT 0,
  custo_item   numeric NOT NULL DEFAULT 0,                  -- consumo × custo_medio_usado
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ordem_item ON est_ordem_producao_item (ordem_id);

ALTER TABLE me_produto
  DROP CONSTRAINT IF EXISTS me_produto_estoque_nao_negativo;
ALTER TABLE me_produto
  ADD CONSTRAINT me_produto_estoque_nao_negativo CHECK (estoque_atual >= 0);
```

> CHECK de estoque ≥ 0 é rede de segurança (a RPC já valida antes). Tabela nova, zero linhas → seguro.

### 2.2 `20261006151000_producao_fase3_registrar_producao.sql` — RPC (SECURITY DEFINER, padrão F2)

```sql
registrar_producao(
  p_empresa_id uuid,
  p_produto_pai_id integer,
  p_quantidade numeric,          -- lote (>0)
  p_data_producao date,
  p_usuario_id uuid,
  p_observacao text DEFAULT NULL
) → jsonb { success, ordem_id, custos:{custo_total, custo_unit}, itens:[{produto_id, consumo, custo_medio, custo_item}] }
```

Ordem transacional:
1. **Guardas:** pai existe e é da empresa · `natureza='composto'` · ficha ≥1 item · lote > 0 · data válida.
2. **Leitura da ficha + estoque corrente** (`FOR UPDATE` implícito via UPDATE em sequência guardada): monta por item `consumo = quantidade_por_unidade × p_quantidade × (1 + perda_pct/100)`. Guarda por item: `estoque_atual >= consumo`; insuficiente → erro nomeando o insumo (`'Insufficient stock: X precisa Y, tem Z'` em pt-BR) e rollback total.
3. Para cada insumo: `UPDATE me_produto SET estoque_atual = estoque_atual - consumo` + INSERT `est_movimentacao (tipo='saida', motivo='Produção', observacao='OP <qtd> un — <nome pai>', quantidade=consumo, data_MOVIMENTACAO=p_data_producao)`.
4. **Custo apurado:** `custo_item = consumo × COALESCE(preco_custo,0)` (custo médio VIGENTE antes da baixa); `custo_total = Σ custo_item`; `custo_unit = custo_total / p_quantidade`.
5. **Entrada do acabado:** custo médio móvel sobre o acabado: `custo_novo = (est_antes×custo_antes + lote×custo_unit)/(est_antes+lote)`; UPDATE `preco_custo` + `estoque_atual += lote`; INSERT `est_movimentacao (tipo='entrada', motivo='Produção', quantidade=lote)`.
6. Registra OP + itens (auditoria): `est_ordem_producao` + `est_ordem_producao_item` (consumo, custo_medio_usado, custo_item).
7. Erro → `{success:false,error,detail}` (padrão); `REVOKE ... FROM anon`.

**Não faz:** estorno (D13), explosão aninhada (D14 — semiacabado deve já ter estoque; seu custo vem do seu preco_custo atual).

## 3. Tipos — `types/producao.ts` (extensão)

```ts
export interface ConsumoPrevisto { produtoId; nome; sku; unidade; estoqueAtual; consumo; custoMedio; suficiente; linhaTotal; }
export interface OrdemProducao { id; produtoPaiId; produtoNome; quantidade; custoTotal; custoUnit; dataProducao; observacao; }
```

## 4. Hooks (padrão Fase 2)

| Hook | Contrato |
|---|---|
| `use-producao.ts` (NOVO) | `useProducao(produtoPaiId?)`: leitura `est_ordem_producao WHERE empresa AND produto_pai`. Se pai undefined, retorna vazio. |
| `use-custo-ficha.ts` (NOVO) | `useCustoFicha(itens, useProdutos)`: mapa produtoId→{custoMedio, estoqueAtual} de useProdutos; custo/unidade = Σ(custoMedio × qtdPorUn × (1+perda/100)); consumo previsto por item. Extremamente simples, leitura, SEM RPC. |
| `use-registrar-producao.ts` (NOVO) | chama RPC `registrar_producao`; mapa SQLSTATE padrão; retorna custos para o toast |
| `use-produtos.ts` | após registrar produção, `recarregar()` na página (estoque/custo mudaram) — wiring na página |

## 5. UI

### 5.1 `ProdutoDetalhePage.tsx` — aba "Produção" (só `natureza='composto'`)
- **Resumo de custo ao vivo**: custo por unidade produzida = Σ(custo médio do insumo × consumo com perda). Se insumo sem custo (preco_custo null/0) → badge "custo pendente de compra" (link para `/estoque/compras`).
- **Botão "Produzir lote"** → Modal.
- **Histórico de ordens:** lista `est_ordem_producao` do pai (data, lote, custo total/unit).
- Se `natureza≠composto` → aba não existe (render condicional — cuidado rules-of-hooks: hooks no topo, condicionais só no render).
- **Estados:** loading (skeleton), empty ("Nenhuma produção ainda…"), error+retry, success (lista).

### 5.2 Modal "Produzir lote"
- Campo lote (number > 0; default 1) + data (default hoje) + observação opcional.
- **Pré-visualização do consumo**: linha por insumo — nome, consumo formatado com unidade (ex.: "24 kg"), estoque atual, semáforo (verde suficiente/vermelho insuficiente), custo da linha. **Insuficiente → botão Produzir desabilitado** + mensagem "Estoque insuficiente de X".
- Salvar → RPC → toast "Produção registrada: +N <unidade> · custo R$X/un · insumos baixados" → refetch da ficha/página.
- Sem APIs inventadas; fundação idêntica ao fluxo "Receber compra".

## 6. Verificação

1. `npx tsc --noEmit` 0 · `npm run build` OK.
2. **Prova SQL da OP (mês/ROLLBACK):** ver §4 do PRD — 36 trufas: chocolate 20g@0.057/g, LC 15g, CL 8g, polpa 10g → consumos com perda, estoque baixado, acabado +36 com custo apurado, movimentações ‘saida/Produção’ ×4 + ‘entrada/Produção’ ×1, OP+itens gravados. Insumo insuficiente → erro e NADA muda (rollback). 2ª chamada idem F2 (não há 2ª chamada — OP nova a cada produção).
3. Deploy Vercel READY.

## 7. Checklist

- [ ] Migration §2.1 + RPC §2.2 aplicadas · provas SQL do §6.2 (ok + insuficiente) com ROLLBACK
- [ ] Tipos + hooks (produção, custo ficha, registrar produção)
- [ ] Aba Produção no detalhe (composto) + modal Produzir + histórico
- [ ] tsc 0 · build OK · push · Vercel READY
