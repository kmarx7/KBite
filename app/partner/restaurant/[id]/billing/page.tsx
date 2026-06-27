import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { IconChevronLeft, IconCheck, IconMinus } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/types";
import { PLAN_FEATURES, PLAN_PRICES } from "@/lib/features";
import BillingUpgradeButton from "@/components/partner/BillingUpgradeButton";
import CancelSubscriptionButton from "@/components/partner/CancelSubscriptionButton";

export const dynamic = "force-dynamic";

interface PaymentRow {
  id: string;
  amount: number;
  status: "success" | "failed";
  paid_at: string | null;
  created_at: string;
}

const PLAN_COLOR: Record<Plan, { bg: string; text: string; border: string }> = {
  free: { bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },
  basic: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  premium: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
};

export default async function PartnerBillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/partner/login");

  const t = await getTranslations("partner");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, plan")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!restaurant) notFound();

  const currentPlan = (restaurant.plan as Plan) ?? "free";

  /* 결제 내역 — subscriptions 마이그레이션 적용 후 조회 */
  let payments: PaymentRow[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("payment_history")
      .select("id, amount, status, paid_at, created_at")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false })
      .limit(20);
    payments = (data ?? []) as PaymentRow[];
  } catch {
    /* subscriptions 마이그레이션 미적용 — 빈 목록 */
  }

  const planOrder: Plan[] = ["free", "basic", "premium"];
  const planLabels: Record<Plan, string> = {
    free: t("planFree"),
    basic: t("planBasic"),
    premium: t("planPremium"),
  };

  const featureRows = [
    {
      key: "featMaxPhotos",
      values: {
        free: `${PLAN_FEATURES.free.maxPhotos}`,
        basic: `${PLAN_FEATURES.basic.maxPhotos}`,
        premium: `${PLAN_FEATURES.premium.maxPhotos}`,
      },
    },
    {
      key: "featSearchBoost",
      values: {
        free: false,
        basic: true,
        premium: "×2",
      },
    },
    { key: "featMenu", values: { free: false, basic: true, premium: true } },
    { key: "featReply", values: { free: false, basic: true, premium: true } },
    {
      key: "featAnalytics",
      values: { free: false, basic: false, premium: true },
    },
    {
      key: "featBadge",
      values: { free: false, basic: false, premium: true },
    },
  ] as const;

  return (
    <div className="min-h-dvh bg-[#F5EDE0]">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5] px-3 py-2">
        <Link href={`/partner/restaurant/${id}`} aria-label="Back">
          <IconChevronLeft size={18} color="#8A6040" />
        </Link>
        <h1 className="text-[15px] font-extrabold text-[#1A0800]">
          {t("navBilling")}
        </h1>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-5 p-4">
        {/* 현재 플랜 */}
        <div
          className="flex items-center justify-between rounded-2xl border p-4"
          style={{
            backgroundColor: PLAN_COLOR[currentPlan].bg,
            borderColor: PLAN_COLOR[currentPlan].border,
          }}
        >
          <div>
            <p className="text-[11px] font-bold text-[#B07040]">
              {t("currentPlan")}
            </p>
            <p
              className="text-[20px] font-extrabold"
              style={{ color: PLAN_COLOR[currentPlan].text }}
            >
              {planLabels[currentPlan]}
            </p>
          </div>
          {currentPlan !== "free" && (
            <div className="text-right">
              <p className="text-[18px] font-extrabold text-[#1A0800]">
                ₩{PLAN_PRICES[currentPlan as Exclude<Plan, "free">].toLocaleString()}
              </p>
              <p className="text-[11px] text-[#8A6040]">{t("planPerMonth")}</p>
            </div>
          )}
        </div>

        {/* 플랜 비교표 */}
        <section>
          <div className="overflow-hidden rounded-2xl border border-[#FFE8D6] bg-white">
            {/* 헤더 */}
            <div className="grid grid-cols-4 border-b border-[#FFE8D6]">
              <div className="p-3" />
              {planOrder.map((plan) => (
                <div
                  key={plan}
                  className="border-l border-[#FFE8D6] p-3 text-center"
                >
                  <p
                    className="text-[12px] font-extrabold"
                    style={{ color: PLAN_COLOR[plan].text }}
                  >
                    {planLabels[plan]}
                  </p>
                  {plan !== "free" ? (
                    <p className="text-[11px] text-[#8A6040]">
                      ₩{PLAN_PRICES[plan as Exclude<Plan, "free">].toLocaleString()}
                      {t("planPerMonth")}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#8A6040]">₩0</p>
                  )}
                </div>
              ))}
            </div>

            {/* 기능 행 */}
            {featureRows.map(({ key, values }) => (
              <div
                key={key}
                className="grid grid-cols-4 border-b border-[#FFE8D6] last:border-b-0"
              >
                <div className="p-3 text-[11px] font-bold text-[#8A6040]">
                  {t(key as Parameters<typeof t>[0])}
                </div>
                {planOrder.map((plan) => {
                  const val = values[plan];
                  return (
                    <div
                      key={plan}
                      className="flex items-center justify-center border-l border-[#FFE8D6] p-3"
                    >
                      {typeof val === "string" ? (
                        <span className="text-[12px] font-bold text-[#1A0800]">
                          {val}
                        </span>
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
        </section>

        {/* 업그레이드 / 취소 버튼 */}
        <div className="flex flex-col gap-2">
          {currentPlan !== "premium" &&
            planOrder
              .filter((p) => p !== "free" && p !== currentPlan)
              .map((plan) => (
                <BillingUpgradeButton
                  key={plan}
                  restaurantId={id}
                  plan={plan as "basic" | "premium"}
                  planLabel={planLabels[plan]}
                  price={PLAN_PRICES[plan as Exclude<Plan, "free">]}
                  restaurantName={restaurant.name ?? ""}
                  userEmail={user.email ?? ""}
                />
              ))}
          {currentPlan !== "free" && (
            <CancelSubscriptionButton restaurantId={id} />
          )}
        </div>

        {/* 결제 내역 */}
        <section>
          <h2 className="mb-2 text-[14px] font-extrabold text-[#1A0800]">
            {t("billingHistory")}
          </h2>

          {payments.length === 0 ? (
            <div className="rounded-2xl border border-[#FFE8D6] bg-white p-4 text-center text-[13px] font-bold text-[#B07040]">
              {t("noBillingHistory")}
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border border-[#FFE8D6] bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-[13px] font-bold text-[#1A0800]">
                      ₩{p.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[#B07040]">
                      {(p.paid_at ?? p.created_at).slice(0, 10)}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                    style={
                      p.status === "success"
                        ? { backgroundColor: "#DCFCE7", color: "#15803D" }
                        : { backgroundColor: "#FEE2E2", color: "#B91C1C" }
                    }
                  >
                    {p.status === "success" ? "✓" : "✕"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
