# 🧩 TRACKING — Módulos da Base UNIQ (análise + decisões)

> **Para o agente que pegar isto sem contexto:** leia este arquivo inteiro antes de tocar em qualquer coisa relacionada a módulos, catálogo de módulos, menu lateral (rail), `/meus-modulos`, planos ou permissões por colaborador. Ele descreve **como o sistema de módulos funciona hoje**, **por que ele não é o que parece**, e **quais decisões estão pendentes**.
>
> **Documento pai:** `tracking/TRACKING.md` · **Contexto de negócio:** `tracking/CONTEXTO_PROJETO.md` (§ "Arquitetura de Módulos: default + vertical" e § "Módulos (ativados pela UNIQ, não escolhidos pelo cliente)")
>
> **Status:** 📖 ANÁLISE CONCLUÍDA (21/09/2026) — **nada foi alterado**. Aguarda decisão do fundador.
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

## 6. Caminhos possíveis (decisão pendente do fundador)

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

**Recomendação registrada:** **A agora** (destrava o teste com a Doceê sem risco) e **especificar B + C na sequência**.

---

## 7. Perguntas abertas para o fundador

1. O menu mínimo é **exatamente** Minha Empresa · Financeiro · Chatbot? E o **Dashboard ("Visão Geral")** e a **Agenda** entram ou saem?
2. **MEL** é `core` no código — mantém sempre visível, ou deve virar módulo desligável?
3. A tela **`/meus-modulos`** deve continuar existindo para o cliente (com "Loja de Módulos" e trial) ou vira **somente leitura** ("o que você tem"), já que a decisão é "módulos ativados pela UNIQ"?
4. O módulo **Cardápio** substitui a exposição de **Estoque** para a Doceê, ou Estoque continua ativo?
5. **Estoque** fica ligado para a Doceê (ela tem `estoque_atual` nos produtos)?

---

## 8. Próximos passos (quando decidido)

> ⚠️ **REGRA DE OURO (`AGENTS.md`):** mudança de tela/módulo exige **PRD → SPEC → WIRE** aprovado antes de qualquer código.

1. Fundador responde §7.
2. PRD + SPEC + WIRE do caminho escolhido (`tracking/plans/`, `tracking/specs/`, `tracking/wireframe/`).
3. Só então implementar — de preferência em lanes paralelas (ex.: `ModulosContext`↔banco numa lane, guarda de rota em outra, tela de módulos em outra), com **contrato de dados congelado** e donos de arquivo explícitos.
4. Verificação: `npx tsc --noEmit` (linha de base = **5 erros**, zero novos) + `npm run build` + smoke de runtime do rail.

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

*Análise produzida em 21/09/2026. Nenhum arquivo de código foi alterado.*
