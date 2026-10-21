# SPEC — Estorno de Ordem de Produção (Fase 4a)

> Fonte: introspecção real do banco oficial (`pg_get_functiondef('registrar_producao')` 21/10/2026) + `information_schema.columns`. **Baseline: `registrar_producao` intocada.** PRD: `tracking/plans/PRD-Producao-EstornoOP.md` · Análise: `tracking/ANALISE_ESTOQUE_ESTORNO_OP.md`.
> **Emenda de processo (21/10/2026):** fundador autorizou implementar sem WIRE validado previamente — ele valida na Vercel (celular). WIRE escrito mesmo assim para registro SDD.

## 1. Fatos da produção (o que o estorno precisa reverter)

Ordem interna de `registrar_producao(p_empresa_id, p_produto_pai_id, p_quantidade, p_data_producao, p_usuario_id, p_observacao)` — SECURITY DEFINER:

1. Guards (parâmetros, composto, ficha existe, tenant, saldo de cada insumo).
2. **Por item da ficha** (temp `_op_ficha`): `consumo = qtd_por_unidade × lote × (1 + perda/100)`; `UPDATE me_produto SET estoque_atual = estoque_atual - ROUND(consumo)::int`; `INSERT est_movimentacao ('saida', consumo /* sem ROUND */, 'Produção', 'Produção <N> un — <pai>')`.
3. **Acabado:** `estoque_atual += ROUND(lote)::int`; `preco_custo` = média ponderada `(est_antes·custo_antes + lote·custo_unit)/(est_antes+lote)`; `INSERT est_movimentacao ('entrada', lote, 'Produção', …)`.
4. `INSERT est_ordem_producao` + `est_ordem_producao_item` (**quantidade_consumida, custo_medio_usado, custo_item** por insumo — a auditoria que o estorno consome).

Consequência chave: `est_ordem_producao_item` é o **snapshot de consumo** — o estorno não recalcula nada da ficha (que pode ter mudado); ele devolve **exatamente o que foi consumido**.

`est_movimentacao` aceita `motivo` texto livre; o estorno de compra já usa `'Estorno'` (`estornar_recebimento`) — mesmo vocabulário aqui. `preco_custo` só muda em **entrada** com custo explícito; saída nunca altera a média.

## 2. Migration — schema

```sql
-- est_ordem_producao: ciclo de vida
ALTER TABLE public.est_ordem_producao
  ADD COLUMN status text NOT NULL DEFAULT 'ATIVA',
  ADD COLUMN estornado_em timestamptz;

ALTER TABLE public.est_ordem_producao
  ADD CONSTRAINT est_ordem_producao_status_check
  CHECK (status IN ('ATIVA','ESTORNADA'));
```

Linhas existentes herdam `ATIVA` (default) — nenhum backfill. Índice não necessário (volume de OPs é baixo; filtro é por `produto_pai_id` já indexado pela FK).

## 3. RPC `public.estornar_producao(p_empresa_id uuid, p_ordem_id uuid, p_usuario_id uuid DEFAULT NULL) RETURNS jsonb`

plpgsql · SECURITY DEFINER · `SET search_path TO 'public'` · shape de erro igual ao `registrar_producao` (`success/error/detail`) · `EXCEPTION WHEN OTHERS` no fim.

Guards, em ordem:

| # | Condição | detail |
|---|---|---|
| 1 | parâmetros nulos | `INVALID_INPUT` |
| 2 | OP não existe / não é da empresa | `NOT_FOUND` |
| 3 | `status <> 'ATIVA'` | `INVALID_STATUS` — "esta produção já foi estornada" |
| 4 | `me_produto.estoque_atual < ROUND(op.quantidade)` | `ACABADO_INSUFICIENTE` — mensagem: "Restam <X> un de <nome> — o lote produzia <N>. Parte já foi vendida ou consumida: estorne a venda antes, ou ajuste o estoque manualmente." |

Execução (única transação — a RPC é atômica):

1. **Por item de `est_ordem_producao_item` da OP** (JOIN `me_produto` p/ tenant check defensivo): `UPDATE me_produto SET estoque_atual = estoque_atual + ROUND(i.quantidade_consumida)::int`; `INSERT est_movimentacao (empresa_id, produto_id, 'entrada', i.quantidade_consumida /* sem ROUND — espelha a saída original */, 'Estorno', 'Estorno: produção de <dd/mm/aaaa> — <nome do pai>', COALESCE(p_usuario_id, auth.uid()), now())`.
2. **Acabado:** `UPDATE me_produto SET estoque_atual = estoque_atual - ROUND(op.quantidade)::int WHERE id = op.produto_pai_id`; `INSERT est_movimentacao (…, 'saida', op.quantidade, 'Estorno', mesma observação, …, now())`.
3. `UPDATE est_ordem_producao SET status='ESTORNADA', estornado_em=now() WHERE id = p_ordem_id`.
4. `RETURN {success, ordem_id, itens_devolvidos}`.

**Custo — decisões D1 (compensatório) + D1b (restauração exata do acabado no caso comum):**
- **Insumos:** a RPC **não toca `preco_custo`**. No custo médio móvel implementado, saída não altera média e entrada sem custo explícito não altera média — devolver o insumo "ao custo vigente" é exatamente não escrever nada (e como a saída da OP também não alterou a média, o custo do insumo só diverge se houve compra posterior — aí a devolução é coerente com a média vigente).
- **Acabado — D1b:** quando **nenhuma movimentação do acabado existe depois da OP** (`est_movimentacao.created_at > op.created_at` vazio — caso comum: erro percebido na hora), a RPC restaura o custo **exato** por telescopagem da média, espelhando a fórmula de entrada da `registrar_producao` (`c0 = (c1·(E + Q) − Q·custo_unit)/E`, com `Q` sem round no peso e `E = estoque_agora − ROUND(Q)`; `E = 0` → custo mantido, peso zero). Fora desse caso: modelo compensatório puro (D1) — não toca e a média converge. Resposta direta à dor do fundador ("o preço não pode ser recalculado") no cenário real do ganache, sem a máquina de reposting do ERPNext.

**Data da movimentação:** `now()` — o estorno acontece hoje; a data de negócio original fica na observação (mesmo critério do extrato: correção é fato novo, não reescrita do passado).

**Permissões:** `REVOKE ALL FROM PUBLIC, anon` · `GRANT EXECUTE TO authenticated` (o default PUBLIC rebaixa SECURITY DEFINER a endpoint público — padrão do `estornar_recebimento`).

## 4. Tipos e contratos do front

`types/producao.ts`:

```ts
export type StatusOrdemProducao = "ATIVA" | "ESTORNADA";
export const STATUS_ORDEM_LABELS: Record<StatusOrdemProducao, string> = {
  ATIVA: "Ativa",
  ESTORNADA: "Estornada",
};
// OrdemProducao += status: StatusOrdemProducao (default 'ATIVA' no mapper p/ linhas antigas)
//                  estornadoEm?: string | null
```

`use-ordens-producao.ts`: `select` passa a trazer `status, estornado_em`; `mapOrdem` mapeia com fallback `ATIVA`. **Nenhuma outra mudança** (ordenação e filtros atuais preservados — OP estornada continua listada, com badge).

Hook novo `src/app/hooks/use-estornar-producao.ts` — clone estrutural de `use-estornar-recebimento.ts`: `estornar({ ordemId }) → { success, error?, detail? }`; `error` do jsonb é a mensagem humana pronta (exibir integralmente); sem `p_usuario_id` (a RPC resolve `auth.uid()`).

## 5. Front — `ProducaoTab.tsx` (contrato para a lane)

- **Linha do histórico de OPs** (`:517-535` hoje): OP `ATIVA` mostra ações `[Estornar]` `[Corrigir]` (secundárias, quiet); OP `ESTORNADA` mostra badge "Estornada" + data do estorno, linha visualmente apagada (opacity/texto riscado), sem ações.
- **Modal "Estornar produção"** (BottomSheet, padrão E2 do WIRE de estorno de compra): lista "o que vai acontecer" (insumos voltam ao estoque · acabado sai do estoque · extrato registra o estorno, nada é apagado · a produção fica marcada como estornada). Loading no botão; `detail` da RPC vira banda de erro legível acima das ações (ACABADO_INSUFICIENTE exibe a mensagem completa da RPC — já vem pronta).
- **Sucesso (Estornar):** toast "Produção estornada — insumos devolvidos ao estoque" + recarregar (`recarregarProdutos`, `recarregarOrdens`, `onSuccess`).
- **Corrigir produção** (fluxo amend): chama o MESMO `estornar`; no sucesso, em vez de só toast, **abre o `ProduzirLoteModal` pré-preenchido** com a quantidade da OP estornada (prop nova opcional `loteInicial?: string` — ausente = comportamento atual) + banda/toast orientando: "Corrija a ficha técnica se o erro era nela (aba Ficha Técnica) e produza de novo."
- **Estados:** loading/empty/error seguem o padrão atual da aba; modal fora de gate de loading; sem `window.confirm`; alvos ≥ 40px; aria completo.
- **Modo demo (sem sessão):** OPs já retornam lista vazia (sem mock) — nada a fazer.

## 6. Verificação (gate único, no banco oficial)

Prova em **uma** transação com `ROLLBACK`: capturar baseline de 1 composto com ficha (estoque/custo do pai e dos insumos) → `registrar_producao` lote N → `estornar_producao` → conferir: estoques de insumos e pai **iguais ao baseline** · OP `ESTORNADA` + `estornado_em` preenchido · extrato com 1 saída + N entradas motivo 'Estorno' · 2ª chamada → `INVALID_STATUS` · lote com acabado vendido (simular saída) → `ACABADO_INSUFICIENTE` → `ROLLBACK` (zero resíduo). Depois: advisors (`get_advisors`).
