import melPortrait from "@/assets/78ea19d3f884e1598dfb94e5cc05dab06dd59ad2.png";
import { ArrowRight } from "lucide-react";

interface MelissaCardProps {
  msg: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/** Card escuro da Melissa — padrão do dashboard (redesenho estoque v2). */
export function MelissaCard({
  msg,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: MelissaCardProps) {
  return (
    <div className="eq2-mel">
      <div className="eq2-mel__glow" />
      <div className="eq2-mel__head">
        <img src={melPortrait} alt="Melissa" className="eq2-mel__avatar" />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="eq2-mel__name">Melissa</span>
            <span className="eq2-mel__dot" />
          </div>
          <p className="eq2-mel__status">IA Proativa — Online</p>
        </div>
      </div>
      <div className="eq2-mel__bubble">{msg}</div>
      {(actionLabel || secondaryLabel) && (
        <div className="eq2-mel__actions">
          {secondaryLabel && (
            <button type="button" className="eq2-mel__action eq2-mel__action--ghost" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          )}
          {actionLabel && (
            <button type="button" className="eq2-mel__action" onClick={onAction}>
              {actionLabel} <ArrowRight size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
