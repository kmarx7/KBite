"use client";

import { CATEGORIES, type Category } from "@/types";

interface ChipProps {
  cat: "all" | Category;
  label: string;
  emoji: string;
  selected: boolean;
  onClick: () => void;
}

export default function CategoryChip({
  cat,
  label,
  emoji,
  selected,
  onClick,
}: ChipProps) {
  const onColor = cat === "all" ? "#FF6B35" : CATEGORIES[cat].color;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-[13px] font-bold shadow-sm transition-all duration-200"
      style={
        selected
          ? { backgroundColor: onColor, color: "#FFFFFF" }
          : {
              backgroundColor: "rgba(255,255,255,0.92)",
              color: "#8A6040",
              border: "1px solid #FFD4B8",
            }
      }
    >
      <span aria-hidden>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
