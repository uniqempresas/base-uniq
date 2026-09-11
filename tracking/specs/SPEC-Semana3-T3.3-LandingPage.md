# SPEC — Landing Page da UNIQ (T3.3)

> Base: `PRD-Semana3-T3.3-LandingPage.md` · Rota pública `/` · Identidade: `DESIGN.md` (paleta + Poppins)

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/app/routes.tsx` | Trocar a rota `/` (hoje `<Navigate to="/auth/login">`) por `{ path: "/", Component: LandingPage }` — fora do `AppLayout` |
| `src/app/components/landing/LandingPage.tsx` | Página (composição das seções abaixo) |
| `src/app/components/landing/LandingHero.tsx` | Hero + CTA |
| `src/app/components/landing/LandingPilares.tsx` | 2 pilares vendáveis → margem |
| `src/app/components/landing/LandingVisao.tsx` | Pilar 3 (transformação) como visão |
| `src/app/components/landing/LandingComoFunciona.tsx` | Modelo DFY + Melissa |
| `src/app/components/landing/LandingContato.tsx` | WhatsApp |
| `src/app/components/landing/LandingFooter.tsx` | Footer mínimo |

## Conteúdo (pt-BR, grounded no CONTEXTO_PROJETO)

- **Hero:** título com o pitch oficial — *"A UNIQ faz entrar mais dinheiro e mostra para onde o seu está saindo. Isso é margem."* Subtítulo: transformar microempresas de Suzano em operações digitais que funcionam 24h. **CTA primário: "Falar com a MEL"** (âncora para contato na S3; integração chat na S4).
- **Pilares (vender agora):**
  - **Entra mais dinheiro** — atendimento que não perde venda, agilidade e organização no dia a dia.
  - **Sai menos dinheiro** — você finalmente enxerga para onde o seu dinheiro está indo.
  - Síntese: **"Isso é margem."**
- **Visão (prometer 1):** consultoria, vídeo e conteúdo sobre gestão — explícito como futuro, sem compromisso contratual.
- **Como funciona (DFY):** "Você não toca em tecnologia. A UNIQ instala a **Melissa**, sua parceira digital, configurada para atender, vender e organizar a sua operação no automático."
- **Contato:** WhatsApp `(11) 91915-3508` (número confirmado `5511919153508`; link `wa.me/5511919153508`).
- **Footer:** "UNIQ — Consultoria de Transformação Digital com IA · Suzano/SP" + ano.

## Regras de UI

- Paleta `DESIGN.md`: grafite `#1f2937` (texto/título), verde menta `#86cb92` (ações/ênfase), `#efefef` (canvas), branco (cards), `#627271` (texto secundário).
- Tipografia: **Poppins** 400/700; fallbacks system-ui.
- Mobile-first, densidade média-baixa, cards respiráveis; nenhum elemento decorativo sem função.
- Estados/detalhes mínimos nesta tela estática (não há loading/error de dados — conteúdo fixo; CTA é âncora). Responsivo 1 coluna (mobile) → conteúdo centralizado com `max-w` no desktop.

## Rota

```tsx
{ path: "/", Component: LandingPage }   // pública, antes do /auth
```

## Checklist

- [ ] Rota `/` pública (sem auth, sem layout) renderiza a landing
- [ ] Hero com pitch oficial + CTA "Falar com a MEL" (âncora contato)
- [ ] Seções pilares/visão/como funciona/contato/footer
- [ ] Paleta + Poppins conforme `DESIGN.md`
- [ ] Responsivo mobile → desktop (validação pelo celular do fundador)
- [ ] Nenhuma chamada de API/funil ativo nesta semana (S4 conecta o chat)
- [ ] Build + deploy Vercel OK