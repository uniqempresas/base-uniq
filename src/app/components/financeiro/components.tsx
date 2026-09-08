// Componentes reutilizáveis do módulo Financeiro
import { LucideIcon } from "lucide-react";
import { calcularDiasVencimento, formatarMoeda, StatusMovimentacao } from "./mockData";

// Badge de Status
interface BadgeStatusProps {
  status: StatusMovimentacao;
}

export function BadgeStatus({ status }: BadgeStatusProps) {
  const styles = {
    pago: {
      bg: "bg-[#efefef]",
      text: "text-[#1f2937]",
      border: "border-[#86cb92]",
      label: "Pago",
    },
    pendente: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      label: "Pendente",
    },
    vencido: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      label: "Vencido",
    },
  };

  const style = styles[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${style.bg} ${style.text} ${style.border}`}
    >
      {style.label}
    </span>
  );
}

// Card de KPI Financeiro
interface CardKPIProps {
  label: string;
  valor: number;
  icon: LucideIcon;
  tipo?: "positivo" | "negativo" | "neutro";
  comparativo?: number; // Percentual de variação
  isLoading?: boolean;
}

export function CardKPI({ label, valor, icon: Icon, tipo = "neutro", comparativo, isLoading }: CardKPIProps) {
  const cores = {
    positivo: { bg: "bg-[#efefef]", icon: "text-[#627271]", valor: "text-[#1f2937]" },
    negativo: { bg: "bg-red-50", icon: "text-red-600", valor: "text-red-900" },
    neutro: { bg: "bg-[#efefef]", icon: "text-[#1f2937]", valor: "text-[#1f2937]" },
  };

  const cor = cores[tipo];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#efefef] p-4 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="h-4 bg-[#efefef] rounded w-24"></div>
          <div className={`w-10 h-10 ${cor.bg} rounded-lg`}></div>
        </div>
        <div className="h-8 bg-[#efefef] rounded w-32 mb-1"></div>
        {comparativo !== undefined && <div className="h-3 bg-[#efefef] rounded w-20"></div>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#efefef] p-4 hover:border-[#efefef] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[#1f2937]">{label}</p>
        <div className={`w-10 h-10 ${cor.bg} rounded-lg flex items-center justify-center`}>
          <Icon size={20} className={cor.icon} />
        </div>
      </div>
      <p className={`text-2xl ${cor.valor}`} style={{ fontWeight: 600 }}>
        {formatarMoeda(valor)}
      </p>
      {comparativo !== undefined && (
        <p className="text-xs text-[#627271] mt-1">
          {comparativo > 0 ? "↑" : "↓"} {Math.abs(comparativo)}% vs. mês anterior
        </p>
      )}
    </div>
  );
}

// Indicador de Vencimento
interface IndicadorVencimentoProps {
  dataVencimento: string;
  status: StatusMovimentacao;
}

export function IndicadorVencimento({ dataVencimento, status }: IndicadorVencimentoProps) {
  if (status === "pago") {
    return <span className="text-xs text-[#627271]">-</span>;
  }

  const dias = calcularDiasVencimento(dataVencimento);

  if (dias < 0) {
    return (
      <span className="text-xs text-red-600" style={{ fontWeight: 500 }}>
        {Math.abs(dias)} dia{Math.abs(dias) !== 1 ? "s" : ""} atrasado
      </span>
    );
  }

  if (dias === 0) {
    return (
      <span className="text-xs text-orange-600" style={{ fontWeight: 500 }}>
        Vence hoje
      </span>
    );
  }

  if (dias <= 3) {
    return (
      <span className="text-xs text-amber-600" style={{ fontWeight: 500 }}>
        {dias} dia{dias !== 1 ? "s" : ""}
      </span>
    );
  }

  return (
    <span className="text-xs text-[#627271]">
      {dias} dia{dias !== 1 ? "s" : ""}
    </span>
  );
}

// Empty State
interface EmptyStateProps {
  titulo: string;
  descricao: string;
  ctaLabel: string;
  ctaAction: () => void;
  dica?: string;
}

export function EmptyState({ titulo, descricao, ctaLabel, ctaAction, dica }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-[#efefef] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#627271]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg text-[#1f2937] mb-2" style={{ fontWeight: 600 }}>
        {titulo}
      </h3>
      <p className="text-sm text-[#1f2937] mb-6 text-center max-w-md">{descricao}</p>
      <button
        onClick={ctaAction}
        className="px-4 py-2 bg-[#86cb92] text-[#1f2937] rounded-lg hover:bg-[#1f2937] hover:text-white transition-colors text-sm"
        style={{ fontWeight: 500 }}
      >
        {ctaLabel}
      </button>
      {dica && (
        <p className="text-xs text-[#627271] mt-4 text-center max-w-md">
          <span className="text-[#627271]">💡 Dica:</span> {dica}
        </p>
      )}
    </div>
  );
}

// Alerta Amigável
interface AlertaAmiganvelProps {
  tipo: "info" | "warning" | "success" | "error";
  titulo: string;
  mensagem?: string;
  ctaLabel?: string;
  ctaAction?: () => void;
}

export function AlertaAmigavel({ tipo, titulo, mensagem, ctaLabel, ctaAction }: AlertaAmiganvelProps) {
  const estilos = {
    info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", icon: "ℹ️" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", icon: "⚠️" },
    success: { bg: "bg-[#efefef]", border: "border-[#86cb92]", text: "text-[#1f2937]", icon: "✅" },
    error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-900", icon: "❌" },
  };

  const estilo = estilos[tipo];

  return (
    <div className={`${estilo.bg} border ${estilo.border} rounded-xl p-4 flex items-start gap-3`}>
      <span className="text-xl">{estilo.icon}</span>
      <div className="flex-1">
        <p className={`text-sm ${estilo.text}`} style={{ fontWeight: 600 }}>
          {titulo}
        </p>
        {mensagem && <p className={`text-sm ${estilo.text} opacity-80 mt-1`}>{mensagem}</p>}
      </div>
      {ctaLabel && ctaAction && (
        <button
          onClick={ctaAction}
          className={`px-3 py-1.5 ${estilo.text} bg-white border ${estilo.border} rounded-lg text-xs hover:bg-opacity-80 transition-colors`}
          style={{ fontWeight: 500 }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
