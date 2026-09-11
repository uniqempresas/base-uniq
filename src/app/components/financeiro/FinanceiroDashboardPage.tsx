import { useNavigate } from "react-router";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  Clock,
  DollarSign,
  ChevronRight,
  Calendar,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { CardKPI, AlertaAmigavel } from "./components";
import { useContasReceber } from "../../hooks/use-contas-receber";
import { useContasPagar } from "../../hooks/use-contas-pagar";
import {
  movimentacoesMock,
  contasPagarMock,
  contasReceberMock,
  dreMock,
  formatarMoeda,
  calcularStatus,
  calcularDiasVencimento,
} from "./mockData";

function formatarMesAtual(): string {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

export function FinanceiroDashboardPage() {
  const navigate = useNavigate();

  // Dados reais isolados por tenant (SPEC §2/§4) — mock apenas em modo demo
  const contasReceberHook = useContasReceber();
  const contasPagarHook = useContasPagar();

  const isDemo = contasReceberHook.isFallback || contasPagarHook.isFallback;
  const loadingDados = contasReceberHook.loading || contasPagarHook.loading;
  const erro = contasReceberHook.error || contasPagarHook.error;

  const recarregar = () => {
    contasReceberHook.recarregar();
    contasPagarHook.recarregar();
  };

  // ── Modo demo (sem sessão): números vêm do mock — badge "dados de exemplo" ──
  let totalEntradas = 0;
  let totalSaidas = 0;
  let saldoProjetado = 0;
  let contasPagarAtualizadas: typeof contasPagarMock = [];
  let contasReceberAtualizadas: typeof contasReceberMock = [];
  let totalPagar = 0;
  let qtdVencidas = 0;
  let totalReceber = 0;
  let qtdAtrasadas = 0;
  let isLucro = true;
  let lucroValor = 0;
  let ultimasMovimentacoes: typeof movimentacoesMock = [];

  if (isDemo) {
    totalEntradas = movimentacoesMock
      .filter((m) => m.tipo === "entrada" && m.data.startsWith("2025-03"))
      .reduce((sum, m) => sum + m.valor, 0);
    totalSaidas = movimentacoesMock
      .filter((m) => m.tipo === "saida" && m.data.startsWith("2025-03"))
      .reduce((sum, m) => sum + m.valor, 0);
    saldoProjetado = 3500 + totalEntradas - totalSaidas;

    contasPagarAtualizadas = contasPagarMock.map((c) => ({
      ...c,
      status: calcularStatus(c.dataVencimento, c.status),
    }));
    totalPagar = contasPagarAtualizadas.filter((c) => c.status === "pendente").reduce((s, c) => s + c.valor, 0);
    qtdVencidas = contasPagarAtualizadas.filter((c) => c.status === "vencido").length;

    contasReceberAtualizadas = contasReceberMock.map((c) => ({
      ...c,
      status: calcularStatus(c.dataPrevista, c.status),
    }));
    totalReceber = contasReceberAtualizadas.filter((c) => c.status === "pendente").reduce((s, c) => s + c.valor, 0);
    qtdAtrasadas = contasReceberAtualizadas.filter((c) => c.status === "vencido").length;

    isLucro = dreMock.lucroLiquido >= 0;
    lucroValor = Math.abs(dreMock.lucroLiquido);

    ultimasMovimentacoes = movimentacoesMock
      .filter((m) => m.data.startsWith("2025-03"))
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  } else {
    // ── Sessão ativa: KPIs calculados sobre os dados reais dos hooks ──
    contasPagarAtualizadas = contasPagarHook.contas as unknown as typeof contasPagarMock;
    contasReceberAtualizadas = contasReceberHook.contas as unknown as typeof contasReceberMock;

    totalPagar = contasPagarHook.contas
      .filter((c) => c.status === "pendente")
      .reduce((s, c) => s + c.valor, 0);
    qtdVencidas = contasPagarHook.contas.filter((c) => c.status === "vencido").length;

    totalReceber = contasReceberHook.contas
      .filter((c) => c.status === "pendente")
      .reduce((s, c) => s + c.valor, 0);
    qtdAtrasadas = contasReceberHook.contas.filter((c) => c.status === "vencido").length;

    const mesAtual = formatarMesAtual();
    totalEntradas = contasReceberHook.contas
      .filter((c) => c.dataPrevista.startsWith(mesAtual))
      .reduce((s, c) => s + c.valor, 0);
    totalSaidas = contasPagarHook.contas
      .filter((c) => c.dataVencimento.startsWith(mesAtual))
      .reduce((s, c) => s + c.valor, 0);

    saldoProjetado = totalReceber - totalPagar;
    isLucro = totalEntradas - totalSaidas >= 0;
    lucroValor = Math.abs(totalEntradas - totalSaidas);
    ultimasMovimentacoes = []; // sem fonte real de movimentações ainda → empty state real
  }

  // Próximas contas a pagar (próximos 7 dias)
  const proximasContas = contasPagarAtualizadas
    .filter((c) => c.status === "pendente")
    .map((c) => ({ ...c, diasRestantes: calcularDiasVencimento(c.dataVencimento) }))
    .filter((c) => c.diasRestantes >= 0 && c.diasRestantes <= 7)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 5);

  if (loadingDados) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
        <RefreshCw size={28} className="animate-spin text-[#627271] mb-3" />
        <p className="text-sm text-[#627271]">Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[#1f2937] mb-1">Resumo Financeiro</h1>
        <p className="text-sm text-[#1f2937]">Visão geral da saúde financeira do seu negócio</p>
        {isDemo && (
          <span className="inline-flex items-center gap-1.5 mt-2 text-xs px-2 py-1 rounded-full bg-[#efefef] text-[#627271]" style={{ fontWeight: 600 }}>
            <AlertCircle size={12} />
            Dados de exemplo
          </span>
        )}
      </div>

      {erro && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{erro}</span>
          <button
            onClick={recarregar}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-100 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <RefreshCw size={12} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Alertas */}
      <div className="space-y-3 mb-6">
        {qtdVencidas > 0 && (
          <AlertaAmigavel
            tipo="error"
            titulo={`Você tem ${qtdVencidas} conta(s) vencida(s)`}
            mensagem="Pague o quanto antes para evitar juros e multas."
            ctaLabel="Ver Contas"
            ctaAction={() => navigate("/financeiro/contas-pagar")}
          />
        )}

        {qtdAtrasadas > 0 && (
          <AlertaAmigavel
            tipo="warning"
            titulo={`${qtdAtrasadas} cliente(s) com pagamento atrasado`}
            mensagem="Envie uma cobrança amigável para receber mais rápido."
            ctaLabel="Ver Clientes"
            ctaAction={() => navigate("/financeiro/contas-receber")}
          />
        )}
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => navigate("/financeiro/fluxo-de-caixa")}
          className="text-left hover:scale-[1.02] transition-transform"
        >
          <CardKPI label="Saldo Projetado" valor={saldoProjetado} icon={Wallet} tipo={saldoProjetado >= 0 ? "positivo" : "negativo"} />
        </button>

        <button
          onClick={() => navigate("/financeiro/fluxo-de-caixa")}
          className="text-left hover:scale-[1.02] transition-transform"
        >
          <CardKPI label="Entradas do Mês" valor={totalEntradas} icon={TrendingUp} tipo="positivo" comparativo={12.5} />
        </button>

        <button
          onClick={() => navigate("/financeiro/fluxo-de-caixa")}
          className="text-left hover:scale-[1.02] transition-transform"
        >
          <CardKPI label="Saídas do Mês" valor={totalSaidas} icon={TrendingDown} tipo="negativo" comparativo={-5.2} />
        </button>

        <button
          onClick={() => navigate("/financeiro/dre")}
          className="text-left hover:scale-[1.02] transition-transform"
        >
          <CardKPI
            label={isLucro ? "Lucro do Mês" : "Prejuízo do Mês"}
            valor={lucroValor}
            icon={DollarSign}
            tipo={isLucro ? "positivo" : "negativo"}
          />
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Contas a Pagar */}
        <div className="bg-white rounded-xl border border-[#efefef] overflow-hidden">
          <div className="p-4 border-b border-[#efefef] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-red-600" />
              <h3 className="text-[#1f2937]">Contas a Pagar</h3>
            </div>
            <button
              onClick={() => navigate("/financeiro/contas-pagar")}
              className="text-sm text-[#627271] hover:text-[#1f2937] flex items-center gap-1"
            >
              Ver todas
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#1f2937]">Total a pagar:</span>
              <span className="text-lg text-red-700" style={{ fontWeight: 600 }}>
                {formatarMoeda(totalPagar)}
              </span>
            </div>

            {proximasContas.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle size={32} className="text-[#627271] mx-auto mb-2" />
                <p className="text-sm text-[#1f2937]">Nenhuma conta vencendo nos próximos 7 dias!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {proximasContas.map((conta) => (
                  <div
                    key={conta.id}
                    className={`p-3 rounded-lg border ${
                      conta.diasRestantes === 0
                        ? "bg-red-50 border-red-200"
                        : conta.diasRestantes <= 3
                        ? "bg-amber-50 border-amber-200"
                        : "bg-[#efefef] border-[#efefef]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1f2937] truncate" style={{ fontWeight: 500 }}>
                          {conta.descricao}
                        </p>
                        <p className="text-xs text-[#1f2937]">{conta.fornecedor}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                          {formatarMoeda(conta.valor)}
                        </p>
                        <p
                          className={`text-xs ${
                            conta.diasRestantes === 0
                              ? "text-red-600"
                              : conta.diasRestantes <= 3
                              ? "text-amber-600"
                              : "text-[#627271]"
                          }`}
                          style={{ fontWeight: 500 }}
                        >
                          {conta.diasRestantes === 0
                            ? "Vence hoje!"
                            : `${conta.diasRestantes} dia${conta.diasRestantes !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contas a Receber */}
        <div className="bg-white rounded-xl border border-[#efefef] overflow-hidden">
          <div className="p-4 border-b border-[#efefef] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#627271]" />
              <h3 className="text-[#1f2937]">Contas a Receber</h3>
            </div>
            <button
              onClick={() => navigate("/financeiro/contas-receber")}
              className="text-sm text-[#627271] hover:text-[#1f2937] flex items-center gap-1"
            >
              Ver todas
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#1f2937]">Total a receber:</span>
              <span className="text-lg text-[#1f2937]" style={{ fontWeight: 600 }}>
                {formatarMoeda(totalReceber)}
              </span>
            </div>

            {contasReceberAtualizadas.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-[#1f2937]">Nenhuma conta a receber cadastrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contasReceberAtualizadas.slice(0, 5).map((conta) => {
                  const dias = calcularDiasVencimento(conta.dataPrevista);
                  return (
                    <div
                      key={conta.id}
                      className={`p-3 rounded-lg border ${
                        conta.status === "vencido"
                          ? "bg-red-50 border-red-200"
                          : "bg-[#efefef] border-[#efefef]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1f2937] truncate" style={{ fontWeight: 500 }}>
                            {conta.cliente}
                          </p>
                          <p className="text-xs text-[#1f2937]">{conta.descricao}</p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-sm text-[#1f2937]" style={{ fontWeight: 600 }}>
                            {formatarMoeda(conta.valor)}
                          </p>
                          {conta.status === "vencido" ? (
                            <p className="text-xs text-red-600" style={{ fontWeight: 500 }}>
                              Atrasado
                            </p>
                          ) : (
                            <p className="text-xs text-[#627271]">
                              {dias > 0 ? `${dias} dia${dias !== 1 ? "s" : ""}` : "Hoje"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Últimas Movimentações */}
      <div className="bg-white rounded-xl border border-[#efefef] overflow-hidden">
        <div className="p-4 border-b border-[#efefef] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#1f2937]" />
            <h3 className="text-[#1f2937]">Últimas Movimentações</h3>
          </div>
          <button
            onClick={() => navigate("/financeiro/fluxo-de-caixa")}
            className="text-sm text-[#627271] hover:text-[#1f2937] flex items-center gap-1"
          >
            Ver todas
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="divide-y divide-[#efefef]">
          {ultimasMovimentacoes.length === 0 ? (
            <div className="text-center py-10">
              <Calendar size={28} className="text-[#627271] mx-auto mb-2" />
              <p className="text-sm text-[#1f2937]">Nenhuma movimentação registrada ainda</p>
              <p className="text-xs text-[#627271] mt-1">As entradas e saídas aparecerão aqui conforme forem lançadas.</p>
            </div>
          ) : (
            ultimasMovimentacoes.map((mov) => (
              <div key={mov.id} className="p-4 hover:bg-[#efefef] transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      mov.tipo === "entrada" ? "bg-[#efefef]" : "bg-red-50"
                    }`}
                  >
                    {mov.tipo === "entrada" ? (
                      <TrendingUp size={18} className="text-[#627271]" />
                    ) : (
                      <TrendingDown size={18} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#1f2937]" style={{ fontWeight: 500 }}>
                      {mov.descricao}
                    </p>
                    <p className="text-xs text-[#1f2937]">
                      {new Date(mov.data).toLocaleDateString("pt-BR")} • {mov.categoria}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm ${mov.tipo === "entrada" ? "text-[#1f2937]" : "text-red-700"}`}
                  style={{ fontWeight: 600 }}
                >
                  {mov.tipo === "entrada" ? "+" : "-"} {formatarMoeda(mov.valor)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
