"use client";

import { useTranslations } from "next-intl";
import { CATEGORIES, type Category } from "@/types";

interface CategoryGridProps {
  value: Category | null;
  onChange: (cat: Category) => void;
}

export default function CategoryGrid({ value, onChange }: CategoryGridProps) {
  const t = useTranslations("categories");

  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(CATEGORIES) as Category[]).map((cat) => {
        const selected = value === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={selected}
            className="flex min-w-0 flex-col items-center gap-1 rounded-2xl p-3 transition-colors"
            style={
              selected
                ? {
                    backgroundColor: "#FFE8D6",
                    border: `2px solid ${CATEGORIES[cat].color}`,
                  }
                : { backgroundColor: "#FFFFFF", border: "2px solid #FFE8D6" }
            }
          >
            <span className="text-xl" aria-hidden>
              {CATEGORIES[cat].emoji}
            </span>
            <span
              className="w-full truncate text-center text-[10px] font-bold"
              style={{ color: selected ? "#CC4400" : "#8A6040" }}
            >
              {t(cat)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
