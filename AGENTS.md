# AGENTS.md — UNIQ Empresas

> Instruções para agentes de AI que trabalharem neste projeto. Leia antes de executar qualquer tarefa.

---

## 🧠 Sobre o Projeto

A UNIQ é uma **Consultoria de Transformação Digital com IA** para microempresas de Suzano/Alto Tietê, no modelo **Done-For-You (DFY)** — o cliente não toca em tecnologia.

O produto é entregue através da **Base UNIQ** (plataforma multi-tenant) operada pela **Melissa** (Parceiro Digital/IA). A Base UNIQ é *container, não produto* — o cliente compra consultoria, a plataforma é onde ela acontece.

**Princípio central:** transformar microempresas de Suzano em operações digitais que funcionam 24h.

---

## 📦 Metodologia Obrigatória: SDD

Este projeto segue **Specification-Driven Development**. O pipeline é obrigatório para toda funcionalidade/tela nova:

```
Research → PRD → SPEC → WIRE → Implementação
```

| Documento | Pasta | Conteúdo |
|-----------|-------|----------|
| **PRD** | `tracking/plans/` | Porquê e o quê: objetivo de negócio, escopo, stakeholders |
| **SPEC** | `tracking/specs/` | Como técnico: tipos, estrutura de arquivos, componentes, hooks, mock data, validações |
| **WIRE** | `tracking/wireframe/` | Como se parece: wireframe ASCII por tela (layout, componentes, campos, ações, estados) |

> ⚠️ **REGRA DE OURO: sem WIRE aprovado, não escreva código de tela.** Não há exceções.

**Templates de referência:** `tracking/modelos/` (PRD, SPEC e WIRE de sprints anteriores).
**Guia completo:** `tracking/TRACKING_GUIDE.md`.

---

## 📚 Contexto que Você Deve Ler

Antes de executar qualquer tarefa, consulte na seguinte ordem:

1. **`tracking/CONTEXTO_PROJETO.md`** — memória de longo prazo: negócio, personas, Melissa, Base UNIQ, regras importantes. **É a fonte da verdade do projeto.**
2. **`tracking/TRACKING.md`** — estado atual da sprint (o que está em progresso, o que falta).
3. **PRD/SPEC/WIRE da tarefa** — os 3 documentos são o contrato da implementação.

---

## 🏗️ Stack e Convenções

- **Framework:** Next.js 14+ (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Formulários:** react-hook-form + zod + @hookform/resolvers
- **Ícones:** lucide-react
- **Datas:** date-fns
- **Idioma do projeto:** português (nomes de domínio, labels, mensagens de usuário)

### Padrão de estrutura por módulo (seguir rigorosamente)

Seguir o padrão dos módulos existentes (`app/servicos/`, `app/fornecedores/`):

```
app/
├── <modulo>/
│   ├── page.tsx                  # Listagem
│   ├── novo/page.tsx             # Cadastro
│   └── [id]/editar/page.tsx      # Edição
├── components/<modulo>/          # Componentes do módulo
├── hooks/                        # Hooks customizados (use-<nome>.ts)
├── types/                        # Tipos TypeScript por domínio
└── lib/
    ├── mock/                     # Mock data (frontend-only)
    └── utils/                    # Máscaras e validadores
```

### Regras de implementação

- **Frontend-first:** sprints atuais são UI + mock data; backend/API vem em sprints futuras — nunca invente chamadas de API.
- **Estados visuais sempre:** toda tela/lista precisa de loading (skeleton), empty, error e success.
- **Validação:** zod schemas em `lib/utils/validators.ts`; máscaras em `lib/utils/masks.ts`.
- **Responsividade:** grid 3 colunas (desktop) → 2 (tablet) → 1 (mobile).
- **Acessibilidade:** keyboard navigation, ARIA labels, focus management.
- **Mock data realista:** nomes, CNPJs, telefones e endereços brasileiros plausíveis.

---

## 📋 Tracking — Atualização Obrigatória

- Toda tarefa implementada deve ser marcada como ✅ CONCLUÍDO em `tracking/TRACKING.md`.
- Checklist do SPEC deve estar 100% verificado antes de concluir.
- Em caso de bloqueio, marque 🚫 BLOQUEADO com a razão.
- Ao fim da sprint, o conteúdo do TRACKING.md vai para `tracking/tracking_arq/TRACKING_Sprint_XX.md`.

---

## ✅ Decisões Consolidadas (07/09/2026)

Estas decisões estão **fechadas** e devem ser respeitadas por todos os agentes:

- **Pricing (Fase 1 — co-fundadores):** o contrato mostra o preço de tabela (setup **R$ 1.500** + **R$ 297/mês**) e concede **isenção do setup + R$ 197/mês** como condição de co-fundador, em troca de uso real + feedback + depoimento. Fallback R$ 107/mês só em emergência. **Setup R$ 1.500 é hipótese de trabalho** — o mercado valida nas primeiras 3–5 propostas.
- **Data de faturamento:** dia **5, 15 ou 25** à escolha do cliente; **padrão dia 5**. Cobrança inicia após a entrega do MVP.
- **Exit Safe:** saída do CLT no **fim de março/2027**, com reserva para **18 meses** sem retirar dinheiro da UNIQ. Lançamento oficial em **julho/2027**. Metas numéricas de MRR são **referência, não gatilho**.
- **Fases:** 1 Fundação Silenciosa (Set–Dez/2026) · 2 Prova Social (Jan–Mar/2027) · 3 Transição (Abr–Jun/2027) · 4 Lançamento (Jul/2027+).
- **Co-fundadores:** **4 na Fase 1**, em **ondas de 4 + 4** com pausa de productização entre elas.
- **Identidade:** **`DESIGN.md` (raiz do projeto) é a fonte oficial** de paleta, tipografia e layout. Em conflito de tokens, vale ele.
- **Processo visual:** no repositório entrega-se **wireframe — estrutura e função**. O **design real é criado no OpenDesign**. Não tentar polir visual em código.
- **Arquitetura de módulos:** **default + vertical** (ex.: `CRM` → `CRM_OTICA`). Vertical só se for replicável para 2–3 negócios do nicho.
- **Dogfooding:** a UNIQ opera a si mesma na Base UNIQ (CRM, Financeiro e demais).
- **Validação mobile:** todo commit precisa subir no **GitHub** e publicar na **Vercel** — o fundador valida pelo celular durante o dia.

---

## ⚠️ Ainda em aberto (confirmar com o dono do projeto antes de assumir)

- **Setup de tabela:** R$ 1.500 como **hipótese de trabalho** (regra de validação: primeiras 3–5 propostas definem se sobe, desce ou mantém).
- **Funil de aquisição:** Landing Page + botão "Falar com a MEL" → **chat na landing (entrada) + WhatsApp capturado cedo** → SPIN Selling → documento de necessidades derivado da conversa inteira → retorno humano do fundador. Ver `tracking/CONTEXTO_PROJETO.md` → "Funil de Aquisição". **O funil não entra no ar antes da cadeia de demonstração funcionar.**
- **Pitch oficial:** *"A UNIQ faz entrar mais dinheiro e mostra para onde o seu está saindo. Isso é margem."* (Vender 2 pilares — faturamento e custos — prometer o 3º — transformação — como visão.)
- **Controle de entrega:** usar **CRM + Agenda**. Não construir módulo de gestão de entregas.
- **Lacunas do `DESIGN.md` (restantes):** Voice & Tone e Imagery vazios; seções Tone/Messaging pillars duplicadas; Posture rules vazio. *(Verde petróleo já removido em 07/09/2026.)*
- **GitHub + Vercel** já estão configurados?
- **Número de WhatsApp** que será usado no laboratório (HQ Gráfica / Doceê).
- **LGPD** para armazenamento de conversas e dados de clientes.

---

*Última atualização: 07/09/2026 — v1.1*
