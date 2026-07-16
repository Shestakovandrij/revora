"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/*
  Продуманий горизонтальний слайдер карток (за референсом Haul):
  — snap-scroll із peek наступної картки,
  — drag вказівником (pointer) з подавленням «фантомного» кліку,
  — стрілки prev/next із disabled на краях,
  — прогрес-бар знизу.
  Діти рендеряться на сервері й передаються як children (кожна — з data-slide).
  Reduced-motion шанується глобально (globals.css).
*/
export function CardSlider({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = el.scrollLeft;
    setProgress(max > 0 ? x / max : 0);
    setAtStart(x <= 2);
    setAtEnd(x >= max - 2);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-slide]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // Drag-to-scroll
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const onDown = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  };
  const onUp = () => {
    drag.current.down = false;
  };

  return (
    <div className={className}>
      <div
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory pb-1 cursor-grab active:cursor-grabbing select-none touch-pan-y"
      >
        {children}
      </div>

      {/* Controls */}
      <div className="mt-7 flex items-center gap-5">
        <div className="h-1 flex-1 rounded-full bg-line overflow-hidden">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-200"
            style={{ width: `${Math.max(14, progress * 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            disabled={atStart}
            aria-label="Previous"
            className="grid place-items-center w-11 h-11 rounded-full border border-line bg-white text-ink-strong transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:pointer-events-none"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            disabled={atEnd}
            aria-label="Next"
            className="grid place-items-center w-11 h-11 rounded-full border border-line bg-white text-ink-strong transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:pointer-events-none"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
