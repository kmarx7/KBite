"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  IconHeart,
  IconLogin2,
  IconLogout,
  IconMail,
  IconCheck,
  IconChevronRight,
  IconUserCircle,
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
}: {
  userEmail: string | null;
}) {
  const t = useTranslations("profile");
  const ta = useTranslations("auth");
  const tp = useTranslations("policies");
  const locale = useLocale() as Language;
  const router = useRouter();
  const savedCount = useSavedIds().length;
  const [, startTransition] = useTransition();

  const handleLanguage = (lang: Language) => {
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
        {/* 계정 */}
        <SectionLabel>{t("account")}</SectionLabel>
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
            className="flex items-center gap-2.5 rounded-2xl bg-[#FF6B35] px-3.5 py-3 text-[13px] font-extrabold text-white"
          >
            <IconUserCircle size={20} />
            <span className="flex-1">{ta("loginCta")}</span>
            <IconChevronRight size={15} color="#FFE8D6" />
          </Link>
        )}

        {/* 언어 */}
        <SectionLabel>{t("language")}</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-[#FFE8D6] bg-white">
          {LOCALES.map((code, i) => {
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguage(code)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-start text-[13px] font-semibold"
                style={{
                  borderTop: i > 0 ? "1px solid #FFF5EE" : undefined,
                  color: active ? "#FF6B35" : "#1A0800",
                  backgroundColor: active ? "#FFF5EE" : undefined,
                }}
              >
                <span aria-hidden>{LANGUAGES[code].flag}</span>
                <span className="flex-1">{LANGUAGES[code].label}</span>
                {active && <IconCheck size={15} stroke={3} color="#FF6B35" />}
              </button>
            );
          })}
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

        {/* 식당 사장님 */}
        <SectionLabel>{t("forOwners")}</SectionLabel>
        <Link href="/partner" className={rowClass}>
          <IconLogin2 size={17} color="#FF6B35" />
          <span className="flex-1">{t("partnerLogin")}</span>
          <IconChevronRight size={15} color="#C0A080" />
        </Link>

        {/* 약관 및 정책 */}
        <SectionLabel>{t("legal")}</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-[#FFE8D6] bg-white">
          {(["terms", "privacy", "partner", "refund"] as const).map(
            (slug, i) => (
              <Link
                key={slug}
                href={`/policy/${slug}`}
                className="flex items-center px-3.5 py-2.5 text-[13px] font-semibold text-[#1A0800]"
                style={{
                  borderTop: i > 0 ? "1px solid #FFF5EE" : undefined,
                }}
              >
                <span className="flex-1">{tp(slug)}</span>
                <IconChevronRight size={15} color="#C0A080" />
              </Link>
            ),
          )}
        </div>

        {/* 문의 */}
        <a href={`mailto:${CONTACT_EMAIL}`} className={`${rowClass} mt-4`}>
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
