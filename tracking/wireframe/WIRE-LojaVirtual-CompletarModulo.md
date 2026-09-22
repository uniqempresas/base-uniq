# WIRE — Loja Virtual: Completar o Módulo (editor de aparência + catálogo)

> **PRD:** `tracking/plans/PRD-LojaVirtual-CompletarModulo.md`
> **SPEC:** `tracking/specs/SPEC-LojaVirtual-CompletarModulo.md`
> **Data:** 22/09/2026
> **Status:** 🔶 Aguardando aprovação do fundador
> **Regra do projeto (AGENTS.md):** este WIRE entrega **estrutura e função**. O design real (cores, sombras, tipografia fina, microinterações) é criado no **OpenDesign**, em conformidade com o `DESIGN.md` (verde menta `#86cb92`, grafite `#1f2937`, Poppins, radius 8px). Nenhuma decisão visual é tomada aqui.
> **Validação:** o fundador valida **pelo celular** — o editor é mobile-first.

---

## 1. Inventário de blocos

| # | Tela · Bloco | Função | Origem do dado (fonte da verdade) | Condição / estado-chave |
|---|---|---|---|---|
| 1 | **Hub · estado da loja** | Resumo do que está no ar (vitrine, aparência, link) | `me_empresa.slug` · `me_produto.exibir_vitrine = true` (contagem) · `me_empresa.appearance.hero.banners[]` (contagem) | loading · erro + retry · sucesso; cards sempre presentes |
| 2 | **Hub · atalhos** | Aparência · Produtos · Categorias | rotas internas do módulo | Categorias **redireciona** → `/estoque/configuracoes` (SPEC §5) |
| 3 | **Hub · link da vitrine** | Descobrir e abrir a própria loja | `me_empresa.slug` → `/loja/:slug` | sempre; botões copiar (URL completa) e abrir |
| 4 | **Aparência · Banners** | Lista ordenável + CRUD da lista | `me_empresa.appearance.hero.banners[]` | vazio → aviso "banner gerado"; reordenar com salvar |
| 5 | **Aparência · Form de banner (modal)** | Upload desktop + mobile (**com orientação de dimensão**), textos, botão (cor da ação + **cor do texto**), destino do clique | `banners[].{desktop_url, mobile_url, title, subtitle, button_text, button_color, text_color, button_position, link_type, link_value}` | preview antes de salvar · erro tipo/tamanho · **um arquivo só é válido** · orientação de assets (SPEC §2.6) |
| 6 | **Aparência · Carrossel** | Autoplay + intervalo | `appearance.hero.autoplay` · `appearance.hero.interval` | intervalo **mín. 2000ms**; sem dado → 5000 + autoplay on |
| 7 | **Aparência · Tema** | As 4 chaves | `appearance.theme.{primaryColor, secondaryColor, borderRadius, fontFamily}` | vazio → **defaults visíveis** (Poppins · 8px · `#86cb92` · `#1f2937`) |
| 8 | **Aparência · Identidade** | Slogan · descrição · ramo | `store_config.{slogan, description, ramoAtuacao}` | vazio → inputs vazios + placeholder; merge preserva `whatsapp_contact` |
| 9 | **Aparência · Salvar** | Persistência da página inteira | `me_empresa.appearance` + `store_config` — **merge em 2 níveis** (SPEC §3) | `salvando` · toast sucesso · erro visível |
| 10 | **Produtos · lista** | Catálogo do módulo (abre o modal compartilhado) | `me_produto` via `use-produtos` (mapper expõe `exibir_vitrine`, `unidade`) | vazio → CTA cadastro |
| 11 | **Produtos · modal compartilhado** | Um único formulário (Estoque **e** Loja — D3) | `me_produto.{exibir_vitrine, preco_varejo, unidade, ...}` | toggle (passo 1) · promocional funcional (passo 2) · unidade persiste (passo 1) |

> **Divisão de papéis (PRD §1):** `appearance` = visual do topo · `store_config` = textos de identidade · `me_produto` = catálogo. O editor trata `appearance` + `store_config` como **um único fluxo de gravação** (SPEC §3), sempre **merge**, nunca replace.

---

## 2. Mapa de navegação

```
/loja-virtual                     → Hub (estado + atalhos + link da vitrine)
├── /loja-virtual/aparencia       → EDITOR (banners · carrossel · tema · identidade)
├── /loja-virtual/produtos        → Lista de produtos (abre o modal compartilhado)
└── /loja-virtual/categorias      → <Navigate to="/estoque/configuracoes"> (CRUD já existente)
```

**Fluxos:**
- Hub → Aparência: toca no card de aparência ou no atalho "Aparência".
- Hub → Produtos: toca no card "Ver produtos" ou no atalho "Produtos".
- Aparência → Vitrine: botão "Ver loja" no cabeçalho abre `/loja/:slug` em nova aba (mesmo fluxo de "Abrir" do hub).
- Produtos → Modal: "Adicionar produto" (novo) ou "Editar" (linha). O Estoque (`/estoque/...`) abre **o mesmo** modal.
- Categorias → não desenha tela: redireciona para o CRUD do Estoque (SPEC §5).

---

## 3. Tela `/loja-virtual` — Hub do módulo (mobile)

```
┌──────────────────────────────────────┐
│ ←  Loja Virtual                      │  ← header com título + raiz do rail
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 🛍  10 produtos na vitrine     │  │  ① estado — catálogo
│  │     2 banners · tema salvo     │  │
│  │     Ver produtos →             │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ ⚠  Usando banner padrão        │  │  ① estado — aparência
│  │     Sua loja exibe o banner    │  │
│  │     gerado com nome e slogan.  │  │
│  │     Configurar aparência →     │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 🔗  Link da sua loja           │  │  ③ link da vitrine
│  │     /loja/docee                │  │
│  │     ┌──────────┐ ┌──────────┐  │  │
│  │     │  Copiar  │ │  Abrir   │  │  │
│  │     └──────────┘ └──────────┘  │  │
│  └────────────────────────────────┘  │
│                                      │
│  Começar por                         │  ② atalhos
│  ┌────────────────────────────────┐  │
│  │ 🎨  Aparência                  │  │
│  │     Banner, carrossel, tema e  │  │
│  │     identidade                 │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 📦  Produtos                   │  │
│  │     Catálogo da sua loja       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ 🏷  Categorias                 │  │
│  │     Abre o CRUD do Estoque     │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Hub — desktop (≥ 1024px):** mesma informação em grade de 3 colunas; o link da vitrine sobe para o cabeçalho da página; os atalhos viram 3 cards lado a lado.

```
┌──────────────────────────────────────────────────────────────┐
│ ←  Loja Virtual                     🔗 /loja/docee  [Copiar]  │
│    Sua loja está no ar                         [Abrir]      │
│                                                              │
│  ┌───────────────┐ ┌───────────────┐ ┌────────────────────┐  │
│  │ 🛍 10 produtos │ │ 🎨 2 banners  │ │ ⚠ Usando banner    │  │
│  │ na vitrine    │ │ configurados  │ │ padrão              │  │
│  │ Ver produtos→ │ │ Tema salvo    │ │ Configurar aparência│  │
│  └───────────────┘ └───────────────┘ └────────────────────┘  │
│                                                              │
│  Começar por                                                 │
│  ┌───────────────┐ ┌───────────────┐ ┌────────────────────┐  │
│  │ 🎨 Aparência  │ │ 📦 Produtos   │ │ 🏷 Categorias      │  │
│  │ ...           │ │ ...           │ │ Abre o CRUD do     │  │
│  │               │ │               │ │ Estoque            │  │
│  └───────────────┘ └───────────────┘ └────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Componentes do hub:** `LojaVirtualHubPage` (spec) — títulos, cards de estado (contagem de `exibir_vitrine = true`, contagem de banners, status `config`/`gerado`), card de link com copiar/abrir, cards-atalho.

**Ações:**

| Elemento | Ação | Resultado |
|---|---|---|
| "Ver produtos" / atalho Produtos | toque | `/loja-virtual/produtos` |
| "Configurar aparência" / atalho Aparência | toque | `/loja-virtual/aparencia` |
| Atalho Categorias | toque | `/estoque/configuracoes` (redirect) |
| Botão **Copiar** | toque | copia a **URL completa** (`https://base-uniq.vercel.app/loja/docee`) para a área de transferência + feedback "Link copiado" |
| Botão **Abrir** | toque | `/loja/:slug` em nova aba |

---

## 4. Tela `/loja-virtual/aparencia` — Editor

### 4.1 Layout geral

Editor de coluna única (mobile-first). Cada bloco tem seu próprio estado de carregamento/vazio/erro. **Um único botão de salvar** no rodapé (sticky no mobile) — um só fluxo de gravação (`use-atualizar-aparencia-loja`), como define o SPEC §3.

```
┌──────────────────────────────────────┐
│ ←  Aparência da loja          Ver→   │  ← "Ver" abre /loja/:slug (nova aba)
│    Banner, tema e identidade         │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Banners              [+ Novo]  │  │  §4.2
│  │ ...lista...                    │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Carrossel                      │  │  §4.4
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Tema — 4 chaves                │  │  §4.5
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Identidade                     │  │  §4.6
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤  ← sticky (mobile)
│  [        Salvar alterações        ] │
└──────────────────────────────────────┘
```

**Desktop (≥ 1024px):** mesma ordem, mas "Carrossel" e "Tema" ficam lado a lado (2 colunas de ~50%), e "Identidade" ocupa a largura toda. O botão salvar desce para o canto inferior direito (não é barra cheia).

### 4.2 Bloco Banners — lista ordenável

```
│  Banners                            │
│  Imagens que abrem o topo da loja.  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ⠿ ↑ ↓ ┌──────────┐            │  │  ← drag handle + setas
│  │       │ preview  │  Natal na   │  │
│  │       │ 640x300  │  Doceê      │  │
│  │       └──────────┘  Subtítulo: │  │
│  │                       Trufas e │  │
│  │                       kits p/  │  │
│  │                       presentear│  │
│  │  Botão: "Ver sabores" ● cor    │  │
│  │  Posição: bottom-left          │  │
│  │  Destino: Produto → Cone       │  │
│  │  Trufado              Editar Rm│  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ ⠿ ↑ ↓ ┌──────────┐            │  │
│  │       │ preview  │  Páscoa     │  │
│  │       │ (mobile) │  ...        │  │
│  │       └──────────┘   Editar Rm │  │
│  └────────────────────────────────┘  │
│  [+ Novo banner]                     │
```

- **Reordenar:** setas ↑ ↓ sempre visíveis ao lado de cada linha (alvo ≥ 44px, ok no celular) + drag & drop onde o dispositivo suportar. A ordem só persiste ao **Salvar alterações**.
- **Editar:** abre o modal com os valores do banner.
- **Remover:** confirmação (ver §6) e a linha sai da lista local; só some do banco ao salvar.

### 4.3 Form de 1 banner — `BannerFormModal`

**Mobile (coluna única):**

```
┌──────────────────────────────────────┐
│  Novo banner                  ✕      │
│                                      │
│  Imagem — desktop                    │
│  _recomendado 1600 × 340 (4,67:1)    │
│  _retina 2240 × 480                  │
│  ┌────────────────────────────────┐  │
│  │      ( preview ou ícone )      │  │
│  │                                │  │
│  │     [ Escolher imagem ]        │  │
│  └────────────────────────────────┘  │
│  [ Remover imagem ]                  │  ← só com preview
│                                      │
│  Imagem — mobile (opcional)          │
│  _recomendado 1080 × 480 (2,25:1)    │
│  ┌────────────────────────────────┐  │
│  │     [ Escolher imagem ]        │  │
│  └────────────────────────────────┘  │
│                                      │
│  Orientação do upload                │
│  ✔ 1 imagem basta — o outro lado     │
│    usa o mesmo arquivo.              │
│  ⚠ A proporção varia com o aparelho  │
│    (2,24:1 a 3,79:1). Mantenha o     │
│    assunto no centro vertical.       │
│  ✔ JPG ou WebP · alvo ≤ 300 KB.      │
│  ✔ Área segura: textos à esquerda    │
│    (sobre o véu); assunto à direita. │
│                                      │
│  Título *                            │
│  [ Natal na Doceê______________ ]    │
│  Subtítulo                           │
│  [ Trufas e kits para presentear ]   │
│                                      │
│  Botão                               │
│  Texto    [ Ver mais___________ ]    │
│  Cor ação[ ● #00ccf5___________]     │
│  Cor texto[● #001933___________]     │  ← 🆕 text_color
│  Posição                             │
│  (●) bottom-left   ( ) bottom-right  │
│                                      │
│  Destino do clique                   │
│  (●) Produto      ( ) Link externo   │
│  ( ) Categoria    ( ) Vitrine        │
│  Valor: [ Selecionar produto ▼ ]     │
│  (lista = produtos ativos)            │
│                                      │
│        [ Cancelar ]  [ Salvar ]      │
└──────────────────────────────────────┘
```

**Desktop (≥ 1024px):** imagens à esquerda, campos à direita.

```
┌──────────────────────────────────────────────────────────────┐
│  Novo banner                                        ✕        │
│  ┌────────────────────────┐  ┌─────────────────────────────┐ │
│  │ Imagem — desktop       │  │ Título *                    │ │
│  │ _1600×340 · 4,67:1     │  │ [ Natal na Doceê________]   │ │
│  │ _retina 2240×480_      │  │ Subtítulo                   │ │
│  │ ┌────────────────────┐ │  │ [ Trufas e kits_______]    │ │
│  │ │     ( preview )    │ │  │                             │ │
│  │ │  [ Escolher ]      │ │  │ Botão  Texto [Ver mais____] │ │
│  │ └────────────────────┘ │  │        Cor ação [●#00ccf5]  │ │
│  │ [Remover imagem]       │  │        Cor texto [●#001933] │ │
│  │                        │  │ Posição: (●) bottom-left    │ │
│  │ Imagem — mobile        │  │          ( ) bottom-right   │ │
│  │ _1080×480 · 2,25:1     │  │                             │ │
│  │ ┌────────────────────┐ │  │ Destino: (●) Produto        │ │
│  │ │  [ Escolher ]      │ │  │          ( ) Link externo   │ │
│  │ └────────────────────┘ │  │          ( ) Categoria      │ │
│  └────────────────────────┘  │          ( ) Vitrine        │ │
│                              │  Valor: [ Produto ▼ ]       │ │
│  Orientação do upload        │                             │ │
│  ✔ 1 imagem basta — o outro  │        [Cancelar] [Salvar]  │ │
│  lado usa o mesmo arquivo.   │                             │ │
│  ⚠ proporção varia 2,24:1 a  │                             │ │
│  3,79:1 — assunto no centro  │                             │ │
│  vertical.                   │                             │ │
│  ✔ JPG ou WebP · alvo≤300KB  │                             │ │
│  ✔ textos à esquerda (véu),  │                             │ │
│  assunto à direita.          │                             │ │
│  ✔ id gerado no salvar:      │                             │ │
│  banner-<timestamp>          │                             │ │
└──────────────────────────────────────────────────────────────┘
```

**Destino do clique — valor condicional (o campo "Valor" muda conforme o tipo):**

| link_type | Campo Valor | Fonte do seletor |
|---|---|---|
| `product` | Select "Selecionar produto" | produtos ativos da empresa (`me_produto`, `ativo = true`) — guarda `id` |
| `external` | Input de URL (`https://...`) | texto livre |
| `category` | Select "Selecionar categoria" | categorias da empresa (`use-categorias`) — guarda `id` |
| `grid` | **Oculto** — âncora interna da própria vitrine, sem valor | — (valor `null`/`#` limpo) |

**Regras de validação do form (SPEC §2.1):**
- Pelo menos **1 imagem** (desktop **ou** mobile) — sem imagem o banner não é salvo.
- `título` obrigatório; `subtítulo` opcional; botão: `texto` + `cor` (ação) + **cor do texto** + `posição` opcionais (fallback da vitrine).
- `button_position` → somente `bottom-left` | `bottom-right`.
- `link_type` → somente os 4 aceitos; valor do clique obrigatório quando `link_type` for `product`/`external`/`category`.

**Orientação de assets (SPEC §2.6)** — *textual, sem impor*:
- Cada campo de imagem exibe a **dimensão recomendada do slot** (`desktop_url` → 1600 × 340, retina 2240 × 480 · `mobile_url` → 1080 × 480), com a proporção (4,67:1 / 2,25:1).
- O bloco de orientação (uma vez, entre os uploads e o formulário) lembra: um arquivo só é válido · proporção fluida (2,24:1 a 3,79:1) → assunto no **centro vertical** · **JPG ou WebP · alvo ≤ 300 KB** · área segura (textos à esquerda sobre o véu, assunto à direita).
- ⚠️ **Fora da v1:** validação automática de dimensão, recorte no navegador e conversão de formato — **não** implementar.

**Interação de upload (SPEC §6):**
- Escolher arquivo → **preview imediato** no componente (object URL, sem salvar ainda).
- Tipo inválido → erro inline: *"Envie uma imagem (JPG ou WebP)."*
- Acima do alvo → erro inline: *"Imagem muito grande — o alvo é ≤ 300 KB."*
- "Remover imagem" → limpa o preview e o arquivo (presente só quando há preview).
- **1 arquivo só:** válido — o lado vazio usa o mesmo arquivo na vitrine (consta no bloco de orientação).

### 4.4 Bloco Carrossel

```
│  Carrossel                          │
│  ┌────────────────────────────────┐  │
│  │ Autoplay                       │  │
│  │  (●) Ligado   ( ) Desligado    │  │
│  │  Intervalo  [ 5000 ] ms        │  │
│  │  mínimo 2000                   │  │
│  │  ℹ️ Autoplay só tem efeito     │  │
│  │  com 2+ banners.               │  │
│  └────────────────────────────────┘  │
```

- Intervalo: input numérico, step 500, **clamp ≥ 2000**; abaixo → erro inline + não salva.
- Sem dados salvos: exibe **autoplay ligado + 5000ms** (defaults de `use-loja-appearance`).

### 4.5 Bloco Tema — as 4 chaves

```
│  Tema — 4 chaves                    │
│  ┌────────────────────────────────┐  │
│  │ Cor principal   [● #86cb92___] │  │
│  │ Cor secundária [● #1f2937___]  │  │
│  │ Arredondamento [ 8px_________] │  │
│  │ Fonte          [ Poppins    ▼ ]│  │
│  │                                │  │
│  │ ℹ️ Vazios = padrão da UNIQ.    │  │
│  │ Sua loja usa estes valores até │  │
│  │ você mudar.                    │  │
│  └────────────────────────────────┘  │
```

- Chaves exatas do contrato: `primaryColor` · `secondaryColor` · `borderRadius` · `fontFamily`.
- Sem dados: os campos já vêm **preenchidos com os defaults** (`#86cb92`, `#1f2937`, `8px`, `Poppins`) — o parceiro vê o que está valendo hoje.
- Cor: chip de cor + hex editável (padrão visual segue `DESIGN.md`; a mecânica é a mesma da paleta do WIRE de categorias).
- `fontFamily`: select com Poppins + alternativas de sistema; `borderRadius`: input numérico com sufixo `px`.

### 4.6 Bloco Identidade — `store_config`

```
│  Identidade                         │
│  ┌────────────────────────────────┐  │
│  │ Slogan    [_______________]    │  │
│  │ Descrição [_______________]    │  │
│  │ Ramo      [_______________]    │  │
│  │                                │  │
│  │ ℹ️ Enquanto vazio, a vitrine   │  │
│  │ usa o nome da loja e o ramo.   │  │
│  │ O que você não vê aqui         │  │
│  │ (ex.: whatsapp_contact) é      │  │
│  │ preservado ao salvar (merge).  │  │
│  └────────────────────────────────┘  │
```

- Três campos: `slogan` · `description` · `ramoAtuacao`.
- Textarea curta (2–3 linhas) para descrição; inputs de linha para slogan/ramo.
- **Nunca** renderiza nem edita `whatsapp_contact` — o merge do hook preserva.

### 4.7 Salvar alterações

| Estado | Comportamento |
|---|---|
| Pronto | Barra/botão "Salvar alterações" |
| **Salvando** | Botão desabilitado + spinner "Salvando..." |
| **Sucesso** | Toast *"Alterações salvas"* · ✓ no bloco alterado some após ~3s |
| **Erro** | Toast *"Não foi possível salvar. Tente novamente."* + **erro inline** (nunca silencioso) |
| **Validação** | Bloco com erro ganha borda de erro; mensagem junto ao campo (ex.: intervalo < 2000) |

Fluxo de gravação (SPEC §3, inviolável): ao salvar, o hook **lê o estado atual** → **merge em 2 níveis** (`appearance` + `theme`/`hero` + `store_config`) → grava só o que mudou. **Nunca** confia no JSON vindo da tela.

---

## 5. Tela `/loja-virtual/produtos` — Lista + modal compartilhado

### 5.1 Lista (mesma linguagem da lista de produtos do Estoque)

```
┌──────────────────────────────────────┐
│ ←  Produtos da loja        [+ Novo]  │
│    12 produtos · 10 na vitrine       │
│  [ 🔍  Buscar produto...          ]  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ [foto]  Trufa de Ninho         │  │
│  │         COC-001 · Trufa        │  │
│  │         R$ 5,00   (de R$ 6,50) │  │
│  │         40 un · Peça           │  │
│  │                    [Editar]    │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ [foto]  Cone Trufado           │  │
│  │         ...                    │  │
│  └────────────────────────────────┘  │
│  (paginação/scroll infinita como    │
│   no Estoque — sem inventar tela)   │
└──────────────────────────────────────┘
```

- **"+ Novo"** e **"Editar"** abrem o **mesmo** `ProdutoFormModal` movido para `components/produto/` (D3).
- A lista mostra dados expostos pelo mapper de `use-produtos` (que agora também devolve `exibir_vitrine` e `unidade`).
- **Vazio:** ilustração de caixa + *"Nenhum produto ainda. Cadastre o primeiro produto para sua loja ter catálogo."* + botão **"+ Adicionar produto"**.
- **Erro:** card *"Não foi possível carregar os produtos."* + **Tentar novamente**.

### 5.2 O modal compartilhado — `ProdutoFormModal` (movido)

Passos: **1 Informações · 2 Preços · 3 Estoque** (`STEPS` atual, inalterado). Legenda de mudanças: 🆕 **novo** · 🔁 **já existia e agora persiste** · ❌ **removido**.

**Passo 1 — Informações** (🆕 toggle + 🔁 unidade):

```
┌──────────────────────────────────────┐
│  Novo Produto                 ✕      │
│  Passo 1 de 3 ● Informações          │
│                                      │
│  Foto do produto                     │
│  ┌────────┐  [Enviar foto]           │
│  │(preview)│ [Remover]               │
│  └────────┘  JPG, PNG ou WebP · 5MB  │
│                                      │
│  Nome do produto *                   │
│  [ Trufa de Ninho______________ ]    │
│  SKU *            Unidade *          │  🔁 agora persiste
│  [ COC-001______ ] [ Peça ▼       ]  │  (migration aditiva
│                                      │   ou coluna existente)
│  Categoria  (chips reais coloridas)  │
│                                      │
│  Código de barras                    │
│  [ ____________EAN-13___________ ]   │
│                                      │
│  ┌────────────────────────────────┐  │  🆕 exibir_vitrine
│  │  🛍 VITRINE                    │  │
│  │  Mostrar na vitrine     [ON]   │  │  toggle,
│  │  Desligado, o produto some     │  │  default = true
│  │  de /loja/docee                │  │
│  └────────────────────────────────┘  │
│                                      │
│         [ Cancelar ] [ Próximo → ]   │
└──────────────────────────────────────┘
```

**Passo 2 — Preços** (🆕 "Preço promocional" **funcional**):

```
┌──────────────────────────────────────┐
│  Passo 2 de 3 ○ ● ○   Preços         │
│                                      │
│  Preço de custo *   Preço de venda * │
│  [R$ 2,80______]    [R$ 5,00_____]   │
│  ┌────────────────────────────────┐  │
│  │ Margem de lucro: 44%  +R$2,20  │  │
│  │ ✅ Margem saudável             │  │
│  └────────────────────────────────┘  │
│                                      │
│  Preço promocional (opcional)        │  🆕 ligado em
│  [R$ 6,50_______________________]   │  preco_varejo
│  ℹ️ Maior que o preço de venda p/    │
│  a loja mostrar "de R$ 6,50 por      │
│  R$ 5,00".                           │
│  ⚠ erro se igual ou menor: "O preço  │
│  promocional deve ser maior que o    │
│  preço de venda."                    │
│                                      │
│         [ Voltar ] [ Próximo → ]     │
└──────────────────────────────────────┘
```

**Passo 3 — Estoque** (❌ campos mortos removidos):

```
┌──────────────────────────────────────┐
│  Passo 3 de 3 ○ ○ ●   Estoque        │
│                                      │
│  Quantidade inicial  Estoque mínimo  │
│  [ 40______________ ] [ 5________]   │
│                                      │
│  ❌ "Localização no depósito"        │  removido (YAGNI —
│  ❌ "Fornecedor padrão"              │  input/select mortos
│                                      │  viajam sozinhos)
│  Descrição curta                     │
│  [ ______________________________ ]  │
│  [ ______________________________ ]  │
│                                      │
│        [ Voltar ] [ Salvar produto ] │
└──────────────────────────────────────┘
```

**Regras do modal (SPEC §4):**
- Toggle "Mostrar na vitrine" grava `exibir_vitrine` em **criar e atualizar**. **Fato verificado (SPEC §2.4): o `column_default` é `false`** → o **cadastro envia `true` explícito**, senão o produto novo nasce invisível na loja. O SPEC §2.5 propõe ainda alinhar o default do banco para `true` — **decisão do fundador**.
- "Preço promocional" grava `preco_varejo`; o selo "de/por" da vitrine já existe e usa `preco_varejo > preco` — nada muda nela.
- `unidade` é enviada e volta preenchida na edição (hoje é coletada e perdida — bug silencioso).
- Os 5 chamadores do Estoque (2 imports + 3+2 usos) passam a importar de `components/produto/` — **sem duplicata de formulário**.

---

## 6. Estados obrigatórios

Regra do projeto: toda tela/bloco novo tem **loading (skeleton) · vazio · erro + retry · sucesso**.

| Bloco | loading | vazio | erro | sucesso |
|---|---|---|---|---|
| Hub cards | 3 cards skeleton | cards com contadores zerados + avisos | card de erro + retry | cards |
| Editor (todos os blocos) | skeleton por bloco na altura final | defaults visíveis + aviso "banner gerado" | card de erro + retry (por bloco) | blocos preenchidos |
| Lista de banners | 2–3 linhas skeleton (linha = preview + 2 linhas de texto) | aviso banner gerado + [+ Novo banner] | card + retry (bloco) | linhas ordenáveis |
| Form de banner | — (gravação) | campos vazios + hint "1 imagem basta" | erros inline por campo | modal fecha + linha atualizada |
| Carrossel | skeleton do card | defaults (on · 5000) | card + retry | valores |
| Tema | 4 inputs skeleton | defaults preenchidos | card + retry | valores |
| Identidade | 3 inputs skeleton | vazios + placeholders | card + retry | valores |
| Lista de produtos | linhas skeleton | empty com CTA | card + retry | linhas |
| Salvar (editor) | — | — | toast + erro inline | toast "Alterações salvas" |
| Modal de produto | — | — | erro inline acima do rodapé | fecha + lista atualizada |

### 6.1 Editor sem `appearance` (vazio) — aviso do banner gerado (SPEC §6)

```
│  ┌────────────────────────────────┐  │
│  │ ⓘ  SUA LOJA HOJE              │  │
│  │  Sem banners salvos, a vitrine │  │
│  │  usa o BANNER GERADO: nome da  │  │
│  │  loja + slogan/ramo + botão    │  │
│  │  "Ver o cardápio". Ele é do    │  │
│  │  seu próprio tenant — nunca de │  │
│  │  outra empresa.                │  │
│  └────────────────────────────────┘  │
│  Banners                 [+ Novo]    │
│  Nenhum banner ainda.                │
│  Adicione o primeiro para            │
│  personalizar o topo da loja.        │
```

> Este aviso só aparece quando `banners[]` está vazio (origem "gerado"). Ao adicionar o 1º banner, o aviso sai e a lista assume.

### 6.2 Upload — preview, erro de tipo/tamanho, remover

```
│  Imagem — desktop                     │
│  _recomendado 1600 × 340 (4,67:1)_   │
│  ┌────────────────────────────────┐  │
│  │  ( preview da imagem nova )    │  │  ← antes de salvar
│  │  [ Escolher outra ]            │  │
│  └────────────────────────────────┘  │
│  [ Remover imagem ]                  │
│  ✕ Envie uma imagem (JPG ou WebP).   │  ← erro de tipo
│  (ou) ✕ Imagem muito grande — o     │  ← erro de tamanho
│    alvo é ≤ 300 KB.                  │
```

### 6.3 Banner com só um arquivo — válido

```
│  Imagem — mobile (opcional)           │
│  _recomendado 1080 × 480 (2,25:1)_   │
│  ┌────────────────────────────────┐  │
│  │  [ Escolher imagem ]           │  │
│  │  ✔ vazio: usa a desktop        │  │
│  └────────────────────────────────┘  │
```

> E o inverso: só mobile preenchido → a desktop usa o arquivo mobile. A vitrine renderiza o que existe (SPEC §2.1: *"preencher um é válido — o outro usa o mesmo arquivo"*). A orientação completa de formatos/dimensões/área segura mora **uma única vez** no modal (§4.3, bloco "Orientação do upload").

### 6.4 Salvar — estados (SPEC §6)

```
│  ┌────────────────────────────────┐  │
│  │ [ ⟳ Salvando... ]   (disabled) │  │  salvando
│  └────────────────────────────────┘  │
│  ✓ (toast 3s) Alterações salvas      │  sucesso
│  ✕ (toast) Não foi possível salvar.  │  erro — NUNCA
│    Tente novamente.                  │  silencioso
│  + erro inline no bloco responsável  │
```

### 6.5 Loading (skeleton) — editor

```
│  ┌────────────────────────────────┐  │
│  │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  [▒▒▒▒▷]     │  │  banners
│  │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒               │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ ▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒        │  │  carrossel/tema
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒          │  │  identidade
│  │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒          │  │
│  └────────────────────────────────┘  │
│  altura final de cada bloco — sem    │
│  salto de layout                     │
```

### 6.6 Erro + retry (padrão do projeto)

```
│  ┌────────────────────────────────┐  │
│  │ ⚠  Não foi possível carregar   │  │
│  │     a aparência.               │  │
│  │     [ Tentar novamente ]       │  │
│  └────────────────────────────────┘  │
```

### 6.7 Remover banner — confirmação (ação destrutiva)

```
┌──────────────────────────────────────┐
│  Remover este banner?                │
│                                      │
│  "Natal na Doceê" deixa de aparecer  │
│  no topo da loja.                    │
│                                      │
│          [ Cancelar ]  [ Remover ]   │
└──────────────────────────────────────┘
```

> (Aprovado no SPEC §10 — lacuna 1: dialog de confirmação, padrão do CRUD de categorias.)

---

## 7. Mensagens (textos oficiais)

| Contexto | Texto |
|---|---|
| Hub · aparência configurada | "🎨 2 banners · tema salvo" / "Sua loja está no ar" |
| Hub · aparência em fallback | ⚠ "Usando banner padrão — sua loja exibe o banner gerado com nome e slogan." |
| Hub · link | "Link da sua loja" + copiar confirma "Link copiado" |
| Banners vazio | "Nenhum banner ainda. Adicione o primeiro para personalizar o topo da loja." |
| Aparência vazio (aviso) | ⓘ "Sua loja está usando o **banner gerado**: nome + slogan/ramo + botão 'Ver o cardápio'. Ele é do seu próprio tenant — nunca de outra empresa." |
| Upload · desktop (dica de dimensão) | "Recomendado: **1600 × 340** (proporção 4,67:1) · retina **2240 × 480**." |
| Upload · mobile (dica de dimensão) | "Recomendado: **1080 × 480** (proporção 2,25:1)." |
| Upload · orientação (bloco fixo) | "✔ Preencher só um é válido — o outro lado usa o mesmo arquivo. · ⚠ A proporção varia com a largura do aparelho (2,24:1 a 3,79:1) — mantenha o assunto principal no centro vertical. · ✔ JPG ou WebP · alvo ≤ 300 KB. · ✔ Área segura: textos à esquerda (sobre o véu); assunto principal à direita." |
| Upload tipo inválido | "Envie uma imagem (JPG ou WebP)." |
| Upload grande | "Imagem muito grande — o alvo é ≤ 300 KB." |
| Carrossel | "ℹ️ Autoplay só tem efeito com 2+ banners." · "mínimo 2000" |
| Intervalo inválido | "O intervalo mínimo é de 2000ms." |
| Tema vazio | "ℹ️ Vazios = padrão da UNIQ. Sua loja usa estes valores até você mudar." |
| Identidade vazio | "ℹ️ Enquanto vazio, a vitrine usa o nome da loja e o ramo." |
| Salvar sucesso | "Alterações salvas" |
| Salvar erro | "Não foi possível salvar. Tente novamente." (toast) + erro inline no bloco |
| Produtos vazio | "Nenhum produto ainda. Cadastre o primeiro produto para sua loja ter catálogo." |
| Produtos erro | "Não foi possível carregar os produtos." + [Tentar novamente] |
| Produto · promocional inválido | "O preço promocional deve ser maior que o preço de venda." |
| Produto · promocional ajuda | "ℹ️ Maior que o preço de venda para a loja mostrar 'de R$ X por R$ Y'." |
| Produto · toggle vitrine | "Desligado, o produto some de /loja/docee." |

---

## 8. Responsividade

| Faixa | Hub | Editor | Form de banner | Lista de produtos |
|---|---|---|---|---|
| **< 640 (mobile)** | coluna única: estado → link → atalhos | coluna única, blocos empilhados, **botão salvar sticky** | coluna única: imagens no topo, campos abaixo | linhas empilhadas, filtro full-width |
| **640–1023 (tablet)** | 2 colunas (estado + link) | coluna única (segue mobile-first) | 2 colunas quando sobrar espaço | linhas com mais colunas |
| **≥ 1024 (desktop)** | header com link da vitrine; 3 colunas de cards | Carrossel + Tema lado a lado; salvar no canto inferior direito | 2 colunas (imagens × campos) | igual ao Estoque desktop |

**Decisões de estrutura:**
- Alvos de toque ≥ 44px (setas da lista de banners, chips do destino, toggle).
- Sticky do salvar **só** no mobile/tablet — no desktop o botão fica fixo no canto, sem cobrir o conteúdo.
- Drag & drop é *progressive enhancement*: as setas ↑ ↓ funcionam em qualquer dispositivo.

---

## 9. Acessibilidade

- `aria-label` em: botões de copiar/abrir do hub, adicionar/editar/remover/reordenar de cada banner, chips do destino do clique, toggle "Mostrar na vitrine".
- Toggle "Mostrar na vitrine" com `aria-checked` (switch real, não checkbox disfarçado).
- Setas ↑ ↓: `aria-label="Mover banner para cima/para baixo"`; drag handle com `aria-grabbed`.
- Erros de campo com `role="alert"`/`aria-describedby` ligando o input ao texto do erro.
- Estado de salvando comunicado por texto (não só spinner): "Salvando...".
- Foco retorna ao botão que abriu o modal ao fechar; teclado navega todos os passos.
- Nenhuma informação transmitida só por cor (o estado "na vitrine" do toggle tem texto, os erros têm texto, etc.).

---

## 10. Checklist do WIRE

| # | Requisito (SPEC §4–§6) | Coberto em | Status |
|---|---|---|---|
| 1 | Hub com estado da loja, atalhos e link da vitrine (copiar/abrir) | §3 | ✅ |
| 2 | Atalho Categorias redireciona ao CRUD existente | §2, §3 | ✅ |
| 3 | Editor com 4 blocos (banners · carrossel · tema · identidade) | §4 | ✅ |
| 4 | Banners: lista ordenável + adicionar/editar/remover/reordenar | §4.2 | ✅ |
| 5 | Form de banner: upload desktop+mobile, título, subtítulo, texto/cor do botão, **cor do texto (`text_color`)**, posição, destino + valor condicional | §4.3 | ✅ |
| 6 | Orientação de assets (SPEC §2.6): dimensão recomendada por slot (1600×340 · 1080×480), proporção fluida, área segura, JPG ou WebP ≤ 300 KB — **só texto**, sem validação automática/recorte/conversão | §4.3, §6.3, §7 | ✅ |
| 7 | Carrossel: autoplay on/off + intervalo mín. 2000 | §4.4 | ✅ |
| 8 | Tema: as 4 chaves exatas do contrato | §4.5 | ✅ |
| 9 | Identidade: slogan · descrição · ramo (`store_config`) | §4.6 | ✅ |
| 10 | Salvar: merge, estado salvando, toast sucesso, erro visível | §4.7, §6.4 | ✅ |
| 11 | Aparência sem dados: defaults visíveis + aviso do banner gerado | §6.1 | ✅ |
| 12 | Upload: preview antes de salvar · erro tipo/tamanho · remover | §6.2 | ✅ |
| 13 | Banner com 1 arquivo: válido, outro lado usa o mesmo | §6.3 | ✅ |
| 14 | Produtos: lista do módulo + modal compartilhado | §5.1 | ✅ |
| 15 | Modal: 3 passos Informações · Preços · Estoque | §5.2 | ✅ |
| 16 | Toggle "Mostrar na vitrine" novo no passo 1 (`exibir_vitrine`, default `true`) | §5.2 | ✅ |
| 17 | "Preço promocional" funcional no passo 2 (`preco_varejo`) | §5.2 | ✅ |
| 18 | `unidade` persiste (passo 1) | §5.2 | ✅ |
| 19 | Removidos: "Localização no depósito" e "Fornecedor padrão" | §5.2 | ✅ |
| 20 | Loading · vazio · erro+retry · sucesso em toda tela/bloco | §6 | ✅ |
| 21 | Mobile-first com desktop desenhado onde difere | §8 | ✅ |
| 22 | Sem inventar campos/componentes fora do SPEC | §12 (lacunas conferidas no SPEC §10) | ✅ |

---

## 11. Riscos e garantias (espelha o PRD §7)

| Garantia | Como o WIRE respeita |
|---|---|
| **Mensagem "banner do próprio tenant"** | O aviso do banner gerado diz explicitamente "nunca de outra empresa" (§6.1) — o editor não introduz leitura cruzada |
| **Merge nunca sobrescreve** | A seção Identidade avisa que chaves desconhecidas são preservadas (§4.6); o salvar é único hook com merge |
| **`exibir_vitrine` default `false` no banco** | **Verificado (SPEC §2.4):** cadastro envia `true` explícito + toggle com default `true` na UI. Alinhar o default do banco para `true` é decisão do fundador (SPEC §2.5) |
| **Vitrine pública não regride** | Nenhuma tela deste WIRE toca `/loja/*` — apenas o hub abre o link em nova aba |

---

## 12. Lacunas do WIRE — resolução (SPEC §10)

As 10 lacunas levantadas na versão anterior deste WIRE foram **decididas no SPEC §10** (22/09/2026). Status: **✅ resolvido** × **⚠️ aguarda o fundador**.

| # | Lacuna (original) | Resolução (SPEC §10) | Status |
|---|---|---|---|
| 1 | Confirmação ao remover banner | Dialog de confirmação, padrão do CRUD de categorias (§6.7) | ✅ resolvido |
| 2 | UX de reordenar banners | Setas ↑↓ (acessíveis, funcionam no toque) **e** drag (§4.2) | ✅ resolvido |
| 3 | `text_color` não exposto | **EXPOR** — campo novo no form, ao lado de `button_color` (§4.3) | ✅ resolvido |
| 4 | Seletor de destino do clique | `product` → select de produtos ativos · `external` → URL · `category` → select de categorias · `grid` → oculto | ✅ resolvido |
| 5 | Paleta livre ou restrita ao `DESIGN.md` | **Livre, com os tokens do `DESIGN.md` como default** — o `appearance` real da Gráfica HQ usa `#4f9ef3`/`#ff6600`, cores fora da paleta UNIQ; restringir quebraria o que já está em produção | ⚠️ **aguarda o fundador** |
| 6 | `fontFamily` / `borderRadius` | Select de fontes · input numérico com sufixo `px` | ✅ resolvido |
| 7 | Salvar por página × por bloco | **Um único botão de página** — coerente com o hook único de merge (D7) | ✅ resolvido |
| 8 | Conteúdo do hub | 2 cards de contador (produtos na vitrine · banners) + card do link | ✅ resolvido |
| 9 | Posição do toggle no modal | Seção própria "Vitrine" no passo 1, após Código de barras | ✅ resolvido |
| 10 | `column_default` de `exibir_vitrine` | **Dado real (SPEC §2.4): o default é `false`** → cadastro envia `true` explícito | ✅ resolvido (fato) · ⚠️ **aguarda o fundador** o alinhamento do default do banco para `true` (SPEC §2.5) |

**Pendências que seguem abertas para o fundador:**
1. **Lacuna 5 — paleta da loja do parceiro** (livre com defaults do `DESIGN.md` × restrita aos tokens).
2. **Default de `exibir_vitrine` no banco** — alinhar para `true` via `ALTER TABLE`? (SPEC §2.5, opção recomendada).