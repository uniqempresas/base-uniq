/**
 * Tela "Nova compra" — página própria mobile-first (WIREs COMPRA_TELA_C1_C2
 * → C3 → COMPRA_TELA_C4_LINHA_RAPIDA + ajustes C5; o parágrafo C5 no fim
 * deste bloco é o estado ATUAL da tela — C4 continua o contrato do topo).
 *
 * C1 — experiência de mercado, uma mão: rota `/estoque/compras/nova` substitui
 * o antigo modal NovaCompraSheet. Estrutura top→bottom: header (título +
 * fornecedor + total até agora) → bloco Fornecedor (select + "+ Novo
 * fornecedor" em mini-sheet) → busca de ITEM SOMENTE natureza=insumo (WIRE M1;
 * "cadastrar na hora" força insumo) → itens linha-a-linha (lista única — C5) →
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
 * Rascunho: variável do módulo (sobrevive à navegação SPA) + sessionStorage
 * (C5 — sobrevive ao F5): ir para o cadastro completo de fornecedor e voltar
 * NÃO perde as linhas digitadas; salvar a compra limpa memória E sessão.
 *
 * C3 — inserção padrão CARRINHO (fundador, 07/10/2026): cada resultado da
 * busca de insumo ganha botão verde "Adicionar" que põe a linha no carrinho
 * com 1 unidade de compra + último preço num toque só, e a busca segue limpa,
 * aberta e focada para o próximo item (mercado: buscar → adicionar → buscar).
 * Tocar no CORPO do card é o caminho de quem quer configurar antes: cria a
 * linha com qtd vazia e foca o editor dela — ou, se o produto já tem linha,
 * só foca a última (o corpo nunca duplica). O MESMO item via botão outra vez
 * = OUTRA linha separada (decisão do C3 — SUPERSEDED pelo C4: agora o
 * quick-add FUNDE somando quantidade na mesma linha). Microconfirmação sem
 * ruído: a linha recém-adicionada pisca 1x, o contador "N itens" dá um pop e
 * um toast de id fixo (nunca empilha) avisa "+1 caixa de Uva · 4 itens".
 *
 * Padrões do módulo respeitados (ComprasPage/ContasPagarPage): paleta textual
 * #1f2937/#627271/#efefef/#86cb92, BottomSheet header/footer sticky para os
 * mini-sheets, hotfix relatedTarget no blur do dropdown de fornecedor —
 * nas AÇÕES DA LINHA RÁPIDA vale só pointerdown preventDefault (cobre mouse,
 * toque e caneta num evento único) e, nos CANDIDATOS dos dois dropdowns, o
 * gesto tap do C6-b (pointerdown preventDefault + pointerup com threshold de
 * 10px/500ms — o antigo hotfix pointerdown+mousedown do fornecedor marcava
 * no início do arrasto e disparava a seleção duas vezes no desktop),
 * inputs 16px (sem zoom do iOS), alvos de
 * toque ≥ 44px, skeleton/empty/erro, labels de formulário e aria-labels.
 * Animação só na microconfirmação do carrinho (desligada em
 * prefers-reduced-motion). Sem chamada de API inventada — hooks reais do
 * módulo.
 *
 * C4 — "Linha Rápida + Teclado Educado" (WIRE COMPRA_TELA_C4_LINHA_RAPIDA
 * v1.0, fundador 07/10/2026): o fluxo busca→pill vira UMA linha de trabalho
 * congelada no topo, abaixo do header. Linha 1: nome do item com autocomplete
 * do catálogo de insumos (tap numa sugestão — hoje o gesto tap do C6-b, antes
 * o onPointerDown imediato — ou Enter no primeiro candidato reconhece o item
 * SEM fechar o teclado; C8 SUPERSEDE esse caminho no insumo: o candidato é o
 * datalist nativo e o tap sobra só no fornecedor). Linha 2 compacta aparece quando o item é reconhecido:
 * `Qtd (unidade de compra)` · `R$ 0,00` (mascara) · botão verde
 * [＋ Adicionar] ≥ 44px. Ao reconhecer, qty=1 e o último preço pago entram
 * pré-cheios — "o toque é conferir e adicionar". Adicionar: merge na MESMA
 * linha se o item já está no carrinho (soma a quantidade; preço do último
 * toque vence; linha pisca 1x) ou linha nova, e a linha rápida volta limpa
 * com foco no nome para o próximo item (C6-a: limpa DE VERDADE — nome e
 * seleção somem após adicionar; no C4 original o nome ficava/seleção seguia)
 * — teclado NUNCA fecha durante o ciclo
 * (padrão pointerdown preventDefault do des-4/C3). O rodapé sticky com
 * "Salvar compra" SAI da tela (era o ladrão de altura com teclado aberto):
 * salvar vira pill discreto no header, habilitado só com ≥1 item — decisão
 * consciente, tela limpa enquanto se digita. Teclado educado:
 * `interactive-widget=resizes-content` no index.html (Chrome/Vivaldi
 * Android: o layout encolhe e o sticky top já fica acima do teclado) +
 * hook `useViewportTeclado` via visualViewport (iOS: padding-bottom
 * dinâmico empurra a lista para cima do teclado; sem o hook o Safari só
 * empurra o document e o scroller interno ignoraria o teclado). Fornecedor,
 * NF, total, rascunho em memória, flash, mini-sheets de cadastro na hora e
 * estados loading/saving/erro/vazio continuam como no C1–C3.
 *
 * C5 — ajustes reportados pelo fundador (07/10/2026, esta passada): (1) o
 * FORNECEDOR entra no bloco congelado como PRIMEIRA fileira compacta (label
 * 10px + busca/autocomplete com TODO o comportamento do C1 + botão "+ Novo"
 * ≥44px ao lado), e a Nota fiscal vira a segunda fileira do congelado — a
 * section "1 · Fornecedor" de baixo sai da tela e os itens viram o único
 * bloco rolável. (2) A linha 2 da Linha Rápida NUNCA herda o valor digitado
 * para o item anterior: reconhecer(), editar/esvaziar o nome e o pós-
 * adicionar aplicam a regra determinística qtd=1 + valor do histórico do
 * PRÓPRIO item (ou vazio). (3) O carrinho sobrevive ao F5: rascunho +
 * seqLinha persistidos em sessionStorage (chave uniq.nova-compra.rascunho-v1;
 * try/catch em toda leitura/escrita e shape inválido = descarte silencioso —
 * storage corrompido ou modo privado nunca quebra a tela); salvar limpa
 * memória E sessão. (4) Os itens do carrinho viram UMA lista compacta estilo
 * "nota de papelaria" (container único, linhas divide-y): nome + remover no
 * topo da linha, fileira de edição Qtd · Valor · subtotal sempre aberta,
 * conversão em texto pequeno (aviso amarelo quando falta o fator). O chip de
 * último preço sai das linhas — a informação continua na autocomplete da
 * Linha Rápida.
 *
 * C6 — segunda leva do fundador (07/10/2026, passada atual): (a) RESETAR A
 * BARRA APÓS ADICIONAR — o "nome fica/seleção segue" do C4 está SUPERSEDED
 * (decisão em teste real): no sucesso do ＋ Adicionar, o campo nome volta
 * VAZIO, a seleção limpa (qtd 1 · valor vazio como antes), a linha 2 some
 * sozinha e o foco devolve ao MESMO input — teclado nunca fecha (nenhum
 * blur é introduzido). Quer o MESMO item de novo? Digitar de novo: troca
 * consciente, a prova do que acabou de entrar é a linha piscando no carrinho
 * + o toast de id fixo (mantido). (b) SCROLL DE CANDIDATO NÃO SELECIONA —
 * nos DOIS dropdowns (insumo e fornecedor) a ação saiu do pointerdown
 * imediato: o preventDefault fica (é ele que segura o teclado), origem +
 * tempo são registrados e a seleção só dispara no pointerup do MESMO botão
 * com <10px de deslocamento e <500ms (tap). Em toque o "implicit pointer
 * capture" entrega o pointerup no elemento do pointerdown mesmo depois de
 * rolar — o threshold é o que separa tap de scroll; no desktop,
 * press+release parado é o clique normal e o antigo onMouseDown duplicado
 * do fornecedor foi REMOVIDO (dispararia a seleção duas vezes). Hook única
 * no arquivo: useTapSemScroll, compartilhada pelos dois dropdowns.
 *
 * C8 — Linha Rápida SEM painel custom (fundador: "completar DIRETO na barra",
 * fluidez de mercado): o painel de candidatos de INSUMO (C3/C4/C6-b) morre e
 * vira datalist NATIVO — `list="nc-insumo-list"` no input + <option> por
 * nome do catálogo completo (dedupe por nome; SEM filtro e SEM slice nossos:
 * quem filtra/completa é o BROWSER). Ganho: a sugestão completa dentro da
 * própria barra — zero overlay, menos um clique, teclado nunca fecha. Custo
 * consciente: o chip "N no carrinho" e o último preço saem da lista de
 * candidatos (a ordenação/visual do dropdown agora é do browser) — o chip
 * migra para acima do botão Adicionar na linha 2. O reconhecimento segue por
 * IGUALDADE DE TEXTO no memo (nome/SKU): o browser entrega o nome exato ao
 * completar → memo reconhece → linha 2 abre com qtd=1 + último preço DESTE
 * item (efeito C8 no lugar do reconhecer() de toque; regra determinística
 * C5 §2 intacta — e sem roubo de foco da barra no meio da digitação). Com
 * texto digitado e sem match: o CTA "+ Cadastrar ... na hora" vive na área
 * da linha 2 (loading/erro+retry migraram para lá junto); qInsumo vazio =
 * nada, a linha rápida fica limpa só com o placeholder. Enter submete o
 * form = adicionar/cadastrar como hoje (ramo C8: qInsumo && !reconhecido →
 * mini-sheet). useTapSemScroll (C6-b) continua válido APENAS no dropdown de
 * FORNECEDOR — o fundador não pediu mexer lá.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "../../lib/produto-utils";
import { mascararMoeda, moedaDeValor, parsearMoeda } from "../../lib/masks";
import { useProdutos } from "../../hooks/use-produtos";
import { useViewportTeclado } from "../../hooks/use-viewport-teclado";
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

/**
 * C6-b — "tap que não confunde com scroll". Desde o C8 é usado APENAS no
 * dropdown de candidatos do FORNECEDOR (o autocomplete de insumo virou
 * datalist nativo e morreu o painel). O bug original: agir no onPointerDown
 * marcava o item no INSTANTE do toque — encostar num candidato pra rolar a
 * selecionava. O gesto aqui: pointerdown mantém o preventDefault (é o truque
 * que segura foco/teclado aberto — nada muda aí) e registra origem+tempo; a
 * ação só dispara no pointerup do MESMO botão com deslocamento < 10px e
 * duração < 500ms. Em toque vale o "implicit pointer capture": o pointerup
 * chega no elemento do pointerdown mesmo depois de rolar — é o threshold de
 * distância/tempo que separa tap de scroll (e o pointercancel do gesto de
 * rolagem limpa a origem). Em desktop, press+release parado é o clique
 * normal; o antigo onMouseDown duplicado do fornecedor saiu de cena (ele
 * dispararia a seleção duas vezes). Uso: `const tap = useTapSemScroll();`
 * no componente e `<button {...tap(() => selecionar(id))} />` no candidato.
 */
function useTapSemScroll() {
  const inicio = useRef<{ x: number; y: number; t: number } | null>(null);
  return useCallback((acao: () => void) => {
    return {
      onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => {
        // NUNCA deixa o teclado fechar (padrão C3/C4) — mas aqui NÃO age:
        // só marca o início do gesto.
        e.preventDefault();
        inicio.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      },
      onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => {
        const i = inicio.current;
        inicio.current = null;
        if (!i) return;
        // tap = dedo/mouse quase parado + soltura rápida; arrasto = scroll
        if (Math.hypot(e.clientX - i.x, e.clientY - i.y) < 10 && performance.now() - i.t < 500) {
          acao();
        }
      },
      // browser assumiu o gesto como rolagem/gesto do sistema: nada de tap
      onPointerCancel: () => {
        inicio.current = null;
      },
    };
  }, []);
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
 * C5 §3 — chave fixa do rascunho no sessionStorage: o carrinho sobrevive ao
 * F5 do fundador no mercado. TODA leitura/escrita é try/catch — modo privado
 * ou quota cheia nunca podem quebrar a tela — e o shape inválido é descartado
 * em silêncio (a compra recomeça vazia).
 */
const RASCUNHO_KEY = "uniq.nova-compra.rascunho-v1";

/** Lê e valida o rascunho persistido; desvio de shape → null (descarte). */
function lerRascunhoDoStorage(): { rascunho: RascunhoCompra; seq: number } | null {
  try {
    const bruto = sessionStorage.getItem(RASCUNHO_KEY);
    if (!bruto) return null;
    const d = JSON.parse(bruto) as Record<string, unknown> | null;
    const itensRaw = d && Array.isArray(d.itens) ? (d.itens as unknown[]) : null;
    // breakage check: linha sem chave/strings ou sem produto.id é rascunho de
    // outra versão — descarta TUDO em vez de montar meia tela
    const itensOk =
      !!itensRaw &&
      itensRaw.every((l) => {
        if (!l || typeof l !== "object") return false;
        const it = l as Record<string, unknown>;
        const p = it.produto as Record<string, unknown> | null | undefined;
        return (
          typeof it.chave === "string" &&
          typeof it.quantidade === "string" &&
          typeof it.valorUnitario === "string" &&
          !!p &&
          typeof p.id === "string" &&
          typeof p.nome === "string"
        );
      });
    if (!d || !itensRaw || !itensOk) {
      limparRascunhoNoStorage();
      return null;
    }
    const fn = d.fornecedorNovo as Record<string, unknown> | null | undefined;
    return {
      rascunho: {
        fornecedorId: typeof d.fornecedorId === "string" ? d.fornecedorId : null,
        fornecedorNovo:
          fn && typeof fn.id === "string" && typeof fn.nome === "string" ? (fn as unknown as FornecedorSimples) : null,
        notaFiscal: typeof d.notaFiscal === "string" ? d.notaFiscal : "",
        itens: itensRaw as unknown as LinhaItem[],
      },
      seq: typeof d.seq === "number" && Number.isFinite(d.seq) ? Math.floor(d.seq) : 0,
    };
  } catch {
    // JSON corrompido / storage inacessível → começa vazio, silencioso
    return null;
  }
}

/** Grava rascunho + contador; quota/modo privado = seguir só na memória. */
function gravarRascunhoNoStorage(r: RascunhoCompra, seq: number): void {
  try {
    sessionStorage.setItem(RASCUNHO_KEY, JSON.stringify({ ...r, seq }));
  } catch {
    /* storage indisponível: nada a fazer — a tela não depende dele */
  }
}

/** salvar() bem-sucedido: o rascunho morre na memória E na sessão. */
function limparRascunhoNoStorage(): void {
  try {
    sessionStorage.removeItem(RASCUNHO_KEY);
  } catch {
    /* sem storage, sem o que limpar */
  }
}

/**
 * Rascunho em MEMÓRIA (variável do módulo — sobrevive à navegação SPA, ex.:
 * ir cadastrar o fornecedor completo e voltar) com camada de sessionStorage
 * por cima (C5 §3 — sobrevive também ao F5). Hidratado na carga do módulo;
 * limpo quando a compra é salva.
 */
let rascunhoAtual: RascunhoCompra = rascunhoVazio();

/**
 * C3 — chave ÚNICA por linha. Com o mesmo item podendo entrar duas vezes,
 * `novo-${id}` colidiria e `atualizarLinha`/`remover` (que buscam por chave)
 * atingiriam as duas linhas de uma vez. Contador do módulo: sobrevive à
 * navegação junto com o rascunho e nunca repete — e volta do storage no F5
 * (C5 §3), sempre acima da maior chave restaurada.
 */
let seqLinha = 0;
const novaChave = (produtoId: string) => `linha-${++seqLinha}-${produtoId}`;

// C5 §3 — hidratação ÚNICA na carga do módulo (roda antes do primeiro mount)
{
  const salvo = lerRascunhoDoStorage();
  if (salvo) {
    rascunhoAtual = salvo.rascunho;
    // nada de colisão de chave pós-refresh: o seq nunca fica abaixo da maior
    // chave "linha-N-..." que voltou do storage
    let maior = 0;
    for (const l of rascunhoAtual.itens) {
      const n = Number(l.chave.split("-")[1]);
      if (Number.isFinite(n) && n > maior) maior = n;
    }
    seqLinha = Math.max(salvo.seq, maior);
  }
}

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
  // C4 — teclado educado (iOS): inset em px coberto pelo teclado virtual +
  // flag para limpar a tela (pill "Salvar" some enquanto se digita)
  const { tecladoAberto, inset: insetTeclado } = useViewportTeclado();

  // ---------- rascunho (hidrata do módulo/sessionStorage, grava de volta) ----
  const [fornecedorId, setFornecedorId] = useState<string | null>(rascunhoAtual.fornecedorId);
  const [fornecedorExtra, setFornecedorExtra] = useState<FornecedorSimples | null>(rascunhoAtual.fornecedorNovo);
  const [notaFiscal, setNotaFiscal] = useState(rascunhoAtual.notaFiscal);
  const [itens, setItens] = useState<LinhaItem[]>(rascunhoAtual.itens);

  useEffect(() => {
    rascunhoAtual = { fornecedorId, fornecedorNovo: fornecedorExtra, notaFiscal, itens };
    // C5 §3 — espelha na sessão junto com a memória: o F5 no mercado não
    // apaga o carrinho (o seq vai junto para a próxima chave não colidir)
    gravarRascunhoNoStorage(rascunhoAtual, seqLinha);
  }, [fornecedorId, fornecedorExtra, notaFiscal, itens]);

  // ---------- estado de UI (efêmero — não faz parte do rascunho) ────────────
  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [fornecedorAberto, setFornecedorAberto] = useState(false);
  // C4/C8 — Linha Rápida: nome digitado NA PRÓPRIA barra (o datalist entrega o
  // completion; sem painel de candidatos) + insumo RECONHECIDO por igualdade
  // exata nome/SKU. O selInsumo sobrevive só para o snapshot U2.2 (item recém-
  // cadastrado, antes do refetch). qtd/valor ficam na linha 2.
  const [termoNome, setTermoNome] = useState("");
  const [selInsumo, setSelInsumo] = useState<Produto | LinhaNova | null>(null);
  const [rapidoQtd, setRapidoQtd] = useState("1");
  const [rapidoValor, setRapidoValor] = useState("");
  const [miniItemAberto, setMiniItemAberto] = useState(false);
  const [miniFornecedorAberto, setMiniFornecedorAberto] = useState(false);
  const [erro, setErro] = useState("");
  // C4 — microconfirmação: chave da linha que acabou de entrar/somar (pisca 1x)
  const [flashChave, setFlashChave] = useState<string | null>(null);

  const fornecedorRef = useRef<HTMLDivElement>(null);
  const nomeInputRef = useRef<HTMLInputElement>(null);
  // C6-b/C8 — handlers tap do DROPDOWN DE FORNECEDOR (o candidato de insumo
  // virou datalist nativo; o hook segue único e viva onde o fundador pediu)
  const tapCandidato = useTapSemScroll();
  // C8 — pré-preenchimento determinístico quando o RECONHECIMENTO muda de item
  // (texto exato / completion do datalist / snapshot U2.2): qtd volta a 1 e o
  // valor entra do histórico DESTE item — a mesma regra que o reconhecer() de
  // toque fazia (C5 §2), agora por id: editar qtd/valor no MESMO item nunca é
  // sobrescrito. E o CURSOR fica na barra: com datalist o fundador pode estar
  // terminando de digitar — nada de pular pra Qtd no meio do dedilhado.
  const ultimoReconhecidoId = useRef<string | null>(null);

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

  // ---------- linha rápida SOMENTE natureza=insumo (M1/C1) — C8: datalist ───
  // qInsumo continua servindo p/ 2 coisas: a igualdade exata do reconhecimento
  // e o CTA "cadastrar na hora". QUEM FILTRA/COMPLETA AGORA É O BROWSER —
  // sem lista de candidatos nossa, sem slice(0,8).
  const qInsumo = termoNome.trim().toLowerCase();
  const insumos = useMemo(() => produtos.filter((p) => p.natureza === "insumo"), [produtos]);
  // C8 — fonte do <datalist>: catálogo COMPLETO de insumos dedupe-por-nome
  // (opções repetidas confundem o datalist). O catálogo de microempresa é
  // pequeno — entregar tudo e deixar o browser filtrar é o fluído.
  const nomesInsumo = useMemo(() => Array.from(new Set(insumos.map((p) => p.nome))), [insumos]);

  /**
   * C4/C8 — item RECONHECIDO: por IGUALDADE DE TEXTO (nome ou SKU, case-
   * insensitive) — e é exatamente isso que o datalist entrega: o fundador
   * digita "uva", o browser completa "Caixa de Uva" NA BARRA, o texto bate
   * com o nome, o memo reconhece e a linha 2 abre. selInsumo (toque no
   * candidato) sumiu como caminho obrigatório sobra só o snapshot U2.2 do
   * mini-sheet, que ainda manda quando existe.
   */
  const insumoReconhecido = useMemo<LinhaNova | null>(() => {
    if (selInsumo) return selInsumo;
    if (!qInsumo) return null;
    return (
      insumos.find((p) => p.nome.trim().toLowerCase() === qInsumo || p.sku.trim().toLowerCase() === qInsumo) ?? null
    );
  }, [selInsumo, insumos, qInsumo]);

  // C8 — o reconhecer() de toque morreu com o painel; a parte que IMPORTAVA
  // dele (pré-preencher qtd/valor na chegada de um item — regra determinística
  // C5 §2: histórico DESTE item, ou vazio; nunca o valor do item anterior)
  // vive aqui, por id: só dispara quando o reconhecimento MUDA de item, então
  // o fundador pode editar qtd/valor à vontade no MESMO item sem o efeito
  // sobrescrever. O cursor fica na barra (zero roubo de foco no meio da
  // digitação — fluxo: completar → conferir na linha 2 → Enter/Adicionar).
  useEffect(() => {
    const id = insumoReconhecido?.id ?? null;
    if (id === ultimoReconhecidoId.current) return;
    ultimoReconhecidoId.current = id;
    if (!insumoReconhecido) return;
    setRapidoQtd("1");
    setRapidoValor(
      insumoReconhecido.ultimoPrecoCompra != null && insumoReconhecido.ultimoPrecoCompra > 0
        ? moedaDeValor(insumoReconhecido.ultimoPrecoCompra)
        : ""
    );
  }, [insumoReconhecido]);

  /** C4 — quantidade JÁ no carrinho por produto (o merge soma em uma linha única). */
  const qtdNoCarrinho = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of itens) m.set(l.produto.id, (m.get(l.produto.id) ?? 0) + (parseFloat(l.quantidade) || 0));
    return m;
  }, [itens]);

  // C8 — o chip "N no carrinho" que vivia em cada linha do painel de
  // candidatos agora cola no item RECONHECIDO da linha 2: o Adicionar vai
  // SUMAR nessa quantidade (merge C4), então a contagem prévia é a informação
  // que evita o "entrei duas vezes sem querer" do mercado.
  const noCarrinhoRapido = insumoReconhecido ? (qtdNoCarrinho.get(insumoReconhecido.id) ?? 0) : 0;

  const selecionarFornecedor = (id: string) => {
    setFornecedorId(id);
    setBuscaFornecedor("");
    setFornecedorAberto(false);
    setErro("");
  };

  /**
   * C4 — adicionar ao carrinho a partir da linha rápida (ou do snapshot recém-
   * cadastrado no mini-sheet). Diferente do C3: o MESMO item em linhas
   * separadas era confusão de carrinho — agora o padrão da categoria quick-add
   * é FUNDIR: se já existe linha do produto, a quantidade SOMA na MESMA linha
   * (o editor continua acessível pelo corpo da linha). Se o campo valor tem
   * texto, ele VENCE o preço antigo da linha (última informação de preço da
   * compra é a que foi dita agora no mercado); vazio, mantém o preço da linha.
   * Nova linha: qtd/valor exatamente como na linha rápida.
   *
    * Ciclo pós-toque (WIRE §1 + C6-a): teclado segue aberto (botão pointerdown
    * preventDefault) e a linha volta TOTALMENTE limpa pro próximo item —
    * nome, seleção, qtd=1 e valor vazio (repetir o MESMO item é digitar de
    * novo: troca consciente do fundador, o C4 "nome fica/seleção segue" está
    * SUPERSEDED). A linha alvo pisca 1x e um toast de id fixo avisa a soma —
    * a única microconfirmação do ciclo.
    */
  const adicionar = (p: Produto | LinhaNova, qtdTexto: string, valorTexto: string) => {
    const q = parseFloat(qtdTexto) || 0;
    if (!(q > 0)) {
      setErro("Informe uma quantidade maior que zero.");
      return false;
    }
    const existente = itens.find((l) => l.produto.id === p.id);
    const chave = existente?.chave ?? novaChave(p.id);
    const valorFinal = valorTexto.trim() !== "" ? valorTexto : (existente?.valorUnitario ?? "");

    setItens((prev) =>
      prev.some((l) => l.chave === chave)
        ? prev.map((l) =>
            l.chave === chave
              ? { ...l, quantidade: String((parseFloat(l.quantidade) || 0) + q), valorUnitario: valorFinal }
              : l
          )
        : [...prev, { chave, produto: p as Produto, quantidade: String(q), valorUnitario: valorFinal }]
    );

    setErro("");
    setFlashChave(chave);
    window.setTimeout(() => setFlashChave((atual) => (atual === chave ? null : atual)), 1100);

    const un = p.unidadeCompra?.trim() || p.unidade;
    const n = existente ? itens.length : itens.length + 1;
    toast.success(`+${fmtNum(q)} ${un} de ${p.nome} · ${n} ${n === 1 ? "item" : "itens"} no carrinho`, {
      id: "nova-compra-carrinho",
    });
    return true;
  };

  /** C4 — gatilho do botão ＋ Adicionar / Enter: exige item reconhecido.
   *  C6-a: no sucesso, a barra de busca volta VAZIA para o próximo item. */
  const adicionarDaLinhaRapida = () => {
    if (!insumoReconhecido) {
      // C8 — sem painel/candidatos filtrados, a regra do "não existe" é
      // direta: há texto digitado && o memo não reconheceu → cadastrar na
      // hora (o mini-sheet recebe o termo pré-cheio pela prop `termo`)
      if (qInsumo) setMiniItemAberto(true);
      return;
    }
    if (adicionar(insumoReconhecido, rapidoQtd, rapidoValor)) {
      // C6-a — RESET TOTAL da barra (fundador em teste real; o "nome fica/
      // seleção segue" do C4 está SUPERSEDED): nome limpa, seleção limpa,
      // qtd volta a 1 e o valor some. Sem selInsumo e com o termo vazio, o
      // memo insumoReconhecido cai sozinho e a linha 2 desaparece por própria
      // conta — os setState abaixo são escrita direta no estado, NADA passa
      // pelo onChange (nenhum efeito colateral no rascunho/sessionStorage).
      setSelInsumo(null);
      setTermoNome("");
      setRapidoQtd("1");
      setRapidoValor("");
      // O foco volta ao MESMO campo nome: o ponteiro nunca saiu da linha
      // rápida (pointerdown preventDefault no botão), não há blur a cuidar —
      // só garantir que o teclado segue aberto. Repetir o MESMO item agora é
      // digitar de novo: trade-off consciente; a prova do que acabou de
      // entrar é a linha piscando 1x no carrinho + o toast de id fixo do
      // adicionar() (única microconfirmação, mantido).
      nomeInputRef.current?.focus();
    }
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
    const snapshot: LinhaNova = {
      id: String(dados.id),
      nome: dados.nome,
      sku: dados.sku,
      unidade: dados.unidade,
      unidadeCompra: dados.unidadeCompra || null,
      fatorConversao: dados.fator,
      ultimoPrecoCompra: null,
      ultimaCompraEm: null,
    };
    // C4: o recém-cadastrado entra pelo caminho do MERGE com a qtd/valor que a
    // linha rápida já tinha (valor vazio = linha nasce com R$ 0,00 e o editor
    // do corpo ajusta — nunca herda preço de OUTRO item).
    adicionar(snapshot, rapidoQtd || "1", rapidoValor);
    setSelInsumo(snapshot);
    setTermoNome(snapshot.nome);
    setRapidoQtd("1");
    setRapidoValor("");
    recarregarProdutos();
    setMiniItemAberto(false);
    // C4: o snapshot entra sem histórico de preço; mesmo id do toast →
    // substitui o "+1 ..." do adicionar() em vez de empilhar dois.
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

    // C5 §3 — limpa MEMÓRIA e sessionStorage: F5 depois de salvar não
    // ressuscita o carrinho já registrado.
    rascunhoAtual = rascunhoVazio();
    seqLinha = 0;
    limparRascunhoNoStorage();
    toast.success(`Compra de ${formatCurrency(total)} registrada — aguardando recebimento.`);
    voltar();
  };

  const itensVazios = itens.length === 0;

  return (
    <main
      data-od-id="nova-compra-regiao"
      className="mx-auto flex min-h-full max-w-2xl flex-col p-3 pb-[calc(0.75rem+var(--nc-kb,0px))] text-[#1f2937] sm:p-6 sm:pb-[calc(1.5rem+var(--nc-kb,0px))]"
      // C4 — teclado educado: com `interactive-widget=resizes-content` o
      // Chrome/Vivaldi já encolhe o layout (o bloco sticky vai junto, o inset
      // mede 0 aqui). Onde o meta não existe (iOS), o --nc-kb medido via
      // visualViewport cria rolagem extra pra lista sair de trás do teclado
      // sem esconder a linha rápida (que fica no topo, longe das teclas).
      style={{ fontFamily: "Poppins, sans-serif", "--nc-kb": `${insetTeclado}px` } as CSSProperties}
    >
      {/* ══ BLOCO CONGELADO (WIRE C4 §1/§4 + C5 §1): header + FORNECEDOR + NF +
          Linha Rápida. Frozen no topo — a lista rola POR BAIXO deste retângulo,
          nunca por cima; o teclado abre embaixo e nada aqui embaixo existe.
          C5: tudo compacto aqui dentro (labels 10px, fileiras coladas, sem
          títulos numerados) — cada px do congelado é px de lista visível. ══ */}
      <div className="sticky top-0 z-40 -mx-3 -mt-3 border-b border-[#e3e3e3] bg-[#efefef]/95 px-3 pb-2 pt-2.5 backdrop-blur-sm sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-5">
        {/* Header (WIRE C1 §1 + C4 §4): voltar + título + sublinha viva +
            pill Salvar. Salvar SAIU do rodapé fixo: é pill discreto no topo,
            só habilitado com ≥1 item, e some enquanto o teclado está aberto
            (tela limpa enquanto digita — critério do fundador). */}
        <header className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={voltar}
            aria-label="Voltar para a lista de compras"
            className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 data-od-id="nova-compra-heading" className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: 17 }}>
              Nova compra
            </h1>
            <p className="truncate text-[11px] text-[#627271] sm:text-xs" aria-live="polite">
              {fornecedorSelecionado ? fornecedorSelecionado.nome : "Escolha o fornecedor"}
              {" · "}
              {/* C4: key=length+total remonta o span a cada add/merge → pop 1x */}
              <span key={`${itens.length}-${total}`} className="nc-pop">
                {itens.length === 1 ? "1 item" : `${itens.length} itens`}
              </span>
              {" · "}
              {formatCurrency(total)}
            </p>
          </div>
          {!tecladoAberto && (
            <button
              type="button"
              onClick={salvar}
              disabled={criando || itensVazios}
              aria-label="Salvar compra"
              title={itensVazios ? "Adicione pelo menos 1 item" : "Salvar compra (fica pendente de recebimento)"}
              className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl px-3 transition-colors ${
                criando || itensVazios
                  ? "cursor-not-allowed bg-[#e4e4e4] text-[#9aa3a2]"
                  : "bg-[#86cb92] text-[#1f2937] hover:bg-[#1f2937] hover:text-white active:bg-[#1f2937] active:text-white"
              }`}
              style={{ fontWeight: 700 }}
            >
              {criando ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span className="text-xs">Salvando...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span className="text-xs">Salvar</span>
                </>
              )}
            </button>
          )}
        </header>

        {/* ── Fornecedor (C5 §1): PRIMEIRO item do congelado, fileira compacta
            — o fundador escolhe o fornecedor ANTES do primeiro item, sem
            rolar. Mantém TODO o comportamento do C1: autocomplete (hotfix
            pointerdown + mousedown preventDefault, Enter no primeiro
            candidato, Check verde no selecionado), mini-sheet "+ Novo" na hora
            e loading/erro/vazio — agora em versão curta. ── */}
        <div className="mt-2" ref={fornecedorRef} role="group" aria-labelledby="nc-fornecedor-label">
          <span id="nc-fornecedor-label" className="mb-1 block text-[10px] leading-none text-[#627271]" style={{ fontWeight: 600 }}>
            Fornecedor <span className="text-red-500">*</span>
          </span>

          {fornecedoresLoading && listaFornecedores.length === 0 ? (
            <div className="h-11 animate-pulse rounded-xl bg-white" aria-hidden="true" />
          ) : fornecedoresError && listaFornecedores.length === 0 ? (
            <div className="flex min-h-[44px] items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5" role="alert">
              <p className="min-w-0 flex-1 truncate text-[11px] text-red-700">
                Erro ao carregar fornecedores: {fornecedoresError}
              </p>
              <button
                type="button"
                onClick={recarregarFornecedores}
                className="flex min-h-[44px] shrink-0 items-center rounded-lg border border-red-200 bg-white px-2.5 text-xs text-red-700 transition-colors hover:bg-red-50"
                style={{ fontWeight: 600 }}
              >
                Tentar novamente
              </button>
            </div>
          ) : listaFornecedores.length === 0 ? (
            <div className="rounded-xl border border-[#efefef] bg-[#FAFAFA] px-3 py-2">
              <p className="text-[11px] leading-snug text-[#627271]">
                Nenhum fornecedor cadastrado ainda — cadastre aqui mesmo, sem sair da compra.
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5">
                <button
                  type="button"
                  onClick={() => setMiniFornecedorAberto(true)}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#86cb92] px-3.5 text-sm text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
                  style={{ fontWeight: 600 }}
                >
                  <Plus size={15} />
                  Novo fornecedor
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/fornecedores/novo")}
                  className="flex min-h-[44px] items-center text-left text-[11px] text-[#627271] underline transition-colors hover:text-[#1f2937]"
                >
                  ou cadastro completo em Fornecedores (o rascunho é mantido)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-1.5">
              <div className="relative min-w-0 flex-1">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" aria-hidden="true" />
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
                  autoComplete="off"
                  className={`${campoFormSheet} pl-9 text-base ${fornecedorSelecionado ? "pr-10" : ""}`}
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
                          // C1: escolher o fornecedor com o teclado vivo.
                          // C6-b: tap com threshold no lugar do hotfix antigo
                          // (pointerdown imediato marcava no INÍCIO do arrasto
                          // para rolar, e o onMouseDown duplicado disparava a
                          // seleção duas vezes no desktop — handler único agora).
                          {...tapCandidato(() => selecionarFornecedor(f.id))}
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
              {/* "+ Novo" SEMPRE ao lado do campo (mercado: o fornecedor do dia
                  quase nunca está cadastrado) — alvo ≥ 44px */}
              <button
                type="button"
                onClick={() => setMiniFornecedorAberto(true)}
                aria-label="Cadastrar novo fornecedor na hora"
                className="mt-1 flex min-h-[44px] shrink-0 items-center gap-1 rounded-xl border border-[#efefef] bg-white px-2.5 text-sm text-[#1f2937] transition-colors hover:bg-[#efefef]"
                style={{ fontWeight: 500 }}
              >
                <Plus size={14} />
                Novo
              </button>
            </div>
          )}
        </div>

        {/* Nota fiscal (C5 §1): segunda fileira compacta do congelado — o
            mesmo campo de antes, placeholder e comportamento iguais */}
        <label className="mt-1 block">
          <span className="mb-1 block text-[10px] leading-none text-[#627271]" style={{ fontWeight: 600 }}>
            Nota fiscal (opcional)
          </span>
          <input
            type="text"
            value={notaFiscal}
            onChange={(e) => setNotaFiscal(e.target.value)}
            placeholder="Ex.: 1042"
            autoComplete="off"
            className={`${campoFormSheet} text-base`}
          />
        </label>

        {/* ── Linha Rápida (WIRE C4 §1 + C8): nome com AUTOCOMPLETE NATIVA do
            navegador (datalist) — a sugestão completa DENTRO da própria barra,
            sem painel. Quando o texto bate com um insumo, a linha 2 COLADA
            libera `Qtd (unidade)` · R$ · [chip] [＋ Adicionar]. Teclado não
            fecha no ciclo: as ações da linha usam pointerdown preventDefault
            (padrão provado no C3). ── */}
        <form
          onSubmit={(e) => {
            // C8 — sem o onKeyDown do painel morto, Enter na barra = submit do
            // form: adiciona se reconhecido, senão abre o "cadastrar na hora"
            // (adicionarDaLinhaRapida decide); Enter no Qtd/Valor idem; nunca
            // submete a tela.
            e.preventDefault();
            adicionarDaLinhaRapida();
          }}
          className="relative mt-2 rounded-2xl border border-[#efefef] bg-white p-2.5 shadow-sm"
          aria-label="Linha rápida de compra"
        >
          {/* Linha 1 — nome do item */}
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" aria-hidden="true" />
            <input
              ref={nomeInputRef}
              type="text"
              value={termoNome}
              onChange={(e) => {
                const v = e.target.value;
                setTermoNome(v);
                // editar o texto quebra o reconhecimento — o selInsumo do
                // snapshot U2.2 só sobrevive se o texto ainda for o nome
                // C5 §2 — quebrou o reconhecimento (ou o nome foi esvaziado):
                // a linha 2 volta ao estado limpo (qtd 1, valor VAZIO) — o
                // preço do item anterior nunca fica pendurado no próximo. No
                // C8 é o que faz a barra "recomeçar" quando o fundador edita
                // depois de uma completion; o texto voltando a bater, o efeito
                // C8 re-pré-cheia qtd/valor do item certo.
                if (
                  v.trim() === "" ||
                  (selInsumo && v.trim().toLowerCase() !== selInsumo.nome.trim().toLowerCase())
                ) {
                  setSelInsumo(null);
                  setRapidoQtd("1");
                  setRapidoValor("");
                }
                setErro("");
              }}
              placeholder="O que é? Nome ou SKU (ex.: caixa de uva)"
              aria-label="Nome do item da compra"
              autoComplete="on"
              list="nc-insumo-list"
              enterKeyHint="next"
              className={`${campoFormSheet} pl-9 text-base`}
            />

            {/* C8 — datalist NATIVO no lugar do painel custom (C3/C4/C6-b): o
                browser filtra e completa DENTRO da barra — zero overlay,
                teclado nunca fecha, menos um clique. Opções = nomes do
                catálogo completo dedupe-por-nome (opções repetidas confundem
                o datalist), SEM filtro e SEM slice nossos — quem filtra é o
                BROWSER. SKU não vira option, mas o memo continua reconhecendo
                texto == SKU. Completion aceita → texto == nome exato → memo
                reconhece → efeito C8 abre a linha 2 com qtd=1 + último preço
                DESTE item. Custo consciente: ordenação/visual do dropdown são
                do browser e o chip "no carrinho" saiu da lista — migrou pra
                linha 2 (abaixo do Adicionar). ── */}
            <datalist id="nc-insumo-list">
              {nomesInsumo.map((nome) => (
                <option key={nome} value={nome} />
              ))}
            </datalist>
          </div>


          {/* C8 — o painel custom de candidatos de insumo (skeleton / erro /
              vazio / lista com tap C6-b / CTA cadastrar) MORREU aqui: virou o
              <datalist> nativo acima. loading/erro+retry e o "+ Cadastrar na
              hora" ganharam lugar enxuto na área da linha 2; o chip "N no
              carrinho" migrou pra cima do botão Adicionar. */}

          {/* Linha 2 — só aparece com item RECONHECIDO (WIRE C4 §1; C8: o
              reconhecimento chega pelo texto exato que o datalist entrega na
              barra). Colunas coladas Qtd · Valor · [chip] Adicionar. O
              pré-preenchimento (efeito C8: qtd 1 + último preço DESTE item) é
              o "conferir e adicionar" de sempre. */}
          {insumoReconhecido ? (
            <div className="mt-1.5 grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)_auto] items-end gap-1.5">
              <label className="block">
                <span className="mb-1 block text-[10px] leading-none text-[#627271]" style={{ fontWeight: 600 }}>
                  Qtd ({insumoReconhecido.unidadeCompra?.trim() || insumoReconhecido.unidade}) *
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={rapidoQtd}
                  onChange={(e) => {
                    setRapidoQtd(e.target.value);
                    setErro("");
                  }}
                  placeholder="1"
                  aria-label={`Quantidade em ${insumoReconhecido.unidadeCompra?.trim() || insumoReconhecido.unidade}`}
                  enterKeyHint="done"
                  className={`${campoFormSheet} px-2.5 text-base`}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] leading-none text-[#627271]" style={{ fontWeight: 600 }}>
                  Valor unitário
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={rapidoValor}
                  onChange={(e) => {
                    setRapidoValor(mascararMoeda(e.target.value));
                    setErro("");
                  }}
                  placeholder="R$ 0,00"
                  aria-label="Valor unitário em reais"
                  enterKeyHint="done"
                  className={`${campoFormSheet} px-2.5 text-base`}
                />
              </label>
              {/* C8 — coluna da ação: o chip "N no carrinho" (órfão do painel
                  que morreu) vive AGORA acima do Adicionar, dentro da MESMA
                  coluna — sem estourar a fileira em meia tela. Some quando o
                  item ainda não tem linha no carrinho. */}
              <div className="flex flex-col items-stretch">
                {noCarrinhoRapido > 0 && (
                  <span
                    className="mb-1 inline-flex items-center justify-center gap-1 self-start whitespace-nowrap rounded-full border px-1.5 text-[10px] leading-[16px]"
                    style={{ background: "#F0FDF4", borderColor: "#A7F3D0", color: "#059669", fontWeight: 600 }}
                  >
                    {fmtNum(noCarrinhoRapido)} no carrinho
                  </span>
                )}
                <button
                  type="button"
                  // C4 — o botão que NÃO rouba o foco: pointerdown
                  // preventDefault mantém o teclado aberto durante o ciclo
                  // inteiro (padrão do C3). O clique depois do preventDefault
                  // não re-submete (type=button + submit só via Enter).
                  onPointerDown={(e) => {
                    e.preventDefault();
                    adicionarDaLinhaRapida();
                  }}
                  aria-label={`Adicionar ${insumoReconhecido.nome} ao carrinho`}
                  className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-[#86cb92] px-3 text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white active:bg-[#1f2937] active:text-white"
                  style={{ fontWeight: 700 }}
                >
                  <Plus size={16} />
                  <span className="text-xs">Adicionar</span>
                </button>
              </div>
            </div>
          ) : qInsumo && produtosLoading && produtos.length === 0 ? (
            // C8 — os estados que IMPORTAM migraram do painel morto para a
            // área da linha 2, enxutos: carregando… / erro com retry / o CTA
            // "cadastrar na hora". qInsumo vazio = NADA — linha rápida limpa,
            // só o placeholder guiando.
            <p className="mt-1.5 text-[11px] leading-snug text-[#627271]" role="status">
              Carregando insumos...
            </p>
          ) : qInsumo && produtosError && produtos.length === 0 ? (
            <div className="mt-1.5 flex items-center justify-between gap-2" role="alert">
              <p className="min-w-0 flex-1 truncate text-[11px] text-red-600">Erro ao carregar os insumos: {produtosError}</p>
              <button
                type="button"
                onClick={recarregarProdutos}
                className="flex min-h-[44px] shrink-0 items-center rounded-lg border border-red-200 bg-white px-2.5 text-xs text-red-700 transition-colors hover:bg-red-50"
                style={{ fontWeight: 600 }}
              >
                Tentar novamente
              </button>
            </div>
          ) : qInsumo ? (
            // C8 — texto digitado sem match no catálogo (produtos carregados,
            // sem erro): cadastrar na hora — o MESMO mini-sheet U2.2 de antes,
            // com o termo pré-cheio pela prop `termo`
            <button
              type="button"
              onClick={() => setMiniItemAberto(true)}
              className="mt-1.5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#86cb92] px-3 text-sm text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
              style={{ fontWeight: 600 }}
            >
              <Plus size={15} />
              {`+ Cadastrar “${termoNome.trim().slice(0, 40)}” na hora`}
            </button>
          ) : null}

          {/* Erro VISÍVEL no bloco congelado: nenhuma necessidade de rolar */}
          {erro && (
            <p className="mt-1.5 text-[11px] text-red-600" role="alert" style={{ fontWeight: 500 }}>
              {erro}
            </p>
          )}
        </form>
      </div>

      {/* C5 §1 — a antiga section "1 · Fornecedor" saiu daqui: a escolha do
          fornecedor e a Nota fiscal agora vivem COMPACTAS no bloco congelado,
          ANTES da Linha Rápida. Autocomplete, mini-sheet "+ Novo", estados
          loading/erro/vazio e o link do cadastro completo (que preserva o
          rascunho via sessão) migraram juntos. */}

      {/* ── 2 · Itens da compra — lista única compacta estilo "nota de
          papelaria" (C5 §4 substitui os cards grandes do C1/C4; o bloco 1 —
          Fornecedor — agora mora congelado acima da Linha Rápida) ── */}
      {/* O editor da linha continua AQUI na própria fileira (qtd/valor sempre
          editáveis, excluir no topo da linha) — a linha rápida só cria/soma;
          ajustar fino é nesta lista. A linha pode ficar parcialmente atrás do
          teclado: ela rola livre, e o padding-bottom dinâmico do <main>
          garante rolagem até o fim. */}
      <section className="mb-3 scroll-mt-3" aria-labelledby="nc-itens-label">
        <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
          <BlocoTitulo n={2} id="nc-itens-label" texto="Itens da compra" inline />
          <span className="text-xs text-[#627271]">{formatCurrency(total)}</span>
        </div>

        {itensVazios ? (
          <div className="rounded-2xl border border-dashed border-[#efefef] bg-white/60 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efefef]">
              <ShoppingCart size={20} className="text-[#627271]" />
            </div>
            <p className="text-sm font-semibold text-[#1f2937]">Carrinho vazio</p>
            <p className="mt-1 text-xs text-[#627271]">
              Escreva o item na Linha Rápida acima, confira qtd e preço e toque em{" "}
              &ldquo;+ Adicionar&rdquo; — item por item, igual lista de mercado.
            </p>
          </div>
        ) : (
          // C5 §4 — UMA lista estilo "nota de papelaria": container único,
          // uma linha divide-y por item, editor sempre aberto na própria
          // linha (nada de card grande por produto).
          <div className="divide-y divide-[#efefef] overflow-hidden rounded-2xl border border-[#efefef] bg-white shadow-sm">
            {linhasCalculadas.map(({ linha, qtd, uc, fator, conversionOk, entra, subtotal }) => {
              const unidade = linha.produto.unidade;
              // C2: helper "1 caixa = 500 g" só quando a conversão não é 1:1
              const mostrarHelper = Boolean(uc) && conversionOk && Number.isFinite(fator) && fator !== 1;
              return (
                <div
                  key={linha.chave}
                  // C3: flash de 1x na linha recém-jogada no carrinho (CSS
                  // global nc-flash; desliga em prefers-reduced-motion)
                  className={`px-3 py-2.5${linha.chave === flashChave ? " nc-flash" : ""}`}
                >
                  {/* topo da linha: nome (truncado, 600) + remover 44px à
                      direita */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                      {linha.produto.nome}
                    </p>
                    <button
                      type="button"
                      onClick={() => remover(linha.chave)}
                      aria-label={`Remover ${linha.produto.nome} da compra`}
                      className="-mr-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* fileira de edição — Qtd (unidade de compra) · Valor ·
                      subtotal à direita. Input 16px (sem zoom do iOS) e este
                      input É o editor da linha no carrinho (a linha rápida
                      só cria/soma). C5: o chip de último preço saiu da
                      linha — a informação continua na autocomplete. */}
                  <div className="mt-1.5 grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)_auto] items-end gap-1.5">
                    <label className="block">
                      <span className="mb-1 block text-[10px] leading-none text-[#627271]" style={{ fontWeight: 600 }}>
                        Qtd ({uc || unidade}) *
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={linha.quantidade}
                        onChange={(e) => atualizarLinha(linha.chave, { quantidade: e.target.value })}
                        placeholder="0"
                        aria-label={`Quantidade de ${linha.produto.nome} em ${uc || unidade}`}
                        className={`${campoFormSheet} px-2.5 text-base`}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] leading-none text-[#627271]" style={{ fontWeight: 600 }}>
                        Valor
                      </span>
                      {/* C2: máscara monetária do masks.ts — dígitos viram centavos */}
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={linha.valorUnitario}
                        onChange={(e) => atualizarLinha(linha.chave, { valorUnitario: mascararMoeda(e.target.value) })}
                        placeholder="R$ 0,00"
                        aria-label={`Valor unitário de ${linha.produto.nome} em reais`}
                        className={`${campoFormSheet} px-2.5 text-base`}
                      />
                    </label>
                    <span className="block text-right">
                      <span className="mb-1 block text-[10px] leading-none text-[#627271]" style={{ fontWeight: 600 }}>
                        Subtotal
                      </span>
                      {/* mt-1 + leading 46px = mesma caixa do input → número
                          centrado na altura do campo, alinhado à direita */}
                      <span className="mt-1 block text-sm leading-[46px] text-[#1f2937]" style={{ fontWeight: 700 }}>
                        {formatCurrency(subtotal)}
                      </span>
                    </span>
                  </div>

                  {/* conversão SEMPRE na unidade do produto (C2): fator ≠ 1
                      = texto pequeno "1 caixa = 500 g · +500 g ao estoque";
                      fator faltante = aviso amarelo visível */}
                  {uc ? (
                    conversionOk ? (
                      mostrarHelper && (
                        <p className="mt-1 text-[11px] leading-snug text-[#627271]">
                          1 {uc} = {fmtNum(fator)} {unidade}
                          {qtd > 0 ? ` · +${fmtNum(entra)} ${unidade} ao estoque` : ""}
                        </p>
                      )
                    ) : (
                      <p
                        className="mt-1 inline-block rounded-md border px-1.5 py-0.5 text-[11px]"
                        style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309", fontWeight: 600 }}
                      >
                        sem fator de conversão — corrija o cadastro
                      </p>
                    )
                  ) : null}
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

      {/* C4 — O rodapé sticky "Salvar compra" NÃO existe mais (WIRE §4): era
          ele que brigava com o teclado e roubava altura da lista. Total/contador
          vivem na sublinha do header (sempre visível, congelada) e Salvar virou
          pill no header — habilitado só com ≥1 item e escondido enquanto o
          teclado está aberto. O erro também migrou para o bloco congelado. */}

      {/* ── Mini-sheet "Cadastrar item na hora" (natureza FORÇADA: insumo) ── */}
      {miniItemAberto && (
        <MiniSheetNovoItem
          termo={termoNome}
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

/**
 * Título numerado do bloco rolável (C5: o bloco 1 — Fornecedor — vive
 * congelado no topo, sem título numerado; a lista de itens é o bloco 2).
 */
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