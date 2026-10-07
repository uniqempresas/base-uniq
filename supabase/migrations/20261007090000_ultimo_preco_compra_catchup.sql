-- Catch-up de schema U2 (06-07/10/2026) — produto: preço da última compra
-- Aplicado no banco vivo antes de existir arquivo no repo (mesmo padrão do B16).
-- Reescrito a partir do information_schema: sem inferência.

ALTER TABLE me_produto
  ADD COLUMN IF NOT EXISTS ultimo_preco_compra numeric,
  ADD COLUMN IF NOT EXISTS ultima_compra_em date;

COMMENT ON COLUMN me_produto.ultimo_preco_compra IS 'Último valor_unitario pago na unidade de COMPRA (recebimento da compra — RPC receber_compra). Referência para pré-preencher a próxima compra.';
COMMENT ON COLUMN me_produto.ultima_compra_em IS 'Data do último recebimento de compra deste item (date).';
