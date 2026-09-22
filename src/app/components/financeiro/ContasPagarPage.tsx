import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  calcularStatus,
  ContaPagarInput,
  formaPagamentoParaBanco,
  formatarMoeda,
  StatusMovimentacao,
} from "./mockData";
import {
  BottomSheet,
  campoFormSheet,
  ContaPagarView,
  FilterChip,
  FinanceKpi,
  formatarDataBR,
  hojeLocal,
  limparDescricao,
  SheetActions,
  sheetButtonPerigo,
  sheetButtonPrimario,
  sheetButtonSecundario,
  STATUS_CONFIG_PAGAR,
  StatusBadge,
  textoDiasPrazo,
} from "./components";
import { useContasPagar } from "../../hooks/use-contas-pagar";
import { useCriarContaPagar } from "../../hooks/use-criar-conta-pagar";
import { useAtualizarContaPagar } from "../../hooks/use-atualizar-conta-pagar";
import { useCategoriasFinanceiras } from "../../hooks/use-categorias-financeiras";

const STATUS_CHIP_OPTIONS: StatusMovimentacao[] = ["pendente", "vencido", "pago", "cancelado"];

export function ContasPagarPage() {
  const hook = useContasPagar();
  const { contas, loading, isFallback, recarregar } = hook;
  const erroCarregamento = (hook as { error?: string | null }).error;

  const { criarConta } = useCriarContaPagar();
  const { atualizarConta, pagarConta, loading: atualizando } = useAtualizarContaPagar();
  const navigate = useNavigate();
  const { categorias } = useCategoriasFinanceiras();

  const [statusFiltros, setStatusFiltros] = useState<StatusMovimentacao[]>([]);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState<"nova" | "editar" | "pagar" | "excluir" | null>(null);
  const [selecionada, setSelecionada] = useState<ContaPagarView | null>(null);
  const [salvando, setSalvando] = useState(false);

  const esEdicao = modal === "editar" && selecionada !== null;

  const categoriasPagar = useMemo(
    () => categorias.filter((c) => c.tipo === "operacional" || c.tipo === "mercadoria"),
    [categorias]
  );

  // Status calculado (vencido quando a data passou e não foi pago/cancelado)
  const comStatus = useMemo(
    () =>
      contas.map((c) => ({
        ...(c as ContaPagarView),
        status: calcularStatus(c.dataVencimento, c.status),
      })),
    [contas]
  );

  const temFiltro = statusFiltros.length > 0 || busca.trim() !== "";

  const filtradas = comStatus.filter((c) => {
    const matchStatus = statusFiltros.length === 0 || statusFiltros.includes(c.status);
    const q = busca.trim().toLowerCase();
    const matchBusca =
      !q || `${c.descricao} ${c.fornecedor} ${c.formaPagamento || ""}`.toLowerCase().includes(q);
    return matchStatus && matchBusca;
  });

  const kpi = (status: StatusMovimentacao) =>
    comStatus
      .filter((c) => c.status === status)
      .reduce((soma, c) => soma + (c.valor || 0), 0);

  const aPagar = kpi("pendente");
  const emAtraso = kpi("vencido");
  const pago = kpi("pago");

  const abrir = (tipo: typeof modal, conta: ContaPagarView) => {
    setSelecionada(conta);
    setModal(tipo);
  };

  const fechar = () => {
    setModal(null);
    setSelecionada(null);
  };

  const limparFiltros = () => {
    setStatusFiltros([]);
    setBusca("");
  };

  const toggleStatus = (s: StatusMovimentacao) => {
    setStatusFiltros((prev) => (prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s]));
  };

  const salvar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params: ContaPagarInput = {
      descricao: String(data.get("descricao") || "").trim(),
      fornecedor: String(data.get("fornecedor") || "").trim() || undefined,
      valor: Number(data.get("valor")),
      data_vencimento: String(data.get("data") || ""),
      forma_pagamento: String(data.get("forma") || "pix"),
      observacoes: String(data.get("observacoes") || "").trim() || undefined,
    };
    const categoriaId = data.has("categoria")
      ? String(data.get("categoria") || "").trim() || null
      : undefined;

    if (!params.descricao) return toast.error("Informe a descrição.");
    if (!(params.valor > 0)) return toast.error("Informe um valor válido.");
    if (!params.data_vencimento) return toast.error("Informe a data de vencimento.");

    setSalvando(true);
    let sucesso = false;

    if (selecionada) {
      const result = await atualizarConta({ id: selecionada.id, ...params, categoriaId });
      if (result.success) {
        sucesso = true;
        toast.success("Conta atualizada com sucesso.");
      } else {
        toast.error(result.error || "Não foi possível atualizar a conta.");
      }
    } else {
      const result = await criarConta({ ...params, categoriaId });
      if (result.success) {
        sucesso = true;
        toast.success("Conta criada com sucesso.");
      } else {
        toast.error(result.error || "Não foi possível criar a conta.");
      }
    }

    setSalvando(false);
    if (sucesso) {
      fechar();
      recarregar();
    }
  };

  const registrarPagamento = async () => {
    if (!selecionada) return;
    const result = await pagarConta({
      id: selecionada.id,
      data_pagamento: hojeLocal(),
      valor_pago: selecionada.valor,
    });

    if (result.success) {
      toast.success("Pagamento registrado com sucesso.");
      fechar();
      recarregar();
    } else {
      toast.error(result.error || "Não foi possível registrar o pagamento.");
    }
  };

  const excluir = async () => {
    if (!selecionada) return;
    const result = await atualizarConta({ id: selecionada.id, status: "cancelado" });
    if (result.success) {
      toast.success("Conta excluída.");
      fechar();
      recarregar();
    } else {
      toast.error(result.error || "Não foi possível excluir a conta.");
    }
  };

  // ---------- Loading (skeleton no formato do layout final) ----------
  if (loading) {
    return (
      <main data-od-id="contas-pagar-regiao" className="mx-auto max-w-screen-xl p-3 text-[#1f2937] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-44 animate-pulse rounded-lg bg-[#efefef]" />
            <div className="h-4 w-64 animate-pulse rounded bg-[#efefef]" />
          </div>
          <div className="h-11 w-32 animate-pulse rounded-xl bg-[#efefef]" />
        </div>
        <div className="mb-5 grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-xl bg-[#efefef]" />
          ))}
        </div>
        <div className="mb-5 h-12 animate-pulse rounded-xl bg-white/60" />
        <div className="rounded-2xl border border-[#efefef] bg-white p-4">
          <div className="hidden gap-3 md:flex">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 flex-1 animate-pulse rounded-lg bg-[#efefef]" />
            ))}
          </div>
          <div className="space-y-3 md:hidden">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-[#efefef]" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ---------- Erro ----------
  if (erroCarregamento) {
    return (
      <main data-od-id="contas-pagar-regiao" className="mx-auto max-w-screen-xl p-3 text-[#1f2937] sm:p-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#efefef] bg-white px-4 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <h2 className="font-semibold text-[#1f2937]">Não foi possível carregar as contas</h2>
          <p className="mt-1 max-w-md text-sm text-[#627271]">{erroCarregamento}</p>
          <button
            onClick={recarregar}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] hover:bg-[#1f2937] hover:text-white"
          >
            <RefreshCw size={16} />
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      data-od-id="contas-pagar-regiao"
      className="mx-auto max-w-screen-xl p-3 text-[#1f2937] sm:p-6"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 data-od-id="contas-pagar-heading" className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: 18 }}>
            Contas a Pagar
          </h1>
          <p className="mt-0.5 text-xs text-[#627271] sm:text-sm">
            Gerencie suas obrigações e fornecedores.
          </p>
        </div>
        <button
          data-od-id="contas-pagar-cta"
          onClick={() => {
            setSelecionada(null);
            setModal("nova");
          }}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#86cb92] px-3.5 py-2.5 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nova conta</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {isFallback && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span aria-hidden="true">⚠️</span>
          <p>Exibindo dados de exemplo — conecte-se ao banco para ver dados reais.</p>
        </div>
      )}

      {/* KPIs — mobile: 2 compactos + 1; desktop: os 3 */}
      <div className="mb-5 grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3">
        <div className="col-span-2 grid grid-cols-2 gap-2 lg:hidden">
          <FinanceKpi
            compact
            label="A pagar (no prazo)"
            value={formatarMoeda(aPagar)}
            icon={Clock}
            iconColor="#D97706"
            iconBg="#FFFBEB"
          />
          <FinanceKpi
            compact
            label="Em atraso"
            value={formatarMoeda(emAtraso)}
            icon={AlertCircle}
            iconColor="#DC2626"
            iconBg="#FEF2F2"
          />
        </div>
        <div className="hidden lg:contents">
          <FinanceKpi
            label="A pagar (no prazo)"
            value={formatarMoeda(aPagar)}
            icon={Clock}
            iconColor="#D97706"
            iconBg="#FFFBEB"
          />
          <FinanceKpi
            label="Em atraso"
            value={formatarMoeda(emAtraso)}
            icon={AlertCircle}
            iconColor="#DC2626"
            iconBg="#FEF2F2"
          />
          <FinanceKpi
            label="Pago"
            value={formatarMoeda(pago)}
            icon={CheckCircle}
            iconColor="#059669"
            iconBg="#F0FDF4"
          />
        </div>
        <div className="col-span-2 lg:hidden">
          <FinanceKpi
            compact
            label="Pago"
            value={formatarMoeda(pago)}
            icon={CheckCircle}
            iconColor="#059669"
            iconBg="#F0FDF4"
          />
        </div>
      </div>

      {/* Filtros: busca + chips multi-seleção */}
      <section data-od-id="contas-pagar-filtros" className="mb-5 space-y-3 rounded-2xl border border-[#efefef] bg-white p-3 shadow-sm sm:p-4">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por descrição, fornecedor ou forma de pagamento"
            aria-label="Buscar contas"
            className="w-full rounded-xl border border-[#efefef] bg-[#efefef] py-2.5 pl-9 pr-9 text-sm text-[#1f2937] placeholder:text-[#627271] focus:border-[#86cb92] focus:outline-none focus:ring-2 focus:ring-[#86cb92]/30"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#627271] hover:text-[#1f2937]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por status">
          {STATUS_CHIP_OPTIONS.map((s) => {
            const cfg = STATUS_CONFIG_PAGAR[s];
            return (
              <FilterChip
                key={s}
                label={cfg.label}
                color={cfg.color}
                bg={cfg.bg}
                borderColor={cfg.borderColor}
                selected={statusFiltros.includes(s)}
                onToggle={() => toggleStatus(s)}
              />
            );
          })}
          {temFiltro && (
            <button
              onClick={limparFiltros}
              className="min-h-[36px] rounded-lg px-2 text-xs text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
            >
              Limpar
            </button>
          )}
        </div>
      </section>

      {/* Lista: cards no mobile, tabela no desktop */}
      <section data-od-id="contas-pagar-tabela" className="overflow-hidden rounded-2xl border border-[#efefef] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#efefef] px-4 py-3">
          <h2 className="font-semibold text-[#1f2937]">
            Contas cadastradas{" "}
            <span className="text-sm font-normal text-[#627271]">({filtradas.length})</span>
          </h2>
        </div>

        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efefef]">
              <Wallet size={24} className="text-[#627271]" />
            </div>
            <p className="font-semibold text-[#1f2937]">
              {temFiltro ? "Nenhuma conta encontrada" : "Nenhuma conta a pagar"}
            </p>
            <p className="mt-1 max-w-xs text-sm text-[#627271]">
              {temFiltro
                ? "Ajuste os filtros ou a busca."
                : "Cadastre a primeira conta para acompanhar seus gastos."}
            </p>
            <button
              onClick={temFiltro ? limparFiltros : () => setModal("nova")}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#86cb92] px-4 py-2.5 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
            >
              {temFiltro ? (
                "Limpar filtros"
              ) : (
                <>
                  <Plus size={16} />
                  Nova conta
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Cards — mobile */}
            <div className="divide-y divide-[#efefef] md:hidden">
              {filtradas.map((conta) => (
                <ContaPagarCard
                  key={conta.id}
                  conta={conta}
                  onPagar={() => abrir("pagar", conta)}
                  onEditar={() => abrir("editar", conta)}
                  onExcluir={() => abrir("excluir", conta)}
                />
              ))}
            </div>

            {/* Tabela — desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#efefef]">
                    <th className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>
                      Descrição
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>
                      Fornecedor
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>
                      Vencimento
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-[#627271]" style={{ fontWeight: 600 }}>
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-[#627271]" style={{ fontWeight: 600 }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efefef]">
                  {filtradas.map((conta) => (
                    <ContaPagarRow
                      key={conta.id}
                      conta={conta}
                      onPagar={() => abrir("pagar", conta)}
                      onEditar={() => abrir("editar", conta)}
                      onExcluir={() => abrir("excluir", conta)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Modal Nova/Editar */}
      <BottomSheet
        open={modal === "nova" || modal === "editar"}
        onClose={fechar}
        labelledBy="contas-pagar-modal-titulo"
        wide
      >
        <div data-od-id="contas-pagar-modal" className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="contas-pagar-modal-titulo" className="text-lg font-semibold text-[#1f2937]">
              {esEdicao ? "Editar conta a pagar" : "Nova conta a pagar"}
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              {esEdicao
                ? "Atualize os dados desta obrigação."
                : "Registre uma despesa da sua empresa."}
            </p>
          </div>
          <button
            onClick={fechar}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={salvar} className="space-y-4" data-od-id="contas-pagar-form">
          <label className="block text-sm font-medium text-[#1f2937]">
            Descrição *
            <input
              required
              name="descricao"
              autoComplete="off"
              placeholder="Ex.: BARRA DE CHOCOLATE BRANCO"
              defaultValue={limparDescricao(selecionada?.descricao)}
              className={campoFormSheet}
            />
          </label>

          <label className="block text-sm font-medium text-[#1f2937]">
            Fornecedor (opcional)
            <input
              name="fornecedor"
              autoComplete="off"
              placeholder="Nome do fornecedor"
              defaultValue={selecionada?.fornecedor || ""}
              className={campoFormSheet}
            />
          </label>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1f2937]">
              Categoria (opcional)
            </label>
            {categoriasPagar.length > 0 ? (
              <select
                name="categoria"
                defaultValue={selecionada?.categoriaId || ""}
                className={campoFormSheet}
              >
                <option value="">Sem categoria</option>
                {categoriasPagar.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-[#efefef] bg-[#FAFAFA] px-3.5 py-3">
                <p className="text-xs text-[#627271]">Nenhuma categoria cadastrada ainda.</p>
                <button
                  type="button"
                  onClick={() => navigate("/financeiro/configuracoes")}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#efefef] bg-white px-3 py-2 text-xs text-[#1f2937] transition-colors hover:bg-[#efefef]"
                  style={{ fontWeight: 500 }}
                >
                  <Settings size={13} />
                  Configurar
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#1f2937]">
              Valor *
              <input
                required
                min="0.01"
                step="0.01"
                inputMode="decimal"
                type="number"
                name="valor"
                placeholder="0,00"
                defaultValue={selecionada?.valor ?? ""}
                className={campoFormSheet}
              />
            </label>
            <label className="text-sm font-medium text-[#1f2937]">
              Data de vencimento *
              <input
                required
                type="date"
                name="data"
                defaultValue={selecionada?.dataVencimento || hojeLocal()}
                className={campoFormSheet}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-[#1f2937]">
            Forma de pagamento
            <select
              name="forma"
              defaultValue={formaPagamentoParaBanco(selecionada?.formaPagamento) || "pix"}
              className={campoFormSheet}
            >
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="boleto">Boleto</option>
              <option value="transferencia">Transferência</option>
              <option value="cartao">Cartão</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-[#1f2937]">
            Observações
            <textarea
              name="observacoes"
              rows={2}
              placeholder="Anotações sobre esta conta (opcional)"
              defaultValue={selecionada?.observacoes || ""}
              className={`${campoFormSheet} resize-none`}
            />
          </label>

          <SheetActions>
            <button type="button" onClick={fechar} className={sheetButtonSecundario}>
              Cancelar
            </button>
            <button
              type="submit"
              data-sheet-foco
              disabled={salvando}
              className={sheetButtonPrimario}
              style={{ background: "#86cb92" }}
            >
              {salvando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : esEdicao ? (
                "Salvar alterações"
              ) : (
                "Salvar conta"
              )}
            </button>
          </SheetActions>
        </form>
      </BottomSheet>

      {/* Modal Registrar pagamento */}
      <BottomSheet open={modal === "pagar"} onClose={fechar} labelledBy="contas-pagar-pagar-titulo">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100">
            <Check size={18} className="text-green-600" />
          </div>
          <div>
            <h2 id="contas-pagar-pagar-titulo" className="text-[#1f2937]" style={{ fontWeight: 700 }}>
              Registrar pagamento?
            </h2>
            <p className="text-xs text-[#627271]">O valor será marcado como pago hoje.</p>
          </div>
        </div>

        <div className="mb-4 space-y-2 rounded-xl bg-[#f8f9fa] p-4">
          <div className="flex justify-between gap-3 text-sm">
            <span className="shrink-0 text-[#627271]">Descrição</span>
            <span className="truncate text-right font-medium text-[#1f2937]">{selecionada?.descricao}</span>
          </div>
          {selecionada?.fornecedor && (
            <div className="flex justify-between gap-3 text-sm">
              <span className="shrink-0 text-[#627271]">Fornecedor</span>
              <span className="truncate text-right text-[#1f2937]">{selecionada.fornecedor}</span>
            </div>
          )}
          <div className="flex justify-between gap-3 text-sm">
            <span className="shrink-0 text-[#627271]">Vencimento</span>
            <span className="text-right text-[#1f2937]">{formatarDataBR(selecionada?.dataVencimento)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#e5e7eb] pt-2">
            <span className="text-sm text-[#627271]">Valor</span>
            <span className="text-lg text-[#1f2937]" style={{ fontWeight: 700 }}>
              {formatarMoeda(selecionada?.valor || 0)}
            </span>
          </div>
        </div>

        <SheetActions>
          <button type="button" onClick={fechar} disabled={atualizando} className={sheetButtonSecundario}>
            Cancelar
          </button>
          <button
            onClick={registrarPagamento}
            data-sheet-foco
            disabled={atualizando}
            className={sheetButtonPrimario}
            style={{ background: "#86cb92" }}
          >
            {atualizando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar pagamento"
            )}
          </button>
        </SheetActions>
      </BottomSheet>

      {/* Modal Excluir */}
      <BottomSheet open={modal === "excluir"} onClose={fechar} labelledBy="contas-pagar-excluir-titulo">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h2 id="contas-pagar-excluir-titulo" className="text-[#1f2937]" style={{ fontWeight: 700 }}>
              Excluir conta?
            </h2>
            <p className="text-xs text-[#627271]">
              {selecionada?.descricao || "Conta"} — {formatarMoeda(selecionada?.valor || 0)}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-[#f8f9fa] p-4">
          <p className="mb-2 text-xs text-[#1f2937]" style={{ fontWeight: 700 }}>
            O que vai acontecer
          </p>
          <ul className="space-y-1.5 text-xs text-[#627271]">
            <li>• A conta sai da lista e dos relatórios.</li>
            <li>• O histórico é preservado no banco.</li>
            <li>• Esta ação não pode ser desfeita pela tela.</li>
          </ul>
        </div>

        <SheetActions>
          <button type="button" onClick={fechar} className={sheetButtonSecundario}>
            Cancelar
          </button>
          <button
            onClick={excluir}
            data-sheet-foco
            className={sheetButtonPerigo}
            style={{ background: "#DC2626" }}
          >
            <Trash2 size={16} />
            Excluir conta
          </button>
        </SheetActions>
      </BottomSheet>
    </main>
  );
}

// ---- Card mobile -------------------------------------------------------------
function ContaPagarCard({
  conta,
  onPagar,
  onEditar,
  onExcluir,
}: {
  conta: ContaPagarView;
  onPagar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const cancelada = conta.status === "cancelado";
  const podeAcao = conta.status !== "pago" && conta.status !== "cancelado";
  const descricao = limparDescricao(conta.descricao);

  return (
    <div data-od-id="contas-pagar-linha" className="p-3.5 transition-colors hover:bg-[#efefef]/40">
      {/* linha 1: descrição + valor */}
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-sm text-[#1f2937]" style={{ fontWeight: 700 }}>
          {descricao}
        </p>
        <span
          className="shrink-0 text-sm text-[#1f2937]"
          style={
            cancelada
              ? { fontWeight: 700, color: "#627271", textDecoration: "line-through" }
              : { fontWeight: 700 }
          }
        >
          {formatarMoeda(conta.valor)}
        </span>
      </div>

      {/* linha 2: fornecedor (destaque) + status */}
      <div className="mt-1.5 flex items-start justify-between gap-2">
        <p className={`min-w-0 truncate text-sm ${conta.fornecedor ? "font-semibold text-[#1f2937]" : "text-[#627271]"}`}>
          {conta.fornecedor || "Fornecedor não informado"}
        </p>
        <StatusBadge status={conta.status} config={STATUS_CONFIG_PAGAR} />
      </div>

      {/* linha 3: forma + vencimento (muted) + indicador de atraso */}
      <div className="mt-1 text-xs text-[#627271]">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {conta.formaPagamento && <span>{conta.formaPagamento}</span>}
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} />
            vence {formatarDataBR(conta.dataVencimento)}
          </span>
          {conta.status === "vencido" && (
            <span className="font-medium text-red-600">· {textoDiasPrazo(conta.dataVencimento)}</span>
          )}
        </p>
      </div>

      {/* linha 4: ações (alvo de toque >= 40px) */}
      <div className="mt-2.5 flex items-center justify-end gap-1.5">
        {podeAcao && (
          <button
            onClick={onPagar}
            aria-label={`Registrar pagamento de ${descricao}`}
            className="inline-flex h-10 items-center gap-1 rounded-xl bg-[#86cb92] px-3 text-xs font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
          >
            <Check size={14} />
            Pagar
          </button>
        )}
        <button
          onClick={onEditar}
          aria-label={`Editar conta ${descricao}`}
          title="Editar"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={onExcluir}
          aria-label={`Excluir conta ${descricao}`}
          title="Excluir"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// ---- Linha desktop -----------------------------------------------------------
function ContaPagarRow({
  conta,
  onPagar,
  onEditar,
  onExcluir,
}: {
  conta: ContaPagarView;
  onPagar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const cancelada = conta.status === "cancelado";
  const podeAcao = conta.status !== "pago" && conta.status !== "cancelado";
  const descricao = limparDescricao(conta.descricao);

  return (
    <tr data-od-id="contas-pagar-linha" className="transition-colors hover:bg-[#efefef]/50">
      <td className="px-4 py-3.5">
        <p className="truncate text-sm font-semibold text-[#1f2937]">{descricao}</p>
        {conta.formaPagamento && (
          <p className="text-xs text-[#627271]">
            {conta.formaPagamento}
            {conta.recorrente ? " · Recorrente" : ""}
          </p>
        )}
      </td>
      <td className="px-4 py-3.5 text-sm text-[#1f2937]">
        {conta.fornecedor || <span className="text-[#627271]">Fornecedor não informado</span>}
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center gap-1 text-sm text-[#1f2937]">
          <Calendar size={13} />
          {formatarDataBR(conta.dataVencimento)}
        </span>
        {conta.status !== "pago" && conta.status !== "cancelado" && (
          <span className={`block text-xs ${conta.status === "vencido" ? "font-medium text-red-600" : "text-[#627271]"}`}>
            {textoDiasPrazo(conta.dataVencimento)}
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 text-right">
        <span
          className="text-sm text-[#1f2937]"
          style={
            cancelada
              ? { fontWeight: 700, color: "#627271", textDecoration: "line-through" }
              : { fontWeight: 700 }
          }
        >
          {formatarMoeda(conta.valor)}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={conta.status} config={STATUS_CONFIG_PAGAR} />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          {podeAcao && (
            <button
              onClick={onPagar}
              aria-label={`Registrar pagamento de ${descricao}`}
              title="Pagar"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#16A34A] transition-colors hover:bg-[#efefef]"
            >
              <Check size={16} />
            </button>
          )}
          <button
            onClick={onEditar}
            aria-label={`Editar conta ${descricao}`}
            title="Editar"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onExcluir}
            aria-label={`Excluir conta ${descricao}`}
            title="Excluir"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}