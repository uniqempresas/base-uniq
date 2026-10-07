# WIRE — Tela de Compras (C1) + Conversão clara (C2) — v1.0

> **Status:** ✅ Direções do fundador 06-10/2026 (experiência exclusiva de compra, mobile-first; conversão precisa ficar clara; máscara de valor).
> Substitui o fluxo "Nova compra" em modal por uma **tela própria**.

## C1 — Tela "Nova compra" (experiência de mercado)

- **Rota nova:** `/estoque/compras/nova` (full-page, mobile-first; desktop igual funcional).
- **Estrutura (top → bottom):**
  1. Header: título "Nova compra" + fornecedor atual + total até agora.
  2. **Fornecedor** (bloco): select + botão "+ Novo fornecedor" (cadastro simples na hora, como já existe).
  3. **Busca de insumo** — lista **somente itens natureza=insumo** (W1/M1). "Cadastrar item na hora" quando não existe (mini-sheet como já existe, natureza=insumo forçada).
  4. **Lista de itens da compra** (linha por linha — "item por item e não tabelas", mobile):
     cada linha: nome · **Qtd (unidade de compra)** · **Valor unitário (R$, máscara)** · subtotal da linha · chip "Última vez: R$ X/un · data" · excluir.
  5. Rodapé **sticky**: total geral + botões "Salvar compra" (cria PENDENTE — recebimento depois, como hoje) e fechar.
- **Intenção:** uma tela focada só na compra, sem contexto alheio; o modal de inserção de item continua (fundador aprovou este padrão), mas a "parafernálha" da compra vira tela.
- O modal "Nova compra" antigo sai; "Receber/Cancelar/Detalhe" continuam modais sobre a lista.

## C2 — Conversão sempre explícita (clareza, ex.: caixa de uva 500g)

- No item da compra: label do campo **"Qtd (caixa)"** (a unidade de compra do insumo) e helper fixo **"1 caixa = 500 g"** (unidade + fator do insumo).
- Resultado nunca fala "caixas" para estoque: prova do item mostra **"+500 g ao estoque · 1 caixa"** (unidade do produto no estoque).
- Se `fator_conversao = 1` (unidade = unidade de compra), sem helper (ex.: saquinho comprado na unidade).
- **Máscara de valor:** campo valor unitário vira `R$ 0,00` (máscara do `masks.ts`), alvo de toque ≥44px.

## Pendente (decisão do fundador em aberto)

- **Embalagens "pacote sem contagem" (saquinhos):** como modelar compra em pacote quando o consumo é por unidade — aguardando o fundador decidir (opções a/b/c na conversa). Não implementar variações do fator até lá.
