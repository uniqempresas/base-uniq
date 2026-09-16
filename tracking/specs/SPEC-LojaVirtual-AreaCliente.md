# SPEC — Área do Cliente na Loja Virtual (login por telefone)

> **PRD:** `tracking/plans/PRD-LojaVirtual-AreaCliente.md` (decisões E1–E3 resolvidas em 15/09/2026)
> **Depende de:** SPEC-LojaVirtual-DoceE (já implementado — hooks `use-loja-cliente`, `use-loja-meus-pedidos`, rotas `/loja/:slug*`)

---

## 1. Objetivo técnico

Adicionar sessão local por **(slug, telefone)** à vitrine: tela de entrada por telefone, área `/conta` com guarda, auto-login no checkout, entrada no header e logout — reutilizando os hooks existentes da loja. Sem OTP nesta versão (roadmap §6 do PRD).

## 2. Sessão (`src/app/hooks/use-loja-sessao.ts` — novo)

**Chave:** `uniq_loja_sessao_<slug>` (localStorage). **Valor:**

```typescript
export interface SessaoClienteLoja {
  telefone: string;      // normalizado (só dígitos, DDI 55)
  clienteId: string;     // me_cliente.id
  nomeCliente: string;   // para saudação na área
  expiraEm: number;      // epoch ms — agora + 24 HORAS (E5; renovado a cada leitura válida)
}
```

**API do hook (`useLojaSessao(slug)`):**

| Método | Comportamento |
|---|---|
| `sessao` | `SessaoClienteLoja \| null` — lê a chave do slug; **expirada → remove e retorna null**; válida → renova `expiraEm` (+24h, sliding) |
| `entrar({telefone, clienteId, nomeCliente})` | grava sessão com expiração de 30 dias |
| `sair()` | remove a chave da sessão (não toca em `uniq_loja_carrinho_<slug>`) |
| `logado` | boolean derivado |

SSR/parse defensivo: JSON inválido → remove e retorna null.

## 3. Rotas

| Rota | Tela | Regra |
|---|---|---|
| `/loja/:slug/entrar` | `EntrarClientePage` (nova) | se já logado → redirect `/loja/:slug/conta` |
| `/loja/:slug/conta` | `ContaClientePage` (nova) | **guarda:** sem sessão → redirect `/loja/:slug/entrar` |
| `/loja/:slug/pedidos` | — | **redirect** para `/loja/:slug/conta` (link antigo preservado) |

Ordem no `routes.tsx`: rotas estáticas do demo (`/loja/checkout` etc.) antes das dinâmicas (padrão já aplicado).

## 4. Tela de entrada (`EntrarClientePage`)

- Campo único: telefone com máscara (`maskPhone` existente) + validação zod (`telefone` ≥ 10 dígitos — reusar refinamento do `checkoutLojaSchema` extraindo para schema compartilhado `telefoneSchema` em `validators.ts`).
- Submit → `useLojaClientePorTelefone(empresaId, digits)` (hook existente):
  - **encontrado** → `entrar(...)` → redirect `/conta`;
  - **não encontrado** → estado inline "Nenhum cadastro encontrado nesta loja. Faça seu primeiro pedido!" + botão "Ver cardápio" (link para a vitrine);
  - **erro de banco** → toast/banner "Loja indisponível no momento — fale pelo WhatsApp" com `tenant.whatsapp`.
- Botão desabilitado enquanto `loading`; estados loading/erro/vazio conforme padrão.

## 5. Área (`ContaClientePage`)

- Saudação "Olá, {nomeCliente}" + botão **Sair** (com confirmação simples).
- Lista de pedidos: **reusar o card/lista de `MeusPedidosPage`** (extrair o bloco de lista para componente compartilhado ou chamar `useLojaMeusPedidos(empresaId, sessao.telefone)` direto — sem campo de telefone, pois a sessão já o fornece). Status via `mapStatusVenda` (já integrado).
- Empty: "Você ainda não tem pedidos nesta loja" + CTA para a vitrine.
- Guarda: `sessao === null` → `<Navigate to={`/loja/${slug}/entrar`} replace />` (em `useEffect` ou render condicional, cuidando para não redirecionar antes do `carregado` da leitura do localStorage — mesmo padrão do flag `carregado` do carrinho).

## 6. Integrações com o que já existe

| Ponto | Mudança |
|---|---|
| **Checkout** (`CheckoutPage`, modo tenant) | no sucesso do pedido, além de salvar o telefone para "meus pedidos", chamar `entrar({telefone, clienteId, nomeCliente})` (o hook `use-loja-criar-pedido` já retorna/resolve o cliente — expor `clienteId` no `CriarPedidoLojaResult`); botão "Ver meus pedidos" da confirmação aponta para `/loja/:slug/conta`. **E4: com sessão ativa, o checkout pula/pré-preenche a seção "Seus dados"** a partir da sessão (telefone já identificado) — a identificação do cliente acontece sempre e somente no checkout ou em `/entrar` |
| **Header da vitrine** (`LojaPage`, modo tenant) | **E6: botão "Entrar" sempre visível no header/menu quando deslogado** (→ `/entrar`); logado → "Meus pedidos" (→ `/conta`). Navegação nunca exige login |
| **`/loja/:slug/pedidos`** | vira redirect para `/conta` |

## 7. Validações e regras

1. Lookup sempre por `(empresa_id, telefone normalizado)` — sessão nunca cruza lojas.
2. Sessão expirada ou corrompida → removida silenciosamente; guarda manda para `/entrar`.
3. **Nunca** criar sessão sem cliente existente no banco (sem lookup bem-sucedido).
4. Sem fallback mock: login e área exigem banco (mesma regra do checkout — §2.5.4 do SPEC anterior).
5. Não alterar nenhuma tela autenticada do app.

## 8. Arquivos

```
src/app/
├── hooks/
│   ├── use-loja-sessao.ts          # novo (§2)
│   └── use-loja-criar-pedido.ts    # expor clienteId no resultado
├── components/loja/
│   ├── EntrarClientePage.tsx       # novo (§4)
│   ├── ContaClientePage.tsx        # novo (§5)
│   ├── MeusPedidosPage.tsx         # extrair/reusar lista para a área
│   ├── CheckoutPage.tsx            # auto-login no sucesso + CTA p/ /conta
│   └── LojaPage.tsx                # header: Entrar / Meus pedidos
├── lib/validators.ts               # telefoneSchema compartilhado
└── routes.tsx                      # rotas §3
```

## 9. Checklist de implementação

- [ ] `useLojaSessao` com expiração 30 dias sliding + parse defensivo
- [ ] `/loja/:slug/entrar` — login por telefone (máscara + zod), estados encontrado/não encontrado/erro
- [ ] `/loja/:slug/conta` — guarda de sessão, saudação, lista de pedidos via hook existente, botão Sair
- [ ] `/loja/:slug/pedidos` → redirect `/conta`
- [ ] Checkout cria sessão no sucesso; confirmação leva à área
- [ ] Header da vitrine alterna Entrar/Meus pedidos
- [ ] Logout preserva carrinho
- [ ] Critérios de aceite 1–10 do PRD
- [ ] `npm run build` OK

---

*Criado em 15/09/2026. Próximo passo: WIRE (`tracking/wireframe/WIRE-LojaVirtual-AreaCliente.md`) → aprovação → implementação.*
