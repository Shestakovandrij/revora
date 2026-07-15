import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(auth)/actions";
import { DashNav } from "./dash-nav";
import type { Session } from "@/lib/auth";

export type NavItem = { label: string; href: string; icon: React.ReactNode; badge?: number };

export function DashShell({
  session,
  nav,
  title,
  children,
}: {
  session: Session;
  nav: NavItem[];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-soft">
      {/* Sidebar */}
      <aside className="lg:w-64 lg:shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-line lg:min-h-screen flex flex-col">
        <div className="p-5 border-b border-line">
          <Logo />
        </div>
        <DashNav nav={nav} />
        <div className="p-3 border-t border-line hidden lg:block">
          <p className="text-xs text-muted px-3 mb-2 truncate">{session.email}</p>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm" className="w-full">Log out</Button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-line px-5 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold text-ink-strong">{title}</h1>
          <div className="flex items-center gap-3">
            <Button href="/" variant="ghost" size="sm">View site</Button>
          </div>
        </header>
        <main className="p-5 lg:p-8 max-w-[1400px] mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
