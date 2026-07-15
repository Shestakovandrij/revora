"use client";

import { useEffect, useRef, useState } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { StarRow } from "@/components/features/rating";

export type ReviewCard = {
  id: string;
  overall: number;
  text: string | null;
  authorName: string;
  carrierName: string;
};

export function ReviewsCarousel({ reviews }: { reviews: ReviewCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const recompute = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const p = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
    setPages(Number.isFinite(p) ? p : 1);
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    recompute();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => setPage(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", recompute);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews.length]);

  const go = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const goTo = (p: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: p * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
      >
        {reviews.map((r) => (
          <article
            key={r.id}
            className="snap-start shrink-0 basis-full sm:basis-[calc(50%-10px)] lg:basis-[calc(33.333%-14px)] rounded-[18px] border border-line bg-white p-6 shadow-[var(--shadow-whisper)]"
          >
            <div className="flex items-center justify-between">
              <Quote className="text-brand" size={22} />
              <StarRow value={r.overall} />
            </div>
            <p className="text-ink mt-4 text-[15px] leading-relaxed line-clamp-5">“{r.text}”</p>
            <div className="mt-5 pt-5 border-t border-line flex items-center gap-3">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-brand-soft text-brand font-semibold text-sm shrink-0">
                {r.authorName.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-strong truncate">{r.authorName}</p>
                <p className="text-xs text-muted truncate">{r.carrierName}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={page <= 0}
          aria-label="Previous reviews"
          className="grid place-items-center w-11 h-11 rounded-full border border-line bg-white text-ink-strong transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === page ? "w-6 bg-brand" : "w-2 bg-line hover:bg-brand/40"}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={page >= pages - 1}
          aria-label="Next reviews"
          className="grid place-items-center w-11 h-11 rounded-full border border-line bg-white text-ink-strong transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
