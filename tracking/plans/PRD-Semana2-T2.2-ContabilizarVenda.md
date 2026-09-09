# PRD — T2.2: Pedido Contabilizado via RPC `registrar_venda`

## Objetivo
Permitir que um pedido confirmado seja contabilizado como venda no financeiro da Base UNIQ, criando registro em `me_venda` e `me_contas_receber` via RPC existente.

## Contexto
A cadeia de demonstração WhatsApp → CRM → Pedido → Financeiro precisa de um gatilho que transforme um pedido em venda registrada. A RPC `registrar_venda` já existe no Supabase e cria os registros necessários.

## Stakeholders
- Fundador (validação)
- Esposa do fundador (operadora do laboratório)

## Critérios de Aceite
- [x] Botão "Contabilizar venda" visível em pedidos com pagamento confirmado
- [x] Modal de confirmação mostra resumo do pedido
- [x] Ao confirmar, chama RPC `registrar_venda` com parâmetros corretos
- [x] Feedback visual de sucesso (toast + badge "Venda contabilizada")
- [x] Tratamento de erro com mensagem clara
- [x] Loading state durante o registro

## Fora de Escopo
- Múltiplas empresas (usa empresa do contexto)
- Edição de itens antes de contabilizar
- Cancelamento de venda já registrada
