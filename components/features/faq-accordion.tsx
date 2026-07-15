"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  // Один відкритий елемент; відкриття наступного закриває попередній.
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className={`rounded-[18px] border bg-white shadow-[var(--shadow-whisper)] transition-colors ${
              isOpen ? "border-brand/40" : "border-line"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold text-ink-strong"
            >
              {f.q}
              <span
                className={`grid place-items-center w-7 h-7 shrink-0 rounded-full transition-all duration-300 ${
                  isOpen ? "bg-brand text-white rotate-45" : "bg-brand-soft text-brand"
                }`}
              >
                <Plus size={16} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ height: { duration: 0.4, ease: EASE }, opacity: { duration: 0.25 } }}
                  className="overflow-hidden"
                >
                  <p className="text-muted text-[15px] leading-relaxed px-5 pb-5 -mt-1">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
