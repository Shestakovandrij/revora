import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Cold-start правило: ніколи не рендерити "0.0 ★".
 * null/мало відгуків → бейдж New; ≥1 відгук → зірки+число.
 */
export function RatingDisplay({
  avgRating,
  reviewCount,
  size = "md",
  className,
}: {
  avgRating: number | null;
  reviewCount: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const isNew = avgRating == null || reviewCount === 0;

  if (isNew) {
    return (
      <Badge variant="neutral" size={size === "sm" ? "sm" : "md"} className={className}>
        New
      </Badge>
    );
  }

  const star = size === "lg" ? 18 : size === "sm" ? 13 : 15;
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star size={star} className="fill-brand text-brand" />
      <span className={cn("font-bold text-ink-strong", size === "lg" ? "text-lg" : "text-sm")}>
        {avgRating.toFixed(1)}
      </span>
      <span className="text-muted text-xs">({reviewCount})</span>
    </span>
  );
}

export function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "fill-brand text-brand" : "text-line"}
        />
      ))}
    </span>
  );
}
