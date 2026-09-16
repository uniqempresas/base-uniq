# PRD — Loja Virtual: vitrine pública integrada (pedido cai na Base UNIQ)

> **Origem:** laboratório Doceê (Onda 1) — o cliente final compra pela vitrine e o pedido aparece na Base UNIQ como "Recebido", entrando no mesmo fluxo de status dos pedidos de WhatsApp/PDV.
> **Contexto técnico:** a vitrine `src/app/components/loja/` já existe (mock-only: `LojaPage`, `ProdutoLojaPage`, `CheckoutPage`, `MeusPedidosPage`, `lojaMockData.ts`). O gap é a integração.
> **Backend pronto (não recriar):** `me_produto` (com flag `exibir_vitrine`), `me_cliente`, RPC `registrar_venda` (venda + itens + conta a receber + baixa de estoque).
> **Decisões do fundador (15/09/2026):** v1 = vitrine + pedido simples, **sem pagamento online** (cliente escolhe Pix ou pagamento na entrega); produtos da loja = os mesmos de `me_produto`.

---

## 1. Objetivo

O pedido feito na vitrine pública da Doceê vira **venda real no banco** — `me_venda` + `me_itens_venda` + conta a receber + baixa de estoque — via RPC `registrar_venda` com `p_origem='loja'`, e aparece na Base UNIQ (tela Pedidos) como **Recebido**, pronto para a esposa confirmar, separar e entregar.

> **Por que importa:** hoje a vitrine é um falso amigo — o cliente monta o carrinho, "finaliza" e nada acontece. É a mesma classe de bug que o fluxo n8n corrigiu para o WhatsApp (itens 13/14 do uso real), agora no canal loja. Fechando isso, a Doceê vende por 3 canais (balcão/PDV, WhatsApp, vitrine) com um único fluxo de pedidos.

## 2. Problema

1. **Checkout da vitrine não grava nada** — carrinho e pedidos vivem em localStorage (`lojaMockData.ts`). O pedido do cliente final morre no navegador dele.
2. **Vitrine não lê o banco** — produtos exibidos são mock; `me_produto.exibir_vitrine` ("Mostrar na loja") já existe e não é consumido pela vitrine.
3. **Sem identificação do cliente** — pedido sem `cliente_id` não vincula ao `me_cliente`; a esposa não sabe quem pediu.
4. **Módulo sem SDD** — a vitrine foi construída fora do pipeline; não há PRD/SPEC/WIRE (este documento corrige isso).

## 3. Solução

**Princípio (herdado do fluxo n8n): vitrine coleta a intenção, banco decide os dados.**

| Camada | Responsabilidade |
|---|---|
| **Vitrine (front público)** | Exibe catálogo real (`me_produto` com `exibir_vitrine=true`, estoque > 0), monta carrinho, coleta dados do cliente (nome, telefone, endereço de entrega, forma de pagamento) |
| **Checkout** | Monta `p_itens` com **id e preço canônicos do banco** (nunca do navegador), recalcula o total, valida com zod, chama RPC `registrar_venda` com `p_origem='loja'` / `p_status='confirmada'` |
| **Banco (RPC)** | Registra venda, baixa estoque, cria conta a receber |
| **Base UNIQ (Pedidos)** | Exibe o pedido como Recebido (canal `loja`); esposa conduz o fluxo de status existente |

Regras:
1. **Nenhum preço/id vem do client** — o checkout busca os dados canônicos do produto no banco no momento de gravar (mesmo padrão do sub-workflow n8n).
2. **Pagamento na v1 não passa pela loja** — `forma_pagamento` é apenas registrada (Pix ou Dinheiro/na entrega); o dinheiro é confirmado pela esposa no fluxo de pagamento existente (`useConfirmarPagamento`).
3. **Cliente é find-or-create por telefone** — igual ao `useCriarPedido` atual: busca `me_cliente` por telefone normalizado; se não existir, cria com `origem='loja'`.
4. **Sem login para o cliente final** — a vitrine é pública; o acompanhamento ("Meus pedidos") é por telefone informado no checkout.

## 4. Escopo

### ✅ Dentro da v1
- Hooks da vitrine sobre o Supabase oficial (`krrkfgv...`): catálogo da loja (`me_produto` + `exibir_vitrine`), criação de pedido via RPC, consulta de pedidos por telefone.
- Vitrine, produto, checkout e "meus pedidos" com **dados reais priorizados + fallback mock** (regra mock-first vigente).
- Checkout validado (zod): nome, telefone (obrigatórios), endereço de entrega (obrigatório — Doceê entrega), forma de pagamento (Pix / Dinheiro na entrega), observações (opcional).
- Consentimento LGPD no checkout (checkbox obrigatório — pendência P3, mínimo viável).
- Pedido aparece em `/vendas/pedidos` como **Recebido** com canal `loja` (badge de origem), sem nenhuma mudança no módulo Pedidos.
- Badge de canal `loja` na lista/detalhe (padrão do badge WhatsApp existente).

### ❌ Fora de escopo (v1)
- Pagamento online (Pix automático, gateway, Mercado Pago/Asaas).
- Cálculo de frete (campo `me_venda.frete` existe; v1 grava 0).
- Cupons, avaliações, favoritos, área do cliente com login.
- RLS/políticas públicas para a vitrine (pendência P5 — v1 roda no laboratório; **revisar antes de cliente real**).
- Personalização visual por lojista (`me_empresa.store_config`/`appearance` — backlog).
- Notificação automática do cliente (WhatsApp/SMS) — a esposa confirma pelo canal que já usa.

## 5. Decisões (resolvidas pelo fundador em 15/09/2026)

| # | Decisão | Resolução |
|---|---|---|
| D1 | Resolução do tenant na vitrine pública | ✅ **Slug multi-tenant**: rota `/loja/:slug` resolve `me_empresa.slug` (campo já existe no schema). `/loja` sem slug mantém o demo atual com mock. |
| D2 | Endereço de entrega | ✅ **Preferir endereço existente, editável a partir do CEP**: cliente identificado por telefone tem endereço de `me_cliente` pré-preenchido; se vazio ou alterado, preenchimento livre iniciado pelo CEP com consulta ViaCEP (viabiliza backlog B5). |
| D3 | Estoque esgotado na vitrine | ✅ **Exibir "Esgotado"**: produto aparece na vitrine com selo e sem botão de comprar. |
| D4 | "Meus pedidos" sem login | ✅ **Sem login e senha na v1** (decisão do fundador: algo mais simples no início): identificação do cliente **apenas por telefone** — no checkout e em "Meus pedidos". Se um dia precisar de mais robustez, o caminho é magic link via WhatsApp, nunca usuário+senha para o cliente final. |

## 6. Stakeholders

- **Esposa (Doceê):** recebe o pedido na Base UNIQ e opera o fluxo de status; não toca na vitrine.
- **Cliente final da Doceê:** compra pelo celular, escolhe Pix ou pagamento na entrega.
- **Fundador:** valida pelo celular (GitHub + Vercel) e decide D1–D4.

## 7. Critérios de aceite

| # | Critério | Como validar |
|---|---|---|
| 1 | Vitrine exibe produtos reais da Doceê com `exibir_vitrine=true` | Comparar vitrine vs. `me_produto` do tenant |
| 2 | Pedido finalizado grava `me_venda` + `me_itens_venda` com id/preço do banco | Comprar 2× "Surpresa de Uva" na vitrine; conferir no banco |
| 3 | `valor_total` = soma real dos itens (recalculado no checkout) | Conferir vs. catálogo |
| 4 | Estoque baixou na quantidade vendida | Conferir `me_produto.estoque_atual` |
| 5 | Cliente vinculado: telefone existente reaproveita `me_cliente`; novo telefone cria cliente `origem='loja'` | Conferir `me_cliente` |
| 6 | Pedido aparece em `/vendas/pedidos` como **Recebido** com badge de canal loja | Abrir a Base UNIQ como esposa |
| 7 | Conta a receber criada (RPC) com forma de pagamento escolhida | Conferir `me_contas_receber` |
| 8 | Banco vazio/erro → vitrine abre com mock realista (fallback), nunca tela branca | Desligar rede / esvaziar tabela em teste |
| 9 | Checkout impede envio sem consentimento LGPD e sem campos obrigatórios | Tentar enviar incompleto |
| 10 | Mobile: compra completa em tela ~360px sem quebra | Validar pelo celular (Vercel) |

## 8. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Preço adulterado no navegador grava valor errado | Checkout re-resolve id/preço no banco antes da RPC (regra 1); total recalculado no front a partir dos dados canônicos |
| RPC chamada com anon key aberta ao público | Aceito no laboratório (RLS geral desligado — P5); **antes de qualquer cliente real**, endurecer com função público com `SECURITY DEFINER` + validação de tenant ou chave de loja |
| Telefone digitado errado → pedido órfão / cliente duplicado | Máscara + validação zod; find-or-create por telefone normalizado; esposa pode vincular manualmente no detalhe do pedido |
| Estoque exibido desatualizado (2 clientes compram o último item) | Baixa atômica na RPC; se estoque insuficiente, RPC falha e checkout exibe erro amigável pedindo para remover o item |
| LGPD (P3) ainda em aberto | Consentimento mínimo no checkout + dados apenas de nome/telefone/endereço; revisão formal antes do funil/clientes reais |

---

*Criado em 15/09/2026. Próximo passo do pipeline SDD: SPEC (`tracking/specs/SPEC-LojaVirtual-DoceE.md`) após aprovação deste PRD e decisões D1–D4.*
