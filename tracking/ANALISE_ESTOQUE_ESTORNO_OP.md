# 🔍 ANÁLISE — Correção de erros no Estoque: estorno de OP e fluidez de cadastro

> **Data:** 21/10/2026 · **Autor:** análise orquestrada (recon de código + pesquisa de mercado)
> **Gatilho:** caso real — produzir "ganache 300 g" com ficha errada e não conseguir corrigir para 500 g. OP executada é definitiva (decisão D13 da Fase 3), preço não recalcula, e qualquer erro do usuário exige SQL manual do agente.
> **Escopo:** análise e recomendação. **Nenhuma alteração de código foi feita.** Se aprovado pelo fundador, o caminho é SDD: PRD → SPEC → WIRE → implementação (Fase 4 de produção).
> **Estado da discussão:** a Fase 4 já reservava este tema — "considerar estorno de OP (D13)" (`TRACKING_ESTOQUE.md:184`). Este documento é o insumo dessa discussão.

---

## 1. Como é hoje (mapa técnico verificado)

### 1.1 O fluxo de produção funciona bem... até o usuário errar

| Etapa | Como funciona | Qualidade |
|---|---|---|
| Ficha técnica (BOM) | Editável e regravável a qualquer momento — RPC `salvar_ficha_tecnica`, snapshot atômico, lista vazia apaga (`use-ficha-tecnica.ts:204`) | ✅ Fluido |
| Produzir lote (OP) | RPC `registrar_producao` transacional: valida saldo, baixa insumos ('saida/Produção'), dá entrada no acabado com custo médio móvel, grava `est_ordem_producao` + itens (`use-registrar-producao.ts:93`) | ✅ Sólida |
| **Corrigir/cancelar OP** | **Não existe.** D13 (Fase 3): "sem estorno" — adiado deliberadamente | ❌ **O buraco** |
| Histórico de OPs | Somente leitura — linhas sem nenhuma ação (`ProducaoTab.tsx:517-535`) | ❌ Sem saída |
| Movimentações | Ledger real (B14). Sem editar/apagar na UI — correto por desenho (D4 removeu o "Cancelar" fake) | ✅ Integridade |
| Correção manual | `AjustarEstoqueModal` (entrada/saída com motivo) — resolve saldo errado, **mas não desfaz a OP nem corrige o custo médio do acabado** | 🟡 Paliativo |
| Precedente interno | **Estorno de compra já existe**: RPC `estornar_recebimento` + tabela snapshot `est_recebimento` + guarda `MOVIMENTACAO_POSTERIOR` + movimentação 'Estorno' no extrato (`SPEC-Producao-EstornoRecebimento.md` §4) | ✅ Padrão provado |

### 1.2 Por que "editar a OP depois" é uma armadilha (e não é o que o mercado faz)

- `me_produto.preco_custo` e `estoque_atual` são **valores absolutos** (custo médio móvel). Editar uma OP antiga no lugar invalidaria todas as médias calculadas depois dela — precisaria recalcular retroativamente toda a linha do tempo (o "reposting" do ERPNext: infraestrutura cara e complexa, feita para ERPs com contador).
- Apagar a movimentação do extrato quebraria a trilha de auditoria (padrão contábil universal).

### 1.3 A dor já aconteceu de verdade (prova de que o buraco é real)

Registro honesto em `TRACKING_ESTOQUE.md` (rodada 14/10): no 1º teste real da OP, a Trufa Limão apurou **R$ 39,56/un** (ficha com 0,25 kg de chocolate por unidade, saquinho valendo R$ 12, preço de lata gravado como custo por grama, ficha por receita inteira, leite/creme invertidos). A correção exigiu **SQL cirúrgico feito pelo agente** item a item + **RESET completo** dos produtos do Doceê para recomeçar limpo. Um usuário iniciante sozinho **não teria como se recuperar** — é exatamente o cenário "melhor voltar pro caderninho".

---

## 2. O que o mercado faz (fontes verificadas)

| Sistema | Modelo de correção | Lição para a Base UNIQ |
|---|---|---|
| **Bling** (ERP brasileiro para microempresa — referência direta) | OP finalizada **pode ser cancelada**, e o sistema **estorna o estoque automaticamente**: saída dos produtos produzidos + entrada dos componentes. Configurável ("Estornar estoque" nas transições). Extrato mantém os lançamentos. | **A prova de mercado que o modelo simples funciona:** estorno = lançamentos inversos, sem restauração exata, disponível a qualquer momento. |
| **Odoo** (MRP completo) | OP "Done" **não pode ser cancelada** (UserError). O caminho oficial é a **Unbuild Order**: documento que consome o acabado e devolve os componentes pela BoM, rastreável. Devolve nas quantidades da BoM (não o que foi consumido de fato) — diferenças se resolvem com ajuste/scrap. | **Nunca editar o passado; criar um documento de reversão.** Não exigir ordem cronológica estrita. |
| **ERPNext** (ledger imutável) | Draft → Submitted → Cancelled + **Amend**: cancelar gera lançamentos inversos (nunca apaga), e "Amend" clona o documento cancelado num rascunho editável para resubmeter corrigido. Correção retroativa de custo é job de reposting — reconhecidamente pesada. | **"Corrigir = cancelar + amendar"** é o padrão-ouro de UX: o usuário não precisa saber refazer tudo do zero, o sistema pré-preenche. |

**Consenso dos três:**
1. **Ledger imutável** — movimentação nunca é editada ou apagada; correção é lançamento novo.
2. **Documento tem ciclo de vida** — ativa → estornada/cancelada (com badge), nunca deletada.
3. **Correção guiada** — o melhor caminho de UX não é "estorne e saiba refazer", é "estorne e o sistema te leva à correção" (ERPNext Amend).

---

## 3. Recomendação para a Base UNIQ

### 3.1 Modelo escolhido: **Estorno de OP por lançamentos compensatórios + "Corrigir produção"**

Pior das opções seria copiar o rigor do `estornar_recebimento` de compras (restauração exata de custo via snapshot + guarda "só se for a última movimentação"). Para OP isso seria hostile: o usuário teria que estornar em ordem cronológica tudo que tocou cada insumo. Nem Odoo nem Bling exigem isso — e a Base UNIQ serve microempresa.

**Como funciona o estorno de OP (modelo compensatório simples):**

1. **Guarda única:** o acabado precisa estar em estoque na quantidade do lote (se já vendeu tudo, o estorno é bloqueado com mensagem clara + caminho: ajuste manual / estornar a venda antes).
2. **Lançamentos inversos no extrato** (movimentos normais, regras normais):
   - Saída do produto acabado (`motivo 'Estorno'`, observação "Estorno: produção de <data>").
   - Entrada de cada insumo na **quantidade real consumida** (o `est_ordem_producao_item` já guarda o consumo — e até o custo médio usado — por item).
3. **Custo:** nenhum mecanismo novo. No custo médio móvel, estornar = fazer os movimentos inversos com as regras de sempre: saída sai ao custo médio vigente, entrada entra ao custo médio vigente do insumo. A média converge naturalmente. Zero telescopagem, zero snapshot, zero reposting.
4. **A OP ganha status** `ATIVA | ESTORNADA` (badge no histórico, riscado), com referência cruzada para o estorno. Nunca é deletada.
5. **"Corrigir produção"** (o cenário ganache): um botão que encadeia — estorna a OP → abre o modal "Produzir lote" **pré-preenchido** → sugere corrigir a ficha técnica/rendimento com deep-link. O usuário corrige 300 g → 500 g em 2 toques sem entender nada de contabilidade.

**Por que devolver o insumo ao custo médio vigente (e não ao custo da época):** é a regra que o próprio sistema já aplica a toda entrada; mantém o modelo mental único ("tudo entra pelo custo médio atual") e evita a máquina de restauração exata. Divergência frente à "linha do tempo alternativa" é pequena e converge a cada giro — aceitável para microempresa (Bling opera assim).

### 3.2 Fases sugeridas (cada uma com PRD/SPEC/WIRE próprio — regra de ouro)

| Fase | Entrega | Esforço estimado |
|---|---|---|
| **4a — Estornar OP** | RPC `estornar_producao` (padrão `registrar_producao`: SECURITY DEFINER, transacional, jsonb de erro) + status na OP + ações no histórico (`ProducaoTab`) + modal de confirmação "o que vai acontecer" (padrão do estorno de compra, SPEC §6) | Médio — o padrão interno já existe |
| **4b — Corrigir produção** | Fluxo "amend": estorna + pré-preenche lote + deep-link da ficha | Pequeno — camada de UX sobre a 4a |
| **4c — Higiene** (opcional) | Editar observação/data da OP ativa; revisar se o `cancelada` do mock de movimentação morre de vez (no real é sempre false — manter lançamento compensatório como única forma de correção) | Pequeno |

### 3.3 O que NÃO fazer (proteção contra a complexidade do caderninho)

- ❌ **Não** permitir editar OP executada in-place (quebra custo médio + auditoria — nenhum mercado faz).
- ❌ **Não** implementar reposting retroativo de custo (ERPNext-level; overkill para a operação).
- ❌ **Não** adicionar rascunho/ciclo "Não Iniciado → Em Produção" na OP (o "Produzir lote" na hora é mais simples; ciclo de status é para chão de fábrica grande — Fase 5 "OP Documento" já está em backlog separado e pode discutir isso lá).
- ❌ **Não** dar delete de movimentação no extrato (a D4 que removeu o "Cancelar" foi correta).
- ❌ **Não** exigir ordem cronológica de estorno como o estorno de compra exige hoje (`MOVIMENTACAO_POSTERIOR`). Para OP, a guarda única é o saldo do acabado.
- ⚠️ **Dívida a monitorar:** o estorno de compra atual (restauração exata) vai gerar o mesmo atrito que motivou esta análise. Não é prioridade, mas se o usuário esbarrar nele, aplicar o mesmo modelo compensatório.

### 3.4 Princípios de UX que regem a recomendação

1. **Tudo é editável até ter consequência; depois disso, correção é lançamento novo** — nunca apagar.
2. **Um conceito novo no máximo:** "Estornar" (desfazer). Todo o resto (ficha editável, ajuste manual, produção) já existe e funciona.
3. **Nenhuma ação sem caminho de saída:** confirmações listando consequências (padrão já usado no estorno de compra), mensagem de bloqueio sempre com o "e agora?" (o módulo já faz isso bem — banda "Não alcança" do `ProduzirLoteModal` é o padrão a seguir).
4. **Vocabulário de cozinha, não de ERP:** "Estornar produção", "Corrigir produção" — nunca "reverter lançamento", "repostar custo", "cancelar documento".

---

## 4. Cenários resolvidos pelo modelo recomendado

| Cenário | Hoje | Com a recomendação |
|---|---|---|
| Produziu ganache 300 g, ficha certa era 500 g | Sem saída (SQL manual do agente) | **Corrigir produção**: estorna → edita ficha/rende → produz 500 g |
| Produziu com ficha errada e o custo apurou errado (R$ 39,56) | Correção cirúrgica + reset | Estorno devolve insumos e remove o acabado com custo errado; nova OP apura certo |
| Errou a quantidade do lote (produziu 10, eram 6) | Sem saída | Estorno + reproduzir com 6 |
| Acabado já foi parcialmente vendido | — | Estorno bloqueado com mensagem clara ("restam 3 un — estorne a venda ou ajuste o estoque") |
| Insumo perdeu validade após a produção | — | Não é problema da OP: ajuste manual de estoque já resolve (Perda/Quebra) |

---

## 5. Fontes

- ERPNext — Immutable Ledger / Cancel & Amend / Stock Entry: `docs.frappe.io/erpnext/immutable-ledger-in-erpnext`, `/edit-submitted-document`, `/stock-entry`, `/how-transactions-affect-the-ledger`
- Odoo 19 — Unbuild Orders (Manufacturing): `odoo.com/documentation/19.0/.../unbuild_orders.html` + fórum "Fix completed manufacturing order" (MO Done não é cancelável; Unbuild é o caminho)
- Bling — "Lançar e estornar estoque da ordem de produção finalizada" e Gerenciador de Transições: `ajuda.bling.com.br/hc/pt-br/articles/360050713734`
- Interno: `TRACKING_ESTOQUE.md` (D13, rodada 14/10, Reset Doceê) · `SPEC-Producao-BOM-Fase3-Producao.md` (D12–D15) · `SPEC-Producao-EstornoRecebimento.md` (padrão de estorno de compra) · `use-registrar-producao.ts` · `use-ordens-producao.ts` · `ProducaoTab.tsx` · `use-estornar-recebimento.ts` · `use-registrar-movimentacao.ts`

---

*Próximo passo, se o fundador aprovar a direção: abrir PRD da Fase 4a (Estorno de OP) em `tracking/plans/`, seguindo o pipeline SDD.*
