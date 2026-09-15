# PRD — T2.10: Detalhe do Pedido Sem Mock (persistir rastreio, cancelamento, histórico e endereço)

## Objetivo

Eliminar os últimos campos da tela `/vendas/pedidos/:id` que hoje **só existem no mock ou no estado local do navegador** — fazendo rastreio, cancelamento, histórico (timeline) e endereço de entrega persistirem no Supabase e sobreviverem ao recarregar a página.

## Contexto / Diagnóstico (Research — 15/09/2026)

O detalhe do pedido já é majoritariamente real:

| Já é real (Supabase) | Onde |
|---|---|
| Dados da venda (`me_venda`: valor, status, forma pgto, canal, data, observações) | `use-pedido.ts` |
| Cliente (`me_cliente`: nome, telefone, email, documento) | `use-pedido.ts` |
| Itens (`me_itens_venda` + fotos de `me_produto`) | `use-pedido.ts` (desde 15/09) |
| Status de pagamento (`me_contas_receber.status`) | `use-pedido.ts` + `use-confirmar-pagamento.ts` |
| Atualizar status (`me_venda.status_venda`) | `use-atualizar-status-pedido.ts` |
| Contabilizar venda (RPC `registrar_venda`) | `use-registrar-venda.ts` |

Ainda há **4 lacunas** onde a tela "parece funcionar" e depois **perde o dado ao recarregar**:

| Campo | Hoje | Problema |
|---|---|---|
| Código de rastreio | `useState` local + só o mock tem | Recarregou, sumiu. **Sem coluna no banco.** |
| Motivo do cancelamento | `useState` local | Recarregou, sumiu. **Sem coluna no banco.** |
| Timeline (histórico) | 1 entrada gerada do `criado_em` + entradas locais | **Não existe tabela de histórico**; mudanças de status antigas somem. |
| Endereço de entrega | Só no mock renderiza | `me_cliente` **tem** endereço (endereco, numero, complemento, bairro, cidade, estado, cep) mas o hook não busca → seção não aparece em dados reais. |

Lacunas menores, mesma família (campo existe no banco mas não é usado):

| Campo | Hoje | Correção |
|---|---|---|
| Número do pedido | Sintético `PD-2026-HASH` do id | Usar `me_venda.npedido` quando preenchido |
| Tipo PF/PJ do cliente | Hardcoded `"pf"` | Derivar de `me_cliente.cpf_cnpj` (14 dígitos → PJ) |
| Frete | Sempre `0` | Persistir `me_venda.frete` (default 0) |

## Stakeholders

- **Esposa do fundador** (operadora da Doceê) — usa o detalhe no celular todo dia
- **Fundador** — valida pelo celular (GitHub + Vercel)
- **Melissa / n8n** — pedidos do WhatsApp gravam em `me_venda`; os campos novos precisam ser opcionais para não quebrar o fluxo que vem do n8n

## Critérios de Aceite

- [ ] Código de rastreio persistido no banco; reaparece após recarregar a página
- [ ] Cancelamento persistido com motivo; reaparece após recarregar
- [ ] Histórico (timeline) mostra **todas** as mudanças de status persistidas no Supabase, não só estado local
- [ ] Endereço de entrega aparece quando o cliente tem endereço cadastrado (seção oculta se não tem — comportamento atual preservado)
- [ ] Número do pedido usa `npedido` real quando existente (fallback ao sintético atual)
- [ ] Badge PF/PJ derivado do `cpf_cnpj` do cliente
- [ ] Frete persistido (default 0) quando informado
- [ ] **Fallback mock da demo continua funcionando** (regra mock-first 07/09/2026 — sem login, tela abre com mock realista)
- [ ] `npm run build` OK + deploy Vercel READY

## Fora de Escopo

- **Imprimir/comprovante** real (botão segue toast-only — entra no backlog)
- **Variação de item** (sem coluna no banco — backlog)
- Edição de endereço dentro do pedido (endereço vem do cadastro do cliente `me_cliente`)
- RLS por empresa (já coberta pelas queries `.eq("empresa_id")`; revisão global é o P5)

## Dependências

- Banco: migration no Supabase oficial (`me_venda` + 3 colunas, tabela `me_venda_historico`)
- `use-pedido.ts`, `use-atualizar-status-pedido.ts`, `PedidoDetalhePage.tsx`