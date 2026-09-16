# SPEC — Loja Virtual integrada: vitrine → checkout → `me_venda`

> **PRD:** `tracking/plans/PRD-LojaVirtual-DoceE.md` (decisões D1–D4 resolvidas em 15/09/2026)
> **Base de dados:** Supabase oficial `krrkfgvdwhpelxtrdtla` (anon key, RLS geral desligado — pendência P5; aceito no laboratório)
> **Princípio:** a vitrine coleta a intenção, **o banco decide os dados** (herdado do fluxo n8n `docee_criarpedido`)

---

## 1. Objetivo técnico

Transformar o módulo `src/app/components/loja/` (hoje 100% mock/localStorage) em vitrine pública **multi-tenant por slug** que lê o catálogo real (`me_produto`), finaliza pedidos via RPC `registrar_venda` (`p_origem='loja'`) e permite acompanhamento por telefone — sem login de cliente final.

## 2. Contrato com o banco (schema verificado em 15/09/2026)

### 2.1 `me_empresa` (resolução do tenant)

| Campo | Tipo | Uso |
|---|---|---|
| `id` | uuid | `empresa_id` de todas as queries |
| `slug` | text | resolução via rota `/loja/:slug` |
| `nome_fantasia` | text | nome exibido na vitrine |
| `logo_url` | text | header da vitrine |
| `store_config` / `appearance` | jsonb | **não usar na v1** (backlog de personalização) |

Query: `select id, nome_fantasia, logo_url from me_empresa where slug = :slug` → não encontrado = empty state "Loja não encontrada" (sem fallback mock — slug inexistente é erro real).

### 2.2 `me_produto` (catálogo da vitrine)

Query: `select id, nome_produto, preco, foto_url, descricao, estoque_atual from me_produto where empresa_id = :empresaId and ativo = true and exibir_vitrine = true order by nome_produto`.

| Campo | Uso |
|---|---|
| `preco` | preço exibido (único preço na v1; `preco_varejo` fica fora) |
| `estoque_atual` | `<= 0` → badge **"Esgotado"**, sem botão de comprar |
| `foto_url` | pode ser null → placeholder |
| `descricao` | página do produto |

### 2.3 `me_cliente` (find-or-create por telefone)

Telefone **normalizado** (somente dígitos, com DDI 55: `5511999751990`) — mesmo padrão usado pelos hooks do CRM.

1. **Lookup:** `select id, nome_cliente, telefone, cep, endereco, numero, complemento, bairro, cidade, estado from me_cliente where empresa_id = :empresaId and telefone = :telefoneNormalizado limit 1`.
2. **Encontrado** → pré-preenche nome e endereço no checkout (decisão D2: preferir existente, editável).
3. **Não encontrado** → INSERT `{empresa_id, nome_cliente, telefone, origem: 'loja', tags: []}`.
4. **Endereço:** atualiza os campos novos (`cep`, `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `estado`) com o endereço informado no checkout. Não tocar nos campos legados (`end_completo`, `end_numero`).

### 2.4 RPC `registrar_venda` (criação do pedido)

Chamada única após resolução canônica dos itens:

```
registrar_venda(
  p_empresa_id     := empresaId,
  p_cliente_id     := clienteId,
  p_valor_total    := soma(quantidade × preco_unitario do banco),   -- recalculado no front
  p_forma_pagamento:= 'Pix' | 'Dinheiro',                            -- escolha do cliente
  p_data_vencimento:= data atual,                                    -- entrega/pagamento no curto prazo
  p_status         := 'confirmada',                                  -- exibe "Recebido" no módulo Pedidos
  p_origem         := 'loja',                                        -- canal_venda='loja' (badge existente)
  p_itens          := jsonb [                                        -- formato canônico (T2.8)
                       {tipo:'produto', id_referencia:<me_produto.id>,
                        nome:<nome_produto>, quantidade:<n>, preco_unitario:<preco do banco>}
                     ],
  p_observacoes    := endereço formatado + observações do cliente
)
```

Retorno: `{success, id_venda, valor_total, ...}` → tela de confirmação exibe o número do pedido.

### 2.5 Regras anti-fraude (espelham o sub-workflow n8n)

1. **Preço/id nunca vêm do carrinho** — antes da RPC, o checkout refaz `select id, nome_produto, preco, estoque_atual from me_produto where id in (...)` e reconstrói `p_itens` e `p_valor_total` com esses dados.
2. **Preço mudou desde a vitrine** → usar preço do banco e informar no resumo do checkout ("preço atualizado").
3. **Estoque insuficiente** (qualquer item `estoque_atual < quantidade`) → **não chamar a RPC**; exibir erro por item ("só temos X unidades") e permitir ajustar quantidade/remover.
4. **Checkout exige banco** — se o Supabase estiver indisponível, o checkout exibe "Loja indisponível no momento — faça seu pedido pelo WhatsApp" com o número da empresa. **Nunca** gravar pedido em mock.

### 2.6 "Meus pedidos" (por telefone)

1. Telefone digitado (ou do localStorage do último checkout) → lookup `me_cliente` (mesma normalização).
2. Encontrado → `select id, valor_total, status_venda, forma_pagamento, canal_venda, criado_em from me_venda where empresa_id = :empresaId and cliente_id = :clienteId order by criado_em desc`.
3. Status exibido pelo `mapStatusVenda` existente (`confirmada` → **Recebido**).
4. Não encontrado / sem pedidos → empty state "Nenhum pedido encontrado para este telefone".

## 3. Rotas

| Rota | Pública? | Tela | Mudança |
|---|---|---|---|
| `/loja` | ✅ | demo atual (mock) | **mantida como está** — vitrine de demonstração sem tenant |
| `/loja/:slug` | ✅ | `LojaPage` | **nova** — resolve tenant por slug |
| `/loja/:slug/produto/:id` | ✅ | `ProdutoLojaPage` | **nova** — `:id` integer de `me_produto`; fallback por nome no mock |
| `/loja/:slug/checkout` | ✅ | `CheckoutPage` | **nova** — versão integrada |
| `/loja/:slug/pedidos` | ✅ | `MeusPedidosPage` | **nova** — por telefone |
| `/loja/checkout` | ✅ | `CheckoutPage` (mock) | mantida para o demo |

> Rotas públicas **sem AppLayout** (mesma configuração atual de `/loja`). ⚠️ Atenção: React Router resolve `/loja/:slug` e `/loja/checkout` — como `checkout` é caminho estático, colocar as rotas estáticas **antes** das dinâmicas no `routes.tsx`.

## 4. Tipos (`src/app/types/loja.ts`)

```typescript
export interface LojaTenant {
  empresaId: string;
  slug: string;
  nomeFantasia: string;
  logoUrl: string | null;
  whatsapp: string | null; // me_empresa.telefone — usado no fallback de indisponibilidade
}

export interface ProdutoLoja {
  id: number;
  nome: string;
  preco: number;
  fotoUrl: string | null;
  descricao: string | null;
  estoque: number;          // <= 0 => esgotado
  esgotado: boolean;
}

export interface ItemCarrinhoLoja {
  produtoId: number;
  nome: string;
  precoSnapshot: number;    // exibição; NUNCA usado na gravação
  fotoUrl: string | null;
  quantidade: number;
}

export interface DadosCheckoutLoja {
  nome: string;
  telefone: string;         // digitado com máscara
  cep: string;
  endereco: string;         // logradouro
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  formaPagamento: 'Pix' | 'Dinheiro';
  observacoes: string;
  consentimentoLgpd: boolean;
}

export interface ResumoPedidoLoja {
  idVenda: string;
  valorTotal: number;
  itens: { nome: string; quantidade: number; precoUnitario: number }[];
  formaPagamento: string;
}
```

## 5. Hooks novos (`src/app/hooks/`)

| Hook | Fonte | Fallback |
|---|---|---|
| `use-loja-tenant.ts` (`useLojaTenant(slug)`) | `me_empresa` por slug | **sem fallback** — slug inválido = tela "loja não encontrada" |
| `use-loja-produtos.ts` (`useLojaProdutos(empresaId)`) | `me_produto` (§2.2) | `lojaMockData.ts` (regra mock-first) |
| `use-loja-produto.ts` (`useLojaProduto(empresaId, id)`) | `me_produto` por id | mock por id/nome |
| `use-loja-cliente.ts` (`useLojaClientePorTelefone(empresaId, telefoneDigits)`) | lookup §2.3 | sem fallback (null) |
| `use-loja-criar-pedido.ts` (`useLojaCriarPedido()`) | find-or-create cliente (§2.3) + RPC (§2.4) com pré-check de estoque/preço (§2.5) | **sem fallback** — erro = mensagem + WhatsApp |
| `use-loja-meus-pedidos.ts` (`useLojaMeusPedidos(empresaId, telefoneDigits)`) | §2.6 | sem fallback (vazio) |

Padrão dos hooks existentes: `isLoading`, `isFallback`, `error`, `refetch`. Isolamento: todas as queries filtram `empresa_id` (regra T2.6).

## 6. Carrinho da loja (`use-carrinho-loja.ts`)

- Chave localStorage: `uniq_loja_carrinho_<slug>` (isolado por loja; **não** reusar `useCarrinho` do marketplace).
- API: `itens`, `adicionar(produto)`, `remover(produtoId)`, `alterarQuantidade(produtoId, n)` (mín. 1; máx. `estoque`), `limpar()`, `totalSnapshot`, `quantidadeTotal`.
- Produto esgotado não entra no carrinho (botão desabilitado na vitrine/produto).

## 7. Validação e máscaras (`src/app/lib/validators.ts` / `masks.ts`)

**Schema zod `checkoutLojaSchema`:**

```typescript
z.object({
  nome: z.string().trim().min(2, 'Informe seu nome'),
  telefone: z.string().refine(v => v.replace(/\D/g, '').length >= 10, 'Telefone inválido'),
  cep: z.string().refine(v => v.replace(/\D/g, '').length === 8, 'CEP inválido'),
  endereco: z.string().trim().min(3),
  numero: z.string().trim().min(1, 'Número obrigatório'),
  complemento: z.string().trim().optional().default(''),
  bairro: z.string().trim().min(2),
  cidade: z.string().trim().min(2),
  estado: z.string().length(2),
  formaPagamento: z.enum(['Pix', 'Dinheiro']),
  observacoes: z.string().max(300).optional().default(''),
  consentimentoLgpd: z.literal(true, { errorMap: () => ({ message: 'É preciso aceitar para continuar' }) }),
});
```

**CEP (ViaCEP — viabiliza backlog B5):** `GET https://viacep.com.br/ws/{cep}/json/` (CORS liberado). `erro === true` → CEP inválido; sucesso → pré-preenche `endereco`, `bairro`, `cidade`, `estado` (campos ficam editáveis — decisão D2). Falha de rede → campos seguem preenchíveis manualmente.

**Máscaras:** telefone `(11) 99999-9999` / `(11) 9999-9999`; CEP `00000-000` (reusar `masks.ts` se já houver; senão criar).

## 8. Estrutura de arquivos

```
src/app/
├── types/loja.ts                        # tipos §4 (novo)
├── hooks/
│   ├── use-carrinho-loja.ts             # carrinho por slug (novo)
│   ├── use-loja-tenant.ts               # (novo)
│   ├── use-loja-produtos.ts             # (novo)
│   ├── use-loja-produto.ts              # (novo)
│   ├── use-loja-cliente.ts              # (novo)
│   ├── use-loja-criar-pedido.ts         # (novo)
│   └── use-loja-meus-pedidos.ts         # (novo)
├── components/loja/
│   ├── LojaPage.tsx                     # adaptar: modo tenant (props/params) vs demo
│   ├── ProdutoLojaPage.tsx              # adaptar
│   ├── CheckoutPage.tsx                 # reescrever fluxo de submit (integração)
│   ├── MeusPedidosPage.tsx              # adaptar: lookup por telefone
│   ├── lojaMockData.ts                  # mantido como fallback do catálogo
│   ├── LojaSkeleton.tsx / LojaEmpty.tsx # estados (verificar se já existem)
│   └── LojaNaoEncontrada.tsx            # novo (slug inválido)
└── routes.tsx                           # rotas §3 (estáticas antes das dinâmicas)
```

Nenhuma tela do app autenticado muda, exceto: conferir se o badge de canal `loja` existe no `mapStatusVenda`/filtros de `/vendas/pedidos` (o valor já consta no domínio `canal_venda`; se o label estiver ausente, adicionar "Loja").

## 9. Estados visuais (obrigatórios)

| Tela | Loading | Empty | Error | Fallback |
|---|---|---|---|---|
| Vitrine | grid skeleton | "Nenhum produto disponível no momento" | toast + retry | mock (banco vazio/erro) |
| Produto | skeleton | redirect vitrine | toast + voltar | mock |
| Checkout | skeleton do resumo | — (sem carrinho → redirect vitrine) | erro de estoque por item / "loja indisponível" + WhatsApp | **não gravar em mock** |
| Confirmação | — | — | — | — |
| Meus pedidos | skeleton | "Nenhum pedido para este telefone" | toast | — (vazio) |
| Loja não encontrada | — | tela própria | — | — |

## 10. Checklist de implementação

### Hooks
- [ ] `useLojaTenant` — resolve slug, sem fallback (empty "loja não encontrada")
- [ ] `useLojaProdutos` — query §2.2 com fallback mock + flag `isFallback`
- [ ] `useLojaProduto` — por id, com fallback mock
- [ ] `useLojaClientePorTelefone` — normalização de telefone (DDI 55, só dígitos)
- [ ] `useLojaCriarPedido` — find-or-create cliente + pré-check preço/estoque + RPC (`p_origem='loja'`, `p_status='confirmada'`, vencimento = hoje)
- [ ] `useLojaMeusPedidos` — por telefone, ordenado `criado_em desc`
- [ ] `useCarrinhoLoja` — chave por slug, respeita estoque máximo

### Telas
- [ ] `/loja/:slug` — vitrine com tenant real, badge "Esgotado" (estoque ≤ 0)
- [ ] `/loja/:slug/produto/:id` — dados reais + fallback mock
- [ ] `/loja/:slug/checkout` — zod + ViaCEP + pré-fill por telefone existente + resumo com preço atualizado do banco + consentimento LGPD obrigatório + erro de estoque por item + estado "loja indisponível" com WhatsApp
- [ ] Tela de confirmação com número do pedido (de `registrar_venda`) + limpeza do carrinho
- [ ] `/loja/:slug/pedidos` — telefone digitado/pré-preenchido, status via `mapStatusVenda`
- [ ] `/loja` (demo sem slug) intacta com mock
- [ ] Badge/label de canal `loja` em `/vendas/pedidos` (verificar existência)

### Qualidade
- [ ] Todos os hooks filtram `empresa_id`
- [ ] `npm run build` OK
- [ ] Deploy Vercel READY + validação mobile pelo fundador
- [ ] Critérios de aceite 1–10 do PRD verificados contra o banco oficial

---

*Criado em 15/09/2026. Próximo passo do pipeline SDD: WIRE (`tracking/wireframe/WIRE-LojaVirtual-DoceE.md`) → aprovação → implementação.*
