# PRD — Landing Page da UNIQ (T3.3)

> Fase: Semana 3 · Módulo: Aquisição (material de venda) · Status: 🔶 Em aprovação (11/09/2026)

## Porquê (WHY)

A visita à ótica (Gate da Semana 3) precisa de **material de venda pronto** — e a Landing Page é a peça central do kit. O fundador conversa com o cliente da HQ Gráfica, apresenta a UNIQ e mostra a landing: ela é a prova tangível que **fica na mão do dono da loja** depois da conversa.

A mesma landing **vira a base do funil de aquisição na Semana 4** (botão "Falar com a MEL" → chat híbrido → SPIN → documento de necessidades). Construir a estrutura e o conteúdo agora, e conectar o chat na S4, evita retrabalho e respeita a regra rígida: **o funil não entra no ar antes da cadeia de demonstração funcionar**.

Posicionamento obrigatório (aprovado 07/09/2026): **vender 2, prometer 1** — faturamento e custos são vendidos agora; transformação é visão de futuro, nunca compromisso contratual.

## O quê (WHAT)

1. **Página pública na rota `/`** (hoje redireciona para `/auth/login`) — institucional da UNIQ, sem login e fora do `AppLayout`.
2. **Hero com o pitch oficial:** *"A UNIQ faz entrar mais dinheiro e mostra para onde o seu está saindo. Isso é margem."* + CTA **"Falar com a MEL"**.
3. **Seção "Os 2 pilares"** (vendáveis agora): entrar mais dinheiro (atendimento/ganho de tempo) + sair menos dinheiro (visibilidade dos custos) → **margem**.
4. **Seção "Visão"**: transformação do empreendedor (consultoria e conteúdo) — explícita como futuro.
5. **Seção "Como funciona"**: modelo **Done-For-You** — o cliente não toca em tecnologia; a UNIQ instala a Melissa, parceira digital.
6. **Seção de contato**: WhatsApp (número confirmado `5511919153508`).
7. **Footer mínimo** (LGPD entra na S4).
8. **CTA "Falar com a MEL"** presente e visível; nesta semana a ação é ancorar na seção de contato (sem chat) — a integração híbrida chega na S4.

## Escopo

- ✅ Dentro: rota `/`, página com as seções acima, CTA placeholder, responsivo mobile-first, paleta/tipografia do `DESIGN.md`, build + deploy.
- ❌ Fora: chat MEL real na landing (S4), captura de WhatsApp e SPIN (S4), política de privacidade/consentimento completa (S4), landing por parceiro/multi-tenant (é landing institucional da UNIQ), trilhas/transformação como produto vendável.

## Stakeholders

Lead (dono da loja em Suzano/Alto Tietê) · Fundador (vendedor e validador — testa pelo celular) · Melissa (entra de verdade só na S4)

## Critérios de aceite

- [ ] `/` carrega a landing pública sem login (fora do `AppLayout`).
- [ ] Hero com pitch oficial + CTA "Falar com a MEL".
- [ ] Seções: 2 pilares (faturamento/custos→margem), visão (futuro), como funciona (DFY), contato, footer.
- [ ] CTA visível e clicável; nesta semana rola para contato (sem chat).
- [ ] Responsivo mobile-first (fundador valida pelo celular).
- [ ] Paleta (`#86cb92` verde menta, `#1f2937` grafite, `#efefef`) e Poppins conforme `DESIGN.md`.
- [ ] Sem funil ativo (S4 trata chat/SPIN/captura) — regra de sequência respeitada.
- [ ] Build + deploy Vercel OK.