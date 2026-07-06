"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/ratelimit";
import {
  sendReservationRequestToOwner,
  sendReservationResultToGuest,
} from "@/lib/email";

export interface ReservationResult {
  ok: boolean;
  /** i18n 키 (detail 네임스페이스) */
  error?: string;
}

const MAX_DAYS_AHEAD = 30;

/** KST 기준 오늘 (예약 날짜 범위 검증용) */
function kstToday(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const createSchema = z.object({
  restaurantId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  partySize: z.coerce.number().int().min(1).max(20),
  note: z.string().trim().max(500).optional(),
});

export async function createReservation(
  formData: FormData,
): Promise<ReservationResult> {
  const rl = await checkRateLimit("reserve");
  if (!rl.ok) return { ok: false, error: "reserveError" };

  const parsed = createSchema.safeParse({
    restaurantId: String(formData.get("restaurantId") ?? ""),
    date: String(formData.get("date") ?? ""),
    time: String(formData.get("time") ?? ""),
    partySize: formData.get("partySize"),
    note: String(formData.get("note") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { ok: false, error: "reserveError" };

  /* 날짜 범위: KST 오늘 ~ +30일 */
  const today = kstToday();
  const max = new Date(Date.now() + (MAX_DAYS_AHEAD + 1) * 86400000)
    .toISOString()
    .slice(0, 10);
  if (parsed.data.date < today || parsed.data.date > max) {
    return { ok: false, error: "reserveError" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "loginRequired" };

  /* 승인된 식당 + 사장님 연락 이메일 확인 */
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, owner_email")
    .eq("id", parsed.data.restaurantId)
    .eq("status", "approved")
    .maybeSingle();
  if (!restaurant) return { ok: false, error: "reserveError" };

  /* 본인 명의 insert — RLS reservations_insert_own 강제 */
  const { data: inserted, error: insertError } = await supabase
    .from("reservations")
    .insert({
      restaurant_id: parsed.data.restaurantId,
      user_id: user.id,
      reserved_date: parsed.data.date,
      reserved_time: parsed.data.time,
      party_size: parsed.data.partySize,
      note: parsed.data.note ?? null,
    })
    .select("id")
    .single();
  if (insertError || !inserted) return { ok: false, error: "reserveError" };

  /* 사장님 이메일 — 응답 토큰은 손님에게 비공개(컬럼 GRANT 제외)라 admin으로 조회 */
  if (restaurant.owner_email) {
    try {
      const admin = createAdminClient();
      const { data: row } = await admin
        .from("reservations")
        .select("action_token")
        .eq("id", inserted.id)
        .single();

      if (row?.action_token) {
        const h = await headers();
        const origin =
          h.get("origin") ??
          process.env.NEXT_PUBLIC_APP_URL ??
          "https://kbite.vercel.app";
        const base = `${origin}/api/reservations/respond?id=${inserted.id}&token=${row.action_token}`;

        await sendReservationRequestToOwner({
          to: restaurant.owner_email as string,
          info: {
            restaurantName: restaurant.name as string,
            date: parsed.data.date,
            time: parsed.data.time,
            partySize: parsed.data.partySize,
            note: parsed.data.note,
            guestEmail: user.email,
          },
          confirmUrl: `${base}&action=confirm`,
          declineUrl: `${base}&action=decline`,
        });
      }
    } catch {
      /* 이메일 실패해도 요청은 생성됨 — 대시보드에서 응답 가능 */
    }
  }

  return { ok: true };
}

/* ───────────── 사장님 응답 (파트너 대시보드) ───────────── */

const respondSchema = z.object({
  reservationId: z.string().uuid(),
  action: z.enum(["confirm", "decline"]),
});

export async function respondReservation(
  reservationId: string,
  action: string,
): Promise<ReservationResult> {
  const parsed = respondSchema.safeParse({ reservationId, action });
  if (!parsed.success) return { ok: false, error: "reserveError" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "loginRequired" };

  /* RLS reservations_owner_update — 본인 식당 예약만, pending에서만 전이 */
  const status = parsed.data.action === "confirm" ? "confirmed" : "declined";
  const { data: updated } = await supabase
    .from("reservations")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", parsed.data.reservationId)
    .eq("status", "pending")
    .select("id, restaurant_id, user_id, reserved_date, reserved_time, party_size")
    .maybeSingle();
  if (!updated) return { ok: false, error: "reserveError" };

  /* 손님에게 결과 통지 */
  try {
    const admin = createAdminClient();
    const [{ data: guest }, { data: restaurant }] = await Promise.all([
      admin.auth.admin.getUserById(updated.user_id as string),
      admin
        .from("restaurants")
        .select("name")
        .eq("id", updated.restaurant_id as string)
        .single(),
    ]);
    if (guest?.user?.email) {
      await sendReservationResultToGuest({
        to: guest.user.email,
        restaurantName: (restaurant?.name as string) ?? "KBite",
        date: updated.reserved_date as string,
        time: (updated.reserved_time as string).slice(0, 5),
        partySize: updated.party_size as number,
        confirmed: status === "confirmed",
      });
    }
  } catch {
    /* 통지 실패는 응답 처리를 막지 않음 */
  }

  revalidatePath(`/partner/restaurant/${updated.restaurant_id}`);
  return { ok: true };
}
