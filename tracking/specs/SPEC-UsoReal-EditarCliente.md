# SPEC — Uso Real Doceê: Edição de Cliente (dados básicos)

> **PRD:** `tracking/plans/PRD-UsoReal-EditarCliente.md`
> **WIRE:** `tracking/wireframe/WIRE-UsoReal-EditarCliente.md`
> **Origem:** feedback do fundador (11/09/2026) — botão "Editar" de cliente é apenas visual.
> **Supabase oficial:** `krrkfgvdwhpelxtrdtla.supabase.co` (já configurado em `src/lib/supabase.ts` — NÃO alterar).

---

## 0. Contexto mínimo

- App Vite + React multi-tenant. `useAuth()` expõe `{ user, session, perfil, empresa, loading }`.
- **Mock-first (07/09/2026):** mock só em modo demo (sem sessão). Com sessão, dados reais; sem `empresa_id` resolvido, hooks **falham com erro explícito** e NÃO gravam.
- `crm_leads` (colunas reais confirmadas): `id uuid PK`, `empresa_id uuid NOT NULL`, `nome text NOT NULL`, `email text?`, `telefone text?`, `origem text?`, `status text? default 'Novo'`, `created_at timestamptz?`, `observacoes text?`, `foto_url text?`, `cargo text?`, `empresa_nome text?`, `ltv numeric? default 0`, `ultima_interacao timestamptz?`, `tags text[]? default '{}'`.

---

## 1. Arquivos

### Modificados
- [ ] `src/app/hooks/use-cliente.ts` — adicionar `recarregar()` ao retorno (espelhando `use-clientes.ts`)
- [ ] `src/app/components/crm/ClientesPage.tsx` — extrair `NovoClienteModal` para componente compartilhado; disparar edição dos botões de cards e tabela
- [ ] `src/app/components/crm/ClienteDetalhePage.tsx` — wire do botão "Editar" (linha ~721-724) + recarga após salvar

### Criados
- [ ] `src/app/hooks/use-atualizar-cliente.ts` — UPDATE em `crm_leads`
- [ ] `src/app/components/crm/ClienteFormModal.tsx` — modal compartilhado novo/editar (extraído do `NovoClienteModal`)

---

## 2. Hook `use-atualizar-cliente.ts`

Espelhar `use-criar-cliente.ts` (mesma estrutura, validação de tenant, sem fallback cego):

```ts
// src/app/hooks/use-atualizar-cliente.ts
import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface AtualizarClienteParams {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  tags?: string[];
}

export interface AtualizarClienteResult {
  success: boolean;
  error?: string;
}

export function useAtualizarCliente() {
  const { empresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atualizarCliente = useCallback(
    async (params: AtualizarClienteParams): Promise<AtualizarClienteResult> => {
      setLoading(true);
      setError(null);

      try {
        // SEM fallback cego: sem tenant autenticado, não gravar.
        const empresaId = empresa?.id;
        if (!empresaId) {
          throw new Error("Empresa não identificada para este usuário. Recarregue a página ou faça login novamente.");
        }

        const nome = params.nome.trim();
        if (!nome) {
          throw new Error("Informe o nome do cliente.");
        }

        const { error: updateError } = await supabase
          .from("crm_leads")
          .update({
            nome,
            telefone: params.telefone?.trim() || null,
            email: params.email?.trim() || null,
            tags: params.tags || [],
          })
          .eq("id", params.id)
          .eq("empresa_id", empresaId);   // isolamento por tenant obrigatório

        if (updateError) throw updateError;

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [empresa]
  );

  return { atualizarCliente, loading, error };
}
```

> **Observações de mapeamento:** campos editáveis limitados a `nome`, `telefone`, `email`, `tags` — exatamente o form do cadastro. `status`, `origem`, `ultima_interacao`, `ltv` etc. NÃO são alterados pela edição. `telefone` vazio vira `null` (mesma regra do create).

---

## 3. Componente `ClienteFormModal.tsx` (extraído + generalizado)

**Extrair** o `NovoClienteModal` de `ClientesPage.tsx:146-304` para `src/app/components/crm/ClienteFormModal.tsx` SEM alterar o layout/markup (regra: wireframe entrega estrutura, design real no OpenDesign).

**Assinatura nova:**

```tsx
interface ClienteFormModalProps {
  cliente?: Cliente | null;   // null/undefined = modo criar; Cliente = modo editar
  tags: Tag[];
  onClose: () => void;
  onSuccess: () => void;      // tela fecha o modal e recarrega/atualiza
}
```

**Diferenças por modo:**

| Ponto | Criar (hoje) | Editar (novo) |
|-------|--------------|---------------|
| Título | "Novo Cliente" / "Preencha as informações básicas" | "Editar Cliente" / "Atualize os dados do cliente" |
| Estado inicial | `{ nome: "", telefone: "", email: "", tags: [] }` | `{ nome: cliente.nome, telefone: cliente.telefone, email: cliente.email, tags: tagsIniciais }` |
| Tipo PF/PJ | default "PF" | `cliente.tipo` (ou "PF" se ausente) |
| Hook | `useCriarCliente()` → `criarCliente` | `useAtualizarCliente()` → `atualizarCliente({ id, nome, telefone, email, tags })` |
| Texto botão salvar | "Salvar cliente" / "Salvando..." | "Salvar alterações" / "Salvando..." |

**⚠️ Armadilha da tag derivada "WhatsApp":** em `use-cliente.ts:81` e `use-clientes.ts:81`, a tag `"WhatsApp"` é *injetada pela UI* quando `origem === "whatsapp"` — NÃO existe na coluna `tags` do banco. Ao popular o form de edição, **remover `"WhatsApp"` da lista de tags iniciais**:

```ts
const tagsIniciais = cliente ? cliente.tags.filter((t) => t !== "WhatsApp") : [];
```

Caso contrário, salvar a edição gravaria a tag fantasma `"WhatsApp"` na coluna `tags` (duplicada após recarregar).

**Estados:** loading no botão salvar (`Loader2` animate-spin), erro inline (`text-xs text-red-600`), `setErro("")` no início do submit. Mesmo markup do modal atual: overlay `bg-black/50 z-50`, card `max-w-md rounded-2xl`, header com botão X, form `space-y-4`, botões Cancelar/Salvar flex-1.

---

## 4. Wiring — `ClientesPage.tsx`

### 4.1 Novo state
```ts
const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
```

### 4.2 Modal compartilhado (substitui `NovoClienteModal`)
```tsx
{showNovoCliente && (
  <ClienteFormModal
    tags={tagsConfig}
    onClose={() => setShowNovoCliente(false)}
    onSuccess={() => {
      setShowNovoCliente(false);
      showToast("Cliente cadastrado com sucesso!");
      recarregar();
    }}
  />
)}
{clienteParaEditar && (
  <ClienteFormModal
    cliente={clienteParaEditar}
    tags={tagsConfig}
    onClose={() => setClienteParaEditar(null)}
    onSuccess={() => {
      setClienteParaEditar(null);
      showToast("Cliente atualizado com sucesso!");
      recarregar();
    }}
  />
)}
```

### 4.3 Card (hover) — `ClienteCard` recebe `onEdit`
- Adicionar prop `onEdit: () => void` a `ClienteCard` (linha 60).
- Botão Edit2 (linha 104-109): trocar `onClick={(e) => e.stopPropagation()}` por:
  ```tsx
  onClick={(e) => { e.stopPropagation(); onEdit(); }}
  ```
- Uso (linha 632-634):
  ```tsx
  <ClienteCard
    cliente={c}
    onClick={() => navigate(`/crm/clientes/${c.id}`)}
    onEdit={() => setClienteParaEditar(c)}
  />
  ```

### 4.4 Tabela (linha 699-710)
- Botão **Edit2** (linha 704-706):
  ```tsx
  <button
    onClick={() => setClienteParaEditar(c)}
    className="w-7 h-7 rounded-lg bg-[#efefef] text-[#627271] flex items-center justify-center hover:bg-[#efefef]"
  >
    <Edit2 size={13} />
  </button>
  ```
- Botão **WhatsApp** (linha 701-703): dar o mesmo comportamento do card (abre `wa.me`) — melhoria barata e consistente:
  ```tsx
  <button
    onClick={() => window.open(`https://wa.me/55${c.whatsapp.replace(/\D/g, "")}`)}
    ...
  >
    <MessageCircle size={13} />
  </button>
  ```
- Botão **Trash2** (linha 707-709): **fora do escopo** — manter inerte (PRD §5), não criar comportamento novo.

---

## 5. Wiring — `ClienteDetalhePage.tsx`

- Adicionar `recarregar` ao `useCliente` (ver §6) e desestruturar: `const { cliente, loading, error, isFallback, recarregar } = useCliente(id);`
- Novo state: `const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);`
- Import `ClienteFormModal` e `useTags` (para `tagsConfig` — verificar se a página já usa `useTags`; se não, adicionar `const { tags: tagsConfig } = useTags();`).
- Botão "Editar" (linha 721-724): adicionar `onClick={() => setClienteParaEditar(clienteExibido)}`.
- Renderizar o modal junto aos demais (perto do `NovaInteracaoModal`, linha 212-220):
  ```tsx
  {clienteParaEditar && (
    <ClienteFormModal
      cliente={clienteParaEditar}
      tags={tagsConfig}
      onClose={() => setClienteParaEditar(null)}
      onSuccess={() => {
        setClienteParaEditar(null);
        recarregar();
        showToast("Cliente atualizado com sucesso!");
      }}
    />
  )}
  ```

---

## 6. `use-cliente.ts` — expor `recarregar`

- `carregarDados` já é `useCallback` com deps corretas. Retornar também `recarregar: carregarDados` na interface `UseClienteReturn` (linha 103-108) e no retorno (linha 188-193). Nada mais muda nesse hook.

---

## 7. Verificação (Definition of Done)

- [ ] Cards: clique no ícone Edit2 abre modal pré-preenchido; salvar atualiza e recarrega a lista + toast
- [ ] Tabela: Edit2 idem; WhatsApp abre `wa.me` com telefone do cliente
- [ ] Detalhe: botão "Editar" abre modal pré-preenchido; salvar recarrega o detalhe + toast
- [ ] Editar cliente com origem whatsapp NÃO grava tag "WhatsApp" duplicada (filtrar ao popular)
- [ ] Editar sem sessão/empresa mostra erro explícito, não grava
- [ ] Criar cliente continua funcionando (modal compartilhado em modo criar)
- [ ] `npm run build` passa; push → Vercel READY; fundador valida no celular
- [ ] Tracking `tracking/USO_REAL_DOCEE.md` e docs SDD atualizados

## 8. O que NÃO fazer

- Não tocar em `src/lib/supabase.ts`, tabelas, RLS, edge functions.
- Não implementar exclusão de cliente (Trash2).
- Não redesenhar o modal (copiar markup existente).
- Não migrar para Next.js.