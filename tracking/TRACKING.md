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

**Status:** ✅ **CONCLUÍDO** — verificado por inspeção de código em 21/09/2026 (o TRACKING estava desatualizado, registrava "em andamento").
- `src/app/hooks/use-upload-produto.ts:45` — upload para o bucket `uniq_me_produtos` (valida `image/*` e ≤ 5 MB) + `getPublicUrl`
- `ProdutoFormModal.tsx:186` — seção "Foto do produto" (preview / enviar / remover); grava `fotoUrl` no editar (`:99`) e no criar (`:121`)
- `ProdutosPage.tsx:113` (card do grid) e `ProdutoDetalhePage.tsx:402` (header) renderizam a foto, com fallback
- `use-criar-produto.ts:60` e `use-atualizar-produto.ts:59` persistem `foto_url`
- **Fluxo completo até a vitrine:** `use-loja-produtos.ts:37` e `use-loja-produto.ts:70` mapeiam `fotoUrl`; `LojaPage.tsx:247`, `ProdutoLojaPage.tsx:124` e `LojaSecaoHorizontal.tsx:35` exibem; `use-carrinho-loja.ts:85` leva a foto para o carrinho

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

**✅ RESOLVIDO — vitrine "pesada" era CARREGAMENTO, não visual (17/09/2026):**

- Fundador aprovou a arte do banner na Vercel ("está ótimo") e definiu o problema: **"carregamento — demora para abrir"**.
- **Causa raiz:** o app inteiro ia num **chunk único de 2.395 KB (≈620 KB gzip)**. O cliente que só queria ver doces baixava o ERP completo — `recharts` (375 KB, usado só em Métricas), PDV, financeiro, marketplace, chatbot.
- **Correção:** code splitting por rota em `src/app/routes.tsx` com o `lazy` do React Router 7. Loja pública + login continuam carregando direto (caminho crítico do cliente final); **todo o ERP** passou a carregar sob demanda.

| | Antes | Depois |
|---|---|---|
| JS do 1º acesso | 2.395 KB min / ~620 KB gzip | **794 KB min / 224 KB gzip** |
| CSS | 139 KB / 22 KB gzip | 139 KB / 22 KB gzip |
| Chunks | 1 | 168 (1 entry + 167 lazy) |
| Código que **não** desce no 1º acesso | 0 | **1.653 KB min / 488 KB gzip** |

- **−64% no JS do primeiro acesso.** O `recharts` (375 KB) sai do caminho da loja.
- **Prova estrutural:** o entry tem **zero imports estáticos** (closure = 1 chunk) e as telas do ERP existem como arquivos separados (`PDVPage-*.js`, `PipelinePage-*.js`, `generateCategoricalChart-*.js`).
- **Verificação:** `tsc --noEmit` sem erros novos (total segue **13**, todos pré-existentes) · `npm run build` ✅
- ✅ **Chunks verificados em produção (17/09/2026):** os **167 chunks** referenciados pelo entry respondem **HTTP 200** — **nenhum 404**. Elimina o modo de falha mais provável de code splitting (chunk que não subiu) sem precisar de browser.
- ⚠️ **Ainda não verificado em runtime:** as telas autenticadas do ERP exigem login (o agente não tem credenciais) e o MCP do Chrome não anexa. As rotas da **loja** não mudaram de comportamento; as do **ERP** mudaram a mecânica de carregamento — **clicar por algumas telas no celular para confirmar**.
- **Risco:** `routes.tsx` virou arquivo crítico de ~68 rotas. Caminho de import errado quebra a rota (o build pega esse caso).
- **Próximo ganho possível:** os 224 KB gzip do entry ainda contêm React, react-router, supabase-js, zod, react-hook-form e o código da loja/auth. Reduzir mais exigiria revisar o que a loja realmente importa.

**Correção — clicar no produto "recarregava" a página (17/09/2026):**

- **Sintoma relatado:** ao tocar num produto, a página parecia recarregar.
- **Causa real — e NÃO era ausência de tela:** a página do produto existe (`ProdutoLojaPage`, `/loja/:slug/produto/:id`, desde o módulo da Loja Virtual). O que acontecia era uma **corrida em `useLojaProduto`**: antes de o tenant resolver, `empresaId` ainda é `undefined` e o hook cai direto no **fallback mock**; como os ids do mock não correspondem aos ids reais da Doceê, `produto` ficava `null` e `loading` virava `false` — o que disparava o efeito "produto inexistente" → `navigate('/loja/:slug', { replace: true })`. O cliente era devolvido à vitrine: exatamente o que parece um reload.
- **Decisão do fundador:** **desabilitar a navegação do card** — a página do produto ainda carrega conteúdo que não é da Doceê (`AVALIACOES_MOCK` com textos de cosmético, datados de 2024). Volta a ser clicável quando for refeita (PRD V5).
- **Implementado:** `VitrineCardTenant` e `LojaSecaoHorizontal` pararam de navegar (a foto virou `<div>` sem `onClick`; `slug` saiu das props). **Comprar continua idêntico** — o botão "Adicionar" não foi tocado.
- 🐞 **Segundo bug, MAIS GRAVE, encontrado no mesmo arquivo e corrigido:** em `ProdutoLojaPage.ProdutoTenant` o `useEffect` rodava **depois** de um return condicional de tenant inválido — 7 hooks num render e 6 no seguinte. É a **mesma classe do erro React #310** que derrubou o app em 11/09, e disparava em **qualquer URL pública com slug errado** (`/loja/xxx/produto/1`). Hooks movidos para antes do return.
- **Pendente para quando a página do produto voltar:** corrigir o fallback antecipado do `useLojaProduto` (não cair no mock antes de o tenant resolver) e substituir o conteúdo mock da tela (avaliações, parcelamento, frete).
- **Verificação:** `tsc --noEmit` sem erros nos arquivos da loja · `npm run build` ✅ · o comportamento de clique **não foi verificado em runtime** (sem browser) — confirmar no celular.

**📌 Ajuste visual ainda em aberto (não era o problema):** densidade da tela — massa escura do banner, seção "Destaques" duplicando a grade, e densidade da arte. Nada disso foi mexido; fica registrado caso o fundador queira aliviar depois de olhar com o carregamento corrigido.
- Hooks novos: `use-loja-categorias`, `use-loja-appearance` · estendidos: `use-loja-tenant`, `use-loja-produtos`
- Migration `20260917120000_docee_categorias_vitrine` **aplicada**: 5 categorias da Doceê + `categoria_id` nos 16 produtos (verificado: 16/16, 0 órfãos)
- Verificação: `npm run build` ✅ · tipos ✅ (0 erros nos arquivos da loja) · console sem erro React (#310) · bundle de produção conferido por marcador

**⏳ Pendente — V2 (categoria real no cadastro de produto):** diagnosticado e especificado em `SPEC-LojaVirtual-VitrineModerna.md` §11. `me_produto.tipo` é **tipo de produto** (`simples`/`variavel`/`Outros`), mas `use-produtos`/`use-produto` (linha 50) o leem como categoria e o formulário grava nome de categoria nele — origem do "Outros em massa". **Bug latente:** salvar hoje com uma categoria do mock corromperia `tipo` (verificado: ainda não ocorreu). Aguarda decisão **D-V2.1** (recomendação: preservar `tipo`, usar só `categoria_id` para categoria).

---

**✅ Crash React #310 em rotas públicas da loja (17/09/2026):**

- **Como foi achado:** varredura automatizada procurando hooks depois de `return` condicional no mesmo componente. Encontrou **6 componentes** com o defeito — **todos na loja pública**.
- **Por que é grave:** o React exige ordem fixa de hooks entre renders; quando a contagem muda, ele lança o **erro #310** — a mesma classe que derrubou o app em 11/09.
- **Duas causas distintas:**
  1. **URL inválida** — `EntrarClientePage` e `CheckoutTenant` tinham a guarda de tenant **no meio** do componente: no 1º render `loadingTenant` é `true` e a guarda não dispara; no 2º, com slug errado, ela dispara e a contagem de hooks **cai**. Qualquer URL pública com slug errado derrubava a tela.
  2. **Troca de variante** — `LojaPage`, `ProdutoLojaPage`, `MeusPedidosPage` e `CheckoutPage` faziam `if (slug) return <XTenant/>` e só **depois** declaravam os hooks da demo. Demo e tenant são o **mesmo componente** na árvore, então alternar `/loja` ↔ `/loja/:slug` mudava a contagem de hooks.
- **Correção:** a variante demo virou **componente separado** (`LojaDemo`, `ProdutoDemo`, `MeusPedidosDemo`, `CheckoutDemo`) e a guarda de tenant foi movida para **depois de todos os hooks**.
- **Verificação:** `tsc --noEmit` sem erros novos · `npm run build` ✅ · **não verificado em runtime** (sem browser) — testar no celular uma URL com slug errado (`/loja/xxx/entrar` deve mostrar "Loja não encontrada", não tela branca).
- **Observação de processo:** o projeto **não tem ESLint**, então `react-hooks/rules-of-hooks` não é verificado. Esta classe de bug já se manifestou **3 vezes** (AppLayout em 11/09, `LojaVitrineTenant`/`ProdutoTenant`, e agora estes 4). Vale considerar um linter.

---

**✅ Categorias de produto — CRUD + uso no cadastro (17/09/2026):**

- **Problema:** não era possível classificar produto. O modal oferecia categorias do **mock** (`Roupas`, `Calçados`…) e gravava a escolha em **`me_produto.tipo`** — que é **tipo de produto** (`simples`/`variavel`), não categoria; e a leitura fazia o inverso (`categoria: db.tipo`). Ciclo fechado de erro: daí todo produto aparecer como "Outros".
- **Decisão D-V2.1:** `tipo` **preservado** como tipo de produto; categoria passa a viver **só** em `categoria_id`. `tipo` deixa de ser lido e escrito pelo fluxo de categoria.
- **Banco — migration `20260917230000_me_categoria_cor_ativo` (aplicada e verificada):**
  - `cor text` — sem ela todas as chips do formulário caíam na cor de fallback "Outros"
  - `ativo boolean NOT NULL DEFAULT true` — soft delete, igual às tags
  - índice único **parcial** `ux_me_categoria_empresa_nome` em (empresa, `lower(nome)`) `WHERE ativo = true` — impede "Trufa" duplicada e permite recriar um nome já removido. **Zero duplicatas** antes de criar o índice (verificado)
- **Hook novo `use-categorias.ts`** (espelha `use-tags`): listar, criar, atualizar, desativar (soft delete) e `contarProdutos` para o aviso de remoção. Escopo restrito às categorias **da empresa** — as **globais** (`empresa_id IS NULL`, como "Pães e Doces") são compartilhadas entre tenants e ficam fora do CRUD (D6).
- **Tela nova `/estoque/configuracoes`** (`ConfiguracoesProdutosPage`, rota **lazy**): espelho da tela de tags do CRM + **editar inline** (as tags não têm edição), paleta de cor e aviso com a contagem de produtos antes de remover.
- **Botão de acesso** no header de `/estoque/produtos` (ícone `Settings`), mesmo formato do botão que leva a `/crm/configuracoes`.
- **Modal de produto:** chips **reais** com a **cor real** da categoria, grava `categoriaId`, pré-seleciona ao editar e, sem categorias, aponta para a tela de configurações.
- **Leitura corrigida** (`use-produtos`, `use-produto`): embed do PostgREST `me_categoria(nome_categoria, cor)` resolve o nome **na mesma query** (verificado em produção antes de implementar). Produto sem categoria aparece como **"Sem categoria"** — nunca mais "Outros".
- **`use-loja-categorias`** passa a filtrar `ativo`, então categoria removida sai da barra da loja.
- **Verificação:** `tsc --noEmit` sem erros novos (segue **13 pré-existentes**, todos de outros módulos) · `npm run build` ✅
- **⏳ Pendência cosmética registrada:** as chips de categoria nas **listas** (`ProdutosPage`, `ProdutoDetalhePage`) ainda usam o mapa mock `CATEGORIA_COLORS` indexado por **nome** — com as categorias reais, todas caem na cor de fallback "Outros". Basta passar a usar `categoriaCor` (já disponível no tipo `Produto`).
- 🔒 **Segurança:** `me_categoria` está com **RLS desligado** (0 políticas), então a escrita vem do cliente — mesma situação de `me_tag` e demais tabelas (ver **P5**). Não bloqueia agora, mas entra na revisão de RLS antes de produção com dados reais.

---

**🔎 Varredura do bug #310 — mais 5 ocorrências (17/09/2026, commit `4dfeeb4`):**

- Varredura automatizada do app procurando **hooks depois de `return` condicional** encontrou **6 componentes** com a falha, **todos em rotas públicas**.
- **Causa 1 — troca de variante:** `LojaPage`, `ProdutoLojaPage`, `MeusPedidosPage` e `CheckoutPage` tinham o corpo da demo no **mesmo componente** do `if (slug) return <XTenant/>`. Demo e tenant são o mesmo componente na árvore, então alternar `/loja` ↔ `/loja/:slug` mudava a **contagem de hooks** → erro #310. Correção: cada variante virou componente próprio (`LojaDemo`, `ProdutoDemo`, `MeusPedidosDemo`, `CheckoutDemo`).
- **Causa 2 — URL inválida:** em `EntrarClientePage` a guarda de tenant ficava **no meio** do componente, com `useEffect` depois. Com slug errado (`/loja/xxx/entrar`), o 1º render passava pela guarda sem disparar e o 2º disparava, reduzindo os hooks. Correção: guarda movida para **depois de todos os hooks**.
- **Causa de fundo:** o projeto **não tem ESLint**, então `react-hooks/rules-of-hooks` não é verificado — por isso a mesma classe reapareceu **3 vezes** (AppLayout em 11/09, `LojaVitrineTenant`/`ProdutoTenant`, e agora estes 5).
- **Verificação:** `tsc --noEmit` com **13 erros, a linha de base pré-existente inalterada** · `npm run build` ✅ · comportamento **não testado em runtime** — testar no celular `/loja/xxx/entrar` (deve mostrar "Loja não encontrada", não tela branca).

**✅ Categorias de Produto — CRUD + uso no cadastro (17/09/2026):**

- **Problema:** não dava para classificar produto. O modal listava categorias do **mock** (`Roupas`, `Calçados`) e gravava em **`me_produto.tipo`** — que é **tipo de produto** (`simples`/`variavel`) — enquanto a leitura fazia `categoria: db.tipo`. Ciclo fechado de erro: tudo aparecia como "Outros".
- **Decisão D-V2.1:** `tipo` **preservado** como tipo de produto; categoria passa a viver **só** em `categoria_id`, e `tipo` deixa de ser escrito pelo fluxo de categoria.
- **Banco — migration `20260917230000_me_categoria_cor_ativo` (aplicada e verificada):**
  - `cor text` — sem ela todas as chips do formulário caíam na cor de fallback
  - `ativo boolean NOT NULL DEFAULT true` — soft delete, igual às tags
  - índice único **parcial** `ux_me_categoria_empresa_nome` em (empresa, `lower(nome)`) `WHERE ativo = true`, com `COALESCE` para as globais — impede nome duplicado e permite recriar um nome removido. **Zero duplicatas** antes de criar (verificado)
- **Hook novo `use-categorias.ts`** (espelha `use-tags`): listar, criar, **atualizar**, desativar e `contarProdutos`. Escopo restrito às categorias **da empresa** — as **globais** (`empresa_id IS NULL`, ex.: "Pães e Doces") são compartilhadas entre tenants e ficam **fora** do CRUD (D6).
- **Tela nova `/estoque/configuracoes`** (`ConfiguracoesProdutosPage`, rota **lazy**): espelho da tela de tags do CRM, com **edição inline** (as tags não têm), paleta de cor e **aviso com a contagem de produtos** antes de remover.
- **Botão de acesso** no header de `/estoque/produtos` (ícone `Settings`), mesmo formato do botão que leva a `/crm/configuracoes`.
- **Modal de produto:** chips **reais** com a **cor real**; grava `categoriaId`; pré-seleciona ao editar; sem categorias, aponta para a tela de configurações.
- **Leitura corrigida** (`use-produtos`, `use-produto`): embed do PostgREST `me_categoria(nome_categoria, cor)` resolve o nome **na mesma query** (verificado em produção antes de implementar). Produto sem categoria agora é **"Sem categoria"** — nunca mais "Outros".
- **`use-loja-categorias`** filtra `ativo`, então categoria removida sai da barra da loja.
- **Verificação:** `tsc --noEmit` sem erros novos (segue **13**, todos de outros módulos) · `npm run build` ✅
- ✅ **Chips de categoria nas listas com a cor real (17/09/2026):** `ProdutosPage` e `ProdutoDetalhePage` passaram a usar um helper `corCategoria()` que prefere `getTagPalette(produto.categoriaCor)`. O mapa legado `CATEGORIA_COLORS` (indexado por **nome**) só entra quando o produto **não** tem categoria no banco — ou seja, nos dados de demonstração. Antes, com as categorias reais, todos os chips caíam na cor de fallback e ficavam idênticos.
  - ⚠️ **Fica de fora de propósito:** as chips de **filtro** por categoria (`ProdutosPage`) continuam no mapa legado, o que as deixa neutras — um filtro neutro é melhor que um filtro colorido competindo com os chips do produto.
- 🔒 **RLS:** `me_categoria` está com RLS **desligado** (0 políticas), então a escrita vem do cliente — mesma situação de `me_tag`. Entra na revisão do **P5** antes de produção com dados reais.

---

**✅ Foto do contato do WhatsApp importada para `me_cliente` (17/09/2026):**

- **Pedido:** importar para `me_cliente` a foto do contato que já é salva em `crm_chat_conversas.foto_contato`.
- **⚠️ Armadilha medida ANTES de gravar qualquer coisa:** as URLs são `pps.whatsapp.net` com assinatura de expiração (`oe`). A do Leandro (`oe=696E3167`) decodifica para **19/01/2026** e responde **403** — prova empírica de que `oe` é expiração. A do Thamires (`oe=6AB97DAB`) vence em **27/09/2026**. **Guardar o link = imagem quebrada em ~10 dias.**
- **Outros dois fatos medidos:** `me_cliente.foto_url` **já existia** (nenhuma migration de coluna foi necessária) e `crm_chat_conversas.cliente_id` está **NULL nas 25 conversas** — o casamento é por telefone (`fn_normalizar_telefone(canal_id) = me_cliente.telefone`), que liga 7 conversas a cliente.
- **Solução:** Edge Function **`persistir-foto-cliente`** (deploy via MCP — o MCP não tem ferramenta de Storage, mas Edge Function roda com `SUPABASE_SERVICE_ROLE_KEY` injetado). Baixa a foto, valida host/tipo/tamanho, sobe em `uniq_me_produtos/clientes/{cliente_id}.jpg` e grava a URL **estável** em `me_cliente.foto_url`.
- **Resultado — 4 clientes:** Thamires, Thalita, Luan e Henriq, todos com URL pública do Storage respondendo **HTTP 200 `image/jpeg`** e bytes idênticos aos originais.
- **Guardas comprovadas em dados reais:** Laura (**placeholder do Vecteezy**) recusada pelo allowlist de host; Leandro (**URL expirada**) recusada por 403. Nos dois casos o cliente **não foi tocado**.
- **Segurança:** segredo compartilhado `x-uniq-secret` (401 sem ele **e** com valor errado — testado), allowlist de host (anti-SSRF), limite de 2 MB, exige `content-type: image/*` e só grava se o cliente ainda não tem foto. O valor do segredo vive **só** na function deployada e no `.env` (gitignored, verificado fora do `git status`).
- ⚠️ **Cópias locais de segurança** dos 4 arquivos em `C:\Users\henri\AppData\Local\Temp\opencode\fotos-clientes\` — baixadas antes do vencimento.
- **⏳ Pendente com o fundador:** ligar a function no fluxo `atendente_Docee` do n8n (POST com `{ telefone }` + header `x-uniq-secret`) para as conversas novas persistirem a foto sozinhas.
- **Fora de escopo:** exibir a foto na UI do CRM — é mudança de tela, pede o pipeline SDD completo (PRD/SPEC/WIRE).
- **SPEC:** `tracking/specs/SPEC-PersistirFotoCliente.md`

---

**🧹 Limpeza dos dados de teste da Doceê + foto das conversas (17/09/2026):**

- **Pedido:** limpar conversas, pedidos e clientes da Doceê (ainda em testes) e **garantir que as imagens das conversas passem a ir para os clientes**.
- **Backup ANTES de apagar:** 8 tabelas copiadas dentro do próprio banco (`CREATE TABLE AS SELECT`) → `_bk_20260917_*`. Contagens conferidas **antes** do DELETE, para a rede de segurança não ser decorativa.
- **Apagado em transação única**, filho → pai, sempre com filtro `empresa_id`: `crm_chat_mensagens` 122→0 · `crm_chat_conversas` 5→0 · `me_cliente` 5→0 · `me_venda` 5→0 · `me_itens_venda` 19→0 · `me_venda_historico` 2→0 · `me_contas_receber` 5→0.
- **Preservado:** `me_produto` (16) e `me_categoria` (5) — não faziam parte do pedido.
- **Cuidados que o contrato de FK exigiu:** `crm_chat_conversas.cliente_id → me_cliente` é **ON DELETE CASCADE** (apagar cliente derrubaria as conversas dele), então as conversas saíram **antes** e de forma explícita; e `me_venda.cliente_id` **não tem FK**, então apagar cliente primeiro deixaria vendas órfãs — as vendas saíram antes dos clientes.
- **Não tocado (deliberado):** `mel_chat` (548 linhas, **sem `empresa_id`** — não é dado de tenant e não são as conversas do WhatsApp), `crm_leads` (0 linhas na Doceê) e as migrations.
- **⚠️ Órfãos no Storage:** as 4 fotos em `uniq_me_produtos/clientes/*.jpg` eram dos clientes apagados (~185 KB). Inofensivas — e continuam válidas se o backup for restaurado.
- **Function `persistir-foto-cliente` → v2:** além de gravar em `me_cliente.foto_url`, passa a gravar a **mesma URL estável** em `crm_chat_conversas.foto_contato`. Sem esse segundo passo o avatar do CRM seguiria apontando para a URL do WhatsApp e quebraria em ~10 dias. A v2 também estabiliza o avatar quando o cliente **já tinha** foto.
- **Verificado em produção:** a v2 responde `404 Cliente nao encontrado` para id inexistente (prova que roda sem erro de sintaxe) e `401` sem o segredo (auth intacta).
- ✅ **Automação ligada no n8n (17/09/2026):** nó `Persistir Foto Cliente` (HTTP Request 4.2) inserido no `atendente_Docee` entre **`Wait4` e `Consulta Conversas1`** — `Wait4` é onde os dois caminhos (cliente novo e já cadastrado) convergem, já com o cliente existindo, então **uma inserção cobre os dois casos**. `onError: continueRegularOutput` garante que uma falha da função **nunca** quebra o atendimento. A inserção é segura porque `Consulta Conversas1` usa `$('DADOS_MSG5')` (nó nomeado), não o item imediato.
  - **Validado:** `n8n_validate_workflow` → `valid: true`, 65 nós, 68 conexões válidas, **0 inválidas**, 0 erros, 0 warnings. Topologia confirma cadeia limpa (`Wait4 → Persistir Foto Cliente → Consulta Conversas1`), sem bifurcação. Rollback via snapshot do n8n-mcp / `n8n_workflow_versions`.
  - Config espelha o `FotoContato2`, que já funciona no mesmo workflow (em vez de inventar forma nova).
- 🐞 **Bug encontrado no PRIMEIRO TESTE REAL e corrigido na v3 (17/09/2026):** o nó do n8n rodou (execução `4563`), a função foi chamada (logs do Supabase: `POST /persistir-foto-cliente` com **`status_code: 500`**) — mas o `onError: continueRegularOutput` marcou o nó como `success` e o corpo do erro aparecia como **`[object Object]`**, escondendo a causa.
  - **Causa raiz (erro meu de multi-tenancy):** o caminho `{ telefone }` buscava o cliente **sem filtrar empresa** e usava `.maybeSingle()`, que **estoura com mais de uma linha**. O telefone **não é único entre empresas** — `5511941484562` existe em **3 tenants** (Doceê, `61616cfa` e UNIQ Empresas).
  - **Correções:** (1) `empresa_id` virou obrigatório junto do telefone, devolvendo **400** com motivo claro em vez de palpite ambíguo; (2) o n8n passou a mandar **`cliente_id`**, que é único e **já vinha no item** (o `Wait4` entrega a linha completa do cliente) — parou de reconstruir por telefone o que já tinha em mãos; (3) o erro passou a ser **serializado de verdade** (`message`/`code`/`details`/`hint`), porque erros do PostgREST/Storage não são instâncias de `Error` — era isso que virava `[object Object]`.
  - **Provado nos três caminhos:** `{ cliente_id }` ✅ grava e estabiliza · `{ telefone }` sem empresa ✅ **HTTP 400** com motivo · `{ telefone, empresa_id }` ✅ funciona. Banco conferido: cliente **e** conversa com **STORAGE (estável)**.
  - **Lição:** `onError: continueRegularOutput` é correto para não derrubar o atendimento, mas **esconde falha silenciosa** — o corpo da resposta precisa ser inspecionado (foi o `preview` da execução que permitiu).
- ✅ **TESTE PONTA A PONTA PASSOU — automático, sem intervenção (17/09/2026, 23:47):** com conversa e cliente zerados, o fundador mandou uma mensagem de WhatsApp e a cadeia rodou sozinha.
  - **Execução `4565` do n8n:** `Consulta Cliente` (não achou) → `Cria_Cliente` (cliente `d49c3d6c`, `foto_url: null`) → **`Persistir Foto Cliente`** (2.034 ms) devolvendo **`success: true`**, `foto_url` no Storage, `bytes: 69904`, `avatar_estabilizado: true`.
  - **Logs do Supabase nos 6 minutos decisivos:** 23:42:22 → **500** (reprodução do bug na v2) · 23:43:23 → 200 (testes da correção) · 23:43:36 → **400** (teste da guarda) · **23:47:32 → 200 com user-agent `axios/1.8.3`, que é o n8n** ✅.
  - **Banco:** cliente com `foto_url` em **STORAGE (estável)** e conversa com `foto_contato` em **STORAGE (estável)**.
  - **URL pública:** HTTP 200, `image/jpeg`, 68,3 KB.
  - **Ciclo fechado:** mensagem → n8n cria conversa + cliente → chama a função → 200 → foto no Storage → gravada no cliente **e** no avatar da conversa.
- ⚠️ **Limite conhecido do ponto de inserção:** o `Grava Novo Cliente` testa `$json.id` (id da **conversa**) com `notEmpty`. Conversa existente → ramo **true** → o fluxo **não passa** pelo nó da foto. Ou seja: **a foto é persistida na primeira mensagem de cada conversa nova**. Contato que volta não re-persiste (mas já teve a foto salva no primeiro contato). Dói em dois casos: cadastro criado **antes** desta correção que volta numa conversa existente, e troca da foto de perfil. Cobertura exigiria inserir o mesmo nó no ramo da conversa existente — **não feito**, porque mexe no caminho principal de mensagens.
- 🐞 **Gap separado, NÃO corrigido:** o fluxo **cria o cliente mas deixa `crm_chat_conversas.cliente_id` NULL** — verificado na conversa nova do Henriq Silva (17/09). É outra preocupação (o CRM não sabe de quem é a conversa), fora do escopo da foto, e precisa de decisão antes de mexer.
- **Restaurar, se precisar:** `INSERT INTO me_cliente SELECT * FROM _bk_20260917_me_cliente;` (idem para as demais `_bk_20260917_*`).

**🧹 Segunda limpeza da Doceê — só conversas e clientes (17/09/2026):**

Após criar uma conversa de teste (Henriq Silva, `5511941484562`, 23:20) e validar a automação da foto, o fundador pediu para limpar **apenas conversas e clientes** desta vez — pedidos/financeiro ficariam de fora.

| Tabela | Antes | Depois |
|---|---|---|
| `crm_chat_conversas` | 1 | 0 |
| `crm_chat_mensagens` | 2 | 0 |
| `me_cliente` | 1 | 0 |
| `me_contas_receber` · `me_venda` | 0 | **intocados** |
| `me_produto` · `me_categoria` | 16 · 5 | **preservados** |

- **Backup com nome distinto** para não sobrescrever o anterior: `_bk_20260917b_*` (3 tabelas), contagens conferidas antes do DELETE.
- **A armadilha de FK era inofensiva aqui:** `me_cliente` tem CASCADE para `me_contas_receber` e `me_venda_servicos`, mas ambos estavam em **0** — verificado **antes** de apagar, justamente para não derrubar financeiro sem o fundador ter pedido.
- ⚠️ **Storage órfão:** a foto `clientes/3107627e-…jpg` (Henriq) ficou sem dono outra vez. Inofensiva.
- **Total de backups no banco:** 11 tabelas (`_bk_20260917_*` 8 + `_bk_20260917b_*` 3). Podem ser removidas quando o fundador confirmar.

**✅ Foto do cliente exibida no CRM (17/09/2026, commit `cd98994`):**

- **Sintoma:** a foto **estava no banco** (`me_cliente.foto_url`, gravada pela automação do WhatsApp) mas a tela de clientes mostrava só as iniciais.
- **Causa — furo de mapeamento, não de UI:** `mapClienteToCliente` (em `use-clientes` **e** `use-cliente`) **nunca preenchia `avatar`**, apesar de `DBCliente.foto_url` ser declarado e o tipo `Cliente` já ter o campo. O dado morria no mapper e nunca chegava à tela.
- **Correção:** os dois mappers passaram a preencher `avatar: db.foto_url || undefined`; o `AvatarInitials` ganhou `src` e renderiza a imagem com as iniciais como fallback (usado no card e na tabela); o cabeçalho do detalhe passou a mostrar a foto. **Onde não há foto, o visual anterior é preservado exatamente.**
- **Verificação:** `tsc --noEmit` na linha de base (**13**, zero novos) · `npm run build` ✅ · deploy conferido em produção por HTTP: o chunk `ClientesPage` contém o mapeamento (`foto_url`) e o render da imagem (`object-cover shrink-0`).

**🔒 Segurança — `me_categoria` com RLS desligado (17/09/2026):** a nova tela de categorias escreve pelo cliente, como `me_tag`. Entra na revisão do **P5**.

---

## 🆕 LOTE DE AJUSTES — 17/09/2026 (fonte única do estado)

> 📄 **Diagnósticos completos, com causa raiz (arquivo:linha e banco): `tracking/AJUSTES_17-09-2026.md`**
>
> ✅ **Todas as decisões de produto JÁ FORAM TOMADAS pelo fundador** (17/09/2026) — ver tabela abaixo.
>
> 🚀 **TODO O LOTE ABAIXO (itens 1, 2, 3, 5a–5e, 6, 7 e pendência A) ESTÁ IMPLEMENTADO, COMMITADO E EM PRODUÇÃO.**
> Push **`4a434bf`** na `master` — 4 commits: `66fb73f` (pedidos) · `3504e71` (produtos) · `43b53ee` (crm) · `4a434bf` (tracking + migrations).
> **Deploy verificado em produção:** a Vercel passou a servir `PedidosListaPage-BoT81rLk.js` (entry `index-BS6R34Pm.js`), com os marcadores do código novo confirmados no chunk.
> 🧪 **Guia de teste para validar no celular: `tracking/GUIA_TESTE_VERCEL_17-09-2026.md`**
>
> ⏭️ **O que ainda falta:** item **4** (deletar pedido — precisa de SDD + WIRE aprovado) e as pendências da **Wave E** (ver abaixo).

### ✅ Decisões do fundador (FECHADAS) + estado de execução

| # | Item | Decisão tomada | Estado |
|---|---|---|---|
| 1 | Retirar "Tags / Etiquetas" do modal de produto | Retirar | ✅ **feito** (lane `fix-4`) — commitado e em produção |
| 2 | Botão "Duplicar" morto na lista de produtos | Consertar | ✅ **feito** (lane `fix-4`) — incluiu também a view de tabela, que tinha o mesmo botão morto |
| 3 | Estoque mínimo sempre 5 | **Ter o campo em `me_produto`** · default **5** · tratar como **hotfix** (sem SDD) | ✅ **feito** (lane `fix-7`) — coluna `estoque_minimo` criada no banco + hooks e modal gravando/lendo |
| 4 | Deletar pedido cancelado | **Soft delete** · **bloqueia** se a conta a receber estiver **paga** · **devolve estoque** · botão em **detalhe + lista** · **qualquer usuário** · **como PROCEDURE/RPC** (para ser chamada tanto pelo cliente quanto pela Base UNIQ) | ⏸️ **precisa de PRD/SPEC/WIRE + aprovação do WIRE** |
| 5b | Filtro de período com data congelada | Corrigir (`new Date()`) | ✅ **feito** (lane `des-1`) — commitado e em produção |
| 5c | "Novo Pedido" grava canal chumbado `whatsapp` | Canal correto = **`manual`** | ✅ **feito** (lane `des-1`) — commitado e em produção |
| 5d | Canais colapsados (`interna→pdv`, `manual→outros`) | `interna` e `manual` são o mesmo → ambos viram **`manual`** · **NÃO mexer no histórico** (são pedidos de teste) | ✅ **feito** (lane `des-1`) — commitado e em produção |
| 5e | "Status parecem errados" | **Confirmado pelo fundador:** "Pago" **não é status do pedido** — é status de **pagamento**. Remover do filtro de status do pedido e **criar um filtro separado de status de pagamento** | ✅ **feito** (lane `des-1`) — commitado e em produção |
| 5a | Filtros multi-seleção | **Chips** clicáveis para status do pedido, status de pagamento e canal | ✅ **feito** (lane `des-1`) — commitado e em produção |
| 6 | Persistir filtros de pedidos | Por **empresa** (`uniq:pedidos:filtros:<empresaId>`) · persistir `periodo`/`status`/`pagamento`/`canal`/`viewMode` · **não** persistir a busca digitada · "Limpar filtros" também apaga o storage | ✅ **feito** (lane `des-1`) — commitado e em produção |
| 7 | WhatsApp/n8n sempre "Cartão de Crédito" | Corrigir os mapas — **o banco estava certo: era Pix**, o erro era só de exibição | ✅ **feito** (lane `fix-5`) — commitado e em produção |
| A | `ClienteConversaResumo` sem filtro `empresa_id` | WIRE aprovado pelo fundador | ✅ **feito** (lane `fix-6`) — commitado e em produção |
| 8 | Modal "Novo Pedido" com rolagem horizontal + cliente não era o real | Corrigir o layout responsivo · **trazer o cliente real** (busca em `me_cliente`) · **criar o cliente na hora** se não existir | ✅ **feito** (lane `des-2`, 18/09) — modal sem barra horizontal; busca com dropdown (nome + telefone) + chip de cliente selecionado; find-or-create reescrito (**telefone normalizado → nome `ilike`**, nunca mais nome exato); `23505` reusa o cadastro existente em vez de dar erro |
| 9 | Conversas sem barra de rolagem (chatbot + detalhe do cliente) | Corrigir a rolagem | ✅ **feito** (lane `des-3`, 18/09) — causa: a `ScrollArea` era um flex item **sem `min-h-0`**, crescia até a altura do conteúdo (não havia overflow para rolar) e o `overflow-hidden` do `ChatbotPage` cortava o resto. Agora é container nativo `overflow-y-auto` + `min-h-0`, cabeçalho/input fixos e auto-scroll no container certo. No CRM, `max-h-[60vh]` no mobile |
| emenda | Clique na linha da **tabela** não abria o detalhe | Corrigir | ✅ **feito** (lane `fix-9`, 18/09) — a `<tr>` ganhou `onClick` + `cursor-pointer`; `stopPropagation` garantido nos controles internos (inclui o **checkbox da tabela**, que não tinha) |

### 📍 Estado das waves

| Wave | Conteúdo | Estado |
|---|---|---|
| **A** | itens **1, 2, 7** + pendência **A** (3 lanes em paralelo) | ✅ **concluída, verificada e EM PRODUÇÃO** — `tsc` **13** (linha de base exata, zero novos) · `npm run build` OK |
| **B** | itens **5b/5c/5d/5e + 5a + 6** (lane `des-1`, @designer) | ✅ **concluída, verificada e EM PRODUÇÃO** — `tsc` **13** (zero novos) · `npm run build` OK · artefato de teste removido |
| **C** | item **3** (lane `fix-7`, @fixer) | ✅ **concluída, verificada e EM PRODUÇÃO** — coluna criada no banco + 5 arquivos de código |
| **D** | item **4** — deletar pedido cancelado | ✅ **CONCLUÍDA** (18/09) — banco (3 colunas + índice parcial + RPC `fn_excluir_pedido_cancelado`, verificada em produção) + hook `use-excluir-pedido.ts` + modal `ExcluirPedidoModal.tsx` + botão no **detalhe** e na **lista** + **4 filtros de leitura** (`use-pedidos` · `use-pedido` · `use-loja-meus-pedidos` · **`use-dre`**) |
| **F** | itens **8** e **9** + emenda do clique na linha (18/09) | ✅ **CONCLUÍDA** — `tsc` **13** (zero novos) · `build` OK · artefatos de teste removidos |
| **E** | pendência **D'**, `tsconfig`, migrations untracked, ESLint | ⏸️ aguarda decisão do fundador |

### 🎯 Próximos passos acordados (ordem)

1. ✅ ~~Fechar as lanes `des-1` e `fix-7`~~ **feito** — reconciliadas e verificadas.
2. ✅ ~~Commit + push de tudo~~ **feito** — push `4a434bf` + `876683d`; **deploy verificado em produção**.
3. ✅ ~~Guia de teste na Vercel~~ **feito** — `tracking/GUIA_TESTE_VERCEL_17-09-2026.md`.
4. ✅ ~~Montar o SDD do item 4~~ **feito** — PRD/SPEC/WIRE escritos (`…DeletarPedidoCancelado.md`).
5. ✅ ~~Aprovar o WIRE do item 4~~ **feito** — aprovado pelo fundador em 18/09.
6. ✅ ~~Implementar o item 4~~ **feito** — banco + front-end (detalhe e lista). Ver Wave D.
7. ✅ ~~Corrigir o modal de criar pedido, a rolagem das conversas e o clique na linha~~ **feito** — itens 8, 9 e emenda (Wave F).
8. ⏭️ **AGORA (fundador):** testar a Wave 2 no celular pelo **`tracking/GUIA_TESTE_VERCEL_WAVE2.md`**.
9. ⏭️ **Pendências da Wave E** (aguardam decisão): `tsconfig`/gate de tipos e ESLint. **Opcionais mapeados:** `ChatList.tsx` (mesmo padrão de rolagem do item 9) e a RPC `registrar_venda` (forma de pagamento sem filtro de empresa + fallback incoerente).

### 🔴 Correções pendentes mapeadas (18/09/2026)

> Levantadas ao responder *"o que ainda temos para corrigir"*.
> ⚠️ **Lição de processo:** a "linha de base de 13 erros de tipo" estava sendo tratada como ruído pré-existente — e **escondia 2 bugs de runtime** (F1 e F2). Não tratar mais como ruído sem checar.

| # | Onde | Diagnóstico (verificado no código) | Status |
|---|---|---|---|
| **F1** | `financeiro/ContasPagarPage.tsx` | O hook `useAtualizarContaPagar` devolve `{ atualizarConta, pagarConta, loading, error }`, mas a página desestruturava **`atualizarContaPagar`** (nome inexistente) → **`undefined` chamado como função** (`TypeError`). **Sintoma:** salvar a edição de uma conta a pagar não fazia nada. | ✅ **RESOLVIDO (18/09)** — opção menos invasiva: nomes do hook mantidos, página corrigida. Os 3 call sites foram lidos individualmente: `:47` → `atualizarConta` (editar) · `:70` → **`pagarConta`** (era a ação "pagar", não editar!) · `:90` → `atualizarConta` com `status:'cancelado'` |
| **F2** | `financeiro/ContasReceberPage.tsx` | A página passava `status: "cancelado"`, mas `AtualizarContaReceberParams` **não tinha o campo** → o cancelamento **não persistia**. E `use-contas-receber.ts:32` mapeava `cancelado → "pago"` ("tratamento temporário") → **conta cancelada era exibida como PAGA**. | ✅ **RESOLVIDO (18/09)** — `status` entrou nos params **e** no UPDATE dos dois hooks (receber e pagar); `mapStatus` agora devolve `"cancelado"`; `calcularStatus` trata `pago`/`cancelado` como **terminais** (cancelada não vira "vencido"); badge cinza/neutro; botões "Pagar"/"Receber" ocultos para cancelada |
| **F3** | `estoque/EstoqueDashboardPage.tsx` | **O dashboard inteiro era MOCK** — importava `PRODUTOS`/`MOVIMENTACOES` e não usava nenhum hook do banco. Total de produtos, valor do estoque, baixo/crítico/sem estoque e movimentações: todos fake. | ✅ **RESOLVIDO (18/09)** — indicadores agora vêm de `useProdutos` (`me_produto`): total, valor (Σ `precoVenda × estoque`), baixo, sem estoque e críticos (com **foto real**). Estados loading/empty/error/fallback adicionados. ⚠️ **Movimentações recentes seguem mock** — `MovimentacoesPage` também usa mock e **não existe hook de leitura** de `est_movimentacao` (só há INSERT, em `ProdutoDetalhePage:124`). Fica para uma lane futura criar `use-movimentacoes` |
| **F4** | `chatbot/ChatList.tsx` | Mesmo padrão do item 9: `ScrollArea` como flex item sem `min-h-0` → a lista de conversas **cortava no mobile** com muitas conversas, sem scrollbar | ✅ **RESOLVIDO (18/09)** — rolagem nativa (`flex-1 min-h-0 overflow-y-auto overscroll-contain`) + header `shrink-0` |
| **F5** | RPC `registrar_venda` | Forma de pagamento: `WHERE nome ILIKE … LIMIT 1` **sem filtro de empresa** e **sem `ORDER BY`** — com linhas globais (1–5) **e** do tenant (20–22) de mesmo nome, o id retornado é **não-determinístico**. Fallback incoerente: texto → `'PIX'`, id → `1` (**Dinheiro**) | ⏸️ **PENDENTE** — não foi autorizado ainda |

**Verificação da rodada (18/09):** `tsc` **13 → 8 erros** (caíram os 2 do Financeiro **e** os 3 do dashboard — todos eram bugs reais ou mock disfarçado) · `npm run build` OK · **prova no banco:** uma conta a receber com `status='cancelado'` (R$ 9.999 de teste) **não entrou** nem em "pagas" nem em "em aberto" — a decisão *"conta cancelada não conta no financeiro"* está garantida na consulta. Dado de teste removido.

**Deploy em produção (18/09):** ✅ **NO AR** — commit `9960ac2`, deployment `dpl_JBVxPoaCWHoXHunkPPkqyPpdst4M` (READY). Verificado por **conteúdo servido**, não pelo estado da API: o entry mudou (`index-C8s4vNAj.js` → `index-Dfzyv3q2.js`) e o chunk do dashboard passou a conter o marcador do F3 (`EstoqueDashboardPage-gRsQWqlB.js`).

> ⚠️ **Anomalia observada (não é bug do código):** neste push o **webhook da Vercel demorou ~vários minutos** para disparar o deployment. No intervalo, a produção continuou servindo o build anterior (Wave 2) e o `state` da API ficou defasado (`INITIALIZING` mesmo com o deploy já servindo). **Lição:** após um push, **não confiar só no estado da API** — confirmar por **conteúdo servido** (hash do entry + marcador do chunk) e, se o deployment não aparecer, verificar em `vercel.com/.../base-uniq/deployments` antes de concluir que falhou.

**Os erros da linha de base — TRIADOS em 18/09 (nenhum é bug ativo):**

> ✅ **Atualização 21/09/2026 — 3 dos 8 foram corrigidos.** **A linha de base agora é 5 erros.** Os 5 restantes: `agenda/CompromissosPage:227`, `marketplace/CheckoutPage:171` e os 3 mocks órfãos de `lib/mocks/`.

| Arquivo | Veredito após inspeção |
|---|---|
| `marketplace/CheckoutPage:171` | ✅ **Não é bug** — o `etapa !== 'sucesso'` é **código morto**: já existe um `return` antecipado que trata o sucesso, então o TS estreita o tipo e a condição fica sempre verdadeira. A tela de sucesso funciona |
| `employees/ModuleCheckbox:13` | ✅ **RESOLVIDO (21/09/2026)** — adicionada a entrada `servicos: { label: 'Serviços', icon: Wrench }`. Era o nit cosmético: o fallback exibia a chave técnica `servicos` |
| `agenda/CompromissosPage:227` | 🟡 **Latente** — `kpi.value > 0` com `value: string \| number`. O **único** KPI com `warn` (`Pendentes`) tem valor **numérico**, então funciona hoje; quebraria se alguém pusesse `warn` num KPI formatado em texto |
| `estoque/ProdutoDetalhePage:490` | ✅ **RESOLVIDO (21/09/2026)** — tipo `TabItem` com `badge?: number` + guarda `tab.badge != null`. Era o **B7** do backlog. Comportamento preservado (a aba `movimentacoes` segue mostrando badge só quando `> 0`) |
| `estoque/MovimentacoesPage:31` | ✅ **RESOLVIDO (21/09/2026)** — `"Doação"` adicionado ao union `MovMotivo` (o tipo estava desatualizado em relação à tela) |
| `lib/mocks/{chatbot,employees,marketplace}.ts` | 🟡 **3 mocks órfãos** importando `../types/*` que não existem — prováveis arquivos mortos (o build não quebra, então não são alcançados) |

> **Conclusão do triagem:** na linha de base **antiga**, 2 dos 13 erros eram **bugs reais** (F1/F2). Os demais são **ruído de tipo de verdade** — resta **1 risco latente** documentado (`CompromissosPage`) e 3 mocks órfãos. **Ganho real:** a partir de agora, qualquer erro NOVO é regressão de verdade. **Estado em 21/09/2026: 5 erros** (eram 8; 3 corrigidos).

---

## 🤖 ATENDENTE DOCEÊ — TRAVA DE ESCOPO (21/09/2026)

**WHY:** a MEL respondia **qualquer assunto**. Numa conversa de teste, o cliente perguntou sobre **cursos** e a atendente seguiu o assunto em vez de trazer de volta ao cardápio. Risco: atendimento saindo do âmbito da Doceê, tempo perdido e impressão de amadorismo em conversa com cliente real.

**Status:** ✅ CONCLUÍDO — aplicado no workflow **ativo** `atendente_Docee` (id `3IVutqEXVq8MtXkZ`).

**Diagnóstico:** o `systemMessage` do nó **AI Agent** define persona, estilo, formatação de WhatsApp, ordem das perguntas do pedido e tratamento de erro — mas **não continha nenhuma regra de escopo**. Sem instrução explícita, o LLM (OpenRouter, `temperature 0.4`) com persona calorosa e `Postgres Chat Memory` simplesmente acompanha o assunto que o cliente abre. **Não era falha de fluxo nem de conexão: era lacuna de instrução.**

**Correção — seção `# Escopo — REGRA INVIOLÁVEL` inserida logo após o `# Role`** (posição de maior saliência do prompt), +798 caracteres:

- Escopo positivo declarado (doces, cardápio, preços, pedidos, pagamento, retirada/entrega, status do pedido)
- Proibição explícita de responder/continuar assunto fora do escopo, com gatilhos nomeados (cursos, política, notícias, outras empresas, receitas, conselhos, assuntos pessoais, tema aleatório)
- Redirecionamento em **UMA linha** + retorno ao cardápio
- Insistência → handoff humano (*"Vou transferir você para nossa equipe! 🥰"*)
- Nunca revelar que é IA nem explicar as regras

**Verificação:**

| Check | Resultado |
|---|---|
| Diff estrutural vs backup | **65 nós idênticos · conexões idênticas** → zero dano colateral |
| `n8n_validate_workflow` | `valid: true` · **0 erros · 0 warnings** · 68 conexões válidas · 95 expressões |
| Workflow | segue **ativo**, 65 nós |
| Encoding do texto gravado | conferido **por code point** (Á, ê, á, ç, ó, em dash, 2 emojis) — o `�` no console era só encoding do terminal |

**Rollback:** backup completo pré-alteração em `%TEMP%\opencode\atendente_Docee_backup_20260921.json` (224 KB). O histórico do n8n-mcp estava **vazio** antes; este save criou o **primeiro snapshot**.

**🐞 Bug de ferramenta (n8n-mcp):** `patchNodeField` **falha no apply** com `Cannot read properties of undefined (reading 'map')` — com o **mesmo payload** que passa no `validateOnly`. Neste workflow, usar **`updateNode` + `__patch_find_replace`**.

**⚠️ Limite conhecido:** trava por prompt **reduz** vazamento, não elimina. Escalada, se necessário: nó **classificador** antes do AI Agent, cortando assunto fora do escopo antes de chegar ao LLM. Não feito agora — adiciona nós e latência, e só se justifica se a trava de prompt se mostrar insuficiente.

**⏳ Pendente de validação real (fundador):** testar no WhatsApp (a) pergunta fora do escopo → deve redirecionar sem responder; (b) **pedido normal completo** → o fluxo cardápio → pagamento → observação → retirada não pode ter quebrado. O prompt novo **já vale** para as próximas mensagens (workflow ativo).

**🔧 Pré-requisito desta tarefa — MCP do n8n estava fora do ar para os agentes:** o config usava `npx -y n8n-mcp` **sem versão fixa**, o que obrigava consulta ao registro npm a cada arranque e estourava o **timeout padrão de MCP (5s)** — daí o sintoma *"abre uma vez e não sobe; depois de fechar duas vezes funciona"* (cache esquentando). Corrigido com `n8n-mcp@2.87.0` **instalado globalmente** + `command: ["n8n-mcp"]` + `timeout: 30000` em `~/.config/opencode/opencode.jsonc`. Verificado com `opencode mcp list` (`✓ n8n-mcp connected`) e `n8n_health_check` (`status: ok` · n8n `1.106.3`).

**Reconciliação de pendência do TRACKING:** o item *"pendente: ativar `docee_criarpedido`"* (T2.2) **não é pendência real** — `docee_criarpedido` é **sub-workflow**, chamado pelo nó de tool dentro do `atendente_Docee`. Sub-workflow **não precisa estar ativo**; quem precisa é o pai. Verificado no n8n: `atendente_Docee` **ativo** (65 nós), `docee_criarpedido` inativo (**esperado**).

---

### 🔎 Reconciliação das pendências A–I (17/09/2026)

| # | Pendência | Resultado |
|---|---|---|
| **A** | `ClienteConversaResumo` sem filtro `empresa_id` | ✅ WIRE aprovado → **implementado** (lane `fix-6`). Correção: filtro por `empresa_id` + casamento de telefone normalizado em `canal_id` |
| **B** | n8n: trocar upsert por `fn_ingest_whatsapp` | ✅ feito pelo fundador |
| **C** | n8n Doceê: ativar `docee_criarpedido` + salvar `atendente_Docee` | ✅ testado e funcionando. A ressalva do "cartão de crédito" **não era gravação** — era o **item 7** (exibição) |
| **D** | `crm_chat_conversas.cliente_id` NULL | ✅ **RESOLVIDO (18/09/2026)** — opção **B (correção no banco)**, escolhida pelo fundador. **Causa raiz:** nenhum nó do `atendente_Docee` escrevia `cliente_id` (`Criar_Conversa1`, `Criar_Conversa2` e `Atualiza_FotoContato` não incluem o campo) — o cliente **era** criado certo em `me_cliente`. **Correção:** `fn_resolver_cliente_id` + 2 triggers (`trg_conversa_vincula_cliente` em `crm_chat_conversas` e `trg_cliente_vincula_conversas` em `me_cliente`, este último cobre a 1ª mensagem, em que a conversa nasce antes do cliente). Verificado nos **dois sentidos** com dados de teste (limpos depois). **Sem backfill** (decisão do fundador: registros antigos são de teste → as 21 conversas seguem com `cliente_id` NULL). Migration: `supabase/migrations/20260918130000_vinculo_conversa_cliente.sql` |
| **E** | Página do produto (fallback `useLojaProduto` + mock) | ⏸️ parkeado — "ainda não precisa" |
| **F** | P5 — RLS desligado | ⏸️ **permanece desligado durante o desenvolvimento** (decisão do fundador) |
| **G** | WIRE T3.3 Landing Page | ✅ **está no GitHub** — `tracking/wireframe/WIRE-Semana3-T3.3-LandingPage.md` (commit `e7344de`) |
| **H** | Ajuste visual da vitrine | ✅ fechado — "está ótimo, não precisa de ajustes" |
| **I** | ESLint | ❓ não entendido pelo fundador → explicação em linguagem simples no documento do lote (não é erro; é a rede de segurança que pegaria a classe de bug que já derrubou o app 3×) |

### ⚠️ Achados de infraestrutura (NÃO resolvidos)

- ✅ **RESOLVIDO (18/09/2026) — o gate de tipos estava QUEBRADO.** TypeScript **6.0.2** + `"baseUrl"` no `tsconfig.json` = erro `TS5101`, que **abortava a checagem antes de olhar os arquivos**: `npx tsc --noEmit` reportava **1 erro** em vez dos reais. **Foi o que escondeu os bugs F1 e F2.** **Correção (opção B, escolhida pelo fundador):** removidos `baseUrl` **e** o bloco `paths` — um grep provou que **nenhum arquivo importa via `@/`**, então era configuração morta. Agora `npx tsc --noEmit` roda **direto** e reporta os **8 erros reais**. Não alterou o build (o Vite usa o próprio `resolve.alias`).
- ✅ **RESOLVIDO (18/09/2026) — `tsconfig.json` não estava no repositório.** O arquivo existia só localmente (untracked, e **não** estava no `.gitignore`) — um clone limpo não tinha como rodar a checagem de tipos. **Agora está versionado.**
  - **Lição para as próximas lanes:** usar `npx tsc --noEmit` **direto** (sem config de contorno). A linha de base agora é **5 erros** (eram 8; 3 corrigidos em 21/09/2026) — nenhum novo pode aparecer.
- ✅ **RESOLVIDO (21/09/2026) — as migrations estão versionadas.** Verificado no git: `supabase/migrations/` tem **7 arquivos no disco e 7 versionados**, zero faltando (`20260916212702_limpa_dados_teste.sql` e `20260917220000_conversa_multi_tenant_por_empresa.sql` **inclusive**). O `git status` está limpo. Nenhuma regra de `.gitignore` exclui migrations.
- 🟡 **RPC `registrar_venda`:** resolve forma de pagamento com `WHERE nome ILIKE ... LIMIT 1` **sem filtrar empresa** e **sem `ORDER BY`** — e agora existem linhas globais (1–5) **e** do tenant `6257ebef` (20–22) com os mesmos nomes. Além disso o fallback é incoerente: o texto cai para `'PIX'` mas o id cai para `1` (**Dinheiro**).
- ✅ **RESOLVIDO (18/09/2026) — n8n `Cria_Cliente` não gravava `origem`:** o nó inseria o cliente com `empresa_id`, `nome_cliente` e `telefone`, **sem `origem`**. Como `use-clientes.ts:68` / `use-cliente.ts:68` fazem `db.origem === "whatsapp" ? "whatsapp" : "manual"`, **todo cliente vindo do WhatsApp era exibido como "Manual"** no CRM (não só "sem badge"). Corrigido no workflow `atendente_Docee` (id `3IVutqEXVq8MtXkZ`) adicionando `origem = whatsapp` ao nó. Verificado: nó com 4 campos, workflow válido (65 nós · 68 conexões · 95 expressões · **0 erros, 0 warnings**). É uma dependência **externa ao repo** (workflow do fundador).

---

## 💰 REVISÃO DO MÓDULO FINANCEIRO — mobile-first (21/09/2026)

**WHY:** o fundador vai mostrar o Financeiro para a usuária da Doceê cadastrar as primeiras informações. Revisar as 5 telas — o que falta, o que sobra, o que é inútil e o que quebra no celular.

**Status:** ✅ CONCLUÍDO — 4 lanes (1 recon @explorer · 2 @designer · 1 @fixer) · `tsc` na linha de base (**5**, zero novos) · `npm run build` ✅.

### 🐞 Bugs reais (verificados em dados de produção, não suposição)

| # | Onde | Diagnóstico | Correção |
|---|---|---|---|
| 1 | `me_contas_receber.descricao` | O banco grava `"Venda #848081af-…-991a0ac0fb7c - Henriq Silva"` → **UUID cru na coluna Descrição** (queixa do fundador) | `use-contas-receber` parseia o padrão e deriva `cliente` + `numeroPedido` (`#848081af`); `limparDescricao` é a 2ª barreira na tela. Nenhum UUID é renderizado |
| 2 | `ContasReceberPage` / `ContasPagarPage` | Os modais exigiam **"Cliente"** e **"Fornecedor"** e **nunca enviavam** esses campos (`me_contas_*` só tem FK, sem coluna de nome) → o dado digitado era **descartado** | find-or-create em `me_cliente` (obrigatório) e `me_fornecedor` (opcional, não bloqueia o salvamento) + grava `cliente_id`/`fornecedor_id` |
| 3 | `use-contas-pagar` · `use-fluxo-caixa` · `use-financeiro-dashboard` | Join em `me_fornecedor` selecionava **`nome_fantasia`** — coluna **inexistente** (a real é `nome_fornecedor`) → o join sempre falhava e todo fornecedor virava "Fornecedor" | coluna corrigida nos 3 hooks |
| 4 | venda `32f88d3f` (Doceê) | Venda **`status_venda='cancelado'`** com conta a receber de **R$ 15,00 `pendente`** → venda cancelada contava como dinheiro a receber | `vendaCancelada` derivado do join; a tela marca "Venda cancelada", risca o valor e **exclui dos 3 KPIs** |
| 5 | `FluxoCaixaPage:36` | Período inicial **`"2025-03"` chumbado** → a tela abria vazia para dados reais | default = mês corrente real |
| 6 | `App.tsx` | **`<Toaster />` (sonner) nunca foi montado** — o wrapper existia em `components/ui/sonner.tsx` mas ninguém o renderizava → **todo `toast.success`/`toast.error` do app era invisível** (Pedidos, Fornecedores, CRM, Estoque **e** Financeiro) | montado em `App.tsx` (`position="top-center"`). Verificado em runtime: o toast voltou a aparecer |
| 7 | `FinanceiroDashboardPage` / `DREPage` | Tendências percentuais **falsas** hardcoded (`12.5%`, `−5.2%`) e checkbox "comparar mês anterior" que não controlava nada | removidos |
| 8 | mocks do Financeiro | Datas fixas de **2025-03/04** → no modo demo tudo aparecia com **~530 dias de atraso** e os KPIs "no prazo"/"pago" zerados | datas relativas a hoje (`diasAPartirDeHoje`) + mix real de status |
| 9 | `mockData.ts` (mappers) | `categoria` era **hardcoded** e `categoria_id` era lido e ignorado; `recorrente` hardcoded `false` | `categoriaId` mapeado; `recorrente` deixa de ser inventado |

> 🔎 **Como o #6 foi achado:** só em **runtime** (o app compila, sobe, responde 200 e não lança exceção). `build`, `tsc` e o MCP da Vercel **não** pegam essa classe de defeito silencioso.

### 📱 Redesenho mobile-first (o pedido central)
- **Tabela de 6 colunas fixas → cards no mobile** (`md:hidden` + `divide-y`), tabela só no desktop — replicando o padrão de `/vendas/pedidos`.
- **KPIs deixaram de ser redundantes:** "Total a receber" e "Previsão de receita" eram a **mesma** informação. Agora: **A receber (no prazo) · Em atraso · Recebido** (idem em Pagar).
- **Badge de status com cor real** (âmbar = pendente, vermelho = vencido, verde = pago, cinza = cancelado) — antes o ponto era sempre verde.
- **Bottom-sheets** (`rounded-t-3xl` + handle) no lugar de modais centrados; alvos de toque ≥ 40px.
- **`window.confirm` → modal de confirmação próprio** ("o que vai acontecer").
- **"Demonstrar cobrança" era fake** (o texto dizia "simulação") → agora abre o **WhatsApp real** com a mensagem pronta (`wa.me`), e só aparece quando há telefone.
- **Campo "Categoria" removido** do formulário: não há coluna persistível e `me_categoria_financeira` está **vazia** (0 linhas). Era um campo obrigatório que mentia.
- Filtros: chips multi-seleção + busca inline (padrão Pedidos).

### 🧪 Verificação
- `npx tsc --noEmit` → **5 erros** (linha de base, zero novos) · `npm run build` → ✅.
- **Smoke de runtime (5 telas, viewport 390px):** todas renderizam, **zero erro de console**, cards legíveis; o bottom-sheet de cadastro abre com a data de hoje e o caminho de erro devolve mensagem amigável (*"Empresa não identificada para este usuário…"*) em vez de travar.
- KPIs no modo demo (antes → depois): Receber *no prazo* R$ 0 → **R$ 446,83** · *atraso* ~530 dias → **3 e 12 dias** · *recebido* R$ 0 → **R$ 680,00**.

### ⏳ Pendências / fora de escopo (registradas, não feitas)
- **`use-dre.ts` mistura janelas de tempo:** receita por `me_venda.criado_em`, despesa por `data_pagamento`/`data_vencimento`. É decisão de negócio (caixa vs competência) — **não alterado**.
- **CRUD de categorias financeiras:** hook de leitura `use-categorias-financeiras.ts` criado, mas **ainda não usado por nenhuma tela** (`me_categoria_financeira` vazia). Próximo passo se o fundador quiser categorizar.
- **Contas manuais sem venda** (`venda_id` NULL) não têm `numeroPedido` — o card mostra o selo "Manual". Correto por ora.
- **`me_fornecedor` ainda não é lido pela tela de Fornecedores** (`use-suppliers` segue mock/localStorage): a conta a pagar **cria** o fornecedor real, mas a tela de Fornecedores ainda não o lê.

---

## 🧾 DRE — dois achados corrigidos (21/09/2026)

**Status:** ✅ CONCLUÍDO — só `src/app/hooks/use-dre.ts` (a `DREPage` não foi tocada). `tsc` **5** (zero novos) · `npm run build` ✅.

| # | Achado | Diagnóstico | Correção |
|---|---|---|---|
| 1 | Venda cancelada na receita | A query de receita filtrava só `deletado_em`, **não** `status_venda`. Cancelar pelo fluxo normal de status (`use-atualizar-status-pedido`) grava `status_venda='cancelado'` e **não** preenche `deletado_em` → a venda (e o CMV dela, via `vendaIds`) contava como receita | filtro no **cliente** `status_venda !== 'cancelado'`, antes de `receitaBruta` e antes de montar `vendaIds`. **Não** usar `.neq` do PostgREST: em SQL `NULL != 'cancelado'` é `NULL` → descartaria vendas com status NULL |
| 2 | "(-) Impostos" sempre R$ 0,00 | `impostos` era hardcoded `0`. O DAS lançado como conta a pagar caía em Despesas Operacionais e a linha de Impostos ficava zerada (o modo **demo** mostrava R$ 124,28 e o **real** R$ 0 — a inconsistência visível) | helper `ehDespesaTributaria(descricao)` (ponte até existir categoria — ver **B9**) soma as contas tributárias **pagas + em aberto**; essas contas **saem** de `despesasOperacionais` e do gráfico (anti-dupla-contagem) |

**⚠️ Correção de registro (honestidade):** o alerta anterior afirmava que a venda cancelada `32f88d3f` da Doceê (R$ 15,00) estava somando na receita. **Era falso** — ela já tinha `deletado_em = 18/09/2026 22:48` (foi "excluída", não apenas cancelada), então o filtro existente já a descartava. O achado **continua válido como bug latente**: cancelar pelo fluxo de status não preenche `deletado_em`, e essa venda contaria.

**Heurística de imposto (ponte provisória):** termos fortes (`imposto`, `tributo`, `darf`, `icms`, `iss`, `irpj`, `csll`, `cofins`, `pis`, `simples nacional`, `guia de recolhimento`) casam com **fronteira de palavra**; `DAS` casa **só no início** da descrição (`/^\s*das\b/i`) — a preposição "das" no meio da frase nunca casa (ex.: "Aluguel das lojas" → `false`). 30/30 casos testados. **Substituir por `categoria_id` quando o B9 entrar.**

---

## 🧩 MÓDULOS — análise documentada (21/09/2026)

> 📄 **Documento dedicado: `tracking/TRACKING_MODULOS.md`** — leia ANTES de mexer em módulos, rail, `/meus-modulos`, planos ou permissões por colaborador.

**WHY:** antes do teste com a Doceê, o fundador quer começar com o **mínimo de módulos** (Minha Empresa · Financeiro · Chatbot).

**Status:** ✅ **DECISÕES TOMADAS (22/09/2026)** — o fundador respondeu as 5 perguntas do §7 do documento. **Nenhum código foi alterado ainda.** Fila acordada: **Cardápio (C) → menu enxuto (A) → ligar no banco (B)**. Detalhe completo em `tracking/TRACKING_MODULOS.md` §7.

**Achado central — dois sistemas de módulos que não se falam:**
- O **banco** tem catálogo real (`unq_modulos_sistema`, 11 módulos) + ativação por empresa (`unq_empresa_modulos`, populada para **UNIQ Empresas** e **Gráfica HQ**).
- A **aplicação não lê o banco**: o estado vive no **`localStorage`** (`uniq-modulos-ativos`) a partir de um catálogo **hardcoded de 17 módulos** (`src/app/lib/modulos.ts`).
- **Consequências verificadas:** ativação **por navegador, não por empresa**; tabelas do banco **decorativas**; **sem guarda de rota** (módulo "desativado" continua acessível pela URL); subnav **não filtrada**; `me_modulo_ativo` e `me_modulo_cargo` **vazias**; **3 vocabulários** de módulo (app 17 · banco 11 · `employees/ModuleCheckbox` 7); `loja_virtual` e `marketplace` apontam para a mesma rota; a **Doceê tem 0 módulos** no banco.
- **Produtos/categorias do cardápio moram dentro do módulo "Estoque"** → desligar Estoque tira da Doceê a gestão do cardápio (a vitrine pública segue no ar).

**Conflito de produto registrado:** o `CONTEXTO_PROJETO.md` diz *"Módulos ativados pela UNIQ — o parceiro não escolhe ou configura"*, mas a tela `/meus-modulos` entrega **Loja de Módulos + trial de 14 dias + cancelar + comparador de planos** ao cliente.

**Caminhos propostos:** **A** (pragmático, sem banco: ajustar catálogo/`CORE_MODULES` e remover a loja de módulos) · **B** (correto: ligar em `unq_empresa_modulos` + guarda de rota) · **C** (módulo **Cardápio**, tirando produtos/categorias/banners de dentro de "Estoque"). **Recomendação: A agora; B + C na sequência** — os três passam por PRD/SPEC/WIRE.

**✅ Decisão do fundador (22/09/2026) — ordem INVERTIDA em relação à recomendação:**
- **1º Loja/Vitrine — COMPLETAR o `loja_virtual` que já existe** (não criar módulo novo). É obrigatório primeiro porque `estoque_atual` controla o **"Esgotado"** da vitrine (`use-loja-produtos.ts:40`, `use-carrinho-loja.ts:64`) e o único lugar que o edita é `/estoque/produtos`. Desligar Estoque antes disso = **vitrine vendendo o que a Doceê não tem**.
- **2º Menu enxuto (A)** — só depois que a Loja/Vitrine tiver o **toggle de disponibilidade**.
- **3º Ligar no banco (B)** — unificação dos códigos + guarda de rota + seed da Doceê.
- **Menu mínimo confirmado:** Minha Empresa · Financeiro · Chatbot, com **Dashboard saindo do rail** (vira sub-item de Minha Empresa) e **Agenda saindo**. MEL **continua `core`**. `/meus-modulos` vira **somente leitura**.
- **Rodapé hardcoded:** **fica como está** — `Meus Módulos` e `Configurações` são de todos os parceiros. Não é vazamento de filtro.
- **Modal de produto:** é **único e compartilhado** (`ProdutoFormModal`) — Estoque e Loja/Vitrine chamam o mesmo. Vai para lugar compartilhado (hoje mora em `components/estoque/`).
- **`marketplace/` multi-lojista:** sai do caminho — é outra ideia/produto. Hoje ele ocupa a rota do `loja_virtual` (`/marketplace`), que é o lugar errado.

**📄 Documentos do 1º item da fila (Loja/Vitrine) — pipeline SDD completo e ✅ APROVADO:**
- PRD: `tracking/plans/PRD-LojaVirtual-CompletarModulo.md`
- SPEC: `tracking/specs/SPEC-LojaVirtual-CompletarModulo.md`
- WIRE: `tracking/wireframe/WIRE-LojaVirtual-CompletarModulo.md`

### ✅ VALIDADO PELO FUNDADOR (22/09/2026) — commits `29885d2` · `3e2b0b0` · `6b80da9` · deploy Vercel `READY`

**O fundador validou no celular:** *"Loja validada. Ficou ótimo."*

> 🔧 **Três furos corrigidos depois do primeiro deploy** — todos só apareceram na validação real. Detalhe completo no SPEC (§1, callouts):
> 1. **`loja_virtual` estava `nao_adquirido`** no catálogo → o módulo nasceria **invisível no rail**, sem erro e sem aviso.
> 2. **O `localStorage` vence o catálogo** (`ModulosContext.tsx:34-35`) → trocar o catálogo para `ativo` **não bastava** para quem já usava o app; exigiu a migração `uniq-loja-virtual-ativa-v1`.
> 3. **O `SUBNAV_SECTIONS` não foi trocado** → o rail dizia "Loja Virtual" mas o submenu ao lado ainda levava ao Marketplace antigo. **Reportado pelo fundador.**
>
> **Regra registrada para o próximo agente:** um módulo novo no rail precisa de **três** amarrações — `RAIL_ITEMS`, **`SUBNAV_SECTIONS`** (seção com o mesmo `railId`) e `moduloRoutes`. Faltar uma faz o módulo parecer quebrado.

**O que foi entregue:** o **editor de aparência** (a lacuna real — até então trocar banner exigia subir arquivo no bucket e escrever JSON à mão), o **`exibir_vitrine`** ligado ponta a ponta com o toggle "Mostrar na vitrine", **"Preço promocional" → `preco_varejo`** (destrava o selo "de/por" que a vitrine **já sabia** desenhar), **`unidade` persistida**, a **rota do módulo** corrigida (`/marketplace` → `/loja-virtual`, rail volta a dizer "Loja Virtual") e o **`ProdutoFormModal` movido** para `components/produto/` — modal único compartilhado entre Estoque e Loja.

**Migration aplicada** — `supabase/migrations/20260922120000_me_produto_unidade_e_exibir_vitrine_default.sql`:
- `me_produto.unidade` (text, nullable) — **aditiva, zero risco**
- `me_produto.exibir_vitrine` default `false` → **`true`** (afeta só linhas novas)

**As duas decisões pendentes foram resolvidas pelo fundador (22/09/2026):**
- ✅ **`exibir_vitrine` default → `true`** — produto novo aparece na loja; o parceiro desmarca se não quiser.
- ✅ **Paleta LIVRE** (com os defaults do `DESIGN.md`). Motivo registrado: a `appearance` real da **Gráfica HQ** já usa `#4f9ef3`/`#ff6600`, cores que **não existem** no `DESIGN.md`. A distinção que resolve: **`DESIGN.md` = UI do produto · `appearance` = marca do parceiro**.

> 🔎 **O achado que motivou a correção:** `me_produto.exibir_vitrine` tinha default **`false`** e o modal **não escrevia a coluna** → o próximo produto cadastrado pela Doceê nasceria **invisível na loja, sem UI para corrigir**. Os 16 produtos dela estavam `true` porque foram configurados **por fora do app**. Não era bug ativo — era **latente com disparo garantido**.

> ⚠️ **Furo corrigido no SPEC durante a implementação:** `loja_virtual` estava no catálogo como **`nao_adquirido`**, e o `visibleRailItems` (`AppLayout.tsx:259-265`) esconde tudo que é `nao_adquirido`. Sem trocar para **`ativo`**, o módulo seria construído por inteiro e ficaria **invisível no rail** — sem erro e sem aviso. Corrigido em `lib/modulos.ts`.

> ⚠️ **Armadilha evitada:** o SPEC tipava `banners: BannerLoja[]` (camelCase), mas a vitrine pública lê o jsonb cru em **snake_case** (`desktop_url`, `button_text`…). O hook de escrita faz a conversão. Sem ela, **todo banner salvo seria descartado** no `mapBanner` e a loja cairia no banner gerado — falha silenciosa contra o critério de aceite "banner salvo aparece em `/loja/docee`".

**Verificação:** `npx tsc --noEmit` = **0 erros** · `npm run build` OK (3594 módulos) · Vercel **`READY`**.

**Próximo da fila:** o **menu enxuto** (Opção A) — **ainda sem PRD/SPEC/WIRE**. Não entra antes de ter pipeline próprio.

**Backlog:** registrado como **B10**.

---

## ➕ PENDÊNCIAS QUE DEPENDEM DO FUNDADOR

| # | Item | Necessário antes de | Observação |
|---|---|---|---|
| P1 | **Número de WhatsApp do laboratório** (HQ Gráfica / Doceê) | Semana 2 (2.3) | ✅ Confirmado: `5511919153508` (Doceê / HQ Gráfica) |
| P2 | **GitHub + Vercel** confirmados (preview acessível) | Semana 1 | É como o fundador valida pelo celular |
| P3 | **LGPD** (política, consentimento, retenção) | Semana 4 (4.5) | CEO + Fundador |
| P4 | `DESIGN.md` restante (Voice & Tone, Imagery, Posture, seções duplicadas) | Semana 4 | Antes do funil |
| P5 | **Revisão de segurança RLS** — **medido em 21/09/2026: 68 de 88 tabelas** do schema `public` com RLS **desligado**, e **todas as 88** com grant para `anon` (`arwdDxtm` = SELECT/INSERT/UPDATE/DELETE/TRUNCATE). Inclui `me_cliente` (PII: nome/telefone/endereço) e `me_usuario` (e-mails). *(O número anterior de 54 estava subestimado.)* | **Sprint de Segurança dedicada** | ✅ **Decisão do fundador (21/09/2026): adiar.** O produto roda com **empresas internas**, sem cliente externo. Trabalho **mapeado e acionável** em **`tracking/BACKLOG_SEGURANCA.md`**. **Gatilho de urgência: o primeiro cliente externo real.** Em paralelo, a escrita de vendas recebeu correção curta (`PRD`/`SPEC-Seguranca-EscritaVendas.md`) — que é correção e preparação, **não** defesa enquanto o P5 estiver aberto |

---

## 📋 BACKLOG TÉCNICO (pós-Semana 2)

> Itens identificados durante a implementação da Semana 2 que precisam ser viabilizados em sprints futuras.

| # | Item | Contexto | Prioridade |
|---|---|---|---|
| B1 | **Integrar PDV ao banco de dados** | Hoje o PDV (`/vendas/pdv`) usa apenas mocks (`pdvMockData.ts`). Precisa conectar ao Supabase para criar vendas reais em `me_venda`, baixar estoque (`me_produto`) e registrar pagamentos. | Alta |
| B2 | **Cadastro de produtos/serviços** | Para o PDV funcionar de ponta a ponta, precisa de tela de cadastro de produtos (`me_produto`, `me_servicos`) com preço, estoque, categoria e foto. | Alta |
| ~~B3~~ | ~~**Autocomplete de cliente no Novo Pedido**~~ | ✅ **Resolvido (18/09/2026)** pelo **item 8** — hook novo `use-buscar-clientes.ts`: busca em `me_cliente` escopada por empresa, por **nome parcial (`ilike`)** e por **telefone normalizado**, com dropdown de sugestões (nome + telefone formatado). | Fechado |
| ~~B4~~ | ~~**Vincular pedido a cliente existente**~~ | ✅ **Resolvido (18/09/2026)** pelo **item 8** — selecionar uma sugestão grava o `cliente_id` real; `useCriarPedido` aceita `clienteId`; o find-or-create por **nome exato** foi substituído por **telefone normalizado → nome `ilike`**; `23505` reusa o cadastro existente. | Fechado |
| ~~B5~~ | ~~**Busca de endereço por CEP**~~ | ✅ Resolvido (15/09/2026) — ViaCEP integrado no checkout da Loja Virtual (SPEC-LojaVirtual-DoceE §7); pré-preenche rua/bairro/cidade/UF com campos editáveis. | Fechado |
| ~~B6~~ | ~~**Completar SDD da T2.9**~~ | ✅ Resolvido (11/09/2026) — PRD e WIRE criados em `tracking/plans/` e `tracking/wireframe/`. | Fechado |
| B7 | **Erro TS em `ProdutoDetalhePage.tsx:456` — `tab.badge` possivelmente `undefined`** | Arquivo da lane "Editar Produto" (trabalho paralelo, 12/09/2026). `TABS` (linhas 322–327) tem shapes inconsistentes: só a aba `movimentacoes` tem `badge` (as demais não); a guarda `{"badge" in tab && tab.badge > 0}` (linha 456) não estreita o tipo → LSP: `'tab.badge' is possibly 'undefined'`. **Fix sugerido:** tipar o elemento de `TABS` com `badge?: number` explícito e usar `tab.badge != null && tab.badge > 0` (ou `typeof tab.badge === "number"`). **Dono:** lane Editar Produto (não tocar por esta lane). | Média |
| B8 | **~~"Contabilizar venda" envia `p_itens` sem `produto_id`/`servico_id`~~** | ✅ Resolvido (15/09/2026). Parte 1: `use-pedido.ts` busca `me_itens_venda` (+ `foto_url` via `me_produto`) e popula `itens` no detalhe — validação: venda `0c901c4a`, "Surpresa de Uva" ×2. Parte 2: `ItemPedido` ganhou `produtoId`/`tipoItem`; `ItemVenda` e `handleContabilizar` mandam payload canônico da RPC (`{tipo, id_referencia, nome, quantidade, preco_unitario}`). Commit `de7c86b` (parte 1). | Fechado |
| B9 | **Categorias em Contas a Receber / Pagar** | O formulário de conta **não tem categoria** — por isso não dá para distinguir *compra de estoque/ingrediente* de *despesa operacional*, nem separar tributos por categoria. Isso **bloqueia o ajuste do DRE** que evita a **dupla contagem** entre o **CMV** (custo da mercadoria vendida, derivado da venda) e a **conta a pagar da compra** — ex.: comprar R$ 98 de chocolate lançado como conta a pagar **e** o CMV das trufas feitas com ele contariam 2×. Exige: campo de categoria no form (lendo `me_categoria_financeira`, hoje **vazia**) + classificar a conta + o DRE excluir as compras de estoque das Despesas Operacionais. ⚠️ **Enquanto isso, a linha de Impostos usa uma heurística por descrição** (`ehDespesaTributaria` em `use-dre.ts`), que deve ser substituída por `categoria_id` quando este item entrar. | Média |
| B10 | **Sistema de módulos — unificar app ↔ banco** | 📄 Diagnóstico completo em **`tracking/TRACKING_MODULOS.md`**. Hoje o app **ignora** as tabelas de módulo (`unq_modulos_sistema` / `unq_empresa_modulos`) e usa `localStorage` + catálogo hardcoded (**17 códigos**), enquanto o banco tem **11 códigos diferentes**; `me_modulo_ativo` e `me_modulo_cargo` estão **vazias**; **não há guarda de rota** (módulo desativado entra pela URL); subnav não filtrada; `loja_virtual` e `marketplace` apontam para a mesma rota. Inclui: menu mínimo (Minha Empresa · Financeiro · Chatbot), alinhar `/meus-modulos` à decisão *"módulos ativados pela UNIQ"* e o módulo **Cardápio** (hoje produtos/categorias/banners moram dentro de "Estoque"). **✅ DECIDIDO em 22/09/2026 — ver `TRACKING_MODULOS.md` §7.** Fila: **Cardápio (C) → menu enxuto (A) → banco (B)**. O Cardápio é o 1º porque `estoque_atual` controla o "Esgotado" da vitrine: desligar Estoque antes dele faz a vitrine vender produto inexistente. | **Alta** |

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

*Kit de construção mantido pelo CEO. Atualizado em 21/09/2026. Fontes: `CONTEXTO_PROJETO.md`, `AGENTS.md`, `DESIGN.md`, schema real do Supabase.*
