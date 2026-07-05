"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  IconHeart,
  IconLogout,
  IconMail,
  IconChevronDown,
  IconChevronRight,
  IconUserCircle,
  IconBuildingStore,
  IconScale,
} from "@tabler/icons-react";
import { LANGUAGES, type Language } from "@/types";
import { LOCALES } from "@/lib/i18n/config";
import { setLocale } from "@/app/actions/locale";
import { consumerLogout } from "@/app/actions/account";
import { TRACK_EVENTS, track } from "@/lib/analytics";
import { useSavedIds } from "@/lib/saved";
import TabBar from "@/components/ui/TabBar";

const CONTACT_EMAIL = "marx21c@gmail.com";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 mt-4 text-[12px] font-bold text-[#8A6040]">
      {children}
    </p>
  );
}

const rowClass =
  "flex w-full items-center gap-2.5 rounded-2xl border border-[#FFE8D6] bg-white px-3.5 py-3 text-[13px] font-bold text-[#1A0800]";

export default function ProfileScreen({
  userEmail,
  ownedCount,
}: {
  userEmail: string | null;
  ownedCount: number;
}) {
  const t = useTranslations("profile");
  const ta = useTranslations("auth");
  const locale = useLocale() as Language;
  const router = useRouter();
  const savedCount = useSavedIds().length;
  const [langOpen, setLangOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleLanguage = (lang: Language) => {
    setLangOpen(false);
    if (lang === locale) return;
    track(TRACK_EVENTS.LANGUAGE_CHANGED, { from: locale, to: lang });
    startTransition(async () => {
      await setLocale(lang);
      router.refresh();
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await consumerLogout();
      router.refresh();
    });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="z-30 flex items-center border-b border-[#FFE8D6] bg-[#FFFAF5] px-4 py-2.5">
        <h1 className="text-[19px] font-extrabold text-[#1A0800]">
          {t("title")}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        {/* 계정 — 소비자·사장님 두 입구를 한 화면에서 구분 */}
        <SectionLabel>{t("account")}</SectionLabel>
        <div className="flex flex-col gap-2">
          {userEmail ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-[#FFE8D6] bg-white px-3.5 py-3">
              <IconUserCircle size={20} color="#FF6B35" className="shrink-0" />
              <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#1A0800]">
                {userEmail}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex shrink-0 items-center gap-1 rounded-full border border-[#FFD4B8] px-2.5 py-1 text-[11px] font-bold text-[#8A6040]"
              >
                <IconLogout size={12} />
                {ta("logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2.5 rounded-2xl bg-[#FF6B35] px-3.5 py-3 text-white"
            >
              <IconUserCircle size={22} className="shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-extrabold">
                  {t("accountDiner")}
                </span>
                <span className="block text-[11px] font-semibold text-[#FFE8D6]">
                  {ta("loginCta")}
                </span>
              </span>
              <IconChevronRight size={15} color="#FFE8D6" />
            </Link>
          )}

          {/* 사장님 입구 — 소유 식당 유무에 따라 문구 전환 */}
          <Link
            href="/partner"
            className="flex items-center gap-2.5 rounded-2xl border-2 border-[#FFD4B8] bg-white px-3.5 py-3"
          >
            <IconBuildingStore size={22} color="#CC4400" className="shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-extrabold text-[#1A0800]">
                {ownedCount > 0
                  ? t("accountOwnerManage", { count: ownedCount })
                  : t("accountOwner")}
              </span>
              <span className="block text-[11px] font-semibold text-[#8A6040]">
                {t("accountOwnerDesc")}
              </span>
            </span>
            <IconChevronRight size={15} color="#C0A080" />
          </Link>
        </div>

        {/* 언어 — 접힘: 현재 언어만, 탭하면 펼침 */}
        <SectionLabel>{t("language")}</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-[#FFE8D6] bg-white">
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-expanded={langOpen}
            className="flex w-full items-center gap-2.5 px-3.5 py-3 text-start text-[13px] font-bold text-[#1A0800]"
          >
            <span aria-hidden>{LANGUAGES[locale].flag}</span>
            <span className="flex-1">{LANGUAGES[locale].label}</span>
            <IconChevronDown
              size={15}
              color="#C0A080"
              className={`transition-transform ${langOpen ? "rotate-180" : ""}`}
            />
          </button>
          {langOpen &&
            LOCALES.filter((code) => code !== locale).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguage(code)}
                className="flex w-full items-center gap-2.5 border-t border-[#FFF5EE] px-3.5 py-2.5 text-start text-[13px] font-semibold text-[#1A0800]"
              >
                <span aria-hidden>{LANGUAGES[code].flag}</span>
                <span className="flex-1">{LANGUAGES[code].label}</span>
              </button>
            ))}
        </div>

        {/* 내 활동 */}
        <SectionLabel>{t("myActivity")}</SectionLabel>
        <Link href="/saved" className={rowClass}>
          <IconHeart size={17} color="#FF6B35" />
          <span className="flex-1">{t("savedRow")}</span>
          {savedCount > 0 && (
            <span className="rounded-full bg-[#FFE8D6] px-2 py-0.5 text-[11px] font-extrabold text-[#CC4400]">
              {savedCount}
            </span>
          )}
          <IconChevronRight size={15} color="#C0A080" />
        </Link>

        {/* 약관 및 정책 — 상시 접근(법적 요건)은 한 줄로 유지 */}
        <Link href="/policy" className={`${rowClass} mt-4`}>
          <IconScale size={17} color="#FF6B35" />
          <span className="flex-1">{t("legal")}</span>
          <IconChevronRight size={15} color="#C0A080" />
        </Link>

        {/* 문의 */}
        <a href={`mailto:${CONTACT_EMAIL}`} className={`${rowClass} mt-2`}>
          <IconMail size={17} color="#FF6B35" />
          <span className="flex-1">{t("contact")}</span>
          <IconChevronRight size={15} color="#C0A080" />
        </a>

        <p className="mt-6 text-center text-[10px] font-semibold text-[#C0A080]">
          KBite v0.1.0 · Find Your Home Food in Korea
        </p>
      </main>

      <TabBar active="profile" />
    </div>
  );
}
