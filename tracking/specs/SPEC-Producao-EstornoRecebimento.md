# SPEC — Estorno de Recebimento de Compra

> Fonte: introspecção real do banco oficial (`pg_get_functiondef('receber_compra')` 15/10/2026) + schemas via `pg_constraint`. Uso: `supabase db query --linked` (Management API — MCP fora nesta rodada). **Baseline: `receber_compra` intocada.**

## 1. Fatos do recebimento (a invariância que o snapshot explora)

Ordem interna de `receber_compra(p_empresa_id, p_compra_id, p_data_recebimento, p_data_vencimento, p_usuario_id)` — SECURITY DEFINER, `search_path = public`:

1. Guards (parâmetros, datas, compra PENDENTE, itens, tenant).
2. **Loop por `est_compra_item`** (SELECT de leitura executado no início do loop — snapshot de statement): `v_qtd = quantidade * COALESCE(fator,1)`; `v_custo_item = valor_unitario / fator`; `v_custo_novo = (est_antes*custo_antes + v_qtd*v_custo_item)/(est_antes+v_qtd)`; `UPDATE me_produto SET estoque_atual = estoque_atual + ROUND(v_qtd)::int, preco_custo = v_custo_novo, ultimo_preco_compra, ultima_compra_em`; `INSERT est_movimentacao (entrada, v_qtd, 'Compra', v_obs, data_recebimento)` — **v_qtd sem ROUND**.
3. `v_total = Σ(qtd × valor_unitario)`; categoria "mercadoria" (find-or-create, tolerante a falha).
4. `INSERT me_contas_pagar (…'pendente', compra_id…)`.
5. **`UPDATE est_compra SET status='RECEBIDO', data_recebimento, valor_total`** ← último passo.

Consequência chave: um trigger `BEFORE UPDATE OF status ON est_compra WHEN NEW.status='RECEBIDO'` executa **depois** de todos os `UPDATE me_produto` + movimentos (mesma transação, snapshot consistente). O estado *antes* é invertível **posicionalmente**:

- `est_antes = estoque_atual_atual − ROUND(Σ qtdᵢ × fatorᵢ)` (retorna valores inteiros como o UPDATE original somou)
- Telescopagem da média: `custo_novo_fim = (E·c₀ + Σ qᵢ·cuᵢ) / (E + Σ qᵢ)` ⇒ `c₀ = (custo_agora·(E + Q) − Σ (qᵢ·cuᵢ)) / E` (exato, mesmo com N linhas do mesmo produto)
- `E = 0` ⇒ `c₀` irrelevante para o futuro (peso zero na próxima média) — guardar `NULL`.

## 2. Tabela `public.est_recebimento` (snapshot)

```sql
id uuid PK DEFAULT gen_random_uuid()
compra_id uuid NOT NULL → est_compra(id) ON DELETE CASCADE
empresa_id uuid NOT NULL → me_empresa(id) ON DELETE CASCADE
produto_id integer NOT NULL → me_produto(id)
qtd_estoque  integer NOT NULL   -- Σ ROUND(qtd × fator) — o que foi somado em estoque
qtd_movimento numeric NOT NULL  -- Σ qtd × fator (sem arredondar) — espelha o movimento 'Compra'
custo_unitario numeric NOT NULL -- valor_unitario ÷ fator (em unidades de estoque)
estoque_antes integer NOT NULL
custo_antes   numeric           -- NULL quando estoque_antes = 0
recebido_em timestamptz NOT NULL DEFAULT now()
estornado_em timestamptz
UNIQUE (compra_id, produto_id)
```

Agregação **por produto** (a compra pode ter N linhas do mesmo insumo). Índices: `empresa_id`, `produto_id`.

**RLS** — padrão do projeto (mesmo modelo de `est_movimentacao`, anotado no P5): `ENABLE ROW LEVEL SECURITY`; `REVOKE ALL FROM anon, authenticated`; `GRANT SELECT TO authenticated`; política única `FOR SELECT TO authenticated USING (true)` (a escrita é exclusiva da RPC SECURITY DEFINER e do trigger def-adjacente).

## 3. Trigger (snapshot no transitar para RECEBIDO)

`public.trg_est_recebimento_snapshot()` — plpgsql, retorna trigger:

1. `DELETE FROM est_recebimento WHERE compra_id = NEW.id` (re-recebimento após estorno reescreve o snapshot — fresh).
2. Uma única query agregada por `produto_id`: `agenda = (ci.compra_id = NEW.id)`: `Σ quantidade`, `Σ quantidade×fator`, `Σ ROUND(quantidade×fator)`, `Σ (quantidade×fator) × (valor_unitario/fator)` — lendo `COALESCE(p.fator_conversao,1)` e o estado **atual** (pós-recebimento) de `me_produto`.
3. `est_antes = estoque_agora − Σ ROUND(q×f)`; `custo_antes = (preco_custo_agora × (est_antes + Q) − Σ(qᵢ×cuᵢ)) / est_antes` (NULL se `est_antes = 0`; se `est_antes < 0` → `RAISE EXCEPTION` — estado incoerente, receive aborta all-or-nothing).
4. `INSERT` nas mesmas linhas.

Trigger:
```sql
CREATE TRIGGER trg_est_recebimento
BEFORE UPDATE OF status ON public.est_compra
FOR EACH ROW
WHEN (NEW.status = 'RECEBIDO' AND OLD.status IS DISTINCT FROM 'RECEBIDO')
EXECUTE FUNCTION public.trg_est_recebimento_snapshot();
```

## 4. RPC `public.estornar_recebimento(p_empresa_id uuid, p_compra_id uuid, p_usuario_id uuid DEFAULT NULL) RETURNS jsonb`

plpgsql · SECURITY DEFINER · `SET search_path TO 'public'` · shape de erro igual ao `receber_compra` (`success/error/detail`) · `EXCEPTION WHEN OTHERS` no fim.

Guards, em ordem:
| # | Condição | detail |
|---|---|---|
| 1 | parâmetros nulos | `INVALID_INPUT` |
| 2 | compra não existe/não é da empresa | `NOT_FOUND` |
| 3 | `status <> 'RECEBIDO'` | `INVALID_STATUS` |
| 4 | sem linhas em `est_recebimento` p/ a compra | `NO_SNAPSHOT` — "recebida antes do estorno existir; corrija à mão" |
| 5 | `me_contas_pagar` vinculada já **paga** | `CONTA_PAGA` |
| 6 | para cada insumo: existe `est_movimentacao` com `criado_em > recebido_em` | `MOVIMENTACAO_POSTERIOR` — erro nomeia o insumo ("estorne em ordem, do mais recente para o mais antigo") |

Execução (única transação):
1. Por produto do snapshot: `UPDATE me_produto SET estoque_atual = estoque_antes, preco_custo = COALESCE(custo_antes, preco_custo)` (restauração exata; quando `estoque_antes = 0` o custo mantém — peso zero na próxima média).
2. `INSERT est_movimentacao (empresa_id, produto_id, 'saida', qtd_movimento, 'Estorno', 'Estorno: compra de <data de recebimento>', COALESCE(p_usuario_id, auth.uid()), data_recebimento)` — compensação, nunca DELETE no extrato.
3. `UPDATE me_contas_pagar SET status='cancelado', observacoes += ' · estornada em <hoje>' WHERE compra_id AND status IN ('pendente','atrasado')` (cancelada já é terminal e não conta no Financeiro — F2).
4. `UPDATE est_compra SET status='PENDENTE', data_recebimento = NULL`.
5. `UPDATE est_recebimento SET estornado_em = now()` (idempotência: segunda tentativa cai no guarda 3 — `INVALID_STATUS`).
6. `RETURN {success, compra_id, conta_pagar_id, itens: [{produto_id, qtd_estoque, qtd_movimento, custo_medio_restaurado}]}`.

**Permissões:** `REVOKE ALL FROM PUBLIC, anon` · `GRANT EXECUTE TO authenticated` (o default PUBLIC rebaixa uma SECURITY DEFINER a endpoint público — melhor preso).

## 5. Limitações conhecidas (registradas, não escondidas)

- Recebimentos anteriores à migration: sem snapshot → `NO_SNAPSHOT` (a compra recebida errada de hoje entra aqui; conserto manual guiado).
- Telescopagem assume a semântica "nota única por insumo" — matemática exata para agregação; difere da execução linha‑a‑linha do `receber_compra` **apenas** se houver 2+ linhas do mesmo insumo na compra (o app hoje soma itens repetidos na mesma linha — risco baixo, monitorar).
- O estorno **exige** que o recebimento seja a última ação do insumo — por desenho (restauração exata é inegociável).

## 6. Front (contrato para a lane)

- Hook novo `src/app/hooks/use-estornar-recebimento.ts`: `estornar({ compraId })` → `{ success, error, detail? }`; tratamento de `detail` mapeado para mensagem amigável; exibição de loading/error/success completa.
- `ComprasPage`: card/sheet da compra **RECEBIDO** ganha ação **"Estornar"** (secundária, quiet) → modal de confirmação próprio (sem `window.confirm`) listando "o que vai acontecer": devolve estoque e custo · cancela a conta no Financeiro · compra volta a PENDENTE · extrato ganha a saída "Estorno".
- Sucesso: toast + recarregar (`useCompras`/`useProdutos`) + banda.
- Falha com `detail` constante: mensagem exata e legível (equivalente em português do `SQLERRM` da RPC).
- Verificação de disponibilidade (pós-optativo): `SELECT est_recebimento` por compra quando abrir ações RECEBIDO — se sem linha: botão fica desabilitado com hint "compra antiga não estornável por dentro".

## 7. Verificação (gate único, no banco oficial)

Prova em **uma** transação com `ROLLBACK` (`supabase db query --linked`, string única): criar compra+itens de teste → capturar baseline (`temp table`) → `receber_compra` → capturar pós → `estornar_recebimento` → comparar por insumo (`estoque_atual`/`preco_custo` iguais ao baseline) + compra PENDENTE + conta cancelada + movimentações (entrada+saída no extrato) → `ROLLBACK` (zero resíduo). Depois: `supabase db advisors` para checagem de segurança.
