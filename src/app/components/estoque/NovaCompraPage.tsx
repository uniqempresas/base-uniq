/**
 * Tela "Nova compra" — página própria mobile-first (WIRE COMPRA_TELA_C1_C2 v1.0).
 *
 * C1 — experiência de mercado, uma mão: rota `/estoque/compras/nova` substitui
 * o antigo modal NovaCompraSheet. Estrutura top→bottom: header (título +
 * fornecedor + total até agora) → bloco Fornecedor (select + "+ Novo
 * fornecedor" em mini-sheet) → busca de ITEM SOMENTE natureza=insumo (WIRE M1;
 * "cadastrar na hora" força insumo) → itens linha-a-linha (nunca tabela) →
 * rodapé sticky com total + "Salvar compra", que cria a compra PENDENTE pelo
 * hook atual (use-criar-compra) e volta para /estoque/compras com toast.
 * Receber / Cancelar / Detalhe continuam modais sobre a lista.
 *
 * C2 — conversão sempre explícita (ex.: caixa de uva 500 g):
 * - label da quantidade traz a UNIDADE DE COMPRA do item: "Qtd (caixa)";
 * - helper fixo "1 caixa = 500 g" quando o fator ≠ 1 (com a unidade do produto;
 *   sem helper quando fator = 1 — ex.: saquinho comprado na unidade);
 * - prova do item no estoque fala a UNIDADE DO PRODUTO: "+500 g ao estoque ·
 *   1 caixa" — nunca "caixas" para o estoque (bug reportado);
 * - valor unitário com máscara R$ (`lib/masks.ts`), alvo ≥ 44px, input 16px.
 *
 * Rascunho em memória (variável do módulo — sem localStorage): ir para o
 * cadastro completo de fornecedor e voltar NÃO perde as linhas digitadas;
 * salvar a compra limpa o rascunho.
 *
 * C3 — inserção padrão CARRINHO (fundador, 07/10/2026): cada resultado da
 * busca de insumo ganha botão verde "Adicionar" que põe a linha no carrinho
 * com 1 unidade de compra + último preço num toque só, e a busca segue limpa,
 * aberta e focada para o próximo item (mercado: buscar → adicionar → buscar).
 * Tocar no CORPO do card é o caminho de quem quer configurar antes: cria a
 * linha com qtd vazia e foca o editor dela — ou, se o produto já tem linha,
 * só foca a última (o corpo nunca duplica). O MESMO item via botão outra vez
 * = OUTRA linha separada (chave única por linha; subtotal/total somam linha a
 * linha — nada funde, nada de expectativa furada). Microconfirmação sem
 * ruído: a linha recém-adicionada pisca 1x, o contador "N itens" dá um pop e
 * um toast de id fixo (nunca empilha) avisa "+1 caixa de Uva · 4 itens".
 *
 * Padrões do módulo respeitados (ComprasPage/ContasPagarPage): paleta textual
 * #1f2937/#627271/#efefef/#86cb92, BottomSheet header/footer sticky para os
 * mini-sheets, hotfix pointerdown + mousedown + relatedTarget nos dropdowns —
 * EXCETO nas ações de item da busca: duplicar linha é intencional agora, e o
 * mouse dispara pointerdown E mousedown (um clique viraria duas linhas),
 * então cada botão usa só pointerdown (cobre mouse, toque e caneta), inputs
 * 16px (sem zoom do iOS), alvos de toque ≥ 44px, skeleton/empty/erro, labels
 * de formulário e aria-labels. Animação só na microconfirmação do carrinho
 * (desligada em prefers-reduced-motion). Sem chamada de API inventada —
 * hooks reais do módulo.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  Loader2,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "../../lib/produto-utils";
import { mascararMoeda, moedaDeValor, parsearMoeda } from "../../lib/masks";
import { useProdutos } from "../../hooks/use-produtos";
import {
  useFornecedores,
  type CriarFornecedorDados,
  type CriarFornecedorResult,
  type FornecedorSimples,
} from "../../hooks/use-fornecedores";
import { useCriarCompra, type CriarCompraParams, type CriarCompraResult } from "../../hooks/use-criar-compra";
import {
  useCriarProduto,
  validarConversaoCompra,
  type CriarProdutoParams,
  type CriarProdutoResult,
} from "../../hooks/use-criar-produto";
import {
  BottomSheet,
  campoFormSheet,
  SheetFooterActions,
  sheetButtonPrimario,
  sheetButtonSecundario,
} from "../financeiro/components";
import type { Produto } from "../../types/produto";

/* ───────────────────────── helpers de exibição ───────────────────────── */

/** `2000 → "2.000"`, `0.025 → "0,025"` — quantidade em unidade de estoque. */
function fmtNum(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

/** Unidades de estoque do mini-sheet U2.2 — as MESMAS 12 do cadastro (F1). */
const UNIDADES_ESTOQUE = ["Unidade", "Peça", "Par", "Kit", "Kg", "g", "Metro", "Litro", "ml", "Frasco", "Caixa", "Pacote"];
/** Datalist "Compra por" — mesma lista do ProdutoFormModal (F2 — WIRE §3). */
const UNIDADES_COMPRA = ["kg", "g", "L", "ml", "un", "lata", "caixa", "pacote", "m"];

/**
 * Linha da compra aceita também o SNAPSHOT do item recém-cadastrado no
 * mini-sheet: só os campos que a linha lê (U2.2). Evita esperar o refetch do
 * `useProdutos` para adicionar o item com o valor pré-preenchido.
 */
type LinhaNova = Pick<
  Produto,
  | "id"
  | "nome"
  | "sku"
  | "unidade"
  | "unidadeCompra"
  | "fatorConversao"
  | "ultimoPrecoCompra"
  | "ultimaCompraEm"
>;

/** U2.1 — chip discreto do último preço pago. Sem histórico: "Primeira compra". */
function ChipUltimoPreco({ produto, className = "" }: { produto: LinhaNova; className?: string }) {
  const ultimo = produto.ultimoPrecoCompra;
  const tem = ultimo != null && ultimo > 0;
  let data = "";
  if (tem && produto.ultimaCompraEm) {
    try {
      data = ` · ${format(parseISO(produto.ultimaCompraEm), "dd/MM")}`;
    } catch {
      data = ""; // data em formato inesperado nunca deve quebrar a tela
    }
  }
  const un = produto.unidadeCompra?.trim() || produto.unidade;
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#efefef] px-2 py-0.5 text-[11px] leading-snug text-[#627271] ${className}`}
    >
      {tem ? `Última vez: ${formatCurrency(ultimo)}/${un}${data}` : "Primeira compra deste item"}
    </span>
  );
}

/* ─────────────────────────── rascunho (memória) ─────────────────────────── */

interface LinhaItem {
  chave: string;
  produto: Produto;
  /** quantidade como texto, na UNIDADE DE COMPRA do item */
  quantidade: string;
  /** valor unitário JÁ MASCARADO ("R$ 6,50") — parsearMoeda faz o caminho de volta */
  valorUnitario: string;
}

interface RascunhoCompra {
  fornecedorId: string | null;
  /** fornecedor criado no mini-sheet antes do refetch chegar (U2.3) */
  fornecedorNovo: FornecedorSimples | null;
  notaFiscal: string;
  itens: LinhaItem[];
}

const rascunhoVazio = (): RascunhoCompra => ({
  fornecedorId: null,
  fornecedorNovo: null,
  notaFiscal: "",
  itens: [],
});

/**
 * Rascunho em MEMÓRIA (WIRE — não precisa localStorage): sobrevive à
 * navegação dentro da sessão (ex.: ir cadastrar o fornecedor completo e
 * voltar). Limpo quando a compra é salva.
 */
let rascunhoAtual: RascunhoCompra = rascunhoVazio();

/**
 * C3 — chave ÚNICA por linha. Com o mesmo item podendo entrar duas vezes,
 * `novo-${id}` colidiria e `atualizarLinha`/`remover` (que buscam por chave)
 * atingiriam as duas linhas de uma vez. Contador do módulo: sobrevive à
 * navegação junto com o rascunho e nunca repete.
 */
let seqLinha = 0;
const novaChave = (produtoId: string) => `linha-${++seqLinha}-${produtoId}`;

/* ─────────────────────────────── página ─────────────────────────────────── */

export function NovaCompraPage() {
  const navigate = useNavigate();
  const {
    produtos,
    loading: produtosLoading,
    error: produtosError,
    recarregar: recarregarProdutos,
  } = useProdutos();
  const {
    fornecedores,
    loading: fornecedoresLoading,
    error: fornecedoresError,
    recarregar: recarregarFornecedores,
    criarFornecedor,
    criando: criandoFornecedor,
  } = useFornecedores();
  const { criarCompra, loading: criando } = useCriarCompra();
  const { criarProduto, loading: criandoProduto } = useCriarProduto();

  // ---------- rascunho (hidrata do módulo, grava de volta a cada mudança) ----
  const [fornecedorId, setFornecedorId] = useState<string | null>(rascunhoAtual.fornecedorId);
  const [fornecedorExtra, setFornecedorExtra] = useState<FornecedorSimples | null>(rascunhoAtual.fornecedorNovo);
  const [notaFiscal, setNotaFiscal] = useState(rascunhoAtual.notaFiscal);
  const [itens, setItens] = useState<LinhaItem[]>(rascunhoAtual.itens);

  useEffect(() => {
    rascunhoAtual = { fornecedorId, fornecedorNovo: fornecedorExtra, notaFiscal, itens };
  }, [fornecedorId, fornecedorExtra, notaFiscal, itens]);

  // ---------- estado de UI (efêmero — não faz parte do rascunho) ────────────
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [fornecedorAberto, setFornecedorAberto] = useState(false);
  const [termoInsumo, setTermoInsumo] = useState("");
  const [insumosAberto, setInsumosAberto] = useState(false);
  const [miniItemAberto, setMiniItemAberto] = useState(false);
  const [miniFornecedorAberto, setMiniFornecedorAberto] = useState(false);
  const [erro, setErro] = useState("");
  // C3 — microconfirmação: chave da linha que acabou de entrar (pisca 1x) e
  // chave da linha cujo editor "Qtd" deve receber foco depois do render.
  const [flashChave, setFlashChave] = useState<string | null>(null);
  const [focoQtdChave, setFocoQtdChave] = useState<string | null>(null);

  const fornecedorRef = useRef<HTMLDivElement>(null);
  const insumoRef = useRef<HTMLDivElement>(null);

  // C3 "editar": depois que a linha nova renderiza, rola até ela e coloca o
  // cursor na quantidade — é ali que a pessoa confere/setta antes de seguir.
  useEffect(() => {
    if (!focoQtdChave) return;
    const el = document.getElementById(`nc-qtd-${focoQtdChave}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
    setFocoQtdChave(null);
  }, [focoQtdChave, itens]);

  // ---------- fornecedores (merge do criado na hora — U2.3) ─────────────────
  const listaFornecedores = useMemo(() => {
    if (!fornecedorExtra) return fornecedores;
    if (fornecedores.some((f) => f.id === fornecedorExtra.id)) return fornecedores;
    return [...fornecedores, fornecedorExtra].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [fornecedores, fornecedorExtra]);

  const fornecedorSelecionado = listaFornecedores.find((f) => f.id === fornecedorId) || null;

  const qFornecedor = buscaFornecedor.trim().toLowerCase();
  const candidatosFornecedor = listaFornecedores
    .filter((f) => !qFornecedor || f.nome.toLowerCase().includes(qFornecedor))
    .slice(0, 8);

  // ---------- busca de ITEM: SOMENTE natureza=insumo (WIRE M1 / C1) ─────────
  const qInsumo = termoInsumo.trim().toLowerCase();
  const insumos = useMemo(() => produtos.filter((p) => p.natureza === "insumo"), [produtos]);
  // C3: o insumo JÁ no carrinho continua na busca — adicionar de novo é
  // legítimo (duas linhas separadas, cada uma ajusta a sua). O badge
  // "N× no carrinho" no candidato é que avisa, não o sumiço da lista.
  const candidatosInsumo = insumos
    .filter((p) => !qInsumo || p.nome.toLowerCase().includes(qInsumo) || p.sku.toLowerCase().includes(qInsumo))
    .slice(0, 8);

  /** C3 — quantas linhas cada produto já tem no carrinho (badge dos candidatos). */
  const linhasPorProduto = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of itens) m.set(l.produto.id, (m.get(l.produto.id) ?? 0) + 1);
    return m;
  }, [itens]);

  const selecionarFornecedor = (id: string) => {
    setFornecedorId(id);
    setBuscaFornecedor("");
    setFornecedorAberto(false);
    setErro("");
  };

  /**
   * C3 — pôr item no carrinho, dois caminhos por toque:
   *
   * - `carrinho` (botão verde "Adicionar", o caminho rápido do mercado):
   *   linha NOVA SEMPRE — quantidade 1 na unidade de compra, valor
   *   pré-cheio com o último preço (U2.1). O MESMO item duas vezes são duas
   *   linhas separadas; ajuste fino acontece depois, na própria linha.
   *   A busca é limpa e CONTINUA aberta e focada para o próximo item.
   *
   * - `editar` (corpo do card, para quem quer configurar antes): cria a
   *   linha com qtd vazia e foca o editor dela; se o produto já tem linha,
   *   APENAS foca a última — o corpo nunca duplica (evita gêmea por toque
   *   acidental em quem só queria conferir).
   *
   * A idempotência antiga (guard por produtoId) não existe mais de propósito:
   * duplicar virou comportamento esperado. Por isso as ações usam só
   * `pointerdown` — no desktop, pointerdown + mousedown somados criariam
   * duas linhas por clique.
   */
  const adicionar = (p: Produto | LinhaNova, modo: "carrinho" | "editar" = "carrinho") => {
    // U2.1 — valor pré-preenchido com o último preço pago (mascarado; a pessoa
    // só corrige quando o mercado mudou o preço).
    const ultimo = p.ultimoPrecoCompra != null && p.ultimoPrecoCompra > 0 ? moedaDeValor(p.ultimoPrecoCompra) : "";
    const novaLinha = (quantidade: string): LinhaItem => ({
      chave: novaChave(p.id),
      produto: p as Produto,
      quantidade,
      valorUnitario: ultimo,
    });

    if (modo === "editar") {
      const existente = [...itens].reverse().find((l) => l.produto.id === p.id);
      if (existente) {
        setFocoQtdChave(existente.chave);
      } else {
        const nova = novaLinha("");
        setItens((prev) => [...prev, nova]);
        setFocoQtdChave(nova.chave);
      }
      setTermoInsumo("");
      setInsumosAberto(false);
      setErro("");
      return;
    }

    const nova = novaLinha("1");
    setItens((prev) => [...prev, nova]);
    setTermoInsumo("");
    setErro("");

    // Microconfirmação (sem over-animation): a linha pisca 1x quando ficar
    // visível e um toast de id fixo fala a unidade + a contagem — taps
    // seguidos substituem o mesmo toast em vez de empilhar.
    setFlashChave(nova.chave);
    window.setTimeout(() => setFlashChave((atual) => (atual === nova.chave ? null : atual)), 1100);
    const n = itens.length + 1;
    const un = p.unidadeCompra?.trim() || p.unidade;
    toast.success(`+1 ${un} de ${p.nome} · ${n} ${n === 1 ? "item" : "itens"} no carrinho`, {
      id: "nova-compra-carrinho",
    });
  };

  /** Mini-sheet U2.2: cria o insumo e adiciona na hora via snapshot. */
  const aoCriarInsumo = (dados: {
    id: number;
    nome: string;
    sku: string;
    unidade: string;
    unidadeCompra: string;
    fator: number | null;
  }) => {
    adicionar({
      id: String(dados.id),
      nome: dados.nome,
      sku: dados.sku,
      unidade: dados.unidade,
      unidadeCompra: dados.unidadeCompra || null,
      fatorConversao: dados.fator,
      ultimoPrecoCompra: null,
      ultimaCompraEm: null,
    });
    recarregarProdutos();
    setMiniItemAberto(false);
    // C3: o snapshot entra pelo caminho rápido (qtd 1 na unidade de compra).
    // Mesmo id do toast → substitui o "+1 ..." que o adicionar() acabou de
    // mostrar, em vez de empilhar dois.
    toast.success("Item cadastrado e já no carrinho.", { id: "nova-compra-carrinho" });
  };

  /** Mini-sheet U2.3: seleciona o fornecedor novo na hora + recarrega. */
  const aoCriarFornecedor = (novo: FornecedorSimples) => {
    setFornecedorExtra(novo);
    setFornecedorId(novo.id);
    setBuscaFornecedor("");
    setFornecedorAberto(false);
    setMiniFornecedorAberto(false);
    setErro("");
    recarregarFornecedores();
    toast.success("Fornecedor cadastrado.");
  };

  const atualizarLinha = (chave: string, patch: Partial<LinhaItem>) =>
    setItens((prev) => prev.map((l) => (l.chave === chave ? { ...l, ...patch } : l)));

  const remover = (chave: string) => setItens((prev) => prev.filter((l) => l.chave !== chave));

  // ---------- linha calculada (C2: qtd na unidade de COMPRA) ────────────────
  const linhasCalculadas = itens.map((l) => {
    const qtd = parseFloat(l.quantidade) || 0;
    const vu = parsearMoeda(l.valorUnitario);
    const uc = l.produto.unidadeCompra?.trim() || null;
    const fator = l.produto.fatorConversao == null ? 1 : Number(l.produto.fatorConversao);
    const conversionOk = !uc || fator > 0;
    return {
      linha: l,
      qtd,
      vu,
      uc,
      fator,
      conversionOk,
      entra: qtd * (Number.isFinite(fator) && fator > 0 ? fator : 1),
      subtotal: qtd * vu,
    };
  });
  const total = linhasCalculadas.reduce((s, l) => s + l.subtotal, 0);

  const voltar = () => navigate("/estoque/compras");

  const salvar = async () => {
    if (criando) return;
    setErro("");

    if (!fornecedorId) {
      setErro("Selecione o fornecedor da compra.");
      return;
    }
    if (itens.length === 0) {
      setErro("Adicione pelo menos um insumo.");
      return;
    }
    for (const l of linhasCalculadas) {
      if (!(l.qtd > 0)) {
        setErro(`Informe uma quantidade maior que zero para "${l.linha.produto.nome}".`);
        return;
      }
      if (!Number.isFinite(l.vu) || l.vu < 0) {
        setErro(`Valor unitário inválido para "${l.linha.produto.nome}".`);
        return;
      }
      if (!l.conversionOk) {
        setErro(
          `"${l.linha.produto.nome}" é comprado por ${l.uc} mas está sem fator de conversão no cadastro — corrija o produto.`
        );
        return;
      }
    }

    // WIRE C1: a tela cria a compra PENDENTE — o recebimento acontece depois,
    // pela lista (modais Receber/Cancelar/Detalhe continuam na ComprasPage).
    const r = await criarCompra({
      fornecedorId,
      notaFiscal: notaFiscal.trim() || null,
      itens: itens.map((l) => ({
        produtoId: l.produto.id,
        quantidade: parseFloat(l.quantidade) || 0,
        valorUnitario: parsearMoeda(l.valorUnitario),
      })),
      dataPrevista: null,
    });

    if (!r.success || !r.id) {
      setErro(r.error || "Não foi possível registrar a compra.");
      return;
    }

    rascunhoAtual = rascunhoVazio();
    toast.success(`Compra de ${formatCurrency(total)} registrada — aguardando recebimento.`);
    voltar();
  };

  const itensVazios = itens.length === 0;

  return (
    <main
      data-od-id="nova-compra-regiao"
      className="mx-auto flex min-h-full max-w-2xl flex-col p-3 text-[#1f2937] sm:p-6"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* ── Header: título + fornecedor escolhido + total até agora (WIRE C1 §1) ── */}
      <header className="mb-4 flex items-start gap-2">
        <button
          type="button"
          onClick={voltar}
          aria-label="Voltar para a lista de compras"
          className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 pt-1">
          <h1 data-od-id="nova-compra-heading" className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: 18 }}>
            Nova compra
          </h1>
          <p className="mt-0.5 truncate text-xs text-[#627271] sm:text-sm" aria-live="polite">
            {fornecedorSelecionado ? fornecedorSelecionado.nome : "Escolha o fornecedor"}
            {" · "}
            {/* C3: key=contador remonta o span a cada add → pop de 1x (nc-pop) */}
            <span key={itens.length} className="nc-pop">
              {itens.length === 1 ? "1 item" : `${itens.length} itens`}
            </span>
            {" · "}
            {formatCurrency(total)} até agora
          </p>
        </div>
      </header>

      {/* ── 1 · Fornecedor (bloco obrigatório — D10; + novo na hora — U2.3) ── */}
      <section className="mb-3 rounded-2xl border border-[#efefef] bg-white p-3.5 shadow-sm sm:p-4" aria-labelledby="nc-fornecedor-label">
        <BlocoTitulo n={1} id="nc-fornecedor-label" texto="Fornecedor" obrigatorio />

        {fornecedoresLoading && listaFornecedores.length === 0 ? (
          <div className="mt-2 h-12 animate-pulse rounded-xl bg-[#efefef]" aria-hidden="true" />
        ) : fornecedoresError && listaFornecedores.length === 0 ? (
          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3.5" role="alert">
            <p className="text-xs text-red-700">Não foi possível carregar os fornecedores: {fornecedoresError}</p>
            <button
              type="button"
              onClick={recarregarFornecedores}
              className="mt-2 min-h-[44px] rounded-xl border border-red-200 bg-white px-3 text-sm text-red-700 transition-colors hover:bg-red-50"
              style={{ fontWeight: 600 }}
            >
              Tentar novamente
            </button>
          </div>
        ) : listaFornecedores.length === 0 ? (
          <div className="mt-2 space-y-2 rounded-xl border border-[#efefef] bg-[#FAFAFA] p-3.5">
            <p className="text-xs text-[#627271]">
              Nenhum fornecedor cadastrado ainda — cadastre aqui mesmo, sem sair da compra.
            </p>
            <button
              type="button"
              onClick={() => setMiniFornecedorAberto(true)}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#86cb92] px-4 py-2.5 text-sm text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
              style={{ fontWeight: 600 }}
            >
              <Plus size={15} />
              Novo fornecedor
            </button>
            <button
              type="button"
              onClick={() => navigate("/fornecedores/novo")}
              className="min-h-[36px] w-full text-center text-xs text-[#627271] underline transition-colors hover:text-[#1f2937]"
            >
              ou faça o cadastro completo em Fornecedores (o rascunho da compra é mantido)
            </button>
          </div>
        ) : (
          <>
            <div className="relative mt-2" ref={fornecedorRef}>
              <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
              <input
                type="text"
                value={fornecedorSelecionado ? fornecedorSelecionado.nome : buscaFornecedor}
                onChange={(e) => {
                  setFornecedorId(null);
                  setBuscaFornecedor(e.target.value);
                  setFornecedorAberto(true);
                  setErro("");
                }}
                onFocus={() => setFornecedorAberto(true)}
                onBlur={(e) => {
                  // fecha só quando o foco sai de tudo (HOTFIX recheio da ficha)
                  if (!fornecedorRef.current?.contains(e.relatedTarget as Node | null)) setFornecedorAberto(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (candidatosFornecedor[0]) selecionarFornecedor(candidatosFornecedor[0].id);
                  }
                }}
                placeholder="Buscar fornecedor..."
                aria-label="Selecionar fornecedor"
                className={`${campoFormSheet} pl-10 text-base ${fornecedorSelecionado ? "pr-11" : ""}`}
              />
              {fornecedorSelecionado && (
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#059669]" aria-hidden="true">
                  <Check size={16} />
                </span>
              )}
              {fornecedorAberto && !fornecedorSelecionado && (
                <div
                  className={
                    candidatosFornecedor.length > 0
                      ? "absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#efefef] bg-white shadow-lg"
                      : "relative mt-1 rounded-xl border border-[#efefef] bg-white shadow-lg"
                  }
                >
                  {candidatosFornecedor.length === 0 ? (
                    <div className="p-3 text-center">
                      <p className="text-sm text-[#627271]">
                        {qFornecedor ? "Nenhum fornecedor encontrado." : "Nenhum fornecedor cadastrado ainda."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setMiniFornecedorAberto(true)}
                        className="mt-3 min-h-[48px] w-full rounded-xl bg-[#86cb92] px-3 py-2.5 text-sm text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
                        style={{ fontWeight: 600 }}
                      >
                        {qFornecedor
                          ? `+ Cadastrar fornecedor “${buscaFornecedor.trim()}”`
                          : "+ Cadastrar novo fornecedor"}
                      </button>
                    </div>
                  ) : (
                    candidatosFornecedor.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          selecionarFornecedor(f.id);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selecionarFornecedor(f.id);
                        }}
                        className="flex min-h-[48px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#efefef]"
                      >
                        <Truck size={14} className="shrink-0 text-[#627271]" />
                        <span className="min-w-0 truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                          {f.nome}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* "+ Novo fornecedor" SEMPRE visível (mercado: o fornecedor do dia
                quase nunca está cadastrado) */}
            <button
              type="button"
              onClick={() => setMiniFornecedorAberto(true)}
              className="mt-1.5 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2.5 text-sm text-[#1f2937] transition-colors hover:bg-[#efefef]"
              style={{ fontWeight: 500 }}
            >
              <Plus size={14} />
              Novo fornecedor
            </button>
          </>
        )}

        {/* NF dentro do bloco fornecedor — opcional, campo do hook atual */}
        <label className="mt-3 block text-sm font-medium text-[#1f2937]">
          Nota fiscal (opcional)
          <input
            type="text"
            value={notaFiscal}
            onChange={(e) => setNotaFiscal(e.target.value)}
            placeholder="Ex.: 1042"
            autoComplete="off"
            className={`${campoFormSheet} text-base`}
          />
        </label>
      </section>

      {/* ── 2 · Busca de insumo (SOMENTE natureza=insumo — WIRE M1/C1) ── */}
      <section className="mb-3 rounded-2xl border border-[#efefef] bg-white p-3.5 shadow-sm sm:p-4" aria-labelledby="nc-busca-label">
        <BlocoTitulo n={2} id="nc-busca-label" texto="Adicionar insumo" />
        <p className="mt-1 text-[11px] text-[#627271]">
          {produtosLoading && produtos.length === 0
            ? "Carregando insumos..."
            : produtosError && produtos.length === 0
              ? "Não foi possível carregar a lista de insumos."
              : `${insumos.length} ${insumos.length === 1 ? "insumo cadastrado" : "insumos cadastrados"} — toque em Adicionar para pôr 1 unidade no carrinho.`}
        </p>
        <div className="relative mt-2" ref={insumoRef}>
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#627271]" />
          <input
            type="text"
            value={termoInsumo}
            onChange={(e) => {
              setTermoInsumo(e.target.value);
              setInsumosAberto(true);
            }}
            onFocus={() => setInsumosAberto(true)}
            onBlur={(e) => {
              if (!insumoRef.current?.contains(e.relatedTarget as Node | null)) setInsumosAberto(false);
            }}
            onKeyDown={(e) => {
              // C3: Enter joga o primeiro candidato no carrinho (1 un) e NUNCA
              // submete a tela
              if (e.key === "Enter") {
                e.preventDefault();
                if (candidatosInsumo[0]) adicionar(candidatosInsumo[0], "carrinho");
              }
            }}
            placeholder="Buscar insumo (nome ou SKU)..."
            aria-label="Buscar insumo para adicionar"
            className={`${campoFormSheet} pl-10 text-base`}
          />
          {insumosAberto && (
            <div
              className={
                candidatosInsumo.length > 0
                  ? "absolute left-0 right-0 top-full z-50 mt-1 max-h-72 divide-y divide-[#efefef] overflow-y-auto rounded-xl border border-[#efefef] bg-white shadow-lg"
                  : "relative mt-1 rounded-xl border border-[#efefef] bg-white shadow-lg"
              }
            >
              {produtosLoading && produtos.length === 0 ? (
                <div className="space-y-2 p-3" aria-hidden="true">
                  <div className="h-10 animate-pulse rounded-lg bg-[#efefef]" />
                  <div className="h-10 animate-pulse rounded-lg bg-[#efefef]" />
                </div>
              ) : produtosError && produtos.length === 0 ? (
                <div className="p-3 text-center" role="alert">
                  <p className="text-sm text-red-700">Erro ao carregar os insumos: {produtosError}</p>
                  <button
                    type="button"
                    onClick={recarregarProdutos}
                    className="mt-3 min-h-[48px] w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm text-red-700 transition-colors hover:bg-red-50"
                    style={{ fontWeight: 600 }}
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : candidatosInsumo.length === 0 ? (
                <div className="p-3 text-center">
                  {insumos.length === 0 ? (
                    <p className="text-sm text-[#627271]">
                      Nenhum insumo cadastrado — o botão abaixo já cria o primeiro com a natureza
                      &ldquo;Insumo&rdquo; aplicada.
                    </p>
                  ) : (
                    <p className="text-sm text-[#627271]">
                      {qInsumo ? "Nenhum insumo encontrado." : "Nenhum insumo disponível para adicionar."}
                    </p>
                  )}
                  {/* Vazio SEM sobreposição: em estático, o botão empurra a tela
                      embaixo em vez de cobri-lo. */}
                  <button
                    type="button"
                    onClick={() => {
                      setInsumosAberto(false);
                      setMiniItemAberto(true);
                    }}
                    className="mt-3 min-h-[48px] w-full rounded-xl bg-[#86cb92] px-3 py-2.5 text-sm text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
                    style={{ fontWeight: 600 }}
                  >
                    {qInsumo ? `+ Cadastrar “${termoInsumo.trim()}” como novo insumo` : "+ Cadastrar novo insumo"}
                  </button>
                </div>
              ) : (
                <>
                  {candidatosInsumo.map((p) => {
                    const noCarrinho = linhasPorProduto.get(p.id) ?? 0;
                    return (
                      <div key={p.id} className="flex items-stretch gap-2 pr-1.5">
                        {/* CORPO do card → editor da linha (qtd/valor): caminho
                            de quem configura antes. Só pointerdown (mouse E
                            toque): com mousedown junto, um clique no desktop
                            somaria DUAS linhas (hotfix antigo × duplicação
                            intencional — ver docstring do adicionar). */}
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            adicionar(p, "editar");
                          }}
                          aria-label={`Abrir editor de quantidade e valor de ${p.nome}`}
                          className="flex min-h-[64px] min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#efefef]"
                        >
                          <Package size={14} className="mt-1 shrink-0 text-[#627271]" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                              {p.nome}
                            </span>
                            <span className="block truncate text-xs text-[#627271]">
                              {p.sku || "sem SKU"} · estoque em {p.unidade}
                              {p.unidadeCompra ? ` · compra por ${p.unidadeCompra}` : ""}
                            </span>
                            <span className="mt-1 flex flex-wrap items-center gap-1">
                              <ChipUltimoPreco produto={p} />
                              {/* o item não some da busca ao entrar — ganha o
                                  badge, e um novo toque no botão = outra linha */}
                              {noCarrinho > 0 && (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-snug"
                                  style={{ background: "#F0FDF4", borderColor: "#A7F3D0", color: "#059669", fontWeight: 600 }}
                                >
                                  <Check size={11} />
                                  {noCarrinho}× no carrinho
                                </span>
                              )}
                            </span>
                          </span>
                        </button>
                        {/* BOTÃO DO CARRINHO — 1 toque: 1 unidade de compra +
                            último preço, sem abrir nada. Verde da marca, alvo
                            ≥ 44px, pronto pro polegar. */}
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            adicionar(p, "carrinho");
                          }}
                          aria-label={`Adicionar ${p.nome} ao carrinho`}
                          className="my-2 flex min-h-[44px] shrink-0 items-center self-center gap-1.5 rounded-xl bg-[#86cb92] px-3 text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white active:bg-[#1f2937] active:text-white"
                          style={{ fontWeight: 600 }}
                        >
                          <ShoppingCart size={14} />
                          <span className="text-xs">Adicionar</span>
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setInsumosAberto(false);
                      setMiniItemAberto(true);
                    }}
                    className="flex min-h-[44px] w-full items-center justify-center gap-1.5 px-4 text-sm text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
                  >
                    <Plus size={14} />
                    Cadastrar novo insumo
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 3 · Itens da compra — linha-a-linha, nunca tabela (WIRE C1 §4) ── */}
      {/* C3: sem mais ref/scroll programático aqui — o "abrir editor" rola e
          foca direto no input de quantidade da linha */}
      <section className="mb-3 scroll-mt-3" aria-labelledby="nc-itens-label">
        <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
          <BlocoTitulo n={3} id="nc-itens-label" texto="Itens da compra" inline />
          <span className="text-xs text-[#627271]">{formatCurrency(total)}</span>
        </div>

        {itensVazios ? (
          <div className="rounded-2xl border border-dashed border-[#efefef] bg-white/60 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efefef]">
              <ShoppingCart size={20} className="text-[#627271]" />
            </div>
            <p className="text-sm font-semibold text-[#1f2937]">Carrinho vazio</p>
            <p className="mt-1 text-xs text-[#627271]">
              Busque um insumo acima e toque em &ldquo;Adicionar&rdquo; — item por item, igual carrinho de loja.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {linhasCalculadas.map(({ linha, qtd, vu, uc, fator, conversionOk, entra, subtotal }) => {
              const unidade = linha.produto.unidade;
              // C2: helper "1 caixa = 500 g" só quando a conversão não é 1:1
              const mostrarHelper = Boolean(uc) && conversionOk && Number.isFinite(fator) && fator !== 1;
              return (
                <div
                  key={linha.chave}
                  // C3: flash de 1x na linha recém-jogada no carrinho (CSS
                  // global nc-flash; desliga em prefers-reduced-motion)
                  className={`rounded-2xl border border-[#efefef] bg-white p-3.5 shadow-sm${
                    linha.chave === flashChave ? " nc-flash" : ""
                  }`}
                >
                  {/* Nome + remover. O remover fica NO CABEÇALHO do card (44px,
                      canto superior) — nunca ao lado da digitação (mobile). */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                        {linha.produto.nome}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#627271]">
                        estoque em {unidade}
                        {uc ? ` · compra por ${uc}` : ""}
                      </p>
                      <ChipUltimoPreco produto={linha.produto} className="mt-1.5 max-w-full" />
                    </div>
                    <button
                      type="button"
                      onClick={() => remover(linha.chave)}
                      aria-label={`Remover ${linha.produto.nome} da compra`}
                      className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Qtd + valor em grid 2 colunas: 16px no input (sem zoom do
                      iOS) e alvo ≥ 44px de altura. */}
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <label className="block text-xs font-medium text-[#1f2937]">
                      {/* C2: a label NOMEA a unidade de compra — "Qtd (caixa)" */}
                      Qtd ({uc || unidade}) *
                      <input
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={linha.quantidade}
                        onChange={(e) => atualizarLinha(linha.chave, { quantidade: e.target.value })}
                        placeholder="0"
                        // C3: id-alvo do "abrir editor" do corpo do card (adicionar modo `editar`)
                        id={`nc-qtd-${linha.chave}`}
                        className={`${campoFormSheet} text-base`}
                      />
                      {/* C2: helper de conversão — unidade do produto no estoque */}
                      {mostrarHelper && (
                        <span className="mt-1 block text-[11px] text-[#627271]">
                          1 {uc} = {fmtNum(fator)} {unidade}
                        </span>
                      )}
                    </label>
                    <label className="block text-xs font-medium text-[#1f2937]">
                      Valor unitário (R$)
                      {/* C2: máscara monetária do masks.ts — dígitos viram centavos */}
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={linha.valorUnitario}
                        onChange={(e) => atualizarLinha(linha.chave, { valorUnitario: mascararMoeda(e.target.value) })}
                        placeholder="R$ 0,00"
                        className={`${campoFormSheet} text-base`}
                      />
                    </label>
                  </div>

                  {/* Prova da conversão: SEMPRE a unidade do produto no estoque
                      ("+500 g ao estoque · 1 caixa") — nunca "caixas" (bug
                      reportado no uso real). */}
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="min-w-0 text-[11px]">
                      {uc ? (
                        conversionOk ? (
                          qtd > 0 && (
                            <span
                              className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5"
                              style={{ background: "#F0FDF4", borderColor: "#A7F3D0", color: "#059669", fontWeight: 600 }}
                            >
                              +{fmtNum(entra)} {unidade} ao estoque · {fmtNum(qtd)} {uc}
                            </span>
                          )
                        ) : (
                          <span
                            className="rounded-md border px-1.5 py-0.5"
                            style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309", fontWeight: 600 }}
                          >
                            sem fator de conversão — corrija o cadastro
                          </span>
                        )
                      ) : (
                        <span className="text-[#627271]">entra direto em {unidade}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-right text-[11px]">
                      <span className="text-[#1f2937]" style={{ fontWeight: 700 }}>
                        subtotal {formatCurrency(subtotal)}
                      </span>
                      {uc && conversionOk && qtd > 0 && vu >= 0 ? (
                        <span className="ml-1 block font-normal text-[#627271]">
                          {formatCurrency(fator > 0 ? vu / fator : vu)}/{unidade}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-3 px-1 text-center text-[11px] text-[#627271]">
          Salvar não mexe no estoque — a compra fica pendente e você usa &quot;Receber&quot; na lista quando a
          mercadoria chegar.
        </p>
      </section>

      {/* ── Rodapé STICKY: total + Salvar compra (WIRE C1 §5) ──
          -mx-3 + pb com safe-area: borda a borda no mobile, ancorado acima da
          home bar; no desktop vira card. mt-auto cola no fundo quando a tela
          está curta. */}
      <footer className="sticky bottom-0 z-40 -mx-3 mt-auto border-t border-[#efefef] bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(31,41,55,0.08)] sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        {/* Erro no rodapé sticky: quem está em qualquer ponto da lista precisa
            ver a mensagem sem rolar */}
        {erro && (
          <p className="mb-2 text-xs text-red-600" role="alert" style={{ fontWeight: 500 }}>
            {erro}
          </p>
        )}
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm text-[#627271]">
            Total{" "}
            {/* C3: ondinha no "N itens" do rodapé — o key remonta o span a
                cada add e o pop roda 1x */}
            <span key={itens.length} className="nc-pop">
              {itens.length === 1 ? "(1 item)" : `(${itens.length} itens)`}
            </span>
          </span>
          <span className="text-2xl text-[#1f2937]" style={{ fontWeight: 700 }} role="status">
            {formatCurrency(total)}
          </span>
        </div>
        <SheetFooterActions>
          <button type="button" onClick={voltar} disabled={criando} className={sheetButtonSecundario}>
            Voltar
          </button>
          <button
            type="button"
            onClick={salvar}
            data-sheet-foco
            disabled={criando}
            className={sheetButtonPrimario}
            style={{ background: "#86cb92" }}
          >
            {criando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check size={16} />
                Salvar compra
              </>
            )}
          </button>
        </SheetFooterActions>
      </footer>

      {/* ── Mini-sheet "Cadastrar item na hora" (natureza FORÇADA: insumo) ── */}
      {miniItemAberto && (
        <MiniSheetNovoItem
          termo={termoInsumo}
          salvando={criandoProduto}
          criarProduto={criarProduto}
          onFechar={() => setMiniItemAberto(false)}
          onCriado={aoCriarInsumo}
        />
      )}

      {/* ── Mini-sheet "Cadastrar fornecedor na hora" (U2.3) ── */}
      {miniFornecedorAberto && (
        <MiniSheetNovoFornecedor
          termo={buscaFornecedor}
          criando={criandoFornecedor}
          criarFornecedor={criarFornecedor}
          onFechar={() => setMiniFornecedorAberto(false)}
          onCriado={aoCriarFornecedor}
        />
      )}
    </main>
  );
}

/* ───────────────────────── blocos auxiliares ───────────────────────── */

/** Título numerado dos blocos da tela (1 fornecedor · 2 busca · 3 itens). */
function BlocoTitulo({
  n,
  id,
  texto,
  obrigatorio = false,
  inline = false,
}: {
  n: number;
  id: string;
  texto: string;
  obrigatorio?: boolean;
  inline?: boolean;
}) {
  const rotulo = (
    <span className="flex items-center gap-2">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] text-[#1f2937]"
        style={{ background: "#86cb92", fontWeight: 700 }}
        aria-hidden="true"
      >
        {n}
      </span>
      <span className="text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
        {texto}
        {obrigatorio && <span className="text-red-500"> *</span>}
      </span>
    </span>
  );
  return inline ? (
    <h2 id={id}>{rotulo}</h2>
  ) : (
    <p id={id}>{rotulo}</p>
  );
}

/* ─────────────── Mini-sheets U2 — cadastrar na hora no mercado ───────────── */

/** Título do mini-sheet com termo prévio cortado — 40 chars no mobile já basta. */
function tituloMiniSheet(prefixo: string, termo: string): string {
  const t = termo.trim().slice(0, 40);
  return t ? `${prefixo} “${t}”` : `${prefixo} novo`;
}

/**
 * "Cadastrar item na hora": form mínimo de insumo no MESMO padrão sticky do
 * BottomSheet (header + footer). Só o necessário para registrar a compra —
 * a natureza é FORÇADA em insumo; o restante do cadastro pode ser completado
 * depois em Estoque.
 */
function MiniSheetNovoItem({
  termo,
  salvando,
  criarProduto,
  onFechar,
  onCriado,
}: {
  termo: string;
  salvando: boolean;
  criarProduto: (p: CriarProdutoParams) => Promise<CriarProdutoResult>;
  onFechar: () => void;
  onCriado: (dados: { id: number; nome: string; sku: string; unidade: string; unidadeCompra: string; fator: number | null }) => void;
}) {
  const [nome, setNome] = useState(termo.trim());
  const [sku, setSku] = useState("");
  const [unidade, setUnidade] = useState("Unidade");
  const [unidadeCompra, setUnidadeCompra] = useState("");
  const [fator, setFator] = useState("");
  const [erro, setErro] = useState("");

  const salvar = async () => {
    if (salvando) return;
    setErro("");
    if (!nome.trim()) {
      setErro("Informe o nome do item.");
      return;
    }
    const uc = unidadeCompra.trim();
    const nFator = fator.trim() === "" ? null : Number(fator);
    // F2/H3 + anti-inversão (Caixa de Uva, 07/10/2026): mesma validação do
    // cadastro completo (mesma unidade → fator 1; diferentes → fator > 1),
    // client-side antes de gravar.
    const erroConv = validarConversaoCompra(uc || null, nFator, unidade);
    if (erroConv) {
      setErro(erroConv);
      return;
    }
    const r = await criarProduto({
      nome: nome.trim(),
      sku: sku.trim() || undefined,
      unidade,
      natureza: "insumo",
      // insumo nunca aparece na vitrine (SPEC F1 §6.3) — o hook força off,
      // mas a UI declara a intenção junto
      exibirVitrine: false,
      estoque: 0,
      estoqueMinimo: 5,
      precoVenda: 0,
      precoCusto: 0,
      unidadeCompra: uc || null,
      // sem unidade de compra o fator é ignorado — não faz sentido avulso
      fatorConversao: uc ? nFator : null,
    });
    if (!r.success || !r.id) {
      // erro inline: o digitado permanece no form (nada se perde)
      setErro(r.error || "Não foi possível cadastrar o item.");
      return;
    }
    onCriado({
      id: r.id,
      nome: nome.trim(),
      sku: sku.trim(),
      unidade,
      unidadeCompra: uc,
      fator: uc ? nFator : null,
    });
  };

  return (
    <BottomSheet
      open
      onClose={salvando ? () => undefined : onFechar}
      labelledBy="nova-item-mini-titulo"
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="nova-item-mini-titulo" className="text-base font-semibold text-[#1f2937] sm:text-lg">
              {tituloMiniSheet("Cadastrar item", termo)}
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              Só o necessário para registrar a compra. Complete o cadastro depois em Estoque.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
      }
      footer={
        <div>
          {erro && (
            <p className="mb-2 text-xs text-red-600" role="alert" style={{ fontWeight: 500 }}>
              {erro}
            </p>
          )}
          <SheetFooterActions>
            <button type="button" onClick={onFechar} disabled={salvando} className={sheetButtonSecundario}>
              Voltar para a compra
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className={sheetButtonPrimario}
              style={{ background: "#86cb92" }}
            >
              {salvando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Cadastrar e adicionar
                </>
              )}
            </button>
          </SheetFooterActions>
        </div>
      }
    >
      <div className="space-y-3.5">
        <label className="block text-sm font-medium text-[#1f2937]">
          Nome *
          <input
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErro("");
            }}
            placeholder="Ex.: Embalagem kraft 20x30"
            autoComplete="off"
            autoFocus
            data-sheet-foco
            className={`${campoFormSheet} text-base`}
          />
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          SKU (opcional)
          <input
            type="text"
            value={sku}
            onChange={(e) => {
              setSku(e.target.value);
              setErro("");
            }}
            placeholder="Ex.: EMK-2030"
            autoComplete="off"
            className={`${campoFormSheet} text-base`}
          />
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          Unidade do estoque *
          <select
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            className={`${campoFormSheet} text-base`}
          >
            {UNIDADES_ESTOQUE.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] text-[#627271]">
            O que você guarda no estoque (ex.: g, un, kg).
          </span>
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          Unidade de compra (opcional)
          <input
            type="text"
            value={unidadeCompra}
            onChange={(e) => {
              setUnidadeCompra(e.target.value);
              setErro("");
            }}
            list="nova-compra-mini-unidade-compra"
            placeholder="Ex.: Caixa, Pacote, Fardo"
            autoComplete="off"
            className={`${campoFormSheet} text-base`}
          />
          <datalist id="nova-compra-mini-unidade-compra">
            {UNIDADES_COMPRA.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
          <span className="mt-1 block text-[11px] text-[#627271]">
            Que você paga ao fornecedor (ex.: Caixa, Pacote, Fardo). Vazio = compra na unidade do estoque.
          </span>
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          {unidadeCompra.trim()
            ? `1 ${unidadeCompra.trim()} contém quantas ${unidade}?`
            : "1 unidade de compra contém quantas de estoque?"}
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={fator}
            onChange={(e) => {
              setFator(e.target.value);
              setErro("");
            }}
            placeholder="Ex.: 500"
            className={`${campoFormSheet} text-base`}
          />
          <span className="mt-1 block text-[11px] text-[#627271]">
            Sempre na direção compra → estoque e maior que 1 quando as unidades diferem — ex.: 1 Caixa tem 500 g → fator 500.
          </span>
        </label>
      </div>
    </BottomSheet>
  );
}

/**
 * "Cadastrar fornecedor na hora": nome + telefone + observação. O hook faz
 * find-or-create por nome (idempotente); cadastro completo fica para
 * Fornecedores depois — hint avisa.
 */
function MiniSheetNovoFornecedor({
  termo,
  criando,
  criarFornecedor,
  onFechar,
  onCriado,
}: {
  termo: string;
  criando: boolean;
  criarFornecedor: (dados: CriarFornecedorDados) => Promise<CriarFornecedorResult>;
  onFechar: () => void;
  onCriado: (novo: FornecedorSimples) => void;
}) {
  const [nome, setNome] = useState(termo.trim());
  const [telefone, setTelefone] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");

  const salvar = async () => {
    if (criando) return;
    setErro("");
    if (!nome.trim()) {
      setErro("Informe o nome do fornecedor.");
      return;
    }
    const r = await criarFornecedor({
      nome: nome.trim(),
      telefone: telefone.trim() || undefined,
      observacao: observacao.trim() || undefined,
    });
    if (!r.success || !r.id) {
      // erro inline: o digitado permanece no form (nada se perde)
      setErro(r.error || "Não foi possível cadastrar o fornecedor.");
      return;
    }
    onCriado({ id: r.id, nome: nome.trim() });
  };

  return (
    <BottomSheet
      open
      onClose={criando ? () => undefined : onFechar}
      labelledBy="nova-fornecedor-mini-titulo"
      header={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="nova-fornecedor-mini-titulo" className="text-base font-semibold text-[#1f2937] sm:text-lg">
              {tituloMiniSheet("Cadastrar fornecedor", termo)}
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              Só o necessário para vincular esta compra. Complete o cadastro depois em Fornecedores.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            disabled={criando}
            aria-label="Fechar"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
      }
      footer={
        <div>
          {erro && (
            <p className="mb-2 text-xs text-red-600" role="alert" style={{ fontWeight: 500 }}>
              {erro}
            </p>
          )}
          <SheetFooterActions>
            <button type="button" onClick={onFechar} disabled={criando} className={sheetButtonSecundario}>
              Voltar para a compra
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={criando}
              className={sheetButtonPrimario}
              style={{ background: "#86cb92" }}
            >
              {criando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Cadastrar fornecedor
                </>
              )}
            </button>
          </SheetFooterActions>
        </div>
      }
    >
      <div className="space-y-3.5">
        <label className="block text-sm font-medium text-[#1f2937]">
          Nome *
          <input
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErro("");
            }}
            placeholder="Ex.: Distribuidora Sul Papelaria"
            autoComplete="off"
            autoFocus
            data-sheet-foco
            className={`${campoFormSheet} text-base`}
          />
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          Telefone (opcional)
          <input
            type="tel"
            inputMode="tel"
            value={telefone}
            onChange={(e) => {
              setTelefone(e.target.value);
              setErro("");
            }}
            placeholder="(11) 90000-0000"
            autoComplete="off"
            className={`${campoFormSheet} text-base`}
          />
        </label>

        <label className="block text-sm font-medium text-[#1f2937]">
          Observação (opcional)
          <textarea
            value={observacao}
            onChange={(e) => {
              setObservacao(e.target.value);
              setErro("");
            }}
            rows={2}
            placeholder="Ex.: atende no balcão, entrega em 2 dias"
            className={`${campoFormSheet} min-h-[44px] text-base`}
          />
        </label>
      </div>
    </BottomSheet>
  );
}
