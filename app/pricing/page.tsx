import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IconCheck, IconMinus, IconChevronLeft } from "@tabler/icons-react";
import { PLAN_PRICES } from "@/lib/features";
import TrackOnMount from "@/components/analytics/TrackOnMount";
import { TRACK_EVENTS } from "@/lib/analytics";
import type { Plan } from "@/types";

const PLAN_CTA_HREF: Record<Plan, string> = {
  free: "/register",
  basic: "/partner/login",
  premium: "/partner/login",
};

const PLAN_COLOR: Record<Plan, { bg: string; text: string; border: string; btnBg: string }> = {
  free:    { bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB", btnBg: "#6B7280" },
  basic:   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", btnBg: "#1D4ED8" },
  premium: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", btnBg: "#FF6B35" },
};

const featureRows = [
  { labelKey: "featMaxPhotos" as const, values: { free: "1", basic: "5", premium: "20" } },
  { labelKey: "featSearchBoost" as const, values: { free: false, basic: true, premium: "×2" } },
  { labelKey: "featMenu" as const, values: { free: false, basic: true, premium: true } },
  { labelKey: "featReply" as const, values: { free: false, basic: true, premium: true } },
  { labelKey: "featAnalytics" as const, values: { free: false, basic: false, premium: true } },
  { labelKey: "featBadge" as const, values: { free: false, basic: false, premium: true } },
] as const;

const plans: Plan[] = ["free", "basic", "premium"];

export default async function PricingPage() {
  const t = await getTranslations("pricing");
  const tp = await getTranslations("partner");

  return (
    <div className="min-h-dvh bg-[#F5EDE0]">
      <TrackOnMount event={TRACK_EVENTS.PREMIUM_VIEW} properties={{}} />

      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5] px-3 py-2">
        <Link href="/" aria-label="Back">
          <IconChevronLeft size={18} color="#8A6040" />
        </Link>
        <span className="text-[15px] font-extrabold text-[#FF6B35]">KBite</span>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-[24px] font-extrabold text-[#1A0800]">{t("title")}</h1>
          <p className="mt-2 text-[13px] text-[#8A6040]">{t("subtitle")}</p>
        </div>

        {/* 플랜 카드 3개 */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {plans.map((plan) => {
            const c = PLAN_COLOR[plan];
            const isBasic = plan === "basic";
            return (
              <div
                key={plan}
                className="flex flex-col rounded-2xl border p-4"
                style={{ backgroundColor: c.bg, borderColor: c.border }}
              >
                {isBasic && (
                  <span className="mb-2 self-start rounded-full bg-[#FF6B35] px-2 py-0.5 text-[10px] font-extrabold text-white">
                    {t("mostPopular")}
                  </span>
                )}
                <p className="text-[18px] font-extrabold" style={{ color: c.text }}>
                  {tp(("plan" + plan.charAt(0).toUpperCase() + plan.slice(1)) as Parameters<typeof tp>[0])}
                </p>
                <p className="mt-0.5 text-[11px] text-[#8A6040]">
                  {plan === "free"
                    ? "₩0"
                    : `₩${PLAN_PRICES[plan as Exclude<Plan, "free">].toLocaleString()}${tp("planPerMonth")}`}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-[#8A6040]">
                  {t((`${plan}Desc`) as Parameters<typeof t>[0])}
                </p>
                <Link
                  href={PLAN_CTA_HREF[plan]}
                  className="mt-4 flex items-center justify-center rounded-xl py-2 text-[12px] font-extrabold text-white"
                  style={{ backgroundColor: c.btnBg }}
                >
                  {plan === "free"
                    ? t("getStarted")
                    : plan === "basic"
                      ? t("upgradeBasic")
                      : t("upgradePremium")}
                </Link>
              </div>
            );
          })}
        </div>

        {/* 기능 비교표 */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#FFE8D6] bg-white">
          {/* 헤더 행 */}
          <div className="grid grid-cols-4 border-b border-[#FFE8D6]">
            <div className="p-3" />
            {plans.map((plan) => (
              <div key={plan} className="border-l border-[#FFE8D6] p-3 text-center">
                <p
                  className="text-[11px] font-extrabold"
                  style={{ color: PLAN_COLOR[plan].text }}
                >
                  {tp(("plan" + plan.charAt(0).toUpperCase() + plan.slice(1)) as Parameters<typeof tp>[0])}
                </p>
              </div>
            ))}
          </div>

          {featureRows.map(({ labelKey, values }) => (
            <div
              key={labelKey}
              className="grid grid-cols-4 border-b border-[#FFE8D6] last:border-b-0"
            >
              <div className="p-3 text-[11px] font-bold text-[#8A6040]">
                {tp(labelKey)}
              </div>
              {plans.map((plan) => {
                const val = values[plan];
                return (
                  <div
                    key={plan}
                    className="flex items-center justify-center border-l border-[#FFE8D6] p-3"
                  >
                    {typeof val === "string" ? (
                      <span className="text-[12px] font-bold text-[#1A0800]">{val}</span>
                    ) : val ? (
                      <IconCheck size={14} color="#15803D" stroke={2.5} />
                    ) : (
                      <IconMinus size={14} color="#D1D5DB" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="mb-3 text-[16px] font-extrabold text-[#1A0800]">{t("faqTitle")}</h2>
          <div className="flex flex-col gap-3">
            {(["1", "2"] as const).map((n) => (
              <div key={n} className="rounded-2xl border border-[#FFE8D6] bg-white p-4">
                <p className="text-[13px] font-extrabold text-[#1A0800]">
                  {t((`faq${n}Q`) as Parameters<typeof t>[0])}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#8A6040]">
                  {t((`faq${n}A`) as Parameters<typeof t>[0])}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA 버튼 2개 */}
        <div className="flex flex-col gap-2">
          <Link
            href="/register"
            className="flex items-center justify-center rounded-2xl py-3 text-[14px] font-extrabold text-white"
            style={{ backgroundColor: "#FF6B35" }}
          >
            {t("ctaPartner")}
          </Link>
          <Link
            href="/partner/login"
            className="flex items-center justify-center rounded-2xl border border-[#FFD4B8] bg-white py-3 text-[14px] font-extrabold text-[#CC4400]"
          >
            {t("ctaLogin")}
          </Link>
        </div>
      </main>
    </div>
  );
}
