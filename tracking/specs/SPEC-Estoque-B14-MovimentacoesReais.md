# SPEC — Estoque B14: Movimentações reais

**Data:** 06/10/2026 · **PRD:** `tracking/plans/PRD-Estoque-B14-MovimentacoesReais.md` · **WIRE:** `tracking/wireframe/WIRE-Estoque-B14-Movimentacoes.md`
**Status:** pronto para implementação (aguardando aprovação do WIRE)

---

## 1. Fonte da verdade — schema REAL de `est_movimentacao` (verificado 06/10/2026, information_schema + pg_constraint)

| Coluna | Tipo | Null | Default | Notas |
|---|---|---|---|---|
| `id` | uuid | NOT NULL | `gen_random_uuid()` | PK |
| `empresa_id` | uuid | NOT NULL | — | FK `me_empresa(id)` **ON DELETE CASCADE** |
| `produto_id` | **integer** | NOT NULL | — | FK `me_produto(id)` **ON DELETE CASCADE** → **embed PostgREST funciona** |
| `tipo` | text | NOT NULL | — | CHECK `('entrada','saida','ajuste')` — **minúsculo** (migration `20261006090000` trocou o CHECK maiúsculo que expulsava os INSERTs do app — bug **N9**) |
| `quantidade` | **numeric** | NOT NULL | — | app envia inteiro; ok |
| `data_movimentacao` | timestamptz | NOT NULL | `now()` | **data de negócio** — usar no extrato/ordenar |
| `motivo` | text | NULL | — | texto livre (vocabulário do app em §2) |
| `observacao` | text | NULL | — | **nova** (migration `20261006091000` — bug **N10**: o campo existia na UI e era descartado) |
| `usuario_id` | uuid | NULL | — | FK `auth.users(id)` (não `me_usuario`!) |
| `created_at` | timestamptz | NULL | `now()` | gravação |

- **Sem** `venda_id` (D2: baixa por venda fora do extrato nesta fase) · **sem** coluna de custo.
- **RLS LIGADA** com 4 políticas permissivas (`SELECT true` p/ todos; INSERT/UPDATE/DELETE p/ `authenticated`) — melhor que o padrão P5, mas **sem escopo de tenant**: qualquer autenticado escreve em qualquer empresa. Nota para `BACKLOG_SEGURANCA.md`, não bloqueia B14.
- **Índices criados** (migration catch-up): `(empresa_id, data_movimentacao DESC)` e `(produto_id)`.
- Tabela **vazia** em produção (0 linhas) — o extrato real começa vazio: o empty state é o estado inicial de verdade.

## 2. Tipos — `src/app/types/estoque.ts` (NOVO)

```ts
export type MovTipo = "entrada" | "saida";           // UI: só estes dois (o 'ajuste' do CHECK fica de cabeça para uso futuro)
export type MovMotivo = "Compra" | "Devolução" | "Ajuste" | "Perda" | "Venda"
  | "Inventário" | "Quebra" | "Doação" | "Outro";

export interface MovimentacaoEstoque {
  id: string;
  empresaId: string;
  produtoId: string;        // string na UI (Produto.id é string); integer no banco
  produtoNome: string;
  produtoSku: string;
  tipo: MovTipo;
  quantidade: number;
  motivo: string;           // texto livre (não restringir ao union no mapper)
  observacao?: string;
  responsavel?: string;     // nome_usuario quando resolvível; "—" na UI
  data: string;             // ISO — de data_movimentacao
  cancelada: boolean;       // sempre false no real (mock tem true)
}
```

- **Mover** `MovTipo`/`MovMotivo`/`Movimentacao` de `estoqueMockData.ts:13-39` para `types/estoque.ts` e **re-exportar** do mock (mesmo padrão do `Produto` — SPEC §4 D3 de 17/09) — zero quebra nos consumidores.
- Mock `Movimentacao` mantém `custo?`/`variacao?` (demo); o tipo compartilhado não precisa deles.

## 3. Hook de leitura — `src/app/hooks/use-movimentacoes.ts` (NOVO)

Assinatura: `useMovimentacoes(filtros?: { produtoId?: string })` → `{ movimentacoes, loading, error, isFallback, recarregar }`.

1. **Sem sessão** → mock (`MOVIMENTACOES`), `isFallback: true` — padrão exato de `use-produtos.ts:105-110`.
2. **Com sessão** → `supabase.from("est_movimentacao")`
   - `.select("*, me_produto(nome_produto, sku), me_usuario(nome_usuario)")` — embeds por FK: `produto_id → me_produto` (integer FK, confirmado) e `usuario_id → auth.users` **não é embedável**; para o nome do responsável usar `me_usuario` por igualdade de id (`me_usuario.id` é o uuid do auth — comentário de `ProdutoDetalhePage.tsx:129`). PostgREST resolve `me_usuario` **sem FK declarada**? **Não** — embed exige FK. ⇒ **NÃO usar embed de me_usuario**: resolver responsável com 2ª query `me_usuario.select("id, nome_usuario").in("id", idsUnicos)` (me_usuario.id é uuid do auth, verificado) e juntar em memória. Sem match → `undefined`.
   - `.eq("empresa_id", empresaId)` (obrigatório — T2.6)
   - `.order("data_movimentacao", { ascending: false })`
   - `produtoId` (quando informado): `.eq("produto_id", Number(produtoId))`
3. **Com sessão e 0 linhas** → empty real (NUNCA mock) — igual `use-produtos.ts:135-140`.
4. Mapper: `data_movimentacao` (fallback `created_at`) → ISO; `quantidade` → `Number`; `tipo` lowercase; `cancelada: false`.
5. Erro → `error` + `recarregar` (padrão dos hooks do estoque).

## 4. Escrita — `src/app/hooks/use-registrar-movimentacao.ts` (NOVO)

`registrarMovimentacao({ produto, tipo, quantidade, motivo, observacao })` → `{ success, error? }`.
**Extrai a lógica do `AjustarEstoqueModal`** (`ProdutoDetalhePage.tsx:82-147`) para um hook usado pelos DOIS modais (o do detalhe passa a chamá-lo — remove a duplicação que o B14 criaria):

1. Validações: `quantidade > 0` · motivo obrigatório · `tipo === "saida"` ⇒ `quantidade <= produto.estoque` (mesmas mensagens atuais).
2. `empresaId` obrigatório (guarda anti-tenant, `:100-105`).
3. **Ordem preservada** (comentário `:113-116`): 1º `UPDATE me_produto SET estoque_atual = <valor absoluto>` via `useAtualizarProduto` (falha → aborta, nada gravado); 2º `INSERT est_movimentacao` com `tipo` **minúsculo**, `quantidade`, `motivo`, `observacao ?? null`, `usuario_id: perfil?.id ?? null`.
4. INSERT falha → mensagem atual: *"Estoque atualizado, mas não foi possível registrar o histórico…"*.
5. Sucesso → `recarregar()` das leituras.

## 5. Telas

### 5.1 `MovimentacoesPage` (troca mock → real; WIRE §3)
- Dados: `useMovimentacoes()`; filtros **client-side** sobre a lista carregada (tipo, período, busca por produto) — tabela pequena, sem paginação nesta fase.
- **Modal "Nova Entrada/Saída" real** (hoje fake `:60-66`): produto (**busca client-side sobre `useProdutos`** — 16 produtos da Doceê; dropdown com nome + SKU), tipo (Entrada/Saída), quantidade, motivo (mesmos chips do modal do detalhe), observação (opcional — agora gravada, N10). Sem campo de custo. Botão Confirmar → `registrarMovimentacao`.
- **Remover** a coluna/botão "Cancelar" das linhas (D4 — botão morto `:577-584`).
- Estados: loading (skeleton), empty real (*"Nenhuma movimentação registrada ainda — use Nova Entrada/Saída ou o ajuste no detalhe do produto"*), error + retry, success. Fallback demo preserva mock + banner atual.

### 5.2 `EstoqueDashboardPage` — "Movimentações recentes"
- `:63` `MOVIMENTACOES.slice(0,5)` → `useMovimentacoes()` e `movimentacoes.slice(0,5)`; fallback mock no demo. Empty real quando 0.
- **Gráficos ficam como estão** (mock) — fora do escopo (PRD §4).

### 5.3 `ProdutoDetalhePage` — aba Movimentações
- `:271-274` (mock só no fallback) → `useMovimentacoes({ produtoId })`; real quando sessão, mock no demo.
- `AjustarEstoqueModal` passa a usar `use-registrar-movimentacao` (§4) — comportamento idêntico, agora com `observacao` gravada.

## 6. Verificação (critério de aceite do PRD §5)

1. `npx tsc --noEmit` → **0 erros** (baseline atual; zero novos).
2. `npm run build` OK.
3. Banco (via MCP, se disponível): após criar 1 entrada pelo modal → `SELECT count(*) FROM est_movimentacao` = 1 e `me_produto.estoque_atual` ajustado; rollback de teste se necessário.
4. Smoke no console: sem erro de hooks (classe #310 — respeitar ordem de hooks em qualquer refactor).

## 7. Checklist de implementação

- [ ] `types/estoque.ts` criado; mock re-exporta; consumidores intactos
- [ ] `use-movimentacoes.ts` (leitura + mapper + fallback)
- [ ] `use-registrar-movimentacao.ts` (escrita compartilhada)
- [ ] `MovimentacoesPage` real + modal real + "Cancelar" removido
- [ ] Dashboard "recentes" real
- [ ] Detalhe do produto: aba real + modal no hook compartilhado
- [ ] tsc 0 novos · build OK · (opcional) prova no banco
