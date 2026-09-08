# Fluxo de Autenticação - Documentação UI

> **Produto:** UNIQ Empresas - Plataforma SaaS modular  
> **Público:** Empreendedores na correria (MEI/Micro)  
> **Tom de Voz:** Simples, acolhedor, profissional  
> **Documento Segue:** [Matriz de Documentação UI](./MATRIZ_DOCUMENTACAO_UI.md)

---

## 📱 Tela 1: Login

### 1. Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Login |
| **Rota/URL** | `/auth/login` |
| **Objetivo Principal** | Permitir acesso rápido e simples para usuários existentes |
| **Permissões de Acesso** | Público (não requer autenticação) |
| **Módulo/Pai** | Fluxo de Autenticação |
| **Prioridade MVP** | ✅ Essencial |

### 2. Contexto do Usuário

#### 2.1 Quem Usa Esta Tela
- **Perfil:** Empreendedor que já possui conta na plataforma
- **Conhecimento técnico:** Baixo - médio
- **Contexto de uso:** Acesso diário, muitas vezes via celular (na rua, na loja, entre atendimentos)

#### 2.2 Por Que Esta Tela Existe
- **Problema que resolve:** Acesso seguro à plataforma UNIQ
- **Valor entregue:** Entrada rápida no sistema para consultar informações do negócio
- **Frequência de uso:** Diária (múltiplas vezes)

#### 2.3 User Stories Relacionadas
- "Como empreendedor, quero fazer login rapidamente para consultar minhas vendas do dia"
- "Como empreendedor, quero que o sistema me lembre para não digitar senha toda vez"
- "Como empreendedor, quero acessar minha conta mesmo estando na rua pelo celular"

### 3. Elementos Obrigatórios (O Que DEVE Ter)

#### 3.1 Dados a Exibir
- [ ] **Logo UNIQ:** Identidade visual da marca
- [ ] **Tagline:** "O Norte para Empreendedores"
- [ ] **Versão do sistema:** Número de versão discreto (opcional para debug)

#### 3.2 Funcionalidades Essenciais
- [ ] Campo de email com validação de formato
- [ ] Campo de senha com opção de mostrar/ocultar
- [ ] Botão de submissão do formulário
- [ ] Link para recuperação de senha
- [ ] Link para criação de nova conta
- [ ] Opção "Lembrar de mim" (checkbox)

#### 3.3 Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Email | Email | Sim | Formato válido de email, máximo 255 caracteres |
| Senha | Password | Sim | Mínimo 6 caracteres |
| Lembrar de mim | Checkbox | Não | Persistir sessão por 30 dias |

### 4. Elementos Opcionais (O Que PODE Ter)

#### 4.1 Funcionalidades Adicionais
- [ ] Login social (Google, Facebook)
- [ ] Link para termos de uso e política de privacidade
- [ ] Mensagem de boas-vindas personalizada por horário ("Bom dia!", "Boa tarde!")
- [ ] Dica de segurança sobre senhas fortes

### 5. Ações Possíveis

#### 5.1 Ações Primárias
1. **Entrar no sistema:**
   - **Gatilho:** Botão "Entrar" após preencher credenciais
   - **Resultado:** Validação das credenciais e redirecionamento para dashboard
   - **Confirmação:** Não necessária

2. **Mostrar/ocultar senha:**
   - **Gatilho:** Ícone/ícone no campo de senha
   - **Resultado:** Alterna visibilidade do texto da senha
   - **Confirmação:** Não necessária

#### 5.2 Ações Secundárias
1. **Esqueci minha senha:** Navega para tela de recuperação
2. **Criar nova conta:** Navega para tela de cadastro
3. **Lembrar de mim:** Persiste sessão do usuário

### 6. Estados da UI

#### 6.1 Empty State
- **Quando aparece:** Tela inicial ao carregar
- **Mensagem:** Nenhuma - formulário pronto para preenchimento
- **Call-to-Action:** Foco automático no campo de email

#### 6.2 Loading State
- **Quando aparece:** Durante validação das credenciais
- **Tipo:** Indicador de carregamento no botão de submit
- **Mensagem:** "Entrando..."

#### 6.3 Error State
- **Quando aparece:** Credenciais inválidas
- **Mensagem:** "Email ou senha incorretos. Tente novamente."
- **Ação de recuperação:** Limpar campo de senha, manter email preenchido
- **Nota de segurança:** Mensagem genérica para não expor se email existe no sistema

#### 6.4 Success State
- **Quando aparece:** Login bem-sucedido
- **Feedback:** Transição suave para dashboard

### 7. Integrações

#### 7.1 Com Outras Telas
- Navega para: Dashboard (`/dashboard`)
- Navega para: Criar conta (`/auth/cadastro`)
- Navega para: Esqueci senha (`/auth/esqueci-senha`)

#### 7.2 Com Outros Módulos
- **Autenticação Supabase:** Validação de credenciais
- **Sessão:** Gerenciamento de estado de login

#### 7.3 APIs/Serviços
- **Supabase Auth:** Login com email/senha
- **Analytics:** Tracking de tentativas de login (anônimo)

### 8. Regras de Negócio

1. **Mensagem de erro genérica:** Sempre exibir "Email ou senha incorretos" mesmo que apenas o email não exista (segurança contra enumeração)
2. **Tentativas de login:** Bloquear temporariamente após 5 tentativas falhas (rate limiting)
3. **Sessão:** Duração padrão de 24h, ou 30 dias se "Lembrar de mim" estiver marcado
4. **Redirecionamento pós-login:** Sempre direcionar para `/dashboard`
5. **Usuário já logado:** Redirecionar automaticamente para dashboard se tentar acessar `/auth/login`

### 9. Notas e Considerações

- Priorizar usabilidade mobile - muitos acessos serão via celular
- Campo de senha deve ter toggle de visibilidade para evitar erros de digitação
- Manter email preenchido em caso de erro para facilitar nova tentativa
- Considerar tecla "Enter" como gatilho de submit no último campo
- Acessibilidade: Labels claros, contraste adequado, suporte a leitores de tela

---

## 📱 Tela 2: Criar Conta

### 1. Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Criar Conta |
| **Rota/URL** | `/auth/cadastro` |
| **Objetivo Principal** | Onboarding simples para novos empreendedores |
| **Permissões de Acesso** | Público (não requer autenticação) |
| **Módulo/Pai** | Fluxo de Autenticação |
| **Prioridade MVP** | ✅ Essencial |

### 2. Contexto do Usuário

#### 2.1 Quem Usa Esta Tela
- **Perfil:** Novo empreendedor conhecendo a UNIQ
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Chegou por indicação ou rede social, animado para começar

#### 2.2 Por Que Esta Tela Existe
- **Problema que resolve:** Cadastro rápido sem burocracia
- **Valor entregue:** Acesso imediato à plataforma para começar a usar
- **Frequência de uso:** Única vez (por usuário)

#### 2.3 User Stories Relacionadas
- "Como empreendedor, quero criar conta rapidamente sem burocracia"
- "Como empreendedor, quero receber confirmação de que deu certo"
- "Como empreendedor, quero começar a usar a plataforma imediatamente"
- "Como empreendedor, quero cadastrar meu negócio junto com meus dados"

### 3. Elementos Obrigatórios (O Que DEVE Ter)

#### 3.1 Dados a Exibir
- [ ] **Logo UNIQ:** Identidade visual da marca
- [ ] **Tagline:** "O Norte para Empreendedores"
- [ ] **Indicador de progresso:** Mostrar em qual passo o usuário está (se usar wizard)

#### 3.2 Funcionalidades Essenciais
- [ ] Campo nome completo
- [ ] Campo nome da empresa/negócio
- [ ] Campo email
- [ ] Campo telefone/WhatsApp com máscara
- [ ] Campo senha com indicador de força
- [ ] Campo confirmação de senha
- [ ] Checkbox de aceite dos termos de uso
- [ ] Botão de criação de conta
- [ ] Link para quem já tem conta

#### 3.3 Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Nome completo | Texto | Sim | Mínimo 3 caracteres, máximo 100 |
| Nome da empresa | Texto | Sim | Mínimo 2 caracteres, máximo 100 |
| Email | Email | Sim | Formato válido, único no sistema |
| Telefone | Tel | Sim | Máscara (XX) XXXXX-XXXX, validação de DDD |
| Senha | Password | Sim | Mínimo 6 caracteres |
| Confirmar senha | Password | Sim | Deve coincidir com campo senha |
| Aceito termos | Checkbox | Sim | Deve estar marcado |

### 4. Elementos Opcionais (O Que PODE Ter)

#### 4.1 Funcionalidades Adicionais
- [ ] Cadastro por passos (wizard) para não sobrecarregar
- [ ] Validação de email em tempo real (disponibilidade)
- [ ] Preview do nome da loja/URL personalizada
- [ ] Dicas de segurança sobre senha
- [ ] Link para visualizar termos de uso antes de aceitar

#### 4.2 Wizard de 3 Passos (Opcional)
- **Passo 1 - Dados pessoais:** Nome, email, telefone
- **Passo 2 - Dados do negócio:** Nome da empresa
- **Passo 3 - Segurança:** Senha e termos

### 5. Ações Possíveis

#### 5.1 Ações Primárias
1. **Criar conta:**
   - **Gatilho:** Botão "Criar minha conta"
   - **Resultado:** Validação de todos os campos, criação do usuário e empresa
   - **Confirmação:** Não necessária

2. **Avançar passo (se wizard):**
   - **Gatilho:** Botão "Próximo"
   - **Resultado:** Validação do passo atual e avanço
   - **Confirmação:** Não necessária

#### 5.2 Ações Secundárias
1. **Voltar passo:** Retorna ao passo anterior (se wizard)
2. **Já tenho conta:** Navega para tela de login
3. **Ver termos:** Abre modal ou nova aba com termos completos

### 6. Estados da UI

#### 6.1 Empty State
- **Quando aparece:** Tela inicial de cadastro
- **Mensagem:** "Vamos começar!" ou mensagem acolhedora de boas-vindas
- **Call-to-Action:** Foco no primeiro campo

#### 6.2 Loading State
- **Quando aparece:** Durante criação da conta
- **Tipo:** Indicador de progresso
- **Mensagem:** "Criando sua conta..."

#### 6.3 Error State
- **Quando aparece:** Validação falhou
- **Mensagem:** Campos específicos com erro indicados visualmente
- **Ação de recuperação:** Destacar campos inválidos com mensagens específicas

#### 6.4 Success State
- **Quando aparece:** Conta criada com sucesso
- **Feedback:** Mensagem de parabéns e próximos passos
- **Ação:** Redirecionamento automático para dashboard ou onboarding

### 7. Integrações

#### 7.1 Com Outras Telas
- Navega para: Login (`/auth/login`)
- Navega para: Dashboard (`/dashboard`) ou Onboarding
- Recebe de: Landing pages, indicações

#### 7.2 Com Outros Módulos
- **Autenticação:** Criação de usuário no Supabase Auth
- **Empresas:** Criação automática do registro da empresa vinculada
- **MEL:** Dispara mensagem de boas-vindas via WhatsApp

#### 7.3 APIs/Serviços
- **Supabase Auth:** Criação de usuário
- **API de Validação:** Verificar email único em tempo real
- **WhatsApp API:** Envio de mensagem de boas-vindas
- **Email Service:** Email de confirmação de cadastro

### 8. Regras de Negócio

1. **Email único:** Não permitir cadastro com email já existente
2. **Senha mínima:** 6 caracteres (balancear segurança e usabilidade)
3. **Telefone validado:** Aceitar apenas formato brasileiro válido
4. **Termos obrigatórios:** Não permitir criação sem aceitar termos
5. **Empresa vinculada:** Criar automaticamente registro na tabela empresas
6. **Mensagem de boas-vindas:** Enviar email e WhatsApp de boas-vindas
7. **Trial/Plano:** Associar ao plano Starter (R$ 109/mês) ou trial de 7 dias

### 9. Notas e Considerações

- Processo deve ser o mais rápido possível - empreendedores não têm paciência para formulários longos
- Validação em tempo real reduz frustração (verificar email disponível enquanto digita)
- Indicador de força da senha ajuda a criar senhas mais seguras
- Wizard opcional pode melhorar experiência se formulário ficar muito extenso
- Telefone é essencial para comunicação via WhatsApp (MEL)
- Após criação, enviar para onboarding guiado (Day 0) ao invés de jogar direto no dashboard

---

## 📱 Tela 3: Esqueci a Senha

### 1. Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Esqueci a Senha |
| **Rota/URL** | `/auth/esqueci-senha` |
| **Objetivo Principal** | Recuperação de acesso de forma segura |
| **Permissões de Acesso** | Público (não requer autenticação) |
| **Módulo/Pai** | Fluxo de Autenticação |
| **Prioridade MVP** | ✅ Essencial |

### 2. Contexto do Usuário

#### 2.1 Quem Usa Esta Tela
- **Perfil:** Usuário que esqueceu sua senha e precisa recuperar acesso
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Momento de preocupação/ansiedade - quer resolver rápido

#### 2.2 Por Que Esta Tela Existe
- **Problema que resolve:** Recuperação de acesso quando senha é esquecida
- **Valor entregue:** Caminho seguro para redefinir senha sem burocracia
- **Frequência de uso:** Ocasional (situações de esquecimento)

#### 2.3 User Stories Relacionadas
- "Como empreendedor que esqueci a senha, quero recuperar acesso de forma simples"
- "Como empreendedor, quero sentir segurança no processo de recuperação"
- "Como empreendedor, quero receber instruções claras no meu email"

### 3. Elementos Obrigatórios (O Que DEVE Ter)

#### 3.1 Dados a Exibir
- [ ] **Logo UNIQ:** Identidade visual da marca
- [ ] **Explicação amigável:** Texto explicando o processo de recuperação
- [ ] **Ícone de segurança/cadeado:** Elemento visual transmitindo segurança

#### 3.2 Funcionalidades Essenciais
- [ ] Campo de email
- [ ] Botão de envio do link de recuperação
- [ ] Link para voltar ao login

#### 3.3 Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Email | Email | Sim | Formato válido de email |

### 4. Elementos Opcionais (O Que PODE Ter)

#### 4.1 Funcionalidades Adicionais
- [ ] Dicas sobre segurança de senhas
- [ ] Link para suporte em caso de não receber email
- [ ] Timer indicando quando pode solicitar novo link

### 5. Ações Possíveis

#### 5.1 Ações Primárias
1. **Enviar link de recuperação:**
   - **Gatilho:** Botão "Enviar link de recuperação"
   - **Resultado:** Email enviado com token de recuperação
   - **Confirmação:** Mensagem de sucesso (mesmo se email não existir)

#### 5.2 Ações Secundárias
1. **Voltar para login:** Retorna à tela de login

### 6. Estados da UI

#### 6.1 Empty State
- **Quando aparece:** Tela inicial
- **Mensagem:** Explicação sobre o processo ("Vamos te ajudar a recuperar o acesso...")
- **Call-to-Action:** Foco no campo de email

#### 6.2 Loading State
- **Quando aparece:** Durante envio do email
- **Tipo:** Indicador no botão
- **Mensagem:** "Enviando..."

#### 6.3 Error State
- **Quando aparece:** Formato de email inválido
- **Mensagem:** "Por favor, digite um email válido"
- **Ação de recuperação:** Destacar campo com erro

#### 6.4 Success State
- **Quando aparece:** Formulário enviado (independentemente de email existir)
- **Mensagem:** "Se esse email estiver cadastrado, enviamos instruções para recuperar sua senha. Verifique sua caixa de entrada e spam."
- **Ação:** Opção de reenviar após 60 segundos

### 7. Integrações

#### 7.1 Com Outras Telas
- Navega para: Login (`/auth/login`)
- Navega para: Recuperação de senha com token (`/auth/recuperar-senha/:token`)

#### 7.2 Com Outros Módulos
- **Email Service:** Envio de email com link de recuperação

#### 7.3 APIs/Serviços
- **Supabase Auth:** Geração de token de recuperação
- **Email Service:** Envio de email transacional

### 8. Regras de Negócio

1. **Mensagem única:** Sempre exibir mensagem de sucesso, mesmo se email não existir (prevenir enumeração)
2. **Token de recuperação:** Válido por 24 horas
3. **Rate limiting:** Permitir apenas 3 solicitações por email por hora
4. **Token único:** Cada solicitação invalida tokens anteriores do mesmo usuário
5. **Link único:** Token deve ser de uso único
6. **Notificação:** Email deve conter link direto com token e instruções claras

### 9. Notas e Considerações

- Tom de voz deve ser acolhedor e tranquilizador - usuário está preocupado
- Processo deve parecer seguro (elementos visuais de segurança)
- Link no email deve ser fácil de clicar (especialmente no celular)
- Incluir informações de contato de suporte no email
- Considerar enviar também via WhatsApp se usuário tiver número confirmado

---

## 📱 Tela 4: Recuperação de Senha (Redefinir)

### 1. Metadados

| Campo | Valor |
|-------|-------|
| **Nome da Tela** | Redefinir Senha |
| **Rota/URL** | `/auth/recuperar-senha/:token` |
| **Objetivo Principal** | Definir nova senha de forma segura |
| **Permissões de Acesso** | Público (requer token válido na URL) |
| **Módulo/Pai** | Fluxo de Autenticação |
| **Prioridade MVP** | ✅ Essencial |

### 2. Contexto do Usuário

#### 2.1 Quem Usa Esta Tela
- **Perfil:** Usuário que recebeu email de recuperação
- **Conhecimento técnico:** Baixo
- **Contexto de uso:** Chegou por email, quer resolver logo para voltar a usar

#### 2.2 Por Que Esta Tela Existe
- **Problema que resolve:** Permitir criação de nova senha de forma segura
- **Valor entregue:** Retorno rápido ao sistema com nova senha
- **Frequência de uso:** Ocasional (após solicitar recuperação)

#### 2.3 User Stories Relacionadas
- "Como empreendedor, quero definir uma nova senha de forma simples"
- "Como empreendedor, quero saber se o link ainda é válido"
- "Como empreendedor, quero retornar ao sistema imediatamente após redefinir"

### 3. Elementos Obrigatórios (O Que DEVE Ter)

#### 3.1 Dados a Exibir
- [ ] **Logo UNIQ:** Identidade visual da marca
- [ ] **Validação de token:** Verificar se token é válido ao carregar

#### 3.2 Funcionalidades Essenciais
- [ ] Campo nova senha com indicador de força
- [ ] Campo confirmar nova senha
- [ ] Botão de redefinir senha
- [ ] Estado de token inválido/expirado

#### 3.3 Campos de Formulário

| Campo | Tipo | Obrigatório | Validações |
|-------|------|-------------|------------|
| Nova senha | Password | Sim | Mínimo 6 caracteres |
| Confirmar nova senha | Password | Sim | Deve coincidir com nova senha |

### 4. Elementos Opcionais (O Que PODE Ter)

#### 4.1 Funcionalidades Adicionais
- [ ] Requisitos de senha visíveis (checklist)
- [ ] Dicas de criação de senha segura
- [ ] Opção de copiar senha gerada automaticamente

### 5. Ações Possíveis

#### 5.1 Ações Primárias
1. **Redefinir senha:**
   - **Gatilho:** Botão "Redefinir senha"
   - **Resultado:** Senha atualizada, token invalidado
   - **Confirmação:** Não necessária

#### 5.2 Ações Secundárias
1. **Solicitar novo link:** Se token expirado, redireciona para tela de esqueci senha
2. **Voltar para login:** Após sucesso, opcional

### 6. Estados da UI

#### 6.1 Empty State
- **Quando aparece:** Token válido, formulário pronto
- **Mensagem:** "Crie uma nova senha para sua conta"
- **Call-to-Action:** Foco no campo de senha

#### 6.2 Loading State
- **Quando aparece:** Durante validação do token e atualização da senha
- **Tipo:** Indicador de carregamento
- **Mensagem:** "Validando..." / "Atualizando..."

#### 6.3 Error State - Token Inválido/Expirado
- **Quando aparece:** Token expirado ou já utilizado
- **Mensagem:** "Este link expirou ou já foi utilizado. Solicite um novo link de recuperação."
- **Ação de recuperação:** Botão "Solicitar novo link"

#### 6.4 Error State - Validação
- **Quando aparece:** Senhas não coincidem ou não atendem requisitos
- **Mensagem:** "As senhas não coincidem" ou "Senha deve ter no mínimo 6 caracteres"
- **Ação de recuperação:** Destacar campos com erro

#### 6.5 Success State
- **Quando aparece:** Senha redefinida com sucesso
- **Feedback:** "Senha atualizada com sucesso!"
- **Ação:** Redirecionamento automático para login após 3 segundos

### 7. Integrações

#### 7.1 Com Outras Telas
- Navega para: Login (`/auth/login`)
- Recebe de: Email de recuperação

#### 7.2 Com Outros Módulos
- **Autenticação:** Atualização de senha no Supabase Auth

#### 7.3 APIs/Serviços
- **Supabase Auth:** Validação de token e atualização de senha
- **Email opcional:** Notificação de senha alterada (segurança)

### 8. Regras de Negócio

1. **Validação de token:** Verificar validade antes de exibir formulário
2. **Token expirado:** Se token > 24h, exibir erro e opção de novo link
3. **Token único:** Após uso, invalidar token imediatamente
4. **Confirmação de senha:** Ambos os campos devem coincidir
5. **Senha anterior:** Não permitir reutilizar a mesma senha anterior (opcional)
6. **Sessões ativas:** Invalidar todas as sessões ativas do usuário (segurança)
7. **Notificação:** Enviar email confirmando alteração de senha

### 9. Notas e Considerações

- Token vem na URL como parâmetro - extrair e validar imediatamente
- Se token inválido, não mostrar formulário - apenas mensagem de erro
- Redirecionamento automático após sucesso evita confusão
- Notificação por email de alteração é importante para segurança (detectar alterações não autorizadas)
- Considerar enviar notificação também via WhatsApp

---

## 📋 Resumo do Fluxo de Autenticação

### Fluxo Completo

```
Login ───────────────────────────────────────────────────────────► Dashboard
  │
  ├─► Esqueci senha ──► Email ──► Recuperar senha (token) ──► Nova senha
  │
  └─► Criar conta ──► Wizard (opcional) ──► Conta criada ──► Dashboard/Onboarding
```

### Pontos de Atenção

1. **Mobile First:** Todas as telas devem funcionar perfeitamente em celular
2. **Segurança:** Nunca expor informação sobre existência de emails
3. **Velocidade:** Processos devem ser rápidos - empreendedores não têm paciência
4. **Clareza:** Mensagens de erro devem ser amigáveis e acolhedoras
5. **Integração MEL:** WhatsApp é canal importante para comunicação

### Checklist de Qualidade

- [ ] Todas as validações documentadas
- [ ] Estados de erro mapeados
- [ ] Fluxo mobile otimizado
- [ ] Mensagens de segurança implementadas
- [ ] Integração com Supabase Auth definida
- [ ] Email transacional configurado
- [ ] Redirecionamentos pós-ação definidos

---

**Documento pronto para Figma Make:** Este documento segue a Matriz de Documentação UI da UNIQ e pode ser usado para gerar designs no Figma Make seguindo o princípio de separar "O QUE" (funcional) do "COMO" (visual).

**Próximo passo:** Usar o [Template de Prompt para Figma Make](./MATRIZ_DOCUMENTACAO_UI.md#72-exemplo-de-prompt-completo) para transformar estas especificações em prompts efetivos.
