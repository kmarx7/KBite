import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargeBillingKey } from "@/lib/toss";
import { PLAN_PRICES } from "@/lib/features";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface SubRow {
  id: string;
  restaurant_id: string;
  plan: string;
  billing_key: string | null;
  amount: number;
  restaurants: { name: string } | null;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const results = { renewed: 0, expired: 0, failed: 0 };

  // 1. 취소된 구독 중 기간 만료 → free 다운그레이드
  const { data: cancelled } = await admin
    .from("subscriptions")
    .select("id, restaurant_id")
    .eq("status", "cancelled")
    .lt("current_period_end", now);

  for (const sub of cancelled ?? []) {
    await admin
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("id", sub.id);
    await admin
      .from("restaurants")
      .update({ plan: "free" })
      .eq("id", sub.restaurant_id);
    results.expired++;
  }

  // 2. 활성 구독 중 기간 만료 → 재결제
  const { data: active } = await admin
    .from("subscriptions")
    .select("id, restaurant_id, plan, billing_key, amount, restaurants(name)")
    .eq("status", "active")
    .lt("current_period_end", now)
    .returns<SubRow[]>();

  for (const sub of active ?? []) {
    if (!sub.billing_key) continue;

    const plan = sub.plan as "basic" | "premium";
    const amount = PLAN_PRICES[plan];
    // orderId: 64자 이하, 영문 대소문자 + 숫자 + - _ =
    const orderId = `renew-${sub.id}-${Date.now()}`;

    try {
      const payment = await chargeBillingKey({
        billingKey: sub.billing_key,
        customerKey: sub.restaurant_id,
        amount,
        orderId,
        orderName: `KBite ${plan === "basic" ? "베이직" : "프리미엄"} 플랜 갱신`,
        customerName: sub.restaurants?.name,
      });

      const periodStart = new Date();
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await admin
        .from("subscriptions")
        .update({
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq("id", sub.id);

      await admin.from("payment_history").insert({
        subscription_id: sub.id,
        restaurant_id: sub.restaurant_id,
        amount,
        status: "success",
        payment_key: payment.paymentKey,
        paid_at: new Date().toISOString(),
      });

      results.renewed++;
    } catch (err) {
      const failure_reason =
        err instanceof Error ? err.message : "재결제 실패";

      // 결제 실패 → 구독 만료 + free 다운그레이드
      await admin
        .from("subscriptions")
        .update({ status: "expired" })
        .eq("id", sub.id);
      await admin
        .from("restaurants")
        .update({ plan: "free" })
        .eq("id", sub.restaurant_id);

      await admin.from("payment_history").insert({
        subscription_id: sub.id,
        restaurant_id: sub.restaurant_id,
        amount,
        status: "failed",
        failure_reason,
      });

      results.failed++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
