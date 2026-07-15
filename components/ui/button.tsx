import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-dark hover:shadow-[var(--shadow-brand)]",
        dark: "bg-ink-strong text-white hover:bg-brand",
        white: "bg-white text-ink-strong hover:bg-brand hover:text-white",
        outline: "border border-line bg-white text-ink-strong hover:border-brand hover:text-brand",
        ghost: "text-ink hover:bg-surface-soft",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[15px]",
        lg: "h-[52px] px-8 text-[17px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  /** Вимкнути rolling-text hover (для icon-only тощо). */
  noRoll?: boolean;
}

/** Rolling-text: увесь вміст «прокручується» вгору на hover, знизу заходить дубль. */
function Content({ children, roll }: { children: React.ReactNode; roll: boolean }) {
  if (!roll) return <span className="inline-flex items-center gap-2">{children}</span>;
  return (
    <span className="btn-roll">
      <span className="inline-flex items-center gap-2">{children}</span>
      <span className="inline-flex items-center justify-center gap-2">{children}</span>
    </span>
  );
}

export function Button({ className, variant, size, href, noRoll, children, ...props }: ButtonProps) {
  const roll = !noRoll && size !== "icon";
  const classes = cn(buttonVariants({ variant, size }), className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        <Content roll={roll}>{children}</Content>
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      <Content roll={roll}>{children}</Content>
    </button>
  );
}

export { buttonVariants };
