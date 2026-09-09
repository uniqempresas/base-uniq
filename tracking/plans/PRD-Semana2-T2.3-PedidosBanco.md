# PRD — T2.3: Pedidos Integrados ao Banco + Criação Manual

## Objetivo
Permitir que a esposa do fundador crie pedidos manualmente na Base UNIQ (ex: pedido recebido por WhatsApp) e ver pedidos reais do banco, não apenas mocks.

## Contexto
Hoje a tela `/vendas/pedidos` mostra apenas dados mockados. Para a cadeia de demonstração funcionar de ponta a ponta, precisamos:
1. Buscar pedidos reais do banco (`me_venda`)
2. Permitir criar pedido manualmente (sem precisar de produtos cadastrados)
3. Manter fallback mock quando o banco estiver vazio

## Stakeholders
- Esposa do fundador (operadora do laboratório)
- Fundador (validação)

## Critérios de Aceite
- [ ] Tela de pedidos busca dados reais de `me_venda` com fallback mock
- [ ] Botão "Novo Pedido" abre modal de criação
- [ ] Modal permite: cliente, descrição livre, valor, forma de pagamento, canal
- [ ] Ao salvar, cria registro em `me_venda`
- [ ] Novo pedido aparece na lista
- [ ] Loading e empty states funcionando

## Fora de Escopo
- Vincular a produtos cadastrados
- Edição de pedidos
- Exclusão de pedidos
- Múltiplas formas de pagamento
