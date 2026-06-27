import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargeBillingKey } from "@/lib/toss";
import { PLAN_PRICES } from "@/lib/features";
import { sendPaymentReceipt, sendRenewalReminder } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface SubRow {
  id: string;
  restaurant_id: string;
  plan: string;
  billing_key: string | null;
  amount: number;
  restaurants: { name: string; owner_id: string } | null;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const results = { renewed: 0, expired: 0, failed: 0, reminded: 0 };

  // 0. D-7 갱신 예정 알림
  const reminderFrom = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString();
  const reminderTo = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: upcoming } = await admin
    .from("subscriptions")
    .select("id, restaurant_id, plan, amount, restaurants(name, owner_id)")
    .eq("status", "active")
    .gte("current_period_end", reminderFrom)
    .lt("current_period_end", reminderTo)
    .returns<SubRow[]>();

  for (const sub of upcoming ?? []) {
    const ownerId = sub.restaurants?.owner_id;
    if (!ownerId) continue;
    const { data: userData } = await admin.auth.admin.getUserById(ownerId);
    const email = userData?.user?.email;
    if (!email) continue;
    await sendRenewalReminder({
      to: email,
      restaurantName: sub.restaurants?.name ?? sub.restaurant_id,
      plan: sub.plan as "basic" | "premium",
      amount: sub.amount,
      renewalDate: new Date(reminderFrom),
    }).catch(() => {});
    results.reminded++;
  }

  // 1. 취소된 구독 중 기간 만료 → free 다운그레이드
  const { data: cancelled } = await admin
    .from("subscriptions")
    .select("id, restaurant_id")
    .eq("status", "cancelled")
    .lt("current_period_end", nowIso);

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
    .select("id, restaurant_id, plan, billing_key, amount, restaurants(name, owner_id)")
    .eq("status", "active")
    .lt("current_period_end", nowIso)
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

      const ownerId = sub.restaurants?.owner_id;
      if (ownerId) {
        const { data: ud } = await admin.auth.admin.getUserById(ownerId);
        const email = ud?.user?.email;
        if (email) {
          await sendPaymentReceipt({
            to: email,
            restaurantName: sub.restaurants?.name ?? sub.restaurant_id,
            plan,
            amount,
            nextBillingDate: periodEnd,
          }).catch(() => {});
        }
      }

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
