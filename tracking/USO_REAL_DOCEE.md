# 🏪 Uso Real — Doceê (HQ Gráfica)

> **Registro de tudo que for anotado durante a utilização ponta a ponta pela Doceê.**
> Cada item é uma correção ou melhoria identificada no uso real. O fundador registra, o agente corrige.

**Negócio:** Doceê / HQ Gráfica
**Canal WhatsApp:** `5511919153508`
**Supabase oficial:** `krrkfgvdwhpelxtrdtla.supabase.co`
**Data de início:** 10/09/2026

---

## 📝 Itens registrados

| # | Data | Fluxo / Tela | Problema ou observação | Prioridade | Status | Documentos |
|---|---|---|---|---|---|---|
| 1 | 10/09/2026 | Cadastro (criar conta) | Dados de exemplo na tela de cadastro são dados reais — precisa ser corrigido | Alta | ⏳ PRD/SPEC pronto | [PRD](plans/PRD-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) · [SPEC](specs/SPEC-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) |
| 2 | 10/09/2026 | Dashboard (pós-login) | Nome do usuário não apareceu ao cadastrar e logar — apareceu apenas "Boa noite, Usuário" em vez do nome real | Média | ⏳ PRD/SPEC pronto | [PRD](plans/PRD-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) · [SPEC](specs/SPEC-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) |
| 3 | 10/09/2026 | Dashboard / Pedidos | Criou empresa nova (Doceê) mas estão aparecendo pedidos de outra empresa — o app não reconheceu o login com outra empresa | **Crítica** | ⏳ PRD/SPEC pronto | [PRD](plans/PRD-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) · [SPEC](specs/SPEC-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) |
| 4 | 10/09/2026 | Produtos | Criou empresa nova mas estão aparecendo produtos que são de outra empresa | **Crítica** | ⏳ PRD/SPEC pronto | [PRD](plans/PRD-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) · [SPEC](specs/SPEC-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) |
| 5 | 10/09/2026 | Configurações | Está mostrando dados mockados — deveria mostrar dados reais da empresa | Alta | ⏳ PRD/SPEC pronto | [PRD](plans/PRD-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) · [SPEC](specs/SPEC-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) |
| 6 | 10/09/2026 | Financeiro (Contas a pagar / receber) | Estão mostrando dados de outra empresa em vez da empresa logada | **Crítica** | ⏳ PRD/SPEC pronto | [PRD](plans/PRD-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) · [SPEC](specs/SPEC-UsoReal-DoceE-Hotfix-IsolamentoTenant.md) |
| 7 | 10/09/2026 | Financeiro | Incluir DRE e Fluxo de Caixa nesta fase para a Doceê testar | **Crítica** | ✅ DRE validado pelo fundador (11/09, "ficou perfeito"); Fluxo de Caixa aguarda uso real | [PRD](plans/PRD-Financeiro-DRE-FluxoDeCaixa.md) · [SPEC](specs/SPEC-Financeiro-DRE-FluxoDeCaixa.md) · [WIRE](wireframe/WIRE-UsoReal-DoceE-DRE-FluxoCaixa.md) |
| 8 | 11/09/2026 | Dashboard (mobile) | Big numbers (cards KPI "Faturamento hoje R$ 1.250" etc.) ocupam espaço demais na tela do celular — precisa ajuste responsivo. Dados mockados podem continuar por hora | Média | 📝 Anotado — p/ correção futura (sem PRD/SPEC/WIRE ainda) | — |
| 9 | 11/09/2026 | Dashboard (header) | Botão "+" na linha do nome de usuário = "Nova Venda" (placeholder). No mobile mostra só o ícone (`hidden sm:inline`) e hoje **não faz nada** — `setShowQuickSale(true)` seta um estado que nenhuma parte do componente lê. Botão "Venda rápida" do Acesso Rápido também é inerte | Média | 📝 Anotado — p/ correção futura | — |
| 10 | 11/09/2026 | Menu lateral (mobile) | "Visão Geral" aparece 2× + "Dashboard Hub" — todos idênticos (levam ao mesmo dashboard). **Refinamento do fundador:** eliminar as duplicadas e manter **"Minha Empresa" como item pai expansível** com **"Visão Geral" como sub-item dentro** (leva ao Dashboard). Motivo: se "Minha Empresa" navegar pro dashboard toda vez que for clicado, fica impossível chegar direto em "Cadastros" (sempre passando pelo dash). | Média | 📝 Anotado — p/ correção futura | — |
| 11 | 11/09/2026 | Menu lateral (mobile) | **"Vendas & PDV" dentro de "Minha Empresa" está no lugar errado** — remover dali, pois o módulo **PDV & Vendas permanece na barra lateral** (ele não sai da aplicação, só não deve ficar aninhado dentro de "Minha Empresa") | Média | 📝 Anotado — p/ correção futura | — |
| 12 | 11/09/2026 | CRM — Novo Cliente | O modal "Novo Cliente" **não persiste nada**: `handleSubmit` simula 1,2s e fecha (toast-only). O formulário escolhe tags (fixas `TAG_OPTIONS`) mas nada é gravado em `crm_leads`/`me_cliente` — que também **não têm coluna de tags**. Grave para essa feature ganhar sentido. | **Crítica** | 📝 Anotado — corrigir junto com a tela de Configurações do CRM | — |

---

## 📊 Resumo

| Métrica | Valor |
|---|---|
| Total de itens | 12 |
| Implementados | 7 |
| Anotados (p/ correção futura) | 5 |
| Validados pelo fundador | 1 (item 7 — DRE) |
| Pendentes de validação | 6 |
| Críticos (bloqueiam uso) | 5 |

---

## 🔄 Fluxo de trabalho

1. **Fundador registra** aqui o que encontrar no uso real (copiar a linha de exemplo acima)
2. **Agente prioriza** e corrige em sessão dedicada
3. **Fundador valida** a correção e marca ✅

---

*Atualizado em: 11/09/2026 — itens 1–7 implementados e deployed; DRE validado pelo fundador (item 7). Fundador validando pelo celular (Vercel): itens 8–11 anotados de uso real (11/09), aguardando decisão/correção.*
