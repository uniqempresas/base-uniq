# PRD — Edição de Produto (dados básicos) + Tags

> **Data:** 2026-09-11
> **Origem:** extensão do feedback de cliente (11/09/2026) — fundador aprovou aplicar o mesmo fluxo de edição/tags a produtos sem nova validação ("pode seguir direto").
> **Tipo:** Feature de uso real (frontend + persistência), seguindo o precedente `PRD-UsoReal-EditarCliente.md`.
> **Audiência:** agente implementador. Documento autocontido.

---

## 1. Resumo Executivo

### 1.1 Objetivo
Tornar a **edição de produto funcional** — hoje os botões Edit2 (card/lista) e "Editar" (detalhe) são inertes — e adicionar **tags de produto** (mesmo conceito de clientes). O produto criado grava em `me_produto`, o hook `useAtualizarProduto` já existe e é importado, mas nada o chama além da exclusão. Após esta entrega, o usuário edita os campos básicos do produto e gerencia tags, a partir da lista ou do detalhe.

### 1.2 Escopo desta entrega
- ✅ Modal de edição reutilizando o form do cadastro (mesmo layout, campos pré-preenchidos, título configurável)
- ✅ Campos não-controlados do `NovoProdutoModal` (código de barras, descrição curta) passam a ser controlados e persistidos
- ✅ Tags de produto: persistidas em `me_produto.opcoes_config` (jsonb, array de strings) — **sem migration, sem tabela nova**
- ✅ Botões de edição funcionais: Edit2 do card, Edit2 da lista e "Editar" do detalhe
- ✅ Estados visuais: loading no botão salvar, erro inline, toast de sucesso
- ❌ Preço promocional, localização, fornecedor, estoque mínimo/máximo: sem coluna no banco — não entram na persistência da edição
- ❌ Exclusão de produto (já existe soft-delete `ativo:false` — inalterado)
- ❌ Variantes, vitrine, unidades de medida (campos sem coluna ou fora do MVP)

### 1.3 Stakeholders
- Fundador (valida pelo celular) — usa o estoque da Doceê no uso real
- Clientes da Doceê — veem catálogo com produtos consistentes

---

## 2. Sobreposição com o existente

| Ponto | Onde está hoje | O que muda |
|-------|----------------|-----------|
| Form (markup + validação) | `NovoProdutoModal` interno de `ProdutosPage.tsx:214-604` | Extraído para componente reutilizável `ProdutoFormModal` (aceita `produtoInicial` + `titulo`) |
| Criação | `use-criar-produto.ts` — INSERT em `me_produto` | Estende params com `codigoBarras`, `descricao`, `tags` → grava em `opcoes_config` |
| Atualização | `use-atualizar-produto.ts` — UPDATE em `me_produto` (usado só na exclusão) | Estende params com `codigoBarras`, `descricao`, `tags`; passa a ser usado pelo modal de edição |
| Tipo `Produto` | `estoqueMockData.ts:24-49` — sem `tags` | Adiciona `tags?: string[]` |
| Mapeamento leitura | `mapProduto` em `use-produtos.ts` / `use-produto.ts` | Lê `opcoes_config` → `tags` (array de strings) |
| Botão Editar (card) | `ProdutosPage.tsx:123-128` — só `e.stopPropagation()` | Abre modal de edição com o produto |
| Botão Editar (lista) | `ProdutosPage.tsx:1005` — sem `onClick` | Abre modal de edição com o produto |
| Botão Editar (detalhe) | `ProdutoDetalhePage.tsx:329-332` e `:459` — sem `onClick` | Abre modal de edição com o produto |
| Tags (catálogo) | `useTags` (`me_tag`) existe, usado por clientes por tenant | Reutiliza o mesmo catálogo de tags no seletor do form de produto |

---

## 3. Regras de Negócio

- **Persistência real:** sem sessão autenticada e `empresa_id` resolvido, NÃO gravar (falha explícita) — mesma regra dos hooks de cliente.
- **Campos editáveis:** `nome_produto`, `sku`, `codigo_barras`, `tipo` (categoria), `preco`, `preco_custo`, `estoque_atual`, `descricao`, `foto_url`, `ativo` + `tags`. Sem coluna = não persistir (estoque mínimo, promoção, localização, fornecedor).
- **Isolamento por tenant:** UPDATE/INSERT filtrados por `id` **e** `empresa_id`.
- **Tags em `opcoes_config`:** persistir apenas strings (ex.: `["promoção","mais vendido"]`). Ao ler, descartar entradas não-string (defensivo para uso futuro da coluna).
- **Modo demo (sem sessão):** modal pode abrir com dados do mock; salvar exige sessão (erro explícito na UI).

---

## 4. Critérios de Aceite

1. Edit2 do card/lista e "Editar" do detalhe abrem o modal com o produto preenchido.
2. Salvar com alterações grava em `me_produto` (incluindo `opcoes_config` de tags e `codigo_barras`/`descricao`), recarrega e mostra toast.
3. Tags selecionadas aparecem no form pré-preenchido e persistem após recarregar.
4. Salvar sem sessão mostra erro (não grava silenciosamente em outro tenant).
5. Estados loading/erro/sucesso presentes.
6. `npm run build` passa; Vercel deploy READY; fundador valida no celular.

---

## 5. Fora de Escopo / Não Fazer

- Não criar/excluir tabelas nem alterar RLS.
- Não tocar em `src/lib/supabase.ts`.
- Não implementar exclusão real (soft-delete atual permanece).
- Não redesenhar o modal (reutiliza layout existente).
- Não migrar para Next.js.