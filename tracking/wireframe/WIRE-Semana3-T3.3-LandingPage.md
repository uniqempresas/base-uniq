# WIRE — Landing Page da UNIQ (T3.3)

> Estrutura e função (mobile-first). Design real no OpenDesign.

## Rota `/` (pública, sem login)

```
┌──────────────────────────────────────┐
│ UNIQ · logo (verde menta)      [☰?] │   ← header simples
│                                      │
│ ── HERO ──────────────────────────── │
│ "A UNIQ faz entrar mais dinheiro     │
│  e mostra para onde o seu está       │
│  saindo. Isso é margem."             │
│                                      │
│  [ Falar com a MEL ]  ← CTA primário │
│                                      │
│ ── PILARES (vender agora) ────────── │
│ ┌ Entra mais dinheiro ──────────────┐│
│ │ atendimento que não perde venda,  ││
│ │ agilidade e organização no dia a  ││
│ │ dia                               ││
│ └───────────────────────────────────┘│
│ ┌ Sai menos dinheiro ───────────────┐│
│ │ você finalmente enxerga para onde ││
│ │ o seu dinheiro está indo          ││
│ └───────────────────────────────────┘│
│        "Isso é margem."              │
│                                      │
│ ── VISÃO (prometer 1) ────────────── │
│ "E depois vem a transformação:       │
│  consultoria, conteúdo e gestão      │
│  para você crescer de verdade."      │
│  (futuro — sem compromisso)          │
│                                      │
│ ── COMO FUNCIONA (DFY) ───────────── │
│ "Você não toca em tecnologia.        │
│  A UNIQ instala a Melissa, sua       │
│  parceira digital: atende, vende e   │
│  organiza sua operação no automático"│
│  [avatar da Melissa]                 │
│                                      │
│ ── CONTATO ───────────────────────── │
│ WhatsApp (11) 91915-3508             │
│  [ Falar com a MEL ]   ← ancora aqui │
│                                      │
│ ── FOOTER ────────────────────────── │
│ UNIQ · Suzano/SP · © 2026            │
└──────────────────────────────────────┘
```

## Comportamento

- **CTA "Falar com a MEL"**: na S3 é **âncora para a seção contato** (não inicia chat). A integração híbrida (chat → captura de WhatsApp → SPIN) entra **na Semana 4** — regra de sequência: funil só após a cadeia de demonstração.
- **WhatsApp**: link `wa.me/5511919153508` abrindo conversa direta (contato de venda, não funil SPIN).
- Mobile: seções empilham (1 coluna). Desktop: conteúdo centralizado em `max-w` (ex.: ~960px), cards dos pilares lado a lado (2 colunas).
- Scroll suave ao clicar no CTA (âncora com `scroll-behavior: smooth`).

## Estados

- Tela estática — sem loading/empty/error (conteúdo fixo).
- CTA: estado `:hover`/`:focus` com anel de foco visível (acessibilidade teclado).
- Links: `aria-label` (ex.: "Falar com a Melissa pelo WhatsApp").

## Validação

- `npm run build` OK · deploy Vercel READY · fundador valida pelo celular.