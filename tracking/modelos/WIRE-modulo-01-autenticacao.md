# Módulo 1 - Autenticação

Este documento apresenta os wireframes detalhados de todas as telas, formulários e fluxos do módulo de autenticação do Goal Planner.

---

## 1. Landing Page

**Rota:** `/`

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                        │
│ ┌─────────┐                           [Entrar] [Cadastrar]  │
│ │  LOGO   │                                                   │
│ └─────────┘                                                   │
├─────────────────────────────────────────────────────────────┤
│ HERO SECTION                                                  │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │                                                           │  │
│ │  [Ilustração: Pessoa alcançando metas]                    │  │
│ │                                                           │  │
│ │  Alcance suas metas com organização e foco               │  │
│ │                                                           │  │
│ │  O Goal Planner ajuda você a planejar,                   │  │
│ │  acompanhar e conquistar seus objetivos                  │  │
│ │                                                           │  │
│ │              [Começar Agora - CTA Principal]             │  │
│ │                                                           │  │
│ └─────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ FEATURES                                                      │
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│ │ 🎯            │  │ 📊            │  │ 🔔            │      │
│ │ Planeje       │  │ Acompanhe     │  │ Receba        │      │
│ │ seus objetivos│  │ seu progresso │  │ notificações  │      │
│ │ com clareza   │  │ em tempo real │  │ e lembretes   │      │
│ └───────────────┘  └───────────────┘  └───────────────┘      │
├─────────────────────────────────────────────────────────────┤
│ SOCIAL PROOF                                                  │
│ "O Goal Planner transformou minha rotina"                   │
│ ────────────────────────────                                  │
│ Maria Silva - Empreendedora                                   │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                        │
│ © 2024 Goal Planner    [Termos de Uso] [Política de Priv]   │
└─────────────────────────────────────────────────────────────┘
```

### Componentes

- **Logo**: Marca do Goal Planner (canto superior esquerdo)
- **Navigation Buttons**: Botões "Entrar" e "Cadastrar" no header
- **Hero Illustration**: Imagem/ilustração representativa
- **Headline**: Título principal da página
- **Subheadline**: Subtítulo descritivo
- **CTA Button**: Botão principal "Começar Agora"
- **Feature Cards**: 3 cards com ícones e descrições das funcionalidades
- **Testimonial**: Depoimento de usuário
- **Footer**: Links institucionais

### Ações

- **Entrar**: Redireciona para `/login`
- **Cadastrar**: Redireciona para `/register`
- **Começar Agora**: Redireciona para `/register`

### Fluxo de Navegação

```
Landing Page
    │
    ├── [Entrar] ──────────► Login (/login)
    │
    ├── [Cadastrar] ──────► Registro (/register)
    │
    └── [Começar Agora] ─► Registro (/register)
```

---

## 2. Login

**Rota:** `/login`

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                        │
│ ┌─────────┐                                                   │
│ │  LOGO   │                              [Ajuda]            │
│ └─────────┘                                                   │
├─────────────────────────────────────────────────────────────┤
│ CONTENT (Centralizado)                                        │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │                                                           │  │
│ │  Olá de novo!                                            │  │
│ │  Entre para continuar alcançando suas metas               │  │
│ │                                                           │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │ 📧 Email                                         │    │  │
│ │  │ example@email.com                                │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ │                                                           │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │ 🔒 Senha                              [Olho]     │    │  │
│ │  │ ••••••••••                                     │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ │                                                           │  │
│ │  [ ] Lembrar-me                                           │  │
│ │                                                           │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │           ENTRAR                                  │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ │                                                           │  │
│ │  Esqueceu a senha? [Recuperar]                          │  │
│ │                                                           │  │
│ │  ─────────────────────────────────────────────           │  │
│ │                                                           │  │
│ │  Não tem uma conta? [Cadastrar-se]                      │  │
│ │                                                           │  │
│ └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Componentes

- **Logo**: Marca do Goal Planner
- **Header**: Com botão de ajuda
- **Page Title**: "Olá de novo!"
- **Page Subtitle**: Subtítulo motivacional
- **Email Input**: Campo de email com ícone
- **Password Input**: Campo de senha com toggle visibility
- **Remember Me**: Checkbox para lembrar usuário
- **Submit Button**: Botão "ENTRAR"
- **Forgot Password Link**: Link para recuperação de senha
- **Register Link**: Link para página de registro

### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| email | email | Email do usuário (obrigatório, validação de formato) |
| password | password | Senha do usuário (obrigatório, mínimo 8 caracteres) |
| rememberMe | checkbox | Opção para manter sessão ativa |

### Ações

- **ENTRAR**: Realiza autenticação e redireciona para Dashboard (`/dashboard`)
- **Recuperar**: Redireciona para `/forgot-password`
- **Cadastrar-se**: Redireciona para `/register`
- **Ajuda**: Abre modal de ajuda ou redireciona para página de FAQ
- **Olho (toggle)**: Alterna visibilidade da senha

### Fluxo de Navegação

```
Login (/login)
    │
    ├── [ENTRAR] ────────────► Dashboard (/dashboard)
    │
    ├── [Recuperar] ─────────► Forgot Password (/forgot-password)
    │
    ├── [Cadastrar-se] ──────► Registro (/register)
    │
    └── [Ajuda] ──────────────► FAQ (/faq) ou Modal
```

### Estados do Formulário

- **Default**: Campos vazios, botão habilitado
- **Loading**: Campos desabilitados, botão com spinner
- **Error**: Mensagem de erro abaixo do campo inválido
- **Success**: Redirecionamento para Dashboard

---

## 3. Registro

**Rota:** `/register`

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                        │
│ ┌─────────┐                                                   │
│ │  LOGO   │                              [Ajuda]            │
│ └─────────┘                                                   │
├─────────────────────────────────────────────────────────────┤
│ CONTENT (Centralizado)                                        │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │                                                           │  │
│ │  Crie sua conta                                          │  │
│ │  Comece a planejar suas metas hoje mesmo                 │  │
│ │                                                           │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │ 👤 Nome Completo                                │    │  │
│ │  │ Maria Silva                                     │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ │                                                           │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │ 📧 Email                                        │    │  │
│ │  │ example@email.com                               │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ │                                                           │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │ 🔒 Senha                              [Olho]    │    │  │
│ │  │ mínimo 8 caracteres                              │    │  │
│ │  │ ••••••••••                                      │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ │                                                           │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │ 🔒 Confirmar Senha                   [Olho]    │    │  │
│ │  │ ••••••••••                                     │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ │                                                           │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │           CADASTRAR                              │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ │                                                           │  │
│ │  [ ] Eu aceito os [Termos de Uso] e [Política de Priv] │  │
│ │                                                           │  │
│ │  ─────────────────────────────────────────────           │  │
│ │                                                           │  │
│ │  Já tem uma conta? [Entrar]                             │  │
│ │                                                           │  │
│ └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Componentes

- **Logo**: Marca do Goal Planner
- **Header**: Com botão de ajuda
- **Page Title**: "Crie sua conta"
- **Page Subtitle**: Subtítulo motivacional
- **Full Name Input**: Campo de nome completo
- **Email Input**: Campo de email com ícone
- **Password Input**: Campo de senha com toggle visibility e hint
- **Confirm Password Input**: Campo de confirmação de senha
- **Terms Checkbox**: Checkbox de aceite dos termos
- **Submit Button**: Botão "CADASTRAR"
- **Login Link**: Link para página de login

### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| fullName | text | Nome completo do usuário (obrigatório, mínimo 2 caracteres) |
| email | email | Email do usuário (obrigatório, validação de formato, único no sistema) |
| password | password | Senha (obrigatório, mínimo 8 caracteres, deve conter letra e número) |
| confirmPassword | password | Confirmação de senha (obrigatório, deve ser igual a password) |
| termsAccepted | checkbox | Aceite dos termos (obrigatório) |

### Ações

- **CADASTRAR**: Cria conta e redireciona para Dashboard (`/dashboard`)
- **Entrar**: Redireciona para `/login`
- **Ajuda**: Abre modal de ajuda ou redireciona para página de FAQ
- **Olho (toggle)**: Alterna visibilidade da senha
- **Termos de Uso**: Abre documento de termos em nova aba
- **Política de Privacidade**: Abre documento em nova aba

### Fluxo de Navegação

```
Registro (/register)
    │
    ├── [CADASTRAR] ────────► Dashboard (/dashboard)
    │                         (após validação e criação de conta)
    │
    ├── [Entrar] ────────────► Login (/login)
    │
    ├── [Termos de Uso] ────► /terms (nova aba)
    │
    └── [Política de Priv] ► /privacy (nova aba)
```

### Estados do Formulário

- **Default**: Campos vazios, botão desabilitado até aceitar termos
- **Validation**: Validação em tempo real (blur)
- **Loading**: Campos desabilitados, botão com spinner
- **Error**: Mensagens de erro específicas por campo
- **Success**: Redirecionamento para Dashboard com toast de boas-vindas

### Validações

- **fullName**: Obrigatório, mínimo 2 caracteres
- **email**: Obrigatório, formato válido, não pode estar em uso
- **password**: Obrigatório, mínimo 8 caracteres, pelo menos 1 letra e 1 número
- **confirmPassword**: Deve ser idêntica à senha
- **termsAccepted**: Obrigatório para habilitar botão

---

## 4. Recuperação de Senha

**Rota:** `/forgot-password`

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                        │
│ ┌─────────┐                                                   │
│ │  LOGO   │                              [Voltar ao Login]   │
│ └─────────┘                                                   │
├─────────────────────────────────────────────────────────────┤
│ CONTENT (Centralizado)                                        │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │                                                           │  │
│ │  Esqueceu sua senha?                                    │  │
│ │  Não se preocupe! Informe seu email e enviaremos       │  │
│ │  as instruções para criar uma nova senha               │  │
│ │                                                           │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │ 📧 Email                                         │    │  │
│ │  │ example@email.com                                │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ │                                                           │  │
│ │  ┌─────────────────────────────────────────────────┐    │  │
│ │  │        ENVIAR INSTRUÇÕES                         │    │  │
│ │  └─────────────────────────────────────────────────┘    │  │
│ │                                                           │  │
│ └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Modal de Sucesso (após envio)

```
┌─────────────────────────────────────────────────────────────┐
│                      ✓ Email enviado!                        │
│                                                             │
│  Enviamos as instruções para criar uma nova senha          │
│  para example@email.com                                     │
│                                                             │
│  Não recebeu o email?                                       │
│  • Verifique sua caixa de spam                             │
│  • O email pode levar alguns minutos                       │
│  • [Reenviar email]                                        │
│                                                             │
│  [Voltar ao Login]                                         │
└─────────────────────────────────────────────────────────────┘
```

### Componentes

- **Logo**: Marca do Goal Planner
- **Back Link**: Link para voltar ao login
- **Page Title**: "Esqueceu sua senha?"
- **Page Subtitle**: Instruções
- **Email Input**: Campo de email
- **Submit Button**: Botão "ENVIAR INSTRUÇÕES"
- **Success Modal**: Mensagem de sucesso com instruções
- **Resend Link**: Link para reenviar email

### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| email | email | Email do usuário (obrigatório, validação de formato) |

### Ações

- **ENVIAR INSTRUÇÕES**: Envia email de recuperação e mostra mensagem de sucesso
- **Voltar ao Login**: Redireciona para `/login`
- **Reenviar email**: Reenvia o email de recuperação

### Fluxo de Navegação

```
Forgot Password (/forgot-password)
    │
    ├── [ENVIAR INSTRUÇÕES] ────► Success Message
    │                               (sem redirect, mostra feedback)
    │
    ├── [Reenviar email] ────────► Reenvia email (se não recebido)
    │
    └── [Voltar ao Login] ──────► Login (/login)
```

### Estados do Formulário

- **Default**: Campo vazio, botão habilitado
- **Loading**: Campo desabilitado, botão com spinner
- **Error**: Mensagem de erro (email não encontrado ou erro de servidor)
- **Success**: Mensagem de sucesso com instruções

---

## Resumo do Fluxo de Autenticação

```
                    ┌─────────────┐
                    │   Landing   │
                    │     (/)     │
                    └──────┬──────┘
                           │
              ┌─────────────┴─────────────┐
              │                           │
        [Entrar]                    [Cadastrar]
              │                           │
              ▼                           ▼
       ┌─────────────┐           ┌─────────────┐
       │   Login    │           │  Registro   │
       │  (/login)  │           │ (/register) │
       └──────┬──────┘           └──────┬──────┘
              │                          │
              └──────────┬───────────────┘
                         │
                    [Sucesso]
                         │
                         ▼
              ┌─────────────────────┐
              │     Dashboard       │
              │    (/dashboard)     │
              └─────────────────────┘

[Esqueceu senha] ──► /forgot-password ──► Sucesso ──► /login
```

---

## Componentes Reutilizáveis

### Input Field
```
┌────────────────────────────────────────┐
│ [Ícone] Nome do Campo                  │
│ Valor inserido                          │
└────────────────────────────────────────┘
│ Estados: default, focus, error, disabled
```

### Primary Button
```
┌────────────────────────────────────────┐
│           TEXTO DO BOTÃO              │
└────────────────────────────────────────┘
│ Estados: default, hover, loading, disabled
```

### Checkbox
```
☐ [ ] Label do checkbox
│ Estados: unchecked, checked, focus, disabled
```

### Link
```
[Texto do link]
│ Estados: default, hover, visited, disabled
```

---

## Considerações de UX/UI

1. **Feedback Imediato**: Todas as ações devem ter feedback visual (loading, sucesso, erro)
2. **Validação em Tempo Real**: Validação de campos ao perder o foco (blur)
3. **Acessibilidade**: Todos os campos devem ter labels e errosannounceados para screen readers
4. **Responsividade**: Layout adaptável para mobile, tablet e desktop
5. **Segurança**: Máscara de senha, verificação de força de senha
6. **Redirecionamento**: Usuários logados ao acessar /login ou /register devem ser redirecionados para /dashboard
