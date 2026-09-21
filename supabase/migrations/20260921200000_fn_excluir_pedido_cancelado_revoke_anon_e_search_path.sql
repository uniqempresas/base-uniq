-- ============================================================================
-- Correção curta (Opção A) — 21/09/2026
-- Fecha a SEGUNDA porta SECURITY DEFINER do projeto.
--
-- ANTES: public.fn_excluir_pedido_cancelado era SECURITY DEFINER, com EXECUTE
--        concedido a PUBLIC/anon (o default do Postgres) e sem search_path fixo.
--        Um chamador anônimo — com a anon key, que é pública e vai no bundle —
--        podia soft-deletar venda de QUALQUER empresa E devolver estoque.
--
-- DEPOIS: só authenticated (ERP, usuário logado) e service_role (servidores)
--         executam. search_path fixo em '' porque o corpo JÁ usa nomes
--         totalmente qualificados (public.me_venda, public.me_contas_receber,
--         public.me_produto, public.me_itens_venda, public.me_venda_historico).
--
-- Origem: revisão de segurança de 21/09/2026 (achado R2).
--         tracking/plans/PRD-Seguranca-EscritaVendas.md §2.7
--         tracking/BACKLOG_SEGURANCA.md
--
-- ⚠️ PENDENTE (Sprint de Segurança): validação de tenant dentro da função.
--    Hoje p_empresa_id continua sendo parâmetro do chamador. Fechar isso exige
--    checar auth.uid() -> me_usuario.empresa_id, como descrito no SPEC.
-- ============================================================================

REVOKE EXECUTE ON FUNCTION public.fn_excluir_pedido_cancelado(uuid, uuid, uuid, text)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.fn_excluir_pedido_cancelado(uuid, uuid, uuid, text)
  TO authenticated, service_role;

ALTER FUNCTION public.fn_excluir_pedido_cancelado(uuid, uuid, uuid, text)
  SET search_path = '';
