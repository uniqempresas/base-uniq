# Apresentação Comercial UNIQ — Índice

> **Pasta única** com tudo sobre a apresentação comercial. Criada em 24/09/2026.
> O **PRD** fica em `tracking/plans/PRD-ApresentacaoComercial.md` — por convenção do projeto, todo PRD mora em `plans/`.

---

## Ordem de leitura

| # | Arquivo | O que é |
|---|---|---|
| **1** | `ROTEIRO_APRESENTACAO.md` | **O roteiro final** — os 12 slides. É a fonte do conteúdo |
| **2** | `BRIEFING_DESIGN_APRESENTACAO.md` | **Briefing de design** — o que cada slide deve comunicar. É a entrada do OpenDesign |
| 3 | `ROTEIRO_APRESENTACAO_FUNDADOR.md` | Seu texto ditado (bruto) + os 22 pontos que levantei |
| 4 | `referencia/` | Imagens do deck anterior (**anti-referência**) + o logo UNIQ |

---

## Histórico — o que já foi superado

| Arquivo | Status |
|---|---|
| `ANALISE_TEXTO_APRESENTACAO.md` | A análise que **reprovou** o deck antigo. O diagnóstico ainda vale como **régua de escrita** |
| `DIRETRIZ_CORRECAO_APRESENTACAO.md` | **Superado.** A estratégia continua válida; o copy foi substituído pela análise acima |
| `PESQUISA_MERCADO_DECK.md` | Pesquisa de referência sobre decks que vendem |

---

## Status atual

- ✅ Roteiro fechado — 12 slides, podado
- ✅ Briefing de design pronto
- ✅ Direção de imagem documentada no `DESIGN.md`
- 🔶 **PRD aguardando 2 decisões do fundador** — exposição pública do preço · índice de navegação
- ⬜ Design no OpenDesign
- ⬜ SPEC + WIRE
- ⬜ Implementação pelo CODER

---

## Onde está o código

| Caminho | O que é |
|---|---|
| `src/app/components/apresentacao/` | O deck atual (com o texto velho — **a substituir**) |
| `src/app/routes.tsx` | Rota `/apresentacao` — **já é pública**, fora do `AppLayout` |
| `DESIGN.md` | Identidade oficial (paleta, tipografia, layout, imagery) |
| `src/assets/mel-full.png` | Avatar da MEL usado em produção |
