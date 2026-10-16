# WIRE — CRM no menu + Pipeline real (aprovado por delegação 16/10/2026)

```
MENU (rail desktop = drawer mobile, mesma hierarquia)
█████████████████████
│ MEL              │
│ MINHA EMPRESA ▾  │
│   Visão geral    │
│   Pedidos        │
│   Cadastros ▾    │
│   (Clientes…)    │  ← mantém
│ ESTOQUE ▾        │
│ FINANCEIRO ▾     │
│ CRM ▾  [NOVO]    │  ← entra no nível principal, visível sempre que modo crm ativo
│   Visão geral    │
│   Pipeline       │  ← destaque para o teste com cliente
│   Clientes       │
│   Configurações  │
│ LOJA VIRTUAL ▾   │
│ CHATBOT ▾        │
│ MÓDULOS          │
│ CONFIGURAÇÕES ▾  │
█████████████████████

/CRM/PIPELINE (visual atual do mock, agora do banco)
┌─────────────────────────────────────────────────────────────────────┐
│ Pipeline de Negociações          [Filtro cliente ▾] [+ Negociação] │
│ Pipeline total R$X · Ganho no mês R$Y · N em atraso                 │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬───┤
│Prospecção│1º Contato│Proposta  │Negociação│Fechamento│  Ganho   │Per│
│ (colunas = crm_etapas da empresa, na ordem posicao)                 │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───┤
│ [CARD]   │          │          │          │          │ [CARD]   │   │
│ titulo   │          │          │          │          │          │   │
│ ⚠7d      │          │          │          │          │          │   │
│ initials │          │          │          │          │          │   │
│ cliente  │          │          │          │          │          │   │
│ [R$][%]  │          │          │          │          │          │   │
│ prazo    │          │          │          │          │          │   │
├──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴───┤
│ arrastar = mover etapa (grava no banco + log atividade)             │
└─────────────────────────────────────────────────────────────────────┘
Modal [+ Negociação]: Cliente (select me_cliente) · Título · Valor R$ ·
Data de fechamento · [Salvar]
Loading: skeleton | Erro: texto + Tentar de novo | Vazio: "Sua primeira
negociação" + botão.
```
Mundo real: card em branco ≙ coluna vazia. Drag & drop move card entre colunas.
