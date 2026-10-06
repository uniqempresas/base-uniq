# SPEC — Produção Fase 1: Natureza do Produto + Ficha Técnica (BOM)

**Data:** 06/10/2026 · **PRD:** `tracking/plans/PRD-Producao-BOM-Fase1.md` · **WIRE:** `tracking/wireframe/WIRE-Producao-Fase1-FichaTecnica.md`

---

## 1. Fonte da verdade — o que foi verificado no banco/código (06/10/2026)

- `me_produto`: `id integer` PK · `nome_produto` · `sku` · `preco/preco_varejo/preco_custo numeric` · `estoque_atual integer` · `estoque_minimo integer NOT NULL default 5` · `unidade text` · `foto_url text` · `categoria_id integer` · `exibir_vitrine boolean` (default true desde 22/09) · `ativo boolean`.
- `me_produto.tipo`: legado de **variações** (`simples`/`variavel`/`Outros`) — **colisão de nome com o pedido**; não tocar (PRD D5).
- `est_movimentacao` já é a base do ledger do Estoque (B14 no ar) — **Esta fase NÃO mexe nela**.
- Modal compartilhado: `src/app/components/produto/ProdutoFormModal.tsx` (steps atuais em `STEPS` :14; criar/editar via `use-criar-produto.ts:50-72` / `use-atualizar-produto.ts:72-76`; foto via `use-upload-produto.ts`).
- Vitrine lê só `exibir_vitrine=true` (hook `use-loja-produtos.ts:70-73`).

## 2. Migration — `20261006xxxxxx_producao_fase1_natureza_ficha.sql`

```sql
ALTER TABLE me_produto
  ADD COLUMN IF NOT EXISTS natureza text NOT NULL DEFAULT 'simples';
-- CHECK em ALTER existente: validar antes (sem linhas fora do domínio esperado:
-- 16 produtos Doceê + 3 demo → default 'simples' cobre)
ALTER TABLE me_produto
  DROP CONSTRAINT IF EXISTS me_produto_natureza_check;
ALTER TABLE me_produto
  ADD CONSTRAINT me_produto_natureza_check
  CHECK (natureza IN ('simples', 'composto', 'insumo'));

CREATE TABLE IF NOT EXISTS est_ficha_tecnica (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id              uuid NOT NULL REFERENCES me_empresa(id) ON DELETE CASCADE,
  produto_pai_id          integer NOT NULL REFERENCES me_produto(id) ON DELETE CASCADE,
  componente_id           integer NOT NULL REFERENCES me_produto(id) ON DELETE CASCADE,
  quantidade_por_unidade  numeric NOT NULL CHECK (quantidade_por_unidade > 0),
  perda_pct               numeric NOT NULL DEFAULT 0 CHECK (perda_pct >= 0),
  criado_em               timestamptz NOT NULL DEFAULT now()
);
-- guardas estruturais
ALTER TABLE est_ficha_tecnica
  DROP CONSTRAINT IF EXISTS est_ficha_tecnica_auto_ref_check;
ALTER TABLE est_ficha_tecnica
  ADD CONSTRAINT est_ficha_tecnica_auto_ref_check
  CHECK (componente_id <> produto_pai_id);
-- 1 ficha por item pai: componente aparece 1 vez (ajuste é editar)
CREATE UNIQUE INDEX IF NOT EXISTS ux_ficha_pai_componente
  ON est_ficha_tecnica (produto_pai_id, componente_id);
CREATE INDEX IF NOT EXISTS idx_ficha_tecnica_pai
  ON est_ficha_tecnica (produto_pai_id);
```

## 3. Tipos — `src/app/types/producao.ts` (NOVO)

```ts
export type NaturezaProduto = "simples" | "composto" | "insumo";

export interface ItemFichaTecnica {
  id: string;
  componenteProdutoId: string;   // me_produto.id (integer como string na UI)
  componenteNome: string;
  componenteSku: string;
  componenteUnidade: string;     // 'g' | 'ml' | 'un'
  quantidadePorUnidade: number;  // qty na unidade base, por 1 un do pai
  perdaPct: number;              // 0..100
}

export interface FichaTecnica {
  produtoId: string;
  natureza: NaturezaProduto;
  itens: ItemFichaTecnica[];
}
```

- `types/produto.ts`: `Produto` ganha `natureza?: NaturezaProduto` (default implicito `'simples'` no mapper quando ausente — mock antigo não tem o campo).
- Mocks: sem mudança de dados (mock padrão `simples`).

## 4. Hooks

| Hook | Contrato |
|---|---|
| `use-produtos.ts` / `use-produto.ts` | SELECT passa a incluir `natureza`; mapper: `natureza ?? 'simples'`. Sem fallback novo (mesmo padrão atual) |
| `use-criar-pproduto` / `use-atualizar-produto` | Payload grava `natureza` (sempre; default `'simples'`) e se insumo força `exibir_vitrine: false` |
| `use-ficha-tecnica.ts` (NOVO) | `useFichaTecnica(produtoPaiId)` → leitura: `est_ficha_tecnica` com embed `me_produto(nome_produto, sku, unidade)` no `componente_id`, `.eq("empresa_id")`, order `criado_em`. Sem sessão → lista vazia (modo criatório; ficha é funcionalidade nova — não é fallback mock-first) |
| RPC `salvar_ficha_tecnica` (spec no §5) | Escrita atômica via RPC — o app NÃO faz delete+insert não-transacional |

## 5. RPC `salvar_ficha_tecnica` (SECURITY DEFINER, padrão registrar_venda)

```sql
salvar_ficha_tecnica(
  p_empresa_id uuid,
  p_produto_pai_id integer,
  p_itens jsonb    -- [{componente_id int, quantidade_por_unidade numeric, perda_pct numeric}]
) → jsonb { success, total_itens }
```

- **Transação:** `DELETE FROM est_ficha_tecnica WHERE produto_pai_id = ... AND empresa_id = ...` + INSERTs em bloco; qualquer falha → rollback.
- Validações SQL: componentes existem **na mesma empresa** e `natureza != 'insumo'?` — **regra: componente pode ser qualquer `me_produto` da empresa EXCETO o próprio pai** (insumo, simples e composto aninhado podem todos ser componentes — PRD D4/D5). Se o componente for `composto` — permitido (semiacabado aninhado); a explosão recursiva é F3.
- `p_itens` vazio (lista vazia) = **apaga a ficha** (permite "zerar" sem deletar produto).
- Guarda anti-tenant: pai e empresa conferem; item de outra empresa → erro claro.
- Retorno de erro coerente com o padrão do `registrar_venda` (`success:false, error, detail`).

## 6. UI — `ProdutoFormModal.tsx`

1. **Step 1 (Informações):** grupo de rádio **Natureza** — Simples · Composto · **Insumo** (default Simples, tooltip curto: "Compro 1, vendo 1" / "Produzido por ficha técnica" / "Matéria-prima — não aparece na vitrine"). Editar produto: radio pré-selecionado.
2. **Step "Ficha Técnica"** — aparece APENAS quando `natureza === 'composto'` na mesma sessão do modal (steps dinâmicos — incluir o step condicionalmente no array STEPS, sem quebrar o índice dos steps existentes; crisp evidence: `STEPS` é const simples, transformar em função `stepsPara(natureza)`):
   - Tabela/lista de componentes (desktop tabela / mobile lista): nome + SKU + unidade, quantidade com unidade (`20 g`), perda % (0 default), botão remover.
   - **Adicionar componente:** busca client-side sobre `useProdutos()` (nome/SKU, dropdown — padrão `use-buscar-clientes` do B3), filtrando fora o próprio produto; permitidos naturezas `simples`, `composto`, `insumo`.
   - Validação: `quantidade_por_unidade > 0`; duplicado de componente bloceado (UNIQUE — oRpc devolve erro coerente).
   - Salvar: chamar `salvar_ficha_tecnica` com o snapshot atual; erro → mensagem no modal; sucesso → toast "Ficha técnica salva".
3. **Insumo:** no step de precificação/vitrine, esconder o toggle "Mostrar na vitrine" e forçar `exibirVitrine=false` no payload; label fixa "Insumo — não aparece na vitrine". Preços permanecem campos normais (valor de compra é custo — o método de cálculo vem na F2).
4. **Estados:** loading do embed de componentes, empty ("Nenhum componente ainda — adicione o primeiro"), erro + retry; o modal não pode perder os dados digitados ao trocar de step (padrão atual).

## 7. Consumidores — mudanças mínimas

| Ponto | Mudança |
|---|---|
| `ProdutosPage` | Badge da natureza no card/linha (`Simples` neutro · `Composto` azul · `Insumo` âmbar — usar só a paleta existente/pages do módulo; sem hex novo) |
| `ProdutoDetalhePage` | Seção/aba "Ficha Técnica" quando `natureza='composto'`: lista le até (mesma fonte do hook); **sem botão de custo nesta fase** (F2/F3) |
| Vitrine/checkout/carrinho | ZERO mudança — insumo sai por `exibir_vitrine=false`, composto vende igual hoje |
| PDV/marketplace/mocks | ZERO mudança (mocks permanecem `simples` implicito) |

## 8. Verificação

1. `npx tsc --noEmit` → **0 erros novos**.
2. `npm run build` OK.
3. Banco (MCP): criar produto composto de teste + salvar ficha com 2 itens → `SELECT * FROM est_ficha_tecnica` reflete; re-salvar com 1 item → substitui; salvar lista vazia → ficha apagada. **Específico do aceite #3:** natureza default dos produtinhos existentes = `'simples'` (query UPDATE... conferindo via `SELECT DISTINCT natureza FROM me_produto`). Limpar dados de teste ao final.
4. Console sem erro de hooks (STEPS dinâmico + STEPS condicional — máxima atenção a `rules-of-hooks`).

## 9. Checklist

- [ ] Migration aplicada e verificada (natureza + est_ficha_tecnica + guardas)
- [ ] Tipos em `types/producao.ts` + `natureza` mapeada nos 4 hooks de produto
- [ ] RPC `salvar_ficha_tecnica` aplicada + testada (3 caminhos do §8.3)
- [ ] Modal com rádio Natureza + step Ficha Técnica (dinâmico) + busca de componente
- [ ] Insumo: vitrine forçada off
- [ ] Badges em ProdutosPage + ficha no detalhe
- [ ] tsc 0 · build OK · prova banco · deploy Vercel READY
