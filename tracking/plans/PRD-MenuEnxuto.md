# PRD — Menu Enxuto (Opção A)

> **Sprint:** Módulos (2º item da fila — `TRACKING_MODULOS.md` §8)
> **Status:** 🔶 Rascunho — **decisões tomadas por autonomia**, sinalizadas para revisão do fundador
> **Pipeline:** Research ✅ (recon de 22/09/2026) → **PRD (este)** → SPEC → WIRE → Implementação
> **Origem:** `tracking/TRACKING_MODULOS.md` §7 (itens 1, 2, 3) e §8 (passo 3) — decisões do fundador de 22/09/2026.
> **Contexto:** o fundador saiu para dirigir e autorizou seguir por conta própria até entregar o menu enxuto. **As decisões marcadas 🟡 são minhas, não dele** — revisar.

---

## 1. WHY — por que isso importa

O fundador quer começar o teste com a usuária da Doceê com o **mínimo de módulos**. Hoje, um navegador limpo mostra **~9 itens no rail + 2 no rodapé** (`TRACKING_MODULOS.md` §4). O alvo é um rail curto, onde cada item é algo que ela realmente usa.

**O problema não é só o número — é que o menu mente.** Três defeitos verificados:

1. **A subnav não é filtrada.** Ela deriva só da rota (`AppLayout.tsx:256-258`) e renderiza `activeSubnav.items` sem checar status de módulo (`:486` desktop, `:670` mobile). Resultado: a subnav de "Minha Empresa" lista **Produtos, Serviços, Clientes, Fornecedores, Colaboradores** mesmo com esses módulos desligados.
2. **O Dashboard aparece duas vezes** — como item do rail (`:66`) **e** como sub-item de Minha Empresa (`:86`). O fundador já reclamou disso em 11/09 (`USO_REAL_DOCEE.md` item 10).
3. **`/meus-modulos` contradiz a decisão de produto.** O `CONTEXTO_PROJETO.md:344` diz *"Módulos ativados pela UNIQ — o parceiro não escolhe ou configura"*, mas a tela entrega **Loja de Módulos + trial de 14 dias + cancelar + comparador de planos** (`MeusModulosPage.tsx`, 884 linhas). E o `ASSINATURA_MOCK` (`:82-85`) mostra **Business R$ 149**, que contradiz o pricing fechado (R$ 297 → R$ 197).

---

## 2. Diagnóstico — o achado que muda o desenho

**Trocar só o `CORE_MODULES` NÃO entrega o menu enxuto.** O rail é montado assim (`AppLayout.tsx:260-266`):

```
passa se CORE_MODULES.has(moduloCodigo) OU status ∈ {core, ativo, trial}
some  se status ∈ {nao_adquirido, cancelado}
```

Com `CORE_MODULES` enxuto, o que sobra:

| RAIL item | status no catálogo | continua no rail? |
|---|---|---|
| dashboard | **core** | ✅ continua (indesejado) |
| minha-empresa | core | ✅ desejado |
| vendas | ativo | ✅ continua (indesejado) |
| crm | ativo | ✅ continua (indesejado) |
| loja | ativo | ✅ desejado |
| financeiro | ativo | ✅ desejado |
| agenda | **core** | ✅ continua (indesejado) |
| metricas | nao_adquirido | ❌ some (correto) |
| mel | core | ✅ desejado |
| chatbot | ativo | ✅ desejado |

**Rail final: 9 itens — não 4.** `dashboard` e `agenda` são `core` no catálogo (`modulos.ts:21`, `:29`); `vendas`, `crm`, `loja_virtual`, `financeiro` são `ativo`.

**Consequência:** o enxuto exige mexer **também** na composição do rail — não só no `CORE_MODULES`.

---

## 3. Objetivo

Entregar o rail mínimo com uma subnav honesta e a tela de módulos alinhada à decisão de produto:

1. **Rail curado** — só os módulos que a Doceê usa.
2. **Dashboard sai do rail** e fica só como sub-item de Minha Empresa (já existe em `:86`).
3. **Agenda sai** do rail.
4. **Subnav filtrada** por status de módulo — não vaza link de módulo desligado.
5. **`/meus-modulos` somente leitura** — "o que está ativo e o que será ativado".
6. **Rodapé permanece** (`Meus Módulos` · `Configurações`) — decisão do fundador.

### Não-objetivos

- **Não** implementar guarda de módulo em rota (é Opção B — ver D2).
- **Não** ligar o app em `unq_empresa_modulos` (Opção B, 3º da fila).
- **Não** mexer no rodapé hardcoded (decisão do fundador, `TRACKING_MODULOS.md` §7).
- **Não** unificar os 3 vocabulários de módulo (app 17 · banco 11 · `ModuleCheckbox` 7).
- **Não** remover rotas órfãs nem componentes não usados (fora de escopo, risco alto).
- **Não** tocar em `MeusModulosPage` além do necessário para o somente-leitura.

---

## 4. Decisões

### 4.1 Do fundador (22/09/2026) — não questionar

| # | Decisão |
|---|---|
| **F1** | Rail mínimo: Minha Empresa · Financeiro · Chatbot |
| **F2** | Dashboard sai do rail → sub-item de Minha Empresa |
| **F3** | Agenda sai do rail |
| **F4** | MEL continua `core` — nunca desligável |
| **F5** | `/meus-modulos` vira **somente leitura** (sem loja, trial, cancelar, comparador) |
| **F6** | Rodapé fica como está — `Meus Módulos` e `Configurações` são de todos |
| **F7** | Subnav precisa ser filtrada |

### 4.2 Minhas (🟡 autonomia — revisar)

| # | Decisão | Racional |
|---|---|---|
| **D1** 🟡 | **Loja Virtual PERMANECE no rail.** O rail final tem **5 itens**: Minha Empresa · Financeiro · Chatbot · **Loja Virtual** · MEL. | **Desvio explícito do F1.** A lista "Minha Empresa · Financeiro · Chatbot" foi decidida **antes** de a Loja Virtual existir — quando o módulo ainda apontava para o marketplace aposentado e era inútil. Agora ele é o **canal de venda da Doceê** e o fundador acabou de validá-lo (*"Loja validada. Ficou ótimo."*). Deixá-lo fora do rail tornaria **inalcançável** o que ele acabou de aprovar. **Se discordar, é uma linha.** |
| **D2** 🟡 | **Rotas órfãs continuam acessíveis — sem guarda de módulo.** | Guarda de rota é território da **Opção B** (`unq_empresa_modulos`), que é o 3º item da fila. Construir guarda agora, em cima de estado que vive no **`localStorage`**, seria **segurança de fachada**: o estado é por navegador, não por empresa. O objetivo aqui é menu enxuto, não permissão. |
| **D3** 🟡 | **O rail é curado removendo entradas de `RAIL_ITEMS`** — não mudando status no catálogo. | `RAIL_ITEMS` é a fonte real do rail. Mudar status no catálogo exigiria **uma migração de `localStorage` por módulo** (o `localStorage` vence o catálogo — `ModulosContext.tsx:34-35`), o que é frágil. E status de catálogo deve representar o **estado de negócio** do módulo, não o que aparece no rail — confundir os dois foi a causa do bug do `loja_virtual`. |
| **D4** 🟡 | **A subnav é filtrada por status, adicionando `moduloCodigo` ao `SubNavItem`.** | Hoje `SubNavItem` não tem código de módulo, então não há como filtrar. Sem isso, a subnav continua vazando Serviços/Fornecedores/Colaboradores (`nao_adquirido`). |
| **D5** 🟡 | **O fallback do `activeRailId` muda de `"dashboard"` para `"minha-empresa"`.** | Hoje o fallback é `"dashboard"` (`:253`), e **não existe** seção `SUBNAV_SECTIONS` com `railId: "dashboard"` — então o fallback já cai em `SUBNAV_SECTIONS[0]` = "minha-empresa". Ao remover o item `dashboard` do rail, deixar `"dashboard"` como fallback seria mentir no código. |
| **D6** 🟡 | **O rail enxuto é GLOBAL, não por tenant.** | É limitação conhecida da Opção A (o rail é código, não banco). Afeta também a Gráfica HQ e a UNIQ Empresas. **Resolvido pela Opção B** (3º da fila). Registrar, não esconder. |
| **D7** 🟡 | **`EscolhaPlanoPage` (`/onboarding/plano`) fica órfã e permanece no código.** | O recon confirma que ela **já é inalcançável hoje** (nenhum `navigate()` aponta para ela). Com o somente-leitura ela continua órfã. Removê-la é limpeza, não escopo do menu — fica registrada como backlog. |
| **D8** 🟡 | **A tela somente leitura mantém o `ModalDetalhesModulo`**, sem o botão "Adquirir módulo". | É o que dá profundidade útil ("o que este módulo faz") sem devolver a loja. |

---

## 5. Escopo estrutural

### 5.1 Rail final (5 itens visíveis + 2 no rodapé)

| Ordem | Item | Path | Observação |
|---|---|---|---|
| 1 | Minha Empresa | `/configuracoes/empresa` | passa a ser a "casa" — subnav com Visão Geral + Cadastros |
| 2 | Financeiro | `/financeiro` | |
| 3 | Chatbot | `/chatbot` | |
| 4 | Loja Virtual | `/loja-virtual` | **D1** |
| 5 | MEL | `/mel` | **F4** — core, sempre visível |
| — | Meus Módulos | `/meus-modulos` | rodapé hardcoded (**F6**) |
| — | Configurações | `/configuracoes/empresa` | rodapé hardcoded (**F6**) |

**Removidos do rail:** `dashboard` (**F2**), `vendas`, `crm`, `agenda` (**F3**), `metricas`.

> ⚠️ **Ordem preservada:** `minha-empresa` deve continuar **antes** de `configuracoes` no `RAIL_ITEMS` — os dois têm o mesmo path (`/configuracoes/empresa`) e o `activeRailId` depende do **sort estável** para resolver "minha-empresa" na página Empresa. Reordenar troca silenciosamente qual subnav aparece.

### 5.2 Subnav filtrada

Adicionar `moduloCodigo?: string` a `SubNavItem` e filtrar nos **dois** renders (desktop `:486` e mobile `:670` — o mobile duplica a lógica, `:617-618`/`:670`).

Mapeamento dos itens da subnav de **Minha Empresa**:

| Item | Path | `moduloCodigo` | Aparece? |
|---|---|---|---|
| Visão Geral | `/dashboard` | `dashboard` | ✅ (core) |
| Pedidos | `/vendas/pedidos` | `vendas` | ⚠️ depende do status de `vendas` |
| Cadastros ▸ Produtos | `/estoque/produtos` | `estoque` | ✅ (`trial`) |
| Cadastros ▸ Serviços | `/servicos` | `servicos` | ❌ (`nao_adquirido`) |
| Cadastros ▸ Clientes | `/crm/clientes` | `crm` | ✅ (`ativo`) |
| Cadastros ▸ Fornecedores | `/fornecedores` | `fornecedores` | ❌ (`nao_adquirido`) |
| Cadastros ▸ Colaboradores | `/configuracoes/colaboradores` | `colaboradores` | ❌ (`nao_adquirido`) |

> 🟡 **Consequência que precisa de aval:** com o filtro ligado, **Serviços, Fornecedores e Colaboradores somem** da subnav (são `nao_adquirido`). Se o fundador quiser mantê-los visíveis, é só marcar o item como `semFiltro`.

### 5.3 `/meus-modulos` somente leitura

**Remover:** a aba "Loja de Módulos" (`:739-816`), a aba "Meu Plano" (`:819-857`), `ModalAdquirirModulo` (`:327-386`, trial de 14 dias), `ModalCancelarModulo` (`:388-447`), `ComparadorPlanos` (`:531-584`), `PLANOS_COMPARATIVO` (`:87-115`), `ASSINATURA_MOCK` (`:82-85`), os filtros de trial/cancelado, os CTAs de "Explorar loja"/"Adquirir"/"Cancelar".

**Manter:** a lista dos módulos com status ("Incluso" / "Ativo"), o `ModalDetalhesModulo` **sem** o botão Adquirir (`:520-521`), e os empty states aplicáveis.

**Manter também** — por coerência com `CONTEXTO_PROJETO.md:342` (*"Acompanha o que está ativo e o que será ativado"*) — uma seção discreta de **"Em breve"** com os módulos `nao_adquirido`, **sem ação nenhuma**.

> 🟡 Se o fundador preferir, essa seção "Em breve" pode sair — mas ela é o que dá sentido à frase do próprio `CONTEXTO_PROJETO`.

**Estimativa:** de 884 linhas para ~430-480.

**Atenção obrigatória:** `setModulos`, `iniciarTrial` e `cancelarModulo` deixam de ser usados (`:590`) — **remover do destructure**, senão o `tsc` acusa. (`ativarModulo` já é código morto, A10.)

---

## 6. Critérios de aceite

- [ ] Navegador limpo mostra **5 itens** no rail: Minha Empresa · Financeiro · Chatbot · Loja Virtual · MEL.
- [ ] **Dashboard não aparece** como item do rail; segue alcançável por Minha Empresa ▸ Visão Geral.
- [ ] **Agenda, Vendas, CRM e Métricas não aparecem** no rail.
- [ ] Na página Empresa, a subnav mostra **Minha Empresa** (não "Configurações") — tie-break preservado.
- [ ] A subnav **não lista** Serviços, Fornecedores nem Colaboradores (módulos `nao_adquirido`).
- [ ] `/meus-modulos` **não tem** loja, trial, cancelar nem comparador de planos.
- [ ] `/meus-modulos` **não exibe** nenhum valor de plano (o `ASSINATURA_MOCK` Business R$ 149 sumiu).
- [ ] **Rodapé intacto:** Meus Módulos · Configurações.
- [ ] **Mobile e desktop** mostram o mesmo rail e a mesma subnav (a lógica é duplicada — testar os dois).
- [ ] Rotas órfãs (`/agenda`, `/vendas/*`, `/crm/*`, `/metricas/*`, `/estoque/*`) **continuam funcionando por URL** (D2).
- [ ] Loja Virtual, Financeiro, Chatbot e MEL **não regridem**.
- [ ] `npx tsc --noEmit` = **0 erros** · `npm run build` ✅ · deploy Vercel `READY` · validado no celular.
- [ ] `tracking/TRACKING.md` + `TRACKING_MODULOS.md` atualizados.

---

## 7. Riscos

| Risco | Mitigação |
|---|---|
| **Fallback da subnav** — rota órfã cai na subnav de "Minha Empresa" (cosmético) | Aceito e documentado (D5). O conteúdo da rota continua correto; só o cabeçalho da subnav fica genérico. |
| **Tie-break `minha-empresa` × `configuracoes`** — mesmo path, resolve por sort estável | Não reordenar esses dois no `RAIL_ITEMS`. Testar a página Empresa explicitamente. |
| **Mobile duplica a lógica do rail e da subnav** | Mudar **os dois** renders. O bug de 11/09 ("Visão Geral 2×") veio justamente dessa duplicação (`USO_REAL_DOCEE.md` item 10). |
| **Enxuto global afeta a Gráfica HQ** (D6) | Aceito — é limitação da Opção A. Resolvido pela Opção B. |
| **`localStorage` de quem já usa o app** | **Não** mexemos em status de catálogo (D3), então **não precisa de migração nova**. Se algo exigir, seguir o padrão `uniq-<coisa>-v1` (`ModulosContext.tsx:56-61`). |
| **Remover `iniciarTrial`/`cancelarModulo` do destructure** | Obrigatório junto com o somente-leitura, senão `tsc` acusa variável não usada. |
| **Rota pública `/catalogo` navega para `/agenda/novo?servicoId=`** | Continua funcionando (rota viva). Não quebra com o enxuto, mas o link sai de um módulo que não está mais no menu — registrar. |

---

## 8. Documentos irmãos

- **SPEC:** `tracking/specs/SPEC-MenuEnxuto.md`
- **WIRE:** `tracking/wireframe/WIRE-MenuEnxuto.md`
- **Diagnóstico de módulos:** `tracking/TRACKING_MODULOS.md` §2.3, §4, §7, §7.1, §8
- **Recon:** levantamento de 22/09/2026 (este PRD §2)
- **Antecessor:** `PRD-LojaVirtual-CompletarModulo.md` (entregue e validado)
