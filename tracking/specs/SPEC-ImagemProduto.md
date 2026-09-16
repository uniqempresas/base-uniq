# SPEC — Imagem de Produto (upload Supabase Storage + exibição)

> **PRD:** `tracking/plans/PRD-ImagemProduto.md`
> **WIRE:** `tracking/wireframe/WIRE-ImagemProduto.md`
> **Origem:** uso real na Doceê — foto do produto é dado do produto; deve viver no Supabase Storage (decisão do fundador).
> **Supabase oficial:** `krrkfgvdwhpelxtrdtla.supabase.co` — `src/lib/supabase.ts` NÃO muda.
> **Pesquisa (16/09/2026):** coluna `me_produto.foto_url` **já existe** (text, nullable) · bucket público `uniq_me_produtos` **já existe** · políticas RLS já corretas (INSERT/UPDATE/DELETE `authenticated` via role, SELECT `public`) · supabase-js já expõe `.storage` **· zero migrations necessárias**.

---

## 0. Contexto mínimo

- App Vite + React multi-tenant. `useAuth()` expõe `{ user, session, perfil, empresa, loading }`; `empresa.id` é o tenant.
- **Mock-first (07/09/2026):** mock só em modo demo; com sessão, dados reais; sem `empresa_id` resolvido, hooks falham com erro explícito e NÃO gravam.
- **Já mapeiam `foto_url` hoje (não mexer):** `use-produtos.ts:62` (`foto: db.foto_url || undefined`), `use-produto.ts:62`, `use-loja-produtos.ts:29` (`fotoUrl`), `use-loja-produto.ts:70`, `use-pedido.ts:310-314` (fotos de itens), `use-carrinho-loja.ts:85`, `use-cliente.ts`/`use-clientes.ts` (avatar — irrelevante).
- **Já aceitam `fotoUrl` hoje (não mexer):** `use-criar-produto.ts:14,54` (`foto_url: params.fotoUrl || null`), `use-atualizar-produto.ts:15,56` (`if (campos.fotoUrl !== undefined) updateData.foto_url = campos.fotoUrl`).
- **O tipo `Produto` do estoque já tem `foto?: string`** (`estoqueMockData.ts:47`).
- **Não existe nenhum `storage.upload` em `src/app`** — o único "preview" é mock (ServicoForm, comentário de demo).

---

## 1. Arquivos

### Criados
- [ ] `src/app/hooks/use-upload-produto.ts` — upload de foto de produto para o bucket `uniq_me_produtos` + `getPublicUrl`

### Modificados
- [ ] `src/app/components/estoque/ProdutoFormModal.tsx` — seção "Foto do produto" (preview + enviar + remover) e envio de `fotoUrl` no salvar
- [ ] `src/app/components/estoque/ProdutosPage.tsx` — `ProdutoGridCard` exibe `produto.foto` quando existir (fallback placeholder atual)
- [ ] `src/app/components/estoque/ProdutoDetalhePage.tsx` — ícone do header (linhas 388-392) vira foto quando existir
- [ ] `src/app/components/estoque/estoqueMockData.ts` — `foto` em 2–3 mocks (URLs estilo unsplash, mesmo padrão da loja)

> **Sem migration, sem mudança de hooks de escrita/leitura, sem mudança em `supabase.ts`.**

---

## 2. Hook novo — `use-upload-produto.ts`

Espelhar o padrão dos hooks existentes (`useState`/`useCallback`, retorno tipado, contráto de erro com mensagem legível em PT-BR).

```ts
export interface UploadFotoProdutoResult {
  success: boolean;
  url?: string;      // URL pública (getPublicUrl)
  error?: string;
}

export function useUploadProdutoFoto() {
  // const [carregando, setCarregando] = useState(false);
  // const uploadarFoto = useCallback(async (empresaId: string, arquivo: File): Promise<UploadFotoProdutoResult> => {...}, []);
  return { uploadarFoto, carregando };
}
```

**Regras do upload:**
1. Validar no cliente antes de subir:
   - `arquivo.type.startsWith("image/")` → senão `{ success: false, error: "Envie uma imagem (JPG, PNG ou WebP)." }`
   - `arquivo.size <= 5 * 1024 * 1024` → senão `{ success: false, error: "Imagem muito grande. Envie uma foto de até 5 MB." }`
2. Path no bucket: **`${empresaId}/${crypto.randomUUID()}.${ext}`** (D4 do PRD) — `ext` vindo do nome do arquivo (`arquivo.name.split(".").pop()?.toLowerCase()`), fallback `png`.
3. Upload:
   ```ts
   const { error: uploadError } = await supabase.storage
     .from("uniq_me_produtos")
     .upload(path, arquivo, { contentType: arquivo.type, upsert: false });
   ```
4. Sucesso → URL pública:
   ```ts
   const { data } = supabase.storage.from("uniq_me_produtos").getPublicUrl(path);
   return { success: true, url: data.publicUrl };
   ```
5. Erro (`uploadError`) → `{ success: false, error: uploadError.message }`.
6. Sem `empresaId` → `{ success: false, error: "Empresa não identificada para este usuário. Recarregue a página ou faça login novamente." }` (mesma mensagem dos hooks de escrita — nunca subir arquivo sem tenant).

> `crypto.randomUUID` requer contexto seguro (https/localhost) — Vercel e dev local atendem. Cada upload gera URL nova → sem cache stale.

---

## 3. `ProdutoFormModal.tsx` — seção de foto (step 1 "Informações")

### 3.1 Estado novo (inicialização no `useState` do form, linha 29-43)

```ts
const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
const [fotoPreview, setFotoPreview] = useState<string>(base?.foto || "");   // URL existente OU objectURL da seleção
const [fotoRemovida, setFotoRemovida] = useState(false);                   // só importa no modo editar
const [erroFoto, setErroFoto] = useState<string>("");
```

**Inicial:** `base = produtoBase || produto || null` — no modo duplicar, herda a foto do original no preview mas **não** sobe o arquivo de novo (v1: no duplicar, `fotoUrl` propagado como URL existente no save).

### 3.2 UI (topo do passo 1, antes de "Nome do produto")

```
─ Foto do produto ─────────────────────────────
┌───────────────┐   [Enviar foto]  [Remover]
│   preview     │   (input file escondido)
│   ou ícone    │   JPG, PNG ou WebP · máx 5 MB
│   Package     │
└───────────────┘
[erroFoto inline — text-xs text-red-600]
```

- **Preview:** bloco `w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden` com `background: catColors.bg`; `fotoPreview` → `<img src className="w-full h-full object-cover">`; sem foto → `<Package size={40} style={{ color: catColors.text, opacity: 0.4 }} />`.
- **"Enviar foto":** `label` acoplado a `<input type="file" accept="image/*" className="hidden">` (aria-label "Enviar foto do produto"; keyboard: o label é focável no modo natural).
- **onChange do input:**
  1. valida tipo/tamanho → inválido: `setErroFoto(msg)` e não altera preview;
  2. válido: `setFotoArquivo(file)`, `setFotoPreview(URL.createObjectURL(file))`, `setFotoRemovida(false)`, `setErroFoto("")`.
- **"Remover":** `setFotoArquivo(null)`, `setFotoPreview("")`, `setFotoRemovida(Boolean(base))`, `setErroFoto("")`. Visaível sempre; se não há foto e não está editando, desabilitado/oculto.

### 3.3 Save — fluxo no `handleSave` (linha 53)

**Ordem: upload primeiro; produto só salva se o upload der certo (regra 1 do PRD).**

```ts
let fotoUrlFinal: string | undefined;

if (fotoArquivo) {
  const empresaId = ...; // via useAuth() — useCriarProduto/useAtualizarProduto já usam; NÃO duplicar: ver nota abaixo
  const res = await uploadarFoto(empresaId, fotoArquivo);
  if (!res.success) { setErro(res.error || "Erro ao enviar a foto."); return; }
  fotoUrlFinal = res.url;
} else if (fotoRemovida) {
  fotoUrlFinal = "";   // limpa foto_url no modo editar (mapper lê || undefined → placeholder)
}

// criarProduto / atualizarProduto:
//   fotoUrl: fotoUrlFinal   ← adicionar ao objeto de params (undefined → hook existente o ignora)
```

- `salvando` passa a ser `ehEdicao ? (salvandoEditar || carregando) : (salvandoCriar || carregando)` — `carregando` do `useUploadProdutoFoto()`. Botão desabilitado durante upload+save, texto "Salvando...".
- `removerObjetoDoStorage` ao remover/trocar: **fora de escopo v1** (ver PRD §4) — só grava a nova URL.

> **Nota de empresa:** `ProdutoFormModal` não importa `useAuth` hoje. Adicionar `const { empresa } = useAuth()` e usar `empresa?.id`; se ausente, o próprio hook de upload já responde com erro explícito (regra 6 da §2).

---

## 4. `ProdutosPage.tsx` — `ProdutoGridCard` exibe foto (linhas 91-97)

Dentro do bloco `relative overflow-hidden` do placeholder:

```tsx
const [imgFalhou, setImgFalhou] = useState(false);
const temFoto = Boolean(produto.foto) && !imgFalhou;
```

- `temFoto` → `<img src={produto.foto} alt={produto.nome} className="absolute inset-0 w-full h-full object-cover" onError={() => setImgFalhou(true)} loading="lazy" />`
- `!temFoto` → placeholder `Package` atual (inalterado).
- Badges (top-left), variações (top-right) e hover actions continuam por cima (`z-index` relativo ao posicionamento já existente — imagem `absolute inset-0` fica na base).
- **Regressão:** mobile `h-24`/`sm:h-36` mantidos; `rounded-t-2xl` vem do `overflow-hidden` do contêiner.

---

## 5. `ProdutoDetalhePage.tsx` — header (linhas 388-392)

Substituir o bloco ícone `w-20 h-20 rounded-2xl` do **Header Hero**:

```tsx
<div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-lg" style={{ background: catColors.bg }}>
  {produto.foto ? (
    <img src={produto.foto} alt={produto.nome} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
  ) : (
    <Package size={36} style={{ color: catColors.text }} />
  )}
</div>
```

- `overflow-hidden` adicionado ao contêiner. Fallback por `onError` (esconde a img e mantém fundo da categoria).

---

## 6. Mocks — `estoqueMockData.ts`

Adicionar `foto` a **2–3 produtos** (padrão de URLs da loja: `https://images.unsplash.com/photo-...?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800`) para a demo mostrar o fluxo completo. Produtos sem `foto` seguem com placeholder (tipo já tem `foto?: string` na linha 47 — só preencher valores).

---

## 7. Verificação (Definition of Done)

- [ ] Criar produto com foto → objeto em `uniq_me_produtos` (`{empresaId}/{uuid}.ext`) + `me_produto.foto_url` = URL pública `https://krrkfgv.../storage/v1/object/public/uniq_me_produtos/...`
- [ ] Editar produto trocando a foto → `foto_url` atualizado; recarregar mostra a nova (URL nova por UUID, sem cache)
- [ ] Remover foto no modo editar → `foto_url` vazio (`""`) no banco; grid volta ao placeholder
- [ ] Duplicar produto → herda `foto_url` (url existente propagada no save), não re-envia arquivo
- [ ] Grid card mostra foto quando existe (desktop e mobile); placeholder quando não
- [ ] Detalhe do produto mostra foto no header; fallback para ícone quando imagem quebra
- [ ] Sem sessão/empresa → save falha com erro explícito, NADA é enviado ao Storage
- [ ] Arquivo não-imagem ou > 5 MB → bloqueado com `erroFoto` inline
- [ ] Fallback mock na loja/vitrine continua funcionando (`fotoUrl` já mapeado)
- [ ] `npm run build` passa; push → Vercel READY; fundador valida no celular
- [ ] Tracking `tracking/TRACKING.md` atualizado; checklist do SPEC 100%

---

## 8. O que NÃO fazer

- Não tocar em `src/lib/supabase.ts`, migrations, RLS, edge functions (tudo já existe e está correto).
- Não alterar assinaturas de `use-criar-produto`/`use-atualizar-produto` nem o mapeamento de leitura (já pronto).
- Não implementar galeria multi-foto, compressão de imagem, nem remoção de objeto órfão do Storage (backlog — PRD §4).
- Não redesenhar o modal/grid/detalhe (copiar markup existente; WIRE entrega estrutura).
- Não migrar para Next.js.