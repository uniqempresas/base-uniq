-- =============================================================
-- B9 (SPEC-CategoriasFinanceiras §3.1) — me_categoria_financeira
-- Tabela JÁ EXISTE no Supabase (criada direto) mas não tem migration
-- no repo. Este arquivo é IDEMPOTENTE (no-op no banco atual) e é a
-- garantia para ambiente novo/reset quebrar a leitura das 3 lanes.
--
-- ⚠️ Sem CHECK em `tipo`: dado legado pode estar fora dos 3 valores
-- (operacional | mercadoria | receita). A validação fica no app.
-- ⚠️ Migration NÃO aplicada nesta sessão (MCP do Supabase fora do ar).
-- =============================================================

create table if not exists public.me_categoria_financeira (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.me_empresa(id) on delete cascade,
  nome text not null,
  tipo text default 'operacional',
  cor text,
  ativo boolean default true,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

alter table public.me_categoria_financeira add column if not exists tipo text default 'operacional';
alter table public.me_categoria_financeira add column if not exists cor text;
alter table public.me_categoria_financeira add column if not exists ativo boolean default true;

-- Índice único por tenant (o CRUD trata 23505)
create unique index if not exists me_categoria_financeira_empresa_nome_key
  on public.me_categoria_financeira (empresa_id, lower(nome));