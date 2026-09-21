# PRD — Segurança da Escrita de Vendas (`registrar_venda` + loja pública)

**Projeto:** UNIQ Empresas
**Tipo:** Backend / Segurança — **sem tela nova**
**Data:** 21/09/2026
**Autor:** CEO (via agente)
**Referências:** `AGENTS.md` · `tracking/TRACKING.md` (P5, F5) · `tracking/specs/SPEC-Seguranca-EscritaVendas.md`

---

## 1. Resumo executivo

### 1.1 O problema

A função `public.registrar_venda` é o caminho **principal** de escrita de vendas da Base UNIQ — mas **não o único** (ver §2.7, achado R1). É chamada por **três** origens — ERP, n8n (WhatsApp) e **loja pública** — e hoje:

- é `SECURITY DEFINER` (roda com privilégio de `postgres`, ignorando RLS);
- tem `EXECUTE` concedido a **`anon`** (chave pública, embutida no bundle do site);
- **não valida o tenant**: aceita qualquer `p_empresa_id` como parâmetro;
- **não valida preço**: grava o `preco_unitario` que vier no JSON do cliente;
- **não valida `valor_total`**: usa o parâmetro direto na conta a receber.

### 1.2 Por que agora

A loja da Doceê está **no ar** (`base-uniq.vercel.app/loja/docee`) e o fundador está entrando na fase de colocar negócios reais. O `TRACKING.md` já registra isso como bloqueador de "cliente real", mas **descreve a causa errada** (ver §2.3) — o que faria a correção ser planejada sobre uma premissa falsa.

### 1.3 Escopo

**Dentro:**
- Endurecer `registrar_venda` para o caminho interno (ERP)
- Criar função própria para o caminho público (loja), com preço/estoque resolvidos no servidor
- Corrigir o F5 (forma de pagamento não-determinística)
- Ajustar o hook da loja no front

**Fora:**
- Ligar RLS nas 54 tabelas (é o **P5**, trabalho separado e maior)
- OTP/autenticação do cliente da loja (decisão E1 da Área do Cliente)
- Backfill de vendas antigas com forma de pagamento possivelmente errada

---

## 2. Diagnóstico — fatos verificados

> Todos os itens abaixo foram lidos **no banco oficial** (`krrkfgv…`) e no código, em 21/09/2026. Não são inferências.

### 2.1 A função, como está hoje

```sql
CREATE FUNCTION public.registrar_venda(
  p_empresa_id uuid, p_valor_total numeric, p_forma_pagamento varchar,
  p_cliente_id uuid DEFAULT NULL, p_data_vencimento date DEFAULT NULL,
  p_status varchar DEFAULT 'pendente', p_itens jsonb DEFAULT '[]',
  p_observacoes text DEFAULT NULL, p_origem varchar DEFAULT 'interna'
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER        -- ⚠️ sem SET search_path
```

### 2.2 Quem consegue chamar

| Papel | Pode executar? |
|---|---|
| `anon` (chave **pública**) | ✅ **sim** |
| `authenticated` | ✅ sim |
| `service_role` | ✅ sim |
| `PUBLIC` (default) | ✅ sim (`=X/postgres`) |

### 2.3 O que ela valida — e o que **não** valida

| Entrada | Origem | Validação hoje |
|---|---|---|
| `p_empresa_id` | parâmetro | ❌ **nenhuma** → grava em qualquer tenant |
| `p_itens[].preco_unitario` | JSON do cliente | ❌ **nenhuma** → preço ditado pelo chamador |
| `p_valor_total` | parâmetro | ❌ **nenhuma** → vai direto para `me_contas_receber.valor` |
| `p_cliente_id` | parâmetro | 🟡 conferido contra `empresa_id` **apenas para pegar o nome** |

> ⚠️ **Correção ao TRACKING:** o documento diz *"antes de qualquer cliente real: função `SECURITY DEFINER` com validação de tenant"* — como se a função **não fosse** `SECURITY DEFINER`. Ela **já é**. O que falta é **validação de tenant**, não a flag.

### 2.4 Detalhes que agravam

- **Guarda anti-duplicidade só existe para `p_origem = 'whatsapp'`.** Loja e ERP não têm dedup.
- **`tipo_venda` está chumbado em `'pdv'`** para toda venda de produto — inclusive loja e WhatsApp.
- **Baixa de estoque** (`UPDATE me_produto SET estoque_atual = estoque_atual - v_quantidade`) é feita com o `v_produto_id` vindo do cliente, filtrado apenas por `empresa_id`.
- **`EXCEPTION WHEN OTHERS`** engole a exceção e devolve `success: false` — bom para não derrubar o fluxo, mas o chamador precisa inspecionar o corpo (já houve bug por isso no n8n).

### 2.5 F5 — forma de pagamento não-determinística

```sql
SELECT id INTO v_forma_pagamento_id
FROM me_forma_pagamento
WHERE nome ILIKE v_forma_pagamento      -- ❌ sem filtro de empresa
LIMIT 1;                                 -- ❌ sem ORDER BY
IF v_forma_pagamento_id IS NULL THEN
  v_forma_pagamento_id := 1;             -- ❌ 1 = Dinheiro
END IF;
```

Três problemas concretos:

1. **Não-determinístico:** existem linhas globais (1–5) **e** do tenant (20–22) com os mesmos nomes. Sem `empresa_id` e sem `ORDER BY`, o id sorteado é arbitrário.
2. **Fallback incoerente:** o texto cai para `'PIX'` mas o id cai para `1` (**Dinheiro**).
3. **Venda e conta podem discordar:** o **id** vai para `me_venda.forma_pagamento` e o **texto** para `me_contas_receber.forma_pagamento`.

### 2.6 O que já está certo e deve ser preservado

- `fn_ingest_whatsapp` **tem `search_path=public`** — é o exemplo interno correto de `SECURITY DEFINER`.
- `me_usuario.id` **é** `auth.users.id` (verificado: 4 de 4 usuários casam) → `auth.uid()` dá o usuário e, por ele, o `empresa_id`.
- O n8n usa credencial `supabaseApi` (**host + service_role**) → **não é afetado** ao revogar `anon`.

### 2.7 Achados da revisão independente (21/09/2026)

> O desenho foi submetido a revisão sênior de segurança. **Cada achado abaixo foi verificado por mim no banco e no código** — nenhum foi aceito por autoridade.

**R1 — `anon` tem DML completo nas tabelas do núcleo, com RLS desligado** 🔴

| Tabela | RLS | `anon` |
|---|---|---|
| `me_cliente` | **desligado** | `arwdDxtm` → SELECT, INSERT, UPDATE, DELETE, TRUNCATE |
| `me_usuario` | **desligado** | idem |
| `me_venda` | **desligado** | idem |
| `me_contas_receber` | **desligado** | idem |
| `me_produto` | **desligado** | idem |
| `me_itens_venda` | **ligado** | grants presentes, mas RLS barra ← **o padrão correto** |

A anon key (pública, no bundle) **lê e escreve direto pelo PostgREST**, sem passar por RPC nenhuma — e isso inclui **ler `me_cliente` e `me_usuario`**: PII e e-mails.

→ **Este é o risco dominante, e é o P5.** Endurecer `registrar_venda` é defesa em profundidade; **não fecha o buraco**. A premissa anterior deste PRD ("único caminho de escrita") estava **errada**.

**R2 — Existe uma segunda porta `SECURITY DEFINER` executável por `anon`** 🔴

`fn_excluir_pedido_cancelado` (migração `20260918120000`): `SECURITY DEFINER`, `acl = =X/postgres` (**PUBLIC**), `anon=X`, **sem `search_path`**, **sem `auth.uid()`**, **sem consulta a `me_usuario`** — e `p_empresa_id` é parâmetro do chamador. Um anon pode soft-deletar venda alheia **e devolver estoque**.

**R3 — A validação de tenant proposta tinha um furo** 🔴

Eu propus tratar `auth.uid() IS NULL` como "é o service_role". **Falso:** requisição com a **anon key** também tem `auth.uid() IS NULL`. Hoje não é explorável porque o `REVOKE` tira o `EXECUTE` — **mas o rollback que eu documentei (`GRANT … TO anon`) reabriria o cross-tenant inteiro.** Corrigido no SPEC: discriminar por `auth.role()`, **falhando fechado**.

**R4 — `search_path` deve ser `''`, não `public, pg_temp`** 🟡

Eu justifiquei `public, pg_temp` como "padrão do skill". **O skill diz o oposto** (`set search_path = ''`, `security-rls-performance.md:40`). Como todo o SQL já usa nomes qualificados (`public.…`, `auth.uid()`), `''` custa zero e é estritamente melhor.

**R5 — Bug de exibição real no "Meus pedidos" da loja** 🟡

`use-loja-meus-pedidos.ts:38-44` mapeia **2 → "Pix"** e **3 → "Cartão de Crédito"**, mas no banco **2 = Cartão de Crédito** e **3 = Pix** — **invertido**. Fallback `|| "Pix"` para qualquer código desconhecido. Uma venda Pix (id 3) aparece como "Cartão de Crédito" — o **mesmo sintoma do item 7 do TRACKING**, que aparentemente foi corrigido no ERP mas **não neste hook**.

**R6 — Venda do ERP cai na regra de dedup do WhatsApp** 🟡

`use-registrar-venda.ts:80` → `p_origem: params.origem || "whatsapp"`. Venda interna sem `origem` explícita ativa a guarda anti-duplicidade do WhatsApp. O default deveria ser `'interna'`.

**R7 — Todas as funções nascem com `EXECUTE` para `PUBLIC`/`anon`** 🟡

Confirmado nas 4 funções verificadas (`=X/postgres`). Inclusive `fn_ingest_whatsapp` — que fixa `search_path`, mas aceita `p_empresa_id` do chamador. O `REVOKE` precisa ser **explícito em cada uma**; o plano atual cobre só duas.

---

## 3. Risco

### 3.1 Cenário concreto

Com a anon key (pública) e um `POST` para `/rest/v1/rpc/registrar_venda`, qualquer pessoa consegue:

- criar venda em **qualquer** empresa, passando o `empresa_id` que quiser;
- com **qualquer preço** (ex.: R$ 0,01 por item);
- **baixando estoque** de produtos daquela empresa.

### 3.2 Por que fechar o P5 (RLS) **não** fecha isto

`SECURITY DEFINER` roda com privilégio de `postgres` e **ignora RLS por design**. Ligar RLS nas 54 tabelas (P5) **não** fecha esta porta — são dois problemas distintos que o TRACKING trata como um só. Este aqui exige tratamento próprio.

### 3.3 Impacto

| Dimensão | Avaliação |
|---|---|
| Vazamento de dados | **Não** — a função escreve, não lê dados de terceiros |
| Integridade de dados | **Alto** — vendas falsas, estoque zerado, financeiro poluído |
| Financeiro | **Alto** — contas a receber fabricadas |
| Probabilidade | Baixa para um leigo; **trivial** para qualquer pessoa técnica |

### 3.4 Mitigante atual

O TRACKING diz que a loja "re-resolve id/preço/estoque no banco antes da RPC". **É verdade — mas roda no navegador.** Quem chama a RPC direto pula a checagem inteira. Não é mitigação, é UX.

---

## 4. Decisões

### 4.1 Já decididas (com base nos fatos)

| # | Decisão | Base |
|---|---|---|
| D-A | **Revogar `EXECUTE` de `anon` e `PUBLIC` em `registrar_venda`** | É o caminho interno; o n8n usa service_role e o ERP usa usuário logado |
| D-B | **Criar função própria para a loja pública** (`fn_loja_criar_pedido`), resolvendo tenant pelo **slug** e preço/estoque **no servidor** | A loja não tem usuário logado; não dá para validar identidade |
| D-C | **Fixar `search_path`** nas funções `SECURITY DEFINER` que ainda não têm | Padrão do skill de Postgres do próprio projeto; `fn_ingest_whatsapp` já faz |
| D-D | **Validar tenant em `registrar_venda`** contra `me_usuario.empresa_id` do `auth.uid()` | `me_usuario.id = auth.users.id` (verificado) |
| D-E | **Corrigir o F5** dentro das duas funções (filtro de empresa + `ORDER BY` + fallback coerente) | Determinismo é requisito de dado financeiro |

### 4.2 Abertas — precisam do fundador

| # | Pergunta | Opções | Recomendação |
|---|---|---|---|
| **D-1** | ~~Preço mudou entre a sacola e o checkout: avisar ou cobrar em silêncio?~~ | — | ✅ **JÁ RESOLVIDO NO CÓDIGO** — `use-loja-criar-pedido.ts:184-188` já calcula `precoAtualizado` e `CheckoutPage.tsx:1110` já exibe o aviso. A escolha foi **avisar**. Nada a decidir |
| **D-2** | `tipo_venda` chumbado em `'pdv'` para venda de loja/WhatsApp | (a) corrigir agora · (b) preservar | **(b) por ora** — corrigir mexe em filtros/relatórios do ERP; tratar como item próprio |
| **D-3** | Loja pública sem autenticação continua aceitando pedido de qualquer um (spam) | (a) aceitar (é o desenho atual) · (b) limite simples (nº de pedidos por telefone/hora) · (c) OTP | **(b)** agora, **(c)** junto com a decisão E1 da Área do Cliente |
| **D-4** | Vendas antigas com forma de pagamento possivelmente errada | (a) deixar · (b) auditar e corrigir | **(a)** — o TRACKING já decidiu "não mexer no histórico (são pedidos de teste)" |
| **D-5** | ~~O P5 (RLS + grants do `anon`) entra neste trabalho?~~ | — | ✅ **DECIDIDO (21/09/2026): fica SEPARADO.** O produto ainda roda com **empresas internas**, sem cliente externo; o trabalho longo vai para uma **Sprint de Segurança** própria, mapeada em **`tracking/BACKLOG_SEGURANCA.md`**. Consequência aceita: o endurecimento da RPC é **correção + preparação**, não defesa contra atacante |
| **D-6** | O estoque é debitado na **criação** do pedido, e a loja não tem pagamento — dá para "drenar" o catálogo | (a) manter + limite · (b) debitar só na confirmação · (c) reservar com expiração | **(a)** — é o modelo da Doceê (retirada no balcão); mitigar com limite por telefone/janela |
| **D-7** | `fn_excluir_pedido_cancelado` entra no escopo? | (a) sim · (b) não | **(a)** — mesma classe de risco, já existe e é executável por `anon` (achado R2) |

---

## 5. Solução proposta

### 5.1 Separar as duas portas

| Caminho | Função | Chamador | Validação de tenant | Preço |
|---|---|---|---|---|
| **ERP interno** | `registrar_venda` (endurecida) | usuário logado | `auth.uid()` → `me_usuario.empresa_id` **deve** ser igual a `p_empresa_id` | do cliente (operador é confiável) |
| **n8n / WhatsApp** | `registrar_venda` | `service_role` | idem (service_role passa) | já resolvido no sub-workflow |
| **Loja pública** | `fn_loja_criar_pedido` (nova) | `anon` | resolvido pelo **slug**, nunca por parâmetro | **resolvido no servidor** a partir de `me_produto` |

### 5.2 O que muda para o usuário (visibilidade)

**Nada muda visualmente.** Nenhuma tela, layout, componente ou texto. Sem tela nova.

O que muda é **comportamento**, em 4 pontos:

| # | Ponto | Visível? |
|---|---|---|
| 1 | Preço/estoque decididos no servidor | Só no caso de borda "preço mudou" → **depende da D-1** |
| 2 | Forma de pagamento determinística | **Sim, no ERP** — pedidos **novos** passam a mostrar a forma certa |
| 3 | `tipo_venda` | Só se D-2 = corrigir |
| 4 | Erro do checkout vindo do servidor | Só quando o erro ocorrer → **estado de tela** |

**Consequência de processo — ✅ NÃO precisa de WIRE.** Os dois estados de tela que este trabalho toca **já existem e já estão ligados**:

| Estado | Onde já existe hoje |
|---|---|
| Aviso de *"preço atualizado"* | `CheckoutPage.tsx:787` (estado) · `:1110` (render) |
| Modal de estoque insuficiente | `CheckoutPage.tsx:788` (estado) · `:958-959` (ligação) · `:989-998` (render) |

O servidor vai devolver **as mesmas formas** que a tela já consome (`errosEstoque`), então **nenhum código de tela precisa mudar**. Pela regra de ouro do `AGENTS.md`, sem código de tela não há WIRE a aprovar — o trabalho é **banco + hook**.

**Desenho resultante — defesa em profundidade, sem mudar UX:**
o cliente continua resolvendo preço/estoque para **avisar o usuário antes** (é UX), e o servidor passa a ser a **fonte da verdade** (é segurança). Hoje só existe a primeira camada.

---

## 6. Critérios de aceite

- [ ] `anon` **não** consegue executar `registrar_venda` (`has_function_privilege` = false)
- [ ] `authenticated` **não** consegue gravar venda em `empresa_id` diferente do seu
- [ ] `service_role` continua funcionando (fluxo n8n intacto — validado ponta a ponta)
- [ ] A loja cria pedido por `fn_loja_criar_pedido` com **preço vindo do banco**, ignorando qualquer preço do cliente
- [ ] Preço adulterado no payload do cliente **não** altera o valor gravado
- [ ] Estoque insuficiente retorna erro estruturado e **não** cria venda
- [ ] Forma de pagamento resolvida **dentro da empresa** e de forma determinística (mesma entrada → mesmo id)
- [ ] Nenhuma função `SECURITY DEFINER` nova sem `SET search_path`
- [ ] Fluxo completo da loja testado: vitrine → sacola → checkout → pedido aparece no ERP

---

## 7. Fora de escopo / backlog

| Item | Por quê |
|---|---|
| **RLS + grants do `anon` (P5)** — **68 tabelas** | ✅ **Adiado por decisão de 21/09/2026** → `tracking/BACKLOG_SEGURANCA.md`. Empresas internas; Sprint de Segurança dedicada depois. Gatilho: primeiro cliente externo |
| Rate-limit / idempotência na loja pública (A2) | Vai junto com o P5 — sem autenticação, o limite é a única mitigação |
| Drenagem de estoque (A1 / D-6) | Depende de decisão de modelo de negócio; vai para a Sprint de Segurança |
| Oráculo de identidade + OTP do cliente (A3 / E1) | Já registrado como evolução obrigatória antes de cliente real |
| Validação de `role` nas funções (M10) | Só faz sentido junto com o modelo de permissões |
| Auditoria / log de ator · LGPD no servidor (B5) | Sprint de Segurança |
| Backfill de forma de pagamento (D-4) | Decisão: não mexer no histórico de teste |
