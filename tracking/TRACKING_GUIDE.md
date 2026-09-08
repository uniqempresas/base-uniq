# 📖 Guia de Uso - Sistema de Tracking UNIQ

**Versão:** 2.2 (SDD - Wireframe Stage)
**Data:** 07/09/2026

---

## 🎯 Visão Geral

O Sistema de Tracking da UNIQ Empresas foi unificado para trabalhar em harmonia com a metodologia **Vibe Coding**. Ele serve como o "cérebro administrativo" do projeto, enquanto os Agentes Vibe cuidam da execução técnica.

### Estrutura de Arquivos

```
tracking/
├── TRACKING.md          → Dashboard da Sprint Atual (Operacional)
├── TRACKING_Backlog.md  → Backlog Geral (Estratégico)
├── CONTEXTO_PROJETO.md  → Documentação de Contexto (Negócio/Técnico)
├── TRACKING_GUIDE.md    → Este guia
├── modelos/             → Templates de referência (PRD, SPEC, WIRE)
├── plans/               → PRDs da sprint ativa
├── specs/               → SPECs da sprint ativa
├── wireframe/           → WIREs (wireframes) das telas da sprint ativa
└── tracking_arq/        → Histórico de Sprints passadas
```

---

## 📋 TRACKING.md - O Coração da Sprint

Este é o arquivo mais importante. Ele reflete o **estado atual** do desenvolvimento.

### Ciclo de Vida da Sprint

1.  **Planejamento**:
    - Selecione tarefas do `TRACKING_Backlog.md`.
    - Mova para `TRACKING.md`.
    - Defina o Objetivo da Sprint.

2.  **Execução (Vibe Coding)**:
    - Ao usar o agente `/implement`, ele deve consultar este arquivo para saber o status macro.
    - Ao finalizar uma tarefa via agente, atualize o status aqui.

3.  **Fechamento**:
    - Mova o conteúdo concluído para `tracking/tracking_arq/TRACKING_Sprint_XX.md`.
    - Limpe o `TRACKING.md` para a próxima sprint.

### Status das Tarefas
- **🔴 EM PROGRESSO**: O que está sendo codado *agora*.
- **📋 A FAZER**: Próximas tarefas da sprint.
- **✅ CONCLUÍDO**: Finalizado e testado.
- **🚫 BLOQUEADO**: Impedimentos.

---

## 📦 Pipeline SDD: PRD → SPEC → WIRE → Implementação

O projeto segue uma adaptação do **Specification-Driven Development (SDD)**. Nenhuma tela é implementada sem passar por todas as etapas de especificação:

1.  **PRD** (`plans/`) — *O "porquê" e o "o quê"*: objetivo de negócio, escopo da sprint, stakeholders e funcionalidades em alto nível.
2.  **SPEC** (`specs/`) — *O "como" técnico*: tipos TypeScript, estrutura de arquivos, componentes, hooks, mock data, validações e checklist de implementação.
3.  **WIRE** (`wireframe/`) — *O "como se parece"*: wireframe de cada tela antes da "mão na massa".
4.  **Implementação** — só começa quando o PRD + SPEC + WIRE da tela estiverem prontos.

### 📐 Arquivos WIRE (Wireframes)

**Regra de ouro:** toda tela nova precisa de um WIRE antes da implementação. **Sem WIRE, não há "mão na massa".**

-   **Nomenclatura:** `WIRE-modulo-XX-nome-do-modulo.md` (ex: `WIRE-modulo-01-autenticacao.md`) ou `WIRE-nome-descritivo.md` para documentos transversais (ex: `WIRE-navegacao-geral.md`).
-   **Localização:** `tracking/wireframe/` durante a sprint ativa.
-   **Templates de referência:** `tracking/modelos/WIRE-modulo-01-autenticacao.md` (módulo) e `tracking/modelos/WIRE-navegacao-geral.md` (navegação).

**Tipos de WIRE:**
-   **Navegação geral** — um por projeto/escopo maior: árvore de rotas, tabela de rotas, middleware de proteção e parâmetros de URL. Criado *antes* dos módulos.
-   **Módulo** — um por módulo: todas as telas do módulo, com detalhamento completo por tela.

**Estrutura mínima de um WIRE por tela:**
1.  **Rota** — caminho da URL.
2.  **Layout** — wireframe ASCII do posicionamento dos elementos.
3.  **Componentes** — lista dos elementos visuais e seu papel.
4.  **Campos** — tabela com nome, tipo e validação.
5.  **Ações** — o que cada botão/link faz e para onde navega.
6.  **Fluxo de Navegação** — diagrama de saída da tela.
7.  **Estados** — default, loading, error e success.

---

## 🗄️ tracking/tracking_arq/ - Arquivo Morto

Para manter o `TRACKING.md` limpo e leve para os Agentes de AI lerem, **nunca** mantenha histórico antigo nele.

- Ao fim de cada Sprint, crie um arquivo `TRACKING_Sprint_XX.md` nesta pasta.
- Mova todo o conteúdo da Sprint finalizada para lá.
- Mantenha o `TRACKING.md` apenas com o que é relevante *hoje*.

---

## 🔄 Fluxo de Trabalho Integrado

1.  **Analise (`/research`)**: O agente lê `CONTEXTO_PROJETO.md` e o código.
2.  **Planeje (`/spec`)**: O agente cria o PRD (`plans/`) e o SPEC (`specs/`).
3.  **Wireframe**: Crie o WIRE de cada tela (`wireframe/`) antes de implementá-la.
4.  **Atualize**: Adicione a tarefa no `TRACKING.md` como "EM PROGRESSO".
5.  **Implemente (`/implement`)**: O agente executa o código seguindo PRD + SPEC + WIRE.
6.  **Finalize**: Marque como "✅ CONCLUÍDO" no `TRACKING.md`.

---

## 🤖 Orquestração de Agentes

Cada etapa do pipeline SDD é executada por um *lane* especializado, coordenado pelo agente principal (orchestrator):

| Etapa | Lane | Papel |
|-------|------|-------|
| **Research** | `@explorer` | Recon do codebase: padrões existentes, componentes reutilizáveis, hooks, convenções. `@librarian` entra se a sprint envolver API/lib nova. |
| **PRD + SPEC** | Orchestrator | Escreve os documentos com os insumos do recon. Decisões de negócio são do dono do projeto. `@oracle` só em trade-off arquitetural de risco. |
| **WIRE** | `@designer` | Wireframes seguindo o template WIRE (hierarquia visual, estados, responsividade). O copy/texto é revisado pelo orchestrator depois. |
| **Implementação** | `@fixer` | 1 a N fixers com escopo fechado por pasta/módulo, seguindo PRD + SPEC + WIRE como contrato. Nunca improvisam layout. |
| **Verificação** | Orchestrator | Build, checklist do SPEC, atualização do TRACKING.md. Divergência arquitetural → `@oracle`. |

### 🚧 Gates do Orchestrator

- **Sem WIRE, não despacha `@fixer`** — a regra de ouro do SDD é enforcement do orchestrator.
- **TRACKING.md** atualizado a cada transição de status (EM PROGRESSO → CONCLUÍDO).
- **Checklist do SPEC** verificado antes de marcar ✅.
- **Conflito entre lanes** → orchestrator reconcilia. **Incerteza de arquitetura** → escalado para `@oracle`.

### Na prática

*"Vamos fazer o módulo X"* → `@explorer` varre o código em background → orchestrator drafta PRD (`plans/`) + SPEC (`specs/`) → `@designer` cria os WIREs (`wireframe/`) → `@fixer`s implementam em paralelo por escopo → orchestrator verifica e fecha no TRACKING.md.

---

## 📝 Dicas Importantes

- **Mantenha Simples**: Agentes de AI performam melhor com arquivos claros e diretos.
- **Contexto é Rei**: Mantenha `CONTEXTO_PROJETO.md` atualizado com as principais decisões arquiteturais, pois ele serve de "memória de longo prazo" para os agentes.
- **Sem Changelog Manual**: O histórico das Sprints em `tracking_arq` serve como log de alterações.
