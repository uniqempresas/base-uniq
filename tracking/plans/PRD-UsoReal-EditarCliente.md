# PRD — Uso Real Doceê: Edição de Cliente (dados básicos)

> **Data:** 2026-09-11
> **Origem:** `tracking/USO_REAL_DOCEE.md` — feedback do fundador: "não consigo editar um cliente criado — o botão de edição é apenas visual?"
> **Tipo:** Hotfix de uso real (frontend + persistência), seguindo o precedente do hotfix de isolamento de tenant (itens 1–6).
> **Audiência:** agente implementador. Documento autocontido.

---

## 1. Resumo Executivo

### 1.1 Objetivo
Tornar o botão **"Editar" de cliente funcional** — hoje ele é 100% visual (sem `onClick`). O cliente criado grava em `crm_leads` no Supabase, mas não existe nenhum fluxo de atualização no app. Após esta entrega, o usuário consegue editar nome, telefone, e-mail e tags de um cliente criado, tanto a partir da lista de clientes quanto do detalhe do cliente.

### 1.2 Escopo desta entrega
- ✅ Hook de atualização de cliente (UPDATE em `crm_leads`)
- ✅ Modal de edição reutilizando o form do cadastro (mesmo layout, campos pré-preenchidos)
- ✅ Botão "Editar" funcional na lista (cards e tabela) e no detalhe do cliente
- ✅ Estados visuais: loading no botão salvar, erro inline, toast de sucesso
- ❌ Exclusão de cliente (botão Trash2 continua sem ação — fora do escopo desta entrega)
- ❌ Edição de documento, aniversário, observações internas e demais campos avançados (campos não existentes na tabela `crm_leads` ou fora do MVP do form)
- ❌ WhatsApp na tabela (botão inerte — fora do escopo, porém o card já abre WhatsApp corretamente)

### 1.3 Stakeholders
- Fundador (valida pelo celular) — usa o CRM da Doceê no uso real
- Clientes da Doceê — dados cadastrais corrigíveis quando erram telefone/e-mail

---

## 2. Sobreposição com o existente

| Ponto | Onde está hoje | O que muda |
|-------|----------------|-----------|
| Form (markup + validação) | `NovoClienteModal` interno de `ClientesPage.tsx:146-304` | Extraído para componente reutilizável `ClienteFormModal` |
| Criação | `use-criar-cliente.ts` — INSERT em `crm_leads` | Inalterado (reutilizado pelo modal em modo criar) |
| Atualização | Não existe | Novo `use-atualizar-cliente.ts` — UPDATE em `crm_leads` |
| Botão Editar (cards) | `ClientesPage.tsx:104-109` — `onClick` só `stopPropagation()` | Abre modal de edição com o cliente |
| Botão Editar (tabela) | `ClientesPage.tsx:704-706` — sem `onClick` | Abre modal de edição com o cliente |
| Botão Editar (detalhe) | `ClienteDetalhePage.tsx:721-724` — sem `onClick` | Abre modal de edição com o cliente |
| Recarga do detalhe | `use-cliente.ts` não expõe recarga | Adicionar `recarregar()` (espelhando `use-clientes.ts`) |

---

## 3. Regras de Negócio

- **Persistência real:** sem sessão autenticada e `empresa_id` resolvido, NÃO gravar (falha explícita) — mesma regra do `use-criar-cliente.ts` (sem fallback cego).
- **Campos editáveis:** `nome` (obrigatório), `telefone` (opcional), `email` (opcional), `tags` (opcional) — exatamente os campos do form de cadastro.
- **Isolamento por tenant:** UPDATE filtrado por `id` **e** `empresa_id` — nunca atualizar lead de outro tenant.
- **Origem imutável:** `origem` (whatsapp/manual) não é editável pelo form.
- **Modo demo (sem sessão):** o modal de edição pode abrir mostrando dados do mock, mas salvar exige sessão — a API falha com erro explícito e a UI mostra a mensagem.

---

## 4. Critérios de Aceite

1. Na lista de clientes, clicar no ícone de edição (card ou tabela) abre o modal com os dados do cliente preenchidos.
2. No detalhe do cliente, o botão "Editar" abre o mesmo modal preenchido.
3. Salvar com alterações grava em `crm_leads` e a tela mostra os dados atualizados + toast de sucesso.
4. Salvar sem sessão mostra erro (não grava silenciosamente em outro tenant).
5. Estados loading/erro/sucesso presentes.
6. `npm run build` passa; Vercel deploy READY; fundador valida no celular.

---

## 5. Fora de Escopo / Não Fazer

- Não criar/excluir tabelas nem alterar RLS.
- Não tocar em `src/lib/supabase.ts`.
- Não implementar exclusão de cliente.
- Não redesenhar o modal (reutiliza layout existente — regra "wireframe entrega estrutura, design real no OpenDesign").
- Não migrar para Next.js.