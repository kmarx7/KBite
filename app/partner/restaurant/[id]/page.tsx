import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  IconChevronLeft,
  IconStarFilled,
  IconMessage,
  IconHeart,
  IconEye,
  IconEdit,
  IconCreditCard,
  IconChartBar,
  IconChevronRight,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORIES, type Category } from "@/types";
import type { Plan } from "@/types";
import { PLAN_FEATURES } from "@/lib/features";
import ReviewReplyForm from "@/components/partner/ReviewReplyForm";
import LockedNavItem from "@/components/partner/LockedNavItem";
import { IconLock } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

interface ReviewRow {
  id: string;
  rating: number;
  content: string | null;
  nationality: string | null;
  created_at: string;
  reply_text: string | null;
  reply_at: string | null;
}

function flagEmoji(code: string | null): string {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

const PLAN_COLOR: Record<Plan, { bg: string; text: string }> = {
  free: { bg: "#F3F4F6", text: "#6B7280" },
  basic: { bg: "#DBEAFE", text: "#1D4ED8" },
  premium: { bg: "#FEF3C7", text: "#D97706" },
};

const STATUS_STYLE = {
  pending: { bg: "#FEF9C3", text: "#854D0E" },
  approved: { bg: "#DCFCE7", text: "#15803D" },
  rejected: { bg: "#FEE2E2", text: "#B91C1C" },
} as const;

export default async function PartnerRestaurantDashboard({
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

  /* 식당 기본 정보 — RLS(owner_read)가 본인 식당만 반환 */
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, category, status, plan, view_count")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!restaurant) notFound();

  const plan = (restaurant.plan as Plan) ?? "free";
  const planFeatures = PLAN_FEATURES[plan];
  const canReply = planFeatures.reviewReplyEnabled;

  /* 리뷰 — public read 정책으로 조회 */
  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("id, rating, content, nationality, created_at, reply_text, reply_at")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const reviews = (reviewRows ?? []) as ReviewRow[];
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10,
        ) / 10
      : 0;

  /* 찜 수 — service_role로 profiles 조회 */
  let saveCount = 0;
  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .contains("saved_restaurants", [id]);
    saveCount = count ?? 0;
  } catch {}

  const viewCount = (restaurant.view_count as number | null) ?? 0;

  /* 일별 조회 추이 14일 — KST 기준 (증가 함수와 동일 기준) */
  const TREND_DAYS = 14;
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const dayKeys: string[] = Array.from({ length: TREND_DAYS }, (_, i) => {
    const d = new Date(kstNow);
    d.setUTCDate(d.getUTCDate() - (TREND_DAYS - 1 - i));
    return d.toISOString().slice(0, 10);
  });
  const viewsByDay = new Map<string, number>(dayKeys.map((k) => [k, 0]));
  try {
    const admin = createAdminClient();
    const { data: dailyRows } = await admin
      .from("restaurant_view_daily")
      .select("day, views")
      .eq("restaurant_id", id)
      .gte("day", dayKeys[0]);
    for (const row of dailyRows ?? []) {
      if (viewsByDay.has(row.day as string)) {
        viewsByDay.set(row.day as string, row.views as number);
      }
    }
  } catch {
    /* 마이그레이션 미적용 등 — 0으로 표시 */
  }
  const trend = dayKeys.map((k) => ({ day: k, views: viewsByDay.get(k) ?? 0 }));
  const maxViews = Math.max(1, ...trend.map((d) => d.views));
  const thisWeek = trend.slice(7).reduce((s, d) => s + d.views, 0);
  const lastWeek = trend.slice(0, 7).reduce((s, d) => s + d.views, 0);
  const category = restaurant.category as Category;
  const status = (restaurant.status as keyof typeof STATUS_STYLE) ?? "pending";
  const statusStyle = STATUS_STYLE[status];
  const planStyle = PLAN_COLOR[plan];

  const navItems = [
    {
      href: `/partner/restaurant/${id}/edit`,
      icon: IconEdit,
      label: t("navEdit"),
    },
    {
      href: `/partner/restaurant/${id}/billing`,
      icon: IconCreditCard,
      label: t("navBilling"),
    },
    {
      href: `/partner/restaurant/${id}/analytics`,
      icon: IconChartBar,
      label: t("navAnalytics"),
      locked: !planFeatures.analyticsEnabled,
    },
  ];

  return (
    <div className="min-h-dvh bg-[#F5EDE0]">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5] px-3 py-2">
        <Link href="/partner" aria-label="Back">
          <IconChevronLeft size={18} color="#8A6040" />
        </Link>
        <span className="mr-1 text-[18px]" aria-hidden>
          {CATEGORIES[category].emoji}
        </span>
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-extrabold text-[#1A0800]">
          {restaurant.name as string}
        </h1>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          {t(`status${status.charAt(0).toUpperCase() + status.slice(1)}` as Parameters<typeof t>[0])}
        </span>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
        {/* 플랜 배지 */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold text-[#8A6040]">
            {t("currentPlan")}
          </span>
          <span
            className="rounded-full px-3 py-0.5 text-[11px] font-extrabold"
            style={{ backgroundColor: planStyle.bg, color: planStyle.text }}
          >
            {t(("plan" + plan.charAt(0).toUpperCase() + plan.slice(1)) as Parameters<typeof t>[0])}
          </span>
        </div>

        {/* 통계 카드 4개 */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: IconMessage, value: reviewCount, label: t("statsReviews"), color: "#F59E0B" },
            { icon: IconStarFilled, value: avgRating > 0 ? avgRating.toFixed(1) : "—", label: t("statsRating"), color: "#FF6B35" },
            { icon: IconHeart, value: saveCount, label: t("statsSaves"), color: "#EF4444" },
            { icon: IconEye, value: viewCount, label: t("statsViews"), color: "#8B5CF6" },
          ].map(({ icon: Icon, value, label, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-2xl border border-[#FFE8D6] bg-white px-2 py-3"
            >
              <Icon size={16} color={color} />
              <span className="text-[16px] font-extrabold text-[#1A0800]">
                {value}
              </span>
              <span className="text-center text-[9px] font-bold text-[#B07040]">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* 조회 추이 — 14일 (무료 플랜에도 노출: 가치 증명) */}
        <section className="rounded-2xl border border-[#FFE8D6] bg-white p-4">
          <h2 className="text-[13px] font-extrabold text-[#1A0800]">
            {t("viewsTrend")}
          </h2>
          <p className="mb-3 text-[11px] font-semibold text-[#8A6040]">
            {t("viewsWeekSummary", { current: thisWeek, prev: lastWeek })}
          </p>
          <div
            className="flex h-20 items-end gap-[3px]"
            role="img"
            aria-label={t("viewsWeekSummary", {
              current: thisWeek,
              prev: lastWeek,
            })}
          >
            {trend.map(({ day, views }) => (
              <div
                key={day}
                className="flex h-full min-w-0 flex-1 items-end"
                title={`${day.slice(5).replace("-", "/")} · ${views}`}
              >
                <div
                  className="w-full rounded-t-[3px]"
                  style={
                    views > 0
                      ? {
                          height: `${Math.max(6, (views / maxViews) * 100)}%`,
                          backgroundColor: "#FF6B35",
                        }
                      : { height: "3px", backgroundColor: "#FFE8D6" }
                  }
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[9px] font-bold text-[#B07040]">
            <span>{dayKeys[0].slice(5).replace("-", "/")}</span>
            <span>{dayKeys[TREND_DAYS - 1].slice(5).replace("-", "/")}</span>
          </div>
        </section>

        {/* 빠른 메뉴 */}
        <nav className="flex flex-col gap-2">
          {navItems.map(({ href, icon: Icon, label, locked }) =>
            locked ? (
              <LockedNavItem
                key={href}
                restaurantId={id}
                requiredPlan="premium"
                icon={<Icon size={18} color="#C0A080" />}
                label={label}
                badgeLabel="Premium"
              />
            ) : (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-2xl border border-[#FFE8D6] bg-white px-4 py-3"
              >
                <Icon size={18} color="#FF6B35" />
                <span className="flex-1 text-[13px] font-bold text-[#1A0800]">
                  {label}
                </span>
                <IconChevronRight size={15} color="#C0A080" />
              </Link>
            ),
          )}
        </nav>

        {/* 최근 리뷰 */}
        <section>
          <h2 className="mb-2 text-[14px] font-extrabold text-[#1A0800]">
            {t("recentReviews")}
          </h2>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-[#FFE8D6] bg-white p-4 text-center text-[13px] font-bold text-[#B07040]">
              {t("noReviews")}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-2xl border border-[#FFE8D6] bg-white p-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[16px]" aria-hidden>
                      {flagEmoji(review.nationality)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <IconStarFilled
                            key={i}
                            size={11}
                            color={i < review.rating ? "#F59E0B" : "#E5E7EB"}
                          />
                        ))}
                        <span className="ml-auto text-[10px] text-[#B07040]">
                          {review.created_at.slice(0, 10)}
                        </span>
                      </div>
                      {review.content && (
                        <p className="mt-1 text-[12px] leading-relaxed text-[#1A0800]">
                          {review.content}
                        </p>
                      )}

                      {/* 기존 답글 표시 */}
                      {review.reply_text && (
                        <div className="mt-2 rounded-xl bg-[#FFF7F0] p-2">
                          <p className="mb-0.5 text-[10px] font-extrabold text-[#FF6B35]">
                            {t("ownerReply")}
                          </p>
                          <p className="text-[11px] leading-relaxed text-[#1A0800]">
                            {review.reply_text}
                          </p>
                        </div>
                      )}

                      {/* 답글 폼 — basic/premium만 */}
                      {canReply ? (
                        <ReviewReplyForm
                          reviewId={review.id}
                          restaurantId={id}
                          existingReply={review.reply_text}
                        />
                      ) : (
                        <Link
                          href={`/partner/restaurant/${id}/billing`}
                          className="mt-2 flex items-center gap-1.5 rounded-xl border border-dashed border-[#FDE68A] bg-[#FFFBEB] px-3 py-2"
                        >
                          <IconLock size={12} color="#D97706" className="shrink-0" />
                          <span className="text-[11px] font-bold text-[#D97706]">
                            {t("replyPlaceholder")}
                          </span>
                          <span className="ml-auto rounded-full bg-[#FDE68A] px-2 py-0.5 text-[9px] font-extrabold text-[#92400E]">
                            Basic+
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
