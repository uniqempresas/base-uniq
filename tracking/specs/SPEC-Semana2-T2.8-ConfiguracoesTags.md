# SPEC — Configurações do CRM: Tags Personalizáveis (T2.8)

## Schema (migração)

```sql
CREATE TABLE IF NOT EXISTS public.me_tag (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.me_empresa(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cor text,                          -- cor principal (hex) p/ chip
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (empresa_id, nome)
);

ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
```

Seed: tags padrão atuais (VIP, Prospect, Inadimplente, Cliente Fiel, Lead Quente, Inativo) para cada empresa existente, com `cor` vinda de `TAG_COLORS` (`ON CONFLICT DO NOTHING`).

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/app/hooks/use-tags.ts` | **Novo** — listar/criar/desativar tags com fallback mock |
| `src/app/hooks/use-criar-cliente.ts` | **Novo** — insert em `crm_leads` com tags |
| `src/app/components/crm/ConfiguracoesCRMPage.tsx` | **Novo** — tela de gestão de tags |
| `src/app/routes.tsx` | + `/crm/configuracoes` |
| `src/app/components/crm/ClientesPage.tsx` | Modal + filtro usam `useTags()`; salvar via `useCriarCliente`; botão ⚙️ |
| `src/app/hooks/use-clientes.ts`, `use-cliente.ts` | Mapear `db.tags` → `Cliente.tags` |

## Tipos

```ts
export interface Tag { id: string; nome: string; cor?: string | null; ativo: boolean; }
```

## Hook `use-tags`

- Sem sessão → `TAGS_PADRAO` mock (`isFallback: true`).
- Logado: `SELECT * FROM me_tag WHERE empresa_id = X AND ativo = true ORDER BY nome`.
- 0 linhas → lista vazia (empty state real, nunca mock de outra empresa).
- `criarTag(nome, cor)` → insert (`UNIQUE empresa_id+nome`).
- `desativarTag(id)` → `UPDATE ativo = false`.

## Hook `use-criar-cliente`

- Exige sessão + empresa (sem fallback cego).
- Insert em `crm_leads`: `{ empresa_id, nome, telefone, email, origem: "manual", status: "novo", ultima_interacao: now(), tags }`.

## Modal "Novo Cliente"

- Tags = `useTags().tags` (antes: `TAG_OPTIONS` fixa).
- `handleSubmit` real: chama `criarCliente`, exibe erro inline, `onSuccess` do pai + recarrega lista.

## Estados visuais (DoD)

- Lista de tags: skeleton → empty ("Nenhuma tag ainda — adicione a primeira") → error (tentar novamente) → success.
- Modal: botão com spinner enquanto salva; erro inline em vermelho.

## Checklist SPEC

- [ ] `me_tag` criada com FK + UNIQUE; `crm_leads.tags` adicionada; seed aplicado
- [ ] `useTags` lista com fallback mock e isolamento por empresa
- [ ] `ConfiguracoesCRMPage` com loading/empty/error/success e soft delete
- [ ] Rota `/crm/configuracoes` registrada
- [ ] Novo Cliente persiste em `crm_leads` com tags e recarrega
- [ ] Filtro de clientes usa tags configuradas
- [ ] Build + deploy Vercel OK