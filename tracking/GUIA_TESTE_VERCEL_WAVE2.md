# 🧪 GUIA DE TESTE NA VERCEL — Wave 2 (18/09/2026)

> **Para o fundador.** O que testar desta rodada, com o que fazer e o que deve acontecer.
> **URL:** https://base-uniq.vercel.app
> **Como usar:** de cima para baixo, no celular. Cada item diz **o que era antes** — se voltar o comportamento antigo, é regressão.

**Entra neste push:**
- **Item 4** — excluir pedido cancelado (banco + detalhe + lista)
- **Item 8** — modal de criar pedido (sem rolagem horizontal) + cliente real
- **Item 9** — rolagem nas conversas
- **Emenda** — clique na linha da tabela abre o detalhe
- **n8n** — `Cria_Cliente` agora grava `origem` (já aplicado no workflow, **não** depende do deploy)

---

## A. EXCLUIR PEDIDO CANCELADO (item 4)

### A1. O botão só existe em pedido **cancelado**
- **Faça:** abrir um pedido que **não** está cancelado (Aguardando, Recebido, Confirmado, Em Separação…).
- **Espere:** **não existe** botão "Excluir pedido" (não fica desabilitado — não aparece).
- **Faça:** abrir um pedido **Cancelado**.
- **Espere:** o botão aparece, em **vermelho**, por último na linha de ações.

### A2. Na lista, a lixeira só aparece em cancelado
- **Faça:** olhar a lista nas **duas** visões (grade e tabela).
- **Espere:** o ícone de lixeira aparece **só** nos pedidos cancelados. Nos outros, nenhum.

### A3. Excluir de verdade
- **Faça:** tocar na lixeira de um pedido cancelado.
- **Espere:** abre o modal com **"Excluir pedido?"**, o número, o cliente, o bloco **"O que vai acontecer"** e um campo de **motivo (opcional)**. Botão vermelho **"Excluir pedido"**.
- **Faça:** confirmar.
- **Espere:** toast **"Pedido excluído com sucesso!"** e o pedido **some da lista**.
- **Faça:** **recarregar** a página.
- **Espere:** o pedido **continua fora** (não volta).

### A4. Não conta como receita
- **Faça:** anotar o total de receita do **DRE** antes, excluir um pedido cancelado e conferir depois.
- **Espere:** o valor **não** inclui o pedido excluído. *(Isso é correto — receita de pedido excluído não existe.)*

### A5. Bloqueio financeiro (só se você tiver o caso)
- **Faça:** se existir um pedido **cancelado com pagamento confirmado**, tentar excluir.
- **Espere:** o modal **recusa** com a mensagem *"Este pedido tem pagamento registrado. Excluir apagaria dinheiro que entrou de verdade."* e **não fecha**.
- **Se não tiver esse caso hoje, pule** — a regra está no banco e já foi testada.

### A6. O estoque volta quando deve
- **Faça:** se puder, excluir um pedido cancelado que veio do **WhatsApp** e conferir o estoque do produto depois.
- **Espere:** o estoque **sobe** (foi devolvido).
- **Pedido criado manualmente pela tela:** o estoque **não muda** (ele nunca foi baixado). Isso é o correto.

---

## B. CRIAR PEDIDO — MODAL E CLIENTE REAL (item 8)

### B1. Sem barra horizontal (o problema que você relatou)
- **Faça:** abrir **"Novo Pedido"** no **celular** e descer até **"Produtos do pedido"**.
- **Espere:** tudo cabe na largura da tela — **nada de rolagem horizontal**. O seletor de produto ocupa a linha inteira; quantidade e botão de adicionar ficam na linha de baixo.
- **No desktop:** continua em linha, como era.
- **Antes:** a linha estourava e o modal inteiro ganhava rolagem horizontal.

### B2. Cliente real — buscar quem já existe
- **Faça:** no campo **Cliente**, digitar parte do nome de um cliente que você sabe que existe.
- **Espere:** aparece uma **lista de sugestões** com **nome + telefone**.

### B3. Selecionar
- **Faça:** tocar numa sugestão.
- **Espere:** aparece um **chip verde** tipo *"Cliente existente — o pedido usará este cadastro"*, com um X para desfazer.

### B4. Salvar usa o cliente certo (sem duplicar)
- **Faça:** salvar o pedido e depois ir em `/crm/clientes`.
- **Espere:** **nenhum cliente novo duplicado** foi criado — o pedido ficou ligado ao cadastro existente.

### B5. Cliente que não existe é criado na hora
- **Faça:** digitar um nome/telefone que **não** existe.
- **Espere:** a lista mostra *"Nenhum cliente encontrado — será criado um novo ao salvar."*
- **Faça:** salvar e conferir no CRM.
- **Espere:** o cliente **foi criado**, com o telefone normalizado.
- **Antes:** o sistema casava por **nome exato** — "Henriq" e "Henriq Silva" viravam **dois** clientes.

### B6. Bônus do n8n — origem do cliente do WhatsApp
- **Faça:** mandar uma mensagem de WhatsApp de um **número novo** e depois olhar o CRM.
- **Espere:** o cliente aparece como **WhatsApp**.
- **Antes:** aparecia como **Manual** (porque `origem` vinha vazio e o CRM tratava vazio como manual).

---

## C. ROLAGEM NAS CONVERSAS (item 9)

### C1. Chatbot (`/chatbot`)
- **Faça:** abrir uma conversa longa.
- **Espere:** a conversa **rola** dentro da janela; o cabeçalho e o campo de escrita ficam **fixos**; já abre na **mensagem mais recente**.
- **Antes:** o conteúdo era **cortado, sem barra de rolagem**.

### C2. No celular (o caso crítico)
- **Faça:** rolar a conversa com o dedo e enviar uma mensagem.
- **Espere:** rola normalmente, o campo de escrita continua visível e a página **não trava**.

### C3. CRM — aba "Conversa" do cliente
- **Faça:** abrir um cliente → aba **"Conversa"**.
- **Espere:** a transcrição rola **dentro do card** e o botão **"Ver conversa completa no Chatbot"** continua visível.

---

## D. CLIQUE NA LINHA DA TABELA (emenda)

### D1. A linha inteira abre o detalhe
- **Faça:** na visão **tabela**, clicar em qualquer parte de uma linha (menos nos controles).
- **Espere:** abre o **detalhe do pedido**.
- **Antes:** só um elemento interno navegava — clicar na linha não fazia nada.

### D2. O checkbox não navega
- **Faça:** clicar no **checkbox** de seleção.
- **Espere:** **só seleciona**. Não abre o detalhe.

### D3. O menu de ações não navega
- **Faça:** clicar no **⋯** e depois num item do menu.
- **Espere:** o menu abre e o item funciona. **Não** abre o detalhe junto.

### D4. A lixeira não navega
- **Faça:** clicar na lixeira de um cancelado.
- **Espere:** abre o **modal de excluir**. **Não** abre o detalhe junto.

---

## E. SANIDADE (não pode ter quebrado)

### E1. Filtros continuam funcionando
- **Faça:** usar os **chips** de status do pedido, status de pagamento e canal; trocar a visualização; sair e voltar.
- **Espere:** tudo como antes — inclusive os **filtros salvos** ao voltar.

### E2. Telas do ERP
- **Faça:** passar por **Dashboard, Financeiro, Estoque, CRM, Métricas**.
- **Espere:** nenhuma tela em **branco**.

---

## 📋 Checklist

| # | Teste | ☐ |
|---|---|---|
| A1 | Botão de excluir só em pedido cancelado | ☐ |
| A2 | Lixeira só em cancelado (grade + tabela) | ☐ |
| A3 | Excluir → some da lista e não volta | ☐ |
| A4 | Pedido excluído não conta no DRE | ☐ |
| A5 | Bloqueio se houver pagamento registrado *(se houver o caso)* | ☐ |
| A6 | Estoque devolvido quando deve | ☐ |
| B1 | Modal sem barra horizontal no celular | ☐ |
| B2 | Busca de cliente sugere nome + telefone | ☐ |
| B3 | Chip de cliente selecionado | ☐ |
| B4 | Sem cliente duplicado ao salvar | ☐ |
| B5 | Cliente novo criado na hora | ☐ |
| B6 | Cliente do WhatsApp aparece como **WhatsApp** | ☐ |
| C1 | Chatbot rola e abre na última mensagem | ☐ |
| C2 | Rolagem ok no celular | ☐ |
| C3 | Aba "Conversa" do CRM rola | ☐ |
| D1 | Linha da tabela abre o detalhe | ☐ |
| D2 | Checkbox não navega | ☐ |
| D3 | Menu de ações não navega | ☐ |
| D4 | Lixeira não navega | ☐ |
| E1 | Filtros e persistência intactos | ☐ |
| E2 | Nenhuma tela branca | ☐ |

---

## 🔎 Se algo falhar

Mande **o item (ex.: B1)**, **o que você viu** e **o que esperava** — de preferência com print. Localizo o arquivo e a linha direto.

**Já aplicado fora do deploy** (não depende de testar a Vercel):
- **n8n `Cria_Cliente`** agora grava `origem = whatsapp` (workflow validado: 0 erros, 0 warnings).
- **Banco:** RPC `fn_excluir_pedido_cancelado` + colunas de exclusão lógica; e os **2 triggers de vínculo conversa↔cliente** (pendência D').

---

*Criado em 18/09/2026 pelo Orchestrator.*
