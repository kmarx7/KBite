"use client";

import { useState } from "react";
import { IconClock, IconChevronDown } from "@tabler/icons-react";

/* 30분 간격 00:00 ~ 23:30 */
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

interface DateTimeButtonProps {
  label: string;
  /** "HH:MM" 또는 null */
  value: string | null;
  onChange: (time: string) => void;
}

/** 커스텀 시간 선택 버튼 — input type="date"/"time" 사용 금지 스펙 대응 */
export default function DateTimeButton({
  label,
  value,
  onChange,
}: DateTimeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-w-0">
      <p className="mb-1 text-[11px] font-bold text-[#8A6040]">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-[13px] font-semibold"
        style={{ color: value ? "#1A0800" : "#C0A080" }}
      >
        <IconClock size={15} color="#FF6B35" />
        <span className="flex-1 text-start">{value ?? "--:--"}</span>
        <IconChevronDown size={13} color="#B07040" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="listbox"
            className="absolute z-50 mt-1 grid max-h-48 w-full grid-cols-2 gap-1 overflow-y-auto rounded-xl border border-[#FFE8D6] bg-white p-2 shadow-xl"
          >
            {TIME_OPTIONS.map((time) => {
              const active = time === value;
              return (
                <button
                  key={time}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(time);
                    setOpen(false);
                  }}
                  className="rounded-lg py-1.5 text-[12px] font-semibold transition-colors"
                  style={
                    active
                      ? { backgroundColor: "#FF6B35", color: "#FFFFFF" }
                      : { color: "#8A6040" }
                  }
                >
                  {time}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
