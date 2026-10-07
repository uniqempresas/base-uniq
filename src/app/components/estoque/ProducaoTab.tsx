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
import { useMemo, useState } from "react";
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
import { formatCurrency } from "../../lib/produto-utils";
import { useFichaTecnica } from "../../hooks/use-ficha-tecnica";
import { useProdutos } from "../../hooks/use-produtos";
import { useOrdensProducao } from "../../hooks/use-ordens-producao";
import { useRegistrarProducao } from "../../hooks/use-registrar-producao";
import type { RegistrarProducaoParams, RegistrarProducaoResult } from "../../hooks/use-registrar-producao";
import type { Produto } from "../../types/produto";
import type { ItemFichaTecnica } from "../../types/producao";
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
    // insumo fora do `useProdutos` (ex.: inativo) → estoque desconhecido = 0:
    // a pré-visualização bloqueia e a RPC é a guarda final.
    estoqueAtual: insumo?.estoque ?? 0,
  };
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

  const [modalAberta, setModalAberta] = useState(false);

  const produtosPorId = useMemo(() => new Map(produtos.map((p) => [p.id, p])), [produtos]);

  const linhas = useMemo(
    () => fichaItens.map((item) => calcularLinha(item, produtosPorId.get(item.componenteProdutoId))),
    [fichaItens, produtosPorId]
  );

  const custoPorUnidade = linhas.reduce((s, l) => s + l.consumoPorUnidade * l.custoMedio, 0);
  const temCustoPendente = linhas.some((l) => l.custoPendente);
  const semFicha = !fichaLoading && !fichaError && linhas.length === 0;

  const ultimaOrdem = ordens[0] || null;

  return (
    <div className="space-y-5">
      {/* ── Cabeçalho: custo por unidade + ação ── */}
      <section className="bg-white rounded-2xl border border-[#efefef] shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[#1f2937] text-sm" style={{ fontWeight: 600 }}>
              Custo por unidade produzida
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
              {custoPorUnidade > 0 ? formatCurrency(custoPorUnidade) : "—"}{" "}
              <span className="text-sm" style={{ fontWeight: 500 }}>
                / {produto.unidade || "un"}
              </span>
            </p>
            <p className="mt-0.5 text-[11px] text-[#627271]">
              {ultimaOrdem
                ? `${fmtNum(ultimaOrdem.quantidade)} no último lote (${dataProducaoBR(ultimaOrdem.dataProducao)})`
                : `${linhas.length} insumo${linhas.length === 1 ? "" : "s"} na ficha`}
            </p>
          </div>
        )}

        {temCustoPendente && (
          <button
            type="button"
            onClick={() => navigate("/estoque/compras")}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-[#FFFBEB]"
            style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309" }}
          >
            <span className="flex items-center gap-2 text-xs" style={{ fontWeight: 600 }}>
              <AlertTriangle size={14} className="shrink-0" />
              Insumo sem custo médio — o custo do lote fica subestimado até a primeira compra
            </span>
            <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#FDE68A] bg-white px-2.5 py-1.5 text-[11px]" style={{ color: "#B45309", fontWeight: 600 }}>
              <ShoppingCart size={12} />
              Nas compras
            </span>
          </button>
        )}
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
              Consumo de insumos por 1 un
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
                const linhaTotal = l.consumoPorUnidade * l.custoMedio;
                return (
                  <li key={l.item.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                        {l.nome}
                      </p>
                      <p className="text-[11px] text-[#627271]">
                        {fmtNum(l.consumoPorUnidade)} {l.unidade} por un
                        {" · "}
                        est: {fmtNum(l.estoqueAtual)} {l.unidade}
                      </p>
                    </div>

                    {l.custoPendente ? (
                      <button
                        type="button"
                        onClick={() => navigate("/estoque/compras")}
                        className="shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors hover:bg-[#FFFBEB]"
                        style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#B45309", fontWeight: 600 }}
                        role="status"
                        title="Custo pendente de compra — ver Compras"
                      >
                        <AlertTriangle size={11} />
                        custo pendente de compra
                      </button>
                    ) : (
                      <div className="shrink-0 flex items-center gap-2.5">
                        <span className="text-[11px] text-[#627271]">
                          × {fmtCustoUnitario(l.custoMedio)}/{l.unidade}
                        </span>
                        <span className="text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
                          = {formatCurrency(linhaTotal)}
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
            <p className="text-sm text-[#627271]">Nenhuma produção ainda — gere o primeiro lote.</p>
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
        registrarProducao={registrarProducao}
        salvando={produzindo}
        onSucesso={() => {
          // estoque/custo mudaram em TUDO: insumos (produtos), pai (produto),
          // histórico (ordens) e a ficha segue igual — recarrega por segurança.
          recarregarProdutos();
          recarregarOrdens();
          recarregarFicha();
          onSuccess();
        }}
      />
    </div>
  );
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
  registrarProducao: (p: RegistrarProducaoParams) => Promise<RegistrarProducaoResult>;
  salvando: boolean;
  onSucesso: () => void;
}

function ProduzirLoteModal({
  aberta,
  onClose,
  produto,
  linhas,
  registrarProducao,
  salvando,
  onSucesso,
}: ProduzirLoteModalProps) {
  const [lote, setLote] = useState("1");
  const [data, setData] = useState(hojeLocal());
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");

  const loteNum = parseFloat(lote) || 0;

  const prev = linhas.map((l) => {
    const consumo = l.consumoPorUnidade * loteNum;
    return {
      linha: l,
      consumo,
      suficiente: consumo <= l.estoqueAtual,
      linhaTotal: consumo * l.custoMedio,
    };
  });

  const custoLote = prev.reduce((s, p) => s + p.linhaTotal, 0);
  const custoUnitLote = loteNum > 0 ? custoLote / loteNum : 0;
  const insuficientes = prev.filter((p) => loteNum > 0 && !p.suficiente);
  const bloqueado = loteNum <= 0 || insuficientes.length > 0 || prev.length === 0;

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
      quantidade: loteNum,
      data,
      observacao: observacao.trim() || undefined,
    });

    if (r.success) {
      toast.success(
        `Produção registrada: +${fmtNum(loteNum)} ${produto.unidade || "un"} · custo ${formatCurrency(
          r.custoUnit ?? 0
        )}/un · insumos baixados`
      );
      onSucesso();
      onClose();
    } else {
      // `error` do jsonb (ex.: "Insufficient stock: …") fica visível no sheet
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
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#1f2937]">
            Quantidade (unidades) *
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={lote}
              onChange={(e) => {
                setLote(e.target.value);
                setErro("");
              }}
              placeholder="1"
              className={`${campoFormSheet} text-base`}
            />
          </label>
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
                      ? "custo pendente de compra"
                      : `= ${formatCurrency(p.linhaTotal)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
                    {fmtNum(p.consumo)} {p.linha.unidade}
                  </p>
                  <p className="text-[11px] text-[#627271]">
                    de {fmtNum(p.linha.estoqueAtual)} {p.linha.unidade}
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

          {insuficientes.length > 0 && (
            <p
              className="mt-2 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs"
              role="alert"
              style={{ background: "#FECACA", borderColor: "#FECACA", color: "#B91C1C", fontWeight: 600 }}
            >
              <AlertTriangle size={14} className="mt-px shrink-0" />
              Estoque insuficiente de {insuficientes.map((p) => p.linha.nome).join(", ")} —{" "}
              {insuficientes.length === 1 ? "receba uma compra ou" : "receba compras ou"} ajuste o lote.
            </p>
          )}
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
                ({formatCurrency(custoUnitLote)}/un)
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
