# PRD — Fluxo n8n Doceê: Pedido do WhatsApp contabilizado via RPC

> **Origem:** cadeia de demonstração (T2.1/T2.2) — o elo n8n que transforma o pedido do cliente no WhatsApp em venda real no banco.
> **Tipo:** funcionalidade de automação (n8n) — sem tela nova, sem WIRE. O "código" vive no n8n, não no repositório.
> **SPEC de execução:** `tracking/specs/SPEC-DoceE-FluxoN8n-PedidoParaRPC.md`
> **Decisões vigentes:** CRM em `me_cliente` (12/09/2026) · RPC `registrar_venda` é a fonte do "pedido contabilizado" (T2.2) · fluxo n8n novo grava direto em `me_cliente`.

---

## 1. Objetivo

O pedido que o cliente faz no WhatsApp da Doceê vira **venda real no banco** — `me_venda` + `me_itens_venda` + conta a receber + baixa de estoque — sem intervenção manual, usando a RPC `registrar_venda`. O n8n é o braço executor; o banco é a fonte da verdade.

## 2. Problema (por que precisa deste fluxo)

A tool `docee_grava-pedido` já existe no agente Doceê, mas:

1. **O sub-workflow executor está vazio** — `docee_criarpedido` só tem o trigger; nenhum nó chama a RPC. Hoje "gravar pedido" é um falso amigo: a tool aceita os dados e nada acontece.
2. **`p_itens` está tipado como `string`** — a AI manda um JSON em texto, e a RPC aplica `jsonb_typeof(p_itens)` → `string` → **itens são ignorados silenciosamente** (a venda sai sem itens, como já aconteceu nos itens 13/14 do uso real).
3. **A AI é incentivada a inventar** — se ela puder preencher id, preço e estoque de cabeça, erra. Ela não deve decidir valor nem estoque; só escolher produto e quantidade.
4. **`p_origem` e `p_status` estão soltos** (`fromAI`) — deveriam ser fixos para este canal.

> **Por que importa:** a cadeia de demonstração `WhatsApp → CRM → pedido contabilizado` é a espinha dorsal do plano. Sem o elo n8n funcionando, a venda do WhatsApp não chega ao Financeiro — e o cliente não vê o dinheiro saindo/entrando.

## 3. Solução (princípio: AI escolhe, banco decide)

| Camada | Responsabilidade |
|---|---|
| **AI (agente)** | Consulta produtos (`Consulta_Produtos`), confirma itens/quantidades/forma de pagamento com o cliente, chama a tool com a **intenção** (`[{nome, quantidade}]`) |
| **Sub-workflow `docee_criarpedido`** | Faz parse, busca o catálogo no banco, **reconstrói** `p_itens` com dados canônicos (id, nome, preço), valida estoque, **recalcula** `p_valor_total`, fixa `p_origem='whatsapp'` / `p_status='confirmada'` e chama a RPC |
| **Banco (RPC)** | Registra venda, baixa estoque, cria conta a receber |

Regras que o sub-workflow impõe (não negocia com a AI):

1. **Nenhum id, preço ou estoque vem da AI** — tudo é resolvido contra `me_produto` do tenant.
2. **`p_valor_total` é recalculado** da soma `quantidade × preco` do banco — nunca confiar em total da AI.
3. **Forma de pagamento** é validada contra a lista real (Dinheiro, Cartão de Crédito, Pix, Cartão de Débito, Boleto) com fallback PIX.
4. **Estoque é verificado** antes da RPC — item sem estoque falha com mensagem amigável que a AI repassa ao cliente (cobre temporariamente a "Opção B" de endurecer o banco com `RAISE EXCEPTION` — decidir depois se o banco também deve travar).

## 4. Escopo

### ✅ Dentro
- Configuração da tool `docee_grava-pedido` (contrato de inputs — ver SPEC §2).
- Construção do sub-workflow `docee_criarpedido`: parse → catálogo → montagem → RPC.
- Validação de estoque e forma de pagamento no fluxo.

### ❌ Fora de escopo
- Alterar a RPC `registrar_venda` (endurecer estoque com exceção = decisão em aberto para depois).
- RLS no banco (pendência P5).
- Mudar a arquitetura do agente `atendente_Docee` (MEL/persona/roteiro) — só a tool e seu executor.
- Qualquer código deste repositório (fluxo inteiramente no n8n).

## 5. Stakeholders

- **Esposa do fundador (Doceê):** opera o WhatsApp; é quem conversa com o cliente.
- **Fundador:** monta o fluxo na UI do n8n seguindo a SPEC e valida o resultado.
- **Cliente da Doceê:** não vê o fluxo, mas recebe a confirmação do pedido.

## 6. Critérios de aceite

| # | Critério | Como validar |
|---|---|---|
| 1 | Pedido com produto do catálogo grava `me_venda` + `me_itens_venda` com itens **reais** (id/preço do banco) | Enviar pedido de teste no WhatsApp; conferir `me_venda`/`me_itens_venda` do tenant Doceê |
| 2 | `me_venda.valor_total` = soma real dos itens (não valor da AI) | Conferir no banco vs. catálogo |
| 3 | Conta a receber criada (RPC cria), com `p_valor_total` igual ao da venda | Conferir `me_contas_receber` |
| 4 | Estoque do produto diminuído na quantidade vendida | Conferir `me_produto.estoque_atual` |
| 5 | Item sem estoque (ex.: Torta de Limão, estoque 0) **não** grava e a AI explica ao cliente | Pedido de teste com item zerado |
| 6 | `p_origem='whatsapp'`, `p_status='confirmada'` gravados na venda | Conferir `me_venda` |
| 7 | Forma de pagamento desconhecida (AI errou o nome) cai em PIX, não quebra o fluxo | Enviar "pagamento em dinheiro vivo" e conferir forma na venda |
| 8 | Cliente identificado vincula a `me_cliente` existente; sem cliente, venda segue sem link | Pedido com e sem `p_cliente_id` |

## 7. Riscos e observações

| Risco | Mitigação |
|---|---|
| AI ainda manda `p_itens` malformado (nome errado, quantidade 0) | Parse defensivo + lookup por nome no banco + erro claro que volta para a AI repetir a tool |
| Catálogo com nomes parecidos/duplicados (tortas etc.) | Lookup por nome exato (trim + lowercase) com fallback por id; descrição da tool instrui a usar os nomes exatos da `Consulta_Produtos` |
| Credencial do HTTP Request (tipo Supabase API) | Usar a mesma credential `UNIQ-uat4` da `Consulta_Produtos` (a MCP n8n não expõe credenciais — conferir na UI) |
| Fluxo não ativado / sub-workflow desligado | Lembar de ativar `docee_criarpedido` e salvar o `atendente_Docee` |
| Estoque zero sendo "aceito" pela RPC (decrementa negativo) | Verificação no sub-workflow cobre o fluxo atual; Opção B (travar no banco) fica registrada em aberto |

---

*Criado em 12/09/2026. Especificação técnica em `tracking/specs/SPEC-DoceE-FluxoN8n-PedidoParaRPC.md`.*