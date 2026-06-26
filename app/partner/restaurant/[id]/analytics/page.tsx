import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { IconChevronLeft, IconLock } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import type { Plan } from "@/types";
import { PLAN_FEATURES } from "@/lib/features";

export const dynamic = "force-dynamic";

interface ReviewRow {
  rating: number;
  nationality: string | null;
  created_at: string;
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

/** YYYY-MM */
function toYearMonth(iso: string): string {
  return iso.slice(0, 7);
}

export default async function PartnerAnalyticsPage({
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

  const plan = (restaurant.plan as Plan) ?? "free";
  const canViewAnalytics = PLAN_FEATURES[plan].analyticsEnabled;

  /* Premium 미보유 → 잠금 화면 */
  if (!canViewAnalytics) {
    return (
      <div className="min-h-dvh bg-[#F5EDE0]">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5] px-3 py-2">
          <Link href={`/partner/restaurant/${id}`} aria-label="Back">
            <IconChevronLeft size={18} color="#8A6040" />
          </Link>
          <h1 className="text-[15px] font-extrabold text-[#1A0800]">
            {t("navAnalytics")}
          </h1>
        </header>

        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3C7]">
            <IconLock size={28} color="#D97706" />
          </div>
          <h2 className="text-[18px] font-extrabold text-[#1A0800]">
            {t("premiumOnly")}
          </h2>
          <p className="max-w-xs text-[13px] leading-relaxed text-[#8A6040]">
            {t("premiumOnlyDesc")}
          </p>
          <Link
            href={`/partner/restaurant/${id}/billing`}
            className="mt-2 rounded-2xl px-6 py-3 text-[13px] font-extrabold text-white"
            style={{ backgroundColor: "#FF6B35" }}
          >
            {t("upgradeNow")}
          </Link>
        </div>
      </div>
    );
  }

  /* Premium 보유 → 분석 데이터 조회 */
  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("rating, nationality, created_at")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: false })
    .limit(500);

  const reviews = (reviewRows ?? []) as ReviewRow[];

  /* 국적별 리뷰 집계 */
  const nationalityMap = new Map<string, number>();
  for (const r of reviews) {
    const key = r.nationality ?? "unknown";
    nationalityMap.set(key, (nationalityMap.get(key) ?? 0) + 1);
  }
  const nationalityData = [...nationalityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxNat = Math.max(...nationalityData.map(([, c]) => c), 1);

  /* 월별 리뷰 집계 — 최근 6개월 */
  const monthMap = new Map<string, number>();
  for (const r of reviews) {
    const ym = toYearMonth(r.created_at);
    monthMap.set(ym, (monthMap.get(ym) ?? 0) + 1);
  }
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const monthlyData = months.map((ym) => ({
    label: ym.slice(5), // MM
    count: monthMap.get(ym) ?? 0,
  }));
  const maxMonth = Math.max(...monthlyData.map((d) => d.count), 1);

  return (
    <div className="min-h-dvh bg-[#F5EDE0]">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5] px-3 py-2">
        <Link href={`/partner/restaurant/${id}`} aria-label="Back">
          <IconChevronLeft size={18} color="#8A6040" />
        </Link>
        <h1 className="text-[15px] font-extrabold text-[#1A0800]">
          {t("navAnalytics")}
        </h1>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-5 p-4">
        {/* 국적별 리뷰 */}
        <section>
          <h2 className="mb-3 text-[14px] font-extrabold text-[#1A0800]">
            {t("reviewsByNationality")}
          </h2>
          {nationalityData.length === 0 ? (
            <div className="rounded-2xl border border-[#FFE8D6] bg-white p-4 text-center text-[13px] font-bold text-[#B07040]">
              {t("noReviews")}
            </div>
          ) : (
            <div className="flex flex-col gap-2 rounded-2xl border border-[#FFE8D6] bg-white p-4">
              {nationalityData.map(([code, count]) => (
                <div key={code} className="flex items-center gap-2">
                  <span className="w-6 text-center text-[16px]" aria-hidden>
                    {flagEmoji(code === "unknown" ? null : code)}
                  </span>
                  <span className="w-8 shrink-0 text-[10px] font-bold uppercase text-[#8A6040]">
                    {code === "unknown" ? "—" : code}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-[#F5EDE0]">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(count / maxNat) * 100}%`,
                        backgroundColor: "#FF6B35",
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-[12px] font-extrabold text-[#1A0800]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 월별 리뷰 트렌드 */}
        <section>
          <h2 className="mb-3 text-[14px] font-extrabold text-[#1A0800]">
            {t("monthlyReviews")}
          </h2>
          <div className="rounded-2xl border border-[#FFE8D6] bg-white p-4">
            <div className="flex h-32 items-end gap-1.5">
              {monthlyData.map(({ label, count }) => (
                <div
                  key={label}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-[10px] font-extrabold text-[#1A0800]">
                    {count > 0 ? count : ""}
                  </span>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${Math.max((count / maxMonth) * 88, count > 0 ? 4 : 0)}px`,
                      backgroundColor: count > 0 ? "#FF6B35" : "#F5EDE0",
                    }}
                  />
                  <span className="text-[10px] font-bold text-[#B07040]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
