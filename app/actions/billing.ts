"use server";

import { createHash } from "crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueBillingKey, chargeBillingKey } from "@/lib/toss";
import { PLAN_PRICES } from "@/lib/features";
import { sendPaymentReceipt } from "@/lib/email";
import type { Plan } from "@/types";

export interface ConfirmBillingResult {
  ok: boolean;
  /** 사용자에게 표시할 메시지 (실패 시) */
  error?: string;
  amount?: number;
}

const inputSchema = z.object({
  restaurantId: z.string().uuid(),
  authKey: z.string().min(1).max(300),
  customerKey: z.string().min(1).max(300),
  plan: z.enum(["basic", "premium"]),
});

/**
 * 카드 등록(requestBillingAuth) 성공 후 첫 결제 확정.
 * GET 렌더의 부수효과가 아닌 명시적 액션으로 실행하며,
 * orderId(authKey 기반 결정적 값) 선기록으로 중복 실행을 차단한다.
 * 과금 후 크래시로 기록이 유실되면 cron의 pending 대사가 복구한다.
 */
export async function confirmBillingAuth(
  input: unknown,
): Promise<ConfirmBillingResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "잘못된 요청입니다." };
  const { restaurantId, authKey, customerKey, plan } = parsed.data;

  /* customerKey는 SDK 호출 시 restaurantId로 지정했음 — 불일치는 변조 */
  if (customerKey !== restaurantId) {
    return { ok: false, error: "잘못된 요청입니다." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("id", restaurantId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!restaurant) {
    return { ok: false, error: "레스토랑을 찾을 수 없습니다." };
  }

  const admin = createAdminClient();
  const amount = PLAN_PRICES[plan];

  /* orderId: authKey 기반 결정적 값 — 같은 결제 시도는 항상 같은 주문 */
  const orderId = `kbite-${restaurantId.replace(/-/g, "")}-${createHash(
    "sha256",
  )
    .update(authKey)
    .digest("hex")
    .slice(0, 12)}`;

  /* 과금 전 pending 선기록 — 유니크 충돌이면 이미 처리됐거나 처리 중 */
  const { data: pendingRow, error: pendingError } = await admin
    .from("payment_history")
    .insert({
      order_id: orderId,
      restaurant_id: restaurantId,
      amount,
      status: "pending",
    })
    .select("id")
    .single();

  if (pendingError || !pendingRow) {
    const { data: existing } = await admin
      .from("payment_history")
      .select("status")
      .eq("order_id", orderId)
      .maybeSingle();
    if (existing?.status === "success") return { ok: true, amount };
    if (existing?.status === "pending") {
      return {
        ok: false,
        error: "이미 처리 중인 결제입니다. 잠시 후 결제 내역을 확인해 주세요.",
      };
    }
    return { ok: false, error: "이미 사용된 결제 요청입니다. 다시 시도해 주세요." };
  }

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

    /* 기존 활성 구독 취소 후 새 구독 생성 (활성 1개는 부분 유니크 인덱스가 강제) */
    await admin
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("restaurant_id", restaurantId)
      .eq("status", "active");

    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    /* 동시 결제 경합으로 유니크 위반이 나도 결제 기록은 남긴다 (돈은 이미 이동) */
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
      .maybeSingle();

    await admin
      .from("payment_history")
      .update({
        status: "success",
        subscription_id: sub?.id ?? null,
        payment_key: payment.paymentKey,
        paid_at: new Date().toISOString(),
      })
      .eq("id", pendingRow.id);

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

    return { ok: true, amount };
  } catch (err) {
    const message = err instanceof Error ? err.message : "결제 오류";
    await admin
      .from("payment_history")
      .update({ status: "failed", failure_reason: message })
      .eq("id", pendingRow.id)
      .eq("status", "pending");
    return { ok: false, error: message };
  }
}
