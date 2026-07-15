import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const COLS = [
  {
    title: "Services",
    links: [
      ["House Removals", "/catalog?service=HOUSE_REMOVALS"],
      ["Man & Van", "/catalog?service=FURNITURE_DELIVERY"],
      ["Office Relocations", "/catalog?service=OFFICE_RELOCATIONS"],
      ["European Transport", "/catalog?service=EUROPEAN_TRANSPORT"],
      ["Waste Removal", "/catalog?service=WASTE_REMOVAL"],
    ],
  },
  {
    title: "Popular routes",
    links: [
      ["London", "/catalog?from=London"],
      ["Manchester", "/catalog?from=Manchester"],
      ["UK to France", "/catalog?to=France"],
      ["UK to Poland", "/catalog?to=Poland"],
      ["UK to Germany", "/catalog?to=Germany"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Become a Partner", "/register"],
      ["How It Works", "/#how"],
      ["FAQ", "/#faq"],
      ["Log in", "/login"],
    ],
  },
];

const LEGAL = [
  "Privacy Policy",
  "Terms & Conditions",
  "Cancellation Policy",
  "Cookie Policy",
  "Carrier Terms",
  "Insurance Information",
];

export function SiteFooter() {
  return (
    <footer className="relative bg-ink-strong text-white/65 mt-24 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand/10 blur-[120px]" />
      <div className="relative mx-auto w-full max-w-[1220px] px-5 sm:px-8 pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="max-w-xs">
            <Logo mono />
            <p className="text-[15px] mt-5 text-white/55 leading-relaxed">
              The UK marketplace to compare and book verified movers. No upfront payment —
              you pay your driver directly.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-semibold text-[13px] uppercase tracking-wide mb-5">{col.title}</h3>
              <ul className="space-y-3 text-[15px]">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="inline-flex items-center gap-1 text-white/65 hover:text-brand-bright transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-7 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-white/45">© {new Date().getFullYear()} REVORA MOVE. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center text-[13px]">
            {LEGAL.map((l) => (
              <Link key={l} href="#" className="text-white/45 hover:text-brand-bright transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
