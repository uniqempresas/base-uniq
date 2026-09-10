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

## 📌 Decisão #0 (resolvida — CRÍTICA)

- **Supabase OFICIAL:** `krrkfgvdwhpelxtrdtla.supabase.co` ← é este que tem os dados reais e que os agentes devem usar.
- ⚠️ **O front aponta para o errado:** `src/lib/supabase.ts` está configurado com `eqyvicudbrfwjynlbtie.supabase.co` (herdado de um protótipo onde só o login era real). **A tarefa 1.1 é corrigir isso.**
- A edge function `criar-conta` em `src/app/components/auth/CadastroPage.tsx` (linha ~198) também aponta para o projeto errado.

> **Teste de sanidade (para o agente):** após conectar, listar `me_empresa` deve retornar **2 registros** e `crm_chat_conversas` deve retornar **18**. Se retornar 0, o banco é o errado.

---

## 🏗️ ESTADO REAL — o backend é rico, o front é mock

### Backend (já construído — NÃO recriar)

| Domínio | Tabela | Dados reais | Campos-chave |
|---|---|---|---|
| **Chat WhatsApp (Evolution)** | `crm_chat_conversas` | **18** | `id`(text), `empresa_id`, `cliente_id`, `lead_id`, `status`, `modo`, `titulo`, `nome`, `canal`, `canal_id`, `canal_dados`(jsonb), `foto_contato`, `criado_em` |
| **Mensagens** | `crm_chat_mensagens` | **645** | `id`, `conversa_id`(text), `remetente_tipo`, `remetente_id`, `conteudo`, `tipo_conteudo`, `lido`, `metadados`(jsonb), `remetente`, `tipo`, `arquivo_url`, `canal_mensagem_id`, `status`, `criado_em` |
| **Leads** | `crm_leads` | **9** | `id`, `empresa_id`, `nome`, `email`, `telefone`, `status`, `origem`, `cargo`, `empresa_nome`, `ltv`, `ultima_interacao`, `observacoes`, `foto_url`, `created_at` |
| **Empresa** | `me_empresa` | **2** | `id`, `nome_fantasia`, `cnpj`, `telefone`, `email`, `slug`, `store_config`(jsonb), `logo_url`, `appearance`(jsonb) |
| **Usuário** | `me_usuario` | **2** | `id`, `empresa_id`, `email`, `nome_usuario`, `cargo`, `role`, `ativo` |
| **Vendas** | `me_venda` | **3** | `id`, `empresa_id`, `cliente_id`, `usuario_id`, `valor_total`, `status_venda`, `forma_pagamento`, `canal_venda`, `tipo_venda`, `npedido`, `conta_id`, `criado_em` |

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

**Gate:** a Doceê opera pela Base UNIQ sem voltar para o caderno/WhatsApp solto.

**SDD:** SPEC da integração n8n → `crm_leads`; WIRE do fluxo "pedido → contabilizado".

**Documentos criados (T2.1):**
- PRD: `tracking/plans/PRD-Semana2-T2.1-PedidoWhatsApp-CRM.md`
- SPEC: `tracking/specs/SPEC-Semana2-T2.1-PedidoWhatsApp-CRM.md`
- WIRE: `tracking/wireframe/WIRE-Semana2-T2.1-LeadsWhatsApp.md`

**Implementação concluída (T2.1):**
- `/crm/clientes` integrado ao Supabase (`crm_leads`) com fallback mock
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
- Hooks `use-clientes` e `use-cliente` criados
- Componentes `ClienteOrigemBadge` e `ClienteConversaResumo` criados

**Número confirmado:** `5511919153508` (Doceê / HQ Gráfica) — usar este canal ao duplicar o fluxo n8n.

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
| B3 | **Autocomplete de cliente no Novo Pedido** | Na tela de criar pedido (`PedidosListaPage`), ao digitar o nome do cliente, buscar no banco (`me_cliente` / `crm_leads`) e sugerir cadastros existentes — evita duplicar clientes. | Média |
| B4 | **Vincular pedido a cliente existente** | Hoje `useCriarPedido` busca por nome exato. Melhorar para busca fuzzy ou por telefone, e permitir selecionar cliente existente vs criar novo. | Média |
| B5 | **Busca de endereço por CEP** | Ao criar cliente/pedido, integrar ViaCEP ou similar para preencher endereço automaticamente. | Baixa |

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

*Kit de construção mantido pelo CEO. Atualizado em 07/09/2026. Fontes: `CONTEXTO_PROJETO.md`, `AGENTS.md`, `DESIGN.md`, schema real do Supabase.*
