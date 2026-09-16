# WIRE — Loja Virtual integrada (vitrine pública `/loja/:slug`)

> **PRD:** `tracking/plans/PRD-LojaVirtual-DoceE.md` · **SPEC:** `tracking/specs/SPEC-LojaVirtual-DoceE.md`
> **Regras:** wireframe entrega **estrutura e função** (design real no OpenDesign) · mobile-first (o cliente final compra pelo celular) · tokens apenas do `DESIGN.md`

---

## 1. Mapa de telas e rotas

```
/loja                      → demo mock (mantida, sem mudança)
/loja/:slug                → [T1] Vitrine
/loja/:slug/produto/:id    → [T2] Produto
/loja/:slug/checkout       → [T3] Checkout  → [T4] Confirmação
/loja/:slug/pedidos        → [T5] Meus pedidos
slug inexistente           → [T6] Loja não encontrada
```

## 2. [T1] Vitrine (`/loja/:slug`) — mobile

```
┌──────────────────────────────────────┐
│  🍰 Doceê da Jú                      │  ← logo + nome_fantasia
│  Doces caseiros em Suzano/SP         │  ← subtítulo fixo da vitrine
├──────────────────────────────────────┤
│  🔍 Buscar no cardápio...            │
├──────────────────────────────────────┤
│  ┌───────────────┐ ┌───────────────┐ │
│  │ [foto]        │ │ [foto]        │ │
│  │ Surpresa de   │ │ Torta de      │ │
│  │ Uva           │ │ Limão         │ │
│  │ R$ 8,00       │ │ ESGOTADO      │ │  ← badge cinza, sem botão
│  │               │ │               │ │
│  │ [ + Adicionar ]│ │  (indisp.)   │ │
│  └───────────────┘ └───────────────┘ │
│  ┌───────────────┐ ┌───────────────┐ │
│  │ [foto]        │ │ ...           │ │
│  │ Bolo de       │ │               │ │
│  │ Cenoura       │ │               │ │
│  │ R$ 45,00      │ │               │ │
│  │ [ + Adicionar ]│ │              │ │
│  └───────────────┘ └───────────────┘ │
├──────────────────────────────────────┤
│  🛒  2 itens · R$ 16,00   [Ver sacola]│  ← barra fixa inferior; some quando vazia
└──────────────────────────────────────┘

Estados:
· loading → 4 skeleton cards
· vazio   → "Nenhum produto disponível no momento" + WhatsApp da loja
· erro    → toast + botão "Tentar novamente"
· fallback mock → mesmo layout com dados mock (flag sutil "demonstração" opcional)
```

**Ações:** tocar card → [T2] · "Adicionar" → incrementa carrinho (máx. = estoque) · barra sacola → [T3].

## 3. [T2] Produto (`/loja/:slug/produto/:id`) — mobile

```
┌──────────────────────────────────────┐
│ [←]            Doceê da Jú           │
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │            [foto grande]         │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
│  Surpresa de Uva                     │
│  R$ 8,00 / unidade                   │
│  ────────────────────────────────    │
│  Brigadeiro gourmet recheado com     │  ← descricao
│  uva, coberto com açúcar cristal.    │
│                                      │
│  Quantidade:      [ − ]  2  [ + ]    │  ← máx. = estoque; esgotado: sem stepper
│                                      │
│  Total:           R$ 16,00           │
├──────────────────────────────────────┤
│  [ + Adicionar à sacola ]            │  ← fixo inferior; esgotado: "Indisponível" (disabled)
└──────────────────────────────────────┘
```

## 4. [T3] Checkout (`/loja/:slug/checkout`) — mobile

```
┌──────────────────────────────────────┐
│ [←]           Finalizar pedido       │
├──────────────────────────────────────┤
│  📋 SEU PEDIDO                       │
│  2× Surpresa de Uva ......... R$ 16,00│
│  1× Bolo de Cenoura ........ R$ 45,00│
│  ──────────────────────────────      │
│  Total ..................... R$ 61,00│  ← recalculado do banco ("preço atualizado" se mudou)
├──────────────────────────────────────┤
│  📱 SEUS DADOS                       │
│  Nome *    [ Maria Silva            ]│
│  Telefone *[(11) 99999-9999        ]│  ← ao completar, busca cliente:
│                                      │     existente → pré-preenche endereço abaixo
│  📍 ENTREGA                          │
│  CEP *     [ 08675-000   🔍 buscar ]│  ← ViaCEP: preenche rua/bairro/cidade/UF
│  Rua *     [ Rua das Flores       ]│  ← editável (decisão D2)
│  Número *  [ 123                  ]│
│  Complemento [ Ap 45 / referência ]│
│  Bairro *  [ Jardim X             ]│
│  Cidade/UF [ Suzano / SP          ]│
│                                      │
│  💳 PAGAMENTO                        │
│  ( ) Pix   (•) Na entrega (dinheiro) │
│                                      │
│  Observações                         │
│  [ Sem morango, por favor           ]│
│                                      │
│  [✔] Autorizo o uso dos meus dados   │  ← obrigatório (LGPD)
│      para processar o pedido. *      │
├──────────────────────────────────────┤
│  [   Confirmar pedido · R$ 61,00   ] │
└──────────────────────────────────────┘

Validações inline (zod): campo com borda vermelha + mensagem abaixo.
Erro de estoque (pré-check RPC):
┌──────────────────────────────────────┐
│  ⚠️ Ajuste seu pedido                │
│  "Torta de Limão": só temos 1 unid.  │
│  [ diminuir para 1 ] [ remover item ]│
└──────────────────────────────────────┘
Banco indisponível: banner "Loja indisponível no momento — pedido pelo
WhatsApp (11) 99999-9999" + botão abre wa.me.
```

## 5. [T4] Confirmação (pós-RPC)

```
┌──────────────────────────────────────┐
│                                      │
│            ✅ (verde menta)          │
│      Pedido recebido, Maria!         │
│                                      │
│   Pedido nº 000042 · R$ 61,00        │
│   Pagamento: na entrega              │
│                                      │
│   A Doceê confirma seu pedido pelo   │
│   WhatsApp e combina a entrega.      │
│                                      │
│   [ Ver meus pedidos ]               │
│   [ Voltar para a loja ]             │
│                                      │
└──────────────────────────────────────┘
```

## 6. [T5] Meus pedidos (`/loja/:slug/pedidos`) — mobile

```
┌──────────────────────────────────────┐
│ [←]          Meus pedidos            │
├──────────────────────────────────────┤
│  Telefone * [(11) 99999-9999 ] [Buscar]│  ← pré-preenchido do último checkout
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │ Pedido 000042      📥 Recebido │  │  ← mapStatusVenda (confirmada → Recebido)
│  │ 2 itens · R$ 16,00             │  │
│  │ Hoje, 14h32 · Pix              │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Pedido 000031      ✅ Entregue │  │
│  │ 1 item · R$ 45,00              │  │
│  │ 10/09, 16h05 · Dinheiro        │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│ vazio → "Nenhum pedido encontrado    │
│ para este telefone."                 │
└──────────────────────────────────────┘
```

**Regra:** sem login, sem senha — só telefone (decisão D4). Cliente novo / telefone sem cadastro → mesmo empty state.

## 7. [T6] Loja não encontrada (slug inválido)

```
┌──────────────────────────────────────┐
│                                      │
│         🏪 (ícone neutro)            │
│      Loja não encontrada             │
│   Verifique o endereço ou fale       │
│      com a UNIQ.                     │
│                                      │
└──────────────────────────────────────┘
```

## 8. Resumo de componentes por tela (para o SPEC §8)

| Tela | Componentes principais |
|---|---|
| T1 Vitrine | header tenant, busca, grid 2 col (mobile) / 3-4 (desktop), card produto (badge Esgotado), barra sacola fixa, skeletons |
| T2 Produto | foto, preço, stepper quantidade (máx. estoque), CTA fixo |
| T3 Checkout | resumo pedido (valores do banco), formulário (zod), CEP com ViaCEP, radios pagamento, consentimento, CTA fixo, modal erro de estoque, banner indisponível |
| T4 Confirmação | nº pedido, resumo, CTAs |
| T5 Meus pedidos | input telefone, cards de pedido com badge de status |
| T6 Não encontrada | estático |

---

*Criado em 15/09/2026. Aguardando aprovação do fundador. Com o WIRE aprovado, a implementação será delegada a especialista (@fixer) seguindo o SPEC.*
