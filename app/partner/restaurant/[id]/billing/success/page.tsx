import { redirect } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueBillingKey, chargeBillingKey } from "@/lib/toss";
import { PLAN_PRICES } from "@/lib/features";
import { sendPaymentReceipt } from "@/lib/email";
import type { Plan } from "@/types";

const searchParamsSchema = z.object({
  authKey: z.string().min(1),
  customerKey: z.string().min(1),
  plan: z.enum(["basic", "premium"]),
});

export default async function BillingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { id: restaurantId } = await params;
  const sp = await searchParams;

  const parsed = searchParamsSchema.safeParse(sp);
  if (!parsed.success) {
    return (
      <ResultUI
        ok={false}
        restaurantId={restaurantId}
        message="잘못된 요청입니다."
      />
    );
  }

  const { authKey, customerKey, plan } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/partner/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("id", restaurantId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!restaurant) {
    return (
      <ResultUI
        ok={false}
        restaurantId={restaurantId}
        message="레스토랑을 찾을 수 없습니다."
      />
    );
  }

  const admin = createAdminClient();
  const amount = PLAN_PRICES[plan];

  // 중복 실행 방지: 최근 1분 내 같은 플랜의 활성 구독이 있으면 이미 처리 완료
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("status", "active")
    .eq("plan", plan)
    .gte("created_at", new Date(Date.now() - 60_000).toISOString())
    .maybeSingle();

  if (existing) {
    return (
      <ResultUI
        ok={true}
        restaurantId={restaurantId}
        plan={plan}
        amount={amount}
      />
    );
  }

  const orderId = `kbite_${restaurantId.replace(/-/g, "")}_${Date.now()}`;

  try {
    const billingKey = await issueBillingKey(authKey, customerKey);

    const payment = await chargeBillingKey({
      billingKey,
      customerKey,
      amount,
      orderId,
      orderName: `KBite ${plan === "basic" ? "베이직" : "프리미엄"} 플랜`,
      customerEmail: user.email ?? "",
      customerName: (restaurant.name as string) ?? restaurantId,
    });

    // 기존 활성 구독 취소 후 새 구독 생성
    await admin
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("restaurant_id", restaurantId)
      .eq("status", "active");

    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: sub } = await admin
      .from("subscriptions")
      .insert({
        restaurant_id: restaurantId,
        plan,
        status: "active",
        billing_key: billingKey,
        amount,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select("id")
      .single();

    await admin.from("payment_history").insert({
      subscription_id: sub?.id ?? null,
      restaurant_id: restaurantId,
      amount,
      status: "success",
      payment_key: payment.paymentKey,
      paid_at: new Date().toISOString(),
    });

    await admin
      .from("restaurants")
      .update({ plan: plan as Plan })
      .eq("id", restaurantId);

    if (user.email) {
      await sendPaymentReceipt({
        to: user.email,
        restaurantName: (restaurant.name as string) ?? restaurantId,
        plan,
        amount,
        nextBillingDate: periodEnd,
      }).catch(() => {});
    }

    return (
      <ResultUI
        ok={true}
        restaurantId={restaurantId}
        plan={plan}
        amount={amount}
      />
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "결제 오류";

    try {
      await admin.from("payment_history").insert({
        restaurant_id: restaurantId,
        amount,
        status: "failed",
        failure_reason: message,
      });
    } catch {}

    return (
      <ResultUI ok={false} restaurantId={restaurantId} message={message} />
    );
  }
}

function ResultUI({
  ok,
  restaurantId,
  plan,
  amount,
  message,
}: {
  ok: boolean;
  restaurantId: string;
  plan?: string;
  amount?: number;
  message?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#FFFAF5] p-6 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full text-[28px] font-extrabold"
        style={
          ok
            ? { backgroundColor: "#DCFCE7", color: "#15803D" }
            : { backgroundColor: "#FEE2E2", color: "#B91C1C" }
        }
      >
        {ok ? "✓" : "✕"}
      </div>

      <p className="text-[20px] font-extrabold text-[#1A0800]">
        {ok ? "결제 완료!" : "결제 실패"}
      </p>

      {ok && plan && amount !== undefined ? (
        <p className="text-[13px] text-[#8A6040]">
          {plan === "basic" ? "베이직" : "프리미엄"} 플랜 ·{" "}
          ₩{amount.toLocaleString()}/월
        </p>
      ) : (
        <p className="max-w-xs text-[13px] text-[#8A6040]">{message}</p>
      )}

      <Link
        href={`/partner/restaurant/${restaurantId}/billing`}
        className="mt-4 rounded-2xl bg-[#FF6B35] px-6 py-3 text-[14px] font-extrabold text-white"
      >
        {ok ? "구독 관리로 이동" : "돌아가기"}
      </Link>
    </div>
  );
}
