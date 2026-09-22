# 🧩 TRACKING — Módulos da Base UNIQ (análise + decisões)

> **Para o agente que pegar isto sem contexto:** leia este arquivo inteiro antes de tocar em qualquer coisa relacionada a módulos, catálogo de módulos, menu lateral (rail), `/meus-modulos`, planos ou permissões por colaborador. Ele descreve **como o sistema de módulos funciona hoje**, **por que ele não é o que parece**, e **quais decisões já foram tomadas** (§7) — a fila de execução está no §8.
>
> **Documento pai:** `tracking/TRACKING.md` · **Contexto de negócio:** `tracking/CONTEXTO_PROJETO.md` (§ "Arquitetura de Módulos: default + vertical" e § "Módulos (ativados pela UNIQ, não escolhidos pelo cliente)")
>
> **Status:** ✅ **DECISÕES TOMADAS (22/09/2026)** — o fundador respondeu as 5 perguntas do §7. **Nenhum código foi alterado ainda.** Próximo passo: PRD → SPEC → WIRE (§8).
> **Origem:** levantamento feito a pedido do fundador antes do teste final com a usuária da Doceê, que quer começar com o **mínimo de módulos** (Minha Empresa · Financeiro · Chatbot).

---

## 0. TL;DR — o achado que muda tudo

**Existem dois sistemas de módulos que não se falam:**

1. **O banco de dados tem um sistema de módulos real e populado** — `unq_modulos_sistema` (catálogo, 11 módulos) + `unq_empresa_modulos` (ativação por empresa, com dados de 2 empresas).
2. **A aplicação NÃO lê o banco.** O estado dos módulos vive no **`localStorage` do navegador** (`uniq-modulos-ativos`), a partir de um **catálogo hardcoded de 17 módulos** em `src/app/lib/modulos.ts`.

**Consequência:** a ativação de módulos é **por navegador, não por empresa**. As tabelas do banco são decorativas hoje. Limpar o navegador (ou abrir em outro aparelho) **reseta** a lista para o padrão do código. A Doceê tem **0 módulos** no banco e isso é irrelevante, porque o app nunca pergunta.

---

## 1. O lado do BANCO (Supabase oficial `krrkfgv...`)

### 1.1 Tabelas existentes (4 — só 2 são usadas)

| Tabela | Colunas | Estado |
|---|---|---|
| **`unq_modulos_sistema`** | `id` uuid PK, `nome` text NOT NULL, `descricao` text, `preco_mensal` numeric, `preco_anual` numeric, `categoria` text, `imagem_url` text, `icone` text, `funcionalidades` jsonb, `versao` text, `status` text, `created_at`, **`codigo`** text | ✅ **11 linhas** (catálogo) |
| **`unq_empresa_modulos`** | `id` uuid PK, `empresa_id` uuid NOT NULL, `modulo_id` uuid NOT NULL (→ `unq_modulos_sistema.id`), `status` text (default `'active'`), `data_contratacao` timestamptz, `created_at` | ✅ **10 linhas** (2 empresas) |
| `me_modulo_ativo` | `id`, `empresa_id`, **`modulo_codigo`** (text), `ativo` bool, `created_at`, `updated_at` | ⚠️ **0 linhas** — desenho anterior abandonado |
| `me_modulo_cargo` | `id`, `empresa_id`, `cargo_id` (int), **`modulo_codigo`** (text), `ativo` bool, `created_at`, `updated_at` | ⚠️ **0 linhas** — permissão por cargo, nunca usada |

> **Atenção:** as duas tabelas vazias usam `modulo_codigo` (**texto**), enquanto `unq_empresa_modulos` usa `modulo_id` (**FK uuid**). São dois desenhos concorrentes. Não misturar.

### 1.2 Catálogo real (`unq_modulos_sistema`)

| `codigo` | `nome` | `categoria` | `preco_mensal` |
|---|---|---|---|
| `dashboard` | Minha Empresa | base | 0.00 |
| `finance` | Financeiro | base | 0.00 |
| `modules` | Módulos | base | 0.00 |
| `settings` | Configurações | base | 0.00 |
| `crm` | CRM | opcional | 0.00 |
| `storefront` | Loja Virtual | opcional | 0.00 |
| `inventory` | Estoque | opcional | 0.00 |
| `team` | Equipe | opcional | 0.00 |
| `reports` | Relatórios | opcional | 0.00 |
| `sales` | Vendas / PDV | Vendas | 49.90 |
| `attendant` | Atendente UNIQ | comunicacao | 99.90 |

### 1.3 Ativação por empresa (`unq_empresa_modulos`)

Empresas existentes (`me_empresa`):

| Empresa | `id` | slug |
|---|---|---|
| **Doceê** | `52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f` | `docee` |
| **Gráfica HQ** | `9c3af87a-53b1-40dc-9e24-61890bac6586` | `grafica-hq-968` |
| **Loja Teste01** | `f56366e3-36e9-4a82-ad21-98c0e65d0d92` | `loja-teste01` |
| **UNIQ Empresas** | `6257ebef-88a0-478f-bc2a-af0f8924892f` | `uniq-empresas` |

| Empresa | Módulos ativados no banco |
|---|---|
| **UNIQ Empresas** | 6 — Minha Empresa (`dashboard`), Financeiro (`finance`), Módulos (`modules`), Configurações (`settings`), CRM (`crm`), Loja Virtual (`storefront`) |
| **Gráfica HQ** | 4 — Financeiro (`finance`), CRM (`crm`), Loja Virtual (`storefront`), Vendas/PDV (`sales`) |
| **Doceê** | **0** (nenhuma linha em nenhuma das 3 tabelas) |
| **Loja Teste01** | **0** |

> ⚠️ Mesmo as empresas com linhas **não sofrem efeito** — o app não lê essas tabelas.

---

## 2. O lado da APLICAÇÃO (o que realmente vale hoje)

### 2.1 Catálogo hardcoded — `src/app/lib/modulos.ts` (17 itens)

| `codigo` | `nome` | `categoria` | `preco` | status inicial |
|---|---|---|---|---|
| `dashboard` | Dashboard | core | 0 | **core** |
| `minha_empresa` | Minha Empresa | core | 0 | **core** |
| `configuracoes` | Configurações | core | 0 | **core** |
| `meus-modulos` | Meus Módulos | core | 0 | **core** |
| `agenda` | Agenda | operacional | 49 | **core** (era `nao_adquirido`; migração `uniq-agenda-inclusa-v1`) |
| `mel` | MEL IA | premium | 99 | **core** |
| `crm` | CRM | operacional | 49 | ativo |
| `vendas` | Vendas | operacional | 49 | ativo |
| `financeiro` | Financeiro | operacional | 49 | ativo |
| `chatbot` | Chatbot | premium | 79 | ativo |
| `estoque` | Estoque | operacional | 49 | trial (`dataTrialFim`) |
| `loja_virtual` | Loja Virtual | operacional | 79 | nao_adquirido |
| `metricas` | Métricas | operacional | 49 | nao_adquirido |
| `marketplace` | Marketplace | premium | 79 | nao_adquirido |
| `fornecedores` | Fornecedores | operacional | 49 | nao_adquirido |
| `servicos` | Catálogo de Serviços | operacional | 49 | nao_adquirido |
| `colaboradores` | Colaboradores | operacional | 49 | nao_adquirido |

- Tipos: `ModuloStatus = 'core' | 'ativo' | 'trial' | 'cancelado' | 'nao_adquirido'` · `ModuloCategoria = 'core' | 'operacional' | 'premium'`.
- **Não existem** flags `default` / `vertical` / `obrigatório`. A regra "core não some" está **hardcoded no layout** (§2.3), não no catálogo.
- Chave de storage: `MODULOS_STORAGE_KEY = 'uniq-modulos-ativos'`.

### 2.2 Estado — `src/app/contexts/ModulosContext.tsx` (**localStorage, zero Supabase**)

- **Leitura** (`carregarModulos`, :28-53): `localStorage.getItem('uniq-modulos-ativos')`; se vazio/corrompido → `MODULOS_ATIVOS_INICIAIS`.
- **Mesclagem por `id`** (:34-35): o catálogo é mesclado com o que está salvo (módulo novo no código aparece sem bump de versão).
- **Migração única** `uniq-agenda-inclusa-v1` (:9, :43-48).
- **Gravação** (`useEffect` → `localStorage.setItem`, :58-64) — silencioso em erro ("persistência local é opcional para o protótipo").
- **Escritas de estado:** `ativarModulo` (:70, **nunca chamado por nenhuma tela**), `cancelarModulo` (:76), `iniciarTrial` (:82, +14 dias), `getStatus` (:88-91, default `nao_adquirido`).
- Provider montado em `src/app/App.tsx`.
- `src/app/hooks/useModulosAtivos.ts` é só um re-export do contexto (não calcula nada).

### 2.3 Montagem do menu — `src/app/components/layout/AppLayout.tsx`

**`RAIL_ITEMS`** (:64-77) — `{ id, label, icon, path, moduloCodigo }`:

| id | label | path | `moduloCodigo` |
|---|---|---|---|
| dashboard | Visão Geral | `/dashboard` | `dashboard` |
| minha-empresa | Minha Empresa | `/configuracoes/empresa` | `minha_empresa` |
| vendas | Vendas & PDV | `/vendas` | `vendas` |
| crm | CRM | `/crm/dashboard` | `crm` |
| loja | Marketplace | `/marketplace` | `loja_virtual` |
| financeiro | Financeiro | `/financeiro` | `financeiro` |
| agenda | Agenda | `/agenda` | `agenda` |
| metricas | Métricas | `/metricas` | `metricas` |
| mel | MEL | `/mel` | `mel` |
| chatbot | Chatbot | `/chatbot` | `chatbot` |
| modulos | Módulos | `/meus-modulos` | `meus-modulos` |
| configuracoes | Configurações | `/configuracoes/empresa` | `configuracoes` |

**Regras de visibilidade:**

1. **`CORE_MODULES`** (:218) = `Set(["dashboard", "configuracoes", "meus-modulos", "minha_empresa", "mel"])` → **sempre visíveis**.
2. **`visibleRailItems`** (:259-265): o item passa se for core **ou** se o módulo estiver `core`/`ativo`/`trial`. `nao_adquirido` e `cancelado` **somem**.
3. **Desktop** (:378-441): o rail principal renderiza `visibleRailItems` **filtrando `modulos` e `configuracoes`** (:379); esses dois aparecem em **botões hardcoded no rodapé** (:414-441) que **ignoram o filtro**.
4. **Mobile** (:616-793): mesmo `.filter()` (:616-617) + rodapé fixo com Meus Módulos / Configurações / Sair.
5. **A subnav (coluna branca) NÃO é filtrada** — `activeSubnav` deriva só da rota atual (:242-257). Resultado: a subnav de "Minha Empresa" lista **Produtos, Serviços, Clientes, Fornecedores, Colaboradores** mesmo com esses módulos desligados.
6. **NÃO existe guarda de módulo em rota.** `AppLayout` só guarda **autenticação** (:296-311). `src/app/routes.tsx` não tem nenhuma checagem de módulo. **Digitar a URL de um módulo desativado entra normalmente** — desativar é puramente cosmético.

### 2.4 Tela de módulos — `src/app/components/modulos/MeusModulosPage.tsx` (884 linhas)

- **Rota:** `/meus-modulos` (`routes.tsx:76`, lazy). Rota irmã: `/onboarding/plano` → `EscolhaPlanoPage`.
- **3 abas** (:689-858):
  - **Meus Módulos** — grid de cards dos módulos com `status !== 'nao_adquirido'`; filtros todos/ativos/trial/cancelados.
  - **Loja de Módulos** — banner de planos + busca + grid dos `nao_adquirido`.
  - **Meu Plano** — plano **mock** (`ASSINATURA_MOCK`, Business R$ 149) + comparador de planos.
- **Ações:** *Adquirir* (`nao_adquirido`) → modal de trial 14 dias → `iniciarTrial`; *Cancelar* (`ativo`/`trial`) → modal com checkbox → `cancelarModulo` (status vira `cancelado`, **definitivo**); *Usar módulo* → `navigate(MODULO_ROUTES[codigo])`.
- **Dados:** 100% de `useModulosAtivos()` → localStorage. **Nenhuma chamada de API.**

### 2.5 Mapa código → rota — `src/app/lib/moduloRoutes.ts`

| codigo | rota | | codigo | rota |
|---|---|---|---|---|
| dashboard | `/dashboard` | | metricas | `/metricas/dashboard` |
| minha_empresa | `/configuracoes/empresa` | | mel | `/mel` |
| configuracoes | `/configuracoes` | | chatbot | `/chatbot` |
| meus-modulos | `/meus-modulos` | | marketplace | `/marketplace` |
| crm | `/crm/dashboard` | | fornecedores | `/fornecedores` |
| estoque | `/estoque/dashboard` | | servicos | `/servicos` |
| vendas | `/vendas` | | colaboradores | `/configuracoes/colaboradores` |
| financeiro | `/financeiro/dashboard` | | agenda | `/agenda` |
| **`loja_virtual`** | **`/marketplace`** ⚠️ | | | |

> 🐞 **`loja_virtual` e `marketplace` apontam para a MESMA rota `/marketplace`.**

### 2.6 "Minha Empresa" e "Configurações" são fixas?

**Sim, duplamente** — e isso é coerente com a intenção do fundador:
- estão no catálogo como `categoria: 'core'` **e**
- estão no `CORE_MODULES` do layout **e**
- têm botões **hardcoded** no rodapé que **ignoram qualquer filtro**.

Telas de configuração (`src/app/components/configuracoes/`):

| Rota | Arquivo | O que edita |
|---|---|---|
| `/configuracoes/empresa` | `EmpresaPage.tsx` | **Real:** `update` em `me_empresa` (`nome_fantasia, cnpj, telefone, email`). O resto do form (razão social, IE/IM, endereço, preferências, notificações, logo) é **UI sem persistência** |
| `/configuracoes/conta` | `ContaPage.tsx` | **Real:** `update` em `me_usuario` (`nome_usuario`). Senha/2FA/sessões/tema/plano/faturas são **mock/UI** |
| `/configuracoes/colaboradores` | `employees/*` | Gestão de equipe com estado local (ver §3) |

---

## 3. Achados e riscos (todos verificados)

| # | Achado | Detalhe | Impacto |
|---|---|---|---|
| A1 | **App ignora o banco** | `ModulosContext` só usa `localStorage`; grep por `me_modulo`/`unq_empresa_modulos` em `src/` = **0 resultados** | Ativação **por navegador**, não por empresa. Reset ao limpar o navegador |
| A2 | **Sem guarda de rota** | Nenhuma checagem de módulo em `routes.tsx`/`AppLayout` | "Módulo desativado" é **cosmético** — a URL entra |
| A3 | **Subnav não filtrada** | `activeSubnav` só olha a rota | Links de módulos desligados aparecem (Fornecedores, Serviços…) |
| A4 | **3 vocabulários de módulo** | Catálogo do app (17 códigos) × banco (11 códigos) × `employees/ModuleCheckbox.tsx` (7: `crm/inventory/sales/store/appointments/finance/settings/servicos`) | Só `dashboard` e `crm` coincidem app↔banco. Impossível ligar os dois sem unificar |
| A5 | **2 tabelas de módulo vazias** | `me_modulo_ativo`, `me_modulo_cargo` = 0 linhas | Desenho abandonado; risco de alguém "consertar" na tabela errada |
| A6 | **Rota duplicada** | `loja_virtual` e `marketplace` → `/marketplace` | Ambiguidade no mapa |
| A7 | **Conflito com a decisão de produto** | `CONTEXTO_PROJETO.md`: *"Módulos ativados pela UNIQ — o parceiro não escolhe ou configura"*. Mas `/meus-modulos` entrega **Loja de Módulos + trial + cancelar + comparador de planos** ao cliente | O app **contradiz** a decisão: hoje o cliente compra/cancela módulos sozinho |
| A8 | **Doceê com 0 módulos no banco** | 0 linhas nas 3 tabelas de ativação | Se algum dia ligarmos o banco, a Doceê veria **nada** — precisa de seed |
| A9 | **Produtos/categorias do cardápio moram no módulo "Estoque"** | `/estoque/produtos`, `/estoque/configuracoes` | Desligar Estoque **tira da Doceê a capacidade de mexer no cardápio** (a vitrine pública `/loja/docee` continua no ar) |
| A10 | **`ativarModulo` nunca é chamado** | Existe no contexto, grep = 0 usos | Código morto |
| A11 | **"Chatbot" e "MEL" são canais diferentes** | `/chatbot` (`ChatbotPage.tsx`) = **inbox estilo WhatsApp com dados reais** (`useConversasReais` → `crm_chat_conversas`/`crm_chat_mensagens`) — é onde o parceiro lê as conversas dos **clientes dele** (passo 2 da cadeia de demonstração). `/mel` (`MelDashboardPage.tsx`) = a **consultora do próprio parceiro** ("Sou a MEL, sua consultora virtual"), hoje com dados demonstrativos | Não são duplicatas: Chatbot = cliente final · MEL = o parceiro. **Os dois se mantêm** — mas o rótulo "Chatbot" esconde que é o inbox real |
| A12 | **`estoque_atual` controla "Esgotado" na vitrine** | `use-loja-produtos.ts:40` (`esgotado: estoque <= 0`), `use-carrinho-loja.ts:64` (bloqueia adicionar), `use-loja-criar-pedido.ts:52` (lê no pedido). O **único** lugar que edita o campo é `/estoque/produtos` (`use-atualizar-produto.ts:56`) | **Desligar Estoque hoje = a Doceê perde a capacidade de marcar produto esgotado → a vitrine vende o que ela não tem.** Torna o Cardápio (Opção C) **pré-requisito** de desligar Estoque, não sequência |

---

## 4. O que um usuário novo vê hoje

Navegador limpo → `MODULOS_ATIVOS_INICIAIS`:

- **Rail principal (~9 itens):** Visão Geral · Minha Empresa · Vendas & PDV · CRM · Financeiro · Agenda · MEL · Chatbot · Estoque (trial)
- **Rodapé fixo:** Meus Módulos · Configurações
- **Ocultos:** Loja Virtual, Métricas, Marketplace, Fornecedores, Serviços, Colaboradores

**Total ≈ 11 entradas de navegação.** O alvo do fundador é **3** (Minha Empresa · Financeiro · Chatbot).

**Para chegar em 3, não basta "desativar" os outros**, porque:
- `CORE_MODULES` **força** Dashboard, Configurações, Meus Módulos e **MEL** (MEL é core → nunca sai);
- o rodapé é hardcoded;
- a subnav vaza links;
- e a URL continua acessível.

---

## 5. Cardápio digital — o que existe e onde está o buraco

| Peça | Onde está hoje | Banco/estado |
|---|---|---|
| Produtos (CRUD + foto) | `/estoque/produtos` (`ProdutosPage`, `ProdutoFormModal`, `ProdutoDetalhePage`) | `me_produto` + bucket `uniq_me_produtos` |
| Categorias (CRUD) | `/estoque/configuracoes` (`ConfiguracoesProdutosPage`) | `me_categoria` (soft delete via `ativo`) |
| **Aparência / banners** | **NÃO EXISTE TELA** | `me_empresa.appearance` — escrito por **SQL manual** |
| Vitrine pública | `/loja/docee` (+ `/produto/:id`, `/checkout`, `/pedidos`, `/entrar`, `/conta`) | lê `me_empresa`, `me_produto`, `me_categoria` |

**O buraco:** não existe um lugar chamado "cardápio". A usuária precisa saber que o cardápio dela mora dentro de **Estoque**, e o banner só muda com SQL. Um **módulo Cardápio** faria sentido exatamente aqui — dono de *produtos + categorias + aparência/banners + link da vitrine*, sem depender de Estoque.

Confirmações:
- `SPEC-LojaVirtual-VitrineModerna.md`: *"Não existe tela para editar banners (V4 fora da v1)."*
- `PRD-LojaVirtual-VitrineModerna.md`: "V4: editor fora da v1."
- Grep em `src/app`: `appearance`/`store_config` aparecem **só em leitura** — **zero** `update`/`insert`.

---

## 6. Caminhos possíveis (✅ decidido em 22/09/2026 — ver §7)

### Opção A — Pragmático (rápido, sem banco)
Ajustar `MODULOS_ATIVOS_INICIAIS` + `CORE_MODULES` para o mínimo desejado, remover a "Loja de Módulos" (alinhando à decisão "ativados pela UNIQ") e filtrar a subnav.
- ✅ Entrega o menu enxuto rápido, sem risco de schema.
- ❌ O estado continua **por navegador** (não é controle real por empresa).

### Opção B — Correto (por tenant)
Ligar o app em `unq_empresa_modulos` (já populada), **unificar os códigos** com o banco, e adicionar **guarda de rota**.
- ✅ Controle real por empresa; permite a UNIQ operar módulos sem tocar em código.
- ❌ Maior: unificação de códigos + troca do `ModulosContext` por leitura do banco + seed da Doceê + guarda.

### Opção C — Módulo **Cardápio** (independente de A/B)
Criar o módulo que reúne *produtos + categorias + aparência/banners + link da vitrine*, tirando o cardápio de dentro do Estoque.

**Recomendação registrada (21/09):** **A agora** (destrava o teste com a Doceê sem risco) e **especificar B + C na sequência**.

**✅ Decisão do fundador (22/09/2026) — ordem invertida em relação à recomendação, por causa do A12:**

O **Cardápio (C) vem ANTES** de desligar o Estoque (parte de A). Motivo: enquanto o toggle de disponibilidade não existir no Cardápio, desligar Estoque deixa a Doceê **sem como marcar produto esgotado** e a vitrine pública segue vendendo (A12).

| Ordem | O que | Depende de |
|---|---|---|
| 1º | **C — Módulo Cardápio** (produtos + categorias + **disponibilidade** + aparência/banners + link da vitrine) | PRD/SPEC/WIRE |
| 2º | **A — Menu enxuto** (catálogo/`CORE_MODULES`, `/meus-modulos` somente leitura, subnav filtrada) | C entregar o toggle de disponibilidade |
| 3º | **B — Ligar em `unq_empresa_modulos`** + guarda de rota + unificação de códigos + seed da Doceê | A estabilizado |

---

## 7. ✅ Decisões tomadas (fundador, 22/09/2026)

| # | Pergunta | **Decisão** | Base |
|---|---|---|---|
| 1 | O menu mínimo é exatamente Minha Empresa · Financeiro · Chatbot? | **SIM — os 3.** O **Dashboard ("Visão Geral") sai do rail** e vira sub-item dentro de Minha Empresa (já era o pedido do fundador em 11/09 — `USO_REAL_DOCEE.md` item 10). A **Agenda sai** por ora; volta se ela começar a receber encomendas com data. | `USO_REAL_DOCEE.md` item 10 · `CONTEXTO_PROJETO.md:338-342` |
| 2 | MEL é `core` — mantém sempre visível? | **SIM, MEL continua `core`** (nunca desligável). MEL é a consultora do parceiro — é o produto. Trocar o conteúdo demonstrativo por dados reais é **tarefa separada**, não muda o status de core. | `CONTEXTO_PROJETO.md:338-342` ("3. Vê a Melissa e conversa com ela") |
| 3 | `/meus-modulos` continua com loja/trial/cancelar? | **NÃO — vira SOMENTE LEITURA.** Remove Loja de Módulos, trial de 14 dias, cancelar e comparador de planos. Passa a mostrar "o que está ativo" + "o que será ativado". Mata de tabela o `ASSINATURA_MOCK` (Business R$ 149), que contradiz o pricing fechado (R$ 297 → R$ 197). | `CONTEXTO_PROJETO.md:344` e `:528` ("o parceiro não escolhe ou configura") |
| 4 | Criar o módulo Cardápio? | **REVISADO em 22/09/2026 — NÃO criar módulo novo: COMPLETAR o `loja_virtual` que já existe.** Ele passa a ser dono de *produtos + categorias + disponibilidade + aparência/banners + link da vitrine*, com **"Cardápio" apenas como label vertical**. Continua exigindo PRD/SPEC/WIRE. **Revisão da resposta original ("criar o módulo Cardápio") — ver §7.1.** | §5 · A12 · `moduloRoutes.ts:13` |
| 5 | Estoque fica ligado para a Doceê? | **NÃO — desligar, mas só DEPOIS da Loja/Vitrine.** Enquanto o módulo não tiver o toggle de disponibilidade, desligar Estoque deixa a vitrine vendendo produto que ela não tem (A12). | A12 |

### ✅ Rodapé hardcoded — DECIDIDO (22/09/2026): **fica como está**

O "mínimo de **3**" resulta em **6 entradas de navegação** — e isso é **aceito**:

- **Rail (4):** Minha Empresa · Financeiro · Chatbot · **MEL** — MEL é forçado por `CORE_MODULES` (`AppLayout.tsx:218`) e não pode ser escondido.
- **Rodapé (2):** Meus Módulos · Configurações — **hardcoded** (`AppLayout.tsx:414-441`), ignoram qualquer filtro de módulo.

> **Decisão do fundador (22/09/2026):** o rodapé **permanece** — *"esses módulos serão para todos mesmo"*. `Meus Módulos` (agora somente leitura, §7 item 3) e `Configurações` são **de todos os parceiros**, não um vazamento do filtro de módulos. **Nada a fazer no `AppLayout` quanto a isso.**
>
> Consequência: o "mínimo de 3" era sobre **módulos operacionais**, não sobre o número de entradas do menu. As duas coisas foram confundidas na análise original — está resolvido.

### 7.1 ✅ Decisões da Loja/Vitrine (22/09/2026 — **REVISAM** o item 4)

> ⚠️ **Estas decisões revisam a resposta original do item 4.** A primeira resposta foi *"criar o módulo Cardápio"*. Depois de o fundador descrever o modelo mental dos dois módulos, ficou claro que **o módulo já existe** — é o `loja_virtual`. **Não criar módulo duplicado.**

| Tema | **Decisão** | Observação |
|---|---|---|
| **É módulo novo?** | **NÃO — é o `loja_virtual` que já existe no catálogo.** O trabalho é **completá-lo**. | Evita duplicata. `moduloRoutes.ts:13` já registra `loja_virtual`. |
| **Responsabilidade** | **Aparência + catálogo:** produtos, categorias, **disponibilidade**, aparência/banners (onde fica o banner, formato do menu, quantos itens por linha) e link da vitrine. | Complementa o Estoque, que fica com **quantidades** (entradas, saídas, movimentações). |
| **Nome** | **`loja_virtual` é o módulo default** (serve qualquer microempresa). **"Cardápio" é o label vertical** para negócios de comida — incluindo a Doceê. | Segue a regra `CRM` → `CRM_OTICA` (`CONTEXTO_PROJETO.md:194`). "Cardápio" falharia na **Gráfica HQ**, tenant real. |
| **Rota — precisa corrigir** | Hoje `loja_virtual` → **`/marketplace`**, que é o **marketplace multi-lojista** — lugar errado. A rota final deve ser a da loja/configuração **do próprio parceiro**. | Achado A6, agora com consequência prática. **Rota final: decidir no PRD.** |
| **Produtos e categorias** | Acessíveis de **ambos** os módulos (`/estoque/produtos` e Loja/Vitrine), **sempre pelo mesmo modal**. | Sem risco de divergência — ver abaixo. |
| **Tabelas** | Reaproveita `me_produto`, `me_categoria` e `me_empresa.appearance`. **Não cria schema novo.** | |
| **`marketplace/` multi-lojista** | **Sai do caminho.** O `marketplace/` (`LojistaGrid`, `VendedorDashboardPage`, `useMarketplace` com mocks) é de outra ideia/produto. **Deixa de ser destino do módulo.** | Decisão do fundador (22/09/2026). |
| **Onde mora o modal** | **Mover `ProdutoFormModal` para um lugar compartilhado** (ex.: `components/produto/`) e ajustar os imports. Nenhum módulo é "dono" do modal de outro. | Hoje vive em `components/estoque/` e importa de `./estoqueMockData`. |

#### ✅ O risco de divergência NÃO EXISTE — esclarecido pelo fundador (22/09/2026)

**Modelo mental do fundador para os dois módulos:**

| Módulo | Responsabilidade |
|---|---|
| **Loja / Vitrine** | **Aparência** — onde fica o banner, formato do menu, quantos itens por linha |
| **Estoque** | **Quantidades** — entradas, saídas, movimentações |

**O ponto que mata o risco:** o cadastro/edição de produto usa **UM ÚNICO modal compartilhado**. Independente da página ou do módulo, todos chamam o mesmo componente — então **não há dois formulários para divergir**.

**Verificado no código (22/09/2026):** o modal já existe e já é único — `src/app/components/estoque/ProdutoFormModal.tsx` (585 linhas, wizard de 3 passos: `Informações · Preços · Estoque`). Hoje é chamado por `ProdutosPage.tsx` (3× — criar/editar/duplicar) e `ProdutoDetalhePage.tsx` (2×). E ele **já cobre os dois olhares**:

- **inventário:** `estoque`, `estoqueMinimo`, `precoCusto`, `codigoBarras`
- **vitrine:** `nome`, `precoVenda`, `descricao`, `foto`, `categoriaId`, `unidade`

> ❌ **Tabela de donos de campo — DESCARTADA.** Era mitigação para um problema que não existe. Não há dois formulários, logo não há campos para divergir.
>
> ✅ **O que sobrava era uma decisão de ONDE o modal mora — e ela já foi tomada:** **mover `ProdutoFormModal` para um lugar compartilhado** (ex.: `components/produto/`) e ajustar os 5 pontos de chamada. ⚠️ Atenção: hoje ele também importa de `./estoqueMockData`, então a mudança **arrasta essa dependência junto** — o PRD precisa resolver isso, não só o caminho do arquivo.

---

## 8. Próximos passos (decisão tomada — 22/09/2026)

> ⚠️ **REGRA DE OURO (`AGENTS.md`):** mudança de tela/módulo exige **PRD → SPEC → WIRE** aprovado antes de qualquer código.

1. ~~Fundador responde §7.~~ ✅ **Feito em 22/09/2026.**
2. **PRD + SPEC + WIRE da Loja/Vitrine** (1º da fila) — **completar o `loja_virtual`, não criar módulo** (§7.1). Em `tracking/plans/`, `tracking/specs/`, `tracking/wireframe/`. O PRD **não pode deixar implícito**:
   - **O editor de aparência** (banner, formato do menu, itens por linha) — é a peça que **não existe**; os componentes que o consomem já existem (`LojaBannerCarousel`, `LojaCategoriaBar`, `LojaHeaderTenant`, `LojaSecaoHorizontal`);
   - **Toggle de disponibilidade** — destrava o item 5 do §7 e permite desligar o Estoque depois;
   - **A rota final do módulo** — hoje `loja_virtual` → `/marketplace`, que é o marketplace multi-lojista (errado);
   - **Mover o `ProdutoFormModal`** para lugar compartilhado + ajustar os 5 pontos de chamada (`ProdutosPage` 3×, `ProdutoDetalhePage` 2×);
   - **"Cardápio" como label vertical** do módulo default `loja_virtual`.
3. Depois da Loja/Vitrine implementada: **menu enxuto** (Opção A) — catálogo/`CORE_MODULES`, `/meus-modulos` somente leitura, subnav filtrada. *(O rodapé hardcoded **já foi decidido**: fica como está.)*
4. Só então **Opção B** (ligar em `unq_empresa_modulos` + guarda de rota + unificação dos 3 vocabulários + seed da Doceê).
5. Implementar em **lanes paralelas** onde não houver sobreposição de arquivo, com **contrato de dados congelado** e donos de arquivo explícitos.
6. **Verificação:** `npx tsc --noEmit` + `npm run build` + smoke de runtime do rail.

> ✅ **Linha de base do `tsc` — `npx tsc --noEmit` = 0 erros (22/09/2026).** O valor **13** registrado em `TRACKING.md` (`:660`, `:688`) estava **desatualizado** (era verdadeiro naquelas sessões). O valor medido no início desta sessão era **5** — e os **5 foram corrigidos no mesmo dia**:
>
> | Arquivo | Erro | Causa | Status |
> |---|---|---|---|
> | `lib/mocks/chatbot.ts(13,8)` | TS2307 | caminho `'../types/chatbot'` não existe | ✅ corrigido |
> | `lib/mocks/employees.ts(1,44)` | TS2307 | caminho `'../types/employees'` não existe | ✅ corrigido |
> | `lib/mocks/marketplace.ts(5,61)` | TS2307 | caminho `'../types/marketplace'` não existe | ✅ corrigido |
> | `agenda/CompromissosPage.tsx(227,39)` | TS2365 | `>` entre `string \| number` e `number` | ✅ corrigido |
> | `marketplace/CheckoutPage.tsx(171,8)` | TS2367 | comparação sem sobreposição (código morto) | ✅ corrigido |
>
> **O que eram os 3 TS2307:** um único defeito. Os mocks vivem em `src/app/lib/mocks/`, então `'../types/X'` resolvia para `src/app/lib/types/X` — diretório que **não existe**. O correto era `'../../types/X'`, que os mocks irmãos (`clientes.ts`/`metricas.ts`/`suppliers.ts`/`servicos.ts`) já usavam.
>
> **O que eram os 2 restantes:** **nenhum era bug de lógica.** `CompromissosPage` misturava `string` (`formatCurrency`) e `number` no mesmo campo `value` e escondia o problema com `(kpi as any)`; o `kpi.value > 0` era **redundante** com o `warn` já calculado. `CheckoutPage` tinha uma condição **sempre verdadeira** (código morto) por causa do early return da linha 124. As duas correções **não mudam comportamento** e **removeram** um `any`.
>
> ✅ **GATE CONGELADO: `npx tsc --noEmit` = 0 erros. `npm run build` passa.** **Critério de aceite das próximas lanes: `tsc` continua em 0 — qualquer erro novo é regressão.**

---

## 9. Como re-verificar (para o próximo agente)

**Banco** (MCP Supabase, projeto oficial `krrkfgv...`):

```sql
-- catálogo
select codigo, nome, categoria, preco_mensal, status from unq_modulos_sistema order by categoria, nome;

-- ativação por empresa (join para ver o nome do módulo)
select e.nome_fantasia, m.codigo, m.nome, em.status, em.data_contratacao
from unq_empresa_modulos em
join me_empresa e on e.id = em.empresa_id
join unq_modulos_sistema m on m.id = em.modulo_id
order by e.nome_fantasia, m.nome;

-- confirmar que as tabelas antigas continuam vazias
select (select count(*) from me_modulo_ativo) as me_modulo_ativo,
       (select count(*) from me_modulo_cargo) as me_modulo_cargo;

-- a Doceê tem módulos?
select count(*) from unq_empresa_modulos where empresa_id = '52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f';
```

**Código:**

```bash
# o app NÃO deve referenciar as tabelas de módulo (esperado: 0 resultados)
rg "unq_empresa_modulos|unq_modulos_sistema|me_modulo_ativo|me_modulo_cargo" src/

# de onde vem o estado dos módulos
rg "uniq-modulos-ativos|MODULOS_ATIVOS_INICIAIS" src/

# quem filtra o menu
rg "CORE_MODULES|visibleRailItems|RAIL_ITEMS" src/app/components/layout/AppLayout.tsx

# quem chama o contexto
rg "useModulosAtivos|useModulosContext" src/
```

**Arquivos-chave (todos os caminhos relativos a `src/app/`):**

| Arquivo | Papel |
|---|---|
| `lib/modulos.ts` | Catálogo hardcoded (17) + `MODULOS_STORAGE_KEY` + `MODULOS_ATIVOS_INICIAIS` |
| `lib/moduloRoutes.ts` | Mapa `codigo` → rota |
| `contexts/ModulosContext.tsx` | Estado (localStorage) — **o ponto de troca para o banco, na Opção B** |
| `hooks/useModulosAtivos.ts` | Re-export do contexto |
| `components/layout/AppLayout.tsx` | `RAIL_ITEMS`, `CORE_MODULES`, `visibleRailItems`, rodapé hardcoded |
| `components/modulos/MeusModulosPage.tsx` | Tela `/meus-modulos` (3 abas, trial, cancelar) |
| `components/modulos/EscolhaPlanoPage.tsx` | `/onboarding/plano` |
| `components/employees/ModuleCheckbox.tsx` | **3º vocabulário** de módulo (colaboradores) — desconectado |

---

## 10. ✅ ENTREGAS (22/09/2026)

Duas entregas fechadas neste dia — pipeline SDD completo, deploy verificado.

### 10.1 Loja/Vitrine — entregue e **VALIDADA** pelo fundador

| | |
|---|---|
| Docs | `PRD-LojaVirtual-CompletarModulo.md` · `SPEC-…` · `WIRE-…` |
| Commits | `29885d2` (feature) · `3e2b0b0` · `6b80da9` (correções pós-validação) |
| Validação | *"Loja validada. Ficou ótimo."* |

Entregou o **editor de aparência** (a lacuna real — trocar banner exigia SQL manual), `exibir_vitrine` ponta a ponta, "Preço promocional" → `preco_varejo`, `unidade` persistida, a rota do módulo corrigida e o `ProdutoFormModal` movido para `components/produto/`.

**Três furos corrigidos pós-deploy** — todos só apareceram na validação real:

1. `loja_virtual` estava `nao_adquirido` → o módulo nasceria **invisível no rail**.
2. O **`localStorage` vence o catálogo** → exigiu a migração `uniq-loja-virtual-ativa-v1`.
3. O **`SUBNAV_SECTIONS` não foi trocado** → o rail dizia "Loja Virtual" mas o submenu ao lado levava ao Marketplace antigo.

> **Regra para o próximo agente:** um módulo novo no rail precisa de **três** amarrações — `RAIL_ITEMS`, **`SUBNAV_SECTIONS`** (seção com o mesmo `railId`) e `moduloRoutes`. Faltar uma faz o módulo parecer quebrado.

### 10.2 Menu Enxuto (Opção A) — entregue e **verificado no ar**

| | |
|---|---|
| Docs | `PRD-MenuEnxuto.md` · `SPEC-MenuEnxuto.md` · `WIRE-MenuEnxuto.md` |
| Commit | `1f4ccf3` |
| Verificação | `tsc` = **0** · build OK · **chunks de produção inspecionados** |

**Rail: 12 → 7 entradas** (5 visíveis + 2 no rodapé):

```
Minha Empresa · Financeiro · Chatbot · Loja Virtual · MEL
──── rodapé (intacto) ────
Meus Módulos · Configurações · Sair
```

Saíram: Dashboard (vira sub-item de Minha Empresa), Agenda, Vendas & PDV, CRM, Métricas.

**Subnav filtrada por status** (`SubNavItem.moduloCodigo` + helper aplicado **nos dois** renders). Serviços, Fornecedores e Colaboradores somem (`nao_adquirido`) — antes a subnav vazava módulo desligado.

**`/meus-modulos` somente leitura: 884 → 521 linhas.** Saíram a loja de módulos, o trial, o cancelar, o comparador, o card de plano, o header de fatura, a barra de abas e os filtros de status. Entrou uma seção **"Em breve"** inerte.

**Terceiro dado de plano falso removido:** *"Status do Plano · UNIQ Pro Enterprise · 75% da cota usada"*, em **dois** lugares do `AppLayout`. Com o `ASSINATURA_MOCK` (Business R$ 149) e o `PLANOS_COMPARATIVO`, é a **3ª instância do mesmo defeito**.

> 📌 **Se aparecer um 4º, vale uma varredura global** por dado de pricing inventado no front.

### 10.3 🟡 Decisões tomadas por autonomia (fundador ausente) — **REVISAR**

O fundador autorizou seguir sozinho (*"pode seguir com o que achar melhor até entregar o menu mais enxuto"*) e saiu para dirigir. **Estas são minhas, não dele:**

| # | Decisão | Racional |
|---|---|---|
| **D1** | **Loja Virtual PERMANECE no rail** (5 itens, não 4) | Desvio explícito da lista literal. Ela foi decidida **antes** de o módulo existir — quando ainda apontava para o marketplace aposentado. Hoje é o canal de venda da Doceê e foi **validada** no mesmo dia. Tirá-la tornaria **inalcançável** o que ele acabou de aprovar. **Se discordar, é uma linha.** |
| **D2** | Rotas órfãs continuam acessíveis, **sem guarda** | Guarda é Opção B; seria **segurança de fachada** sobre estado que vive no `localStorage`. |
| **D3** | Rail curado **removendo entradas de `RAIL_ITEMS`**, não mudando status no catálogo | Evita uma migração de `localStorage` **por módulo**. Por isso **nenhuma migração nova** nesta entrega. |
| **D4** | `SubNavItem.moduloCodigo` + filtro nos **dois** renders | Sem isso a subnav continua vazando módulo desligado. |
| **D5** | Fallback do `activeRailId`: `"dashboard"` → `"minha-empresa"` | Não existe seção de subnav com `railId: "dashboard"` — o fallback antigo já caía em `SUBNAV_SECTIONS[0]`. |
| **D6** | O enxuto é **global**, não por tenant | Limitação conhecida da Opção A. **Afeta também a Gráfica HQ.** Resolvido pela Opção B. |
| **D7** | `EscolhaPlanoPage` fica órfã, **não removida** | Já era órfã antes (nenhum `navigate()` apontava para ela). Remover é limpeza, não escopo. |
| **D8** | Mantido o `ModalDetalhesModulo`, sem o botão "Adquirir" | Dá profundidade útil sem devolver a loja de módulos. |

### 10.4 ⚠️ Sinalizado para o fundador decidir (não decidi)

**Preço do módulo no modal de detalhes** — a linha *"Preço: R$ 79/mês"*.

**Mantive**, porque a distinção importa: **não é plano inventado** (como "UNIQ Pro Enterprise"), é **campo de catálogo** — e não existe decisão fechada sobre preço de módulo.

Mas os dois lados **divergem**: o app diz **R$ 79**; o banco (`unq_modulos_sistema.preco_mensal`) diz **0.00** para a maioria e **49.90 / 99.90** para dois. **Nenhum dos dois é autoritativo.**

**Decisão do fundador:** mostrar, corrigir ou remover?

### 10.5 O que sobrou da fila

**Opção B** — ligar o app em `unq_empresa_modulos` + **guarda de rota** + unificação dos **3 vocabulários** de módulo (app 17 · banco 11 · `ModuleCheckbox` 7) + **seed da Doceê**.

É o que resolve o **D6** (enxuto por tenant em vez de global) e o **A2** (módulo desativado entra pela URL).

---

*Análise produzida em 21/09/2026. Decisões do fundador em 22/09/2026 (§7). **Entregas da Loja/Vitrine e do Menu Enxuto em 22/09/2026 (§10)** — código alterado e deployado, ao contrário do que dizia a nota anterior. Achados A11 e A12 acrescentados em 22/09/2026.*
