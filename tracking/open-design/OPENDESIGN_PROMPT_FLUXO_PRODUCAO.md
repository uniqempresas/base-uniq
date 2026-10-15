# PROMPT PARA O OPENDESIGN — Redesenho do fluxo de produção end-to-end

**Projeto:** Base UNIQ (multi-tenant) · **Usuário prático:** operação real da Doceê, mobile-first · **Estado descrito:** produção de 15/10/2026 · **Autor do pedido:** fundador da UNIQ, com fricções registradas em teste real com usuário.

**Como usar este documento:** cole-o inteiro no OpenDesign. Ele descreve o fluxo de HOJE, tela por tela, as regras de negócio que não podem quebrar, as fricções reais de teste e — no final — o pedido exato do que deve ser entregue.

---

## 1. Contexto do produto

- Sistema de gestão operacional (Vite + React + Supabase). O parceiro roda a operação pelo CELULAR; o fundador valida na Vercel.
- Cadeia de referência (caso real em uso): **insumos** comprados em embalagens (leite condensado em lata de 395 g; creme de leite em caixa de 200 g; chocolate em kg; casquinha, saquinho e rótulo por unidade; limão por peça) → **composto intermediário** "Recheio de Limão" (contado em gramas, feito por receita: 1 lata de leite condensado + 1 caixa de creme + 2 limões ≈ 595 g) → **produto final** "Cone de Limão" (por unidade: 40 g de chocolate + 1 casquinha + 55 g de recheio) → vendido por pedido/loja.

## 2. O fluxo que o usuário exerce hoje, tela por tela

### A. Cadastrar INSUMO
- **Onde:** Estoque ▸ Produtos (`/estoque/produtos`) → botão **+ Novo** → modal de cadastro, passo "dados do produto".
- **Passos:** nome → **natureza = insumo** (insumos nunca aparecem na loja nem nos pedidos) → **unidade de estoque** (o que se guarda: `g` o que se pesa, `Unidade` o que se conta) → **unidade de compra + fator de conversão** ("1 lata contém 395 g") → preço inicial → salvar.
- **Estado depois:** insumo com **estoque 0** — ganha quantidade e custo exclusivamente pela COMPRA.

### B. Cadastrar PRODUTO INTERMEDIÁRIO (composto em massa — Recheio)
- **Onde:** mesmo modal, natureza = composto → abre o passo **"Ficha Técnica"**.
- **Passos:** adicionar componentes (busca sobre insumos) com **quantidade POR RECEITA** (ex.: 395 g leite + 200 g creme + 2 limões) e **% de perda** por componente → campo **"Essa receita rende"** (OBRIGATÓRIO desde 15/10; ex.: ~595 g) → salvar.
- **Detalhe técnico (transparência):** o banco guarda a ficha **por grama** (1 g de recheio = 0,6639 g leite + 0,3361 g creme + 0,0034 peça de limão). O "rende" traduz entre a linguagem da receita e a linguagem do estoque.
- **Estado depois:** aba **Produção** no detalhe do composto mostra **"custo pendente de produção"** — compostos só têm custo quando PRODUZIDOS pelo sistema.

### C. Cadastrar PRODUTO FINAL (composto por unidade — Cone de Limão)
- **Onde:** mesmo modal, natureza = composto.
- **Passos:** componentes = insumos **+ o recheio como componente** (40 g chocolate, 1 casquinha, 55 g recheio por cone) → "Essa receita rende" = **1** (rende 1 unidade) → salvar.
- **Estado depois:** aba Ficha Técnica com custo/un ao vivo (pendente até o recheio ter custo).

### D. Criar COMPRA e salvar
- **Onde:** Estoque ▸ Compras (`/estoque/compras`) → **+ Nova Compra** → página dedicada (`/estoque/compras/nova`).
- **Passos:** fornecedor (busca com autocomplete; cadastro na hora) → **Linha Rápida** frozen no topo: escreve o item (autocomplete nativa do navegador; se não existe, "**Cadastrar na hora**") → campo **Qtd** (na unidade de compra) + campo **R$** → botão **＋ Adicionar** (item repetido soma na mesma linha) → item entra na lista "nota de papelaria" (quantidade/valor editáveis na linha, remover) → rascunho sobrevive ao refresh → **Salvar compra** (pill no header) → compra fica **PENDENTE**.
- **Estado depois:** estoque e custo AINDA não mudam.

### E. RECEBER a compra (onde o custo nasce)
- **Onde:** lista de Compras → botão **Receber** → modal (data do recebimento + data de vencimento da conta).
- **O que acontece (RPC `receber_compra`, uma transação):** entrada de estoque **convertida pelo fator** (1 lata → 395 g) · **custo médio ponderado** no insumo (mistura lotes) · **movimentação de entrada** no extrato · **conta a PAGAR pendente vinculada** no Financeiro · compra vira RECEBIDO.
- **Estado depois:** insumo com estoque e custo real de verdade; Financeiro ganha a conta.

### F. PRODUZIR (só possível depois de B/C + E)
- **Onde:** detalhe do composto → aba **Produção** → botão **Produzir lote**.
- **Passos:** modal com seletor em **receitas × gramas** ("1 receita · ~595 g" — vem do "rende") · **semáforo de estoque** (vermelho nomeia o insumo que falta) → confirmar.
- **O que acontece (RPC `registrar_producao`, all-or-nothing):** baixa os insumos **pela ficha, com perda** · entra o produto acabado com **custo apurado** · movimentações no extrato · histórico de ordens de produção.
- **Fricção real:** perda de 5% × compra EXATAMENTE da receita = primeira produção bloqueada (precisa de buffer ou perda zero).

### G. VENDER (fecha o circuito)
- Pedidos ▸ **Novo Pedido** (picker sem insumos) → confirmar pagamento → **Contabilizar venda** (RPC `registrar_venda`): baixa estoque · cria **conta a receber** no Financeiro · grava **saída "Venda" no extrato**.
- **Extrato** (`/estoque/movimentacoes`) mostra a história completa: Entradas (compras) · Saídas e Entradas (produção) · Saídas (vendas).

## 3. Contratos que o redesign NÃO PODE quebrar

1. **Natureza insumo/composto/vendável:** insumo nunca é vendido; o custo do vendável nasce da COMPRA (média ponderada), nunca de preço digitado à mão.
2. **Conversão é o coração:** unidade de compra × fator → unidade de estoque ("caixa de 200 g" vira custo por grama). Sem ela o custo mentira.
3. **Duas linguagens da ficha:** por RECEITA (como o usuário pensa) e por GRAMA (como o banco guarda); o "rende" faz a tradução.
4. **Perda por componente** representa desperdício real — precisa de lugar claro no fluxo.
5. **Backend intocado:** `receber_compra`, `registrar_producao`, `registrar_venda` são RPCs transacionais únicas (all-or-nothing). O redesign é de TELAS e FLUXO, nunca de backend.
6. **Estados completos:** loading, empty, error e fallback de demonstração em toda tela — nunca tela em branco.

## 4. Fricções reais (teste com usuário real — 14 e 15/10/2026)

1. **Babel de unidades:** digitar compra "un" e estoque "Unidade" travou o cadastro do limão; a pergunta-chave "1 [unidade de compra] contém quantas [unidade de estoque]?" não é óbvia em tela.
2. **Conversão/fator é o conceito mais duro** — precisa de apoio visual permanente (ex.: "1 lata = 395 g" como legenda sempre visível).
3. **Ficha por receita confundiu** — os números por grama apareciam quebrados (0,6639 g) e o usuário não entendeu; o campo "rende" nasceu novo e o usuário 1ª vez não sabe que deve preenchê-lo.
4. **Perda sem sentido claro** — e bloqueia a 1ª produção quando se compra exatamente a receita.
5. **A ordem do fluxo não é óbvia:** o usuário tentou PRODUZIR antes de RECEBER a compra; o sistema recusou com erro, em vez de guiar ("para produzir, receba a compra X primeira").
6. **Produção escondida:** mora numa ABA dentro do detalhe do produto — o usuário não enxerga a sequência insumo → compra → receber → produzir como uma esteira.
7. **Texto enganoso:** "custo pendente de compra" aparece para compostos (o certo seria "pendente de produção").
8. **Erro silencioso de conversão:** compra gravada sem conversão corrompeu estoque e custo por baixo — o fluxo precisa conferir/corrigir isso por dentro, nunca pedindo Espiar manual depois.

## 5. O PEDIDO ao OpenDesign

Com base no fluxo real (§2), nos contratos (§3) e nas fricções (§4), devolver:

1. **Mapa de fricção por etapa** — onde o usuário para, erra ou confunde, ancorado no §4 (não invente problemas).
2. **Proposta de fluxo mais fluido** — objetivo: do insumo novo até o primeiro produto vendido, com **menos telas e menos conceitos simultâneos**. Candidatos a avaliar (podem ser substituídos por ideias melhores):
   - Uma esteira única "insumo novo" (cadastrar + compra + receber em sequência guiada);
   - Ficha técnica com sugestão automática de rendimento (soma/renda da receita) e tradução permanente receita ↔ estoque;
   - Produzir lote mostrando **o máximo que o estoque atual alcança**;
   - CTAs de contexto: no composto com "custo pendente → ir comprar"; na falha de produção → "receba a compra X para produzir".
3. **Wireframes mobile-first de cada tela da proposta** — estrutura e função (estados incluídos); identidade visual fica no `DESIGN.md` do projeto.
4. **Respeitar os contratos do §3** — não inventar chamadas de API; os gatilhos reais são: salvar produto · salvar compra · receber compra (RPC) · produzir lote (RPC) · contabilizar venda (RPC).
5. **Todo o ganho deve caber no front** (telas, estado, CTAs) — sem propor mudanças de backend.

**Formato de entrega:** (a) mapa antes → depois por etapa; (b) a proposta de fluxo em uma frase clara por tela; (c) um wireframe por tela, com os 4 estados; (d) lista do que muda no front (novas rotas/ajustes em existentes) e do que NÃO muda.
