import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-semibold rounded-full leading-none",
  {
    variants: {
      variant: {
        /** Verified / позитивний бренд-сигнал */
        brand: "bg-brand text-white",
        soft: "bg-brand-soft text-brand-dark",
        /** New carrier — нейтрально-позитивний */
        neutral: "bg-surface-soft text-muted border border-line",
        outline: "border border-line text-ink",
        warning: "bg-amber-50 text-amber-700",
      },
      size: {
        sm: "text-[11px] px-2 py-0.5",
        md: "text-xs px-2.5 py-1",
      },
    },
    defaultVariants: { variant: "brand", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
