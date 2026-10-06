-- ============================================================================
-- 20261006120000_producao_fase1_natureza_ficha.sql
-- Produção Fase 1 (PRD-Producao-BOM-Fase1): natureza do produto + ficha técnica
--
-- Decisão D5: EIXO NOVO `natureza` — o `me_produto.tipo` legado (simples/variavel)
-- fica intocado. Default 'simples' mantém os produtos existentes válidos.
-- ============================================================================

ALTER TABLE me_produto
  ADD COLUMN IF NOT EXISTS natureza text NOT NULL DEFAULT 'simples';

ALTER TABLE me_produto DROP CONSTRAINT IF EXISTS me_produto_natureza_check;
ALTER TABLE me_produto
  ADD CONSTRAINT me_produto_natureza_check
  CHECK (natureza IN ('simples', 'composto', 'insumo'));

-- Ficha técnica (BOM): componentes consumidos por 1 unidade do item pai
CREATE TABLE IF NOT EXISTS est_ficha_tecnica (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id              uuid NOT NULL REFERENCES me_empresa(id) ON DELETE CASCADE,
  produto_pai_id          integer NOT NULL REFERENCES me_produto(id) ON DELETE CASCADE,
  componente_id           integer NOT NULL REFERENCES me_produto(id) ON DELETE CASCADE,
  quantidade_por_unidade  numeric NOT NULL CHECK (quantidade_por_unidade > 0),
  perda_pct               numeric NOT NULL DEFAULT 0 CHECK (perda_pct >= 0),
  criado_em               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE est_ficha_tecnica DROP CONSTRAINT IF EXISTS est_ficha_tecnica_auto_ref_check;
ALTER TABLE est_ficha_tecnica
  ADD CONSTRAINT est_ficha_tecnica_auto_ref_check
  CHECK (componente_id <> produto_pai_id);

-- 1 ficha por item pai; componente aparece no máximo 1 vez (ajuste = editar)
CREATE UNIQUE INDEX IF NOT EXISTS ux_ficha_pai_componente
  ON est_ficha_tecnica (produto_pai_id, componente_id);
CREATE INDEX IF NOT EXISTS idx_ficha_tecnica_pai
  ON est_ficha_tecnica (produto_pai_id);
