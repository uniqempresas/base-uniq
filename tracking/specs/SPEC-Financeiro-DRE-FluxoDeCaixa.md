# SPEC — DRE Simples + Fluxo de Caixa Reais (Item 7)

> **PRD:** `tracking/plans/PRD-Financeiro-DRE-FluxoDeCaixa.md`
> **⚠️ Dependência obrigatória:** o hotfix de isolamento de tenant (`SPEC-UsoReal-DoceE-Hotfix-IsolamentoTenant.md`) DEVE estar concluído antes deste trabalho. Os hooks novos herdam o padrão de isolamento.
> **✅ WIRE:** as telas (DREPage, FluxoCaixaPage, FinanceiroDashboardPage) **já existem e foram aprovadas** — não há mudança de layout, apenas fonte de dados (mock → Supabase) + novos estados. Seguindo o precedente de `WIRE-Semana2-T2.7-FinanceiroBanco.md`, o delta está em **`tracking/wireframe/WIRE-UsoReal-DoceE-DRE-FluxoCaixa.md`** (já criado). Implementação de tela liberada.
> **Supabase oficial:** `krrkfgvdwhpelxtrdtla.supabase.co`

---

## 0. Contexto

- A Base UNIQ é multi-tenant: cada dados pertence a uma empresa (`empresa_id`).
- Hooks existentes (`useContasReceber`, `useContasPagar`) já leem do Supabase com fallback mock — o hotfix corrige o isolamento de tenant neles.
- As telas de DRE e Fluxo de Caixa são **100% mock** hoje (ver PRD §2).
- O `FinanceiroDashboardPage` consome mocks diretamente (sem hook).
- **Decisão de mock-first (07/09/2026):** hooks com fallback — tentam o banco; se vazio/erro, usam mock. O hotfix redefine: mock só em modo demo (sem sessão autenticada).

---

## 1. Verificação obrigatória antes de codar

Rodar estas queries no Supabase (MCP ou SQL editor) para confirmar o schema real:

```sql
-- 1. Existe me_itens_venda? Quais colunas?
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'me_itens_venda' ORDER BY ordinal_position;

-- 2. me_produto tem preco_custo?
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'me_produto' AND column_name LIKE '%custo%';

-- 3. Existe me_categoria? Quais registros?
SELECT * FROM me_categoria LIMIT 10;

-- 4. me_contas_pagar tem categoria_id?
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'me_contas_pagar' AND column_name LIKE '%categoria%';

-- 5. Dados reais da Doceê: quantas vendas e contas pagas existem?
SELECT count(*) AS vendas, sum(valor_total) AS total 
FROM me_venda WHERE status_venda = 'pago';

SELECT count(*) AS pagar_pagas, sum(valor_pago) AS total 
FROM me_contas_pagar WHERE status = 'pago' AND data_pagamento IS NOT NULL;

SELECT count(*) AS receber_pagas, sum(valor_pago) AS total 
FROM me_contas_receber WHERE status = 'pago' AND data_pagamento IS NOT NULL;
```

> **Se `me_itens_venda` não existir ou estiver vazia:** CMV = 0 neste fase. Mostrar nota visual: "Custo dos produtos não cadastrado".
> **Se `me_categoria` não existir:** usar `LEFT JOIN` na categoria de `me_contas_pagar` e agrupar por `descricao` truncada como proxy.
> **Se `preco_custo` não existir ou for 0:** CMV = 0 com a mesma nota.

---

## 2. Arquivos novos (hooks)

### 2.1 `src/app/hooks/use-dre.ts`

**Responsabilidade:** agregar dados do DRE para um período (mês) dado.

```ts
// Interface exportada
export interface DREData {
  periodo: string;              // "Março 2025"
  receitaBruta: number;         // Σ me_venda.valor_total (criado_em no mês, empresa_id)
  impostos: number;             // 0 (fixo — microempresas simples; campo visível para futura customização)
  receitaLiquida: number;       // receitaBruta - impostos
  custos: number;               // Σ (me_itens_venda.quantidade × me_produto.preco_custo) — CMV
  lucroBruto: number;           // receitaLiquida - custos
  despesasOperacionais: number; // Σ me_contas_pagar.valor_pago (data_pagamento no mês)
  lucroLiquido: number;         // lucroBruto - despesasOperacionais
  margemLucro: number;          // (lucroLiquido / receitaBruta) × 100
  categoriasDespesas: { nome: string; valor: number }[]; // agrupado por categoria
  cmvDisponivel: boolean;       // true se me_itens_venda + preco_custo existem
}

export function useDRE(periodo: string): {
  dre: DREData | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;          // true = mock (modo demo)
}
```

**Implementação:**

1. `useAuth()` → `empresa`, `session`.
2. **Guarda de sessão:** sem sessão → carregar `dreMock` (modo demo), `isFallback = true`.
3. **Guarda de empresa:** `empresa?.id` null → erro explícito, `dre = null`.
4. **Período → datas:** `"2025-03"` → `inicio = "2025-03-01"`, `fim = "2025-03-31"` (calcular último dia do mês).

**Queries (executar em paralelo com `Promise.all`):**

```ts
// A. Receita bruta
const { data: vendas } = await supabase
  .from("me_venda")
  .select("valor_total")
  .eq("empresa_id", empresaId)
  .gte("criado_em", inicio)
  .lte("criado_em", fim + "T23:59:59");

const receitaBruta = (vendas ?? []).reduce((s, v) => s + (v.valor_total ?? 0), 0);

// B. CMV (itens de venda × preco_custo) — SO se me_itens_venda existir
let custos = 0;
let cmvDisponivel = false;
try {
  const { data: itensVenda } = await supabase
    .from("me_itens_venda")
    .select("quantidade, preco_unitario, produto_id, venda_id");
  
  // Buscar venda_ids do período
  const vendaIds = (vendas ?? []).map(v => v.id); // ← precisa select("id, valor_total") na query A
  
  const itensDoPeriodo = (itensVenda ?? []).filter(i => vendaIds.includes(i.venda_id));
  
  if (itensDoPeriodo.length > 0) {
    cmvDisponivel = true;
    const produtoIds = [...new Set(itensDoPeriodo.map(i => i.produto_id).filter(Boolean))];
    
    const { data: produtos } = await supabase
      .from("me_produto")
      .select("id, preco_custo")
      .in("id", produtoIds)
      .eq("empresa_id", empresaId);
    
    const custoMap = new Map((produtos ?? []).map(p => [p.id, p.preco_custo ?? 0]));
    
    custos = itensDoPeriodo.reduce((s, i) => {
      const custoUnit = custoMap.get(i.produto_id) ?? 0;
      return s + (i.quantidade * custoUnit);
    }, 0);
  }
} catch {
  // me_itens_venda não existe ou erro — CMV fica 0
  cmvDisponivel = false;
}

// C. Despesas operacionais
const { data: contasPagar } = await supabase
  .from("me_contas_pagar")
  .select("valor_pago, categoria_id, descricao")
  .eq("empresa_id", empresaId)
  .eq("status", "pago")
  .not("data_pagamento", "is", null)
  .gte("data_pagamento", inicio)
  .lte("data_pagamento", fim);

const despesasOperacionais = (contasPagar ?? []).reduce((s, c) => s + (c.valor_pago ?? 0), 0);

// C2. Agrupar despesas por categoria
// Se me_categoria existir: JOIN. Se não, agrupar por descricao.
const categoriasDespesas = agruparDespesasPorCategoria(contasPagar ?? []);
```

**Função auxiliar `agruparDespesasPorCategoria`:**
- Se `me_categoria` existe: buscar categorias (`SELECT id, nome FROM me_categoria WHERE empresa_id = X`), fazer join em memória.
- Se não existe: agrupar por `descricao` (primeiras 2 palavras como nome da categoria) e somar valores.
- Retornar `{ nome: string; valor: number }[]` ordenado por valor desc.

**Cálculos finais:**
```ts
const receitaLiquida = receitaBruta - impostos; // impostos = 0
const lucroBruto = receitaLiquida - custos;
const lucroLiquido = lucroBruto - despesasOperacionais;
const margemLucro = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;
```

**Fallback mock:** se `!session` → `return { dre: dreMock, isFallback: true, ... }`.

---

### 2.2 `src/app/hooks/use-fluxo-caixa.ts`

**Responsabilidade:** agregar entradas (contas recebidas) e saídas (contas pagas) para o Fluxo de Caixa.

```ts
export interface MovimentacaoFluxo {
  id: string;
  descricao: string;
  tipo: "entrada" | "saida";
  valor: number;
  data: string;         // ISO date
  categoria: string;    // nome da categoria ou descrição
  status: "pago" | "pendente" | "vencido";
  pessoa?: string;      // cliente ou fornecedor
  origem: "conta_receber" | "conta_pagar" | "venda"; // rastreabilidade
  origemId: string;     // id do registro de origem (para edição/exclusão)
}

export function useFluxoCaixa(periodo: string): {
  movimentacoes: MovimentacaoFluxo[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  saldoInicial: number;   // soma de (entradas - saídas) ANTERIORES ao período
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
  criarMovimentacao: (mov: Omit<MovimentacaoFluxo, "id">) => Promise<{ error?: string }>;
  editarMovimentacao: (id: string, dados: Partial<MovimentacaoFluxo>) => Promise<{ error?: string }>;
  excluirMovimentacao: (id: string, origem: MovimentacaoFluxo["origem"]) => Promise<{ error?: string }>;
}
```

**Queries:**

```ts
const empresaId = empresa!.id; // guardado acima

// 1. Entradas: me_contas_receber pagas no período
const { data: receber } = await supabase
  .from("me_contas_receber")
  .select("id, descricao, valor_pago, data_pagamento, status, cliente_id, empresa_id")
  .eq("empresa_id", empresaId)
  .eq("status", "pago")
  .not("data_pagamento", "is", null)
  .gte("data_pagamento", inicio)
  .lte("data_pagamento", fim);

// 2. Saídas: me_contas_pagar pagas no período
const { data: pagar } = await supabase
  .from("me_contas_pagar")
  .select("id, descricao, valor_pago, data_pagamento, status, fornecedor_id, empresa_id")
  .eq("empresa_id", empresaId)
  .eq("status", "pago")
  .not("data_pagamento", "is", null)
  .gte("data_pagamento", inicio)
  .lte("data_pagamento", fim);

// 3. Saldo inicial: soma de (entradas - saídas) ANTERIORES ao início do período
const [{ data: receberAnterior }, { data: pagarAnterior }] = await Promise.all([
  supabase.from("me_contas_receber")
    .select("valor_pago")
    .eq("empresa_id", empresaId).eq("status", "pago")
    .not("data_pagamento", "is", null)
    .lt("data_pagamento", inicio),
  supabase.from("me_contas_pagar")
    .select("valor_pago")
    .eq("empresa_id", empresaId).eq("status", "pago")
    .not("data_pagamento", "is", null)
    .lt("data_pagamento", inicio),
]);

const saldoInicial = (receberAnterior ?? []).reduce((s, r) => s + (r.valor_pago ?? 0), 0)
                   - (pagarAnterior ?? []).reduce((s, p) => s + (p.valor_pago ?? 0), 0);
```

**Mapeamento para `MovimentacaoFluxo`:**
- Entradas: `origem = "conta_receber"`, `pessoa` = buscar `me_cliente.nome_cliente` pelo `cliente_id` (query batch com `.in("id", clienteIds)`)
- Saídas: `origem = "conta_pagar"`, `pessoa` = buscar `me_fornecedor.nome_fantasia` pelo `fornecedor_id` (query batch com `.in("id", fornecedorIds)`)

**CRUD:**
- `criarMovimentacao`: se `tipo === "entrada"` → INSERT em `me_contas_receber` (campos obrigatórios: `empresa_id`, `descricao`, `valor`, `data_vencimento = data`, `status = "pago"`, `data_pagamento = data`). Se `tipo === "saida"` → INSERT em `me_contas_pagar` (idem). Campos `cliente_id`/`fornecedor_id` opcionais (null).
- `editarMovimentacao`: UPDATE no registro de origem (`me_contas_receber` ou `me_contas_pagar`) por `origemId`.
- `excluirMovimentacao`: DELETE do registro de origem. Confirmar com `window.confirm` antes.

**Fallback mock:** sem sessão → `movimentacoesMock` de `mockData.ts`, `isFallback = true`.

---

### 2.3 `src/app/hooks/use-financeiro-dashboard.ts`

**Responsabilidade:** agregar dados para o Dashboard financeiro (KPIs + alertas + próximas contas + últimas movimentações).

```ts
export interface FinanceiroDashboard {
  saldoProjetado: number;
  totalEntradasMes: number;
  totalSaidasMes: number;
  lucroMes: number;
  isLucro: boolean;
  contasVencidasPagar: number;
  contasAtrasadasReceber: number;
  proximasContasPagar: Array<{
    id: string;
    descricao: string;
    fornecedor: string;
    valor: number;
    diasRestantes: number;
  }>;
  ultimasMovimentacoes: Array<{
    id: string;
    descricao: string;
    tipo: "entrada" | "saida";
    valor: number;
    data: string;
    categoria: string;
  }>;
}

export function useFinanceiroDashboard(): {
  dashboard: FinanceiroDashboard | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}
```

**Implementação:** reutilizar os hooks `useDRE` e `useFluxoCaixa` (mês atual como período), mais queries de alertas:

```ts
const mesAtual = new Date().toISOString().slice(0, 7); // "2025-09"
const { dre } = useDRE(mesAtual);
const { movimentacoes, saldoInicial, totalEntradas, totalSaidas, saldoFinal } = useFluxoCaixa(mesAtual);

// Alertas: contas a pagar vencidas
const { data: vencidas } = await supabase
  .from("me_contas_pagar")
  .select("id")
  .eq("empresa_id", empresaId).eq("status", "vencido");

// Contas a receber atrasadas
const { data: atrasadas } = await supabase
  .from("me_contas_receber")
  .select("id")
  .eq("empresa_id", empresaId).eq("status", "vencido");

// Próximas 7 dias
const hoje = new Date().toISOString().slice(0, 10);
const daqui7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
const { data: proximas } = await supabase
  .from("me_contas_pagar")
  .select("id, descricao, valor, data_vencimento, fornecedor_id")
  .eq("empresa_id", empresaId).eq("status", "pendente")
  .gte("data_vencimento", hoje).lte("data_vencimento", daqui7)
  .order("data_vencimento", { ascending: true });
```

**Fallback mock:** sem sessão → cálculos sobre `movimentacoesMock`/`contasPagarMock`/`contasReceberMock`/`dreMock` (mesmo padrão atual do `FinanceiroDashboardPage.tsx:28-68`, mas encapsulado no hook).

---

## 3. Mapeamento de campos (mock → banco)

| Campo visual (atual) | Fonte mock | Fonte banco |
|---|---|---|
| `dre.receitaBruta` | `dreMock.receitaBruta` | `SUM(me_venda.valor_total)` WHERE `criado_em` no mês AND `empresa_id` |
| `dre.impostos` | `dreMock.impostos` | `0` (fixo) |
| `dre.custos` | `dreMock.custos` | `SUM(me_itens_venda.quantidade × me_produto.preco_custo)` |
| `dre.despesasOperacionais` | `dreMock.despesasOperacionais` | `SUM(me_contas_pagar.valor_pago)` WHERE `data_pagamento` no mês |
| `dre.categoriasDespesas` | `dreMock.categoriasDespesas` | `GROUP BY categoria_id` (ou `descricao` se `me_categoria` não existir) |
| `mov.data` | `movimentacoesMock[].data` | `me_contas_receber.data_pagamento` / `me_contas_pagar.data_pagamento` |
| `mov.categoria` | `movimentacoesMock[].categoria` | `me_categoria.nome` (ou `descricao` truncada) |
| `mov.pessoa` | `movimentacoesMock[].pessoa` | `me_cliente.nome_cliente` / `me_fornecedor.nome_fantasia` |
| `saldoInicial` | `3500` hardcoded | `SUM(entradas_anteriores) - SUM(saídas_anteriores)` |
| `totalPagar` | `contasPagarMock` filtrado | `SUM(me_contas_pagar.valor)` WHERE `status = 'pendente'` |
| `totalReceber` | `contasReceberMock` filtrado | `SUM(me_contas_receber.valor)` WHERE `status = 'pendente'` |

---

## 4. Arquivos modificados (telas — WIRE delta aprovado, layout preservado)

> As 3 telas já existem e foram aprovadas. O WIRE delta (`tracking/wireframe/WIRE-UsoReal-DoceE-DRE-FluxoCaixa.md`) cobre apenas fonte de dados + novos estados — **sem mudança de layout**. Nenhum bloqueio WIRE pendente.

| Arquivo | Mudança | Bloqueio WIRE |
|---|---|---|
| `src/app/components/financeiro/DREPage.tsx` | Substituir `dreMock` por `useDRE(periodo)` + estados (loading/empty/error/demo) + botão PDF desabilitado | Não — layout inalterado (WIRE delta) |
| `src/app/components/financeiro/FluxoCaixaPage.tsx` | Substituir `movimentacoesMock` por `useFluxoCaixa(periodo)` + CRUD real (Supabase) | Não — layout inalterado (WIRE delta) |
| `src/app/components/financeiro/FinanceiroDashboardPage.tsx` | Substituir 4 imports de mock por `useFinanceiroDashboard()` | Não — layout inalterado (WIRE delta). ⚠️ Também tocada pelo hotfix (§8) — item 7 só implementa APÓS o hotfix |
| `src/app/components/financeiro/components.tsx` | Nenhuma mudança (CardKPI, AlertaAmigavel já genéricos) | NÃO |
| `src/app/components/financeiro/mockData.ts` | Manter como fallback de modo demo | NÃO |

---

## 5. Estados visuais (Definition of Done para as telas)

| Estado | DRE | Fluxo de Caixa | Dashboard |
|---|---|---|---|
| **Loading** | Skeleton nos 4 KPIs + skeleton na tabela DRE + skeleton nos gráficos | Skeleton nos 4 KPIs + skeleton na tabela de movimentações + skeleton no gráfico de linha | Skeleton nos 4 KPIs + skeleton nas listas |
| **Empty (banco vazio, sessão ativa)** | "Nenhuma venda ou despesa registrada neste mês. Cadastre pedidos e contas para ver seu DRE." | "Nenhuma movimentação registrada neste período. Clique em 'Nova movimentação' para começar." | KPIs zerados + "Nenhum dado financeiro disponível" |
| **Empty (modo demo)** | Badge "dados de exemplo" + dados do mock | Badge "dados de exemplo" + dados do mock | Badge "dados de exemplo" |
| **Error** | "Erro ao carregar dados financeiros. Tente novamente." + botão retry | Idem | Idem |
| **Success** | Dados reais do banco | Dados reais do banco | Dados reais do banco |

**Nota sobre "Exportar PDF":** botão mantido na DRE mas desabilitado com tooltip "Em breve". Não implementar geração de PDF neste fase.

---

## 6. Checklist

- [ ] Verificação de schema (§1) executada e resultados documentados
- [ ] `src/app/hooks/use-dre.ts` criado
- [ ] `src/app/hooks/use-fluxo-caixa.ts` criado (com CRUD)
- [ ] `src/app/hooks/use-financeiro-dashboard.ts` criado
- [ ] Todos os hooks usam `useAuth()` + `empresa.id` (sem `limit(1)`, sem mock de outra empresa)
- [ ] Fallback mock só em modo demo (sem sessão)
- [x] WIRE delta criado e aprovado (`tracking/wireframe/WIRE-UsoReal-DoceE-DRE-FluxoCaixa.md` — telas já existiam)
- [ ] DREPage.tsx integrada ao hook
- [ ] FluxoCaixaPage.tsx integrada ao hook + CRUD real
- [ ] FinanceiroDashboardPage.tsx integrada ao hook
- [ ] CMV tratado com fallback visual quando `me_itens_venda` ou `preco_custo` ausente
- [ ] Estados loading/empty/error/success em todas as telas
- [ ] Isolamento por empresa verificado (Doceê vs empresa demo)
- [ ] `npm run build` passa
- [ ] Deploy Vercel READY
- [ ] Marcar item 7 como ✅ no `tracking/USO_REAL_DOCEE.md` (após validação do fundador)

## 7. O que NÃO fazer

- Não criar tabelas novas (usar as que existem; `me_movimentacao` não existe e não deve ser criada — Fluxo deriva de `me_contas_receber`/`me_contas_pagar`).
- Não implementar exportação PDF (botão desabilitado com tooltip).
- Não alterar `mockData.ts` — ele continua como fallback de modo demo.
- Não alterar `components.tsx` (CardKPI, AlertaAmigavel) — já são genéricos.
- Não fazer migrations de banco sem autorização do fundador.
- Não migrar para Next.js.
