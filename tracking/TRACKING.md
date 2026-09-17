# 📊 TRACKING — Kit de Construção do Plano de 5 Semanas

> **Para o agente construtor:** este documento é o **contrato de execução**. Leia-o primeiro.
>
> **Ordem de leitura antes de qualquer código:**
> 1. `AGENTS.md` (raiz) — metodologia SDD, stack, regras de ouro.
> 2. `tracking/CONTEXTO_PROJETO.md` — memória de longo prazo (negócio, personas, Melissa, Base UNIQ, decisões).
> 3. `DESIGN.md` (raiz) — identidade visual oficial (tokens de paleta, tipografia, layout).
> 4. `tracking/TRACKING_GUIDE.md` — ciclo de vida do tracking + pipeline SDD.
> 5. **Este arquivo** — o que construir, onde e o critério de aceite.
>
> ⚠️ **REGRA DE OURO:** sem WIRE aprovado, não se escreve código de tela. Pipeline obrigatório: `Research → PRD → SPEC → WIRE → Implementação`. Cada tela nova segue PRD (`tracking/plans/`) + SPEC (`tracking/specs/`) + WIRE (`tracking/wireframe/`).

---

## 🎯 Objetivo do plano (WHY)

Conectar a **Base UNIQ** para que a demonstração `WhatsApp → CRM → pedido contabilizado` funcione de ponta a ponta, e depois construir o funil `Landing → MEL (SPIN) → documento de necessidades → retorno humano`.

**Por que isso importa:** é o que transforma a UNIQ de protótipo em produto real, protegendo as 16h/semana do fundador. Sem essa ponte, nada é vendável.

---

## 📌 Decisão #0 (resolvida — ✅ implementada na S1)

- **Supabase OFICIAL:** `krrkfgvdwhpelxtrdtla.supabase.co` ← é este que tem os dados reais e que os agentes devem usar.
- ✅ **Front corrigido (tarefa 1.1):** `src/lib/supabase.ts` já aponta para `krrkfgv...` e a edge function `criar-conta` em `CadastroPage.tsx` também. Sem referências ao projeto antigo (`eqyvic...`) no código.
- ⚠️ **RLS por empresa (Bug #36):** `crm_chat_conversas` (22) e `crm_chat_mensagens` (691) têm RLS habilitado com isolamento por empresa (`me_usuario`). **Anon key retorna 0** — os dados só aparecem com usuário logado. `me_empresa`/`me_usuario` seguem sem RLS.
- ✅ **Grão multi-tenant das conversas (17/09/2026):** `crm_chat_conversas.id` deixou de ser o telefone (text) e virou surrogate `uuid`; o telefone agora mora em `canal_id` (NOT NULL) e o banco garante `UNIQUE (empresa_id, canal, canal_id)`. Ver seção própria abaixo.

> **Teste de sanidade (para o agente):** com a anon key, `me_empresa` retorna **2** e `me_usuario` retorna **2**. `crm_chat_conversas`/`crm_chat_mensagens` retornam **0 com anon** (esperado — RLS); para ver as **22 conversas / 691 mensagens**, é preciso token de usuário autenticado de uma empresa.

---

## 🏗️ ESTADO REAL — o backend é rico, o front é mock

### Backend (já construído — NÃO recriar)

> Números atualizados em 11/09/2026 via schema do Supabase oficial (`krrkfgv...`).

| Domínio | Tabela | Dados reais | Campos-chave |
|---|---|---|---|
| **Chat WhatsApp (Evolution)** | `crm_chat_conversas` | **22** (RLS por empresa) | `id`(**uuid** PK, surrogate), `id_legado`(text — telefone na chave antiga), `empresa_id`, `cliente_id`, `lead_id`, `status`, `modo`, `titulo`, `nome`, `canal`, `canal_id`(**NOT NULL** — telefone do contato), `canal_dados`(jsonb), `foto_contato`, `criado_em` · **UNIQUE `(empresa_id, canal, canal_id)`** |
| **Mensagens** | `crm_chat_mensagens` | **691** (RLS por empresa) | `id`, `conversa_id`(**uuid**), `remetente_tipo`, `remetente_id`, `conteudo`, `tipo_conteudo`, `lido`, `metadados`(jsonb), `remetente`, `tipo`, `arquivo_url`, `canal_mensagem_id`, `status`, `criado_em` |
| **Chat MEL** | `mel_chat` | **548** | histórico de conversas da MEL |
| **Cliente** | `me_cliente` | **7** | `id`, `empresa_id`, `nome_cliente`, `telefone`, `email`, `documento`, `cidade`, `origem`, `ativo`, `tags` (text[]), `criado_em`, `atualizado_em` (trigger) |
| **Leads** | `crm_leads` | **10** (legado — CRM do app não lê mais; dados preservados) | `id`, `empresa_id`, `nome`, `email`, `telefone`, `status`, `origem`, `cargo`, `empresa_nome`, `ltv`, `ultima_interacao`, `observacoes`, `foto_url`, `created_at` |
| **Empresa** | `me_empresa` | **2** | `id`, `nome_fantasia`, `cnpj`, `telefone`, `email`, `slug`, `store_config`(jsonb), `logo_url`, `appearance`(jsonb) |
| **Usuário** | `me_usuario` | **2** | `id`, `empresa_id`, `email`, `nome_usuario`, `cargo`, `role`, `ativo` |
| **Vendas** | `me_venda` | **2** | `id`, `empresa_id`, `cliente_id`, `usuario_id`, `valor_total`, `status_venda`, `forma_pagamento`, `canal_venda`, `tipo_venda`, `npedido`, `conta_id`, `criado_em` |
| **Produtos** | `me_produto` | **3** | `id`, `empresa_id`, `nome_produto`, `preco`, `preco_varejo`, `preco_custo`, `sku`, `estoque_atual`, `ativo` |
| **Itens de venda** | `me_itens_venda` | — | `id`, `venda_id`, `empresa_id`, `produto_id`, `quantidade`, `preco_unitario`, `subtotal`, `nome_produto`, `tipo_item` |
| **Finanças** | `me_contas_receber` / `me_contas_pagar` | **5** / **1** | contas a receber e a pagar |
| **Tags CRM** | `me_tag` | **24** | `id`, `empresa_id`, `nome`, `cor`, `ativo`, `criado_em` |

### RPC disponível para a cadeia de demonstração

`registrar_venda(p_empresa_id, p_valor_total, p_forma_pagamento, p_cliente_id, p_data_vencimento, p_status, p_itens jsonb, p_observacoes, p_origem)` → retorna `{success, id_venda, id_venda_servico, id_conta_receber, valor_total}`.

**O que ela já faz:** registra venda (produtos em `me_venda`/`me_itens_venda`, serviços em `me_venda_servicos`), baixa estoque, e cria `me_contas_receber` com vencimento (padrão +30 dias). **É a função que o "pedido contabilizado" deve usar na Semana 2.**

### Funil (MEL) — tabelas JÁ EXISTEM, mas VAZIAS

> 🎯 **O modelo de dados do funil já está pronto.** O agente NÃO precisa criar schema de funil — precisa **popular** e **renderizar**.

| Tabela | Campos (já estrutura SPIN) | Status |
|---|---|---|
| `mel_consultoria` | `nome_cliente`, `n_telefone`, `empresa`, `experiencia_consultoria` (Situação), `processo_atual` (Situação), `maiores_custos` (Problema), `tarefa_perda_tempo` (Problema), `perda_clientes` (Problema), `impacto_financeiro` (Implicação), `risco_decisao` (Implicação), `dor_critica` (Necessidade), `valor_solucao` (Necessidade), `data_retorno`, `etapa_funil` (NOT NULL), `conclusao` (bool), `last_msg`, `email` | **0 registros** |
| `mel_validacao_dores` | `entrevista_id`, `descricao`, `categoria`, `frequencia`, `impacto_tempo`, `impacto_dinheiro`, `ja_tentou_resolver`(bool), `solucoes_tentadas`, `nota_gravidade`(int), `citacao_cliente` | **0 registros** |
| `mel_validacao_indicacoes` | `parceiro_id`, `entrevistado_nome`, `entrevistado_telefone`, `entrevistado_empresa`, `indicado_nome`(NOT NULL), `indicado_contato`(NOT NULL), `status`(NOT NULL) | **0 registros** |

### Frontend — é mock/local-first; só o login era real

| Arquivo | Papel | Estado |
|---|---|---|
| `src/lib/supabase.ts` | Client Supabase | ⚠️ aponta p/ projeto errado (`eqyvic...`) |
| `src/app/contexts/AuthContext.tsx` | Sessão/usuário | 🟡 importa tipos `@supabase/supabase-js` |
| `src/app/contexts/ModulosContext.tsx` | Módulos ativos | 🟡 |
| `src/app/routes.tsx` | Rotas da app | ✅ existente |
| `src/app/lib/modulos.ts` / `moduloRoutes.ts` | Catálogo + rotas de módulos | ✅ |
| `src/app/hooks/*` (useChatbot, useServicos, useSuppliers, useEmployees, useMetricas, useMarketplace, useCarrinho, useVendedor, useModulosAtivos, usePermissions...) | Hooks | ⚠️ usam mocks/localStorage |
| `src/app/lib/mocks/*` | Mock data | ⚠️ |
| `src/app/types/*` | Tipos por domínio | ✅ |

> ⚠️ **Atenção à árvore:** o projeto real está em **`src/app/`** (glob confirmou). Não use uma árvore `app/` raiz.

---

## 🔗 A CADEIA DE DEMONSTRAÇÃO (espinha dorsal do plano)

```
1. Mensagem WhatsApp (n8n/Evolution) → `crm_chat_conversas` + `crm_chat_mensagens`
        ↓
2. Conversa aparece no CRM (tela lê `crm_chat_conversas`/`crm_chat_mensagens`)
        ↓
3. Pedido no WhatsApp → `crm_leads`/`me_cliente` (vira lead/cliente no CRM)
        ↓
4. Pedido contabilizado → RPC `registrar_venda` → `me_venda` + `me_contas_receber`
```

As tabelas e a RPC **já existem**. O trabalho é: (a) conectar o front, (b) renderizar, (c) disparar a RPC quando houver pedido.

---

## 🗓️ PLANO POR SEMANA (com critério de aceite)

> Cada semana tem um **Gate** que precisa ser cumprido antes de avançar. Cada tela nova exige **PRD + SPEC + WIRE** antes do código.

---

### 🟢 MÓDULO LOJA VIRTUAL INTEGRADA (15/09/2026)

**WHY:** a vitrine pública da Doceê vende por um 3º canal (além de balcão e WhatsApp) com os pedidos caindo na Base UNIQ no mesmo fluxo de status que a esposa já opera.

**Status:** ✅ CONCLUÍDO — pipeline SDD completo (PRD/SPEC/WIRE) + implementação + build OK.

**Documentos:**
- PRD: `tracking/plans/PRD-LojaVirtual-DoceE.md` (decisões D1–D4: slug multi-tenant · endereço preferido/editável com ViaCEP · "Esgotado" na vitrine · sem login — identificação só por telefone)
- SPEC: `tracking/specs/SPEC-LojaVirtual-DoceE.md`
- WIRE: `tracking/wireframe/WIRE-LojaVirtual-DoceE.md`

**Implementação:**
- Rotas públicas multi-tenant: `/loja/:slug`, `/loja/:slug/produto/:id`, `/loja/:slug/checkout`, `/loja/:slug/pedidos` (demo `/loja` intacto; estáticas antes das dinâmicas)
- Vitrine lê `me_produto` (`exibir_vitrine=true`, ativo, por `empresa_id`) com fallback mock; badge **Esgotado** quando `estoque_atual <= 0`
- Checkout **anti-fraude**: re-resolve id/preço/estoque no banco antes da RPC (preço do navegador nunca é gravado; estoque insuficiente → modal por item, RPC não chamada); cliente find-or-create por telefone normalizado (DDI 55) em `me_cliente` (`origem='loja'`, endereço nos campos novos); ViaCEP pré-preenche endereço (backlog B5 viabilizado); consentimento LGPD obrigatório; pagamento Pix/Dinheiro registrado (sem gateway)
- RPC `registrar_venda` com `p_origem='loja'` / `p_status='confirmada'` / vencimento=hoje → pedido aparece em `/vendas/pedidos` como **Recebido** (canal `loja` já existia em `CANAL_CONFIG`)
- Confirmação com nº do pedido; "Meus pedidos" por telefone digitado (pré-preenchido do último checkout)
- Hooks novos: `use-loja-tenant`, `use-loja-produtos`, `use-loja-produto`, `use-loja-cliente`, `use-loja-criar-pedido` (exporta `buscarProdutosCanonicos`), `use-loja-meus-pedidos`, `use-carrinho-loja` (chave `uniq_loja_carrinho_<slug>`)
- Botão **remover item** (ícone lixeira) no resumo "SEU PEDIDO" do checkout tenant — usa `carrinho.remover(produtoId)`; último item removido → redirect para vitrine
- Banco: produtos da Doceê ativados com `exibir_vitrine=true` (16 itens)
- ⚠️ **Endurecimento pendente:** vitrine chama RPC com anon key (RLS desligado — pendência P5). Antes de qualquer cliente real: função `SECURITY DEFINER` com validação de tenant.

---

### 🟢 ÁREA DO CLIENTE NA LOJA — login por telefone (16/09/2026)

**WHY:** o cliente final da Doceê acompanha os próprios pedidos sem senha — entra só com o telefone, com sessão escopada por loja (o mesmo telefone pode ser cliente de várias lojas da Base UNIQ).

**Status:** 🔶 EM IMPLEMENTAÇÃO — pipeline SDD completo (PRD/SPEC/WIRE) + WIRE aprovado pelo fundador (dispensou confirmação formal); implementação em curso.

**Documentos:**
- PRD: `tracking/plans/PRD-LojaVirtual-AreaCliente.md` (decisões E1–E6 abaixo)
- SPEC: `tracking/specs/SPEC-LojaVirtual-AreaCliente.md`
- WIRE: `tracking/wireframe/WIRE-LojaVirtual-AreaCliente.md`

**Decisões do fundador (16/09/2026):**

| # | Decisão | Resolução |
|---|---|---|
| E1 | Verificação de identidade | **Telefone puro na semana de testes** — sem senha, sem código. **OTP via WhatsApp registrado como evolução obrigatória antes de cliente real** (PRD §6: tabela `loja_login_otp` + Evolution/n8n + `SECURITY DEFINER`) |
| E2 | Conteúdo da área | **Só pedidos** (lista com status) — dados editáveis ficam para v2 |
| E3 | Escopo da sessão | **Por loja** — chave `uniq_loja_sessao_<slug>`; lookup sempre por `(empresa_id, telefone)` |
| E4 | Onde o login acontece | **Navegação sempre livre** (vitrine/produto/sacola nunca pedem login); identificação **só no checkout** (telefone de "Seus dados" é o login) e em `/entrar` para "Meus pedidos"; com sessão, checkout pré-preenche |
| E5 | Duração da sessão | **24 horas** (sliding — renova a cada acesso) |
| E6 | Porta de entrada | **Botão "Entrar" sempre visível no header da vitrine** quando deslogado (logado vira "Meus pedidos") |

**Escopo previsto (SPEC §9):** hook `use-loja-sessao.ts` · telas `/loja/:slug/entrar` e `/loja/:slug/conta` (guarda de sessão) · `/loja/:slug/pedidos` → redirect para `/conta` · auto-login no sucesso do checkout · header Entrar/Meus pedidos · Sair preserva carrinho.

**Já valendo desde o módulo Loja Virtual:** primeira compra **salva o cliente automaticamente** em `me_cliente` (`origem='loja'`, find-or-create por telefone) — o cliente aparece no CRM da Base UNIQ.

---

### 🔴 CORREÇÃO — Grão multi-tenant das conversas (17/09/2026)

**WHY:** um cliente que já tinha conversa gravada na empresa A não conseguia ter conversa na empresa B. O sintoma parecia "o telefone é a chave", mas a causa real era `crm_chat_conversas.id` **ser** o telefone — e sendo `PRIMARY KEY`, um telefone só podia existir **uma vez no banco inteiro**, em qualquer tenant.

**Status:** ✅ CONCLUÍDO — migração aplicada em produção e verificada.

**Diagnóstico (fatos verificados no banco):**

| Item | Antes | Depois |
|---|---|---|
| `crm_chat_conversas.id` | `text` PK = telefone (ex.: `5511941484562`) | `uuid` surrogate |
| `canal_id` (onde o telefone deveria morar) | `NULL` em 100% das linhas | `varchar(100)` NOT NULL = telefone |
| Unicidade | PK global em `id` → 1 telefone por banco | `UNIQUE (empresa_id, canal, canal_id)` |
| `crm_chat_mensagens.conversa_id` | `text` | `uuid` (FK `ON DELETE CASCADE`) |
| RLS por empresa | ✅ já correta | ✅ recriada idêntica (dependência de coluna) |

**Migração:** `supabase/migrations/20260917220000_conversa_multi_tenant_por_empresa.sql`

Detalhe não óbvio que a migração trata: as políticas de RLS de `crm_chat_mensagens` referenciam `crm_chat_conversas.id` num subselect — sem derrubá-las antes, o Postgres recusa o `DROP COLUMN`. Elas são recriadas ao final, idênticas.

**Contrato novo para o n8n:** o workflow **não deve mais gravar `id = telefone`**. Passa a chamar:

```sql
select public.fn_ingest_whatsapp(p_empresa_id, p_telefone, p_nome);
```

- Upsert idempotente por `(empresa_id, 'whatsapp', telefone)` — chamar a cada mensagem não duplica conversa.
- O tenant vem da **instância/número que recebeu** a mensagem (1 número dedicado por empresa — confirmado com o fundador).
- `vw_conversas_por_telefone` existe como compatibilidade **somente leitura** durante o rollout.
- `id_legado` preserva o telefone original (rastreabilidade/rollback).

**Verificação executada (produção):**

| Check | Resultado |
|---|---|
| Conversas / mensagens preservadas | 22 / 691 (idêntico à baseline) |
| Mensagens órfãs | 0 |
| `canal_id` divergente do telefone original | 0 |
| Mesmo telefone em 2 tenants → 2 conversas distintas | ✅ comprovado |
| Idempotência (2ª chamada do RPC) | ✅ mesmo id retornado |
| Políticas de RLS em `crm_chat_mensagens` | 3 (restauradas) |

**⚠️ Pendências:**
- **n8n (lado do fundador):** trocar o upsert por `fn_ingest_whatsapp`. É uma dependência **externa a este repo** — a correção do banco não basta sozinha enquanto o workflow gravar `id = telefone`.
- **Bug 2 (frontend, não corrigido):** `src/app/components/crm/ClienteConversaResumo.tsx:40-63` consulta `crm_chat_conversas` **sem filtro de `empresa_id`**, casando por nome/telefone. Só não vaza entre tenants porque a RLS barra, mas pode anexar a conversa errada ao cliente. Correção: filtrar por `empresa_id` (ou reusar `useConversasReais`). Aguarda aval do fundador — `AGENTS.md` exige WIRE aprovado antes de código de tela.

---

### 🔵 SEMANA 1 — Fio de Prumo

**WHY:** provar que a arquitetura conecta. Uma mensagem real atravessando o sistema. Não é construir tudo — é validar a fundação.

**Tarefas:**

| # | Ação | Onde / Tabelas envolvidas | Critério de aceite | Dep. |
|---|---|---|---|---|
| 1.1 | ✅ Corrigir o project URL do Supabase | `src/lib/supabase.ts` (trocar `eqyvic...` → `krrkfgv...`); revisar edge function em `CadastroPage.tsx` | `list_tables` retorna 2 empresas, 18 conversas | Decisão #0 |
| 1.2 | ✅ Criar um hook/consulta de conversa real a partir do banco | `crm_chat_conversas`, `crm_chat_mensagens` | Dado real saindo do banco, não de mock | 1.1 |
| 1.3 | ✅ Login funcional puxando usuário/empresa reais | `me_usuario`, `me_empresa`; `AuthContext.tsx` | Login autentica e carrega dados do usuário/empresa reais | 1.1 |
| 1.4 | ✅ Renderizar 1 conversa real numa tela do CRM | Tela CRM (`/chatbot`); tabelas acima | **1 conversa real do WhatsApp aparece de ponta a ponta** | 1.2, 1.3 |

**Gate da semana (tudo ou nada):** uma conversa real do `crm_chat_conversas` aparece na tela, vinda do banco oficial.

**SDD:** PRD do "Fio de Prumo" + SPEC da consulta de conversa + WIRE da tela de conversa no CRM. Sem isso, não codar 1.4.

**Plano B:** se o auth não fechar em tempo, renderizar 1 conversa **somente leitura** (RPC simples) para provar a ponte, e fechar o login logo em seguida.

---

### 🟡 SEMANA 2 — Cadeia completa na Doceê

**WHY:** a demonstração inteira funcionando em um negócio real (Doceê). A esposa do fundador testa como usuária prática, pegando o que quem está na construção deixa passar.

**Tarefas:**

| # | Ação | Onde / Tabelas | Critério de aceite | Dep. |
|---|---|---|---|---|
| 2.1 | ✅ Pedido do WhatsApp aparece no CRM como lead/cliente | `crm_leads` / `me_cliente`; fluxo n8n → insert | Pedido real vira registro no CRM | 1.1 (Gate S1) |
| 2.2 | ✅ Pedido contabilizado | **RPC `registrar_venda`** → `me_venda`, `me_contas_receber` | Chamar a RPC cria a venda + conta a receber | 2.1 |
| 2.3 | ✅ Pedidos integrados ao banco + criação manual | `me_venda` / `me_cliente` | Pedido criado manualmente aparece na lista | 2.2 |
| 2.4 | Corrigir o que quebrar no uso real | — | Partes da cadeia estáveis no uso real | 2.3 |
| 2.5 | ✅ CRUD de produtos integrado ao Supabase | `me_produto` | Produto cadastrado aparece na lista | 2.3 |
| 2.6 | ✅ Segurança: isolar dados por empresa | Todos os hooks | Usuário só vê dados da sua empresa | Crítico |
| 2.7 | ✅ Financeiro integrado ao banco (Receber + Pagar) | `me_contas_receber` / `me_contas_pagar` | Contabilizar venda aparece no Financeiro | 2.2 |
| 2.8 | ✅ Configurações de tags do CRM | `me_tag`; `ConfiguracoesCRMPage` (`/crm/configuracoes`) | Tag criada aparece nas configurações e aplicável aos clientes | 2.1 |
| 2.9 | ✅ Produtos no criar pedido + Novo Cliente persistido | `me_itens_venda` / `me_cliente`; `useCriarPedido` / `useCriarCliente` | Pedido criado com produto selecionado e cliente persistido no banco | 2.3 |

**Gate:** a Doceê opera pela Base UNIQ sem voltar para o caderno/WhatsApp solto.

**SDD:** SPEC da integração n8n → `crm_leads`/`me_cliente` (em 12/09/2026: fluxo novo grava direto em `me_cliente`); WIRE do fluxo "pedido → contabilizado".

**Documentos criados (T2.1):**
- PRD: `tracking/plans/PRD-Semana2-T2.1-PedidoWhatsApp-CRM.md`
- SPEC: `tracking/specs/SPEC-Semana2-T2.1-PedidoWhatsApp-CRM.md`
- WIRE: `tracking/wireframe/WIRE-Semana2-T2.1-LeadsWhatsApp.md`

**Implementação concluída (T2.1):**
- `/crm/clientes` integrado ao Supabase (`crm_leads`) com fallback mock (em 12/09/2026 migrado para `me_cliente`)
- Badge de origem WhatsApp/Manual nos cards e tabela
- Filtro por origem (WhatsApp / Manual / Todas)
- `/crm/clientes/:id` com badge de origem e nova aba "Conversa" (resumo das mensagens)

**Documentos criados (T2.2):**
- PRD: `tracking/plans/PRD-Semana2-T2.2-ContabilizarVenda.md`
- SPEC: `tracking/specs/SPEC-Semana2-T2.2-ContabilizarVenda.md`
- WIRE: `tracking/wireframe/WIRE-Semana2-T2.2-ContabilizarVenda.md`

**Implementação concluída (T2.2):**
- Hook `useRegistrarVenda` com fallback para empresa/cliente padrão
- Botão "Contabilizar venda" em `/vendas/pedidos/:id` (visível quando pagamento confirmado)
- Modal de confirmação com resumo do pedido
- Chamada à RPC `registrar_venda` criando venda + conta a receber
- Feedback visual: toast sucesso/erro + badge "Venda contabilizada"

**Fluxo n8n — pedido WhatsApp → RPC (12/09/2026 design · 15/09/2026 implementado ✅):**
> Elo da cadeia: tool `docee_grava-pedido` → sub-workflow executor `docee_criarpedido` → RPC `registrar_venda`. **AI escolhe, banco decide**: a tool recebe a intenção (`[{nome, quantidade}]` como array de objetos), o sub-workflow reconstrói `p_itens` com dados canônicos de `me_produto` (id, nome, preço), verifica estoque, recalcula `p_valor_total` e chama `registrar_venda` com `p_origem='whatsapp'` / `p_status='confirmada'`.
- PRD: `tracking/plans/PRD-DoceE-FluxoN8n-PedidoParaRPC.md`
- SPEC (montagem passo a passo na UI do n8n): `tracking/specs/SPEC-DoceE-FluxoN8n-PedidoParaRPC.md`
- **Sub-workflow montado (15/09/2026):** nó 1 "Parse p_itens" (parse defensivo) → nó 2 "Buscar Produtos" (GET `me_produto` filtrado por `empresa_id`, credential `UNIQ-uat4`) → nó 3 "Montar payload" (Code, **Run Once for All Items**: resolve produto por nome no banco, valida estoque, recalcula total, fixa status/origem) → nó 4 "HTTP Request" (POST `/rest/v1/rpc/registrar_venda`, credential `UNIQ-uat4`, body `={{ $json }}`).
- **Teste verde (execução 4363, venda `0c901c4a`):** 2× "Surpresa de Uva" → `me_venda` R$ 16,00 status `confirmada` canal `whatsapp` · `me_itens_venda` id 62 × 2 @ R$ 8 · estoque 62: 10→8 · conta a receber R$ 16 venc. 15/10/2026 · forma Pix.
- **Pendente:** ativar `docee_criarpedido` + salvar `atendente_Docee` + teste real no WhatsApp da Doceê (critérios de aceite do PRD). Observação: `p_forma_pagamento` pode gravar minúsculo ("pix") na conta a receber — sugerir à AI "Pix" capitalizado.

**Correção — duplicidade de clientes WhatsApp × loja (16/09/2026 ✅):**
> **Problema:** o fluxo `atendente_Docee` decidia "cliente novo?" por **"tem conversa?"** (IF em `Grava Novo Cliente`), não por "tem cadastro?". Sem conversa prévia, `Cria_Cliente` inseria sem checar telefone — criando duplicados em `me_cliente` (2 encontrados na mesma empresa, e.g. `5511941484562` em 13/09/2026). O fluxo da loja já era correto (find-or-create por telefone normalizado).
- **Banco — migration `20260916_normaliza_telefone_me_cliente` (aplicada 16/09/2026):** função `fn_normalizar_telefone` (IMMUTABLE, espelha `normalizarTelefoneLoja`); trigger `trg_me_cliente_normaliza_telefone` (BEFORE INSERT OR UPDATE OF telefone); backfill de normalização; merge idempotente dos duplicados via `DO $dedup$` (vencedor por mais campos preenchidos → `criado_em` mais antigo, reaponta as 9 tabelas filhas); índice único parcial `ux_me_cliente_empresa_telefone (empresa_id, telefone) WHERE telefone IS NOT NULL` como rede de segurança. Verificado: `com_duplicado=0`, 18 linhas, todos os telefones em formato canônico `55`+DDD+9; trigger e índice presentes.
- **n8n — workflow `atendente_Docee` (64 nós, ativo):** adicionados `Consulta Cliente` (Supabase GET `me_cliente` por `telefone` + `empresa_id`) e `Cliente Ja Cadastrado` (IF `$json.id` notEmpty) entre `Criar_Conversa1` e `Cria_Cliente`; se já cadastrado → `Wait4` (só cria/atualiza conversa); senão → `Cria_Cliente`. Validação n8n: 0 erros, 0 warnings. Testes ponta a ponta: INSERT duplicado falha com `23505`; trigger normaliza máscaras; consulta por telefone real retorna o cliente (não recria).

**Documentos criados (T2.3):**
- PRD: `tracking/plans/PRD-Semana2-T2.3-PedidosBanco.md`
- SPEC: `tracking/specs/SPEC-Semana2-T2.3-PedidosBanco.md`
- WIRE: `tracking/wireframe/WIRE-Semana2-T2.3-PedidosBanco.md`

**Implementação concluída (T2.3):**
- Hook `usePedidos` com fallback para mock
- Hook `useCriarPedido` criando registro em `me_venda`
- Botão "Novo Pedido" + modal de criação manual
- Lista de pedidos integrada ao banco com fallback mock
- Cliente criado automaticamente se não existir

**Documentos criados (T2.5):**
- PRD: `tracking/plans/PRD-Semana2-T2.5-ProdutosBanco.md`
- SPEC: `tracking/specs/SPEC-Semana2-T2.5-ProdutosBanco.md`
- WIRE: `tracking/wireframe/WIRE-Semana2-T2.5-ProdutosBanco.md`

**Implementação concluída (T2.5):**
- Hook `useProdutos` com fallback para mock
- Hook `useCriarProduto` inserindo em `me_produto`
- Hook `useAtualizarProduto` para edição
- Lista de produtos integrada ao banco
- Loading skeleton e indicador de fallback
- Recarrega lista após criar produto
- Modal de criação corrigido (agora salva no banco)
- Exclusão de produto (soft delete) com modal de confirmação
- Botão excluir disponível no grid (hover) e na lista
- Grid mobile com gap reduzido

**Ajustes adicionais (T2.5):**
- Lista de pedidos (`/vendas/pedidos`) com cards mobile otimizados
- KPIs e filtros enxutos no mobile
- Fluxo de status do pedido desacoplado de pagamento
- Nome do cliente exibido corretamente na lista de pedidos
- `usePedido` (detalhe) integrado ao banco

**Documentos criados (T2.8):**
- PRD: `tracking/plans/PRD-Semana2-T2.8-ConfiguracoesTags.md`
- SPEC: `tracking/specs/SPEC-Semana2-T2.8-ConfiguracoesTags.md`
- WIRE: `tracking/wireframe/WIRE-Semana2-T2.8-ConfiguracoesTags.md`

**Implementação concluída (T2.8 — commit `3de7bfc`, 11/09/2026):**
- Hook `use-tags.ts` sobre `me_tag` (listar ativas por empresa, criar — erro 23505 de nome duplicado —, desativar via soft delete; fallback mock)
- Nova rota `/crm/configuracoes` (`ConfiguracoesCRMPage`) para gerenciar tags do CRM (nome + cor, remover)
- `ClientesPage`: filtro de tags e chips usam as tags configuradas (fallback mock)
- **Resolve USO REAL #12** (tags configuráveis + Novo Cliente persistido)

**Documentos criados (T2.9):**
- PRD: `tracking/plans/PRD-Semana2-T2.9-ProdutosNoPedido.md`
- SPEC: `tracking/specs/SPEC-Semana2-T2.9-ProdutosNoPedido.md`
- WIRE: `tracking/wireframe/WIRE-Semana2-T2.9-ProdutosNoPedido.md`

**Implementação concluída (T2.9 — commit `3de7bfc`, 11/09/2026):**
- Hook `use-criar-cliente.ts` persistindo o cliente do modal "Novo Cliente" em `me_cliente` (`origem manual`, com tags) — **migrado de `crm_leads` em 12/09/2026** (decisão do fundador: CRM inteiro passa a usar `me_cliente`, a fonte única; `crm_leads` vira legado, dados preservados); resolve USO REAL #12
- `useCriarPedido` aceita `itens`: cria/usa cliente em `me_cliente` (find-or-create por `nome_cliente` + `empresa_id`), grava pedido em `me_venda` e itens em `me_itens_venda` (com `venda_id`; `valor_total` = soma dos itens)
- `PedidosListaPage`: seção "Produtos do pedido" no modal de criação (select de `me_produto` via `useProdutos`, quantidade ±, total automático; valor manual vira somente-leitura quando há itens; descrição auto-gerada)
- Sem itens → fluxo anterior preservado (valor manual + descrição obrigatória)

**Documentos criados (T2.10 — Detalhe do Pedido Sem Mock, 15/09/2026):**
- PRD: `tracking/plans/PRD-Semana2-T2.10-DetalhePedidoSemMock.md`
- SPEC: `tracking/specs/SPEC-Semana2-T2.10-DetalhePedidoSemMock.md`
- WIRE: `tracking/wireframe/WIRE-Semana2-T2.10-DetalhePedidoSemMock.md`

**Status (T2.10):** ✅ CONCLUÍDO (15/09/2026) — WIRE aprovado, implementado e build validado.

**Implementação concluída (T2.10 — commit, 15/09/2026):**
- Migration aplicada no Supabase (krrkfgv...): `me_venda.codigo_rastreio`, `me_venda.motivo_cancelamento`, `me_venda.frete numeric DEFAULT 0` + tabela `me_venda_historico` (status/observacao/codigo_rastreio/responsavel_usuario_id/criado_em, índice `(venda_id, criado_em)`)
- `use-pedido.ts`: busca `me_venda_historico` ordenado; mapeia endereço, `npedido` (fallback sintético), PF/PJ por `cpf_cnpj` (14 díg), `frete`, `codigoRastreio`, `motivoCancelamento` reais
- `use-atualizar-status-pedido.ts`: aceita `observacao` + `codigoRastreio`; grava `codigo_rastreio`/`motivo_cancelamento` na venda e INSERT na `me_venda_historico` (com `perfil.id` como responsável)
- `PedidoDetalhePage.tsx`: ações de status/rastreio/cancelamento persistem no banco no modo real; timeline reconstruída em memória **somente** no fallback mock; espelho local mínimo no modo real
- Checklist do SPEC verificado; `npm run build` ✅

**Escopo (resumo do diagnóstico mock vs real do detalhe do pedido):**

| Campo | Hoje | Correção |
|---|---|---|
| Código de rastreio | estado local (some ao recarregar) | coluna `me_venda.codigo_rastreio` + persiste no histórico |
| Motivo de cancelamento | estado local | coluna `me_venda.motivo_cancelamento` |
| Timeline/histórico | 1 entry + estado local | tabela `me_venda_historico` (INSERT a cada mudança de status) |
| Endereço de entrega | só no mock | mapear endereço já existente em `me_cliente` |
| Nº do pedido | `PD-2026-HASH` sintético | usar `me_venda.npedido` quando existir |
| PF/PJ | sempre "Pessoa Física" | derivar de `me_cliente.cpf_cnpj` |
| Frete | sempre 0 | coluna `me_venda.frete` (default 0) |

**Já real (não refazer):** dados da venda, cliente (nome/telefone/email/doc), itens + fotos, status de pagamento (`me_contas_receber`), atualizar status, confirmar pagamento, contabilizar venda (RPC).

**📌 Fluxo de status do pedido — evolução (15/09/2026, commits `c519eca` + `6336016`):**

Decisão do fundador após validar na Vercel: **pedido que chega do n8n/WhatsApp deve entrar como "Recebido"**, e o **"Confirmado" vira ação manual do operador** (antes o `confirmada` do banco aparecia direto como "Pago", e depois como "Confirmado" automático).

| Status DB (`status_venda`) | Badge na tela | Transições (`NEXT_STATUS`) |
|---|---|---|
| `pendente` | ⏳ Aguardando | → Em Separação / Cancelado |
| `confirmada` (n8n/whatsapp) | 📥 **Recebido** | → **Confirmado** / Cancelado |
| `confirmado` (ação do operador) | 📩 Confirmado | → Em Separação / Cancelado |
| `pago` | ✅ Pago | (pagamento — `me_contas_receber`) |
| `separacao` / `enviado` / `entregue` / `cancelado` | iguais ao label | fluxo de fulfillment |

- Arquivos: `mapStatusVenda` em `use-pedido.ts`/`use-pedidos.ts` (confirmada→recebido, confirmado→confirmado), `STATUS_CONFIG`/`NEXT_STATUS` em `pedidosMockData.ts`, filtros da `PedidosListaPage`
- **Regra de ouro:** nunca mais mapear `confirmada → pago` (implicava pagamento que não existe) — pagamento real só vem de `me_contas_receber.status = 'pago'`
- RPC `registrar_venda` e fluxo n8n **não mudam**: continuam gravando `confirmada` (o front exibe Recebido) — ver `SPEC-DoceE-FluxoN8n-PedidoParaRPC.md`

**🔒 Segurança — Isolamento por empresa (T2.6):**
- **Problema:** Hooks de leitura não filtravam por `empresa_id` — qualquer usuário via dados de todas as empresas
- **Hooks afetados:** `use-clientes`, `use-cliente`, `use-pedidos`, `use-pedido`, `use-produtos`, `useConversasReais`
- **Correção:** Adicionar `.eq("empresa_id", empresaId)` em todas as queries, usando contexto de auth
- **Status:** ✅ Concluído (10/09/2026) — hooks corrigidos, Dashboard usa nome real

**🔧 Corrigir o que quebrar no uso real (T2.4) — ajustes registrados:**

> Supabase oficial (`krrkfgv...`) em uso real pela Loja Teste01 (esposa do fundador). Correções feitas no campo de pedidos para persistir de verdade no banco, eliminando ações "toast-only" que pareciam funcionar mas não gravavam.

**1. Status do pedido persistido no banco (commits `718f4d8`, `d35c630`):**
- **Problema:** "Atualizar status" no modal da lista e no detalhe do pedido só mostrava toast — o `me_venda.status_venda` nunca mudava (venda ficava "aguardando" no banco).
- Novo hook `useAtualizarStatusPedido` que grava `status_venda` + atualiza `atualizado_em` em `me_venda` por `id`.
- Integrado no modal da lista (`PedidosListaPage`), no detalhe (`PedidoDetalhePage`) e no cancelamento de pedido.
- **Ação em massa:** botão "Atualizar status" da barra de seleção agora abre o mesmo modal e aplica o status em todos os pedidos selecionados (era toast fake).
- Guarda `!isFallback` — em dados mock (demo) mantém comportamento local.

**2. Confirmar pagamento persistido no banco (commit `d877880`):**
- **Problema:** "Confirmar pagamento" no detalhe do pedido só alterava estado local — ao reabrir, o pedido continuava "pendente".
- **Fonte da verdade:** o pagamento vive em `me_contas_receber.status` (`pago`), vinculado à venda via `venda_id` (`me_venda` não tem coluna de status de pagamento).
- Novo hook `useConfirmarPagamento` (upsert):
  1. Procura conta a receber vinculada (`venda_id`) → marca `status='pago'` + `data_pagamento` + `valor_pago`;
  2. Se não há vínculo, procura conta pendente da mesma empresa com mesmo valor (venda contabilizada sem `venda_id`) e vincula; 
  3. Senão, cria conta nova já paga vinculada à venda.
- `usePedido` / `usePedidos`: `statusPagamento` agora deriva do banco (`conta pago → "confirmado"`), em vez de fixo `"pendente"` — badge e botão "Contabilizar venda" refletem o estado real.
- **Validação:** fluxo testado em transação com ROLLBACK contra o banco oficial (venda R$ 8,00 da Loja Teste01 vincula e marca paga a conta existente `783c05d7...`). RLS segue desabilitado (ver P5).

**Número confirmado:** `5511919153508` (Doceê / HQ Gráfica) — usar este canal ao duplicar o fluxo n8n.

**3. Layout mobile do detalhe do pedido (commit `d7a554e`):**
- **Problema:** no mobile, o detalhe do pedido ficava espremido — ações de status/contabilizar, banner de pagamento pendente e rastreio "sem código" apertados em telas ~360px.
- Ações do pedido (Atualizar status / Contabilizar venda / Venda contabilizada) agora ficam em **linha própria abaixo do título no mobile** com `flex-wrap` (no desktop permanecem ao lado, com Imprimir).
- Banner "Pagamento pendente" empilhado no mobile (texto + botão de largura total com alvo de toque maior).
- Rastreio sem código empilhado no mobile com botão de largura total.
- Modais de status, rastreio e contabilizar viraram **bottom-sheet no mobile** (`rounded-t-3xl` + handle visual), com botões empilhados (Confirmar em cima) e padding reduzido; valores do resumo de contabilizar com `truncate`.
- **Fluxo intacto:** nenhuma mudança em handlers/hooks — só classes responsivas.

**4. Crash da aplicação — erro React #310 (commit `d855236`, 11/09/2026):**
- **Problema:** toda a aplicação autenticada quebrava com `Minified React error #310` ("Rendered more hooks than during the previous render") em produção (bundle `index-BXZQFNRw.js`).
- **Causa:** `src/app/components/layout/AppLayout.tsx` chamava 4 hooks (`useMemo` de `visibleRailItems`, 2× `useState` do menu mobile, `useEffect` do ESC) **depois** dos early returns `if (loading)` e `if (!user)`. No primeiro render rodavam 10 hooks; após a autenticação, tentavam 14 → pico de hooks entre renders → crash.
- **Correção:** os 4 hooks foram movidos para **antes** dos early returns — agora os 14 hooks rodam incondicionalmente em todo render, e os guards `if (loading)` / `if (!user)` só decidem o que renderizar.
- **Validação:** `npm run build` OK · deploy Vercel READY (bundle novo `index-HNn9U55O.js`) · console sem erro #310 · confirmado funcionando pelo fundador.

**5. DRE passou a incluir contas a pagar em aberto (11/09/2026):**
- **Problema:** contas a pagar **pendentes/vencidas** não apareciam no DRE — o hook `use-dre.ts` só somava contas com `status='pago'` + `data_pagamento` no mês (regime de caixa puro). Ex.: "BARRA DE CHOCOLATE BRANCO" (R$ 98,00, pendente, venc. 25/09) sumia do resultado e o lucro ficava maior que a realidade.
- **Decisão do fundador:** incluir pendentes no DRE (regime de competência para despesas em aberto).
- **Correção:** `use-dre.ts` agora faz 3 queries em paralelo — vendas (criado_em), contas **pagas** (data_pagamento, valor_pago) e contas **em aberto** (`status` `pendente`/`vencido`, data_vencimento, valor). Despesas do mês = pagas + em aberto; categorias do gráfico agregam ambos. Fluxo de Caixa permanece só com pagas (é regime de caixa por natureza).
- **Validação:** SQL espelhou a lógica do hook (set/2026 Loja Teste01: 2 vendas R$ 15,00 + 1 em aberto R$ 98,00 → prejuízo R$ 83,00) · `npm run build` OK · deploy Vercel.

**6. CRM migrado de `crm_leads` → `me_cliente` (12/09/2026):**
- **Decisão do fundador:** o CRM inteiro (lista, detalhe, criar, editar) passa a usar **`me_cliente`** como fonte única — sem dual-write. `crm_leads` continua existindo (dados preservados) mas o app não lê mais.
- **Banco (migration `me_cliente_tags_e_merge_crm_leads`):**
  - `ALTER TABLE me_cliente ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'` (tags continuam vindas de `me_tag`);
  - Merge idempotente dos leads existentes por `empresa_id` + (telefone normalizado OU nome case-insensitive OU email) → UPDATE no cliente correspondente (coalesce de telefone/origem, tags unidas). Não correspondendo → INSERT.
  - Verificado: Luan da Doceê (`1d82914a...`) absorveu telefone `(55) 11997-5190`, `origem=manual`, `tags=['ULTRA']`; sem duplicatas.
- **Hooks migrados (4):** `use-clientes.ts` (lista + mapper `mapClienteToCliente`), `use-cliente.ts` (detalhe), `use-criar-cliente.ts` (INSERT `{empresa_id, nome_cliente, telefone, email, origem:'manual', tags}`), `use-atualizar-cliente.ts` (UPDATE `{nome_cliente, telefone, email, tags}` — `atualizado_em` fica com o trigger `set_timestamp_me_cliente`).
- **Mapeamento:** `status` ← `ativo` (inativo iff `ativo=false`); `ultimaInteracao` ← `atualizado_em || criado_em`; `dataCadastro` ← `criado_em`; `cidade` fallback "Suzano / SP"; `totalCompras=0`; tag "WhatsApp" injetada quando `origem='whatsapp'`.
- **Validação:** `npm run build` OK (3559 módulos, 17.12s) · grep `crm_leads` no `src` = 0 ocorrências · merge conferido no banco oficial.

---

### 🟠 SEMANA 3 — Reutilização (HQ Gráfica) + Material

**WHY:** provar que o módulo é **lego** (default + vertical) e transformar a operação em material de venda.

**Tarefas:**

| # | Ação | Onde | Critério de aceite | Dep. |
|---|---|---|---|---|
| 3.1 | Replicar para a **HQ Gráfica** (segundo negócio) | Nova empresa em `me_empresa` + mesma cadeia | A mesma cadeia roda para outro ramo sem recriar módulo | Gate S2 |
| 3.2 | Gravar a operação em vídeo (case interno) | — | Case documentado (prova real, não slides) | 3.1 |
| 3.3 | Landing · proposta comercial · termo de co-fundador | `src/app` (landing), docs | Kit de venda pronto | — |
| 3.4 | Check final da cadeia de demonstração | — | Cadeia 100% funcional para a visita | 3.1, 3.3 |

**Gate:** visita à ótica liberada (cadeia (a) funcionando para 2 ramos e (b) material de venda pronto).

**SDD:** PRD/SPEC/WIRE da **Landing Page** (tela nova) — feita aqui porque é material de venda, e vira a base do funil na Semana 4.

**Documentos criados (T3.3):**
- PRD: `tracking/plans/PRD-Semana3-T3.3-LandingPage.md`
- SPEC: `tracking/specs/SPEC-Semana3-T3.3-LandingPage.md`
- WIRE: `tracking/wireframe/WIRE-Semana3-T3.3-LandingPage.md`

**Status (T3.3):** 🔶 SDD pronto (11/09/2026) — aguardando aprovação do WIRE pelo fundador para implementar. Rota `/` passa de redirect p/ login a landing pública; CTA "Falar com a MEL" é âncora nesta semana (chat híbrido entra na S4 — regra de sequência preservada).

---

### 🔴 SEMANA 4 — Funil de Aquisição (Landing + MEL)

**WHY:** automatizar o levantamento de leads — a MEL faz o SPIN, o fundador só fecha e entrega. Protege as 16h.

**Tarefas:**

| # | Ação | Onde / Tabelas | Critério de aceite | Dep. |
|---|---|---|---|---|
| 4.1 | Landing com botão **"Falar com a MEL"** | Landing (da S3) | Botão abre o chat | 3.3 |
| 4.2 | Chat na landing: MEL se apresenta → **captura WhatsApp cedo** (híbrido) | n8n webhook → insere em `mel_consultoria` (`nome_cliente`, `n_telefone`) | MEL se apresenta, pergunta com quem fala e captura o WhatsApp | 4.1 |
| 4.3 | MEL conduz **SPIN** e grava | `mel_consultoria` (Situação/Problema/Implicação/Necessidade) + `mel_validacao_dores` (dor, gravidade, citação) | Entrevista estruturada persiste nas tabelas do funil | 4.2 |
| 4.4 | **Documento de necessidades** renderizado na Base UNIQ | Tela que lê `mel_consultoria` + `mel_validacao_dores` | Fundador vê a dor e a solução desenhada na plataforma | 4.3 |
| 4.5 | **LGPD antes de subir** | Política de privacidade na landing + consentimento no chat + regra de retenção | Nada de dados de lead sem consentimento explícito | — |

**Gate:** funil (1 lead → SPIN → documento) funcionando de ponta a ponta, com LGPD resolvido.

**SDD:** PRD do funil, SPEC da integração chat→MEL→tabelas, WIRE do documento de necessidades.

**Regra rígida:** o funil **não entra no ar** antes da cadeia de demonstração (Gate S3) funcionar. Queimar lead em Suzano não volta.

---

### ⚫ SEMANA 5 — Integração Funil ↔ Base + 1º Lead Real

**WHY:** fechar o ciclo e gerar pipeline dos co-fundadores 2–4.

**Tarefas:**

| # | Ação | Onde | Critério de aceite | Dep. |
|---|---|---|---|---|
| 5.1 | Fluxo completo: landing → SPIN → doc na plataforma → retorno humano | Tabelas do funil + Base UNIQ | Lead percorre tudo e o retorno é agendado | Gate S4 |
| 5.2 | **Primeiro lead real** passando pelo funil | Produção | Um negócio real de Suzano passa do funil e gera retorno | 5.1 |
| 5.3 | Ajustes finos | — | Funil estável | 5.2 |

**Entregável:** ciclo de aquisição operando de ponta a ponta e alimentando o pipeline da Onda 1.

---

## 🖼️ IMAGEM DE PRODUTO (16/09/2026) — WIRE aprovado, implementação em andamento

**WHY:** a vitrine e o catálogo da Doceê vendem sem foto (placeholder de caixa); a esposa cadastra produtos sem anexar imagem. A foto do produto deve viver no Supabase Storage (decisão do fundador).

**Status:** ⚡ WIRE **aprovado pelo fundador** (16/09/2026) — implementação delegada ao @fixer (task `unk-1` / `ses_f55fc7...`); ao terminar: reconciliação + build + **commit e push** para a Vercel validar no celular.

**Documentos:**
- PRD: `tracking/plans/PRD-ImagemProduto.md` (D1–D5: bucket `uniq_me_produtos` · 1 foto v1 · upload no salvar · path `{empresaId}/{uuid}.{ext}` · máx 5 MB)
- SPEC: `tracking/specs/SPEC-ImagemProduto.md` (hook novo `use-upload-produto.ts` + seção de foto no `ProdutoFormModal` + foto no grid/detalhe)
- WIRE: `tracking/wireframe/WIRE-ImagemProduto.md`

**Pesquisa (nada de migration — backend já pronto):**
- `me_produto.foto_url` já existe (text nullable) · bucket público `uniq_me_produtos` já existe · políticas RLS corretas (INSERT/UPDATE/DELETE authenticated, SELECT public)
- Hooks de leitura já mapeiam `foto_url` (estoque, loja, pedidos); `useCriarProduto`/`useAtualizarProduto` já aceitam `fotoUrl`
- **Gap único:** nenhum `storage.upload` existe no app; `ProdutoFormModal` não tem campo de foto; grid/detalhe ignoram `produto.foto`

**Implementação (escopo delegado ao @fixer):**
- `src/app/hooks/use-upload-produto.ts` (novo) — upload para `uniq_me_produtos` + `getPublicUrl`; validação image/* e ≤ 5 MB
- `src/app/components/estoque/ProdutoFormModal.tsx` — seção "Foto do produto" (preview + enviar + remover) e `fotoUrl` no save
- `src/app/components/estoque/ProdutosPage.tsx` — `ProdutoGridCard` exibe `produto.foto` (fallback placeholder)
- `src/app/components/estoque/ProdutoDetalhePage.tsx` — header com foto (fallback ícone)
- `src/app/components/estoque/estoqueMockData.ts` — `foto` em 2–3 mocks

---

## 🛍️ VITRINE MODERNA DA LOJA — visão do cliente (17/09/2026)

**WHY:** a vitrine do tenant (`/loja/:slug`) é hoje a versão pobre da loja: sem categorias, sem banner, sem área do cliente no topo, busca abaixo da dobra, carrinho só acessível pela barra do rodapé. A vitrine **demo** (`/loja`) já tem estrutura melhor (busca inline, categorias, hero, seção horizontal) — mas 100% mock ("Studio da Maria"). O fundador pediu estrutura de marketplace (referência: Mercado Livre) — **estrutura, não cores**.

**Status:** ✅ CONCLUÍDO e no ar (commit `df92dd4`, deploy Vercel validado em 17/09/2026) — vitrine nova em `/loja/docee`.

**Documentos:**
- PRD: `tracking/plans/PRD-LojaVirtual-VitrineModerna.md`
- SPEC: `tracking/specs/SPEC-LojaVirtual-VitrineModerna.md`
- WIRE: `tracking/wireframe/WIRE-LojaVirtual-VitrineModerna.md`

**Decisões do fundador (17/09/2026):**

| # | Decisão | Resolução |
|---|---|---|
| V1 | Categorias | Criar famílias próprias da Doceê (Cone Trufado · Trufa · Tortinha · Surpresa · Especial) e atribuir aos 16 produtos |
| V3 | Banner | Consumir `me_empresa.appearance.hero.banners[]` + **banner gerado** como fallback |
| V4 | Editor de banners | **Fora da v1** (editor entra depois, em `/configuracoes/empresa`) |
| V5 | Escopo | **Só a vitrine** `/loja/:slug` + bloco de área do cliente no header |

**Diagnóstico-chave (Research no Supabase oficial):**
- `me_empresa.appearance.hero.banners[]` + `appearance.theme` **já é contrato de dados pronto e populado** (Gráfica HQ e UNIQ) — a Doceê tem `appearance = {}`. **Nenhuma tela lê `appearance` nem `store_config`** (grep em `src/app` = 0) → o consumidor não existe.
- `me_categoria` é real (global + por empresa); "Pães e Doces" (global, id 4) já existe.
- Os 16 produtos da Doceê: `categoria_id = null`, `tipo = 'Outros'`, `preco_varejo` null em todos → **sem selo de desconto real**; todos com `foto_url` e `exibir_vitrine = true`.
- **Buraco no cadastro:** `ProdutoFormModal.tsx:10` monta categorias a partir do **mock** e `use-criar-produto.ts:49` grava em **`tipo`** (texto), não em `categoria_id` — origem do "Outros" em massa. Ponto V2 do PRD.
- `use-loja-produtos.ts:59` não traz `categoria_id`/`preco_varejo`; `use-loja-tenant.ts:42` não traz `store_config`/`appearance`.

**Entregue (17/09/2026 — commit `df92dd4`):**
- Header com identidade, área do cliente (`Entrar` ↔ `Meus pedidos`), carrinho com contador, busca e categorias
- Banner rotativo lido de `me_empresa.appearance.hero` + **fallback gerado do próprio tenant** (nunca de outra loja)
- Categorias reais de `me_categoria`, filtradas pelas que têm produto (barra não renderiza vazia)
- Seção horizontal "Destaques"; selo de desconto **só** com `preco_varejo > preco` (não existe na Doceê → sem selo)
- Grid 2→3→4 colunas, container `max-w-6xl`, radius 8px (token do `DESIGN.md`)
- **Ajuste 17/09 (fundador):** com categoria ativa, banner e Destaques somem **no mobile** (permanecem no desktop); a busca por texto ainda não dispara esse comportamento

**Banner de marca ligado para testes (17/09/2026 — commit `bb9d363`):**
- Dois SVGs de marca — abstratos e **sem texto embutido** (estratégia A) — publicados em `public/banners/` e servidos pela Vercel:
  - `https://base-uniq.vercel.app/banners/docee-banner-desktop.svg` (2240 × 480)
  - `https://base-uniq.vercel.app/banners/docee-banner-mobile.svg` (1080 × 480)
- `me_empresa.appearance` da Doceê (antes `{}`) recebeu `hero.banners[0]` apontando para essas URLs + `theme` (verde menta / radius 8px / Poppins)
- **Verificado com a anon key e a query exata do hook** (`select id, slug, nome_fantasia, logo_url, telefone, store_config, appearance`): 11/11 chaves lidas OK · ambos os arquivos com `HTTP 200` e `Content-Type: image/svg+xml`
- Corrigido no mesmo commit: `normalizarLink` aceitava `product`/`external`/`category` mas **não `grid`** — o tipo existia em `BannerLoja` e no acionador, então um banner com `link_type: "grid"` não renderizava botão
- Frases são placeholder ("Nossos doces" / "Escolha e peça pelo site" / "Ver o cardápio") — trocar pelas do fundador
- ⚠️ **Provisório:** a URL vive no Vercel, não no Storage (bucket exige INSERT `authenticated`; não há `service_role` no ambiente). Migrar para o bucket = 1 UPDATE na URL. O caminho `public/` **não escala por tenant** (trocar arte = deploy)
- **Rollback:** `UPDATE me_empresa SET appearance = '{}'::jsonb WHERE id = '52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f';`

**⏳ AJUSTE PENDENTE — vitrine "pesada" (feedback do fundador, 17/09/2026):**

- Fundador validou o banner na Vercel: **arte aprovada** ("está ótimo").
- Porém a **tela como um todo ficou pesada** — pedido literal: *"vamos deixar de forma mais leve"*.
- ⚠️ O agente **não viu a tela renderizada**: o MCP do Chrome não anexa porque o navegador do fundador ocupa o mesmo perfil (`chrome-profile`). Toda a análise abaixo é inferência, não observação.
- Suspeitas, em ordem de probabilidade:
  1. **Massa escura do banner** — grafite `#1f2937` cobrindo 240px (desktop) / 160px (mobile) de largura total, logo no topo
  2. **Empilhamento antes dos produtos** — banner + seção "Destaques" + barra de categorias, tudo antes do primeiro produto
  3. **Densidade da arte** — círculos sólidos menta + confete + anel tracejado + padrão de pontos
- Candidatos de correção: reduzir a altura do banner · remover ou enxugar "Destaques" (duplica a grade) · aliviar a arte (menos elementos, base menos escura) · mais respiro entre blocos
- **Bloqueio:** aguardando o fundador definir o que "pesado" significa, para não gastar deploy no achismo
- Hooks novos: `use-loja-categorias`, `use-loja-appearance` · estendidos: `use-loja-tenant`, `use-loja-produtos`
- Migration `20260917120000_docee_categorias_vitrine` **aplicada**: 5 categorias da Doceê + `categoria_id` nos 16 produtos (verificado: 16/16, 0 órfãos)
- Verificação: `npm run build` ✅ · tipos ✅ (0 erros nos arquivos da loja) · console sem erro React (#310) · bundle de produção conferido por marcador

**⏳ Pendente — V2 (categoria real no cadastro de produto):** diagnosticado e especificado em `SPEC-LojaVirtual-VitrineModerna.md` §11. `me_produto.tipo` é **tipo de produto** (`simples`/`variavel`/`Outros`), mas `use-produtos`/`use-produto` (linha 50) o leem como categoria e o formulário grava nome de categoria nele — origem do "Outros em massa". **Bug latente:** salvar hoje com uma categoria do mock corromperia `tipo` (verificado: ainda não ocorreu). Aguarda decisão **D-V2.1** (recomendação: preservar `tipo`, usar só `categoria_id` para categoria).

---

## ➕ PENDÊNCIAS QUE DEPENDEM DO FUNDADOR

| # | Item | Necessário antes de | Observação |
|---|---|---|---|
| P1 | **Número de WhatsApp do laboratório** (HQ Gráfica / Doceê) | Semana 2 (2.3) | ✅ Confirmado: `5511919153508` (Doceê / HQ Gráfica) |
| P2 | **GitHub + Vercel** confirmados (preview acessível) | Semana 1 | É como o fundador valida pelo celular |
| P3 | **LGPD** (política, consentimento, retenção) | Semana 4 (4.5) | CEO + Fundador |
| P4 | `DESIGN.md` restante (Voice & Tone, Imagery, Posture, seções duplicadas) | Semana 4 | Antes do funil |
| P5 | **Revisão de segurança RLS** — 54 tabelas do Supabase oficial estão com Row Level Security desabilitado; definir políticas por empresa/usuário antes de dados reais de clientes | Semana 5 / pós-cadeia de demonstração | Levantado na correção do Supabase (08/09/2026); não bloqueia S1–S4, mas é crítico antes de produção com leads reais |

---

## 📋 BACKLOG TÉCNICO (pós-Semana 2)

> Itens identificados durante a implementação da Semana 2 que precisam ser viabilizados em sprints futuras.

| # | Item | Contexto | Prioridade |
|---|---|---|---|
| B1 | **Integrar PDV ao banco de dados** | Hoje o PDV (`/vendas/pdv`) usa apenas mocks (`pdvMockData.ts`). Precisa conectar ao Supabase para criar vendas reais em `me_venda`, baixar estoque (`me_produto`) e registrar pagamentos. | Alta |
| B2 | **Cadastro de produtos/serviços** | Para o PDV funcionar de ponta a ponta, precisa de tela de cadastro de produtos (`me_produto`, `me_servicos`) com preço, estoque, categoria e foto. | Alta |
| B3 | **Autocomplete de cliente no Novo Pedido** | Na tela de criar pedido (`PedidosListaPage`), ao digitar o nome do cliente, buscar no banco (`me_cliente`) e sugerir cadastros existentes — evita duplicar clientes. | Média |
| B4 | **Vincular pedido a cliente existente** | Hoje `useCriarPedido` busca por nome exato. Melhorar para busca fuzzy ou por telefone, e permitir selecionar cliente existente vs criar novo. | Média |
| ~~B5~~ | ~~**Busca de endereço por CEP**~~ | ✅ Resolvido (15/09/2026) — ViaCEP integrado no checkout da Loja Virtual (SPEC-LojaVirtual-DoceE §7); pré-preenche rua/bairro/cidade/UF com campos editáveis. | Fechado |
| ~~B6~~ | ~~**Completar SDD da T2.9**~~ | ✅ Resolvido (11/09/2026) — PRD e WIRE criados em `tracking/plans/` e `tracking/wireframe/`. | Fechado |
| B7 | **Erro TS em `ProdutoDetalhePage.tsx:456` — `tab.badge` possivelmente `undefined`** | Arquivo da lane "Editar Produto" (trabalho paralelo, 12/09/2026). `TABS` (linhas 322–327) tem shapes inconsistentes: só a aba `movimentacoes` tem `badge` (as demais não); a guarda `{"badge" in tab && tab.badge > 0}` (linha 456) não estreita o tipo → LSP: `'tab.badge' is possibly 'undefined'`. **Fix sugerido:** tipar o elemento de `TABS` com `badge?: number` explícito e usar `tab.badge != null && tab.badge > 0` (ou `typeof tab.badge === "number"`). **Dono:** lane Editar Produto (não tocar por esta lane). | Média |
| B8 | **~~"Contabilizar venda" envia `p_itens` sem `produto_id`/`servico_id`~~** | ✅ Resolvido (15/09/2026). Parte 1: `use-pedido.ts` busca `me_itens_venda` (+ `foto_url` via `me_produto`) e popula `itens` no detalhe — validação: venda `0c901c4a`, "Surpresa de Uva" ×2. Parte 2: `ItemPedido` ganhou `produtoId`/`tipoItem`; `ItemVenda` e `handleContabilizar` mandam payload canônico da RPC (`{tipo, id_referencia, nome, quantidade, preco_unitario}`). Commit `de7c86b` (parte 1). | Fechado |

---

## ✅ JÁ CONCLUÍDO (não refazer)

Decision #0 (Supabase oficial) · Diagnóstico real · Plano de 5 semanas aprovado · Preço (R$ 1.500/R$ 297 → R$ 0/R$ 197) · Data de faturamento (5/15/25) · Exit Safe (mar/2027, 18 meses, lançamento jul/2027) · Ondas 4+4 · Módulos default+vertical · Dogfooding · `DESIGN.md` oficial · Wireframe no repo/design no OpenDesign · Vender 2/prometer 1 (pitch) · Canal híbrido · Controle de entrega = CRM+Agenda · Cross-out não usar · Verde petróleo removido · Documento de necessidades = conversa inteira.

*(Detalhes completos em `tracking/CONTEXTO_PROJETO.md`.)*

---

## ✅ DEFINIÇÃO DE PRONTO (Definition of Done) — para toda tela/tarefa

- [ ] Estado visual completo: **loading (skeleton), empty, error, success**.
- [ ] **Mock-first para demo (decidido 07/09/2026):** a tela abre com **dados mockados realistas** quando o banco está vazio/erro, permitindo apresentar o produto mesmo sem dados. Quando houver **dados reais** no Supabase oficial (`krrkfgv...`), a UI **prioriza os reais** (mock só como fallback). Hooks com *fallback*: tenta o banco → se vazio/erro, usa mock. **Nunca tela em branco.**
- [ ] Validação zod em `src/app/lib/validators.ts`; máscaras em `src/app/lib/masks.ts`.
- [ ] Responsivo: 3 colunas (desktop) → 2 (tablet) → 1 (mobile).
- [ ] Acessível: navegação por teclado, ARIA labels, focus management.
- [ ] Dados **reais priorizados** a partir do banco oficial (`krrkfgv...`) quando existirem; mock usado apenas como **fallback** para demo (ver regra de mock-first acima).
- [ ] **Nunca inventar chamada de API** que não exista no banco; usar RPCs reais quando houver (ex.: `registrar_venda`).
- [ ] PRD + SPEC + WIRE criados e aprovados **antes** do código.
- [ ] Tarefa marcada ✅ no `tracking/TRACKING.md` ao concluir; checklist do SPEC 100% verificado.

---

*Kit de construção mantido pelo CEO. Atualizado em 12/09/2026. Fontes: `CONTEXTO_PROJETO.md`, `AGENTS.md`, `DESIGN.md`, schema real do Supabase.*
