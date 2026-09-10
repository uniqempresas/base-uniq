# WIRE — T2.7: Financeiro Integrado ao Banco

> Nota: As telas já existem e foram aprovadas em sprint anterior. Este WIRE documenta a integração ao banco — não há mudança visual, apenas mudança de fonte de dados (mock → Supabase).

---

## Tela: Contas a Receber (`/financeiro/contas-receber`)

### Estado: Lista com dados

```
┌─────────────────────────────────────────────────────────────────┐
│  Contas a Receber                              [+ Nova conta]   │
│  Acompanhe pagamentos de clientes                               │
├─────────────────────────────────────────────────────────────────┤
│  [Total a receber R$ 850] [Em atraso R$ 0]                      │
│  [Recebidos R$ 0] [Previsão R$ 850]                             │
├─────────────────────────────────────────────────────────────────┤
│  [Status: Todos ▼]  [🔍 Buscar...]                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Cliente    │ Descrição       │ Data prevista │ Valor    │    │
│  │------------│-----------------│---------------│----------│    │
│  │ Maria Silva│ Venda #abc      │ 15/04/2025    │ R$ 150,00│    │
│  │            │                 │ No prazo      │          │    │
│  │ João Souza │ Venda #def      │ 10/04/2025    │ R$ 300,00│    │
│  │            │                 │ Vencido       │          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes

| Componente | Origem | Observação |
|------------|--------|------------|
| 4 cards KPI | `useContasReceber()` | Calculado dos dados |
| Filtro status | Front-end | Filtra dados em memória |
| Busca | Front-end | Filtra por cliente/descrição |
| Tabela | `useContasReceber()` | Dados reais do banco |
| Badge "dados de exemplo" | `isFallback` | Aparece quando mock |

### Ações

| Ação | Efeito |
|------|--------|
| Clicar em "Nova conta" | Abre modal de criação |
| Clicar em linha | Abre modal de detalhe |
| Clicar em "Receber" | Marca como pago (atualiza banco) |

---

## Tela: Contas a Pagar (`/financeiro/contas-pagar`)

### Estado: Lista com dados

```
┌─────────────────────────────────────────────────────────────────┐
│  Contas a Pagar                                [+ Nova conta]   │
│  Gerencie suas obrigações e fornecedores                        │
├─────────────────────────────────────────────────────────────────┤
│  [Total a pagar R$ 2.080] [Em atraso R$ 280]                    │
│  [Pagos R$ 0] [Previsão R$ 2.080]                               │
├─────────────────────────────────────────────────────────────────┤
│  [Status: Todos ▼]  [🔍 Buscar...]                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Descrição      │ Fornecedor   │ Data venc.   │ Valor    │    │
│  │----------------│--------------│--------------│----------│    │
│  │ Aluguel        │ Imobiliária  │ 10/04/2025   │ R$ 1.800 │    │
│  │                │ Central      │ No prazo     │          │    │
│  │ Energia Elétr. │ Enel         │ 05/04/2025   │ R$ 280   │    │
│  │                │              │ Vencido      │          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes

| Componente | Origem | Observação |
|------------|--------|------------|
| 4 cards KPI | `useContasPagar()` | Calculado dos dados |
| Filtro status | Front-end | Filtra dados em memória |
| Busca | Front-end | Filtra por descrição/fornecedor |
| Tabela | `useContasPagar()` | Dados reais do banco |
| Badge "dados de exemplo" | `isFallback` | Aparece quando mock |

### Ações

| Ação | Efeito |
|------|--------|
| Clicar em "Nova conta" | Abre modal de criação |
| Clicar em linha | Abre modal de detalhe |
| Clicar em "Pagar" | Marca como pago (atualiza banco) |

---

## Modal: Nova Conta a Receber

```
┌─────────────────────────────────────────────────────────┐
│  Nova conta a receber                              [X]  │
├─────────────────────────────────────────────────────────┤
│  Cliente *          [_______________________________▼]  │
│  Descrição *        [_______________________________]   │
│  Valor *            [_______________________________]   │
│  Data prevista *    [____/____/______]                  │
│  Categoria          [Vendas ▼]                          │
│  Forma pagamento    [PIX ▼]                             │
├─────────────────────────────────────────────────────────┤
│                              [Cancelar]  [Salvar conta] │
└─────────────────────────────────────────────────────────┘
```

---

## Modal: Nova Conta a Pagar

```
┌─────────────────────────────────────────────────────────┐
│  Nova conta a pagar                                [X]  │
├─────────────────────────────────────────────────────────┤
│  Descrição *        [_______________________________]   │
│  Fornecedor         [_______________________________▼]  │
│  Valor *            [_______________________________]   │
│  Data vencimento *  [____/____/______]                  │
│  Categoria          [Outras Despesas ▼]                 │
│  Forma pagamento    [PIX ▼]                             │
├─────────────────────────────────────────────────────────┤
│                              [Cancelar]  [Salvar conta] │
└─────────────────────────────────────────────────────────┘
```

---

## Modal: Confirmar Recebimento

```
┌─────────────────────────────────────────────────────────┐
│  Confirmar recebimento                             [X]  │
├─────────────────────────────────────────────────────────┤
│  Cliente: Maria Silva                                     │
│  Valor: R$ 150,00                                         │
│  Vencimento: 15/04/2025                                   │
├─────────────────────────────────────────────────────────┤
│  Data recebimento: [____/____/______]  (padrão: hoje)     │
│  Valor recebido:   [R$ 150,00_______]  (padrão: valor)    │
├─────────────────────────────────────────────────────────┤
│                              [Cancelar]  [Confirmar]      │
└─────────────────────────────────────────────────────────┘
```

---

## Modal: Confirmar Pagamento

```
┌─────────────────────────────────────────────────────────┐
│  Confirmar pagamento                               [X]  │
├─────────────────────────────────────────────────────────┤
│  Descrição: Aluguel                                       │
│  Valor: R$ 1.800,00                                       │
│  Vencimento: 10/04/2025                                   │
├─────────────────────────────────────────────────────────┤
│  Data pagamento: [____/____/______]  (padrão: hoje)       │
│  Valor pago:     [R$ 1.800,00_______]  (padrão: valor)    │
├─────────────────────────────────────────────────────────┤
│                              [Cancelar]  [Confirmar]      │
└─────────────────────────────────────────────────────────┘
```

---

## Estados

| Estado | Comportamento |
|--------|---------------|
| Loading | Skeleton nos cards e tabela |
| Vazio (banco) | Fallback para mock + badge "dados de exemplo" |
| Erro | Fallback para mock + badge "erro de conexão" |
| Sucesso | Dados reais do banco |

---

## Badge de Fallback

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Exibindo dados de exemplo — conecte-se ao banco     │
└─────────────────────────────────────────────────────────┘
```

Aparece quando:
- Banco retorna vazio
- Erro de conexão
- `isFallback === true` no hook
