"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { IconChevronDown } from "@tabler/icons-react";
import { LANGUAGES, type Language } from "@/types";
import { setLocale } from "@/app/actions/locale";
import LanguageDropdown from "./LanguageDropdown";

/** 헤더 우측 언어 버튼 — 선택 즉시 새로고침 없이 전체 텍스트 전환 */
export default function LanguageButton() {
  const locale = useLocale() as Language;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleSelect = (lang: Language) => {
    setOpen(false);
    if (lang === locale) return;
    startTransition(async () => {
      await setLocale(lang);
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-full border border-[#FFD4B8] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#1A0800] shadow-sm"
      >
        <span aria-hidden>{LANGUAGES[locale].flag}</span>
        <span>{locale.toUpperCase()}</span>
        <IconChevronDown size={12} stroke={3} color="#B07040" />
      </button>
      {open && (
        <LanguageDropdown
          currentLang={locale}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
