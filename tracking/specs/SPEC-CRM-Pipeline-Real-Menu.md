# SPEC — CRM de ponta a ponta (Pipeline real + CRM no menu)

**Status:** WIRE aprovado por delegação do fundador (16/10/2026 — sem validação prévia, valida no final).
**Escopo:** 2 entregas — (1) Pipeline com dados reais no Supabase; (2) CRM visível no menu (desktop + mobile).

## Fonte de verdade existente
- Tabelas: `crm_etapas` (id, empresa_id, nome, posicao, cor, fixa), `crm_oportunidades` (id, empresa_id, cliente_id, lead_id, titulo, valor, estagio, data_fechamento, created_at + **novas** estagio_desde, atualizado_em), `crm_atividades` (log), `me_cliente` (clientes da empresa), `me_tag`.
- Padrão de acesso: `useAuth()` → `empresa.id` para filtro `empresa_id` (igual `use-clientes.ts`), `lib/supabase`.
- Visual atual: `PipelinePage.tsx` + `crmMockData.ts` (kanban react-dnd) — **manter o visual, trocar a fonte de dados**.

## 1. Hooks (novos, em `src/app/hooks/`)
| Hook | Responsabilidade |
|------|------------------|
| `use-pipeline.ts` | Carrega `crm_etapas` (order posicao) + `crm_oportunidades` (eq empresa_id, select com cliente: `me_cliente(nome_cliente, telefone)`) da empresa logada; filtra duplicado; expõe `{ etapas, oportunidades, carregando, erro, recarregar }`. Header probabilidade por etapa reusa `PIPELINE_ETAPAS` correlatas por índice. |
| `use-clientes-lista.ts` | Lista leve de `me_cliente` (nome, telefone, id) ativos para o modal de criação (ou reaproveitar `use-clientes.ts` se já existir forma). |
| `use-salvar-oportunidade.ts` | Criar/atualizar `crm_oportunidades` (título, cliente_id, valor, estagio, data_fechamento). Ao criar: `estagio` = nome da 1ª etapa, `estagio_desde` default now(). |
| `use-mover-oportunidade.ts` | Update `estagio` + grava `crm_atividades` (tipo 'movimento', descrição `“Movida para <etapa>”`). Trigger já atualiza `estagio_desde`. |
| `use-excluir-oportunidade.ts` | Delete por id. |

## 2. Mapeamento visual (mock → real)
- `Negociacao.etapa` string ↔ `crm_oportunidades.estagio` (nome da etapa; colunas batem por nome).
- `clienteNome` ↔ `me_cliente.nome_cliente`; `clienteColor` via `getAvatarColor(id)`; `initials` igualClientesPage.
- `diasNaEtapa` ↔ `(now - estagio_desde)` em dias; `atrasado` = dias >= 7 e etapa não ganho/perdido.
- `probabilidade` = probabilidadePadrão da etapa (índice da lista da empresa: 10/25/50/70/90/100/0 — derivado da posição: 1ª até 5ª escalonado, últimas fixas). Etapas custom: pos<5 → 10*s/5 arredondado, "Fechado Ganho/Ganho"=100, "Perdido/Fechado Perdido"=0.
- `cor` da coluna: se valor começar com `#` usa hex; classes tailwind → mantém chip sem cor custom (fallback neutro).

## 3. Estados obrigatórios
- Loading: skeleton das colunas; Error: mensagem + botão Tentar de novo; Empty global: CTA "Criar primeira negociação"; Empty por coluna: "Arraste um card para cá".
- Chat conversational errors: toast com mensagem real do Supabase (padrão `55f3fa9`).

## 4. Menu (AppLayout.tsx)
- Novo item principal no rail e no drawer mobile: **CRM** (icon `TrendingUp`(? lucide `Kanban`), `moduloCodigo: "crm"` — catalogo `lib/modulos.ts` já tem crm ativo), filhos:
  - `Visão Geral` → `/crm/dashboard`
  - `Pipeline` → `/crm/pipeline`
  - `Clientes` → `/crm/clientes`
  - `Configurações` → `/crm/configuracoes`
- Manter também "Clientes" em Cadastros (decisão 15/10 preservada). Menu igual em desktop (`aside lg:flex`) e mobile drawer (mesma fonte de dados: MENU_ITEMS).
- Rota `/crm` mantém redirect dashboard.

## 5. Sem invasão
- Não tocar em `ClientesPage/ClienteDetalhe (já integrados a me_cliente)`, chatbot, n8n.
- `crmMockData.ts` permanece para Clientes/tags; editado apenas se necessário para tipos.

## Checklist
- [ ] Pipeline lê `crm_etapas`/`crm_oportunidades` da empresa logada
- [ ] Criar negociação (modal: cliente, título, valor, data fechamento)
- [ ] Arrastar card muda estagio + log em crm_atividades + diasNaEtapa reseta
- [ ] Editar/Excluir negociação
- [ ] KPIs do header somam do banco
- [ ] Loading/error/empty nas 3 formas
- [ ] CRM no rail desktop + drawer mobile com 4 filhos
- [ ] `npm run build` verde
