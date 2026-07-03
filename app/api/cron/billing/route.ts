import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargeBillingKey, getPaymentByOrderId } from "@/lib/toss";
import { PLAN_PRICES } from "@/lib/features";
import { sendPaymentReceipt, sendRenewalReminder } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** 갱신 결제 실패 후 free 강등까지의 유예 기간 (스펙: 작업 13) */
const GRACE_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

interface SubRow {
  id: string;
  restaurant_id: string;
  plan: string;
  status: string;
  billing_key: string | null;
  amount: number;
  current_period_end: string | null;
  restaurants: { name: string; owner_id: string } | null;
}

type Admin = ReturnType<typeof createAdminClient>;

/** 만료 처리 — 빌링키는 더 이상 쓸 일 없으므로 함께 폐기 */
async function expireSubscription(admin: Admin, sub: SubRow) {
  await admin
    .from("subscriptions")
    .update({ status: "expired", billing_key: null })
    .eq("id", sub.id);
  await admin
    .from("restaurants")
    .update({ plan: "free" })
    .eq("id", sub.restaurant_id);
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("Authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const results = {
    renewed: 0,
    pastDue: 0,
    expired: 0,
    failed: 0,
    reminded: 0,
    reconciled: 0,
  };

  // 0. D-7 갱신 예정 알림
  const reminderFrom = new Date(now.getTime() + 6 * DAY_MS).toISOString();
  const reminderTo = new Date(now.getTime() + 7 * DAY_MS).toISOString();
  const { data: upcoming } = await admin
    .from("subscriptions")
    .select(
      "id, restaurant_id, plan, status, billing_key, amount, current_period_end, restaurants(name, owner_id)",
    )
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

  // 1. 해지된 구독 중 기간 만료 → free 다운그레이드
  const { data: cancelled } = await admin
    .from("subscriptions")
    .select(
      "id, restaurant_id, plan, status, billing_key, amount, current_period_end, restaurants(name, owner_id)",
    )
    .eq("status", "cancelled")
    .lt("current_period_end", nowIso)
    .returns<SubRow[]>();

  for (const sub of cancelled ?? []) {
    await expireSubscription(admin, sub);
    results.expired++;
  }

  // 2. 기간 만료된 active/past_due → 재결제 (실패 시 past_due, 유예 초과 시 강등)
  const { data: due } = await admin
    .from("subscriptions")
    .select(
      "id, restaurant_id, plan, status, billing_key, amount, current_period_end, restaurants(name, owner_id)",
    )
    .in("status", ["active", "past_due"])
    .lt("current_period_end", nowIso)
    .returns<SubRow[]>();

  const todayKey = nowIso.slice(0, 10).replace(/-/g, "");

  for (const sub of due ?? []) {
    const periodEndMs = sub.current_period_end
      ? new Date(sub.current_period_end).getTime()
      : 0;
    const graceOver = now.getTime() > periodEndMs + GRACE_DAYS * DAY_MS;

    if (!sub.billing_key) {
      /* 갱신 수단 없음 (대사 복구 구독 등) — 유예만 주고 강등 */
      if (graceOver) {
        await expireSubscription(admin, sub);
        results.expired++;
      } else if (sub.status === "active") {
        await admin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("id", sub.id);
        results.pastDue++;
      }
      continue;
    }

    const plan = sub.plan as "basic" | "premium";
    const amount = PLAN_PRICES[plan];
    /* 구독+날짜 단위 결정적 orderId — 하루 1회 시도, cron 중복 실행에도 안전 */
    const orderId = `renew-${sub.id.replace(/-/g, "")}-${todayKey}`;

    const { data: pendingRow } = await admin
      .from("payment_history")
      .insert({
        order_id: orderId,
        subscription_id: sub.id,
        restaurant_id: sub.restaurant_id,
        amount,
        status: "pending",
      })
      .select("id")
      .maybeSingle();
    /* 유니크 충돌 = 오늘 이미 시도됨 (동시 실행 등) */
    if (!pendingRow) continue;

    try {
      const payment = await chargeBillingKey({
        billingKey: sub.billing_key,
        customerKey: sub.restaurant_id,
        amount,
        orderId,
        orderName: `KBite ${plan === "basic" ? "베이직" : "프리미엄"} 플랜 갱신`,
        customerName: sub.restaurants?.name,
      });

      /* 주기는 이전 만료일에 이어붙임 (드리프트 방지).
         한 달 이상 밀렸으면 오늘부터 재시작 (누락분 소급 청구 금지) */
      let periodStart = sub.current_period_end
        ? new Date(sub.current_period_end)
        : new Date(now);
      let periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      if (periodEnd <= now) {
        periodStart = new Date(now);
        periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      await admin
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq("id", sub.id);

      await admin
        .from("payment_history")
        .update({
          status: "success",
          payment_key: payment.paymentKey,
          paid_at: new Date().toISOString(),
        })
        .eq("id", pendingRow.id);

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

      await admin
        .from("payment_history")
        .update({ status: "failed", failure_reason })
        .eq("id", pendingRow.id);

      if (graceOver) {
        await expireSubscription(admin, sub);
        results.failed++;
      } else {
        await admin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("id", sub.id);
        results.pastDue++;
      }
    }
  }

  // 3. 오래된 pending 결제 대사 — 과금 후 크래시로 기록이 끊긴 건 복구
  const staleIso = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  const { data: pendings } = await admin
    .from("payment_history")
    .select("id, order_id, restaurant_id, subscription_id, amount")
    .eq("status", "pending")
    .lt("created_at", staleIso)
    .not("order_id", "is", null)
    .limit(50);

  for (const p of pendings ?? []) {
    try {
      const payment = await getPaymentByOrderId(p.order_id as string);

      if (payment?.status === "DONE") {
        await admin
          .from("payment_history")
          .update({
            status: "success",
            payment_key: payment.paymentKey,
            paid_at: new Date().toISOString(),
          })
          .eq("id", p.id);

        const periodStart = new Date(now);
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        if (p.subscription_id) {
          /* 갱신 과금 후 주기 갱신 전에 죽은 경우 — 주기를 이어준다 */
          await admin
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: periodStart.toISOString(),
              current_period_end: periodEnd.toISOString(),
            })
            .eq("id", p.subscription_id);
        } else {
          /* 첫 결제 과금 후 구독 생성 전에 죽은 경우 — 구독 복구
             (빌링키는 유실됐으므로 null — 다음 갱신 주기에 재등록 유도) */
          const plan =
            p.amount >= PLAN_PRICES.premium ? "premium" : "basic";
          const { data: sub } = await admin
            .from("subscriptions")
            .insert({
              restaurant_id: p.restaurant_id,
              plan,
              status: "active",
              billing_key: null,
              amount: p.amount,
              current_period_start: periodStart.toISOString(),
              current_period_end: periodEnd.toISOString(),
            })
            .select("id")
            .maybeSingle();
          if (sub) {
            await admin
              .from("payment_history")
              .update({ subscription_id: sub.id })
              .eq("id", p.id);
            await admin
              .from("restaurants")
              .update({ plan })
              .eq("id", p.restaurant_id);
          }
        }
        results.reconciled++;
      } else if (
        !payment ||
        ["CANCELED", "ABORTED", "EXPIRED"].includes(payment.status)
      ) {
        await admin
          .from("payment_history")
          .update({
            status: "failed",
            failure_reason: `대사: 미완료 주문 (${payment?.status ?? "미존재"})`,
          })
          .eq("id", p.id);
      }
      /* IN_PROGRESS 등 진행 중 상태는 다음 실행에서 재확인 */
    } catch {
      /* Toss 조회 실패 — 다음 실행에서 재시도 */
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
