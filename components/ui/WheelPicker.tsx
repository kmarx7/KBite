"use client";

import { useEffect, useRef, useState } from "react";

const ITEM_H = 44;
const DEFAULT_VISIBLE = 5;

interface WheelPickerProps {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  label?: string;
  visibleCount?: number;
}

export default function WheelPicker({
  items,
  selectedIndex,
  onChange,
  label,
  visibleCount = DEFAULT_VISIBLE,
}: WheelPickerProps) {
  const VISIBLE = visibleCount;
  const SIDE = Math.floor(VISIBLE / 2);
  const ref = useRef<HTMLDivElement>(null);
  const programmatic = useRef(false);
  const lastEmitted = useRef(selectedIndex);
  const [displayIdx, setDisplayIdx] = useState(selectedIndex);

  // Mount: set initial scroll without animation
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = selectedIndex * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // selectedIndex prop change: programmatic scroll
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const el = ref.current;
    if (!el) return;
    programmatic.current = true;
    el.scrollTo({ top: selectedIndex * ITEM_H, behavior: "smooth" });
    lastEmitted.current = selectedIndex;
    const t = setTimeout(() => { programmatic.current = false; }, 500);
    return () => clearTimeout(t);
  }, [selectedIndex]);

  // Scroll listener with debounce
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
      setDisplayIdx(idx);
      if (programmatic.current) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (programmatic.current) return;
        if (idx !== lastEmitted.current) {
          lastEmitted.current = idx;
          onChange(idx);
        }
      }, 120);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [items.length, onChange]);

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wide text-[#B07040]">
          {label}
        </span>
      )}
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-[#FFF5EE]"
        style={{ height: ITEM_H * VISIBLE }}
      >
        {/* Center highlight bar */}
        <div
          className="pointer-events-none absolute inset-x-2 z-10 rounded-xl border-2 border-[#FFB899] bg-[#FFE8D6]"
          style={{ top: ITEM_H * SIDE, height: ITEM_H }}
        />
        {/* Top fade */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20"
          style={{
            height: ITEM_H * SIDE,
            background: "linear-gradient(to bottom, #FFF5EE 20%, transparent)",
          }}
        />
        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
          style={{
            height: ITEM_H * SIDE,
            background: "linear-gradient(to top, #FFF5EE 20%, transparent)",
          }}
        />
        {/* Scrollable list */}
        <div
          ref={ref}
          className="absolute inset-0 overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "y mandatory", scrollPaddingTop: `${ITEM_H * SIDE}px` }}
        >
          <div style={{ height: ITEM_H * SIDE }} aria-hidden />
          {items.map((item, i) => (
            <div
              key={i}
              style={{ height: ITEM_H, scrollSnapAlign: "start" }}
              className={`flex items-center justify-center text-[13px] font-bold transition-colors ${
                i === displayIdx ? "text-[#FF6B35]" : "text-[#8A6040]/70"
              }`}
            >
              {item}
            </div>
          ))}
          <div style={{ height: ITEM_H * SIDE }} aria-hidden />
        </div>
      </div>
    </div>
  );
}
