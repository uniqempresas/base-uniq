# WIRE — T2.5: CRUD de Produtos

## Tela: Lista de Produtos (modificada)

### Estrutura atual (já existe)
```
┌─────────────────────────────────────────────────────────┐
│  Produtos                    [Novo Produto] [Importar]  │
│  Gerencie seu catálogo                                  │
├─────────────────────────────────────────┤
│  [🔍 Buscar...] [Categoria ▼] [Status ▼] [Grid/List]   │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ [foto]   │ │ [foto]   │ │ [foto]   │ │ [foto]   │   │
│  │ Estoque  │ │ Estoque  │ │ Estoque  │ │ Estoque  │   │
│  │ Badge    │ │ Badge    │ │ Badge    │ │ Badge    │   │
│  │          │ │          │ │          │ │          │   │
│  │ Nome     │ │ Nome     │ │ Nome     │ │ Nome     │   │
│  │ SKU      │ │ SKU      │ │ SKU      │ │ SKU      │   │
│  │ Categoria│ │ Categoria│ │ Categoria│ │ Categoria│   │
│  │ R$ Preço │ │ R$ Preço │ │ R$ Preço │ │ R$ Preço │   │
│  │ Estoque  │ │ Estoque  │ │ Estoque  │ │ Estoque  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Modal: Novo/Editar Produto (já existe, modificar para salvar no banco)

```
┌─────────────────────────────────────────┐
│  Novo Produto                    [X]    │
├─────────────────────────────────────────┤
│  ● Informações  ○ Preços  ○ Estoque    │
│                                         │
│  Nome do produto *                      │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  SKU              Código de barras      │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │             │  │                 │   │
│  └─────────────┘  └─────────────────┘   │
│                                         │
│  Categoria *        Unidade             │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Selecione ▼ │  │ Un ▼            │   │
│  └─────────────┘  └─────────────────┘   │
│                                         │
│  Descrição                              │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│           [Próximo →]                   │
└─────────────────────────────────────────┘
```

## Mudanças para integração

| Elemento | Mudança |
|----------|---------|
| Lista de produtos | Buscar do Supabase com fallback mock |
| Botão "Salvar" | Chamar hook de criar/editar |
| Badge de fallback | Indicar quando está mostrando mock |
| Loading | Skeleton durante busca |

## Estados

| Estado | Comportamento |
|--------|---------------|
| Loading | Skeleton cards |
| Empty (banco vazio) | Mostra mock + badge "Dados de exemplo" |
| Error | Toast erro + fallback mock |
| Success | Lista do banco |
