# PRD — Imagem de Produto (upload + exibição)

> **Origem:** uso real na Doceê — a esposa cadastra/chama produtos e a vitrine (`/loja/:slug`) vende; sem foto, o produto vira um "placeholder de caixa" que não comunica o que é. A pedido do fundador, a foto do produto deve viver no **Supabase Storage** (não em URL externa arbitrária).
> **Contexto técnico:** o pipeline de dados já está todo pronto — a coluna `me_produto.foto_url` existe, o bucket público `uniq_me_produtos` existe, os hooks de leitura/escrita de produto já mapeiam `foto_url`/`fotoUrl`. **Falta apenas:** (a) o upload real para o Storage e (b) o campo de foto na UI do produto.

---

## 1. Objetivo

Permitir anexar **uma foto por produto** no cadastro/edição de produtos da Base UNIQ, com a imagem salva no **Supabase Storage** (bucket `uniq_me_produtos`) e a URL pública persistida em `me_produto.foto_url`. A foto passa a aparecer no grid de produtos, no detalhe do produto e, onde já existe mapeamento, na vitrine da loja e nos pedidos.

> **Por que importa:** vitrine e catálogo sem foto não vendem alimento/doçaria (Doceê). É também o item de catálogo que a esposa espera ao operar o estoque — e o `ProdutoFormModal` já coleta tudo de um produto, menos a foto.

## 2. Problema

1. **Não existe upload real** — nenhum `supabase.storage` é chamado no app (o único preview de foto é mock, com comentário "em produção faria upload para storage").
2. **O modal de produto não tem campo de foto** — `ProdutoFormModal.tsx` coleta nome/SKU/categoria/preços/estoque/tags/descrição, mas não há como anexar imagem ao cadastrar ou editar.
3. **Grid e detalhe ignoram `foto`** — `ProdutoGridCard` renderiza placeholder `Package` mesmo quando o produto tem `foto` (o tipo `Produto` já carrega `foto?: string` do banco); o cabeçalho do detalhe também não mostra a imagem.
4. **Vitrine espera a foto** — `LojaPage`/`ProdutoLojaPage` já exibem `produto.fotoUrl`, mas como nenhum produto tem `foto_url` preenchido (nunca houve upload), toda a loja mostra placeholder.

## 3. Solução

**Princípio:** foto é dado do produto como qualquer outro — coletada no `ProdutoFormModal`, enviada ao Storage no momento de salvar, e a URL pública gravada em `me_produto.foto_url` pelos hooks de escrita existentes (sem mudança de assinatura).

| Camada | Responsabilidade |
|---|---|
| **`ProdutoFormModal`** | Nova seção "Foto do produto" (step 1): preview (existente/selecionada), botão enviar (`input file`), botão remover; valida tipo `image/*` e tamanho ≤ 5 MB; no salvar, faz upload e inclui `fotoUrl` no hook |
| **Novo helper/hook de storage** | `uploadFotoProduto(file)` → `supabase.storage.from("uniq_me_produtos").upload(path, file)` + `getPublicUrl()`; path `{empresaId}/{uuid}.{ext}` (organização por tenant + UUID evita colisão e cache) |
| **Hooks de escrita** | Já aceitam `fotoUrl` — nenhuma mudança |
| **Grid/detalhe** | Exibir `produto.foto` quando existir (fallback para o placeholder atual) |
| **Vitrine/pedidos** | Já leem `fotoUrl`/`foto` — passam a exibir foto real assim que houver |

Regras:
1. **Upload acontece no salvar** — o usuário seleciona (preview instantâneo em memória), e o arquivo é enviado ao Storage dentro do `handleSave`. Falhou o upload → produto **não** salva (erro inline no modal). Sem imagem órfã: nunca sobe arquivo sem o produto ser salvo.
2. **Remover foto** — botão limpa a imagem: no modo editar, envia `fotoUrl: ""` (o hook grava `foto_url = ""`; o mapper lê `|| undefined` → placeholder).
3. **Sem inventar API** — só `supabase.storage` (client já autenticado via sessão) + hooks existentes. Nenhuma migration de banco/RLS (políticas do bucket já permitem upload `authenticated` e leitura `publica`).
4. **Fallback mock intacto** — sem foto ou modo demo, placeholder `Package` atual permanece; nunca tela quebrada.

## 4. Escopo

### ✅ Dentro da v1
- Upload de foto no `ProdutoFormModal` (novo, editar e duplicar) → `uniq_me_produtos` → `foto_url`.
- Exibição da foto no grid card e no cabeçalho do detalhe do produto (fallback placeholder).
- Validação no cliente: `accept="image/*"`, tamanho máx 5 MB, erro inline legível.
- Estados do botão: salvando (upload + create/update) com spinner e desabilitado.
- Persistência: `fotoUrl` nos params dos hooks existentes (sem alterar suas assinaturas).

### ❌ Fora de escopo (v1)
- **Várias fotos/área de fotos** (a vitrine em `ProdutoLojaPage` tem galeria `imagens` — mock; v1 grava 1 foto por produto em `foto_url`; galeria multi-foto fica para backlog).
- Redimensionamento/compressão de imagem no cliente.
- Remoção do objeto no Storage ao trocar/remover (v1 apenas grava a nova URL; limpeza de arquivos órfãos = backlog futuro).
- Upload de logo da empresa / avatar (fluxos separados).
- RLS ou políticas novas (nada a fazer — bucket já configurado).
- Migrar para Next.js.

## 5. Decisões (propostas — validar com o fundador)

| # | Decisão | Proposta |
|---|---|---|
| D1 | Onde guardar a foto | ✅ **Supabase Storage**, bucket público `uniq_me_produtos` (já existe, já é público, políticas corretas). Nada a criar. |
| D2 | Quantas fotos por produto | **Uma foto** em `foto_url` na v1 (galeria multi-foto da vitrine é mock — backlog separado). |
| D3 | Upload: momento | **No salvar** (seleção só gere preview; upload dentro do `handleSave`). Evita arquivo órfão e simplifica erro/loading. |
| D4 | Path do arquivo | `{empresaId}/{uuid}.{ext}` — isola por tenant no bucket e o UUID garante URL nova (sem cache velho) a cada upload. |
| D5 | Limite de tamanho | **5 MB** por arquivo, apenas `image/*` (validação no cliente). |

## 6. Stakeholders

- **Esposa (Doceê):** anexa a foto ao cadastrar/editar produto; vê a foto no estoque. A vitrine que ela também acompanha passa a mostrar os produtos com aparência real.
- **Cliente final da Doceê:** vê o produto real na vitrine em vez de placeholder.
- **Fundador:** valida pelo celular (GitHub + Vercel) e decide D1–D5.

## 7. Critérios de aceite

| # | Critério | Como validar |
|---|---|---|
| 1 | Cadastrar produto com foto grava em `uniq_me_produtos` e `me_produto.foto_url` | Criar produto com imagem; conferir objeto no Storage e coluna preenchida com URL pública |
| 2 | Editar produto trocando a foto atualiza `foto_url` | Editar → trocar imagem → salvar → recarregar mostra a nova |
| 3 | Remover foto limpa o campo | Editar → remover → salvar → `foto_url` vazio; grid volta ao placeholder |
| 4 | Grid card exibe a foto quando existe | Produto com `foto_url` aparece com imagem (não placeholder) |
| 5 | Detalhe do produto exibe a foto | Abrir produto com foto no header |
| 6 | Upload falho não salva produto e mostra erro inline | Simular falha de rede no upload |
| 7 | Arquivo não-imagem ou > 5 MB é bloqueado com mensagem amigável | Tentar enviar PDF/png de 10 MB |
| 8 | Fallback mock intacto e mobile sem quebra | Modo demo + tela ~360px |
| 9 | `npm run build` passa; push → Vercel READY; fundador valida no celular | — |

## 8. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Upload grande trava o submit | Limite 5 MB + validação no cliente + botão desabilitado com spinner |
| URL de imagem quebrada no futuro (objeto removido) | `onError` no `<img>` cai para placeholder (mesmo padrão do fallback atual) |
| Arquivo órfão no Storage (upload OK, save falhou) | Aceito na v1 (pouco frequente; limpeza = backlog). Ordem: upload só no `handleSave` após validações |
| `empresa_id` ausente (sem sessão) | Upload exige `empresa.id` — sem sessão, erro explícito já dos hooks de escrita (não sobe nada) |
| Cache de imagem antiga ao trocar | Path com UUID sempre gera URL nova — sem cache stale |

---

*Criado em 16/09/2026. Próximo passo do pipeline SDD: SPEC (`tracking/specs/SPEC-ImagemProduto.md`) + WIRE (`tracking/wireframe/WIRE-ImagemProduto.md`) para aprovação antes do código.*