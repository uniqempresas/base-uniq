# WIRE — T2.3: Pedidos Integrados + Novo Pedido

## Tela: Lista de Pedidos (modificada)

### Header (adicionado botão)
```
┌─────────────────────────────────────────────────────────────────┐
│  Pedidos                                        [+ Novo Pedido]  │
│  Acompanhe todos os pedidos da loja                              │
└─────────────────────────────────────────────────────────────────┘
                                    ↑ verde primário
```

## Modal: Novo Pedido

```
┌─────────────────────────────────────────┐
│  [📝]  Novo Pedido                      │
│        Registre um pedido manual        │
│                                         │
│  Cliente *                              │
│  ┌─────────────────────────────────┐    │
│  │ Nome do cliente                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Telefone (opcional)                    │
│  ┌─────────────────────────────────┐    │
│  │ (11) 99999-9999                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Descrição do pedido *                  │
│  ┌─────────────────────────────────┐    │
│  │ 2 caixas de salgado + 1 bolo    │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Valor total *          Forma pagamento │
│  ┌──────────────┐      ┌────────────┐   │
│  │ R$ 0,00      │      │ PIX ▼      │   │
│  └──────────────┘      └────────────┘   │
│                                         │
│  Canal                                  │
│  ┌────────────────────────────────┐     │
│  │ WhatsApp ▼                     │     │
│  └────────────────────────────────┘     │
│                                         │
│  [  Cancelar  ]    [  Criar Pedido  ]   │
│                         ↑ verde         │
└─────────────────────────────────────────┘
```

### Loading
```
[  Cancelar  ]    [ ↻ Criando...  ]
                      ↑ desabilitado
```

### Sucesso
- Modal fecha
- Toast: "Pedido criado com sucesso!"
- Novo pedido aparece no topo da lista
