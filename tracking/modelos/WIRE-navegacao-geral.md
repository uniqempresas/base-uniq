# Arquitetura de Navegação - Goal Planner

Este documento apresenta a arquitetura completa de navegação do sistema Goal Planner, organizando todas as rotas da aplicação em uma estrutura hierárquica coerente. A definição abrange desde as páginas públicas de autenticação até os módulos internos protegidos, garantindo uma visão consolidada do fluxo de usuários e da estrutura de roteamento da aplicação.

A arquitetura foi planejada para suportar a escalabilidade do projeto, permitindo que cada módulo funcione de forma independente enquanto mantém uma experiência de navegação consistente. Cada rota segue convenções RESTful claras, utilizando parâmetros de URL para identificação de recursos específicos e mantendo uma correspondência direta entre a estrutura de diretórios e os componentes React associados.

---

## 1. Diagrama Hierárquico de Rotas

O diagrama a seguir apresenta a visão completa da árvore de navegação do aplicativo, organizadas por módulos funcionais. Cada nível hierárquico representa um agrupamento lógico de rotas que compartilham contexto ou funcionalidade comum.

```
goal-planner/
├── 🌐 ROTAS PÚBLICAS
│   ├── /                          → Landing Page (pública)
│   ├── /login                     → Página de login
│   ├── /register                  → Página de cadastro
│   └── /forgot-password           → Recuperação de senha
│
├── 🔐 ÁREA AUTENTICADA (Require Auth)
│   ├── /dashboard                 → Dashboard principal
│   │
│   ├── 📂 MÓDULO: ÁREAS DE VIDA
│   │   ├── /areas                 → Lista de áreas
│   │   ├── /areas/:id             → Detalhes de uma área
│   │   └── /areas/:id/edit        → Edição de área
│   │
│   ├── 📂 MÓDULO: METAS HIERÁRQUICAS
│   │   ├── /metas
│   │   │
│   │   ├── /metas/grandes         → Grandes Metas (visão)
│   │   ├── /metas/grandes/criar   → Criar Grande Meta
│   │   ├── /metas/grandes/:id     → Detalhes da Grande Meta
│   │   └── /metas/grandes/:id/editar → Editar Grande Meta
│   │
│   │   ├── /metas/anual           → Metas Anuais (visão)
│   │   ├── /metas/anual/criar     → Criar Meta Anual
│   │   ├── /metas/anual/:id       → Detalhes da Meta Anual
│   │   └── /metas/anual/:id/editar → Editar Meta Anual
│   │
│   │   ├── /metas/mensal          → Metas Mensais (visão)
│   │   ├── /metas/mensal/criar    → Criar Meta Mensal
│   │   ├── /metas/mensal/:id      → Detalhes da Meta Mensal
│   │   └── /metas/mensal/:id/editar → Editar Meta Mensal
│   │
│   │   ├── /metas/semanal         → Metas Semanais (visão)
│   │   ├── /metas/semanal/criar   → Criar Meta Semanal
│   │   ├── /metas/semanal/:id     → Detalhes da Meta Semanal
│   │   └── /metas/semanal/:id/editar → Editar Meta Semanal
│   │
│   │   └── /metas/diaria          → Metas Diárias (visão)
│   │       ├── /metas/diaria/criar    → Criar Meta Diária
│   │       ├── /metas/diaria/:id      → Detalhes da Meta Diária
│   │       └── /metas/diaria/:id/editar → Editar Meta Diária
│   │
│   ├── 📂 MÓDULO: AGENDA
│   │   ├── /agenda
│   │   │
│   │   ├── /agenda/hoje           → Vista do dia atual
│   │   ├── /agenda/semana         → Vista semanal
│   │   │
│   │   ├── /agenda/tarefas
│   │   ├── /agenda/tarefas/criar  → Criar nova tarefa
│   │   └── /agenda/tarefas/:id/editar → Editar tarefa
│   │
│   ├── 📂 MÓDULO: TEMPLATES
│   │   └── /templates/:id          → Template específico
│   │
│   ├── 📂 MÓDULO: REVISÕES
│   │   ├── /revisoes
│   │   │
│   │   ├── /revisoes/semanal      → Revisão semanal
│   │   └── /revisoes/mensal       → Revisão mensal
│   │
│   ├── 📂 MÓDULO: CONQUISTAS
│   │   └── /conquistas            → Lista de conquistas
│   │
│   └── 📂 MÓDULO: CONFIGURAÇÕES
│       └── /configuracoes
│           ├── /configuracoes/perfil        → Edição de perfil
│           ├── /configuracoes/seguranca     → Configurações de segurança
│           ├── /configuracoes/geral         → Configurações gerais
│           └── /configuracoes/notificacoes  → Configurações de notificações
```

---

## 2. Tabela de Rotas

A tabela a seguir consolida todas as rotas do sistema, indicando o método HTTP esperado (para APIs), a rota exata, uma descrição funcional e o componente React responsável pela renderização. Esta tabela serve como referência rápida durante o desenvolvimento e debugging.

| Método | Rota | Descrição | Componente |
|--------|------|-----------|------------|
| **MÓDULO: AUTENTICAÇÃO** | | | |
| GET | `/` | Landing page pública com informações do produto | `LandingPage` |
| GET | `/login` | Formulário de autenticação | `LoginPage` |
| GET | `/register` | Formulário de cadastro de novo usuário | `RegisterPage` |
| GET | `/forgot-password` | Recuperação de senha | `ForgotPasswordPage` |
| **MÓDULO: DASHBOARD** | | | |
| GET | `/dashboard` | Dashboard principal após login | `DashboardPage` |
| **MÓDULO: ÁREAS DE VIDA** | | | |
| GET | `/areas` | Lista de todas as áreas de vida | `AreasListPage` |
| GET | `/areas/:id` | Detalhes de uma área específica | `AreaDetailPage` |
| GET | `/areas/:id/edit` | Formulário de edição de área | `AreaEditPage` |
| **MÓDULO: METAS HIERÁRQUICAS** | | | |
| GET | `/metas` | Redirecionamento para /metas/grandes | `MetasIndexPage` |
| GET | `/metas/grandes` | Lista de grandes metas (objetivos de vida) | `GrandesMetasPage` |
| GET | `/metas/grandes/criar` | Criar nova grande meta | `CriarGrandeMetaPage` |
| GET | `/metas/grandes/:id` | Detalhes da grande meta | `GrandeMetaDetailPage` |
| GET | `/metas/grandes/:id/editar` | Editar grande meta | `EditarGrandeMetaPage` |
| GET | `/metas/anual` | Lista de metas anuais | `MetasAnuaisPage` |
| GET | `/metas/anual/criar` | Criar nova meta anual | `CriarMetaAnualPage` |
| GET | `/metas/anual/:id` | Detalhes da meta anual | `MetaAnualDetailPage` |
| GET | `/metas/anual/:id/editar` | Editar meta anual | `EditarMetaAnualPage` |
| GET | `/metas/mensal` | Lista de metas mensais | `MetasMensaisPage` |
| GET | `/metas/mensal/criar` | Criar nova meta mensal | `CriarMetaMensalPage` |
| GET | `/metas/mensal/:id` | Detalhes da meta mensal | `MetaMensalDetailPage` |
| GET | `/metas/mensal/:id/editar` | Editar meta mensal | `EditarMetaMensalPage` |
| GET | `/metas/semanal` | Lista de metas semanais | `MetasSemanaisPage` |
| GET | `/metas/semanal/criar` | Criar nova meta semanal | `CriarMetaSemanalPage` |
| GET | `/metas/semanal/:id` | Detalhes da meta semanal | `MetaSemanalDetailPage` |
| GET | `/metas/semanal/:id/editar` | Editar meta semanal | `EditarMetaSemanalPage` |
| GET | `/metas/diaria` | Lista de metas diárias | `MetasDiariasPage` |
| GET | `/metas/diaria/criar` | Criar nova meta diária | `CriarMetaDiariaPage` |
| GET | `/metas/diaria/:id` | Detalhes da meta diária | `MetaDiariaDetailPage` |
| GET | `/metas/diaria/:id/editar` | Editar meta diária | `EditarMetaDiariaPage` |
| **MÓDULO: AGENDA** | | | |
| GET | `/agenda` | Redirecionamento para /agenda/hoje | `AgendaIndexPage` |
| GET | `/agenda/hoje` | Tarefas e eventos do dia atual | `AgendaHojePage` |
| GET | `/agenda/semana` | Vista semanal de tarefas | `AgendaSemanaPage` |
| GET | `/agenda/tarefas/criar` | Criar nova tarefa | `CriarTarefaPage` |
| GET | `/agenda/tarefas/:id/editar` | Editar tarefa existente | `EditarTarefaPage` |
| **MÓDULO: TEMPLATES** | | | |
| GET | `/templates` | Lista de templates disponíveis | `TemplatesListPage` |
| GET | `/templates/:id` | Visualização de template específico | `TemplateDetailPage` |
| **MÓDULO: REVISÕES** | | | |
| GET | `/revisoes` | Redirecionamento para /revisoes/semanal | `RevisoesIndexPage` |
| GET | `/revisoes/semanal` | Página de revisão semanal | `RevisaoSemanalPage` |
| GET | `/revisoes/mensal` | Página de revisão mensal | `RevisaoMensalPage` |
| **MÓDULO: CONQUISTAS** | | | |
| GET | `/conquistas` | Lista de conquistas e badges | `ConquistasPage` |
| **MÓDULO: CONFIGURAÇÕES** | | | |
| GET | `/configuracoes` | Redirecionamento para /configuracoes/perfil | `ConfiguracoesIndexPage` |
| GET | `/configuracoes/perfil` | Edição de perfil do usuário | `ConfiguracoesPerfilPage` |
| GET | `/configuracoes/seguranca` | Configurações de segurança | `ConfiguracoesSegurancaPage` |
| GET | `/configuracoes/geral` | Configurações gerais do app | `ConfiguracoesGeralPage` |
| GET | `/configuracoes/notificacoes` | Configurações de notificações | `ConfiguracoesNotificacoesPage` |

---

## 3. Fluxo de Navegação Principal

O fluxo de navegação representa o caminho típico que um usuário segue ao utilizar a aplicação, desde o primeiro acesso até as operações mais avançadas. Este fluxo é guiado por autenticação e redirecionamento automático baseado no estado de login do usuário.

### 3.1 Fluxo de Primeiro Acesso

```
┌─────────────────┐
│   Acessa /     │ ──► Landing Page pública
└────────┬────────┘
         │
    ┌────▼────────────┐
    │ Clica em        │
    │ "Entrar"        │
    └────┬────────────┘
         │
    ┌────▼────────┐
    │ /login      │ ◄── Formulário de autenticação
    └────┬────────┘
         │
    ┌────▼────────────┐     ┌─────────────────┐
    │ Autenticação   │ ──► │ Credenciais     │
    │ bem-sucedida    │     │ inválidas       │
    └────┬────────────┘     └────────┬────────┘
         │                              │
    ┌────▼────────┐                   │
    │ /dashboard  │ ◄── Retorna erro  │
    └─────────────┘ ───────────────────┘
```

### 3.2 Fluxo Completo de Navegação

```
/login ou /register
        │
        ▼ (após autenticação bem-sucedida)
/dashboard
        │
        ├────────────────────────────────────────────┐
        │                                            │
        ▼                                            ▼
   /areas                                       /metas
        │                                            │
        ├─ /areas/:id                            ├─ /metas/grandes
        └─ /areas/:id/edit                       ├─ /metas/anual
                                                   ├─ /metas/mensal
                                                   ├─ /metas/semanal
                                                   └─ /metas/diaria
        │
        ▼
   /agenda
        │
        ├─ /agenda/hoje
        ├─ /agenda/semana
        └─ /agenda/tarefas/*

        │
        ▼
   /templates
        │
        └─ /templates/:id

        │
        ▼
   /revisoes
        │
        ├─ /revisoes/semanal
        └─ /revisoes/mensal

        │
        ▼
   /conquistas

        │
        ▼
   /configuracoes
        │
        ├─ /configuracoes/perfil
        ├─ /configuracoes/seguranca
        ├─ /configuracoes/geral
        └─ /configuracoes/notificacoes
```

### 3.3 Navegação Típica do Usuário

1. **Acesso Inicial**: Usuário acessa a Landing Page (`/`) e clica em "Começar" ou "Entrar"
2. **Autenticação**: Realiza login em `/login` ou cria conta em `/register`
3. **Dashboard**: Após login bem-sucedido, é redirecionado para `/dashboard`
4. **Exploração**: A partir do dashboard, navega entre os módulos via menu lateral
5. **Gestão de Metas**: Acessa `/metas` para criar e acompanhar objetivos em diferentes horizontes temporais
6. **Planejamento Diário**: Utiliza `/agenda/hoje` para organizar o dia
7. **Reflexão**: Acessa `/revisoes` para análises periódicas
8. **Configuração**: Finaliza em `/configuracoes` para personalizar a experiência

---

## 4. Rotas Públicas vs. Rotas Protegidas

A separação entre rotas públicas e protegidas é fundamental para a segurança da aplicação. Rotas públicas são acessívels sem autenticação, enquanto rotas protegidas requerem um token de sessão válido.

### 4.1 Rotas Públicas

Rotas que podem ser acessadas sem autenticação. Geralmente utilizadas para marketing, captura de leads e funcionalidades de suporte.

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Landing Page | Anónimo |
| `/login` | Página de login | Anónimo |
| `/register` | Página de cadastro | Anónimo |
| `/forgot-password` | Recuperação de senha | Anónimo |

**Nota**: Após implementado o sistema de autenticação, `/forgot-password` pode necessitar de proteção adicional contra abuse (rate limiting, CAPTCHA).

### 4.2 Rotas Protegidas

Rotas que requerem autenticação. Caso o usuário não esteja autenticado, deve ser redirecionado para `/login` com um parâmetro de retorno (`?redirect=/roda-desejada`).

| Módulo | Rotas | Middleware |
|--------|-------|------------|
| Dashboard | `/dashboard` | `RequireAuth` |
| Áreas | `/areas`, `/areas/:id`, `/areas/:id/edit` | `RequireAuth` |
| Metas | `/metas/**` (todas as sub-rotas) | `RequireAuth` |
| Agenda | `/agenda/**` (todas as sub-rotas) | `RequireAuth` |
| Templates | `/templates`, `/templates/:id` | `RequireAuth` |
| Revisões | `/revisoes/**` (todas as sub-rotas) | `RequireAuth` |
| Conquistas | `/conquistas` | `RequireAuth` |
| Configurações | `/configuracoes/**` (todas as sub-rotas) | `RequireAuth` |

### 4.3 Middleware de Proteção Sugerido

```typescript
// Arquivo: src/middleware/authMiddleware.ts

export const authMiddleware = (req: Request) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return {
      allowed: false,
      redirect: '/login?redirect=' + encodeURIComponent(req.url)
    };
  }
  
  try {
    const user = verifyToken(token);
    return { allowed: true, user };
  } catch {
    return {
      allowed: false,
      redirect: '/login'
    };
  }
};
```

---

## 5. Grupos de Rotas por Módulo

Os módulos abaixo representam as principais áreas funcionais do Goal Planner. Cada módulo possui seu próprio conjunto de rotas, componentes e contexto de estado.

### 5.1 Módulo 1 — Autenticação

**Prefixo**: Nenhum (rotas raiz)

**Responsabilidades**: Gerenciamento de identidade, cadastro, login e recuperação de conta.

| Rota | Componente |
|------|------------|
| `/` | `LandingPage` |
| `/login` | `LoginPage` |
| `/register` | `RegisterPage` |
| `/forgot-password` | `ForgotPasswordPage` |

### 5.2 Módulo 2 — Dashboard

**Prefixo**: `/dashboard`

**Responsabilidades**: Visão geral do progresso, atalhos rápidos, estatísticas resumidas.

| Rota | Componente |
|------|------------|
| `/dashboard` | `DashboardPage` |

### 5.3 Módulo 3 — Áreas de Vida

**Prefixo**: `/areas`

**Responsabilidades**: Organização das áreas principais da vida (Carreira, Saúde, Finanças, etc.).

| Rota | Componente |
|------|------------|
| `/areas` | `AreasListPage` |
| `/areas/:id` | `AreaDetailPage` |
| `/areas/:id/edit` | `AreaEditPage` |

### 5.4 Módulo 4 — Metas Hierárquicas

**Prefixo**: `/metas`

**Responsabilidades**: Sistema de metas em cascata (Grandes Metas → Anual → Mensal → Semanal → Diária).

| Rota | Componente |
|------|------------|
| `/metas` | `MetasIndexPage` |
| `/metas/grandes` | `GrandesMetasPage` |
| `/metas/grandes/criar` | `CriarGrandeMetaPage` |
| `/metas/grandes/:id` | `GrandeMetaDetailPage` |
| `/metas/grandes/:id/editar` | `EditarGrandeMetaPage` |
| `/metas/anual` | `MetasAnuaisPage` |
| `/metas/anual/criar` | `CriarMetaAnualPage` |
| `/metas/anual/:id` | `MetaAnualDetailPage` |
| `/metas/anual/:id/editar` | `EditarMetaAnualPage` |
| `/metas/mensal` | `MetasMensaisPage` |
| `/metas/mensal/criar` | `CriarMetaMensalPage` |
| `/metas/mensal/:id` | `MetaMensalDetailPage` |
| `/metas/mensal/:id/editar` | `EditarMetaMensalPage` |
| `/metas/semanal` | `MetasSemanaisPage` |
| `/metas/semanal/criar` | `CriarMetaSemanalPage` |
| `/metas/semanal/:id` | `MetaSemanalDetailPage` |
| `/metas/semanal/:id/editar` | `EditarMetaSemanalPage` |
| `/metas/diaria` | `MetasDiariasPage` |
| `/metas/diaria/criar` | `CriarMetaDiariaPage` |
| `/metas/diaria/:id` | `MetaDiariaDetailPage` |
| `/metas/diaria/:id/editar` | `EditarMetaDiariaPage` |

### 5.5 Módulo 5 — Agenda

**Prefixo**: `/agenda`

**Responsabilidades**: Planejamento diário e semanal, gerenciamento de tarefas.

| Rota | Componente |
|------|------------|
| `/agenda` | `AgendaIndexPage` |
| `/agenda/hoje` | `AgendaHojePage` |
| `/agenda/semana` | `AgendaSemanaPage` |
| `/agenda/tarefas/criar` | `CriarTarefaPage` |
| `/agenda/tarefas/:id/editar` | `EditarTarefaPage` |

### 5.6 Módulo 6 — Templates

**Prefixo**: `/templates`

**Responsabilidades**: Modelos pré-definidos de metas e rotinas.

| Rota | Componente |
|------|------------|
| `/templates` | `TemplatesListPage` |
| `/templates/:id` | `TemplateDetailPage` |

### 5.7 Módulo 7 — Revisões

**Prefixo**: `/revisoes`

**Responsabilidades**: Análises periódicas de progresso (semanal e mensal).

| Rota | Componente |
|------|------------|
| `/revisoes` | `RevisoesIndexPage` |
| `/revisoes/semanal` | `RevisaoSemanalPage` |
| `/revisoes/mensal` | `RevisaoMensalPage` |

### 5.8 Módulo 8 — Conquistas

**Prefixo**: `/conquistas`

**Responsabilidades**: Sistema de gamificação, badges e recompensas.

| Rota | Componente |
|------|------------|
| `/conquistas` | `ConquistasPage` |

### 5.9 Módulo 9 — Configurações

**Prefixo**: `/configuracoes`

**Responsabilidades**: Personalização da conta, segurança, preferências.

| Rota | Componente |
|------|------------|
| `/configuracoes` | `ConfiguracoesIndexPage` |
| `/configuracoes/perfil` | `ConfiguracoesPerfilPage` |
| `/configuracoes/seguranca` | `ConfiguracoesSegurancaPage` |
| `/configuracoes/geral` | `ConfiguracoesGeralPage` |
| `/configuracoes/notificacoes` | `ConfiguracoesNotificacoesPage` |

---

## 6. Parâmetros de URL

Os parâmetros de URL são utilizados para identificar recursos específicos dentro de cada módulo. A padronização desses parâmetros garante consistência na construção de links e na captura de dados nos componentes.

### 6.1 Parâmetros Utilizados

| Parâmetro | Tipo | Módulo | Descrição | Exemplo |
|-----------|------|--------|-----------|---------|
| `:id` | UUID | Todos | Identificador único do recurso | `/areas/550e8400-e29b-41d4-a716-446655440000` |
| `:id` | UUID | Metas | Identificador da meta (grande, anual, mensal, semanal, diária) | `/metas/grandes/550e8400-e29b-41d4-a716-446655440000` |
| `:id` | UUID | Agenda | Identificador da tarefa | `/agenda/tarefas/550e8400-e29b-41d4-a716-446655440000/editar` |
| `:id` | UUID | Templates | Identificador do template | `/templates/550e8400-e29b-41d4-a716-446655440000` |

### 6.2 Parâmetros de Query (Futuro)

| Parâmetro | Tipo | Módulo | Descrição | Exemplo |
|-----------|------|--------|-----------|---------|
| `redirect` | string | Auth | URL de retorno após login | `/login?redirect=/dashboard` |
| `period` | string | Metas | Período de visualização | `/metas/mensal?period=2024-03` |
| `view` | string | Agenda | Tipo de visualização | `/agenda?view=calendar` |

### 6.3 Boas Práticas para Parâmetros

1. **Sempre utilizar UUIDs** para identificação de recursos — nunca use índices numéricos ou slugs sensíveis.
2. **Validar parâmetros no componente** — o componente deve tratar o caso em que o recurso não existe ou o ID é inválido (página 404).
3. **Prefetch de dados** — utilizar React Query ou Server Components para buscar dados em paralelo com a navegação.

---

## 7. Estrutura de Diretórios Sugerida

A organização física dos arquivos deve refletir a estrutura de rotas, facilitando a manutenção e a navegação no código.

```
src/
├── app/                          # Next.js App Router (ou equivalente)
│   ├── (public)/
│   │   ├── page.tsx             → /
│   │   ├── login/
│   │   │   └── page.tsx        → /login
│   │   ├── register/
│   │   │   └── page.tsx        → /register
│   │   └── forgot-password/
│   │       └── page.tsx        → /forgot-password
│   │
│   ├── (protected)/             # Grupo de rotas autenticadas
│   │   ├── dashboard/
│   │   │   └── page.tsx        → /dashboard
│   │   │
│   │   ├── areas/
│   │   │   ├── page.tsx        → /areas
│   │   │   └── [id]/
│   │   │       ├── page.tsx    → /areas/:id
│   │   │       └── edit/
│   │   │           └── page.tsx → /areas/:id/edit
│   │   │
│   │   ├── metas/
│   │   │   ├── page.tsx        → /metas (redirect)
│   │   │   ├── grandes/
│   │   │   │   ├── page.tsx    → /metas/grandes
│   │   │   │   ├── criar/
│   │   │   │   │   └── page.tsx → /metas/grandes/criar
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx → /metas/grandes/:id
│   │   │   │       └── editar/
│   │   │   │           └── page.tsx → /metas/grandes/:id/editar
│   │   │   ├── anual/
│   │   │   ├── mensal/
│   │   │   ├── semanal/
│   │   │   └── diaria/
│   │   │
│   │   ├── agenda/
│   │   │   ├── page.tsx        → /agenda (redirect)
│   │   │   ├── hoje/
│   │   │   ├── semana/
│   │   │   └── tarefas/
│   │   │       ├── criar/
│   │   │       └── [id]/
│   │   │           └── editar/
│   │   │
│   │   ├── templates/
│   │   │   ├── page.tsx        → /templates
│   │   │   └── [id]/
│   │   │       └── page.tsx    → /templates/:id
│   │   │
│   │   ├── revisoes/
│   │   │   ├── page.tsx        → /revisoes (redirect)
│   │   │   ├── semanal/
│   │   │   └── mensal/
│   │   │
│   │   ├── conquistas/
│   │   │   └── page.tsx        → /conquistas
│   │   │
│   │   └── configuracoes/
│   │       ├── page.tsx        → /configuracoes (redirect)
│   │       ├── perfil/
│   │       ├── seguranca/
│   │       ├── geral/
│   │       └── notificacoes/
│   │
│   ├── layout.tsx              # Root layout
│   └── middleware.ts          # Auth middleware
│
├── components/
│   ├── common/                # Componentes compartilhados
│   ├── layout/                # Header, Sidebar, Footer
│   └── modules/               # Componentes específicos por módulo
│
├── hooks/
│   ├── useAuth.ts
│   └── useNavigation.ts
│
├── lib/
│   ├── router.ts              # Configuração de rotas
│   └── permissions.ts         # Permissões por rota
│
└── types/
    └── routes.ts              # Tipos e interfaces de rotas
```

---

## 8. Considerações Finais

A arquitetura de navegação definida neste Documento serve como referência para a implementação do sistema de rotas do Goal Planner. A estrutura proposta oferece as seguintes vantagens:

1. **Escalabilidade**: Cada módulo pode ser expandido independentemente sem afetar os demais.
2. **Manutenibilidade**: A correspondência direta entre rotas e componentes facilita a localização de código.
3. **Consistência**: O padrão RESTful utilizado para nomenclatura de rotas reduz a curva de aprendizado para novos desenvolvedores.
4. **UX Previsível**: Os usuários podem navegar intuitivamente através de URLs que refletem a estrutura lógica do aplicativo.

Recomenda-se que qualquer nova rota seja adicionada seguindo o padrão estabelecido neste Documento, mantendo a consistência com a estrutura existente.
