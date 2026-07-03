import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import BillingConfirm from "@/components/partner/BillingConfirm";

const searchParamsSchema = z.object({
  authKey: z.string().min(1),
  customerKey: z.string().min(1),
  plan: z.enum(["basic", "premium"]),
});

/**
 * Toss 카드 등록 성공 리다이렉트 착지 페이지.
 * 과금은 여기서 하지 않는다 — BillingConfirm(클라이언트)이 마운트 후
 * confirmBillingAuth 액션을 1회 호출한다 (orderId 선기록으로 중복 차단).
 */
export default async function BillingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { id: restaurantId } = await params;
  const sp = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/partner/login");

  const parsed = searchParamsSchema.safeParse(sp);
  if (!parsed.success) {
    const t = await getTranslations("partner");
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#FFFAF5] p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEE2E2] text-[28px] font-extrabold text-[#B91C1C]">
          ✕
        </div>
        <p className="text-[20px] font-extrabold text-[#1A0800]">
          {t("billingFailed")}
        </p>
        <p className="max-w-xs text-[13px] text-[#8A6040]">
          {t("invalidRequest")}
        </p>
        <Link
          href={`/partner/restaurant/${restaurantId}/billing`}
          className="mt-4 rounded-2xl bg-[#FF6B35] px-6 py-3 text-[14px] font-extrabold text-white"
        >
          {t("billingGoBack")}
        </Link>
      </div>
    );
  }

  return (
    <BillingConfirm
      restaurantId={restaurantId}
      authKey={parsed.data.authKey}
      customerKey={parsed.data.customerKey}
      plan={parsed.data.plan}
    />
  );
}
