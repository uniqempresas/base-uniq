# PRD — Loja Virtual: Vitrine Moderna (visão do cliente final)

> **Sprint:** Loja Virtual (continuação de 16/09/2026)
> **Status:** 🔶 Rascunho para aprovação do fundador
> **Pipeline:** Research ✅ → **PRD (este)** → SPEC → WIRE → Implementação
> **Referência estrutural:** print do app Mercado Livre (mobile) — estrutura, **não** cores
> **Fonte visual:** `DESIGN.md` (raiz) — grafite `#1f2937`, verde menta `#86cb92`, cinzas, Poppins, radius 8px

---

## 1. WHY — por que isso importa

A vitrine multi-tenant da Doceê (`/loja/docee`) é hoje a **versão pobre** da loja. O cliente final entra, vê uma grade de quadrados com nome e preço — e mais nada. Sem navegação por categoria, sem banner, sem área do cliente no topo, busca escondida abaixo da dobra, carrinho só acessível por uma barra no rodapé.

Ironicamente, a **vitrine de demonstração** (`/loja`, sem slug) já tem estrutura melhor: busca inline no header, barra de categorias, banner hero, seção horizontal de destaques. Mas tudo isso é **mock hardcoded** ("Studio da Maria", imagem do Unsplash, categorias de cosméticos) e não serve nenhum cliente real.

**A tese:** a loja é o canal de venda de 3º canal (além de balcão e WhatsApp) e é a primeira impressão digital que o cliente da Doceê tem da UNIQ. Uma vitrine que parece amadora desvaloriza a consultoria inteira. A meta é **estrutura de marketplace, cara de Doceê** — o cliente reconhece o padrão de navegação que já usa no Mercado Livre e no iFood, sem que a loja deixe de parecer a Doceê.

**Restrição explícita do fundador:** *"não em cores, mas em questão de estrutura"*. Verde menta e grafite permanecem. O que se copia do ML é o **esqueleto**: hierarquia do topo, busca, categorias, carrossel.

---

## 2. Diagnóstico — o que existe hoje (evidências)

### 2.1 Duas vitrines, uma boa e uma real

| | Vitrine **demo** `/loja` | Vitrine **tenant** `/loja/:slug` |
|---|---|---|
| Arquivo | `LojaPage.tsx:432–720` | `LojaPage.tsx:263–429` |
| Dados | `PRODUTOS_LOJA` (mock) | `me_produto` real (Supabase) |
| Header | sticky, logo + **busca inline** + **carrinho com badge** | logo + nome + botão Entrar/Meus pedidos |
| Busca | dentro do header (1 linha) | **linha separada abaixo** do header |
| Categorias | ✅ barra horizontal (mock cosméticos) | ❌ **não existe** |
| Banner | ✅ hero (Unsplash hardcoded) | ❌ **não existe** |
| Seção horizontal | ✅ "⭐ Destaques" (scroll lateral) | ❌ **não existe** |
| Carrinho no header | ✅ com contador | ❌ só barra fixa no rodapé |
| Container | `max-w-6xl` | `max-w-3xl` |
| Grid | 2 → 3 → 4 colunas | 2 → 3 colunas |

**Conclusão:** o tenant — que é o único que atende cliente real — é a metade inferior da tabela.

### 2.2 O banner que o fundador quer **já existe como contrato de dados**

`me_empresa.appearance` (jsonb) já tem o modelo de hero completo, populado em **2 das 4 empresas**:

```jsonc
// Gráfica HQ e UNIQ Empresas — appearance real
{
  "hero": {
    "type": "carousel",
    "autoplay": true,
    "interval": 5000,
    "banners": [{
      "id": "banner-1772635102414",
      "title": " ", "subtitle": "10% De desconto na primeira compta",
      "mobile_url":  "https://.../uniq_me_produtos/store-assets/....png",
      "desktop_url": "https://.../uniq_me_produtos/store-assets/....png",
      "link_type": "product", "link_value": "#",
      "button_text": "Ver mais", "button_color": "#00ccf5", "button_position": "bottom-left",
      "text_color": "#001933"
    }]
  },
  "theme": { "font_family": "Plus Jakarta Sans", "border_radius": "1rem",
             "primary_color": "#4f9ef3", "secondary_color": "#ff6600" }
}
```

**A Doceê tem `appearance = {}`** — vazio. E a vitrine **não lê `appearance` em lugar nenhum**.

> ⚠️ **Nenhuma tela do app lê ou escreve `appearance` nem `store_config`** (grep em `src/app`: 0 ocorrências reais). Os dados da HQ/UNIQ foram gravados por fora. Ou seja: **o consumidor não existe e o editor não existe.**

### 2.3 Categorias: existem, estão certas para a Doceê, e estão desligadas

`me_categoria` é um catálogo real com escopo global + por empresa (`id_categoria`, `empresa_id` nullable, `nome_categoria`):

| id | empresa | nome |
|---|---|---|
| 1 | **global** | Geral |
| 4 | **global** | **Pães e Doces** |
| 5 | **global** | **Bebidas** |
| 13 / 16 | UNIQ | Vestuário / Consultoria |
| 33–37 | HQ Gráfica | Produtos · Serviços · PAPELARIA · ADESIVOS · BANNERS E FAIXAS |

`me_produto.categoria_id` (integer) é FK para ela. Existe também `me_subcategoria`.

**O problema:** os 16 produtos da Doceê estão **todos com `categoria_id = null` e `tipo = 'Outros'`**. A categoria global **"Pães e Doces" (id 4) já existe e serve perfeitamente** — só não está atribuída a nenhum produto.

Produtos reais da Doceê (16): Cone Trufado (Beijinho, Brigadeiro, Limão, Maracujá, Ninho c/ Nutella) R$ 7 · Trufa (Beijinho, Brigadeiro, Limão, Maracujá, Ninho c/ Nutella) R$ 5 · Tortinha (Chocolate, Limão, Oreo) R$ 7 · Surpresa de Morango / de Uva R$ 8 · Morango Cravejado R$ 10.

### 2.4 Buraco no cadastro de produto

`ProdutoFormModal.tsx:10` monta a lista de categorias **a partir do mock** (`PRODUTOS`, do `estoqueMockData`), e `use-criar-produto.ts:49` grava a escolha em **`tipo`** (`tipo: params.categoria || "Outros"`), **não em `categoria_id`**.

Resultado: a esposa do fundador escolhe "Roupas"/"Cosméticos" de uma lista fictícia, e o valor vai parar num campo de texto que ninguém lê. **É a origem do "Outros" em massa.** Sem corrigir isso, a barra de categorias nasce morta.

### 2.5 Semântica de desconto não resolvida

`preco_varejo` existe, mas **é `null` em todos os 16 produtos da Doceê**. A vitrine usa `preco` como preço de venda. **Não há "de/por" real hoje** — logo, o selo `-52%` do ML não pode ser inventado; ele só aparece quando houver dado.

---

## 3. Objetivo

Transformar a vitrine do tenant (`/loja/:slug`) na estrutura de um marketplace mobile-first, com **dados reais**:

1. **Área do cliente no topo** — identificação/sessão visível e permanente no header.
2. **Barra de busca** no header, na mesma linha da identidade da loja.
3. **Categorias de produto** navegáveis, horizontais, vindas do banco.
4. **Banner rotativo** (scroll horizontal/autoplay) por loja.
5. **Seções horizontais** (destaques/ofertas) antes da grade — a "vitrine dentro da vitrine".
6. **Carrinho sempre visível** no header, com contador.

E — não menos importante — **fechar o ciclo do cadastro**: categoria real no produto, banner real por loja.

### Não-objetivos (v1)

- **Não** redesenhar checkout, `ProdutoLojaPage` ou `ContaClientePage` (entram só se a estrutura exigir, ver V5).
- **Não** mudar a identidade visual do `DESIGN.md` (paleta, tipografia).
- **Não** implementar gateway de pagamento, frete calculado ou cupons.
- **Não** criar "marketplace" (a vitrine é mono-tenant; `/marketplace` é outro módulo).
- **Não** migrar para Next.js.

---

## 4. Decisões (propostas — confirmar com o fundador)

| # | Decisão | Proposta | Por quê |
|---|---|---|---|
| **V1** | Origem das categorias | Ler **`me_categoria` real** (global `empresa_id IS NULL` + da empresa), exibindo só as que têm produto na vitrine. Atribuir `categoria_id` aos 16 produtos da Doceê. | A categoria certa já existe ("Pães e Doces"). Sem atribuir, a barra mostra 1 balde "Outros". |
| **V2** | Correção do cadastro de produto | `ProdutoFormModal` passa a escolher **categoria real** (`categoria_id` via select de `me_categoria`) em vez de texto livre que ia para `tipo`. | Sem isso, toda categoria nova nasce errada e a barra fica desatualizada. |
| **V3** | Origem do banner | Ler **`me_empresa.appearance.hero`** (contrato já existente). Se vazio → **banner gerado** com nome + slogan + logo do tenant (nunca banner de outra loja, nunca placeholder quebrado). | Zero migration. A Doceê só precisa ganhar conteúdo. |
| **V4** | Editor de banner/tema no admin | **Fora da v1.** v1 = consumir. Editor entra depois em `/configuracoes/empresa`. *(Escopo maior: upload de 2 imagens por banner, ordem, autoplay, cor.)* | Não inflar a v1; a Doceê precisa da vitrine funcionando, não de um CMS. |
| **V5** | Escopo das telas | **v1 = vitrine do tenant** (`/loja/:slug`) + o bloco de área do cliente no header. Produto e Conta entram num segundo passo, se aprovado. | É exatamente o que o fundador descreveu. |
| **V6** | Selo de desconto | **Degradar com elegância**: só exibe `-X%` quando existir preço "de" real. Sem dado → sem selo. **Não** inventar desconto. | `preco_varejo` está null na Doceê; selo fake é promessa falsa ao cliente. |
| **V7** | Tema por loja (`appearance.theme`) | Ler cor primária/raio **por tenant** quando existir; **default = tokens do `DESIGN.md`** (verde menta/grafite). | O schema prevê; a Doceê (vazia) cai no default UNIQ. |

---

## 5. Escopo estrutural (o que muda na tela)

Ordem de cima para baixo, como no marketplace de referência:

1. **Barra de identidade + cliente** — logo, nome da loja, **Entrar / Meus pedidos** (sessão), carrinho com contador.
2. **Barra de busca** — inline com o topo, à vista sem rolar.
3. **Categorias** — trilha horizontal com scroll, "Tudo" + categorias com produto.
4. **Banner rotativo** — carrossel horizontal, autoplay, 1–N banners, alvo de toque cheio.
5. **Seção horizontal "Destaques"** *(scroll lateral, cards compactos)* — condicional a haver destaque.
6. **Grade principal** — 2 → 3 → 4 colunas, card com foto, nome, preço e ação.
7. **Barra fixa da sacola** (mantida) — sem conflitar com o carrinho do header.

Estados obrigatórios em cada bloco novo: **loading (skeleton), vazio, erro, sucesso**. Banco vazio → mock com aviso (regra mock-first já vigente).

---

## 6. Critérios de aceite

- [ ] Em `/loja/docee` no celular, a **busca e as categorias aparecem sem rolar** a tela.
- [ ] O **botão de sessão** (Entrar ↔ Meus pedidos) permanece visível e correto nos dois estados.
- [ ] **Categorias são reais**: filtram de fato os 16 produtos; sem categoria órfã; "Outros" não aparece para a Doceê.
- [ ] **Banner rotativo** renderiza com `appearance` preenchido e cai no banner gerado quando vazio — **nunca** banner de outra empresa.
- [ ] Nenhum produto de outra empresa aparece (isolamento por `empresa_id` preservado).
- [ ] **Nada de desconto inventado**; selo só com dado real.
- [ ] Vitrine demo (`/loja`) e demais telas **não regridem**.
- [ ] `npm run build` ✅ · deploy Vercel `READY` · validado pelo fundador no celular.
- [ ] Checklist do SPEC 100% verificado; `tracking/TRACKING.md` atualizado.

---

## 7. Riscos

| Risco | Mitigação |
|---|---|
| **Dado**: categorias não atribuídas → barra inútil | V1/V2: atribuir `categoria_id` + corrigir o form. É pré-requisito, não opcional. |
| **Dado**: `appearance` da Doceê vazio → banner em branco | V3: banner gerado do tenant como fallback obrigatório. |
| **Visual**: "parecer ML" virar cópia genérica e perder a Doceê | WIRE com tokens do `DESIGN.md`; estrutura sim, cores não (restrição do fundador). |
| **Escopo**: virar um CMS de loja | V4: editor fora da v1. |
| **Regressão**: a vitrine funciona hoje e atende cliente real | Mudança incremental; demo `/loja` intocada; build + Vercel a cada commit. |
| **RLS/P5**: vitrine pública lê com anon key | Já é pendência conhecida (P5); não piora, mas o endurecimento segue obrigatório antes de cliente real. |

---

## 8. Documentos irmãos

- **SPEC:** `tracking/specs/SPEC-LojaVirtual-VitrineModerna.md`
- **WIRE:** `tracking/wireframe/WIRE-LojaVirtual-VitrineModerna.md`
- **Antecessores:** `PRD-LojaVirtual-DoceE.md` · `PRD-LojaVirtual-AreaCliente.md` · `PRD-ImagemProduto.md`
