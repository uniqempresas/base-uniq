# SPEC — Produção Fase 2: Compras + Custo Médio + Conta a Pagar

**Data:** 06/10/2026 · **PRD:** `tracking/plans/PRD-Producao-BOM-Fase2-ComprasCusto.md` · **WIRE:** `tracking/wireframe/WIRE-Producao-Fase2-Compras.md`

> **APROVAÇÃO:** WIRE v1.1 aprovado pelo fundador em 06/10/2026, com emenda **D11** no modal
> "Nova Compra": 3 modos — (a) *Já recebi agora* (cria a compra e imediatamente chama
> `receber_compra` com data de recebimento = hoje e vencimento da conta informado);
> (b) *Agendar* (grava `data_prevista`, compra nasce PENDENTE e a data aparece na
> lista/card); (c) *Só registrar* (padrão `PENDENTE` puro).

---

## 1. Fonte da verdade — o que foi verificado no banco/código (06/10/2026, MCP + recon)

**`est_compra` (existe no banco, ociosa — JAMAIS inferir):**
- `id uuid PK gen_random_uuid()` · `empresa_id uuid NOT NULL FK me_empresa CASCADE` · `fornecedor_id uuid NOT NULL FK me_fornecedor CASCADE` · `data_compra timestamptz NOT NULL default now()` · `status text NOT NULL default 'PENDENTE'` **CHECK maiúsculo `('PENDENTE','RECEBIDO','CANCELADO')`** (constr. `est_compra_status_check` — confirmada por pg_constraint) · `valor_total numeric default 0` · `nota_fiscal text` · `data_recebimento date` (não usada ainda) · `created_at timestamptz`.

**`est_compra_item` (ociosa):** `id uuid PK` · `compra_id uuid NOT NULL FK est_compra CASCADE` · `produto_id integer NOT NULL FK me_produto CASCADE` · `quantidade numeric NOT NULL` · `valor_unitario numeric NOT NULL` · `created_at`. **Sem UNIQUE (compra, produto)** e **sem campos de conversão** — a RPC guardará duplicidade e a conversão vem do produto (D6).

**`me_contas_pagar` (viva):** `empresa_id` · `fornecedor_id` (null OK) · `descricao varchar NOT NULL` · `valor numeric NOT NULL` · `data_vencimento date NOT NULL` · `data_pagamento` · `valor_pago` · `status varchar default 'pendente'` (`pendente|pago|cancelado`; `vencido` é derivado) · `forma_pagamento` · `conta_id` (conta bancária) · `categoria_id` → `me_categoria_financeira` · `observacoes`. **Sem referência a compra** → coluna nova (§2). Contrato de escrita hoje: `use-criar-conta-pagar.ts:100-114` (INSERT client-side, `status:'pendente'`), `use-contas-pagar.ts:106-166` (leitura + resolve fornecedor/categoria).

**Padrões a seguir:** RPC SECURITY DEFINER + `search_path` fixo + retorno jsonb (padrão `registrar_venda` — `20260923000000_…sql:70-366`, inclusive find-or-create de categoria **best-effort** que nunca derruba a operação); hooks Supabase com demo mode reflexivo e erros em string; telas do padrão `ProdutosPage`/`ContasPagarPage` (modais fora de gate de loading — HOTFIX de 06/10).

## 2. Migrations (2 arquivos)

### 2.1 `20261006140000_producao_fase2_compra_conversao.sql`

```sql
-- Conversão de embalagem no cadastro do insumo (PRD D6)
ALTER TABLE me_produto
  ADD COLUMN IF NOT EXISTS unidade_compra text,          -- ex.: 'kg','lata','caixa' | NULL = compra na unidade do estoque
  ADD COLUMN IF NOT EXISTS fator_conversao numeric;      -- ex.: 1000 (1 kg = 1000 g) | NULL = 1
ALTER TABLE me_produto
  DROP CONSTRAINT IF EXISTS me_produto_fator_conversao_check;
ALTER TABLE me_produto
  ADD CONSTRAINT me_produto_fator_conversao_check
  CHECK (fator_conversao IS NULL OR fator_conversao > 0);

-- Vinculação compra → conta a pagar (PRD D8)
ALTER TABLE me_contas_pagar
  ADD COLUMN IF NOT EXISTS compra_id uuid REFERENCES est_compra(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_contas_pagar_compra ON me_contas_pagar (compra_id);

-- Emenda D11 (WIRE v1.1): data prevista de recebimento (compra agendada)
ALTER TABLE est_compra
  ADD COLUMN IF NOT EXISTS data_prevista date;

-- Integridade da compra
CREATE INDEX IF NOT EXISTS idx_est_compra_empresa_status ON est_compra (empresa_id, status);
ALTER TABLE est_compra_item
  DROP CONSTRAINT IF EXISTS est_compra_item_check_positivo;
ALTER TABLE est_compra_item
  ADD CONSTRAINT est_compra_item_check_positivo
  CHECK (quantidade > 0 AND valor_unitario >= 0);
```

> Sem CHECK novo em `est_compra.status` — o maiúsculo vigente prevalece. O app grava/grava os literais `'PENDENTE'`/`'RECEBIDO'`/`'CANCELADO'` (constantes TS centralizadas em `types/producao.ts`).

### 2.2 `20261006141000_producao_fase2_receber_compra.sql` — RPC (SECURITY DEFINER)

```sql
receber_compra(
  p_empresa_id uuid,
  p_compra_id uuid,
  p_data_recebimento date,       -- data de negócio (status do est_movimentacao)
  p_data_vencimento date,        -- vencimento da conta a pagar
  p_usuario_id uuid              -- auth.uid() do chamador (para est_movimentacao.usuario_id)
) → jsonb { success, movimentacoes_criadas, conta_pagar_id, custo_aplicados [{produto_id, custo_medio}] }
```

Execução transacional (qualquer falha → rollback e `{success:false,error,detail}` no padrão registrar_venda):
1. **Guardas:** compra existe e é da `p_empresa_id`; status = `'PENDENTE'` (já recebida → erro claro; cancelada → erro); 1+ itens; itens da MESMA empresa (JOIN guard). Idempotência: é a guarda de status que protege (a fase não faz "receber 2×").
2. **Por item:** `qtd_estoque = quantidade × COALESCE(fator_conversao, 1)` →
   - `me_produto`: `estoque_atual = estoque_atual + qtd_estoque` (exact,                                                                                                                                                                                                                                                                                                caa_unidade);
   - **custo médio ponderado móvel** (D9): `custo_item = valor_unitario ÷ COALESCE(fator_conversao, 1)`;
     `custo_novo = (estoque_antes × COALESCE(preco_custo,0) + qtd_estoque × custo_item) ÷ (estoque_antes + qtd_estoque)` → grava em `preco_custo`;
   - **`est_movimentacao`:** INSERT `tipo='entrada'`, `quantidade = qtd_estoque`, `motivo='Compra'`, `observacao = 'Compra Valor unitário'` ou `"Compra NF <nota_fiscal>"`, `usuario_id = p_usuario_id`, `data_movimentacao = p_data_recebimento::timestamptz`.
3. **Conta a pagar** (uma por compra, D8): INSERT `me_contas_pagar` com `empresa_id`, `fornecedor_id`, `descricao = 'Compra NF <nota>' ou 'Compra <fornecedor> em <data>'`, `valor = SUM(itens) (coerente com est_compra.valor_total — atualiza o pai se divergente)`, `data_vencimento = p_data_vencimento`, **`status='pendente'`**, `compra_id`, `categoria_id` **best-effort**: find-or-create categoria `me_categoria_financeira` tipo `'mercadoria'` nome `'Insumos / Matéria-prima'` (padrão `fn_categoria_vendas` — falha não derruba).
4. **Fechamento:** `UPDATE est_compra SET status='RECEBIDO', data_recebimento=p_data_recebimento, valor_total=<somatório>`.
5. `REVOKE EXECUTE ... FROM anon` + `search_path` fixo (padrão F1/registrar_venda).

**Não faz:** explosão de ficha, custo de semiáreas aninhados (F3), CMV/DRE (F4).

## 3. Tipos — `src/app/types/producao.ts` (extensão) + `types/estoque.ts`

```ts
// producao.ts (extensão)
ESTADO_COMPRA = { PENDENTE: "PENDENTE", RECEBIDO: "RECEBIDO", CANCELADO: "CANCELADO" } (constante literal CHECK)

export interface ItemFichaTécnicaCompra {
  produtoId: string;
  nome; sku; unidadeEstoque;
  unidadeCompra?: string | null;   // me_produto.unidade_compra
  fatorConversao?: number | null;  // me_produto.fator_conversao
  quantidade: number;              // na unidade de COMPRA (o que o fornecedor entrega)
  valorUnitario: number;           // na unidade de COMPRA
}

export interface Compra {
  id: string;
  fornecedorId; fornecedorNome;
  status: "PENDENTE" | "RECEBIDO" | "CANCELADO";
  dataCompra: string;              // ISO
  dataRecebimento?: string | null;
  valorTotal: number;
  notaFiscal?: string | null;
  itens: ItemCompra[];
}

// 具体 estoque.ts (extensão)
export interface Movimentacao {
  ...
  unidadeContexto?: string;  // opcional para exibição futura; NÃO obrigatório nesta fase
}
```

- `types/produto.ts` `Produto` ganha `unidadeCompra?: string | null` e `fatorConversao?: number | null` (mapper: `?? null`).

## 4. Hooks (todos novos, padrão F1: demo reflexivo, erros em string)

| Hook | Contrato |
|---|---|
| `use-compras.ts` (NOVO) | Leitura: `est_compra` select com embed `me_fornecedor(nome_fornecedor)` e `est_compra_item(produto_id, quantidade, valor_unitario, me_produto(nome_produto, sku, unidade, unidade_compra, fator_conversao))`, `.eq("empresa_id")`, order `data_compra desc`. Sessão → mock vazio + `isFallback` (compras é funcionalidade nova — sem mock, disciplina da ficha) |
| `use-criar-compra.ts` (NOVO) | INSERT pai + itens client-side em 2 passos (pegar id do pai → inserir itens). `status:'PENDENTE'`, `valor_total` somado no cliente com revalidação server-side pela RPC no receber. Grava `data_prevista` quando agendada (D11). Recusa: fornecedor obrigatório · 1+ itens · quantidade > 0 · valor ≥ 0 · `unidade_compra` exige `fator_conversao` |
| `use-receber-compra.ts` (NOVO) | Chama RPC `receber_compra`; mapa de SQLSTATE (23503/23514/42501/P0001) igual `use-ficha-tecnica.ts:50-64` |
| `use-cancelar-compra.ts` (NOVO) | UPDATE `status='CANCELADO'` permitido só de PENDENTE e com `.eq("empresa_id")` |
| `use-atualizar-produto.ts` | Payload estendido: grava `unidade_compra`/`fator_conversao` (sempre — null limpa) |
| `use-produtos.ts` / `use-produto.ts` | SELECT passa a incluir as 2 colunas novas; mapper replica |

## 5. UI

### 5.1 `ProdutoFormModal.tsx` — "Compra e conversão" (step 1)
- **Extração linear, máximo direito:** só aparece quando `natureza === 'insumo'` (insumo vende — commodity comprada).
- Campos: "Http showcase" (ou	else: "Compre por:"…), no chapéu "Compra e conversão" — resumo visível: "No estoque você usa g · compra por kg · 1 kg = 1.000 g".
- Campos: `unidade_compra` (text curto: kg, g, lata, caixa, L, ml, un, pacote… com datalist das unidades comuns) e `fator_conversao` (number > 0). Vazio = compra direto na unidade do estoque.
- Se `unidade_compra` preenchida e `fator` vazio → erro inline "Informe quantas unidades de estoque tem 1 <unidadeCompra>".
- rascunho: persiste junto com o payload existente (`use-atualizar-produto/use-criar-produto`) — nada de estado novo no form raiz (padrão fichaRascunho evitado).

### 5.2 `ComprasPage.tsx` (NOVA, `/estoque/compras` — grupo Estoque em `routes.tsx:89-95`)
- Esqueleto `ProdutosPage`/`ContasPagarPage`: modifiers no topo, derivados `useMemo`, early-return skeleton/erro, **modais fora de gate de loading**, toasts sonner.
- **KPIs:** Em aberto (conta $ pendente) · Recebido no mês · Itens faltantes (relação estoque_atual × estoque_minimo — derrota simples para "o que comprar").
- **Lista de compras desktop em TABELA** (desktop) / lista de cards (mobile BREAK de bottom-sheet — idem ContasPagarPage):
  - colunas: Data de compra · Fornecedor · NF · Valor · Itens-n · Status badge (`PENDENTE` âmbar · `RECEBIDO` está · `CANCELADO` vaz ) · ações (Receber / Cancelar / Detalhe).
- **Nova compra:** formulário de modal, 2 seções (WIRE v1.1 — emenda D11):
  a. **Fornecedor:** select obrigatório com busca — nenhum fornecedor cadastrado → bloqueio suave com CTA para módulo fornecedores.
  b. **Itens:** adiciona insumos (`natureza='insumo'`, mesma busca client-side da ficha técnica — `useProdutos()` filtrado); linha mostra a conversão em tempo real ("2 kg = 2.000 g ao estoque"); total no rodapé.
  c. **Quando recebe?** (radios): *Agora* (grava compra → chama `receber_compra` na sequência: data de hoje + vencimento informado = compra já nasce RECEBIDO, com toast do custo médio) · *Agendar* (grava `data_prevista`; compra nasce PENDENTE com a data exibida na lista) · *Só registrar* (padrão).
- **Receber compra:** modal com data de recebimento (default hoje) **+ data de vencimento da conta** (default hoje +30) — dispara RPC; toast único: "Compra recebida — estoque +X · custo médio R$ y · conta a pagar criada".
- **Bottom-sheet mobile** (reus产值 `components.tsx` do Financeiro: `BottomSheet`, `campoFormSheet`, `SheetActions`).

### 5.3 Navegação
- `routes.tsx`: `{ path: "/estoque/compras", lazy: pagina(..., "ComprasPage") }` no grupo Estoque (:89-95).
- `AppLayout.tsx:105-115` rail grupo "estoque": item "Compras" (ícone `ShoppingCart`) — junto aos itens atuais do grupo.

### 5.4 Consumidores — sem mudanças
| Ponto | Mudança |
|---|---|
| Financeiro (todas as telas) | ZERO código novo — conta nasce normalmente em `me_contas_pagar` |
| Vitrine/checkout · PDV · mocks | ZERO mudança |
| `ProdutoDetalhePage` | (opcional pós-wire) nota de conversão no bloco de estoque: "compra por kg = 1.000 g" |

## 6. Verificação

1. `npx tsc --noEmit` → 0 erros novos · `npm run build` OK.
2. **Prova de custo (aceite #2/SQL):** antes/depois do receber — SELECT estoque e preco_custo do insumo: compra de 2000 g a R$ 0,05/g sobre estoque 1000 g a R$ 0,04/g ⇒ `custo = (1000×0.04 + 2000×0.05)/3000 = R$ 0,0467/g` (pouca ar);
   conta criada: SELECT me_contas_pagar WHERE compra_id → 1 linha, status pendente, valor coerente. Tudo com ROLLBACK.
3. **Prova transacional:** simular item de outra empresa → RPC retorna erro e NADA muda (status continua PENDENTE).
4. Idempotência: segunda chamada de receber → erro claro ("compra já foi recebida").
5. Deploy Vercel READY · validação do fundador no celular.

## 7. Checklist

- [ ] Migration 2.1 aplicada (colunas de conversão + compra_id + índices) e verificada por query
- [ ] RPC `receber_compra` aplicada + REVOKE anon
- [ ] Provas SQL do §6.2/§6.3/§6.4 executadas
- [ ] Tipos + 2 colunas em Produto + hooks (criar/atualizar produto grava conversão)
- [ ] `ProdutoFormModal` com grupo "Compra e conversão" (só insumo)
- [ ] `ComprasPage` + rota + item da rail + lista real + modal nova compra + receber (RPC) + cancelar
- [ ] Estados loading/empty/error/success em todas as novas incluido
- [ ] tsc 0 · build OK · deploy Vercel READY · fundador validou
