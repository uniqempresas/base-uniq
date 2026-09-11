# SPEC — Hotfix Uso Real Doceê: Isolamento de Tenant + Dados Reais (Itens 1–6)

> **PRD:** `tracking/plans/PRD-UsoReal-DoceE-Hotfix-IsolamentoTenant.md`
> **Origem dos bugs:** `tracking/USO_REAL_DOCEE.md` (itens 1–6, uso real 10/09/2026)
> **Audiência:** agente implementador SEM o contexto desta investigação. Cada seção tem a causa, o código atual (arquivo:linha) e a correção esperada.
> **Supabase oficial:** `krrkfgvdwhpelxtrdtla.supabase.co` (já configurado em `src/lib/supabase.ts` — NÃO alterar).

---

## 0. Contexto mínimo que você precisa saber

- App **Vite + React** multi-tenant. Cada usuário pertence a uma empresa (`me_usuario.empresa_id` → `me_empresa.id`).
- O `AuthContext` (`src/app/contexts/AuthContext.tsx`) expõe `{ user, session, perfil, empresa, loading }` via `useAuth()`.
- **Decisão de arquitetura vigente (07/09/2026):** hooks com *fallback* — tentam o banco; se vazio/erro, usam mock para a demo nunca ficar em branco. **Este hotfix redefine essa regra:** mock só vale para **modo demo (sem sessão real)**; com sessão autenticada, dado de outra empresa NUNCA pode aparecer.
- RLS está desabilitado no banco (pendência P5) — o isolamento é 100% responsabilidade do front nesta fase.

---

## 1. Diagnóstico (causa-raiz com evidências)

A cadeia quebra em 4 pontos encadeados. Todo vazamento observado deriva daqui:

### QUEBRA A — Perfil não carrega → `perfil = null`

`AuthContext.tsx:73-82` — busca `me_usuario` por `.eq("id", userId)` onde `userId = auth.users.id`:

```ts
const { data: perfil, error: perfilError } = await supabase
  .from("me_usuario")
  .select("id, nome_usuario, email, cargo, role, ativo, empresa_id")
  .eq("id", userId)
  .maybeSingle();

if (perfilError || !perfil) {
  console.error("[AuthContext] Erro ao carregar perfil:", perfilError);
  return { perfil: null, empresa: null };
}
```

Se a edge function `criar-conta` (que cria o usuário — **ela NÃO está neste repositório**, fica no Supabase) não gravar `me_usuario.id = auth.uid`, ou gravar `nome_usuario` vazio, o perfil vem `null`/incompleto. Sintoma no uso real: **"Boa noite, Usuário"** (item 2).

### QUEBRA B — Empresa nula

`AuthContext.tsx:84-97` — empresa só carrega se `perfil.empresa_id` existir. Perfil null ⇒ empresa null.

### QUEBRA C — Hooks pegam o tenant errado

Com `empresa = null`, os hooks fazem fallback para **a primeira empresa da tabela** — o outro tenant. Exemplo em `use-pedidos.ts:135-147`:

```ts
// Busca empresa_id do contexto ou primeira disponível
let empresaId = empresa?.id;

if (!empresaId) {
  const { data: empresas } = await supabase
    .from("me_empresa")
    .select("id")
    .limit(1);

  if (empresas && empresas.length > 0) {
    empresaId = empresas[0].id;   // ← OUTRA EMPRESA
  }
}
```

A query então filtra `.eq("empresa_id", empresaId)` (linha 155-157) — filtro "correto" aplicado sobre o **tenant errado**. Sintomas: itens 3, 4 e 6 (pedidos, produtos e financeiro de outra empresa).

### QUEBRA D — Mock global exibido como dado real

Empresa nova tem 0 linhas ⇒ hook substitui a lista pelo mock estático global (dados da empresa fictícia "Loja da Maria"). `use-pedidos.ts:165-170`:

```ts
if (vendasValidas.length === 0) {
  setPedidos(PEDIDOS);
  setIsFallback(true);
  ...
}
```

O catch também cai no mock (`use-pedidos.ts:225-229`). O mock ignora tenant — é o mesmo para todo mundo.

### Telas fora de qualquer hook (mock puro — nunca integradas)

| Tela | Arquivo | Problema |
|---|---|---|
| Configurações → Empresa | `src/app/components/configuracoes/EmpresaPage.tsx:105-133` | `useState("Loja da Maria Comércio LTDA")`, CNPJ/telefone/endereço fixos; salvar é `setTimeout` fake (linha 150-156); "autocomplete de CEP" simulado (161-171) |
| Configurações → Conta | `src/app/components/configuracoes/ContaPage.tsx:134-138` | `useState("Maria Silva")`, e-mail/telefone fixos; salvar fake (164-170) |
| Dashboard financeiro | `src/app/components/financeiro/FinanceiroDashboardPage.tsx:28-68` | consome `movimentacoesMock`, `contasPagarMock`, `contasReceberMock`, `dreMock` direto |
| Detalhe do produto | `src/app/components/estoque/ProdutoDetalhePage.tsx:177` | `const produto = PRODUTOS.find((p) => p.id === id) || PRODUTOS[0];` — mock estático, sem hook, sem tenant |

### Por que a correção anterior (T2.6, commit `3088ce7`) não resolveu

Ela adicionou `.eq("empresa_id", ...)` em 6 hooks de leitura (`use-clientes`, `use-cliente`, `use-pedidos`, `use-pedido`, `use-produtos`, `useConversasReais`), mas **não** removeu o fallback `limit(1)` (QUEBRA C) nem o mock global (QUEBRA D), e não tocou em financeiro nem configurações.

---

## 2. Correções — item por item

### ITEM 1 — Cadastro: placeholders com dados reais

**Arquivo:** `src/app/components/auth/CadastroPage.tsx`

| Linha | Atual | Trocar para |
|---|---|---|
| ~313 | `placeholder="João Silva"` | `placeholder="Maria Oliveira"` |
| ~332 | `placeholder="henriqsilva@gmail.com"` | `placeholder="maria@exemplo.com.br"` |
| ~349 | `placeholder="411.193.848-50"` | `placeholder="000.000.000-00"` |

> O e-mail atual parece ser o pessoal real do fundador e o CPF tem formato real — por isso "pareciam dados reais". Os placeholders de CNPJ/telefone (`00.000.000/0000-00`, `(00) 00000-0000`) já são neutros — manter.

**⚠️ Verificação obrigatória:** conferir se há `defaultValue`/`value` inicial em algum campo (linhas 112-131 declaram o state — confirmar que todos começam vazios). Se algum campo tiver valor inicial, zerar.

### ITEM 2 — Dashboard: "Boa noite, Usuário"

**Código atual:** `DashboardPage.tsx:140` → `const nomeUsuario = perfil?.nome_usuario || "Usuário";`

**Correção em 2 camadas:**

**2a. Front (defensivo)** — `DashboardPage.tsx`: fallback em cascata:

```ts
const nomeUsuario =
  perfil?.nome_usuario ||
  (user?.user_metadata?.nome_completo as string | undefined) ||
  user?.email?.split("@")[0] ||
  "Usuário";
```

**2b. Raiz (edge function `criar-conta`)** — a função NÃO está neste repositório. Antes de codar 2a, **verificar o estado do banco** (usar SQL/MCP do Supabase):

```sql
-- Verificar se o usuário da Doceê tem linha em me_usuario e se nome está preenchido
SELECT id, nome_usuario, email, empresa_id FROM me_usuario ORDER BY email;
```

- Se a linha do usuário existe mas `nome_usuario` está vazio/null → **corrigir a edge function** `criar-conta` (painel Supabase → Edge Functions) para gravar `nome_usuario` (hoje ela parece gravar só `user_metadata.nome_completo`). Aplicar um UPDATE de backfill para usuários existentes com nome vazio, usando `raw_user_meta_data->>'nome_completo'`.
- Se a linha NÃO existe (id ≠ auth.uid) → a edge function não está inserindo em `me_usuario` → corrigir o insert para usar `auth.uid()` como `id`.

**Critério de aceite item 2:** login com a conta da Doceê mostra "Boa noite, <nome real>!". Se o nome ainda vier vazio do banco, o fallback por `user_metadata`/`email` garante que nunca mais apareça "Usuário" genérico.

### ITENS 3, 4, 6 — Isolamento de tenant (a correção estrutural)

**Aplicar o mesmo padrão a TODOS os hooks listados em §4.** O padrão tem 3 partes:

**Parte 1 — Remover o fallback `me_empresa.limit(1)`.** Substituir o bloco das linhas 135-147 de `use-pedidos.ts` (e equivalentes) por:

```ts
const { empresa, session } = useAuth();

// SEM fallback para "primeira empresa". Sem empresa autenticada, não há tenant.
if (!session) {
  // MODO DEMO (sem login): usa mock — regra mock-first de 07/09/2026
  setPedidos(PEDIDOS);
  setIsFallback(true);
  setLoading(false);
  return;
}

const empresaId = empresa?.id;
if (!empresaId) {
  // Logado mas empresa ainda não resolvida (perfil não carregou):
  // NÃO consultar outro tenant. Estado de erro explícito.
  setPedidos([]);
  setError("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
  setIsFallback(false);
  setLoading(false);
  return;
}
```

**Parte 2 — Empty state real em vez de mock (sessão ativa).** Substituir o bloco das linhas 165-170:

```ts
// ANTES: if (vendasValidas.length === 0) { setPedidos(PEDIDOS); setIsFallback(true); ... }
// DEPOIS: com sessão ativa, 0 linhas = empresa nova = empty state real.
if (vendasValidas.length === 0) {
  setPedidos([]);
  setIsFallback(false);
  setLoading(false);
  return;
}
```

O catch (linhas 225-229) mantém fallback para mock **somente se `!session`**; com sessão, propagar o erro:

```ts
} catch (err) {
  console.error("[usePedidos] Erro ao buscar dados reais:", err);
  if (!session) {
    setPedidos(PEDIDOS);
    setIsFallback(true);
  } else {
    setPedidos([]);
    setError(err instanceof Error ? err.message : "Erro ao carregar pedidos");
    setIsFallback(false);
  }
}
```

> **Estados visuais obrigatórios nas páginas consumidoras:** loading (skeleton, já existe), **empty real** ("Nenhum pedido cadastrado ainda" + CTA "Novo Pedido"), **error** (mensagem + botão tentar novamente). O `isFallback` continua existindo — mas agora significa "dados de exemplo (demo)" e a UI deve exibir o **badge "dados de exemplo"** quando `isFallback === true` (padrão já usado em algumas telas — replicar).

**Parte 3 — Filtro de empresa obrigatório e nas sub-queries.** Onde hoje o filtro é condicional (`if (empresaId) query = query.eq(...)`), torná-lo incondicional — `empresaId` é garantido pelas guardas acima. **E filtrar as sub-queries também** — hoje `use-pedidos.ts:186-188` filtra `me_cliente`, mas `use-contas-receber.ts:131-141` (`me_cliente`) e `use-contas-pagar.ts:113-126` (`me_fornecedor`) **não filtram por empresa** — corrigir adicionando `.eq("empresa_id", empresaId)` (guardando nulls: se a sub-query retornar vazio por causa do filtro, o nome exibido cai no fallback já existente da tela).

**Hooks de escrita também:** `use-criar-pedido.ts`, `use-atualizar-status-pedido.ts`, `use-confirmar-pagamento.ts`, `use-registrar-venda.ts`, `use-criar-produto.ts`, `use-atualizar-produto.ts`, `use-criar-conta-receber.ts`, `use-criar-conta-pagar.ts`, `use-atualizar-conta-receber.ts`, `use-atualizar-conta-pagar.ts` usam o mesmo padrão `empresa?.id` + `limit(1)` (ex.: `use-contas-receber.ts:88-99`, `use-contas-pagar.ts:71-82`). **Aplicar a mesma regra:** sem `empresaId` autenticado ⇒ **falhar com erro explícito e NÃO gravar** (gravar no tenant errado é pior que não gravar).

### ITEM 5 — Configurações com dados reais

**5a. EmpresaPage** (`src/app/components/configuracoes/EmpresaPage.tsx`):

- Substituir os `useState` fixos (linhas 105-133) por inicialização a partir de `useAuth().empresa`:
  - `nomeFantasia ← empresa.nome_fantasia`, `cnpj ← empresa.cnpj`, `telefone ← empresa.telefone`, `email ← empresa.email` (mapear o restante dos campos do form para as colunas existentes em `me_empresa`; campos sem coluna correspondente ficam vazios).
  - Usar `useEffect` para repopular quando `empresa` carregar (o contexto pode chegar depois do mount).
- **Salvar de verdade:** `handleSalvar` (linhas 150-156) faz `update("me_empresa").eq("id", empresa.id)` com os campos editáveis + `setToast` de sucesso/erro real. Remover o `setTimeout` fake.
- **Remover o "autocomplete de CEP" simulado** (linhas 161-171) ou marcá-lo como indisponível — autocomplete fake que preenche "Av. Paulista" é exatamente o tipo de coisa que destrói confiança no uso real.

**5b. ContaPage** (`src/app/components/configuracoes/ContaPage.tsx`):

- Inicializar a partir de `useAuth().perfil` (linhas 134-138): `nome ← perfil.nome_usuario`, `email ← perfil.email` (e-mail pode ser exibido mas **não editável** — é a chave de login).
- Salvar: `update("me_usuario").eq("id", perfil.id)` com `nome_usuario` (e demais campos editáveis que existirem na tabela). Toast real.

**Estados:** loading (enquanto `perfil`/`empresa` null com sessão ativa), empty/error explícitos, success com confirmação. Formulário com react-hook-form + zod conforme convenção do projeto (`src/app/lib/validators.ts`).

### Item extra — FinanceiroDashboardPage e ProdutoDetalhePage

- **`FinanceiroDashboardPage.tsx:28-68`:** trocar os imports de mock pelos hooks `useContasReceber`/`useContasPagar` (agora isolados). KPIs calculados sobre os dados do hook. Se `isFallback` (só possível em modo demo), exibir badge "dados de exemplo".
- **`ProdutoDetalhePage.tsx:177`:** trocar `PRODUTOS.find(...)` pelo hook de detalhe (`useProduto`/`use-pedido` equivalente de produto — se não existir hook de detalhe, criar `use-produto.ts` espelhando `use-pedido.ts`). Manter o estado de loading/empty/error. Acesso via mock estático direto deve sumir.

---

## 3. AuthContext — endurecimento (base de tudo)

`AuthContext.tsx` precisa garantir que, **com sessão ativa**, `empresa` nunca fique null silenciosamente:

1. **Fallback por e-mail no perfil** (linhas 73-82): se `.eq("id", userId)` não retornar linha, tentar `.eq("email", user.email)` antes de desistir:
   ```ts
   let perfil = perfilPorId;
   if (!perfil && userEmail) {
     const { data } = await supabase.from("me_usuario").select("...").eq("email", userEmail).maybeSingle();
     perfil = data;
   }
   ```
2. **Estado de erro explícito:** adicionar `authError: string | null` ao `AuthState`. Se perfil não carregar mesmo com fallback por e-mail, `authError = "Não foi possível carregar seu perfil. Contate o suporte."` — e as telas podem exibir banner (não falhar silenciosamente para `perfil = null`).
3. **`loading` correto:** hoje `loading` inicia `false` e o `ESTADO_INICIAL` já traz `MOCK_USER` — uma tela pode renderizar como "demo" antes da sessão resolver. Setar `loading: true` no início do `useEffect` de restauração e só voltar a `false` após `getSession()` resolver (com ou sem sessão). Hooks devem respeitar `loading` do contexto (não disparar queries de tenant antes de saber se há sessão).

---

## 4. Inventário completo de arquivos

### Modificados — hooks (padrão das Partes 1-3 de §2)

- [ ] `src/app/hooks/use-pedidos.ts`
- [ ] `src/app/hooks/use-pedido.ts`
- [ ] `src/app/hooks/use-criar-pedido.ts`
- [ ] `src/app/hooks/use-atualizar-status-pedido.ts`
- [ ] `src/app/hooks/use-confirmar-pagamento.ts`
- [ ] `src/app/hooks/use-registrar-venda.ts`
- [ ] `src/app/hooks/use-produtos.ts`
- [ ] `src/app/hooks/use-produto.ts` (criar se não existir)
- [ ] `src/app/hooks/use-criar-produto.ts`
- [ ] `src/app/hooks/use-atualizar-produto.ts`
- [ ] `src/app/hooks/use-contas-receber.ts`
- [ ] `src/app/hooks/use-contas-pagar.ts`
- [ ] `src/app/hooks/use-criar-conta-receber.ts`
- [ ] `src/app/hooks/use-criar-conta-pagar.ts`
- [ ] `src/app/hooks/use-atualizar-conta-receber.ts`
- [ ] `src/app/hooks/use-atualizar-conta-pagar.ts`
- [ ] `src/app/hooks/use-clientes.ts`
- [ ] `src/app/hooks/use-cliente.ts`
- [ ] `src/app/hooks/useConversasReais` (arquivo conforme existir)

> **Como localizar o padrão:** grep por `limit(1)` e por `me_empresa` dentro de `src/app/hooks/` — todo hook que consultar `me_empresa` para descobrir o tenant está errado.

### Modificados — telas

- [ ] `src/app/components/auth/CadastroPage.tsx` (item 1)
- [ ] `src/app/components/dashboard/DashboardPage.tsx` (item 2 — fallback de nome)
- [ ] `src/app/components/configuracoes/EmpresaPage.tsx` (item 5a)
- [ ] `src/app/components/configuracoes/ContaPage.tsx` (item 5b)
- [ ] `src/app/components/financeiro/FinanceiroDashboardPage.tsx` (itens 5-6, extra)
- [ ] `src/app/components/estoque/ProdutoDetalhePage.tsx` (extra)
- [ ] `src/app/components/pedidos/PedidosListaPage.tsx` / `PedidoDetalhePage.tsx` — apenas se precisarem de ajuste de estados empty/error
- [ ] `src/app/components/financeiro/ContasReceberPage.tsx` / `ContasPagarPage.tsx` — idem

### Modificado — contexto

- [ ] `src/app/contexts/AuthContext.tsx` (§3)

### Fora do repositório

- [ ] Edge function `criar-conta` no Supabase (item 2b) — verificar/corrigir gravação de `me_usuario` (id + `nome_usuario`) + backfill de nomes vazios.

---

## 5. Schema de referência (consulta — não alterar)

| Tabela | Colunas relevantes |
|---|---|
| `me_empresa` | `id`, `nome_fantasia`, `cnpj`, `telefone`, `email`, `slug`, `store_config`(jsonb), `logo_url`, `appearance`(jsonb) |
| `me_usuario` | `id`, `empresa_id`, `email`, `nome_usuario`, `cargo`, `role`, `ativo` |
| `me_venda` | `id`, `empresa_id`, `cliente_id`, `usuario_id`, `valor_total`, `status_venda`, `forma_pagamento`, `canal_venda`, `tipo_venda`, `npedido`, `conta_id`, `criado_em` |
| `me_produto` | (produtos da empresa; consultar colunas reais antes de mapear) |
| `me_contas_receber` | `id`, `empresa_id`, `cliente_id`, `venda_id`, `descricao`, `valor`, `data_vencimento`, `data_pagamento`, `valor_pago`, `status`, `forma_pagamento` |
| `me_contas_pagar` | `id`, `empresa_id`, `fornecedor_id`, `descricao`, `valor`, `data_vencimento`, `data_pagamento`, `valor_pago`, `status`, `forma_pagamento` |

**Teste de sanidade do banco (rodar antes e depois):** `SELECT count(*) FROM me_empresa;` → deve retornar **2** (HQ Gráfica + Doceê). Se retornar outro número, parar e reportar — o banco não é o oficial.

---

## 6. Verificação (Definition of Done)

- [ ] `grep -r "limit(1)" src/app/hooks/` não retorna nenhum `me_empresa.limit(1)` (fallback de tenant eliminado em todos os hooks)
- [ ] Nenhum hook exibe mock global quando há sessão ativa e tenant com 0 linhas (empty state real)
- [ ] Sub-queries de `me_cliente`/`me_fornecedor` filtram por `empresa_id`
- [ ] Login como Doceê: Dashboard "Boa noite, <nome>"; Pedidos, Produtos, Financeiro vazios ou com dados **da Doceê apenas**; Configurações mostra dados da Doceê e salva no banco
- [ ] Login como empresa demo antiga (a outra): mesmas telas mostram **os dados dela** — nunca os da Doceê
- [ ] Sem login (demo): telas abrem com mock + badge "dados de exemplo" (mock-first preservado)
- [ ] Cadastro sem placeholders com dados reais
- [ ] Estados loading/empty/error/success presentes nas telas tocadas
- [ ] `npm run build` passa sem erros
- [ ] Deploy Vercel READY; fundador valida no celular
- [ ] Marcar itens 1–6 como ✅ no `tracking/USO_REAL_DOCEE.md` (após validação do fundador)

## 7. O que NÃO fazer

- Não criar/alterar tabelas, RPCs ou políticas RLS (RLS é pendência P5, tratada separadamente).
- Não alterar `src/lib/supabase.ts` (já aponta para o projeto oficial).
- Não remover os mocks — eles continuam sendo o fallback de **modo demo** (decisão mock-first de 07/09/2026).
- Não redesenhar telas (wireframe/estrutura existentes se mantêm; só os estados empty/error e o badge são novos elementos visuais, seguindo o padrão já usado em outras telas).
- Não migrar para Next.js.
