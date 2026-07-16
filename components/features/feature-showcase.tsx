"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

/*
  Interactive spotlight showcase (синтез прийомів Haul: image-led презентація +
  великі індекс-цифри + стрілки + accordion на мобільному).
  — Desktop: липка візуальна панель ліворуч оновлюється при наведенні на рядок списку.
  — Mobile: панель прихована, активний рядок розкриває фото+опис інлайн (accordion).
  Reduced-motion шанується глобально (globals.css).
*/

const EASE = [0.22, 1, 0.36, 1] as const;

export type ShowcaseItem = {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  image: string;
  tag?: string;
};

export function FeatureShowcase({ items }: { items: ShowcaseItem[] }) {
  const [active, setActive] = useState(0);
  const cur = items[active];

  return (
    <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-8 lg:gap-14 items-start">
      {/* ── Sticky visual panel (desktop) ── */}
      <div className="hidden lg:block lg:sticky lg:top-28">
        <div className="relative h-[480px] rounded-[28px] overflow-hidden border border-ink-strong bg-ink-strong text-white">
          <AnimatePresence>
            <motion.div
              key={cur.image}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cur.image} alt="" className="h-full w-full object-cover opacity-30" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-strong via-ink-strong/80 to-ink-strong/40" />
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand/30 blur-[80px]" />
          <div className="bg-grid absolute inset-0 opacity-[0.08]" />

          <div className="relative h-full p-9 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/10 text-brand-bright backdrop-blur-sm [&_svg]:w-7 [&_svg]:h-7">
                {cur.icon}
              </span>
              <span className="font-[family-name:var(--font-display)] text-[64px] font-semibold text-white/12 leading-none">
                {String(active + 1).padStart(2, "0")}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {cur.tag && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 mb-4">
                    {cur.tag}
                  </span>
                )}
                <h3 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-white leading-tight tracking-tight">
                  {cur.title}
                </h3>
                {cur.desc && <p className="text-white/65 mt-3 text-[15px] leading-relaxed max-w-md">{cur.desc}</p>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Interactive list ── */}
      <div className="border-t border-line">
        {items.map((it, i) => {
          const on = i === active;
          return (
            <div key={it.title} className="border-b border-line">
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-expanded={on}
                className="group relative w-full text-left flex items-center gap-4 sm:gap-5 py-5 sm:py-6"
              >
                {/* left accent bar */}
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-brand transition-all duration-300 ${on ? "h-8 opacity-100" : "h-0 opacity-0"}`} />

                <span className={`font-[family-name:var(--font-display)] text-sm font-semibold w-7 shrink-0 pl-3 transition-colors ${on ? "text-brand" : "text-muted/50"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className={`grid place-items-center w-11 h-11 rounded-xl shrink-0 transition-colors [&_svg]:w-5 [&_svg]:h-5 ${on ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}>
                  {it.icon}
                </span>

                <span className={`flex-1 font-semibold text-[16px] sm:text-[17px] leading-snug transition-colors ${on ? "text-ink-strong" : "text-ink"}`}>
                  {it.title}
                </span>

                <span className={`grid place-items-center w-9 h-9 rounded-full shrink-0 transition-all duration-300 ${on ? "bg-ink-strong text-white" : "bg-surface-soft text-muted group-hover:text-brand"}`}>
                  <ArrowUpRight size={18} />
                </span>
              </button>

              {/* Mobile inline reveal */}
              <div className="lg:hidden">
                <AnimatePresence initial={false}>
                  {on && (it.desc || it.image) && (
                    <motion.div
                      key="m"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ height: { duration: 0.4, ease: EASE }, opacity: { duration: 0.25 } }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6">
                        <div className="relative rounded-[18px] overflow-hidden border border-line aspect-[16/10]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.image} alt="" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink-strong/75 via-ink-strong/20 to-transparent" />
                          {it.tag && (
                            <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] text-white/85 backdrop-blur-sm">
                              {it.tag}
                            </span>
                          )}
                        </div>
                        {it.desc && <p className="text-muted text-[15px] leading-relaxed mt-3">{it.desc}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
