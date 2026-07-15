"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/auth";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Find a Driver", href: "/catalog" },
  { label: "Services", href: "/#services" },
  { label: "Become a Partner", href: "/register" },
  { label: "How It Works", href: "/#how" },
  { label: "FAQ", href: "/#faq" },
];

function dashHref(role?: string) {
  if (role === "ADMIN" || role === "MODERATOR") return "/admin";
  if (role === "CARRIER") return "/carrier";
  return "/account";
}

export function SiteHeader({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]) && href !== "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-line shadow-[0_6px_24px_-16px_rgba(8,8,8,.25)]"
          : "bg-white/70 backdrop-blur-md border-transparent"
      )}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[1220px] px-5 sm:px-8 flex items-center justify-between gap-4 transition-all duration-300",
          scrolled ? "h-14" : "h-[72px]"
        )}
      >
        <Logo />

        <nav className="hidden lg:flex items-center gap-1 text-[15px] font-medium">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "relative px-3.5 py-2 rounded-lg transition-colors",
                isActive(n.href) ? "text-brand" : "text-ink hover:text-brand"
              )}
            >
              {n.label}
              {isActive(n.href) && (
                <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {session ? (
            <>
              <Button href={dashHref(session.role)} variant="outline" size="sm" noRoll>
                <LayoutDashboard size={16} /> Dashboard
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm" noRoll>Log out</Button>
              </form>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm" noRoll>Log in</Button>
              <Button href="/catalog" variant="primary" size="sm">Get a Quote</Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-ink-strong"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-line bg-white"
          >
            <nav className="px-5 py-4 flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="py-3 px-3 rounded-xl hover:bg-surface-soft font-medium text-ink"
                >
                  {n.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-3">
                {session ? (
                  <>
                    <Button href={dashHref(session.role)} variant="outline" className="flex-1" noRoll>Dashboard</Button>
                    <form action={logoutAction} className="flex-1">
                      <Button type="submit" variant="ghost" className="w-full" noRoll>Log out</Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Button href="/login" variant="outline" className="flex-1" noRoll>Log in</Button>
                    <Button href="/catalog" variant="primary" className="flex-1">Get a Quote</Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
