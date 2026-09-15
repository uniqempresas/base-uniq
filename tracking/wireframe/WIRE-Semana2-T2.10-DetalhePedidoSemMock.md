# WIRE — T2.10: Detalhe do Pedido Sem Mock

> Esta tarefa **não muda o layout**. As seções já existem — o que muda é a **fonte dos dados**: o que era estado local/mock passa a vir do banco. Layout permanece idêntico ao aprovado; apenas o comportamento de persistência é alterado.

## Tela: Detalhe do Pedido (`/vendas/pedidos/:id`)

### Antes (hoje) — trecho por seção

```
[←] PD-2026-0C90  [Aguardando]  [WhatsApp]
    14/09/2026 09:14
    [Imprimir] [Atualizar status] [Contabilizar venda]
```

### Depois (persistido) — o mesmo visual, agora com dados reais

```
[←] #12  [Aguardando]  [WhatsApp]          ← npedido real quando existir
    14/09/2026 09:14
    [Imprimir] [Atualizar status] [Contabilizar venda]
```

---

## Seções — fonte dos dados após T2.10

| Seção | Antes (mock/local) | Depois (banco) | Renderização |
|---|---|---|---|
| **Header nº do pedido** | `PD-2026-HASH` sintético | `me_venda.npedido` → `#12` (fallback sintético) | Sempre visível |
| **Rastreamento** | `useState` + mock | `me_venda.codigo_rastreio` + entry no histórico | Seção aparece se `status == "enviado"` ou `codigoRastreio` — igual hoje |
| **Endereço de entrega** | Só mock | `me_cliente` (endereco, numero, complemento, bairro, cidade, estado, cep) | Aparece **só se** cliente tem endereço cadastrado; senão oculto (igual hoje) |
| **Histórico do pedido** | 1 entry + estado local | `me_venda_historico` (todas as mudanças de status) | Linha do tempo atual, mas completa e persistida |
| **Cliente — badge PF/PJ** | Sempre "Pessoa Física" | Derivado de `cpf_cnpj` (14 dígitos → PJ) | Sempre visível |

---

## Fluxos de ação — persistência

### 1. Atualizar status (incl. Enviado)
```
Clicar "Atualizar status" → modal escolhe status
   └─ "Enviado" → modal de rastreio (obrigatório) → confirmar
        → UPDATE me_venda (status + codigo_rastreio)
        → INSERT me_venda_historico (status=enviado, rastreio)
        → tela reflete imediatamente; recarregar mantém ✅
```

### 2. Cancelar pedido
```
Clicar "Cancelar pedido" → modal com motivo (≥10 chars)
   → UPDATE me_venda (status=cancelado + motivo_cancelamento)
   → INSERT me_venda_historico (status=cancelado, observacao=motivo)
   → recarregar mantém motivo exibido ✅
```

### 3. Confirmar pagamento / Contabilizar venda
```
Sem mudança de layout nem de fluxo — já persistem (me_contas_receber / RPC registrar_venda).
```

---

## Estados

- **Loading:** skeleton atual (inalterado).
- **Empty (pedido não encontrado):** tela atual "Pedido não encontrado" (inalterada).
- **Error:** comportamento atual do hook (erro real não cai em mock quando logado).
- **Demo sem login:** mock intacto (fallback `PEDIDOS`), comportamento local preservado — **nada muda para quem não está logado**.

---

## Fora deste WIRE

- Comprovante de impressão real (backlog)
- Variação de item no banco (backlog)
- Edição de endereço do cliente a partir do pedido (backlog)