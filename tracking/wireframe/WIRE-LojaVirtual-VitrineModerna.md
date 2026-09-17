# WIRE — Loja Virtual: Vitrine Moderna (visão do cliente final)

> **PRD:** `tracking/plans/PRD-LojaVirtual-VitrineModerna.md`
> **SPEC:** `tracking/specs/SPEC-LojaVirtual-VitrineModerna.md`
> **Data:** 17/09/2026
> **Status:** 🔶 **Aguardando aprovação do fundador**
> **Restrição do fundador:** estrutura de marketplace (referência: Mercado Livre) — **estrutura, não cores**. Paleta e tipografia seguem o `DESIGN.md`.
> **Tela alvo:** `/loja/docee` (tenant). Mobile é a tela primária — o fundador valida pelo celular.

---

## 1. Inventário de blocos

| # | Bloco | Função | Dado real que alimenta | Condição de exibição |
|---|---|---|---|---|
| 1 | Identidade da loja | Reconhecer onde se está | `me_empresa.nome_fantasia`, `logo_url` | Sempre (fallback: avatar com inicial) |
| 2 | Área do cliente | Entrar / acompanhar pedidos | `useLojaSessao(slug)` — `uniq_loja_sessao_<slug>`, 24h | Sempre (2 estados) |
| 3 | Carrinho | Acesso permanente à sacola | `useCarrinhoLoja(slug)` | Sempre (badge só com ≥ 1 item) |
| 4 | Busca | Achar produto por nome | `nome_produto` (filtro local) | Sempre |
| 5 | Categorias | Navegar por família de produto | `me_categoria` × `me_produto.categoria_id` | Só se houver ≥ 1 categoria com produto |
| 6 | Banner | Campanha / destaque da loja | `me_empresa.appearance.hero.banners[]` | Sempre (fallback: banner gerado) — **no mobile, oculto quando há categoria ativa** |
| 7 | Seção horizontal | Vitrine dentro da vitrine | `me_produto` (ordem por preço/nome) | Só se houver ≥ 3 produtos — **no mobile, oculta quando há categoria ativa** |
| 8 | Grade de produtos | O catálogo | `me_produto` (`ativo`, `exibir_vitrine`) | Sempre (empty/erro tratados) |
| 9 | Barra fixa da sacola | Fechar a compra | `carrinho.quantidadeTotal`, total | Só com ≥ 1 item |

**Não desenhado de propósito** (o banco não sustenta): avaliações por estrelas · contador de vendidos · frete grátis · parcelamento · selo de desconto quando não há preço "de" real.

---

## 2. Wireframe MOBILE — `/loja/docee` (480px)

```
┌────────────────────────────────────────────────────┐
│                                                    │  ← HEADER (sticky)
│  ╭────╮  Doceê                        ┌─────────┐  │
│  │ D  │  Confeitaria artesanal        │ Entrar  │  │  ① ②
│  ╰────╯                               └─────────┘  │
│                                       ┌─────────┐  │
│                                       │ 🛒  (3) │  │  ③
│                                       └─────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🔍  Buscar no cardápio...                 ✕  │  │  ④
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [Tudo] [Cone Trufado] [Trufa] [Tortinha ›       │  ⑤
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  ╔══════════════════════════════════════════════╗  │
│  ║                                              ║  │
│  ║            [ imagem do banner ]              ║  │  ⑥
│  ║                                              ║  │
│  ║   Doceê                                      ║  │
│  ║   Confeitaria artesanal                      ║  │
│  ║   ┌────────────────┐                         ║  │
│  ║   │  Ver sabores   │  ← posição configurável ║  │
│  ║   └────────────────┘                         ║  │
│  ╚══════════════════════════════════════════════╝  │
│                  ● ○ ○                             │
│                                                    │
│  Destaques                          Ver todos →   │  ⑦
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ [foto] │ │ [foto] │ │ [foto] │ │ [foto] │  →   │
│  │Cone Tr.│ │ Trufa  │ │Tortinha│ │Surpresa│      │
│  │ R$ 7,00│ │ R$ 5,00│ │ R$ 7,00│ │ R$ 8,00│      │
│  └────────┘ └────────┘ └────────┘ └────────┘      │
│                                                    │
│  16 produtos                                       │  ⑧
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │     [foto]       │  │     [foto]       │        │
│  │                  │  │   ┌──────────┐   │        │
│  │                  │  │   │ Esgotado │   │        │
│  │ Cone Trufado de  │  │ Trufa de Ninho   │        │
│  │ Ninho com Nutella│  │ com Nutella      │        │
│  │ R$ 7,00          │  │ R$ 5,00          │        │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │        │
│  │ │  Adicionar   │ │  │ │ Indisponível │ │        │
│  │ └──────────────┘ │  │ └──────────────┘ │        │
│  └──────────────────┘  └──────────────────┘        │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │       ...        │  │       ...        │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                    │
│                    (espaço p/ barra fixa)          │
├────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐  │  ← BARRA FIXA (sticky bottom)
│  │ 🛒  3 itens                        Ver sacola│  │  ⑨
│  │     R$ 19,00                                 │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### Legenda

| # | Bloco | Detalhe de estrutura |
|---|---|---|
| ① | **Identidade** | Avatar 44px: `logo_url` ou inicial de `nome_fantasia` sobre verde menta. Duas linhas de texto: nome (forte) + ramo/slogan (secundário). Trunca com reticências. |
| ② | **Área do cliente** | **Deslogado** → botão `Entrar` (contorno, ícone de usuário). **Logado** → botão `Meus pedidos` (sólido grafite, ícone de lista). Nunca os dois. Sempre visível. |
| ③ | **Carrinho** | Ícone + badge numérico com `quantidadeTotal`. Alvo ≥ 44px. Sem badge quando vazio. |
| ④ | **Busca** | Linha inteira, logo abaixo da identidade. Ícone à esquerda, `✕` aparece só com texto. Filtro instantâneo (sem botão "buscar"). |
| ⑤ | **Categorias** | Trilha horizontal com scroll lateral. `Tudo` sempre primeiro e ativo por padrão. Ativo = fundo verde menta. Itens cortados na borda indicam scroll. |
| ⑥ | **Banner** | Carrossel de 1..N slides, cantos arredondados, altura fixa (evita CLS). Texto sobreposto + botão em posição configurável. Dots de posição abaixo. |
| ⑦ | **Destaques** | Trilha horizontal de cards 140–160px. Cabeçalho com título + "Ver todos". |
| ⑧ | **Grade** | 2 colunas no mobile, gap 12px. Contador de resultados acima. Card: foto quadrada, nome (2 linhas), preço, botão de ação. |
| ⑨ | **Barra fixa** | Fundo com gradiente de fade, botão branco com sombra: itens à esquerda, total no meio, "Ver sacola" à direita. **Mantida** do desenho atual (funciona). |

---

## 3. Wireframe DESKTOP / TABLET (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ╭────╮ Doceê · Confeitaria artesanal   ┌──────────────────────┐  ┌───┐ ┌───┐ │
│  │ D  │                                 │ 🔍 Buscar no cardápio│  │🛒3│ │Ent│ │
│  ╰────╯                                 └──────────────────────┘  └───┘ └───┘ │
│  [Tudo] [Cone Trufado] [Trufa] [Tortinha] [Surpresa] [Especial]              │
├──────────────────────────────────────────────────────────────────────────────┤
│   ╔══════════════════════════════════════════════════════════════════════╗   │
│   ║                [ desktop_url — imagem larga ]                        ║   │
│   ║   Doceê                                                              ║   │
│   ║   Confeitaria artesanal          ┌──────────────┐                    ║   │
│   ║                                  │ Ver sabores  │                    ║   │
│   ║                                  └──────────────┘                    ║   │
│   ╚══════════════════════════════════════════════════════════════════════╝   │
│                                    ● ○ ○                                     │
│                                                                              │
│   Destaques                                                    Ver todos →  │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  →      │
│   │ [foto] │ │ [foto] │ │ [foto] │ │ [foto] │ │ [foto] │ │ [foto] │         │
│   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                                              │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│   │ [foto]  │ │ [foto]  │ │ [foto]  │ │ [foto]  │   ← 4 colunas             │
│   │ nome    │ │ nome    │ │ nome    │ │ nome    │                           │
│   │ R$ 7,00 │ │ R$ 5,00 │ │ R$ 8,00 │ │ R$ 10,00│                           │
│   │[Adicion]│ │[Adicion]│ │[Adicion]│ │[Adicion]│                           │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Mudanças no desktop:** busca volta a ficar **inline** com a identidade (como no marketplace de referência) · container `max-w-3xl` → **`max-w-6xl`** · grade **4 colunas** · banner usa `desktop_url` e altura maior · barra fixa da sacola **não aparece** (o carrinho do header já cumpre o papel).

---

## 4. Wireframes de ESTADO

### 4.1 Categorias ausentes (ou banco sem categoria atribuída)

```
├────────────────────────────────────────────────────┤
│                                                    │
│  ╔══════════════════════════════════════════════╗  │
│  ║            [ imagem do banner ]              ║  │
│  ╚══════════════════════════════════════════════╝  │
```
> A trilha **não renderiza** — sem espaço reservado, sem trilha vazia. O header encolhe.

### 4.2 Banner em fallback (Doceê hoje: `appearance = {}`)

```
│  ╔══════════════════════════════════════════════╗  │
│  ║   ▓▓▓▓▓▓▓▓▓▓ superfície grafite ▓▓▓▓▓▓▓▓▓▓   ║  │
│  ║                                              ║  │
│  ║   Doceê                                      ║  │
│  ║   Confeitaria artesanal                      ║  │
│  ║   ┌────────────────────┐                     ║  │
│  ║   │ Ver o cardápio     │                     ║  │
│  ║   └────────────────────┘                     ║  │
│  ╚══════════════════════════════════════════════╝  │
```
> Gerado do próprio tenant: `nome_fantasia` + `store_config.slogan`/`description` (ausentes na Doceê → cai na linha de ramo) sobre superfície grafite + verde menta. **Sem dots** (1 slide). Sem imagem externa.

### 4.3 Produto esgotado

```
│  ┌──────────────────┐                             │
│  │   [foto 50% op.] │                             │
│  │  ┌────────────┐  │  ← selo grafite            │
│  │  │  Esgotado  │  │                             │
│  │  └────────────┘  │                             │
│  │ Cone Trufado de  │                             │
│  │ Beijinho         │                             │
│  │ R$ 7,00 (cinza)  │                             │
│  │ ┌──────────────┐ │                             │
│  │ │ Indisponível │ │  ← desabilitado             │
│  │ └──────────────┘ │                             │
│  └──────────────────┘                             │
```
> Foto com 50% de opacidade, preço em cinza esverdeado, botão desabilitado.

### 4.4 Carrinho vazio (header)

```
│                                       ┌─────────┐  │
│                                       │  🛒     │  │  ← sem badge
│                                       └─────────┘  │
```
> Sem barra fixa no rodapé. Clicar navega para o checkout, que já tem seu próprio estado de sacola vazia.

### 4.5 Loading (skeleton)

```
│  ┌──────────────────────────────────────────────┐  │
│  │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │  │  ← header real (já resolvido)
│  └──────────────────────────────────────────────┘  │
│  ╔══════════════════════════════════════════════╗  │
│  ║  ▒▒▒▒▒▒▒▒▒▒▒▒ (mesma altura final) ▒▒▒▒▒▒▒▒  ║  │  ← banner placeholder
│  ╚══════════════════════════════════════════════╝  │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │  │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │        │
│  │  ▒▒▒▒▒▒  ▒▒▒▒▒▒  │  │  ▒▒▒▒▒▒  ▒▒▒▒▒▒  │        │
│  │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │  │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │        │
│  └──────────────────┘  └──────────────────┘        │
```
> Identidade/área do cliente aparecem antes (resolvem mais rápido). Skeleton na altura final — sem salto de layout.

### 4.6 Vazio (catálogo sem produto na vitrine)

```
│              ┌──────────────────────┐              │
│              │        [ caixa ]     │              │
│              │                      │              │
│              │ Nenhum produto       │              │
│              │ disponível agora     │              │
│              │                      │              │
│              │ ┌──────────────────┐ │              │
│              │ │  Falar no WhatsApp│ │              │
│              │ └──────────────────┘ │              │
│              └──────────────────────┘              │
```
> Reaproveita o empty atual da vitrine (já existe e funciona).

### 4.7 Erro de rede

```
│  ┌──────────────────────────────────────────────┐  │
│  │ ⚠  Não foi possível carregar o catálogo.     │  │
│  │    Tentar novamente                          │  │
│  └──────────────────────────────────────────────┘  │
```
> Banner de retry acima da grade (padrão já existente). Se houver fallback mock, exibe o aviso "Exibindo catálogo de demonstração" logo abaixo.

---

## 5. Especificação de interação

| Elemento | Ação | Resultado |
|---|---|---|
| **Busca** | digitar | filtra a grade em tempo real por `nome_produto` (sem debounce — 16 itens) |
| **Busca** | `✕` ou `Esc` | limpa o termo e restaura a grade |
| **Categoria** | toque | marca como ativa (`aria-pressed`), filtra a grade; `Tudo` remove o filtro. **No mobile, banner e Destaques ficam ocultos enquanto houver categoria ativa** (reaparecem em `Tudo`); no desktop permanecem |
| **Banner** | scroll horizontal | move entre slides com encaixe (snap); autoplay **pausa** ao interagir |
| **Banner** | toque no botão | `link_type` `product` → navega para o produto · `external` → abre link · `category` → seleciona a categoria |
| **Banner** | autoplay | avança a cada `interval` (default 5000ms); **desligado** se `prefers-reduced-motion` |
| **Card de produto** | toque na foto/nome | navega para `/loja/:slug/produto/:id` |
| **Card de produto** | toque em `Adicionar` | adiciona à sacola → `✓ Adicionado!` (1,5s) → `✓ No Carrinho`; não navega |
| **Card esgotado** | toque | botão desabilitado; ainda permite abrir o detalhe |
| **Carrinho (header)** | toque | navega para `/loja/:slug/checkout` |
| **Área do cliente** | deslogado → toque em `Entrar` | navega para `/loja/:slug/entrar` |
| **Área do cliente** | logado → toque em `Meus pedidos` | navega para `/loja/:slug/conta` |
| **Barra fixa** | toque | navega para `/loja/:slug/checkout` |

**Ordem de filtros:** busca **E** categoria **E** disponibilidade são combinados; nenhum sobrescreve o outro.

---

## 6. Responsividade

| Faixa | Layout do header | Busca | Banner | Grade | Container |
|---|---|---|---|---|---|
| **< 640** (mobile) | identidade / cliente / carrinho empilhados em 2 linhas; busca e categorias em linhas próprias | linha inteira | 1 slide, altura ~160px, `mobile_url` | **2 col** | padding 16px |
| **640–1023** (tablet) | identidade + cliente + carrinho na mesma linha | linha inteira | 1 slide, ~200px | **3 col** | `max-w-6xl` |
| **≥ 1024** (desktop) | identidade + **busca inline** + carrinho na mesma linha | inline, flex-1 | largura total, ~240px, `desktop_url` | **4 col** | `max-w-6xl` |

**Entra/sai:** a barra fixa da sacola só existe abaixo de 1024px · os dots do banner somem com 1 slide · "Ver todos" da seção horizontal some no mobile (o scroll lateral basta).

---

## 7. Acessibilidade

- **Alvos de toque ≥ 44px** — carrinho, botão de sessão, itens de categoria, controles do card.
- **Busca**: `aria-label="Buscar produtos"`; `Esc` limpa; foco visível com anel verde menta.
- **Carrinho**: `aria-label="Sacola, 3 itens"` (contagem no rótulo, não só no badge visual).
- **Carrossel**: `role="region"` + `aria-roledescription="carrossel"`; setas ← → navegam; cada slide com `aria-label`; autoplay respeita `prefers-reduced-motion` e pausa com foco dentro.
- **Categorias**: `aria-pressed` no ativo; trilha navegável por Tab.
- **Nunca só cor**: o selo de esgotado tem texto; o estado ativo tem texto + fundo.
- **Ordem de foco**: identidade → cliente → carrinho → busca → categorias → banner → seção → grade.

---

## 8. Antes → depois (vitrine do tenant)

| Bloco | Antes (hoje) | Depois |
|---|---|---|
| Área do cliente | Botão no canto, compete com o nome da loja | Bloco próprio, sempre visível, 2 estados claros |
| Busca | Linha separada, abaixo do header, fácil de perder | No header, imediatamente visível sem rolar |
| Categorias | **Não existe** | Trilha horizontal com dados reais da loja |
| Banner | **Não existe** (só na demo, hardcoded) | Carrossel por loja, com fallback gerado |
| Seção horizontal | **Não existe** | "Destaques" com scroll lateral |
| Carrinho | Só a barra fixa do rodapé | Ícone + contador **no header** + barra fixa |
| Card de produto | Foto, nome, preço, botão | + categoria, + selo de desconto **quando houver dado real** |
| Container | `max-w-3xl` | `max-w-6xl` |
| Grade | 2 → 3 colunas | 2 → 3 → 4 colunas |

---

## 9. Pontos para o fundador decidir

| # | Assunto | O que assumi | Recomendação |
|---|---|---|---|
| A | **Nomes das categorias** | Cone Trufado · Trufa · Tortinha · Surpresa · Especial (conforme sua escolha) | Confirmar no WIRE. "Especial" agrupa só o Morango Cravejado — se preferir, vira "Morango". |
| B | **"Especial" com 1 produto** | Barra mostra a categoria mesmo com 1 item | Manter: 5 categorias navegáveis é melhor que 4 + 1 órfão. |
| C | **Ordem da barra** | "Tudo" + categorias em ordem alfabética | Se quiser prioridade comercial (ex.: Trufas primeiro), me diga a ordem. |
| D | **Seção "Destaques"** | Ordenada por preço, sem curadoria | Aceito critério melhor: mais baratos, ou uma marcação manual por produto. |
| E | **Radius** | Wireframe desenhado com o token do `DESIGN.md` (**8px**) | A vitrine atual usa 16px em tudo. Migrar para 8px agora ou manter 16px na loja? |
| F | **Slogan da Doceê** | `store_config` só tem `ramoAtuacao` — sem slogan | Me passe um slogan e o banner de fallback fica melhor. |
| G | **Logo da Doceê** | `logo_url` é `null` → avatar com "D" | Enviar logo quando tiver; o fallback já resolve. |

---

## 10. Fora deste WIRE

Editor de banners/tema no admin (V4) · página de produto redesenhada · tela de área do cliente redesenhada (V5: só a vitrine) · barra de navegação inferior com abas · frete, cupom, avaliações e vendidos (sem dado no banco).
