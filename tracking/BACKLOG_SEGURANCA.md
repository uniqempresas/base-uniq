# 🔒 BACKLOG DE SEGURANÇA — Sprint dedicada

> **Criado:** 21/09/2026
> **Origem:** revisão sênior de segurança do desenho de escrita de vendas (`PRD-Seguranca-EscritaVendas.md` §2.7)
> **Decisão do fundador (21/09/2026):** adiar o trabalho longo. **Motivo:** o produto ainda roda com **empresas internas** (Doceê, HQ Gráfica, UNIQ Empresas), sem cliente externo real. Correção curta agora; Sprint de Segurança depois.
>
> ⚠️ **Este documento é o contrato da Sprint de Segurança.** Ele existe para que a decisão de adiar seja *consciente e reversível*, não esquecida.

---

## 1. Por que pode adiar (e o que isso custa)

**Por que pode:** não há cliente externo. Os dados no banco são das empresas internas do próprio fundador (23 clientes, 4 usuários, 9 vendas — volume de teste). O risco é de **integridade e exposição entre as próprias empresas**, não de vazamento de dado de terceiro.

**O que isso custa:** enquanto o P5 estiver aberto, **nenhuma defesa no nível de aplicação vale nada**. Quem tiver a anon key (pública) escreve direto nas tabelas. Ou seja:

> O endurecimento da `registrar_venda` (feito na correção curta) é **correção e preparação** — não é defesa contra atacante enquanto o P5 não fechar.

**Gatilho de urgência:** o primeiro **cliente externo real** — ou o primeiro dado de terceiro no banco — torna este documento bloqueador.

---

## 2. Medição (21/09/2026, banco oficial `krrkfgv…`)

| Métrica | Valor |
|---|---|
| Tabelas no schema `public` | **88** |
| Com RLS **desligado** | **68** |
| Com RLS ligado | 20 |
| **Expostas ao `anon`** (RLS off **e** grant para anon) | **68** |
| Com grant para `anon` (independente de RLS) | **88** |

> ⚠️ O `TRACKING.md` registrava **54 tabelas**. O número real é **68 de 88**. Corrigir quando este documento for executado.

**Padrão correto já existente no projeto:** `me_itens_venda` — **RLS ligado**, grants presentes. É o modelo a replicar.

**Tabelas de maior impacto expostas hoje:**

| Tabela | Linhas | O que expõe |
|---|---|---|
| `me_cliente` | 23 | **PII** — nome, telefone, e-mail, endereço |
| `me_usuario` | 4 | **PII** — e-mail e nome dos usuários |
| `me_venda` | 9 | Financeiro |
| `me_contas_receber` | 12 | Financeiro |
| `me_produto` | 26 | Catálogo e preços de custo |
| `me_empresa` | 4 | Dados cadastrais |

Com `anon = arwdDxtm`, a chave pública permite **SELECT, INSERT, UPDATE, DELETE e TRUNCATE** nessas tabelas.

---

## 3. Escopo proposto da Sprint

### Fase 1 — RLS nas tabelas do núcleo (o núcleo do trabalho)

- [ ] Definir a **função de tenant** reutilizável (`private.empresa_do_usuario()` ou equivalente), `SECURITY DEFINER`, `search_path = ''`, com `EXECUTE` revogado de `PUBLIC`/`anon`
- [ ] Ligar `ROW LEVEL SECURITY` nas tabelas de negócio
- [ ] Criar política por empresa usando `(select private.empresa_do_usuario())` — **envolvida em subselect** (padrão do skill: evita avaliar por linha)
- [ ] Indexar as colunas usadas nas políticas (`empresa_id`)
- [ ] Considerar `FORCE ROW LEVEL SECURITY` onde o dono não deve escapar
- [ ] **Revogar `anon`** onde a leitura anônima não é necessária; manter só onde é (ex.: vitrine pública)
- [ ] Validar com `get_advisors` (security) após cada etapa

### Fase 2 — Grants e funções

- [ ] `REVOKE EXECUTE FROM PUBLIC` em **todas** as funções `SECURITY DEFINER` (hoje todas nascem com `=X/postgres`)
- [ ] `search_path = ''` em todas as `SECURITY DEFINER` (hoje: só `fn_ingest_whatsapp` tem, e com `public`)
- [ ] **`fn_excluir_pedido_cancelado`** — hoje `SECURITY DEFINER`, executável por `anon`, **sem validação de tenant**, e **devolve estoque**. Ganhou `REVOKE` na correção curta; falta a validação de tenant
- [ ] `fn_ingest_whatsapp` — aceita `p_empresa_id` do chamador; validar origem
- [ ] `fn_resolver_cliente_id` — não é `SECURITY DEFINER`, mas tem `EXECUTE` para `anon`
- [ ] Auditoria de grants tabela a tabela (as 88)

### Fase 3 — Integridade de negócio

- [ ] **Rate-limit / idempotência** na loja pública (achado A2) — a loja é pública e cria vendas e clientes sem autenticação
- [ ] **Drenagem de estoque** (A1/D-6) — hoje qualquer um "compra" o catálogo inteiro e o estoque baixa, sem pagamento
- [ ] **Oráculo de identidade** (A3) — `cliente_id` devolvido a chamador anônimo; a Área do Cliente autentica **só por telefone** e lista pedidos com PII
- [ ] **OTP do cliente da loja** — decisão **E1** da Área do Cliente já registra como *"evolução obrigatória antes de cliente real"*
- [ ] **Validação de `role`** dentro das funções (M10) — hoje qualquer usuário da empresa lança venda a qualquer preço
- [ ] **Log de ator / auditoria** nas escritas (quem gravou o quê)
- [ ] **LGPD no servidor** (B5) — o consentimento hoje é só client-side; registrar base legal e timestamp
- [ ] **Backfill** de `me_venda.forma_pagamento` possivelmente errado (decisão D-4)

---

## 4. Achados da revisão ainda abertos

Referência completa: `tracking/plans/PRD-Seguranca-EscritaVendas.md` §2.7.

| # | Achado | Status |
|---|---|---|
| **R1** | `anon` com DML completo + RLS off em 68 tabelas | ⏳ **esta Sprint** |
| **R2** | `fn_excluir_pedido_cancelado` — segunda porta `SECURITY DEFINER` | 🟡 `REVOKE` na correção curta · validação de tenant **aqui** |
| **R3** | Furo no meu bloco de validação de tenant (`auth.uid() IS NULL`) | ✅ corrigido na correção curta |
| **R4** | `search_path` fixo | ✅ `''` na `fn_excluir_pedido_cancelado` (corpo qualificado) · `public, pg_temp` na `registrar_venda` (corpo **não** qualificado — `''` quebraria) · **demais funções aqui** |
| **R5** | Mapa de pagamento invertido em `use-loja-meus-pedidos.ts` | ✅ corrigido na correção curta |
| **R6** | `p_origem \|\| "whatsapp"` no hook do ERP | ✅ corrigido na correção curta |
| **R7** | Todas as funções nascem com `EXECUTE` para `PUBLIC` | 🟡 parcial · **auditoria completa aqui** |
| **A1** | Drenagem de estoque por anon | ⏳ esta Sprint |
| **A2** | Sem rate-limit / idempotência na loja | ⏳ esta Sprint |
| **A3** | `cliente_id` como oráculo de identidade | ⏳ esta Sprint |
| **A4** | Deadlock por ordem de lock controlada pelo cliente | ✅ corrigido na correção curta (ordena por `produto_id`) |
| **M1–M5, M9–M11** | Guardas de preço/quantidade, `p_itens` NULL, corrida do cliente, contrato de erro, `p_cliente_id` cross-tenant | ✅ incorporados na correção curta (exceto M10) |
| **M6–M8** | Mapa do front, contradição do SPEC, bloco de escrita ausente | ✅ corrigidos na correção curta |
| **B1–B8** | `ILIKE`, NULLs de `ativo`, validação de formato, LGPD, default de origem, ACLs, testes | 🟡 parcial · ver Fase 2/3 |

---

## 5. Critérios de aceite da Sprint

- [ ] `anon` **não** consegue `SELECT` em `me_cliente`, `me_usuario`, `me_venda`, `me_contas_receber`
- [ ] Nenhuma tabela de negócio com RLS desligado
- [ ] Nenhuma função `SECURITY DEFINER` com `EXECUTE` para `PUBLIC`/`anon` sem justificativa explícita
- [ ] Toda `SECURITY DEFINER` com `search_path = ''` e nomes qualificados
- [ ] Usuário da empresa A não lê **nem escreve** nada da empresa B, por **nenhum** caminho (tabela, RPC ou view)
- [ ] Loja pública com limite de pedidos por telefone/janela
- [ ] Consentimento LGPD registrado no servidor, com timestamp
- [ ] `get_advisors` (security) sem alertas críticos
- [ ] Teste adversarial: tentar cross-tenant por PostgREST direto e por cada RPC

---

## 6. Como executar

1. Ler este documento + `PRD-Seguranca-EscritaVendas.md` §2.7
2. Abrir **PRD/SPEC próprios da Sprint** (pipeline SDD do `AGENTS.md`)
3. Seguir as Fases 1 → 2 → 3, validando com `get_advisors` a cada etapa
4. **Não** ligar RLS sem política: tabela com RLS on e zero políticas = acesso negado para todos (derruba o app)
