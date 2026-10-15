/**
 * Aba "Produção" do ProdutoDetalhePage — Produção Fase 3 (WIRE §2).
 *
 * Só para `natureza === 'composto'`: a condição fica no PARENT (a aba não é
 * montada para simples/insumo); aqui todos os hooks vivem no topo, sem
 * condicional. Custos/estoques saem do mapa `useProdutos()` (o mesmo `preco_custo`
 * que a Fase 2 mantém via custo médio ponderado); a escrita é exclusivamente a
 * RPC `registrar_producao` (`use-registrar-producao.ts`) — nada de inventar API.
 *
 * Padrões copiados: resumo/linhas do F1, modal idêntico ao "Receber compra"
 * da ComprasPage (BottomSheet + SheetActions), modal FORA de gate de loading,
 * estados loading/empty/error+retry, formatCurrency do produto-utils, PT-BR.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Factory,
  History,
  Loader2,
  RefreshCw,
  ShoppingCart,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency, formatarQtd, toReceita } from "../../lib/produto-utils";
import { receitasMaximas } from "../../lib/conversao";
import { useFichaTecnica } from "../../hooks/use-ficha-tecnica";
import { useProdutos } from "../../hooks/use-produtos";
import { useOrdensProducao } from "../../hooks/use-ordens-producao";
import { useRegistrarProducao } from "../../hooks/use-registrar-producao";
import { useCompras } from "../../hooks/use-compras";
import type { RegistrarProducaoParams, RegistrarProducaoResult } from "../../hooks/use-registrar-producao";
import type { Produto } from "../../types/produto";
import type { Compra, ItemFichaTecnica } from "../../types/producao";
import { CardMaxProduzir } from "./CardMaxProduzir";
import { FaixaProximoPasso } from "./FaixaProximoPasso";
import {
  BottomSheet,
  campoFormSheet,
  SheetActions,
  sheetButtonPrimario,
  sheetButtonSecundario,
  hojeLocal,
} from "../financeiro/components";

/* ───────────────────── helpers de exibição (paleta do módulo) ───────────────────── */

/** `2400 → "2.400"`, `9.6 → "9,6"` — quantidade com até 3 decimais. */
function fmtNum(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

/** Custo unitário fino (R$ 0,057/g) — até 3 casas; `formatCurrency` fica p/ totais. */
function fmtCustoUnitario(n: number): string {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
}

/** Custo por grama do modo receita (R$ 0,0197/g — WIRE §2) — até 4 casas. */
function fmtCustoFino(n: number): string {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

/** `data_producao` (timestamptz ISO) → dd/MM/yy local. */
function dataProducaoBR(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : format(d, "dd/MM/yy");
}

/** Linha de consumo calculada sobre a ficha + mapa de produtos (custo/estoque reais). */
interface LinhaProducao {
  item: ItemFichaTecnica;
  nome: string;
  unidade: string;
  /** consumo POR 1 unidade produzida, com perda (unidade de estoque) */
  consumoPorUnidade: number;
  custoMedio: number;
  /** insumo sem custo médio (preco_custo 0/null) → "custo pendente de compra" */
  custoPendente: boolean;
  /**
   * D5 (Modo Receita): o COMPONENTE é composto (natureza do embed da ficha, com
   * fallback para o mapa de produtos) → pendência é "de produção", não "de compra".
   */
  pendenteProducao: boolean;
  estoqueAtual: number;
}

function calcularLinha(item: ItemFichaTecnica, insumo?: Produto): LinhaProducao {
  const custoMedio = insumo?.precoCusto ?? 0;
  return {
    item,
    nome: insumo?.nome || item.componenteNome,
    unidade: item.componenteUnidade,
    consumoPorUnidade: item.quantidadePorUnidade * (1 + item.perdaPct / 100),
    custoMedio,
    custoPendente: !(custoMedio > 0),
    pendenteProducao: (item.componenteNatureza ?? insumo?.natureza) === "composto",
    // insumo fora do `useProdutos` (ex.: inativo) → estoque desconhecido = 0:
    // a pré-visualização bloqueia e a RPC é a guarda final.
    estoqueAtual: insumo?.estoque ?? 0,
  };
}

/**
 * Copy transversal WIRE item 7 / D8: composto → "pendente de produção";
 * insumo → "pendente de compra". O prefixo "custo" é acrescentado só no
 * contexto de custo (nunca "custo/un: pendente" fora dele).
 */
function textoPendencia(linha: Pick<LinhaProducao, "pendenteProducao">): string {
  return linha.pendenteProducao ? "pendente de produção" : "pendente de compra";
}

/* ─────────────────────────────────── aba ─────────────────────────────────── */

export interface ProducaoTabProps {
  produto: Produto;
  /** refetch da página (estoque/custo do pai mudaram após a OP) */
  onSuccess: () => void;
}

export function ProducaoTab({ produto, onSuccess }: ProducaoTabProps) {
  const navigate = useNavigate();
  // Hooks no topo, incondicionais — a aba só monta para composto (parent decide).
  const {
    itens: fichaItens,
    loading: fichaLoading,
    error: fichaError,
    recarregar: recarregarFicha,
  } = useFichaTecnica(produto.id);
  const { produtos, recarregar: recarregarProdutos } = useProdutos();
  const {
    ordens,
    loading: ordensLoading,
    error: ordensError,
    recarregar: recarregarOrdens,
  } = useOrdensProducao(produto.id);
  const { registrarProducao, loading: produzindo } = useRegistrarProducao();
  // T5/F5: compras PENDENTE cruzadas com o insumo-limite — leitura do hook
  // existente invocada aqui dentro (o hook não é editado).
  const { compras } = useCompras();

  const [modalAberta, setModalAberta] = useState(false);
  // T6-5: banda pós-produção — sonda os compostos que consomem este produto.
  const [produzidoRecente, setProduzidoRecente] = useState(false);
  const [proximoComposto, setProximoComposto] = useState<Produto | null>(null);

  const produtosPorId = useMemo(() => new Map(produtos.map((p) => [p.id, p])), [produtos]);

  const comprasPendentes = useMemo(
    () => compras.filter((c) => c.status === "PENDENTE"),
    [compras]
  );

  // Mapas do card T5 (e do chip máx do modal): estoque/custo por id de produto.
  const estoquesPorId = useMemo(
    () => Object.fromEntries(produtos.map((p) => [p.id, p.estoque])),
    [produtos]
  );
  const custosPorId = useMemo(
    () => Object.fromEntries(produtos.map((p) => [p.id, p.precoCusto])),
    [produtos]
  );

  const linhas = useMemo(
    () => fichaItens.map((item) => calcularLinha(item, produtosPorId.get(item.componenteProdutoId))),
    [fichaItens, produtosPorId]
  );

  const custoPorUnidade = linhas.reduce((s, l) => s + l.consumoPorUnidade * l.custoMedio, 0);
  const temCustoPendente = linhas.some((l) => l.custoPendente);
  // D5 (Modo Receita): pendência de insumo é "de compra"; de componente composto, "de produção"
  const pendentesCompra = linhas.filter((l) => l.custoPendente && !l.pendenteProducao);
  const pendentesProducao = linhas.filter((l) => l.custoPendente && l.pendenteProducao);
  const semFicha = !fichaLoading && !fichaError && linhas.length === 0;

  const ultimaOrdem = ordens[0] || null;

  // ── Modo Receita (SPEC-Producao-ModoReceita §3): `rendimento_lote` preenchido
  // troca a EXIBIÇÃO para por-receita. NULL = tudo como hoje, intocado.
  const rendimento = produto.rendimentoLote ?? 0;
  const modoReceita = rendimento > 0;
  const unidadePai = produto.unidade || "un";
  const custoPorReceita = custoPorUnidade * rendimento;

  // T6-5: candidatos a "próximo composto" = compostos cuja ficha consome este
  // produto. A sonda usa `useFichaTecnica(candidato)` — hook existente, nenhuma
  // query nova (WIRE §9). Corte pequeno para limitar as leituras paralelas.
  const candidatosNivel2 = useMemo(
    () =>
      produzidoRecente
        ? produtos.filter((p) => p.natureza === "composto" && p.id !== produto.id).slice(0, 8)
        : [],
    [produzidoRecente, produtos, produto.id]
  );
  const registrarCompostoAchado = useCallback(
    (c: Produto) => setProximoComposto((prev) => prev ?? c),
    []
  );

  return (
    <div className="space-y-5">
      {/* ── T5: "COM O ESTOQUE ATUAL" — primeira linha da aba (WIRE §4 T5/Desktop) ── */}
      {fichaLoading ? (
        <div className="h-28 rounded-2xl border border-[#efefef] bg-[#efefef]/60 animate-pulse" />
      ) : fichaError || linhas.length === 0 ? null : (
        <CardMaxProduzir
          produto={produto}
          itensFicha={fichaItens}
          estoques={estoquesPorId}
          precosCusto={custosPorId}
          comprasPendentes={comprasPendentes}
        />
      )}

      {/* ── T6-5: banda pós-produção — "Agora dá pra montar: {composto}" ── */}
      {candidatosNivel2.map((c) => (
        <SondaFichaComposto
          key={c.id}
          composto={c}
          paiId={produto.id}
          onAchou={registrarCompostoAchado}
        />
      ))}
      {proximoComposto ? (
        <FaixaProximoPasso
          titulo={`Agora dá pra montar: ${proximoComposto.nome}`}
          acoes={[
            {
              label: "produzir →",
              href: `/estoque/produtos/${proximoComposto.id}?aba=producao`,
            },
          ]}
          onClose={() => {
            setProximoComposto(null);
            setProduzidoRecente(false);
          }}
        />
      ) : null}

      {/* ── Cabeçalho: custo por unidade + ação ── */}
      <section className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
              {modoReceita ? "Custo por receita" : "Custo por unidade produzida"}
            </h3>
            <p className="text-[#627271] text-xs mt-0.5">
              Apurado a partir da ficha técnica · custos médios atuais dos insumos
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalAberta(true)}
            disabled={linhas.length === 0 || fichaLoading}
            title={linhas.length === 0 ? "Monte a ficha técnica primeiro" : undefined}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white disabled:opacity-50 disabled:hover:bg-[#86cb92] disabled:hover:text-[#1f2937]"
          >
            <Factory size={15} />
            Produzir lote
          </button>
        </div>

        {/* Card de destaque do custo */}
        {fichaLoading ? (
          <div className="mt-4 h-20 w-56 max-w-full animate-pulse rounded-xl bg-[#efefef]" />
        ) : linhas.length === 0 ? null : (
          <div className="mt-4 inline-flex flex-col rounded-xl border border-[#efefef] bg-[#efefef]/40 px-5 py-4">
            <p className="text-[#1f2937]" style={{ fontWeight: 800, fontSize: 24 }} role="status">
              {(modoReceita ? custoPorReceita : custoPorUnidade) > 0 ? (
                <>
                  {formatCurrency(modoReceita ? custoPorReceita : custoPorUnidade)}{" "}
                  <span className="text-sm" style={{ fontWeight: 500 }}>
                    / {modoReceita ? "receita" : unidadePai}
                  </span>
                </>
              ) : temCustoPendente ? (
                /* WIRE T5/D8: "custo/un: pendente" só no contexto certo — composto
                   é "de produção"; insumo é "de compra". Nunca "—"+adivinhação. */
                <>
                  pendente{" "}
                  <span className="text-sm" style={{ fontWeight: 500 }}>
                    {pendentesCompra.length > 0
                      ? "de compra"
                      : "de produção · nasce quando o 1º lote for produzido"}
                  </span>
                </>
              ) : (
                "—"
              )}
            </p>
            <p className="mt-0.5 text-[11px] text-[#627271]">
              {modoReceita && `Custo por ${unidadePai}: ${custoPorUnidade > 0 ? fmtCustoFino(custoPorUnidade) : "—"} · `}
              {ultimaOrdem
                ? `${fmtNum(ultimaOrdem.quantidade)} no último lote (${dataProducaoBR(ultimaOrdem.dataProducao)})`
                : `${linhas.length} insumo${linhas.length === 1 ? "" : "s"} na ficha`}
            </p>
          </div>
        )}

        {temCustoPendente &&
          (() => {
            // Copy WIRE item 7 / D5: compra = insumo; produção = componente composto.
            const mensagem =
              pendentesCompra.length > 0 && pendentesProducao.length > 0
                ? "Custo pendente de compra (insumos) e de produção (compostos) — o custo do lote fica subestimado até resolver"
                : pendentesProducao.length > 0
                  ? "Custo pendente de produção — o custo do lote fica subestimado até o 1º lote do componente"
                  : "Custo pendente de compra — o custo do lote fica subestimado até a primeira compra";
            const estiloAlerta = { background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309" };
            // Só vira atalho para Compras quando existe pendência de compra;
            // pendência exclusiva de produção não aponta para lugar errado.
            return pendentesCompra.length > 0 ? (
              <button
                type="button"
                onClick={() => navigate("/estoque/compras")}
                className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-[#FFFBEB]"
                style={estiloAlerta}
              >
                <span className="flex items-center gap-2 text-xs" style={{ fontWeight: 600 }}>
                  <AlertTriangle size={14} className="shrink-0" />
                  {mensagem}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#FDE68A] bg-white px-2.5 py-1.5 text-[11px]" style={{ color: "#B45309", fontWeight: 600 }}>
                  <ShoppingCart size={12} />
                  Nas compras
                </span>
              </button>
            ) : (
              <div
                className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left"
                style={estiloAlerta}
              >
                <span className="flex items-center gap-2 text-xs" style={{ fontWeight: 600 }}>
                  <AlertTriangle size={14} className="shrink-0" />
                  {mensagem}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#FDE68A] bg-white px-2.5 py-1.5 text-[11px]" style={{ color: "#B45309", fontWeight: 600 }}>
                  <Factory size={12} />
                  Na produção
                </span>
              </div>
            );
          })()}
      </section>

      {/* ── Consumo por 1 unidade ── */}
      {fichaError ? (
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
          <AlertTriangle size={28} className="text-red-500 mx-auto mb-3" />
          <h3 className="text-[#1f2937] mb-1" style={{ fontWeight: 600 }}>
            Não foi possível carregar a ficha técnica
          </h3>
          <p className="text-[#627271] text-sm mb-5">{fichaError}</p>
          <button
            type="button"
            onClick={recarregarFicha}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[#1f2937] text-sm"
            style={{ background: "#86cb92", fontWeight: 600 }}
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      ) : semFicha ? (
        <div className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-10 text-center">
          <ClipboardList size={28} className="text-[#627271] mx-auto mb-3" />
          <h3 className="text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>
            Nenhum componente na ficha
          </h3>
          <p className="text-[#627271] text-sm">
            Monte a ficha técnica na aba "Ficha Técnica" para calcular o custo e produzir.
          </p>
        </div>
      ) : (
        <section className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
          <div className="border-b border-[#efefef] px-5 py-3">
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
              {modoReceita ? `Receita · rende ~${formatarQtd(rendimento)} ${unidadePai}` : "Consumo de insumos por 1 un"}
            </h3>
            <p className="text-[#627271] text-xs">
              Custos médios atuais · perda incluída
            </p>
          </div>

          {fichaLoading ? (
            <div className="space-y-2 p-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-[#efefef] animate-pulse" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-[#efefef]">
              {linhas.map((l) => {
                // Modo receita: linha mostra a quantidade POR RECEITA (base, sem perda —
                // a perda vai como informação própria, como no WIRE §2) e o total da
                // linha é por receita; NULL mode: cálculo original por unidade, intocado.
                const qtdExibida = modoReceita
                  ? formatarQtd(toReceita(l.item.quantidadePorUnidade, rendimento))
                  : fmtNum(l.consumoPorUnidade);
                const sufixoExibicao = modoReceita ? "por receita" : "por un";
                const linhaTotal = l.consumoPorUnidade * l.custoMedio * (modoReceita ? rendimento : 1);
                return (
                  <li key={l.item.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                        {l.nome}
                      </p>
                      <p className="text-[11px] text-[#627271]">
                        {qtdExibida} {l.unidade} {sufixoExibicao}
                        {modoReceita ? ` · perda ${fmtNum(l.item.perdaPct)}%` : ""}
                        {" · "}
                        est: {fmtNum(l.estoqueAtual)} {l.unidade}
                      </p>
                    </div>

                    {l.custoPendente ? (
                      /* Pendência de COMPRA atalha para Compras; de PRODUÇÃO é só status
                         (levar o usuário pra comprar um composto seria botão mentiroso). */
                      <button
                        type="button"
                        onClick={l.pendenteProducao ? undefined : () => navigate("/estoque/compras")}
                        className="shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors hover:bg-[#FFFBEB]"
                        style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309", fontWeight: 600 }}
                        role="status"
                        title={`custo ${textoPendencia(l)} — ${l.pendenteProducao ? "produza este componente para apurar o custo" : "ver Compras"}`}
                      >
                        <AlertTriangle size={11} />
                        custo {textoPendencia(l)}
                      </button>
                    ) : (
                      <div className="shrink-0 flex items-center gap-2.5">
                        <span className="text-[11px] text-[#627271]">
                          × {fmtCustoUnitario(l.custoMedio)}/{l.unidade}
                        </span>
                        <span className="text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
                          = {formatCurrency(linhaTotal)}
                          {modoReceita ? (
                            <span className="text-[11px]" style={{ fontWeight: 500 }}> /receita</span>
                          ) : null}
                        </span>
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full"
                          style={{ background: "#86cb92", color: "#1f2937" }}
                          aria-label="Custo disponível"
                          role="status"
                        >
                          <Check size={13} />
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* ── Histórico de ordens ── */}
      <section className="bg-white rounded-2xl border border-[#efefef] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#efefef] px-5 py-3">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
              <History size={13} className="mr-1.5 inline-block align-[-2px]" />
              Histórico de produção
            </h3>
            <p className="text-[#627271] text-xs">
              {ordens.length > 0
                ? `${ordens.length} ordem${ordens.length === 1 ? "" : "es"} registrada${ordens.length === 1 ? "" : "s"}`
                : "Lotes já produzidos deste item"}
            </p>
          </div>
        </div>

        {ordensLoading && ordens.length === 0 ? (
          <div className="space-y-2 p-5">
            {[0, 1].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-[#efefef] animate-pulse" />
            ))}
          </div>
        ) : ordensError ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
            <p className="text-sm text-red-600">{ordensError}</p>
            <button
              type="button"
              onClick={recarregarOrdens}
              className="inline-flex items-center gap-2 rounded-xl border border-[#efefef] px-3 py-2 text-xs text-[#1f2937] transition-colors hover:bg-[#efefef]"
              style={{ fontWeight: 600 }}
            >
              <RefreshCw size={13} />
              Tentar novamente
            </button>
          </div>
        ) : ordens.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#627271]">
              {modoReceita
                ? "Nenhuma produção ainda — produza a primeira vez para apurar o custo."
                : "Nenhuma produção ainda — gere o primeiro lote."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#efefef]">
            {ordens.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm">
                <span className="text-[#627271] text-xs w-16 shrink-0">{dataProducaoBR(o.dataProducao)}</span>
                <span className="text-[#1f2937]" style={{ fontWeight: 600 }}>
                  lote {fmtNum(o.quantidade)} un
                </span>
                <span className="ml-auto text-[#1f2937]" style={{ fontWeight: 700 }}>
                  {formatCurrency(o.custoTotal)}
                </span>
                <span className="text-[11px] text-[#627271] shrink-0">
                  ({formatCurrency(o.custoUnit)}/un)
                </span>
                {o.observacao && (
                  <span className="w-full text-[11px] text-[#627271]">{o.observacao}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Modal "Produzir lote" — FORA de qualquer gate de loading ── */}
      <ProduzirLoteModal
        aberta={modalAberta}
        onClose={() => setModalAberta(false)}
        produto={produto}
        linhas={linhas}
        rendimento={modoReceita ? rendimento : null}
        comprasPendentes={comprasPendentes}
        onEstoqueMudou={recarregarProdutos}
        registrarProducao={registrarProducao}
        salvando={produzindo}
        onSucesso={() => {
          // estoque/custo mudaram em TUDO: insumos (produtos), pai (produto),
          // histórico (ordens) e a ficha segue igual — recarrega por segurança.
          recarregarProdutos();
          recarregarOrdens();
          recarregarFicha();
          onSuccess();
          // T6-5: dispara a sonda de próximo nível (Cone consome Recheio etc.)
          setProduzidoRecente(true);
        }}
      />
    </div>
  );
}

/* ─────────────── sonda T6-5 (leitura via hook existente) ───────────────
   Um sub-componente por candidato: lê a ficha do composto com o MESMO
   `useFichaTecnica` da aba (nenhuma query nova, WIRE §9) e avisa o pai se a
   ficha consome o produto que acabou de ser produzido. Render nulo. */

function SondaFichaComposto({
  composto,
  paiId,
  onAchou,
}: {
  composto: Produto;
  paiId: string;
  onAchou: (composto: Produto) => void;
}) {
  const { itens, loading } = useFichaTecnica(composto.id);
  const consome = !loading && itens.some((i) => i.componenteProdutoId === paiId);
  useEffect(() => {
    if (consome) onAchou(composto);
  }, [consome, composto, onAchou]);
  return null;
}

/* ─────────────────────── Modal "Produzir lote" ───────────────────────
   Fundação idêntica ao "Receber compra" da ComprasPage: BottomSheet com
   estado interno criado a cada abertura (key implícita — o sheet desmonta
   quando fecha), pré-visualização com semáforo e botão bloqueado quando
   qualquer insumo é insuficiente. */

interface ProduzirLoteModalProps {
  aberta: boolean;
  onClose: () => void;
  produto: Produto;
  linhas: LinhaProducao[];
  /**
   * Modo Receita (SPEC §4): `> 0` ativa o toggle `receita × unidade` e o default
   * 1 receita; `null` = modal de hoje (por unidade), intocado. A conversão é do
   * front — a RPC `registrar_producao` continua recebendo a unidade do produto.
   */
  rendimento: number | null;
  /** T5/T6: PENDENTE cruzada com o insumo faltante → CTA "Receber compra X…" */
  comprasPendentes: Compra[];
  /** Recusa de saldo pela RPC: o estoque do banco mudou — revalida as linhas */
  onEstoqueMudou: () => void;
  registrarProducao: (p: RegistrarProducaoParams) => Promise<RegistrarProducaoResult>;
  salvando: boolean;
  onSucesso: () => void;
}

function ProduzirLoteModal({
  aberta,
  onClose,
  produto,
  linhas,
  rendimento,
  comprasPendentes,
  onEstoqueMudou,
  registrarProducao,
  salvando,
  onSucesso,
}: ProduzirLoteModalProps) {
  const navigate = useNavigate();
  const [lote, setLote] = useState("1");
  const [data, setData] = useState(hojeLocal());
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");
  // T6-4: recusa da RPC por saldo → banda NÃO ALCANÇA (nunca texto cru do banco)
  const [recusaSaldo, setRecusaSaldo] = useState(false);

  // Toggle de unidade do lote (SPEC §4): default 1 receita quando há rendimento.
  // O sheet desmonta ao fechar (padrão Receber compra) → o estado reseta a cada abertura.
  const rend = rendimento ?? 0;
  const temToggle = rend > 0;
  const [modo, setModo] = useState<"receita" | "unidade">(temToggle ? "receita" : "unidade");

  const loteNum = parseFloat(lote) || 0;
  // Conversão SEMPRE no front: em modo receita o lote vale `qtd × rendimento` unidades.
  const emReceita = temToggle && modo === "receita";
  const qtdFinal = emReceita ? loteNum * rend : loteNum;

  const prev = linhas.map((l) => {
    const consumo = l.consumoPorUnidade * qtdFinal;
    return {
      linha: l,
      consumo,
      suficiente: consumo <= l.estoqueAtual,
      linhaTotal: consumo * l.custoMedio,
    };
  });

  const custoLote = prev.reduce((s, p) => s + p.linhaTotal, 0);
  const custoUnitLote = qtdFinal > 0 ? custoLote / qtdFinal : 0;
  const insuficientes = prev.filter((p) => qtdFinal > 0 && !p.suficiente);
  const bloqueado = qtdFinal <= 0 || insuficientes.length > 0 || prev.length === 0;

  /* ── T6-1: máximo produzível — MESMA aritmética do card T5 (D6: espelhos) ──
     necessário por linha já embute a perda (`consumoPorUnidade`); no modo
     receita multiplica por `rend`. Modo grama: máx g = N receitas × rende. */
  const estoquesDoLote: Record<string, number> = {};
  linhas.forEach((l) => {
    estoquesDoLote[l.item.componenteProdutoId] = l.estoqueAtual;
  });
  const { max: maxPorUn } = receitasMaximas(
    linhas.map((l) => ({
      componenteId: l.item.componenteProdutoId,
      necessario: l.consumoPorUnidade,
    })),
    estoquesDoLote
  );
  const maxReceitas =
    rend > 0
      ? receitasMaximas(
          linhas.map((l) => ({
            componenteId: l.item.componenteProdutoId,
            necessario: l.consumoPorUnidade * rend,
          })),
          estoquesDoLote
        ).max
      : maxPorUn;
  const maxNoModo = emReceita ? maxReceitas : temToggle ? maxReceitas * rend : maxPorUn;
  const usarMaximo = () => {
    if (!(maxNoModo >= 1)) return;
    setLote(String(maxNoModo));
    setErro("");
    setRecusaSaldo(false);
  };

  // T5/T6 (F5): compra PENDENTE que cobre algum faltante → CTA "Receber …"
  const compraCobreFaltante = comprasPendentes.find((c) =>
    c.itens.some((it) =>
      insuficientes.some((p) => p.linha.item.componenteProdutoId === it.produtoId)
    )
  );

  const produzir = async () => {
    setErro("");
    if (loteNum <= 0) {
      setErro("Informe a quantidade do lote — precisa ser maior que zero.");
      return;
    }
    if (!data) {
      setErro("Informe a data da produção.");
      return;
    }
    if (prev.length === 0) {
      setErro("Monte a ficha técnica antes de produzir.");
      return;
    }

    const r = await registrarProducao({
      produtoPaiId: produto.id,
      // RPC intocada (D3): recebe a quantidade NA UNIDADE DO PRODUTO (g/ml)
      quantidade: qtdFinal,
      data,
      observacao: observacao.trim() || undefined,
    });

    if (r.success) {
      toast.success(
        `Produção registrada: +${fmtNum(qtdFinal)} ${produto.unidade || "un"}${
          emReceita ? ` (${fmtNum(loteNum)} receita${loteNum === 1 ? "" : "s"})` : ""
        } · custo ${formatCurrency(r.custoUnit ?? 0)}/un · insumos baixados`
      );
      onSucesso();
      onClose();
    } else if (/estoque insuficiente|insufficient stock|saldo/i.test(r.error || "")) {
      // T6-4: rede de segurança do banco recusou por saldo — a banda NÃO
      // ALCANÇA (com CTAs) assume; o texto cru do banco nunca aparece.
      setRecusaSaldo(true);
      setErro("");
      // revalida estoques: o máx do chip passa a refletir o saldo real
      onEstoqueMudou();
    } else {
      setErro(r.error || "Não foi possível registrar a produção.");
    }
  };

  return (
    <BottomSheet open={aberta} onClose={salvando ? () => undefined : onClose} labelledBy="produzir-lote-titulo">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="produzir-lote-titulo" className="text-lg font-semibold text-[#1f2937]">
            Produzir lote — {produto.nome}
          </h2>
          <p className="mt-0.5 text-xs text-[#627271]">
            Baixa os insumos da ficha e dá entrada no acabado com custo apurado.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={salvando}
          aria-label="Fechar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937] disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Modo Receita (SPEC §4): toggle receita × unidade — WIRE [1 receita | 695 g] */}
        {temToggle && (
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Unidade do lote">
            <button
              type="button"
              aria-pressed={modo === "receita"}
              onClick={() => setModo("receita")}
              className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border text-sm transition-all"
              style={{
                background: modo === "receita" ? "#efefef" : "transparent",
                borderColor: modo === "receita" ? "#86cb92" : "#efefef",
                color: modo === "receita" ? "#1f2937" : "#627271",
                fontWeight: modo === "receita" ? 700 : 400,
              }}
            >
              1 receita
            </button>
            <button
              type="button"
              aria-pressed={modo === "unidade"}
              onClick={() => setModo("unidade")}
              className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border text-sm transition-all"
              style={{
                background: modo === "unidade" ? "#efefef" : "transparent",
                borderColor: modo === "unidade" ? "#86cb92" : "#efefef",
                color: modo === "unidade" ? "#1f2937" : "#627271",
                fontWeight: modo === "unidade" ? 700 : 400,
              }}
            >
              {formatarQtd(rend)} {produto.unidade || "un"}
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#1f2937]">
              {emReceita
                ? "Quantas receitas? *"
                : temToggle
                  ? `Quantos ${produto.unidade || "un"}? *`
                  : "Quantidade (unidades) *"}
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={lote}
                onChange={(e) => {
                  setLote(e.target.value);
                  setErro("");
                  setRecusaSaldo(false);
                }}
                placeholder="1"
                className={`${campoFormSheet} text-base`}
              />
              {temToggle && (
                <span className="mt-1 block text-[11px] text-[#627271]" style={{ fontWeight: 400 }}>
                  1 receita ≈ {formatarQtd(rend)} {produto.unidade || "un"}
                  {loteNum > 0 ? ` · lote = ${formatarQtd(qtdFinal)} ${produto.unidade || "un"}` : ""}
                </span>
              )}
            </label>

            {/* T6-1: chip `máx: N` (com perda, mesmo card T5) + [Usar máximo] */}
            {prev.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span
                  role="status"
                  aria-label={`Máximo produzível com o estoque atual: ${fmtNum(maxNoModo)}${emReceita ? " receitas" : ` ${produto.unidade || "un"}`} (com perda)`}
                  className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px]"
                  style={{
                    background: maxNoModo < 1 ? "#FECACA" : "#FFFBEB",
                    borderColor: maxNoModo < 1 ? "#FECACA" : "#FDE68A",
                    color: maxNoModo < 1 ? "#B91C1C" : "#B45309",
                    fontWeight: 700,
                  }}
                >
                  {`máx: ${formatarQtd(maxNoModo)}${emReceita ? "" : ` ${produto.unidade || "un"}`}`}
                </span>
                {maxNoModo >= 1 && (
                  <button
                    type="button"
                    onClick={usarMaximo}
                    disabled={salvando}
                    className="inline-flex min-h-[32px] items-center rounded-md border border-[#efefef] bg-white px-2 py-1 text-[11px] text-[#1f2937] transition-colors hover:bg-[#efefef] disabled:opacity-50"
                    style={{ fontWeight: 600 }}
                  >
                    Usar máximo
                  </button>
                )}
              </div>
            )}
          </div>
          <label className="block text-sm font-medium text-[#1f2937]">
            Data *
            <input
              type="date"
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                setErro("");
              }}
              className={campoFormSheet}
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-[#1f2937]">
          Observação (opcional)
          <textarea
            rows={2}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex.: turno da manhã, Forninho elétrico"
            className={`${campoFormSheet} resize-none`}
          />
        </label>

        <section>
          <p className="mb-2 text-xs text-[#627271]" style={{ fontWeight: 600 }}>
            VAI CONSUMIR
          </p>
          <ul className="divide-y divide-[#efefef] rounded-xl border border-[#efefef]">
            {prev.map((p) => (
              <li key={p.linha.item.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                    {p.linha.nome}
                  </p>
                  <p className="text-[11px] text-[#627271]">
                    {p.linha.custoPendente
                      ? `custo ${textoPendencia(p.linha)}`
                      : `= ${formatCurrency(p.linhaTotal)}`}
                  </p>
                  {/* T6-2: a conta da perda, sem jargão — "(395 g + 5% perda)" */}
                  {p.linha.item.perdaPct > 0 && qtdFinal > 0 && (
                    <p className="text-[11px] text-[#627271]">
                      ({fmtNum(p.linha.item.quantidadePorUnidade * qtdFinal)} {p.linha.unidade} +{" "}
                      {fmtNum(p.linha.item.perdaPct)}% perda)
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
                    {fmtNum(p.consumo)} {p.linha.unidade}
                  </p>
                  {/* T6-2: linha ✗ explicita o por-quê (F4): necessário de estoque + falta */}
                  <p
                    className="text-[11px]"
                    style={{ color: p.suficiente ? "#627271" : "#B91C1C", fontWeight: p.suficiente ? 400 : 600 }}
                  >
                    de {fmtNum(p.linha.estoqueAtual)} {p.linha.unidade}
                    {!p.suficiente ? ` · falta ${fmtNum(p.consumo - p.linha.estoqueAtual)}` : ""}
                  </p>
                </div>
                {p.suficiente ? (
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "#86cb92", color: "#1f2937" }}
                    aria-label="Estoque suficiente"
                    role="status"
                  >
                    <Check size={13} />
                  </span>
                ) : (
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
                    style={{ background: "#FECACA", borderColor: "#FECACA", color: "#B91C1C" }}
                    aria-label="Estoque insuficiente"
                    role="status"
                  >
                    <XCircle size={13} />
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* ── T6-3/T6-4: banda NÃO ALCANÇA — o bloqueio sempre termina em botão,
              nunca em erro sem caminho (inclusive recusa de saldo pela RPC). ── */}
          {(insuficientes.length > 0 || recusaSaldo) &&
            (() => {
              const faltanteComposto = insuficientes.find((p) => p.linha.pendenteProducao)?.linha;
              const faltanteInsumo = insuficientes.find((p) => !p.linha.pendenteProducao)?.linha;
              const singular = emReceita && loteNum === 1;
              const prefixo = emReceita
                ? `${formatarQtd(loteNum)} receita${singular ? "" : "s"}`
                : `o lote (${formatarQtd(qtdFinal)} ${produto.unidade || "un"})`;
              const verbo = singular || !emReceita ? "pede" : "pedem";
              const ctaCls =
                "inline-flex min-h-[40px] items-center rounded-lg border px-3 py-1.5 text-[11px] transition-colors hover:bg-white/60 disabled:opacity-50";
              return (
                <div
                  className="mt-2 rounded-xl border px-3.5 py-3"
                  role="alert"
                  style={{ background: "#FECACA", borderColor: "#FECACA", color: "#B91C1C" }}
                >
                  <p className="text-[11px] uppercase tracking-wide" style={{ fontWeight: 800 }}>
                    <AlertTriangle size={12} className="mr-1 inline-block align-[-2px]" />
                    Não alcança
                  </p>
                  {insuficientes.length > 0 ? (
                    insuficientes.map((p) => (
                      <p key={p.linha.item.id} className="mt-1 text-xs" style={{ fontWeight: 600 }}>
                        {prefixo} {verbo} {fmtNum(p.consumo)} {p.linha.unidade}; estoque tem{" "}
                        {fmtNum(p.linha.estoqueAtual)} {p.linha.unidade}.
                      </p>
                    ))
                  ) : (
                    /* T6-4: o banco recusou por saldo e a pré-visualização ainda
                       acha suficiente — saldo mudou depois da abertura. */
                    <p className="mt-1 text-xs" style={{ fontWeight: 600 }}>
                      O saldo no sistema não cobre este lote — nada foi baixado. Ajuste para o
                      máximo ou reabasteça.
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {maxNoModo >= 1 && (
                      <button
                        type="button"
                        onClick={usarMaximo}
                        disabled={salvando}
                        className={ctaCls}
                        style={{ background: "#ffffff", borderColor: "#FECACA", color: "#B91C1C", fontWeight: 700 }}
                      >
                        {`Usar máximo (${formatarQtd(maxNoModo)})`}
                      </button>
                    )}
                    {compraCobreFaltante && (
                      <button
                        type="button"
                        onClick={() => navigate(`/estoque/compras?receber=${compraCobreFaltante.id}`)}
                        className={ctaCls}
                        style={{ background: "#ffffff", borderColor: "#FECACA", color: "#B91C1C", fontWeight: 700 }}
                      >
                        {`Receber compra ${compraCobreFaltante.fornecedorNome}…`}
                      </button>
                    )}
                    {faltanteComposto ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/estoque/produtos/${faltanteComposto.item.componenteProdutoId}?aba=producao`)
                        }
                        className={ctaCls}
                        style={{ background: "#ffffff", borderColor: "#FECACA", color: "#B91C1C", fontWeight: 700 }}
                      >
                        {`Produzir o ${faltanteComposto.nome} →`}
                      </button>
                    ) : faltanteInsumo ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/estoque/compras/nova?insumo=${faltanteInsumo.item.componenteProdutoId}`)
                        }
                        className={ctaCls}
                        style={{ background: "#ffffff", borderColor: "#FECACA", color: "#B91C1C", fontWeight: 700 }}
                      >
                        Ir comprar →
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })()}
        </section>

        {erro && (
          <p className="text-xs text-red-600" role="alert" style={{ fontWeight: 500 }}>
            {erro}
          </p>
        )}

        <div className="border-t border-[#efefef] pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm text-[#627271]">Custo do lote</span>
            <span className="text-lg text-[#1f2937]" style={{ fontWeight: 700 }}>
              {formatCurrency(custoLote)}{" "}
              <span className="text-xs text-[#627271]" style={{ fontWeight: 500 }}>
                ({formatCurrency(custoUnitLote)}/{temToggle ? produto.unidade || "un" : "un"})
              </span>
            </span>
          </div>
          <SheetActions>
            <button type="button" onClick={onClose} disabled={salvando} className={sheetButtonSecundario}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={produzir}
              data-sheet-foco
              disabled={salvando || bloqueado}
              className={sheetButtonPrimario}
              style={{ background: "#86cb92" }}
            >
              {salvando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Factory size={15} />
                  Produzir
                </>
              )}
            </button>
          </SheetActions>
        </div>
      </div>
    </BottomSheet>
  );
}
