# PRD — T2.7: Financeiro Integrado ao Banco (Contas a Receber + Contas a Pagar)

## Objetivo
Integrar as telas de **Contas a Receber** e **Contas a Pagar** ao Supabase, permitindo que a esposa do fundador veja as contas geradas pela "Contabilizar venda" e cadastre contas fixas (aluguel, luz, etc.).

## Problema
- A tela Contas a Receber usa mock data — a esposa não vê o resultado da contabilização
- A tela Contas a Pagar usa mock data — não é possível cadastrar contas fixas
- O ciclo de validação está incompleto sem visão financeira

## Solução
- Criar hooks `useContasReceber` e `useContasPagar`
- Integrar ambas as telas ao Supabase
- Manter fallback para mock quando banco vazio/erro

## Escopo
- ✅ Contas a Receber: listar, filtrar, criar, editar, marcar como recebido
- ✅ Contas a Pagar: listar, filtrar, criar, editar, marcar como pago
- ❌ Fora de escopo: Fluxo de Caixa, DRE, Dashboard financeiro (fase posterior)

## Stakeholders
- Esposa do fundador (validação)
- Fundador (aprovação)

## Métricas de Sucesso
- Contabilizar venda → aparece em Contas a Receber
- Criar conta a pagar → aparece na lista
- Marcar como pago/recebido → atualiza status no banco
