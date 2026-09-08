# 📋 PRD - Sprint 09: Módulo Colaboradores 👥

---

## 1. Visão Geral da Sprint

### 1.1 Contexto do Projeto

O **UNIQ Empresas** é uma plataforma SaaS modular que combina Consultoria de Growth + Ferramentas de Gestão + Métricas para pequenos e médios empreendedores. O público-alvo é o **"Empreendedor na Correria"** - microempresários com 1-3 funcionários que precisam de praticidade, não de complexidade.

### 1.2 Objetivo Desta Sprint

A **SPRINT_09** tem como objetivo desenvolver a **interface completa de gestão de colaboradores e permissões**, permitindo que o dono da empresa gerencie membros da equipe e seus níveis de acesso dentro da plataforma UNIQ.

### 1.3 Escopo da Sprint

**✅ Incluído nesta Sprint:**
- Lista de Colaboradores (visualização em cards e tabela)
- Cadastro de novo colaborador (modal ou página)
- Gestão de permissões granulares (matriz de permissões por módulo)
- Sistema de convites por email
- Badges e status visuais (ativo, inativo, pendente)
- Filtros e busca de colaboradores
- Toggle de visualização (cards/tabela)
- Empty states e skeletons
- Responsividade mobile-first

**❌ NÃO Incluído nesta Sprint:**
- Integração real com backend/Supabase
- Sistema de autenticação de novos colaboradores
- Envio real de emails de convite
- Logging de alterações de permissões
- Sistema de múltiplas empresas (multi-tenant real)
- Funcionalidades de chat/feedback

### 1.4 Stack Tecnológica

| Camada | Tecnologia | Versão | Uso |
|--------|------------|--------|-----|
| Framework | React | 19.x | Componentes funcionais |
| Linguagem | TypeScript | 5.x | Tipagem estática |
| Build | Vite | 5.x | Build tool |
| Estilização | Tailwind CSS | 3.4.x | Utility-first CSS |
| Componentes | Radix UI / shadcn/ui | v4 | Design System base |
| Ícones | Lucide React | latest | Ícones consistentes |
| Gerenciamento de Estado | React Hooks | - | Estado local |

### 1.5 Público-Alvo para este Módulo

| Persona | Necessidade | Solução |
|---------|-------------|---------|
| **Dono da Empresa** | Gerenciar equipe de 1-5 pessoas | Interface admin para CRUD completo |
| **Gerente** | Ter permissões de gestão | Sistema de papéis flexível |
| **Vendedor/Operador** | Acessar apenas o necessário | Permissões granulares por módulo |

---

## 2. Problema

### 2.1 Dor do Usuário

O **Empreendedor na Correria** que possui funcionários precisa:

- **Delegar tarefas** sem precisar fazer tudo sozinho
- **Controlar quem acessa** o que dentro do sistema
- **Evitar erros** de colaboradores mexendo onde não devem
- **Manter a segurança** dos dados sensíveis (financeiro, clientes)

No momento, não existe uma interface dedicada para gestão de equipe, o que limita o uso da plataforma para empresas com mais de um funcionário.

### 2.2 Cenário Atual

```
Situação:
- Carlos (dono da ótica) é o único usuário do UNIQ
- Ele quer contratar uma atendente (Maria)
- Maria precisa acessar CRM e Vendas, mas NÃO Financeiro
- Hoje: não há como controlar isso
- Resultado: ou Maria não usa, ou tem acesso total (risco)
```

### 2.3 Por Que Isso Importa

| Métrica | Impacto |
|---------|---------|
| **Adoção** | Empresas com 2-3 funcionários representam 40% do público-alvo |
| **Retenção** | Sem controle de acesso, clientes abandonam por segurança |
| **Upsell** | Empresas maiores = planos mais caros (Business/Pro) |

---

## 3. Solução

### 3.1 Conceito

**"Team Management Simplificado"** - Interface minimalista para gestão de equipe que qualquer empreendedor consegue usar em 2 minutos.

### 3.2 Pilares da Solução

| Pilar | Descrição | Implementação |
|-------|-----------|---------------|
| **Simplicidade** | 3 papéis pré-definidos cobrem 90% dos casos | Owner, Admin, Seller |
| **Flexibilidade** | Permissões granulares para casos especiais | Matriz de toggles |
| **Visual Clarity** | Status e permissões visíveis em segundos | Badges, cores, ícones |
| **Performance** | Interface rápida mesmo com 20+ colaboradores | Virtualização, lazy load |

### 3.3 Arquitetura de Informação

```
📁 Configurações
└── 📁 Colaboradores
    ├── 📋 Lista de Colaboradores (default)
    ├── ➕ Novo Colaborador (modal/página)
    └── 🔐 Permissões (modal/página)
```

### 3.4 Hierarquia de Papéis

```
🏢 Proprietário (Owner)
└── 🔵 Administrador (Admin)
    └── 🟢 Gerente (Manager)
        └── 🟡 Vendedor (Seller)
            └── ⚪ Visualizador (Viewer)
```

---

## 4. Personas

### 4.1 Persona Principal: Carlos (Dono da Ótica)

| Atributo | Detalhe |
|----------|---------|
| **Nome** | Carlos Silva |
| **Idade** | 42 anos |
| **Perfil** | Dono de ótica em Suzano, SP |
| **Equipe** | 1 atendente (Maria) + 1 contador (Pedro) |
| **Dor Principal** | Não quer que Maria veja o financeiro |
| **Comportamento** | Usa WhatsApp o dia todo, pouco tempo para tecnologia |
| **Expectativa** | "Precisa ser simples, não quero ler manual" |

**Jornada de Carlos:**
1. Acessa Configurações → Colaboradores
2. Vê que Maria tem acesso total
3. Clica em "Permissões" de Maria
4. Desabilita Financeiro e Configurações
5. Salva em 30 segundos

### 4.2 Persona Secundária: Maria (Atendente)

| Atributo | Detalhe |
|----------|---------|
| **Nome** | Maria Oliveira |
| **Idade** | 28 anos |
| **Perfil** | Atendente da ótica |
| **Papel Esperado** | Vendedor (CRM + Vendas) |
| **Dor Principal** | Quer saber exatamente o que pode ou não fazer |
| **Expectativa** | Interface clara mostrando suas permissões |

### 4.3 Persona Terciária: Pedro (Contador Externo)

| Atributo | Detalhe |
|----------|---------|
| **Nome** | Pedro Lima |
| **Idade** | 35 anos |
| **Perfil** | Contador externo |
| **Papel Esperado** | Visualizador (apenas ver, não editar) |
| **Acesso Necessário** | Financeiro (ver) |
| **Situação** | Convite pendente de 3 dias |

---

## 5. Funcionalidades

### 5.1 Lista de Colaboradores

**Rota:** `/configuracoes/colaboradores`

#### 5.1.1 Header da Página

| Elemento | Comportamento |
|----------|---------------|
| **Título** | "Colaboradores" com ícone Users |
| **Contador** | Badge "5 de 20" (x de máximo) |
| **Subtítulo** | "Gerencie membros da sua equipe e permissões" |
| **Botão Principal** | "Novo Colaborador" → Abre modal/página |

#### 5.1.2 Barra de Filtros

| Filtro | Tipo | Opções |
|--------|------|--------|
| **Busca** | Input texto | Busca por nome e email |
| **Status** | Select | Todos, Ativos, Inativos, Pendentes |
| **Papel** | Select | Todos, Administrador, Gerente, Vendedor, Visualizador |
| **Visualização** | Toggle | Cards / Tabela (persiste localStorage) |

#### 5.1.3 Visualização em Cards

**Card de Colaborador:**
- Avatar com foto ou iniciais
- Badge de status (verde/amarelo/cinza)
- Nome e email
- Badge de papel (cor por tipo)
- Tags de módulos acessíveis
- Menu dropdown (•••)
- Footer com último acesso

#### 5.1.4 Visualização em Tabela

**Colunas:**
1. Colaborador (avatar + nome + email)
2. Cargo/Função
3. Papel
4. Módulos (badges)
5. Último Acesso
6. Status
7. Ações (dropdown)

#### 5.1.5 Estados da Lista

| Estado | Visualização |
|--------|--------------|
| **Loading** | 6 skeleton cards ou 6 skeleton rows |
| **Vazio** | Ilustração + "Nenhum colaborador" + CTA |
| **Erro** | Toast de erro + botão retry |
| **Sucesso** | Lista de cards ou tabela |

#### 5.1.6 Ações do Dropdown

| Ação | Ícone | Comportamento |
|------|-------|---------------|
| **Editar** | Pencil | Abre modal de edição |
| **Permissões** | Shield | Abre modal de permissões |
| **Enviar Convite** | Mail | Reenvia email de convite |
| **Desativar** | UserX | Desativa colaborador |
| **Ativar** | UserCheck | Ativa colaborador |
| **Excluir** | Trash2 | Confirmação + remove |

---

### 5.2 Cadastro de Colaborador

**Rota:** `/configuracoes/colaboradores/novo` ou Modal

#### 5.2.1 Seção: Dados Pessoais

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| **Nome Completo** | text | ✅ | Mínimo 2 caracteres |
| **Email** | email | ✅ | Formato válido, único |
| **Telefone** | tel | ❌ | Máscara (00) 00000-0000 |
| **Cargo/Função** | text | ❌ | Texto livre |

#### 5.2.2 Seção: Permissões

**Seleção de Papel:**
| Papel | Descrição | Badge |
|-------|-----------|-------|
| **Administrador** | Acesso completo (exceto configurações críticas) | Recomendado |
| **Gerente** | Gestão de equipe, módulos operacionais |
| **Vendedor** | CRM + Vendas |
| **Visualizador** | Apenas leitura |

**Seleção de Módulos:**
```
Módulos Disponíveis:
☐ CRM
☐ Financeiro
☐ Estoque
☐ Vendas
☐ Loja Virtual
☐ Agendamentos
☐ Configurações (apenas Admin)
```

#### 5.2.3 Seção: Configurações Adicionais

| Toggle | Descrição | Default |
|--------|-----------|---------|
| **Notificações por Email** | Resumo de atividades | ON |
| **Acesso WhatsApp Business** | Permitir uso da integração | OFF |

#### 5.2.4 Estados do Formulário

| Estado | Visualização |
|--------|--------------|
| **Default** | Campos vazios, botões ativos |
| **Validando** | Spinner no campo email (verifica unicidade) |
| **Enviando** | Botão desabilitado + spinner |
| **Sucesso** | Toast verde + redirect/fechar modal |
| **Erro** | Toast vermelho + highlight campos |

---

### 5.3 Gestão de Permissões

**Rota:** `/configuracoes/colaboradores/[id]/permissoes` ou Modal

#### 5.3.1 Header do Colaborador

- Avatar grande (64px)
- Nome completo
- Badge de papel atual
- Botão "Voltar"

#### 5.3.2 Matriz de Permissões

**Tabela de 7 colunas:**

| Módulo | Ver | Criar | Editar | Excluir |
|--------|-----|-------|--------|---------|
| CRM | 🟢 | 🟢 | 🟢 | 🔴 |
| Financeiro | 🟢 | 🟢 | 🟢 | 🔴 |
| Estoque | 🟢 | 🟢 | 🔴 | 🔴 |
| Vendas | 🟢 | 🟢 | 🟢 | 🔴 |
| Loja Virtual | 🟢 | 🔴 | 🔴 | 🔴 |
| Agendamentos | 🟢 | 🟢 | 🔴 | 🔴 |
| Configurações | 🟢 | 🟢 | 🟢 | ⚫ |

**Legenda:**
- 🟢 Toggle ativo
- 🔴 Toggle inativo
- ⚫ Bloqueado (proprietário)

#### 5.3.3 Ações Rápidas

| Botão | Comportamento |
|-------|---------------|
| **Selecionar Tudo** | Habilita Ver+Criar+Editar em todos módulos |
| **Limpar Tudo** | Desabilita todas permissões |
| **Restaurar Padrão** | Reseta para o padrão do papel selecionado |

#### 5.3.4 Salvamento

| Modo | Comportamento |
|------|---------------|
| **Manual** | Botão "Salvar Alterações" |
| **Auto-save** | Salva automaticamente após 2s de inatividade (opcional) |

#### 5.3.5 Restrições

| Regra | Comportamento |
|-------|---------------|
| **Proprietário** | Matriz bloqueada, aviso "Não pode editar" |
| **Admin** | Não pode desabilitar próprio acesso |
| **Módulo inativo** | Toggle "Ver" desabilitado |

---

## 6. Fluxo de Usuário

### 6.1 Fluxo Principal: Adicionar Colaborador

```
┌─────────────────────────────────────────────────────────────┐
│  Carlos acessa /configuracoes/colaboradores                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Lista de Colaboradores                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│  │ Carlos  │ │ Maria   │ │  +  Add │                        │
│  │ Owner   │ │ Admin   │ │         │                        │
│  └─────────┘ └─────────┘ └─────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Novo Colaborador │
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Modal/Página de Cadastro                                   │
│  ┌─────────────────────────────────────────────┐            │
│  │ Nome: Maria Oliveira                        │            │
│  │ Email: maria@empresa.com                   │            │
│  │ Telefone: (11) 98765-1234                  │            │
│  │ Cargo: Atendente                           │            │
│  │                                             │            │
│  │ Papel: [Administrador] [Gerente] [Vendedor]│            │
│  │                                             │            │
│  │ Módulos:                                   │            │
│  │ ☑ CRM  ☑ Financeiro  ☐ Estoque           │            │
│  │ ☑ Vendas  ☐ Loja  ☐ Agendamentos         │            │
│  └─────────────────────────────────────────────┘            │
│                                                             │
│  [Cancelar]                    [Adicionar Colaborador]       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    Toast: ✅     │
                    │ "Colaborador    │
                    │ adicionado com  │
                    │ sucesso!"       │
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Lista atualizada com Maria (status: Pendente)              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│  │ Carlos  │ │ Maria ⏳│ │  +  Add │                        │
│  │ Owner   │ │ Vendedor│ │         │                        │
│  └─────────┘ └─────────┘ └─────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Email enviado   │
                    │ para Maria      │
                    │ (等待确认)         │
                    └─────────────────┘
```

### 6.2 Fluxo Secundário: Editar Permissões

```
┌─────────────────────────────────────────────────────────────┐
│  Carlos clica no menu ••• do card de Maria                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ [Editar]        │
                    │ [Permissões] ←──│
                    │ [Desativar]     │
                    │ [Excluir]       │
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Modal de Permissões                                        │
│  ┌─────────────────────────────────────────────┐            │
│  │ 👤 Maria Oliveira - Vendedor                 │            │
│  ├─────────────────────────────────────────────┤            │
│  │  Módulo  │ Ver │ Criar │ Editar │ Excluir  │            │
│  ├─────────────────────────────────────────────┤            │
│  │  CRM     │  🟢 │   🟢  │   🟢   │   🔴    │            │
│  │  Finance │  🟢 │   🔴  │   🔴   │   🔴    │            │
│  │  Vendas  │  🟢 │   🟢  │   🟢   │   🔴    │            │
│  └─────────────────────────────────────────────┘            │
│                                                             │
│  [Selecionar Tudo]  [Limpar]  [Restaurar Padrão]           │
│                                                             │
│  [Voltar]                          [Salvar Alterações]      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    Toast: ✅     │
                    │ "Permissões     │
                    │ atualizadas!"   │
                    └─────────────────┘
```

---

## 7. Wireframes Descritivos

### 7.1 Wireframe: Lista de Colaboradores (Cards)

```
┌────────────────────────────────────────────────────────────────────┐
│ ⚙️ Configurações                                               [👤] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  👥 Colaboradores                              [+ Novo Colaborador] │
│  5 de 20                                     "Gerencie membros..." │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🔍 Buscar colaborador...   │ Status ▼ │ Papel ▼ │ 🟦 │ 🨯 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐         │
│  │  🟢 Carlos S  │  │  🟢 Maria O   │  │  ⏳ Pedro L   │         │
│  │               │  │               │  │               │         │
│  │ Proprietário │  │ Administrador │  │  Visualizador │         │
│  │               │  │               │  │               │         │
│  │ CRM Finance   │  │ CRM Finance   │  │  Finance      │         │
│  │ Vendas        │  │ Vendas Estoque│  │               │         │
│  │               │  │               │  │               │         │
│  ├───────────────┤  ├───────────────┤  ├───────────────┤         │
│  │ 🕐 Há 2h  ●Ativo│  │ 🕐 Há 3d  ●Ativo│  │ 🕐 Nunca ⏳Pend│  │
│  │         •••   │  │         •••   │  │         •••   │         │
│  └───────────────┘  └───────────────┘  └───────────────┘         │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 7.2 Wireframe: Cadastro de Colaborador (Modal)

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Novo Colaborador                                          [×] │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │  👤 Dados Pessoais                                          │  │
│  │  ┌────────────────────────┐  ┌────────────────────────────┐ │  │
│  │  │ Nome completo *        │  │ Email *                   │ │  │
│  │  │ Maria Oliveira          │  │ maria@empresa.com          │ │  │
│  │  └────────────────────────┘  └────────────────────────────┘ │  │
│  │  ┌────────────────────────┐  ┌────────────────────────────┐ │  │
│  │  │ Telefone               │  │ Cargo / Função             │ │  │
│  │  │ (11) 98765-4321        │  │ Atendente                  │ │  │
│  │  └────────────────────────┘  └────────────────────────────┘ │  │
│  │                                                              │  │
│  │  🛡️ Permissões                                              │  │
│  │  Papel do colaborador *                                     │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ ○ Administrador  - Acesso completo aos módulos         │ │  │
│  │  ├────────────────────────────────────────────────────────┤ │  │
│  │  │ ● Gerente       - Gestão de equipe e operações    ✨  │ │  │
│  │  ├────────────────────────────────────────────────────────┤ │  │
│  │  │ ○ Vendedor      - Operações básicas de vendas         │ │  │
│  │  ├────────────────────────────────────────────────────────┤ │  │
│  │  │ ○ Visualizador  - Apenas leitura                       │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │                                                              │  │
│  │  Módulos acessíveis                                         │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐              │  │
│  │  │ ☑ CRM      │ │ ☑ Finance  │ │ ☐ Estoque  │              │  │
│  │  └────────────┘ └────────────┘ └────────────┘              │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐              │  │
│  │  │ ☑ Vendas   │ │ ☐ Loja     │ │ ☐ Agenda   │              │  │
│  │  └────────────┘ └────────────┘ └────────────┘              │  │
│  │                                                              │  │
│  │  ⚙️ Configurações Adicionais                                 │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ Notificações por email          [━━━━●━━━]  Ativado   │ │  │
│  │  ├────────────────────────────────────────────────────────┤ │  │
│  │  │ Acesso WhatsApp Business        [━━●━━━━━]  Desativado │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │                                                              │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                            [Cancelar]  [+ Adicionar]        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 7.3 Wireframe: Matriz de Permissões

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  👤 Maria Oliveira                                          [←] │  │
│  │  Badge: Administrador                                        │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │  Permissões por Módulo                                       │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ Ver      Criar     Editar     Excluir                   │  │  │
│  │  │  ●        ●         ●          ○                        │  │  │
│  │  ├────────────────────────────────────────────────────────┤  │  │
│  │  │                                                        │  │  │
│  │  │ 👥 CRM          [●]        [●]        [●]        [○]   │  │  │
│  │  │ 💰 Financeiro    [●]        [●]        [●]        [○]   │  │  │
│  │  │ 📦 Estoque       [●]        [●]        [○]        [○]   │  │  │
│  │  │ 🛒 Vendas        [●]        [●]        [●]        [○]   │  │  │
│  │  │ 🏪 Loja Virtual  [●]        [○]        [○]        [○]   │  │  │
│  │  │ 📅 Agendamentos  [●]        [●]        [●]        [○]   │  │  │
│  │  │ ⚙️ Configurações [●]        [●]        [●]        [○] ⚠ │  │  │
│  │  │                                                        │  │  │
│  │  │   ⚠ Restrito para administradores                       │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  [Selecionar Tudo]  [Limpar]  [Restaurar Padrão]            │  │
│  │                                                              │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                            [Voltar]  [Salvar Alterações]    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 8. Mock Data

### 8.1 Tipos TypeScript

```typescript
// types/employee.ts

export type EmployeeStatus = 'active' | 'inactive' | 'pending';
export type EmployeeRole = 'owner' | 'admin' | 'manager' | 'seller' | 'viewer';
export type ModulePermission = 'view' | 'create' | 'edit' | 'delete';
export type ModuleType = 'crm' | 'finance' | 'inventory' | 'sales' | 'store' | 'appointments' | 'settings';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  position?: string;
  avatar?: string;
  status: EmployeeStatus;
  lastAccess?: Date;
  modules: ModuleAccess[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleAccess {
  module: ModuleType;
  permissions: ModulePermission[];
}

export interface Role {
  id: string;
  name: EmployeeRole;
  label: string;
  description: string;
  defaultModules: ModuleType[];
  isSystem: boolean;
}
```

### 8.2 Mock Data - Colaboradores

```typescript
// lib/mocks/employees.ts

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    email: 'carlos@empresa.com',
    phone: '(11) 98765-4321',
    role: 'owner',
    position: 'Proprietário',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=carlos',
    lastAccess: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'finance', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'inventory', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'sales', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'store', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'appointments', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'settings', permissions: ['view', 'create', 'edit', 'delete'] },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria@empresa.com',
    phone: '(11) 98765-1234',
    role: 'admin',
    position: 'Gerente Administrativa',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=maria',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'finance', permissions: ['view', 'create', 'edit', 'delete'] },
      { module: 'inventory', permissions: ['view', 'create', 'edit'] },
      { module: 'sales', permissions: ['view', 'create', 'edit'] },
      { module: 'appointments', permissions: ['view', 'create', 'edit'] },
    ],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-06-20'),
  },
  {
    id: '3',
    name: 'João Santos',
    email: 'joao@empresa.com',
    role: 'manager',
    position: 'Gerente de Vendas',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=joao',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit'] },
      { module: 'sales', permissions: ['view', 'create', 'edit'] },
      { module: 'inventory', permissions: ['view'] },
    ],
    createdAt: new Date('2024-04-10'),
    updatedAt: new Date('2024-07-01'),
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@empresa.com',
    role: 'seller',
    position: 'Vendedora',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=ana',
    lastAccess: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
    modules: [
      { module: 'crm', permissions: ['view', 'create', 'edit'] },
      { module: 'sales', permissions: ['view', 'create'] },
    ],
    createdAt: new Date('2024-05-20'),
    updatedAt: new Date('2024-08-15'),
  },
  {
    id: '5',
    name: 'Pedro Lima',
    email: 'pedro@empresa.com',
    role: 'viewer',
    position: 'Contador',
    status: 'pending',
    lastAccess: undefined,
    modules: [
      { module: 'finance', permissions: ['view'] },
      { module: 'sales', permissions: ['view'] },
    ],
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
];
```

### 8.3 Mock Data - Papéis

```typescript
export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'owner',
    label: 'Proprietário',
    description: 'Acesso completo a todos os recursos e configurações da empresa',
    defaultModules: ['crm', 'finance', 'inventory', 'sales', 'store', 'appointments', 'settings'],
    isSystem: true,
  },
  {
    id: '2',
    name: 'admin',
    label: 'Administrador',
    description: 'Acesso completo a todos os módulos, exceto configurações críticas',
    defaultModules: ['crm', 'finance', 'inventory', 'sales', 'store', 'appointments'],
    isSystem: true,
  },
  {
    id: '3',
    name: 'manager',
    label: 'Gerente',
    description: 'Gestão de equipe e operações do dia a dia',
    defaultModules: ['crm', 'sales', 'inventory'],
    isSystem: false,
  },
  {
    id: '4',
    name: 'seller',
    label: 'Vendedor',
    description: 'Operações básicas de vendas e atendimento',
    defaultModules: ['crm', 'sales'],
    isSystem: false,
  },
  {
    id: '5',
    name: 'viewer',
    label: 'Visualizador',
    description: 'Acesso apenas para visualização (somente leitura)',
    defaultModules: ['crm', 'finance', 'inventory', 'sales', 'appointments'],
    isSystem: true,
  },
];
```

### 8.4 Mock Data - Módulos

```typescript
export const mockModules = [
  { id: 'crm', name: 'CRM', icon: 'Users' },
  { id: 'finance', name: 'Financeiro', icon: 'Wallet' },
  { id: 'inventory', name: 'Estoque', icon: 'Package' },
  { id: 'sales', name: 'Vendas', icon: 'ShoppingCart' },
  { id: 'store', name: 'Loja Virtual', icon: 'Store' },
  { id: 'appointments', name: 'Agendamentos', icon: 'Calendar' },
  { id: 'settings', name: 'Configurações', icon: 'Settings' },
];
```

### 8.5 Mapeamento de Cores

```typescript
// Status colors
export const statusColors = {
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

// Role colors
export const roleColors = {
  owner: { bg: 'bg-purple-100', text: 'text-purple-700' },
  admin: { bg: 'bg-blue-100', text: 'text-blue-700' },
  manager: { bg: 'bg-green-100', text: 'text-green-700' },
  seller: { bg: 'bg-amber-100', text: 'text-amber-700' },
  viewer: { bg: 'bg-gray-100', text: 'text-gray-700' },
};
```

---

## 9. Dependências

### 9.1 Componentes shadcn/ui Já Existentes

| Componente | Status | Uso no Módulo |
|------------|--------|---------------|
| **Button** | ✅ | Botões primários, secundários |
| **Card** | ✅ | Cards de colaborador |
| **Badge** | ✅ | Badges de status e papel |
| **Avatar** | ✅ | Avatar do colaborador |
| **Dialog/Sheet** | ✅ | Modal de cadastro/permissões |
| **Input** | ✅ | Campos de formulário |
| **Select** | ✅ | Filtros de status e papel |
| **Checkbox** | ✅ | Seleção de módulos |
| **Switch/Toggle** | ✅ | Toggles de permissão |
| **Skeleton** | ✅ | Estados de loading |
| **Toast** | ✅ | Notificações de sucesso/erro |
| **DropdownMenu** | ✅ | Menu de ações do card |
| **Separator** | ✅ | Divisores de seção |

### 9.2 Componentes a Criar/Adaptar

| Componente | Tipo | Descrição |
|------------|------|-----------|
| **PermissionMatrix** | Novo | Matriz de toggles para permissões |
| **EmployeeCard** | Novo | Card individual de colaborador |
| **EmployeeTable** | Novo | Linha de tabela de colaborador |
| **RoleSelector** | Novo | Cards de seleção de papel |
| **ModuleCheckbox** | Novo | Checkbox de seleção de módulo |
| **EmployeeFilters** | Novo | Barra de filtros |
| **ViewToggle** | Novo | Toggle Cards/Tabela |

### 9.3 Bibliotecas Necessárias

```bash
# Ya装有:
# - react
# - react-dom
# - typescript
# - tailwindcss
# - lucide-react
# - @radix-ui/react-* (via shadcn)

# Não precisa instalar nada novo!
# Todos componentes necessários já existem via shadcn/ui
```

### 9.4 Estrutura de Arquivos

```
📁 src/
├── 📁 components/
│   ├── 📁 employees/
│   │   ├── employee-list.tsx        # Lista principal
│   │   ├── employee-card.tsx        # Card individual
│   │   ├── employee-table.tsx       # Tabela (alternativa)
│   │   ├── employee-filters.tsx      # Barra de filtros
│   │   ├── employee-header.tsx       # Header da página
│   │   ├── employee-empty.tsx        # Estado vazio
│   │   ├── employee-skeleton.tsx      # Skeleton loading
│   │   ├── employee-dropdown.tsx      # Menu de ações
│   │   ├── view-toggle.tsx           # Toggle Cards/Tabela
│   │   ├── index.ts                  # Barrel export
│   │   ├── employee-form.tsx         # Formulário de cadastro
│   │   ├── permission-matrix.tsx      # Matriz de permissões
│   │   ├── role-selector.tsx         # Seleção de papel
│   │   └── module-checkbox.tsx       # Checkbox de módulo
├── 📁 lib/
│   ├── 📁 mocks/
│   │   └── employees.ts              # Mock data
│   └── 📁 types/
│       └── employee.ts               # Tipos TypeScript
└── 📁 pages/
    └── 📁 configuracoes/
        └── 📁 colaboradores/
            └── page.tsx              # Página principal
```

---

## 10. Critérios de Aceitação

### 10.1 Checklist - Lista de Colaboradores

| ID | Critério | Prioridade |
|----|----------|------------|
| LIST-01 | Header com título, contador e botão "Novo Colaborador" | Must |
| LIST-02 | Campo de busca filtra por nome e email | Must |
| LIST-03 | Select de filtro por status funciona | Must |
| LIST-04 | Select de filtro por papel funciona | Must |
| LIST-05 | Toggle Cards/Tabela alterna visualização | Should |
| LIST-06 | Visualização em cards mostra avatar, nome, email, papel, módulos | Must |
| LIST-07 | Badge de status visível no card | Must |
| LIST-08 | Dropdown menu com todas as ações | Must |
| LIST-09 | Visualização em tabela mostra todas as colunas | Should |
| LIST-10 | Estado vazio com CTA para adicionar | Must |
| LIST-11 | Skeleton de loading aparece | Must |
| LIST-12 | Responsividade mobile (1 coluna) | Must |

### 10.2 Checklist - Cadastro de Colaborador

| ID | Critério | Prioridade |
|----|----------|------------|
| FORM-01 | Modal abre ao clicar "Novo Colaborador" | Must |
| FORM-02 | Campos Nome e Email são obrigatórios | Must |
| FORM-03 | Validação de email (formato válido) | Must |
| FORM-04 | Seleção de papel com cards visuais | Must |
| FORM-05 | Checkboxes de módulos funcionais | Must |
| FORM-06 | Toggles de configurações adcionais | Should |
| FORM-07 | Validação impede envio sem campos obrigatórios | Must |
| FORM-08 | Toast de sucesso após adicionar | Must |
| FORM-09 | Modal fecha após sucesso | Must |
| FORM-10 | Botão Cancelar fecha modal | Must |

### 10.3 Checklist - Gestão de Permissões

| ID | Critério | Prioridade |
|----|----------|------------|
| PERM-01 | Header mostra avatar e nome do colaborador | Must |
| PERM-02 | Matriz de permissões exibe todos os módulos | Must |
| PERM-03 | Toggles de Ver/Criar/Editar/Excluir funcionais | Must |
| PERM-04 | Botão "Selecionar Tudo" marca todas | Should |
| PERM-05 | Botão "Limpar Tudo" desmarca todas | Should |
| PERM-06 | Botão "Restaurar Padrão" reseta para papel | Should |
| PERM-07 | Proprietário tem matriz bloqueada | Must |
| PERM-08 | Toast de sucesso após salvar | Must |

### 10.4 Checklist - Geral

| ID | Critério | Prioridade |
|----|----------|------------|
| GEN-01 | Fonte Poppins aplicada | Must |
| GEN-02 | Cores UNIQ consistentes | Must |
| GEN-03 | Ícones Lucide React | Must |
| GEN-04 | Animações suaves (hover, transitions) | Should |
| GEN-05 | Estados de loading com skeleton | Must |
| GEN-06 | Estados de erro com toast | Must |
| GEN-07 | Responsividade mobile-first | Must |
| GEN-08 | Acessibilidade (labels, focus, aria) | Should |

### 10.5 Definição de Pronto (Definition of Done)

```
✅ PRONTO = TODOS os itens "Must" marcados
         + Code Review aprovado
         + Testes visuais passando
         + Responsividade verificada
         + Acessibilidade básica
```

---

## 11. User Stories

### US-01: Como dono, quero ver todos os colaboradores
**Critérios:**
- [ ] Lista mostra todos os colaboradores da empresa
- [ ] Contador "X de 20" indica limite
- [ ] Status visual (ativo/inativo/pendente) é claro
- [ ] Permissões一眼可见

### US-02: Como dono, quero adicionar um novo colaborador
**Critérios:**
- [ ] Acesso rápido pelo botão "Novo Colaborador"
- [ ] Formulário simples e intuitivo
- [ ] Convite enviado automaticamente por email
- [ ] Status inicia como "Pendente"

### US-03: Como dono, quero definir permissões granulares
**Critérios:**
- [ ] Posso escolher papel pré-definido
- [ ] Posso customizar permissões por módulo
- [ ] Visualização clara do que cada um pode fazer
- [ ] Alterações têm efeito imediato

### US-04: Como dono, quero desativar um colaborador
**Critérios:**
- [ ] Ação disponível no menu dropdown
- [ ] Confirmação antes de desativar
- [ ] Colaborador não perde dados
- [ ] Pode ser reativado depois

### US-05: Como vendedor, quero saber o que posso acessar
**Critérios:**
- [ ] Badge de papel visível
- [ ] Tags de módulos acessíveis no card
- [ ] Interface mostra apenas opções permitidas

---

## 12. Regras de Negócio

| ID | Regra | Implementação |
|----|-------|---------------|
| RN-COL-001 | Apenas admin pode gerenciar colaboradores | Verificar role antes de mostrar UI |
| RN-COL-002 | Um colaborador = um papel | Radio buttons na seleção |
| RN-COL-003 | Proprietário não pode ser alterado | Matriz bloqueada |
| RN-COL-004 | Convites expiram em 7 dias | Contador visual + reenviar |
| RN-COL-005 | Máximo 20 colaboradores | Contador + disable botão |
| RN-COL-006 | Busca case insensitive | toLowerCase() nos dois lados |
| RN-COL-007 | Filtros aplicados instantaneamente | useEffect com debounce |
| RN-COL-008 | Toggle persistido em localStorage | useState + localStorage |
| RN-COL-009 | Máximo 50 por página | Paginação ou virtualização |
| RN-COL-010 | Convites pendentes mostram reenviar | Ícone Mail no dropdown |

---

## 13. Riscos e Mitigações

### Risco 1: Interface Complexa para o Público
**Descrição:** Empreendedor na correria pode se confundir com tantas opções.
**Impacto:** Alto | **Probabilidade:** Média
**Mitigação:**
- Papéis pré-definidos cobrrem 90% dos casos
- UI minimalista com Defaults inteligentes
- Tooltips explicativos nos campos

### Risco 2: Performance com Muitos Colaboradores
**Descrição:** 20 colaboradores com permissões granulares pode impactar.
**Impacto:** Baixo | **Probabilidade:** Baixa
**Mitigação:**
- Lazy loading de detalhes
- Virtualização se >10 cards
- Memoização de componentes

### Risco 3: Consolidação com Backend
**Descrição:** UI mock vs. integração real pode ter gaps.
**Impacto:** Médio | **Probabilidade:** Média
**Mitigação:**
- Types alinhados com schema futuro
- Mock data que simula API real
- Preparação para replace de mock por API

---

## 14. Referências

### 14.1 Documentos do Projeto

- [PRD Sprint 01 - Design System](./PRD_SPRINT_01_Design_System.md)
- [UI Docs - Modulo 09 Colaboradores](../ui/modulo-09-colaboradores.md)
- [Contexto do Projeto](../CONTEXTO_PROJETO.md)
- [Metodologia Vibe Coding](../Metodologia_vibe-coding.md)

### 14.2 Inspirações UI

- [Linear](https://linear.app) - Settings > Members
- [Notion](https://notion.so) - Team members
- [Stripe](https://dashboard.stripe.com/settings/team) - Team management
- [Vercel](https://vercel.com/dashboard/team-members) - Team settings

### 14.3 Recursos

- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

---

**Documento gerado em:** 21/03/2026 18:00 BRT  
**Pesquisador:** @vibe-researcher  
**Fase:** FASE 01 - Research (SDD)  
**Próxima Fase:** FASE 02 - Planning (@vibe-planner)  
**Status:** 🟢 PRONTO PARA PLANNING

---

> ⚠️ **IMPORTANTE:** Este é um documento de especificação de produto (PRD). Não contém código implementado. A implementação será realizada na FASE 03 por @vibe-implementer baseado na SPEC técnica que será gerada na FASE 02.

> 🎯 **PRÓXIMOS PASSOS:**
> 1. Usuário deve limpar contexto do chat
> 2. Chamar @vibe-planner para gerar SPEC.md
> 3. Aguardar aprovação do SPEC
> 4. Chamar @vibe-implementer para desenvolvimento

---

## Anexo: Checklist de Implementação (Copiar para SPEC)

```markdown
## TODO - Implementação

### Componentes
- [ ] EmployeeList
- [ ] EmployeeCard
- [ ] EmployeeTable
- [ ] EmployeeFilters
- [ ] EmployeeHeader
- [ ] EmployeeEmpty
- [ ] EmployeeSkeleton
- [ ] EmployeeDropdown
- [ ] ViewToggle
- [ ] EmployeeForm
- [ ] PermissionMatrix
- [ ] RoleSelector
- [ ] ModuleCheckbox

### Pages
- [ ] /configuracoes/colaboradores
- [ ] Modal: Novo Colaborador
- [ ] Modal: Permissões

### Hooks
- [ ] useEmployees (mock)
- [ ] usePermissions (mock)

### Types
- [ ] Employee
- [ ] Role
- [ ] ModuleAccess

### Mock Data
- [ ] mockEmployees
- [ ] mockRoles
- [ ] mockModules
```
