import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Edit,
  Loader2,
  MessageCircle,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  calcularStatus,
  ContaReceberInput,
  formaPagamentoParaBanco,
  formatarMoeda,
  StatusMovimentacao,
} from "./mockData";
import {
  BottomSheet,
  campoFormSheet,
  ContaReceberView,
  FilterChip,
  FinanceKpi,
  formatarDataBR,
  hojeLocal,
  limparDescricao,
  normalizarTelefoneWhatsApp,
  numeroPedidoDe,
  SheetActions,
  sheetButtonPerigo,
  sheetButtonPrimario,
  sheetButtonSecundario,
  STATUS_CONFIG_RECEBER,
  StatusBadge,
  telefoneDe,
  textoDiasPrazo,
  vendaCanceladaDe,
} from "./components";
import { useContasReceber } from "../../hooks/use-contas-receber";
import { useCriarContaReceber } from "../../hooks/use-criar-conta-receber";
import { useAtualizarContaReceber } from "../../hooks/use-atualizar-conta-receber";
import { useCategoriasFinanceiras } from "../../hooks/use-categorias-financeiras";
import { useAuth } from "../../contexts/AuthContext";

// Rótulo amigável -> valor que a API persiste (contrato congelado)
const STATUS_CHIP_OPTIONS: StatusMovimentacao[] = ["pendente", "vencido", "pago", "cancelado"];

export function ContasReceberPage() {
  const hook = useContasReceber();
  const { contas, loading, isFallback, recarregar } = hook;
  const erroCarregamento = (hook as { error?: string | null }).error;

  const { criarConta } = useCriarContaReceber();
  const { atualizarConta, receberConta, loading: atualizando } = useAtualizarContaReceber();
  const { empresa } = useAuth();
  const navigate = useNavigate();
  const { categorias } = useCategoriasFinanceiras();

  const [statusFiltros, setStatusFiltros] = useState<StatusMovimentacao[]>([]);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState<"nova" | "editar" | "receber" | "cobranca" | "excluir" | null>(null);
  const [selecionada, setSelecionada] = useState<ContaReceberView | null>(null);
  const [salvando, setSalvando] = useState(false);

  const esEdicao = modal === "editar" && selecionada !== null;

  const categoriasReceita = useMemo(
    () => categorias.filter((c) => c.tipo === "receita"),
    [categorias]
  );

  // Status calculado (vencido quando a data passou e não foi pago/cancelado)
  const comStatus = useMemo(
    () =>
      contas.map((c) => ({
        ...(c as ContaReceberView),
        status: calcularStatus(c.dataPrevista, c.status),
      })),
    [contas]
  );

  const temFiltro = statusFiltros.length > 0 || busca.trim() !== "";

  const filtradas = comStatus.filter((c) => {
    const matchStatus = statusFiltros.length === 0 || statusFiltros.includes(c.status);
    const q = busca.trim().toLowerCase();
    const matchBusca =
      !q ||
      `${c.cliente} ${limparDescricao(c.descricao, c.cliente)} ${c.formaPagamento || ""}`
        .toLowerCase()
        .includes(q);
    return matchStatus && matchBusca;
  });

  // KPIs: venda vinculada cancelada NÃO é dinheiro a receber → fica fora de todos
  const kpi = (status: StatusMovimentacao) =>
    comStatus
      .filter((c) => c.status === status && !vendaCanceladaDe(c))
      .reduce((soma, c) => soma + (c.valor || 0), 0);

  const aReceber = kpi("pendente");
  const emAtraso = kpi("vencido");
  const recebido = kpi("pago");

  const abrir = (tipo: typeof modal, conta: ContaReceberView) => {
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
    // Contrato congelado: cliente (obrigatório), descrição amigável SEM uuid cru.
    const params: ContaReceberInput = {
      cliente: String(data.get("cliente") || "").trim(),
      descricao: String(data.get("descricao") || "").trim(),
      valor: Number(data.get("valor")),
      data_vencimento: String(data.get("data") || ""),
      forma_pagamento: String(data.get("forma") || "pix"),
      observacoes: String(data.get("observacoes") || "").trim() || undefined,
    };
    const categoriaId = data.has("categoria")
      ? String(data.get("categoria") || "").trim() || null
      : undefined;

    if (!params.cliente) return toast.error("Informe o nome do cliente.");
    if (!params.descricao) return toast.error("Informe a descrição.");
    if (!(params.valor > 0)) return toast.error("Informe um valor válido.");
    if (!params.data_vencimento) return toast.error("Informe a data prevista.");

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

  const receber = async () => {
    if (!selecionada) return;
    const result = await receberConta({
      id: selecionada.id,
      data_pagamento: hojeLocal(),
      valor_pago: selecionada.valor,
    });

    if (result.success) {
      toast.success("Recebimento registrado com sucesso.");
      fechar();
      recarregar();
    } else {
      toast.error(result.error || "Não foi possível registrar o recebimento.");
    }
  };

  const mensagemCobranca = useMemo(() => {
    if (!selecionada) return "";
    const primeiroNome = selecionada.cliente.split(" ")[0];
    const descricao = limparDescricao(selecionada.descricao, selecionada.cliente) || "conta";
    return (
      `Olá, ${primeiroNome}! Aqui é a ${empresa?.nome_fantasia || "UNIQ"}. ` +
      `Lembrete: a conta de ${descricao}, no valor de ${formatarMoeda(selecionada.valor)}, ` +
      `vence em ${formatarDataBR(selecionada.dataPrevista)}. ` +
      `Qualquer dúvida, é só chamar! 😊`
    );
  }, [selecionada, empresa]);

  const enviarCobranca = () => {
    if (!selecionada) return;
    const telefone = telefoneDe(selecionada);
    if (!telefone) return;
    window.open(
      `https://wa.me/${normalizarTelefoneWhatsApp(telefone)}?text=${encodeURIComponent(mensagemCobranca)}`,
      "_blank",
      "noopener,noreferrer"
    );
    fechar();
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
      <main data-od-id="contas-receber-regiao" className="mx-auto max-w-screen-xl p-3 text-[#1f2937] sm:p-6">
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
      <main data-od-id="contas-receber-regiao" className="mx-auto max-w-screen-xl p-3 text-[#1f2937] sm:p-6">
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
      data-od-id="contas-receber-regiao"
      className="mx-auto max-w-screen-xl p-3 text-[#1f2937] sm:p-6"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 data-od-id="contas-receber-heading" className="text-[#1f2937]" style={{ fontWeight: 700, fontSize: 18 }}>
            Contas a Receber
          </h1>
          <p className="mt-0.5 text-xs text-[#627271] sm:text-sm">
            Acompanhe os pagamentos de clientes e parcelas pendentes.
          </p>
        </div>
        <button
          data-od-id="contas-receber-cta"
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
            label="A receber (no prazo)"
            value={formatarMoeda(aReceber)}
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
            label="A receber (no prazo)"
            value={formatarMoeda(aReceber)}
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
            label="Recebido"
            value={formatarMoeda(recebido)}
            icon={CheckCircle}
            iconColor="#059669"
            iconBg="#F0FDF4"
          />
        </div>
        <div className="col-span-2 lg:hidden">
          <FinanceKpi
            compact
            label="Recebido"
            value={formatarMoeda(recebido)}
            icon={CheckCircle}
            iconColor="#059669"
            iconBg="#F0FDF4"
          />
        </div>
      </div>

      {/* Filtros: busca + chips multi-seleção */}
      <section data-od-id="contas-receber-filtros" className="mb-5 space-y-3 rounded-2xl border border-[#efefef] bg-white p-3 shadow-sm sm:p-4">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#627271]" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente, descrição ou forma de pagamento"
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
            const cfg = STATUS_CONFIG_RECEBER[s];
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
      <section data-od-id="contas-receber-tabela" className="overflow-hidden rounded-2xl border border-[#efefef] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#efefef] px-4 py-3">
          <h2 className="font-semibold text-[#1f2937]">
            Contas cadastradas{" "}
            <span className="text-sm font-normal text-[#627271]">({filtradas.length})</span>
          </h2>
        </div>

        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efefef]">
              <Receipt size={24} className="text-[#627271]" />
            </div>
            <p className="font-semibold text-[#1f2937]">
              {temFiltro ? "Nenhuma conta encontrada" : "Nenhuma conta a receber"}
            </p>
            <p className="mt-1 max-w-xs text-sm text-[#627271]">
              {temFiltro
                ? "Ajuste os filtros ou a busca."
                : "Cadastre a primeira conta para acompanhar os recebimentos."}
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
                <ContaReceberCard
                  key={conta.id}
                  conta={conta}
                  onReceber={() => abrir("receber", conta)}
                  onCobrar={() => abrir("cobranca", conta)}
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
                      Pedido / Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-[#627271]" style={{ fontWeight: 600 }}>
                      Descrição
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
                    <ContaReceberRow
                      key={conta.id}
                      conta={conta}
                      onReceber={() => abrir("receber", conta)}
                      onCobrar={() => abrir("cobranca", conta)}
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
        labelledBy="contas-receber-modal-titulo"
        wide
      >
        <div data-od-id="contas-receber-modal" className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="contas-receber-modal-titulo" className="text-lg font-semibold text-[#1f2937]">
              {esEdicao ? "Editar conta a receber" : "Nova conta a receber"}
            </h2>
            <p className="mt-0.5 text-xs text-[#627271]">
              {esEdicao
                ? "Atualize os dados deste recebimento."
                : "Registre um valor que sua empresa vai receber."}
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

        <form onSubmit={salvar} className="space-y-4" data-od-id="contas-receber-form">
          <label className="block text-sm font-medium text-[#1f2937]">
            Cliente *
            <input
              required
              name="cliente"
              autoComplete="off"
              placeholder="Nome do cliente"
              defaultValue={selecionada?.cliente || ""}
              className={campoFormSheet}
            />
          </label>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1f2937]">
              Categoria (opcional)
            </label>
            {categoriasReceita.length > 0 ? (
              <select
                name="categoria"
                defaultValue={selecionada?.categoriaId || ""}
                className={campoFormSheet}
              >
                <option value="">Sem categoria</option>
                {categoriasReceita.map((cat) => (
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

          <label className="block text-sm font-medium text-[#1f2937]">
            Descrição *
            <input
              required
              name="descricao"
              autoComplete="off"
              placeholder="Ex.: Venda no balcão, Fiado, Encomenda"
              defaultValue={limparDescricao(selecionada?.descricao, selecionada?.cliente)}
              className={campoFormSheet}
            />
          </label>

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
              Data prevista *
              <input
                required
                type="date"
                name="data"
                defaultValue={selecionada?.dataPrevista || hojeLocal()}
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
              placeholder="Anotações sobre este recebimento (opcional)"
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

      {/* Modal Registrar recebimento */}
      <BottomSheet open={modal === "receber"} onClose={fechar} labelledBy="contas-receber-receber-titulo">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100">
            <Check size={18} className="text-green-600" />
          </div>
          <div>
            <h2 id="contas-receber-receber-titulo" className="text-[#1f2937]" style={{ fontWeight: 700 }}>
              Registrar recebimento?
            </h2>
            <p className="text-xs text-[#627271]">O valor será marcado como recebido hoje.</p>
          </div>
        </div>

        <div className="mb-4 space-y-2 rounded-xl bg-[#f8f9fa] p-4">
          <div className="flex justify-between gap-3 text-sm">
            <span className="shrink-0 text-[#627271]">Cliente</span>
            <span className="truncate text-right font-medium text-[#1f2937]">{selecionada?.cliente}</span>
          </div>
          <div className="flex justify-between gap-3 text-sm">
            <span className="shrink-0 text-[#627271]">Descrição</span>
            <span className="truncate text-right text-[#1f2937]">
              {limparDescricao(selecionada?.descricao, selecionada?.cliente)}
            </span>
          </div>
          <div className="flex justify-between gap-3 text-sm">
            <span className="shrink-0 text-[#627271]">Vencimento</span>
            <span className="text-right text-[#1f2937]">{formatarDataBR(selecionada?.dataPrevista)}</span>
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
            onClick={receber}
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
              "Confirmar recebimento"
            )}
          </button>
        </SheetActions>
      </BottomSheet>

      {/* Modal Cobrança no WhatsApp (real — abre wa.me) */}
      <BottomSheet open={modal === "cobranca"} onClose={fechar} labelledBy="contas-receber-cobranca-titulo">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100">
            <MessageCircle size={18} className="text-green-600" />
          </div>
          <div>
            <h2 id="contas-receber-cobranca-titulo" className="text-[#1f2937]" style={{ fontWeight: 700 }}>
              Cobrar no WhatsApp
            </h2>
            <p className="text-xs text-[#627271]">
              Revise a mensagem — ela será aberta no WhatsApp do cliente.
            </p>
          </div>
        </div>

        <div className="mb-1 rounded-xl bg-[#f8f9fa] p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#1f2937]">{mensagemCobranca}</p>
        </div>

        <SheetActions>
          <button type="button" onClick={fechar} className={sheetButtonSecundario}>
            Voltar
          </button>
          <button
            onClick={enviarCobranca}
            data-sheet-foco
            className={sheetButtonPrimario}
            style={{ background: "#25D366", color: "#ffffff" }}
          >
            <MessageCircle size={16} />
            Enviar no WhatsApp
          </button>
        </SheetActions>
      </BottomSheet>

      {/* Modal Excluir */}
      <BottomSheet open={modal === "excluir"} onClose={fechar} labelledBy="contas-receber-excluir-titulo">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h2 id="contas-receber-excluir-titulo" className="text-[#1f2937]" style={{ fontWeight: 700 }}>
              Excluir conta?
            </h2>
            <p className="text-xs text-[#627271]">
              Conta de {selecionada?.cliente || "cliente não informado"} —{" "}
              {formatarMoeda(selecionada?.valor || 0)}
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
function ContaReceberCard({
  conta,
  onReceber,
  onCobrar,
  onEditar,
  onExcluir,
}: {
  conta: ContaReceberView;
  onReceber: () => void;
  onCobrar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const numero = numeroPedidoDe(conta);
  const cancelada = vendaCanceladaDe(conta);
  const telefone = telefoneDe(conta);
  const podeAcao = conta.status !== "pago" && conta.status !== "cancelado";
  const descricao = limparDescricao(conta.descricao, conta.cliente);

  return (
    <div data-od-id="contas-receber-linha" className="p-3.5 transition-colors hover:bg-[#efefef]/40">
      {/* linha 1: número do pedido (ou Manual) + valor */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {numero ? (
            <span className="text-sm text-[#1f2937]" style={{ fontWeight: 700, fontFamily: "monospace" }}>
              #{numero}
            </span>
          ) : (
            <span className="rounded-full border border-[#efefef] bg-[#efefef] px-2 py-0.5 text-[11px] font-medium text-[#627271]">
              Manual
            </span>
          )}
          {cancelada && (
            <span className="rounded-full bg-[#efefef] px-2 py-0.5 text-[10px] font-medium text-[#627271]">
              Venda cancelada
            </span>
          )}
        </div>
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

      {/* linha 2: cliente (destaque) + status */}
      <div className="mt-1.5 flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold text-[#1f2937]">
          {conta.cliente || "Cliente não informado"}
        </p>
        <StatusBadge status={conta.status} config={STATUS_CONFIG_RECEBER} />
      </div>

      {/* linha 3: descrição + forma + vencimento (muted) + indicador de atraso */}
      <div className="mt-1 space-y-0.5 text-xs text-[#627271]">
        {descricao && <p className="truncate">{descricao}</p>}
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {conta.itensResumo && <span className="truncate">{conta.itensResumo}</span>}
          {conta.formaPagamento && <span>· {conta.formaPagamento}</span>}
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} />
            vence {formatarDataBR(conta.dataPrevista)}
          </span>
          {conta.status === "vencido" && (
            <span className="font-medium text-red-600">· {textoDiasPrazo(conta.dataPrevista)}</span>
          )}
        </p>
      </div>

      {/* linha 4: ações (alvo de toque >= 40px) */}
      <div className="mt-2.5 flex items-center justify-end gap-1.5">
        {podeAcao && (
          <button
            onClick={onReceber}
            aria-label={`Registrar recebimento de ${conta.cliente}`}
            className="inline-flex h-10 items-center gap-1 rounded-xl bg-[#86cb92] px-3 text-xs font-semibold text-[#1f2937] transition-colors hover:bg-[#1f2937] hover:text-white"
          >
            <Check size={14} />
            Receber
          </button>
        )}
        {podeAcao && telefone && (
          <button
            onClick={onCobrar}
            aria-label={`Cobrar ${conta.cliente} no WhatsApp`}
            title="Cobrar no WhatsApp"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#16A34A] transition-colors hover:bg-[#efefef]"
          >
            <MessageCircle size={17} />
          </button>
        )}
        <button
          onClick={onEditar}
          aria-label={`Editar conta de ${conta.cliente}`}
          title="Editar"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={onExcluir}
          aria-label={`Excluir conta de ${conta.cliente}`}
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
function ContaReceberRow({
  conta,
  onReceber,
  onCobrar,
  onEditar,
  onExcluir,
}: {
  conta: ContaReceberView;
  onReceber: () => void;
  onCobrar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const numero = numeroPedidoDe(conta);
  const cancelada = vendaCanceladaDe(conta);
  const telefone = telefoneDe(conta);
  const podeAcao = conta.status !== "pago" && conta.status !== "cancelado";
  const descricao = limparDescricao(conta.descricao, conta.cliente);

  return (
    <tr data-od-id="contas-receber-linha" className="transition-colors hover:bg-[#efefef]/50">
      <td className="px-4 py-3.5">
        <div className="mb-0.5 flex items-center gap-1.5">
          {numero ? (
            <span className="text-xs text-[#1f2937]" style={{ fontWeight: 700, fontFamily: "monospace" }}>
              #{numero}
            </span>
          ) : (
            <span className="rounded-full border border-[#efefef] bg-[#efefef] px-2 py-0.5 text-[11px] font-medium text-[#627271]">
              Manual
            </span>
          )}
          {cancelada && (
            <span className="rounded-full bg-[#efefef] px-2 py-0.5 text-[10px] font-medium text-[#627271]">
              Cancelada
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-[#1f2937]">{conta.cliente || "Cliente não informado"}</p>
      </td>
      <td className="px-4 py-3.5">
        {descricao && <p className="text-sm text-[#1f2937]">{descricao}</p>}
        <p className="text-xs text-[#627271]">
          {conta.itensResumo}
          {conta.itensResumo && conta.formaPagamento ? " · " : ""}
          {conta.formaPagamento}
          {conta.parcela ? ` · Parcela ${conta.parcela}` : ""}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center gap-1 text-sm text-[#1f2937]">
          <Calendar size={13} />
          {formatarDataBR(conta.dataPrevista)}
        </span>
        {conta.status !== "pago" && conta.status !== "cancelado" && (
          <span className={`block text-xs ${conta.status === "vencido" ? "font-medium text-red-600" : "text-[#627271]"}`}>
            {textoDiasPrazo(conta.dataPrevista)}
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
        <StatusBadge status={conta.status} config={STATUS_CONFIG_RECEBER} />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          {podeAcao && (
            <button
              onClick={onReceber}
              aria-label={`Registrar recebimento de ${conta.cliente}`}
              title="Receber"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#16A34A] transition-colors hover:bg-[#efefef]"
            >
              <Check size={16} />
            </button>
          )}
          {podeAcao && telefone && (
            <button
              onClick={onCobrar}
              aria-label={`Cobrar ${conta.cliente} no WhatsApp`}
              title="Cobrar no WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#16A34A] transition-colors hover:bg-[#efefef]"
            >
              <MessageCircle size={15} />
            </button>
          )}
          <button
            onClick={onEditar}
            aria-label={`Editar conta de ${conta.cliente}`}
            title="Editar"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#627271] transition-colors hover:bg-[#efefef] hover:text-[#1f2937]"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onExcluir}
            aria-label={`Excluir conta de ${conta.cliente}`}
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