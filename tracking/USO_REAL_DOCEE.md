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
| 7 | 10/09/2026 | Financeiro | Incluir DRE e Fluxo de Caixa nesta fase para a Doceê testar | **Crítica** | ✅ Implementado (commit `77e4a70`, deployed `success` 11/09 09:45) · ⏳ aguardando validação do fundador | [PRD](plans/PRD-Financeiro-DRE-FluxoDeCaixa.md) · [SPEC](specs/SPEC-Financeiro-DRE-FluxoDeCaixa.md) · [WIRE](wireframe/WIRE-UsoReal-DoceE-DRE-FluxoCaixa.md) |

---

## 📊 Resumo

| Métrica | Valor |
|---|---|
| Total de itens | 7 |
| Implementados | 7 |
| Validados pelo fundador | 0 |
| Pendentes de validação | 7 |
| Críticos (bloqueiam uso) | 4 |

---

## 🔄 Fluxo de trabalho

1. **Fundador registra** aqui o que encontrar no uso real (copiar a linha de exemplo acima)
2. **Agente prioriza** e corrige em sessão dedicada
3. **Fundador valida** a correção e marca ✅

---

*Atualizado em: 11/09/2026 — itens 1–7 implementados e deployed; aguardando validação do fundador pelo celular (Vercel).*
