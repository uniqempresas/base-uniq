# SPEC — Excluir pedido cancelado (soft delete via RPC)

> **Pipeline SDD · etapa 2 de 3.** Irmãos: `PRD-DeletarPedidoCancelado.md` · `WIRE-DeletarPedidoCancelado.md`.
> **Item 4** do lote de 17/09/2026. **Decisões do fundador: D1–D6** (ver PRD §2).

---

## 1. Arquitetura da solução

```
[Base UNIQ · detalhe ou lista]
        │  botão "Excluir pedido" (só em pedido cancelado)
        ▼
[hook use-excluir-pedido.ts]  ── chama ──▶  [RPC fn_excluir_pedido_cancelado]
                                                    │  SECURITY DEFINER
[outro consumidor: loja / n8n / automação] ────────▶│  valida tudo aqui dentro
                                                    ▼
                                     me_venda.deletado_em = now()
                                     estoque devolvido (se foi baixado)
                                     me_venda_historico += 1 linha
```

**Princípio:** **as regras vivem no banco**, não no cliente. O front só pergunta e mostra o resultado. É o que permite a mesma operação ser chamada por qualquer consumidor (D6).

---

## 2. Banco — migration

**Nome sugerido:** `20260918_excluir_pedido_cancelado`

### 2.1 Colunas de exclusão lógica em `me_venda`

```sql
ALTER TABLE public.me_venda
  ADD COLUMN IF NOT EXISTS deletado_em      timestamptz,
  ADD COLUMN IF NOT EXISTS deletado_por     uuid,
  ADD COLUMN IF NOT EXISTS motivo_exclusao  text;

-- Índice parcial: as leituras filtram por deletado_em IS NULL
CREATE INDEX IF NOT EXISTS ix_me_venda_ativos
  ON public.me_venda (empresa_id, criado_em DESC)
  WHERE deletado_em IS NULL;
```

> **Estado atual verificado:** `me_venda` **não** tem nenhuma coluna de exclusão. Colunas hoje: `id, empresa_id, cliente_id, usuario_id, valor_total, observacoes, status_venda, forma_pagamento, canal_venda, valor_desconto, possui_nota_fiscal, tipo_venda, foi_devolvida, npedido, criado_em, atualizado_em, conta_id, codigo_rastreio, motivo_cancelamento, frete`.

### 2.2 RPC `fn_excluir_pedido_cancelado`

```sql
create or replace function public.fn_excluir_pedido_cancelado(
  p_empresa_id uuid,
  p_venda_id   uuid,
  p_usuario_id uuid default null,
  p_motivo     text default null
) returns jsonb
language plpgsql
security definer
```

**Retorno padronizado** (mesmo contrato de `registrar_venda`):

```json
{ "success": true,  "id_venda": "...", "estoque_devolvido": true, "itens_restaurados": 2 }
{ "success": false, "error": "mensagem para o usuário", "code": "CODIGO" }
```

| `code` | Quando | Mensagem sugerida ao usuário |
|---|---|---|
| `NAO_ENCONTRADO` | `id` inexistente **ou** de outra empresa | "Pedido não encontrado." |
| `JA_EXCLUIDO` | `deletado_em` já preenchido | "Este pedido já foi excluído." |
| `STATUS_INVALIDO` | `status_venda <> 'cancelado'` | "Só é possível excluir pedido com status **Cancelado**." |
| `PAGAMENTO_REGISTRADO` | conta a receber vinculada com `status = 'pago'` | "Este pedido tem pagamento registrado. Excluir apagaria dinheiro que entrou de verdade." |

**Ordem das validações (importa):**

1. `select ... from me_venda where id = p_venda_id and empresa_id = p_empresa_id for update` → `NAO_ENCONTRADO` se não achar. *(O `for update` evita duas exclusões simultâneas.)*
2. `deletado_em is not null` → `JA_EXCLUIDO`.
3. `status_venda <> 'cancelado'` → `STATUS_INVALIDO`.
4. Conta a receber vinculada com `status = 'pago'` → `PAGAMENTO_REGISTRADO`.

**Efeitos (só depois de passar nas 4):**

5. **Estoque (regra R5 do PRD):** devolver **apenas se existir** conta a receber vinculada (`me_contas_receber.venda_id = p_venda_id`). Se existir:
   ```sql
   UPDATE public.me_produto p
      SET estoque_atual = p.estoque_atual + iv.quantidade
     FROM public.me_itens_venda iv
    WHERE iv.venda_id = p_venda_id
      AND iv.empresa_id = p_empresa_id
      AND p.id = iv.produto_id
      AND p.empresa_id = p_empresa_id;
   ```
   Contar as linhas afetadas → `itens_restaurados`.
6. **Soft delete:**
   ```sql
   UPDATE public.me_venda
      SET deletado_em = now(), deletado_por = p_usuario_id, motivo_exclusao = p_motivo
    WHERE id = p_venda_id;
   ```
7. **Auditoria:** `INSERT` em `me_venda_historico` com `status` = `'excluido'`, `observacao` = motivo (ou texto padrão), `responsavel_usuario_id` = `p_usuario_id`.
8. `RETURN` do jsonb de sucesso.

**`exception when others`:** capturar e devolver `{success:false, error: SQLERRM, code: 'ERRO_INTERNO'}` — nunca estourar para o cliente.

> ⚠️ **Não usar `DELETE` em nenhuma tabela.** Nada de `ON DELETE CASCADE` disparando.

---

## 3. Filtro de exclusão nos caminhos de leitura

**Regra:** toda leitura de `me_venda` que lista/detalha precisa de `.is("deletado_em", null)`.

| # | Arquivo | Linha (hoje) | O que é | Obrigatório |
|---|---|---|---|---|
| 1 | `src/app/hooks/use-pedidos.ts` | ~161 | Lista de pedidos do ERP | ✅ |
| 2 | `src/app/hooks/use-pedido.ts` | ~261 | Detalhe do pedido | ✅ |
| 3 | `src/app/hooks/use-loja-meus-pedidos.ts` | ~104 | "Meus pedidos" da loja pública | ✅ |
| 4 | `src/app/hooks/use-dre.ts` | ~101 | **DRE / receita** | ✅ **crítico** |

**Não precisam de filtro** (escrita, não leitura): `use-criar-pedido.ts` (~94) e `use-atualizar-status-pedido.ts` (~57).

> **Achado importante:** o `use-dre.ts` soma `me_venda` como receita. Sem o filtro, **pedido excluído continuaria contando como receita** e o lucro do DRE ficaria inflado — o fundador veria um número errado sem saber por quê.

**Efeito colateral desejado:** a partir daqui, "excluir" passa a significar "não existe mais" para **todos** os consumidores, automaticamente.

---

## 4. Hook novo — `src/app/hooks/use-excluir-pedido.ts`

Espelhar o padrão dos hooks existentes (`use-atualizar-status-pedido.ts`).

```ts
interface ExcluirPedidoParams { vendaId: string; motivo?: string; }
interface ExcluirPedidoResult { success: boolean; error?: string; code?: string; estoqueDevolvido?: boolean; }

export function useExcluirPedido(): {
  excluirPedido: (p: ExcluirPedidoParams) => Promise<ExcluirPedidoResult>;
  loading: boolean;
  error: string | null;
}
```

**Regras de implementação:**
- `empresa_id` vem de `useAuth()` (`empresa?.id`) — **nunca** de prop ou de estado local.
- `p_usuario_id` vem do perfil autenticado (`perfil.id`), como em `use-atualizar-status-pedido.ts`.
- Chamar via `supabase.rpc("fn_excluir_pedido_cancelado", { ... })`.
- Mapear `data.code` → mensagem amigável (tabela do §2.2), com fallback para `data.error`.
- Sem `empresaId` → devolver erro e **não** chamar o banco.
- **Não** fazer `DELETE` pelo cliente em nenhuma hipótese.

---

## 5. UI

### 5.1 Detalhe do pedido — `src/app/components/pedidos/PedidoDetalhePage.tsx`

- Botão **"Excluir pedido"** na área de ações (junto de "Atualizar status" / "Imprimir").
- **Visibilidade:** `pedido.status === "cancelado"` **e** não excluído. Em qualquer outro status, **não renderiza**.
- Estilo: ação **destrutiva** (vermelho) — usar o token de perigo que o app já usa em "Excluir produto" (`bg-red-50 text-red-500`).
- **Mobile:** entra na linha própria de ações já existente (o padrão de `flex-wrap` abaixo do título, criado em `d7a554e`).

### 5.2 Lista — `src/app/components/pedidos/PedidosListaPage.tsx`

- Ação por pedido (ícone **lixeira**) nos cards e na tabela, **apenas** em pedido cancelado.
- Segue o padrão do ícone de excluir já usado em `ProdutosPage` (mesmo tamanho, `aria-label` descritivo).
- **Não** entra na barra de seleção em massa (exclusão em massa está fora de escopo).

### 5.3 Modal de confirmação

- **Título:** "Excluir pedido?" · mostra o **número do pedido** e o **cliente**.
- **Texto obrigatório** — o fundador precisa saber o que vai acontecer:
  - "O pedido sai da lista e dos relatórios. O histórico é preservado."
  - "O estoque dos itens será devolvido." *(só quando houver conta vinculada — senão, omitir essa linha)*
  - "Esta ação não pode ser desfeita pela tela."
- **Campo de motivo** (opcional) — vai para `motivo_exclusao` e para o histórico.
- **Botões:** "Cancelar" (secundário) e **"Excluir pedido"** (destrutivo). No mobile, empilhados com **Confirmar em cima** (padrão já usado nos modais de status/rastreio).
- **Mobile:** **bottom-sheet** (`rounded-t-3xl` + handle) — mesmo padrão dos modais de status e contabilizar.

### 5.4 Estados visuais (obrigatórios — Definition of Done)

| Estado | Comportamento |
|---|---|
| **loading** | Botão do modal vira spinner + desabilitado (`Loader2` girando), igual ao "Contabilizar venda" |
| **erro** | Mensagem do `code` **dentro do modal** (não só toast) — ex.: pagamento registrado. O modal **não** fecha |
| **sucesso** | Fecha o modal, **toast** "Pedido excluído com sucesso!", `recarregar()` na lista; no detalhe, **navegar de volta** para `/vendas/pedidos` |
| **empty** | Se era o último pedido da lista → cair no empty state já existente |
| **sem permissão** | N/A — D5 diz que qualquer usuário da empresa pode |

### 5.5 Acessibilidade

- `aria-label` nos botões de ícone (ex.: `Excluir pedido 1234`).
- Foco vai para o botão de confirmar ao abrir o modal; ESC fecha; `aria-modal="true"`.
- O botão destrutivo precisa de alvo de toque ≥ 36px (padrão já adotado nos filtros).

---

## 6. Verificação (checklist do SPEC)

- [ ] Migration aplicada: 3 colunas + índice parcial presentes.
- [ ] RPC criada e responde os **4 códigos de erro** corretamente.
- [ ] `NAO_ENCONTRADO` para venda de **outra empresa** (testar com o `empresa_id` errado).
- [ ] `JA_EXCLUIDO` na segunda chamada — e o estoque **não** sobe de novo.
- [ ] `STATUS_INVALIDO` para pedido `pendente`/`confirmada`/etc.
- [ ] `PAGAMENTO_REGISTRADO` para pedido cancelado com conta `pago`.
- [ ] Sucesso em pedido cancelado do **WhatsApp** → estoque **sobe**.
- [ ] Sucesso em pedido cancelado **manual** (sem conta vinculada) → estoque **não muda**.
- [ ] As linhas filhas (`me_itens_venda`, `me_contas_receber`, `me_venda_historico`) **continuam existindo**.
- [ ] `me_venda_historico` ganhou a linha de exclusão.
- [ ] Os **4** caminhos de leitura filtram (`use-pedidos`, `use-pedido`, `use-loja-meus-pedidos`, `use-dre`).
- [ ] Pedido excluído **não** aparece no DRE.
- [ ] Pedido excluído **não** aparece em `/loja/docee/conta`.
- [ ] Botão só aparece em pedido cancelado (detalhe **e** lista).
- [ ] Modal: loading, erro (mensagem do banco visível), sucesso, e o caso "último pedido".
- [ ] Mobile: bottom-sheet, botões empilhados, alvo de toque ok.
- [ ] `npx tsc --noEmit -p tsconfig.check.json` → **13 erros** (linha de base, zero novos).
- [ ] `npm run build` ✅

> ⚠️ **Gate de tipos:** o `tsc --noEmit` normal está quebrado (TS 6.0.2 + `baseUrl`). Usar o config de checagem com `"ignoreDeprecations": "6.0"` e **apagar o arquivo** ao terminar.

---

## 7. Arquivos previstos

| Arquivo | Ação |
|---|---|
| `supabase/migrations/20260918_excluir_pedido_cancelado.sql` | **novo** — colunas + índice + RPC |
| `src/app/hooks/use-excluir-pedido.ts` | **novo** — chama a RPC |
| `src/app/components/pedidos/PedidoDetalhePage.tsx` | botão + modal |
| `src/app/components/pedidos/PedidosListaPage.tsx` | ação por linha + modal + `recarregar()` |
| `src/app/hooks/use-pedidos.ts` | filtro `deletado_em IS NULL` |
| `src/app/hooks/use-pedido.ts` | filtro `deletado_em IS NULL` |
| `src/app/hooks/use-loja-meus-pedidos.ts` | filtro `deletado_em IS NULL` |
| `src/app/hooks/use-dre.ts` | filtro `deletado_em IS NULL` |
| `tracking/TRACKING.md` | marcar item 4 |

**Fora:** `use-criar-pedido.ts`, `use-atualizar-status-pedido.ts` (escrita), `me_venda_servicos` (escopo é `me_venda`).

---

*SPEC criado em 17/09/2026 pelo Orchestrator. Depende de aprovação do WIRE (regra de ouro do `AGENTS.md`).*
