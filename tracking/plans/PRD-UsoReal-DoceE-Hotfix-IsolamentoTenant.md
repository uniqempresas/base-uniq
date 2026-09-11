# PRD — Hotfix Uso Real Doceê: Isolamento de Tenant + Dados Reais (Itens 1–6)

> **Origem:** `tracking/USO_REAL_DOCEE.md` — primeiros 6 itens registrados no uso real pela Doceê em 10/09/2026.
> **Tipo:** Correção (hotfix) — não é funcionalidade nova. Não requer WIRE novo; segue a estrutura visual das telas existentes.
> **SPEC de execução:** `tracking/specs/SPEC-UsoReal-DoceE-Hotfix-IsolamentoTenant.md`

---

## 1. Objetivo

Eliminar o vazamento de dados entre empresas (multi-tenant) e garantir que o usuário logado veja **seus** dados reais em todas as telas — e nunca dados de outra empresa disfarçados de dados dele.

## 2. Problema (o que aconteceu no uso real)

A Doceê (esposa do fundador) criou uma conta nova, criou a empresa "Doceê" e ao entrar na Base UNIQ:

| # | Sintoma observado | Severidade |
|---|---|---|
| 1 | Tela de cadastro exibia como "exemplo" dados que parecem reais (e-mail pessoal do fundador, CPF completo) | Alta |
| 2 | Dashboard saudou "Boa noite, Usuário" em vez do nome dela | Média |
| 3 | Pedidos de **outra empresa** apareciam no Dashboard/Pedidos | **Crítica** |
| 4 | Produtos de **outra empresa** apareciam em Produtos | **Crítica** |
| 5 | Configurações mostrava dados mockados ("Loja da Maria") em vez dos dados reais da Doceê | Alta |
| 6 | Financeiro (Contas a pagar/receber) mostrava dados de **outra empresa** | **Crítica** |

> **Por que é crítico:** a proposta de valor da UNIQ é justamente "mostrar para onde o dinheiro está saindo". Se o cliente vê o financeiro de outra empresa, a confiança morre no primeiro uso. Em Suzano, cliente queimado não volta.

## 3. Causa-raiz (diagnosticada — ver SPEC para evidências arquivo:linha)

A cadeia de dados quebra em 4 pontos encadeados:

```
Login OK (supabase.auth funciona)
  → A) me_usuario.id ≠ auth.uid  OU  nome_usuario vazio  →  perfil = null
  → B) perfil null  →  empresa = null  (AuthContext)
  → C) empresa null  →  hooks fazem me_empresa LIMIT 1  →  pegam O OUTRO tenant e filtram por ele
  → D) tenant correto com 0 linhas (empresa nova)  →  hooks exibem mock estático global
       (dados da empresa fictícia "Loja da Maria") como se fossem dados reais
```

E há telas que **nunca passaram por hook nenhum** (mock puro, sem `empresa_id`, sem banco): Configurações (EmpresaPage, ContaPage), Dashboard financeiro, ProdutoDetalhePage.

A correção T2.6 (commit `3088ce7`) adicionou `.eq("empresa_id", ...)` em 6 hooks de leitura, mas **não** removeu os fallbacks que escolhem o tenant errado (C) nem o mock de outra empresa (D) — por isso o isolamento "concluído" ainda vazava no uso real.

## 4. Solução (o que este hotfix entrega)

1. **Fim do fallback de tenant errado:** remover o `me_empresa.limit(1)` de todos os hooks. Sem `empresa_id` autenticado ⇒ lista vazia + estado de erro explícito, nunca dado de outra empresa.
2. **Regra do mock redefinida:** mock só é exibido em **modo demo** (sem sessão autenticada) ou quando o banco **falha** (erro de rede) — e nesse caso **com badge "dados de exemplo"**. Usuário autenticado com empresa sem dados vê o **empty state real** ("Nenhum pedido cadastrado ainda"), nunca o mock de outra empresa.
3. **AuthContext resiliente:** se o lookup `me_usuario` por id falhar, tentar por e-mail; se falhar de novo, estado de erro explícito (não silencioso). `empresa` nunca fica null silenciosamente com sessão ativa.
4. **Nome do usuário:** Dashboard usa `perfil.nome_usuario` com fallbacks (`user_metadata.nome_completo` → prefixo do e-mail). Edge function `criar-conta` deve gravar `nome_usuario` em `me_usuario` (verificar e corrigir — ela está fora do repositório, no Supabase).
5. **Configurações integradas:** EmpresaPage lê/edita `me_empresa` do contexto (já carregado no login); ContaPage lê/edita `me_usuario`.
6. **Financeiro isolado:** hooks de contas corrigidos (sem `limit(1)`, sub-queries de cliente/fornecedor também filtradas por empresa) e `FinanceiroDashboardPage` passa a consumir os hooks.
7. **Cadastro:** placeholders trocados por dados claramente fictícios.
8. **ProdutoDetalhePage:** passa a usar o hook `useProduto` (banco) em vez de `PRODUTOS.find` (mock estático).

## 5. Escopo

### ✅ Dentro
- Itens 1–6 do `USO_REAL_DOCEE.md` (tabela acima).
- Correção estrutural nos hooks: `use-pedidos`, `use-pedido`, `use-produtos`, `use-produto`, `use-criar-pedido`, `use-atualizar-status-pedido`, `use-confirmar-pagamento`, `use-registrar-venda`, `use-criar-produto`, `use-atualizar-produto`, `use-contas-receber`, `use-contas-pagar`, `use-criar-conta-receber`, `use-criar-conta-pagar`, `use-atualizar-conta-receber`, `use-atualizar-conta-pagar`, `use-clientes`, `use-cliente`, `useConversasReais`.
- `AuthContext.tsx`, `DashboardPage.tsx`, `CadastroPage.tsx`, `EmpresaPage.tsx`, `ContaPage.tsx`, `FinanceiroDashboardPage.tsx`, `ProdutoDetalhePage.tsx`.
- Correção da edge function `criar-conta` no Supabase (fora do repo — ver SPEC).

### ❌ Fora de escopo
- Item 7 (DRE + Fluxo de Caixa reais) — PRD/SPEC próprios (`PRD-Financeiro-DRE-FluxoDeCaixa.md`).
- RLS/políticas de segurança no banco (pendência P5 do TRACKING — fase posterior, não bloqueia este hotfix porque o isolamento será feito no front).
- Tela `MovimentacoesPage` (mock puro) — não foi reportada no uso real; entra no backlog.
- Qualquer mudança visual/estrutural além dos estados empty/error/badge exigidos.

## 6. Stakeholders

- **Esposa do fundador (Doceê):** valida o uso real — é ela quem viu o financeiro de outra empresa.
- **Fundador:** aprova e valida mobile via Vercel.

## 7. Métricas de sucesso (critérios de aceite)

| # | Critério | Como validar |
|---|---|---|
| 1 | Cadastro mostra apenas placeholders claramente fictícios | Abrir `/cadastro` e inspecionar os placeholders |
| 2 | Dashboard saúda pelo nome real da usuária logada ("Boa noite, <nome>!") | Login com a conta da Doceê |
| 3 | Pedidos da Doceê mostra apenas pedidos da Doceê (vazio = empty state, não dado de terceiros) | Comparar com `me_venda` filtrado por `empresa_id` da Doceê |
| 4 | Produtos idem — sem produtos da outra empresa | Comparar com `me_produto` |
| 5 | Configurações exibe e edita os dados reais da empresa/usuária logados | Alterar um campo, recarregar, conferir no banco |
| 6 | Financeiro (receber/pagar/dashboard) exibe apenas contas da empresa logada | Comparar com `me_contas_*` |
| 7 | Build passa e deploy Vercel fica READY | `npm run build` + Vercel |

**Regra global de aceite:** em nenhuma tela, com sessão autenticada, pode aparecer dado de outro `empresa_id` — nem via query, nem via mock de fallback.

## 8. Riscos e observações

| Risco | Mitigação |
|---|---|
| Edge function `criar-conta` (fora do repo) pode ser a causa do nome vazio (item 2) — o front sozinho não resolve | SPEC traz passo de verificação via SQL/MCP e fallback defensivo no front |
| RLS está desabilitado em 54 tabelas (P5) | Este hotfix isola no front; RLS continua como pendência crítica separada |
| Remover o mock-fallback pode "esvaziar" telas na demo sem login | Mock continua em modo demo (sem sessão) — regra de mock-first de 07/09/2026 preservada |
| Hooks de escrita também usavam `limit(1)` — criar registro podia gravar no tenant errado | Incluídos no escopo do SPEC |
