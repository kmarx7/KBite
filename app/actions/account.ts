"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { LOCALE_COOKIE, LOCALES } from "@/lib/i18n/config";

export interface AccountResult {
  ok: boolean;
  /** i18n 키 (auth 네임스페이스) */
  error?: string;
  needsEmailConfirm?: boolean;
}

const credentialsSchema = z.object({
  email: z.string().trim().email("invalidEmail").max(254).toLowerCase(),
  password: z.string().min(8, "passwordMin").max(72),
});

/** 세션이 있는 사용자의 프로필 행 보장 — 없으면 언어 설정과 함께 생성.
    OAuth 착지(/auth/confirm)에서도 호출된다 */
export async function ensureProfile(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value ?? "";
  const locale = (LOCALES as readonly string[]).includes(raw) ? raw : "en";

  /* RLS profiles_insert_own — 본인 행만. 이미 있으면 무시 */
  await supabase
    .from("profiles")
    .upsert(
      { id: user.id, preferred_language: locale },
      { onConflict: "id", ignoreDuplicates: true },
    );
}

export async function consumerSignUp(
  formData: FormData,
): Promise<AccountResult> {
  const parsed = credentialsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    /* 상세 사유 미노출 (계정 열거 방지) */
    return { ok: false, error: "signupFailed" };
  }
  if (data.session) await ensureProfile();
  return { ok: true, needsEmailConfirm: !data.session };
}

export async function consumerLogin(
  formData: FormData,
): Promise<AccountResult> {
  const parsed = credentialsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "loginFailed" };
  }
  await ensureProfile();
  return { ok: true };
}

export async function consumerLogout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function consumerRequestPasswordReset(
  formData: FormData,
): Promise<AccountResult> {
  const parsed = z
    .string()
    .trim()
    .email()
    .max(254)
    .safeParse(String(formData.get("email") ?? ""));
  if (!parsed.success) return { ok: false, error: "invalidEmail" };

  const h = await headers();
  const origin =
    h.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://kbite.vercel.app";

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}/auth/confirm?next=/partner/reset`,
  });
  /* 존재 여부 무관 동일 응답 (계정 열거 방지) */
  return { ok: true };
}

/* ───────────── 찜 동기화 ───────────── */

const savedIdsSchema = z.array(z.string().uuid()).max(500);

/**
 * 로그인 직후 1회: 로컬 찜과 서버 찜을 합집합으로 병합.
 * 반환값이 null이면 비로그인 — 로컬만 사용.
 */
export async function mergeSavedRestaurants(
  localIds: unknown,
): Promise<{ ids: string[] } | null> {
  const parsed = savedIdsSchema.safeParse(localIds);
  if (!parsed.success) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await ensureProfile();
  const { data: profile } = await supabase
    .from("profiles")
    .select("saved_restaurants")
    .eq("id", user.id)
    .maybeSingle();

  const server: string[] = profile?.saved_restaurants ?? [];
  const merged = [...new Set([...server, ...parsed.data])];

  await supabase
    .from("profiles")
    .update({ saved_restaurants: merged })
    .eq("id", user.id);

  return { ids: merged };
}

/** 찜 토글 후 서버 반영 — 비로그인이면 조용히 무시 */
export async function setSavedRestaurants(ids: unknown): Promise<void> {
  const parsed = savedIdsSchema.safeParse(ids);
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ saved_restaurants: parsed.data })
    .eq("id", user.id);
}
