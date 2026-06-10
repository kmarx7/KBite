"use client";

import { LANGUAGES, type Language } from "@/types";
import { LOCALES } from "@/lib/i18n/config";
import { IconCheck } from "@tabler/icons-react";

interface LanguageDropdownProps {
  currentLang: Language;
  onSelect: (lang: Language) => void;
  onClose: () => void;
}

export default function LanguageDropdown({
  currentLang,
  onSelect,
  onClose,
}: LanguageDropdownProps) {
  return (
    <>
      {/* 배경 딤 */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="listbox"
        aria-label="Language"
        className="absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-[#FFE8D6] bg-white shadow-xl"
      >
        {LOCALES.map((code) => {
          const lang = LANGUAGES[code];
          const active = code === currentLang;
          return (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onSelect(code)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-start text-[13px] font-semibold transition-colors hover:bg-[#FFF5EE]"
              style={{
                color: active ? "#FF6B35" : "#1A0800",
                backgroundColor: active ? "#FFE8D6" : undefined,
              }}
            >
              <span aria-hidden>{lang.flag}</span>
              <span className="flex-1">{lang.label}</span>
              {active && <IconCheck size={14} stroke={3} />}
            </button>
          );
        })}
      </div>
    </>
  );
}
