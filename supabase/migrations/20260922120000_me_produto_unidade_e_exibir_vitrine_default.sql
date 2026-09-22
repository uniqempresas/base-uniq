-- Loja/Vitrine — completar o módulo
-- PRD/SPEC: tracking/plans/PRD-LojaVirtual-CompletarModulo.md · tracking/specs/SPEC-LojaVirtual-CompletarModulo.md
--
-- Duas correções de schema, ambas aprovadas pelo fundador em 22/09/2026.
--
-- 1. `me_produto.unidade` NÃO EXISTIA.
--    O ProdutoFormModal coleta "Unidade" (Peça/Par/Kit/Kg/Metro/Litro/Frasco/
--    Caixa/Pacote) no estado do formulário, mas `useCriarProduto` e
--    `useAtualizarProduto` nunca recebiam o campo — o valor era perdido no save.
--    Coluna aditiva e nullable: zero risco, nenhum dado existente é tocado.
--
-- 2. `me_produto.exibir_vitrine` tinha DEFAULT false.
--    A vitrine pública filtra `.eq("exibir_vitrine", true)`, e o modal não
--    escrevia a coluna. Consequência: todo produto cadastrado pela interface
--    nascia INVISÍVEL na loja, sem UI para corrigir.
--    Estado verificado antes da correção (22/09/2026): os 16 produtos da Doceê
--    estavam `true` porque foram configurados por fora do app — o bug era
--    latente, com disparo garantido no próximo cadastro.
--
--    Decisão do fundador: alinhar o default para `true` — produto novo APARECE
--    na loja, e o parceiro desmarca o toggle "Mostrar na vitrine" se não quiser.
--    `SET DEFAULT` afeta apenas linhas NOVAS; as existentes não mudam.

alter table public.me_produto
  add column if not exists unidade text;

alter table public.me_produto
  alter column exibir_vitrine set default true;
