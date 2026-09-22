# SPEC — Loja Virtual: Completar o Módulo (editor de aparência + catálogo)

> **PRD:** `tracking/plans/PRD-LojaVirtual-CompletarModulo.md`
> **WIRE:** `tracking/wireframe/WIRE-LojaVirtual-CompletarModulo.md`
> **Status:** 🔶 Rascunho técnico — aguarda WIRE aprovado para implementar
> **Regra de ouro:** sem WIRE aprovado, não se escreve código de tela.
> **Base:** recon de 22/09/2026 (todas as referências `arquivo:linha` verificadas)

---

## 1. Arquivos

### Novos

| Arquivo | Papel |
|---|---|
| `src/app/hooks/use-atualizar-aparencia-loja.ts` | **Write** em `me_empresa.appearance` + `store_config` com **merge seguro** |
| `src/app/hooks/use-loja-virtual-produtos.ts` | Catálogo do módulo (reusa `use-produtos`; só adapta filtros/estado) |
| `src/app/components/loja-virtual/LojaVirtualHubPage.tsx` | Hub do módulo: estado da loja, atalhos, **link da vitrine** |
| `src/app/components/loja-virtual/AparenciaPage.tsx` | Página do editor (compõe os 3 blocos) |
| `src/app/components/loja-virtual/ProdutosLojaPage.tsx` | Lista de produtos do módulo (abre o modal compartilhado) |
| `src/app/components/loja-virtual/editor/BannerLista.tsx` | Lista ordenável de banners + ações |
| `src/app/components/loja-virtual/editor/BannerFormModal.tsx` | Form de 1 banner (upload desktop/mobile, textos, botão, destino) |
| `src/app/components/loja-virtual/editor/CarrosselConfig.tsx` | Autoplay + intervalo (mín. 2000ms) |
| `src/app/components/loja-virtual/editor/TemaConfig.tsx` | As **4 chaves** de `theme` |
| `src/app/components/loja-virtual/editor/IdentidadeConfig.tsx` | `store_config`: slogan · descrição · ramo |
| `src/app/components/produto/ProdutoFormModal.tsx` | **Movido** de `components/estoque/` (D3) |

### Alterados

| Arquivo | Mudança |
|---|---|
| `src/app/lib/moduloRoutes.ts:9` | `loja_virtual: '/marketplace'` → **`'/loja-virtual'`** |
| `src/app/lib/modulos.ts:31` | ⚠️ **`loja_virtual`: status `nao_adquirido` → `ativo`** — **furo corrigido em 22/09/2026**, ver abaixo |
| `src/app/components/layout/AppLayout.tsx:70` | label `"Marketplace"` → **`"Loja Virtual"`**, path → `/loja-virtual` |
| `src/app/components/layout/AppLayout.tsx:137-145` | ⚠️ **`SUBNAV_SECTIONS`, seção `railId: "loja"`** — ainda descrevia o Marketplace. **Furo corrigido em 22/09/2026**, ver abaixo |
| `src/app/components/layout/AppLayout.tsx:205` | removido o link `m-marketplace` → `/marketplace` do subnav "Módulos" |
| `src/app/contexts/ModulosContext.tsx` | ⚠️ migração `uniq-loja-virtual-ativa-v1` — **furo corrigido em 22/09/2026**, ver abaixo |
| `src/app/routes.tsx` | +4 rotas do módulo (§6) |
| `src/app/components/estoque/ProdutosPage.tsx` | import do modal (`:36`) + **3 chamadores** (`:413`, `:424`, `:436`) |
| `src/app/components/estoque/ProdutoDetalhePage.tsx` | import do modal (`:44`) + **2 chamadores** (`:368`, `:381`) |
| `src/app/hooks/use-produtos.ts` | expor `exibir_vitrine` e `unidade` no mapper |
| `src/app/hooks/use-criar-produto.ts:44-65` | gravar `exibir_vitrine`, `preco_varejo`, `unidade` |
| `src/app/hooks/use-atualizar-produto.ts:49-67` | gravar `exibir_vitrine`, `preco_varejo`, `unidade` |
| `src/app/types/loja.ts` | tipos do editor (reusa `BannerLoja`, `TemaLoja`) |

> ⚠️ **Furo encontrado em 22/09/2026 — o módulo ia nascer invisível.**
>
> `loja_virtual` está no catálogo como **`nao_adquirido`** (`lib/modulos.ts:31`). O `visibleRailItems` (`AppLayout.tsx:259-265`) **esconde** tudo que é `nao_adquirido` ou `cancelado`.
>
> Sem trocar o status para **`ativo`**, o módulo seria construído por inteiro — rotas, telas, hooks — e **não apareceria no rail**. Sem erro, sem aviso: apenas invisível. Este SPEC originalmente **não previa essa troca**; ela é obrigatória para o módulo ser alcançável.

> ⚠️ **Segundo furo — `SUBNAV_SECTIONS`** (encontrado pelo fundador em 22/09/2026, validando no celular).
>
> Trocar o item do rail **não bastava**. O submenu é casado por `railId` (`AppLayout.tsx:255-256`), e a seção `railId: "loja"` continuava descrevendo o **Marketplace** — "Lojistas", "Pedidos do vendedor", "Dashboard do vendedor", todos em `/marketplace`.
>
> Resultado: o rail dizia "Loja Virtual", mas o submenu ao lado levava ao módulo aposentado. **Este SPEC não previa o `SUBNAV_SECTIONS`**: ele lista as rotas do módulo (§5), mas não os itens de submenu do layout.
>
> **Regra para o próximo agente:** um módulo novo no rail precisa de **três** amarrações, não duas — `RAIL_ITEMS` (label/path), **`SUBNAV_SECTIONS`** (seção com o mesmo `railId`) e `moduloRoutes`.

> ⚠️ **Terceiro furo — o `localStorage` vence o catálogo.**
>
> O status dos módulos vive em `uniq-modulos-ativos`, e `carregarModulos()` (`ModulosContext.tsx:34-35`) faz `existentes.get(modulo.id) || modulo` — **o valor SALVO ganha** do catálogo do código.
>
> Como `loja_virtual` tem `id: '7'` e qualquer navegador que já abriu o app tem essa entrada salva como `nao_adquirido`, **trocar o catálogo para `ativo` não bastava**: o item seguiria escondido, justamente em quem já conhece o sistema.
>
> Corrigido com o padrão que o projeto já usava para a Agenda: chave `uniq-loja-virtual-ativa-v1`, convertendo `nao_adquirido` → `ativo` uma única vez. **`cancelado` não é ressuscitado** — o cancelamento segue definitivo, conforme a regra registrada no próprio arquivo.

### Intocados (não regredir)

`LojaPage.tsx` (ambas as variantes) · `LojaBannerCarousel` · `LojaCategoriaBar` · `LojaHeaderTenant` · `LojaSecaoHorizontal` · `use-loja-appearance.ts` (leitura) · `use-loja-produtos.ts` · `use-loja-categorias.ts` · `use-loja-criar-pedido.ts` · `use-carrinho-loja.ts` · `CheckoutPage` · `ProdutoLojaPage` · `use-categorias.ts` (CRUD já entregue).

> **Regra:** este SPEC **não altera a vitrine pública**. Ela já funciona e atende cliente real. Toda mudança é no lado admin + nos hooks de escrita.

---

## 2. Contrato de dados (real — verificado)

### 2.1 `me_empresa.appearance` (jsonb)

```jsonc
{
  "theme": { "fontFamily": "Poppins", "borderRadius": "8px",
             "primaryColor": "#86cb92", "secondaryColor": "#1f2937" },
  "hero": {
    "type": "carousel", "autoplay": true, "interval": 5000,
    "banners": [{
      "id": "banner-<timestamp>",
      "title": "...", "subtitle": "...",
      "desktop_url": "...", "mobile_url": "...",
      "button_text": "Ver mais", "button_color": "#00ccf5",
      "text_color": "#001933", "button_position": "bottom-left",
      "link_type": "product", "link_value": "..."
    }]
  }
}
```

| Campo | Tipo | Regra |
|---|---|---|
| `button_position` | `"bottom-left" \| "bottom-right"` | default `bottom-left` |
| `link_type` | `"product" \| "external" \| "category" \| "grid"` | qualquer outro → `null` (`use-loja-appearance.ts:30-56`) |
| `link_value` | string | `"#"` é descartado como placeholder histórico (`:53-54`) |
| `desktop_url` / `mobile_url` | string | preencher **um** é válido — o outro usa o mesmo arquivo |
| `interval` | number | **mínimo 2000** (forçado em `use-loja-appearance.ts:116`) |
| `autoplay` | boolean | exige **2+ banners** para ter efeito (`LojaBannerCarousel.tsx:67`) |

**Defaults que o editor deve exibir quando vazio** (`use-loja-appearance.ts:5-10`):
`primaryColor #86cb92` · `secondaryColor #1f2937` · `borderRadius 8px` · `fontFamily Poppins`.

### 2.2 `me_empresa.store_config` (jsonb)

```jsonc
{ "slogan": "...", "description": "...", "ramoAtuacao": "...", "whatsapp_contact": "..." }
```
Lido em `use-loja-tenant.ts:60`, tipado em `types/loja.ts:4-10`. Consumido por `LojaHeaderTenant.tsx:41-45` (subtítulo) e `use-loja-appearance.ts:66-71` (subtítulo do banner gerado).

### 2.3 `me_produto` — campos que passam a ter escrita

| Coluna | Existe? | Estado hoje | Ação |
|---|---|---|---|
| `exibir_vitrine` | ✅ (filtro em `use-loja-produtos.ts:70`) | **nunca escrita** | gravar + expor + toggle |
| `preco_varejo` | ✅ | escrito só por fora | ligar ao "Preço promocional" |
| `unidade` | ❓ **verificar** | coletada e perdida | ver §2.4 |

### 2.4 Schema verificado no Supabase oficial (22/09/2026)

Consulta: `information_schema.columns` em `me_produto` (projeto `krrkfgvdwhpelxtrdtla`).

| Coluna | Tipo | Default | Nulo | Consequência |
|---|---|---|---|---|
| **`exibir_vitrine`** | boolean | **`false`** | sim | ⚠️ **Produto criado pelo app nasce INVISÍVEL na vitrine** |
| **`unidade`** | — | — | — | ❌ **NÃO EXISTE** → exige migration aditiva |
| `preco_varejo` | numeric | `null` | sim | ok — é onde o "Preço promocional" grava |
| `ativo` | boolean | `true` | sim | ok |
| `estoque_atual` | integer | `0` | sim | ok |
| `tipo` | text | `'simples'` | sim | **não** usar para categoria |
| `opcoes_config` | jsonb | `'[]'` | sim | alternativa para `unidade` (**não** recomendada) |

**Estado real dos dados, por empresa:**

| Empresa | `exibir_vitrine` | `ativo` | produtos |
|---|---|---|---|
| **Doceê** | true | true | **16** |
| Gráfica HQ | true | false | 4 |
| Loja Teste01 | false | true | 1 |
| UNIQ Empresas | false | true | 2 |
| UNIQ Empresas | true | false | 3 |

**Leitura honesta:** a Doceê **não está quebrada hoje** — os 16 produtos dela estão `exibir_vitrine = true` (configurados por fora do app). Os 3 produtos `ativo = true` invisíveis são da **Loja Teste01** e **UNIQ Empresas**, não dela.

**Mas o bug é latente com disparo garantido:** o default é `false` e **o modal não escreve a coluna**. Ou seja, **o próximo produto que a Doceê cadastrar pela interface nasce invisível na loja — e não existe UI para corrigir**. É a diferença entre "funciona hoje" e "funciona amanhã".

### 2.5 Ações de schema obrigatórias (decidir antes de codar)

1. **`unidade`** — `ALTER TABLE me_produto ADD COLUMN unidade text;` (nullable, zero risco).
2. **`exibir_vitrine` no insert** — o cadastro deve enviar **`true` explícito** (o default é `false`).
3. **Alinhar o default do banco à intenção** — `ALTER TABLE me_produto ALTER COLUMN exibir_vitrine SET DEFAULT true;`. Racional: produto novo deve **aparecer** na loja por padrão, e o parceiro **desmarca** se não quiser. Hoje o comportamento é o inverso do esperado.
   > ⚠️ **Decisão do fundador.** É a opção recomendada, mas mexe no default de uma coluna existente.

### 2.6 Especificação de assets do banner (herdada de `SPEC-LojaVirtual-VitrineModerna.md:176-234`)

> ⚠️ **Lacuna corrigida em 22/09/2026.** O SPEC antecessor documentava isto em detalhe; **este SPEC não tinha carregado** a especificação de assets. Sem ela, o editor não orienta o parceiro e a arte chega em proporção errada.

O banner tem **altura fixa e largura variável**, com `object-cover` (preenche e corta).

| Slot | Faixa | Largura exibida | Altura | Imagem recomendada |
|---|---|---|---|---|
| Desktop | ≥ 1024px | até 1120px (`max-w-6xl` − `px-4`) | 240px (`h-60`) | **1600 × 340** (retina **2240 × 480**) |
| Tablet | 640–1023px | até ~991px | 192px (`h-48`) | **1500 × 290** |
| Mobile | < 640px | até ~607px | 160px (`h-40`) | **1080 × 480** |

- **Proporções:** desktop **4,67:1** · mobile **2,25:1**.
- **A proporção varia com a largura do aparelho** (2,24:1 num phone de 390px → 3,79:1 num de 600px). Por isso o assunto essencial deve ficar no **centro vertical**.
- **Área segura:** título, subtítulo e botão ficam à **esquerda**, sobre o véu escuro. Assunto principal à **direita**.
- **Formato:** JPG (foto) ou WebP · **alvo ≤ 300 KB** · PNG só com transparência.

#### Sobre subir uma arte única em 22:9

**22:9 (2,44:1) não é nenhum dos dois slots.** Fica próximo do **mobile** (2,25:1) e **muito distante do desktop** (4,67:1).

| Uso | Efeito |
|---|---|
| Como `mobile_url` | ✅ funciona bem — 2,44 vs 2,25 deixa um corte vertical pequeno |
| Como `desktop_url` | ⚠️ **corta ~48% da altura** — o slot é quase 2× mais largo que a arte |

**Recomendação:** gerar em **21:9** e exportar **dois recortes** da mesma arte:
- `mobile_url`: **1080 × 480**
- `desktop_url`: **2240 × 480** (recorte central)

Se a ferramenta só gerar 16:9 (1,78:1): gerar **2240 × 1260** e recortar a **faixa central de 480px** — só ~38% da altura sobrevive, então o assunto tem de estar rigorosamente no centro.

**Duas estratégias de arte (ambas suportadas):**

| | Arte | Texto | Véu |
|---|---|---|---|
| **A (recomendada)** | imagem limpa | escrito pelo dado do banner (título/subtítulo/botão) | aplicado à esquerda para legibilidade |
| **B** | flyer pronto, com texto embutido | deixar `title`/`subtitle` **vazios** | **não** aplicado — a arte fica intacta |

O `VeuBanner` decide pelo conteúdo: sem imagem → superfície grafite · com imagem e texto → véu · com imagem e **sem** texto → sem véu.

#### O que o editor precisa mostrar (vira requisito do WIRE)

O editor **não pode ser um upload mudo**. Cada campo de imagem deve exibir:

1. A **dimensão recomendada** do slot (`desktop_url` → 1600 × 340 · `mobile_url` → 1080 × 480);
2. O aviso de **assunto centralizado na vertical** (a proporção é fluida);
3. Que **preencher só um** dos dois é válido — o outro usa o mesmo arquivo.

**Fora da v1:** validação automática de dimensão, recorte no navegador, conversão de formato.

---

## 3. O write hook — `use-atualizar-aparencia-loja.ts`

> ⚠️ **Este é o ponto mais perigoso do SPEC.** O JSON é compartilhado: sobrescrever inteiro apaga chaves que o editor não conhece (ex.: `hero.type`, `whatsapp_contact`).

```ts
type PatchAparencia = {
  appearance?: {
    hero?: Partial<{ type: string; autoplay: boolean; interval: number; banners: BannerLoja[] }>;
    theme?: Partial<TemaLoja>;
  };
  storeConfig?: Partial<StoreConfigLoja>;
};

// 1. LÊ o estado atual (nunca confia no que veio da tela)
const { data } = await supabase
  .from("me_empresa")
  .select("appearance, store_config")
  .eq("id", empresaId)
  .single();

// 2. MERGE em dois níveis — preserva chaves irmãs desconhecidas
const atual = (data?.appearance ?? {}) as Record<string, unknown>;
const novoAppearance = {
  ...atual,
  ...(patch.appearance ?? {}),
  hero:  patch.appearance?.hero  ? { ...(atual.hero  as object ?? {}), ...patch.appearance.hero  } : atual.hero,
  theme: patch.appearance?.theme ? { ...(atual.theme as object ?? {}), ...patch.appearance.theme } : atual.theme,
};

// 3. GRAVA (só o que mudou)
await supabase.from("me_empresa")
  .update({ appearance: novoAppearance, store_config: { ...(data?.store_config ?? {}), ...(patch.storeConfig ?? {}) } })
  .eq("id", empresaId);
```

**Contrato do retorno:** `{ salvar, loading, error, success }`.

**Regras invioláveis:**
1. **Nunca** `update` com o JSON vindo da tela — sempre ler → merge → gravar.
2. **Nunca** gravar `appearance` de outra empresa — o `empresaId` vem do `AuthContext`.
3. `banners` é **array substituído inteiro** (a tela é dona da ordem) — mas dentro do `hero`, então `type`/`autoplay`/`interval` sobrevivem.
4. Validar antes de gravar: `interval >= 2000`; `button_position` na lista; `link_type` na lista.
5. Erro de RLS/policy → mensagem clara, **não** silenciosa.

---

## 4. Modal compartilhado (D3)

**Movimento:** `src/app/components/estoque/ProdutoFormModal.tsx` → `src/app/components/produto/ProdutoFormModal.tsx`.

**Dependência a resolver:** `ProdutoFormModal.tsx:4` importa de `./estoqueMockData`:
```ts
import { formatCurrency, calcMargem, type Produto } from "./estoqueMockData";
```
Plano: mover o **tipo `Produto`** para `src/app/types/produto.ts` e manter `formatCurrency`/`calcMargem` onde estiverem (importar por caminho relativo novo). **Não** criar cópia — o tipo é contrato único.

**Chamadores a atualizar (5):**
`estoque/ProdutosPage.tsx:36` (import) + `:413`, `:424`, `:436` · `estoque/ProdutoDetalhePage.tsx:44` (import) + `:368`, `:381`.

**Novos campos no modal:**
| Campo | Passo | Destino | Nota |
|---|---|---|---|
| **"Mostrar na vitrine"** (toggle) | 1 (Informações) | `exibir_vitrine` | default = `true` |
| **"Preço promocional"** (ligar) | 2 (Preços) | `preco_varejo` | o input existe morto em `:449-462`; validação: **`> preco`** senão não faz sentido |
| **`unidade`** (já existe) | 1 | `unidade` | hoje coletada e perdida |

**Campos a remover:** "Localização no depósito" (`:494-503`) · "Fornecedor padrão" (`:504-515`).

---

## 5. Rotas

```tsx
// routes.tsx — dentro do AppLayout (área autenticada)
{ path: "/loja-virtual",                     lazy: ... "LojaVirtualHubPage" },
{ path: "/loja-virtual/aparencia",           lazy: ... "AparenciaPage" },
{ path: "/loja-virtual/produtos",            lazy: ... "ProdutosLojaPage" },
{ path: "/loja-virtual/categorias",          element: <Navigate to="/estoque/configuracoes" replace /> },
```

> **`/loja-virtual/categorias` redireciona** para o CRUD já existente (`PRD-CategoriasProduto.md` entregou). Não duplicar tela. Se o fundador quiser espelho próprio, vira item de backlog.

**Não mexer** nas rotas públicas `/loja/*` nem nas do `/marketplace` (o módulo apenas deixa de apontar para lá).

---

## 6. Estados obrigatórios (regra do projeto)

Toda tela/lista nova: **loading (skeleton) · vazio · erro + retry · sucesso.**

Específicos deste SPEC:
- **Aparência, sem `appearance`:** formulários em branco com os **defaults** visíveis + aviso de que a loja usa o **banner gerado** hoje.
- **Upload de imagem:** preview antes de salvar · erro de tipo/tamanho · remover imagem.
- **Salvar:** botão com estado `salvando` · toast de sucesso · erro visível (nunca silencioso).
- **Produtos, lista vazia:** CTA para o cadastro.
- **Banner com só um arquivo:** válido — o outro lado usa o mesmo.

---

## 7. Ordem de implementação sugerida (lanes)

| Lane | Escopo | Depende de |
|---|---|---|
| **L1** | Verificação de schema (§2.4) + migration de `unidade` se preciso | — |
| **L2** | Mover o modal + atualizar 5 chamadores + tipo `Produto` | L1 |
| **L3** | `exibir_vitrine` / `preco_varejo` / `unidade` nos 3 hooks + toggle/campo no modal | L2 |
| **L4** | `use-atualizar-aparencia-loja` (write com merge) | — (paralela) |
| **L5** | Rotas + `moduloRoutes` + `AppLayout` (label/path) | — (paralela) |
| **L6** | Telas do editor (hub, aparência, produtos) | L3, L4, L5 |

L4 e L5 podem rodar em paralelo com L1–L3 (sem sobreposição de arquivo).

---

## 8. Checklist de verificação

- [ ] Schema verificado; `column_default` de `exibir_vitrine` anotado
- [ ] `unidade`: migration aplicada **ou** coluna já existente confirmada
- [ ] `ProdutoFormModal` movido; **5 chamadores** compilando
- [ ] Tipo `Produto` em `types/produto.ts`; **sem** import de `estoqueMockData` no modal
- [ ] `exibir_vitrine` exposto em `use-produtos` e gravado em criar + atualizar
- [ ] Toggle "Mostrar na vitrine" desmarca → produto some de `/loja/:slug` (teste real)
- [ ] "Preço promocional" grava `preco_varejo`; selo "de/por" aparece quando maior
- [ ] `unidade` salva e volta no form
- [ ] Campos mortos removidos (localização, fornecedor)
- [ ] `use-atualizar-aparencia-loja`: **merge** preserva `hero.type` e `whatsapp_contact` (testar com o `appearance` da **Gráfica HQ**, que tem dados)
- [ ] Nunca lê/grava `appearance` de outra empresa
- [ ] `interval` mínimo 2000 respeitado; `link_type`/`button_position` validados
- [ ] Banner salvo aparece em `/loja/docee` no celular (desktop + mobile)
- [ ] Módulo abre em `/loja-virtual`; rail diz "Loja Virtual"
- [ ] Link da vitrine exibido no hub
- [ ] Vitrine pública, demo `/loja`, checkout e pedidos **não regridem**
- [ ] `npx tsc --noEmit` = **0 erros** · `npm run build` ✅ · Vercel `READY`
- [ ] `tracking/TRACKING.md` + `TRACKING_MODULOS.md` atualizados

---

## 9. Fora de escopo (registrado para não virar dívida silenciosa)

- **Cor de categoria na vitrine** — `me_categoria.cor` existe e é lida no Estoque, mas `LojaCategoriaBar` renderiza só `nome`.
- **Curadoria de "Destaques"** — hoje `!esgotado` ordenado por preço (`LojaPage.tsx:349-356`); exigiria coluna nova.
- **Assimetria `use-loja-produto.ts:53`** — a página do produto não lê `preco_varejo`/`categoria_id` nem filtra `exibir_vitrine`. **Bug real**, mas fora do caminho crítico deste PRD.
- **`store_config.whatsapp_contact`** — tipado (`types/loja.ts:8`) e nunca lido; o WhatsApp exibido vem de `me_empresa.telefone`.
- **Global de categoria** (`empresa_id IS NULL`) — segue somente-leitura.

---

## 10. Decisões sobre as lacunas levantadas no WIRE (22/09/2026)

O WIRE (`WIRE-LojaVirtual-CompletarModulo.md` §12) levantou 10 pontos que o SPEC não fechava. Resolução:

| # | Lacuna | **Decisão** |
|---|---|---|
| 1 | Confirmação ao remover banner | **Aceito** — dialog de confirmação, padrão do CRUD de categorias. |
| 2 | UX de reordenar | **Aceito** — setas ↑↓ (acessíveis, funcionam no toque) **e** drag. |
| 3 | **`text_color` não exposto** | **EXPOR.** Está no contrato (`use-loja-appearance.ts:30-56`) e é o que garante legibilidade do título sobre a imagem. Campo novo no form de banner, ao lado de `button_color`. Sem ele, banner novo nasce sem cor de texto e depende do fallback da vitrine. |
| 4 | Seletor de destino do clique | **Aceito** — `product` → select de produtos ativos · `external` → input URL · `category` → select de categorias · `grid` → oculto (é a âncora interna). |
| 5 | **Paleta: livre ou restrita ao `DESIGN.md`?** | **Livre, com os tokens do `DESIGN.md` como default.** Ver abaixo — **precisa de aval do fundador**. |
| 6 | `fontFamily` / `borderRadius` | **Aceito** — select de fontes · input numérico com sufixo `px`. |
| 7 | Salvar por página × por bloco | **Aceito: um único botão de página.** Coerente com o hook único de merge (D7); evita gravações parciais inconsistentes. |
| 8 | Conteúdo do hub | **Aceito** — 2 cards de contador (produtos na vitrine · banners) + card do link. |
| 9 | Posição do toggle "Mostrar na vitrine" | **Aceito** — seção própria "Vitrine" no passo 1, após Código de barras. |
| 10 | `column_default` de `exibir_vitrine` | ✅ **RESOLVIDO COM DADO REAL** — ver §2.4/§2.5. O default é **`false`**. |

### 10.1 A lacuna 5 precisa do fundador — é a única

A decisão consolidada diz que **`DESIGN.md` é a fonte oficial de paleta**. A pergunta é se isso se estende à **vitrine do parceiro**.

**Recomendação: paleta livre, com os tokens do `DESIGN.md` como default.**

Racional:
- Banner e tema são **marca do parceiro**, não identidade da UNIQ.
- **Evidência:** o `appearance` real da **Gráfica HQ** já usa `primary_color: #4f9ef3` e `secondary_color: #ff6600` — cores que **não existem** no `DESIGN.md`. Restringir a paleta **quebraria o que já está em produção**.
- A distinção que resolve: **`DESIGN.md` governa a UI do produto** (a Base UNIQ que a UNIQ opera) · **`appearance` governa a loja do parceiro** (a marca dele).

> ⚠️ **Confirmar com o fundador.** Se ele preferir paleta restrita, o SPEC muda (vira seletor de tokens, não color picker) e o `appearance` da HQ precisa ser revisto.
