# PRD — Loja Virtual: Completar o Módulo (editor de aparência + catálogo)

> **Sprint:** Loja Virtual / Módulos (continuação)
> **Status:** 🔶 Rascunho para aprovação do fundador
> **Pipeline:** Research ✅ (recon de 22/09/2026) → **PRD (este)** → SPEC → WIRE → Implementação
> **Origem:** `tracking/TRACKING_MODULOS.md` §7.1 e §8 — decisão do fundador de **completar o módulo `loja_virtual`**, não criar módulo novo.
> **Antecessor direto:** `PRD-LojaVirtual-VitrineModerna.md` — o **V4 (editor de aparência) foi adiado lá** e é o corpo deste PRD.

---

## 1. WHY — por que isso importa

O fundador descreveu o modelo mental dos dois módulos:

| Módulo | Responsabilidade |
|---|---|
| **Loja / Vitrine** | **Aparência** — onde fica o banner, formato do menu, quantos itens por linha |
| **Estoque** | **Quantidades** — entradas, saídas, movimentações |

**O módulo "Loja Virtual" existe no catálogo, mas não faz o que o nome promete.** Hoje ele aponta para `/marketplace` (um marketplace multi-lojista de outra ideia) e **não tem nenhuma tela de configuração da própria loja**. A vitrine do parceiro (`/loja/:slug`) já lê a aparência — mas **nada no app escreve nela**.

**Consequência concreta:** para a Doceê trocar o banner da loja dela, hoje é preciso **subir arquivo no bucket e escrever JSON à mão** em `me_empresa.appearance.hero.banners[]` (`SPEC-LojaVirtual-VitrineModerna.md:200`). Não existe tela.

**Além disso**, o recon de 22/09/2026 encontrou dois defeitos funcionais que este PRD precisa fechar porque tocam o mesmo caminho:

- **`exibir_vitrine` está desconectado** — a coluna existe e a vitrine filtra por ela, mas **nada a escreve** (nem o modal, nem os hooks de criar/atualizar). Um produto cadastrado pode não aparecer na vitrine e não há como controlar isso pela interface.
- **`preco_varejo` não tem porta de entrada** — o modal tem um campo "Preço promocional" **morto** (sem `value`/`onChange`/persistência), enquanto a vitrine **já sabe renderizar o selo "de/por"** quando `preco_varejo > preco`. A ligação existe de um lado só.

**A tese:** o módulo precisa ficar **completo e coerente** — quem configura a loja configura no módulo Loja; quem controla quantidade controla no Estoque; e o cadastro de produto é **um só**, compartilhado.

---

## 2. Diagnóstico — o que existe hoje (evidências)

### 2.1 O consumidor existe; o editor não

| Peça | Estado | Evidência |
|---|---|---|
| Vitrine lê `appearance` | ✅ **existe** | `use-loja-tenant.ts:44` · `use-loja-appearance.ts` |
| Banner renderiza | ✅ **existe** | `LojaBannerCarousel.tsx:66` (banners/autoplay/interval) |
| Tema por loja | ✅ **existe** | `use-loja-appearance.ts:107` (`TEMA_PADRAO` + override) |
| Categorias na vitrine | ✅ **existe** | `use-loja-categorias.ts` · `LojaCategoriaBar.tsx` |
| **Escrita em `appearance`** | ❌ **ZERO** | grep em `src/` **e** em migrations `.sql` = nenhum `update`/`insert` |
| **Escrita em `store_config`** | ❌ **ZERO** | idem |
| **Tela de aparência** | ❌ **NÃO EXISTE** | nenhuma rota, componente ou hook |

> O único write em `me_empresa` hoje é `EmpresaPage.tsx:173-181` — e grava apenas `nome_fantasia, cnpj, telefone, email`.

### 2.2 O contrato de dados já está pronto (e é rico)

`me_empresa.appearance` (jsonb) — lido em `use-loja-tenant.ts:44`, tipado em `types/loja.ts:13-43`:

```jsonc
{
  "theme": { "fontFamily": "Poppins", "borderRadius": "8px",
             "primaryColor": "#86cb92", "secondaryColor": "#1f2937" },
  "hero": {
    "type": "carousel", "autoplay": true, "interval": 5000,
    "banners": [{
      "id": "banner-...", "title": "...", "subtitle": "...",
      "desktop_url": "https://...", "mobile_url": "https://...",
      "button_text": "Ver mais", "button_color": "#00ccf5",
      "text_color": "#001933", "button_position": "bottom-left",
      "link_type": "product", "link_value": "#"
    }]
  }
}
```

`me_empresa.store_config` (jsonb) — lido no mesmo hook (`types/loja.ts:4-10`):

```jsonc
{ "slogan": "...", "description": "...", "ramoAtuacao": "...", "whatsapp_contact": "..." }
```

**Divisão de papéis:** `appearance` = visual do topo (hero/banners/tema) · `store_config` = texto da identidade (slogan/descrição). Ambos em `me_empresa` — **o editor pode tratá-los como um único fluxo de gravação**.

**`link_type`** aceito pelo carrossel (`LojaBannerCarousel.tsx:104-123`): `product` · `external` · `category` · `grid`. **`button_position`**: `bottom-left` · `bottom-right`.

**Fallbacks que o editor deve respeitar:** `TEMA_PADRAO` (`use-loja-appearance.ts:5-10`) = verde menta `#86cb92` · grafite `#1f2937` · radius `8px` · Poppins. Banner vazio → **banner gerado** do próprio tenant (`use-loja-appearance.ts:65-86`), nunca de outra loja. Intervalo mínimo 2000ms (`:116`).

### 2.3 `exibir_vitrine` — a coluna órfã

| Onde | Estado |
|---|---|
| Filtro da vitrine | ✅ `.eq("exibir_vitrine", true)` — `use-loja-produtos.ts:68-74` |
| `ProdutoFormModal` | ❌ **sem toggle** |
| `use-criar-produto.ts:44-65` | ❌ **não grava** a coluna |
| `use-atualizar-produto.ts:49-67` | ❌ **não grava** a coluna |
| `use-produtos.ts` (retorno) | ❌ **não expõe** — está na interface DB (`:29`) mas não no mapper |

**Resultado — verificado no banco oficial (22/09/2026):** o `column_default` de `exibir_vitrine` é **`false`**. Ou seja: **todo produto cadastrado pela interface nasce invisível na vitrine**, e não há UI para corrigir.

**Estado real hoje:** a Doceê tem **16 produtos com `exibir_vitrine = true`** — configurados **por fora do app**. Ela **não está quebrada**. Os 3 produtos `ativo = true` e invisíveis são da **Loja Teste01** e **UNIQ Empresas**, não dela.

> **A distinção que importa:** não é um bug *ativo*, é um bug **latente com disparo garantido** — ele aparece no **próximo** produto que a Doceê cadastrar pela interface. Entre "funciona hoje" e "funciona amanhã". Detalhe completo no SPEC §2.4/§2.5.

### 2.4 Campos mortos no `ProdutoFormModal` (585 linhas)

| Campo | Linha | Problema | Destino proposto |
|---|---|---|---|
| **"Preço promocional"** | `449-462` | input **morto** — sem `value`/`onChange`/persistência | **ligar em `preco_varejo`** (a vitrine já renderiza o selo — `use-loja-produtos.ts:35-38`) |
| **`unidade`** | `41`, `303-316` | coletada no form, **nunca enviada** ao criar/atualizar → **valor perdido** | persistir (ver D5) |
| **"Localização no depósito"** | `494-503` | morto | **remover** (YAGNI) |
| **"Fornecedor padrão"** | `504-515` | select morto com opções hardcoded | **remover** (YAGNI) |

### 2.5 O cadastro de categoria já foi corrigido (fora de escopo)

`PRD-CategoriasProduto.md` (o "V2" do VitrineModerna) já resolveu: `ProdutoFormModal` grava **`categoria_id` real**, existe `use-categorias.ts` com CRUD completo, e `me_categoria.cor` foi adicionada por migration. **Não refazer.**

> ⚠️ **Achado correlato:** `me_categoria.cor` existe e é lida no Estoque (`use-categorias.ts`), mas a **barra da vitrine renderiza só `nome`** (`LojaCategoriaBar.tsx`) — a cor não chega lá. Fora do escopo deste PRD; registrar como backlog.

### 2.6 A rota do módulo aponta para o lugar errado

| Peça | Valor |
|---|---|
| `lib/moduloRoutes.ts:9` | `loja_virtual: '/marketplace'` |
| `AppLayout.tsx:69` | `{ id: "loja", label: "Marketplace", path: "/marketplace", moduloCodigo: "loja_virtual" }` |

O módulo leva o parceiro ao **marketplace multi-lojista** (`MarketplacePage` → "Lista todos os lojistas", `LojistaGrid`, `VendedorDashboardPage`), não à loja dele.

---

## 3. Objetivo

**Completar o módulo `loja_virtual`** para que ele seja o lugar onde o parceiro configura e alimenta a própria loja:

1. **Editor de aparência** — banner (upload, título, subtítulo, botão, cor, posição, destino do clique), tema (4 chaves) e identidade (`store_config`: slogan/descrição).
2. **Controle de vitrine no produto** — `exibir_vitrine` ligado de ponta a ponta, dentro do modal compartilhado.
3. **"Preço promocional" funcional** — ligado a `preco_varejo` (destrava o selo "de/por" que a vitrine já sabe desenhar).
4. **Cadastro de produtos no módulo** — com o **mesmo modal** do Estoque (um único formulário).
5. **Rota do módulo corrigida** — sai de `/marketplace`.
6. **"Cardápio" como label vertical** — sem renomear o módulo default.

### Não-objetivos (v1)

- **Não** redesenhar a vitrine pública (`/loja/:slug`) — ela já funciona e atende cliente real.
- **Não** mexer no `marketplace/` multi-lojista além de **tirar o `loja_virtual` do caminho dele**.
- **Não** refazer o CRUD de categorias (`PRD-CategoriasProduto.md` já entregou).
- **Não** criar editor de "Destaques" curado — hoje é `!esgotado` ordenado por preço (`LojaPage.tsx:349-356`); curadoria exigiria coluna nova.
- **Não** implementar cor de categoria na vitrine (backlog, §2.5).
- **Não** criar gateway de pagamento, frete ou cupom.
- **Não** migrar para Next.js.
- **Não** editar global (`me_categoria.empresa_id IS NULL`) — segue somente-leitura.

---

## 4. Decisões (propostas — confirmar com o fundador)

| # | Decisão | Proposta | Por quê |
|---|---|---|---|
| **D1** | **Onde mora o editor** | **No módulo `loja_virtual`**, rota nova `/loja-virtual` com sub-rotas (aparência · produtos · categorias). **Não** em `/configuracoes/empresa` (que era a proposta do V4 original). | O fundador definiu o módulo como dono da aparência. Manter junto do catálogo evita config espalhada. |
| **D2** | **Rota final do módulo** | `moduloRoutes.loja_virtual` → **`/loja-virtual`**; item do rail (`AppLayout.tsx:69`) renomeado de "Marketplace" para **"Loja Virtual"**. | Hoje aponta para o marketplace multi-lojista — lugar errado. |
| **D3** | **Um único modal de produto** | Mover `ProdutoFormModal` de `components/estoque/` para **`components/produto/`** e ajustar os **5 chamadores**. O módulo Loja abre o mesmo componente. | Decisão do fundador: *"independente da página ou do módulo, todos chamam o mesmo modal"*. Sem dois formulários, sem divergência. |
| **D4** | **`exibir_vitrine` ligado ponta a ponta** | Toggle **"Mostrar na vitrine"** no modal + gravação em `use-criar-produto`/`use-atualizar-produto` + exposição em `use-produtos`. | É o controle que falta para o parceiro decidir o que aparece na loja. Sem isso, "cadastrei e não apareceu" é inexplicável. |
| **D5** | **`unidade`** | **Persistir.** Se não houver coluna em `me_produto`, decidir no SPEC entre **migration aditiva** (`unidade text`) ou **`opcoes_config`**. Recomendação: migration (é atributo de 1º nível, a vitrine pode exibir). | Hoje o valor é coletado e **perdido** — bug silencioso. |
| **D6** | **Campos mortos** | **"Preço promocional" → ligar em `preco_varejo`.** **"Localização no depósito" e "Fornecedor padrão" → remover.** | `preco_varejo` já tem consumidor pronto (selo de desconto). Os outros dois não têm destino nem demanda. |
| **D7** | **Escrita da aparência** | Um único fluxo de gravação em `me_empresa` cobrindo `appearance` + `store_config`. Sempre **merge** (nunca sobrescrever o JSON inteiro). | Evita perder chaves que o editor não conhece. |
| **D8** | **Upload de imagem** | Reusar o padrão do bucket público **`uniq_me_produtos`** (o mesmo do upload de foto de produto). | Zero infra nova; já validado em produção (`SPEC-LojaVirtual-VitrineModerna.md:187`). |
| **D9** | **Fallback de banner** | Quando `banners[]` estiver vazio, **manter o banner gerado** atual (`use-loja-appearance.ts:65-86`). O editor **não** substitui o fallback — ele só preenche quando o parceiro quiser. | O fallback é o que faz a loja da Doceê parecer decente hoje. |
| **D10** | **"Cardápio"** | **Label vertical** exibido para negócios de comida. O módulo default continua `loja_virtual` / "Loja Virtual". | Regra `CRM` → `CRM_OTICA` (`CONTEXTO_PROJETO.md:194`). "Cardápio" falharia na Gráfica HQ. |

---

## 5. Escopo estrutural

### 5.1 Módulo Loja Virtual (novo)

```
/loja-virtual                    → hub: atalhos + estado da loja + link da vitrine
/loja-virtual/aparencia          → EDITOR (banner · tema · identidade)
/loja-virtual/produtos           → lista de produtos (abre o modal compartilhado)
/loja-virtual/categorias         → atalho/espelho do CRUD já existente
```

**Link da vitrine:** exibir a URL pública (`/loja/:slug`) com botão de copiar/abrir — hoje o parceiro não tem onde descobrir o endereço da própria loja.

### 5.2 Editor de aparência — blocos

1. **Banners** — lista ordenável; por banner: upload **desktop** + **mobile** (um só é válido), título, subtítulo, texto/cor do botão, posição do botão, e **destino do clique** (`product`/`external`/`category`/`grid`). Adicionar · editar · remover · reordenar.
2. **Carrossel** — autoplay (on/off) + intervalo (mínimo 2000ms).
3. **Tema** — as **4 chaves**: `primaryColor`, `secondaryColor`, `borderRadius`, `fontFamily`.
4. **Identidade** — `store_config`: slogan, descrição (+ `ramoAtuacao`).

**Estados obrigatórios em cada bloco:** loading (skeleton) · vazio · erro + retry · sucesso. Salvamento com feedback explícito.

### 5.3 Produtos no módulo

Lista + o **mesmo** `ProdutoFormModal`, agora com o toggle **"Mostrar na vitrine"** e o **"Preço promocional"** funcional.

---

## 6. Critérios de aceite

- [ ] A Doceê consegue **trocar o banner** da loja dela **sem SQL e sem tocar no bucket**.
- [ ] O banner salvo aparece em `/loja/docee` no celular (desktop e mobile corretos).
- [ ] **Nunca** aparece banner de outra empresa — com ou sem `appearance` preenchido.
- [ ] Tema (4 chaves) e identidade (slogan/descrição) salvam e refletem na vitrine.
- [ ] **Gravação é merge** — chaves desconhecidas do JSON **não são perdidas** ao salvar.
- [ ] Toggle **"Mostrar na vitrine"** funciona: desmarcado, o produto **some** de `/loja/:slug`; marcado, aparece.
- [ ] **"Preço promocional"** grava em `preco_varejo` e o selo "de/por" aparece quando for maior que `preco`.
- [ ] `unidade` **deixa de ser perdida** — salva e volta no formulário.
- [ ] Módulo abre em **`/loja-virtual`** e o rail diz **"Loja Virtual"** (não "Marketplace").
- [ ] O **mesmo modal** é usado pelo Estoque e pela Loja — nenhuma duplicata de formulário.
- [ ] Vitrine pública, demo `/loja`, checkout e pedidos **não regridem**.
- [ ] Isolamento por `empresa_id` preservado em todas as escritas novas.
- [ ] `npx tsc --noEmit` = **0 erros** (gate congelado em 22/09/2026) · `npm run build` ✅ · deploy Vercel `READY` · validado pelo fundador no celular.
- [ ] Checklist do SPEC 100% verificado; `tracking/TRACKING.md` atualizado.

---

## 7. Riscos

| Risco | Mitigação |
|---|---|
| **Perda de dados**: sobrescrever `appearance` inteiro apaga chaves que o editor não conhece (ex.: `hero.type`) | **D7**: merge obrigatório, nunca replace do JSON. Testar com o `appearance` real da Gráfica HQ (que tem dados). |
| **Banner de outro tenant** aparecendo | O hook já garante fallback do próprio tenant (`use-loja-appearance.ts:133`). O editor **não** pode introduzir leitura cruzada. Cobrir no teste. |
| **`exibir_vitrine` default no banco** desconhecido → produto novo pode nascer invisível | Verificar o default real no Supabase **antes** de implementar; se for `false`, incluir no cadastro com default `true` explícito. |
| **Migration de `unidade`** | Aditiva e nullable — não quebra nada. Se o fundador preferir zero migration, cair para `opcoes_config`. |
| **Escopo virar CMS** | Já delimitado: 1 banner-list + 4 chaves de tema + 2 textos. Sem páginas, sem blocos livres, sem editor visual. |
| **Mover o modal** quebra 5 chamadores | Movimento mecânico + `tsc`/build a cada passo. O import `./estoqueMockData` precisa de destino (tipo `Produto` + `formatCurrency`/`calcMargem`). |
| **RLS/P5** | Escrita nova em `me_empresa` com anon key é superfície adicional. A pendência P5 já existe e não piora, mas **não** introduzir write sem checar a policy vigente. |

---

## 8. Documentos irmãos

- **SPEC:** `tracking/specs/SPEC-LojaVirtual-CompletarModulo.md`
- **WIRE:** `tracking/wireframe/WIRE-LojaVirtual-CompletarModulo.md`
- **Antecessores:** `PRD-LojaVirtual-VitrineModerna.md` (V4 adiado) · `PRD-CategoriasProduto.md` (V2 entregue) · `PRD-LojaVirtual-DoceE.md`
- **Diagnóstico de módulos:** `tracking/TRACKING_MODULOS.md` §5, §7.1, §8
