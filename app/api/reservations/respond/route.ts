import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReservationResultToGuest } from "@/lib/email";

/**
 * 사장님 이메일의 수락/거절 링크 착지점 — 로그인 불필요.
 * 예약별 비밀 토큰(action_token)으로 인증하며 pending에서만 1회 전이 (재클릭은 안내만).
 */

function page(title: string, body: string, color: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html lang="ko"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <title>KBite</title></head>
     <body style="font-family:sans-serif;background:#FFFAF5;display:flex;min-height:100dvh;align-items:center;justify-content:center;margin:0;">
       <div style="text-align:center;padding:24px;">
         <h1 style="color:${color};font-size:22px;margin-bottom:8px;">${title}</h1>
         <p style="color:#8A6040;font-size:14px;">${body}</p>
       </div>
     </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const token = url.searchParams.get("token") ?? "";
  const action = url.searchParams.get("action") ?? "";

  if (
    !/^[0-9a-f-]{36}$/.test(id) ||
    !/^[0-9a-f-]{36}$/.test(token) ||
    !["confirm", "decline"].includes(action)
  ) {
    return page("잘못된 요청", "링크가 올바르지 않습니다.", "#B91C1C");
  }

  const admin = createAdminClient();
  const { data: r } = await admin
    .from("reservations")
    .select(
      "id, action_token, status, restaurant_id, user_id, reserved_date, reserved_time, party_size",
    )
    .eq("id", id)
    .maybeSingle();

  if (!r || !safeEqual(String(r.action_token), token)) {
    return page("잘못된 요청", "링크가 올바르지 않습니다.", "#B91C1C");
  }

  if (r.status !== "pending") {
    return page(
      "이미 처리된 요청입니다",
      `현재 상태: ${r.status === "confirmed" ? "수락됨" : r.status === "declined" ? "거절됨" : "취소됨"}`,
      "#8A6040",
    );
  }

  const status = action === "confirm" ? "confirmed" : "declined";
  const { error } = await admin
    .from("reservations")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");
  if (error) {
    return page("처리 실패", "잠시 후 다시 시도해 주세요.", "#B91C1C");
  }

  /* 손님에게 결과 통지 */
  try {
    const [{ data: guest }, { data: restaurant }] = await Promise.all([
      admin.auth.admin.getUserById(r.user_id as string),
      admin
        .from("restaurants")
        .select("name")
        .eq("id", r.restaurant_id as string)
        .single(),
    ]);
    if (guest?.user?.email) {
      await sendReservationResultToGuest({
        to: guest.user.email,
        restaurantName: (restaurant?.name as string) ?? "KBite",
        date: r.reserved_date as string,
        time: (r.reserved_time as string).slice(0, 5),
        partySize: r.party_size as number,
        confirmed: status === "confirmed",
      });
    }
  } catch {}

  return status === "confirmed"
    ? page(
        "예약을 수락했습니다 ✓",
        `${r.reserved_date} ${(r.reserved_time as string).slice(0, 5)} · ${r.party_size}명 — 손님에게 확정 메일을 보냈습니다.`,
        "#15803D",
      )
    : page(
        "예약을 거절했습니다",
        "손님에게 안내 메일을 보냈습니다.",
        "#8A6040",
      );
}
