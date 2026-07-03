import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function BillingFailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
}) {
  const { id } = await params;
  const { message } = await searchParams;
  const t = await getTranslations("partner");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#FFFAF5] p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEE2E2] text-[28px] font-extrabold text-[#B91C1C]">
        ✕
      </div>
      <p className="text-[20px] font-extrabold text-[#1A0800]">
        {t("billingCancelled")}
      </p>
      <p className="max-w-xs text-[13px] text-[#8A6040]">
        {message ?? t("billingCancelledDesc")}
      </p>
      <Link
        href={`/partner/restaurant/${id}/billing`}
        className="mt-4 rounded-2xl bg-[#FF6B35] px-6 py-3 text-[14px] font-extrabold text-white"
      >
        {t("billingGoBack")}
      </Link>
    </div>
  );
}
