# PRD — Área do Cliente na Loja Virtual (login por telefone)

> **Continuação do módulo Loja Virtual** — PRD/SPEC/WIRE em `tracking/plans/PRD-LojaVirtual-DoceE.md` e pares.
> **Decisões do fundador (15/09/2026):** v1 = **telefone puro, sem código** (semana de testes) — **OTP via WhatsApp fica registrado como evolução obrigatória antes de cliente real**; área mostra **só pedidos**; sessão **por loja**.

---

## 1. Objetivo

O cliente final entra na **área dele na loja usando só o telefone** — sem senha — e acompanha os pedidos daquela loja. A sessão é escopada por **(loja, telefone)**: o mesmo telefone pode ser cliente de várias lojas da Base UNIQ, e cada loja tem seu próprio login.

## 2. Problema

1. **Hoje "Meus pedidos" exige digitar o telefone a cada acesso** — não há noção de "entrei na minha conta". O cliente que compra toda semana redigita o número sempre.
2. **Não há ponto de entrada na vitrine** — o cliente não descobre que pode acompanhar os pedidos.
3. **Telefone puro não é autenticação** — qualquer um que saiba o telefone vê os pedidos/nome/endereço. Aceito **temporariamente** na semana de testes (laboratório), com OTP via WhatsApp registrado como evolução obrigatória antes de abrir a clientes reais (LGPD — pendência P3).

## 3. Solução

**Login por telefone com sessão local por loja.**

```
Cliente digita telefone em /loja/:slug/entrar
        ↓
Lookup me_cliente (empresa_id + telefone normalizado)
        ↓
  Existe? ──não──→ "Nenhum cadastro nesta loja" + CTA p/ vitrine
   │sim
   ▼
Sessão salva: localStorage `uniq_loja_sessao_<slug>`
   { telefone, clienteId, expiraEm = agora + 30 dias }
        ↓
Área /loja/:slug/conta → pedidos do cliente (sem redigitar nada)
```

Regras:
1. **Sessão por loja** — a chave inclui o slug; entrar na Doceê não abre sessão na HQ Gráfica.
2. **Navegação sempre livre (E4)** — vitrine, produto e sacola nunca pedem login; a identificação acontece **só no checkout** (o telefone de "Seus dados" é o login) ou em `/entrar` para acessar "Meus pedidos".
3. **Só pedidos na v1** — a área lista pedidos com status (reusa o componente de lista já integrado); dados pessoais/endereço editáveis ficam para v2.
4. **Checkout já loga** — quem finaliza um pedido sai da confirmação **com sessão criada**; com sessão ativa, o checkout pula/pré-preenche "Seus dados".
5. **Sair** — botão na área limpa a sessão (o carrinho é preservado).
6. **Sessão de 24 horas (E5)** com renovação a cada acesso.
7. **Login fácil no menu (E6)** — botão "Entrar" sempre visível no header da vitrine quando deslogado.

## 4. Escopo

### ✅ Dentro da v1
- Tela `/loja/:slug/entrar` (login por telefone com máscara + validação zod).
- Área `/loja/:slug/conta` com guarda: sem sessão → redirect para `/entrar`; com sessão → lista de pedidos (status via `mapStatusVenda`).
- Sessão localStorage `uniq_loja_sessao_<slug>` (telefone, clienteId, expiraEm 30 dias, renovação sliding).
- Auto-login no checkout (sessão criada no sucesso do pedido).
- Botão "Entrar" / "Meus pedidos" no header da vitrine conforme estado da sessão.
- `/loja/:slug/pedidos` passa a redirecionar para `/conta` (link antigo continua funcionando).
- Botão "Sair" na área.

### ❌ Fora de escopo (v1)
- **OTP via WhatsApp** — registrado como **evolução obrigatória antes de cliente real** (ver §6).
- Dados pessoais/endereço editáveis na área.
- Magic link; sessão global multi-loja; push/notificações.

## 5. Decisões (resolvidas em 15/09/2026)

| # | Decisão | Resolução |
|---|---|---|
| E1 | Verificação de identidade | ✅ **Telefone puro na semana de testes.** OTP via WhatsApp (código de 6 dígitos pela Evolution/n8n) registrado como evolução obrigatória antes de cliente real — ver §6. |
| E2 | Conteúdo da área | ✅ **Só pedidos** (lista com status). |
| E3 | Escopo da sessão | ✅ **Por loja** — chave localStorage inclui o slug; lookup sempre por `(empresa_id, telefone)`. |
| E4 | Onde o login acontece | ✅ **Navegação sempre livre** — vitrine, produto e sacola nunca pedem login. A identificação acontece **só no checkout** (telefone de "Seus dados" é o login) e em `/entrar` para acessar "Meus pedidos". Com sessão ativa, o checkout pula/pré-preenche "Seus dados". |
| E5 | Duração da sessão | ✅ **24 horas** (sliding — renova a cada acesso). Substitui os 30 dias originais. |
| E6 | Porta de entrada deslogado | ✅ **Botão "Entrar" sempre visível no header/menu da vitrine** quando deslogado (com sessão vira "Meus pedidos"). Navegar nunca exige login. |

## 6. Roadmap registrado: OTP via WhatsApp (v2, obrigatório antes de cliente real)

> **Não implementar agora. Registrado para não se perder.**

- Tabela nova `loja_login_otp` (id, empresa_id, telefone, codigo, expira_em, usado_em, tentativas).
- Fluxo: `/entrar` digita telefone → banco gera código (expira em 10 min, máx. 3 tentativas) → n8n/Evolution envia no WhatsApp → cliente digita o código → sessão criada.
- Função `SECURITY DEFINER` para emitir/validar código (fecha o gap do anon key junto com a pendência P5 da vitrine).
- Vinculado às pendências **P3 (LGPD)** e **P5 (RLS)** do TRACKING.

## 7. Stakeholders

- **Cliente final da Doceê:** entra com o telefone e acompanha pedidos.
- **Esposa (Doceê):** clientes autosservem o acompanhamento — menos "cadê meu pedido?" no WhatsApp.
- **Fundador:** valida pelo celular (Vercel).

## 8. Critérios de aceite

| # | Critério | Como validar |
|---|---|---|
| 1 | Login com telefone de cliente existente cria sessão e mostra os pedidos dele | `/loja/docee/entrar` com telefone de cliente real |
| 2 | Telefone sem cadastro na loja → "Nenhum cadastro encontrado" + CTA p/ vitrine | Telefone novo |
| 3 | Sessão é por loja: logado na Doceê, `/loja/grafica-hq-968/conta` pede login de novo | Trocar de slug |
| 4 | Checkout cria sessão automaticamente; "Ver meus pedidos" abre a área logada | Pedido de teste |
| 5 | Header da vitrine mostra "Entrar" deslogado e "Meus pedidos" logado | Alternar estados |
| 6 | "Sair" limpa a sessão e volta ao estado deslogado (carrinho preservado) | Botão Sair |
| 7 | `/loja/:slug/pedidos` redireciona para `/conta` | Link antigo |
| 8 | Sessão persiste ao recarregar (30 dias, renovação a cada acesso) | F5 e reabrir |
| 9 | Banco indisponível → erro amigável com WhatsApp da loja (nunca mock) | Simular falha |
| 10 | Mobile: fluxo completo em ~360px sem quebra | Validar no celular |

## 9. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Telefone puro expõe pedidos/endereço de terceiros | **Aceito só na semana de testes** (laboratório); OTP via WhatsApp é evolução obrigatória antes de cliente real (§6); LGPD P3 |
| Sessão em localStorage pode ser copiada | Sem dados sensíveis na sessão (só telefone + clienteId); pedidos lidos sempre do banco |
| Telefone cadastrado em outra loja não "entra" | É o comportamento desejado (E3): mensagem orienta a fazer o primeiro pedido naquela loja |
| Cliente troca de número | Cadastro novo no próximo pedido; esposa pode mesclar no CRM se necessário |

---

*Criado em 15/09/2026. Próximo passo do pipeline SDD: SPEC (`tracking/specs/SPEC-LojaVirtual-AreaCliente.md`) → WIRE → aprovação → implementação.*
