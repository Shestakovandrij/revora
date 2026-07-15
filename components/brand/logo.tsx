import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-bold text-lg tracking-tight", className)}>
      <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 13h11V7H3v6Zm0 0v4h2m9-4h3l4 3v1h-2m-5 0H9m-4 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m6 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={mono ? "text-white" : "text-ink-strong"}>
        REVORA <span className="text-brand-dark">MOVE</span>
      </span>
    </Link>
  );
}
