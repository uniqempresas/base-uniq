# WIRE — Menu Enxuto (rail curado · subnav filtrada · `/meus-modulos` somente leitura)

> **PRD:** `tracking/plans/PRD-MenuEnxuto.md`
> **SPEC:** `tracking/specs/SPEC-MenuEnxuto.md`
> **Data:** 22/09/2026
> **Status:** 🔶 Aguardando aprovação do fundador
> **Base:** recon de 22/09/2026 — `AppLayout.tsx` (861 linhas) e `MeusModulosPage.tsx` (884 linhas) **relidos em 22/09/2026** ao gerar este WIRE; os ponteiros `arquivo:linha` do SPEC foram conferidos no arquivo atual (as edições de 22/09 não deslocaram os pontos citados).
> **Regra do projeto (AGENTS.md):** no repositório entrega-se **wireframe — estrutura e função**. O design real (cores, sombras, tipografia fina, microinterações) é criado no **OpenDesign**, em conformidade com o `DESIGN.md` (verde menta `#86cb92`, grafite `#1f2937`, Poppins, radius 8px). Os tokens são **referenciados**, nunca projetados aqui.
> **Validação:** o fundador valida **pelo celular** — o drawer mobile e o rail desktop são layouts diferentes (SPEC §3.2 avisa que a lógica é duplicada) e precisam se comportar **idênticos**.

---

## 1. Inventário de blocos

| # | Tela · Bloco | Função | Origem do dado (fonte da verdade) | Condição / estado-chave |
|---|---|---|---|---|
| 1 | **Rail (desktop, escuro)** | Navegação principal curada — 5 itens | `RAIL_ITEMS` (7 entradas, **curado** — D3; `minha-empresa` antes de `configuracoes`) · `CORE_MODULES` (rede de segurança, `{minha_empresa, mel, modulos, configuracoes}`) · status do módulo no catálogo (`lib/modulos.ts`, **inalterado**) | renderiza itens com status ∈ {core, ativo, trial} **ou** `CORE_MODULES.has(moduloCodigo)`; desktop esconde `modulos` e `configuracoes` (vivem no rodapé) |
| 2 | **Rodapé do rail (desktop)** | Meus Módulos · Configurações · Sair | **hardcoded** em `AppLayout.tsx` (F6) | inalterado — decisão do fundador |
| 3 | **Rail (drawer mobile)** | Mesmo menu em accordion com subnav | **mesma fonte** do desktop (`visibleRailItems`, lógica duplicada — SPEC §3.2) | mesma condição de visibilidade; comportamento idêntico ao desktop |
| 4 | **Rodapé do drawer (mobile)** | Status do plano · Meus Módulos · Configurações · Sair | **hardcoded** em `AppLayout.tsx` (F6) | inalterado |
| 5 | **Subnav (painel claro desktop)** | Sub-itens do rail ativo | `SUBNAV_SECTIONS` (seções `vendas`/`crm`/`agenda`/`metricas` **removidas** — railIds que deixaram de existir) | renderiza `activeSubnav`; título/subtítulo da seção |
| 6 | **Subnav de Minha Empresa (filtrada)** | Itens honestos — não vaza módulo desligado | `SUBNAV_SECTIONS[railId=minha-empresa]` + `SubNavItem.moduloCodigo` (novo campo) + status no catálogo | passa se: sem `moduloCodigo` **ou** `CORE_MODULES.has` **ou** status ∈ {core, ativo, trial}; **recursão em `children`**; grupo "Cadastros" sem filhos **some junto** |
| 7 | **Subnav mobile (accordion do drawer)** | Mesmo filtro, segundo render | `subnav.items.map` via `getSubnavForModule` — mesmo helper do desktop | idêntico ao desktop (o bug "Visão Geral 2×" nasceu de render duplicado) |
| 8 | **`/meus-modulos` · lista** | Os módulos do parceiro, com status ("Incluso" / "Ativo") | `useModulosAtivos().modulos` com status ≠ `nao_adquirido` (`StatusBadge` + `ModuloCard` **sem ações de loja/cancelar**) | card com toque → modal de detalhes; sem trial, sem cancelar, sem preço de loja |
| 9 | **`/meus-modulos` · "Em breve"** | O que será ativado — **só informa** | módulos do contexto com status `nao_adquirido` (catálogo) | **sem nenhuma ação**: sem botão, sem toque, sem preço |
| 10 | **`/meus-modulos` · modal de detalhes** | Profundidade útil ("o que este módulo faz") | `Modulo.funcionalidades` + status + datas | `ModalDetalhesModulo` **sem** o botão "Adquirir módulo" (D8) |
| 11 | **`/meus-modulos` · busca** | Achar módulo nas duas seções | filtro client-side por nome/descrição | sem resultado → `EmptyStateBusca` |
| 12 | **Estados da página** | skeleton · vazio · erro+retry · sucesso | regra do projeto (AGENTS.md) | fonte atual é `localStorage` **síncrona** (sem erro real hoje); erro+retry desenhado para quando a fonte virar async (Opção B) |

---

## 2. Mapa de navegação

```
Rail DEPOIS (desktop e mobile — iguais):
minha-empresa → /configuracoes/empresa   (casa; subnav: Visão Geral · Pedidos · Cadastros)
financeiro    → /financeiro
chatbot       → /chatbot
loja          → /loja-virtual            (D1 — Loja Virtual permanece)
mel           → /mel                     (F4 — core, nunca desligável)

Rodapé (hardcoded, F6):
Meus Módulos  → /meus-modulos            (somente leitura — sem loja/trial/cancelar)
Configurações → /configuracoes/empresa

Rotas órfãs — NADA é deletado (D2):
/agenda/*            → vive por URL (rail Agenda removido — F3)
/vendas/*            → vive por URL; /vendas/pedidos segue em Minha Empresa ▸ Pedidos
/crm/*               → vive por URL; /crm/clientes segue em Cadastros ▸ Clientes
/metricas/*          → vive por URL (já era nao_adquirido)
/estoque/*           → nunca teve rail; segue por Cadastros ▸ Produtos
/servicos/* · /fornecedores/* · /configuracoes/colaboradores → somem da subnav (F7), rotas vivas
```

**Fallback do `activeRailId`:** `"dashboard"` → `"minha-empresa"` (SPEC §2.4) — Minha Empresa passa a ser a "casa"; rota órfã cai na subnav de Minha Empresa (cosmético, aceito — D5).

---

## 3. Tela 1 — Rail enxuto: ANTES × DEPOIS

> Neste desenho: `◆` = item de navegação (ícone + rótulo quando expandido) · `▶` = item ativo. O rail tem dois estados de largura (expandido 200px / recolhido 72px — só ícones). A estrutura não muda entre os dois; o desenho mostra o expandido.

### 3.1 Desktop — ANTES (o que existe hoje: 9 itens + rodapé 2)

Ordenação real do `RAIL_ITEMS` atual (`:65-78`) após o filtro de status (Métricas, `nao_adquirido`, já some):

```
┌─────────────────────────────┐
│ (U) UNIQ  Sistema de Gestão │
├─────────────────────────────┤
│ ◆ Visão Geral   (Dashboard) │
│ ◆ Minha Empresa             │
│ ◆ Vendas & PDV              │
│ ◆ CRM                       │
│ ◆ Loja Virtual              │
│ ◆ Financeiro                │
│ ◆ Agenda                    │
│ ◆ MEL                       │
│ ◆ Chatbot                   │
│                             │
│ ─── rodapé (hardcoded) ───  │
│ ◆ Meus Módulos              │
│ ◆ Configurações             │
│ (A) Sair                    │
└─────────────────────────────┘
```

### 3.2 Desktop — DEPOIS (o alvo: 5 itens + rodapé 2)

```
┌─────────────────────────────┐
│ (U) UNIQ  Sistema de Gestão │
├─────────────────────────────┤
│ ▶ Minha Empresa        casa │
│ ◆ Financeiro                │
│ ◆ Chatbot                   │
│ ◆ Loja Virtual        (D1)  │
│ ◆ MEL                 (F4)  │
│                             │
│ ─── rodapé (inalterado) ─── │
│ ◆ Meus Módulos              │
│ ◆ Configurações             │
│ (A) Sair                    │
└─────────────────────────────┘
```

> O que aconteceu com os 9 de antes: 5 permanecem (Minha Empresa · Financeiro · Chatbot · Loja Virtual · MEL) e 4 **saem** — ver §3.5. Itens 6 e 7 do `RAIL_ITEMS` (Módulos, Configurações) continuam existindo na lista **para o `activeRailId` resolver** `/meus-modulos` e `/configuracoes/*`, mas não aparecem no rail principal (SPEC §2.1).

### 3.3 Mobile drawer — ANTES (mesmos 9, em accordion)

Drawer 320px · cabeçalho UNIQ · "Menu Principal" · itens com subnav viram accordion (▸):

```
┌──────────────────────────────────────┐
│ (U) UNIQ                    [✕]      │
│     Sistema de Gestão                │
├──────────────────────────────────────┤
│ MENU PRINCIPAL                       │
│ ◆ Visão Geral   (Dashboard)          │
│ ◆ Minha Empresa          ▸           │
│ ◆ Vendas & PDV           ▸           │
│ ◆ CRM                    ▸           │
│ ◆ Loja Virtual           ▸           │
│ ◆ Financeiro             ▸           │
│ ◆ Agenda                 ▸           │
│ ◆ MEL                    ▸           │
│ ◆ Chatbot                ▸           │
│                                      │
│ ─── rodapé (hardcoded) ───          │
│ ◆ Meus Módulos                      │
│ ◆ Configurações                     │
│ (A) Sair                            │
└──────────────────────────────────────┘
```

(accordion aberto de "Minha Empresa" → mesmo conteúdo da subnav — ver §4.3.)

### 3.4 Mobile drawer — DEPOIS (mesmos 5, em accordion)

```
┌──────────────────────────────────────┐
│ (U) UNIQ                    [✕]      │
│     Sistema de Gestão                │
├──────────────────────────────────────┤
│ MENU PRINCIPAL                       │
│ ▶ Minha Empresa            ▸         │
│ ◆ Financeiro               ▸         │
│ ◆ Chatbot                  ▸         │
│ ◆ Loja Virtual   (D1)      ▸         │
│ ◆ MEL            (F4)      ▸         │
│                                      │
│ ─── rodapé (inalterado) ───          │
│ ◆ Meus Módulos                      │
│ ◆ Configurações                     │
│ (A) Sair                            │
└──────────────────────────────────────┘
```

> Os 5 itens têm subnav própria no drawer — o accordion expande em vez de navegar (mesmo comportamento de hoje, com 5 entradas).

### 3.5 O que saiu do rail (explicito)

| Item removido | Motivo (PRD) | Destino / estado da rota |
|---|---|---|
| **Dashboard** (rótulo atual: "Visão Geral") | **F2** — sai do rail, vira sub-item de Minha Empresa | subnav Minha Empresa ▸ Visão Geral (`/dashboard`) · rota viva |
| **Vendas & PDV** | D3 (curadoria do rail) | rota `/vendas/*` viva (D2) · `/vendas/pedidos` segue em Minha Empresa ▸ Pedidos |
| **CRM** | D3 | rota `/crm/*` viva (D2) · `/crm/clientes` segue em Cadastros ▸ Clientes |
| **Agenda** | **F3** | rota `/agenda/*` viva (D2) |
| **Métricas** | já era `nao_adquirido` (some pelo status) | rota `/metricas/*` viva (D2) |

**Notas estruturais (SPEC §2.1):**
- **Ordem preservada:** `minha-empresa` **antes** de `configuracoes` no `RAIL_ITEMS` — mesmo path `/configuracoes/empresa`, o `activeRailId` resolve por sort estável. Reordenar troca silenciosamente qual subnav aparece na página Empresa (tie-break).
- **`CORE_MODULES` vira rede de segurança**, não alavanca: `{minha_empresa, mel, modulos, configuracoes}`. A alavanca é a curadoria do `RAIL_ITEMS` (D3).
- **Enxuto é GLOBAL, não por tenant** (D6) — limitação da Opção A; afeta também Gráfica HQ e UNIQ Empresas; resolvido pela Opção B.
- **Sem guarda de rota** (D2) — rotas órfãs seguem acessíveis por URL; guarda é território da Opção B.

---

## 4. Tela 2 — Subnav de Minha Empresa: ANTES × DEPOIS

> Painel claro do desktop (240px) · accordion dentro do drawer mobile. A subnav deriva de `SUBNAV_SECTIONS` casado por `railId`; "Minha Empresa" é a **única** seção que agrega links de outros módulos — por isso é a única que recebe `moduloCodigo` (SPEC §3.3).

### 4.1 Desktop — ANTES (sem filtro, vaza módulos desligados)

```
┌──────────────────────────────┐
│ Minha Empresa               │
│ Visão Geral                 │
├──────────────────────────────┤
│ ◆ Visão Geral               │
│ ◆ Pedidos                   │
│ ◆ Cadastros            ▾    │
│    ├ Produtos               │
│    ├ Serviços         (vaza)│
│    ├ Clientes               │
│    ├ Fornecedores     (vaza)│
│    └ Colaboradores    (vaza)│
└──────────────────────────────┘
```

### 4.2 Desktop — DEPOIS (filtrada pelo status do módulo)

```
┌──────────────────────────────┐
│ Minha Empresa               │
│ Visão Geral                 │
├──────────────────────────────┤
│ ◆ Visão Geral               │
│ ◆ Pedidos                   │
│ ◆ Cadastros            ▾    │
│    ├ Produtos               │
│    └ Clientes               │
└──────────────────────────────┘
```

> Serviços, Fornecedores e Colaboradores **somem** — são `nao_adquirido` (SPEC §3.3; 🟡 consequência com aval — se o fundador quiser mantê-los, é só não marcar `moduloCodigo`).

### 4.3 Mobile — ANTES (accordion do drawer, submenu de 1º nível)

```
│ ▶ Minha Empresa               ▾
│   ┌────────────────────────────┐
│   │ Visão Geral               │
│   │ Pedidos                   │
│   │ Cadastros            ▾    │
│   │   ├ Produtos              │
│   │   ├ Serviços      (vaza)  │
│   │   ├ Clientes              │
│   │   ├ Fornecedores  (vaza)  │
│   │   └ Colaboradores (vaza)  │
│   └────────────────────────────┘
```

### 4.4 Mobile — DEPOIS (mesmo filtro, mesmo helper)

```
│ ▶ Minha Empresa               ▾
│   ┌────────────────────────────┐
│   │ Visão Geral               │
│   │ Pedidos                   │
│   │ Cadastros            ▾    │
│   │   ├ Produtos              │
│   │   └ Clientes              │
│   └────────────────────────────┘
```

### 4.5 Caso "Cadastros sem filhos" — o grupo some (sem accordion vazio)

Se `estoque` e `crm` deixarem de ser adquiridos/trial (ex.: conta nova com menos módulos), o **cabeçalho do grupo some junto** — a recursão do filtro elimina o grupo vazio (SPEC §3.3):

```
┌──────────────────────────────┐
│ Minha Empresa               │
│ Visão Geral                 │
├──────────────────────────────┤
│ ◆ Visão Geral               │
│ ◆ Pedidos                   │
└──────────────────────────────┘
```

> Não existe estado em que "Cadastros" apareça aberto e vazio. Mobile segue o mesmo comportamento (a recursão roda no mesmo helper).

### 4.6 Mapeamento item → módulo (fonte: catálogo `lib/modulos.ts`, inalterado)

| Item (`minha-empresa`) | `moduloCodigo` | Status no catálogo | Aparece? |
|---|---|---|---|
| Visão Geral | `dashboard` | `core` | ✅ |
| Pedidos | `vendas` | `ativo` | ✅ |
| Cadastros ▸ Produtos | `estoque` | `trial` | ✅ |
| Cadastros ▸ Serviços | `servicos` | `nao_adquirido` | ❌ **some** |
| Cadastros ▸ Clientes | `crm` | `ativo` | ✅ |
| Cadastros ▸ Fornecedores | `fornecedores` | `nao_adquirido` | ❌ **some** |
| Cadastros ▸ Colaboradores | `colaboradores` | `nao_adquirido` | ❌ **some** |

**Regra do filtro (SPEC §3.2):** passa se `!item.moduloCodigo` **ou** `CORE_MODULES.has(item.moduloCodigo)` **ou** status ∈ {`core`, `ativo`, `trial`}. Item sem `moduloCodigo` nunca é filtrado — as outras seções (Financeiro, Loja, MEL, Chatbot…) ficam **sem** marcação.

---

## 5. Tela 3 — `/meus-modulos` somente leitura (F5)

### 5.1 ANTES — resumo do que existe hoje (884 linhas)

```
┌──────────────────────────────────────┐
│ Meus Módulos                         │
│ Você tem 7 módulos ativos            │
│ ┌──────────────────────────────────┐ │
│ │ Sua fatura atual   R$ 297/mês   │ │ ← ASSINATURA_MOCK (Business R$ 149 + add-ons)
│ │ [Ver faturas]                   │ │
│ └──────────────────────────────────┘ │
│ [ Meus Módulos | Loja de Módulos | Meu Plano ]   ← barra de abas
│                                        │
│ (Todos) (Ativos) (Em trial) (Cancelados)          ← filtros de status
│ ┌────────────────────────────────┐   │
│ │ (ic) CRM            [Ativo]    │   │
│ │      Gestão de clientes...     │   │
│ │      Renovação: 15/05/2026     │   │
│ │      [Usar módulo] [Cancelar]  │   │ ← cancelar
│ └────────────────────────────────┘   │
│ ┌────────────────────────────────┐   │
│ │ (ic) Métricas          R$49/mês│   │
│ │      Relatórios avançados...   │   │
│ │      [operacional] [14 dias grátis]│ ← trial
│ │      [Adquirir] [Saiba mais]   │   │ ← loja
│ └────────────────────────────────┘   │
│  ── aba│ Loja de Módulos ──           │
│  [Starter R$0][Business R$149][Pro R$299]  ← cards de plano
│  ── aba│ Meu Plano ──                 │
│  Plano Business · R$ 149/mês · [Fazer upgrade]
│  [Comparar planos] (tabela Starter/Business/Pro)
└──────────────────────────────────────┘
```

### 5.2 DEPOIS — mobile (coluna única, mobile-first)

```
┌──────────────────────────────────────┐
│ ←  Meus Módulos                      │
│     Acompanhe o que está ativo e o   │
│     que será ativado.                │
│                                      │
│  [ 🔍  Buscar módulo...            ] │
│                                      │
│  Seus módulos (12)                   │
│  ┌────────────────────────────────┐  │
│  │ (ic)  Minha Empresa [Incluso]  │  │
│  │       Gerencie dados e         │  │
│  │       identidade da sua        │  │
│  │       empresa.                 │  │
│  │                [ Usar módulo ] │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ (ic)  Loja Virtual   [Ativo]   │  │
│  │       Venda online com         │  │
│  │       catálogo próprio.        │  │
│  │       Renovação: 15/05/2026    │  │
│  │                [ Usar módulo ] │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ (ic)  Estoque        [Trial]   │  │
│  │       Controle de produtos     │  │
│  │       e inventário.            │  │
│  │       Fim do trial: 28/04/2026 │  │
│  │                [ Usar módulo ] │  │
│  └────────────────────────────────┘  │
│  (… 9 cartões no mesmo padrão)        │
│                                        │
│  Em breve (5)                          │
│  ℹ️ Módulos que a UNIQ ativa —         │
│  você não escolhe nem configura.       │
│  ┌────────────────────────────────┐  │
│  │ (ic)  Métricas                 │  │
│  │       Relatórios avançados...  │  │
│  └────────────────────────────────┘  │
│  (… 4 linhas no mesmo padrão —        │
│   nenhuma ação, nenhum preço)         │
└──────────────────────────────────────┘
```

**Comportamento:**
- **Card (Seus módulos):** toque no corpo do card → `ModalDetalhesModulo` (sem "Adquirir módulo"); botão "Usar módulo" navega para o módulo (mesmo `MODULO_ROUTES` de hoje). **Sem** action de loja, **sem** cancelar, **sem** preço no card.
- **"Em breve":** somente leitura — **sem** toque, botão, preço ou badge de trial. Todas são `nao_adquirido` no catálogo: Métricas · Marketplace · Fornecedores · Catálogo de Serviços · Colaboradores.
- **Busca:** filtra **as duas** seções (nome/descrição). Sem resultado → `EmptyStateBusca` no lugar das duas.
- **Rodapé do menu continua provendo a entrada** — a aba (com uma aba só) e o header de fatura **saem** (ver §5.5).

### 5.3 DEPOIS — desktop (≥ 1024px)

Mesma informação, grade 3 → 2 → 1 (regra do projeto):

```
┌──────────────────────────────────────────────────────────────┐
│ Meus Módulos                                                 │
│ Acompanhe o que está ativo e o que será ativado.             │
│                                                              │
│ [ 🔍  Buscar módulo...                                    ] │
│                                                              │
│ Seus módulos (12)                                            │
│ ┌───────────────┐ ┌───────────────┐ ┌────────────────────┐  │
│ │ (ic) Minha    │ │ (ic) Loja     │ │ (ic) Estoque       │  │
│ │ Empresa       │ │ Virtual       │ │        [Trial]     │  │
│ │ [Incluso]     │ │ [Ativo]       │ │ Controle de        │  │
│ │ Gerencie...   │ │ Venda online. │ │ produtos...        │  │
│ │ [Usar módulo] │ │ [Usar módulo] │ │ [Usar módulo]      │  │
│ └───────────────┘ └───────────────┘ └────────────────────┘  │
│ (3 colunas · 12 cartões · 1 a 3 colunas conforme a largura) │
│                                                              │
│ Em breve (5)                                                 │
│ ℹ️ Módulos que a UNIQ ativa — você não escolhe nem configura.│
│ ┌───────────────┐ ┌───────────────┐ ┌────────────────────┐  │
│ │ Métricas      │ │ Marketplace   │ │ Fornecedores       │  │
│ └───────────────┘ └───────────────┘ └────────────────────┘  │
│ (linhas compactas · nenhuma ação)                            │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Modal de detalhes — DEPOIS (sem "Adquirir módulo")

Mantém `ModalDetalhesModulo` com **apenas** o botão Adquirir removido (SPEC §4.1):

```
┌──────────────────────────────────────┐
│ (ic)  Loja Virtual                   │
│       Venda online com catálogo      │
│       próprio.                       │
│                                      │
│  Funcionalidades principais          │
│  ✔ Catálogo de produtos              │
│  ✔ Carrinho de compras               │
│  ✔ Checkout integrado                │
│  ──────────────────────────────────── │
│  Preço:  R$ 79/mês                   │
│  Status: [Ativo]                     │
│  Renovação: 15/05/2026               │
│                                      │
│        [ Fechar ]  [ Usar módulo ]   │
└──────────────────────────────────────┘
```

- Incluso (core): "Preço: Gratuito"; sem linha de Status (mesmo comportamento atual).
- O único botão removido é **"Adquirir módulo"** (`:520-521`).

### 5.5 O que saiu da tela (explicito)

| Saiu | Onde estava | Fonte no SPEC |
|---|---|---|
| **Barra de abas** (Meus Módulos / Loja de Módulos / Meu Plano) | `:689-693` | §4.1 — com uma aba só, a barra perde sentido |
| **Aba "Loja de Módulos"** (cards de plano + busca + grid) | `:739-816` | §4.1 |
| **Aba "Meu Plano"** (card do plano + comparador) | `:819-857` | §4.1 |
| **Trial de 14 dias** (`ModalAdquirirModulo`) | `:327-386` | §4.1 |
| **Cancelar módulo** (`ModalCancelarModulo`) | `:388-447` | §4.1 |
| **Comparador de planos** (`ComparadorPlanos` + `PLANOS_COMPARATIVO`) | `:531-584`, `:87-115` | §4.1 |
| **Card de plano** (Business + valor **R$ 149**) — `ASSINATURA_MOCK` | `:82-85` | §4.1 · critério de aceite "não exibe nenhum valor de plano" |
| **Header de fatura** ("Sua fatura atual R$ X/mês" + "Ver faturas") | `:676-685` | implícito — usa `ASSINATURA_MOCK` + `calcularFatura` (ambos removidos); é um "valor de plano" |
| **Filtros** Todos/Ativos/Em trial/Cancelados | `:700-712` | §4.1 |
| **CTAs** "Explorar loja" / "Adquirir" / "Cancelar"/"14 dias grátis"/preço no card | `:286-288`, `:206-212`, `:235-240`, `:244-252`, `:266-268` | §4.1 |
| **Botão "Adquirir módulo"** no detalhe | `:520-521` | §4.1 |
| `setModulos`, `iniciarTrial`, `cancelarModulo` (destructure) | `:590` | §4.4 — senão `tsc` acusa (gate = 0 erros) |

**Permanece:** lista com `StatusBadge` + `ModuloCard` (sem loja/cancelar) · `ModalDetalhesModulo` sem Adquirir · `EmptyStateBusca` · `ModuloIcone` · seção **"Em breve"** (nova, D8/§4.3).

### 5.6 Estados da tela

```
LOADING (skeleton)                     SUCCESS
┌──────────────────────────────────┐   (a tela §5.2/§5.3)
│ Seus módulos                     │
│ ┌────────────────────────────┐   │
│ │ ▒▒▒▒▒▒ [▒▒▒]              │   │
│ │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒      │   │
│ │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒      │   │
│ │            [▒▒▒▒▒▒▒]      │   │
│ └────────────────────────────┘   │
│ (6 skeletons de card no grid)    │
│ Em breve                         │
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                │
└──────────────────────────────────┘

BUSCA SEM RESULTADO                ERRO + RETRY
┌──────────────────────────────┐   ┌──────────────────────────────┐
│ 🔍 Nenhum módulo encontrado  │   │ ⚠ Não foi possível carregar  │
│ Tente ajustar seus filtros   │   │   os módulos.                │
│ ou termos de busca.          │   │   [ Tentar novamente ]       │
│          [ Limpar filtros ]  │   └──────────────────────────────┘
└──────────────────────────────┘   (regra do projeto; fonte atual é
                                    localStorage síncrono — ver §10 L2)
```

> **Nota de estrutura:** "Seus módulos" nunca fica vazio por construção (módulos `core` sempre presentes) — o vazio realista da página é a **busca sem resultado**. "Em breve" vazio (todos ativados) mostra uma linha neutra: *"Todos os módulos da UNIQ já estão ativos."* — sem botão; é o aproveitamento da copy do antigo `EmptyStateLojaCompleta`, sem a ação de loja.

---

## 6. Estados e mensagens (textos oficiais)

| Contexto | Texto |
|---|---|
| Página · subtítulo | "Acompanhe o que está ativo e o que será ativado." (frase de `CONTEXTO_PROJETO.md:342`, citada no PRD §5.3) |
| Em breve · ajuda | "ℹ️ Módulos que a UNIQ ativa — você não escolhe nem configura." (princípio de `CONTEXTO_PROJETO.md:344`) |
| Busca · placeholder | "Buscar módulo..." |
| Busca · sem resultado | "Nenhum módulo encontrado." / "Tente ajustar seus filtros ou termos de busca." + [Limpar filtros] (`EmptyStateBusca` — SPEC mantém a `:310`) |
| Em breve · vazio | "Todos os módulos da UNIQ já estão ativos." (sem ação) |
| Erro | "Não foi possível carregar os módulos." + [Tentar novamente] |
| Modal · Preço (Incluso) | "Gratuito" |
| Modal · Preço (ativo/trial) | "R$ X/mês" |
| Modal · Status | badge [Incluso] / [Ativo] / [Trial] / [Cancelado] (`StatusBadge` intacto) |

> Nenhum texto de **sucesso** de escrita: a tela é somente leitura — não há salvar, adquirir nem cancelar. O estado "sucesso" é a própria renderização da lista.

---

## 7. Responsividade

| Faixa | Rail | Subnav | `/meus-modulos` |
|---|---|---|---|
| **< 1024 (mobile)** | drawer 320px com accordion | submenu aninhado no accordion (mesmo filtro do desktop) | coluna única: header → busca → Seus módulos (1 coluna) → Em breve |
| **≥ 1024 (desktop)** | rail escuro 200px/72px + painel claro 240px | painel claro sempre visível | grid 3 colunas (Seus módulos); Em breve em linhas compactas · 2 colunas em 640–1023 |

**Decisões de estrutura:**
- O filtro da subnav roda **uma única vez** (mesmo helper) e alimenta os dois renders — a regressão "Visão Geral 2×" de 11/09 nasceu da duplicação sem helper (SPEC §3.2).
- Alvos de toque ≥ 44px nos cartões e no accordion (padrão atual).
- Drawer e rail mostram **exatamente os mesmos 5 itens** — o fundador valida os dois no celular.

---

## 8. Acessibilidade

- Cartões "Seus módulos" são botões/link com `aria-label` informando o módulo; "Usar módulo" com label explícito.
- Grupos de subnav filtrados: o grupo "Cadastros" removido por filtro não deixa foco órfão (o cabeçalho some junto).
- Busca com `aria-label="Buscar módulo"`; busca sem resultado com `role="status"`.
- Modal: foco retorna ao card que o abriu ao fechar; `aria-describedby` ligando título à descrição.
- Nenhuma informação só por cor: status sempre tem texto (Incluso/Ativo/Trial/Cancelado).

---

## 9. Checklist do WIRE

| # | Requisito (SPEC) | Coberto em | Status |
|---|---|---|---|
| 1 | Rail final: **5 itens** (Minha Empresa · Financeiro · Chatbot · Loja Virtual · MEL) + rodapé 2 inalterado | §3.2, §3.4, §3.5 | ✅ |
| 2 | Dashboard **fora** do rail, alcançável por Minha Empresa ▸ Visão Geral | §3.5, §4.2 | ✅ |
| 3 | Agenda, Vendas, CRM, Métricas fora do rail; rotas vivas (D2) | §3.5 | ✅ |
| 4 | `minha-empresa` antes de `configuracoes` no `RAIL_ITEMS` (tie-break preservado) | §3.5 | ✅ |
| 5 | `CORE_MODULES` = `{minha_empresa, mel, modulos, configuracoes}` (rede de segurança) | §3.5 | ✅ |
| 6 | Fallback do `activeRailId` = `"minha-empresa"` | §2 | ✅ |
| 7 | Subnav filtrada por `moduloCodigo`; Serviços/Fornecedores/Colaboradores somem | §4.2, §4.4, §4.6 | ✅ |
| 8 | Filtro recursa em `children`; "Cadastros" vazio some junto | §4.5 | ✅ |
| 9 | Filtro aplicado no desktop **e** no mobile (mesmo helper) | §4.2–§4.4 | ✅ |
| 10 | `moduloCodigo` marcado **só** na seção `minha-empresa` | §4.6 | ✅ |
| 11 | `/meus-modulos` sem loja, trial, cancelar, comparador, abas, filtros, card de plano e **R$ 149** | §5.1, §5.5 | ✅ |
| 12 | Lista com status ("Incluso"/"Ativo") — card sem ação de loja/cancelar | §5.2, §5.3 | ✅ |
| 13 | Modal de detalhes sem "Adquirir módulo" | §5.4 | ✅ |
| 14 | Seção "Em breve" discreta e **sem ação** | §5.2, §5.3 | ✅ |
| 15 | Busca + busca sem resultado (`EmptyStateBusca`) | §5.2, §5.6 | ✅ |
| 16 | Loading · vazio · erro+retry · sucesso (regra do projeto) | §5.6, §6 | ✅ |
| 17 | Mobile e desktop idênticos em comportamento | §3, §4, §7 | ✅ |
| 18 | Nenhuma mudança em `lib/modulos.ts` / rotas / `ModulosContext` (D3) | §1, §3.5 | ✅ |
| 19 | Sem inventar tela/componente fora do SPEC | §10 (lacunas registradas, não resolvidas em desenho) | ✅ |

---

## 10. Lacunas no SPEC (registro — não inventei nada além do contrato)

Itens que **não** estão explícitos no SPEC e merecem decisão — registrados, **não** desenhados como mudança:

| # | Lacuna | Contexto | Recomendação para o fundador |
|---|---|---|---|
| **L1** | **Linha "Trial: 14 dias grátis" do `ModalDetalhesModulo`** (`:497-502`) | Só renderiza para módulo `nao_adquirido` — mas a seção "Em breve" é **inerte** (sem toque), então a linha fica **morta**. O SPEC §4.1 remove o trial do fluxo, mas não remove essa linha do modal. | Remover a linha junto ao somente-leitura (coerência com a remoção do trial). |
| **L2** | **Estados erro/loading de `/meus-modulos`** | A fonte atual é `localStorage` **síncrona** (`ModulosContext.carregarModulos` — try/catch devolve defaults; não há estado de erro). O WIRE desenhou skeleton + erro+retry por **regra do projeto**, mas hoje não há gatilho real para nenhum dos dois. | Aceitar como desenho preparado para a Opção B (fonte async `unq_empresa_modulos`), ou dispensar o estado de erro no protótipo. |
| **L3** | **Botão "Limpar filtros" do `EmptyStateBusca`** | Os filtros de status **saíram**; sobra só a busca. "Limpar filtros" vira texto impreciso. O SPEC mantém o componente intacto. | Trocar a label para "Limpar busca" (mudança de copy apenas). |
| **L4** | **Card "Status do Plano" (UNIQ Pro Enterprise · 75% da cota)** | Existe **fora** do escopo do SPEC — rodapé do drawer mobile (`:761-768`) e rodapé do painel claro desktop (`:546-555`). É um plano mock, contradiz o pricing fechado e o somente-leitura. | Decisão separada (não faz parte deste menu enxuto). Sugiro tratar com o mesmo critério do `ASSINATURA_MOCK`. |
| **L5** | **Botão "Usar módulo" mantido no card** | O SPEC remove os CTAs de loja/cancelar, mas **não** o "Usar módulo" (navegação interna) — o card DEPOIS então tem CTA de navegação + toque no corpo abre o modal. Se o fundador quiser card 100% estático (só modal no toque), é uma linha. | Manter por ora; registrar o desejo de card estático como decisão à parte. |
| **L6** | **Busca filtra também "Em breve"** | O SPEC não define o escopo da busca. Desenhei filtrando as **duas** seções (faz sentido com o que sobrou — autorizado no briefing). | Validar: buscar "métricas" deve mostrar o módulo em "Em breve"? |
| **L7** | **Header de fatura removido por implicação** | "Sua fatura atual R$ X/mês" + "Ver faturas" (`:676-685`) não está na tabela do SPEC §4.1, mas depende de `ASSINATURA_MOCK` + `calcularFatura` (removidos) e viola o critério "não exibe valor de plano". | Confirmar a remoção como consequência lógica do SPEC. |
| **L8** | **Rotas órfãs continuam navegáveis da vitrine pública `/catalogo`** | O link `/agenda/novo?servicoId=` sai de um módulo que não está mais no menu (risco registrado no PRD §7). | Não quebra com o enxuto — registrar para a limpeza futura (Opção B). |

---

*Fim do WIRE — Menu Enxuto (22/09/2026). Aguarda aprovação do fundador para liberar as lanes L1, L2 e L3 do SPEC §7.*