# SPEC — Dashboard CRM desmockado + mobile compactado

**Status:** WIRE aprovado por delegação do fundador (16/10/2026) — terceira tela que ele valida só no final. Guia de teste no fim.
**Espera-se:** `/crm/dashboard` com dados reais do banco (mesma empresa logada) e leitura mobile em cards menores, no padrão do `EstoqueDashboardPage`.

## Fonte de verdade
- **Arquivo:** `src/app/components/crm/CRMDashboardPage.tsx` (117 linhas) — REESCRITA da fonte de dados, PRESERVAÇÃO do layout desktop (header, dark card "Atenção", ListCard titles, Empty states existentes).
- **Dados reais disponíveis:**
  - `me_cliente` (empresa logada, `ativo` ≠ false) → total, ativos, recentes (order `criado_em` desc, 5).
  - `me_venda` (empresa logada) → soma por cliente para "total de compras" real na lista de recentes (se consulta simples: select cliente_id, valor e agrega client-side; se pesado, omitir coluna).
  - `crm_oportunidades` + `crm_etapas` → pipeline aberto (estagio não ganho/perdido), funil por etapa (nome/cor/posicao), atrasado (estagio_desde ≥ 7d), conversão (ganhas ÷ encerradas).
- **Hooks:** reusar `use-pipeline.ts` (já traz etapas + oportunidades + nomes de cliente) e `use-clientes.ts`/`use-clientes-lista.ts`. NOVO `use-dashboard-crm.ts` se precisar agregado dedicado (evitar carregar 2x: prefer derivar do use-pipeline e listar clientes com ele já presente).
- **Probabilidade segue heurística** `probabilidadePorPosicao` (EXPORTAR de use-pipeline para uso no dashboard).

## Mudanças de UI (fundador, 16/10)
- **Mobile:** KPIs em `grid-cols-2` (como estoque dash), cards compactos (`p-3 md:p-5`), textos menores no mobile; o seletor de período em cima vira linha própria ou inline compacto.
- **Desktop:** manter o layout atual (grid 1.45fr/0.75fr, colunas, dark card).
- Inspirar-se nos padrões do `EstoqueDashboardPage.tsx`: `grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4`, `p-4 md:p-6`, skeleton `animate-pulse` (min-height 44px nas ações).

## Regras
1. EU filtro por empresa logada (`useAuth()` → empresa.id) em TODAS as consultas.
2. Período (Todos/30d/90d): filtro client-side por `created_at` (clientes) e `estagio_desde` (negociac’veis). "Todos os dados" = default.
3. Estados: skeleton no carregando (grid KPIs + listas), erro com "Tentar de novo", vazios reais ("Nenhum cliente ainda" + CTA novo cliente; vazio no funil; escuro "Tudo em dia").
4. Não tocar: PipelinePage, AppLayout, hooks de oportunidade, use-etapas-pipeline, crmMockData (deixa de ser importado desta página — se ficar sem uso total, avisa no relatório; NÃO deletar).
5. Toasts/erros: mensagem real do Supabase.
6. PT-BR, TS sem any, lucide-react, `formatCurrency` existente.

## Checklist
- [ ] KPIs reais: total clientes, ativos, valor do pipeline aberto, conversão ganho/encerrado
- [ ] Funil por etapa com nome/cor de crm_etapas da empresa e valor real
- [ ] "Atenção" lista negociações atrasadas reais (estagio_desde ≥ 7d)
- [ ] Clientes recentes reais + (se barato) soma de compras por cliente
- [ ] Negociações ativas reais (5, probabilidade heurística)
- [ ] Mobile: KPIs 2 colunas compactos; desktop mantém
- [ ] Loading skeleton / erro retry / vazios com CTA
- [ ] npm build + tsc verdes
