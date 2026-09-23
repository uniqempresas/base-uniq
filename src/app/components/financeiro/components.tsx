// ============================================================
// Componentes reutilizáveis do módulo Financeiro
// ============================================================
// PARTE 1 — legado (usado por FinanceiroDashboardPage/DREPage — NÃO remover)
// PARTE 2 — novo, mobile-first (usado por Contas a Receber / Contas a Pagar)
// ============================================================

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  calcularDiasVencimento,
  formatarMoeda,
  type ContaPagar,
  type ContaReceber,
  type StatusMovimentacao,
} from "./mockData";

// ****************************************************************************
// PARTE 1 — LEGADO (mantido intacto: FinanceiroDashboardPage e DREPage usam)
// ****************************************************************************

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
    cancelado: {
      bg: "bg-[#efefef]",
      text: "text-[#627271]",
      border: "border-[#627271]",
      label: "Cancelado",
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
  if (status === "pago" || status === "cancelado") {
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

// ****************************************************************************
// PARTE 2 — NOVO (mobile-first p/ Contas a Receber / Contas a Pagar)
// ****************************************************************************

// ---- Tipos de exibição defensiva -------------------------------------------
// A lane @fixer está adicionando campos (numeroPedido, vendaCancelada, etc.) no
// mockData. Enquanto isso, estes tipos estendem os tipos atuais com campos
// OPCIONAIS — o card degrada bem antes da migração e não quebra com ela.

export interface ContaReceberView extends ContaReceber {
  clienteId?: string;
  vendaId?: string;
  numeroPedido?: string; // ex.: "848081af" (npedido da venda ou 8 primeiros do uuid)
  itensResumo?: string; // ex.: "2x Surpresa de Uva, 1x Trufa"
  telefone?: string; // para cobrança via WhatsApp (wa.me)
  vendaCancelada?: boolean;
}

export interface ContaPagarView extends ContaPagar {
  fornecedorId?: string;
}

// UUID cru nunca pode aparecer na tela. limparDescricao/UUID_RE agora vivem em
// `src/app/lib/masks.ts` (compartilhados com o fluxo de caixa). Re-exportados
// aqui para não quebrar quem já importava deste arquivo.
export { limparDescricao, UUID_RE } from "../../lib/masks";

export function numeroPedidoDe(conta: ContaReceber): string | null {
  const v = (conta as ContaReceberView).numeroPedido;
  return v && v.trim() ? v.trim() : null;
}

export function vendaCanceladaDe(conta: ContaReceber): boolean {
  return Boolean((conta as ContaReceberView).vendaCancelada);
}

export function telefoneDe(conta: ContaReceber): string | null {
  const t = (conta as ContaReceberView).telefone;
  return t && t.trim() ? t.trim() : null;
}

// Normaliza telefone BR para wa.me — adiciona o DDI 55 quando faltar.
export function normalizarTelefoneWhatsApp(telefone: string): string {
  const soDigitos = telefone.replace(/\D/g, "");
  if (!soDigitos) return "";
  if (soDigitos.length <= 11 && !soDigitos.startsWith("55")) return `55${soDigitos}`;
  return soDigitos;
}

// Data no formato ISO → data local pt-BR (evita o bug de fuso do new Date("aaaa-mm-dd"))
export function formatarDataBR(iso?: string): string {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!a || !m || !d) return iso.slice(0, 10);
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR");
}

// Data local de hoje no formato yyyy-mm-dd (independente de fuso)
export function hojeLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

// Texto de prazo: "3 dias de atraso" / "Vence hoje" / "Vence em 5 dias"
export function textoDiasPrazo(dataISO: string): string {
  const dias = calcularDiasVencimento(dataISO);
  if (dias < 0) return `${Math.abs(dias)} dia${Math.abs(dias) === 1 ? "" : "s"} de atraso`;
  if (dias === 0) return "Vence hoje";
  return `Vence em ${dias} dia${dias === 1 ? "" : "s"}`;
}

// ---- STATUS_CONFIG (mesmo formato de pedidos/pedidosMockData.ts) -----------

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  borderColor: string;
  icon: string;
}

export const STATUS_CONFIG_RECEBER: Record<StatusMovimentacao, StatusConfig> = {
  pago: { label: "Recebido", color: "#059669", bg: "#F0FDF4", borderColor: "#A7F3D0", icon: "✅" },
  pendente: { label: "A receber", color: "#D97706", bg: "#FFFBEB", borderColor: "#FDE68A", icon: "⏳" },
  vencido: { label: "Atrasado", color: "#DC2626", bg: "#FEF2F2", borderColor: "#FECACA", icon: "🔴" },
  cancelado: { label: "Cancelado", color: "#64748B", bg: "#F8FAFC", borderColor: "#CBD5E1", icon: "⚪" },
};

export const STATUS_CONFIG_PAGAR: Record<StatusMovimentacao, StatusConfig> = {
  pago: { label: "Pago", color: "#059669", bg: "#F0FDF4", borderColor: "#A7F3D0", icon: "✅" },
  pendente: { label: "A pagar", color: "#D97706", bg: "#FFFBEB", borderColor: "#FDE68A", icon: "⏳" },
  vencido: { label: "Vencido", color: "#DC2626", bg: "#FEF2F2", borderColor: "#FECACA", icon: "🔴" },
  cancelado: { label: "Cancelado", color: "#64748B", bg: "#F8FAFC", borderColor: "#CBD5E1", icon: "⚪" },
};

// ---- Badge de status com cor real por status --------------------------------

export function StatusBadge({
  status,
  config,
}: {
  status: StatusMovimentacao;
  config: Record<StatusMovimentacao, StatusConfig>;
}) {
  const cfg = config[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.borderColor, fontWeight: 600 }}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// ---- Chip de filtro multi-seleção (vazio = "todos") --------------------------

export function FilterChip({
  label,
  color,
  bg,
  borderColor,
  selected,
  onToggle,
}: {
  label: string;
  color: string;
  bg: string;
  borderColor: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className="inline-flex items-center gap-1 px-3 min-h-[36px] rounded-full text-xs border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#86cb92]/50 focus-visible:ring-offset-1"
      style={{
        color: selected ? color : "#627271",
        background: selected ? bg : "white",
        borderColor: selected ? borderColor : "#efefef",
        fontWeight: selected ? 600 : 500,
      }}
      onClick={onToggle}
    >
      {label}
      {selected && <X size={12} className="opacity-70" aria-hidden="true" />}
    </button>
  );
}

// ---- KPI financeiro (compacto no mobile) ------------------------------------

export function FinanceKpi({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  compact = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  compact?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border border-[#efefef] shadow-sm ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`${compact ? "w-6 h-6 rounded-md" : "w-9 h-9 rounded-xl"} flex items-center justify-center shrink-0`}
          style={{ background: iconBg }}
        >
          <Icon size={compact ? 13 : 18} style={{ color: iconColor }} />
        </div>
        <span className="text-xs text-[#627271] leading-tight">{label}</span>
      </div>
      <p
        className={`text-[#1f2937] font-bold ${compact ? "text-lg" : ""}`}
        style={compact ? undefined : { fontSize: 22, lineHeight: 1.2 }}
      >
        {value}
      </p>
    </div>
  );
}

// ---- Bottom-sheet (mobile) / dialog centralizado (desktop) ------------------

export function BottomSheet({
  open,
  onClose,
  labelledBy,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const painelRef = useRef<HTMLDivElement>(null);

  // Esc fecha + foco inicial para navegação por teclado
  useEffect(() => {
    if (!open) return undefined;

    const fecharPorEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fecharPorEsc);

    const t = window.setTimeout(() => {
      const alvo = painelRef.current?.querySelector<HTMLElement>("[data-sheet-foco]");
      (alvo ?? painelRef.current)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", fecharPorEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full ${
          wide ? "max-w-lg" : "max-w-md"
        } max-h-[92vh] overflow-y-auto overflow-x-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle do bottom-sheet (mobile) */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-[#efefef] mx-auto mb-4" />
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

// ---- Rodapé de ações do sheet: botões empilhados no mobile (primário em cima) -
export function SheetActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col-reverse sm:flex-row gap-2 mt-5">{children}</div>;
}

// Classes de botão padrão dos sheets (alvo de toque >= 44px)
export const sheetButtonPrimario =
  "sm:flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1f2937] hover:bg-[#1f2937] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-[#86cb92] disabled:hover:text-[#1f2937]";

export const sheetButtonSecundario =
  "sm:flex-1 min-h-[44px] rounded-xl border border-[#efefef] px-4 py-2.5 text-sm font-medium text-[#1f2937] hover:bg-[#efefef] transition-colors";

export const sheetButtonPerigo =
  "sm:flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50";

// ---- Campo de formulário dos sheets -----------------------------------------

export const campoFormSheet =
  "mt-1 w-full rounded-xl border border-[#efefef] bg-white px-3 py-2.5 text-sm text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#86cb92]/30 focus:border-[#86cb92]";