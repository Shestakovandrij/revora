"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "./dash-shell";

export function DashNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.toString() ? `${pathname}?${sp.toString()}` : pathname;

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (href.includes("?")) return current === href || (pathname === base && href.includes(sp.get("tab") ?? "###"));
    // Точний для кореня секції, префікс для решти
    return pathname === base;
  };

  return (
    <nav className="p-3 flex-1 flex flex-row lg:flex-col gap-1 overflow-x-auto no-scrollbar [mask-image:linear-gradient(to_right,#000_92%,transparent)] lg:[mask-image:none]">
      {nav.map((n) => {
        const active = isActive(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              active
                ? "bg-brand text-white shadow-[var(--shadow-brand)]"
                : "text-ink hover:bg-surface-soft"
            )}
          >
            <span className={active ? "text-white" : "text-muted"}>{n.icon}</span>
            {n.label}
            {n.badge ? (
              <span
                className={cn(
                  "ml-auto text-xs font-bold rounded-full px-2 py-0.5",
                  active ? "bg-white/20 text-white" : "bg-brand text-white"
                )}
              >
                {n.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
