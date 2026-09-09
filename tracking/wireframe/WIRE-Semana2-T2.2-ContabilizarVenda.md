# WIRE — T2.2: Contabilizar Venda

## Tela: Detalhe do Pedido

### Header (adicionado)
```
[←] PD-2603-0412  [Aguardando]  [WhatsApp]
                    [Imprimir] [Atualizar status] [Contabilizar venda]
                                                          ↑ outline verde
```

### Após contabilizar
```
[←] PD-2603-0412  [Aguardando]  [WhatsApp]
                    [Imprimir] [Atualizar status] [✓ Venda contabilizada]
                                                          ↑ badge verde
```

## Modal: Confirmar Contabilização

```
┌─────────────────────────────────────┐
│  [💰]  Contabilizar venda?          │
│        Esta ação registra a venda   │
│        no financeiro                │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Pedido:    PD-2603-0412     │    │
│  │ Cliente:   Maria Silva      │    │
│  │ Itens:     2 produto(s)     │    │
│  │ ─────────────────────────── │    │
│  │ Valor:     R$ 157,00        │    │
│  └─────────────────────────────┘    │
│                                     │
│  [  Cancelar  ]  [  ✓ Confirmar  ]  │
│                       ↑ verde       │
└─────────────────────────────────────┘
```

### Loading
```
[  Cancelar  ]  [ ↻ Registrando... ]
                     ↑ desabilitado
```
