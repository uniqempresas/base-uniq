# PRD — Excluir pedido cancelado

> **Pipeline SDD · etapa 1 de 3.** Documentos irmãos: `SPEC-DeletarPedidoCancelado.md` · `WIRE-DeletarPedidoCancelado.md`.
> **Origem:** item 4 do lote de ajustes de 17/09/2026 (`tracking/AJUSTES_17-09-2026.md`).
> **Status:** 📝 PRD/SPEC/WIRE escritos — **aguardando aprovação do WIRE** pelo fundador (regra de ouro do `AGENTS.md`).

---

## 1. WHY (por que isso existe)

Hoje **não existe nenhuma forma de remover um pedido** da lista. Pedidos cancelados ficam para sempre misturados aos pedidos válidos, poluindo a operação — inclusive os pedidos de **teste** da Doceê, que o fundador já pediu para limpar duas vezes via SQL manual.

O fundador pediu: *"Quero ter a opção de deletar um pedido cancelado."*

**Restrição central:** pedido **não é rascunho** — é documento com valor contábil. Apagar de verdade (`DELETE`) cascatearia e destruiria a conta a receber e o histórico. Por isso a decisão foi **exclusão lógica (soft delete)**.

**Requisito de arquitetura do fundador:** a operação deve ser uma **PROCEDURE/RPC no banco**, não lógica no cliente — para poder ser chamada **tanto pela Base UNIQ quanto por outros consumidores** (loja, n8n, automações futuras), com as regras garantidas em um único lugar.

---

## 2. Decisões do fundador (17/09/2026) — FECHADAS

| # | Decisão | Resolução |
|---|---|---|
| D1 | Tipo de exclusão | **Soft delete** — sai da lista, registro preservado |
| D2 | Conta a receber **paga** | **Bloquear** a exclusão — não se apaga dinheiro que entrou |
| D3 | Estoque | **Devolver** o estoque ao excluir |
| D4 | Onde fica a ação | **Detalhe + lista** |
| D5 | Quem pode | **Qualquer usuário da empresa** (hoje é só o dono e a esposa) |
| D6 | Implementação | **PROCEDURE/RPC** no banco, chamável pelo cliente e pela Base UNIQ |

---

## 3. Regras de negócio

| # | Regra | Consequência se violada |
|---|---|---|
| R1 | Só pedido com `status_venda = 'cancelado'` pode ser excluído | RPC devolve erro `STATUS_INVALIDO` |
| R2 | Pedido com conta a receber **paga** **não** pode ser excluído | RPC devolve erro `PAGAMENTO_REGISTRADO` |
| R3 | Pedido já excluído não pode ser excluído de novo | RPC devolve erro `JA_EXCLUIDO` (idempotência) |
| R4 | A exclusão é **escopada por empresa** | RPC devolve `NAO_ENCONTRADO` se a venda for de outro tenant |
| R5 | O estoque **só é devolvido se ele foi baixado** | Sem isso, pedidos manuais **inflariam** o estoque (ver §5) |
| R6 | A exclusão fica **registrada** no histórico do pedido | Auditoria: quem excluiu, quando e por quê |
| R7 | Pedido excluído **some de todas as leituras** — inclusive do **DRE** | Senão o DRE contaria receita de um pedido que não existe mais |

---

## 4. Escopo

**Entra:**
- Coluna(s) de exclusão lógica em `me_venda`.
- RPC `fn_excluir_pedido_cancelado(...)` com todas as regras acima.
- Filtro de exclusão nos **4 caminhos de leitura** que hoje leem `me_venda`.
- Botão **"Excluir pedido"** no detalhe e na lista, **visível apenas** em pedido cancelado.
- Modal de confirmação (com aviso do que vai acontecer) + estados de loading/erro/sucesso.
- Registro da exclusão em `me_venda_historico`.

**Não entra (v1):**
- Excluir pedido que **não** esteja cancelado (nem "cancelar e excluir" em um passo).
- Tela de "lixeira" / restaurar pedido excluído.
- Exclusão em massa (selecionar vários e excluir).
- Exclusão de **orçamento** ou de **venda de serviço** (`me_venda_servicos`) — escopo é `me_venda`.
- Alterar o fluxo de cancelamento (`use-atualizar-status-pedido`).

---

## 5. ⚠️ Decisão técnica que o agente tomou (vetar se discordar)

**R5 — devolver estoque só quando ele foi realmente baixado.**

Fato medido: **nem todo pedido baixa estoque.**
- O caminho do **n8n/WhatsApp** e da **Loja** chama a RPC `registrar_venda`, que faz `estoque_atual = estoque_atual - quantidade`. **Baixa.**
- O caminho **"Novo Pedido"** da tela (`useCriarPedido`) grava em `me_venda`/`me_itens_venda` **sem** mexer no estoque. **Não baixa.**

Se a exclusão devolvesse estoque sempre, um pedido manual excluído **aumentaria** o estoque de um produto que nunca foi debitado — estoque fantasma.

**Regra proposta:** devolver o estoque **apenas se existir conta a receber vinculada** (`me_contas_receber.venda_id = venda.id`). Motivo: essa conta é criada **somente** pela RPC `registrar_venda` — ou seja, a existência dela é a prova de que a RPC rodou e o estoque foi debitado. (E, pela R2, se a conta existir ela estará **em aberto**, porque paga bloqueia.)

**Alternativa mais robusta** (mais caro): adicionar `me_venda.estoque_baixado boolean` e passar a gravar isso em `registrar_venda`. Elimina a inferência, mas mexe numa RPC que está em produção e alimenta o n8n.

**Recomendação do agente:** a regra por conta vinculada, na v1. Se o fundador preferir, a coluna explícita vira uma evolução.

---

## 6. Atores

| Ator | O que faz |
|---|---|
| **Operador da Base UNIQ** (dono/esposa) | Exclui pedido cancelado pela tela |
| **Consumidor externo** (loja, n8n, automação) | Chama a mesma RPC direto — as regras valem igual |
| **DRE / relatórios** | Passam a ignorar pedidos excluídos automaticamente |

---

## 7. Critérios de aceite

| # | Critério | Como verificar |
|---|---|---|
| CA1 | Só aparece "Excluir pedido" em pedido **cancelado** | Abrir um pedido ativo → botão não existe |
| CA2 | Excluir um pedido cancelado o remove da lista **sem** apagar nada do banco | `select deletado_em from me_venda where id = ...` → preenchido; as linhas filhas continuam existindo |
| CA3 | Pedido com **pagamento registrado** não pode ser excluído, com mensagem clara | Chamar a RPC → `success: false`, `code: PAGAMENTO_REGISTRADO` |
| CA4 | Pedido **não** cancelado não pode ser excluído | Chamar a RPC → `success: false`, `code: STATUS_INVALIDO` |
| CA5 | Excluir duas vezes não faz efeito duplo (nem devolve estoque duas vezes) | 2ª chamada → `JA_EXCLUIDO` |
| CA6 | Venda de outra empresa não é alcançável | Chamar com `p_empresa_id` errado → `NAO_ENCONTRADO` |
| CA7 | O estoque volta **só** quando foi baixado | Excluir pedido do WhatsApp → estoque sobe. Excluir pedido manual → estoque **não** muda |
| CA8 | Pedido excluído **não** aparece no DRE | Conferir o total do DRE antes/depois |
| CA9 | Pedido excluído **não** aparece na loja ("Meus pedidos") | Abrir `/loja/docee/conta` com o telefone do cliente |
| CA10 | A exclusão fica registrada no histórico | `me_venda_historico` ganha uma linha |
| CA11 | Nenhum estado visual faltando | loading, erro, sucesso e o caso "lista vazia" |

---

## 8. Riscos

| Risco | Mitigação |
|---|---|
| Esquecer um caminho de leitura e o pedido excluído reaparecer | O SPEC lista os **4** caminhos existentes; a verificação exige conferir cada um |
| Estoque fantasma (devolver o que não foi baixado) | R5 — devolve só com conta vinculada |
| Alguém chamar a RPC sem ser da empresa | `p_empresa_id` obrigatório + `SECURITY DEFINER` validando o tenant |
| Exclusão virar "botão fácil" e apagar pedido bom | Só status `cancelado` + modal de confirmação explícito |
| O DRE mudar de valor e o fundador achar que quebrou | Documentado: **é o comportamento correto** — receita de pedido excluído não existe |

---

## 9. Métrica de sucesso

O fundador consegue limpar os pedidos de teste **pela tela**, sem SQL manual — e a regra fica no banco, valendo para qualquer consumidor futuro.

---

*PRD criado em 17/09/2026 pelo Orchestrator. Decisões D1–D6 tomadas pelo fundador em 17/09/2026. Aguardando aprovação do WIRE para implementar.*
