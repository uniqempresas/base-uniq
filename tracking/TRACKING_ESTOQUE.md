# 📦 TRACKING ESTOQUE — mapeamento do módulo (06/10/2026)

> **Motivação (WHY):** trazer a operação do Estoque da Doceê para o tracking antes de seguir para a Semana 3 (HQ Gráfica). A vitrine depende do estoque (`estoque_atual` controla o "Esgotado"), e o módulo tem um pé no banco real e outro em mock.
>
> **Fonte:** recon de código completo (06/10/2026, @explorer), arquivo por arquivo, com `arquivo:linha` verificado.
>
> ⚠️ **Este documento é a fonte do estado do Estoque.** O `TRACKING.md` mantém o "porquê" e as decisões; este mantém o mapa técnico.

---

## ✅🟡❌ Estado geral — Real / Mock / Não existe

| # | Funcionalidade | Status | Onde |
|---|---|---|---|
| 1 | Consultar estoque (lista/detalhe/KPIs do dashboard) | ✅ Real | `use-produtos.ts:123` · `use-produto.ts:126` · `EstoqueDashboardPage.tsx:56-64` |
| 2 | Editar produto + estoque mínimo | ✅ Real | `ProdutoFormModal.tsx:116-117,:140-141` → `use-atualizar-produto.ts:62-63` |
| 3 | Cadastro de produto (criar/duplicar/foto) | ✅ Real | `use-criar-produto.ts:50-72` · `use-upload-produto.ts:44-57` |
| 4 | Categorias (CRUD real na tela de configurações) | ✅ Real | `ConfiguracoesProdutosPage.tsx:23-26` → `use-categorias.ts:159,:207,:234` |
| 5 | Baixa automática de estoque por venda | ✅ Real | RPC `registrar_venda` (`migrations/20260923000000_…:245-247`) — vitrine (`use-loja-criar-pedido.ts:195`) e n8n |
| 6 | Devolução de estoque ao excluir pedido cancelado | ✅ Real | `migrations/20260918120000_…:84` |
| 7 | Ajuste de estoque unitário (entrada/saída por produto) | ✅ Real | `AjustarEstoqueModal` (`ProdutoDetalhePage.tsx:62-256`) → UPDATE `:119` + INSERT `est_movimentacao` `:125` |
| 8 | Vitrine "Esgotado" controlada por estoque | ✅ Real | `use-loja-produtos.ts:40` · `use-carrinho-loja.ts:64-65,:73` · `use-loja-produto.ts:65,:73` |
| 9 | Alerta de estoque baixo no próprio Estoque | ✅ Real (exibição) | `EstoqueDashboardPage.tsx:60,:64,:265` · `ProdutosPage.tsx:486-503` |
| 10 | Movimentações — **ler/extrato/tela** | 🟡 Mock | `MovimentacoesPage.tsx:299` · `EstoqueDashboardPage.tsx:63,28` — **nenhum SELECT em `est_movimentacao`** |
| 11 | Modal "Nova Entrada/Saída" da Movimentações | 🟡 **Fake** | `MovimentacoesPage.tsx:60-66` — `setTimeout` de 1200ms, **não grava nada**; botão "Cancelar" da tabela sem handler (`:577-584`) |
| 12 | Gráficos do dashboard (movimentação/valor do estoque) | 🟡 Hardcode | `MOVIMENTACAO_DATA`/`VALOR_ESTOQUE_DATA` (`EstoqueDashboardPage.tsx:34-51`) |
| 13 | Alerta de estoque baixo no Dashboard geral | 🟡 Mock | `DashboardPage.tsx:49,:57,:66` |
| 14 | Filtro de categoria da lista de produtos | 🟡 **Bug** | `ProdutosPage.tsx:53,:553` — chips derivadas do mock `PRODUTOS`, não batem com produtos reais |
| 15 | Migrations versionadas (`est_movimentacao`, `estoque_minimo`) | 🟡 **Drift** | 0 arquivos em `supabase/migrations/` — colunas/tabela existem só no banco |
| 16 | Entrada em lote / compra / inventário / custo médio | ❌ Não existe | Campo "Custo unitário" do ajuste é só visual (`ProdutoDetalhePage.tsx:218-227`), não grava |
| 17 | Baixa via PDV | ❌ Não existe | PDV é mock (`pdvMockData.ts`) — B1 |
| 18 | Ponto de entrada de menu p/ Estoque | ❌ Parcial | Ver seção Rotas (B11 atualizado) |

---

## 🖥️ Telas do módulo

| Tela | Rota (lazy) | Dados |
|---|---|---|
| `EstoqueDashboardPage.tsx` | `/estoque/dashboard` (`routes.tsx:91`) | KPIs reais de `useProdutos`; movimentações recentes (`slice(0,5)`) + gráficos mock; estados loading/error/fallback/empty completos |
| `ProdutosPage.tsx` | `/estoque/produtos` (:92) | CRUD real; filtro de categoria ainda do mock |
| `ProdutoDetalhePage.tsx` | `/estoque/produtos/:id` (:93) | Real; abas; AjustarEstoqueModal real; movimentações só mock em fallback |
| `MovimentacoesPage.tsx` | `/estoque/movimentacoes` (:94) | **100% mock**; modal de criação fake |
| `ConfiguracoesProdutosPage.tsx` | `/estoque/configuracoes` (:95) | CRUD de categorias real |
| `ProdutoFormModal.tsx` (`components/produto/`, compartilhado) | — | Criar/editar/duplicar real, 3 steps, foto, estoque/estoqueMinimo |

## 🛣️ Rotas + B11 (status atualizado em 06/10/2026)

- 6 rotas `/estoque/*`, todas lazy; `/estoque` → redirect dashboard (`routes.tsx:90`).
- **B11 evoluiu:** `/estoque/dashboard` ganhou entrada indireta via **Meus Módulos** (`lib/moduloRoutes.ts:7` → `MODULO_ROUTES.estoque`, consumido em `MeusModulosPage.tsx:54,:78,:403`). O achado original de "nenhum componente navega" está **parcialmente superado**.
- Continua sem entrada de menu: **`/estoque/movimentacoes`** (só de dentro do dashboard, `EstoqueDashboardPage.tsx:96,:343`).
- Rail não tem item Estoque; subnav só expõe Produtos (`AppLayout.tsx:91` — Cadastros) e Categorias (`:121` — Loja Virtual).

## 🧩 `est_movimentacao` — fatos

- **Escrita:** único INSERT no app em `ProdutoDetalhePage.tsx:125-134` (depois do UPDATE do estoque). Colunas usadas: `empresa_id`, `produto_id` (integer), `tipo` (`entrada|saida`), `quantidade`, `motivo`, `usuario_id`. **`observacao` não é enviada** (coluna não confirmada no código).
- **Leitura:** **nenhuma** — não existe `use-movimentacoes`. Grep em todo o repo: só escrita + docs.
- **Migration:** **nenhuma** no repo — a tabela vive só no banco (drift).
- **Sem vinculação a venda:** as movimentações da tabela não têm `venda_id` — baixa por venda entra direto na RPC, sem linha de movimentação. *(Confirmar intenção: extrato deve mostrar baixas de venda? Decisão de produto.)*

## 🔒 Escritas de `estoque_atual` (quem toca o valor)

1. RPC `registrar_venda` — baixa por venda (vitrine + WhatsApp/n8n).
2. RPC `fn_excluir_pedido_cancelado` — devolve estoque.
3. `AjustarEstoqueModal` — entrada/saída unitária por produto (motivos: Compra, Devolução, Ajuste, Produção, Inventário, Perda, Quebra, Doação…).
4. `ProdutoFormModal` — valor absoluto no criar/editar.

**Não existe:** entrada por compra/NF com fornecedor · ajuste em lote/inventário contábil · custo médio · baixa no PDV (B1).

---

## 🐞 Achados novos (06/10/2026)

| # | Achado | Evidência | Gravidade |
|---|---|---|---|
| **N1** | Filtro de categoria da `ProdutosPage` deriva chips do **mock** `PRODUTOS` (`CATEGORIAS` :53) e usa no filtro (`:553`) — com produtos reais, as chips não batem com o catálogo | `ProdutosPage.tsx:25,:53,:553` | 🟡 Bug silencioso (não quebra, engana) |
| **N2** | `est_movimentacao` e a coluna `estoque_minimo` **não têm migration no repo** — schema existe só no banco (o `fix-7` criou a coluna direto no banco) | grep em `supabase/migrations/` = 13 arquivos, zero menções | 🟡 Drift de schema (risco de clone limpo não reproduzir) |
| **N3** | `MovimentacoesPage` 100% mock: modal "Nova Entrada/Saída" simula salvamento (`setTimeout` 1200ms) e botão "Cancelar" da tabela não tem handler — **parece que grava e não grava** | `MovimentacoesPage.tsx:22,:54,:60-66,:577-584` | 🟠 Quebra confiança (mesma classe de "Ação em massa toast fake" do passado) |
| **N4** | Gráficos do dashboard são `MOVIMENTACAO_DATA`/`VALOR_ESTOQUE_DATA` hardcode | `EstoqueDashboardPage.tsx:34-51` | Baixa (demo) |
| **N5** | Hook `use-registrar-venda.ts` completo, sem nenhum consumidor (órfão) | `use-registrar-venda.ts:35` | Baixa (limpeza) |
| **N6** | Campo "Custo unitário" do AjustarEstoqueModal é puramente visual — não calcula custo nem grava | `ProdutoDetalhePage.tsx:218-227` | Baixa (decisão de produto: Remover ou viabilizar) |
| **N7** | Botões mortos: Importar/Exportar (`ProdutosPage.tsx:468-472`), Imprimir etiqueta / Inativar / Fazer pedido ao fornecedor / Adicionar variação (`ProdutoDetalhePage.tsx:593,:678,:717`); aba Variações morta em dados reais (`possuiVariacoes` sempre false) | ver refs | Baixa (cosmético) |
| **N8** | `CATEGORIAS_DINAMICAS` declarado e nunca usado | `ProdutosPage.tsx:306` | Baixa (limpeza) |

## 📌 Backlog novo (formato TRACKING.md — B14+)

- **B14 — Movimentações reais:** criar `use-movimentacoes` (SELECT `est_movimentacao` com `empresa_id` + filtro por produto/datas), trocar mock na `MovimentacoesPage` + "Movimentações recentes" do dashboard; decidir se baixa de venda cria linha de movimentação (tabela sem `venda_id` hoje); corrigir/remover o modal fake da Movimentações. Prioridade: **Alta** (é o único bloco de leitura do estoque inteiramente mock).
- **B15 — Filtro de categoria com categorias reais:** `ProdutosPage` passa a listar chips de `useCategorias` (já tem o hook carregado na tela, `:270`) em vez do mock. Prioridade: **Alta** (hotfix ~20 linhas).
- **B16 — Migrations de catch-up:** versionar `est_movimentacao` (tabela) e a coluna `estoque_minimo` + índices, espelhando o banco real (verificado antes de escrever). Prioridade: **Média**.
- **B17 — (limpeza) remover/use `use-registrar-venda` órfão**, `CATEGORIAS_DINAMICAS`, gráficos hardcode do dashboard, botões mortos (N4–N8). Prioridade: **Baixa**.

> B11 (ponto de entrada de menu) segue registrado no `TRACKING.md` com o update acima — decisão do fundador de 23/09 (*"não vamos movimentar com estoque agora"*) pode ser reaberta agora que o Estoque entrou no plano.

---

## 🔑 Pendências que dependem do fundador

1. **Extrato de movimentação deve mostrar a baixa de venda?** A RPC baixa estoque **sem** gravar linha em `est_movimentacao` — se a esposa consultasse o extrato hoje, a baixa do pedido não aparece no histórico.
2. **Modal da Movimentações:** virar real (grava igual ao AjustarEstoque por produto) ou ser removido (a entrada/saída unitária já existe no detalhe do produto)?
3. **Custo unitário / custo médio:** remover o campo visual ou viabilizar (custo médio impacta Financeiro — CMV).
4. **B11:** reabrir (item de Estoque no subnav "Minha Empresa" junto a Produtos) ou manter como está?

---

## 🚀 EXECUÇÃO — 06/10/2026 (lote Estoque do dia)

| Item | Resultado |
|---|---|
| **B15** | ✅ Feito (lane `fix-1`) — chips do filtro de `ProdutosPage` derivadas de `useCategorias` (real); mock só no fallback demo |
| **B17a** | ✅ Feito — "Custo unitário" removido do `AjustarEstoqueModal` (decisão do fundador) |
| **B17b** | ✅ Feito — `use-registrar-venda.ts` apagado (0 importações), botões mortos removidos (Importar/Exportar, Imprimir etiqueta, Inativar, Fazer pedido ao fornecedor) |
| **B16** | ✅ Migration `20261006090000_estoque_catchup.sql` escrita com o schema **real** (information_schema/pg_constraint — zero inferência) e aplicada em produção via MCP |
| **F5** | ✅ **Já resolvido em 21/09** (migrations `registrar_venda_fix_forma_pagamento_deterministica` + `_nulls_last`); re-verificado na função viva em 06/10 |
| **B14** | ✅ **Implementado** (WIRE aprovado pelo fundador no GitHub) — commit `7f78d1d`: `types/estoque.ts` · `use-movimentacoes.ts` (leitura embed produto + responsável via `me_usuario` 2ª query) · `use-registrar-movimentacao.ts` (escrita compartilhada, ordem estoque→histórico, com `observacao` N10) · `AjustarEstoqueModal` único compartilhado detalhe/extrato (bottom-sheet mobile) · extrato/dashboard/detalhe reais · "Cancelar" removido (D4) · prova no banco OK (INSERT + ROLLBACK). **Faltando apenas validação do fundador no celular** |

**Correções de registro (honestidade) sobre o mapeamento de ontem:**
1. **N2 era outro problema:** `est_movimentacao` (`create_est_movimentacao_v2`, 25/11/2025) e `estoque_minimo` (`add_estoque_minimo_me_produto`, 18/09) **existem no histórico de migrations remoto** — o que faltava era o **arquivo no repo** (`supabase/migrations/` tem só 13 dos ~150 aplicados). Drift é **repo ↔ histórico**, não schema faltante.
2. **N9 — bug real novo:** o CHECK da tabela exigia `('ENTRADA','SAIDA','AJUSTE')` maiúsculo e o app insere `'entrada'/'saida'` → **todo INSERT do app falhava com 23514** (o estoque mudava — UPDATE roda primeiro — mas o histórico nunca nascia; por isso a tabela estava vazia). Corrigido: CHECK minúsculo na migration catch-up (tabela vazia = troca segura). Prova: INSERT de teste `tipo='entrada'` com ROLLBACK — aceito.
3. **N10 — bug real novo:** o campo "Observação" do `AjustarEstoqueModal` (`:72` estado, `:218` textarea) **nunca era enviado** no INSERT (`:131`) e a coluna não existia — dado digitado descartado silenciosamente. Migration `est_movimentacao_observacao` aplicada (`observacao text`); o B14 grava o campo.
4. **RLS:** `est_movimentacao` tem RLS **ligada** com 4 políticas permissivas (SELECT público; INSERT/UPDATE/DELETE `authenticated` **sem escopo de tenant**). Anotar em `BACKLOG_SEGURANCA.md`.

**Fatos do schema real (fonte para o B14):** `id uuid PK default gen_random_uuid()` · `empresa_id uuid NOT NULL FK me_empresa CASCADE` · `produto_id integer NOT NULL FK me_produto CASCADE` (embed PostgREST funciona) · `tipo text CHECK ('entrada','saida','ajuste')` · `quantidade numeric NOT NULL` · `data_movimentacao timestamptz NOT NULL default now()` (data de negócio) · `motivo text` · `observacao text` · `usuario_id uuid FK auth.users` (não `me_usuario`) · `created_at timestamptz` · índices `(empresa_id, data_movimentacao DESC)` e `(produto_id)` · **sem** `venda_id`/custo.

## 🏭 PRODUÇÃO COM BOM — viabilidade aprovada, Fase 1 aberta (06/10/2026)

> **Documento do domínio:** a especificação funcional completa do fluxo (livro-razão + ficha técnica/BOM + OP + custo médio) está na conversa com o fundador; os docs SDD por fase vivem em `tracking/plans|specs|wireframe/` com prefixo `*-Producao-*`.

**Veredicto da análise:** viável integralmente no Supabase atual (padrão RPC transacional idêntico ao `registrar_venda`); `est_compra`/`est_compra_item` já existem no banco ociosas; `est_movimentacao` evolui para ledger (tabela vazia = migração segura). Risco real = escopo (trata-se com fases + piloto de 1 produto).

**Decisões do fundador (06/10/2026):**
| # | Decisão |
|---|---|
| P1 | No cadastro de produto: **natureza simples × composto** — simples = "compro 1, vendo 1" (fluxo atual); composto = tem **ficha técnica** com insumos do estoque (barra de chocolate etc.) |
| P2 | Custo = **média ponderada móvel** (aplicação na Fase 2) |
| P3 | Processo: **cada fase sobe WIRE no GitHub** para o fundador validar (celular) antes da implementação |
| P4 | Eixo NOVO `natureza` (`simples\|composto\|insumo`) — **não** sobrescreve o `me_produto.tipo` legado (simples/variavel — colisão de nome resolvida; lição D-V2.1) |
| P5 | Semiacabado = **composto aninhado** (composto que serve de componente) — sem enum próprio |

**Cronograma de fases (MVPs sequenciais, cada um com PRD/SPEC/WIRE próprio):**
1. **Fase 1 — ✅ IMPLEMENTADA (07/10/2026, commit `3db5d5d`, deploy verificado por marcador):** WIRE aprovado pelo fundador ("Aprovadíssimo"). Entregue: `me_produto.natureza` (default 'simples' — 26 produtos existentes válidos, verificado por query), tabela `est_ficha_tecnica` com guardas (auto-ref bloqueada, `UNIQUE (pai, componente)`), RPC `salvar_ficha_tecnica` (SECURITY DEFINER, snapshot atômico, lista vazia apaga — **4 caminhos provados em produção**), rádio Natureza no cadastro + step condicional "Ficha Técnica" com busca de componentes, chip na lista (Simples sem chip), aba "Ficha Técnica" no detalhe, insumo força `exibir_vitrine=false` em 2 camadas. RLS de `est_ficha_tecnica`: **desligada** (padrão do projeto — anotar no P5). `tsc` 0 · build OK. **Falta: validação do fundador no celular (ficha da Trufa de Maracujá).**
2. **Fase 2 — ✅ IMPLEMENTADA (06/10/2026, commits `bdbd52e` feat + docs `37420c9`):** PRD/SPEC/WIRE v1.1 aprovados pelo fundador (GitHub) com **emenda D11** (Nova Compra: já recebida agora / agendar `data_prevista` / só registrar). Migrations `producao_fase2_compra_conversao` (unidade_compra + fator_conversao no insumo, `me_contas_pagar.compra_id`, data_prevista, CHECK itens positivos) e RPC `receber_compra` (estoque com conversão + custo médio ponderado + movimentação + conta a pagar pendente vinculada + compra RECEBIDO — 4 caminhos provados: sucesso, conta criada, compra RECEBIDO, 2ª chamada bloqueada). Front: `ComprasPage` (KPIs, lista, modais Nova/Receber/Cancelar/Detalhe, modais fora do gate de loading) + 5 hooks novos (use-compras, use-criar-compra, use-receber-compra, use-cancelar-compra, use-fornecedores) + grupo "Compra e conversão" no ProdutoFormModal (só insumo). Rota `/estoque/compras` + item na rail Estoque. tsc 0 · build OK. **Falta: validação do fundador na Vercel.**
3. **Fase 3 — ✅ IMPLEMENTADA (06/10/2026, commits docs `1818165` + feat `4c7148f`):** PRD/SPEC/WIRE do "Produzir lote" (fundador autorizou construir F2+F3 seguidas e validar o conjunto na Vercel). Decisões D12-D15: OP transacional única RPC (`registrar_producao` — all-or-nothing, perda da ficha no consumo D15, sem estorno D13, explosão recursiva adiada D14); tabelas `est_ordem_producao` + `est_ordem_producao_item` (auditoria: consumo + custo médio usado por item); entrada do acabado com custo médio ponderado na entrada (D9). **Provas SQL:** lote 4 cones (choc 1→0 kg, cone 10→6, recheio 600→360 g, custo apurado R$ 26,90/un) e lote insuficiente recusado com mensagem nominal e rollback intacto. **Bug preso na prova e consertado:** temp table `_op_ficha` colidindo em 2 chamadas na mesma transação (`DROP IF EXISTS` antes do CREATE) + fix de legados com estoque negativo (id 24/-4 UNIQ demo, id 54/-1 HQ Gráfica — zerados, documentado). Front: aba "Produção" no detalhe de composto (custo/un ao vivo, custo pendente → CTA Compras, semáforo de estoque no modal, histórico de OPs) + hooks `use-ordens-producao`/`use-registrar-producao`. tsc 0 · build OK · **deploy Vercel READY verificado (bundle `index-Bk9G6g3C.js`).** **Falta: validação do fundador na Vercel (produzir lote do Cone Limão).**
4. **Fase 4 — 🔜 PRÓXIMA:** venda grava CMV no ledger + DRE lê custo apurado (aposenta heurística de categorias — B12 fecha junto); considerar estorno de OP (D13) e explosão recursiva (D14) aqui.

---

*Documento gerado do recon de 06/10/2026. Referências: `TRACKING.md` (B1, B11, F3, item 3 do lote), `TRACKING_MODULOS.md:198` (A12 — dependência vitrine↔estoque), `BACKLOG_SEGURANCA.md:68,:76,:99` (drenagem de estoque via `anon` — P5).*
