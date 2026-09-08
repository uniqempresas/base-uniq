---
date: 2026-03-21T15:30:00-03:00
researcher: vibe-researcher
branch: master
repository: uniq-empresas
topic: "Sprint 08: Fornecedores UI - Frontend Only"
tags: [sprint, frontend, fornecedores, suppliers, react, typescript, crud]
status: complete
ui_spec: docs/ui/modulo-04-financeiro-fornecedores.md, docs/ui/modulo-05-estoque-fornecedores.md
roadmap_ref: docs/ROADMAP.md Sprint 08
---

# PRD - Sprint 08: Fornecedores UI 📦

**Projeto:** UNIQ Empresas  
**Tipo:** Frontend (UI Only)  
**Data de Criação:** 2026-03-21  
**Responsável:** Frontend Team  
**Referência UI:** 
- `docs/ui/modulo-04-financeiro-fornecedores.md` (Design + CRUD Financeiro)
- `docs/ui/modulo-05-estoque-fornecedores.md` (Design + CRUD Estoque)
**Referência Roadmap:** `docs/ROADMAP.md` (Sprint 08)

---

## 1. Resumo Executivo

### 1.1 Objetivo
Desenvolver a interface completa do módulo de **Gestão de Fornecedores** para a plataforma UNIQ Empresas, permitindo que pequenos empreendedores gerenciem seus fornecedores, contatos, condições comerciais e histórico de compras de forma centralizada e intuitiva.

### 1.2 Escopo desta Sprint (Frontend Only)
- ✅ Tela de listagem de fornecedores com grid/cards
- ✅ Filtros por status, categoria e busca
- ✅ Modal/Página de cadastro/edição completo
- ✅ Sistema de avaliação por estrelas
- ✅ Gerenciamento de múltiplos contatos
- ✅ Dados bancários e Pix
- ✅ Busca automática de endereço por CEP
- ✅ Modal de visualização com histórico
- ✅ Estados visuais (loading, empty, error)
- ❌ Backend/API (será desenvolvido em sprint futura - Sprint 25)
- ❌ Validação real de CNPJ via API

### 1.3 Stakeholders
- Donos de pequenos comércios
- Prestadores de serviços com estoque
- Indústrias pequenas que compram matéria-prima
- Atacadistas e distribuidores
- Qualquer negócio que precise gerenciar fornecedores

---

## 2. Design System - Especificações Visuais

### 2.1 Paleta de Cores UNIQ

| Token | Valor HEX | Uso |
|-------|-----------|-----|
| `--bg-primary` | `#efefef` | Fundo principal (platinum) |
| `--bg-card` | `#ffffff` | Fundo de cards e modais (white) |
| `--btn-primary` | `#3e5653` | Botões primários (primary) |
| `--btn-primary-hover` | `#1f2937` | Hover de botões primários (hover) |
| `--accent` | `#86cb92` | Destaques, botões de sucesso (accent) |
| `--text-primary` | `#1f2937` | Texto principal (text) |
| `--text-secondary` | `#627271` | Texto secundário (muted) |
| `--border` | `#e5e7eb` | Bordas e divisores (border) |
| `--status-active` | `#22c55e` | Fornecedor ativo (green-500) |
| `--status-inactive` | `#ef4444` | Fornecedor inativo (red-500) |
| `--status-pending` | `#f59e0b` | Fornecedor em análise (amber-500) |
| `--rating-gold` | `#fbbf24` | Avaliação/estrelas (yellow-400) |

### 2.2 Classes Tailwind Padrão UNIQ

```tsx
// Card padrão de fornecedor
bg-white rounded-xl shadow-sm border border-uniq-border p-5 hover:shadow-md transition-all

// Botão Primário
bg-uniq-primary text-white rounded-lg hover:bg-uniq-hover transition-colors

// Botão Secundário
bg-uniq-accent text-white rounded-lg hover:opacity-90 transition-colors

// Input
border border-gray-300 rounded-lg focus:ring-2 focus:ring-uniq-accent focus:border-transparent

// Badge Status Ativo
bg-green-100 text-green-700 rounded-full px-2 py-1 text-xs font-medium

// Badge Status Inativo
bg-red-100 text-red-700 rounded-full px-2 py-1 text-xs font-medium

// Badge Status Pendente
bg-yellow-100 text-yellow-700 rounded-full px-2 py-1 text-xs font-medium
```

### 2.3 Tipografia

| Elemento | Fonte | Tamanho | Peso | Cor |
|----------|-------|---------|------|-----|
| Título Página | Poppins | 24px (text-2xl) | 700 (bold) | `#1f2937` |
| Subtítulo | Poppins | 14px (text-sm) | 400 | `#627271` |
| Nome Fornecedor | Poppins | 16px (text-base) | 600 | `#1f2937` |
| Dados CNPJ | Poppins | 14px (text-sm) | 400 | `#627271` |
| Label | Poppins | 12px (text-xs) | 500 | `#627271` |
| Rating | Star Icons | 16px | - | `#fbbf24` |

---

## 3. Estrutura de Páginas e Componentes

### 3.1 Páginas

| # | Página | Rota | Descrição |
|---|--------|------|-----------|
| 1 | Listagem | `/fornecedores` | Grid de fornecedores com filtros |
| 2 | Cadastro | `/fornecedores/novo` | Formulário completo de novo fornecedor |
| 3 | Edição | `/fornecedores/[id]/editar` | Editar fornecedor existente |
| 4 | Detalhes | `/fornecedores/[id]` | Visualização completa com histórico |

### 3.2 Componentes Principais (mínimo 12)

| # | Componente | Descrição | Localização |
|---|------------|-----------|-------------|
| 1 | `SupplierList` | Página principal com grid de fornecedores | `app/fornecedores/page.tsx` |
| 2 | `SupplierGrid` | Grid responsivo de cards de fornecedores | `app/components/fornecedores/SupplierGrid.tsx` |
| 3 | `SupplierCard` | Card individual do fornecedor | `app/components/fornecedores/SupplierCard.tsx` |
| 4 | `SupplierFilters` | Barra de filtros e busca | `app/components/fornecedores/SupplierFilters.tsx` |
| 5 | `SupplierForm` | Formulário completo de cadastro/edição | `app/components/fornecedores/SupplierForm.tsx` |
| 6 | `SupplierDetailsDrawer` | Drawer lateral de detalhes | `app/components/fornecedores/SupplierDetailsDrawer.tsx` |
| 7 | `SupplierRating` | Sistema de avaliação por estrelas | `app/components/fornecedores/SupplierRating.tsx` |
| 8 | `ContactList` | Lista de contatos com add/remove dinâmico | `app/components/fornecedores/ContactList.tsx` |
| 9 | `BankAccountList` | Lista de dados bancários | `app/components/fornecedores/BankAccountList.tsx` |
| 10 | `CEPSearch` | Busca automática de endereço | `app/components/fornecedores/CEPSearch.tsx` |
| 11 | `SupplierStats` | Cards de estatísticas do fornecedor | `app/components/fornecedores/SupplierStats.tsx` |
| 12 | `PurchaseHistory` | Tabela de histórico de compras | `app/components/fornecedores/PurchaseHistory.tsx` |

### 3.3 Hooks Customizados

| Hook | Descrição |
|------|-----------|
| `useSuppliers` | CRUD de fornecedores e mock data |
| `useSupplierForm` | Gerenciamento de estado do formulário |
| `useCEPSearch` | Busca de endereço por CEP (simulada) |
| `useContacts` | Gerenciamento de contatos dinâmicos |
| `useBankAccounts` | Gerenciamento de dados bancários |

---

## 4. Funcionalidades Detalhadas

### 4.1 Listagem de Fornecedores (`/fornecedores`)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar #1f2937]                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Header] Fornecedores                                    [+ Novo Fornecedor]     │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │ [Tabs: Todos (45) | Ativos (38) | Inativos (4) | Em Análise (3)]              │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │ [Filtros]                                                                     │ │
│ │ [🔍 Buscar fornecedor...    ] [Categoria: Todas ▼] [Status: Todos ▼]         │ │
│ ├─────────────────────────────────────────────────────────────────────────────────┤ │
│ │ [Grid de Fornecedores]                                                        │ │
│ │                                                                                 │ │
│ │ ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────┐│ │
│ │ │ [🏢]                    │ │ [🏢]                    │ │ [🏢]                ││ │
│ │ │ Papelaria ABC           │ │ Tech Solutions          │ │ Transportes XYZ      ││ │
│ │ │ ⭐⭐⭐⭐☆ 4.5           │ │ ⭐⭐⭐⭐⭐ 5.0          │ │ ⭐⭐⭐☆☆ 3.0         ││ │
│ │ │                         │ │                         │ │                     ││ │
│ │ │ CNPJ: 12.345.678/0001  │ │ CNPJ: 98.765.432/0001  │ │ CNPJ: 11.222.333... ││ │
│ │ │ Materiais               │ │ Tecnologia              │ │ Logística           ││ │
│ │ │                         │ │                         │ │                     ││ │
│ │ │ 💰 R$ 125.000/ano       │ │ 💰 R$ 450.000/ano       │ │ 💰 R$ 89.000/ano    ││ │
│ │ │ 📋 45 compras           │ │ 📋 12 compras           │ │ 📋 89 entregas      ││ │
│ │ │                         │ │                         │ │                     ││ │
│ │ │ [🟢 Ativo]             │ │ [🟢 Ativo]              │ │ [🟡 Em Análise]     ││ │
│ │ │                         │ │                         │ │                     ││ │
│ │ │ [Ver] [Editar] [🗑️]   │ │ [Ver] [Editar] [🗑️]    │ │ [Ver] [Editar] [🗑️]│ │
│ │ └─────────────────────────┘ └─────────────────────────┘ └─────────────────────┘│ │
│ │                                                                                 │ │
│ │ [← 1 2 3 ... 10 →]                                    Exibindo 1-9 de 45      │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### Funcionalidades:
- ✅ Grid responsivo de 3 colunas (desktop) → 1 coluna (mobile)
- ✅ Tabs para filtragem rápida (Todos/Ativos/Inativos/Em Análise)
- ✅ Busca por nome, CNPJ ou razão social
- ✅ Filtro por categoria (Materiais, Tecnologia, Logística, Serviços, etc.)
- ✅ Filtro por status (Ativo, Inativo, Em Análise)
- ✅ Ordenação por nome, rating, volume de compras
- ✅ Sistema de avaliação por estrelas (1-5)
- ✅ Cards com informações resumidas
- ✅ Ações rápidas: Ver, Editar, Excluir
- ✅ Paginação com seletor de itens por página
- ✅ Empty state quando não há fornecedores

### 4.2 Cadastro de Fornecedor (`/fornecedores/novo`)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ Novo Fornecedor                                            [Salvar] [Cancelar]            │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│ ┌─────────────────────────────────────┐  ┌─────────────────────────────────────────────────┐│
│ │ INFORMAÇÕES PRINCIPAIS              │  │ VISUALIZAÇÃO                                  ││
│ │                                     │  │                                               ││
│ │ Tipo *                              │  │ ┌─────────────────────────────────────────┐   ││
│ │ (●) PJ    ( ) PF                    │  │ │  [🏢 Logo Placeholder]                   │   ││
│ │                                     │  │ │                                         │   ││
│ │ CNPJ *                              │  │ │  Papelaria ABC Ltda                    │   ││
│ │ [12.345.678/0001-90           ]     │  │ │  ⭐⭐⭐⭐☆ 4.5                        │   ││
│ │                                     │  │ │                                         │   ││
│ │ Razão Social *                      │  │ │  CNPJ: 12.345.678/0001-90              │   ││
│ │ [Papelaria ABC Ltda           ]     │  │ │  Materiais                              │   ││
│ │                                     │  │ │                                         │   ││
│ │ Nome Fantasia                        │  │ │  📧 contato@papelariaabc.com             │   ││
│ │ [Papelaria ABC                 ]    │  │ │  📱 (11) 3456-7890                      │   ││
│ │                                     │  │ │                                         │   ││
│ │ Categoria *                          │  │ │  🟢 Ativo                               │   ││
│ │ [Materiais                        ▼]  │  │ └─────────────────────────────────────────┘   ││
│ │                                     │  │                                               ││
│ │ Avaliação                            │  └─────────────────────────────────────────────────┘│
│ │ [⭐⭐⭐⭐☆]                           │                                                    │
│ └─────────────────────────────────────┘                                                    │
│                                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────┐│
│ │ CONTATOS                                                      [+ Adicionar Contato]      ││
│ │                                                                                         ││
│ │ ┌───────────────────────────────────────────────────────────────────────────────────┐   ││
│ │ │ ⭐ João Silva (Principal)                          Cargo: Gerente Comercial       │   ││
│ │ │ 📧 joao.silva@papelariaabc.com.br  │  📱 (11) 98765-4321  │  ☎️ (11) 3456-7890 │   ││
│ │ │                                                                                   │   ││
│ │ │ [✕ Remover]                                                                    │   ││
│ │ └───────────────────────────────────────────────────────────────────────────────────┘   ││
│ └─────────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────┐│
│ │ ENDEREÇO                                                                           ││
│ │                                                                                         ││
│ │ CEP *                              [🔍 Buscar]                                        ││
│ │ [01310-100                      ]                                                     ││
│ │                                                                                         ││
│ │ Logradouro *                           Número *        Complemento                   ││
│ │ [Avenida Paulista                      ] [1000      ]   [Sala 1501         ]           ││
│ │                                                                                         ││
│ │ Bairro *                        Cidade *                Estado *                        ││
│ │ [Bela Vista                     ] [São Paulo         ] [SP                        ▼]   ││
│ └─────────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────┐│
│ │ DADOS BANCÁRIOS                                                 [+ Adicionar Conta]      ││
│ │                                                                                         ││
│ │ ┌───────────────────────────────────────────────────────────────────────────────────┐   ││
│ │ │ Banco: 001 - Banco do Brasil    Agência: 1234-5    Conta: 123456-7               │   ││
│ │ │ ⭐ Principal    Tipo: Corrente    Pix: CNPJ                                      │   ││
│ │ │ [✕]                                                                         │   ││
│ │ └───────────────────────────────────────────────────────────────────────────────────┘   ││
│ └─────────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────┐│
│ │ CONFIGURAÇÕES                                                                       ││
│ │                                                                                         ││
│ │ Condição de Pagamento Padrão                                                        ││
│ │ [30/60/90 dias                                                                    ▼] ││
│ │                                                                                         ││
│ │ Observações Internas                                                                ││
│ │ ┌─────────────────────────────────────────────────────────────────────────────────┐ ││
│ │ │ Fornecedor principal de material de escritório. Desconto de 5% para pagamento  │ ││
│ │ │ à vista. Entrega em até 48h após confirmação do pedido.                        │ ││
│ │ └─────────────────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                                         ││
│ │ ☑ Fornecedor ativo                                                                  ││
│ └─────────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                             │
│                                            [Cancelar]                    [Salvar Fornecedor]│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Funcionalidades:
- ✅ Radio para Tipo (PJ/PF) com campos dinâmicos
- ✅ Máscara de CNPJ/CPF
- ✅ Campos de razão social, nome fantasia
- ✅ Select de categoria
- ✅ Sistema de avaliação por estrelas interativo
- ✅ Upload de logo com preview
- ✅ Preview em tempo real do card do fornecedor
- ✅ Adicionar/remover múltiplos contatos dinamicamente
- ✅ Busca automática de CEP (simulada)
- ✅ Preenchimento automático de endereço
- ✅ Adicionar/remover múltiplas contas bancárias
- ✅ Seleção de banco via select
- ✅ Campo Pix com tipo (CNPJ, CPF, Email, Celular, Aleatória)
- ✅ Select de condição de pagamento
- ✅ Textarea de observações
- ✅ Checkbox de status ativo/inativo
- ✅ Validação de campos obrigatórios
- ✅ Estados de loading durante "submit"

### 4.3 Visualização de Fornecedor (Drawer)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ Tech Distribuidora Ltda.                                               [✕]  [✏️ Editar]     │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│ ┌─────────────────────────────────────┐  ┌────────────────────────────────────────────────┐ │
│ │ [Logo Grande]                       │  │ RESUMO                                        │ │
│ │                                     │  │                                                │ │
│ │ ⭐⭐⭐⭐⭐ 5.0 (12 avaliações)      │  │ 📦 Total de Pedidos: 145                      │ │
│ │                                     │  │ 💰 Valor Total Comprado: R$ 245.890,00          │ │
│ │ CNPJ: 12.345.678/0001-90           │  │ 📊 Ticket Médio: R$ 1.695,00                  │ │
│ │ IE: 123.456.789.0                  │  │ ⏰ Última Compra: 10/03/2026                    │ │
│ │                                     │  │                                                │ │
│ │ 🟢 Ativo desde 15/01/2024          │  │ 🏷️ Categorias:                                │ │
│ │                                     │  │ Eletrônicos, Tecnologia                        │ │
│ └─────────────────────────────────────┘  └────────────────────────────────────────────────┘ │
│                                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ CONTATOS                                                                                 │ │
│ │                                                                                          │ │
│ │ ┌────────────────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ ⭐ João Silva (Principal)           Gerente Comercial                           │ │ │
│ │ │    📧 joao.silva@techdist.com.br  │  📱 (11) 98765-4321  │  ☎️ (11) 3456-7890 │ │ │
│ │ │    [📋 Copiar]  [📧 Email]  [📱 WhatsApp]                                        │ │ │
│ │ └────────────────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ENDEREÇO                                                                                 │ │
│ │ 📍 Avenida Paulista, 1000 - Sala 1501                                                  │ │
│ │    Bela Vista - São Paulo/SP - CEP: 01310-100                                          │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ HISTÓRICO DE COMPRAS                                       [Ver Todos →]               │ │
│ │                                                                                          │ │
│ │ Pedido      Data         Produtos    Valor       Status        Ações                   │ │
│ │ ───────────────────────────────────────────────────────────────────────────────────────│ │
│ │ #EST-2456   10/03/2026   12 itens    R$ 15.430,00  ✅ Recebido    [👁] [📄]        │ │
│ │ #EST-2434   25/02/2026   8 itens     R$ 8.950,00   ✅ Recebido    [👁] [📄]        │ │
│ │ #EST-2389   10/02/2026   15 itens    R$ 22.100,00  ✅ Recebido    [👁] [📄]        │ │
│ │ #EST-2356   28/01/2026   6 itens     R$ 4.560,00   ⏳ Pendente    [👁] [📄]        │ │
│ │                                                                                          │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                              │
│      [Inativar Fornecedor]           [📄 Gerar Relatório]           [✏️ Editar Fornecedor]  │
│                                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Funcionalidades:
- ✅ Header com logo, nome e rating
- ✅ Resumo com métricas (pedidos, valor total, ticket médio)
- ✅ Lista de contatos com ações (copiar, email, WhatsApp)
- ✅ Endereço completo formatado
- ✅ Histórico de compras com paginação
- ✅ Ações: Inativar, Gerar Relatório, Editar

---

## 5. Wireframes Descritivos

### 5.1 Card de Fornecedor (Grid)

```tsx
// app/components/fornecedores/SupplierCard.tsx

interface SupplierCardProps {
  supplier: Supplier;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Estrutura visual:
// ┌────────────────────────────────────────┐
// │ [🏢 Logo]         [⭐⭐⭐⭐☆ 4.5]  [⋮] │
// │                                        │
// │ Papelaria ABC Ltda                     │
// │ CNPJ: 12.345.678/0001-90              │
// │                                        │
// │ 📧 email@papelaria.com                 │
// │ 📱 (11) 98765-4321                    │
// │ 📍 São Paulo, SP                      │
// │                                        │
// │ [Materiais] [Escritório]               │
// │                                        │
// │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
// │ 💰 R$ 125.000/ano    📋 45 compras     │
// │                                        │
// │ [🟢 Ativo]                            │
// │                                        │
// │ [Ver detalhes]  [✏️]  [🗑️]           │
// └────────────────────────────────────────┘
```

### 5.2 Rating de Fornecedor

```tsx
// app/components/fornecedores/SupplierRating.tsx

interface SupplierRatingProps {
  value: number; // 1-5
  onChange?: (value: number) => void;
  readonly?: boolean;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Visual: ⭐⭐⭐⭐☆ 4.5
// Click para alterar (se não readonly)
```

### 5.3 Lista de Contatos

```tsx
// app/components/fornecedores/ContactList.tsx

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  mobile?: string;
  isPrimary: boolean;
}

interface ContactListProps {
  contacts: Contact[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onEdit: (contact: Contact) => void;
  onSetPrimary: (id: string) => void;
}

// Card de contato individual:
// ┌────────────────────────────────────────────────────┐
// │ ⭐ João Silva (Principal)           Gerente         │
// │ 📧 joao@email.com  │  📱 (11) 98765-4321        │
// │ ☎️ (11) 3456-7890                                │
// │                                                [✕]│
// └────────────────────────────────────────────────────┘
```

### 5.4 CEP Search

```tsx
// app/components/fornecedores/CEPSearch.tsx

interface AddressData {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface CEPSearchProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound: (address: AddressData) => void;
  onError: (error: string) => void;
}

// Estados:
// 1. Input vazio - placeholder "Digite o CEP"
// 2. Digitando - máscara automática (00000-000)
// 3. Buscando - spinner no botão
// 4. Encontrado - preenche campos automaticamente
// 5. Não encontrado - mensagem de erro
```

---

## 6. Mock Data

### 6.1 Fornecedores

```typescript
// app/lib/mock/suppliers.ts

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Tech Distribuidora Ltda',
    legalName: 'Tech Distribuidora Comercio de Eletronicos Ltda',
    document: '12.345.678/0001-90',
    documentType: 'cnpj',
    category: 'tecnologia',
    rating: 4.8,
    ratingCount: 23,
    status: 'active',
    email: 'contato@techdist.com.br',
    phone: '(11) 3456-7890',
    address: {
      cep: '01310-100',
      street: 'Avenida Paulista',
      number: '1000',
      complement: 'Sala 1501',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    },
    contacts: [
      {
        id: 'cont-001',
        name: 'João Silva',
        role: 'Gerente Comercial',
        email: 'joao.silva@techdist.com.br',
        phone: '(11) 3456-7890',
        mobile: '(11) 98765-4321',
        isPrimary: true
      },
      {
        id: 'cont-002',
        name: 'Maria Santos',
        role: 'Vendedora',
        email: 'maria.santos@techdist.com.br',
        phone: '(11) 3456-7891',
        mobile: '(11) 98765-4322',
        isPrimary: false
      }
    ],
    bankAccounts: [
      {
        id: 'bank-001',
        bank: '001',
        bankName: 'Banco do Brasil',
        agency: '1234-5',
        account: '123456-7',
        accountType: 'checking',
        pixKey: '12.345.678/0001-90',
        pixType: 'cnpj',
        isPrimary: true
      }
    ],
    paymentTerms: '30/60/90',
    notes: 'Fornecedor principal de eletrônicos. Entrega em 48h.',
    logo: null,
    totalPurchases: 145,
    totalSpent: 245890.00,
    lastPurchase: '2026-03-10',
    averageTicket: 1695.79,
    createdAt: '2024-01-15',
    updatedAt: '2026-03-10'
  },
  {
    id: 'sup-002',
    name: 'Papelaria ABC',
    legalName: 'ABC Papelaria e Escritorio Ltda',
    document: '98.765.432/0001-21',
    documentType: 'cnpj',
    category: 'materiais',
    rating: 4.2,
    ratingCount: 15,
    status: 'active',
    email: 'vendas@papelariaabc.com.br',
    phone: '(21) 2543-2109',
    address: {
      cep: '20040-001',
      street: 'Rua da Quitanda',
      number: '89',
      complement: 'Loja A',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ'
    },
    contacts: [
      {
        id: 'cont-003',
        name: 'Carlos Oliveira',
        role: 'Proprietário',
        email: 'carlos@papelariaabc.com.br',
        phone: '(21) 2543-2109',
        mobile: '(21) 98765-4321',
        isPrimary: true
      }
    ],
    bankAccounts: [],
    paymentTerms: '28/56',
    notes: '',
    logo: null,
    totalPurchases: 67,
    totalSpent: 45320.00,
    lastPurchase: '2026-02-28',
    averageTicket: 676.42,
    createdAt: '2024-03-20',
    updatedAt: '2026-02-28'
  },
  {
    id: 'sup-003',
    name: 'Logística Express',
    legalName: 'Express Logistica e Transporte Ltda',
    document: '45.678.901/0001-34',
    documentType: 'cnpj',
    category: 'logistica',
    rating: 3.5,
    ratingCount: 8,
    status: 'pending',
    email: 'contato@logisticaexpress.com',
    phone: '(31) 3344-5566',
    address: {
      cep: '30130-000',
      street: 'Avenida Cristiano Machado',
      number: '1500',
      complement: 'Galpão 3',
      neighborhood: 'Vila Cloris',
      city: 'Belo Horizonte',
      state: 'MG'
    },
    contacts: [],
    bankAccounts: [],
    paymentTerms: '',
    notes: 'Aguardando documentação completa.',
    logo: null,
    totalPurchases: 0,
    totalSpent: 0,
    lastPurchase: null,
    averageTicket: 0,
    createdAt: '2026-03-15',
    updatedAt: '2026-03-15'
  }
];

export const mockCategories = [
  { id: 'materiais', name: 'Materiais', count: 12 },
  { id: 'tecnologia', name: 'Tecnologia', count: 8 },
  { id: 'logistica', name: 'Logística', count: 5 },
  { id: 'servicos', name: 'Serviços', count: 9 },
  { id: 'vestuario', name: 'Vestuário', count: 4 },
  { id: 'alimentacao', name: 'Alimentação', count: 3 },
  { id: 'moveis', name: 'Móveis', count: 2 },
  { id: 'embalagens', name: 'Embalagens', count: 2 }
];
```

### 6.2 Tipos TypeScript

```typescript
// app/types/suppliers.ts

export type SupplierStatus = 'active' | 'inactive' | 'pending';
export type DocumentType = 'cnpj' | 'cpf';
export type BankAccountType = 'checking' | 'savings';
export type PixType = 'cnpj' | 'cpf' | 'email' | 'phone' | 'random';

export interface Supplier {
  id: string;
  name: string;
  legalName: string;
  document: string;
  documentType: DocumentType;
  category: string;
  rating: number;
  ratingCount: number;
  status: SupplierStatus;
  email?: string;
  phone?: string;
  address: Address;
  contacts: Contact[];
  bankAccounts: BankAccount[];
  paymentTerms?: string;
  notes?: string;
  logo?: string | null;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase: string | null;
  averageTicket: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary: boolean;
}

export interface BankAccount {
  id: string;
  bank: string;
  bankName: string;
  agency: string;
  account: string;
  accountType: BankAccountType;
  pixKey?: string;
  pixType?: PixType;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}
```

---

## 7. Fluxo de Usuário

### 7.1 Fluxo Principal: Cadastro de Fornecedor

```
┌─────────────────┐
│   Fornecedores   │
│   (Listagem)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ [+ Novo]        │──── Clica botão
│ Fornecedor     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Formulário      │
│ (Dados Basics)  │──── Preenche CNPJ
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CNPJ Válido?   │
│                 │
│ [Sim] ──────────► Preenche razão social
│   │              automaticamente
│ [Não] ──────────► Mostra erro
│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Adiciona       │
│ Contatos       │──── Adiciona múltiplos
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Busca CEP      │──── Digita CEP + Enter
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Endereço       │
│ Preenchido     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Adiciona       │
│ Dados Bancários│──── (Opcional)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Salva          │
│ Fornecedor     │──── Salva → Volta p/ listagem
└─────────────────┘
```

### 7.2 Fluxo Secundário: Visualização e Edição

```
┌─────────────────┐
│  Listagem      │
│  Fornecedores  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ [Ver detalhes] │──── Clica card
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Drawer         │
│ Detalhes      │──── Visualiza histórico,
└────────┬────────┘        métricas, contatos
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│[Editar]│ │[Fechar]│
└───┬────┘ └────────┘
    │
    ▼
┌───────────────┐
│ Página       │
│ Edição       │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Salvar       │──── Retorna ao Drawer
│ Alterações   │        com dados atualizados
└───────────────┘
```

---

## 8. Dependências

### 8.1 Bibliotecas Necessárias

```json
{
  "dependencies": {
    "lucide-react": "^0.400.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "date-fns": "^3.6.0"
  }
}
```

| Biblioteca | Versão | Propósito |
|------------|--------|-----------|
| `lucide-react` | ^0.400.0 | Ícones (já incluso no projeto) |
| `react-hook-form` | ^7.51.0 | Gerenciamento de formulários |
| `@hookform/resolvers` | ^3.3.4 | Resolvers para validação |
| `zod` | ^3.22.4 | Validação de schema |
| `date-fns` | ^3.6.0 | Formatação de datas |

### 8.2 Componentes shadcn/ui Necessários

- ✅ `Dialog` - Modal de confirmação de exclusão
- ✅ `Sheet` - Drawer lateral de detalhes
- ✅ `Button` - Botões de ação
- ✅ `Input` - Campos de texto
- ✅ `Select` - Dropdowns de categoria, banco, estado
- ✅ `Textarea` - Campo de observações
- ✅ `Checkbox` - Status ativo, tipo de conta
- ✅ `RadioGroup` - Seleção PJ/PF
- ✅ `Badge` - Tags de categoria e status
- ✅ `Avatar` - Logo do fornecedor
- ✅ `ScrollArea` - Scroll em listas longas
- ✅ `Separator` - Divisores de seção
- ✅ `Skeleton` - Loading states
- ✅ `Tabs` - Tabs do formulário
- ✅ `Tooltip` - Tooltips informativos
- ✅ `Table` - Tabela de histórico

### 8.3 Componentes Internos Existentes

- ✅ `Sidebar` - Menu lateral
- ✅ `Header` - Cabeçalho da página

---

## 9. Regras de Negócio (Frontend)

### 9.1 Documentos

| Campo | Obrigatório | Validação | Máscara |
|-------|-------------|-----------|---------|
| CNPJ | Sim (PJ) | 14 dígitos | `00.000.000/0000-00` |
| CPF | Sim (PF) | 11 dígitos | `000.000.000-00` |
| IE | Não | - | Alphanumeric |

### 9.2 Endereço

| Campo | Obrigatório | Validação |
|-------|-------------|-----------|
| CEP | Sim | 8 dígitos |
| Logradouro | Sim | - |
| Número | Sim | - |
| Complemento | Não | - |
| Bairro | Sim | - |
| Cidade | Sim | - |
| Estado | Sim | UF válido |

### 9.3 Contatos

- Mínimo: 0 contatos (opcional)
- Máximo: Ilimitado
- Nome: Obrigatório se existir contato
- Email: Formato válido se preenchido
- Telefone: Formato brasileiro
- Apenas 1 contato pode ser "Principal"

### 9.4 Dados Bancários

- Todos campos opcionais
- Campos obrigatórios se qualquer dado for preenchido: Banco, Agência, Conta
- Pix pode ser: CNPJ, CPF, Email, Celular, ou Chave Aleatória

### 9.5 Status do Fornecedor

| Status | Descrição | Comportamento |
|--------|-----------|---------------|
| `active` | Fornecedor ativo | Visível em todas as operações |
| `inactive` | Fornecedor inativo | Oculto de novas operações, histórico preservado |
| `pending` | Cadastro incompleto | Aguarda preenchimento completo |

---

## 10. Checklist de Implementação

### ✅ Páginas
- [ ] `/fornecedores` - Listagem com grid
- [ ] `/fornecedores/novo` - Cadastro
- [ ] `/fornecedores/[id]` - Detalhes (pode usar drawer)
- [ ] `/fornecedores/[id]/editar` - Edição

### ✅ Componentes Core
- [ ] `SupplierCard` - Card do fornecedor
- [ ] `SupplierGrid` - Grid responsivo
- [ ] `SupplierFilters` - Filtros e busca
- [ ] `SupplierForm` - Formulário completo
- [ ] `SupplierDetailsDrawer` - Drawer de detalhes
- [ ] `SupplierRating` - Sistema de estrelas
- [ ] `ContactList` - Gerenciamento de contatos
- [ ] `BankAccountList` - Dados bancários
- [ ] `CEPSearch` - Busca de CEP
- [ ] `SupplierStats` - Cards de métricas

### ✅ Estados Visuais
- [ ] Loading states (skeleton)
- [ ] Empty states ("Nenhum fornecedor")
- [ ] Error states (CNPJ inválido, CEP não encontrado)
- [ ] Success states (fornecedor salvo)

### ✅ Funcionalidades
- [ ] CRUD completo (Create, Read, Update, Delete)
- [ ] Máscara de CNPJ/CPF
- [ ] Busca de CEP
- [ ] Sistema de rating interativo
- [ ] Múltiplos contatos
- [ ] Múltiplas contas bancárias
- [ ] Tabs no formulário
- [ ] Preview do card
- [ ] Paginação

### ✅ Validações
- [ ] Campos obrigatórios
- [ ] Formato de CNPJ/CPF
- [ ] Formato de email
- [ ] Formato de telefone
- [ ] CEP válido

### ✅ Responsividade
- [ ] Desktop: Grid 3 colunas
- [ ] Tablet: Grid 2 colunas
- [ ] Mobile: 1 coluna, drawer fullscreen

### ✅ Acessibilidade
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Contraste WCAG 2.1 AA
- [ ] Focus management
- [ ] Screen reader friendly

---

## 11. URLs das Telas

| Tela | Rota | Acesso |
|------|------|--------|
| Listagem | `/fornecedores` | Admin |
| Novo | `/fornecedores/novo` | Admin |
| Detalhes | `/fornecedores/[id]` | Admin |
| Edição | `/fornecedores/[id]/editar` | Admin |

---

## 12. Estrutura de Arquivos

```
app/
├── fornecedores/
│   ├── page.tsx                          # Listagem principal
│   ├── novo/
│   │   └── page.tsx                      # Cadastro
│   └── [id]/
│       ├── page.tsx                      # Detalhes (opcional)
│       └── editar/
│           └── page.tsx                  # Edição
│
├── components/
│   └── fornecedores/
│       ├── SupplierGrid.tsx              # Grid de fornecedores
│       ├── SupplierCard.tsx              # Card individual
│       ├── SupplierFilters.tsx           # Filtros e busca
│       ├── SupplierForm.tsx              # Formulário completo
│       ├── SupplierDetailsDrawer.tsx      # Drawer de detalhes
│       ├── SupplierRating.tsx             # Sistema de rating
│       ├── SupplierStats.tsx              # Cards de estatísticas
│       ├── ContactList.tsx                # Lista de contatos
│       ├── ContactCard.tsx                # Card de contato
│       ├── BankAccountList.tsx            # Lista de contas
│       ├── BankAccountCard.tsx             # Card de conta
│       ├── CEPSearch.tsx                  # Busca de CEP
│       ├── PurchaseHistory.tsx             # Histórico de compras
│       ├── SupplierFormBasic.tsx           # Aba: Dados básicos
│       ├── SupplierFormAddress.tsx          # Aba: Endereço
│       ├── SupplierFormContacts.tsx         # Aba: Contatos
│       ├── SupplierFormBank.tsx             # Aba: Dados bancários
│       └── SupplierFormSettings.tsx         # Aba: Configurações
│
├── hooks/
│   ├── use-suppliers.ts                  # CRUD de fornecedores
│   ├── use-supplier-form.ts               # Estado do formulário
│   └── use-cep-search.ts                  # Busca de CEP
│
├── lib/
│   ├── mock/
│   │   └── suppliers.ts                   # Mock data
│   └── utils/
│       ├── document-mask.ts              # Máscaras de documento
│       └── validators.ts                  # Validações
│
└── types/
    └── suppliers.ts                       # Tipos TypeScript
```

---

## 13. Notas de Implementação

### 13.1 Prioridade de Desenvolvimento

1. **Alta:**
   - Página de listagem com grid
   - Card de fornecedor
   - Formulário de cadastro completo
   - Modal de visualização

2. **Média:**
   - Sistema de rating
   - Busca de CEP
   - Múltiplos contatos
   - Múltiplas contas bancárias

3. **Baixa:**
   - Preview em tempo real
   - Histórico de compras
   - Estatísticas detalhadas

### 13.2 Considerações Técnicas

- Usar `react-hook-form` + `zod` para validação
- Implementar máscara de CNPJ/CPF com `onChange`
- Mock data deve simular comportamento real
- Manter consistência com design system existente
- Usar variáveis CSS do tema UNIQ (`bg-uniq-*`)
- Consumir cores semânticas para status

### 13.3 Integrações Futuras (Backend)

- Supabase para persistência
- API ViaCEP para busca de endereço
- API ReceitaWS para validação de CNPJ
- Storage para upload de logos

---

## 14. Anexos

### 14.1 Máscaras de Input

```typescript
// CNPJ: 00.000.000/0000-00
const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

// CPF: 000.000.000-00
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1-$2')
    .slice(0, 14);
};

// CEP: 00000-000
const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

// Telefone: (00) 00000-0000
const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};
```

### 14.2 Mock de CEP (Simulado)

```typescript
// app/lib/mock/cep.ts

export const mockCEPData: Record<string, CEPResult> = {
  '01310-100': {
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP'
  },
  '20040-001': {
    cep: '20040-001',
    logradouro: 'Rua da Quitanda',
    bairro: 'Centro',
    cidade: 'Rio de Janeiro',
    estado: 'RJ'
  }
};
```

---

**Fim do PRD**

*Documento criado em: 2026-03-21*  
*Baseado em: docs/ui/modulo-04-financeiro-fornecedores.md, docs/ui/modulo-05-estoque-fornecedores.md*  
*Referência: docs/ROADMAP.md - Sprint 08*
