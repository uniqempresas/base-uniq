# SPEC — Persistir a foto do WhatsApp em `me_cliente`

> **Origem:** pedido do fundador — *"nas conversas do WhatsApp gravadas no Supabase eu salvo também a foto do cliente. Vamos importar essa foto também para a tabela me_cliente"*
> **Natureza:** infraestrutura / dados. **Não há tela nova**, então não há WIRE (a regra de ouro do SDD cobre telas).
> **Decisões aprovadas pelo fundador (17/09/2026):** usar Edge Function (deploy via MCP) para os clientes existentes **e** servir de endpoint para o n8n nas conversas novas.

---

## 1. O problema — e a armadilha que o pedido esconde

O pedido literal ("gravar `foto_contato` em `me_cliente`") produziria **imagens quebradas**, por três fatos verificados no banco oficial:

| Fato medido | Consequência |
|---|---|
| `me_cliente.foto_url` **já existe** (text, nullable) | Nenhuma migration de coluna é necessária |
| `crm_chat_conversas.cliente_id` está **NULL nas 25 conversas** | Não há vínculo direto; o casamento tem de ser por **telefone** |
| `pps.whatsapp.net/...&oe=6AB97DAB` expira em **27/09/2026** | A URL morre em ~10 dias |
| A URL de **Leandro** (`oe=696E3167`) decodifica para **19/01/2026** e responde **HTTP 403** | Confirma empiricamente: `oe` é expiração; URL vencida devolve 403 |
| 2 das fotos são **placeholder do Vecteezy** | Não são o rosto do cliente — devem ficar de fora |

**Conclusão:** o que precisa ser persistido é o **arquivo**, não o link. É a mesma decisão já tomada para a foto do produto ("a foto deve viver no Supabase Storage").

### Resultado do casamento por telefone (`fn_normalizar_telefone(canal_id) = me_cliente.telefone`)

- 25 conversas · 24 com foto · **7 casam com cliente** · 6 desses sem foto · 1 já tem foto
- **4 clientes** têm foto válida hoje: Thamires, Thalita, Luan e Henriq

---

## 2. Por que Edge Function

O MCP do Supabase **não tem ferramenta de Storage** — não há como subir arquivo por ele. Mas tem `deploy_edge_function`, e Edge Function roda com **`SUPABASE_SERVICE_ROLE_KEY` injetado pelo runtime** (a própria `webhook-whatsapp` deste projeto já usa essa variável).

Ou seja: a function é a ponte que faltava — resolve o backfill **hoje, sem o fundador entregar nenhuma chave**, e vira o endpoint permanente que o n8n chama.

> **Convenção do projeto:** as 4 functions existentes são **deploy-only** (não há `supabase/functions/` no repo, nem `config.toml`). Esta segue o mesmo padrão — o código-fonte de produção vive no Supabase. O código abaixo é a referência para redeploy, com o segredo redigido.

---

## 3. Contrato

```
POST https://krrkfgvdwhpelxtrdtla.supabase.co/functions/v1/persistir-foto-cliente
Header: x-uniq-secret: <UNIQ_FOTO_SECRET do .env>
Body (um dos dois):
  { "cliente_id": "<uuid>" }            // uso direto
  { "telefone": "5511999999999" }       // normalizado por fn_normalizar_telefone
Opcional: { "forcar": true }            // sobrescreve foto existente
```

**Respostas**

| Caso | Corpo |
|---|---|
| Sucesso | `{ success: true, cliente_id, foto_url, bytes, origem_host }` |
| Cliente já tem foto | `{ success: true, ignorado: true, motivo, foto_url }` |
| Host não permitido (ex.: placeholder) | `{ success: false, ignorado: true, motivo }` |
| URL expirada | `{ success: false, motivo: "Origem respondeu 403 (foto expirada?)" }` |
| Sem segredo / segredo errado | `401` |

### Fluxo interno

1. Autoriza pelo header `x-uniq-secret`
2. Resolve o cliente (`cliente_id` ou `telefone` via RPC `fn_normalizar_telefone`)
3. **Pula se já tem `foto_url`** (a menos que `forcar`)
4. Origem da foto: `crm_chat_conversas.foto_contato` **mais recente** daquele telefone
5. **Valida o host** contra allowlist (`pps.whatsapp.net`) → bloqueia placeholder e qualquer URL arbitrária
6. Baixa com **User-Agent de navegador** (o CDN recusa sem — foi o 403 do primeiro teste)
7. Exige `content-type: image/*` e **≤ 2 MB**
8. Sobe em `uniq_me_produtos/clientes/{cliente_id}.{ext}` com `upsert`
9. Grava a **URL pública + `?v=<timestamp>`** em `me_cliente.foto_url` (o query param evita cache do navegador quando a foto é trocada)

---

## 4. Segurança

| Risco | Mitigação |
|---|---|
| **SSRF** (função baixando URL arbitrária) | Allowlist de host no código. Nunca aceita URL de fora do CDN do WhatsApp |
| Chamada indevida | Segredo compartilhado no header; `verify_jwt: false` só porque o n8n não carrega JWT (mesmo padrão de `webhook-whatsapp` e `criar-conta`) |
| Imagem gigante / zip bomb | Limite de 2 MB e exigência de `content-type: image/*` |
| Sobrescrever foto boa | Só grava se estiver vazio, salvo `forcar: true` |
| Segredo vazando no Git | O valor real vive **só** na function deployada e no `.env` (gitignored, verificado). O código aqui está redigido |

**Rotação:** redeployar a function com um novo valor e atualizar o `.env` + n8n. Não há outro lugar onde o segredo exista.

---

## 5. Código de referência (segredo redigido)

> **⚠️ O que está em produção é a v2.** O código abaixo é a **v1**. A v2 acrescenta dois passos, descritos na §7:
> 1. o `select` da conversa passa a trazer também o **`id`**;
> 2. depois de subir a imagem, a **mesma** URL estável é gravada em **`crm_chat_conversas.foto_contato`** — sem isso o avatar do CRM continuaria apontando para a URL do WhatsApp, que expira.
>
> A v2 também estabiliza o avatar quando o cliente **já tinha** foto (retorna `ignorado: true` sem deixar a conversa com link expirável).

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BUCKET = 'uniq_me_produtos'
const PASTA = 'clientes'
const MAX_BYTES = 2 * 1024 * 1024
const SEGREDO = Deno.env.get('UNIQ_FOTO_SECRET') ?? 'SEGREDO_COMPARTILHADO'
// Deliberadamente fechado: a função NÃO é um proxy de download aberto.
const HOSTS_PERMITIDOS = ['pps.whatsapp.net']

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-uniq-secret',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function extDe(mime: string) {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  return 'jpg'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405)
  if (req.headers.get('x-uniq-secret') !== SEGREDO) return json({ error: 'Não autorizado' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const body = await req.json().catch(() => ({}))
    const clienteId: string | undefined = body.cliente_id
    const telefone: string | undefined = body.telefone
    const forcar: boolean = body.forcar === true

    let cliente: { id: string; empresa_id: string; telefone: string | null; foto_url: string | null } | null = null
    if (clienteId) {
      const { data, error } = await supabase.from('me_cliente')
        .select('id, empresa_id, telefone, foto_url').eq('id', clienteId).maybeSingle()
      if (error) throw error
      cliente = data
    } else if (telefone) {
      const { data: tel, error: e1 } = await supabase.rpc('fn_normalizar_telefone', { p_telefone: telefone })
      if (e1) throw e1
      const { data, error } = await supabase.from('me_cliente')
        .select('id, empresa_id, telefone, foto_url').eq('telefone', tel).maybeSingle()
      if (error) throw error
      cliente = data
    }

    if (!cliente) return json({ error: 'Cliente não encontrado' }, 404)

    if (!forcar && cliente.foto_url && cliente.foto_url.trim() !== '') {
      return json({ success: true, ignorado: true, motivo: 'Cliente já tem foto', foto_url: cliente.foto_url })
    }

    let origem: string | undefined = body.foto_url
    if (!origem) {
      const { data: conv, error } = await supabase.from('crm_chat_conversas')
        .select('foto_contato')
        .eq('empresa_id', cliente.empresa_id)
        .eq('canal_id', cliente.telefone)
        .not('foto_contato', 'is', null)
        .order('criado_em', { ascending: false })
        .limit(1).maybeSingle()
      if (error) throw error
      origem = conv?.foto_contato ?? undefined
    }

    if (!origem || origem.trim() === '') return json({ success: false, motivo: 'Sem foto na conversa' })

    let url: URL
    try { url = new URL(origem) } catch { return json({ error: 'URL inválida' }, 400) }
    if (!HOSTS_PERMITIDOS.includes(url.hostname)) {
      return json({ success: false, ignorado: true, motivo: `Host não permitido: ${url.hostname}` })
    }

    const resp = await fetch(origem, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    })
    if (!resp.ok) return json({ success: false, motivo: `Origem respondeu ${resp.status} (foto expirada?)` })

    const mime = resp.headers.get('content-type') ?? 'image/jpeg'
    if (!mime.startsWith('image/')) return json({ success: false, motivo: `Conteúdo não é imagem: ${mime}` })

    const buf = await resp.arrayBuffer()
    if (buf.byteLength > MAX_BYTES) return json({ success: false, motivo: `Imagem grande demais: ${buf.byteLength} bytes` })

    const caminho = `${PASTA}/${cliente.id}.${extDe(mime)}`
    const { error: upErr } = await supabase.storage.from(BUCKET)
      .upload(caminho, buf, { contentType: mime, upsert: true })
    if (upErr) throw upErr

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(caminho)
    const urlPublica = `${pub.publicUrl}?v=${Date.now()}`

    const { error: updErr } = await supabase.from('me_cliente').update({ foto_url: urlPublica }).eq('id', cliente.id)
    if (updErr) throw updErr

    return json({ success: true, cliente_id: cliente.id, foto_url: urlPublica, bytes: buf.byteLength, origem_host: url.hostname })
  } catch (e) {
    console.error('persistir-foto-cliente:', e)
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
```

---

## 6. Backfill dos 4 clientes

| Cliente | `cliente_id` |
|---|---|
| Thamires Campos Mendes da | `f4a34f73-fef7-4d52-bed9-7d2edbf862a8` |
| Thalita Mendes 🌸 | `5b0aede5-0954-4361-a72d-fb2306b5f932` |
| Luan | `1f02dc88-4cfc-464e-a798-99f46f461d10` |
| Henriq Silva | `9d4f8a80-e6fd-4a98-b030-50ca73a37964` |

- **Leandro** fica de fora: a URL já expirou (403)
- **Laura** fica de fora: a "foto" é placeholder do Vecteezy (o allowlist de host bloqueia)
- Cópias locais de segurança em `C:\Users\henri\AppData\Local\Temp\opencode\fotos-clientes\` (baixadas antes do vencimento)

---

## 7. Automação no n8n — ✅ IMPLEMENTADA (17/09/2026)

**Workflow:** `atendente_Docee` (id `3IVutqEXVq8MtXkZ`, ativo) · **nó novo:** `Persistir Foto Cliente` (HTTP Request 4.2)

**Onde foi inserido:** entre `Wait4` e `Consulta Conversas1`.

```
Cliente Ja Cadastrado
   ├── (já cadastrado) ─────────────────────→ Wait4 ─┐
   └── (novo) → Cria_Cliente ────────────────→ Wait4 ─┴→ Persistir Foto Cliente → Consulta Conversas1
```

`Wait4` foi escolhido porque é **o ponto onde os dois caminhos convergem, já com o cliente existindo** — uma inserção cobre os dois casos, em vez de duplicar o nó.

**Por que a inserção é segura:** `Consulta Conversas1` monta os filtros com `$('DADOS_MSG5').item.json.*` (referência a nó nomeado), **não** com o item imediato. Então um nó novo no meio não quebra o encadeamento de dados.

**Configuração do nó** (espelha o `FotoContato2`, que já funciona neste mesmo workflow, em vez de inventar forma nova):

```
Método: POST
URL:    https://krrkfgvdwhpelxtrdtla.supabase.co/functions/v1/persistir-foto-cliente
Headers: x-uniq-secret: <UNIQ_FOTO_SECRET>   Content-Type: Application/json
Body:    telefone = {{ $('DADOS_MSG5').item.json.n_telefone }}
onError: continueRegularOutput   ← uma falha da função NUNCA quebra o atendimento
```

**Verificação:** `n8n_validate_workflow` → `valid: true`, 65 nós, 68 conexões válidas, **0 inválidas**, 93 expressões verificadas, 0 erros, 0 warnings. E a topologia confirma cadeia limpa (a conexão antiga foi substituída, não duplicada): `Wait4 → Persistir Foto Cliente → Consulta Conversas1`.

**Rollback:** o n8n-mcp tira snapshot antes de alterar; `n8n_workflow_versions` (mode `rollback`) restaura. O workflow é ativo — a mudança vale para as próximas execuções.

**Respostas possíveis da função:** `success` · `ignorado` (cliente já tem foto — mas o avatar da conversa é estabilizado mesmo assim) · `Host nao permitido` (placeholder) · `Origem respondeu 403` (foto expirada) · `Cliente nao encontrado` (404).

### 🐞 Bug encontrado no primeiro teste real — e corrigido na v3 (17/09/2026)

O primeiro teste ponta a ponta **falhou**, e a investigação achou a causa:

- **O nó do n8n rodou** (execução `4563`) e **a função foi chamada** — os logs do Supabase (`function_edge_logs`) mostram o `POST /persistir-foto-cliente` às `23:39:33` com **`status_code: 500`**.
- Mas o `onError: continueRegularOutput` marcou o nó como `success`, e o corpo do erro aparecia como **`[object Object]`** — o erro estava **escondido**.

**Causa raiz — erro meu de multi-tenancy:** o caminho `{ telefone }` buscava o cliente **sem filtrar empresa** e usava `.maybeSingle()`, que **estoura quando encontra mais de uma linha**. O telefone **não é único entre empresas**: o número `5511941484562` existe em **3 tenants** (Doceê, `61616cfa` e UNIQ Empresas).

**Correções na v3:**

1. **`empresa_id` passou a ser obrigatório junto do telefone** — sem ele, a função devolve **400** com o motivo explícito, em vez de tentar um palpite ambíguo.
2. **O n8n agora manda `cliente_id`** — que é único e **já estava fluindo no item** (o `Wait4` entrega a linha completa do cliente). Deixou de reconstruir por telefone algo que já tinha em mãos.
3. **O erro passou a ser serializado de verdade** (`message`, `code`, `details`, `hint`), porque erros do PostgREST/Storage **não são instâncias de `Error`** — era isso que virava `[object Object]`.

**Lição registrada:** `onError: continueRegularOutput` é certo para não derrubar o atendimento, mas **esconde falha silenciosa**. O corpo da resposta precisa ser inspecionado — foi o que o `preview` da execução permitiu.

### ⚠️ Gap separado, não corrigido aqui

O fluxo **cria o cliente mas não vincula a conversa a ele** — `crm_chat_conversas.cliente_id` fica **NULL**. Foi verificado na conversa nova do Henriq Silva (17/09). Isso é outra preocupação (o CRM não sabe de quem é a conversa), fora do escopo da foto, e precisa de decisão antes de mexer.

---

## 8. Limpeza dos dados de teste da Doceê (17/09/2026)

O fundador pediu para limpar conversas, pedidos e clientes da Doceê (ainda em testes).

**Backup antes de apagar** — 8 tabelas copiadas dentro do próprio banco (`CREATE TABLE AS SELECT`), restaurável:

`_bk_20260917_crm_chat_conversas` (5) · `_bk_20260917_crm_chat_mensagens` (122) · `_bk_20260917_me_cliente` (5) · `_bk_20260917_me_venda` (5) · `_bk_20260917_me_itens_venda` (19) · `_bk_20260917_me_venda_servicos` (0) · `_bk_20260917_me_venda_historico` (2) · `_bk_20260917_me_contas_receber` (5)

O backup foi **conferido antes** do DELETE (as contagens batiam com a origem).

**Apagado em transação única**, filho → pai, sempre com filtro `empresa_id`:

| Tabela | Antes | Depois |
|---|---|---|
| `crm_chat_conversas` | 5 | 0 |
| `crm_chat_mensagens` | 122 | 0 |
| `me_cliente` | 5 | 0 |
| `me_venda` | 5 | 0 |
| `me_itens_venda` | 19 | 0 |
| `me_venda_historico` | 2 | 0 |
| `me_contas_receber` | 5 | 0 |
| **`me_produto`** | 16 | **16 (preservado)** |
| **`me_categoria`** | 5 | **5 (preservado)** |

**Cuidados que o contrato de FK exigiu:**
- `crm_chat_conversas.cliente_id → me_cliente` é **ON DELETE CASCADE** — apagar cliente derrubaria as conversas dele. Por isso as conversas foram apagadas **antes**, de forma explícita.
- `me_venda.cliente_id` **não tem FK** — se eu apagasse o cliente primeiro, sobrariam vendas órfãs. As vendas foram apagadas antes dos clientes.
- `crm_chat_mensagens.conversa_id` é **uuid** (o TRACKING antigo dizia text — corrigido).

**Não mexi (deliberadamente):** `mel_chat` (548 linhas, **sem `empresa_id`** — não é escopo de tenant, e não são as conversas do WhatsApp), `crm_leads` (0 linhas na Doceê, preservado como legado), e as migrations de produto/categoria.

**⚠️ Órfãos no Storage:** as 4 fotos em `uniq_me_produtos/clientes/*.jpg` pertenciam aos clientes apagados. São inofensivas (~185 KB) e ficam disponíveis caso o backup seja restaurado; podem ser removidas depois.

**Restaurar, se precisar:**
```sql
INSERT INTO me_cliente SELECT * FROM _bk_20260917_me_cliente;
-- idem para as demais _bk_20260917_*
```

---

## 9. Fora de escopo

- Exibir a foto na UI do CRM (lista/detalhe de clientes) — é mudança de tela, pede o pipeline completo
- Subcategorias / outras mídias da conversa
- Reprocessar fotos já expiradas (irrecuperáveis — 403)
