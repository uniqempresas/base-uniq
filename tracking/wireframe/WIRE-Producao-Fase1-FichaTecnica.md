# WIRE — Produção Fase 1: Natureza do Produto + Ficha Técnica

**Versão:** 1.0
**Data:** 06/10/2026
**Status:** Pronto para Implementação (aguardando aprovação do fundador)
**Telas:** Edição nos modais/telas de produto existentes (nenhuma rota nova)
**Referências:** `PRD-Producao-BOM-Fase1.md` · `SPEC-Producao-BOM-Fase1.md`

> Tela **adaptada** (não nova): o cadastro de produto ganha um eixo (natureza) e, para compostos, uma etapa de ficha técnica.

---

## 1. Roteamento

| Ponto | Tela | Acesso |
|---|---|---|
| Modal de produto (compartilhado) | Criação/edição ganha Natureza + Ficha Técnica | `/estoque/produtos` (+ Novo) e `/estoque/produtos/:id` |
| `ProdutosPage` | Badge da natureza | Existente |
| `ProdutoDetalhePage` | Bloco/aba "Ficha Técnica" (quando composto) | Existente |
| Vitrine / checkout | **Zero mudança** | — |

## 2. Modal de produto — Cadastro

### Step 1 (Informações) — novo grupo Natureza

```
┌ Cadastrar Produto · Desktop ────────────────────────────────────────┐
│ [Informações] [Preços] [Estoque] [Ficha Técnica]  ← step aparece    │
│                                                      só p/ composto │
│  Nome do produto    [ Trufa de Maracujá _______________ ]           │
│  SKU                [ TRF-MAR-001 ______ ]  Categoria  (chips ▼)    │
│                                                                     │
│  NATUREZA DO PRODUTO                                                │
│  (•) Simples     "Compro 1, vendo 1"                                │
│  ( ) Composto    "Produzido com ficha técnica"                      │
│  ( ) Insumo      "Matéria-prima — não aparece na vitrine"           │
└─────────────────────────────────────────────────────────────────────┘
```

Mobile (bottom-sheet): o grupo vira 3 opções empilhadas, cada uma com descrição em segunda linha; resto igual.

**Comportamentos:**
- Editar: radio pré-selecionado conforme `produto.natureza` (ausente = Simples).
- Selecionar **Composto** na criação → o step "Ficha Técnica" aparece no fluxo.
- Selecionar **Insumo** → o toggle "Mostrar na vitrine" some e o bloco passa a exibir a nota fixa: *"Insumo — não aparece na vitrine"*; noSalvar, `exibir_vitrine` vai false ao banco.
- Trocar de natureza **não apaga** ficha já existente sem confirmar (ao trocar de composto para outra natureza, o passo é omitido e a ficha antiga permanece no banco até uma nova gravação — comportamento documentado no SPEC §5: RPC só altera quando chamada).

### Step "Ficha Técnica" (só composto)

Desktop:

```
┌ Ficha Técnica — Trufa de Maracujá ──────────────────────────────────┐
│ Componentes por 1 unidade produzida                                 │
│ [🔍 Buscar produto (nome ou SKU)…]                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Produto             Unid.  Qtd/unid.  Perda %          Remover  │ │
│ │ Barra Choc. Blend   g      [20,...]  [0,...]           [🗑]     │ │
│ │ Leite Condensado    g      [15,...]  [0,...]           [🗑]     │ │
│ │ Creme de Leite      g      [ 8,...]  [0,...]           [🗑]     │ │
│ │ Polpa Maracujá      g      [10,...]  [3,...] [⚠ 0–50]  [🗑]     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ + Adicionar componente (busca acima; [enter] adiciona)              │
│ ✔ Salvar ficha          ⟲ Desfazer alterações        [Voltar]      │
└─────────────────────────────────────────────────────────────────────┘
```

Mobile (bottom-sheet): lista em cards (nome + SKU / quantidade & perda em linha), botão `+ Componente` full-width embaixo, "Salvar ficha" no fim.

### Componentes

| Elemento | Descrição |
|---|---|
| Busca de componentes | Dropdown client-side sobre `useProdutos()` (nome/SKU); própria produto excluído; insumo/composto/simples todos válidos |
| Quantidade por unidade | Input numérico com sufixo da unidade do componente (`g`) — informação do item componente |
| Perda % | Input numérico default 0, aviso fora do intervalo 0–100 |
| Remover | Ícone lixeira por componente |
| Salvar ficha | Chama RPC `salvar_ficha_tecnica` com snapshot; toast sucesso/erro; lista recarrega |

### Campos

| Campo | Tipo | Validação |
|---|---|---|
| Produto componente | busca | obrigatório; duplicado bloqueado (mesma mensagem do banco) |
| Quantidade por unidade | number | > 0 |
| Perda % | number | ≥ 0 (aviso acima de 100) |

### Ações

| Ação | Gatilho | Resultado |
|---|---|---|
| Salvar ficha | botão/submit | RPC grava (substitui tudo); toast; lista atualiza |
| Lista vazia + salvar | RPC com `[]` | Apaga a ficha do produto (explicito no WIRE para evitar sujeira) |
| Erro | RPC falha | Mensagem inline (modal) — nada gravado (RPC atômica) |

### Estados

| Estado | Apresentação |
|---|---|
| Loading | Skeleton da lista enquanto embed carrega |
| Empty | *"Nenhum componente ainda — adicione o primeiro pela busca acima"* |
| Error | Banner no modal + "Tentar novamente" |
| Success | Lista persistida; reabrir produto mostra a ficha salva |

## 3. `ProdutosPage` — badge da natureza

Card/linha ganha chip discreto: **Composto** (azul), **Insumo** (âmbar), Simples **sem chip** (não poluir — a maioria). Filtro por natureza? **Não nesta fase** (lista pequena; entra se o fundador pedir).

```
┌─────┐ Cone Trufado          Composto ┐
│foto │ R$ 8,00 · 10 un               │
└─────┘ Trufa…                        │
```

## 4. `ProdutoDetalhePage` — bloco Ficha Técnica

Quando `natureza='composto'`: seção (ou nova aba ao lado de Estoque/"Movimentações" — caber o que a tela absorve com menos atrito) listando componentes com nome+SKU, quantidade com unidade e perda %. **Sem custo nesta fase** (F2/F3). Header do bloco mostra a contagem: *"4 componentes*".

## 5. Estados dos fluxos envolvidos

- Modais: os 4 estados acima; **aba/step sem ficha em produto novo** = criação on-the-fly (começa empty).
- Persistência completa: nada de estado local que "some" ao fechar (lição de rastreio T2.10) — reabrir reflete o banco.

## 6. Responsividade

Desktop tabela 4 colunas → mobile cards empilhados bottom-sheet (padrão Financeiro/Pedidos). Inputs com alvo ≥40px. Steps do modal navegam por teclado (setas/enter válidos).

## 7. Acessibilidade

- Radio (`role="radiogroup"`/`aria-checked`); descrição ajuda com `aria-describedby`.
- Tabela/cards: `aria-label` nos botões de remover.
- Foco: ao abrir step de ficha, foco na busca; ESC fecha modal.
- Badge da natureza: texto, não só cor.

## 8. Componentes reutilizáveis

| Componente | Props | Uso |
|---|---|---|
| `useFichaTecnica(produtoPaiId)` | leitura + recarregar | Modal + detalhe |
| RPC `salvar_ficha_tecnica` | snapshot jsonb | única via de escrita |
| Busca de produtos (client-side sobre `useProdutos`) | — | mesmo padrão da busca de clientes (B3) |

## 9. Handoff — checklist

- [x] Rotas listadas (nenhuma criada) · desktop **e** mobile desenhados
- [x] 4 estados · campos com validação · ações com gatilho+resultado
- [x] Responsividade 3→2→1 · acessibilidade · sem hex fora do DESIGN.md · sem código
