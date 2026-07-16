"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CatalogFilters } from "./catalog-filters";

/**
 * Мобільна панель фільтрів каталогу: кнопка «Filters» відкриває slide-over.
 * На десктопі фільтри показуються у сайдбарі окремо (цей компонент — lg:hidden).
 */
export function MobileFilters() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-12 rounded-xl border border-line bg-white text-ink-strong font-medium inline-flex items-center justify-center gap-2 hover:border-brand transition-colors"
      >
        <SlidersHorizontal size={17} /> Filters
      </button>

      {/* Overlay + slide-over (лишається змонтованим — зберігає стан форми) */}
      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[90%] max-w-sm bg-white shadow-[var(--shadow-lift)] overflow-y-auto transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-end px-3 py-3 bg-white/95 backdrop-blur border-b border-line">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="w-9 h-9 grid place-items-center rounded-lg text-muted hover:bg-surface-soft hover:text-ink-strong transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-5 pb-8">
            <CatalogFilters onApplied={() => setOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
