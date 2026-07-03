import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  IconBuildingStore,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconRocket,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORIES, type Category } from "@/types";
import {
  ClaimButton,
  LogoutButton,
} from "@/components/partner/PartnerActions";

export const dynamic = "force-dynamic";

interface PartnerRow {
  id: string;
  name: string;
  category: Category;
  address: string;
  status: "pending" | "approved" | "rejected";
  plan: string;
}

const STATUS_STYLE: Record<
  PartnerRow["status"],
  { key: string; bg: string; text: string }
> = {
  pending: { key: "statusPending", bg: "#FEF9C3", text: "#854D0E" },
  approved: { key: "statusApproved", bg: "#DCFCE7", text: "#15803D" },
  rejected: { key: "statusRejected", bg: "#FEE2E2", text: "#B91C1C" },
};

export default async function PartnerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/partner/login");

  const t = await getTranslations("partner");

  /* 내 식당 — RLS owner_read 정책으로 본인 행은 상태 무관 조회 가능 */
  const { data: ownedData } = await supabase
    .from("restaurants")
    .select("id, name, category, address, status, plan")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  const owned = (ownedData ?? []) as PartnerRow[];

  /* 내 이메일로 등록됐지만 아직 연결 안 된 식당 — 서버에서만 조회.
     이메일 local part에 %/_가 올 수 있으므로 ilike 와일드카드를 이스케이프
     (미이스케이프 시 a%@x.com 계정이 타인 식당 목록을 열람 가능) */
  const admin = createAdminClient();
  const emailPattern = (user.email ?? "").replace(/[\\%_]/g, (m) => `\\${m}`);
  const { data: claimableData } = await admin
    .from("restaurants")
    .select("id, name, category, address, status, plan")
    .ilike("owner_email", emailPattern)
    .is("owner_id", null);
  const claimable = (claimableData ?? []) as PartnerRow[];

  return (
    <div className="min-h-dvh bg-[#F5EDE0]">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5] px-3 py-2">
        <Link href="/profile" aria-label="Back">
          <IconChevronLeft size={18} color="#8A6040" />
        </Link>
        <h1 className="flex-1 text-[15px] font-extrabold text-[#1A0800]">
          <span className="text-[#FF6B35]">KBite</span> {t("title")}
        </h1>
        <LogoutButton />
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-5 p-4">
        <p className="truncate text-[11px] font-semibold text-[#B07040]">
          {user.email}
        </p>

        {/* 내 식당 */}
        <section>
          <h2 className="mb-2 text-[14px] font-extrabold text-[#1A0800]">
            {t("myRestaurants")} ({owned.length})
          </h2>
          {owned.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#FFE8D6] bg-white p-6 text-center">
              <IconBuildingStore size={24} color="#C0A080" />
              <p className="text-[13px] font-bold text-[#1A0800]">
                {t("empty")}
              </p>
              <p className="max-w-sm text-[11px] leading-relaxed text-[#8A6040]">
                {t("emptyDesc")}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {owned.map((r) => {
                const s = STATUS_STYLE[r.status];
                return (
                  <li key={r.id}>
                    <Link
                      href={`/partner/restaurant/${r.id}`}
                      className="flex items-center gap-2.5 rounded-2xl border border-[#FFE8D6] bg-white p-3"
                    >
                      <span aria-hidden>{CATEGORIES[r.category].emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-[#1A0800]">
                          {r.name}
                        </span>
                        <span className="block truncate text-[11px] text-[#8A6040]">
                          {r.address}
                        </span>
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold"
                        style={{ backgroundColor: s.bg, color: s.text }}
                      >
                        {t(s.key)}
                      </span>
                      <IconChevronRight size={15} color="#C0A080" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 소유권 연결 대기 */}
        {claimable.length > 0 && (
          <section>
            <h2 className="mb-2 text-[14px] font-extrabold text-[#1A0800]">
              {t("claimTitle")} ({claimable.length})
            </h2>
            <ul className="flex flex-col gap-2">
              {claimable.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-2.5 rounded-2xl border border-dashed border-[#FFD4B8] bg-white p-3"
                >
                  <span aria-hidden>{CATEGORIES[r.category].emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-[#1A0800]">
                      {r.name}
                    </span>
                    <span className="block truncate text-[11px] text-[#8A6040]">
                      {r.address}
                    </span>
                  </span>
                  <ClaimButton id={r.id} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link
          href="/register"
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#FFD4B8] bg-white py-3 text-[13px] font-extrabold text-[#CC4400]"
        >
          <IconPlus size={15} stroke={2.5} />
          {t("registerNew")}
        </Link>

        <Link
          href="/pricing"
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#FFD4B8] bg-white py-3 text-[13px] font-extrabold text-[#8A6040]"
        >
          <IconRocket size={15} stroke={2} />
          {t("navBilling")}
        </Link>
      </main>
    </div>
  );
}
