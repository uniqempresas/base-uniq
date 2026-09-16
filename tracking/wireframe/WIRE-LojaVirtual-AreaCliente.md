# WIRE — Área do Cliente na Loja Virtual (login por telefone)

> **PRD:** `tracking/plans/PRD-LojaVirtual-AreaCliente.md` · **SPEC:** `tracking/specs/SPEC-LojaVirtual-AreaCliente.md`
> **Regras:** estrutura e função (design real no OpenDesign) · mobile-first · sem senha, sem OTP na v1

---

## 1. Rotas

```
/loja/:slug/entrar   → [L1] Login por telefone (deslogado)
/loja/:slug/conta    → [L2] Área do cliente (guarda: sem sessão → L1)
/loja/:slug/pedidos  → redirect para /conta
Header da vitrine    → [L3] estados Entrar / Meus pedidos
```

## 2. [L1] Entrar (`/loja/:slug/entrar`) — mobile

```
┌──────────────────────────────────────┐
│ [←]              Doceê               │
├──────────────────────────────────────┤
│                                      │
│            👤 (ícone)                │
│         Acompanhe seus pedidos       │
│   Digite o telefone usado na compra  │
│                                      │
│  Telefone *                          │
│  [ (11) 99999-9999                 ] │
│                                      │
│  [          Entrar            ]      │  ← disabled até 10+ dígitos
│                                      │
│  Não tem cadastro? Ver cardápio →    │
│                                      │
└──────────────────────────────────────┘

Estados:
· loading      → spinner no botão
· não encontrado → inline vermelho:
  "Nenhum cadastro encontrado nesta loja."
  [ Ver cardápio e fazer meu primeiro pedido ]
· banco indisponível → banner:
  "Loja indisponível no momento — fale pelo
   WhatsApp (11) 99999-9999"
```

## 3. [L2] Conta (`/loja/:slug/conta`) — mobile

```
┌──────────────────────────────────────┐
│ [←]              Doceê               │
├──────────────────────────────────────┤
│  Olá, Maria 👋              [ Sair ] │
│  ──────────────────────────────      │
│  MEUS PEDIDOS                        │
│  ┌────────────────────────────────┐  │
│  │ Pedido 000042      📥 Recebido │  │
│  │ 2 itens · R$ 16,00             │  │
│  │ Hoje, 14h32 · Pix              │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Pedido 000031      ✅ Entregue │  │
│  │ 1 item · R$ 45,00              │  │
│  │ 10/09, 16h05 · Dinheiro        │  │
│  └────────────────────────────────┘  │
│  ──────────────────────────────      │
│  [ 🛒 Voltar para a loja ]           │
└──────────────────────────────────────┘

Estados:
· sem sessão → redirect /entrar (não renderiza)
· loading    → 2 skeleton cards
· vazio      → "Você ainda não tem pedidos nesta loja."
               [ Ver cardápio ]
· Sair       → limpa sessão → volta a /loja/:slug deslogado
               (carrinho preservado)
```

## 4. [L3] Header da vitrine — estados de sessão

```
DESLOGADO                            LOGADO
┌──────────────────────────────┐     ┌──────────────────────────────┐
│ 🍰 Doceê da Jú    [ Entrar ] │     │ 🍰 Doceê da Jú [Meus pedidos]│
│ Peça online · Entrega...     │     │ Peça online · Entrega...     │
└──────────────────────────────┘     └──────────────────────────────┘
```

## 5. Auto-login no checkout (sem tela nova)

```
Checkout → Confirmar pedido → RPC OK
    ↓ (sessão criada automaticamente com o telefone do checkout)
[T4 Confirmação]
┌──────────────────────────────────────┐
│            ✅                        │
│      Pedido recebido, Maria!         │
│   Pedido nº 000042 · R$ 61,00        │
│                                      │
│  [ Ver meus pedidos ]  → /conta      │  ← agora abre LOGADO (sem redigitar)
│  [ Voltar para a loja ]              │
└──────────────────────────────────────┘
```

## 6. Regras visuais

- Mesmo header/estrutura da vitrine (tenant): logo + nome da loja.
- **Navegação sempre livre (E4):** vitrine, produto e sacola nunca pedem login; o login acontece só no checkout (ao confirmar os dados do pedido) ou em `/entrar` para "Meus pedidos".
- **Botão "Entrar" sempre visível no header quando deslogado (E6)** — é a porta de entrada fácil da área; com sessão vira "Meus pedidos".
- **Sessão de 24 horas (E5),** renovada a cada acesso; expirada → volta ao estado deslogado sem aviso intrusivo.
- Um único campo na tela de login — nada de senha, e-mail ou cadastro.
- Badges de status dos pedidos = mesmos do módulo Pedidos (`mapStatusVenda`).
- Consentimento LGPD permanece só no checkout (a área não coleta dado novo).
- Aviso de rodapé na [L1]: "Acesso por telefone — versão de testes" (registra a temporariedade do telefone puro; removido quando o OTP entrar).

---

*Criado em 15/09/2026. Aguardando aprovação do fundador. Com o WIRE aprovado, a implementação será delegada a especialista (@fixer) seguindo o SPEC.*
