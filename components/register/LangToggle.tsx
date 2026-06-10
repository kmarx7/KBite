"use client";

import { LANGUAGES, type Language } from "@/types";
import { LOCALES } from "@/lib/i18n/config";

interface LangToggleProps {
  value: Language[];
  onChange: (langs: Language[]) => void;
}

export default function LangToggle({ value, onChange }: LangToggleProps) {
  const toggle = (lang: Language) =>
    onChange(
      value.includes(lang)
        ? value.filter((l) => l !== lang)
        : [...value, lang],
    );

  return (
    <div className="flex flex-wrap gap-2">
      {LOCALES.map((lang) => {
        const active = value.includes(lang);
        return (
          <button
            key={lang}
            type="button"
            onClick={() => toggle(lang)}
            aria-pressed={active}
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors"
            style={
              active
                ? {
                    backgroundColor: "#FFE8D6",
                    color: "#CC4400",
                    border: "1px solid #FF6B35",
                  }
                : {
                    backgroundColor: "#FFFFFF",
                    color: "#8A6040",
                    border: "1px solid #FFD4B8",
                  }
            }
          >
            <span aria-hidden>{LANGUAGES[lang].flag}</span>
            {LANGUAGES[lang].label}
          </button>
        );
      })}
    </div>
  );
}
