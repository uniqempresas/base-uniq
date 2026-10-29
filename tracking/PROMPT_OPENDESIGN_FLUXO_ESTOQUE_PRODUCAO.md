# PROMPT OPENDESIGN — Redesenho do Fluxo de Produção/Estoque (Base UNIQ)

> Prompt para colar no OpenDesign. Gerar as telas na ordem indicada. Todo o texto das telas em **português (pt-BR)**.

---

## 1. Contexto do produto

A **Base UNIQ** é a plataforma de gestão usada por **microempresários de alimentação** (confeitaria, padaria, marmitas, doces) de Suzano/Alto Tietê — pessoas **sem conhecimento técnico** de estoque ou finanças. O app é **mobile-first**: o dono usa o sistema pelo celular, entre uma tarefa e outra da cozinha.

O módulo a redesenhar cobre o ciclo completo: **cadastrar insumos → registrar compras → criar receitas (produtos compostos) → produzir → vender produtos finais → acompanhar margem por produto**.

Hoje a tela de nova compra (`/estoque/compras/nova`) está quebrada no celular (rolagem horizontal, modal com scroll interno, teclado cobrindo campos) e o conjunto todo parece um ERP antigo. O objetivo é um redesenho que pareça um **app moderno de 2026**, com uma assistente de IA chamada **Melissa** explicando o que acontece com os números do usuário.

## 2. Persona de uso

- **Dona de confeitaria caseira**, 30–55 anos, celular Android, tela 360–390 px.
- Não sabe o que é "fator de conversão", "CMV" ou "BOM". Nunca usar esses termos na UI.
- Pensa em: lata, pacote, caixa, dúzia. O sistema converte para gramas/ml sozinho.
- Quer saber: "quanto custa meu bolo?" e "quanto sobra pra mim?".

## 3. Modelo mental — a decisão mais importante

Reduzir os 7 conceitos atuais (Insumos, Compras, Compostos, Finais, Produção, Receitas, Margem) para **3 áreas + navegação por segmented control** no topo do módulo:

```
[ Compro ] [ Faço ] [ Vendo ]
```

- **Compro** → Insumos (lista + cadastro) e Compras (lista + nova compra)
- **Faço** → Receitas (lista + editor com ficha técnica) e Produção (executar receita)
- **Vendo** → Produtos finais (lista + detalhe com preço) e Margem

Regra conceitual: **Receita e Produto Final são o mesmo objeto em dois estágios** — uma receita vira produto quando o usuário marca "vendo isso" e define preço. "Produto composto" é apenas uma receita usada dentro de outra (mostrar badge "usada em N receitas"). Não criar telas separadas para Compostos e Finais.

## 4. Design system (referência)

- Paleta e tipografia oficiais: seguir o `DESIGN.md` do projeto (fonte da verdade).
- Referência obrigatória para os cards da Melissa: o card escuro do dashboard (`/dashboard`):
  - Fundo `#1f2937`, `border-radius: 16px`, padding 20px
  - Glow decorativo `#86cb92` com blur no canto superior direito
  - Avatar circular da Melissa com borda `#86cb92`, nome "Melissa" em branco bold + subtítulo "IA Proativa" em cinza claro
  - Balão de texto em `white/10` com borda sutil, texto branco
  - Ação em `#86cb92` (ex.: "Ver cálculo →")
- Componentes: estilo shadcn/ui + Tailwind. Cantos arredondados, sombras suaves, densidade confortável.
- Ícones: lucide-react.

## 5. Regras globais de UX (valem para todas as telas)

1. **Mobile-first de verdade**: desenhar primeiro para 360–390 px de largura. Nada de tabelas no mobile — **cards em vez de tabelas** sempre. No desktop, grid de 3 colunas.
2. **Alvos de toque ≥ 44px**; inputs com fonte ≥ 16px (evita zoom no iOS); teclado numérico (`inputMode="decimal"`) em preço e quantidade.
3. **Containers corretos**:
   - Ação rápida de 1–2 campos → bottom sheet (mobile) / popover (desktop)
   - Cadastro de 3–6 campos → bottom sheet modal (mobile) / side panel 400–480px (desktop)
   - Fluxo com etapas (nova compra, nova receita) → **wizard full-screen no mobile** / página em 2 colunas no desktop (form à esquerda, resumo sticky à direita)
   - Nunca modal com scroll interno; nunca tabela de 6 colunas.
4. **Estados sempre**: cada lista/tela tem skeleton (loading), empty state com ilustração + CTA, erro e sucesso.
5. **Números com a conta visível**: todo custo mostra de onde veio. Nunca mostrar "custo" sem dizer qual custo ("última compra" ou "custo médio").
6. **A conversão é resultado, não campo**: a UI pergunta "Quantas você comprou?" e "Quanto tem em cada uma?" — nunca pede "fator de conversão".

## 6. A Melissa (assistente) — padrão de design

A Melissa aparece como **card contextual** (mesmo visual do card escuro do dashboard, seção 4), **não como chat**. Regras:

- **1 card por tela, no máximo**, posicionado abaixo do grupo de campos que ele explica — nunca cobrindo o botão primário.
- **1–2 frases**, consequência primeiro, passado, sem jargão. Ex.: "Você comprou 1 lata → entraram 395 g no estoque. Isso deu R$ 13,90 por quilo."
- Até 2 ações: primária ("Ver cálculo", "Ajustar preço") e secundária ("Entendi", "Não mostrar de novo").
- Versão desktop: mesmo card na coluna direita sticky (320–360px).
- Gatilhos: (1) primeira vez no passo; (2) conversão calculada; (3) preço muito fora da mediana; (4) compra que encarece receitas; (5) empty state; (6) produto com margem no vermelho.

### Banco de microcopy da Melissa (usar estes textos nas telas)

- Conversão: "Você comprou **1 lata** → entraram **395 g** no estoque." / "Isso deu **R$ 13,90 por quilo**. Antes estava R$ 12,80."
- Receita: "Sua receita usa **gramas**. Pode deixar que eu converto."
- Estimado: "Não sabe quanto tem na embalagem? Tudo bem. Vou marcar como **estimado** e você confirma depois."
- Impacto de compra: "O leite condensado subiu 8%. **3 receitas ficaram 2% mais caras.** Quer ver?"
- Sem preço: "Este insumo ainda não tem preço. O custo dos produtos que usam ele vai ficar **estimado**."
- Margem: "De cada R$ 100 vendidos, sobram **R$ 62**." / "A torta de limão deixou **R$ 4,10** por fatia. O leite condensado subiu 8%."
- Conceito: "Margem é o que sobra de cada R$ 100. Markup multiplica o custo. **Não são a mesma coisa.**"
- Tom: "Eu explico, você decide." / "Não vou mexer em nada sem você mandar."

## 7. Telas a gerar (ordem de prioridade)

### TELA 1 — Nova Compra (mobile) — a mais importante
Wizard full-screen em **3 passos**, com barra de progresso e "Rascunho salvo ✓" no header:

**Passo 1 — "O que você comprou?"**
- Busca de insumo no topo; chips de "Últimas compras" (Leite condensado, Farinha, Ovos)
- Lista de insumos em cards: emoji/ícone, nome, **R$/g em destaque**, estoque atual ("2,4 kg em estoque" / badge "acabando")
- Ação "+ Cadastrar insumo novo" (abre bottom sheet de 2 campos: nome + como você compra)
- Rodapé fixo: "Continuar →"

**Passo 2 — "Quanto e por quanto?"** (repete por item)
- Card do insumo no topo
- Campo "Quantas você comprou?" `[1] [lata ▾]` — unidades amigáveis: lata, pacote, caixa, dúzia, kg, un
- Campo "Quanto tem em cada uma?" `[395] g` com **sugestões em chips** (395 g · 1 kg)
- Campo "Preço total" `R$ [5,49]`
- **Recibo da conta** (sempre visível): `1 lata × 395 g = 395 g · R$ 5,49 ÷ 395 g = R$ 0,0139/g`
- **Card da Melissa**: "Você comprou 1 lata → entraram 395 g no estoque. Isso deu R$ 13,90 por quilo." com ações "Ver cálculo" / "Entendi"

**Passo 3 — "Confira"**
- Lista dos itens: insumo, quantidade, total, e "+ 395 g no estoque" por item
- Total da compra em destaque
- Card da Melissa com impacto: "O leite condensado subiu 8%. 3 receitas ficaram 2% mais caras. Quer ver?"
- Botão primário full-width: **"Salvar compra"**

### TELA 2 — Nova Compra (desktop)
Mesmos 3 blocos empilhados em coluna esquerda (600–680px); coluna direita sticky com resumo: total, impacto no custo médio, receitas afetadas, card da Melissa.

### TELA 3 — Lista de Insumos
- Cards (mobile) / grid 3 col (desktop): emoji, nome, **R$/g grande**, estoque com barra de progresso, badge "acabando" quando abaixo do mínimo
- Busca + chips de categoria; FAB "+ Insumo"
- Empty state com a Melissa: "Cadastre o primeiro insumo. Eu cuido da conversão pra você."

### TELA 4 — Detalhe do Insumo
- Header: nome + **R$/g** hero + "última compra" e "custo médio" rotulados
- Bloco "Como você compra": `1 lata = 395 g = R$ 5,49` com "Ver cálculo"
- Bloco "Onde é usado": lista de receitas que usam ("Usado em 4 receitas")
- Mini gráfico de evolução de preço (sparkline)

### TELA 5 — Editor de Receita (Ficha Técnica)
- Header: nome da receita + rendimento ("rende 20 brigadeiros")
- Seções colapsáveis: Massa / Recheio / Cobertura
- Linha de ingrediente: insumo + quantidade na unidade da receita + **custo da linha em tempo real**
- Rodapé sticky: custo total, custo por porção, e (se "vendo isso") margem ao vivo
- Card da Melissa no empty state da ficha: "Adicione os ingredientes. Eu calculo o custo de cada um."
- Receita usada dentro de outra → badge "usada em N receitas"

### TELA 6 — Produção
- Lista de receitas com ação "Produzir" + campo de quantidade
- Ao produzir: tela de confirmação com consumo por ingrediente; **faltas expressas em unidades compráveis** ("faltam 120 g de leite condensado ≈ 1 lata" com botão "Registrar compra")
- Tela de resultado: o que saiu do estoque e o que entrou, item a item

### TELA 7 — Margem (mobile) — a tela que o dono mais abre
- Header com seletor de período
- 2 KPI cards: "Sobra média" (R$ por unidade + %) e "Produtos no vermelho" (contagem)
- Seção **"PROTEJA ESTES"**: top produtos por lucro em R$, semáforo verde, mini sparkline de custo
- Seção **"RESOLVA ESTES"**: produtos no vermelho com **o motivo** ("O leite condensado subiu 8%") + botão "Ajustar preço"
- Card da Melissa explicando em R$: "De cada R$ 100 vendidos, sobram R$ 62."

### TELA 8 — Detalhe do Produto / Simulador de preço
- Custo por unidade, preço praticado, **preço sugerido** ("Se você cobrar R$ 42, sobram R$ 27 por bolo — 64%")
- Slider de margem desejada atualizando o preço sugerido em tempo real
- Nota curta: "Margem é o que sobra de cada R$ 100. Markup multiplica o custo. Não são a mesma coisa."
- Botão "Aplicar preço sugerido"

### TELA 9 — Home do módulo ("Hoje")
- Segmented control Compro · Faço · Vendo
- 3 cards de alerta: "está acabando", "custo subiu", "margem caiu"
- Ação rápida "Comprar de novo" (chips dos últimos insumos comprados)

## 8. O que NÃO fazer (anti-padrões)

- ❌ Tabela de 6+ colunas no mobile (foi o que quebrou a tela atual)
- ❌ Modal com scroll interno para formulários longos
- ❌ Pedir "fator de conversão", "CMV", "BOM" ou qualquer jargão
- ❌ Autosave silencioso — estoque só muda ao tocar "Salvar compra" (mostrar "Rascunho salvo" separado)
- ❌ Chat flutuante da Melissa cobrindo botões
- ❌ Duplicar telas de "Produto Composto" e "Produto Final" — é o mesmo objeto
- ❌ Campos cinzas desabilitados — usar validação inline
- ❌ Menu engineering / matriz 2×2 como primeira tela (guardar para fase avançada)

## 9. Critérios de aceite (checklist final)

1. Nenhuma tela rola horizontalmente em 360×640.
2. Todas as ações primárias alcançáveis com o polegar (parte inferior da tela).
3. Registrar uma compra de 1 item leva ≤ 3 toques a partir da home.
4. Toda conversão aparece como recibo: `1 lata × 395 g = 395 g`.
5. Todo custo diz qual é: "última compra" ou "custo médio".
6. A Melissa nunca cobre o botão primário e nunca aparece 2 vezes na mesma tela.
7. Todas as listas têm skeleton, empty, erro e sucesso.
8. Falta de insumo na produção é expressa em unidade comprável ("≈ 1 lata"), nunca só em gramas.

---

*Fontes da pesquisa de mercado: Craftybase, meez, MarketMan, Pantrist (modelo de 3 unidades e "2 números, nunca um fator"); SAP Fiori (quick-add "pré-criar no diálogo"); Material 3 (containers mobile); Gestly/FichaTech (preço sugerido vs praticado); padrão do card da Melissa extraído do dashboard atual da Base UNIQ.*
