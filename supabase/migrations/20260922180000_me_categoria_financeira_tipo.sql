-- me_categoria_financeira — alinha a CHECK de `tipo` ao modelo do app
-- PRD/SPEC: tracking/plans/PRD-CategoriasFinanceiras.md · tracking/specs/SPEC-CategoriasFinanceiras.md
--
-- ⚠️ CONTEXTO (por que este arquivo existe e por que foi reescrito)
--
-- Esta tabela foi criada DIRETO no Supabase, fora do histórico de migrations do repo —
-- por isso a estrutura real não era visível no código, e o SPEC a inferiu errado em
-- três pontos (nomes das colunas de auditoria, nullability/default de `tipo`, e a
-- existência de uma CHECK constraint).
--
-- Estrutura REAL verificada em 22/09/2026 (information_schema + pg_constraint):
--   id uuid PK default gen_random_uuid() · empresa_id uuid NOT NULL FK me_empresa
--   nome varchar NOT NULL · tipo varchar NOT NULL (sem default)
--   cor varchar default '#64748b' · ativo boolean default true
--   created_at / updated_at timestamptz default now()
--
-- A constraint original era:
--   CHECK (tipo = ANY (ARRAY['receita', 'despesa']))
--
-- O app (B9) usa TRÊS valores — `receita` | `operacional` | `mercadoria` — porque o DRE
-- precisa separar "Custo de Mercadoria" de "Despesas Operacionais"
-- (PRD-CategoriasFinanceiras §5). Com a constraint antiga, TODA criação de categoria
-- falhava no valor PADRÃO do formulário (`operacional`):
--   new row for relation "me_categoria_financeira" violates check constraint
--   "me_categoria_financeira_tipo_check"
--
-- `operacional` SUBSTITUI `despesa`: é o mesmo conceito (despesa genérica), com o nome
-- alinhado ao DRE. A tabela estava VAZIA (0 linhas) quando isto foi aplicado — não há
-- dado a migrar nem risco de violar a constraint nova.
--
-- Também cria o índice único que o CRUD assume para tratar duplicidade (código 23505).
-- Ele NÃO existia: a única index era a da PK.

-- 1. A tabela (idempotente — no-op, já existe com esta forma)
create table if not exists public.me_categoria_financeira (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.me_empresa(id) on delete cascade,
  nome character varying not null,
  tipo character varying not null,
  cor character varying default '#64748b',
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. A CHECK: `receita` | `operacional` | `mercadoria`
alter table public.me_categoria_financeira
  drop constraint if exists me_categoria_financeira_tipo_check;

alter table public.me_categoria_financeira
  add constraint me_categoria_financeira_tipo_check
  check (tipo = any (array['receita', 'operacional', 'mercadoria']));

-- 3. Índice único por tenant — o CRUD trata 23505 e precisa dele para disparar
create unique index if not exists me_categoria_financeira_empresa_nome_key
  on public.me_categoria_financeira (empresa_id, lower(nome));
