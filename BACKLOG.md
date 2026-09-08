# Backlog pós-entrega — Base UNIQ

Itens não bloqueantes para a próxima etapa do produto.

## Configurações

- Criar tela de Integrações (`/configuracoes/integracoes`).
- Criar tela de Notificações (`/configuracoes/notificacoes`).

## Marketplace

- Persistir lojistas, produtos, pedidos e status em `localStorage` nos hooks `useMarketplace` e `useVendedor`.
- Criar gestão de produtos do vendedor, caso o fluxo administrativo exija essa operação.

## Qualidade técnica

- Criar `tsconfig.json` e adicionar `tsc --noEmit` à validação contínua.
- Remover `src/app/components/mel/MelConversaPage.tsx` se continuar sem uso.
- Avaliar code-splitting para reduzir o bundle inicial acima de 500 kB.

## UX e integração

- Conectar os dados demonstrativos da MEL aos módulos operacionais.
- Unificar a nomenclatura de permissões entre `servicos`, `services`, `appointments` e `agenda`.
- Substituir mocks por backend quando o contrato de dados for definido.

## Limitações conhecidas do protótipo

- O sistema ainda usa dados mock/local-first.
- Alguns módulos Marketplace não persistem alterações após recarregar a página.
