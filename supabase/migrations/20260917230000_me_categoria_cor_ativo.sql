-- =============================================================================
-- Categorias de produto: cor + soft delete + unicidade por empresa
-- =============================================================================
-- Aplicada em 17/09/2026 no Supabase oficial (krrkfgv...).
--
-- Contexto: a tela de Categorias (espelho da tela de tags do CRM) precisa de
-- cor própria e de remoção que NÃO apague o vínculo do produto. `me_categoria`
-- não tinha nenhuma das duas; `me_tag` tem.
--
-- Verificado ANTES de aplicar: zero duplicatas de (empresa_id, nome_categoria)
-- na base — por isso o índice único é seguro de criar.
--
-- NÃO altera `me_produto.tipo`, que é TIPO DE PRODUTO (simples/variavel/Outros)
-- e não categoria. Categoria vive em `me_produto.categoria_id`.
-- =============================================================================

-- Cor da categoria — usada na tela de configurações e nas chips do produto.
-- Sem ela, todas as chips caem na cor de fallback "Outros".
ALTER TABLE me_categoria ADD COLUMN IF NOT EXISTS cor text;

-- Soft delete, igual às tags: a categoria sai dos selects, mas o produto que já
-- a usava mantém o rótulo (a FK é ON DELETE SET NULL, mas não queremos desvincular)
ALTER TABLE me_categoria ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- Sem duplicata de nome dentro da empresa (case-insensitive).
-- PARCIAL (`WHERE ativo = true`) para permitir recriar um nome já removido.
-- Globais (empresa_id IS NULL) entram com uuid sentinela para também não duplicarem.
CREATE UNIQUE INDEX IF NOT EXISTS ux_me_categoria_empresa_nome
  ON me_categoria (COALESCE(empresa_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(nome_categoria))
  WHERE ativo = true;

-- =============================================================================
-- Verificação (esperado: cor e ativo presentes; índice presente)
-- =============================================================================
-- SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--  WHERE table_schema='public' AND table_name='me_categoria' ORDER BY column_name;
--
-- SELECT indexname, indexdef FROM pg_indexes
--  WHERE schemaname='public' AND tablename='me_categoria';

-- =============================================================================
-- Rollback
-- =============================================================================
-- DROP INDEX IF EXISTS ux_me_categoria_empresa_nome;
-- ALTER TABLE me_categoria DROP COLUMN IF EXISTS ativo;
-- ALTER TABLE me_categoria DROP COLUMN IF EXISTS cor;
