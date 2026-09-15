# SPEC — Fluxo n8n Doceê: `docee_grava-pedido` → `docee_criarpedido` → RPC `registrar_venda`

> **PRD:** `tracking/plans/PRD-DoceE-FluxoN8n-PedidoParaRPC.md`
> **Audiência:** fundador montando o fluxo na UI do n8n (sem MCP). Cada seção tem a config exata ou o snippet de Code para copiar.
> **Supabase oficial:** `krrkfgvdwhpelxtrdtla.supabase.co` · credential n8n `UNIQ-uat4`.
> **Tenant Doceê:** `52aa05bf-a9e1-43e2-a46a-ec3cbd37c12f` · WhatsApp `5511919153508`.

---

## 0. Contexto mínimo

- **Agente:** `atendente_Docee` — workflow `3IVutqEXVq8MtXkZ`. Contém a tool `docee_grava-pedido` (toolworkflow) e a tool `Consulta_Produtos` (supabaseTool em `me_produto`, filtro `empresa_id` = `{{ $('DADOS_MSG5').item.json.empresa_id }}`, credential `UNIQ-uat4`).
- **Tool `docee_grava-pedido`:** chama o sub-workflow `docee_criarpedido` (`OCurPXY88yMULudW`) passando os campos do toolWorkflow (workflowInputs).
- **Sub-workflow `docee_criarpedido` (`OCurPXY88yMULudW`):** hoje **vazio** — só o nó "When Executed by Another Workflow", `active: false`. É aqui que o executor será construído.
- **RPC:** `registrar_venda(p_empresa_id, p_valor_total, p_forma_pagamento, p_cliente_id, p_data_vencimento, p_status, p_itens jsonb, p_observacoes, p_origem)` → `{success, id_venda, id_venda_servico, id_conta_receber, valor_total}` (SECURITY DEFINER).
  - Soma dos produtos → `me_venda.valor_total`; `p_valor_total` alimenta a **conta a receber**; baixa estoque; casa forma de pagamento por nome `ILIKE` com fallback PIX; busca `nome_cliente` por `p_cliente_id` + empresa.
- **Produtos reais da Doceê:** id 61 "Torta de Limão" (preço 7, **estoque 0**); id 62 "Surpresa de Uva" (preço 8, estoque 10).
- **Formas de pagamento reais (nome a usar):** `Dinheiro`, `Cartão de Crédito`, `Pix`, `Cartão de Débito`, `Boleto`.

---

## 1. Regra de ouro deste fluxo

**A AI escolhe (produto + quantidade), o banco decide (id, preço, estoque, totais).** A tool recebe a *intenção* do pedido; o sub-workflow reconstrói `p_itens` com dados canônicos de `me_produto` e recalcula tudo. Nenhum valor sensível (id, preço, estoque, total, status, origem) vem da AI.

---

## 2. Tool `docee_grava-pedido` — contrato de inputs (configurar na UI)

> Reduzir o contrato ao mínimo: **menos campos = menos erro da AI**. Campos que o sub-workflow fixa/recalcula saem do contrato.

| Campo | Fonte | Tipo | Descrição (vai para a AI) |
|---|---|---|---|
| `p_empresa_id` | `DADOS_MSG5.Instancia` | string uuid | manter (já configurado) |
| `p_cliente_id` | `DADOS_CLIENTE.id` | string uuid | manter (já configurado) |
| `p_forma_pagamento` | AI | string | "Forma de pagamento: Pix, Dinheiro, Cartão de Crédito, Cartão de Débito ou Boleto. Escolha uma das opções exatas." |
| `p_observacoes` | AI | string | opcional — observações do pedido |
| `p_itens` | AI | **string** (JSON) | "JSON válido dos itens do pedido no formato `[{"nome":"Surpresa de Uva","quantidade":2}]`. Use SEMPRE os nomes exatos retornados pela Consulta_Produtos e a quantidade confirmada pelo cliente. NÃO invente id, preço ou campos extras." |
| ❌ `p_valor_total` | **remover** | — | sub-workflow recalcula |
| ❌ `p_status` | **remover** | — | fixo `confirmada` |
| ❌ `p_origem` | **remover** | — | fixo `whatsapp` |
| ❌ `p_data_vencimento` | **remover** | — | RPC usa padrão +30 dias |

**Descrição da tool (primeira linha):** deve dizer que só pode ser chamada **depois** de consultar produtos (`Consulta_Produtos`) e confirmar com o cliente os itens, quantidades e forma de pagamento.

> ⚠️ `p_itens` deve ter tipo `string` **no schema do toolWorkflow E** no `$fromAI('p_itens', ..., 'string')` — nunca `array`. É o que evita o modelo mandar JSON em formato inesperado; o parse acontece no sub-workflow.

---

## 3. Sub-workflow `docee_criarpedido` — estrutura

```
Trigger "When Executed by Another Workflow" (existe)
  → 1. Parse p_itens          (Code)
  → 2. Buscar Produtos        (Supabase GET me_produto | filtro empresa_id = $json.p_empresa_id)
  → 3. Montar payload         (Code)
  → 4. HTTP Request → RPC     (credential UNIQ-uat4)   ← ÚLTIMO nó (a resposta volta para a tool/AI)
```

> Qualquer **erro** lançado nos Code nodes volta como falha da tool — a AI recebe a mensagem e pode repetir/confirmar com o cliente. Isso é desejado.

### Nó 1 — Code "Parse p_itens"

```js
const item = $json;

function parseItens(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch {
      const m = raw.match(/\[[\s\S]*\]/);
      if (m) return JSON.parse(m[0]);
    }
  }
  if (raw && typeof raw === "object" && Array.isArray(raw.itens)) return raw.itens;
  throw new Error("p_itens deve ser um array JSON de itens. Informe os itens do pedido.");
}

const itens = parseItens(item.p_itens);
if (!Array.isArray(itens) || itens.length === 0) {
  throw new Error("Pedido sem itens: informe pelo menos um item do catálogo.");
}

return [{ json: { ...item, p_itens: itens } }];
```

### Nó 2 — Supabase "Buscar Produtos"

- **Operação:** Get many rows · **Tabela:** `me_produto` · **Credential:** `UNIQ-uat4`
- **Filtro:** `empresa_id` = `{{ $json.p_empresa_id }}` (mesmo padrão da `Consulta_Produtos`)

### Nó 3 — Code "Montar payload" (o coração do fluxo)

```js
const entrada = $json;
const produtos = $("Buscar Produtos").all().map((i) => i.json);

const nomesValidosFormaPgto = ["dinheiro", "cartão de crédito", "pix", "cartão de débito", "boleto"];

const formaPgto = (entrada.p_forma_pagamento || "Pix").toLowerCase().trim();
const formaPgtoFinal = nomesValidosFormaPgto.find((n) => formaPgto.includes(n) || n.includes(formaPgto)) || "Pix";

const itensNorm = (entrada.p_itens || []).map((ip) => {
  const nomeBuscado = String(ip.nome || "").trim().toLowerCase();
  const produto =
    produtos.find((p) => String(p.nome_produto).trim().toLowerCase() === nomeBuscado) ||
    produtos.find((p) => String(p.id) === String(ip.id_referencia || ip.id || ""));
  if (!produto) throw new Error(`Produto "${ip.nome}" não encontrado no catálogo.`);
  const qtd = Math.max(1, parseInt(ip.quantidade, 10) || 1);
  if (produto.estoque_atual != null && produto.estoque_atual < qtd) {
    throw new Error(`Estoque insuficiente de "${produto.nome_produto.trim()}": temos ${produto.estoque_atual} un.`);
  }
  return {
    tipo: "produto",
    id_referencia: String(produto.id),
    nome: produto.nome_produto.trim(),
    quantidade: qtd,
    preco_unitario: Number(produto.preco) || 0,
  };
});

const valorTotal = itensNorm.reduce((s, it) => s + it.quantidade * it.preco_unitario, 0);

return [{ json: {
  p_empresa_id: entrada.p_empresa_id,
  p_cliente_id: entrada.p_cliente_id || null,
  p_forma_pagamento: formaPgtoFinal,
  p_status: "confirmada",
  p_origem: "whatsapp",
  p_data_vencimento: null,
  p_observacoes: entrada.p_observacoes || null,
  p_valor_total: valorTotal,
  p_itens: itensNorm,
}}];
```

> Ajuste o nome `"Buscar Produtos"` no `$("...")` para o nome real do nó 2.
> `p_valor_total` = soma dos produtos (regra de negócio: venda = produtos; `p_valor_total` só alimenta a conta a receber).

### Nó 4 — HTTP Request → RPC

- **Método:** POST
- **URL:** `https://krrkfgvdwhpelxtrdtla.supabase.co/rest/v1/rpc/registrar_venda`
- **Autenticação:** Predefined Credential Type **Supabase API** → selecionar **`UNIQ-uat4`** (mesma da `Consulta_Produtos` — injeta `apikey`/`Authorization` sozinho)
- **Content-Type:** application/json (`json` body)
- **Body:** os campos `p_*` que saíram do nó 3
- Último nó do sub-workflow: a resposta `{success, id_venda, id_venda_servico, id_conta_receber, valor_total}` volta para a tool → a AI confirma o pedido ao cliente (número do pedido, total, forma de pagamento).

---

## 4. Passos de ativação (ordem exata)

1. Ajustar a tool `docee_grava-pedido` (contrato da §2) no workflow `atendente_Docee`.
2. Construir os nós 1–4 no sub-workflow `docee_criarpedido`.
3. **Ativar** `docee_criarpedido` (`active: true`).
4. **Salvar** o `atendente_Docee` (a tool referencia o sub-workflow).
5. Rodar um pedido de teste no WhatsApp (ver critérios de aceite do PRD).

---

## 5. Checklist (Definition of Done)

- [ ] Tool com os 5 inputs (2 de contexto + 3 de AI) — `p_valor_total`/`p_status`/`p_origem`/`p_data_vencimento` removidos
- [ ] `p_itens` tipado como **string** no schema E no `$fromAI`
- [ ] Descrição de `p_itens` instrui nomes exatos da `Consulta_Produtos`
- [ ] Nó 1: parse defensivo (array, string JSON, `{itens:[...]}`, regex fallback) + erro se vazio
- [ ] Nó 2: GET `me_produto` filtrado por `empresa_id` do tenant
- [ ] Nó 3: lookup por nome (trim/lowercase) com fallback por id; estoque verificado com erro amigável
- [ ] Nó 3: `p_valor_total` recalculado da soma; `p_origem='whatsapp'`; `p_status='confirmada'`; forma de pagamento normalizada com fallback `Pix`
- [ ] Nó 4: POST `/rest/v1/rpc/registrar_venda` com credential `UNIQ-uat4`
- [ ] Sub-workflow ativado e workflow pai salvo
- [ ] Teste real: venda com item do catálogo grava `me_venda` + `me_itens_venda` (valores reais) + conta a receber + baixa estoque
- [ ] Teste real: item sem estoque (Torta de Limão) NÃO grava e a AI explica ao cliente
- [ ] Teste real: `p_origem='whatsapp'`, `p_status='confirmada'` na venda

---

## 6. O que NÃO fazer

- ❌ Não deixar a AI preencher id/preço/total/status/origem (contrato da §2 já impede).
- ❌ Não tipar `p_itens` como array no toolWorkflow (parse é no sub-workflow).
- ❌ Não alterar a RPC `registrar_venda` neste fluxo (endurecer estoque com `RAISE EXCEPTION` é decisão em aberto — Opção B).
- ❌ Não mexer no `atendente_Docee` além da tool — persona/roteiro/MEL intactos.
- ❌ Não tocar código deste repositório — fluxo 100% no n8n.

---

*Criado em 12/09/2026. PRD: `tracking/plans/PRD-DoceE-FluxoN8n-PedidoParaRPC.md`.*