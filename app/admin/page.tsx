import { redirect } from "next/navigation";
import Link from "next/link";
import { IconLogout } from "@tabler/icons-react";
import { verifyAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminLogout } from "@/app/actions/admin";
import { CATEGORIES, type Category } from "@/types";
import {
  ApproveRejectButtons,
  DeleteButton,
} from "@/components/admin/AdminActions";

export const dynamic = "force-dynamic";

interface AdminRow {
  id: string;
  name: string;
  category: Category;
  address: string;
  owner_email: string | null;
  phone: string | null;
  biz_reg_no: string | null;
  cert_file_path: string | null;
  status: "pending" | "approved" | "rejected";
  plan: string;
  created_at: string;
}

const STATUS_BADGE: Record<AdminRow["status"], { label: string; bg: string; text: string }> = {
  pending: { label: "대기", bg: "#FEF9C3", text: "#854D0E" },
  approved: { label: "승인", bg: "#DCFCE7", text: "#15803D" },
  rejected: { label: "거절", bg: "#FEE2E2", text: "#B91C1C" },
};

/* 내부 운영자용 페이지 — 다국어 미적용 */
export default async function AdminPage() {
  if (!(await verifyAdminSession())) redirect("/admin/login");

  const supabase = createAdminClient();
  const [{ data: restaurants }, { count: profileCount }] = await Promise.all([
    supabase
      .from("restaurants")
      .select(
        "id, name, category, address, owner_email, phone, biz_reg_no, cert_file_path, status, plan, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const rows = (restaurants ?? []) as AdminRow[];
  const pending = rows.filter((r) => r.status === "pending");

  /* 인증서는 비공개 버킷 — 승인 검토용 서명 URL(10분) 생성 */
  const certUrls = new Map<string, string>();
  await Promise.all(
    pending
      .filter((r) => r.cert_file_path)
      .map(async (r) => {
        const { data } = await supabase.storage
          .from("cert-documents")
          .createSignedUrl(r.cert_file_path!, 600);
        if (data?.signedUrl) certUrls.set(r.id, data.signedUrl);
      }),
  );
  const counts = {
    total: rows.length,
    approved: rows.filter((r) => r.status === "approved").length,
    pending: pending.length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };

  const stats = [
    { label: "전체 식당", value: counts.total },
    { label: "승인됨", value: counts.approved },
    { label: "승인 대기", value: counts.pending },
    { label: "가입 사용자", value: profileCount ?? 0 },
  ];

  return (
    <div className="min-h-dvh bg-[#F5EDE0]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#FFE8D6] bg-[#FFFAF5] px-4 py-3">
        <h1 className="text-[16px] font-extrabold text-[#1A0800]">
          <span className="text-[#FF6B35]">KBite</span> 관리자
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-[#FFD4B8] bg-white px-3 py-1.5 text-[11px] font-bold text-[#8A6040]"
          >
            앱 보기
          </Link>
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-full border border-[#FFD4B8] bg-white px-3 py-1.5 text-[11px] font-bold text-[#8A6040]"
            >
              <IconLogout size={12} /> 로그아웃
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-5 p-4">
        {/* 통계 */}
        <section className="grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="min-w-0 rounded-2xl border border-[#FFE8D6] bg-white p-3 text-center"
            >
              <p className="text-[20px] font-black text-[#FF6B35]">
                {s.value}
              </p>
              <p className="truncate text-[10px] font-bold text-[#8A6040]">
                {s.label}
              </p>
            </div>
          ))}
        </section>

        {/* 승인 대기 큐 */}
        <section>
          <h2 className="mb-2 text-[14px] font-extrabold text-[#1A0800]">
            승인 대기 ({counts.pending})
          </h2>
          {pending.length === 0 ? (
            <p className="rounded-2xl border border-[#FFE8D6] bg-white p-4 text-center text-[12px] font-semibold text-[#B07040]">
              대기 중인 등록이 없습니다
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pending.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-[#FFE8D6] bg-white p-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span aria-hidden>{CATEGORIES[r.category].emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#1A0800]">
                      {r.name}
                    </span>
                    <ApproveRejectButtons id={r.id} />
                  </div>
                  <p className="truncate text-[11px] text-[#8A6040]">
                    {r.address}
                  </p>
                  <p className="truncate text-[11px] text-[#B07040]">
                    {r.owner_email} · {r.phone ?? "-"} · 사업자{" "}
                    {r.biz_reg_no ?? "-"} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("ko-KR")}
                  </p>
                  {certUrls.has(r.id) && (
                    <a
                      href={certUrls.get(r.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-[11px] font-bold text-[#FF6B35] underline"
                    >
                      인증서 서류 보기
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 전체 목록 */}
        <section>
          <h2 className="mb-2 text-[14px] font-extrabold text-[#1A0800]">
            전체 식당 ({counts.total})
          </h2>
          <ul className="flex flex-col gap-1.5">
            {rows.map((r) => {
              const badge = STATUS_BADGE[r.status];
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-2 rounded-xl border border-[#FFE8D6] bg-white px-3 py-2"
                >
                  <span aria-hidden>{CATEGORIES[r.category].emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-[#1A0800]">
                    {r.name}
                  </span>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                  <span className="shrink-0 text-[9px] font-bold uppercase text-[#B07040]">
                    {r.plan}
                  </span>
                  {r.status !== "pending" && (
                    <Link
                      href={`/restaurant/${r.id}`}
                      className="shrink-0 text-[10px] font-bold text-[#FF6B35]"
                    >
                      보기
                    </Link>
                  )}
                  <DeleteButton id={r.id} name={r.name} />
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
