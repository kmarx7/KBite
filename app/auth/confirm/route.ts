import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

/**
 * Supabase 이메일 링크 착지점 (비밀번호 재설정·이메일 확인).
 * token_hash(커스텀 템플릿)와 code(기본 템플릿 PKCE) 두 형식 모두 처리.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/partner";

  /* open redirect 방지 — 내부 절대 경로만 허용 */
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/partner";

  const supabase = await createClient();

  if (tokenHash && rawType && OTP_TYPES.includes(rawType as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: rawType as EmailOtpType,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
  }

  return NextResponse.redirect(
    new URL("/partner/login?error=resetExpired", url.origin),
  );
}
