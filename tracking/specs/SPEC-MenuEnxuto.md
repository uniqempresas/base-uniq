# SPEC — Menu Enxuto (Opção A)

> **PRD:** `tracking/plans/PRD-MenuEnxuto.md`
> **WIRE:** `tracking/wireframe/WIRE-MenuEnxuto.md`
> **Status:** 🔶 Rascunho técnico — aguarda WIRE aprovado para implementar
> **Regra de ouro:** sem WIRE aprovado, não se escreve código de tela.
> **Base:** recon de 22/09/2026 (todas as referências `arquivo:linha` verificadas)
> **Gate:** `npx tsc --noEmit` = **0 erros** hoje. Deve continuar **0**. `npm run build` deve passar.

---

## 1. Arquivos

### Alterados

| Arquivo | Mudança |
|---|---|
| `src/app/components/layout/AppLayout.tsx` | `RAIL_ITEMS` curado · `CORE_MODULES` simplificado · seções de `SUBNAV_SECTIONS` removidas · `SubNavItem.moduloCodigo` + filtro · fallback do `activeRailId` · `moduloCodigo` nos itens de Minha Empresa |
| `src/app/components/modulos/MeusModulosPage.tsx` | Somente leitura (884 → ~430-480 linhas) |
| `src/app/lib/modulos.ts` | **Nenhuma mudança de status** (ver §5). Só se algum rótulo precisar ajuste. |

### Intocados

`routes.tsx` · `lib/moduloRoutes.ts` · `ModulosContext.tsx` · a vitrine pública · `LojaVirtualHubPage`/`AparenciaPage`/`ProdutosLojaPage` · `ProdutoFormModal` · `EscolhaPlanoPage` (fica órfã, **não remover** — D7).

> **Não mexer no rodapé hardcoded** (`AppLayout.tsx:409-464` desktop, `:759-794` mobile) — decisão F6.

---

## 2. `AppLayout.tsx` — as três amarrações

> ⚠️ Um módulo no rail depende de **três** lugares: `RAIL_ITEMS`, `SUBNAV_SECTIONS` (casado por `railId`) e `moduloRoutes`. Faltar um já causou bug (`SPEC-LojaVirtual-CompletarModulo.md` §1). Aqui só os **dois primeiros** mudam — `moduloRoutes` fica intacto (as rotas seguem vivas, D2).

### 2.1 `RAIL_ITEMS` (`:65-78`)

**Remover 5 entradas:** `dashboard` (`:66`), `vendas` (`:68`), `crm` (`:69`), `agenda` (`:72`), `metricas` (`:73`).

**Resultado — 7 entradas, nesta ordem:**

| # | id | label | path | moduloCodigo |
|---|---|---|---|---|
| 1 | `minha-empresa` | Minha Empresa | `/configuracoes/empresa` | `minha_empresa` |
| 2 | `financeiro` | Financeiro | `/financeiro` | `financeiro` |
| 3 | `chatbot` | Chatbot | `/chatbot` | `chatbot` |
| 4 | `loja` | Loja Virtual | `/loja-virtual` | `loja_virtual` |
| 5 | `mel` | MEL | `/mel` | `mel` |
| 6 | `modulos` | Módulos | `/meus-modulos` | `meus-modulos` |
| 7 | `configuracoes` | Configurações | `/configuracoes/empresa` | `configuracoes` |

> ⚠️ **`minha-empresa` DEVE vir antes de `configuracoes`.** Os dois têm o mesmo `path`, e o `activeRailId` (`:243-254`) resolve por match de prefixo com **sort estável** — a ordem define qual subnav aparece na página Empresa. Hoje resolve "minha-empresa"; **preservar**.
>
> Os itens 6 e 7 continuam existindo em `RAIL_ITEMS` mesmo sendo filtrados do rail principal (`:379-380`) — eles são necessários para o `activeRailId` resolver `/meus-modulos` e `/configuracoes/*`.

### 2.2 `CORE_MODULES` (`:219`)

De `Set(["dashboard", "configuracoes", "meus-modulos", "minha_empresa", "mel"])`
para **`Set(["minha_empresa", "mel", "modulos", "configuracoes"])`**.

- Sai `dashboard` — não é mais item de rail.
- Entra `modulos` — é o id do catálogo para "Meus Módulos" (o rail item usa `moduloCodigo: "meus-modulos"`, então **manter os dois**).
- `minha_empresa` e `mel` ficam por decisão (F4: MEL nunca desligável).

> **Nota:** com o rail curado, todos os itens restantes já passam pelo status (`core`/`ativo`). O `CORE_MODULES` vira **rede de segurança** — não a alavanca. A alavanca é a curadoria do `RAIL_ITEMS` (D3).

### 2.3 `SUBNAV_SECTIONS` (`:80-217`)

**Remover as seções** cujos railIds deixaram de existir: `vendas` (`:106-114`), `crm` (`:116-124`), `agenda` (`:149-157`), `metricas` (`:159-169`).

**Manter:** `minha-empresa` (`:82-104`), `financeiro` (`:126-136`), `loja` (`:138-147`), `mel` (`:171-186`), `chatbot` (`:188-198`), `modulos` (`:200-206`), `configuracoes` (`:208-216`).

> Seções mantidas sem rail correspondente ficariam **inalcançáveis** (subnav fantasma). Como os railIds somem, as seções somem junto.

### 2.4 `activeRailId` — fallback (`:253`)

De `return "dashboard";` para **`return "minha-empresa";`**.

Motivo: **não existe** seção `SUBNAV_SECTIONS` com `railId: "dashboard"` — o fallback atual já cai em `SUBNAV_SECTIONS[0]` (que é `minha-empresa`). Com o item `dashboard` removido do rail, manter `"dashboard"` no código seria mentir. Minha Empresa passa a ser a "casa" do app.

---

## 3. Subnav filtrada (F7)

### 3.1 Tipo

Em `SubNavItem` (`:49-55`), adicionar:

```ts
moduloCodigo?: string;
```

**Opcional de propósito:** item sem `moduloCodigo` **nunca** é filtrado.

### 3.2 Filtro

Criar um helper dentro de `AppLayout` que:
1. Resolve o status do módulo **pela mesma fonte que `visibleRailItems` usa** (`:260-266` — o contexto `useModulosAtivos`, não um valor novo);
2. **Passa** se: `!item.moduloCodigo` **ou** `CORE_MODULES.has(item.moduloCodigo)` **ou** status ∈ `{core, ativo, trial}`;
3. **Recursa em `children`** (o grupo "Cadastros" tem filhos);
4. É aplicado nos **dois** renders:
   - **desktop:** `activeSubnav.items.map` (`:486`)
   - **mobile:** `subnav.items.map` (`:670`, via `getSubnavForModule` `:332-334`)

> ⚠️ **Os dois renders são duplicados** (`:486` e `:670`). Mudar só o desktop diverge o drawer — foi assim que nasceu o bug "Visão Geral 2×" de 11/09 (`USO_REAL_DOCEE.md` item 10). Aplicar o filtro **nos dois**, de preferência pelo mesmo helper.

### 3.3 Onde marcar `moduloCodigo`

**Só na seção `minha-empresa`** (`:82-104`) — é a única que agrega links de outros módulos. As demais seções são internas ao seu próprio módulo (já gateado pelo rail item) e ficam **sem** marcação.

| Item (`minha-empresa`) | Linha | `moduloCodigo` | Status no catálogo | Aparece? |
|---|---|---|---|---|
| Visão Geral | `:86` | `dashboard` | `core` | ✅ |
| Pedidos | `:90` | `vendas` | `ativo` | ✅ |
| Cadastros ▸ Produtos | `:96` | `estoque` | `trial` | ✅ |
| Cadastros ▸ Serviços | `:97` | `servicos` | `nao_adquirido` | ❌ **some** |
| Cadastros ▸ Clientes | `:98` | `crm` | `ativo` | ✅ |
| Cadastros ▸ Fornecedores | `:99` | `fornecedores` | `nao_adquirido` | ❌ **some** |
| Cadastros ▸ Colaboradores | `:100` | `colaboradores` | `nao_adquirido` | ❌ **some** |

> 🟡 **Serviços, Fornecedores e Colaboradores vão sumir** da subnav — são `nao_adquirido`. É o objetivo do F7 (a subnav não deve vazar link de módulo desligado). **Se o fundador quiser mantê-los, é só não marcar `moduloCodigo` neles.**

> ⚠️ Se o grupo **"Cadastros"** ficar **sem nenhum filho** após o filtro, o cabeçalho do grupo também deve sumir (não deixar um accordion vazio).

---

## 4. `MeusModulosPage` somente leitura (F5)

### 4.1 Remover

| O quê | Linhas |
|---|---|
| Aba "Loja de Módulos" | `:739-816` |
| Aba "Meu Plano" | `:819-857` |
| `ModalAdquirirModulo` (trial de 14 dias) | `:327-386` |
| `ModalCancelarModulo` | `:388-447` |
| `ComparadorPlanos` | `:531-584` |
| `PLANOS_COMPARATIVO` | `:87-115` |
| `ASSINATURA_MOCK` (**Business R$ 149**) | `:82-85` |
| `calcularFatura` | `:118-123` |
| `formatarDataFutura` | `:129-133` |
| `EmptyStateLojaCompleta` | `:293-308` |
| Filtros todos/ativos/trial/cancelados | `:700-712` |
| CTAs "Explorar loja" / "Adquirir" / "Cancelar" | `:286-288`, `:206-212`, `:235-240`, `:244-252`, `:266-268` |
| Botão "Adquirir módulo" no detalhe | `:520-521` |
| **Barra de abas** | `:689-693` — com uma aba só, a barra perde sentido |

### 4.2 Manter

- Lista dos módulos com status (`StatusBadge`, `ModuloCard` **sem** ações de loja/cancelar).
- `ModalDetalhesModulo` (`:449`), **sem** o botão Adquirir.
- `EmptyStateBusca` (`:310`).
- `ModuloIcone` (`:141`).

### 4.3 Adicionar — seção "Em breve"

Uma seção discreta, **somente leitura, sem nenhuma ação**, listando os módulos `nao_adquirido`. É o que dá sentido a `CONTEXTO_PROJETO.md:342` (*"Acompanha o que está ativo e o que será ativado"*).

> 🟡 Se o fundador preferir, essa seção sai — mas então a frase do próprio contexto perde lastro.

### 4.4 Obrigatório junto

O destructure da linha `:590` é hoje:

```ts
const { modulos, setModulos, iniciarTrial, cancelarModulo } = useModulosAtivos();
```

`setModulos`, `iniciarTrial` e `cancelarModulo` **deixam de ser usados**. **Remover do destructure**, senão o `tsc` acusa variável não usada — e o gate é 0 erros.

> `ativarModulo` (`ModulosContext.tsx:84`) já é código morto (achado A10) e **não** é chamado por nenhuma tela. Fora de escopo mexer nele.

---

## 5. O que **NÃO** mudar (e por quê)

| Não mudar | Motivo |
|---|---|
| **Status no catálogo (`lib/modulos.ts`)** | D3: `RAIL_ITEMS` é a alavanca do rail. Mudar status exigiria migração de `localStorage` **por módulo** (o `localStorage` vence o catálogo — `ModulosContext.tsx:34-35`). Com D3, **nenhuma migração nova é necessária**. |
| **Rotas órfãs** | D2: continuam acessíveis por URL. Guarda é Opção B. |
| **Rodapé hardcoded** | F6: decisão do fundador. |
| **`moduloRoutes.ts`** | As rotas seguem vivas; o mapa continua correto. |
| **`EscolhaPlanoPage`** | D7: já era órfã antes; remover é limpeza, não escopo. |
| **Componentes não usados** (`MarketplacePage`, etc.) | Fora de escopo. Remover aumenta risco de regressão. |

---

## 6. Rotas que ficam órfãs (registro, não ação)

Continuam **funcionando por URL**, sem ponto de entrada no menu:

| Rotas | Por que perde a entrada |
|---|---|
| `/agenda/*` | rail "Agenda" removido (F3) |
| `/vendas/*` | rail "Vendas & PDV" removido — **exceto** `/vendas/pedidos`, que segue alcançável por Minha Empresa ▸ Pedidos |
| `/crm/*` | rail "CRM" removido — **exceto** `/crm/clientes`, por Cadastros ▸ Clientes |
| `/metricas/*` | rail "Métricas" removido (já era `nao_adquirido`) |
| `/estoque/*` | nunca teve rail; segue por Cadastros ▸ Produtos |
| `/servicos/*` · `/fornecedores/*` · `/configuracoes/colaboradores` | somem da subnav pelo filtro (F7) |

> **Nada é deletado.** O menu enxuga; as telas continuam existindo e funcionando (D2).

---

## 7. Ordem de implementação (lanes)

| Lane | Escopo | Depende de |
|---|---|---|
| **L1** | `AppLayout.tsx`: `RAIL_ITEMS` + `CORE_MODULES` + seções removidas + fallback | — |
| **L2** | `AppLayout.tsx`: `SubNavItem.moduloCodigo` + filtro (desktop **e** mobile) + marcação em Minha Empresa | L1 |
| **L3** | `MeusModulosPage.tsx` somente leitura | — |

L1 e L2 tocam o **mesmo arquivo** — **sequencial**. L3 é arquivo diferente e pode rodar **em paralelo** com L1/L2.

---

## 8. Checklist de verificação

- [ ] `RAIL_ITEMS` com 7 entradas, **`minha-empresa` antes de `configuracoes`**
- [ ] `CORE_MODULES` = `{minha_empresa, mel, modulos, configuracoes}`
- [ ] Seções `vendas`/`crm`/`agenda`/`metricas` removidas do `SUBNAV_SECTIONS`
- [ ] Fallback do `activeRailId` = `"minha-empresa"`
- [ ] `SubNavItem.moduloCodigo` existe; filtro aplicado **no desktop e no mobile** (mesmo helper)
- [ ] Filtro **recursa em `children`**; grupo "Cadastros" vazio some
- [ ] `moduloCodigo` marcado **só** na seção `minha-empresa`
- [ ] `MeusModulosPage`: **zero** ocorrência de `ASSINATURA_MOCK`, `PLANOS_COMPARATIVO`, `iniciarTrial`, `cancelarModulo`, `setModulos`, `ComparadorPlanos`, `ModalAdquirirModulo`, `ModalCancelarModulo`
- [ ] Barra de abas removida; seção "Em breve" presente e **sem ação**
- [ ] **Nenhuma** mudança de status em `lib/modulos.ts`
- [ ] **Nenhuma** mudança em `routes.tsx` / `moduloRoutes.ts` / `ModulosContext.tsx`
- [ ] Rodapé intacto nos **dois** layouts
- [ ] Navegador limpo → **5 itens** no rail
- [ ] Página Empresa → subnav mostra **"Minha Empresa"** (tie-break)
- [ ] Subnav **não lista** Serviços / Fornecedores / Colaboradores
- [ ] Mobile **e** desktop idênticos
- [ ] Rotas órfãs abrem por URL (testar `/agenda` e `/vendas/pdv`)
- [ ] Loja Virtual, Financeiro, Chatbot e MEL **sem regressão**
- [ ] `npx tsc --noEmit` = **0** · `npm run build` ✅ · Vercel `READY`
- [ ] `tracking/TRACKING.md` + `TRACKING_MODULOS.md` atualizados

---

## 9. Fora de escopo (registrado)

- **Guarda de módulo em rota** — Opção B.
- **Ligar em `unq_empresa_modulos`** — Opção B.
- **Unificar os 3 vocabulários de módulo** — backlog B10.
- **Remover `marketplace/` e suas rotas** — o módulo já não aponta para lá; a limpeza do código morto fica para depois.
- **`EscolhaPlanoPage` órfã** — D7.
- **Desligar o Estoque** (`TRACKING_MODULOS.md` §7 item 5) — a condição era "depois do Cardápio", e o Cardápio foi entregue. **Mas** isso mexe em quem é dono de produtos/categorias, e o próprio Loja Virtual aponta "Categorias" para `/estoque/configuracoes`. **Decisão separada, não executar aqui.**
