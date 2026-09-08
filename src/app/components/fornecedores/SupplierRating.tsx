import { Star } from "lucide-react";

interface SupplierRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  reviewCount?: number;
}

export function SupplierRating({
  value,
  onChange,
  readonly = false,
  showValue = false,
  size = "md",
}: SupplierRatingProps) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
            aria-label={`Avaliar ${star} estrelas`}
          >
            <Star
              className={`${sizeClasses[size]} ${filled ? "fill-amber-400 text-amber-400" : "text-[#627271]"}`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-[#1f2937]">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
