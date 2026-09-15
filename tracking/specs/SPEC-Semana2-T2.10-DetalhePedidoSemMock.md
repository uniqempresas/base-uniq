# SPEC — T2.10: Detalhe do Pedido Sem Mock

## Migration Supabase (1 arquivo)

```sql
-- T2.10 — persistir rastreio, cancelamento e frete em me_venda
ALTER TABLE me_venda
  ADD COLUMN IF NOT EXISTS codigo_rastreio text,
  ADD COLUMN IF NOT EXISTS motivo_cancelamento text,
  ADD COLUMN IF NOT EXISTS frete numeric NOT NULL DEFAULT 0;

-- T2.10 — histórico de status do pedido (timeline persistida)
CREATE TABLE IF NOT EXISTS me_venda_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id uuid NOT NULL REFERENCES me_venda(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES me_empresa(id),
  status text NOT NULL,
  observacao text,
  codigo_rastreio text,
  responsavel_usuario_id uuid REFERENCES me_usuario(id),
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_me_venda_historico_venda
  ON me_venda_historico (venda_id, criado_em);
```

> ⚠️ RLS fica como está no resto do projeto (desabilitado — P5 global). Isolamento por empresa já é garantido nas queries pelo `.eq("empresa_id")`.

## Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `src/app/hooks/use-pedido.ts` | Select ampliado + fetch de histórico + mapeamento de endereço/npedido/cpf_cnpj/frete |
| `src/app/hooks/use-atualizar-status-pedido.ts` | Aceitar `observacao`, `codigoRastreio`; gravar histórico + motivo/rastreio na venda |
| `src/app/components/pedidos/PedidoDetalhePage.tsx` | Handlers passam dados extras; timeline local só no fallback mock |

---

## Hook `use-pedido.ts`

### Select de `me_venda` (ampliado)
```typescript
.select("id, cliente_id, valor_total, valor_desconto, observacoes, status_venda,
         forma_pagamento, canal_venda, npedido, codigo_rastreio, motivo_cancelamento,
         frete, criado_em")
```

### Select de `me_cliente` (ampliado — endereço + cpf_cnpj)
```typescript
.select("id, nome_cliente, telefone, email, documento, cpf_cnpj,
         endereco, numero, complemento, bairro, cidade, estado, cep")
```

### Novo fetch: histórico
```typescript
const { data: historico } = await supabase
  .from("me_venda_historico")
  .select("status, observacao, codigo_rastreio, criado_em")
  .eq("venda_id", dbVenda.id)
  .order("criado_em", { ascending: true });
```

### Mapeamento no `mapVendaToPedido`

| Campo Pedido | Fonte |
|---|---|
| `numero` | `npedido` real → `#${npedido}`; fallback `gerarNumeroPedido(id)` atual |
| `frete` | `frete` (default 0) |
| `codigoRastreio` | `codigo_rastreio` |
| `motivoCancelamento` | `motivo_cancelamento` |
| `cliente.tipo` | `cpf_cnpj` com 14 dígitos numéricos → `"pj"`; senão `"pf"` |
| `endereco` | campos do cliente (`endereco, numero, complemento, bairro, cidade, estado, cep`) — **montar só se** `endereco` e `cidade` presentes; senão `undefined` (seção oculta) |
| `timeline` | `me_venda_historico` (mapear `StatusHistorico → TimelineEntry`); se vazio, fallback 1 entry atual (status + criado_em) |

```typescript
function mapHistoricoToTimeline(h: DBHistorico[]): TimelineEntry[] {
  return h.map((entry) => ({
    status: mapStatusVenda(entry.status),
    dataHora: entry.criado_em,
    responsavel: "Sistema",
    observacao: entry.observacao || undefined,
    codigoRastreio: entry.codigo_rastreio || undefined,
  }));
}
```

> Obs.: `responsavel` — se `responsavel_usuario_id` vier populado, buscar nome em `me_usuario`; caso contrário "Sistema". (Opcional, baixo custo.)

### Fallback mock
- Inalterado: sem sessão → `PEDIDOS` (mock). Critério mock-first preservado.

---

## Hook `use-atualizar-status-pedido.ts`

### Interface ampliada
```typescript
interface AtualizarStatusPedidoParams {
  id: string;
  status: StatusPedido;          // passar o valor do banco (ex.: "enviado", "cancelado")
  observacao?: string;
  codigoRastreio?: string;
}
```

### Comportamento (dentro do update único, com transaction implícita via `then`/paralelo)
1. `empresa_id` obrigatório (sem fallback — comportamento atual).
2. UPDATE `me_venda`:
   - `status_venda = status`
   - `codigo_rastreio = codigoRastreio` (quando fornecido)
   - `motivo_cancelamento = observacao` (quando `status === "cancelado"`)
   - `atualizado_em = new Date().toISOString()`
3. INSERT `me_venda_historico`:
   - `venda_id`, `empresa_id`, `status`, `observacao`, `codigoRastreio`, `responsavel_usuario_id = perfil?.id`
4. Retorna `{success}` ou `{success: false, error}`.

---

## UI — `PedidoDetalhePage.tsx`

### `handleStatusUpdate`
- Passa `observacao` quando `enviado` → `"Código de rastreio: ${trackingCode}"`; `codigoRastreio` quando `enviado`.
- **Remove** o `setPedidoLocal` com timeline montada em memória quando `!isFallback` — o banco agora é a fonte.
- No fallback mock, mantém o comportamento local atual (nada muda na demo).

### `handleTrackingAdd`
- Quando `!isFallback`: chama `useAtualizarStatusPedido` com `{id, status: "enviado", codigoRastreio}` — **código persiste** e timeline ganha a entry.
- No fallback mock: comportamento local atual.

### `handleCancel`
- Quando `!isFallback`: chama `useAtualizarStatusPedido` com `{id, status: "cancelado", observacao: cancelMotivo}` — **motivo persiste**.
- No fallback mock: comportamento local atual.

### Timeline
- Deixa de depender de `pedidoLocal.timeline` no modo real: renderiza `pedido.timeline` vindo do hook (agora persistido).
- `setPedidoLocal` continua existindo **apenas** para o fallback mock.

### Recarregar após ação
- Após atualizar status/cancelar/rastrear no modo real, chamar `recarregar()`? — **Não**: o hook `usePedido` re-busca quando `id` muda apenas. Para refletir o update no lugar, manter `setPedidoLocal(pedidoAtualizado)` como espelho **local** do resultado da ação (o objeto agora tem os campos do banco). Ao recarregar a página, os dados reais vêm do banco. *(Alternativa mais simples e consistente para o modo real; mock preservado.)*

---

## Checklist

- [ ] Migration aplicada no Supabase oficial (`krrkfgv...`)
- [ ] `use-pedido.ts` busca novos campos + histórico + endereço
- [ ] `npedido` usado quando existente
- [ ] Badge PF/PJ derivado de `cpf_cnpj`
- [ ] `use-atualizar-status-pedido.ts` grava histórico + motivo/rastreio
- [ ] `PedidoDetalhePage` envia observação/rastreio nos handlers
- [ ] Fallback mock intacto (sem login → mock)
- [ ] `npm run build` OK
- [ ] Deploy Vercel READY
- [ ] Tarefa marcada ✅ no TRACKING.md