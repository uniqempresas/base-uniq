# WIRE — Delta: Edição de Cliente (dados básicos)

> **Origem:** feedback do fundador (11/09/2026) — botão "Editar" de cliente é apenas visual.
> PRD: `tracking/plans/PRD-UsoReal-EditarCliente.md` · SPEC: `tracking/specs/SPEC-UsoReal-EditarCliente.md`
>
> **Nota:** as telas e o modal de cadastro já existem. Este WIRE é um **delta** seguindo o precedente de `WIRE-UsoReal-DoceE-DRE-FluxoCaixa.md` — **não há mudança de layout**, apenas:
> 1. O modal "Novo Cliente" (hoje embutido em `ClientesPage.tsx:146-304`) vira componente compartilhado `ClienteFormModal`, reutilizado no modo **editar** (pré-preenchido)
> 2. Os gatilhos de edição que hoje são inertes passam a abrir o modal: Edit2 do card, Edit2 da tabela e botão "Editar" do detalhe
> 3. Salvar no modo editar grava UPDATE em `crm_leads` (hooks `useAtualizarCliente` novo), recarrega lista/detalhe e mostra toast
>
> **Regra de fallback (07/09/2026):** mock apenas em modo demo (sem sessão autenticada). Com sessão, dados reais; sem `empresa_id` resolvido, hooks **falham com erro explícito** e NÃO gravam.

---

## Tela: Lista de Clientes (`/crm/clientes`)

### Estrutura atual (SEM mudança de layout)

```
┌───────────────────────────────────────────────────────────────┐
│  CLIENTES                                                    │
│  Clientes                                [+ Novo cliente]     │
│  [Cards 3-2-1 col]  e/ou  [Tabela]  + busca + aba origem      │
├───────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  Card (hover):                           │
│  │ nome         │   ✏️ Editar  ⧉ Copiar  🗑 Excluir         │
│  │ tags...      │   → ✏️ (hoje sem ação) passa a ABRIR modal│
│  └──────────────┘                                           │
├───────────────────────────────────────────────────────────────┤
│  Tabela:  nome │ origem │ … │ [WhatsApp] [✏️] [🗑]            │
│                                     → ✏️ passa a ABRIR modal  │
└───────────────────────────────────────────────────────────────┘
```

### Mudanças funcionais

| Ação | Hoje | Após |
|------|------|------|
| Edit2 no card (ClientesPage.tsx:104-109) | só `e.stopPropagation()`, sem ação | `setClienteParaEditar(c)` → abre `ClienteFormModal` em modo editar |
| Edit2 na tabela (linha 704-706) | sem onClick | `setClienteParaEditar(c)` → abre modal |
| WhatsApp na tabela (linha 701-703) | inerte | abre `https://wa.me/55{telefone}` (consistente com o card) |
| Trash2 (card e tabela) | inerte | **fora do escopo** — manter inerte (PRD §5) |
| Novo cliente | modal embutido `NovoClienteModal` | mesmo modal via `ClienteFormModal` (modo criar, comportamento idêntico) |

### Modal (layout atual mantido — pré-preenchido no modo editar)

```
┌───────────────────────────────────────────────┐
│  Editar Cliente                        [X]     │  ← criar: "Novo Cliente"
│  Atualize os dados do cliente                  │
├───────────────────────────────────────────────┤
│  Tipo  ( PF ) ( PJ )                           │  ← pré-selecionado do cliente
│  Nome completo * [________________________]    │  ← pré-preenchido
│  Telefone/WhatsApp [______________]            │  ← pré-preenchido
│  E-mail            [______________]            │  ← pré-preenchido
│  Tags              [tag] [tag] + adicionar     │  ← pré-preenchido (sem "WhatsApp")
├───────────────────────────────────────────────┤
│  ⚠️ msg de erro inline (se falhar)             │
│                         [Cancelar] [Salvar alterações]  ← criar: "Salvar cliente"
└───────────────────────────────────────────────┘
```

> **⚠️ Armadilha da tag derivada "WhatsApp":** a UI injeta a tag `"WhatsApp"` quando `origem === "whatsapp"` — ela NÃO existe na coluna `tags` do banco. Ao popular o form de edição, **remover** `"WhatsApp"` das tags iniciais, senão salvar gravaria a tag fantasma (duplicada após recarregar).

---

## Tela: Detalhe do Cliente (`/crm/clientes/:id`)

### Estrutura atual (SEM mudança de layout)

```
┌───────────────────────────────────────────────────────────────┐
│  ‹ Voltar        nome                                  [✏️ Editar] ← hoje sem ação → ABRE modal
│  tags · origem · status · …                                    │
├───────────────────────────────────────────────────────────────┤
│  [Informações] [Interações] …   (abas existentes)             │
└───────────────────────────────────────────────────────────────┘
```

### Mudanças funcionais

| Ação | Hoje | Após |
|------|------|------|
| Botão "Editar" (ClienteDetalhePage.tsx:721-724) | sem onClick | `setClienteParaEditar(clienteExibido)` → abre modal pré-preenchido |
| Salvar no modo editar | — | `atualizarCliente({ id, nome, telefone, email, tags })` → recarregar() + toast "Cliente atualizado com sucesso!" |

---

## Estados (modo editar — novos)

| Estado | Comportamento |
|--------|---------------|
| **Loading (salvar)** | Botão "Salvar alterações" → `Loader2 animate-spin` + "Salvando...", desabilitado |
| **Error (salvar)** | Mensagem inline `text-xs text-red-600` acima dos botões; `setErro("")` no início do submit |
| **Error (sem tenant)** | Hook falha com erro explícito ("Empresa não identificada...") e **não grava** — sem fallback cego |
| **Success** | Modal fecha → lista/detalhe recarrega → toast de sucesso |

---

## Fluxo de dados

```
Lista/Detalhe (Cliente com tags)
   └─ Edit2/"Editar" → setClienteParaEditar(cliente)
        └─ ClienteFormModal (modo editar)
             ├─ estado inicial ← cliente (tags filtradas sem "WhatsApp")
             ├─ Salvar → useAtualizarCliente().atualizarCliente({ id, nome, telefone, email, tags })
             │     └─ UPDATE crm_leads SET nome, telefone, email, tags
             │          WHERE id = $id AND empresa_id = $empresaId
             └─ onSuccess → fecha modal + recarregar() + toast
```

Campos editáveis limitados a `nome`, `telefone`, `email`, `tags` — exatamente o form do cadastro. `status`, `origem`, `ultima_interacao`, `ltv` NÃO são alterados.

---

## Fora de escopo

- ❌ Exclusão de cliente (Trash2 permanece inerte)
- ❌ Alterar origem/status/LTV
- ❌ Mudança de layout ou redesenho do modal (copiar markup existente)
- ❌ Backend/RLS/migrations (`src/lib/supabase.ts` intocado)

---

*WIRE delta aprovado em 11/09/2026 — sem alteração de layout, apenas modal compartilhado + gatilhos de edição + UPDATE em `crm_leads`. Detalhes técnicos: `SPEC-UsoReal-EditarCliente.md` §1–§6. O mesmo WIRE serve de base para o fluxo de edição de PRODUTOS (mesma mecânica de formulário compartilhado + gatilhos de edição).*