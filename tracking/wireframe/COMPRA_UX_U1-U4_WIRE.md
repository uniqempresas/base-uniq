# WIRE — Compra Experiência (U1–U4) — v1.0

> **Status:** ✅ Aprovado verbalmente pelo fundador (07/10/2026, anotações no celular) — registered retroactively per founder request ("prossiga com os wires como aprovados").
> **Documentos relacionados:** PRD/SPEC em `tracking/plans|specs/` prefixo `*-Compra-Ux-*` (resumido neste arquivo, formato compacto). Fonte de verdade funcional: `tracking/TRACKING_ESTOQUE.md` → seção EXECUÇÃO U2.

## Objetivo

Fazer o fluxo de **compra** funcionar de verdade no mercado, **no celular, durante a compra**: pré-preencher preço com o último valor pago, permitir cadastrar insumo e fornecedor na hora sem sair do contexto da compra.

## Decisões do fundador (U1–U4)

| # | Decisão |
|---|---|
| U1 | Campo **valor da última compra** registrado no produto (uma unidade de compra) e usado para pré-preencher o valor no próximo item digitado + chip "Última vez: R$ X/un · dd/MM" |
| U2 | **Cadastrar insumo na hora** no fluxo da compra (busca sem resultado → mini-sheet: nome/SKU/unidade/unidade de compra/fator) → após criar, o item entra direto na lista da compra |
| U3 | **Cadastrar fornecedor na hora** no fluxo da compra (cadastro simples: nome/telefone/obs, find-or-create) → selecionado imediatamente; edição completa depois em Fornecedores |
| U4 | Experiência **exclusiva de compra** — foco total na tarefa ("estou no mercado"); manter **página de compras** (não modal único) com itens em lista compacta (linha por linha, mobile-first) em vez de tabela larga |
| U5 | (Ideal, próximo) Tela dedicada de compra em vez de modal único — **não agora**, fundador disse explicitamente "não precisa mudar ainda" |

## Comportamentos no WIRE (implementados em `ComprasPage.tsx` + hooks)

- Busca de item → se não existe: mini-sheet `Novo item` (natura forçada = insumo, `exibir_vitrine=false`); ao criar, entra na lista da compra automaticamente.
- Busca de item → se existe: valor `unitário` pré-preenchido com `ultimo_preco_compra` (editável) + chip com data da última compra.
- Fornecedor: botão `+ Novo fornecedor` sempre visível → mini-sheet simples → selecionado na hora. Link "cadastro completo" avisa que os itens digitados serão perdidos antes de fechar.
- Modais/sheets: header/footer sticky, inputs 16px, alvos ≥ 44px, sheet bottom mobile (commit `ca00cbf` + U2).

## Banco (aplicado + catch-up no repo)

- `me_produto.ultimo_preco_compra numeric`, `me_produto.ultima_compra_em date` (nullable) — migration `20261007090000_ultimo_preco_compra_catchup.sql`.
- RPC `receber_compra` grava ambos no recebimento (fonte: def da função viva em produção).
- `me_fornecedor.telefone`, `me_fornecedor.observacoes` já existiam no banco.
