import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

/** 약관·정책 목록 — 개인정보보호법 등 상시 공개 요건의 단일 진입점 */
export default async function PolicyIndexPage() {
  const t = await getTranslations("profile");
  const tp = await getTranslations("policies");

  return (
    <div className="min-h-dvh bg-[#F5EDE0]">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5] px-3 py-2">
        <Link href="/profile" aria-label="Back">
          <IconChevronLeft size={18} color="#8A6040" />
        </Link>
        <h1 className="text-[15px] font-extrabold text-[#1A0800]">
          {t("legal")}
        </h1>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        <div className="overflow-hidden rounded-2xl border border-[#FFE8D6] bg-white">
          {(["terms", "privacy", "partner", "refund"] as const).map(
            (slug, i) => (
              <Link
                key={slug}
                href={`/policy/${slug}`}
                className="flex items-center px-4 py-3.5 text-[13px] font-semibold text-[#1A0800]"
                style={{ borderTop: i > 0 ? "1px solid #FFF5EE" : undefined }}
              >
                <span className="flex-1">{tp(slug)}</span>
                <IconChevronRight size={15} color="#C0A080" />
              </Link>
            ),
          )}
        </div>
      </main>
    </div>
  );
}
