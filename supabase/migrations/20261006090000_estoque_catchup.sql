-- ============================================================================
-- 20261006090000_estoque_catchup.sql
-- B16 — Catch-up do Estoque: est_movimentacao + me_produto.estoque_minimo
--
-- Objetivo: tornar o schema do clone reproduzível e alinhar o schema de
-- produção ao app, sem mudança de comportamento exceto onde indicado.
--
-- Fonte da verdade: schema REAL de produção (krrkfgvdwhpelxtrdtla), verificado
-- em 06/10/2026 via information_schema/pg_constraint (MCP supabase_uat_04).
-- Nenhuma inferência: todos os tipos/nullabilidade/FKs abaixo foram lidos do
-- banco vivo. `CREATE TABLE IF NOT EXISTS` espelha esse schema para clones.
--
-- Correção N9 (bug real, fix desta migration):
--   O app insere `tipo = 'entrada' | 'saida'` (minúsculo — convenção do
--   projeto, ver ProdutoDetalhePage.tsx:126), mas o CHECK de produção só
--   aceita ('ENTRADA','SAIDA','AJUSTE'). Como comparação de text é
--   case-sensitive, TODO INSERT do app falha com violação de check (23514).
--   A tabela está VAZIA em produção (0 linhas) — trocar o CHECK é seguro e
--   não exige migração de dado. Novos valores: ('entrada','saida','ajuste').
--
-- Em produção: DROP/ADD da constraint + CREATE INDEX IF NOT EXISTS (no-op onde
-- já existir) + ADD COLUMN IF NOT EXISTS (no-op). Em clone limpo: cria tudo.
-- ============================================================================

-- 1. Tabela de movimentações (espelha o schema real de produção)
CREATE TABLE IF NOT EXISTS est_movimentacao (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id        uuid NOT NULL REFERENCES me_empresa(id) ON DELETE CASCADE,
  produto_id        integer NOT NULL REFERENCES me_produto(id) ON DELETE CASCADE,
  tipo              text NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
  quantidade        numeric NOT NULL,
  data_movimentacao timestamptz NOT NULL DEFAULT now(),
  motivo            text,
  usuario_id        uuid REFERENCES auth.users(id),
  created_at        timestamptz DEFAULT now()
);

-- 2. Correção N9: CHECK case-sensitive expulava os INSERTs do app
--    (produção tem ('ENTRADA','SAIDA','AJUSTE'); app manda minúsculo;
--    tabela vazia → troca segura, sem migração de dado)
ALTER TABLE est_movimentacao DROP CONSTRAINT IF EXISTS est_movimentacao_tipo_check;
ALTER TABLE est_movimentacao
  ADD CONSTRAINT est_movimentacao_tipo_check
  CHECK (tipo IN ('entrada', 'saida', 'ajuste'));

-- 3. me_produto.estoque_minimo (hotfix "fix-7" de 19/09 ficou só no banco)
ALTER TABLE me_produto
  ADD COLUMN IF NOT EXISTS estoque_minimo integer NOT NULL DEFAULT 5;

-- 3b. N10: o AjustarEstoqueModal coleta uma "Observação" (ProdutoDetalhePage
--     :72/:218) mas o INSERT nunca a envia porque a coluna não existia.
--     O app coleta o campo ativamente → completar o modelo de dados.
ALTER TABLE est_movimentacao
  ADD COLUMN IF NOT EXISTS observacao text;

-- 4. Índices de leitura (produção tinha apenas a PK; o extrato lê por
--    empresa + data e o detalhe do produto por produto)
CREATE INDEX IF NOT EXISTS idx_est_movimentacao_empresa_data
  ON est_movimentacao (empresa_id, data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS idx_est_movimentacao_produto
  ON est_movimentacao (produto_id);
