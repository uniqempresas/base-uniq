# 📦 TRACKING_Backlog — Backlog Geral (Estratégico)

> Itens **fora da sprint ativa**. O CEO mantém esta lista; o Orchestrator puxa dela no planejamento de cada sprint.
>
> ⚠️ Nada aqui deve ser implementado sem passar pelo pipeline SDD (PRD → SPEC → WIRE).

---

## 🎯 Candidatos a módulo (avaliar na pausa de productização entre ondas)

| Item | Origem | Critério para entrar |
|------|--------|----------------------|
| **Gestão de Entregas** (planejamento de dias por cliente) | Fundador quer controlar a entrega dentro da Base UNIQ | Só vira módulo se CRM + Agenda se mostrarem insuficientes **e** se for vendável para negócios de serviço. Hoje: usar CRM + Agenda. |
| **Trilhas** (desenvolvimento do empreendedor) | Pilar 3 da proposta de valor | 🚫 **Fora do MVP.** Só entra quando houver conteúdo de gestão produzido. É promessa de futuro, não compromisso atual. |
| **Métricas de atendimento da MEL** | Necessidade de provar valor gerado | Entra quando houver volume real de conversas para medir. |

---

## 🤖 Papéis futuros da MEL

| Item | Descrição | Prioridade |
|------|-----------|------------|
| **MEL como suporte do cliente** | MEL disponível dentro da Base UNIQ para o cliente reportar erros e melhorias | Média — excelente para proteger as 16h/semana, mas **não é caminho crítico**. Entra depois que o papel de SDR funcionar. |
| **MEL multicanal (Instagram DM)** | Estender atendimento para Instagram | Baixa — pendente de integração |
| **MEL consultiva** | Enxergar vendas/caixa/canvas do parceiro e dar orientação de negócio | Baixa — Fase 2+ |

---

## 🔌 Integrações pendentes

| Integração | Status | Onde entra |
|------------|--------|------------|
| Supabase ↔ telas da Base UNIQ | 🔴 **Não integrada** — é o gargalo central | CRM, Agenda, Financeiro, Vendas |
| n8n multi-número | 🔴 Roda só no número da UNIQ | Duplicar fluxo + novo agente por cliente |
| Instagram DM | 🔴 Pendente | MEL multicanal |
| Google Agenda / Outlook | 🔴 Pendente | Agenda |
| Mercado Pago / Stripe | 🔴 Pendente | Loja, Marketplace, cobrança de MRR |
| Meta Ads | 🔴 Pendente | Métricas de aquisição — **fora da Fase 1** (sem tráfego pago) |

---

## ⚖️ Jurídico e conformidade

| Item | Risco | Nota |
|------|-------|------|
| **LGPD — captura de dados de leads via chat** | 🔴 Alto | O funil coleta dados estruturados de leads e grava no Supabase. Exige: política de privacidade na landing, consentimento no chat, regra de retenção. |
| **LGPD — armazenamento de conversas de clientes** | 🔴 Alto | Conversas de WhatsApp dos parceiros ficam no Supabase. |
| **Termo de co-fundador** | 🟡 Médio | Precisa conter: preço de tabela, isenção concedida, contrapartida (uso + feedback + depoimento), data de faturamento, prazo. |

---

## 🧹 Débito técnico herdado (do `BACKLOG.md` raiz)

| Item | Nota |
|------|------|
| Criar tela de Integrações (`/configuracoes/integracoes`) | — |
| Criar tela de Notificações (`/configuracoes/notificacoes`) | — |
| Persistir Marketplace em `localStorage` (`useMarketplace`, `useVendedor`) | Módulos não persistem após reload |
| Criar `tsconfig.json` + `tsc --noEmit` na validação contínua | ⚠️ **Atualização 17/09/2026:** o arquivo **já existe localmente mas NÃO está commitado** (untracked, e **não** está no `.gitignore`). O `origin/master` não tem nenhum `tsconfig*.json` — então o gate de `tsc --noEmit` (linha de base: 13 erros) **não é reproduzível a partir de um clone limpo**. Falta **commitar**, não criar. Ver `AJUSTES_17-09-2026.md`. |
| Remover `src/app/components/mel/MelConversaPage.tsx` se seguir sem uso | Arquivo morto |
| Avaliar code-splitting (bundle inicial > 500 kB) | — |
| Conectar dados demonstrativos da MEL aos módulos operacionais | — |
| Unificar nomenclatura de permissões (`servicos`, `services`, `appointments`, `agenda`) | — |

---

## 🛠️ Evoluções do fluxo n8n (atendente_Docee)

| Item | Descrição | Status |
|------|-----------|--------|
| **Numeração determinística dos produtos do cardápio (Solução 2)** | Hoje a numeração do cardápio da MEL é instruída **só no prompt** (Solução 1, implementada em 23/09/2026): a IA numera e resolve "item N" pelo nome. Para garantir 100% de fidelidade em listas longas, converter a tool `Consulta_Produtos` de `supabaseTool` para **toolWorkflow** (mesmo padrão do `docee_grava-pedido`): node Supabase busca produtos → node Code adiciona `numero: 1..N` + mantém `id` por item → prompt manda usar o `id_referencia` no fechamento. Banco continua gravando só o nome/id — o número é referência de conversa. | 🔜 Backlog |
| **Estado do pedido fora da memória de conversa (memória híbrida)** | Prática de mercado (Kore.ai, LangChain/LangGraph, mem0, Cloudflare): a fonte da verdade do pedido **não deve ser a memória da conversa** — o estado transacional vive no banco e é consultado via tool (ex.: tool `docee_status-pedido` lendo `me_venda`), enquanto a memória carrega só o fluxo imediato com **resumo das conversas antigas** (janela + summarization, não transcript bruto). Sessão por dia + janela 20 já aplicadas em 23/09/2026 como paliativo (níveis 1+2); este item é a evolução completa (nível 3) para a MEL lembrar do último pedido do cliente entre dias sem confundir com o atual. | 🔜 Backlog |

---

## 📈 Aquisição e presença digital

| Item | Fase | Nota |
|------|------|------|
| **Landing Page da UNIQ** com CTA "Falar com a MEL" | 🟢 Sprint pós-diagnóstico | Parte do funil. Decisão de canal pendente (B1). |
| **Instagram da UNIQ** (@uniq.empresas) | 🟡 Baixa | Presença mínima, 1 post/semana. **Não é canal de venda** na Fase 1. Primeiro item a ser cortado se o tempo apertar. |
| **Melissa criadora de conteúdo** (YouTube + LinkedIn) | ⚪ **Fase 3+** | Visão do fundador: a Melissa ensina gestão e administração em vídeo, e o conteúdo vira **canal de aquisição** — para além do Alto Tietê. Depende de Trilhas existir e da operação estar madura. Não iniciar antes do lançamento (jul/2027). |
| **Proposta comercial + script de demonstração** | 🟢 Sprint pós-diagnóstico | Depende da cadeia de demonstração funcionando. |
| Parcerias com contabilidade locais | ⚪ Fase 2 | Documentado no plano original. |

---

*Backlog mantido pelo CEO. Última atualização: 23/09/2026.*
